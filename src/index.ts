'use strict';

/**
 * Public programmatic API, also published on its own as `sf-decomposer-core` (no Salesforce CLI
 * dependencies). Everything exported here follows semver; anything imported from deeper paths
 * is internal and may change in any release.
 */
import { DECOMPOSED_FILE_TYPES, DECOMPOSED_STRATEGIES } from './helpers/constants.js';

export { decomposeMetadataTypes } from './core/decomposeMetadataTypes.js';
export { recomposeMetadataTypes } from './core/recomposeMetadataTypes.js';
export { verifyMetadataTypes } from './core/verifyMetadataTypes.js';
export type {
  DecomposeInputs,
  RecomposeInputs,
  VerifyInputs,
} from './helpers/runOptions.js';
export {
  isMissingMetadataOrManifest,
  resolveDecomposeOptions,
  resolveRecomposeOptions,
  resolveVerifyOptions,
} from './helpers/runOptions.js';
export type {
  ConfigFile,
  DecomposeOptions,
  DecomposerOverride,
  DecomposerResult,
  RecomposeOptions,
  VerifyDrift,
  VerifyOptions,
  VerifyResult,
} from './helpers/types.js';

/** Supported decomposed file formats (`--format`). */
export const FORMATS: readonly string[] = Object.freeze([...DECOMPOSED_FILE_TYPES]);

/** Supported decompose strategies (`--strategy`). */
export const STRATEGIES: readonly string[] = Object.freeze([...DECOMPOSED_STRATEGIES]);

export default {};
