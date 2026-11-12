'use strict';

import { DEFAULT_UNIQUE_ID_ELEMENTS, UNSUPPORTED_ADAPTERS } from '../helpers/constants.js';
import { MetaAttributes } from '../helpers/types.js';
import { getPackageDirectories } from './getPackageDirectories.js';
import { getUniqueIdElements } from './getUniqueIdElements.js';
import { RegistryAccess } from './registry/registryAccess.js';
import { MetadataType } from './registry/types.js';

// Singleton instance for RegistryAccess to avoid repeated instantiation
let registryAccessInstance: RegistryAccess | null = null;
// Lazy-built reverse map: suffix → child MetadataType (for child types whose suffix differs from xmlName)
let childSuffixMap: Map<string, MetadataType> | null = null;

function getRegistryAccessInstance(): RegistryAccess {
  // Stryker disable next-line ConditionalExpression -- caching is a pure perf optimization here;
  // RegistryAccess itself is a stateless wrapper around registryAccess.ts's own module-level
  // (and therefore already-singleton) registry data, so a "recreated" instance behaves identically.
  if (!registryAccessInstance) {
    registryAccessInstance = new RegistryAccess();
  }
  return registryAccessInstance;
}

function getChildSuffixMap(registryAccess: RegistryAccess): Map<string, MetadataType> {
  // Stryker disable next-line ConditionalExpression -- same reasoning as getRegistryAccessInstance above.
  if (!childSuffixMap) {
    childSuffixMap = new Map();
    for (const childXmlNameLower of Object.keys(registryAccess.childTypes)) {
      const parentType = registryAccess.getParentType(childXmlNameLower);
      // Stryker disable next-line OptionalChaining -- defensive guard; every key in childTypes
      // is guaranteed (by the vendored registry's own invariants) to resolve to a real parentType
      // with a children.types entry for that key.
      const childEntry = parentType?.children?.types[childXmlNameLower];
      // Stryker disable next-line ConditionalExpression, OptionalChaining -- same registry invariant.
      /* v8 ignore next -- defensive guard; SDR registry always provides a suffix for child types */
      if (childEntry?.suffix) {
        childSuffixMap.set(childEntry.suffix, childEntry);
      }
    }
  }
  return childSuffixMap;
}

/**
 * Finds the registry entry a `--metadata-type` value refers to, without validating it: first as a
 * suffix (top-level, then child), then as an exact-case type name (e.g. `CustomSite`). Suffixes
 * win so existing inputs keep resolving as before; this matters for `dataSource`, which is
 * ExternalDataSource's suffix while `DataSource` is another type's name.
 */
