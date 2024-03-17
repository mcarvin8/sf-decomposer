'use strict';

import { RegistryAccess, MetadataType } from '@salesforce/source-deploy-retrieve';
import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../helpers/constants.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';

interface MetaAttributes {
  metaSuffix: string;
  strictDirectoryName: boolean;
  folderType: string;
  metadataPath: string;
  uniqueIdElements: string;
}

export async function getRegistryValuesBySuffix(
  metaSuffix: string,
  dxDirectory: string,
  command: string
): Promise<MetaAttributes> {
  if (metaSuffix === 'object') {
    throw Error('Custom Objects are not supported by this plugin.');
  }
  if (metaSuffix === 'botVersion') {
    throw Error(
      '`botVersion` suffix should not be used. Please use `bot` to decompose/recompose bot and bot version files.'
    );
  }
  const registryAccess = new RegistryAccess();
  const metadataTypeEntry: MetadataType | undefined = registryAccess.getTypeBySuffix(metaSuffix);
  if (metadataTypeEntry === undefined) throw Error(`Metadata type not found for the given suffix: ${metaSuffix}.`);

  if (
    metadataTypeEntry.strategies?.adapter &&
    ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'].includes(
      metadataTypeEntry.strategies.adapter
    )
  ) {
    throw Error(
      `Metadata types with ${metadataTypeEntry.strategies.adapter} strategies are not supported by this plugin.`
    );
  }

  let uniqueIdElements: string | undefined;
  if (command === 'decompose') uniqueIdElements = await getUniqueIdElements(metaSuffix);

  const metaAttributes = {
    metaSuffix: metadataTypeEntry.suffix as string,
    strictDirectoryName: metadataTypeEntry.strictDirectoryName as boolean,
    folderType: metadataTypeEntry.folderType as string,
    metadataPath: `${dxDirectory}/${metadataTypeEntry.directoryName}`,
    uniqueIdElements: uniqueIdElements
      ? `${DEFAULT_UNIQUE_ID_ELEMENTS},${uniqueIdElements}`
      : DEFAULT_UNIQUE_ID_ELEMENTS,
  };
  return metaAttributes;
}
