'use strict';

import { multiLevelDefaults } from './multiLevelDefaults.js';

/**
 * Built-in `multiLevel` rules for a metadata suffix, or `undefined` if the
 * suffix has no default. The caller is responsible for honoring user-supplied
 * `multiLevel` overrides first - this function only returns the fallback.
 */
export function getMultiLevelDefault(metaSuffix: string): string[] | undefined {
  return multiLevelDefaults[metaSuffix];
}
