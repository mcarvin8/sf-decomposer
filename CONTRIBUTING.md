# Contributing to sf-decomposer

Contributions are welcome. This guide covers how to set up your environment, run tests, and submit changes.

---

## Requirements

- **Node.js** ≥ 22.19
- **npm** (package manager)

---

## Getting Started

### 1. Fork and clone

Fork the [repository](https://github.com/mcarvin8/sf-decomposer) and clone your fork locally.

### 2. Install dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

Rebuild after source changes when you want to run or test the plugin locally.

### 4. Link for local testing (optional)

From the repo root:

```bash
sf plugins link
```

Then use `sf decomposer` in a Salesforce DX project to test your changes.

---

## Development Workflow

### Lint and format

- **Lint:** `npm run lint` (runs Biome check on `src` and `test`)
- **Format:** `npm run format` (runs Biome formatter on source and test files)
- **Dependency lint:** `npm run lint:dependencies` (runs Knip to detect unused exports and dependencies)

Fix lint/format issues before submitting a PR.

### Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint and Husky. Use a supported type and scope where it helps:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` build, tooling, dependencies
- `test:` tests only
- `refactor:` code change that is not a fix or feature

Example: `feat(decompose): add support for custom metadata type X`

---

## Testing

### Unit tests

Run unit tests (with coverage). New code should maintain 100% coverage (enforced by Vitest + V8).

```bash
npm run test:only
```

### Non-unit (NUT) tests

Run the non-unit tests to verify CLI commands:

```bash
npm run test:nuts
```

### Full test pipeline

The default `npm test` runs the full pipeline (compile, lint, unit tests). Use it before pushing.

### Mutation testing

This plugin runs [Stryker](https://stryker-mutator.io/) over `src/` to keep the unit-test suite honest. Two modes are supported:

- **Incremental (PR jobs):** `npm run test:mutation:incremental` — runs Stryker only against files changed in the current diff (the workflow in `.github/workflows/mutation.yml` invokes this on every pull request).
- **Full (on demand):** `npm run test:mutation` — full suite; published to the [Stryker Dashboard](https://dashboard.stryker-mutator.io/reports/github.com/mcarvin8/sf-decomposer/main) via `workflow_dispatch` with `full: true`.

Local runs honor the `commands/` and `hooks/` exclusions (those folders are only meaningfully exercised by NUTs, which Stryker does not run). The current mutation badge in the README reflects the last `main` run.

When adding new code, prefer making genuinely unreachable branches `/* istanbul ignore next -- @preserve: <reason> */` so future mutation runs surface them as expected gaps rather than as new survivors.

> Note: the list of documented mutation-survivor gaps was removed after the vitest 5 upgrade destabilized Stryker's results. It will be regenerated once Stryker is stable again on the new vitest version.

---

## Code and Architecture

### Source layout

```
src/
├── action/                     # GitHub Action entry point — mirrors the CLI 1:1, no plugin/CLI install needed
│   ├── decompose.ts
│   ├── index.ts
│   ├── inputs.ts                # maps action inputs to the same flags the CLI commands accept
│   ├── main.ts
│   ├── recompose.ts
│   └── verify.ts
├── commands/decomposer/        # oclif entry points — parse flags, call core, nothing else
│   ├── decompose.ts
│   ├── recompose.ts
│   └── verify.ts
├── core/                       # orchestration — walks package dirs, applies manifest filter, fans out to service
│   ├── decomposeMetadataTypes.ts
│   ├── recomposeMetadataTypes.ts
│   └── verifyMetadataTypes.ts
├── helpers/                    # cross-cutting utilities
│   ├── configOverrides.ts      # parses .sfdecomposer.config.json; resolves per-type/per-component precedence
│   ├── constants.ts
│   ├── pLimit.ts               # in-house concurrency limiter
│   └── types.ts                # shared TypeScript interfaces
├── hooks/                      # sf CLI lifecycle hooks
│   ├── prerun.ts               # recompose hook (fires before sf project deploy start / validate)
│   └── scopedPostRetrieve.ts   # decompose hook (fires after sf project retrieve start)
├── metadata/                   # SDR registry integration
│   ├── getMultiLevelDefault.ts
│   ├── getPackageDirectories.ts
│   ├── getRegistryValuesBySuffix.ts
│   ├── getUniqueIdElements.ts
│   ├── listParentXmlFiles.ts   # finds decomposable parent XML files under a package dir
│   ├── multiLevelDefaults.ts   # built-in multiLevel rules for bot and loyaltyProgramSetup
│   ├── parseManifest.ts        # package.xml → filtered component list
│   ├── registry/               # vendored SDR registry + manifest/XML parsing (no SDR runtime dependency)
│   │   ├── manifestXml.ts
│   │   ├── metadataRegistry.json
│   │   ├── registryAccess.ts
│   │   ├── resolveManifestComponents.ts
│   │   ├── types.ts
│   │   └── xmlParser.ts
│   └── uniqueIdElements.ts     # per-suffix unique ID element overrides (edit here to add a new type)
└── service/                    # per-file work delegated by core
    ├── core/
    │   ├── getRepoRoot.ts
    │   ├── moveFiles.ts
    │   ├── updateForceignore.ts   # keeps .forceignore in sync with decomposed output patterns
    │   └── updateGitattributes.ts # keeps .gitattributes in sync with decomposed output patterns
    ├── decompose/
    │   ├── customLabels.ts         # labels-specific pre/post purge logic
    │   ├── decomposeFileHandler.ts # calls config-disassembler-node per file
    │   ├── renameWorkflows.ts      # renames workflow sub-type files after decompose
    │   └── resolveEffectiveDisassembleOptions.ts # applies hard plugin rules over user-provided strategies
    ├── recompose/
    │   ├── deleteFilesinDirectory.ts
    │   ├── reassembleLabels.ts
    │   ├── recomposeFileHandler.ts # calls config-disassembler-node per file
    │   └── renameBotVersionFiles.ts
    └── verify/
        └── diffDirectories.ts      # structural XML equality comparison (order-agnostic)
```

### Metadata and SDR

Metadata attributes (except unique-ID elements) come from `src/metadata/registry/metadataRegistry.json`, a vendored snapshot of **@salesforce/source-deploy-retrieve**'s (SDR) metadata registry. The `-m` / `--metadata-type` flag uses the metadata **suffix** from that registry. SDR itself is not a runtime dependency — `src/metadata/registry/registryAccess.ts` reimplements the lookups this plugin needs against the vendored file, and `src/metadata/registry/` parses package.xml manifests without an external XML library.

A weekly workflow ([`sync-metadata-registry.yml`](.github/workflows/sync-metadata-registry.yml)) diffs the vendored registry against the latest published SDR version and opens a PR when it drifts, refreshing `METADATA_SUPPORT.md` in the same PR. It does not auto-merge — review and merge like any other PR.

### Unique ID elements

Unique ID elements name the decomposed files emitted by the `unique-id` strategy. The file that holds leaf elements keeps the original metadata file name.

- **Defaults:** `fullName` and `name`, for every metadata type.
- **Overrides:** Edit `src/metadata/uniqueIdElements.ts`, keyed by the metadata type's **suffix**. Compound keys (e.g. `field1+field2`) join values with `__`.
- **Fallback:** When no unique ID resolves, the plugin uses an 8-character SHA-256 hash of the element content. When two siblings would collide on the same id after sanitization, every member of the colliding group falls back to a hash and emits a `WARN` line (see [Filename safety](./README.md#filename-safety-unique-id) in the README).

### Config disassembler

The actual decompose/recompose work lives in **[config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node)** (a Rust crate behind a Node binding). This plugin focuses on Salesforce metadata wiring — package dirs, SDR, strategies, override resolution.

- **Where it's called:** `src/service/decompose/decomposeFileHandler.ts` and `src/service/recompose/recomposeFileHandler.ts`. Override resolution happens per-file in `src/helpers/configOverrides.ts`, so different components of the same metadata type can be decomposed with different strategies/formats in one run.
- **Changing XML decompose/recompose behavior:** contribute in [config-disassembler](https://github.com/mcarvin8/config-disassembler) (Rust) and/or [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node).

Dependabot bumps config-disassembler-node weekly.

### GitHub Action image

`decompose`/`recompose`/`verify` also ship as a container [GitHub Action](./action.yml) (`src/action/`), built from the [`Dockerfile`](./Dockerfile) rather than as an npm-bundled JS action — `config-disassembler`'s native addon ships platform-specific prebuilt binaries, so the image installs it fresh on the same `node:22-slim` (glibc, linux/amd64) base it runs on, via [`docker/package.json`](./docker/package.json).

`docker/package.json` pins its own copies of `config-disassembler` and `@actions/core`, separate from root `package.json`. When bumping either dependency (Dependabot does this weekly for `config-disassembler`), update the version in **both**:

- root `package.json` (`dependencies`/`devDependencies`)
- `docker/package.json`

There's no manual publish step for the image itself: `action.yml`'s `runs.image` points at a floating `ghcr.io/mcarvin8/sf-decomposer:vX` tag, which `.github/workflows/release.yml`'s `publish-image` job builds and pushes on every release. Only bump the pinned major tag in `action.yml` when the major version itself changes.

---

## Pull Requests

1. Create a branch from `main` (e.g. `feat/my-feature` or `fix/issue-123`).
2. Make your changes, add or update tests as needed.
3. Run `npm test` and fix any failures or lint issues.
4. Commit with [conventional commit](https://www.conventionalcommits.org/) messages.
5. Push to your fork and open a PR against `main`.
6. Fill in the PR template (if any) and reference any related issues.

Reviewers may ask for changes; once approved, a maintainer will merge.

---

## Questions

If something is unclear, open an [issue](https://github.com/mcarvin8/sf-decomposer/issues).
