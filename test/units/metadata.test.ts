'use strict';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copy } from 'fs-extra';
import { describe, it, expect } from '@jest/globals';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

describe('decomposer unit tests - unique id strategy', () => {
  let logMock: jest.Mock;
  let tempProjectDir: string;
  let forceAppDir: string;
  let packageDir: string;
  let sfdxConfigPath: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalDirectory2: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    logMock = jest.fn();

    // Create isolated test workspace
    tempProjectDir = await mkdtemp(join(tmpdir(), 'uid-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    packageDir = join(tempProjectDir, 'package');
    sfdxConfigPath = join(tempProjectDir, SFDX_CONFIG_FILE);

    // Setup isolated test project
    await copy(originalDirectory, forceAppDir, { overwrite: true });
    await copy(originalDirectory2, packageDir, { overwrite: true });
    await writeFile(sfdxConfigPath, JSON.stringify(configFile, null, 2));
    process.chdir(tempProjectDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('throws a validation error when botVersion is used', async () => {
    await expect(
      decomposeMetadataTypes({
        metadataTypes: ['botVersion'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      })
    ).rejects.toThrow(
      '`botVersion` suffix should not be used. Please use `bot` to decompose/recompose bot and bot version files.'
    );
  });
  it('throws a validation error when custom object is used', async () => {
    await expect(
      decomposeMetadataTypes({
        metadataTypes: ['object'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      })
    ).rejects.toThrow('Custom Objects are not supported by this plugin.');
  });
  it('throws a validation error when a meta with a SDR strategy is given', async () => {
    await expect(
      decomposeMetadataTypes({
        metadataTypes: ['cls'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      })
    ).rejects.toThrow('Metadata types with matchingContentFile strategies are not supported by this plugin.');
  });
  it('throws a validation error when a valid package directory is not found', async () => {
    await expect(
      decomposeMetadataTypes({
        metadataTypes: ['animationRule'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      })
    ).rejects.toThrow('No directories named animationRules were found in any package directory.');
  });
  it('throws a validation error when a suffix cannot be found', async () => {
    await expect(
      decomposeMetadataTypes({
        metadataTypes: ['bs'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      })
    ).rejects.toThrow('Metadata type not found for the given suffix: bs.');
  });

  it('decomposes permission sets with the additional strategy', async () => {
    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'grouped-by-tag',
      decomposeNestedPerms: true,
      ignoreDirs: ['package'],
      log: logMock,
    });

    const output = logMock.mock.calls.flat().join('\n');
    expect(output).toContain('All metadata files have been decomposed for the metadata type: permissionset');
  });
});
