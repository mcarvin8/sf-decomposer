'use strict';
/* eslint-disable no-await-in-loop */

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';

import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { setLogLevel } from 'xml-disassembler';
import DecomposerRecompose from '../../../src/commands/decomposer/recompose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';
import { METADATA_UNDER_TEST, SFDX_CONFIG_FILE } from './constants.js';
import { compareDirectories } from './compareDirectories.js';

describe('unit test for XML to JSON decomposing and recomposing', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  const originalDirectory: string = 'test/baselines';
  const mockDirectory: string = 'json';
  const configFile = {
    packageDirectories: [{ path: 'json', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  const configJsonString = JSON.stringify(configFile, null, 2);

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    setLogLevel('debug');

    await copy(originalDirectory, mockDirectory, { overwrite: true });
    await writeFile(SFDX_CONFIG_FILE, configJsonString);
  });

  afterEach(() => {
    $$.restore();
  });

  after(async () => {
    await rm(mockDirectory, { recursive: true });
    await rm(SFDX_CONFIG_FILE);
  });

  it('should decompose all supported metadata types, then delete the original files', async () => {
    for (const metadataType of METADATA_UNDER_TEST) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerDecompose.run(['--metadata-type', metadataType, '--postpurge', '--prepurge', '--format', 'json']);
      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }
  });

  it('should recompose all supported metadata types, then delete the decomposed files', async () => {
    for (const metadataType of METADATA_UNDER_TEST) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerRecompose.run(['--metadata-type', metadataType, '--postpurge', '--format', 'json']);
    }

    // Check if there are no errors in the log
    // Can't clear the existing log to check standard output message
    const errorOutput = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(errorOutput).to.not.include('Error');
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
  });
});
