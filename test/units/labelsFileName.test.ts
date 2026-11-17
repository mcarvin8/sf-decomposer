'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { LABELS_FILE_SIDECAR } from '../../src/helpers/constants.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// Any `<name>.labels-meta.xml` is a CustomLabels file (the registry ignores its parsed fullName);
// libraries use their own, e.g. fflib's `fflib-Apex-Common-CustomLabels.labels-meta.xml`. Decompose
// used to ignore such a file, and recompose then rebuilt it as `CustomLabels.labels-meta.xml`.
const FILE_NAME = 'fflib-Apex-Common-CustomLabels.labels-meta.xml';
const LABELS = `<?xml version="1.0" encoding="UTF-8"?>
<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">
    <labels>
        <fullName>fflib_Second</fullName>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>second</shortDescription>
        <value>Second</value>
    </labels>
    <labels>
        <fullName>fflib_First</fullName>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>first</shortDescription>
        <value>First</value>
    </labels>
</CustomLabels>
`;

describe('labels files not named CustomLabels.labels-meta.xml', () => {
  let projectDir: string;
  let labelsDir: string;
  const log = vi.fn();
  const options = { metadataTypes: ['labels'], format: 'xml', ignoreDirs: undefined, log };
  const decompose = (): Promise<unknown> =>
    decomposeMetadataTypes({
      ...options,
      prepurge: true,
      postpurge: true,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
    });

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'labels-file-name-'));
    labelsDir = join(projectDir, 'force-app', 'infrastructure', 'labels');
    await mkdir(labelsDir, { recursive: true });
    await writeFile(
      join(projectDir, SFDX_CONFIG_FILE),
      JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }], sourceApiVersion: '68.0' }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it('decomposes the file and recomposes it under its own name, byte-for-byte', async () => {
    await writeFile(join(labelsDir, FILE_NAME), LABELS);

    await decompose();
    const decomposed = await readdir(labelsDir);
    expect(decomposed).not.toContain(FILE_NAME);
    expect(decomposed).toContain(LABELS_FILE_SIDECAR);
    expect(decomposed).toEqual(expect.arrayContaining(['fflib_First.label-meta.xml', 'fflib_Second.label-meta.xml']));

    await recomposeMetadataTypes({ ...options, postpurge: true });
    expect(await readdir(labelsDir)).toEqual([FILE_NAME]);
    expect(await readFile(join(labelsDir, FILE_NAME), 'utf-8')).toBe(LABELS);
  });

  it('leaves a labels file that was never decomposed, and unrelated files, alone on recompose', async () => {
    await writeFile(join(labelsDir, FILE_NAME), LABELS);
    await writeFile(join(labelsDir, 'README.md'), 'notes\n');

    await recomposeMetadataTypes({ ...options, postpurge: true });

    expect((await readdir(labelsDir)).sort()).toEqual([FILE_NAME, 'README.md'].sort());
    expect(await readFile(join(labelsDir, FILE_NAME), 'utf-8')).toBe(LABELS);
  });

  it('refuses a directory with more than one labels file', async () => {
    await writeFile(join(labelsDir, FILE_NAME), LABELS);
    await writeFile(join(labelsDir, 'CustomLabels.labels-meta.xml'), LABELS);

    await expect(decompose()).rejects.toThrow('Found more than one labels file');
    expect((await readdir(labelsDir)).sort()).toEqual(['CustomLabels.labels-meta.xml', FILE_NAME].sort());
  });

  it('keeps going when config-disassembler skips another labels file (comments it cannot place)', async () => {
    // config-disassembler leaves a file with a comment outside its root element undisassembled
    // (comments inside the root are kept since 4.1.0). Moving its (missing) output used to throw and
    // abort the whole labels run, stranding this directory's labels half-decomposed.
    const mainDir = join(projectDir, 'force-app', 'main', 'default', 'labels');
    const commented = LABELS.replace(
      '<CustomLabels xmlns',
      '<!-- Labels for the main package -->\n<CustomLabels xmlns',
    );
    await mkdir(mainDir, { recursive: true });
    await writeFile(join(mainDir, 'CustomLabels.labels-meta.xml'), commented);
    await writeFile(join(labelsDir, FILE_NAME), LABELS);

    await decompose();
    expect(await readdir(mainDir)).toEqual(['CustomLabels.labels-meta.xml']);
    expect(await readdir(labelsDir)).not.toContain(FILE_NAME);

    await recomposeMetadataTypes({ ...options, postpurge: true });
    expect(await readFile(join(mainDir, 'CustomLabels.labels-meta.xml'), 'utf-8')).toBe(commented);
    expect(await readdir(labelsDir)).toEqual([FILE_NAME]);
    expect(await readFile(join(labelsDir, FILE_NAME), 'utf-8')).toBe(LABELS);
  });
});