function lookupMetadataTypeEntry(metadataType: string): MetadataType | undefined {
  const registryAccess = getRegistryAccessInstance();
  const bySuffix = registryAccess.getTypeBySuffix(metadataType) ?? getChildSuffixMap(registryAccess).get(metadataType);
  if (bySuffix) return bySuffix;
  try {
    const byName = registryAccess.getTypeByName(metadataType);
    // getTypeByName is case-insensitive and follows aliases; only accept the exact type name.
    return byName.name === metadataType ? byName : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves and validates the SDR registry entry for a metadata suffix or exact-case type name
 * (rejects CustomObject, unknown values, and unsupported adapter strategies). Synchronous and side-effect free, so callers can
 * use it to learn a type's `directoryName` ahead of time — e.g. to build a shared
 * `buildPackageDirectoryIndex` covering every requested type in one filesystem walk — without
 * duplicating this lookup logic.
 */
export function resolveMetadataTypeEntry(metadataType: string): MetadataType {
  const metadataTypeEntry = lookupMetadataTypeEntry(metadataType);

  if (metadataTypeEntry === undefined) {
    throw Error(`Metadata type not found for the given suffix or type name: ${metadataType}.`);
  }

  if (metadataTypeEntry.suffix === 'object') {
    throw Error('Custom Objects are not supported by this plugin.');
  }

  if (metadataTypeEntry.strategies?.adapter && UNSUPPORTED_ADAPTERS.includes(metadataTypeEntry.strategies.adapter)) {
    throw Error(
      `Metadata types with ${metadataTypeEntry.strategies.adapter} strategies are not supported by this plugin.`,
    );
  }

  return metadataTypeEntry;
}

/**
 * Whether a type keeps each component in its own folder (`bots/MyBot/MyBot.bot-meta.xml`). SDR's
 * `strictDirectoryName` alone only requires the exact directory name; most such types (CustomSite,
 * EmailServicesFunction, BotTemplate, the policy and restriction-rule types, ...) still keep their
 * files directly in that directory. Only the `decomposed` adapter (Bot, CustomObjectTranslation)
 * uses one folder per component.
 */
export function usesComponentFolders(type: MetadataType): boolean {
  return Boolean(type.strictDirectoryName) && type.strategies?.adapter === 'decomposed';
}

/**
 * When `metadataType` is a suffix shared by several top-level types (e.g. `site`: CustomSite and
 * SiteDotCom), returns the type the suffix resolves to and the others, which can only be selected
 * by type name. Returns `undefined` for unshared suffixes and for type names.
 */
export function typesSharingSuffix(metadataType: string): { selected: string; others: string[] } | undefined {
  const registryAccess = getRegistryAccessInstance();
  const selected = registryAccess.getTypeBySuffix(metadataType);
  if (!selected || selected.suffix !== metadataType) return undefined;
  const others = registryAccess
    .listTypes()
    .filter((t) => t.suffix === metadataType && !t.aliasFor && t.name !== selected.name)
    .map((t) => t.name);
  return others.length > 0 ? { selected: selected.name, others } : undefined;
}

/**
 * The `--metadata-type` value that selects exactly this type: its suffix when the suffix resolves
 * to it, otherwise its type name (types that lose a shared suffix, e.g. CustomSite).
 */
export function selectorForType(type: MetadataType): string {
  /* v8 ignore next -- @preserve: manifest parent types always declare a suffix in SDR's registry. */
  if (!type.suffix) return type.name;
  return getRegistryAccessInstance().getTypeBySuffix(type.suffix)?.name === type.name ? type.suffix : type.name;
}

/**
 * For a child-type suffix whose components only exist inside the parent's file (e.g. `assignmentRule`
 * inside `.assignmentRules-meta.xml`, `workflowAlert` inside `.workflow-meta.xml`), returns the
 * parent to process instead. Returns `undefined` for top-level types, unknown suffixes, and children
 * stored as their own files (children of a `decomposed` parent, e.g. CustomObject's `field`).
 * CustomFieldTranslation is redirected too: it is unaddressable on its own, and its registry
 * directoryName (`fields`) would otherwise point at CustomField files.
 */
export function parentForInFileChildSuffix(
  metaSuffix: string,
): { parentSuffix: string; parentName: string; childName: string } | undefined {
  const registryAccess = getRegistryAccessInstance();
  const entry = lookupMetadataTypeEntry(metaSuffix);
  if (!entry) return undefined;
  const parent = registryAccess.getParentType(entry.id);
  if (!parent?.suffix) return undefined;
  if (parent.strategies?.adapter === 'decomposed' && entry.isAddressable !== false) return undefined;
  return { parentSuffix: parent.suffix, parentName: parent.name, childName: entry.name };
}

export async function getRegistryValuesBySuffix(
  metaSuffix: string,
  command: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
  uniqueIdOverride?: string,
  pathIndex?: { index: Map<string, string[]>; ignorePath: string },
): Promise<{ metaAttributes: MetaAttributes; ignorePath: string }> {
  const metadataTypeEntry = resolveMetadataTypeEntry(metaSuffix);

  let uniqueIdElements: string | undefined;
  if (command === 'decompose')
    uniqueIdElements = uniqueIdOverride ?? getUniqueIdElements(metadataTypeEntry.suffix as string);

  const { metadataPaths, ignorePath } = pathIndex
    ? {
        metadataPaths: pathIndex.index.get(`${metadataTypeEntry.directoryName}`) ?? [],
        ignorePath: pathIndex.ignorePath,
      }
    : await getPackageDirectories(`${metadataTypeEntry.directoryName}`, ignoreDirs, repoRootOverride);
  if (metadataPaths.length === 0)
    throw Error(`No directories named ${metadataTypeEntry.directoryName} were found in any package directory.`);

  const metaAttributes = {
    // The value the type was selected by (suffix or type name); overrides are keyed by it.
    metadataType: metaSuffix,
    metaSuffix: metadataTypeEntry.suffix as string,
    // Despite the name, handlers read this as "one folder per component"; see usesComponentFolders.
    strictDirectoryName: usesComponentFolders(metadataTypeEntry),
    folderType: metadataTypeEntry.folderType as string,
    metadataPaths,
    uniqueIdElements: uniqueIdElements
      ? `${DEFAULT_UNIQUE_ID_ELEMENTS},${uniqueIdElements}`
      : DEFAULT_UNIQUE_ID_ELEMENTS,
  };
  return { metaAttributes, ignorePath };
}
