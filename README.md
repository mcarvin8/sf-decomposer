# sf-decomposer

[![NPM](https://img.shields.io/npm/v/sf-decomposer.svg?label=sf-decomposer)](https://www.npmjs.com/package/sf-decomposer)
[![Downloads/week](https://img.shields.io/npm/dw/sf-decomposer.svg)](https://npmjs.org/package/sf-decomposer)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
[![Maintainability](https://qlty.sh/badges/8492c1c6-0f93-4d37-bfad-32fd3b788a2d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/sf-decomposer)
[![codecov](https://codecov.io/gh/mcarvin8/sf-decomposer/graph/badge.svg?token=YFU52L4XM5)](https://codecov.io/gh/mcarvin8/sf-decomposer)

A Salesforce CLI plugin that **decomposes** large metadata XML files into smaller, version-control–friendly files (XML, JSON, YAML, JSON5), and **recomposes** them back into deployment-ready metadata.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Quick Start](#quick-start)
- [Why sf-decomposer?](#why-sf-decomposer)
- [Commands](#commands)
  - [sf decomposer decompose](#sf-decomposer-decompose)
  - [sf decomposer recompose](#sf-decomposer-recompose)
  - [Manifest-scoped runs](#manifest-scoped-runs)
- [Decompose Strategies](#decompose-strategies)
  - [Custom Labels](#custom-labels-decomposition)
  - [Permission Sets (grouped-by-tag)](#additional-permission-set-decomposition)
  - [Loyalty Program Setup](#loyalty-program-setup-decomposition)
- [Supported Metadata](#supported-metadata)
  - [Exceptions](#exceptions)
- [Troubleshooting](#troubleshooting)
- [Hooks](#hooks)
- [Per-Type Overrides](#per-type-overrides)
- [Ignore Files](#ignore-files)
  - [.forceignore](#forceignore)
  - [.sfdecomposerignore](#sfdecomposerignore)
  - [.gitignore](#gitignore)
- [Issues](#issues)
- [Requirements](#requirements)
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
   This is **required** so the Salesforce CLI does not treat decomposed files as source. Use the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) and adjust extensions for your chosen format (`.xml`, `.json`, `.yaml`, etc.).

5. **Commit** the decomposed files to version control.

6. **Before deploy**, recompose and then deploy:

   ```bash
   sf decomposer recompose -m "flow" -m "labels"
   sf project deploy start
   ```

   Or scope the recompose to just the components in your deploy manifest:

   ```bash
   sf decomposer recompose -x "manifest/package.xml"
   sf project deploy start -x "manifest/package.xml"
   ```

---

## Requirements

The [xml-disassembler-node](https://github.com/mcarvin8/xml-disassembler-node) package, which depends on a Rust crate, ships with native binaries for these platforms:

| Platform    | Architectures                      |
| ----------- | ---------------------------------- |
| **macOS**   | x64 (Intel), arm64 (Apple Silicon) |
| **Linux**   | x64, arm64, ia32                   |
| **Windows** | x64                                |

If other platforms or architectures require support, please open an issue in [xml-disassembler-node](https://github.com/mcarvin8/xml-disassembler-node/issues).

---

## Why sf-decomposer?

Salesforce’s built-in decomposition is limited. sf-decomposer gives admins and developers more control, flexibility, and better versioning.

### Benefits

- **Broader metadata support** – Works with most Metadata API types, not just the subset Salesforce decomposes.
- **Selective decomposition** – Decompose only what you need; use [.sfdecomposerignore](#sfdecomposerignore) to skip specific files.
- **Manifest-scoped runs** – Pass `-x package.xml` to decompose or recompose only the components listed in a Salesforce manifest, mirroring `sf project deploy start -x`. Ideal for CI/CD pipelines that only ship a subset of metadata per deployment.
- **Two [strategies](#decompose-strategies)**:
  - **unique-id** (default): one file per nested element, named by content or hash.
  - **grouped-by-tag**: one file per tag (e.g. all `fieldPermissions` in a permission set in `fieldPermissions.xml`). Use `--decompose-nested-permissions` for deeper permission set and muting permission set decomposition.
- **Full decomposition** – Fully decompose types that Salesforce only partially supports (e.g. permission sets).
- **Stable ordering** – Elements are sorted consistently to reduce noisy diffs.
- **Multiple formats** – Output as XML, JSON, JSON5, or YAML.
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
  $ sf decomposer decompose [-m <value>] [-x <value>] [-f <value>] [-i <value>] [-s <value>] [--prepurge --postpurge -p -c --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable. Optional when --manifest is provided.
  -x, --manifest=<value>                  Path to a package.xml manifest. When provided, only the components listed in the manifest are decomposed.
  -f, --format=<value>                    Output format: xml | yaml | json | json5 [default: xml]
  -i, --ignore-package-directory=<value>  Package directory to skip (as in sfdx-project.json). Repeatable.
  -s, --strategy=<value>                  unique-id | grouped-by-tag [default: unique-id]
  --prepurge                              Remove existing decomposed files before decomposing [default: false]
  --postpurge                             Remove original metadata files after decomposing [default: false]
  -p, --decompose-nested-permissions      With grouped-by-tag, further decompose permission set and muting permission set object/field permissions
  -c, --config                            Load per-metadata-type overrides from .sfdecomposer.config.json in the repo root. Only the "overrides" array is consumed. See Per-Type Overrides. [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to the intersection of the two.

**Examples**

```bash
# Decompose flows (XML), purge before/after
sf decomposer decompose -m "flow" -f "xml" --prepurge --postpurge

# Decompose flows and labels in YAML
sf decomposer decompose -m "flow" -m "labels" -f "yaml" --prepurge --postpurge

# Decompose flows, excluding the force-app package
sf decomposer decompose -m "flow" -i "force-app"

# Decompose only the components listed in a manifest
sf decomposer decompose -x "manifest/package.xml" --prepurge

# Restrict a manifest run to a single metadata type
sf decomposer decompose -x "manifest/package.xml" -m "permissionset"
```

### sf decomposer recompose

Recomposes decomposed files into deployment-compatible metadata.

```
USAGE
  $ sf decomposer recompose [-m <value>] [-x <value>] [-i <value>] [--postpurge --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable. Optional when --manifest is provided.
  -x, --manifest=<value>                  Path to a package.xml manifest. When provided, only the components listed in the manifest are recomposed.
  -i, --ignore-package-directory=<value>  Package directory to skip. Repeatable.
  --postpurge                             Remove decomposed files after recomposing [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to the intersection of the two.

**Examples**

```bash
sf decomposer recompose -m "flow" --postpurge
sf decomposer recompose -m "flow" -i "force-app"

# Recompose only the components listed in a deploy manifest before deploying
sf decomposer recompose -x "manifest/package.xml"
sf project deploy start -x "manifest/package.xml"
```

### Manifest-scoped runs

The `-x` / `--manifest` flag accepts any standard Salesforce `package.xml` and limits the work to just the components it lists. This is especially useful for CI/CD pipelines that deploy a subset of metadata per change.

How it works:

- The manifest is parsed with `@salesforce/source-deploy-retrieve`'s `ManifestResolver`, so the same XML you pass to `sf project deploy start -x` is honored here.
- For each entry, the plugin resolves the matching parent metadata files in your local package directories (using each metadata type's `directoryName`, `suffix`, `strictDirectoryName`, and `folderType` from the SDR registry).
- Only those files are decomposed/recomposed; everything else on disk is left untouched.
- Wildcards (`<members>*</members>`) expand against your local source. Folder-typed members (e.g. `MyFolder/MyReport`) are resolved by walking the folder.
- Types in the manifest that the plugin does not support (e.g. `CustomObject`, `ApexClass`) are skipped with a warning instead of failing the run, so a single manifest can drive both deploys and decomposer runs.
- If both `--metadata-type` and `--manifest` are provided, the run is scoped to the intersection (only types present in both).

Example manifest:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types>
    <members>HR_Admin</members>
    <name>PermissionSet</name>
  </types>
  <types>
    <members>Case</members>
    <name>Workflow</name>
  </types>
  <version>58.0</version>
</Package>
```

```bash
sf decomposer recompose -x "manifest/package.xml"
sf project deploy start -x "manifest/package.xml"
```

---

## Decompose Strategies

> **Important:** Use one strategy per metadata type. To switch from `unique-id` to `grouped-by-tag`, run decompose with `--prepurge` and `-s "grouped-by-tag"` to regenerate.

- **unique-id** (default): Each nested element goes to its own file, named by unique-id fields or content hash. Leaf elements stay in a file named like the original XML.
- **grouped-by-tag**: All elements with the same tag (e.g. `<fieldPermissions>`) go into one file named after the tag (e.g. `fieldPermissions.xml`). Leaf elements are still grouped in the original-named file.

**Permission set – unique-id**

![Unique ID](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-uid.png)

**Permission set – grouped-by-tag**

![Grouped By Tag](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-tags.png)

### Custom Labels Decomposition

Custom labels use only the **unique-id** strategy. If you pass `grouped-by-tag`, the plugin overrides to `unique-id` and continues. Grouping labels by tag would produce no difference from the original file since all elements share the same tag. Each label is written to its own file.

![Decomposed Custom Labels](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-labels.png)

### Additional Permission Set Decomposition

With **grouped-by-tag**, use `--decompose-nested-permissions` (`-p`) to further decompose permission sets and muting permission sets:

- Write each `<objectPermissions>` to its own file under `objectPermissions/`.
- Group `<fieldPermissions>` by object under `fieldPermissions/`.

Similar to Salesforce’s `decomposePermissionSetBeta2`, with more control and format options. Muting permission sets extend the permission set metadata type and support the same decomposition.

```bash
sf decomposer decompose -m "permissionset" -s "grouped-by-tag" -p
sf decomposer decompose -m "mutingpermissionset" -s "grouped-by-tag" -p
```

![Decomposed Perm Set](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/additional-perm-set-decomposed.png)

### Loyalty Program Setup Decomposition

`loyaltyProgramSetup` supports only the **unique-id** strategy. If you pass `grouped-by-tag`, the plugin overrides to `unique-id` and continues. The metadata is automatically decomposed further under unique-id:

- Each `<programProcesses>` element → its own file.
- Each `<parameters>` and `<rules>` child → its own file.

> Recomposition for loyalty program setup removes decomposed files even without `--postpurge`. Use version control or CI to keep them if needed.

![Decomposed Loyalty Program Setup](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/.github/images/decomposed-loyalty-program.png)

---

## Supported Metadata

All parent metadata types from this plugin’s version of **@salesforce/source-deploy-retrieve** (SDR) are supported, except where noted below.

Use the metadata **suffix** for `-m` / `--metadata-type`, as in [SDR’s metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json), or infer from the file name: `*.{suffix}-meta.xml`.

| Metadata Type               | CLI value                  | Notes                                                                                                                                                                      |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom Labels               | `labels`                   | Strategy overridden to `unique-id` if `grouped-by-tag` is provided (grouping labels by tag would be no different from the original file).                                  |
| Workflows                   | `workflow`                 |                                                                                                                                                                            |
| Profiles                    | `profile`                  |                                                                                                                                                                            |
| Permission Sets             | `permissionset`            | Supports `--decompose-nested-permissions` with grouped-by-tag.                                                                                                             |
| Muting Permission Sets      | `mutingpermissionset`      | Extends permission set metadata type. Supports `--decompose-nested-permissions` with grouped-by-tag.                                                                       |
| AI Scoring Model Definition | `aiScoringModelDefinition` |                                                                                                                                                                            |
| Decision Matrix Definition  | `decisionMatrixDefinition` |                                                                                                                                                                            |
| Bot                         | `bot`                      |                                                                                                                                                                            |
| Marketing App Extension     | `marketingappextension`    |                                                                                                                                                                            |
| Loyalty Program Setup       | `loyaltyProgramSetup`      | Only `unique-id` strategy supported; `grouped-by-tag` is overridden. Automatically decomposed further (see [Loyalty Program Setup](#loyalty-program-setup-decomposition)). |

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

### Package Directories Not Found for Given Metadata Type

This plugin relies on the @salesforce/source-deploy-retrieve metadata registry to map each metadata type to its expected directory name.

If you provide a metadata type whose corresponding directory does not exist in any of your package directories, the plugin will fail with the following error:

```
No directories named ${metadataTypeEntry.directoryName} were found in any package directory.
```

For example, if you attempt to decompose Custom Labels but none of your package directories contain a "labels" folder, the plugin will throw this error.

### XML disassemble output (Rust crate)

The xml-disassembler Node plugin uses a **Rust crate** for XML decomposing and recomposing. Disassemble errors and messages are shown in the terminal.

Control verbosity with the `RUST_LOG` environment variable (e.g. `RUST_LOG=debug` for detailed output).

Example output in the terminal (Rust log format):

```
[2026-02-11T22:52:32Z ERROR xml_disassembler::builders::build_disassembled_files] The XML file C:\Users\matthew.carvin\Documents\sf-decomposer\fixtures\package-dir-1\permissionsets\only_leafs.permissionset-meta.xml only has leaf elements. This file will not be disassembled.
```

### Files with only leaf elements

If a metadata file has only leaf elements (primitives, no nested structure), there is nothing to decompose. The Rust crate skips the file and logs an ERROR like the example above.

---

## Hooks

> Configure [.forceignore](#forceignore) so the Salesforce CLI ignores decomposed files; otherwise `sf` commands can fail.

Put **.sfdecomposer.config.json** in the project root to run:

- **After** `sf project retrieve start`: decompose.
- **Before** `sf project deploy start` / `sf project deploy validate`: recompose.

Copy and customize the [sample config](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.json), or the [sample config with per-type overrides](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.overrides.json) to vary format/strategy/etc. by metadata type.

| Option                       | Required    | Description                                                                                                                                                                        |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadataSuffixes`           | Conditional | Comma-separated metadata suffixes to decompose/recompose. Required unless `manifest` is set; when both are set, the run is scoped to the intersection.                             |
| `manifest`                   | Conditional | Path (relative to the project root) to a `package.xml` manifest. When set, only the components listed in the manifest are decomposed/recomposed. See `-x` above.                   |
| `ignorePackageDirectories`   | No          | Comma-separated package directories to skip.                                                                                                                                       |
| `prePurge`                   | No          | Remove existing decomposed files before decomposing (default: false).                                                                                                              |
| `postPurge`                  | No          | After decompose: remove originals; after recompose: remove decomposed files (default: false).                                                                                      |
| `decomposedFormat`           | No          | xml, json, json5, or yaml (default: xml).                                                                                                                                          |
| `strategy`                   | No          | `unique-id` \| `grouped-by-tag` (default: unique-id).                                                                                                                              |
| `decomposeNestedPermissions` | No          | With grouped-by-tag, set true to further decompose permission set and muting permission set object/field permissions.                                                              |
| `overrides`                  | No          | Array of per-metadata-type overrides for `decomposedFormat`, `strategy`, `decomposeNestedPermissions`, `prePurge`, and `postPurge`. See [Per-Type Overrides](#per-type-overrides). |

---

## Per-Type Overrides

Per-type overrides apply to **decompose only**. Recompose is a deterministic round-trip — it auto-detects format from the on-disk files and does not depend on strategy — so it ignores the `overrides` array.

By default, a single decompose run uses one format and one strategy across every metadata type. The optional `overrides` array in `.sfdecomposer.config.json` lets you vary a small set of options per metadata suffix without splitting the run into multiple invocations.

```json
{
  "metadataSuffixes": "labels,workflow,profile,flow,permissionset",
  "ignorePackageDirectories": "force-app,examples",
  "prePurge": true,
  "postPurge": true,
  "decomposedFormat": "xml",
  "strategy": "unique-id",
  "overrides": [
    { "metadataTypes": ["flow"], "decomposedFormat": "yaml" },
    {
      "metadataTypes": ["permissionset", "mutingpermissionset"],
      "strategy": "grouped-by-tag",
      "decomposeNestedPermissions": true
    }
  ]
}
```

### What can be overridden

| Field                        | Notes                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadataTypes`              | Required. Array of metadata suffixes (same vocabulary as `--metadata-type` / `metadataSuffixes`). Each suffix may appear in at most one override. |
| `decomposedFormat`           | `xml` \| `json` \| `json5` \| `yaml`.                                                                                                             |
| `strategy`                   | `unique-id` \| `grouped-by-tag`. Hard rules still win — `labels` and `loyaltyProgramSetup` are always treated as `unique-id`.                     |
| `decomposeNestedPermissions` | Only applies to `permissionset` / `mutingpermissionset` with `grouped-by-tag`.                                                                    |
| `prePurge`                   | Per-type prePurge (decompose).                                                                                                                    |
| `postPurge`                  | Per-type postPurge (decompose: remove originals after decomposing).                                                                               |

Run-scope options (`metadataSuffixes`, `manifest`, `ignorePackageDirectories`) are **not** valid inside an override; the plugin will throw if they are present.

### Precedence

For each metadata type, the effective value is resolved as:

1. The per-type override value, if set.
2. Otherwise, the run-wide value (CLI flag, hook config top-level field, or built-in default).
3. Hard plugin rules (e.g. labels → `unique-id`) still override both.

### Opting in from the CLI

CLI users can opt into overrides on `decompose` with the boolean `--config` (`-c`) flag. When set, the plugin reads `.sfdecomposer.config.json` from the repo root (the nearest ancestor directory that contains `sfdx-project.json`):

```bash
sf decomposer decompose -m "flow" -m "permissionset" -c
```

When `--config` is set, **only** the `overrides` array is consumed from the file. Top-level fields like `decomposedFormat`, `strategy`, `metadataSuffixes`, etc. are ignored — the CLI flags remain the source of truth for run-wide values. This keeps direct CLI behavior predictable and lets you reuse the same config file as the post-retrieve hook without any surprises.

If `--config` is set but `.sfdecomposer.config.json` is missing from the repo root, the command fails with a clear error.

`recompose` does not accept `--config` because it does not need the override information — format is auto-detected from the decomposed files on disk and recompose does not depend on strategy.

The post-retrieve hook automatically picks up `overrides` from `.sfdecomposer.config.json` — no extra setup required. Existing config files without an `overrides` field continue to behave exactly as before.

---

## Ignore Files

### .forceignore

The Salesforce CLI must **ignore** decomposed files and **allow** recomposed files. Use the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) and set patterns for the extensions you use (`.xml`, `.json`, `.yaml`, etc.).

### .sfdecomposerignore

Optional. In the project root, list paths/patterns to skip when **decomposing** (same syntax as [.gitignore 2.22.1](https://git-scm.com/docs/gitignore)). Ignored files are not recomposed from.

### .gitignore

Optional. Ignore recomposed metadata so it aren’t committed. See the [sample .gitignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.gitignore).

---

## Issues

Bugs and feature requests: [open an issue](https://github.com/mcarvin8/sf-decomposer/issues).

---

## Built With

- [xml-disassembler-node](https://github.com/mcarvin8/xml-disassembler-node) – Disassemble XML into smaller, manageable files and reassemble when needed. Node.js + Rust (Neon). Includes prebuilt binaries for macOS (x64, arm64), Linux (x64, arm64, ia32), and Windows (x64).
- [@salesforce/source-deploy-retrieve](https://github.com/forcedotcom/source-deploy-retrieve) – JavaScript toolkit for working with Salesforce metadata.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

## License

[MIT](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
