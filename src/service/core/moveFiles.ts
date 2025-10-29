'use strict';

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { move } from 'fs-extra';

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean
): Promise<void> {
  const files = await readdir(sourceDirectory);

  const fileStats = await Promise.all(
    files.map(async (file) => ({
      file,
      isFile: (await stat(join(sourceDirectory, file))).isFile(),
      shouldMove: predicate(file),
    }))
  );

  await Promise.all(
    fileStats
      .filter(({ isFile, shouldMove }) => isFile && shouldMove)
      .map(({ file }) => {
        const sourceFile = join(sourceDirectory, file);
        const destinationFile = join(destinationDirectory, file);
        return move(sourceFile, destinationFile, { overwrite: true });
      })
  );
}
