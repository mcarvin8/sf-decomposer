/*
 * Helpers for the corpus byte-equality harness: pinned git clones, whole-tree
 * SHA-256 snapshots, supported-type discovery, and mismatch classification.
 *
 * Dependency-free (Node builtins only), like scripts/audit/.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export interface CorpusRepo {
  name: string;
  url: string;
  /** Full commit SHA. Never a branch: upstream commits must not look like regressions. */
  sha: string;
  /** How the repo's XML is formatted: `salesforce` (as retrieved) or `prettier`. Informational. */
  style?: 'salesforce' | 'prettier';
}

export interface DiscoveredType {
  /** Value passed to `-m`. */
  suffix: string;
  typeName: string;
  /** Repo-relative POSIX paths of the parent XML files of this type. */
  files: string[];
}

export type MismatchKind =
  | 'bom'
  | 'declaration'
  | 'eol'
  | 'trailing-whitespace'
  | 'entity'
  | 'tag-whitespace'
  | 'whitespace'
  | 'self-closing'
  | 'reorder'
  | 'drift';

export interface Mismatch {
  kind: MismatchKind;
  /** 1-based line of the first differing line (raw bytes split on \n). */
  line: number;
  orig: string;
  rebuilt: string;
}

/** Path -> SHA-256 hex of raw bytes. Keys are repo-relative POSIX paths. */
export type Snapshot = Map<string, string>;

// Keep in sync with UNSUPPORTED_ADAPTERS in src/helpers/constants.ts (scripts stay self-contained).
const UNSUPPORTED_ADAPTERS = ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'];
const META_SUFFIX = '-meta.xml';
const SKIP_DIRS = new Set(['.git', 'node_modules', '.sfdx', '.sf']);

// ---------------------------------------------------------------- git

