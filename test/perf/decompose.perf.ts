'use strict';

import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { generate, type Profile } from '../../scripts/gen-perf-fixtures.js';
import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import {
  dirBytes,
  formatBytes,
  formatMs,
  type MeasureResult,
  type MedianSample,
  measure,
  summarizeMedian,
  writeReport,
} from './utils/measure.js';

// Performance tests are intentionally heavy and DO NOT run as part of `npm test`.
// They:
//   1. generate large synthetic fixtures (deterministic, no proprietary data)
//   2. measure decompose + recompose wall-clock time and memory deltas
//   3. perform a second round-trip and assert idempotence (byte-stable output)
//   4. emit timing artifacts to perf-results/<stamp>-<profile>-<format>.json
//
// Env vars:
//   PERF_PROFILE=small|medium|large|xlarge   (default: large)
//   PERF_FORMATS=xml,json,json5,yaml         (default: all four)
//   PERF_TYPES=permissionset,flow,...        (default: types known to round-trip)
//
// The default type list covers the types we generate fixtures for. Since
// config-disassembler 1.1.2 (Rust crate 0.4.3), the SHA-256 fallback hashes
// the full outer element rather than the first text-leaf child, so types
// without per-type unique-id coverage - notably CustomApplication's
// actionOverrides / profileActionOverrides - now round-trip faithfully
// (one shard per distinct sibling) and produce meaningful perf signal.
// Treat unset OR empty-string env vars as "use default". GitHub Actions
// workflow_dispatch inputs come through as the empty string when not
// provided, which `??` does not catch.
function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw || raw.trim() === '') return fallback;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
function envString<T extends string>(name: string, fallback: T): T {
  const raw = process.env[name];
  return !raw || raw.trim() === '' ? fallback : (raw as T);
}
function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const PROFILE = envString<Profile>('PERF_PROFILE', 'large');
const FORMATS = envList('PERF_FORMATS', ['xml', 'json', 'json5', 'yaml']);
// `manyfiles` only generates permission sets (see scripts/gen-perf-fixtures.ts) --
// many small files in one directory, to exercise config-disassembler's directory-mode
// concurrent fan-out, rather than the single-huge-file shape the other profiles use.
const DEFAULT_METADATA_TYPES =
  PROFILE === 'manyfiles'
    ? ['permissionset']
    : [
        'permissionset',
        'mutingpermissionset',
        'profile',
        'flow',
        'workflow',
        'labels',
        'bot',
        'app',
        'globalValueSet',
        // entitlementProcess intentionally exercises path-segment sanitization: the
        // generator plants `/` and `:` in milestoneName values so a regression of
        // the config-disassembler 0.5.0 sanitization fix would shrink the
        // recomposed file below the RETENTION_THRESHOLD guard below.
        'entitlementProcess',
      ];
const METADATA_TYPES = envList('PERF_TYPES', DEFAULT_METADATA_TYPES);
// Number of independent repeats used to compute the median timing/memory sample that
// actually gets published to the dashboard (see the "measures timing" test below and
// scripts/perf-to-benchmark.mjs). A single sample on a shared CI runner routinely swings
// 15-20% for identical code; the median of several repeats is far more resistant to any
// one of them landing on a GC pause / noisy neighbor / scheduler hiccup.
const PERF_REPEATS = envNumber('PERF_REPEATS', 5);

const FIXTURE_ROOT = resolve('perf-fixtures');

// We populate the fixture directory once for the whole suite. It is gitignored
// and lives outside the test session so multiple format tests can reuse it
// without paying the generation cost more than once.
let fixtureBytes = 0;
let fixtureFiles = 0;
// Per-file byte sizes of the generator output, keyed by path relative to
// FIXTURE_ROOT (e.g. "force-app/main/default/applications/Mega.app-meta.xml").
// Used to guard against round-trip data loss: pass-1 recomposed bytes must
// stay within RETENTION_THRESHOLD of the original. Anything below means the
// decomposer collapsed distinct elements into one shard (the
// `actionOverrides` hash collision bug fixed in config-disassembler 0.4.3).
const fixtureFileBytes = new Map<string, number>();
const RETENTION_THRESHOLD = 0.99;

