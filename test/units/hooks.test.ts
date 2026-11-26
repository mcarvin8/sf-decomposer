import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Hook } from '@oclif/core';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

const { recomposeSpy, decomposeSpy } = vi.hoisted(() => ({
  recomposeSpy: vi.fn(async (_options: unknown) => undefined),
  decomposeSpy: vi.fn(async (_options: unknown) => undefined),
}));
vi.mock('../../src/core/recomposeMetadataTypes.js', () => ({ recomposeMetadataTypes: recomposeSpy }));
vi.mock('../../src/core/decomposeMetadataTypes.js', () => ({ decomposeMetadataTypes: decomposeSpy }));

import { HOOK_CONFIG_JSON } from '../../src/helpers/constants.js';
import type { ConfigFile } from '../../src/helpers/types.js';
import { prerun } from '../../src/hooks/prerun.js';
import { scopedPostRetrieve } from '../../src/hooks/scopedPostRetrieve.js';
import { sfdxHardisStart } from '../../src/hooks/sfdxHardisStart.js';
import { buildRecomposeOptions, HARDIS_RECOMPOSED_ENV } from '../../src/hooks/shared/hookConfig.js';

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

function runPostRetrieve(status?: string): Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: the hook reads only result.retrieveResult.response.status.
  return scopedPostRetrieve.call(context, { result: { retrieveResult: { response: { status } } } } as any);
}

describe('hooks', () => {
  let repo: string;
  let cwdSpy: MockInstance<typeof process.cwd>;

  async function writeConfig(config: Partial<ConfigFile>): Promise<void> {
    await writeFile(join(repo, HOOK_CONFIG_JSON), JSON.stringify(config));
  }

  beforeEach(async () => {
    repo = await mkdtemp(join(tmpdir(), 'sfd-hooks-'));
    await writeFile(join(repo, 'sfdx-project.json'), '{"packageDirectories":[{"path":"force-app"}]}');
    // Not process.chdir(): Stryker runs the tests in worker threads, which don't support it.
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(repo);
    delete process.env[HARDIS_RECOMPOSED_ENV];
    logs.length = 0;
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
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
      process.env[HARDIS_RECOMPOSED_ENV] = repo;
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
      expect(process.env[HARDIS_RECOMPOSED_ENV]).toBe(repo);

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

  describe('scopedPostRetrieve', () => {
    it('ignores a retrieve without a status', async () => {
      await writeConfig({ metadataSuffixes: 'flow' });
      await runPostRetrieve(undefined);
      expect(decomposeSpy).not.toHaveBeenCalled();
    });

    it('does nothing without a config file', async () => {
      await runPostRetrieve('Succeeded');
      expect(decomposeSpy).not.toHaveBeenCalled();
    });

    it('decomposes with the config settings', async () => {
      await writeConfig({
        metadataSuffixes: 'flow',
        prePurge: true,
        decomposedFormat: 'yaml',
        strategy: 'grouped-by-tag',
        decomposeNestedPermissions: true,
        updateForceignore: true,
        updateGitattributes: true,
      });
      await runPostRetrieve('Succeeded');
      expect(decomposeSpy).toHaveBeenCalledOnce();
      expect(decomposeSpy.mock.calls[0][0]).toMatchObject({
        metadataTypes: ['flow'],
        prepurge: true,
        postpurge: false,
        format: 'yaml',
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
        updateForceignore: true,
        updateGitattributes: true,
      });
    });

    it('uses the defaults for unset settings', async () => {
      await writeConfig({ manifest: 'manifest/package.xml' });
      await runPostRetrieve('Succeeded');
      expect(decomposeSpy.mock.calls[0][0]).toMatchObject({
        metadataTypes: undefined,
        manifest: 'manifest/package.xml',
        prepurge: false,
        format: 'xml',
        strategy: 'unique-id',
        decomposeNestedPerms: false,
        updateForceignore: false,
        updateGitattributes: false,
      });
    });

    it('honors skipPostRetrieveHook', async () => {
      await writeConfig({ metadataSuffixes: 'flow', skipPostRetrieveHook: true });
      await runPostRetrieve('Succeeded');
      expect(decomposeSpy).not.toHaveBeenCalled();
    });

    it('does nothing when the config names no types or manifest', async () => {
      await writeConfig({});
      await runPostRetrieve('Succeeded');
      expect(decomposeSpy).not.toHaveBeenCalled();
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
