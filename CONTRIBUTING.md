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

- **Lint:** `npm run lint` (runs ESLint on `src` and `test`)
- **Format:** `npm run format` (Prettier on source and test files)

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

Run unit tests (with coverage). New code should satisfy the existing Jest coverage requirements.

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

---

## Code and Architecture

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

Dependabot bumps both packages weekly.

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

If something is unclear, open a [discussion](https://github.com/mcarvin8/sf-decomposer/discussions) or an [issue](https://github.com/mcarvin8/sf-decomposer/issues).
