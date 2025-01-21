'use strict';
import { lstat, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { withConcurrencyLimit } from 'xml-disassembler';

export async function renameBotVersionFile(metadataPath: string, concurrencyLimit: number): Promise<void> {
  const subDirectories = await readdir(metadataPath);

  // Process subdirectories with controlled concurrency
  await withConcurrencyLimit(
    subDirectories.map((subDirectory) => async () => {
      const subDirectoryPath = join(metadataPath, subDirectory);
      const stats = await lstat(subDirectoryPath);

      if (stats.isDirectory()) {
        const files = await readdir(subDirectoryPath);

        // Process files within the subdirectory with controlled concurrency
        await withConcurrencyLimit(
          files.map((file) => async () => {
            // Check if the bot meta file name contains "v" followed by a number
            if (/v\d+\.bot-meta\.xml$/.test(file)) {
              const sourcePath = join(subDirectoryPath, file);
              const destinationPath = join(subDirectoryPath, file.replace('bot-meta.xml', 'botVersion-meta.xml'));
              await rename(sourcePath, destinationPath);
            }
          }),
          concurrencyLimit
        );
      }
    }),
    concurrencyLimit
  );
}
