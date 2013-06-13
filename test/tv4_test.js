'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var data = [

];
var expose = {};

grunt.util._.each(data, function(name) {

	expose[name] = function(test) {
		test.expect(0);

		var dir = 'test/fixtures/' + name + '/';
		var fail = grunt.file.read(dir + 'fail.json');
		var pass = grunt.file.read(dir + 'pass.json');
		var schema = grunt.file.read(dir + 'schema.json');

		//test.equal(actual, expected, 'should describe what the default behavior is.');

		test.done();
	};
});
