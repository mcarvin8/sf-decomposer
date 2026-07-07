'use strict';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getOverrideForComponent,
  getOverrideForType,
  hasComponentOverridesForType,
  loadConfigFile,
  loadOverridesFromConfig,
  parseComponentKey,
  parseConfigSuffixes,
  resolveDecomposeOptionsForComponent,
  resolveDecomposeOptionsForType,
  resolveDefaultConfigPath,
  validateConfigManifest,
  validateMultiLevelSpec,
  validateOverrides,
  validateSidecarElementsSpec,
  validateSplitTagsSpec,
  validateUniqueIdElementsSpec,
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

    it('accepts a well-formed uniqueIdElements spec (single element)', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['myCustomType'], uniqueIdElements: 'developerName' }];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a well-formed uniqueIdElements spec (multiple comma-separated elements)', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['myCustomType'], uniqueIdElements: 'developerName,apiName' },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a well-formed uniqueIdElements spec (compound key with +)', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['app'], uniqueIdElements: 'actionName+pageOrSobjectType+formFactor' },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects an empty uniqueIdElements string', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], uniqueIdElements: '' }];
      expect(() => validateOverrides(overrides)).toThrow(/empty "uniqueIdElements" string/);
    });

    it('rejects a uniqueIdElements string with an empty entry between commas', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], uniqueIdElements: 'developerName,,apiName' }];
      expect(() => validateOverrides(overrides)).toThrow(/"uniqueIdElements" contains an empty entry/);
    });

    it('accepts a well-formed sidecarElements spec (single pair)', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['externalServiceRegistration'], sidecarElements: 'schema:yaml' },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('accepts a well-formed sidecarElements spec (multiple pairs)', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['externalServiceRegistration'], sidecarElements: 'schema:yaml,wsdl:xml' },
      ];
      expect(() => validateOverrides(overrides)).not.toThrow();
    });

    it('rejects a malformed sidecarElements spec (missing extension)', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['externalServiceRegistration'], sidecarElements: 'schema' },
      ];
      expect(() => validateOverrides(overrides)).toThrow(/exactly 2 colon-separated parts/);
    });

    it('rejects an empty sidecarElements string', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['externalServiceRegistration'], sidecarElements: '' }];
      expect(() => validateOverrides(overrides)).toThrow(/empty "sidecarElements" string/);
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

  describe('validateUniqueIdElementsSpec', () => {
    it('accepts a single element name', () => {
      expect(() => validateUniqueIdElementsSpec('developerName', 0)).not.toThrow();
    });

    it('accepts multiple comma-separated elements', () => {
      expect(() => validateUniqueIdElementsSpec('developerName,apiName', 0)).not.toThrow();
    });

    it('accepts a compound key joined by "+"', () => {
      expect(() => validateUniqueIdElementsSpec('actionName+pageOrSobjectType+formFactor', 0)).not.toThrow();
    });

    it('accepts a mix of simple elements and compound keys', () => {
      expect(() =>
        validateUniqueIdElementsSpec(
          'actionName+pageOrSobjectType+formFactor+profile,actionName+pageOrSobjectType+formFactor',
          0,
        ),
      ).not.toThrow();
    });

    it('rejects an empty string', () => {
      expect(() => validateUniqueIdElementsSpec('', 0)).toThrow(/empty "uniqueIdElements" string/);
    });

    it('rejects a whitespace-only string', () => {
      expect(() => validateUniqueIdElementsSpec('   ', 0)).toThrow(/empty "uniqueIdElements" string/);
    });

    it('rejects an empty entry between commas', () => {
      expect(() => validateUniqueIdElementsSpec('developerName,,apiName', 0)).toThrow(
        /"uniqueIdElements" contains an empty entry/,
      );
    });

    it('rejects a trailing comma that produces an empty entry', () => {
      expect(() => validateUniqueIdElementsSpec('developerName,', 0)).toThrow(
        /"uniqueIdElements" contains an empty entry/,
      );
    });
  });

  describe('validateSidecarElementsSpec', () => {
    it('accepts a single element:extension pair', () => {
      expect(() => validateSidecarElementsSpec('schema:yaml', 0)).not.toThrow();
    });

    it('accepts multiple comma-separated pairs', () => {
      expect(() => validateSidecarElementsSpec('schema:yaml,wsdl:xml', 0)).not.toThrow();
    });

    it('rejects an empty spec', () => {
      expect(() => validateSidecarElementsSpec('', 0)).toThrow(/empty "sidecarElements" string/);
    });

    it('rejects a whitespace-only spec', () => {
      expect(() => validateSidecarElementsSpec('   ', 0)).toThrow(/empty "sidecarElements" string/);
    });

    it('rejects a pair with too few parts (no colon)', () => {
      expect(() => validateSidecarElementsSpec('schema', 0)).toThrow(/exactly 2 colon-separated parts/);
    });

    it('rejects a pair with too many parts (3 colons)', () => {
      expect(() => validateSidecarElementsSpec('schema:yaml:extra', 0)).toThrow(/exactly 2 colon-separated parts/);
    });

    it('rejects a pair with an empty element', () => {
      expect(() => validateSidecarElementsSpec(':yaml', 0)).toThrow(/empty parts/);
    });

    it('rejects a pair with an empty extension', () => {
      expect(() => validateSidecarElementsSpec('schema:', 0)).toThrow(/empty parts/);
    });

    it('rejects an empty pair between commas', () => {
      expect(() => validateSidecarElementsSpec('schema:yaml,,wsdl:xml', 0)).toThrow(/contains an empty pair/);
    });

    it('rejects duplicate element names', () => {
      expect(() => validateSidecarElementsSpec('schema:yaml,schema:json', 0)).toThrow(/duplicate element "schema"/);
    });

    it('tolerates surrounding whitespace in pairs', () => {
      expect(() => validateSidecarElementsSpec(' schema : yaml , wsdl : xml ', 0)).not.toThrow();
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

    it('resolves the earliest override when the same type appears in more than one (index build path)', () => {
      // `validateOverrides` normally forbids this, but the lookup itself doesn't re-validate, so
      // this exercises the index-building dedupe guard directly: first-seen override must win.
      const duplicated: DecomposerOverride[] = [
        { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
        { metadataTypes: ['flow'], decomposedFormat: 'json' },
      ];
      expect(getOverrideForType('flow', duplicated)).toBe(duplicated[0]);
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

    it('resolves the earliest override when the same component key appears in more than one (index build path)', () => {
      // `validateOverrides` normally forbids this, but the lookup itself doesn't re-validate, so
      // this exercises the index-building dedupe guard directly: first-seen override must win.
      const duplicated: DecomposerOverride[] = [
        { components: ['permissionset:HR_Admin'], strategy: 'grouped-by-tag' },
        { components: ['permissionset:HR_Admin'], strategy: 'unique-id' },
      ];
      expect(getOverrideForComponent('permissionset', 'HR_Admin', duplicated)).toBe(duplicated[0]);
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

    it('does not crash on a malformed component key with no colon (index build path)', () => {
      // `validateOverrides` normally rejects a colon-less component key before this is ever
      // reached, but the lookup itself doesn't re-validate, so this exercises the index's
      // colon-index guard directly rather than relying on that upstream validation.
      const malformed: DecomposerOverride[] = [{ components: ['no-colon-here'] }];
      expect(hasComponentOverridesForType('permissionset', malformed)).toBe(false);
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

    it('threads a type-scope uniqueIdElements through resolution', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['myCustomType'], uniqueIdElements: 'developerName,apiName' },
      ];
      expect(resolveDecomposeOptionsForType('myCustomType', base, overrides).uniqueIdElements).toBe(
        'developerName,apiName',
      );
    });

    it('returns undefined uniqueIdElements when no override sets one', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], decomposedFormat: 'yaml' }];
      expect(resolveDecomposeOptionsForType('flow', base, overrides).uniqueIdElements).toBeUndefined();
    });

    it('threads a type-scope sidecarElements through resolution', () => {
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['externalServiceRegistration'], sidecarElements: 'schema:json' },
      ];
      expect(resolveDecomposeOptionsForType('externalServiceRegistration', base, overrides).sidecarElements).toBe(
        'schema:json',
      );
    });

    it('returns undefined sidecarElements when no override sets one', () => {
      const overrides: DecomposerOverride[] = [{ metadataTypes: ['flow'], decomposedFormat: 'yaml' }];
      expect(resolveDecomposeOptionsForType('flow', base, overrides).sidecarElements).toBeUndefined();
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

    it('lets a component override replace a type-scoped uniqueIdElements', () => {
      const typeResolved = { ...base, uniqueIdElements: 'developerName' };
      const overrides: DecomposerOverride[] = [{ components: ['myType:Special'], uniqueIdElements: 'apiName,label' }];
      expect(resolveDecomposeOptionsForComponent('myType', 'Special', typeResolved, overrides).uniqueIdElements).toBe(
        'apiName,label',
      );
    });

    it('inherits a type-scoped uniqueIdElements when the component override does not set one', () => {
      const typeResolved = { ...base, uniqueIdElements: 'developerName' };
      const overrides: DecomposerOverride[] = [{ components: ['myType:Other'], decomposedFormat: 'yaml' }];
      expect(resolveDecomposeOptionsForComponent('myType', 'Other', typeResolved, overrides).uniqueIdElements).toBe(
        'developerName',
      );
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

    it('lets a component override replace a type-scoped sidecarElements', () => {
      const typeResolved = { ...base, sidecarElements: 'schema:yaml' };
      const overrides: DecomposerOverride[] = [
        { components: ['externalServiceRegistration:BankService'], sidecarElements: 'schema:json' },
      ];
      expect(
        resolveDecomposeOptionsForComponent('externalServiceRegistration', 'BankService', typeResolved, overrides)
          .sidecarElements,
      ).toBe('schema:json');
    });

    it('inherits a type-scoped sidecarElements when the component override does not set one', () => {
      const typeResolved = { ...base, sidecarElements: 'schema:yaml' };
      const overrides: DecomposerOverride[] = [
        { components: ['externalServiceRegistration:Other'], decomposedFormat: 'yaml' },
      ];
      expect(
        resolveDecomposeOptionsForComponent('externalServiceRegistration', 'Other', typeResolved, overrides)
          .sidecarElements,
      ).toBe('schema:yaml');
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

    it('chains the original JSON.parse error as the cause on invalid JSON', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, '{ not valid json');
      try {
        await loadOverridesFromConfig(configPath);
        throw new Error('expected loadOverridesFromConfig to throw, but it returned normally');
      } catch (err) {
        expect((err as Error).cause).toBeInstanceOf(Error);
      }
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

  describe('loadConfigFile', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'load-config-file-test-'));
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('throws when the file does not exist', async () => {
      const missingPath = join(tempDir, 'does-not-exist.json');
      await expect(loadConfigFile(missingPath)).rejects.toThrow(/Cannot read/);
    });

    it('chains the original fs error as the cause when the file does not exist', async () => {
      const missingPath = join(tempDir, 'does-not-exist.json');
      try {
        await loadConfigFile(missingPath);
        throw new Error('expected loadConfigFile to throw, but it returned normally');
      } catch (err) {
        expect((err as Error).cause).toBeInstanceOf(Error);
      }
    });

    it('throws on invalid JSON', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, '{ not valid json');
      await expect(loadConfigFile(configPath)).rejects.toThrow(/Failed to parse/);
    });

    it('chains the original JSON.parse error as the cause on invalid JSON', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, '{ not valid json');
      try {
        await loadConfigFile(configPath);
        throw new Error('expected loadConfigFile to throw, but it returned normally');
      } catch (err) {
        expect((err as Error).cause).toBeInstanceOf(Error);
      }
    });

    it('returns the parsed config when there are no overrides', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, JSON.stringify({ metadataSuffixes: 'flow', decomposedFormat: 'yaml' }));
      const config = await loadConfigFile(configPath);
      expect(config.metadataSuffixes).toBe('flow');
      expect(config.decomposedFormat).toBe('yaml');
      expect(config.overrides).toBeUndefined();
    });

    it('returns the parsed config with a valid overrides array', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(
        configPath,
        JSON.stringify({
          metadataSuffixes: 'flow',
          overrides: [{ metadataTypes: ['flow'], decomposedFormat: 'yaml' }],
        }),
      );
      const config = await loadConfigFile(configPath);
      expect(config.overrides).toHaveLength(1);
      expect(config.overrides![0].metadataTypes).toEqual(['flow']);
    });

    it('throws when overrides is not an array', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(configPath, JSON.stringify({ overrides: { metadataTypes: ['flow'] } }));
      await expect(loadConfigFile(configPath)).rejects.toThrow(/must be an array/);
    });

    it('propagates validation errors from validateOverrides', async () => {
      const configPath = join(tempDir, '.sfdecomposer.config.json');
      await writeFile(
        configPath,
        JSON.stringify({
          overrides: [{ metadataTypes: ['flow'] }, { metadataTypes: ['flow'], decomposedFormat: 'yaml' }],
        }),
      );
      await expect(loadConfigFile(configPath)).rejects.toThrow(/appears in more than one override/);
    });
  });

  describe('parseConfigSuffixes', () => {
    it('returns undefined for undefined input', () => {
      expect(parseConfigSuffixes(undefined)).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
      expect(parseConfigSuffixes('')).toBeUndefined();
    });

    it('returns undefined for a whitespace-only string', () => {
      expect(parseConfigSuffixes('   ')).toBeUndefined();
    });

    it('returns undefined for the "." sentinel', () => {
      expect(parseConfigSuffixes('.')).toBeUndefined();
    });

    it('returns undefined for "." surrounded by whitespace', () => {
      expect(parseConfigSuffixes('  .  ')).toBeUndefined();
    });

    it('returns a single-element array for a single suffix', () => {
      expect(parseConfigSuffixes('flow')).toEqual(['flow']);
    });

    it('splits a comma-separated list into a trimmed array', () => {
      expect(parseConfigSuffixes('flow, permissionset , labels')).toEqual(['flow', 'permissionset', 'labels']);
    });

    it('filters out empty slots between commas', () => {
      expect(parseConfigSuffixes('flow,,permissionset')).toEqual(['flow', 'permissionset']);
    });

    it('returns undefined when all entries are empty after filtering', () => {
      expect(parseConfigSuffixes(',  ,  ,')).toBeUndefined();
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

    it('chains the original access() error as the cause when the config file is missing', async () => {
      try {
        await resolveDefaultConfigPath();
        throw new Error('expected resolveDefaultConfigPath to throw, but it returned normally');
      } catch (err) {
        expect((err as Error).cause).toBeInstanceOf(Error);
      }
    });
  });

  describe('validateConfigManifest', () => {
    let tempProjectDir: string;
    const originalCwd = process.cwd();

    beforeEach(async () => {
      tempProjectDir = await mkdtemp(join(tmpdir(), 'validate-config-manifest-test-'));
      await writeFile(join(tempProjectDir, SFDX_PROJECT_FILE_NAME), JSON.stringify({ packageDirectories: [] }));
      process.chdir(tempProjectDir);
    });

    afterEach(async () => {
      process.chdir(originalCwd);
      await rm(tempProjectDir, { recursive: true, force: true });
    });

    it('returns the passed-in manifest unchanged when no configManifest is set', async () => {
      const warn = vi.fn();
      const result = await validateConfigManifest({
        configManifest: undefined,
        metadataTypes: undefined,
        manifest: 'manifest/package.xml',
        warn,
      });
      expect(result).toBe('manifest/package.xml');
      expect(warn).not.toHaveBeenCalled();
    });

    it('returns the passed-in manifest unchanged when the configManifest exists on disk', async () => {
      const manifestPath = join(tempProjectDir, 'manifest.xml');
      await writeFile(manifestPath, '<Package/>');
      const warn = vi.fn();
      const result = await validateConfigManifest({
        configManifest: 'manifest.xml',
        metadataTypes: undefined,
        manifest: 'cli-manifest.xml',
        warn,
      });
      expect(result).toBe('cli-manifest.xml');
      expect(warn).not.toHaveBeenCalled();
    });

    it('warns and falls back to undefined when configManifest is missing but metadataTypes are defined', async () => {
      const warn = vi.fn();
      const result = await validateConfigManifest({
        configManifest: 'missing-manifest.xml',
        metadataTypes: ['flow'],
        manifest: undefined,
        warn,
      });
      expect(result).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(/Config manifest "missing-manifest\.xml" not found on disk\. Falling back/),
      );
    });

    it('throws when configManifest is missing and no metadataTypes fallback is available', async () => {
      const warn = vi.fn();
      await expect(
        validateConfigManifest({
          configManifest: 'missing-manifest.xml',
          metadataTypes: undefined,
          manifest: undefined,
          warn,
        }),
      ).rejects.toThrow(/Config manifest "missing-manifest\.xml" not found on disk and no metadataSuffixes/);
      expect(warn).not.toHaveBeenCalled();
    });

    it('throws the exact remediation message and chains the original access() error as cause', async () => {
      const warn = vi.fn();
      try {
        await validateConfigManifest({
          configManifest: 'missing-manifest.xml',
          metadataTypes: undefined,
          manifest: undefined,
          warn,
        });
        throw new Error('expected validateConfigManifest to throw, but it returned normally');
      } catch (err) {
        expect((err as Error).message).toBe(
          'Config manifest "missing-manifest.xml" not found on disk and no metadataSuffixes are defined in the config. ' +
            'Ensure the manifest exists before running this command, or add metadataSuffixes to the config as a fallback.',
        );
        expect((err as Error).cause).toBeInstanceOf(Error);
      }
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

    describe('strict-message capture (kills mutants where toThrow(substring) was insufficient)', () => {
      // These tests assert the *exact* Error.message via toBe(...) rather than substring
      // matching. A Stryker mutant that converts one of these targeted guards into `false`
      // (skipping the early throw) lets the SUT fall through to a sibling guard which throws a
      // *different* message; toBe makes that divergence fatal so the mutant cannot survive.
      const captureMessage = (fn: () => unknown): string => {
        try {
          fn();
        } catch (err) {
          return (err as Error).message;
        }
        throw new Error('expected the function to throw, but it returned normally');
      };

      it('throws the exact "empty splitTags string" wording when spec is the empty string', () => {
        // Targets L178 ConditionalExpression -> false. If the early guard is skipped, the SUT
        // falls through to the per-rule loop and throws "...contains an empty rule." instead.
        const message = captureMessage(() => validateSplitTagsSpec('', 0));
        expect(message).toBe('Override at index 0 has an empty "splitTags" string.');
      });

      it('throws the exact "empty splitTags string" wording for a whitespace-only spec', () => {
        // Same guard; a pure-whitespace spec still resolves to trim()==='' and must be caught
        // by the early guard so the wording stays "empty splitTags string", not "empty rule".
        const message = captureMessage(() => validateSplitTagsSpec('   \t  ', 0));
        expect(message).toBe('Override at index 0 has an empty "splitTags" string.');
      });

      it('throws the exact "must have 3 or 4 colon-separated parts" wording for a 2-part rule', () => {
        // Targets L207 ConditionalExpression -> true. Mutating `(parts.length === 4 && !parts[1])`
        // to `true` would short-circuit a 3-part rule into the "empty parts" branch; this assertion
        // pins the SUT to the correct part-count error for a 2-part rule (must throw the "3 or 4"
        // wording), which is unaffected by the L207 mutant but provides redundant pinning.
        const message = captureMessage(() => validateSplitTagsSpec('Decision:split', 0));
        expect(message).toBe(
          'Override at index 0 "splitTags" rule "Decision:split" must have 3 or 4 colon-separated parts ' +
            '("tag:mode:field" or "tag:path:mode:field").',
        );
      });

      it('throws the exact "has empty parts" wording when the 4-part path segment is blank', () => {
        // Targets L207 ConditionalExpression -> true / false. The `(parts.length === 4 && !parts[1])`
        // sub-expression is only reachable for 4-part rules with an empty path segment. With this
        // exact-message assertion, mutating that sub-expression to either true or false changes
        // which branch fires (or which message is emitted) and breaks the test.
        const message = captureMessage(() => validateSplitTagsSpec('Decision::split:label', 0));
        expect(message).toBe('Override at index 0 "splitTags" rule "Decision::split:label" has empty parts.');
      });

      it('throws the exact "empty multiLevel array" wording for an empty array spec', () => {
        // Targets normalizeMultiLevelRules. Mutating the empty-array branch to false would let
        // the SUT continue and return an empty `[]`, with no throw at all.
        const message = captureMessage(() => validateMultiLevelSpec([], 0));
        expect(message).toBe('Override at index 0 has an empty "multiLevel" array.');
      });

      it('throws the exact "empty or non-string entry" wording for a whitespace-only array entry', () => {
        // Targets L259 ConditionalExpression -> false. Skipping the per-entry guard lets the SUT
        // fall through to validateSingleMultiLevelRule which throws "must have exactly 3" instead.
        const message = captureMessage(() => validateMultiLevelSpec(['valid:Root:id', '   '], 0));
        expect(message).toBe('Override at index 0 "multiLevel" array contains an empty or non-string entry.');
      });

      it('throws the exact "empty or non-string entry" wording for a non-string array entry', () => {
        // Same guard as above but covers the `typeof entry !== 'string'` half of the OR.
        const message = captureMessage(() => validateMultiLevelSpec(['valid:Root:id', 123 as unknown as string], 0));
        expect(message).toBe('Override at index 0 "multiLevel" array contains an empty or non-string entry.');
      });

      it('throws the exact "empty multiLevel string" wording for an empty string spec', () => {
        // Targets L265 ConditionalExpression -> false. Skipping this branch lets the SUT
        // continue with `''.split(';').map(trim).filter(len>0)` -> []`, then iterate nothing,
        // so the function returns silently without throwing -- captureMessage would re-throw.
        const message = captureMessage(() => validateMultiLevelSpec('', 0));
        expect(message).toBe('Override at index 0 has an empty "multiLevel" string.');
      });

      it('throws the exact "empty or non-string metadata type" wording for whitespace-only entry', () => {
        // Targets L306 ConditionalExpression -> false. Skipping this branch lets the SUT fall
        // through to the duplicate-type check or proceed silently, producing no throw at all.
        const message = captureMessage(() =>
          validateOverrides([{ metadataTypes: ['flow', '   '] } as unknown as DecomposerOverride]),
        );
        expect(message).toBe('Override at index 0 contains an empty or non-string metadata type.');
      });

      it('throws the exact "empty or non-string metadata type" wording for a non-string entry', () => {
        // Same guard, covering the `typeof metadataType !== 'string'` half of the OR.
        const message = captureMessage(() =>
          validateOverrides([{ metadataTypes: ['flow', 42 as unknown as string] } as unknown as DecomposerOverride]),
        );
        expect(message).toBe('Override at index 0 contains an empty or non-string metadata type.');
      });

      it('throws the exact "empty rule" wording for a splitTags spec with a trailing comma', () => {
        // Targets L178/L186. With L178 mutated to false, the SUT still enters the per-rule loop
        // for a non-empty spec; this case asserts the specific "empty rule" message lands.
        const message = captureMessage(() => validateSplitTagsSpec('Decision:split:label,', 0));
        expect(message).toBe('Override at index 0 "splitTags" contains an empty rule.');
      });

      it('throws the exact "duplicate tag" wording when the same tag appears twice', () => {
        // Pins the duplicate-tag branch with its full remediation hint.
        const message = captureMessage(() => validateSplitTagsSpec('Decision:split:label,Decision:group:label2', 0));
        expect(message).toBe(
          'Override at index 0 "splitTags" contains duplicate tag "Decision". Each tag may appear at most once.',
        );
      });

      it('throws the exact "invalid mode" wording with the allowed values listed', () => {
        // Pins the mode-allow-list branch.
        const message = captureMessage(() => validateSplitTagsSpec('Decision:foo:label', 0));
        expect(message).toBe(
          'Override at index 0 "splitTags" rule "Decision:foo:label" has invalid mode "foo". Allowed values: split, group.',
        );
      });

      it('rejects a non-string splitTags spec via the same "empty" wording as an empty string', () => {
        // Kills the ConditionalExpression mutant that replaces `typeof spec !== 'string'` with
        // `false`: without this half of the guard, a non-string spec reaches `spec.trim()` and
        // throws a native TypeError instead of the intended message.
        const message = captureMessage(() => validateSplitTagsSpec(123 as unknown as string, 0));
        expect(message).toBe('Override at index 0 has an empty "splitTags" string.');
      });

      it('rejects a non-string multiLevel spec via the same "empty" wording as an empty string', () => {
        // Same guard, in normalizeMultiLevelRules' single-string branch.
        const message = captureMessage(() => validateMultiLevelSpec(123 as unknown as string, 0));
        expect(message).toBe('Override at index 0 has an empty "multiLevel" string.');
      });

      it('rejects a non-string uniqueIdElements spec via the same "empty" wording as an empty string', () => {
        const message = captureMessage(() => validateUniqueIdElementsSpec(123 as unknown as string, 0));
        expect(message).toBe('Override at index 0 has an empty "uniqueIdElements" string.');
      });

      it('rejects a non-string sidecarElements spec via the same "empty" wording as an empty string', () => {
        const message = captureMessage(() => validateSidecarElementsSpec(123 as unknown as string, 0));
        expect(message).toBe('Override at index 0 has an empty "sidecarElements" string.');
      });

      it('trims whitespace from each array-form multiLevel rule before validating', () => {
        // Kills the MethodExpression mutant that replaces `rule.trim()` with `rule` in
        // normalizeMultiLevelRules' array branch. The parts themselves parse the same either
        // way (validateSingleMultiLevelRule trims per-part), but the raw `rule` variable is
        // embedded verbatim in this error message, so an untrimmed rule leaks stray whitespace
        // into the quoted text.
        const message = captureMessage(() => validateMultiLevelSpec([' bad-rule '], 0));
        expect(message).toBe(
          'Override at index 0 "multiLevel" rule "bad-rule" must have exactly 3 colon-separated parts ' +
            '("<file_pattern>:<root_to_strip>:<unique_id_elements>").',
        );
      });

      it('treats a whitespace-only uniqueIdElements entry as empty', () => {
        // Kills the MethodExpression mutant that replaces `e.trim()` with `e`: without trimming,
        // a whitespace-only entry between commas is not strictly `''` and slips through unnoticed.
        const message = captureMessage(() => validateUniqueIdElementsSpec('developerName, ,apiName', 0));
        expect(message).toBe('Override at index 0 "uniqueIdElements" contains an empty entry.');
      });

      it('trims whitespace from each sidecarElements pair before validating', () => {
        // Kills the MethodExpression mutant that replaces `pair.trim()` with `pair`. The raw
        // `pair` variable is embedded verbatim in this error message.
        const message = captureMessage(() => validateSidecarElementsSpec(' bad ', 0));
        expect(message).toBe(
          'Override at index 0 "sidecarElements" pair "bad" must have exactly 2 colon-separated parts ' +
            '("<element>:<extension>").',
        );
      });

      it('trims whitespace around each sidecarElements colon-separated part so equivalent elements collide', () => {
        // Kills the MethodExpression mutant that replaces `part.trim()` with `part`: without
        // trimming, "schema" and "schema " (with a stray space from the split) would not
        // compare equal and the duplicate would go undetected.
        const message = captureMessage(() => validateSidecarElementsSpec('schema:yaml,schema :json', 0));
        expect(message).toBe(
          'Override at index 0 "sidecarElements" contains duplicate element "schema". Each element may appear at most once.',
        );
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
