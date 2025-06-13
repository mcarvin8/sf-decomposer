import { mkdir, writeFile, rm, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect } from '@jest/globals';

import { moveFiles } from '../../src/service/core/moveFiles.js';

describe('moveFiles', () => {
  const srcDir = 'test/tmp/source';
  const destDir = 'test/tmp/dest';

  beforeEach(async () => {
    await mkdir(srcDir, { recursive: true });
    await mkdir(destDir, { recursive: true });
    await writeFile(join(srcDir, 'testfile.txt'), 'dummy content');
  });

  afterEach(async () => {
    await rm('test/tmp', { recursive: true, force: true });
  });

  it('should move matching files from source to destination', async () => {
    await moveFiles(srcDir, destDir, (name) => name.endsWith('.txt'));
    const destFiles = await readdir(destDir);
    expect(destFiles).toContain('testfile.txt');
    const stats = await stat(join(destDir, 'testfile.txt'));
    expect(stats.isFile()).toBe(true);
  });
  it('should skip files when predicate returns false', async () => {
    const filename = 'skipme.txt';
    await writeFile(join(srcDir, filename), 'should not be moved');

    await moveFiles(srcDir, destDir, (name) => name !== filename); // predicate returns false

    const destFiles = await readdir(destDir);
    expect(destFiles).not.toContain(filename);

    const srcFiles = await readdir(srcDir);
    expect(srcFiles).toContain(filename); // it should remain in source
  });
});
