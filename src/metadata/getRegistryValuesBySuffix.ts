'use strict';

import { RegistryAccess, MetadataType } from '@salesforce/source-deploy-retrieve';

import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../helpers/constants.js';
import { InternalMetadataType, MetaAttributes } from '../helpers/types.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';
import { getPackageDirectories } from './getPackageDirectories.js';
import { internalRegistry } from './internalRegistry.js';

// Singleton instance for RegistryAccess to avoid repeated instantiation
let registryAccessInstance: RegistryAccess | null = null;

function getRegistryAccessInstance(): RegistryAccess {
  if (!registryAccessInstance) {
    registryAccessInstance = new RegistryAccess();
  }
  return registryAccessInstance;
}

export async function getRegistryValuesBySuffix(
  metaSuffix: string,
  command: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
  uniqueIdOverride?: string,
): Promise<{ metaAttributes: MetaAttributes; ignorePath: string }> {
  if (metaSuffix === 'object') {
    throw Error('Custom Objects are not supported by this plugin.');
  }
  if (metaSuffix === 'botVersion') {
    throw Error(
      '`botVersion` suffix should not be used. Please use `bot` to decompose/recompose bot and bot version files.',
    );
  }

  // Internal registry takes priority over SDR. Internal entries bypass the adapter-strategy
  // gate because the plugin explicitly supports decomposing these types.
  const internalEntry: InternalMetadataType | undefined = internalRegistry.find((e) => e.suffix === metaSuffix);

  let directoryName: string;
  let suffix: string;
  let strictDirectoryName: boolean;
  let folderType: string;

  if (internalEntry) {
    directoryName = internalEntry.directoryName;
    suffix = internalEntry.suffix;
    strictDirectoryName = internalEntry.strictDirectoryName ?? false;
    folderType = internalEntry.folderType as string;
  } else {
    const sdrEntry: MetadataType | undefined = getRegistryAccessInstance().getTypeBySuffix(metaSuffix);
    if (sdrEntry === undefined) throw Error(`Metadata type not found for the given suffix: ${metaSuffix}.`);

    if (
      sdrEntry.strategies?.adapter &&
      ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'].includes(sdrEntry.strategies.adapter)
    ) {
      throw Error(`Metadata types with ${sdrEntry.strategies.adapter} strategies are not supported by this plugin.`);
    }

    directoryName = sdrEntry.directoryName;
    suffix = sdrEntry.suffix as string;
    strictDirectoryName = sdrEntry.strictDirectoryName as boolean;
    folderType = sdrEntry.folderType as string;
  }

  let uniqueIdElements: string | undefined;
  if (command === 'decompose') uniqueIdElements = uniqueIdOverride ?? getUniqueIdElements(metaSuffix);
  const { metadataPaths, ignorePath } = await getPackageDirectories(directoryName, ignoreDirs, repoRootOverride);
  if (metadataPaths.length === 0)
    throw Error(`No directories named ${directoryName} were found in any package directory.`);

  const metaAttributes = {
    metaSuffix: suffix,
    strictDirectoryName,
    folderType,
    metadataPaths,
    uniqueIdElements: uniqueIdElements
      ? `${DEFAULT_UNIQUE_ID_ELEMENTS},${uniqueIdElements}`
      : DEFAULT_UNIQUE_ID_ELEMENTS,
  };
  return { metaAttributes, ignorePath };
}
