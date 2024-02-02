import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DecomposerCompose from '../../../src/commands/decomposer/compose.js';
import { jsonData } from '../../../src/metadata/metadata.js';

describe('decomposer compose', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('should compose all supported metadata types', async () => {
    for (const metadataType of jsonData) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerCompose.run(['--metadata-type', metadataType.metaSuffix]);
      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      expect(output).to.include(
        `All metadata files have been composed for the metadata type: ${metadataType.metaSuffix}`
      );
    }
  });
});
