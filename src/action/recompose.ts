'use strict';

import * as core from '@actions/core';

import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import {
  loadConfigFile,
  parseConfigSuffixes,
  resolveDefaultConfigPath,
  validateConfigManifest,
} from '../helpers/configOverrides.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runRecompose(): Promise<void> {
  let metadataTypes = multilineInput('metadata-type');
  let manifest = optionalInput('manifest');
  let ignoreDirs = multilineInput('ignore-package-directory');
  let postpurge = core.getBooleanInput('postpurge');

  if (core.getBooleanInput('config')) {
    const config = await loadConfigFile(await resolveDefaultConfigPath());
    metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
    const configManifest = !manifest ? config.manifest : undefined;
    manifest ??= config.manifest;
    ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
    postpurge = postpurge || (config.postPurge ?? false);

    manifest = await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest,
      warn: (msg) => core.warning(msg),
    });
  }

  requireMetadataTypesOrManifest(metadataTypes, manifest);

  const result = await recomposeMetadataTypes({
    metadataTypes,
    postpurge,
    ignoreDirs,
    manifest,
    log: (msg) => core.info(msg),
  });

  core.setOutput('metadata', result.metadata.join('\n'));
  core.setOutput('types-count', result.metadata.length);
}
