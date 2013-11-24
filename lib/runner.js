var loader = require('./loader');

function nextTick(call) {
	//lame setImmediate
	setTimeout(call, 1);
}

function forAsync(items, iter, callback) {
	var queue = items.slice(0);
	var step = function (err, callback) {
		nextTick(function () {
			if (err) {
				return callback(err);
			}
			if (queue.length === 0) {
				return callback();
			}
			iter(queue.pop(), queue.length, callback);
		});
	};
	step(null, callback);
}

function isURL(uri) {
	return (/^https?:/.test(uri) || /^file?:/.test(uri));
}

function getURLProtocol(uri) {
	return isURL(uri) ? uri.match(/^([\w+])?:/)[0] : '<unknown uri protocol>';
}

function getOptions() {
	var options = {
		schemas: {},
		root: null,
		timeout: 5000,
		fresh: false,
		multi: false,
		formats: {},
		add: [],
		checkRecursive: false,
		banUnknownProperties: false,
		languages: {},
		language: null
	};
	return options;
}

//TODO remove grunt
function getRunner(out, tv4, grunt, loader, reporter) {

	function getContext() {
		var context = {};
		context.done = null;
		context.fail = [];
		context.pass = [];
		context.objects = [];
		context.tv4 = tv4.freshApi();

		//import options
		context.options = {}

		context.run = function (callback) {
			context.fail = [];
			context.pass = [];
			if (context.done) {
				throw new Error('already running: ' + this);
			}
			context.done = function () {
				context.done = null;
				callback.apply(null, arguments);
			}

			//start the flow
			loadSchemaList(context, context.tv4.getMissingUris(), function (err) {
				if (err) {
					return finaliseTask(err, context);
				}
				forAsync(context.objects, function (object, callback) {
					validateObject(context, object, callback);

				}, function (err) {
					finaliseTask(err, context);
				});
			});
		}
	}

	function finaliseTask(err, context) {
		if (err) {
			out.writeln('');
			out.writeln(out.error('error: ') + err);
			out.writeln('');
			context.done(false);
			return;
		}
		out.writeln('');

		reporter.reportBulk(out, context.fail, context.pass);

		if (context.fail.length === 0) {
			context.done(true);
		}
		else {
			out.writeln('');
			context.done(false);
		}
	}

	//load and add batch of schema by uri, repeat until all missing are solved
	function loadSchemaList(context, uris, callback) {
		var step = function () {
			if (uris.length === 0) {
				return callback();
			}
			var uri = uris[0];
			loader.loadHTTP(uri, {timeout: context.options.timeout}, function (err, schema) {
				if (err) {
					return callback(err);
				}
				context.tv4.addSchema(uri, schema);
				uris = context.tv4.getMissingUris();
				step();
			});
		};
		step();
	}

	//supports automatic lazy loading
	function recursiveTest(context, object, callback) {
		out.writeln('test: ' + object.path);

		if (context.options.multi) {
			object.result = context.tv4.validateMultiple(object.value, object.schema, context.options.checkRecursive, context.options.banUnknownProperties);
		}
		else {
			object.result = context.tv4.validateResult(object.value, object.schema, context.options.checkRecursive, context.options.banUnknownProperties);
		}

		if (!object.result.valid) {
			context.fail.push(object);
			out.writeln(out.error('fail: ') + object.label);
			return callback();
		}
		if (object.result.missing.length === 0) {
			context.pass.push(object);
			out.writeln(out.success('pass: ') + object.label);
			return callback();
		}

		loadSchemaList(context, object.result.missing, function (err) {
			if (err) {
				return callback(err);
			}
			//check again
			recursiveTest(context, object, callback);
		});
	}

	function startLoading(context, object, callback) {
		//pre fetch (saves a validation round)
		loadSchemaList(context, context.tv4.getMissingUris(), function (err) {
			if (err) {
				return callback(err);
			}
			recursiveTest(context, object, callback);
		});
	}

	//validate single object
	function validateObject(context, object, callback) {
		out.writeln('-> ' + reporter.extractCTXLabel(out, object));

		if (typeof object.value === 'undefined') {
			var onLoad = function (err, obj) {
				if (err) {
					return callback(err);
				}
				object.value = obj;
				doValidateObject(context, object, callback);
			};
			var opts = {timeout: context.options.timeout || 5000};
			//TODO verify http:, file: and plain paths all load properly
			if (object.path) {
				object.value = loader.loadPath(object.path, opts, onLoad);
			}
			else if (object.url) {
				object.value = loader.loadURL(object.url, opts, onLoad);
			}
		}
		else {
			doValidateObject(context, object, callback);
		}
	}

	function doValidateObject(context, object, callback) {
		if (!context.options.root) {
			out.writeln(out.warn('no explicit root schema'));
			out.writeln('');
			context.done(false);
			return;
		}
		switch (context.options.root) {
			case 'object':
				if (!Array.isArray(context.options.root)) {
					object.schema = context.options.root;
					context.tv4.addSchema((object.schema.id || ''), object.schema);

					startLoading(context, object, callback);
				}
				break;
			case 'string':
				//known from previous sessions?
				var schema = context.tv4.getSchema(object.root);
				if (schema) {
					out.writeln('have: ' + object.root);
					object.schema = schema;

					recursiveTest(context, object, callback);
					return;
				}

				if (isURL(object.root)) {
					out.writeln(getURLProtocol(object.root) + ': ' + object.root);

					loader.loadURL(context, object.root, function (err, schema) {
						if (err) {
							return callback(err);
						}
						object.schema = schema;
						context.tv4.addSchema(object.root, schema);

						startLoading(context, object, callback);
					});
					return;
				}
				else {
					out.writeln('file: ' + object.root);

					loader.loadPath(context, object.root, function (err, schema) {
						if (err) {
							return callback(err);
						}
						object.schema = schema;
						//TODO use object.root? as id? (no, not uri: file:// uris are catched above)
						context.tv4.addSchema(object.schema.id || '', object.schema);

						startLoading(context, object, callback);
					});
				}
				break;
			default:
				callback(new Error('dont know how to load: ' + context.options.root))
				break;
		}
		callback(new Error())
	}

	return {
		getContext: getContext
	};
}

module.exports = {
	isURL: isURL,
	getURLProtocol: getURLProtocol,
	getOptions: getOptions,
	getRunner: getRunner
};
