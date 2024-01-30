'use strict';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { INDENT } from '../helpers/constants.js';
import { xml2jsParser } from './xml2jsParser.js';

export function decomposeFileHandler(
  metadataPath: string,
  metaSuffix: string,
  fieldNames: string,
  xmlElement: string
): void {
  const files = fs.readdirSync(metadataPath);
  files.forEach((file) => {
    const filePath = path.join(metadataPath, file);
    if (file.endsWith(`.${metaSuffix}-meta.xml`)) {
      // console.log(`Parsing metadata file: ${filePath}`);
      const xmlContent = fs.readFileSync(filePath, 'utf-8');
      const baseName = path.basename(filePath, `.${metaSuffix}-meta.xml`);
      const outputPath = path.join(metadataPath, metaSuffix === 'labels' ? '' : baseName);
      xml2jsParser(xmlContent, outputPath, fieldNames, xmlElement, baseName, metaSuffix, INDENT);
    }
  });
}
