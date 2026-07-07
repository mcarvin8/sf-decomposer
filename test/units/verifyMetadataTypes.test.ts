'use strict';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// ---- Mocks ---------------------------------------------------------------
//
// `verifyMetadataTypes` orchestrates a per-file round-trip check: resolve effective types, look
// up each type's registry attributes, discover its parent XML files, resolve per-component
// options, and call `verifyXmlRoundtrip` once per file. The orchestration logic (aggregation,
// path-relativization, logging, manifest-skip/error-propagation, option resolution) is the only
// thing worth covering here, so the heavy dependencies are mocked. The actual Rust-backed
// disassembly is exercised for real by test/commands/decomposer/verify.test.ts.

const {
  verifyXmlRoundtripSpy,
  getRegistryValuesBySuffixSpy,
  listParentXmlFilesForTypeSpy,
  resolveEffectiveMetadataTypesSpy,
} = vi.hoisted(() => ({
  verifyXmlRoundtripSpy: vi.fn(),
  getRegistryValuesBySuffixSpy: vi.fn(),
  listParentXmlFilesForTypeSpy: vi.fn(),
  resolveEffectiveMetadataTypesSpy: vi.fn(),
}));

vi.mock('config-disassembler', () => ({
  verifyXmlRoundtrip: verifyXmlRoundtripSpy,
}));

vi.mock('../../src/metadata/getRegistryValuesBySuffix.js', () => ({
  getRegistryValuesBySuffix: getRegistryValuesBySuffixSpy,
}));

vi.mock('../../src/metadata/listParentXmlFiles.js', () => ({
  listParentXmlFilesForType: listParentXmlFilesForTypeSpy,
}));

vi.mock('../../src/metadata/parseManifest.js', () => ({
  resolveEffectiveMetadataTypes: resolveEffectiveMetadataTypesSpy,
}));

const { verifyMetadataTypes } = await import('../../src/core/verifyMetadataTypes.js');

// ---- Test plumbing -------------------------------------------------------

type Project = { root: string };

async function makeProject(packageDirs: string[] = ['force-app']): Promise<Project> {
  // realpath so the temp root compares equal to the cwd-derived repo root the SUT computes
  // internally (mkdtemp on macOS returns a path resolved differently than process.cwd()).
  const root = await realpath(await mkdtemp(join(tmpdir(), 'verify-mt-')));
  for (const dir of packageDirs) {
    await mkdir(join(root, dir), { recursive: true });
  }
  await writeFile(
    join(root, SFDX_CONFIG_FILE),
    JSON.stringify({ packageDirectories: packageDirs.map((path) => ({ path, default: true })) }, null, 2),
  );
  return { root };
}

function defaultMetaAttributes(over: Partial<Record<string, unknown>> = {}): {
  metaSuffix: string;
  strictDirectoryName: boolean;
  folderType: string;
  metadataPaths: string[];
  uniqueIdElements: string;
} {
  return {
    metaSuffix: 'permissionset',
    strictDirectoryName: false,
    folderType: '',
    metadataPaths: ['/fake/permissionsets'],
    uniqueIdElements: 'fullName,name',
    ...over,
  };
}

