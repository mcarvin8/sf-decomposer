'use strict';
/* eslint-disable no-await-in-loop */

import path from 'node:path';
import fs from 'fs-extra';

import { DisassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { moveFiles } from './moveFiles.js';

async function disassembleHandler(
  xmlPath: string,
  uniqueIdElements: string,
  prepurge: boolean,
  postpurge: boolean
): Promise<void> {
  const handler = new DisassembleXMLFileHandler();
  await handler.disassemble({
    xmlPath,
    uniqueIdElements,
    prePurge: prepurge,
    postPurge: postpurge,
  });
}

export async function decomposeFileHandler(
  metaAttributes: {
    metadataPath: string;
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    uniqueIdElements: string;
  },
  prepurge: boolean,
  postpurge: boolean,
  debug: boolean
): Promise<void> {
  const { metadataPath, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;
  if (debug) {
    setLogLevel('debug');
  }
  // standalone pre-purge is required for labels
  if (metaSuffix === 'labels' && prepurge) {
    const subFiles = await fs.readdir(metadataPath);
    for (const subFile of subFiles) {
      const subfilePath = path.join(metadataPath, subFile);
      const stats = await fs.lstat(subfilePath);
      if (stats.isFile() && subFile !== CUSTOM_LABELS_FILE) {
        await fs.remove(subfilePath);
      }
    }
  }

  if (strictDirectoryName || folderType) {
    // iterate through the directory
    const subFiles = await fs.readdir(metadataPath);
    for (const subFile of subFiles) {
      const subFilePath = path.join(metadataPath, subFile);
      const subFileStat = await fs.stat(subFilePath);
      if (subFileStat.isDirectory()) {
        await disassembleHandler(subFilePath, uniqueIdElements, prepurge, postpurge);
      }
    }
  } else if (metaSuffix === 'labels') {
    // do not use the prePurge flag in the xml-disassembler package for labels due to file moving
    const labelFilePath = path.resolve(metadataPath, CUSTOM_LABELS_FILE);
    await disassembleHandler(labelFilePath, uniqueIdElements, false, postpurge);
  } else {
    await disassembleHandler(metadataPath, uniqueIdElements, prepurge, postpurge);
  }
  if (metaSuffix === 'labels') {
    const sourceDirectory = path.join(metadataPath, 'CustomLabels', 'labels');
    const destinationDirectory = metadataPath;
    await moveFiles(sourceDirectory, destinationDirectory, () => true);
    await fs.remove(path.join(metadataPath, 'CustomLabels'));
  }
}
