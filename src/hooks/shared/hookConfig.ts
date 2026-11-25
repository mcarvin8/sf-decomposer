'use strict';

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { HOOK_CONFIG_JSON } from '../../helpers/constants.js';
import { ConfigFile, RecomposeOptions } from '../../helpers/types.js';
import { getRepoRoot } from '../../service/core/getRepoRoot.js';

/**
 * Set by the sfdx-hardis start hook once it has recomposed, to the repo root it recomposed. sfdx-hardis
 * runs `sf project deploy start|validate` as a child process, which inherits this variable, so the
 * prerun hook in that child process knows the recompose already ran and skips it. Plain `sf` deploys
 * never see it, so they still recompose.
 */
export const HARDIS_RECOMPOSED_ENV = 'SF_DECOMPOSER_HARDIS_RECOMPOSED';

// Kept out of the hook files: oclif runs the first function a hook module exports.
export async function loadHookConfig(): Promise<{ repoRoot: string; configFile: ConfigFile } | undefined> {
  const { repoRoot } = await getRepoRoot();
  if (!repoRoot) {
    return undefined;
  }
  const configPath = resolve(repoRoot, HOOK_CONFIG_JSON);
  try {
    const jsonString: string = await readFile(configPath, 'utf-8');
    return { repoRoot, configFile: JSON.parse(jsonString) as ConfigFile };
  } catch (_error) {
    return undefined;
  }
}

export function buildRecomposeOptions(
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
