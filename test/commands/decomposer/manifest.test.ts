'use strict';

import { mkdtemp, rm, writeFile, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { cp } from 'node:fs/promises';
import { describe, it, expect, beforeAll, afterAll, vi, type Mock } from 'vitest';

import { decomposeMetadataTypes } from '../../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../../utils/constants.js';
import { compareDirectories } from '../../utils/compareDirectories.js';

const MANIFEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>HR_Admin</members>
    <name>PermissionSet</name>
  </types>
  <types>
    <members>Case</members>
    <name>Workflow</name>
  </types>
  <version>58.0</version>
</Package>
`;

const UNSCOPED_MANIFEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>NonexistentPermissionSet</members>
    <name>PermissionSet</name>
  </types>
  <types>
    <members>NonexistentBot</members>
    <name>Bot</name>
  </types>
  <types>
    <members>NonexistentQueue</members>
    <name>Queue</name>
  </types>
  <version>58.0</version>
</Package>
`;

async function dirHasEntry(dir: string, name: string): Promise<boolean> {
  try {
    const entries = await readdir(dir);
    return entries.includes(name);
  } catch {
    return false;
  }
}

describe('decomposer manifest scoping', () => {
  let logMock: Mock;
  let tempProjectDir: string;
  let forceAppDir: string;
  let packageDir: string;
  let sfdxConfigPath: string;
  let manifestPath: string;
  let unscopedManifestPath: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalDirectory2: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    logMock = vi.fn();
    tempProjectDir = await mkdtemp(join(tmpdir(), 'manifest-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    packageDir = join(tempProjectDir, 'package');
    sfdxConfigPath = join(tempProjectDir, SFDX_CONFIG_FILE);
    manifestPath = join(tempProjectDir, 'package.xml');
    unscopedManifestPath = join(tempProjectDir, 'unscoped.xml');

    await cp(originalDirectory, forceAppDir, { recursive: true, force: true });
    await cp(originalDirectory2, packageDir, { recursive: true, force: true });
    await writeFile(sfdxConfigPath, JSON.stringify(configFile, null, 2));
    await writeFile(manifestPath, MANIFEST_XML);
    await writeFile(unscopedManifestPath, UNSCOPED_MANIFEST_XML);
    process.chdir(tempProjectDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('decomposes only manifest-listed components and leaves others untouched', async () => {
    await decomposeMetadataTypes({
      metadataTypes: undefined,
      prepurge: true,
      postpurge: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      manifest: 'package.xml',
      log: logMock,
    });

    // The permission set listed in the manifest should be decomposed into a sibling directory.
    const permSetsDir = join(forceAppDir, 'permissionsets');
    expect(await dirHasEntry(permSetsDir, 'HR_Admin')).toBe(true);

    // Flows are not in the manifest; no decomposed output should exist for them.
    const flowsDir = join(packageDir, 'flows');
    const flowsEntries = await readdir(flowsDir);
    const flowsHasDecomposedDir = await Promise.all(
      flowsEntries.map(async (entry) => {
        const entryPath = join(flowsDir, entry);
        return (await stat(entryPath)).isDirectory();
      }),
    );
    expect(flowsHasDecomposedDir.some((isDir) => isDir)).toBe(false);
  });

  it('recomposes only manifest-listed components back to their original form', async () => {
    await recomposeMetadataTypes({
      metadataTypes: undefined,
      postpurge: false,
      ignoreDirs: undefined,
      manifest: 'package.xml',
      log: logMock,
    });

    const output = logMock.mock.calls.flat().join('\n');
    expect(output).toContain('All metadata files have been recomposed for the metadata type: permissionset');
    expect(output).toContain('All metadata files have been recomposed for the metadata type: workflow');

    // Recomposed permission set and workflow files should match the original fixtures.
    const originalPermSet = resolve(originalDirectory, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const recomposedPermSet = join(forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const [orig, recomposed] = await Promise.all([
      import('node:fs/promises').then((fs) => fs.readFile(originalPermSet, 'utf-8')),
      import('node:fs/promises').then((fs) => fs.readFile(recomposedPermSet, 'utf-8')),
    ]);
    expect(recomposed).toEqual(orig);

    // Untouched types (labels, bots, flows, etc.) should not appear in the processed log.
    expect(output).not.toContain('All metadata files have been recomposed for the metadata type: labels');
    expect(output).not.toContain('All metadata files have been recomposed for the metadata type: flow');
  });

  it('skips types when manifest yields no resolvable source components', async () => {
    const localLog = vi.fn();
    const result = await recomposeMetadataTypes({
      metadataTypes: undefined,
      postpurge: false,
      ignoreDirs: undefined,
      manifest: 'unscoped.xml',
      log: localLog,
    });

    expect(result.metadata).toEqual([]);
    const output = localLog.mock.calls.flat().join('\n');
    expect(output).toContain('No metadata types to recompose');
  });

  it('returns empty when --metadata-type has no overlap with manifest', async () => {
    const localLog = vi.fn();
    const result = await decomposeMetadataTypes({
      metadataTypes: ['flow'],
      prepurge: false,
      postpurge: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      manifest: 'package.xml',
      log: localLog,
    });
    expect(result.metadata).toEqual([]);
    const output = localLog.mock.calls.flat().join('\n');
    expect(output).toContain('No metadata types to decompose');
  });

  it('intersects --metadata-type with manifest when both provided', async () => {
    // Set up a fresh copy to avoid state from prior decompose/recompose
    const freshDir = await mkdtemp(join(tmpdir(), 'manifest-intersect-'));
    const freshForceApp = join(freshDir, 'force-app');
    const freshPackage = join(freshDir, 'package');
    await cp(originalDirectory, freshForceApp, { recursive: true, force: true });
    await cp(originalDirectory2, freshPackage, { recursive: true, force: true });
    await writeFile(join(freshDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
    await writeFile(join(freshDir, 'package.xml'), MANIFEST_XML);
    process.chdir(freshDir);

    const localLog = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: ['permissionset'],
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log: localLog,
      });

      const output = localLog.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been decomposed for the metadata type: permissionset');
      // workflow is in manifest but not in metadataTypes, so it should not be processed
      expect(output).not.toContain('All metadata files have been decomposed for the metadata type: workflow');
    } finally {
      process.chdir(tempProjectDir);
      await rm(freshDir, { recursive: true, force: true });
    }
  });

  it('matches the original fixtures after full decompose + recompose round-trip via manifest', async () => {
    // Sanity: force-app permsets and workflows should match fixtures after the earlier
    // decompose + recompose cycle from the previous tests.
    await compareDirectories(resolve(originalDirectory, 'permissionsets'), join(forceAppDir, 'permissionsets'));
    await compareDirectories(resolve(originalDirectory, 'workflows'), join(forceAppDir, 'workflows'));
  });
});

const LABEL_BOT_MANIFEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>DeleteMe</members>
    <members>ValueExpressionInCollectionFilter</members>
    <name>CustomLabel</name>
  </types>
  <types>
    <members>Assessment_Bot</members>
    <name>Bot</name>
  </types>
  <version>58.0</version>
</Package>
`;

const WILDCARD_MANIFEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>*</members>
    <name>PermissionSet</name>
  </types>
  <version>58.0</version>
</Package>
`;

const UNSUPPORTED_TYPE_MANIFEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>TestClass</members>
    <name>ApexClass</name>
  </types>
  <types>
    <members>HR_Admin</members>
    <name>PermissionSet</name>
  </types>
  <version>58.0</version>
</Package>
`;

describe('decomposer manifest scoping - labels, bot, wildcard, errors', () => {
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalDirectory2: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();
  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  async function setupTempProject(manifestBody: string, manifestName = 'package.xml'): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'manifest-case-'));
    await cp(originalDirectory, join(dir, 'force-app'), { recursive: true, force: true });
    await cp(originalDirectory2, join(dir, 'package'), { recursive: true, force: true });
    await writeFile(join(dir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
    await writeFile(join(dir, manifestName), manifestBody);
    process.chdir(dir);
    return dir;
  }

  afterAll(() => {
    process.chdir(originalCwd);
  });

  it('decomposes and recomposes labels + bot via manifest (strict-directory path)', async () => {
    const dir = await setupTempProject(LABEL_BOT_MANIFEST_XML);
    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      // Labels should have been decomposed to per-label files in the labels directory.
      const labelsDir = join(dir, 'force-app', 'labels');
      const labelEntries = await readdir(labelsDir);
      expect(labelEntries.some((entry) => entry.endsWith('.label-meta.xml'))).toBe(true);

      // Bot should have been decomposed under its strict parent directory.
      const botDir = join(dir, 'package', 'bots', 'Assessment_Bot');
      const botEntries = await readdir(botDir);
      expect(botEntries.some((entry) => entry === 'Assessment_Bot' || entry === 'v1')).toBe(true);

      await recomposeMetadataTypes({
        metadataTypes: undefined,
        postpurge: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      const output = log.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been recomposed for the metadata type: labels');
      expect(output).toContain('All metadata files have been recomposed for the metadata type: bot');

      await compareDirectories(resolve(originalDirectory, 'labels'), join(dir, 'force-app', 'labels'));
      await compareDirectories(resolve(originalDirectory2, 'bots'), join(dir, 'package', 'bots'));
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('expands wildcard manifest members against the local source', async () => {
    const dir = await setupTempProject(WILDCARD_MANIFEST_XML);
    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: ['some-other-dir'],
        manifest: 'package.xml',
        log,
      });

      // Every permission set in the repo should have been decomposed.
      const permSetsDir = join(dir, 'force-app', 'permissionsets');
      const entries = await readdir(permSetsDir, { withFileTypes: true });
      const decomposedDirs = entries.filter((entry) => entry.isDirectory());
      expect(decomposedDirs.length).toBeGreaterThan(0);

      await recomposeMetadataTypes({
        metadataTypes: undefined,
        postpurge: true,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      await compareDirectories(resolve(originalDirectory, 'permissionsets'), join(dir, 'force-app', 'permissionsets'));
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('skips unsupported manifest types and processes the supported ones', async () => {
    const dir = await setupTempProject(UNSUPPORTED_TYPE_MANIFEST_XML);
    const classesDir = join(dir, 'force-app', 'classes');
    const { mkdir } = await import('node:fs/promises');
    await mkdir(classesDir, { recursive: true });
    await writeFile(join(classesDir, 'TestClass.cls'), 'public class TestClass {}');
    await writeFile(
      join(classesDir, 'TestClass.cls-meta.xml'),
      '<?xml version="1.0" encoding="UTF-8"?><ApexClass xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>58.0</apiVersion></ApexClass>',
    );

    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      const output = log.mock.calls.flat().join('\n');
      expect(output).toMatch(/Skipping cls:.*not supported/);
      expect(output).toContain('All metadata files have been decomposed for the metadata type: permissionset');
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('expands wildcard Bot manifest members against strict subdirectories', async () => {
    const wildcardBot = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>*</members>
    <name>Bot</name>
  </types>
  <version>58.0</version>
</Package>
`;
    const dir = await setupTempProject(wildcardBot);
    // Add a rogue subdirectory with no bot xml so parseManifest skips it during
    // wildcard expansion.
    const { mkdir } = await import('node:fs/promises');
    await mkdir(join(dir, 'package', 'bots', 'Empty_Bot'), { recursive: true });

    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });
      const output = log.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been decomposed for the metadata type: bot');
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('recomposes labels via manifest without prepurge and intersects with metadata-type', async () => {
    const dir = await setupTempProject(LABEL_BOT_MANIFEST_XML);
    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: false,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      // Pass both manifest AND metadataTypes to recompose, restricted to labels.
      await recomposeMetadataTypes({
        metadataTypes: ['labels'],
        postpurge: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      const output = log.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been recomposed for the metadata type: labels');
      // bot is in the manifest but excluded by the metadata-type intersection
      expect(output).not.toContain('All metadata files have been recomposed for the metadata type: bot');
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('skips unsupported manifest types during recompose', async () => {
    const dir = await setupTempProject(UNSUPPORTED_TYPE_MANIFEST_XML);
    const classesDir = join(dir, 'force-app', 'classes');
    const { mkdir } = await import('node:fs/promises');
    await mkdir(classesDir, { recursive: true });
    await writeFile(join(classesDir, 'TestClass.cls'), 'public class TestClass {}');
    await writeFile(
      join(classesDir, 'TestClass.cls-meta.xml'),
      '<?xml version="1.0" encoding="UTF-8"?><ApexClass xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>58.0</apiVersion></ApexClass>',
    );

    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: ['permissionset'],
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      await recomposeMetadataTypes({
        metadataTypes: undefined,
        postpurge: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      const output = log.mock.calls.flat().join('\n');
      expect(output).toMatch(/Skipping cls:.*not supported/);
      expect(output).toContain('All metadata files have been recomposed for the metadata type: permissionset');
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('resolves folder-typed members via the folderType branch', async () => {
    // Specific folder-typed members (e.g. Report MyFolder/Sample) come back from
    // ManifestResolver as the parent type with folderType set; verify resolveMemberXml
    // walks the folder-relative path correctly.
    const folderManifest = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>MyFolder/Sample</members>
    <members>MissingFolder/Missing</members>
    <name>Report</name>
  </types>
  <version>58.0</version>
</Package>
`;
    const dir = await setupTempProject(folderManifest);
    const { mkdir } = await import('node:fs/promises');
    const reportsDir = join(dir, 'force-app', 'reports', 'MyFolder');
    await mkdir(reportsDir, { recursive: true });
    await writeFile(
      join(reportsDir, 'Sample.report-meta.xml'),
      '<?xml version="1.0" encoding="UTF-8"?><Report xmlns="http://soap.sforce.com/2006/04/metadata"><name>Sample</name></Report>',
    );

    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: false,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });
      const output = log.mock.calls.flat().join('\n');
      expect(output).toContain('All metadata files have been decomposed for the metadata type: report');
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('resolves BotVersion manifest type to Bot via SDR parent-type lookup', async () => {
    const botVersionManifest = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>Assessment_Bot</members>
    <name>BotVersion</name>
  </types>
  <version>58.0</version>
</Package>
`;
    const dir = await setupTempProject(botVersionManifest);
    const log = vi.fn();
    try {
      await decomposeMetadataTypes({
        metadataTypes: undefined,
        prepurge: true,
        postpurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        ignoreDirs: undefined,
        manifest: 'package.xml',
        log,
      });

      const output = log.mock.calls.flat().join('\n');
      // SDR resolves BotVersion → Bot parent; the bot suffix is processed, not botVersion.
      expect(output).toContain('All metadata files have been decomposed for the metadata type: bot');
      expect(output).not.toContain('botVersion');

      const botDir = join(dir, 'package', 'bots', 'Assessment_Bot');
      const botEntries = await readdir(botDir);
      expect(botEntries.some((entry) => entry === 'Assessment_Bot' || entry === 'v1')).toBe(true);
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('throws when neither manifest nor metadata-type is provided', async () => {
    const dir = await setupTempProject(WILDCARD_MANIFEST_XML);
    const log = vi.fn();
    try {
      await expect(
        decomposeMetadataTypes({
          metadataTypes: undefined,
          prepurge: false,
          postpurge: false,
          format: 'xml',
          strategy: 'unique-id',
          decomposeNestedPerms: false,
          ignoreDirs: undefined,
          log,
        }),
      ).rejects.toThrow(/Either --metadata-type or --manifest/);

      await expect(
        recomposeMetadataTypes({
          metadataTypes: undefined,
          postpurge: false,
          ignoreDirs: undefined,
          log,
        }),
      ).rejects.toThrow(/Either --metadata-type or --manifest/);
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true, force: true });
    }
  });
});
