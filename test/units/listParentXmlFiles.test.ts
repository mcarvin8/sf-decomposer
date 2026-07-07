import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MetaAttributes } from '../../src/helpers/types.js';
import { listParentXmlFilesForType, listSuffixFiles } from '../../src/metadata/listParentXmlFiles.js';

const TMP_ROOT = join('test', 'tmp', 'list-parent-xml-files');

function makeAttrs(over: Partial<MetaAttributes> = {}): MetaAttributes {
  return {
    metaSuffix: 'permissionset',
    strictDirectoryName: false,
    folderType: '',
    metadataPaths: [],
    uniqueIdElements: 'fullName,name',
    ...over,
  };
}

describe('listSuffixFiles', () => {
  const dir = join(TMP_ROOT, 'suffix-files');

  beforeEach(async () => {
    await mkdir(dir, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_ROOT, { recursive: true, force: true });
  });

  it('finds files matching the meta suffix ending', async () => {
    await writeFile(join(dir, 'HR_Admin.permissionset-meta.xml'), '<r/>');
    await writeFile(join(dir, 'Other.permissionset-meta.xml'), '<r/>');
    await writeFile(join(dir, 'not-a-match.txt'), 'x');

    const found = await listSuffixFiles(dir, 'permissionset');
    expect(found.map((f) => f.fullName).sort()).toEqual(['HR_Admin', 'Other']);
    expect(found.every((f) => f.filePath.endsWith('.permissionset-meta.xml'))).toBe(true);
  });

  it('does not recurse into subdirectories', async () => {
    await writeFile(join(dir, 'Top.permissionset-meta.xml'), '<r/>');
    await mkdir(join(dir, 'nested'), { recursive: true });
    await writeFile(join(dir, 'nested', 'Nested.permissionset-meta.xml'), '<r/>');

    const found = await listSuffixFiles(dir, 'permissionset');
    expect(found.map((f) => f.fullName)).toEqual(['Top']);
  });

  it('returns an empty array when the directory does not exist', async () => {
    const found = await listSuffixFiles(join(dir, 'missing'), 'permissionset');
    expect(found).toEqual([]);
  });
});

