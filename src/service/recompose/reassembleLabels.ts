'use strict';

import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE, LABEL_SIDECARS } from '../../helpers/constants.js';
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
    (fileName) => fileName !== CUSTOM_LABELS_FILE && !LABEL_SIDECARS.includes(fileName),
  );

  // The sidecars (trailing newline, label order -- rescued to metadataPath during decompose,
  // see moveAndRenameLabels in customLabels.ts) belong in the "CustomLabels" stem directory
  // itself, sibling to the "labels" shard subdirectory, not inside it -- that's where
  // config-disassembler's reassemble() looks for them, matching how it wrote them for every
  // other metadata type's single-level disassembly.
  await moveFiles(metadataPath, customLabelsDir, (fileName) => LABEL_SIDECARS.includes(fileName));

  // do not use postpurge flag due to file moving
  await reassembleHandler(customLabelsDir, `${metaSuffix}-meta.xml`, false);

  if (!postpurge) {
    // Keep the decomposed state: put the shards and sidecars back where decompose left them.
    await moveFiles(shardDirectory, metadataPath, () => true);
    await moveFiles(customLabelsDir, metadataPath, (fileName) => LABEL_SIDECARS.includes(fileName));
  }
  // With postpurge the shards would only be moved back to be deleted again, one file at
  // a time -- thousands of renames and removals for a large org's labels. Removing the
  // staging directory deletes them in place instead. Every file in metadataPath except
  // CustomLabels.labels-meta.xml was moved into it above, so the end state is the same:
  // only the reassembled CustomLabels.labels-meta.xml remains.
  await rm(customLabelsDir, { recursive: true });
}
