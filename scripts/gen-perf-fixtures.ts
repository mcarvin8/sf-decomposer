/*
 * Deterministic generator for large synthetic Salesforce metadata fixtures.
 *
 * Produces XML files that mimic the *shape* and *scale* of metadata typically
 * found in large, long-lived orgs (5MB+ permission sets, 1MB+ applications,
 * 800KB+ bot versions, 400KB+ flows, etc.) without copying any real-world
 * customer data.
 *
 * Output is fully deterministic given the same profile + seed: every identifier
 * is generated from a counter so the bytes on disk are byte-identical between
 * runs. This lets us measure decompose/recompose performance and assert
 * round-trip stability without leaking any proprietary metadata into the repo.
 *
 * Usage:
 *   node --import ts-node/esm scripts/gen-perf-fixtures.ts [--profile large] [--out perf-fixtures]
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Profile = 'small' | 'medium' | 'large' | 'xlarge';

export interface SizeSpec {
  permissionSet: {
    fieldPerms: number;
    objectPerms: number;
    appVis: number;
    classAccesses: number;
    pageAccesses: number;
    tabSettings: number;
    recordTypeVis: number;
  };
  profile: {
    fieldPerms: number;
    objectPerms: number;
    appVis: number;
    classAccesses: number;
    pageAccesses: number;
    tabSettings: number;
    recordTypeVis: number;
    layoutAssignments: number;
  };
  flow: { decisions: number; assignments: number; recordLookups: number; actionCalls: number; variables: number };
  workflow: { alerts: number; fieldUpdates: number; rules: number };
  labels: { count: number };
  application: { actionOverrides: number; profileActionOverrides: number; tabs: number };
  globalValueSet: { customValues: number };
  bot: { dialogs: number; mlIntents: number };
  // Round-trip regression target for path-segment sanitization (config-disassembler
  // 0.5.0 / config-disassembler-node 1.3.0). A non-trivial subset of the generated
  // milestoneName values contains characters that are illegal in a path segment
  // (`/`, `:`, `*`, `?`, etc.). Sanitization is a no-op for safe identifiers, so
  // existing perf coverage is unaffected; if sanitization ever regresses, those
  // milestones either fail to write or land in phantom subdirectories and the
  // recomposed bytes drop below the 0.99 retention threshold.
  entitlementProcess: { milestones: number };
}

const PROFILES: Record<Profile, SizeSpec> = {
  small: {
    permissionSet: {
      fieldPerms: 200,
      objectPerms: 50,
      appVis: 20,
      classAccesses: 50,
      pageAccesses: 30,
      tabSettings: 30,
      recordTypeVis: 20,
    },
    profile: {
      fieldPerms: 400,
      objectPerms: 80,
      appVis: 30,
      classAccesses: 80,
      pageAccesses: 40,
      tabSettings: 40,
      recordTypeVis: 30,
      layoutAssignments: 40,
    },
    flow: { decisions: 30, assignments: 30, recordLookups: 20, actionCalls: 20, variables: 30 },
    workflow: { alerts: 30, fieldUpdates: 30, rules: 30 },
    labels: { count: 200 },
    application: { actionOverrides: 100, profileActionOverrides: 50, tabs: 20 },
    globalValueSet: { customValues: 100 },
    bot: { dialogs: 30, mlIntents: 20 },
    entitlementProcess: { milestones: 30 },
  },
  medium: {
    permissionSet: {
      fieldPerms: 2_000,
      objectPerms: 200,
      appVis: 50,
      classAccesses: 200,
      pageAccesses: 100,
      tabSettings: 100,
      recordTypeVis: 80,
    },
    profile: {
      fieldPerms: 4_000,
      objectPerms: 300,
      appVis: 80,
      classAccesses: 300,
      pageAccesses: 150,
      tabSettings: 150,
      recordTypeVis: 120,
      layoutAssignments: 200,
    },
    flow: { decisions: 100, assignments: 120, recordLookups: 80, actionCalls: 80, variables: 100 },
    workflow: { alerts: 150, fieldUpdates: 150, rules: 150 },
    labels: { count: 1_000 },
    application: { actionOverrides: 500, profileActionOverrides: 250, tabs: 50 },
    globalValueSet: { customValues: 500 },
    bot: { dialogs: 150, mlIntents: 80 },
    entitlementProcess: { milestones: 80 },
  },
  large: {
    // Calibrated against shapes seen in large 10+ year-old orgs:
    //   permission set ~3MB, profile ~5MB, flow ~400KB, workflow ~500KB,
    //   labels ~1MB, application ~1.8MB, bot version ~800KB, GVS ~200KB.
    permissionSet: {
      fieldPerms: 12_000,
      objectPerms: 500,
      appVis: 100,
      classAccesses: 800,
      pageAccesses: 300,
      tabSettings: 300,
      recordTypeVis: 250,
    },
    profile: {
      fieldPerms: 22_000,
      objectPerms: 800,
      appVis: 150,
      classAccesses: 1_500,
      pageAccesses: 500,
      tabSettings: 500,
      recordTypeVis: 400,
      layoutAssignments: 800,
    },
    flow: { decisions: 250, assignments: 300, recordLookups: 200, actionCalls: 200, variables: 250 },
    workflow: { alerts: 400, fieldUpdates: 400, rules: 400 },
    labels: { count: 4_000 },
    application: { actionOverrides: 2_500, profileActionOverrides: 1_500, tabs: 100 },
    globalValueSet: { customValues: 1_500 },
    bot: { dialogs: 600, mlIntents: 250 },
    entitlementProcess: { milestones: 150 },
  },
  xlarge: {
    permissionSet: {
      fieldPerms: 25_000,
      objectPerms: 1_000,
      appVis: 200,
      classAccesses: 1_500,
      pageAccesses: 600,
      tabSettings: 600,
      recordTypeVis: 500,
    },
    profile: {
      fieldPerms: 45_000,
      objectPerms: 1_500,
      appVis: 250,
      classAccesses: 3_000,
      pageAccesses: 1_000,
      tabSettings: 1_000,
      recordTypeVis: 800,
      layoutAssignments: 1_500,
    },
    flow: { decisions: 500, assignments: 600, recordLookups: 400, actionCalls: 400, variables: 500 },
    workflow: { alerts: 800, fieldUpdates: 800, rules: 800 },
    labels: { count: 8_000 },
    application: { actionOverrides: 5_000, profileActionOverrides: 3_000, tabs: 200 },
    globalValueSet: { customValues: 3_000 },
    bot: { dialogs: 1_200, mlIntents: 500 },
    entitlementProcess: { milestones: 300 },
  },
};

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = ' xmlns="http://soap.sforce.com/2006/04/metadata"';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, '0');
}

/** Deterministic UUID-ish identifier from a counter. */
function detId(idx: number): string {
  const hex = idx.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

/** Stable cycle through a small finite set so the data has variety. */
function pick<T>(arr: readonly T[], idx: number): T {
  return arr[idx % arr.length] as T;
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function genPermissionSet(spec: SizeSpec['permissionSet']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<PermissionSet${NS}>`);

  for (let i = 1; i <= spec.appVis; i++) {
    lines.push('    <applicationVisibilities>');
    lines.push(`        <application>Sample_App_${pad(i, 4)}</application>`);
    lines.push(`        <visible>${i % 2 === 0 ? 'true' : 'false'}</visible>`);
    lines.push('    </applicationVisibilities>');
  }

  for (let i = 1; i <= spec.classAccesses; i++) {
    lines.push('    <classAccesses>');
    lines.push(`        <apexClass>Sample_Class_${pad(i, 5)}</apexClass>`);
    lines.push('        <enabled>true</enabled>');
    lines.push('    </classAccesses>');
  }

  for (let i = 1; i <= spec.fieldPerms; i++) {
    const objIdx = (i % 200) + 1;
    lines.push('    <fieldPermissions>');
    lines.push('        <editable>true</editable>');
    lines.push(`        <field>Sample_Object_${pad(objIdx, 3)}__c.Sample_Field_${pad(i, 6)}__c</field>`);
    lines.push('        <readable>true</readable>');
    lines.push('    </fieldPermissions>');
  }

  lines.push(`    <description>Synthetic permission set for performance testing.</description>`);
  lines.push(`    <hasActivationRequired>false</hasActivationRequired>`);
  lines.push(`    <label>Mega Permission Set</label>`);
  lines.push(`    <license>Salesforce</license>`);

  for (let i = 1; i <= spec.objectPerms; i++) {
    lines.push('    <objectPermissions>');
    lines.push('        <allowCreate>true</allowCreate>');
    lines.push('        <allowDelete>true</allowDelete>');
    lines.push('        <allowEdit>true</allowEdit>');
    lines.push('        <allowRead>true</allowRead>');
    lines.push('        <modifyAllRecords>false</modifyAllRecords>');
    lines.push(`        <object>Sample_Object_${pad(i, 3)}__c</object>`);
    lines.push('        <viewAllRecords>false</viewAllRecords>');
    lines.push('    </objectPermissions>');
  }

  for (let i = 1; i <= spec.pageAccesses; i++) {
    lines.push('    <pageAccesses>');
    lines.push(`        <apexPage>Sample_Page_${pad(i, 5)}</apexPage>`);
    lines.push('        <enabled>true</enabled>');
    lines.push('    </pageAccesses>');
  }

  for (let i = 1; i <= spec.recordTypeVis; i++) {
    const objIdx = (i % 50) + 1;
    lines.push('    <recordTypeVisibilities>');
    lines.push(`        <recordType>Sample_Object_${pad(objIdx, 3)}__c.Sample_Record_Type_${pad(i, 4)}</recordType>`);
    lines.push('        <visible>true</visible>');
    lines.push('    </recordTypeVisibilities>');
  }

  for (let i = 1; i <= spec.tabSettings; i++) {
    lines.push('    <tabSettings>');
    lines.push(`        <tab>Sample_Tab_${pad(i, 4)}</tab>`);
    lines.push('        <visibility>Available</visibility>');
    lines.push('    </tabSettings>');
  }

  lines.push('    <userPermissions>');
  lines.push('        <enabled>true</enabled>');
  lines.push('        <name>ApiEnabled</name>');
  lines.push('    </userPermissions>');
  lines.push('    <userPermissions>');
  lines.push('        <enabled>true</enabled>');
  lines.push('        <name>ViewAllData</name>');
  lines.push('    </userPermissions>');

  lines.push('</PermissionSet>');
  return lines.join('\n') + '\n';
}

function genProfile(spec: SizeSpec['profile']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<Profile${NS}>`);

  for (let i = 1; i <= spec.appVis; i++) {
    lines.push('    <applicationVisibilities>');
    lines.push(`        <application>Sample_App_${pad(i, 4)}</application>`);
    lines.push(`        <default>${i === 1 ? 'true' : 'false'}</default>`);
    lines.push(`        <visible>true</visible>`);
    lines.push('    </applicationVisibilities>');
  }

  for (let i = 1; i <= spec.classAccesses; i++) {
    lines.push('    <classAccesses>');
    lines.push(`        <apexClass>Sample_Class_${pad(i, 5)}</apexClass>`);
    lines.push('        <enabled>true</enabled>');
    lines.push('    </classAccesses>');
  }

  for (let i = 1; i <= spec.fieldPerms; i++) {
    const objIdx = (i % 200) + 1;
    lines.push('    <fieldPermissions>');
    lines.push('        <editable>true</editable>');
    lines.push(`        <field>Sample_Object_${pad(objIdx, 3)}__c.Sample_Field_${pad(i, 6)}__c</field>`);
    lines.push('        <readable>true</readable>');
    lines.push('    </fieldPermissions>');
  }

  for (let i = 1; i <= spec.layoutAssignments; i++) {
    const objIdx = (i % 50) + 1;
    lines.push('    <layoutAssignments>');
    lines.push(`        <layout>Sample_Object_${pad(objIdx, 3)}__c-Layout_${pad(i, 4)}</layout>`);
    if (i % 5 === 0) {
      lines.push(`        <recordType>Sample_Object_${pad(objIdx, 3)}__c.Sample_Record_Type_${pad(i, 4)}</recordType>`);
    }
    lines.push('    </layoutAssignments>');
  }

  for (let i = 1; i <= spec.objectPerms; i++) {
    lines.push('    <objectPermissions>');
    lines.push('        <allowCreate>true</allowCreate>');
    lines.push('        <allowDelete>true</allowDelete>');
    lines.push('        <allowEdit>true</allowEdit>');
    lines.push('        <allowRead>true</allowRead>');
    lines.push('        <modifyAllRecords>false</modifyAllRecords>');
    lines.push(`        <object>Sample_Object_${pad(i, 3)}__c</object>`);
    lines.push('        <viewAllRecords>false</viewAllRecords>');
    lines.push('    </objectPermissions>');
  }

  for (let i = 1; i <= spec.pageAccesses; i++) {
    lines.push('    <pageAccesses>');
    lines.push(`        <apexPage>Sample_Page_${pad(i, 5)}</apexPage>`);
    lines.push('        <enabled>true</enabled>');
    lines.push('    </pageAccesses>');
  }

  for (let i = 1; i <= spec.recordTypeVis; i++) {
    const objIdx = (i % 50) + 1;
    lines.push('    <recordTypeVisibilities>');
    lines.push(`        <default>${i === 1 ? 'true' : 'false'}</default>`);
    lines.push(`        <recordType>Sample_Object_${pad(objIdx, 3)}__c.Sample_Record_Type_${pad(i, 4)}</recordType>`);
    lines.push('        <visible>true</visible>');
    lines.push('    </recordTypeVisibilities>');
  }

  for (let i = 1; i <= spec.tabSettings; i++) {
    const visibilities = ['DefaultOn', 'DefaultOff', 'Hidden'] as const;
    lines.push('    <tabVisibilities>');
    lines.push(`        <tab>Sample_Tab_${pad(i, 4)}</tab>`);
    lines.push(`        <visibility>${pick(visibilities, i)}</visibility>`);
    lines.push('    </tabVisibilities>');
  }

  lines.push('    <custom>false</custom>');
  lines.push('    <userLicense>Salesforce</userLicense>');
  lines.push('    <userPermissions>');
  lines.push('        <enabled>true</enabled>');
  lines.push('        <name>ApiEnabled</name>');
  lines.push('    </userPermissions>');

  lines.push('</Profile>');
  return lines.join('\n') + '\n';
}

function genFlow(spec: SizeSpec['flow']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<Flow${NS}>`);
  lines.push('    <apiVersion>62.0</apiVersion>');
  lines.push(`    <description>Synthetic flow for performance testing.</description>`);
  lines.push('    <environments>Default</environments>');
  lines.push('    <interviewLabel>Mega Flow {!$Flow.CurrentDateTime}</interviewLabel>');
  lines.push('    <label>Mega Flow</label>');
  lines.push('    <processMetadataValues>');
  lines.push('        <name>BuilderType</name>');
  lines.push('        <value><stringValue>LightningFlowBuilder</stringValue></value>');
  lines.push('    </processMetadataValues>');
  lines.push('    <processType>AutoLaunchedFlow</processType>');
  lines.push('    <runInMode>SystemModeWithSharing</runInMode>');
  lines.push('    <start>');
  lines.push('        <locationX>50</locationX>');
  lines.push('        <locationY>0</locationY>');
  lines.push('        <connector><targetReference>Decision_0001</targetReference></connector>');
  lines.push('    </start>');
  lines.push('    <status>Active</status>');

  for (let i = 1; i <= spec.decisions; i++) {
    const next = i < spec.decisions ? `Decision_${pad(i + 1, 4)}` : `Assignment_${pad(1, 4)}`;
    lines.push('    <decisions>');
    lines.push(`        <name>Decision_${pad(i, 4)}</name>`);
    lines.push(`        <label>Decision ${i}</label>`);
    lines.push(`        <locationX>${100 + (i % 20) * 30}</locationX>`);
    lines.push(`        <locationY>${100 + i * 5}</locationY>`);
    lines.push('        <defaultConnector>');
    lines.push(`            <targetReference>${next}</targetReference>`);
    lines.push('        </defaultConnector>');
    lines.push('        <defaultConnectorLabel>Default Outcome</defaultConnectorLabel>');
    lines.push('        <rules>');
    lines.push(`            <name>Rule_${pad(i, 4)}_A</name>`);
    lines.push('            <conditionLogic>and</conditionLogic>');
    lines.push('            <conditions>');
    lines.push(`                <leftValueReference>Variable_${pad((i % spec.variables) + 1, 4)}</leftValueReference>`);
    lines.push('                <operator>EqualTo</operator>');
    lines.push('                <rightValue><stringValue>Match</stringValue></rightValue>');
    lines.push('            </conditions>');
    lines.push('            <connector>');
    lines.push(`                <targetReference>${next}</targetReference>`);
    lines.push('            </connector>');
    lines.push(`            <label>Rule ${i} A</label>`);
    lines.push('        </rules>');
    lines.push('    </decisions>');
  }

  for (let i = 1; i <= spec.assignments; i++) {
    const next = i < spec.assignments ? `Assignment_${pad(i + 1, 4)}` : `Lookup_${pad(1, 4)}`;
    lines.push('    <assignments>');
    lines.push(`        <name>Assignment_${pad(i, 4)}</name>`);
    lines.push(`        <label>Assignment ${i}</label>`);
    lines.push(`        <locationX>${50 + (i % 10) * 40}</locationX>`);
    lines.push(`        <locationY>${500 + i * 5}</locationY>`);
    lines.push('        <assignmentItems>');
    lines.push(`            <assignToReference>Variable_${pad((i % spec.variables) + 1, 4)}</assignToReference>`);
    lines.push('            <operator>Assign</operator>');
    lines.push(`            <value><stringValue>Value_${pad(i, 5)}</stringValue></value>`);
    lines.push('        </assignmentItems>');
    lines.push('        <connector>');
    lines.push(`            <targetReference>${next}</targetReference>`);
    lines.push('        </connector>');
    lines.push('    </assignments>');
  }

  for (let i = 1; i <= spec.recordLookups; i++) {
    const next = i < spec.recordLookups ? `Lookup_${pad(i + 1, 4)}` : `Action_${pad(1, 4)}`;
    lines.push('    <recordLookups>');
    lines.push(`        <name>Lookup_${pad(i, 4)}</name>`);
    lines.push(`        <label>Lookup ${i}</label>`);
    lines.push(`        <locationX>${200 + (i % 8) * 50}</locationX>`);
    lines.push(`        <locationY>${1000 + i * 5}</locationY>`);
    lines.push('        <assignNullValuesIfNoRecordsFound>true</assignNullValuesIfNoRecordsFound>');
    lines.push('        <connector>');
    lines.push(`            <targetReference>${next}</targetReference>`);
    lines.push('        </connector>');
    lines.push('        <filterLogic>and</filterLogic>');
    lines.push('        <filters>');
    lines.push('            <field>Id</field>');
    lines.push('            <operator>EqualTo</operator>');
    lines.push(
      `            <value><elementReference>Variable_${pad((i % spec.variables) + 1, 4)}</elementReference></value>`,
    );
    lines.push('        </filters>');
    lines.push('        <getFirstRecordOnly>true</getFirstRecordOnly>');
    lines.push('        <object>Sample_Object_001__c</object>');
    lines.push('        <storeOutputAutomatically>true</storeOutputAutomatically>');
    lines.push('    </recordLookups>');
  }

  for (let i = 1; i <= spec.actionCalls; i++) {
    const next = i < spec.actionCalls ? `Action_${pad(i + 1, 4)}` : 'End';
    lines.push('    <actionCalls>');
    lines.push(`        <name>Action_${pad(i, 4)}</name>`);
    lines.push(`        <label>Action ${i}</label>`);
    lines.push(`        <locationX>${300 + (i % 6) * 60}</locationX>`);
    lines.push(`        <locationY>${1500 + i * 5}</locationY>`);
    lines.push(`        <actionName>Sample_Apex_Action_${pad(i, 4)}</actionName>`);
    lines.push('        <actionType>apex</actionType>');
    if (i < spec.actionCalls) {
      lines.push('        <connector>');
      lines.push(`            <targetReference>${next}</targetReference>`);
      lines.push('        </connector>');
    }
    lines.push('        <flowTransactionModel>CurrentTransaction</flowTransactionModel>');
    lines.push(`        <nameSegment>Sample_Apex_Action_${pad(i, 4)}</nameSegment>`);
    lines.push('        <storeOutputAutomatically>true</storeOutputAutomatically>');
    lines.push('        <versionSegment>1</versionSegment>');
    lines.push('    </actionCalls>');
  }

  for (let i = 1; i <= spec.variables; i++) {
    lines.push('    <variables>');
    lines.push(`        <name>Variable_${pad(i, 4)}</name>`);
    lines.push('        <dataType>String</dataType>');
    lines.push('        <isCollection>false</isCollection>');
    lines.push('        <isInput>false</isInput>');
    lines.push('        <isOutput>false</isOutput>');
    lines.push('    </variables>');
  }

  lines.push('</Flow>');
  return lines.join('\n') + '\n';
}

function genWorkflow(spec: SizeSpec['workflow']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<Workflow${NS}>`);

  for (let i = 1; i <= spec.alerts; i++) {
    lines.push('    <alerts>');
    lines.push(`        <fullName>Alert_${pad(i, 4)}</fullName>`);
    lines.push(`        <description>Synthetic alert ${i}.</description>`);
    lines.push('        <protected>false</protected>');
    lines.push('        <recipients>');
    lines.push('            <type>accountOwner</type>');
    lines.push('        </recipients>');
    lines.push('        <recipients>');
    lines.push(`            <field>Sample_Field_${pad(i, 6)}__c</field>`);
    lines.push('            <type>contactLookup</type>');
    lines.push('        </recipients>');
    lines.push(`        <senderType>CurrentUser</senderType>`);
    lines.push(`        <template>unfiled$public/Sample_Template_${pad((i % 20) + 1, 3)}</template>`);
    lines.push('    </alerts>');
  }

  for (let i = 1; i <= spec.fieldUpdates; i++) {
    lines.push('    <fieldUpdates>');
    lines.push(`        <fullName>Field_Update_${pad(i, 4)}</fullName>`);
    lines.push(`        <description>Synthetic field update ${i}.</description>`);
    lines.push(`        <field>Sample_Field_${pad(i, 6)}__c</field>`);
    lines.push(`        <name>Field Update ${i}</name>`);
    lines.push('        <notifyAssignee>false</notifyAssignee>');
    lines.push(`        <operation>Literal</operation>`);
    lines.push(`        <literalValue>Value_${pad(i, 5)}</literalValue>`);
    lines.push('        <protected>false</protected>');
    lines.push('    </fieldUpdates>');
  }

  for (let i = 1; i <= spec.rules; i++) {
    lines.push('    <rules>');
    lines.push(`        <fullName>Rule_${pad(i, 4)}</fullName>`);
    lines.push('        <actions>');
    lines.push(`            <name>Alert_${pad(((i - 1) % spec.alerts) + 1, 4)}</name>`);
    lines.push('            <type>Alert</type>');
    lines.push('        </actions>');
    lines.push('        <active>true</active>');
    lines.push('        <criteriaItems>');
    lines.push(`            <field>Sample_Object_001__c.Sample_Field_${pad(i, 6)}__c</field>`);
    lines.push('            <operation>notEqual</operation>');
    lines.push(`            <value>Value_${pad(i, 5)}</value>`);
    lines.push('        </criteriaItems>');
    lines.push('        <triggerType>onCreateOrTriggeringUpdate</triggerType>');
    lines.push('    </rules>');
  }

  lines.push('</Workflow>');
  return lines.join('\n') + '\n';
}

