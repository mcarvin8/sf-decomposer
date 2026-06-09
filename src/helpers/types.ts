'use strict';

import { Command, Config } from '@oclif/core';
import { ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';

export type DecomposerResult = {
  metadata: string[];
};

export type DecomposerOverride = {
  /** Suffix-scoped targets (e.g. `permissionset`). Applies to every component of the type. */
  metadataTypes?: string[];
  /** Component-scoped targets in the form `<suffix>:<fullName>` (e.g. `permissionset:HR_Admin`). */
  components?: string[];
  decomposedFormat?: string;
  strategy?: string;
  decomposeNestedPermissions?: boolean;
  /**
   * Custom `splitTags` spec for `grouped-by-tag` strategy. Comma-separated rules of the form
   * `<tag>:<mode>:<field>` or `<tag>:<path>:<mode>:<field>`, where `mode` is `split` (one file
   * per array item, filename from `field`) or `group` (array items grouped by `field`, one file
   * per group). When set, this wins over the hardcoded `decomposeNestedPermissions` default
   * for permission sets. Only applied when the resolved strategy is `grouped-by-tag`.
   */
  splitTags?: string;
  /**
   * Custom `multiLevel` spec(s) for nested-array decomposition. Each rule has the form
   * `<file_pattern>:<root_to_strip>:<unique_id_elements>` (the third part is itself a
   * comma-separated list). Pass a string for a single rule, a string[] for several rules
   * (preferred), or a single `;`-separated string. When set, this wins over the hardcoded
   * `loyaltyProgramSetup` default. Applies regardless of strategy because multiLevel
   * works on a per-file pattern.
   */
  multiLevel?: string | string[];
  /**
   * Comma-separated list of XML element names (and optional compound keys joined by `+`)
   * used to derive stable filenames during `unique-id` decomposition. When set, this
   * replaces the hardcoded per-type list from the built-in registry (the global defaults
   * `fullName` and `name` are always prepended regardless). Useful for metadata types not
   * yet covered by the built-in registry, or when the default selection produces collisions.
   * Example: `"developerName,apiName"` or `"actionName+pageOrSobjectType+formFactor"`.
   */
  uniqueIdElements?: string;
  prePurge?: boolean;
  postPurge?: boolean;
};

export type ConfigFile = {
  metadataSuffixes: string;
  prePurge: boolean;
  postPurge: boolean;
  decomposedFormat: string;
  ignorePackageDirectories: string;
  strategy: string;
  decomposeNestedPermissions: boolean;
  updateForceignore?: boolean;
  manifest?: string;
  overrides?: DecomposerOverride[];
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
  metadataTypes?: string[];
  prepurge: boolean;
  postpurge: boolean;
  format: string;
  ignoreDirs?: string[];
  strategy: string;
  decomposeNestedPerms: boolean;
  manifest?: string;
  overrides?: DecomposerOverride[];
  updateForceignore?: boolean;
  log: (msg: string) => void;
  repoRoot?: string;
};

export type RecomposeOptions = {
  metadataTypes?: string[];
  postpurge: boolean;
  ignoreDirs?: string[];
  manifest?: string;
  log: (msg: string) => void;
  repoRoot?: string;
};

export type VerifyOptions = {
  metadataTypes?: string[];
  format: string;
  ignoreDirs?: string[];
  strategy: string;
  decomposeNestedPerms: boolean;
  manifest?: string;
  overrides?: DecomposerOverride[];
  log: (msg: string) => void;
};

export type VerifyDrift = {
  /** Path of the offending file relative to its package directory. */
  path: string;
  /** Short human-readable reason: `'content drift'` or `'missing in round-trip output'`. */
  reason: string;
};

export type VerifyResult = {
  /** Metadata types that participated in the round trip. */
  metadata: string[];
  /** One entry per file that did not survive the round trip semantically. Empty on success. */
  drift: VerifyDrift[];
  /**
   * Files where the only delta was sibling/attribute ordering — content is semantically identical
   * but not byte-identical. Reported for awareness; does not fail `verify`.
   */
  reordered: string[];
};
