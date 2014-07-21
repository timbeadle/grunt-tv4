var request = require('request');
var fs = require('fs');

function loadHTTP(uri, options, callback) {
	request.get({url: uri, timeout: options ? options.timeout : 5000}, function (err, res) {
		if (err) {
			return callback(err);
		}
		if (!res || !res.body) {
			return callback(new Error('empty response at: ' + uri));
		}
		if (res.statusCode < 200 || res.statusCode >= 400) {
			return callback(new Error('http bad response code: ' + res.statusCode + ' on ' + uri));
		}
		var value;
		try {
			value = JSON.parse(res.body);
		}
		catch (e) {
			return callback(e);
		}
		callback(null, value);
	});
}

function loadPath(src, options, callback) {
	fs.readFile(src, 'utf8', function (err, str) {
		str = str.replace(/^\uFEFF/, ''); // Strip BOM if it exist
		if (err) {
			return callback(err);
		}
		var value;
		try {
			value = JSON.parse(str);
		}
		catch (e) {
			return callback(e);
		}
		callback(null, value);
	});
}

function getLoaders() {
	var scope = {};
	scope.loadHTTP = loadHTTP;
	scope.loadPath = loadPath;

	scope.loadFile = function (uri, options, callback) {
		scope.loadPath(uri, options, callback);
	};
	scope.load = function (uri, options, callback) {
		if (/^https?:/.test(uri)) {
			scope.loadHTTP(uri, options, callback);
			return;
		}
		else if (/^file?:/.test(uri)) {
			scope.loadFile(uri, options, callback);
			return;
		}
		else {
			scope.loadPath(uri, options, callback);
			return;
		}
	};
	return scope;
}

module.exports = {
	getLoaders: getLoaders
};
