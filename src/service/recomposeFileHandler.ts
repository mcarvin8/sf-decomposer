'use strict';
/* eslint-disable no-await-in-loop */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as fsextra from 'fs-extra';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';

async function moveFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  predicate: (fileName: string) => boolean
): Promise<void> {
  const files = await fs.readdir(sourceDirectory);
  for (const file of files) {
    const fileStat = await fs.stat(path.join(sourceDirectory, file));
    if (fileStat.isFile() && predicate(file)) {
      const sourceFile = path.join(sourceDirectory, file);
      const destinationFile = path.join(destinationDirectory, file);
      await fsextra.move(sourceFile, destinationFile, { overwrite: true });
    }
  }
}

async function reassembleHandler(xmlPath: string, fileExtension: string): Promise<void> {
  const handler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    xmlPath,
    fileExtension,
  });
}

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPath: string;
  },
  debug: boolean
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPath } = metaAttributes;
  let destinationDirectory = '';
  if (debug) {
    setLogLevel('debug');
  }
  if (metaSuffix === 'labels') {
    let sourceDirectory = metadataPath;
    destinationDirectory = path.join(metadataPath, 'CustomLabels', 'labels');

    await moveFiles(sourceDirectory, destinationDirectory, (fileName) => fileName !== CUSTOM_LABELS_FILE);

    await reassembleHandler(path.join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`);

    sourceDirectory = path.join(metadataPath, 'CustomLabels', 'labels');
    destinationDirectory = metadataPath;

    await moveFiles(sourceDirectory, destinationDirectory, () => true);

    await fsextra.remove(path.join(metadataPath, 'CustomLabels', 'labels'));
  } else if (strictDirectoryName || folderType) {
    const subDirectories = (await fs.readdir(metadataPath)).map((file) => path.join(metadataPath, file));

    for (const subDirectory of subDirectories) {
      const botDirStat = await fs.stat(subDirectory);
      if (botDirStat.isDirectory()) {
        const subdirectories = (await fs.readdir(subDirectory)).map((file) => path.join(subDirectory, file));

        for (const subdirectory of subdirectories) {
          const subDirStat = await fs.stat(subdirectory);
          if (subDirStat.isDirectory()) {
            await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`);
          }
        }
      }
    }
  } else {
    const subdirectories = (await fs.readdir(metadataPath)).map((file) => path.join(metadataPath, file));
    for (const subdirectory of subdirectories) {
      const subDirStat = await fs.stat(subdirectory);
      if (subDirStat.isDirectory()) {
        await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`);
      }
    }
  }

  if (metaSuffix === 'bot') {
    await renameBotVersionFile(metadataPath);
  }
}
