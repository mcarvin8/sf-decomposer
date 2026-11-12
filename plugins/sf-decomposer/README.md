# sf-decomposer for Claude Code

Work with large Salesforce metadata files (permission sets, profiles, custom
labels, workflows, flows) as small, focused pieces.

## Skills

| Skill                         | What it does                                                                                                                                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sf-decomposer-edit-metadata` | Reads, compares, or changes large metadata files. Your coding agent splits only the files it needs into one small file per element, works on those, then rebuilds the originals so only the intended change remains. |
| `sf-decomposer-setup`         | Sets up sf-decomposer in a Salesforce DX project: types, strategy and format, a round-trip check, `.sfdecomposer.config.json`, `.forceignore`, `.gitattributes`, and a recompose hook.                               |

Both run the [`sf-decomposer-core`](https://www.npmjs.com/package/sf-decomposer-core)
command with `npx`. It needs no Salesforce CLI and no plugin install.

## Install

```text
/plugin marketplace add mcarvin8/sf-decomposer
/plugin install sf-decomposer@sf-decomposer
```

### Other coding agents

The skills are standard [Agent Skills](https://agentskills.io), so GitHub
Copilot and other coding agents can use them too:

```sh
# GitHub Copilot CLI (reads the same marketplace files)
copilot plugin marketplace add mcarvin8/sf-decomposer
copilot plugin install sf-decomposer@sf-decomposer

# Any agent, with the skills CLI
npx skills add mcarvin8/sf-decomposer

# Any agent, with the GitHub CLI
gh skill install mcarvin8/sf-decomposer --agent github-copilot
```

## Requirements

- Node.js 22.19 or newer
- A Salesforce DX project (a folder with `sfdx-project.json`)

## Try it

- "Give the Sales Ops permission set read access to Account.Industry"
- "Which permission sets can edit Opportunity.Amount?"
- "Remove every reference to the oldns package from our profiles and permission sets"
- "Compare the Support Agent and Support Lead permission sets"
- "Set up sf-decomposer for our permission sets and profiles"

## Data handling

The skills read and write metadata files in your local Salesforce DX project and
never connect to a Salesforce org. They send nothing anywhere except what your
coding agent itself reads. Both skills download the `sf-decomposer-core` package from the npm
registry through `npx`. sf-decomposer runs no service and keeps nothing.

`sf-decomposer-edit-metadata` writes a temporary `package.xml` to a temporary folder outside
your project and deletes it afterwards. In projects that don't use
sf-decomposer, it removes the split files when it finishes, so your project
layout doesn't change.

## More

Strategies, supported metadata, and configuration:
<https://github.com/mcarvin8/sf-decomposer#readme>
