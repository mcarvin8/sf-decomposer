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
| ------------------------------------------ | --------------------------- | ----------------------------- |
| `decomposeCustomLabelsBeta`                | CustomLabels                | `labels`                      |
| `decomposeWorkflowBeta`                    | Workflow                    | `workflow`                    |
| `decomposePermissionSetBeta2`              | PermissionSet               | `permissionset`               |
| `decomposeSharingRulesBeta`                | SharingRules                | `sharingRules`                |
| `decomposeExternalServiceRegistrationBeta` | ExternalServiceRegistration | `externalServiceRegistration` |

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

Then run:

```bash
sf convert source behavior
```

This converts natively-decomposed fragments back to full parent XML files locally, with no org connection required. The CLI reads the updated `sfdx-project.json` and rewrites your local source in-place.

If your local source is missing or stale (e.g., the decomposed files were never committed), retrieve from a scratch org or sandbox instead:

```bash
sf project retrieve start -m "CustomLabels" -m "PermissionSet" -m "Workflow"
```

Either way, verify no native-decomposed fragments remain before continuing:

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
