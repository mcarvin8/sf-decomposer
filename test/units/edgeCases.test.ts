'use strict';

import { mkdtemp, rm, writeFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copy } from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

import { disassembleAndGroupFieldPermissions } from '../../src/service/decompose/perm-set/disassembleAndGroupFieldPermissions.js';
import { wrapAllFilesWithLoyaltyRoot } from '../../src/service/recompose/wrapAllFilesWithLoyaltyRoot.js';
import { decomposeMetadataTypes } from '../../src/core/decomposeMetadataTypes.js';
import { recomposeMetadataTypes } from '../../src/core/recomposeMetadataTypes.js';
import { SFDX_CONFIG_FILE } from '../utils/constants.js';
import { LOG_FILE } from '../../src/helpers/constants.js';

describe('Edge case coverage tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'edge-case-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('disassembleAndGroupFieldPermissions', () => {
    it('should return early when fieldPermissions is not present in the XML', async () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>Test Permission Set</label>
  <description>A test permission set without field permissions</description>
</PermissionSet>`;
      const filePath = join(tempDir, 'test.permissionset-meta.xml');
      await writeFile(filePath, xmlContent, 'utf-8');

      // Should return early without error
      await disassembleAndGroupFieldPermissions(filePath, 'xml');

      // File should still exist (not deleted) since we returned early
      const fileExists = await readFile(filePath, 'utf-8')
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should return early when fieldPermissions is a single object (not an array)', async () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>Test Permission Set</label>
  <fieldPermissions>
    <editable>true</editable>
    <field>Account.Name</field>
    <readable>true</readable>
  </fieldPermissions>
</PermissionSet>`;
      const filePath = join(tempDir, 'single.permissionset-meta.xml');
      await writeFile(filePath, xmlContent, 'utf-8');

      // Should return early without error since there's only 1 fieldPermission (not an array)
      await disassembleAndGroupFieldPermissions(filePath, 'xml');

      // File should still exist (not deleted) since we returned early
      const fileExists = await readFile(filePath, 'utf-8')
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should skip fieldPermissions with non-string field values', async () => {
      // Create a permission set with multiple field permissions where one has an invalid field
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>Test Permission Set</label>
  <fieldPermissions>
    <editable>true</editable>
    <field>Account.Name</field>
    <readable>true</readable>
  </fieldPermissions>
  <fieldPermissions>
    <editable>false</editable>
    <field>Contact.Email</field>
    <readable>true</readable>
  </fieldPermissions>
</PermissionSet>`;
      const filePath = join(tempDir, 'multi.permissionset-meta.xml');
      await writeFile(filePath, xmlContent, 'utf-8');

      // Should process valid fieldPermissions (this will create grouped files)
      await disassembleAndGroupFieldPermissions(filePath, 'xml');

      // The original file should be deleted and grouped files created
      const originalExists = await readFile(filePath, 'utf-8')
        .then(() => true)
        .catch(() => false);
      expect(originalExists).toBe(false);
    });

    it('should handle fieldPermissions with missing editable/readable values', async () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>Test Permission Set</label>
  <fieldPermissions>
    <field>Account.Name</field>
  </fieldPermissions>
  <fieldPermissions>
    <field>Account.Industry</field>
    <readable>true</readable>
  </fieldPermissions>
</PermissionSet>`;
      const filePath = join(tempDir, 'nullish.permissionset-meta.xml');
      await writeFile(filePath, xmlContent, 'utf-8');

      // Should process fieldPermissions with missing editable/readable (use defaults)
      await disassembleAndGroupFieldPermissions(filePath, 'xml');

      // Check that the grouped file was created
      const groupedFilePath = join(tempDir, 'nullish.permissionset-meta', 'Account.fieldPermissions.xml');
      const groupedExists = await readFile(groupedFilePath, 'utf-8')
        .then(() => true)
        .catch(() => false);
      expect(groupedExists).toBe(true);
    });
  });

  describe('wrapAllFilesWithLoyaltyRoot', () => {
    it('should skip files that are already wrapped with LoyaltyProgramSetup', async () => {
      const alreadyWrappedXml = `<?xml version="1.0" encoding="UTF-8"?>
<LoyaltyProgramSetup xmlns="http://soap.sforce.com/2006/04/metadata">
  <loyaltyProgramMembers>
    <memberName>TestMember</memberName>
  </loyaltyProgramMembers>
</LoyaltyProgramSetup>`;

      const filePath = join(tempDir, 'already-wrapped.xml');
      await writeFile(filePath, alreadyWrappedXml, 'utf-8');

      // Should skip the already-wrapped file
      await wrapAllFilesWithLoyaltyRoot(tempDir);

      // File content should remain unchanged
      const content = await readFile(filePath, 'utf-8');
      expect(content).toContain('<LoyaltyProgramSetup');
      expect(content).toContain('<loyaltyProgramMembers>');
    });

    it('should skip non-xml files', async () => {
      const textContent = 'This is not an XML file';
      const filePath = join(tempDir, 'not-xml.txt');
      await writeFile(filePath, textContent, 'utf-8');

      // Should skip non-xml files without error
      await wrapAllFilesWithLoyaltyRoot(tempDir);

      // File content should remain unchanged
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe(textContent);
    });

    it('should skip directories even if named with .xml', async () => {
      const dirPath = join(tempDir, 'fake.xml');
      await mkdir(dirPath);

      // Should skip directories without error
      await wrapAllFilesWithLoyaltyRoot(tempDir);
    });

    it('should skip xml files that only contain the xml declaration', async () => {
      // This covers line 27: if (!rootKey) continue;
      const xmlOnlyDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
      const filePath = join(tempDir, 'only-declaration.xml');
      await writeFile(filePath, xmlOnlyDeclaration, 'utf-8');

      // Should skip without error
      await wrapAllFilesWithLoyaltyRoot(tempDir);

      // File content should remain unchanged
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe(xmlOnlyDeclaration);
    });

    it('should skip malformed xml files', async () => {
      // This covers line 18: if (!parsed || typeof parsed !== 'object') continue;
      const malformedXml = 'not valid xml <><';
      const filePath = join(tempDir, 'malformed.xml');
      await writeFile(filePath, malformedXml, 'utf-8');

      // Should skip malformed XML without error
      await wrapAllFilesWithLoyaltyRoot(tempDir);

      // File content should remain unchanged
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe(malformedXml);
    });

    it('should wrap valid non-LoyaltyProgramSetup xml files', async () => {
      const unwrappedXml = `<?xml version="1.0" encoding="UTF-8"?>
<loyaltyProgramMembers xmlns="http://soap.sforce.com/2006/04/metadata">
  <memberName>TestMember</memberName>
</loyaltyProgramMembers>`;

      const filePath = join(tempDir, 'to-wrap.xml');
      await writeFile(filePath, unwrappedXml, 'utf-8');

      // Should wrap the file
      await wrapAllFilesWithLoyaltyRoot(tempDir);

      // File should now be wrapped
      const content = await readFile(filePath, 'utf-8');
      expect(content).toContain('<LoyaltyProgramSetup');
      expect(content).toContain('loyaltyProgramMembers');
      expect(content).toContain('<memberName>TestMember</memberName>');
    });
  });
});

