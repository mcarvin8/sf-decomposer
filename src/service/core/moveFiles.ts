'use strict';

import { copyFile, mkdir, readdir, rename, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';

// The destination directory must already exist (moveFiles creates it once up front).
async function moveFile(source: string, destination: string): Promise<void> {
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
  const toMove = fileStats.filter(({ isFile, shouldMove }) => isFile && shouldMove);
  // Nothing to move: don't create the destination (callers rely on that, e.g. an
  // optional sidecar move must not leave an empty directory behind).
  if (toMove.length === 0) return;

  // Every file lands in the same directory, so create it once rather than issuing a
  // recursive mkdir per file -- custom labels move thousands of shards through here.
  await mkdir(destinationDirectory, { recursive: true });

  const moveLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  await Promise.all(
    toMove.map(({ file }) => moveLimit(() => moveFile(join(sourceDirectory, file), join(destinationDirectory, file)))),
  );
}
