'use strict';
/* eslint-disable no-await-in-loop */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as fsextra from 'fs-extra';

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean
): Promise<void> {
  const files = await fs.readdir(sourceDirectory);
  for (const file of files) {
    const fileStat = await fs.stat(path.join(sourceDirectory, file));
    if (fileStat.isFile() && predicate(file)) {
      const sourceFile = path.join(sourceDirectory, file);
      const destinationFile = path.join(destinationDirectory, file);
      await fsextra.move(sourceFile, destinationFile, { overwrite: true });
    }
  }
}
