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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-continue');

	grunt.loadTasks('tasks');

	var util = require('util');

	//used by format checker
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
			options: grunt.util._.defaults(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter'
			}),
			all: [
				'Gruntfile.js',
				'lib/**/*.js',
				'tasks/**/*.js'
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
			pass_prop: {
				_twice: true,
				options: {
					fresh: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/pass.json'
				]
			},
			pass_remote: {
				_twice: true,
				options: {
					fresh: true,
					root: 'http://localhost:9090/remote/schema/schema.json'
				},
				src: [
					'test/fixtures/remote/pass.json',
					'test/fixtures/remote/pass.json'
				]
			},
			pass_remote_local: {
				_twice: true,
				options: {
					fresh: true,
					root: 'test/fixtures/remote/schema/schema.json'
				},
				src: [
					'test/fixtures/remote/pass.json',
					'test/fixtures/remote/pass.json'
				]
			},
			fail_single: {
				options: {
					fresh: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/pass.json',
					'test/fixtures/object_props/fail.json'
				]
			},
			fail_multi: {
				options: {
					fresh: true,
					multi: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/fail.json'
				]
			},
			fail_remote: {
				options: {
					fresh: true,
					root: 'http://localhost:9090/remote/schema/schema.json'
				},
				src: [
					'test/fixtures/remote/fail.json'
				]
			},
			fail_remoteNotFound: {
				options: {
					fresh: true,
					root: 'http://localhost:9090/remote/schema/non-existing.json'
				},
				src: [
					'test/fixtures/remote/pass.json'
				]
			},
			pass_format: {
				options: {
					fresh: true,
					root: 'test/fixtures/format/schema.json',
					formats: {
						'date': dateValidateCallback
					}
				},
				src: [
					'test/fixtures/format/pass.json'
				]
			},
			fail_format: {
				options: {
					fresh: true,
					root: 'test/fixtures/format/schema.json',
					formats: {
						'date': dateValidateCallback
					}
				},
				src: [
					'test/fixtures/format/fail.json'
				]
			},
			pass_bulk: {
				options: {
					fresh: true,
					root: 'test/fixtures/bulk/schema/schema.json',
					add: [
						grunt.file.readJSON('test/fixtures/bulk/schema/alpha.json'),
						grunt.file.readJSON('test/fixtures/bulk/schema/beta.json')
					]
				},
				src: [
					'test/fixtures/bulk/pass.json',
					'test/fixtures/bulk/pass.json'
				]
			},
			fail_bulk: {
				options: {
					fresh: true,
					root: 'test/fixtures/bulk/schema/schema.json',
					add: [
						grunt.file.readJSON('test/fixtures/bulk/schema/alpha.json'),
						grunt.file.readJSON('test/fixtures/bulk/schema/beta.json')
					]
				},
				src: [
					'test/fixtures/bulk/fail.json'
				]
			},
			pass_rootObject: {
				options: {
					fresh: true,
					root: grunt.file.readJSON('test/fixtures/bulk/schema/schema.json'),
					add: [
						grunt.file.readJSON('test/fixtures/bulk/schema/alpha.json'),
						grunt.file.readJSON('test/fixtures/bulk/schema/beta.json')
					]
				},
				src: [
					'test/fixtures/bulk/pass.json',
					'test/fixtures/bulk/pass.json'
				]
			},
			fail_rootObject: {
				options: {
					fresh: true,
					root: grunt.file.readJSON('test/fixtures/bulk/schema/schema.json'),
					add: [
						grunt.file.readJSON('test/fixtures/bulk/schema/alpha.json'),
						grunt.file.readJSON('test/fixtures/bulk/schema/beta.json')
					]
				},
				src: [
					'test/fixtures/bulk/fail.json'
				]
			},
			pass_subError: {
				options: {
					fresh: true,
					root: grunt.file.readJSON('test/fixtures/subError/schema.json')
				},
				src: [
					'test/fixtures/subError/pass.json'
				]
			},
			fail_subError: {
				options: {
					fresh: true,
					root: grunt.file.readJSON('test/fixtures/subError/schema.json')
				},
				src: [
					'test/fixtures/subError/fail.json',
					'test/fixtures/subError/fail_deeper.json',
				]
			},
			fail_subErrorMulti: {
				options: {
					fresh: true,
					multi: true,
					root: grunt.file.readJSON('test/fixtures/subError/schema.json')
				},
				src: [
					'test/fixtures/subError/fail_deeper.json',
				]
			}
		}
	});

	//used by format checker
	var passNames = [];
	var failNames = [];
	var tv4 = grunt.config.get('tv4');
	Object.keys(tv4).forEach(function (name) {
		if (/^pass_/.test(name)) {
			passNames.push('tv4:' + name);
			if (tv4[name]._twice) {
				passNames.push('tv4:' + name);
			}
		}
		else if (/^fail_/.test(name)) {
			failNames.push('tv4:' + name);
			if (tv4[name]._twice) {
				failNames.push('tv4:' + name);
			}
		}
		else {
			passNames.push('tv4:' + name);
		}
	});

	grunt.registerTask('pass', passNames);
	grunt.registerTask('fail', failNames);

	grunt.registerTask('test', ['jshint', 'connect', 'pass', 'continueOn', 'fail', 'continueOff']);

	grunt.registerTask('dev', ['jshint', 'connect', 'tv4:remoteNotFound']);
	grunt.registerTask('edit_01', ['jshint', 'tv4:fail_subErrorMulti']);

	grunt.registerTask('run', ['fail']);
	grunt.registerTask('default', ['test']);
};
