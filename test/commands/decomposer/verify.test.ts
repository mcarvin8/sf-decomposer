'use strict';

import { copyFile, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyMetadataTypes } from '../../../src/core/verifyMetadataTypes.js';
import * as diffModule from '../../../src/service/verify/diffDirectories.js';
import { SFDX_CONFIG_FILE } from '../../utils/constants.js';

describe('decomposer verify', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  const fixtureDir: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'verify-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    await cp(fixtureDir, forceAppDir, { recursive: true, force: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('returns no drift for a clean fixture round-trip and leaves the working tree untouched', async () => {
    const logMock = vi.fn();
    const before = await readFile(join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml'), 'utf-8');

    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
    expect(result.metadata).toEqual(expect.arrayContaining(['permissionset', 'workflow']));
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('no drift detected'));

    const after = await readFile(join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml'), 'utf-8');
    expect(after).toBe(before);
  });

  it('tolerates sibling reordering in the original XML (semantic equality, not byte equality)', async () => {
    // Round-trip is order-insensitive by design (Salesforce metadata is sibling-order agnostic
    // and config-disassembler does not preserve original sibling order). Build an "original"
    // that is the fixture with two top-level children swapped, and confirm verify still passes.
    const target = join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const original = await readFile(target, 'utf-8');
    // Swap the first two `<applicationVisibilities>` blocks if present; otherwise fall back to
    // a generic <description>↔<label> swap, which both real fixtures contain.
    const reordered = swapFirstTwoBlocks(original, 'fieldPermissions');
    expect(reordered).not.toBe(original);
    await writeFile(target, reordered);

    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: logMock,
    });

    expect(result.drift).toEqual([]);
  });

  it('logs both drift entries and reordered notices when the diff reports each', async () => {
    // Constructing genuine round-trip drift / reorder on this fixture is unreliable —
    // config-disassembler is deterministic and this fixture round-trips clean — so we stub
    // diffDirectories to exercise both reporting branches together.
    const spy = vi.spyOn(diffModule, 'diffDirectories').mockResolvedValue({
      drift: [
        { path: 'permissionsets/HR_Admin.permissionset-meta.xml', reason: 'content drift' },
        { path: 'workflows/Case.workflow-meta.xml', reason: 'missing in round-trip output' },
      ],
      reordered: ['profiles/SuperUser.profile-meta.xml'],
    });

    const logMock = vi.fn();
    try {
      const result = await verifyMetadataTypes({
        metadataTypes: ['permissionset'],
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      expect(result.drift).toHaveLength(2);
      expect(result.reordered).toEqual(['profiles/SuperUser.profile-meta.xml']);

      expect(logMock).toHaveBeenCalledWith(expect.stringContaining('Round-trip drift detected in 2 file(s)'));
      expect(logMock).toHaveBeenCalledWith(
        expect.stringContaining('permissionsets/HR_Admin.permissionset-meta.xml: content drift'),
      );
      expect(logMock).toHaveBeenCalledWith(
        expect.stringContaining('workflows/Case.workflow-meta.xml: missing in round-trip output'),
      );

      expect(logMock).toHaveBeenCalledWith(
        expect.stringContaining('1 file(s) round-tripped semantically but with sibling/attribute reordering'),
      );
      expect(logMock).toHaveBeenCalledWith(expect.stringContaining('profiles/SuperUser.profile-meta.xml'));
    } finally {
      spy.mockRestore();
    }
  });

  it('logs reorder notices on a clean round-trip (no drift) when only ordering changed', async () => {
    // Stub a reorder-only result to confirm `verify` does NOT fail on reorder and does log it.
    const spy = vi.spyOn(diffModule, 'diffDirectories').mockResolvedValue({
      drift: [],
      reordered: ['workflows/Case.workflow-meta.xml'],
    });

    const logMock = vi.fn();
    try {
      const result = await verifyMetadataTypes({
        metadataTypes: ['workflow'],
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        log: logMock,
      });

      expect(result.drift).toEqual([]);
      expect(result.reordered).toEqual(['workflows/Case.workflow-meta.xml']);
      expect(logMock).toHaveBeenCalledWith(expect.stringContaining('no drift detected'));
      expect(logMock).toHaveBeenCalledWith(
        expect.stringContaining('1 file(s) round-tripped semantically but with sibling/attribute reordering'),
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('skips the recompose step when no metadata types survive the manifest filter', async () => {
    // Build a manifest pointing at a member that does not exist on disk; parseManifest filters
    // it out, decompose returns zero processed types, and the recompose call must be skipped
    // (otherwise it would throw "Either --metadata-type or --manifest must be provided").
    await writeFile(
      join(tempProjectDir, 'package.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Package xmlns="http://soap.sforce.com/2006/04/metadata">',
        '  <types>',
        '    <members>Definitely_Missing_Workflow</members>',
        '    <name>Workflow</name>',
        '  </types>',
        '  <version>58.0</version>',
        '</Package>',
        '',
      ].join('\n'),
    );

    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: undefined,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      manifest: 'package.xml',
      log: logMock,
    });

    expect(result.metadata).toEqual([]);
    expect(result.drift).toEqual([]);
  });

  it('honors the manifest filter end-to-end', async () => {
    await writeFile(
      join(tempProjectDir, 'package.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Package xmlns="http://soap.sforce.com/2006/04/metadata">',
        '  <types>',
        '    <members>Case</members>',
        '    <name>Workflow</name>',
        '  </types>',
        '  <version>58.0</version>',
        '</Package>',
        '',
      ].join('\n'),
    );

    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: undefined,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      manifest: 'package.xml',
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.metadata).toEqual(['workflow']);
  });
});

describe('decomposer verify (component overrides)', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  const fixtureDir: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'verify-overrides-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    await cp(fixtureDir, forceAppDir, { recursive: true, force: true });
    const hrAdminPath = join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const bigPermSetPath = join(forceAppDir, 'permissionsets', 'Big_PermSet.permissionset-meta.xml');
    await copyFile(hrAdminPath, bigPermSetPath);
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('verifies a mixed per-component config without drift', async () => {
    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        { metadataTypes: ['permissionset'], decomposedFormat: 'yaml' },
        { components: ['permissionset:HR_Admin'], strategy: 'grouped-by-tag', decomposeNestedPermissions: true },
      ],
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.metadata).toEqual(['permissionset']);
  });

  it('ignores user-supplied prePurge / postPurge in overrides during verify', async () => {
    // A user might have postPurge:true in their config to model the real workflow. Verify must
    // ignore those so the parent XML stays put for the manifest-driven recompose phase below.
    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: ['permissionset'],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [{ metadataTypes: ['permissionset'], prePurge: true, postPurge: true }],
      log: logMock,
    });

    expect(result.drift).toEqual([]);
  });
});

