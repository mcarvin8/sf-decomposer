'use strict';
/* eslint-disable no-await-in-loop */

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
  const metadataPaths: string[] = [];
  for (const directory of packageDirectories) {
    if (normalizedIgnoreDirs.includes(basename(directory))) {
      continue;
    }
    const filePath: string | undefined = await searchRecursively(directory, metaDirectory);
    if (filePath !== undefined) {
      metadataPaths.push(resolve(filePath));
    }
  }
  return { metadataPaths, ignorePath };
}

async function searchRecursively(dxDirectory: string, subDirectoryName: string): Promise<string | undefined> {
  const files = await readdir(dxDirectory);
  for (const file of files) {
    const filePath = join(dxDirectory, file);
    const stats = await stat(filePath);
    if (stats.isDirectory() && file !== subDirectoryName) {
      const result = await searchRecursively(filePath, subDirectoryName);
      if (result) {
        return result;
      }
    } else if (stats.isDirectory() && file === subDirectoryName) {
      return filePath;
    }
  }
  return undefined;
}
