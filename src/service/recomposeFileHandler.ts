'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { YamlToXmlReassembler } from 'xml2yaml-disassembler';
import { JsonToXmlReassembler } from 'xml2json-disassembler';
import { Json5ToXmlReassembler } from 'xml2json5-disassembler';

import { CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';
import { moveFiles } from './moveFiles.js';

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
  },
  postpurge: boolean,
  debug: boolean,
  format: string
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths } = metaAttributes;
  if (debug) setLogLevel('debug');
  for (const metadataPath of metadataPaths) {
    if (metaSuffix === 'labels') {
      await reassembleLabels(metadataPath, metaSuffix, postpurge, format);
    } else {
      let recurse: boolean = false;
      if (strictDirectoryName || folderType) recurse = true;
      await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge, format);
    }

    if (metaSuffix === 'bot') await renameBotVersionFile(metadataPath);
  }
}

async function reassembleHandler(
  filePath: string,
  fileExtension: string,
  postPurge: boolean,
  format: string
): Promise<void> {
  let handler: ReassembleXMLFileHandler | JsonToXmlReassembler | YamlToXmlReassembler | Json5ToXmlReassembler;
  if (format === 'yaml') {
    handler = new YamlToXmlReassembler();
  } else if (format === 'json') {
    handler = new JsonToXmlReassembler();
  } else if (format === 'json5') {
    handler = new Json5ToXmlReassembler();
  } else {
    handler = new ReassembleXMLFileHandler();
  }
  await handler.reassemble({
    filePath,
    fileExtension,
    postPurge,
  });
}

async function reassembleLabels(
  metadataPath: string,
  metaSuffix: string,
  postpurge: boolean,
  format: string
): Promise<void> {
  let sourceDirectory = metadataPath;
  let destinationDirectory = join(metadataPath, 'CustomLabels', 'labels');

  await moveFiles(sourceDirectory, destinationDirectory, (fileName) => fileName !== CUSTOM_LABELS_FILE);

  // do not use postpurge flag due to file moving
  await reassembleHandler(join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`, false, format);

  sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, () => true);

  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
  if (postpurge) await deleteFilesInDirectory(destinationDirectory);
}

async function deleteFilesInDirectory(directory: string): Promise<void> {
  const files = await readdir(directory);
  for (const file of files) {
    const filePath = join(directory, file);
    const fileStat = await stat(filePath);
    if (fileStat.isFile() && file !== CUSTOM_LABELS_FILE) {
      await rm(filePath);
    }
  }
}

async function reassembleDirectories(
  metadataPath: string,
  metaSuffix: string,
  recurse: boolean,
  postpurge: boolean,
  format: string
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));
  for (const subdirectory of subdirectories) {
    const subDirStat = await stat(subdirectory);
    if (subDirStat.isDirectory() && recurse) {
      // recursively call this function and set recurse to false
      await reassembleDirectories(subdirectory, metaSuffix, false, postpurge, format);
    } else if (subDirStat.isDirectory()) {
      await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge, format);
    }
  }
}
