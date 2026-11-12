'use strict';

// Shape of entries in the vendored metadataRegistry.json (a subset of
// @salesforce/source-deploy-retrieve's MetadataType, limited to the fields this plugin reads).
// See registryAccess.ts and .github/workflows/sync-metadata-registry.yml for how this file is kept
// current with upstream.
export type MetadataType = {
  id: string;
  name: string;
  suffix?: string;
  directoryName: string;
  strictDirectoryName?: boolean;
  folderType?: string;
  folderContentType?: string;
  inFolder?: boolean;
  aliasFor?: string;
  /** `false` on child types that can't be addressed on their own (e.g. CustomFieldTranslation). */
  isAddressable?: boolean;
  strategies?: {
    adapter?: string;
  };
  children?: {
    types: Record<string, MetadataType>;
  };
};

export type MetadataRegistryData = {
  types: Record<string, MetadataType>;
  childTypes: Record<string, string>;
  suffixes: Record<string, string>;
  strictDirectoryNames: Record<string, string>;
};
