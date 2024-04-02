'use strict';
/* eslint-disable no-await-in-loop */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as promises from 'node:fs/promises';

interface SfdxProject {
  packageDirectories: Array<{ path: string }>;
}

export async function getPackageDirectories(dxConfigFile: string, metaDirectory: string): Promise<string[]> {
  const dxConfigPath = path.resolve(dxConfigFile);
  if (!fs.existsSync(dxConfigPath)) {
    throw Error(`Salesforce DX Config File does not exist in this path: ${dxConfigPath}`);
  }

  const sfdxProjectRaw: string = await promises.readFile(dxConfigPath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;
  const packageDirectories = sfdxProject.packageDirectories.map((directory) => directory.path);
  const metadataPaths: string[] = [];
  for (const directory of packageDirectories) {
    const filePath: string | undefined = await searchRecursively(directory, metaDirectory);
    if (filePath !== undefined) {
      metadataPaths.push(path.resolve(filePath));
    }
  }
  return metadataPaths;
}

async function searchRecursively(dxDirectory: string, subDirectoryName: string): Promise<string | undefined> {
  const files = await promises.readdir(dxDirectory);
  for (const file of files) {
    const filePath = path.join(dxDirectory, file);
    const stats = await promises.stat(filePath);
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
