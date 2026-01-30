# Contributing to sf-decomposer

Contributions are welcome. This guide covers how to set up your environment, run tests, and submit changes.

---

## Requirements

- **Node.js** ≥ 20.0.0
- **yarn** (package manager)

---

## Getting Started

### 1. Fork and clone

Fork the [repository](https://github.com/mcarvin8/sf-decomposer) and clone your fork locally.

### 2. Install dependencies

```bash
yarn
```

### 3. Build

```bash
yarn build
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

- **Lint:** `yarn lint` (runs ESLint on `src` and `test`)
- **Format:** `yarn format` (Prettier on source and test files)

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
yarn test:only
```

### Non-unit (NUT) tests

After rebuilding, run the non-unit tests:

```bash
yarn build
yarn test:nuts
```

### Full test pipeline

The default `yarn test` runs the full pipeline (compile, lint, unit tests). Use it before pushing.

---

## Code and Architecture

### Metadata and SDR

Metadata attributes (except unique-ID elements) come from this plugin’s version of **@salesforce/source-deploy-retrieve** (SDR). The `-m` / `--metadata-type` flag uses the metadata **suffix** from SDR’s registry.

### Unique ID elements

Unique ID elements are used to name decomposed files for nested elements. The file that holds leaf elements keeps the original metadata file name.

- **Defaults:** `fullName` and `name` for all metadata types.
- **Overrides:** Edit `src/metadata/uniqueIdElements.ts`; use the metadata type’s **suffix** as the key.
- **Fallback:** If no unique ID is found, the plugin uses a SHA-256 hash of the element content for the file name.

### XML disassembler

Core decompose/recompose logic lives in **[xml-disassembler](https://github.com/mcarvin8/xml-disassembler)**. This repo focuses on Salesforce metadata wiring (e.g. package dirs, SDR, strategies).

- **In this repo:** `src/service/decompose/decomposeFileHandler.ts` and `src/service/recompose/recomposeFileHandler.ts` call xml-disassembler.
- **Changes to XML disassemble/reassemble behavior:** Contribute in the [xml-disassembler](https://github.com/mcarvin8/xml-disassembler) repo (that project uses **pnpm**).

---

## Pull Requests

1. Create a branch from `main` (e.g. `feat/my-feature` or `fix/issue-123`).
2. Make your changes, add or update tests as needed.
3. Run `yarn test` and fix any failures or lint issues.
4. Commit with [conventional commit](https://www.conventionalcommits.org/) messages.
5. Push to your fork and open a PR against `main`.
6. Fill in the PR template (if any) and reference any related issues.

Reviewers may ask for changes; once approved, a maintainer will merge.

---

## Questions

If something is unclear, open a [discussion](https://github.com/mcarvin8/sf-decomposer/discussions) or an [issue](https://github.com/mcarvin8/sf-decomposer/issues).
