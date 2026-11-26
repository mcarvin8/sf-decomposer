'use strict';

import type { Hook } from '@oclif/core';
import type { SfdxHardisDeploymentStartEvent, SfdxHardisEventHookOptions } from 'sfdx-hardis/plugin-api';

import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import { buildRecomposeOptions, HARDIS_RECOMPOSED_ENV, loadHookConfig } from './shared/hookConfig.js';

type HookFunction = (
  this: Hook.Context,
  options: SfdxHardisEventHookOptions<SfdxHardisDeploymentStartEvent>,
) => Promise<void>;

/**
 * Runs on sfdx-hardis:validation-start and sfdx-hardis:deployment-start, which sfdx-hardis sends before
 * it reads the local sources (package.xml, delta, deployment). The prerun hook fires too late for
 * sfdx-hardis: only once sfdx-hardis has started `sf project deploy` as a child process.
 */
export const sfdxHardisStart: HookFunction = async function (options) {
  const loaded = await loadHookConfig();
  if (!loaded) {
    return;
  }
  const { repoRoot, configFile } = loaded;

  if (!configFile.sfdxHardis) {
    return;
  }

  const recomposeOptions = buildRecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!recomposeOptions) return;

  this.log(
    `Recomposing metadata before the sfdx-hardis ${options.data.checkOnly ? 'validation' : 'deployment'} (${options.commandId}).`,
  );
  await recomposeMetadataTypes(recomposeOptions);
  process.env[HARDIS_RECOMPOSED_ENV] = repoRoot;
};
