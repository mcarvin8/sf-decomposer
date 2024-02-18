'use strict';
/* eslint-disable no-await-in-loop */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Logger } from '@salesforce/core';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { buildRecomposedFile } from './buildRecomposedFiles.js';

const processFilesInDirectory = async (dirPath: string, metaSuffix: string): Promise<string[]> => {
  const combinedXmlContents: string[] = [];
  const files = await fs.readdir(dirPath);

  // Sort files based on the name
  files.sort((fileA, fileB) => {
    const fullNameA = fileA.split('.')[0].toLowerCase();
    const fullNameB = fileB.split('.')[0].toLowerCase();
    return fullNameA.localeCompare(fullNameB);
  });

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = await fs.stat(filePath);
    if ((fileStat.isFile() && metaSuffix !== 'labels') || file.endsWith('label-meta.xml')) {
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      combinedXmlContents.push(xmlContent);
    } else if (fileStat.isDirectory()) {
      const subdirectoryContents = await processFilesInDirectory(filePath, metaSuffix);
      combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
    }
  }

  return combinedXmlContents;
};

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    xmlElement: string;
    metadataPath: string;
    strictDirectoryName: boolean;
    folderType: string;
  },
  log: Logger
): Promise<void> {
  const { metaSuffix, xmlElement, metadataPath, strictDirectoryName, folderType } = metaAttributes;

  // Process labels in root metadata folder
  // Process other metadata files in subdirectories
  if (metaSuffix === 'labels') {
    const combinedXmlContents: string[] = await processFilesInDirectory(metadataPath, metaSuffix);
    const filePath = path.join(metadataPath, CUSTOM_LABELS_FILE);

    await buildRecomposedFile(combinedXmlContents, filePath, xmlElement, log);
  } else if (strictDirectoryName || folderType || metaSuffix === 'botVersion') {
    const subDirectories = (await fs.readdir(metadataPath)).map((file) => path.join(metadataPath, file));

    for (const subDirectory of subDirectories) {
      const botDirStat = await fs.stat(subDirectory);
      if (botDirStat.isDirectory()) {
        const subdirectories = (await fs.readdir(subDirectory)).map((file) => path.join(subDirectory, file));

        for (const subdirectory of subdirectories) {
          const subDirStat = await fs.stat(subdirectory);
          if (
            subDirStat.isDirectory() &&
            // Check if metasuffix is neither bot nor botVersion
            ((metaSuffix !== 'botVersion' && metaSuffix !== 'bot') ||
              // If botVersion, only process "v#" directories
              (metaSuffix === 'botVersion' && /v\d+/.test(path.basename(subdirectory))) ||
              // If bot, do not process "v#" directories
              (metaSuffix === 'bot' && !/v\d+/.test(path.basename(subdirectory))))
          ) {
            // Process each sub-subdirectory
            const combinedXmlContents: string[] = await processFilesInDirectory(subdirectory, metaSuffix);
            const subdirectoryBasename = path.basename(subdirectory);
            const filePath = path.join(
              metadataPath,
              path.basename(subDirectory),
              `${subdirectoryBasename}.${metaSuffix}-meta.xml`
            );
            await buildRecomposedFile(combinedXmlContents, filePath, xmlElement, log);
          }
        }
      }
    }
  } else {
    const subdirectories = (await fs.readdir(metadataPath)).map((file) => path.join(metadataPath, file));

    for (const subdirectory of subdirectories) {
      const subDirStat = await fs.stat(subdirectory);
      if (subDirStat.isDirectory()) {
        const combinedXmlContents: string[] = await processFilesInDirectory(subdirectory, metaSuffix);
        const subdirectoryBasename = path.basename(subdirectory);
        const filePath = path.join(metadataPath, `${subdirectoryBasename}.${metaSuffix}-meta.xml`);

        await buildRecomposedFile(combinedXmlContents, filePath, xmlElement, log);
      }
    }
  }
}
