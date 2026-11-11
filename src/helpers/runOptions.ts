'use strict';

import {
  loadConfigFile,
  parseConfigSuffixes,
  resolveDefaultConfigPath,
  validateConfigManifest,
} from './configOverrides.js';
import { DecomposeOptions, RecomposeOptions, VerifyOptions } from './types.js';

/**
 * Raw inputs shared by every entry point (the `sf` commands, the GitHub Action, and the
 * standalone `sf-decomposer` CLI). `undefined` means "not provided", so a value from
 * `.sfdecomposer.config.json` can fill it in when `config` is true. Explicit inputs always win
 * over the config file; boolean inputs are OR-ed with their config counterparts.
 */
type CommonInputs = {
  metadataTypes?: string[];
  manifest?: string;
  ignoreDirs?: string[];
  config: boolean;
  warn: (msg: string) => void;
};

export type DecomposeInputs = CommonInputs & {
  format?: string;
  strategy?: string;
  prepurge: boolean;
  postpurge: boolean;
  decomposeNestedPerms: boolean;
  updateForceignore: boolean;
  updateGitattributes: boolean;
};

export type RecomposeInputs = CommonInputs & {
  postpurge: boolean;
};

export type VerifyInputs = CommonInputs & {
  format?: string;
  strategy?: string;
  decomposeNestedPerms: boolean;
};

/** True when neither a metadata type nor a manifest was resolved; callers raise their own error. */
export function isMissingMetadataOrManifest(options: { metadataTypes?: string[]; manifest?: string }): boolean {
  return !options.metadataTypes?.length && !options.manifest;
}

export async function resolveDecomposeOptions(inputs: DecomposeInputs): Promise<Omit<DecomposeOptions, 'log'>> {
  const base = {
    metadataTypes: inputs.metadataTypes,
    manifest: inputs.manifest,
    ignoreDirs: inputs.ignoreDirs,
    format: inputs.format ?? 'xml',
    strategy: inputs.strategy ?? 'unique-id',
    prepurge: inputs.prepurge,
    postpurge: inputs.postpurge,
    decomposeNestedPerms: inputs.decomposeNestedPerms,
    updateForceignore: inputs.updateForceignore,
    updateGitattributes: inputs.updateGitattributes,
    overrides: undefined as DecomposeOptions['overrides'],
  };
  if (!inputs.config) return base;

  const config = await loadConfigFile(await resolveDefaultConfigPath());
  const metadataTypes = inputs.metadataTypes ?? parseConfigSuffixes(config.metadataSuffixes);
  const configManifest = inputs.manifest ? undefined : config.manifest;
  return {
    ...base,
    metadataTypes,
    ignoreDirs: inputs.ignoreDirs ?? parseConfigSuffixes(config.ignorePackageDirectories),
    format: inputs.format ?? config.decomposedFormat ?? 'xml',
    strategy: inputs.strategy ?? config.strategy ?? 'unique-id',
    prepurge: inputs.prepurge || (config.prePurge ?? false),
    postpurge: inputs.postpurge || (config.postPurge ?? false),
    decomposeNestedPerms: inputs.decomposeNestedPerms || (config.decomposeNestedPermissions ?? false),
    updateForceignore: inputs.updateForceignore || (config.updateForceignore ?? false),
    updateGitattributes: inputs.updateGitattributes || (config.updateGitattributes ?? false),
    overrides: config.overrides,
    manifest: await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest: inputs.manifest ?? config.manifest,
      warn: inputs.warn,
    }),
  };
}

export async function resolveRecomposeOptions(inputs: RecomposeInputs): Promise<Omit<RecomposeOptions, 'log'>> {
  const base = {
    metadataTypes: inputs.metadataTypes,
    manifest: inputs.manifest,
    ignoreDirs: inputs.ignoreDirs,
    postpurge: inputs.postpurge,
  };
  if (!inputs.config) return base;

  const config = await loadConfigFile(await resolveDefaultConfigPath());
  const metadataTypes = inputs.metadataTypes ?? parseConfigSuffixes(config.metadataSuffixes);
  const configManifest = inputs.manifest ? undefined : config.manifest;
  return {
    metadataTypes,
    ignoreDirs: inputs.ignoreDirs ?? parseConfigSuffixes(config.ignorePackageDirectories),
    postpurge: inputs.postpurge || (config.postPurge ?? false),
    manifest: await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest: inputs.manifest ?? config.manifest,
      warn: inputs.warn,
    }),
  };
}

export async function resolveVerifyOptions(inputs: VerifyInputs): Promise<Omit<VerifyOptions, 'log'>> {
  const base = {
    metadataTypes: inputs.metadataTypes,
    manifest: inputs.manifest,
    ignoreDirs: inputs.ignoreDirs,
    format: inputs.format ?? 'xml',
    strategy: inputs.strategy ?? 'unique-id',
    decomposeNestedPerms: inputs.decomposeNestedPerms,
    overrides: undefined as VerifyOptions['overrides'],
  };
  if (!inputs.config) return base;

  const config = await loadConfigFile(await resolveDefaultConfigPath());
  const metadataTypes = inputs.metadataTypes ?? parseConfigSuffixes(config.metadataSuffixes);
  const configManifest = inputs.manifest ? undefined : config.manifest;
  return {
    ...base,
    metadataTypes,
    ignoreDirs: inputs.ignoreDirs ?? parseConfigSuffixes(config.ignorePackageDirectories),
    format: inputs.format ?? config.decomposedFormat ?? 'xml',
    strategy: inputs.strategy ?? config.strategy ?? 'unique-id',
    decomposeNestedPerms: inputs.decomposeNestedPerms || (config.decomposeNestedPermissions ?? false),
    overrides: config.overrides,
    manifest: await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest: inputs.manifest ?? config.manifest,
      warn: inputs.warn,
    }),
  };
}
