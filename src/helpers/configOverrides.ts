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

const ALLOWED_OVERRIDE_KEYS = new Set<string>([
  'metadataTypes',
  'decomposedFormat',
  'strategy',
  'decomposeNestedPermissions',
  'prePurge',
  'postPurge',
]);

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

  for (let i = 0; i < overrides.length; i++) {
    const override = overrides[i];
    if (!override || typeof override !== 'object') {
      throw new Error(`Override at index ${i} must be an object.`);
    }

    if (!Array.isArray(override.metadataTypes) || override.metadataTypes.length === 0) {
      throw new Error(`Override at index ${i} must include a non-empty "metadataTypes" array.`);
    }

    for (const key of Object.keys(override)) {
      if (FORBIDDEN_OVERRIDE_KEYS.has(key)) {
        throw new Error(
          `Override at index ${i} contains "${key}", which is a run-scope option and cannot be set per metadata type.`,
        );
      }
      if (!ALLOWED_OVERRIDE_KEYS.has(key)) {
        // Unknown keys are ignored to keep the config forward-compatible.
        continue;
      }
    }

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

    for (const metadataType of override.metadataTypes) {
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
}

/**
 * Find the override (if any) that targets a specific metadata suffix.
 */
export function getOverrideForType(
  metadataType: string,
  overrides?: DecomposerOverride[],
): DecomposerOverride | undefined {
  if (!overrides || overrides.length === 0) return undefined;
  return overrides.find((override) => override.metadataTypes.includes(metadataType));
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

