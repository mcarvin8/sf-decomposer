'use strict';

import * as core from '@actions/core';

export function multilineInput(name: string): string[] | undefined {
  const values = core
    .getMultilineInput(name)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return values.length > 0 ? values : undefined;
}

export function optionalInput(name: string): string | undefined {
  const value = core.getInput(name);
  return value === '' ? undefined : value;
}

export function requireMetadataTypesOrManifest(
  metadataTypes: string[] | undefined,
  manifest: string | undefined,
): void {
  if (!metadataTypes?.length && !manifest) {
    throw new Error(
      "Either the 'metadata-type' or 'manifest' input must be set, or 'config' must be true with a config file that specifies metadataSuffixes or manifest.",
    );
  }
}
