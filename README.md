# grunt-tv4

[![npm version](https://img.shields.io/npm/v/grunt-tv4.svg)](https://www.npmjs.com/package/grunt-tv4)
[![Downloads/month](https://img.shields.io/npm/dm/grunt-tv4.svg)](https://www.npmjs.com/package/grunt-tv4)
[![Build Status](https://travis-ci.org/timbeadle/grunt-tv4.svg?branch=master)](https://travis-ci.org/timbeadle/grunt-tv4)
[![Dependency Status](https://david-dm.org/timbeadle/grunt-tv4.svg)](https://david-dm.org/timbeadle/grunt-tv4)
[![devDependency Status](https://david-dm.org/timbeadle/grunt-tv4/dev-status.svg)](https://david-dm.org/timbeadle/grunt-tv4#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/timbeadle/grunt-tv4/badges/gpa.svg)](https://codeclimate.com/github/timbeadle/grunt-tv4)

> Use grunt and [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate values against [json-schema](http://json-schema.org/) draft v4

## Getting Started

This plugin requires Grunt `>=0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
$ npm install grunt-tv4 --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-tv4');
```

## The "tv4" task

### Notes

* Uses [Tiny Validator tv4 ](https://github.com/geraintluff/tv4) so schemas must conform to [json-schema draft v4](http://json-schema.org/documentation.html).
* Supports automatically resolution and loading remote references by http via `$ref`.
* To use `$ref` see the [json-schema](http://json-schema.org/) documentation or [this help](http://spacetelescope.github.io/understanding-json-schema/structuring.html).
* For general help with json-schema see this excelent [guide](http://spacetelescope.github.io/understanding-json-schema/) and usable [reference](http://spacetelescope.github.io/understanding-json-schema/reference/index.html).
* Errors formatted by the [tv4-reporter](https://github.com/Bartvds/tv4-reporter) library.

### API change

As of version `v0.2.0` the API was changed to follow the Grunt options- and file-selection conventions. The old pattern (which abused the destination-specifier) is no longer supported. The readme for the previous API can be found [here](https://github.com/timbeadle/grunt-tv4/tree/71ef1726945d05efd5daca29f26cbf4ab09c858e).

The root schema must now to be specified as `options.root`.

### Example

* Demo of version `v0.3.0` output on [travis-ci](https://travis-ci.org/timbeadle/grunt-tv4/jobs/14468920)

### Basic usage

Validate from .json files:

```js
grunt.initConfig({
	tv4: {
		options: {
		    root: grunt.file.readJSON('schema/main.json')
		},
		myTarget: {
			src: ['data/*.json']
		}
	}
})
```

Valdiate values:

```js
grunt.initConfig({
	tv4: {
		myTarget: {
			options: {
				root: {
					type: 'object',
					properties: { ... }
				}
			},
			values: [
				{ ... },
				{ ... }
			]
		}
	}
})
````

### Advanced usage

```js
grunt.initConfig({
	tv4: {
		options: {
			// specify the main schema, one of:
            // - path to json
            // - http-url
            // - schema object
            // - callback that returns one of the above
			root: grunt.file.readJSON('schema/main.json'),

			// show multiple errors per file (off by default)
			multi: true,

			// create a new tv4 instance for every target (off by default)
			fresh: true,

			// add schemas in bulk (each required to have an 'id' property) (can be a callback)
			add: [
				 grunt.file.readJSON('schema/apple.json'),
				 grunt.file.readJSON('schema/pear.json')
			],

			// set schemas by URI (can be a callback)
			schemas: {
				'http://example.com/schema/apple': grunt.file.readJSON('schema/apple.json'),
				'http://example.com/schema/pear': grunt.file.readJSON('schema/pear.json')
			},

			// map of custom formats passed to tv4.addFormat()
			formats: {
				date: function (data, schema) {
					if (typeof data !== 'string' || !dateRegex.test(data)) {
						return 'value must be string of the form: YYYY-MM-DD';
					}
					return null;
				}
			},

			// passed to tv4.validate()
			checkRecursive: false,
			// passed to tv4.validate()
			banUnknownProperties: false,
			// passed tv4.language()
			language: 'de',
			// passed tv4.addLanguage()
			languages: {
				'de': { ... }
			}
		},
		// load json from disk
		myFiles: {
			src: ['data/*.json', 'data/fruit/**/*.json']
		},

		myValues: {
			// validate values
			values: [
				grunt.file.readJSON('data/apple.json'),
				grunt.file.readJSON('data/pear.json')
			],
		},

		myValueMap: {
			// alternately pass as object and the keys will be used as labels in the reports
			values: {
				'apple': grunt.file.readJSON('data/apple.json'),
				'pear': grunt.file.readJSON('data/pear.json')
			},
		},

		myCallback: {
			// alternately pass a function() to return a collection of values (array or object)
			values: function() {
				return {
					'apple': grunt.file.readJSON('data/apple.json'),
					'pear': grunt.file.readJSON('data/pear.json')
				}
			}
		}
	}
})
```

## History

- See [CHANGELOG.md](CHANGELOG.md).


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/timbeadle/grunt-tv4/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
