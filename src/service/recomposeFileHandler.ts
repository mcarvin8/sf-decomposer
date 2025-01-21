'use strict';

import { readdir, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ReassembleXMLFileHandler, setLogLevel, withConcurrencyLimit, getConcurrencyThreshold } from 'xml-disassembler';
import { YamlToXmlReassembler } from 'xml2yaml-disassembler';
import { JsonToXmlReassembler } from 'xml2json-disassembler';

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

  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    metadataPaths.map((metadataPath) => async () => {
      if (metaSuffix === 'labels') {
        await reassembleLabels(metadataPath, metaSuffix, postpurge, format, concurrencyLimit);
      } else {
        const recurse = strictDirectoryName || Boolean(folderType);
        await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge, format);
      }
      if (metaSuffix === 'bot') {
        await renameBotVersionFile(metadataPath, concurrencyLimit);
      }
    }),
    concurrencyLimit
  );
}

async function reassembleHandler(
  filePath: string,
  fileExtension: string,
  postPurge: boolean,
  format: string
): Promise<void> {
  let handler;
  if (format === 'yaml') {
    handler = new YamlToXmlReassembler();
  } else if (format === 'json') {
    handler = new JsonToXmlReassembler();
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
  format: string,
  concurrencyLimit: number
): Promise<void> {
  let sourceDirectory = metadataPath;
  let destinationDirectory = join(metadataPath, 'CustomLabels', 'labels');

  await moveFiles(
    sourceDirectory,
    destinationDirectory,
    concurrencyLimit,
    (fileName) => fileName !== CUSTOM_LABELS_FILE
  );

  await reassembleHandler(join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`, false, format);

  sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  destinationDirectory = metadataPath;

  await moveFiles(sourceDirectory, destinationDirectory, concurrencyLimit, () => true);

  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
  if (postpurge) await deleteFilesInDirectory(destinationDirectory);
}

async function deleteFilesInDirectory(directory: string): Promise<void> {
  const files = await readdir(directory);
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    files.map((file) => async () => {
      const filePath = join(directory, file);
      const fileStat = await stat(filePath);
      if (fileStat.isFile() && file !== CUSTOM_LABELS_FILE) {
        await rm(filePath);
      }
    }),
    concurrencyLimit
  );
}

async function reassembleDirectories(
  metadataPath: string,
  metaSuffix: string,
  recurse: boolean,
  postpurge: boolean,
  format: string
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    subdirectories.map((subdirectory) => async () => {
      const subDirStat = await stat(subdirectory);
      if (subDirStat.isDirectory()) {
        if (recurse) {
          await reassembleDirectories(subdirectory, metaSuffix, false, postpurge, format);
        } else {
          await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge, format);
        }
      }
    }),
    concurrencyLimit
  );
}
