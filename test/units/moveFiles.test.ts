import { mkdir, writeFile, rm, readdir, stat, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

import { moveFiles } from '../../src/service/core/moveFiles.js';

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    rename: vi.fn(actual.rename),
  };
});

const renameMock = rename as unknown as Mock;

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
    renameMock.mockClear();
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

  it('falls back to copyFile + unlink when rename fails with EXDEV', async () => {
    renameMock.mockImplementationOnce(() => {
      const err = new Error('cross-device link not permitted') as NodeJS.ErrnoException;
      err.code = 'EXDEV';
      throw err;
    });

    await moveFiles(srcDir, destDir, () => true);

    const destFiles = await readdir(destDir);
    expect(destFiles).toContain('testfile.txt');
    const srcFiles = await readdir(srcDir);
    expect(srcFiles).not.toContain('testfile.txt');
  });

  it('rethrows when rename fails with a non-recoverable error code', async () => {
    renameMock.mockImplementationOnce(() => {
      const err = new Error('permission denied') as NodeJS.ErrnoException;
      err.code = 'EACCES';
      throw err;
    });

    await expect(moveFiles(srcDir, destDir, () => true)).rejects.toThrow('permission denied');

    // Source file should still be in place since the move failed.
    const srcFiles = await readdir(srcDir);
    expect(srcFiles).toContain('testfile.txt');
  });
});