function genCustomLabels(spec: SizeSpec['labels']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<CustomLabels${NS}>`);

  for (let i = 1; i <= spec.count; i++) {
    lines.push('    <labels>');
    lines.push(`        <fullName>Sample_Label_${pad(i, 5)}</fullName>`);
    lines.push('        <categories>Sample,Performance</categories>');
    lines.push('        <language>en_US</language>');
    lines.push('        <protected>false</protected>');
    lines.push(`        <shortDescription>Sample Label ${i}</shortDescription>`);
    lines.push(`        <value>${escape(`Synthetic label ${i} value used for performance testing only.`)}</value>`);
    lines.push('    </labels>');
  }

  lines.push('</CustomLabels>');
  return lines.join('\n') + '\n';
}

function genApplication(spec: SizeSpec['application']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<CustomApplication${NS}>`);

  const formFactors = ['Large', 'Small', 'Medium'] as const;
  const types = ['Flexipage', 'Standard'] as const;
  // Real Salesforce orgs spread overrides across many action names. Cycling
  // here keeps the compound `actionName + pageOrSobjectType + formFactor`
  // key space well above the row count, matching production-shaped data and
  // avoiding the synthetic collisions that would occur if `actionName` were
  // a single constant value (`View`) repeated thousands of times.
  const actionNames = [
    'Tab',
    'View',
    'Edit',
    'New',
    'Delete',
    'Clone',
    'List',
    'Save',
    'Submit',
    'Approve',
    'Reject',
    'Activate',
    'Comment',
    'Follow',
    'Share',
    'Print',
    'Refresh',
  ] as const;

  for (let i = 1; i <= spec.actionOverrides; i++) {
    lines.push('    <actionOverrides>');
    lines.push(`        <actionName>${pick(actionNames, i)}</actionName>`);
    lines.push(`        <comment>Action override created for performance fixture ${i}.</comment>`);
    lines.push(`        <content>Sample_Page_${pad(i, 5)}</content>`);
    lines.push(`        <formFactor>${pick(formFactors, i)}</formFactor>`);
    lines.push('        <skipRecordTypeSelect>false</skipRecordTypeSelect>');
    lines.push(`        <type>${pick(types, i)}</type>`);
    lines.push(`        <pageOrSobjectType>Sample_Object_${pad((i % 200) + 1, 3)}__c</pageOrSobjectType>`);
    lines.push('    </actionOverrides>');
  }

  lines.push('    <brand>');
  lines.push('        <headerColor>#0070D2</headerColor>');
  lines.push('        <shouldOverrideOrgTheme>false</shouldOverrideOrgTheme>');
  lines.push('    </brand>');
  lines.push('    <formFactors>Large</formFactors>');
  lines.push('    <isNavAutoTempTabsDisabled>false</isNavAutoTempTabsDisabled>');
  lines.push('    <isNavPersonalizationDisabled>false</isNavPersonalizationDisabled>');
  lines.push('    <label>Mega App</label>');
  lines.push('    <navType>Standard</navType>');

  for (let i = 1; i <= spec.profileActionOverrides; i++) {
    lines.push('    <profileActionOverrides>');
    lines.push(`        <actionName>${pick(actionNames, i)}</actionName>`);
    lines.push(`        <content>Sample_Profile_Page_${pad(i, 5)}</content>`);
    lines.push(`        <formFactor>${pick(formFactors, i)}</formFactor>`);
    lines.push(`        <pageOrSobjectType>Sample_Object_${pad((i % 200) + 1, 3)}__c</pageOrSobjectType>`);
    lines.push(`        <profile>Sample_Profile_${pad((i % 30) + 1, 3)}</profile>`);
    lines.push(
      `        <recordType>Sample_Object_${pad((i % 50) + 1, 3)}__c.Sample_Record_Type_${pad(i, 4)}</recordType>`,
    );
    lines.push('        <type>Flexipage</type>');
    lines.push('    </profileActionOverrides>');
  }

  for (let i = 1; i <= spec.tabs; i++) {
    lines.push(`    <tabs>Sample_Tab_${pad(i, 4)}</tabs>`);
  }
  lines.push('    <uiType>Lightning</uiType>');

  lines.push('</CustomApplication>');
  return lines.join('\n') + '\n';
}

