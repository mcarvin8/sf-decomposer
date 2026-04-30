# Admin Handbook — Decomposing Tricky Salesforce Metadata

This handbook collects ready-to-paste `.sfdecomposer.config.json` recipes for the metadata types where Salesforce's native source format either doesn't decompose at all or decomposes too coarsely to diff well in version control. Every recipe in this guide:

- decomposes the original file into per-piece units that survive `git diff` cleanly,
- recomposes back to a **byte-identical** XML deployable to any org,
- is verified by `sf decomposer verify` before you commit it.

If you want the underlying option grammar instead of recipes, see the [main README](./README.md#per-type--per-component-overrides).

## Contents

- [Choosing a strategy](#choosing-a-strategy)
- [Bots (Agentforce and Einstein)](#bots-agentforce-and-einstein)
- [Flexipages (Lightning App / Record / Home pages)](#flexipages-lightning-app--record--home-pages)
- [Layouts (page layouts)](#layouts-page-layouts)
- [Other deeply-nested types](#other-deeply-nested-types)
- [The verification workflow](#the-verification-workflow)
- [Common pitfalls](#common-pitfalls)

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
- `loyaltyProgramSetup` automatically gets `multiLevel: programProcesses:programProcesses:parameterName,ruleName` when run under `unique-id` — you can replace it but you don't have to set it.

Everything else in this handbook is opt-in.

## Bots (Agentforce and Einstein)

**Why this is hard.** Agentforce and Einstein bots both ship as `.bot-meta.xml`, but their internals diverge:

- The bot **header** (`Bot.bot-meta.xml`) is small — a few leaves, a few `botUserList` entries.
- The bot **versions** (`vN.botVersion-meta.xml`) are the painful ones. A single `BotVersion` typically contains:
  - `botDialogGroups` (logical groupings),
  - `botDialogs` (the dialogs themselves), and inside each dialog,
  - `botSteps` (often nested 2–3 levels deep — message, collect, transfer, condition, ...),
  - `mlIntents`, `conversationVariables`, `botStepConditions`, ...

A flat `unique-id` decomposition of a `BotVersion` produces one giant per-dialog file with hundreds of nested steps inside. That's only marginally easier to review than the original.

**Recipe — multi-rule decomposition.**

```json
{
  "metadataSuffixes": "bot",
  "strategy": "unique-id",
  "decomposedFormat": "xml",
  "overrides": [
    {
      "metadataTypes": ["bot"],
      "multiLevel": ["botDialogs:botDialogs:developerName", "botSteps:botSteps:type"]
    }
  ]
}
```

What this produces on disk for `Assessment_Bot/v1.botVersion-meta.xml`:

```
bots/
└── Assessment_Bot/
    ├── Assessment_Bot.bot-meta.xml          ← bot header (untouched)
    ├── v1/
    │   ├── botDialogGroups/
    │   │   ├── Alert_Items.botDialogGroups-meta.xml
    │   │   ├── Question_Items.botDialogGroups-meta.xml
    │   │   └── ...
    │   ├── botDialogs/
    │   │   ├── Welcome.botDialogs-meta.xml      ← per-dialog file
    │   │   └── Welcome/
    │   │       └── botSteps/
    │   │           ├── Collect.botSteps-meta.xml ← inner steps split out
    │   │           ├── Message.botSteps-meta.xml
    │   │           └── ...
    │   └── v1.botVersion-meta.xml               ← leaf-only outer wrapper
    └── ...
```

**Tweaking it for your bots.**

- If your dialog `developerName`s are non-unique across versions (rare), swap the first rule's UID list to `developerName,id`.
- If `botSteps` collide on `type` (very common — many `Message` steps in one dialog), add `stepIdentifier` as a tiebreaker: `botSteps:botSteps:stepIdentifier,type`.
- **Per-bot precision**: scope a rule to one component if a single bot needs different decomposition than the rest:

  ```json
  {
    "components": ["bot:Assessment_Bot"],
    "multiLevel": ["botDialogs:botDialogs:developerName", "botSteps:botSteps:stepIdentifier,type"]
  }
  ```

> **Agentforce vs Einstein.** Both share the `bot` suffix, so a single override entry covers both bot families. The structural difference (Agentforce uses richer `botFlowInvocation` and `genAi*` blocks where Einstein uses `botNavigation` and `mlIntents`) is invisible to this recipe — `multiLevel` rules only target the repeating sections that exist on each side.

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

| Metadata type                              | Suggested override                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `flow`                                     | `multiLevel: ["actionCalls:actionCalls:name", "decisions:decisions:name", "rules:rules:name"]`     |
| `globalValueSet`                           | `multiLevel: ["customValue:customValue:fullName"]` — handy when value sets have hundreds of picks. |
| `marketingappextension`                    | `multiLevel: ["activityDefinitions:activityDefinitions:apiName"]`                                  |
| `cmsDeliveryChannel` (and other CMS types) | `strategy: grouped-by-tag` plus `splitTags` for any wide repeatable tag.                           |
| `dashboard`                                | `multiLevel: ["components:components:title"]` — one file per dashboard widget.                     |

If a metadata type has a single deeply-nested repeatable block, a one-rule `multiLevel` is enough. Reach for the array form only when you have **two or more** distinct nested sections you want addressable on disk.

## The verification workflow

Always verify a new override before committing it:

```bash
# 1. Stash any uncommitted source first.
git stash --include-untracked

# 2. Decompose with the new override.
sf decomposer decompose -t bot --config

# 3. Recompose back from the decomposed tree.
sf decomposer recompose -t bot

# 4. Check the round-trip didn't drift.
sf decomposer verify -t bot --config
```

`sf decomposer verify` is non-destructive: it decomposes into a temp dir, recomposes from the temp dir, and compares the result to your committed source. If anything drifts (content, missing file, sibling reorder) it tells you exactly which paths broke. Treat any drift as a blocker — fix the override (or fall back to the previous one) before committing.

## Common pitfalls

**1. "I added two `multiLevel` rules but only one survived."**
You probably ran two `decompose` invocations back-to-back, one rule each. Don't. The disassembler rewrites `.multi_level.json` on every run, so each call replaces the prior one. Pass every rule for a given component in **one** override entry, in array form.

**2. "My `multiLevel` rule is correct but recompose produces a smaller file."**
Almost always a unique-id collision. Two array items resolved to the same filename and one overwrote the other on disk. Add a tiebreaker to `unique_id_elements` (e.g. `developerName,id`) and re-decompose with `prePurge: true`.

**3. "Component-scope override fields look ignored."**
Component-scope wins over type-scope, but only for fields **the component override explicitly sets**. Fields it leaves out fall through to the type-scope value, then to the run-wide default. If you set `decomposedFormat: "yaml"` on a type and `strategy: "grouped-by-tag"` on the component, the component still gets `decomposedFormat: "yaml"` from the type override.

**4. "Reassembly removed my decomposed directory even though I didn't pass `postPurge`."**
That's by design for `multiLevel` types only. Multi-level recompose has to clean up inner-level directories so the next level can merge their reassembled XML. If you want the decomposed tree preserved for inspection, copy it before running `recompose`.

**5. "Decompose succeeded but my decomposed files all have hash names."**
Your `unique_id_elements` (or the rule's third part) didn't resolve to a non-empty value on those items. Check the source XML for the elements you listed — names are case-sensitive and live at the immediate child level of each repeating item. The plugin only walks one level deep when picking a UID.

---

When in doubt: write the override, run `verify`, read the diff. Every recipe in this handbook was derived that way.
