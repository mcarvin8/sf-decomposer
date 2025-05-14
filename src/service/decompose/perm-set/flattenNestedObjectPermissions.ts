'use strict';
/* eslint-disable no-await-in-loop */
import { join, extname, basename } from 'node:path';
import { readdir, rm, rename, writeFile } from 'node:fs/promises';
import { parseXML, XmlElement } from 'xml-disassembler';

import { transformAndCleanup } from '../../core/transformers.js';

export async function flattenNestedObjectPermissions(disassembledDir: string, format: string): Promise<void> {
  const outerDir = join(disassembledDir, 'objectPermissions');
  const nestedDir = join(outerDir, 'objectPermissions');

  const nestedFiles = await readdir(nestedDir);
  for (const file of nestedFiles) {
    const src = join(nestedDir, file);
    const dest = join(outerDir, file);
    await rename(src, dest);

    if (format !== 'xml') {
      const xmlContent = await parseXML(dest);
      const finalContent = await transformAndCleanup(xmlContent as XmlElement, format);

      const baseName = basename(file, extname(file)); // remove .xml
      const newDest = join(outerDir, `${baseName}.${format}`);
      await writeFile(newDest, finalContent, 'utf-8');

      // Remove the original .xml file
      await rm(dest);
    }
  }

  // Remove the now-empty nested folder
  await rm(nestedDir, { recursive: true, force: true });
}
