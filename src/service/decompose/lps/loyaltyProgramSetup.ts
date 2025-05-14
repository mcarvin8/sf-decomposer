'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { readdir, writeFile, rm } from 'node:fs/promises';
import { parseXML, DisassembleXMLFileHandler, XmlElement } from 'xml-disassembler';

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
        if (entry.name.includes('programProcesses-meta')) {
          await stripRootAndDisassemble(fullPath, handler, format);
        } else if (dirname(fullPath) !== filePath && format !== 'xml') {
          const xmlContent = await parseXML(fullPath);
          const finalContent = await transformAndCleanup(xmlContent as XmlElement, format);

          const baseName = basename(fullPath, '.xml');
          const newDest = join(dirname(fullPath), `${baseName}.${format}`);
          await writeFile(newDest, finalContent, 'utf-8');

          // Remove the original .xml file
          await rm(fullPath);
        }
      }
    }
  };

  if (existsSync(disassembledDir)) {
    await recursivelyDisassembleLoyaltyProgramSetup(disassembledDir);
  }
}
