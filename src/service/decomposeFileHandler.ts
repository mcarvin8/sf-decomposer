'use strict';
/* eslint-disable no-await-in-loop */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Logger } from '@salesforce/core';
import { INDENT } from '../helpers/constants.js';
import { buildDecomposedFiles } from './buildDecomposedFiles.js';

export async function decomposeFileHandler(
  metaAttributes: {
    metadataPath: string;
    metaSuffix: string;
    uniqueIdElements: string;
    xmlElement: string;
  },
  log: Logger
): Promise<void> {
  const { metadataPath, metaSuffix, uniqueIdElements, xmlElement } = metaAttributes;

  const files = await fs.readdir(metadataPath);
  for (const file of files) {
    const filePath = path.join(metadataPath, file);
    if (metaSuffix === 'botVersion' || metaSuffix === 'bot') {
      // If bot or bot version, iterate through the directory
      const subFiles = await fs.readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = path.join(filePath, subFile);
        await processFile({ metadataPath, filePath: subFilePath, metaSuffix, uniqueIdElements, xmlElement }, log);
      }
    } else {
      // If not recursing or the current file is not a directory, process the file
      await processFile({ metadataPath, filePath, metaSuffix, uniqueIdElements, xmlElement }, log);
    }
  }
}

async function processFile(
  metaAttributes: {
    metadataPath: string;
    filePath: string;
    metaSuffix: string;
    uniqueIdElements: string;
    xmlElement: string;
  },
  log: Logger
): Promise<void> {
  const { metadataPath, filePath, metaSuffix, uniqueIdElements, xmlElement } = metaAttributes;

  if (filePath.endsWith(`.${metaSuffix}-meta.xml`)) {
    log.debug(`Parsing metadata file: ${filePath}`);
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const baseName = path.basename(filePath, `.${metaSuffix}-meta.xml`);

    let outputPath;
    if (metaSuffix === 'botVersion' || metaSuffix === 'bot') {
      const baseDirName = path.basename(path.dirname(filePath));
      outputPath = path.join(metadataPath, baseDirName, baseName);
    } else {
      outputPath = path.join(metadataPath, metaSuffix === 'labels' ? '' : baseName);
    }
    buildDecomposedFiles(xmlContent, outputPath, uniqueIdElements, xmlElement, baseName, metaSuffix, INDENT, log);
  }
}
