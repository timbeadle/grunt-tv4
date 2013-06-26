# grunt-tv4

> Use grunt and [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate files against [json-schema](http://json-schema.org/) draft v04

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-tv4 --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-tv4');
```

## The "tv4" task

### Notes

* Uses [Tiny Validator tv4 ](https://github.com/geraintluff/tv4) so schemas must conform to [json-schema draft v04](http://json-schema.org/documentation.html),
* Currently only supports the synchronous validation mode.
* Asynchronous support should will be added as soon as I got time or a use-case.

### Default Options

```js
grunt.initConfig({
  tv4: {
    //specify single schema's and multiple data to validate
    files: {
      'schema/format.json': ['data/alpha.json', 'data/beta.json']
    }
  }
})
```

### Custom Options

```js
grunt.initConfig({
  tv4: {
    options: {
      //show multiple errors per file
      multi: true
      //pre register extra schemas by URI
      schemas: {
        'http://example.com/schema/v1': grunt.file.readJSON('schema/v1.json'),
        'http://example.com/schema/v2': grunt.file.readJSON('schema/v2.json')
      }
    }
    files: {
      //use glob and other standard selector options
      'schema/map.json': ['data/map_*.json'],
      'schema/library.json': ['**/lib_*.json']
    }
  }
})
```

## History

* 0.1.1 - Bugfixes and improved reporting
* 0.1.0 - First release with synchronous validation


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