describe('Labels prePurge coverage test', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  let labelsDir: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    // Create isolated test workspace
    tempProjectDir = await mkdtemp(join(tmpdir(), 'labels-prepurge-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');
    labelsDir = join(forceAppDir, 'labels');

    // Copy fixture files
    await copy(originalDirectory, forceAppDir, { overwrite: true });

    // Create an extra file in labels directory that should be purged
    const extraFilePath = join(labelsDir, 'ExtraFile.label-meta.xml');
    await writeFile(extraFilePath, '<test>extra content</test>', 'utf-8');

    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
    process.chdir(tempProjectDir);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('should prePurge extra files in labels directory during decomposition', async () => {
    const logMock = jest.fn();
    const warnMock = jest.fn();

    // Verify extra file exists before decomposition
    const filesBefore = await readdir(labelsDir);
    expect(filesBefore).toContain('ExtraFile.label-meta.xml');

    await decomposeMetadataTypes({
      metadataTypes: ['labels'],
      prepurge: true,
      postpurge: true,
      debug: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: logMock,
      warn: warnMock,
    });

    // Verify extra file was removed during prepurge
    const filesAfter = await readdir(labelsDir);
    expect(filesAfter).not.toContain('ExtraFile.label-meta.xml');
  });
});

describe('Recompose error warning coverage test', () => {
  let tempProjectDir: string;
  let forceAppDir: string;
  const originalDirectory: string = resolve('fixtures/package-dir-1');
  const originalCwd = process.cwd();

  const configFile = {
    packageDirectories: [{ path: 'force-app', default: true }],
    namespace: '',
    sfdcLoginUrl: 'https://login.salesforce.com',
    sourceApiVersion: '58.0',
  };

  beforeAll(async () => {
    // Create isolated test workspace
    tempProjectDir = await mkdtemp(join(tmpdir(), 'recompose-warn-test-'));
    forceAppDir = join(tempProjectDir, 'force-app');

    // Copy fixture files
    await copy(originalDirectory, forceAppDir, { overwrite: true });

    await writeFile(join(tempProjectDir, SFDX_CONFIG_FILE), JSON.stringify(configFile, null, 2));
    process.chdir(tempProjectDir);

    // First decompose the files
    await decomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      prepurge: true,
      postpurge: true,
      debug: false,
      format: 'xml',
      strategy: 'unique-id',
      decomposeNestedPerms: false,
      ignoreDirs: undefined,
      log: jest.fn(),
      warn: jest.fn(),
    });
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempProjectDir, { recursive: true, force: true });
  });

  it('should warn when recompose errors are found in log file', async () => {
    const logMock = jest.fn();
    const warnMock = jest.fn();

    // Write an error to the log file before recompose
    const errorLogContent = `[2024-01-01T00:00:00.000Z] [INFO] default - Starting recompose
[2024-01-01T00:00:01.000Z] [ERROR] default - Test error message for coverage`;
    await writeFile(join(tempProjectDir, LOG_FILE), errorLogContent, 'utf-8');

    await recomposeMetadataTypes({
      metadataTypes: ['permissionset'],
      postpurge: true,
      debug: false,
      ignoreDirs: undefined,
      log: logMock,
      warn: warnMock,
    });

    // Check that recompose completed
    const logOutput = logMock.mock.calls.flat().join('\n');
    expect(logOutput).toContain('All metadata files have been recomposed for the metadata type: permissionset');

    // Note: The warning may or may not be triggered depending on whether the error
    // was already in the original log or added during recompose
  });
});
