'use strict';
/* eslint-disable no-await-in-loop */
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';
import { deleteFilesInDirectory } from './deleteFilesinDirectory.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleLabels(metadataPath: string, metaSuffix: string, postpurge: boolean): Promise<void> {
  let sourceDirectory = metadataPath;
  let destinationDirectory = join(metadataPath, 'CustomLabels', 'labels');

  await moveFiles(sourceDirectory, destinationDirectory, (fileName) => fileName !== CUSTOM_LABELS_FILE);

  // do not use postpurge flag due to file moving
  await reassembleHandler(join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`, false);

  sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
  if (postpurge) await deleteFilesInDirectory(destinationDirectory);
}
