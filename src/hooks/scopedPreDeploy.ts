import { Command, Hook, Config } from '@oclif/core';
import { ScopedPreDeploy } from '@salesforce/source-deploy-retrieve';
import { env } from '@salesforce/kit';
import DecomposerRecompose from '../commands/decomposer/recompose.js';

type HookFunction = (this: Hook.Context, options: HookOptions) => Promise<void>;

type HookOptions = {
  Command: Command;
  argv: string[];
  commandId: string;
  result?: ScopedPreDeploy;
  config: Config;
};

export const scopedPreDeploy: HookFunction = async function () {
  const postpurge = env.getBoolean('SFDX_DECOMPOSER_POSTPURGE', false);
  const metadataTypes: string = env.getString('SFDX_DECOMPOSER_METADATA_TYPES', '.');
  const format: string = env.getString('SFDX_DECOMPOSER_METADATA_FORMAT', 'xml');

  if (metadataTypes.trim() === '.') {
    return;
  }

  const metadataTypesArray: string[] = metadataTypes.split(',');

  const commandArgs: string[] = [];
  for (const metadataType of metadataTypesArray) {
    const sanitizedMetadataType = metadataType.replace(/,/g, '');
    commandArgs.push('--metadata-type');
    commandArgs.push(sanitizedMetadataType);
  }
  commandArgs.push('--format');
  commandArgs.push(format);
  if (postpurge) {
    commandArgs.push('--postpurge');
  }
  await DecomposerRecompose.run(commandArgs);
};
