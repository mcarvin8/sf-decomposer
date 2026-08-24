'use strict';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getInputSpy,
  getMultilineInputSpy,
  getBooleanInputSpy,
  setOutputSpy,
  setFailedSpy,
  errorSpy,
  verifyMetadataTypesSpy,
  loadConfigFileSpy,
  resolveDefaultConfigPathSpy,
  validateConfigManifestSpy,
} = vi.hoisted(() => ({
  getInputSpy: vi.fn(),
  getMultilineInputSpy: vi.fn(),
  getBooleanInputSpy: vi.fn(),
  setOutputSpy: vi.fn(),
  setFailedSpy: vi.fn(),
  errorSpy: vi.fn(),
  verifyMetadataTypesSpy: vi.fn(),
  loadConfigFileSpy: vi.fn(),
  resolveDefaultConfigPathSpy: vi.fn(),
  validateConfigManifestSpy: vi.fn(),
}));

vi.mock('@actions/core', () => ({
  getInput: getInputSpy,
  getMultilineInput: getMultilineInputSpy,
  getBooleanInput: getBooleanInputSpy,
  setOutput: setOutputSpy,
  setFailed: setFailedSpy,
  error: errorSpy,
  warning: vi.fn(),
}));

vi.mock('../../src/core/verifyMetadataTypes.js', () => ({
  verifyMetadataTypes: verifyMetadataTypesSpy,
}));

vi.mock('../../src/helpers/configOverrides.js', () => ({
  loadConfigFile: loadConfigFileSpy,
  resolveDefaultConfigPath: resolveDefaultConfigPathSpy,
  validateConfigManifest: validateConfigManifestSpy,
  parseConfigSuffixes: (value: string | undefined) =>
    value && value.trim() !== '.' ? value.split(',').map((s) => s.trim()) : undefined,
}));

const { runVerify } = await import('../../src/action/verify.js');

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

describe('runVerify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when neither metadata-type nor manifest is set', async () => {
    setInputs({});
    await expect(runVerify()).rejects.toThrow("Either the 'metadata-type' or 'manifest' input must be set");
    expect(verifyMetadataTypesSpy).not.toHaveBeenCalled();
  });

  it('sets outputs and does not fail when there is no drift', async () => {
    setInputs({ multiline: { 'metadata-type': ['permissionset'] } });
    verifyMetadataTypesSpy.mockResolvedValue({ metadata: ['permissionset'], drift: [], reordered: [] });

    await runVerify();

    expect(setOutputSpy).toHaveBeenCalledWith('metadata', 'permissionset');
    expect(setOutputSpy).toHaveBeenCalledWith('types-count', 1);
    expect(setOutputSpy).toHaveBeenCalledWith('drift-count', 0);
    expect(setOutputSpy).toHaveBeenCalledWith('reordered-count', 0);
    expect(setFailedSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs each drift path and fails the step when drift is found', async () => {
    setInputs({ multiline: { 'metadata-type': ['permissionset'] } });
    verifyMetadataTypesSpy.mockResolvedValue({
      metadata: ['permissionset'],
      drift: [
        { path: 'force-app/permissionsets/A.permissionset-meta.xml', reason: 'content drift' },
        { path: 'force-app/permissionsets/B.permissionset-meta.xml', reason: 'missing in round-trip output' },
      ],
      reordered: ['force-app/permissionsets/C.permissionset-meta.xml'],
    });

    await runVerify();

    expect(setOutputSpy).toHaveBeenCalledWith('drift-count', 2);
    expect(setOutputSpy).toHaveBeenCalledWith('reordered-count', 1);
    expect(errorSpy).toHaveBeenCalledWith('force-app/permissionsets/A.permissionset-meta.xml: content drift');
    expect(errorSpy).toHaveBeenCalledWith(
      'force-app/permissionsets/B.permissionset-meta.xml: missing in round-trip output',
    );
    expect(setFailedSpy).toHaveBeenCalledWith(
      'Round-trip verify failed: 2 file(s) drifted between the original tree and the round-tripped output. See the log above for the offending paths.',
    );
  });

  it('merges config file values when config is true', async () => {
    setInputs({ booleans: { config: true } });
    resolveDefaultConfigPathSpy.mockResolvedValue('/repo/.sfdecomposer.config.json');
    loadConfigFileSpy.mockResolvedValue({
      metadataSuffixes: 'permissionset',
      decomposedFormat: 'json5',
      strategy: 'grouped-by-tag',
      decomposeNestedPermissions: true,
    });
    validateConfigManifestSpy.mockResolvedValue(undefined);
    verifyMetadataTypesSpy.mockResolvedValue({ metadata: ['permissionset'], drift: [], reordered: [] });

    await runVerify();

    expect(verifyMetadataTypesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        metadataTypes: ['permissionset'],
        format: 'json5',
        strategy: 'grouped-by-tag',
        decomposeNestedPerms: true,
      }),
    );
  });
});