function genGlobalValueSet(spec: SizeSpec['globalValueSet']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<GlobalValueSet${NS}>`);
  lines.push('    <description>Synthetic GVS for performance testing.</description>');
  lines.push('    <masterLabel>Mega Values</masterLabel>');
  lines.push('    <sorted>false</sorted>');
  for (let i = 1; i <= spec.customValues; i++) {
    lines.push('    <customValue>');
    lines.push(`        <fullName>Sample_Value_${pad(i, 5)}</fullName>`);
    lines.push('        <default>false</default>');
    lines.push(`        <label>Sample Value ${i}</label>`);
    lines.push(`        <isActive>${i % 7 !== 0}</isActive>`);
    lines.push('    </customValue>');
  }
  lines.push('</GlobalValueSet>');
  return lines.join('\n') + '\n';
}

function genBot(): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<Bot${NS}>`);
  lines.push('    <agentDSLEnabled>false</agentDSLEnabled>');
  lines.push('    <botMlDomain>');
  lines.push('        <label>Mega Bot</label>');
  lines.push('        <name>Mega_Bot</name>');
  lines.push('    </botMlDomain>');
  lines.push('    <botSource>None</botSource>');
  for (let i = 1; i <= 8; i++) {
    lines.push('    <contextVariables>');
    lines.push('        <dataType>Text</dataType>');
    lines.push(`        <developerName>Sample_Var_${pad(i, 3)}</developerName>`);
    lines.push('        <includeInPrompt>false</includeInPrompt>');
    lines.push(`        <label>Sample Var ${i}</label>`);
    lines.push('    </contextVariables>');
  }
  lines.push('    <description>Synthetic bot for performance testing.</description>');
  lines.push('    <label>Mega Bot</label>');
  lines.push('    <logPrivateConversationData>false</logPrivateConversationData>');
  lines.push('    <richContentEnabled>false</richContentEnabled>');
  lines.push('    <sessionTimeout>0</sessionTimeout>');
  lines.push('    <type>Bot</type>');
  lines.push('</Bot>');
  return lines.join('\n') + '\n';
}

