'use strict';
/* eslint-disable no-await-in-loop */

import path from 'node:path';
import fs from 'fs-extra';

import { DisassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';

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
  const handler = new DisassembleXMLFileHandler();
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
        await handler.disassemble({
          xmlPath: subFilePath,
          uniqueIdElements,
          prePurge: prepurge,
          postPurge: postpurge,
        });
      }
    }
  } else if (metaSuffix === 'labels') {
    // do not use the prePurge flag in the xml-disassembler package for labels due to file moving
    const labelFilePath = path.resolve(metadataPath, CUSTOM_LABELS_FILE);
    await handler.disassemble({
      xmlPath: labelFilePath,
      uniqueIdElements,
      postPurge: postpurge,
    });
  } else {
    await handler.disassemble({
      xmlPath: metadataPath,
      uniqueIdElements,
      prePurge: prepurge,
      postPurge: postpurge,
    });
  }
  if (metaSuffix === 'labels') {
    const sourceDirectory = path.join(metadataPath, 'CustomLabels', 'labels');
    const destinationDirectory = metadataPath;

    const files = await fs.readdir(sourceDirectory);
    for (const file of files) {
      const sourceFile = path.join(sourceDirectory, file);
      const destinationFile = path.join(destinationDirectory, file);
      await fs.move(sourceFile, destinationFile, { overwrite: true });
    }

    // remove label sub-directories created
    const subdirectories = await fs.readdir(metadataPath);
    for (const subdirectory of subdirectories) {
      const subdirectoryPath = path.join(metadataPath, subdirectory);
      const stats = await fs.lstat(subdirectoryPath);
      if (stats.isDirectory()) {
        await fs.remove(subdirectoryPath);
      }
    }
  }
}
