# Contributing to sf-decomposer

Contributions are welcome. This guide covers how to set up your environment, run tests, and submit changes.

---

## Requirements

- **Node.js** ≥ 20.0.0
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

After rebuilding, run the non-unit tests:

```bash
npm run build
npm run test:nuts
```

### Full test pipeline

The default `npm test` runs the full pipeline (compile, lint, unit tests). Use it before pushing.

### Mutation testing

This plugin runs [Stryker](https://stryker-mutator.io/) over `src/` to keep the unit-test suite honest. Two modes are supported:

- **Incremental (PR jobs):** `npm run mutation:incremental` — runs Stryker only against files changed in the current diff (the workflow in `.github/workflows/mutation.yml` invokes this on every pull request).
- **Full (on demand):** `npm run mutation` — full suite; published to the [Stryker Dashboard](https://dashboard.stryker-mutator.io/reports/github.com/mcarvin8/sf-decomposer/main) via the `Run Full Mutation Suite` workflow_dispatch.

Local runs honor the `commands/` and `hooks/` exclusions (those folders are only meaningfully exercised by NUTs, which Stryker does not run). The current mutation badge in the README reflects the last `main` run.

#### Documented mutation-survivor gaps

A small number of mutants are not killable by unit tests against this codebase. They survive every run and are tracked here so reviewers don't chase them:

- **`src/metadata/parseManifest.ts`**
  - Lines 31, 34 (ignore-fallback empty array; UTF-8 encoding on `sfdx-project.json`): Node's `readFile` without an explicit encoding still produces a UTF-8 string when fed to `JSON.parse`, and a mutated `[]` fallback to `["Stryker was here"]` for `ignoreDirs` only diverges when a real package directory happens to be basename-equal to the mutator placeholder — an unrealistic and self-inflicted state.
  - Lines 70, 73, 76, 108, 132, 133 (cond), 151, 160, 179, 210: covered by `/* istanbul ignore … */` annotations because the inputs that could reach these branches are precluded by SDR's own registry (parent types always declare a suffix; multiple parent types do not share a suffix; folder-typed members and strict-directory members are mutually exclusive). Mutating these guards yields code paths that no in-registry metadata type can drive.
- **`src/helpers/configOverrides.ts`**
  - Line 18 (`if (!repoRoot)`): istanbul-ignored — `getRepoRoot()` throws before this guard can ever see a falsy `repoRoot`, so no test can observe the difference between the guard and a `false` mutant.
  - Lines 345 (`colonIdx <= 0` / `colonIdx === key.length - 1` / `key.length + 1`): `parseComponentKey` rejects any key with a leading colon, trailing colon, or no colon. The follow-on `metadataType.trim()` / `fullName.trim()` checks already cover the same input space, so flipping the offset checks produces identical reject decisions on every input the function is ever invoked with.
  - Lines 359, 372, 382 (`if (!overrides || overrides.length === 0)`): The three look-up helpers short-circuit on empty inputs but `Array.prototype.find`/`some` already return falsy on an empty array — mutating the guard to `false` produces the same return value through a slightly slower path.
- **`src/service/verify/diffDirectories.ts`**
  - Lines 11, 15 (`attributeNamePrefix`, `ignoreDeclaration`): `fast-xml-parser` produces equivalent canonical JSON for the inputs this plugin actually compares (no element/attribute name collisions; XML declarations are stripped by the disassembler before files land on disk), so toggling these constructor options has no observable effect on `xmlEquivalent`.
  - Lines 94, 109, 116 (defensive `try/catch` returning `false`): the istanbul-ignored catch handlers exist for filesystem-permission errors and malformed XML — both unreachable in this plugin's pipeline because the upstream disassembler guarantees well-formed output.
  - Line 138/139 sort-comparator equality mutants: the comparator is fed strings produced by `canonicalJson`, which already deduplicates identical objects before sorting. Two strings that compare equal can never reach the comparator in a way that would let a test observe `<` vs `<=`.
- **`src/core/decomposeMetadataTypes.ts` & `src/core/recomposeMetadataTypes.ts`**
  - `metadataTypes.length === 0` / `metadataTypes.length >= 0` mutants on the manifest-branch path: the function only reaches this expression when a manifest was supplied AND `metadataTypes` was non-empty — both `=== 0` and `>= 0` evaluate identically for a non-empty array, so the mutation cannot be observed without violating the function's documented preconditions.
- **`src/service/decompose/decomposeFileHandler.ts` & `src/service/recompose/recomposeFileHandler.ts`**
  - `stripMetaSuffix` (decomposeFileHandler L221) and `decomposedDirForXml` (recomposeFileHandler L102): both helpers are wrapped in `/* istanbul ignore next */` because `parseManifest` only ever builds xml paths from `${member}.${suffix}-meta.xml`, so the "no metaEnding suffix" branch is unreachable from any public API call.
  - `directoryExists` catch blocks (L94, L210, L112): defensive only; the calling sites always invoke `directoryExists` after the file has just been produced by the disassembler crate, so the catch can only ever fire for filesystem-permission errors that no test can portably reproduce.
- **`src/service/decompose/customLabels.ts` line 16 (`{ recursive: true }`)**: `prePurgeLabels` only `rm()`s entries that `stat().isFile()` reports as files; for files, the `recursive` option is a no-op and Stryker's mutations (`{}` or `recursive: false`) produce identical behaviour. Triggering a difference would require a non-file dirent to reach the branch, which the surrounding `isFile()` guard precludes.
- **`src/service/recompose/reassembleLabels.ts` line 11**: the Stryker location reported here is a transpilation artifact (column 117 is past the line end); the function is exercised end-to-end by the labels NUT and by `reassembleLabels` integration tests.

When adding new code, prefer making genuinely unreachable branches `/* istanbul ignore next -- @preserve: <reason> */` so future mutation runs surface them as expected gaps rather than as new survivors.

---

## Code and Architecture

### Source layout

```
src/
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
│   ├── multiLevelDefaults.ts   # built-in multiLevel rules for bot and loyaltyProgramSetup
│   ├── parseManifest.ts        # package.xml → filtered component list
│   └── uniqueIdElements.ts     # per-suffix unique ID element overrides (edit here to add a new type)
└── service/                    # per-file work delegated by core
    ├── core/
    │   ├── getRepoRoot.ts
    │   └── moveFiles.ts
    ├── decompose/
    │   ├── customLabels.ts         # labels-specific pre/post purge logic
    │   ├── decomposeFileHandler.ts # calls config-disassembler-node per file
    │   └── renameWorkflows.ts      # renames workflow sub-type files after decompose
    ├── recompose/
    │   ├── deleteFilesinDirectory.ts
    │   ├── reassembleLabels.ts
    │   ├── recomposeFileHandler.ts # calls config-disassembler-node per file
    │   └── renameBotVersionFiles.ts
    └── verify/
        └── diffDirectories.ts      # structural XML equality comparison (order-agnostic)
```

### Metadata and SDR

Metadata attributes (except unique-ID elements) come from this plugin's pinned version of **@salesforce/source-deploy-retrieve** (SDR). The `-m` / `--metadata-type` flag uses the metadata **suffix** from SDR's registry.

Dependabot opens a weekly PR for new SDR versions. A GitHub action auto-merges the PR if it bumps the registry file (after build checks pass) and auto-closes it otherwise.

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
