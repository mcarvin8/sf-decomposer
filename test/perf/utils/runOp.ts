'use strict';

// Child-process entry point for the perf suite's timing loop (see
// test/perf/utils/childMeasure.ts, which spawns this file).
//
// Runs exactly ONE decompose or recompose against process.cwd(), importing the
// implementation from the source tree passed as argv[2] -- so the same harness
// can time the PR head's src/ and the PR base ref's src/ (a separate git
// worktree with its own node_modules, hence its own config-disassembler build)
// against identical fixtures.
//
// Why a fresh process per operation: the work that matters happens in Rust
// (config-disassembler via napi), and those allocations never appear in V8's
// heapUsed. process.resourceUsage().maxRSS does see them, but it is a
// per-process high-water mark that never goes down, so it is only meaningful
// when the process has done nothing else heavy beforehand.
//
// Usage: node --expose-gc --import <tsx loader> runOp.ts <srcRoot> <decompose|recompose> <optionsJson>
// Output: one line `__PERF_RESULT__{json}` on stdout (see OpResult in childMeasure.ts).

import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

const [, , srcRoot, op, optionsJson] = process.argv;
if (!srcRoot || (op !== 'decompose' && op !== 'recompose') || !optionsJson) {
  throw new Error('usage: runOp.ts <srcRoot> <decompose|recompose> <optionsJson>');
}

const modulePath = op === 'decompose' ? 'src/core/decomposeMetadataTypes.ts' : 'src/core/recomposeMetadataTypes.ts';
const exportName = op === 'decompose' ? 'decomposeMetadataTypes' : 'recomposeMetadataTypes';
const mod = (await import(pathToFileURL(resolve(srcRoot, modulePath)).href)) as Record<
  string,
  (options: Record<string, unknown>) => Promise<unknown>
>;
const fn = mod[exportName];
if (typeof fn !== 'function') {
  throw new Error(`${modulePath} under ${srcRoot} does not export ${exportName}`);
}

const options = { ...(JSON.parse(optionsJson) as Record<string, unknown>), log: (): void => {} };

// Settle module-load garbage so rssBefore is the process's steady pre-work footprint.
global.gc?.();
const rssBeforeBytes = process.memoryUsage().rss;
const start = performance.now();
await fn(options);
const elapsedMs = performance.now() - start;
// maxRSS is reported in kilobytes on every platform Node supports.
const peakRssBytes = process.resourceUsage().maxRSS * 1024;

process.stdout.write(
  `\n__PERF_RESULT__${JSON.stringify({
    elapsedMs,
    rssBeforeBytes,
    peakRssBytes,
    // Clamped at 0: if module loading briefly peaked above where the operation
    // ever got, the operation added nothing measurable on top of it.
    peakRssDeltaBytes: Math.max(0, peakRssBytes - rssBeforeBytes),
  })}\n`,
);
