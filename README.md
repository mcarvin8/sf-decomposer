# sf-decomposer

[![NPM](https://img.shields.io/npm/v/sf-decomposer.svg?label=sf-decomposer)](https://www.npmjs.com/package/sf-decomposer)
[![Downloads/week](https://img.shields.io/npm/dw/sf-decomposer.svg)](https://npmjs.org/package/sf-decomposer)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/LICENSE.md)
[![Maintainability](https://qlty.sh/badges/8492c1c6-0f93-4d37-bfad-32fd3b788a2d/maintainability.svg)](https://qlty.sh/gh/mcarvin8/projects/sf-decomposer)
[![codecov](https://codecov.io/gh/mcarvin8/sf-decomposer/graph/badge.svg?token=YFU52L4XM5)](https://codecov.io/gh/mcarvin8/sf-decomposer)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fmcarvin8%2Fsf-decomposer%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/mcarvin8/sf-decomposer/main)
[![Performance](https://img.shields.io/badge/Performance-Dashboard-58a6ff)](https://mcarvin8.github.io/sf-decomposer/dev/bench/runtime/)

A Salesforce CLI plugin that **decomposes** large metadata XML files into smaller, version-control–friendly files (XML, JSON, YAML, JSON5), and **recomposes** them back into deployment-ready metadata.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Setup](#setup)
  - [1. Requirements](#1-requirements)
  - [2. Install the Plugin](#2-install-the-plugin)
  - [3. Configure .forceignore](#3-configure-forceignore)
  - [4. Configure Hooks](#4-configure-hooks-recommended)
- [Daily Workflow](#daily-workflow)
- [Reference](#reference)
  - [Commands](#commands)
  - [Decompose Strategies](#decompose-strategies)
  - [Supported Metadata](#supported-metadata)
  - [Manifest-scoped Runs](#manifest-scoped-runs)
  - [Per-Type & Per-Component Overrides](CONFIGURATION.md)
  - [Ignore Files](#ignore-files)
  - [Using with sfdx-git-delta](#using-with-sfdx-git-delta)
  - [Troubleshooting](#troubleshooting)
  - [Built With](#built-with)
- [Migrating from Salesforce Native Decomposition](#migrating-from-salesforce-native-decomposition)
- [Contributing](#contributing)
- [License](#license)

</details>

---

## Setup

Complete these steps once per project. After setup, see [Daily Workflow](#daily-workflow).

### 1. Requirements

- [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) (`sf`) installed
- Node.js 22.x or later
- A Salesforce DX project with `sfdx-project.json` and package directories

**Supported Platforms**

sf-decomposer depends on [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node), which ships prebuilt native binaries as platform-specific optional npm packages — your package manager installs only the one matching your `os` / `cpu` / `libc`:

| Platform    | Architectures                        |
|-------------|--------------------------------------|
| **macOS**   | x64 (Intel), arm64 (Apple Silicon)   |
| **Linux**   | x64 (gnu + musl), arm64 (gnu + musl) |
| **Windows** | x64, arm64, ia32                     |

If your platform or architecture is not listed, open an [issue](https://github.com/mcarvin8/sf-decomposer/issues).

### 2. Install the Plugin

```bash
sf plugins install sf-decomposer@x.y.z
```

### 3. Configure .forceignore

**Required.** The Salesforce CLI must ignore decomposed files or `sf` commands will fail. Configure this before running any decompose or retrieve commands.

**Option A — Automatic (recommended):** Pass `--update-forceignore` on your first `sf decomposer decompose` run. The plugin appends type-level wildcard patterns to `.forceignore` — one ignore pattern for decomposed pieces and one negation to re-allow the original metadata file — creating the file if it doesn't exist. Subsequent runs only add new entries; existing ones are never duplicated.

```bash
sf decomposer decompose -m "flow" -m "permissionset" --postpurge --update-forceignore
```

**Option B — Manual:** Copy the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) into your project root and adjust the extension patterns for your chosen format (`.xml`, `.json`, `.yaml`, etc.).

### 4. Configure Hooks (Recommended)

Hooks auto-decompose after `sf project retrieve start` and auto-recompose before `sf project deploy start` / `validate` — eliminating manual steps entirely.

Add `.sfdecomposer.config.json` to your project root. Copy and customize one of the sample configs:

- [Basic sample](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.json) — one format and strategy for all types
- [Sample with overrides](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.overrides.json) — vary format/strategy per metadata type or component

| Option                       | Required    | Description                                                                                                                                                                                                                 |
|------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `metadataSuffixes`           | Conditional | Comma-separated metadata suffixes to decompose/recompose. Required unless `manifest` is set; when both are set, run is scoped to the intersection.                                                                          |
| `manifest`                   | Conditional | Path (relative to project root) to a `package.xml` manifest. When set, only listed components are decomposed/recomposed.                                                                                                    |
| `ignorePackageDirectories`   | No          | Comma-separated package directories to skip.                                                                                                                                                                                |
| `prePurge`                   | No          | Remove existing decomposed files before decomposing (default: false).                                                                                                                                                       |
| `postPurge`                  | No          | After decompose: remove originals; after recompose: remove decomposed files (default: false).                                                                                                                               |
| `decomposedFormat`           | No          | `xml`, `json`, `json5`, or `yaml` (default: xml).                                                                                                                                                                           |
| `strategy`                   | No          | `unique-id` \| `grouped-by-tag` (default: unique-id).                                                                                                                                                                       |
| `decomposeNestedPermissions` | No          | With `grouped-by-tag`, set `true` to further decompose permission set and muting permission set object/field permissions.                                                                                                   |
| `updateForceignore`          | No          | Set `true` to automatically add decomposed file paths to `.forceignore` after each hook-triggered decomposition (default: false).                                                                                           |
| `updateGitattributes`        | No          | Set `true` to automatically add root metadata file patterns to `.gitattributes` after each hook-triggered decomposition (default: false).                                                                                   |
| `skipPrerunHook`             | No          | Set `true` to skip the automatic recompose that fires before `sf project deploy start/validate` (default: false). Useful when you recompose manually in a pre-commit hook and don't want a second recompose at deploy time. |
| `skipPostRetrieveHook`       | No          | Set `true` to skip the automatic decompose that fires after `sf project retrieve start` (default: false).                                                                                                                   |
| `overrides`                  | No          | Array of per-type and/or per-component overrides. See [CONFIGURATION.md](CONFIGURATION.md).                                                                                                                                 |

---

## Daily Workflow

**With hooks configured** (recommended):

```
retrieve → auto-decomposes → review & commit → deploy → auto-recomposes
```

```bash
sf project retrieve start          # hooks decompose automatically
git add . && git commit -m "..."   # commit decomposed files
sf project deploy start            # hooks recompose automatically
```

**Without hooks** (manual):

```bash
# After retrieve: decompose
sf decomposer decompose -m "flow" -m "labels" --postpurge

# Before deploy: recompose, then deploy
sf decomposer recompose -m "flow" -m "labels"
sf project deploy start
```

Pass `-x manifest/package.xml` to both `decompose` and `recompose` (and `deploy`) to scope a run to just the components in a deploy manifest.

---

## Reference

### Commands

| Command                   | Description                                                                         |
|---------------------------|-------------------------------------------------------------------------------------|
| `sf decomposer decompose` | Decompose metadata in package directories into smaller files.                       |
| `sf decomposer recompose` | Recompose decomposed files back into deployment-ready metadata.                     |
| `sf decomposer verify`    | Round-trip check: decompose + recompose in a temp directory and diff the originals. |

#### sf decomposer decompose

Decomposes metadata in all local package directories (from `sfdx-project.json`) into smaller files.

```
USAGE
  $ sf decomposer decompose [-m <value>] [-x <value>] [-f <value>] [-i <value>] [-s <value>] [--prepurge --postpurge -p -c --update-forceignore --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable. Optional when --manifest is provided.
  -x, --manifest=<value>                  Path to a package.xml manifest. When provided, only the components listed in the manifest are decomposed.
  -f, --format=<value>                    Output format: xml | yaml | json | json5 [default: xml]
  -i, --ignore-package-directory=<value>  Package directory to skip (as in sfdx-project.json). Repeatable.
  -s, --strategy=<value>                  unique-id | grouped-by-tag [default: unique-id]
  --prepurge                              Remove existing decomposed files before decomposing [default: false]
  --postpurge                             Remove original metadata files after decomposing [default: false]
  -p, --decompose-nested-permissions      With grouped-by-tag, further decompose permission set and muting permission set object/field permissions
  -c, --config                            Load all settings from .sfdecomposer.config.json in the repo root. Supplies metadataSuffixes, manifest, and all run-wide options; CLI flags take precedence. Makes -m and -x optional when the config defines them. [default: false]
  --update-forceignore                    Automatically add decomposed file paths to .forceignore after successful decomposition [default: false]
  --update-gitattributes                  Automatically add root metadata file patterns to .gitattributes after successful decomposition [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type`, `--manifest`, or `--config` (with `metadataSuffixes` or `manifest` in the config) is required.

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

# Use config file for all options (no CLI flags needed)
sf decomposer decompose --config
```

#### sf decomposer recompose

Recomposes decomposed files into deployment-compatible metadata.

```
USAGE
  $ sf decomposer recompose [-m <value>] [-x <value>] [-i <value>] [-c --postpurge --json]

FLAGS
  -m, --metadata-type=<value>             Metadata suffix to process (e.g. flow, labels). Repeatable. Optional when --manifest or --config is provided.
  -x, --manifest=<value>                  Path to a package.xml manifest. When provided, only the components listed in the manifest are recomposed.
  -i, --ignore-package-directory=<value>  Package directory to skip. Repeatable.
  --postpurge                             Remove decomposed files after recomposing [default: false]
  -c, --config                            Load all settings from .sfdecomposer.config.json in the repo root. Supplies metadataSuffixes, manifest, and postPurge; CLI flags take precedence. Makes -m and -x optional when the config defines them. [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type`, `--manifest`, or `--config` (with `metadataSuffixes` or `manifest` in the config) is required.

**Examples**

```bash
sf decomposer recompose -m "flow" --postpurge
sf decomposer recompose -m "flow" -i "force-app"

# Recompose only the components listed in a deploy manifest before deploying
sf decomposer recompose -x "manifest/package.xml"
sf project deploy start -x "manifest/package.xml"

# Use config file for all options (no CLI flags needed)
sf decomposer recompose --config
```

#### sf decomposer verify

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
  -c, --config                            Load all settings from .sfdecomposer.config.json in the repo root. Supplies metadataSuffixes, manifest, and all run-wide options; CLI flags take precedence. Makes -m and -x optional when the config defines them. [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type`, `--manifest`, or `--config` (with `metadataSuffixes` or `manifest` in the config) is required.

**Examples**

```bash
# Verify two metadata types round-trip cleanly with defaults
sf decomposer verify -m "permissionset" -m "profile"

# Verify a different strategy + nested-perms split before committing the change
sf decomposer verify -m "permissionset" -s "grouped-by-tag" -p

# CI gate: verify just the components in a deploy manifest, using the repo-root config
sf decomposer verify -x "manifest/package.xml" --config
```

Files whose **only** delta is sibling or attribute ordering are reported as informational notices, not drift. Salesforce treats metadata as order-agnostic, so the deploy is safe — the notice warns that committing the post-recompose output will show a git diff even though the metadata is functionally identical.

---

### Decompose Strategies

Two primary strategies control how nested XML elements are split on disk. Both round-trip deterministically and can be mixed across types — or even across components of the same type — via the `overrides` array (see [CONFIGURATION.md](CONFIGURATION.md)). When switching strategies for an existing component, pass `--prepurge` (or `prePurge: true`) to remove leftover files from the prior strategy before writing new ones.

#### unique-id (default)

Each nested element gets its own file, named by one or more unique-id fields (or a content hash when no UID is found). Leaf elements stay in a file named like the original XML.

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

**Filename safety.** Two safety nets apply automatically. Neither requires configuration:

- **Path-segment sanitization (silent).** Characters illegal or reserved on at least one supported filesystem — path separators (`/`, `\`), Windows-reserved chars (`:`, `*`, `?`, `"`, `<`, `>`, `|`), and ASCII control bytes — are replaced with `_`; trailing `.` and spaces are stripped. Sanitized filenames are byte-stable across platforms.
- **Sibling-collision fallback (emits `WARN`).** When two or more siblings of the same parent tag would resolve to the same filename (the configured unique-id elements are too narrow, or sanitization folded two distinct values together), every sibling in the colliding group is written to its own per-element SHA-256 shard instead. No row is silently overwritten.

If you see a hash-named shard and want to know whether it came from a collision (vs. a missing UID), set `RUST_LOG=warn` and rerun — see [Rust crate logging](#xml-disassemble-output-rust-crate).

**Extending with multiLevel.** When a metadata type has deeply-nested repeatable blocks (a block inside a block), add a `multiLevel` override to decompose those inner arrays into their own subdirectories. `bot` and `loyaltyProgramSetup` ship with built-in `multiLevel` defaults applied automatically. See the [admin handbook](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md) for ready-to-paste recipes for Bots, Flexipages, Layouts, Flows, and more.

**Type-specific notes (unique-id):**

- **Custom Labels (`labels`)** — always forced to `unique-id` (grouped-by-tag would be a no-op since every element shares the same tag). Each label becomes its own file:

  ```
  labels/
  ├── CustomLabels.labels-meta.xml                    ← original file (safe to delete after decompose)
  ├── quoteAuto.label-meta.xml                        ← one file per <labels> entry, named by fullName
  └── quoteManual.label-meta.xml
  ```

- **Bot (`bot`)** — built-in `multiLevel` default applies two rules automatically: `botDialogs` (outer, keyed by `developerName`) and `botSteps` (inner, keyed by `type`). No config needed to get the canonical layout; override only to change it. See the [admin handbook](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md) for the full layout, step-shape notes, and single-rule variant.

  ```
  bots/
  └── Sample_Chat_Bot/
      ├── Sample_Chat_Bot.bot-meta.xml                 ← bot header (untouched)
      ├── v1/
      │   ├── nlpProviders/
      │   │   └── EinsteinAi.nlpProviders-meta.xml
      │   ├── botDialogs/                              ← outer rule: one directory per dialog
      │   │   ├── Welcome/
      │   │   │   ├── Welcome.xml                      ← dialog leaf properties
      │   │   │   └── botSteps/                        ← inner rule: one entry per step
      │   │   │       ├── 853b6432/                    ← step with nested content → subdir
      │   │   │       │   └── ...
      │   │   │       └── 9d031e75.botSteps-meta.xml   ← step with no nested content → leaf file
      │   │   └── ...
      │   ├── .multi_level.json                        ← required for recompose; do not hand-edit
      │   └── v1.botVersion-meta.xml
      └── ...
  ```

- **Loyalty Program Setup (`loyaltyProgramSetup`)** — always forced to `unique-id` with a built-in `multiLevel` default that splits `<programProcesses>` into per-process folders containing per-`<parameters>` / per-`<rules>` files. Recompose always removes the decomposed tree (with or without `--postpurge`); rely on version control to inspect it after a deploy.

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

- **External Service Registration (`externalServiceRegistration`)** — the `<schema>` field (an embedded OpenAPI/JSON blob) is always extracted to a sidecar YAML file regardless of `--format`. The `<operations>` array is decomposed via `unique-id`, each entry named by its `<name>` element. Leaf properties remain in the main XML file.

  ```
  externalServiceRegistrations/
  ├── DropboxFileManagerHandler.externalServiceRegistration-meta.xml   ← original file (safe to delete after decompose)
  └── DropboxFileManagerHandler/
      ├── DropboxFileManagerHandler.externalServiceRegistration-meta.xml  ← leaf properties (<schema> and <operations> stripped)
      ├── DropboxFileManagerHandler.yaml                                   ← sidecar: <schema> content as YAML (always YAML)
      └── operations/                                                      ← one file per <operations> entry, named by <name>
          └── uploadFile.operations-meta.xml
  ```

#### grouped-by-tag

All elements with the same tag (e.g. `<fieldPermissions>`) go into one file named after the tag (e.g. `fieldPermissions.xml`). Leaf elements are still grouped in the original-named file. Best for types with many small repeatable tags where one-file-per-element diffs would be noisy.

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

**Extending with splitTags.** A `splitTags` override lets specific tags within a `grouped-by-tag` run break out into per-element files (split mode) or sub-grouped files (group mode), while all other tags stay grouped. See [splitTags grammar](CONFIGURATION.md#splittags-grammar).

**Extending with decomposeNestedPermissions.** For `permissionset` and `mutingpermissionset`, add `--decompose-nested-permissions` (`-p`) to further decompose `<objectPermissions>` into per-object files and group `<fieldPermissions>` by object — similar to Salesforce's `decomposePermissionSetBeta2` but with more format and strategy options.

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

---

### Supported Metadata

All parent and child metadata types from this plugin's version of **@salesforce/source-deploy-retrieve** (SDR) are supported, except where noted below. Child types (e.g. `field`, `listView`, `validationRule`) resolve via their parent in the SDR registry and behave like any other type — most are leaf-only and will be skipped non-fatally if their files contain no nested repeatable elements (the Rust disassembler logs a skip at `RUST_LOG=error`, but the CLI does not fail).

Use the metadata **suffix** for `-m` / `--metadata-type`, as in [SDR's metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json), or infer from the file name: `*.{suffix}-meta.xml`.

| Metadata Type                 | CLI value                     | Notes                                                                                                                                                                                                                                                                                                                 |
|-------------------------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Custom Labels                 | `labels`                      | Strategy overridden to `unique-id` if `grouped-by-tag` is provided (grouping labels by tag would be no different from the original file).                                                                                                                                                                             |
| Workflows                     | `workflow`                    |                                                                                                                                                                                                                                                                                                                       |
| Profiles                      | `profile`                     |                                                                                                                                                                                                                                                                                                                       |
| Permission Sets               | `permissionset`               | Supports `--decompose-nested-permissions` with grouped-by-tag.                                                                                                                                                                                                                                                        |
| Muting Permission Sets        | `mutingpermissionset`         | Extends permission set metadata type. Supports `--decompose-nested-permissions` with grouped-by-tag.                                                                                                                                                                                                                  |
| AI Scoring Model Definition   | `aiScoringModelDefinition`    |                                                                                                                                                                                                                                                                                                                       |
| Decision Matrix Definition    | `decisionMatrixDefinition`    |                                                                                                                                                                                                                                                                                                                       |
| Bot                           | `bot`                         | Built-in `multiLevel` default splits `botDialogs` (by `developerName`) and `botSteps` (by `type`) automatically. No config required; override only to change the layout. See [Decompose Strategies](#decompose-strategies) and the [admin handbook](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md). |
| Marketing App Extension       | `marketingappextension`       |                                                                                                                                                                                                                                                                                                                       |
| Loyalty Program Setup         | `loyaltyProgramSetup`         | Always forced to `unique-id`; `grouped-by-tag` is overridden. Built-in `multiLevel` splits `<programProcesses>` into per-process folders automatically. Recompose always removes the decomposed tree. See [Decompose Strategies](#decompose-strategies).                                                              |
| External Service Registration | `externalServiceRegistration` | The `<schema>` field is always extracted to a sidecar YAML file (format forced to YAML regardless of `--format`). The `<operations>` array follows normal `unique-id` decomposition, named by `<name>`. See [Decompose Strategies](#decompose-strategies).                                                            |

For a comprehensive breakdown of supported, leaf-only, and unsupported metadata types — including multi-level decomposition patterns, Salesforce native decomposition conflicts, and adapter strategy limitations — see [**METADATA_SUPPORT.md**](./METADATA_SUPPORT.md).

#### Exceptions

| Situation                                                                                      | Message                                                                                                                           |
|------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `botVersion` used directly                                                                     | Automatically redirected to `bot` with a warning. No error is thrown.                                                             |
| Custom Objects                                                                                 | `Custom Objects are not supported by this plugin.`                                                                                |
| Unsupported SDR strategies (e.g. matchingContentFile, digitalExperience, mixedContent, bundle) | `Metadata types with [matchingContentFile, digitalExperience, mixedContent, bundle] strategies are not supported by this plugin.` |
| Invalid or unknown suffix                                                                      | `Metadata type not found for the given suffix: [suffix].`                                                                         |

---

### Manifest-scoped Runs

`-x` / `--manifest` is supported by every `sf decomposer` command and accepts the same `package.xml` you pass to `sf project deploy start -x`. Only the listed components are decomposed/recomposed; everything else is left alone.

- Wildcards (`<members>*</members>`) expand against your local source.
- Folder members (e.g. `MyFolder/MyReport`) resolve by walking the folder.
- Types the plugin does not support (e.g. `CustomObject`, `ApexClass`) are skipped with a warning, so the same manifest can drive both deploys and decomposer runs.
- If both `--metadata-type` and `--manifest` are supplied, the run is scoped to their intersection.

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

### Per-Type & Per-Component Overrides

The optional `overrides` array in `.sfdecomposer.config.json` lets you vary format, strategy, and decomposition options per metadata suffix or per individual component without splitting the run into multiple invocations.

See [CONFIGURATION.md](CONFIGURATION.md) for the full reference: override fields, component key conventions, precedence rules, and grammar for `splitTags`, `multiLevel`, and `uniqueIdElements`.

---

### Ignore Files

#### .forceignore

The Salesforce CLI must **ignore** decomposed files and **allow** recomposed files. Use `--update-forceignore` on your first `sf decomposer decompose` run to populate this file automatically, or copy the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) and set patterns for the extensions you use (`.xml`, `.json`, `.yaml`, etc.).

> **Note:** For each processed type, `--update-forceignore` adds a pattern like `**/flows/**/*.xml` (ignore all decomposed pieces) plus `!**/flows/*.flow-meta.xml` (re-allow the original file). Labels use a flat pattern (`**/labels/*.xml` + `!**/labels/CustomLabels.labels-meta.xml`) since they decompose directly into the type directory. Bots use a component-dir pattern (`**/bots/**/*.xml` + `!**/bots/*/*.bot-meta.xml` + `!**/bots/*/*.botVersion-meta.xml`) to handle nested decomposed files and both original suffixes.

#### .sfdecomposerignore

Optional. In the project root, list paths/patterns to skip when **decomposing** (same syntax as [.gitignore 2.22.1](https://git-scm.com/docs/gitignore)). Ignored files are not recomposed from.

#### .gitignore

Optional. Ignore recomposed metadata so it isn't committed. See the [sample .gitignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.gitignore).

---

### Using with sfdx-git-delta

[sfdx-git-delta](https://github.com/scolladon/sfdx-git-delta) (sgd) detects changed metadata by comparing git refs. It finds changes by looking for root-level metadata files — e.g. `flows/MyFlow.flow-meta.xml` — matching patterns from the Salesforce metadata registry.

sf-decomposer is compatible with sgd as long as those root files are present in git at the point sgd runs.

#### Recommended: keep root files in git and recompose before commit

For `sfdx-git-delta` to detect a change, the root metadata file must be updated in git. Keeping root files in the repository is not enough by itself: if you edit decomposed files but commit without recomposing, the root file will remain unchanged, and sgd may not detect the metadata change.

Use one of these workflows:

- Configure a pre-commit hook that runs `sf decomposer recompose --config` before `git commit` (see `examples/pre-commit`)
- Manually run `sf decomposer recompose --config` (or with explicit `-m` flags) before committing

Without `--postpurge`, the original root metadata file stays in the repo alongside the decomposed pieces. After recomposition, the root file is updated and sgd detects the change normally. No extra sgd configuration is needed.

**Suppressing diff noise on root files.** Keeping root files in git means `git diff` and GitHub PR views show both the root file and the decomposed pieces. Pass `--update-gitattributes` on your first `sf decomposer decompose` run to suppress that noise automatically:

```bash
sf decomposer decompose -m "flow" -m "permissionset" --update-gitattributes
```

This appends patterns like the following to `.gitattributes`, creating the file if it doesn't exist:

```gitattributes
**/flows/*.flow-meta.xml -diff linguist-generated=true
**/permissionsets/*.permissionset-meta.xml -diff linguist-generated=true
```

- `-diff` — `git diff` / `git show` skip textual content for these files
- `linguist-generated=true` — GitHub collapses the file in PR diff views; the file is still expandable

Git still tracks the root files, so sgd works. The root files become invisible noise during code review. You can also set `updateGitattributes: true` in `.sfdecomposer.config.json` to apply this automatically after every hook-triggered decomposition.

#### If you use `--postpurge`

`--postpurge` removes the root metadata file after decomposing. Only the decomposed pieces remain in git. sgd cannot detect changes to these nested files — they do not match the registry's file patterns.

**For CI pipelines**, explicitly recompose into a temporary commit before running sgd, then continue without pushing the commit (CI runners are ephemeral):

```bash
sf decomposer recompose -m "flow" -m "permissionset"
git add -A && git commit -m "ci: recompose for sgd" --no-verify

sf sgd source delta --from "$PREV_DEPLOYMENT_SHA" --to HEAD --output ./delta
sf project deploy start --source-dir ./delta
# temporary commit is discarded when the runner tears down
```

#### Incompatibility: `--postpurge` + sgd + prerun hook

The sf-decomposer prerun hook recomposes automatically when `sf project deploy start` fires — but that happens **after** sgd has already produced its delta. sgd runs on the committed (decomposed-only) state and cannot identify the changed components.

If you use the prerun hook, do not combine it with `--postpurge` and sgd. The compatible combinations are:

| Setup                                                             | Works?                                                                         |
|-------------------------------------------------------------------|--------------------------------------------------------------------------------|
| No `--postpurge` + sgd + hook                                     | ✅ Root files in git; hook recompose at deploy is harmless (redundant but safe) |
| No `--postpurge` + sgd + pre-commit hook + `skipPrerunHook: true` | ✅ Recomposed before commit; deploy hook skipped intentionally                  |
| No `--postpurge` + sgd, no hook                                   | ✅ Recompose manually before commit                                             |
| `--postpurge` + hook, no sgd                                      | ✅ Full deploy; hook recomposes at deploy time                                  |
| `--postpurge` + sgd + CI recompose commit, no hook                | ✅ Explicit recompose step before sgd                                           |
| `--postpurge` + sgd + hook                                        | ❌ sgd runs before hook; delta is wrong                                         |

---

### Troubleshooting

#### Missing sfdx-project.json

The plugin looks for `sfdx-project.json` from the current directory up to the drive root. If it's not found:

```
Error (1): sfdx-project.json not found in any parent directory.
```

#### Package Directories Not Found for Given Metadata Type

This plugin relies on the @salesforce/source-deploy-retrieve metadata registry to map each metadata type to its expected directory name.

If you provide a metadata type whose corresponding directory does not exist in any of your package directories, the plugin will fail with:

```
No directories named ${metadataTypeEntry.directoryName} were found in any package directory.
```

For example, if you attempt to decompose Custom Labels but none of your package directories contain a "labels" folder, the plugin will throw this error.

#### XML disassemble output (Rust crate)

The underlying Rust crate logs through [env_logger](https://docs.rs/env_logger). Set `RUST_LOG` to opt into more verbosity:

| Level            | What it covers                                                                                                                                                                                |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
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

### Built With

- [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node) – Disassemble XML (and other config formats) into smaller, manageable files and reassemble when needed. Node.js + Rust (NAPI-RS).
- [@salesforce/source-deploy-retrieve](https://github.com/forcedotcom/source-deploy-retrieve) – JavaScript toolkit for working with Salesforce metadata.

---

## Migrating from Salesforce Native Decomposition

Already using `decomposePermissionSetBeta2`, `decomposeCustomLabelsBeta`, or similar flags? See [MIGRATION.md](https://github.com/mcarvin8/sf-decomposer/blob/main/MIGRATION.md) before installing sf-decomposer on that project.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/mcarvin8/sf-decomposer/blob/main/CONTRIBUTING.md).

---

## Issues

Please open an [issue](https://github.com/mcarvin8/sf-decomposer/issues) to report any bugs or suggest new features.

---

## License

[MIT](LICENSE.md)
