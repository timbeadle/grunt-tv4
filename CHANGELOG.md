# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [6.2.1] - 2024-03-05
### Added
- npm-run-all2
- `versioning-strategy: increase` in dependabot.yml
- `packageRules`, `rangeStrategy`, `transitiveRemediation` in renovate.json

### Updated
- Added an annotation to satisfy an eslint rule
- @snyk/protect@1.1282.1
- eslint-config-xo@0.44.0
- eslint-plugin-import@2.29.1
- eslint@8.57.0
- ls-engines@0.9.1
- prettier@3.2.5
- tv4-reporter@6.1.0
- actions/setup-node@v4
- github/codeql-action/init@v3
- github/codeql-action/autobuild@v3
- github/codeql-action/analyze@v3

### Removed
- npm-run-all

## [6.2.0] - 2023-09-28

### Added
- NodeJS 14.0.x, 14.13.x, 14.17.x, 20.x test runs
- peerDependencies: grunt >= 0.4.0
- Volta pin node@14.0.0, npm@7.24.2

### Updated
- @snyk/protect@1.1227.0
- eslint-plugin-import@2.28.1
- eslint-plugin-redos@4.4.5
- eslint@8.50.0
- grunt-contrib-connect@4.0.0
- ls-engines@0.9.0
- prettier@3.0.3
- tv4-reporter@6.0.0
- actions/checkout@v4

### Removed
- NodeJS 19.x test run

## [6.1.0] - 2022-11-08

### Added
- eslint-plugin-redos
- ls-engines
- NodeJS v19 test run
- Renovate dependency management

### Updated
- eslint config
- @snyk/protect@1.1054.0
- grunt@1.5.3
- tv4-reporter@5.0.0
- eslint@8.27.0
- eslint-config-xo@0.43.1
- eslint-plugin-import@2.26.0
- prettier@2.7.1

### Removed
- TravisCI test running

## [6.0.0] - 2022-04-28

### Added
- @snyk/protect
- eslint
- eslint-config-xo
- eslint-plugin-import

### Updated
- code style to match updated xo/eslint rules
- grunt@1.5.0
- miniwrite@0.1.4
- prettier@2.4.1
- tv4@1.3.0

### Removed
- nodejs &lt;v14 support
- xo
- snyk
- TravisCI badge

## [5.0.1] - 2020-11-20

### Added
- https support, and tests to verify this

## [5.0.0] - 2020-11-20

### Added
- Dependabot setup

### Updated
- prettier@2.2.0
- snyk@1.430.0
- tv4-reporter@4.3.0
- xo@0.35.0

### Removed
- request (use native http module instead)

## [4.2.0] - 2020-10-21
### Added
- nodejs v15 support
- codeql analysis

### Updated
- HEAD branch master -> main
- snyk policy
- grunt@1.3.0
- grunt-contrib-connect@3.0.0
- snyk@1.419.1
- tv4-reporter@4.2.0
- prettier@2.1.2
- xo@0.34.1

## [4.1.0] - 2020-07-07
### Added
- nodejs v14 support
- travis-ci.com for test/build

### Updated
- grunt@1.2.1
- snyk@1.360.0
- tv4-reporter@4.1.0
- xo@0.32.1

### Removed
- Greenkeeper badge (retired)
- travis-ci.org for test/build

## [4.0.0] - 2020-03-19
### Added
- Github actions for running tests, via test-ci npm script
- xo linter, with .prettierrc.yaml config
- nodejs v13 support in .travis.yml
- npm-run-all for running npm scripts in parallel

### Updated
- Refactoring and updating to es6 features
- grunt@1.1.0
- request@2.88.2
- snyk@1.299.0
- tv4-reporter@4.0.2

### Removed
- eslint
- nodejs <10 support

## [3.0.3] - 2019-10-13
### Updated

- eslint@6.5.1
- eslint-plugin-jsdoc@15.11.0
- snyk@1.234.2
- tv4-reporter@2.0.3

## [3.0.2] - 2019-09-07
### Added
- Greenkeeper.io badge
- `snyk protect` script

### Updated
- grunt-contrib-connect@2.1.0
- tv4-reporter@2.0.2
- eslint@6.3.0
- eslint-plugin-jsdoc@15.9.1
- eslint-plugin-node@10.0.0
- load-grunt-tasks@5.1.0
- snyk@1.226.0

### Removed
- bitdeli.com badge (defunct)

## [3.0.1] - 2019-05-26
### Updated
- tv4-reporter@2.0.0
- .npmignore file


## [3.0.0] - 2019-05-26
### Added
- Snyk badge
- node_js v12 support in .travis.yml

### Updated
- eslint@5.16.0
- eslint-plugin-jsdoc@7.0.2
- eslint-plugin-node@9.1.0
- grunt@1.0.4
- load-grunt-tasks@5.0.0
- snyk@1.167.2

### Removed
- node <8 support

