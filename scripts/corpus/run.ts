/*
 * Corpus byte-equality harness.
 *
 * Clones public Salesforce DX repos at pinned SHAs, then for every supported
 * metadata type found in each repo and every strategy/format cell:
 *
 *   reset clone -> decompose --postpurge -> recompose --postpurge
 *   -> SHA-256 the whole tree -> must equal the pristine tree exactly
 *
 * Any missing file, leftover file, or changed byte fails the cell. Changed
 * files are classified (bom, eol, trailing-whitespace, entity, whitespace,
 * reorder, drift) and both versions are saved under the report dir.
 *
 * Usage:
 *   npm run build && npm run corpus -- [options]
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatTable, parseFlags, resolveCliBin, runCli } from '../audit/lib.js';
import {
  type CorpusRepo,
  classifyMismatch,
  cloneAtSha,
  committedBytes,
  type DiscoveredType,
  diffSnapshots,
  discoverTypes,
  loadRegistry,
  type MismatchKind,
  resetClone,
  type Snapshot,
  snapshotTree,
} from './lib.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ALL_FORMATS = ['xml', 'json', 'yaml', 'json5'];
const ALL_STRATEGIES = ['unique-id', 'grouped-by-tag'];
/**
 * Mismatch kinds that are formatting only and don't fail a cell unless --strict: whitespace
 * inside tag markup (Prettier's `<tag` + newline + `>value`, one attribute per line) and
 * between tags. Salesforce never writes these; Prettier does, and re-applies them anyway.
 */
const FORMATTING_KINDS: ReadonlySet<MismatchKind> = new Set(['tag-whitespace', 'whitespace']);

const HELP_TEXT = `Usage: npm run corpus -- [options]

Builds nothing itself: run \`npm run build\` first (bin/run.js loads lib/).

Options:
  --corpus <path>        Corpus JSON (default: scripts/corpus/corpus.json)
  --repos <a,b>          Only these corpus entries (by name)
  --types <a,b>          Only these suffixes (e.g. permissionset,profile,flow)
  --strategies <a,b>     unique-id,grouped-by-tag (default: both)
  --formats <a,b|all>    xml,json,yaml,json5 (default: xml)
  --nested-perms         Add a -p cell for permissionset under grouped-by-tag
  --strict               Fail formatting-only differences too
  --plugin <path>        sf-decomposer repo root (default: cwd)
  --work-root <path>     Clone + scratch root (default: <tmp>/sfd-corpus)
  --out <path>           Report dir (default: <work-root>/reports/<timestamp>)
  --help, -h             Show this help

Statuses: PASS byte-equal; FORMAT only formatting kinds differ (passes unless --strict);
SKIPPED nothing decomposed; FAIL anything else differs; ERROR harness error.

Exit codes: 0 no FAIL/ERROR, 2 any FAIL/ERROR, 1 harness error.
`;

type Status = 'PASS' | 'FORMAT' | 'FAIL' | 'SKIPPED' | 'ERROR';

interface Cell {
  repo: string;
  type: string;
  strategy: string;
  format: string;
  nestedPerms: boolean;
}

interface CellResult extends Cell {
  status: Status;
  files: number;
  decomposed: number;
  /** Files of the type decompose left in place, with the disassembler's logged reason. */
  skippedFiles: Array<{ path: string; reason: string }>;
  missing: string[];
  extra: string[];
  changed: Array<{ path: string; kind: MismatchKind; line: number; orig: string; rebuilt: string }>;
  exitDecompose: number;
  exitRecompose: number;
  error?: string;
}

interface Options {
  corpus: CorpusRepo[];
  types?: Set<string>;
  strategies: string[];
  formats: string[];
  nestedPerms: boolean;
  strict: boolean;
  pluginRoot: string;
  workRoot: string;
  out: string;
}

