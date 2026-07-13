// Compares this PR's perf-runtime.json / perf-memory.json (built from a run
// against the PR head) with perf-runtime-base.json / perf-memory-base.json
// (built from an identical run against the PR base ref, on the same runner,
// immediately before). See perf.yml's "Run baseline performance suite"
// step for how the *-base.json files are produced.
//
// This exists because comparing against gh-pages history (a different run on
// a different runner, possibly days old) swings 20-30% between otherwise
// identical code -- see perf.yml's alert-threshold comments. Same-runner,
// same-moment diffing removes most of that noise, so this uses a tighter
// threshold than the gh-pages-based publish steps.
//
// Inputs:  perf-runtime.json, perf-memory.json (head)
//          perf-runtime-base.json, perf-memory-base.json (base)
// Env:     PERF_PROFILE      - included in the sticky-comment marker so the
//                              `large`/`manyfiles` matrix jobs each get their
//                              own comment instead of overwriting each other.
//          GITHUB_TOKEN      - posts/updates the PR comment when set.
//          GITHUB_REPOSITORY - "owner/repo", set automatically by Actions.
//          PR_NUMBER         - the PR to comment on.
// Output:  perf-comparison.md, plus a sticky PR comment when the env above
//          is present. Never exits non-zero: regressions are informational
//          (surfaced via the comment and a ::warning::), not a required-check
//          failure -- matches the rest of perf.yml's fail-on-alert: false.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Both metrics are "smaller is better" (elapsed ms, heap delta MB), unlike
// sfdx-git-delta's ops/sec runtime metric -- so both use the same ratio
// direction (pr / base) below.
const RUNTIME_THRESHOLD = 1.3;
const MEMORY_THRESHOLD = 1.5;

const loadJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : []);

const prRuntime = loadJson('perf-runtime.json');
const baseRuntime = loadJson('perf-runtime-base.json');
const prMemory = loadJson('perf-memory.json');
const baseMemory = loadJson('perf-memory-base.json');

const toMap = (entries) => new Map(entries.map((e) => [e.name, e.value]));
const baseRuntimeMap = toMap(baseRuntime);
const baseMemoryMap = toMap(baseMemory);

const regressions = [];
const improvements = [];
const stable = [];

function compare(name, baseVal, prVal, unit, threshold) {
  const ratio = prVal / baseVal;
  const pct = ((ratio - 1) * 100).toFixed(1);
  const row = {
    name,
    base: baseVal,
    pr: prVal,
    unit,
    ratio: ratio.toFixed(2),
    change: ratio > 1 ? `+${pct}%` : `-${Math.abs(pct)}%`,
  };
  if (ratio >= threshold) regressions.push(row);
  else if (ratio <= 1 / threshold) improvements.push(row);
  else stable.push(row);
}

for (const entry of prRuntime) {
  const baseVal = baseRuntimeMap.get(entry.name);
  if (baseVal == null) continue; // new bench name -- no baseline to diff against yet
  compare(entry.name, baseVal, entry.value, 'ms', RUNTIME_THRESHOLD);
}
for (const entry of prMemory) {
  const baseVal = baseMemoryMap.get(entry.name);
  if (baseVal == null) continue;
  compare(`${entry.name} (heap)`, baseVal, entry.value, 'MB', MEMORY_THRESHOLD);
}

const profile = process.env.PERF_PROFILE || 'large';

const tableHeader = '| Benchmark | Base | PR | Ratio | Change |\n|---|---:|---:|---:|---:|';
const tableRow = (r) => `| ${r.name} | ${r.base}${r.unit} | ${r.pr}${r.unit} | ${r.ratio} | ${r.change} |`;

const lines = [`# Performance comparison (same runner, profile=${profile})\n`];

if (regressions.length > 0) {
  lines.push('## Regressions\n', tableHeader, ...regressions.map(tableRow), '');
}
if (improvements.length > 0) {
  lines.push('## Improvements\n', tableHeader, ...improvements.map(tableRow), '');
}
lines.push('## Stable\n', tableHeader, ...(stable.length > 0 ? stable.map(tableRow) : ['| _none_ | | | | |']), '');

const report = lines.join('\n');
writeFileSync('perf-comparison.md', report);
console.log(report);

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;

if (token && repo && prNumber) {
  const commentMarker = `<!-- same-runner-perf:${profile} -->`;
  const commentBody = `${commentMarker}\n${report}`;
  const [owner, repoName] = repo.split('/');
  const apiBase = `https://api.github.com/repos/${owner}/${repoName}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  const commentsRes = await fetch(`${apiBase}/issues/${prNumber}/comments?per_page=100`, { headers });
  const comments = await commentsRes.json();
  const existing = Array.isArray(comments) ? comments.find((c) => c.body?.includes(commentMarker)) : undefined;

  if (existing) {
    await fetch(`${apiBase}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ body: commentBody }),
    });
  } else {
    await fetch(`${apiBase}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: commentBody }),
    });
  }
}

if (regressions.length > 0) {
  console.warn(
    `\n::warning::${regressions.length} performance regression(s) detected on the same runner ` +
      `(runtime threshold: ${RUNTIME_THRESHOLD}x, memory threshold: ${MEMORY_THRESHOLD}x) -- see PR comment for details`,
  );
} else {
  console.info('No regressions detected.');
}
