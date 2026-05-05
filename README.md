# sf-decomposer

[![NPM](https://img.shields.io/npm/v/sf-decomposer.svg?label=sf-decomposer)](https://www.npmjs.com/package/sf-decomposer)
[![Downloads/week](https://img.shields.io/npm/dw/sf-decomposer.svg)](https://npmjs.org/package/sf-decomposer)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
[![Maintainability](https://qlty.sh/badges/8492c1c6-0f93-4d37-bfad-32fd3b788a2d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/sf-decomposer)
[![codecov](https://codecov.io/gh/mcarvin8/sf-decomposer/graph/badge.svg?token=YFU52L4XM5)](https://codecov.io/gh/mcarvin8/sf-decomposer)
[![Performance](https://img.shields.io/badge/Performance-Dashboard-58a6ff)](https://mcarvin8.github.io/sf-decomposer/dev/bench/runtime/)

A Salesforce CLI plugin that **decomposes** large metadata XML files into smaller, version-control–friendly files (XML, JSON, YAML, JSON5), and **recomposes** them back into deployment-ready metadata.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Why sf-decomposer?](#why-sf-decomposer)
- [Commands](#commands)
- [Manifest-scoped runs](#manifest-scoped-runs)
- [Decompose Strategies](#decompose-strategies)
- [Supported Metadata](#supported-metadata)
- [Troubleshooting](#troubleshooting)
- [Hooks](#hooks)
- [Per-Type & Per-Component Overrides](#per-type--per-component-overrides)
- [Ignore Files](#ignore-files)
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

> Combine steps 2 & 3 by configuring the [hooks](#hooks).

4. **Add decomposed paths to [.forceignore](#forceignore)**  
   This is **required** so the Salesforce CLI does not treat decomposed files as source. Use the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) and adjust extensions for your chosen format (`.xml`, `.json`, `.yaml`, etc.).

5. **Commit** the decomposed files to version control.

6. **Before deploy**, recompose and then deploy:

   ```bash
   sf decomposer recompose -m "flow" -m "labels"
   sf project deploy start
   ```

   Pass `-x manifest/package.xml` to both commands to scope the run to the components in a deploy manifest. Configuring the [hooks](#hooks) automates this step entirely.

---

## Requirements

The [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node) package, which depends on a Rust crate, ships with native binaries for these platforms:

| Platform    | Architectures                      |
| ----------- | ---------------------------------- |
| **macOS**   | x64 (Intel), arm64 (Apple Silicon) |
| **Linux**   | x64, arm64, ia32                   |
| **Windows** | x64                                |

If other platforms or architectures require support, please open an issue in [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node/issues).

---

## Why sf-decomposer?

Salesforce's built-in decomposition is limited. sf-decomposer gives admins and developers more control, flexibility, and better versioning.

- **Broader metadata support** — works with most Metadata API types, not just the subset Salesforce decomposes.
- **Two [strategies](#decompose-strategies)** — `unique-id` (one file per nested element) or `grouped-by-tag` (one file per tag).
- **Multiple formats** — XML, JSON, JSON5, or YAML.
- **Manifest-scoped runs** — pass `-x package.xml` to scope a run to just the components in a deploy manifest, the same way `sf project deploy start -x` does.
- **CI/CD hooks** — auto-decompose after retrieve and auto-recompose before deploy via [.sfdecomposer.config.json](#hooks).
- **Stable ordering and smaller files** — clearer pull requests, fewer merge conflicts.

---

## Commands

| Command                   | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `sf decomposer decompose` | Decompose metadata in package directories into smaller files.                       |
| `sf decomposer recompose` | Recompose decomposed files back into deployment-ready metadata.                     |
| `sf decomposer verify`    | Round-trip check: decompose + recompose in a temp directory and diff the originals. |

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
  -c, --config                            Load per-type and per-component overrides from .sfdecomposer.config.json in the repo root. Only the "overrides" array is consumed. See Per-Type & Per-Component Overrides. [default: false]

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

### sf decomposer verify

Non-destructive round-trip check: copies your package directories into a temp directory under your OS's `tmpdir()`, runs decompose then recompose there, and diffs the rebuilt parents against the originals using **structural XML equality** (sibling and attribute order are ignored). Exits non-zero on any drift; your working tree is never modified.

```
USAGE
  $ sf decomposer verify [-m <value>] [-x <value>] [-f <value>] [-i <value>] [-s <value>] [-p -c --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to verify (e.g. flow, labels). Repeatable. Optional when --manifest is provided.
  -x, --manifest=<value>                  Path to a package.xml manifest. When provided, only the components listed in the manifest are verified.
  -f, --format=<value>                    Output format used for the round-trip decompose: xml | yaml | json | json5 [default: xml]
  -i, --ignore-package-directory=<value>  Package directory to skip. Repeatable.
  -s, --strategy=<value>                  unique-id | grouped-by-tag [default: unique-id]
  -p, --decompose-nested-permissions      With grouped-by-tag, further decompose permission set and muting permission set object/field permissions.
  -c, --config                            Load per-type and per-component overrides from .sfdecomposer.config.json in the repo root, the same as `decompose --config`. [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to the intersection of the two.

**Examples**

```bash
# Verify two metadata types round-trip cleanly with defaults
sf decomposer verify -m "permissionset" -m "profile"

# Verify a different strategy + nested-perms split before committing the change
sf decomposer verify -m "permissionset" -s "grouped-by-tag" -p

# CI gate: verify just the components in a deploy manifest, using the repo-root config
sf decomposer verify -x "manifest/package.xml" --config
```

Files whose **only** delta is sibling or attribute ordering are reported as informational notices, not drift. Salesforce treats metadata as order-agnostic, so the deploy is safe — the notice just warns that committing the post-recompose output will show a git diff even though the metadata is functionally identical.

---

## Manifest-scoped runs

`-x` / `--manifest` is supported by every `sf decomposer` command and accepts the same `package.xml` you pass to `sf project deploy start -x`. Only the listed components are decomposed/recomposed; everything else is left alone.

- Wildcards (`<members>*</members>`) expand against your local source.
- Folder members (e.g. `MyFolder/MyReport`) resolve by walking the folder.
- Types the plugin does not support (e.g. `CustomObject`, `ApexClass`) are skipped with a warning, so the same manifest can drive both deploys and decomposer runs.
- If both `--metadata-type` and `--manifest` are supplied, the run is scoped to the intersection.

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

> **Tip:** A single decompose run can mix strategies and formats across metadata types — and even across components within the same type — through the `overrides` array (see [Per-Type & Per-Component Overrides](#per-type--per-component-overrides)). Recompose is deterministic from the on-disk sidecar, so any combination round-trips. When switching strategies for an existing component, pass `--prepurge` (or set `prePurge: true`) so leftover files from the previous strategy are removed before the new ones are written.

- **unique-id** (default): Each nested element goes to its own file, named by unique-id fields or content hash. Leaf elements stay in a file named like the original XML.
- **grouped-by-tag**: All elements with the same tag (e.g. `<fieldPermissions>`) go into one file named after the tag (e.g. `fieldPermissions.xml`). Leaf elements are still grouped in the original-named file.

**Permission set – unique-id**

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml             ← leaf properties (label, description, userLicense, ...)
    ├── .key_order.json                             ← preserves original element order
    ├── applicationVisibilities/
    │   └── JobApps__Recruiting.applicationVisibilities-meta.xml
    ├── classAccesses/
    │   └── Send_Email_Confirmation.classAccesses-meta.xml
    ├── fieldPermissions/
    │   ├── Job_Request__c.SalaryPay__c.fieldPermissions-meta.xml
    │   └── Job_Request__c.Salary__c.fieldPermissions-meta.xml
    ├── objectPermissions/
    │   └── Job_Request__c.objectPermissions-meta.xml
    ├── pageAccesses/
    │   └── Job_Request_Web_Form.pageAccesses-meta.xml
    ├── recordTypeVisibilities/
    │   └── Recruiting.DevManager.recordTypeVisibilities-meta.xml
    ├── tabSettings/
    │   └── Job_Request__c.tabSettings-meta.xml
    └── userPermissions/
        └── APIEnabled.userPermissions-meta.xml
```

**Permission set – grouped-by-tag**

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml             ← leaf properties only
    ├── .key_order.json
    ├── applicationVisibilities.xml                 ← all applicationVisibilities entries
    ├── classAccesses.xml                           ← all classAccesses entries
    ├── fieldPermissions.xml                        ← all fieldPermissions entries
    ├── objectPermissions.xml
    ├── pageAccesses.xml
    ├── recordTypeVisibilities.xml
    ├── tabSettings.xml
    └── userPermissions.xml
```

### Filename safety (unique-id)

Two safety nets apply automatically to every shard filename emitted by the **unique-id** strategy. Neither requires configuration:

- **Path-segment sanitization (silent).** Characters illegal or reserved on at least one supported filesystem — path separators (`/`, `\`), Windows-reserved chars (`:`, `*`, `?`, `"`, `<`, `>`, `|`), and ASCII control bytes — are replaced with `_`; trailing `.` and spaces are stripped. Sanitized filenames are byte-stable across platforms.
- **Sibling-collision fallback (emits `WARN`).** When two or more siblings of the same parent tag would resolve to the same filename (the configured unique-id elements are too narrow, or sanitization folded two distinct values together), every sibling in the colliding group is written to its own per-element SHA-256 shard instead. No row is silently overwritten.

If you see a hash-named shard and want to know whether it came from a collision (vs. simply a missing UID), set `RUST_LOG=warn` and rerun — see [Rust crate logging](#xml-disassemble-output-rust-crate).

### Custom Labels Decomposition

Custom labels are always decomposed with `unique-id` (grouped-by-tag would be a no-op since every element shares the same tag). Each label is written to its own file:

```
labels/
├── CustomLabels.labels-meta.xml                    ← original wrapper kept (empty after decompose)
├── quoteAuto.label-meta.xml                        ← one file per <labels> entry, named by fullName
└── quoteManual.label-meta.xml
```

### Additional Permission Set Decomposition

With **grouped-by-tag**, use `--decompose-nested-permissions` (`-p`) to further decompose permission sets and muting permission sets:

- Write each `<objectPermissions>` to its own file under `objectPermissions/`.
- Group `<fieldPermissions>` by object under `fieldPermissions/`.

Similar to Salesforce’s `decomposePermissionSetBeta2`, with more control and format options. Muting permission sets extend the permission set metadata type and support the same decomposition.

```bash
sf decomposer decompose -m "permissionset" -s "grouped-by-tag" -p
sf decomposer decompose -m "mutingpermissionset" -s "grouped-by-tag" -p
```

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml             ← leaf properties
    ├── .key_order.json
    ├── applicationVisibilities.xml                 ← grouped-by-tag stays grouped
    ├── classAccesses.xml
    ├── pageAccesses.xml
    ├── recordTypeVisibilities.xml
    ├── tabSettings.xml
    ├── userPermissions.xml
    ├── fieldPermissions/                           ← grouped per object (decompose-nested-permissions)
    │   └── Job_Request__c.fieldPermissions-meta.xml
    └── objectPermissions/                          ← one file per object
        └── Job_Request__c.objectPermissions-meta.xml
```

### Loyalty Program Setup Decomposition

`loyaltyProgramSetup` is always decomposed with `unique-id`, with a built-in `multiLevel` default that splits `<programProcesses>` into per-process folders containing per-`<parameters>` / per-`<rules>` files.

> Recompose for `loyaltyProgramSetup` always removes the decomposed tree, with or without `--postpurge`. Rely on version control if you need to inspect it after a deploy.

```
loyaltyProgramSetups/
└── Cloud_Kicks_Inner_Circle/
    ├── Cloud_Kicks_Inner_Circle.loyaltyProgramSetup-meta.xml   ← leaf properties (e.g. label)
    ├── .key_order.json
    ├── .multi_level.json                                       ← required for recompose; do not hand-edit
    └── programProcesses/                                       ← one folder per process, named by processName
        ├── Manual Points Adjustments/
        │   ├── Manual Points Adjustments.xml                   ← process leaf properties
        │   ├── .key_order.json
        │   ├── parameters/                                     ← one file per parameter, named by parameterName
        │   │   ├── EA_PerAdjustmentRewardTracking.parameters-meta.xml
        │   │   ├── EventType.parameters-meta.xml
        │   │   └── ...
        │   └── rules/                                          ← one file per rule, named by ruleName
        │       ├── Bulk Voucher Upload.rules-meta.xml
        │       ├── Finalize.rules-meta.xml
        │       └── Set Up Step.rules-meta.xml
        ├── Member Enrollment Process/
        │   └── ...                                             ← same shape per process
        └── ...
```

> **Tip:** This three-level layout (`programProcesses` → `parameters`/`rules`) is exactly the multi-level decomposition pattern. The same pattern powers Bots, Flexipages, and Layouts via opt-in `multiLevel` overrides — see the [admin handbook](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md) for those recipes.

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

The underlying Rust crate logs through [env_logger](https://docs.rs/env_logger). Set `RUST_LOG` to opt into more verbosity:

| Level            | What it covers                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RUST_LOG=error` | Default. Parse errors and skipped files (leaf-only XML — primitives only, nothing to decompose).                                                                                              |
| `RUST_LOG=warn`  | Adds [sibling-collision fallback](#filename-safety-unique-id) signals — one line per colliding group (parent tag, collided id, sibling count). **Recommended in CI** when shipping overrides. |

Example `WARN` (CustomApplication where four `actionOverrides` siblings shared the action name `View`):

```
[2026-05-04T15:21:09Z WARN config_disassembler::xml::builders::build_disassembled_files]
  uniqueIdElements collision: <actionOverrides> id "View" matched 4 sibling elements;
  falling back to SHA-256 content hashes for the colliding group.
  Consider adding more discriminating fields to uniqueIdElements for this metadata type.
```

---

## Hooks

Put **.sfdecomposer.config.json** in the project root to auto-decompose after `sf project retrieve start` and auto-recompose before `sf project deploy start` / `validate`.

> Configure [.forceignore](#forceignore) first — the Salesforce CLI must ignore decomposed files or `sf` commands can fail.

Copy and customize the [sample config](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.json), or the [sample with overrides](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.overrides.json) to vary format/strategy per metadata type or component.

| Option                       | Required    | Description                                                                                                                                                                                                                   |
| ---------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadataSuffixes`           | Conditional | Comma-separated metadata suffixes to decompose/recompose. Required unless `manifest` is set; when both are set, the run is scoped to the intersection.                                                                        |
| `manifest`                   | Conditional | Path (relative to the project root) to a `package.xml` manifest. When set, only the components listed in the manifest are decomposed/recomposed. See `-x` above.                                                              |
| `ignorePackageDirectories`   | No          | Comma-separated package directories to skip.                                                                                                                                                                                  |
| `prePurge`                   | No          | Remove existing decomposed files before decomposing (default: false).                                                                                                                                                         |
| `postPurge`                  | No          | After decompose: remove originals; after recompose: remove decomposed files (default: false).                                                                                                                                 |
| `decomposedFormat`           | No          | xml, json, json5, or yaml (default: xml).                                                                                                                                                                                     |
| `strategy`                   | No          | `unique-id` \| `grouped-by-tag` (default: unique-id).                                                                                                                                                                         |
| `decomposeNestedPermissions` | No          | With grouped-by-tag, set true to further decompose permission set and muting permission set object/field permissions.                                                                                                         |
| `overrides`                  | No          | Array of per-type and/or per-component overrides for `decomposedFormat`, `strategy`, `decomposeNestedPermissions`, `prePurge`, and `postPurge`. See [Per-Type & Per-Component Overrides](#per-type--per-component-overrides). |

---

## Per-Type & Per-Component Overrides

Overrides apply to **decompose only**. Recompose is a deterministic round-trip — it auto-detects format from the on-disk files and does not depend on strategy — so it ignores the `overrides` array.

By default, a single decompose run uses one format and one strategy across every metadata type. The optional `overrides` array in `.sfdecomposer.config.json` lets you vary a small set of options per metadata suffix (**type-scope**) or per individual SDR component (**component-scope**) without splitting the run into multiple invocations.

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
    },
    {
      "components": ["permissionset:HR_Admin", "permissionset:Big_PermSet"],
      "strategy": "grouped-by-tag",
      "decomposeNestedPermissions": true
    }
  ]
}
```

### What can be overridden

| Field                        | Notes                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metadataTypes`              | Optional (required if `components` is omitted). Array of metadata suffixes (same vocabulary as `--metadata-type` / `metadataSuffixes`). Each suffix may appear in at most one override.                                                                      |
| `components`                 | Optional (required if `metadataTypes` is omitted). Array of `<metadataSuffix>:<fullName>` keys (e.g. `permissionset:HR_Admin`, `report:MyFolder/MyReport`). Each component may appear in at most one override.                                               |
| `decomposedFormat`           | `xml` \| `json` \| `json5` \| `yaml`.                                                                                                                                                                                                                        |
| `strategy`                   | `unique-id` \| `grouped-by-tag`. Hard rules still win — `labels` and `loyaltyProgramSetup` are always treated as `unique-id`.                                                                                                                                |
| `decomposeNestedPermissions` | Only applies to `permissionset` / `mutingpermissionset` with `grouped-by-tag`. Sets a known-good `splitTags` default; ignored if `splitTags` is also set in the same scope.                                                                                  |
| `splitTags`                  | Custom `splitTags` spec for `grouped-by-tag` strategy. See [splitTags grammar](#splittags-grammar). Ignored when the resolved strategy is not `grouped-by-tag`.                                                                                              |
| `multiLevel`                 | One or more `multiLevel` specs for nested-array decomposition. Pass a string, a `string[]`, or a `;`-separated string. See [multiLevel grammar](#multilevel-grammar). When set, replaces the hardcoded `loyaltyProgramSetup` default for the targeted scope. |
| `prePurge`                   | Per-scope prePurge (decompose). Component-scope `prePurge` only purges the named component's decomposed directory.                                                                                                                                           |
| `postPurge`                  | Per-scope postPurge (decompose: remove originals after decomposing).                                                                                                                                                                                         |

Run-scope options (`metadataSuffixes`, `manifest`, `ignorePackageDirectories`) are **not** valid inside an override; the plugin will throw if they are present.

#### Component key conventions

The `<fullName>` part of a component key is the SDR fullName for the component, matching the basename of the decomposed directory:

- **Plain types** (e.g. `permissionset`, `flow`, `profile`, `workflow`): use the file stem, e.g. `permissionset:HR_Admin` for `permissionsets/HR_Admin.permissionset-meta.xml`.
- **Strict-directory types** (e.g. `bot`): use the bot directory name, e.g. `bot:My_Bot` for `bots/My_Bot/My_Bot.bot-meta.xml`.
- **Folder-typed metadata** (e.g. `report`, `dashboard`, `email`, `document`): the unit of decomposition is the folder; use the folder name, e.g. `report:MyFolder` to scope every report inside `reports/MyFolder/`.
- **`labels`**: there is exactly one labels file per labels directory, so component-scope keys are not meaningful — use the type-scope `metadataTypes: ["labels"]` instead.

Component overrides are not a filter. If `--metadata` / `metadataSuffixes` includes `permissionset`, every permission set is still decomposed; the override only changes how the named ones are decomposed. Use `--manifest` / the hook's `manifest` field if you want to scope the run itself to a subset of components.

### Precedence

For each component, each option is resolved independently in this order (highest first):

1. The component-scope override value (matching `<suffix>:<fullName>` in `components`), if set.
2. The type-scope override value (matching `<suffix>` in `metadataTypes`), if set.
3. The run-wide value (CLI flag, hook config top-level field, or built-in default).
4. Hard plugin rules (e.g. `labels` and `loyaltyProgramSetup` forced to `unique-id`) override all of the above.

### splitTags grammar

`splitTags` lets you control how `grouped-by-tag` writes nested arrays for any metadata type. The plugin already applies a known-good default for permission sets when `decomposeNestedPermissions: true` is set; setting `splitTags` directly takes precedence and works for any metadata type.

**Spec:** Comma-separated rules. Each rule has 3 or 4 colon-separated parts:

- `<tag>:<mode>:<field>` — read array items from the top-level `<tag>`.
- `<tag>:<path>:<mode>:<field>` — read array items from the nested `<path>` (defaults to `<tag>`).

`<mode>` is one of:

- **`split`** — write one file per array item, named after the value of `<field>` on each item.
- **`group`** — group array items by the value of `<field>`, writing one file per group.

Each `<tag>` may appear at most once in a spec. The plugin validates the grammar at config-load time. Deeper checks (e.g. unknown tag names for the metadata type) are surfaced by the underlying disassembler crate at runtime.

**Examples:**

```json
"overrides": [
  {
    "metadataTypes": ["permissionset", "mutingpermissionset"],
    "strategy": "grouped-by-tag",
    "splitTags": "objectPermissions:split:object,fieldPermissions:group:field"
  },
  {
    "metadataTypes": ["profile"],
    "strategy": "grouped-by-tag",
    "splitTags": "objectPermissions:split:object,fieldPermissions:group:field,layoutAssignments:group:layout"
  }
]
```

> **Caveat:** With `mode: split`, the chosen `<field>` must produce a unique value across every array item — otherwise two items map to the same filename. If items can share a field value, use `mode: group` instead.

See the [admin handbook](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md) for additional `splitTags` and `multiLevel` recipes (flows, workflows, layouts, flexipages, bots).

### multiLevel grammar

`multiLevel` enables a second decomposition pass on inner-level files for metadata types whose XML has deeply nested repeatable blocks (e.g. `loyaltyProgramSetup`'s `programProcesses → parameters → ...`, or a Bot's `botVersion → botDialogs → botSteps`). The plugin already applies a known-good default for `loyaltyProgramSetup` when running the `unique-id` strategy; setting `multiLevel` directly takes precedence and works for any metadata type.

**Spec:** Each rule has exactly 3 colon-separated parts (the third part is itself a comma-separated list):

```
<file_pattern>:<root_to_strip>:<unique_id_elements>
```

- **`<file_pattern>`** — basename pattern that selects which inner-level files get the second decomposition pass (e.g. `programProcesses`).
- **`<root_to_strip>`** — XML root tag to strip from each matched file before splitting.
- **`<unique_id_elements>`** — comma-separated list of element names used to derive a stable filename for each inner-level item (e.g. `parameterName,ruleName`). The first element that resolves to a non-empty value wins.

A scope may target several nested sections by passing **multiple rules**. Three input shapes are supported:

- a single rule string (legacy, unchanged behaviour);
- a JSON `string[]` of rules (preferred — clearest intent, easiest to diff);
- a single `;`-separated string of rules (compact form, also accepted).

Within one scope, the `(file_pattern, root_to_strip)` pair must be unique across rules. The plugin validates the grammar at config-load time; deeper checks (whether a file pattern matches anything, whether the unique-id elements actually appear on the inner XML) are surfaced by the underlying disassembler crate at runtime.

```json
"overrides": [
  {
    "metadataTypes": ["dashboard"],
    "multiLevel": "components:components:title"
  },
  {
    "metadataTypes": ["layout"],
    "multiLevel": [
      "layoutSections:layoutSections:label",
      "layoutItems:layoutItems:field,customLink,emptySpace"
    ]
  }
]
```

> **Built-in defaults.** `bot` and `loyaltyProgramSetup` ship with built-in `multiLevel` rules, so you do not need an override to get the canonical layout — supply your own only to replace the default. Full registry: [`src/metadata/multiLevelDefaults.ts`](https://github.com/mcarvin8/sf-decomposer/blob/main/src/metadata/multiLevelDefaults.ts).
>
> **Pass all rules at once.** Sequential single-rule decomposes rewrite `.multi_level.json` and only the last rule survives — bundle every rule for a given component into one override. Use [`sf decomposer verify`](#sf-decomposer-verify) to confirm a new config round-trips before committing it.

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

- [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node) – Disassemble XML (and other config formats) into smaller, manageable files and reassemble when needed. Node.js + Rust (Neon). See [Requirements](#requirements).
- [@salesforce/source-deploy-retrieve](https://github.com/forcedotcom/source-deploy-retrieve) – JavaScript toolkit for working with Salesforce metadata.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

## License

[MIT](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
