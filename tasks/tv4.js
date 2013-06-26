/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	var valueType = function (value) {
		var t = typeof value;
		if (t === 'object') {
			if (Object.prototype.toString.call(value) === '[object Array]') {
				return 'array';
			}
		}
		return t;
	};
	var valueStrim = function (value) {
		var t = typeof value;
		if (t === 'function') {
			return '[function]';
		}
		if (t === 'object') {
			//return Object.prototype.toString.call(value);
			value = JSON.stringify(value);
			if (value.length > 40) {
				value = value.substr(0, 37) + '...';
			}
			return value;
		}
		if (t === 'string') {
			if (value.length > 40) {
				return JSON.stringify(value.substr(0, 37)) + '...';
			}
			return JSON.stringify(value);
		}
		return '' + value;
	};
	grunt.registerMultiTask('tv4', 'Your task description goes here.', function () {
		var options = this.options({
			schemas: {},
			multi:false
		});

		var tv4 = require('tv4').tv4;
		var jsonpointer = require('jsonpointer.js');

		var cache = {};
		var fileCount = 0;
		var fail = [];
		var pass = [];

		grunt.util._.each(options.schemas, function (schema, url) {
			grunt.log.writeln('schema add: ' + url);
			tv4.addSchema(url, schema);
		});

		grunt.util._.each(this.files, function (f) {
			grunt.util._.each(f.src, function (filepath) {
				fileCount++;
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('data not found: '.red + filepath);
					return;
				}
				if (!grunt.file.isFile(filepath)) {
					grunt.log.fail('data not a file: '.red + filepath);
					return;
				}
				var schema;
				if (cache.hasOwnProperty(f.dest)) {
					//grunt.log.writeln('schema cache: ' + f.dest);
					schema = cache[f.dest];
				}
				else {
					if (!grunt.file.exists(f.dest)) {
						grunt.log.fail('schema not found: '.red + f.dest);
						return;
					}
					if (!grunt.file.isFile(f.dest)) {
						grunt.log.fail('schema not a file: '.red + f.dest);
						return;
					}
					schema = grunt.file.readJSON(f.dest);
					schema.path = f.dest;
					cache[f.dest] = schema;
					//grunt.log.writeln('schema load: ' + f.dest);
				}

				var data = grunt.file.readJSON(filepath);
				var result;
				if (options.multi){
					result = tv4.validateMultiple(data, schema);
				}
				else {
					result = tv4.validateResult(data, schema);
				}

				result.data = data;
				result.path = filepath;
				result.schema = schema;

				if (!result.valid || result.missing.length > 0) {
					fail.push(result);
				}
				else {
					pass.push(result);
					grunt.log.writeln('pass: '.green + filepath);
				}
			});
		});
		var printError = function (error, data, schema, indent) {
			//grunt.log.writeln(util.inspect(error, false, 4));
			var value = jsonpointer.get(data, error.dataPath);
			var schemaValue = jsonpointer.get(schema, error.schemaPath);
			grunt.log.writeln(indent + error.message);
			grunt.log.writeln(indent + indent + error.dataPath);
			grunt.log.writeln(indent + indent + '-> value: ' + valueType(value) + ' -> ' + valueStrim(value));
			grunt.log.writeln(indent + indent + '-> schema: ' + schemaValue + ' -> ' + error.schemaPath);

			//untested
			/*grunt.util._.each(error.subErrors, function (error) {
				printError(error, data, schema, indent + indent + indent + indent);
			});*/
		};

		if (fail.length > 0) {
			grunt.util._.each(fail, function (result) {
				grunt.log.writeln('fail: '.red + result.path + ' != '.red + result.schema.path);
				if (result.errors) {
					grunt.util._.each(result.errors, function (error) {
						printError(error, result.data, result.schema, '   ');
					});
				}
				else if (result.error) {
					printError(result.error, result.data, result.schema, '  ');
				}
				if (result.missing.length > 0) {
					grunt.log.writeln('missing schemas:'.yellow);
					grunt.util._.each(result.missing, function (missing) {
						grunt.log.writeln(missing);
					});
				}
			});

			grunt.log.fail('-> '.white + 'tv4 ' + ('validated ' + pass.length).green + ', ' + ('failed ' + fail.length).red);
			return false;
		}
		grunt.log.ok('-> '.white + 'tv4 ' + ('validated ' + pass.length).green);
	});

};
