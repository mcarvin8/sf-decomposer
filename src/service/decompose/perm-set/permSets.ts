'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { readdir, writeFile, rm } from 'node:fs/promises';
import { parseXML, DisassembleXMLFileHandler, XmlElement } from 'xml-disassembler';

import { transformAndCleanup } from '../../core/transformers.js';
import { disassembleAndGroupFieldPermissions } from './disassembleAndGroupFieldPermissions.js';
import { flattenNestedObjectPermissions } from './flattenNestedObjectPermissions.js';

export async function handleNestedPermissionSetDecomposition(
  filePath: string,
  uniqueIdElements: string,
  handler: DisassembleXMLFileHandler,
  format: string
): Promise<void> {
  const disassembledDir = filePath.replace(/\.xml$/, '');

  const recursivelyDisassembleObjectSettings = async (dir: string): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await recursivelyDisassembleObjectSettings(fullPath);
      } else if (entry.isFile() && entry.name === 'objectPermissions.xml') {
        await handler.disassemble({
          filePath: fullPath,
          uniqueIdElements,
          prePurge: false,
          postPurge: true,
          format: 'xml',
          strategy: 'unique-id',
        });
        await flattenNestedObjectPermissions(dirname(fullPath), format);
      } else if (entry.isFile() && entry.name === 'fieldPermissions.xml') {
        await disassembleAndGroupFieldPermissions(fullPath, format);
      } else if (entry.isFile() && dirname(fullPath) !== filePath && fullPath.endsWith('.xml') && format !== 'xml') {
        const xmlContent = await parseXML(fullPath);
        const finalContent = await transformAndCleanup(xmlContent as XmlElement, format);

        const baseName = basename(fullPath, '.xml');
        const newDest = join(dirname(fullPath), `${baseName}.${format}`);
        await writeFile(newDest, finalContent, 'utf-8');

        // Remove the original .xml file
        await rm(fullPath);
      }
    }
  };

  if (existsSync(disassembledDir)) {
    await recursivelyDisassembleObjectSettings(disassembledDir);
  }
}
