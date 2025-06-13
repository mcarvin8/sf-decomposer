'use strict';

import { resolve, join, basename } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';

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
  const files = await readdir(dxDirectory);

  const searchPromises = files.map(async (file) => {
    const filePath = join(dxDirectory, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      if (file === subDirectoryName) {
        return filePath;
      } else {
        return searchRecursively(filePath, subDirectoryName);
      }
    }
  });

  const results = await Promise.all(searchPromises);
  return results.find((result) => result !== undefined);
}
