# sf-decomposer Metadata Coverage Guide

This document provides a comprehensive breakdown of Salesforce metadata types from the [source-deploy-retrieve (SDR) registry](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json) and their support status in **sf-decomposer**.

## Overview

- **Supported Types**: Metadata types that sf-decomposer can decompose and recompose.
- **Leaf-Only Types**: Types with no nested decomposable elements—they contain only primitive values and cannot be broken down further.
- **Unsupported Types**: Types that sf-decomposer explicitly does not support, with reasons documented.

---

## ⚠️ Important: Salesforce Native Decomposition Conflict

Salesforce provides native metadata decomposition support for a limited set of metadata types. If you have opted into [Salesforce's decomposed metadata types](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_decomposed_md_types.htm), **do not use sf-decomposer on those same types**. Mixing both decomposition approaches will cause conflicts, version control issues, and potential deployment failures.

**Salesforce's supported decomposed types** (as of the current SFDX version):
- Custom Labels
- Workflows
- Profiles
- Permission Sets
- Muting Permission Sets
- AI Scoring Model Definition
- Decision Matrix Definition

**Recommended approach:**
- Use **Salesforce's native decomposition** if your org is on a recent CLI version and you want managed, built-in support.
- Use **sf-decomposer** if you need multi-level decomposition (e.g., Bots, Loyalty Program Setup), additional strategies (grouped-by-tag), or support for metadata types Salesforce doesn't decompose.
- **Never mix both** on the same metadata type in the same project.

For details on Salesforce's decomposed metadata types, see the [official documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_decomposed_md_types.htm).

---

## Supported Metadata Types (Fully Decomposable)

These metadata types have nested, repeatable elements and are fully supported by sf-decomposer. Use the **CLI value** (suffix) with the `-m` / `--metadata-type` flag.

| Metadata Type | CLI Value | Notes |
|---|---|---|
| **Custom Labels** | `labels` | Strategy overridden to `unique-id` (grouping by tag would be identical to the original file). |
| **Workflows** | `workflow` | Fully decomposable with workflow sub-types (alerts, field updates, rules, tasks, etc.). |
| **Profiles** | `profile` | Supports decomposition of permissions (applications, classes, fields, objects, pages, tabs, etc.). |
| **Permission Sets** | `permissionset` | Supports `--decompose-nested-permissions` with `grouped-by-tag` strategy for nested object and field permissions. |
| **Muting Permission Sets** | `mutingpermissionset` | Extends permission set metadata type; also supports nested permissions decomposition. |
| **AI Scoring Model Definition** | `aiScoringModelDefinition` | Contains versioned definitions with `aiScoringModelDefVersion` children. |
| **Decision Matrix Definition** | `decisionMatrixDefinition` | Decomposes decision matrix versions and rows. |
| **Bot** | `bot` | Multi-level decomposition: `botVersion` → `botDialogs` (by `developerName`) → `botSteps` (by `type`). Uses multiLevel defaults. |
| **Marketing App Extension** | `marketingappextension` | Decomposable with app extension elements. |
| **Loyalty Program Setup** | `loyaltyProgramSetup` | Multi-level decomposition: `programProcesses` → `parameters`/`rules`. Only supports `unique-id` strategy (grouped-by-tag is automatically overridden). Three-level layout: `programName` → `ruleName` or `parameterName`. |

### Multi-Level Decomposition Details

Two metadata types have automatic multi-level decomposition built in:

#### **Bot** (multi-level defaults)
```
bots/
└── My_Bot/
    ├── My_Bot.bot-meta.xml                  ← leaf properties
    └── botDialogs/
        ├── greeting_dialog/
        │   ├── greeting_dialog.botDialogs-meta.xml
        │   └── botSteps/
        │       ├── Message_1.botSteps-meta.xml
        │       ├── Navigation_1.botSteps-meta.xml
        │       └── Wait_1.botSteps-meta.xml
        └── farewell_dialog/
            └── ...
```
**Pattern:** `botDialogs:botDialogs:developerName`, `botSteps:botSteps:type`

#### **Loyalty Program Setup** (multi-level defaults)
```
loyaltyProgramSetups/
└── LoyaltyProgramSetup1/
    └── Member Enrollment Process/
        ├── Member Enrollment Process.programProcesses-meta.xml
        ├── parameters/
        │   └── fee.parameters-meta.xml
        └── rules/
            ├── Bulk Voucher Upload.rules-meta.xml
            ├── Finalize.rules-meta.xml
            └── Set Up Step.rules-meta.xml
```
**Pattern:** `programProcesses:programProcesses:parameterName,ruleName`

---

## Leaf-Only Metadata Types

Leaf-only types contain **no nested repeatable elements**—they consist entirely of primitive fields (strings, booleans, dates, etc.). sf-decomposer cannot decompose these types because there is nothing to break apart. When encountered during a decompose run, leaf-only files are skipped at `ERROR` log level (or `WARN` with `RUST_LOG=warn`).

These types are ignored by design; attempting to decompose them produces a no-op with a skip message.

### Apex & Code-Related (Content-Based, matchingContentFile adapter)
- **ApexClass** (`cls`) — Stored separately; contains .cls + .cls-meta.xml
- **ApexComponent** (`component`) — Stored separately; contains .component + .component-meta.xml
- **ApexPage** (`page`) — Stored separately; contains .page + .page-meta.xml
- **ApexTrigger** (`trigger`) — Stored separately; contains .trigger + .trigger-meta.xml
- **ApexTestSuite** (`testSuite`) — Contains only test configuration, no decomposable structure
- **ApexEmailNotifications** (`notifications`) — Configuration-only

### Bundled/Asset Types (Bundle adapter)
- **Aura Definition Bundle** (`auradefinitionbundle`) — Aura components stored as bundles
- **Lightning Component Bundle** (`lightningcomponentbundle`) — LWC stored as bundles
- **Static Resource** (`staticresource`) — Binary/archive content
- **Lightning Web Component** (LWC) — Package structure with .js, .html, .css, etc.

### Digital Experience & UI Bundles (digitalExperience / bundle adapters)
- **Digital Experience Bundle** (`digitalexperiencebundle`) — Complex bundle structure
- **Experience Bundle** (`experiencebundle`) — Site/portal experiences
- **Wave Template Bundle** (`wavetemplatebundle`) — Analytics templates
- **Custom Site** (`customsite`) — Sites structure
- **SiteDotCom** (`sitedotcom`) — SiteDotCom sites
- **UI Bundle** (`uibundle`) — Composite UI experiences

### Workflow Sub-Types (Child types via matchingContentFile)
> **Note:** Workflow sub-types should always be accessed via the parent `workflow` type, not individually.
- **Workflow Alert** (`workflowalert`)
- **Workflow Field Update** (`workflowfieldupdate`)
- **Workflow Flow Action** (`workflowflowaction`)
- **Workflow Knowledge Publish** (`workflowknowledgepublish`)
- **Workflow Outbound Message** (`workflowoutboundmessage`)
- **Workflow Rule** (`workflowrule`)
- **Workflow Send** (`workflowsend`)
- **Workflow Task** (`workflowtask`)

### Custom Object Sub-Types (Child types)
> **Note:** Custom Object types must be accessed via parent type; individual sub-types are not supported.
- **Assignment Rule** (`assignmentrule`) — Inside AssignmentRules
- **Business Process** (`businessprocess`) — Inside CustomObject
- **Compact Layout** (`compactlayout`) — Inside CustomObject
- **Custom Field** (`customfield`) — Inside CustomObject
- **Escalation Rule** (`escalationrule`) — Inside EscalationRules
- **Field Set** (`fieldset`) — Inside CustomObject
- **Index** (`index`) — Inside CustomObject
- **List View** (`listview`) — Inside CustomObject
- **Record Type** (`recordtype`) — Inside CustomObject
- **Validation Rule** (`validationrule`) — Inside CustomObject
- **Web Link** (`weblink`) — Inside CustomObject
- **Auto Response Rule** (`autoresponserule`) — Inside AutoResponseRules
- **Matching Rule** (`matchingrule`) — Inside MatchingRules

### Configuration & Settings Types
- **Account Forecast Settings** (`accountforecastsettings`)
- **Accounting Field Mapping** (`accountingfieldmapping`)
- **Accounting Model Config** (`accountingmodelconfig`)
- **Accounting Plan Obj Measure Calc Definition** (`accountplanobjmeascalcdef`)
- **Account Relationship Share Rule** (`accountrelationshipsharerule`)
- **AcctMgr Target Settings** (`acctmgrtargetsettings`)
- **Actionable Event Orch Definition** (`actionableeventorchdef`)
- **Actionable Event Type Definition** (`actionableeventtypedef`)
- **Actionable List Definition** (`actionablelistdefinition`)
- **Action Launcher Item Definition** (`actionlauncheritemdef`)
- **Action Link Group Template** (`actionlinkgrouptemplate`)
- **Action Plan Template** (`actionplantemplate`)
- **Activation Platform** (`activationplatform`)
- **AI Application** (`aiapplication`)
- **AI Application Config** (`aiapplicationconfig`)
- **AI Agent Scorer Definition** (`aiagentscorerdefinition`)
- **AI Assistant Template** (`aiassistanttemplate`)
- **AI Response Format** (`airesponseformat`)
- **AI Surface** (`aisurface`)
- **AI Testing Definition** (`aitestingdefinition`)
- **AI Use Case Definition** (`aiusecasedefinition`)
- **Analytic Snapshot** (`analyticsnapshot`)
- **Animation Rule** (`animationrule`)
- **App Menu** (`appmenu`)
- **Appointment Assignment Policy** (`appointmentassignmentpolicy`)
- **Appointment Scheduling Policy** (`appointmentschedulingpolicy`)
- **Application Record Type Config** (`applicationrecordtypeconfig`)
- **Application Subtype Definition** (`applicationsubtypedefinition`)
- **Asset** (Content Asset, `asset`)
- **Auth Provider** (`authprovider`)
- **Batch Calc Job Definition** (`batchcalcjobdefinition`)
- **Batch Process Job Definition** (`batchprocessjobdefinition`)
- **Benefit Action** (`benefitaction`)
- **Bot Block** (`botblock`)
- **Bot Template** (`bottemplate`)
- **Branding Set** (`brandingset`)
- **Briefcase Definition** (`briefcasedefinition`)
- **Building Energy Intensity Config** (`bldgenrgyintensitycnfg`)
- **Business Process Feedback Configuration** (`businessprocessfeedbackconfiguration`)
- **Business Process Group** (`businessprocessgroup`)
- **Business Process Type Definition** (`businessprocesstypedefinition`)
- **Cache Partition** (Platform Cache Partition, `cachePartition`)
- **Call Center** (`callcenter`)
- **Call Center Routing Map** (`callcenterroutingmap`)
- **Call Coaching Media Provider** (`callcoachingmediaprovider`)
- ... and many more settings/configuration types

---

## Unsupported Metadata Types

### Category 1: Unsupported Adapter Strategies

The following types use SDR adapter strategies that sf-decomposer does not support. These types are explicitly rejected with a clear error message:

| Strategy | Types Using This Strategy |
|---|---|
| **`matchingContentFile`** | ApexClass, ApexComponent, ApexPage, ApexTrigger, and their workflow equivalents. These map code content to separate files (.cls, .component, .page, .trigger). They require specialized handling beyond XML decomposition. |
| **`bundle`** | Aura Definition Bundle, Lightning Component Bundle, Static Resource, and other bundle-structured metadata types. Bundles contain multiple files in a directory structure; decomposing the XML wrapper alone would break the bundle integrity. |
| **`digitalExperience`** | Digital Experience Bundle, Experience Bundle, Site definitions, etc. These types have complex multi-file structures that include assets, configurations, and templates in a unified bundle. |
| **`mixedContent`** | Types combining XML metadata with binary/text content files. These require special handling to preserve both the structure and content. |

**Error message when attempting unsupported strategies:**
```
Metadata types with [matchingContentFile, digitalExperience, mixedContent, bundle] strategies are not supported by this plugin.
```

### Category 2: Custom Objects (Not Supported)

- **Custom Object** (`object`) — Custom objects are not decomposable as a whole type. Individual sub-components (fields, validation rules, record types, etc.) are stored and versioned separately. To manage custom object components, version control the individual components (e.g., custom fields, validation rules) rather than the object definition itself.

**Error message:**
```
Custom Objects are not supported by this plugin.
```

### Category 3: Child Types & Invalid Suffixes

Attempting to use child type suffixes (e.g., `field`, `recordType`, `validationrule`) directly will fail. These types must be accessed through their parent types:

- **Custom Field** → Use `customobject` (fields are part of custom objects)
- **Record Type** → Use `customobject` (accessed as children)
- **Workflow Rule** → Use `workflow` (accessed as children)
- **Assignment Rule** → Use `assignmentrules` (accessed as children)

**Error message:**
```
Metadata type not found for the given suffix: field.
```

### Category 4: Folder-Based Types (Partially Limited)

Folder-based metadata types (e.g., `report`, `dashboard`, `document`, `email`) are supported but require folder-level scoping due to SDR architecture. These types:
- Are scoped at the **folder level**, not individual component level
- Can be decomposed/recomposed but with `--manifest` or component-scope overrides for fine-grained control
- Have the unit of decomposition as the **folder** (e.g., `report:MyFolder`), not individual reports

Examples (supported but folder-scoped):
- **Report** (`report`)
- **Dashboard** (`dashboard`)
- **Document** (`document`)
- **Email Template** (`email`)
- **Document Folder** (`documentfolder`)
- **Dashboard Folder** (`dashboardfolder`)

---

## Special Cases & Exceptions

### Child Types via Parent Decomposition

When you decompose a parent type, child types are automatically included:

- **Workflow** includes: alerts, field updates, flow actions, knowledge publishes, outbound messages, rules, sends, tasks
- **CustomObject** includes: fields, validation rules, record types, list views, compact layouts, business processes, field sets, sharing reasons, web links, custom field translations, indexes
- **AssignmentRules** includes: assignment rule items
- **AutoResponseRules** includes: auto response rule items
- **EscalationRules** includes: escalation rule items
- **MatchingRules** includes: matching rule items

### The `botVersion` Exception

`botVersion` should **never** be used directly. Instead, use the parent `bot` type:
```
sf decomposer decompose -m "bot"
```
Attempting to use `botVersion` directly will fail with:
```
botVersion suffix should not be used. Please use bot to decompose/recompose bot and bot version files.
```

---

## Decomposition Strategy Support

| Metadata Type | `unique-id` Strategy | `grouped-by-tag` Strategy | Notes |
|---|---|---|---|
| Custom Labels | ✅ Yes (forced) | ⚠️ Overridden to unique-id | Grouping by tag is semantically identical to the original, so it's forced to `unique-id`. |
| Workflows | ✅ Yes | ✅ Yes | Both strategies work; workflows decompose well with either approach. |
| Profiles | ✅ Yes | ✅ Yes | Supports both strategies; nested permissions can be further split with `--decompose-nested-permissions`. |
| Permission Sets | ✅ Yes | ✅ Yes | Supports both; nested permissions decomposition available with `grouped-by-tag` + `--decompose-nested-permissions`. |
| Muting Permission Sets | ✅ Yes | ✅ Yes | Same as Permission Sets. |
| AI Scoring Model Definition | ✅ Yes | ✅ Yes | Decomposes versions and rows. |
| Decision Matrix Definition | ✅ Yes | ✅ Yes | Decomposes definitions and versions. |
| Bot | ✅ Yes | ✅ Yes | Multi-level decomposition applied regardless of strategy; `multiLevel` defaults always active. |
| Marketing App Extension | ✅ Yes | ✅ Yes | Both strategies supported. |
| Loyalty Program Setup | ✅ Yes (forced) | ⚠️ Overridden to unique-id | Only `unique-id` is supported; `grouped-by-tag` is automatically overridden. Multi-level decomposition is applied by default. |

---

## File Formats

sf-decomposer supports decomposing to multiple file formats. The choice of format does not affect which metadata types can be decomposed—only the output file extension:

| Format | Extension | Notes |
|---|---|---|
| XML (default) | `.xml` | Native Salesforce format; 1:1 with SDR. |
| JSON | `.json` | Strict JSON output. |
| YAML | `.yaml` | Human-friendly YAML format. |
| JSON5 | `.json5` | Relaxed JSON (comments, trailing commas, unquoted keys). |

Format is **not** tied to strategy; both `unique-id` and `grouped-by-tag` work with any format.

---

## Configuration & Overrides

### Per-Type Configuration

Set different strategies, formats, or nested-permission settings per metadata type:

```json
{
  "metadataSuffixes": "labels,workflow,profile,flow,permissionset",
  "strategy": "unique-id",
  "decomposedFormat": "xml",
  "overrides": [
    {
      "metadataTypes": ["flow"],
      "decomposedFormat": "yaml"
    },
    {
      "metadataTypes": ["permissionset", "mutingpermissionset"],
      "strategy": "grouped-by-tag",
      "decomposeNestedPermissions": true
    }
  ]
}
```

### Per-Component Configuration

Scope overrides to specific components using the `<suffix>:<fullName>` syntax:

```json
{
  "overrides": [
    {
      "components": ["permissionset:HR_Admin", "permissionset:Big_PermSet"],
      "strategy": "grouped-by-tag",
      "decomposeNestedPermissions": true
    }
  ]
}
```

---

## Manifest-Scoped Runs

Decompose or recompose only the metadata listed in a manifest:

```bash
sf decomposer decompose -x "manifest/package.xml"
sf decomposer recompose -x "manifest/package.xml"
```

Manifest entries specify the component fullName and type:

```xml
<types>
  <members>HR_Admin</members>
  <name>PermissionSet</name>
</types>
<types>
  <members>Case</members>
  <name>Workflow</name>
</types>
```

Unsupported types in the manifest are silently skipped with a warning.

---

## Logging & Debugging

### Rust Log Levels

The underlying Rust disassembler logs through `env_logger`. Set `RUST_LOG` to control verbosity:

```bash
RUST_LOG=error sf decomposer decompose -m "flow"  # Default; shows errors and skipped files
RUST_LOG=warn sf decomposer decompose -m "flow"   # Shows sibling-collision warnings
```

#### What Each Level Shows

| Level | Content |
|---|---|
| **error** (default) | Parse errors and skipped files (leaf-only XML files). |
| **warn** | Sibling-collision fallback signals (when unique-id fields are too narrow, files fall back to SHA-256 hashes). |

---

## Quick Reference: Supported vs. Unsupported

### ✅ Always Supported (Fully Decomposable)
- Custom Labels
- Workflows
- Profiles
- Permission Sets
- Muting Permission Sets
- AI Scoring Model Definition
- Decision Matrix Definition
- Bot (with multi-level)
- Marketing App Extension
- Loyalty Program Setup (with multi-level)

### ⚠️ Leaf-Only (No-Op)
- ApexClass, ApexComponent, ApexPage, ApexTrigger
- Aura Bundles, LWC
- Static Resources
- Digital Experience Bundles
- All configuration/settings-only types
- Workflow sub-types (use parent `workflow` instead)
- Custom object sub-types (use parent `customobject` instead)

### ❌ Never Supported
- Custom Objects (as a whole)
- Types with `matchingContentFile` adapter strategy (code-based types)
- Types with `bundle` adapter strategy (bundle structures)
- Types with `digitalExperience` adapter strategy
- Types with `mixedContent` adapter strategy
- Child type suffixes when used directly (use parent types)
- `botVersion` directly (use `bot`)

---

## Summary Table

| Category | Count | Examples |
|---|---|---|
| **Fully Supported** | 10 | Labels, Workflow, Profile, PermissionSet, Bot, LoyaltyProgramSetup, etc. |
| **Leaf-Only (No Decomposition Needed)** | 500+ | ApexClass, LWC, StaticResource, Settings types, etc. |
| **Unsupported (Rejected)** | ~150+ | Types using matchingContentFile, bundle, digitalExperience, mixedContent strategies |
| **Child Types (Decompose via Parent)** | 30+ | Custom object sub-types, workflow sub-types, rule items |

---

## For More Information

- **SDR Metadata Registry:** [source-deploy-retrieve/metadataRegistry.json](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/src/registry/metadataRegistry.json)
- **sf-decomposer Repository:** [mcarvin8/sf-decomposer](https://github.com/mcarvin8/sf-decomposer)
- **Admin Handbook:** [sf-decomposer HANDBOOK.md](https://github.com/mcarvin8/sf-decomposer/blob/main/HANDBOOK.md)
- **README:** [sf-decomposer README.md](https://github.com/mcarvin8/sf-decomposer/blob/main/README.md)
