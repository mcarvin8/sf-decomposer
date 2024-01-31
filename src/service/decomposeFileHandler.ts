'use strict';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { INDENT } from '../helpers/constants.js';
import { xml2jsParser } from './xml2jsParser.js';

export function decomposeFileHandler(
  metadataPath: string,
  metaSuffix: string,
  fieldNames: string,
  xmlElement: string,
  recurse: boolean = false
): void {
  const files = fs.readdirSync(metadataPath);
  files.forEach((file) => {
    const filePath = path.join(metadataPath, file);
    if (recurse) {
      // If recurse is true and the current file is a directory, iterate through it
      const subFiles = fs.readdirSync(filePath);
      subFiles.forEach((subFile) => {
        const subFilePath = path.join(filePath, subFile);
        processFile(metadataPath, subFilePath, metaSuffix, fieldNames, xmlElement, recurse);
      });
    } else {
      // If not recursing or the current file is not a directory, process the file
      processFile(metadataPath, filePath, metaSuffix, fieldNames, xmlElement);
    }
  });
}

function processFile(
  metadataPath: string,
  filePath: string,
  metaSuffix: string,
  fieldNames: string,
  xmlElement: string,
  recurse: boolean = false
): void {
  if (filePath.endsWith(`.${metaSuffix}-meta.xml`)) {
    // console.log(`Parsing metadata file: ${filePath}`);
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const baseName = path.basename(filePath, `.${metaSuffix}-meta.xml`);

    let outputPath;
    if (recurse) {
      const baseDirName = path.basename(path.dirname(filePath));
      outputPath = path.join(metadataPath, baseDirName, baseName);
    } else {
      outputPath = path.join(metadataPath, metaSuffix === 'labels' ? '' : baseName);
    }
    xml2jsParser(xmlContent, outputPath, fieldNames, xmlElement, baseName, metaSuffix, INDENT);
  }
}
