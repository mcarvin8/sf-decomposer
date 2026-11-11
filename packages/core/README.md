# sf-decomposer-core

[sf-decomposer](https://github.com/mcarvin8/sf-decomposer) without the Salesforce CLI: a standalone `sf-decomposer` command and a programmatic API that decompose large Salesforce metadata XML files into smaller, version-control-friendly files and recompose them for deployment.

Use this package when you don't have, or don't want, the Salesforce CLI and an unsigned plugin install: in scripts, in CI images, or for coding agents. Use [sf-decomposer](https://www.npmjs.com/package/sf-decomposer) for the `sf decomposer` CLI plugin and its retrieve/deploy hooks, and the [GitHub Action](https://github.com/marketplace/actions/sf-decomposer) for GitHub workflows.

All three are built from the same source and released with the same version number. Commands, flags, `.sfdecomposer.config.json`, and output are identical.

Requires Node.js 22.19 or later. Its only dependency is [config-disassembler](https://www.npmjs.com/package/config-disassembler), which ships prebuilt native binaries for macOS, Linux, and Windows.

## Command line

Run it inside a Salesforce DX project (a folder with `sfdx-project.json`, or below one):

```bash
npx sf-decomposer-core decompose -m flow -m permissionset
npx sf-decomposer-core recompose -m flow -m permissionset --postpurge
npx sf-decomposer-core verify -m permissionset
```

Or install it and call `sf-decomposer` directly:

```bash
npm install --save-dev sf-decomposer-core
npx sf-decomposer decompose --config
```

| Command                   | What it does                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `sf-decomposer decompose` | Split large metadata files into smaller files. Run after retrieving metadata.                   |
| `sf-decomposer recompose` | Rebuild deployment-ready metadata files from decomposed files. Run before deploying.            |
| `sf-decomposer verify`    | Check in a temporary directory that a round trip preserves your metadata. Exits 1 on any drift. |

Each command takes the same flags as `sf decomposer <command>` (for example `-m`, `-x`, `-f`, `-s`, `-p`, `-c`, `--prepurge`, `--postpurge`), plus `--json` to print the result as JSON. Run `sf-decomposer <command> --help` for the list. See the [sf-decomposer README](https://github.com/mcarvin8/sf-decomposer#readme) for strategies, supported metadata, `.forceignore`, and config file options.

## Programmatic API

```ts
import { decomposeMetadataTypes, recomposeMetadataTypes, verifyMetadataTypes } from 'sf-decomposer-core';

const log = (msg: string) => console.log(msg);

await decomposeMetadataTypes({
  metadataTypes: ['flow', 'permissionset'],
  format: 'xml',
  strategy: 'unique-id',
  prepurge: false,
  postpurge: false,
  decomposeNestedPerms: false,
  log,
});

const { drift } = await verifyMetadataTypes({
  metadataTypes: ['permissionset'],
  format: 'xml',
  strategy: 'unique-id',
  decomposeNestedPerms: false,
  log,
});
```

Paths resolve from `sfdx-project.json` found at or above `process.cwd()`. To apply `.sfdecomposer.config.json` the same way `--config` does, pass your inputs through `resolveDecomposeOptions`, `resolveRecomposeOptions`, or `resolveVerifyOptions` first.

The package is ESM-only.

## License

MIT. Bundled third-party material (Salesforce's metadata registry from `@salesforce/source-deploy-retrieve`, Apache-2.0) is listed in `THIRD_PARTY_NOTICES.md`.