function genBotVersion(spec: SizeSpec['bot']): string {
  const lines: string[] = [];
  lines.push(XML_HEADER + `<BotVersion${NS}>`);
  lines.push('    <fullName>v1</fullName>');
  lines.push('    <articleAnswersGPTEnabled>false</articleAnswersGPTEnabled>');

  let stepCounter = 0;

  for (let d = 1; d <= spec.dialogs; d++) {
    lines.push('    <botDialogs>');
    const stepsInDialog = (d % 3) + 1;
    for (let s = 0; s < stepsInDialog; s++) {
      stepCounter += 1;
      lines.push('        <botSteps>');
      if (s === 0) {
        lines.push('            <botMessages>');
        lines.push(`                <message>Synthetic message ${stepCounter} for dialog ${d}.</message>`);
        lines.push(`                <messageIdentifier>${detId(stepCounter * 2)}</messageIdentifier>`);
        lines.push('            </botMessages>');
        lines.push(`            <stepIdentifier>${detId(stepCounter * 2 + 1)}</stepIdentifier>`);
        lines.push('            <type>Message</type>');
      } else {
        lines.push(`            <stepIdentifier>${detId(stepCounter * 2 + 1)}</stepIdentifier>`);
        lines.push('            <type>Wait</type>');
      }
      lines.push('        </botSteps>');
    }
    lines.push(`        <developerName>Sample_Dialog_${pad(d, 4)}</developerName>`);
    lines.push('        <isPlaceholderDialog>false</isPlaceholderDialog>');
    lines.push(`        <label>Sample Dialog ${d}</label>`);
    lines.push('        <showInFooterMenu>false</showInFooterMenu>');
    lines.push('    </botDialogs>');
  }

  for (let i = 1; i <= spec.mlIntents; i++) {
    lines.push('    <conversationVariableOperations>');
    lines.push(`        <invocationActionName>Sample_Action_${pad(i, 4)}</invocationActionName>`);
    lines.push('        <invocationActionType>SetVariable</invocationActionType>');
    for (let p = 1; p <= 3; p++) {
      lines.push('        <parameters>');
      lines.push(`            <parameterName>Sample_Param_${pad(p, 2)}</parameterName>`);
      lines.push(`            <parameterValue>Value_${pad(i, 5)}_${p}</parameterValue>`);
      lines.push('        </parameters>');
    }
    lines.push(`        <stepIdentifier>${detId(1_000_000 + i)}</stepIdentifier>`);
    lines.push('    </conversationVariableOperations>');
  }

  lines.push('    <citationsEnabled>false</citationsEnabled>');
  lines.push(`    <entryDialog>Sample_Dialog_${pad(1, 4)}</entryDialog>`);
  lines.push('    <intentDisambiguationEnabled>false</intentDisambiguationEnabled>');
  lines.push('    <intentV3Enabled>false</intentV3Enabled>');
  lines.push('    <isScriptCompatibleAgent>false</isScriptCompatibleAgent>');
  lines.push('    <knowledgeActionEnabled>false</knowledgeActionEnabled>');
  lines.push(`    <mainMenuDialog>Sample_Dialog_${pad(1, 4)}</mainMenuDialog>`);
  lines.push('    <nlpProviders>');
  lines.push('        <language>en_US</language>');
  lines.push('        <nlpProviderType>EinsteinAi</nlpProviderType>');
  lines.push('    </nlpProviders>');
  lines.push('    <smallTalkEnabled>false</smallTalkEnabled>');
  lines.push('    <stopRecPrompts>false</stopRecPrompts>');
  lines.push('    <stopWelcomePrompts>false</stopWelcomePrompts>');
  lines.push('    <surfacesEnabled>false</surfacesEnabled>');

  lines.push('</BotVersion>');
  return lines.join('\n') + '\n';
}

