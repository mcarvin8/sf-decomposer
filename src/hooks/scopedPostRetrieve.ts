'use strict';

import { Command, Config, Hook } from '@oclif/core';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import { buildDecomposeOptions, loadHookConfig } from './shared/hookConfig.js';

// Local stand-in for SDR's ScopedPostRetrieve -- only the field the hook actually reads.
type RetrieveHookResult = {
  retrieveResult: {
    response: {
      status?: string;
    };
  };
};

// Lives here rather than in helpers/types.ts so the shared types stay free of oclif imports.
type PostRetrieveHookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: RetrieveHookResult;
  config: Config;
};

type HookFunction = (this: Hook.Context, options: PostRetrieveHookOptions) => Promise<void>;

export const scopedPostRetrieve: HookFunction = async function (options) {
  if (!options.result?.retrieveResult.response.status) {
    return;
  }
  const loaded = await loadHookConfig();
  if (!loaded) {
    return;
  }
  const { configFile } = loaded;

  if (configFile.skipPostRetrieveHook) {
    return;
  }

  const decomposeOptions = buildDecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!decomposeOptions) return;

  await decomposeMetadataTypes(decomposeOptions);
};
