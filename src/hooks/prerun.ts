'use strict';

import { Hook } from '@oclif/core';

import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import { buildRecomposeOptions, HARDIS_RECOMPOSED_ENV, loadHookConfig } from './shared/hookConfig.js';

export const prerun: Hook<'prerun'> = async function (options) {
  if (!['project:deploy:validate', 'project:deploy:start'].includes(options.Command.id)) {
    return;
  }

  const loaded = await loadHookConfig();
  if (!loaded) {
    return;
  }
  const { repoRoot, configFile } = loaded;

  if (configFile.skipPrerunHook) {
    return;
  }

  // sfdx-hardis already recomposed this repo in its validation-start/deployment-start hook, before it
  // started this deploy as a child process.
  if (process.env[HARDIS_RECOMPOSED_ENV] === repoRoot) {
    return;
  }

  const recomposeOptions = buildRecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!recomposeOptions) return;

  await recomposeMetadataTypes(recomposeOptions);
};
