/* eslint-disable no-await-in-loop */
import { writeFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { buildXMLString, parseXML, XmlElement } from 'xml-disassembler';

import { XML_DECLARATION } from '../../helpers/constants.js';
import { FieldPermission } from '../../helpers/types.js';
import { transformAndCleanup } from '../core/transformers.js';

export async function disassembleAndGroupFieldPermissions(filePath: string, format: string): Promise<void> {
  const parsed = await parseXML(filePath);

  // this won't disassemble if there's only 1 field permission in the file
  const fieldPermissions = parsed?.PermissionSet?.fieldPermissions as FieldPermission[] | undefined;
  if (!fieldPermissions || !Array.isArray(fieldPermissions)) {
    return;
  }

  const groupedByObject: Record<string, FieldPermission[]> = {};

  for (const perm of fieldPermissions) {
    const fieldValue = perm?.field;
    if (typeof fieldValue !== 'string') continue;

    const objectName = fieldValue.split('.')[0];
    if (!groupedByObject[objectName]) {
      groupedByObject[objectName] = [];
    }

    groupedByObject[objectName].push(perm);
  }

  const outputDir = filePath.replace(/\.xml$/, '');
  await mkdir(outputDir, { recursive: true });

  for (const [objectName, perms] of Object.entries(groupedByObject)) {
    const groupedElement: XmlElement = {
      PermissionSet: {
        '@_xmlns': 'http://soap.sforce.com/2006/04/metadata',
        fieldPermissions: perms.map<XmlElement>((perm) => ({
          editable: String(perm.editable ?? 'false'),
          field: perm.field,
          readable: String(perm.readable ?? 'false'),
        })),
      },
    };

    const xmlString = buildXMLString(groupedElement);
    const outPath = join(outputDir, `${objectName}.fieldPermissions.xml`);
    await writeFile(outPath, `${XML_DECLARATION}\n${xmlString}`, 'utf-8');
    await transformAndCleanup(outPath, format);
  }
  await rm(filePath, { force: true });
}
