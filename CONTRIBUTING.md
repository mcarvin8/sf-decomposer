## Contributing

Any contributions to this repository are highly encouraged.

## Requirements

- Node >= 18
- yarn >= 3.6.0

## Installation

1. Clone or fork this repository.
2. Install dependencies.

```
yarn
```

## Branching

Please create a feature branch from `main` before making updates. When your updates are ready for review, please open a Pull Request into the `main` branch on this repository.

## Commit Linting

This repository uses Commitlint to enforce the commit message standard. Commit messages will follow the conventional commit message standard. The pre-commit husky hook will check this before you are allowed to push changes to GitHub.

## Testing

When developing, run the provided test suites to confirm the metadata types under test, which test various decompose/recompose functions, remain functional using the set of baseline `recomposed` files. Each test suite will test a different decomposed file type (XML, JSON, YAML).

```
yarn test
```

The `test/baselines` directory in this repository contains baseline metadata files for the metdata types under test.

NOTE: The baseline files are not the exact same as the original metadata files. They have the same contents but will most likely have a different ordering. This plugin's XML file sorting may differ from the Salesforce CLI.

Ensure the `test/baselines` in this repository contains files created by this plugin's `recompose` command to ensure consistent results. This directory should not contain any decomposed files.

Each test suite will:

1. Copy `test/baselines` into a temporary `mock` directory.
2. Run the `decomposer decompose` command for all metadata types in the `mock` directory.
3. Run the `decomposer recompose` command for all metadata types in the `mock` directory.
4. Compare the recomposed files in the `mock` directory against the baselines in `test/baselines` (the test will ignore the decomposed files in `mock`).

The test suites will fail if any of the plugin commands fail or if there is any differences found between the recomposed files in `mock` against `test/baselines`.

## Unique ID Elements

Unique ID elements are used to name decomposed files with nested elements. The default unique ID elements for all metadata types are `<fullName>` and `<name>`, but these will not work in all cases.

If no unique ID elements are found in the nested element, the short SHA-256 hash of the nested element contents will be used instead to name the decomposed file.

Unique ID elements for specific metadata types are located in `src\metadata\uniqueIdElements.json`.

If you want to add unique ID elements, please create a feature branch and raise a Pull Request.
