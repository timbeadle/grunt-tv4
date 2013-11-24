# grunt-tv4

[![Build Status](https://secure.travis-ci.org/Bartvds/grunt-tv4.png?branch=master)](http://travis-ci.org/Bartvds/grunt-tv4) [![Dependency Status](https://gemnasium.com/Bartvds/grunt-tv4.png)](https://gemnasium.com/Bartvds/grunt-tv4) [![NPM version](https://badge.fury.io/js/grunt-tv4.png)](http://badge.fury.io/js/grunt-tv4)

> Use grunt and [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate values against [json-schema](http://json-schema.org/) draft v4

## Getting Started

This plugin requires Grunt `~0.4.1`

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

As of version `v0.2.0` the API was changed to follow the Grunt options- and file-selection conventions. The old pattern (which abused the destination-specifier) is no longer supported. The readme for the previous API can be found [here](https://github.com/Bartvds/grunt-tv4/tree/71ef1726945d05efd5daca29f26cbf4ab09c858e).

The root schema must now to be specified as `options.root`.

### Default Options

```js
grunt.initConfig({
	tv4: {
		options: {
		    root: grunt.file.readJSON('schema/main.json')
		}
		myTarget: {
			src: ['data/*.json']
		}
	}
})
```

```js
grunt.initConfig({
	tv4: {
		myTarget: {
		    root: {
				type: 'string'
			}
			options: {
				values: [
					'yes'
					false,
				]
			}
		}
	}
})
````

### Advanced Options

```js
grunt.initConfig({
	tv4: {
		options: {
			// specify the main schema, one of:
            // - path to json
            // - http-url
            // - schema object
			root: grunt.file.readJSON('schema/main.json'),

			// show multiple errors per file (off by default)
			multi: true,

			// create a new tv4 instance for every target (off by default)
			fresh: true,

			// add schemas in bulk (each required to have an 'id' property)
			add: [
				 grunt.file.readJSON('schema/apple.json'),
				 grunt.file.readJSON('schema/pear.json')
			],

			// set schemas by URI
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

			// validate values
			values: [
				grunt.file.readJSON('schema/apple.json'),
				grunt.file.readJSON('schema/pear.json')
			],

			// alternately pass as object and the keys will be used as labels in the reports
			values: {
				'first': grunt.file.readJSON('schema/apple.json'),
				'second': grunt.file.readJSON('schema/pear.json')
			},

			// alternately pass a function() to returns the values (array or object)
			values: function() {
				return {
					'first': grunt.file.readJSON('schema/apple.json'),
					'second': grunt.file.readJSON('schema/pear.json')
				}
			},

			// passed to tv4.validate()
			checkRecursive: false
			// passed to tv4.validate()
			banUnknownProperties: false
			// passed tv4.language()
			language: 'de'
			// passed tv4.addLanguage()
			languages: {
				'de': { ... }
			}
		},
		// load json from disk
		myTarget: {
			src: ['data/*.json']
		}
	}
})
```

## History

* 0.2.1 - Added support to report subErrors (for anyOf/oneOf)
* 0.2.0 - Updated to follow the Grunt conventions.
* 0.1.4 - Updated `tv4` to version `1.0.11` 
  * Added support for `tv4.addFormat()` / `languages` / `checkRecursive` / `banUnknownProperties`.
* 0.1.3 - Support for loading remote references (JSON Schema's `$ref`).
* 0.1.1 - Bugfixes and improved reporting
* 0.1.0 - First release with synchronous validation


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
