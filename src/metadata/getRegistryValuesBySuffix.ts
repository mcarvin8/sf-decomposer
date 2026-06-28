'use strict';

import { MetadataType, RegistryAccess } from '@salesforce/source-deploy-retrieve';

import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../helpers/constants.js';
import { MetaAttributes } from '../helpers/types.js';
import { getPackageDirectories } from './getPackageDirectories.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';

// Singleton instance for RegistryAccess to avoid repeated instantiation
let registryAccessInstance: RegistryAccess | null = null;
// Lazy-built reverse map: suffix → child MetadataType (for child types whose suffix differs from xmlName)
let childSuffixMap: Map<string, MetadataType> | null = null;

function getRegistryAccessInstance(): RegistryAccess {
  if (!registryAccessInstance) {
    registryAccessInstance = new RegistryAccess();
  }
  return registryAccessInstance;
}

function getChildSuffixMap(registryAccess: RegistryAccess): Map<string, MetadataType> {
  if (!childSuffixMap) {
    childSuffixMap = new Map();
    const reg = (registryAccess as unknown as { registry: { childTypes: Record<string, string> } }).registry;
    for (const childXmlNameLower of Object.keys(reg.childTypes)) {
      const parentType = registryAccess.getParentType(childXmlNameLower);
      const childEntry = parentType?.children?.types[childXmlNameLower];
      /* v8 ignore next -- defensive guard; SDR registry always provides a suffix for child types */
      if (childEntry?.suffix) {
        childSuffixMap.set(childEntry.suffix, childEntry);
      }
    }
  }
  return childSuffixMap;
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
    // Child types are not in the top-level suffix index. children.types is keyed by lowercased
    // xmlName, not suffix — so 'recordType' works (suffix === xmlName lowercased) but 'field'
    // (xmlName: CustomField) does not. Fall back to the pre-built suffix map.
    metadataTypeEntry = getChildSuffixMap(registryAccess).get(metaSuffix);
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
