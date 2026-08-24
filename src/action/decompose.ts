'use strict';

import * as core from '@actions/core';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import {
  loadConfigFile,
  parseConfigSuffixes,
  resolveDefaultConfigPath,
  validateConfigManifest,
} from '../helpers/configOverrides.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runDecompose(): Promise<void> {
  let metadataTypes = multilineInput('metadata-type');
  let manifest = optionalInput('manifest');
  let ignoreDirs = multilineInput('ignore-package-directory');
  let format = optionalInput('format') ?? 'xml';
  let strategy = optionalInput('strategy') ?? 'unique-id';
  let prepurge = core.getBooleanInput('prepurge');
  let postpurge = core.getBooleanInput('postpurge');
  let decomposeNestedPerms = core.getBooleanInput('decompose-nested-permissions');
  let updateForceignore = core.getBooleanInput('update-forceignore');
  let updateGitattributes = core.getBooleanInput('update-gitattributes');
  let overrides;

  if (core.getBooleanInput('config')) {
    const config = await loadConfigFile(await resolveDefaultConfigPath());
    metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
    const configManifest = !manifest ? config.manifest : undefined;
    manifest ??= config.manifest;
    ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
    format = optionalInput('format') ?? config.decomposedFormat ?? 'xml';
    strategy = optionalInput('strategy') ?? config.strategy ?? 'unique-id';
    prepurge = prepurge || (config.prePurge ?? false);
    postpurge = postpurge || (config.postPurge ?? false);
    decomposeNestedPerms = decomposeNestedPerms || (config.decomposeNestedPermissions ?? false);
    updateForceignore = updateForceignore || (config.updateForceignore ?? false);
    updateGitattributes = updateGitattributes || (config.updateGitattributes ?? false);
    overrides = config.overrides;

    manifest = await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest,
      warn: (msg) => core.warning(msg),
    });
  }

  requireMetadataTypesOrManifest(metadataTypes, manifest);

  const result = await decomposeMetadataTypes({
    metadataTypes,
    prepurge,
    postpurge,
    format,
    ignoreDirs,
    strategy,
    decomposeNestedPerms,
    manifest,
    overrides,
    updateForceignore,
    updateGitattributes,
    log: (msg) => core.info(msg),
  });

  core.setOutput('metadata', result.metadata.join('\n'));
  core.setOutput('types-count', result.metadata.length);
}
