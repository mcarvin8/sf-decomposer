'use strict';

import { parseManifestXml } from './manifestXml.js';
import { RegistryAccess } from './registryAccess.js';
import { MetadataType } from './types.js';

export type ManifestComponent = {
  fullName: string;
  type: MetadataType;
};

// Mostly for parents of InFolder types to strip off trailing "/" characters in fullNames.
// Otherwise just returns the fullName. Ported from SDR's ManifestResolver.
function resolveFullName(fullName: string, parentType: MetadataType | undefined): string {
  return parentType?.folderContentType && fullName.endsWith('/') ? fullName.slice(0, -1) : fullName;
}

// Use the folderType instead of the type from the manifest when:
//  1. InFolder types: (report, dashboard, emailTemplate, document)
//    1a. type.inFolder === true AND
//    1b. The fullName doesn't contain a forward slash character AND
//    1c. The fullName with a slash appended is contained in another member entry
// OR
//  2. Non-InFolder, folder types: (territory2, territory2Model, territory2Type, territory2Rule)
//    2a. type.inFolder !== true AND
//    2b. type.folderType has a value AND
//    2c. This type's parent type has a folderType that doesn't match its own id.
// Ported from SDR's ManifestResolver.
function isMemberNestedInFolder(
  fullName: string,
  type: MetadataType,
  parentType: MetadataType,
  members: string[],
): boolean {
  const isInFolderType = type.inFolder;
  const isNestedInFolder = !fullName.includes('/') || members.some((m) => m.includes(`${fullName}/`));
  // Stryker disable next-line ConditionalExpression -- defensive guard; in the current vendored
  // registry every non-InFolder type with a folderType (Territory2 and friends) points at a
  // folder type whose own folderType equals its id, so this is always false when it's actually
  // selected below (isInFolderType is false for exactly those types).
  const isNonMatchingFolder = parentType.folderType !== parentType.id;
  return isInFolderType ? isNestedInFolder : isNonMatchingFolder;
}

// Resolve the correct metadata type from metadata entries in a manifest. Parents of InFolder
// types can be detected by looking for a trailing "/" character. Ported from SDR's ManifestResolver.
function resolveType(
  fullName: string,
  type: MetadataType,
  members: string[],
  parentType: MetadataType | undefined,
): MetadataType {
  /* v8 ignore next 3 -- defensive guard; the only caller only invokes this once parentType and
     type.folderType are both already known truthy (parentType is derived from type.folderType) */
  // Stryker disable next-line ConditionalExpression, LogicalOperator
  if (!parentType || !type.folderType) {
    return type;
  }
  if (parentType.folderContentType && fullName.endsWith('/')) {
    return parentType;
  }
  return isMemberNestedInFolder(fullName, type, parentType, members) ? parentType : type;
}

/**
 * Resolves a package.xml manifest's declared types/members into metadata components (fullName +
 * registry type), replicating the parts of SDR's `ManifestResolver.resolve` this plugin relies
 * on. Unlike SDR's resolver, this never reads the local source tree -- callers already walk the
 * package directories themselves (see parseManifest.ts) to find each component's actual file.
 */
export function resolveManifestComponents(manifestContents: string, registry: RegistryAccess): ManifestComponent[] {
  const { types } = parseManifestXml(manifestContents);

  return types.flatMap(({ name, members }) => {
    const type = registry.getTypeByName(name);
    const parentType = type.folderType ? registry.getTypeByName(type.folderType) : undefined;

    return members.map((fullName) => ({
      fullName: resolveFullName(fullName, parentType),
      type: !parentType ? type : resolveType(fullName, type, members, parentType),
    }));
  });
}
