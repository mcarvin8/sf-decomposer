'use strict';
/* eslint-disable no-await-in-loop */

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';

interface SfdxProject {
  packageDirectories: Array<{ path: string }>;
}

export async function getPackageDirectories(dxConfigFile: string, metaDirectory: string): Promise<string[]> {
  const dxConfigPath = resolve(dxConfigFile);
  if (!existsSync(dxConfigPath)) {
    throw Error(`Salesforce DX Config File does not exist in this path: ${dxConfigPath}`);
  }

  const sfdxProjectRaw: string = await readFile(dxConfigPath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const packageDirectories = sfdxProject.packageDirectories.map((directory) => directory.path);
  const metadataPaths: string[] = [];
  for (const directory of packageDirectories) {
    const filePath: string | undefined = await searchRecursively(directory, metaDirectory);
    if (filePath !== undefined) {
      metadataPaths.push(resolve(filePath));
    }
  }
  return metadataPaths;
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
