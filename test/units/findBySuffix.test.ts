'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { verifyMetadataTypes } from '../../src/core/verifyMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// SDR resolves a `-meta.xml` file's type by its suffix, whatever folder it is in, unless the path is
// inside a strict-folder type's directory (bundles, bots, object translations, ...). sf-decomposer
// used to look only in folders named exactly after the type, silently skipping files in custom
// folders, differently cased folders, other types' folders and nested subfolders.
const NS = 'xmlns="http://soap.sforce.com/2006/04/metadata"';
const SETTINGS_WITH_LEAF = `<?xml version="1.0" encoding="UTF-8"?>
<OrderSettings ${NS}>
    <enableNegativeQuantity>false</enableNegativeQuantity>
    <orderManagementSettings>
        <name>One</name>
        <enabled>true</enabled>
    </orderManagementSettings>
    <orderManagementSettings>
        <name>Two</name>
        <enabled>false</enabled>
    </orderManagementSettings>
</OrderSettings>
`;
// Only nested elements: no leaf file, and the root isn't named after the type (`Settings`).
const SETTINGS_NESTED_ONLY = `<?xml version="1.0" encoding="UTF-8"?>
<BusinessHoursSettings ${NS}>
    <businessHours>
        <name>Default</name>
        <active>true</active>
    </businessHours>
    <businessHours>
        <name>Support</name>
        <active>false</active>
    </businessHours>
</BusinessHoursSettings>
`;
const PERMSET = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet ${NS}>
    <fieldPermissions>
        <editable>true</editable>
        <field>Account.Industry</field>
        <readable>true</readable>
    </fieldPermissions>
    <label>Sample</label>
</PermissionSet>
`;
const FLEXIPAGE = `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage ${NS}>
    <flexiPageRegions>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>
    <masterLabel>Account</masterLabel>
    <type>RecordPage</type>
</FlexiPage>
`;
const FLOW = `<?xml version="1.0" encoding="UTF-8"?>
<Flow ${NS}>
    <apiVersion>62.0</apiVersion>
    <label>Mock Plugin</label>
    <variables>
        <name>records</name>
        <dataType>SObject</dataType>
    </variables>
</Flow>
`;
const RECORD = `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata ${NS}>
    <label>Plugin</label>
    <values>
        <field>Enabled__c</field>
        <value>true</value>
    </values>
</CustomMetadata>
`;
// Root `<InvocableActionExt>`, not the type name; only nested elements.
const EXTENSION = `<?xml version="1.0" encoding="UTF-8"?>
<InvocableActionExt ${NS}>
    <targets>
        <name>Rollup</name>
        <type>apex</type>
    </targets>
    <targets>
        <name>Bulk</name>
        <type>apex</type>
    </targets>
</InvocableActionExt>
`;
const AURA_APP = `<?xml version="1.0" encoding="UTF-8"?>
<AuraDefinitionBundle ${NS}>
    <apiVersion>62.0</apiVersion>
    <description>An Aura application</description>
</AuraDefinitionBundle>
`;

// Every file below is resolved by SDR from its suffix and should be decomposed.
const DECOMPOSABLE: Record<string, string> = {
  'unpackaged/pre/1_settings/Order.settings-meta.xml': SETTINGS_WITH_LEAF,
  'unpackaged/pre/1_settings/BusinessHours.settings-meta.xml': SETTINGS_NESTED_ONLY,
  'force-app/main/permissionSets/Sample.permissionset-meta.xml': PERMSET,
  'force-app/main/flexipages/record-pages/Account_Default.flexipage-meta.xml': FLEXIPAGE,
  'force-app/plugins/customMetadata/MockPlugin.flow-meta.xml': FLOW,
  'force-app/plugins/customMetadata/Plugin.Mock.md-meta.xml': RECORD,
  'force-app/main/extensions/Rollup.invocableactionextension-meta.xml': EXTENSION,
  'force-app/main/applications/Sales.app-meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
<CustomApplication ${NS}>
    <actionOverrides>
        <actionName>View</actionName>
        <content>Sales_Home</content>
    </actionOverrides>
    <label>Sales</label>
</CustomApplication>
`,
};
// Inside a strict-folder type's directory: the bundle's, not CustomApplication's.
const UNTOUCHED: Record<string, string> = {
  'force-app/main/aura/MyApp/MyApp.app-meta.xml': AURA_APP,
};
const TYPES = ['settings', 'permissionset', 'flexipage', 'flow', 'md', 'invocableactionextension', 'app'];

async function readTree(dir: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const full = join(entry.parentPath, entry.name);
    out[
      full
        .slice(dir.length + 1)
        .split('\\')
        .join('/')
    ] = await readFile(full, 'utf-8');
  }
  return out;
}

describe('finding metadata by suffix wherever it lives', () => {
  let projectDir: string;
  const log = vi.fn();
  const options = { metadataTypes: TYPES, format: 'xml', ignoreDirs: undefined, log };

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'find-by-suffix-'));
    for (const [path, content] of Object.entries({ ...DECOMPOSABLE, ...UNTOUCHED })) {
      await mkdir(dirname(join(projectDir, path)), { recursive: true });
      await writeFile(join(projectDir, path), content);
    }
    await writeFile(
      join(projectDir, SFDX_CONFIG_FILE),
      JSON.stringify({
        packageDirectories: [{ path: 'force-app', default: true }, { path: 'unpackaged' }],
        sourceApiVersion: '68.0',
      }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it.each(['unique-id', 'grouped-by-tag'])(
    'decomposes files in any folder and round-trips them byte-for-byte (%s)',
    async (strategy) => {
      const before = await readTree(projectDir);

      await decomposeMetadataTypes({
        ...options,
        prepurge: true,
        postpurge: true,
        strategy,
        decomposeNestedPerms: false,
      });
      const decomposed = await readTree(projectDir);
      for (const path of Object.keys(DECOMPOSABLE)) expect(decomposed, path).not.toHaveProperty(path);
      for (const [path, content] of Object.entries(UNTOUCHED)) expect(decomposed[path], path).toBe(content);

      await recomposeMetadataTypes({ ...options, postpurge: true });
      expect(await readTree(projectDir)).toEqual(before);
    },
  );

  it('verifies files in any folder', async () => {
    const result = await verifyMetadataTypes({
      ...options,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      manifest: undefined,
      overrides: undefined,
    });
    expect(result.drift).toEqual([]);
  });

  it('writes .forceignore and .gitattributes patterns for the folders found by suffix', async () => {
    await decomposeMetadataTypes({
      ...options,
      prepurge: false,
      postpurge: false,
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      updateForceignore: true,
      updateGitattributes: true,
    });
    const forceignore = (await readFile(join(projectDir, '.forceignore'), 'utf-8')).split('\n');
    expect(forceignore).toEqual(
      expect.arrayContaining([
        'unpackaged/pre/1_settings/*/**/*.xml',
        '!unpackaged/pre/1_settings/*.settings-meta.xml',
        'force-app/main/permissionSets/*/**/*.xml',
        '!force-app/main/permissionSets/*.permissionset-meta.xml',
        '!force-app/main/flexipages/record-pages/*.flexipage-meta.xml',
        '!force-app/plugins/customMetadata/*.flow-meta.xml',
      ]),
    );
    const gitattributes = await readFile(join(projectDir, '.gitattributes'), 'utf-8');
    expect(gitattributes).toContain('unpackaged/pre/1_settings/*.settings-meta.xml -diff linguist-generated=true');
  });
});
