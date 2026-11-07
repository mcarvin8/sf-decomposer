'use strict';

import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE, TRAILING_NEWLINE_SIDECAR } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleLabels(metadataPath: string, metaSuffix: string, postpurge: boolean): Promise<void> {
  const customLabelsDir = join(metadataPath, 'CustomLabels');
  const shardDirectory = join(customLabelsDir, 'labels');

  // config-disassembler reassembles from `<stem>/<segment>/` (CustomLabels/labels/), but
  // decompose stores label shards flat in the labels directory, so stage them there first.
  await moveFiles(
    metadataPath,
    shardDirectory,
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

  if (!postpurge) {
    // Keep the shards: put them back where decompose left them.
    await moveFiles(shardDirectory, metadataPath, () => true);
  }
  // With postpurge the shards would only be moved back to be deleted again, one file at
  // a time -- thousands of renames and removals for a large org's labels. Removing the
  // staging directory deletes them in place instead. Every file in metadataPath except
  // CustomLabels.labels-meta.xml was moved into it above, so the end state is the same:
  // only the reassembled CustomLabels.labels-meta.xml remains.
  await rm(customLabelsDir, { recursive: true });
}
