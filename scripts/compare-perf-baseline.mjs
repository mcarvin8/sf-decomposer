// Compares this PR's perf-runtime.json / perf-memory.json (head ref) with
// perf-runtime-base.json / perf-memory-base.json (PR base ref). Both come from
// the SAME perf-suite run: the timing loop interleaves base and head repeats
// on one runner (see test/perf/decompose.perf.ts and perf.yml's
// "Prepare PR base-ref worktree" step), so runner drift and warm-up effects
// land on both sides equally.
//
// Guards (ported from sfdx-git-delta's __tests__/perf/compareBaseline.mjs,
// plus an absolute floor this suite needs):
//   - Missing input file -> throw. A crashed run must not read as "no regressions".
//   - Non-positive value on either side -> listed, never classified. A ratio
//     against 0 or a negative number is not a measurement (-0.016 / -0.004 = 4.0
//     used to be reported as a +300% regression).
//   - Absolute floor -> a row is only a regression/improvement when BOTH the
//     ratio threshold AND an absolute delta floor are crossed, so a few-KB or
//     few-ms wobble on a tiny value can't produce a +57% headline.
//   - Benchmarks present on only one side are reported by name, not skipped.
//
// Env:     PERF_PROFILE - shown in the report heading.
// Output:  perf-comparison.md. Posting it is perf.yml's perf-comment job: this
//          script runs inside the job that executes the PR's own code, so it
//          deliberately reads no GitHub token. Regressions never exit
//          non-zero: they're informational (comment + ::warning::), matching
//          perf.yml's fail-on-alert: false.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Both metrics are "smaller is better" (elapsed ms, peak RSS delta MB).
const RUNTIME_THRESHOLD = 1.3;
const MEMORY_THRESHOLD = 1.5;
// Minimum absolute change before a ratio crossing counts. Runtime rows are
// multi-second end-to-end runs; memory rows are peak RSS growth of a whole
// child process, where allocator/page-cache jitter is a few MB.
const RUNTIME_ABS_FLOOR_MS = 100;
const MEMORY_ABS_FLOOR_MB = 10;

const REQUIRED = ['perf-runtime.json', 'perf-memory.json', 'perf-runtime-base.json', 'perf-memory-base.json'];
const missingFiles = REQUIRED.filter((p) => !existsSync(p));
if (missingFiles.length > 0) {
  throw new Error(
    `${missingFiles.join(', ')} missing: the benchmark run did not complete (or ran without PERF_BASE_ROOT), ` +
      'so there is nothing to compare. Refusing to report on absent data.',
  );
}

const loadJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const prRuntime = loadJson('perf-runtime.json');
const baseRuntime = loadJson('perf-runtime-base.json');
const prMemory = loadJson('perf-memory.json');
const baseMemory = loadJson('perf-memory-base.json');

const toMap = (entries) => new Map(entries.map((e) => [e.name, e.value]));
const namesOf = (entries) => new Set(entries.map((e) => e.name));

const regressions = [];
const improvements = [];
const stable = [];
const missing = [];
const added = [];

const NOT_APPLICABLE = 'n/a';

function compare(name, baseVal, prVal, unit, threshold, absFloor) {
  const values = { name, base: `${baseVal}${unit}`, pr: `${prVal}${unit}` };
  if (!(baseVal > 0) || !(prVal > 0)) {
    stable.push({ ...values, ratio: NOT_APPLICABLE, change: NOT_APPLICABLE });
    return;
  }
  const ratio = prVal / baseVal;
  const pct = ((ratio - 1) * 100).toFixed(1);
  const row = {
    ...values,
    ratio: ratio.toFixed(2),
    change: ratio > 1 ? `+${pct}%` : `-${Math.abs(pct)}%`,
  };
  const significant = Math.abs(prVal - baseVal) >= absFloor;
  if (significant && ratio >= threshold) regressions.push(row);
  else if (significant && ratio <= 1 / threshold) improvements.push(row);
  else stable.push(row);
}

