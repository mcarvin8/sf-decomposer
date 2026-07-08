// Convert perf-results/<stamp>-<profile>-<format>.json reports written by
// test/perf/utils/measure.ts#writeReport into the flat metric arrays consumed
// by benchmark-action/github-action-benchmark (customSmallerIsBetter mode).
//
// Inputs:  perf-results/*.json
// Outputs: perf-runtime.json - sample.elapsedMedianMs in ms, one entry per
//                              (profile, format, sample.label)
//          perf-memory.json  - sample.heapUsedMedianBytes in MB, same keys.
//                              JS heap only, sampled around a forced GC on both sides
//                              (see test/perf/utils/measure.ts) -- not whole-process RSS,
//                              which was mostly measuring GC/allocator timing noise rather
//                              than the operation's actual memory cost.
//
// Each perf run writes TWO reports per (profile, format): the correctness test's report
// (round-trip fidelity / idempotence assertions; samples populated, medianSamples empty)
// and the dedicated timing test's report (median-of-N repeats; medianSamples populated,
// samples empty). Reports are merged by (profile, format) rather than "latest wins" so
// both contribute -- in practice only medianSamples ends up non-empty per key, since
// that's the only field this script publishes (samples is diagnostic-only; see
// test/perf/utils/measure.ts's PerfReport doc comment).

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
  const key = `${r.profile}|${r.format}`;
  const existing = merged.get(key) ?? { profile: r.profile, medianSamples: [] };
  existing.medianSamples.push(...(r.medianSamples ?? []));
  merged.set(key, existing);
}

const runtime = [];
const memory = [];
for (const r of merged.values()) {
  for (const s of r.medianSamples) {
    // sample.label already begins with the format (e.g. "xml.decompose");
    // prefix only the profile to avoid stuttering.
    const name = `${r.profile}.${s.label}`;
    runtime.push({ name, unit: 'ms', value: Number(s.elapsedMedianMs.toFixed(2)) });
    memory.push({
      name,
      unit: 'MB',
      value: Number((s.heapUsedMedianBytes / 1024 / 1024).toFixed(3)),
    });
  }
}

await writeFile('perf-runtime.json', JSON.stringify(runtime, null, 2) + '\n', 'utf8');
await writeFile('perf-memory.json', JSON.stringify(memory, null, 2) + '\n', 'utf8');
console.log(`perf-to-benchmark: wrote ${runtime.length} runtime + ${memory.length} memory metrics.`);
