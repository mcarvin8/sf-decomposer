'use strict';

import pLimit from 'p-limit';
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { parseManifest, ManifestFilter } from '../metadata/parseManifest.js';
import { decomposeFileHandler } from '../service/decompose/decomposeFileHandler.js';
import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { DecomposerResult, DecomposeOptions } from '../helpers/types.js';

export async function decomposeMetadataTypes(options: DecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, prepurge, postpurge, format, ignoreDirs, strategy, decomposeNestedPerms, manifest, log } =
    options;

  let manifestFilter: ManifestFilter | undefined;
  let effectiveTypes: string[];

  if (manifest) {
    manifestFilter = await parseManifest(manifest, ignoreDirs);
    if (metadataTypes && metadataTypes.length > 0) {
      const manifestTypes = new Set(manifestFilter.suffixes);
      effectiveTypes = metadataTypes.filter((type) => manifestTypes.has(type));
    } else {
      effectiveTypes = manifestFilter.suffixes;
    }
  } else {
    if (!metadataTypes || metadataTypes.length === 0) {
      throw Error('Either --metadata-type or --manifest must be provided.');
    }
    effectiveTypes = metadataTypes;
  }

  if (effectiveTypes.length === 0) {
    log('No metadata types to decompose after applying the manifest filter.');
    return { metadata: [] };
  }

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const processed: string[] = [];

  const tasks = effectiveTypes.map((metadataType) =>
    limit(async () => {
      const manifestXmlPaths = manifestFilter?.parentXmlsBySuffix.get(metadataType);

      let metaAttributes;
      let ignorePath: string;
      try {
        ({ metaAttributes, ignorePath } = await getRegistryValuesBySuffix(metadataType, 'decompose', ignoreDirs));
      } catch (err) {
        if (manifestFilter) {
          const message = err instanceof Error ? err.message : String(err);
          log(`Skipping ${metadataType}: ${message}`);
          return;
        }
        throw err;
      }

      let effectiveStrategy = strategy;

      if (metadataType === 'labels' && strategy === 'grouped-by-tag') {
        effectiveStrategy = 'unique-id';
      }

      if (metadataType === 'loyaltyProgramSetup' && strategy === 'grouped-by-tag') {
        effectiveStrategy = 'unique-id';
      }

      await decomposeFileHandler(
        metaAttributes,
        prepurge,
        postpurge,
        format,
        ignorePath,
        effectiveStrategy,
        decomposeNestedPerms,
        manifestXmlPaths,
      );

      processed.push(metadataType);
      log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }),
  );

  await Promise.all(tasks);

  return { metadata: processed };
}
