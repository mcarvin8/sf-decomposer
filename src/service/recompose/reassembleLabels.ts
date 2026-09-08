'use strict';

import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE, TRAILING_NEWLINE_SIDECAR } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';
import { deleteFilesInDirectory } from './deleteFilesinDirectory.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleLabels(metadataPath: string, metaSuffix: string, postpurge: boolean): Promise<void> {
  const customLabelsDir = join(metadataPath, 'CustomLabels');
  let sourceDirectory = metadataPath;
  let destinationDirectory = join(customLabelsDir, 'labels');

  await moveFiles(
    sourceDirectory,
    destinationDirectory,
    (fileName) => fileName !== CUSTOM_LABELS_FILE && fileName !== TRAILING_NEWLINE_SIDECAR,
  );

  // The trailing-newline sidecar (rescued to metadataPath during decompose -- see
  // moveAndRenameLabels in customLabels.ts) belongs in the "CustomLabels" stem directory
  // itself, sibling to the "labels" shard subdirectory, not inside it -- that's where
  // config-disassembler's reassemble() looks for it, matching how it wrote the sidecar
  // for every other metadata type's single-level disassembly.
  await moveFiles(metadataPath, customLabelsDir, (fileName) => fileName === TRAILING_NEWLINE_SIDECAR);

  // do not use postpurge flag due to file moving
  await reassembleHandler(customLabelsDir, `${metaSuffix}-meta.xml`, false);

  sourceDirectory = join(customLabelsDir, 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  await rm(customLabelsDir, { recursive: true });
  if (postpurge) await deleteFilesInDirectory(destinationDirectory);
}
