'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { wrapAllFilesWithLoyaltyRoot } from './wrapAllFilesWithLoyaltyRoot.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleLoyaltyProgramSetup(basePath: string): Promise<void> {
  const children = await readdir(basePath, { withFileTypes: true });

  for (const entry of children) {
    if (!entry.isDirectory()) continue;

    const metadataFolder = join(basePath, entry.name);
    const programProcessesPath = join(metadataFolder, 'programProcesses');

    if (!existsSync(programProcessesPath)) continue;

    const processDirs = await readdir(programProcessesPath);
    for (const process of processDirs) {
      const processPath = join(programProcessesPath, process);
      const subDirs = await readdir(processPath, { withFileTypes: true });

      for (const subDir of subDirs) {
        if (subDir.isDirectory()) {
          await reassembleHandler(join(processPath, subDir.name), 'xml', true);
        }
      }

      await reassembleHandler(processPath, 'xml', true);
    }

    await wrapAllFilesWithLoyaltyRoot(programProcessesPath);
    await reassembleHandler(metadataFolder, 'loyaltyProgramSetup-meta.xml', true);
  }
}
