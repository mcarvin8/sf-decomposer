'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hook } from '@oclif/core';

import DecomposerDecompose from '../commands/decomposer/decompose.js';
import { ConfigFile, PostRetrieveHookOptions } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { HOOK_CONFIG_JSON } from '../helpers/constants.js';

type HookFunction = (this: Hook.Context, options: PostRetrieveHookOptions) => Promise<void>;

function hasOverrides(configFile: ConfigFile): boolean {
  return Array.isArray(configFile.overrides) && configFile.overrides.length > 0;
}

function buildDecomposeArgs(configFile: ConfigFile): string[] | undefined {
  const metadataTypes: string = configFile.metadataSuffixes || '.';
  const format: string = configFile.decomposedFormat || 'xml';
  const prepurge: boolean = configFile.prePurge || false;
  const postpurge: boolean = configFile.postPurge || false;
  const ignorePackageDirs: string = configFile.ignorePackageDirectories || '';
  const strategy: string = configFile.strategy || 'unique-id';
  const decomposeNestedPermissions: boolean = configFile.decomposeNestedPermissions || false;
  const manifest: string = configFile.manifest ?? '';

  if (metadataTypes.trim() === '.' && manifest.trim() === '') {
    return undefined;
  }

  const commandArgs: string[] = [];
  if (metadataTypes.trim() !== '.') {
    for (const metadataType of metadataTypes.split(',')) {
      commandArgs.push('--metadata-type', metadataType.replace(/,/g, ''));
    }
  }
  if (ignorePackageDirs.trim() !== '') {
    for (const dir of ignorePackageDirs.split(',')) {
      commandArgs.push('--ignore-package-directory', dir.replace(/,/g, ''));
    }
  }
  if (manifest.trim() !== '') {
    commandArgs.push('--manifest', manifest.trim());
  }
  commandArgs.push('--format', format);
  if (prepurge) commandArgs.push('--prepurge');
  if (postpurge) commandArgs.push('--postpurge');
  if (decomposeNestedPermissions) commandArgs.push('--decompose-nested-permissions');
  commandArgs.push('--strategy', strategy);
  if (hasOverrides(configFile)) commandArgs.push('--config');

  return commandArgs;
}

export const scopedPostRetrieve: HookFunction = async function (options) {
  if (!options.result?.retrieveResult.response.status) {
    return;
  }
  const { repoRoot } = await getRepoRoot();
  if (!repoRoot) {
    return;
  }
  const configPath = resolve(repoRoot, HOOK_CONFIG_JSON);

  let configFile: ConfigFile;
  try {
    const jsonString: string = await readFile(configPath, 'utf-8');
    configFile = JSON.parse(jsonString) as ConfigFile;
  } catch (error) {
    return;
  }

  const commandArgs = buildDecomposeArgs(configFile);
  if (!commandArgs) return;

  await DecomposerDecompose.run(commandArgs);
};