/**
 * Best-effort sibling swap: locate the first two top-level `<tag>...</tag>` blocks and swap
 * them. Falls back to returning the input unchanged when fewer than two blocks exist (the test
 * guards against this with an explicit `not.toBe` assertion).
 */
function swapFirstTwoBlocks(xml: string, tag: string): string {
  const open = `<${tag}>`;
  const close = `</${tag}>`;

  const firstStart = xml.indexOf(open);
  if (firstStart === -1) return xml;
  const firstEnd = xml.indexOf(close, firstStart);
  /* istanbul ignore next -- @preserve: malformed XML is not produced by the fixture */
  if (firstEnd === -1) return xml;
  const firstFull = firstEnd + close.length;

  const secondStart = xml.indexOf(open, firstFull);
  if (secondStart === -1) return xml;
  const secondEnd = xml.indexOf(close, secondStart);
  /* istanbul ignore next -- @preserve: malformed XML is not produced by the fixture */
  if (secondEnd === -1) return xml;
  const secondFull = secondEnd + close.length;

  const head = xml.slice(0, firstStart);
  const blockA = xml.slice(firstStart, firstFull);
  const middle = xml.slice(firstFull, secondStart);
  const blockB = xml.slice(secondStart, secondFull);
  const tail = xml.slice(secondFull);
  return `${head}${blockB}${middle}${blockA}${tail}`;
}