function list(v: string | true | undefined): string[] | undefined {
  if (typeof v !== 'string') return undefined;
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCli(argv: readonly string[]): Options {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }
  const flags = parseFlags(argv);
  const corpusPath = resolve((flags.get('corpus') as string | undefined) ?? join(HERE, 'corpus.json'));
  let corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as CorpusRepo[];
  const repoFilter = list(flags.get('repos'));
  if (repoFilter) corpus = corpus.filter((r) => repoFilter.includes(r.name));
  for (const r of corpus) {
    if (!/^[0-9a-f]{40}$/.test(r.sha)) throw new Error(`${r.name}: sha must be a full 40-char commit SHA`);
  }

  const formatsRaw = list(flags.get('formats')) ?? ['xml'];
  const formats = formatsRaw.includes('all') ? ALL_FORMATS : formatsRaw;
  const strategies = list(flags.get('strategies')) ?? ALL_STRATEGIES;
  for (const f of formats) if (!ALL_FORMATS.includes(f)) throw new Error(`Unknown format "${f}"`);
  for (const s of strategies) if (!ALL_STRATEGIES.includes(s)) throw new Error(`Unknown strategy "${s}"`);

  const workRoot = resolve((flags.get('work-root') as string | undefined) ?? join(tmpdir(), 'sfd-corpus'));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const typeFilter = list(flags.get('types'));
  return {
    corpus,
    types: typeFilter ? new Set(typeFilter) : undefined,
    strategies,
    formats,
    nestedPerms: flags.has('nested-perms'),
    strict: flags.has('strict'),
    pluginRoot: resolve((flags.get('plugin') as string | undefined) ?? process.cwd()),
    workRoot,
    out: resolve((flags.get('out') as string | undefined) ?? join(workRoot, 'reports', stamp)),
  };
}

function cellsFor(repo: string, type: DiscoveredType, opts: Options): Cell[] {
  const cells: Cell[] = [];
  for (const strategy of opts.strategies) {
    for (const format of opts.formats) {
      cells.push({ repo, type: type.suffix, strategy, format, nestedPerms: false });
      if (opts.nestedPerms && strategy === 'grouped-by-tag' && type.suffix === 'permissionset') {
        cells.push({ repo, type: type.suffix, strategy, format, nestedPerms: true });
      }
    }
  }
  return cells;
}

function cellId(c: Cell): string {
  return `${c.type}__${c.strategy}__${c.format}${c.nestedPerms ? '__p' : ''}`;
}

function runCell(cell: Cell, type: DiscoveredType, repoDir: string, baseline: Snapshot, opts: Options): CellResult {
  const logDir = join(opts.out, cell.repo, cellId(cell));
  mkdirSync(logDir, { recursive: true });
  const result: CellResult = {
    ...cell,
    status: 'PASS',
    files: type.files.length,
    decomposed: 0,
    skippedFiles: [],
    missing: [],
    extra: [],
    changed: [],
    exitDecompose: -1,
    exitRecompose: -1,
  };

  resetClone(repoDir);

  const decomposeArgv = ['decomposer', 'decompose', '-m', cell.type, '-s', cell.strategy, '-f', cell.format];
  if (cell.nestedPerms) decomposeArgv.push('-p');
  decomposeArgv.push('--postpurge');
  const dec = runCli({
    pluginRoot: opts.pluginRoot,
    cwd: repoDir,
    argv: decomposeArgv,
    logFile: join(logDir, 'decompose.log'),
  });
  result.exitDecompose = dec.status ?? -1;

  // --postpurge deletes each original it decomposed. Originals still present
  // were skipped (leaf-only) -- a cell where nothing decomposed proves nothing.
  const afterDecompose = snapshotTree(repoDir);
  result.decomposed = type.files.filter((f) => !afterDecompose.has(f)).length;
  result.skippedFiles = skipReasons(
    type.files.filter((f) => afterDecompose.has(f)),
    `${dec.stdout ?? ''}\n${dec.stderr ?? ''}`,
  );
  if (result.decomposed === 0) {
    result.status = 'SKIPPED';
    return result;
  }

  const rec = runCli({
    pluginRoot: opts.pluginRoot,
    cwd: repoDir,
    argv: ['decomposer', 'recompose', '-m', cell.type, '--postpurge'],
    logFile: join(logDir, 'recompose.log'),
  });
  result.exitRecompose = rec.status ?? -1;

  const diff = diffSnapshots(baseline, snapshotTree(repoDir));
  result.missing = diff.missing;
  result.extra = diff.extra;
  for (const path of diff.changed) {
    const orig = committedBytes(repoDir, path);
    const rebuilt = readFileSync(join(repoDir, path));
    const m = classifyMismatch(orig, rebuilt);
    result.changed.push({ path, ...m });
    const saveBase = join(logDir, 'files', path);
    mkdirSync(dirname(saveBase), { recursive: true });
    writeFileSync(`${saveBase}.orig`, orig);
    writeFileSync(`${saveBase}.rebuilt`, rebuilt);
  }
  if (diff.missing.length || diff.extra.length) {
    result.status = 'FAIL';
  } else if (result.changed.length) {
    const kinds = result.changed.map((c) => c.kind);
    if (!opts.strict && kinds.every((k) => FORMATTING_KINDS.has(k))) {
      result.status = 'FORMAT';
    } else {
      result.status = 'FAIL';
    }
  }
  return result;
}

