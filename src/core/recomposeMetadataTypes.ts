/* eslint-disable no-await-in-loop */
import pLimit from 'p-limit';
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { recomposeFileHandler } from '../service/recompose/recomposeFileHandler.js';
import { CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { DecomposerResult, RecomposeOptions } from '../helpers/types.js';

export async function recomposeMetadataTypes(options: RecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, postpurge, ignoreDirs, log } = options;

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const tasks = metadataTypes.map((metadataType) =>
    limit(async () => {
      const { metaAttributes } = await getRegistryValuesBySuffix(metadataType, 'recompose', ignoreDirs);
      await recomposeFileHandler(metaAttributes, postpurge);
      log(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
    })
  );

  await Promise.all(tasks);

  return {
    metadata: metadataTypes,
  };
}
