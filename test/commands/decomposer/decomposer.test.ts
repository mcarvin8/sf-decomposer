'use strict';

import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';

import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { setLogLevel } from 'xml-disassembler';
import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../../src/core/recomposeMetadataTypes.js';
import { METADATA_UNDER_TEST, SFDX_CONFIG_FILE } from './constants.js';
import { compareDirectories } from './compareDirectories.js';

describe('decomposer unit tests', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  const originalDirectory: string = 'test/baselines';
  const originalDirectory2: string = 'test/baselines2';
  const mockDirectory: string = 'force-app';
  const mockDirectory2: string = 'package';
  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
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

  const formats = ['xml', 'json', 'json5', 'yaml', 'toml', 'ini'];
  for (const format of formats) {
    it(`should decompose all metadata types under test in ${format.toUpperCase()} format`, async () => {
      await decomposeMetadataTypes({
        metadataTypes: METADATA_UNDER_TEST,
        prepurge: true,
        postpurge: true,
        debug: false,
        format,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: sfCommandStubs.log,
        warn: sfCommandStubs.warn,
      });

      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
      });
    });

    it(`should recompose all decomposed ${format.toUpperCase()} files for all metadata types under test`, async () => {
      await recomposeMetadataTypes({
        metadataTypes: METADATA_UNDER_TEST,
        postpurge: true,
        debug: false,
        ignoreDirs: undefined,
        log: sfCommandStubs.log,
        warn: sfCommandStubs.warn,
      });

      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(output).to.include(`All metadata files have been recomposed for the metadata type: ${metadataType}`);
      });
    });

    if (!['toml', 'ini'].includes(format)) {
      it(`should confirm the recomposed ${format.toUpperCase()} files match the reference files`, async () => {
        await compareDirectories(originalDirectory, mockDirectory);
        await compareDirectories(originalDirectory2, mockDirectory2);
      });
    }
  }
});