function git(args: string[], cwd?: string): string {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed (${r.status}): ${r.stderr}`);
  }
  return r.stdout;
}

/**
 * Clone `repo` at its pinned SHA into `<workRoot>/repos/<name>` with every byte
 * exactly as stored in the blob: autocrlf off, and `* -text` in
 * `.git/info/attributes` so the repo's own `.gitattributes` can't normalize
 * line endings on checkout. Reuses an existing clone already at the SHA.
 */
export function cloneAtSha(repo: CorpusRepo, workRoot: string): string {
  const dir = join(workRoot, 'repos', repo.name);
  if (existsSync(join(dir, '.git'))) {
    try {
      if (git(['rev-parse', 'HEAD'], dir).trim() === repo.sha) {
        resetClone(dir);
        return dir;
      }
    } catch {
      /* fall through to a fresh clone */
    }
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });
  git(['init', '-q'], dir);
  git(['config', 'core.autocrlf', 'false'], dir);
  git(['config', 'core.longpaths', 'true'], dir);
  mkdirSync(join(dir, '.git', 'info'), { recursive: true });
  writeFileSync(join(dir, '.git', 'info', 'attributes'), '* -text\n', 'utf8');
  git(['remote', 'add', 'origin', repo.url], dir);
  git(['fetch', '-q', '--depth', '1', 'origin', repo.sha], dir);
  git(['checkout', '-q', '--detach', 'FETCH_HEAD'], dir);
  return dir;
}

/** Restore the clone to its pinned commit and drop everything untracked. Throwaway clones only. */
export function resetClone(dir: string): void {
  git(['reset', '-q', '--hard', 'HEAD'], dir);
  git(['clean', '-q', '-fdx'], dir);
}

/** Raw committed bytes of `relPath` (no text conversion: `git show` emits the blob as-is). */
export function committedBytes(dir: string, relPath: string): Buffer {
  const r = spawnSync('git', ['show', `HEAD:${relPath}`], { cwd: dir, stdio: 'pipe', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`git show HEAD:${relPath} failed: ${r.stderr.toString()}`);
  return r.stdout;
}

// ---------------------------------------------------------------- snapshot

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

function walkFiles(root: string, dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkFiles(root, join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(toPosix(relative(root, join(dir, entry.name))));
    }
  }
}

/** SHA-256 of every file in the work tree (excluding .git / node_modules). */
export function snapshotTree(root: string): Snapshot {
  const files: string[] = [];
  walkFiles(root, root, files);
  const snap: Snapshot = new Map();
  for (const f of files) {
    snap.set(
      f,
      createHash('sha256')
        .update(readFileSync(join(root, f)))
        .digest('hex'),
    );
  }
  return snap;
}

export interface SnapshotDiff {
  missing: string[];
  extra: string[];
  changed: string[];
}

export function diffSnapshots(before: Snapshot, after: Snapshot): SnapshotDiff {
  const missing: string[] = [];
  const changed: string[] = [];
  for (const [path, hash] of before) {
    const h = after.get(path);
    if (h === undefined) missing.push(path);
    else if (h !== hash) changed.push(path);
  }
  const extra = [...after.keys()].filter((p) => !before.has(p));
  return { missing: missing.sort(), extra: extra.sort(), changed: changed.sort() };
}

// ---------------------------------------------------------------- discovery

interface RegistryType {
  id: string;
  name: string;
  suffix?: string;
  directoryName?: string;
  strategies?: { adapter?: string };
  /** Set on folder types (ReportFolder, ...), which sf-decomposer rejects. */
  folderContentType?: string;
}

interface Registry {
  childTypes: Record<string, string>;
  suffixes: Record<string, string>;
  types: Record<string, RegistryType>;
}

export function loadRegistry(pluginRoot: string): Registry {
  const path = join(pluginRoot, 'src', 'metadata', 'registry', 'metadataRegistry.json');
  return JSON.parse(readFileSync(path, 'utf8')) as Registry;
}

function packageDirs(repoDir: string): string[] {
  const project = JSON.parse(readFileSync(join(repoDir, 'sfdx-project.json'), 'utf8')) as {
    packageDirectories: Array<{ path: string }>;
  };
  return project.packageDirectories.map((p) => resolve(repoDir, p.path)).filter((p) => existsSync(p));
}

/**
 * Find every metadata type in the repo's package directories that sf-decomposer
 * accepts (not a child type, not CustomObject, not an unsupported adapter, not a folder type).
 * Leaf-only types are included; the runner reports them as SKIPPED when
 * decompose leaves their files in place.
 */
export function discoverTypes(repoDir: string, registry: Registry): DiscoveredType[] {
  // Directories of bundle-style types (`aura`, `lwc`, `staticresources`, ...): their `-meta.xml` files
  // belong to the bundle, not to the type their suffix names -- `aura/X/X.app-meta.xml` is an Aura
  // application, not a CustomApplication.
  const bundleDirs = new Set(
    Object.values(registry.types)
      .filter((t) => t.strategies?.adapter && UNSUPPORTED_ADAPTERS.includes(t.strategies.adapter))
      .map((t) => t.directoryName)
      .filter((d): d is string => Boolean(d)),
  );
  const byType = new Map<string, DiscoveredType>();
  for (const pkg of packageDirs(repoDir)) {
    const files: string[] = [];
    walkFiles(repoDir, pkg, files);
    for (const rel of files) {
      const base = rel.slice(rel.lastIndexOf('/') + 1);
      if (!base.endsWith(META_SUFFIX)) continue;
      if (
        rel
          .split('/')
          .slice(0, -1)
          .some((segment) => bundleDirs.has(segment))
      )
        continue;
      const stem = base.slice(0, -META_SUFFIX.length);
      const suffix = stem.slice(stem.lastIndexOf('.') + 1);
      const typeId = registry.suffixes[suffix];
      if (!typeId || registry.childTypes[typeId]) continue;
      const type = registry.types[typeId];
      if (!type || type.suffix === 'object') continue;
      if (type.strategies?.adapter && UNSUPPORTED_ADAPTERS.includes(type.strategies.adapter)) continue;
      if (type.folderContentType) continue;
      const entry = byType.get(type.id) ?? { suffix, typeName: type.name, files: [] };
      entry.files.push(rel);
      byType.set(type.id, entry);
    }
  }
  return [...byType.values()].sort((a, b) => a.suffix.localeCompare(b.suffix));
}

// ---------------------------------------------------------------- classification

const ENTITIES: Array<[RegExp, string]> = [
  [/&apos;|&#39;|&#x27;/g, "'"],
  [/&quot;|&#34;|&#x22;/g, '"'],
  [/&gt;|&#62;|&#x3[eE];/g, '>'],
  [/&#xD;|&#13;/g, '\r'],
  [/&#xA;|&#10;/g, '\n'],
];

const stripBom = (s: string): string => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);
/** Canonicalize the `<?xml ...?>` prolog: quote style and spacing (e.g. Prettier's `"UTF-8" ?>`). */
const normDecl = (s: string): string =>
  s.replace(
    /^<\?xml\s+([^?]*?)\s*\?>/,
    (_m, attrs: string) => `<?xml ${attrs.replace(/'/g, '"').replace(/\s+/g, ' ')}?>`,
  );
const lf = (s: string): string => s.replace(/\r\n/g, '\n');
const decodeEntities = (s: string): string => ENTITIES.reduce((acc, [re, v]) => acc.replace(re, v), s);
/**
 * Whitespace inside tag markup: Prettier wraps long elements as `<tag` + newline + `>value</tag>`
 * and puts each attribute on its own line. Collapses runs to one space and drops the space
 * before `>` / `/>`.
 */
const tagWs = (s: string): string =>
  s.replace(/<[^<>!?][^<>]*>/g, (tag) => tag.replace(/\s+/g, ' ').replace(/ (\/?>)$/, '$1'));
/** `<a></a>` and `<a/>` are the same empty element. Dropped empty elements stay `drift`. */
const selfClose = (s: string): string => s.replace(/<([\w:.-]+)((?: [^<>]*)?)><\/\1>/g, '<$1$2/>');
const collapseWs = (s: string): string => s.replace(/>\s+</g, '><').trim();
const sortedLines = (s: string): string =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .sort()
    .join('\n');

/**
 * Name the smallest normalization that makes the rebuilt file equal the
 * original. Each step builds on the previous one, so the kind is the first
 * difference that explains the mismatch. `drift` means nothing explains it.
 */
export function classifyMismatch(origBuf: Buffer, rebuiltBuf: Buffer): Mismatch {
  const o0 = origBuf.toString('utf8');
  const r0 = rebuiltBuf.toString('utf8');
  const first = firstDiffLine(o0, r0);

  const steps: Array<[MismatchKind, (s: string) => string]> = [
    ['bom', stripBom],
    ['declaration', normDecl],
    ['eol', lf],
    ['trailing-whitespace', (s) => s.trimEnd()],
    ['entity', decodeEntities],
    ['tag-whitespace', tagWs],
    ['whitespace', collapseWs],
    ['self-closing', selfClose],
  ];
  let o = o0;
  let r = r0;
  for (const [kind, fn] of steps) {
    o = fn(o);
    r = fn(r);
    if (o === r) return { kind, ...first };
  }
  // Reorder check on the fully normalized text, one tag per line: splitting on the source's own
  // line breaks missed a reorder whenever lines were also joined or split (e.g. a hand-written
  // `<allowRead>true</allowRead>        <object>X</object>    </objectPermissions>`).
  const lines = (s: string): string =>
    sortedLines(selfClose(collapseWs(tagWs(decodeEntities(lf(normDecl(stripBom(s))))))).replace(/></g, '>\n<'));
  if (lines(o0) === lines(r0)) {
    return { kind: 'reorder', ...first };
  }
  return { kind: 'drift', ...first };
}

function firstDiffLine(a: string, b: string): { line: number; orig: string; rebuilt: string } {
  const al = a.split('\n');
  const bl = b.split('\n');
  const n = Math.max(al.length, bl.length);
  for (let i = 0; i < n; i++) {
    if (al[i] !== bl[i]) {
      return { line: i + 1, orig: show(al[i]), rebuilt: show(bl[i]) };
    }
  }
  return { line: 0, orig: '', rebuilt: '' };
}

function show(line: string | undefined): string {
  if (line === undefined) return '<EOF>';
  const v = JSON.stringify(line);
  return v.length > 160 ? `${v.slice(0, 157)}...` : v;
}
