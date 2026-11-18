'use strict';

/**
 * A path from `sfdx-project.json` (or a `--ignore-package-directory` value) with `\` separators
 * turned into `/`. Projects edited on Windows sometimes write `plugins\\MyPackage`; Windows reads
 * the backslash as a separator, but on macOS and Linux it is an ordinary filename character, so the
 * directory was silently not found there. `/` works on every platform.
 */
export function toPortablePath(path: string): string {
  return path.replace(/\\/g, '/');
}
