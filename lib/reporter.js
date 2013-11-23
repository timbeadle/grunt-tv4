var jsonpointer = require('jsonpointer.js');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// don't forget this for tv4 (otherwise remove)

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

/*jshint -W098*/
/*jshint -W003*/

// basic styler/writer combi
var outProto = {
	writeln: function (str) {
		//abstract
	},
	error: function (str) {
		return str;
	},
	warning: function (str) {
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
	},
	reset: function () {
		//abstract
	}
};

// expose this as the default
var outDefault = Object.create(outProto);

// factories
function getBaseOut() {
	return Object.create(outProto);
}

function getDefaultOut() {
	return Object.create(outDefault);
}

function getConsoleOut() {
	var obj = getDefaultOut();
	obj.writeln = function (str) {
		if (arguments.length > 0) {
			console.log.apply(console, String(str));
		}
	};
	return obj;
}

//for console logging
function getANSIOut(base) {
	var obj = Object.create(base || getConsoleOut());
	obj.error = function (str) {
		return '\033[31m' + str + '\033[0m';
	};
	obj.warning = function (str) {
		return '\033[33m' + str + '\033[0m';
	};
	obj.success = function (str) {
		return '\033[32m' + str + '\033[0m';
	};
	obj.accent = function (str) {
		return '\033[36m' + str + '\033[0m';
	};
	return obj;
}

//for console logging (matching colors.js)
function getColorsJSOut(proto) {
	var obj = Object.create(proto || getConsoleOut());
	obj.error = function (str) {
		return String(str).red;
	};
	obj.warning = function (str) {
		return String(str).yellow;
	};
	obj.success = function (str) {
		return String(str).green;
	};
	obj.accent = function (str) {
		return String(str).cyan;
	};
	return obj;
}

