'use strict';

import { resolve, relative, join, dirname } from 'node:path';
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
  decomposeNestedPerms: boolean,
  manifestXmlPaths?: Set<string>,
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;

  if (manifestXmlPaths && manifestXmlPaths.size > 0) {
    await decomposeFromManifest(
      manifestXmlPaths,
      uniqueIdElements,
      prepurge,
      postpurge,
      format,
      ignorePath,
      strategy,
      metaSuffix,
      strictDirectoryName,
      folderType,
      decomposeNestedPerms,
    );
    return;
  }

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
          decomposeNestedPerms,
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
          decomposeNestedPerms,
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
          decomposeNestedPerms,
        );
      }
      if (metaSuffix === 'workflow') {
        await renameWorkflows(metadataPath);
      }
    }),
  );

  await Promise.all(tasks);
}

async function decomposeFromManifest(
  manifestXmlPaths: Set<string>,
  uniqueIdElements: string,
  prepurge: boolean,
  postpurge: boolean,
  format: string,
  ignorePath: string,
  strategy: string,
  metaSuffix: string,
  strictDirectoryName: boolean,
  folderType: string,
  decomposeNestedPerms: boolean,
): Promise<void> {
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);
  const xmlPaths = Array.from(manifestXmlPaths);

  if (metaSuffix === 'labels') {
    // Labels have a single source file per labels directory; dedupe by containing dir.
    const labelDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(labelDirs).map((labelDir) =>
      limit(async () => {
        if (prepurge) await prePurgeLabels(labelDir);
        const absoluteLabelFilePath = resolve(labelDir, CUSTOM_LABELS_FILE);
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
          decomposeNestedPerms,
        );
        await moveAndRenameLabels(labelDir);
      }),
    );
    await Promise.all(tasks);
    return;
  }

  if (strictDirectoryName || folderType) {
    // Each parent xml lives inside its own strict subdirectory (e.g. bots/MyBot/MyBot.bot-meta.xml).
    // Dedupe by parent directory and disassemble the whole subdirectory.
    const parentDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(parentDirs).map((parentDir) =>
      limit(() =>
        disassembleHandler(
          parentDir,
          uniqueIdElements,
          prepurge,
          postpurge,
          format,
          ignorePath,
          strategy,
          metaSuffix,
          decomposeNestedPerms,
        ),
      ),
    );
    await Promise.all(tasks);
    return;
  }

  const tasks = xmlPaths.map((xmlPath) =>
    limit(() =>
      disassembleHandler(
        xmlPath,
        uniqueIdElements,
        prepurge,
        postpurge,
        format,
        ignorePath,
        strategy,
        metaSuffix,
        decomposeNestedPerms,
      ),
    ),
  );
  await Promise.all(tasks);

  if (metaSuffix === 'workflow') {
    const workflowDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    for (const workflowDir of workflowDirs) {
      // eslint-disable-next-line no-await-in-loop
      await renameWorkflows(workflowDir);
    }
  }
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
  decomposeNestedPerms: boolean,
): void {
  const handler: DisassembleXMLFileHandler = new DisassembleXMLFileHandler();
  let multiLevel;
  let splitTags;
  const decomposePermSets: boolean =
    decomposeNestedPerms &&
    (metaSuffix === 'permissionset' || metaSuffix === 'mutingpermissionset') &&
    strategy === 'grouped-by-tag';
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
  decomposeNestedPerms: boolean,
): Promise<void> {
  const subFiles = await readdir(metadataPath);

  // Limit concurrent subdirectory stat operations
  const statLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const statPromises = subFiles.map((subFile) =>
    statLimit(async () => {
      const subFilePath = join(metadataPath, subFile);
      const isDir = (await stat(subFilePath)).isDirectory();
      return { subFilePath, isDir };
    }),
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
          decomposeNestedPerms,
        ),
      ),
    );

  await Promise.all(processTasks);
}
