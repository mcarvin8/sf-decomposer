'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { verifyMetadataTypes } from '../../src/core/verifyMetadataTypes.js';
import { toPortablePath } from '../../src/helpers/projectPath.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// Package directory paths written with `\` (e.g. jamessimone/apex-rollup's
// `plugins\CustomObjectRollupLogger`) only resolved on Windows: on macOS and Linux the backslash is
// an ordinary filename character, so the whole package directory was silently skipped there.
const PERMSET = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldPermissions>
        <editable>false</editable>
        <field>RollupLog__c.LoggedBy__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <label>Rollup Log Viewer</label>
</PermissionSet>
`;

describe('package directories written with backslashes', () => {
  it('converts backslash separators to forward slashes', () => {
    expect(toPortablePath('plugins\\CustomObjectRollupLogger')).toBe('plugins/CustomObjectRollupLogger');
    expect(toPortablePath('force-app/main')).toBe('force-app/main');
  });

  describe('on any platform', () => {
    let projectDir: string;
    let permsetDir: string;
    const log = vi.fn();
    const options = { metadataTypes: ['permissionset'], format: 'xml', ignoreDirs: undefined, log };

    beforeEach(async () => {
      projectDir = await mkdtemp(join(tmpdir(), 'backslash-package-dir-'));
      permsetDir = join(projectDir, 'plugins', 'CustomObjectRollupLogger', 'permissionsets');
      await mkdir(permsetDir, { recursive: true });
      await writeFile(join(permsetDir, 'RollupLogViewer.permissionset-meta.xml'), PERMSET);
      await writeFile(
        join(projectDir, SFDX_CONFIG_FILE),
        JSON.stringify({
          packageDirectories: [{ path: 'plugins\\CustomObjectRollupLogger', default: true }],
          sourceApiVersion: '68.0',
        }),
      );
      vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await rm(projectDir, { recursive: true, force: true });
    });

    it('decomposes, recomposes and verifies files in that package directory', async () => {
      await decomposeMetadataTypes({
        ...options,
        prepurge: false,
        postpurge: true,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
      });
      expect(await readdir(permsetDir)).not.toContain('RollupLogViewer.permissionset-meta.xml');

      await recomposeMetadataTypes({ ...options, postpurge: true });
      expect(await readFile(join(permsetDir, 'RollupLogViewer.permissionset-meta.xml'), 'utf-8')).toBe(PERMSET);

      const result = await verifyMetadataTypes({
        ...options,
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        manifest: undefined,
        overrides: undefined,
      });
      expect(result.metadata).toContain('permissionset');
      expect(result.drift).toEqual([]);
    });

    it('skips it with --ignore-package-directory given with backslashes too', async () => {
      await expect(
        decomposeMetadataTypes({
          ...options,
          ignoreDirs: ['plugins\\CustomObjectRollupLogger'],
          prepurge: false,
          postpurge: true,
          strategy: 'unique-id',
          decomposeNestedPerms: false,
        }),
      ).rejects.toThrow('No directories named permissionsets');
    });
  });
});
