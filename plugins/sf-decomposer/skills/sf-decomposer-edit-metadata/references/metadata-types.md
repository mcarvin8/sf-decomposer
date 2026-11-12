# Metadata types for sf-decomposer

The suffix goes to `-m` and appears in file names (`<Name>.<suffix>-meta.xml`).
The Metadata API name goes in `<name>` in a `package.xml`.

## Common types

| What                  | Suffix (`-m`)                 | Metadata API name (`package.xml`) | Folder                          |
| --------------------- | ----------------------------- | --------------------------------- | ------------------------------- |
| Permission set        | `permissionset`               | `PermissionSet`                   | `permissionsets/`               |
| Muting permission set | `mutingpermissionset`         | `MutingPermissionSet`             | `mutingpermissionsets/`         |
| Profile               | `profile`                     | `Profile`                         | `profiles/`                     |
| Custom labels         | `labels`                      | `CustomLabels`                    | `labels/`                       |
| Workflow              | `workflow`                    | `Workflow`                        | `workflows/`                    |
| Flow                  | `flow`                        | `Flow`                            | `flows/`                        |
| Sharing rules         | `sharingRules`                | `SharingRules`                    | `sharingRules/`                 |
| Custom application    | `app`                         | `CustomApplication`               | `applications/`                 |
| Lightning page        | `flexipage`                   | `FlexiPage`                       | `flexipages/`                   |
| Page layout           | `layout`                      | `Layout`                          | `layouts/`                      |
| Global value set      | `globalValueSet`              | `GlobalValueSet`                  | `globalValueSets/`              |
| Standard value set    | `standardValueSet`            | `StandardValueSet`                | `standardValueSets/`            |
| Translations          | `translation`                 | `Translations`                    | `translations/`                 |
| Assignment rules      | `assignmentRules`             | `AssignmentRules`                 | `assignmentRules/`              |
| Escalation rules      | `escalationRules`             | `EscalationRules`                 | `escalationRules/`              |
| Matching rules        | `matchingRule`                | `MatchingRules`                   | `matchingRules/`                |
| Queue                 | `queue`                       | `Queue`                           | `queues/`                       |
| Report type           | `reportType`                  | `ReportType`                      | `reportTypes/`                  |
| Bot (Einstein bot)    | `bot`                         | `Bot`                             | `bots/`                         |
| Loyalty program setup | `loyaltyProgramSetup`         | `LoyaltyProgramSetup`             | `loyaltyProgramSetups/`         |
| External service      | `externalServiceRegistration` | `ExternalServiceRegistration`     | `externalServiceRegistrations/` |

For labels, the `package.xml` member is `CustomLabels`, the single file that
holds every label.

Full list, including leaf-only types that have nothing to split:
<https://github.com/mcarvin8/sf-decomposer/blob/main/docs/METADATA_SUPPORT.md>

## Not supported

Edit these directly: custom objects (`object`) and their fields, Apex classes and
triggers, Visualforce, Lightning web components and Aura bundles, static
resources, and Experience Cloud sites.

## Layout notes

- **Labels**: one file per label, `labels/<fullName>.label-meta.xml`, directly in
  `labels/`. There is no per-component folder.
- **Bots**: each dialog gets a folder under `bots/<Bot>/<version>/botDialogs/`,
  and each step a file or folder under `botSteps/`. Don't edit
  `.multi_level.json`.
- **Loyalty program setup**: one folder per process under `programProcesses/`,
  with `parameters/` and `rules/` files. Recompose always removes the
  decomposed tree.
- **External service registration**: the `<schema>` is extracted to a sidecar
  `<Name>.yaml` file. Edit the YAML for schema changes.
- **Names**: file names come from the element's identifying value (for example
  `fullName`, `name`, `field`, `object`). Characters that aren't allowed in file
  names become `_`. When two siblings would get the same name, or no
  identifying value exists, the file is named with a content hash instead.
  Search contents, not just names, when a name looks like a hash.
- **Grouped-by-tag projects**: if a project decomposes with the `grouped-by-tag`
  strategy, all elements of a tag share one file (for example
  `fieldPermissions.xml`). Edit the element inside that file instead of looking
  for per-element files.
