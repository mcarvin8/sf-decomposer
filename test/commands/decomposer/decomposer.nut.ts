'use strict';

import { cp, rm, writeFile } from 'node:fs/promises';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { compareDirectories } from '../../utils/compareDirectories.js';
import { FORMATS, METADATA_UNDER_TEST, SFDX_CONFIG_FILE } from '../../utils/constants.js';

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
  });

  async function resetWorkdirs(): Promise<void> {
    await rm(mockDirectory, { recursive: true, force: true });
    await rm(mockDirectory2, { recursive: true, force: true });
    await cp(originalDirectory, mockDirectory, { recursive: true, force: true });
    await cp(originalDirectory2, mockDirectory2, { recursive: true, force: true });
    await writeFile(SFDX_CONFIG_FILE, configJsonString);
  }

  afterAll(async () => {
    await session?.clean();
    await rm(mockDirectory, { recursive: true, force: true });
    await rm(mockDirectory2, { recursive: true, force: true });
    await rm(SFDX_CONFIG_FILE, { force: true });
  });

  for (const format of FORMATS) {
    it(`should decompose and recompose all metadata types under test in ${format.toUpperCase()} format`, async () => {
      await resetWorkdirs();

      const decomposeCommand = `decomposer decompose --postpurge --prepurge --format ${format} ${METADATA_UNDER_TEST.map(
        (metadataType) => `--metadata-type "${metadataType}"`,
      ).join(' ')}`;
      const decomposeOutput = execCmd(decomposeCommand, { ensureExitCode: 0 }).shellOutput.stdout;

      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(decomposeOutput.replace('\n', '')).toContain(
          `All metadata files have been decomposed for the metadata type: ${metadataType}`,
        );
      });

      const recomposeCommand = `decomposer recompose --postpurge ${METADATA_UNDER_TEST.map(
        (metadataType) => `--metadata-type "${metadataType}"`,
      ).join(' ')}`;
      const recomposeOutput = execCmd(recomposeCommand, { ensureExitCode: 0 }).shellOutput.stdout;

      METADATA_UNDER_TEST.forEach((metadataType) => {
        expect(recomposeOutput.replace('\n', '')).toContain(
          `All metadata files have been recomposed for the metadata type: ${metadataType}`,
        );
      });

      await compareDirectories(originalDirectory, mockDirectory);
      await compareDirectories(originalDirectory2, mockDirectory2);
    });
  }
});
