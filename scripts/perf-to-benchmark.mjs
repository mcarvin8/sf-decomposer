// Convert perf-results/<stamp>-<profile>-<format>[-base].json reports written by
// test/perf/utils/measure.ts#writeReport into the flat metric arrays consumed
// by benchmark-action/github-action-benchmark (customSmallerIsBetter mode).
//
// Inputs:  perf-results/*.json
// Outputs: perf-runtime.json - sample.elapsedMedianMs in ms, one entry per
//                              (profile, format, sample.label). Every entry
//                              also carries `range` ("min-max<unit>").
//          perf-cpu.json     - sample.cpuMedianMs in ms (user + system CPU across
//                              all threads, JS and Rust), same keys.
//          perf-memory.json  - sample.peakRssDeltaMedianBytes in MB, same keys.
//                              Peak RSS growth of a fresh child process per
//                              operation (see test/perf/utils/runOp.ts), so it
//                              includes config-disassembler's native (Rust)
//                              allocations -- unlike the JS heapUsed delta this
//                              replaced, which could not see them and hovered
//                              around +/-0.01 MB of pure noise.
//          perf-{runtime,cpu,memory}-base.json - the same, for reports
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

const newSeries = () => ({ runtime: [], cpu: [], memory: [] });
const series = { head: newSeries(), base: newSeries() };
const mb = (bytes) => Number((bytes / 1024 / 1024).toFixed(2));
const ms = (v) => Number(v.toFixed(2));
// `range` is benchmark-action's free-text spread field (shown in its tooltip);
// compare-perf-baseline.mjs also prints it next to each value.
const range = (min, max, unit) => `${min}-${max}${unit}`;
for (const r of merged.values()) {
  const out = series[r.ref];
  if (!out) throw new Error(`unknown report ref "${r.ref}"`);
  for (const s of r.medianSamples) {
    // sample.label already begins with the format (e.g. "xml.decompose");
    // prefix only the profile to avoid stuttering.
    const name = `${r.profile}.${s.label}`;
    out.runtime.push({
      name,
      unit: 'ms',
      value: ms(s.elapsedMedianMs),
      range: range(ms(s.elapsedMinMs), ms(s.elapsedMaxMs), 'ms'),
    });
    out.cpu.push({
      name,
      unit: 'ms',
      value: ms(s.cpuMedianMs),
      range: range(ms(s.cpuMinMs), ms(s.cpuMaxMs), 'ms'),
    });
    out.memory.push({
      name,
      unit: 'MB',
      value: mb(s.peakRssDeltaMedianBytes),
      range: range(mb(s.peakRssDeltaMinBytes), mb(s.peakRssDeltaMaxBytes), 'MB'),
    });
  }
}

const write = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');

for (const [ref, suffix] of [
  ['head', ''],
  ['base', '-base'],
]) {
  const out = series[ref];
  // base only exists on PR runs (PERF_BASE_ROOT set).
  if (ref === 'base' && out.runtime.length === 0) continue;
  await write(`perf-runtime${suffix}.json`, out.runtime);
  await write(`perf-cpu${suffix}.json`, out.cpu);
  await write(`perf-memory${suffix}.json`, out.memory);
  console.log(`perf-to-benchmark: wrote ${out.runtime.length} runtime/cpu/memory metrics (${ref}).`);
}
