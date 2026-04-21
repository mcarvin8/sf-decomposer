import { access } from 'node:fs/promises';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { getRepoRoot } from '../../src/service/core/getRepoRoot.js';

vi.mock('node:fs/promises');

const accessMock = access as unknown as Mock;

describe('getRepoRoot recursion', () => {
  it('recursively searches parent directories and eventually throws', async () => {
    // Start in a deeply nested directory
    const fakePath = '/a/b/c';
    process.cwd = vi.fn(() => fakePath) as typeof process.cwd;

    // Set up access to fail for /a/b/c, /a/b, /a, / (4 levels)
    accessMock.mockImplementation((filePath: string) => {
      throw new Error(`File not found at ${filePath}`);
    });

    await expect(getRepoRoot()).rejects.toThrow('sfdx-project.json not found in any parent directory.');

    // Assert recursion happened
    expect(accessMock).toHaveBeenCalledTimes(4); // /a/b/c, /a/b, /a, /
  });
});