describe('verifyMetadataTypes', () => {
  const originalCwd = process.cwd();
  let project: Project;
  let logMock: Mock;

  beforeEach(async () => {
    project = await makeProject();
    process.chdir(project.root);
    logMock = vi.fn();

    verifyXmlRoundtripSpy.mockReset().mockResolvedValue({ status: 'identical' });
    getRegistryValuesBySuffixSpy.mockReset().mockResolvedValue({
      metaAttributes: defaultMetaAttributes(),
      ignorePath: '.sfdecomposerignore',
    });
    listParentXmlFilesForTypeSpy.mockReset().mockResolvedValue([
      {
        filePath: join(project.root, 'force-app', 'permissionsets', 'HR_Admin.permissionset-meta.xml'),
        fullName: 'HR_Admin',
      },
    ]);
    resolveEffectiveMetadataTypesSpy
      .mockReset()
      .mockResolvedValue({ manifestFilter: undefined, effectiveTypes: ['permissionset'] });
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(project.root, { recursive: true, force: true });
  });

  it('returns empty drift/reordered and logs success when every file round-trips identically', async () => {
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

  it('reports drift with the path relative to its package directory', async () => {
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift', reason: 'content drift' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
    const combined = logMock.mock.calls.flat().join('\n');
    expect(combined).toContain('Round-trip drift detected in 1 file(s):');
    expect(combined).toContain('- permissionsets/HR_Admin.permissionset-meta.xml: content drift');
  });

  it('defaults the drift reason to "content drift" when verifyXmlRoundtrip omits it', async () => {
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
  });

  it('does not treat "missing in round-trip output" as drift (leaf-only/unparseable files are untouched by the real pipeline)', async () => {
    // A real decompose run silently skips files it can't disassemble at all (leaf-only XML, or
    // XML the parser rejects) -- no directory is ever created, so recompose has nothing to
    // touch and the file stays byte-identical throughout. Only "content drift" (reassembly
    // actually produced different content) should count as real drift.
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift', reason: 'missing in round-trip output' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
    expect(logMock.mock.calls.flat().join('\n')).toContain(
      'Round-trip verified for 1 metadata type(s); no drift detected.',
    );
  });

  it('reports reordered files on a separate channel without counting them as drift', async () => {
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'reordered' });

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
    expect(combined).toContain('Round-trip verified for 1 metadata type(s); no drift detected.');
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
  });

  it('aggregates drift/reordered across multiple types and multiple files, preserving type order', async () => {
    resolveEffectiveMetadataTypesSpy.mockResolvedValue({
      manifestFilter: undefined,
      effectiveTypes: ['permissionset', 'workflow'],
    });
    getRegistryValuesBySuffixSpy.mockImplementation(async (metadataType: string) => ({
      metaAttributes: defaultMetaAttributes({ metaSuffix: metadataType }),
      ignorePath: '.sfdecomposerignore',
    }));
    listParentXmlFilesForTypeSpy.mockImplementation(async (metaAttributes: { metaSuffix: string }) => {
      if (metaAttributes.metaSuffix === 'permissionset') {
        return [
          {
            filePath: join(project.root, 'force-app', 'permissionsets', 'HR_Admin.permissionset-meta.xml'),
            fullName: 'HR_Admin',
          },
        ];
      }
      return [{ filePath: join(project.root, 'force-app', 'workflows', 'Case.workflow-meta.xml'), fullName: 'Case' }];
    });
    verifyXmlRoundtripSpy.mockImplementation(async (opts: { filePath: string }) => {
      if (opts.filePath.includes('HR_Admin')) return { status: 'drift', reason: 'content drift' };
      return { status: 'reordered' };
    });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.metadata).toEqual(['permissionset', 'workflow']);
    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
    expect(result.reordered).toEqual(['workflows/Case.workflow-meta.xml']);
  });

  it('computes the drift path relative to the correct package directory among several', async () => {
    project = await makeProject(['force-app', 'unpackaged']);
    process.chdir(project.root);
    const filePath = join(project.root, 'unpackaged', 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    listParentXmlFilesForTypeSpy.mockResolvedValue([{ filePath, fullName: 'HR_Admin' }]);
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift', reason: 'content drift' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
  });

  it('picks the most specific (longest) package directory when one is nested inside another', async () => {
    project = await makeProject(['force-app', join('force-app', 'nested')]);
    process.chdir(project.root);
    const filePath = join(project.root, 'force-app', 'nested', 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    listParentXmlFilesForTypeSpy.mockResolvedValue([{ filePath, fullName: 'HR_Admin' }]);
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift', reason: 'content drift' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([{ path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' }]);
  });

  it('falls back to the repo root when the file is outside every package directory', async () => {
    // A manifest-resolved file could in principle live outside every declared package
    // directory (e.g. an unconventional sfdx-project.json). relativeToPackageDir must not
    // throw in that case -- it falls back to repoRoot so the path stays relative-ish.
    const filePath = join(project.root, 'outside-any-package', 'HR_Admin.permissionset-meta.xml');
    listParentXmlFilesForTypeSpy.mockResolvedValue([{ filePath, fullName: 'HR_Admin' }]);
    verifyXmlRoundtripSpy.mockResolvedValue({ status: 'drift', reason: 'content drift' });

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(result.drift).toEqual([
      { path: 'outside-any-package/HR_Admin.permissionset-meta.xml', reason: 'content drift' },
    ]);
  });

  it('propagates the registry lookup error when no manifest is in play', async () => {
    getRegistryValuesBySuffixSpy.mockRejectedValue(new Error('Metadata type not found for the given suffix: bogus.'));

    await expect(
      verifyMetadataTypes({
        metadataTypes: ['bogus'],
        format: 'xml',
        ignoreDirs: undefined,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        log: logMock,
      }),
    ).rejects.toThrow('Metadata type not found for the given suffix: bogus.');
  });

  it('skips a type and logs a warning when its registry lookup fails under a manifest', async () => {
    resolveEffectiveMetadataTypesSpy.mockResolvedValue({
      manifestFilter: { parentXmlsBySuffix: new Map(), suffixes: ['bogus'], unresolvedComponents: [] },
      effectiveTypes: ['bogus'],
    });
    getRegistryValuesBySuffixSpy.mockRejectedValue(new Error('boom'));

    const result = await verifyMetadataTypes({
      metadataTypes: undefined,
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      manifest: 'package.xml',
      log: logMock,
    });

    expect(result.metadata).toEqual([]);
    expect(listParentXmlFilesForTypeSpy).not.toHaveBeenCalled();
    expect(logMock.mock.calls.flat().join('\n')).toContain('Skipping bogus: boom');
  });

  it('returns early with no types when the manifest filter yields zero effective types', async () => {
    resolveEffectiveMetadataTypesSpy.mockResolvedValue({ manifestFilter: undefined, effectiveTypes: [] });

    const result = await verifyMetadataTypes({
      metadataTypes: undefined,
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      manifest: 'package.xml',
      log: logMock,
    });

    expect(result).toEqual({ metadata: [], drift: [], reordered: [] });
    expect(getRegistryValuesBySuffixSpy).not.toHaveBeenCalled();
    expect(logMock.mock.calls.flat().join('\n')).toContain(
      'No metadata types to verify after applying the manifest filter.',
    );
  });

  it('passes the type-level uniqueIdElements (not a component-level override) to verifyXmlRoundtrip', async () => {
    getRegistryValuesBySuffixSpy.mockResolvedValue({
      metaAttributes: defaultMetaAttributes({ uniqueIdElements: 'fullName,name,typeLevelField' }),
      ignorePath: '.sfdecomposerignore',
    });

    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
      overrides: [{ components: ['permissionset:HR_Admin'], uniqueIdElements: 'componentLevelField' }],
    });

    expect(verifyXmlRoundtripSpy).toHaveBeenCalledWith(
      expect.objectContaining({ uniqueIdElements: 'fullName,name,typeLevelField' }),
    );
  });

  it('passes fileExtension as `${metadataType}-meta.xml` and the ignorePath from the registry lookup', async () => {
    await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(verifyXmlRoundtripSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fileExtension: 'permissionset-meta.xml', ignorePath: '.sfdecomposerignore' }),
    );
  });

  it('resolves multiLevel via the built-in default for bot under unique-id strategy', async () => {
    resolveEffectiveMetadataTypesSpy.mockResolvedValue({ manifestFilter: undefined, effectiveTypes: ['bot'] });
    getRegistryValuesBySuffixSpy.mockResolvedValue({
      metaAttributes: defaultMetaAttributes({ metaSuffix: 'bot', strictDirectoryName: true }),
      ignorePath: '.sfdecomposerignore',
    });
    listParentXmlFilesForTypeSpy.mockResolvedValue([
      { filePath: join(project.root, 'force-app', 'bots', 'MyBot', 'MyBot.bot-meta.xml'), fullName: 'MyBot' },
    ]);

    await verifyMetadataTypes({
      metadataTypes: ['bot'],
      format: 'xml',
      ignoreDirs: undefined,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log: logMock,
    });

    expect(verifyXmlRoundtripSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        multiLevel: ['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'],
      }),
    );
  });
});
