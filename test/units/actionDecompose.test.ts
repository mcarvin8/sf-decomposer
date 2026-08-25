'use strict';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getInputSpy,
  getMultilineInputSpy,
  getBooleanInputSpy,
  setOutputSpy,
  warningSpy,
  infoSpy,
  decomposeMetadataTypesSpy,
  loadConfigFileSpy,
  resolveDefaultConfigPathSpy,
  validateConfigManifestSpy,
} = vi.hoisted(() => ({
  getInputSpy: vi.fn(),
  getMultilineInputSpy: vi.fn(),
  getBooleanInputSpy: vi.fn(),
  setOutputSpy: vi.fn(),
  warningSpy: vi.fn(),
  infoSpy: vi.fn(),
  decomposeMetadataTypesSpy: vi.fn(),
  loadConfigFileSpy: vi.fn(),
  resolveDefaultConfigPathSpy: vi.fn(),
  validateConfigManifestSpy: vi.fn(),
}));

vi.mock('@actions/core', () => ({
  getInput: getInputSpy,
  getMultilineInput: getMultilineInputSpy,
  getBooleanInput: getBooleanInputSpy,
  setOutput: setOutputSpy,
  warning: warningSpy,
  info: infoSpy,
}));

vi.mock('../../src/core/decomposeMetadataTypes.js', () => ({
  decomposeMetadataTypes: decomposeMetadataTypesSpy,
}));

vi.mock('../../src/helpers/configOverrides.js', () => ({
  loadConfigFile: loadConfigFileSpy,
  resolveDefaultConfigPath: resolveDefaultConfigPathSpy,
  validateConfigManifest: validateConfigManifestSpy,
  parseConfigSuffixes: (value: string | undefined) =>
    value && value.trim() !== '.' ? value.split(',').map((s) => s.trim()) : undefined,
}));

const { runDecompose } = await import('../../src/action/decompose.js');

type Inputs = {
  strings?: Record<string, string>;
  multiline?: Record<string, string[]>;
  booleans?: Record<string, boolean>;
};

function setInputs({ strings = {}, multiline = {}, booleans = {} }: Inputs): void {
  getInputSpy.mockImplementation((name: string) => strings[name] ?? '');
  getMultilineInputSpy.mockImplementation((name: string) => multiline[name] ?? []);
  getBooleanInputSpy.mockImplementation((name: string) => booleans[name] ?? false);
}

describe('runDecompose', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    decomposeMetadataTypesSpy.mockResolvedValue({ metadata: ['permissionset'] });
  });

  it('throws when neither metadata-type nor manifest is set', async () => {
    setInputs({});
    await expect(runDecompose()).rejects.toThrow("Either the 'metadata-type' or 'manifest' input must be set");
    expect(decomposeMetadataTypesSpy).not.toHaveBeenCalled();
  });

  it('calls decomposeMetadataTypes with the given inputs and sets outputs on success', async () => {
    setInputs({
      multiline: { 'metadata-type': ['permissionset'] },
      booleans: { prepurge: true, postpurge: false },
      strings: { format: 'json', strategy: 'grouped-by-tag' },
    });

    await runDecompose();

    expect(decomposeMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        metadataTypes: ['permissionset'],
        prepurge: true,
        postpurge: false,
        format: 'json',
        strategy: 'grouped-by-tag',
      }),
    );
    expect(setOutputSpy).toHaveBeenCalledWith('metadata', 'permissionset');
    expect(setOutputSpy).toHaveBeenCalledWith('types-count', 1);
  });

  it('defaults format to xml and strategy to unique-id when not provided', async () => {
    setInputs({ multiline: { 'metadata-type': ['workflow'] } });

    await runDecompose();

    expect(decomposeMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'xml', strategy: 'unique-id' }),
    );
  });

  it('merges config file values when config is true, without overriding explicit inputs', async () => {
    setInputs({
      booleans: { config: true, postpurge: true },
    });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({
      metadataSuffixes: 'permissionset,workflow',
      prePurge: true,
      postPurge: false,
      decomposedFormat: 'yaml',
      strategy: 'grouped-by-tag',
      decomposeNestedPermissions: true,
      updateForceignore: true,
      updateGitattributes: true,
      overrides: [{ metadataTypes: ['permissionset'] }],
    });
    validateConfigManifestSpy.mockResolvedValue(undefined);

    await runDecompose();

    expect(decomposeMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        metadataTypes: ['permissionset', 'workflow'],
        prepurge: true,
        // postpurge input (true) wins over config.postPurge (false) via `||`
        postpurge: true,
        format: 'yaml',
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
        updateForceignore: true,
        updateGitattributes: true,
        overrides: [{ metadataTypes: ['permissionset'] }],
      }),
    );
  });

  it('forwards a warning from validateConfigManifest via core.warning', async () => {
    setInputs({ booleans: { config: true } });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'permissionset', manifest: 'manifest.xml' });
    validateConfigManifestSpy.mockImplementation(async ({ warn }: { warn: (msg: string) => void }) => {
      warn('manifest missing, falling back');
      return undefined;
    });

    await runDecompose();

    expect(warningSpy).toHaveBeenCalledWith('manifest missing, falling back');
  });

  it('leaves configManifest undefined when an explicit manifest input is already provided', async () => {
    setInputs({
      strings: { manifest: 'explicit-manifest.xml' },
      booleans: { config: true },
    });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'permissionset', manifest: 'config-manifest.xml' });
    validateConfigManifestSpy.mockResolvedValue('explicit-manifest.xml');

    await runDecompose();

    expect(validateConfigManifestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ configManifest: undefined, manifest: 'explicit-manifest.xml' }),
    );
  });

  it('forwards a log message from decomposeMetadataTypes via core.info', async () => {
    setInputs({ multiline: { 'metadata-type': ['permissionset'] } });
    decomposeMetadataTypesSpy.mockImplementation(async ({ log }: { log: (msg: string) => void }) => {
      log('decomposing permissionset');
      return { metadata: ['permissionset'] };
    });

    await runDecompose();

    expect(infoSpy).toHaveBeenCalledWith('decomposing permissionset');
  });
});
