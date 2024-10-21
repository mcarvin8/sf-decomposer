'use strict';
/* eslint-disable no-await-in-loop */

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

import { METADATA_UNDER_TEST, SFDX_CONFIG_FILE } from './constants.js';
import { compareDirectories } from './compareDirectories.js';

describe('decomposer NUTs XML format', () => {
  let session: TestSession;

  const originalDirectory: string = 'test/baselines';
  const mockDirectory: string = 'xml';
  const configFile = {
    packageDirectories: [{ path: 'xml', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  const configJsonString = JSON.stringify(configFile, null, 2);

  before(async () => {
    session = await TestSession.create({ devhubAuthStrategy: 'NONE' });
    await copy(originalDirectory, mockDirectory, { overwrite: true });
    await writeFile(SFDX_CONFIG_FILE, configJsonString);
  });

  after(async () => {
    await session?.clean();
    await rm(mockDirectory, { recursive: true });
    await rm(SFDX_CONFIG_FILE);
  });

  it('should decompose all metadata types under test, then delete the original files', async () => {
    for (const metadataType of METADATA_UNDER_TEST) {
      const command = `decomposer decompose --metadata-type "${metadataType}" --postpurge --prepurge --debug`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

      expect(output.replace('\n', '')).to.equal(
        `All metadata files have been decomposed for the metadata type: ${metadataType}`
      );
    }
  });
  it('should recompose all metadata types under test', async () => {
    for (const metadataType of METADATA_UNDER_TEST) {
      const command = `decomposer recompose --metadata-type "${metadataType}" --postpurge --debug`;
      const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

      expect(output.replace('\n', '')).to.equal(
        `All metadata files have been recomposed for the metadata type: ${metadataType}`
      );
    }
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
  });
});
