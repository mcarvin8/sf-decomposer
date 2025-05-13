'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parseXML, buildXMLString, XmlElement } from 'xml-disassembler';

export async function wrapAllFilesWithLoyaltyRoot(folderPath: string): Promise<void> {
  const files = await readdir(folderPath);

  for (const file of files) {
    if (!file.endsWith('.xml')) continue;

    const xmlPath = join(folderPath, file);
    const statResult = await stat(xmlPath);
    if (!statResult.isFile()) continue;

    const parsed = await parseXML(xmlPath);
    if (!parsed || typeof parsed !== 'object') continue;

    if ('LoyaltyProgramSetup' in parsed) {
      // Already wrapped
      continue;
    }

    // Remove '?xml' declaration if it exists
    const rootKey = Object.keys(parsed).find(k => k !== '?xml');
    if (!rootKey) continue;

    const wrapped: XmlElement = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      LoyaltyProgramSetup: {
        '@_xmlns': 'http://soap.sforce.com/2006/04/metadata',
        [rootKey]: parsed[rootKey],
      },
    };

    const xmlString = buildXMLString(wrapped);
    await writeFile(xmlPath, xmlString, 'utf-8');
  }
}
