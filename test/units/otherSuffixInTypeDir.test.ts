'use strict';

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';

// A type is resolved by its file suffix, not its folder, so a project can keep another type's file
// in a type's directory -- NebulaLogger keeps flows in a `customMetadata` folder. Decomposing `md`
// used to hand the disassembler the whole folder, splitting the flow too; recompose then (rightly)
// didn't rebuild it as custom metadata, so the flow was lost.
const RECORD = (name: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${name}</label>
    <protected>false</protected>
    <values>
        <field>IsEnabled__c</field>
        <value xsi:type="xsd:boolean">true</value>
    </values>
    <values>
        <field>Description__c</field>
        <value xsi:type="xsd:string">${name} plugin</value>
    </values>
</CustomMetadata>
`;
const FLOW = `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <label>Mock Plugin</label>
    <processType>AutoLaunchedFlow</processType>
    <variables>
        <name>records</name>
        <dataType>SObject</dataType>
        <isCollection>true</isCollection>
        <isInput>true</isInput>
        <isOutput>false</isOutput>
    </variables>
    <variables>
        <name>triggerOperationType</name>
        <dataType>String</dataType>
        <isCollection>false</isCollection>
        <isInput>true</isInput>
        <isOutput>false</isOutput>
    </variables>
</Flow>
`;

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

describe('a type directory that also holds another type’s files', () => {
  let projectDir: string;
  let cmdtDir: string;
  const log = vi.fn();

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'other-suffix-'));
    cmdtDir = join(projectDir, 'force-app', 'plugins', 'customMetadata');
    await mkdir(cmdtDir, { recursive: true });
    await writeFile(join(cmdtDir, 'LoggerPlugin.Mock.md-meta.xml'), RECORD('Mock'));
    await writeFile(join(cmdtDir, 'LoggerPlugin.Other.md-meta.xml'), RECORD('Other'));
    await writeFile(join(cmdtDir, 'MockLogBatchPurgerPlugin.flow-meta.xml'), FLOW);
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
    'decomposes only its own files and round-trips the folder byte-for-byte (%s)',
    async (strategy) => {
      const before = await readTree(cmdtDir);
      const options = { metadataTypes: ['md'], format: 'xml', ignoreDirs: undefined, log };

      await decomposeMetadataTypes({
        ...options,
        prepurge: true,
        postpurge: true,
        strategy,
        decomposeNestedPerms: false,
      });
      const decomposed = await readdir(cmdtDir);
      expect(decomposed).toContain('MockLogBatchPurgerPlugin.flow-meta.xml');
      expect(decomposed).not.toContain('MockLogBatchPurgerPlugin');

      await recomposeMetadataTypes({ ...options, postpurge: true });
      expect(await readTree(cmdtDir)).toEqual(before);
    },
  );
});
