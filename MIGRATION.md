# Migrating from Salesforce Native Decomposition to sf-decomposer

This guide is for teams already using Salesforce CLI's built-in beta decomposition who want to switch to sf-decomposer. If you are setting up sf-decomposer in a project that has never used native decomposition, follow the [README Setup](./README.md#setup) instead.

## Contents

- [Why migrate?](#why-migrate)
- [Conflicting types](#conflicting-types)
- [Before you start](#before-you-start)
- [Migration steps](#migration-steps)
- [Rollback](#rollback)

---

## Why migrate?

Salesforce's native decomposition covers a narrow set of types and offers limited control. sf-decomposer provides:

- Broader type coverage (Flow, Profile, Bot, FlexiPage, Layout, and more)
- `grouped-by-tag` strategy and `splitTags` / `multiLevel` for fine-grained control
- YAML, JSON, and JSON5 output formats
- Per-component overrides
- Manifest-scoped runs (`-x package.xml`)

If Salesforce's built-in behavior is sufficient for your types, there is no need to migrate.

---

## Conflicting types

Never run both tools on the same metadata type in the same project. Mixing them causes version control conflicts and can break deploys.

Currently overlapping types (check [Salesforce docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_decomposed_md_types.htm) for the current list — Salesforce continues to expand native coverage):

| Native `sourceBehaviorOptions` flag        | Metadata type               | sf-decomposer suffix          |
|--------------------------------------------|-----------------------------|-------------------------------|
| `decomposeCustomLabelsBeta`                | CustomLabels                | `labels`                      |
| `decomposeWorkflowBeta`                    | Workflow                    | `workflow`                    |
| `decomposePermissionSetBeta2`              | PermissionSet               | `permissionset`               |
| `decomposeSharingRulesBeta`                | SharingRules                | `sharingRules`                |
| `decomposeExternalServiceRegistrationBeta` | ExternalServiceRegistration | `externalServiceRegistration` |

### ExternalServiceRegistration: structural differences

Both Salesforce native and sf-decomposer extract the `<schema>` field to a `.yaml` sidecar and always convert its content to YAML format (regardless of whether the org stores it as JSON or YAML). That is where the similarity ends.

**Salesforce native (`decomposeExternalServiceRegistrationBeta`)** produces a flat two-file layout:

```
externalServiceRegistrations/
├── BankService.yaml                                     ← schema content as YAML
└── BankService.externalServiceRegistration-meta.xml     ← all other fields; no <schema>
```

**sf-decomposer** produces a subdirectory layout and additionally decomposes `<operations>`:

```
externalServiceRegistrations/
└── BankService/
    ├── BankService.externalServiceRegistration-meta.xml ← leaf fields only; no <schema>, no <operations>
    ├── BankService.yaml                                 ← schema content as YAML (sidecar)
    └── operations/                                      ← one file per <operations> entry, named by <name>
        └── uploadFile.operations-meta.xml
```

The two layouts use different file paths and are **not interchangeable** — do not mix them in the same project. Follow the migration steps below to convert from native decomposition to sf-decomposer.

### Workflow: structural differences

Both Salesforce native and sf-decomposer split a `Workflow` file into one subdirectory per nested category, with the object name as the parent folder. That is where the similarity ends.

**Salesforce native (`decomposeWorkflowBeta`)** extracts 7 categories; `<flowActions>` stays inline in the base file:

```
workflows/
└── Case/
    ├── Case.workflow-meta.xml            ← base fields; <flowActions> stays inline here
    ├── workflowAlerts/
    │   └── My_Alert.workflowAlert-meta.xml
    ├── workflowFieldUpdates/
    ├── workflowKnowledgePublishes/
    ├── workflowOutboundMessages/
    ├── workflowRules/
    ├── workflowSends/
    └── workflowTasks/
```

**sf-decomposer** extracts 8 categories — the same 7 plus `flowActions` — using the raw XML tag name for the directory, then renames the leaf files to match Salesforce's per-element suffix convention:

```
workflows/
└── Case/
    ├── Case.workflow-meta.xml            ← base fields only; nothing nested left inline
    ├── alerts/
    │   └── My_Alert.workflowAlert-meta.xml
    ├── fieldUpdates/
    ├── flowActions/                      ← not extracted by native decomposition
    │   └── My_Flow_Action.workflowFlowAction-meta.xml
    ├── knowledgePublishes/
    ├── outboundMessages/
    ├── rules/
    ├── send/
    └── tasks/
```

Leaf filenames end up matching Salesforce's naming convention, but the directory names (`rules/` vs. `workflowRules/`) and the extra `flowActions/` category mean the two layouts are **not interchangeable** — migrating adds files native decomposition never created for the same source.

### PermissionSet: structural differences

**Salesforce native (`decomposePermissionSetBeta2`)** defines 14 child types in the SDR registry. 10 get one file per entry; the other 4 (`fieldPermissions`, `objectPermissions`, `recordTypeVisibilities`, `tabSettings`) are consolidated into a single `objectSettings` file per object:

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml                        ← label, description, license, ...
    ├── HR_Admin.applicationVisibilities-meta.xml              ← every applicationVisibilities entry
    ├── HR_Admin.classAccesses-meta.xml
    ├── HR_Admin.customMetadataTypeAccesses-meta.xml
    ├── HR_Admin.customPermissions-meta.xml
    ├── HR_Admin.customSettingAccesses-meta.xml
    ├── HR_Admin.externalCredentialPrincipalAccesses-meta.xml
    ├── HR_Admin.externalDataSourceAccesses-meta.xml
    ├── HR_Admin.flowAccesses-meta.xml
    ├── HR_Admin.pageAccesses-meta.xml
    ├── HR_Admin.userPermissions-meta.xml
    └── Job_Request__c.objectSettings-meta.xml                 ← that object's field/object/recordType/tab perms, combined into one file
```

**sf-decomposer** default (`unique-id`, no flags) is far more granular — one file *per entry*, in per-category subdirectories:

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml
    ├── applicationVisibilities/
    │   └── JobApps__Recruiting.applicationVisibilities-meta.xml
    ├── fieldPermissions/
    │   ├── Job_Request__c.SalaryPay__c.fieldPermissions-meta.xml
    │   └── Job_Request__c.Salary__c.fieldPermissions-meta.xml
    ├── objectPermissions/
    │   └── Job_Request__c.objectPermissions-meta.xml
    └── ...
```

`strategy: grouped-by-tag` with `--decompose-nested-permissions` (`-p`) gets close to native's per-object granularity — `objectPermissions` and `fieldPermissions` both become one file per object, everything else stays grouped:

```bash
sf decomposer decompose -m "permissionset" -s "grouped-by-tag" -p
```

```
permissionsets/
└── HR_Admin/
    ├── HR_Admin.permissionset-meta.xml
    ├── applicationVisibilities.xml
    ├── classAccesses.xml
    ├── pageAccesses.xml
    ├── recordTypeVisibilities.xml                ← still grouped, not per-object
    ├── tabSettings.xml                            ← still grouped, not per-object
    ├── fieldPermissions/
    │   └── Job_Request__c.fieldPermissions-meta.xml
    └── objectPermissions/
        └── Job_Request__c.objectPermissions-meta.xml
```

Closest available match, but not byte-for-byte native: native merges all four object-scoped categories into one `objectSettings` file per object; sf-decomposer keeps `objectPermissions`/`fieldPermissions` as two separate per-object files and leaves `recordTypeVisibilities`/`tabSettings` grouped globally. Either way, the paths differ from native's — **not interchangeable**.

---

## Before you start

1. **Coordinate with your team.** The migration touches every decomposed file in version control. Merge or shelve all open PRs that touch affected metadata types before starting to avoid conflicts.
2. **Work on a dedicated branch.** The migration commit will be large — isolate it from feature work.
3. **Confirm CI is not running** on the affected metadata types during migration, or pause it temporarily.

---

## Migration steps

### 1. Disable native decomposition and recompose to full XML

Remove the relevant flags from `sourceBehaviorOptions` in `sfdx-project.json`. For example:

```json
{
  "sourceBehaviorOptions": ["decomposeCustomLabelsBeta", "decomposePermissionSetBeta2"]
}
```

becomes:

```json
{
  "sourceBehaviorOptions": []
}
```

Remove only the flags for types you are migrating to sf-decomposer. Leave flags for types you are keeping under native decomposition.

`sf project convert source behavior` does **not** re-convert already-decomposed fragments back to full XML — it has no effect on existing local source. Instead, delete the native-decomposed fragments for the affected types and retrieve fresh from your org:

```bash
sf project retrieve start -m "CustomLabels" -m "PermissionSet" -m "Workflow"
```

The CLI reads the updated `sfdx-project.json` and retrieves the metadata in full-XML form since the decomposition flags are gone.

Verify no native-decomposed fragments remain before continuing:

```bash
# Should return empty for each type you are migrating off
find . -name "*.label-meta.xml" -not -path "*/node_modules/*"
find . -name "*.permissionset-field-meta.xml" -not -path "*/node_modules/*"
```

### 2. Install sf-decomposer

```bash
sf plugins install sf-decomposer@x.y.z
```

### 3. Configure .forceignore

**Required.** The Salesforce CLI must ignore decomposed files created by sf-decomposer or `sf` commands will fail. Configure this before running any decompose or retrieve commands after completing the migration effort.

**Option A — Automatic (recommended):** Pass `--update-forceignore` on your first `sf decomposer decompose` run. The plugin appends type-level wildcard patterns to `.forceignore` — one ignore pattern for decomposed pieces and one negation to re-allow the original metadata file — creating the file if it doesn't exist. Subsequent runs only add new entries; existing ones are never duplicated.

```bash
sf decomposer decompose -m "flow" -m "permissionset" --postpurge --update-forceignore
```

**Option B — Manual:** Copy the [sample .forceignore](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.forceignore) into your project root and adjust the extension patterns for your chosen format (`.xml`, `.json`, `.yaml`, etc.).

Remove any native-decomposition-era ignore patterns from your existing `.forceignore` — they will conflict.

### 4. Configure .sfdecomposer.config.json

Add a hook config to your project root. Adjust `metadataSuffixes` to the types you are migrating:

```json
{
  "metadataSuffixes": "labels,workflow,permissionset,sharingRules",
  "prePurge": true,
  "postPurge": true,
  "decomposedFormat": "xml"
}
```

See [Configure Hooks](./README.md#4-configure-hooks-recommended) for the full option reference. Use the [sample with overrides](https://raw.githubusercontent.com/mcarvin8/sf-decomposer/main/examples/.sfdecomposer.config.overrides.json) if you need per-type strategies or formats.

### 5. Run the initial decompose

With the full parent XML files in place and `.forceignore` configured:

```bash
sf decomposer decompose -m "labels" -m "workflow" -m "permissionset" --prepurge --postpurge
```

`--prepurge` removes any leftover native-decomposed fragments before writing the new layout. `--postpurge` removes the parent XML files after decomposing (matching the hook behavior going forward).

### 6. Verify the round-trip

Before committing, confirm that sf-decomposer's output recomposes back to byte-equivalent XML:

```bash
sf decomposer verify -m "labels" -m "workflow" -m "permissionset"
```

Fix any drift before continuing. See [Common pitfalls](./HANDBOOK.md#common-pitfalls) if the verify reports hash-named files or unexpected differences.

### 7. Commit

Stage and commit all changes together — the `sfdx-project.json` change, the removed native fragments, the new decomposed tree, and the updated `.forceignore`:

```bash
git add sfdx-project.json .forceignore .sfdecomposer.config.json
git add force-app/  # or your package directory
git commit -m "chore: migrate from native decomposition to sf-decomposer"
```

From this point on the [daily workflow](./README.md#daily-workflow) applies — hooks handle decompose on retrieve and recompose on deploy automatically.

---

## Rollback

If you need to revert before pushing:

```bash
git checkout -- .
```

If you have already pushed and need to revert the migration commit:

```bash
git revert <migration-commit-sha>
```

Then re-enable the removed `sourceBehaviorOptions` flags in `sfdx-project.json` and run a fresh retrieve to restore the natively-decomposed layout.
