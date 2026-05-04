/*
 * Shared helpers for the round-trip audit harness.
 *
 * The audit scripts stage real Salesforce metadata into a clean SFDX project,
 * run `decomposer decompose` and `decomposer recompose` via the local CLI
 * entrypoint (`bin/run.js`), and report indicators that catch silent bugs:
 *
 *   - file-count parity (orig vs rebuilt)
 *   - <name>-multiset parity (catches data loss within a file)
 *   - SHA-256 hash-filename count (uniqueIdElements coverage opportunity)
 *   - parent-only output dir count (catches the dotted-fullName merge bug)
 *
 * These helpers are intentionally dependency-free (only Node builtins) so the
 * harness can run in any CI environment without an extra install step.
 */

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/**
 * One row in the audit summary. Mirrors the PowerShell pscustomobject so the
 * output table is comparable across platforms.
 */
export interface AuditRow {
  type: string;
  suffix: string;
  origFiles: number;
  rebuiltFiles: number;
  decomposedDirs: number;
  perComponentDirs: number;
  /** > 0 indicates a potential dotted-fullName merge bug (config-disassembler < 0.4.4). */
  parentOnlyDirs: number;
  /** > 0 indicates a uniqueIdElements coverage opportunity. */
  hashFiles: number;
  contentSetMatch: number;
  /** > 0 indicates real data loss on round-trip (collision). */
  contentSetDiff: number;
  missing: number;
  exitDecompose: number;
  exitRecompose: number;
}

/**
 * One row in the decompose-only sweep summary. We do not run recompose here
 * because the goal is to quickly tally hash-filename counts across many types.
 */
export interface SweepRow {
  type: string;
  suffix: string;
  staged: number;
  decomposedDirs: number;
  parentOnlyDirs: number;
  hashFiles: number;
  /** Top 3 inner directories by hash-filename count, formatted as `name(count)`. */
  topHashDirs: string;
  exit: number;
}

/** A (directory-name, metadata-suffix) pair. The two diverge for some types. */
export interface TypePair {
  type: string;
  suffix: string;
  /** Per-pair sample cap override; falls back to the CLI-level `--sample` if unset. */
  sample?: number;
}

const SFDX_PROJECT_JSON = JSON.stringify(
  {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '61.0',
  },
  null,
  0,
);

/** Lowercase 8-hex-digit prefix produced by config-disassembler's hash fallback. */
const HASH_FILE_RE = /^[a-f0-9]{8}\./;

/** Pull all `<name>...</name>` text values from raw XML, ignoring whitespace. */
const NAME_TAG_RE = /<name>([^<]+)<\/name>/g;

/** Default plugin root: the sf-decomposer repo we're invoking from. */
export const DEFAULT_PLUGIN_ROOT = process.cwd();

/** Default work root under the OS tmp dir. */
export const DEFAULT_WORK_ROOT = join(tmpdir(), 'sfd-audit');

/** Resolve the local CLI entrypoint (`bin/run.js`) from a plugin root. */
export function resolveCliBin(pluginRoot: string): string {
  return resolve(pluginRoot, 'bin', 'run.js');
}

/** Recursively remove a directory if it exists. No-op if missing. */
export function rmDir(dir: string): void {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

/**
 * Stage a clean SFDX project at `workDir` and copy *.xml files from
 * `sourceDir` into `<workDir>/force-app/main/default/<typeDirName>/`.
 * Returns the destination dir and the count of files actually staged.
 *
 * Pass `sample > 0` to randomly cap the staged set (useful for sweep runs).
 */
export function stageProject(args: { workDir: string; sourceDir: string; typeDirName: string; sample: number }): {
  destDir: string;
  stagedCount: number;
} {
  const { workDir, sourceDir, typeDirName, sample } = args;
  rmDir(workDir);
  const destDir = join(workDir, 'force-app', 'main', 'default', typeDirName);
  mkdirSync(destDir, { recursive: true });
  writeFileSync(join(workDir, 'sfdx-project.json'), SFDX_PROJECT_JSON, 'utf8');

  // Only stage flat *.xml files at the top of the type dir. Pre-decomposed
  // sub-directories (e.g. SDR-decomposed bots) exercise a different code path
  // that the round-trip audit isn't designed to cover.
  let candidates = readdirSync(sourceDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.xml'))
    .map((d) => join(sourceDir, d.name));

  if (sample > 0 && candidates.length > sample) {
    candidates = sampleRandom(candidates, sample);
  }

  for (const src of candidates) {
    cpSync(src, join(destDir, basename(src)));
  }
  return { destDir, stagedCount: candidates.length };
}

/** Fisher-Yates partial shuffle: returns the first `n` elements. */
function sampleRandom<T>(arr: readonly T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(0, n);
}

function basename(p: string): string {
  const idx = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return idx === -1 ? p : p.slice(idx + 1);
}

/**
 * Run the local CLI as a subprocess. Captures stdout+stderr so the harness
 * can dump them on failure but stays quiet on the happy path. Exit code 1 is
 * non-fatal here: config-disassembler legitimately writes ERROR-level logs
 * for leaf-only files it correctly skips, and we only care whether output
 * dirs were produced at all.
 */
export function runCli(args: {
  pluginRoot: string;
  cwd: string;
  argv: string[];
  logFile?: string;
}): SpawnSyncReturns<string> {
  const { pluginRoot, cwd, argv, logFile } = args;
  const result = spawnSync('node', [resolveCliBin(pluginRoot), ...argv], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    shell: false,
    // Inherit env (PATH, etc.) without leaking caller-set NODE_OPTIONS that
    // could change ts-node loader behavior unpredictably.
    env: { ...process.env, NODE_OPTIONS: '' },
  });
  if (logFile) {
    writeFileSync(logFile, `${result.stdout ?? ''}\n${result.stderr ?? ''}`, 'utf8');
  }
  return result;
}

/** Recursively list all *.xml files under a directory. */
export function listXmlFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listXmlFilesRecursive(full));
    } else if (entry.isFile() && entry.name.endsWith('.xml')) {
      out.push(full);
    }
  }
  return out;
}

