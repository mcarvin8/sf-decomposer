'use strict';

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

export type MeasureResult = {
  label: string;
  elapsedMs: number;
  rssBeforeBytes: number;
  rssAfterBytes: number;
  rssDeltaBytes: number;
  heapUsedBeforeBytes: number;
  heapUsedAfterBytes: number;
};

/** Run an async block, capturing wall time and process memory deltas. */
export async function measure<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; sample: MeasureResult }> {
  const memBefore = process.memoryUsage();
  const start = performance.now();
  const result = await fn();
  const elapsedMs = performance.now() - start;
  const memAfter = process.memoryUsage();
  return {
    result,
    sample: {
      label,
      elapsedMs,
      rssBeforeBytes: memBefore.rss,
      rssAfterBytes: memAfter.rss,
      rssDeltaBytes: memAfter.rss - memBefore.rss,
      heapUsedBeforeBytes: memBefore.heapUsed,
      heapUsedAfterBytes: memAfter.heapUsed,
    },
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
  samples: MeasureResult[];
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
