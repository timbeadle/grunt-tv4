/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

var taskTv4 = require('tv4').freshApi();
var reporter = require('tv4-reporter');
var loader = require('../lib/loader').getLoaders();
var runner = require('../lib/runner');

module.exports = function (grunt) {

	// modify adapter
	var gruntOut = reporter.getColorsJSOut();
	gruntOut.writeln = function (str) {
		if (arguments.length > 0) {
			grunt.log.writeln(str);
		}
	};

	//print all results and finish task
	function finaliseTask(err, context) {
		if (err) {
			grunt.log.writeln();
			grunt.log.warn('error: '.red + err);
			grunt.log.writeln();
			context.done(false);
			return;
		}
		grunt.log.writeln();

		reporter.reportBulk(gruntOut, context.fail, context.pass);

		if (context.fail.length === 0) {
			context.done(true);
		}
		else {
			grunt.log.writeln();
			context.done(false);
		}
	}

	var runner = runner.getRunner(gruntOut, taskTv4, grunt, loader, reporter);

	grunt.registerMultiTask('tv4', 'Validate values against json-schema v4.', function () {

		//import options
		runner.options = this.options(runner.getDefault(), {
			schemas: {},
			root: null,
				timeout: 5000,
				fresh: false,
				multi: false,
				formats: {},
			add: [],
				checkRecursive: false,
				banUnknownProperties: false,
				languages: {},
			language: null
		});

		if (runner.options.fresh) {
			runner.tv4 = taskTv4.freshApi();
		}

		grunt.util._.each(runner.options.schemas, function (schema, uri) {
			runner.tv4.addSchema(uri, schema);
		});

		runner.tv4.addFormat(runner.options.formats);

		grunt.util._.each(runner.options.languages, function (language, id) {
			runner.tv4.addLanguage(id, language);
		});
		if (runner.options.language) {
			runner.tv4.language(runner.options.language);
		}

		//flatten list for sanity
		grunt.util._.each(this.files, function (f) {
			grunt.util._.some(f.src, function (filePath) {
				if (!grunt.file.exists(filePath)) {
					grunt.log.warn('file "' + filePath + '" not found.');
					return true;
				}
				runner.objects.push({
					path: filePath,
					label: filePath,
					root: runner.options.root
				});
			});
		});

		var values = this.data.values;
		if (typeof values === 'function') {
			values = values();
		}

		if (typeof values === 'object') {
			var keyPrefix = (Array.isArray(values) ? 'value #' : '');
			grunt.util._.some(values, function (value, key) {
				runner.objects.push({
					label: keyPrefix + key,
					value: value,
					root: runner.options.root
				});
			});
		}

		if (runner.objects.length === 0) {
			grunt.log.warn('zero input objects selected');
			grunt.log.writeln();
			runner.done(false);
			return;
		}

		if (runner.options.add && Array.isArray(runner.options.add)) {
			grunt.util._.some(runner.options.add, function (schema) {
				if (typeof schema === 'string') {
					//juggle
					schema = grunt.file.readJSON(schema);
				}
				if (typeof schema.id === 'undefined') {
					grunt.log.warn('options.add: schema missing required id field (use options.schema to map it manually)');
					grunt.log.writeln();
					runner.done(false);
					return true;
				}
				runner.tv4.addSchema(schema.id, schema);
			});
		}

		runner.run(this.async());
	});
};
