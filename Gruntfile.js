/*
 * Grunt wrapper for tv4 - grunt-tv4
 * https://github.com/timbeadle/grunt-tv4
 *
 * Copyright (c) 2013 Bart van der Schoor
 * Licensed under the MIT license.
 */

/* eslint camelcase: 0, unicorn/filename-case: 0 */

'use strict';

module.exports = function (grunt) {
	// Load all npm grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.loadTasks('tasks');

	// Used by format checker
	const dateRegex = /^\d{4}(?:-\d{1,2}){2}$/;
	const dateValidateCallback = (data) => {
		if (typeof data !== 'string' || !dateRegex.test(data)) {
			// Return error message
			return 'value must be string of the form: YYYY-MM-DD';
		}

		return null;
	};

	grunt.initConfig({
		eslint: {
			options: {
				configFile: '.eslintrc.yml'
			},
			src: [
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
					'test/fixtures/object_props/pass_a.json'
				]
			},
			pass_many: {
				options: {
					fresh: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/pass_a.json',
					'test/fixtures/object_props/pass_b.json',
					'test/fixtures/object_props/pass_c.json'
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
					'test/fixtures/object_props/pass_a.json',
					'test/fixtures/object_props/fail_a.json'
				]
			},
			fail_multi: {
				options: {
					fresh: true,
					multi: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/fail_a.json'
				]
			},
			fail_many_multi: {
				options: {
					fresh: true,
					multi: true,
					root: 'test/fixtures/object_props/schema.json'
				},
				src: [
					'test/fixtures/object_props/fail_a.json',
					'test/fixtures/object_props/fail_b.json',
					'test/fixtures/object_props/fail_c.json'
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
						date: dateValidateCallback
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
			pass_rootObject_cb: {
				options: {
					fresh: true,
					root: () => {
						return grunt.file.readJSON('test/fixtures/bulk/schema/schema.json');
					},
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
			pass_rootObject_add_cb: {
				options: {
					fresh: true,
					root: grunt.file.readJSON('test/fixtures/bulk/schema/schema.json'),
					add: () => {
						return [
							grunt.file.readJSON('test/fixtures/bulk/schema/alpha.json'),
							grunt.file.readJSON('test/fixtures/bulk/schema/beta.json')
						];
					}
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
					'test/fixtures/subError/fail_deeper.json'
				]
			},
			fail_subErrorMulti: {
				options: {
					fresh: true,
					multi: true,
					root: grunt.file.readJSON('test/fixtures/subError/schema.json')
				},
				src: [
					'test/fixtures/subError/fail_deeper.json'
				]
			},
			pass_values: {
				options: {
					fresh: true,
					multi: true,
					root: {
						type: 'string'
					}
				},
				values: [
					'valueAlpha',
					'valueBravo'
				]
			},
			fail_valuesArray: {
				options: {
					fresh: true,
					multi: true,
					root: {
						type: 'string'
					}
				},
				values: [
					false,
					123
				]
			},
			fail_valuesObject: {
				options: {
					fresh: true,
					multi: true,
					root: {
						type: 'string'
					}
				},
				values: {
					'myBooleanValue': false,
					'myNumberValue': 1
				}
			},
			fail_valuesCallback: {
				options: {
					fresh: true,
					multi: true,
					root: {
						type: 'string'
					}
				},
				values: () => {
					return {
						'callbackBoolean': false,
						'callbackNumber': 1
					};
				}
			},
			pass_package: {
				options: {
					fresh: true,
					multi: false,
					root: require('package.json-schema').get()
				},
				'src': ['./package.json']
			}
		}
	});

	// Used by format checker
	const passNames = [];
	const failNames = [];
	const conf = grunt.config.get('tv4');

	Object.keys(conf).sort().forEach((name) => {
		if (name.startsWith('pass_')) {
			passNames.push('tv4:' + name);
			if (conf[name]._twice) {
				passNames.push('tv4:' + name);
			}
		} else if (name.startsWith('fail_')) {
			failNames.push('tv4:' + name);
			if (conf[name]._twice) {
				failNames.push('tv4:' + name);
			}
		} else {
			passNames.push('tv4:' + name);
		}
	});

	grunt.registerTask('pass', passNames);
	grunt.registerTask('fail', failNames);

	grunt.registerTask('test', ['connect', 'pass', 'continue:on', 'fail', 'continue:off']);

	grunt.registerTask('dev', ['connect', 'tv4:fail_many_multi']);
	grunt.registerTask('edit_01', ['tv4:fail_subErrorMulti']);
	grunt.registerTask('edit_02', ['tv4:pass_values', 'tv4:fail_valuesArray', 'tv4:fail_valuesObject', 'tv4:fail_valuesCallback']);
	grunt.registerTask('edit_03', ['tv4:fail_subError']);

	grunt.registerTask('run', ['fail']);
	grunt.registerTask('dev', ['tv4:pass_package']);
	grunt.registerTask('default', ['test']);
};
