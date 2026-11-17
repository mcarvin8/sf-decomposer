'use strict';

import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// CustomObjectTranslation keeps each field's `<Field>.fieldTranslation-meta.xml` beside the
// object's `<Object>-<lang>.objectTranslation-meta.xml` in one component folder. Decomposing
// `objectTranslation` must leave the field files alone: decomposing the whole folder used to split
// them too, and recompose then rebuilt them as `<Field>.objectTranslation-meta.xml`.
const FIXTURE = resolve('fixtures/object-translation');
const COMPONENT = join('objectTranslations', 'Program__c-de');
const FILES = [
  'Program__c-de.objectTranslation-meta.xml',
  'Status__c.fieldTranslation-meta.xml',
  'Program__c.fieldTranslation-meta.xml',
];

describe('objectTranslation component folders with fieldTranslation files', () => {
  let projectDir: string;
  let componentDir: string;
  const log = vi.fn();

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'object-translation-'));
    await cp(FIXTURE, join(projectDir, 'force-app'), { recursive: true });
    await writeFile(
      join(projectDir, SFDX_CONFIG_FILE),
      JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }], sourceApiVersion: '68.0' }),
    );
    componentDir = join(projectDir, 'force-app', COMPONENT);
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it.each(['unique-id', 'grouped-by-tag'])(
    'decomposes only the objectTranslation file and round-trips the folder byte-for-byte (%s)',
    async (strategy) => {
      const originals = await Promise.all(FILES.map((f) => readFile(join(FIXTURE, COMPONENT, f), 'utf-8')));
      const options = { metadataTypes: ['objectTranslation'], format: 'xml', ignoreDirs: undefined, log };

      await decomposeMetadataTypes({
        ...options,
        prepurge: true,
        postpurge: true,
        strategy,
        decomposeNestedPerms: false,
      });
      const afterDecompose = (await readdir(componentDir)).sort();
      expect(afterDecompose).toEqual(
        ['Program__c-de', 'Program__c.fieldTranslation-meta.xml', 'Status__c.fieldTranslation-meta.xml'].sort(),
      );

      await recomposeMetadataTypes({ ...options, postpurge: true });
      expect((await readdir(componentDir)).sort()).toEqual([...FILES].sort());
      const rebuilt = await Promise.all(FILES.map((f) => readFile(join(componentDir, f), 'utf-8')));
      expect(rebuilt).toEqual(originals);
    },
  );
});
