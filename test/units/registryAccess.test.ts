'use strict';

import { describe, expect, it } from 'vitest';

import { RegistryAccess } from '../../src/metadata/registry/registryAccess.js';

describe('RegistryAccess', () => {
  const registry = new RegistryAccess();

  describe('getTypeByName', () => {
    it('resolves a top-level type by exact name', () => {
      const type = registry.getTypeByName('PermissionSet');
      expect(type.name).toBe('PermissionSet');
      expect(type.suffix).toBe('permissionset');
    });

    it('is case-insensitive', () => {
      expect(registry.getTypeByName('permissionset').name).toBe('PermissionSet');
      expect(registry.getTypeByName('PERMISSIONSET').name).toBe('PermissionSet');
    });

    it('resolves a child type via its parent', () => {
      const type = registry.getTypeByName('RecordType');
      expect(type.name).toBe('RecordType');
      expect(type.directoryName).toBe('recordTypes');
    });

    it('follows aliasFor to the aliased type', () => {
      const type = registry.getTypeByName('EmailTemplateFolder');
      expect(type.name).toBe('EmailFolder');
    });

    it('throws for an unknown type name', () => {
      expect(() => registry.getTypeByName('DefinitelyNotARealType')).toThrow(
        'Metadata type not found in registry for name: DefinitelyNotARealType.',
      );
    });

    it('trims surrounding whitespace', () => {
      expect(registry.getTypeByName('  PermissionSet  ').name).toBe('PermissionSet');
    });
  });

  describe('getTypeBySuffix', () => {
    it('resolves a top-level type by suffix', () => {
      const type = registry.getTypeBySuffix('permissionset');
      expect(type?.name).toBe('PermissionSet');
    });

    it('returns undefined for an unknown suffix', () => {
      expect(registry.getTypeBySuffix('definitelyNotARealSuffix')).toBeUndefined();
    });
  });

  describe('getParentType', () => {
    it('returns the parent type for a child type name', () => {
      const parent = registry.getParentType('recordtype');
      expect(parent?.name).toBe('CustomObject');
    });

    it('returns undefined for a non-child type name', () => {
      expect(registry.getParentType('PermissionSet')).toBeUndefined();
    });

    it('is case-insensitive', () => {
      expect(registry.getParentType('RecordType')?.name).toBe('CustomObject');
    });

    it('trims surrounding whitespace', () => {
      expect(registry.getParentType('  recordtype  ')?.name).toBe('CustomObject');
    });
  });

  describe('childTypes', () => {
    it('exposes the raw child-type-id -> parent-type-id map', () => {
      expect(registry.childTypes.recordtype).toBe('customobject');
    });
  });
});
