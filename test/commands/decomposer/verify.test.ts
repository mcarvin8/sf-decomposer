'use strict';

import { copyFile, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyMetadataTypes } from '../../../src/core/verifyMetadataTypes.js';
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

  it('skips verification entirely when no metadata types survive the manifest filter', async () => {
    // Build a manifest pointing at a member that does not exist on disk; parseManifest filters
    // it out and the effective-types list ends up empty, so verify short-circuits before doing
    // any registry lookups or file discovery.
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
    // A user might have postPurge:true in their config to model the real workflow. Verify never
    // forwards prePurge/postPurge to anything — verifyXmlRoundtrip isolates each file's round
    // trip in its own temp dir internally, so these fields are simply unused here.
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

describe('decomposer verify (bot, including botVersion siblings)', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  const fixtureDir: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'verify-bot-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    await cp(fixtureDir, forceAppDir, { recursive: true, force: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('verifies both the bot config and its botVersion sibling without drift, and leaves both untouched', async () => {
    const botPath = join(forceAppDir, 'bots', 'Assessment_Bot', 'Assessment_Bot.bot-meta.xml');
    const versionPath = join(forceAppDir, 'bots', 'Assessment_Bot', 'v1.botVersion-meta.xml');
    const botBefore = await readFile(botPath, 'utf-8');
    const versionBefore = await readFile(versionPath, 'utf-8');

    const logMock = vi.fn();
    const result = await verifyMetadataTypes({
      metadataTypes: ['bot'],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: logMock,
    });

    expect(result.drift).toEqual([]);
    expect(result.metadata).toEqual(['bot']);
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('no drift detected'));

    expect(await readFile(botPath, 'utf-8')).toBe(botBefore);
    expect(await readFile(versionPath, 'utf-8')).toBe(versionBefore);
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