describe(`perf: decompose/recompose round-trip (profile=${PROFILE})`, () => {
  beforeAll(async () => {
    const result = await generate({ outDir: FIXTURE_ROOT, profile: PROFILE, cleanFirst: true });
    fixtureBytes = result.totalBytes;
    fixtureFiles = result.files.length;
    fixtureFileBytes.clear();
    for (const f of result.files) {
      // generator emits POSIX-style relative paths already (e.g.
      // "force-app/main/default/applications/Mega.app-meta.xml"), matching
      // what snapshotFiles() produces below.
      fixtureFileBytes.set(f.relPath, f.bytes);
    }
    // eslint-disable-next-line no-console
    console.log(
      `\n[perf] generated ${fixtureFiles} fixture files (${formatBytes(fixtureBytes)}) using profile "${PROFILE}".\n` +
        `[perf] testing types: ${METADATA_TYPES.join(', ')}\n` +
        `[perf] testing formats: ${FORMATS.join(', ')}`,
    );
  });

  for (const format of FORMATS) {
    describe(`format=${format}`, () => {
      let workDir: string;
      let originalCwd: string;
      const samples: MeasureResult[] = [];

      beforeEach(async () => {
        originalCwd = process.cwd();
        workDir = await mkdtemp(join(tmpdir(), `sf-decomposer-perf-${format}-`));
        // copy generated fixtures into a clean working dir so we never mutate the source
        await cp(FIXTURE_ROOT, workDir, { recursive: true, force: true });
        // generated sfdx-project.json already points at force-app
        process.chdir(workDir);
      });

      afterEach(async () => {
        process.chdir(originalCwd);
        await rm(workDir, { recursive: true, force: true });
      });

      it(`round-trips and is idempotent in ${format.toUpperCase()}`, async () => {
        // Swallow CLI chatter; perf samples are the artifact we care about.
        const log = (): void => {};

        // ---- pass 1: decompose then recompose -------------------------------
        const { sample: decompose1 } = await measure(`${format}.decompose.pass1`, async () => {
          await decomposeMetadataTypes({
            metadataTypes: METADATA_TYPES,
            prepurge: true,
            postpurge: true,
            format,
            strategy: 'unique-id',
            decomposeNestedPerms: false,
            log,
          });
        });
        samples.push(decompose1);

        const decomposedSnapshot = await dirBytes(join(workDir, 'force-app'));

        const { sample: recompose1 } = await measure(`${format}.recompose.pass1`, async () => {
          await recomposeMetadataTypes({
            metadataTypes: METADATA_TYPES,
            postpurge: true,
            log,
          });
        });
        samples.push(recompose1);

        // Capture the recomposed XML so we can compare to a second round-trip.
        const firstRoundtrip = await snapshotFiles(workDir);

        // ---- non-shrinkage guard ------------------------------------------
        // Each recomposed -meta.xml must retain at least RETENTION_THRESHOLD
        // of the original generator-emitted bytes for that file. This catches
        // mass element-collapse regressions (e.g. the actionOverrides hash
        // collision bug fixed in config-disassembler 0.4.3) that would still
        // pass the pass1 == pass2 idempotence check below since both passes
        // would produce the same shrunken output.
        //
        // We also collect every (path, original, recomposed, ratio) tuple so
        // the per-format summary can print the full distribution. The
        // RETENTION_THRESHOLD guard only fires below 0.99, but a regression
        // that nibbles a file from 100.00% down to 99.50% should still be
        // visible in PR logs before it crosses the floor.
        const retention: Array<{ path: string; original: number; recomposed: number; ratio: number }> = [];
        for (const [path, content] of firstRoundtrip) {
          const original = fixtureFileBytes.get(path);
          if (original === undefined) continue; // sfdx-project.json, generated files
          const recomposed = Buffer.byteLength(content, 'utf8');
          const ratio = recomposed / original;
          retention.push({ path, original, recomposed, ratio });
          expect(
            ratio,
            `data loss on round-trip for ${path}: ${recomposed}/${original} bytes (${(ratio * 100).toFixed(2)}%)`,
          ).toBeGreaterThanOrEqual(RETENTION_THRESHOLD);
        }

        // ---- pass 2: decompose then recompose (idempotence) ----------------
        const { sample: decompose2 } = await measure(`${format}.decompose.pass2`, async () => {
          await decomposeMetadataTypes({
            metadataTypes: METADATA_TYPES,
            prepurge: true,
            postpurge: true,
            format,
            strategy: 'unique-id',
            decomposeNestedPerms: false,
            log,
          });
        });
        samples.push(decompose2);

        const { sample: recompose2 } = await measure(`${format}.recompose.pass2`, async () => {
          await recomposeMetadataTypes({
            metadataTypes: METADATA_TYPES,
            postpurge: true,
            log,
          });
        });
        samples.push(recompose2);

        const secondRoundtrip = await snapshotFiles(workDir);

        // Pass 1 output may differ from the generator's raw bytes (sort order
        // is decided by the decomposer, not the generator). Pass 2 must match
        // pass 1 byte-for-byte; that's the contract this perf test enforces.
        expect(secondRoundtrip.size).toBe(firstRoundtrip.size);
        for (const [path, bytes] of firstRoundtrip) {
          const other = secondRoundtrip.get(path);
          expect(other, `missing on second round-trip: ${path}`).toBeDefined();
          expect(other, `byte drift on second round-trip: ${path}`).toBe(bytes);
        }

        // ---- write report --------------------------------------------------
        // medianSamples is intentionally empty here: this test measures a single pass1/pass2
        // pair for correctness (round-trip fidelity, idempotence), not a trustworthy timing
        // signal. The dedicated "measures timing" test below produces the median-of-N samples
        // that actually get published (see scripts/perf-to-benchmark.mjs, which merges every
        // report matching a (profile, format) pair rather than picking just one).
        const reportFile = await writeReport({
          timestamp: new Date().toISOString(),
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          profile: PROFILE,
          format,
          fixtureBytes,
          fixtureFiles,
          samples,
          medianSamples: [],
        });

        printSummary(format, fixtureBytes, samples, decomposedSnapshot, retention, reportFile);
      });

      it(`measures decompose/recompose timing over ${PERF_REPEATS} repeats in ${format.toUpperCase()}`, async () => {
        // Independent of the correctness test above: this test's only job is producing a
        // trustworthy timing/memory number, so it never checks round-trip fidelity and never
        // reuses a workDir across iterations. Each repeat gets its own pristine fixture copy --
        // decompose/recompose mutate the working tree (prepurge/postpurge), so reusing one
        // directory across repeats would measure a different operation on repeat 2..N than on
        // repeat 1 (an already-decomposed tree behaves differently than a pristine one).
        const log = (): void => {};
        const decomposeSamples: MeasureResult[] = [];
        const recomposeSamples: MeasureResult[] = [];

        for (let rep = 0; rep < PERF_REPEATS; rep++) {
          const repDir = await mkdtemp(join(tmpdir(), `sf-decomposer-perf-median-${format}-`));
          try {
            await cp(FIXTURE_ROOT, repDir, { recursive: true, force: true });
            process.chdir(repDir);

            const { sample: decomposeSample } = await measure(`${format}.decompose`, async () => {
              await decomposeMetadataTypes({
                metadataTypes: METADATA_TYPES,
                prepurge: true,
                postpurge: true,
                format,
                strategy: 'unique-id',
                decomposeNestedPerms: false,
                log,
              });
            });
            decomposeSamples.push(decomposeSample);

            // Recompose immediately after this same rep's decompose, so its precondition
            // (decomposed shards present, no parent -meta.xml) is naturally satisfied without
            // a separate untimed setup step.
            const { sample: recomposeSample } = await measure(`${format}.recompose`, async () => {
              await recomposeMetadataTypes({
                metadataTypes: METADATA_TYPES,
                postpurge: true,
                log,
              });
            });
            recomposeSamples.push(recomposeSample);
          } finally {
            process.chdir(originalCwd);
            // eslint-disable-next-line no-await-in-loop -- each repeat must clean up before the next one starts
            await rm(repDir, { recursive: true, force: true });
          }
        }

        const medianSamples: MedianSample[] = [
          summarizeMedian(`${format}.decompose`, decomposeSamples),
          summarizeMedian(`${format}.recompose`, recomposeSamples),
        ];

        const reportFile = await writeReport({
          timestamp: new Date().toISOString(),
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          profile: PROFILE,
          format,
          fixtureBytes,
          fixtureFiles,
          samples: [],
          medianSamples,
        });

        printMedianSummary(format, medianSamples, reportFile);
      });
    });
  }

  // Note: perf-fixtures/ is intentionally left in place after the suite so it
  // can be inspected or reused. The next `npm run test:perf` regenerates it
  // with cleanFirst: true.
});

