'use strict';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  loadOverridesFromConfig,
  validateOverrides,
  validateSplitTagsSpec,
  validateMultiLevelSpec,
  getOverrideForType,
  getOverrideForComponent,
  hasComponentOverridesForType,
  parseComponentKey,
  resolveDecomposeOptionsForType,
  resolveDecomposeOptionsForComponent,
  resolveDefaultConfigPath,
} from '../../src/helpers/configOverrides.js';
import { HOOK_CONFIG_JSON, SFDX_PROJECT_FILE_NAME } from '../../src/helpers/constants.js';
import { DecomposerOverride } from '../../src/helpers/types.js';

describe('configOverrides helper', () => {
  describe('validateOverrides', () => {
    it('accepts an empty array', () => {
      expect(() => validateOverrides([])).not.toThrow();
    });

    it('accepts a well-formed override', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
        { metadataTypes: ['permissionset'], strategy: 'grouped-by-tag', decomposeNestedPermissions: true },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects an override with empty metadataTypes and no components', () => {
      expect(() => validateOverrides([{ metadataTypes: [] } as unknown as DecomposerOverride])).toThrow(
        /non-empty "metadataTypes" or "components"/,
      );
    });

    it('rejects an override missing both metadataTypes and components', () => {
      expect(() => validateOverrides([{} as unknown as DecomposerOverride])).toThrow(
        /non-empty "metadataTypes" or "components"/,
      );
    });

    it('rejects a non-array metadataTypes', () => {
      expect(() => validateOverrides([{ metadataTypes: 'flow' } as unknown as DecomposerOverride])).toThrow(
        /non-array "metadataTypes"/,
      );
    });

    it('rejects a non-array components', () => {
      expect(() =>
        validateOverrides([{ components: 'permissionset:HR_Admin' } as unknown as DecomposerOverride]),
      ).toThrow(/non-array "components"/);
    });

    it('accepts a components-only override', () => {
      const overrides: DecomposerOverride[] = [
        {
          components: ['permissionset:HR_Admin', 'permissionset:Big_PermSet'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a mixed override that targets both a type and components', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['permissionset'],
          components: ['mutingpermissionset:Locked_Down'],
          decomposedFormat: 'yaml',
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects duplicate component keys across overrides', () => {
      const overrides: DecomposerOverride[] = [
        { components: ['permissionset:HR_Admin'], decomposedFormat: 'yaml' },
        { components: ['permissionset:HR_Admin'], strategy: 'grouped-by-tag' },
      ];
      expect(() => validateOverrides(overrides)).toThrow(/Component "permissionset:HR_Admin" appears in more than one/);
    });

    it('rejects a malformed component key without colon', () => {
      const overrides: DecomposerOverride[] = [{ components: ['permissionset_HR_Admin'] }];
      expect(() => validateOverrides(overrides)).toThrow(/invalid component key/);
    });

    it('rejects a component key with an empty fullName', () => {
      const overrides: DecomposerOverride[] = [{ components: ['permissionset:'] }];
      expect(() => validateOverrides(overrides)).toThrow(/invalid component key/);
    });

    it('rejects a component key with an empty suffix', () => {
      const overrides: DecomposerOverride[] = [{ components: [':HR_Admin'] }];
      expect(() => validateOverrides(overrides)).toThrow(/invalid component key/);
    });

    it('rejects a non-string component', () => {
      const overrides = [{ components: [42] }] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).toThrow(/empty or non-string component/);
    });

    it('rejects duplicate metadata types across overrides', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
        { metadataTypes: ['flow'], strategy: 'grouped-by-tag' },
      ];
      expect(() => validateOverrides(overrides)).toThrow(/appears in more than one override/);
    });

    it('rejects forbidden run-scope keys', () => {
      const overrides = [{ metadataTypes: ['flow'], manifest: 'package.xml' }] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).toThrow(/run-scope option/);
    });

    it('rejects an invalid decomposedFormat', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], decomposedFormat: 'toml' }];
      expect(() => validateOverrides(overrides)).toThrow(/invalid "decomposedFormat"/);
    });

    it('rejects an invalid strategy', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], strategy: 'one-file-per-flag' }];
      expect(() => validateOverrides(overrides)).toThrow(/invalid "strategy"/);
    });

    it('rejects an empty string metadata type', () => {
      const overrides = [{ metadataTypes: [''] }] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).toThrow(/empty or non-string metadata type/);
    });

    it('rejects a null override entry', () => {
      const overrides = [null] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).toThrow(/Override at index 0 must be an object/);
    });

    it('rejects a primitive override entry', () => {
      const overrides = ['not-an-object'] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).toThrow(/Override at index 0 must be an object/);
    });

    it('tolerates unknown override keys without throwing', () => {
      const overrides = [
        { metadataTypes: ['flow'], decomposedFormat: 'yaml', futureFlag: true },
      ] as unknown as DecomposerOverride[];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a well-formed splitTags spec', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['permissionset'],
          strategy: 'grouped-by-tag',
          splitTags: 'objectPermissions:split:object,fieldPermissions:group:field',
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects a malformed splitTags spec', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['flow'], strategy: 'grouped-by-tag', splitTags: 'actionCalls:split' },
      ];
      expect(() => validateOverrides(overrides)).toThrow(/3 or 4 colon-separated parts/);
    });

    it('accepts a well-formed multiLevel spec', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['loyaltyProgramSetup'],
          multiLevel: 'programProcesses:programProcesses:parameterName,ruleName',
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects a malformed multiLevel spec', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['loyaltyProgramSetup'], multiLevel: 'programProcesses:programProcesses' },
      ];
      expect(() => validateOverrides(overrides)).toThrow(/exactly 3 colon-separated parts/);
    });

    it('accepts a multiLevel spec passed as an array of rules', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['bot'],
          multiLevel: ['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'],
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a multiLevel spec with multiple rules joined by ";"', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['bot'],
          multiLevel: 'botDialogs:botDialogs:developerName;botSteps:botSteps:type',
        },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });
  });

  describe('validateSplitTagsSpec', () => {
    it('accepts a 3-part rule', () => {
      expect(() => validateSplitTagsSpec('objectPermissions:split:object', 0)).not.toThrow();
    });

    it('accepts a 4-part rule (with explicit path)', () => {
      expect(() => validateSplitTagsSpec('items:nested.items:group:label', 0)).not.toThrow();
    });

    it('accepts multiple comma-separated rules', () => {
      expect(() =>
        validateSplitTagsSpec('objectPermissions:split:object,fieldPermissions:group:field', 0),
      ).not.toThrow();
    });

    it('rejects an empty spec', () => {
      expect(() => validateSplitTagsSpec('', 0)).toThrow(/empty "splitTags" string/);
    });

    it('rejects a whitespace-only spec', () => {
      expect(() => validateSplitTagsSpec('   ', 0)).toThrow(/empty "splitTags" string/);
    });

    it('rejects an empty rule between commas', () => {
      expect(() => validateSplitTagsSpec('objectPermissions:split:object,,fieldPermissions:group:field', 0)).toThrow(
        /contains an empty rule/,
      );
    });

    it('rejects a rule with too few parts', () => {
      expect(() => validateSplitTagsSpec('actionCalls:split', 0)).toThrow(/3 or 4 colon-separated parts/);
    });

    it('rejects a rule with too many parts', () => {
      expect(() => validateSplitTagsSpec('a:b:c:d:e', 0)).toThrow(/3 or 4 colon-separated parts/);
    });

    it('rejects a rule with an empty tag', () => {
      expect(() => validateSplitTagsSpec(':split:object', 0)).toThrow(/empty parts/);
    });

    it('rejects a 4-part rule with an empty path', () => {
      expect(() => validateSplitTagsSpec('items::group:label', 0)).toThrow(/empty parts/);
    });

    it('rejects an unknown mode', () => {
      expect(() => validateSplitTagsSpec('actionCalls:explode:name', 0)).toThrow(/invalid mode "explode"/);
    });

    it('rejects duplicate tags within a single spec', () => {
      expect(() => validateSplitTagsSpec('actionCalls:split:name,actionCalls:group:label', 0)).toThrow(
        /duplicate tag "actionCalls"/,
      );
    });

    it('tolerates rules with surrounding whitespace', () => {
      expect(() =>
        validateSplitTagsSpec('  objectPermissions : split : object , fieldPermissions : group : field ', 0),
      ).not.toThrow();
    });
  });

  describe('validateMultiLevelSpec', () => {
    it('accepts the canonical loyalty spec', () => {
      expect(() => validateMultiLevelSpec('programProcesses:programProcesses:parameterName,ruleName', 0)).not.toThrow();
    });

    it('accepts a single-id rule', () => {
      expect(() => validateMultiLevelSpec('items:items:name', 0)).not.toThrow();
    });

    it('rejects an empty spec', () => {
      expect(() => validateMultiLevelSpec('', 0)).toThrow(/empty "multiLevel" string/);
    });

    it('rejects a whitespace-only spec', () => {
      expect(() => validateMultiLevelSpec('   ', 0)).toThrow(/empty "multiLevel" string/);
    });

    it('rejects a rule with too few parts', () => {
      expect(() => validateMultiLevelSpec('items:items', 0)).toThrow(/exactly 3 colon-separated parts/);
    });

    it('rejects a rule with too many parts', () => {
      expect(() => validateMultiLevelSpec('items:items:name:extra', 0)).toThrow(/exactly 3 colon-separated parts/);
    });

    it('rejects a rule with empty parts', () => {
      expect(() => validateMultiLevelSpec(':items:name', 0)).toThrow(/empty parts/);
    });

    it('rejects a unique-id list with an empty entry', () => {
      expect(() => validateMultiLevelSpec('items:items:name,', 0)).toThrow(/empty entry/);
    });

    it('rejects duplicate unique-id entries', () => {
      expect(() => validateMultiLevelSpec('items:items:name,name', 0)).toThrow(/duplicate entry "name"/);
    });

    it('tolerates surrounding whitespace', () => {
      expect(() => validateMultiLevelSpec(' items : items : name , label ', 0)).not.toThrow();
    });

    it('accepts a string[] of rules', () => {
      expect(() =>
        validateMultiLevelSpec(['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'], 0),
      ).not.toThrow();
    });

    it('accepts a single ";"-separated string of rules', () => {
      expect(() =>
        validateMultiLevelSpec('botDialogs:botDialogs:developerName;botSteps:botSteps:type', 0),
      ).not.toThrow();
    });

    it('rejects an empty array', () => {
      expect(() => validateMultiLevelSpec([], 0)).toThrow(/empty "multiLevel" array/);
    });

    it('rejects an array entry that is empty', () => {
      expect(() => validateMultiLevelSpec(['botDialogs:botDialogs:developerName', ''], 0)).toThrow(
        /array contains an empty or non-string entry/,
      );
    });

    it('rejects duplicate (file_pattern, root_to_strip) pairs across rules', () => {
      expect(() =>
        validateMultiLevelSpec(['botDialogs:botDialogs:developerName', 'botDialogs:botDialogs:label'], 0),
      ).toThrow(/duplicate \(file_pattern, root_to_strip\) pair/);
    });

    it('rejects a malformed rule inside an otherwise valid array', () => {
      expect(() => validateMultiLevelSpec(['botDialogs:botDialogs:developerName', 'broken:rule'], 0)).toThrow(
        /exactly 3 colon-separated parts/,
      );
    });
  });

  describe('parseComponentKey', () => {
    it('parses a simple key', () => {
      expect(parseComponentKey('permissionset:HR_Admin')).toEqual({
        metadataType: 'permissionset',
        fullName: 'HR_Admin',
      });
    });

    it('preserves a folder-style fullName intact', () => {
      expect(parseComponentKey('report:MyFolder/MyReport')).toEqual({
        metadataType: 'report',
        fullName: 'MyFolder/MyReport',
      });
    });

    it('returns undefined for a key without a colon', () => {
      expect(parseComponentKey('flow_MyFlow')).toBeUndefined();
    });

    it('returns undefined for a key starting with a colon', () => {
      expect(parseComponentKey(':MyFlow')).toBeUndefined();
    });

    it('returns undefined for a key ending with a colon', () => {
      expect(parseComponentKey('flow:')).toBeUndefined();
    });

    it('returns undefined when the suffix is only whitespace', () => {
      // ` :HR_Admin` parses past the colon-position checks (colon is at index 1, not 0) but
      // fails the post-trim emptiness guard.
      expect(parseComponentKey(' :HR_Admin')).toBeUndefined();
    });

    it('returns undefined when the fullName is only whitespace', () => {
      expect(parseComponentKey('permissionset:   ')).toBeUndefined();
    });
  });

  describe('getOverrideForType', () => {
    const overrides: DecomposerOverride[] = [
      { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
      { metadataTypes: ['permissionset', 'mutingpermissionset'], strategy: 'grouped-by-tag' },
      { components: ['permissionset:HR_Admin'], strategy: 'grouped-by-tag' },
    ];

    it('returns undefined when overrides is undefined', () => {
      expect(getOverrideForType('flow', undefined)).toBeUndefined();
    });

    it('returns undefined when overrides is empty', () => {
      expect(getOverrideForType('flow', [])).toBeUndefined();
    });

    it('returns the matching override by suffix', () => {
      expect(getOverrideForType('flow', overrides)).toBe(overrides[0]);
      expect(getOverrideForType('mutingpermissionset', overrides)).toBe(overrides[1]);
    });

    it('returns undefined for an unmatched suffix', () => {
      expect(getOverrideForType('workflow', overrides)).toBeUndefined();
    });

    it('does not match a components-only override by suffix', () => {
      // The third override only has `components`, so a type-suffix lookup must skip it even
      // when the suffix appears inside a component key.
      const componentsOnly: DecomposerOverride[] = [{ components: ['flow:My_Flow'], decomposedFormat: 'yaml' }];
      expect(getOverrideForType('flow', componentsOnly)).toBeUndefined();
    });
  });

  describe('getOverrideForComponent', () => {
    const overrides: DecomposerOverride[] = [
      { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
      {
        components: ['permissionset:HR_Admin', 'permissionset:Big_PermSet'],
        strategy: 'grouped-by-tag',
        decomposeNestedPermissions: true,
      },
    ];

    it('returns undefined when overrides is undefined or empty', () => {
      expect(getOverrideForComponent('permissionset', 'HR_Admin', undefined)).toBeUndefined();
      expect(getOverrideForComponent('permissionset', 'HR_Admin', [])).toBeUndefined();
    });

    it('returns the matching override for a known component', () => {
      expect(getOverrideForComponent('permissionset', 'HR_Admin', overrides)).toBe(overrides[1]);
      expect(getOverrideForComponent('permissionset', 'Big_PermSet', overrides)).toBe(overrides[1]);
    });

    it('returns undefined for an unmatched component', () => {
      expect(getOverrideForComponent('permissionset', 'Unknown', overrides)).toBeUndefined();
      expect(getOverrideForComponent('flow', 'My_Flow', overrides)).toBeUndefined();
    });
  });

  describe('hasComponentOverridesForType', () => {
    const overrides: DecomposerOverride[] = [
      { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
      { components: ['permissionset:HR_Admin'], strategy: 'grouped-by-tag' },
    ];

    it('returns false when overrides is undefined or empty', () => {
      expect(hasComponentOverridesForType('permissionset', undefined)).toBe(false);
      expect(hasComponentOverridesForType('permissionset', [])).toBe(false);
    });

    it('returns true when at least one component targets the type', () => {
      expect(hasComponentOverridesForType('permissionset', overrides)).toBe(true);
    });

    it('returns false when no component targets the type', () => {
      expect(hasComponentOverridesForType('flow', overrides)).toBe(false);
      expect(hasComponentOverridesForType('mutingpermissionset', overrides)).toBe(false);
    });

    it('does not match on a partial suffix prefix', () => {
      // `permission` is a prefix of `permissionset` but must not match.
      const sneaky: DecomposerOverride[] = [{ components: ['permissionset:HR_Admin'] }];
      expect(hasComponentOverridesForType('permission', sneaky)).toBe(false);
    });
  });

  describe('resolveDecomposeOptionsForType', () => {
    const base = {
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      prepurge: false,
      postpurge: false,
    };

    it('returns base values when no overrides are provided', () => {
      expect(resolveDecomposeOptionsForType('flow', base)).toEqual(base);
    });

    it('returns base values when no override matches the type', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['profile'], decomposedFormat: 'json' }];
      expect(resolveDecomposeOptionsForType('flow', base, overrides)).toEqual(base);
    });

    it('applies override values that are set, falling back to base for unset fields', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], decomposedFormat: 'yaml', prePurge: true }];
      expect(resolveDecomposeOptionsForType('flow', base, overrides)).toEqual({
        format: 'yaml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        prepurge: true,
        postpurge: false,
      });
    });

    it('applies a complete strategy + nested perms override', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['permissionset'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ];
      expect(resolveDecomposeOptionsForType('permissionset', base, overrides)).toEqual({
        format: 'xml',
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
        prepurge: false,
        postpurge: false,
        splitTags: undefined,
        multiLevel: undefined,
      });
    });

    it('threads a type-scope splitTags through resolution', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['flow'],
          strategy: 'grouped-by-tag',
          splitTags: 'actionCalls:split:name',
        },
      ];
      expect(resolveDecomposeOptionsForType('flow', base, overrides).splitTags).toBe('actionCalls:split:name');
    });

    it('threads a type-scope multiLevel through resolution', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['loyaltyProgramSetup'],
          multiLevel: 'programProcesses:programProcesses:parameterName,ruleName',
        },
      ];
      expect(resolveDecomposeOptionsForType('loyaltyProgramSetup', base, overrides).multiLevel).toBe(
        'programProcesses:programProcesses:parameterName,ruleName',
      );
    });

    it('threads an array-form multiLevel through resolution without flattening', () => {
      const overrides: DecomposerOverride[] = [
        {
          metadataTypes: ['bot'],
          multiLevel: ['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type'],
        },
      ];
      expect(resolveDecomposeOptionsForType('bot', base, overrides).multiLevel).toEqual([
        'botDialogs:botDialogs:developerName',
        'botSteps:botSteps:type',
      ]);
    });
  });

  describe('resolveDecomposeOptionsForComponent', () => {
    const base = {
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      prepurge: false,
      postpurge: false,
    };

    it('returns the type-resolved values when no component override matches', () => {
      const typeResolved = { ...base, format: 'yaml' };
      const overrides: DecomposerOverride[] = [{ components: ['permissionset:Other'], strategy: 'grouped-by-tag' }];
      expect(resolveDecomposeOptionsForComponent('permissionset', 'HR_Admin', typeResolved, overrides)).toEqual(
        typeResolved,
      );
    });

    it('applies component override fields and falls back to typeResolved for unset fields', () => {
      const typeResolved = { ...base, format: 'yaml', prepurge: true };
      const overrides: DecomposerOverride[] = [
        {
          components: ['permissionset:HR_Admin'],
          strategy: 'grouped-by-tag',
          decomposeNestedPermissions: true,
        },
      ];
      expect(resolveDecomposeOptionsForComponent('permissionset', 'HR_Admin', typeResolved, overrides)).toEqual({
        format: 'yaml',
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
        prepurge: true,
        postpurge: false,
      });
    });

    it('lets a component override fully overwrite a type-scoped field', () => {
      const typeResolved = { ...base, format: 'yaml' };
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['permissionset'], decomposedFormat: 'yaml' },
        { components: ['permissionset:HR_Admin'], decomposedFormat: 'json' },
      ];
      expect(resolveDecomposeOptionsForComponent('permissionset', 'HR_Admin', typeResolved, overrides)).toEqual({
        ...typeResolved,
        format: 'json',
      });
    });

    it('returns typeResolved when overrides is undefined', () => {
      const typeResolved = { ...base, format: 'json' };
      expect(resolveDecomposeOptionsForComponent('flow', 'My_Flow', typeResolved)).toEqual(typeResolved);
    });

    it('lets a component override replace a type-scoped splitTags', () => {
      const typeResolved = { ...base, strategy: 'grouped-by-tag', splitTags: 'actionCalls:split:name' };
      const overrides: DecomposerOverride[] = [{ components: ['flow:Special'], splitTags: 'decisions:group:label' }];
      expect(resolveDecomposeOptionsForComponent('flow', 'Special', typeResolved, overrides).splitTags).toBe(
        'decisions:group:label',
      );
    });

    it('inherits a type-scoped splitTags when the component override does not set one', () => {
      const typeResolved = { ...base, strategy: 'grouped-by-tag', splitTags: 'actionCalls:split:name' };
      const overrides: DecomposerOverride[] = [{ components: ['flow:Other'], decomposedFormat: 'yaml' }];
      expect(resolveDecomposeOptionsForComponent('flow', 'Other', typeResolved, overrides).splitTags).toBe(
        'actionCalls:split:name',
      );
    });

    it('lets a component override replace a type-scoped multiLevel', () => {
      const typeResolved = { ...base, multiLevel: 'programProcesses:programProcesses:parameterName,ruleName' };
      const overrides: DecomposerOverride[] = [
        { components: ['loyaltyProgramSetup:Custom'], multiLevel: 'rules:rules:ruleName' },
      ];
      expect(
        resolveDecomposeOptionsForComponent('loyaltyProgramSetup', 'Custom', typeResolved, overrides).multiLevel,
      ).toBe('rules:rules:ruleName');
    });

    it('inherits a type-scoped multiLevel when the component override does not set one', () => {
      const typeResolved = {
        ...base,
        multiLevel: 'programProcesses:programProcesses:parameterName,ruleName',
      };
      const overrides: DecomposerOverride[] = [{ components: ['loyaltyProgramSetup:Other'], decomposedFormat: 'yaml' }];
      expect(
        resolveDecomposeOptionsForComponent('loyaltyProgramSetup', 'Other', typeResolved, overrides).multiLevel,
      ).toBe('programProcesses:programProcesses:parameterName,ruleName');
    });
  });

  describe('loadOverridesFromConfig', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'cfg-overrides-test-'));
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('returns an empty array when the file does not exist', async () => {
      const missingPath = join(tempDir, 'does-not-exist.json');
      await expect(loadOverridesFromConfig(missingPath)).resolves.toEqual([]);
    });

    it('returns an empty array when the file has no overrides field', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, JSON.stringify({ metadataSuffixes: 'flow' }));
      await expect(loadOverridesFromConfig(configPath)).resolves.toEqual([]);
    });

    it('parses and validates a well-formed overrides array', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(
        configPath,
        JSON.stringify({
          metadataSuffixes: 'flow,permissionset',
          overrides: [
            { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
            { metadataTypes: ['permissionset'], strategy: 'grouped-by-tag' },
          ],
        }),
      );
      const overrides = await loadOverridesFromConfig(configPath);
      expect(overrides).toHaveLength(2);
      expect(overrides[0].metadataTypes).toEqual(['flow']);
    });

    it('throws on invalid JSON', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, '{ not valid json');
      await expect(loadOverridesFromConfig(configPath)).rejects.toThrow(/Failed to parse/);
    });

    it('throws when overrides is not an array', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, JSON.stringify({ overrides: { metadataTypes: ['flow'] } }));
      await expect(loadOverridesFromConfig(configPath)).rejects.toThrow(/must be an array/);
    });

    it('propagates validation errors from validateOverrides', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(
        configPath,
        JSON.stringify({
          overrides: [{ metadataTypes: ['flow'] }, { metadataTypes: ['flow'], decomposedFormat: 'yaml' }],
        }),
      );
      await expect(loadOverridesFromConfig(configPath)).rejects.toThrow(/appears in more than one override/);
    });
  });

  describe('resolveDefaultConfigPath', () => {
    let tempProjectDir: string;
    const originalCwd = process.cwd();

    beforeEach(async () => {
      tempProjectDir = await mkdtemp(join(tmpdir(), 'resolve-config-test-'));
      await writeFile(join(tempProjectDir, SFDX_PROJECT_FILE_NAME), JSON.stringify({ packageDirectories: [] }));
      process.chdir(tempProjectDir);
    });

    afterEach(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('returns the absolute path to the config when it exists in the repo root', async () => {
      const configPath = join(tempProjectDir, HOOK_CONFIG_JSON);
      await writeFile(configPath, JSON.stringify({ metadataSuffixes: 'flow' }));

      // Build the expected path from process.cwd() (which getRepoRoot walks) rather than from
      // the raw tempProjectDir. This avoids cross-platform path-canonicalization mismatches:
      // macOS may canonicalize /var -> /private/var, and Windows may preserve 8.3 short names
      // in tmpdir() that cwd() does or does not normalize. Either way, process.cwd() after
      // chdir matches what the implementation will see.
      const resolved = await resolveDefaultConfigPath();
      expect(resolved).toBe(resolve(process.cwd(), HOOK_CONFIG_JSON));
    });

    it('throws a clear error when the config file is missing from the repo root', async () => {
      await expect(resolveDefaultConfigPath()).rejects.toThrow(
        /--config was provided but \.sfdecomposer\.config\.json was not found/,
      );
    });
  });
});
