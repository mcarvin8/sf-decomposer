'use strict';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadConfigFileSpy, validateConfigManifestSpy } = vi.hoisted(() => ({
  loadConfigFileSpy: vi.fn(),
  validateConfigManifestSpy: vi.fn(),
}));

vi.mock('../../src/helpers/configOverrides.js', () => ({
  loadConfigFile: loadConfigFileSpy,
  resolveDefaultConfigPath: async () => '/repo/.sfdecomposer.config.json',
  validateConfigManifest: validateConfigManifestSpy,
  parseConfigSuffixes: (value: string | undefined) =>
    value && value.trim() !== '.' ? value.split(',').map((s) => s.trim()) : undefined,
}));

const { isMissingMetadataOrManifest, resolveDecomposeOptions, resolveRecomposeOptions, resolveVerifyOptions } =
  await import('../../src/helpers/runOptions.js');

const warn = vi.fn();
const decomposeFlags = {
  prepurge: false,
  postpurge: false,
  decomposeNestedPerms: false,
  updateForceignore: false,
  updateGitattributes: false,
  warn,
};
const fullConfig = {
  metadataSuffixes: 'flow,labels',
  manifest: 'manifest/package.xml',
  ignorePackageDirectories: 'force-app',
  decomposedFormat: 'yaml',
  strategy: 'grouped-by-tag',
  prePurge: true,
  postPurge: true,
  decomposeNestedPermissions: true,
  updateForceignore: true,
  updateGitattributes: true,
  overrides: [{ metadataTypes: ['flow'], decomposedFormat: 'json' }],
};

beforeEach(() => {
  loadConfigFileSpy.mockReset();
  validateConfigManifestSpy.mockReset();
  validateConfigManifestSpy.mockImplementation(async ({ manifest }: { manifest?: string }) => manifest);
});

describe('isMissingMetadataOrManifest', () => {
  it('is true only when there are no metadata types and no manifest', () => {
    expect(isMissingMetadataOrManifest({})).toBe(true);
    expect(isMissingMetadataOrManifest({ metadataTypes: [] })).toBe(true);
    expect(isMissingMetadataOrManifest({ metadataTypes: ['flow'] })).toBe(false);
    expect(isMissingMetadataOrManifest({ manifest: 'package.xml' })).toBe(false);
  });
});

describe('resolveDecomposeOptions', () => {
  it('uses defaults and never reads the config file without config', async () => {
    const options = await resolveDecomposeOptions({ ...decomposeFlags, metadataTypes: ['flow'], config: false });
    expect(options).toEqual({
      metadataTypes: ['flow'],
      manifest: undefined,
      ignoreDirs: undefined,
      format: 'xml',
      strategy: 'unique-id',
      prepurge: false,
      postpurge: false,
      decomposeNestedPerms: false,
      updateForceignore: false,
      updateGitattributes: false,
      overrides: undefined,
    });
    expect(loadConfigFileSpy).not.toHaveBeenCalled();
  });

  it('fills every unset input from the config file', async () => {
    loadConfigFileSpy.mockResolvedValue(fullConfig);
    const options = await resolveDecomposeOptions({ ...decomposeFlags, config: true });
    expect(options).toEqual({
      metadataTypes: ['flow', 'labels'],
      manifest: 'manifest/package.xml',
      ignoreDirs: ['force-app'],
      format: 'yaml',
      strategy: 'grouped-by-tag',
      prepurge: true,
      postpurge: true,
      decomposeNestedPerms: true,
      updateForceignore: true,
      updateGitattributes: true,
      overrides: fullConfig.overrides,
    });
    expect(validateConfigManifestSpy).toHaveBeenCalledWith({
      configManifest: 'manifest/package.xml',
      metadataTypes: ['flow', 'labels'],
      manifest: 'manifest/package.xml',
      warn,
    });
  });

  it('lets explicit inputs win over the config file', async () => {
    loadConfigFileSpy.mockResolvedValue(fullConfig);
    const options = await resolveDecomposeOptions({
      ...decomposeFlags,
      metadataTypes: ['permissionset'],
      manifest: 'other.xml',
      ignoreDirs: ['package'],
      format: 'json',
      strategy: 'unique-id',
      config: true,
    });
    expect(options).toMatchObject({
      metadataTypes: ['permissionset'],
      manifest: 'other.xml',
      ignoreDirs: ['package'],
      format: 'json',
      strategy: 'unique-id',
    });
    expect(validateConfigManifestSpy).toHaveBeenCalledWith(expect.objectContaining({ configManifest: undefined }));
  });

  it('falls back to defaults when the config file leaves values out', async () => {
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'flow' });
    const options = await resolveDecomposeOptions({ ...decomposeFlags, prepurge: true, config: true });
    expect(options).toMatchObject({
      format: 'xml',
      strategy: 'unique-id',
      prepurge: true,
      postpurge: false,
      decomposeNestedPerms: false,
      updateForceignore: false,
      updateGitattributes: false,
    });
  });
});

describe('resolveRecomposeOptions', () => {
  it('passes inputs through without config', async () => {
    expect(await resolveRecomposeOptions({ metadataTypes: ['flow'], postpurge: true, config: false, warn })).toEqual({
      metadataTypes: ['flow'],
      manifest: undefined,
      ignoreDirs: undefined,
      postpurge: true,
    });
    expect(loadConfigFileSpy).not.toHaveBeenCalled();
  });

  it('fills unset inputs from the config file', async () => {
    loadConfigFileSpy.mockResolvedValue(fullConfig);
    expect(await resolveRecomposeOptions({ postpurge: false, config: true, warn })).toEqual({
      metadataTypes: ['flow', 'labels'],
      manifest: 'manifest/package.xml',
      ignoreDirs: ['force-app'],
      postpurge: true,
    });
  });

  it('defaults postpurge to false when the config file omits it', async () => {
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'flow' });
    expect(await resolveRecomposeOptions({ manifest: 'm.xml', postpurge: false, config: true, warn })).toMatchObject({
      postpurge: false,
      manifest: 'm.xml',
    });
    expect(validateConfigManifestSpy).toHaveBeenCalledWith(expect.objectContaining({ configManifest: undefined }));
  });
});

describe('resolveVerifyOptions', () => {
  it('uses defaults without config', async () => {
    expect(
      await resolveVerifyOptions({ metadataTypes: ['flow'], decomposeNestedPerms: false, config: false, warn }),
    ).toEqual({
      metadataTypes: ['flow'],
      manifest: undefined,
      ignoreDirs: undefined,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      overrides: undefined,
    });
  });

  it('fills unset inputs from the config file and lets explicit ones win', async () => {
    loadConfigFileSpy.mockResolvedValue(fullConfig);
    expect(await resolveVerifyOptions({ format: 'json5', decomposeNestedPerms: false, config: true, warn })).toEqual({
      metadataTypes: ['flow', 'labels'],
      manifest: 'manifest/package.xml',
      ignoreDirs: ['force-app'],
      format: 'json5',
      strategy: 'grouped-by-tag',
      decomposeNestedPerms: true,
      overrides: fullConfig.overrides,
    });
  });

  it('falls back to defaults when the config file leaves values out', async () => {
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'flow' });
    expect(
      await resolveVerifyOptions({ manifest: 'm.xml', decomposeNestedPerms: false, config: true, warn }),
    ).toMatchObject({ format: 'xml', strategy: 'unique-id', decomposeNestedPerms: false });
  });
});
