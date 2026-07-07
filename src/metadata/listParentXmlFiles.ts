'use strict';

import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { CONCURRENCY_LIMITS, CUSTOM_LABELS_FILE } from '../helpers/constants.js';
import { pLimit } from '../helpers/pLimit.js';
import { MetaAttributes } from '../helpers/types.js';

export type ParentXmlFile = {
  /** Absolute path to the parent metadata XML file. */
  filePath: string;
  /** Component identity, used to resolve component-scope config overrides. */
  fullName: string;
};

/**
 * One-level `readdir` of `dir`, filtered to files ending in `.${metaSuffix}-meta.xml`.
 * Same glob `perFileHandler` (`decomposeFileHandler.ts`) already uses. Returns `[]`
 * when `dir` doesn't exist, matching the swallow-errors convention used elsewhere for
 * directory walks (e.g. `getPackageDirectories.searchRecursively`).
 */
export async function listSuffixFiles(dir: string, metaSuffix: string): Promise<ParentXmlFile[]> {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(metaEnding))
    .map((entry) => ({
      filePath: join(dir, entry.name),
      fullName: entry.name.slice(0, -metaEnding.length),
    }));
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Every parent XML file inside a single `strictDirectoryName`/`folderType` component directory
 * (e.g. `bots/MyBot` or `reports/MyFolder`), with `fullName` set uniformly to the *directory's*
 * basename for every file found. This matches `subDirectoryHandler`
 * (`decomposeFileHandler.ts`): it resolves component-scope config overrides exactly once per
 * component directory (keyed by that directory's own name) and applies the result to every file
 * the crate's directory-mode disassemble finds inside — not per individual file. A folder-typed
 * directory holding several reports resolves overrides once for the whole folder, not once per
 * report.
 *
 * Bots are a special case worth calling out: a bot's component directory holds both
 * `<name>.bot-meta.xml` and one or more sibling `<version>.botVersion-meta.xml` files
 * (confirmed against `fixtures/package-dir-2/bots/*`). Both are real decomposable content that
 * the crate's directory-mode disassemble processes, so both must be discovered here too, or
 * bot version files are silently never verified at all.
 */
async function listComponentDirFiles(componentDir: string, metaSuffix: string): Promise<ParentXmlFile[]> {
  const files = await listSuffixFiles(componentDir, metaSuffix);
  const versionFiles = metaSuffix === 'bot' ? await listSuffixFiles(componentDir, 'botVersion') : [];
  const fullName = basename(componentDir);
  return [...files, ...versionFiles].map((file) => ({ ...file, fullName }));
}

/**
 * List every parent metadata XML file on disk for a resolved metadata type, mirroring the file
 * shapes `decomposeFileHandler.ts` discovers during a real decompose — but read-only, and without
 * the override-driven `perFileHandler` vs. whole-directory split (that split only changes *how*
 * real decompose disassembles a file, not *which* files exist; every file this function finds
 * would eventually be visited by a real decompose run one way or another).
 *
 * `fullName` on each result is the same component identity `decomposeFileHandler.ts` uses to
 * resolve component-scope config overrides (directory basename for `strictDirectoryName`/
 * `folderType` types, filename minus the meta suffix ending otherwise).
 */
export async function listParentXmlFilesForType(
  metaAttributes: MetaAttributes,
  manifestXmlPaths?: Set<string>,
): Promise<ParentXmlFile[]> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths } = metaAttributes;

  if (manifestXmlPaths && manifestXmlPaths.size > 0) {
    if (strictDirectoryName || folderType) {
      // Mirrors decomposeFromManifest: dedupe by parent component directory and process the
      // whole directory, since a folder-typed manifest entry may share its directory with
      // sibling components the manifest itself never mentioned by path.
      const componentDirs = new Set(Array.from(manifestXmlPaths).map((xmlPath) => dirname(xmlPath)));
      const results = await Promise.all(
        Array.from(componentDirs).map((componentDir) => listComponentDirFiles(componentDir, metaSuffix)),
      );
      return results.flat();
    }
    const metaEnding = `.${metaSuffix}-meta.xml`;
    return Array.from(manifestXmlPaths).map((filePath) => ({
      filePath,
      fullName: basename(filePath).endsWith(metaEnding)
        ? basename(filePath).slice(0, -metaEnding.length)
        : basename(filePath),
    }));
  }

  const dirLimit = pLimit(CONCURRENCY_LIMITS.PACKAGE_DIRS);

  if (metaSuffix === 'labels') {
    const results = await Promise.all(
      metadataPaths.map((metadataPath) =>
        dirLimit(async () => {
          const filePath = join(metadataPath, CUSTOM_LABELS_FILE);
          return (await pathExists(filePath)) ? [{ filePath, fullName: 'CustomLabels' }] : [];
        }),
      ),
    );
    return results.flat();
  }

  if (strictDirectoryName || folderType) {
    const perPathResults = await Promise.all(
      metadataPaths.map((metadataPath) =>
        dirLimit(async () => {
          let entries;
          try {
            entries = await readdir(metadataPath, { withFileTypes: true });
          } catch {
            return [] as ParentXmlFile[];
          }
          const componentDirNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

          const subLimit = pLimit(CONCURRENCY_LIMITS.SUBDIRECTORIES);
          const perComponent = await Promise.all(
            componentDirNames.map((componentDirName) =>
              subLimit(() => listComponentDirFiles(join(metadataPath, componentDirName), metaSuffix)),
            ),
          );
          return perComponent.flat();
        }),
      ),
    );
    return perPathResults.flat();
  }

  const perPathResults = await Promise.all(
    metadataPaths.map((metadataPath) => dirLimit(() => listSuffixFiles(metadataPath, metaSuffix))),
  );
  return perPathResults.flat();
}
