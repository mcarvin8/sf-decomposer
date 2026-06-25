'use strict';

import { resolve, join, basename } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { SfdxProject } from '../helpers/types.js';
import { IGNORE_FILE, SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';

export async function getPackageDirectories(
  metaDirectory: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<{ metadataPaths: string[]; ignorePath: string }> {
  const { repoRoot, dxConfigFilePath } = repoRootOverride
    ? { repoRoot: repoRootOverride, dxConfigFilePath: join(repoRootOverride, SFDX_PROJECT_FILE_NAME) }
    : ((await getRepoRoot()) as { repoRoot: string; dxConfigFilePath: string });
  const ignorePath = resolve(repoRoot, IGNORE_FILE);
  const sfdxProjectRaw: string = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
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
  } catch (error) {
    // Handle permission errors or other filesystem errors gracefully
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific */
    return [];
  }
}
