'use strict';

import { copyFile, cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../../src/core/recomposeMetadataTypes.js';
import { compareDirectories } from '../../utils/compareDirectories.js';
import { SFDX_CONFIG_FILE } from '../../utils/constants.js';

describe('decomposer overrides (per-type)', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  let workflowsDir: string;
  let profilesDir: string;
  let permissionsetsDir: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'overrides-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    workflowsDir = join(forceAppDir, 'workflows');
    profilesDir = join(forceAppDir, 'profiles');
    permissionsetsDir = join(forceAppDir, 'permissionsets');

    await cp(originalDirectory, forceAppDir, { recursive: true, force: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('applies per-type format overrides during decompose and round-trips on recompose', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['workflow', 'profile'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        { metadataTypes: ['workflow'], decomposedFormat: 'yaml' },
        { metadataTypes: ['profile'], decomposedFormat: 'json' },
      ],
      log: logMock,
    });

    const workflowFiles = await collectFiles(workflowsDir);
    const profileFiles = await collectFiles(profilesDir);

    // Decomposed children honor the per-type format. The original parent .xml is removed by postpurge,
    // so no decomposed leaf files should be xml here.
    expect(workflowFiles.some((f) => f.endsWith('.yaml'))).toBe(true);
    expect(workflowFiles.some((f) => f.endsWith('.xml'))).toBe(false);

    expect(profileFiles.some((f) => f.endsWith('.json'))).toBe(true);
    expect(profileFiles.some((f) => f.endsWith('.xml'))).toBe(false);

    await recomposeMetadataTypes({
      metadataTypes: ['workflow', 'profile'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });

  it('threads a custom multiLevel override through the disassembler and round-trips on recompose', async () => {
    const logMock = vi.fn();

    // Explicitly set the same spec the plugin hardcodes for loyalty. The point of this test is
    // to prove the override path is wired all the way through; if the override silently dropped,
    // round-trip would still pass (the hardcoded default would kick in), so we additionally
    // verify the resolved options surface it (covered by unit tests) and that decompose produced
    // the inner-level files we expect.
    await decomposeMetadataTypes({
      metadataTypes: ['loyaltyProgramSetup'],
      prepurge: true,
      postpurge: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          metadataTypes: ['loyaltyProgramSetup'],
          multiLevel: 'programProcesses:programProcesses:parameterName,ruleName',
        },
      ],
      log: logMock,
    });

    const loyaltyDir = join(forceAppDir, 'loyaltyProgramSetups', 'Cloud_Kicks_Inner_Circle');
    const loyaltyEntries = await readdir(loyaltyDir, { withFileTypes: true });
    // multiLevel decomposition produces a per-process subdir with parameter/rule files inside.
    const subdirs = loyaltyEntries.filter((e) => e.isDirectory()).map((e) => e.name);
    expect(subdirs).toContain('programProcesses');

    await recomposeMetadataTypes({
      metadataTypes: ['loyaltyProgramSetup'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });

  it('threads an array-form multiLevel override through the disassembler and round-trips on recompose', async () => {
    const logMock = vi.fn();

    // Same shape as the previous test, but the override is supplied as a string[] rather than
    // a single string. This pins the new multi-rule input path against a known-good fixture
    // without depending on a multi-section bot fixture in this repo. End-to-end multi-rule
    // round-trip is covered by the underlying config-disassembler@^1.1.0 integration tests.
    await decomposeMetadataTypes({
      metadataTypes: ['loyaltyProgramSetup'],
      prepurge: true,
      postpurge: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          metadataTypes: ['loyaltyProgramSetup'],
          multiLevel: ['programProcesses:programProcesses:parameterName,ruleName'],
        },
      ],
      log: logMock,
    });

    const loyaltyDir = join(forceAppDir, 'loyaltyProgramSetups', 'Cloud_Kicks_Inner_Circle');
    const subdirs = (await readdir(loyaltyDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    expect(subdirs).toContain('programProcesses');

    await recomposeMetadataTypes({
      metadataTypes: ['loyaltyProgramSetup'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });

  it('applies per-type strategy overrides during decompose', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          metadataTypes: ['permissionset'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ],
      log: logMock,
    });

    const permissionsetFiles = await collectFiles(permissionsetsDir);

    // grouped-by-tag with decomposeNestedPermissions:true splits objectPermissions into its own subdir.
    expect(permissionsetFiles.some((f) => f.includes('objectPermissions/'))).toBe(true);

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset', 'workflow'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    await compareDirectories(originalDirectory, forceAppDir);
  });
});

// Per-component overrides allow two components of the same metadata type to be decomposed with
// different strategies/formats in a single run. Reassembly is deterministic from the on-disk
// sidecar so the round-trip works regardless of how each component was split.
describe('decomposer per-component overrides', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  let permissionsetsDir: string;
  const fixtureDir: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'component-overrides-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    permissionsetsDir = join(forceAppDir, 'permissionsets');

    await cp(fixtureDir, forceAppDir, { recursive: true, force: true });
    // The base fixture only contains one "real" permission set (HR_Admin); duplicate it so
    // we have two distinct components to differentiate via component-scope overrides.
    const hrAdminPath = join(permissionsetsDir, 'HR_Admin.permissionset-meta.xml');
    const bigPermSetPath = join(permissionsetsDir, 'Big_PermSet.permissionset-meta.xml');
    await copyFile(hrAdminPath, bigPermSetPath);

    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('decomposes two components of the same type with different strategies and round-trips on recompose', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          components: ['permissionset:Big_PermSet'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ],
      log: logMock,
    });

    const hrAdminEntries = await readdir(join(permissionsetsDir, 'HR_Admin'), { withFileTypes: true });
    const hrAdminFileNames = hrAdminEntries.filter((e) => e.isFile()).map((e) => e.name);

    // HR_Admin used the default unique-id strategy. unique-id never produces top-level
    // tag-named aggregate files (those are the grouped-by-tag fingerprint).
    expect(hrAdminFileNames).not.toContain('applicationVisibilities.xml');
    expect(hrAdminFileNames).not.toContain('classAccesses.xml');
    expect(hrAdminFileNames).not.toContain('pageAccesses.xml');

    // Inside fieldPermissions/, unique-id produces ONE file per individual field
    // (named after the `field` value, e.g. `Job_Request__c.SalaryPay__c`), not a single
    // grouped-by-object file.
    const hrFieldPerms = await readdir(join(permissionsetsDir, 'HR_Admin', 'fieldPermissions'));
    expect(hrFieldPerms).toContain('Job_Request__c.SalaryPay__c.fieldPermissions-meta.xml');
    expect(hrFieldPerms).toContain('Job_Request__c.Salary__c.fieldPermissions-meta.xml');

    // Big_PermSet was overridden to grouped-by-tag, so it produces tag-named aggregate files
    // at the top level (one file per nested tag).
    const bigPermSetDir = join(permissionsetsDir, 'Big_PermSet');
    const bigEntries = await readdir(bigPermSetDir, { withFileTypes: true });
    const bigFileNames = bigEntries.filter((e) => e.isFile()).map((e) => e.name);
    expect(bigFileNames).toContain('applicationVisibilities.xml');
    expect(bigFileNames).toContain('classAccesses.xml');
    expect(bigFileNames).toContain('pageAccesses.xml');

    // With decomposeNestedPermissions=true, fieldPermissions are grouped by object (one
    // file per object aggregating all field entries) rather than one file per individual field.
    const bigFieldPerms = await readdir(join(bigPermSetDir, 'fieldPermissions'));
    expect(bigFieldPerms).toContain('Job_Request__c.fieldPermissions-meta.xml');
    expect(bigFieldPerms).not.toContain('Job_Request__c.SalaryPay__c.fieldPermissions-meta.xml');

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    // Both files should round-trip back to byte-identical XML (same source).
    const hrAdminXml = await readFile(join(permissionsetsDir, 'HR_Admin.permissionset-meta.xml'), 'utf-8');
    const bigPermSetXml = await readFile(join(permissionsetsDir, 'Big_PermSet.permissionset-meta.xml'), 'utf-8');
    expect(hrAdminXml).toBe(bigPermSetXml);
  });

  it('honors a custom splitTags spec over the hardcoded permission-set default', async () => {
    const logMock = vi.fn();

    // Custom spec: split fieldPermissions one-file-per-field instead of grouping by object,
    // and leave objectPermissions as a single tag-named aggregate file (no rule for it).
    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          metadataTypes: ['permissionset'],
          strategy: 'grouped-by-tag',
          // decomposeNestedPermissions intentionally omitted to prove the custom splitTags
          // alone is enough to drive the nested-tag layout.
          splitTags: 'fieldPermissions:split:field',
        },
      ],
      log: logMock,
    });

    const hrAdminDir = join(permissionsetsDir, 'HR_Admin');
    const fieldPermsFiles = await readdir(join(hrAdminDir, 'fieldPermissions'));
    // split mode keys files by the `field` value (one file per field), not by object.
    expect(fieldPermsFiles).toContain('Job_Request__c.SalaryPay__c.fieldPermissions-meta.xml');
    expect(fieldPermsFiles).toContain('Job_Request__c.Salary__c.fieldPermissions-meta.xml');
    // The hardcoded default would have produced this group-by-object filename; verify it does
    // NOT exist, proving the custom spec replaced the default rather than merging with it.
    expect(fieldPermsFiles).not.toContain('Job_Request__c.fieldPermissions-meta.xml');

    // No splitTags rule for objectPermissions → it stays as a single aggregate top-level file
    // (standard grouped-by-tag behavior).
    const hrAdminEntries = await readdir(hrAdminDir, { withFileTypes: true });
    const hrAdminFiles = hrAdminEntries.filter((e) => e.isFile()).map((e) => e.name);
    expect(hrAdminFiles).toContain('objectPermissions.xml');

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    const recomposedXml = await readFile(join(permissionsetsDir, 'HR_Admin.permissionset-meta.xml'), 'utf-8');
    const originalXml = await readFile(join(fixtureDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml'), 'utf-8');
    expect(recomposedXml).toBe(originalXml);
  });

  it('applies per-component format overrides on top of a per-type format override', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        // Type-scope: every permission set decomposes to YAML by default.
        { metadataTypes: ['permissionset'], decomposedFormat: 'yaml' },
        // Component-scope: HR_Admin is special and decomposes to JSON instead.
        { components: ['permissionset:HR_Admin'], decomposedFormat: 'json' },
      ],
      log: logMock,
    });

    // Filter out the `.config-disassembler.json` metadata sidecar and the `.key_order.json`
    // helper file (both are always JSON regardless of decomposed format and would confuse
    // the per-format assertions below).
    const isSidecar = (f: string): boolean => f.endsWith('.config-disassembler.json') || f.endsWith('.key_order.json');
    const hrAdminFiles = (await collectFiles(join(permissionsetsDir, 'HR_Admin'))).filter((f) => !isSidecar(f));
    const bigPermSetFiles = (await collectFiles(join(permissionsetsDir, 'Big_PermSet'))).filter((f) => !isSidecar(f));

    // HR_Admin honors the component-scope override (JSON), not the type-scope override (YAML).
    expect(hrAdminFiles.some((f) => f.endsWith('.json'))).toBe(true);
    expect(hrAdminFiles.some((f) => f.endsWith('.yaml'))).toBe(false);
    // Big_PermSet falls back to the type-scope override (YAML).
    expect(bigPermSetFiles.some((f) => f.endsWith('.yaml'))).toBe(true);
    expect(bigPermSetFiles.some((f) => f.endsWith('.json'))).toBe(false);

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    const hrAdminXml = await readFile(join(permissionsetsDir, 'HR_Admin.permissionset-meta.xml'), 'utf-8');
    const bigPermSetXml = await readFile(join(permissionsetsDir, 'Big_PermSet.permissionset-meta.xml'), 'utf-8');
    expect(hrAdminXml).toBe(bigPermSetXml);
  });
});

