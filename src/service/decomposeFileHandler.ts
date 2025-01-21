'use strict';

import { resolve, relative, join } from 'node:path';
import { readdir, stat, rm, rename } from 'node:fs/promises';
import {
  DisassembleXMLFileHandler,
  setLogLevel,
  withConcurrencyLimit,
  getConcurrencyThreshold,
} from 'xml-disassembler';
import { XmlToYamlDisassembler } from 'xml2yaml-disassembler';
import { XmlToJsonDisassembler } from 'xml2json-disassembler';

import { CUSTOM_LABELS_FILE, WORKFLOW_SUFFIX_MAPPING } from '../helpers/constants.js';
import { moveFiles } from './moveFiles.js';

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
  format: string,
  ignorePath: string
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;
  if (debug) setLogLevel('debug');

  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    metadataPaths.map((metadataPath) => async () => {
      if (strictDirectoryName || folderType) {
        await subDirectoryHandler(metadataPath, uniqueIdElements, prepurge, postpurge, format, ignorePath);
      } else if (metaSuffix === 'labels') {
        if (prepurge) await prePurgeLabels(metadataPath);
        const absoluteLabelFilePath = resolve(metadataPath, CUSTOM_LABELS_FILE);
        const relativeLabelFilePath = relative(process.cwd(), absoluteLabelFilePath);

        await disassembleHandler(relativeLabelFilePath, uniqueIdElements, false, postpurge, format, ignorePath);
        await moveAndRenameLabels(metadataPath, format);
      } else {
        await disassembleHandler(metadataPath, uniqueIdElements, prepurge, postpurge, format, ignorePath);
      }
      if (metaSuffix === 'workflow') {
        await renameWorkflows(metadataPath);
      }
    }),
    concurrencyLimit
  );
}

async function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
  format: string,
  ignorePath: string
): Promise<void> {
  let handler: DisassembleXMLFileHandler | XmlToJsonDisassembler | XmlToYamlDisassembler;
  if (format === 'yaml') {
    handler = new XmlToYamlDisassembler();
  } else if (format === 'json') {
    handler = new XmlToJsonDisassembler();
  } else {
    handler = new DisassembleXMLFileHandler();
  }
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
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    subFiles.map((subFile) => async () => {
      const subfilePath = join(metadataPath, subFile);
      if ((await stat(subfilePath)).isFile() && subFile !== CUSTOM_LABELS_FILE) {
        await rm(subfilePath, { recursive: true });
      }
    }),
    concurrencyLimit
  );
}

async function moveAndRenameLabels(metadataPath: string, format: string): Promise<void> {
  const sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  const destinationDirectory = metadataPath;
  const labelFiles = await readdir(sourceDirectory);
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    labelFiles.map((file) => async () => {
      if (file.endsWith(`.labels-meta.${format}`)) {
        const oldFilePath = join(sourceDirectory, file);
        const newFileName = file.replace(`.labels-meta.${format}`, `.label-meta.${format}`);
        const newFilePath = join(destinationDirectory, newFileName);
        await rename(oldFilePath, newFilePath);
      }
    }),
    concurrencyLimit
  );

  await moveFiles(sourceDirectory, destinationDirectory, concurrencyLimit, () => true);
  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
}

async function subDirectoryHandler(
  metadataPath: string,
  uniqueIdElements: string,
  prepurge: boolean,
  postpurge: boolean,
  format: string,
  ignorePath: string
): Promise<void> {
  const subFiles = await readdir(metadataPath);
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    subFiles.map((subFile) => async () => {
      const subFilePath = join(metadataPath, subFile);
      if ((await stat(subFilePath)).isDirectory()) {
        await disassembleHandler(subFilePath, uniqueIdElements, prepurge, postpurge, format, ignorePath);
      }
    }),
    concurrencyLimit
  );
}

async function renameWorkflows(directory: string): Promise<void> {
  const files = await readdir(directory, { recursive: true });
  const concurrencyLimit = getConcurrencyThreshold();

  await withConcurrencyLimit(
    files.map((file) => async () => {
      for (const [suffix, newSuffix] of Object.entries(WORKFLOW_SUFFIX_MAPPING)) {
        if (file.endsWith(suffix)) {
          const oldFilePath = join(directory, file);
          const newFilePath = join(directory, file.replace(suffix, newSuffix));
          return rename(oldFilePath, newFilePath);
        }
      }
    }),
    concurrencyLimit
  );
}