/**
 * "The XML file <path> only has leaf elements. This file will not be disassembled." The comment
 * reason is "has comments outside its root element" since config-disassembler 4.1.0 (comments inside
 * the root are kept); "has comments between elements" is the 4.0.3 wording, still matched for
 * reports of builds on that version.
 */
const SKIP_LOG_RE =
  /The XML file (.+?) (only has leaf elements|has no child elements|has comments outside its root element|has comments between elements)/;

/**
 * Pair each file decompose left in place with the reason config-disassembler logged for it. A file
 * with no log line was left alone by sf-decomposer itself (or the log format changed).
 */
function skipReasons(paths: string[], log: string): Array<{ path: string; reason: string }> {
  const reasons = new Map<string, string>();
  for (const line of log.split(/\r?\n/)) {
    const m = SKIP_LOG_RE.exec(line);
    if (m?.[1] && m[2]) reasons.set(m[1].replace(/\\/g, '/'), m[2]);
  }
  return paths.map((path) => {
    const hit = [...reasons].find(([logged]) => logged.endsWith(`/${path}`));
    return { path, reason: hit?.[1] ?? 'no logged reason' };
  });
}

function markdownSummary(results: CellResult[], opts: Options, pluginSha: string): string {
  const count = (s: Status): number => results.filter((r) => r.status === s).length;
  const lines = [
    '# sf-decomposer corpus byte-equality report',
    '',
    `- sf-decomposer: \`${pluginSha}\``,
    `- strategies: ${opts.strategies.join(', ')} | formats: ${opts.formats.join(', ')}${opts.nestedPerms ? ' | nested perms' : ''}${opts.strict ? ' | strict' : ''}`,
    `- cells: ${results.length} | PASS ${count('PASS')} | FORMAT ${count('FORMAT')} | FAIL ${count('FAIL')} | SKIPPED ${count('SKIPPED')} | ERROR ${count('ERROR')}`,
    '',
    '| repo | type | strategy | format | status | files | decomposed | skipped | missing | extra | changed (kinds) |',
    '| --- | --- | --- | --- | --- | --: | --: | --: | --: | --: | --- |',
  ];
  for (const r of results) {
    const kinds = [...new Set(r.changed.map((c) => c.kind))].join(', ');
    lines.push(
      `| ${r.repo} | ${r.type} | ${r.strategy}${r.nestedPerms ? ' -p' : ''} | ${r.format} | ${r.status} | ${r.files} | ${r.decomposed} | ${r.skippedFiles.length} | ${r.missing.length} | ${r.extra.length} | ${r.changed.length}${kinds ? ` (${kinds})` : ''} |`,
    );
  }
  // Files left in place inside cells that otherwise decomposed: a SKIPPED cell shows in the table,
  // but these would hide behind a PASS. One row per file (strategies and formats repeat it).
  const partial = new Map<string, { repo: string; type: string; path: string; reason: string }>();
  for (const r of results) {
    if (r.status === 'SKIPPED') continue;
    for (const f of r.skippedFiles) partial.set(`${r.repo}:${f.path}`, { repo: r.repo, type: r.type, ...f });
  }
  if (partial.size) {
    lines.push('', '## Files left undecomposed in decomposed cells', '');
    lines.push('| repo | type | file | reason |', '| --- | --- | --- | --- |');
    for (const f of partial.values()) lines.push(`| ${f.repo} | ${f.type} | \`${f.path}\` | ${f.reason} |`);
  }
  const byReason = new Map<string, Set<string>>();
  for (const r of results) {
    for (const f of r.skippedFiles) {
      const files = byReason.get(f.reason) ?? new Set<string>();
      files.add(`${r.repo}:${f.path}`);
      byReason.set(f.reason, files);
    }
  }
  if (byReason.size) {
    lines.push('', '## Skipped files by reason', '', '| reason | files |', '| --- | --: |');
    for (const [reason, files] of [...byReason].sort((a, b) => b[1].size - a[1].size)) {
      lines.push(`| ${reason} | ${files.size} |`);
    }
  }

  const failures = results.filter((r) => r.status === 'FAIL' || r.status === 'ERROR');
  if (failures.length) {
    lines.push('', '## Failures', '');
    for (const r of failures) {
      lines.push(`### ${r.repo} / ${cellId(r)}`, '');
      if (r.error) lines.push(`- error: ${r.error}`);
      for (const p of r.missing.slice(0, 20)) lines.push(`- missing: \`${p}\``);
      for (const p of r.extra.slice(0, 20)) lines.push(`- extra: \`${p}\``);
      for (const c of r.changed.slice(0, 20)) {
        lines.push(
          `- changed (${c.kind}) \`${c.path}\` line ${c.line}`,
          `  - orig:    ${c.orig}`,
          `  - rebuilt: ${c.rebuilt}`,
        );
      }
      lines.push('');
    }
  }
  return `${lines.join('\n')}\n`;
}

