var request = require('request');
var fs = require('fs');

function loadHTTP(uri, options, callback) {
	request.get({url: uri, timeout: options ? options.timeout : 5000}, function (err, res) {
		if (err) {
			return callback(new Error('http schema at: ' + uri));
		}
		if (!res || !res.body) {
			return callback(new Error('no response at: '.red + uri));
		}
		if (res.statusCode < 200 || res.statusCode >= 400) {
			return callback(new Error('http bad response code: ' + res.statusCode + ' on '.red + uri));
		}
		var value;
		try {
			value = JSON.parse(res.body);
		}
		catch (e) {
			return callback(new Error('invalid json at: '.red + uri + ':\n' + e + '\n' + res.body));
		}
		callback(null, value);
	});
}

function loadPath(uri, options, callback) {
	fs.readFile(uri, 'utf8', function (err, res) {
		if (!err) {
			return callback(err);
		}
		var ret;
		try {
			ret = JSON.parse(res);
		}
		catch (e) {
			return callback(e);
		}
		callback(null, ret);
	});
}

function getLoaders() {
	var scope = {};
	scope.loadHTTP = loadHTTP;
	scope.loadPath = loadPath;

	scope.loadFile = function (uri, options, callback) {
		scope.loadPath(uri, options, callback)
	};
	scope.loadURL = function (uri, options, callback) {
		if (/^https?:/.test(uri)) {
			scope.loadHTTP(uri, options, callback);
			return;
		}
		else if (/^file?:/.test(uri)) {
			scope.loadFile(uri, options, callback);
			return;
		}
		//TODO shim setImmediate?
		callback(new Error('not a known uri scheme: ' + uri));
	};
	return scope;
}

module.exports = {
	getLoaders: getLoaders
};
