# grunt-tv4

[![Build Status](https://secure.travis-ci.org/Bartvds/grunt-tv4.png?branch=master)](http://travis-ci.org/Bartvds/grunt-tv4) [![Dependency Status](https://gemnasium.com/Bartvds/grunt-tv4.png)](https://gemnasium.com/Bartvds/grunt-tv4) [![NPM version](https://badge.fury.io/js/grunt-tv4.png)](http://badge.fury.io/js/grunt-tv4)

> Use grunt and [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate files against [json-schema](http://json-schema.org/) draft v4

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

* Uses [Tiny Validator tv4 ](https://github.com/geraintluff/tv4) so schemas must conform to [json-schema draft v4](http://json-schema.org/documentation.html),
* As of version 0.1.2 there is support for automatically loading remote references by URI. See the [JSON Schema](http://json-schema.org/) documentation on how to use `$ref`. 

### Default Options

```js
grunt.initConfig({
  tv4: {
    myTarget: {
      //specify single schemas and multiple data to validate
      files: {
        'schema/format.json': ['data/alpha.json', 'data/beta.json'],
        'http://example.com/schema/v1': ['data/alpha.json', 'data/beta.json']
      }
    }
  }
})
```

### Advanced Options

```js
grunt.initConfig({
  tv4: {
    //use global options
    options: {
      //show multiple errors per file (off by default)
      multi: false,
      //create a new tv4 instance for every target (off by default)
      fresh: true,
      //pre register extra schemas by URI
      schemas: {
        'http://example.com/schema/v1': grunt.file.readJSON('schema/v1.json'),
        'http://example.com/schema/v2': grunt.file.readJSON('schema/v2.json')
      },
      //custom formats passed to tv4.addFormat()
      formats: {
        date: function (data, schema) {
          if (typeof data !== 'string' || !dateRegex.test(data)) {
            return 'value must be string of the form: YYYY-MM-DD';
          }
          return null;
        }
      },
      //passed to tv4.validate()
      checkRecursive: false
      //passed to tv4.validate()
      banUnknownProperties: false
      //passed tv4.addLanguage() 
      languages: {
        'de': { ... }
      }
      //passed tv4.language() 
      language: 'de'
    },
    myTarget: {
      files: {
        //use glob and other standard selector options
        'schema/map.json': ['data/map_*.json'],
        'http://example.com/schema/v1': ['**/lib_*.json']
      }
    }
  }
})
```

## History

* 0.1.4 - Updated `tv4` to version `1.0.11` 
  * Added support for `tv4.addFormat()` / `languages` / `checkRecursive` / `banUnknownProperties`.
* 0.1.3 - Support for loading remote references (JSON Schema's `$ref`).
* 0.1.1 - Bugfixes and improved reporting
* 0.1.0 - First release with synchronous validation


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
