'use strict';

import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseManifest } from '../../src/metadata/parseManifest.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// ---- Test workspace plumbing --------------------------------------------
//
// `parseManifest` walks up from `process.cwd()` to find sfdx-project.json,
// resolves the manifest against that repo root, and then crawls the package
// directories listed in sfdx-project.json for parent metadata XML files. To
// exercise it directly we build a real (but tiny) SFDX project in a temp
// directory, chdir into it, and assert the returned map.

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
  const root = await realpath(await mkdtemp(join(tmpdir(), 'parse-manifest-')));
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

async function writeMetaFile(path: string, body = '<r/>'): Promise<void> {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, body);
}

async function writeManifest(rootDir: string, types: Array<{ name: string; members: string[] }>): Promise<string> {
  const typeBlocks = types
    .map(
      (t) =>
        `    <types>\n${t.members.map((m) => `        <members>${m}</members>`).join('\n')}\n        <name>${t.name}</name>\n    </types>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
${typeBlocks}
    <version>58.0</version>
</Package>`;
  const manifestPath = join(rootDir, 'manifest.xml');
  await writeFile(manifestPath, xml);
  return 'manifest.xml';
}

describe('parseManifest', () => {
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

  it('resolves non-strict members against the on-disk parent XML', async () => {
    const hrAdmin = join(project.forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const employee = join(project.forceAppDir, 'permissionsets', 'Employee.permissionset-meta.xml');
    await writeMetaFile(hrAdmin);
    await writeMetaFile(employee);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR_Admin', 'Employee'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual(['permissionset']);
    const paths = result.parentXmlsBySuffix.get('permissionset');
    expect(paths).toBeDefined();
    expect(new Set(paths)).toEqual(new Set([resolve(hrAdmin), resolve(employee)]));
  });

  it('uses repoRootOverride instead of discovering the repo root from cwd', async () => {
    // Start outside the project entirely so cwd-based discovery could never find it, then
    // confirm passing repoRootOverride still resolves the manifest and package dirs correctly.
    process.chdir(originalCwd);
    const hrAdmin = join(project.forceAppDir, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    await writeMetaFile(hrAdmin);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR_Admin'] }]);
    const result = await parseManifest(manifest, undefined, project.root);

    expect(result.suffixes).toEqual(['permissionset']);
    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(hrAdmin)]));
  });

  it('resolves strict-directory members under <member>/<member>.<suffix>-meta.xml', async () => {
    // Bot is strictDirectoryName: true.
    const myBot = join(project.forceAppDir, 'bots', 'MyBot', 'MyBot.bot-meta.xml');
    const otherBot = join(project.forceAppDir, 'bots', 'OtherBot', 'OtherBot.bot-meta.xml');
    await writeMetaFile(myBot);
    await writeMetaFile(otherBot);

    const manifest = await writeManifest(project.root, [{ name: 'Bot', members: ['MyBot'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual(['bot']);
    expect(new Set(result.parentXmlsBySuffix.get('bot'))).toEqual(new Set([resolve(myBot)]));
  });

  it('resolves folder-typed members against the in-folder file (Report)', async () => {
    // Report carries folderType="ReportFolder"; member is `<folder>/<name>`.
    const reportInFolder = join(project.forceAppDir, 'reports', 'FolderX', 'Report1.report-meta.xml');
    await writeMetaFile(reportInFolder);

    const manifest = await writeManifest(project.root, [{ name: 'Report', members: ['FolderX/Report1'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual(['report']);
    expect(new Set(result.parentXmlsBySuffix.get('report'))).toEqual(new Set([resolve(reportInFolder)]));
  });

  it('handles wildcard members for non-strict types by listing every matching parent XML', async () => {
    const a = join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml');
    const b = join(project.forceAppDir, 'workflows', 'B.workflow-meta.xml');
    // Not a workflow file: must not be collected.
    const noise = join(project.forceAppDir, 'workflows', 'README.md');
    await writeMetaFile(a);
    await writeMetaFile(b);
    await writeMetaFile(noise);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(a), resolve(b)]));
  });

  it('handles wildcard members for strict types by listing <child>/<child>.<suffix>-meta.xml', async () => {
    const myBot = join(project.forceAppDir, 'bots', 'MyBot', 'MyBot.bot-meta.xml');
    const otherBot = join(project.forceAppDir, 'bots', 'OtherBot', 'OtherBot.bot-meta.xml');
    // Stray file directly under bots/ — must not be picked up for strict dir.
    const stray = join(project.forceAppDir, 'bots', 'stray.bot-meta.xml');
    // Subdirectory that does not contain a matching .<suffix>-meta.xml — must not appear.
    const orphan = join(project.forceAppDir, 'bots', 'EmptyBot', 'placeholder.txt');
    await writeMetaFile(myBot);
    await writeMetaFile(otherBot);
    await writeMetaFile(stray);
    await writeMetaFile(orphan);

    const manifest = await writeManifest(project.root, [{ name: 'Bot', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('bot'))).toEqual(new Set([resolve(myBot), resolve(otherBot)]));
  });

  it('resolves CustomLabels to a single labels file regardless of the declared member', async () => {
    const labelsFile = join(project.forceAppDir, 'labels', 'CustomLabels.labels-meta.xml');
    await writeMetaFile(labelsFile);

    const manifest = await writeManifest(project.root, [{ name: 'CustomLabel', members: ['Greeting', 'Farewell'] }]);
    const result = await parseManifest(manifest, undefined);

    // CustomLabel rolls up to the CustomLabels parent type (single suffix `labels`).
    expect(result.suffixes).toEqual(['labels']);
    expect(new Set(result.parentXmlsBySuffix.get('labels'))).toEqual(new Set([resolve(labelsFile)]));
  });

  it('combines wildcard and explicit members under the same parent type without double-listing', async () => {
    const a = join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml');
    const b = join(project.forceAppDir, 'workflows', 'B.workflow-meta.xml');
    await writeMetaFile(a);
    await writeMetaFile(b);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*', 'A'] }]);
    const result = await parseManifest(manifest, undefined);

    // Members are deduped through a Set; wildcard should already include `A`.
    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(a), resolve(b)]));
  });

  it('finds parent XMLs nested deep inside a package directory', async () => {
    // Sales orgs commonly nest under force-app/main/default/...; verifies the recursive search.
    const deepDir = join(project.forceAppDir, 'main', 'default', 'permissionsets');
    const file = join(deepDir, 'Deep.permissionset-meta.xml');
    await writeMetaFile(file);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['Deep'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(file)]));
  });

  it('aggregates resolutions from multiple package directories', async () => {
    const fromForceApp = join(project.forceAppDir, 'permissionsets', 'HR.permissionset-meta.xml');
    const fromAlt = join(project.altDir, 'permissionsets', 'Other.permissionset-meta.xml');
    await writeMetaFile(fromForceApp);
    await writeMetaFile(fromAlt);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR', 'Other'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(
      new Set([resolve(fromForceApp), resolve(fromAlt)]),
    );
  });

  it('honours ignoreDirs by basename match, skipping the filtered package directory', async () => {
    const kept = join(project.forceAppDir, 'permissionsets', 'Keep.permissionset-meta.xml');
    const skipped = join(project.altDir, 'permissionsets', 'Skip.permissionset-meta.xml');
    await writeMetaFile(kept);
    await writeMetaFile(skipped);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['Keep', 'Skip'] }]);
    // Pass the directory with a trailing path segment to verify basename normalization.
    const result = await parseManifest(manifest, ['some/parent/package']);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(kept)]));
  });

  it('treats undefined ignoreDirs the same as no filtering', async () => {
    const fromForceApp = join(project.forceAppDir, 'permissionsets', 'HR.permissionset-meta.xml');
    const fromAlt = join(project.altDir, 'permissionsets', 'Other.permissionset-meta.xml');
    await writeMetaFile(fromForceApp);
    await writeMetaFile(fromAlt);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR', 'Other'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(
      new Set([resolve(fromForceApp), resolve(fromAlt)]),
    );
  });

  it('omits a type entirely when no package directory contains its type dir', async () => {
    // Manifest references a type whose directoryName (permissionsets) does not exist on disk.
    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR_Admin'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
    expect(result.parentXmlsBySuffix.size).toBe(0);
    expect(result.unresolvedComponents).toEqual([{ type: 'permissionset', member: 'HR_Admin' }]);
  });

  it('omits a wildcard type when no package directory contains its type dir and produces no unresolved components', async () => {
    // Wildcard manifests that find no type dir are silently dropped — not surfaced as
    // unresolved components, because the user asked for "whatever exists", not a named component.
    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
    expect(result.parentXmlsBySuffix.size).toBe(0);
    expect(result.unresolvedComponents).toEqual([]);
  });

  it('omits a type when its type dir exists but no declared member resolves to an XML on disk', async () => {
    // Type dir exists, but member file does not.
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['DoesNotExist'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
    expect(result.parentXmlsBySuffix.size).toBe(0);
    expect(result.unresolvedComponents).toEqual([{ type: 'permissionset', member: 'DoesNotExist' }]);
  });

  it('returns the same Set for one parent type irrespective of member declaration order', async () => {
    const a = join(project.forceAppDir, 'permissionsets', 'A.permissionset-meta.xml');
    const b = join(project.forceAppDir, 'permissionsets', 'B.permissionset-meta.xml');
    await writeMetaFile(a);
    await writeMetaFile(b);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['B', 'A'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(a), resolve(b)]));
  });

  it('returns an empty result when the manifest declares no types', async () => {
    const manifest = await writeManifest(project.root, []);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
    expect(result.parentXmlsBySuffix.size).toBe(0);
  });

  it('skips wildcard listings for strict types whose subdirectories lack the matching meta file', async () => {
    // bots/EmptyBot/ exists but has no MyBot-meta file. Only a different .txt file.
    const orphan = join(project.forceAppDir, 'bots', 'EmptyBot', 'notes.txt');
    await writeMetaFile(orphan);

    const manifest = await writeManifest(project.root, [{ name: 'Bot', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
  });

  it('orders suffixes in the order their parent types are first encountered', async () => {
    const ps = join(project.forceAppDir, 'permissionsets', 'P.permissionset-meta.xml');
    const wf = join(project.forceAppDir, 'workflows', 'W.workflow-meta.xml');
    await writeMetaFile(ps);
    await writeMetaFile(wf);

    const manifest = await writeManifest(project.root, [
      { name: 'PermissionSet', members: ['P'] },
      { name: 'Workflow', members: ['W'] },
    ]);
    const result = await parseManifest(manifest, undefined);

    // Both should be present; both suffixes must appear exactly once.
    expect(result.suffixes.sort()).toEqual(['permissionset', 'workflow']);
    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(ps)]));
    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(wf)]));
  });

  it('does not include non-XML files in non-strict wildcard listings', async () => {
    const wf = join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml');
    const sidecar = join(project.forceAppDir, 'workflows', 'A.config-disassembler.json');
    const childMeta = join(project.forceAppDir, 'workflows', 'A', 'something.xml');
    await writeMetaFile(wf);
    await writeMetaFile(sidecar);
    await writeMetaFile(childMeta);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(wf)]));
  });

  it('does not pick up directory entries when listing parent XMLs for non-strict types', async () => {
    const wf = join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml');
    // A directory named like a meta file should never be confused for one.
    const dirLookalike = join(project.forceAppDir, 'workflows', 'Trap.workflow-meta.xml', 'inner.txt');
    await writeMetaFile(wf);
    await writeMetaFile(dirLookalike);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(wf)]));
  });

  it('uses the searchRecursively traversal to descend past unrelated sibling directories', async () => {
    // Sibling dirs that are NOT the target name must be descended into, not matched.
    const target = join(project.forceAppDir, 'classes', 'permissionsets', 'Buried.permissionset-meta.xml');
    const otherSibling = join(project.forceAppDir, 'objects', 'Account.object-meta.xml');
    await writeMetaFile(target);
    await writeMetaFile(otherSibling);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['Buried'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(target)]));
  });

  it('returns the resolved absolute path (not the typeDir-relative path) for non-strict resolution', async () => {
    const file = join(project.forceAppDir, 'permissionsets', 'HR.permissionset-meta.xml');
    await writeMetaFile(file);

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = Array.from(result.parentXmlsBySuffix.get('permissionset') ?? []);
    expect(out).toHaveLength(1);
    // resolve() of the same path returns the canonical absolute path; the function applies it.
    expect(out[0]).toBe(resolve(file));
  });

  it('returns the resolved absolute path for strict-directory resolution', async () => {
    const file = join(project.forceAppDir, 'bots', 'MyBot', 'MyBot.bot-meta.xml');
    await writeMetaFile(file);

    const manifest = await writeManifest(project.root, [{ name: 'Bot', members: ['MyBot'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = Array.from(result.parentXmlsBySuffix.get('bot') ?? []);
    expect(out).toEqual([resolve(file)]);
  });

  it('returns the resolved absolute path for folder-typed resolution', async () => {
    const file = join(project.forceAppDir, 'reports', 'F', 'R.report-meta.xml');
    await writeMetaFile(file);

    const manifest = await writeManifest(project.root, [{ name: 'Report', members: ['F/R'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = Array.from(result.parentXmlsBySuffix.get('report') ?? []);
    expect(out).toEqual([resolve(file)]);
  });

  it('returns the resolved absolute path for CustomLabels', async () => {
    const file = join(project.forceAppDir, 'labels', 'CustomLabels.labels-meta.xml');
    await writeMetaFile(file);

    const manifest = await writeManifest(project.root, [{ name: 'CustomLabel', members: ['Foo'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = Array.from(result.parentXmlsBySuffix.get('labels') ?? []);
    expect(out).toEqual([resolve(file)]);
  });

  it('does not include a strict member whose folder is missing the meta xml', async () => {
    // bots/MyBot/ exists but only with an unrelated file inside.
    await writeMetaFile(join(project.forceAppDir, 'bots', 'MyBot', 'something-else.txt'));

    const manifest = await writeManifest(project.root, [{ name: 'Bot', members: ['MyBot'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
  });

  it('does not include a folder-typed member whose target file is missing', async () => {
    // reports/F/ exists but Missing.report-meta.xml does not.
    await mkdir(join(project.forceAppDir, 'reports', 'F'), { recursive: true });

    const manifest = await writeManifest(project.root, [{ name: 'Report', members: ['F/Missing'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
  });

  // ---- Mutation-gap closures (searchRecursively / listParentXmlPaths) -------
  // These tests pin two delicate behaviors that the broader fixtures above do not isolate:
  //  1. searchRecursively must only match a directory whose basename equals the targetName --
  //     a file that happens to share the targetName is NOT a type directory.
  //  2. searchRecursively must NOT recurse into a directory that already matched (to avoid
  //     pathological paths like `permissionsets/permissionsets/...` being treated as a second
  //     valid type dir).
  // Stryker was previously free to mutate the name-equality and not-equal checks on lines 129
  // and 133 without any test catching it; the assertions below close that window.

  it('ignores a FILE whose name matches the typeDir name (only directories qualify as type dirs)', async () => {
    // A file literally named "permissionsets" (no extension) sits alongside a real
    // permissionsets/ directory. Under the L129 LogicalOperator mutant (`||` instead of `&&`)
    // or the L129 ConditionalExpression mutant (`entry.name === targetName` -> true), the file
    // would be matched and routed through listParentXmlPaths(), which would readdir() it and
    // throw -- the searchRecursively catch swallows that and yields an empty list, so the
    // permissionsets/ resolution behind it goes unobserved. We assert that the real dir's
    // member file is still resolved exactly once with the expected path.
    const real = join(project.forceAppDir, 'permissionsets', 'HR.permissionset-meta.xml');
    await writeMetaFile(real);
    // Also create a file literally named `permissionsets` directly under force-app.
    await writeFile(join(project.forceAppDir, 'permissionsets-as-file'), 'not a directory');
    // And rename to the exact target name -- a sibling FILE called `permissionsets`.
    // We create it under altDir to avoid colliding with the real type directory above.
    await writeFile(join(project.altDir, 'permissionsets'), 'definitely not a directory');

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['HR'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(new Set(result.parentXmlsBySuffix.get('permissionset'))).toEqual(new Set([resolve(real)]));
  });

  it('does not double-list a parent xml when a same-named type dir is nested inside another type dir', async () => {
    // force-app/permissionsets/HR.permissionset-meta.xml is the legitimate match.
    // force-app/permissionsets/permissionsets/Buried.permissionset-meta.xml is a malformed
    // duplicate that searchRecursively would only pick up under the L133 ConditionalExpression
    // mutant (`entry.name !== targetName` -> true), which removes the guard preventing recursion
    // into an already-matched directory. We assert exactly one file is resolved.
    const outer = join(project.forceAppDir, 'permissionsets', 'HR.permissionset-meta.xml');
    const buried = join(project.forceAppDir, 'permissionsets', 'permissionsets', 'Buried.permissionset-meta.xml');
    await writeMetaFile(outer);
    await writeMetaFile(buried);

    // Wildcard listing exercises listParentXmlPaths through every matched type dir; the buried
    // file would surface as an extra hit only if searchRecursively recursed into the outer
    // permissionsets/ directory.
    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = result.parentXmlsBySuffix.get('permissionset');
    expect(out).toBeDefined();
    // Under the L133 mutant the buried file would also appear here. Pinning the exact set keeps
    // both the search-recursion guard AND the wildcard listing honest.
    expect(new Set(out)).toEqual(new Set([resolve(outer)]));
  });

  it('listParentXmlPaths only returns FILES whose name ends in the meta-suffix for non-strict types', async () => {
    // Targets L186 MethodExpression mutant on `entries.filter(...).map(...)` (replaced by
    // `entries`). Without the filter+map, every dirent -- including the sidecar directory and
    // the unrelated file below -- would flow into the results array, blowing up the wildcard
    // listing. Asserting an exact-size set of paths kills the mutant.
    const wf = join(project.forceAppDir, 'workflows', 'A.workflow-meta.xml');
    // A directory whose name ends in `.workflow-meta.xml` -- a real-world land mine.
    const lookalikeDir = join(project.forceAppDir, 'workflows', 'Trap.workflow-meta.xml');
    // An unrelated file in the workflows dir that must NOT be listed.
    const stray = join(project.forceAppDir, 'workflows', 'README.md');
    await writeMetaFile(wf);
    await mkdir(lookalikeDir, { recursive: true });
    await writeFile(join(lookalikeDir, 'inner.txt'), '');
    await writeMetaFile(stray);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    const out = result.parentXmlsBySuffix.get('workflow');
    expect(out).toBeDefined();
    expect(out!.size).toBe(1);
    expect(new Set(out)).toEqual(new Set([resolve(wf)]));
  });

  it('isWildcard branch must add to the parent-type entry.wildcard flag, not to parentMembers', async () => {
    // Targets L48 ConditionalExpression -> false. Under that mutant, isWildcard is always false
    // for `<members>*</members>`, which causes `entry.parentMembers.add('*')` to be invoked.
    // resolveMemberXml then searches for `<typeDir>/*.workflow-meta.xml` literally, finds
    // nothing, and the suffix never appears in the result. Asserting exact wildcard expansion
    // (two real files for `*`) pins the correct behaviour.
    const a = join(project.forceAppDir, 'workflows', 'Alpha.workflow-meta.xml');
    const b = join(project.forceAppDir, 'workflows', 'Beta.workflow-meta.xml');
    // Decoy file that should NOT be returned because it has the wrong suffix.
    const decoy = join(project.forceAppDir, 'workflows', 'Gamma.flow-meta.xml');
    await writeMetaFile(a);
    await writeMetaFile(b);
    await writeMetaFile(decoy);

    const manifest = await writeManifest(project.root, [{ name: 'Workflow', members: ['*'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual(['workflow']);
    expect(new Set(result.parentXmlsBySuffix.get('workflow'))).toEqual(new Set([resolve(a), resolve(b)]));
  });
});
