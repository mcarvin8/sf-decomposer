# Contributing

Contributions are welcome! If you would like to contribute, please fork the repository, make your changes, and submit a pull request.

## Requirements

- Node >= 20.0.0
- yarn

## Installation

### 1) Fork the repository

### 2) Install Dependencies

This will install all the tools needed to contribute:

```bash
yarn
```

### 3) Build application

```bash
yarn build
```

Rebuild every time you made a change in the source and you need to test locally.

## Testing

When developing, run the provided unit tests for new additions. New additions must meet the jest coverage requirements.

```bash
# run unit tests
yarn test:only
```

To run the non-unit test, ensure you re-build the application and then run:

```bash
# run non-unit tests
yarn test:nuts
```

## Metadata

All metadata attributes, except for unique ID elements, are imported from this plugin's version of `@salesforce/source-deploy-retrieve` (SDR).

### Unique ID Elements

Unique ID elements are used to name decomposed files with nested elements. The file that contains the leaf elements will always match the original file-name.

The default unique ID elements for all metadata types is `fullName` and `name`.

To add metadata-specific unique ID elements, you can update `src/metadata/uniqueIdElements.ts`. The metadata type's suffix should be used as the key.

This plugin looks for the 2 default unique ID elements first before searching for any metadata-specific unique ID elements.

When a unique ID element isn't found, it will use the SHA-256 hash of the element contents to name the decomposed nested element file.

## XML Disassembler

This plugin's code-base primarily handles Salesforce metadata specific functions. The core XML decomposing/recomposing logic is handled by [`xml-disassembler`](https://github.com/mcarvin8/xml-disassembler).

Please fork and raise PRs in this repo for any issues related to XML decomposing or recomposing. You must install `pnpm` to contribute to this repo.

`src/service/recompose/recomposeFileHandler.ts` and `src/service/decompose/decomposeFileHandler.ts` in this plugin handles calling `xml-disassembler`.
