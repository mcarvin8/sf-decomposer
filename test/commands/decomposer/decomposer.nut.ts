'use strict';

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';
import { describe, it, expect } from '@jest/globals';

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';

import { METADATA_UNDER_TEST, SFDX_CONFIG_FILE } from '../../utils/constants.js';
import { compareDirectories } from '../../utils/compareDirectories.js';

describe('non-unit tests', () => {
  let session: TestSession;

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
  const configJsonString = JSON.stringify(configFile, null, 2);

  beforeAll(async () => {
    session = await TestSession.create({ devhubAuthStrategy: 'NONE' });
    await copy(originalDirectory, mockDirectory, { overwrite: true });
    await copy(originalDirectory2, mockDirectory2, { overwrite: true });
    await writeFile(SFDX_CONFIG_FILE, configJsonString);
  });

  afterAll(async () => {
    await session?.clean();
    await rm(mockDirectory, { recursive: true });
    await rm(mockDirectory2, { recursive: true });
    await rm(SFDX_CONFIG_FILE);
  });

  const formats = ['xml', 'json', 'json5', 'yaml', 'toml', 'ini'];
  for (const format of formats) {
    it(`should decompose all metadata types under test in ${format.toUpperCase()} format`, async () => {
      const command = `decomposer decompose --postpurge --prepurge --debug ${METADATA_UNDER_TEST.map(
        (metadataType) => `--metadata-type "${metadataType}"`
      ).join(' ')}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(output.replace('\n', '')).toContain(
          `All metadata files have been decomposed for the metadata type: ${metadataType}`
        );
      });
    });

    it('should recompose the decomposed XML files for all metadata types under test', async () => {
      const command = `decomposer recompose --postpurge --debug ${METADATA_UNDER_TEST.map(
        (metadataType) => `--metadata-type "${metadataType}"`
      ).join(' ')}`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(output.replace('\n', '')).toContain(
          `All metadata files have been recomposed for the metadata type: ${metadataType}`
        );
      });
    });

    if (!['toml', 'ini'].includes(format)) {
      it(`should confirm the recomposed ${format.toUpperCase()} files match the fixture files`, async () => {
        await compareDirectories(originalDirectory, mockDirectory);
        await compareDirectories(originalDirectory2, mockDirectory2);
      });
    }
  }
});
