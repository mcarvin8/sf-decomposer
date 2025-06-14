'use strict';
/* eslint-disable no-await-in-loop */
import { resolve, relative, join } from 'node:path';
import { readdir, stat, rm, rename } from 'node:fs/promises';
import { DisassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';

import { CUSTOM_LABELS_FILE, WORKFLOW_SUFFIX_MAPPING } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';
import { handleNestedLoyaltyProgramSetupDecomposition } from './lps/loyaltyProgramSetup.js';
import { handleNestedPermissionSetDecomposition } from './perm-set/permSets.js';

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
  ignorePath: string,
  strategy: string,
  decomposeNestedPerms: boolean
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;
  if (debug) setLogLevel('debug');

  for (const metadataPath of metadataPaths) {
    if (strictDirectoryName || folderType) {
      await subDirectoryHandler(
        metadataPath,
        uniqueIdElements,
        prepurge,
        postpurge,
        format,
        ignorePath,
        strategy,
        metaSuffix,
        decomposeNestedPerms
      );
    } else if (metaSuffix === 'labels') {
      // do not use the prePurge flag in the xml-disassembler package for labels due to file moving
      if (prepurge) await prePurgeLabels(metadataPath);
      const absoluteLabelFilePath = resolve(metadataPath, CUSTOM_LABELS_FILE);
      const relativeLabelFilePath = relative(process.cwd(), absoluteLabelFilePath);

      await disassembleHandler(
        relativeLabelFilePath,
        uniqueIdElements,
        false,
        postpurge,
        format,
        ignorePath,
        strategy,
        metaSuffix,
        decomposeNestedPerms
      );
      // move labels from the directory they are created in
      await moveAndRenameLabels(metadataPath);
    } else {
      await disassembleHandler(
        metadataPath,
        uniqueIdElements,
        prepurge,
        postpurge,
        format,
        ignorePath,
        strategy,
        metaSuffix,
        decomposeNestedPerms
      );
    }
    if (metaSuffix === 'workflow') {
      await renameWorkflows(metadataPath);
    }
  }
}

async function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
  format: string,
  ignorePath: string,
  strategy: string,
  metaSuffix: string,
  decomposeNestedPerms: boolean
): Promise<void> {
  const handler: DisassembleXMLFileHandler = new DisassembleXMLFileHandler();
  let decomposeFormat;
  let decomposePostPurge;
  const decomposePermSets: boolean =
    decomposeNestedPerms && metaSuffix === 'permissionset' && strategy === 'grouped-by-tag';
  const decomposeLoyalyProgram: boolean = metaSuffix === 'loyaltyProgramSetup' && strategy === 'unique-id';
  if (decomposePermSets || decomposeLoyalyProgram) {
    decomposeFormat = 'xml';
    decomposePostPurge = false;
  } else {
    decomposeFormat = format;
    decomposePostPurge = postPurge;
  }

  await handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge,
    postPurge: decomposePostPurge,
    ignorePath,
    format: decomposeFormat,
    strategy,
  });

  // Dispatch recursive decomposition based on type
  if (decomposePermSets) {
    await handleNestedPermissionSetDecomposition(filePath, uniqueIdElements, handler, format);
  }

  if (decomposeLoyalyProgram) {
    await handleNestedLoyaltyProgramSetupDecomposition(filePath, handler, format);
  }
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

async function moveAndRenameLabels(metadataPath: string): Promise<void> {
  const sourceDirectory = join(metadataPath, 'CustomLabels', 'labels');
  const destinationDirectory = metadataPath;
  const labelFiles = await readdir(sourceDirectory);
  for (const file of labelFiles) {
    if (file.includes('.labels-meta')) {
      const oldFilePath = join(sourceDirectory, file);
      const newFileName = file.replace('.labels-meta', '.label-meta');
      const newFilePath = join(destinationDirectory, newFileName);
      await rename(oldFilePath, newFilePath);
    }
  }
  await moveFiles(sourceDirectory, destinationDirectory, () => true);
  await rm(join(metadataPath, 'CustomLabels'), { recursive: true });
}

async function subDirectoryHandler(
  metadataPath: string,
  uniqueIdElements: string,
  prepurge: boolean,
  postpurge: boolean,
  format: string,
  ignorePath: string,
  strategy: string,
  metaSuffix: string,
  decomposeNestedPerms: boolean
): Promise<void> {
  const subFiles = await readdir(metadataPath);
  for (const subFile of subFiles) {
    const subFilePath = join(metadataPath, subFile);
    if ((await stat(subFilePath)).isDirectory()) {
      await disassembleHandler(
        subFilePath,
        uniqueIdElements,
        prepurge,
        postpurge,
        format,
        ignorePath,
        strategy,
        metaSuffix,
        decomposeNestedPerms
      );
    }
  }
}

async function renameWorkflows(directory: string): Promise<void> {
  const files = await readdir(directory, { recursive: true });

  for (const file of files) {
    // Check if the file matches any suffix in WORKFLOW_SUFFIX_MAPPING
    for (const [suffix, newSuffix] of Object.entries(WORKFLOW_SUFFIX_MAPPING)) {
      if (file.includes(suffix)) {
        const oldFilePath = join(directory, file);
        const newFilePath = join(directory, file.replace(suffix, newSuffix));
        await rename(oldFilePath, newFilePath);
        break;
      }
    }
  }
}
