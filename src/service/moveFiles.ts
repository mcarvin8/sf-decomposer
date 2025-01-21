'use strict';

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { move } from 'fs-extra';
import { withConcurrencyLimit } from 'xml-disassembler';

export async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  concurrencyLimit: number,
  predicate: (fileName: string) => boolean
): Promise<void> {
  const files = await readdir(sourceDirectory);

  await withConcurrencyLimit(
    files.map((file) => async () => {
      const sourceFile = join(sourceDirectory, file);
      const fileStat = await stat(sourceFile);
      if (fileStat.isFile() && predicate(file)) {
        const destinationFile = join(destinationDirectory, file);
        await move(sourceFile, destinationFile, { overwrite: true });
      }
    }),
    concurrencyLimit
  );
}
