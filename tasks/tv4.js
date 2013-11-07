/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	function valueType(value) {
		var t = typeof value;
		if (t === 'object') {
			if (Object.prototype.toString.call(value) === '[object Array]') {
				return 'array';
			}
		}
		return t;
	}

	function valueStrim(value) {
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
	}

	function pluralise(str, num) {
		if (num === 1) {
			return str;
		}
		return str + 's';
	}

	//TODO decide to tv4 outside task for inter-target caching?
	var taskTv4 = require('tv4').tv4.freshApi();
	var jsonpointer = require('jsonpointer.js');
	var request = require('request');

	//load a single schema by uri
	function loadSchemaFile(context, uri, callback) {

		if (!/^https?:/.test(uri)) {
			callback('not a http uri: ' + uri);
		}
		grunt.log.writeln('load: ' + uri);

		request.get({url: uri, timeout: context.options.timeout}, function (err, res) {
			//grunt.log.writeln('done: ' + uri);
			if (err) {
				return callback('http schema at: ' + uri);
			}
			if (!res || !res.body) {
				return callback('no response at: '.red + uri);
			}
			if (res.statusCode < 200 || res.statusCode >= 400) {
				return callback('http bad response code: ' + res.statusCode + ' on '.red + uri);
			}

			var schema;
			try {
				schema = JSON.parse(res.body);
			}
			catch (e) {
				return callback('invalid json at: '.red + uri + ':\n' + e + '\n' + res.body);
			}
			callback(null, schema);
		});
	}

	//load and add batch of schema by uri, repeat until all missing are solved
	function loadSchemaList(context, uris, callback) {
		var step = function () {
			if (uris.length === 0) {
				return callback();
			}
			var uri = uris[0];
			loadSchemaFile(context, uri, function (err, schema) {
				if (err) {
					return callback(err);
				}
				context.tv4.addSchema(uri, schema);
				uris = context.tv4.getMissingUris();
				step();
			});
		};
		step();
	}

	//print all results and finish task
	function finaliseTask(err, context) {
		if (err) {
			grunt.log.writeln();
			grunt.log.warn('error: '.red + err);
			grunt.log.writeln();
			context.done(false);
			return;
		}

		//subroutine
		var printError = function (error, data, schema, indent) {
			var value = jsonpointer.get(data, error.dataPath);
			var schemaValue = jsonpointer.get(schema, error.schemaPath);

			grunt.log.writeln(indent + error.message.yellow);
			grunt.log.writeln(indent + indent + error.dataPath);
			grunt.log.writeln(indent + indent + '-> value: ' + valueType(value) + ' -> ' + valueStrim(value));
			if (typeof schemaValue !== 'undefined') {
				grunt.log.writeln(indent + indent + '-> schema: ' + schemaValue + ' -> ' + error.schemaPath);
			}
			else {
				grunt.log.writeln(indent + indent + '-> schema-path: ' + error.schemaPath);
			}
			//untested
			/*grunt.util._.each(error.subErrors, function (error) {
			 printError(error, data, schema, indent + indent + indent + indent);
			 });*/
		};

		//got some failures: print log and fail the task
		if (context.fail.length > 0) {
			grunt.log.writeln();
			grunt.log.writeln('-> tv4 reporting ' + (context.fail.length + ' ' + pluralise('invalid file', context.fail.length) + ':').red);
			grunt.log.writeln();

			grunt.util._.each(context.fail, function (file) {
				var report = '';
				if (typeof file.root === 'string') {
					report = ' !== '.red + file.root;
				}
				else if (typeof file.root === 'object') {
					if (file.root.id) {
						report = ' !== '.red + file.root.id;
					}
				}
				grunt.log.writeln('fail: '.red + file.path + report);
				if (file.result.errors) {
					grunt.util._.each(file.result.errors, function (error) {
						printError(error, file.data, file.schema, '   ');
					});
				}
				else if (file.result.error) {
					printError(file.result.error, file.data, file.schema, '  ');
				}
				if (file.result.missing.length > 0) {
					grunt.log.writeln('missing schemas: '.yellow);
					grunt.util._.each(file.result.missing, function (missing) {
						grunt.log.writeln(missing);
					});
				}
			});

			grunt.log.writeln();
			grunt.log.warn('tv4 ' + ('validated ' + context.pass.length).yellow + ', ' + ('failed ' + context.fail.length).red + ' of ' + (context.fileCount + ' ' + pluralise('file', context.fileCount)).cyan + '\n');
			grunt.log.writeln();
			context.done(false);
		}
		else {
			grunt.log.writeln();
			grunt.log.ok('tv4 ' + ('validated ' + context.pass.length).green + ' of ' + (context.fileCount + ' ' + pluralise('file', context.fileCount)).cyan + '\n');
			context.done();
		}
	}

	//supports automatic lazy loading
	function recursiveTest(context, file, callback) {

		grunt.log.writeln('test: ' + file.path);

		if (context.options.multi) {
			file.result = context.tv4.validateMultiple(file.data, file.schema, context.options.checkRecursive, context.options.banUnknownProperties);
		}
		else {
			file.result = context.tv4.validateResult(file.data, file.schema, context.options.checkRecursive, context.options.banUnknownProperties);
		}

		if (!file.result.valid) {
			context.fail.push(file);
			grunt.log.writeln('fail: '.red + file.path);
			return callback();
		}
		if (file.result.missing.length === 0) {
			context.pass.push(file);
			grunt.log.writeln('pass: '.green + file.path);
			return callback();
		}
		loadSchemaList(context, file.result.missing, function (err) {
			if (err) {
				return callback(err);
			}
			//check again
			recursiveTest(context, file, callback);
		});
	}

	function startLoading(context, file, callback) {
		//pre fetch (saves a validation round)
		loadSchemaList(context, context.tv4.getMissingUris(), function (err) {
			if (err) {
				return callback(err);
			}
			recursiveTest(context, file, callback);
		});
	}

	//validate single file
	function validateFile(context, file, callback) {

		grunt.log.writeln('-> ' + file.path.cyan);

		file.data = grunt.file.readJSON(file.path);

		if (!context.options.root) {
			grunt.log.warn('no explicit root schema');
			grunt.log.writeln();
			context.done(false);
		}
		else if (typeof context.options.root === 'object') {
			if (!Array.isArray(context.options.root)) {
				file.schema = context.options.root;
				context.tv4.addSchema((file.schema.id || ''), file.schema);

				startLoading(context, file, callback);
			}
			//TODO support loops?
		}
		else if (typeof context.options.root === 'string') {
			if (/^https?:/.test(file.root)) {

				grunt.log.writeln('http: ' + file.root);

				//known from previous sessions?
				var schema = context.tv4.getSchema(file.root);
				if (schema) {
					grunt.log.writeln('have: ' + file.root);
					file.schema = schema;

					recursiveTest(context, file, callback);
				}
				else {
					loadSchemaFile(context, file.root, function (err, schema) {
						if (err) {
							return callback(err);
						}
						file.schema = schema;
						context.tv4.addSchema(file.root, schema);

						startLoading(context, file, callback);
					});
				}
			}
			else {
				grunt.log.writeln('file: ' + file.root);

				if (!grunt.file.exists(file.root)) {
					return callback('not found: '.red + file.root);
				}
				if (!grunt.file.isFile(file.root)) {
					return callback('not a file: '.red + file.root);
				}
				file.schema = grunt.file.readJSON(file.root);

				context.tv4.addSchema(file.schema.id || '', file.schema);

				startLoading(context, file, callback);
			}
		}
	}

	grunt.registerMultiTask('tv4', 'Your task description goes here.', function () {

		var context = {};
		context.done = this.async();
		context.fileCount = 0;
		context.fail = [];
		context.pass = [];
		context.files = [];
		context.tv4 = taskTv4;

		//import options
		context.options = this.options({
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

		if (context.options.fresh) {
			context.tv4 = taskTv4.freshApi();
		}

		grunt.util._.each(context.options.schemas, function (schema, uri) {
			context.tv4.addSchema(uri, schema);
		});
		grunt.util._.each(context.options.formats, function (format, id) {
			context.tv4.addFormat(id, format);
		});
		grunt.util._.each(context.options.languages, function (language, id) {
			context.tv4.addLanguage(id, language);
		});
		if (context.options.language) {
			context.tv4.language(context.options.language);
		}

		//flatten list for sanity
		grunt.util._.each(this.files, function (f) {
			grunt.util._.each(f.src, function (filePath) {
				if (!grunt.file.exists(filePath)) {
					grunt.log.warn('file "' + filePath + '" not found.');
					return false;
				}
				context.fileCount++;
				context.files.push({path: filePath, data: null, schema: null, root: context.options.root});
			});
		});

		if (context.fileCount === 0) {
			grunt.log.warn('zero input files selected');
			grunt.log.writeln();
			context.done(false);
			return;
		}

		if (context.options.add && Array.isArray(context.options.add)) {
			grunt.util._.each(context.options.add, function (schema) {
				if (typeof schema === 'string') {
					//juggle
					schema = grunt.file.readJSON(schema);
				}
				if (typeof schema.id === 'undefined') {
					grunt.log.warn('options.add: schema missing required id field (use options.schema to map it manually)');
					grunt.log.writeln();
					context.done(false);
					return false;
				}
				context.tv4.addSchema(schema.id, schema);
			});
		}

		//start the flow
		loadSchemaList(context, context.tv4.getMissingUris(), function (err) {
			if (err) {
				return finaliseTask(err, context);
			}
			grunt.util.async.forEachSeries(context.files, function (file, callback) {
				validateFile(context, file, callback);

			}, function (err) {
				finaliseTask(err, context);
			});
		});
	});
};
