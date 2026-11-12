'use strict';

import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { DisassembleXMLFileHandler } from 'config-disassembler';
import {
  hasComponentOverridesForType,
  ResolvedDecomposeTypeOptions,
  resolveDecomposeOptionsForComponent,
} from '../../helpers/configOverrides.js';
import { CONCURRENCY_LIMITS, CUSTOM_LABELS_FILE } from '../../helpers/constants.js';
import { pLimit } from '../../helpers/pLimit.js';
import { DecomposerOverride } from '../../helpers/types.js';
import { directoryOccupancy } from '../../metadata/sharedDirectories.js';
import { moveAndRenameLabels, prePurgeLabels } from './customLabels.js';
import { renameWorkflows } from './renameWorkflows.js';
import { resolveEffectiveDisassembleOptions } from './resolveEffectiveDisassembleOptions.js';

export async function decomposeFileHandler(
  metaAttributes: {
    metadataType?: string;
    metadataPaths: string[];
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    uniqueIdElements: string;
  },
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  overrides?: DecomposerOverride[],
  manifestXmlPaths?: Set<string>,
  repoRoot?: string,
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;
  // Overrides are keyed by the value the type was selected by: its suffix, or its type name for a
  // type that loses a shared suffix (e.g. CustomSite). File matching always uses metaSuffix.
  const overrideKey = metaAttributes.metadataType ?? metaSuffix;

  if (manifestXmlPaths && manifestXmlPaths.size > 0) {
    await decomposeFromManifest(
      manifestXmlPaths,
      uniqueIdElements,
      typeResolved,
      ignorePath,
      metaSuffix,
      overrideKey,
      strictDirectoryName,
      folderType,
      overrides,
      repoRoot,
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
          typeResolved,
          ignorePath,
          metaSuffix,
          overrideKey,
          overrides,
          repoRoot,
        );
      } else if (metaSuffix === 'labels') {
        // Labels live in a single shared file; component-scope overrides are not applicable.
        // Skip the prePurge flag in the disassembler for labels due to file moving.
        if (typeResolved.prepurge) await prePurgeLabels(metadataPath);
        const absoluteLabelFilePath = resolve(metadataPath, CUSTOM_LABELS_FILE);

        await disassembleHandler(
          absoluteLabelFilePath,
          uniqueIdElements,
          { ...typeResolved, prepurge: false },
          ignorePath,
          metaSuffix,
          repoRoot,
        );
        await moveAndRenameLabels(metadataPath);
      } else if (
        hasComponentOverridesForType(overrideKey, overrides) ||
        // The directory can also hold other types' files (e.g. `moderation` holds KeywordList and
        // ModerationRule): handing the disassembler the whole directory would decompose those too,
        // so disassemble only this type's `.<suffix>-meta.xml` files.
        directoryOccupancy(basename(metadataPath), metaSuffix).others.length > 0
      ) {
        await perFileHandler(
          metadataPath,
          uniqueIdElements,
          typeResolved,
          ignorePath,
          metaSuffix,
          overrideKey,
          overrides,
          repoRoot,
        );
      } else {
        await disassembleHandler(metadataPath, uniqueIdElements, typeResolved, ignorePath, metaSuffix, repoRoot);
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
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  overrideKey: string,
  strictDirectoryName: boolean,
  folderType: string,
  overrides?: DecomposerOverride[],
  repoRoot?: string,
): Promise<void> {
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);
  const xmlPaths = Array.from(manifestXmlPaths);

  if (metaSuffix === 'labels') {
    // Labels have a single source file per labels directory; dedupe by containing dir.
    const labelDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(labelDirs).map((labelDir) =>
      limit(async () => {
        if (typeResolved.prepurge) await prePurgeLabels(labelDir);
        const absoluteLabelFilePath = resolve(labelDir, CUSTOM_LABELS_FILE);
        await disassembleHandler(
          absoluteLabelFilePath,
          uniqueIdElements,
          { ...typeResolved, prepurge: false },
          ignorePath,
          metaSuffix,
          repoRoot,
        );
        await moveAndRenameLabels(labelDir);
      }),
    );
    await Promise.all(tasks);
    return;
  }

  if (strictDirectoryName || folderType) {
    // Each parent xml lives inside its own strict subdirectory (e.g. bots/MyBot/MyBot.bot-meta.xml),
    // or, for folder-typed metadata, inside its containing folder (e.g. reports/MyFolder/MyReport.report-meta.xml).
    // Dedupe by parent directory and disassemble the whole subdirectory; the parent directory's basename
    // is the canonical fullName for component-scope override matching.
    const parentDirs = new Set(xmlPaths.map((xml) => dirname(xml)));
    const tasks = Array.from(parentDirs).map((parentDir) =>
      limit(() => {
        const fullName = basename(parentDir);
        const resolved = resolveDecomposeOptionsForComponent(overrideKey, fullName, typeResolved, overrides);
        return disassembleHandler(parentDir, uniqueIdElements, resolved, ignorePath, metaSuffix, repoRoot);
      }),
    );
    await Promise.all(tasks);
    return;
  }

  const tasks = xmlPaths.map((xmlPath) =>
    limit(() => {
      const fullName = stripMetaSuffix(basename(xmlPath), metaSuffix);
      const resolved = resolveDecomposeOptionsForComponent(overrideKey, fullName, typeResolved, overrides);
      return disassembleHandler(xmlPath, uniqueIdElements, resolved, ignorePath, metaSuffix, repoRoot);
    }),
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

async function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  options: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  repoRoot?: string,
): Promise<void> {
  const handler: DisassembleXMLFileHandler = new DisassembleXMLFileHandler();
  const { strategy, multiLevel, splitTags, sidecarElements } = resolveEffectiveDisassembleOptions(metaSuffix, options);

  await handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge: options.prepurge,
    postPurge: options.postpurge,
    ignorePath,
    format: options.format,
    strategy,
    multiLevel,
    splitTags,
    sidecarElements,
    baseDir: repoRoot,
  });
}

