import { Command, Hook, Config } from '@oclif/core';
import { ScopedPostRetrieve } from '@salesforce/source-deploy-retrieve';
import { env } from '@salesforce/kit';
import DecomposerDecompose from '../commands/decomposer/decompose.js';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPostRetrieve;
  config: Config;
};

// eslint-disable-next-line @typescript-eslint/require-await
export const scopedPostRetrieve: HookFunction = async function (options) {
  if (!options.result?.retrieveResult.response.status) {
    return;
  }

  const prepurge = env.getBoolean('SFDX_DECOMPOSER_PREPURGE', false);
  const postpurge = env.getBoolean('SFDX_DECOMPOSER_POSTPURGE', false);
  const metadataTypes: string[] = env.getString('SFDX_DECOMPOSER_METADATA_TYPES', '').split(',');

  if (metadataTypes.length === 0) {
    return;
  }

  const commandArgs: string[] = [];
  for (const metadataType of metadataTypes) {
    commandArgs.push(`--metadata-type ${metadataType}`);
  }
  if (prepurge) {
    commandArgs.push('--prepurge');
  }
  if (postpurge) {
    commandArgs.push('--postpurge');
  }
  await DecomposerDecompose.run(commandArgs);
};