async function snapshotFiles(root: string): Promise<Map<string, string>> {
  // Walk breadth-first so we can read files in parallel batches per level.
  // Sequential await-in-loop would be needlessly slow on a 30+MB tree and
  // also trips eslint's no-await-in-loop rule.
  const out = new Map<string, string>();
  let queue: string[] = [root];
  while (queue.length > 0) {
    const dirsThisLevel = queue;
    queue = [];
    // eslint-disable-next-line no-await-in-loop -- breadth-first walk drains a level before descending
    const entriesPerDir = await Promise.all(
      dirsThisLevel.map(async (d) => ({ d, entries: await readdir(d, { withFileTypes: true }) })),
    );
    const filesToRead: string[] = [];
    for (const { d, entries } of entriesPerDir) {
      for (const entry of entries) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) {
          queue.push(full);
          continue;
        }
        if (!entry.isFile()) continue;
        // Only snapshot the recomposed (parent) metadata files, not decomposed
        // shards. After recompose --postpurge there shouldn't be any shards
        // left, but be defensive in case a future change leaves them.
        const rel = full.substring(root.length + 1).replace(/\\/g, '/');
        if (rel.endsWith('-meta.xml') || rel === 'sfdx-project.json') {
          filesToRead.push(full);
        }
      }
    }
    // eslint-disable-next-line no-await-in-loop -- read every file at this level before descending
    const contents = await Promise.all(filesToRead.map(async (f) => ({ f, c: await readFile(f, 'utf8') })));
    for (const { f, c } of contents) {
      const rel = f.substring(root.length + 1).replace(/\\/g, '/');
      out.set(rel, c);
    }
  }
  return out;
}

