'use strict';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// packages/core/package.json is the manifest for sf-decomposer-core, built from the same src/
// (see tsconfig.core.json and scripts/verify-core-package.mjs). Its version and its single
// runtime dependency must track the plugin's, or core would ship a stale config-disassembler.

type PackageJson = {
  name: string;
  version: string;
  type: string;
  bin: Record<string, string>;
  engines: Record<string, string>;
  dependencies: Record<string, string>;
};

const read = (path: string): PackageJson =>
  JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf-8')) as PackageJson;
const root = read('package.json');
const core = read('packages/core/package.json');

describe('packages/core/package.json', () => {
  it('is sf-decomposer-core at the same version as the plugin', () => {
    expect(core.name).toBe('sf-decomposer-core');
    expect(core.version).toBe(root.version);
  });

  it('depends only on config-disassembler, pinned to the plugin version', () => {
    expect(core.dependencies).toEqual({ 'config-disassembler': root.dependencies['config-disassembler'] });
  });

  it('ships the standalone sf-decomposer command as an ESM package', () => {
    expect(core.type).toBe('module');
    expect(core.bin).toEqual({ 'sf-decomposer': './lib/cli/index.js' });
  });

  it('requires the same Node.js version as the plugin', () => {
    expect(core.engines).toEqual(root.engines);
  });
});

describe('Claude Code plugin', () => {
  it('has the same version as the plugin package, so Claude Code offers updates on each release', () => {
    const plugin = JSON.parse(
      readFileSync(resolve(process.cwd(), 'plugins/sf-decomposer/.claude-plugin/plugin.json'), 'utf-8'),
    ) as { name: string; version: string };
    expect(plugin.name).toBe('sf-decomposer');
    expect(plugin.version).toBe(root.version);
  });

  it('is bumped by release-please with every release', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'release-please-config.json'), 'utf-8')) as {
      packages: Record<string, { 'extra-files': Array<{ path: string; jsonpath: string }> }>;
    };
    expect(config.packages['.']['extra-files']).toContainEqual(
      expect.objectContaining({ path: 'plugins/sf-decomposer/.claude-plugin/plugin.json', jsonpath: '$.version' }),
    );
  });
});

describe('release-please config', () => {
  it('bumps packages/core/package.json with every release', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'release-please-config.json'), 'utf-8')) as {
      packages: Record<string, { 'extra-files': Array<{ path: string; jsonpath: string }> }>;
    };
    expect(config.packages['.']['extra-files']).toContainEqual(
      expect.objectContaining({ path: 'packages/core/package.json', jsonpath: '$.version' }),
    );
  });
});
