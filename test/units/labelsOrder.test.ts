'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { CUSTOM_LABELS_FILE, ELEMENT_ORDER_SIDECAR } from '../../src/helpers/constants.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// Custom labels in an order that filename order (case-sensitive: `Alpha`, `Zulu`, `beta`) would
// scramble. Labels are stored flat once decomposed, so the order file config-disassembler writes
// in the `CustomLabels` stem directory has to be kept beside them for recompose to restore it.
const label = (name: string): string =>
  [
    '    <labels>',
    `        <fullName>${name}</fullName>`,
    '        <language>en_US</language>',
    '        <protected>false</protected>',
    `        <shortDescription>${name}</shortDescription>`,
    `        <value>${name} value</value>`,
    '    </labels>',
  ].join('\n');
const LABELS = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">',
  ...['beta', 'Zulu', 'gamma', 'Alpha'].map(label),
  '</CustomLabels>',
  '',
].join('\n');

describe('custom labels order round trip', () => {
  let projectDir: string;
  let labelsDir: string;
  const log = vi.fn();
  const options = { metadataTypes: ['labels'], format: 'xml', ignoreDirs: undefined, log };

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'labels-order-'));
    labelsDir = join(projectDir, 'force-app', 'main', 'default', 'labels');
    await mkdir(labelsDir, { recursive: true });
    await writeFile(join(labelsDir, CUSTOM_LABELS_FILE), LABELS);
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

  const decompose = (): Promise<unknown> =>
    decomposeMetadataTypes({
      ...options,
      prepurge: true,
      postpurge: true,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
    });

  it('keeps the order file beside the label files, naming them as they are stored', async () => {
    await decompose();

    const files = await readdir(labelsDir);
    expect(files).toContain(ELEMENT_ORDER_SIDECAR);
    const order = JSON.parse(await readFile(join(labelsDir, ELEMENT_ORDER_SIDECAR), 'utf-8')) as {
      labels: string[];
    };
    expect(order.labels).toEqual(['beta', 'Zulu', 'gamma', 'Alpha'].map((n) => `labels/${n}.label-meta.xml`));
    for (const entry of order.labels) expect(files).toContain(entry.slice('labels/'.length));
  });

  it('restores the original label order byte-for-byte, also when recomposed twice', async () => {
    await decompose();

    // Without postpurge the decomposed files (and their sidecars) stay, so a second recompose
    // from the same files must give the same result.
    await recomposeMetadataTypes({ ...options, postpurge: false });
    expect(await readFile(join(labelsDir, CUSTOM_LABELS_FILE), 'utf-8')).toBe(LABELS);
    await recomposeMetadataTypes({ ...options, postpurge: true });
    expect(await readFile(join(labelsDir, CUSTOM_LABELS_FILE), 'utf-8')).toBe(LABELS);
    expect(await readdir(labelsDir)).toEqual([CUSTOM_LABELS_FILE]);
  });
});
