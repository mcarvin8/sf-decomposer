'use strict';

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

  it('should decompose all metadata types under test in XML format', async () => {
    const command = `decomposer decompose --postpurge --prepurge --debug ${METADATA_UNDER_TEST.map(
      (metadataType) => `--metadata-type "${metadataType}"`
    ).join(' ')}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    METADATA_UNDER_TEST.forEach((metadataType) => {
      expect(output.replace('\n', '')).to.include(
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
      expect(output.replace('\n', '')).to.include(
        `All metadata files have been recomposed for the metadata type: ${metadataType}`
      );
    });
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
  });

  it('should decompose all metadata types under test in JSON format', async () => {
    const command = `decomposer decompose --postpurge --prepurge --debug --format "json" ${METADATA_UNDER_TEST.map(
      (metadataType) => `--metadata-type "${metadataType}"`
    ).join(' ')}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    METADATA_UNDER_TEST.forEach((metadataType) => {
      expect(output.replace('\n', '')).to.include(
        `All metadata files have been decomposed for the metadata type: ${metadataType}`
      );
    });
  });

  it('should recompose the decomposed JSON files for all metadata types under test', async () => {
    const command = `decomposer recompose --postpurge --debug --format "json" ${METADATA_UNDER_TEST.map(
      (metadataType) => `--metadata-type "${metadataType}"`
    ).join(' ')}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    METADATA_UNDER_TEST.forEach((metadataType) => {
      expect(output.replace('\n', '')).to.include(
        `All metadata files have been recomposed for the metadata type: ${metadataType}`
      );
    });
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
  });

  it('should decompose all metadata types under test in YAML format', async () => {
    const command = `decomposer decompose --postpurge --prepurge --debug --format "yaml" ${METADATA_UNDER_TEST.map(
      (metadataType) => `--metadata-type "${metadataType}"`
    ).join(' ')}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    METADATA_UNDER_TEST.forEach((metadataType) => {
      expect(output.replace('\n', '')).to.include(
        `All metadata files have been decomposed for the metadata type: ${metadataType}`
      );
    });
  });

  it('should recompose the decomposed YAML files for all metadata types under test', async () => {
    const command = `decomposer recompose --postpurge --debug --format "yaml" ${METADATA_UNDER_TEST.map(
      (metadataType) => `--metadata-type "${metadataType}"`
    ).join(' ')}`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    METADATA_UNDER_TEST.forEach((metadataType) => {
      expect(output.replace('\n', '')).to.include(
        `All metadata files have been recomposed for the metadata type: ${metadataType}`
      );
    });
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    await compareDirectories(originalDirectory, mockDirectory);
  });
});
