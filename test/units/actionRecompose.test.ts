'use strict';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getInputSpy,
  getMultilineInputSpy,
  getBooleanInputSpy,
  setOutputSpy,
  warningSpy,
  infoSpy,
  recomposeMetadataTypesSpy,
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
  recomposeMetadataTypesSpy: vi.fn(),
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

vi.mock('../../src/core/recomposeMetadataTypes.js', () => ({
  recomposeMetadataTypes: recomposeMetadataTypesSpy,
}));

vi.mock('../../src/helpers/configOverrides.js', () => ({
  loadConfigFile: loadConfigFileSpy,
  resolveDefaultConfigPath: resolveDefaultConfigPathSpy,
  validateConfigManifest: validateConfigManifestSpy,
  parseConfigSuffixes: (value: string | undefined) =>
    value && value.trim() !== '.' ? value.split(',').map((s) => s.trim()) : undefined,
}));

const { runRecompose } = await import('../../src/action/recompose.js');

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

describe('runRecompose', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recomposeMetadataTypesSpy.mockResolvedValue({ metadata: ['permissionset', 'workflow'] });
  });

  it('throws when neither metadata-type nor manifest is set', async () => {
    setInputs({});
    await expect(runRecompose()).rejects.toThrow("Either the 'metadata-type' or 'manifest' input must be set");
    expect(recomposeMetadataTypesSpy).not.toHaveBeenCalled();
  });

  it('calls recomposeMetadataTypes with the given inputs and sets outputs on success', async () => {
    setInputs({
      multiline: { 'metadata-type': ['permissionset', 'workflow'] },
      booleans: { postpurge: true },
    });

    await runRecompose();

    expect(recomposeMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ metadataTypes: ['permissionset', 'workflow'], postpurge: true }),
    );
    expect(setOutputSpy).toHaveBeenCalledWith('metadata', 'permissionset\nworkflow');
    expect(setOutputSpy).toHaveBeenCalledWith('types-count', 2);
  });

  it('merges config file values when config is true', async () => {
    setInputs({ booleans: { config: true } });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'permissionset', postPurge: true });
    validateConfigManifestSpy.mockResolvedValue(undefined);

    await runRecompose();

    expect(recomposeMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ metadataTypes: ['permissionset'], postpurge: true }),
    );
  });

  it('leaves configManifest undefined when an explicit manifest input is already provided', async () => {
    setInputs({
      strings: { manifest: 'explicit-manifest.xml' },
      booleans: { config: true },
    });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({ metadataSuffixes: 'permissionset', manifest: 'config-manifest.xml' });
    validateConfigManifestSpy.mockResolvedValue('explicit-manifest.xml');

    await runRecompose();

    expect(validateConfigManifestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ configManifest: undefined, manifest: 'explicit-manifest.xml' }),
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

    await runRecompose();

    expect(warningSpy).toHaveBeenCalledWith('manifest missing, falling back');
  });

  it('forwards a log message from recomposeMetadataTypes via core.info', async () => {
    setInputs({ multiline: { 'metadata-type': ['permissionset'] } });
    recomposeMetadataTypesSpy.mockImplementation(async ({ log }: { log: (msg: string) => void }) => {
      log('recomposing permissionset');
      return { metadata: ['permissionset'] };
    });

    await runRecompose();

    expect(infoSpy).toHaveBeenCalledWith('recomposing permissionset');
  });
});
