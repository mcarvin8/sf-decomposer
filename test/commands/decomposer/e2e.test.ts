'use strict';

import * as fs from 'node:fs';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fsPromises from 'node:fs/promises';
import * as fsSync from 'fs-extra';

import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DecomposerRecompose from '../../../src/commands/decomposer/recompose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';
import { jsonData } from '../../../src/metadata/metadata.js';

describe('e2e', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let testCounter = 0; // Counter to track the test order

  const originalDirectory: string = 'force-app/main/default';
  const mockDirectory: string = 'mock';

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);

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

  it('should recompose all supported metadata types', async () => {
    for (const metadataType of jsonData) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerRecompose.run(['--metadata-type', metadataType.metaSuffix, '--dx-directory', mockDirectory]);
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
      // If it's a directory, recursively compare its contents
      compareDirectories(refEntryPath, mockPath);
    } else {
      // If it's a file, compare its content
      const refContent = fs.readFileSync(refEntryPath, 'utf-8');
      const mockContent = fs.readFileSync(mockPath, 'utf-8');
      assert.strictEqual(refContent, mockContent, `File content is different for ${entry.name}`);
    }
  }
}

async function copyAsync(source: string, destination: string): Promise<void> {
  await fsSync.copy(source, destination, { overwrite: true });
}

function removeSync(directoryPath: string): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  fsPromises.rm(directoryPath, { recursive: true });
}
