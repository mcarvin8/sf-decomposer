'use strict';

import { readdir, stat } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { ReassembleXMLFileHandler } from 'config-disassembler';

import { CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';
import { reassembleLabels } from './reassembleLabels.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
  },
  postpurge: boolean,
  manifestXmlPaths?: Set<string>,
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths } = metaAttributes;

  if (manifestXmlPaths && manifestXmlPaths.size > 0) {
    await recomposeFromManifest(manifestXmlPaths, metaSuffix, strictDirectoryName, folderType, postpurge);
    return;
  }

  // Limit concurrent package directory processing
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);

  const tasks = metadataPaths.map((metadataPath) =>
    limit(async () => {
      if (metaSuffix === 'labels') {
        await reassembleLabels(metadataPath, metaSuffix, postpurge);
      } else {
        let recurse: boolean = false;
        if (strictDirectoryName || folderType) recurse = true;
        await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge);
      }

      if (metaSuffix === 'bot') await renameBotVersionFile(metadataPath);
    }),
  );

  await Promise.all(tasks);
}

async function recomposeFromManifest(
  manifestXmlPaths: Set<string>,
  metaSuffix: string,
  strictDirectoryName: boolean,
  folderType: string,
  postpurge: boolean,
): Promise<void> {
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);
  const xmlPaths = Array.from(manifestXmlPaths);

  if (metaSuffix === 'labels') {
    const labelDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(labelDirs).map((labelDir) =>
      limit(() => reassembleLabels(labelDir, metaSuffix, postpurge)),
    );
    await Promise.all(tasks);
    return;
  }

  if (strictDirectoryName || folderType) {
    // For strict types (e.g., bot), each parent xml lives in its own directory.
    // Dedupe by that parent directory and reassemble each decomposed child subdir.
    const parentDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(parentDirs).map((parentDir) =>
      limit(() => reassembleDirectories(parentDir, metaSuffix, false, postpurge)),
    );
    await Promise.all(tasks);

    /* istanbul ignore else -- @preserve: bot is the only strict-directory type that needs post-processing in tests. Stryker disable next-line ConditionalExpression */
    if (metaSuffix === 'bot') {
      // renameBotVersionFile expects the parent metadata directory (e.g. .../bots),
      // not the individual bot directory. Walk up one level and dedupe.
      const botContainerDirs = new Set(Array.from(parentDirs).map((parentDir) => dirname(parentDir)));
      for (const botContainerDir of botContainerDirs) {
        // eslint-disable-next-line no-await-in-loop
        await renameBotVersionFile(botContainerDir);
      }
    }
    return;
  }

  const tasks = xmlPaths.map((xmlPath) =>
    limit(async () => {
      const decomposedDir = decomposedDirForXml(xmlPath, metaSuffix);
      // Skip files that were never decomposed (e.g. metadata consisting only of leaf elements).
      if (!(await directoryExists(decomposedDir))) return;
      reassembleHandler(decomposedDir, `${metaSuffix}-meta.xml`, postpurge);
    }),
  );
  await Promise.all(tasks);
}

function decomposedDirForXml(xmlPath: string, metaSuffix: string): string {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  const fileName = basename(xmlPath);
  const stem = fileName.slice(0, -metaEnding.length);
  return join(dirname(xmlPath), stem);
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    // Stryker disable next-line BlockStatement
    return false;
  }
}

export function reassembleHandler(filePath: string, fileExtension: string, postPurge: boolean): void {
  const handler: ReassembleXMLFileHandler = new ReassembleXMLFileHandler();
  handler.reassemble({
    filePath,
    fileExtension,
    postPurge,
  });
}

async function reassembleDirectories(
  metadataPath: string,
  metaSuffix: string,
  recurse: boolean,
  postpurge: boolean,
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));

  // Limit concurrent stat operations
  const statLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const dirStats = await Promise.all(
    subdirectories.map((subdirectory) =>
      statLimit(async () => ({
        subdirectory,
        isDirectory: (await stat(subdirectory)).isDirectory(),
      })),
    ),
  );

  // Limit concurrent subdirectory processing
  const processLimit = pLimit(CONCURRENCY_LIMITS.SUBDIRECTORIES);
  const tasks = dirStats
    .filter(({ isDirectory }) => isDirectory)
    .map(({ subdirectory }) =>
      processLimit(async () => {
        if (recurse) {
          // recursively call this function and set recurse to false
          await reassembleDirectories(subdirectory, metaSuffix, false, postpurge);
        } else {
          reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge);
        }
      }),
    );

  await Promise.all(tasks);
}
