'use strict';
/* eslint-disable no-await-in-loop */
import * as promises from 'node:fs/promises';
import * as path from 'node:path';

// fix bot version meta file names
export async function renameBotVersionFile(metadataPath: string): Promise<void> {
  const subDirectories = await promises.readdir(metadataPath);
  for (const subDirectory of subDirectories) {
    const subDirectoryPath = path.join(metadataPath, subDirectory);

    const stats = await promises.lstat(subDirectoryPath);
    if (stats.isDirectory()) {
      const files = await promises.readdir(subDirectoryPath);
      for (const file of files) {
        // Check if the bot meta file name contains "v" followed by a number
        if (/v\d+\.bot-meta\.xml$/.test(file)) {
          const sourcePath = path.join(subDirectoryPath, file);
          const destinationPath = path.join(subDirectoryPath, file.replace('bot-meta.xml', 'botVersion-meta.xml'));
          await promises.rename(sourcePath, destinationPath);
        }
      }
    }
  }
}
