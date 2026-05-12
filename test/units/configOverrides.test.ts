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

    it('includes the actionable "Create the file in the repo root" remediation hint in the missing-config error', async () => {
      // Pins the back half of the error message that nudges the user toward the fix; the
      // existing test only checks the leading "was not found" segment.
      await expect(resolveDefaultConfigPath()).rejects.toThrow(/Create the file in the repo root or omit --config\./);
    });
  });

  // ---------------------------------------------------------------------------
  // Targeted mutation-coverage tests
  //
  // These tests close specific surviving mutants from the Stryker run on
  // src/helpers/configOverrides.ts. Each block names the mutant(s) it covers so
  // the intent is preserved if anyone later reorganises the file.
  // ---------------------------------------------------------------------------
  describe('mutation-gap closures', () => {
    describe('FORBIDDEN_OVERRIDE_KEYS', () => {
      // Kills the StringLiteral "" mutants on the FORBIDDEN_OVERRIDE_KEYS Set entries
      // (`metadataSuffixes`, `ignorePackageDirectories`). The existing "rejects forbidden
      // run-scope keys" test only covers the `manifest` entry.
      it('rejects "metadataSuffixes" inside an override entry', () => {
        const overrides = [
          { metadataTypes: ['flow'], metadataSuffixes: 'flow,permissionset' },
        ] as unknown as DecomposerOverride[];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 contains "metadataSuffixes", which is a run-scope option and cannot be set per metadata type.',
        );
      });

      it('rejects "ignorePackageDirectories" inside an override entry', () => {
        const overrides = [
          { metadataTypes: ['flow'], ignorePackageDirectories: 'force-app,my-package' },
        ] as unknown as DecomposerOverride[];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 contains "ignorePackageDirectories", which is a run-scope option and cannot be set per metadata type.',
        );
      });
    });

    describe('hasMetadataTypes / hasComponents gating in validateOverride', () => {
      // Kills the ConditionalExpression/EqualityOperator mutants on line 119
      // (`override.components.length > 0`). The override must reach the
      // "non-empty metadataTypes or components" guard even when an empty
      // `components: []` is supplied, which only happens when the length check is strict.
      it('rejects an override that supplies both an empty metadataTypes AND an empty components array', () => {
        const overrides: DecomposerOverride[] = [{ metadataTypes: [], components: [] }];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 must include a non-empty "metadataTypes" or "components" array.',
        );
      });

      it('does not validate components when components is supplied as an empty array (length > 0 short-circuits)', () => {
        // An empty components array combined with a populated metadataTypes must NOT cause
        // validateComponentEntries to run — proves the `length > 0` check is strict.
        const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], components: [] }];
        expect(() => validateOverrides(overrides)).not.toThrow();
      });

      it('does not validate metadataTypes when metadataTypes is supplied as an empty array (length > 0 short-circuits)', () => {
        // Symmetric case for the analogous `metadataTypes.length > 0` check on line 118.
        const overrides: DecomposerOverride[] = [{ metadataTypes: [], components: ['flow:My_Flow'] }];
        expect(() => validateOverrides(overrides)).not.toThrow();
      });
    });

    describe('validateOverrideValues error messages', () => {
      // Kills the StringLiteral / template-literal mutants in the decomposedFormat and
      // strategy error messages (lines 151 and 158). These mutants empty out either the
      // whole template literal or the `, ` join separator on the allowed-values list.
      it('includes the offending decomposedFormat value AND the allowed-values list joined by ", "', () => {
        const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], decomposedFormat: 'toml' }];
        const allowed = 'xml, json, yaml, json5';
        expect(() => validateOverrides(overrides)).toThrow(
          `Override at index 0 has invalid "decomposedFormat": "toml". Allowed values: ${allowed}.`,
        );
      });

      it('includes the offending strategy value AND the allowed-values list joined by ", "', () => {
        const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], strategy: 'one-file-per-flag' }];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 has invalid "strategy": "one-file-per-flag". Allowed values: unique-id, grouped-by-tag.',
        );
      });
    });

    describe('validateSplitTagsSpec edge-case mutants', () => {
      it('emits the exact "empty splitTags string" wording for an empty spec', () => {
        // Kills the ConditionalExpression `false` mutant on the empty-string guard at the
        // top of validateSplitTagsSpec (line 178). With the guard disabled, validation
        // continues into the `.split(',')` path and throws a different "empty rule" message;
        // pinning the exact phrasing here ensures the guard remains intact.
        expect(() => validateSplitTagsSpec('', 0)).toThrow('Override at index 0 has an empty "splitTags" string.');
      });

      it('trims rules before checking for empties so a whitespace-only rule still throws "contains an empty rule"', () => {
        // Kills the MethodExpression mutant on `rules.map(rule => rule.trim())` (line 182).
        // A rule that is whitespace-only must collapse to '' after the per-rule trim and
        // trigger the "contains an empty rule" branch; without the trim it would instead
        // fail the parts-length check with a different message.
        expect(() =>
          validateSplitTagsSpec('objectPermissions:split:object,   ,fieldPermissions:group:field', 0),
        ).toThrow('Override at index 0 "splitTags" contains an empty rule.');
      });

      it('parts-count error message names both allowed shapes (3-part and 4-part)', () => {
        // Kills the StringLiteral mutant on line 203 by pinning the remediation hint.
        expect(() => validateSplitTagsSpec('a:b', 0)).toThrow(
          'Override at index 0 "splitTags" rule "a:b" must have 3 or 4 colon-separated parts ("tag:mode:field" or "tag:path:mode:field").',
        );
      });

      it('does not flag a valid 3-part rule as having "empty parts"', () => {
        // Kills the ConditionalExpression mutant on (parts.length === 4 && !parts[1]) at
        // line 207. With that subclause stuck at `true`, a perfectly valid 3-part rule
        // would be reported as having empty parts.
        expect(() => validateSplitTagsSpec('objectPermissions:split:object', 0)).not.toThrow();
      });

      it('does not flag a valid 4-part rule with a populated path as having "empty parts"', () => {
        // Same line-207 mutant from a different angle: with the subclause always-true the
        // 4-part form would also misfire. parts[1] here is a non-empty path.
        expect(() => validateSplitTagsSpec('items:nested.items:group:label', 0)).not.toThrow();
      });

      it('emits the full invalid-mode error message including the allowed list', () => {
        // Kills the StringLiteral mutants on line 213 (the template literal and the join
        // separator). Tracks both the offending mode and the list-of-allowed-modes formatting.
        expect(() => validateSplitTagsSpec('actionCalls:explode:name', 0)).toThrow(
          'Override at index 0 "splitTags" rule "actionCalls:explode:name" has invalid mode "explode". Allowed values: split, group.',
        );
      });
    });

    describe('validateMultiLevelSpec edge-case mutants', () => {
      it('emits the exact "empty multiLevel string" wording for an empty string spec', () => {
        // Kills the ConditionalExpression `false` mutant on line 265.
        expect(() => validateMultiLevelSpec('', 0)).toThrow('Override at index 0 has an empty "multiLevel" string.');
      });

      it('drops empty segments produced by adjacent ";" separators before validating each rule', () => {
        // Kills the MethodExpression mutants on lines 269 and 271-272 that strip away
        // `.filter((rule) => rule.length > 0)` or the per-rule trim. Without the filter,
        // an empty segment would reach validateSingleMultiLevelRule and trip the parts-count
        // check instead of being silently skipped.
        expect(() =>
          validateMultiLevelSpec('botDialogs:botDialogs:developerName;;botSteps:botSteps:type', 0),
        ).not.toThrow();
      });

      it('drops whitespace-only segments after trimming', () => {
        // Kills the MethodExpression mutant on `.map((rule) => rule.trim())` (line 271).
        // Without the trim, ' ' is kept (length=1 > 0) and reaches the rule validator.
        expect(() => validateMultiLevelSpec(' ; botDialogs:botDialogs:developerName', 0)).not.toThrow();
      });

      it('rejects a whitespace-only entry in the array form', () => {
        // Kills the MethodExpression mutant on `entry.trim()` (line 259). Without the trim,
        // '   ' is treated as a valid non-empty string and reaches the rule validator,
        // which throws a different "exactly 3 colon-separated parts" message.
        expect(() => validateMultiLevelSpec(['botDialogs:botDialogs:developerName', '   '], 0)).toThrow(
          'Override at index 0 "multiLevel" array contains an empty or non-string entry.',
        );
      });

      it('trims array entries before deduplicating (pair-key dedup is whitespace-insensitive)', () => {
        // Kills the MethodExpression mutant on line 263 (`.map((rule) => rule.trim())` in
        // the array branch). If un-trimmed, the two rules below would produce different
        // pair keys (`botDialogs:botDialogs` vs `  botDialogs:botDialogs`) and dedup would
        // silently fail to trigger.
        expect(() =>
          validateMultiLevelSpec(['botDialogs:botDialogs:developerName', '  botDialogs:botDialogs:label  '], 0),
        ).toThrow(
          'Override at index 0 "multiLevel" has duplicate (file_pattern, root_to_strip) pair "botDialogs:botDialogs".',
        );
      });

      it('emits the full duplicate-pair error message verbatim', () => {
        // Kills the StringLiteral mutant on the duplicate-pair message (line 246).
        expect(() =>
          validateMultiLevelSpec(['botDialogs:botDialogs:developerName', 'botDialogs:botDialogs:label'], 0),
        ).toThrow(
          'Override at index 0 "multiLevel" has duplicate (file_pattern, root_to_strip) pair "botDialogs:botDialogs". Each pair may appear at most once per scope.',
        );
      });

      it('emits the parts-count error message including the canonical rule form hint', () => {
        // Kills the StringLiteral mutant on line 280.
        expect(() => validateMultiLevelSpec('items:items', 0)).toThrow(
          'Override at index 0 "multiLevel" rule "items:items" must have exactly 3 colon-separated parts ("<file_pattern>:<root_to_strip>:<unique_id_elements>").',
        );
      });

      it('trims colon-separated parts before checking for emptiness', () => {
        // Kills the MethodExpression mutant on `.map((part) => part.trim())` (line 276).
        // The middle part is " " (whitespace); only the trim turns it into "" so the
        // "empty parts" branch fires. Without the trim, " " is truthy and validation
        // continues, splitting " z" by comma and silently succeeding.
        expect(() => validateMultiLevelSpec('items: :z', 0)).toThrow(
          'Override at index 0 "multiLevel" rule "items: :z" has empty parts.',
        );
      });

      it('trims comma-separated unique-id entries before deduplicating', () => {
        // Kills the MethodExpression mutant on `.map((id) => id.trim())` (line 289).
        // Without the trim, "a" and " a" are different strings and the duplicate check
        // never fires.
        expect(() => validateMultiLevelSpec('items:items:a, a', 0)).toThrow(
          'Override at index 0 "multiLevel" rule "items:items:a, a" unique-id list has duplicate entry "a".',
        );
      });

      it('emits the empty multiLevel string error for a whitespace-only spec', () => {
        // Symmetric case for line 265 — kills the same ConditionalExpression mutant when
        // typeof check is satisfied but trim leaves an empty string.
        expect(() => validateMultiLevelSpec('   ', 0)).toThrow('Override at index 0 has an empty "multiLevel" string.');
      });
    });

    describe('validateMetadataTypeEntries / validateComponentEntries', () => {
      it('treats a whitespace-only metadata type as empty (kills metadataType.trim() mutant)', () => {
        // Kills the MethodExpression mutant on `metadataType.trim()` (line 306). Without
        // the trim, "   " === "" is false and the empty-string guard silently lets the
        // type through, the seenTypes set then accepts "   " as a valid metadata type.
        const overrides = [{ metadataTypes: ['   '] }] as unknown as DecomposerOverride[];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 contains an empty or non-string metadata type.',
        );
      });

      it('treats a whitespace-only component as empty (kills component.trim() mutant)', () => {
        // Kills the MethodExpression and StringLiteral mutants on line 320 (component.trim()
        // and the empty-string literal "" that drives the comparison).
        const overrides = [{ components: ['   '] }] as unknown as DecomposerOverride[];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 contains an empty or non-string component.',
        );
      });

      it('emits the full "invalid component key" error message including the canonical example', () => {
        // Kills the StringLiteral mutant on line 326 by pinning the remediation hint that
        // shows the expected `<metadataSuffix>:<fullName>` format.
        const overrides: DecomposerOverride[] = [{ components: ['flowMyFlow'] }];
        expect(() => validateOverrides(overrides)).toThrow(
          'Override at index 0 has invalid component key "flowMyFlow". Expected format: "<metadataSuffix>:<fullName>" (e.g. "permissionset:HR_Admin").',
        );
      });
    });

    describe('hasComponentOverridesForType internal `.some` semantics', () => {
      it('returns true when ONLY ONE of several component keys in an override targets the type', () => {
        // Kills the MethodExpression mutant on `override.components?.some(...)` (line 384)
        // which replaces the inner `.some` with `.every`. With `.every`, an override that
        // mixes prefixes (one matching the lookup type, others not) would return false.
        const overrides: DecomposerOverride[] = [{ components: ['permissionset:HR_Admin', 'flow:OtherEntry'] }];
        expect(hasComponentOverridesForType('permissionset', overrides)).toBe(true);
      });

      it('still returns true when the type prefix matches every component in an override', () => {
        const overrides: DecomposerOverride[] = [{ components: ['permissionset:A', 'permissionset:B'] }];
        expect(hasComponentOverridesForType('permissionset', overrides)).toBe(true);
      });
    });

    describe('loadOverridesFromConfig encoding', () => {
      let tempDir: string;

      beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'cfg-overrides-utf8-'));
      });

      afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
      });

      it('reads the config file as UTF-8 so non-ASCII override values round-trip intact', async () => {
        // Kills the StringLiteral mutant on the readFile('utf-8') encoding argument (line 63).
        // Without the explicit utf-8 encoding, readFile returns a Buffer and JSON.parse
        // would still work for ASCII -- but non-ASCII chars in a string value would either
        // throw or be replaced with replacement chars (depending on Node's default behavior),
        // breaking round-tripping. We assert exact equality of a non-ASCII splitTags spec.
        const configPath = join(tempDir, '.sfdecomposer.config.json');
        const exoticSplitTags = 'décisions:split:éname';
        await writeFile(
          configPath,
          JSON.stringify({
            overrides: [
              {
                metadataTypes: ['flow'],
                strategy: 'grouped-by-tag',
                splitTags: exoticSplitTags,
              },
            ],
          }),
          'utf-8',
        );
        const overrides = await loadOverridesFromConfig(configPath);
        expect(overrides).toHaveLength(1);
        expect(overrides[0].splitTags).toBe(exoticSplitTags);
      });
    });
  });
});
