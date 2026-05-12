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

  // ---- Mutation-gap closures ------------------------------------------
  // The Windows-only error codes EPERM and EEXIST are part of the recoverable-rename branch on
  // line 15 of moveFiles.ts. Until these tests existed, only EXDEV was exercised, so Stryker was
  // free to mutate `code === 'EPERM'` and `code === 'EEXIST'` (the conditionals AND their string
  // literals) without any test ever observing the difference. Each test below pins the SUT
  // behavior for one of those codes specifically: the rename must throw with that exact code,
  // and moveFiles must fall back to copyFile + unlink, leaving the destination populated and the
  // source empty. Together with the EXDEV test above, this covers all three OR branches of the
  // recovery condition.

  it('falls back to copyFile + unlink when rename fails with EPERM (Windows destination busy)', async () => {
    // Mutants killed: ConditionalExpression at line 15:29 (`code === 'EPERM'` → false) and
    // StringLiteral at line 15:38 (`'EPERM'` → `''`). Both mutations turn this branch into a
    // re-throw; the explicit success assertions below would then fail.
    renameMock.mockImplementationOnce(() => {
      const err = new Error('operation not permitted') as NodeJS.ErrnoException;
      err.code = 'EPERM';
      throw err;
    });

    await moveFiles(srcDir, destDir, () => true);

    const destFiles = await readdir(destDir);
    expect(destFiles).toContain('testfile.txt');
    const srcFiles = await readdir(srcDir);
    expect(srcFiles).not.toContain('testfile.txt');
  });

  it('falls back to copyFile + unlink when rename fails with EEXIST (Windows destination exists)', async () => {
    // Mutants killed: ConditionalExpression at line 15:49 (`code === 'EEXIST'` → false) and
    // StringLiteral at line 15:58 (`'EEXIST'` → `''`). As above, mutating this branch to false
    // causes a re-throw; the success assertions below pin the SUT to the recover path.
    renameMock.mockImplementationOnce(() => {
      const err = new Error('file already exists') as NodeJS.ErrnoException;
      err.code = 'EEXIST';
      throw err;
    });

    await moveFiles(srcDir, destDir, () => true);

    const destFiles = await readdir(destDir);
    expect(destFiles).toContain('testfile.txt');
    const srcFiles = await readdir(srcDir);
    expect(srcFiles).not.toContain('testfile.txt');
  });
});
