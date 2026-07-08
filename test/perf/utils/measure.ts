'use strict';

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

export type MeasureResult = {
  label: string;
  elapsedMs: number;
  // Primary memory metric: JS heap only, sampled immediately after a forced GC on both
  // sides of the measured block. RSS (below) is whole-process resident memory -- it
  // includes native/Rust allocations across the napi boundary, tokio thread stacks, and
  // page-cache noise, none of which is attributable to the measured operation, and
  // without a forced GC it's mostly measuring V8's collection timing luck rather than
  // actual memory cost. Untouched code paths were observed swinging 10-90x run to run
  // under the old RSS-based metric; heapUsed does not have that problem.
  heapUsedBeforeBytes: number;
  heapUsedAfterBytes: number;
  heapUsedDeltaBytes: number;
  // Diagnostic only, not fed to the benchmark dashboard (see scripts/perf-to-benchmark.mjs).
  // Kept for local investigation; expect it to be noisier than heapUsedDeltaBytes.
  rssBeforeBytes: number;
  rssAfterBytes: number;
  rssDeltaBytes: number;
};

/**
 * Run an async block, capturing wall time and a memory delta for it.
 *
 * Requires `global.gc` (run with `--expose-gc`; wired via vitest.perf.config.ts's fork
 * pool `execArgv`). Forcing a collection immediately before and after the block means
 * `heapUsed` reflects what the block actually retained, not whatever V8 hadn't gotten
 * around to collecting yet.
 */
export async function measure<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; sample: MeasureResult }> {
  if (typeof global.gc !== 'function') {
    throw new Error(
      'global.gc is not available. Run the perf suite with --expose-gc ' +
        '(vitest.perf.config.ts already sets this via poolOptions.forks.execArgv; ' +
        'if you see this, you are likely invoking vitest/node directly without that config).',
    );
  }

  global.gc();
  const memBefore = process.memoryUsage();
  const start = performance.now();
  const result = await fn();
  const elapsedMs = performance.now() - start;
  global.gc();
  const memAfter = process.memoryUsage();
  return {
    result,
    sample: {
      label,
      elapsedMs,
      heapUsedBeforeBytes: memBefore.heapUsed,
      heapUsedAfterBytes: memAfter.heapUsed,
      heapUsedDeltaBytes: memAfter.heapUsed - memBefore.heapUsed,
      rssBeforeBytes: memBefore.rss,
      rssAfterBytes: memAfter.rss,
      rssDeltaBytes: memAfter.rss - memBefore.rss,
    },
  };
}

export type MedianSample = {
  label: string;
  repeats: number;
  elapsedMedianMs: number;
  elapsedMinMs: number;
  elapsedMaxMs: number;
  heapUsedMedianBytes: number;
};

/** Median of a non-empty array of numbers (average of the two middle values on an even count). */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Reduce repeated `measure()` results for the same operation into one median-based summary.
 *
 * A single sample on a shared CI runner routinely swings 15-20% run to run for identical
 * code, which makes a single elapsedMs/heapUsedDeltaBytes reading useless for telling a real
 * regression apart from runner noise. The median of several independent repeats is far more
 * stable than any one of them, since it takes an outlier sample (a GC pause, a noisy
 * neighbor, a scheduler hiccup) landing on *most* of the repeats to move it -- one bad run
 * among several good ones just gets outvoted instead of being the only data point.
 */
export function summarizeMedian(label: string, results: readonly MeasureResult[]): MedianSample {
  const elapsed = results.map((r) => r.elapsedMs);
  const heapUsed = results.map((r) => r.heapUsedDeltaBytes);
  return {
    label,
    repeats: results.length,
    elapsedMedianMs: median(elapsed),
    elapsedMinMs: Math.min(...elapsed),
    elapsedMaxMs: Math.max(...elapsed),
    heapUsedMedianBytes: median(heapUsed),
  };
}

/** Recursively sum byte sizes of all files under a directory. */
export async function dirBytes(dir: string): Promise<{ files: number; bytes: number }> {
  // Walk the tree breadth-first and stat in parallel batches. The naive
  // sequential walk hits eslint's no-await-in-loop rule and is also slower on
  // large fixture trees because every readdir/stat blocks the next.
  let files = 0;
  let bytes = 0;
  let queue: string[] = [dir];
  while (queue.length > 0) {
    const dirsThisLevel = queue;
    queue = [];
    // eslint-disable-next-line no-await-in-loop -- breadth-first walk needs to drain each level before the next
    const entriesPerDir = await Promise.all(
      dirsThisLevel.map(async (d) => ({ d, entries: await readdir(d, { withFileTypes: true }) })),
    );
    for (const { d, entries } of entriesPerDir) {
      for (const entry of entries) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) queue.push(full);
        else if (entry.isFile()) files += 1;
      }
    }
    const allFiles = entriesPerDir.flatMap(({ d, entries }) =>
      entries.filter((e) => e.isFile()).map((e) => join(d, e.name)),
    );
    // eslint-disable-next-line no-await-in-loop -- size sum needs each level's stats before continuing
    const sizes = await Promise.all(allFiles.map(async (f) => (await stat(f)).size));
    bytes += sizes.reduce((a, b) => a + b, 0);
  }
  return { files, bytes };
}

export type PerfReport = {
  timestamp: string;
  node: string;
  platform: string;
  arch: string;
  profile: string;
  format: string;
  fixtureBytes: number;
  fixtureFiles: number;
  // Single-shot samples from the correctness round-trip (see decompose.perf.ts's main
  // test): useful for local debugging, but too noisy on a shared CI runner to trust as a
  // trend signal on their own. Not read by scripts/perf-to-benchmark.mjs.
  samples: MeasureResult[];
  // Median-of-N samples from a dedicated, correctness-agnostic timing loop (see
  // decompose.perf.ts's "measures timing" test). This is what feeds the gh-pages
  // dashboard / PR comparison comments.
  medianSamples: MedianSample[];
};

const RESULTS_DIR = resolve(process.cwd(), 'perf-results');

export async function writeReport(report: PerfReport): Promise<string> {
  await mkdir(RESULTS_DIR, { recursive: true });
  const safeStamp = report.timestamp.replace(/[:.]/g, '-');
  const file = join(RESULTS_DIR, `${safeStamp}-${report.profile}-${report.format}.json`);
  await writeFile(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
  return file;
}

/** Pretty-print a numeric byte count, e.g. 12345 -> "12.06 KB". Handles negatives for memory deltas. */
export function formatBytes(bytes: number): string {
  const sign = bytes < 0 ? '-' : '';
  const abs = Math.abs(bytes);
  if (abs < 1024) return `${sign}${abs} B`;
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(2)} KB`;
  return `${sign}${(abs / 1024 / 1024).toFixed(2)} MB`;
}

/** Pretty-print a millisecond duration, e.g. 75123 -> "75.1 s". */
export function formatMs(ms: number): string {
  const ONE_SECOND_MS = 1000;
  const ONE_MINUTE_MS = 60_000;
  if (ms < ONE_SECOND_MS) return `${ms.toFixed(1)} ms`;
  if (ms < ONE_MINUTE_MS) return `${(ms / ONE_SECOND_MS).toFixed(2)} s`;
  const m = Math.floor(ms / ONE_MINUTE_MS);
  const s = ((ms % ONE_MINUTE_MS) / ONE_SECOND_MS).toFixed(1);
  return `${m}m ${s}s`;
}
