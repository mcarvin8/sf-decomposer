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
  decomposeNestedPermissions: boolean;
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

export type PostRetrieveHookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPostRetrieve;
  config: Config;
};

export type FieldPermission = {
  editable?: boolean;
  field: string;
  readable?: boolean;
};

export type DecomposeOptions = {
  metadataTypes: string[];
  prepurge: boolean;
  postpurge: boolean;
  debug: boolean;
  format: string;
  ignoreDirs?: string[];
  strategy: string;
  decomposeNestedPerms: boolean;
  log: (msg: string) => void;
  warn: (msg: string) => void;
};

export type RecomposeOptions = {
  metadataTypes: string[];
  postpurge: boolean;
  debug: boolean;
  ignoreDirs?: string[];
  log: (msg: string) => void;
  warn: (msg: string) => void;
};
