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

// All metrics are "smaller is better" (elapsed ms, CPU ms, peak RSS delta MB).
const RUNTIME_THRESHOLD = 1.3;
const MEMORY_THRESHOLD = 1.5;
// Minimum absolute change before a ratio crossing counts. Runtime rows are
// multi-second end-to-end runs; memory rows are peak RSS growth of a whole
// child process, where allocator/page-cache jitter is a few MB.
const RUNTIME_ABS_FLOOR_MS = 100;
const MEMORY_ABS_FLOOR_MB = 10;

// A parallelism drop (CPU / wall) is only called out when the base actually ran
// in parallel and the PR lost at least this fraction of it -- e.g. the Rust
// directory-mode fan-out silently going sequential. Informational only: wall
// time and CPU time already carry the regression classification.
const PARALLELISM_MIN_BASE = 1.5;
const PARALLELISM_DROP = 0.75;

const REQUIRED = [
  'perf-runtime.json',
  'perf-cpu.json',
  'perf-memory.json',
  'perf-runtime-base.json',
  'perf-cpu-base.json',
  'perf-memory-base.json',
];
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
const prCpu = loadJson('perf-cpu.json');
const baseCpu = loadJson('perf-cpu-base.json');
const prMemory = loadJson('perf-memory.json');
const baseMemory = loadJson('perf-memory-base.json');

const toMap = (entries) => new Map(entries.map((e) => [e.name, e]));
const namesOf = (entries) => new Set(entries.map((e) => e.name));
// "1985.2ms [1890.1-2080.5ms]": median plus the min-max spread across repeats,
// so a reviewer can tell a +12% move with a tight spread from one inside noise.
const cell = (entry, unit) => `${entry.value}${unit}${entry.range ? ` [${entry.range}]` : ''}`;

const regressions = [];
const improvements = [];
const stable = [];
const missing = [];
const added = [];

const NOT_APPLICABLE = 'n/a';

function compare(name, baseEntry, prEntry, unit, threshold, absFloor) {
  const baseVal = baseEntry.value;
  const prVal = prEntry.value;
  const values = { name, base: cell(baseEntry, unit), pr: cell(prEntry, unit) };
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
    const baseEntry = baseMap.get(entry.name);
    if (baseEntry == null) {
      added.push({ name: entry.name, series, value: `${entry.value}${unit}` });
      continue;
    }
    compare(`${entry.name}${suffix}`, baseEntry, entry, unit, threshold, absFloor);
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
// CPU time (user + system across all threads, JS and Rust) uses the runtime
// threshold/floor: same unit, but far less sensitive to noisy neighbours, so a
// genuine compute regression in the crate crosses it more reliably.
compareSeries('cpu', prCpu, baseCpu, {
  suffix: ' (cpu)',
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

// Effective parallelism = CPU time / wall time, per benchmark, base vs PR.
const parallelism = [];
{
  const baseWall = toMap(baseRuntime);
  const baseCpuMap = toMap(baseCpu);
  const prCpuMap = toMap(prCpu);
  for (const wall of prRuntime) {
    const bw = baseWall.get(wall.name);
    const bc = baseCpuMap.get(wall.name);
    const pc = prCpuMap.get(wall.name);
    if (!bw || !bc || !pc || !(bw.value > 0) || !(wall.value > 0)) continue;
    const base = bc.value / bw.value;
    const pr = pc.value / wall.value;
    const dropped = base >= PARALLELISM_MIN_BASE && pr < base * PARALLELISM_DROP;
    parallelism.push({ name: wall.name, base: base.toFixed(2), pr: pr.toFixed(2), dropped });
  }
}

const profile = process.env.PERF_PROFILE || 'large';

const tableHeader = '| Benchmark | Base | PR | Ratio | Change |\n|---|---:|---:|---:|---:|';
const tableRow = (r) => `| ${r.name} | ${r.base} | ${r.pr} | ${r.ratio} | ${r.change} |`;
const reconciliationHeader = (column) => `| Benchmark | Series | ${column} |\n|---|---|---:|`;
const reconciliationRow = (r) => `| ${r.name} | ${r.series} | ${r.value} |`;

const lines = [
  `# Performance comparison (same runner, interleaved, profile=${profile})\n`,
  `_Flagged only when the ratio crosses ${RUNTIME_THRESHOLD}x runtime/cpu / ${MEMORY_THRESHOLD}x memory ` +
    `**and** the absolute change is at least ${RUNTIME_ABS_FLOOR_MS}ms / ${MEMORY_ABS_FLOOR_MB}MB. ` +
    'Values are medians; brackets show the min-max across repeats._\n',
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
if (parallelism.length > 0) {
  lines.push(
    '## Parallelism (CPU time / wall time)\n',
    `Informational. Flagged when base ran at ${PARALLELISM_MIN_BASE}x or more and the PR lost over ` +
      `${Math.round((1 - PARALLELISM_DROP) * 100)}% of it (e.g. Rust fan-out going sequential).\n`,
    '| Benchmark | Base | PR | |\n|---|---:|---:|---|',
    ...parallelism.map((p) => `| ${p.name} | ${p.base}x | ${p.pr}x | ${p.dropped ? 'dropped' : ''} |`),
    '',
  );
}

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

const droppedParallelism = parallelism.filter((p) => p.dropped).map((p) => p.name);
if (droppedParallelism.length > 0) {
  console.warn(
    `\n::warning::parallelism (cpu/wall) dropped on ${droppedParallelism.length} benchmark(s): ${droppedParallelism.join(', ')}`,
  );
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
