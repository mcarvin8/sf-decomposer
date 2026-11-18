'use strict';

import { readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { CONCURRENCY_LIMITS, IGNORE_FILE, SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { toPortablePath } from '../helpers/projectPath.js';
import { PathIndex, SfdxProject } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { RegistryAccess } from './registry/registryAccess.js';

/**
 * Resolves repoRoot/ignorePath/package-directory list once, shared by both
 * `getPackageDirectories` (single target) and `buildPackageDirectoryIndex` (batched).
 */
async function resolvePackageDirContext(
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<{ ignorePath: string; packageDirectories: string[] }> {
  const { repoRoot, dxConfigFilePath } = repoRootOverride
    ? { repoRoot: repoRootOverride, dxConfigFilePath: join(repoRootOverride, SFDX_PROJECT_FILE_NAME) }
    : ((await getRepoRoot()) as { repoRoot: string; dxConfigFilePath: string });
  const ignorePath = resolve(repoRoot, IGNORE_FILE);
  // Stryker disable next-line StringLiteral: JSON.parse(Buffer) defaults to UTF-8 decoding
  const sfdxProjectRaw: string = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  // Stryker disable next-line ArrayDeclaration: an empty default is only distinguishable from a
  // non-empty one by a real directory named after the mutant's placeholder text, which isn't a
  // meaningful test.
  const normalizedIgnoreDirs = (ignoreDirs ?? []).map((dir) => basename(toPortablePath(dir)));
  const packageDirectories = sfdxProject.packageDirectories
    .map((directory) => resolve(repoRoot, toPortablePath(directory.path)))
    .filter((directory) => !normalizedIgnoreDirs.includes(basename(directory)));

  return { ignorePath, packageDirectories };
}

export async function getPackageDirectories(
  metaDirectory: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<{ metadataPaths: string[]; ignorePath: string }> {
  const { ignorePath, packageDirectories } = await resolvePackageDirContext(ignoreDirs, repoRootOverride);

  const searchPromises = packageDirectories.map((directory) => searchRecursively(directory, metaDirectory));

  const results = await Promise.all(searchPromises);
  const metadataPaths = results.flat().map((filePath) => resolve(filePath));

  return { metadataPaths, ignorePath };
}

/**
 * Resolves matching directories for every name in `directoryNames` in a single shared walk per
 * package directory, instead of one full walk per metadata type. Preserves the exact per-name
 * semantics of `getPackageDirectories`/`searchRecursively` — including "don't recurse into an
 * already-matched directory for that same name" — while allowing a different name's directory to
 * still be found nested beneath one that already matched another name (since independent
 * single-target calls, run separately per type today, would find it too).
 */
/** Files the disassembler writes beside every file it decomposes: they mark a decomposed directory. */
const DISASSEMBLER_SIDECARS = new Set(['.key_order.json', '.element_order.json', '.trailing_newline.json']);
const META_XML = '-meta.xml';

/**
 * Directories of strict-folder types (`bots`, `objectTranslations`, `aura`, `lwc`, ...). SDR resolves
 * any file under one of them as that type before trying suffixes, so they are never searched by suffix.
 */
function strictFolderNames(): Set<string> {
  return new Set(
    new RegistryAccess()
      .listTypes()
      .filter((type) => type.strictDirectoryName)
      .map((type) => type.directoryName),
  );
}

type SuffixScan = {
  suffixes: ReadonlySet<string>;
  strictDirs: ReadonlySet<string>;
  suffixDirs: Map<string, Set<string>>;
  decomposedParents: Map<string, Set<string>>;
  sidecarParents: Set<string>;
};

/** `Foo.flow-meta.xml` -> `flow`; `undefined` for anything that isn't a `-meta.xml` file. */
function metaSuffixOf(fileName: string): string | undefined {
  if (!fileName.endsWith(META_XML)) return undefined;
  const stem = fileName.slice(0, -META_XML.length);
  const dot = stem.lastIndexOf('.');
  return dot === -1 ? undefined : stem.slice(dot + 1);
}

/**
 * Resolves matching directories for every name in `directoryNames` in a single shared walk per
 * package directory, instead of one full walk per metadata type. Preserves the exact per-name
 * semantics of `getPackageDirectories`/`searchRecursively` — including "don't recurse into an
 * already-matched directory for that same name" — while allowing a different name's directory to
 * still be found nested beneath one that already matched another name (since independent
 * single-target calls, run separately per type today, would find it too).
 *
 * With `suffixes`, the same walk also records where those types' files are, wherever they live, the
 * way SDR resolves a `-meta.xml` file by its suffix rather than its folder: directories directly
 * holding `<name>.<suffix>-meta.xml` files, and directories holding decomposed directories (marked
 * by the disassembler's sidecars). It skips strict-folder types' directories, whose files SDR
 * resolves as that type, and doesn't descend into decomposed directories.
 */
export async function buildPackageDirectoryIndex(
  directoryNames: Iterable<string>,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
  suffixes?: Iterable<string>,
): Promise<PathIndex> {
  const { ignorePath, packageDirectories } = await resolvePackageDirContext(ignoreDirs, repoRootOverride);
  const watchedNames = new Set(directoryNames);
  const index = new Map<string, string[]>();
  for (const name of watchedNames) index.set(name, []);

  const watchedSuffixes = new Set(suffixes ?? []);
  const scan: SuffixScan | undefined =
    watchedSuffixes.size > 0
      ? {
          suffixes: watchedSuffixes,
          strictDirs: strictFolderNames(),
          suffixDirs: new Map(),
          decomposedParents: new Map(),
          sidecarParents: new Set(),
        }
      : undefined;

  // One readdir limiter shared by the whole walk. Unbounded, a decomposed tree (the perf suite's
  // `large` fixture: ~2.5k directories holding ~72k shard files) had every directory's listing
  // in flight and alive at once -- ~33 MB of V8 heap paid by every recompose, even of a tiny
  // metadata type. Only the listing is limited; the recursion itself is unchanged.
  const listDir = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  await Promise.all(
    packageDirectories.map((directory) =>
      searchMultiTargetRecursively(directory, watchedNames, index, new Set(), listDir, scan, false),
    ),
  );

  if (!scan) return { index, ignorePath };
  const toArrays = (m: Map<string, Set<string>>): Map<string, string[]> =>
    new Map([...m].map(([k, v]) => [k, [...v].sort()]));
  return {
    index,
    ignorePath,
    suffixDirs: toArrays(scan.suffixDirs),
    decomposedParents: toArrays(scan.decomposedParents),
    sidecarParents: [...scan.sidecarParents].sort(),
  };
}

function addTo(map: Map<string, Set<string>>, key: string, value: string): void {
  const values = map.get(key) ?? new Set<string>();
  values.add(value);
  map.set(key, values);
}

/**
 * Records `dir` in the suffix scan. Returns false when `dir` is a decomposed directory, whose
 * contents are shards, not metadata, and must not be searched further.
 */
function scanFiles(dir: string, fileNames: string[], scan: SuffixScan): boolean {
  if (fileNames.some((name) => DISASSEMBLER_SIDECARS.has(name))) {
    // Decomposed: its leaf (`<dir>.<suffix>-meta.<ext>`) names the type, if it has one.
    const stem = basename(dir);
    const parent = resolve(dir, '..');
    const leaf = fileNames
      .map((name) => /^(.+)\.([^.]+)-meta\.[^.]+$/.exec(name))
      .find((m) => m && m[1] === stem && scan.suffixes.has(m[2]));
    if (leaf) addTo(scan.decomposedParents, leaf[2], parent);
    else scan.sidecarParents.add(parent);
    return false;
  }
  for (const name of fileNames) {
    const suffix = metaSuffixOf(name);
    if (suffix && scan.suffixes.has(suffix)) addTo(scan.suffixDirs, suffix, resolve(dir));
  }
  return true;
}

async function searchMultiTargetRecursively(
  dir: string,
  watchedNames: Set<string>,
  index: Map<string, string[]>,
  matchedAncestors: ReadonlySet<string>,
  listDir: ReturnType<typeof pLimit>,
  scan: SuffixScan | undefined,
  underStrictFolder: boolean,
): Promise<void> {
  // Keep only directory entries (and, when scanning by suffix, file names), so the far more
  // numerous file entries aren't held while this directory's children are walked.
  let dirs;
  let fileNames: string[] = [];
  try {
    dirs = await listDir(async () => {
      const entries = await readdir(dir, { withFileTypes: true });
      if (scan && !underStrictFolder) fileNames = entries.filter((e) => e.isFile()).map((e) => e.name);
      return entries.filter((entry) => entry.isDirectory());
    });
  } catch (_error) {
    // Handle permission errors or other filesystem errors gracefully
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific */
    return;
  }

  if (scan && !underStrictFolder && !scanFiles(dir, fileNames, scan)) return;

  await Promise.all(
    dirs.map((entry) => {
      const childPath = join(dir, entry.name);
      const isFreshMatch = watchedNames.has(entry.name) && !matchedAncestors.has(entry.name);
      if (isFreshMatch) {
        (index.get(entry.name) as string[]).push(resolve(childPath));
      }
      const nextAncestors = isFreshMatch ? new Set([...matchedAncestors, entry.name]) : matchedAncestors;
      const strict = underStrictFolder || Boolean(scan?.strictDirs.has(entry.name));
      return searchMultiTargetRecursively(childPath, watchedNames, index, nextAncestors, listDir, scan, strict);
    }),
  );
}

async function searchRecursively(dxDirectory: string, subDirectoryName: string): Promise<string[]> {
  try {
    const files = await readdir(dxDirectory, { withFileTypes: true });
    const dirs = files.filter((file) => file.isDirectory());

    const directMatches = dirs
      .filter((file) => file.name === subDirectoryName)
      .map((file) => join(dxDirectory, file.name));

    const deeperResults = await Promise.all(
      dirs
        .filter((file) => file.name !== subDirectoryName)
        .map((file) => searchRecursively(join(dxDirectory, file.name), subDirectoryName)),
    );

    return [...directMatches, ...deeperResults.flat()];
  } catch (_error) {
    // Handle permission errors or other filesystem errors gracefully
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific */
    return [];
  }
}
