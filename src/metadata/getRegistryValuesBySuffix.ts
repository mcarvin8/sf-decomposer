'use strict';

import { RegistryAccess, MetadataType } from '@salesforce/source-deploy-retrieve';

import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../helpers/constants.js';
import { MetaAttributes } from '../helpers/types.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';
import { getPackageDirectories } from './getPackageDirectories.js';

export async function getRegistryValuesBySuffix(
  metaSuffix: string,
  command: string,
  ignoreDirs: string[] | undefined
): Promise<{ metaAttributes: MetaAttributes; ignorePath: string }> {
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
  if (command === 'decompose') uniqueIdElements = getUniqueIdElements(metaSuffix);
  const { metadataPaths, ignorePath } = await getPackageDirectories(`${metadataTypeEntry.directoryName}`, ignoreDirs);
  if (metadataPaths.length === 0)
    throw Error(`No directories named ${metadataTypeEntry.directoryName} were found in any package directory.`);

  const metaAttributes = {
    metaSuffix: metadataTypeEntry.suffix as string,
    strictDirectoryName: metadataTypeEntry.strictDirectoryName as boolean,
    folderType: metadataTypeEntry.folderType as string,
    metadataPaths,
    uniqueIdElements: uniqueIdElements
      ? `${DEFAULT_UNIQUE_ID_ELEMENTS},${uniqueIdElements}`
      : DEFAULT_UNIQUE_ID_ELEMENTS,
  };
  return { metaAttributes, ignorePath };
}
