'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE } from '../../helpers/constants.js';

export async function deleteFilesInDirectory(directory: string): Promise<void> {
  const files = await readdir(directory);
  for (const file of files) {
    const filePath = join(directory, file);
    const fileStat = await stat(filePath);
    if (fileStat.isFile() && file !== CUSTOM_LABELS_FILE) {
      await rm(filePath);
    }
  }
}
