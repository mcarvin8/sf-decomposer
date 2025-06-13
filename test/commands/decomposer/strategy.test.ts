'use strict';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copy } from 'fs-extra';
import { describe, it, expect } from '@jest/globals';

import { setLogLevel } from 'xml-disassembler';
import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../../src/core/recomposeMetadataTypes.js';
import { METADATA_UNDER_TEST_FOR_TAGS, SFDX_CONFIG_FILE } from '../../utils/constants.js';
import { compareDirectories } from '../../utils/compareDirectories.js';

describe('decomposer unit tests - grouped by tag strategy', () => {
  let logMock: jest.Mock;
  let warnMock: jest.Mock;
  let tempProjectDir: string;
  let forceAppDir: string;
  let packageDir: string;
  let sfdxConfigPath: string;
  const originalDirectory: string = resolve('reference/package-dir-1');
  const originalDirectory2: string = resolve('reference/package-dir-2');
  const originalCwd = process.cwd();

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    setLogLevel('debug');
    logMock = jest.fn();
    warnMock = jest.fn();

    // Create isolated test workspace
    tempProjectDir = await mkdtemp(join(tmpdir(), 'tag-test-'));
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

  const formats = ['xml', 'json', 'json5', 'yaml', 'toml', 'ini'];
  for (const format of formats) {
    it(`should decompose all metadata types under test in ${format.toUpperCase()} format`, async () => {
      await decomposeMetadataTypes({
        metadataTypes: METADATA_UNDER_TEST_FOR_TAGS,
        prepurge: true,
        postpurge: true,
        debug: false,
        format,
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
        ignoreDirs: undefined,
        log: logMock,
        warn: warnMock,
      });

      const output = logMock.mock.calls.flat().join('\n');

      METADATA_UNDER_TEST_FOR_TAGS.forEach((metadataType) => {
        expect(output).toContain(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
      });
    });

    it(`should recompose all decomposed ${format.toUpperCase()} files for all metadata types under test`, async () => {
      await recomposeMetadataTypes({
        metadataTypes: METADATA_UNDER_TEST_FOR_TAGS,
        postpurge: true,
        debug: false,
        ignoreDirs: undefined,
        log: logMock,
        warn: warnMock,
      });

      const output = logMock.mock.calls.flat().join('\n');
      METADATA_UNDER_TEST_FOR_TAGS.forEach((metadataType) => {
        expect(output).toContain(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
      });
    });

    if (!['toml', 'ini'].includes(format)) {
      it(`should confirm the recomposed ${format.toUpperCase()} files match the reference files`, async () => {
        await compareDirectories(originalDirectory, forceAppDir);
        await compareDirectories(originalDirectory2, packageDir);
      });
    }
  }
});