function stripMetaSuffix(fileName: string, metaSuffix: string): string {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  /* istanbul ignore next -- @preserve: parseManifest always builds xml paths from `${member}.${suffix}-meta.xml`. */
  return fileName.endsWith(metaEnding) ? fileName.slice(0, -metaEnding.length) : fileName;
}

async function subDirectoryHandler(
  metadataPath: string,
  uniqueIdElements: string,
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  overrideKey: string,
  overrides?: DecomposerOverride[],
  repoRoot?: string,
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
  const processLimit = pLimit(CONCURRENCY_LIMITS.PER_FILE_DISASSEMBLE);
  const processTasks = statResults
    .filter(({ isDir }) => isDir)
    .map(({ subFilePath }) =>
      processLimit(() => {
        const fullName = basename(subFilePath);
        const resolved = resolveDecomposeOptionsForComponent(overrideKey, fullName, typeResolved, overrides);
        return disassembleHandler(subFilePath, uniqueIdElements, resolved, ignorePath, metaSuffix, repoRoot);
      }),
    );

  await Promise.all(processTasks);
}

/**
 * Per-file disassembly for a non-strict, non-labels metadata type, used when component-scope
 * overrides are present or when the directory is shared with other metadata types. Walks the type's
 * package directory, resolves options per file, and disassembles each `.<suffix>-meta.xml` file
 * individually, so different components can use different strategies/formats and other types' files
 * are left alone.
 */
async function perFileHandler(
  metadataPath: string,
  uniqueIdElements: string,
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  overrideKey: string,
  overrides?: DecomposerOverride[],
  repoRoot?: string,
): Promise<void> {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  const entries = await readdir(metadataPath, { withFileTypes: true });
  const xmlEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith(metaEnding));

  const limit = pLimit(CONCURRENCY_LIMITS.PER_FILE_DISASSEMBLE);
  const tasks = xmlEntries.map((entry) =>
    limit(() => {
      const filePath = join(metadataPath, entry.name);
      const fullName = entry.name.slice(0, -metaEnding.length);
      const resolved = resolveDecomposeOptionsForComponent(overrideKey, fullName, typeResolved, overrides);
      return disassembleHandler(filePath, uniqueIdElements, resolved, ignorePath, metaSuffix, repoRoot);
    }),
  );

  await Promise.all(tasks);
}
