'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readdir } from 'node:fs/promises';
import { DisassembleXMLFileHandler } from 'xml-disassembler';

import { transformAndCleanup } from '../../core/transformers.js';
import { stripRootAndDisassemble } from './stripRootAndDisassemble.js';

export async function handleNestedLoyaltyProgramSetupDecomposition(
  filePath: string,
  handler: DisassembleXMLFileHandler,
  format: string
): Promise<void> {
  const disassembledDir = filePath.replace(/\.xml$/, '');

  const recursivelyDisassembleLoyaltyProgramSetup = async (dir: string): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await recursivelyDisassembleLoyaltyProgramSetup(fullPath);
      } else if (entry.isFile() && fullPath.endsWith('.xml')) {
        // Add conditional handling for loyalty program-related nested files
        if (entry.name.includes('programProcesses-meta')) {
          await stripRootAndDisassemble(fullPath, handler, format);
        } else if (dirname(fullPath) !== filePath) {
          await transformAndCleanup(fullPath, format);
        }
      }
    }
  };

  if (existsSync(disassembledDir)) {
    await recursivelyDisassembleLoyaltyProgramSetup(disassembledDir);
  }
}
