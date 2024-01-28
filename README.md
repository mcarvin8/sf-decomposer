# sfdx-decomposer

[![NPM](https://img.shields.io/npm/v/sfdx-decomposer.svg?label=sfdx-decomposer)](https://www.npmjs.com/package/sfdx-decomposer) [![Downloads/week](https://img.shields.io/npm/dw/sfdx-decomposer.svg)](https://npmjs.org/package/sfdx-decomposer) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/sfdx-decomposer/main/LICENSE.txt)

The `sfdx-decomposer` is a simple plugin to read the original metadata files for certain metadata types and create smaller, more manageable files for version control. When it's time to deploy decomposed metadata to an org, the inverse function (`compose`) will re-create metadata files for CLI deployments.

**DISCLAIMERS:**
It is highly recommended that you extensively test this plugin in a sandbox environment on the metadata types you wish to use this tool for. Do not change your production/QA pipelines until you have tested this and are happy with the results. Confirm your deployment pipelines are stable prior to implementing this plugin.

## Install

```bash
sf plugins install sfdx-decomposer@x.y.z
```

## Commands

`sfdx-decomposer` supports 2 commands:

- `sf decomposer decompose`
- `sf decomposer compose`

The same arguments are used for both commands.

## `sf decomposer decompose`

Decomposes the original metadata files into smaller files for version control. Excluding custom labels, the smaller files will be placed into new sub-directories:

- force-app/main/default/workflows
  - Case
    - alerts
    - fieldUpdates
    - outboundMessages
    - rules
    - tasks
      - User_task_was_completed.tasks-meta.xml

Custom Labels will be decomposed directly in the root labels folder and will have a different extension compared to the original labels file:

- force-app/main/default/labels
  - quoteAuto.label-meta.xml
  - quoteManual.label-meta.xml

```
USAGE
  $ sf decomposer decompose -t <value> -d <value> [--json]

FLAGS
  -n, --metadata-type=<value> The type of metadata to decompose.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the original metadata files and separate them into multiple XML files by elements and field names.

  You should use this to create files for version control after retrieving metadata from an org.

EXAMPLES
  Decompose all flows:

    $ sf decomposer decompose -t "flow"
```

## `sf decomposer compose`

Reads all of the files created by the decompose command and re-creates the original meta files suitable for CLI deployments.

```
USAGE
  $ sf decomposer compose -t <value> -d <value> [--json]

FLAGS
  -n, --metadata-type=<value> The type of metadata to compose.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the decomposed files and re-create the original meta files in the original locations.

  You should use this to compile files before you deploy the metadata to your org.

EXAMPLES
  Compose all flows:

    $ sf decomposer compose -t "flow"
```

## Supported Metadata

The following metadata types are supported:

- Custom Labels (`-t "labels"`)
- Workflows (`-t "workflow"`)
- Profiles (`-t "profile"`)
- Permission Sets (`-t "permissionset"`)
- Flows (`-t "flow"`)
- Matching Rules (`-t "matchingRule"`)
- Assignment Rules (`-t "assignmentRules"`)
- Escalation Rules (`-t "escalationRules"`)
- Sharing Rules (`-t "sharingRules"`)
- Auto Response Rules (`-t "autoResponseRules"`)
- Global Value Set Translation (`-t "globalValueSetTranslation"`)
- Standard Value Set Translation (`-t "standardValueSetTranslation"`)
- Translations (`-t "translation"`)
- Standard Value Sets (`-t "standardValueSet"`)
- Global Value Sets (`-t "globalValueSet"`)
- AI Scoring Model Definition (`-t "aiScoringModelDefinition"`)
- Decision Matrix Definition (`-t "decisionMatrixDefinition"`)

**NOTE**:
Per Salesforce documentation for **Standard/Global Value Set Translations**, when a value isn't translated, its translation becomes a comment that's paired with its label.

```xml
    <valueTranslation>
        <masterLabel>Warm</masterLabel>
        <translation><!-- Warm --></translation>
    </valueTranslation>
```

The `decompose` function will not process these comments correctly (see example below). Ensure all meta files have proper translations before decomposing them.

```xml
    <valueTranslation>
        <masterLabel>Warm</masterLabel>
        <translation>
            <#comment> Warm </#comment>
        </translation>
    </valueTranslation>
```

## Ignore Files

The `.gitignore` and `.forceignore` files in your repository should be updated based on the metadata types you wish to decompose.

Salesforce CLI version 2.10.2 correctly handles opt-in style with directories on the `.forceignore` file. Ensure you're using a version of the CLI which supports opt-in style with directories.

### `.gitignore` updates

```
# Ignore the original files created by retrievals
**/permissionsets/*.permissionset-meta.xml
**/profiles/*.profile-meta.xml
**/labels/CustomLabels.labels-meta.xml
**/workflows/*.workflow-meta.xml
**/flows/*.flow-meta.xml
**/matchingRules/*.matchingRule-meta.xml
**/assignmentRules/*.assignmentRules-meta.xml
**/escalationRules/*.escalationRules-meta.xml
**/sharingRules/*.sharingRules-meta.xml
**/autoResponseRules/*.autoResponseRules-meta.xml
**/globalValueSetTranslations/*.globalValueSetTranslation-meta.xml
**/standardValueSetTranslations/*.standardValueSetTranslation-meta.xml
**/translations/*.translation-meta.xml
**/globalValueSets/*.globalValueSet-meta.xml
**/standardValueSets/*.standardValueSet-meta.xml
**/decisionMatrixDefinition/*.decisionMatrixDefinition-meta.xml
**/aiScoringModelDefinitions/*.aiScoringModelDefinition-meta.xml
```

### `.forceignore` updates

```
# Ignore all XMLs by default
**/profiles/**/*.xml
**/permissionsets/**/*.xml
**/labels/*.xml
**/workflows/**/*.xml
**/flows/**/*.xml
**/matchingRules/**/*.xml
**/assignmentRules/**/*.xml
**/escalationRules/**/*.xml
**/sharingRules/**/*.xml
**/autoResponseRules/**/*.xml
**/globalValueSetTranslations/**/*.xml
**/standardValueSetTranslations/**/*.xml
**/translations/**/*.xml
**/globalValueSets/**/*.xml
**/standardValueSets/**/*.xml
**/decisionMatrixDefinition/**/*.xml
**/aiScoringModelDefinitions/**/*.xml

# Allow the meta files
!**/permissionsets/*.permissionset-meta.xml
!**/labels/CustomLabels.labels-meta.xml
!**/workflows/*.workflow-meta.xml
!**/profiles/*.profile-meta.xml
!**/flows/*.flow-meta.xml
!**/matchingRules/*.matchingRule-meta.xml
!**/assignmentRules/*.assignmentRules-meta.xml
!**/escalationRules/*.escalationRules-meta.xml
!**/sharingRules/*.sharingRules-meta.xml
!**/autoResponseRules/*.autoResponseRules-meta.xml
!**/globalValueSetTranslations/*.globalValueSetTranslation-meta.xml
!**/standardValueSetTranslations/*.standardValueSetTranslation-meta.xml
!**/translations/*.translation-meta.xml
!**/globalValueSets/*.globalValueSet-meta.xml
!**/standardValueSets/*.standardValueSet-meta.xml
!**/decisionMatrixDefinition/*.decisionMatrixDefinition-meta.xml
!**/aiScoringModelDefinitions/*.aiScoringModelDefinition-meta.xml
```

## Adding Metadata Types

To add a metadata type via a Pull Request:

1. Reference the metadata type details in https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm
2. Add the metadata to the JSON data in `src\metadata\metadata.ts`:
   - `directoryName` should be the root folder for that metadata type
   - `metaSuffix` should be the suffix the original meta files use (ex: `labels` is the suffix for `CustomLabels.labels-meta.xml`)
   - `xmlElement` should be the root element of the original meta files (ex: `CustomLabels` is the root element in meta header `<CustomLabels xmlns="http://soap.sforce.com/2006/04/metadata">`)
   - `fieldNames` should contain a comma-seperated list (no spaces) of Required Field Names for Nested Elements under the metadata type
     - Field Names are used to name decomposed meta files for nested elements and should contain unique values
     - In the below XML file, the `apexClass` field name is a required field name for the nested `<classAccesses>` element and should be included in possible field names for permission set
     - Fields which do not have nested elements such as `<description>` should not be included in `fieldNames` (All unnested elements will be added to the same meta file when decomposed)
     - Field Names will be evaluated in the order they appear in the list (ensure `fullName` is first since it's inherited from the Metadata type)

```json
  {
    "directoryName": "permissionsets",
    "metaSuffix": "permissionset",
    "xmlElement": "PermissionSet",
    "fieldNames": "fullName,application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field"
  },
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>Grants all rights needed for an HR administrator to manage employees.</description>
    <label>HR Administration</label>
    <userLicense>Salesforce</userLicense>
    <applicationVisibilities>
        <application>JobApps__Recruiting</application>
        <visible>true</visible>
    </applicationVisibilities>
    <userPermissions>
        <enabled>true</enabled>
        <name>APIEnabled</name>
    </userPermissions>
    <objectPermissions>
        <allowCreate>true</allowCreate>
        <allowDelete>true</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <viewAllRecords>true</viewAllRecords>
        <modifyAllRecords>true</modifyAllRecords>
        <object>Job_Request__c</object>
    </objectPermissions>
    <fieldPermissions>
        <editable>true</editable>
        <field>Job_Request__c.Salary__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <pageAccesses>
        <apexPage>Job_Request_Web_Form</apexPage>
        <enabled>true</enabled>
    </pageAccesses>
    <classAccesses>
      <apexClass>Send_Email_Confirmation</apexClass>
      <enabled>true</enabled>
    </classAccesses>
    <tabSettings>
        <tab>Job_Request__c</tab>
        <visibility>Available</visibility>
    </tabSettings>
    <recordTypeVisibilities>
        <recordType>Recruiting.DevManager</recordType>
        <visible>true</visible>
    </recordTypeVisibilities>
</PermissionSet>
```

3. Add an example meta file to the `force-app/main/default` under the proper `directoryName`.
4. Run the `decompose` function to decompose the original meta files for the new metadata type. Confirm the files are decomposed as intended.
5. Run the `compose` function to recompose the meta files for the new metadata type. Confirm the meta files created are accepted for deployments.
