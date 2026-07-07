import { describe, expect, it } from 'vitest';

import { ResolvedDecomposeTypeOptions } from '../../src/helpers/configOverrides.js';
import {
  applyHardStrategyRules,
  resolveEffectiveDisassembleOptions,
} from '../../src/service/decompose/resolveEffectiveDisassembleOptions.js';

function makeTypeOptions(over: Partial<ResolvedDecomposeTypeOptions> = {}): ResolvedDecomposeTypeOptions {
  return {
    format: 'xml',
    strategy: 'unique-id',
    decomposeNestedPerms: false,
    prepurge: false,
    postpurge: false,
    ...over,
  };
}

describe('applyHardStrategyRules', () => {
  it('passes non-grouped-by-tag strategies through unchanged', () => {
    expect(applyHardStrategyRules('permissionset', 'unique-id')).toBe('unique-id');
  });

  it('forces labels to unique-id under grouped-by-tag', () => {
    expect(applyHardStrategyRules('labels', 'grouped-by-tag')).toBe('unique-id');
  });

  it('forces loyaltyProgramSetup to unique-id under grouped-by-tag', () => {
    expect(applyHardStrategyRules('loyaltyProgramSetup', 'grouped-by-tag')).toBe('unique-id');
  });

  it('forces externalServiceRegistration to unique-id under grouped-by-tag', () => {
    expect(applyHardStrategyRules('externalServiceRegistration', 'grouped-by-tag')).toBe('unique-id');
  });

  it('leaves other types alone under grouped-by-tag', () => {
    expect(applyHardStrategyRules('permissionset', 'grouped-by-tag')).toBe('grouped-by-tag');
  });
});

describe('resolveEffectiveDisassembleOptions', () => {
  it('leaves multiLevel/splitTags/sidecarElements undefined for a plain unique-id type', () => {
    const result = resolveEffectiveDisassembleOptions('permissionset', makeTypeOptions());
    expect(result).toEqual({
      strategy: 'unique-id',
      multiLevel: undefined,
      splitTags: undefined,
      sidecarElements: undefined,
    });
  });

  it('falls back to the built-in multiLevel default for bot under unique-id', () => {
    const result = resolveEffectiveDisassembleOptions('bot', makeTypeOptions());
    expect(result.multiLevel).toEqual(['botDialogs:botDialogs:developerName', 'botSteps:botSteps:type']);
  });

  it('does not apply the multiLevel default when strategy is grouped-by-tag', () => {
    const result = resolveEffectiveDisassembleOptions('bot', makeTypeOptions({ strategy: 'grouped-by-tag' }));
    expect(result.multiLevel).toBeUndefined();
  });

  it('an explicit multiLevel override wins over the built-in default', () => {
    const result = resolveEffectiveDisassembleOptions('bot', makeTypeOptions({ multiLevel: 'custom:custom:id' }));
    expect(result.multiLevel).toBe('custom:custom:id');
  });

  it('resolves the permissionset splitTags default under grouped-by-tag with decomposeNestedPerms', () => {
    const result = resolveEffectiveDisassembleOptions(
      'permissionset',
      makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: true }),
    );
    expect(result.splitTags).toBe('objectPermissions:split:object,fieldPermissions:group:field');
  });

  it('does not apply the splitTags default without decomposeNestedPerms', () => {
    const result = resolveEffectiveDisassembleOptions(
      'permissionset',
      makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: false }),
    );
    expect(result.splitTags).toBeUndefined();
  });

  it('an explicit splitTags override wins over the hardcoded default', () => {
    const result = resolveEffectiveDisassembleOptions(
      'permissionset',
      makeTypeOptions({ strategy: 'grouped-by-tag', decomposeNestedPerms: true, splitTags: 'custom:split:field' }),
    );
    expect(result.splitTags).toBe('custom:split:field');
  });

  it('resolves the externalServiceRegistration sidecarElements default', () => {
    const result = resolveEffectiveDisassembleOptions('externalServiceRegistration', makeTypeOptions());
    expect(result.sidecarElements).toBe('schema:yaml');
    // ESR is also hard-forced to unique-id regardless of the requested strategy.
    expect(result.strategy).toBe('unique-id');
  });

  it('an explicit sidecarElements override wins over the ESR default', () => {
    const result = resolveEffectiveDisassembleOptions(
      'externalServiceRegistration',
      makeTypeOptions({ sidecarElements: 'custom:json' }),
    );
    expect(result.sidecarElements).toBe('custom:json');
  });
});
