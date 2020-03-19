const fs = require('fs');
const request = require('request');

const loadHTTP = (uri, options, callback) => {
	request.get({url: uri, timeout: options ? options.timeout : 5000}, (err, response) => {
		if (err) {
			return callback(err);
		}

		if (!response || !response.body) {
			return callback(new Error('empty response at: ' + uri));
		}

		if (response.statusCode < 200 || response.statusCode >= 400) {
			return callback(new Error('http bad response code: ' + response.statusCode + ' on ' + uri));
		}

		let value;

		try {
			value = JSON.parse(response.body);
		} catch (error) {
			return callback(error);
		}

		callback(null, value);
	});
};

const loadPath = (src, options, callback) => {
	fs.readFile(src, 'utf8', (err, string_) => {
		string_ = string_.replace(/^\uFEFF/, ''); // Strip BOM if it exists
		if (err) {
			return callback(err);
		}

		let value;

		try {
			value = JSON.parse(string_);
		} catch (error) {
			return callback(error);
		}

		callback(null, value);
	});
};

const getLoaders = () => {
	const scope = {};
	scope.loadHTTP = loadHTTP;
	scope.loadPath = loadPath;

	scope.loadFile = (uri, options, callback) => {
		scope.loadPath(uri, options, callback);
	};

	scope.load = (uri, options, callback) => {
		if (/^https?:/.test(uri)) {
			scope.loadHTTP(uri, options, callback);
		} else if (/^file?:/.test(uri)) {
			scope.loadFile(uri, options, callback);
		} else {
			scope.loadPath(uri, options, callback);
		}
	};

	return scope;
};

module.exports = {
	getLoaders,
};
