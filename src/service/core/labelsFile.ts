'use strict';

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { CUSTOM_LABELS_FILE, LABELS_FILE_SIDECAR, LABELS_META_ENDING } from '../../helpers/constants.js';

/** Decomposed label files are renamed from `.labels-meta.<ext>` to `.label-meta.<ext>`. */
export function isLabelShard(fileName: string): boolean {
  return fileName.includes('.label-meta.');
}

/**
 * The CustomLabels file in `dir`, under any name (`CustomLabels.labels-meta.xml`,
 * `fflib-Apex-Common-CustomLabels.labels-meta.xml`, ...), or `undefined` when there is none.
 * Throws when there are several: decomposed labels are stored flat in the directory, so labels from
 * two files there could not be told apart on recompose.
 */
export async function findLabelsFile(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });
  const names = entries.filter((e) => e.isFile() && e.name.endsWith(LABELS_META_ENDING)).map((e) => e.name);
  if (names.length > 1) {
    throw new Error(
      `Found more than one labels file in ${dir} (${names.sort().join(', ')}). Decomposed labels are stored flat in their directory, so only one labels file per directory is supported.`,
    );
  }
  return names[0];
}

/** Records a non-default labels file name for recompose; the default needs no record. */
export async function writeLabelsFileName(dir: string, fileName: string): Promise<void> {
  if (fileName === CUSTOM_LABELS_FILE) return;
  await writeFile(join(dir, LABELS_FILE_SIDECAR), JSON.stringify(fileName));
}

/** The labels file name recorded by decompose, defaulting to `CustomLabels.labels-meta.xml`. */
export async function readLabelsFileName(dir: string): Promise<string> {
  try {
    const name = JSON.parse(await readFile(join(dir, LABELS_FILE_SIDECAR), 'utf-8')) as unknown;
    if (typeof name === 'string' && name.endsWith(LABELS_META_ENDING) && !/[\\/]/.test(name)) return name;
  } catch {
    // No record: the default name.
  }
  return CUSTOM_LABELS_FILE;
}

/** `fflib-Apex-Common-CustomLabels.labels-meta.xml` -> `fflib-Apex-Common-CustomLabels`. */
export function labelsFileStem(fileName: string): string {
  return fileName.slice(0, -LABELS_META_ENDING.length);
}
