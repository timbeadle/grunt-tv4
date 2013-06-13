# grunt-tv4

> Use tv4 to validate files against v4 json-schema

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

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  tv4: {
    //specify single schema's and multiple data to validate against it
    files: {
      'schema/map_format.json': ['data/map_*.json', 'extra/map_*.json'],
      'schema/lib_format.json': ['data/lib_*.json']
    }
  }
})
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  tv4: {
    options: {
      //register extra schemes by url
      schemas: {
        'http://example.com/schema/v1': {
            'type': 'object'
            //.. schema object
        }
        'http://example.com/schema/v2': grunt.file.readJSON('schema/v2.json')
      }
    }
    files: {
      'schema/map_format.json': ['data/map_*.json', 'extra/map_*.json'],
      'schema/lib_format.json': ['data/lib_*.json']
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
