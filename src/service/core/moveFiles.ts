'use strict';

import { copyFile, mkdir, readdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';

async function moveFile(source: string, destination: string): Promise<void> {
  await mkdir(dirname(destination), { recursive: true });
  try {
    await rename(source, destination);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    // EXDEV: cross-device rename. EPERM/EEXIST: Windows rename when destination exists.
    if (code === 'EXDEV' || code === 'EPERM' || code === 'EEXIST') {
      await copyFile(source, destination);
      await unlink(source);
    } else {
      throw err;
    }
  }
}

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean,
): Promise<void> {
  const files = await readdir(sourceDirectory);

  // Limit concurrent stat operations
  const statLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const fileStats = await Promise.all(
    files.map((file) =>
      statLimit(async () => ({
        file,
        isFile: (await stat(join(sourceDirectory, file))).isFile(),
        shouldMove: predicate(file),
      })),
    ),
  );

  // Limit concurrent file move operations
  const moveLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const moveTasks = fileStats
    .filter(({ isFile, shouldMove }) => isFile && shouldMove)
    .map(({ file }) => moveLimit(() => moveFile(join(sourceDirectory, file), join(destinationDirectory, file))));

  await Promise.all(moveTasks);
}
