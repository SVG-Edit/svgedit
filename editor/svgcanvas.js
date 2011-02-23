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

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) svgtransformlist.js
// 4) math.js
// 5) units.js
// 6) svgutils.js
// 7) sanitize.js
// 8) history.js
// 9) select.js
// 10) draw.js
// 11) path.js

if(!window.console) {
	window.console = {};
	window.console.log = function(str) {};
	window.console.dir = function(str) {};
}

if(window.opera) {
	window.console.log = function(str) { opera.postError(str); };
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
// Namespace constants
var svgns = "http://www.w3.org/2000/svg",
	xlinkns = "http://www.w3.org/1999/xlink",
	xmlns = "http://www.w3.org/XML/1998/namespace",
	xmlnsns = "http://www.w3.org/2000/xmlns/", // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
	se_ns = "http://svg-edit.googlecode.com",
	htmlns = "http://www.w3.org/1999/xhtml",
	mathns = "http://www.w3.org/1998/Math/MathML";

// Default configuration options
var curConfig = {
	show_outside_canvas: true,
	selectNew: true,
	dimensions: [640, 480]
};

// Update config with new one if given
if(config) {
	$.extend(curConfig, config);
}

// Array with width/height of canvas
var dimensions = curConfig.dimensions;

var canvas = this;

// "document" element associated with the container (same as window.document using default svg-editor.js)
// NOTE: This is not actually a SVG document, but a HTML document.
var svgdoc = container.ownerDocument;

// This is a container for the document being edited, not the document itself.
var svgroot = svgdoc.importNode(svgedit.utilities.text2xml(
		'<svg id="svgroot" xmlns="' + svgns + '" xlinkns="' + xlinkns + '" ' +
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
container.appendChild(svgroot);

// The actual element that represents the final output SVG element
var svgcontent = svgdoc.createElementNS(svgns, "svg");

// This function resets the svgcontent element while keeping it in the DOM.
var clearSvgContentElement = canvas.clearSvgContentElement = function() {
	while (svgcontent.firstChild) { svgcontent.removeChild(svgcontent.firstChild); }

	// TODO: Clear out all other attributes first?
	$(svgcontent).attr({
		id: 'svgcontent',
		width: dimensions[0],
		height: dimensions[1],
		x: dimensions[0],
		y: dimensions[1],
		overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
		xmlns: svgns,
		"xmlns:se": se_ns,
		"xmlns:xlink": xlinkns
	}).appendTo(svgroot);

	// TODO: make this string optional and set by the client
	var comment = svgdoc.createComment(" Created with SVG-edit - http://svg-edit.googlecode.com/ ");
	svgcontent.appendChild(comment);
};
clearSvgContentElement();

// Prefix string for element IDs
var idprefix = "svg_";

// Function: setIdPrefix
// Changes the ID prefix to the given value
//
// Parameters: 
// p - String with the new prefix 
canvas.setIdPrefix = function(p) {
	idprefix = p;
};

// Current svgedit.draw.Drawing object
// @type {svgedit.draw.Drawing}
canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent, idprefix);

// Function: getCurrentDrawing
// Returns the current Drawing.
// @return {svgedit.draw.Drawing}
var getCurrentDrawing = canvas.getCurrentDrawing = function() {
	return canvas.current_drawing_;
};

// Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
var current_zoom = 1;

// pointer to current group (for in-group editing)
var current_group = null;

// Object containing data for the currently selected styles
var all_properties = {
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
var cur_shape = all_properties.shape;

// Array with all the currently selected elements
// default size of 1 until it needs to grow bigger
var selectedElements = new Array(1);

// Function: addSvgElementFromJson
// Create a new SVG element based on the given object keys/values and add it to the current layer
// The element will be ran through cleanupElement before being returned 
//
// Parameters:
// data - Object with the following keys/values:
// * element - tag name of the SVG element to create
// * attr - Object with attributes key-values to assign to the new element
// * curStyles - Boolean indicating that current style attributes should be applied first
//
// Returns: The new element
var addSvgElementFromJson = this.addSvgElementFromJson = function(data) {
	var shape = svgedit.utilities.getElem(data.attr.id);
	// if shape is a path but we need to create a rect/ellipse, then remove the path
	var current_layer = getCurrentDrawing().getCurrentLayer();
	if (shape && data.element != shape.tagName) {
		current_layer.removeChild(shape);
		shape = null;
	}
	if (!shape) {
		shape = svgdoc.createElementNS(svgns, data.element);
		if (current_layer) {
			(current_group || current_layer).appendChild(shape);
		}
	}
	if(data.curStyles) {
		svgedit.utilities.assignAttributes(shape, {
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
	svgedit.utilities.assignAttributes(shape, data.attr, 100);
	svgedit.utilities.cleanupElement(shape);
	return shape;
};


// import svgtransformlist.js
var getTransformList = canvas.getTransformList = svgedit.transformlist.getTransformList;

// import from math.js.
var transformPoint = svgedit.math.transformPoint;
var matrixMultiply = canvas.matrixMultiply = svgedit.math.matrixMultiply;
var hasMatrixTransform = canvas.hasMatrixTransform = svgedit.math.hasMatrixTransform;
var transformListToTransform = canvas.transformListToTransform = svgedit.math.transformListToTransform;
var snapToAngle = svgedit.math.snapToAngle;
var getMatrix = svgedit.math.getMatrix;

// initialize from units.js
// send in an object implementing the ElementContainer interface (see units.js)
svgedit.units.init({
	getBaseUnit: function() { return curConfig.baseUnit; },
	getElement: svgedit.utilities.getElem,
	getHeight: function() { return svgcontent.getAttribute("height")/current_zoom; },
	getWidth: function() { return svgcontent.getAttribute("width")/current_zoom; },
	getRoundDigits: function() { return save_options.round_digits; }
});
// import from units.js
var convertToNum = canvas.convertToNum = svgedit.units.convertToNum;

// import from svgutils.js
svgedit.utilities.init({
	getDOMDocument: function() { return svgdoc; },
	getDOMContainer: function() { return container; },
	getSVGRoot: function() { return svgroot; },
	// TODO: replace this mostly with a way to get the current drawing.
	getSelectedElements: function() { return selectedElements; },
	getSVGContent: function() { return svgcontent; }
});
var getUrlFromAttr = canvas.getUrlFromAttr = svgedit.utilities.getUrlFromAttr;
var getHref = canvas.getHref = svgedit.utilities.getHref;
var setHref = canvas.setHref = svgedit.utilities.setHref;
var getPathBBox = svgedit.utilities.getPathBBox;
var getBBox = canvas.getBBox = svgedit.utilities.getBBox;
var getRotationAngle = canvas.getRotationAngle = svgedit.utilities.getRotationAngle;
var getElem = canvas.getElem = svgedit.utilities.getElem;
var assignAttributes = canvas.assignAttributes = svgedit.utilities.assignAttributes;
var cleanupElement = this.cleanupElement = svgedit.utilities.cleanupElement;

// import from sanitize.js
var nsMap = svgedit.sanitize.getNSMap();
var sanitizeSvg = canvas.sanitizeSvg = svgedit.sanitize.sanitizeSvg;

// import from history.js
var MoveElementCommand = svgedit.history.MoveElementCommand;
var InsertElementCommand = svgedit.history.InsertElementCommand;
var RemoveElementCommand = svgedit.history.RemoveElementCommand;
var ChangeElementCommand = svgedit.history.ChangeElementCommand;
var BatchCommand = svgedit.history.BatchCommand;
// Implement the svgedit.history.HistoryEventHandler interface.
canvas.undoMgr = new svgedit.history.UndoManager({
	handleHistoryEvent: function(eventType, cmd) {
		var EventTypes = svgedit.history.HistoryEventTypes;
		// TODO: handle setBlurOffsets.
		if (eventType == EventTypes.BEFORE_UNAPPLY || eventType == EventTypes.BEFORE_APPLY) {
			canvas.clearSelection();
		} else if (eventType == EventTypes.AFTER_APPLY || eventType == EventTypes.AFTER_UNAPPLY) {
			var elems = cmd.elements();
			canvas.pathActions.clear();
			call("changed", elems);
			
			var cmdType = cmd.type();
			var isApply = (eventType == EventTypes.AFTER_APPLY);
			if (cmdType == MoveElementCommand.type()) {
				var parent = isApply ? cmd.newParent : cmd.oldParent;
				if (parent == svgcontent) {
					canvas.identifyLayers();
				}
			} else if (cmdType == InsertElementCommand.type() ||
					cmdType == RemoveElementCommand.type()) {
				if (cmd.parent == svgcontent) {
					canvas.identifyLayers();
				}
				if (cmdType == InsertElementCommand.type()) {
					if (isApply) restoreRefElems(cmd.elem);
				} else {
					if (!isApply) restoreRefElems(cmd.elem);
				}
				
				if(cmd.elem.tagName === 'use') {
					setUseData(cmd.elem);
				}
			} else if (cmdType == ChangeElementCommand.type()) {
				// if we are changing layer names, re-identify all layers
				if (cmd.elem.tagName == "title" && cmd.elem.parentNode.parentNode == svgcontent) {
					canvas.identifyLayers();
				}
				var values = isApply ? cmd.newValues : cmd.oldValues;
				// If stdDeviation was changed, update the blur.
				if (values["stdDeviation"]) {
					canvas.setBlurOffsets(cmd.elem.parentNode, values["stdDeviation"]);
				}
				
				// Remove & Re-add hack for Webkit (issue 775) 
				if(cmd.elem.tagName === 'use' && svgedit.browser.isWebkit()) {
					var elem = cmd.elem;
					if(!elem.getAttribute('x') && !elem.getAttribute('y')) {
						var parent = elem.parentNode;
						var sib = elem.nextSibling;
						parent.removeChild(elem);
						parent.insertBefore(elem, sib);
					}
				}
			}
		}
	}
});
var addCommandToHistory = function(cmd) {
	canvas.undoMgr.addCommandToHistory(cmd);
};

// import from select.js
svgedit.select.init(curConfig, {
	createSVGElement: function(jsonMap) { return canvas.addSvgElementFromJson(jsonMap); },
	svgRoot: function() { return svgroot; },
	svgContent: function() { return svgcontent; },
	currentZoom: function() { return current_zoom; },
	// TODO(codedread): Remove when getStrokedBBox() has been put into svgutils.js.
	getStrokedBBox: function(elems) { return canvas.getStrokedBBox([elems]); }
});
// this object manages selectors for us
var selectorManager = this.selectorManager = svgedit.select.getSelectorManager();

// Import from path.js
svgedit.path.init({
	getCurrentZoom: function() { return current_zoom; },
	getSVGRoot: function() { return svgroot; }
});

// Function: snapToGrid
// round value to for snapping
// NOTE: This function did not move to svgutils.js since it depends on curConfig.
svgedit.utilities.snapToGrid = function(value){
	var stepSize = curConfig.snappingStep;
	var unit = curConfig.baseUnit;
	if(unit !== "px") {
	stepSize *= svgedit.units.getTypeMap()[unit];
	}
	value = Math.round(value/stepSize)*stepSize;
	return value;
};
var snapToGrid = svgedit.utilities.snapToGrid;

// Interface strings, usually for title elements
var uiStrings = {
	"exportNoBlur": "Blurred elements will appear as un-blurred",
	"exportNoforeignObject": "foreignObject elements will not appear",
	"exportNoDashArray": "Strokes will appear filled",
	"exportNoText": "Text may not appear as expected"
};

var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
var ref_attrs = ["clip-path", "fill", "filter", "marker-end", "marker-mid", "marker-start", "mask", "stroke"];

var elData = $.data;

// Animation element to change the opacity of any newly created element
var opac_ani = document.createElementNS(svgns, 'animate');
$(opac_ani).attr({
	attributeName: 'opacity',
	begin: 'indefinite',
	dur: 1,
	fill: 'freeze'
}).appendTo(svgroot);

var restoreRefElems = function(elem) {
	// Look for missing reference elements, restore any found
	var attrs = $(elem).attr(ref_attrs);
	for(var o in attrs) {
		var val = attrs[o];
		if (val && val.indexOf('url(') === 0) {
			var id = getUrlFromAttr(val).substr(1);
			var ref = getElem(id);
			if(!ref) {
				findDefs().appendChild(removedElements[id]);
				delete removedElements[id];
			}
		}
	}
	
	var childs = elem.getElementsByTagName('*');
	
	if(childs.length) {
		for(var i = 0, l = childs.length; i < l; i++) {
			restoreRefElems(childs[i]);
		}
	}
};

(function() {
	// TODO For Issue 208: this is a start on a thumbnail
	//	var svgthumb = svgdoc.createElementNS(svgns, "use");
	//	svgthumb.setAttribute('width', '100');
	//	svgthumb.setAttribute('height', '100');
	//	svgedit.utilities.setHref(svgthumb, '#svgcontent');
	//	svgroot.appendChild(svgthumb);

})();

// Object to contain image data for raster images that were found encodable
var encodableImages = {},
	
	// String with image URL of last loadable image
	last_good_img_url = curConfig.imgPath + 'logo.png',
	
	// Array with current disabled elements (for in-group editing)
	disabled_elems = [],
	
	// Object with save options
	save_options = {round_digits: 5},
	
	// Boolean indicating whether or not a draw action has been started
	started = false,
	
	// String with an element's initial transform attribute value
	start_transform = null,
	
	// String indicating the current editor mode
	current_mode = "select",
	
	// String with the current direction in which an element is being resized
	current_resize_mode = "none",
	
	// Object with IDs for imported files, to see if one was already added
	import_ids = {};

// Current text style properties
var cur_text = all_properties.text,
	
	// Current general properties
	cur_properties = cur_shape,
	
	// Array with selected elements' Bounding box object
	selectedBBoxes = new Array(1),
	
	// The DOM element that was just selected
	justSelected = null,
	
	// DOM element for selection rectangle drawn by the user
	rubberBox = null,
	
	// Array of current BBoxes (still needed?)
	curBBoxes = [],
	
	// Object to contain all included extensions
	extensions = {},
	
	// Canvas point for the most recent right click
	lastClickPoint = null,
	
	// Map of deleted reference elements
	removedElements = {}

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
			nonce: getCurrentDrawing().getNonce(),
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

	var parent = current_group || getCurrentDrawing().getCurrentLayer();
	
	if(!curBBoxes.length) {
		// Cache all bboxes
		curBBoxes = getVisibleElementsAndBBoxes(parent);
	}
	
	var resultList = null;
	try {
		resultList = parent.getIntersectionList(rect, null);
	} catch(e) { }

	if (resultList == null || typeof(resultList.item) != "function") {
		resultList = [];
		
		if(!rect) {
			var rubberBBox = rubberBox.getBBox();
			var bb = {};
			
			for(var o in rubberBBox) {
				bb[o] = rubberBBox[o] / current_zoom;
			}
			rubberBBox = bb;
			
		} else {
			var rubberBBox = rect;
		}
		var i = curBBoxes.length;
		while (i--) {
			if(!rubberBBox.width || !rubberBBox.width) continue;
			if (svgedit.math.rectsIntersect(rubberBBox, curBBoxes[i].bbox))  {
				resultList.push(curBBoxes[i].elem);
			}
		}
	}
	// addToSelection expects an array, but it's ok to pass a NodeList 
	// because using square-bracket notation is allowed: 
	// http://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
	return resultList;
};

// TODO(codedread): Migrate this into svgutils.js
// Function: getStrokedBBox
// Get the bounding box for one or more stroked and/or transformed elements
// 
// Parameters:
// elems - Array with DOM elements to check
// 
// Returns:
// A single bounding box object
getStrokedBBox = this.getStrokedBBox = function(elems) {
	if(!elems) elems = getVisibleElements();
	if(!elems.length) return false;
	// Make sure the expected BBox is returned if the element is a group
	var getCheckedBBox = function(elem) {
	
		try {
			// TODO: Fix issue with rotated groups. Currently they work
			// fine in FF, but not in other browsers (same problem mentioned
			// in Issue 339 comment #2).
			
			var bb = svgedit.utilities.getBBox(elem);
			
			var angle = svgedit.utilities.getRotationAngle(elem);
			if ((angle && angle % 90) ||
			    svgedit.math.hasMatrixTransform(svgedit.transformlist.getTransformList(elem))) {
				// Accurate way to get BBox of rotated element in Firefox:
				// Put element in group and get its BBox
				
				var good_bb = false;
				
				// Get the BBox from the raw path for these elements
				var elemNames = ['ellipse','path','line','polyline','polygon'];
				if(elemNames.indexOf(elem.tagName) >= 0) {
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
					// Must use clone else FF freaks out
					var clone = elem.cloneNode(true); 
					var g = document.createElementNS(svgns, "g");
					var parent = elem.parentNode;
					parent.appendChild(g);
					g.appendChild(clone);
					bb = svgedit.utilities.bboxToObj(g.getBBox());
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
	};

	var full_bb;
	$.each(elems, function() {
		if(full_bb) return;
		if(!this.parentNode) return;
		full_bb = getCheckedBBox(this);
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
//
// Returns:
// An array with all "visible" elements.
var getVisibleElements = this.getVisibleElements = function(parent) {
	if(!parent) parent = $(svgcontent).children(); // Prevent layers from being included
	
	var contentElems = [];
	$(parent).children().each(function(i, elem) {
		try {
			if (elem.getBBox()) {
				contentElems.push(elem);
			}
		} catch(e) {}
	});
	return contentElems.reverse();
};

// Function: getVisibleElementsAndBBoxes
// Get all elements that have a BBox (excludes <defs>, <title>, etc).
// Note that 0-opacity, off-screen etc elements are still considered "visible"
// for this function
//
// Parameters:
// parent - The parent DOM element to search within
//
// Returns:
// An array with objects that include:
// * elem - The element
// * bbox - The element's BBox as retrieved from getStrokedBBox
var getVisibleElementsAndBBoxes = this.getVisibleElementsAndBBoxes = function(parent) {
	if(!parent) parent = $(svgcontent).children(); // Prevent layers from being included
	
	var contentElems = [];
	$(parent).children().each(function(i, elem) {
		try {
			if (elem.getBBox()) {
				contentElems.push({'elem':elem, 'bbox':getStrokedBBox([elem])});
			}
		} catch(e) {}
	});
	return contentElems.reverse();
};

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
	
	// Opera's "d" value needs to be reset for Opera/Win/non-EN
	// Also needed for webkit (else does not keep curved segments on clone)
	if(svgedit.browser.isWebkit() && el.nodeName == 'path') {
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

// Set scope for these functions
var getId, getNextId, call;

(function(c) {

	// Object to contain editor event names and callback functions
	var events = {};

	getId = c.getId = function() { return getCurrentDrawing().getId(); };
	getNextId = c.getNextId = function() { return getCurrentDrawing().getNextId(); };
	
	// Function: call
	// Run the callback function associated with the given event
	//
	// Parameters:
	// event - String with the event name
	// arg - Argument to pass through to the callback function
	call = c.call = function(event, arg) {
		if (events[event]) {
			return events[event](this, arg);
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
	
}(canvas));

// Function: canvas.prepareSvg
// Runs the SVG Document through the sanitizer and then updates its paths.
//
// Parameters:
// newDoc - The SVG DOM document
this.prepareSvg = function(newDoc) {
	this.sanitizeSvg(newDoc.documentElement);

	// convert paths into absolute commands
	var paths = newDoc.getElementsByTagNameNS(svgns, "path");
	for (var i = 0, len = paths.length; i < len; ++i) {
		var path = paths[i];
		path.setAttribute('d', pathActions.convertPath(path));
		pathActions.fixEnd(path);
	}
};

// Function getRefElem
// Get the reference element associated with the given attribute value
//
// Parameters:
// attrVal - The attribute value as a string
var getRefElem = this.getRefElem = function(attrVal) {
	return getElem(getUrlFromAttr(attrVal).substr(1));
}

// Function: ffClone
// Hack for Firefox bugs where text element features aren't updated or get 
// messed up. See issue 136 and issue 137.
// This function clones the element and re-selects it 
// TODO: Test for this bug on load and add it to "support" object instead of 
// browser sniffing
//
// Parameters: 
// elem - The (text) DOM element to clone
var ffClone = function(elem) {
	if(!svgedit.browser.isGecko()) return elem;
	var clone = elem.cloneNode(true)
	elem.parentNode.insertBefore(clone, elem);
	elem.parentNode.removeChild(elem);
	selectorManager.releaseSelector(elem);
	selectedElements[0] = clone;
	selectorManager.requestSelector(clone).showGrips(true);
	return clone;
}


// this.each is deprecated, if any extension used this it can be recreated by doing this:
// $(canvas.getRootElem()).children().each(...)

// this.each = function(cb) {
// 	$(svgroot).children().each(cb);
// };


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
		call("changed", selectedElements);
	}
	var pointGripContainer = getElem("pathpointgrip_container");
// 		if(elem.nodeName == "path" && pointGripContainer) {
// 			pathActions.setPointContainerTransform(elem.getAttribute("transform"));
// 		}
	var selector = selectorManager.requestSelector(selectedElements[0]);
	selector.resize();
	selector.updateGripCursors(val);
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
		doSnapping = curConfig.gridSnapping && selected.parentNode.parentNode.localName === "svg",
		finishUp = function() {
			if(doSnapping) for(var o in changes) changes[o] = snapToGrid(changes[o]);
			assignAttributes(selected, changes, 1000, true);
		}
		box = getBBox(selected);
	
	for(var i = 0; i < 2; i++) {
		var type = i === 0 ? 'fill' : 'stroke';
		var attrVal = selected.getAttribute(type);
		if(attrVal && attrVal.indexOf('url(') === 0) {
			if(m.a < 0 || m.d < 0) {
				var grad = getRefElem(attrVal);
				var newgrad = grad.cloneNode(true);
	
				if(m.a < 0) {
					//flip x
					var x1 = newgrad.getAttribute('x1');
					var x2 = newgrad.getAttribute('x2');
					newgrad.setAttribute('x1', -(x1 - 1));
					newgrad.setAttribute('x2', -(x2 - 1));
				} 
				
				if(m.d < 0) {
					//flip y
					var y1 = newgrad.getAttribute('y1');
					var y2 = newgrad.getAttribute('y2');
					newgrad.setAttribute('y1', -(y1 - 1));
					newgrad.setAttribute('y2', -(y2 - 1));
				}
				newgrad.id = getNextId();
				findDefs().appendChild(newgrad);
				selected.setAttribute(type, 'url(#' + newgrad.id + ')');
			}
			
			// Not really working :(
// 			if(selected.tagName === 'path') {
// 				reorientGrads(selected, m);
// 			}
		}
	}


	var elName = selected.tagName;
	if(elName === "g" || elName === "text" || elName === "use") {
		// if it was a translate, then just update x,y
		if (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && 
			(m.e != 0 || m.f != 0) ) 
		{
			// [T][M] = [M][T']
			// therefore [T'] = [M_inv][T][M]
			var existing = transformListToTransform(selected).matrix,
				t_new = matrixMultiply(existing.inverse(), m, existing);
			changes.x = parseFloat(changes.x) + t_new.e;
			changes.y = parseFloat(changes.y) + t_new.f;
		}
		else {
			// we just absorb all matrices into the element and don't do any remapping
			var chlist = getTransformList(selected);
			var mt = svgroot.createSVGTransform();
			mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix,m));
			chlist.clear();
			chlist.appendItem(mt);
		}
	}
	
	// now we have a set of changes and an applied reduced transform list
	// we apply the changes directly to the DOM
	switch (elName)
	{
		case "foreignObject":
		case "rect":
		case "image":
			
			// Allow images to be inverted (give them matrix when flipped)
			if(elName === 'image' && (m.a < 0 || m.d < 0)) {
				// Convert to matrix
				var chlist = getTransformList(selected);
				var mt = svgroot.createSVGTransform();
				mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix,m));
				chlist.clear();
				chlist.appendItem(mt);
			} else {
				var pt1 = remap(changes.x,changes.y);
				
				changes.width = scalew(changes.width);
				changes.height = scaleh(changes.height);
				
				changes.x = pt1.x + Math.min(0,changes.width);
				changes.y = pt1.y + Math.min(0,changes.height);
				changes.width = Math.abs(changes.width);
				changes.height = Math.abs(changes.height);
			}
			finishUp();
			break;
		case "ellipse":
			var c = remap(changes.cx,changes.cy);
			changes.cx = c.x;
			changes.cy = c.y;
			changes.rx = scalew(changes.rx);
			changes.ry = scaleh(changes.ry);
		
			changes.rx = Math.abs(changes.rx);
			changes.ry = Math.abs(changes.ry);
			finishUp();
			break;
		case "circle":
			var c = remap(changes.cx,changes.cy);
			changes.cx = c.x;
			changes.cy = c.y;
			// take the minimum of the new selected box's dimensions for the new circle radius
			var tbox = svgedit.math.transformBox(box.x, box.y, box.width, box.height, m);
			var w = tbox.tr.x - tbox.tl.x, h = tbox.bl.y - tbox.tl.y;
			changes.r = Math.min(w/2, h/2);

			if(changes.r) changes.r = Math.abs(changes.r);
			finishUp();
			break;
		case "line":
			var pt1 = remap(changes.x1,changes.y1),
				pt2 = remap(changes.x2,changes.y2);
			changes.x1 = pt1.x;
			changes.y1 = pt1.y;
			changes.x2 = pt2.x;
			changes.y2 = pt2.y;
			
		case "text":
		case "use":
			finishUp();
			break;
		case "g":
			var gsvg = $(selected).data('gsvg');
			if(gsvg) {
				assignAttributes(gsvg, changes, 1000, true);
			}
			break;
		case "polyline":
		case "polygon":
			var len = changes.points.length;
			for (var i = 0; i < len; ++i) {
				var pt = changes.points[i];
				pt = remap(pt.x,pt.y);
				changes.points[i].x = pt.x;
				changes.points[i].y = pt.y;
			}

			var len = changes.points.length;
			var pstr = "";
			for (var i = 0; i < len; ++i) {
				var pt = changes.points[i];
				pstr += pt.x + "," + pt.y + " ";
			}
			selected.setAttribute("points", pstr);
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
			
			var len = changes.d.length,
				firstseg = changes.d[0],
				currentpt = remap(firstseg.x,firstseg.y);
			changes.d[0].x = currentpt.x;
			changes.d[0].y = currentpt.y;
			for (var i = 1; i < len; ++i) {
				var seg = changes.d[i];
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
			} // for each segment
		
			var dstr = "";
			var len = changes.d.length;
			for (var i = 0; i < len; ++i) {
				var seg = changes.d[i];
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
						dstr += seg.r1 + "," + seg.r2 + " " + seg.angle + " " + (+seg.largeArcFlag) +
							" " + (+seg.sweepFlag) + " " + seg.x + "," + seg.y + " ";
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
	var path = getRefElem(attr).firstChild;
	
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
			if (xform.type === 0) {
				tlist.removeItem(k);
			}
			// remove identity matrices
			else if (xform.type === 1) {
				if (svgedit.math.isIdentity(xform.matrix)) {
					tlist.removeItem(k);
				}
			}
			// remove zero-degree rotations
			else if (xform.type === 4) {
				if (xform.angle === 0) {
					tlist.removeItem(k);
				}
			}
		}
		// End here if all it has is a rotation
		if(tlist.numberOfItems === 1 && getRotationAngle(selected)) return null;
	}
	
	// if this element had no transforms, we are done
	if (!tlist || tlist.numberOfItems == 0) {
		selected.removeAttribute("transform");
		return null;
	}
	
	// TODO: Make this work for more than 2
	if (tlist) {
		var k = tlist.numberOfItems;
		var mxs = [];
		while (k--) {
			var xform = tlist.getItem(k);
			if (xform.type === 1) {
				mxs.push([xform.matrix, k]);
			} else if(mxs.length) {
				mxs = [];
			}
		}
		if(mxs.length === 2) {
			var m_new = svgroot.createSVGTransformFromMatrix(matrixMultiply(mxs[1][0], mxs[0][0]));
			tlist.removeItem(mxs[0][1]);
			tlist.removeItem(mxs[1][1]);
			tlist.insertItemBefore(m_new, mxs[1][1]);
		}
		
		// combine matrix + translate
		k = tlist.numberOfItems;
		if(k >= 2 && tlist.getItem(k-2).type === 1 && tlist.getItem(k-1).type === 2) {
			var mt = svgroot.createSVGTransform();
			
			var m = matrixMultiply(
				tlist.getItem(k-2).matrix, 
				tlist.getItem(k-1).matrix
			);		
			mt.setMatrix(m);
			tlist.removeItem(k-2);
			tlist.removeItem(k-2);
			tlist.appendItem(mt);
		}
	}
	
	// If it still has a single [M] or [R][M], return null too (prevents BatchCommand from being returned).
	switch ( selected.tagName ) {
		// Ignore these elements, as they can absorb the [M]
		case 'line':
		case 'polyline':
		case 'polygon':
		case 'path':
			break;
		default:
			if(
				(tlist.numberOfItems === 1 && tlist.getItem(0).type === 1)
				||  (tlist.numberOfItems === 2 && tlist.getItem(0).type === 1 && tlist.getItem(0).type === 4)
			) {
				return null;
			}
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
// 						logMatrix(translateBack.matrix);
// 						logMatrix(scale.matrix);
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
							if(clipPaths_done.indexOf(attr) === -1) {
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
							if(childTlist.numberOfItems) {
								childTlist.insertItemBefore(newxlate, 0);
							} else {
								childTlist.appendItem(newxlate);
							}
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
					
					// Convert stroke
					// TODO: Find out if this should actually happen somewhere else
					var sw = child.getAttribute("stroke-width");
					if (child.getAttribute("stroke") !== "none" && !isNaN(sw)) {
						var avg = (Math.abs(em.a) + Math.abs(em.d)) / 2;
						child.setAttribute('stroke-width', sw * avg);
					}

				}
			}
			tlist.clear();
		}
		// else it was just a rotate
		else {
			if (gangle) {
				var newRot = svgroot.createSVGTransform();
				newRot.setRotate(gangle,newcenter.x,newcenter.y);
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(newRot, 0);
				} else {
					tlist.appendItem(newRot);
				}
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
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(newRot, 0);
				} else {
					tlist.appendItem(newRot);
				}
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
						if(childTlist.numberOfItems) {
							childTlist.insertItemBefore(newxlate, 0);
						} else {
							childTlist.appendItem(newxlate);
						}

						batchCmd.addSubCommand( recalculateDimensions(child) );
						start_transform = old_start_transform;
					}
				}
			}
			
			if (gangle) {
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(rnew, 0);
				} else {
					tlist.appendItem(rnew);
				}
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
		// TODO: Make this work in Webkit using svgedit.transformlist.SVGTransformList
		if(!svgedit.browser.isWebkit()) {
			var fill = selected.getAttribute('fill');
			if(fill && fill.indexOf('url(') === 0) {
				var paint = getRefElem(fill);
				var type = 'pattern';
				if(paint.tagName !== type) type = 'gradient';
				var attrVal = paint.getAttribute(type + 'Units');
				if(attrVal === 'userSpaceOnUse') {
					//Update the userSpaceOnUse element
					m = transformListToTransform(tlist).matrix;
					var gtlist = getTransformList(paint);
					var gmatrix = transformListToTransform(gtlist).matrix;
					m = matrixMultiply(m, gmatrix);
					var m_str = "matrix(" + [m.a,m.b,m.c,m.d,m.e,m.f].join(",") + ")";
					paint.setAttribute(type + 'Transform', m_str);
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
				
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(newRot, 0);
				} else {
					tlist.appendItem(newRot);
				}
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
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(newRot, 0);
				} else {
					tlist.appendItem(newRot);
				}
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
				if(tlist.numberOfItems) {
					tlist.insertItemBefore(rnew, 0);
				} else {
					tlist.appendItem(rnew);
				}
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

		if(elem.tagName === 'a' && elem.childNodes.length === 1) {
			// Make "a" element's child be the selected element 
			elem = elem.firstChild;
		}

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

// Function: selectOnly()
// Selects only the given elements, shortcut for clearSelection(); addToSelection()
//
// Parameters:
// elems - an array of DOM elements to be selected
var selectOnly = this.selectOnly = function(elems, showGrips) {
	clearSelection(true);
	addToSelection(elems, showGrips);
}

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
	var newSelectedItems = new Array(selectedElements.length);
		j = 0,
		len = selectedElements.length;
	for (var i = 0; i < len; ++i) {
		var elem = selectedElements[i];
		if (elem) {
			// keep the item
			if (elemsToRemove.indexOf(elem) == -1) {
				newSelectedItems[j] = elem;
				j++;
			}
			else { // remove the item and its selector
				selectorManager.releaseSelector(elem);
			}
		}
	}
	// the copy becomes the master now
	selectedElements = newSelectedItems;
};

// Function: selectAllInCurrentLayer
// Clears the selection, then adds all elements in the current layer to the selection.
this.selectAllInCurrentLayer = function() {
	var current_layer = getCurrentDrawing().getCurrentLayer();
	if (current_layer) {
		current_mode = "select";
		selectOnly($(current_group || current_layer).children());
	}
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
	if (mouse_target.correspondingUseElement) mouse_target = mouse_target.correspondingUseElement;
	
	// for foreign content, go up until we find the foreignObject
	// WebKit browsers set the mouse target to the svgcanvas div 
	if ([mathns, htmlns].indexOf(mouse_target.namespaceURI) >= 0 && 
		mouse_target.id != "svgcanvas") 
	{
		while (mouse_target.nodeName != "foreignObject") {
			mouse_target = mouse_target.parentNode;
			if(!mouse_target) return svgroot;
		}
	}
	
	// Get the desired mouse_target with jQuery selector-fu
	// If it's root-like, select the root
	var current_layer = getCurrentDrawing().getCurrentLayer();
	if([svgroot, container, svgcontent, current_layer].indexOf(mouse_target) >= 0) {
		return svgroot;
	}
	
	var $target = $(mouse_target);

	// If it's a selection grip, return the grip parent
	if($target.closest('#selectorParentGroup').length) {
		// While we could instead have just returned mouse_target, 
		// this makes it easier to indentify as being a selector grip
		return selectorManager.selectorParentGroup;
	}

	while (mouse_target.parentNode !== (current_group || current_layer)) {
		mouse_target = mouse_target.parentNode;
	}
	
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
	var d_attr = null,
		start_x = null,
		start_y = null,
		r_start_x = null,
		r_start_y = null,
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
		if(canvas.spaceKey || evt.button === 1) return;
		
		var right_click = evt.button === 2;
	
		if(evt.altKey) { // duplicate when  dragging
			svgCanvas.cloneSelectedElements(0,0);
		}
	
		root_sctm = svgcontent.getScreenCTM().inverse();
		
		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = pt.x * current_zoom,
			mouse_y = pt.y * current_zoom;
			
		evt.preventDefault();

		if(right_click) {
			current_mode = "select";
			lastClickPoint = pt;
		}
		
		// This would seem to be unnecessary...
// 		if(['select', 'resize'].indexOf(current_mode) == -1) {
// 			setGradient();
// 		}
		
		var x = mouse_x / current_zoom,
			y = mouse_y / current_zoom,
			mouse_target = getMouseTarget(evt);
		
		if(mouse_target.tagName === 'a' && mouse_target.childNodes.length === 1) {
			mouse_target = mouse_target.firstChild;
		}
		
		// real_x/y ignores grid-snap value
		var real_x = r_start_x = start_x = x;
		var real_y = r_start_y = start_y = y;

		if(curConfig.gridSnapping){
			x = snapToGrid(x);
			y = snapToGrid(y);
			start_x = snapToGrid(start_x);
			start_y = snapToGrid(start_y);
		}

		// if it is a selector grip, then it must be a single element selected, 
		// set the mouse_target to that and update the mode to rotate/resize
		
		if (mouse_target == selectorManager.selectorParentGroup && selectedElements[0] != null) {
			var grip = evt.target;
			var griptype = elData(grip, "type");
			// rotating
			if (griptype == "rotate") {
				current_mode = "rotate";
			}
			// resizing
			else if(griptype == "resize") {
				current_mode = "resize";
				current_resize_mode = elData(grip, "dir");
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
							if(slist.numberOfItems) {
								slist.insertItemBefore(svgroot.createSVGTransform(), 0);
							} else {
								slist.appendItem(svgroot.createSVGTransform());
							}
						}
					}
				}
				else if(!right_click){
					clearSelection();
					current_mode = "multiselect";
					if (rubberBox == null) {
						rubberBox = selectorManager.getRubberBandBox();
					}
					r_start_x *= current_zoom;
					r_start_y *= current_zoom;
// 					console.log('p',[evt.pageX, evt.pageY]);					
// 					console.log('c',[evt.clientX, evt.clientY]);	
// 					console.log('o',[evt.offsetX, evt.offsetY]);	
// 					console.log('s',[start_x, start_y]);
					
					assignAttributes(rubberBox, {
						'x': r_start_x,
						'y': r_start_y,
						'width': 0,
						'height': 0,
						'display': 'inline'
					}, 100);
				}
				break;
			case "zoom": 
				started = true;
				if (rubberBox == null) {
					rubberBox = selectorManager.getRubberBandBox();
				}
				assignAttributes(rubberBox, {
						'x': real_x * current_zoom,
						'y': real_x * current_zoom,
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
				var bb = {};
				$.each(init_bbox, function(key, val) {
					bb[key] = val/current_zoom;
				});
				init_bbox = bb;
				
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
					
					if(svgedit.browser.supportsNonScalingStroke()) {
						mouse_target.style.vectorEffect = 'non-scaling-stroke';
						var all = mouse_target.getElementsByTagName('*'), len = all.length;
						for(var i = 0; i < all.length; i++) {
							all[i].style.vectorEffect = 'non-scaling-stroke';
						}
					}
				}
				break;
			case "fhellipse":
			case "fhrect":
			case "fhpath":
				started = true;
				d_attr = real_x + "," + real_y + " ";
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
				freehand.minx = real_x;
				freehand.maxx = real_x;
				freehand.miny = real_y;
				freehand.maxy = real_y;
				break;
			case "image":
				started = true;
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
						"xml:space": "preserve",
						"opacity": cur_shape.opacity
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
				canvas.undoMgr.beginUndoableChange("transform", selectedElements);
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
	var mouseMove = function(evt)
	{
		if (!started) return;
		if(evt.button === 1 || canvas.spaceKey) return;

		var selected = selectedElements[0],
			pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
			mouse_x = pt.x * current_zoom,
			mouse_y = pt.y * current_zoom,
			shape = getElem(getId());

		var real_x = x = mouse_x / current_zoom;
		var real_y = y = mouse_y / current_zoom;

		if(curConfig.gridSnapping){
			x = snapToGrid(x);
			y = snapToGrid(y);
		}

		evt.preventDefault();
		
		switch (current_mode)
		{
			case "select":
				// we temporarily use a translate on the element(s) being dragged
				// this transform is removed upon mousing up and the element is 
				// relocated to the new location
				if (selectedElements[0] !== null) {
					var dx = x - start_x;
					var dy = y - start_y;
					
					if(curConfig.gridSnapping){
						dx = snapToGrid(dx);
						dy = snapToGrid(dy);
					}

					if(evt.shiftKey) { var xya = snapToAngle(start_x,start_y,x,y); x=xya.x; y=xya.y; }

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
						
						call("transition", selectedElements);
					}
				}
				break;
			case "multiselect":
				real_x *= current_zoom;
				real_y *= current_zoom;
				assignAttributes(rubberBox, {
					'x': Math.min(r_start_x, real_x),
					'y': Math.min(r_start_y, real_y),
					'width': Math.abs(real_x - r_start_x),
					'height': Math.abs(real_y - r_start_y)
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
				
				if(curConfig.gridSnapping){
					dx = snapToGrid(dx);
					dy = snapToGrid(dy);
					height = snapToGrid(height);
					width = snapToGrid(width);
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
				if(current_resize_mode.indexOf("n") >= 0) {
					sy = height ? (height-dy)/height : 1;
					ty = height;
				}
				
				// if we dragging on the east side, then adjust the scale factor and tx
				if(current_resize_mode.indexOf("w") >= 0) {
					sx = width ? (width-dx)/width : 1;
					tx = width;
				}
				
				// update the transform list with translate,scale,translate
				var translateOrigin = svgroot.createSVGTransform(),
					scale = svgroot.createSVGTransform(),
					translateBack = svgroot.createSVGTransform();

				if(curConfig.gridSnapping){
					left = snapToGrid(left);
					tx = snapToGrid(tx);
					top = snapToGrid(top);
					ty = snapToGrid(ty);
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

				selectorManager.requestSelector(selected).resize();
				
				call("transition", selectedElements);
				
				break;
			case "zoom":
				real_x *= current_zoom;
				real_y *= current_zoom;
				assignAttributes(rubberBox, {
					'x': Math.min(r_start_x*current_zoom, real_x),
					'y': Math.min(r_start_y*current_zoom, real_y),
					'width': Math.abs(real_x - r_start_x*current_zoom),
					'height': Math.abs(real_y - r_start_y*current_zoom)
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

				if(curConfig.gridSnapping){
					x = snapToGrid(x);
					y = snapToGrid(y);
				}

				var x2 = x;
				var y2 = y;					

				if(evt.shiftKey) { var xya = snapToAngle(start_x,start_y,x2,y2); x2=xya.x; y2=xya.y; }
				
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
	
				if(curConfig.gridSnapping){
					w = snapToGrid(w);
					h = snapToGrid(h);
					new_x = snapToGrid(new_x);
					new_y = snapToGrid(new_y);
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
				if(curConfig.gridSnapping){
					rad = snapToGrid(rad);
				}
				shape.setAttributeNS(null, "r", rad);
				break;
			case "ellipse":
				var c = $(shape).attr(["cx", "cy"]);
				var cx = c.cx, cy = c.cy;
				// Opera has a problem with suspendRedraw() apparently
					handle = null;
				if (!window.opera) svgroot.suspendRedraw(1000);
				if(curConfig.gridSnapping){
					x = snapToGrid(x);
					cx = snapToGrid(cx);
					y = snapToGrid(y);
					cy = snapToGrid(cy);
				}
				shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
				var ry = Math.abs(evt.shiftKey?(x - cx):(y - cy));
				shape.setAttributeNS(null, "ry", ry );
				if (!window.opera) svgroot.unsuspendRedraw(handle);
				break;
			case "fhellipse":
			case "fhrect":
				freehand.minx = Math.min(real_x, freehand.minx);
				freehand.maxx = Math.max(real_x, freehand.maxx);
				freehand.miny = Math.min(real_y, freehand.miny);
				freehand.maxy = Math.max(real_y, freehand.maxy);
			// break; missing on purpose
			case "fhpath":
				d_attr += + real_x + "," + real_y + " ";
				shape.setAttributeNS(null, "points", d_attr);
				break;
			// update path stretch line coordinates
			case "path":
				// fall through
			case "pathedit":
				x *= current_zoom;
				y *= current_zoom;
				
				if(curConfig.gridSnapping){
					x = snapToGrid(x);
					y = snapToGrid(y);
					start_x = snapToGrid(start_x);
					start_y = snapToGrid(start_y);
				}
				if(evt.shiftKey) {
					var path = svgedit.path.path;
					if(path) {
						var x1 = path.dragging?path.dragging[0]:start_x;
						var y1 = path.dragging?path.dragging[1]:start_y;
					} else {
						var x1 = start_x;
						var y1 = start_y;
					}
					var xya = snapToAngle(x1,y1,x,y);
					x=xya.x; y=xya.y;
				}
				
				if(rubberBox && rubberBox.getAttribute('display') !== 'none') {
					real_x *= current_zoom;
					real_y *= current_zoom;
					assignAttributes(rubberBox, {
						'x': Math.min(r_start_x*current_zoom, real_x),
						'y': Math.min(r_start_y*current_zoom, real_y),
						'width': Math.abs(real_x - r_start_x*current_zoom),
						'height': Math.abs(real_y - r_start_y*current_zoom)
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
				if(curConfig.gridSnapping){
					angle = snapToGrid(angle);
				}
				if(evt.shiftKey) { // restrict rotations to nice angles (WRS)
					var snap = 45;
					angle= Math.round(angle/snap)*snap;
				}

				canvas.setRotationAngle(angle<-180?(360+angle):angle, true);
				call("transition", selectedElements);
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

		var real_x = x;
		var real_y = y;

		// TODO: Make true when in multi-unit mode
		var useUnit = false; // (curConfig.baseUnit !== 'px');
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
					if (real_x != r_start_x || real_y != r_start_y) {
						var len = selectedElements.length;
						for	(var i = 0; i < len; ++i) {
							if (selectedElements[i] == null) break;
							if(!selectedElements[i].firstChild) {
								// Not needed for groups (incorrectly resizes elems), possibly not needed at all?
								selectorManager.requestSelector(selectedElements[i]).resize();
							}
						}
					}
					// no change in position/size, so maybe we should move to pathedit
					else {
						var t = evt.target;
						if (selectedElements[0].nodeName === "path" && selectedElements[1] == null) {
							pathActions.select(selectedElements[0]);
						} // if it was a path
						// else, if it was selected and this is a shift-click, remove it from selection
						else if (evt.shiftKey) {
							if(tempJustSelected != t) {
								canvas.removeFromSelection([t]);
							}
						}
					} // no change in mouse position
					
					// Remove non-scaling stroke
					if(svgedit.browser.supportsNonScalingStroke()) {
						var elem = selectedElements[0];
						if (elem) {
							elem.removeAttribute('style');
							svgedit.utilities.walkTree(elem, function(elem) {
								elem.removeAttribute('style');
							});
						}
					}

				}
				return;
				break;
			case "zoom":
				if (rubberBox != null) {
					rubberBox.setAttribute("display", "none");
				}
				var factor = evt.shiftKey?.5:2;
				call("zoomed", {
					'x': Math.min(r_start_x, real_x),
					'y': Math.min(r_start_y, real_y),
					'width': Math.abs(real_x - r_start_x),
					'height': Math.abs(real_y - r_start_y),
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
				selectOnly([element]);
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
				var batchCmd = canvas.undoMgr.finishUndoableChange();
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
			getCurrentDrawing().releaseId(getId());
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
			if ( (current_mode != "path" || !drawn_path) &&
				t.parentNode.id != "selectorParentGroup" &&
				t.id != "svgcanvas" && t.id != "svgroot") 
			{
				// switch into "select" mode if we've clicked on an element
				canvas.setMode("select");
				selectOnly([t], true);
			}
			
		} else if (element != null) {
			canvas.addedNew = true;
			
			if(useUnit) svgedit.units.convertAttrs(element);
			
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
				if(current_mode === "path") {
					pathActions.toEditMode(element);
				} else {
					if(curConfig.selectNew) {
						selectOnly([element], true);
					}
				}
				// we create the insert command that is stored on the stack
				// undo means to call cmd.unapply(), redo means to call cmd.apply()
				addCommandToHistory(new InsertElementCommand(element));
				
				call("changed",[element]);
			}, ani_dur * 1000);
		}
		
		start_transform = null;
	};
	
	var dblClick = function(evt) {
		var evt_target = evt.target;
		var parent = evt_target.parentNode;
		
		// Do nothing if already in current group
		if(parent === current_group) return;
		
		var mouse_target = getMouseTarget(evt);
		var tagName = mouse_target.tagName;
		
		if(tagName === 'text' && current_mode !== 'textedit') {
			var pt = transformPoint( evt.pageX, evt.pageY, root_sctm );
			textActions.select(mouse_target, pt.x, pt.y);
		}
		
		if((tagName === "g" || tagName === "a") && getRotationAngle(mouse_target)) {
			// TODO: Allow method of in-group editing without having to do 
			// this (similar to editing rotated paths)
		
			// Ungroup and regroup
			pushGroupProperties(mouse_target);
			mouse_target = selectedElements[0];
			clearSelection(true);
		}
		// Reset context
		if(current_group) {
			leaveContext();
		}
		
		if((parent.tagName !== 'g' && parent.tagName !== 'a') ||
			parent === getCurrentDrawing().getCurrentLayer() ||
			mouse_target === selectorManager.selectorParentGroup)
		{
			// Escape from in-group edit
			return;
		}
		setContext(mouse_target);
	}

	// prevent links from being followed in the canvas
	var handleLinkInCanvas = function(e) {
		e.preventDefault();
		return false;
	};
	
	// Added mouseup to the container here.
	// TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.
	$(container).mousedown(mouseDown).mousemove(mouseMove).click(handleLinkInCanvas).dblclick(dblClick).mouseup(mouseUp);
//	$(window).mouseup(mouseUp);
	
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
	var curtext;
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
		if(!allow_dbl || !curtext) return;
	
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
			curtext = target;
			textActions.toEditMode(x, y);
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
// 					&& !svgedit.math.rectsIntersect(transbb, {x: pt.x, y: pt.y, width:0, height:0})) {
// 					textActions.toSelectMode(true);				
// 				}

			if(
				evt.target !== curtext
				&&	mouse_x < last_x + 2
				&& mouse_x > last_x - 2
				&&	mouse_y < last_y + 2
				&& mouse_y > last_y - 2) {

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
			
// 				if(svgedit.browser.supportsEditableText()) {
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
			
// 				if(svgedit.browser.supportsEditableText()) {
// 					curtext.removeAttribute('editable');
// 				}
		},
		setInputElem: function(elem) {
			textinput = elem;
// 			$(textinput).blur(hideCursor);
		},
		clear: function() {
			if(current_mode == "textedit") {
				textActions.toSelectMode();
			}
		},
		init: function(inputElem) {
			if(!curtext) return;

// 				if(svgedit.browser.supportsEditableText()) {
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
				
				if(!svgedit.browser.supportsGoodTextCharPos()) {
					var offset = canvas.contentW * current_zoom;
					start.x -= offset;
					end.x -= offset;
					
					start.x /= current_zoom;
					end.x /= current_zoom;
				}
				
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

// TODO: Migrate all of this code into path.js
// Group: Path edit functions
// Functions relating to editing path elements
var pathActions = canvas.pathActions = function() {
	
	var subpath = false;
	var current_path;
	var newPoint, firstCtrl;
	
	function resetD(p) {
		p.setAttribute("d", pathActions.convertPath(p));
	}

	// TODO: Move into path.js
		svgedit.path.Path.prototype.endChanges = function(text) {
			if(svgedit.browser.isWebkit()) resetD(this.elem);
			var cmd = new ChangeElementCommand(this.elem, {d: this.last_d}, text);
			addCommandToHistory(cmd);
			call("changed", [this.elem]);
		}

		svgedit.path.Path.prototype.addPtsToSelection = function(indexes) {
			if(!$.isArray(indexes)) indexes = [indexes];
			for(var i=0; i< indexes.length; i++) {
				var index = indexes[i];
				var seg = this.segs[index];
				if(seg.ptgrip) {
					if(this.selected_pts.indexOf(index) == -1 && index >= 0) {
						this.selected_pts.push(index);
					}
				}
			};
			this.selected_pts.sort();
			var i = this.selected_pts.length,
				grips = new Array(i);
			// Loop through points to be selected and highlight each
			while(i--) {
				var pt = this.selected_pts[i];
				var seg = this.segs[pt];
				seg.select(true);
				grips[i] = seg.ptgrip;
			}
			// TODO: Correct this:
			pathActions.canDeleteNodes = true;
			
			pathActions.closed_subpath = this.subpathIsClosed(this.selected_pts[0]);
			
			call("selected", grips);
		}

	var current_path = null,
		drawn_path = null,
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
					var newpts = svgedit.path.smoothControlPoints( prevCtlPt, ct1, curpos );
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
			// No need to call "changed", as this is already done under mouseUp
		}
		return element;
	};

	// If the path was rotated, we must now pay the piper:
	// Every path point must be rotated into the rotated coordinate system of 
	// its old center, then determine the new center, then rotate it back
	// This is because we want the path to remember its rotation
	
	// TODO: This is still using ye olde transform methods, can probably
	// be optimized or even taken care of by recalculateDimensions
	var recalcRotatedPath = function() {
		var current_path = svgedit.path.path.elem;
		var angle = getRotationAngle(current_path, true);
		if(!angle) return;
		selectedBBoxes[0] = svgedit.path.path.oldbbox;
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
			svgedit.path.replacePathSeg(type, i, points);
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
		getPath: function() {
			return svgedit.path.path;
		},
		mouseDown: function(evt, mouse_target, start_x, start_y) {
			if(current_mode === "path") {
				mouse_x = start_x;
				mouse_y = start_y;
				
				var x = mouse_x/current_zoom,
					y = mouse_y/current_zoom,
					stretchy = getElem("path_stretch_line");
				newPoint = [x, y];	
				
				if(curConfig.gridSnapping){
					x = snapToGrid(x);
					y = snapToGrid(y);
					mouse_x = snapToGrid(mouse_x);
					mouse_y = snapToGrid(mouse_y);
				}

				if (!stretchy) {
					stretchy = document.createElementNS(svgns, "path");
					assignAttributes(stretchy, {
						'id': "path_stretch_line",
						'stroke': "#22C",
						'stroke-width': "0.5",
						'fill': 'none'
					});
					stretchy = getElem("selectorParentGroup").appendChild(stretchy);
				}
				stretchy.setAttribute("display", "inline");
				
				var keep = null;
				
				// if pts array is empty, create path element with M at current point
				if (!drawn_path) {
					d_attr = "M" + x + "," + y + " ";
					drawn_path = addSvgElementFromJson({
						"element": "path",
						"curStyles": true,
						"attr": {
							"d": d_attr,
							"id": getNextId(),
							"opacity": cur_shape.opacity / 2
						}
					});
					// set stretchy line to first point
					stretchy.setAttribute('d', ['M', mouse_x, mouse_y, mouse_x, mouse_y].join(' '));
					var index = subpath ? svgedit.path.path.segs.length : 0;
					svgedit.path.addPointGrip(index, mouse_x, mouse_y);
				}
				else {
					// determine if we clicked on an existing point
					var seglist = drawn_path.pathSegList;
					var i = seglist.numberOfItems;
					var FUZZ = 6/current_zoom;
					var clickOnPoint = false;
					while(i) {
						i --;
						var item = seglist.getItem(i);
						var px = item.x, py = item.y;
						// found a matching point
						if ( x >= (px-FUZZ) && x <= (px+FUZZ) && y >= (py-FUZZ) && y <= (py+FUZZ) ) {
							clickOnPoint = true;
							break;
						}
					}
					
					// get path element that we are in the process of creating
					var id = getId();
				
					// Remove previous path object if previously created
					svgedit.path.removePath_(id);
					
					var newpath = getElem(id);
					
					var len = seglist.numberOfItems;
					// if we clicked on an existing point, then we are done this path, commit it
					// (i,i+1) are the x,y that were clicked on
					if (clickOnPoint) {
						// if clicked on any other point but the first OR
						// the first point was clicked on and there are less than 3 points
						// then leave the path open
						// otherwise, close the path
						if (i <= 1 && len >= 2) {
							// Create end segment
							var abs_x = seglist.getItem(0).x;
							var abs_y = seglist.getItem(0).y;
							

							var s_seg = stretchy.pathSegList.getItem(1);
							if(s_seg.pathSegType === 4) {
								var newseg = drawn_path.createSVGPathSegLinetoAbs(abs_x, abs_y);
							} else {
								var newseg = drawn_path.createSVGPathSegCurvetoCubicAbs(
									abs_x,
									abs_y,
									s_seg.x1 / current_zoom,
									s_seg.y1 / current_zoom,
									abs_x,
									abs_y
								);
							}
							
							var endseg = drawn_path.createSVGPathSegClosePath();
							seglist.appendItem(newseg);
							seglist.appendItem(endseg);
						} else if(len < 3) {
							keep = false;
							return keep;
						}
						$(stretchy).remove();
						
						// this will signal to commit the path
						element = newpath;
						drawn_path = null;
						started = false;
						
						if(subpath) {
							if(svgedit.path.path.matrix) {
								remapElement(newpath, {}, svgedit.path.path.matrix.inverse());
							}
						
							var new_d = newpath.getAttribute("d");
							var orig_d = $(svgedit.path.path.elem).attr("d");
							$(svgedit.path.path.elem).attr("d", orig_d + new_d);
							$(newpath).remove();
							if(svgedit.path.path.matrix) {
								recalcRotatedPath();
							}
							svgedit.path.path.init();
							pathActions.toEditMode(svgedit.path.path.elem);
							svgedit.path.path.selectPt();
							return false;
						}
					}
					// else, create a new point, update path element
					else {
						// Checks if current target or parents are #svgcontent
						if(!$.contains(container, getMouseTarget(evt))) {
							// Clicked outside canvas, so don't make point
							console.log("Clicked outside canvas");
							return false;
						}

						var num = drawn_path.pathSegList.numberOfItems;
						var last = drawn_path.pathSegList.getItem(num -1);
						var lastx = last.x, lasty = last.y;

						if(evt.shiftKey) { var xya = snapToAngle(lastx,lasty,x,y); x=xya.x; y=xya.y; }
						
						// Use the segment defined by stretchy
						var s_seg = stretchy.pathSegList.getItem(1);
						if(s_seg.pathSegType === 4) {
							var newseg = drawn_path.createSVGPathSegLinetoAbs(round(x), round(y));
						} else {
							var newseg = drawn_path.createSVGPathSegCurvetoCubicAbs(
								round(x),
								round(y),
								s_seg.x1 / current_zoom,
								s_seg.y1 / current_zoom,
								s_seg.x2 / current_zoom,
								s_seg.y2 / current_zoom
							);
						}
						
						drawn_path.pathSegList.appendItem(newseg);
						
						x *= current_zoom;
						y *= current_zoom;
						
						// set stretchy line to latest point
						stretchy.setAttribute('d', ['M', x, y, x, y].join(' '));
						var index = num;
						if(subpath) index += svgedit.path.path.segs.length;
						svgedit.path.addPointGrip(index, x, y);
					}
// 					keep = true;
				}
				
				return;
			}
			
			// TODO: Make sure current_path isn't null at this point
			if(!svgedit.path.path) return;
			
			svgedit.path.path.storeD();
			
			var id = evt.target.id;
			if (id.substr(0,14) == "pathpointgrip_") {
				// Select this point
				var cur_pt = svgedit.path.path.cur_pt = parseInt(id.substr(14));
				svgedit.path.path.dragging = [start_x, start_y];
				var seg = svgedit.path.path.segs[cur_pt];
				
				// only clear selection if shift is not pressed (otherwise, add 
				// node to selection)
				if (!evt.shiftKey) {
					if(svgedit.path.path.selected_pts.length <= 1 || !seg.selected) {
						svgedit.path.path.clearSelection();
					}
					svgedit.path.path.addPtsToSelection(cur_pt);
				} else if(seg.selected) {
					svgedit.path.path.removePtFromSelection(cur_pt);
				} else {
					svgedit.path.path.addPtsToSelection(cur_pt);
				}
			} else if(id.indexOf("ctrlpointgrip_") == 0) {
				svgedit.path.path.dragging = [start_x, start_y];
				
				var parts = id.split('_')[1].split('c');
				var cur_pt = parts[0]-0;
				var ctrl_num = parts[1]-0;
				svgedit.path.path.selectPt(cur_pt, ctrl_num);
			}

			// Start selection box
			if(!svgedit.path.path.dragging) {
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
			if(current_mode === "path") {
				if(!drawn_path) return;
				var seglist = drawn_path.pathSegList;
				var index = seglist.numberOfItems - 1;

				if(newPoint) {
					// First point
// 					if(!index) return;

					// Set control points
					var pointGrip1 = svgedit.path.addCtrlGrip('1c1');
					var pointGrip2 = svgedit.path.addCtrlGrip('0c2');
					
					// dragging pointGrip1
					pointGrip1.setAttribute('cx', mouse_x);
					pointGrip1.setAttribute('cy', mouse_y);
					pointGrip1.setAttribute('display', 'inline');

					var pt_x = newPoint[0];
					var pt_y = newPoint[1];
					
					// set curve
					var seg = seglist.getItem(index);
					var cur_x = mouse_x / current_zoom;
					var cur_y = mouse_y / current_zoom;
					var alt_x = (pt_x + (pt_x - cur_x));
					var alt_y = (pt_y + (pt_y - cur_y));
					
					pointGrip2.setAttribute('cx', alt_x * current_zoom);
					pointGrip2.setAttribute('cy', alt_y * current_zoom);
					pointGrip2.setAttribute('display', 'inline');
					
					var ctrlLine = svgedit.path.getCtrlLine(1);
					assignAttributes(ctrlLine, {
						x1: mouse_x,
						y1: mouse_y,
						x2: alt_x * current_zoom,
						y2: alt_y * current_zoom,
						display: 'inline'
					});

					if(index === 0) {
						firstCtrl = [mouse_x, mouse_y];
					} else {
						var last_x, last_y;
						
						var last = seglist.getItem(index - 1);
						var last_x = last.x;
						var last_y = last.y
	
						if(last.pathSegType === 6) {
							last_x += (last_x - last.x2);
							last_y += (last_y - last.y2);
						} else if(firstCtrl) {
							last_x = firstCtrl[0];
							last_y = firstCtrl[1];
						}
						svgedit.path.replacePathSeg(6, index, [pt_x, pt_y, last_x, last_y, alt_x, alt_y], drawn_path);
					}
				} else {
					var stretchy = getElem("path_stretch_line");
					if (stretchy) {
						var prev = seglist.getItem(index);
						if(prev.pathSegType === 6) {
							var prev_x = prev.x + (prev.x - prev.x2);
							var prev_y = prev.y + (prev.y - prev.y2);
							svgedit.path.replacePathSeg(6, 1, [mouse_x, mouse_y, prev_x * current_zoom, prev_y * current_zoom, mouse_x, mouse_y], stretchy);							
						} else if(firstCtrl) {
							svgedit.path.replacePathSeg(6, 1, [mouse_x, mouse_y, firstCtrl[0], firstCtrl[1], mouse_x, mouse_y], stretchy);
						} else {
							svgedit.path.replacePathSeg(4, 1, [mouse_x, mouse_y], stretchy);
						}
					}
				}
				return;
			}
			// if we are dragging a point, let's move it
			if (svgedit.path.path.dragging) {
				var pt = svgedit.path.getPointFromGrip({
					x: svgedit.path.path.dragging[0],
					y: svgedit.path.path.dragging[1]
				}, svgedit.path.path);
				var mpt = svgedit.path.getPointFromGrip({
					x: mouse_x,
					y: mouse_y
				}, svgedit.path.path);
				var diff_x = mpt.x - pt.x;
				var diff_y = mpt.y - pt.y;
				svgedit.path.path.dragging = [mouse_x, mouse_y];
				
				if(svgedit.path.path.dragctrl) {
					svgedit.path.path.moveCtrl(diff_x, diff_y);
				} else {
					svgedit.path.path.movePts(diff_x, diff_y);
				}
			} else {
				svgedit.path.path.selected_pts = [];
				svgedit.path.path.eachSeg(function(i) {
					var seg = this;
					if(!seg.next && !seg.prev) return;
						
					var item = seg.item;
					var rbb = rubberBox.getBBox();
					
					var pt = svgedit.path.getGripPt(seg);
					var pt_bb = {
						x: pt.x,
						y: pt.y,
						width: 0,
						height: 0
					};
				
					var sel = svgedit.math.rectsIntersect(rbb, pt_bb);

					this.select(sel);
					//Note that addPtsToSelection is not being run
					if(sel) svgedit.path.path.selected_pts.push(seg.index);
				});

			}
		}, 
		mouseUp: function(evt, element, mouse_x, mouse_y) {
			
			// Create mode
			if(current_mode === "path") {
				newPoint = null;
				if(!drawn_path) {
					element = getElem(getId());
					started = false;
					firstCtrl = null;
				}

				return {
					keep: true,
					element: element
				}
			}
			
			// Edit mode
			
			if (svgedit.path.path.dragging) {
				var last_pt = svgedit.path.path.cur_pt;

				svgedit.path.path.dragging = false;
				svgedit.path.path.dragctrl = false;
				svgedit.path.path.update();
				
			
				if(hasMoved) {
					svgedit.path.path.endChanges("Move path point(s)");
				} 
				
				if(!evt.shiftKey && !hasMoved) {
					svgedit.path.path.selectPt(last_pt);
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
		toEditMode: function(element) {
			svgedit.path.path = svgedit.path.getPath_(element);
			current_mode = "pathedit";
			clearSelection();
			svgedit.path.path.show(true).update();
			svgedit.path.path.oldbbox = getBBox(svgedit.path.path.elem);
			subpath = false;
		},
		toSelectMode: function(elem) {
			var selPath = (elem == svgedit.path.path.elem);
			current_mode = "select";
			svgedit.path.path.show(false);
			current_path = false;
			clearSelection();
			
			if(svgedit.path.path.matrix) {
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
				pathActions.toEditMode(svgedit.path.path.elem);
			}
		},
		select: function(target) {
			if (current_path === target) {
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
			svgedit.path.getPath_(elem).show(false).matrix = null; 

			this.clear();
	
			addToSelection([elem], true);
			call("changed", selectedElements);
		},
		
		clear: function(remove) {
			current_path = null;
			if (drawn_path) {
				var elem = getElem(getId());
				$(getElem("path_stretch_line")).remove();
				$(elem).remove();
				$(getElem("pathpointgrip_container")).find('*').attr('display', 'none');
				drawn_path = firstCtrl = null;
				started = false;
			} else if (current_mode == "pathedit") {
				this.toSelectMode();
			}
			if(svgedit.path.path) svgedit.path.path.init().show(false);
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
			var last_x, last_y;


			for (var i = 0; i < len; ++i) {
				var seg = segList.getItem(i);
				var type = seg.pathSegType;
				if(type == 1) continue;
				var pts = [];
				$.each(['',1,2], function(j, n) {
					var x = seg['x'+n], y = seg['y'+n];
					if(x !== undefined && y !== undefined) {
						var pt = transformPoint(x, y, m);
						pts.splice(pts.length, 0, pt.x, pt.y);
					}
				});
				svgedit.path.replacePathSeg(type, i, pts, path);
			}
			
			reorientGrads(path, m);


		},
		zoomChange: function() {
			if(current_mode == "pathedit") {
				svgedit.path.path.update();
			}
		},
		getNodePoint: function() {
			var sel_pt = svgedit.path.path.selected_pts.length ? svgedit.path.path.selected_pts[0] : 1;

			var seg = svgedit.path.path.segs[sel_pt];
			return {
				x: seg.item.x,
				y: seg.item.y,
				type: seg.type
			};
		}, 
		linkControlPoints: function(linkPoints) {
			svgedit.path.setLinkControlPoints(linkPoints);
		},
		clonePathNode: function() {
			svgedit.path.path.storeD();
			
			var sel_pts = svgedit.path.path.selected_pts;
			var segs = svgedit.path.path.segs;
			
			var i = sel_pts.length;
			var nums = [];

			while(i--) {
				var pt = sel_pts[i];
				svgedit.path.path.addSeg(pt);
				
				nums.push(pt + i);
				nums.push(pt + i + 1);
			}
			svgedit.path.path.init().addPtsToSelection(nums);

			svgedit.path.path.endChanges("Clone path node(s)");
		},
		opencloseSubPath: function() {
			var sel_pts = svgedit.path.path.selected_pts;
			// Only allow one selected node for now
			if(sel_pts.length !== 1) return;
			
			var elem = svgedit.path.path.elem;
			var list = elem.pathSegList;

			var len = list.numberOfItems;

			var index = sel_pts[0];
			
			var open_pt = null;
			var start_item = null;

			// Check if subpath is already open
			svgedit.path.path.eachSeg(function(i) {
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
				open_pt = svgedit.path.path.segs.length - 1;
			}

			if(open_pt !== false) {
				// Close this path
				
				// Create a line going to the previous "M"
				var newseg = elem.createSVGPathSegLinetoAbs(start_item.x, start_item.y);
			
				var closer = elem.createSVGPathSegClosePath();
				if(open_pt == svgedit.path.path.segs.length - 1) {
					list.appendItem(newseg);
					list.appendItem(closer);
				} else {
					svgedit.path.insertItemBefore(elem, closer, open_pt);
					svgedit.path.insertItemBefore(elem, newseg, open_pt);
				}
				
				svgedit.path.path.init().selectPt(open_pt+1);
				return;
			}
			
			

			// M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
			// M 2,2 L 3,3 L 1,1
			
			// M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z 
			// M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z 
			
			var seg = svgedit.path.path.segs[index];
			
			if(seg.mate) {
				list.removeItem(index); // Removes last "L"
				list.removeItem(index); // Removes the "Z"
				svgedit.path.path.init().selectPt(index - 1);
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
				svgedit.path.insertItemBefore(elem, list.getItem(last_m), z_seg);
			}
			
			var pt = list.getItem(last_m);
			
			// Make this point the new "M"
			svgedit.path.replacePathSeg(2, last_m, [pt.x, pt.y]);
			
			var i = index
			
			svgedit.path.path.init().selectPt(0);
		},
		deletePathNode: function() {
			if(!pathActions.canDeleteNodes) return;
			svgedit.path.path.storeD();
			
			var sel_pts = svgedit.path.path.selected_pts;
			var i = sel_pts.length;

			while(i--) {
				var pt = sel_pts[i];
				svgedit.path.path.deleteSeg(pt);
			}
			
			// Cleanup
			var cleanup = function() {
				var segList = svgedit.path.path.elem.pathSegList;
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
			if(svgedit.path.path.elem.pathSegList.numberOfItems <= 1) {
				pathActions.toSelectMode(svgedit.path.path.elem);
				canvas.deleteSelectedElements();
				return;
			}
			
			svgedit.path.path.init();
			
			svgedit.path.path.clearSelection();
			
			// TODO: Find right way to select point now
			// path.selectPt(sel_pt);
			if(window.opera) { // Opera repaints incorrectly
				var cp = $(svgedit.path.path.elem); cp.attr('d',cp.attr('d'));
			}
			svgedit.path.path.endChanges("Delete path node(s)");
		},
		smoothPolylineIntoPath: smoothPolylineIntoPath,
		setSegType: function(v) {
			svgedit.path.path.setSegType(v);
		},
		moveNode: function(attr, newValue) {
			var sel_pts = svgedit.path.path.selected_pts;
			if(!sel_pts.length) return;
			
			svgedit.path.path.storeD();
			
			// Get first selected point
			var seg = svgedit.path.path.segs[sel_pts[0]];
			var diff = {x:0, y:0};
			diff[attr] = newValue - seg.item[attr];
			
			seg.move(diff.x, diff.y);
			svgedit.path.path.endChanges("Move path point");
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
						svgedit.path.insertItemBefore(elem, newseg, i);
						// Can this be done better?
						pathActions.fixEnd(elem);
						break;
					}
					
				}
			}
			if(svgedit.browser.isWebkit()) resetD(elem);
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
					var last = last?' '+svgedit.units.shortFloat(last):'';
					$.each(pnts, function(i, pnt) {
						pnts[i] = svgedit.units.shortFloat(pnt);
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
							letter = 'l';
						} else {
							x += curx;
							curx = x;
							letter = 'L';
						}
						// Convert to "line" for easier editing
						addToD([[x, cury]]);
						break;
					case 14: // absolute vertical line (V)
						y -= cury;
					case 15: // relative vertical line (v)
						if(toRel) {
							cury += y;
							letter = 'l';
						} else {
							y += cury;
							cury = y;
							letter = 'L';
						}
						// Convert to "line" for easier editing
						addToD([[curx, y]]);
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
// end pathActions

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
	
// 	if(!defs.firstChild) return;
	
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
			if(ref) {
				defelem_uses.push(ref.substr(1));
			}
		}
		
		// gradients can refer to other gradients
		var href = getHref(el);
		if (href && href.indexOf('#') === 0) {
			defelem_uses.push(href.substr(1));
		}
	};
	
	var defelems = $(svgcontent).find("linearGradient, radialGradient, filter, marker, svg, symbol");
		defelem_ids = [],
		i = defelems.length;
	while (i--) {
		var defelem = defelems[i];
		var id = defelem.id;
		if(defelem_uses.indexOf(id) < 0) {
			// Not found, so remove (but remember)
			removedElements[id] = defelem;
			defelem.parentNode.removeChild(defelem);
			numRemoved++;
		}
	}

	return numRemoved;
}

// Function: svgCanvasToString
// Main function to set up the SVG content for output 
//
// Returns: 
// String containing the SVG image for output
this.svgCanvasToString = function() {
	// keep calling it until there are none to remove
	while (removeUnusedDefElems() > 0) {};
	
	pathActions.clear(true);
	
	// Keep SVG-Edit comment on top
	$.each(svgcontent.childNodes, function(i, node) {
		if(i && node.nodeType === 8 && node.data.indexOf('Created with') >= 0) {
			svgcontent.insertBefore(node, svgcontent.firstChild);
		}
	});
	
	// Move out of in-group editing mode
	if(current_group) {
		leaveContext();
		selectOnly([current_group]);
	}
	
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
	var output = this.svgToString(svgcontent, 0);
	
	// Rewrap gsvg
	if(naked_svgs.length) {
		$(naked_svgs).each(function() {
			groupSvgElem(this);
		});
	}
	
	return output;
};

// Function: svgToString
// Sub function ran on each SVG element to convert it to a string as desired
// 
// Parameters: 
// elem - The SVG element to convert
// indent - Integer with the amount of spaces to indent this tag
//
// Returns: 
// String with the given element as an SVG tag
this.svgToString = function(elem, indent) {
	var out = new Array(), toXml = svgedit.utilities.toXml;
	var unit = curConfig.baseUnit;
	var unit_re = new RegExp('^-?[\\d\\.]+' + unit + '$');

	if (elem) {
		cleanupElement(elem);
		var attrs = elem.attributes,
			attr,
			i,
			childs = elem.childNodes;
		
		for (var i=0; i<indent; i++) out.push(" ");
		out.push("<"); out.push(elem.nodeName);
		if(elem.id === 'svgcontent') {
			// Process root element separately
			var res = getResolution();
			
			var vb = "";
			// TODO: Allow this by dividing all values by current baseVal
			// Note that this also means we should properly deal with this on import
// 			if(curConfig.baseUnit !== "px") {
// 				var unit = curConfig.baseUnit;
// 				var unit_m = svgedit.units.getTypeMap()[unit];
// 				res.w = svgedit.units.shortFloat(res.w / unit_m)
// 				res.h = svgedit.units.shortFloat(res.h / unit_m)
// 				vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';				
// 				res.w += unit;
// 				res.h += unit;
// 			}
			
			if(unit !== "px") {
				res.w = svgedit.units.convertUnit(res.w, unit) + unit;
				res.h = svgedit.units.convertUnit(res.h, unit) + unit;
			}
			
			out.push(' width="' + res.w + '" height="' + res.h + '"' + vb + ' xmlns="'+svgns+'"');
			
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
			var attr_names = ['width','height','xmlns','x','y','viewBox','id','overflow'];
			while (i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				
				// Namespaces have already been dealt with, so skip
				if(attr.nodeName.indexOf('xmlns:') === 0) continue;

				// only serialize attributes we don't use internally
				if (attrVal != "" && attr_names.indexOf(attr.localName) == -1) 
				{

					if(!attr.namespaceURI || nsMap[attr.namespaceURI]) {
						out.push(' '); 
						out.push(attr.nodeName); out.push("=\"");
						out.push(attrVal); out.push("\"");
					}
				}
			}
		} else {
			// Skip empty defs
			if(elem.nodeName === 'defs' && !elem.firstChild) return;
		
			var moz_attrs = ['-moz-math-font-style', '_moz-math-font-style'];
			for (var i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.nodeValue);
				//remove bogus attributes added by Gecko
				if (moz_attrs.indexOf(attr.localName) >= 0) continue;
				if (attrVal != "") {
					if(attrVal.indexOf('pointer-events') === 0) continue;
					if(attr.localName === "class" && attrVal.indexOf('se_') === 0) continue;
					out.push(" "); 
					if(attr.localName === 'd') attrVal = pathActions.convertPath(elem, true);
					if(!isNaN(attrVal)) {
						attrVal = svgedit.units.shortFloat(attrVal);
					} else if(unit_re.test(attrVal)) {
						attrVal = svgedit.units.shortFloat(attrVal) + unit;
					}
					
					// Embed images when saving 
					if(save_options.apply
						&& elem.nodeName === 'image' 
						&& attr.localName === 'href'
						&& save_options.images
						&& save_options.images === 'embed') 
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
					out.push(this.svgToString(childs.item(i), indent));
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
	var str = this.svgCanvasToString();
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

	var str = this.svgCanvasToString();
	call("exported", {svg: str, issues: issues});
};

// Function: getSvgString
// Returns the current drawing as raw SVG XML text.
//
// Returns:
// The current drawing as raw SVG XML text.
this.getSvgString = function() {
	save_options.apply = false;
	return this.svgCanvasToString();
};

// Function: randomizeIds
// This function determines whether to use a nonce in the prefix, when
// generating IDs for future documents in SVG-Edit.
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
		svgedit.draw.randomizeIds(false, getCurrentDrawing());
	} else {
		svgedit.draw.randomizeIds(true, getCurrentDrawing());
	}
};

// Function: uniquifyElems
// Ensure each element has a unique ID
//
// Parameters:
// g - The parent element of the tree to give unique IDs
var uniquifyElems = this.uniquifyElems = function(g) {
	var ids = {};
	// TODO: Handle markers and connectors.  These are not yet re-identified properly
	// as their referring elements do not get remapped.
	//
	// <marker id='se_marker_end_svg_7'/>
	// <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
	// 
	// Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
	// Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute
	var ref_elems = ["filter", "linearGradient", "pattern",	"radialGradient", "symbol", "textPath", "use"];
	
	svgedit.utilities.walkTree(g, function(n) {
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
			$.each(ref_attrs,function(i,attr) {
				var attrnode = n.getAttributeNode(attr);
				if (attrnode) {
					// the incoming file has been sanitized, so we should be able to safely just strip off the leading #
					var url = svgedit.utilities.getUrlFromAttr(attrnode.value),
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
			var href = svgedit.utilities.getHref(n);
			// TODO: what if an <image> or <a> element refers to an element internally?
			if(href && ref_elems.indexOf(n.nodeName) >= 0)
			{
				var refid = href.substr(1);
				if (refid) {
					if (!(refid in ids)) {
						// add this id to our map
						ids[refid] = {elem:null, attrs:[], hrefs:[]};
					}
					ids[refid]["hrefs"].push(n);
				}
			}						
		}
	});
	
	// in ids, we now have a map of ids, elements and attributes, let's re-identify
	for (var oldid in ids) {
		if (!oldid) continue;
		var elem = ids[oldid]["elem"];
		if (elem) {
			var newid = getNextId();
			
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
				svgedit.utilities.setHref(hreffer, "#"+newid);
			}
		}
	}
}

// Function setUseData
// Assigns reference data for each use element
var setUseData = this.setUseData = function(parent) {
	var elems = $(parent);
	
	if(parent.tagName !== 'use') {
		elems = elems.find('use');
	}
	
	elems.each(function() {
		var id = getHref(this).substr(1);
		var ref_elem = getElem(id);
		if(!ref_elem) return;
		$(this).data('ref', ref_elem);
		if(ref_elem.tagName == 'symbol' || ref_elem.tagName == 'svg') {
			$(this).data('symbol', ref_elem).data('ref', ref_elem);
		}
	});
}

// Function convertGradients
// Converts gradients from userSpaceOnUse to objectBoundingBox
var convertGradients = this.convertGradients = function(elem) {
	var elems = $(elem).find('linearGradient, radialGradient');
	if(!elems.length && svgedit.browser.isWebkit()) {
		// Bug in webkit prevents regular *Gradient selector search
		elems = $(elem).find('*').filter(function() {
			return (this.tagName.indexOf('Gradient') >= 0);
		});
	}
	
	elems.each(function() {
		var grad = this;
		if($(grad).attr('gradientUnits') === 'userSpaceOnUse') {
			// TODO: Support more than one element with this ref by duplicating parent grad
			var elems = $(svgcontent).find('[fill=url(#' + grad.id + ')],[stroke=url(#' + grad.id + ')]');
			if(!elems.length) return;
			
			// get object's bounding box
			var bb = getBBox(elems[0]);
			
			// This will occur if the element is inside a <defs> or a <symbol>,
			// in which we shouldn't need to convert anyway.
			if(!bb) return;
			
			if(grad.tagName === 'linearGradient') {
				var g_coords = $(grad).attr(['x1', 'y1', 'x2', 'y2']);
				
				// If has transform, convert
				var tlist = grad.gradientTransform.baseVal;
				if(tlist && tlist.numberOfItems > 0) {
					var m = transformListToTransform(tlist).matrix;
					var pt1 = transformPoint(g_coords.x1, g_coords.y1, m);
					var pt2 = transformPoint(g_coords.x2, g_coords.y2, m);
					
					g_coords.x1 = pt1.x;
					g_coords.y1 = pt1.y;
					g_coords.x2 = pt2.x;
					g_coords.y2 = pt2.y;
					grad.removeAttribute('gradientTransform');
				}
				
				$(grad).attr({
					x1: (g_coords.x1 - bb.x) / bb.width,
					y1: (g_coords.y1 - bb.y) / bb.height,
					x2: (g_coords.x2 - bb.x) / bb.width,
					y2: (g_coords.y2 - bb.y) / bb.height
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

		var vb = elem.getAttribute('viewBox');
		
		if(vb) {
			var nums = vb.split(' ');
			pos.x -= +nums[0];
			pos.y -= +nums[1];
		}
		
		// Not ideal, but works
		ts += " translate(" + (pos.x || 0) + "," + (pos.y || 0) + ")";
		
		var prev = $elem.prev();
		
		// Remove <use> element
		batchCmd.addSubCommand(new RemoveElementCommand($elem[0], $elem[0].nextSibling, $elem[0].parentNode));
		$elem.remove();
		
		// See if other elements reference this symbol
		var has_more = $(svgcontent).find('use:data(symbol)').length;
			
		var g = svgdoc.createElementNS(svgns, "g");
		var childs = elem.childNodes;
		
		for(var i = 0; i < childs.length; i++) {
			g.appendChild(childs[i].cloneNode(true));
		}
		
		// Duplicate the gradients for Gecko, since they weren't included in the <symbol>
		if(svgedit.browser.isGecko()) {
			var dupeGrads = $(findDefs()).children('linearGradient,radialGradient,pattern').clone();
			$(g).append(dupeGrads);
		}
		
		if (ts) {
			g.setAttribute("transform", ts);
		}
		
		var parent = elem.parentNode;
		
		uniquifyElems(g);
		
		// Put the dupe gradients back into <defs> (after uniquifying them)
		if(svgedit.browser.isGecko()) {
			$(findDefs()).append( $(g).find('linearGradient,radialGradient,pattern') );
		}
	
		// now give the g itself a new id
		g.id = getNextId();
		
		prev.after(g);
		
		if(parent) {
			if(!has_more) {
				// remove symbol/svg element
				var nextSibling = elem.nextSibling;
				parent.removeChild(elem);
				batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
			}
			batchCmd.addSubCommand(new InsertElementCommand(g));
		}
		
		setUseData(g);
		
		if(svgedit.browser.isGecko()) {
			convertGradients(findDefs());
		} else {
			convertGradients(g);
		}
		
		// recalculate dimensions on the top-level children so that unnecessary transforms
		// are removed
		svgedit.utilities.walkTreePost(g, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
		
		// Give ID for any visible element missing one
		$(g).find(visElems).each(function() {
			if(!this.id) this.id = getNextId();
		});
		
		selectOnly([g]);
		
		var cm = pushGroupProperties(g, true);
		if(cm) {
			batchCmd.addSubCommand(cm);
		}

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
		var newDoc = svgedit.utilities.text2xml(xmlString);

		this.prepareSvg(newDoc);

		var batchCmd = new BatchCommand("Change Source");

		// remove old svg document
		var nextSibling = svgcontent.nextSibling;
		var oldzoom = svgroot.removeChild(svgcontent);
		batchCmd.addSubCommand(new RemoveElementCommand(oldzoom, nextSibling, svgroot));
	
		// set new svg document
		svgcontent = svgroot.appendChild(svgdoc.importNode(newDoc.documentElement, true));
		
		var content = $(svgcontent);
		
		canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent, idprefix);
		
		// retrieve or set the nonce
		var nonce = getCurrentDrawing().getNonce();
		if (nonce) {
			call("setnonce", nonce);
		} else {
			call("unsetnonce");
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
		
		// For Firefox: Put all paint elems in defs
		if(svgedit.browser.isGecko()) {
			content.find('linearGradient, radialGradient, pattern').appendTo(findDefs());
		}

		
		// Set ref element for <use> elements
		
		// TODO: This should also be done if the object is re-added through "redo"
		setUseData(content);
		
		convertGradients(content[0]);
		
		// recalculate dimensions on the top-level children so that unnecessary transforms
		// are removed
		svgedit.utilities.walkTreePost(svgcontent, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
		
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
		svgedit.transformlist.resetListMap();
		clearSelection();
		svgedit.path.clearData();
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
		// Get unique ID
		var uid = svgedit.utilities.encode64(xmlString.length + xmlString).substr(0,32);
		
		var useExisting = false;

		// Look for symbol and make sure symbol exists in image
		if(import_ids[uid]) {
			if( $(import_ids[uid].symbol).parents('#svgroot').length ) {
				useExisting = true;
			}
		}
		
		var batchCmd = new BatchCommand("Import SVG");
	
		if(useExisting) {
			var symbol = import_ids[uid].symbol;
			var ts = import_ids[uid].xform;
		} else {
			// convert string into XML document
			var newDoc = svgedit.utilities.text2xml(xmlString);
	
			this.prepareSvg(newDoc);
	
			// import new svg document into our document
			var svg = svgdoc.importNode(newDoc.documentElement, true);
			
			uniquifyElems(svg);
			
			var innerw = convertToNum('width', svg.getAttribute("width")),
				innerh = convertToNum('height', svg.getAttribute("height")),
				innervb = svg.getAttribute("viewBox"),
				// if no explicit viewbox, create one out of the width and height
				vb = innervb ? innervb.split(" ") : [0,0,innerw,innerh];
			for (var j = 0; j < 4; ++j)
				vb[j] = +(vb[j]);
	
			// TODO: properly handle preserveAspectRatio
			var canvasw = +svgcontent.getAttribute("width"),
				canvash = +svgcontent.getAttribute("height");
			// imported content should be 1/3 of the canvas on its largest dimension
			
			if (innerh > innerw) {
				var ts = "scale(" + (canvash/3)/vb[3] + ")";
			}
			else {
				var ts = "scale(" + (canvash/3)/vb[2] + ")";
			}
			
			// Hack to make recalculateDimensions understand how to scale
			ts = "translate(0) " + ts + " translate(0)";
			
			var symbol = svgdoc.createElementNS(svgns, "symbol");
			var defs = findDefs();
			
			if(svgedit.browser.isGecko()) {
				// Move all gradients into root for Firefox, workaround for this bug:
				// https://bugzilla.mozilla.org/show_bug.cgi?id=353575
				// TODO: Make this properly undo-able.
				$(svg).find('linearGradient, radialGradient, pattern').appendTo(defs);
			}
	
			while (svg.firstChild) {
				var first = svg.firstChild;
				symbol.appendChild(first);
			}
			var attrs = svg.attributes;
			for(var i=0; i < attrs.length; i++) {
				var attr = attrs[i];
				symbol.setAttribute(attr.nodeName, attr.nodeValue);
			}
			symbol.id = getNextId();
			
			// Store data
			import_ids[uid] = {
				symbol: symbol,
				xform: ts
			}
			
			findDefs().appendChild(symbol);
			batchCmd.addSubCommand(new InsertElementCommand(symbol));
		}
		
		
		var use_el = svgdoc.createElementNS(svgns, "use");
		use_el.id = getNextId();
		setHref(use_el, "#" + symbol.id);
		
		(current_group || getCurrentDrawing().getCurrentLayer()).appendChild(use_el);
		batchCmd.addSubCommand(new InsertElementCommand(use_el));
		clearSelection();
		
		use_el.setAttribute("transform", ts);
		recalculateDimensions(use_el);
		$(use_el).data('symbol', symbol).data('ref', symbol);
		addToSelection([use_el]);
		
		// TODO: Find way to add this in a recalculateDimensions-parsable way
// 				if (vb[0] != 0 || vb[1] != 0)
// 					ts = "translate(" + (-vb[0]) + "," + (-vb[1]) + ") " + ts;
		addCommandToHistory(batchCmd);
		call("changed", [svgcontent]);

	} catch(e) {
		console.log(e);
		return false;
	}

	return true;
};

// TODO(codedread): Move all layer/context functions in draw.js
// Layer API Functions

// Group: Layers

// Function: identifyLayers
// Updates layer system
var identifyLayers = canvas.identifyLayers = function() {
	leaveContext();
	getCurrentDrawing().identifyLayers();
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
	var new_layer = getCurrentDrawing().createLayer(name);
	batchCmd.addSubCommand(new InsertElementCommand(new_layer));
	addCommandToHistory(batchCmd);
	clearSelection();
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
	var current_layer = getCurrentDrawing().getCurrentLayer();
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
	var current_layer = getCurrentDrawing().getCurrentLayer();
	var nextSibling = current_layer.nextSibling;
	var parent = current_layer.parentNode;
	current_layer = getCurrentDrawing().deleteCurrentLayer();
	if (current_layer) {
		var batchCmd = new BatchCommand("Delete Layer");
		// store in our Undo History
		batchCmd.addSubCommand(new RemoveElementCommand(current_layer, nextSibling, parent));
		addCommandToHistory(batchCmd);
		clearSelection();
		call("changed", [parent]);
		return true;
	}
	return false;
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
	var result = getCurrentDrawing().setCurrentLayer(svgedit.utilities.toXml(name));
	if (result) {
		clearSelection();
	}
	return result;
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
	var drawing = getCurrentDrawing();
	if (drawing.current_layer) {
		var oldLayer = drawing.current_layer;
		// setCurrentLayer will return false if the name doesn't already exist
		// this means we are free to rename our oldLayer
		if (!canvas.setCurrentLayer(newname)) {
			var batchCmd = new BatchCommand("Rename Layer");
			// find the index of the layer
			for (var i = 0; i < drawing.getNumLayers(); ++i) {
				if (drawing.all_layers[i][1] == oldLayer) break;
			}
			var oldname = drawing.getLayerName(i);
			drawing.all_layers[i][0] = svgedit.utilities.toXml(newname);
		
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
		drawing.current_layer = oldLayer;
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
	var drawing = getCurrentDrawing();
	if (drawing.current_layer && newpos >= 0 && newpos < drawing.getNumLayers()) {
		for (var oldpos = 0; oldpos < drawing.getNumLayers(); ++oldpos) {
			if (drawing.all_layers[oldpos][1] == drawing.current_layer) break;
		}
		// some unknown error condition (current_layer not in all_layers)
		if (oldpos == drawing.getNumLayers()) { return false; }
		
		if (oldpos != newpos) {
			// if our new position is below us, we need to insert before the node after newpos
			var refLayer = null;
			var oldNextSibling = drawing.current_layer.nextSibling;
			if (newpos > oldpos ) {
				if (newpos < drawing.getNumLayers()-1) {
					refLayer = drawing.all_layers[newpos+1][1];
				}
			}
			// if our new position is above us, we need to insert before the node at newpos
			else {
				refLayer = drawing.all_layers[newpos][1];
			}
			svgcontent.insertBefore(drawing.current_layer, refLayer);
			addCommandToHistory(new MoveElementCommand(drawing.current_layer, oldNextSibling, svgcontent));
			
			identifyLayers();
			canvas.setCurrentLayer(drawing.getLayerName(newpos));
			
			return true;
		}
	}
	
	return false;
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
	var drawing = getCurrentDrawing();
	var prevVisibility = drawing.getLayerVisibility(layername);
	var layer = drawing.setLayerVisibility(layername, bVisible);
	if (layer) {
		var oldDisplay = prevVisibility ? 'inline' : 'none';
		addCommandToHistory(new ChangeElementCommand(layer, {'display':oldDisplay}, 'Layer Visibility'));
	} else {
		return false;
	}
	
	if (layer == drawing.getCurrentLayer()) {
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
	var drawing = getCurrentDrawing();
	for (var i = 0; i < drawing.getNumLayers(); ++i) {
		if (drawing.getLayerName(i) == layername) {
			layer = drawing.all_layers[i][1];
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
	var drawing = getCurrentDrawing();
	var prev = $(drawing.current_layer).prev()[0];
	if(!prev) return;
	var childs = drawing.current_layer.childNodes;
	var len = childs.length;
	var layerNextSibling = drawing.current_layer.nextSibling;
	batchCmd.addSubCommand(new RemoveElementCommand(drawing.current_layer, layerNextSibling, svgcontent));

	while(drawing.current_layer.firstChild) {
		var ch = drawing.current_layer.firstChild;
		if(ch.localName == 'title') {
			var chNextSibling = ch.nextSibling;
			batchCmd.addSubCommand(new RemoveElementCommand(ch, chNextSibling, drawing.current_layer));
			drawing.current_layer.removeChild(ch);
			continue;
		}
		var oldNextSibling = ch.nextSibling;
		prev.appendChild(ch);
		batchCmd.addSubCommand(new MoveElementCommand(ch, oldNextSibling, drawing.current_layer));
	}
	
	// Remove current layer
	svgcontent.removeChild(drawing.current_layer);
	
	if(!skipHistory) {
		clearSelection();
		identifyLayers();

		call("changed", [svgcontent]);
		
		addCommandToHistory(batchCmd);
	}
	
	drawing.current_layer = prev;
	return batchCmd;
}

this.mergeAllLayers = function() {
	var batchCmd = new BatchCommand("Merge all Layers");
	var drawing = getCurrentDrawing();
	drawing.current_layer = drawing.all_layers[drawing.getNumLayers()-1][1];
	while($(svgcontent).children('g').length > 1) {
		batchCmd.addSubCommand(canvas.mergeLayer(true));
	}
	
	clearSelection();
	identifyLayers();
	call("changed", [svgcontent]);
	addCommandToHistory(batchCmd);
}

// Function: leaveContext
// Return from a group context to the regular kind, make any previously
// disabled elements enabled again
var leaveContext = this.leaveContext = function() {
	var len = disabled_elems.length;
	if(len) {
		for(var i = 0; i < len; i++) {
			var elem = disabled_elems[i];
			
			var orig = elData(elem, 'orig_opac');
			if(orig !== 1) {
				elem.setAttribute('opacity', orig);
			} else {
				elem.removeAttribute('opacity');
			}
			elem.setAttribute('style', 'pointer-events: inherit');
		}
		disabled_elems = [];
		clearSelection(true);
		call("contextset", null);
	}
	current_group = null;
}

// Function: setContext
// Set the current context (for in-group editing)
var setContext = this.setContext = function(elem) {
	leaveContext();
	if(typeof elem === 'string') {
		elem = getElem(elem);
	}

	// Edit inside this group
	current_group = elem;
	
	// Disable other elements
	$(elem).parentsUntil('#svgcontent').andSelf().siblings().each(function() {
		var opac = this.getAttribute('opacity') || 1;
		// Store the original's opacity
		elData(this, 'orig_opac', opac);
		this.setAttribute('opacity', opac * .33);
		this.setAttribute('style', 'pointer-events: none');
		disabled_elems.push(this);
	});

	clearSelection();
	call("contextset", current_group);
}

// Group: Document functions

// Function: clear
// Clears the current document.  This is not an undoable action.
this.clear = function() {
	pathActions.clear();

	clearSelection();

	// clear the svgcontent node
	canvas.clearSvgContentElement();

	// create new document
	canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent);

	// create empty first layer
	canvas.createLayer("Layer 1");
	
	// clear the undo stack
	canvas.undoMgr.resetUndoStack();

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
	
	var width = svgcontent.getAttribute("width")/current_zoom;
	var height = svgcontent.getAttribute("height")/current_zoom;
	
	return {
		'w': width,
		'h': height,
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
	$.extend(uiStrings, strs.notification);
}

// Function: setConfig
// Update configuration options with given values
//
// Parameters:
// opts - Object with options (see curConfig for examples)
this.setConfig = function(opts) {
	$.extend(curConfig, opts);
}

// Function: getTitle
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
		var tsNextSibling = ts.nextSibling;
		batchCmd.addSubCommand(new RemoveElementCommand(ts[0], tsNextSibling, elem));
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
			bb = getStrokedBBox(getVisibleElements(getCurrentDrawing().getCurrentLayer()));
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
				svgedit.utilities.walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
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
		defs = svgdoc.createElementNS(svgns, "defs" );
		if(svgcontent.firstChild) {
			// first child is a comment, so call nextSibling
			svgcontent.insertBefore( defs, svgcontent.firstChild.nextSibling);
		} else {
			svgcontent.appendChild(defs);
		}
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

function reorientGrads(elem, m) {
	var bb = getBBox(elem);
	for(var i = 0; i < 2; i++) {
		var type = i === 0 ? 'fill' : 'stroke';
		var attrVal = elem.getAttribute(type);
		if(attrVal && attrVal.indexOf('url(') === 0) {
			var grad = getRefElem(attrVal);
			if(grad.tagName === 'linearGradient') {
				var x1 = grad.getAttribute('x1') || 0;
				var y1 = grad.getAttribute('y1') || 0;
				var x2 = grad.getAttribute('x2') || 1;
				var y2 = grad.getAttribute('y2') || 0;
				
				// Convert to USOU points
				x1 = (bb.width * x1) + bb.x;
				y1 = (bb.height * y1) + bb.y;
				x2 = (bb.width * x2) + bb.x;
				y2 = (bb.height * y2) + bb.y;
			
				// Transform those points
				var pt1 = transformPoint(x1, y1, m);
				var pt2 = transformPoint(x2, y2, m);
				
				// Convert back to BB points
				var g_coords = {};
				
				g_coords.x1 = (pt1.x - bb.x) / bb.width;
				g_coords.y1 = (pt1.y - bb.y) / bb.height;
				g_coords.x2 = (pt2.x - bb.x) / bb.width;
				g_coords.y2 = (pt2.y - bb.y) / bb.height;
		
				var newgrad = grad.cloneNode(true);
				$(newgrad).attr(g_coords);
	
				newgrad.id = getNextId();
				findDefs().appendChild(newgrad);
				elem.setAttribute(type, 'url(#' + newgrad.id + ')');
			}
		}
	}
}

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
	if(val == 0 && ['line', 'path'].indexOf(current_mode) >= 0) {
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
				svgedit.utilities.walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
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
				svgedit.utilities.walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
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
			var elem = selectedElements[0];
			if(filterHidden) {
				changeSelectedAttributeNoUndo("filter", 'url(#' + elem.id + '_blur)');
			}
			if(svgedit.browser.isWebkit()) {
				console.log('e', elem);
				elem.removeAttribute('filter');
				elem.setAttribute('filter', 'url(#' + elem.id + '_blur)');
			}
			changeSelectedAttributeNoUndo("stdDeviation", val, [filter.firstChild]);
			canvas.setBlurOffsets(filter, val);
		}
	}
	
	function finishChange() {
		var bCmd = canvas.undoMgr.finishUndoableChange();
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
				height: '200%'
			}, 100);
		} else {
			// Removing these attributes hides text in Chrome (see Issue 579)
			if(!svgedit.browser.isWebkit()) {
				filter.removeAttribute('x');
				filter.removeAttribute('y');
				filter.removeAttribute('width');
				filter.removeAttribute('height');
			}
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
		canvas.undoMgr.beginUndoableChange("stdDeviation", [filter?filter.firstChild:null]);
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

// Function: setLinkURL
// Sets the new link URL for the selected anchor element.
// 
// Parameters:
// val - String with the link URL/path
this.setLinkURL = function(val) {
	var elem = selectedElements[0];
	if(!elem) return;
	if(elem.tagName !== 'a') {
		// See if parent is an anchor
		var parents_a = $(elem).parents('a');
		if(parents_a.length) {
			elem = parents_a[0];
		} else {
			return;
		}
	}
	
	var cur_href = getHref(elem);
	
	if(cur_href === val) return;
	
	var batchCmd = new BatchCommand("Change Link URL");

	setHref(elem, val);
	batchCmd.addSubCommand(new ChangeElementCommand(elem, {
		"#href": cur_href
	}));

	addCommandToHistory(batchCmd);
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

// Function: makeHyperlink
// Wraps the selected element(s) in an anchor element or converts group to one
this.makeHyperlink = function(url) {
	canvas.groupSelectedElements('a', url);
	
	// TODO: If element is a single "g", convert to "a"
	//	if(selectedElements.length > 1 && selectedElements[1]) {

}

// Function: removeHyperlink
this.removeHyperlink = function() {
	canvas.ungroupSelectedElement();
}

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

// TODO(codedread): Remove the getBBox argument and split this function into two.
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
		
		var nextSibling = elem.nextSibling;
		batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
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
};


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
	var no_xy_elems = ['g', 'polyline', 'path'];
	var good_g_attrs = ['transform', 'opacity', 'filter'];
	
	while (i--) {
		var elem = elems[i];
		if (elem == null) continue;
		
		// Go into "select" mode for text changes
		if(current_mode === "textedit" && attr !== "#text" && elem.textContent.length) {
			textActions.toSelectMode(elem);
		}
		
		// Set x,y vals on elements that don't have them
		if((attr === 'x' || attr === 'y') && no_xy_elems.indexOf(elem.tagName) >= 0) {
			var bbox = getStrokedBBox([elem]);
			var diff_x = attr === 'x' ? newValue - bbox.x : 0;
			var diff_y = attr === 'y' ? newValue - bbox.y : 0;
			canvas.moveSelectedElements(diff_x*current_zoom, diff_y*current_zoom, true);
			continue;
		}
		
		// only allow the transform/opacity/filter attribute to change on <g> elements, slightly hacky
		// TODO: FIXME: This doesn't seem right.  Where's the body of this if statement?
		if (elem.tagName === "g" && good_g_attrs.indexOf(attr) >= 0);
		var oldval = attr === "#text" ? elem.textContent : elem.getAttribute(attr);
		if (oldval == null)  oldval = "";
		if (oldval !== String(newValue)) {
			if (attr == "#text") {
				var old_w = getBBox(elem).width;
				elem.textContent = newValue;
				
				// FF bug occurs on on rotated elements
				if(/rotate/.test(elem.getAttribute('transform'))) {
					elem = ffClone(elem);
				}
				
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
			if(svgedit.browser.isGecko() && elem.nodeName === 'text' && /rotate/.test(elem.getAttribute('transform'))) {
				if((newValue+'').indexOf('url') === 0 || ['font-size','font-family','x','y'].indexOf(attr) >= 0 && elem.textContent) {
					elem = ffClone(elem);
				}
			}
			// Timeout needed for Opera & Firefox
			// codedread: it is now possible for this function to be called with elements
			// that are not in the selectedElements array, we need to only request a
			// selector if the element is in that array
			if (selectedElements.indexOf(elem) >= 0) {
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
	canvas.undoMgr.beginUndoableChange(attr, elems);
	var i = elems.length;

	changeSelectedAttributeNoUndo(attr, val, elems);

	var batchCmd = canvas.undoMgr.finishUndoableChange();
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
		
		// Remove the path if present.
		svgedit.path.removePath_(t.id);
		
		// Get the parent if it's a single-child anchor
		if(parent.tagName === 'a' && parent.childNodes.length === 1) {
			t = parent;
			parent = parent.parentNode;
		}
		
		var nextSibling = t.nextSibling;
		var elem = parent.removeChild(t);
		selectedCopy.push(selected); //for the copy
		selectedElements[i] = null;
		batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
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

		// Remove the path if present.
		svgedit.path.removePath_(t.id);

		var nextSibling = t.nextSibling;
		var elem = parent.removeChild(t);
		selectedCopy.push(selected); //for the copy
		selectedElements[i] = null;
		batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
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

this.pasteElements = function(type, x, y) {
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
		(current_group || getCurrentDrawing().getCurrentLayer()).appendChild(copy);
		batchCmd.addSubCommand(new InsertElementCommand(copy));
	}
	
	selectOnly(pasted);
	
	if(type !== 'in_place') {
		
		var ctr_x, ctr_y;
		
		if(!type) {
			ctr_x = lastClickPoint.x;
			ctr_y = lastClickPoint.y;
		} else if(type === 'point') {
			ctr_x = x;
			ctr_y = y;
		} 
		
		var bbox = getStrokedBBox(pasted);
		var cx = ctr_x - (bbox.x + bbox.width/2),
			cy = ctr_y - (bbox.y + bbox.height/2),
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

// Parameters: 
// type - type of element to group into, defaults to <g>
this.groupSelectedElements = function(type) {
	if(!type) type = 'g';
	var cmd_str = '';
	
	switch ( type ) {
		case "a":
			cmd_str = "Make hyperlink";
			var url = '';
			if(arguments.length > 1) {
				url = arguments[1];
			}
			break;
		default:
			type = 'g';
			cmd_str = "Group Elements";
			break;
	}
	
	var batchCmd = new BatchCommand(cmd_str);
	
	// create and insert the group element
	var g = addSvgElementFromJson({
							"element": type,
							"attr": {
								"id": getNextId()
							}
						});
	if(type === 'a') {
		setHref(g, url);
	}
	batchCmd.addSubCommand(new InsertElementCommand(g));
	
	// now move all children into the group
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem == null) continue;
		
		if (elem.parentNode.tagName === 'a' && elem.parentNode.childNodes.length === 1) {
			elem = elem.parentNode;
		}
		
		var oldNextSibling = elem.nextSibling;
		var oldParent = elem.parentNode;
		g.appendChild(elem);
		batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));			
	}
	if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
	
	// update selection
	selectOnly([g], true);
};


// Function: pushGroupProperties
// Pushes all appropriate parent group properties down to its children, then
// removes them from the group
var pushGroupProperties = this.pushGroupProperties = function(g, undoable) {

	var children = g.childNodes;
	var len = children.length;
	var xform = g.getAttribute("transform");

	var glist = getTransformList(g);
	var m = transformListToTransform(glist).matrix;
	
	var batchCmd = new BatchCommand("Push group properties");

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
	
	for(var i = 0; i < len; i++) {
		var elem = children[i];
		
		if(elem.nodeType !== 1) continue;
		
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
					gfilter = getRefElem(gattrs.filter);
				} else {
					// Clone the group's filter
					gfilter = copyElem(gfilter);
					findDefs().appendChild(gfilter);
				}
			} else {
				gfilter = getRefElem(elem.getAttribute('filter'));
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

		// Don't process gradient transforms
		if(~elem.tagName.indexOf('Gradient')) chtlist = null;
		
		// Hopefully not a problem to add this. Necessary for elements like <desc/>
		if(!chtlist) continue;
		
		// Apparently <defs> can get get a transformlist, but we don't want it to have one!
		if(elem.tagName === 'defs') continue;
		
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
					if(chtlist.numberOfItems) {
						chtlist.insertItemBefore(r2, 0);
					} else {
						chtlist.appendItem(r2);
					}
				}

				if (trm.e || trm.f) {
					var tr = svgroot.createSVGTransform();
					tr.setTranslate(trm.e, trm.f);
					if(chtlist.numberOfItems) {
						chtlist.insertItemBefore(tr, 0);
					} else {
						chtlist.appendItem(tr);
					}
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
			var cmd = recalculateDimensions(elem);
			if(cmd)	batchCmd.addSubCommand(cmd);
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
	
	if (undoable && !batchCmd.isEmpty()) {
		return batchCmd;
	}
}


// Function: ungroupSelectedElement
// Unwraps all the elements in a selected group (g) element. This requires
// significant recalculations to apply group's transforms, etc to its children
this.ungroupSelectedElement = function() {
	var g = selectedElements[0];
	if($(g).data('gsvg') || $(g).data('symbol')) {
		// Is svg, so actually convert to group

		convertToGroup(g);
		return;
	} else if(g.tagName === 'use') {
		// Somehow doesn't have data set, so retrieve
		var symbol = getElem(getHref(g).substr(1));
		$(g).data('symbol', symbol).data('ref', symbol);
		convertToGroup(g);
		return;
	}
	var parents_a = $(g).parents('a');
	if(parents_a.length) {
		g = parents_a[0];
	}
	
	// Look for parent "a"
	if (g.tagName === "g" || g.tagName === "a") {
		
		var batchCmd = new BatchCommand("Ungroup Elements");
		var cmd = pushGroupProperties(g, true);
		if(cmd) batchCmd.addSubCommand(cmd);
		
		var parent = g.parentNode;
		var anchor = g.nextSibling;
		var children = new Array(g.childNodes.length);
		
		var i = 0;
		
		while (g.firstChild) {
			var elem = g.firstChild;
			var oldNextSibling = elem.nextSibling;
			var oldParent = elem.parentNode;
			
			// Remove child title elements
			if(elem.tagName === 'title') {
				var nextSibling = elem.nextSibling;
				batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, oldParent));
				oldParent.removeChild(elem);
				continue;
			}
			
			children[i++] = elem = parent.insertBefore(elem, anchor);
			batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
		}

		// remove the group from the selection			
		clearSelection();
		
		// delete the group element (but make undo-able)
		var gNextSibling = g.nextSibling;
		g = parent.removeChild(g);
		batchCmd.addSubCommand(new RemoveElementCommand(g, gNextSibling, parent));

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
		// If the element actually moved position, add the command and fire the changed
		// event handler.
		if (oldNextSibling != t.nextSibling) {
			addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "top"));
			call("changed", [t]);
		}
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
		// If the element actually moved position, add the command and fire the changed
		// event handler.
		if (oldNextSibling != t.nextSibling) {
			addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "bottom"));
			call("changed", [t]);
		}
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
	// If the element actually moved position, add the command and fire the changed
	// event handler.
	if (oldNextSibling != t.nextSibling) {
		addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "Move " + dir));
		call("changed", [t]);
	}
};

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
this.moveSelectedElements = function(dx, dy, undoable) {
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
this.cloneSelectedElements = function(x,y) {
	var batchCmd = new BatchCommand("Clone Elements");
	// find all the elements selected (stop at first null)
	var len = selectedElements.length;
	for (var i = 0; i < len; ++i) {
		var elem = selectedElements[i];
		if (elem == null) break;
	}
	// use slice to quickly get the subset of elements we need
	var copiedElements = selectedElements.slice(0,i);
	this.clearSelection(true);
	// note that we loop in the reverse way because of the way elements are added
	// to the selectedElements array (top-first)
	var i = copiedElements.length;
	while (i--) {
		// clone each element and replace it within copiedElements
		var elem = copiedElements[i] = copyElem(copiedElements[i]);
		(current_group || getCurrentDrawing().getCurrentLayer()).appendChild(elem);
		batchCmd.addSubCommand(new InsertElementCommand(elem));
	}
	
	if (!batchCmd.isEmpty()) {
		addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
		this.moveSelectedElements(x,y,false);
		addCommandToHistory(batchCmd);
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
	var all_elems = getVisibleElements(current_group || getCurrentDrawing().getCurrentLayer());
	if(!all_elems.length) return;
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
	selectOnly([elem], true);
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
		isIdentity: svgedit.math.isIdentity,
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
		SVGEditTransformList: svgedit.transformlist.SVGTransformList,
		toString: toString,
		transformBox: svgedit.math.transformBox,
		transformListToTransform: transformListToTransform,
		transformPoint: transformPoint,
		walkTree: svgedit.utilities.walkTree
	}
	return obj;
};

}
