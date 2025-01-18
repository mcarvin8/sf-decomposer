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
  const moveFilePromises = files.map(async (file) => {
    const sourceFile = join(sourceDirectory, file);
    const fileStat = await stat(sourceFile);
    if (fileStat.isFile() && predicate(file)) {
      const destinationFile = join(destinationDirectory, file);
      await move(sourceFile, destinationFile, { overwrite: true });
    }
  });
  await Promise.all(moveFilePromises);
}
