#!/usr/bin/env node


function runRegPack(formParams, withMath){

	formParams = formParams || {};

	var defaultFormParams = {
		originalString: "",
		paramOHash2D: true,
		paramOHashWebGL: true,
		paramOHashAudio: true,
		paramOGlobalDefined: true,
		paramOGlobalVariable: "c",
		paramOGlobalType: "0",
		paramOReassignVars: true,
		paramOExcludedVars: "a b c",
		paramFGain: "1",
		paramFLength: "0",
		paramFCopies: "0",
		paramFTiebreaker: "1",
		stage0Output: "",
		stage0Details: "",
		stage1Output: "",
		stage1Details: "",
		stage2Output: "",
		stage2Details: ""
	};

	function KindaElement(){
		this.style = {};
		this.attributes = {};
	}

	KindaElement.prototype.value = '';
	Object.defineProperty(KindaElement.prototype, 'checked', {
		get: function(){
			return !!this.value;
		}
	});

	KindaElement.prototype.getAttribute = function(name){
		return this.attributes[name] || '';
	};

	KindaElement.prototype.setAttribute = function(name, value){
		this.attributes[name] = value || '';
	};

	function KindaCanvas(){
		KindaElement.apply(this, arguments);
	}

	require('util').inherits(KindaCanvas, KindaElement);

	KindaCanvas.prototype.getContext = function(context){
		if (context == '2d'){
			if (!this._context){
				this._context = new KindaCanvasContext2D(this);
			}
			return this._context;
		}
		return {};
	};

	function KindaCanvasContext2D (canvas){
		this.canvas = canvas;
		// Exported from Chrome
		this.fillStyle = "#000000";
		this.font = "10px sans-serif";
		this.globalAlpha = 1;
		this.globalCompositeOperation = "source-over";
		this.imageSmoothingEnabled = true;
		this.lineCap = "butt";
		this.lineDashOffset = 0;
		this.lineJoin = "miter";
		this.lineWidth = 1;
		this.miterLimit = 10;
		this.shadowBlur = 0;
		this.shadowColor = "rgba(0, 0, 0, 0)";
		this.shadowOffsetX = 0;
		this.shadowOffsetY = 0;
		this.strokeStyle = "#000000";
		this.textAlign = "start";
		this.textBaseline = "alphabetic";
	}

	["save", "restore", "scale", "rotate", "translate", "transform", "setTransform", "resetTransform",
	"createLinearGradient", "createRadialGradient", "createPattern", "clearRect", "fillRect", "strokeRect",
	"beginPath", "fill", "stroke", "drawFocusIfNeeded", "clip", "isPointInPath", "isPointInStroke",
	"fillText", "strokeText", "measureText", "drawImage", "createImageData", "getImageData", "putImageData",
	"getContextAttributes", "setLineDash", "getLineDash", "setAlpha", "setCompositeOperation",
	"setLineWidth", "setLineCap", "setLineJoin", "setMiterLimit", "clearShadow", "setStrokeColor",
	"setFillColor", "drawImageFromRect", "setShadow", "closePath", "moveTo", "lineTo", "quadraticCurveTo",
	"bezierCurveTo", "arcTo", "rect", "arc", "ellipse"].forEach(function(key){
		KindaCanvasContext2D.prototype[key] = function(){};
	});

	var elementsById = {};

	var kindaDocument = {
		getElementById: function(id){
			if (!elementsById[id]){
				var element = new KindaElement();
				if (id in formParams){
					element.value = formParams[id];
				} else if (id in defaultFormParams){
					element.value = defaultFormParams[id];
				}
				elementsById[id] = element;
			}
			return elementsById[id];
		},
		createElement: function(nodeName){
			if (nodeName.toLowerCase() === 'canvas'){
				return new KindaCanvas();
			}
			return new KindaElement();
		}
	};

	var sandbox = require('vm').createContext({
		document: kindaDocument,
		console: console
	});

	require('fs').readFileSync(__dirname  + '/regPack.html', 'utf-8').replace(/<script>([^]*?)<\/script>/g, function(_, code){
		require('vm').runInContext(code, sandbox, 'regpack.html/script');
	});

	sandbox.callRegPack(!!withMath);

	if (!elementsById.stage2Output){
		throw new Error('something went wrong with RegPack');
	}
	return elementsById.stage2Output.value;
}

module.exports = runRegPack;
