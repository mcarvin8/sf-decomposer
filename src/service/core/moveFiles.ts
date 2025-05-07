'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { move } from 'fs-extra';

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean
): Promise<void> {
  const files = await readdir(sourceDirectory);
  for (const file of files) {
    const fileStat = await stat(join(sourceDirectory, file));
    if (fileStat.isFile() && predicate(file)) {
      const sourceFile = join(sourceDirectory, file);
      const destinationFile = join(destinationDirectory, file);
      await move(sourceFile, destinationFile, { overwrite: true });
    }
  }
}
