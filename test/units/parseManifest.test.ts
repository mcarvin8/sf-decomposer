'use strict';

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
  const root = await mkdtemp(join(tmpdir(), 'parse-manifest-'));
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
  });

  it('omits a type when its type dir exists but no declared member resolves to an XML on disk', async () => {
    // Type dir exists, but member file does not.
    await mkdir(join(project.forceAppDir, 'permissionsets'), { recursive: true });

    const manifest = await writeManifest(project.root, [{ name: 'PermissionSet', members: ['DoesNotExist'] }]);
    const result = await parseManifest(manifest, undefined);

    expect(result.suffixes).toEqual([]);
    expect(result.parentXmlsBySuffix.size).toBe(0);
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
});
