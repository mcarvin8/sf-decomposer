'use strict';

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAIN_HELP, run } from '../../src/cli/run.js';

type Captured = { stdout: string; stderr: string; code: number };

async function cli(...argv: string[]): Promise<Captured> {
  let stdout = '';
  let stderr = '';
  const code = await run(argv, {
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  });
  return { stdout, stderr, code };
}

describe('sf-decomposer CLI: help, version, and usage errors', () => {
  it('prints the main help and exits 0 for --help and -h', async () => {
    for (const flag of ['--help', '-h']) {
      const { stdout, code } = await cli(flag);
      expect(stdout).toBe(`${MAIN_HELP}\n`);
      expect(code).toBe(0);
    }
  });

  it('prints the main help and exits 1 with no command', async () => {
    const { stdout, code } = await cli();
    expect(stdout).toContain('Usage: sf-decomposer <command>');
    expect(code).toBe(1);
  });

  it('prints the package version for --version and -v', async () => {
    const pkg = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf-8')) as { version: string };
    for (const flag of ['--version', '-v']) {
      const { stdout, code } = await cli(flag);
      expect(stdout).toBe(`${pkg.version}\n`);
      expect(code).toBe(0);
    }
  });

  it('prints per-command help with each command option', async () => {
    const decompose = await cli('decompose', '--help');
    expect(decompose.code).toBe(0);
    expect(decompose.stdout).toContain('Usage: sf-decomposer decompose');
    expect(decompose.stdout).toContain('--update-forceignore');

    const recompose = await cli('recompose', '-h');
    expect(recompose.stdout).toContain('Usage: sf-decomposer recompose');
    expect(recompose.stdout).not.toContain('--strategy');

    const verify = await cli('verify', '--help');
    expect(verify.stdout).toContain('Never changes your files');
    expect(verify.stdout).toContain('--strategy');
  });

  it('rejects an unknown command', async () => {
    const { stderr, code } = await cli('explode');
    expect(stderr).toBe('Unknown command "explode". Expected decompose, recompose, or verify.\n');
    expect(code).toBe(1);
  });

  it('rejects options a command does not accept, without a stack trace', async () => {
    const { stderr, code } = await cli('recompose', '-m', 'flow', '--strategy', 'unique-id');
    expect(stderr).toContain("Unknown option '--strategy'");
    expect(stderr).not.toContain('Error:');
    expect(code).toBe(1);
  });

  it('rejects an invalid --format or --strategy', async () => {
    const format = await cli('decompose', '-m', 'flow', '-f', 'pdf');
    expect(format.stderr).toBe('Invalid --format "pdf". Expected one of: xml, json, yaml, json5.\n');
    expect(format.code).toBe(1);

    const strategy = await cli('verify', '-m', 'flow', '-s', 'random');
    expect(strategy.stderr).toBe('Invalid --strategy "random". Expected one of: unique-id, grouped-by-tag.\n');
    expect(strategy.code).toBe(1);
  });

  it('rejects a manifest path that does not exist', async () => {
    const { stderr, code } = await cli('recompose', '-x', 'no/such/package.xml');
    expect(stderr).toBe('Manifest file not found: no/such/package.xml\n');
    expect(code).toBe(1);
  });

  it('requires a metadata type, manifest, or config for every command', async () => {
    for (const command of ['decompose', 'recompose', 'verify']) {
      const { stderr, code } = await cli(command);
      expect(stderr).toContain('Either --metadata-type (-m) or --manifest (-x) must be provided');
      expect(code).toBe(1);
    }
  });
});

describe('sf-decomposer CLI: commands on a real project', () => {
  let projectDir: string;
  let original: string;

  beforeAll(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'cli-test-'));
    await cp(resolve('fixtures/package-dir-1'), join(projectDir, 'force-app'), { recursive: true });
    await writeFile(
      join(projectDir, 'sfdx-project.json'),
      JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }] }),
    );
    original = await readFile(join(projectDir, 'force-app/permissionsets/HR_Admin.permissionset-meta.xml'), 'utf-8');
  });

  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it('decomposes, then recomposes back to the original file', async () => {
    const decompose = await cli('decompose', '-m', 'permissionset');
    expect(decompose.code).toBe(0);
    expect(decompose.stdout).toContain('All metadata files have been decomposed for the metadata type: permissionset');

    const recompose = await cli('recompose', '-m', 'permissionset', '--postpurge');
    expect(recompose.code).toBe(0);
    expect(recompose.stdout).toContain('All metadata files have been recomposed for the metadata type: permissionset');
    expect(await readFile(join(projectDir, 'force-app/permissionsets/HR_Admin.permissionset-meta.xml'), 'utf-8')).toBe(
      original,
    );
  });

  it('prints the result as JSON on stdout with --json and sends logs to stderr', async () => {
    const { stdout, stderr, code } = await cli('verify', '-m', 'permissionset', '--json');
    expect(code).toBe(0);
    expect(JSON.parse(stdout)).toEqual({ metadata: ['permissionset'], drift: [], reordered: [] });
    expect(stderr).not.toContain('Warning:');
  });

  it('reads metadata types from .sfdecomposer.config.json with --config', async () => {
    await writeFile(join(projectDir, '.sfdecomposer.config.json'), JSON.stringify({ metadataSuffixes: 'labels' }));
    const { stdout, code } = await cli('decompose', '--config', '--json');
    expect(code).toBe(0);
    expect(JSON.parse(stdout)).toEqual({ metadata: ['labels'] });
    const recompose = await cli('recompose', '-c', '--postpurge');
    expect(recompose.code).toBe(0);
    await rm(join(projectDir, '.sfdecomposer.config.json'));
  });

  it('reports a missing sfdx-project.json as an error', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'cli-no-project-'));
    vi.spyOn(process, 'cwd').mockReturnValue(outside);
    const { stderr, code } = await cli('decompose', '-m', 'labels');
    expect(stderr).toMatch(/^Error: /);
    expect(code).toBe(1);
    await rm(outside, { recursive: true, force: true });
  });
});

describe('sf-decomposer CLI: verify drift', () => {
  it('lists drifted and reordered files and exits 1 on drift', async () => {
    vi.resetModules();
    vi.doMock('../../src/core/verifyMetadataTypes.js', () => ({
      verifyMetadataTypes: vi.fn().mockResolvedValue({
        metadata: ['flow'],
        drift: [{ path: 'flows/A.flow-meta.xml', reason: 'content drift' }],
        reordered: ['flows/B.flow-meta.xml'],
      }),
    }));
    const { run: runWithDrift } = await import('../../src/cli/run.js');
    let stdout = '';
    let stderr = '';
    const code = await runWithDrift(['verify', '-m', 'flow'], {
      stdout: (text) => {
        stdout += text;
      },
      stderr: (text) => {
        stderr += text;
      },
    });
    expect(code).toBe(1);
    expect(stdout).toContain('Reordered only (not a failure): flows/B.flow-meta.xml');
    expect(stderr).toContain('Warning: flows/A.flow-meta.xml: content drift');
    expect(stderr).toContain('Warning: Round-trip verify failed: 1 file(s) drifted.');
    vi.doUnmock('../../src/core/verifyMetadataTypes.js');
    vi.resetModules();
  });
});
