/*
 * Grunt wrapper for tv4 - grunt-tv4
 * https://github.com/timbeadle/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

const taskTv4 = require('tv4').freshApi();
const reporter = require('tv4-reporter');
const ministyle = require('ministyle');
const miniwrite = require('miniwrite');
const loader = require('../lib/loader');
const runnerModule = require('../lib/runner');

module.exports = (grunt) => {
	const out = miniwrite.grunt(grunt);
	const style = ministyle.grunt();
	const report = reporter.getReporter(out, style);
	const runner = runnerModule.getRunner(
		taskTv4,
		loader.getLoaders(),
		out,
		style,
	);

	grunt.registerMultiTask('tv4', 'Validate values against json-schema v4.', function () {
		const done = this.async();

		// Import options
		const context = runner.getContext(this.options(runner.getOptions({
			timeout: 5000,
		})));

		const objects = [];

		if (context.options.fresh) {
			context.tv4 = taskTv4.freshApi();
		} else {
			context.tv4 = taskTv4;
		}

		grunt.util._.each(context.options.schemas, (schema, uri) => {
			context.tv4.addSchema(uri, schema);
		});

		context.tv4.addFormat(context.options.formats);

		grunt.util._.each(context.options.languages, (language, id) => {
			context.tv4.addLanguage(id, language);
		});

		if (context.options.language) {
			context.tv4.language(context.options.language);
		}

		// Flatten list for sanity
		grunt.util._.each(this.files, (f) => {
			grunt.util._.some(f.src, (filePath) => {
				if (!grunt.file.exists(filePath)) {
					grunt.log.warn('file "' + filePath + '" not found.');
					return true;
				}

				objects.push({
					path: filePath,
					label: filePath,
					root: context.options.root,
				});
			});
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		let { values } = this.data;
		if (typeof values === 'function') {
			values = values();
		}

		if (typeof values === 'object') {
			const keyPrefix = (Array.isArray(values) ? 'value #' : '');
			grunt.util._.some(values, (value, key) => {
				objects.push({
					label: keyPrefix + key,
					value,
					root: context.options.root,
				});
			});
		}
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		if (context.options.add && Array.isArray(context.options.add)) {
			grunt.util._.some(context.options.add, (schema) => {
				if (typeof schema === 'string') {
					// Juggle
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

		// grunt.verbose.writeln(util.inspect(context));

		context.validate(objects, (err, job) => {
			if (err) {
				throw err;
			}

			if (job) {
				report.reportBulk(job.failed, job.passed);
				if (!job.success) {
					grunt.log.writeln('');
				}

				done(job.success);
			} else {
				done(false);
			}
		});
	});
};