// End-to-end exercise of the bot recipe documented in HANDBOOK.md. Sample_Chat_Bot is a small
// placeholder bot whose v1.botVersion has 8 dialogs and a mix of Wait/Message/Navigation/SystemMessage
// step types — enough surface to prove that two multiLevel rules in one call produce the expected
// per-dialog and per-step files on disk and round-trip back byte-identical to the fixture.
describe('decomposer bot multi-rule overrides', () => {
  let tempProjectDir: string;
  let packageDir: string;
  let botRoot: string;
  const fixtureDir: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'package', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'bot-multirule-test-'));
    packageDir = join(tempProjectDir, 'package');
    botRoot = join(packageDir, 'bots', 'Sample_Chat_Bot');

    await cp(fixtureDir, packageDir, { recursive: true, force: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('decomposes Sample_Chat_Bot with a two-rule multiLevel override and round-trips byte-identical', async () => {
    const logMock = vi.fn();

    await decomposeMetadataTypes({
      metadataTypes: ['bot'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          components: ['bot:Sample_Chat_Bot'],
          multiLevel: ['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'],
        },
      ],
      log: logMock,
    });

    // Outer rule: each dialog (Welcome, Main_Menu, End_Chat, ...) gets its own subdirectory
    // under v1/botDialogs/, named by developerName. Leaf-only dialog properties live as files
    // inside that subdirectory; the inner rule is what produces the per-step files within.
    const dialogEntries = await readdir(join(botRoot, 'v1', 'botDialogs'), { withFileTypes: true });
    const dialogDirs = dialogEntries.filter((e) => e.isDirectory()).map((e) => e.name);
    expect(dialogDirs).toEqual(
      expect.arrayContaining([
        'Welcome',
        'Main_Menu',
        'End_Chat',
        'Confused',
        'Transfer_To_Agent',
        'Blah',
        'Blah_Blah',
        'Blah_Blah_Blah',
      ]),
    );

    // Inner rule: each dialog's steps are split under the dialog's botSteps/ subdir. Welcome's
    // two steps (Message + Navigation) both carry nested content so they're split into
    // structured subdirectories. Confused has a Message + Wait pair, so it produces at least
    // one leaf file (the Wait step has no inner structure).
    const welcomeStepEntries = await readdir(join(botRoot, 'v1', 'botDialogs', 'Welcome', 'botSteps'), {
      withFileTypes: true,
    });
    expect(welcomeStepEntries.length).toBeGreaterThan(1);
    const confusedStepEntries = await readdir(join(botRoot, 'v1', 'botDialogs', 'Confused', 'botSteps'), {
      withFileTypes: true,
    });
    const confusedStepFiles = confusedStepEntries
      .filter((e) => e.isFile() && e.name.endsWith('.botSteps-meta.xml'))
      .map((e) => e.name);
    expect(confusedStepFiles.length).toBeGreaterThan(0);

    // The crate writes a sidecar so reassembly knows how to merge inner levels first.
    const sidecar = await readFile(join(botRoot, 'v1', '.multi_level.json'), 'utf-8');
    const parsed = JSON.parse(sidecar) as { rules: Array<{ file_pattern: string; root_to_strip: string }> };
    expect(parsed.rules.map((r) => `${r.file_pattern}:${r.root_to_strip}`)).toEqual([
      'botDialogs:botDialogs',
      'botSteps:botSteps',
    ]);

    await recomposeMetadataTypes({
      metadataTypes: ['bot'],
      postpurge: true,
      ignoreDirs: undefined,
      log: logMock,
    });

    // The committed fixture is the canonical recomposer output (alphabetical dialog order),
    // so a round-trip must reproduce it byte-for-byte.
    await compareDirectories(fixtureDir, packageDir);
  });
});

async function collectFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const nested = await collectFiles(join(dir, entry.name));
      out.push(...nested.map((p) => `${entry.name}/${p}`));
    } else {
      out.push(entry.name);
    }
  }
  return out;
}
