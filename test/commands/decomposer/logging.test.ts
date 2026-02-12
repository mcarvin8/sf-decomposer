'use strict';

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';
import { describe, it, expect } from '@jest/globals';

import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../../utils/constants.js';

describe('logging test suite', () => {
  let logMock: jest.Mock;
  const originalDirectory: string = 'fixtures/package-dir-1';
  const originalDirectory2: string = 'fixtures/package-dir-2';
  const mockDirectory: string = 'force-app';
  const mockDirectory2: string = 'package';

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    logMock = jest.fn();

    await copy(originalDirectory, mockDirectory, { overwrite: true });
    await copy(originalDirectory2, mockDirectory2, { overwrite: true });
    await writeFile(SFDX_CONFIG_FILE, JSON.stringify(configFile, null, 2));
  });

  afterAll(async () => {
    await rm(mockDirectory, { recursive: true });
    await rm(mockDirectory2, { recursive: true });
    await rm(SFDX_CONFIG_FILE);
  });

  it('should confirm logging when decomposing', async () => {
    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: logMock,
    });

    const output = logMock.mock.calls.flat().join('\n');
    expect(output).toContain('All metadata files have been decomposed for the metadata type: permissionset');
  });
});