function compareSeries(series, pr, base, { suffix, unit, threshold, absFloor }) {
  const baseMap = toMap(base);
  const prNames = namesOf(pr);
  for (const entry of pr) {
    const baseVal = baseMap.get(entry.name);
    if (baseVal == null) {
      added.push({ name: entry.name, series, value: `${entry.value}${unit}` });
      continue;
    }
    compare(`${entry.name}${suffix}`, baseVal, entry.value, unit, threshold, absFloor);
  }
  for (const entry of base) {
    if (!prNames.has(entry.name)) missing.push({ name: entry.name, series, value: `${entry.value}${unit}` });
  }
}

compareSeries('runtime', prRuntime, baseRuntime, {
  suffix: '',
  unit: 'ms',
  threshold: RUNTIME_THRESHOLD,
  absFloor: RUNTIME_ABS_FLOOR_MS,
});
compareSeries('memory', prMemory, baseMemory, {
  suffix: ' (peak rss)',
  unit: 'MB',
  threshold: MEMORY_THRESHOLD,
  absFloor: MEMORY_ABS_FLOOR_MB,
});

const profile = process.env.PERF_PROFILE || 'large';

const tableHeader = '| Benchmark | Base | PR | Ratio | Change |\n|---|---:|---:|---:|---:|';
const tableRow = (r) => `| ${r.name} | ${r.base} | ${r.pr} | ${r.ratio} | ${r.change} |`;
const reconciliationHeader = (column) => `| Benchmark | Series | ${column} |\n|---|---|---:|`;
const reconciliationRow = (r) => `| ${r.name} | ${r.series} | ${r.value} |`;

const lines = [
  `# Performance comparison (same runner, interleaved, profile=${profile})\n`,
  `_Flagged only when the ratio crosses ${RUNTIME_THRESHOLD}x runtime / ${MEMORY_THRESHOLD}x memory ` +
    `**and** the absolute change is at least ${RUNTIME_ABS_FLOOR_MS}ms / ${MEMORY_ABS_FLOOR_MB}MB._\n`,
];

if (regressions.length > 0) {
  lines.push('## Regressions\n', tableHeader, ...regressions.map(tableRow), '');
}
if (improvements.length > 0) {
  lines.push('## Improvements\n', tableHeader, ...improvements.map(tableRow), '');
}
if (missing.length > 0) {
  lines.push(
    '## Benchmarks missing from this run\n',
    reconciliationHeader('Base'),
    ...missing.map(reconciliationRow),
    '',
    'A renamed benchmark appears here under its old name and under "new" below with its new name; ' +
      'a deleted or skipped benchmark appears only here. The tables above are not a complete comparison.',
    '',
  );
}
if (added.length > 0) {
  lines.push('## Benchmarks new in this run\n', reconciliationHeader('PR'), ...added.map(reconciliationRow), '');
}
lines.push('## Stable\n', tableHeader, ...(stable.length > 0 ? stable.map(tableRow) : ['| _none_ | | | | |']), '');

const report = lines.join('\n');
writeFileSync('perf-comparison.md', report);
console.log(report);

if (regressions.length > 0) {
  console.warn(
    `\n::warning::${regressions.length} performance regression(s) detected on the same runner ` +
      `(runtime: ${RUNTIME_THRESHOLD}x and >=${RUNTIME_ABS_FLOOR_MS}ms, memory: ${MEMORY_THRESHOLD}x and >=${MEMORY_ABS_FLOOR_MB}MB) ` +
      '-- see PR comment for details',
  );
} else {
  console.info('No regressions detected.');
}

const uniqueNames = (rows) => [...new Set(rows.map((r) => r.name))];
const missingNames = uniqueNames(missing);
if (missingNames.length > 0) {
  console.warn(`\n::warning::${missingNames.length} benchmark(s) missing from this run: ${missingNames.join(', ')}`);
}
const addedNames = uniqueNames(added);
if (addedNames.length > 0) {
  console.info(`\n::notice::${addedNames.length} new benchmark(s) in this run: ${addedNames.join(', ')}`);
}
