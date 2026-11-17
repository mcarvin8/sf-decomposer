/* eslint-disable no-await-in-loop */
'use strict';

import { readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CONCURRENCY_LIMITS,
  CUSTOM_LABELS_FILE,
  ELEMENT_ORDER_SIDECAR,
  LABEL_SIDECARS,
} from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';
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
      }),
    );

  await Promise.all(tasks);

  // istanbul ignore next -- callback only invoked if non-label files exist after rename
  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  // config-disassembler wrote its sidecars in the "CustomLabels" stem directory itself
  // (sibling to the "labels" shard subdirectory we just emptied above), not inside it --
  // rescue them before the rm() below destroys them, so reassembleLabels can hand them back
  // to reassemble(): the trailing newline and the labels' original order then round-trip
  // like every other metadata type's.
  const stemDirectory = join(metadataPath, 'CustomLabels');
  await renameLabelsInElementOrder(join(stemDirectory, ELEMENT_ORDER_SIDECAR));
  await moveFiles(stemDirectory, destinationDirectory, (fileName) => LABEL_SIDECARS.includes(fileName));

  await rm(stemDirectory, { recursive: true });
}

/**
 * The order file names each label shard as written (`labels/<name>.labels-meta.xml`), but the
 * shards are renamed to `.label-meta.xml` above and are staged back under `labels/` with that name
 * on recompose, so rename the entries to match. Missing file (no repeated labels): nothing to do.
 */
async function renameLabelsInElementOrder(orderFile: string): Promise<void> {
  let content: string;
  try {
    content = await readFile(orderFile, 'utf-8');
  } catch {
    return;
  }
  await writeFile(orderFile, content.replaceAll('.labels-meta.', '.label-meta.'));
}
