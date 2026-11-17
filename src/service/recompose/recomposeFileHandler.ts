'use strict';

import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { ReassembleXMLFileHandler } from 'config-disassembler';

import { CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';
import { directoryOccupancy, isDecomposedDirOfType } from '../../metadata/sharedDirectories.js';
import { reassembleLabels } from './reassembleLabels.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
    typeName?: string;
    extraPaths?: string[];
  },
  postpurge: boolean,
  manifestXmlPaths?: Set<string>,
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths, typeName, extraPaths } = metaAttributes;
  const extra = new Set(extraPaths ?? []);

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
        // A folder the type's files were found in by suffix isn't named after the type and can hold
        // other types' decomposed directories: identify this type's strictly.
        const owner: DirectoryOwner | undefined =
          extra.has(metadataPath) && typeName
            ? { typeName, shared: true, requireSidecar: true }
            : directoryOwner(basename(metadataPath), metaSuffix);
        await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge, owner);
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
      limit(() =>
        reassembleDirectories(
          parentDir,
          metaSuffix,
          false,
          postpurge,
          directoryOwner(basename(dirname(parentDir)), metaSuffix),
        ),
      ),
    );
    await Promise.all(tasks);

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
      await reassembleHandler(decomposedDir, `${metaSuffix}-meta.xml`, postpurge);
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
    // The only caller negates this with `!`, so an empty catch (implicit `undefined`) would be
    // behaviorally identical to `return false` here -- this is an intentionally equivalent mutant.
    return false;
  }
}

export async function reassembleHandler(filePath: string, fileExtension: string, postPurge: boolean): Promise<void> {
  const handler: ReassembleXMLFileHandler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    filePath,
    fileExtension,
    postPurge,
  });
}

/**
 * The registry type that owns `metaSuffix` in `directoryName`, so `reassembleDirectories` only
 * rebuilds the decomposed directories that belong to it. Every directory needs the check, not just
 * ones shared with another type: a metadata directory can also hold folders that aren't metadata at
 * all (e.g. UTAM page objects in `flexipages/__utam__/`), which used to be rebuilt as
 * `__utam__.flexipage-meta.xml` and then deleted by --postpurge.
 */
type DirectoryOwner = { typeName: string; shared: boolean; requireSidecar?: boolean };

function directoryOwner(directoryName: string, metaSuffix: string): DirectoryOwner | undefined {
  const { typeName, others } = directoryOccupancy(directoryName, metaSuffix);
  return typeName ? { typeName, shared: others.length > 0 } : undefined;
}

/**
 * Whether `dir` is a decomposed `metaSuffix` directory of the owning type. A bot's folder also holds
 * its versions' decomposed directories, which recompose rebuilds with the bot suffix and
 * `renameBotVersionFile` then renames.
 */
async function isOwnDecomposedDir(dir: string, metaSuffix: string, owner: DirectoryOwner): Promise<boolean> {
  const options = { shared: owner.shared, requireSidecar: owner.requireSidecar };
  try {
    if (await isDecomposedDirOfType(dir, metaSuffix, owner.typeName, options)) return true;
    return metaSuffix === 'bot' && (await isDecomposedDirOfType(dir, 'botVersion', 'BotVersion', options));
  } catch {
    // The directory was rebuilt and removed by another type's recompose while being checked.
    return false;
  }
}

async function reassembleDirectories(
  metadataPath: string,
  metaSuffix: string,
  recurse: boolean,
  postpurge: boolean,
  owner?: DirectoryOwner,
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));

  // Limit concurrent stat operations
  const statLimit = pLimit(CONCURRENCY_LIMITS.FILE_OPERATIONS);
  const dirStats = await Promise.all(
    subdirectories.map((subdirectory) =>
      statLimit(async () => ({
        subdirectory,
        // Another type's recompose may rebuild and remove a directory in a shared or custom-named
        // folder while this one walks it: a vanished entry simply isn't ours.
        isDirectory: (await stat(subdirectory).catch(() => undefined))?.isDirectory() ?? false,
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
          await reassembleDirectories(subdirectory, metaSuffix, false, postpurge, owner);
        } else {
          // Skip other types' decomposed directories, plain subfolders of metadata files and folders
          // that aren't metadata, rather than rebuilding them as `<dir>.<this suffix>-meta.xml`.
          if (owner && !(await isOwnDecomposedDir(subdirectory, metaSuffix, owner))) return;
          await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge);
        }
      }),
    );

  await Promise.all(tasks);
}
