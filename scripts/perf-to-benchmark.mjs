// Convert perf-results/<stamp>-<profile>-<format>[-base].json reports written by
// test/perf/utils/measure.ts#writeReport into the flat metric arrays consumed
// by benchmark-action/github-action-benchmark (customSmallerIsBetter mode).
//
// Inputs:  perf-results/*.json
// Outputs: perf-runtime.json - sample.elapsedMedianMs in ms, one entry per
//                              (profile, format, sample.label)
//          perf-memory.json  - sample.peakRssDeltaMedianBytes in MB, same keys.
//                              Peak RSS growth of a fresh child process per
//                              operation (see test/perf/utils/runOp.ts), so it
//                              includes config-disassembler's native (Rust)
//                              allocations -- unlike the JS heapUsed delta this
//                              replaced, which could not see them and hovered
//                              around +/-0.01 MB of pure noise.
//          perf-runtime-base.json / perf-memory-base.json - the same, for reports
//                              tagged ref: 'base' (PR runs only, when the suite
//                              was given PERF_BASE_ROOT). Not written otherwise.
//
// Each perf run writes TWO kinds of report per (profile, format): the correctness test's
// report (round-trip fidelity / idempotence assertions; samples populated, medianSamples
// empty) and the dedicated timing test's report(s) (median-of-N repeats; medianSamples
// populated, one report per ref). Reports are merged by (ref, profile, format) rather than
// "latest wins" so all contribute -- in practice only medianSamples ends up non-empty per
// key, since that's the only field this script publishes.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = 'perf-results';
let files;
try {
  files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
} catch {
  console.error(`No ${dir}/ directory; nothing to convert.`);
  process.exit(0);
}
if (files.length === 0) {
  console.error(`${dir}/ has no JSON reports; nothing to convert.`);
  process.exit(0);
}

const merged = new Map();
for (const f of files.sort()) {
  const r = JSON.parse(await readFile(join(dir, f), 'utf8'));
  const ref = r.ref ?? 'head';
  const key = `${ref}|${r.profile}|${r.format}`;
  const existing = merged.get(key) ?? { ref, profile: r.profile, medianSamples: [] };
  existing.medianSamples.push(...(r.medianSamples ?? []));
  merged.set(key, existing);
}

const series = { head: { runtime: [], memory: [] }, base: { runtime: [], memory: [] } };
for (const r of merged.values()) {
  const out = series[r.ref];
  if (!out) throw new Error(`unknown report ref "${r.ref}"`);
  for (const s of r.medianSamples) {
    // sample.label already begins with the format (e.g. "xml.decompose");
    // prefix only the profile to avoid stuttering.
    const name = `${r.profile}.${s.label}`;
    out.runtime.push({ name, unit: 'ms', value: Number(s.elapsedMedianMs.toFixed(2)) });
    out.memory.push({
      name,
      unit: 'MB',
      value: Number((s.peakRssDeltaMedianBytes / 1024 / 1024).toFixed(2)),
    });
  }
}

const write = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');

await write('perf-runtime.json', series.head.runtime);
await write('perf-memory.json', series.head.memory);
console.log(
  `perf-to-benchmark: wrote ${series.head.runtime.length} runtime + ${series.head.memory.length} memory metrics (head).`,
);
if (series.base.runtime.length > 0) {
  await write('perf-runtime-base.json', series.base.runtime);
  await write('perf-memory-base.json', series.base.memory);
  console.log(
    `perf-to-benchmark: wrote ${series.base.runtime.length} runtime + ${series.base.memory.length} memory metrics (base).`,
  );
}
