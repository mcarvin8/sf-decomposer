'use strict';

import * as core from '@actions/core';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import { resolveDecomposeOptions } from '../helpers/runOptions.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runDecompose(): Promise<void> {
  const options = await resolveDecomposeOptions({
    metadataTypes: multilineInput('metadata-type'),
    manifest: optionalInput('manifest'),
    ignoreDirs: multilineInput('ignore-package-directory'),
    format: optionalInput('format'),
    strategy: optionalInput('strategy'),
    prepurge: core.getBooleanInput('prepurge'),
    postpurge: core.getBooleanInput('postpurge'),
    decomposeNestedPerms: core.getBooleanInput('decompose-nested-permissions'),
    updateForceignore: core.getBooleanInput('update-forceignore'),
    updateGitattributes: core.getBooleanInput('update-gitattributes'),
    config: core.getBooleanInput('config'),
    warn: (msg) => core.warning(msg),
  });

  requireMetadataTypesOrManifest(options.metadataTypes, options.manifest);

  const result = await decomposeMetadataTypes({ ...options, log: (msg) => core.info(msg) });

  core.setOutput('metadata', result.metadata.join('\n'));
  core.setOutput('types-count', result.metadata.length);
}