## [2.1.0] - 2019-02-11
### Added
- .editorconfig
- Snyk monitoring
- node 8, 9, 10, 11 support in .travis.yml
- eslint
- eslint-{config,plugin}-prettier

### Updated
- tv4-reporter@1.1.0
- eslint-plugin-jsdoc@4.1.0
- eslint-plugin-node@8.0.1
- load-grunt-tasks@4.0.0

### Removed
- node <6 support
- grunt-eslint
- grunt-release-it
- latest


## [2.0.0] - 2017-03-14
### Fixed
- `banUnknown` -> `banUnknownProperties` (for consistency with both [README.md](README.md) and `tv4`) - [Issue 10](https://github.com/timbeadle/grunt-tv4/issues/10)

### Updated
- `banUnknownProperties` now defaults to false - [Pull 13](https://github.com/timbeadle/grunt-tv4/pull/13)
- Dependencies upgraded:
  - request@2.81.0
  - eslint-plugin-jsdoc@2.4.0
  - eslint-plugin-node@4.2.1

## [1.0.0] - 2016-11-06
### Added
- node v7 support in .travis.yml
- Changelog (this file)

### Updated
- Dependencies upgraded:
  - jsonpointer@0.4.0
  - request@2.78.0
  - tv4-reporter@1.0.0
  - eslint-plugin-node@3.0.3
  - grunt-contrib-connect@1.0.2
  - grunt-eslint@19.0.0
  - latest@0.2.0
  - load-grunt-tasks@3.5.2
  - package.json-schema@0.2.0

### Removed
- node v0.10 support in .travis.yml

## [0.5.0]
- Bring travis node targets up to date
- Remove grunt-cli as a devDependency (it should be installed globally)
- devDependencies: grunt 1.0.1
- peerDependencies: grunt >= 0.4.1

## [0.4.2]
- Typos fixed in code examples.
- Update grunt in peerDependencies to support grunt v1.
- Update docs to reflect change of project ownership.

## [0.4.0]
- Updated some dependencies. `root`, `add` and `schemas` can be a callback function (for lazy init).

## [0.3.0]
- Big internal rewrite:
  - Added `.values` option.
  - Extracted reporting to [tv4-reporter](https://github.com/Bartvds/tv4-reporter), [miniwrite](https://github.com/Bartvds/miniwrite) and [ministyle](https://github.com/Bartvds/ministyle).
  - Moved loader logic to own stand-alone module (for later extraction)
  - Extracted test-running logic to own module (for later extraction)

## [0.2.1]
- Added support to report subErrors (for anyOf/oneOf)

## [0.2.0]
- Updated to follow the Grunt conventions.

## [0.1.4]
- Updated `tv4` to version `1.0.11`
- Added support for `tv4.addFormat()` / `languages` / `checkRecursive` / `banUnknownProperties`.

## [0.1.3]
- Support for loading remote references (JSON Schemas `$ref`).

## 0.1.2
- (unknown)

## 0.1.1
- Bugfixes and improved reporting

## 0.1.0
- First release with synchronous validation

[6.2.1]: https://github.com/timbeadle/grunt-tv4/compare/6.2.0...6.2.1
[6.2.0]: https://github.com/timbeadle/grunt-tv4/compare/6.1.0...6.2.0
[6.1.0]: https://github.com/timbeadle/grunt-tv4/compare/6.0.0...6.1.0
[6.0.0]: https://github.com/timbeadle/grunt-tv4/compare/5.0.1...6.0.0
[5.0.1]: https://github.com/timbeadle/grunt-tv4/compare/5.0.0...5.0.1
[5.0.0]: https://github.com/timbeadle/grunt-tv4/compare/4.2.0...5.0.0
[4.2.0]: https://github.com/timbeadle/grunt-tv4/compare/4.1.0...4.2.0
[4.1.0]: https://github.com/timbeadle/grunt-tv4/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/timbeadle/grunt-tv4/compare/3.0.3...4.0.0
[3.0.3]: https://github.com/timbeadle/grunt-tv4/compare/3.0.2...3.0.3
[3.0.2]: https://github.com/timbeadle/grunt-tv4/compare/3.0.1...3.0.2
[3.0.1]: https://github.com/timbeadle/grunt-tv4/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/timbeadle/grunt-tv4/compare/2.1.0...3.0.0
[2.1.0]: https://github.com/timbeadle/grunt-tv4/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/timbeadle/grunt-tv4/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/timbeadle/grunt-tv4/compare/0.5.0...1.0.0
[0.5.0]: https://github.com/timbeadle/grunt-tv4/compare/0.4.2...0.5.0
[0.4.2]: https://github.com/timbeadle/grunt-tv4/compare/0.4.0...0.4.2
[0.4.0]: https://github.com/timbeadle/grunt-tv4/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/timbeadle/grunt-tv4/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/timbeadle/grunt-tv4/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/timbeadle/grunt-tv4/compare/0.1.4...0.2.0
[0.1.4]: https://github.com/timbeadle/grunt-tv4/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/timbeadle/grunt-tv4/compare/0.1.2...0.1.3
