'use strict';
/* eslint-disable no-await-in-loop */
import { access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

import { SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';

export async function getRepoRoot(): Promise<{ repoRoot: string | undefined; dxConfigFilePath: string | undefined }> {
  let currentDir = process.cwd();
  let found = false;
  let dxConfigFilePath: string | undefined;
  let repoRoot: string | undefined;

  do {
    const filePath = join(currentDir, SFDX_PROJECT_FILE_NAME);

    try {
      // Check if sfdx-project.json exists in the current directory
      await access(filePath);
      dxConfigFilePath = filePath;
      repoRoot = currentDir;
      found = true;
    } catch {
      // If file not found, move up one directory level
      const parentDir = dirname(currentDir);
      if (currentDir === parentDir) {
        // Reached the root without finding the file, throw an error
        throw new Error('sfdx-project.json not found in any parent directory.');
      }
      currentDir = parentDir;
    }
  } while (!found);
  return { repoRoot, dxConfigFilePath };
}
