'use strict';

import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

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
      await cp(originalDirectory, forceAppDir, { recursive: true, force: true });

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
      const logMock = vi.fn();

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

      await cp(originalDirectory, forceAppDir, { recursive: true, force: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('should decompose labels with prepurge false', async () => {
      const logMock = vi.fn();

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

      await cp(originalDirectory, forceAppDir, { recursive: true, force: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('should recompose labels with postpurge false', async () => {
      const logMock = vi.fn();

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

  describe('botVersion redirect coverage', () => {
    let tempProjectDir: string;
    let forceAppDir: string;
    let logMock: Mock;
    const originalDirectory2: string = resolve('fixtures/package-dir-2');
    const originalCwd = process.cwd();

    const configFile = {
      packageDirectories: [{ path: 'force-app', default: true }],
      namespace: '',
      sfdcLoginUrl: 'https://login.salesforce.com',
      sourceApiVersion: '58.0',
    };

    beforeAll(async () => {
      tempProjectDir = await mkdtemp(join(tmpdir(), 'botversion-redirect-'));
      forceAppDir = join(tempProjectDir, 'force-app');
      logMock = vi.fn();

      await cp(originalDirectory2, forceAppDir, { recursive: true, force: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('deduplicates when both botVersion and bot are passed (covers ternary false branch)', async () => {
      const result = await decomposeMetadataTypes({
        metadataTypes: ['botVersion', 'bot'],
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });
      expect(logMock).toHaveBeenCalledWith(
        'Warning: `botVersion` suffix is not supported; automatically using `bot` instead.',
      );
      expect(result.metadata).toEqual(['bot']);
    });

    it('logs a warning and redirects botVersion to bot on recompose (covers ternary false branch)', async () => {
      const result = await recomposeMetadataTypes({
        metadataTypes: ['botVersion', 'bot'],
        postpurge: false,
        ignoreDirs: undefined,
        log: logMock,
      });
      expect(logMock).toHaveBeenCalledWith(
        'Warning: `botVersion` suffix is not supported; automatically using `bot` instead.',
      );
      expect(result.metadata).toContain('bot');
    });

    it('does NOT log a botVersion warning when no botVersion suffix is present on recompose', async () => {
      const log = vi.fn();
      await recomposeMetadataTypes({
        metadataTypes: ['bot'],
        postpurge: false,
        ignoreDirs: undefined,
        log,
      });
      expect(log).not.toHaveBeenCalledWith(
        'Warning: `botVersion` suffix is not supported; automatically using `bot` instead.',
      );
    });
  });

  describe('updateForceignore branch coverage', () => {
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
      tempProjectDir = await mkdtemp(join(tmpdir(), 'update-forceignore-coverage-'));
      forceAppDir = join(tempProjectDir, 'force-app');

      await cp(originalDirectory, forceAppDir, { recursive: true, force: true });
      await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
      process.chdir(tempProjectDir);
    });

    afterAll(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('writes .forceignore and logs update message when updateForceignore is true', async () => {
      const logMock = vi.fn();

      await decomposeMetadataTypes({
        metadataTypes: ['labels'],
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        updateForceignore: true,
        log: logMock,
      });

      const output = logMock.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been decomposed for the metadata type: labels');
      expect(output).toContain('Updated .forceignore with decomposed file paths.');

      const forceignoreContent = await readFile(join(tempProjectDir, '.forceignore'), 'utf-8');
      expect(forceignoreContent).toContain('**/labels/*.xml');
      expect(forceignoreContent).toContain('!**/labels/CustomLabels.labels-meta.xml');
    });
  });
});
