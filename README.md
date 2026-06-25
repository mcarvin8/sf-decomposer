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
  - [Per-Type & Per-Component Overrides](#per-type--per-component-overrides)
  - [Ignore Files](#ignore-files)
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
- Node.js 20.x or later
- A Salesforce DX project with `sfdx-project.json` and package directories

**Supported Platforms**

sf-decomposer depends on [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node), which ships prebuilt native binaries as platform-specific optional npm packages — your package manager installs only the one matching your `os` / `cpu` / `libc`:

| Platform    | Architectures                        |
| ----------- | ------------------------------------ |
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

| Option                       | Required    | Description                                                                                                                                        |
| ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadataSuffixes`           | Conditional | Comma-separated metadata suffixes to decompose/recompose. Required unless `manifest` is set; when both are set, run is scoped to the intersection. |
| `manifest`                   | Conditional | Path (relative to project root) to a `package.xml` manifest. When set, only listed components are decomposed/recomposed.                           |
| `ignorePackageDirectories`   | No          | Comma-separated package directories to skip.                                                                                                       |
| `prePurge`                   | No          | Remove existing decomposed files before decomposing (default: false).                                                                              |
| `postPurge`                  | No          | After decompose: remove originals; after recompose: remove decomposed files (default: false).                                                      |
| `decomposedFormat`           | No          | `xml`, `json`, `json5`, or `yaml` (default: xml).                                                                                                  |
| `strategy`                   | No          | `unique-id` \| `grouped-by-tag` (default: unique-id).                                                                                              |
| `decomposeNestedPermissions` | No          | With `grouped-by-tag`, set `true` to further decompose permission set and muting permission set object/field permissions.                          |
| `updateForceignore`          | No          | Set `true` to automatically add decomposed file paths to `.forceignore` after each hook-triggered decomposition (default: false).                  |
| `overrides`                  | No          | Array of per-type and/or per-component overrides. See [Per-Type & Per-Component Overrides](#per-type--per-component-overrides).                    |

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
| ------------------------- | ----------------------------------------------------------------------------------- |
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
  -c, --config                            Load per-type and per-component overrides from .sfdecomposer.config.json in the repo root. Only the "overrides" array is consumed. [default: false]
  --update-forceignore                    Automatically add decomposed file paths to .forceignore after successful decomposition [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to their intersection.

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

#### sf decomposer recompose

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

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to their intersection.

**Examples**

```bash
sf decomposer recompose -m "flow" --postpurge
sf decomposer recompose -m "flow" -i "force-app"

# Recompose only the components listed in a deploy manifest before deploying
sf decomposer recompose -x "manifest/package.xml"
sf project deploy start -x "manifest/package.xml"
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
  -c, --config                            Load per-type and per-component overrides from .sfdecomposer.config.json in the repo root. [default: false]

GLOBAL FLAGS
  --json  Output as JSON.
```

> At least one of `--metadata-type` or `--manifest` is required. When both are supplied, the run is scoped to their intersection.

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

Two primary strategies control how nested XML elements are split on disk. Both round-trip deterministically and can be mixed across types — or even across components of the same type — via the `overrides` array (see [Per-Type & Per-Component Overrides](#per-type--per-component-overrides)). When switching strategies for an existing component, pass `--prepurge` (or `prePurge: true`) to remove leftover files from the prior strategy before writing new ones.

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

**Extending with splitTags.** A `splitTags` override lets specific tags within a `grouped-by-tag` run break out into per-element files (split mode) or sub-grouped files (group mode), while all other tags stay grouped. See [splitTags grammar](#splittags-grammar).

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

For a comprehensive breakdown of supported, leaf-only, and unsupported metadata types — including multi-level decomposition patterns, Salesforce native decomposition conflicts, and adapter strategy limitations — see [**METADATA_SUPPORT.md**](./METADATA_SUPPORT.md).

#### Exceptions

| Situation                                                                                      | Message                                                                                                                           |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
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

#### What can be overridden

| Field                        | Notes                                                                                                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `metadataTypes`              | Optional (required if `components` is omitted). Array of metadata suffixes (same vocabulary as `--metadata-type` / `metadataSuffixes`). Each suffix may appear in at most one override.                                                                                           |
| `components`                 | Optional (required if `metadataTypes` is omitted). Array of `<metadataSuffix>:<fullName>` keys (e.g. `permissionset:HR_Admin`, `report:MyFolder/MyReport`). Each component may appear in at most one override.                                                                    |
| `decomposedFormat`           | `xml` \| `json` \| `json5` \| `yaml`.                                                                                                                                                                                                                                             |
| `strategy`                   | `unique-id` \| `grouped-by-tag`. Hard rules still win — `labels` and `loyaltyProgramSetup` are always treated as `unique-id`.                                                                                                                                                     |
| `decomposeNestedPermissions` | Only applies to `permissionset` / `mutingpermissionset` with `grouped-by-tag`. Sets a known-good `splitTags` default; ignored if `splitTags` is also set in the same scope.                                                                                                       |
| `splitTags`                  | Custom `splitTags` spec for `grouped-by-tag` strategy. See [splitTags grammar](#splittags-grammar). Ignored when the resolved strategy is not `grouped-by-tag`.                                                                                                                   |
| `multiLevel`                 | One or more `multiLevel` specs for nested-array decomposition. Pass a string, a `string[]`, or a `;`-separated string. See [multiLevel grammar](#multilevel-grammar). When set, replaces the hardcoded `loyaltyProgramSetup` default for the targeted scope.                      |
| `uniqueIdElements`           | Comma-separated list of XML element names (or compound `+`-joined keys) used to derive stable filenames for `unique-id` decomposition. When set, replaces the built-in per-type registry entry for the targeted scope. See [uniqueIdElements grammar](#uniqueidelements-grammar). |
| `prePurge`                   | Per-scope prePurge (decompose). Component-scope `prePurge` only purges the named component's decomposed directory.                                                                                                                                                                |
| `postPurge`                  | Per-scope postPurge (decompose: remove originals after decomposing).                                                                                                                                                                                                              |

Run-scope options (`metadataSuffixes`, `manifest`, `ignorePackageDirectories`) are **not** valid inside an override; the plugin will throw if they are present.

#### Component key conventions

The `<fullName>` part of a component key is the SDR fullName for the component, matching the basename of the decomposed directory:

- **Plain types** (e.g. `permissionset`, `flow`, `profile`, `workflow`): use the file stem, e.g. `permissionset:HR_Admin` for `permissionsets/HR_Admin.permissionset-meta.xml`.
- **Strict-directory types** (e.g. `bot`): use the bot directory name, e.g. `bot:My_Bot` for `bots/My_Bot/My_Bot.bot-meta.xml`.
- **Folder-typed metadata** (e.g. `report`, `dashboard`, `email`, `document`): the unit of decomposition is the folder; use the folder name, e.g. `report:MyFolder` to scope every report inside `reports/MyFolder/`.
- **`labels`**: there is exactly one labels file per labels directory, so component-scope keys are not meaningful — use the type-scope `metadataTypes: ["labels"]` instead.

Component overrides are not a filter. If `--metadata` / `metadataSuffixes` includes `permissionset`, every permission set is still decomposed; the override only changes how the named ones are decomposed. Use `--manifest` / the hook's `manifest` field if you want to scope the run itself to a subset of components.

#### Precedence

For each component, each option is resolved independently in this order (highest first):

1. The component-scope override value (matching `<suffix>:<fullName>` in `components`), if set.
2. The type-scope override value (matching `<suffix>` in `metadataTypes`), if set.
3. The run-wide value (CLI flag, hook config top-level field, or built-in default).
4. Hard plugin rules (e.g. `labels` and `loyaltyProgramSetup` forced to `unique-id`) override all of the above.

#### splitTags grammar

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

#### multiLevel grammar

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

#### uniqueIdElements grammar

`uniqueIdElements` lets you specify which XML element names the disassembler crate uses to derive stable, human-readable filenames during `unique-id` decomposition. The plugin ships with a built-in registry covering the most common metadata types ([`src/metadata/uniqueIdElements.ts`](https://github.com/mcarvin8/sf-decomposer/blob/main/src/metadata/uniqueIdElements.ts)); use this override when a type is missing from the registry or when the built-in selection produces collisions for your org's data.

**When to use:**

- A metadata type released after the last plugin update is not in the built-in registry and produces SHA-256 hash filenames (`abc1234.mytype-meta.xml`) instead of readable ones.
- You see `RUST_LOG=warn` collision warnings for an existing type and want to add a tiebreaker compound key without waiting for a plugin release.
- You want to replace the built-in element list for a specific type or component with a narrower or wider set.

**Spec:** Comma-separated list of element names. Each entry is either a simple name or a compound key whose fields are joined by `+`. The disassembler tries each entry in order; the first one that resolves to a non-empty, unique value within the parent element wins. The global defaults `fullName` and `name` are always prepended regardless — you do not need to include them.

```
<element>[+<element>...][,<element>[+<element>...]...]
```

**Error behaviour:**

- An empty string or an entry with empty comma slots is rejected at **config-load time** — the command fails immediately before any decomposition starts.
- Element names that pass format validation but do not exist in the XML are silently ignored by the disassembler crate; it falls back to SHA-256 hash filenames for the affected elements (the same behaviour as today when no registry entry matches). The plugin does not throw an error and continues decomposing all remaining files.

**Examples:**

```json
"overrides": [
  {
    "metadataTypes": ["myNewSalesforceType"],
    "uniqueIdElements": "developerName"
  },
  {
    "metadataTypes": ["serviceChannel"],
    "uniqueIdElements": "type+value,value"
  },
  {
    "components": ["app:My_App"],
    "uniqueIdElements": "actionName+pageOrSobjectType+formFactor+profile+recordType,actionName+pageOrSobjectType+formFactor+profile,actionName+pageOrSobjectType+formFactor+recordType,actionName+pageOrSobjectType+formFactor"
  }
]
```

> **Tip:** If you resolve a collision by adding a compound key and it works, consider opening an issue or PR to add it to the built-in registry so other orgs benefit automatically.

#### Opting in from the CLI

CLI users can opt into overrides on `decompose` with the boolean `--config` (`-c`) flag. When set, the plugin reads `.sfdecomposer.config.json` from the repo root (the nearest ancestor directory that contains `sfdx-project.json`):

```bash
sf decomposer decompose -m "flow" -m "permissionset" -c
```

When `--config` is set, **only** the `overrides` array is consumed from the file. Top-level fields like `decomposedFormat`, `strategy`, `metadataSuffixes`, etc. are ignored — the CLI flags remain the source of truth for run-wide values. This keeps direct CLI behavior predictable and lets you reuse the same config file as the post-retrieve hook without any surprises.

If `--config` is set but `.sfdecomposer.config.json` is missing from the repo root, the command fails with a clear error.

`recompose` does not accept `--config` because it does not need the override information — format is auto-detected from the decomposed files on disk and recompose does not depend on strategy.

The post-retrieve hook automatically picks up `overrides` from `.sfdecomposer.config.json` — no extra setup required. Existing config files without an `overrides` field continue to behave exactly as before.

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
