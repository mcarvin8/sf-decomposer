'use strict';

import { ResolvedDecomposeTypeOptions } from '../../helpers/configOverrides.js';
import { getMultiLevelDefault } from '../../metadata/getMultiLevelDefault.js';

export type EffectiveDisassembleOptions = {
  strategy: string;
  multiLevel?: string | string[];
  splitTags?: string;
  sidecarElements?: string;
};

/**
 * Hard plugin rules that always win over user-provided strategies. `labels`,
 * `loyaltyProgramSetup`, and `externalServiceRegistration` are forced to `unique-id`
 * regardless of run-, type-, or component-scope configuration because their on-disk
 * layout depends on it.
 */
export function applyHardStrategyRules(metaSuffix: string, strategy: string): string {
  if (strategy !== 'grouped-by-tag') return strategy;
  if (metaSuffix === 'labels' || metaSuffix === 'loyaltyProgramSetup' || metaSuffix === 'externalServiceRegistration')
    return 'unique-id';
  return strategy;
}

/**
 * Resolve the strategy/multiLevel/splitTags/sidecarElements a real disassemble call would use
 * for this metadata suffix, given already component-or-type-resolved options. Shared by the real
 * disassembler (`decomposeFileHandler.ts`) and the verify round-trip check, so the two can never
 * silently diverge on what "the effective disassemble options" are for a given component.
 */
export function resolveEffectiveDisassembleOptions(
  metaSuffix: string,
  options: ResolvedDecomposeTypeOptions,
): EffectiveDisassembleOptions {
  const strategy = applyHardStrategyRules(metaSuffix, options.strategy);

  // Resolve multiLevel with this precedence:
  //   1. an explicit `multiLevel` set in the override (any metadata type);
  //   2. the built-in default for this metadata suffix when running unique-id strategy
  //      (see src/metadata/multiLevelDefaults.ts; covers `bot` and `loyaltyProgramSetup`).
  // The override may be a single rule (string) or several rules (string[]); both shapes are
  // forwarded verbatim — the crate decides how to split them. Empty arrays are rejected
  // upstream by validateMultiLevelSpec, so we don't need to guard against them here.
  let multiLevel: string | string[] | undefined = options.multiLevel;
  if (multiLevel === undefined && strategy === 'unique-id') {
    multiLevel = getMultiLevelDefault(metaSuffix);
  }

  // Resolve splitTags with this precedence:
  //   1. an explicit `splitTags` set in the override (any metadata type, gated to grouped-by-tag);
  //   2. the hardcoded permission-set default when `decomposeNestedPermissions: true` is set on
  //      a permissionset / mutingpermissionset under grouped-by-tag.
  // splitTags is a no-op for non-grouped-by-tag strategies, so we never pass it otherwise.
  let splitTags: string | undefined;
  if (strategy === 'grouped-by-tag') {
    if (options.splitTags) {
      splitTags = options.splitTags;
    } else if (
      options.decomposeNestedPerms &&
      (metaSuffix === 'permissionset' || metaSuffix === 'mutingpermissionset')
    ) {
      splitTags = 'objectPermissions:split:object,fieldPermissions:group:field';
    }
  }

  // Resolve sidecarElements: explicit override wins; ESR defaults to schema:yaml.
  let sidecarElements = options.sidecarElements;
  if (sidecarElements === undefined && metaSuffix === 'externalServiceRegistration') {
    sidecarElements = 'schema:yaml';
  }

  return { strategy, multiLevel, splitTags, sidecarElements };
}
