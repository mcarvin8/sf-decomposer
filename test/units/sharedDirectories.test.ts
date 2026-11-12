'use strict';

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parentForInFileChildSuffix } from '../../src/metadata/getRegistryValuesBySuffix.js';
import { resolveEffectiveMetadataTypes } from '../../src/metadata/parseManifest.js';
import { directoryOccupancy, isDecomposedDirOfType } from '../../src/metadata/sharedDirectories.js';
import { updateForceignoreFile } from '../../src/service/core/updateForceignore.js';

describe('directoryOccupancy', () => {
  it('lists the other types whose files share a directory', () => {
    const { typeName, others } = directoryOccupancy('moderation', 'keywords');
    expect(typeName).toBe('KeywordList');
    expect(others).toEqual([{ name: 'ModerationRule', suffix: 'rule' }]);
  });

  it('reports no other types for an unshared directory', () => {
    expect(directoryOccupancy('permissionsets', 'permissionset')).toEqual({ typeName: 'PermissionSet', others: [] });
  });

  it('ignores in-file child types, which never have files of their own', () => {
    // AssignmentRule shares the registry directoryName but only exists inside AssignmentRules files.
    expect(directoryOccupancy('assignmentRules', 'assignmentRules').others).toEqual([]);
  });

  it('ignores unaddressable children whose directoryName does not match where their files live', () => {
    // CustomFieldTranslation claims `fields`, but its files live under objectTranslations/.
    expect(directoryOccupancy('fields', 'field')).toEqual({ typeName: 'CustomField', others: [] });
  });

  it('returns no owner for a directory the registry does not know', () => {
    expect(directoryOccupancy('not-a-metadata-dir', 'keywords')).toEqual({ typeName: undefined, others: [] });
  });
});

describe('isDecomposedDirOfType', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'shared-dirs-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('returns false for a directory with no fragment files at any depth', async () => {
    await mkdir(join(root, 'Empty', 'nested'), { recursive: true });
    expect(await isDecomposedDirOfType(join(root, 'Empty'), 'keywords', 'KeywordList')).toBe(false);
  });

  it('ignores dotfiles such as .key_order.json when looking for a fragment', async () => {
    await mkdir(join(root, 'Dir', 'keywords'), { recursive: true });
    await writeFile(join(root, 'Dir', '.key_order.json'), '["KeywordList"]');
    await writeFile(join(root, 'Dir', 'keywords', 'a.keywords-meta.xml'), '<ModerationRule xmlns="x">');
    expect(await isDecomposedDirOfType(join(root, 'Dir'), 'keywords', 'KeywordList')).toBe(false);
  });

  it('matches an unquoted json5 root key', async () => {
    await mkdir(join(root, 'Dir', 'keywords'), { recursive: true });
    await writeFile(join(root, 'Dir', 'keywords', 'a.keywords-meta.json5'), '{\n  KeywordList: {},\n}');
    expect(await isDecomposedDirOfType(join(root, 'Dir'), 'keywords', 'KeywordList')).toBe(true);
  });
});

describe('parentForInFileChildSuffix', () => {
  it.each([
    ['assignmentRule', 'assignmentRules', 'AssignmentRules'],
    ['sharingCriteriaRule', 'sharingRules', 'SharingRules'],
    ['workflowAlert', 'workflow', 'Workflow'],
    ['formSection', 'form', 'Form'],
    // Unaddressable child of a decomposed parent: its `fields` directoryName would hit CustomField files.
    ['fieldTranslation', 'objectTranslation', 'CustomObjectTranslation'],
  ])('redirects %s to %s', (suffix, parentSuffix, parentName) => {
    expect(parentForInFileChildSuffix(suffix)).toMatchObject({ parentSuffix, parentName });
  });

  it.each([
    ['permissionset', 'top-level type'],
    ['labels', 'shares its suffix with the parent, which resolves first'],
    ['matchingRule', 'shares its suffix with the parent, which resolves first'],
    ['field', 'child of a decomposed parent, stored as its own file'],
    ['recordType', 'child of a decomposed parent, stored as its own file'],
    ['botVersion', 'handled by the dedicated botVersion redirect'],
    ['notARealSuffix', 'unknown suffix'],
  ])('leaves %s alone (%s)', (suffix) => {
    expect(parentForInFileChildSuffix(suffix)).toBeUndefined();
  });
});

describe('resolveEffectiveMetadataTypes child-suffix redirect', () => {
  it('replaces in-file child suffixes with the parent, warns, and dedupes', async () => {
    const log = vi.fn();
    const { effectiveTypes } = await resolveEffectiveMetadataTypes(
      ['assignmentRule', 'assignmentRules', 'permissionset'],
      undefined,
      undefined,
      undefined,
      log,
    );
    expect(effectiveTypes).toEqual(['assignmentRules', 'permissionset']);
    expect(log).toHaveBeenCalledWith(
      'Warning: `assignmentRule` (AssignmentRule) is processed through its parent AssignmentRules; automatically using `assignmentRules` instead.',
    );
    expect(log).toHaveBeenCalledTimes(1);
  });
});

describe('updateForceignoreFile in a shared directory', () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await mkdtemp(join(tmpdir(), 'forceignore-shared-'));
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  it("ignores only nested pieces so the other types' originals stay deployable", async () => {
    await updateForceignoreFile([{ directoryName: 'moderation', metaSuffix: 'keywords', format: 'json' }], repoRoot);
    const lines = (await readFile(join(repoRoot, '.forceignore'), 'utf-8')).split('\n').filter(Boolean);
    expect(lines).toEqual(['**/moderation/*/**/*.json']);
  });
});
