# [3.0.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.2.0...v3.0.0) (2024-02-24)

### Bug Fixes

- rename bot version meta files and delete recomposed files during test to ensure they are remade ([f6b4675](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/f6b4675a492692037441053ebfc93cc2a834e8d9))

### Features

- add xml-disassembler package ([e5f6173](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/e5f6173ea9dce4600e3544baf523406869486c0e))

### BREAKING CHANGES

- Decompose files will need to be re-generated.

# [2.2.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.5...v2.2.0) (2024-02-18)

### Features

- expand supported metadata types to the majority of metadata types supported by SDR ([02fb119](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/02fb119dae4b1c02a29f92149844368e3f543527))

## [2.1.5](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.4...v2.1.5) (2024-02-17)

### Bug Fixes

- if root element key is an array of leaf elements, add to leaf file ([3259d85](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/3259d855e89d495d34d4847ac21ba6f54f62db82))

## [2.1.4](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.3...v2.1.4) (2024-02-16)

### Bug Fixes

- fix how decompose sets unique id elements ([2a0d78a](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/2a0d78ab0a066253ae64c46628c1728c4512205d))

## [2.1.3](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.2...v2.1.3) (2024-02-15)

### Bug Fixes

- use short SHA-256 hash if no unique ID elements are found ([4ac65a0](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/4ac65a04e0f51859e9a7ae93509fe4497d13543b))

## [2.1.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.1...v2.1.2) (2024-02-14)

### Bug Fixes

- resolve lint issues on buildNestedElements ([e1bd33d](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/e1bd33d7e3a2e4c06bc3742faf0c1f56ac9c3f2d))

## [2.1.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.1.0...v2.1.1) (2024-02-14)

### Bug Fixes

- adjust comment prop name to allow comments in translations ([e3d9279](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/e3d9279d77757eea630997f113da4042bc68f332))

# [2.1.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.0.2...v2.1.0) (2024-02-14)

### Features

- add marketing app extensions and CDATA support ([38d6941](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/38d694184054b1caa35d9c9a04fd8448d69258fd))

## [2.0.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.0.1...v2.0.2) (2024-02-14)

### Bug Fixes

- links in readme ([e7351d3](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/e7351d32ac1627f7a51b611fd8f4f134fffdb765))

## [2.0.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v2.0.0...v2.0.1) (2024-02-14)

### Bug Fixes

- **deps:** bump @salesforce/sf-plugins-core from 7.1.3 to 7.1.9 ([7b48afc](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/7b48afc50060449c7ffbc9d02a005ead19df4c69))

# [2.0.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.1...v2.0.0) (2024-02-11)

### Bug Fixes

- **deps:** bump @salesforce/core from 6.5.1 to 6.5.3 ([0eff76c](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/0eff76c57039b697d9eaf9a482b24f90b8485399))
- **deps:** bump fast-xml-parser from 4.3.3 to 4.3.4 ([654d939](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/654d9397d6d1c49557c673151898f0a380676c5c))

### Features

- rename compose command ([6a7002e](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/6a7002e44f0b5c4d5cfd137e80673c3423f2fb2d))

### BREAKING CHANGES

- rename 'compose' command to 'recompose'

# [2.0.0-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.2-beta.2...v2.0.0-beta.1) (2024-02-11)

### Features

- rename compose command ([6a7002e](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/6a7002e44f0b5c4d5cfd137e80673c3423f2fb2d))

### BREAKING CHANGES

- rename 'compose' command to 'recompose'

## [1.1.2-beta.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.2-beta.1...v1.1.2-beta.2) (2024-02-11)

### Bug Fixes

- **deps:** bump @salesforce/core from 6.5.1 to 6.5.3 ([0eff76c](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/0eff76c57039b697d9eaf9a482b24f90b8485399))

## [1.1.2-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.1...v1.1.2-beta.1) (2024-02-11)

### Bug Fixes

- **deps:** bump fast-xml-parser from 4.3.3 to 4.3.4 ([654d939](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/654d9397d6d1c49557c673151898f0a380676c5c))

## [1.1.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.0...v1.1.1) (2024-02-06)

### Bug Fixes

- add logging from salesforce core ([3f80ca8](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/3f80ca8f9675f1306d88fbb4ae20ded0d624b5c8))

## [1.1.1-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.1.0...v1.1.1-beta.1) (2024-02-06)

### Bug Fixes

- add logging from salesforce core ([3f80ca8](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/3f80ca8f9675f1306d88fbb4ae20ded0d624b5c8))

# [1.1.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.0.0...v1.1.0) (2024-02-02)

### Features

- import SDR for metadata types ([9b7b08a](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/9b7b08a13c22e36ea4b7a0b3f0dee50da03ff77a))

# [1.0.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v0.1.1...v1.0.0) (2024-01-31)

### Features

- beta release ([808e88c](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/808e88cbb5b25cf1bdc6076286448ffd0753aa52))
- trigger new beta release with async updates ([81e6792](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/81e6792e249a54e2a701a3f73706a7ba72e68e8f))

### BREAKING CHANGES

- beta

# [1.0.0-beta.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2024-01-31)

### Features

- trigger new beta release with async updates ([81e6792](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/81e6792e249a54e2a701a3f73706a7ba72e68e8f))

# [1.0.0-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v0.1.1...v1.0.0-beta.1) (2024-01-30)

### Features

- beta release ([808e88c](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/808e88cbb5b25cf1bdc6076286448ffd0753aa52))

### BREAKING CHANGES

- beta
