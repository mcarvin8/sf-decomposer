'use strict';
/* eslint-disable no-await-in-loop */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Logger } from '@salesforce/core';
import { CUSTOM_LABELS_FILE, INDENT } from '../helpers/constants.js';
import { buildDecomposedFiles } from './buildDecomposedFiles.js';

export async function decomposeFileHandler(
  metaAttributes: {
    metadataPath: string;
    metaSuffix: string;
    uniqueIdElements: string;
    xmlElement: string;
    folderType: string;
    strictDirectoryName: boolean;
  },
  purge: boolean,
  log: Logger
): Promise<void> {
  const { metadataPath, metaSuffix, uniqueIdElements, xmlElement, folderType, strictDirectoryName } = metaAttributes;

  const files = await fs.readdir(metadataPath);
  for (const file of files) {
    const filePath = path.join(metadataPath, file);
    if (strictDirectoryName || folderType || metaSuffix === 'botVersion') {
      // If bot or bot version, iterate through the directory
      const subFiles = await fs.readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = path.join(filePath, subFile);
        await processFile(
          {
            metadataPath,
            filePath: subFilePath,
            metaSuffix,
            uniqueIdElements,
            xmlElement,
            folderType,
            strictDirectoryName,
          },
          purge,
          log
        );
      }
    } else {
      // If not recursing or the current file is not a directory, process the file
      await processFile(
        { metadataPath, filePath, metaSuffix, uniqueIdElements, xmlElement, folderType, strictDirectoryName },
        purge,
        log
      );
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
    folderType: string;
    strictDirectoryName: boolean;
  },
  purge: boolean,
  log: Logger
): Promise<void> {
  const { metadataPath, filePath, metaSuffix, uniqueIdElements, xmlElement, folderType, strictDirectoryName } =
    metaAttributes;

  if (filePath.endsWith(`.${metaSuffix}-meta.xml`)) {
    log.debug(`Parsing metadata file: ${filePath}`);
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const baseName = path.basename(filePath, `.${metaSuffix}-meta.xml`);

    let outputPath;
    if (strictDirectoryName || folderType || metaSuffix === 'botVersion') {
      const baseDirName = path.basename(path.dirname(filePath));
      outputPath = path.join(metadataPath, baseDirName, baseName);
    } else {
      outputPath = path.join(metadataPath, metaSuffix === 'labels' ? '' : baseName);
    }

    // Purge outputPath if purge flag is set to true
    if (purge) {
      try {
        // do not purge CUSTOM_LABELS_FILE
        if (metaSuffix === 'labels') {
          const files = await fs.readdir(outputPath);
          for (const file of files) {
            if (file !== CUSTOM_LABELS_FILE) {
              const filePathToRemove = path.join(outputPath, file);
              await fs.rm(filePathToRemove, { recursive: true });
              log.debug(`Removed file: ${filePathToRemove}`);
            }
          }
        } else {
          // Remove directory if it's not the labels directory
          await fs.rm(outputPath, { recursive: true });
          log.debug(`Purged directory: ${outputPath}`);
        }
      } catch (error) {
        log.warn(`Failed to purge directory or remove files: ${outputPath}`);
        log.error(error);
      }
    }

    buildDecomposedFiles(xmlContent, outputPath, uniqueIdElements, xmlElement, baseName, metaSuffix, INDENT, log);
  }
}
