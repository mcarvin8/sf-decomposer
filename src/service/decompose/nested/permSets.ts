'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readdir } from 'node:fs/promises';
import { DisassembleXMLFileHandler } from 'xml-disassembler';

import { disassembleAndGroupFieldPermissions } from '../disassembleAndGroupFieldPermissions.js';
import { flattenNestedObjectPermissions } from '../flattenNestedObjectPermissions.js';
import { transformAndCleanup } from '../../core/transformers.js';

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
      } else if (entry.isFile() && dirname(fullPath) !== filePath && fullPath.endsWith('.xml')) {
        await transformAndCleanup(fullPath, format);
      }
    }
  };

  if (existsSync(disassembledDir)) {
    await recursivelyDisassembleObjectSettings(disassembledDir);
  }
}
