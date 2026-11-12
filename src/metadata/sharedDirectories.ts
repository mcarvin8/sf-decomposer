'use strict';

import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { RegistryAccess } from './registry/registryAccess.js';
import { MetadataType } from './registry/types.js';

// Some registry types share a directory name (e.g. `moderation` holds both KeywordList
// `.keywords-meta.xml` and ModerationRule `.rule-meta.xml` files; `wave` holds ten Wave types).
// Anything that processes a whole directory for one type must then restrict itself to that
// type's files, or it decomposes / recomposes / ignores the other types' files too.

type DirectoryOccupant = { name: string; suffix: string };

let occupantsByDirectory: Map<string, DirectoryOccupant[]> | undefined;

/**
 * Child types that exist as their own files: children of a `decomposed` parent (e.g. CustomObject ->
 * CustomField under `objects/<Object>/fields/`). Children of other parents only exist inside the
 * parent's file. Unaddressable children (CustomFieldTranslation) are skipped: their registry
 * directoryName (`fields`) isn't where their files actually live.
 */
function childTypesWithOwnFiles(type: MetadataType): MetadataType[] {
  if (type.strategies?.adapter !== 'decomposed') return [];
  return Object.values(type.children?.types ?? {}).filter((child) => child.isAddressable !== false);
}

function buildIndex(): Map<string, DirectoryOccupant[]> {
  const index = new Map<string, DirectoryOccupant[]>();
  for (const type of new RegistryAccess().listTypes()) {
    for (const candidate of [type, ...childTypesWithOwnFiles(type)]) {
      if (!candidate.suffix || candidate.aliasFor) continue;
      const occupants = index.get(candidate.directoryName) ?? [];
      if (!occupants.some((o) => o.suffix === candidate.suffix)) {
        occupants.push({ name: candidate.name, suffix: candidate.suffix });
      }
      index.set(candidate.directoryName, occupants);
    }
  }
  return index;
}

/**
 * For a directory named `directoryName`, returns the registry type that owns `metaSuffix` there and
 * every other type whose files can live in the same directory. `others` is empty for the vast
 * majority of types, which keeps their whole-directory fast paths unchanged.
 */
export function directoryOccupancy(
  directoryName: string,
  metaSuffix: string,
): { typeName: string | undefined; others: DirectoryOccupant[] } {
  occupantsByDirectory ??= buildIndex();
  const occupants = occupantsByDirectory.get(directoryName) ?? [];
  return {
    typeName: occupants.find((o) => o.suffix === metaSuffix)?.name,
    others: occupants.filter((o) => o.suffix !== metaSuffix),
  };
}

/** Matches the root element in any decomposed format: `<Name` (xml) or a `Name:` / `"Name":` key (yaml/json/json5). */
function hasRootElement(content: string, typeName: string): boolean {
  return new RegExp(`<${typeName}[\\s/>]|^\\s*["']?${typeName}["']?\\s*:`, 'm').test(content);
}

async function firstFragmentFile(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });
  const file = entries.find((e) => e.isFile() && !e.name.startsWith('.'));
  if (file) return join(dir, file.name);
  for (const sub of entries.filter((e) => e.isDirectory())) {
    // eslint-disable-next-line no-await-in-loop
    const nested = await firstFragmentFile(join(dir, sub.name));
    if (nested) return nested;
  }
  return undefined;
}

/**
 * Whether the decomposed directory `dir` was produced from a `metaSuffix` file of type `typeName`.
 * The leaf file (`<dir>.<suffix>-meta.<ext>`) names the suffix directly; when the root had no
 * leaf elements there is no leaf file, so fall back to the root element every fragment carries.
 */
export async function isDecomposedDirOfType(dir: string, metaSuffix: string, typeName: string): Promise<boolean> {
  const stem = basename(dir);
  const files = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isFile()).map((e) => e.name);
  if (files.some((name) => name.startsWith(`${stem}.${metaSuffix}-meta.`))) return true;
  if (files.some((name) => name.startsWith(`${stem}.`) && name.includes('-meta.'))) return false;

  const fragment = await firstFragmentFile(dir);
  if (!fragment) return false;
  return hasRootElement(await readFile(fragment, 'utf-8'), typeName);
}
