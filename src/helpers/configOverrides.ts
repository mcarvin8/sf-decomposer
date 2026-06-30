'use strict';

import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES, HOOK_CONFIG_JSON } from './constants.js';
import { ConfigFile, DecomposerOverride } from './types.js';

/**
 * Resolve the absolute path of the default `.sfdecomposer.config.json`, located in the
 * repo root (the nearest ancestor directory that contains `sfdx-project.json`). Throws
 * a clear error when the repo root cannot be located or the config file does not exist.
 */
export async function resolveDefaultConfigPath(): Promise<string> {
  const { repoRoot } = await getRepoRoot();
  // Stryker disable all
  /* istanbul ignore next -- @preserve: getRepoRoot throws when no sfdx-project.json ancestor exists, so repoRoot is always defined here. */
  if (!repoRoot) {
    throw new Error(`Cannot locate ${HOOK_CONFIG_JSON}: repo root not found.`);
  }
  // Stryker restore all
  const configPath = resolve(repoRoot, HOOK_CONFIG_JSON);
  try {
    await access(configPath);
  } catch (err) {
    throw new Error(
      `--config was provided but ${HOOK_CONFIG_JSON} was not found at ${configPath}. ` +
        'Create the file in the repo root or omit --config.',
      { cause: err },
    );
  }
  return configPath;
}

// Run-scope keys that must never appear inside an override entry. Any other key is treated
// as either a recognized override field (validated below) or as a forward-compatible unknown
// key (silently ignored).
const FORBIDDEN_OVERRIDE_KEYS = new Set<string>(['manifest', 'metadataSuffixes', 'ignorePackageDirectories']);

export type ResolvedDecomposeTypeOptions = {
  format: string;
  strategy: string;
  decomposeNestedPerms: boolean;
  prepurge: boolean;
  postpurge: boolean;
  /** Resolved custom `splitTags` spec, when explicitly set in an override. */
  splitTags?: string;
  /**
   * Resolved custom `multiLevel` spec(s), when explicitly set in an override. Preserves the
   * input shape (string vs string[]) so the disassembler crate can decide how to parse it;
   * a single `;`-separated string is treated by the crate as multiple rules.
   */
  multiLevel?: string | string[];
  /**
   * Resolved custom `uniqueIdElements` spec, when explicitly set in an override. Replaces
   * the hardcoded per-type list; the global defaults (`fullName`, `name`) are still
   * prepended by `getRegistryValuesBySuffix` regardless.
   */
  uniqueIdElements?: string;
  /**
   * Resolved custom `sidecarElements` spec, when explicitly set in an override. Comma-separated
   * `element:extension` pairs. When absent, built-in per-type defaults apply (e.g.
   * `externalServiceRegistration` defaults to `"schema:yaml"`).
   */
  sidecarElements?: string;
};

const SPLIT_TAGS_MODES = new Set<string>(['split', 'group']);

/**
 * Load and parse the full `.sfdecomposer.config.json` file. Validates the `overrides` array
 * when present. Throws when the file cannot be read or parsed.
 */
export async function loadConfigFile(configPath: string): Promise<ConfigFile> {
  let raw: string;
  try {
    // Stryker disable next-line StringLiteral: JSON.parse(Buffer) defaults to UTF-8 decoding
    raw = await readFile(configPath, 'utf-8');
  } catch (err) {
    /* istanbul ignore next -- @preserve */
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot read ${configPath}: ${message}`, { cause: err });
  }

  let parsed: ConfigFile;
  try {
    parsed = JSON.parse(raw) as ConfigFile;
  } catch (err) {
    /* istanbul ignore next -- @preserve: JSON.parse always throws SyntaxError instances. */
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${configPath}: ${message}`, { cause: err });
  }

  if (parsed.overrides !== undefined) {
    if (!Array.isArray(parsed.overrides)) {
      throw new Error(`"overrides" in ${configPath} must be an array.`);
    }
    validateOverrides(parsed.overrides);
  }

  return parsed;
}

/**
 * Split a comma-separated config string (e.g. `metadataSuffixes`, `ignorePackageDirectories`)
 * into a trimmed string array. Returns `undefined` when the value is absent, empty, or the
 * sentinel `"."` (which the hooks interpret as "all types, no filter").
 */
export function parseConfigSuffixes(value: string | undefined): string[] | undefined {
  if (!value || value.trim() === '' || value.trim() === '.') return undefined;
  const parts = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : undefined;
}

