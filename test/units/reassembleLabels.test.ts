import { mkdir, mkdtemp, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { CUSTOM_LABELS_FILE, TRAILING_NEWLINE_SIDECAR } from '../../src/helpers/constants.js';
import { reassembleLabels } from '../../src/service/recompose/reassembleLabels.js';

// Stand-in for config-disassembler's reassemble: records what was staged where at call
// time, then writes the reassembled parent file next to the stem directory the way the
// real crate does (`<parent>/<stem>.<ext>`).
const { reassembleSpy } = vi.hoisted(() => ({ reassembleSpy: vi.fn() }));
vi.mock('../../src/service/recompose/recomposeFileHandler.js', () => ({
  reassembleHandler: reassembleSpy,
}));

vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return { ...actual, rename: vi.fn(actual.rename) };
});
const renameMock = rename as unknown as Mock;

const SHARDS = ['Greeting.label-meta.xml', 'Farewell.label-meta.xml', 'Welcome.label-meta.xml'];

describe('reassembleLabels', () => {
  let labelsDir: string;
  let staged: { shards: string[]; stemDir: string[] };

  beforeEach(async () => {
    labelsDir = join(await mkdtemp(join(tmpdir(), 'reassemble-labels-')), 'labels');
    await mkdir(join(labelsDir, 'nested'), { recursive: true });
    for (const shard of SHARDS) await writeFile(join(labelsDir, shard), `<label>${shard}</label>`);
    await writeFile(join(labelsDir, TRAILING_NEWLINE_SIDECAR), 'true');

    staged = { shards: [], stemDir: [] };
    reassembleSpy.mockImplementation(async (stemDir: string) => {
      staged.shards = (await readdir(join(stemDir, 'labels'))).sort();
      staged.stemDir = (await readdir(stemDir)).sort();
      await writeFile(join(labelsDir, CUSTOM_LABELS_FILE), '<CustomLabels/>');
    });
    renameMock.mockClear();
  });

  afterEach(async () => {
    await rm(join(labelsDir, '..'), { recursive: true, force: true });
    reassembleSpy.mockReset();
  });

  it('stages shards under CustomLabels/labels and the sidecar beside them, then reassembles without postpurge', async () => {
    await reassembleLabels(labelsDir, 'labels', true);

    expect(reassembleSpy).toHaveBeenCalledTimes(1);
    expect(reassembleSpy).toHaveBeenCalledWith(join(labelsDir, 'CustomLabels'), 'labels-meta.xml', false);
    expect(staged.shards).toEqual([...SHARDS].sort());
    expect(staged.stemDir).toEqual([TRAILING_NEWLINE_SIDECAR, 'labels'].sort());
  });

  it('with postpurge, leaves only the reassembled file and never moves shards back', async () => {
    await reassembleLabels(labelsDir, 'labels', true);

    // Subdirectories are left alone; every file but the reassembled parent is gone.
    expect((await readdir(labelsDir)).sort()).toEqual([CUSTOM_LABELS_FILE, 'nested'].sort());
    // Only the staging moves happened (3 shards + 1 sidecar): no move-back renames.
    expect(renameMock).toHaveBeenCalledTimes(SHARDS.length + 1);
  });

  it('without postpurge, moves the shards back and removes the staging directory', async () => {
    await reassembleLabels(labelsDir, 'labels', false);

    expect((await readdir(labelsDir)).sort()).toEqual([CUSTOM_LABELS_FILE, 'nested', ...SHARDS].sort());
    // The sidecar was consumed with the staging directory, matching the postpurge path.
    expect(await readdir(labelsDir)).not.toContain(TRAILING_NEWLINE_SIDECAR);
  });
});
