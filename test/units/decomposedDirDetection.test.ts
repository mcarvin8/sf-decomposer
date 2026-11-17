'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// Recompose must rebuild exactly the directories decompose produced. Two ways that went wrong:
// - a plain subfolder of real metadata files (`flexipages/record-pages/`) looked decomposed -- its
//   files carry the type's root element -- and was merged into `record-pages.flexipage-meta.xml`,
//   then deleted by --postpurge;
// - a decomposed directory without a leaf file was only recognised by its root element, which
//   needn't match the type name (`BusinessHours.settings-meta.xml` has `<BusinessHoursSettings>`),
//   so it was never rebuilt and its original stayed deleted.
const FLEXIPAGE = (label: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <name>main</name>
        <type>Region</type>
    </flexiPageRegions>
    <flexiPageRegions>
        <name>sidebar</name>
        <type>Region</type>
    </flexiPageRegions>
    <masterLabel>${label}</masterLabel>
    <type>RecordPage</type>
</FlexiPage>
`;
const RECORD = (label: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>false</protected>
    <values>
        <field>Object__c</field>
        <value xsi:type="xsd:string">Account</value>
    </values>
    <values>
        <field>Related__c</field>
        <value xsi:type="xsd:string">${label}</value>
    </values>
</CustomMetadata>
`;
// Only nested elements under the root: no leaf file is written for it.
const BUSINESS_HOURS = `<?xml version="1.0" encoding="UTF-8"?>
<BusinessHoursSettings xmlns="http://soap.sforce.com/2006/04/metadata">
    <businessHours>
        <name>Default</name>
        <active>true</active>
        <default>true</default>
        <timeZoneId>Europe/Oslo</timeZoneId>
    </businessHours>
    <businessHours>
        <name>Support</name>
        <active>true</active>
        <default>false</default>
        <timeZoneId>Europe/Oslo</timeZoneId>
    </businessHours>
</BusinessHoursSettings>
`;

const FILES: Record<string, string> = {
  'flexipages/Home.flexipage-meta.xml': FLEXIPAGE('Home'),
  'flexipages/record-pages/Account_DefaultPage.flexipage-meta.xml': FLEXIPAGE('Account'),
  'flexipages/record-pages/Case_DefaultPage.flexipage-meta.xml': FLEXIPAGE('Case'),
  'customMetadata/TimelineParent.Top.md-meta.xml': RECORD('Top'),
  'customMetadata/TimelineParent/Account/TimelineParent.Account_Event.md-meta.xml': RECORD('Event'),
  'customMetadata/TimelineParent/Account/TimelineParent.Account_Task.md-meta.xml': RECORD('Task'),
  'settings/BusinessHours.settings-meta.xml': BUSINESS_HOURS,
};

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

describe('recompose rebuilds exactly the directories decompose produced', () => {
  let projectDir: string;
  let defaultDir: string;
  const log = vi.fn();

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'decomposed-dir-detection-'));
    defaultDir = join(projectDir, 'force-app', 'main', 'default');
    for (const [path, content] of Object.entries(FILES)) {
      await mkdir(dirname(join(defaultDir, path)), { recursive: true });
      await writeFile(join(defaultDir, path), content);
    }
    await writeFile(
      join(projectDir, SFDX_CONFIG_FILE),
      JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }], sourceApiVersion: '68.0' }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(projectDir);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(projectDir, { recursive: true, force: true });
  });

  it.each(['unique-id', 'grouped-by-tag'])(
    'round-trips subfolders of metadata and roots not named after their type, byte-for-byte (%s)',
    async (strategy) => {
      const options = { metadataTypes: ['flexipage', 'md', 'settings'], format: 'xml', ignoreDirs: undefined, log };

      await decomposeMetadataTypes({
        ...options,
        prepurge: true,
        postpurge: true,
        strategy,
        decomposeNestedPerms: false,
      });
      // The settings file was decomposed (its original purged), so recompose has to rebuild it.
      expect(await readdir(join(defaultDir, 'settings'))).not.toContain('BusinessHours.settings-meta.xml');

      await recomposeMetadataTypes({ ...options, postpurge: true });
      expect(await readTree(defaultDir)).toEqual(FILES);
    },
  );
});
