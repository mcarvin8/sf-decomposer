'use strict';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  loadOverridesFromConfig,
  validateOverrides,
  getOverrideForType,
  resolveDecomposeOptionsForType,
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

    it('rejects an override with an empty metadataTypes array', () => {
      expect(() => validateOverrides([{ metadataTypes: [] } as unknown as DecomposerOverride])).toThrow(
        /non-empty "metadataTypes"/,
      );
    });

    it('rejects an override missing metadataTypes', () => {
      expect(() => validateOverrides([{} as unknown as DecomposerOverride])).toThrow(/non-empty "metadataTypes"/);
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
  });

  describe('getOverrideForType', () => {
    const overrides: DecomposerOverride[] = [
      { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
      { metadataTypes: ['permissionset', 'mutingpermissionset'], strategy: 'grouped-by-tag' },
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
      const overrides: DecomposerOverride[] = [
        { metadataTypes: ['flow'], decomposedFormat: 'yaml', prePurge: true },
      ];
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
      });
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
          overrides: [
            { metadataTypes: ['flow'] },
            { metadataTypes: ['flow'], decomposedFormat: 'yaml' },
          ],
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

      const resolved = await resolveDefaultConfigPath();
      expect(resolved).toBe(resolve(tempProjectDir, HOOK_CONFIG_JSON));
    });

    it('throws a clear error when the config file is missing from the repo root', async () => {
      await expect(resolveDefaultConfigPath()).rejects.toThrow(
        /--config was provided but \.sfdecomposer\.config\.json was not found/,
      );
    });
  });
});
