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

Metadata attributes (except unique-ID elements) come from this plugin’s version of **@salesforce/source-deploy-retrieve** (SDR). The `-m` / `--metadata-type` flag uses the metadata **suffix** from SDR’s registry.

Dependabot will check for SDR updates once a week and open a PR for new versions. If the PR version includes an update to the metadata registry file, a GitHub action will automatically merge the PR assuming all build checks pass. If the PR version of SDR contains no changes to the metadata registry file, the GitHub action will automatically close the PR.

### Unique ID elements

Unique ID elements are used to name decomposed files for nested elements. The file that holds leaf elements keeps the original metadata file name.

- **Defaults:** `fullName` and `name` for all metadata types.
- **Overrides:** Edit `src/metadata/uniqueIdElements.ts`; use the metadata type’s **suffix** as the key.
- **Fallback:** If no unique ID is found, the plugin uses a SHA-256 hash of the element content for the file name.

### Config disassembler

Core decompose/recompose logic lives in **[config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node)**, which uses a Rust crate to handle decomposing and recomposing files on the local disk. This plugin focuses on Salesforce metadata wiring (e.g. package dirs, SDR, strategies).

- **In this plugin:** `src/service/decompose/decomposeFileHandler.ts` and `src/service/recompose/recomposeFileHandler.ts` call config-disassembler. Per-type / per-component override resolution happens in `src/helpers/configOverrides.ts` and is applied per file inside the decompose handler so different components of the same metadata type can be decomposed with different strategies/formats in one run.
- **Changes to XML decompose/recompose behavior:** Contribute in the [config-disassembler](https://github.com/mcarvin8/config-disassembler) (Rust crate) and/or [config-disassembler-node](https://github.com/mcarvin8/config-disassembler-node) repo.

Dependabot will check for config-disassembler updates once a week.

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
