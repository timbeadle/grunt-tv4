// Bulk validation core: composites with tv4, miniwrite, tv4-reporter and loaders

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function nextTick(call) {
	//lame setImmediate
	setTimeout(call, 1);
}

function forAsync(items, iter, callback) {
	var keys = Object.keys(items);
	var step = function (err, callback) {
		nextTick(function () {
			if (err) {
				return callback(err);
			}
			if (keys.length === 0) {
				return callback();
			}
			var key = keys.pop();
			iter(items[key], key, function(err){
				step(err, callback);
			});
		});
	};
	step(null, callback);
}

function copyProps(target, source, recursive) {
	if (source) {
		Object.keys(source).forEach(function (key) {
			if (recursive && typeof source[key] === 'object') {
				target[key] = copyProps((Array.isArray(source[key]) ? [] : {}), source[key], recursive);
				return;
			}
			target[key] = source[key];
		});
	}
	return target;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function isURL(uri) {
	return (/^https?:/.test(uri) || /^file:/.test(uri));
}

var headExp = /^(\w+):/;

function getURLProtocol(uri) {
	if (isURL(uri)) {
		headExp.lastIndex = 0;
		var res = headExp.exec(uri);
		if ((res && res.length >= 2)) {
			return res[1];
		}
	}
	return '<unknown uri protocol>';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getOptions(merge) {
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
	return copyProps(options, merge);
}

function getRunner(tv4, out, loader, reporter) {

	function getContext(options) {
		var context = {};
		context.fail = [];
		context.pass = [];
		context.objects = [];
		context.tv4 = tv4.freshApi();

		//import options
		context.options = {};
		if (options) {
			copyProps(context.options, options);
		}

		context.run = function (callback) {

			//TODO move the result dat into own object

			context.fail = [];
			context.pass = [];
			if (context.done) {
				throw new Error('already running: ' + this);
			}
			context.done = function () {
				var args = arguments;
				context.done = null;
				nextTick(function () {
					callback.apply(null, args);
				});
			};

			if (context.objects.length === 0) {
				out.writeln(out.warning('zero objects selected'));
				out.writeln('');
				context.done(null, false);
				return;
			}

			//start the flow
			loadSchemaList(context, context.tv4.getMissingUris(), function (err) {
				if (err) {
					return finaliseTask(err, context);
				}
				forAsync(context.objects, function (object, index, callback) {
					validateObject(context, object, callback);

				}, function (err) {
					finaliseTask(err, context);
				});
			});
		};
		return context;
	}

	function finaliseTask(err, context) {
		if (err) {
			out.writeln('');
			out.writeln(out.error('error: ') + err);
			out.writeln('');
			context.done(err, false);
			return;
		}
		out.writeln('');

		reporter.reportBulk(out, context.fail, context.pass);

		if (context.fail.length > 0) {
			context.done(null, false);
		}
		else {
			context.done(null, true);
		}
	}

	//load and add batch of schema by uri, repeat until all missing are solved
	function loadSchemaList(context, uris, callback) {
		var sweep = function () {
			if (uris.length === 0) {
				return callback();
			}

			forAsync(uris, function (uri, i, callback) {
				loader.load(uri, context.options, function (err, schema) {
					if (err) {
						return callback(err);
					}
					context.tv4.addSchema(uri, schema);
					uris = context.tv4.getMissingUris();
					callback();
				});
			}, function (err) {
				if (err) {
					return callback(err);
				}
				sweep();
			});
		};
		sweep();
	}

	//supports automatic lazy loading
	function recursiveTest(context, object, callback) {
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

		// auto load missing (if loading has an error  we'll bail way back)
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
		if (typeof object.value === 'undefined') {
			var onLoad = function (err, obj) {
				if (err) {
					return callback(err);
				}
				object.value = obj;
				doValidateObject(context, object, callback);
			};
			var opts = {timeout: (context.options.timeout || 5000)};
			//TODO verify http:, file: and plain paths all load properly
			if (object.path) {
				object.value = loader.loadPath(object.path, opts, onLoad);
			}
			else if (object.url) {
				object.value = loader.load(object.url, opts, onLoad);
			}
		}
		else {
			doValidateObject(context, object, callback);
		}
	}

	function doValidateObject(context, object, callback) {
		if (!object.root) {
			out.writeln(out.warn('no explicit root schema'));
			out.writeln('');
			context.done(null);
			return;
		}

		var t = typeof object.root;

		switch (t) {
			case 'object':
				if (!Array.isArray(object.root)) {
					object.schema = object.root;
					context.tv4.addSchema((object.schema.id || ''), object.schema);

					startLoading(context, object, callback);
				}
				return;
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
					loader.load(object.root, context.options, function (err, schema) {
						if (err) {
							return callback(err);
						}
						if (!schema) {
							return callback(new Error('no schema loaded from: ' + object.root));
						}
						object.schema = schema;
						context.tv4.addSchema(object.root, schema);

						startLoading(context, object, callback);
					});
				}
				else {
					loader.loadPath(object.root, context.options, function (err, schema) {
						if (err) {
							return callback(err);
						}
						if (!schema) {
							return callback(new Error('no schema loaded from: ' + object.root));
						}
						object.schema = schema;
						//TODO use object.root? as id? (no, not uri: file:// uris are catched above)
						context.tv4.addSchema(object.schema.id || '', object.schema);

						startLoading(context, object, callback);
					});
				}
				return;
			default:
				callback(new Error('dont know how to load: ' + object.root));
				return;
		}
	}

	return {
		isURL: isURL,
		getURLProtocol: getURLProtocol,
		getOptions: getOptions,
		getContext: getContext
	};
}

module.exports = {
	getRunner: getRunner
};
