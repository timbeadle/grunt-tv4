/*
 * grunt-tv4
 * https://github.com/Bartvds/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		tv4: {
			pass: {
				options: {
				},
				files: {
					'test/fixtures/object_props/schema.json': ['test/fixtures/object_props/pass.json']
				}
			},
			fail_single: {
				options: {
				},
				files: {
					'test/fixtures/object_props/schema.json': ['test/fixtures/object_props/pass.json', 'test/fixtures/object_props/fail.json']
				}
			},
			fail_multi: {
				options: {
					multi: true
				},
				files: {
					'test/fixtures/object_props/schema.json': ['test/fixtures/object_props/fail.json']
				}
			}
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('default', ['dev']);

	grunt.registerTask('dev', ['jshint', 'tv4']);
	grunt.registerTask('test', ['jshint', 'tv4:pass']);


};
