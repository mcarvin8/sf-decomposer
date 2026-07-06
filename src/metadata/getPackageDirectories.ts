'use strict';

import { readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { IGNORE_FILE, SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { SfdxProject } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';

export async function getPackageDirectories(
  metaDirectory: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<{ metadataPaths: string[]; ignorePath: string }> {
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
  const packageDirectories = sfdxProject.packageDirectories.map((directory) => resolve(repoRoot, directory.path));

  const searchPromises = packageDirectories.map(async (directory) => {
    if (!normalizedIgnoreDirs.includes(basename(directory))) {
      return searchRecursively(directory, metaDirectory);
    }
    return [];
  });

  const results = await Promise.all(searchPromises);
  const metadataPaths = results.flat().map((filePath) => resolve(filePath));

  return { metadataPaths, ignorePath };
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
