---
name: sf-decomposer-setup
description: Use when the user wants to start using sf-decomposer in a Salesforce DX project, or to change how a project decomposes metadata, such as "set up sf-decomposer", "decompose our permission sets and profiles in git", "make our metadata diffs smaller", "switch to grouped-by-tag", or "add a pre-commit hook to recompose". Walks through choosing metadata types, strategy and format, checks the round trip, writes .sfdecomposer.config.json, updates .forceignore and .gitattributes, and sets up recompose before commit or deploy. Needs Node.js 22.19+; the Salesforce CLI is optional.
license: MIT
---

# Set up sf-decomposer in a project

This changes how the project stores metadata in git: large files become folders
of small files. Treat it as a team decision. Explain each step, show the user
what will change, and don't commit unless they ask.

Commands use `npx -y sf-decomposer-core@7`, which works without the Salesforce
CLI. If the team uses the Salesforce CLI, `sf decomposer <command>` from the
`sf-decomposer` plugin takes the same flags and adds retrieve/deploy hooks.

## Step 1: Check the project

1. Find `sfdx-project.json`. Run every command from the folder that holds it.
2. Confirm `node --version` is 22.19 or newer.
3. If `.sfdecomposer.config.json` already exists, read it and treat this as a
   change to an existing setup, not a fresh start.
4. Check `sfdx-project.json` for `sourceBehaviorOptions` (Salesforce's built-in
   decomposition, such as `decomposePermissionSetBeta2`). Never use both on the
   same type. If the user wants to switch, point them to
   <https://github.com/mcarvin8/sf-decomposer/blob/main/docs/MIGRATION.md> first.

## Step 2: Choose what to decompose

Ask the user, offering these defaults:

- **Types**: the big, frequently changed ones, usually `permissionset`,
  `profile`, `labels`, `workflow`, and `flow`. List which of these folders exist
  in the package directories.
- **Strategy**: `unique-id` (default) gives one file per element, best for
  reviews and for removing individual references. `grouped-by-tag` gives one
  file per tag (`fieldPermissions.xml`), fewer files. For permission sets,
  `grouped-by-tag` with `decomposeNestedPermissions` splits object and field
  permissions per object.
- **Format**: `xml` (default) keeps files deployable as-is once recomposed;
  `yaml`, `json`, or `json5` are easier to read.
- **Root files in git**: keep the original files tracked (`postPurge: false`,
  recommended, and required for sfdx-git-delta) or keep only the small files
  (`postPurge: true`).

## Step 3: Check the round trip

Before changing any files, confirm every chosen type survives decompose plus
recompose:

```bash
npx -y sf-decomposer-core@7 verify -m permissionset -m profile -s unique-id -f xml
```

Use the strategy and format the user chose. If `verify` reports drift, stop and
show the files. Leave that type out or open an issue at
<https://github.com/mcarvin8/sf-decomposer/issues>. Reordered-only files are fine.

## Step 4: Write the config

Create `.sfdecomposer.config.json` in the project root:

```json
{
  "metadataSuffixes": "permissionset,profile,labels,workflow,flow",
  "strategy": "unique-id",
  "decomposedFormat": "xml",
  "prePurge": true,
  "postPurge": false,
  "updateForceignore": true,
  "updateGitattributes": true
}
```

Add `"decomposeNestedPermissions": true` for grouped-by-tag permission sets, and
`"skipPrerunHook": true` if a pre-commit hook will recompose (step 6). The full
option list and per-type `overrides` are in
<https://github.com/mcarvin8/sf-decomposer/blob/main/docs/CONFIGURATION.md>.

## Step 5: Decompose

```bash
npx -y sf-decomposer-core@7 decompose --config
```

With `updateForceignore` and `updateGitattributes` set, this also:

- adds patterns to `.forceignore` so the Salesforce CLI ignores the small files
  and still deploys the original files (required, or `sf` commands fail);
- marks the original files in `.gitattributes` as generated (`-diff
  linguist-generated=true`), so reviews show only the small files.

Show the user `git status` and a sample of the new folders. Don't commit.

## Step 6: Keep the original files current

Deployments read the original files, so they must be rebuilt after the small
files change. Pick one with the user:

- **Pre-commit hook (works for everyone)**: recompose before each commit and
  stage the rebuilt files. For husky, `.husky/pre-commit`:

  ```sh
  npx -y sf-decomposer-core@7 recompose --config || exit 1
  git add -u -- ':(glob)**/permissionsets/*.permissionset-meta.xml' ':(glob)**/profiles/*.profile-meta.xml'
  ```

  Add one pathspec per configured type: its folder and suffix, matching only
  the original files that sit directly in that folder. Never stage every
  changed `-meta.xml` file. That would also commit small files and other
  metadata the user hasn't staged yet. Bots keep their originals one folder
  down, so they need `**/bots/*/*.bot-meta.xml` and
  `**/bots/*/*.botVersion-meta.xml`.

  Set `"skipPrerunHook": true` in the config so the Salesforce CLI hook doesn't
  recompose a second time at deploy.
- **Salesforce CLI hooks**: with `sf plugins install sf-decomposer`, retrieve
  decomposes and deploy recomposes automatically using the config file. The
  plugin isn't digitally signed, so `sf` asks the user to confirm the install;
  the user has to run that themselves.
- **CI only**: run `npx -y sf-decomposer-core@7 recompose --config` in the
  pipeline before deploying.

If the team uses sfdx-git-delta, keep `postPurge: false` and use the pre-commit
hook, so the root files sgd compares are updated in each commit.

## Step 7: Hand off

Summarize the chosen settings, the files created or changed (config,
`.forceignore`, `.gitattributes`, hook), and the new folders. Suggest reviewing
the diff and committing in one dedicated commit, separate from metadata changes.
To edit metadata later, the `sf-decomposer-edit-metadata` skill works with this layout.
