---
name: edit-metadata
description: Use when the user asks to read, compare, audit, or change large Salesforce metadata XML files in a Salesforce DX project, such as permission sets, profiles, custom labels, workflows, flows, sharing rules, or bots. Examples include "give the Sales Ops permission set read access to Account.Industry", "which permission sets can edit Opportunity.Amount", "remove every reference to the oldns package from our profiles", "compare these two permission sets", or "rename this custom label". Splits each file into small per-element files with sf-decomposer, works on those, then rebuilds the original file so only the intended change remains. Needs Node.js 22.19+, no Salesforce CLI.
---

# Edit Salesforce metadata with sf-decomposer

Large metadata files (permission sets, profiles, labels, workflows) are thousands
of lines of repetitive XML. Editing them in place is error-prone and reading them
whole wastes context. sf-decomposer splits each file into one small file per
element (for example one file per field permission), so you can find, read, add,
change, or delete exactly the element you need, then rebuild the original file.

All commands below run `npx -y sf-decomposer-core@7`, which needs Node.js 22.19
or newer and nothing else. Never install the Salesforce CLI or the `sf` plugin
for this.

## Step 1: Check the project

1. Find `sfdx-project.json` in the working directory or a parent. If there is
   none, stop: sf-decomposer only works in a Salesforce DX project. Run every
   command below from the folder that holds it.
2. Confirm `node --version` is 22.19 or newer.
3. Find the metadata type suffix from the file name, `<Name>.<suffix>-meta.xml`
   (for example `permissionset`, `profile`, `labels`, `workflow`, `flow`).
   Custom objects (`object`) and types stored as bundles or with content files
   (Apex classes, LWC, Aura, static resources, Experience sites) are not
   supported. Edit those directly.
4. Check `sfdx-project.json` for `sourceBehaviorOptions` (for example
   `decomposePermissionSetBeta2`, `decomposeCustomLabelsBeta2`,
   `decomposeWorkflowBeta`, `decomposeSharingRulesBeta`). If the type you need
   is listed, Salesforce's own decomposition already splits it. Don't run
   sf-decomposer on that type; edit the files Salesforce created directly.

## Step 2: Choose the mode

Check whether the project already uses sf-decomposer: a
`.sfdecomposer.config.json` in the project root, or `.key_order.json` files in
folders next to the metadata files.

