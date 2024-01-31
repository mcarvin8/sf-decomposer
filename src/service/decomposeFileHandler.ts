'use strict';
/* eslint-disable no-await-in-loop */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { INDENT } from '../helpers/constants.js';
import { xml2jsParser } from './xml2jsParser.js';

export async function decomposeFileHandler(
  metadataPath: string,
  metaSuffix: string,
  fieldNames: string,
  xmlElement: string,
  recurse: boolean = false
): Promise<void> {
  const files = await fs.readdir(metadataPath);
  for (const file of files) {
    const filePath = path.join(metadataPath, file);
    if (recurse) {
      // If recurse is true and the current file is a directory, iterate through it
      const subFiles = await fs.readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = path.join(filePath, subFile);
        await processFile(metadataPath, subFilePath, metaSuffix, fieldNames, xmlElement, recurse);
      }
    } else {
      // If not recursing or the current file is not a directory, process the file
      await processFile(metadataPath, filePath, metaSuffix, fieldNames, xmlElement);
    }
  }
}

async function processFile(
  metadataPath: string,
  filePath: string,
  metaSuffix: string,
  fieldNames: string,
  xmlElement: string,
  recurse: boolean = false
): Promise<void> {
  if (filePath.endsWith(`.${metaSuffix}-meta.xml`)) {
    // console.log(`Parsing metadata file: ${filePath}`);
    const xmlContent = await fs.readFile(filePath, 'utf-8');
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
