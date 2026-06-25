# Admin Handbook — Decomposing Tricky Salesforce Metadata

This handbook collects ready-to-paste `.sfdecomposer.config.json` recipes for the metadata types where Salesforce's native source format either doesn't decompose at all or decomposes too coarsely to diff well in version control. Every recipe in this guide:

- decomposes the original file into per-piece units that survive `git diff` cleanly,
- recomposes back to a **byte-identical** XML deployable to any org,
- is verified by `sf decomposer verify` before you commit it.

If you want the underlying option grammar instead of recipes, see the [main README](./README.md#per-type--per-component-overrides).

## Contents

- [Choosing a strategy](#choosing-a-strategy)
- [Common pitfalls](#common-pitfalls)
- [Bots (Agentforce and Einstein)](#bots-agentforce-and-einstein)
- [Flexipages (Lightning App / Record / Home pages)](#flexipages-lightning-app--record--home-pages)
- [Layouts (page layouts)](#layouts-page-layouts)
- [Other deeply-nested types](#other-deeply-nested-types)
- [The verification workflow](#the-verification-workflow)

## Choosing a strategy

Three knobs cover almost every case:

| Symptom of the source XML                                                                     | Reach for                                                                                          |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| One repeating section at the top level (e.g. `<labels>` of a custom-labels file).             | `strategy: unique-id` (default).                                                                   |
| Lots of small repeatable tags, you want one file per tag-name, not per-instance.              | `strategy: grouped-by-tag`.                                                                        |
| `grouped-by-tag`, but a few specific tags (e.g. `objectPermissions`) need finer-grained diff. | Add `splitTags`.                                                                                   |
| A deeply-nested repeatable block lives _inside_ another repeatable block (the bot pattern).   | Add `multiLevel`. If there are several such nested blocks, pass them as an array — see Bots below. |

Hard rules the plugin always enforces (so you don't have to):

- `labels` and `loyaltyProgramSetup` are always treated as `unique-id` regardless of any override.

Built-in `multiLevel` defaults — applied automatically when `strategy` is `unique-id` and you do not supply your own `multiLevel` for that type. You can replace any of them by setting an explicit `multiLevel` on the override.

| Metadata type         | Built-in `multiLevel`                                               |
| --------------------- | ------------------------------------------------------------------- |
| `bot`                 | `["botDialogs:botDialogs:developerName", "botSteps:botSteps:type"]` |
| `loyaltyProgramSetup` | `"programProcesses:programProcesses:parameterName,ruleName"`        |

The full registry lives in [`src/metadata/multiLevelDefaults.ts`](./src/metadata/multiLevelDefaults.ts).

Everything else in this handbook is opt-in.

## Common pitfalls

**1. "I added two `multiLevel` rules but only one survived."**
You probably ran two `decompose` invocations back-to-back, one rule each. Don't. The disassembler rewrites `.multi_level.json` on every run, so each call replaces the prior one. Pass every rule for a given component in **one** override entry, in array form.

**2. "My `multiLevel` rule is correct but recompose produces a smaller file."**
On `config-disassembler` Rust ≥ 0.5.0 / Node ≥ 1.3.0 this should not happen — sibling collisions are written to per-element SHA-256 shards and surfaced as a `WARN` (see pitfall #5), not silently overwritten. If you do see a shrunken recomposed file on a current build, treat it as a regression worth capturing as a fixture.

**3. "Component-scope override fields look ignored."**
Component-scope wins over type-scope, but only for fields **the component override explicitly sets**. Fields it leaves out fall through to the type-scope value, then to the run-wide default. If you set `decomposedFormat: "yaml"` on a type and `strategy: "grouped-by-tag"` on the component, the component still gets `decomposedFormat: "yaml"` from the type override.

**4. "Reassembly removed my decomposed directory even though I didn't pass `postPurge`."**
That's by design for `multiLevel` types only. Multi-level recompose has to clean up inner-level directories so the next level can merge their reassembled XML. If you want the decomposed tree preserved for inspection, copy it before running `recompose`.

**5. "Decompose succeeded but my decomposed files all have hash names."**
There are two distinct causes; run the decompose under `RUST_LOG=warn` to tell them apart:

- **No `WARN` line.** Your `unique_id_elements` (or the rule's third part) didn't resolve to a non-empty value on those items. Check the source XML for the elements you listed — names are case-sensitive and live at the immediate child level of each repeating item. The plugin only walks one level deep when picking a UID.
- **A `WARN` line of the form `uniqueIdElements collision: <parentTag> id "X" matched N sibling elements`.** The configured key is too narrow — multiple siblings legitimately share the same value, so the collision detector falls back to per-element SHA-256 hashes for that group rather than overwrite. Add a tiebreaker to `unique_id_elements` (e.g. a compound like `name+recordType`) and re-decompose with `prePurge: true`.

## Bots (Agentforce and Einstein)

**Why this is hard.** Agentforce and Einstein bots both ship as `.bot-meta.xml`, but their internals diverge:

- The bot **header** (`Bot.bot-meta.xml`) is small — a few leaves, a few `botUserList` entries.
- The bot **versions** (`vN.botVersion-meta.xml`) are the painful ones. A single `BotVersion` typically contains:
  - `botDialogGroups` (logical groupings),
  - `botDialogs` (the dialogs themselves), and inside each dialog,
  - `botSteps` (often nested 2–3 levels deep — message, collect, transfer, condition, ...),
  - `mlIntents`, `conversationVariables`, `botStepConditions`, ...

A flat `unique-id` decomposition of a `BotVersion` produces one giant per-dialog file with hundreds of nested steps inside. That's only marginally easier to review than the original.

**The two-rule recipe — applied by default.** Under `strategy: unique-id` (the default) the plugin automatically applies:

```json
"multiLevel": ["botDialogs:botDialogs:developerName", "botSteps:botSteps:type"]
```

to every `bot` you decompose. You don't need to add anything to `.sfdecomposer.config.json` for the canonical Bot layout — just run `sf decomposer decompose --metadata-type bot` and you get the structure documented below. Add an explicit `multiLevel` override only if you want a different layout (see "When to use a single rule instead" further down).

What this produces on disk for `Sample_Chat_Bot/v1.botVersion-meta.xml` (an Einstein chat bot from the plugin's own fixtures):

```
bots/
└── Sample_Chat_Bot/
    ├── Sample_Chat_Bot.bot-meta.xml                 ← bot header (untouched)
    ├── v1/
    │   ├── nlpProviders/
    │   │   └── EinsteinAi.nlpProviders-meta.xml
    │   ├── botDialogs/                              ← outer rule lands here
    │   │   ├── Welcome/                             ← one directory per dialog (named by developerName)
    │   │   │   ├── Welcome.xml                      ← dialog leaf properties
    │   │   │   └── botSteps/                        ← inner rule lands here
    │   │   │       ├── 853b6432/                    ← step with nested content -> own subdir
    │   │   │       │   ├── 853b6432.xml             ← step leaf properties
    │   │   │       │   └── botNavigation/           ← nested step content broken out
    │   │   │       │       └── Redirect.botNavigation-meta.xml
    │   │   │       └── dc35b789/
    │   │   │           ├── dc35b789.xml
    │   │   │           └── botMessages/
    │   │   │               └── dc35b789.botMessages-meta.xml
    │   │   ├── End_Chat/
    │   │   │   ├── End_Chat.xml
    │   │   │   └── botSteps/
    │   │   │       ├── 9d031e75.botSteps-meta.xml   ← step with no nested content -> single leaf file
    │   │   │       └── a7afda99/                    ← step with nested content -> subdir
    │   │   │           └── ...
    │   │   └── ...
    │   ├── .multi_level.json                        ← required for recompose; do not hand-edit
    │   └── v1.botVersion-meta.xml                   ← leaf-only outer wrapper
    └── ...
```

A few things worth knowing before you commit this:

- **Dialog folders are named by developerName**, the way the recipe asks for. So `Welcome`, `End_Chat`, etc. are stable and review-friendly across deploys.
- **Step folders/files are content-hashed.** The inner rule's `:type` segment tells the disassembler what to look for, but each step's nested content is what determines the on-disk name (`853b6432`, `dc35b789`, ...). The hashes are stable across runs as long as the step content doesn't change, so they diff cleanly. Don't try to "rename them to something nicer" — they'll regenerate on the next decompose.
- **Each step is one of two shapes**: a leaf `<hash>.botSteps-meta.xml` file when the step has no nested content (e.g. a `Wait` step), or a `<hash>/` directory containing `<hash>.xml` plus subdirectories for the nested content (e.g. a `Message` step with `<botMessages>`, a `Navigation` step with `<botNavigation>`, an Agentforce `Action` step with `<botFlowInvocation>`). Both shapes recompose back to identical `<botSteps>` XML.
- **The two rules do different things.** The outer `botDialogs` rule is what gives you per-dialog folders — that's the headline win for review-ability. The inner `botSteps` rule additionally splits each step's nested content out of the per-dialog file into per-step subdirectories. For small Einstein bots with shallow steps you can drop the inner rule and still get the dialog-level split; for heavier Agentforce bots the inner rule is the difference between a 50-line per-step subtree and a 500-line per-dialog file.

**When to use a single rule instead.** If your bots have shallow steps (most Einstein chat bots, or pre-Agentforce bots), you can override the default with a single outer rule:

```json
{
  "overrides": [{ "metadataTypes": ["bot"], "multiLevel": ["botDialogs:botDialogs:developerName"] }]
}
```

Each dialog still gets its own folder, but steps live as flat `*.botSteps-meta.xml` files inside instead of per-type subdirectories. Recompose is byte-identical either way; the choice is purely about how granular you want the per-step diff to be. Your override fully replaces the built-in default — no merging.

> **Per-bot precision.** When one bot in your repo wants a different layout than the rest, scope the override to a single component:
>
> ```json
> {
>   "components": ["bot:Legacy_Chat_Bot"],
>   "multiLevel": ["botDialogs:botDialogs:developerName"]
> }
> ```
>
> The default still applies to every other bot.

> **Agentforce vs Einstein.** Both share the `bot` suffix and are covered by a single override. Their structural differences (Agentforce: `botFlowInvocation`, `genAi*`; Einstein: `botNavigation`, `mlIntents`) are invisible to the recipe — `multiLevel` only targets the repeating sections that exist on each side.
>
> **Sibling order inside `botSteps`.** Recompose orders `<botSteps>` siblings alphabetically by on-disk filename, not by document position. Salesforce ignores step order at the XML level, so deploys are unaffected — but a freshly-recomposed file may show steps shuffled compared to the originally-retrieved source. The committed fixtures in this repo are baked from the recompose output for that reason; `sf decomposer verify` treats the baked output as the source of truth.

## Flexipages (Lightning App / Record / Home pages)

**Why this is hard.** A non-trivial flexipage looks like:

```xml
<FlexiPage>
  <flexiPageRegions>
    <itemInstances>
      <componentInstance>
        <componentInstanceProperties>...</componentInstanceProperties>
        <componentName>...</componentName>
      </componentInstance>
    </itemInstances>
    <itemInstances>...</itemInstances>
    ...
  </flexiPageRegions>
  <flexiPageRegions>...</flexiPageRegions>
</FlexiPage>
```

Two repeating layers (`flexiPageRegions → itemInstances`) and component identity is buried inside `componentInstance` — the surrounding wrappers don't have a stable name, so a naive `unique-id` pass produces hash-named files that churn whenever a component is reordered.

**Recipe — flexiPageRegions out, then itemInstances per region.**

```json
{
  "overrides": [
    {
      "metadataTypes": ["flexipage"],
      "strategy": "unique-id",
      "multiLevel": ["flexiPageRegions:flexiPageRegions:name", "itemInstances:itemInstances:componentName,facetId"]
    }
  ]
}
```

What you'll see on disk:

```
flexipages/
└── Account_Record_Page/
    ├── flexiPageRegions/
    │   ├── header.flexiPageRegions-meta.xml
    │   ├── main.flexiPageRegions-meta.xml
    │   └── main/
    │       └── itemInstances/
    │           ├── force_highlightsPanel.itemInstances-meta.xml
    │           ├── runtime_sales_activities__activitiesComponent.itemInstances-meta.xml
    │           └── ...
    └── Account_Record_Page.flexipage-meta.xml
```

**When to adjust.**

- Flexipages where regions are addressed by `regionId` instead of `name` — swap the first rule to `flexiPageRegions:flexiPageRegions:regionId,name`.
- If the same `componentName` appears multiple times in one region (common for blank `force:emptySpace`), include `facetId` (already in the recipe) and, if needed, a stable property: `itemInstances:itemInstances:componentName,facetId,componentInstanceProperties.value`.

## Layouts (page layouts)

**Why this is hard.** Layouts have three nested repeatables:

```xml
<Layout>
  <layoutSections>
    <layoutColumns>
      <layoutItems>
        <field>...</field>
      </layoutItems>
    </layoutColumns>
  </layoutSections>
</Layout>
```

For a fat object (Account, Opportunity), this often runs to thousands of lines. Reviewing a "moved one field from column 1 to column 2" change in the raw XML is painful.

**Recipe — section out, item per field.**

```json
{
  "overrides": [
    {
      "metadataTypes": ["layout"],
      "strategy": "unique-id",
      "multiLevel": ["layoutSections:layoutSections:label", "layoutItems:layoutItems:field,customLink,emptySpace"]
    }
  ]
}
```

What you'll see on disk:

```
layouts/
└── Account-Account_Layout/
    ├── layoutSections/
    │   ├── Account_Information.layoutSections-meta.xml
    │   ├── Address_Information.layoutSections-meta.xml
    │   └── Account_Information/
    │       └── layoutItems/
    │           ├── Name.layoutItems-meta.xml
    │           ├── Type.layoutItems-meta.xml
    │           └── ...
    └── Account-Account_Layout.layout-meta.xml
```

**Caveats.**

- Empty-space layout items (`<emptySpace>true</emptySpace>` with no `field`) all collapse to the same key. The recipe above falls through to `customLink` and then `emptySpace`, but if you have many empty-space spacers per section you'll get hash-named tiebreakers. That's fine for diffs (they only churn when the layout changes), just be aware.
- Sections with duplicate labels are unusual but legal (e.g. two "Custom Links" sections). If you hit collisions, add a stable secondary like `style`: `layoutSections:layoutSections:label,style`.

## Other deeply-nested types

These follow the same pattern; pick the rules that match your repo's data. None of these are decomposed natively by Salesforce.

| Metadata type                              | Suggested override                                                                                                                                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flow`                                     | `multiLevel: ["actionCalls:actionCalls:name", "decisions:decisions:name", "rules:rules:name"]`                                                                                                                                                            |
| `globalValueSet`                           | `multiLevel: ["customValue:customValue:fullName"]` — handy when value sets have hundreds of picks.                                                                                                                                                        |
| `field` (CustomField)                      | `multiLevel: "valueSet:valueSetDefinition:fullName"` — splits each picklist value into its own file. Only effective on fields that define picklist values inline; fields referencing a global value set or non-picklist fields are leaf-only and skipped. |
| `marketingappextension`                    | `multiLevel: ["activityDefinitions:activityDefinitions:apiName"]`                                                                                                                                                                                         |
| `cmsDeliveryChannel` (and other CMS types) | `strategy: grouped-by-tag` plus `splitTags` for any wide repeatable tag.                                                                                                                                                                                  |
| `dashboard`                                | `multiLevel: ["components:components:title"]` — one file per dashboard widget.                                                                                                                                                                            |

If a metadata type has a single deeply-nested repeatable block, a one-rule `multiLevel` is enough. Reach for the array form only when you have **two or more** distinct nested sections you want addressable on disk.

## The verification workflow

Always verify a new override before committing it:

```bash
# 1. Stash any uncommitted source first.
git stash --include-untracked

# 2. Decompose with the new override.
sf decomposer decompose -m "bot" --config

# 3. Recompose back from the decomposed tree.
sf decomposer recompose -m "bot"

# 4. Check the round-trip didn't drift.
sf decomposer verify -m "bot" --config
```

`sf decomposer verify` is non-destructive: it decomposes into a temp dir, recomposes from the temp dir, and compares the result to your committed source. If anything drifts (content, missing file, sibling reorder) it tells you exactly which paths broke. Treat any drift as a blocker — fix the override (or fall back to the previous one) before committing.

---

When in doubt: write the override, run `verify`, read the diff. Every recipe in this handbook was derived that way.
