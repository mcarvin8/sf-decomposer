'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parseXML, buildXMLString, XmlElement } from 'xml-disassembler';
import { XML_DECLARATION } from '../../helpers/constants.js';

function stripXmlDeclarationFromString(xml: string): string {
  return xml.replace(/<\?xml.*?\?>\s*/g, '').trim();
}

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

    const wrapped: XmlElement = {
      LoyaltyProgramSetup: {
        '@_xmlns': 'http://soap.sforce.com/2006/04/metadata',
        ...parsed,
      },
    };

    const xmlString = buildXMLString(wrapped, 0);
    const cleanXmlString = stripXmlDeclarationFromString(xmlString);
    await writeFile(xmlPath, `${XML_DECLARATION}\n${cleanXmlString}`, 'utf-8');
  }
}
