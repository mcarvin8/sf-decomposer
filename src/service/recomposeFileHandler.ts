'use strict';
/* eslint-disable no-await-in-loop */
import * as promises from 'node:fs/promises';
import * as path from 'node:path';
import * as fsextra from 'fs-extra';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';
import { moveFiles } from './moveFiles.js';

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
  if (debug) setLogLevel('debug');

  if (metaSuffix === 'labels') {
    await reassembleLabels(metadataPath, metaSuffix);
  } else {
    let recurse: boolean = false;
    if (strictDirectoryName || folderType) recurse = true;
    await reassembleDirectories(metadataPath, metaSuffix, recurse);
  }

  if (metaSuffix === 'bot') await renameBotVersionFile(metadataPath);
}

async function reassembleHandler(xmlPath: string, fileExtension: string): Promise<void> {
  const handler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    xmlPath,
    fileExtension,
  });
}

async function reassembleLabels(metadataPath: string, metaSuffix: string): Promise<void> {
  let sourceDirectory = metadataPath;
  let destinationDirectory = path.join(metadataPath, 'CustomLabels', 'labels');

  await moveFiles(sourceDirectory, destinationDirectory, (fileName) => fileName !== CUSTOM_LABELS_FILE);

  await reassembleHandler(path.join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`);

  sourceDirectory = path.join(metadataPath, 'CustomLabels', 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  await fsextra.remove(path.join(metadataPath, 'CustomLabels'));
}

async function reassembleDirectories(metadataPath: string, metaSuffix: string, recurse: boolean): Promise<void> {
  const subdirectories = (await promises.readdir(metadataPath)).map((file) => path.join(metadataPath, file));
  for (const subdirectory of subdirectories) {
    const subDirStat = await promises.stat(subdirectory);
    if (subDirStat.isDirectory() && recurse) {
      // recursively call this function and set recurse to false
      await reassembleDirectories(subdirectory, metaSuffix, false);
    } else if (subDirStat.isDirectory()) {
      await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`);
    }
  }
}
