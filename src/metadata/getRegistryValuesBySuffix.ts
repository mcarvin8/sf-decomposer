'use strict';

import { RegistryAccess, MetadataType } from '@salesforce/source-deploy-retrieve';

import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../helpers/constants.js';
import { MetaAttributes } from '../helpers/types.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';
import { getPackageDirectories } from './getPackageDirectories.js';

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

  const registryAccess = getRegistryAccessInstance();
  let metadataTypeEntry: MetadataType | undefined = registryAccess.getTypeBySuffix(metaSuffix);

  if (metadataTypeEntry === undefined) {
    // Child types (e.g. recordType, customField) are not in the top-level suffix index.
    // Look them up via their parent and extract from children.types.
    const parentType = registryAccess.getParentType(metaSuffix.toLowerCase());
    metadataTypeEntry = parentType?.children?.types[metaSuffix.toLowerCase()];
  }

  if (metadataTypeEntry === undefined) throw Error(`Metadata type not found for the given suffix: ${metaSuffix}.`);

  if (
    metadataTypeEntry.strategies?.adapter &&
    ['matchingContentFile', 'digitalExperience', 'mixedContent', 'bundle'].includes(
      metadataTypeEntry.strategies.adapter,
    )
  ) {
    throw Error(
      `Metadata types with ${metadataTypeEntry.strategies.adapter} strategies are not supported by this plugin.`,
    );
  }

  let uniqueIdElements: string | undefined;
  if (command === 'decompose') uniqueIdElements = uniqueIdOverride ?? getUniqueIdElements(metaSuffix);
  const { metadataPaths, ignorePath } = await getPackageDirectories(
    `${metadataTypeEntry.directoryName}`,
    ignoreDirs,
    repoRootOverride,
  );
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
