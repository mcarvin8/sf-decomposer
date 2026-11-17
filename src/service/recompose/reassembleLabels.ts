'use strict';

import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { LABEL_SIDECARS, LABELS_FILE_SIDECAR } from '../../helpers/constants.js';
import { isLabelShard, labelsFileStem, readLabelsFileName } from '../core/labelsFile.js';
import { moveFiles } from '../core/moveFiles.js';
import { reassembleHandler } from './recomposeFileHandler.js';

export async function reassembleLabels(metadataPath: string, metaSuffix: string, postpurge: boolean): Promise<void> {
  const entries = await readdir(metadataPath, { withFileTypes: true });
  // Nothing decomposed here: leave the directory (and any labels file in it) alone.
  if (!entries.some((entry) => entry.isFile() && isLabelShard(entry.name))) return;

  // Rebuild the file decompose came from: `CustomLabels.labels-meta.xml` unless another name was
  // recorded (any `<name>.labels-meta.xml` is a CustomLabels file).
  const labelsFileName = await readLabelsFileName(metadataPath);
  const stemDirectory = join(metadataPath, labelsFileStem(labelsFileName));
  const shardDirectory = join(stemDirectory, 'labels');

  // config-disassembler reassembles from `<stem>/<segment>/` (e.g. CustomLabels/labels/), but
  // decompose stores label shards flat in the labels directory, so stage them there first. Only the
  // label files move: anything else in the directory is not ours to rebuild or delete.
  await moveFiles(metadataPath, shardDirectory, isLabelShard);

  // The sidecars (trailing newline, label order -- rescued to metadataPath during decompose,
  // see moveAndRenameLabels in customLabels.ts) belong in the stem directory itself, sibling to
  // the "labels" shard subdirectory, not inside it -- that's where config-disassembler's
  // reassemble() looks for them, matching how it wrote them for every other metadata type's
  // single-level disassembly.
  await moveFiles(metadataPath, stemDirectory, (fileName) => LABEL_SIDECARS.includes(fileName));

  // do not use postpurge flag due to file moving
  await reassembleHandler(stemDirectory, `${metaSuffix}-meta.xml`, false);

  if (!postpurge) {
    // Keep the decomposed state: put the shards and sidecars back where decompose left them.
    await moveFiles(shardDirectory, metadataPath, () => true);
    await moveFiles(stemDirectory, metadataPath, (fileName) => LABEL_SIDECARS.includes(fileName));
  } else {
    // The file-name record goes with the rest of the decomposed state.
    await rm(join(metadataPath, LABELS_FILE_SIDECAR), { force: true });
  }
  // With postpurge the shards would only be moved back to be deleted again, one file at
  // a time -- thousands of renames and removals for a large org's labels. Removing the
  // staging directory deletes them in place instead.
  await rm(stemDirectory, { recursive: true });
}
