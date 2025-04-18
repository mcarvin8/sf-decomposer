'use strict';

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';

import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { setLogLevel } from 'xml-disassembler';
import DecomposerRecompose from '../../../src/commands/decomposer/recompose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';
import { METADATA_UNDER_TEST_FOR_TAGS, SFDX_CONFIG_FILE } from './constants.js';
import { compareDirectories } from './compareDirectories.js';

describe('unit tests for group by tag strategy', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  const originalDirectory: string = 'test/baselines';
  const originalDirectory2: string = 'test/baselines2';
  const mockDirectory: string = 'force-app-2';
  const mockDirectory2: string = 'package-2';
  const tagFlag = 'grouped-by-tag';
  const configFile = {
    packageDirectories: [{ path: 'force-app-2', default: true }, { path: 'package-2' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  const configJsonString = JSON.stringify(configFile, null, 2);

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    setLogLevel('debug');

    await copy(originalDirectory, mockDirectory, { overwrite: true });
    await copy(originalDirectory2, mockDirectory2, { overwrite: true });
    await writeFile(SFDX_CONFIG_FILE, configJsonString);
  });

  afterEach(() => {
    $$.restore();
  });

  after(async () => {
    await rm(mockDirectory, { recursive: true });
    await rm(mockDirectory2, { recursive: true });
    await rm(SFDX_CONFIG_FILE);
  });

  it('should decompose all metadata types under test in XML format', async () => {
    await DecomposerDecompose.run([
      '--postpurge',
      '--prepurge',
      `--strategy=${tagFlag}`,
      ...METADATA_UNDER_TEST_FOR_TAGS.map((metadataType) => `--metadata-type=${metadataType}`),
    ]);

    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    METADATA_UNDER_TEST_FOR_TAGS.forEach((metadataType) => {
      expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    });
  });

  it('should recompose all decomposed XML files for all metadata types under test', async () => {
    await DecomposerRecompose.run([
      '--postpurge',
      ...METADATA_UNDER_TEST_FOR_TAGS.map((metadataType) => `--metadata-type=${metadataType}`),
    ]);

    // Check if there are no errors in the log
    const errorOutput = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(errorOutput).to.not.include('Error');
  });

  it('should confirm the recomposed files in a mock directory match the reference files', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
    await compareDirectories(originalDirectory2, mockDirectory2);
  });
});
