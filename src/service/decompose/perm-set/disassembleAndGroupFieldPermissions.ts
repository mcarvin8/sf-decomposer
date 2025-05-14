/* eslint-disable no-await-in-loop */
import { writeFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseXML, XmlElement } from 'xml-disassembler';

import { FieldPermission } from '../../../helpers/types.js';
import { transformAndCleanup } from '../../core/transformers.js';

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
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      PermissionSet: {
        '@_xmlns': 'http://soap.sforce.com/2006/04/metadata',
        fieldPermissions: perms.map<XmlElement>((perm) => ({
          editable: String(perm.editable ?? 'false'),
          field: perm.field,
          readable: String(perm.readable ?? 'false'),
        })),
      },
    };

    const outPath = join(outputDir, `${objectName}.fieldPermissions.${format}`);
    const outString = await transformAndCleanup(groupedElement, format);
    await writeFile(outPath, outString, 'utf-8');
  }
  await rm(filePath, { force: true });
}
