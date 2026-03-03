'use strict';

import { resolve, relative, join } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import { DisassembleXMLFileHandler } from 'xml-disassembler';
import pLimit from 'p-limit';

import { CUSTOM_LABELS_FILE, CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { prePurgeLabels, moveAndRenameLabels } from './customLabels.js';
import { renameWorkflows } from './renameWorkflows.js';

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
  format: string,
  ignorePath: string,
  strategy: string,
  decomposeNestedPerms: boolean
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;

  // Limit concurrent package directory processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);

  const tasks = metadataPaths.map((metadataPath) =>
    limit(async () => {
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

        disassembleHandler(
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
        disassembleHandler(
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
    })
  );

  await Promise.all(tasks);
}

function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
  format: string,
  ignorePath: string,
  strategy: string,
  metaSuffix: string,
  decomposeNestedPerms: boolean
): void {
  const handler: DisassembleXMLFileHandler = new DisassembleXMLFileHandler();
  let multiLevel;
  let splitTags;
  const decomposePermSets: boolean =
    decomposeNestedPerms && metaSuffix === 'permissionset' && strategy === 'grouped-by-tag';
  const decomposeLoyalyProgram: boolean = metaSuffix === 'loyaltyProgramSetup' && strategy === 'unique-id';
  if (decomposeLoyalyProgram) {
    multiLevel = 'programProcesses:programProcesses:parameterName,ruleName';
  }

  if (decomposePermSets) {
    splitTags = 'objectPermissions:split:object,fieldPermissions:group:field';
  }

  handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge,
    postPurge,
    ignorePath,
    format,
    strategy,
    multiLevel,
    splitTags,
  });
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

  // Limit concurrent subdirectory stat operations
  const statLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const statPromises = subFiles.map((subFile) =>
    statLimit(async () => {
      const subFilePath = join(metadataPath, subFile);
      const isDir = (await stat(subFilePath)).isDirectory();
      return { subFilePath, isDir };
    })
  );
  const statResults = await Promise.all(statPromises);

  // Limit concurrent subdirectory processing
  const processLimit = pLimit(CONCURRENCY_LIMITS.SUBDIRECTORIES);
  const processTasks = statResults
    .filter(({ isDir }) => isDir)
    .map(({ subFilePath }) =>
      processLimit(() =>
        disassembleHandler(
          subFilePath,
          uniqueIdElements,
          prepurge,
          postpurge,
          format,
          ignorePath,
          strategy,
          metaSuffix,
          decomposeNestedPerms
        )
      )
    );

  await Promise.all(processTasks);
}
