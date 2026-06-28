'use strict';

import { cp, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { getMultiLevelDefault } from '../../src/metadata/getMultiLevelDefault.js';
import { multiLevelDefaults } from '../../src/metadata/multiLevelDefaults.js';
import { compareDirectories } from '../utils/compareDirectories.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

describe('multiLevel defaults registry', () => {
  it('exposes the bot default with the documented rule shape', () => {
    expect(getMultiLevelDefault('bot')).toEqual(['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type']);
  });

  it('still exposes the loyaltyProgramSetup default after the inline rule was migrated', () => {
    expect(getMultiLevelDefault('loyaltyProgramSetup')).toEqual([
      'programProcesses:programProcesses:parameterName,ruleName',
    ]);
  });

  it('returns undefined for a metadata suffix with no default', () => {
    expect(getMultiLevelDefault('permissionset')).toBeUndefined();
    expect(getMultiLevelDefault('flow')).toBeUndefined();
    expect(getMultiLevelDefault('not_a_real_type')).toBeUndefined();
  });

  it('every registered rule has the <file_pattern>:<root_to_strip>:<unique_id_elements> shape', () => {
    for (const [suffix, rules] of Object.entries(multiLevelDefaults)) {
      expect(Array.isArray(rules), `rules for "${suffix}" must be a string[]`).toBe(true);
      expect(rules.length, `rules for "${suffix}" must not be empty`).toBeGreaterThan(0);
      for (const rule of rules) {
        const parts = rule.split(':');
        expect(parts.length, `rule "${rule}" for "${suffix}" must have exactly three colon-separated parts`).toBe(3);
        for (const part of parts) {
          expect(part.length, `rule "${rule}" for "${suffix}" has an empty segment`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('Bot multi-level default applied without explicit overrides', () => {
  let tempProjectDir: string;
  let packageDir: string;
  let botRoot: string;
  const fixtureDir: string = resolve('fixtures/package-dir-2');
  const originalCwd = process.cwd();

  const sfdxConfig = {
    packageDirectories: [{ path: 'package', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeEach(async () => {
    tempProjectDir = await mkdtemp(join(tmpdir(), 'bot-default-multilevel-'));
    packageDir = join(tempProjectDir, 'package');
    botRoot = join(packageDir, 'bots', 'Sample_Chat_Bot');

    await cp(fixtureDir, packageDir, { recursive: true, force: true });
    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(sfdxConfig, null, 2));
    process.chdir(tempProjectDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('applies the built-in bot multi-level rules when no override is supplied (unique-id strategy)', async () => {
    const log = vi.fn();
    await decomposeMetadataTypes({
      metadataTypes: ['bot'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log,
    });

    // Outer rule (botDialogs:botDialogs:developerName) gives every dialog its own subdir.
    const dialogEntries = await readdir(join(botRoot, 'v1', 'botDialogs'), { withFileTypes: true });
    const dialogDirs = dialogEntries.filter((e) => e.isDirectory()).map((e) => e.name);
    expect(dialogDirs).toEqual(
      expect.arrayContaining(['Welcome', 'Main_Menu', 'End_Chat', 'Confused', 'Transfer_To_Agent']),
    );

    // Inner rule (botSteps:botSteps:type) splits each dialog's steps into per-step shards.
    const welcomeStepEntries = await readdir(join(botRoot, 'v1', 'botDialogs', 'Welcome', 'botSteps'), {
      withFileTypes: true,
    });
    expect(welcomeStepEntries.length).toBeGreaterThan(1);

    // Round-trip: the recomposer must reproduce the canonical fixture byte-for-byte.
    await recomposeMetadataTypes({
      metadataTypes: ['bot'],
      postpurge: true,
      ignoreDirs: undefined,
      log,
    });
    await compareDirectories(fixtureDir, packageDir);
  });

  it('does not apply the multi-level default when strategy is grouped-by-tag', async () => {
    const log = vi.fn();
    await decomposeMetadataTypes({
      metadataTypes: ['bot'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'grouped-by-tag',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log,
    });

    // grouped-by-tag does not create per-dialog subdirectories. The botDialogs/
    // tree should contain only files (no nested directories named after dialogs).
    const dialogEntries = await readdir(join(botRoot, 'v1', 'botDialogs'), { withFileTypes: true }).catch(() => []);
    const subdirs = dialogEntries.filter((e) => e.isDirectory());
    expect(subdirs).toHaveLength(0);
  });

  it('honors a user-supplied multiLevel override when one is provided', async () => {
    const log = vi.fn();
    // Use a single rule (only outer split, no inner step split) and verify it wins
    // over the built-in two-rule default.
    await decomposeMetadataTypes({
      metadataTypes: ['bot'],
      prepurge: true,
      postpurge: true,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      overrides: [
        {
          components: ['bot:Sample_Chat_Bot'],
          multiLevel: 'botDialogs:botDialogs:developerName',
        },
      ],
      log,
    });

    // Outer rule still produces per-dialog dirs.
    const welcomeStepsDir = join(botRoot, 'v1', 'botDialogs', 'Welcome', 'botSteps');
    const welcomeStepEntries = await readdir(welcomeStepsDir, { withFileTypes: true });
    // The default's inner rule (`botSteps:botSteps:type`) would split each step
    // into a per-type subdirectory (e.g. botSteps/Message/, botSteps/Navigation/).
    // Under the user's single-rule override the inner split is skipped, so
    // botSteps/ should contain only files (the unique-id shards), no subdirs.
    const subdirs = welcomeStepEntries.filter((e) => e.isDirectory());
    expect(
      subdirs,
      `user single-rule override should suppress the inner botSteps:type split (got ${subdirs.map((d) => d.name).join(', ')})`,
    ).toHaveLength(0);
  });
});
