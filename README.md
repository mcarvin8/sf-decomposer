# sf-decomposer

[![NPM](https://img.shields.io/npm/v/sf-decomposer.svg?label=sf-decomposer)](https://www.npmjs.com/package/sf-decomposer) [![Downloads/week](https://img.shields.io/npm/dw/sf-decomposer.svg)](https://npmjs.org/package/sf-decomposer) [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Quick Start](#quick-start)
- [Why SF Decomposer](#why-sf-decomposer)
- [Commands](#commands)
  - [`sf decomposer decompose`](#sf-decomposer-decompose)
  - [`sf decomposer recompose`](#sf-decomposer-recompose)
- [Decompose Structure](#decompose-structure)
- [Supported Metadata](#supported-metadata)
  - [Metadata Exceptions](#metadata-exceptions)
- [Troubleshooting](#troubleshooting)
- [Hooks](#hooks)
- [Ignore Files](#ignore-files)
  - [`.forceignore`](#.forceignore)
  - [`.sfdecomposerignore`](#.sfdecomposerignore)
  - [`.gitignore`](#.gitignore)
- [Issues](#issues)
- [Contributing](#contributing)
- [License](#license)
</details>

Break down large Salesforce metadata files into smaller, more manageable files for version control and then recreate deployment-compatible files.

## Quick Start
1. Install plugin using `sf`

```bash
sf plugins install sf-decomposer@x.y.z
```

2. Decompose the metadata type(s)

```bash
sf decomposer decompose -m "flow" -m "labels"
```

3. Add decomposed files to `.forceignore`

> This is **REQUIRED** to avoid errors when running `sf`commands. See [Ignore Files](#ignore-files) section.

4. Stage files in version control

5. Recompose the metadata type(s)

```bash
sf decomposer recompose -m "flow" -m "labels"
```

6. Deploy recomposed metadata

## Why SF Decomposer

Why should you consider using `sf-decomposer` over Salesforce's decomposition?

- **Broad Metadata Support**: Unlike Salesforce's decomposition, `sf-decomposer` supports most metadata types available in the Metadata API.  
- **Selective Decomposition**: `sf-decomposer` allows you to decompose only the metadata you need instead of Salesforce's all-or-nothing approach.
  - See [.sfdecomposerignore](#.sfdecomposerignore)
- **Complete Decomposition**: Partially decomposed metadata types (e.g., Salesforce's `decomposePermissionSetBeta2`) can be fully decomposed by `sf-decomposer`.  
- **Consistent Sorting**: `sf-decomposer` recomposition ensures elements are always sorted consistently for better version control.

In general, `sf-decomposer` helps Salesforce Admins do a few things with their source deployments:

- Enhance peer reviews of large metadata in CI/CD platforms like GitHub, i.e. easier-to-review diffs in pull requests
- Make deployments safer by ensuring only the intended changes are deployed, improving the overall version control process

## Commands

The `sf-decomposer` supports 2 commands:

- `sf decomposer decompose`
- `sf decomposer recompose`

## `sf decomposer decompose`

Decomposes the original metadata files in all local package directories into smaller files for version control. 

```
USAGE
  $ sf decomposer decompose -m <value> -f <value> -i <value> [--prepurge --postpurge --debug --json]

FLAGS
  -m, --metadata-type=<value>             The metadata suffix to process, such as 'flow', 'labels', etc. 
                                          Can be declared multiple times.
  -f, --format=<value>                    The file type for the decomposed files. 
                                          Must match what format you provide for recompose.
                                          [default: 'xml']
  -i, --ignore-package-directory=<value>  Package directory to ignore.
                                          Should be as they appear in the "sfdx-project.json".
                                          Can be declared multiple times.
  --prepurge                              Purgd directories of pre-existing decomposed files.
                                          [default: false] 
  --postpurge                             Purge the original files after decomposing them.
                                          [default: false] 
  --debug                                 Log debugging results to a text file (disassemble.log).
                                          [default: false] 

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Decompose large metadata files into smaller files.

  You should run this after you retrieve metadata from an org.

EXAMPLES
  Decompose all flows:

    $ sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug

  Decompose all flows and custom labels:

    $ sf decomposer decompose -m "flow" -m "labels" -f "xml" --prepurge --postpurge --debug

  Decompose flows except for those in the "force-app" package directory.

    $ sf decomposer decompose -m "flow" -i "force-app"

```

## `sf decomposer recompose`

Recompose decomposed files into deployment-compatible files.

```
USAGE
  $ sf decomposer recompose -m <value> -f <value> -i <value> [--postpurge --debug --json]

FLAGS
  -m, --metadata-type=<value>               The metadata suffix to process, such as 'flow', 'labels', etc. 
                                            Can be declared multiple times.
  -f, --format=<value>                      The file format for the decomposed files.
                                            Must match what format you provide for decompose.
                                            [default: 'xml']
  -i, --ignore-package-directory=<value>    Package directory to ignore. 
                                            Should be as they appear in the "sfdx-project.json".
                                            Can be declared multiple times.
  --postpurge                               Purge the decomposed files after recomposing them.
                                            [default: false]
  --debug                                   Log debugging results to a text file (disassemble.log).
                                            [default: false]

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Recompose the decomposed files into deployment-compatible metadata files.

  You should run this before you deploy decomposed metadata to an org.

EXAMPLES
  Recompose all flows:

    $ sf decomposer recompose -m "flow" -f "xml" --postpurge --debug

  Recompose all flows and custom labels:

    $ sf decomposer recompose -m "flow" -m "labels" -f "xml" --postpurge --debug

  Recompose flows except for those in the "force-app" package directory.

    $ sf decomposer recompose -m "flow" -i "force-app"

```

## Decompose Structure

When the original metadata files are decomposed, this structure is followed for all metadata types except for custom labels:

- Leaf elements (i.e. `<userLicense>Salesforce</userLicense>`) will be decomposed in the same file in the root of the decomposed directory. The leaf file-name will match the original file-name.
- Nested elements will be decomposed into their own files under sub-directories by the element type, i.e. custom permissions in a permission set will have their own decomposed file under a custom permissions sub-folder. 
  - If unique ID elements are found, the decomposed nested files will be named using them.
  - Otherwise, the decomposed nested files will be named with the SHA-256 hash of the element contents.
  - See [Contributing](#contributing) for more information on unique ID elements.

<img src="https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-perm-set.png">
<p><em>Decomposed Permission Sets named using unique ID elements</em></p>

<br>

<img src="https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-apps-hashes.png">
<p><em>Decomposed Application named using SHA-256 hashes of elements</em></p>

When custom labels are decomposed, each custom label will have its own file in the original labels directory.

<img src="https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-labels.png" alt="Description"> 
<p><em>Decomposed Custom Labels</em></p>

## Supported Metadata

All parent metadata types imported from this plugin's version of `@salesforce/source-deploy-retrieve` (SDR) toolkit are supported except for certain types.

The `--metadata-type`/`-m` flag should be the metadata's `suffix` value as listed in the [metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json).

Here are some examples:

- Custom Labels (`--metadata-type "labels"`)
- Workflows (`--metadata-type "workflow"`)
- Profiles (`--metadata-type "profile"`)
- Permission Sets (`--metadata-type "permissionset"`)
- AI Scoring Model Definition (`--metadata-type "aiScoringModelDefinition"`)
- Decision Matrix Definition (`--metadata-type "decisionMatrixDefinition"`)
- Bot (`--metadata-type "bot"`)
  - **NOTE**: Running "bot" will also decompose and recompose Bot Version meta files. The `botVersion` meta suffix will be blocked from running directly.
- Marketing App Extension (`--metadata-type "marketingappextension"`)

### Metadata Exceptions

- `botVersion` is blocked from being ran directly. Please use the `bot` meta suffix to decompose and recompose bots and bot versions.
  ```
  Error (1): `botVersion` suffix should not be used. Please use `bot` to decompose/recompose bot and bot version files.
  ```
- Custom Objects are not supported by this plugin as they already are decomposed by default.
  ```
  Error (1): Custom Objects are not supported by this plugin.
  ```
- Metadata types such as Apex Classes, Apex Components, Triggers, etc. with certain SDR adapter strategies (`matchingContentFile`, `digitalExperience`, `mixedContent`, `bundle`) are not supported by this plugin.
  ```
  Error (1): Metadata types with [matchingContentFile, digitalExperience, mixedContent, bundle] strategies are not supported by this plugin.
  ```
- Children metadata types (i.e. custom fields) are not supported and will result in this general error:
  ```
  Error (1): Metadata type not found for the given suffix: field.
  ```

## Troubleshooting

`sf-decomposer` searches the current working directory for the `sfdx-project.json`, and if it's not found in the current working directory, it will search upwards for it until it hits your root drive. If the `sfdx-project.json` file isn't found, the plugin will fail with:

```
Error (1): sfdx-project.json not found in any parent directory.
```

The `xml-disassembler` package will log errors, and optionally debugging statements, to a log file, `disassemble.log`. This log will be created in the working directory and will be created when running this plugin at all times. If there were no errors, this log will be empty. By default, the log will only contain errors. This plugin will print the errors as warnings in the command terminal to allow all other files to be processed. These warnings when decomposing or recomposing will look like:

```
Warning: C:\Users\matth\Documents\sf-decomposer\test\baselines\flows\Get_Info\actionCalls\Get_Info.actionCalls-meta.xml was unabled to be parsed and will not be processed. Confirm formatting and try again.
```

To add additional debugging statements to the log file, provide the `--debug` flag to the decompose or recompose command. Debugging statements will look like:

```
[2024-03-30T14:28:37.959] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\HR_Admin.permissionset-meta.xml
```

Recommend adding the `disassemble.log` to your `.gitignore` file if you are using this in a git-based repo.

## Hooks

> **NOTE:** In order to avoid errors when running `sf` commands, you must configure your `.forceignore` file to have the Salesforce CLI ignore the decomposed files. See [Ignore Files](#ignore-files) section.

To automate decomposing and recomposing, create `.sfdecomposer.config.json` in the root of your Salesforce DX project. You can copy and update the sample [.sfdecomposer.config.json](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.sfdecomposer.config.json) provided.

- `metadataSuffixes` is required and should be a comma-separated string of metadata suffixes to decompose automatically after retrievals.
- `ignorePackageDirectories` is optional and should be a comma-separated string of package directories to ignore.
- `prePurge` is optional and should be a boolean. If true, this will delete any existing decomposed files before decomposing the files. If you do not provide this, the default will be `false`. This flag is not used by the recompose command/pre-run hook.
- `postPurge` is optional and should be a boolean. If true, this will delete the retrieval file after decomposing it or delete the decomposed files after recomposing them. If you do not provide this, the default will be `false`.
- `decomposedFormat` is optional and should be either `xml`, `json`, or `yaml`, depending on what file format you want the decomposed files created as. If you do not provide this, the default will be `xml`.

If `.sfdecomposer.config.json` is found, the hooks will fire:

- the decompose command after a `sf project retrieve start` command completes successfully (post-run)
- the recompose command before a `sf project deploy start` or `sf project deploy validate` command starts (pre-run)

If `.sfdecomposer.config.json` isn't found, the hooks will be skipped.

## Ignore Files

### `.forceignore`

The Salesforce CLI **must** ignore the decomposed files and allow the recomposed files.

You can use the sample [.forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.forceignore) provided. Update the decomposed file extensions based on what format you're using (`.xml`, `.json`, or `.yaml`).

### `.sfdecomposerignore`

If you wish, you can create a `.sfdecomposerignore` file in the root of your repository to ignore specific XMLs when running the decompose command. The `.sfdecomposerignore` file should follow [.gitignore spec 2.22.1](https://git-scm.com/docs/gitignore).

When the decompose command is ran with the `--debug` flag and it processes a file that matches an entry in `.sfdecomposerignore`, a warning will be printed to the `disassemble.log`:

```
[2024-05-22T09:32:12.078] [WARN] default - File ignored by .sfdecomposerignore: C:\Users\matth\Documents\sf-decomposer\test\baselines\bots\Assessment_Bot\v1.botVersion-meta.xml
```

`.sfdecomposerignore` is not read by the recompose command.

### `.gitignore`

Optionally, git can ignore the recomposed files so you don't stage those in your repositories. You can also have git ignore the `disassemble.log` created by the `xml-disassembler` package.

You can use the sample [.gitignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.gitignore) provided.

## Issues

If you encounter any bugs or would like to request features, please create an [issue](https://github.com/mcarvin8/sf-decomposer/issues).

## Contributing

Contributions are welcome! See [Contributing](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the MIT license. Please see the [LICENSE](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md) file for details.