function genEntitlementProcess(spec: SizeSpec['entitlementProcess']): string {
  // milestoneName is the unique-id key for this metadata type (see
  // src/metadata/uniqueIdElements.ts). About 30% of the names below contain a
  // `/` and one contains `:` so the disassembler exercises path-segment
  // sanitization on every perf run. With sanitization in place the resulting
  // shard filenames are safe and the file reassembles 1:1; if sanitization
  // ever regresses the writes either fail (`/` makes the parent dir bogus on
  // all platforms) or land in phantom subdirectories, dropping the recomposed
  // bytes well below the 0.99 retention threshold and failing this suite.
  const milestoneNameTemplates = [
    'Initial Response',
    'Sync/Import',
    'First Engagement',
    'Standard Resolution',
    'Customer/Callback',
    'Verify Action',
    'Confirm:Step',
    'Final Closure',
    'Approval/Reject',
    'Continue Path',
  ] as const;

  const lines: string[] = [];
  lines.push(XML_HEADER + `<EntitlementProcess${NS}>`);
  lines.push('    <SObjectType>Case</SObjectType>');
  lines.push('    <active>true</active>');
  lines.push('    <description>Synthetic entitlement process for performance testing.</description>');
  lines.push('    <entryStartDateField>EntitlementStartDate</entryStartDateField>');
  lines.push('    <isRecordTypeApplied>false</isRecordTypeApplied>');
  lines.push('    <isVersionDefault>true</isVersionDefault>');

  for (let i = 1; i <= spec.milestones; i++) {
    const template = pick(milestoneNameTemplates, i);
    lines.push('    <milestones>');
    lines.push(`        <minutesToComplete>${(i % 240) + 15}</minutesToComplete>`);
    lines.push('        <startDateField>CreatedDate</startDateField>');
    // Counter suffix keeps every milestoneName unique so the disassembler is
    // exercising sanitization (not the SHA-256 collision fallback).
    lines.push(`        <milestoneName>${template} ${pad(i, 4)}</milestoneName>`);
    lines.push('    </milestones>');
  }

  lines.push('    <name>Mega Entitlement Process</name>');
  lines.push('    <versionMaster>Mega_EntitlementProcess</versionMaster>');
  lines.push('    <versionNotes>Synthetic v1</versionNotes>');
  lines.push('    <versionNumber>1</versionNumber>');
  lines.push('</EntitlementProcess>');
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Layout / driver
// ---------------------------------------------------------------------------

const SFDX_PROJECT_JSON = {
  packageDirectories: [{ path: 'force-app', default: true }],
  namespace: '',
  sfdcLoginUrl: 'https://login.salesforce.com',
  sourceApiVersion: '62.0',
};

interface FileRecord {
  relPath: string;
  bytes: number;
}

async function writeOut(outDir: string, relPath: string, content: string, files: FileRecord[]): Promise<void> {
  const abs = join(outDir, relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf8');
  files.push({ relPath, bytes: Buffer.byteLength(content, 'utf8') });
}

export interface GenerateOptions {
  outDir: string;
  profile?: Profile;
  cleanFirst?: boolean;
}

export interface GenerateResult {
  outDir: string;
  profile: Profile;
  files: FileRecord[];
  totalBytes: number;
}

export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const profile: Profile = opts.profile ?? 'large';
  const spec = PROFILES[profile];
  const outDir = resolve(opts.outDir);

  if (opts.cleanFirst) {
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir, { recursive: true });

  const files: FileRecord[] = [];
  const base = 'force-app/main/default';

  await writeFile(join(outDir, 'sfdx-project.json'), JSON.stringify(SFDX_PROJECT_JSON, null, 2) + '\n', 'utf8');

  await writeOut(
    outDir,
    `${base}/permissionsets/Mega.permissionset-meta.xml`,
    genPermissionSet(spec.permissionSet),
    files,
  );
  // mutingpermissionset shares PermissionSet's child shape, just swap the root tag.
  await writeOut(
    outDir,
    `${base}/mutingpermissionsets/Mega.mutingpermissionset-meta.xml`,
    genPermissionSet(spec.permissionSet)
      .replace('<PermissionSet', '<MutingPermissionSet')
      .replace('</PermissionSet>', '</MutingPermissionSet>'),
    files,
  );
  await writeOut(outDir, `${base}/profiles/Mega.profile-meta.xml`, genProfile(spec.profile), files);
  await writeOut(outDir, `${base}/flows/Mega_Flow.flow-meta.xml`, genFlow(spec.flow), files);
  await writeOut(outDir, `${base}/workflows/Account.workflow-meta.xml`, genWorkflow(spec.workflow), files);
  await writeOut(outDir, `${base}/labels/CustomLabels.labels-meta.xml`, genCustomLabels(spec.labels), files);
  await writeOut(outDir, `${base}/applications/Mega.app-meta.xml`, genApplication(spec.application), files);
  await writeOut(
    outDir,
    `${base}/globalValueSets/MegaValues.globalValueSet-meta.xml`,
    genGlobalValueSet(spec.globalValueSet),
    files,
  );
  await writeOut(outDir, `${base}/bots/Mega_Bot/Mega_Bot.bot-meta.xml`, genBot(), files);
  await writeOut(outDir, `${base}/bots/Mega_Bot/v1.botVersion-meta.xml`, genBotVersion(spec.bot), files);
  await writeOut(
    outDir,
    `${base}/entitlementProcesses/Mega_EntitlementProcess.entitlementProcess-meta.xml`,
    genEntitlementProcess(spec.entitlementProcess),
    files,
  );

  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  return { outDir, profile, files, totalBytes };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { profile: Profile; outDir: string; clean: boolean } {
  let profile: Profile = 'large';
  let outDir = 'perf-fixtures';
  let clean = true;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--profile' && argv[i + 1]) {
      const next = argv[++i] as Profile;
      if (!(next in PROFILES))
        throw new Error(`Unknown profile: ${next}. Use one of: ${Object.keys(PROFILES).join(', ')}.`);
      profile = next;
    } else if (arg === '--out' && argv[i + 1]) {
      outDir = argv[++i] as string;
    } else if (arg === '--no-clean') {
      clean = false;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'gen-perf-fixtures.ts',
          '',
          'Options:',
          '  --profile <small|medium|large|xlarge>   Default: large',
          '  --out <dir>                             Default: perf-fixtures',
          '  --no-clean                              Do not wipe out dir first',
          '',
        ].join('\n') + '\n',
      );
      process.exit(0);
    }
  }
  return { profile, outDir, clean };
}

function isDirectInvocation(): boolean {
  if (!process.argv[1]) return false;
  const here = fileURLToPath(import.meta.url);
  return resolve(process.argv[1]) === resolve(here);
}

if (isDirectInvocation()) {
  const { profile, outDir, clean } = parseArgs(process.argv.slice(2));
  const start = Date.now();
  generate({ outDir, profile, cleanFirst: clean })
    .then((res) => {
      const elapsed = Date.now() - start;
      const mb = (res.totalBytes / (1024 * 1024)).toFixed(2);
      process.stdout.write(
        `Generated ${res.files.length} files (${mb} MB) into ${res.outDir} using profile "${res.profile}" in ${elapsed}ms.\n`,
      );
      for (const f of res.files) {
        const kb = (f.bytes / 1024).toFixed(1).padStart(10, ' ');
        process.stdout.write(`  ${kb} KB  ${f.relPath}\n`);
      }
    })
    .catch((err: unknown) => {
      process.stderr.write(`Error: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
      process.exit(1);
    });
}