- **Already decomposed**: the small files exist and are what the team edits and
  commits. Use [Mode A](#mode-a-project-already-uses-sf-decomposer).
- **Not decomposed**: the project keeps only the original XML files. Use
  [Mode B](#mode-b-temporary-decomposition). It decomposes only the components
  you need, then restores the original layout, so the only change left is the
  one the user asked for.

## Mode A: project already uses sf-decomposer

1. Read, edit, add, or delete the small files directly (see
   [Working with the small files](#working-with-the-small-files)).
2. If the original root files are tracked in git (`git ls-files` lists files
   like `permissionsets/Sales_Ops.permissionset-meta.xml`), rebuild them so they
   match: `npx -y sf-decomposer-core@7 recompose -c -m <suffix>`. If only the
   small files are tracked, skip this; the team's hooks or CI rebuild them.
3. Don't change `.sfdecomposer.config.json`, `.forceignore`, or the decompose
   strategy or format unless the user asks.

## Mode B: temporary decomposition

1. Check that the target files have no uncommitted changes
   (`git status --porcelain -- <paths>`). If they do, tell the user and ask
   before continuing, so their edits and yours stay distinguishable.
2. Write a `package.xml` outside the repository (in a fresh temporary folder)
   that lists only the components you need, using the Metadata API type names:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Package xmlns="http://soap.sforce.com/2006/04/metadata">
     <types>
       <members>Sales_Ops</members>
       <members>Support_Agent</members>
       <name>PermissionSet</name>
     </types>
     <version>62.0</version>
   </Package>
   ```

   `<members>*</members>` covers every component of that type, which suits
   repo-wide questions such as "which permission sets grant X". For the type
   names, see `references/metadata-types.md`.
3. Check the round trip is safe before touching anything:

   ```bash
   npx -y sf-decomposer-core@7 verify -x <manifest> --json
   ```

   - Non-empty `drift`: stop and tell the user. Rebuilding would change those
     files beyond your edit.
   - Non-empty `reordered`: rebuilding would reorder elements in those files
     (Salesforce ignores the order, but the diff will show it). Tell the user
     and ask whether to continue.
4. Decompose with the defaults (one file per element, XML):

   ```bash
   npx -y sf-decomposer-core@7 decompose -x <manifest>
   ```

   Never pass `--postpurge`, `--update-forceignore`, `--update-gitattributes`,
   or `-c` in this mode. Those change the project's layout or config.
5. Do the work in the small files (see below).
6. Rebuild the original files and remove the small ones:

   ```bash
   npx -y sf-decomposer-core@7 recompose -x <manifest> --postpurge
   ```

   Run every command from the project root, and never `cd` into a component
   folder. On Windows, a shell whose working directory is inside a folder
   locks it, so `--postpurge` stops partway through and still exits 0.
7. Run `git status` and `git diff` on the changed files. For a read-only task,
   the diff should be empty. If a component folder is still there after step
   6, the purge stopped partway and some small files are already gone:
   - **Never run recompose again.** It would rebuild the original from the
     files that are left and silently drop the elements that were purged.
   - The original was rebuilt before the purge started. If `git diff` shows
     only your intended change, delete the leftover folder.
   - If the diff is wrong, restore the original with `git checkout -- <file>`,
     delete the leftover folder, and start again from step 4.
8. Delete the temporary manifest folder.

Always finish step 6, even if the edit fails or the user changes their mind
partway, so the project never stays half-decomposed.

## Working with the small files

After `decompose`, each component gets a folder next to its original file:

```
permissionsets/
├── Sales_Ops.permissionset-meta.xml          ← original (Mode B keeps it until recompose)
└── Sales_Ops/
    ├── Sales_Ops.permissionset-meta.xml      ← top-level fields: label, description, license
    ├── .key_order.json                       ← element order; never edit
    ├── fieldPermissions/
    │   └── Account.Industry.fieldPermissions-meta.xml
    ├── objectPermissions/
    │   └── Account.objectPermissions-meta.xml
    └── userPermissions/
        └── ApiEnabled.userPermissions-meta.xml
```

Each small file holds one element wrapped in the type's root tag, named after its
identifying value (the field, object, class, or permission name):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldPermissions>
        <editable>false</editable>
        <field>Account.Industry</field>
        <readable>true</readable>
    </fieldPermissions>
</PermissionSet>
```

- **Find**: search file names first (`*Account.Industry*`), then contents. To
  answer "which components grant X", decompose with `<members>*</members>` and
  search across all component folders.
- **Change**: edit the values in the one file.
- **Add**: create a new file in the matching folder, copying a sibling's
  structure and naming pattern. Recompose includes it.
- **Remove**: delete the file. To drop every reference to a package or
  component, delete all matching files across folders (`objectPermissions/`,
  `fieldPermissions/`, `classAccesses/`, `tabSettings/`,
  `recordTypeVisibilities/`, and so on), then show the user what you deleted
  before recomposing.
- **Top-level fields** (label, description, license) live in the file named
  like the original inside the component folder.
- Never edit `.key_order.json`, `.multi_level.json`, `.sidecars.json`, or
  `.trailing_newline.json`. Recompose needs them.
- Custom labels are flat: one `<fullName>.label-meta.xml` per label directly in
  `labels/`.

`references/metadata-types.md` lists common types, their suffixes and Metadata API
names, and layout notes for bots, flows, and other nested types.

## Report back

Summarize what changed in plain terms (for example "Sales Ops can now read
Account.Industry"), name the files that changed, and say whether the project was
left as it was (Mode B) or which small files changed (Mode A). Don't deploy, and
don't commit unless the user asks.

## Errors

- `sfdx-project.json not found`: run from the project root.
- `No directories named <folder> were found`: the project has no metadata of
  that type in its package directories.
- `Metadata type not found for the given suffix`: check the suffix in the file
  name.
- `Custom Objects are not supported` or an unsupported strategy: edit that file
  directly instead.
