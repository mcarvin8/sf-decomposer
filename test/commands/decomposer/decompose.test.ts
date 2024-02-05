/* eslint-disable  */

import crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as fsSync from 'fs-extra';

import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DecomposerCompose from '../../../src/commands/decomposer/compose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';
import { jsonData } from '../../../src/metadata/metadata.js';

describe('decomposer', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let testCounter = 0; // Counter to track the test order

  const originalDirectory: string = 'force-app/main/default';
  const mockDirectory: string = 'mock';
  let originalHashes: string[];

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

    // Calculate SHA-256 hashes for all files in the original directory
    originalHashes = await calculateHashes(originalDirectory);

    // Create a mock directory by copying the original directory
    await copyAsync(originalDirectory, mockDirectory);
  });

  afterEach(() => {
    $$.restore();
    testCounter += 1;

    // Remove the mock directory only after the last test
    if (testCounter === 3) {
      return removeSync(mockDirectory);
    }
  });

  it('should decompose all supported metadata types', async () => {
    for (const metadataType of jsonData) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerDecompose.run(['--metadata-type', metadataType.metaSuffix, '--dx-directory', mockDirectory]);
      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      expect(output).to.include(
        `All metadata files have been decomposed for the metadata type: ${metadataType.metaSuffix}`
      );
    }
  });

  it('should compose all supported metadata types', async () => {
    for (const metadataType of jsonData) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerCompose.run(['--metadata-type', metadataType.metaSuffix, '--dx-directory', mockDirectory]);
    }

    // Check if there are no errors in the log
    // Can't clear the existing log to check standard output message
    const errorOutput = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(errorOutput).to.not.include('Error');
  });

  it('should confirm the files in the directory match the original files', async () => {
    const mockHashes = await calculateHashes(mockDirectory);
    expect(mockHashes).to.deep.equal(originalHashes);
  });
});

async function calculateHashes(directoryPath: string): Promise<string[]> {
  const fileNames: string[] = await fs.readdir(directoryPath);
  const hashes: string[] = [];

  for (const fileName of fileNames) {
    const filePath: string = `${directoryPath}/${fileName}`;

    // Check if the current item is a file
    const isFile = (await fs.stat(filePath)).isFile();

    if (isFile) {
      const fileData: Buffer = await fs.readFile(filePath);
      const hash: string = crypto.createHash('sha256').update(fileData).digest('hex');
      hashes.push(hash);
    }
  }

  return hashes;
}

async function copyAsync(source: string, destination: string): Promise<void> {
  await fsSync.copy(source, destination, { overwrite: true });
}

function removeSync(directoryPath: string): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  fs.rm(directoryPath, { recursive: true });
}
