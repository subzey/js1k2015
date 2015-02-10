#!/usr/bin/env node

var INTERVAL_ONLY = true;
var REMOVE_VAR = true;
var CANVAS_HASHING = true;
var regPackNull = 'i';

process.chdir(__dirname);

var lastResult = NaN;

function run(){
	process.stdout.write('\x1B[2J'); // Clear screen
	process.stdout.write('\x1B[1;1H'); // Reset cursor
	console.log('Building...');
	process.title = 'Building...';
	try {
		require('fs').mkdirSync('build');
	} catch (e){  }
	try {
		require('fs').unlinkSync('build/preprocessed.js');
	} catch (e){  }
	try {
		require('fs').unlinkSync('build/uglified.js');
	} catch (e){  }
	try {
		require('fs').unlinkSync('build/regpacked.js');
	} catch (e){  }
	try {
		require('fs').unlinkSync('build/prod.html');
	} catch (e){  }
	try {
		require('fs').unlinkSync('index.html');
	} catch (e){  }


	var UglifyJS = require('uglify-js');

	var source = require('fs').readFileSync('entry.js', 'utf-8');

	// Determine constants

	var constants = {
		__RegPack: true
	};

	// Sandbox js environment for running code
	var sandbox = require('vm').createContext({});

	source = source.replace(/\b(?:var|const)\s+([A-Z0-9][A-Z0-9_]{2,})\s*=[^;]*;?/g, function(code, varname){
		console.log('Constant expression: ' + code);
		require('vm').runInContext(code, sandbox, '((entry code))');
		constants[varname] = sandbox[varname];
		console.log('Evaluated into: (' + typeof constants[varname] + ') '  + constants[varname]);
		return '';
	});


	// Inlines

	while (true){
		var varname = '';
		var expression = '';
		source = source.replace(/(?:\bvar\s+)?\b(__inline_\w+)\s*=\s*([^;]*);?/, function(_, $1, $2){
			varname = $1;
			expression = $2;
			return '';
		});
		if (!varname){
			break;
		}
		console.log('Inlining ' + varname + '...');

		var matches = 0;
		source = source.replace(new RegExp('\\b' + varname + '\\b'), function(){
			matches++;
			return ' (' + expression + ') ';
		});
		if (matches < 1){
			console.error('Inline expression ' + varname + ' was defined, but no insertion point found');
			return;
		}
		if (matches > 1){
			console.error('Inline expression ' + varname + ' has multiple insertion points');
			return;
		}
	}


	require('fs').writeFileSync('build/preprocessed.js', source);

	console.log('UglifyJS...');

	// Uglify
	var result = UglifyJS.minify(source, {
		fromString: true,
		mangle: {
			toplevel: true
		},
		compress: {
			hoist_vars: true,
			global_defs: constants
		}
	});
	var minified = result.code;

	require('fs').writeFileSync('build/uglified.js', minified);

	if (REMOVE_VAR){
		console.log('Removing var keywords');
		minified = minified.replace(/\bvar\s+([^;]+)/g, function(_, vars){
			var cleaned = vars.split(',').filter(function(varDecl){
				return /=/.test(varDecl);
			}).join(',');
			return cleaned;
		});
	}

	minified = minified.replace(/^;+|;+$/g, ''); // Strip leading and trailing semicolons

	var intervalExpression = '';


	if (INTERVAL_ONLY){
		// Extract interval
		var match = /^setInterval\(function\(\)\{(.*)\},((?:\w+=)*\d+)\)$/.exec(minified);
		if (match){
			intervalExpression = match[2];
			minified = match[1];
		} else {
			console.log('Warning: setInterval regexp failed. INTERVAL_ONLY is disabled');
			INTERVAL_ONLY = false;
		}
	}

	if (true){
		// Rename i variable
		var letters = {};
		minified.replace(/[A-Z]/gi, function(letter){
			letters[letter] = -~letters[letter];
		});
		delete letters.i;
		var unused = Object.keys(letters).sort().reverse().filter(function(letter){
			return !(new RegExp('\\b' + letter + '\\b')).test(minified + '\n' + intervalExpression);
		});
		if (unused.length){
			minified = minified.replace(/\bi\b/g, unused[0]);
		}
	}

	var canvasHashingCode = 'for(i in c)Math[i[0]+[i[3]||0]+[i[6]]+[i[9]]]=i;';
	// See /tools/hashstat.html

	var minifiedWithMath;
	if (INTERVAL_ONLY){
		minifiedWithMath = UglifyJS.minify('with(Math){' + minified + '}', {fromString: true}).code;
		minifiedWithMath = minifiedWithMath.replace(/^;+|;+$/g, '');
	}




	console.log('RegPack...');

	// RegPack
	var runRegPack = require('./includes/regpackrun.js');
	var bestRegpacked;
	var bestRegpackedLength = Infinity;
	var bestWithMath;


	[true /*, false */].forEach(function(withMath){
		[0,1,2].forEach(function(paramGain){
			[0,1,2].forEach(function(paramLength){
				[0,1,2].forEach(function(paramCopies){
					var regPackOptions = {
						paramFGain: paramGain,
						paramFLength: paramLength,
						paramFCopies: paramCopies
					};
					process.stdout.write('Trying RegPack, ' + [paramGain, paramLength, paramCopies].join(', ') + (withMath ? ' with Math' : '') + '... ');
					regPackOptions.originalString = minified;
					if (INTERVAL_ONLY && withMath){
						regPackOptions.originalString = minifiedWithMath;
					}
					if (CANVAS_HASHING){
						regPackOptions.originalString = canvasHashingCode + regPackOptions.originalString.replace(/c\.(\w+)/g, function(_, i){
							return 'c[Math.' + [i[0]+[i[3]||0]+[i[6]]+[i[9]]] + ']';
						});
					}
					regPackOptions.paramOHash2D = false;
					regPackOptions.paramOHashWebGL = false;
					regPackOptions.paramOHashAudio = false;
					var regPacked = runRegPack(regPackOptions, withMath);
					if (INTERVAL_ONLY){
						regPacked = regPacked.replace(/(?:with\(Math\))?eval\(_\)?$/, 'setInterval(_,' + intervalExpression + ')')
					}
					var regPackedLength = Buffer.byteLength(regPacked);
					process.stdout.write(regPackedLength + '\n');
					if (regPackedLength < bestRegpackedLength){
						bestWithMath = withMath;
						bestRegpacked = regPacked;
						bestRegpackedLength = regPackedLength;
					}
				});
			});
		});
	});


	require('fs').writeFileSync('build/regpacked.js', bestRegpacked);

	var byteLength = Buffer.byteLength(bestRegpacked);

	console.log(byteLength + ' bytes, withMath: ' + bestWithMath);
	lastResult = byteLength;

	var inlined = require('fs').readFileSync('shim.html', 'utf-8');

	inlined = inlined.replace(/(\t*)(<script\s+type="demo">)[^]*?(<\/script>)/, function(_, tab, tagOpen, tagClose){
			return tab + tagOpen + '\n' + bestRegpacked + '\n' + tab + tagClose;
		}
	);

	require('fs').writeFileSync('build/prod.html', inlined);
	require('fs').writeFileSync('index.html', inlined);
}

run();

function watchState(){
	process.title = (isFinite(lastResult) ? '[' + lastResult + ' bytes] ' : '') + 'Waiting for file change...';
}

var rerunTimeoutId = null;

if (process.argv.indexOf('--watch', 2) !== -1){
	watchState();
	require('fs').watch('.', function(event, filename){
		if (event !== 'change' || filename !== 'entry.js'){
			return;
		}
		if (rerunTimeoutId){
			return;
		}
		// Sometimes FS sends several change events (due to the way Sublime Text saves files)
		// Wait until FS settles and then run
		rerunTimeoutId = setTimeout(function(){
			rerunTimeoutId = null;
			run();
			watchState();
		}, 40);
	});
}