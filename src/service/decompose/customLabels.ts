/* eslint-disable no-await-in-loop */
'use strict';

import { join } from 'node:path';
import { readdir, stat, rm, rename } from 'node:fs/promises';
import pLimit from 'p-limit';

import { CUSTOM_LABELS_FILE, CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';

export async function prePurgeLabels(metadataPath: string): Promise<void> {
  const subFiles = await readdir(metadataPath);
  for (const subFile of subFiles) {
    const subfilePath = join(metadataPath, subFile);
    if ((await stat(subfilePath)).isFile() && subFile !== CUSTOM_LABELS_FILE) {
      await rm(subfilePath, { recursive: true });
    }
  }
}

export async function moveAndRenameLabels(metadataPath: string): Promise<void> {
  const sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  const destinationDirectory = metadataPath;
  const labelFiles = await readdir(sourceDirectory);

  // Limit concurrent file operations to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);

  const tasks = labelFiles
    .filter((file) => file.includes('.labels-meta'))
    .map((file) =>
      limit(async () => {
        const oldFilePath = join(sourceDirectory, file);
        const newFileName = file.replace('.labels-meta', '.label-meta');
        const newFilePath = join(destinationDirectory, newFileName);
        await rename(oldFilePath, newFilePath);
      })
    );

  await Promise.all(tasks);

  // istanbul ignore next -- callback only invoked if non-label files exist after rename
  await moveFiles(sourceDirectory, destinationDirectory, () => true);
  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
}
