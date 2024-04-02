'use strict';

import * as fs from 'node:fs';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as promises from 'node:fs/promises';
import * as fsSync from 'fs-extra';

import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { setLogLevel } from 'xml-disassembler';
import DecomposerRecompose from '../../../src/commands/decomposer/recompose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';

describe('e2e', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  const originalDirectory: string = 'test/baselines';
  const mockDirectory: string = 'mock';
  const metadataTypes = [
    'labels',
    'workflow',
    'bot',
    'profile',
    'permissionset',
    'flow',
    'matchingRule',
    'assignmentRules',
    'escalationRules',
    'sharingRules',
    'autoResponseRules',
    'globalValueSetTranslation',
    'standardValueSetTranslation',
    'translation',
    'globalValueSet',
    'standardValueSet',
    'decisionMatrixDefinition',
    'aiScoringModelDefinition',
    'marketingappextension',
    'app',
  ];
  let sfdxConfigFile = 'sfdx-project.json';
  sfdxConfigFile = path.resolve(sfdxConfigFile);
  const configFile = {
    packageDirectories: [{ path: 'mock', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  const configJsonString = JSON.stringify(configFile, null, 2);

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    setLogLevel('debug');

    await fsSync.copy(originalDirectory, mockDirectory, { overwrite: true });
    fs.writeFileSync(sfdxConfigFile, configJsonString);
  });

  afterEach(() => {
    $$.restore();
  });

  after(async () => {
    await promises.rm(mockDirectory, { recursive: true });
    await promises.rm(sfdxConfigFile);
  });

  it('should decompose all supported metadata types, then delete the original files', async () => {
    for (const metadataType of metadataTypes) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerDecompose.run(['--metadata-type', metadataType, '--postpurge', '--prepurge']);
      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }
  });

  it('should recompose all supported metadata types', async () => {
    for (const metadataType of metadataTypes) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerRecompose.run(['--metadata-type', metadataType]);
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
    compareDirectories(originalDirectory, mockDirectory);
  });
});

function compareDirectories(referenceDir: string, mockDir: string): void {
  const entriesinRef = fs.readdirSync(referenceDir, { withFileTypes: true });

  // Only compare files that are in the reference directory (composed files)
  // Ignore files only found in the mock directory (decomposed files)
  for (const entry of entriesinRef) {
    const refEntryPath = path.join(referenceDir, entry.name);
    const mockPath = path.join(mockDir, entry.name);

    if (entry.isDirectory()) {
      compareDirectories(refEntryPath, mockPath);
    } else {
      const refContent = fs.readFileSync(refEntryPath, 'utf-8');
      const mockContent = fs.readFileSync(mockPath, 'utf-8');
      assert.strictEqual(refContent, mockContent, `File content is different for ${entry.name}`);
    }
  }
}
