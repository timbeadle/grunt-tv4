/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {


	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.loadTasks('tasks');

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
						'http://localhost:9090/remote/pass.json',
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
			}
		}
	});

	grunt.registerTask('default', ['test']);

	grunt.registerTask('test', ['jshint', 'connect', 'tv4:pass', 'tv4:pass']);

	grunt.registerTask('dev', ['jshint', 'connect', 'tv4:remoteNotFound']);
	grunt.registerTask('run', ['jshint', 'connect', 'tv4:bad_multi']);

	grunt.registerTask('edit_01', ['jshint', 'connect', 'tv4:remoteNotFound']);
	grunt.registerTask('edit_02', ['jshint', 'connect', 'tv4:remoteMixed']);
	grunt.registerTask('edit_03', ['jshint', 'connect', 'tv4:bad_single']);


};
