'use strict';

import { mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { DecomposeOptions, RecomposeOptions } from '../../src/helpers/types.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// ---- Mocks ---------------------------------------------------------------
//
// `verifyMetadataTypes` orchestrates a round-trip check by delegating the actual
// decompose/recompose work to its sibling helpers. The orchestration logic --
// temp project bootstrap, manifest mirroring, overrides scrubbing, `decomposed.metadata.length`
// branching, `chdir` discipline, and diff aggregation -- is the only thing
// worth covering here, so we mock the two heavy dependencies. The actual
// Rust-backed disassembly is exercised by metadata.test.ts and the NUTs.

const { decomposeSpy, recomposeSpy } = vi.hoisted(() => ({
  decomposeSpy: vi.fn(),
  recomposeSpy: vi.fn(),
}));

vi.mock('../../src/core/decomposeMetadataTypes.js', () => ({
  decomposeMetadataTypes: decomposeSpy,
}));

vi.mock('../../src/core/recomposeMetadataTypes.js', () => ({
  recomposeMetadataTypes: recomposeSpy,
}));

// Typed accessors for the mock call args. The spies are intentionally `any`-typed by
// vitest, so we lift them through these helpers to keep the test bodies type-safe.
function lastDecomposeArgs(): DecomposeOptions {
  return decomposeSpy.mock.calls[decomposeSpy.mock.calls.length - 1][0] as DecomposeOptions;
}
function lastRecomposeArgs(): RecomposeOptions {
  return recomposeSpy.mock.calls[recomposeSpy.mock.calls.length - 1][0] as RecomposeOptions;
}

const { verifyMetadataTypes } = await import('../../src/core/verifyMetadataTypes.js');

// ---- Test plumbing -------------------------------------------------------

type Project = {
  root: string;
  forceAppDir: string;
  permsetFile: string;
};

const SFDX_PROJECT_BODY = JSON.stringify(
  {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  },
  null,
  2,
);

async function makeProject(): Promise<Project> {
  // mkdtemp on macOS returns a path under `/var/folders/...`, but `process.cwd()` resolves
  // it through the `/var -> /private/var` symlink to `/private/var/folders/...`. The SUT
  // builds its return values off the cwd-derived repo root, so we realpath here to make
  // tests compare against the same root-form the function uses internally.
  const root = await realpath(await mkdtemp(join(tmpdir(), 'verify-mt-')));
  const forceAppDir = join(root, 'force-app');
  await mkdir(join(forceAppDir, 'permissionsets'), { recursive: true });
  const permsetFile = join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
  await writeFile(permsetFile, '<r><x>1</x></r>');
  await writeFile(join(root, SFDX_CONFIG_FILE), SFDX_PROJECT_BODY);
  return { root, forceAppDir, permsetFile };
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('verifyMetadataTypes', () => {
  const originalCwd = process.cwd();
  let project: Project;
  let logMock: Mock;

  beforeEach(async () => {
    project = await makeProject();
    process.chdir(project.root);
    logMock = vi.fn();

    // Default mocks: decompose claims success on permissionset; recompose is a no-op.
    decomposeSpy.mockResolvedValue({ metadata: ['permissionset'] });
    recomposeSpy.mockResolvedValue({ metadata: ['permissionset'] });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(project.root, { recursive: true, force: true });
  });

  it('returns empty drift when the round trip leaves the package dirs byte-identical', async () => {
    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.metadata).toEqual(['permissionset']);
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
    expect(logMock.mock.calls.flat().join('\n')).toContain(
      'Round-trip verified for 1 metadata type(s); no drift detected.',
    );
  });

  it('reports drift when the recompose mock leaves the parent XML with different content', async () => {
    // Simulate a buggy decomposer that produces a slightly different parent XML on recompose.
    recomposeSpy.mockImplementationOnce(async () => {
      // Locate the copied parent XML inside the temp project (it lives under
      // .../verify-***/force-app/permissionsets/HR_Admin.permissionset-meta.xml).
      // We can't predict the temp dir name, so resolve via process.cwd(), which the function
      // has chdir'd into for this phase.
      const target = resolve(process.cwd(), 'force-app', 'permissionsets', 'HR_Admin.permissionset-meta.xml');
      await writeFile(target, '<r><x>99</x></r>');
      return { metadata: ['permissionset'] };
    });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
    expect(result.reordered).toEqual([]);
    expect(logMock.mock.calls.flat().join('\n')).toContain('Round-trip drift detected in 1 file(s):');
    expect(logMock.mock.calls.flat().join('\n')).toContain(
      '- permissionsets/HR_Admin.permissionset-meta.xml: content drift',
    );
  });

  it('reports reordered XML on a separate channel without flagging it as drift', async () => {
    // The original is `<r><x>1</x><x>2</x></r>`; recompose-mock writes the same content but with
    // siblings reordered. diffDirectories must surface this as reordered, not drift.
    await writeFile(project.permsetFile, '<r><x>1</x><x>2</x></r>');
    recomposeSpy.mockImplementationOnce(async () => {
      const target = resolve(process.cwd(), 'force-app', 'permissionsets', 'HR_Admin.permissionset-meta.xml');
      await writeFile(target, '<r><x>2</x><x>1</x></r>');
      return { metadata: ['permissionset'] };
    });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual(['permissionsets/HR_Admin.permissionset-meta.xml']);
    const combined = logMock.mock.calls.flat().join('\n');
    // The reordered log fires only when reordered.length > 0 (kills the `>` mutation on line 136).
    expect(combined).toContain('Note: 1 file(s) round-tripped semantically');
    expect(combined).toContain('- permissionsets/HR_Admin.permissionset-meta.xml');
  });

  it('does not emit the reordered log when nothing reordered', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    const combined = logMock.mock.calls.flat().join('\n');
    expect(combined).not.toContain('Note:');
    expect(combined).not.toContain('round-tripped semantically');
  });

  it('passes prepurge=true and postpurge=false through to decomposeMetadataTypes', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(decomposeSpy).toHaveBeenCalledTimes(1);
    const args = lastDecomposeArgs();
    expect(args.prepurge).toBe(true);
    // Verify must keep the parent XML in place so the recompose step can find it via the manifest.
    expect(args.postpurge).toBe(false);
    expect(args.metadataTypes).toEqual(['permissionset']);
    expect(args.strategy).toBe('unique-id');
    expect(args.format).toBe('xml');
  });

  it('passes postpurge=true through to recomposeMetadataTypes', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(recomposeSpy).toHaveBeenCalledTimes(1);
    const args = lastRecomposeArgs();
    // Postpurge clears the decomposed children once recompose has rebuilt the parent.
    expect(args.postpurge).toBe(true);
    expect(args.metadataTypes).toEqual(['permissionset']);
  });

  it('skips the recompose call when decompose returns no metadata', async () => {
    // Boundary case for `if (decomposed.metadata.length > 0)`.
    decomposeSpy.mockResolvedValueOnce({ metadata: [] });

    const result = await verifyMetadataTypes({
      metadataTypes: ['workflow'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(decomposeSpy).toHaveBeenCalledTimes(1);
    expect(recomposeSpy).not.toHaveBeenCalled();
    expect(result.metadata).toEqual([]);
    // No-drift log uses decomposed.metadata.length, so it should say "0 metadata type(s)" here.
    expect(logMock.mock.calls.flat().join('\n')).toContain('Round-trip verified for 0 metadata type(s)');
  });

  it('runs recompose exactly once when decompose returns one metadata type', async () => {
    decomposeSpy.mockResolvedValueOnce({ metadata: ['permissionset'] });

    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(recomposeSpy).toHaveBeenCalledTimes(1);
  });

  it('runs recompose when decompose returns multiple metadata types', async () => {
    // Bump up the fixture so multiple types are present in the SFDX project.
    await mkdir(join(project.forceAppDir, 'workflows'), { recursive: true });
    await writeFile(join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml'), '<Workflow/>');

    decomposeSpy.mockResolvedValueOnce({ metadata: ['permissionset', 'workflow'] });

    await verifyMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(recomposeSpy).toHaveBeenCalledTimes(1);
    expect(lastRecomposeArgs().metadataTypes).toEqual(['permissionset', 'workflow']);
  });

  it('strips user-supplied prePurge/postPurge from overrides before invoking decompose', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
      overrides: [
        {
          metadataTypes: ['permissionset'],
          prePurge: true,
          postPurge: true,
          strategy: 'grouped-by-tag',
        },
      ],
    });

    expect(decomposeSpy).toHaveBeenCalledTimes(1);
    const args = lastDecomposeArgs();
    expect(args.overrides).toHaveLength(1);
    // The overrides array is typed as DecomposerOverride[] | undefined; the prior assertion
    // narrows it to a non-empty array, so the first entry is safe to access.
    const passedOverride = (args.overrides ?? [])[0];
    // The override must survive otherwise (strategy/metadataTypes still present)...
    expect(passedOverride.metadataTypes).toEqual(['permissionset']);
    expect(passedOverride.strategy).toBe('grouped-by-tag');
    // ...but prePurge and postPurge must have been removed.
    expect(passedOverride).not.toHaveProperty('prePurge');
    expect(passedOverride).not.toHaveProperty('postPurge');
  });

  it('does not introduce an overrides array when none was supplied', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(lastDecomposeArgs().overrides).toBeUndefined();
  });

  it('copies the manifest into the temp project at the same repo-relative path and forwards the absolute temp path', async () => {
    // Build a real manifest inside the project and pass it via the options.
    const manifestRel = join('config', 'package.xml');
    const manifestAbs = resolve(project.root, manifestRel);
    await mkdir(resolve(project.root, 'config'), { recursive: true });
    await writeFile(
      manifestAbs,
      '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><version>58.0</version></Package>',
    );

    // Capture the repoRoot and manifest path at the moment decompose is called -- this is
    // when the temp project still exists on disk. We realpath both inside the mock to
    // normalise away platform-specific path quirks (macOS `/var -> /private/var` and
    // Windows 8.3 short names like `MATTHE~1.CAR`).
    let repoRootDuringDecompose: string | undefined;
    let manifestDuringDecompose: string | undefined;
    let realManifestDuringDecompose: string | undefined;
    let realRepoRootDuringDecompose: string | undefined;
    decomposeSpy.mockImplementationOnce(async (opts: { manifest?: string; repoRoot?: string }) => {
      repoRootDuringDecompose = opts.repoRoot;
      if (repoRootDuringDecompose) {
        realRepoRootDuringDecompose = await realpath(repoRootDuringDecompose);
      }
      manifestDuringDecompose = opts.manifest;
      if (manifestDuringDecompose) {
        realManifestDuringDecompose = await realpath(manifestDuringDecompose);
      }
      return { metadata: ['permissionset'] };
    });

    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      manifest: manifestRel,
      log: logMock,
    });

    expect(repoRootDuringDecompose).toBeDefined();
    expect(typeof manifestDuringDecompose).toBe('string');
    // The forwarded manifest path must live under the temp project at the same relpath.
    expect(realManifestDuringDecompose).toBe(resolve(realRepoRootDuringDecompose as string, manifestRel));
  });

  it('forwards the same temp manifest path to recompose', async () => {
    const manifestRel = 'package.xml';
    const manifestAbs = resolve(project.root, manifestRel);
    await writeFile(
      manifestAbs,
      '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><version>58.0</version></Package>',
    );

    let manifestForDecompose: string | undefined;
    let manifestForRecompose: string | undefined;
    decomposeSpy.mockImplementationOnce(async (opts: { manifest?: string }) => {
      manifestForDecompose = opts.manifest;
      return { metadata: ['permissionset'] };
    });
    recomposeSpy.mockImplementationOnce(async (opts: { manifest?: string }) => {
      manifestForRecompose = opts.manifest;
      return { metadata: ['permissionset'] };
    });

    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      manifest: manifestRel,
      log: logMock,
    });

    expect(manifestForRecompose).toBe(manifestForDecompose);
    expect(manifestForRecompose).toBeDefined();
  });

  it('passes undefined manifest through to decompose/recompose when none was supplied', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(lastDecomposeArgs().manifest).toBeUndefined();
    expect(lastRecomposeArgs().manifest).toBeUndefined();
  });

  it('restores cwd to the original on the happy path', async () => {
    const before = process.cwd();
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(process.cwd()).toBe(before);
  });

  it('restores cwd and cleans up the temp project even when decompose throws', async () => {
    const before = process.cwd();
    let tempDirSeenByMock: string | undefined;
    // `mockImplementation` (not Once) wins over the default mockResolvedValue from beforeEach
    // and avoids any queueing surprises with mockImplementationOnce + mockResolvedValue.
    decomposeSpy.mockImplementation(async (opts: { repoRoot?: string }) => {
      tempDirSeenByMock = opts.repoRoot;
      throw new Error('boom from decompose');
    });

    await expect(
      verifyMetadataTypes({
        metadataTypes: ['permissionset'],
        format: 'xml',
        ignoreDirs: undefined,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        log: logMock,
      }),
    ).rejects.toThrow('boom from decompose');

    expect(process.cwd()).toBe(before);
    expect(tempDirSeenByMock).toBeDefined();
    // Temp project dir must have been removed by the finally block.
    expect(await pathExists(tempDirSeenByMock as string)).toBe(false);
  });

  it('does not throw when the temp project was already removed before the final cleanup', async () => {
    // Simulates a decompose implementation that removes its own repoRoot; the final `rm` in the
    // `finally` block must still succeed because it passes `force: true` (kills the mutant that
    // flips `force: true` to `force: false`, which would make this throw ENOENT).
    decomposeSpy.mockImplementationOnce(async (opts: { repoRoot?: string }) => {
      if (opts.repoRoot) {
        await rm(opts.repoRoot, { recursive: true, force: true });
      }
      return { metadata: [] };
    });

    await expect(
      verifyMetadataTypes({
        metadataTypes: ['permissionset'],
        format: 'xml',
        ignoreDirs: undefined,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        log: logMock,
      }),
    ).resolves.toBeDefined();
  });

  it('cleans up the temp project on the happy path too', async () => {
    let seen: string | undefined;
    decomposeSpy.mockImplementation(async (opts: { repoRoot?: string }) => {
      seen = opts.repoRoot;
      return { metadata: ['permissionset'] };
    });
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(seen).toBeDefined();
    expect(await pathExists(seen as string)).toBe(false);
  });

  it('mirrors sfdx-project.json verbatim into the temp project', async () => {
    let copiedSfdxBody: string | undefined;
    decomposeSpy.mockImplementation(async (opts: { repoRoot?: string }) => {
      if (opts.repoRoot) {
        copiedSfdxBody = await readFile(join(opts.repoRoot, SFDX_CONFIG_FILE), 'utf-8');
      }
      return { metadata: ['permissionset'] };
    });
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(copiedSfdxBody).toBe(SFDX_PROJECT_BODY);
  });

  it('runs decomposition against a copy under the temp project, not the user repo', async () => {
    let cwdSeen: string | undefined;
    decomposeSpy.mockImplementation(async (opts: { repoRoot?: string }) => {
      cwdSeen = opts.repoRoot;
      return { metadata: ['permissionset'] };
    });
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(cwdSeen).toBeDefined();
    expect(cwdSeen).not.toBe(project.root);
    expect((cwdSeen as string).includes('sf-decomposer-verify-')).toBe(true);
  });

  it('logs the per-file drift reason when drift is detected', async () => {
    recomposeSpy.mockImplementationOnce(async () => {
      const target = resolve(process.cwd(), 'force-app', 'permissionsets', 'HR_Admin.permissionset-meta.xml');
      await writeFile(target, '<r><x>different</x></r>');
      return { metadata: ['permissionset'] };
    });
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    const combined = logMock.mock.calls.flat().join('\n');
    expect(combined).toContain('Round-trip drift detected');
    // Drift logging must include both the path and reason, not just one of them.
    expect(combined).toContain('permissionsets/HR_Admin.permissionset-meta.xml');
    expect(combined).toContain('content drift');
  });

  it('returns the metadata array verbatim from the decompose result', async () => {
    decomposeSpy.mockResolvedValueOnce({ metadata: ['permissionset', 'workflow'] });
    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });
    expect(result.metadata).toEqual(['permissionset', 'workflow']);
  });
});
