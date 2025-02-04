# Contributing

Contributions are welcome! If you would like to contribute, please fork the repository, make your changes, and submit a pull request.

## Requirements

- Node >= 18.0.0
- yarn

## Installation

### 1) Download the repository

```bash
git clone git@github.com:mcarvin8/sf-decomposer.git
```

### 2) Install Dependencies

This will install all the tools needed to contribute

```bash
yarn
```

### 3) Build application

```bash
yarn build
```

Rebuild every time you made a change in the source and you need to test locally

## Testing

When developing, run the provided tests for new additions.

```bash
# run unit tests
yarn test
```

To run the non-unit test, ensure you re-build the application and then run:

```bash
# run non-unit tests
yarn test:nuts
```

## Metadata

All metadata attributes, except for unique ID elements, are imported from this plugin's version of `@salesforce/source-deploy-retrieve` (SDR).

This plugin's dependabot will look for SDR updates once a week.

## Unique ID Elements

Unique ID elements are used to name decomposed files with nested elements. The file that contains the leaf elements will always match the original file-name.

The default unique ID elements for all metadata types is `fullName` and `name`.

To add metadata-specific unique ID elements, you can update `src/metadata/uniqueIdElements.json`. The metadata type's suffix should be used as the key.

When a unique ID element isn't found, it will use the SHA-256 hash of the element contents to name the decomposed nested element file.

## XML Disassemblers

This plugin's code-base primarily handles Salesforce metadata specific functions. The core XML decomposing/recomposing logic is handled by the 3 external packages below (1 primary package and 2 extension packages). When these 3 packages below have new releases, this plugin should be updated to use the latest releases.

- [XML Disassembler](https://github.com/mcarvin8/xml-disassembler): Disassembles large XML files into smaller XML files and reassembles the original XML file when needed
    - [XML2JSON Disassembler](https://github.com/mcarvin8/xml2json-disassembler): Extension package which disassembles large XML files into smaller JSON files and reassembles the original XML file when needed
    - [XML2YAML Disassembler](https://github.com/mcarvin8/xml2yaml-disassembler): Extension package which disassembles large XML files into smaller YAML files and reassembles the original XML file when needed

Please fork and raise PRs in these repos for any features or bug fixes specific to XML decomposing/disassembly or recomposing/reassembly. You must install `pnpm` to contribute to these repos.

This plugin's dependabot config will group the 3 disassemblers in the same PR. Dependabot runs weekly.

`src/service/recomposeFileHandler.ts` and `src/service/decomposeFileHandler.ts` in this plugin handles calling the applicable XML disassemblers.
