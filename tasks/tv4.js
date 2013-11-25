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
//TODO externalise
var output = require('miniwrite');
var loader = require('../lib/loader');
var runnerModule = require('../lib/runner');

var util = require('util');

module.exports = function (grunt) {

	var runner = runnerModule.getRunner(taskTv4, output.createGrunt(grunt), loader.getLoaders(), reporter);

	grunt.registerMultiTask('tv4', 'Validate values against json-schema v4.', function () {
		var done = this.async();

		//import options
		var context = runner.getContext();

		context.options = this.options(runner.getOptions({
			timeout: 5000
		}));

		if (context.options.fresh) {
			context.tv4 = taskTv4.freshApi();
		}

		grunt.util._.each(context.options.schemas, function (schema, uri) {
			context.tv4.addSchema(uri, schema);
		});

		context.tv4.addFormat(context.options.formats);

		grunt.util._.each(context.options.languages, function (language, id) {
			context.tv4.addLanguage(id, language);
		});
		if (context.options.language) {
			context.tv4.language(context.options.language);
		}

		//flatten list for sanity
		grunt.util._.each(this.files, function (f) {
			grunt.util._.some(f.src, function (filePath) {
				if (!grunt.file.exists(filePath)) {
					grunt.log.warn('file "' + filePath + '" not found.');
					return true;
				}
				context.objects.push({
					path: filePath,
					label: filePath,
					root: context.options.root
				});
			});
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		var values = this.data.values;
		if (typeof values === 'function') {
			values = values();
		}

		if (typeof values === 'object') {
			var keyPrefix = (Array.isArray(values) ? 'value #' : '');
			grunt.util._.some(values, function (value, key) {
				context.objects.push({
					label: keyPrefix + key,
					value: value,
					root: context.options.root
				});
			});
		}
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		if (context.options.add && Array.isArray(context.options.add)) {
			grunt.util._.some(context.options.add, function (schema) {
				if (typeof schema === 'string') {
					//juggle
					schema = grunt.file.readJSON(schema);
				}
				if (typeof schema.id === 'undefined') {
					grunt.log.warn('options.add: schema missing required id field (use options.schema to map it manually)');
					grunt.log.writeln();
					context.done(false);
					return true;
				}
				context.tv4.addSchema(schema.id, schema);
			});
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		grunt.verbose.writeln(util.inspect(context));


		context.run(function(err, success) {
			//grunt.log.writeln(util.inspect(arguments));
			if (!success) {
				grunt.log.writeln('');
			}
			done(success);
		});
	});
};
