'use strict';

import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { ManifestResolver, MetadataType, RegistryAccess } from '@salesforce/source-deploy-retrieve';
import { SFDX_PROJECT_FILE_NAME } from '../helpers/constants.js';
import { SfdxProject } from '../helpers/types.js';
import { getRepoRoot } from '../service/core/getRepoRoot.js';

export type ManifestFilter = {
  // Maps metadata suffix to the set of absolute parent metadata xml file paths
  // resolved from the manifest against the local source.
  parentXmlsBySuffix: Map<string, Set<string>>;
  // Ordered list of suffixes discovered in the manifest.
  suffixes: string[];
  // Non-wildcard manifest members whose XML file was not found in local source.
  unresolvedComponents: Array<{ type: string; member: string }>;
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
  const { repoRoot, dxConfigFilePath } = repoRootOverride
    ? { repoRoot: repoRootOverride, dxConfigFilePath: join(repoRootOverride, SFDX_PROJECT_FILE_NAME) }
    : ((await getRepoRoot()) as { repoRoot: string; dxConfigFilePath: string });
  const absManifestPath = resolve(repoRoot, manifestPath);

  // Stryker disable next-line StringLiteral
  const sfdxProjectRaw: string = await readFile(dxConfigFilePath, 'utf-8');
  const sfdxProject: SfdxProject = JSON.parse(sfdxProjectRaw) as SfdxProject;

  // Stryker disable next-line ArrayDeclaration
  const normalizedIgnoreDirs = (ignoreDirs ?? []).map((dir) => basename(dir));
  const packageDirs = sfdxProject.packageDirectories
    .map((directory) => resolve(repoRoot, directory.path))
    .filter((dir) => !normalizedIgnoreDirs.includes(basename(dir)));

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
  const resolvedPerGroup = await Promise.all(
    groupedEntries.map(async ({ parentType, parentMembers, wildcard }) => {
      const suffix = parentType.suffix;
      /* istanbul ignore next -- @preserve: parent metadata types always declare a suffix in SDR's registry. Stryker disable next-line all */
      if (!suffix) return undefined;

      const typeDirs = await findTypeDirectories(packageDirs, parentType.directoryName);
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

  return { parentXmlsBySuffix, suffixes: orderedSuffixes, unresolvedComponents };
}

async function findTypeDirectories(packageDirs: string[], directoryName: string): Promise<string[]> {
  const results = await Promise.all(packageDirs.map((pkgDir) => searchRecursively(pkgDir, directoryName)));
  return results.flat();
}

async function searchRecursively(dir: string, targetName: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const directMatches = entries
      .filter((entry) => entry.isDirectory() && entry.name === targetName)
      .map((entry) => join(dir, entry.name));

    const nestedPromises = entries
      .filter((entry) => entry.isDirectory() && entry.name !== targetName)
      .map((entry) => searchRecursively(join(dir, entry.name), targetName));

    const nested = await Promise.all(nestedPromises);
    return [...directMatches, ...nested.flat()];
  } catch {
    /* istanbul ignore next -- @preserve: Filesystem permission errors are platform-specific. Stryker disable next-line BlockStatement */
    return [];
  }
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
