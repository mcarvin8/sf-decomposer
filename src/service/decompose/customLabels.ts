/* eslint-disable no-await-in-loop */
'use strict';

import { readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CONCURRENCY_LIMITS,
  ELEMENT_ORDER_SIDECAR,
  LABEL_SIDECARS,
  LABELS_FILE_SIDECAR,
} from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';
import { isLabelShard, labelsFileStem, writeLabelsFileName } from '../core/labelsFile.js';
import { moveFiles } from '../core/moveFiles.js';

/**
 * Removes a previous decompose's output: the flat label files and their sidecars. Other files in
 * the directory -- the labels file itself, whatever its name -- are left alone.
 */
export async function prePurgeLabels(metadataPath: string): Promise<void> {
  const subFiles = await readdir(metadataPath);
  for (const subFile of subFiles) {
    const subfilePath = join(metadataPath, subFile);
    const isDecomposeOutput =
      isLabelShard(subFile) || LABEL_SIDECARS.includes(subFile) || subFile === LABELS_FILE_SIDECAR;
    if (isDecomposeOutput && (await stat(subfilePath)).isFile()) {
      await rm(subfilePath);
    }
  }
}

/**
 * Flattens the shards config-disassembler wrote to `<stem>/labels/` into the labels directory as
 * `.label-meta.<ext>` files, rescues its sidecars, and records the labels file's name when it isn't
 * the default so recompose rebuilds the same file.
 */
export async function moveAndRenameLabels(metadataPath: string, labelsFileName: string): Promise<void> {
  const stemDirectory = join(metadataPath, labelsFileStem(labelsFileName));
  const sourceDirectory = join(stemDirectory, 'labels');
  const destinationDirectory = metadataPath;
  let labelFiles: string[];
  try {
    labelFiles = await readdir(sourceDirectory);
  } catch {
    // config-disassembler skipped the file (e.g. comments it can't keep in place, or no labels)
    // and wrote nothing: it is left as it was, so there is nothing to move. Throwing here used to
    // abort the whole labels run, stranding other labels directories half-decomposed.
    return;
  }

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

  // config-disassembler wrote its sidecars in the stem directory itself (sibling to the "labels"
  // shard subdirectory we just emptied above), not inside it -- rescue them before the rm()
  // below destroys them, so reassembleLabels can hand them back to reassemble(): the trailing
  // newline and the labels' original order then round-trip like every other metadata type's.
  await renameLabelsInElementOrder(join(stemDirectory, ELEMENT_ORDER_SIDECAR));
  await moveFiles(stemDirectory, destinationDirectory, (fileName) => LABEL_SIDECARS.includes(fileName));

  await rm(stemDirectory, { recursive: true });
  await writeLabelsFileName(metadataPath, labelsFileName);
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
