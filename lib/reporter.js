// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some#Compatibility
if (!Array.prototype.some) {
	Array.prototype.some = function (fun /*, thisp */) {
		'use strict';

		if (this == null) {
			throw new TypeError();
		}

		var thisp, i,
			t = Object(this),
			len = t.length >>> 0;
		if (typeof fun !== 'function') {
			throw new TypeError();
		}

		thisp = arguments[1];
		for (i = 0; i < len; i++) {
			if (i in t && fun.call(thisp, t[i], i, t)) {
				return true;
			}
		}

		return false;
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// basic console writer
// keep internal/'private'
var styleProto = {
	writeln: function (str) {
		//nothing
	},
	error: function (str) {
		return str;
	},
	warn: function (str) {
		return str;
	},
	success: function (str) {
		return str;
	},
	accent: function (str) {
		return str;
	},
	toString: function () {
		return '';
	}
};

// expose this as the default
var styleDefault = Object.create(styleProto);

// factories
function getStyle() {
	return Object.create(styleDefault);
}

function getConsoleStyle() {
	obj.writeln = function (str) {
		console.log.apply(console, arguments);
	};
}

function getConsoleANSIStyle() {
	var obj = getConsoleStyle();
	obj.error = function (str) {
		return str;
	};
	obj.warn = function (str) {
		return str;
	};
	obj.success = function (str) {
		return str;
	};
	obj.accent = function (str) {
		return str;
	};
	return obj;
}

function getBufferWriter(proto) {
	var obj = Object.create(proto || styleProto);
	obj.buffer = [];
	obj.writeln = function (str) {
		obj.buffer.push(str);
	};
	obj.join = function (seperator, indent) {
		seperator = (typeof limit !== 'undefined' ? seperator : '\n');
		indent = (typeof indent !== 'undefined' ? indent : '');
		if (obj.buffer.length > 0) {
			return indent + obj.buffer.join(seperator + indent);
		}
		return '';
	};
	obj.reset = function () {
		obj.buffer.length = 0;
	};
	obj.toString = function () {
		obj.buffer.join('\n');
	};
	return obj;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// utils
function pluralise(str, num) {
	if (num === 1) {
		return String(str);
	}
	return str + 's';
}

function valueType(value) {
	var t = typeof value;
	if (t === 'object') {
		if (Object.prototype.toString.call(value) === '[object Array]') {
			return 'array';
		}
	}
	return t;
}

function valueStrim(value, limit) {
	limit = (typeof limit !== 'undefined' ? limit : 60);

	var t = typeof value;
	if (t === 'function') {
		return '[function]';
	}
	if (t === 'object') {
		//return Object.prototype.toString.call(value);
		value = JSON.stringify(value);
		if (value.length > limit) {
			value = value.substr(0, limit - 3) + '...';
		}
		return value;
	}
	if (t === 'string') {
		if (value.length > limit) {
			return JSON.stringify(value.substr(0, limit - 4)) + '"...';
		}
		return JSON.stringify(value);
	}
	return '' + value;
}

// best-effort
function extractSchemaLabel(schema, limit) {
	limit = typeof limit === 'undefined' ? 60 : limit;
	var label;
	if (schema.id) {
		label = schema.id;
	}
	if (schema.title) {
		label += (label ? ' (' + schema.title + ')' : schema.title);
	}
	if (!label && schema.description) {
		label = valueStrim(schema.description, limit);
	}
	if (!label) {
		label = valueStrim(schema, limit);
	}
	return label;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//subroutine
function reportError(out, error, data, schema, indent, prefix) {
	var value = jsonpointer.get(data, error.dataPath);
	var schemaValue = jsonpointer.get(schema, error.schemaPath);

	indent = (typeof indent !== 'undefined' ? String(indent) : '   ');
	prefix = (typeof prefix !== 'undefined' ? prefix : '');

	out.writeln(prefix + out.warn(error.message));

	if (error.dataPath) {
		out.writeln(prefix + indent + error.dataPath);
	}
	out.writeln(prefix + indent + '-> value: ' + valueType(value) + ' -> ' + valueStrim(value));

	if (typeof schemaValue !== 'undefined') {
		out.writeln(prefix + indent + '-> schema: ' + schemaValue + ' -> ' + error.schemaPath);
	}
	else {
		out.writeln(prefix + indent + '-> schema-path: ' + error.schemaPath);
	}

	if (error.subErrors) {
		error.subErrors.some(function (sub) {
			reportError(out, sub, data, schema, indent, prefix + indent);
		});
	}
}

function reportFailed(out, result, dataLabel, schema, indent, prefix) {
	out.writeln(out.error('failed:') + dataLabel + ' ' + out.error(' !== ') + extractSchemaLabel(schema));

	if (result.errors) {
		result.errors.some(function (error) {
			reportError(out, error, data, schema, indent, prefix);
		});
	}
	else if (result.error) {
		reportError(result.error, dataLabel, schema, indent, prefix);
	}
	if (result.missing.length > 0) {
		out.writeln(out.warn('missing schemas:') + ' ');
		result.missing.some(function (missing) {
			out.writeln(missing);
		});
	}
}

function reportSuccess(out, result, data, schema) {
	out.writeln(out.success('passed:') + ' ' + extractSchemaLabel(schema));

}
function reportMissing(out, result, data, schema) {
	if (result.missing && result.missing.length > 0) {
		out.writeln(out.warn('missing ' + pluralise('schema', result.missing.length) + ':') + ' ');
		result.missing.some(function (missing) {
			out.writeln(indent + missing);
		});
	}
}

//bulk report
function reportBulk(out, failed, passed, indent, prefix) {
	if (!failed) {
		failed = [];
	}
	if (!passed) {
		passed = [];
	}
	if (!out) {
		out = get;
	}
	indent = (typeof indent !== 'undefined' ? String(indent) : '   ');
	prefix = (typeof prefix !== 'undefined' ? prefix : '');

	var total = failed.length + passed.length;

	//got some failures: print log and fail the task
	if (failed.length > 0) {
		out.writeln();
		out.writeln('-> tv4 reporting ' + out.error(failed.length + ' ' + pluralise('invalid file', failed.length) + ':'));
		out.writeln();

		failed.some(function (res) {
			reportFailed(out, result, data, schema, indent, prefix);

			if (res.result.errors) {
				res.result.errors.some(function (error) {
					reportError(out, error, res.data, res.schema, indent);
				});
			}
			else if (res.result.error) {
				reportError(res.result.error, res.data, res.schema, indent);
			}
			if (res.result.missing && res.result.missing.length > 0) {
				out.writeln(out.warn('missing ' + pluralise('schema', res.result.missing.length) + ':') + ' ');
				res.result.missing.some(function (missing) {
					out.writeln(indent + missing);
				});
			}
		});

		out.writeln();
		out.writeln('tv4 ' + out.warn('validated ' + passed.length) + ', ' + out.error('failed ' + failed.length) + ' of ' + out.accent(total + ' ' + pluralise('file', total)));
		out.writeln();
	}
	else {
		out.writeln();
		out.writeln('tv4 ' + out.success('validated ' + passed.length) + ' of ' + out.accent(total + ' ' + pluralise('file', total)) + '\n');
	}

	return out;
}

module.exports = {

};
