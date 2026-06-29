# Configuration Reference

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

| Field                        | Notes                                                                                                                                                                                                                                                                             |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `metadataTypes`              | Optional (required if `components` is omitted). Array of metadata suffixes (same vocabulary as `--metadata-type` / `metadataSuffixes`). Each suffix may appear in at most one override.                                                                                           |
| `components`                 | Optional (required if `metadataTypes` is omitted). Array of `<metadataSuffix>:<fullName>` keys (e.g. `permissionset:HR_Admin`, `report:MyFolder/MyReport`). Each component may appear in at most one override.                                                                    |
| `decomposedFormat`           | `xml` \| `json` \| `json5` \| `yaml`.                                                                                                                                                                                                                                             |
| `strategy`                   | `unique-id` \| `grouped-by-tag`. Hard rules still win — `labels`, `loyaltyProgramSetup`, and `externalServiceRegistration` are always treated as `unique-id`.                                                                                                                     |
| `decomposeNestedPermissions` | Only applies to `permissionset` / `mutingpermissionset` with `grouped-by-tag`. Sets a known-good `splitTags` default; ignored if `splitTags` is also set in the same scope.                                                                                                       |
| `splitTags`                  | Custom `splitTags` spec for `grouped-by-tag` strategy. See [splitTags grammar](#splittags-grammar). Ignored when the resolved strategy is not `grouped-by-tag`.                                                                                                                   |
| `multiLevel`                 | One or more `multiLevel` specs for nested-array decomposition. Pass a string, a `string[]`, or a `;`-separated string. See [multiLevel grammar](#multilevel-grammar). When set, replaces the hardcoded `loyaltyProgramSetup` default for the targeted scope.                      |
| `uniqueIdElements`           | Comma-separated list of XML element names (or compound `+`-joined keys) used to derive stable filenames for `unique-id` decomposition. When set, replaces the built-in per-type registry entry for the targeted scope. See [uniqueIdElements grammar](#uniqueidelements-grammar). |
| `sidecarElements`            | Comma-separated `element:extension` pairs. Text content of each named XML element is extracted to a typed companion file during decomposition and reinjected automatically during recompose. `externalServiceRegistration` defaults to `"schema:yaml"` — set this to override or disable (not yet supported; omit to accept the default). See [sidecarElements grammar](#sidecarElements-grammar). |
| `prePurge`                   | Per-scope prePurge (decompose). Component-scope `prePurge` only purges the named component's decomposed directory.                                                                                                                                                                |
| `postPurge`                  | Per-scope postPurge (decompose: remove originals after decomposing).                                                                                                                                                                                                              |

Run-scope options (`metadataSuffixes`, `manifest`, `ignorePackageDirectories`) are **not** valid inside an override; the plugin will throw if they are present.

### Component key conventions

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
4. Hard plugin rules (e.g. `labels`, `loyaltyProgramSetup`, and `externalServiceRegistration` forced to `unique-id`) override all of the above.

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
> **Pass all rules at once.** Sequential single-rule decomposes rewrite `.multi_level.json` and only the last rule survives — bundle every rule for a given component into one override. Use [`sf decomposer verify`](./README.md#sf-decomposer-verify) to confirm a new config round-trips before committing it.

### uniqueIdElements grammar

`uniqueIdElements` lets you specify which XML element names the disassembler crate uses to derive stable, human-readable filenames during `unique-id` decomposition. The plugin ships with a built-in registry covering the most common metadata types ([`src/metadata/uniqueIdElements.ts`](https://github.com/mcarvin8/sf-decomposer/blob/main/src/metadata/uniqueIdElements.ts)); use this override when a type is missing from the registry or when the built-in selection produces collisions for your org's data.

**When to use:**

- A metadata type released after the last plugin update is not in the built-in registry and produces SHA-256 hash filenames (`abc1234.mytype-meta.xml`) instead of readable ones.
- You see `RUST_LOG=warn` collision warnings for an existing type and want to add a tiebreaker compound key without waiting for a plugin release.
- You want to replace the built-in element list for a specific type or component with a narrower or wider set.

**Spec:** Comma-separated list of element names. Each entry is either a simple name or a compound key whose fields are joined by `+`. The disassembler tries each entry in order; the first one that resolves to a non-empty, unique value within the parent element wins. The global defaults `fullName` and `name` are always prepended regardless — you do not need to include them.

```
<element>[+<element>...][,<element>[+<element>...]...]
```

**Error behavior:**

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

### sidecarElements grammar

`sidecarElements` extracts the text content of specific XML elements into typed companion files alongside the decomposed XML shards — and reinserts them automatically on recompose. The primary use case is metadata types whose XML embeds large text blobs (e.g. YAML or JSON schema documents) that diff poorly inside XML.

**Built-in default:** `externalServiceRegistration` always applies `"schema:yaml"` unless the override explicitly sets a different value. No config change is required to activate sidecar extraction for ESR.

**Spec:** Comma-separated `element:extension` pairs. Each pair names the XML element whose text content should be extracted and the file extension of the companion file. Each element name may appear at most once in the spec.

```
<element>:<extension>[,<element>:<extension>...]
```

**What happens on decompose:**

1. Each named element's text content is written to `<componentBasename>.<extension>` alongside the decomposed XML shards.
2. The element tag is replaced with an empty placeholder in the decomposed XML.
3. A `.sidecars.json` manifest is written inside the disassembled directory so recompose can auto-detect which elements were extracted.

**What happens on recompose:**

Recompose reads `.sidecars.json` automatically — no `sidecarElements` flag is needed. The companion file content is reinjected into the correct element before the XML is written.

**Format conversion:** If the declared extension is `yaml` and the companion file contains valid YAML, it is transparently round-tripped (YAML → JSON internally → YAML on write). JSON extensions are treated analogously. The content is always reinjected verbatim if no conversion applies.

**Examples:**

```json
"overrides": [
  {
    "metadataTypes": ["externalServiceRegistration"],
    "sidecarElements": "schema:yaml"
  }
]
```

> **Note:** `externalServiceRegistration` applies `"schema:yaml"` by default. An explicit override is only needed if you want a different extension (e.g. `"schema:json"`) or if a future metadata type requires similar treatment.

### Opting in from the CLI

CLI users can opt into overrides on `decompose` with the boolean `--config` (`-c`) flag. When set, the plugin reads `.sfdecomposer.config.json` from the repo root (the nearest ancestor directory that contains `sfdx-project.json`):

```bash
sf decomposer decompose -m "flow" -m "permissionset" -c
```

When `--config` is set, **only** the `overrides` array is consumed from the file. Top-level fields like `decomposedFormat`, `strategy`, `metadataSuffixes`, etc. are ignored — the CLI flags remain the source of truth for run-wide values. This keeps direct CLI behavior predictable and lets you reuse the same config file as the post-retrieve hook without any surprises.

If `--config` is set but `.sfdecomposer.config.json` is missing from the repo root, the command fails with a clear error.

`recompose` does not accept `--config` because it does not need the override information — format is auto-detected from the decomposed files on disk and recompose does not depend on strategy.

The post-retrieve hook automatically picks up `overrides` from `.sfdecomposer.config.json` — no extra setup required. Existing config files without an `overrides` field continue to behave exactly as before.
