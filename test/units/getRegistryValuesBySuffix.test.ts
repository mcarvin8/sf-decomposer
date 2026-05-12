'use strict';

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRegistryValuesBySuffix } from '../../src/metadata/getRegistryValuesBySuffix.js';
import { DEFAULT_UNIQUE_ID_ELEMENTS } from '../../src/helpers/constants.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// `getRegistryValuesBySuffix` is the gatekeeper for every decompose/recompose flow:
// it validates the suffix, looks up the registry entry, rejects unsupported adapter
// strategies, resolves the on-disk type directories, and finally builds the
// `metaAttributes` payload (including unique-id wiring for the decompose path).
//
// The existing `metadata.test.ts` exercises the error branches (botVersion, object,
// unsupported adapter) indirectly through `decomposeMetadataTypes`, but it never
// inspects the returned `metaAttributes` itself, which leaves the unique-id and
// directory-resolution branches uncovered. These direct-call tests close that gap.

type Project = {
  root: string;
  forceAppDir: string;
};

async function makeProject(): Promise<Project> {
  const root = await mkdtemp(join(tmpdir(), 'gvbs-'));
  const forceAppDir = join(root, 'force-app');
  await mkdir(forceAppDir, { recursive: true });

  const sfdxProject = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  await writeFile(join(root, SFDX_CONFIG_FILE), JSON.stringify(sfdxProject, null, 2));
  return { root, forceAppDir };
}

describe('getRegistryValuesBySuffix', () => {
  const originalCwd = process.cwd();
  let project: Project;

  beforeEach(async () => {
    project = await makeProject();
    process.chdir(project.root);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(project.root, { recursive: true, force: true });
  });

  it('rejects the unsupported `object` suffix with a stable message', async () => {
    await expect(getRegistryValuesBySuffix('object', 'decompose', undefined)).rejects.toThrow(
      'Custom Objects are not supported by this plugin.',
    );
  });

  it('rejects the `botVersion` suffix and directs the user to `bot`', async () => {
    await expect(getRegistryValuesBySuffix('botVersion', 'decompose', undefined)).rejects.toThrow(
      '`botVersion` suffix should not be used. Please use `bot` to decompose/recompose bot and bot version files.',
    );
  });

  it('rejects unknown suffixes and surfaces the offending suffix in the message', async () => {
    await expect(getRegistryValuesBySuffix('definitelyNotARealSuffix', 'decompose', undefined)).rejects.toThrow(
      'Metadata type not found for the given suffix: definitelyNotARealSuffix.',
    );
  });

  it('rejects suffixes whose registry entry uses an unsupported adapter strategy', async () => {
    // `.cls` is a matchingContentFile type, which this plugin cannot decompose.
    await expect(getRegistryValuesBySuffix('cls', 'decompose', undefined)).rejects.toThrow(
      'Metadata types with matchingContentFile strategies are not supported by this plugin.',
    );
  });

  it('throws when the type directory does not exist anywhere in the package dirs', async () => {
    await expect(getRegistryValuesBySuffix('animationRule', 'decompose', undefined)).rejects.toThrow(
      'No directories named animationRules were found in any package directory.',
    );
  });

  it('returns the unique-id elements prefixed with DEFAULT_UNIQUE_ID_ELEMENTS for the decompose command', async () => {
    // permissionsets has a registered unique-id element list; decompose should join it onto the defaults.
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('permissionset', 'decompose', undefined);

    expect(metaAttributes.metaSuffix).toBe('permissionset');
    expect(metaAttributes.uniqueIdElements.startsWith(`${DEFAULT_UNIQUE_ID_ELEMENTS},`)).toBe(true);
    // The unique-id suffix portion is non-empty (the registry seeds at least one element).
    expect(metaAttributes.uniqueIdElements.length).toBeGreaterThan(DEFAULT_UNIQUE_ID_ELEMENTS.length + 1);
  });

  it('omits the unique-id suffix segment for the recompose command (no `,` appended)', async () => {
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('permissionset', 'recompose', undefined);

    expect(metaAttributes.uniqueIdElements).toBe(DEFAULT_UNIQUE_ID_ELEMENTS);
  });

  it('falls back to DEFAULT_UNIQUE_ID_ELEMENTS verbatim when the registry has no unique-id mapping', async () => {
    // `workflow` has no entry in src/metadata/uniqueIdElements.ts → unique-id helper returns undefined.
    await mkdir(join(project.forceAppDir, 'workflows'), { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('workflow', 'decompose', undefined);

    expect(metaAttributes.uniqueIdElements).toBe(DEFAULT_UNIQUE_ID_ELEMENTS);
  });

  it('returns the resolved metadataPaths and strictDirectoryName for strict types (Bot)', async () => {
    const dir = join(project.forceAppDir, 'bots');
    await mkdir(dir, { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('bot', 'decompose', undefined);

    expect(metaAttributes.metaSuffix).toBe('bot');
    expect(metaAttributes.strictDirectoryName).toBe(true);
    expect(metaAttributes.metadataPaths).toEqual([resolve(dir)]);
  });

  it('returns strictDirectoryName=false for non-strict types (PermissionSet)', async () => {
    const dir = join(project.forceAppDir, 'permissionsets');
    await mkdir(dir, { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('permissionset', 'decompose', undefined);

    expect(metaAttributes.strictDirectoryName).toBe(false);
  });

  it('reuses the cached RegistryAccess singleton across calls', async () => {
    // The singleton caching is a private implementation detail, but two back-to-back
    // calls must produce identical registry values regardless of cache state.
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });

    const first = await getRegistryValuesBySuffix('permissionset', 'decompose', undefined);
    const second = await getRegistryValuesBySuffix('permissionset', 'decompose', undefined);

    expect(second.metaAttributes).toEqual(first.metaAttributes);
    expect(second.ignorePath).toBe(first.ignorePath);
  });

  it('threads ignoreDirs through to getPackageDirectories so filtered packages drop out', async () => {
    // Two package dirs; ignore the alt one. (Note: this test rewrites the sfdx-project.json
    // for this run only — the per-test temp project is torn down in afterEach.)
    const altDir = join(project.root, 'altpkg');
    await mkdir(altDir, { recursive: true });
    await writeFile(
      join(project.root, SFDX_CONFIG_FILE),
      JSON.stringify(
        {
          packageDirectories: [{ path: 'force-app', default: true }, { path: 'altpkg' }],
          namespace: '',
          sfdcLoginUrl: 'https://login.salesforce.com',
          sourceApiVersion: '58.0',
        },
        null,
        2,
      ),
    );
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });
    await mkdir(join(altDir, 'permissionsets'), { recursive: true });

    const { metaAttributes } = await getRegistryValuesBySuffix('permissionset', 'decompose', ['altpkg']);

    expect(metaAttributes.metadataPaths).toEqual([resolve(project.forceAppDir, 'permissionsets')]);
  });
});
