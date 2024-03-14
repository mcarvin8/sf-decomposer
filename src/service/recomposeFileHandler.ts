'use strict';
/* eslint-disable no-await-in-loop */
import * as promises from 'node:fs/promises';
import * as path from 'node:path';
import * as fsextra from 'fs-extra';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';
import { moveFiles } from './moveFiles.js';

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

    await fsextra.remove(path.join(metadataPath, 'CustomLabels'));
  } else if (strictDirectoryName || folderType) {
    const subDirectories = (await promises.readdir(metadataPath)).map((file) => path.join(metadataPath, file));

    for (const subDirectory of subDirectories) {
      const botDirStat = await promises.stat(subDirectory);
      if (botDirStat.isDirectory()) {
        const subdirectories = (await promises.readdir(subDirectory)).map((file) => path.join(subDirectory, file));

        for (const subdirectory of subdirectories) {
          const subDirStat = await promises.stat(subdirectory);
          if (subDirStat.isDirectory()) {
            await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`);
          }
        }
      }
    }
  } else {
    const subdirectories = (await promises.readdir(metadataPath)).map((file) => path.join(metadataPath, file));
    for (const subdirectory of subdirectories) {
      const subDirStat = await promises.stat(subdirectory);
      if (subDirStat.isDirectory()) {
        await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`);
      }
    }
  }

  if (metaSuffix === 'bot') {
    await renameBotVersionFile(metadataPath);
  }
}
