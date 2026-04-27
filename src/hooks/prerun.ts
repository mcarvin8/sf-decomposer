'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Hook } from '@oclif/core';

import { recomposeMetadataTypes } from '../core/recomposeMetadataTypes.js';
import { ConfigFile, RecomposeOptions } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { HOOK_CONFIG_JSON } from '../helpers/constants.js';

function buildRecomposeOptions(
  configFile: ConfigFile,
  log: (msg: string) => void,
): RecomposeOptions | undefined {
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
    postpurge: configFile.postPurge || false,
    ignoreDirs,
    manifest: manifest.trim() !== '' ? manifest.trim() : undefined,
    log,
  };
}

export const prerun: Hook<'prerun'> = async function (options) {
  if (!['project:deploy:validate', 'project:deploy:start'].includes(options.Command.id)) {
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

  const recomposeOptions = buildRecomposeOptions(configFile, (msg: string) => {
    this.log(msg);
  });
  if (!recomposeOptions) return;

  await recomposeMetadataTypes(recomposeOptions);
};
