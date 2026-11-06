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

import { createRequire } from 'node:module';
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

// ---- crate vs wrapper split ---------------------------------------------------
// sf-decomposer reaches the Rust crate through exactly two napi methods. Wrap
// them on their prototypes (napi-rs leaves class methods writable) so every
// call made by the code under test is timed, without touching src/. Load the
// package with srcRoot's own resolution so a base-ref worktree patches *its*
// config-disassembler build, i.e. the same module instance its src/ imports.
//
// crateMs is the wall time during which at least one crate call was in flight
// -- not the sum of call durations, which would double-count calls that
// pLimit runs concurrently. The remainder (elapsed - crate) is time spent with
// no crate call running: TS file discovery, option resolution, label/bot/
// workflow handling, purge, and waiting between batches.
const CRATE_METHODS: ReadonlyArray<[className: string, method: string]> = [
  ['DisassembleXMLFileHandler', 'disassemble'],
  ['ReassembleXMLFileHandler', 'reassemble'],
];
const crate = createRequire(resolve(srcRoot, 'package.json'))('config-disassembler') as Record<
  string,
  { prototype: Record<string, unknown> } | undefined
>;
let inFlight = 0;
let busySince = 0;
let crateMs = 0;
let crateCalls = 0;
for (const [className, method] of CRATE_METHODS) {
  const proto = crate[className]?.prototype;
  const original = proto?.[method];
  if (!proto || typeof original !== 'function') {
    throw new Error(`config-disassembler under ${srcRoot} has no ${className}.prototype.${method}`);
  }
  proto[method] = async function timed(this: unknown, ...args: unknown[]): Promise<unknown> {
    crateCalls += 1;
    if (inFlight++ === 0) busySince = performance.now();
    try {
      return await (original as (...a: unknown[]) => unknown).apply(this, args);
    } finally {
      if (--inFlight === 0) crateMs += performance.now() - busySince;
    }
  };
}

// Settle module-load garbage so rssBefore is the process's steady pre-work footprint.
global.gc?.();
const rssBeforeBytes = process.memoryUsage().rss;
const usageBefore = process.resourceUsage();
const start = performance.now();
await fn(options);
const elapsedMs = performance.now() - start;
const usageAfter = process.resourceUsage();
// maxRSS is reported in kilobytes on every platform Node supports.
const peakRssBytes = usageAfter.maxRSS * 1024;
// User + system CPU time (reported in microseconds), summed across every
// thread in the process -- including config-disassembler's Rust worker
// threads. Far less sensitive to noisy neighbours than wall time, and
// cpuMs / elapsedMs is the operation's effective parallelism.
const cpuMs =
  (usageAfter.userCPUTime - usageBefore.userCPUTime + usageAfter.systemCPUTime - usageBefore.systemCPUTime) / 1000;

// Every perf fixture type goes through the crate, so zero calls means the
// patch hooked a different module instance than src/ imported -- the split
// would silently report 100% wrapper time. Fail instead.
if (crateCalls === 0) {
  throw new Error(
    `no config-disassembler calls were intercepted during ${op} (src=${srcRoot}); crate/wrapper split is broken`,
  );
}

process.stdout.write(
  `\n__PERF_RESULT__${JSON.stringify({
    elapsedMs,
    cpuMs,
    crateMs,
    crateCalls,
    rssBeforeBytes,
    peakRssBytes,
    // Clamped at 0: if module loading briefly peaked above where the operation
    // ever got, the operation added nothing measurable on top of it.
    peakRssDeltaBytes: Math.max(0, peakRssBytes - rssBeforeBytes),
  })}\n`,
);
