'use strict';

import * as fs from 'node:fs';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fsPromises from 'node:fs/promises';
import * as fsSync from 'fs-extra';
import { XMLParser } from 'fast-xml-parser';

import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { setLogLevel } from 'xml-disassembler';
import DecomposerRecompose from '../../../src/commands/decomposer/recompose.js';
import DecomposerDecompose from '../../../src/commands/decomposer/decompose.js';

describe('e2e', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
  let testCounter = 0; // Counter to track the test order

  const originalDirectory: string = 'force-app/main/default';
  const mockDirectory: string = 'mock';
  const metadataTypes = [
    'labels',
    'workflow',
    'bot',
    'profile',
    'permissionset',
    'flow',
    'matchingRule',
    'assignmentRules',
    'escalationRules',
    'sharingRules',
    'autoResponseRules',
    'globalValueSetTranslation',
    'standardValueSetTranslation',
    'translation',
    'globalValueSet',
    'standardValueSet',
    'decisionMatrixDefinition',
    'aiScoringModelDefinition',
    'marketingappextension',
    'app',
  ];

  before(async () => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    setLogLevel('debug');

    // Create a mock directory by copying the original directory
    await copyAsync(originalDirectory, mockDirectory);
  });

  afterEach(() => {
    $$.restore();
    testCounter += 1;

    // Remove the mock directory only after the last test
    if (testCounter === 3) {
      return removeSync(mockDirectory);
    }
  });

  it('should decompose all supported metadata types', async () => {
    for (const metadataType of metadataTypes) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerDecompose.run(['--metadata-type', metadataType, '--dx-directory', mockDirectory]);
      const output = sfCommandStubs.log
        .getCalls()
        .flatMap((c) => c.args)
        .join('\n');
      expect(output).to.include(`All metadata files have been decomposed for the metadata type: ${metadataType}`);
    }
    // delete baseline recomposed files to ensure they are re-made correctly
    const filesToDelete = [
      'mock/aiScoringModelDefinitions/Prediction_Scores_for_Accounts.aiScoringModelDefinition-meta.xml',
      'mock/applications/Dreamhouse.app-meta.xml',
      'mock/assignmentRules/Case.assignmentRules-meta.xml',
      'mock/autoResponseRules/Lead.autoResponseRules-meta.xml',
      'mock/bots/Assessment_Bot/v1.botVersion-meta.xml',
      'mock/bots/Assessment_Bot/Assessment_Bot.bot-meta.xml',
      'mock/decisionMatrixDefinition/HealthCloudUM_ValidRegions.decisionMatrixDefinition-meta.xml',
      'mock/escalationRules/Case.escalationRules-meta.xml',
      'mock/flows/Get_Info.flow-meta.xml',
      'mock/globalValueSets/Countries.globalValueSet-meta.xml',
      'mock/globalValueSetTranslations/Numbers-fr.globalValueSetTranslation-meta.xml',
      'mock/labels/CustomLabels.labels-meta.xml',
      'mock/marketingappextensions/VidLand_US.marketingappextension-meta.xml',
      'mock/matchingRules/Account.matchingRule-meta.xml',
      'mock/permissionsets/HR_Admin.permissionset-meta.xml',
      'mock/profiles/SuperUser.profile-meta.xml',
      'mock/sharingRules/Account.sharingRules-meta.xml',
      'mock/standardValueSets/CaseType.standardValueSet-meta.xml',
      'mock/standardValueSetTranslations/AccountRating-fr.standardValueSetTranslation-meta.xml',
      'mock/translations/sample_de.translation-meta.xml',
      'mock/workflows/Case.workflow-meta.xml',
    ];

    filesToDelete.forEach((file) => {
      fs.unlink(file, (err) => {
        if (err) throw err;
      });
    });
  });

  it('should recompose all supported metadata types', async () => {
    for (const metadataType of metadataTypes) {
      // eslint-disable-next-line no-await-in-loop
      await DecomposerRecompose.run(['--metadata-type', metadataType, '--dx-directory', mockDirectory]);
    }

    // Check if there are no errors in the log
    // Can't clear the existing log to check standard output message
    const errorOutput = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(errorOutput).to.not.include('Error');
  });

  it('should confirm the recomposed files in a mock directory match the reference files (force-app)', async () => {
    compareDirectories(originalDirectory, mockDirectory);
  });
});

interface XmlElement {
  [key: string]: string | XmlElement | string[] | XmlElement[];
}

const XML_PARSER_OPTION = {
  commentPropName: '!---',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  parseTagValue: false,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: false,
  cdataPropName: '![CDATA[',
};

function compareXmls(referenceXml: string, mockXml: string): void {
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  const referenceParsed = xmlParser.parse(referenceXml) as Record<string, XmlElement>;
  const mockParsed = xmlParser.parse(mockXml) as Record<string, XmlElement>;

  assert.deepStrictEqual(referenceParsed, mockParsed, 'XML content is different');
}

function compareDirectories(referenceDir: string, mockDir: string): void {
  const entriesInRef = fs.readdirSync(referenceDir, { withFileTypes: true });

  for (const entry of entriesInRef) {
    const refEntryPath = path.join(referenceDir, entry.name);
    const mockPath = path.join(mockDir, entry.name);

    if (entry.isDirectory()) {
      compareDirectories(refEntryPath, mockPath);
    } else {
      const refContent = fs.readFileSync(refEntryPath, 'utf-8');
      const mockContent = fs.readFileSync(mockPath, 'utf-8');
      compareXmls(refContent, mockContent);
    }
  }
}

async function copyAsync(source: string, destination: string): Promise<void> {
  await fsSync.copy(source, destination, { overwrite: true });
}

function removeSync(directoryPath: string): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  fsPromises.rm(directoryPath, { recursive: true });
}
