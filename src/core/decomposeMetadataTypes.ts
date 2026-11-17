'use strict';

import { basename, dirname, relative, sep } from 'node:path';
import { resolveDecomposeOptionsForType } from '../helpers/configOverrides.js';
import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { DecomposeOptions, DecomposerResult, PathIndex } from '../helpers/types.js';
import { buildPackageDirectoryIndex } from '../metadata/getPackageDirectories.js';
import {
  findsFilesBySuffix,
  getRegistryValuesBySuffix,
  resolveMetadataTypeEntry,
} from '../metadata/getRegistryValuesBySuffix.js';
import { resolveEffectiveMetadataTypes } from '../metadata/parseManifest.js';
import { ProcessedMeta, updateForceignoreFile } from '../service/core/updateForceignore.js';
import { updateGitattributesFile } from '../service/core/updateGitattributes.js';
import { decomposeFileHandler } from '../service/decompose/decomposeFileHandler.js';

export async function decomposeMetadataTypes(options: DecomposeOptions): Promise<DecomposerResult> {
  const {
    metadataTypes,
    prepurge,
    postpurge,
    format,
    ignoreDirs,
    strategy,
    decomposeNestedPerms,
    manifest,
    overrides,
    updateForceignore,
    updateGitattributes,
    log,
    repoRoot,
  } = options;

  const { manifestFilter, effectiveTypes } = await resolveEffectiveMetadataTypes(
    metadataTypes,
    manifest,
    ignoreDirs,
    repoRoot,
    log,
  );

  if (effectiveTypes.length === 0) {
    log('No metadata types to decompose after applying the manifest filter.');
    return { metadata: [] };
  }

  // In manifest mode, parseManifest already built a directory index covering every type it
  // found -- reuse it rather than walking the same tree a second time. Otherwise, resolve every
  // requested type's directoryName up front so the filesystem walk below covers all of them in
  // one pass, instead of each type re-walking the whole package directory tree. Unsupported/
  // unknown suffixes are skipped here; the per-type getRegistryValuesBySuffix call below still
  // throws (and, in manifest mode, is caught/logged there) exactly as it does today.
  let pathIndex: PathIndex;
  if (manifestFilter) {
    pathIndex = manifestFilter.directoryIndex;
  } else {
    const directoryNames = new Set<string>();
    const suffixes = new Set<string>();
    for (const metadataType of effectiveTypes) {
      try {
        const entry = resolveMetadataTypeEntry(metadataType);
        directoryNames.add(`${entry.directoryName}`);
        if (findsFilesBySuffix(entry)) suffixes.add(entry.suffix as string);
      } catch {
        /* istanbul ignore next -- @preserve: handled per-type by getRegistryValuesBySuffix below */
      }
    }
    pathIndex = await buildPackageDirectoryIndex(directoryNames, ignoreDirs, repoRoot, suffixes);
  }

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const processed: string[] = [];
  const processedMeta: ProcessedMeta[] = [];
  let effectiveRepoRoot: string | undefined;

  const tasks = effectiveTypes.map((metadataType) =>
    limit(async () => {
      const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);

      // Type-scope resolved options serve as the base for component-scope resolution further
      // down the call stack. Hard strategy rules (labels / loyaltyProgramSetup) are applied per
      // file inside the disassembler so they remain in force even when a component-scope override
      // tries to flip the strategy.
      const typeResolved = resolveDecomposeOptionsForType(
        metadataType,
        { format, strategy, decomposeNestedPerms, prepurge, postpurge },
        overrides,
      );

      let metaAttributes;
      let ignorePath: string;
      try {
        ({ metaAttributes, ignorePath } = await getRegistryValuesBySuffix(
          metadataType,
          'decompose',
          ignoreDirs,
          repoRoot,
          typeResolved.uniqueIdElements,
          pathIndex,
        ));
      } catch (err) {
        /* istanbul ignore if -- @preserve: preserves non-manifest behavior; unreachable via known CLI types */
        if (!manifestFilter) throw err;
        /* istanbul ignore next -- @preserve: getRegistryValuesBySuffix always throws Error instances */
        const message = err instanceof Error ? err.message : String(err);
        log(`Skipping ${metadataType}: ${message}`);
        return;
      }

      await decomposeFileHandler(
        metaAttributes,
        typeResolved,
        ignorePath,
        overrides,
        manifestXmlPaths,
        dirname(ignorePath),
      );

      processed.push(metadataType);
      if (updateForceignore || updateGitattributes) {
        const repoRootDir = dirname(ignorePath);
        processedMeta.push({
          directoryName: metaAttributes.directoryName ?? basename(metaAttributes.metadataPaths[0]),
          metaSuffix: metaAttributes.metaSuffix,
          format: typeResolved.format,
          // Folders found by suffix (custom names, nested subfolders) need patterns of their own.
          extraDirs: (metaAttributes.extraPaths ?? []).map((path) => relative(repoRootDir, path).split(sep).join('/')),
        });
        effectiveRepoRoot ??= repoRootDir;
      }
      log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }),
  );

  await Promise.all(tasks);

  if (updateForceignore && processedMeta.length > 0 && effectiveRepoRoot) {
    await updateForceignoreFile(processedMeta, effectiveRepoRoot);
    log('Updated .forceignore with decomposed file paths.');
  }

  if (updateGitattributes && processedMeta.length > 0 && effectiveRepoRoot) {
    await updateGitattributesFile(processedMeta, effectiveRepoRoot);
    log('Updated .gitattributes with root metadata file patterns.');
  }

  return { metadata: processed };
}
