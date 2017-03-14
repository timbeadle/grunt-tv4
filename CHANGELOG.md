# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
