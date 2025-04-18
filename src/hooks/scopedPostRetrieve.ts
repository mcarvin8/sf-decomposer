'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hook } from '@oclif/core';

import DecomposerDecompose from '../commands/decomposer/decompose.js';
import { ConfigFile, PostRetrieveHookOptions } from '../helpers/types.js';
import { getRepoRoot } from '../service/getRepoRoot.js';
import { HOOK_CONFIG_JSON } from '../helpers/constants.js';

type HookFunction = (this: Hook.Context, options: PostRetrieveHookOptions) => Promise<void>;

export const scopedPostRetrieve: HookFunction = async function (options) {
  if (!options.result?.retrieveResult.response.status) {
    return;
  }
  let configFile: ConfigFile;
  const { repoRoot } = await getRepoRoot();
  if (!repoRoot) {
    return;
  }
  const configPath = resolve(repoRoot, HOOK_CONFIG_JSON);

  try {
    const jsonString: string = await readFile(configPath, 'utf-8');
    configFile = JSON.parse(jsonString) as ConfigFile;
  } catch (error) {
    return;
  }

  const metadataTypes: string = configFile.metadataSuffixes || '.';
  const format: string = configFile.decomposedFormat || 'xml';
  const prepurge: boolean = configFile.prePurge || false;
  const postpurge: boolean = configFile.postPurge || false;
  const ignorePackageDirs: string = configFile.ignorePackageDirectories || '';
  const strategy: string = configFile.strategy || 'unique-id';

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
  if (ignorePackageDirs.trim() !== '') {
    const ignorePackageDirArray: string[] = ignorePackageDirs.split(',');
    for (const dirs of ignorePackageDirArray) {
      const sanitizedDir = dirs.replace(/,/g, '');
      commandArgs.push('--ignore-package-directory');
      commandArgs.push(sanitizedDir);
    }
  }
  commandArgs.push('--format');
  commandArgs.push(format);
  if (prepurge) {
    commandArgs.push('--prepurge');
  }
  if (postpurge) {
    commandArgs.push('--postpurge');
  }
  commandArgs.push('--strategy');
  commandArgs.push(strategy);
  await DecomposerDecompose.run(commandArgs);
};
