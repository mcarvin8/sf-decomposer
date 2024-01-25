import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';

describe('decomposer decompose', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hello', async () => {
    await DecomposerDecompose.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello world');
  });

  it('runs hello with --json and no provided name', async () => {
    const result = await DecomposerDecompose.run([]);
    expect(result.path).to.equal(
      'C:\\Users\\matthew.carvin\\Documents\\sfdx-decomposer\\src\\commands\\decomposer\\decompose.ts'
    );
  });

  it('runs hello world --name Astro', async () => {
    await DecomposerDecompose.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('hello Astro');
  });
});
