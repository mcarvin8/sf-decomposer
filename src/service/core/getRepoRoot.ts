'use strict';
import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { SFDX_PROJECT_FILE_NAME } from '../../helpers/constants.js';

async function findRepoRoot(
  dir: string,
): Promise<{ repoRoot: string | undefined; dxConfigFilePath: string | undefined }> {
  const filePath = join(dir, SFDX_PROJECT_FILE_NAME);
  try {
    // Check if sfdx-project.json exists in the current directory
    await access(filePath);
    return { repoRoot: dir, dxConfigFilePath: filePath };
  } catch (err) {
    const parentDir = dirname(dir);
    if (dir === parentDir) {
      // Reached the root without finding the file, throw an error
      throw new Error(`${SFDX_PROJECT_FILE_NAME} not found in any parent directory.`, { cause: err });
    }
    // Recursively search in the parent directory
    return findRepoRoot(parentDir);
  }
}

export async function getRepoRoot(): Promise<{ repoRoot: string | undefined; dxConfigFilePath: string | undefined }> {
  const currentDir = process.cwd();
  return findRepoRoot(currentDir);
}
