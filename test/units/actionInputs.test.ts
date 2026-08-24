'use strict';

import { afterEach, describe, expect, it } from 'vitest';

import { multilineInput, optionalInput, requireMetadataTypesOrManifest } from '../../src/action/inputs.js';

// These read directly from process.env using @actions/core's own INPUT_<NAME> convention
// (uppercased, spaces -> underscores, hyphens preserved) rather than mocking @actions/core, so
// the test doubles as a check that the convention itself is followed correctly.

function envKey(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

function setInput(name: string, value: string): void {
  process.env[envKey(name)] = value;
}

function clearInput(name: string): void {
  delete process.env[envKey(name)];
}

describe('multilineInput', () => {
  afterEach(() => {
    clearInput('metadata-type');
  });

  it('returns undefined when the input is unset', () => {
    expect(multilineInput('metadata-type')).toBeUndefined();
  });

  it('returns undefined when the input is only whitespace/blank lines', () => {
    setInput('metadata-type', '  \n\n  ');
    expect(multilineInput('metadata-type')).toBeUndefined();
  });

  it('splits on newlines, trims each line, and drops blank lines', () => {
    setInput('metadata-type', 'permissionset\n  flow  \n\nworkflow\n');
    expect(multilineInput('metadata-type')).toEqual(['permissionset', 'flow', 'workflow']);
  });
});

describe('optionalInput', () => {
  afterEach(() => {
    clearInput('manifest');
  });

  it('returns undefined when the input is unset', () => {
    expect(optionalInput('manifest')).toBeUndefined();
  });

  it('returns the value when set', () => {
    setInput('manifest', 'manifest/package.xml');
    expect(optionalInput('manifest')).toBe('manifest/package.xml');
  });
});

describe('requireMetadataTypesOrManifest', () => {
  it('throws when both metadataTypes and manifest are absent', () => {
    expect(() => requireMetadataTypesOrManifest(undefined, undefined)).toThrow(
      "Either the 'metadata-type' or 'manifest' input must be set",
    );
  });

  it('throws when metadataTypes is an empty array and manifest is absent', () => {
    expect(() => requireMetadataTypesOrManifest([], undefined)).toThrow(
      "Either the 'metadata-type' or 'manifest' input must be set",
    );
  });

  it('does not throw when metadataTypes has at least one entry', () => {
    expect(() => requireMetadataTypesOrManifest(['permissionset'], undefined)).not.toThrow();
  });

  it('does not throw when manifest is set, even with no metadataTypes', () => {
    expect(() => requireMetadataTypesOrManifest(undefined, 'manifest/package.xml')).not.toThrow();
  });
});
