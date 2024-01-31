'use strict';

import * as fs from 'node:fs';
import * as path from 'node:path';

import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { composeAndWriteFile } from '../service/composeAndWriteFile.js';

export function composeFileHandler(metadataPath: string, metaSuffix: string, xmlElement: string): void {
  const processFilesInDirectory = (dirPath: string): string[] => {
    const combinedXmlContents: string[] = [];
    const files = fs.readdirSync(dirPath);

    // Sort files based on the name
    files.sort((fileA, fileB) => {
      const fullNameA = fileA.split('.')[0].toLowerCase();
      const fullNameB = fileB.split('.')[0].toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isFile()) {
        if (metaSuffix === 'labels' && !file.endsWith('label-meta.xml')) {
          return; // Skip files that don't match the expected naming convention for custom labels
        }

        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        combinedXmlContents.push(xmlContent);
      } else if (fs.statSync(filePath).isDirectory()) {
        const subdirectoryContents = processFilesInDirectory(filePath);
        combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
      }
    });

    return combinedXmlContents;
  };

  // Process labels in root metadata folder
  // Process other metadata files in subdirectories
  if (metaSuffix === 'labels') {
    const combinedXmlContents: string[] = processFilesInDirectory(metadataPath);
    const filePath = path.join(metadataPath, CUSTOM_LABELS_FILE);

    composeAndWriteFile(combinedXmlContents, filePath, xmlElement);
  } else if (metaSuffix === 'bot' || metaSuffix === 'botVersion') {
    const botDirectories = fs
      .readdirSync(metadataPath)
      .map((file) => path.join(metadataPath, file))
      .filter((filePath) => fs.statSync(filePath).isDirectory());

    botDirectories.forEach((botDirectory) => {
      const subdirectories = fs
        .readdirSync(botDirectory)
        .map((file) => path.join(botDirectory, file))
        .filter((filePath) => {
          const isDirectory = fs.statSync(filePath).isDirectory();

          if (isDirectory) {
            if (metaSuffix === 'botVersion') {
              // Scan sub-directories that have 'v#' regex
              return /v\d+/.test(path.basename(filePath));
            } else if (metaSuffix === 'bot') {
              // Scan sub-directories that do NOT have 'v#' regex
              return !/v\d+/.test(path.basename(filePath));
            }
          }

          return false; // Default case, not a directory or doesn't match conditions
        });

      subdirectories.forEach((subdirectory) => {
        // Process each sub-subdirectory
        const combinedXmlContents: string[] = processFilesInDirectory(subdirectory);
        const subdirectoryBasename = path.basename(subdirectory);
        const filePath = path.join(
          metadataPath,
          path.basename(botDirectory),
          `${subdirectoryBasename}.${metaSuffix}-meta.xml`
        );
        composeAndWriteFile(combinedXmlContents, filePath, xmlElement);
      });
    });
  } else {
    const subdirectories = fs
      .readdirSync(metadataPath)
      .map((file) => path.join(metadataPath, file))
      .filter((filePath) => fs.statSync(filePath).isDirectory());

    subdirectories.forEach((subdirectory) => {
      // console.log('Processing subdirectory:', subdirectory);
      const combinedXmlContents: string[] = processFilesInDirectory(subdirectory);
      const subdirectoryBasename = path.basename(subdirectory);
      const filePath = path.join(metadataPath, `${subdirectoryBasename}.${metaSuffix}-meta.xml`);

      composeAndWriteFile(combinedXmlContents, filePath, xmlElement);
    });
  }
}
