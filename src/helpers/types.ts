'use strict';

import { Command, Config } from '@oclif/core';
import { ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';

export type DecomposerResult = {
  metadata: string[];
};

export type ConfigFile = {
  metadataSuffixes: string;
  prePurge: boolean;
  postPurge: boolean;
  decomposedFormat: string;
  ignorePackageDirectories: string;
  strategy: string;
};

export type SfdxProject = {
  packageDirectories: Array<{ path: string }>;
};

export type MetaAttributes = {
  metaSuffix: string;
  strictDirectoryName: boolean;
  folderType: string;
  metadataPaths: string[];
  uniqueIdElements: string;
};

export type UniqueIdElements = {
  [key: string]: {
    uniqueIdElements: string[];
  };
};

export type PostRetrieveHookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPostRetrieve;
  config: Config;
};

export type FieldPermission = {
  editable?: boolean;
  readable?: boolean;
  field: string;
};
