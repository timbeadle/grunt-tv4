const fs = require('fs');
const http = require('http');

const loadHTTP = (uri, options, callback) => {
	http.get(uri, {timeout: options ? options.timeout : 5000}, (response) => {
		const { statusCode } = response;
		let err;

		if (statusCode !== 200) {
			err = new Error('Request Failed.\n' +
												`Status Code: ${statusCode}`);
		}

		if (err) {
			// Consume response data to free up memory
			response.resume();
			return callback(err);
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
