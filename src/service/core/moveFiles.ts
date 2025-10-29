'use strict';

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { move } from 'fs-extra';
import pLimit from 'p-limit';
import { CONCURRENCY_LIMITS } from '../../helpers/constants.js';

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean
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
      }))
    )
  );

  // Limit concurrent file move operations
  const moveLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const moveTasks = fileStats
    .filter(({ isFile, shouldMove }) => isFile && shouldMove)
    .map(({ file }) =>
      moveLimit(() => {
        const sourceFile = join(sourceDirectory, file);
        const destinationFile = join(destinationDirectory, file);
        return move(sourceFile, destinationFile, { overwrite: true });
      })
    );

  await Promise.all(moveTasks);
}
