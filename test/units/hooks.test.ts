import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Hook } from '@oclif/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { recomposeSpy } = vi.hoisted(() => ({ recomposeSpy: vi.fn(async (_options: unknown) => undefined) }));
vi.mock('../../src/core/recomposeMetadataTypes.js', () => ({ recomposeMetadataTypes: recomposeSpy }));

import { HOOK_CONFIG_JSON } from '../../src/helpers/constants.js';
import type { ConfigFile } from '../../src/helpers/types.js';
import { prerun } from '../../src/hooks/prerun.js';
import { sfdxHardisStart } from '../../src/hooks/sfdxHardisStart.js';
import { buildRecomposeOptions, HARDIS_RECOMPOSED_ENV } from '../../src/hooks/shared/recomposeConfig.js';

const logs: string[] = [];
const context = { log: (msg: string) => logs.push(msg) } as unknown as Hook.Context;

function runPrerun(commandId: string): Promise<unknown> {
  // biome-ignore lint/suspicious/noExplicitAny: oclif's prerun options carry far more than the hook reads.
  return prerun.call(context, { Command: { id: commandId } } as any);
}

function runHardisStart(checkOnly: boolean): Promise<void> {
  return sfdxHardisStart.call(context, {
    payloadVersion: 1,
    event: checkOnly ? 'sfdx-hardis:validation-start' : 'sfdx-hardis:deployment-start',
    commandId: 'hardis:project:deploy:smart',
    reportDir: 'hardis-report',
    currentBranch: null,
    pullRequest: null,
    org: { username: null },
    data: { checkOnly },
    // biome-ignore lint/suspicious/noExplicitAny: the oclif Config is never read by the hook.
    config: {} as any,
  });
}

describe('deploy hooks', () => {
  let repo: string;
  const originalCwd = process.cwd();

  async function writeConfig(config: Partial<ConfigFile>): Promise<void> {
    await writeFile(join(repo, HOOK_CONFIG_JSON), JSON.stringify(config));
  }

  beforeEach(async () => {
    repo = await mkdtemp(join(tmpdir(), 'sfd-hooks-'));
    await writeFile(join(repo, 'sfdx-project.json'), '{"packageDirectories":[{"path":"force-app"}]}');
    process.chdir(repo);
    delete process.env[HARDIS_RECOMPOSED_ENV];
    logs.length = 0;
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    delete process.env[HARDIS_RECOMPOSED_ENV];
    await rm(repo, { recursive: true, force: true });
  });

  describe('prerun', () => {
    it('ignores commands other than deploy start/validate', async () => {
      await writeConfig({ metadataSuffixes: 'flow' });
      await runPrerun('project:retrieve:start');
      expect(recomposeSpy).not.toHaveBeenCalled();
    });

    it('does nothing without a config file', async () => {
      await runPrerun('project:deploy:start');
      expect(recomposeSpy).not.toHaveBeenCalled();
    });

    it('recomposes the configured types', async () => {
      await writeConfig({ metadataSuffixes: 'flow, permissionset', postPurge: true });
      await runPrerun('project:deploy:validate');
      expect(recomposeSpy).toHaveBeenCalledOnce();
      expect(recomposeSpy.mock.calls[0][0]).toMatchObject({
        metadataTypes: ['flow', 'permissionset'],
        postpurge: true,
      });
    });

    it('honors skipPrerunHook', async () => {
      await writeConfig({ metadataSuffixes: 'flow', skipPrerunHook: true });
      await runPrerun('project:deploy:start');
      expect(recomposeSpy).not.toHaveBeenCalled();
    });

    it('skips when sfdx-hardis already recomposed this repo', async () => {
      await writeConfig({ metadataSuffixes: 'flow', sfdxHardis: true });
      process.env[HARDIS_RECOMPOSED_ENV] = process.cwd();
      await runPrerun('project:deploy:start');
      expect(recomposeSpy).not.toHaveBeenCalled();
    });

    it('still recomposes when the marker names another repo', async () => {
      await writeConfig({ metadataSuffixes: 'flow', sfdxHardis: true });
      process.env[HARDIS_RECOMPOSED_ENV] = join(repo, 'elsewhere');
      await runPrerun('project:deploy:start');
      expect(recomposeSpy).toHaveBeenCalledOnce();
    });
  });

  describe('sfdx-hardis start events', () => {
    it('does nothing without a config file', async () => {
      await runHardisStart(false);
      expect(recomposeSpy).not.toHaveBeenCalled();
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBeUndefined();
    });

    it('does nothing unless sfdxHardis is true', async () => {
      await writeConfig({ metadataSuffixes: 'flow' });
      await runHardisStart(false);
      expect(recomposeSpy).not.toHaveBeenCalled();
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBeUndefined();
    });

    it('does nothing when the config names no types or manifest', async () => {
      await writeConfig({ sfdxHardis: true });
      await runHardisStart(true);
      expect(recomposeSpy).not.toHaveBeenCalled();
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBeUndefined();
    });

    it('recomposes once across the hardis event and the child deploy prerun', async () => {
      await writeConfig({ metadataSuffixes: 'flow', sfdxHardis: true });
      await runHardisStart(true);
      expect(recomposeSpy).toHaveBeenCalledOnce();
      expect(logs.some((msg) => msg.includes('sfdx-hardis validation'))).toBe(true);
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBe(process.cwd());

      await runPrerun('project:deploy:validate');
      expect(recomposeSpy).toHaveBeenCalledOnce();
    });

    it('logs a deployment for deployment-start', async () => {
      await writeConfig({ manifest: 'manifest/package.xml', sfdxHardis: true });
      await runHardisStart(false);
      expect(recomposeSpy.mock.calls[0][0]).toMatchObject({ manifest: 'manifest/package.xml' });
      expect(logs.some((msg) => msg.includes('sfdx-hardis deployment'))).toBe(true);
    });

    it('leaves the marker unset when the recompose fails, so the deploy prerun retries', async () => {
      await writeConfig({ metadataSuffixes: 'flow', sfdxHardis: true });
      recomposeSpy.mockRejectedValueOnce(new Error('boom'));
      await expect(runHardisStart(false)).rejects.toThrow('boom');
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBeUndefined();
    });
  });

  describe('buildRecomposeOptions', () => {
    it('splits ignored package directories and drops empty entries', () => {
      const options = buildRecomposeOptions(
        { metadataSuffixes: 'flow,,', ignorePackageDirectories: 'a, b,' } as ConfigFile,
        () => undefined,
      );
      expect(options).toMatchObject({ metadataTypes: ['flow'], ignoreDirs: ['a', 'b'], postpurge: false });
    });
  });
});
