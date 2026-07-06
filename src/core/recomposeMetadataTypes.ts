'use strict';

import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { DecomposerResult, RecomposeOptions } from '../helpers/types.js';
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
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

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const processed: string[] = [];

  const tasks = effectiveTypes.map((metadataType) =>
    limit(async () => {
      const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);

      let metaAttributes;
      try {
        ({ metaAttributes } = await getRegistryValuesBySuffix(metadataType, 'recompose', ignoreDirs, repoRoot));
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
