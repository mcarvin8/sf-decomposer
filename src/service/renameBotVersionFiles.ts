'use strict';
/* eslint-disable no-await-in-loop */
import { lstat, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';

export async function renameBotVersionFile(metadataPath: string): Promise<void> {
  const subDirectories = await readdir(metadataPath);
  for (const subDirectory of subDirectories) {
    const subDirectoryPath = join(metadataPath, subDirectory);

    const stats = await lstat(subDirectoryPath);
    if (stats.isDirectory()) {
      const files = await readdir(subDirectoryPath);
      for (const file of files) {
        // Check if the bot meta file name contains "v" followed by a number
        if (/v\d+\.bot-meta(\..+)?$/.test(file)) {
          const sourcePath = join(subDirectoryPath, file);
          const destinationPath = join(subDirectoryPath, file.replace('bot-meta', 'botVersion-meta'));
          await rename(sourcePath, destinationPath);
        }
      }
    }
  }
}