function printSummary(
  format: string,
  inputBytes: number,
  samples: MeasureResult[],
  decomposedSnapshot: { files: number; bytes: number },
  retention: ReadonlyArray<{ path: string; original: number; recomposed: number; ratio: number }>,
  reportFile: string,
): void {
  const totalElapsed = samples.reduce((s, x) => s + x.elapsedMs, 0);
  const peakHeapUsedDelta = samples.reduce((m, x) => Math.max(m, x.heapUsedDeltaBytes), 0);
  const lines = [
    '',
    `[perf] format=${format.padEnd(5)} input=${formatBytes(inputBytes)} ` +
      `decomposed=${decomposedSnapshot.files} files / ${formatBytes(decomposedSnapshot.bytes)}`,
  ];
  for (const s of samples) {
    lines.push(
      `[perf]   ${s.label.padEnd(28)} ${formatMs(s.elapsedMs).padStart(10)}   ` +
        `heapΔ ${formatBytes(s.heapUsedDeltaBytes).padStart(10)}   ` +
        `(rssΔ ${formatBytes(s.rssDeltaBytes).padStart(10)})`,
    );
  }
  lines.push(
    `[perf]   total=${formatMs(totalElapsed)}  peak heapΔ=${formatBytes(peakHeapUsedDelta)}  report=${reportFile}`,
  );

  // Per-file retention breakdown. Sorted ascending so any file that's eaten
  // bytes shows at the top - that's where you look first when investigating
  // a regression that's still above the 0.99 floor but trending downward.
  if (retention.length > 0) {
    const sorted = [...retention].sort((a, b) => a.ratio - b.ratio);
    const minRatio = sorted[0].ratio;
    const maxRatio = sorted[sorted.length - 1].ratio;
    const meanRatio = sorted.reduce((s, x) => s + x.ratio, 0) / sorted.length;
    const pathPad = Math.min(
      60,
      sorted.reduce((m, r) => Math.max(m, r.path.length), 0),
    );
    lines.push(
      `[perf] retention (${format}): min=${formatPercent(minRatio)} ` +
        `mean=${formatPercent(meanRatio)} max=${formatPercent(maxRatio)} ` +
        `(threshold=${formatPercent(0.99)})`,
    );
    for (const r of sorted) {
      lines.push(
        `[perf]   ${r.path.padEnd(pathPad)}  ${formatPercent(r.ratio).padStart(7)}  ` +
          `(${r.recomposed.toLocaleString()} / ${r.original.toLocaleString()} bytes)`,
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log(lines.join('\n'));
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}

function printMedianSummary(format: string, medianSamples: MedianSample[], reportFile: string): void {
  const lines = ['', `[perf] median timing (format=${format}, ${medianSamples[0]?.repeats ?? 0} repeats)`];
  for (const s of medianSamples) {
    lines.push(
      `[perf]   ${s.label.padEnd(20)} median=${formatMs(s.elapsedMedianMs).padStart(10)}   ` +
        `range=[${formatMs(s.elapsedMinMs)}, ${formatMs(s.elapsedMaxMs)}]   ` +
        `heapΔ median=${formatBytes(s.heapUsedMedianBytes)}`,
    );
  }
  lines.push(`[perf]   report=${reportFile}`);

  // eslint-disable-next-line no-console
  console.log(lines.join('\n'));
}
