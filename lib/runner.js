/* eslint-disable unicorn/prefer-module, no-warning-comments, node/prefer-global/process */
// Bulk validation core: composites with tv4, miniwrite, ministyle and loaders

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const nextTick = (call) => {
	// Lame setImmediate shimable
	if (typeof setImmediate === 'function') {
		setImmediate(call);
	} else if (process && typeof process.nextTick === 'function') {
		process.nextTick(call);
	} else {
		setTimeout(call, 1);
	}
};

// This is for-each, async style
const forAsync = (items, iter, callback) => {
	const keys = Object.keys(items);

	const step = (error, callback) => {
		nextTick(() => {
			if (error) {
				return callback(error);
			}

			if (keys.length === 0) {
				return callback();
			}

			const key = keys.pop();

			iter(items[key], key, (error) => {
				step(error, callback);
			});
		});
	};

	step(null, callback);
};

const copyProps = (target, source, recursive) => {
	if (source) {
		const sourceKeys = Object.keys(source);
		for (const key of sourceKeys) {
			if (recursive && typeof source[key] === 'object') {
				target[key] = copyProps((Array.isArray(source[key]) ? [] : {}), source[key], recursive);
				return;
			}

			target[key] = source[key];
		}
	}

	return target;
};

const sortLabel = (a, b) => {
	if (a.label < b.label) {
		return 1;
	}

	if (a.label > b.label) {
		return -1;
	}

	// Otherwise a must be equal to b
	return 0;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const isURL = (uri) => {
	return (/^https?:/.test(uri) || uri.startsWith('file:'));
};

const headExp = /^(\w+):/;

const getURLProtocol = (uri) => {
	if (isURL(uri)) {
		headExp.lastIndex = 0;
		const result = headExp.exec(uri);

		if ((result && result.length >= 2)) {
			return result[1];
		}
	}

	return '<unknown uri protocol>';
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const getOptions = (merge) => {
	const options = {
		root: null,
		schemas: {},
		add: [],
		formats: {},
		fresh: false,
		multi: false,
		timeout: 5000,
		checkRecursive: false,
		banUnknownProperties: false,
		languages: {},
		language: null
	};

	return copyProps(options, merge);
}

const getRunner = (tv4, loader, out, style) => {

	const getContext = (options) => {
		const context = {};
		context.tv4 = (options.fresh ? tv4.freshApi() : tv4);
		context.options = {};

		// Import options
		if (options) {
			context.options = getOptions(options);
		}

		if (typeof context.options.root === 'function') {
			context.options.root = context.options.root();
		}

		if (typeof context.options.schemas === 'function') {
			context.options.schemas = context.options.schemas();
		}

		if (typeof context.options.add === 'function') {
			context.options.add = context.options.add();
		}

		// Main validation method
		context.validate = (objects, callback) => {
			// Return value
			const job = {
				context,
				total: objects.length,
				objects, // TODO rename objects to values
				success: true,
				error: null,
				passed: [],
				failed: [],
			};

			if (job.objects.length === 0) {
				job.error = new Error('zero objects selected');
				finaliseTask(job.error, job, callback);

				return;
			}

			job.objects.sort(sortLabel);

			// Start the flow
			loadSchemaList(job, job.context.tv4.getMissingUris(), (error) => {
				if (error) {
					return finaliseTask(error, job, callback);
				}

				// Loop all objects
				forAsync(job.objects, (object, index, callback) => {
					validateObject(job, object, callback);

				}, (error) => {
					finaliseTask(error, job, callback);
				});
			});
		};

		return context;
	};

	const repAccent = style.accent('/');
	const repProto = style.accent('://');

	const tweakURI = (string_) => {
		return string_.split(/:\/\//).map((string_) => {
			return string_.replace(/\//g, repAccent);
		}).join(repProto);
	};

	const finaliseTask = (error, job, callback) => {
		job.success = (job.success && !job.error && job.failed.length === 0);

		if (job.error) {
			out.writeln('');
			out.writeln(style.warning('warning: ') + job.error);
			out.writeln('');
			callback(null, job);

			return;
		}

		if (error) {
			out.writeln('');
			out.writeln(style.error('error: ') + error);
			out.writeln('');
			callback(error, job);

			return;
		}

		out.writeln('');

		callback(null, job);
	}

	// Load and add batch of schema by uri, repeat until all missing are solved
	const loadSchemaList = (job, uris, callback) => {
		uris = uris.filter((value) => {
			return Boolean(value);
		});

		if (uris.length === 0) {
			nextTick(() => {
				callback();
			});

			return;
		}

		const sweep = () => {
			if (uris.length === 0) {
				nextTick(callback);
				return;
			}

			forAsync(uris, (uri, i, callback) => {
				if (!uri) {
					out.writeln('> ' + style.error('cannot load') + ' "' + tweakURI(uri) + '"');
					callback();
				}

				out.writeln('> ' + style.accent('load') + ' + ' + tweakURI(uri));

				loader.load(uri, job.context.options, (error, schema) => {
					if (error) {
						return callback(error);
					}

					job.context.tv4.addSchema(uri, schema);
					uris = job.context.tv4.getMissingUris();

					callback();
				});
			}, (error) => {
				if (error) {
					job.error = error;

					return callback(null);
				}

				// Sweep again
				sweep();
			});
		};

		sweep();
	};

	// Supports automatic lazy loading
	const recursiveTest = (job, object, callback) => {
		const { options } = job.context;
		if (job.context.options.multi) {
			object.result = job.context.tv4.validateMultiple(
				object.value,
				object.schema,
				options.checkRecursive,
				options.banUnknownProperties
			);
		}
		else {
			object.result = job.context.tv4.validateResult(
				object.value,
				object.schema,
				options.checkRecursive,
				options.banUnknownProperties
			);
		}

		// TODO verify reportOnMissing
		if (!object.result.valid) {
			job.failed.push(object);
			out.writeln('> ' + style.error('fail') + ' - ' + tweakURI(object.label));

			return callback();
		}

		if (object.result.missing.length === 0) {
			job.passed.push(object);
			out.writeln('> ' + style.success('pass') + ' | ' + tweakURI(object.label));

			return callback();
		}

		// Test for bad fragment pointer fall-through
		if (!object.result.missing.every((value) => {
			return (value !== '');
		})) {
			job.failed.push(object);
			out.writeln('> ' + style.error('empty missing-schema url detected') + ' (this likely casued by a bad fragment pointer)');
			return callback();
		}

		out.writeln('> ' + style.accent('auto') + ' ! validation missing ' + object.result.missing.length + ' urls:');
		out.writeln('> "' + object.result.missing.join('"\n> "') + '"');

		// Auto load missing (if loading has an error  we'll bail way back)
		loadSchemaList(job, object.result.missing, (error) => {
			if (error) {
				return callback(error);
			}

			// Check again
			recursiveTest(job, object, callback);
		});
	};

	const startLoading = (job, object, callback) => {
		// Pre-fetch (saves a validation round)
		loadSchemaList(job, job.context.tv4.getMissingUris(), (error) => {
			if (error) {
				return callback(error);
			}

			recursiveTest(job, object, callback);
		});
	};

	// Validate single object
	const validateObject = (job, object, callback) => {
		if (typeof object.value === 'undefined') {
			const onLoad = (error, object_) => {
				if (error) {
					job.error = error;

					return callback(error);
				}

				object.value = object_;
				doValidateObject(job, object, callback);
			};

			const options = {
				timeout: (job.context.options.timeout || 5000)
			};

			// TODO verify http:, file: and plain paths all load properly
			if (object.path) {
				loader.loadPath(object.path, options, onLoad);
			} else if (object.url) {
				loader.load(object.url, options, onLoad);
			} else {
				callback(new Error('object missing value, path or url'));
			}
		} else {
			doValidateObject(job, object, callback);
		}
	};

	const doValidateObject = (job, object, callback) => {
		if (!object.root) {
			// TODO handle this better
			job.error = new Error('no explicit root schema');

			callback(job);

			return;
		}

		const t = typeof object.root;
		let schema;

		switch (t) {
			case 'object':
				if (!Array.isArray(object.root)) {
					object.schema = object.root;
					job.context.tv4.addSchema((object.schema.id || ''), object.schema);

					startLoading(job, object, callback);
				}

				return;
			case 'string':
				// Known from previous sessions?
				schema = job.context.tv4.getSchema(object.root);
				if (schema) {
					out.writeln('> ' + style.plain('have') + ' : ' + tweakURI(object.root));
					object.schema = schema;

					recursiveTest(job, object, callback);
					return;
				}

				out.writeln('> ' + style.accent('root') + ' > ' + tweakURI(object.root));

				loader.load(object.root, job.context.options, (error, schema) => {
					if (error) {
						job.error = error;
						return callback(job.error);
					}

					if (!schema) {
						job.error = new Error('no schema loaded from: ' + object.root);
						return callback(job.error);
					}

					object.schema = schema;
					job.context.tv4.addSchema(object.root, schema);

					if (object.schema.id) {
						job.context.tv4.addSchema(object.schema);
					}

					startLoading(job, object, callback);
				});
				return;
			default:
				callback(new Error('don’t know how to load: ' + object.root));
		}
	};

	return {
		isURL,
		getURLProtocol,
		getOptions,
		getContext,
	};
}

module.exports = {
	getRunner,
};