function main(): number {
  const opts = parseCli(process.argv.slice(2));
  if (!existsSync(join(opts.pluginRoot, 'lib', 'commands'))) {
    throw new Error(
      `No lib/ under ${opts.pluginRoot}. Run \`npm run build\` first (${resolveCliBin(opts.pluginRoot)} loads lib/).`,
    );
  }
  mkdirSync(opts.out, { recursive: true });
  const registry = loadRegistry(opts.pluginRoot);
  const pluginSha = pluginRef(opts.pluginRoot);

  const results: CellResult[] = [];
  for (const repo of opts.corpus) {
    process.stdout.write(`\n== ${repo.name} @ ${repo.sha.slice(0, 12)}${repo.style ? ` (${repo.style})` : ''}\n`);
    let repoDir: string;
    try {
      repoDir = cloneAtSha(repo, opts.workRoot);
    } catch (err) {
      process.stdout.write(`  clone failed: ${(err as Error).message}\n`);
      results.push({
        repo: repo.name,
        type: '-',
        strategy: '-',
        format: '-',
        nestedPerms: false,
        status: 'ERROR',
        files: 0,
        decomposed: 0,
        skippedFiles: [],
        missing: [],
        extra: [],
        changed: [],
        exitDecompose: -1,
        exitRecompose: -1,
        error: `clone: ${(err as Error).message}`,
      });
      continue;
    }
    const baseline = snapshotTree(repoDir);
    const types = discoverTypes(repoDir, registry).filter((t) => !opts.types || opts.types.has(t.suffix));
    process.stdout.write(`  types: ${types.map((t) => `${t.suffix}(${t.files.length})`).join(' ') || '(none)'}\n`);

    for (const type of types) {
      for (const cell of cellsFor(repo.name, type, opts)) {
        let r: CellResult;
        try {
          r = runCell(cell, type, repoDir, baseline, opts);
        } catch (err) {
          r = {
            ...cell,
            status: 'ERROR',
            files: type.files.length,
            decomposed: 0,
            skippedFiles: [],
            missing: [],
            extra: [],
            changed: [],
            exitDecompose: -1,
            exitRecompose: -1,
            error: (err as Error).message,
          };
        }
        results.push(r);
        process.stdout.write(
          `  ${r.status.padEnd(7)} ${cellId(cell)}${r.changed.length ? ` changed=${r.changed.length}` : ''}${r.missing.length ? ` missing=${r.missing.length}` : ''}${r.extra.length ? ` extra=${r.extra.length}` : ''}${r.status !== 'SKIPPED' && r.skippedFiles.length ? ` skipped=${r.skippedFiles.length}` : ''}\n`,
        );
      }
    }
    resetClone(repoDir);
  }

  writeFileSync(join(opts.out, 'results.json'), `${JSON.stringify({ pluginSha, results }, null, 2)}\n`, 'utf8');
  writeFileSync(join(opts.out, 'summary.md'), markdownSummary(results, opts, pluginSha), 'utf8');

  const rows = results
    .filter((r) => r.status === 'FAIL' || r.status === 'ERROR')
    .map((r) => ({
      repo: r.repo,
      cell: cellId(r),
      status: r.status,
      missing: r.missing.length,
      extra: r.extra.length,
      changed: r.changed.length,
    }));
  const count = (s: Status): number => results.filter((r) => r.status === s).length;
  process.stdout.write(
    `\nPASS ${count('PASS')}  FORMAT ${count('FORMAT')}  FAIL ${count('FAIL')}  SKIPPED ${count('SKIPPED')}  ERROR ${count('ERROR')}\n`,
  );
  if (rows.length) process.stdout.write(`${formatTable(rows)}\n`);
  process.stdout.write(`\nReport: ${opts.out}\n`);
  return count('FAIL') + count('ERROR') > 0 ? 2 : 0;
}

/** Branch@sha of the sf-decomposer checkout under test, recorded in every report. */
function pluginRef(root: string): string {
  const r = spawnSync('git', ['log', '-1', '--format=%h %D'], { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : 'unknown';
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`${(err as Error).message}\n`);
  process.exitCode = 1;
}
