/* eslint-disable no-await-in-loop */
import { getRegistryValuesBySuffix } from '../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../service/core/checkLogforErrors.js';
import { decomposeFileHandler } from '../service/decompose/decomposeFileHandler.js';
import { LOG_FILE } from '../helpers/constants.js';
import { DecomposerResult, DecomposeOptions } from '../helpers/types.js';

export async function decomposeMetadataTypes(options: DecomposeOptions): Promise<DecomposerResult> {
  const { metadataTypes, prepurge, postpurge, debug, format, ignoreDirs, strategy, decomposeNestedPerms, log, warn } =
    options;

  for (const metadataType of metadataTypes) {
    const { metaAttributes, ignorePath } = await getRegistryValuesBySuffix(metadataType, 'decompose', ignoreDirs);
    let effectiveStrategy = strategy;

    if (metadataType === 'labels' && strategy === 'grouped-by-tag') {
      warn('Overriding strategy to "unique-id" for custom labels, as "grouped-by-tag" is not supported.');
      effectiveStrategy = 'unique-id';
    }

    if (metadataType === 'loyaltyProgramSetup' && strategy === 'grouped-by-tag') {
      warn('Overriding strategy to "unique-id" for loyaltyProgramSetup, as "grouped-by-tag" is not supported.');
      effectiveStrategy = 'unique-id';
    }

    const currentLogFile = await readOriginalLogFile(LOG_FILE);
    await decomposeFileHandler(
      metaAttributes,
      prepurge,
      postpurge,
      debug,
      format,
      ignorePath,
      effectiveStrategy,
      decomposeNestedPerms
    );

    const decomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
    if (decomposeErrors.length > 0) {
      decomposeErrors.forEach((error) => warn(error));
    }

    log(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
  }

  return { metadata: metadataTypes };
}
