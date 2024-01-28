import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';
import jsonData from '../../../src/metadata/metadata.js';

describe('decomposer decompose', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('should decompose all supported metadata types', async () => {
    for (const metadataType of jsonData) {
      // eslint-disable-next-line no-await-in-loop  
      await DecomposerDecompose.run(['--metadata-type', metadataType.metaSuffix]);
        const output = sfCommandStubs.log
          .getCalls()
          .flatMap((c) => c.args)
          .join('\n');
        expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType.metaSuffix}`);
      }});
});
