'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hook } from '@oclif/core';

import { decomposeMetadataTypes } from '../core/decomposeMetadataTypes.js';
import { ConfigFile, DecomposeOptions, PostRetrieveHookOptions } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { HOOK_CONFIG_JSON } from '../helpers/constants.js';

type HookFunction = (this: Hook.Context, options: PostRetrieveHookOptions) => Promise<void>;

function buildDecomposeOptions(configFile: ConfigFile, log: (msg: string) => void): DecomposeOptions | undefined {
  const metadataSuffixes: string = configFile.metadataSuffixes || '.';
  const ignorePackageDirs: string = configFile.ignorePackageDirectories || '';
  const manifest: string = configFile.manifest ?? '';

  if (metadataSuffixes.trim() === '.' && manifest.trim() === '') {
    return undefined;
  }

  const metadataTypes: string[] | undefined =
    metadataSuffixes.trim() !== '.'
      ? metadataSuffixes
          .split(',')
          .map((type) => type.replace(/,/g, '').trim())
          .filter((type) => type.length > 0)
      : undefined;

  const ignoreDirs: string[] | undefined =
    ignorePackageDirs.trim() !== ''
      ? ignorePackageDirs
          .split(',')
          .map((dir) => dir.replace(/,/g, '').trim())
          .filter((dir) => dir.length > 0)
      : undefined;

  return {
    metadataTypes,
    prepurge: configFile.prePurge || false,
    postpurge: configFile.postPurge || false,
    format: configFile.decomposedFormat || 'xml',
    ignoreDirs,
    strategy: configFile.strategy || 'unique-id',
    decomposeNestedPerms: configFile.decomposeNestedPermissions || false,
    updateForceignore: configFile.updateForceignore ?? false,
    manifest: manifest.trim() !== '' ? manifest.trim() : undefined,
    overrides: configFile.overrides,
    log,
  };
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

  const decomposeOptions = buildDecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!decomposeOptions) return;

  await decomposeMetadataTypes(decomposeOptions);
};
