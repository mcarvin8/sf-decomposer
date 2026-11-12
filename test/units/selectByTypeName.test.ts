'use strict';

import { describe, expect, it, vi } from 'vitest';

import {
  getRegistryValuesBySuffix,
  parentForInFileChildSuffix,
  resolveMetadataTypeEntry,
  selectorForType,
  typesSharingSuffix,
  usesComponentFolders,
} from '../../src/metadata/getRegistryValuesBySuffix.js';
import { resolveEffectiveMetadataTypes } from '../../src/metadata/parseManifest.js';

describe('resolveMetadataTypeEntry by suffix or type name', () => {
  it('selects a type that loses a shared suffix by its exact type name', () => {
    expect(resolveMetadataTypeEntry('CustomSite')).toMatchObject({ name: 'CustomSite', suffix: 'site' });
  });

  it('keeps resolving the shared suffix itself to the same type as before', () => {
    // `site` resolves to SiteDotCom, which is blocked (matchingContentFile).
    expect(() => resolveMetadataTypeEntry('site')).toThrow('matchingContentFile');
  });

  it('checks suffixes before names (dataSource is a suffix, DataSource a different type name)', () => {
    expect(resolveMetadataTypeEntry('dataSource').name).toBe('ExternalDataSource');
    expect(resolveMetadataTypeEntry('DataSource').name).toBe('DataSource');
  });

  it('also accepts type names for unshared types and child types', () => {
    expect(resolveMetadataTypeEntry('Flow').suffix).toBe('flow');
    expect(resolveMetadataTypeEntry('CustomField').suffix).toBe('field');
  });

  it('requires the exact type name casing', () => {
    expect(() => resolveMetadataTypeEntry('customsite')).toThrow(
      'Metadata type not found for the given suffix or type name: customsite.',
    );
  });

  it('does not accept an alias name in place of the type it points to', () => {
    // EmailTemplateFolder is a registry alias for EmailFolder.
    expect(() => resolveMetadataTypeEntry('EmailTemplateFolder')).toThrow('Metadata type not found');
  });

  it('rejects CustomObject whether selected by suffix or by name', () => {
    expect(() => resolveMetadataTypeEntry('object')).toThrow('Custom Objects are not supported by this plugin.');
    expect(() => resolveMetadataTypeEntry('CustomObject')).toThrow('Custom Objects are not supported by this plugin.');
  });
});

describe('typesSharingSuffix', () => {
  it('names the resolving type and the others for a shared suffix', () => {
    expect(typesSharingSuffix('site')).toEqual({ selected: 'SiteDotCom', others: ['CustomSite'] });
    expect(typesSharingSuffix('settings')?.others).toContain('ActionableEventOrchDef');
  });

  it('returns undefined for unshared suffixes, type names and unknown values', () => {
    expect(typesSharingSuffix('flow')).toBeUndefined();
    expect(typesSharingSuffix('CustomSite')).toBeUndefined();
    expect(typesSharingSuffix('nope')).toBeUndefined();
  });
});

describe('selectorForType', () => {
  it('uses the suffix when it resolves to the type, otherwise the type name', () => {
    expect(selectorForType(resolveMetadataTypeEntry('flow'))).toBe('flow');
    expect(selectorForType(resolveMetadataTypeEntry('CustomSite'))).toBe('CustomSite');
  });
});

describe('parentForInFileChildSuffix by type name', () => {
  it('redirects an in-file child selected by name to the parent suffix', () => {
    expect(parentForInFileChildSuffix('AssignmentRule')).toMatchObject({ parentSuffix: 'assignmentRules' });
  });
});

describe('getRegistryValuesBySuffix with a type name', () => {
  it('records the selector for overrides and the real suffix for files', async () => {
    const { metaAttributes } = await getRegistryValuesBySuffix(
      'CustomSite',
      'decompose',
      undefined,
      undefined,
      undefined,
      {
        index: new Map([['sites', ['force-app/main/default/sites']]]),
        ignorePath: '.forceignore',
      },
    );
    expect(metaAttributes).toMatchObject({
      metadataType: 'CustomSite',
      metaSuffix: 'site',
      metadataPaths: ['force-app/main/default/sites'],
    });
  });
});

describe('resolveEffectiveMetadataTypes warnings for shared suffixes', () => {
  it('warns which type a shared suffix selects and how to pick another', async () => {
    const log = vi.fn();
    await resolveEffectiveMetadataTypes(['site'], undefined, undefined, undefined, log);
    expect(log).toHaveBeenCalledWith(
      'Warning: `site` is the suffix of SiteDotCom, CustomSite; using SiteDotCom. Pass a type name (e.g. `-m CustomSite`) to select another.',
    );
  });

  it('does not warn when the type is selected by name', async () => {
    const log = vi.fn();
    const { effectiveTypes } = await resolveEffectiveMetadataTypes(
      ['CustomSite'],
      undefined,
      undefined,
      undefined,
      log,
    );
    expect(effectiveTypes).toEqual(['CustomSite']);
    expect(log).not.toHaveBeenCalled();
  });

  it('redirects BotVersion selected by name to bot, like botVersion', async () => {
    const log = vi.fn();
    const { effectiveTypes } = await resolveEffectiveMetadataTypes(
      ['BotVersion'],
      undefined,
      undefined,
      undefined,
      log,
    );
    expect(effectiveTypes).toEqual(['bot']);
  });
});

describe('usesComponentFolders', () => {
  it('is true only for strict types with the decomposed adapter', () => {
    expect(usesComponentFolders(resolveMetadataTypeEntry('bot'))).toBe(true);
    expect(usesComponentFolders(resolveMetadataTypeEntry('objectTranslation'))).toBe(true);
  });

  it('is false for strict types whose files sit directly in their directory', () => {
    for (const type of ['CustomSite', 'xml', 'botTemplate', 'RestrictionRule']) {
      expect(usesComponentFolders(resolveMetadataTypeEntry(type))).toBe(false);
    }
  });

  it('feeds the strictDirectoryName handlers read from metaAttributes', async () => {
    const pathIndex = { index: new Map([['sites', ['s']]]), ignorePath: '.forceignore' };
    const { metaAttributes } = await getRegistryValuesBySuffix(
      'CustomSite',
      'recompose',
      undefined,
      undefined,
      undefined,
      pathIndex,
    );
    expect(metaAttributes.strictDirectoryName).toBe(false);
  });
});
