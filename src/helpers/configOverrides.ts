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
  /* istanbul ignore if -- @preserve: getRepoRoot throws when no sfdx-project.json ancestor exists, so repoRoot is always defined here. */
  if (!repoRoot) {
    throw new Error(`Cannot locate ${HOOK_CONFIG_JSON}: repo root not found.`);
  }
  const configPath = resolve(repoRoot, HOOK_CONFIG_JSON);
  try {
    await access(configPath);
  } catch {
    throw new Error(
      `--config was provided but ${HOOK_CONFIG_JSON} was not found at ${configPath}. ` +
        'Create the file in the repo root or omit --config.',
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
};

/**
 * Load and validate the `overrides` array from a `.sfdecomposer.config.json` file.
 * Returns an empty array if the file is missing, unreadable, or contains no overrides.
 */
export async function loadOverridesFromConfig(configPath: string): Promise<DecomposerOverride[]> {
  let raw: string;
  try {
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
    throw new Error(`Failed to parse ${configPath}: ${message}`);
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
  if (!overrides || overrides.length === 0) return undefined;
  const key = `${metadataType}:${fullName}`;
  return overrides.find((override) => override.components?.includes(key));
}

/**
 * Returns true when at least one override targets a component of the given metadata type.
 * Used by the decompose handler to decide whether per-component enumeration is required.
 */
export function hasComponentOverridesForType(metadataType: string, overrides?: DecomposerOverride[]): boolean {
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
  };
}
