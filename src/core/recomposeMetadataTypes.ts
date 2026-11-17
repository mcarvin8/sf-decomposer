'use strict';

import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { DecomposerResult, PathIndex, RecomposeOptions } from '../helpers/types.js';
import { buildPackageDirectoryIndex } from '../metadata/getPackageDirectories.js';
import {
  findsFilesBySuffix,
  getRegistryValuesBySuffix,
  resolveMetadataTypeEntry,
} from '../metadata/getRegistryValuesBySuffix.js';
import { resolveEffectiveMetadataTypes } from '../metadata/parseManifest.js';
import { recomposeFileHandler } from '../service/recompose/recomposeFileHandler.js';

export async function recomposeMetadataTypes(options: RecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, postpurge, ignoreDirs, manifest, log, repoRoot } = options;

  const { manifestFilter, effectiveTypes } = await resolveEffectiveMetadataTypes(
    metadataTypes,
    manifest,
    ignoreDirs,
    repoRoot,
    log,
  );

  if (effectiveTypes.length === 0) {
    log('No metadata types to recompose after applying the manifest filter.');
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

  const tasks = effectiveTypes.map((metadataType) =>
    limit(async () => {
      const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);

      let metaAttributes;
      try {
        ({ metaAttributes } = await getRegistryValuesBySuffix(
          metadataType,
          'recompose',
          ignoreDirs,
          repoRoot,
          undefined,
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

      await recomposeFileHandler(metaAttributes, postpurge, manifestXmlPaths);
      processed.push(metadataType);
      log(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
    }),
  );

  await Promise.all(tasks);

  return {
    metadata: processed,
  };
}
