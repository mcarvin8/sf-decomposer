'use strict';

import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { ManifestResolver, MetadataType, RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { getRepoRoot } from '../service/core/getRepoRoot.js';
import { buildPackageDirectoryIndex } from './getPackageDirectories.js';

export type ManifestFilter = {
  // Maps metadata suffix to the set of absolute parent metadata xml file paths
  // resolved from the manifest against the local source.
  parentXmlsBySuffix: Map<string, Set<string>>;
  // Ordered list of suffixes discovered in the manifest.
  suffixes: string[];
  // Non-wildcard manifest members whose XML file was not found in local source.
  unresolvedComponents: Array<{ type: string; member: string }>;
  // The package-directory index already built here to resolve manifest entries, covering every
  // parent type's directoryName found in the manifest. Callers (decomposeMetadataTypes.ts etc.)
  // reuse this directly in manifest mode instead of building a second, redundant one -- every
  // suffix that survives into `suffixes` above already has real, verified directories in here.
  directoryIndex: { index: Map<string, string[]>; ignorePath: string };
};

type GroupedMembers = {
  parentType: MetadataType;
  parentMembers: Set<string>;
  wildcard: boolean;
};

export async function parseManifest(
  manifestPath: string,
  ignoreDirs: string[] | undefined,
  repoRootOverride?: string,
): Promise<ManifestFilter> {
  const { repoRoot } = repoRootOverride
    ? { repoRoot: repoRootOverride }
    : ((await getRepoRoot()) as { repoRoot: string });
  const absManifestPath = resolve(repoRoot, manifestPath);

  const registry = new RegistryAccess();
  const resolver = new ManifestResolver(undefined, registry);
  const { components } = await resolver.resolve(absManifestPath);

  // Group declared manifest entries by their effective parent metadata type.
  const byParentType = new Map<string, GroupedMembers>();
  for (const component of components) {
    const parentType = registry.getParentType(component.type.name) ?? component.type;
    const parentMember = component.fullName.split('.')[0];
    const isWildcard = component.fullName === '*' || parentMember === '*';

    let entry = byParentType.get(parentType.name);
    if (!entry) {
      entry = { parentType, parentMembers: new Set<string>(), wildcard: false };
      byParentType.set(parentType.name, entry);
    }
    if (isWildcard) {
      entry.wildcard = true;
    } else {
      entry.parentMembers.add(parentMember);
    }
  }

  const parentXmlsBySuffix = new Map<string, Set<string>>();
  const orderedSuffixes: string[] = [];

  const groupedEntries = Array.from(byParentType.values());

  // Resolve every group's type directory in one shared walk instead of one full recursive walk
  // per parent type (mirrors buildPackageDirectoryIndex's use in getRegistryValuesBySuffix.ts for
  // the non-manifest path).
  const directoryNames = new Set(groupedEntries.map(({ parentType }) => `${parentType.directoryName}`));
  const directoryIndex = await buildPackageDirectoryIndex(directoryNames, ignoreDirs, repoRoot);
  const { index: directoryPathsByName } = directoryIndex;

  const resolvedPerGroup = await Promise.all(
    groupedEntries.map(async ({ parentType, parentMembers, wildcard }) => {
      const suffix = parentType.suffix;
      /* istanbul ignore next -- @preserve: parent metadata types always declare a suffix in SDR's registry. Stryker disable next-line all */
      if (!suffix) return undefined;

      const typeDirs = directoryPathsByName.get(`${parentType.directoryName}`) ?? [];
      // Stryker disable next-line ConditionalExpression
      if (typeDirs.length === 0) {
        const unresolvedMembers = wildcard ? [] : [...parentMembers];
        return { suffix, xmlPaths: new Set<string>(), unresolvedMembers };
      }

      const xmlPaths = new Set<string>();
      const resolvedMembers = new Set<string>();
      // Stryker disable next-line ArrayDeclaration
      const resolveTasks: Array<Promise<void>> = [];

      if (wildcard) {
        resolveTasks.push(
          ...typeDirs.map(async (typeDir) => {
            const found = await listParentXmlPaths(typeDir, parentType);
            for (const xmlPath of found) xmlPaths.add(xmlPath);
          }),
        );
      }

      for (const member of parentMembers) {
        resolveTasks.push(
          ...typeDirs.map(async (typeDir) => {
            const xmlPath = await resolveMemberXml(typeDir, parentType, member);
            if (xmlPath) {
              xmlPaths.add(xmlPath);
              resolvedMembers.add(member);
            }
          }),
        );
      }

      await Promise.all(resolveTasks);

      const unresolvedMembers = [...parentMembers].filter((m) => !resolvedMembers.has(m));
      return { suffix, xmlPaths, unresolvedMembers };
    }),
  );

  const unresolvedComponents: Array<{ type: string; member: string }> = [];

  for (const entry of resolvedPerGroup) {
    /* istanbul ignore next -- @preserve: undefined only reachable via the suffix-less branch already ignored above. Stryker disable next-line ConditionalExpression */
    if (!entry) continue;
    const { suffix, xmlPaths, unresolvedMembers } = entry;

    for (const member of unresolvedMembers) {
      unresolvedComponents.push({ type: suffix, member });
    }

    if (xmlPaths.size === 0) continue;

    /* istanbul ignore else -- @preserve: multiple parent types sharing a suffix is not produced by SDR's registry. Stryker disable next-line ConditionalExpression: */
    if (!parentXmlsBySuffix.has(suffix)) {
      parentXmlsBySuffix.set(suffix, xmlPaths);
      orderedSuffixes.push(suffix);
    } else {
      const existing = parentXmlsBySuffix.get(suffix) as Set<string>;
      for (const xmlPath of xmlPaths) existing.add(xmlPath);
    }
  }

  return { parentXmlsBySuffix, suffixes: orderedSuffixes, unresolvedComponents, directoryIndex };
}

/**
 * Resolve the effective list of metadata suffixes to process for a decompose/recompose run,
 * combining the `--manifest` and `--metadata-type` inputs (manifest suffixes are filtered down
 * to the requested types when both are given), then normalizing the deprecated `botVersion`
 * suffix to `bot`. Shared by `decomposeMetadataTypes` and `recomposeMetadataTypes`.
 */
export async function resolveEffectiveMetadataTypes(
  metadataTypes: string[] | undefined,
  manifest: string | undefined,
  ignoreDirs: string[] | undefined,
  repoRoot: string | undefined,
  log: (message: string) => void,
): Promise<{ manifestFilter: ManifestFilter | undefined; effectiveTypes: string[] }> {
  let manifestFilter: ManifestFilter | undefined;
  let effectiveTypes: string[];

  if (manifest) {
    manifestFilter = await parseManifest(manifest, ignoreDirs, repoRoot);
    for (const { type, member } of manifestFilter.unresolvedComponents) {
      log(`Warning: manifest component ${type}:${member} not found in local source; skipping.`);
    }
    // Stryker disable next-line ConditionalExpression, EqualityOperator
    if (metadataTypes && metadataTypes.length > 0) {
      const manifestTypes = new Set(manifestFilter.suffixes);
      effectiveTypes = metadataTypes.filter((type) => manifestTypes.has(type));
    } else {
      effectiveTypes = manifestFilter.suffixes;
    }
  } else {
    if (!metadataTypes || metadataTypes.length === 0) {
      throw Error('Either --metadata-type or --manifest must be provided.');
    }
    effectiveTypes = metadataTypes;
  }

  if (effectiveTypes.some((t) => t === 'botVersion')) {
    log('Warning: `botVersion` suffix is not supported; automatically using `bot` instead.');
    effectiveTypes = [...new Set(effectiveTypes.map((t) => (t === 'botVersion' ? 'bot' : t)))];
  }

  return { manifestFilter, effectiveTypes };
}

async function resolveMemberXml(
  typeDir: string,
  parentType: MetadataType,
  member: string,
): Promise<string | undefined> {
  const { suffix, strictDirectoryName, folderType } = parentType;
  /* istanbul ignore next -- @preserve: types reaching this point always have a suffix Stryker disable next-line all: paired with the istanbul-ignore above. */
  if (!suffix) return undefined;

  // Labels type has a single file regardless of member name.
  if (parentType.name === 'CustomLabels') {
    const labelsFile = join(typeDir, `CustomLabels.${suffix}-meta.xml`);
    /* istanbul ignore next -- @preserve: labels file absence implies a broken labels directory */
    return (await exists(labelsFile)) ? resolve(labelsFile) : undefined;
  }

  // Stryker disable next-line ConditionalExpression, BlockStatement
  if (folderType) {
    // Folder-scoped types (e.g. Report, Dashboard, EmailTemplate, Document).
    // Member is of the form `<folder>/<name>`; file is `<typeDir>/<folder>/<name>.<suffix>-meta.xml`.
    const candidate = join(typeDir, `${member}.${suffix}-meta.xml`);
    return (await exists(candidate)) ? resolve(candidate) : undefined;
  }

  if (strictDirectoryName) {
    const candidate = join(typeDir, member, `${member}.${suffix}-meta.xml`);
    return (await exists(candidate)) ? resolve(candidate) : undefined;
  }

  const candidate = join(typeDir, `${member}.${suffix}-meta.xml`);
  return (await exists(candidate)) ? resolve(candidate) : undefined;
}

async function listParentXmlPaths(typeDir: string, parentType: MetadataType): Promise<string[]> {
  const { suffix, strictDirectoryName } = parentType;
  /* istanbul ignore next -- @preserve: types reaching this point always have a suffix Stryker disable next-line all: paired with the istanbul-ignore above. */
  if (!suffix) return [];

  const metaEnding = `.${suffix}-meta.xml`;

  if (strictDirectoryName) {
    const entries = await readdir(typeDir, { withFileTypes: true });
    const results = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const candidate = join(typeDir, entry.name, `${entry.name}${metaEnding}`);
          return (await exists(candidate)) ? resolve(candidate) : undefined;
        }),
    );
    return results.filter((found): found is string => found !== undefined);
  }

  // Note: folder-typed parents (Report/Dashboard/EmailTemplate/Document) are not reachable here
  // because manifest wildcards for those types resolve to their corresponding *Folder type,
  // which carries no folderType property. Specific members of folder-typed parents are resolved
  // via resolveMemberXml below.
  const entries = await readdir(typeDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(metaEnding))
    .map((entry) => resolve(join(typeDir, entry.name)));
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    // Stryker disable next-line BlockStatement
    return false;
  }
}
