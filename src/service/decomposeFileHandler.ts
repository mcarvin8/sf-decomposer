'use strict';
/* eslint-disable no-await-in-loop */
import { resolve, relative, join } from 'node:path';
import { readdir, stat, rm } from 'node:fs/promises';
import { DisassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';
import { XmlToYamlDisassembler } from 'xml2yaml-disassembler';
import { XmlToJsonDisassembler } from 'xml2json-disassembler';

import { CUSTOM_LABELS_FILE, IGNORE_FILE } from '../helpers/constants.js';
import { moveFiles } from './moveFiles.js';
import { getRepoRoot } from './getRepoRoot.js';

export async function decomposeFileHandler(
  metaAttributes: {
    metadataPaths: string[];
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    uniqueIdElements: string;
  },
  prepurge: boolean,
  postpurge: boolean,
  debug: boolean,
  format: string
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;
  if (debug) setLogLevel('debug');

  for (const metadataPath of metadataPaths) {
    if (strictDirectoryName || folderType) {
      await subDirectoryHandler(metadataPath, uniqueIdElements, prepurge, postpurge, format);
    } else if (metaSuffix === 'labels') {
      // do not use the prePurge flag in the xml-disassembler package for labels due to file moving
      if (prepurge) await prePurgeLabels(metadataPath);
      const absoluteLabelFilePath = resolve(metadataPath, CUSTOM_LABELS_FILE);
      const relativeLabelFilePath = relative(process.cwd(), absoluteLabelFilePath);

      await disassembleHandler(relativeLabelFilePath, uniqueIdElements, false, postpurge, format);
      // move labels from the directory they are created in
      await moveLabels(metadataPath);
    } else {
      await disassembleHandler(metadataPath, uniqueIdElements, prepurge, postpurge, format);
    }
  }
}

async function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
  format: string
): Promise<void> {
  let handler: DisassembleXMLFileHandler | XmlToJsonDisassembler | XmlToYamlDisassembler;
  if (format === 'yaml') {
    handler = new XmlToYamlDisassembler();
  } else if (format === 'json') {
    handler = new XmlToJsonDisassembler();
  } else {
    handler = new DisassembleXMLFileHandler();
  }
  const repoRoot = await getRepoRoot();
  const ignorePath = resolve(repoRoot, IGNORE_FILE);
  await handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge,
    postPurge,
    ignorePath,
  });
}

async function prePurgeLabels(metadataPath: string): Promise<void> {
  const subFiles = await readdir(metadataPath);
  for (const subFile of subFiles) {
    const subfilePath = join(metadataPath, subFile);
    if ((await stat(subfilePath)).isFile() && subFile !== CUSTOM_LABELS_FILE) {
      await rm(subfilePath, { recursive: true });
    }
  }
}

async function moveLabels(metadataPath: string): Promise<void> {
  const sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  const destinationDirectory = metadataPath;
  await moveFiles(sourceDirectory, destinationDirectory, () => true);
  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
}

async function subDirectoryHandler(
  metadataPath: string,
  uniqueIdElements: string,
  prepurge: boolean,
  postpurge: boolean,
  format: string
): Promise<void> {
  const subFiles = await readdir(metadataPath);
  for (const subFile of subFiles) {
    const subFilePath = join(metadataPath, subFile);
    if ((await stat(subFilePath)).isDirectory()) {
      await disassembleHandler(subFilePath, uniqueIdElements, prepurge, postpurge, format);
    }
  }
}
