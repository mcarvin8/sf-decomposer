'use strict';

import * as core from '@actions/core';

import { verifyMetadataTypes } from '../core/verifyMetadataTypes.js';
import {
  loadConfigFile,
  parseConfigSuffixes,
  resolveDefaultConfigPath,
  validateConfigManifest,
} from '../helpers/configOverrides.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runVerify(): Promise<void> {
  let metadataTypes = multilineInput('metadata-type');
  let manifest = optionalInput('manifest');
  let ignoreDirs = multilineInput('ignore-package-directory');
  let format = optionalInput('format') ?? 'xml';
  let strategy = optionalInput('strategy') ?? 'unique-id';
  let decomposeNestedPerms = core.getBooleanInput('decompose-nested-permissions');
  let overrides;

  if (core.getBooleanInput('config')) {
    const config = await loadConfigFile(await resolveDefaultConfigPath());
    metadataTypes ??= parseConfigSuffixes(config.metadataSuffixes);
    const configManifest = !manifest ? config.manifest : undefined;
    manifest ??= config.manifest;
    ignoreDirs ??= parseConfigSuffixes(config.ignorePackageDirectories);
    format = optionalInput('format') ?? config.decomposedFormat ?? 'xml';
    strategy = optionalInput('strategy') ?? config.strategy ?? 'unique-id';
    decomposeNestedPerms = decomposeNestedPerms || (config.decomposeNestedPermissions ?? false);
    overrides = config.overrides;

    manifest = await validateConfigManifest({
      configManifest,
      metadataTypes,
      manifest,
      warn: (msg) => core.warning(msg),
    });
  }

  requireMetadataTypesOrManifest(metadataTypes, manifest);

  const result = await verifyMetadataTypes({
    metadataTypes,
    format,
    ignoreDirs,
    strategy,
    decomposeNestedPerms,
    manifest,
    overrides,
    log: (msg) => core.info(msg),
  });

  core.setOutput('metadata', result.metadata.join('\n'));
  core.setOutput('types-count', result.metadata.length);
  core.setOutput('drift-count', result.drift.length);
  core.setOutput('reordered-count', result.reordered.length);

  if (result.drift.length > 0) {
    for (const { path, reason } of result.drift) {
      core.error(`${path}: ${reason}`);
    }
    core.setFailed(
      `Round-trip verify failed: ${result.drift.length} file(s) drifted between the original tree and the round-tripped output. See the log above for the offending paths.`,
    );
  }
}
