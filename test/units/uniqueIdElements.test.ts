'use strict';

import { describe, it, expect } from 'vitest';

import uniqueIdElements from '../../src/metadata/uniqueIdElements.js';
import { getUniqueIdElements } from '../../src/metadata/getUniqueIdElements.js';

describe('uniqueIdElements registry', () => {
  it('returns the documented list for `entitlementProcess` (covers <milestones>/<milestoneName>)', () => {
    expect(getUniqueIdElements('entitlementProcess')).toBe('milestoneName');
  });

  it('returns the documented list for `approvalProcess` (covers <allowedSubmitters>/<type>)', () => {
    expect(getUniqueIdElements('approvalProcess')).toBe('type');
  });

  it('preserves existing entries for backwards compatibility', () => {
    expect(getUniqueIdElements('bot')).toContain('developerName');
    expect(getUniqueIdElements('bot')).toContain('stepIdentifier');
    expect(getUniqueIdElements('loyaltyProgramSetup')).toBe('processName');
    expect(getUniqueIdElements('marketingappextension')).toBe('apiName');
    expect(getUniqueIdElements('globalValueSetTranslation')).toBe('masterLabel');
  });

  it('returns undefined for suffixes with no override (default fullName/name list applies)', () => {
    expect(getUniqueIdElements('layout')).toBeUndefined();
    expect(getUniqueIdElements('flexipage')).toBeUndefined();
    expect(getUniqueIdElements('globalValueSet')).toBeUndefined();
    expect(getUniqueIdElements('not_a_real_suffix')).toBeUndefined();
  });

  it('every registered list is a non-empty array of unique non-empty strings', () => {
    const merged: Record<string, { uniqueIdElements: string[] }> = {};
    for (const obj of uniqueIdElements) Object.assign(merged, obj);

    for (const [suffix, { uniqueIdElements: ids }] of Object.entries(merged)) {
      expect(Array.isArray(ids), `entry "${suffix}" must be a string[]`).toBe(true);
      expect(ids.length, `entry "${suffix}" must not be empty`).toBeGreaterThan(0);
      for (const id of ids) {
        expect(typeof id, `entry "${suffix}" contains a non-string id`).toBe('string');
        expect(id.trim().length, `entry "${suffix}" contains an empty id`).toBeGreaterThan(0);
      }
      expect(new Set(ids).size, `entry "${suffix}" has duplicate ids: ${ids.join(', ')}`).toBe(ids.length);
    }
  });

  it('does not duplicate the default `fullName`/`name` keys (those are prepended at lookup time)', () => {
    // src/metadata/getRegistryValuesBySuffix.ts always prefixes DEFAULT_UNIQUE_ID_ELEMENTS
    // ("fullName,name") to the per-suffix list. Listing them again would be redundant
    // and obscures which suffixes actually need extra coverage.
    const merged: Record<string, { uniqueIdElements: string[] }> = {};
    for (const obj of uniqueIdElements) Object.assign(merged, obj);

    for (const [suffix, { uniqueIdElements: ids }] of Object.entries(merged)) {
      expect(ids, `entry "${suffix}" should not duplicate the default "fullName"`).not.toContain('fullName');
      expect(ids, `entry "${suffix}" should not duplicate the default "name"`).not.toContain('name');
    }
  });
});