describe('listParentXmlFilesForType', () => {
  beforeEach(async () => {
    await mkdir(TMP_ROOT, { recursive: true });
  });

  afterEach(async () => {
    await rm(TMP_ROOT, { recursive: true, force: true });
  });

  it('flat type: finds every suffix file across all metadataPaths', async () => {
    const dirA = join(TMP_ROOT, 'permissionsets-a');
    const dirB = join(TMP_ROOT, 'permissionsets-b');
    await mkdir(dirA, { recursive: true });
    await mkdir(dirB, { recursive: true });
    await writeFile(join(dirA, 'HR_Admin.permissionset-meta.xml'), '<r/>');
    await writeFile(join(dirB, 'IT_Admin.permissionset-meta.xml'), '<r/>');

    const found = await listParentXmlFilesForType(makeAttrs({ metadataPaths: [dirA, dirB] }));
    expect(found.map((f) => f.fullName).sort()).toEqual(['HR_Admin', 'IT_Admin']);
  });

  it('labels: finds the single CustomLabels file when present', async () => {
    const dir = join(TMP_ROOT, 'labels');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'CustomLabels.labels-meta.xml'), '<CustomLabels/>');

    const found = await listParentXmlFilesForType(makeAttrs({ metaSuffix: 'labels', metadataPaths: [dir] }));
    expect(found).toEqual([{ filePath: join(dir, 'CustomLabels.labels-meta.xml'), fullName: 'CustomLabels' }]);
  });

  it('labels: returns nothing when the labels file is absent', async () => {
    const dir = join(TMP_ROOT, 'labels-empty');
    await mkdir(dir, { recursive: true });

    const found = await listParentXmlFilesForType(makeAttrs({ metaSuffix: 'labels', metadataPaths: [dir] }));
    expect(found).toEqual([]);
  });

  it('strictDirectoryName: finds the parent xml one level inside each component directory', async () => {
    const dir = join(TMP_ROOT, 'bots');
    await mkdir(join(dir, 'MyBot'), { recursive: true });
    await writeFile(join(dir, 'MyBot', 'MyBot.bot-meta.xml'), '<Bot/>');
    // A stray file directly under the type dir (not a component directory) must be ignored.
    await writeFile(join(dir, 'stray.txt'), 'x');

    const found = await listParentXmlFilesForType(
      makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true, metadataPaths: [dir] }),
    );
    expect(found).toEqual([{ filePath: join(dir, 'MyBot', 'MyBot.bot-meta.xml'), fullName: 'MyBot' }]);
  });

  it('folderType: finds multiple parent xml files inside one folder directory, all sharing the folder as fullName', async () => {
    // Real decompose (subDirectoryHandler) resolves component-scope overrides once per folder
    // directory and applies the result uniformly to every report the crate finds inside — not
    // once per individual report. fullName must reflect that: the folder's name, not each
    // report's own name.
    const dir = join(TMP_ROOT, 'reports');
    await mkdir(join(dir, 'MyFolder'), { recursive: true });
    await writeFile(join(dir, 'MyFolder', 'Report1.report-meta.xml'), '<Report/>');
    await writeFile(join(dir, 'MyFolder', 'Report2.report-meta.xml'), '<Report/>');

    const found = await listParentXmlFilesForType(
      makeAttrs({ metaSuffix: 'report', folderType: 'ReportFolder', metadataPaths: [dir] }),
    );
    expect(found.map((f) => f.fullName)).toEqual(['MyFolder', 'MyFolder']);
    expect(found.map((f) => f.filePath).sort()).toEqual(
      [join(dir, 'MyFolder', 'Report1.report-meta.xml'), join(dir, 'MyFolder', 'Report2.report-meta.xml')].sort(),
    );
  });

  it('bot: also discovers sibling botVersion files, with fullName from the bot directory', async () => {
    // Confirmed against fixtures/package-dir-2/bots/*: a bot's component directory holds both
    // <name>.bot-meta.xml and one or more sibling <version>.botVersion-meta.xml files. Both are
    // real decomposable content the crate's directory-mode disassemble processes for real, so
    // both must be discovered here -- otherwise bot version files are silently never verified.
    const dir = join(TMP_ROOT, 'bots');
    await mkdir(join(dir, 'MyBot'), { recursive: true });
    await writeFile(join(dir, 'MyBot', 'MyBot.bot-meta.xml'), '<Bot/>');
    await writeFile(join(dir, 'MyBot', 'v1.botVersion-meta.xml'), '<BotVersion/>');

    const found = await listParentXmlFilesForType(
      makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true, metadataPaths: [dir] }),
    );
    expect(found.map((f) => f.fullName)).toEqual(['MyBot', 'MyBot']);
    expect(found.map((f) => f.filePath).sort()).toEqual(
      [join(dir, 'MyBot', 'MyBot.bot-meta.xml'), join(dir, 'MyBot', 'v1.botVersion-meta.xml')].sort(),
    );
  });

  it('does not pull in botVersion-suffixed files for non-bot strict-directory types', async () => {
    const dir = join(TMP_ROOT, 'not-bots');
    await mkdir(join(dir, 'MyThing'), { recursive: true });
    await writeFile(join(dir, 'MyThing', 'MyThing.something-meta.xml'), '<r/>');
    await writeFile(join(dir, 'MyThing', 'v1.botVersion-meta.xml'), '<r/>');

    const found = await listParentXmlFilesForType(
      makeAttrs({ metaSuffix: 'something', strictDirectoryName: true, metadataPaths: [dir] }),
    );
    expect(found).toEqual([{ filePath: join(dir, 'MyThing', 'MyThing.something-meta.xml'), fullName: 'MyThing' }]);
  });

  it('manifest mode, flat type: derives fullName from the filename', async () => {
    const filePath = join(TMP_ROOT, 'permissionsets', 'HR_Admin.permissionset-meta.xml');
    const found = await listParentXmlFilesForType(makeAttrs({ metadataPaths: [] }), new Set([filePath]));
    expect(found).toEqual([{ filePath, fullName: 'HR_Admin' }]);
  });

  it('manifest mode, strictDirectoryName type: processes the whole component directory, including botVersion siblings', async () => {
    const dir = join(TMP_ROOT, 'bots');
    await mkdir(join(dir, 'MyBot'), { recursive: true });
    await writeFile(join(dir, 'MyBot', 'MyBot.bot-meta.xml'), '<Bot/>');
    await writeFile(join(dir, 'MyBot', 'v1.botVersion-meta.xml'), '<BotVersion/>');
    const filePath = join(dir, 'MyBot', 'MyBot.bot-meta.xml');

    const found = await listParentXmlFilesForType(
      makeAttrs({ metaSuffix: 'bot', strictDirectoryName: true, metadataPaths: [] }),
      new Set([filePath]),
    );
    expect(found.map((f) => f.fullName)).toEqual(['MyBot', 'MyBot']);
    expect(found.map((f) => f.filePath).sort()).toEqual(
      [join(dir, 'MyBot', 'MyBot.bot-meta.xml'), join(dir, 'MyBot', 'v1.botVersion-meta.xml')].sort(),
    );
  });

  it('flat type: returns an empty array when a metadataPath does not exist', async () => {
    const found = await listParentXmlFilesForType(makeAttrs({ metadataPaths: [join(TMP_ROOT, 'does-not-exist')] }));
    expect(found).toEqual([]);
  });
});
