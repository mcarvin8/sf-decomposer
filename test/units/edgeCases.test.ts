'use strict';

import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copy } from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

describe('Edge case coverage tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'edge-case-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('Labels prePurge coverage test', () => {
    let tempProjectDir: string;
    let forceAppDir: string;
    let labelsDir: string;
    const originalDirectory: string = resolve('fixtures/package-dir-1');
    const originalCwd = process.cwd();

    const configFile = {
      packageDirectories: [{ path: 'force-app', default: true }],
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '58.0',
    };

    beforeAll(async () => {
      // Create isolated test workspace
      tempProjectDir = await mkdtemp(join(tmpdir(), 'labels-prepurge-test-'));
      forceAppDir = join(tempProjectDir, 'force-app');
      labelsDir = join(forceAppDir, 'labels');

      // Copy fixture files
      await copy(originalDirectory, forceAppDir, { overwrite: true });

      // Create an extra file in labels directory that should be purged
      const extraFilePath = join(labelsDir, 'ExtraFile.label-meta.xml');
      await writeFile(extraFilePath, '<test>extra content</test>', 'utf-8');

      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('should prePurge extra files in labels directory during decomposition', async () => {
      const logMock = jest.fn();

      // Verify extra file exists before decomposition
      const filesBefore = await readdir(labelsDir);
      expect(filesBefore).toContain('ExtraFile.label-meta.xml');

      await decomposeMetadataTypes({
        metadataTypes: ['labels'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      // Verify extra file was removed during prepurge
      const filesAfter = await readdir(labelsDir);
      expect(filesAfter).not.toContain('ExtraFile.label-meta.xml');
    });
  });

  describe('Labels prePurge false coverage test', () => {
    let tempProjectDir: string;
    let forceAppDir: string;
    const originalDirectory: string = resolve('fixtures/package-dir-1');
    const originalCwd = process.cwd();

    const configFile = {
      packageDirectories: [{ path: 'force-app', default: true }],
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '58.0',
    };

    beforeAll(async () => {
      tempProjectDir = await mkdtemp(join(tmpdir(), 'labels-prepurge-false-test-'));
      forceAppDir = join(tempProjectDir, 'force-app');

      await copy(originalDirectory, forceAppDir, { overwrite: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('should decompose labels with prepurge false', async () => {
      const logMock = jest.fn();

      // Decompose labels with prepurge: false to cover the else branch on line 47
      await decomposeMetadataTypes({
        metadataTypes: ['labels'],
        prepurge: false,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      const output = logMock.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been decomposed for the metadata type: labels');
    });
  });

  describe('Labels postPurge false coverage test', () => {
    let tempProjectDir: string;
    let forceAppDir: string;
    const originalDirectory: string = resolve('fixtures/package-dir-1');
    const originalCwd = process.cwd();

    const configFile = {
      packageDirectories: [{ path: 'force-app', default: true }],
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '58.0',
    };

    beforeAll(async () => {
      tempProjectDir = await mkdtemp(join(tmpdir(), 'labels-postpurge-false-test-'));
      forceAppDir = join(tempProjectDir, 'force-app');

      await copy(originalDirectory, forceAppDir, { overwrite: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('should recompose labels with postpurge false', async () => {
      const logMock = jest.fn();

      // First decompose the labels
      await decomposeMetadataTypes({
        metadataTypes: ['labels'],
        prepurge: true,
        postpurge: true,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      // Now recompose with postpurge: false to cover the else branch
      await recomposeMetadataTypes({
        metadataTypes: ['labels'],
        postpurge: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      const output = logMock.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been recomposed for the metadata type: labels');
    });
  });
});
