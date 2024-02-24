# sfdx-decomposer

[![NPM](https://img.shields.io/npm/v/sfdx-decomposer.svg?label=sfdx-decomposer)](https://www.npmjs.com/package/sfdx-decomposer) [![Downloads/week](https://img.shields.io/npm/dw/sfdx-decomposer.svg)](https://npmjs.org/package/sfdx-decomposer) [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sfdx-decomposer-plugin/main/LICENSE.md)

The `sfdx-decomposer` is a plugin to read the original metadata files (XML) and create smaller, more manageable files for version control. The inverse function (`recompose`) will recompose metadata files for deployments.

**DISCLAIMERS:**

- It is highly recommended that you extensively test this plugin in a sandbox environment on the metadata types you wish to use this tool for.
- Do not change your production/QA pipelines until you have tested this and are happy with the results.
- Confirm your deployment pipelines are stable prior to implementing this plugin.

## Install

```bash
sf plugins install sfdx-decomposer@x.y.z
```

## Commands

The `sfdx-decomposer` supports 2 commands:

- `sf decomposer decompose`
- `sf decomposer recompose`

## `sf decomposer decompose`

Decomposes the original metadata files into smaller files for version control. Excluding custom labels, the smaller files will be placed into new sub-directories:

<img src="https://raw.githubusercontent.com/mcarvin8/sfdx-decomposer-plugin/main/.github/images/decomposed-perm-set.png">

<br>

Custom Labels will be decomposed directly in the root labels folder:

<img src="https://raw.githubusercontent.com/mcarvin8/sfdx-decomposer-plugin/main/.github/images/decomposed-labels.png">

<br>

Unique ID elements are used to name decomposed files for nested elements. The default unique ID element for all metadata types is `<fullName>`. In this example XML below, the `<fullName>` tag is included in the nested element and its contents (`quoteAuto`) will be used to name the decomposed file.

```xml
    <labels>
        <fullName>quoteAuto</fullName>
        <value>This is an automatically generated quote.</value>
        <language>en_US</language>
        <protected>false</protected>
        <shortDescription>Automatic Quote</shortDescription>
    </labels>
```

If `<fullName>` isn't found in the nested element, the plugin will look for any other potential unique ID elements for the provided metadata suffixes (see `CONTRIBUTING` section for more information).

If a unique ID element is not found in the nested element, the short SHA-256 hash of the element contents will be used to name the decomposed file, as shown below.

It's recommended to add the `--purge`/`-p` flag to the `decompose` command to remove pre-existing decomposed files that may conflict with newer decomposed files due to different SHA hashes.

<img src="https://raw.githubusercontent.com/mcarvin8/sfdx-decomposer-plugin/main/.github/images/decomposed-apps-hashes.png">

<br>

```
USAGE
  $ sf decomposer decompose -m <value> -d <value> -p [--debug --json]

FLAGS
  -m, --metadata-type=<value> This flag allows users to specify a metadata type for processing, such as 'flow', 'labels', etc. The provided input should be the metadata's suffix value.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.
  -p, --purge  [default: false] If provided, purge directories of pre-existing decomposed files.
  --debug [default: false] If provided, log debugging results to a text file (disassemble.log).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the original metadata files and separate them into smaller XML files.

  You should use this to create files for version control after retrieving metadata from an org.

EXAMPLES
  Decompose all flows:

    $ sf decomposer decompose -m "flow"
```

## `sf decomposer recompose`

Reads all of the files created by the decompose command and re-creates the original meta files suitable for CLI deployments.

```
USAGE
  $ sf decomposer recompose -m <value> -d <value> [--debug --json]

FLAGS
  -m, --metadata-type=<value> This flag allows users to specify a metadata type for processing, such as 'flow', 'labels', etc. The provided input should be the metadata's suffix value.
  -d, --dx-directory=<value>  [default: force-app/main/default] The root directory containing your Salesforce metadata.
  --debug [default: false] If provided, log debugging results to a text file (disassemble.log).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  This command will read all of the decomposed files and re-create the original meta files in the original locations.

  You should use this to recompose files before you deploy the metadata to an org.

EXAMPLES
  Recompose all flows:

    $ sf decomposer recompose -m "flow"
```

## Supported Metadata

All parent metadata types imported from this plugin's version of @salesforce/source-deploy-retrieve (SDR) toolkit are supported except for certain types.

The `--metadata-type` flag should be the metadata's `"suffix"` value as listed in the [metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json).

The suffix is this part of the original meta file name - `labels` is the suffix in `*.labels-meta.xml`.

Here are some examples:

- Custom Labels (`--metadata-type "labels"`)
- Workflows (`--metadata-type "workflow"`)
- Profiles (`--metadata-type "profile"`)
- Permission Sets (`--metadata-type "permissionset"`)
- Flows (`--metadata-type "flow"`)
- Matching Rules (`--metadata-type "matchingRule"`)
- Assignment Rules (`--metadata-type "assignmentRules"`)
- Escalation Rules (`--metadata-type "escalationRules"`)
- Sharing Rules (`--metadata-type "sharingRules"`)
- Auto Response Rules (`--metadata-type "autoResponseRules"`)
- Global Value Set Translation (`--metadata-type "globalValueSetTranslation"`)
- Standard Value Set Translation (`--metadata-type "standardValueSetTranslation"`)
- Translations (`--metadata-type "translation"`)
- Standard Value Sets (`--metadata-type "standardValueSet"`)
- Global Value Sets (`--metadata-type "globalValueSet"`)
- AI Scoring Model Definition (`--metadata-type "aiScoringModelDefinition"`)
- Decision Matrix Definition (`--metadata-type "decisionMatrixDefinition"`)
- Bot (`--metadata-type "bot"`)
  - **NOTE**: Running "bot" will also decompose and recompose Bot Version meta files
  - The `botVersion` meta suffix will be blocked from running directly
- Marketing App Extension (`--metadata-type "marketingappextension"`)

### Exceptions

`botVersion` is blocked from being ran directly. Please use the `bot` meta suffix to decompose and recompose bots and bot versions.

```
Error (1): `botVersion` suffix should not be used. Please use `bot` to recompose bot and bot version files.
```

Custom Objects are not supported by this plugin.

```
Error (1): Custom Objects are not supported by this plugin.
```

Metadata types such as Apex Classes, Apex Components, Triggers, etc. with certain SDR adapter strategies (`matchingContentFile`, `digitalExperience`, `mixedContent`, `bundle`) are not supported by this plugin.

```
Error (1): Metadata types with [matchingContentFile, digitalExperience, mixedContent, bundle] strategies are not supported by this plugin.
```

Children metadata types (ex: custom fields) are not supported and will result in this general error:

```
Error (1): Metadata type not found for the given suffix: field.
```

### Issues

Please create "Issues" in this repository if you experience problems decomposing and recomposing specific metadata types or if this plugin's version of SDR needs to be updated to account for new metadata types.

## Ignore Files

The `.gitignore` and `.forceignore` files in your repository should be updated based on the metadata types you wish to decompose.

Reference the below examples:

### `.gitignore` updates

Git should ignore the recomposed files.

```
# Ignore recomposed files
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
**/bots/*/*.botVersion-meta.xml
**/bots/*/*.bot-meta.xml
**/marketingappextensions/*.marketingappextension-meta.xml
```

Git should also ignore the log created by the `xml-disassembler` package.

```
disassemble.log
```

### `.forceignore` updates

The Salesforce CLI should ignore the decomposed files and should allow the recomposed files.

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
**/bots/**/*.xml
**/marketingappextensions/**/*.xml

# Allow the recomposed files
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
!**/bots/*/*.botVersion-meta.xml
!**/bots/*/*.bot-meta.xml
!**/marketingappextensions/*.marketingappextension-meta.xml
```

## Contributing

Any contributions you would like to make are appreciated. Please see [CONTRIBUTING](https://github.com/mcarvin8/sfdx-decomposer-plugin/blob/main/CONTRIBUTING.md).
