'use strict';
export type ConfigFile = {
  metadataSuffixes: string;
  prePurge: boolean;
  postPurge: boolean;
  decomposedFormat: string;
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
