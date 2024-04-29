## [3.3.5-beta.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.5-beta.1...v3.3.5-beta.2) (2024-04-29)

### Bug Fixes

- push commands differently and remove commas in meta type ([b5cf769](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/b5cf76957df40965902a2001859589a78b664f38))

## [3.3.5-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.4...v3.3.5-beta.1) (2024-04-29)

### Bug Fixes

- add post retrieve hook ([ef53099](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/ef53099623e0ca10d27bd0dc2f3616c7bb603871))

## [3.3.4](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.3...v3.3.4) (2024-04-24)

### Bug Fixes

- fix promises in commands ([02f1470](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/02f14709445ff7abb4d21318cfe66228f5a02946))

## [3.3.3](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.2...v3.3.3) (2024-04-24)

### Bug Fixes

- allow `--metadata-type` to be declared multiple times in a command ([e4d489a](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/e4d489a7e6d12b7f9ff1bc1d335c0fe0ef3cda8f))
- upgrade disassemblers ([d1cc730](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/d1cc7306e4dd30f10976a1ac8982cdbda739659c))

## [3.3.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.1...v3.3.2) (2024-04-24)

### Bug Fixes

- upgrade disassemblers to fix multi-line leaf content sorting ([d9e4672](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/d9e46729186d5f33c97e89972306413f6d52a224))

## [3.3.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.3.0...v3.3.1) (2024-04-23)

### Bug Fixes

- use `simple-git` to get `sfdx-project.json` path, remove `--sfdx-configuration` flag ([9bfe341](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/9bfe3410da98db1316211eb5acde920fac569981))

# [3.3.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.2.3...v3.3.0) (2024-04-17)

### Features

- allow decomposed files to be XMLs, JSONs, or YAMLs ([0256e68](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/0256e68b82bd2aae36f5ac64aeb405f9dabb3d68))

## [3.2.3](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.2.2...v3.2.3) (2024-04-08)

### Bug Fixes

- log xml disassembler errors as warnings when running both commands ([117cf60](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/117cf606683f2e96fe22d7c6170b5ac170070402))

## [3.2.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.2.1...v3.2.2) (2024-04-08)

### Bug Fixes

- add `--postpurge` flag to recompose, refactor imports, upgrade disassembler ([ee8a52b](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/ee8a52bcf3368737406a7fb60db09180b5e4da9a))

## [3.2.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.2.0...v3.2.1) (2024-04-07)

### Bug Fixes

- fix leaf file indenting by upgrading xml disassembler ([ed170f8](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/ed170f8df1aad761981107c4ddad130ec7fe2caa))

# [3.2.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.1...v3.2.0) (2024-04-02)

### Bug Fixes

- **deps:** bump @oclif/core from 3.19.4 to 3.26.0 ([437a306](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/437a3060fb583f71a83a69d3695bc589bee19f3c))
- **deps:** bump @salesforce/source-deploy-retrieve from 10.5.2 to 10.7.1 ([8b26d08](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/8b26d08d015d7bd6f7bd0eba9ee5fc0272b25ede))

### Features

- read `sfdx-project.json` for directories and process multiple directories in a command ([518243d](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/518243d19b833f71127fa956487b5a208983897d))

# [3.2.0-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.2-beta.2...v3.2.0-beta.1) (2024-04-02)

### Features

- read `sfdx-project.json` for directories and process multiple directories in a command ([518243d](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/518243d19b833f71127fa956487b5a208983897d))

## [3.1.2-beta.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.2-beta.1...v3.1.2-beta.2) (2024-04-02)

### Bug Fixes

- **deps:** bump @oclif/core from 3.19.4 to 3.26.0 ([437a306](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/437a3060fb583f71a83a69d3695bc589bee19f3c))

## [3.1.2-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.1...v3.1.2-beta.1) (2024-04-01)

### Bug Fixes

- **deps:** bump @salesforce/source-deploy-retrieve from 10.5.2 to 10.7.1 ([8b26d08](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/8b26d08d015d7bd6f7bd0eba9ee5fc0272b25ede))

## [3.1.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.0...v3.1.1) (2024-03-15)

### Bug Fixes

- load json using fs ([54f4853](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/54f4853375861dfa26a07f6c7aed7a8ebde688f3))
- readd `resolveJsonModule` to tsconfig.json ([9532e2f](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/9532e2f8d3c862811e753ccaaec1d9a1f084c499))
- update @salesforce/source-deploy-retrieve ([d48871d](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/d48871d37c57f1fa017b7a9fed11e914018e1ba1))

## [3.1.1-beta.3](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.1-beta.2...v3.1.1-beta.3) (2024-03-15)

### Bug Fixes

- readd `resolveJsonModule` to tsconfig.json ([9532e2f](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/9532e2f8d3c862811e753ccaaec1d9a1f084c499))

## [3.1.1-beta.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.1-beta.1...v3.1.1-beta.2) (2024-03-15)

### Bug Fixes

- load json using fs ([54f4853](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/54f4853375861dfa26a07f6c7aed7a8ebde688f3))

## [3.1.1-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.1.0...v3.1.1-beta.1) (2024-03-14)

### Bug Fixes

- update @salesforce/source-deploy-retrieve ([d48871d](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/d48871d37c57f1fa017b7a9fed11e914018e1ba1))

# [3.1.0](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.0.2...v3.1.0) (2024-03-12)

### Bug Fixes

- only disassemble the original custom labels file ([1d6d502](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/1d6d502767331a15d0dd89e1daef8081c21f55bd))

### Features

- rename `purge` flag to `prepurge` and add `postpurge` flag ([2fd7ff6](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/2fd7ff64c4bb9e261732675fb4b609e13400e830))

# [3.1.0-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.0.2-beta.1...v3.1.0-beta.1) (2024-03-12)

### Bug Fixes

- only disassemble the original custom labels file ([1d6d502](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/1d6d502767331a15d0dd89e1daef8081c21f55bd))

### Features

- rename `purge` flag to `prepurge` and add `postpurge` flag ([2fd7ff6](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/2fd7ff64c4bb9e261732675fb4b609e13400e830))

## [3.0.2](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.0.1...v3.0.2) (2024-03-07)

### Bug Fixes

- upgrade xml-disassembler to ensure consistent sorting in recomposed files on linux ([4230f95](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/4230f955b18bf5f50d861ade67b82d2e336b0d22))

## [3.0.2-beta.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.0.1...v3.0.2-beta.1) (2024-03-07)

### Bug Fixes

- upgrade xml-disassembler to ensure consistent sorting in recomposed files on linux ([4230f95](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/4230f955b18bf5f50d861ade67b82d2e336b0d22))

## [3.0.1](https://github.com/mcarvin8/sfdx-decomposer-plugin/compare/v3.0.0...v3.0.1) (2024-02-24)

### Bug Fixes

- delete empty custom label temp directory created during recompose process ([f27c211](https://github.com/mcarvin8/sfdx-decomposer-plugin/commit/f27c211c51c96be4b6b10ff55207ec761ad6c7a2))

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
