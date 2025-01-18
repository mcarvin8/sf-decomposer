'use strict';
import { lstat, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';

export async function renameBotVersionFile(metadataPath: string): Promise<void> {
  const subDirectories = await readdir(metadataPath);

  // Process all subdirectories concurrently
  await Promise.all(
    subDirectories.map(async (subDirectory) => {
      const subDirectoryPath = join(metadataPath, subDirectory);

      const stats = await lstat(subDirectoryPath);
      if (stats.isDirectory()) {
        const files = await readdir(subDirectoryPath);

        // Process all files concurrently
        await Promise.all(
          files.map(async (file) => {
            // Check if the bot meta file name contains "v" followed by a number
            if (/v\d+\.bot-meta\.xml$/.test(file)) {
              const sourcePath = join(subDirectoryPath, file);
              const destinationPath = join(subDirectoryPath, file.replace('bot-meta.xml', 'botVersion-meta.xml'));
              await rename(sourcePath, destinationPath);
            }
          })
        );
      }
    })
  );
}
