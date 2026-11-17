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

/**
 * Root element names a type's files can carry. Usually the type name, with known exceptions: each
 * Settings file's root is `<{Name}Settings>` (`BusinessHours.settings-meta.xml` -> `<BusinessHoursSettings>`),
 * and InvocableActionExtension's is `<InvocableActionExt>`.
 */
const ROOT_NAME_ALIASES: Record<string, string[]> = { InvocableActionExtension: ['InvocableActionExt'] };

function rootNamesFor(typeName: string, stem: string): string[] {
  if (typeName === 'Settings') return [`${stem}Settings`];
  return [typeName, ...(ROOT_NAME_ALIASES[typeName] ?? [])];
}

/** Matches the root element in any decomposed format: `<Name` (xml) or a `Name:` / `"Name":` key (yaml/json/json5). */
function hasRootElement(content: string, rootNames: string[]): boolean {
  return rootNames.some((name) => new RegExp(`<${name}[\\s/>]|^\\s*["']?${name}["']?\\s*:`, 'm').test(content));
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

/** Files the disassembler writes beside every file it decomposes. */
const DISASSEMBLER_SIDECARS = ['.key_order.json', '.element_order.json', '.trailing_newline.json'];

/**
 * Whether `dir`, at any depth, holds a real `<name>.<suffix>-meta.xml` file, meaning `dir` is a
 * plain subfolder of metadata (e.g. `flexipages/record-pages/`), not a decomposed directory. Shards
 * are named after their element tag and sit in a folder of that name (`<tag>/<id>.<tag>-meta.<ext>`),
 * so a file with the type's suffix only counts when its folder isn't named after the suffix: a
 * KeywordList's `<keywords>` tag matches its `keywords` suffix (`keywords/a.keywords-meta.xml`).
 */
async function holdsOwnSuffixFiles(dir: string, metaSuffix: string): Promise<boolean> {
  const metaEnding = `.${metaSuffix}-meta.xml`;
  const entries = await readdir(dir, { withFileTypes: true });
  if (basename(dir) !== metaSuffix && entries.some((e) => e.isFile() && e.name.endsWith(metaEnding))) return true;
  for (const sub of entries.filter((e) => e.isDirectory())) {
    // eslint-disable-next-line no-await-in-loop
    if (await holdsOwnSuffixFiles(join(dir, sub.name), metaSuffix)) return true;
  }
  return false;
}

/**
 * Whether `dir` is a directory decomposed from a `metaSuffix` file of type `typeName`, rather than
 * another type's decomposed directory, a plain subfolder of metadata files, or a folder that isn't
 * metadata at all (e.g. UTAM page objects in `flexipages/__utam__/`).
 *
 * - The leaf file (`<dir>.<suffix>-meta.<ext>`) names the suffix directly.
 * - A real `.<suffix>-meta.xml` file anywhere inside means a plain subfolder of metadata.
 * - Otherwise (a root with no leaf elements has no leaf file): in a directory only this type uses
 *   (`shared: false`), the disassembler's sidecars identify it. The root element every fragment
 *   carries is checked where types must be told apart (`shared: true`), and as the fallback for
 *   directories decomposed before the sidecars existed. It can't be required everywhere: a root
 *   need not be named after its type (`BusinessHours.settings-meta.xml` has `<BusinessHoursSettings>`;
 *   see `rootNamesFor` for the known exceptions).
 * - `requireSidecar`: in a folder the type's files were found in by suffix (not named after the
 *   type), only a directory the disassembler produced counts -- a real folder of metadata laid out
 *   one component per folder (`MyFlow/MyFlow.flow-meta.xml`) looks like a leaf file otherwise.
 */
export async function isDecomposedDirOfType(
  dir: string,
  metaSuffix: string,
  typeName: string,
  { shared, requireSidecar = false }: { shared: boolean; requireSidecar?: boolean } = { shared: true },
): Promise<boolean> {
  const stem = basename(dir);
  const files = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isFile()).map((e) => e.name);
  const hasSidecar = files.some((name) => DISASSEMBLER_SIDECARS.includes(name));
  if (requireSidecar && !hasSidecar) return false;
  if (files.some((name) => name.startsWith(`${stem}.${metaSuffix}-meta.`))) return true;
  if (files.some((name) => name.startsWith(`${stem}.`) && name.includes('-meta.'))) return false;
  if (await holdsOwnSuffixFiles(dir, metaSuffix)) return false;

  if (!shared && hasSidecar) return true;
  const fragment = await firstFragmentFile(dir);
  if (!fragment) return false;
  return hasRootElement(await readFile(fragment, 'utf-8'), rootNamesFor(typeName, stem));
}
