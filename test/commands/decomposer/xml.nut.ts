import { rm, writeFile } from 'node:fs/promises';
import { copy } from 'fs-extra';

import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

import { SFDX_CONFIG_FILE } from './constants.js';

describe('apex-code-coverage:transformer:transform NUTs', () => {
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
  const metadatatype = 'labels';

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

  it('decomposes custom labels.', async () => {
    const command = `decomposer decompose --metadata-type "${metadatatype}" --postpurge`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    expect(output.replace('\n', '')).to.equal(
      `All metadata files have been decomposed for the metadata type: ${metadatatype}`
    );
  });

  it('recomposes custom labels.', async () => {
    const command = `decomposer recompose --metadata-type "${metadatatype}"`;
    const output = execCmd(command, { ensureExitCode: 0 }).shellOutput.stdout;

    expect(output.replace('\n', '')).to.equal(
      `All metadata files have been recomposed for the metadata type: ${metadatatype}`
    );
  });
});
