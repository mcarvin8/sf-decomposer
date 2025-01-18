'use strict';

import { resolve, join, basename } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';

import { getRepoRoot } from '../service/getRepoRoot.js';
import { SfdxProject } from '../helpers/types.js';
import { IGNORE_FILE } from '../helpers/constants.js';

export async function getPackageDirectories(
  metaDirectory: string,
  ignoreDirs: string[] | undefined
): Promise<{ metadataPaths: string[]; ignorePath: string }> {
  const { repoRoot, dxConfigFilePath } = await getRepoRoot();
  if (!repoRoot || !dxConfigFilePath) {
    throw new Error('Failed to retrieve repository root or sfdx-project.json path.');
  }
  process.chdir(repoRoot);
  const ignorePath = resolve(repoRoot, IGNORE_FILE);
  const sfdxProjectRaw: string = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const normalizedIgnoreDirs = (ignoreDirs ?? []).map((dir) => basename(dir));
  const packageDirectories = sfdxProject.packageDirectories.map((directory) => resolve(repoRoot, directory.path));

  const metadataPaths = (
    await Promise.all(
      packageDirectories.map(async (directory) => {
        if (normalizedIgnoreDirs.includes(basename(directory))) {
          return undefined;
        }
        return searchRecursively(directory, metaDirectory);
      })
    )
  ).filter((filePath): filePath is string => filePath !== undefined);

  return { metadataPaths: metadataPaths.map((path) => resolve(path)), ignorePath };
}

async function searchRecursively(dxDirectory: string, subDirectoryName: string): Promise<string | undefined> {
  const files = await readdir(dxDirectory);

  const searchPromises = files.map(async (file) => {
    const filePath = join(dxDirectory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      if (file === subDirectoryName) {
        return filePath;
      }
      return searchRecursively(filePath, subDirectoryName);
    }
    return undefined;
  });

  const results = await Promise.all(searchPromises);
  return results.find((result): result is string => result !== undefined);
}
