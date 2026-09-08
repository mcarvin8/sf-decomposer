'use strict';

import { readFile, rm, writeFile } from 'node:fs/promises';
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

  // config-disassembler's reassemble() drops the final trailing newline for this
  // double-nested-directory path (CustomLabels/labels/*), unlike every other metadata
  // type's single-level reassembly. Restore it so CustomLabels round-trips byte-for-byte
  // like everything else, rather than silently losing 1 byte on every recompose.
  const assembledPath = join(metadataPath, CUSTOM_LABELS_FILE);
  const assembled = await readFile(assembledPath, 'utf8');
  if (!assembled.endsWith('\n')) await writeFile(assembledPath, `${assembled}\n`, 'utf8');

  sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
  if (postpurge) await deleteFilesInDirectory(destinationDirectory);
}
