# sf-decomposer

[![NPM](https://img.shields.io/npm/v/sf-decomposer.svg?label=sf-decomposer)](https://www.npmjs.com/package/sf-decomposer)
[![Downloads/week](https://img.shields.io/npm/dw/sf-decomposer.svg)](https://npmjs.org/package/sf-decomposer)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
[![Maintainability](https://qlty.sh/badges/8492c1c6-0f93-4d37-bfad-32fd3b788a2d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/sf-decomposer)
[![Code Coverage](https://qlty.sh/badges/8492c1c6-0f93-4d37-bfad-32fd3b788a2d/test_coverage.svg)](https://qlty.sh/gh/mcarvin8/projects/sf-decomposer)
[![Known Vulnerabilities](https://snyk.io//test/github/mcarvin8/sf-decomposer/badge.svg?targetFile=package.json)](https://snyk.io//test/github/mcarvin8/sf-decomposer?targetFile=package.json)

A Salesforce CLI plugin that **decomposes** large metadata XML files into smaller, version-control–friendly files (XML, JSON, YAML, TOML, JSON5, or INI), and **recomposes** them back into deployment-ready metadata.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Quick Start](#quick-start)
- [Why sf-decomposer?](#why-sf-decomposer)
- [Commands](#commands)
  - [sf decomposer decompose](#sf-decomposer-decompose)
  - [sf decomposer recompose](#sf-decomposer-recompose)
- [Decompose Strategies](#decompose-strategies)
  - [Custom Labels](#custom-labels-decomposition)
  - [Permission Sets (grouped-by-tag)](#additional-permission-set-decomposition)
  - [Loyalty Program Setup](#loyalty-program-setup-decomposition)
- [Supported Metadata](#supported-metadata)
  - [Exceptions](#exceptions)
- [Troubleshooting](#troubleshooting)
- [Hooks](#hooks)
- [Ignore Files](#ignore-files)
  - [.forceignore](#forceignore)
  - [.sfdecomposerignore](#sfdecomposerignore)
  - [.gitignore](#gitignore)
- [Issues](#issues)
- [Built With](#built-with)
- [Contributing](#contributing)
- [License](#license)
</details>

---

## Quick Start

1. **Install the plugin**

   ```bash
   sf plugins install sf-decomposer@x.y.z
   ```

2. **Retrieve metadata** into your Salesforce DX project (e.g. `sf project retrieve start`).

3. **Decompose** the metadata types you need:

   ```bash
   sf decomposer decompose -m "flow" -m "labels" --postpurge
   ```

4. **Add decomposed paths to [.forceignore](#forceignore)**  
   This is **required** so the Salesforce CLI does not treat decomposed files as source. Use the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.forceignore) and adjust extensions for your chosen format (`.xml`, `.json`, `.yaml`, etc.).

5. **Commit** the decomposed files to version control.

6. **Before deploy**, recompose and then deploy:

   ```bash
   sf decomposer recompose -m "flow" -m "labels"
   sf project deploy start
   ```

---

## Why sf-decomposer?

Salesforce’s built-in decomposition is limited. sf-decomposer gives admins and developers more control, flexibility, and better versioning.

### Benefits

- **Broader metadata support** – Works with most Metadata API types, not just the subset Salesforce decomposes.
- **Selective decomposition** – Decompose only what you need; use [.sfdecomposerignore](#sfdecomposerignore) to skip specific files.
- **Two [strategies](#decompose-strategies)**:
  - **unique-id** (default): one file per nested element, named by content or hash.
  - **grouped-by-tag**: one file per tag (e.g. all `fieldPermissions` in a permission set in `fieldPermissions.xml`). Use `--decompose-nested-permissions` for deeper permission-set decomposition.
- **Full decomposition** – Fully decompose types that Salesforce only partially supports (e.g. permission sets).
- **Stable ordering** – Elements are sorted consistently to reduce noisy diffs.  
  _Note: TOML and INI output may sort differently from other formats._
- **Multiple formats** – Output as XML, JSON, JSON5, TOML, INI, or YAML.
- **CI/CD hooks** – Auto decompose after retrieve and recompose before deploy via [.sfdecomposer.config.json](#hooks).
- **Better reviews** – Smaller, structured files mean clearer pull requests and fewer merge conflicts.

---

## Commands

| Command                   | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `sf decomposer decompose` | Decompose metadata in package directories into smaller files.   |
| `sf decomposer recompose` | Recompose decomposed files back into deployment-ready metadata. |

### sf decomposer decompose

Decomposes metadata in all local package directories (from `sfdx-project.json`) into smaller files.

```
USAGE
  $ sf decomposer decompose -m <value> -f <value> -i <value> -s <value> [--prepurge --postpurge --debug -p --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable.
  -f, --format=<value>                    Output format: xml | yaml | json | toml | ini | json5 [default: xml]
  -i, --ignore-package-directory=<value>  Package directory to skip (as in sfdx-project.json). Repeatable.
  -s, --strategy=<value>                  unique-id | grouped-by-tag [default: unique-id]
  --prepurge                              Remove existing decomposed files before decomposing [default: false]
  --postpurge                             Remove original metadata files after decomposing [default: false]
  --debug                                 Write debug log to disassemble.log [default: false]
  -p, --decompose-nested-permissions      With grouped-by-tag, further decompose permission set object/field permissions

GLOBAL FLAGS
  --json  Output as JSON.
```

**Examples**

```bash
# Decompose flows (XML), purge before/after, with debug log
sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge --debug

# Decompose flows and labels in YAML
sf decomposer decompose -m "flow" -m "labels" -f "yaml" --prepurge --postpurge --debug

# Decompose flows, excluding the force-app package
sf decomposer decompose -m "flow" -i "force-app"
```

### sf decomposer recompose

Recomposes decomposed files into deployment-compatible metadata.

```
USAGE
  $ sf decomposer recompose -m <value> -i <value> [--postpurge --debug --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable.
  -i, --ignore-package-directory=<value>  Package directory to skip. Repeatable.
  --postpurge                             Remove decomposed files after recomposing [default: false]
  --debug                                 Write debug log to disassemble.log [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

**Examples**

```bash
sf decomposer recompose -m "flow" --postpurge --debug
sf decomposer recompose -m "flow" -i "force-app"
```

---

## Decompose Strategies

> **Important:** Use one strategy per metadata type. To switch from `unique-id` to `grouped-by-tag`, run decompose with `--prepurge` and `-s "grouped-by-tag"` to regenerate.

- **unique-id** (default): Each nested element goes to its own file, named by unique-id fields or content hash. Leaf elements stay in a file named like the original XML.
- **grouped-by-tag**: All elements with the same tag (e.g. `<fieldPermissions>`) go into one file named after the tag (e.g. `fieldPermissions.xml`). Leaf elements are still grouped in the original-named file.

**Permission set – unique-id**

| Format | Example                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| XML    | ![XML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-xml.png)     |
| YAML   | ![YAML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-yaml.png)   |
| JSON   | ![JSON](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-json.png)   |
| JSON5  | ![JSON5](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-json5.png) |
| TOML   | ![TOML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-toml.png)   |
| INI    | ![INI](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-ini.png)     |

**Permission set – grouped-by-tag**

| Format | Example                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| XML    | ![XML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-xml.png)     |
| YAML   | ![YAML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-yaml.png)   |
| JSON   | ![JSON](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-json.png)   |
| JSON5  | ![JSON5](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-json5.png) |
| TOML   | ![TOML](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-toml.png)   |
| INI    | ![INI](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags-ini.png)     |

### Custom Labels Decomposition

Custom labels use only the **unique-id** strategy. If you pass `grouped-by-tag`, the plugin overrides to `unique-id` and continues (with a warning). Each label is written to its own file.

![Decomposed Custom Labels](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-labels.png)

### Additional Permission Set Decomposition

With **grouped-by-tag**, use `--decompose-nested-permissions` (`-p`) to:

- Write each `<objectPermissions>` to its own file under `objectPermissions/`.
- Group `<fieldPermissions>` by object under `fieldPermissions/`.

Similar to Salesforce’s `decomposePermissionSetBeta2`, with more control and format options.

```bash
sf decomposer decompose -m "permissionset" -s "grouped-by-tag" -p
```

![Decomposed Perm Set](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/additional-perm-set-decomposed.png)

### Loyalty Program Setup Decomposition

`loyaltyProgramSetup` supports only **unique-id**. With `grouped-by-tag`, the plugin overrides to `unique-id` and warns.

Under unique-id:

- Each `<programProcesses>` element → its own file.
- Each `<parameters>` and `<rules>` child → its own file.

> Recomposition for loyalty program setup removes decomposed files even without `--postpurge`. Use version control or CI to keep them if needed.

![Decomposed Loyalty Program Setup](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-loyalty-program.png)

---

## Supported Metadata

All parent metadata types from this plugin’s version of **@salesforce/source-deploy-retrieve** (SDR) are supported, except where noted below.

Use the metadata **suffix** for `-m` / `--metadata-type`, as in [SDR’s metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json), or infer from the file name: `*.{suffix}-meta.xml`.

| Metadata Type               | CLI value                  |
| --------------------------- | -------------------------- |
| Custom Labels               | `labels`                   |
| Workflows                   | `workflow`                 |
| Profiles                    | `profile`                  |
| Permission Sets             | `permissionset`            |
| AI Scoring Model Definition | `aiScoringModelDefinition` |
| Decision Matrix Definition  | `decisionMatrixDefinition` |
| Bot                         | `bot`                      |
| Marketing App Extension     | `marketingappextension`    |

### Exceptions

| Situation                                                                                      | Message                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `botVersion` used directly                                                                     | `botVersion suffix should not be used. Please use bot to decompose/recompose bot and bot version files.`                          |
| Custom Objects                                                                                 | `Custom Objects are not supported by this plugin.`                                                                                |
| Unsupported SDR strategies (e.g. matchingContentFile, digitalExperience, mixedContent, bundle) | `Metadata types with [matchingContentFile, digitalExperience, mixedContent, bundle] strategies are not supported by this plugin.` |
| Child types (e.g. custom fields) or invalid suffix                                             | `Metadata type not found for the given suffix: field.`                                                                            |

---

## Troubleshooting

### Missing sfdx-project.json

The plugin looks for `sfdx-project.json` from the current directory up to the drive root. If it’s not found:

```
Error (1): sfdx-project.json not found in any parent directory.
```

### Log file (disassemble.log)

The plugin always writes a `disassemble.log` (via the xml-disassembler dependency). By default it contains only errors; the CLI still processes other files.

Example terminal warning:

```
Warning: ...\Get_Info.actionCalls-meta.xml was unable to be parsed and will not be processed. Confirm formatting and try again.
```

### Debug output

Use `--debug` with `decompose` or `recompose` to log detailed activity (including processed files) to `disassemble.log`.

### Files with only leaf elements

If a metadata file has only leaf elements (primitives, no nested structure), there is nothing to decompose. The file is skipped with a warning:

```
Warning: The XML file ...\view_of_projects_tab_on_opportunity.permissionset-meta.xml only has leaf elements. This file will not be disassembled.
```

---

## Hooks

> Configure [.forceignore](#forceignore) so the Salesforce CLI ignores decomposed files; otherwise `sf` commands can fail.

Put **.sfdecomposer.config.json** in the project root to run:

- **After** `sf project retrieve start`: decompose.
- **Before** `sf project deploy start` / `sf project deploy validate`: recompose.

Copy and customize the [sample config](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.sfdecomposer.config.json).

| Option                       | Required | Description                                                                                   |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `metadataSuffixes`           | Yes      | Comma-separated metadata suffixes to decompose/recompose.                                     |
| `ignorePackageDirectories`   | No       | Comma-separated package directories to skip.                                                  |
| `prePurge`                   | No       | Remove existing decomposed files before decomposing (default: false).                         |
| `postPurge`                  | No       | After decompose: remove originals; after recompose: remove decomposed files (default: false). |
| `decomposedFormat`           | No       | `xml` \| `json` \| `json5` \| `toml` \| `ini` \| `yaml` (default: xml).                       |
| `strategy`                   | No       | `unique-id` \| `grouped-by-tag` (default: unique-id).                                         |
| `decomposeNestedPermissions` | No       | With grouped-by-tag, set true to further decompose permission set object/field permissions.   |

---

## Ignore Files

### .forceignore

The Salesforce CLI must **ignore** decomposed files and **allow** recomposed files. Use the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.forceignore) and set patterns for the extensions you use (`.xml`, `.json`, `.yaml`, etc.).

### .sfdecomposerignore

Optional. In the project root, list paths/patterns to skip when **decomposing** (same syntax as [.gitignore 2.22.1](https://git-scm.com/docs/gitignore)). Ignored files are not recomposed from. With `--debug`, ignored matches are logged to `disassemble.log`.

### .gitignore

Optional. Ignore recomposed metadata and/or `disassemble.log` so they aren’t committed. See the [sample .gitignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/samples/.gitignore).

---

## Issues

Bugs and feature requests: [open an issue](https://github.com/mcarvin8/sf-decomposer/issues).

---

## Built With

- [xml-disassembler](https://github.com/mcarvin8/xml-disassembler) – XML disassemble/reassemble
- [fs-extra](https://github.com/jprichardson/node-fs-extra) – Extended Node.js `fs`
- [@salesforce/source-deploy-retrieve](https://github.com/forcedotcom/source-deploy-retrieve) – Salesforce metadata toolkit

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

## License

MIT. See [LICENSE](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md).
