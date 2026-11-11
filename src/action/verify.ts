'use strict';

import * as core from '@actions/core';

import { verifyMetadataTypes } from '../core/verifyMetadataTypes.js';
import { resolveVerifyOptions } from '../helpers/runOptions.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runVerify(): Promise<void> {
  const options = await resolveVerifyOptions({
    metadataTypes: multilineInput('metadata-type'),
    manifest: optionalInput('manifest'),
    ignoreDirs: multilineInput('ignore-package-directory'),
    format: optionalInput('format'),
    strategy: optionalInput('strategy'),
    decomposeNestedPerms: core.getBooleanInput('decompose-nested-permissions'),
    config: core.getBooleanInput('config'),
    warn: (msg) => core.warning(msg),
  });

  requireMetadataTypesOrManifest(options.metadataTypes, options.manifest);

  const result = await verifyMetadataTypes({ ...options, log: (msg) => core.info(msg) });

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
