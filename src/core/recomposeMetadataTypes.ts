/* eslint-disable no-await-in-loop */
import pLimit from 'p-limit';
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../service/core/checkLogforErrors.js';
import { recomposeFileHandler } from '../service/recompose/recomposeFileHandler.js';
import { LOG_FILE, CONCURRENCY_LIMITS } from '../helpers/constants.js';
import { DecomposerResult, RecomposeOptions } from '../helpers/types.js';

export async function recomposeMetadataTypes(options: RecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, postpurge, debug, ignoreDirs, log, warn } = options;

  // Limit concurrent metadata type processing to prevent file system overload
  const limit = pLimit(CONCURRENCY_LIMITS.METADATA_TYPES);

  const tasks = metadataTypes.map((metadataType) =>
    limit(async () => {
      const { metaAttributes } = await getRegistryValuesBySuffix(metadataType, 'recompose', ignoreDirs);

      const currentLogFile = await readOriginalLogFile(LOG_FILE);
      await recomposeFileHandler(metaAttributes, postpurge, debug);

      const recomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
      if (recomposeErrors.length > 0) {
        recomposeErrors.forEach((error) => warn(error));
      }

      log(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
    })
  );

  await Promise.all(tasks);

  return {
    metadata: metadataTypes,
  };
}
