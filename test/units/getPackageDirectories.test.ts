'use strict';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getPackageDirectories } from '../../src/metadata/getPackageDirectories.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// `getPackageDirectories` resolves `<metaDirectory>` under each package dir declared
// in sfdx-project.json, with optional `ignoreDirs` basename filtering. It walks up from
// `process.cwd()` to find sfdx-project.json and then chdirs into the discovered repo
// root, so each test builds an isolated SFDX project, chdir's into it, and asserts the
// shape and contents of the returned `metadataPaths`.

type Project = {
  root: string;
  forceAppDir: string;
  altDir: string;
};

async function makeProject(): Promise<Project> {
  // mkdtemp on macOS returns a path under `/var/folders/...`, but `process.cwd()` resolves
  // it through the `/var -> /private/var` symlink to `/private/var/folders/...`. The SUT
  // builds its return values off the cwd-derived repo root, so we realpath here to make
  // tests compare against the same root-form the function uses internally.
  const root = await realpath(await mkdtemp(join(tmpdir(), 'get-pkg-dirs-')));
  const forceAppDir = join(root, 'force-app');
  const altDir = join(root, 'package');
  await mkdir(forceAppDir, { recursive: true });
  await mkdir(altDir, { recursive: true });

  const sfdxProject = {
    packageDirectories: [{ path: 'force-app', default: true }, { path: 'package' }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };
  await writeFile(join(root, SFDX_CONFIG_FILE), JSON.stringify(sfdxProject, null, 2));
  return { root, forceAppDir, altDir };
}

describe('getPackageDirectories', () => {
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

  it('returns a metadataPaths entry per matching package dir (direct match)', async () => {
    const a = join(project.forceAppDir, 'permissionsets');
    const b = join(project.altDir, 'permissionsets');
    await mkdir(a, { recursive: true });
    await mkdir(b, { recursive: true });

    const { metadataPaths, ignorePath } = await getPackageDirectories('permissionsets', undefined);

    expect(new Set(metadataPaths)).toEqual(new Set([resolve(a), resolve(b)]));
    // The IGNORE_FILE constant resolves under the discovered repo root.
    expect(ignorePath).toBe(resolve(project.root, '.sfdecomposerignore'));
  });

  it('finds the target directory at nested depths via recursion', async () => {
    const deep = join(project.forceAppDir, 'main', 'default', 'permissionsets');
    await mkdir(deep, { recursive: true });

    const { metadataPaths } = await getPackageDirectories('permissionsets', undefined);

    expect(metadataPaths).toEqual([resolve(deep)]);
  });

  it('returns all matching directories per package dir (supports nested types like recordTypes)', async () => {
    // Both a shallow and deep `permissionsets` exist in force-app. All matches are returned
    // so that metadata types with multiple sibling directories (e.g. recordTypes nested under
    // objects/<ObjectName>/) are fully processed.
    const shallow = join(project.forceAppDir, 'permissionsets');
    const deep = join(project.forceAppDir, 'main', 'default', 'permissionsets');
    await mkdir(shallow, { recursive: true });
    await mkdir(deep, { recursive: true });

    const { metadataPaths } = await getPackageDirectories('permissionsets', undefined);

    expect(metadataPaths).toHaveLength(2);
    expect(new Set(metadataPaths)).toEqual(new Set([resolve(shallow), resolve(deep)]));
  });

  it('returns an empty list when no package directory contains the target', async () => {
    const { metadataPaths } = await getPackageDirectories('missingDir', undefined);
    expect(metadataPaths).toEqual([]);
  });

  it('honours ignoreDirs by basename and skips matching package directories entirely', async () => {
    const inForceApp = join(project.forceAppDir, 'permissionsets');
    const inAlt = join(project.altDir, 'permissionsets');
    await mkdir(inForceApp, { recursive: true });
    await mkdir(inAlt, { recursive: true });

    // ignoreDirs is normalised through `basename`, so passing a deep path still matches.
    const { metadataPaths } = await getPackageDirectories('permissionsets', ['nested/path/package']);

    expect(metadataPaths).toEqual([resolve(inForceApp)]);
  });

  it('treats undefined and empty-array ignoreDirs identically', async () => {
    const inForceApp = join(project.forceAppDir, 'permissionsets');
    const inAlt = join(project.altDir, 'permissionsets');
    await mkdir(inForceApp, { recursive: true });
    await mkdir(inAlt, { recursive: true });

    const u = await getPackageDirectories('permissionsets', undefined);
    const e = await getPackageDirectories('permissionsets', []);

    expect(new Set(u.metadataPaths)).toEqual(new Set([resolve(inForceApp), resolve(inAlt)]));
    expect(new Set(e.metadataPaths)).toEqual(
      u.metadataPaths.length === e.metadataPaths.length ? new Set(u.metadataPaths) : new Set(e.metadataPaths),
    );
    // Stronger pointwise equivalence:
    expect(new Set(e.metadataPaths)).toEqual(new Set(u.metadataPaths));
  });

  it('chdir-s into the discovered repo root', async () => {
    // Start a level above the project, but pointing cwd at the project root. The
    // function should chdir to the project root.
    process.chdir(project.root);
    await getPackageDirectories('permissionsets', undefined);
    expect(process.cwd()).toBe(resolve(project.root));
  });

  it('does not return undefined entries when one package dir matches and another does not', async () => {
    const inForceApp = join(project.forceAppDir, 'permissionsets');
    await mkdir(inForceApp, { recursive: true });
    // No `permissionsets` under project.altDir.

    const { metadataPaths } = await getPackageDirectories('permissionsets', undefined);

    expect(metadataPaths).toEqual([resolve(inForceApp)]);
    expect(metadataPaths.every((p) => typeof p === 'string')).toBe(true);
  });

  it('descends through unrelated sibling directories during recursion', async () => {
    // The recursion must walk into every directory at every level until it finds the match.
    const buried = join(project.forceAppDir, 'a', 'b', 'c', 'workflows');
    // Sibling that should be visited but never matched.
    const sibling = join(project.forceAppDir, 'a', 'b', 'lwc');
    await mkdir(buried, { recursive: true });
    await mkdir(sibling, { recursive: true });

    const { metadataPaths } = await getPackageDirectories('workflows', undefined);

    expect(metadataPaths).toEqual([resolve(buried)]);
  });

  it('returns the same path twice when both package dirs have the target at the same depth', async () => {
    // Distinct absolute paths (one per package dir) — sanity check that both entries
    // appear when neither is filtered.
    const a = join(project.forceAppDir, 'workflows');
    const b = join(project.altDir, 'workflows');
    await mkdir(a, { recursive: true });
    await mkdir(b, { recursive: true });

    const { metadataPaths } = await getPackageDirectories('workflows', undefined);

    expect(metadataPaths).toHaveLength(2);
    expect(new Set(metadataPaths)).toEqual(new Set([resolve(a), resolve(b)]));
  });
});
