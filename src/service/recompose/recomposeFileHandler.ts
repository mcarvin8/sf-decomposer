/* eslint-disable no-console */
'use strict';
/* eslint-disable no-await-in-loop */
import { existsSync } from 'node:fs';
import { readdir, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';

import { CUSTOM_LABELS_FILE } from '../../helpers/constants.js';
import { moveFiles } from '../core/moveFiles.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';
import { wrapAllFilesWithLoyaltyRoot } from './wrapAllFilesWithLoyaltyRoot.js';

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
  },
  postpurge: boolean,
  debug: boolean
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths } = metaAttributes;
  if (debug) setLogLevel('debug');
  for (const metadataPath of metadataPaths) {
    if (metaSuffix === 'labels') {
      await reassembleLabels(metadataPath, metaSuffix, postpurge);
    } else if (metaSuffix === 'loyaltyProgramSetup') {
      await reassembleLoyaltyProgramSetup(metadataPath);
    } else {
      let recurse: boolean = false;
      if (strictDirectoryName || folderType) recurse = true;
      await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge);
    }

    if (metaSuffix === 'bot') await renameBotVersionFile(metadataPath);
  }
}

async function reassembleHandler(filePath: string, fileExtension: string, postPurge: boolean): Promise<void> {
  const handler: ReassembleXMLFileHandler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    filePath,
    fileExtension,
    postPurge,
  });
}

async function reassembleLabels(metadataPath: string, metaSuffix: string, postpurge: boolean): Promise<void> {
  let sourceDirectory = metadataPath;
  let destinationDirectory = join(metadataPath, 'CustomLabels', 'labels');

  await moveFiles(sourceDirectory, destinationDirectory, (fileName) => fileName !== CUSTOM_LABELS_FILE);

  // do not use postpurge flag due to file moving
  await reassembleHandler(join(metadataPath, 'CustomLabels'), `${metaSuffix}-meta.xml`, false);

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
  postpurge: boolean
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));
  for (const subdirectory of subdirectories) {
    const subDirStat = await stat(subdirectory);
    if (subDirStat.isDirectory() && recurse) {
      // recursively call this function and set recurse to false
      await reassembleDirectories(subdirectory, metaSuffix, false, postpurge);
    } else if (subDirStat.isDirectory()) {
      await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge);
    }
  }
}

async function reassembleLoyaltyProgramSetup(basePath: string): Promise<void> {
  const children = await readdir(basePath, { withFileTypes: true });

  for (const entry of children) {
    if (!entry.isDirectory()) continue;

    const metadataFolder = join(basePath, entry.name);
    const programProcessesPath = join(metadataFolder, 'programProcesses');

    if (!existsSync(programProcessesPath)) continue;

    const processDirs = await readdir(programProcessesPath);
    for (const process of processDirs) {
      const processPath = join(programProcessesPath, process);
      const subDirs = await readdir(processPath, { withFileTypes: true });

      for (const subDir of subDirs) {
        if (subDir.isDirectory()) {
          await reassembleHandler(join(processPath, subDir.name), 'xml', false);
        }
      }

      await reassembleHandler(processPath, 'xml', true);
    }

    await wrapAllFilesWithLoyaltyRoot(programProcessesPath);
    await reassembleHandler(metadataFolder, 'loyaltyProgramSetup-meta.xml', true);
  }
}