//to extract as string (can wrap other Outs)
function getBufferOut(base) {
	var obj = base || Object.create(outProto);
	obj.lines = [];
	obj.writeln = function (str) {
		if (arguments.length > 0) {
			obj.lines.push(str);
		}
	};
	obj.join = function (seperator, indent) {
		seperator = (typeof limit !== 'undefined' ? seperator : '\n');
		indent = (typeof indent !== 'undefined' ? indent : '');
		if (obj.lines.length > 0) {
			return indent + obj.lines.join(seperator + indent);
		}
		return '';
	};
	obj.reset = function () {
		obj.lines.length = 0;
	};
	obj.toString = function () {
		obj.lines.join('\n');
	};
	return obj;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var strimLimit = 100;

// utils
function pluralise(str, num) {
	if (num === 1) {
		return String(str);
	}
	return str + 's';
}

function valueType(value) {
	var t = typeof value;
	if (t === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
		return 'array';
	}
	return t;
}

function valueStrim(value, limit) {
	limit = (typeof limit !== 'undefined' ? limit : strimLimit);

	var t = valueType(value);
	if (t === 'function') {
		return '[function]';
	}
	if (t === 'object' || t === 'array') {
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
	return String(value);
}

// best-effort
function extractSchemaLabel(out, schema, limit) {
	limit = typeof limit === 'undefined' ? strimLimit : limit;
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
		label = out.accent('<no id>') + ' ' + valueStrim(schema, limit);
	}
	return label;
}
// best-effort
function extractCTXLabel(out, ctx, limit) {
	limit = typeof limit === 'undefined' ? strimLimit : limit;
	var label;
	if (ctx.label) {
		label = ctx.label;
	}
	if (!label) {
		label = out.accent('<no label>') + ' ' + valueStrim(ctx.data, limit);
	}
	return label;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var ctxProto = {
	schema: null,
	data: null,
	result: null,
	label: '',
	failOnMissing: false
};

function reportResult(out, ctx, indent) {
	if (ctx.result.valid) {
		if (ctx.failOnMissing && ctx.result.missing && ctx.result.missing.length > 0) {
			reportFailed(out, ctx, indent);
		}
		else {
			reportSuccess(out, ctx);
		}
	}
	else {
		reportFailed(out, ctx, indent);
	}
	reportMissing(out, ctx, indent);
}

function reportSuccess(out, ctx) {
	out.writeln(out.success('>> ') + 'success ' + extractCTXLabel(out, ctx));
	out.writeln(out.success('>> ') + extractSchemaLabel(out, ctx.schema));
}

function reportFailed(out, ctx, indent) {
	out.writeln(out.error('>> ') + 'failed ' + out.error(ctx.label));
	out.writeln(out.error('!= ') + extractSchemaLabel(out, ctx.schema));

	if (ctx.result.errors) {
		ctx.result.errors.some(function (err) {
			reportError(out, ctx, err, indent);
		});
	}
	else if (ctx.result.error) {
		reportError(out, ctx, ctx.result.error, indent);
	}
}

function reportMissing(out, ctx, indent) {
	if (ctx.result.missing && ctx.result.missing.length > 0) {
		out.writeln(out.warning('missing ' + pluralise('schema', ctx.result.missing.length) + ':') + ' ');
		ctx.result.missing.some(function (missing) {
			out.writeln(indent + missing);
		});
	}
}

//subroutine
function reportError(out, ctx, error, indent, prefix, parentPath) {
	var value = jsonpointer.get(ctx.data, error.dataPath);
	var schemaValue = jsonpointer.get(ctx.schema, error.schemaPath);

	indent = (typeof indent !== 'undefined' ? String(indent) : '   ');
	prefix = (typeof prefix !== 'undefined' ? prefix : '');

	out.writeln(prefix + out.warning(error.message));
	if (typeof schemaValue !== 'undefined') {
		out.writeln(prefix + indent + schemaValue + out.accent(' -> ') + tweakPath(out, error.schemaPath));
	}
	else {
		out.writeln(prefix + indent + tweakPath(out, error.schemaPath));
	}

	if (error.dataPath && typeof parentPath !== 'string' || parentPath !== error.dataPath) {
		out.writeln(prefix + indent + out.error(' > ') + valueType(value) + out.error(' -> ') + valueStrim(value));
		out.writeln(prefix + indent + out.error(' > ') + tweakPath(out, error.dataPath));
	}

	if (error.subErrors) {
		error.subErrors.some(function (sub) {
			// let's go deeper
			reportError(out, ctx, sub, indent, prefix + indent, error.dataPath);
		});
	}
}
function tweakPath(out, str) {
	return str.replace(/\//g, out.accent('/'));
}

function reportBulk(out, failed, passed, indent) {
	if (!passed) {
		passed = [];
	}
	indent = (typeof indent !== 'undefined' ? String(indent) : '   ');

	var total = failed.length + passed.length;

	//got some failures: print log and fail the task
	if (failed.length > 0) {
		failed.some(function (ctx, i) {
			reportFailed(out, ctx, indent);

			if (i < failed.length - 1) {
				out.writeln('');
			}
		});

		out.writeln('');
		out.writeln(out.error('>> ') + 'tv4 ' + (passed.length > 0 ? out.warning('validated ' + passed.length) + ', ' : '') + out.error('failed ' + failed.length) + ' of ' + out.accent(total + ' ' + pluralise('value', total)));
	}
	else if (total === 0) {
		//out.writeln('');
		out.writeln(out.warning('>> ') + 'tv4 ' + out.warning('validated zero values'));
	}
	else {
		//out.writeln('');
		out.writeln(out.success('>> ') + 'tv4 ' + out.success('validated ' + passed.length) + ' of ' + out.success(total + ' ' + pluralise('value', total)) + '\n');
	}

	return out;
}

module.exports = {
	outDefault: outDefault,

	getConsoleOut: getConsoleOut,
	getANSIOut: getANSIOut,
	getColorsJSOut: getColorsJSOut,
	getBufferOut: getBufferOut,
	getDefaultOut: getDefaultOut,

	reportResult: reportResult,
	reportSuccess: reportSuccess,
	reportFailed: reportFailed,
	reportError: reportError,
	reportMissing: reportMissing,
	reportBulk: reportBulk
};
