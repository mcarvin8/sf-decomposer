/* eslint-disable no-await-in-loop */
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../service/core/checkLogforErrors.js';
import { recomposeFileHandler } from '../service/recompose/recomposeFileHandler.js';
import { LOG_FILE } from '../helpers/constants.js';
import { DecomposerResult, RecomposeOptions } from '../helpers/types.js';

export async function recomposeMetadataTypes(options: RecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, postpurge, debug, ignoreDirs, log, warn } = options;

  await Promise.all(
    metadataTypes.map(async (metadataType) => {
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

  return {
    metadata: metadataTypes,
  };
}
