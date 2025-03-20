# `sf-decomposer`

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
- [Built With](#built-with)
- [Contributing](#contributing)
- [License](#license)
</details>

Break down large Salesforce metadata files (XML) into smaller, more manageable files (XML/JSON/YAML/JSON5) for version control and then recreate deployment-compatible files.

## Quick Start

1. Install plugin using `sf`

```bash
sf plugins install sf-decomposer@x.y.z
```

2. [Decompose](#sf-decomposer-decompose) the metadata type(s) in your Salesforce DX project

```bash
sf decomposer decompose -m "flow" -m "labels"
```

3. Add decomposed files to [`.forceignore`](#.forceignore)

> This is **REQUIRED** to avoid errors when running `sf`commands

4. Stage decomposed files in version control

5. [Recompose](#sf-decomposer-recompose) the metadata type(s) before deployment

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
- **Multiple Decompose Formats**: `sf-decomposer` allows you to decompose the original XML file into smaller XML, JSON, JSON5, or YAML files depending on your preference.
- **CI/CD Friendly**: Hooks allow for seamless decomposition and recomposition in CI/CD workflows.
- **Better Version Control**: Smaller files make pull requests more readable and reduce merge conflicts.

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
                                          Options: ['xml', 'yaml', 'json', 'json5']
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

EXAMPLES
  Decompose all flows in XML format:

    $ sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug

  Decompose all flows and custom labels in YAML format

    $ sf decomposer decompose -m "flow" -m "labels" -f "yaml" --prepurge --postpurge --debug

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
                                            Options: ['xml', 'yaml', 'json', 'json5']
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

EXAMPLES
  Recompose all flows:

    $ sf decomposer recompose -m "flow" -f "xml" --postpurge --debug

  Recompose all decomposed flows and custom labels YAMLs into XMLs

    $ sf decomposer recompose -m "flow" -m "labels" -f "yaml" --postpurge --debug

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

The `--metadata-type`/`-m` flag should be the metadata's `suffix` value as listed in the [metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json). You can also infer the suffix by looking at the original XML file-name, i.e. `*.{suffix}-meta.xml`.

Here are some examples:

- Custom Labels (`--metadata-type "labels"`)
- Workflows (`--metadata-type "workflow"`)
- Profiles (`--metadata-type "profile"`)
- Permission Sets (`--metadata-type "permissionset"`)
- AI Scoring Model Definition (`--metadata-type "aiScoringModelDefinition"`)
- Decision Matrix Definition (`--metadata-type "decisionMatrixDefinition"`)
- Bot (`--metadata-type "bot"`)
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

The `xml-disassembler` package will create a log file, `disassemble.log`, at all times. By default, the log will only contain XML decomposing/recomposing errors. XML decomposing/recomposing errors do not cause the Salesforce CLI to fail. The CLI will proceed to decompose/recompose all remaining metadata.

The Salesforce CLI will print XML errors as warnings in the terminal:

```
Warning: C:\Users\matth\Documents\sf-decomposer\test\baselines\flows\Get_Info\actionCalls\Get_Info.actionCalls-meta.xml was unabled to be parsed and will not be processed. Confirm formatting and try again.
```

To add debugging to the log, provide the `--debug` flag to the decompose or recompose command.

```
[2024-03-30T14:28:37.959] [DEBUG] default - Created disassembled file: mock\no-nested-elements\HR_Admin\HR_Admin.permissionset-meta.xml
```

## Hooks

> **NOTE:** In order to avoid errors when running `sf` commands, you must configure your `.forceignore` file to have the Salesforce CLI ignore the decomposed files. See [Ignore Files](#ignore-files).

`sf-decomposer` supports automatic decomposition and recomposition by defining a `.sfdecomposer.config.json` file in your project root.

You can copy and update the sample [.sfdecomposer.config.json](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.sfdecomposer.config.json).

- `metadataSuffixes` is required and should be a comma-separated string of metadata suffixes to decompose and recompose based on the CLI command.
- `ignorePackageDirectories` is optional and should be a comma-separated string of package directories to ignore.
- `prePurge` is optional and should be `true` or `false`. If true, this will delete any existing decomposed files before decomposing the files. This defauls to `false`.
- `postPurge` is optional and should be `true` or `false`. If true, this will delete the retrieval file after decomposing it or delete the decomposed files after recomposing them. This defauls to `false`.
- `decomposedFormat` is optional and should be either `xml`, `json`, `json5`, or `yaml`, depending on the decomposed file format. This defaults to `xml`.

If `.sfdecomposer.config.json` is found, the hooks will run:

- the decompose command **after** a `sf project retrieve start` command completes successfully (post-run)
- the recompose command **before** a `sf project deploy [start/validate]` command starts (pre-run)

If `.sfdecomposer.config.json` isn't found, the hooks will be skipped.

## Ignore Files

### `.forceignore`

The Salesforce CLI **must** ignore the decomposed files and allow the recomposed files.

You can use the sample [.forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.forceignore). Update the decomposed file extensions based on what format you're using (`.xml`, `.json`, `.json5`, or `.yaml`).

### `.sfdecomposerignore`

Optionally, you can create a `.sfdecomposerignore` file in the root of your Salesforce DX project to ignore specific XMLs when decomposing. The `.sfdecomposerignore` file should follow [.gitignore spec 2.22.1](https://git-scm.com/docs/gitignore).

When you run `sf decomposer decompose --debug` and it processes a file that matches an entry in `.sfdecomposerignore`, a warning will be printed to the `disassemble.log`:

```
[2024-05-22T09:32:12.078] [WARN] default - File ignored by .sfdecomposerignore: C:\Users\matth\Documents\sf-decomposer\test\baselines\bots\Assessment_Bot\v1.botVersion-meta.xml
```

`.sfdecomposerignore` is not read when recomposing metadata.

### `.gitignore`

Optionally, git can ignore the recomposed files so you don't stage those in your repositories. You can also have git ignore the `disassemble.log` created by the `xml-disassembler` package.

You can use the sample [.gitignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.gitignore).

## Issues

If you encounter any bugs or would like to request features, please create an [issue](https://github.com/mcarvin8/sf-decomposer/issues).

## Built With

- [`xml-disassembler`](https://github.com/mcarvin8/xml-disassembler)
- [`xml2json-disassembler`](https://github.com/mcarvin8/xml2json-disassembler)
- [`xml2yaml-disassembler`](https://github.com/mcarvin8/xml2yaml-disassembler)
- [`xml2json5-disassembler`](https://github.com/mcarvin8/xml2json5-disassembler)

## Contributing

Contributions are welcome! See [Contributing](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the MIT license. Please see the [LICENSE](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md) file for details.
