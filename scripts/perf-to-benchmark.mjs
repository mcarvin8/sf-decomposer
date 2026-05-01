// Convert perf-results/<stamp>-<profile>-<format>.json reports written by
// test/perf/utils/measure.ts#writeReport into the flat metric arrays consumed
// by benchmark-action/github-action-benchmark (customSmallerIsBetter mode).
//
// Inputs:  perf-results/*.json
// Outputs: perf-runtime.json - sample.elapsedMs in ms, one entry per
//                              (profile, format, sample.label)
//          perf-memory.json  - sample.rssDeltaBytes in MB, same keys
//
// One metric per (profile, format, label) tuple; if multiple reports cover
// the same tuple (e.g. a re-run within the same job) only the most recent
// timestamp is kept so the dashboard timeline stays one datapoint per run.

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

const latest = new Map();
for (const f of files.sort()) {
  const r = JSON.parse(await readFile(join(dir, f), 'utf8'));
  latest.set(`${r.profile}|${r.format}`, r);
}

const runtime = [];
const memory = [];
for (const r of latest.values()) {
  for (const s of r.samples) {
    // sample.label already begins with the format (e.g. "xml.decompose.pass1");
    // prefix only the profile to avoid stuttering.
    const name = `${r.profile}.${s.label}`;
    runtime.push({ name, unit: 'ms', value: Number(s.elapsedMs.toFixed(2)) });
    memory.push({
      name,
      unit: 'MB',
      value: Number((s.rssDeltaBytes / 1024 / 1024).toFixed(3)),
    });
  }
}

await writeFile('perf-runtime.json', JSON.stringify(runtime, null, 2) + '\n', 'utf8');
await writeFile('perf-memory.json', JSON.stringify(memory, null, 2) + '\n', 'utf8');
console.log(`perf-to-benchmark: wrote ${runtime.length} runtime + ${memory.length} memory metrics.`);
