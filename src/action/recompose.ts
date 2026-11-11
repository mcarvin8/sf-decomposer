'use strict';

import * as core from '@actions/core';

import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import { resolveRecomposeOptions } from '../helpers/runOptions.js';
import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from './inputs.js';

export async function runRecompose(): Promise<void> {
  const options = await resolveRecomposeOptions({
    metadataTypes: multilineInput('metadata-type'),
    manifest: optionalInput('manifest'),
    ignoreDirs: multilineInput('ignore-package-directory'),
    postpurge: core.getBooleanInput('postpurge'),
    config: core.getBooleanInput('config'),
    warn: (msg) => core.warning(msg),
  });

  requireMetadataTypesOrManifest(options.metadataTypes, options.manifest);

  const result = await recomposeMetadataTypes({ ...options, log: (msg) => core.info(msg) });

  core.setOutput('metadata', result.metadata.join('\n'));
  core.setOutput('types-count', result.metadata.length);
}
