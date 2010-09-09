/*
 * svgcanvas.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 *
 */

if(!window.console) {
	window.console = {};
	window.console.log = function(str) {};
	window.console.dir = function(str) {};
}

if(window.opera) {
	window.console.log = function(str) {opera.postError(str);};
	window.console.dir = function(str) {};
}

(function() {

	// This fixes $(...).attr() to work as expected with SVG elements.
	// Does not currently use *AttributeNS() since we rarely need that.
	
	// See http://api.jquery.com/attr/ for basic documentation of .attr()
	
	// Additional functionality: 
	// - When getting attributes, a string that's a number is return as type number.
	// - If an array is supplied as first parameter, multiple values are returned
	// as an object with values for each given attributes

	var proxied = jQuery.fn.attr, svgns = "http://www.w3.org/2000/svg";
	jQuery.fn.attr = function(key, value) {
		var len = this.length;
		if(!len) return this;
		for(var i=0; i<len; i++) {
			var elem = this[i];
			// set/get SVG attribute
			if(elem.namespaceURI === svgns) {
				// Setting attribute
				if(value !== undefined) {
					elem.setAttribute(key, value);
				} else if($.isArray(key)) {
					// Getting attributes from array
					var j = key.length, obj = {};

					while(j--) {
						var aname = key[j];
						var attr = elem.getAttribute(aname);
						// This returns a number when appropriate
						if(attr || attr === "0") {
							attr = isNaN(attr)?attr:attr-0;
						}
						obj[aname] = attr;
					}
					return obj;
				
				} else if(typeof key === "object") {
					// Setting attributes form object
					for(var v in key) {
						elem.setAttribute(v, key[v]);
					}
				// Getting attribute
				} else {
					var attr = elem.getAttribute(key);
					if(attr || attr === "0") {
						attr = isNaN(attr)?attr:attr-0;
					}

					return attr;
				}
			} else {
				return proxied.apply(this, arguments);
			}
		}
		return this;
	};

}());

// Class: SvgCanvas
// The main SvgCanvas class that manages all SVG-related functions
//
// Parameters:
// container - The container HTML element that should hold the SVG root element
// config - An object that contains configuration data
$.SvgCanvas = function(container, config)
{
var isOpera = !!window.opera,
	isWebkit = navigator.userAgent.indexOf("AppleWebKit") != -1,
	
	// Object populated later with booleans indicating support for features	
	support = {},

	// this defines which elements and attributes that we support
	svgWhiteList = {
	// SVG Elements
	"a": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "xlink:href", "xlink:title"],
	"circle": ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "r", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"clipPath": ["class", "clipPathUnits", "id"],
	"defs": [],
	"desc": [],
	"ellipse": ["class", "clip-path", "clip-rule", "cx", "cy", "fill", "fill-opacity", "fill-rule", "filter", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"feGaussianBlur": ["class", "color-interpolation-filters", "id", "requiredFeatures", "stdDeviation"],
	"filter": ["class", "color-interpolation-filters", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "requiredFeatures", "width", "x", "xlink:href", "y"],
	"foreignObject": ["class", "font-size", "height", "id", "opacity", "requiredFeatures", "style", "transform", "width", "x", "y"],
	"g": ["class", "clip-path", "clip-rule", "id", "display", "fill", "fill-opacity", "fill-rule", "filter", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"image": ["class", "clip-path", "clip-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:href", "xlink:title", "y"],
	"line": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "x1", "x2", "y1", "y2"],
	"linearGradient": ["class", "id", "gradientTransform", "gradientUnits", "requiredFeatures", "spreadMethod", "systemLanguage", "x1", "x2", "xlink:href", "y1", "y2"],
	"marker": ["id", "class", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "systemLanguage", "viewBox"],
	"mask": ["class", "height", "id", "maskContentUnits", "maskUnits", "width", "x", "y"],
	"metadata": ["class", "id"],
	"path": ["class", "clip-path", "clip-rule", "d", "fill", "fill-opacity", "fill-rule", "filter", "id", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"pattern": ["class", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "requiredFeatures", "style", "systemLanguage", "width", "x", "xlink:href", "y"],
	"polygon": ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "id", "class", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"polyline": ["class", "clip-path", "clip-rule", "id", "fill", "fill-opacity", "fill-rule", "filter", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform"],
	"radialGradient": ["class", "cx", "cy", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "requiredFeatures", "spreadMethod", "systemLanguage", "xlink:href"],
	"rect": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "width", "x", "y"],
	"stop": ["class", "id", "offset", "requiredFeatures", "stop-color", "stop-opacity", "style", "systemLanguage"],
	"svg": ["class", "clip-path", "clip-rule", "filter", "id", "height", "mask", "preserveAspectRatio", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xmlns", "xmlns:se", "xmlns:xlink", "y"],
	"switch": ["class", "id", "requiredFeatures", "systemLanguage"],
	"symbol": ["class", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "opacity", "preserveAspectRatio", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "transform", "viewBox"],
	"text": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "transform", "x", "xml:space", "y"],
	"textPath": ["class", "id", "method", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "transform", "xlink:href"],
	"title": [],
	"tspan": ["class", "clip-path", "clip-rule", "dx", "dy", "fill", "fill-opacity", "fill-rule", "filter", "font-family", "font-size", "font-style", "font-weight", "id", "mask", "opacity", "requiredFeatures", "rotate", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "systemLanguage", "text-anchor", "textLength", "transform", "x", "xml:space", "y"],
	"use": ["class", "clip-path", "clip-rule", "fill", "fill-opacity", "fill-rule", "filter", "height", "id", "mask", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "style", "transform", "width", "x", "xlink:href", "y"],
	
	// MathML Elements
	"annotation": ["encoding"],
	"annotation-xml": ["encoding"],
	"maction": ["actiontype", "other", "selection"],
	"math": ["class", "id", "display", "xmlns"],
	"menclose": ["notation"],
	"merror": [],
	"mfrac": ["linethickness"],
	"mi": ["mathvariant"],
	"mmultiscripts": [],
	"mn": [],
	"mo": ["fence", "lspace", "maxsize", "minsize", "rspace", "stretchy"],
	"mover": [],
	"mpadded": ["lspace", "width"],
	"mphantom": [],
	"mprescripts": [],
	"mroot": [],
	"mrow": ["xlink:href", "xlink:type", "xmlns:xlink"],
	"mspace": ["depth", "height", "width"],
	"msqrt": [],
	"mstyle": ["displaystyle", "mathbackground", "mathcolor", "mathvariant", "scriptlevel"],
	"msub": [],
	"msubsup": [],
	"msup": [],
	"mtable": ["align", "columnalign", "columnlines", "columnspacing", "displaystyle", "equalcolumns", "equalrows", "frame", "rowalign", "rowlines", "rowspacing", "width"],
	"mtd": ["columnalign", "columnspan", "rowalign", "rowspan"],
	"mtext": [],
	"mtr": ["columnalign", "rowalign"],
	"munder": [],
	"munderover": [],
	"none": [],
	"semantics": []
	},

	// Interface strings, usually for title elements
	uiStrings = {
		"pathNodeTooltip": "Drag node to move it. Double-click node to change segment type",
		"pathCtrlPtTooltip": "Drag control point to adjust curve properties",
		"exportNoBlur": "Blurred elements will appear as un-blurred",
		"exportNoImage": "Image elements will not appear",
		"exportNoforeignObject": "foreignObject elements will not appear",
		"exportNoDashArray": "Strokes will appear filled",
		"exportNoText": "Text may not appear as expected"
	},
	
	// Default configuration options
	curConfig = {
		show_outside_canvas: true,
		dimensions: [640, 480]
	};
	
	
	// Much faster than running getBBox() every time
	var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
// 	var hidElems = 'clipPath,defs,desc,feGaussianBlur,filter,linearGradient,marker,mask,metadata,pattern,radialGradient,stop,switch,symbol,title,textPath';
	


// Update config with new one if given
if(config) {
	$.extend(curConfig, config);
}
	
// Static class for various utility functions
var Utils = this.Utils = function() {

	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	return {
	
		// Function: Utils.toXml
		// Converts characters in a string to XML-friendly entities.
		//
		// Example: "&" becomes "&amp;"
		//
		// Parameters:
		// str - The string to be converted
		//
		// Returns:
		// The converted string
		"toXml": function(str) {
			return $('<p/>').text(str).html();
		},
			
		// Function: Utils.fromXml
		// Converts XML entities in a string to single characters. 
		// Example: "&amp;" becomes "&"
		//
		// Parameters:
		// str - The string to be converted
		//
		// Returns: 
		// The converted string
		"fromXml": function(str) {
			return $('<p/>').html(str).text();
		},
		
		// This code was written by Tyler Akins and has been placed in the
		// public domain.  It would be nice if you left this header intact.
		// Base64 code from Tyler Akins -- http://rumkin.com
		
		// schiller: Removed string concatenation in favour of Array.join() optimization,
		//           also precalculate the size of the array needed.
		
		// Function: Utils.encode64
		// Converts a string to base64
		"encode64" : function(input) {
			// base64 strings are 4/3 larger than the original string
	//		input = Utils.encodeUTF8(input); // convert non-ASCII characters
			input = Utils.convertToXMLReferences(input);
			if(window.btoa) return window.btoa(input); // Use native if available
			var output = new Array( Math.floor( (input.length + 2) / 3 ) * 4 );
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0, p = 0;
	
			do {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
	
				output[p++] = _keyStr.charAt(enc1);
				output[p++] = _keyStr.charAt(enc2);
				output[p++] = _keyStr.charAt(enc3);
				output[p++] = _keyStr.charAt(enc4);
			} while (i < input.length);
	
			return output.join('');
		},
		
		// Function: Utils.decode64
		// Converts a string from base64
		"decode64" : function(input) {
			if(window.atob) return window.atob(input);
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;
		
			 // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
			 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
			 do {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
		
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
		
				output = output + String.fromCharCode(chr1);
		
				if (enc3 != 64) {
				   output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
				   output = output + String.fromCharCode(chr3);
				}
		
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
		
			 } while (i < input.length);
			 return unescape(output);
		},
		
		// Currently not being used, so commented out for now
		// based on http://phpjs.org/functions/utf8_encode:577
		// codedread:does not seem to work with webkit-based browsers on OSX
// 		"encodeUTF8": function(input) {
// 			//return unescape(encodeURIComponent(input)); //may or may not work
// 			var output = '';
// 			for (var n = 0; n < input.length; n++){
// 				var c = input.charCodeAt(n);
// 				if (c < 128) {
// 					output += input[n];
// 				}
// 				else if (c > 127) {
// 					if (c < 2048){
// 						output += String.fromCharCode((c >> 6) | 192);
// 					} 
// 					else {
// 						output += String.fromCharCode((c >> 12) | 224) + String.fromCharCode((c >> 6) & 63 | 128);
// 					}
// 					output += String.fromCharCode((c & 63) | 128);
// 				}
// 			}
// 			return output;
// 		},
		
		// Function: Utils.convertToXMLReferences 
		// Converts a string to use XML references
		"convertToXMLReferences": function(input) {
			var output = '';
			for (var n = 0; n < input.length; n++){
				var c = input.charCodeAt(n);
				if (c < 128) {
					output += input[n];
				}
				else if(c > 127) {
					output += ("&#" + c + ";");
				}
			}
			return output;
		},
		
		// Function: rectsIntersect
		// Check if two rectangles (BBoxes objects) intersect each other
		//
		// Paramaters:
		// r1 - The first BBox-like object
		// r2 - The second BBox-like object
		//
		// Returns:
		// Boolean that's true if rectangles intersect
		"rectsIntersect": function(r1, r2) {
			return r2.x < (r1.x+r1.width) && 
				(r2.x+r2.width) > r1.x &&
				r2.y < (r1.y+r1.height) &&
				(r2.y+r2.height) > r1.y;
		},
	
		// Function: snapToAngle
		// Returns a 45 degree angle coordinate associated with the two given 
		// coordinates
		// 
		// Parameters:
		// x1 - First coordinate's x value
		// x2 - Second coordinate's x value
		// y1 - First coordinate's y value
		// y2 - Second coordinate's y value
		//
		// Returns: 
		// Object with the following values:
		// x - The angle-snapped x value
		// y - The angle-snapped y value
		// snapangle - The angle at which to snap
		"snapToAngle": function(x1,y1,x2,y2) {
			var snap = Math.PI/4; // 45 degrees
			var dx = x2 - x1;
			var dy = y2 - y1;
			var angle = Math.atan2(dy,dx);
			var dist = Math.sqrt(dx * dx + dy * dy);
			var snapangle= Math.round(angle/snap)*snap;
			var x = x1 + dist*Math.cos(snapangle);	
			var y = y1 + dist*Math.sin(snapangle);
			//console.log(x1,y1,x2,y2,x,y,angle)
			return {x:x, y:y, a:snapangle};
		},
		
		// Function: snapToGrid
		// round value to for snapping
		"snapToGrid" : function(value){
			var stepSize = svgEditor.curConfig.snappingStep;
			value = Math.round(value/stepSize)*stepSize;
			return value;
		},

		// Function: text2xml
		// Cross-browser compatible method of converting a string to an XML tree
		// found this function here: http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
		"text2xml": function(sXML) {
			if(sXML.indexOf('<svg:svg') !== -1) {
				sXML = sXML.replace(/<(\/?)svg:/g, '<$1').replace('xmlns:svg', 'xmlns');
			}
		
			var out;
			try{
				var dXML = (window.DOMParser)?new DOMParser():new ActiveXObject("Microsoft.XMLDOM");
				dXML.async = false;
			} catch(e){ 
				throw new Error("XML Parser could not be instantiated"); 
			};
			try{
				if(dXML.loadXML) out = (dXML.loadXML(sXML))?dXML:false;
				else out = dXML.parseFromString(sXML, "text/xml");
			}
			catch(e){ throw new Error("Error parsing XML string"); };
			return out;
		}
	}

}();

	
// TODO: declare the variables and set them as null, then move this setup stuff to
// an initialization function - probably just use clear()
var canvas = this,
	
	// Namespace constants
	svgns = "http://www.w3.org/2000/svg",
	xlinkns = "http://www.w3.org/1999/xlink",
	xmlns = "http://www.w3.org/XML/1998/namespace",
	xmlnsns = "http://www.w3.org/2000/xmlns/", // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
	se_ns = "http://svg-edit.googlecode.com",
	htmlns = "http://www.w3.org/1999/xhtml",
	mathns = "http://www.w3.org/1998/Math/MathML",
	
	// Map of units, those set to 0 are updated later based on calculations
	unit_types = {'em':0,'ex':0,'px':1,'cm':35.43307,'mm':3.543307,'in':90,'pt':1.25,'pc':15,'%':0},

	//nonce to uniquify id's
	nonce = Math.floor(Math.random()*100001),
	
	// Boolean to indicate whether or not IDs given to elements should be random
	randomize_ids = false, 
	
	// "document" element associated with the container (same as window.document using default svg-editor.js)
	svgdoc = container.ownerDocument,
	
	// Array with width/height of canvas
	dimensions = curConfig.dimensions;
	
	if($.browser.msie) {
		var svgroot = document.createElementNS(svgns, 'svg');
		svgroot.id = 'svgroot';
		svgroot.setAttribute('width', dimensions[0]);
		svgroot.setAttribute('height', dimensions[1]);
		
	} else {
		// Create Root SVG element. This is a container for the document being edited, not the document itself.
		var svgroot = svgdoc.importNode(Utils.text2xml('<svg id="svgroot" xmlns="' + svgns + '" xlinkns="' + xlinkns + '" ' +
						'width="' + dimensions[0] + '" height="' + dimensions[1] + '" x="' + dimensions[0] + '" y="' + dimensions[1] + '" overflow="visible">' +
						'<defs>' +
							'<filter id="canvashadow" filterUnits="objectBoundingBox">' +
								'<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>'+
								'<feOffset in="blur" dx="5" dy="5" result="offsetBlur"/>'+
								'<feMerge>'+
									'<feMergeNode in="offsetBlur"/>'+
									'<feMergeNode in="SourceGraphic"/>'+
								'</feMerge>'+
							'</filter>'+
						'</defs>'+
					'</svg>').documentElement, true);
	}			

	container.appendChild(svgroot);
	
// The actual element that represents the final output SVG element
var svgcontent = svgdoc.createElementNS(svgns, "svg");
$(svgcontent).attr({
	id: 'svgcontent',
	width: dimensions[0],
	height: dimensions[1],
	x: dimensions[0],
	y: dimensions[1],
	overflow: curConfig.show_outside_canvas?'visible':'hidden',
	xmlns: svgns,
	"xmlns:se": se_ns,
	"xmlns:xlink": xlinkns
}).appendTo(svgroot);

// Set nonce if randomize_ids = true
if (randomize_ids) svgcontent.setAttributeNS(se_ns, 'se:nonce', nonce);

// map namespace URIs to prefixes
var nsMap = {};
nsMap[xlinkns] = 'xlink';
nsMap[xmlns] = 'xml';
nsMap[xmlnsns] = 'xmlns';
nsMap[se_ns] = 'se';
nsMap[htmlns] = 'xhtml';
nsMap[mathns] = 'mathml';

// map prefixes to namespace URIs
var nsRevMap = {};
$.each(nsMap, function(key,value){
	nsRevMap[value] = key;
});

// Produce a Namespace-aware version of svgWhitelist
var svgWhiteListNS = {};
$.each(svgWhiteList, function(elt,atts){
	var attNS = {};
	$.each(atts, function(i, att){
		if (att.indexOf(':') != -1) {
			var v = att.split(':');
			attNS[v[1]] = nsRevMap[v[0]];
		} else {
			attNS[att] = att == 'xmlns' ? xmlnsns : null;
		}
	});
	svgWhiteListNS[elt] = attNS;
});

// Animation element to change the opacity of any newly created element
var opac_ani = document.createElementNS(svgns, 'animate');
$(opac_ani).attr({
	attributeName: 'opacity',
	begin: 'indefinite',
	dur: 1,
	fill: 'freeze'
}).appendTo(svgroot);

// Group: Unit conversion functions

// Set the scope for these functions
var convertToNum, convertToUnit, setUnitAttr;

(function() {
	var w_attrs = ['x', 'x1', 'cx', 'rx', 'width'];
	var h_attrs = ['y', 'y1', 'cy', 'ry', 'height'];
	var unit_attrs = $.merge(['r','radius'], w_attrs);
	$.merge(unit_attrs, h_attrs);
	
	// Function: convertToNum
	// Converts given values to numbers. Attributes must be supplied in 
	// case a percentage is given
	//
	// Parameters:
	// attr - String with the name of the attribute associated with the value
	// val - String with the attribute value to convert
	convertToNum = function(attr, val) {
		// Return a number if that's what it already is
		if(!isNaN(val)) return val-0;
		
		if(val.substr(-1) === '%') {
			// Deal with percentage, depends on attribute
			var num = val.substr(0, val.length-1)/100;
			var res = getResolution();
			
			if($.inArray(attr, w_attrs) !== -1) {
				return num * res.w;
			} else if($.inArray(attr, h_attrs) !== -1) {
				return num * res.h;
			} else {
				return num * Math.sqrt((res.w*res.w) + (res.h*res.h))/Math.sqrt(2);
			}
		} else {
			var unit = val.substr(-2);
			var num = val.substr(0, val.length-2);
			// Note that this multiplication turns the string into a number
			return num * unit_types[unit];
		}
	};
	
	
	// Function: setUnitAttr
	// Sets an element's attribute based on the unit in its current value.
	//
	// Parameters: 
	// elem - DOM element to be changed
	// attr - String with the name of the attribute associated with the value
	// val - String with the attribute value to convert
	setUnitAttr = function(elem, attr, val) {
		if(!isNaN(val)) {
			// New value is a number, so check currently used unit
			var old_val = elem.getAttribute(attr);
			
			if(old_val !== null && isNaN(old_val)) {
				// Old value was a number, so get unit, then convert
				var unit;
				if(old_val.substr(-1) === '%') {
					var res = getResolution();
					unit = '%';
					val *= 100;
					if($.inArray(attr, w_attrs) !== -1) {
						val = val / res.w;
					} else if($.inArray(attr, h_attrs) !== -1) {
						val = val / res.h;
					} else {
						return val / Math.sqrt((res.w*res.w) + (res.h*res.h))/Math.sqrt(2);
					}

				} else {
					unit = old_val.substr(-2);
					val = val / unit_types[unit];
				}
				
				val += unit;
			}
		}
		elem.setAttribute(attr, val);
	}

	// Function: isValidUnit
	// Check if an attribute's value is in a valid format
	//
	// Parameters: 
	// attr - String with the name of the attribute associated with the value
	// val - String with the attribute value to check
	canvas.isValidUnit = function(attr, val) {
		var valid = false;
		if($.inArray(attr, unit_attrs) != -1) {
			// True if it's just a number
			if(!isNaN(val)) {
				valid = true;
			} else {
			// Not a number, check if it has a valid unit
				val = val.toLowerCase();
				$.each(unit_types, function(unit) {
					if(valid) return;
					var re = new RegExp('^-?[\\d\\.]+' + unit + '$');
					if(re.test(val)) valid = true;
				});
			}
		} else if (attr == "id") {
			// if we're trying to change the id, make sure it's not already present in the doc
			// and the id value is valid.

			var result = false;
			// because getElem() can throw an exception in the case of an invalid id
			// (according to http://www.w3.org/TR/xml-id/ IDs must be a NCName)
			// we wrap it in an exception and only return true if the ID was valid and
			// not already present
			try {
				var elem = getElem(val);
				result = (elem == null);
			} catch(e) {}
			return result;
		} else valid = true;			
		
		return valid;
	}
	
})();


// Group: Undo/Redo history management

this.undoCmd = {};

// Function: ChangeElementCommand
// History command to make a change to an element. 
// Usually an attribute change, but can also be textcontent.
//
// Parameters:
// elem - The DOM element that was changed
// attrs - An object with the attributes to be changed and the values they had *before* the change
// text - An optional string visible to user related to this change
var ChangeElementCommand = this.undoCmd.changeElement = function(elem, attrs, text) {
	this.elem = elem;
	this.text = text ? ("Change " + elem.tagName + " " + text) : ("Change " + elem.tagName);
	this.newValues = {};
	this.oldValues = attrs;
	for (var attr in attrs) {
		if (attr == "#text") this.newValues[attr] = elem.textContent;
		else if (attr == "#href") this.newValues[attr] = getHref(elem);
		else this.newValues[attr] = elem.getAttribute(attr);
	}

	// Function: ChangeElementCommand.apply
	// Performs the stored change action
	this.apply = function() {
		var bChangedTransform = false;
		for(var attr in this.newValues ) {
			if (this.newValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.newValues[attr];
				else if (attr == "#href") setHref(this.elem, this.newValues[attr])
				else this.elem.setAttribute(attr, this.newValues[attr]);
			}
			else {
				if (attr == "#text") this.elem.textContent = "";
				else {
					this.elem.setAttribute(attr, "");
					this.elem.removeAttribute(attr);
				}
			}
			
			if (attr == "transform") { bChangedTransform = true; }
			else if (attr == "stdDeviation") { canvas.setBlurOffsets(this.elem.parentNode, this.newValues[attr]); }
			
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = getRotationAngle(elem);
			if (angle) {
				var bbox = elem.getBBox();
				var cx = bbox.x + bbox.width/2,
					cy = bbox.y + bbox.height/2;
				var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
				if (rotate != elem.getAttribute("transform")) {
					elem.setAttribute("transform", rotate);
				}
			}
		}
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgcontent) {
			identifyLayers();
		}		
		return true;
	};

	// Function: ChangeElementCommand.unapply
	// Reverses the stored change action
	this.unapply = function() {
		var bChangedTransform = false;
		for(var attr in this.oldValues ) {
			if (this.oldValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.oldValues[attr];
				else if (attr == "#href") setHref(this.elem, this.oldValues[attr]);
				else this.elem.setAttribute(attr, this.oldValues[attr]);
				
				if (attr == "stdDeviation") canvas.setBlurOffsets(this.elem.parentNode, this.oldValues[attr]);
			}
			else {
				if (attr == "#text") this.elem.textContent = "";
				else this.elem.removeAttribute(attr);
			}
			if (attr == "transform") { bChangedTransform = true; }
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = getRotationAngle(elem);
			if (angle) {
				var bbox = elem.getBBox();
				var cx = bbox.x + bbox.width/2,
					cy = bbox.y + bbox.height/2;
				var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
				if (rotate != elem.getAttribute("transform")) {
					elem.setAttribute("transform", rotate);
				}
			}
		}
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgcontent) {
			identifyLayers();
		}		
		
		// Remove transformlist to prevent confusion that causes bugs like 575.
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}	
		
		return true;
	};

	// Function: ChangeElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; }
}

// Function: InsertElementCommand
// History command for an element that was added to the DOM
//
// Parameters:
// elem - The newly added DOM element
// text - An optional string visible to user related to this change
var InsertElementCommand = this.undoCmd.insertElement = function(elem, text) {
	this.elem = elem;
	this.text = text || ("Create " + elem.tagName);
	this.parent = elem.parentNode;
	
	// Function: InsertElementCommand.apply
	// Re-Inserts the new element
	this.apply = function() { 
		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: InsertElementCommand.unapply
	// Removes the element
	this.unapply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.elem.parentNode.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: InsertElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
}

// Function: RemoveElementCommand
// History command for an element removed from the DOM
//
// Parameters:
// elem - The removed DOM element
// parent - The DOM element's parent
// text - An optional string visible to user related to this change
var RemoveElementCommand = this.undoCmd.removeElement = function(elem, parent, text) {
	this.elem = elem;
	this.text = text || ("Delete " + elem.tagName);
	this.parent = parent;

	// Function: RemoveElementCommand.apply
	// Re-removes the new element
	this.apply = function() {	
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}	
	
		this.parent = this.elem.parentNode;
		this.elem = this.parent.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: RemoveElementCommand.unapply
	// Re-adds the new element
	this.unapply = function() { 
		if (svgTransformLists[this.elem.id]) {
			delete svgTransformLists[this.elem.id];
		}

		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	// Function: RemoveElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
	
	// special hack for webkit: remove this element's entry in the svgTransformLists map
	if (svgTransformLists[elem.id]) {
		delete svgTransformLists[elem.id];
	}
}

// Function: MoveElementCommand
// History command for an element that had its DOM position changed
//
// Parameters:
// elem - The DOM element that was moved
// oldNextSibling - The element's next sibling before it was moved
// oldParent - The element's parent before it was moved
// text - An optional string visible to user related to this change
var MoveElementCommand = this.undoCmd.moveElement = function(elem, oldNextSibling, oldParent, text) {
	this.elem = elem;
	this.text = text ? ("Move " + elem.tagName + " to " + text) : ("Move " + elem.tagName);
	this.oldNextSibling = oldNextSibling;
	this.oldParent = oldParent;
	this.newNextSibling = elem.nextSibling;
	this.newParent = elem.parentNode;

	// Function: MoveElementCommand.unapply
	// Re-positions the element
	this.apply = function() {
		this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);
		if (this.newParent == svgcontent) {
			identifyLayers();
		}
	};

	// Function: MoveElementCommand.unapply
	// Positions the element back to its original location
	this.unapply = function() {
		this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
		if (this.oldParent == svgcontent) {
			identifyLayers();
		}
	};

	// Function: MoveElementCommand.elements
	// Returns array with element associated with this command
	this.elements = function() { return [this.elem]; };
}

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

// Function: BatchCommand
// History command that can contain/execute multiple other commands
//
// Parameters:
// text - An optional string visible to user related to this change
var BatchCommand = this.undoCmd.batch = function(text) {
	this.text = text || "Batch Command";
	this.stack = [];

	// Function: BatchCommand.apply
	// Runs "apply" on all subcommands
	this.apply = function() {
		var len = this.stack.length;
		for (var i = 0; i < len; ++i) {
			this.stack[i].apply();
		}
	};

	// Function: BatchCommand.unapply
	// Runs "unapply" on all subcommands
	this.unapply = function() {
		for (var i = this.stack.length-1; i >= 0; i--) {
			this.stack[i].unapply();
		}
	};

	// Function: BatchCommand.elements
	// Iterate through all our subcommands and returns all the elements we are changing
	this.elements = function() {
		var elems = [];
		var cmd = this.stack.length;
		while (cmd--) {
			var thisElems = this.stack[cmd].elements();
			var elem = thisElems.length;
			while (elem--) {
				if (elems.indexOf(thisElems[elem]) == -1) elems.push(thisElems[elem]);
			}
		}
		return elems; 
	};

	// Function: BatchCommand.addSubCommand
	// Adds a given command to the history stack
	//
	// Parameters:
	// cmd - The undo command object to add
	this.addSubCommand = function(cmd) { this.stack.push(cmd); };

	// Function: BatchCommand.isEmpty
	// Returns a boolean indicating whether or not the batch command is empty
	this.isEmpty = function() { return this.stack.length == 0; };
}

// Set scope for these undo functions
var resetUndoStack, addCommandToHistory;

// Undo/redo stack related functions
(function(c) {
	var undoStackPointer = 0, 
		undoStack = [];
	
	// Function: resetUndoStack
	// Resets the undo stack, effectively clearing the undo/redo history
	resetUndoStack = function() {
		undoStack = [];
		undoStackPointer = 0;
	};
	
	c.undoMgr = {
		// Function: undoMgr.getUndoStackSize
		// Returns: 
		// Integer with the current size of the undo history stack
		getUndoStackSize: function() { return undoStackPointer; },
		
		// Function: undoMgr.getRedoStackSize
		// Returns: 
		// Integer with the current size of the redo history stack
		getRedoStackSize: function() { return undoStack.length - undoStackPointer; },
		
		// Function: undoMgr.getNextUndoCommandText
		// Returns: 
		// String associated with the next undo command
		getNextUndoCommandText: function() { 
			if (undoStackPointer > 0) 
				return undoStack[undoStackPointer-1].text;
			return "";
		},
		
		// Function: undoMgr.getNextRedoCommandText
		// Returns: 
		// String associated with the next redo command
		getNextRedoCommandText: function() { 
			if (undoStackPointer < undoStack.length) 
				return undoStack[undoStackPointer].text;
			return "";
		},
		
		// Function: undoMgr.undo
		// Performs an undo step
		undo: function() {
			if (undoStackPointer > 0) {
				c.clearSelection();
				var cmd = undoStack[--undoStackPointer];
				cmd.unapply();
				pathActions.clear();
				call("changed", cmd.elements());
			}
		},

		// Function: undoMgr.redo		
		// Performs a redo step
		redo: function() {
			if (undoStackPointer < undoStack.length && undoStack.length > 0) {
				c.clearSelection();
				var cmd = undoStack[undoStackPointer++];
				cmd.apply();
				pathActions.clear();
				call("changed", cmd.elements());
			}
		}
	};
	
	// Function: addCommandToHistory
	// Adds a command object to the undo history stack
	//
	// Parameters: 
	// cmd - The command object to add
	addCommandToHistory = c.undoCmd.add = function(cmd) {
	// FIXME: we MUST compress consecutive text changes to the same element
	// (right now each keystroke is saved as a separate command that includes the
	// entire text contents of the text element)
	// TODO: consider limiting the history that we store here (need to do some slicing)
	
		// if our stack pointer is not at the end, then we have to remove
		// all commands after the pointer and insert the new command
		if (undoStackPointer < undoStack.length && undoStack.length > 0) {
			undoStack = undoStack.splice(0, undoStackPointer);
		}
		undoStack.push(cmd);
		undoStackPointer = undoStack.length;
	};
	
}(canvas));

(function(c) {

	// New functions for refactoring of Undo/Redo
	
	// this is the stack that stores the original values, the elements and
	// the attribute name for begin/finish
	var undoChangeStackPointer = -1;
	var undoableChangeStack = [];
	
	// Function: beginUndoableChange
	// This function tells the canvas to remember the old values of the 
	// attrName attribute for each element sent in.  The elements and values 
	// are stored on a stack, so the next call to finishUndoableChange() will 
	// pop the elements and old values off the stack, gets the current values
	// from the DOM and uses all of these to construct the undo-able command.
	//
	// Parameters: 
	// attrName - The name of the attribute being changed
	// elems - Array of DOM elements being changed
	c.beginUndoableChange = function(attrName, elems) {
		var p = ++undoChangeStackPointer;
		var i = elems.length;
		var oldValues = new Array(i), elements = new Array(i);
		while (i--) {
			var elem = elems[i];
			if (elem == null) continue;
			elements[i] = elem;
			oldValues[i] = elem.getAttribute(attrName);
		}
		undoableChangeStack[p] = {'attrName': attrName,
								'oldValues': oldValues,
								'elements': elements};
	};
	
	// Function: finishUndoableChange
	// This function returns a BatchCommand object which summarizes the
	// change since beginUndoableChange was called.  The command can then
	// be added to the command history
	//
	// Returns: 
	// Batch command object with resulting changes
	c.finishUndoableChange = function() {
		var p = undoChangeStackPointer--;
		var changeset = undoableChangeStack[p];
		var i = changeset['elements'].length;
		var attrName = changeset['attrName'];
		var batchCmd = new BatchCommand("Change " + attrName);
		while (i--) {
			var elem = changeset['elements'][i];
			if (elem == null) continue;
			var changes = {};
			changes[attrName] = changeset['oldValues'][i];
			if (changes[attrName] != elem.getAttribute(attrName)) {
				batchCmd.addSubCommand(new ChangeElementCommand(elem, changes, attrName));
			}
		}
		undoableChangeStack[p] = null;
		return batchCmd;
	};

}(canvas));

// Put SelectorManager in this scope
var SelectorManager;

(function() {
	// Interface: Selector
	// Private class for DOM element selection boxes
	// 
	// Parameters:
	// id - integer to internally indentify the selector
	// elem - DOM element associated with this selector
	function Selector(id, elem) {
		// this is the selector's unique number
		this.id = id;

		// this holds a reference to the element for which this selector is being used
		this.selectedElement = elem;

		// this is a flag used internally to track whether the selector is being used or not
		this.locked = true;

		// Function: Selector.reset 
		// Used to reset the id and element that the selector is attached to
		//
		// Parameters: 
		// e - DOM element associated with this selector
		this.reset = function(e) {
			this.locked = true;
			this.selectedElement = e;
			this.resize();
			this.selectorGroup.setAttribute("display", "inline");
		};

		// this holds a reference to the <g> element that holds all visual elements of the selector
		this.selectorGroup = addSvgElementFromJson({ "element": "g",
													"attr": {"id": ("selectorGroup"+this.id)}
													});

		// this holds a reference to the path rect
		this.selectorRect = this.selectorGroup.appendChild( addSvgElementFromJson({
								"element": "path",
								"attr": {
									"id": ("selectedBox"+this.id),
									"fill": "none",
									"stroke": "#22C",
									"stroke-width": "1",
									"stroke-dasharray": "5,5",
									// need to specify this so that the rect is not selectable
									"style": "pointer-events:none"
								}
							}) );

		// this holds a reference to the grip elements for this selector
		this.selectorGrips = {	"nw":null,
								"n":null,
								"ne":null,
								"e":null,
								"se":null,
								"s":null,
								"sw":null,
								"w":null
								};
		this.rotateGripConnector = this.selectorGroup.appendChild( addSvgElementFromJson({
							"element": "line",
							"attr": {
								"id": ("selectorGrip_rotateconnector_" + this.id),
								"stroke": "#22C",
								"stroke-width": "1"
							}
						}) );
						
		this.rotateGrip = this.selectorGroup.appendChild( addSvgElementFromJson({
							"element": "circle",
							"attr": {
								"id": ("selectorGrip_rotate_" + this.id),
								"fill": "lime",
								"r": 4,
								"stroke": "#22C",
								"stroke-width": 2,
								"style": "cursor:url(" + curConfig.imgPath + "rotate.png) 12 12, auto;"
							}
						}) );
		
		// add the corner grips
		for (var dir in this.selectorGrips) {
			this.selectorGrips[dir] = this.selectorGroup.appendChild( 
				addSvgElementFromJson({
					"element": "circle",
					"attr": {
						"id": ("selectorGrip_resize_" + dir + "_" + this.id),
						"fill": "#22C",
						"r": 4,
						"style": ("cursor:" + dir + "-resize"),
						// This expands the mouse-able area of the grips making them
						// easier to grab with the mouse.
						// This works in Opera and WebKit, but does not work in Firefox
						// see https://bugzilla.mozilla.org/show_bug.cgi?id=500174
						"stroke-width": 2,
						"pointer-events":"all",
						"display":"none"
					}
				}) );
		}

		// Function: Selector.showGrips
		// Show the resize grips of this selector
		//
		// Parameters:
		// show - boolean indicating whether grips should be shown or not
		this.showGrips = function(show) {
			// TODO: use suspendRedraw() here
			var bShow = show ? "inline" : "none";
			this.rotateGrip.setAttribute("display", bShow);
			this.rotateGripConnector.setAttribute("display", bShow);
			var elem = this.selectedElement;
			for (var dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute("display", bShow);
			}
			if(elem) this.updateGripCursors(getRotationAngle(elem));
		};
		
		// Function: Selector.updateGripCursors
		// Updates cursors for corner grips on rotation so arrows point the right way
		//
		// Parameters:
		// angle - Float indicating current rotation angle in degrees
		this.updateGripCursors = function(angle) {
			var dir_arr = [];
			var steps = Math.round(angle / 45);
			if(steps < 0) steps += 8;
			for (var dir in this.selectorGrips) {
				dir_arr.push(dir);
			}
			while(steps > 0) {
				dir_arr.push(dir_arr.shift());
				steps--;
			}
			var i = 0;
			for (var dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute('style', ("cursor:" + dir_arr[i] + "-resize"));
				i++;
			};
		};
		
		// Function: Selector.resize
		// Updates the selector to match the element's size
		this.resize = function() {
			var selectedBox = this.selectorRect,
				selectedGrips = this.selectorGrips,
				selected = this.selectedElement,
				 sw = selected.getAttribute("stroke-width");
			var offset = 1/current_zoom;
			if (selected.getAttribute("stroke") != "none" && !isNaN(sw)) {
				offset += (sw/2);
			}
			if (selected.tagName == "text") {
				offset += 2/current_zoom;
			}
			var bbox = getBBox(selected);
			if(selected.tagName == 'g' && !$(selected).data('gsvg')) {
				// The bbox for a group does not include stroke vals, so we
				// get the bbox based on its children. 
				var stroked_bbox = getStrokedBBox(selected.childNodes);
				if(stroked_bbox) {
					$.each(bbox, function(key, val) {
						bbox[key] = stroked_bbox[key];
					});
				}
			}

			// loop and transform our bounding box until we reach our first rotation
			var m = getMatrix(selected);

			// This should probably be handled somewhere else, but for now
			// it keeps the selection box correctly positioned when zoomed
			m.e *= current_zoom;
			m.f *= current_zoom;
			
			// apply the transforms
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset*2), h=bbox.height+(offset*2),
				bbox = {x:l, y:t, width:w, height:h};
			
			// we need to handle temporary transforms too
			// if skewed, get its transformed box, then find its axis-aligned bbox
			
			//*
			var nbox = transformBox(l*current_zoom, t*current_zoom, w*current_zoom, h*current_zoom, m),
				nbax = nbox.aabox.x,
				nbay = nbox.aabox.y,
				nbaw = nbox.aabox.width,
				nbah = nbox.aabox.height;
				
			// now if the shape is rotated, un-rotate it
			var cx = nbax + nbaw/2,
				cy = nbay + nbah/2;
			var angle = getRotationAngle(selected);
			if (angle) {
				
				var rot = svgroot.createSVGTransform();
				rot.setRotate(-angle,cx,cy);
				var rotm = rot.matrix;
				nbox.tl = transformPoint(nbox.tl.x,nbox.tl.y,rotm);
				nbox.tr = transformPoint(nbox.tr.x,nbox.tr.y,rotm);
				nbox.bl = transformPoint(nbox.bl.x,nbox.bl.y,rotm);
				nbox.br = transformPoint(nbox.br.x,nbox.br.y,rotm);
				
				// calculate the axis-aligned bbox
				var minx = nbox.tl.x,
					miny = nbox.tl.y,
					maxx = nbox.tl.x,
					maxy = nbox.tl.y;
				
				minx = Math.min(minx, Math.min(nbox.tr.x, Math.min(nbox.bl.x, nbox.br.x) ) );
				miny = Math.min(miny, Math.min(nbox.tr.y, Math.min(nbox.bl.y, nbox.br.y) ) );
				maxx = Math.max(maxx, Math.max(nbox.tr.x, Math.max(nbox.bl.x, nbox.br.x) ) );
				maxy = Math.max(maxy, Math.max(nbox.tr.y, Math.max(nbox.bl.y, nbox.br.y) ) );
				
				nbax = minx;
				nbay = miny;
				nbaw = (maxx-minx);
				nbah = (maxy-miny);
			}

			var sr_handle = svgroot.suspendRedraw(100);

			var dstr = "M" + nbax + "," + nbay
						+ " L" + (nbax+nbaw) + "," + nbay
						+ " " + (nbax+nbaw) + "," + (nbay+nbah)
						+ " " + nbax + "," + (nbay+nbah) + "z";
			assignAttributes(selectedBox, {'d': dstr});
			
			var gripCoords = {
				nw: [nbax, nbay],
				ne: [nbax+nbaw, nbay],
				sw: [nbax, nbay+nbah],
				se: [nbax+nbaw, nbay+nbah],
				n:  [nbax + (nbaw)/2, nbay],
				w:	[nbax, nbay + (nbah)/2],
				e:	[nbax + nbaw, nbay + (nbah)/2],
				s:	[nbax + (nbaw)/2, nbay + nbah]
			};
			
			if(selected == selectedElements[0]) {
				for(var dir in gripCoords) {
					var coords = gripCoords[dir];
					assignAttributes(selectedGrips[dir], {
						cx: coords[0], cy: coords[1]
					});
				};
			}

			if (angle) {
				this.selectorGroup.setAttribute("transform", "rotate(" + [angle,cx,cy].join(",") + ")");
			}
			else {
				this.selectorGroup.setAttribute("transform", "");
			}

			// we want to go 20 pixels in the negative transformed y direction, ignoring scale
			assignAttributes(this.rotateGripConnector, { x1: nbax + (nbaw)/2, 
														y1: nbay, 
														x2: nbax + (nbaw)/2, 
														y2: nbay- 20});
			assignAttributes(this.rotateGrip, { cx: nbax + (nbaw)/2, 
												cy: nbay - 20 });
			
			svgroot.unsuspendRedraw(sr_handle);
		};

		// now initialize the selector
		this.reset(elem);
	};

	// Interface: SelectorManager
	// Public class to manage all selector objects (selection boxes)
	SelectorManager = function() {
	
		// this will hold the <g> element that contains all selector rects/grips
		this.selectorParentGroup = null;
	
		// this is a special rect that is used for multi-select
		this.rubberBandBox = null;
	
		// this will hold objects of type Selector (see above)
		this.selectors = [];
	
		// this holds a map of SVG elements to their Selector object
		this.selectorMap = {};
	
		// local reference to this object
		var mgr = this;
		
		// Function: SelectorManager.initGroup
		// Resets the parent selector group element
		this.initGroup = function() {
			// remove old selector parent group if it existed
			if (mgr.selectorParentGroup && mgr.selectorParentGroup.parentNode) {
				mgr.selectorParentGroup.parentNode.removeChild(mgr.selectorParentGroup);
			}
			// create parent selector group and add it to svgroot
			mgr.selectorParentGroup = svgdoc.createElementNS(svgns, "g");
			mgr.selectorParentGroup.setAttribute("id", "selectorParentGroup");
			svgroot.appendChild(mgr.selectorParentGroup);
			mgr.selectorMap = {};
			mgr.selectors = [];
			mgr.rubberBandBox = null;
			
			if($("#canvasBackground").length) return;
	
			var canvasbg = svgdoc.createElementNS(svgns, "svg");
			var dims = curConfig.dimensions;
			assignAttributes(canvasbg, {
				'id':'canvasBackground',
				'width': dims[0],
				'height': dims[1],
				'x': 0,
				'y': 0,
				'overflow': 'visible',
				'style': 'pointer-events:none'
			});
			
			var rect = svgdoc.createElementNS(svgns, "rect");
			assignAttributes(rect, {
				'width': '100%',
				'height': '100%',
				'x': 0,
				'y': 0,
				'stroke-width': 1,
				'stroke': '#000',
				'fill': '#FFF',
				'style': 'pointer-events:none'
			});
			// Both Firefox and WebKit are too slow with this filter region (especially at higher
			// zoom levels) and Opera has at least one bug
	//			if (!window.opera) rect.setAttribute('filter', 'url(#canvashadow)');
			canvasbg.appendChild(rect);
			svgroot.insertBefore(canvasbg, svgcontent);
		};
		
		// Function: SelectorManager.requestSelector
		// Returns the selector based on the given element
		//
		// Parameters:
		// elem - DOM element to get the selector for
		this.requestSelector = function(elem) {
			if (elem == null) return null;
			var N = this.selectors.length;
			// if we've already acquired one for this element, return it
			if (typeof(this.selectorMap[elem.id]) == "object") {
				this.selectorMap[elem.id].locked = true;
				return this.selectorMap[elem.id];
			}
			for (var i = 0; i < N; ++i) {
				if (this.selectors[i] && !this.selectors[i].locked) {
					this.selectors[i].locked = true;
					this.selectors[i].reset(elem);
					this.selectorMap[elem.id] = this.selectors[i];
					return this.selectors[i];
				}
			}
			// if we reached here, no available selectors were found, we create one
			this.selectors[N] = new Selector(N, elem);
			this.selectorParentGroup.appendChild(this.selectors[N].selectorGroup);
			this.selectorMap[elem.id] = this.selectors[N];
			return this.selectors[N];
		};
		
		// Function: SelectorManager.releaseSelector
		// Removes the selector of the given element (hides selection box) 
		//
		// Parameters:
		// elem - DOM element to remove the selector for
		this.releaseSelector = function(elem) {
			if (elem == null) return;
			var N = this.selectors.length,
				sel = this.selectorMap[elem.id];
			for (var i = 0; i < N; ++i) {
				if (this.selectors[i] && this.selectors[i] == sel) {
					if (sel.locked == false) {
						console.log("WARNING! selector was released but was already unlocked");
					}
					delete this.selectorMap[elem.id];
					sel.locked = false;
					sel.selectedElement = null;
					sel.showGrips(false);
	
					// remove from DOM and store reference in JS but only if it exists in the DOM
					try {
						sel.selectorGroup.setAttribute("display", "none");
					} catch(e) { }
	
					break;
				}
			}
		};
	
		// Function: SelectorManager.getRubberBandBox
		// Returns the rubberBandBox DOM element. This is the rectangle drawn by the user for selecting/zooming
		this.getRubberBandBox = function() {
			if (this.rubberBandBox == null) {
				this.rubberBandBox = this.selectorParentGroup.appendChild(
						addSvgElementFromJson({ "element": "rect",
							"attr": {
								"id": "selectorRubberBand",
								"fill": "#22C",
								"fill-opacity": 0.15,
								"stroke": "#22C",
								"stroke-width": 0.5,
								"display": "none",
								"style": "pointer-events:none"
							}
						}));
			}
			return this.rubberBandBox;
		};
	
		this.initGroup();
	};
}());


// **************************************************************************************
// SVGTransformList implementation for Webkit 
// These methods do not currently raise any exceptions.
// These methods also do not check that transforms are being inserted or handle if
// a transform is already in the list, etc.  This is basically implementing as much
// of SVGTransformList that we need to get the job done.
//
//  interface SVGEditTransformList { 
//		attribute unsigned long numberOfItems;
//		void   clear (  )
//		SVGTransform initialize ( in SVGTransform newItem )
//		SVGTransform getItem ( in unsigned long index )
//		SVGTransform insertItemBefore ( in SVGTransform newItem, in unsigned long index )
//		SVGTransform replaceItem ( in SVGTransform newItem, in unsigned long index )
//		SVGTransform removeItem ( in unsigned long index )
//		SVGTransform appendItem ( in SVGTransform newItem )
//		NOT IMPLEMENTED: SVGTransform createSVGTransformFromMatrix ( in SVGMatrix matrix );
//		NOT IMPLEMENTED: SVGTransform consolidate (  );
//	}
// **************************************************************************************
var svgTransformLists = {};
var SVGEditTransformList = function(elem) {

	function transformToString(xform) {
		var m = xform.matrix,
			text = "";
		switch(xform.type) {
			case 1: // MATRIX
				text = "matrix(" + [m.a,m.b,m.c,m.d,m.e,m.f].join(",") + ")";
				break;
			case 2: // TRANSLATE
				text = "translate(" + m.e + "," + m.f + ")";
				break;
			case 3: // SCALE
				if (m.a == m.d) text = "scale(" + m.a + ")";
				else text = "scale(" + m.a + "," + m.d + ")";
				break;
			case 4: // ROTATE
				var cx = 0, cy = 0;
				// this prevents divide by zero
				if (xform.angle != 0) {
					var K = 1 - m.a;
					cy = ( K * m.f + m.b*m.e ) / ( K*K + m.b*m.b );
					cx = ( m.e - m.b * cy ) / K;
				}
				text = "rotate(" + xform.angle + " " + cx + "," + cy + ")";
				break;
		}
		return text;
	};

	this._elem = elem || null;
	this._xforms = [];
	// TODO: how do we capture the undo-ability in the changed transform list?
	this._update = function() {
		var tstr = "";
		var concatMatrix = svgroot.createSVGMatrix();
		for (var i = 0; i < this.numberOfItems; ++i) {
			var xform = this._list.getItem(i);
			tstr += transformToString(xform) + " ";
		}
		this._elem.setAttribute("transform", tstr);
	};
	this._list = this;
	this._init = function() {
		// Transform attribute parser
		var str = this._elem.getAttribute("transform");
		if(!str) return;
		
		// TODO: Add skew support in future
		var re = /\s*((scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/;
		var arr = [];
		var m = true;
		while(m) {
			m = str.match(re);
			str = str.replace(re,'');
			if(m && m[1]) {
				var x = m[1];
				var bits = x.split(/\s*\(/);
				var name = bits[0];
				var val_bits = bits[1].match(/\s*(.*?)\s*\)/);
				var val_arr = val_bits[1].split(/[, ]+/);
				var letters = 'abcdef'.split('');
				var mtx = svgroot.createSVGMatrix();
				$.each(val_arr, function(i, item) {
					val_arr[i] = parseFloat(item);
					if(name == 'matrix') {
						mtx[letters[i]] = val_arr[i];
					}
				});
				var xform = svgroot.createSVGTransform();
				var fname = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
				var values = name=='matrix'?[mtx]:val_arr;
				
				if(name == 'scale' && values.length == 1) {
					values.push(values[0]);
				} else if(name == 'translate' && values.length == 1) {
					values.push(0);
				}
				xform[fname].apply(xform, values);
				this._list.appendItem(xform);
			}
		}
	}
	
	this.numberOfItems = 0;
	this.clear = function() { 
		this.numberOfItems = 0;
		this._xforms = [];
	};
	
	this.initialize = function(newItem) {
		this.numberOfItems = 1;
		this._xforms = [newItem];
	};
	
	this.getItem = function(index) {
		if (index < this.numberOfItems && index >= 0) {
			return this._xforms[index];
		}
		return null;
	};
	
	this.insertItemBefore = function(newItem, index) {
		var retValue = null;
		if (index >= 0) {
			if (index < this.numberOfItems) {
				var newxforms = new Array(this.numberOfItems + 1);
				// TODO: use array copying and slicing
				for ( var i = 0; i < index; ++i) {
					newxforms[i] = this._xforms[i];
				}
				newxforms[i] = newItem;
				for ( var j = i+1; i < this.numberOfItems; ++j, ++i) {
					newxforms[j] = this._xforms[i];
				}
				this.numberOfItems++;
				this._xforms = newxforms;
				retValue = newItem;
				this._list._update();
			}
			else {
				retValue = this._list.appendItem(newItem);
			}
		}
		return retValue;
	};
	
	this.replaceItem = function(newItem, index) {
		var retValue = null;
		if (index < this.numberOfItems && index >= 0) {
			this._xforms[index] = newItem;
			retValue = newItem;
			this._list._update();
		}
		return retValue;
	};
	
	this.removeItem = function(index) {
		var retValue = null;
		if (index < this.numberOfItems && index >= 0) {
			var retValue = this._xforms[index];
			var newxforms = new Array(this.numberOfItems - 1);
			for (var i = 0; i < index; ++i) {
				newxforms[i] = this._xforms[i];
			}
			for (var j = i; j < this.numberOfItems-1; ++j, ++i) {
				newxforms[j] = this._xforms[i+1];
			}
			this.numberOfItems--;
			this._xforms = newxforms;
			this._list._update();
		}
		return retValue;
	};
	
	this.appendItem = function(newItem) {
		this._xforms.push(newItem);
		this.numberOfItems++;
		this._list._update();
		return newItem;
	};
};
// **************************************************************************************

// Group: Helper functions

// Function: walkTree
// Walks the tree and executes the callback on each element in a top-down fashion
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
function walkTree(elem, cbFn){
	if (elem && elem.nodeType == 1) {
		cbFn(elem);
		var i = elem.childNodes.length;
		while (i--) {
			walkTree(elem.childNodes.item(i), cbFn);
		}
	}
};

// Function: walkTreePost
// Walks the tree and executes the callback on each element in a depth-first fashion
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
function walkTreePost(elem, cbFn) {
	if (elem && elem.nodeType == 1) {
		var i = elem.childNodes.length;
		while (i--) {
			walkTree(elem.childNodes.item(i), cbFn);
		}
		cbFn(elem);
	}
};

// Function: assignAttributes
// Assigns multiple attributes to an element.
//
// Parameters: 
// node - DOM element to apply new attribute values to
// attrs - Object with attribute keys/values
// suspendLength - Optional integer of milliseconds to suspend redraw
// unitCheck - Boolean to indicate the need to use setUnitAttr
var assignAttributes = this.assignAttributes = function(node, attrs, suspendLength, unitCheck) {
	if(!suspendLength) suspendLength = 0;
	// Opera has a problem with suspendRedraw() apparently
	var handle = null;
	if (!window.opera) svgroot.suspendRedraw(suspendLength);

	for (var i in attrs) {
		var ns = (i.substr(0,4) == "xml:" ? xmlns : 
			i.substr(0,6) == "xlink:" ? xlinkns : null);
			
		if(ns || !unitCheck) {
			node.setAttributeNS(ns, i, attrs[i]);
		} else {
			setUnitAttr(node, i, attrs[i]);
		}
		
	}
	
	if (!window.opera) svgroot.unsuspendRedraw(handle);
};

// Function: cleanupElement
// Remove unneeded (default) attributes, makes resulting SVG smaller
//
// Parameters:
// element - DOM element to clean up
var cleanupElement = this.cleanupElement = function(element) {
	var handle = svgroot.suspendRedraw(60);
	var defaults = {
		'fill-opacity':1,
		'stop-opacity':1,
		'opacity':1,
		'stroke':'none',
		'stroke-dasharray':'none',
		'stroke-linejoin':'miter',
		'stroke-linecap':'butt',
		'stroke-opacity':1,
		'stroke-width':1,
		'rx':0,
		'ry':0
	}
	
	for(var attr in defaults) {
		var val = defaults[attr];
		if(element.getAttribute(attr) == val) {
			element.removeAttribute(attr);
		}
	}
	
	svgroot.unsuspendRedraw(handle);
};

// Function: addSvgElementFromJson
// Create a new SVG element based on the given object keys/values and add it to the current layer
// The element will be ran through cleanupElement before being returned 
//
// Parameters:
// data - Object with the following keys/values:
// * element - DOM element to create
// * attr - Object with attributes/values to assign to the new element
// * curStyles - Boolean indicating that current style attributes should be applied first
//
// Returns: The new element
var addSvgElementFromJson = this.addSvgElementFromJson = function(data) {
	var shape = getElem(data.attr.id);
	// if shape is a path but we need to create a rect/ellipse, then remove the path
	if (shape && data.element != shape.tagName) {
		current_layer.removeChild(shape);
		shape = null;
	}
	if (!shape) {
		shape = svgdoc.createElementNS(svgns, data.element);
		if (current_layer) {
			current_layer.appendChild(shape);
		}
	}
	if(data.curStyles) {
		assignAttributes(shape, {
			"fill": cur_shape.fill,
			"stroke": cur_shape.stroke,
			"stroke-width": cur_shape.stroke_width,
			"stroke-dasharray": cur_shape.stroke_dasharray,
			"stroke-linejoin": cur_shape.stroke_linejoin,
			"stroke-linecap": cur_shape.stroke_linecap,
			"stroke-opacity": cur_shape.stroke_opacity,
			"fill-opacity": cur_shape.fill_opacity,
			"opacity": cur_shape.opacity / 2,
			"style": "pointer-events:inherit"
		}, 100);
	}
	assignAttributes(shape, data.attr, 100);
	cleanupElement(shape);
	return shape;
};

(function() {
	// TODO: make this string optional and set by the client
	var comment = svgdoc.createComment(" Created with SVG-edit - http://svg-edit.googlecode.com/ ");
	svgcontent.appendChild(comment);

	// TODO For Issue 208: this is a start on a thumbnail
	//	var svgthumb = svgdoc.createElementNS(svgns, "use");
	//	svgthumb.setAttribute('width', '100');
	//	svgthumb.setAttribute('height', '100');
	//	setHref(svgthumb, '#svgcontent');
	//	svgroot.appendChild(svgthumb);

})();

// z-ordered array of tuples containing layer names and <g> elements
// the first layer is the one at the bottom of the rendering
var all_layers = [],

	// Object to contain image data for raster images that were found encodable
	encodableImages = {},
	
	// String with image URL of last loadable image
	last_good_img_url = curConfig.imgPath + 'logo.png',
	
	// pointer to the current layer <g>
	current_layer = null,
	
	// Object with save options
	save_options = {round_digits: 5},
	
	// Boolean indicating whether or not a draw action has been started
	started = false,
	
	// Integer with internal ID number for the latest element
	obj_num = 1,
	
	// String with an element's initial transform attribute value
	start_transform = null,
	
	// String indicating the current editor mode
	current_mode = "select",
	
	// String with the current direction in which an element is being resized
	current_resize_mode = "none",
	
	// Object containing data for the currently selected styles
	all_properties = {
		shape: {
			fill: "#" + curConfig.initFill.color,
			fill_paint: null,
			fill_opacity: curConfig.initFill.opacity,
			stroke: "#" + curConfig.initStroke.color,
			stroke_paint: null,
			stroke_opacity: curConfig.initStroke.opacity,
			stroke_width: curConfig.initStroke.width,
			stroke_dasharray: 'none',
			stroke_linejoin: 'miter',
			stroke_linecap: 'butt',
			opacity: curConfig.initOpacity
		}
	};

all_properties.text = $.extend(true, {}, all_properties.shape);
$.extend(all_properties.text, {
	fill: "#000000",
	stroke_width: 0,
	font_size: 24,
	font_family: 'serif'
});

// Current shape style properties
var cur_shape = all_properties.shape,

	// Current text style properties
	cur_text = all_properties.text,
	
	// Current general properties
	cur_properties = cur_shape,
	
	// Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
	current_zoom = 1,
	
	// Array with all the currently selected elements
	// default size of 1 until it needs to grow bigger
	selectedElements = new Array(1),
	
	// Array with selected elements' Bounding box object
	selectedBBoxes = new Array(1),
	
	// The DOM element that was just selected
	justSelected = null,
	
	// this object manages selectors for us
	selectorManager = this.selectorManager = new SelectorManager(),
	
	// DOM element for selection rectangle drawn by the user
	rubberBox = null,
	
	// Array of current BBoxes (still needed?)
	curBBoxes = [],
	
	// Object to contain all included extensions
	extensions = {},
	
	// Canvas point for the most recent right click
	lastClickPoint = null;

// Clipboard for cut, copy&pasted elements
canvas.clipBoard = [];

// Should this return an array by default, so extension results aren't overwritten?
var runExtensions = this.runExtensions = function(action, vars, returnArray) {
	var result = false;
	if(returnArray) result = [];
	$.each(extensions, function(name, opts) {
		if(action in opts) {
			if(returnArray) {
				result.push(opts[action](vars))
			} else {
				result = opts[action](vars);
			}
		}
	});
	return result;
}

// Function: addExtension
// Add an extension to the editor
// 
// Parameters:
// name - String with the ID of the extension
// ext_func - Function supplied by the extension with its data
this.addExtension = function(name, ext_func) {
	if(!(name in extensions)) {
		// Provide private vars/funcs here. Is there a better way to do this?
		
		if($.isFunction(ext_func)) {
		var ext = ext_func($.extend(canvas.getPrivateMethods(), {
			svgroot: svgroot,
			svgcontent: svgcontent,
			nonce: nonce,
			selectorManager: selectorManager
		}));
		} else {
			var ext = ext_func;
		}
		extensions[name] = ext;
		call("extension_added", ext);
	} else {
		console.log('Cannot add extension "' + name + '", an extension by that name already exists"');
	}
};
	
// Function: shortFloat
// Rounds a given value to a float with number of digits defined in save_options
//
// Parameters: 
// val - The value as a String, Number or Array of two numbers to be rounded
//
// Returns:
// If a string/number was given, returns a Float. If an array, return a string
// with comma-seperated floats
var shortFloat = function(val) {
	var digits = save_options.round_digits;
	if(!isNaN(val)) {
		return Number(Number(val).toFixed(digits));
	} else if($.isArray(val)) {
		return shortFloat(val[0]) + ',' + shortFloat(val[1]);
	}
}
	
// This method rounds the incoming value to the nearest value based on the current_zoom
var round = this.round = function(val) {
	return parseInt(val*current_zoom)/current_zoom;
};

// This method sends back an array or a NodeList full of elements that
// intersect the multi-select rubber-band-box on the current_layer only.
// 
// Since the only browser that supports the SVG DOM getIntersectionList is Opera, 
// we need to provide an implementation here.  We brute-force it for now.
// 
// Reference:
// Firefox does not implement getIntersectionList(), see https://bugzilla.mozilla.org/show_bug.cgi?id=501421
// Webkit does not implement getIntersectionList(), see https://bugs.webkit.org/show_bug.cgi?id=11274
var getIntersectionList = this.getIntersectionList = function(rect) {
	if (rubberBox == null) { return null; }

	if(!curBBoxes.length) {
		// Cache all bboxes
		curBBoxes = getVisibleElements(current_layer, true);
	}
	
	var resultList = null;
	try {
		resultList = current_layer.getIntersectionList(rect, null);
	} catch(e) { }

	if (resultList == null || typeof(resultList.item) != "function") {
		resultList = [];
		
		if(!rect) {
			var rubberBBox = rubberBox.getBBox();
			var bb = {};
			$.each(rubberBBox, function(key, val) {
				// Can't set values to a real BBox object, so make a fake one
				bb[key] = val / current_zoom;
			});
			rubberBBox = bb;
			
		} else {
			var rubberBBox = rect;
		}
		var i = curBBoxes.length;
		while (i--) {
			if(!rubberBBox.width || !rubberBBox.width) continue;
			if (Utils.rectsIntersect(rubberBBox, curBBoxes[i].bbox))  {
				resultList.push(curBBoxes[i].elem);
			}
		}
	}
	// addToSelection expects an array, but it's ok to pass a NodeList 
	// because using square-bracket notation is allowed: 
	// http://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
	return resultList;
};

// Function: getStrokedBBox
// Get the bounding box for one or more stroked and/or transformed elements
// 
// Parameters:
// elems - Array with DOM elements to check
// 
// Returns:
// A single bounding box object
var getStrokedBBox = this.getStrokedBBox = function(elems) {
	if(!elems) elems = getVisibleElements();
	if(!elems.length) return false;
	// Make sure the expected BBox is returned if the element is a group
	var getCheckedBBox = function(elem) {
	
		try {
			// TODO: Fix issue with rotated groups. Currently they work
			// fine in FF, but not in other browsers (same problem mentioned
			// in Issue 339 comment #2).
			
			var bb = getBBox(elem);
			
			var angle = getRotationAngle(elem);
			if ((angle && angle % 90) || hasMatrixTransform(getTransformList(elem))) {
				// Accurate way to get BBox of rotated element in Firefox:
				// Put element in group and get its BBox
				
				var good_bb = false;
				
				// Get the BBox from the raw path for these elements
				var elemNames = ['ellipse','path','line','polyline','polygon'];
				if($.inArray(elem.tagName, elemNames) != -1) {
					bb = good_bb = canvas.convertToPath(elem, true);
				} else if(elem.tagName == 'rect') {
					// Look for radius
					var rx = elem.getAttribute('rx');
					var ry = elem.getAttribute('ry');
					if(rx || ry) {
						bb = good_bb = canvas.convertToPath(elem, true);
					}
				}
				
				if(!good_bb) {
					var g = document.createElementNS(svgns, "g");
					var parent = elem.parentNode;
					parent.replaceChild(g, elem);
					g.appendChild(elem);
					bb = g.getBBox();
					parent.insertBefore(elem,g);
					parent.removeChild(g);
				}
				

				// Old method: Works by giving the rotated BBox,
				// this is (unfortunately) what Opera and Safari do
				// natively when getting the BBox of the parent group
// 						var angle = angle * Math.PI / 180.0;
// 						var rminx = Number.MAX_VALUE, rminy = Number.MAX_VALUE, 
// 							rmaxx = Number.MIN_VALUE, rmaxy = Number.MIN_VALUE;
// 						var cx = round(bb.x + bb.width/2),
// 							cy = round(bb.y + bb.height/2);
// 						var pts = [ [bb.x - cx, bb.y - cy], 
// 									[bb.x + bb.width - cx, bb.y - cy],
// 									[bb.x + bb.width - cx, bb.y + bb.height - cy],
// 									[bb.x - cx, bb.y + bb.height - cy] ];
// 						var j = 4;
// 						while (j--) {
// 							var x = pts[j][0],
// 								y = pts[j][1],
// 								r = Math.sqrt( x*x + y*y );
// 							var theta = Math.atan2(y,x) + angle;
// 							x = round(r * Math.cos(theta) + cx);
// 							y = round(r * Math.sin(theta) + cy);
// 		
// 							// now set the bbox for the shape after it's been rotated
// 							if (x < rminx) rminx = x;
// 							if (y < rminy) rminy = y;
// 							if (x > rmaxx) rmaxx = x;
// 							if (y > rmaxy) rmaxy = y;
// 						}
// 						
// 						bb.x = rminx;
// 						bb.y = rminy;
// 						bb.width = rmaxx - rminx;
// 						bb.height = rmaxy - rminy;
			}
			return bb;
		} catch(e) { 
			console.log(elem, e);
			return null;
		} 

	}
	var full_bb;
	$.each(elems, function() {
		if(full_bb) return;
		if(!this.parentNode) return;
		full_bb = getCheckedBBox(this);
		if(full_bb) {
			var b = {};
			for(var i in full_bb) b[i] = full_bb[i];
			full_bb = b;
		}

	});
	
	// This shouldn't ever happen...
	if(full_bb == null) return null;
	
	// full_bb doesn't include the stoke, so this does no good!
// 		if(elems.length == 1) return full_bb;
	
	var max_x = full_bb.x + full_bb.width;
	var max_y = full_bb.y + full_bb.height;
	var min_x = full_bb.x;
	var min_y = full_bb.y;
	
	// FIXME: same re-creation problem with this function as getCheckedBBox() above
	var getOffset = function(elem) {
		var sw = elem.getAttribute("stroke-width");
		var offset = 0;
		if (elem.getAttribute("stroke") != "none" && !isNaN(sw)) {
			offset += sw/2;
		}
		return offset;
	}
	var bboxes = [];
	$.each(elems, function(i, elem) {
		var cur_bb = getCheckedBBox(elem);
		if(cur_bb) {
			var offset = getOffset(elem);
			min_x = Math.min(min_x, cur_bb.x - offset);
			min_y = Math.min(min_y, cur_bb.y - offset);
			bboxes.push(cur_bb);
		}
	});
	
	full_bb.x = min_x;
	full_bb.y = min_y;
	
	$.each(elems, function(i, elem) {
		var cur_bb = bboxes[i];
		// ensure that elem is really an element node
		if (cur_bb && elem.nodeType == 1) {
			var offset = getOffset(elem);
			max_x = Math.max(max_x, cur_bb.x + cur_bb.width + offset);
			max_y = Math.max(max_y, cur_bb.y + cur_bb.height + offset);
		}
	});
	
	full_bb.width = max_x - min_x;
	full_bb.height = max_y - min_y;
	return full_bb;
}

// Function: getVisibleElements
// Get all elements that have a BBox (excludes <defs>, <title>, etc).
// Note that 0-opacity, off-screen etc elements are still considered "visible"
// for this function
//
// Parameters:
// parent - The parent DOM element to search within
// includeBBox - Boolean to indicate that an object should return with the element and its bbox
//
// Returns:
// An array with all "visible" elements, or if includeBBox is true, an array with
// objects that include:
// * elem - The element
// * bbox - The element's BBox as retrieved from getStrokedBBox
var getVisibleElements = this.getVisibleElements = function(parent, includeBBox) {
	if(!parent) parent = $(svgcontent).children(); // Prevent layers from being included
	
	var contentElems = [];
	$(parent).children().each(function(i, elem) {
		try {
			var box = elem.getBBox();
			if (box) {
				var item = includeBBox?{'elem':elem, 'bbox':getStrokedBBox([elem])}:elem;
				contentElems.push(item);
			}
		} catch(e) {}
	});
	return contentElems.reverse();
}

// Function: groupSvgElem
// Wrap an SVG element into a group element, mark the group as 'gsvg'
//
// Parameters:
// elem - SVG element to wrap
var groupSvgElem = this.groupSvgElem = function(elem) {
	var g = document.createElementNS(svgns, "g");
	elem.parentNode.replaceChild(g, elem);
	$(g).append(elem).data('gsvg', elem)[0].id = getNextId();
}

// Function: copyElem
// Create a clone of an element, updating its ID and its children's IDs when needed
//
// Parameters:
// el - DOM element to clone
//
// Returns: The cloned element
var copyElem = function(el) {
	// manually create a copy of the element
	var new_el = document.createElementNS(el.namespaceURI, el.nodeName);
	$.each(el.attributes, function(i, attr) {
		if (attr.localName != '-moz-math-font-style') {
			new_el.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.nodeValue);
		}
	});
	// set the copied element's new id
	new_el.removeAttribute("id");
	new_el.id = getNextId();
	// manually increment obj_num because our cloned elements are not in the DOM yet
	obj_num++; 
	
	// Opera's "d" value needs to be reset for Opera/Win/non-EN
	// Also needed for webkit (else does not keep curved segments on clone)
	if((isWebkit) && el.nodeName == 'path') {
		var fixed_d = pathActions.convertPath(el);
		new_el.setAttribute('d', fixed_d);
	}

	// now create copies of all children
	$.each(el.childNodes, function(i, child) {
		switch(child.nodeType) {
			case 1: // element node
				new_el.appendChild(copyElem(child));
				break;
			case 3: // text node
				new_el.textContent = child.nodeValue;
				break;
			default:
				break;
		}
	});
	
	if($(el).data('gsvg')) {
		$(new_el).data('gsvg', new_el.firstChild);
	} else if($(el).data('symbol')) {
		var ref = $(el).data('symbol');
		$(new_el).data('ref', ref).data('symbol', ref);
	}
	
	else if(new_el.tagName == 'image') {
		preventClickDefault(new_el);
	}
	return new_el;
};

// Function: getElem
// Get a DOM element by ID within the SVG root element.
//
// Parameters:
// id - String with the element's new ID
function getElem(id) {
// 	if(svgroot.getElementById) {
// 		// getElementById lookup
// 		return svgroot.getElementById(id);
// 	} else 
	
	if(svgroot.querySelector) {
		// querySelector lookup
		return svgroot.querySelector('#'+id);
	} else if(svgdoc.evaluate) {
		// xpath lookup
		return svgdoc.evaluate('svg:svg[@id="svgroot"]//svg:*[@id="'+id+'"]', container, function() { return "http://www.w3.org/2000/svg"; }, 9, null).singleNodeValue;
	} else {
		// jQuery lookup: twice as slow as xpath in FF
		return $(svgroot).find('[id=' + id + ']')[0];
	}
	
	// getElementById lookup: includes icons, not good
	// return svgdoc.getElementById(id);
}

// Set scope for these functions
var getId, getNextId;

(function(c) {

	// Object to contain editor event names and callback functions
	var events = {};

	// Prefix string for element IDs
	var idprefix = "svg_";

	// Function: getId
	// Returns the last created DOM element ID string
	getId = c.getId = function() {
		if (events["getid"]) return call("getid", obj_num);
		if (randomize_ids) {
			return idprefix + nonce +'_' + obj_num;
		} else {
			return idprefix + obj_num;
		}
	};
	
	// Function: getNextId
	// Creates and returns a unique ID string for a DOM element
	getNextId = c.getNextId = function() {
		// ensure the ID does not exist
		var id = getId();
		
		while (getElem(id)) {
			obj_num++;
			id = getId();
		}
		return id;
	};
	
	// Run the callback function associated with the given event
	//
	// Parameters:
	// event - String with the event name
	// arg - Argument to pass through to the callback function
	call = c.call = function(event, arg) {
		if (events[event]) {
			return events[event](this,arg);
		}
	};
	
	// Function: bind
	// Attaches a callback function to an event
	//
	// Parameters:
	// event - String indicating the name of the event
	// f - The callback function to bind to the event
	// 
	// Return:
	// The previous event
	c.bind = function(event, f) {
	  var old = events[event];
		events[event] = f;
		return old;
	};
	
	// Function: setIdPrefix
	// Changes the ID prefix to the given value
	//
	// Parameters: 
	// p - String with the new prefix 
	c.setIdPrefix = function(p) {
		idprefix = p;
	};
}(canvas));


// Function: sanitizeSvg
// Sanitizes the input node and its children
// It only keeps what is allowed from our whitelist defined above
//
// Parameters:
// node - The DOM element to be checked, will also check its children
var sanitizeSvg = this.sanitizeSvg = function(node) {
	// we only care about element nodes
	// automatically return for all comment, etc nodes
	// for text, we do a whitespace trim
	if (node.nodeType == 3) {
		node.nodeValue = node.nodeValue.replace(/^\s+|\s+$/g, "");
		// Remove empty text nodes
		if(!node.nodeValue.length) node.parentNode.removeChild(node);
	}
	if (node.nodeType != 1) return;
	var doc = node.ownerDocument;
	var parent = node.parentNode;
	// can parent ever be null here?  I think the root node's parent is the document...
	if (!doc || !parent) return;
	
	var allowedAttrs = svgWhiteList[node.nodeName];
	var allowedAttrsNS = svgWhiteListNS[node.nodeName];

	// if this element is allowed
	if (allowedAttrs != undefined) {

		var se_attrs = [];
	
		var i = node.attributes.length;
		while (i--) {
			// if the attribute is not in our whitelist, then remove it
			// could use jQuery's inArray(), but I don't know if that's any better
			var attr = node.attributes.item(i);
			var attrName = attr.nodeName;
			var attrLocalName = attr.localName;
			var attrNsURI = attr.namespaceURI;
			// Check that an attribute with the correct localName in the correct namespace is on 
			// our whitelist or is a namespace declaration for one of our allowed namespaces
			if (!(allowedAttrsNS.hasOwnProperty(attrLocalName) && attrNsURI == allowedAttrsNS[attrLocalName] && attrNsURI != xmlnsns) &&
				!(attrNsURI == xmlnsns && nsMap[attr.nodeValue]) ) 
			{
				// Bypassing the whitelist to allow se: prefixes. Is there
				// a more appropriate way to do this?
				if(attrName.indexOf('se:') == 0) {
					se_attrs.push([attrName, attr.nodeValue]);
				} 
				node.removeAttributeNS(attrNsURI, attrLocalName);
			}
			// special handling for path d attribute
			if (node.nodeName == 'path' && attrName == 'd') {
				// Convert to absolute
				node.setAttribute('d',pathActions.convertPath(node));
				pathActions.fixEnd(node);
			}
			// for the style attribute, rewrite it in terms of XML presentational attributes
			if (attrName == "style") {
				var props = attr.nodeValue.split(";"),
					p = props.length;
				while(p--) {
					var nv = props[p].split(":");
					// now check that this attribute is supported
					if (allowedAttrs.indexOf(nv[0]) != -1) {
						node.setAttribute(nv[0],nv[1]);
					}
				}
				node.removeAttribute('style');
			}
		}
		
		$.each(se_attrs, function(i, attr) {
			node.setAttributeNS(se_ns, attr[0], attr[1]);
		});
		
		// for some elements that have a xlink:href, ensure the URI refers to a local element
		// (but not for links)
		var href = getHref(node);
		if(href && 
		   $.inArray(node.nodeName, ["filter", "linearGradient", "pattern", 
									 "radialGradient", "textPath", "use"]) != -1)
		{
			// TODO: we simply check if the first character is a #, is this bullet-proof?
			if (href[0] != "#") {
				// remove the attribute (but keep the element)
				setHref(node, "");
				node.removeAttributeNS(xlinkns, "href");
			}
		}
		
		// Safari crashes on a <use> without a xlink:href, so we just remove the node here
		if (node.nodeName == "use" && !getHref(node)) {
			parent.removeChild(node);
			return;
		}
		// if the element has attributes pointing to a non-local reference, 
		// need to remove the attribute
		$.each(["clip-path", "fill", "filter", "marker-end", "marker-mid", "marker-start", "mask", "stroke"],function(i,attr) {
			var val = node.getAttribute(attr);
			if (val) {
				val = getUrlFromAttr(val);
				// simply check for first character being a '#'
				if (val && val[0] != "#") {
					node.setAttribute(attr, "");
					node.removeAttribute(attr);
				}
			}
		});
		
		// recurse to children
		i = node.childNodes.length;
		while (i--) { sanitizeSvg(node.childNodes.item(i)); }
	}
	// else, remove this element
	else {
		// remove all children from this node and insert them before this node
		// FIXME: in the case of animation elements this will hardly ever be correct
		var children = [];
		while (node.hasChildNodes()) {
			children.push(parent.insertBefore(node.firstChild, node));
		}

		// remove this node from the document altogether
		parent.removeChild(node);

		// call sanitizeSvg on each of those children
		var i = children.length;
		while (i--) { sanitizeSvg(children[i]); }

	}
};

// Function: getUrlFromAttr
// Extracts the URL from the url(...) syntax of some attributes.  
// Three variants:
// 	* <circle fill="url(someFile.svg#foo)" />
//  * <circle fill="url('someFile.svg#foo')" />
//  * <circle fill='url("someFile.svg#foo")' />
//
// Parameters:
// attrVal - The attribute value as a string
// 
// Returns:
// String with just the URL, like someFile.svg#foo
var getUrlFromAttr = this.getUrlFromAttr = function(attrVal) {
	if (attrVal) {		
		// url("#somegrad")
		if (attrVal.indexOf('url("') == 0) {
			return attrVal.substring(5,attrVal.indexOf('"',6));
		}
		// url('#somegrad')
		else if (attrVal.indexOf("url('") == 0) {
			return attrVal.substring(5,attrVal.indexOf("'",6));
		}
		else if (attrVal.indexOf("url(") == 0) {
			return attrVal.substring(4,attrVal.indexOf(')'));
		}
	}
	return null;
};

// Function: getBBox
// Get the given/selected element's bounding box object, convert it to be more
// usable when necessary
//
// Parameters:
// elem - Optional DOM element to get the BBox for
var getBBox = this.getBBox = function(elem) {
	var selected = elem || selectedElements[0];
	if (elem.nodeType != 1) return null;
	var ret = null;
	if(elem.nodeName == 'text' && selected.textContent == '') {
		selected.textContent = 'a'; // Some character needed for the selector to use.
		ret = selected.getBBox();
		selected.textContent = '';
	} else if(elem.nodeName == 'path' && isWebkit) {
		ret = getPathBBox(selected);
	} else if(elem.nodeName == 'use' && !isWebkit) {
		ret = selected.getBBox();
		ret.x += parseFloat(selected.getAttribute('x')||0);
		ret.y += parseFloat(selected.getAttribute('y')||0);
	} else if(elem.nodeName == 'foreignObject') {
		ret = selected.getBBox();
		ret.x += parseFloat(selected.getAttribute('x')||0);
		ret.y += parseFloat(selected.getAttribute('y')||0);
	} else {
		try { ret = selected.getBBox(); } 
		catch(e) { 
			// Check if element is child of a foreignObject
			var fo = $(selected).closest("foreignObject");
			if(fo.length) {
				try {
					ret = fo[0].getBBox();						
				} catch(e) {
					ret = null;
				}
			} else {
				ret = null;
			}
		}
	}

	// get the bounding box from the DOM (which is in that element's coordinate system)
	return ret;
};


// Function: ffClone
// Hack for Firefox bugs where text element features aren't updated.
// This function clones the element and re-selects it 
// TODO: Test for this bug on load and add it to "support" object instead of 
// browser sniffing
//
// Parameters: 
// elem - The (text) DOM element to clone
var ffClone = function(elem) {
	if(navigator.userAgent.indexOf('Gecko/') == -1) return elem;
	var clone = elem.cloneNode(true)
	elem.parentNode.insertBefore(clone, elem);
	elem.parentNode.removeChild(elem);
	selectorManager.releaseSelector(elem);
	selectedElements[0] = clone;
	selectorManager.requestSelector(clone).showGrips(true);
	return clone;
}

// Function: getPathBBox
// Get correct BBox for a path in Webkit
// Converted from code found here:
// http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
// 
// Parameters:
// path - The path DOM element to get the BBox for
//
// Returns:
// A BBox-like object
var getPathBBox = function(path) {
	var seglist = path.pathSegList;
	var tot = seglist.numberOfItems;
	
	var bounds = [[], []];
	var start = seglist.getItem(0);
	var P0 = [start.x, start.y];
	
	for(var i=0; i < tot; i++) {
		var seg = seglist.getItem(i);
		if(!seg.x) continue;
		
		// Add actual points to limits
		bounds[0].push(P0[0]);
		bounds[1].push(P0[1]);
		
		if(seg.x1) {
			var P1 = [seg.x1, seg.y1],
				P2 = [seg.x2, seg.y2],
				P3 = [seg.x, seg.y];

			for(var j=0; j < 2; j++) {

				var calc = function(t) {
					return Math.pow(1-t,3) * P0[j] 
						+ 3 * Math.pow(1-t,2) * t * P1[j]
						+ 3 * (1-t) * Math.pow(t,2) * P2[j]
						+ Math.pow(t,3) * P3[j];
				};

				var b = 6 * P0[j] - 12 * P1[j] + 6 * P2[j];
				var a = -3 * P0[j] + 9 * P1[j] - 9 * P2[j] + 3 * P3[j];
				var c = 3 * P1[j] - 3 * P0[j];
				
				if(a == 0) {
					if(b == 0) {
						continue;
					}
					var t = -c / b;
					if(0 < t && t < 1) {
						bounds[j].push(calc(t));
					}
					continue;
				}
				
				var b2ac = Math.pow(b,2) - 4 * c * a;
				if(b2ac < 0) continue;
				var t1 = (-b + Math.sqrt(b2ac))/(2 * a);
				if(0 < t1 && t1 < 1) bounds[j].push(calc(t1));
				var t2 = (-b - Math.sqrt(b2ac))/(2 * a);
				if(0 < t2 && t2 < 1) bounds[j].push(calc(t2));
			}
			P0 = P3;
		} else {
			bounds[0].push(seg.x);
			bounds[1].push(seg.y);
		}
	}
	
	var x = Math.min.apply(null, bounds[0]);
	var w = Math.max.apply(null, bounds[0]) - x;
	var y = Math.min.apply(null, bounds[1]);
	var h = Math.max.apply(null, bounds[1]) - y;
	return {
		'x': x,
		'y': y,
		'width': w,
		'height': h
	};
}

// this.each is deprecated, if any extension used this it can be recreated by doing this:
// $(canvas.getRootElem()).children().each(...)

// this.each = function(cb) {
// 	$(svgroot).children().each(cb);
// };


// Group: Element Transforms

// Function: getRotationAngle
// Get the rotation angle of the given/selected DOM element
//
// Parameters:
// elem - Optional DOM element to get the angle for
// to_rad - Boolean that when true returns the value in radians rather than degrees
//
// Returns:
// Float with the angle in degrees or radians
var getRotationAngle = this.getRotationAngle = function(elem, to_rad) {
	var selected = elem || selectedElements[0];
	// find the rotation transform (if any) and set it
	var tlist = getTransformList(selected);
	if(!tlist) return 0; // <svg> elements have no tlist
	var N = tlist.numberOfItems;
	for (var i = 0; i < N; ++i) {
		var xform = tlist.getItem(i);
		if (xform.type == 4) {
			return to_rad ? xform.angle * Math.PI / 180.0 : xform.angle;
		}
	}
	return 0.0;
};

// Function: setRotationAngle
// Removes any old rotations if present, prepends a new rotation at the
// transformed center
//
// Parameters:
// val - The new rotation angle in degrees
// preventUndo - Boolean indicating whether the action should be undoable or not
this.setRotationAngle = function(val, preventUndo) {
	// ensure val is the proper type
	val = parseFloat(val);
	var elem = selectedElements[0];
	var oldTransform = elem.getAttribute("transform");
	var bbox = getBBox(elem);
	var cx = bbox.x+bbox.width/2, cy = bbox.y+bbox.height/2;
	var tlist = getTransformList(elem);
	
	// only remove the real rotational transform if present (i.e. at index=0)
	if (tlist.numberOfItems > 0) {
		var xform = tlist.getItem(0);
		if (xform.type == 4) {
			tlist.removeItem(0);
		}
	}
	// find R_nc and insert it
	if (val != 0) {
		var center = transformPoint(cx,cy,transformListToTransform(tlist).matrix);
		var R_nc = svgroot.createSVGTransform();
		R_nc.setRotate(val, center.x, center.y);
		if(tlist.numberOfItems) {
			tlist.insertItemBefore(R_nc, 0);
		} else {
			tlist.appendItem(R_nc);
		}
	}
	else if (tlist.numberOfItems == 0) {
		elem.removeAttribute("transform");
	}
	
	if (!preventUndo) {
		// we need to undo it, then redo it so it can be undo-able! :)
		// TODO: figure out how to make changes to transform list undo-able cross-browser?
		var newTransform = elem.getAttribute("transform");
		elem.setAttribute("transform", oldTransform);
		changeSelectedAttribute("transform",newTransform,selectedElements);
	}
	var pointGripContainer = getElem("pathpointgrip_container");
// 		if(elem.nodeName == "path" && pointGripContainer) {
// 			pathActions.setPointContainerTransform(elem.getAttribute("transform"));
// 		}
	var selector = selectorManager.requestSelector(selectedElements[0]);
	selector.resize();
	selector.updateGripCursors(val);
};


// Function: getTransformList
// Returns an object that behaves like a SVGTransformList for the given DOM element
//
// Parameters:
// elem - DOM element to get a transformlist from
var getTransformList = this.getTransformList = function(elem) {
	if (isWebkit) {
		var id = elem.id;
		if(!id) {
			// Get unique ID for temporary element
			id = 'temp';
		}
		var t = svgTransformLists[id];
		if (!t || id == 'temp') {
			svgTransformLists[id] = new SVGEditTransformList(elem);
			svgTransformLists[id]._init();
			t = svgTransformLists[id];
		}
		return t;
	}
	else if (elem.transform) {
		return elem.transform.baseVal;
	}
	else if (elem.gradientTransform) {
		return elem.gradientTransform.baseVal;
	}
	return null;
};

// Function: recalculateAllSelectedDimensions
// Runs recalculateDimensions on the selected elements, 
// adding the changes to a single batch command
var recalculateAllSelectedDimensions = this.recalculateAllSelectedDimensions = function() {
	var text = (current_resize_mode == "none" ? "position" : "size");
	var batchCmd = new BatchCommand(text);

	var i = selectedElements.length;
	while(i--) {
		var elem = selectedElements[i];
// 			if(getRotationAngle(elem) && !hasMatrixTransform(getTransformList(elem))) continue;
		var cmd = recalculateDimensions(elem);
		if (cmd) {
			batchCmd.addSubCommand(cmd);
		}
	}

	if (!batchCmd.isEmpty()) {
		addCommandToHistory(batchCmd);
		call("changed", selectedElements);
	}
};

// this is how we map paths to our preferred relative segment types
var pathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a', 
					'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];
					
// Debug tool to easily see the current matrix in the browser's console
var logMatrix = function(m) {
	console.log([m.a,m.b,m.c,m.d,m.e,m.f]);
};

// Function: remapElement
// Applies coordinate changes to an element based on the given matrix
//
// Parameters:
// selected - DOM element to be changed
// changes - Object with changes to be remapped
// m - Matrix object to use for remapping coordinates
var remapElement = this.remapElement = function(selected,changes,m) {
	var remap = function(x,y) { return transformPoint(x,y,m); },
		scalew = function(w) { return m.a*w; },
		scaleh = function(h) { return m.d*h; },
		box = getBBox(selected);

	switch (selected.tagName)
	{
		case "line":
			var pt1 = remap(changes["x1"],changes["y1"]),
				pt2 = remap(changes["x2"],changes["y2"]);
			changes["x1"] = pt1.x;
			changes["y1"] = pt1.y;
			changes["x2"] = pt2.x;
			changes["y2"] = pt2.y;
			break;
		case "circle":
			var c = remap(changes["cx"],changes["cy"]);
			changes["cx"] = c.x;
			changes["cy"] = c.y;
			// take the minimum of the new selected box's dimensions for the new circle radius
			var tbox = transformBox(box.x, box.y, box.width, box.height, m);
			var w = tbox.tr.x - tbox.tl.x, h = tbox.bl.y - tbox.tl.y;
			changes["r"] = Math.min(w/2, h/2);
			break;
		case "ellipse":
			var c = remap(changes["cx"],changes["cy"]);
			changes["cx"] = c.x;
			changes["cy"] = c.y;
			changes["rx"] = scalew(changes["rx"]);
			changes["ry"] = scaleh(changes["ry"]);
			break;
		case "foreignObject":
		case "rect":
		case "image":
			var pt1 = remap(changes["x"],changes["y"]);
			changes["x"] = pt1.x;
			changes["y"] = pt1.y;
			changes["width"] = scalew(changes["width"]);
			changes["height"] = scaleh(changes["height"]);
			break;
		case "use":
// 			var pt1 = remap(changes["x"],changes["y"]);
// 			changes["x"] = pt1.x;
// 			changes["y"] = pt1.y;
// 			break;
		case "g":
		case "text":
			// if it was a translate, then just update x,y
			if (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && 
				(m.e != 0 || m.f != 0) ) 
			{
				// [T][M] = [M][T']
				// therefore [T'] = [M_inv][T][M]
				var existing = transformListToTransform(selected).matrix,
					t_new = matrixMultiply(existing.inverse(), m, existing);
				changes["x"] = parseFloat(changes["x"]) + t_new.e;
				changes["y"] = parseFloat(changes["y"]) + t_new.f;
			}
			else {
				// we just absorb all matrices into the element and don't do any remapping
				var chlist = getTransformList(selected);
				var mt = svgroot.createSVGTransform();
				mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix,m));
				chlist.clear();
				chlist.appendItem(mt);
			}
			break;
		case "polygon":
		case "polyline":
			var len = changes["points"].length;
			for (var i = 0; i < len; ++i) {
				var pt = changes["points"][i];
				pt = remap(pt.x,pt.y);
				changes["points"][i].x = pt.x;
				changes["points"][i].y = pt.y;
			}
			break;
		case "path":
			var segList = selected.pathSegList;
			var len = segList.numberOfItems;
			changes.d = new Array(len);
			for (var i = 0; i < len; ++i) {
				var seg = segList.getItem(i);
				changes.d[i] = {
					type: seg.pathSegType,
					x: seg.x,
					y: seg.y,
					x1: seg.x1,
					y1: seg.y1,
					x2: seg.x2,
					y2: seg.y2,
					r1: seg.r1,
					r2: seg.r2,
					angle: seg.angle,
					largeArcFlag: seg.largeArcFlag,
					sweepFlag: seg.sweepFlag
				};
			}
			
			var len = changes["d"].length,
				firstseg = changes["d"][0],
				currentpt = remap(firstseg.x,firstseg.y);
			changes["d"][0].x = currentpt.x;
			changes["d"][0].y = currentpt.y;
			for (var i = 1; i < len; ++i) {
				var seg = changes["d"][i];
				var type = seg.type;
				// if absolute or first segment, we want to remap x, y, x1, y1, x2, y2
				// if relative, we want to scalew, scaleh
				if (type % 2 == 0) { // absolute
					var thisx = (seg.x != undefined) ? seg.x : currentpt.x, // for V commands
						thisy = (seg.y != undefined) ? seg.y : currentpt.y, // for H commands
						pt = remap(thisx,thisy),
						pt1 = remap(seg.x1,seg.y1),
						pt2 = remap(seg.x2,seg.y2);
					seg.x = pt.x;
					seg.y = pt.y;
					seg.x1 = pt1.x;
					seg.y1 = pt1.y;
					seg.x2 = pt2.x;
					seg.y2 = pt2.y;
					seg.r1 = scalew(seg.r1),
					seg.r2 = scaleh(seg.r2);
				}
				else { // relative
					seg.x = scalew(seg.x);
					seg.y = scaleh(seg.y);
					seg.x1 = scalew(seg.x1);
					seg.y1 = scaleh(seg.y1);
					seg.x2 = scalew(seg.x2);
					seg.y2 = scaleh(seg.y2);
					seg.r1 = scalew(seg.r1),
					seg.r2 = scaleh(seg.r2);
				}
				// tracks the current position (for H,V commands)
				if (seg.x) currentpt.x = seg.x;
				if (seg.y) currentpt.y = seg.y;
			} // for each segment
			break;
	} // switch on element type to get initial values
	
	// now we have a set of changes and an applied reduced transform list
	// we apply the changes directly to the DOM
	// TODO: merge this switch with the above one and optimize
	switch (selected.tagName)
	{
		case "foreignObject":
		case "rect":
		case "image":
			changes.x = changes.x-0 + Math.min(0,changes.width);
			changes.y = changes.y-0 + Math.min(0,changes.height);
			changes.width = Math.abs(changes.width);
			changes.height = Math.abs(changes.height);
			if(svgEditor.curConfig.gridSnapping && selected.parentNode.parentNode.localName == "svg"){
				changes.x = Utils.snapToGrid(changes.x);
				changes.y = Utils.snapToGrid(changes.y);
				changes.width = Utils.snapToGrid(changes.width);
				changes.height = Utils.snapToGrid(changes.height);
			}
			assignAttributes(selected, changes, 1000, true);
			break;
		case "ellipse":
			changes.rx = Math.abs(changes.rx);
			changes.ry = Math.abs(changes.ry);
			if(svgEditor.curConfig.gridSnapping && selected.parentNode.parentNode.localName == "svg"){
				changes.cx = Utils.snapToGrid(changes.cx);
				changes.cy = Utils.snapToGrid(changes.cy);
				changes.rx = Utils.snapToGrid(changes.rx);
				changes.ry = Utils.snapToGrid(changes.ry);
			}
		case "circle":
			if(changes.r) changes.r = Math.abs(changes.r);
			if(svgEditor.curConfig.gridSnapping && selected.parentNode.parentNode.localName == "svg"){
				changes.cx = Utils.snapToGrid(changes.cx);
				changes.cy = Utils.snapToGrid(changes.cy);
				changes.r = Utils.snapToGrid(changes.r);
			}
		case "line":
			if(svgEditor.curConfig.gridSnapping && selected.parentNode.parentNode.localName == "svg"){
				changes.x1 = Utils.snapToGrid(changes.x1);
				changes.y1 = Utils.snapToGrid(changes.y1);
				changes.x2 = Utils.snapToGrid(changes.x2);
				changes.y2 = Utils.snapToGrid(changes.y2);
			}
		case "text":
			if(svgEditor.curConfig.gridSnapping && selected.parentNode.parentNode.localName == "svg"){
				changes.x = Utils.snapToGrid(changes.x);
				changes.y = Utils.snapToGrid(changes.y);
			}	
		case "use":
			assignAttributes(selected, changes, 1000, true);
			break;
		case "g":
			var gsvg = $(selected).data('gsvg');
			if(gsvg) {
				assignAttributes(gsvg, changes, 1000, true);
			}
			break;
		case "polyline":
		case "polygon":
			var len = changes["points"].length;
			var pstr = "";
			for (var i = 0; i < len; ++i) {
				var pt = changes["points"][i];
				pstr += pt.x + "," + pt.y + " ";
			}
			selected.setAttribute("points", pstr);
			break;
		case "path":
			var dstr = "";
			var len = changes["d"].length;
			for (var i = 0; i < len; ++i) {
				var seg = changes["d"][i];
				var type = seg.type;
				dstr += pathMap[type];
				switch(type) {
					case 13: // relative horizontal line (h)
					case 12: // absolute horizontal line (H)
						dstr += seg.x + " ";
						break;
					case 15: // relative vertical line (v)
					case 14: // absolute vertical line (V)
						dstr += seg.y + " ";
						break;
					case 3: // relative move (m)
					case 5: // relative line (l)
					case 19: // relative smooth quad (t)
					case 2: // absolute move (M)
					case 4: // absolute line (L)
					case 18: // absolute smooth quad (T)
						dstr += seg.x + "," + seg.y + " ";
						break;
					case 7: // relative cubic (c)
					case 6: // absolute cubic (C)
						dstr += seg.x1 + "," + seg.y1 + " " + seg.x2 + "," + seg.y2 + " " +
							 seg.x + "," + seg.y + " ";
						break;
					case 9: // relative quad (q) 
					case 8: // absolute quad (Q)
						dstr += seg.x1 + "," + seg.y1 + " " + seg.x + "," + seg.y + " ";
						break;
					case 11: // relative elliptical arc (a)
					case 10: // absolute elliptical arc (A)
						dstr += seg.r1 + "," + seg.r2 + " " + seg.angle + " " + Number(seg.largeArcFlag) +
							" " + Number(seg.sweepFlag) + " " + seg.x + "," + seg.y + " ";
						break;
					case 17: // relative smooth cubic (s)
					case 16: // absolute smooth cubic (S)
						dstr += seg.x2 + "," + seg.y2 + " " + seg.x + "," + seg.y + " ";
						break;
				}
			}
			selected.setAttribute("d", dstr);
			break;
	}
	
};

// Function: updateClipPath
// Updates a <clipPath>s values based on the given translation of an element
//
// Parameters:
// attr - The clip-path attribute value with the clipPath's ID
// tx - The translation's x value
// ty - The translation's y value
var updateClipPath = function(attr, tx, ty) {
	var id = getUrlFromAttr(attr).substr(1);
	var path = getElem(id).firstChild;
	
	var cp_xform = getTransformList(path);
	
	var newxlate = svgroot.createSVGTransform();
	newxlate.setTranslate(tx, ty);

	cp_xform.appendItem(newxlate);
	
	// Update clipPath's dimensions
	recalculateDimensions(path);
}

// Function: recalculateDimensions
// Decides the course of action based on the element's transform list
//
// Parameters:
// selected - The DOM element to recalculate
//
// Returns: 
// Undo command object with the resulting change
var recalculateDimensions = this.recalculateDimensions = function(selected) {
	if (selected == null) return null;
	
	var tlist = getTransformList(selected);
	
	// remove any unnecessary transforms
	if (tlist && tlist.numberOfItems > 0) {
		var k = tlist.numberOfItems;
		while (k--) {
			var xform = tlist.getItem(k);
			if (xform.type == 0) {
				tlist.removeItem(k);
			}
			// remove identity matrices
			else if (xform.type == 1) {
				if (isIdentity(xform.matrix)) {
					tlist.removeItem(k);
				}
			}
			// remove zero-degree rotations
			else if (xform.type == 4) {
				if (xform.angle == 0) {
					tlist.removeItem(k);
				}
			}
		}
		// End here if all it has is a rotation
		if(tlist.numberOfItems == 1 && getRotationAngle(selected)) return null;
	}
	
	// if this element had no transforms, we are done
	if (!tlist || tlist.numberOfItems == 0) {
		selected.removeAttribute("transform");
		return null;
	}
	
	// Grouped SVG element 
	var gsvg = $(selected).data('gsvg');
	
	// we know we have some transforms, so set up return variable		
	var batchCmd = new BatchCommand("Transform");
	
	// store initial values that will be affected by reducing the transform list
	var changes = {}, initial = null, attrs = [];
	switch (selected.tagName)
	{
		case "line":
			attrs = ["x1", "y1", "x2", "y2"];
			break;
		case "circle":
			attrs = ["cx", "cy", "r"];
			break;
		case "ellipse":
			attrs = ["cx", "cy", "rx", "ry"];
			break;
		case "foreignObject":
		case "rect":
		case "image":
			attrs = ["width", "height", "x", "y"];
			break;
		case "use":
		case "text":
			attrs = ["x", "y"];
			break;
		case "polygon":
		case "polyline":
			initial = {};
			initial["points"] = selected.getAttribute("points");
			var list = selected.points;
			var len = list.numberOfItems;
			changes["points"] = new Array(len);
			for (var i = 0; i < len; ++i) {
				var pt = list.getItem(i);
				changes["points"][i] = {x:pt.x,y:pt.y};
			}
			break;
		case "path":
			initial = {};
			initial["d"] = selected.getAttribute("d");
			changes["d"] = selected.getAttribute("d");
			break;
	} // switch on element type to get initial values
	
	if(attrs.length) {
		changes = $(selected).attr(attrs);
		$.each(changes, function(attr, val) {
			changes[attr] = convertToNum(attr, val);
		});
	} else if(gsvg) {
		// GSVG exception
		changes = {
			x: $(gsvg).attr('x') || 0,
			y: $(gsvg).attr('y') || 0
		};
	}
	
	// if we haven't created an initial array in polygon/polyline/path, then 
	// make a copy of initial values and include the transform
	if (initial == null) {
		initial = $.extend(true, {}, changes);
		$.each(initial, function(attr, val) {
			initial[attr] = convertToNum(attr, val);
		});
	}
	// save the start transform value too
	initial["transform"] = start_transform ? start_transform : "";
	
	// if it's a regular group, we have special processing to flatten transforms
	if ((selected.tagName == "g" && !gsvg) || selected.tagName == "a") {
		var box = getBBox(selected),
			oldcenter = {x: box.x+box.width/2, y: box.y+box.height/2},
			newcenter = transformPoint(box.x+box.width/2, box.y+box.height/2,
							transformListToTransform(tlist).matrix),
			m = svgroot.createSVGMatrix();
		
		
		// temporarily strip off the rotate and save the old center
		var gangle = getRotationAngle(selected);
		if (gangle) {
			var a = gangle * Math.PI / 180;
			if ( Math.abs(a) > (1.0e-10) ) {
				var s = Math.sin(a)/(1 - Math.cos(a));
			} else {
				// FIXME: This blows up if the angle is exactly 0!
				var s = 2/a;
			}
			for (var i = 0; i < tlist.numberOfItems; ++i) {
				var xform = tlist.getItem(i);
				if (xform.type == 4) {
					// extract old center through mystical arts
					var rm = xform.matrix;
					oldcenter.y = (s*rm.e + rm.f)/2;
					oldcenter.x = (rm.e - s*rm.f)/2;
					tlist.removeItem(i);
					break;
				}
			}
		}
		var tx = 0, ty = 0,
			operation = 0,
			N = tlist.numberOfItems;

		if(N) {
			var first_m = tlist.getItem(0).matrix;
		}

		// first, if it was a scale then the second-last transform will be it
		if (N >= 3 && tlist.getItem(N-2).type == 3 && 
			tlist.getItem(N-3).type == 2 && tlist.getItem(N-1).type == 2) 
		{
			operation = 3; // scale
		
			// if the children are unrotated, pass the scale down directly
			// otherwise pass the equivalent matrix() down directly
			var tm = tlist.getItem(N-3).matrix,
				sm = tlist.getItem(N-2).matrix,
				tmn = tlist.getItem(N-1).matrix;
		
			var children = selected.childNodes;
			var c = children.length;
			while (c--) {
				var child = children.item(c);
				tx = 0;
				ty = 0;
				if (child.nodeType == 1) {
					var childTlist = getTransformList(child);

					// some children might not have a transform (<metadata>, <defs>, etc)
					if (!childTlist) continue;

					var m = transformListToTransform(childTlist).matrix;

					// Convert a matrix to a scale if applicable
// 					if(hasMatrixTransform(childTlist) && childTlist.numberOfItems == 1) {
// 						if(m.b==0 && m.c==0 && m.e==0 && m.f==0) {
// 							childTlist.removeItem(0);
// 							var translateOrigin = svgroot.createSVGTransform(),
// 								scale = svgroot.createSVGTransform(),
// 								translateBack = svgroot.createSVGTransform();
// 							translateOrigin.setTranslate(0, 0);
// 							scale.setScale(m.a, m.d);
// 							translateBack.setTranslate(0, 0);
// 							childTlist.appendItem(translateBack);
// 							childTlist.appendItem(scale);
// 							childTlist.appendItem(translateOrigin);
// 						}
// 					}
				
					var angle = getRotationAngle(child);
					var old_start_transform = start_transform;
					var childxforms = [];
					start_transform = child.getAttribute("transform");
					if(angle || hasMatrixTransform(childTlist)) {
						var e2t = svgroot.createSVGTransform();
						e2t.setMatrix(matrixMultiply(tm, sm, tmn, m));
						childTlist.clear();
						childTlist.appendItem(e2t);
						childxforms.push(e2t);
					}
					// if not rotated or skewed, push the [T][S][-T] down to the child
					else {
						// update the transform list with translate,scale,translate
						
						// slide the [T][S][-T] from the front to the back
						// [T][S][-T][M] = [M][T2][S2][-T2]
						
						// (only bringing [-T] to the right of [M])
						// [T][S][-T][M] = [T][S][M][-T2]
						// [-T2] = [M_inv][-T][M]
						var t2n = matrixMultiply(m.inverse(), tmn, m);
						// [T2] is always negative translation of [-T2]
						var t2 = svgroot.createSVGMatrix();
						t2.e = -t2n.e;
						t2.f = -t2n.f;
						
						// [T][S][-T][M] = [M][T2][S2][-T2]
						// [S2] = [T2_inv][M_inv][T][S][-T][M][-T2_inv]
						var s2 = matrixMultiply(t2.inverse(), m.inverse(), tm, sm, tmn, m, t2n.inverse());

						var translateOrigin = svgroot.createSVGTransform(),
							scale = svgroot.createSVGTransform(),
							translateBack = svgroot.createSVGTransform();
						translateOrigin.setTranslate(t2n.e, t2n.f);
						scale.setScale(s2.a, s2.d);
						translateBack.setTranslate(t2.e, t2.f);
						childTlist.appendItem(translateBack);
						childTlist.appendItem(scale);
						childTlist.appendItem(translateOrigin);
						childxforms.push(translateBack);
						childxforms.push(scale);
						childxforms.push(translateOrigin);
						logMatrix(translateBack.matrix);
						logMatrix(scale.matrix);
					} // not rotated
					batchCmd.addSubCommand( recalculateDimensions(child) );
					// TODO: If any <use> have this group as a parent and are 
					// referencing this child, then we need to impose a reverse 
					// scale on it so that when it won't get double-translated
//						var uses = selected.getElementsByTagNameNS(svgns, "use");
//						var href = "#"+child.id;
//						var u = uses.length;
//						while (u--) {
//							var useElem = uses.item(u);
//							if(href == getHref(useElem)) {
//								var usexlate = svgroot.createSVGTransform();
//								usexlate.setTranslate(-tx,-ty);
//								getTransformList(useElem).insertItemBefore(usexlate,0);
//								batchCmd.addSubCommand( recalculateDimensions(useElem) );
//							}
//						}
					start_transform = old_start_transform;
				} // element
			} // for each child
			// Remove these transforms from group
			tlist.removeItem(N-1);
			tlist.removeItem(N-2);
			tlist.removeItem(N-3);
		}
		else if (N >= 3 && tlist.getItem(N-1).type == 1)
		{
			operation = 3; // scale
			m = transformListToTransform(tlist).matrix;
			var e2t = svgroot.createSVGTransform();
			e2t.setMatrix(m);
			tlist.clear();
			tlist.appendItem(e2t);
		}			
		// next, check if the first transform was a translate 
		// if we had [ T1 ] [ M ] we want to transform this into [ M ] [ T2 ]
		// therefore [ T2 ] = [ M_inv ] [ T1 ] [ M ]
		else if ( (N == 1 || (N > 1 && tlist.getItem(1).type != 3)) && 
			tlist.getItem(0).type == 2) 
		{
			operation = 2; // translate
			var T_M = transformListToTransform(tlist).matrix;
			tlist.removeItem(0);
			var M_inv = transformListToTransform(tlist).matrix.inverse();
			var M2 = matrixMultiply( M_inv, T_M );
			
			tx = M2.e;
			ty = M2.f;

			if (tx != 0 || ty != 0) {
				// we pass the translates down to the individual children
				var children = selected.childNodes;
				var c = children.length;
				
				var clipPaths_done = [];
				
				while (c--) {
					var child = children.item(c);
					if (child.nodeType == 1) {
					
						// Check if child has clip-path
						if(child.getAttribute('clip-path')) {
							// tx, ty
							var attr = child.getAttribute('clip-path');
							if($.inArray(attr, clipPaths_done) === -1) {
								updateClipPath(attr, tx, ty);
								clipPaths_done.push(attr);
							}							
						}

						var old_start_transform = start_transform;
						start_transform = child.getAttribute("transform");
						
						var childTlist = getTransformList(child);
						// some children might not have a transform (<metadata>, <defs>, etc)
						if (childTlist) {
							var newxlate = svgroot.createSVGTransform();
							newxlate.setTranslate(tx,ty);
							childTlist.insertItemBefore(newxlate, 0);
							batchCmd.addSubCommand( recalculateDimensions(child) );
							// If any <use> have this group as a parent and are 
							// referencing this child, then impose a reverse translate on it
							// so that when it won't get double-translated
							var uses = selected.getElementsByTagNameNS(svgns, "use");
							var href = "#"+child.id;
							var u = uses.length;
							while (u--) {
								var useElem = uses.item(u);
								if(href == getHref(useElem)) {
									var usexlate = svgroot.createSVGTransform();
									usexlate.setTranslate(-tx,-ty);
									getTransformList(useElem).insertItemBefore(usexlate,0);
									batchCmd.addSubCommand( recalculateDimensions(useElem) );
								}
							}
							start_transform = old_start_transform;
						}
					}
				}
				
				clipPaths_done = [];
				
				start_transform = old_start_transform;
			}
		}
		// else, a matrix imposition from a parent group
		// keep pushing it down to the children
		else if (N == 1 && tlist.getItem(0).type == 1 && !gangle) {
			operation = 1;
			var m = tlist.getItem(0).matrix,
				children = selected.childNodes,
				c = children.length;
			while (c--) {
				var child = children.item(c);
				if (child.nodeType == 1) {
					var old_start_transform = start_transform;
					start_transform = child.getAttribute("transform");
					var childTlist = getTransformList(child);
					
					if (!childTlist) continue;
					
					var em = matrixMultiply(m, transformListToTransform(childTlist).matrix);
					var e2m = svgroot.createSVGTransform();
					e2m.setMatrix(em);
					childTlist.clear();
					childTlist.appendItem(e2m,0);
					
					batchCmd.addSubCommand( recalculateDimensions(child) );
					start_transform = old_start_transform;
				}
			}
			tlist.clear();
		}
		// else it was just a rotate
		else {
			if (gangle) {
				var newRot = svgroot.createSVGTransform();
				newRot.setRotate(gangle,newcenter.x,newcenter.y);
				tlist.insertItemBefore(newRot, 0);
			}
			if (tlist.numberOfItems == 0) {
				selected.removeAttribute("transform");
			}
			return null;			
		}
		
		// if it was a translate, put back the rotate at the new center
		if (operation == 2) {
			if (gangle) {
				newcenter = {
					x: oldcenter.x + first_m.e,
					y: oldcenter.y + first_m.f
				};
			
				var newRot = svgroot.createSVGTransform();
				newRot.setRotate(gangle,newcenter.x,newcenter.y);
				tlist.insertItemBefore(newRot, 0);
			}
		}
		// if it was a resize
		else if (operation == 3) {
			var m = transformListToTransform(tlist).matrix;
			var roldt = svgroot.createSVGTransform();
			roldt.setRotate(gangle, oldcenter.x, oldcenter.y);
			var rold = roldt.matrix;
			var rnew = svgroot.createSVGTransform();
			rnew.setRotate(gangle, newcenter.x, newcenter.y);
			var rnew_inv = rnew.matrix.inverse(),
				m_inv = m.inverse(),
				extrat = matrixMultiply(m_inv, rnew_inv, rold, m);

			tx = extrat.e;
			ty = extrat.f;

			if (tx != 0 || ty != 0) {
				// now push this transform down to the children
				// we pass the translates down to the individual children
				var children = selected.childNodes;
				var c = children.length;
				while (c--) {
					var child = children.item(c);
					if (child.nodeType == 1) {
						var old_start_transform = start_transform;
						start_transform = child.getAttribute("transform");
						var childTlist = getTransformList(child);
						var newxlate = svgroot.createSVGTransform();
						newxlate.setTranslate(tx,ty);
						childTlist.insertItemBefore(newxlate, 0);
						batchCmd.addSubCommand( recalculateDimensions(child) );
						start_transform = old_start_transform;
					}
				}
			}
			
			if (gangle) {
				tlist.insertItemBefore(rnew, 0);
			}
		}
	}
	// else, it's a non-group
	else {

		// FIXME: box might be null for some elements (<metadata> etc), need to handle this
		var box = getBBox(selected);

		// Paths (and possbly other shapes) will have no BBox while still in <defs>,
		// but we still may need to recalculate them (see issue 595).
		// TODO: Figure out how to get BBox from these elements in case they
		// have a rotation transform
		
		if(!box && selected.tagName != 'path') return null;
		

		var m = svgroot.createSVGMatrix(),
			// temporarily strip off the rotate and save the old center
			angle = getRotationAngle(selected);
		if (angle) {
			var oldcenter = {x: box.x+box.width/2, y: box.y+box.height/2},
			newcenter = transformPoint(box.x+box.width/2, box.y+box.height/2,
							transformListToTransform(tlist).matrix);
		
			var a = angle * Math.PI / 180;
			if ( Math.abs(a) > (1.0e-10) ) {
				var s = Math.sin(a)/(1 - Math.cos(a));
			} else {
				// FIXME: This blows up if the angle is exactly 0!
				var s = 2/a;
			}
			for (var i = 0; i < tlist.numberOfItems; ++i) {
				var xform = tlist.getItem(i);
				if (xform.type == 4) {
					// extract old center through mystical arts
					var rm = xform.matrix;
					oldcenter.y = (s*rm.e + rm.f)/2;
					oldcenter.x = (rm.e - s*rm.f)/2;
					tlist.removeItem(i);
					break;
				}
			}
		}
		
		// 2 = translate, 3 = scale, 4 = rotate, 1 = matrix imposition
		var operation = 0;
		var N = tlist.numberOfItems;
		
		
		// Check if it has a gradient with userSpaceOnUse, in which case
		// adjust it by recalculating the matrix transform.
		// TODO: Make this work in Webkit using SVGEditTransformList
		if(!isWebkit) {
			var fill = selected.getAttribute('fill');
			if(fill && fill.indexOf('url(') === 0) {
				var grad = getElem(getUrlFromAttr(fill).substr(1));
				if(grad.getAttribute('gradientUnits') === 'userSpaceOnUse') {
					//Update the userSpaceOnUse element
					var grad = $(grad);
					m = transformListToTransform(tlist).matrix;
					var gtlist = getTransformList(grad[0]);
					var gmatrix = transformListToTransform(gtlist).matrix;
					m = matrixMultiply(m, gmatrix);
					var m_str = "matrix(" + [m.a,m.b,m.c,m.d,m.e,m.f].join(",") + ")";
					grad.attr('gradientTransform', m_str);
				}
			}
		}
		
		// first, if it was a scale of a non-skewed element, then the second-last  
		// transform will be the [S]
		// if we had [M][T][S][T] we want to extract the matrix equivalent of
		// [T][S][T] and push it down to the element
		if (N >= 3 && tlist.getItem(N-2).type == 3 && 
			tlist.getItem(N-3).type == 2 && tlist.getItem(N-1).type == 2) 
			
			// Removed this so a <use> with a given [T][S][T] would convert to a matrix. 
			// Is that bad?
			//  && selected.nodeName != "use"
		{
			operation = 3; // scale
			m = transformListToTransform(tlist,N-3,N-1).matrix;
			tlist.removeItem(N-1);
			tlist.removeItem(N-2);
			tlist.removeItem(N-3);
		} // if we had [T][S][-T][M], then this was a skewed element being resized
		// Thus, we simply combine it all into one matrix
		else if(N == 4 && tlist.getItem(N-1).type == 1) {
			operation = 3; // scale
			m = transformListToTransform(tlist).matrix;
			var e2t = svgroot.createSVGTransform();
			e2t.setMatrix(m);
			tlist.clear();
			tlist.appendItem(e2t);
			// reset the matrix so that the element is not re-mapped
			m = svgroot.createSVGMatrix();
		} // if we had [R][T][S][-T][M], then this was a rotated matrix-element  
		// if we had [T1][M] we want to transform this into [M][T2]
		// therefore [ T2 ] = [ M_inv ] [ T1 ] [ M ] and we can push [T2] 
		// down to the element
		else if ( (N == 1 || (N > 1 && tlist.getItem(1).type != 3)) && 
			tlist.getItem(0).type == 2) 
		{
			operation = 2; // translate
			var oldxlate = tlist.getItem(0).matrix,
				meq = transformListToTransform(tlist,1).matrix,
				meq_inv = meq.inverse();
			m = matrixMultiply( meq_inv, oldxlate, meq );
			tlist.removeItem(0);
		}
		// else if this child now has a matrix imposition (from a parent group)
		// we might be able to simplify
		else if (N == 1 && tlist.getItem(0).type == 1 && !angle) {
			// Remap all point-based elements
			m = transformListToTransform(tlist).matrix;
			switch (selected.tagName) {
				case 'line':
					changes = $(selected).attr(["x1","y1","x2","y2"]);
				case 'polyline':
				case 'polygon':
					changes.points = selected.getAttribute("points");
					if(changes.points) {
						var list = selected.points;
						var len = list.numberOfItems;
						changes.points = new Array(len);
						for (var i = 0; i < len; ++i) {
							var pt = list.getItem(i);
							changes.points[i] = {x:pt.x,y:pt.y};
						}
					}
				case 'path':
					changes.d = selected.getAttribute("d");
					operation = 1;
					tlist.clear();
					break;
				default:
					break;
			}
		}
		// if it was a rotation, put the rotate back and return without a command
		// (this function has zero work to do for a rotate())
		else {
			operation = 4; // rotation
			if (angle) {
				var newRot = svgroot.createSVGTransform();
				newRot.setRotate(angle,newcenter.x,newcenter.y);
				tlist.insertItemBefore(newRot, 0);
			}
			if (tlist.numberOfItems == 0) {
				selected.removeAttribute("transform");
			}
			return null;
		}
		
		// if it was a translate or resize, we need to remap the element and absorb the xform
		if (operation == 1 || operation == 2 || operation == 3) {
			remapElement(selected,changes,m);
		} // if we are remapping
		
		// if it was a translate, put back the rotate at the new center
		if (operation == 2) {
			if (angle) {
				if(!hasMatrixTransform(tlist)) {
					newcenter = {
						x: oldcenter.x + m.e,
						y: oldcenter.y + m.f
					};
				}
				var newRot = svgroot.createSVGTransform();
				newRot.setRotate(angle, newcenter.x, newcenter.y);
				tlist.insertItemBefore(newRot, 0);
			}
		}
		// [Rold][M][T][S][-T] became [Rold][M]
		// we want it to be [Rnew][M][Tr] where Tr is the
		// translation required to re-center it
		// Therefore, [Tr] = [M_inv][Rnew_inv][Rold][M]
		else if (operation == 3 && angle) {
			var m = transformListToTransform(tlist).matrix;
			var roldt = svgroot.createSVGTransform();
			roldt.setRotate(angle, oldcenter.x, oldcenter.y);
			var rold = roldt.matrix;
			var rnew = svgroot.createSVGTransform();
			rnew.setRotate(angle, newcenter.x, newcenter.y);
			var rnew_inv = rnew.matrix.inverse();
			var m_inv = m.inverse();
			var extrat = matrixMultiply(m_inv, rnew_inv, rold, m);
		
			remapElement(selected,changes,extrat);
			if (angle) {
				tlist.insertItemBefore(rnew,0);
			}
		}
	} // a non-group

	// if the transform list has been emptied, remove it
	if (tlist.numberOfItems == 0) {
		selected.removeAttribute("transform");
	}
	batchCmd.addSubCommand(new ChangeElementCommand(selected, initial));
	
	return batchCmd;
};

// Root Current Transformation Matrix in user units
var root_sctm = null;

// Function: transformPoint
// A (hopefully) quicker function to transform a point by a matrix
// (this function avoids any DOM calls and just does the math)
// 
// Parameters:
// x - Float representing the x coordinate
// y - Float representing the y coordinate
// m - Matrix object to transform the point with
// Returns a x,y object representing the transformed point
var transformPoint = function(x, y, m) {
	return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
};

// Function: isIdentity
// Helper function to check if the matrix performs no actual transform 
// (i.e. exists for identity purposes)
//
// Parameters: 
// m - The matrix object to check
//
// Returns:
// Boolean indicating whether or not the matrix is 1,0,0,1,0,0
var isIdentity = function(m) {
	return (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && m.e == 0 && m.f == 0);
}

// matrixMultiply() is provided because WebKit didn't implement multiply() correctly
// on the SVGMatrix interface.  See https://bugs.webkit.org/show_bug.cgi?id=16062

// Function: matrixMultiply
// This function tries to return a SVGMatrix that is the multiplication m1*m2.
// We also round to zero when it's near zero
// 
// Parameters:
// >= 2 Matrix objects to multiply
//
// Returns: 
// The matrix object resulting from the calculation
var matrixMultiply = this.matrixMultiply = function() {
	var NEAR_ZERO = 1e-14,
		multi2 = function(m1, m2) {
			var m = svgroot.createSVGMatrix();
			m.a = m1.a*m2.a + m1.c*m2.b;
			m.b = m1.b*m2.a + m1.d*m2.b,
			m.c = m1.a*m2.c + m1.c*m2.d,
			m.d = m1.b*m2.c + m1.d*m2.d,
			m.e = m1.a*m2.e + m1.c*m2.f + m1.e,
			m.f = m1.b*m2.e + m1.d*m2.f + m1.f;
			return m;
		},
		args = arguments, i = args.length, m = args[i-1];
	
	while(i-- > 1) {
		var m1 = args[i-1];
		m = multi2(m1, m);
	}
	if (Math.abs(m.a) < NEAR_ZERO) m.a = 0;
	if (Math.abs(m.b) < NEAR_ZERO) m.b = 0;
	if (Math.abs(m.c) < NEAR_ZERO) m.c = 0;
	if (Math.abs(m.d) < NEAR_ZERO) m.d = 0;
	if (Math.abs(m.e) < NEAR_ZERO) m.e = 0;
	if (Math.abs(m.f) < NEAR_ZERO) m.f = 0;
	
	return m;
}

// Function: transformListToTransform
// This returns a single matrix Transform for a given Transform List
// (this is the equivalent of SVGTransformList.consolidate() but unlike
//  that method, this one does not modify the actual SVGTransformList)
// This function is very liberal with its min,max arguments
// 
// Parameters:
// tlist - The transformlist object
// min - Optional integer indicating start transform position
// max - Optional integer indicating end transform position
//
// Returns:
// A single matrix transform object
var transformListToTransform = this.transformListToTransform = function(tlist, min, max) {
	if(tlist == null) {
		// Or should tlist = null have been prevented before this?
		return svgroot.createSVGTransformFromMatrix(svgroot.createSVGMatrix());
	}
	var min = min == undefined ? 0 : min;
	var max = max == undefined ? (tlist.numberOfItems-1) : max;
	min = parseInt(min);
	max = parseInt(max);
	if (min > max) { var temp = max; max = min; min = temp; }
	var m = svgroot.createSVGMatrix();
	for (var i = min; i <= max; ++i) {
		// if our indices are out of range, just use a harmless identity matrix
		var mtom = (i >= 0 && i < tlist.numberOfItems ? 
						tlist.getItem(i).matrix :
						svgroot.createSVGMatrix());
		m = matrixMultiply(m, mtom);
	}
	return svgroot.createSVGTransformFromMatrix(m);
};

// Function: hasMatrixTransform
// See if the given transformlist includes a non-indentity matrix transform
//
// Parameters: 
// tlist - The transformlist to check
//
// Returns: 
// Boolean on whether or not a matrix transform was found
var hasMatrixTransform = this.hasMatrixTransform = function(tlist) {
	if(!tlist) return false;
	var num = tlist.numberOfItems;
	while (num--) {
		var xform = tlist.getItem(num);
		if (xform.type == 1 && !isIdentity(xform.matrix)) return true;
	}
	return false;
}

// Function: getMatrix
// Get the matrix object for a given element
//
// Parameters:
// elem - The DOM element to check
// 
// Returns:
// The matrix object associated with the element's transformlist
var getMatrix = function(elem) {
	var tlist = getTransformList(elem);
	return transformListToTransform(tlist).matrix;
}

// Function: transformBox
// Transforms a rectangle based on the given matrix
//
// Parameters:
// l - Float with the box's left coordinate
// t - Float with the box's top coordinate
// w - Float with the box width
// h - Float with the box height
// m - Matrix object to transform the box by
// 
// Returns:
// An object with the following values:
// * tl - The top left coordinate (x,y object)
// * tr - The top right coordinate (x,y object)
// * bl - The bottom left coordinate (x,y object)
// * br - The bottom right coordinate (x,y object)
// * aabox - Object with the following values:
// * Float with the axis-aligned x coordinate
// * Float with the axis-aligned y coordinate
// * Float with the axis-aligned width coordinate
// * Float with the axis-aligned height coordinate
var transformBox = this.transformBox = function(l, t, w, h, m) {
	var topleft = {x:l,y:t},
		topright = {x:(l+w),y:t},
		botright = {x:(l+w),y:(t+h)},
		botleft = {x:l,y:(t+h)};
	topleft = transformPoint( topleft.x, topleft.y, m );
	var minx = topleft.x,
		maxx = topleft.x,
		miny = topleft.y,
		maxy = topleft.y;
	topright = transformPoint( topright.x, topright.y, m );
	minx = Math.min(minx, topright.x);
	maxx = Math.max(maxx, topright.x);
	miny = Math.min(miny, topright.y);
	maxy = Math.max(maxy, topright.y);
	botleft = transformPoint( botleft.x, botleft.y, m);
	minx = Math.min(minx, botleft.x);
	maxx = Math.max(maxx, botleft.x);
	miny = Math.min(miny, botleft.y);
	maxy = Math.max(maxy, botleft.y);
	botright = transformPoint( botright.x, botright.y, m );
	minx = Math.min(minx, botright.x);
	maxx = Math.max(maxx, botright.x);
	miny = Math.min(miny, botright.y);
	maxy = Math.max(maxy, botright.y);

	return {tl:topleft, tr:topright, bl:botleft, br:botright, 
			aabox: {x:minx, y:miny, width:(maxx-minx), height:(maxy-miny)} };
};


// Group: Selection

// Function: clearSelection
// Clears the selection.  The 'selected' handler is then called.
// Parameters: 
// noCall - Optional boolean that when true does not call the "selected" handler
var clearSelection = this.clearSelection = function(noCall) {
	if (selectedElements[0] != null) {
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			var elem = selectedElements[i];
			if (elem == null) break;
			selectorManager.releaseSelector(elem);
			selectedElements[i] = null;
		}
		selectedBBoxes[0] = null;
	}
	if(!noCall) call("selected", selectedElements);
};

// TODO: do we need to worry about selectedBBoxes here?

// Function: addToSelection
// Adds a list of elements to the selection.  The 'selected' handler is then called.
//
// Parameters:
// elemsToAdd - an array of DOM elements to add to the selection
// showGrips - a boolean flag indicating whether the resize grips should be shown
var addToSelection = this.addToSelection = function(elemsToAdd, showGrips) {
	if (elemsToAdd.length == 0) { return; }
	// find the first null in our selectedElements array
	var j = 0;
	
	while (j < selectedElements.length) {
		if (selectedElements[j] == null) { 
			break;
		}
		++j;
	}

	// now add each element consecutively
	var i = elemsToAdd.length;
	while (i--) {
		var elem = elemsToAdd[i];
		if (!elem || !getBBox(elem)) continue;
		// if it's not already there, add it
		if (selectedElements.indexOf(elem) == -1) {
			selectedElements[j] = elem;
			// only the first selectedBBoxes element is ever used in the codebase these days
			if (j == 0) selectedBBoxes[j] = getBBox(elem);
			j++;
			var sel = selectorManager.requestSelector(elem);
	
			if (selectedElements.length > 1) {
				sel.showGrips(false);
			}
		}
	}
	if(selectedElements[0] && selectedElements.length === 1 && selectedElements[0].tagName == 'a') {
		// Make "a" element's child be the selected element 
		selectedElements[0] = selectedElements[0].firstChild;
	}
	
	call("selected", selectedElements);
	
	if (showGrips || selectedElements.length == 1) {
		selectorManager.requestSelector(selectedElements[0]).showGrips(true);
	}
	else {
		selectorManager.requestSelector(selectedElements[0]).showGrips(false);
	}

	// make sure the elements are in the correct order
	// See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

	selectedElements.sort(function(a,b) {
		if(a && b && a.compareDocumentPosition) {
			return 3 - (b.compareDocumentPosition(a) & 6);	
		} else if(a == null) {
			return 1;
		}
	});
	
	// Make sure first elements are not null
	while(selectedElements[0] == null) selectedElements.shift(0);
};

// TODO: could use slice here to make this faster?
// TODO: should the 'selected' handler

// Function: removeFromSelection
// Removes elements from the selection.
//
// Parameters:
// elemsToRemove - an array of elements to remove from selection
var removeFromSelection = this.removeFromSelection = function(elemsToRemove) {
	if (selectedElements[0] == null) { return; }
	if (elemsToRemove.length == 0) { return; }

	// find every element and remove it from our array copy
	var newSelectedItems = new Array(selectedElements.length),
		newSelectedBBoxes = new Array(selectedBBoxes.length),
		j = 0,
		len = selectedElements.length;
	for (var i = 0; i < len; ++i) {
		var elem = selectedElements[i];
		if (elem) {
			// keep the item
			if (elemsToRemove.indexOf(elem) == -1) {
				newSelectedItems[j] = elem;
				if (j==0) newSelectedBBoxes[j] = selectedBBoxes[i];
				j++;
			}
			else { // remove the item and its selector
				selectorManager.releaseSelector(elem);
			}
		}
	}
	// the copy becomes the master now
	selectedElements = newSelectedItems;
	selectedBBoxes = newSelectedBBoxes;
};

// Function: selectAllInCurrentLayer
// Clears the selection, then adds all elements in the current layer to the selection.
// This function then fires the selected event.
this.selectAllInCurrentLayer = function() {
	if (current_layer) {
		clearSelection();
		addToSelection($(current_layer).children());
		current_mode = "select";
		call("selected", selectedElements);			
	}
};

// Function: smoothControlPoints
// Takes three points and creates a smoother line based on them
// 
// Parameters: 
// ct1 - Object with x and y values (first control point)
// ct2 - Object with x and y values (second control point)
// pt - Object with x and y values (third point)
//
// Returns: 
// Array of two "smoothed" point objects
var smoothControlPoints = this.smoothControlPoints = function(ct1, ct2, pt) {
	// each point must not be the origin
	var x1 = ct1.x - pt.x,
		y1 = ct1.y - pt.y,
		x2 = ct2.x - pt.x,
		y2 = ct2.y - pt.y;
		
	if ( (x1 != 0 || y1 != 0) && (x2 != 0 || y2 != 0) ) {
		var anglea = Math.atan2(y1,x1),
			angleb = Math.atan2(y2,x2),
			r1 = Math.sqrt(x1*x1+y1*y1),
			r2 = Math.sqrt(x2*x2+y2*y2),
			nct1 = svgroot.createSVGPoint(),
			nct2 = svgroot.createSVGPoint();				
		if (anglea < 0) { anglea += 2*Math.PI; }
		if (angleb < 0) { angleb += 2*Math.PI; }
		
		var angleBetween = Math.abs(anglea - angleb),
			angleDiff = Math.abs(Math.PI - angleBetween)/2;
		
		var new_anglea, new_angleb;
		if (anglea - angleb > 0) {
			new_anglea = angleBetween < Math.PI ? (anglea + angleDiff) : (anglea - angleDiff);
			new_angleb = angleBetween < Math.PI ? (angleb - angleDiff) : (angleb + angleDiff);
		}
		else {
			new_anglea = angleBetween < Math.PI ? (anglea - angleDiff) : (anglea + angleDiff);
			new_angleb = angleBetween < Math.PI ? (angleb + angleDiff) : (angleb - angleDiff);
		}
		
		// rotate the points
		nct1.x = r1 * Math.cos(new_anglea) + pt.x;
		nct1.y = r1 * Math.sin(new_anglea) + pt.y;
		nct2.x = r2 * Math.cos(new_angleb) + pt.x;
		nct2.y = r2 * Math.sin(new_angleb) + pt.y;
		
		return [nct1, nct2];
	}
	return undefined;
};


// Function: getMouseTarget
// Gets the desired element from a mouse event
// 
// Parameters:
// evt - Event object from the mouse event
// 
// Returns:
// DOM element we want
var getMouseTarget = this.getMouseTarget = function(evt) {
	if (evt == null) {
		return null;
	}
	var mouse_target = evt.target;
	
	// if it was a <use>, Opera and WebKit return the SVGElementInstance
	if (mouse_target.correspondingUseElement)
	
	mouse_target = mouse_target.correspondingUseElement;
	// for foreign content, go up until we find the foreignObject
	// WebKit browsers set the mouse target to the svgcanvas div 
	if ($.inArray(mouse_target.namespaceURI, [mathns, htmlns]) != -1 && 
		mouse_target.id != "svgcanvas") 
	{
		while (mouse_target.nodeName != "foreignObject") {
			mouse_target = mouse_target.parentNode;
		}
	}
	
	// Get the desired mouse_target with jQuery selector-fu
	// If it's root-like, select the root
	if($.inArray(mouse_target, [svgroot, container, svgcontent, current_layer]) !== -1) {
		return svgroot;
	}
	
	var $target = $(mouse_target);

	// If it's a selection grip, return the grip parent
	if($target.closest('#selectorParentGroup').length) {
		// While we could instead have just returned mouse_target, 
		// this makes it easier to indentify as being a selector grip
		return selectorManager.selectorParentGroup;
	}

	while (mouse_target.parentNode !== current_layer) {
		mouse_target = mouse_target.parentNode;
	}
	
	return mouse_target;
	
	
// 	
// 	// go up until we hit a child of a layer
// 	while (mouse_target.parentNode.parentNode.tagName == 'g') {
// 		mouse_target = mouse_target.parentNode;
// 	}
	// Webkit bubbles the mouse event all the way up to the div, so we
	// set the mouse_target to the svgroot like the other browsers
// 	if (mouse_target.nodeName.toLowerCase() == "div") {
// 		mouse_target = svgroot;
// 	}
	
	return mouse_target;
};

// Mouse events
(function() {
	var off_x, off_y;
	
	var d_attr = null,
		start_x = null,
		start_y = null,
		init_bbox = {},
		freehand = {
			minx: null,
			miny: null,
			maxx: null,
			maxy: null
		};
	
	// - when we are in a create mode, the element is added to the canvas
	//   but the action is not recorded until mousing up
	// - when we are in select mode, select the element, remember the position
	//   and do nothing else
	var mouseDown = function(evt)
	{
		if(canvas.spaceKey) return;
		
		var right_click = evt.button === 2;
		
		root_sctm = svgcontent.getScreenCTM().inverse();
		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = pt.x * current_zoom,
			mouse_y = pt.y * current_zoom;
			
		if($.browser.msie) {
			var off = $(container.parentNode).offset();
			off_x = svgcontent.getAttribute('x')-0 + off.left - container.parentNode.scrollLeft;
			off_y = svgcontent.getAttribute('y')-0 + off.top - container.parentNode.scrollTop;
			mouse_x = -(off_x - evt.pageX);
			mouse_y = -(off_y - evt.pageY);
		}
			
		evt.preventDefault();

		if(right_click) {
			current_mode = "select";
			lastClickPoint = pt;
		}
		
		// This would seem to be unnecessary...
// 		if($.inArray(current_mode, ['select', 'resize']) == -1) {
// 			setGradient();
// 		}
		
		var x = mouse_x / current_zoom,
			y = mouse_y / current_zoom,
			mouse_target = getMouseTarget(evt);
		
		start_x = x;
		start_y = y;

		if(svgEditor.curConfig.gridSnapping){
			x = Utils.snapToGrid(x);
			y = Utils.snapToGrid(y);
		}

		// if it is a selector grip, then it must be a single element selected, 
		// set the mouse_target to that and update the mode to rotate/resize
		if (mouse_target == selectorManager.selectorParentGroup && selectedElements[0] != null) {
			var gripid = evt.target.id,
				griptype = gripid.substr(0,20);
			// rotating
			if (griptype == "selectorGrip_rotate_") {
				current_mode = "rotate";
			}
			// resizing
			else if(griptype == "selectorGrip_resize_") {
				current_mode = "resize";
				current_resize_mode = gripid.substr(20,gripid.indexOf("_",20)-20);
			}
			mouse_target = selectedElements[0];
		}
		
		start_transform = mouse_target.getAttribute("transform");
		var tlist = getTransformList(mouse_target);
		switch (current_mode) {
			case "select":
				started = true;
				current_resize_mode = "none";
				if(right_click) started = false;
				
				if (mouse_target != svgroot) {
					// if this element is not yet selected, clear selection and select it
					if (selectedElements.indexOf(mouse_target) == -1) {
						// only clear selection if shift is not pressed (otherwise, add 
						// element to selection)
						if (!evt.shiftKey) {
							// No need to do the call here as it will be done on addToSelection
							clearSelection(true);
						}
						addToSelection([mouse_target]);
						justSelected = mouse_target;
						pathActions.clear();
					}
					// else if it's a path, go into pathedit mode in mouseup
					
					if(!right_click) {
						// insert a dummy transform so if the element(s) are moved it will have
						// a transform to use for its translate
						for (var i = 0; i < selectedElements.length; ++i) {
							if(selectedElements[i] == null) continue;
							var slist = getTransformList(selectedElements[i]);
							slist.insertItemBefore(svgroot.createSVGTransform(), 0);
						}
					}
				}
				else if(!right_click){
					clearSelection();
					current_mode = "multiselect";
					if (rubberBox == null) {
						rubberBox = selectorManager.getRubberBandBox();
					}
					start_x *= current_zoom;
					start_y *= current_zoom;
// 					console.log('p',[evt.pageX, evt.pageY]);					
// 					console.log('c',[evt.clientX, evt.clientY]);	
// 					console.log('o',[evt.offsetX, evt.offsetY]);	
// 					console.log('s',[start_x, start_y]);
					
					assignAttributes(rubberBox, {
						'x': start_x,
						'y': start_y,
						'width': 0,
						'height': 0,
						'display': 'inline'
					}, 100);
				}
				break;
			case "zoom": 
				started = true;
				start_x = x;
				start_y = y;
				if (rubberBox == null) {
					rubberBox = selectorManager.getRubberBandBox();
				}
				assignAttributes(rubberBox, {
						'x': start_x * current_zoom,
						'y': start_y * current_zoom,
						'width': 0,
						'height': 0,
						'display': 'inline'
				}, 100);
				break;
			case "resize":
				started = true;
				start_x = x;
				start_y = y;
				
				// Getting the BBox from the selection box, since we know we
				// want to orient around it
				init_bbox = getBBox($('#selectedBox0')[0]);
				$.each(init_bbox, function(key, val) {
					init_bbox[key] = val/current_zoom;
				});
				
				// append three dummy transforms to the tlist so that
				// we can translate,scale,translate in mousemove
				var pos = getRotationAngle(mouse_target)?1:0;
				
				if(hasMatrixTransform(tlist)) {
					tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
					tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
					tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
				} else {
					tlist.appendItem(svgroot.createSVGTransform());
					tlist.appendItem(svgroot.createSVGTransform());
					tlist.appendItem(svgroot.createSVGTransform());
				}
				break;
			case "fhellipse":
			case "fhrect":
			case "fhpath":
				started = true;
				start_x = x;
				start_y = y;
				d_attr = x + "," + y + " ";
				var stroke_w = cur_shape.stroke_width == 0?1:cur_shape.stroke_width;
				addSvgElementFromJson({
					"element": "polyline",
					"curStyles": true,
					"attr": {
						"points": d_attr,
						"id": getNextId(),
						"fill": "none",
						"opacity": cur_shape.opacity / 2,
						"stroke-linecap": "round",
						"style": "pointer-events:none"
					}
				});
				freehand.minx = x;
				freehand.maxx = x;
				freehand.miny = y;
				freehand.maxy = y;
				break;
			case "image":
				started = true;
				start_x = x;
				start_y = y;
				var newImage = addSvgElementFromJson({
					"element": "image",
					"attr": {
						"x": x,
						"y": y,
						"width": 0,
						"height": 0,
						"id": getNextId(),
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:inherit"
					}
				});
				setHref(newImage, last_good_img_url);
				preventClickDefault(newImage);
				break;
			case "square":
				// FIXME: once we create the rect, we lose information that this was a square
				// (for resizing purposes this could be important)
			case "rect":
				started = true;
				start_x = x;
				start_y = y;
				addSvgElementFromJson({
					"element": "rect",
					"curStyles": true,
					"attr": {
						"x": x,
						"y": y,
						"width": 0,
						"height": 0,
						"id": getNextId(),
						"opacity": cur_shape.opacity / 2
					}
				});
				break;
			case "line":
				started = true;
				var stroke_w = cur_shape.stroke_width == 0?1:cur_shape.stroke_width;
				addSvgElementFromJson({
					"element": "line",
					"curStyles": true,
					"attr": {
						"x1": x,
						"y1": y,
						"x2": x,
						"y2": y,
						"id": getNextId(),
						"stroke": cur_shape.stroke,
						"stroke-width": stroke_w,
						"stroke-dasharray": cur_shape.stroke_dasharray,
						"stroke-linejoin": cur_shape.stroke_linejoin,
						"stroke-linecap": cur_shape.stroke_linecap,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill": "none",
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:none"
					}
				});
				break;
			case "circle":
				started = true;
				addSvgElementFromJson({
					"element": "circle",
					"curStyles": true,
					"attr": {
						"cx": x,
						"cy": y,
						"r": 0,
						"id": getNextId(),
						"opacity": cur_shape.opacity / 2
					}
				});
				break;
			case "ellipse":
				started = true;
				addSvgElementFromJson({
					"element": "ellipse",
					"curStyles": true,
					"attr": {
						"cx": x,
						"cy": y,
						"rx": 0,
						"ry": 0,
						"id": getNextId(),
						"opacity": cur_shape.opacity / 2
					}
				});
				break;
			case "text":
				started = true;
				var newText = addSvgElementFromJson({
					"element": "text",
					"curStyles": true,
					"attr": {
						"x": x,
						"y": y,
						"id": getNextId(),
						"fill": cur_text.fill,
						"stroke-width": cur_text.stroke_width,
						"font-size": cur_text.font_size,
						"font-family": cur_text.font_family,
						"text-anchor": "middle",
						"xml:space": "preserve"
					}
				});
// 					newText.textContent = "text";
				break;
			case "path":
				// Fall through
			case "pathedit":
				start_x *= current_zoom;
				start_y *= current_zoom;
				pathActions.mouseDown(evt, mouse_target, start_x, start_y);
				started = true;
				break;
			case "textedit":
				start_x *= current_zoom;
				start_y *= current_zoom;
				textActions.mouseDown(evt, mouse_target, start_x, start_y);
				started = true;
				break;
			case "rotate":
				started = true;
				// we are starting an undoable change (a drag-rotation)
				canvas.beginUndoableChange("transform", selectedElements);
				break;
			default:
				// This could occur in an extension
				break;
		}
		
		var ext_result = runExtensions("mouseDown", {
			event: evt,
			start_x: start_x,
			start_y: start_y,
			selectedElements: selectedElements
		}, true);
		
		$.each(ext_result, function(i, r) {
			if(r && r.started) {
				started = true;
			}
		});
	};
	
	// in this function we do not record any state changes yet (but we do update
	// any elements that are still being created, moved or resized on the canvas)
	// TODO: svgcanvas should just retain a reference to the image being dragged instead
	// of the getId() and getElementById() funkiness - this will help us customize the ids 
	// a little bit for squares and paths
	var mouseMove = function(evt)
	{
		if (!started) return;
		if(evt.button === 1 || canvas.spaceKey) return;
		var selected = selectedElements[0],
			pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = pt.x * current_zoom,
			mouse_y = pt.y * current_zoom,
			shape = getElem(getId());
	
		// IE9 gives the wrong root_sctm
		// TODO: Use non-browser sniffing way to make this work
		if($.browser.msie) {
			mouse_x = -(off_x - evt.pageX);
			mouse_y = -(off_y - evt.pageY);
		}

		x = mouse_x / current_zoom;
		y = mouse_y / current_zoom;
	
		if(svgEditor.curConfig.gridSnapping){
			x = Utils.snapToGrid(x);
			y = Utils.snapToGrid(y);
			start_x = Utils.snapToGrid(start_x);
			start_y = Utils.snapToGrid(start_y);
		}

		evt.preventDefault();
		
		switch (current_mode)
		{
			case "select":
				// we temporarily use a translate on the element(s) being dragged
				// this transform is removed upon mousing up and the element is 
				// relocated to the new location
				if (selectedElements[0] != null) {
					var dx = x - start_x;
					var dy = y - start_y;
					
					if(svgEditor.curConfig.gridSnapping){
						dx = Utils.snapToGrid(dx);
						dy = Utils.snapToGrid(dy);
					}

					if(evt.shiftKey) { var xya = Utils.snapToAngle(start_x,start_y,x,y); x=xya.x; y=xya.y; }

					if (dx != 0 || dy != 0) {
						var len = selectedElements.length;
						for (var i = 0; i < len; ++i) {
							var selected = selectedElements[i];
							if (selected == null) break;
							if (i==0) {
								var box = getBBox(selected);
// 									selectedBBoxes[i].x = box.x + dx;
// 									selectedBBoxes[i].y = box.y + dy;
							}

							// update the dummy transform in our transform list
							// to be a translate
							var xform = svgroot.createSVGTransform();
							var tlist = getTransformList(selected);
							// Note that if Webkit and there's no ID for this
							// element, the dummy transform may have gotten lost.
							// This results in unexpected behaviour
							
							xform.setTranslate(dx,dy);
							if(tlist.numberOfItems) {
								tlist.replaceItem(xform, 0);
							} else {
								tlist.appendItem(xform);
							}
							
							// update our internal bbox that we're tracking while dragging
							selectorManager.requestSelector(selected).resize();
						}
					}
				}
				break;
			case "multiselect":
				x *= current_zoom;
				y *= current_zoom;
				assignAttributes(rubberBox, {
					'x': Math.min(start_x,x),
					'y': Math.min(start_y,y),
					'width': Math.abs(x-start_x),
					'height': Math.abs(y-start_y)
				},100);

				// for each selected:
				// - if newList contains selected, do nothing
				// - if newList doesn't contain selected, remove it from selected
				// - for any newList that was not in selectedElements, add it to selected
				var elemsToRemove = [], elemsToAdd = [],
					newList = getIntersectionList(),
					len = selectedElements.length;
				for (var i = 0; i < len; ++i) {
					var ind = newList.indexOf(selectedElements[i]);
					if (ind == -1) {
						elemsToRemove.push(selectedElements[i]);
					}
					else {
						newList[ind] = null;
					}
				}
				
				len = newList.length;
				for (i = 0; i < len; ++i) { if (newList[i]) elemsToAdd.push(newList[i]); }
				
				if (elemsToRemove.length > 0) 
					canvas.removeFromSelection(elemsToRemove);
				
				if (elemsToAdd.length > 0) 
					addToSelection(elemsToAdd);
				break;
			case "resize":
				// we track the resize bounding box and translate/scale the selected element
				// while the mouse is down, when mouse goes up, we use this to recalculate
				// the shape's coordinates
				var tlist = getTransformList(selected),
					hasMatrix = hasMatrixTransform(tlist),
					box=hasMatrix?init_bbox:getBBox(selected), 
					left=box.x, top=box.y, width=box.width,
					height=box.height, dx=(x-start_x), dy=(y-start_y);
				
				if(svgEditor.curConfig.gridSnapping){
					dx = Utils.snapToGrid(dx);
					dy = Utils.snapToGrid(dy);
					height = Utils.snapToGrid(height);
					width = Utils.snapToGrid(width);
				}

				// if rotated, adjust the dx,dy values
				var angle = getRotationAngle(selected);
				if (angle) {
					var r = Math.sqrt( dx*dx + dy*dy ),
						theta = Math.atan2(dy,dx) - angle * Math.PI / 180.0;
					dx = r * Math.cos(theta);
					dy = r * Math.sin(theta);
				}

				// if not stretching in y direction, set dy to 0
				// if not stretching in x direction, set dx to 0
				if(current_resize_mode.indexOf("n")==-1 && current_resize_mode.indexOf("s")==-1) {
					dy = 0;
				}
				if(current_resize_mode.indexOf("e")==-1 && current_resize_mode.indexOf("w")==-1) {
					dx = 0;
				}				
				
				var ts = null,
					tx = 0, ty = 0,
					sy = height ? (height+dy)/height : 1, 
					sx = width ? (width+dx)/width : 1;
				// if we are dragging on the north side, then adjust the scale factor and ty
				if(current_resize_mode.indexOf("n") != -1) {
					sy = height ? (height-dy)/height : 1;
					ty = height;
				}
				
				// if we dragging on the east side, then adjust the scale factor and tx
				if(current_resize_mode.indexOf("w") != -1) {
					sx = width ? (width-dx)/width : 1;
					tx = width;
				}
				
				// update the transform list with translate,scale,translate
				var translateOrigin = svgroot.createSVGTransform(),
					scale = svgroot.createSVGTransform(),
					translateBack = svgroot.createSVGTransform();

				if(svgEditor.curConfig.gridSnapping){
					left = Utils.snapToGrid(left);
					tx = Utils.snapToGrid(tx);
					top = Utils.snapToGrid(top);
					ty = Utils.snapToGrid(ty);
				}

				translateOrigin.setTranslate(-(left+tx),-(top+ty));
				if(evt.shiftKey) {
					if(sx == 1) sx = sy
					else sy = sx;
				}
				scale.setScale(sx,sy);
				
				translateBack.setTranslate(left+tx,top+ty);
				if(hasMatrix) {
					var diff = angle?1:0;
					tlist.replaceItem(translateOrigin, 2+diff);
					tlist.replaceItem(scale, 1+diff);
					tlist.replaceItem(translateBack, 0+diff);
				} else {
					var N = tlist.numberOfItems;
					tlist.replaceItem(translateBack, N-3);
					tlist.replaceItem(scale, N-2);
					tlist.replaceItem(translateOrigin, N-1);
				}
				var selectedBBox = selectedBBoxes[0];				
				
				if(selectedBBox) {
					// reset selected bbox top-left position
					selectedBBox.x = left;
					selectedBBox.y = top;
					
					// if this is a translate, adjust the box position
					if (tx) {
						selectedBBox.x += dx;
					}
					if (ty) {
						selectedBBox.y += dy;
					}
				}
				selectorManager.requestSelector(selected).resize();
				break;
			case "zoom":
				x *= current_zoom;
				y *= current_zoom;
				assignAttributes(rubberBox, {
					'x': Math.min(start_x*current_zoom,x),
					'y': Math.min(start_y*current_zoom,y),
					'width': Math.abs(x-start_x*current_zoom),
					'height': Math.abs(y-start_y*current_zoom)
				},100);			
				break;
			case "text":
				assignAttributes(shape,{
					'x': x,
					'y': y
				},1000);
				break;
			case "line":
				// Opera has a problem with suspendRedraw() apparently
				var handle = null;
				if (!window.opera) svgroot.suspendRedraw(1000);

				if(svgEditor.curConfig.gridSnapping){
					x = Utils.snapToGrid(x);
					y = Utils.snapToGrid(y);
				}

				var x2 = x;
				var y2 = y;					

				if(evt.shiftKey) { var xya=Utils.snapToAngle(start_x,start_y,x2,y2); x2=xya.x; y2=xya.y; }
				
				shape.setAttributeNS(null, "x2", x2);
				shape.setAttributeNS(null, "y2", y2);
				if (!window.opera) svgroot.unsuspendRedraw(handle);
				break;
			case "foreignObject":
				// fall through
			case "square":
				// fall through
			case "rect":
				// fall through
			case "image":
				var square = (current_mode == 'square') || evt.shiftKey,
					w = Math.abs(x - start_x),
					h = Math.abs(y - start_y),
					new_x, new_y;
				if(square) {
					w = h = Math.max(w, h);
					new_x = start_x < x ? start_x : start_x - w;
					new_y = start_y < y ? start_y : start_y - h;
				} else {
					new_x = Math.min(start_x,x);
					new_y = Math.min(start_y,y);
				}
	
				if(svgEditor.curConfig.gridSnapping){
					w = Utils.snapToGrid(w);
					h = Utils.snapToGrid(h);
					new_x = Utils.snapToGrid(new_x);
					new_y = Utils.snapToGrid(new_y);
				}

				assignAttributes(shape,{
					'width': w,
					'height': h,
					'x': new_x,
					'y': new_y
				},1000);
				
				break;
			case "circle":
				var c = $(shape).attr(["cx", "cy"]);
				var cx = c.cx, cy = c.cy,
					rad = Math.sqrt( (x-cx)*(x-cx) + (y-cy)*(y-cy) );
				if(svgEditor.curConfig.gridSnapping){
					rad = Utils.snapToGrid(rad);
				}
				shape.setAttributeNS(null, "r", rad);
				break;
			case "ellipse":
				var c = $(shape).attr(["cx", "cy"]);
				var cx = c.cx, cy = c.cy;
				// Opera has a problem with suspendRedraw() apparently
					handle = null;
				if (!window.opera) svgroot.suspendRedraw(1000);
				if(svgEditor.curConfig.gridSnapping){
					x = Utils.snapToGrid(x);
					cx = Utils.snapToGrid(cx);
					y = Utils.snapToGrid(y);
					cy = Utils.snapToGrid(cy);
				}
				shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
				var ry = Math.abs(evt.shiftKey?(x - cx):(y - cy));
				shape.setAttributeNS(null, "ry", ry );
				if (!window.opera) svgroot.unsuspendRedraw(handle);
				break;
			case "fhellipse":
			case "fhrect":
				freehand.minx = Math.min(x, freehand.minx);
				freehand.maxx = Math.max(x, freehand.maxx);
				freehand.miny = Math.min(y, freehand.miny);
				freehand.maxy = Math.max(y, freehand.maxy);
			// break; missing on purpose
			case "fhpath":
				start_x = x;
				start_y = y;
				d_attr += + x + "," + y + " ";
				shape.setAttributeNS(null, "points", d_attr);
				break;
			// update path stretch line coordinates
			case "path":
				// fall through
			case "pathedit":
				x *= current_zoom;
				y *= current_zoom;
				
				if(svgEditor.curConfig.gridSnapping){
					x = Utils.snapToGrid(x);
					y = Utils.snapToGrid(y);
					start_x = Utils.snapToGrid(start_x);
					start_y = Utils.snapToGrid(start_y);
				}
				if(evt.shiftKey) {
					var x1 = path.dragging?path.dragging[0]:start_x;
					var y1 = path.dragging?path.dragging[1]:start_y;
					var xya=Utils.snapToAngle(x1,y1,x,y);
					x=xya.x; y=xya.y;
				}
				
				if(rubberBox && rubberBox.getAttribute('display') != 'none') {
					assignAttributes(rubberBox, {
						'x': Math.min(start_x,x),
						'y': Math.min(start_y,y),
						'width': Math.abs(x-start_x),
						'height': Math.abs(y-start_y)
					},100);
				}
				
				pathActions.mouseMove(x, y);
				
				break;
			case "textedit":
				x *= current_zoom;
				y *= current_zoom;
// 					if(rubberBox && rubberBox.getAttribute('display') != 'none') {
// 						assignAttributes(rubberBox, {
// 							'x': Math.min(start_x,x),
// 							'y': Math.min(start_y,y),
// 							'width': Math.abs(x-start_x),
// 							'height': Math.abs(y-start_y)
// 						},100);
// 					}
				
				textActions.mouseMove(mouse_x, mouse_y);
				
				break;
			case "rotate":
				var box = getBBox(selected),
					cx = box.x + box.width/2, 
					cy = box.y + box.height/2,
					m = getMatrix(selected),
					center = transformPoint(cx,cy,m);
				cx = center.x;
				cy = center.y;
				var angle = ((Math.atan2(cy-y,cx-x)  * (180/Math.PI))-90) % 360;
				if(svgEditor.curConfig.gridSnapping){
					angle = Utils.snapToGrid(angle);
				}
				if(evt.shiftKey) { // restrict rotations to nice angles (WRS)
					var snap = 45;
					angle= Math.round(angle/snap)*snap;
				}

				canvas.setRotationAngle(angle<-180?(360+angle):angle, true);
				call("changed", selectedElements);
				break;
			default:
				break;
		}
		
		runExtensions("mouseMove", {
			event: evt,
			mouse_x: mouse_x,
			mouse_y: mouse_y,
			selected: selected
		});

	}; // mouseMove()
	
	// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
	//   and store it on the Undo stack
	// - in move/resize mode, the element's attributes which were affected by the move/resize are
	//   identified, a ChangeElementCommand is created and stored on the stack for those attrs
	//   this is done in when we recalculate the selected dimensions()
	var mouseUp = function(evt)
	{
		if(evt.button === 2) return;
		var tempJustSelected = justSelected;
		justSelected = null;
		if (!started) return;
		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = pt.x * current_zoom,
			mouse_y = pt.y * current_zoom,
			x = mouse_x / current_zoom,
			y = mouse_y / current_zoom,
			element = getElem(getId()),
			keep = false;

		started = false;
		switch (current_mode)
		{
			// intentionally fall-through to select here
			case "resize":
			case "multiselect":
				if (rubberBox != null) {
					rubberBox.setAttribute("display", "none");
					curBBoxes = [];
				}
				current_mode = "select";
			case "select":
				if (selectedElements[0] != null) {
					// if we only have one selected element
					if (selectedElements[1] == null) {
						// set our current stroke/fill properties to the element's
						var selected = selectedElements[0];
						if (selected.tagName != "g" && selected.tagName != "image" && selected.tagName != "foreignObject") {
							cur_properties.fill = selected.getAttribute("fill");
							cur_properties.fill_opacity = selected.getAttribute("fill-opacity");
							cur_properties.stroke = selected.getAttribute("stroke");
							cur_properties.stroke_opacity = selected.getAttribute("stroke-opacity");
							cur_properties.stroke_width = selected.getAttribute("stroke-width");
							cur_properties.stroke_dasharray = selected.getAttribute("stroke-dasharray");
							cur_properties.stroke_linejoin = selected.getAttribute("stroke-linejoin");
							cur_properties.stroke_linecap = selected.getAttribute("stroke-linecap");
						}
						if (selected.tagName == "text") {
							cur_text.font_size = selected.getAttribute("font-size");
							cur_text.font_family = selected.getAttribute("font-family");
						}
						selectorManager.requestSelector(selected).showGrips(true);
						
						// This shouldn't be necessary as it was done on mouseDown...
// 							call("selected", [selected]);
					}
					// always recalculate dimensions to strip off stray identity transforms
					recalculateAllSelectedDimensions();
					// if it was being dragged/resized
					if (x != start_x || y != start_y) {
						var len = selectedElements.length;
						for	(var i = 0; i < len; ++i) {
							if (selectedElements[i] == null) break;
							if(selectedElements[i].tagName != 'g') {
								// Not needed for groups (incorrectly resizes elems), possibly not needed at all?
								selectorManager.requestSelector(selectedElements[i]).resize();
							}
						}
					}
					// no change in position/size, so maybe we should move to pathedit
					else {
						var t = evt.target;
						if (selectedElements[0].nodeName == "path" && selectedElements[1] == null) {
							pathActions.select(t);
						} // if it was a path
						else if (selectedElements[0].nodeName == "text" && selectedElements[1] == null) {
							textActions.select(t, x, y);
						} // if it was a path
						// else, if it was selected and this is a shift-click, remove it from selection
						else if (evt.shiftKey) {
							if(tempJustSelected != t) {
								canvas.removeFromSelection([t]);
							}
						}
					} // no change in mouse position
				}
				// we return immediately from select so that the obj_num is not incremented
				return;
				break;
			case "zoom":
				if (rubberBox != null) {
					rubberBox.setAttribute("display", "none");
				}
				var factor = evt.shiftKey?.5:2;
				call("zoomed", {
					'x': Math.min(start_x,x),
					'y': Math.min(start_y,y),
					'width': Math.abs(x-start_x),
					'height': Math.abs(y-start_y),
					'factor': factor
				});
				return;
			case "fhpath":
				// Check that the path contains at least 2 points; a degenerate one-point path
				// causes problems.
				// Webkit ignores how we set the points attribute with commas and uses space
				// to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
				var coords = element.getAttribute('points');
				var commaIndex = coords.indexOf(',');
				if (commaIndex >= 0) {
					keep = coords.indexOf(',', commaIndex+1) >= 0;
				} else {
					keep = coords.indexOf(' ', coords.indexOf(' ')+1) >= 0;
				}
				if (keep) {
					element = pathActions.smoothPolylineIntoPath(element);
				}
				break;
			case "line":
				var attrs = $(element).attr(["x1", "x2", "y1", "y2"]);
				keep = (attrs.x1 != attrs.x2 || attrs.y1 != attrs.y2);
				break;
			case "foreignObject":
			case "square":
			case "rect":
			case "image":
				var attrs = $(element).attr(["width", "height"]);
				// Image should be kept regardless of size (use inherit dimensions later)
				keep = (attrs.width != 0 || attrs.height != 0) || current_mode === "image";
				break;
			case "circle":
				keep = (element.getAttribute('r') != 0);
				break;
			case "ellipse":
				var attrs = $(element).attr(["rx", "ry"]);
				keep = (attrs.rx != null || attrs.ry != null);
				break;
			case "fhellipse":
				if ((freehand.maxx - freehand.minx) > 0 &&
					(freehand.maxy - freehand.miny) > 0) {
					element = addSvgElementFromJson({
						"element": "ellipse",
						"curStyles": true,
						"attr": {
							"cx": (freehand.minx + freehand.maxx) / 2,
							"cy": (freehand.miny + freehand.maxy) / 2,
							"rx": (freehand.maxx - freehand.minx) / 2,
							"ry": (freehand.maxy - freehand.miny) / 2,
							"id": getId()
						}
					});
					call("changed",[element]);
					keep = true;
				}
				break;
			case "fhrect":
				if ((freehand.maxx - freehand.minx) > 0 &&
					(freehand.maxy - freehand.miny) > 0) {
					element = addSvgElementFromJson({
						"element": "rect",
						"curStyles": true,
						"attr": {
							"x": freehand.minx,
							"y": freehand.miny,
							"width": (freehand.maxx - freehand.minx),
							"height": (freehand.maxy - freehand.miny),
							"id": getId()
						}
					});
					call("changed",[element]);
					keep = true;
				}
				break;
			case "text":
				keep = true;
				addToSelection([element]);
				textActions.start(element);
				break;
			case "path":
				// set element to null here so that it is not removed nor finalized
				element = null;
				// continue to be set to true so that mouseMove happens
				started = true;
				
				var res = pathActions.mouseUp(evt, element, mouse_x, mouse_y);
				element = res.element
				keep = res.keep;
				break;
			case "pathedit":
				keep = true;
				element = null;
				pathActions.mouseUp(evt);
				break;
			case "textedit":
				keep = false;
				element = null;
				textActions.mouseUp(evt, mouse_x, mouse_y);
				break;
			case "rotate":
				keep = true;
				element = null;
				current_mode = "select";
				var batchCmd = canvas.finishUndoableChange();
				if (!batchCmd.isEmpty()) { 
					addCommandToHistory(batchCmd);
				}
				// perform recalculation to weed out any stray identity transforms that might get stuck
				recalculateAllSelectedDimensions();
				call("changed", selectedElements);
				break;
			default:
				// This could occur in an extension
				break;
		}
		
		var ext_result = runExtensions("mouseUp", {
			event: evt,
			mouse_x: mouse_x,
			mouse_y: mouse_y
		}, true);
		
		$.each(ext_result, function(i, r) {
			if(r) {
				keep = r.keep || keep;
				element = r.element;
				started = r.started || started;
			}
		});
		
		if (!keep && element != null) {
			element.parentNode.removeChild(element);
			element = null;
			
			var t = evt.target;
			
			// if this element is in a group, go up until we reach the top-level group 
			// just below the layer groups
			// TODO: once we implement links, we also would have to check for <a> elements
			while (t.parentNode.parentNode.tagName == "g") {
				t = t.parentNode;
			}
			// if we are not in the middle of creating a path, and we've clicked on some shape, 
			// then go to Select mode.
			// WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
			if ( (current_mode != "path" || current_path_pts.length == 0) &&
				t.parentNode.id != "selectorParentGroup" &&
				t.id != "svgcanvas" && t.id != "svgroot") 
			{
				// switch into "select" mode if we've clicked on an element
				clearSelection(true);
				addToSelection([t], true);
				canvas.setMode("select");
			}
			
		} else if (element != null) {
			canvas.addedNew = true;
			var ani_dur = .2, c_ani;
			if(opac_ani.beginElement && element.getAttribute('opacity') != cur_shape.opacity) {
				c_ani = $(opac_ani).clone().attr({
					to: cur_shape.opacity,
					dur: ani_dur
				}).appendTo(element);
				try {
					// Fails in FF4 on foreignObject
					c_ani[0].beginElement();
				} catch(e){}
			} else {
				ani_dur = 0;
			}
			
			// Ideally this would be done on the endEvent of the animation,
			// but that doesn't seem to be supported in Webkit
			setTimeout(function() {
				if(c_ani) c_ani.remove();
				element.setAttribute("opacity", cur_shape.opacity);
				element.setAttribute("style", "pointer-events:inherit");
				cleanupElement(element);
				if(current_mode == "path") {
					pathActions.toEditMode(element);
				} else if (current_mode == "text" || current_mode == "image" || current_mode == "foreignObject") {
					// keep us in the tool we were in unless it was a text or image element
					addToSelection([element], true);
				} else {
					clearSelection(true);
					addToSelection([element], true);
				}
				// we create the insert command that is stored on the stack
				// undo means to call cmd.unapply(), redo means to call cmd.apply()
				addCommandToHistory(new InsertElementCommand(element));
				
				call("changed",[element]);
			}, ani_dur * 1000);
		}
		
		start_transform = null;
	};

	// prevent links from being followed in the canvas
	var handleLinkInCanvas = function(e) {
		e.preventDefault();
		return false;
	};
	
	$(container).mousedown(mouseDown).mousemove(mouseMove).click(handleLinkInCanvas);
	$(window).mouseup(mouseUp);
	
	$(container).bind("mousewheel DOMMouseScroll", function(e){
		if(!e.shiftKey) return;
		e.preventDefault();

		root_sctm = svgcontent.getScreenCTM().inverse();
		var pt = transformPoint( e.pageX, e.pageY, root_sctm );
		var bbox = {
			'x': pt.x,
			'y': pt.y,
			'width': 0,
			'height': 0
		};

		// Respond to mouse wheel in IE/Webkit/Opera.
		// (It returns up/dn motion in multiples of 120)
		if(e.wheelDelta) {
			if (e.wheelDelta >= 120) {
				bbox.factor = 2;
			} else if (e.wheelDelta <= -120) {
				bbox.factor = .5;
			}
		} else if(e.detail) {
			if (e.detail > 0) {
				bbox.factor = .5;
			} else if (e.detail < 0) {
				bbox.factor = 2;			
			}				
		}
		
		if(!bbox.factor) return;
		call("zoomed", bbox);
	});
	
}());

// Function: preventClickDefault
// Prevents default browser click behaviour on the given element
//
// Parameters:
// img - The DOM element to prevent the cilck on
var preventClickDefault = function(img) {
	$(img).click(function(e){e.preventDefault()});
}

// Group: Text edit functions
// Functions relating to editing text elements
var textActions = canvas.textActions = function() {
	var curtext, current_text;
	var textinput;
	var cursor;
	var selblock;
	var blinker;
	var chardata = [];
	var textbb, transbb;
	var matrix;
	var last_x, last_y;
	var allow_dbl;
	
	function setCursor(index) {
		var empty = (textinput.value === "");
		$(textinput).focus();
	
		if(!arguments.length) {
			if(empty) {
				index = 0;
			} else {
				if(textinput.selectionEnd !== textinput.selectionStart) return;
				index = textinput.selectionEnd;
			}
		}
		
		var charbb;
		charbb = chardata[index];
		if(!empty) {
			textinput.setSelectionRange(index, index);
		}
		cursor = getElem("text_cursor");
		if (!cursor) {
			cursor = document.createElementNS(svgns, "line");
			assignAttributes(cursor, {
				'id': "text_cursor",
				'stroke': "#333",
				'stroke-width': 1
			});
			cursor = getElem("selectorParentGroup").appendChild(cursor);
		}
		
		if(!blinker) {
			blinker = setInterval(function() {
				var show = (cursor.getAttribute('display') === 'none');
				cursor.setAttribute('display', show?'inline':'none');
			}, 600);

		}
		
		
		var start_pt = ptToScreen(charbb.x, textbb.y);
		var end_pt = ptToScreen(charbb.x, (textbb.y + textbb.height));
		
		assignAttributes(cursor, {
			x1: start_pt.x,
			y1: start_pt.y,
			x2: end_pt.x,
			y2: end_pt.y,
			visibility: 'visible',
			display: 'inline'
		});
		
		if(selblock) selblock.setAttribute('d', '');
	}
	
	function setSelection(start, end, skipInput) {
		if(start === end) {
			setCursor(end);
			return;
		}
	
		if(!skipInput) {
			textinput.setSelectionRange(start, end);
		}
		
		selblock = getElem("text_selectblock");
		if (!selblock) {

			selblock = document.createElementNS(svgns, "path");
			assignAttributes(selblock, {
				'id': "text_selectblock",
				'fill': "green",
				'opacity': .5,
				'style': "pointer-events:none"
			});
			getElem("selectorParentGroup").appendChild(selblock);
		}

		
		var startbb = chardata[start];
		
		var endbb = chardata[end];
		
		cursor.setAttribute('visibility', 'hidden');
		
		var tl = ptToScreen(startbb.x, textbb.y),
			tr = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y),
			bl = ptToScreen(startbb.x, textbb.y + textbb.height),
			br = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y + textbb.height);
		
		
		var dstr = "M" + tl.x + "," + tl.y
					+ " L" + tr.x + "," + tr.y
					+ " " + br.x + "," + br.y
					+ " " + bl.x + "," + bl.y + "z";
		
		assignAttributes(selblock, {
			d: dstr,
			'display': 'inline'
		});
	}
	
	function getIndexFromPoint(mouse_x, mouse_y) {
		// Position cursor here
		var pt = svgroot.createSVGPoint();
		pt.x = mouse_x;
		pt.y = mouse_y;

		// No content, so return 0
		if(chardata.length == 1) return 0;
		
		// Determine if cursor should be on left or right of character
		var charpos = curtext.getCharNumAtPosition(pt);
		if(charpos < 0) {
			// Out of text range, look at mouse coords
			charpos = chardata.length - 2;
			if(mouse_x <= chardata[0].x) {
				charpos = 0;
			}
		} else if(charpos >= chardata.length - 2) {
			charpos = chardata.length - 2;
		}
		var charbb = chardata[charpos];
		var mid = charbb.x + (charbb.width/2);
		if(mouse_x > mid) {
			charpos++;
		}
		return charpos;
	}
	
	function setCursorFromPoint(mouse_x, mouse_y) {
		setCursor(getIndexFromPoint(mouse_x, mouse_y));
	}
	
	function setEndSelectionFromPoint(x, y, apply) {
		var i1 = textinput.selectionStart;
		var i2 = getIndexFromPoint(x, y);
		
		var start = Math.min(i1, i2);
		var end = Math.max(i1, i2);
		setSelection(start, end, !apply);
	}
		
	function screenToPt(x_in, y_in) {
		var out = {
			x: x_in,
			y: y_in
		}
		
		out.x /= current_zoom;
		out.y /= current_zoom;			

		if(matrix) {
			var pt = transformPoint(out.x, out.y, matrix.inverse());
			out.x = pt.x;
			out.y = pt.y;
		}
		
		return out;
	}	
	
	function ptToScreen(x_in, y_in) {
		var out = {
			x: x_in,
			y: y_in
		}
		
		if(matrix) {
			var pt = transformPoint(out.x, out.y, matrix);
			out.x = pt.x;
			out.y = pt.y;
		}
		
		out.x *= current_zoom;
		out.y *= current_zoom;
		
		return out;
	}
	
	function hideCursor() {
		if(cursor) {
			cursor.setAttribute('visibility', 'hidden');
		}
	}
	
	function selectAll(evt) {
		setSelection(0, curtext.textContent.length);
		$(this).unbind(evt);
	}

	function selectWord(evt) {
		if(!allow_dbl) return;
	
		var ept = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = ept.x * current_zoom,
			mouse_y = ept.y * current_zoom;
		var pt = screenToPt(mouse_x, mouse_y);
		
		var index = getIndexFromPoint(pt.x, pt.y);
		var str = curtext.textContent;
		var first = str.substr(0, index).replace(/[a-z0-9]+$/i, '').length;
		var m = str.substr(index).match(/^[a-z0-9]+/i);
		var last = (m?m[0].length:0) + index;
		setSelection(first, last);
		
		// Set tripleclick
		$(evt.target).click(selectAll);
		setTimeout(function() {
			$(evt.target).unbind('click', selectAll);
		}, 300);
		
	}

	return {
		select: function(target, x, y) {
			if (current_text == target) {
				curtext = target;
				textActions.toEditMode(x, y);
			} // going into pathedit mode
			else {
				current_text = target;
			}	
		},
		start: function(elem) {
			curtext = elem;
			textActions.toEditMode();
		},
		mouseDown: function(evt, mouse_target, start_x, start_y) {
			var pt = screenToPt(start_x, start_y);
		
			textinput.focus();
			setCursorFromPoint(pt.x, pt.y);
			last_x = start_x;
			last_y = start_y;
			
			// TODO: Find way to block native selection
		},
		mouseMove: function(mouse_x, mouse_y) {
			var pt = screenToPt(mouse_x, mouse_y);
			setEndSelectionFromPoint(pt.x, pt.y);
		},			
		mouseUp: function(evt, mouse_x, mouse_y) {
			var pt = screenToPt(mouse_x, mouse_y);
			
			setEndSelectionFromPoint(pt.x, pt.y, true);
			
			// TODO: Find a way to make this work: Use transformed BBox instead of evt.target 
// 				if(last_x === mouse_x && last_y === mouse_y
// 					&& !Utils.rectsIntersect(transbb, {x: pt.x, y: pt.y, width:0, height:0})) {
// 					textActions.toSelectMode(true);				
// 				}
			if(last_x === mouse_x && last_y === mouse_y && evt.target !== curtext) {
				textActions.toSelectMode(true);
			}

		},
		setCursor: setCursor,
		toEditMode: function(x, y) {
			allow_dbl = false;
			current_mode = "textedit";
			selectorManager.requestSelector(curtext).showGrips(false);
			// Make selector group accept clicks
			var sel = selectorManager.requestSelector(curtext).selectorRect;
			
			textActions.init();
			$(curtext).css('cursor', 'text');
			
// 				if(support.editableText) {
// 					curtext.setAttribute('editable', 'simple');
// 					return;
// 				}
			
			if(!arguments.length) {
				setCursor();
			} else {
				var pt = screenToPt(x, y);
				setCursorFromPoint(pt.x, pt.y);
			}
			
			setTimeout(function() {
				allow_dbl = true;
			}, 300);
		},
		toSelectMode: function(selectElem) {
			current_mode = "select";
			clearInterval(blinker);
			blinker = null;
			if(selblock) $(selblock).attr('display','none');
			if(cursor) $(cursor).attr('visibility','hidden');
			$(curtext).css('cursor', 'move');
			
			if(selectElem) {
				clearSelection();
				$(curtext).css('cursor', 'move');
				
				call("selected", [curtext]);
				addToSelection([curtext], true);
			}
			if(curtext && !curtext.textContent.length) {
				// No content, so delete
				canvas.deleteSelectedElements();
			}
			
			$(textinput).blur();
			
			curtext = false;
			
// 				if(support.editableText) {
// 					curtext.removeAttribute('editable');
// 				}
		},
		setInputElem: function(elem) {
			textinput = elem;
// 			$(textinput).blur(hideCursor);
		},
		clear: function() {
			current_text = null;
			if(current_mode == "textedit") {
				textActions.toSelectMode();
			}
		},
		init: function(inputElem) {
			if(!curtext) return;

// 				if(support.editableText) {
// 					curtext.select();
// 					return;
// 				}
		
			if(!curtext.parentNode) {
				// Result of the ffClone, need to get correct element
				curtext = selectedElements[0];
				selectorManager.requestSelector(curtext).showGrips(false);
			}
			
			var str = curtext.textContent;
			var len = str.length;
			
			var xform = curtext.getAttribute('transform');

			textbb = getBBox(curtext);
			
			matrix = xform?getMatrix(curtext):null;

			chardata = Array(len);
			textinput.focus();
			
			$(curtext).unbind('dblclick', selectWord).dblclick(selectWord);
			
			if(!len) {
				var end = {x: textbb.x + (textbb.width/2), width: 0};
			}
			
			for(var i=0; i<len; i++) {
				var start = curtext.getStartPositionOfChar(i);
				var end = curtext.getEndPositionOfChar(i);
				
				// Get a "bbox" equivalent for each character. Uses the
				// bbox data of the actual text for y, height purposes
				
				// TODO: Decide if y, width and height are actually necessary
				chardata[i] = {
					x: start.x,
					y: textbb.y, // start.y?
					width: end.x - start.x,
					height: textbb.height
				};
			}
			
			// Add a last bbox for cursor at end of text
			chardata.push({
				x: end.x,
				width: 0
			});
			
			setSelection(textinput.selectionStart, textinput.selectionEnd, true);
		}
	}
}();

// Group: Path edit functions
// Functions relating to editing path elements
var pathActions = this.pathActions = function() {
	
	var subpath = false;
	var pathData = {};
	var current_path;
	var path;
	var segData = {
		2: ['x','y'],
		4: ['x','y'],
		6: ['x','y','x1','y1','x2','y2'],
		8: ['x','y','x1','y1'],
		10: ['x','y','r1','r2','angle','largeArcFlag','sweepFlag'],
		12: ['x'],
		14: ['y'],
		16: ['x','y','x2','y2'],
		18: ['x','y']
	};
	
	function retPath() {
		return path;
	}

	function resetD(p) {
		p.setAttribute("d", pathActions.convertPath(p));
	}
	
	function insertItemBefore(elem, newseg, index) {
		// Support insertItemBefore on paths for FF2
		var list = elem.pathSegList;
		
		if(support.pathInsertItemBefore) {
			list.insertItemBefore(newseg, index);
			return;
		}
		var len = list.numberOfItems;
		var arr = [];
		for(var i=0; i<len; i++) {
			var cur_seg = list.getItem(i);
			arr.push(cur_seg)				
		}
		list.clear();
		for(var i=0; i<len; i++) {
			if(i == index) { //index+1
				list.appendItem(newseg);
			}
			list.appendItem(arr[i]);
		}
	}
	
	// TODO: See if this should just live in replacePathSeg
	function ptObjToArr(type, seg_item) {
		var arr = segData[type], len = arr.length;
		var out = Array(len);
		for(var i=0; i<len; i++) {
			out[i] = seg_item[arr[i]];
		}
		return out;
	}

	function getGripContainer() {
		var c = getElem("pathpointgrip_container");
		if (!c) {
			var parent = getElem("selectorParentGroup");
			c = parent.appendChild(document.createElementNS(svgns, "g"));
			c.id = "pathpointgrip_container";
		}
		return c;
	}

	var addPointGrip = function(index, x, y) {
		// create the container of all the point grips
		var pointGripContainer = getGripContainer();

		var pointGrip = getElem("pathpointgrip_"+index);
		// create it
		if (!pointGrip) {
			pointGrip = document.createElementNS(svgns, "circle");
			assignAttributes(pointGrip, {
				'id': "pathpointgrip_" + index,
				'display': "none",
				'r': 4,
				'fill': "#0FF",
				'stroke': "#00F",
				'stroke-width': 2,
				'cursor': 'move',
				'style': 'pointer-events:all',
				'xlink:title': uiStrings.pathNodeTooltip
			});
			pointGrip = pointGripContainer.appendChild(pointGrip);

			var grip = $('#pathpointgrip_'+index);
			grip.dblclick(function() {
				if(path) path.setSegType();
			});
		}
		if(x && y) {
			// set up the point grip element and display it
			assignAttributes(pointGrip, {
				'cx': x,
				'cy': y,
				'display': "inline"
			});
		}
		return pointGrip;
	};
	
	var getPointGrip = function(seg, update) {
		var index = seg.index;
		var pointGrip = addPointGrip(index);

		if(update) {
			var pt = getGripPt(seg);
			assignAttributes(pointGrip, {
				'cx': pt.x,
				'cy': pt.y,
				'display': "inline"
			});
		}
		
		return pointGrip;
	}
	
	var getSegSelector = function(seg, update) {
		var index = seg.index;
		var segLine = getElem("segline_" + index);
		if(!segLine) {
			var pointGripContainer = getGripContainer();
			// create segline
			segLine = document.createElementNS(svgns, "path");
			assignAttributes(segLine, {
				'id': "segline_" + index,
				'display': 'none',
				'fill': "none",
				'stroke': "#0FF",
				'stroke-width': 2,
				'style':'pointer-events:none',
				'd': 'M0,0 0,0'
			});
			pointGripContainer.appendChild(segLine);
		} 
		
		if(update) {
			var prev = seg.prev;
			if(!prev) {
				segLine.setAttribute("display", "none");
				return segLine;
			}
			
			var pt = getGripPt(prev);
			// Set start point
			replacePathSeg(2, 0, [pt.x, pt.y], segLine);
			
			var pts = ptObjToArr(seg.type, seg.item, true);
			for(var i=0; i < pts.length; i+=2) {
				var pt = getGripPt(seg, {x:pts[i], y:pts[i+1]});
				pts[i] = pt.x;
				pts[i+1] = pt.y;
			}

			replacePathSeg(seg.type, 1, pts, segLine);
		}
		return segLine;
	}
	
	var getControlPoints = function(seg) {
		var item = seg.item;
		var index = seg.index;
		if(!("x1" in item) || !("x2" in item)) return null;
		var cpt = {};			
		var pointGripContainer = getGripContainer();
	
		// Note that this is intentionally not seg.prev.item
		var prev = path.segs[index-1].item;

		var seg_items = [prev, item];
		
		for(var i=1; i<3; i++) {
			var id = index + 'c' + i;
			var ctrlLine = cpt['c' + i + '_line'] = getElem("ctrlLine_"+id);
			
			if(!ctrlLine) {
				ctrlLine = document.createElementNS(svgns, "line");
				assignAttributes(ctrlLine, {
					'id': "ctrlLine_"+id,
					'stroke': "#555",
					'stroke-width': 1,
					"style": "pointer-events:none"
				});
				pointGripContainer.appendChild(ctrlLine);
			}
			
			var pt = getGripPt(seg, {x:item['x' + i], y:item['y' + i]});
			var gpt = getGripPt(seg, {x:seg_items[i-1].x, y:seg_items[i-1].y});
			
			assignAttributes(ctrlLine, {
				'x1': pt.x,
				'y1': pt.y,
				'x2': gpt.x,
				'y2': gpt.y,
				'display': "inline"
			});
			
			cpt['c' + i + '_line'] = ctrlLine;
				
			var pointGrip = cpt['c' + i] = getElem("ctrlpointgrip_"+id);
			// create it
			if (!pointGrip) {
				pointGrip = document.createElementNS(svgns, "circle");
				assignAttributes(pointGrip, {
					'id': "ctrlpointgrip_" + id,
					'display': "none",
					'r': 4,
					'fill': "#0FF",
					'stroke': "#55F",
					'stroke-width': 1,
					'cursor': 'move',
					'style': 'pointer-events:all',
					'xlink:title': uiStrings.pathCtrlPtTooltip
				});
				pointGripContainer.appendChild(pointGrip);
			}
			
			assignAttributes(pointGrip, {
				'cx': pt.x,
				'cy': pt.y,
				'display': "inline"
			});
			cpt['c' + i] = pointGrip;
		}
		return cpt;
	}
	
	function getGripPt(seg, alt_pt) {
		var out = {
			x: alt_pt? alt_pt.x : seg.item.x,
			y: alt_pt? alt_pt.y : seg.item.y
		}, path = seg.path;

		
		if(path.matrix) {
			var pt = transformPoint(out.x, out.y, path.matrix);
			out = pt;
		}

		out.x *= current_zoom;
		out.y *= current_zoom;
		
		return out;
	}
	
	function getPointFromGrip(pt, path) {
		var out = {
			x: pt.x,
			y: pt.y
		}
		
		if(path.matrix) {
			var pt = transformPoint(out.x, out.y, path.imatrix);
			out.x = pt.x;
			out.y = pt.y;
		}
		
		out.x /= current_zoom;
		out.y /= current_zoom;			
		
		return out;
	}
	
	function Segment(index, item) {
		var s = this;
		
		s.index = index;
		s.selected = false;
		s.type = item.pathSegType;
		var grip;

		s.addGrip = function() {
			grip = s.ptgrip = getPointGrip(s, true);
			s.ctrlpts = getControlPoints(s, true);
			s.segsel = getSegSelector(s, true);
		}
		
		s.item = item;
		s.show = function(y) {
			if(grip) {
				grip.setAttribute("display", y?"inline":"none");
				s.segsel.setAttribute("display", y?"inline":"none");
				
				// Show/hide all control points if available
				s.showCtrlPts(y);
			}
		}
		s.select = function(y) {
			if(grip) {
				grip.setAttribute("stroke", y?"#0FF":"#00F");
				s.segsel.setAttribute("display", y?"inline":"none");
				if(s.ctrlpts) {
					s.selectCtrls(y);
				}
				s.selected = y;
			}
		}
		s.selectCtrls = function(y) {
			$('#ctrlpointgrip_' + s.index + 'c1, #ctrlpointgrip_' + s.index + 'c2').attr('fill',y?'#0FF':'#EEE');
		}
		s.update = function(full) {
			item = s.item;
			if(grip) {
				var pt = getGripPt(s);
				assignAttributes(grip, {
					'cx': pt.x,
					'cy': pt.y
				});
				
				getSegSelector(s, true);
				
				if(s.ctrlpts) {
					if(full) {
						s.item = path.elem.pathSegList.getItem(s.index);
						s.type = s.item.pathSegType;
					}
					getControlPoints(s);
				} 
				// this.segsel.setAttribute("display", y?"inline":"none");
			}
		}
		s.move = function(dx, dy) {
			var item = s.item;
			
			var cur = s;
			
			if(cur.ctrlpts) {
				var cur_pts = [item.x += dx, item.y += dy, 
					item.x1, item.y1, item.x2 += dx, item.y2 += dy];
			} else {
				var cur_pts = [item.x += dx, item.y += dy];
			}
			replacePathSeg(cur.type, cur.index, cur_pts);

			if(s.next && s.next.ctrlpts) {
				var next = s.next.item;
				var next_pts = [next.x, next.y, 
					next.x1 += dx, next.y1 += dy, next.x2, next.y2];
				replacePathSeg(s.next.type, s.next.index, next_pts);
			}
			
			if(s.mate) {
				// The last point of a closed subpath has a "mate",
				// which is the "M" segment of the subpath
				var item = s.mate.item;
				var pts = [item.x += dx, item.y += dy];
				replacePathSeg(s.mate.type, s.mate.index, pts);
				// Has no grip, so does not need "updating"?
			}
			
			s.update(true);
			if(s.next) s.next.update(true);
		}
		s.setLinked = function(num) {
			var seg, anum, pt;
			if(num == 2) {
				anum = 1;
				seg = s.next;
				if(!seg) return;
				pt = s.item;
			} else {
				anum = 2;
				seg = s.prev;
				if(!seg) return;
				pt = seg.item;
			}
			var item = seg.item;
			
			item['x' + anum] = pt.x + (pt.x - s.item['x' + num]);
			item['y' + anum] = pt.y + (pt.y - s.item['y' + num]);
			
			var pts = [item.x,item.y,
				item.x1,item.y1, item.x2,item.y2];
				
			replacePathSeg(seg.type, seg.index, pts);
			seg.update(true);

		}
		s.moveCtrl = function(num, dx, dy) {
			var item = s.item;

			item['x' + num] += dx;
			item['y' + num] += dy;
			
			var pts = [item.x,item.y,
				item.x1,item.y1, item.x2,item.y2];
				
			replacePathSeg(s.type, s.index, pts);
			s.update(true);
		}
		s.setType = function(new_type, pts) {
			replacePathSeg(new_type, index, pts);
			s.type = new_type;
			s.item = path.elem.pathSegList.getItem(index);
			s.showCtrlPts(new_type === 6);
			s.ctrlpts = getControlPoints(s);
			s.update(true);
		}
		s.showCtrlPts = function(y) {
			if(s.ctrlpts) {
				for (var o in s.ctrlpts) {
					s.ctrlpts[o].setAttribute("display", y?"inline":"none");
				}
			}
		}
	}
	
	function Path(elem) {
		if(!elem || elem.tagName !== "path") return false;
	
		var p = path = this;
		this.elem = elem;
		this.segs = [];
		this.selected_pts = [];
		
		// Reset path data
		this.init = function() {
			// Hide all grips, etc
			$(getGripContainer()).find("*").attr("display", "none");
			var segList = elem.pathSegList;
			var len = segList.numberOfItems;
			p.segs = [];
			p.selected_pts = [];
			p.first_seg = null;
			
			// Set up segs array
			for(var i=0; i < len; i++) {
				var item = segList.getItem(i);
				var segment = new Segment(i, item);
				segment.path = p;
				p.segs.push(segment);
			}	
			
			var segs = p.segs;
			var start_i = null;

			for(var i=0; i < len; i++) {
				var seg = segs[i]; 
				var next_seg = (i+1) >= len ? null : segs[i+1];
				var prev_seg = (i-1) < 0 ? null : segs[i-1];
				
				if(seg.type === 2) {
					if(prev_seg && prev_seg.type !== 1) {
						// New sub-path, last one is open,
						// so add a grip to last sub-path's first point
						var start_seg = segs[start_i];
						start_seg.next = segs[start_i+1];
						start_seg.next.prev = start_seg;
						start_seg.addGrip();
					}
					// Remember that this is a starter seg
					start_i = i;
				} else if(next_seg && next_seg.type === 1) {
					// This is the last real segment of a closed sub-path
					// Next is first seg after "M"
					seg.next = segs[start_i+1];
					
					// First seg after "M"'s prev is this
					seg.next.prev = seg;
					seg.mate = segs[start_i];
					seg.addGrip();
					if(p.first_seg == null) {
						p.first_seg = seg;
					}
				} else if(!next_seg) {
					if(seg.type !== 1) {
						// Last seg, doesn't close so add a grip
						// to last sub-path's first point
						var start_seg = segs[start_i];
						start_seg.next = segs[start_i+1];
						start_seg.next.prev = start_seg;
						start_seg.addGrip();
						seg.addGrip();

						if(!p.first_seg) {
							// Open path, so set first as real first and add grip
							p.first_seg = segs[start_i];
						}
					}
				} else if(seg.type !== 1){
					// Regular segment, so add grip and its "next"
					seg.addGrip();
					
					// Don't set its "next" if it's an "M"
					if(next_seg && next_seg.type !== 2) {
						seg.next = next_seg;
						seg.next.prev = seg;
					}
				}
			}
			return p;
		}
		
		this.init();
		
		// Update position of all points
		this.update = function() {
			if(getRotationAngle(p.elem)) {
				p.matrix = getMatrix(path.elem);
				p.imatrix = p.matrix.inverse();
			}

			p.eachSeg(function(i) {
				this.item = elem.pathSegList.getItem(i);
				this.update();
			});
			
			return p;
		}
		
		this.eachSeg = function(fn) {
			var len = p.segs.length
			for(var i=0; i < len; i++) {
				var ret = fn.call(p.segs[i], i);
				if(ret === false) break;
			}
		}
		
		this.addSeg = function(index) {
			// Adds a new segment
			var seg = p.segs[index];
			if(!seg.prev) return;
			
			var prev = seg.prev;
			var newseg;
			switch(seg.item.pathSegType) {
			case 4:
				var new_x = (seg.item.x + prev.item.x) / 2;
				var new_y = (seg.item.y + prev.item.y) / 2;
				newseg = elem.createSVGPathSegLinetoAbs(new_x, new_y);
				break;
			case 6: //make it a curved segment to preserve the shape (WRS)
				// http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
				var p0_x = (prev.item.x + seg.item.x1)/2;
				var p1_x = (seg.item.x1 + seg.item.x2)/2;
				var p2_x = (seg.item.x2 + seg.item.x)/2;
				var p01_x = (p0_x + p1_x)/2;
				var p12_x = (p1_x + p2_x)/2;
				var new_x = (p01_x + p12_x)/2;
				var p0_y = (prev.item.y + seg.item.y1)/2;
				var p1_y = (seg.item.y1 + seg.item.y2)/2;
				var p2_y = (seg.item.y2 + seg.item.y)/2;
				var p01_y = (p0_y + p1_y)/2;
				var p12_y = (p1_y + p2_y)/2;
				var new_y = (p01_y + p12_y)/2;
				newseg = elem.createSVGPathSegCurvetoCubicAbs(new_x,new_y, p0_x,p0_y, p01_x,p01_y);
				var pts = [seg.item.x,seg.item.y,p12_x,p12_y,p2_x,p2_y];
				replacePathSeg(seg.type,index,pts);
				break;
			}
					
			insertItemBefore(elem, newseg, index);
		}
		
		this.deleteSeg = function(index) {
			var seg = p.segs[index];
			var list = elem.pathSegList;
			
			seg.show(false);
			var next = seg.next;
			if(seg.mate) {
				// Make the next point be the "M" point
				var pt = [next.item.x, next.item.y];
				replacePathSeg(2, next.index, pt);
				
				// Reposition last node
				replacePathSeg(4, seg.index, pt);
				
				list.removeItem(seg.mate.index);
			} else if(!seg.prev) {
				// First node of open path, make next point the M
				var item = seg.item;
				var pt = [next.item.x, next.item.y];
				replacePathSeg(2, seg.next.index, pt);
				list.removeItem(index);
				
			} else {
				list.removeItem(index);
			}
		}
		
		this.endChanges = function(text) {
			if(isWebkit) resetD(p.elem);
			var cmd = new ChangeElementCommand(elem, {d: p.last_d}, text);
			addCommandToHistory(cmd);
			call("changed", [elem]);
		}

		this.subpathIsClosed = function(index) {
			var closed = false;
			// Check if subpath is already open
			path.eachSeg(function(i) {
				if(i <= index) return true;
				if(this.type === 2) {
					// Found M first, so open
					return false;
				} else if(this.type === 1) {
					// Found Z first, so closed
					closed = true;
					return false;
				}
			});
			
			return closed;
		}
		
		this.addPtsToSelection = function(indexes) {
			if(!$.isArray(indexes)) indexes = [indexes];
			for(var i=0; i< indexes.length; i++) {
				var index = indexes[i];
				var seg = p.segs[index];
				if(seg.ptgrip) {
					if($.inArray(index, p.selected_pts) == -1 && index >= 0) {
						p.selected_pts.push(index);
					}
				}
			};
			p.selected_pts.sort();
			var i = p.selected_pts.length,
				grips = new Array(i);
			// Loop through points to be selected and highlight each
			while(i--) {
				var pt = p.selected_pts[i];
				var seg = p.segs[pt];
				seg.select(true);
				grips[i] = seg.ptgrip;
			}
			// TODO: Correct this:
			pathActions.canDeleteNodes = true;
			
			pathActions.closed_subpath = p.subpathIsClosed(p.selected_pts[0]);
			
			call("selected", grips);
		}

		this.removePtFromSelection = function(index) {
			var pos = $.inArray(index, p.selected_pts);
			if(pos == -1) {
				return;
			} 
			p.segs[index].select(false);
			p.selected_pts.splice(pos, 1);
		}

		
		this.clearSelection = function() {
			p.eachSeg(function(i) {
				this.select(false);
			});
			p.selected_pts = [];
		}
		
		this.selectPt = function(pt, ctrl_num) {
			p.clearSelection();
			if(pt == null) {
				p.eachSeg(function(i) {
					if(this.prev) {
						pt = i;
					}
				});
			}
			p.addPtsToSelection(pt);
			if(ctrl_num) {
				p.dragctrl = ctrl_num;
				
				if(link_control_pts) {
					p.segs[pt].setLinked(ctrl_num);
				}
			}
		}
		
		this.storeD = function() {
			this.last_d = elem.getAttribute('d');
		}
		
		this.show = function(y) {
			// Shows this path's segment grips 
			p.eachSeg(function() {
				this.show(y);
			});
			if(y) {
				p.selectPt(p.first_seg.index);
			}
			return p;
		}
		
		// Move selected points 
		this.movePts = function(d_x, d_y) {
			var i = p.selected_pts.length;
			while(i--) {
				var seg = p.segs[p.selected_pts[i]];
				seg.move(d_x, d_y);
			}
		}
		
		this.moveCtrl = function(d_x, d_y) {
			var seg = p.segs[p.selected_pts[0]];
			seg.moveCtrl(p.dragctrl, d_x, d_y);
			if(link_control_pts) {
				seg.setLinked(p.dragctrl);
			}
		}
		
		this.setSegType = function(new_type) {
			p.storeD();
			var i = p.selected_pts.length;
			var text;
			while(i--) {
				var sel_pt = p.selected_pts[i];
				
				// Selected seg
				var cur = p.segs[sel_pt];
				var prev = cur.prev;
				if(!prev) continue;
				
				if(!new_type) { // double-click, so just toggle
					text = "Toggle Path Segment Type";
		
					// Toggle segment to curve/straight line
					var old_type = cur.type;
					
					new_type = (old_type == 6) ? 4 : 6;
				} 
				
				new_type = new_type-0;
				
				var cur_x = cur.item.x;
				var cur_y = cur.item.y;
				var prev_x = prev.item.x;
				var prev_y = prev.item.y;
				var points;
				switch ( new_type ) {
				case 6:
					if(cur.olditem) {
						var old = cur.olditem;
						points = [cur_x,cur_y, old.x1,old.y1, old.x2,old.y2];
					} else {
						var diff_x = cur_x - prev_x;
						var diff_y = cur_y - prev_y;
						// get control points from straight line segment
						/*
						var ct1_x = (prev_x + (diff_y/2));
						var ct1_y = (prev_y - (diff_x/2));
						var ct2_x = (cur_x + (diff_y/2));
						var ct2_y = (cur_y - (diff_x/2));
						*/
						//create control points on the line to preserve the shape (WRS)
						var ct1_x = (prev_x + (diff_x/3));
						var ct1_y = (prev_y + (diff_y/3));
						var ct2_x = (cur_x - (diff_x/3));
						var ct2_y = (cur_y - (diff_y/3));
						points = [cur_x,cur_y, ct1_x,ct1_y, ct2_x,ct2_y];
					}
					break;
				case 4:
					points = [cur_x,cur_y];
					
					// Store original prevve segment nums
					cur.olditem = cur.item;
					break;
				}
				
				cur.setType(new_type, points);
			}
			path.endChanges(text);
			return;
		}

	}
	
	function getPath(elem) {
		var p = pathData[elem.id];
		if(!p) p = pathData[elem.id] = new Path(elem);
		return p;
	}
	
	
	var pathFuncs = [],
		current_path = null,
		current_path_pts = [],
		link_control_pts = false,
		hasMoved = false;
	
	// This function converts a polyline (created by the fh_path tool) into
	// a path element and coverts every three line segments into a single bezier
	// curve in an attempt to smooth out the free-hand
	var smoothPolylineIntoPath = function(element) {
		var points = element.points;
		var N = points.numberOfItems;
		if (N >= 4) {
			// loop through every 3 points and convert to a cubic bezier curve segment
			// 
			// NOTE: this is cheating, it means that every 3 points has the potential to 
			// be a corner instead of treating each point in an equal manner.  In general,
			// this technique does not look that good.
			// 
			// I am open to better ideas!
			// 
			// Reading:
			// - http://www.efg2.com/Lab/Graphics/Jean-YvesQueinecBezierCurves.htm
			// - http://www.codeproject.com/KB/graphics/BezierSpline.aspx?msg=2956963
			// - http://www.ian-ko.com/ET_GeoWizards/UserGuide/smooth.htm
			// - http://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
			var curpos = points.getItem(0), prevCtlPt = null;
			var d = [];
			d.push(["M",curpos.x,",",curpos.y," C"].join(""));
			for (var i = 1; i <= (N-4); i += 3) {
				var ct1 = points.getItem(i);
				var ct2 = points.getItem(i+1);
				var end = points.getItem(i+2);
				
				// if the previous segment had a control point, we want to smooth out
				// the control points on both sides
				if (prevCtlPt) {
					var newpts = smoothControlPoints( prevCtlPt, ct1, curpos );
					if (newpts && newpts.length == 2) {
						var prevArr = d[d.length-1].split(',');
						prevArr[2] = newpts[0].x;
						prevArr[3] = newpts[0].y;
						d[d.length-1] = prevArr.join(',');
						ct1 = newpts[1];
					}
				}
				
				d.push([ct1.x,ct1.y,ct2.x,ct2.y,end.x,end.y].join(','));
				
				curpos = end;
				prevCtlPt = ct2;
			}
			// handle remaining line segments
			d.push("L");
			for(;i < N;++i) {
				var pt = points.getItem(i);
				d.push([pt.x,pt.y].join(","));
			}
			d = d.join(" ");

			// create new path element
			element = addSvgElementFromJson({
				"element": "path",
				"curStyles": true,
				"attr": {
					"id": getId(),
					"d": d,
					"fill": "none"
				}
			});
			call("changed",[element]);
		}
		return element;
	};
	
	// This replaces the segment at the given index. Type is given as number.
	var replacePathSeg = function(type, index, pts, elem) {
		var path = elem || retPath().elem;
		var func = 'createSVGPathSeg' + pathFuncs[type];
		var seg = path[func].apply(path, pts);
		
		if(support.pathReplaceItem) {
			path.pathSegList.replaceItem(seg, index);
		} else {
			var segList = path.pathSegList;
			var len = segList.numberOfItems;
			var arr = [];
			for(var i=0; i<len; i++) {
				var cur_seg = segList.getItem(i);
				arr.push(cur_seg)				
			}
			segList.clear();
			for(var i=0; i<len; i++) {
				if(i == index) {
					segList.appendItem(seg);
				} else {
					segList.appendItem(arr[i]);
				}
			}
		}
	}

	// If the path was rotated, we must now pay the piper:
	// Every path point must be rotated into the rotated coordinate system of 
	// its old center, then determine the new center, then rotate it back
	// This is because we want the path to remember its rotation
	
	// TODO: This is still using ye olde transform methods, can probably
	// be optimized or even taken care of by recalculateDimensions
	var recalcRotatedPath = function() {
		var current_path = path.elem;
		var angle = getRotationAngle(current_path, true);
		if(!angle) return;
		selectedBBoxes[0] = path.oldbbox;
		var box = getBBox(current_path),
			oldbox = selectedBBoxes[0],
			oldcx = oldbox.x + oldbox.width/2,
			oldcy = oldbox.y + oldbox.height/2,
			newcx = box.x + box.width/2,
			newcy = box.y + box.height/2,
		
		// un-rotate the new center to the proper position
			dx = newcx - oldcx,
			dy = newcy - oldcy,
			r = Math.sqrt(dx*dx + dy*dy),
			theta = Math.atan2(dy,dx) + angle;
			
		newcx = r * Math.cos(theta) + oldcx;
		newcy = r * Math.sin(theta) + oldcy;
		
		var getRotVals = function(x, y) {
			dx = x - oldcx;
			dy = y - oldcy;
			
			// rotate the point around the old center
			r = Math.sqrt(dx*dx + dy*dy);
			theta = Math.atan2(dy,dx) + angle;
			dx = r * Math.cos(theta) + oldcx;
			dy = r * Math.sin(theta) + oldcy;
			
			// dx,dy should now hold the actual coordinates of each
			// point after being rotated

			// now we want to rotate them around the new center in the reverse direction
			dx -= newcx;
			dy -= newcy;
			
			r = Math.sqrt(dx*dx + dy*dy);
			theta = Math.atan2(dy,dx) - angle;
			
			return {'x':(r * Math.cos(theta) + newcx)/1,
				'y':(r * Math.sin(theta) + newcy)/1};
		}
		
		var list = current_path.pathSegList,
			i = list.numberOfItems;
		while (i) {
			i -= 1;
			var seg = list.getItem(i),
				type = seg.pathSegType;
			if(type == 1) continue;
			
			var rvals = getRotVals(seg.x,seg.y),
				points = [rvals.x, rvals.y];
			if(seg.x1 != null && seg.x2 != null) {
				c_vals1 = getRotVals(seg.x1, seg.y1);
				c_vals2 = getRotVals(seg.x2, seg.y2);
				points.splice(points.length, 0, c_vals1.x , c_vals1.y, c_vals2.x, c_vals2.y);
			}
			replacePathSeg(type, i, points);
		} // loop for each point

		box = getBBox(current_path);						
		selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
		selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;
		
		// now we must set the new transform to be rotated around the new center
		var R_nc = svgroot.createSVGTransform(),
			tlist = getTransformList(current_path);
		R_nc.setRotate((angle * 180.0 / Math.PI), newcx, newcy);
		tlist.replaceItem(R_nc,0);
	}
	
	return {
		init: function() {
			pathFuncs = [0,'ClosePath'];
			var pathFuncsStrs = ['Moveto','Lineto','CurvetoCubic','CurvetoQuadratic','Arc','LinetoHorizontal','LinetoVertical','CurvetoCubicSmooth','CurvetoQuadraticSmooth'];
			$.each(pathFuncsStrs,function(i,s){pathFuncs.push(s+'Abs');pathFuncs.push(s+'Rel');});
		},
		getPath: function() {
			return path;
		},
		mouseDown: function(evt, mouse_target, start_x, start_y) {
			if(current_mode == "path") return;
			
			// TODO: Make sure current_path isn't null at this point
			if(!path) return;
			
			path.storeD();
			
			var id = evt.target.id;
			if (id.substr(0,14) == "pathpointgrip_") {
				// Select this point
				var cur_pt = path.cur_pt = parseInt(id.substr(14));
				path.dragging = [start_x, start_y];
				var seg = path.segs[cur_pt];
				
				// only clear selection if shift is not pressed (otherwise, add 
				// node to selection)
				if (!evt.shiftKey) {
					if(path.selected_pts.length <= 1 || !seg.selected) {
						path.clearSelection();
					}
					path.addPtsToSelection(cur_pt);
				} else if(seg.selected) {
					path.removePtFromSelection(cur_pt);
				} else {
					path.addPtsToSelection(cur_pt);
				}
			} else if(id.indexOf("ctrlpointgrip_") == 0) {
				path.dragging = [start_x, start_y];
				
				var parts = id.split('_')[1].split('c');
				var cur_pt = parts[0]-0;
				var ctrl_num = parts[1]-0;
				path.selectPt(cur_pt, ctrl_num);
			}

			// Start selection box
			if(!path.dragging) {
				if (rubberBox == null) {
					rubberBox = selectorManager.getRubberBandBox();
				}
				assignAttributes(rubberBox, {
						'x': start_x * current_zoom,
						'y': start_y * current_zoom,
						'width': 0,
						'height': 0,
						'display': 'inline'
				}, 100);
			}
		},
		mouseMove: function(mouse_x, mouse_y) {
			hasMoved = true;
			if(current_mode == "path") {
				var line = getElem("path_stretch_line");
				if (line) {
					line.setAttribute("x2", mouse_x);
					line.setAttribute("y2", mouse_y);
				}
				return;
			}
			// if we are dragging a point, let's move it
			if (path.dragging) {
				var pt = getPointFromGrip({
					x: path.dragging[0],
					y: path.dragging[1]
				}, path);
				var mpt = getPointFromGrip({
					x: mouse_x,
					y: mouse_y
				}, path);
				var diff_x = mpt.x - pt.x;
				var diff_y = mpt.y - pt.y;
				path.dragging = [mouse_x, mouse_y];
				
				if(path.dragctrl) {
					path.moveCtrl(diff_x, diff_y);
				} else {
					path.movePts(diff_x, diff_y);
				}
			} else {
				path.selected_pts = [];
				path.eachSeg(function(i) {
					var seg = this;
					if(!seg.next && !seg.prev) return;
						
					var item = seg.item;
					var rbb = rubberBox.getBBox();
					
					var pt = getGripPt(seg);
					var pt_bb = {
						x: pt.x,
						y: pt.y,
						width: 0,
						height: 0
					};
				
					var sel = Utils.rectsIntersect(rbb, pt_bb);

					this.select(sel);
					//Note that addPtsToSelection is not being run
					if(sel) path.selected_pts.push(seg.index);
				});

			}
		}, 
		mouseUp: function(evt, element, mouse_x, mouse_y) {
			
			// Create mode
			if(current_mode == "path") {
				var x = mouse_x/current_zoom,
					y = mouse_y/current_zoom,
					stretchy = getElem("path_stretch_line");

					if(svgEditor.curConfig.gridSnapping){
						x = Utils.snapToGrid(x);
						y = Utils.snapToGrid(y);
					}

				if (!stretchy) {
					stretchy = document.createElementNS(svgns, "line");
					assignAttributes(stretchy, {
						'id': "path_stretch_line",
						'stroke': "#22C",
						'stroke-width': "0.5"
					});
					stretchy = getElem("selectorParentGroup").appendChild(stretchy);
				}
				stretchy.setAttribute("display", "inline");
				
				var keep = null;
				
				// if pts array is empty, create path element with M at current point
				if (current_path_pts.length == 0) {
					current_path_pts.push(x);
					current_path_pts.push(y);
					d_attr = "M" + x + "," + y + " ";
					addSvgElementFromJson({
						"element": "path",
						"curStyles": true,
						"attr": {
							"d": d_attr,
							"id": getNextId(),
							"opacity": cur_shape.opacity / 2,

						}
					});
					// set stretchy line to first point
					assignAttributes(stretchy, {
						'x1': mouse_x,
						'y1': mouse_y,
						'x2': mouse_x,
						'y2': mouse_y
					});
					var index = subpath ? path.segs.length : 0;
					addPointGrip(index, mouse_x, mouse_y);
				}
				else {
					// determine if we clicked on an existing point
					var i = current_path_pts.length;
					var FUZZ = 6/current_zoom;
					var clickOnPoint = false;
					while(i) {
						i -= 2;
						var px = current_path_pts[i], py = current_path_pts[i+1];
						// found a matching point
						if ( x >= (px-FUZZ) && x <= (px+FUZZ) && y >= (py-FUZZ) && y <= (py+FUZZ) ) {
							clickOnPoint = true;
							break;
						}
					}
					
					// get path element that we are in the process of creating
					var id = getId();
				
					// Remove previous path object if previously created
					if(id in pathData) delete pathData[id];
					
					var newpath = getElem(id);
					
					var len = current_path_pts.length;
					// if we clicked on an existing point, then we are done this path, commit it
					// (i,i+1) are the x,y that were clicked on
					if (clickOnPoint) {
						// if clicked on any other point but the first OR
						// the first point was clicked on and there are less than 3 points
						// then leave the path open
						// otherwise, close the path
						if (i == 0 && len >= 6) {
							// Create end segment
							var abs_x = current_path_pts[0];
							var abs_y = current_path_pts[1];
							d_attr += ['L',abs_x,',',abs_y,'z'].join('');
							newpath.setAttribute("d", d_attr);
						} else if(len < 3) {
							keep = false;
							return keep;
						}
						$(stretchy).remove();
						
						// this will signal to commit the path
						element = newpath;
						current_path_pts = [];
						started = false;
						
						if(subpath) {
							if(path.matrix) {
								remapElement(newpath, {}, path.matrix.inverse());
							}
						
							var new_d = newpath.getAttribute("d");
							var orig_d = $(path.elem).attr("d");
							$(path.elem).attr("d", orig_d + new_d);
							$(newpath).remove();
							if(path.matrix) {
								recalcRotatedPath();
							}
							path.init();
							pathActions.toEditMode(path.elem);
							path.selectPt();
							return false;
						}
					}
					// else, create a new point, append to pts array, update path element
					else {
						// Checks if current target or parents are #svgcontent
						if(!$.contains(container, getMouseTarget(evt))) {
							// Clicked outside canvas, so don't make point
							console.log("Clicked outside canvas");
							return false;
						}

						var lastx = current_path_pts[len-2], lasty = current_path_pts[len-1];

						if(evt.shiftKey) { var xya=Utils.snapToAngle(lastx,lasty,x,y); x=xya.x; y=xya.y; }

						// we store absolute values in our path points array for easy checking above
						current_path_pts.push(x);
						current_path_pts.push(y);
						d_attr += "L" + round(x) + "," + round(y) + " ";

						newpath.setAttribute("d", d_attr);
						
						x *= current_zoom;
						y *= current_zoom;
						
						// set stretchy line to latest point
						assignAttributes(stretchy, {
							'x1': x,
							'y1': y,
							'x2': x,
							'y2': y
						});
						var index = (current_path_pts.length/2 - 1);
						if(subpath) index += path.segs.length;
						addPointGrip(index, x, y);
					}
					keep = true;
				}
				return {
					keep: keep,
					element: element
				}
			}
			
			// Edit mode
			
			if (path.dragging) {
				var last_pt = path.cur_pt;

				path.dragging = false;
				path.dragctrl = false;
				path.update();
				
			
				if(hasMoved) {
					path.endChanges("Move path point(s)");
				} 
				
				if(!evt.shiftKey && !hasMoved) {
					path.selectPt(last_pt);
				} 
			}
			else if(rubberBox && rubberBox.getAttribute('display') != 'none') {
				// Done with multi-node-select
				rubberBox.setAttribute("display", "none");
				
				if(rubberBox.getAttribute('width') <= 2 && rubberBox.getAttribute('height') <= 2) {
					pathActions.toSelectMode(evt.target);
				}
				
			// else, move back to select mode	
			} else {
				pathActions.toSelectMode(evt.target);
			}
			hasMoved = false;
		},
		clearData: function() {
			pathData = {};
		},
		toEditMode: function(element) {
			path = getPath(element);
			current_mode = "pathedit";
			clearSelection();
			path.show(true).update();
			path.oldbbox = getBBox(path.elem);
			subpath = false;
		},
		toSelectMode: function(elem) {
			var selPath = (elem == path.elem);
			current_mode = "select";
			path.show(false);
			current_path = false;
			clearSelection();
			
			if(path.matrix) {
				// Rotated, so may need to re-calculate the center
				recalcRotatedPath();
			}
			
			if(selPath) {
				call("selected", [elem]);
				addToSelection([elem], true);
			}
		},
		addSubPath: function(on) {
			if(on) {
				// Internally we go into "path" mode, but in the UI it will
				// still appear as if in "pathedit" mode.
				current_mode = "path";
				subpath = true;
			} else {
				pathActions.clear(true);
				pathActions.toEditMode(path.elem);
			}
		},
		select: function(target) {
			if (current_path == target) {
				pathActions.toEditMode(target);
				current_mode = "pathedit";
			} // going into pathedit mode
			else {
				current_path = target;
			}	
		},
		reorient: function() {
			var elem = selectedElements[0];
			if(!elem) return;
			var angle = getRotationAngle(elem);
			if(angle == 0) return;
			
			var batchCmd = new BatchCommand("Reorient path");
			var changes = {
				d: elem.getAttribute('d'),
				transform: elem.getAttribute('transform')
			};
			batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
			clearSelection();
			this.resetOrientation(elem);
			
			addCommandToHistory(batchCmd);

			// Set matrix to null
			getPath(elem).show(false).matrix = null; 

			this.clear();
	
			addToSelection([elem], true);
			call("changed", selectedElements);
		},
		
		clear: function(remove) {
			current_path = null;
			if (current_mode == "path" && current_path_pts.length > 0) {
				var elem = getElem(getId());
				$(getElem("path_stretch_line")).remove();
				$(elem).remove();
				$(getElem("pathpointgrip_container")).find('*').attr('display', 'none');
				current_path_pts = [];
				started = false;
			} else if (current_mode == "pathedit") {
				this.toSelectMode();
			}
			if(path) path.init().show(false);
		},
		resetOrientation: function(path) {
			if(path == null || path.nodeName != 'path') return false;
			var tlist = getTransformList(path);
			var m = transformListToTransform(tlist).matrix;
			tlist.clear();
			path.removeAttribute("transform");
			var segList = path.pathSegList;
			
			// Opera/win/non-EN throws an error here.
			// TODO: Find out why!
			// Presumed fixed in Opera 10.5, so commented out for now
			
// 			try {
				var len = segList.numberOfItems;
// 			} catch(err) {
// 				var fixed_d = pathActions.convertPath(path);
// 				path.setAttribute('d', fixed_d);
// 				segList = path.pathSegList;
// 				var len = segList.numberOfItems;
// 			}
			for (var i = 0; i < len; ++i) {
				var seg = segList.getItem(i);
				var type = seg.pathSegType;
				if(type == 1) continue;
				var pts = [];
				$.each(['',1,2], function(j, n) {
					var x = seg['x'+n], y = seg['y'+n];
					if(x && y) {
						var pt = transformPoint(x, y, m);
						pts.splice(pts.length, 0, pt.x, pt.y);
					}
				});
				replacePathSeg(type, i, pts, path);
			}
		},
		zoomChange: function() {
			if(current_mode == "pathedit") {
				path.update();
			}
		},
		getNodePoint: function() {
			var sel_pt = path.selected_pts.length ? path.selected_pts[0] : 1;

			var seg = path.segs[sel_pt];
			return {
				x: seg.item.x,
				y: seg.item.y,
				type: seg.type
			};
		}, 
		linkControlPoints: function(linkPoints) {
			link_control_pts = linkPoints;
		},
		clonePathNode: function() {
			path.storeD();
			
			var sel_pts = path.selected_pts;
			var segs = path.segs;
			
			var i = sel_pts.length;
			var nums = [];

			while(i--) {
				var pt = sel_pts[i];
				path.addSeg(pt);
				
				nums.push(pt + i);
				nums.push(pt + i + 1);
			}
			path.init().addPtsToSelection(nums);

			path.endChanges("Clone path node(s)");
		},
		opencloseSubPath: function() {
			var sel_pts = path.selected_pts;
			// Only allow one selected node for now
			if(sel_pts.length !== 1) return;
			
			var elem = path.elem;
			var list = elem.pathSegList;

			var len = list.numberOfItems;

			var index = sel_pts[0];
			
			var open_pt = null;
			var start_item = null;

			// Check if subpath is already open
			path.eachSeg(function(i) {
				if(this.type === 2 && i <= index) {
					start_item = this.item;
				}
				if(i <= index) return true;
				if(this.type === 2) {
					// Found M first, so open
					open_pt = i;
					return false;
				} else if(this.type === 1) {
					// Found Z first, so closed
					open_pt = false;
					return false;
				}
			});
			
			if(open_pt == null) {
				// Single path, so close last seg
				open_pt = path.segs.length - 1;
			}

			if(open_pt !== false) {
				// Close this path
				
				// Create a line going to the previous "M"
				var newseg = elem.createSVGPathSegLinetoAbs(start_item.x, start_item.y);
			
				var closer = elem.createSVGPathSegClosePath();
				if(open_pt == path.segs.length - 1) {
					list.appendItem(newseg);
					list.appendItem(closer);
				} else {
					insertItemBefore(elem, closer, open_pt);
					insertItemBefore(elem, newseg, open_pt);
				}
				
				path.init().selectPt(open_pt+1);
				return;
			}
			
			

			// M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
			// M 2,2 L 3,3 L 1,1
			
			// M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z 
			// M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z 
			
			var seg = path.segs[index];
			
			if(seg.mate) {
				list.removeItem(index); // Removes last "L"
				list.removeItem(index); // Removes the "Z"
				path.init().selectPt(index - 1);
				return;
			}
			
			var last_m, z_seg;
			
			// Find this sub-path's closing point and remove
			for(var i=0; i<list.numberOfItems; i++) {
				var item = list.getItem(i);

				if(item.pathSegType === 2) {
					// Find the preceding M
					last_m = i;
				} else if(i === index) {
					// Remove it
					list.removeItem(last_m);
// 						index--;
				} else if(item.pathSegType === 1 && index < i) {
					// Remove the closing seg of this subpath
					z_seg = i-1;
					list.removeItem(i);
					break;
				}
			}
			
			var num = (index - last_m) - 1;
			
			while(num--) {
				insertItemBefore(elem, list.getItem(last_m), z_seg);
			}
			
			var pt = list.getItem(last_m);
			
			// Make this point the new "M"
			replacePathSeg(2, last_m, [pt.x, pt.y]);
			
			var i = index
			
			path.init().selectPt(0);
		},
		deletePathNode: function() {
			if(!pathActions.canDeleteNodes) return;
			path.storeD();
			
			var sel_pts = path.selected_pts;
			var i = sel_pts.length;

			while(i--) {
				var pt = sel_pts[i];
				path.deleteSeg(pt);
			}
			
			// Cleanup
			var cleanup = function() {
				var segList = path.elem.pathSegList;
				var len = segList.numberOfItems;
				
				var remItems = function(pos, count) {
					while(count--) {
						segList.removeItem(pos);
					}
				}

				if(len <= 1) return true;
				
				while(len--) {
					var item = segList.getItem(len);
					if(item.pathSegType === 1) {
						var prev = segList.getItem(len-1);
						var nprev = segList.getItem(len-2);
						if(prev.pathSegType === 2) {
							remItems(len-1, 2);
							cleanup();
							break;
						} else if(nprev.pathSegType === 2) {
							remItems(len-2, 3);
							cleanup();
							break;
						}

					} else if(item.pathSegType === 2) {
						if(len > 0) {
							var prev_type = segList.getItem(len-1).pathSegType;
							// Path has M M  
							if(prev_type === 2) {
								remItems(len-1, 1);
								cleanup();
								break;
							// Entire path ends with Z M 
							} else if(prev_type === 1 && segList.numberOfItems-1 === len) {
								remItems(len, 1);
								cleanup();
								break;
							}
						}
					}
				}	
				return false;
			}
			
			cleanup();
			
			// Completely delete a path with 1 or 0 segments
			if(path.elem.pathSegList.numberOfItems <= 1) {
				pathActions.toSelectMode(path.elem);
				canvas.deleteSelectedElements();
				return;
			}
			
			path.init();
			
			path.clearSelection();
			
			// TODO: Find right way to select point now
			// path.selectPt(sel_pt);
			if(window.opera) { // Opera repaints incorrectly
				var cp = $(path.elem); cp.attr('d',cp.attr('d'));
			}
			path.endChanges("Delete path node(s)");
		},
		smoothPolylineIntoPath: smoothPolylineIntoPath,
		setSegType: function(v) {
			path.setSegType(v);
		},
		moveNode: function(attr, newValue) {
			var sel_pts = path.selected_pts;
			if(!sel_pts.length) return;
			
			path.storeD();
			
			// Get first selected point
			var seg = path.segs[sel_pts[0]];
			var diff = {x:0, y:0};
			diff[attr] = newValue - seg.item[attr];
			
			seg.move(diff.x, diff.y);
			path.endChanges("Move path point");
		},
		fixEnd: function(elem) {
			// Adds an extra segment if the last seg before a Z doesn't end
			// at its M point
			// M0,0 L0,100 L100,100 z
			var segList = elem.pathSegList;
			var len = segList.numberOfItems;
			var last_m;
			for (var i = 0; i < len; ++i) {
				var item = segList.getItem(i);
				if(item.pathSegType === 2) {
					last_m = item;
				}
				
				if(item.pathSegType === 1) {
					var prev = segList.getItem(i-1);
					if(prev.x != last_m.x || prev.y != last_m.y) {
						// Add an L segment here
						var newseg = elem.createSVGPathSegLinetoAbs(last_m.x, last_m.y);
						insertItemBefore(elem, newseg, i);
						// Can this be done better?
						pathActions.fixEnd(elem);
						break;
					}
					
				}
			}
			if(isWebkit) resetD(elem);
		},
		// Convert a path to one with only absolute or relative values
		convertPath: function(path, toRel) {
			var segList = path.pathSegList;
			var len = segList.numberOfItems;
			var curx = 0, cury = 0;
			var d = "";
			var last_m = null;
			
			for (var i = 0; i < len; ++i) {
				var seg = segList.getItem(i);
				// if these properties are not in the segment, set them to zero
				var x = seg.x || 0,
					y = seg.y || 0,
					x1 = seg.x1 || 0,
					y1 = seg.y1 || 0,
					x2 = seg.x2 || 0,
					y2 = seg.y2 || 0;
	
				var type = seg.pathSegType;
				var letter = pathMap[type]['to'+(toRel?'Lower':'Upper')+'Case']();
				
				var addToD = function(pnts, more, last) {
					var str = '';
					var more = more?' '+more.join(' '):'';
					var last = last?' '+shortFloat(last):'';
					$.each(pnts, function(i, pnt) {
						pnts[i] = shortFloat(pnt);
					});
					d += letter + pnts.join(' ') + more + last;
				}
				
				switch (type) {
					case 1: // z,Z closepath (Z/z)
						d += "z";
						break;
					case 12: // absolute horizontal line (H)
						x -= curx;
					case 13: // relative horizontal line (h)
						if(toRel) {
							curx += x;
						} else {
							x += curx;
							curx = x;
						}
						addToD([[x]]);
						break;
					case 14: // absolute vertical line (V)
						y -= cury;
					case 15: // relative vertical line (v)
						if(toRel) {
							cury += y;
						} else {
							y += cury;
							cury = y;
						}
						addToD([[y]]);
						break;
					case 2: // absolute move (M)
					case 4: // absolute line (L)
					case 18: // absolute smooth quad (T)
						x -= curx;
						y -= cury;
					case 5: // relative line (l)
					case 3: // relative move (m)
						// If the last segment was a "z", this must be relative to 
						if(last_m && segList.getItem(i-1).pathSegType === 1 && !toRel) {
							curx = last_m[0];
							cury = last_m[1];
						}
					
					case 19: // relative smooth quad (t)
						if(toRel) {
							curx += x;
							cury += y;
						} else {
							x += curx;
							y += cury;
							curx = x;
							cury = y;
						}
						if(type === 3) last_m = [curx, cury];
						
						addToD([[x,y]]);
						break;
					case 6: // absolute cubic (C)
						x -= curx; x1 -= curx; x2 -= curx;
						y -= cury; y1 -= cury; y2 -= cury;
					case 7: // relative cubic (c)
						if(toRel) {
							curx += x;
							cury += y;
						} else {
							x += curx; x1 += curx; x2 += curx;
							y += cury; y1 += cury; y2 += cury;
							curx = x;
							cury = y;
						}
						addToD([[x1,y1],[x2,y2],[x,y]]);
						break;
					case 8: // absolute quad (Q)
						x -= curx; x1 -= curx;
						y -= cury; y1 -= cury;
					case 9: // relative quad (q) 
						if(toRel) {
							curx += x;
							cury += y;
						} else {
							x += curx; x1 += curx;
							y += cury; y1 += cury;
							curx = x;
							cury = y;
						}
						addToD([[x1,y1],[x,y]]);
						break;
					case 10: // absolute elliptical arc (A)
						x -= curx;
						y -= cury;
					case 11: // relative elliptical arc (a)
						if(toRel) {
							curx += x;
							cury += y;
						} else {
							x += curx;
							y += cury;
							curx = x;
							cury = y;
						}
						addToD([[seg.r1,seg.r2]], [
								seg.angle,
								(seg.largeArcFlag ? 1 : 0),
								(seg.sweepFlag ? 1 : 0)
							],[x,y]
						);
						break;
					case 16: // absolute smooth cubic (S)
						x -= curx; x2 -= curx;
						y -= cury; y2 -= cury;
					case 17: // relative smooth cubic (s)
						if(toRel) {
							curx += x;
							cury += y;
						} else {
							x += curx; x2 += curx;
							y += cury; y2 += cury;
							curx = x;
							cury = y;
						}
						addToD([[x2,y2],[x,y]]);
						break;
				} // switch on path segment type
			} // for each segment
			return d;
		}
	}
}();

pathActions.init();

// Group: Serialization

// Function: removeUnusedDefElems
// Looks at DOM elements inside the <defs> to see if they are referred to,
// removes them from the DOM if they are not.
// 
// Returns:
// The amount of elements that were removed
var removeUnusedDefElems = this.removeUnusedDefElems = function() {
	var defs = svgcontent.getElementsByTagNameNS(svgns, "defs");
	if(!defs || !defs.length) return 0;
	
	var defelem_uses = [],
		numRemoved = 0;
	var attrs = ['fill', 'stroke', 'filter', 'marker-start', 'marker-mid', 'marker-end'];
	var alen = attrs.length;
	
	var all_els = svgcontent.getElementsByTagNameNS(svgns, '*');
	var all_len = all_els.length;
	
	for(var i=0; i<all_len; i++) {
		var el = all_els[i];
		for(var j = 0; j < alen; j++) {
			var ref = getUrlFromAttr(el.getAttribute(attrs[j]));
			if(ref) defelem_uses.push(ref.substr(1));
		}
		
		// gradients can refer to other gradients
		var href = getHref(el);
		if (href && href.indexOf('#') == 0) {
			defelem_uses.push(href.substr(1));
		}
	};
	
	var defelems = $(svgcontent).find("linearGradient, radialGradient, filter, marker, svg");
		defelem_ids = [],
		i = defelems.length;
	while (i--) {
		var defelem = defelems[i];
		var id = defelem.id;
		if($.inArray(id, defelem_uses) == -1) {
			// Not found, so remove
			defelem.parentNode.removeChild(defelem);
			numRemoved++;
		}
	}
	
	// Remove defs if empty
	var i = defs.length;
	while (i--) {
		var def = defs[i];
		if(!def.getElementsByTagNameNS(svgns,'*').length) {
			def.parentNode.removeChild(def);
		}
	}
	
	return numRemoved;
}

// Function: svgCanvasToString
// Main function to set up the SVG content for output 
//
// Returns: 
// String containing the SVG image for output
var svgCanvasToString = this.svgCanvasToString = function() {
	// keep calling it until there are none to remove
	while (removeUnusedDefElems() > 0) {};
	
	pathActions.clear(true);
	
	// Keep SVG-Edit comment on top
	$.each(svgcontent.childNodes, function(i, node) {
		if(i && node.nodeType == 8 && node.data.indexOf('Created with') != -1) {
			svgcontent.insertBefore(node, svgcontent.firstChild);
		}
	});
	
	var naked_svgs = [];
	
	// Unwrap gsvg if it has no special attributes (only id and style)
	$(svgcontent).find('g:data(gsvg)').each(function() {
		var attrs = this.attributes;
		var len = attrs.length;
		for(var i=0; i<len; i++) {
			if(attrs[i].nodeName == 'id' || attrs[i].nodeName == 'style') {
				len--;
			}
		}
		// No significant attributes, so ungroup
		if(len <= 0) {
			var svg = this.firstChild;
			naked_svgs.push(svg);
			$(this).replaceWith(svg);
		}
	});
	
	var output = svgToString(svgcontent, 0);
	
	// Rewrap gsvg
	if(naked_svgs.length) {
		$(naked_svgs).each(function() {
			groupSvgElem(this);
		});
	}
	
	return output;
}

// Function: svgToString
// Sub function ran on each SVG element to convert it to a string as desired
// 
// Parameters: 
// elem - The SVG element to convert
// indent - Integer with the amount of spaces to indent this tag
//
// Returns: 
// String with the given element as an SVG tag
var svgToString = this.svgToString = function(elem, indent) {
	var out = new Array(), toXml = Utils.toXml;

	if (elem) {
		cleanupElement(elem);
		var attrs = elem.attributes,
			attr,
			i,
			childs = elem.childNodes;
		
		for (var i=0; i<indent; i++) out.push(" ");
		out.push("<"); out.push(elem.nodeName);			
		if(elem.id == 'svgcontent') {
			// Process root element separately
			var res = getResolution();
			out.push(' width="' + res.w + '" height="' + res.h + '" xmlns="'+svgns+'"');
			
			var nsuris = {};
			
			// Check elements for namespaces, add if found
			$(elem).find('*').andSelf().each(function() {
				var el = this;
				$.each(this.attributes, function(i, attr) {
					var uri = attr.namespaceURI;
					if(uri && !nsuris[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml' ) {
						nsuris[uri] = true;
						out.push(" xmlns:" + nsMap[uri] + '="' + uri +'"');
					}
				});
			});
			
			var i = attrs.length;
			while (i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				
				// Namespaces have already been dealt with, so skip
				if(attr.nodeName.indexOf('xmlns:') === 0) continue;

				// only serialize attributes we don't use internally
				if (attrVal != "" && 
					$.inArray(attr.localName, ['width','height','xmlns','x','y','viewBox','id','overflow']) == -1) 
				{

					if(!attr.namespaceURI || nsMap[attr.namespaceURI]) {
						out.push(' '); 
						out.push(attr.nodeName); out.push("=\"");
						out.push(attrVal); out.push("\"");
					}
				}
			}
		} else {
			for (var i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				//remove bogus attributes added by Gecko
				if ($.inArray(attr.localName, ['-moz-math-font-style', '_moz-math-font-style']) !== -1) continue;
				if (attrVal != "") {
					if(attrVal.indexOf('pointer-events') == 0) continue;
					if(attr.localName == "class" && attrVal.indexOf('se_') == 0) continue;
					out.push(" "); 
					if(attr.localName == 'd') attrVal = pathActions.convertPath(elem, true);
					if(!isNaN(attrVal)) {
						attrVal = shortFloat(attrVal);
					}
					
					// Embed images when saving 
					if(save_options.apply
						&& elem.nodeName == 'image' 
						&& attr.localName == 'href'
						&& save_options.images
						&& save_options.images == 'embed') 
					{
						var img = encodableImages[attrVal];
						if(img) attrVal = img;
					}
					
					// map various namespaces to our fixed namespace prefixes
					// (the default xmlns attribute itself does not get a prefix)
					if(!attr.namespaceURI || attr.namespaceURI == svgns || nsMap[attr.namespaceURI]) {
						out.push(attr.nodeName); out.push("=\"");
						out.push(attrVal); out.push("\"");
					}
				}
			}
		}

		if (elem.hasChildNodes()) {
			out.push(">");
			indent++;
			var bOneLine = false;
			
			for (var i=0; i<childs.length; i++)
			{
				var child = childs.item(i);
				switch(child.nodeType) {
				case 1: // element node
					out.push("\n");
					out.push(svgToString(childs.item(i), indent));
					break;
				case 3: // text node
					var str = child.nodeValue.replace(/^\s+|\s+$/g, "");
					if (str != "") {
						bOneLine = true;
						out.push(toXml(str) + "");
					}
					break;
				case 8: // comment
					out.push("\n");
					out.push(new Array(indent+1).join(" "));
					out.push("<!--");
					out.push(child.data);
					out.push("-->");
					break;
				} // switch on node type
			}
			indent--;
			if (!bOneLine) {
				out.push("\n");
				for (var i=0; i<indent; i++) out.push(" ");
			}
			out.push("</"); out.push(elem.nodeName); out.push(">");
		} else {
			out.push("/>");
		}
	}
	return out.join('');
}; // end svgToString()

// Function: embedImage
// Converts a given image file to a data URL when possible, then runs a given callback
//
// Parameters: 
// val - String with the path/URL of the image
// callback - Optional function to run when image data is found, supplies the
// result (data URL or false) as first parameter.
this.embedImage = function(val, callback) {

	// load in the image and once it's loaded, get the dimensions
	$(new Image()).load(function() {
		// create a canvas the same size as the raster image
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		// load the raster image into the canvas
		canvas.getContext("2d").drawImage(this,0,0);
		// retrieve the data: URL
		try {
			var urldata = ';svgedit_url=' + encodeURIComponent(val);
			urldata = canvas.toDataURL().replace(';base64',urldata+';base64');
			encodableImages[val] = urldata;
		} catch(e) {
			encodableImages[val] = false;
		}
		last_good_img_url = val;
		if(callback) callback(encodableImages[val]);
	}).attr('src',val);
}

// Function: setGoodImage
// Sets a given URL to be a "last good image" URL
this.setGoodImage = function(val) {
	last_good_img_url = val;
}

this.open = function() {
	// Nothing by default, handled by optional widget/extension
};

// Function: save
// Serializes the current drawing into SVG XML text and returns it to the 'saved' handler.
// This function also includes the XML prolog.  Clients of the SvgCanvas bind their save
// function to the 'saved' event.
//
// Returns: 
// Nothing
this.save = function(opts) {
	// remove the selected outline before serializing
	clearSelection();
	// Update save options if provided
	if(opts) $.extend(save_options, opts);
	save_options.apply = true;
	
	// no need for doctype, see http://jwatt.org/svg/authoring/#doctype-declaration
	var str = svgCanvasToString();
	call("saved", str);
};

// Function: rasterExport
// Generates a PNG Data URL based on the current image, then calls "exported" 
// with an object including the string and any issues found
this.rasterExport = function() {
	// remove the selected outline before serializing
	clearSelection();
	
	// Check for known CanVG issues 
	var issues = [];
	
	// Selector and notice
	var issue_list = {
		'feGaussianBlur': uiStrings.exportNoBlur,
		'foreignObject': uiStrings.exportNoforeignObject,
		'[stroke-dasharray]': uiStrings.exportNoDashArray
	};
	var content = $(svgcontent);
	
	// Add font/text check if Canvas Text API is not implemented
	if(!("font" in $('<canvas>')[0].getContext('2d'))) {
		issue_list['text'] = uiStrings.exportNoText;
	}
	
	$.each(issue_list, function(sel, descr) {
		if(content.find(sel).length) {
			issues.push(descr);
		}
	});

	var str = svgCanvasToString();
	call("exported", {svg: str, issues: issues});
};

// Function: getSvgString
// Returns the current drawing as raw SVG XML text.
//
// Returns:
// The current drawing as raw SVG XML text.
this.getSvgString = function() {
	save_options.apply = false;
	return svgCanvasToString();
};

//function randomizeIds
// This function determines whether to add a nonce to the prefix, when
// generating IDs in SVG-Edit
// 
//  Parameters:
//   an opional boolean, which, if true, adds a nonce to the prefix. Thus
//     svgCanvas.randomizeIds()  <==> svgCanvas.randomizeIds(true)
//
// if you're controlling SVG-Edit externally, and want randomized IDs, call
// this BEFORE calling svgCanvas.setSvgString
//
this.randomizeIds = function() {
   if (arguments.length > 0 && arguments[0] == false) {
	 randomize_ids = false;
	 if (extensions["Arrows"])  call("unsetarrownonce") ;
   } else {
	 randomize_ids = true;
	 if (!svgcontent.getAttributeNS(se_ns, 'nonce')) {
			svgcontent.setAttributeNS(se_ns, 'se:nonce', nonce); 
			if (extensions["Arrows"])  call("setarrownonce", nonce) ;
	 }
   }
}

// Function: uniquifyElems
// Ensure each element has a unique ID
//
// Parameters:
// g - The parent element of the tree to give unique IDs
var uniquifyElems = this.uniquifyElems = function(g) {
	var ids = {};
	walkTree(g, function(n) {
		// if it's an element node
		if (n.nodeType == 1) {
			// and the element has an ID
			if (n.id) {
				// and we haven't tracked this ID yet
				if (!(n.id in ids)) {
					// add this id to our map
					ids[n.id] = {elem:null, attrs:[], hrefs:[]};
				}
				ids[n.id]["elem"] = n;
			}
			
			// now search for all attributes on this element that might refer
			// to other elements
			$.each(["clip-path", "fill", "filter", "marker-end", "marker-mid", "marker-start", "mask", "stroke"],function(i,attr) {
				var attrnode = n.getAttributeNode(attr);
				if (attrnode) {
					// the incoming file has been sanitized, so we should be able to safely just strip off the leading #
					var url = getUrlFromAttr(attrnode.value),								
						refid = url ? url.substr(1) : null;
					if (refid) {
						if (!(refid in ids)) {
							// add this id to our map
							ids[refid] = {elem:null, attrs:[], hrefs:[]};
						}
						ids[refid]["attrs"].push(attrnode);
					}
				}
			});
			
			// check xlink:href now
			var href = getHref(n);
			// TODO: what if an <image> or <a> element refers to an element internally?
			if(href && 
				$.inArray(n.nodeName, ["filter", "linearGradient", "pattern", 
							 "radialGradient", "textPath", "use"]) != -1)
			{
				var refid = href.substr(1);
				if (!(refid in ids)) {
					// add this id to our map
					ids[refid] = {elem:null, attrs:[], hrefs:[]};
				}
				ids[refid]["hrefs"].push(n);
			}						
		}
	});
	
	// in ids, we now have a map of ids, elements and attributes, let's re-identify
	for (var oldid in ids) {
		var elem = ids[oldid]["elem"];
		if (elem) {
			var newid = getNextId();
			// manually increment obj_num because our cloned elements are not in the DOM yet
			obj_num++;
			
			// assign element its new id
			elem.id = newid;
			
			// remap all url() attributes
			var attrs = ids[oldid]["attrs"];
			var j = attrs.length;
			while (j--) {
				var attr = attrs[j];
				attr.ownerElement.setAttribute(attr.name, "url(#" + newid + ")");
			}
			
			// remap all href attributes
			var hreffers = ids[oldid]["hrefs"];
			var k = hreffers.length;
			while (k--) {
				var hreffer = hreffers[k];
				setHref(hreffer, "#"+newid);
			}
		}
	}
	
	// manually increment obj_num because our cloned elements are not in the DOM yet
	obj_num++;
}

// Function: convertToGroup
// Converts selected/given <use> or child SVG element to a group
var convertToGroup = this.convertToGroup = function(elem) {
	if(!elem) {
		elem = selectedElements[0];
	}
	var $elem = $(elem);
	
	var batchCmd = new BatchCommand();
	
	var ts;
	
	if($elem.data('gsvg')) {
		// Use the gsvg as the new group
		var svg = elem.firstChild;
		var pt = $(svg).attr(['x', 'y']);
		
		$(elem.firstChild.firstChild).unwrap();
		$(elem).removeData('gsvg');
		
		var tlist = getTransformList(elem);
		var xform = svgroot.createSVGTransform();
		xform.setTranslate(pt.x, pt.y);
		tlist.appendItem(xform);
		recalculateDimensions(elem);
		call("selected", [elem]);
	} else if($elem.data('symbol')) {
		elem = $elem.data('symbol');
		
		ts = $elem.attr('transform');
		var pos = $elem.attr(['x','y']);
		
		// Not ideal, but works
		ts += "translate(" + pos.x + "," + pos.y + ")";
		
		var prev = $elem.prev();
		
		// Remove <use> element
		batchCmd.addSubCommand(new RemoveElementCommand($elem[0], $elem[0].parentNode));
		$elem.remove();
		
		// See if other elements reference this symbol
		var has_more = $(svgcontent).find('use:data(symbol)').length;
			
		var g = svgdoc.createElementNS(svgns, "g");
		var childs = elem.childNodes;
		
		for(var i = 0; i < childs.length; i++) {
			g.appendChild(childs[i].cloneNode(true));
		}
		
// 		while (elem.hasChildNodes())
// 			g.appendChild(elem.firstChild.cloneNode(true));
		if (ts)
			g.setAttribute("transform", ts);
		
		var parent = elem.parentNode;
		
		uniquifyElems(g);
	
		// now give the g itself a new id
		g.id = getNextId();
		
		prev.after(g);
		
		if(parent) {
			if(!has_more) {
				// remove symbol/svg element
				parent.removeChild(elem);
				batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
			}
			batchCmd.addSubCommand(new InsertElementCommand(g));
		}
	
		// recalculate dimensions on the top-level children so that unnecessary transforms
		// are removed
		walkTreePost(g, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
		
		// Give ID for any visible element missing one
		$(g).find(visElems).each(function() {
			if(!this.id) this.id = getNextId();
		});
		
		clearSelection();
		addToSelection([g]);
		
		addCommandToHistory(batchCmd);
		
	} else {
		console.log('Unexpected element to ungroup:', elem);
	}
}

//   
// Function: setSvgString
// This function sets the current drawing as the input SVG XML.
//
// Parameters:
// xmlString - The SVG as XML text.
//
// Returns:
// This function returns false if the set was unsuccessful, true otherwise.
this.setSvgString = function(xmlString) {
	try {
		// convert string into XML document
		var newDoc = Utils.text2xml(xmlString);
		// run it through our sanitizer to remove anything we do not support
		sanitizeSvg(newDoc.documentElement);

		var batchCmd = new BatchCommand("Change Source");

		// remove old svg document
		var oldzoom = svgroot.removeChild(svgcontent);
		batchCmd.addSubCommand(new RemoveElementCommand(oldzoom, svgroot));
	
		// set new svg document
		svgcontent = svgroot.appendChild(svgdoc.importNode(newDoc.documentElement, true));
		
		var content = $(svgcontent);
		
		// retrieve or set the nonce
		n = svgcontent.getAttributeNS(se_ns, 'nonce');
		if (n) {
			randomize_ids = true;
			nonce = n;
			if (extensions["Arrows"])  call("setarrownonce", n) ;
		} else if (randomize_ids) {
			svgcontent.setAttributeNS(xmlnsns, 'xmlns:se', se_ns);
			svgcontent.setAttributeNS(se_ns, 'se:nonce', nonce); 
			if (extensions["Arrows"])  call("setarrownonce", nonce) ;
		}         
		// change image href vals if possible
		content.find('image').each(function() {
			var image = this;
			preventClickDefault(image);
			var val = getHref(this);
			if(val.indexOf('data:') === 0) {
				// Check if an SVG-edit data URI
				var m = val.match(/svgedit_url=(.*?);/);
				if(m) {
					var url = decodeURIComponent(m[1]);
					$(new Image()).load(function() {
						image.setAttributeNS(xlinkns,'xlink:href',url);
					}).attr('src',url);
				}
			}
			// Add to encodableImages if it loads
			canvas.embedImage(val);
		});
	
		// Wrap child SVGs in group elements
		content.find('svg').each(function() {
			// Skip if it's in a <defs>
			if($(this).closest('defs').length) return;
		
			uniquifyElems(this);
		
			// Check if it already has a gsvg group
			var pa = this.parentNode;
			if(pa.childNodes.length === 1 && pa.nodeName === 'g') {
				$(pa).data('gsvg', this);
				pa.id = pa.id || getNextId();
			} else {
				groupSvgElem(this);
			}
		});
		
		// Set ref element for <use> elements
		content.find('use').each(function() {
			var id = getHref(this).substr(1);
			var ref_elem = getElem(id);
			$(this).data('ref', ref_elem);
			if(ref_elem.tagName == 'symbol' || ref_elem.tagName == 'svg') {
				$(this).data('symbol', ref_elem);
			}
		});
		
		// convert gradients with userSpaceOnUse to objectBoundingBox
		content.find('linearGradient, radialGradient').each(function() {
			var grad = this;
			if($(grad).attr('gradientUnits') === 'userSpaceOnUse') {
				// TODO: Support more than one element with this ref by duplicating parent grad
				var elems = $(svgcontent).find('[fill=url(#' + grad.id + ')],[stroke=url(#' + grad.id + ')]');
				if(!elems.length) return;
				
				// get object's bounding box
				var bb = elems[0].getBBox();
				
				if(grad.tagName === 'linearGradient') {
					var g_coords = $(grad).attr(['x1', 'y1', 'x2', 'y2']);
					
					$(grad).attr({
						x1: (g_coords.x1 - bb.x) / bb.width,
						y1: (g_coords.y1 - bb.y) / bb.height,
						x2: (g_coords.x2 - bb.x) / bb.width,
						y2: (g_coords.y1 - bb.y) / bb.height
					});
					
					grad.removeAttribute('gradientUnits');
				} else {
					// Note: radialGradient elements cannot be easily converted 
					// because userSpaceOnUse will keep circular gradients, while
					// objectBoundingBox will x/y scale the gradient according to
					// its bbox. 
					
					// For now we'll do nothing, though we should probably have
					// the gradient be updated as the element is moved, as 
					// inkscape/illustrator do.
				
//         				var g_coords = $(grad).attr(['cx', 'cy', 'r']);
//         				
// 						$(grad).attr({
// 							cx: (g_coords.cx - bb.x) / bb.width,
// 							cy: (g_coords.cy - bb.y) / bb.height,
// 							r: g_coords.r
// 						});
// 						
// 	        			grad.removeAttribute('gradientUnits');
				}
				

			}
		});
		
		// recalculate dimensions on the top-level children so that unnecessary transforms
		// are removed
		walkTreePost(svgcontent, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
		
		var attrs = {
			id: 'svgcontent',
			overflow: curConfig.show_outside_canvas?'visible':'hidden'
		};
		
		var percs = false;
		
		// determine proper size
		if (content.attr("viewBox")) {
			var vb = content.attr("viewBox").split(' ');
			attrs.width = vb[2];
			attrs.height = vb[3];
		}
		// handle content that doesn't have a viewBox
		else {
			$.each(['width', 'height'], function(i, dim) {
				// Set to 100 if not given
				var val = content.attr(dim);
				
				if(!val) val = '100%';
				
				if((val+'').substr(-1) === "%") {
					// Use user units if percentage given
					percs = true;
				} else {
					attrs[dim] = convertToNum(dim, val);
				}
			});
		}
		
		// identify layers
		identifyLayers();
		
		// Give ID for any visible layer children missing one
		content.children().find(visElems).each(function() {
			if(!this.id) this.id = getNextId();
		});
		
		// Percentage width/height, so let's base it on visible elements
		if(percs) {
			var bb = getStrokedBBox();
			attrs.width = bb.width + bb.x;
			attrs.height = bb.height + bb.y;
		}
		
		// Just in case negative numbers are given or 
		// result from the percs calculation
		if(attrs.width <= 0) attrs.width = 100;
		if(attrs.height <= 0) attrs.height = 100;
		
		content.attr(attrs);
		this.contentW = attrs['width'];
		this.contentH = attrs['height'];
		
		batchCmd.addSubCommand(new InsertElementCommand(svgcontent));
		// update root to the correct size
		var changes = content.attr(["width", "height"]);
		batchCmd.addSubCommand(new ChangeElementCommand(svgroot, changes));
		
		// reset zoom
		current_zoom = 1;
		
		// reset transform lists
		svgTransformLists = {};
		clearSelection();
		pathActions.clearData();
		svgroot.appendChild(selectorManager.selectorParentGroup);
		
		addCommandToHistory(batchCmd);
		call("changed", [svgcontent]);
	} catch(e) {
		console.log(e);
		return false;
	}

	return true;
};

// Function: importSvgString
// This function imports the input SVG XML as a <symbol> in the <defs>, then adds a
// <use> to the current layer.
//
// Parameters:
// xmlString - The SVG as XML text.
//
// Returns:
// This function returns false if the import was unsuccessful, true otherwise.
// TODO: 
// * properly handle if namespace is introduced by imported content (must add to svgcontent
// and update all prefixes in the imported node)
// * properly handle recalculating dimensions, recalculateDimensions() doesn't handle
// arbitrary transform lists, but makes some assumptions about how the transform list 
// was obtained
// * import should happen in top-left of current zoomed viewport	
this.importSvgString = function(xmlString) {
	try {
		// convert string into XML document
		var newDoc = Utils.text2xml(xmlString);
		// run it through our sanitizer to remove anything we do not support
		sanitizeSvg(newDoc.documentElement);

		var batchCmd = new BatchCommand("Change Source");

		// import new svg document into our document
		var svg = svgdoc.importNode(newDoc.documentElement, true);
		
		var innerw = convertToNum('width', svg.getAttribute("width")),
			innerh = convertToNum('height', svg.getAttribute("height")),
			innervb = svg.getAttribute("viewBox"),
			// if no explicit viewbox, create one out of the width and height
			vb = innervb ? innervb.split(" ") : [0,0,innerw,innerh];
		for (var j = 0; j < 4; ++j)
			vb[j] = Number(vb[j]);

		// TODO: properly handle preserveAspectRatio
		var canvasw = Number(svgcontent.getAttribute("width")),
			canvash = Number(svgcontent.getAttribute("height"));
		// imported content should be 1/3 of the canvas on its largest dimension
		
		if (innerh > innerw) {
			var ts = "scale(" + (canvash/3)/vb[3] + ")";
		}
		else {
			var ts = "scale(" + (canvash/3)/vb[2] + ")";
		}
		
		// Hack to make recalculateDimensions understand how to scale
		ts = "translate(0) " + ts + " translate(0)";
		
		// Uncomment this once Firefox has fixed their symbol bug:
		// https://bugzilla.mozilla.org/show_bug.cgi?id=353575
// 		var symbol = svgdoc.createElementNS(svgns, "symbol");
// 		while (svg.firstChild) {
// 			symbol.appendChild(svg.firstChild);
// 		}
// 		var attrs = svg.attributes;
// 		for(var i=0; i < attrs.length; i++) {
// 			var attr = attrs[i];
// 			symbol.setAttribute(attr.nodeName, attr.nodeValue);
// 		}
		var symbol = svg;
		symbol.id = getNextId();
		
		var use_el = svgdoc.createElementNS(svgns, "use");
		setHref(use_el, "#" + symbol.id);
		findDefs().appendChild(symbol);
		current_layer.appendChild(use_el);
		use_el.id = getNextId();
		clearSelection();
		
		use_el.setAttribute("transform", ts);
		recalculateDimensions(use_el);
		$(use_el).data('symbol', symbol);
		addToSelection([use_el]);
		return true;

		
		// TODO: Find way to add this in a recalculateDimensions-parsable way
// 				if (vb[0] != 0 || vb[1] != 0)
// 					ts = "translate(" + (-vb[0]) + "," + (-vb[1]) + ") " + ts;


	} catch(e) {
		console.log(e);
		return false;
	}

	return true;
};


// Layer API Functions

// Group: Layers

// Function: identifyLayers
// Updates layer system
var identifyLayers = function() {
	all_layers = [];
	var numchildren = svgcontent.childNodes.length;
	// loop through all children of svgcontent
	var orphans = [], layernames = [];
	for (var i = 0; i < numchildren; ++i) {
		var child = svgcontent.childNodes.item(i);
		// for each g, find its layer name
		if (child && child.nodeType == 1) {
			if (child.tagName == "g") {
				var name = $("title",child).text();
				
				// Hack for Opera 10.60
				if(!name && isOpera && child.querySelectorAll) {
					name = $(child.querySelectorAll('title')).text();
				}

				// store layer and name in global variable
				if (name) {
					layernames.push(name);
					all_layers.push( [name,child] );
					current_layer = child;
					walkTree(child, function(e){e.setAttribute("style", "pointer-events:inherit");});
					current_layer.setAttribute("style", "pointer-events:none");
				}
				// if group did not have a name, it is an orphan
				else {
					orphans.push(child);
				}
			}
			// if child has a bbox (i.e. not a <title> or <defs> element), then it is an orphan
			else if(getBBox(child) && child.nodeName != 'defs') { // Opera returns a BBox for defs
				var bb = getBBox(child);
				orphans.push(child);
			}
		}
	}
	// create a new layer and add all the orphans to it
	if (orphans.length > 0) {
		var i = 1;
		while ($.inArray(("Layer " + i), layernames) != -1) { i++; }
		var newname = "Layer " + i;
		current_layer = svgdoc.createElementNS(svgns, "g");
		var layer_title = svgdoc.createElementNS(svgns, "title");
		layer_title.textContent = newname;
		current_layer.appendChild(layer_title);
		for (var j = 0; j < orphans.length; ++j) {
			current_layer.appendChild(orphans[j]);
		}
		current_layer = svgcontent.appendChild(current_layer);
		all_layers.push( [newname, current_layer] );
	}
	walkTree(current_layer, function(e){e.setAttribute("style","pointer-events:inherit");});
	current_layer.setAttribute("style","pointer-events:all");
};

// Function: createLayer
// Creates a new top-level layer in the drawing with the given name, sets the current layer 
// to it, and then clears the selection  This function then calls the 'changed' handler.
// This is an undoable action.
//
// Parameters:
// name - The given name
this.createLayer = function(name) {
	var batchCmd = new BatchCommand("Create Layer");
	var new_layer = svgdoc.createElementNS(svgns, "g");
	var layer_title = svgdoc.createElementNS(svgns, "title");
	layer_title.textContent = name;
	new_layer.appendChild(layer_title);
	new_layer = svgcontent.appendChild(new_layer);
	batchCmd.addSubCommand(new InsertElementCommand(new_layer));
	addCommandToHistory(batchCmd);
	clearSelection();
	identifyLayers();
	canvas.setCurrentLayer(name);
	call("changed", [new_layer]);
};

// Function: cloneLayer
// Creates a new top-level layer in the drawing with the given name, copies all the current layer's contents
// to it, and then clears the selection  This function then calls the 'changed' handler.
// This is an undoable action.
//
// Parameters:
// name - The given name
this.cloneLayer = function(name) {
	var batchCmd = new BatchCommand("Duplicate Layer");
	var new_layer = svgdoc.createElementNS(svgns, "g");
	var layer_title = svgdoc.createElementNS(svgns, "title");
	layer_title.textContent = name;
	new_layer.appendChild(layer_title);
	$(current_layer).after(new_layer);
	var childs = current_layer.childNodes;
	for(var i = 0; i < childs.length; i++) {
		var ch = childs[i];
		if(ch.localName == 'title') continue;
		new_layer.appendChild(copyElem(ch));
	}
	
	clearSelection();
	identifyLayers();

	batchCmd.addSubCommand(new InsertElementCommand(new_layer));
	addCommandToHistory(batchCmd);
	canvas.setCurrentLayer(name);
	call("changed", [new_layer]);
};

// Function: deleteCurrentLayer
// Deletes the current layer from the drawing and then clears the selection. This function 
// then calls the 'changed' handler.  This is an undoable action.
this.deleteCurrentLayer = function() {
	if (current_layer && all_layers.length > 1) {
		var batchCmd = new BatchCommand("Delete Layer");
		// actually delete from the DOM and store in our Undo History
		var parent = current_layer.parentNode;
		batchCmd.addSubCommand(new RemoveElementCommand(current_layer, parent));
		parent.removeChild(current_layer);
		addCommandToHistory(batchCmd);
		clearSelection();
		identifyLayers();
		canvas.setCurrentLayer(all_layers[all_layers.length-1][0]);
		call("changed", [svgcontent]);
		return true;
	}
	return false;
};

// Function: hasLayer
// Check if layer with given name already exists
this.hasLayer = function(name) {
	for(var i = 0; i < all_layers.length; i++) {
		if(all_layers[i][0] == name) return true;
	}
	return false;
};

// Function: getNumLayers
// Returns the number of layers in the current drawing.
// 
// Returns:
// The number of layers in the current drawing.
this.getNumLayers = function() {
	return all_layers.length;
};

// Function: getLayer
// Returns the name of the ith layer. If the index is out of range, an empty string is returned.
//
// Parameters:
// i - the zero-based index of the layer you are querying.
// 
// Returns:
// The name of the ith layer
this.getLayer = function(i) {
	if (i >= 0 && i < canvas.getNumLayers()) {
		return all_layers[i][0];
	}
	return "";
};

// Function: getCurrentLayer
// Returns the name of the currently selected layer. If an error occurs, an empty string 
// is returned.
//
// Returns:
// The name of the currently active layer.
this.getCurrentLayer = function() {
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][1] == current_layer) {
			return all_layers[i][0];
		}
	}
	return "";
};

// Function: setCurrentLayer
// Sets the current layer. If the name is not a valid layer name, then this function returns
// false. Otherwise it returns true. This is not an undo-able action.
//
// Parameters:
// name - the name of the layer you want to switch to.
//
// Returns:
// true if the current layer was switched, otherwise false
this.setCurrentLayer = function(name) {
	name = Utils.toXml(name);
	for (var i = 0; i < all_layers.length; ++i) {
		if (name == all_layers[i][0]) {
			if (current_layer != all_layers[i][1]) {
				clearSelection();
				current_layer.setAttribute("style", "pointer-events:none");
				current_layer = all_layers[i][1];
				current_layer.setAttribute("style", "pointer-events:all");
			}
			return true;
		}
	}
	return false;
};

// Function: renameCurrentLayer
// Renames the current layer. If the layer name is not valid (i.e. unique), then this function 
// does nothing and returns false, otherwise it returns true. This is an undo-able action.
// 
// Parameters:
// newname - the new name you want to give the current layer.  This name must be unique 
// among all layer names.
//
// Returns:
// true if the rename succeeded, false otherwise.
this.renameCurrentLayer = function(newname) {
	if (current_layer) {
		var oldLayer = current_layer;
		// setCurrentLayer will return false if the name doesn't already exists
		if (!canvas.setCurrentLayer(newname)) {
			var batchCmd = new BatchCommand("Rename Layer");
			// find the index of the layer
			for (var i = 0; i < all_layers.length; ++i) {
				if (all_layers[i][1] == oldLayer) break;
			}
			var oldname = all_layers[i][0];
			all_layers[i][0] = Utils.toXml(newname);
		
			// now change the underlying title element contents
			var len = oldLayer.childNodes.length;
			for (var i = 0; i < len; ++i) {
				var child = oldLayer.childNodes.item(i);
				// found the <title> element, now append all the
				if (child && child.tagName == "title") {
					// wipe out old name 
					while (child.firstChild) { child.removeChild(child.firstChild); }
					child.textContent = newname;

					batchCmd.addSubCommand(new ChangeElementCommand(child, {"#text":oldname}));
					addCommandToHistory(batchCmd);
					call("changed", [oldLayer]);
					return true;
				}
			}
		}
		current_layer = oldLayer;
	}
	return false;
};

// Function: setCurrentLayerPosition
// Changes the position of the current layer to the new value. If the new index is not valid, 
// this function does nothing and returns false, otherwise it returns true. This is an
// undo-able action.
//
// Parameters:
// newpos - The zero-based index of the new position of the layer.  This should be between
// 0 and (number of layers - 1)
// 
// Returns:
// true if the current layer position was changed, false otherwise.
this.setCurrentLayerPosition = function(newpos) {
	if (current_layer && newpos >= 0 && newpos < all_layers.length) {
		for (var oldpos = 0; oldpos < all_layers.length; ++oldpos) {
			if (all_layers[oldpos][1] == current_layer) break;
		}
		// some unknown error condition (current_layer not in all_layers)
		if (oldpos == all_layers.length) { return false; }
		
		if (oldpos != newpos) {
			// if our new position is below us, we need to insert before the node after newpos
			var refLayer = null;
			var oldNextSibling = current_layer.nextSibling;
			if (newpos > oldpos ) {
				if (newpos < all_layers.length-1) {
					refLayer = all_layers[newpos+1][1];
				}
			}
			// if our new position is above us, we need to insert before the node at newpos
			else {
				refLayer = all_layers[newpos][1];
			}
			svgcontent.insertBefore(current_layer, refLayer);
			addCommandToHistory(new MoveElementCommand(current_layer, oldNextSibling, svgcontent));
			
			identifyLayers();
			canvas.setCurrentLayer(all_layers[newpos][0]);
			
			return true;
		}
	}
	
	return false;
};

// Function: getLayerVisibility
// Returns whether the layer is visible.  If the layer name is not valid, then this function
// returns false.
//
// Parameters:
// layername - the name of the layer which you want to query.
//
// Returns:
// The visibility state of the layer, or false if the layer name was invalid.
this.getLayerVisibility = function(layername) {
	// find the layer
	var layer = null;
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][0] == layername) {
			layer = all_layers[i][1];
			break;
		}
	}
	if (!layer) return false;
	return (layer.getAttribute("display") != "none");
};

// Function: setLayerVisibility
// Sets the visibility of the layer. If the layer name is not valid, this function return 
// false, otherwise it returns true. This is an undo-able action.
//
// Parameters:
// layername - the name of the layer to change the visibility
// bVisible - true/false, whether the layer should be visible
//
// Returns:
// true if the layer's visibility was set, false otherwise
this.setLayerVisibility = function(layername, bVisible) {
	// find the layer
	var layer = null;
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][0] == layername) {
			layer = all_layers[i][1];
			break;
		}
	}
	if (!layer) return false;
	
	var oldDisplay = layer.getAttribute("display");
	if (!oldDisplay) oldDisplay = "inline";
	layer.setAttribute("display", bVisible ? "inline" : "none");
	addCommandToHistory(new ChangeElementCommand(layer, {"display":oldDisplay}, "Layer Visibility"));
	
	if (layer == current_layer) {
		clearSelection();
		pathActions.clear();
	}
//		call("changed", [selected]);
	
	return true;
};

// Function: moveSelectedToLayer
// Moves the selected elements to layername. If the name is not a valid layer name, then false 
// is returned.  Otherwise it returns true. This is an undo-able action.
//
// Parameters:
// layername - the name of the layer you want to which you want to move the selected elements
//
// Returns:
// true if the selected elements were moved to the layer, false otherwise.
this.moveSelectedToLayer = function(layername) {
	// find the layer
	var layer = null;
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][0] == layername) {
			layer = all_layers[i][1];
			break;
		}
	}
	if (!layer) return false;
	
	var batchCmd = new BatchCommand("Move Elements to Layer");
	
	// loop for each selected element and move it
	var selElems = selectedElements;
	var i = selElems.length;
	while (i--) {
		var elem = selElems[i];
		if (!elem) continue;
		var oldNextSibling = elem.nextSibling;
		// TODO: this is pretty brittle!
		var oldLayer = elem.parentNode;
		layer.appendChild(elem);
		batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldLayer));
	}
	
	addCommandToHistory(batchCmd);
	
	return true;
};

this.mergeLayer = function(skipHistory) {
	var batchCmd = new BatchCommand("Merge Layer");
	var prev = $(current_layer).prev()[0];
	if(!prev) return;
	var childs = current_layer.childNodes;
	var len = childs.length;
	batchCmd.addSubCommand(new RemoveElementCommand(current_layer, svgcontent));

	while(current_layer.firstChild) {
		var ch = current_layer.firstChild;
		if(ch.localName == 'title') {
			batchCmd.addSubCommand(new RemoveElementCommand(ch, current_layer));
			current_layer.removeChild(ch);
			continue;
		}
		var oldNextSibling = ch.nextSibling;
		prev.appendChild(ch);
		batchCmd.addSubCommand(new MoveElementCommand(ch, oldNextSibling, current_layer));
	}
	
	// Remove current layer
	svgcontent.removeChild(current_layer);
	
	if(!skipHistory) {
		clearSelection();
		identifyLayers();

		call("changed", [svgcontent]);
		
		addCommandToHistory(batchCmd);
	}
	
	current_layer = prev;
	return batchCmd;
}

this.mergeAllLayers = function() {
	var batchCmd = new BatchCommand("Merge all Layers");
	current_layer = all_layers[all_layers.length-1][1];
	while($(svgcontent).children('g').length > 1) {
		batchCmd.addSubCommand(canvas.mergeLayer(true));
	}
	
	clearSelection();
	identifyLayers();
	call("changed", [svgcontent]);
	addCommandToHistory(batchCmd);
}

// Function: getLayerOpacity
// Returns the opacity of the given layer.  If the input name is not a layer, null is returned.
//
// Parameters: 
// layername - name of the layer on which to get the opacity
//
// Returns:
// The opacity value of the given layer.  This will be a value between 0.0 and 1.0, or null
// if layername is not a valid layer
this.getLayerOpacity = function(layername) {
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][0] == layername) {
			var g = all_layers[i][1];
			var opacity = g.getAttribute("opacity");
			if (!opacity) {
				opacity = "1.0";
			}
			return parseFloat(opacity);
		}
	}
	
	return null;
};

// Function: setLayerOpacity
// Sets the opacity of the given layer.  If the input name is not a layer, nothing happens.
// This is not an undo-able action.  NOTE: this function exists solely to apply
// a highlighting/de-emphasis effect to a layer, when it is possible for a user to affect
// the opacity of a layer, we will need to allow this function to produce an undo-able action.
// If opacity is not a value between 0.0 and 1.0, then nothing happens.
//
// Parameters:
// layername - name of the layer on which to set the opacity
// opacity - a float value in the range 0.0-1.0
this.setLayerOpacity = function(layername, opacity) {
	if (opacity < 0.0 || opacity > 1.0) return;
	for (var i = 0; i < all_layers.length; ++i) {
		if (all_layers[i][0] == layername) {
			var g = all_layers[i][1];
			g.setAttribute("opacity", opacity);
			break;
		}
	}
};

// Group: Document functions

// Function: clear
// Clears the current document.  This is not an undoable action.
this.clear = function() {
	pathActions.clear();

	// clear the svgcontent node
	var nodes = svgcontent.childNodes;
	var len = svgcontent.childNodes.length;
	var i = 0;
	clearSelection();
	for(var rep = 0; rep < len; rep++){
		if (nodes[i].nodeType == 1) { // element node
			svgcontent.removeChild(nodes[i]);
		} else {
			i++;
		}
	}
	// create empty first layer
	all_layers = [];
	canvas.createLayer("Layer 1");
	
	// clear the undo stack
	resetUndoStack();
	// reset the selector manager
	selectorManager.initGroup();
	// reset the rubber band box
	rubberBox = selectorManager.getRubberBandBox();
	call("cleared");
};

// Function: linkControlPoints
// Alias function
this.linkControlPoints = pathActions.linkControlPoints;

// Function: getContentElem
// Returns the content DOM element
this.getContentElem = function() { return svgcontent; };

// Function: getRootElem
// Returns the root DOM element
this.getRootElem = function() { return svgroot; };

// Function: getSelectedElems
// Returns the array with selected DOM elements
this.getSelectedElems = function() { return selectedElements; };

// Function: getResolution
// Returns the current dimensions and zoom level in an object
var getResolution = this.getResolution = function() {
// 		var vb = svgcontent.getAttribute("viewBox").split(' ');
// 		return {'w':vb[2], 'h':vb[3], 'zoom': current_zoom};
		
	return {
		'w':svgcontent.getAttribute("width")/current_zoom,
		'h':svgcontent.getAttribute("height")/current_zoom,
		'zoom': current_zoom
	};
};

// Function: getZoom
// Returns the current zoom level
this.getZoom = function(){return current_zoom;};

// Function: getVersion
// Returns a string which describes the revision number of SvgCanvas.
this.getVersion = function() {
	return "svgcanvas.js ($Rev$)";
};

// Function: setUiStrings
// Update interface strings with given values
//
// Parameters:
// strs - Object with strings (see uiStrings for examples)
this.setUiStrings = function(strs) {
	$.extend(uiStrings, strs);
}

// Function: setConfig
// Update configuration options with given values
//
// Parameters:
// opts - Object with options (see curConfig for examples)
this.setConfig = function(opts) {
	$.extend(curConfig, opts);
}

// Function: getDocumentTitle
// Returns the current group/SVG's title contents
this.getTitle = function(elem) {
	elem = elem || selectedElements[0];
	if(!elem) return;
	elem = $(elem).data('gsvg') || $(elem).data('symbol') || elem;
	var childs = elem.childNodes;
	for (var i=0; i<childs.length; i++) {
		if(childs[i].nodeName == 'title') {
			return childs[i].textContent;
		}
	}
	return '';
}

// Function: getHref
// Returns the given element's xlink:href value
var getHref = this.getHref = function(elem) {
	return elem.getAttributeNS(xlinkns, "href");
}

// Function: setHref
// Sets the given element's xlink:href value
var setHref = this.setHref = function(elem, val) {
	elem.setAttributeNS(xlinkns, "xlink:href", val);
}


// Function: setGroupTitle
// Sets the group/SVG's title content
// TODO: Combine this with setDocumentTitle
this.setGroupTitle = function(val) {
	var elem = selectedElements[0];
	elem = $(elem).data('gsvg') || elem;
	
	var ts = $(elem).children('title');
	
	var batchCmd = new BatchCommand("Set Label");
	
	if(!val.length) {
		// Remove title element
		batchCmd.addSubCommand(new RemoveElementCommand(ts[0], elem));
		ts.remove();
	} else if(ts.length) {
		// Change title contents
		var title = ts[0];
		batchCmd.addSubCommand(new ChangeElementCommand(title, {'#text': title.textContent}));
		title.textContent = val;
	} else {
		// Add title element
		title = svgdoc.createElementNS(svgns, "title");
		title.textContent = val;
		$(elem).prepend(title);
		batchCmd.addSubCommand(new InsertElementCommand(title));
	}

	addCommandToHistory(batchCmd);
}

// Function: getDocumentTitle
// Returns the current document title or an empty string if not found
this.getDocumentTitle = function() {
	return canvas.getTitle(svgcontent);
}

// Function: setDocumentTitle
// Adds/updates a title element for the document with the given name.
// This is an undoable action
//
// Parameters:
// newtitle - String with the new title
this.setDocumentTitle = function(newtitle) {
	var childs = svgcontent.childNodes, doc_title = false, old_title = '';
	
	var batchCmd = new BatchCommand("Change Image Title");
	
	for (var i=0; i<childs.length; i++) {
		if(childs[i].nodeName == 'title') {
			doc_title = childs[i];
			old_title = doc_title.textContent;
			break;
		}
	}
	if(!doc_title) {
		doc_title = svgdoc.createElementNS(svgns, "title");
		svgcontent.insertBefore(doc_title, svgcontent.firstChild);
	} 
	
	if(newtitle.length) {
		doc_title.textContent = newtitle;
	} else {
		// No title given, so element is not necessary
		doc_title.parentNode.removeChild(doc_title);
	}
	batchCmd.addSubCommand(new ChangeElementCommand(doc_title, {'#text': old_title}));
	addCommandToHistory(batchCmd);
}

// Function: getEditorNS
// Returns the editor's namespace URL, optionally adds it to root element
//
// Parameters:
// add - Boolean to indicate whether or not to add the namespace value
this.getEditorNS = function(add) {
	if(add) {
		svgcontent.setAttribute('xmlns:se', se_ns);
	}
	return se_ns;
}

// Function: setResolution
// Changes the document's dimensions to the given size
//
// Parameters: 
// x - Number with the width of the new dimensions in user units. 
// Can also be the string "fit" to indicate "fit to content"
// y - Number with the height of the new dimensions in user units. 
//
// Returns:
// Boolean to indicate if resolution change was succesful. 
// It will fail on "fit to content" option with no content to fit to.
this.setResolution = function(x, y) {
	var res = getResolution();
	var w = res.w, h = res.h;
	var batchCmd;

	if(x == 'fit') {
		// Get bounding box
		var bbox = getStrokedBBox();
		
		if(bbox) {
			batchCmd = new BatchCommand("Fit Canvas to Content");
			var visEls = getVisibleElements();
			addToSelection(visEls);
			var dx = [], dy = [];
			$.each(visEls, function(i, item) {
				dx.push(bbox.x*-1);
				dy.push(bbox.y*-1);
			});
			
			var cmd = canvas.moveSelectedElements(dx, dy, true);
			batchCmd.addSubCommand(cmd);
			clearSelection();
			
			x = Math.round(bbox.width);
			y = Math.round(bbox.height);
		} else {
			return false;
		}
	}
	if (x != w || y != h) {
		var handle = svgroot.suspendRedraw(1000);
		if(!batchCmd) {
			batchCmd = new BatchCommand("Change Image Dimensions");
		}
		x = convertToNum('width', x);
		y = convertToNum('height', y);
		
		svgcontent.setAttribute('width', x);
		svgcontent.setAttribute('height', y);
		this.contentW = x;
		this.contentH = y;
		batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {"width":w, "height":h}));

		svgcontent.setAttribute("viewBox", [0, 0, x/current_zoom, y/current_zoom].join(' '));
		batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {"viewBox": ["0 0", w, h].join(' ')}));
	
		addCommandToHistory(batchCmd);
		svgroot.unsuspendRedraw(handle);
		call("changed", [svgcontent]);
	}
	return true;
};

// Function: getOffset
// Returns an object with x, y values indicating the svgcontent element's
// position in the editor's canvas.
this.getOffset = function() {
	return $(svgcontent).attr(['x', 'y']);
}

// Function: setBBoxZoom
// Sets the zoom level on the canvas-side based on the given value
// 
// Parameters:
// val - Bounding box object to zoom to or string indicating zoom option 
// editor_w - Integer with the editor's workarea box's width
// editor_h - Integer with the editor's workarea box's height
this.setBBoxZoom = function(val, editor_w, editor_h) {
	var spacer = .85;
	var bb;
	var calcZoom = function(bb) {
		if(!bb) return false;
		var w_zoom = Math.round((editor_w / bb.width)*100 * spacer)/100;
		var h_zoom = Math.round((editor_h / bb.height)*100 * spacer)/100;	
		var zoomlevel = Math.min(w_zoom,h_zoom);
		canvas.setZoom(zoomlevel);
		return {'zoom': zoomlevel, 'bbox': bb};
	}
	
	if(typeof val == 'object') {
		bb = val;
		if(bb.width == 0 || bb.height == 0) {
			var newzoom = bb.zoom?bb.zoom:current_zoom * bb.factor;
			canvas.setZoom(newzoom);
			return {'zoom': current_zoom, 'bbox': bb};
		}
		return calcZoom(bb);
	}

	switch (val) {
		case 'selection':
			if(!selectedElements[0]) return;
			var sel_elems = $.map(selectedElements, function(n){ if(n) return n; });
			bb = getStrokedBBox(sel_elems);
			break;
		case 'canvas':
			var res = getResolution();
			spacer = .95;
			bb = {width:res.w, height:res.h ,x:0, y:0};
			break;
		case 'content':
			bb = getStrokedBBox();
			break;
		case 'layer':
			bb = getStrokedBBox(getVisibleElements(current_layer));
			break;
		default:
			return;
	}
	return calcZoom(bb);
}

// Function: setZoom
// Sets the zoom to the given level
//
// Parameters:
// zoomlevel - Float indicating the zoom level to change to
this.setZoom = function(zoomlevel) {
	var res = getResolution();
	svgcontent.setAttribute("viewBox", "0 0 " + res.w/zoomlevel + " " + res.h/zoomlevel);
	current_zoom = zoomlevel;
	$.each(selectedElements, function(i, elem) {
		if(!elem) return;
		selectorManager.requestSelector(elem).resize();
	});
	pathActions.zoomChange();
	runExtensions("zoomChanged", zoomlevel);
}

// Function: getMode
// Returns the current editor mode string
this.getMode = function() {
	return current_mode;
};

// Function: setMode
// Sets the editor's mode to the given string
//
// Parameters:
// name - String with the new mode to change to
this.setMode = function(name) {
	pathActions.clear(true);
	textActions.clear();
	cur_properties = (selectedElements[0] && selectedElements[0].nodeName == 'text') ? cur_text : cur_shape;
	current_mode = name;
};

// Group: Element Styling

// Function: getColor
// Returns the current fill/stroke option
this.getColor = function(type) {
	return cur_properties[type];
};

// Function: setColor
// Change the current stroke/fill color/gradient value
// 
// Parameters:
// type - String indicating fill or stroke
// val - The value to set the stroke attribute to
// preventUndo - Boolean indicating whether or not this should be and undoable option
this.setColor = function(type, val, preventUndo) {
	cur_shape[type] = val;
	cur_properties[type + '_paint'] = {type:"solidColor"};
	var elems = [];
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName == "g")
				walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
			else {
				if(type == 'fill') {
					if(elem.tagName != "polyline" && elem.tagName != "line") {
						elems.push(elem);
					}
				} else {
					elems.push(elem);
				}
			}
		}
	}
	if (elems.length > 0) {
		if (!preventUndo) {
			changeSelectedAttribute(type, val, elems);
			call("changed", elems);
		} else 
			changeSelectedAttributeNoUndo(type, val, elems);
	}
}


// Function: findDefs
// Return the document's <defs> element, create it first if necessary
var findDefs = function() {
	var defs = svgcontent.getElementsByTagNameNS(svgns, "defs");
	if (defs.length > 0) {
		defs = defs[0];
	}
	else {
		// first child is a comment, so call nextSibling
		defs = svgcontent.insertBefore( svgdoc.createElementNS(svgns, "defs" ), svgcontent.firstChild.nextSibling);
	}
	return defs;
};

// Function: setGradient
// Apply the current gradient to selected element's fill or stroke
//
// Parameters
// type - String indicating "fill" or "stroke" to apply to an element
var setGradient = this.setGradient = function(type) {
	if(!cur_properties[type + '_paint'] || cur_properties[type + '_paint'].type == "solidColor") return;
	var grad = canvas[type + 'Grad'];
	// find out if there is a duplicate gradient already in the defs
	var duplicate_grad = findDuplicateGradient(grad);
	var defs = findDefs();
	// no duplicate found, so import gradient into defs
	if (!duplicate_grad) {
		var orig_grad = grad;
		grad = defs.appendChild( svgdoc.importNode(grad, true) );
		// get next id and set it on the grad
		grad.id = getNextId();
	}
	else { // use existing gradient
		grad = duplicate_grad;
	}
	canvas.setColor(type, "url(#" + grad.id + ")");
}

// Function: findDuplicateGradient
// Check if exact gradient already exists
//
// Parameters:
// grad - The gradient DOM element to compare to others
//
// Returns:
// The existing gradient if found, null if not
var findDuplicateGradient = function(grad) {
	var defs = findDefs();
	var existing_grads = $(defs).find("linearGradient, radialGradient");
	var i = existing_grads.length;
	var rad_attrs = ['r','cx','cy','fx','fy'];
	while (i--) {
		var og = existing_grads[i];
		if(grad.tagName == "linearGradient") {
			if (grad.getAttribute('x1') != og.getAttribute('x1') ||
				grad.getAttribute('y1') != og.getAttribute('y1') ||
				grad.getAttribute('x2') != og.getAttribute('x2') ||
				grad.getAttribute('y2') != og.getAttribute('y2')) 
			{
				continue;
			}
		} else {
			var grad_attrs = $(grad).attr(rad_attrs);
			var og_attrs = $(og).attr(rad_attrs);
			
			var diff = false;
			$.each(rad_attrs, function(i, attr) {
				if(grad_attrs[attr] != og_attrs[attr]) diff = true;
			});
			
			if(diff) continue;
		}
		
		// else could be a duplicate, iterate through stops
		var stops = grad.getElementsByTagNameNS(svgns, "stop");
		var ostops = og.getElementsByTagNameNS(svgns, "stop");

		if (stops.length != ostops.length) {
			continue;
		}

		var j = stops.length;
		while(j--) {
			var stop = stops[j];
			var ostop = ostops[j];

			if (stop.getAttribute('offset') != ostop.getAttribute('offset') ||
				stop.getAttribute('stop-opacity') != ostop.getAttribute('stop-opacity') ||
				stop.getAttribute('stop-color') != ostop.getAttribute('stop-color')) 
			{
				break;
			}
		}

		if (j == -1) {
			return og;
		}
	} // for each gradient in defs

	return null;
};

// Function: setPaint
// Set a color/gradient to a fill/stroke
//
// Parameters: 
// type - String with "fill" or "stroke"
// paint - The jGraduate paint object to apply
this.setPaint = function(type, paint) {
	// make a copy
	var p = new $.jGraduate.Paint(paint);
	this.setPaintOpacity(type, p.alpha/100, true);

	// now set the current paint object
	cur_properties[type + '_paint'] = p;
	switch ( p.type ) {
		case "solidColor":
			this.setColor(type, p.solidColor != "none" ? "#"+p.solidColor : "none");;
			break;
		case "linearGradient":
		case "radialGradient":
			canvas[type + 'Grad'] = p[p.type];
			setGradient(type);
			break;
		default:
//			console.log("none!");
	}
};


// this.setStrokePaint = function(p) {
// 	// make a copy
// 	var p = new $.jGraduate.Paint(p);
// 	this.setStrokeOpacity(p.alpha/100);
// 
// 	// now set the current paint object
// 	cur_properties.stroke_paint = p;
// 	switch ( p.type ) {
// 		case "solidColor":
// 			this.setColor('stroke', p.solidColor != "none" ? "#"+p.solidColor : "none");;
// 			break;
// 		case "linearGradient"
// 		case "radialGradient"
// 			canvas.strokeGrad = p[p.type];
// 			setGradient(type); 
// 		default:
// //			console.log("none!");
// 	}
// };
// 
// this.setFillPaint = function(p, addGrad) {
// 	// make a copy
// 	var p = new $.jGraduate.Paint(p);
// 	this.setFillOpacity(p.alpha/100, true);
// 
// 	// now set the current paint object
// 	cur_properties.fill_paint = p;
// 	if (p.type == "solidColor") {
// 		this.setColor('fill', p.solidColor != "none" ? "#"+p.solidColor : "none");
// 	}
// 	else if(p.type == "linearGradient") {
// 		canvas.fillGrad = p.linearGradient;
// 		if(addGrad) setGradient(); 
// 	}
// 	else if(p.type == "radialGradient") {
// 		canvas.fillGrad = p.radialGradient;
// 		if(addGrad) setGradient(); 
// 	}
// 	else {
// //			console.log("none!");
// 	}
// };

// Function: getStrokeWidth
// Returns the current stroke-width value
this.getStrokeWidth = function() {
	return cur_properties.stroke_width;
};

// Function: setStrokeWidth
// Sets the stroke width for the current selected elements
// When attempting to set a line's width to 0, this changes it to 1 instead
//
// Parameters:
// val - A Float indicating the new stroke width value
this.setStrokeWidth = function(val) {
	if(val == 0 && $.inArray(current_mode, ['line', 'path']) != -1) {
		canvas.setStrokeWidth(1);
		return;
	}
	cur_properties.stroke_width = val;
	
	var elems = [];
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName == "g")
				walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
			else 
				elems.push(elem);
		}
	}		
	if (elems.length > 0) {
		changeSelectedAttribute("stroke-width", val, elems);
		call("changed", selectedElements);
	}
};

// Function: setStrokeAttr
// Set the given stroke-related attribute the given value for selected elements
//
// Parameters:
// attr - String with the attribute name
// val - String or number with the attribute value
this.setStrokeAttr = function(attr, val) {
	cur_shape[attr.replace('-','_')] = val;
	var elems = [];
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName == "g")
				walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
			else 
				elems.push(elem);
		}
	}		
	if (elems.length > 0) {
		changeSelectedAttribute(attr, val, elems);
		call("changed", selectedElements);
	}
};

// Function: getStyle
// Returns current style options
this.getStyle = function() {
	return cur_shape;
}

// Function: getOpacity
// Returns the current opacity
this.getOpacity = function() {
	return cur_shape.opacity;
};

// Function: setOpacity
// Sets the given opacity to the current selected elements
this.setOpacity = function(val) {
	cur_shape.opacity = val;
	changeSelectedAttribute("opacity", val);
};

// Function: getOpacity
// Returns the current fill opacity
this.getFillOpacity = function() {
	return cur_shape.fill_opacity;
};

// Function: getStrokeOpacity
// Returns the current stroke opacity
this.getStrokeOpacity = function() {
	return cur_shape.stroke_opacity;
};

// Function: setPaintOpacity
// Sets the current fill/stroke opacity
//
// Parameters:
// type - String with "fill" or "stroke"
// val - Float with the new opacity value
// preventUndo - Boolean indicating whether or not this should be an undoable action
this.setPaintOpacity = function(type, val, preventUndo) {
	cur_shape[type + '_opacity'] = val;
	if (!preventUndo)
		changeSelectedAttribute(type + "-opacity", val);
	else
		changeSelectedAttributeNoUndo(type + "-opacity", val);
};

// Function: getBlur
// Gets the stdDeviation blur value of the given element
//
// Parameters:
// elem - The element to check the blur value for
this.getBlur = function(elem) {
	var val = 0;
// 		var elem = selectedElements[0];
	
	if(elem) {
		var filter_url = elem.getAttribute('filter');
		if(filter_url) {
			var blur = getElem(elem.id + '_blur');
			if(blur) {
				val = blur.firstChild.getAttribute('stdDeviation');
			}
		}
	}
	return val;
};

(function() {
	var cur_command = null;
	var filter = null;
	var filterHidden = false;
	
	// Function: setBlurNoUndo
	// Sets the stdDeviation blur value on the selected element without being undoable
	//
	// Parameters:
	// val - The new stdDeviation value
	canvas.setBlurNoUndo = function(val) {
		if(!filter) {
			canvas.setBlur(val);
			return;
		}
		if(val === 0) {
			// Don't change the StdDev, as that will hide the element.
			// Instead, just remove the value for "filter"
			changeSelectedAttributeNoUndo("filter", "");
			filterHidden = true;
		} else {
			if(filterHidden) {
				changeSelectedAttributeNoUndo("filter", 'url(#' + selectedElements[0].id + '_blur)');
			}
			changeSelectedAttributeNoUndo("stdDeviation", val, [filter.firstChild]);
			canvas.setBlurOffsets(filter, val);
		}
	}
	
	function finishChange() {
		var bCmd = canvas.finishUndoableChange();
		cur_command.addSubCommand(bCmd);
		addCommandToHistory(cur_command);
		cur_command = null;	
		filter = null;
	}

	// Function: setBlurOffsets
	// Sets the x, y, with, height values of the filter element in order to
	// make the blur not be clipped. Removes them if not neeeded
	//
	// Parameters:
	// filter - The filter DOM element to update
	// stdDev - The standard deviation value on which to base the offset size
	canvas.setBlurOffsets = function(filter, stdDev) {
		if(stdDev > 3) {
			// TODO: Create algorithm here where size is based on expected blur
			assignAttributes(filter, {
				x: '-50%',
				y: '-50%',
				width: '200%',
				height: '200%',
			}, 100);
		} else {
			filter.removeAttribute('x');
			filter.removeAttribute('y');
			filter.removeAttribute('width');
			filter.removeAttribute('height');
		}
	}

	// Function: setBlur 
	// Adds/updates the blur filter to the selected element
	//
	// Parameters:
	// val - Float with the new stdDeviation blur value
	// complete - Boolean indicating whether or not the action should be completed (to add to the undo manager)
	canvas.setBlur = function(val, complete) {
		if(cur_command) {
			finishChange();
			return;
		}
	
		// Looks for associated blur, creates one if not found
		var elem = selectedElements[0];
		var elem_id = elem.id;
		filter = getElem(elem_id + '_blur');
		
		val -= 0;
		
		var batchCmd = new BatchCommand();
		
		// Blur found!
		if(filter) {
			if(val === 0) {
				filter = null;
			}
		} else {
			// Not found, so create
			var newblur = addSvgElementFromJson({ "element": "feGaussianBlur",
				"attr": {
					"in": 'SourceGraphic',
					"stdDeviation": val
				}
			});
			
			filter = addSvgElementFromJson({ "element": "filter",
				"attr": {
					"id": elem_id + '_blur'
				}
			});
			
			filter.appendChild(newblur);
			findDefs().appendChild(filter);
			
			batchCmd.addSubCommand(new InsertElementCommand(filter));
		}

		var changes = {filter: elem.getAttribute('filter')};
		
		if(val === 0) {
			elem.removeAttribute("filter");
			batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
			return;
		} else {
			changeSelectedAttribute("filter", 'url(#' + elem_id + '_blur)');
			
			batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
			
			canvas.setBlurOffsets(filter, val);
		}
		
		cur_command = batchCmd;
		canvas.beginUndoableChange("stdDeviation", [filter?filter.firstChild:null]);
		if(complete) {
			canvas.setBlurNoUndo(val);
			finishChange();
		}
	};
}());

// Function: getBold
// Check whether selected element is bold or not
//
// Returns:
// Boolean indicating whether or not element is bold
this.getBold = function() {
	// should only have one element selected
	var selected = selectedElements[0];
	if (selected != null && selected.tagName  == "text" &&
		selectedElements[1] == null) 
	{
		return (selected.getAttribute("font-weight") == "bold");
	}
	return false;
};

// Function: setBold
// Make the selected element bold or normal
//
// Parameters:
// b - Boolean indicating bold (true) or normal (false)
this.setBold = function(b) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName  == "text" &&
		selectedElements[1] == null) 
	{
		changeSelectedAttribute("font-weight", b ? "bold" : "normal");
	}
	if(!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getItalic
// Check whether selected element is italic or not
//
// Returns:
// Boolean indicating whether or not element is italic
this.getItalic = function() {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName  == "text" &&
		selectedElements[1] == null) 
	{
		return (selected.getAttribute("font-style") == "italic");
	}
	return false;
};

// Function: setItalic
// Make the selected element italic or normal
//
// Parameters:
// b - Boolean indicating italic (true) or normal (false)
this.setItalic = function(i) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName  == "text" &&
		selectedElements[1] == null) 
	{
		changeSelectedAttribute("font-style", i ? "italic" : "normal");
	}
	if(!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getFontFamily
// Returns the current font family
this.getFontFamily = function() {
	return cur_text.font_family;
};

// Function: setFontFamily
// Set the new font family
//
// Parameters:
// val - String with the new font family
this.setFontFamily = function(val) {
	cur_text.font_family = val;
	changeSelectedAttribute("font-family", val);
	if(selectedElements[0] && !selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getFontSize
// Returns the current font size
this.getFontSize = function() {
	return cur_text.font_size;
};

// Function: setFontSize
// Applies the given font size to the selected element
//
// Parameters:
// val - Float with the new font size
this.setFontSize = function(val) {
	cur_text.font_size = val;
	changeSelectedAttribute("font-size", val);
	if(!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getText
// Returns the current text (textContent) of the selected element
this.getText = function() {
	var selected = selectedElements[0];
	if (selected == null) { return ""; }
	return selected.textContent;
};

// Function: setTextContent
// Updates the text element with the given string
//
// Parameters:
// val - String with the new text
this.setTextContent = function(val) {
	changeSelectedAttribute("#text", val);
	textActions.init(val);
	textActions.setCursor();
};

// Function: setImageURL
// Sets the new image URL for the selected image element. Updates its size if
// a new URL is given
// 
// Parameters:
// val - String with the image URL/path
this.setImageURL = function(val) {
	var elem = selectedElements[0];
	if(!elem) return;
	
	var attrs = $(elem).attr(['width', 'height']);
	var setsize = (!attrs.width || !attrs.height);

	var cur_href = getHref(elem);
	
	// Do nothing if no URL change or size change
	if(cur_href !== val) {
		setsize = true;
	} else if(!setsize) return;

	var batchCmd = new BatchCommand("Change Image URL");

	setHref(elem, val);
	batchCmd.addSubCommand(new ChangeElementCommand(elem, {
		"#href": cur_href
	}));

	if(setsize) {
		$(new Image()).load(function() {
			var changes = $(elem).attr(['width', 'height']);
		
			$(elem).attr({
				width: this.width,
				height: this.height
			});
			
			selectorManager.requestSelector(elem).resize();
			
			batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
			addCommandToHistory(batchCmd);
			call("changed", [elem]);
		}).attr('src',val);
	} else {
		addCommandToHistory(batchCmd);
	}
};

// Function: setRectRadius
// Sets the rx & ry values to the selected rect element to change its corner radius
// 
// Parameters:
// val - The new radius
this.setRectRadius = function(val) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName == "rect") {
		var r = selected.getAttribute("rx");
		if (r != val) {
			selected.setAttribute("rx", val);
			selected.setAttribute("ry", val);
			addCommandToHistory(new ChangeElementCommand(selected, {"rx":r, "ry":r}, "Radius"));
			call("changed", [selected]);
		}
	}
};

// Group: Element manipulation

// Function: setSegType
// Sets the new segment type to the selected segment(s). 
//
// Parameters:
// new_type - Integer with the new segment type
// See http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg for list
this.setSegType = function(new_type) {
	pathActions.setSegType(new_type);
}

// Function: convertToPath
// Convert selected element to a path, or get the BBox of an element-as-path
//
// Parameters: 
// elem - The DOM element to be converted
// getBBox - Boolean on whether or not to only return the path's BBox
//
// Returns:
// If the getBBox flag is true, the resulting path's bounding box object.
// Otherwise the resulting path element is returned.
this.convertToPath = function(elem, getBBox) {
	if(elem == null) {
		var elems = selectedElements;
		$.each(selectedElements, function(i, elem) {
			if(elem) canvas.convertToPath(elem);
		});
		return;
	}
	
	if(!getBBox) {
		var batchCmd = new BatchCommand("Convert element to Path");
	}
	
	var attrs = getBBox?{}:{
		"fill": cur_shape.fill,
		"fill-opacity": cur_shape.fill_opacity,
		"stroke": cur_shape.stroke,
		"stroke-width": cur_shape.stroke_width,
		"stroke-dasharray": cur_shape.stroke_dasharray,
		"stroke-linejoin": cur_shape.stroke_linejoin,
		"stroke-linecap": cur_shape.stroke_linecap,
		"stroke-opacity": cur_shape.stroke_opacity,
		"opacity": cur_shape.opacity,
		"visibility":"hidden"
	};
	
	// any attribute on the element not covered by the above
	// TODO: make this list global so that we can properly maintain it
	// TODO: what about @transform, @clip-rule, @fill-rule, etc?
	$.each(['marker-start', 'marker-end', 'marker-mid', 'filter', 'clip-path'], function() {
		if (elem.getAttribute(this)) {
			attrs[this] = elem.getAttribute(this);
		}
	});
	
	var path = addSvgElementFromJson({
		"element": "path",
		"attr": attrs
	});
	
	var eltrans = elem.getAttribute("transform");
	if(eltrans) {
		path.setAttribute("transform",eltrans);
	}
	
	var id = elem.id;
	var parent = elem.parentNode;
	if(elem.nextSibling) {
		parent.insertBefore(path, elem);
	} else {
		parent.appendChild(path);
	}
	
	var d = '';
	
	var joinSegs = function(segs) {
		$.each(segs, function(j, seg) {
			var l = seg[0], pts = seg[1];
			d += l;
			for(var i=0; i < pts.length; i+=2) {
				d += (pts[i] +','+pts[i+1]) + ' ';
			}
		});
	}

	// Possibly the cubed root of 6, but 1.81 works best
	var num = 1.81;

	switch (elem.tagName) {
	case 'ellipse':
	case 'circle':
		var a = $(elem).attr(['rx', 'ry', 'cx', 'cy']);
		var cx = a.cx, cy = a.cy, rx = a.rx, ry = a.ry;
		if(elem.tagName == 'circle') {
			rx = ry = $(elem).attr('r');
		}
	
		joinSegs([
			['M',[(cx-rx),(cy)]],
			['C',[(cx-rx),(cy-ry/num), (cx-rx/num),(cy-ry), (cx),(cy-ry)]],
			['C',[(cx+rx/num),(cy-ry), (cx+rx),(cy-ry/num), (cx+rx),(cy)]],
			['C',[(cx+rx),(cy+ry/num), (cx+rx/num),(cy+ry), (cx),(cy+ry)]],
			['C',[(cx-rx/num),(cy+ry), (cx-rx),(cy+ry/num), (cx-rx),(cy)]],
			['Z',[]]
		]);
		break;
	case 'path':
		d = elem.getAttribute('d');
		break;
	case 'line':
		var a = $(elem).attr(["x1", "y1", "x2", "y2"]);
		d = "M"+a.x1+","+a.y1+"L"+a.x2+","+a.y2;
		break;
	case 'polyline':
	case 'polygon':
		d = "M" + elem.getAttribute('points');
		break;
	case 'rect':
		var r = $(elem).attr(['rx', 'ry']);
		var rx = r.rx, ry = r.ry;
		var b = elem.getBBox();
		var x = b.x, y = b.y, w = b.width, h = b.height;
		var num = 4-num; // Why? Because!
		
		if(!rx && !ry) {
			// Regular rect
			joinSegs([
				['M',[x, y]],
				['L',[x+w, y]],
				['L',[x+w, y+h]],
				['L',[x, y+h]],
				['L',[x, y]],
				['Z',[]]
			]);
		} else {
			joinSegs([
				['M',[x, y+ry]],
				['C',[x,y+ry/num, x+rx/num,y, x+rx,y]],
				['L',[x+w-rx, y]],
				['C',[x+w-rx/num,y, x+w,y+ry/num, x+w,y+ry]],
				['L',[x+w, y+h-ry]],
				['C',[x+w, y+h-ry/num, x+w-rx/num,y+h, x+w-rx,y+h]],
				['L',[x+rx, y+h]],
				['C',[x+rx/num, y+h, x,y+h-ry/num, x,y+h-ry]],
				['L',[x, y+ry]],
				['Z',[]]
			]);
		}
		break;
	default:
		path.parentNode.removeChild(path);
		break;
	}
	
	if(d) {
		path.setAttribute('d',d);
	}
	
	if(!getBBox) {
		// Replace the current element with the converted one
		
		// Reorient if it has a matrix
		if(eltrans) {
			var tlist = getTransformList(path);
			if(hasMatrixTransform(tlist)) {
				pathActions.resetOrientation(path);
			}
		}
		
		batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
		batchCmd.addSubCommand(new InsertElementCommand(path));

		clearSelection();
		elem.parentNode.removeChild(elem)
		path.setAttribute('id', id);
		path.removeAttribute("visibility");
		addToSelection([path], true);
		
		addCommandToHistory(batchCmd);
		
	} else {
		// Get the correct BBox of the new path, then discard it
		pathActions.resetOrientation(path);
		var bb = false;
		try {
			bb = path.getBBox();
		} catch(e) {
			// Firefox fails
		}
		path.parentNode.removeChild(path);
		return bb;
	}
}


// Function: changeSelectedAttributeNoUndo
// This function makes the changes to the elements. It does not add the change
// to the history stack. 
// 
// Parameters:
// attr - String with the attribute name
// newValue - String or number with the new attribute value
// elems - The DOM elements to apply the change to
var changeSelectedAttributeNoUndo = function(attr, newValue, elems) {
	var handle = svgroot.suspendRedraw(1000);
	if(current_mode == 'pathedit') {
		// Editing node
		pathActions.moveNode(attr, newValue);
	}
	var elems = elems || selectedElements;
	var i = elems.length;
	while (i--) {
		var elem = elems[i];
		if (elem == null) continue;
		
		// Go into "select" mode for text changes
		if(current_mode === "textedit" && attr !== "#text" && elem.textContent.length) {
			textActions.toSelectMode(elem);
		}
		
		// Set x,y vals on elements that don't have them
		if((attr == 'x' || attr == 'y') && $.inArray(elem.tagName, ['g', 'polyline', 'path']) != -1) {
			var bbox = getStrokedBBox([elem]);
			var diff_x = attr == 'x' ? newValue - bbox.x : 0;
			var diff_y = attr == 'y' ? newValue - bbox.y : 0;
			canvas.moveSelectedElements(diff_x*current_zoom, diff_y*current_zoom, true);
			continue;
		}
		
		// only allow the transform/opacity attribute to change on <g> elements, slightly hacky
		if (elem.tagName == "g" && $.inArray(attr, ['transform', 'opacity', 'filter']) !== -1);
		var oldval = attr == "#text" ? elem.textContent : elem.getAttribute(attr);
		if (oldval == null)  oldval = "";
		if (oldval != String(newValue)) {
			if (attr == "#text") {
				var old_w = getBBox(elem).width;
				elem.textContent = newValue;
				elem = ffClone(elem);
				
				// Hoped to solve the issue of moving text with text-anchor="start",
				// but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
				
// 					var box=getBBox(elem), left=box.x, top=box.y, width=box.width,
// 						height=box.height, dx = width - old_w, dy=0;
// 					var angle = getRotationAngle(elem, true);
// 					if (angle) {
// 						var r = Math.sqrt( dx*dx + dy*dy );
// 						var theta = Math.atan2(dy,dx) - angle;
// 						dx = r * Math.cos(theta);
// 						dy = r * Math.sin(theta);
// 						
// 						elem.setAttribute('x', elem.getAttribute('x')-dx);
// 						elem.setAttribute('y', elem.getAttribute('y')-dy);
// 					}
				
			} else if (attr == "#href") {
				setHref(elem, newValue);
			}
			else elem.setAttribute(attr, newValue);
			if (i==0)
				selectedBBoxes[i] = getBBox(elem);
			// Use the Firefox ffClone hack for text elements with gradients or
			// where other text attributes are changed. 
			if(elem.nodeName == 'text') {
				if((newValue+'').indexOf('url') == 0 || $.inArray(attr, ['font-size','font-family','x','y']) != -1 && elem.textContent) {
					elem = ffClone(elem);
				}
			}
			// Timeout needed for Opera & Firefox
			// codedread: it is now possible for this function to be called with elements
			// that are not in the selectedElements array, we need to only request a
			// selector if the element is in that array
			if ($.inArray(elem, selectedElements) != -1) {
				setTimeout(function() {
					// Due to element replacement, this element may no longer
					// be part of the DOM
					if(!elem.parentNode) return;
					selectorManager.requestSelector(elem).resize();
				},0);
			}
			// if this element was rotated, and we changed the position of this element
			// we need to update the rotational transform attribute 
			var angle = getRotationAngle(elem);
			if (angle != 0 && attr != "transform") {
				var tlist = getTransformList(elem);
				var n = tlist.numberOfItems;
				while (n--) {
					var xform = tlist.getItem(n);
					if (xform.type == 4) {
						// remove old rotate
						tlist.removeItem(n);
						
						var box = getBBox(elem);
						var center = transformPoint(box.x+box.width/2, box.y+box.height/2, transformListToTransform(tlist).matrix);
						var cx = center.x,
							cy = center.y;
						var newrot = svgroot.createSVGTransform();
						newrot.setRotate(angle, cx, cy);
						tlist.insertItemBefore(newrot, n);
						break;
					}
				}
			}
		} // if oldValue != newValue
	} // for each elem
	svgroot.unsuspendRedraw(handle);	
};

// Function: changeSelectedAttribute
// Change the given/selected element and add the original value to the history stack
// If you want to change all selectedElements, ignore the elems argument.
// If you want to change only a subset of selectedElements, then send the
// subset to this function in the elems argument.
// 
// Parameters:
// attr - String with the attribute name
// newValue - String or number with the new attribute value
// elems - The DOM elements to apply the change to
var changeSelectedAttribute = this.changeSelectedAttribute = function(attr, val, elems) {
	var elems = elems || selectedElements;
	canvas.beginUndoableChange(attr, elems);
	var i = elems.length;

	changeSelectedAttributeNoUndo(attr, val, elems);

	var batchCmd = canvas.finishUndoableChange();
	if (!batchCmd.isEmpty()) { 
		addCommandToHistory(batchCmd);
	}
};

// Function: deleteSelectedElements
// Removes all selected elements from the DOM and adds the change to the 
// history stack
this.deleteSelectedElements = function() {
	var batchCmd = new BatchCommand("Delete Elements");
	var len = selectedElements.length;
	var selectedCopy = []; //selectedElements is being deleted
	for (var i = 0; i < len; ++i) {
		var selected = selectedElements[i];
		if (selected == null) break;

		var parent = selected.parentNode;
		var t = selected;
		// this will unselect the element and remove the selectedOutline
		selectorManager.releaseSelector(t);
		var elem = parent.removeChild(t);
		selectedCopy.push(selected) //for the copy
		selectedElements[i] = null;
		batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
	}
	if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
	call("changed", selectedCopy);
	clearSelection();
};

// Function: cutSelectedElements
// Removes all selected elements from the DOM and adds the change to the 
// history stack. Remembers removed elements on the clipboard

// TODO: Combine similar code with deleteSelectedElements
this.cutSelectedElements = function() {
	var batchCmd = new BatchCommand("Cut Elements");
	var len = selectedElements.length;
	var selectedCopy = []; //selectedElements is being deleted
	for (var i = 0; i < len; ++i) {
		var selected = selectedElements[i];
		if (selected == null) break;

		var parent = selected.parentNode;
		var t = selected;
		// this will unselect the element and remove the selectedOutline
		selectorManager.releaseSelector(t);
		var elem = parent.removeChild(t);
		selectedCopy.push(selected) //for the copy
		selectedElements[i] = null;
		batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
	}
	if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
	call("changed", selectedCopy);
	clearSelection();
	
	canvas.clipBoard = selectedCopy;
};

// Function: copySelectedElements
// Remembers the current selected elements on the clipboard
this.copySelectedElements = function() {
	canvas.clipBoard = $.merge([], selectedElements);
};

this.pasteElements = function(type) {
	var cb = canvas.clipBoard;
	var len = cb.length;
	if(!len) return;
	
	var pasted = [];
	var batchCmd = new BatchCommand('Paste elements');
	
	// Move elements to lastClickPoint

	while (len--) {
		var elem = cb[len];
		if(!elem) continue;
		var copy = copyElem(elem);

		// See if elem with elem ID is in the DOM already
		if(!getElem(elem.id)) copy.id = elem.id;
		
		pasted.push(copy);
		current_layer.appendChild(copy);
		batchCmd.addSubCommand(new InsertElementCommand(copy));
	}
	
	clearSelection(true);
	addToSelection(pasted);
	
	if(type !== 'in_place') {
		var bbox = getStrokedBBox(pasted);
		var cx = lastClickPoint.x - (bbox.x + bbox.width/2),
			cy = lastClickPoint.y - (bbox.y + bbox.height/2),
			dx = [],
			dy = [];
	
		$.each(pasted, function(i, item) {
			dx.push(cx);
			dy.push(cy);
		});
		
		var cmd = canvas.moveSelectedElements(dx, dy, false);
		batchCmd.addSubCommand(cmd);
	}
	
	addCommandToHistory(batchCmd);
	call("changed", pasted);
}

// Function: groupSelectedElements
// Wraps all the selected elements in a group (g) element
this.groupSelectedElements = function() {
	var batchCmd = new BatchCommand("Group Elements");
	
	// create and insert the group element
	var g = addSvgElementFromJson({
							"element": "g",
							"attr": {
								"id": getNextId()
							}
						});
	batchCmd.addSubCommand(new InsertElementCommand(g));
	
	// now move all children into the group
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem == null) continue;
		var oldNextSibling = elem.nextSibling;
		var oldParent = elem.parentNode;
		g.appendChild(elem);
		batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));			
	}
	if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
	
	// update selection
	clearSelection();
	addToSelection([g], true);
};

// Function: ungroupSelectedElement
// Unwraps all the elements in a selected group (g) element. This requires
// significant recalculations to apply group's transforms, etc to its children
this.ungroupSelectedElement = function() {
	var g = selectedElements[0];
	if($(g).data('gsvg') || $(g).data('symbol')) {
		// Is svg, so actually convert to group

		convertToGroup(g);
		return;
	}
	if (g.tagName == "g") {
	
		var batchCmd = new BatchCommand("Ungroup Elements");
		var parent = g.parentNode;
		var anchor = g.nextSibling;
		var children = new Array(g.childNodes.length);
		var xform = g.getAttribute("transform");
		// get consolidated matrix
		var glist = getTransformList(g);
		var m = transformListToTransform(glist).matrix;

		// TODO: get all fill/stroke properties from the group that we are about to destroy
		// "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset", 
		// "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", 
		// "stroke-width"
		// and then for each child, if they do not have the attribute (or the value is 'inherit')
		// then set the child's attribute
		
		var i = 0;
		var gangle = getRotationAngle(g);
		
		var gattrs = $(g).attr(['filter', 'opacity']);
		var gfilter, gblur;
		
		while (g.firstChild) {
			var elem = g.firstChild;
			var oldNextSibling = elem.nextSibling;
			var oldParent = elem.parentNode;
			
			// Remove child title elements
			if(elem.tagName == 'title') {
				batchCmd.addSubCommand(new RemoveElementCommand(elem, oldParent));
				oldParent.removeChild(elem);
				continue;
			}
			
			children[i++] = elem = parent.insertBefore(elem, anchor);
			batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
			
			if(gattrs.opacity !== null && gattrs.opacity !== 1) {
				var c_opac = elem.getAttribute('opacity') || 1;
				var new_opac = Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100)/100;
				changeSelectedAttribute('opacity', new_opac, [elem]);
			}

			if(gattrs.filter) {
				var cblur = this.getBlur(elem);
				var orig_cblur = cblur;
				if(!gblur) gblur = this.getBlur(g);
				if(cblur) {
					// Is this formula correct?
					cblur = (gblur-0) + (cblur-0);
				} else if(cblur === 0) {
					cblur = gblur;
				}
				
				// If child has no current filter, get group's filter or clone it.
				if(!orig_cblur) {
					// Set group's filter to use first child's ID
					if(!gfilter) {
						gfilter = getElem(getUrlFromAttr(gattrs.filter).substr(1));
					} else {
						// Clone the group's filter
						gfilter = copyElem(gfilter);
						findDefs().appendChild(gfilter);
					}
				} else {
					gfilter = getElem(getUrlFromAttr(elem.getAttribute('filter')).substr(1));
				}

				// Change this in future for different filters
				var suffix = (gfilter.firstChild.tagName === 'feGaussianBlur')?'blur':'filter'; 
				gfilter.id = elem.id + '_' + suffix;
				changeSelectedAttribute('filter', 'url(#' + gfilter.id + ')', [elem]);
				
				// Update blur value 
				if(cblur) {
					changeSelectedAttribute('stdDeviation', cblur, [gfilter.firstChild]);
					canvas.setBlurOffsets(gfilter, cblur);
				}
			}
			
			var chtlist = getTransformList(elem);
			
			// Hopefully not a problem to add this. Necessary for elements like <desc/>
			if(!chtlist) continue;
			
			if (glist.numberOfItems) {
				// TODO: if the group's transform is just a rotate, we can always transfer the
				// rotate() down to the children (collapsing consecutive rotates and factoring
				// out any translates)
				if (gangle && glist.numberOfItems == 1) {
					// [Rg] [Rc] [Mc]
					// we want [Tr] [Rc2] [Mc] where:
					// 	- [Rc2] is at the child's current center but has the 
					//	  sum of the group and child's rotation angles
					// 	- [Tr] is the equivalent translation that this child 
					// 	  undergoes if the group wasn't there
					
					// [Tr] = [Rg] [Rc] [Rc2_inv]
					
					// get group's rotation matrix (Rg)
					var rgm = glist.getItem(0).matrix;
					
					// get child's rotation matrix (Rc)
					var rcm = svgroot.createSVGMatrix();
					var cangle = getRotationAngle(elem);
					if (cangle) {
						rcm = chtlist.getItem(0).matrix;
					}
					
					// get child's old center of rotation
					var cbox = getBBox(elem);
					var ceqm = transformListToTransform(chtlist).matrix;
					var coldc = transformPoint(cbox.x+cbox.width/2, cbox.y+cbox.height/2,ceqm);
					
					// sum group and child's angles
					var sangle = gangle + cangle;
					
					// get child's rotation at the old center (Rc2_inv)
					var r2 = svgroot.createSVGTransform();
					r2.setRotate(sangle, coldc.x, coldc.y);
					
					// calculate equivalent translate
					var trm = matrixMultiply(rgm, rcm, r2.matrix.inverse());
					
					// set up tlist
					if (cangle) {
						chtlist.removeItem(0);
					}
					
					if (sangle) {
						chtlist.insertItemBefore(r2, 0);
					}

					if (trm.e || trm.f) {
						var tr = svgroot.createSVGTransform();
						tr.setTranslate(trm.e, trm.f);
						chtlist.insertItemBefore(tr, 0);
					}
				}
				else { // more complicated than just a rotate
					// transfer the group's transform down to each child and then
					// call recalculateDimensions()				
					var oldxform = elem.getAttribute("transform");
					var changes = {};
					changes["transform"] = oldxform ? oldxform : "";

					var newxform = svgroot.createSVGTransform();

					// [ gm ] [ chm ] = [ chm ] [ gm' ]
					// [ gm' ] = [ chm_inv ] [ gm ] [ chm ]
					var chm = transformListToTransform(chtlist).matrix,
						chm_inv = chm.inverse();
					var gm = matrixMultiply( chm_inv, m, chm );
					newxform.setMatrix(gm);
					chtlist.appendItem(newxform);
				}
				batchCmd.addSubCommand(recalculateDimensions(elem));
			}
		}

		
		// remove transform and make it undo-able
		if (xform) {
			var changes = {};
			changes["transform"] = xform;
			g.setAttribute("transform", "");
			g.removeAttribute("transform");				
			batchCmd.addSubCommand(new ChangeElementCommand(g, changes));
		}

		// remove the group from the selection			
		clearSelection();
		
		// delete the group element (but make undo-able)
		g = parent.removeChild(g);
		batchCmd.addSubCommand(new RemoveElementCommand(g, parent));

		if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
		
		// update selection
		addToSelection(children);
	}
};

// Function: moveToTopSelectedElement
// Repositions the selected element to the bottom in the DOM to appear on top of
// other elements
this.moveToTopSelectedElement = function() {
	var selected = selectedElements[0];
	if (selected != null) {
		var t = selected;
		var oldParent = t.parentNode;
		var oldNextSibling = t.nextSibling;
		t = t.parentNode.appendChild(t);
		addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "top"));
	}
};

// Function: moveToBottomSelectedElement
// Repositions the selected element to the top in the DOM to appear under 
// other elements
this.moveToBottomSelectedElement = function() {
	var selected = selectedElements[0];
	if (selected != null) {
		var t = selected;
		var oldParent = t.parentNode;
		var oldNextSibling = t.nextSibling;
		var firstChild = t.parentNode.firstChild;
		if (firstChild.tagName == 'title') {
			firstChild = firstChild.nextSibling;
		}
		// This can probably be removed, as the defs should not ever apppear
		// inside a layer group
		if (firstChild.tagName == 'defs') {
			firstChild = firstChild.nextSibling;
		}
		t = t.parentNode.insertBefore(t, firstChild);
		addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "bottom"));
	}
};

// Function: moveUpDownSelected
// Moves the select element up or down the stack, based on the visibly
// intersecting elements
//
// Parameters: 
// dir - String that's either 'Up' or 'Down'
this.moveUpDownSelected = function(dir) {
	var selected = selectedElements[0];
	if (!selected) return;
	
	curBBoxes = [];
	var closest, found_cur;
	// jQuery sorts this list
	var list = $(getIntersectionList(getStrokedBBox([selected]))).toArray();
	if(dir == 'Down') list.reverse();

	$.each(list, function() {
		if(!found_cur) {
			if(this == selected) {
				found_cur = true;
			}
			return;
		}
		closest = this;
		return false;
	});
	if(!closest) return;
	
	var t = selected;
	var oldParent = t.parentNode;
	var oldNextSibling = t.nextSibling;
	$(closest)[dir == 'Down'?'before':'after'](t);
	addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "Move " + dir));
}

// Function: moveSelectedElements
// Moves selected elements on the X/Y axis 
//
// Parameters:
// dx - Float with the distance to move on the x-axis
// dy - Float with the distance to move on the y-axis
// undoable - Boolean indicating whether or not the action should be undoable
//
// Returns:
// Batch command for the move
this.moveSelectedElements = function(dx,dy,undoable) {
	// if undoable is not sent, default to true
	// if single values, scale them to the zoom
	if (dx.constructor != Array) {
		dx /= current_zoom;
		dy /= current_zoom;
	}
	var undoable = undoable || true;
	var batchCmd = new BatchCommand("position");
	var i = selectedElements.length;
	while (i--) {
		var selected = selectedElements[i];
		if (selected != null) {
			if (i==0)
				selectedBBoxes[i] = getBBox(selected);
			
			var b = {};
			for(var j in selectedBBoxes[i]) b[j] = selectedBBoxes[i][j];
			selectedBBoxes[i] = b;
			
			var xform = svgroot.createSVGTransform();
			var tlist = getTransformList(selected);
			
			// dx and dy could be arrays
			if (dx.constructor == Array) {
				if (i==0) {
					selectedBBoxes[i].x += dx[i];
					selectedBBoxes[i].y += dy[i];
				}
				xform.setTranslate(dx[i],dy[i]);
			} else {
				if (i==0) {
					selectedBBoxes[i].x += dx;
					selectedBBoxes[i].y += dy;
				}
				xform.setTranslate(dx,dy);
			}

			if(tlist.numberOfItems) {
				tlist.insertItemBefore(xform, 0);
			} else {
				tlist.appendItem(xform);
			}
			
			var cmd = recalculateDimensions(selected);
			if (cmd) {
				batchCmd.addSubCommand(cmd);
			}
			selectorManager.requestSelector(selected).resize();
		}
	}
	if (!batchCmd.isEmpty()) {
		if (undoable)
			addCommandToHistory(batchCmd);
		call("changed", selectedElements);
		return batchCmd;
	}
};

// Function: cloneSelectedElements
// Create deep DOM copies (clones) of all selected elements and move them slightly 
// from their originals
this.cloneSelectedElements = function() {
	var batchCmd = new BatchCommand("Clone Elements");
	// find all the elements selected (stop at first null)
	var len = selectedElements.length;
	for (var i = 0; i < len; ++i) {
		var elem = selectedElements[i];
		if (elem == null) break;
	}
	// use slice to quickly get the subset of elements we need
	var copiedElements = selectedElements.slice(0,i);
	this.clearSelection();
	// note that we loop in the reverse way because of the way elements are added
	// to the selectedElements array (top-first)
	var i = copiedElements.length;
	while (i--) {
		// clone each element and replace it within copiedElements
		var elem = copiedElements[i] = copyElem(copiedElements[i]);
		current_layer.appendChild(elem);
		batchCmd.addSubCommand(new InsertElementCommand(elem));
	}
	
	if (!batchCmd.isEmpty()) {
		addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
		this.moveSelectedElements(20,20,false);
		addCommandToHistory(batchCmd);
		call("selected", selectedElements);
	}
};

// Function: alignSelectedElements
// Aligns selected elements
//
// Parameters:
// type - String with single character indicating the alignment type
// relative_to - String that must be one of the following: 
// "selected", "largest", "smallest", "page"
this.alignSelectedElements = function(type, relative_to) {
	var bboxes = [], angles = [];
	var minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE, miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
	var curwidth = Number.MIN_VALUE, curheight = Number.MIN_VALUE;
	var len = selectedElements.length;
	if (!len) return;
	for (var i = 0; i < len; ++i) {
		if (selectedElements[i] == null) break;
		var elem = selectedElements[i];
		bboxes[i] = getStrokedBBox([elem]);
		
		// now bbox is axis-aligned and handles rotation
		switch (relative_to) {
			case 'smallest':
				if ( (type == 'l' || type == 'c' || type == 'r') && (curwidth == Number.MIN_VALUE || curwidth > bboxes[i].width) ||
					 (type == 't' || type == 'm' || type == 'b') && (curheight == Number.MIN_VALUE || curheight > bboxes[i].height) ) {
					minx = bboxes[i].x;
					miny = bboxes[i].y;
					maxx = bboxes[i].x + bboxes[i].width;
					maxy = bboxes[i].y + bboxes[i].height;
					curwidth = bboxes[i].width;
					curheight = bboxes[i].height;
				}
				break;
			case 'largest':
				if ( (type == 'l' || type == 'c' || type == 'r') && (curwidth == Number.MIN_VALUE || curwidth < bboxes[i].width) ||
					 (type == 't' || type == 'm' || type == 'b') && (curheight == Number.MIN_VALUE || curheight < bboxes[i].height) ) {
					minx = bboxes[i].x;
					miny = bboxes[i].y;
					maxx = bboxes[i].x + bboxes[i].width;
					maxy = bboxes[i].y + bboxes[i].height;
					curwidth = bboxes[i].width;
					curheight = bboxes[i].height;
				}
				break;
			default: // 'selected'
				if (bboxes[i].x < minx) minx = bboxes[i].x;
				if (bboxes[i].y < miny) miny = bboxes[i].y;
				if (bboxes[i].x + bboxes[i].width > maxx) maxx = bboxes[i].x + bboxes[i].width;
				if (bboxes[i].y + bboxes[i].height > maxy) maxy = bboxes[i].y + bboxes[i].height;
				break;
		}
	} // loop for each element to find the bbox and adjust min/max

	if (relative_to == 'page') {
		minx = 0;
		miny = 0;
		maxx = canvas.contentW;
		maxy = canvas.contentH;
	}

	var dx = new Array(len);
	var dy = new Array(len);
	for (var i = 0; i < len; ++i) {
		if (selectedElements[i] == null) break;
		var elem = selectedElements[i];
		var bbox = bboxes[i];
		dx[i] = 0;
		dy[i] = 0;
		switch (type) {
			case 'l': // left (horizontal)
				dx[i] = minx - bbox.x;
				break;
			case 'c': // center (horizontal)
				dx[i] = (minx+maxx)/2 - (bbox.x + bbox.width/2);
				break;
			case 'r': // right (horizontal)
				dx[i] = maxx - (bbox.x + bbox.width);
				break;
			case 't': // top (vertical)
				dy[i] = miny - bbox.y;
				break;
			case 'm': // middle (vertical)
				dy[i] = (miny+maxy)/2 - (bbox.y + bbox.height/2);
				break;
			case 'b': // bottom (vertical)
				dy[i] = maxy - (bbox.y + bbox.height);
				break;
		}
	}
	this.moveSelectedElements(dx,dy);
};

// Group: Additional editor tools

this.contentW = getResolution().w;
this.contentH = getResolution().h;

// Function: updateCanvas
// Updates the editor canvas width/height/position after a zoom has occurred 
//
// Parameters:
// w - Float with the new width
// h - Float with the new height
//
// Returns: 
// Object with the following values:
// * x - The canvas' new x coordinate
// * y - The canvas' new y coordinate
// * old_x - The canvas' old x coordinate
// * old_y - The canvas' old y coordinate
// * d_x - The x position difference
// * d_y - The y position difference
this.updateCanvas = function(w, h) {
	svgroot.setAttribute("width", w);
	svgroot.setAttribute("height", h);
	var bg = $('#canvasBackground')[0];
	var old_x = svgcontent.getAttribute('x');
	var old_y = svgcontent.getAttribute('y');
	var x = (w/2 - this.contentW*current_zoom/2);
	var y = (h/2 - this.contentH*current_zoom/2);

	assignAttributes(svgcontent, {
		width: this.contentW*current_zoom,
		height: this.contentH*current_zoom,
		'x': x,
		'y': y,
		"viewBox" : "0 0 " + this.contentW + " " + this.contentH
	});
	
	assignAttributes(bg, {
		width: svgcontent.getAttribute('width'),
		height: svgcontent.getAttribute('height'),
		x: x,
		y: y
	});
	
	selectorManager.selectorParentGroup.setAttribute("transform","translate(" + x + "," + y + ")");
	
	return {x:x, y:y, old_x:old_x, old_y:old_y, d_x:x - old_x, d_y:y - old_y};
}

// Function: setBackground
// Set the background of the editor (NOT the actual document)
//
// Parameters:
// color - String with fill color to apply
// url - URL or path to image to use
this.setBackground = function(color, url) {
	var bg =  getElem('canvasBackground');
	var border = $(bg).find('rect')[0];
	var bg_img = getElem('background_image');
	border.setAttribute('fill',color);
	if(url) {
		if(!bg_img) {
			bg_img = svgdoc.createElementNS(svgns, "image");
			assignAttributes(bg_img, {
				'id': 'background_image',
				'width': '100%',
				'height': '100%',
				'preserveAspectRatio': 'xMinYMin',
				'style':'pointer-events:none'
			});
		}
		setHref(bg_img, url);
		bg.appendChild(bg_img);
	} else if(bg_img) {
		bg_img.parentNode.removeChild(bg_img);
	}
}

// Function: cycleElement
// Select the next/previous element within the current layer
//
// Parameters:
// next - Boolean where true = next and false = previous element
this.cycleElement = function(next) {
	var cur_elem = selectedElements[0];
	var elem = false;
	var all_elems = getVisibleElements(current_layer);
	if (cur_elem == null) {
		var num = next?all_elems.length-1:0;
		elem = all_elems[num];
	} else {
		var i = all_elems.length;
		while(i--) {
			if(all_elems[i] == cur_elem) {
				var num = next?i-1:i+1;
				if(num >= all_elems.length) {
					num = 0;
				} else if(num < 0) {
					num = all_elems.length-1;
				} 
				elem = all_elems[num];
				break;
			} 
		}
	}		
	clearSelection();
	addToSelection([elem], true);
	call("selected", selectedElements);
}

this.clear();


// DEPRECATED: getPrivateMethods 
// Since all methods are/should be public somehow, this function should be removed

// Being able to access private methods publicly seems wrong somehow,
// but currently appears to be the best way to allow testing and provide
// access to them to plugins.
this.getPrivateMethods = function() {
	var obj = {
		addCommandToHistory: addCommandToHistory,
		setGradient: setGradient,
		addSvgElementFromJson: addSvgElementFromJson,
		assignAttributes: assignAttributes,
		BatchCommand: BatchCommand,
		call: call,
		ChangeElementCommand: ChangeElementCommand,
		cleanupElement: cleanupElement,
		copyElem: copyElem,
		ffClone: ffClone,
		findDefs: findDefs,
		findDuplicateGradient: findDuplicateGradient,
		getElem: getElem,
		getId: getId,
		getIntersectionList: getIntersectionList,
		getMouseTarget: getMouseTarget,
		getNextId: getNextId,
		getPathBBox: getPathBBox,
		getUrlFromAttr: getUrlFromAttr,
		hasMatrixTransform: hasMatrixTransform,
		identifyLayers: identifyLayers,
		InsertElementCommand: InsertElementCommand,
		isIdentity: isIdentity,
		logMatrix: logMatrix,
		matrixMultiply: matrixMultiply,
		MoveElementCommand: MoveElementCommand,
		preventClickDefault: preventClickDefault,
		recalculateAllSelectedDimensions: recalculateAllSelectedDimensions,
		recalculateDimensions: recalculateDimensions,
		remapElement: remapElement,
		RemoveElementCommand: RemoveElementCommand,
		removeUnusedDefElems: removeUnusedDefElems,
		round: round,
		runExtensions: runExtensions,
		sanitizeSvg: sanitizeSvg,
		SelectorManager: SelectorManager,
		shortFloat: shortFloat,
		svgCanvasToString: svgCanvasToString,
		SVGEditTransformList: SVGEditTransformList,
		svgToString: svgToString,
		toString: toString,
		transformBox: transformBox,
		transformListToTransform: transformListToTransform,
		transformPoint: transformPoint,
		walkTree: walkTree
	}
	return obj;
};

// console.log('canvas.getPrivateMethods',canvas.getPrivateMethods);

// Test support for features/bugs
(function() {
	// segList functions (for FF1.5 and 2.0)
	var path = document.createElementNS(svgns,'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.replaceItem(seg, 0);
		support.pathReplaceItem = true;
	} catch(err) {
		support.pathReplaceItem = false;
	}
	
	try {
		seglist.insertItemBefore(seg, 0);
		support.pathInsertItemBefore = true;
	} catch(err) {
		support.pathInsertItemBefore = false;
	}
	
	// TODO: Find better way to check support for this
	support.editableText = isOpera;
	
	// Correct decimals on clone attributes (Opera < 10.5/win/non-en)
	var rect = document.createElementNS(svgns,'rect');
	rect.setAttribute('x',.1);
	var crect = rect.cloneNode(false);
	support.goodDecimals = (crect.getAttribute('x').indexOf(',') == -1);
	if(!support.goodDecimals) {
		$.alert("NOTE: This version of Opera is known to contain bugs in SVG-edit.\n\
		Please upgrade to the <a href='http://opera.com'>latest version</a> in which the problems have been fixed.");
	}
	
	// Get correct em/ex values
	var rect = document.createElementNS(svgns,'rect');
	rect.setAttribute('width',"1em");
	rect.setAttribute('height',"1ex");
	svgcontent.appendChild(rect);
	var bb = rect.getBBox();
	unit_types.em = bb.width;
	unit_types.ex = bb.height;
	svgcontent.removeChild(rect);
}());

}
