'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hook } from '@oclif/core';

import DecomposerRecompose from '../commands/decomposer/recompose.js';
import { ConfigFile } from '../helpers/types.js';
import { getRepoRoot } from '../service/getRepoRoot.js';

export const prerun: Hook<'prerun'> = async function (options) {
  if (['project:deploy:validate', 'project:deploy:start'].includes(options.Command.id)) {
    let configFile: ConfigFile;
    const repoRoot = await getRepoRoot();
    const configPath = resolve(repoRoot, '.sfdecomposer.config.json');

    try {
      const jsonString: string = await readFile(configPath, 'utf-8');
      configFile = JSON.parse(jsonString) as ConfigFile;
    } catch (error) {
      return;
    }

    const metadataTypes: string = configFile.metadataSuffixes || '.';
    const format: string = configFile.decomposedFormat || 'xml';
    const postpurge: boolean = configFile.postPurge || false;

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
  }
};
