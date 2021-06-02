/* eslint-disable unicorn/prefer-module */

const fs = require('fs');
const http = require('http');
const	https = require('https');

const loadHTTP = (uri, options, callback) => {
	const options_ = {
		timeout: options ? options.timeout : 5000
	};

	let adapter = http;

	if (uri.startsWith('https:')) {
		adapter = https;

		if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
			// In a test environment, don't reject unauthorized SSL connections
			options_.agent = new https.Agent({
				rejectUnauthorized: false
			});
		}
	}

	adapter.get(uri, options_, (response) => {
		const { statusCode } = response;
		let error;

		if (statusCode !== 200) {
			error = new Error('Request Failed.\n' +
				`Status Code: ${statusCode}`);
		}

		if (error) {
			// Consume response data to free up memory
			response.resume();
			return callback(error);
		}

		response.setEncoding('utf8');
		let rawData = '';
		let value;
		response.on('data', (chunk) => {
			rawData += chunk;
		});
		response.on('end', () => {
			try {
				value = JSON.parse(rawData);
				callback(null, value);
			} catch (error) {
				return callback(error);
			}
		});
	}).on('error', (error) => {
		return callback(error);
	});
};

const loadPath = (src, options, callback) => {
	fs.readFile(src, 'utf8', (error, string_) => { // eslint-disable-line node/prefer-promises/fs
		string_ = string_.replace(/^\uFEFF/, ''); // Strip BOM if it exists
		if (error) {
			return callback(error);
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
