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

## Unique ID Elements

Unique ID elements are used to name decomposed files with nested elements. The file that contains the leaf elements will always match the original file-name.

The default unique ID elements for all metadata types is `fullName` and `name`.

To add metadata-specific unique ID elements, you can update `src/metadata/uniqueIdElements.json`. The metadata type's suffix should be used as the key.

When a unique ID element isn't found, it will use the SHA-256 hash of the element contents to name the decomposed nested element file.