/** List immediate-child directories of `dir`. Returns empty array if missing. */
export function listSubdirs(dir: string): Array<{ name: string; path: string }> {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, path: join(dir, e.name) }));
}

/** List flat *.xml files at the top level of `dir`. */
export function listFlatXml(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.xml'))
    .map((e) => join(dir, e.name));
}

/** Count files whose basename matches the SHA-256 hash-fallback pattern. */
export function countHashFiles(files: readonly string[]): number {
  let n = 0;
  for (const f of files) if (HASH_FILE_RE.test(basename(f))) n++;
  return n;
}

/**
 * Group hash-named files by the leaf segment of their parent directory and
 * return the top-N groups by count, formatted as `dirName(count)` joined by
 * spaces. Mirrors the PowerShell sweep output for at-a-glance comparison.
 */
export function topHashDirs(files: readonly string[], top = 3): string {
  const counts = new Map<string, number>();
  for (const f of files) {
    if (!HASH_FILE_RE.test(basename(f))) continue;
    const parent = leafDir(f);
    counts.set(parent, (counts.get(parent) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, count]) => `${name}(${count})`)
    .join(' ');
}

function leafDir(filePath: string): string {
  const idx = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  if (idx === -1) return '';
  const dir = filePath.slice(0, idx);
  const idx2 = Math.max(dir.lastIndexOf('/'), dir.lastIndexOf('\\'));
  return idx2 === -1 ? dir : dir.slice(idx2 + 1);
}

/**
 * Compare the sorted multiset of `<name>` values between two XML files.
 * Returns true when both files contain the same set (with the same
 * cardinality) of name values. We deliberately do NOT compare bytes
 * because XML round-tripping legitimately reorders elements and adjusts
 * trailing whitespace.
 */
export function nameMultisetMatches(origPath: string, rebuiltPath: string): boolean {
  const orig = extractNames(readFileSync(origPath, 'utf8'));
  const rebuilt = extractNames(readFileSync(rebuiltPath, 'utf8'));
  return orig.length === rebuilt.length && orig.every((v, i) => v === rebuilt[i]);
}

function extractNames(xml: string): string[] {
  const out: string[] = [];
  for (const m of xml.matchAll(NAME_TAG_RE)) out.push(m[1] as string);
  return out.sort();
}

/** Render an array of plain objects as a fixed-width ASCII table. */
export function formatTable<T extends object>(rows: readonly T[], columns?: ReadonlyArray<keyof T & string>): string {
  if (rows.length === 0) return '(no rows)';
  const cols: string[] = columns ? columns.slice() : Object.keys(rows[0] as object);
  const cell = (row: T, col: string): string => String((row as Record<string, unknown>)[col] ?? '');
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => cell(r, c).length)));
  const fmtRow = (vals: string[]): string => '  ' + vals.map((v, i) => v.padEnd(widths[i] ?? 0)).join('  ') + '  ';
  const lines = [fmtRow(cols), '  ' + cols.map((_c, i) => '-'.repeat(widths[i] ?? 0)).join('  ') + '  '];
  for (const r of rows) lines.push(fmtRow(cols.map((c) => cell(r, c))));
  return lines.join('\n');
}

/** Tiny `--name value` parser for the audit CLIs (no external dep). */
export function parseFlags(argv: readonly string[]): Map<string, string | true> {
  const out = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a) continue;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        out.set(key, next);
        i++;
      } else {
        out.set(key, true);
      }
    }
  }
  return out;
}

/**
 * Resolve a flag value to a string, throwing with a helpful message if the
 * flag is missing OR was passed without a value (`--source-root` alone).
 */
export function requireString(flags: Map<string, string | true>, key: string, helpHint: string): string {
  const v = flags.get(key);
  if (v === undefined) throw new Error(`Missing required --${key}. ${helpHint}`);
  if (v === true) throw new Error(`--${key} requires a value. ${helpHint}`);
  return v;
}

/** Resolve a flag to a number, defaulting if missing. Throws on non-numeric input. */
export function optionalInt(flags: Map<string, string | true>, key: string, fallback: number): number {
  const v = flags.get(key);
  if (v === undefined) return fallback;
  if (v === true) throw new Error(`--${key} requires a numeric value.`);
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) throw new Error(`--${key} must be a non-negative integer (got "${v}").`);
  return n;
}

export const FILE_PATTERNS = { HASH_FILE_RE };
