'use strict';

import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { generate, type Profile } from '../../scripts/gen-perf-fixtures.js';
import { dirBytes, formatBytes, formatMs, measure, writeReport, type MeasureResult } from './utils/measure.js';

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
// The default type list mirrors `test/utils/constants.ts#METADATA_UNDER_TEST` -
// the types whose unique-id elements are configured in src/metadata/uniqueIdElements.ts
// well enough that decompose+recompose is faithful.
//
// Other types the generator produces (app, globalValueSet) currently lack
// per-type unique-id coverage for some of their child elements (e.g. CustomApplication's
// actionOverrides has no <fullName>/<name>), so the SHA-256 fallback collapses
// many distinct elements into one shard. They are NOT in the default list, but
// you can include them via PERF_TYPES to time the (lossy) round-trip on the
// shapes you intend to support next.
const PROFILE = (process.env.PERF_PROFILE ?? 'large') as Profile;
const FORMATS = (process.env.PERF_FORMATS ?? 'xml,json,json5,yaml')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const DEFAULT_METADATA_TYPES = ['permissionset', 'mutingpermissionset', 'profile', 'flow', 'workflow', 'labels', 'bot'];
const METADATA_TYPES = (process.env.PERF_TYPES ?? DEFAULT_METADATA_TYPES.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const FIXTURE_ROOT = resolve('perf-fixtures');

// We populate the fixture directory once for the whole suite. It is gitignored
// and lives outside the test session so multiple format tests can reuse it
// without paying the generation cost more than once.
let fixtureBytes = 0;
let fixtureFiles = 0;

describe(`perf: decompose/recompose round-trip (profile=${PROFILE})`, () => {
  beforeAll(async () => {
    const result = await generate({ outDir: FIXTURE_ROOT, profile: PROFILE, cleanFirst: true });
    fixtureBytes = result.totalBytes;
    fixtureFiles = result.files.length;
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
        });

        printSummary(format, fixtureBytes, samples, decomposedSnapshot, reportFile);
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
  reportFile: string,
): void {
  const totalElapsed = samples.reduce((s, x) => s + x.elapsedMs, 0);
  const peakRssDelta = samples.reduce((m, x) => Math.max(m, x.rssDeltaBytes), 0);
  const lines = [
    '',
    `[perf] format=${format.padEnd(5)} input=${formatBytes(inputBytes)} ` +
      `decomposed=${decomposedSnapshot.files} files / ${formatBytes(decomposedSnapshot.bytes)}`,
  ];
  for (const s of samples) {
    lines.push(
      `[perf]   ${s.label.padEnd(28)} ${formatMs(s.elapsedMs).padStart(10)}   ` +
        `rssΔ ${formatBytes(s.rssDeltaBytes).padStart(10)}`,
    );
  }
  lines.push(`[perf]   total=${formatMs(totalElapsed)}  peak rssΔ=${formatBytes(peakRssDelta)}  report=${reportFile}`);
  // eslint-disable-next-line no-console
  console.log(lines.join('\n'));
}
