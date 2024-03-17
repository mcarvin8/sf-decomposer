## Contributing

Any contributions to this repository are highly encouraged.

## Installation

1. Clone or fork this repository.
2. Install dependencies.

```
yarn
```

## Testing

When developing, run the provided end-to-end (E2E) test to confirm the metadata types under test, which test various decompose/recompose functions, remain functional using the set of baseline `recomposed` files.

```
yarn test
```

The `force-app/main/default` directory in this repository contains baseline `recompose` files for the metdata types under test.

NOTE: The `recompose` files are not the exact same as the original metadata files. They have the same contents but will most likely have a different ordering. This plugin's XML file sorting may differ from the Salesforce CLI.

Ensure the `force-app/main/default` in this repository contains `recomposed` files created by this plugin to ensure consistent results. This directory should not contain any `decomposed` files.

The E2E test will:

1. Copy `force-app/main/default` into a temporary `mock` directory.
2. Run the `decomposer decompose` command for all metadata types in the `mock` directory.
3. Run the `decomposer recompose` command for all metadata types in the `mock` directory.
4. Compare the `recompose` files in the `mock` directory against the baselines in `force-app/main/default` (the test will ignore the `decompose` files in `mock`).

The test will fail if the decomposer commands fail or there is any differences found between the `recomposed` files in `mock` against `force-app/main/default`.

## Unique ID Elements

Unique ID elements are used to name decomposed files with nested elements. The default unique ID elements for all metadata types are `fullName` and `name`, but these will not work in all cases.

If no unique ID elements are found in the nested element, the short SHA-256 hash of the nested element contents will be used instead to name the decomposed file.

Unique ID elements for specific metadata types are located in `src\metadata\uniqueIdElements.json`.

If you want to add unique ID elements, please create a feature branch and raise a Pull Request.
