'use strict';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildPackageDirectoryIndex, getPackageDirectories } from '../../src/metadata/getPackageDirectories.js';
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

  it('uses repoRootOverride instead of discovering the repo root from cwd', async () => {
    // Start outside the project entirely so cwd-based discovery could never find it, then
    // confirm passing repoRootOverride still resolves against the right sfdx-project.json.
    process.chdir(originalCwd);
    const a = join(project.forceAppDir, 'permissionsets');
    await mkdir(a, { recursive: true });

    const { metadataPaths, ignorePath } = await getPackageDirectories('permissionsets', undefined, project.root);

    expect(metadataPaths).toEqual([resolve(a)]);
    expect(ignorePath).toBe(resolve(project.root, '.sfdecomposerignore'));
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

  it('ignores a plain file that happens to share the target directory name', async () => {
    // Kills the mutant that drops the `file.isDirectory()` filter before matching by name:
    // without it, a file named "permissionsets" would be treated as a directory match.
    await writeFile(join(project.forceAppDir, 'permissionsets'), 'not a directory');

    const { metadataPaths } = await getPackageDirectories('permissionsets', undefined);

    expect(metadataPaths).toEqual([]);
  });

  it('does not recurse into an already-matched directory, so a same-named directory nested inside it is not double-counted', async () => {
    // Kills the mutants that drop or neuter the `file.name !== subDirectoryName` exclusion
    // before recursing deeper. Without it, the outer match's own contents get searched too,
    // and the nested "permissionsets" inside it would be counted as a second match.
    const outer = join(project.forceAppDir, 'permissionsets');
    const nested = join(outer, 'permissionsets');
    await mkdir(nested, { recursive: true });

    const { metadataPaths } = await getPackageDirectories('permissionsets', undefined);

    expect(metadataPaths).toEqual([resolve(outer)]);
  });
});

// `buildPackageDirectoryIndex` answers the same "find directories named X" query as
// `getPackageDirectories`, but for every requested name in one shared walk instead of one walk
// per name. It must reproduce each name's independent result exactly, including the
// nested-same-name exclusion above, while still finding a *different* name's directory nested
// inside a directory that already matched some other name (since two independent
// `getPackageDirectories` calls, run separately per type today, would each find their own match
// regardless of what the other call matched).
describe('buildPackageDirectoryIndex', () => {
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

  it('resolves matches for multiple directory names in a single call', async () => {
    const permsDir = join(project.forceAppDir, 'permissionsets');
    const workflowsDir = join(project.altDir, 'workflows');
    await mkdir(permsDir, { recursive: true });
    await mkdir(workflowsDir, { recursive: true });

    const { index } = await buildPackageDirectoryIndex(['permissionsets', 'workflows'], undefined);

    expect(index.get('permissionsets')).toEqual([resolve(permsDir)]);
    expect(index.get('workflows')).toEqual([resolve(workflowsDir)]);
  });

  it('returns an empty array for a requested name with no match anywhere', async () => {
    const { index } = await buildPackageDirectoryIndex(['missingDir'], undefined);

    expect(index.get('missingDir')).toEqual([]);
  });

  it('finds nested-depth matches, matching getPackageDirectories', async () => {
    const deep = join(project.forceAppDir, 'main', 'default', 'permissionsets');
    await mkdir(deep, { recursive: true });

    const { index } = await buildPackageDirectoryIndex(['permissionsets'], undefined);

    expect(index.get('permissionsets')).toEqual([resolve(deep)]);
  });

  it('honours ignoreDirs across every requested name', async () => {
    const inForceApp = join(project.forceAppDir, 'permissionsets');
    const inAlt = join(project.altDir, 'permissionsets');
    await mkdir(inForceApp, { recursive: true });
    await mkdir(inAlt, { recursive: true });

    const { index } = await buildPackageDirectoryIndex(['permissionsets'], ['package']);

    expect(index.get('permissionsets')).toEqual([resolve(inForceApp)]);
  });

  it('does not double-count a same-named directory nested inside its own match', async () => {
    const outer = join(project.forceAppDir, 'permissionsets');
    const nested = join(outer, 'permissionsets');
    await mkdir(nested, { recursive: true });

    const { index } = await buildPackageDirectoryIndex(['permissionsets'], undefined);

    expect(index.get('permissionsets')).toEqual([resolve(outer)]);
  });

  it('still finds a different requested name nested inside a directory that already matched another name', async () => {
    // "permissionsets" matches first; "workflows" nested inside it must still be found, since
    // independent single-target searches (today's per-type calls) would each find their own name
    // with no knowledge of the other.
    const outer = join(project.forceAppDir, 'permissionsets');
    const inner = join(outer, 'workflows');
    await mkdir(inner, { recursive: true });

    const { index } = await buildPackageDirectoryIndex(['permissionsets', 'workflows'], undefined);

    expect(index.get('permissionsets')).toEqual([resolve(outer)]);
    expect(index.get('workflows')).toEqual([resolve(inner)]);
  });

  it('returns the same ignorePath as getPackageDirectories', async () => {
    const { ignorePath } = await buildPackageDirectoryIndex(['permissionsets'], undefined);

    expect(ignorePath).toBe(resolve(project.root, '.sfdecomposerignore'));
  });
});
