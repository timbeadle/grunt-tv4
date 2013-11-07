/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
	/*jshint unused:false*/

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-continue');

	grunt.loadTasks('tasks');

	var util = require('util');

	var dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
	var dateValidateCallback = function (data, schema) {
		if (typeof data !== 'string' || !dateRegex.test(data)) {
			// return error message
			return 'value must be string of the form: YYYY-MM-DD';
		}
		return null;
	};

	grunt.initConfig({
		jshint: {
			options:{
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'tasks/*.js'
			]
		},
		connect: {
			run: {
				options: {
					port: 9090,
					base: 'test/fixtures/'
				}
			}
		},
		tv4: {
			pass: {
				options: {
				},
				files: {
					'test/fixtures/object_props/schema.json': [
						'test/fixtures/object_props/pass.json'
					],
					'http://localhost:9090/remote/schema/schema.json': [
						'test/fixtures/remote/pass.json',
						'test/fixtures/remote/pass.json'
					],
					'test/fixtures/remote/schema/schema.json': [
						'test/fixtures/remote/pass.json',
						'test/fixtures/remote/pass.json'
					]
				}
			},
			bad_single: {
				options: {
				},
				files: {
					'test/fixtures/object_props/schema.json': [
						'test/fixtures/object_props/pass.json',
						'test/fixtures/object_props/fail.json'
					]
				}
			},
			bad_multi: {
				options: {
					multi: true
				},
				files: {
					'test/fixtures/object_props/schema.json': [
						'test/fixtures/object_props/fail.json'
					]
				}
			},
			remoteNotFound: {
				options: {
				},
				files: {
					'http://localhost:9090/remote/schema/non-existing.json': [
						'test/fixtures/remote/pass.json'
					]
				}
			},
			remoteMixed: {
				options: {
				},
				files: {
					'http://localhost:9090/remote/schema/schema.json': [
						'test/fixtures/remote/pass.json',
						'test/fixtures/remote/fail.json'
					],
					'test/fixtures/remote/schema/schema.json': [
						'test/fixtures/remote/pass.json',
						'test/fixtures/remote/fail.json'
					]
				}
			},
			format_pass : {
				options: {
					fresh: true,
					formats: {
						'date': dateValidateCallback
					}
				},
				files: {
					'test/fixtures/format/schema.json': [
						'test/fixtures/format/pass.json'
					]
				}
			},
			format_fail : {
				options: {
					fresh: true,
					formats: {
						'date': dateValidateCallback
					}
				},
				files: {
					'test/fixtures/format/schema.json': [
						'test/fixtures/format/fail.json'
					]
				}
			}
		}
	});

	//run twice for caching
	grunt.registerTask('pass', ['tv4:pass', 'tv4:pass', 'tv4:format_pass']);
	grunt.registerTask('fail', ['tv4:bad_single', 'tv4:bad_multi', 'tv4:remoteNotFound', 'tv4:remoteMixed', 'tv4:format_fail']);

	grunt.registerTask('test', ['jshint', 'connect', 'pass', 'continueOn', 'fail', 'continueOff']);

	grunt.registerTask('dev', ['jshint', 'connect', 'tv4:remoteNotFound']);

	grunt.registerTask('run', ['fail']);
	grunt.registerTask('default', ['test']);



};
