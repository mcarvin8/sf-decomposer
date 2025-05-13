'use strict';
/* eslint-disable no-await-in-loop */
import { join } from 'node:path';
import { readdir, rm, rename } from 'node:fs/promises';

import { transformAndCleanup } from '../../core/transformers.js';

export async function flattenNestedObjectPermissions(disassembledDir: string, format: string): Promise<void> {
  const outerDir = join(disassembledDir, 'objectPermissions');
  const nestedDir = join(outerDir, 'objectPermissions');

  const nestedFiles = await readdir(nestedDir);
  for (const file of nestedFiles) {
    const src = join(nestedDir, file);
    const dest = join(outerDir, file);
    await rename(src, dest);
    await transformAndCleanup(dest, format);
  }

  // Remove the now-empty nested folder
  await rm(nestedDir, { recursive: true, force: true });
}
