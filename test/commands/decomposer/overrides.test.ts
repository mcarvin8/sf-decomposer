'use strict';

import { mkdtemp, rm, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copy } from 'fs-extra';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../../src/core/recomposeMetadataTypes.js';
import { compareDirectories } from '../../utils/compareDirectories.js';
import { SFDX_CONFIG_FILE } from '../../utils/constants.js';

describe('decomposer per-type overrides', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  let workflowsDir: string;
  let profilesDir: string;
  let permissionsetsDir: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'overrides-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    workflowsDir = join(forceAppDir, 'workflows');
    profilesDir = join(forceAppDir, 'profiles');
    permissionsetsDir = join(forceAppDir, 'permissionsets');

    await copy(originalDirectory, forceAppDir, { overwrite: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('applies per-type format overrides during decompose and round-trips on recompose', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['workflow', 'profile'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        { metadataTypes: ['workflow'], decomposedFormat: 'yaml' },
        { metadataTypes: ['profile'], decomposedFormat: 'json' },
      ],
      log: logMock,
    });

    const workflowFiles = await collectFiles(workflowsDir);
    const profileFiles = await collectFiles(profilesDir);

    // Decomposed children honor the per-type format. The original parent .xml is removed by postpurge,
    // so no decomposed leaf files should be xml here.
    expect(workflowFiles.some((f) => f.endsWith('.yaml'))).toBe(true);
    expect(workflowFiles.some((f) => f.endsWith('.xml'))).toBe(false);

    expect(profileFiles.some((f) => f.endsWith('.json'))).toBe(true);
    expect(profileFiles.some((f) => f.endsWith('.xml'))).toBe(false);

    await recomposeMetadataTypes({
      metadataTypes: ['workflow', 'profile'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });

  it('applies per-type strategy overrides during decompose', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          metadataTypes: ['permissionset'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ],
      log: logMock,
    });

    const permissionsetFiles = await collectFiles(permissionsetsDir);

    // grouped-by-tag with decomposeNestedPermissions:true splits objectPermissions into its own subdir.
    expect(permissionsetFiles.some((f) => f.includes('objectPermissions/'))).toBe(true);

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });
});

async function collectFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const nested = await collectFiles(join(dir, entry.name));
      out.push(...nested.map((p) => `${entry.name}/${p}`));
    } else {
      out.push(entry.name);
    }
  }
  return out;
}
