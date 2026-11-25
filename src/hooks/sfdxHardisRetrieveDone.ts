'use strict';

import type { Hook } from '@oclif/core';
import type { SfdxHardisEventHookOptions, SfdxHardisRetrieveEvent } from 'sfdx-hardis/plugin-api';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import { buildDecomposeOptions, loadHookConfig } from './shared/hookConfig.js';

type HookFunction = (this: Hook.Context, options: SfdxHardisEventHookOptions<SfdxHardisRetrieveEvent>) => Promise<void>;

/**
 * Runs on sfdx-hardis:retrieve-done, sent by hardis:source:retrieve. That command runs
 * `sfdx force:source:retrieve` (@salesforce/plugin-source) as a child process, which fires no
 * scopedPostRetrieve hook, so this is the only decompose a hardis retrieve gets.
 *
 * Runs on a failed retrieve too, like scopedPostRetrieve: a partly failed retrieve still writes files.
 */
export const sfdxHardisRetrieveDone: HookFunction = async function (options) {
  const loaded = await loadHookConfig();
  if (!loaded) {
    return;
  }
  const { configFile } = loaded;

  if (!configFile.sfdxHardis) {
    return;
  }

  const decomposeOptions = buildDecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!decomposeOptions) return;

  this.log(`Decomposing metadata after the sfdx-hardis retrieve (${options.commandId}, ${options.data.status}).`);
  await decomposeMetadataTypes(decomposeOptions);
};
