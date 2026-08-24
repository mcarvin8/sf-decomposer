'use strict';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MetadataRegistryData, MetadataType } from './types.js';

// Read (not statically imported) so the compiled lib/ output doesn't need the tsconfig's
// "module" target bumped just for JSON import-attribute syntax; the wireit "compile" step
// copies metadataRegistry.json next to this file's compiled output.
const registryPath = fileURLToPath(new URL('./metadataRegistry.json', import.meta.url));
const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as MetadataRegistryData;

/**
 * Minimal reimplementation of @salesforce/source-deploy-retrieve's `RegistryAccess`, limited to
 * the lookups this plugin needs (name/suffix/parent resolution) and backed by the vendored
 * metadataRegistry.json instead of the SDR package. Does not support sfdx-project.json
 * `registryCustomizations` / `sourceBehaviorOptions` (SDR's project-level registry variants) —
 * no caller here relied on that.
 */
export class RegistryAccess {
  readonly childTypes: Readonly<Record<string, string>> = registry.childTypes;

  getTypeByName(name: string): MetadataType {
    const lower = name.toLowerCase().trim();
    const parentTypeId = registry.childTypes[lower];
    if (parentTypeId) {
      const childType = registry.types[parentTypeId]?.children?.types[lower];
      if (!childType) {
        throw new Error(`Metadata registry has no child type definition for '${lower}' under '${parentTypeId}'.`);
      }
      return childType;
    }

    const type = registry.types[lower];
    if (!type) {
      throw new Error(`Metadata type not found in registry for name: ${name}.`);
    }
    return type.aliasFor ? registry.types[type.aliasFor] : type;
  }

  getTypeBySuffix(suffix: string): MetadataType | undefined {
    const typeId = registry.suffixes[suffix];
    return typeId ? this.getTypeByName(typeId) : undefined;
  }

  getParentType(childName: string): MetadataType | undefined {
    const lower = childName.toLowerCase().trim();
    const parentTypeId = registry.childTypes[lower];
    return parentTypeId ? registry.types[parentTypeId] : undefined;
  }
}
