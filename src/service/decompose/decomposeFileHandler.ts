'use strict';

import { resolve, relative, join, dirname, basename } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import { DisassembleXMLFileHandler } from 'config-disassembler';

import { CUSTOM_LABELS_FILE, CONCURRENCY_LIMITS } from '../../helpers/constants.js';
import { DecomposerOverride } from '../../helpers/types.js';
import { pLimit } from '../../helpers/pLimit.js';
import {
  ResolvedDecomposeTypeOptions,
  hasComponentOverridesForType,
  resolveDecomposeOptionsForComponent,
} from '../../helpers/configOverrides.js';
import { getMultiLevelDefault } from '../../metadata/getMultiLevelDefault.js';
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
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  overrides?: DecomposerOverride[],
  manifestXmlPaths?: Set<string>,
): Promise<void> {
  const { metadataPaths, metaSuffix, strictDirectoryName, folderType, uniqueIdElements } = metaAttributes;

  if (manifestXmlPaths && manifestXmlPaths.size > 0) {
    await decomposeFromManifest(
      manifestXmlPaths,
      uniqueIdElements,
      typeResolved,
      ignorePath,
      metaSuffix,
      strictDirectoryName,
      folderType,
      overrides,
    );
    return;
  }

  // Limit concurrent package directory processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);

  const tasks = metadataPaths.map((metadataPath) =>
    limit(async () => {
      if (strictDirectoryName || folderType) {
        await subDirectoryHandler(metadataPath, uniqueIdElements, typeResolved, ignorePath, metaSuffix, overrides);
      } else if (metaSuffix === 'labels') {
        // Labels live in a single shared file; component-scope overrides are not applicable.
        // Skip the prePurge flag in the disassembler for labels due to file moving.
        if (typeResolved.prepurge) await prePurgeLabels(metadataPath);
        const absoluteLabelFilePath = resolve(metadataPath, CUSTOM_LABELS_FILE);
        const relativeLabelFilePath = relative(process.cwd(), absoluteLabelFilePath);

        disassembleHandler(
          relativeLabelFilePath,
          uniqueIdElements,
          { ...typeResolved, prepurge: false },
          ignorePath,
          metaSuffix,
        );
        await moveAndRenameLabels(metadataPath);
      } else if (hasComponentOverridesForType(metaSuffix, overrides)) {
        await perFileHandler(metadataPath, uniqueIdElements, typeResolved, ignorePath, metaSuffix, overrides);
      } else {
        disassembleHandler(metadataPath, uniqueIdElements, typeResolved, ignorePath, metaSuffix);
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
  strictDirectoryName: boolean,
  folderType: string,
  overrides?: DecomposerOverride[],
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
        const relativeLabelFilePath = relative(process.cwd(), absoluteLabelFilePath);
        disassembleHandler(
          relativeLabelFilePath,
          uniqueIdElements,
          { ...typeResolved, prepurge: false },
          ignorePath,
          metaSuffix,
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
        const resolved = resolveDecomposeOptionsForComponent(metaSuffix, fullName, typeResolved, overrides);
        return disassembleHandler(parentDir, uniqueIdElements, resolved, ignorePath, metaSuffix);
      }),
    );
    await Promise.all(tasks);
    return;
  }

  const tasks = xmlPaths.map((xmlPath) =>
    limit(() => {
      const fullName = stripMetaSuffix(basename(xmlPath), metaSuffix);
      const resolved = resolveDecomposeOptionsForComponent(metaSuffix, fullName, typeResolved, overrides);
      return disassembleHandler(xmlPath, uniqueIdElements, resolved, ignorePath, metaSuffix);
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

function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  options: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
): void {
  const handler: DisassembleXMLFileHandler = new DisassembleXMLFileHandler();
  const effectiveStrategy = applyHardStrategyRules(metaSuffix, options.strategy);

  // Resolve multiLevel with this precedence:
  //   1. an explicit `multiLevel` set in the override (any metadata type);
  //   2. the built-in default for this metadata suffix when running unique-id strategy
  //      (see src/metadata/multiLevelDefaults.ts; covers `bot` and `loyaltyProgramSetup`).
  // The override may be a single rule (string) or several rules (string[]); both shapes are
  // forwarded verbatim — the crate decides how to split them. Empty arrays are rejected
  // upstream by validateMultiLevelSpec, so we don't need to guard against them here.
  let multiLevel: string | string[] | undefined = options.multiLevel;
  if (multiLevel === undefined && effectiveStrategy === 'unique-id') {
    multiLevel = getMultiLevelDefault(metaSuffix);
  }

  // Resolve splitTags with this precedence:
  //   1. an explicit `splitTags` set in the override (any metadata type, gated to grouped-by-tag);
  //   2. the hardcoded permission-set default when `decomposeNestedPermissions: true` is set on
  //      a permissionset / mutingpermissionset under grouped-by-tag.
  // splitTags is a no-op for non-grouped-by-tag strategies, so we never pass it otherwise.
  let splitTags: string | undefined;
  if (effectiveStrategy === 'grouped-by-tag') {
    if (options.splitTags) {
      splitTags = options.splitTags;
    } else if (
      options.decomposeNestedPerms &&
      (metaSuffix === 'permissionset' || metaSuffix === 'mutingpermissionset')
    ) {
      splitTags = 'objectPermissions:split:object,fieldPermissions:group:field';
    }
  }

  handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge: options.prepurge,
    postPurge: options.postpurge,
    ignorePath,
    format: options.format,
    strategy: effectiveStrategy,
    multiLevel,
    splitTags,
  });
}

/**
 * Hard plugin rules that always win over user-provided strategies. `labels` and
 * `loyaltyProgramSetup` are forced to `unique-id` regardless of run-, type-, or component-scope
 * configuration because their on-disk layout depends on it.
 */
function applyHardStrategyRules(metaSuffix: string, strategy: string): string {
  if (strategy !== 'grouped-by-tag') return strategy;
  if (metaSuffix === 'labels' || metaSuffix === 'loyaltyProgramSetup') return 'unique-id';
  return strategy;
}

function stripMetaSuffix(fileName: string, metaSuffix: string): string {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  /* istanbul ignore next -- @preserve: parseManifest always builds xml paths from `${member}.${suffix}-meta.xml`. Stryker disable next-line all */
  return fileName.endsWith(metaEnding) ? fileName.slice(0, -metaEnding.length) : fileName;
}

async function subDirectoryHandler(
  metadataPath: string,
  uniqueIdElements: string,
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  overrides?: DecomposerOverride[],
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
      processLimit(() => {
        const fullName = basename(subFilePath);
        const resolved = resolveDecomposeOptionsForComponent(metaSuffix, fullName, typeResolved, overrides);
        return disassembleHandler(subFilePath, uniqueIdElements, resolved, ignorePath, metaSuffix);
      }),
    );

  await Promise.all(processTasks);
}

/**
 * Per-file disassembly used when component-scope overrides are present for a non-strict, non-labels
 * metadata type. Walks the type's package directory, resolves options per file, and disassembles
 * each parent metadata XML individually so different components can use different strategies/formats.
 */
async function perFileHandler(
  metadataPath: string,
  uniqueIdElements: string,
  typeResolved: ResolvedDecomposeTypeOptions,
  ignorePath: string,
  metaSuffix: string,
  overrides?: DecomposerOverride[],
): Promise<void> {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  const entries = await readdir(metadataPath, { withFileTypes: true });
  const xmlEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith(metaEnding));

  const limit = pLimit(CONCURRENCY_LIMITS.SUBDIRECTORIES);
  const tasks = xmlEntries.map((entry) =>
    limit(() => {
      const filePath = join(metadataPath, entry.name);
      const fullName = entry.name.slice(0, -metaEnding.length);
      const resolved = resolveDecomposeOptionsForComponent(metaSuffix, fullName, typeResolved, overrides);
      return disassembleHandler(filePath, uniqueIdElements, resolved, ignorePath, metaSuffix);
    }),
  );

  await Promise.all(tasks);
}
