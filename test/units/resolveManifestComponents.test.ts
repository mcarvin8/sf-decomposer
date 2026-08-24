'use strict';

import { describe, expect, it } from 'vitest';

import { RegistryAccess } from '../../src/metadata/registry/registryAccess.js';
import { resolveManifestComponents } from '../../src/metadata/registry/resolveManifestComponents.js';

function manifest(types: Array<{ name: string; members: string[] }>): string {
  const typeBlocks = types
    .map(
      (t) =>
        `  <types>\n${t.members.map((m) => `    <members>${m}</members>`).join('\n')}\n    <name>${t.name}</name>\n  </types>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n${typeBlocks}\n  <version>58.0</version>\n</Package>`;
}

describe('resolveManifestComponents', () => {
  const registry = new RegistryAccess();

  it('resolves a plain non-folder type unchanged (no parentType)', () => {
    const components = resolveManifestComponents(
      manifest([{ name: 'PermissionSet', members: ['HR_Admin'] }]),
      registry,
    );

    expect(components).toEqual([{ fullName: 'HR_Admin', type: registry.getTypeByName('PermissionSet') }]);
  });

  it('resolves a child type with no folderType unchanged (no parentType)', () => {
    const components = resolveManifestComponents(manifest([{ name: 'CustomLabel', members: ['Greeting'] }]), registry);

    expect(components).toEqual([{ fullName: 'Greeting', type: registry.getTypeByName('CustomLabel') }]);
  });

  it('resolves a nested named member of an InFolder type to the type itself, not the folder type', () => {
    const components = resolveManifestComponents(
      manifest([{ name: 'Report', members: ['FolderX/Report1'] }]),
      registry,
    );

    expect(components).toEqual([{ fullName: 'FolderX/Report1', type: registry.getTypeByName('Report') }]);
  });

  it('resolves a trailing-slash folder member to the folder type and strips the slash', () => {
    const components = resolveManifestComponents(manifest([{ name: 'Report', members: ['FolderX/'] }]), registry);

    expect(components).toEqual([{ fullName: 'FolderX', type: registry.getTypeByName('ReportFolder') }]);
  });

  it('resolves a bare folder-name member to the folder type when a nested sibling member is present', () => {
    const components = resolveManifestComponents(
      manifest([{ name: 'Report', members: ['FolderX', 'FolderX/Report1'] }]),
      registry,
    );

    expect(components).toEqual([
      { fullName: 'FolderX', type: registry.getTypeByName('ReportFolder') },
      { fullName: 'FolderX/Report1', type: registry.getTypeByName('Report') },
    ]);
  });

  it('resolves a non-InFolder folder type (Territory2) to itself, not its folder type', () => {
    const components = resolveManifestComponents(manifest([{ name: 'Territory2', members: ['NA_West'] }]), registry);

    expect(components).toEqual([{ fullName: 'NA_West', type: registry.getTypeByName('Territory2') }]);
  });
});
