/* eslint-disable no-await-in-loop */
import pLimit from 'p-limit';
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { decomposeFileHandler } from '../service/decompose/decomposeFileHandler.js';
import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { DecomposerResult, DecomposeOptions } from '../helpers/types.js';

export async function decomposeMetadataTypes(options: DecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, prepurge, postpurge, format, ignoreDirs, strategy, decomposeNestedPerms, log } = options;

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const tasks = metadataTypes.map((metadataType) =>
    limit(async () => {
      const { metaAttributes, ignorePath } = await getRegistryValuesBySuffix(metadataType, 'decompose', ignoreDirs);
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
        decomposeNestedPerms
      );

      log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    })
  );

  await Promise.all(tasks);

  return { metadata: metadataTypes };
}
