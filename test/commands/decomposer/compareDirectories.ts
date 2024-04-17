'use strict';
/* eslint-disable no-await-in-loop */

import { strictEqual } from 'node:assert';
import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

export async function compareDirectories(referenceDir: string, mockDir: string): Promise<void> {
  const entriesinRef = await readdir(referenceDir, { withFileTypes: true });

  // Only compare files that are in the reference directory (composed files)
  // Ignore files only found in the mock directory (decomposed files)
  for (const entry of entriesinRef) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      await compareDirectories(refEntryPath, mockPath);
    } else {
      const refContent = await readFile(refEntryPath, 'utf-8');
      const mockContent = await readFile(mockPath, 'utf-8');
      strictEqual(refContent, mockContent, `File content is different for ${entry.name}`);
    }
  }
}
