'use strict';

import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { verifyMetadataTypes } from '../../src/core/verifyMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// Repeated siblings whose order is meaningful and that filename order would scramble:
// picklist values (unique-id names, display order), layout sections (hash names, page
// order), and field permissions listed out of alphabetical order. config-disassembler
// >= 0.11.11 records the source order in `.element_order.json` and restores it.
const FIXTURE = resolve('fixtures/sibling-order');
const FILES = [
  { type: 'globalValueSet', dir: 'globalValueSets', name: 'Tier', tag: 'customValue' },
  { type: 'layout', dir: 'layouts', name: 'Account-Account Layout', tag: 'layoutSections' },
  { type: 'permissionset', dir: 'permissionsets', name: 'Order_Test', tag: 'fieldPermissions' },
] as const;
const METADATA_TYPES = FILES.map((f) => f.type);

describe('sibling order round trip (fixtures/sibling-order)', () => {
  let projectDir: string;
  let forceApp: string;
  const log = vi.fn();

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'sibling-order-'));
    forceApp = join(projectDir, 'force-app');
    await cp(FIXTURE, forceApp, { recursive: true });
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

  it.each(['xml', 'yaml'])('restores the original sibling order byte-for-byte (%s)', async (format) => {
    await decomposeMetadataTypes({
      metadataTypes: [...METADATA_TYPES],
      prepurge: true,
      postpurge: true,
      format,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log,
    });

    for (const { dir, name, tag } of FILES) {
      const decomposed = join(forceApp, dir, name);
      const recorded = JSON.parse(await readFile(join(decomposed, '.element_order.json'), 'utf-8'))[tag] as string[];
      const byFilename = (await readdir(join(decomposed, tag))).map((f) => `${tag}/${f}`).sort();
      // Guard the fixture itself: filename order must differ from source order, or this test
      // would pass even if the order file were ignored.
      expect(recorded).toHaveLength(byFilename.length);
      expect(recorded).not.toEqual(byFilename);
    }

    await recomposeMetadataTypes({ metadataTypes: [...METADATA_TYPES], postpurge: true, ignoreDirs: undefined, log });

    for (const { dir, name, type } of FILES) {
      const file = `${name}.${type}-meta.xml`;
      const original = await readFile(join(FIXTURE, dir, file), 'utf-8');
      expect(await readFile(join(forceApp, dir, file), 'utf-8'), file).toBe(original);
    }
  });

  it('verify reports no drift and no reordering', async () => {
    const result = await verifyMetadataTypes({
      metadataTypes: [...METADATA_TYPES],
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      log,
    });
    expect(result.metadata.sort()).toEqual([...METADATA_TYPES].sort());
    expect(result.drift).toEqual([]);
    expect(result.reordered).toEqual([]);
  });
});
