'use strict';

import { resolve, join, basename } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { SfdxProject } from '../helpers/types.js';
import { IGNORE_FILE } from '../helpers/constants.js';

export async function getPackageDirectories(
  metaDirectory: string,
  ignoreDirs: string[] | undefined
): Promise<{ metadataPaths: string[]; ignorePath: string }> {
  const { repoRoot, dxConfigFilePath } = (await getRepoRoot()) as {
    repoRoot: string;
    dxConfigFilePath: string;
  };
  process.chdir(repoRoot);
  const ignorePath = resolve(repoRoot, IGNORE_FILE);
  const sfdxProjectRaw: string = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const normalizedIgnoreDirs = (ignoreDirs ?? []).map((dir) => basename(dir));
  const packageDirectories = sfdxProject.packageDirectories.map((directory) => resolve(repoRoot, directory.path));

  const searchPromises = packageDirectories.map(async (directory) => {
    if (!normalizedIgnoreDirs.includes(basename(directory))) {
      return searchRecursively(directory, metaDirectory);
    }
  });

  const results = await Promise.all(searchPromises);
  const metadataPaths = results.filter((filePath) => filePath !== undefined).map((filePath) => resolve(filePath));

  return { metadataPaths, ignorePath };
}

async function searchRecursively(dxDirectory: string, subDirectoryName: string): Promise<string | undefined> {
  try {
    const files = await readdir(dxDirectory, { withFileTypes: true });

    // First check if the directory we're looking for is at this level
    const directMatch = files.find((file) => file.isDirectory() && file.name === subDirectoryName);
    if (directMatch) {
      return join(dxDirectory, directMatch.name);
    }

    // If not found, search recursively in subdirectories in parallel
    const searchPromises = files
      .filter((file) => file.isDirectory())
      .map((file) => searchRecursively(join(dxDirectory, file.name), subDirectoryName));

    const results = await Promise.all(searchPromises);
    return results.find((result) => result !== undefined);
  } catch (error) {
    // Handle permission errors or other filesystem errors gracefully
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific */
    return undefined;
  }
}
