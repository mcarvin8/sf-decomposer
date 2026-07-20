'use strict';

import { readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { IGNORE_FILE, SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { SfdxProject } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';

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
  const normalizedIgnoreDirs = (ignoreDirs ?? []).map((dir) => basename(dir));
  const packageDirectories = sfdxProject.packageDirectories
    .map((directory) => resolve(repoRoot, directory.path))
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
export async function buildPackageDirectoryIndex(
  directoryNames: Iterable<string>,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<{ index: Map<string, string[]>; ignorePath: string }> {
  const { ignorePath, packageDirectories } = await resolvePackageDirContext(ignoreDirs, repoRootOverride);
  const watchedNames = new Set(directoryNames);
  const index = new Map<string, string[]>();
  for (const name of watchedNames) index.set(name, []);

  await Promise.all(
    packageDirectories.map((directory) => searchMultiTargetRecursively(directory, watchedNames, index, new Set())),
  );

  return { index, ignorePath };
}

async function searchMultiTargetRecursively(
  dir: string,
  watchedNames: Set<string>,
  index: Map<string, string[]>,
  matchedAncestors: ReadonlySet<string>,
): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (_error) {
    // Handle permission errors or other filesystem errors gracefully
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific */
    return;
  }

  const dirs = entries.filter((entry) => entry.isDirectory());

  await Promise.all(
    dirs.map((entry) => {
      const childPath = join(dir, entry.name);
      const isFreshMatch = watchedNames.has(entry.name) && !matchedAncestors.has(entry.name);
      if (isFreshMatch) {
        (index.get(entry.name) as string[]).push(resolve(childPath));
      }
      const nextAncestors = isFreshMatch ? new Set([...matchedAncestors, entry.name]) : matchedAncestors;
      return searchMultiTargetRecursively(childPath, watchedNames, index, nextAncestors);
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
