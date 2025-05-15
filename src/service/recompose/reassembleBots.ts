'use strict';
/* eslint-disable no-await-in-loop */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { wrapAllFileswithBotRoot } from './wrapAllFileswithBotRoot.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleBots(basePath: string): Promise<void> {
  const children = await readdir(basePath, { withFileTypes: true });

  for (const entry of children) {
    if (!entry.isDirectory()) continue;

    const metadataFolder = join(basePath, entry.name);

    if (!metadataFolder.endsWith('botDialogs')) continue;

    const dialogDirs = await readdir(metadataFolder);
    for (const dialog of dialogDirs) {
      const dialogPath = join(metadataFolder, dialog);
      const subDirs = await readdir(dialogPath, { withFileTypes: true });

      for (const subDir of subDirs) {
        if (subDir.isDirectory()) {
          await reassembleHandler(join(dialogPath, subDir.name), 'xml', true);
        }
      }

      await reassembleHandler(dialogPath, 'xml', true);
    }

    await wrapAllFileswithBotRoot(metadataFolder);
    await reassembleHandler(metadataFolder, 'botVersion-meta.xml', true);
  }
  await reassembleHandler(basePath, 'bot-meta.xml', true);
}