/**
 * Load and validate the `overrides` array from a `.sfdecomposer.config.json` file.
 * Returns an empty array when the file is missing or unreadable. Throws on invalid JSON
 * or a malformed `overrides` array (same contract as before `loadConfigFile` was added).
 */
export async function loadOverridesFromConfig(configPath: string): Promise<DecomposerOverride[]> {
  let raw: string;
  try {
    // Stryker disable next-line StringLiteral: JSON.parse(Buffer) defaults to UTF-8 decoding
    raw = await readFile(configPath, 'utf-8');
  } catch {
    return [];
  }

  let parsed: ConfigFile;
  try {
    parsed = JSON.parse(raw) as ConfigFile;
  } catch (err) {
    /* istanbul ignore next -- @preserve: JSON.parse always throws SyntaxError instances. */
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${configPath}: ${message}`, { cause: err });
  }

  const overrides = parsed.overrides;
  if (!overrides) return [];
  if (!Array.isArray(overrides)) {
    throw new Error(`"overrides" in ${configPath} must be an array.`);
  }

  validateOverrides(overrides);
  return overrides;
}

/**
 * Validate that the overrides array is well-formed. Throws on any structural problem.
 * Unknown override keys are tolerated (ignored), but forbidden run-scope keys throw.
 */
export function validateOverrides(overrides: DecomposerOverride[]): void {
  const seenTypes = new Set<string>();
  const seenComponents = new Set<string>();

  for (let i = 0; i < overrides.length; i++) {
    validateOverride(overrides[i], i, seenTypes, seenComponents);
  }
}

function validateOverride(
  override: DecomposerOverride,
  i: number,
  seenTypes: Set<string>,
  seenComponents: Set<string>,
): void {
  if (!override || typeof override !== 'object') {
    throw new Error(`Override at index ${i} must be an object.`);
  }

  if (override.metadataTypes !== undefined && !Array.isArray(override.metadataTypes)) {
    throw new Error(`Override at index ${i} has a non-array "metadataTypes".`);
  }

  if (override.components !== undefined && !Array.isArray(override.components)) {
    throw new Error(`Override at index ${i} has a non-array "components".`);
  }

  const hasMetadataTypes = Array.isArray(override.metadataTypes) && override.metadataTypes.length > 0;
  const hasComponents = Array.isArray(override.components) && override.components.length > 0;

  if (!hasMetadataTypes && !hasComponents) {
    throw new Error(`Override at index ${i} must include a non-empty "metadataTypes" or "components" array.`);
  }

  validateForbiddenKeys(override, i);
  validateOverrideValues(override, i);

  if (hasMetadataTypes) {
    validateMetadataTypeEntries(override.metadataTypes as string[], i, seenTypes);
  }

  if (hasComponents) {
    validateComponentEntries(override.components as string[], i, seenComponents);
  }
}

function validateForbiddenKeys(override: DecomposerOverride, i: number): void {
  for (const key of Object.keys(override)) {
    if (FORBIDDEN_OVERRIDE_KEYS.has(key)) {
      throw new Error(
        `Override at index ${i} contains "${key}", which is a run-scope option and cannot be set per metadata type.`,
      );
    }
  }
}

function validateOverrideValues(override: DecomposerOverride, i: number): void {
  if (override.decomposedFormat !== undefined && !DECOMPOSED_FILE_TYPES.includes(override.decomposedFormat)) {
    throw new Error(
      `Override at index ${i} has invalid "decomposedFormat": "${override.decomposedFormat}". ` +
        `Allowed values: ${DECOMPOSED_FILE_TYPES.join(', ')}.`,
    );
  }

  if (override.strategy !== undefined && !DECOMPOSED_STRATEGIES.includes(override.strategy)) {
    throw new Error(
      `Override at index ${i} has invalid "strategy": "${override.strategy}". ` +
        `Allowed values: ${DECOMPOSED_STRATEGIES.join(', ')}.`,
    );
  }

  if (override.splitTags !== undefined) {
    validateSplitTagsSpec(override.splitTags, i);
  }

  if (override.multiLevel !== undefined) {
    validateMultiLevelSpec(override.multiLevel, i);
  }

  if (override.uniqueIdElements !== undefined) {
    validateUniqueIdElementsSpec(override.uniqueIdElements, i);
  }

  if (override.sidecarElements !== undefined) {
    validateSidecarElementsSpec(override.sidecarElements, i);
  }
}

/**
 * Validate the comma-separated `splitTags` spec at config-load time. Each rule must be of the
 * form `<tag>:<mode>:<field>` or `<tag>:<path>:<mode>:<field>`, with `mode` ∈ {split, group}.
 * Tags must be unique within the spec. Deeper validation (e.g. unknown XML tag names) is left
 * to the underlying disassembler crate at runtime.
 */
export function validateSplitTagsSpec(spec: string, i: number): void {
  if (typeof spec !== 'string' || spec.trim() === '') {
    throw new Error(`Override at index ${i} has an empty "splitTags" string.`);
  }

  const rules = spec.split(',').map((rule) => rule.trim());
  const seenTags = new Set<string>();

  for (const rule of rules) {
    if (rule === '') {
      throw new Error(`Override at index ${i} "splitTags" contains an empty rule.`);
    }
    const parts = rule.split(':').map((part) => part.trim());

    let tag: string;
    let mode: string;
    let field: string;
    if (parts.length === 3) {
      [tag, mode, field] = parts;
    } else if (parts.length === 4) {
      // path defaults to tag in the 3-part form; we don't need to retain it for validation,
      // we just check the parts are non-empty and the mode/field are well-formed.
      [tag, , mode, field] = parts;
    } else {
      throw new Error(
        `Override at index ${i} "splitTags" rule "${rule}" must have 3 or 4 colon-separated parts ` +
          '("tag:mode:field" or "tag:path:mode:field").',
      );
    }

    if (!tag || !mode || !field || (parts.length === 4 && !parts[1])) {
      throw new Error(`Override at index ${i} "splitTags" rule "${rule}" has empty parts.`);
    }
    if (!SPLIT_TAGS_MODES.has(mode)) {
      throw new Error(
        `Override at index ${i} "splitTags" rule "${rule}" has invalid mode "${mode}". ` +
          `Allowed values: ${Array.from(SPLIT_TAGS_MODES).join(', ')}.`,
      );
    }
    if (seenTags.has(tag)) {
      throw new Error(
        `Override at index ${i} "splitTags" contains duplicate tag "${tag}". Each tag may appear at most once.`,
      );
    }
    seenTags.add(tag);
  }
}

/**
 * Validate the `multiLevel` spec at config-load time. Each rule must be of the form
 * `<file_pattern>:<root_to_strip>:<unique_id_elements>`, where `<unique_id_elements>` is
 * itself a comma-separated list. Three input shapes are supported: a single rule string
 * (legacy); a string[] of rules (preferred when targeting multiple nested sections); or a
 * single `;`-separated string of rules (compact form, also accepted by the crate).
 *
 * Rules are validated individually and the (file_pattern, root_to_strip) pair must be
 * unique across rules in the same scope. Deeper checks (whether a file pattern matches
 * anything, whether the unique-id elements actually exist on the inner XML) are left to
 * the runtime crate.
 */
export function validateMultiLevelSpec(spec: string | string[], i: number): void {
  const rules = normalizeMultiLevelRules(spec, i);
  const seenPairs = new Set<string>();
  for (const rule of rules) {
    const { filePattern, rootToStrip } = validateSingleMultiLevelRule(rule, i);
    const pairKey = `${filePattern}:${rootToStrip}`;
    if (seenPairs.has(pairKey)) {
      throw new Error(
        `Override at index ${i} "multiLevel" has duplicate (file_pattern, root_to_strip) pair "${pairKey}". ` +
          'Each pair may appear at most once per scope.',
      );
    }
    seenPairs.add(pairKey);
  }
}

function normalizeMultiLevelRules(spec: string | string[], i: number): string[] {
  if (Array.isArray(spec)) {
    if (spec.length === 0) {
      throw new Error(`Override at index ${i} has an empty "multiLevel" array.`);
    }
    for (const entry of spec) {
      if (typeof entry !== 'string' || entry.trim() === '') {
        throw new Error(`Override at index ${i} "multiLevel" array contains an empty or non-string entry.`);
      }
    }
    return spec.map((rule) => rule.trim());
  }
  if (typeof spec !== 'string' || spec.trim() === '') {
    throw new Error(`Override at index ${i} has an empty "multiLevel" string.`);
  }
  // A single `;`-separated string is treated as multiple rules to mirror the crate's parser.
  return spec
    .split(';')
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0);
}

function validateSingleMultiLevelRule(rule: string, i: number): { filePattern: string; rootToStrip: string } {
  const parts = rule.split(':').map((part) => part.trim());
  if (parts.length !== 3) {
    throw new Error(
      `Override at index ${i} "multiLevel" rule "${rule}" must have exactly 3 colon-separated parts ` +
        '("<file_pattern>:<root_to_strip>:<unique_id_elements>").',
    );
  }

  const [filePattern, rootToStrip, uniqueIdElements] = parts;
  if (!filePattern || !rootToStrip || !uniqueIdElements) {
    throw new Error(`Override at index ${i} "multiLevel" rule "${rule}" has empty parts.`);
  }

  const ids = uniqueIdElements.split(',').map((id) => id.trim());
  const seenIds = new Set<string>();
  for (const id of ids) {
    if (id === '') {
      throw new Error(`Override at index ${i} "multiLevel" rule "${rule}" unique-id list contains an empty entry.`);
    }
    if (seenIds.has(id)) {
      throw new Error(`Override at index ${i} "multiLevel" rule "${rule}" unique-id list has duplicate entry "${id}".`);
    }
    seenIds.add(id);
  }

  return { filePattern, rootToStrip };
}

/**
 * Validate the `uniqueIdElements` spec at config-load time. Must be a non-empty
 * comma-separated list of element names. Each entry may use `+` to join fields
 * into a compound key (e.g. `"actionName+pageOrSobjectType+formFactor"`). Deeper
 * validation (whether the named elements actually exist in the XML) is left to the
 * runtime crate.
 */
export function validateUniqueIdElementsSpec(spec: string, i: number): void {
  if (typeof spec !== 'string' || spec.trim() === '') {
    throw new Error(`Override at index ${i} has an empty "uniqueIdElements" string.`);
  }

  const entries = spec.split(',').map((e) => e.trim());
  for (const entry of entries) {
    if (entry === '') {
      throw new Error(`Override at index ${i} "uniqueIdElements" contains an empty entry.`);
    }
  }
}

/**
 * Validate the `sidecarElements` spec at config-load time. Must be a non-empty
 * comma-separated list of `element:extension` pairs, each with exactly two colon-separated
 * parts. Element names must be unique within the spec. Deeper validation (whether the
 * named element exists in the XML) is left to the runtime crate.
 */
export function validateSidecarElementsSpec(spec: string, i: number): void {
  if (typeof spec !== 'string' || spec.trim() === '') {
    throw new Error(`Override at index ${i} has an empty "sidecarElements" string.`);
  }

  const pairs = spec.split(',').map((pair) => pair.trim());
  const seenElements = new Set<string>();

  for (const pair of pairs) {
    if (pair === '') {
      throw new Error(`Override at index ${i} "sidecarElements" contains an empty pair.`);
    }
    const parts = pair.split(':').map((part) => part.trim());
    if (parts.length !== 2) {
      throw new Error(
        `Override at index ${i} "sidecarElements" pair "${pair}" must have exactly 2 colon-separated parts ` +
          '("<element>:<extension>").',
      );
    }
    const [element, extension] = parts;
    if (!element || !extension) {
      throw new Error(`Override at index ${i} "sidecarElements" pair "${pair}" has empty parts.`);
    }
    if (seenElements.has(element)) {
      throw new Error(
        `Override at index ${i} "sidecarElements" contains duplicate element "${element}". Each element may appear at most once.`,
      );
    }
    seenElements.add(element);
  }
}

function validateMetadataTypeEntries(metadataTypes: string[], i: number, seenTypes: Set<string>): void {
  for (const metadataType of metadataTypes) {
    if (typeof metadataType !== 'string' || metadataType.trim() === '') {
      throw new Error(`Override at index ${i} contains an empty or non-string metadata type.`);
    }
    if (seenTypes.has(metadataType)) {
      throw new Error(
        `Metadata type "${metadataType}" appears in more than one override. Each type may appear at most once.`,
      );
    }
    seenTypes.add(metadataType);
  }
}

function validateComponentEntries(components: string[], i: number, seenComponents: Set<string>): void {
  for (const component of components) {
    if (typeof component !== 'string' || component.trim() === '') {
      throw new Error(`Override at index ${i} contains an empty or non-string component.`);
    }
    if (!parseComponentKey(component)) {
      throw new Error(
        `Override at index ${i} has invalid component key "${component}". ` +
          'Expected format: "<metadataSuffix>:<fullName>" (e.g. "permissionset:HR_Admin").',
      );
    }
    if (seenComponents.has(component)) {
      throw new Error(
        `Component "${component}" appears in more than one override. Each component may appear at most once.`,
      );
    }
    seenComponents.add(component);
  }
}

/**
 * Parse a component override key of the form `<metadataSuffix>:<fullName>`. Returns `undefined`
 * when the key is malformed. Only the first colon is treated as the delimiter so fullNames that
 * contain `/` (folder-typed metadata such as `report:MyFolder/MyReport`) are preserved verbatim.
 */
export function parseComponentKey(key: string): { metadataType: string; fullName: string } | undefined {
  const colonIdx = key.indexOf(':');
  // Stryker disable next-line EqualityOperator, ConditionalExpression, ArithmeticOperator
  if (colonIdx <= 0 || colonIdx === key.length - 1) return undefined;
  const metadataType = key.slice(0, colonIdx).trim();
  const fullName = key.slice(colonIdx + 1).trim();
  if (!metadataType || !fullName) return undefined;
  return { metadataType, fullName };
}

/**
 * Find the override (if any) that targets a specific metadata suffix.
 */
export function getOverrideForType(
  metadataType: string,
  overrides?: DecomposerOverride[],
): DecomposerOverride | undefined {
  // Stryker disable next-line ConditionalExpression
  if (!overrides || overrides.length === 0) return undefined;
  return overrides.find((override) => override.metadataTypes?.includes(metadataType));
}

/**
 * Find the override (if any) that targets a specific component, identified by its metadata
 * suffix and SDR fullName.
 */
export function getOverrideForComponent(
  metadataType: string,
  fullName: string,
  overrides?: DecomposerOverride[],
): DecomposerOverride | undefined {
  // Stryker disable next-line ConditionalExpression
  if (!overrides || overrides.length === 0) return undefined;
  const key = `${metadataType}:${fullName}`;
  return overrides.find((override) => override.components?.includes(key));
}

/**
 * Returns true when at least one override targets a component of the given metadata type.
 * Used by the decompose handler to decide whether per-component enumeration is required.
 */
export function hasComponentOverridesForType(metadataType: string, overrides?: DecomposerOverride[]): boolean {
  // Stryker disable next-line ConditionalExpression
  if (!overrides || overrides.length === 0) return false;
  const prefix = `${metadataType}:`;
  return overrides.some((override) => override.components?.some((component) => component.startsWith(prefix)));
}

/**
 * Resolve the effective decompose options for a single metadata type. The base values are
 * the run-wide options (CLI flags or defaults); per-type override values, when present, win.
 */
export function resolveDecomposeOptionsForType(
  metadataType: string,
  base: ResolvedDecomposeTypeOptions,
  overrides?: DecomposerOverride[],
): ResolvedDecomposeTypeOptions {
  const override = getOverrideForType(metadataType, overrides);
  if (!override) return base;

  return {
    format: override.decomposedFormat ?? base.format,
    strategy: override.strategy ?? base.strategy,
    decomposeNestedPerms: override.decomposeNestedPermissions ?? base.decomposeNestedPerms,
    prepurge: override.prePurge ?? base.prepurge,
    postpurge: override.postPurge ?? base.postpurge,
    splitTags: override.splitTags ?? base.splitTags,
    multiLevel: override.multiLevel ?? base.multiLevel,
    uniqueIdElements: override.uniqueIdElements ?? base.uniqueIdElements,
    sidecarElements: override.sidecarElements ?? base.sidecarElements,
  };
}

/**
 * Resolve the effective decompose options for a single component. Precedence (highest first):
 * component-scoped override fields (via `components`), then type-scoped resolved values
 * (already applied by `resolveDecomposeOptionsForType`), then run-wide base values (passed
 * through as the typeResolved fallback).
 *
 * Hard plugin rules (e.g. labels and loyaltyProgramSetup forced to `unique-id`) are applied
 * separately by callers, not here, so this function stays pure.
 */
export function resolveDecomposeOptionsForComponent(
  metadataType: string,
  fullName: string,
  typeResolved: ResolvedDecomposeTypeOptions,
  overrides?: DecomposerOverride[],
): ResolvedDecomposeTypeOptions {
  const componentOverride = getOverrideForComponent(metadataType, fullName, overrides);
  if (!componentOverride) return typeResolved;

  return {
    format: componentOverride.decomposedFormat ?? typeResolved.format,
    strategy: componentOverride.strategy ?? typeResolved.strategy,
    decomposeNestedPerms: componentOverride.decomposeNestedPermissions ?? typeResolved.decomposeNestedPerms,
    prepurge: componentOverride.prePurge ?? typeResolved.prepurge,
    postpurge: componentOverride.postPurge ?? typeResolved.postpurge,
    splitTags: componentOverride.splitTags ?? typeResolved.splitTags,
    multiLevel: componentOverride.multiLevel ?? typeResolved.multiLevel,
    uniqueIdElements: componentOverride.uniqueIdElements ?? typeResolved.uniqueIdElements,
    sidecarElements: componentOverride.sidecarElements ?? typeResolved.sidecarElements,
  };
}
