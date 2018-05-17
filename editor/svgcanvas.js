/* eslint-disable no-var, indent, no-redeclare */
/* globals $, svgedit, svgCanvas, jsPDF, canvg */
/*
 * svgcanvas.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 *
 */

// Dependencies:
// 1) jQuery
// 2) pathseg.js
// 3) browser.js
// 4) svgtransformlist.js
// 5) math.js
// 6) units.js
// 7) svgutils.js
// 8) sanitize.js
// 9) history.js
// 10) select.js
// 11) draw.js
// 12) path.js
// 13) coords.js
// 14) recalculate.js

(function () {
if (!window.console) {
	window.console = {};
	window.console.log = function (str) {};
	window.console.dir = function (str) {};
}

if (window.opera) {
	window.console.log = function (str) { opera.postError(str); };
	window.console.dir = function (str) {};
}
}());

// Class: SvgCanvas
// The main SvgCanvas class that manages all SVG-related functions
//
// Parameters:
// container - The container HTML element that should hold the SVG root element
// config - An object that contains configuration data

$.SvgCanvas = function (container, config) {
// Alias Namespace constants
var NS = svgedit.NS;

// Default configuration options
var curConfig = {
	show_outside_canvas: true,
	selectNew: true,
	dimensions: [640, 480]
};

// Update config with new one if given
if (config) {
	$.extend(curConfig, config);
}

// Array with width/height of canvas
var dimensions = curConfig.dimensions;

var canvas = this;

// "document" element associated with the container (same as window.document using default svg-editor.js)
// NOTE: This is not actually a SVG document, but a HTML document.
var svgdoc = container.ownerDocument;

// This is a container for the document being edited, not the document itself.
var svgroot = svgdoc.importNode(
	svgedit.utilities.text2xml(
		'<svg id="svgroot" xmlns="' + NS.SVG + '" xlinkns="' + NS.XLINK + '" ' +
			'width="' + dimensions[0] + '" height="' + dimensions[1] + '" x="' + dimensions[0] + '" y="' + dimensions[1] + '" overflow="visible">' +
			'<defs>' +
				'<filter id="canvashadow" filterUnits="objectBoundingBox">' +
					'<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>' +
					'<feOffset in="blur" dx="5" dy="5" result="offsetBlur"/>' +
					'<feMerge>' +
						'<feMergeNode in="offsetBlur"/>' +
						'<feMergeNode in="SourceGraphic"/>' +
					'</feMerge>' +
				'</filter>' +
			'</defs>' +
		'</svg>'
	).documentElement,
	true
);
container.appendChild(svgroot);

// The actual element that represents the final output SVG element
var svgcontent = svgdoc.createElementNS(NS.SVG, 'svg');

// This function resets the svgcontent element while keeping it in the DOM.
var clearSvgContentElement = canvas.clearSvgContentElement = function () {
	while (svgcontent.firstChild) { svgcontent.removeChild(svgcontent.firstChild); }

	// TODO: Clear out all other attributes first?
	$(svgcontent).attr({
		id: 'svgcontent',
		width: dimensions[0],
		height: dimensions[1],
		x: dimensions[0],
		y: dimensions[1],
		overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
		xmlns: NS.SVG,
		'xmlns:se': NS.SE,
		'xmlns:xlink': NS.XLINK
	}).appendTo(svgroot);

	// TODO: make this string optional and set by the client
	var comment = svgdoc.createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
	svgcontent.appendChild(comment);
};
clearSvgContentElement();

// Prefix string for element IDs
var idprefix = 'svg_';

// Function: setIdPrefix
// Changes the ID prefix to the given value
//
// Parameters:
// p - String with the new prefix
canvas.setIdPrefix = function (p) {
	idprefix = p;
};

// Current svgedit.draw.Drawing object
// @type {svgedit.draw.Drawing}
canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent, idprefix);

// Function: getCurrentDrawing
// Returns the current Drawing.
// @return {svgedit.draw.Drawing}
var getCurrentDrawing = canvas.getCurrentDrawing = function () {
	return canvas.current_drawing_;
};

// Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
var currentZoom = 1;

// pointer to current group (for in-group editing)
var currentGroup = null;

// Object containing data for the currently selected styles
var allProperties = {
	shape: {
		fill: (curConfig.initFill.color === 'none' ? '' : '#') + curConfig.initFill.color,
		fill_paint: null,
		fill_opacity: curConfig.initFill.opacity,
		stroke: '#' + curConfig.initStroke.color,
		stroke_paint: null,
		stroke_opacity: curConfig.initStroke.opacity,
		stroke_width: curConfig.initStroke.width,
		stroke_dasharray: 'none',
		stroke_linejoin: 'miter',
		stroke_linecap: 'butt',
		opacity: curConfig.initOpacity
	}
};

allProperties.text = $.extend(true, {}, allProperties.shape);
$.extend(allProperties.text, {
	fill: '#000000',
	stroke_width: curConfig.text.stroke_width,
	font_size: curConfig.text.font_size,
	font_family: curConfig.text.font_family
});

// Current shape style properties
var curShape = allProperties.shape;

// Array with all the currently selected elements
// default size of 1 until it needs to grow bigger
var selectedElements = [];

var getJsonFromSvgElement = this.getJsonFromSvgElement = function (data) {
	// Text node
	if (data.nodeType === 3) return data.nodeValue;

	var retval = {
		element: data.tagName,
		// namespace: nsMap[data.namespaceURI],
		attr: {},
		children: []
	};

	// Iterate attributes
	for (var i = 0; i < data.attributes.length; i++) {
		retval.attr[data.attributes[i].name] = data.attributes[i].value;
	};

	// Iterate children
	for (var i = 0; i < data.childNodes.length; i++) {
		retval.children.push(getJsonFromSvgElement(data.childNodes[i]));
	}

	return retval;
};

// Function: addSvgElementFromJson
// Create a new SVG element based on the given object keys/values and add it to the current layer
// The element will be ran through cleanupElement before being returned
//
// Parameters:
// data - Object with the following keys/values:
// * element - tag name of the SVG element to create
// * attr - Object with attributes key-values to assign to the new element
// * curStyles - Boolean indicating that current style attributes should be applied first
// * children - Optional array with data objects to be added recursively as children
//
// Returns: The new element
var addSvgElementFromJson = this.addSvgElementFromJson = function (data) {
	if (typeof data === 'string') return svgdoc.createTextNode(data);

	var shape = svgedit.utilities.getElem(data.attr.id);
	// if shape is a path but we need to create a rect/ellipse, then remove the path
	var currentLayer = getCurrentDrawing().getCurrentLayer();
	if (shape && data.element !== shape.tagName) {
		currentLayer.removeChild(shape);
		shape = null;
	}
	if (!shape) {
		shape = svgdoc.createElementNS(NS.SVG, data.element);
		if (currentLayer) {
			(currentGroup || currentLayer).appendChild(shape);
		}
	}
	if (data.curStyles) {
		svgedit.utilities.assignAttributes(shape, {
			'fill': curShape.fill,
			'stroke': curShape.stroke,
			'stroke-width': curShape.stroke_width,
			'stroke-dasharray': curShape.stroke_dasharray,
			'stroke-linejoin': curShape.stroke_linejoin,
			'stroke-linecap': curShape.stroke_linecap,
			'stroke-opacity': curShape.stroke_opacity,
			'fill-opacity': curShape.fill_opacity,
			'opacity': curShape.opacity / 2,
			'style': 'pointer-events:inherit'
		}, 100);
	}
	svgedit.utilities.assignAttributes(shape, data.attr, 100);
	svgedit.utilities.cleanupElement(shape);

	// Children
	if (data.children) {
		data.children.forEach(function (child) {
			shape.appendChild(addSvgElementFromJson(child));
		});
	}

	return shape;
};

// import svgtransformlist.js
/* var getTransformList = */ canvas.getTransformList = svgedit.transformlist.getTransformList;

// import from math.js.
var transformPoint = svgedit.math.transformPoint;
var matrixMultiply = canvas.matrixMultiply = svgedit.math.matrixMultiply;
var hasMatrixTransform = canvas.hasMatrixTransform = svgedit.math.hasMatrixTransform;
var transformListToTransform = canvas.transformListToTransform = svgedit.math.transformListToTransform;
// var snapToAngle = svgedit.math.snapToAngle;
// var getMatrix = svgedit.math.getMatrix;

// initialize from units.js
// send in an object implementing the ElementContainer interface (see units.js)
svgedit.units.init({
	getBaseUnit: function () { return curConfig.baseUnit; },
	getElement: svgedit.utilities.getElem,
	getHeight: function () { return svgcontent.getAttribute('height') / currentZoom; },
	getWidth: function () { return svgcontent.getAttribute('width') / currentZoom; },
	getRoundDigits: function () { return saveOptions.round_digits; }
});
// import from units.js
/* var convertToNum = */ canvas.convertToNum = svgedit.units.convertToNum;

// import from svgutils.js
svgedit.utilities.init({
	getDOMDocument: function () { return svgdoc; },
	getDOMContainer: function () { return container; },
	getSVGRoot: function () { return svgroot; },
	// TODO: replace this mostly with a way to get the current drawing.
	getSelectedElements: function () { return selectedElements; },
	getSVGContent: function () { return svgcontent; },
	getBaseUnit: function () { return curConfig.baseUnit; },
	getSnappingStep: function () { return curConfig.snappingStep; }
});
var findDefs = canvas.findDefs = svgedit.utilities.findDefs;
var getUrlFromAttr = canvas.getUrlFromAttr = svgedit.utilities.getUrlFromAttr;
var getHref = canvas.getHref = svgedit.utilities.getHref;
var setHref = canvas.setHref = svgedit.utilities.setHref;
var getPathBBox = svgedit.utilities.getPathBBox;
/* var getBBox = */ canvas.getBBox = svgedit.utilities.getBBox;
/* var getRotationAngle = */ canvas.getRotationAngle = svgedit.utilities.getRotationAngle;
var getElem = canvas.getElem = svgedit.utilities.getElem;
/* var getRefElem = */ canvas.getRefElem = svgedit.utilities.getRefElem;
var assignAttributes = canvas.assignAttributes = svgedit.utilities.assignAttributes;
var cleanupElement = this.cleanupElement = svgedit.utilities.cleanupElement;

// import from coords.js
svgedit.coords.init({
	getDrawing: function () { return getCurrentDrawing(); },
	getGridSnapping: function () { return curConfig.gridSnapping; }
});
var remapElement = this.remapElement = svgedit.coords.remapElement;

// import from recalculate.js
svgedit.recalculate.init({
	getSVGRoot: function () { return svgroot; },
	getStartTransform: function () { return startTransform; },
	setStartTransform: function (transform) { startTransform = transform; }
});
var recalculateDimensions = this.recalculateDimensions = svgedit.recalculate.recalculateDimensions;

// import from sanitize.js
var nsMap = svgedit.getReverseNS();
var sanitizeSvg = canvas.sanitizeSvg = svgedit.sanitize.sanitizeSvg;

// import from history.js
var MoveElementCommand = svgedit.history.MoveElementCommand;
var InsertElementCommand = svgedit.history.InsertElementCommand;
var RemoveElementCommand = svgedit.history.RemoveElementCommand;
var ChangeElementCommand = svgedit.history.ChangeElementCommand;
var BatchCommand = svgedit.history.BatchCommand;
var call;
// Implement the svgedit.history.HistoryEventHandler interface.
canvas.undoMgr = new svgedit.history.UndoManager({
	handleHistoryEvent: function (eventType, cmd) {
		var EventTypes = svgedit.history.HistoryEventTypes;
		// TODO: handle setBlurOffsets.
		if (eventType === EventTypes.BEFORE_UNAPPLY || eventType === EventTypes.BEFORE_APPLY) {
			canvas.clearSelection();
		} else if (eventType === EventTypes.AFTER_APPLY || eventType === EventTypes.AFTER_UNAPPLY) {
			var elems = cmd.elements();
			canvas.pathActions.clear();
			call('changed', elems);
			var cmdType = cmd.type();
			var isApply = (eventType === EventTypes.AFTER_APPLY);
			if (cmdType === MoveElementCommand.type()) {
				var parent = isApply ? cmd.newParent : cmd.oldParent;
				if (parent === svgcontent) {
					canvas.identifyLayers();
				}
			} else if (cmdType === InsertElementCommand.type() ||
					cmdType === RemoveElementCommand.type()) {
				if (cmd.parent === svgcontent) {
					canvas.identifyLayers();
				}
				if (cmdType === InsertElementCommand.type()) {
					if (isApply) { restoreRefElems(cmd.elem); }
				} else {
					if (!isApply) { restoreRefElems(cmd.elem); }
				}
				if (cmd.elem.tagName === 'use') {
					setUseData(cmd.elem);
				}
			} else if (cmdType === ChangeElementCommand.type()) {
				// if we are changing layer names, re-identify all layers
				if (cmd.elem.tagName === 'title' &&
					cmd.elem.parentNode.parentNode === svgcontent
				) {
					canvas.identifyLayers();
				}
				var values = isApply ? cmd.newValues : cmd.oldValues;
				// If stdDeviation was changed, update the blur.
				if (values.stdDeviation) {
					canvas.setBlurOffsets(cmd.elem.parentNode, values.stdDeviation);
				}
				// This is resolved in later versions of webkit, perhaps we should
				// have a featured detection for correct 'use' behavior?
				// ——————————
				// Remove & Re-add hack for Webkit (issue 775)
				// if (cmd.elem.tagName === 'use' && svgedit.browser.isWebkit()) {
				//	var elem = cmd.elem;
				//	if (!elem.getAttribute('x') && !elem.getAttribute('y')) {
				//		var parent = elem.parentNode;
				//		var sib = elem.nextSibling;
				//		parent.removeChild(elem);
				//		parent.insertBefore(elem, sib);
				//	}
				// }
			}
		}
	}
});
var addCommandToHistory = function (cmd) {
	canvas.undoMgr.addCommandToHistory(cmd);
};

/**
 * Get a HistoryRecordingService.
 * @param {svgedit.history.HistoryRecordingService=} hrService - if exists, return it instead of creating a new service.
 * @returns {svgedit.history.HistoryRecordingService}
 */
function historyRecordingService (hrService) {
	return hrService || new svgedit.history.HistoryRecordingService(canvas.undoMgr);
}

// import from select.js
svgedit.select.init(curConfig, {
	createSVGElement: function (jsonMap) { return canvas.addSvgElementFromJson(jsonMap); },
	svgRoot: function () { return svgroot; },
	svgContent: function () { return svgcontent; },
	currentZoom: function () { return currentZoom; },
	// TODO(codedread): Remove when getStrokedBBox() has been put into svgutils.js.
	getStrokedBBox: function (elems) { return canvas.getStrokedBBox([elems]); }
});
// this object manages selectors for us
var selectorManager = this.selectorManager = svgedit.select.getSelectorManager();

// Import from path.js
svgedit.path.init({
	getCurrentZoom: function () { return currentZoom; },
	getSVGRoot: function () { return svgroot; }
});

// Interface strings, usually for title elements
var uiStrings = {
	exportNoBlur: 'Blurred elements will appear as un-blurred',
	exportNoforeignObject: 'foreignObject elements will not appear',
	exportNoDashArray: 'Strokes will appear filled',
	exportNoText: 'Text may not appear as expected'
};

var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
var refAttrs = ['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'];

var elData = $.data;

// Animation element to change the opacity of any newly created element
var opacAni = document.createElementNS(NS.SVG, 'animate');
$(opacAni).attr({
	attributeName: 'opacity',
	begin: 'indefinite',
	dur: 1,
	fill: 'freeze'
}).appendTo(svgroot);

var restoreRefElems = function (elem) {
	// Look for missing reference elements, restore any found
	var o, i, l,
		attrs = $(elem).attr(refAttrs);
	for (o in attrs) {
		var val = attrs[o];
		if (val && val.indexOf('url(') === 0) {
			var id = svgedit.utilities.getUrlFromAttr(val).substr(1);
			var ref = getElem(id);
			if (!ref) {
				svgedit.utilities.findDefs().appendChild(removedElements[id]);
				delete removedElements[id];
			}
		}
	}

	var childs = elem.getElementsByTagName('*');

	if (childs.length) {
		for (i = 0, l = childs.length; i < l; i++) {
			restoreRefElems(childs[i]);
		}
	}
};

// (function () {
// TODO For Issue 208: this is a start on a thumbnail
//	var svgthumb = svgdoc.createElementNS(NS.SVG, 'use');
//	svgthumb.setAttribute('width', '100');
//	svgthumb.setAttribute('height', '100');
//	svgedit.utilities.setHref(svgthumb, '#svgcontent');
//	svgroot.appendChild(svgthumb);
// }());

// Object to contain image data for raster images that were found encodable
var encodableImages = {},

	// String with image URL of last loadable image
	lastGoodImgUrl = curConfig.imgPath + 'logo.png',

	// Array with current disabled elements (for in-group editing)
	disabledElems = [],

	// Object with save options
	saveOptions = {round_digits: 5},

	// Boolean indicating whether or not a draw action has been started
	started = false,

	// String with an element's initial transform attribute value
	startTransform = null,

	// String indicating the current editor mode
	currentMode = 'select',

	// String with the current direction in which an element is being resized
	currentResizeMode = 'none',

	// Object with IDs for imported files, to see if one was already added
	importIds = {},

	// Current text style properties
	curText = allProperties.text,

	// Current general properties
	curProperties = curShape,

	// Array with selected elements' Bounding box object
	// selectedBBoxes = new Array(1),

	// The DOM element that was just selected
	justSelected = null,

	// DOM element for selection rectangle drawn by the user
	rubberBox = null,

	// Array of current BBoxes, used in getIntersectionList().
	curBBoxes = [],

	// Object to contain all included extensions
	extensions = {},

	// Canvas point for the most recent right click
	lastClickPoint = null,

	// Map of deleted reference elements
	removedElements = {};

// Should this return an array by default, so extension results aren't overwritten?
var runExtensions = this.runExtensions = function (action, vars, returnArray) {
	var result = returnArray ? [] : false;
	$.each(extensions, function (name, opts) {
		if (opts && action in opts) {
			if (returnArray) {
				result.push(opts[action](vars));
			} else {
				result = opts[action](vars);
			}
		}
	});
	return result;
};

// Function: addExtension
// Add an extension to the editor
//
// Parameters:
// name - String with the ID of the extension
// extFunc - Function supplied by the extension with its data
this.addExtension = function (name, extFunc) {
	var ext;
	if (!(name in extensions)) {
		// Provide private vars/funcs here. Is there a better way to do this?
		if ($.isFunction(extFunc)) {
			ext = extFunc($.extend(canvas.getPrivateMethods(), {
				svgroot: svgroot,
				svgcontent: svgcontent,
				nonce: getCurrentDrawing().getNonce(),
				selectorManager: selectorManager
			}));
		} else {
			ext = extFunc;
		}
		extensions[name] = ext;
		call('extension_added', ext);
	} else {
		console.log('Cannot add extension "' + name + '", an extension by that name already exists.');
	}
};

// This method rounds the incoming value to the nearest value based on the currentZoom
var round = this.round = function (val) {
	return parseInt(val * currentZoom, 10) / currentZoom;
};

// This method sends back an array or a NodeList full of elements that
// intersect the multi-select rubber-band-box on the currentLayer only.
//
// We brute-force getIntersectionList for browsers that do not support it (Firefox).
//
// Reference:
// Firefox does not implement getIntersectionList(), see https://bugzilla.mozilla.org/show_bug.cgi?id=501421
var getIntersectionList = this.getIntersectionList = function (rect) {
	if (rubberBox == null) { return null; }

	var parent = currentGroup || getCurrentDrawing().getCurrentLayer();

	var rubberBBox;
	if (!rect) {
		rubberBBox = rubberBox.getBBox();
		var o, bb = svgcontent.createSVGRect();

		for (o in rubberBBox) {
			bb[o] = rubberBBox[o] / currentZoom;
		}
		rubberBBox = bb;
	} else {
		rubberBBox = svgcontent.createSVGRect();
		rubberBBox.x = rect.x;
		rubberBBox.y = rect.y;
		rubberBBox.width = rect.width;
		rubberBBox.height = rect.height;
	}

	var resultList = null;
	if (!svgedit.browser.isIE) {
		if (typeof svgroot.getIntersectionList === 'function') {
			// Offset the bbox of the rubber box by the offset of the svgcontent element.
			rubberBBox.x += parseInt(svgcontent.getAttribute('x'), 10);
			rubberBBox.y += parseInt(svgcontent.getAttribute('y'), 10);

			resultList = svgroot.getIntersectionList(rubberBBox, parent);
		}
	}

	if (resultList == null || typeof resultList.item !== 'function') {
		resultList = [];

		if (!curBBoxes.length) {
			// Cache all bboxes
			curBBoxes = getVisibleElementsAndBBoxes(parent);
		}
		var i = curBBoxes.length;
		while (i--) {
			if (!rubberBBox.width) { continue; }
			if (svgedit.math.rectsIntersect(rubberBBox, curBBoxes[i].bbox)) {
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
var getStrokedBBox = this.getStrokedBBox = function (elems) {
	if (!elems) { elems = getVisibleElements(); }
	return svgedit.utilities.getStrokedBBox(elems, addSvgElementFromJson, pathActions);
};

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
var getVisibleElements = this.getVisibleElements = function (parent) {
	if (!parent) {
		parent = $(svgcontent).children(); // Prevent layers from being included
	}

	var contentElems = [];
	$(parent).children().each(function (i, elem) {
		if (elem.getBBox) {
			contentElems.push(elem);
		}
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
var getVisibleElementsAndBBoxes = this.getVisibleElementsAndBBoxes = function (parent) {
	if (!parent) {
		parent = $(svgcontent).children(); // Prevent layers from being included
	}
	var contentElems = [];
	$(parent).children().each(function (i, elem) {
		if (elem.getBBox) {
			contentElems.push({elem: elem, bbox: getStrokedBBox([elem])});
		}
	});
	return contentElems.reverse();
};

// Function: groupSvgElem
// Wrap an SVG element into a group element, mark the group as 'gsvg'
//
// Parameters:
// elem - SVG element to wrap
var groupSvgElem = this.groupSvgElem = function (elem) {
	var g = document.createElementNS(NS.SVG, 'g');
	elem.parentNode.replaceChild(g, elem);
	$(g).append(elem).data('gsvg', elem)[0].id = getNextId();
};

// Set scope for these functions
var getId, getNextId;
var textActions, pathActions;

(function (c) {
// Object to contain editor event names and callback functions
var events = {};

getId = c.getId = function () { return getCurrentDrawing().getId(); };
getNextId = c.getNextId = function () { return getCurrentDrawing().getNextId(); };

// Function: call
// Run the callback function associated with the given event
//
// Parameters:
// event - String with the event name
// arg - Argument to pass through to the callback function
call = c.call = function (event, arg) {
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
c.bind = function (event, f) {
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
this.prepareSvg = function (newDoc) {
	this.sanitizeSvg(newDoc.documentElement);

	// convert paths into absolute commands
	var i, path, len,
		paths = newDoc.getElementsByTagNameNS(NS.SVG, 'path');
	for (i = 0, len = paths.length; i < len; ++i) {
		path = paths[i];
		path.setAttribute('d', pathActions.convertPath(path));
		pathActions.fixEnd(path);
	}
};

// Function: ffClone
// Hack for Firefox bugs where text element features aren't updated or get
// messed up. See issue 136 and issue 137.
// This function clones the element and re-selects it
// TODO: Test for this bug on load and add it to "support" object instead of
// browser sniffing
//
// Parameters:
// elem - The (text) DOM element to clone
var ffClone = function (elem) {
	if (!svgedit.browser.isGecko()) { return elem; }
	var clone = elem.cloneNode(true);
	elem.parentNode.insertBefore(clone, elem);
	elem.parentNode.removeChild(elem);
	selectorManager.releaseSelector(elem);
	selectedElements[0] = clone;
	selectorManager.requestSelector(clone).showGrips(true);
	return clone;
};

// this.each is deprecated, if any extension used this it can be recreated by doing this:
// $(canvas.getRootElem()).children().each(...)

// this.each = function (cb) {
//	$(svgroot).children().each(cb);
// };

// Function: setRotationAngle
// Removes any old rotations if present, prepends a new rotation at the
// transformed center
//
// Parameters:
// val - The new rotation angle in degrees
// preventUndo - Boolean indicating whether the action should be undoable or not
this.setRotationAngle = function (val, preventUndo) {
	// ensure val is the proper type
	val = parseFloat(val);
	var elem = selectedElements[0];
	var oldTransform = elem.getAttribute('transform');
	var bbox = svgedit.utilities.getBBox(elem);
	var cx = bbox.x + bbox.width / 2, cy = bbox.y + bbox.height / 2;
	var tlist = svgedit.transformlist.getTransformList(elem);

	// only remove the real rotational transform if present (i.e. at index=0)
	if (tlist.numberOfItems > 0) {
		var xform = tlist.getItem(0);
		if (xform.type === 4) {
			tlist.removeItem(0);
		}
	}
	// find Rnc and insert it
	if (val !== 0) {
		var center = svgedit.math.transformPoint(cx, cy, svgedit.math.transformListToTransform(tlist).matrix);
		var Rnc = svgroot.createSVGTransform();
		Rnc.setRotate(val, center.x, center.y);
		if (tlist.numberOfItems) {
			tlist.insertItemBefore(Rnc, 0);
		} else {
			tlist.appendItem(Rnc);
		}
	} else if (tlist.numberOfItems === 0) {
		elem.removeAttribute('transform');
	}

	if (!preventUndo) {
		// we need to undo it, then redo it so it can be undo-able! :)
		// TODO: figure out how to make changes to transform list undo-able cross-browser?
		var newTransform = elem.getAttribute('transform');
		elem.setAttribute('transform', oldTransform);
		changeSelectedAttribute('transform', newTransform, selectedElements);
		call('changed', selectedElements);
	}
	// var pointGripContainer = svgedit.utilities.getElem('pathpointgrip_container');
	// if (elem.nodeName === 'path' && pointGripContainer) {
	// 	pathActions.setPointContainerTransform(elem.getAttribute('transform'));
	// }
	var selector = selectorManager.requestSelector(selectedElements[0]);
	selector.resize();
	selector.updateGripCursors(val);
};

// Function: recalculateAllSelectedDimensions
// Runs recalculateDimensions on the selected elements,
// adding the changes to a single batch command
var recalculateAllSelectedDimensions = this.recalculateAllSelectedDimensions = function () {
	var text = (currentResizeMode === 'none' ? 'position' : 'size');
	var batchCmd = new svgedit.history.BatchCommand(text);

	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		// if (svgedit.utilities.getRotationAngle(elem) && !svgedit.math.hasMatrixTransform(getTransformList(elem))) { continue; }
		var cmd = svgedit.recalculate.recalculateDimensions(elem);
		if (cmd) {
			batchCmd.addSubCommand(cmd);
		}
	}

	if (!batchCmd.isEmpty()) {
		addCommandToHistory(batchCmd);
		call('changed', selectedElements);
	}
};

// Debug tool to easily see the current matrix in the browser's console
var logMatrix = function (m) {
	console.log([m.a, m.b, m.c, m.d, m.e, m.f]);
};

// Root Current Transformation Matrix in user units
var rootSctm = null;

// Group: Selection

// Function: clearSelection
// Clears the selection. The 'selected' handler is then called.
// Parameters:
// noCall - Optional boolean that when true does not call the "selected" handler
var clearSelection = this.clearSelection = function (noCall) {
	selectedElements.map(function (elem) {
		if (elem == null) return;

		selectorManager.releaseSelector(elem);
	});
	selectedElements = [];

	if (!noCall) { call('selected', selectedElements); }
};

// TODO: do we need to worry about selectedBBoxes here?

// Function: addToSelection
// Adds a list of elements to the selection. The 'selected' handler is then called.
//
// Parameters:
// elemsToAdd - an array of DOM elements to add to the selection
// showGrips - a boolean flag indicating whether the resize grips should be shown
var addToSelection = this.addToSelection = function (elemsToAdd, showGrips) {
	if (elemsToAdd.length === 0) { return; }
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
		if (!elem) { continue; }
		var bbox = svgedit.utilities.getBBox(elem);
		if (!bbox) { continue; }

		if (elem.tagName === 'a' && elem.childNodes.length === 1) {
			// Make "a" element's child be the selected element
			elem = elem.firstChild;
		}

		// if it's not already there, add it
		if (selectedElements.indexOf(elem) === -1) {
			selectedElements[j] = elem;

			// only the first selectedBBoxes element is ever used in the codebase these days
			// if (j === 0) selectedBBoxes[0] = svgedit.utilities.getBBox(elem);
			j++;
			var sel = selectorManager.requestSelector(elem, bbox);

			if (selectedElements.length > 1) {
				sel.showGrips(false);
			}
		}
	}
	call('selected', selectedElements);

	if (showGrips || selectedElements.length === 1) {
		selectorManager.requestSelector(selectedElements[0]).showGrips(true);
	} else {
		selectorManager.requestSelector(selectedElements[0]).showGrips(false);
	}

	// make sure the elements are in the correct order
	// See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

	selectedElements.sort(function (a, b) {
		if (a && b && a.compareDocumentPosition) {
			return 3 - (b.compareDocumentPosition(a) & 6);
		}
		if (a == null) {
			return 1;
		}
	});

	// Make sure first elements are not null
	while (selectedElements[0] == null) {
		selectedElements.shift(0);
	}
};

// Function: selectOnly()
// Selects only the given elements, shortcut for clearSelection(); addToSelection()
//
// Parameters:
// elems - an array of DOM elements to be selected
var selectOnly = this.selectOnly = function (elems, showGrips) {
	clearSelection(true);
	addToSelection(elems, showGrips);
};

// TODO: could use slice here to make this faster?
// TODO: should the 'selected' handler

// Function: removeFromSelection
// Removes elements from the selection.
//
// Parameters:
// elemsToRemove - an array of elements to remove from selection
/* var removeFromSelection = */ this.removeFromSelection = function (elemsToRemove) {
	if (selectedElements[0] == null) { return; }
	if (elemsToRemove.length === 0) { return; }

	// find every element and remove it from our array copy
	var i,
		j = 0,
		newSelectedItems = [],
		len = selectedElements.length;
	newSelectedItems.length = len;
	for (i = 0; i < len; ++i) {
		var elem = selectedElements[i];
		if (elem) {
			// keep the item
			if (elemsToRemove.indexOf(elem) === -1) {
				newSelectedItems[j] = elem;
				j++;
			} else { // remove the item and its selector
				selectorManager.releaseSelector(elem);
			}
		}
	}
	// the copy becomes the master now
	selectedElements = newSelectedItems;
};

// Function: selectAllInCurrentLayer
// Clears the selection, then adds all elements in the current layer to the selection.
this.selectAllInCurrentLayer = function () {
	var currentLayer = getCurrentDrawing().getCurrentLayer();
	if (currentLayer) {
		currentMode = 'select';
		selectOnly($(currentGroup || currentLayer).children());
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
var getMouseTarget = this.getMouseTarget = function (evt) {
	if (evt == null) {
		return null;
	}
	var mouseTarget = evt.target;

	// if it was a <use>, Opera and WebKit return the SVGElementInstance
	if (mouseTarget.correspondingUseElement) { mouseTarget = mouseTarget.correspondingUseElement; }

	// for foreign content, go up until we find the foreignObject
	// WebKit browsers set the mouse target to the svgcanvas div
	if ([NS.MATH, NS.HTML].indexOf(mouseTarget.namespaceURI) >= 0 &&
		mouseTarget.id !== 'svgcanvas'
	) {
		while (mouseTarget.nodeName !== 'foreignObject') {
			mouseTarget = mouseTarget.parentNode;
			if (!mouseTarget) { return svgroot; }
		}
	}

	// Get the desired mouseTarget with jQuery selector-fu
	// If it's root-like, select the root
	var currentLayer = getCurrentDrawing().getCurrentLayer();
	if ([svgroot, container, svgcontent, currentLayer].indexOf(mouseTarget) >= 0) {
		return svgroot;
	}

	var $target = $(mouseTarget);

	// If it's a selection grip, return the grip parent
	if ($target.closest('#selectorParentGroup').length) {
		// While we could instead have just returned mouseTarget,
		// this makes it easier to indentify as being a selector grip
		return selectorManager.selectorParentGroup;
	}

	while (mouseTarget.parentNode !== (currentGroup || currentLayer)) {
		mouseTarget = mouseTarget.parentNode;
	}

	//
	// // go up until we hit a child of a layer
	// while (mouseTarget.parentNode.parentNode.tagName == 'g') {
	// 	mouseTarget = mouseTarget.parentNode;
	// }
	// Webkit bubbles the mouse event all the way up to the div, so we
	// set the mouseTarget to the svgroot like the other browsers
	// if (mouseTarget.nodeName.toLowerCase() == 'div') {
	// 	mouseTarget = svgroot;
	// }

	return mouseTarget;
};

var drawnPath = null;

// Mouse events
(function () {
var dAttr = null,
	startX = null,
	startY = null,
	rStartX = null,
	rStartY = null,
	initBbox = {},
	freehand = {
		minx: null,
		miny: null,
		maxx: null,
		maxy: null
	},
	sumDistance = 0,
	controllPoint2 = {x: 0, y: 0},
	controllPoint1 = {x: 0, y: 0},
	start = {x: 0, y: 0},
	end = {x: 0, y: 0},
	parameter,
	nextParameter,
	bSpline = {x: 0, y: 0},
	nextPos = {x: 0, y: 0},
	THRESHOLD_DIST = 0.8,
	STEP_COUNT = 10;

var getBsplinePoint = function (t) {
	var spline = {x: 0, y: 0},
		p0 = controllPoint2,
		p1 = controllPoint1,
		p2 = start,
		p3 = end,
		S = 1.0 / 6.0,
		t2 = t * t,
		t3 = t2 * t;

	var m = [
		[-1, 3, -3, 1],
		[3, -6, 3, 0],
		[-3, 0, 3, 0],
		[1, 4, 1, 0]
	];

	spline.x = S * (
		(p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3 +
			(p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2 +
			(p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t +
			(p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3])
	);
	spline.y = S * (
		(p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3 +
			(p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2 +
			(p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t +
			(p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3])
	);

	return {
		x: spline.x,
		y: spline.y
	};
};
// - when we are in a create mode, the element is added to the canvas
// but the action is not recorded until mousing up
// - when we are in select mode, select the element, remember the position
// and do nothing else
var mouseDown = function (evt) {
	if (canvas.spaceKey || evt.button === 1) { return; }

	var rightClick = evt.button === 2;

	if (evt.altKey) { // duplicate when dragging
		svgCanvas.cloneSelectedElements(0, 0);
	}

	rootSctm = $('#svgcontent g')[0].getScreenCTM().inverse();

	var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm),
		mouseX = pt.x * currentZoom,
		mouseY = pt.y * currentZoom;

	evt.preventDefault();

	if (rightClick) {
		currentMode = 'select';
		lastClickPoint = pt;
	}

	// This would seem to be unnecessary...
	// if (['select', 'resize'].indexOf(currentMode) === -1) {
	// 	setGradient();
	// }

	var x = mouseX / currentZoom,
		y = mouseY / currentZoom,
		mouseTarget = getMouseTarget(evt);

	if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
		mouseTarget = mouseTarget.firstChild;
	}

	// realX/y ignores grid-snap value
	var realX = x;
	rStartX = startX = x;
	var realY = y;
	rStartY = startY = y;

	if (curConfig.gridSnapping) {
		x = svgedit.utilities.snapToGrid(x);
		y = svgedit.utilities.snapToGrid(y);
		startX = svgedit.utilities.snapToGrid(startX);
		startY = svgedit.utilities.snapToGrid(startY);
	}

	// if it is a selector grip, then it must be a single element selected,
	// set the mouseTarget to that and update the mode to rotate/resize

	if (mouseTarget === selectorManager.selectorParentGroup && selectedElements[0] != null) {
		var grip = evt.target;
		var griptype = elData(grip, 'type');
		// rotating
		if (griptype === 'rotate') {
			currentMode = 'rotate';
		// resizing
		} else if (griptype === 'resize') {
			currentMode = 'resize';
			currentResizeMode = elData(grip, 'dir');
		}
		mouseTarget = selectedElements[0];
	}

	startTransform = mouseTarget.getAttribute('transform');
	var i, strokeW,
		tlist = svgedit.transformlist.getTransformList(mouseTarget);
	switch (currentMode) {
	case 'select':
		started = true;
		currentResizeMode = 'none';
		if (rightClick) { started = false; }

		if (mouseTarget !== svgroot) {
			// if this element is not yet selected, clear selection and select it
			if (selectedElements.indexOf(mouseTarget) === -1) {
				// only clear selection if shift is not pressed (otherwise, add
				// element to selection)
				if (!evt.shiftKey) {
					// No need to do the call here as it will be done on addToSelection
					clearSelection(true);
				}
				addToSelection([mouseTarget]);
				justSelected = mouseTarget;
				pathActions.clear();
			}
			// else if it's a path, go into pathedit mode in mouseup

			if (!rightClick) {
				// insert a dummy transform so if the element(s) are moved it will have
				// a transform to use for its translate
				for (i = 0; i < selectedElements.length; ++i) {
					if (selectedElements[i] == null) { continue; }
					var slist = svgedit.transformlist.getTransformList(selectedElements[i]);
					if (slist.numberOfItems) {
						slist.insertItemBefore(svgroot.createSVGTransform(), 0);
					} else {
						slist.appendItem(svgroot.createSVGTransform());
					}
				}
			}
		} else if (!rightClick) {
			clearSelection();
			currentMode = 'multiselect';
			if (rubberBox == null) {
				rubberBox = selectorManager.getRubberBandBox();
			}
			rStartX *= currentZoom;
			rStartY *= currentZoom;
			// console.log('p',[evt.pageX, evt.pageY]);
			// console.log('c',[evt.clientX, evt.clientY]);
			// console.log('o',[evt.offsetX, evt.offsetY]);
			// console.log('s',[startX, startY]);

			svgedit.utilities.assignAttributes(rubberBox, {
				'x': rStartX,
				'y': rStartY,
				'width': 0,
				'height': 0,
				'display': 'inline'
			}, 100);
		}
		break;
	case 'zoom':
		started = true;
		if (rubberBox == null) {
			rubberBox = selectorManager.getRubberBandBox();
		}
		svgedit.utilities.assignAttributes(rubberBox, {
			'x': realX * currentZoom,
			'y': realX * currentZoom,
			'width': 0,
			'height': 0,
			'display': 'inline'
		}, 100);
		break;
	case 'resize':
		started = true;
		startX = x;
		startY = y;

		// Getting the BBox from the selection box, since we know we
		// want to orient around it
		initBbox = svgedit.utilities.getBBox($('#selectedBox0')[0]);
		var bb = {};
		$.each(initBbox, function (key, val) {
			bb[key] = val / currentZoom;
		});
		initBbox = bb;

		// append three dummy transforms to the tlist so that
		// we can translate,scale,translate in mousemove
		var pos = svgedit.utilities.getRotationAngle(mouseTarget) ? 1 : 0;

		if (svgedit.math.hasMatrixTransform(tlist)) {
			tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
			tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
			tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
		} else {
			tlist.appendItem(svgroot.createSVGTransform());
			tlist.appendItem(svgroot.createSVGTransform());
			tlist.appendItem(svgroot.createSVGTransform());

			if (svgedit.browser.supportsNonScalingStroke()) {
				// Handle crash for newer Chrome and Safari 6 (Mobile and Desktop):
				// https://code.google.com/p/svg-edit/issues/detail?id=904
				// Chromium issue: https://code.google.com/p/chromium/issues/detail?id=114625
				// TODO: Remove this workaround once vendor fixes the issue
				var isWebkit = svgedit.browser.isWebkit();

				if (isWebkit) {
					var delayedStroke = function (ele) {
						var _stroke = ele.getAttributeNS(null, 'stroke');
						ele.removeAttributeNS(null, 'stroke');
						// Re-apply stroke after delay. Anything higher than 1 seems to cause flicker
						if (_stroke !== null) setTimeout(function () { ele.setAttributeNS(null, 'stroke', _stroke); }, 0);
					};
				}
				mouseTarget.style.vectorEffect = 'non-scaling-stroke';
				if (isWebkit) { delayedStroke(mouseTarget); }

				var all = mouseTarget.getElementsByTagName('*'),
					len = all.length;
				for (i = 0; i < len; i++) {
					all[i].style.vectorEffect = 'non-scaling-stroke';
					if (isWebkit) { delayedStroke(all[i]); }
				}
			}
		}
		break;
	case 'fhellipse':
	case 'fhrect':
	case 'fhpath':
		start.x = realX;
		start.y = realY;
		started = true;
		dAttr = realX + ',' + realY + ' ';
		strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
		addSvgElementFromJson({
			element: 'polyline',
			curStyles: true,
			attr: {
				points: dAttr,
				id: getNextId(),
				fill: 'none',
				opacity: curShape.opacity / 2,
				'stroke-linecap': 'round',
				style: 'pointer-events:none'
			}
		});
		freehand.minx = realX;
		freehand.maxx = realX;
		freehand.miny = realY;
		freehand.maxy = realY;
		break;
	case 'image':
		started = true;
		var newImage = addSvgElementFromJson({
			element: 'image',
			attr: {
				x: x,
				y: y,
				width: 0,
				height: 0,
				id: getNextId(),
				opacity: curShape.opacity / 2,
				style: 'pointer-events:inherit'
			}
		});
		setHref(newImage, lastGoodImgUrl);
		svgedit.utilities.preventClickDefault(newImage);
		break;
	case 'square':
		// FIXME: once we create the rect, we lose information that this was a square
		// (for resizing purposes this could be important)
		// Fallthrough
	case 'rect':
		started = true;
		startX = x;
		startY = y;
		addSvgElementFromJson({
			element: 'rect',
			curStyles: true,
			attr: {
				x: x,
				y: y,
				width: 0,
				height: 0,
				id: getNextId(),
				opacity: curShape.opacity / 2
			}
		});
		break;
	case 'line':
		started = true;
		strokeW = Number(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
		addSvgElementFromJson({
			element: 'line',
			curStyles: true,
			attr: {
				x1: x,
				y1: y,
				x2: x,
				y2: y,
				id: getNextId(),
				stroke: curShape.stroke,
				'stroke-width': strokeW,
				'stroke-dasharray': curShape.stroke_dasharray,
				'stroke-linejoin': curShape.stroke_linejoin,
				'stroke-linecap': curShape.stroke_linecap,
				'stroke-opacity': curShape.stroke_opacity,
				fill: 'none',
				opacity: curShape.opacity / 2,
				style: 'pointer-events:none'
			}
		});
		break;
	case 'circle':
		started = true;
		addSvgElementFromJson({
			element: 'circle',
			curStyles: true,
			attr: {
				cx: x,
				cy: y,
				r: 0,
				id: getNextId(),
				opacity: curShape.opacity / 2
			}
		});
		break;
	case 'ellipse':
		started = true;
		addSvgElementFromJson({
			element: 'ellipse',
			curStyles: true,
			attr: {
				cx: x,
				cy: y,
				rx: 0,
				ry: 0,
				id: getNextId(),
				opacity: curShape.opacity / 2
			}
		});
		break;
	case 'text':
		started = true;
		/* var newText = */ addSvgElementFromJson({
			element: 'text',
			curStyles: true,
			attr: {
				x: x,
				y: y,
				id: getNextId(),
				fill: curText.fill,
				'stroke-width': curText.stroke_width,
				'font-size': curText.font_size,
				'font-family': curText.font_family,
				'text-anchor': 'middle',
				'xml:space': 'preserve',
				opacity: curShape.opacity
			}
		});
		// newText.textContent = 'text';
		break;
	case 'path':
		// Fall through
	case 'pathedit':
		startX *= currentZoom;
		startY *= currentZoom;
		pathActions.mouseDown(evt, mouseTarget, startX, startY);
		started = true;
		break;
	case 'textedit':
		startX *= currentZoom;
		startY *= currentZoom;
		textActions.mouseDown(evt, mouseTarget, startX, startY);
		started = true;
		break;
	case 'rotate':
		started = true;
		// we are starting an undoable change (a drag-rotation)
		canvas.undoMgr.beginUndoableChange('transform', selectedElements);
		break;
	default:
		// This could occur in an extension
		break;
	}

	var extResult = runExtensions('mouseDown', {
		event: evt,
		start_x: startX,
		start_y: startY,
		selectedElements: selectedElements
	}, true);

	$.each(extResult, function (i, r) {
		if (r && r.started) {
			started = true;
		}
	});
};

// in this function we do not record any state changes yet (but we do update
// any elements that are still being created, moved or resized on the canvas)
var mouseMove = function (evt) {
	if (!started) { return; }
	if (evt.button === 1 || canvas.spaceKey) { return; }

	var i, xya, c, cx, cy, dx, dy, len, angle, box,
		selected = selectedElements[0],
		pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm),
		mouseX = pt.x * currentZoom,
		mouseY = pt.y * currentZoom,
		shape = svgedit.utilities.getElem(getId());

	var realX = mouseX / currentZoom;
	var x = realX;
	var realY = mouseY / currentZoom;
	var y = realY;

	if (curConfig.gridSnapping) {
		x = svgedit.utilities.snapToGrid(x);
		y = svgedit.utilities.snapToGrid(y);
	}

	evt.preventDefault();
	var tlist;
	switch (currentMode) {
	case 'select':
		// we temporarily use a translate on the element(s) being dragged
		// this transform is removed upon mousing up and the element is
		// relocated to the new location
		if (selectedElements[0] !== null) {
			dx = x - startX;
			dy = y - startY;

			if (curConfig.gridSnapping) {
				dx = svgedit.utilities.snapToGrid(dx);
				dy = svgedit.utilities.snapToGrid(dy);
			}

			if (evt.shiftKey) {
				xya = svgedit.math.snapToAngle(startX, startY, x, y);
				x = xya.x;
				y = xya.y;
			}

			if (dx !== 0 || dy !== 0) {
				len = selectedElements.length;
				for (i = 0; i < len; ++i) {
					selected = selectedElements[i];
					if (selected == null) { break; }
					// if (i === 0) {
					// 	var box = svgedit.utilities.getBBox(selected);
					// 		selectedBBoxes[i].x = box.x + dx;
					// 		selectedBBoxes[i].y = box.y + dy;
					// }

					// update the dummy transform in our transform list
					// to be a translate
					var xform = svgroot.createSVGTransform();
					tlist = svgedit.transformlist.getTransformList(selected);
					// Note that if Webkit and there's no ID for this
					// element, the dummy transform may have gotten lost.
					// This results in unexpected behaviour

					xform.setTranslate(dx, dy);
					if (tlist.numberOfItems) {
						tlist.replaceItem(xform, 0);
					} else {
						tlist.appendItem(xform);
					}

					// update our internal bbox that we're tracking while dragging
					selectorManager.requestSelector(selected).resize();
				}

				call('transition', selectedElements);
			}
		}
		break;
	case 'multiselect':
		realX *= currentZoom;
		realY *= currentZoom;
		svgedit.utilities.assignAttributes(rubberBox, {
			'x': Math.min(rStartX, realX),
			'y': Math.min(rStartY, realY),
			'width': Math.abs(realX - rStartX),
			'height': Math.abs(realY - rStartY)
		}, 100);

		// for each selected:
		// - if newList contains selected, do nothing
		// - if newList doesn't contain selected, remove it from selected
		// - for any newList that was not in selectedElements, add it to selected
		var elemsToRemove = selectedElements.slice(), elemsToAdd = [],
			newList = getIntersectionList();

		// For every element in the intersection, add if not present in selectedElements.
		len = newList.length;
		for (i = 0; i < len; ++i) {
			var intElem = newList[i];
			// Found an element that was not selected before, so we should add it.
			if (selectedElements.indexOf(intElem) === -1) {
				elemsToAdd.push(intElem);
			}
			// Found an element that was already selected, so we shouldn't remove it.
			var foundInd = elemsToRemove.indexOf(intElem);
			if (foundInd !== -1) {
				elemsToRemove.splice(foundInd, 1);
			}
		}

		if (elemsToRemove.length > 0) {
			canvas.removeFromSelection(elemsToRemove);
		}

		if (elemsToAdd.length > 0) {
			canvas.addToSelection(elemsToAdd);
		}

		break;
	case 'resize':
		// we track the resize bounding box and translate/scale the selected element
		// while the mouse is down, when mouse goes up, we use this to recalculate
		// the shape's coordinates
		tlist = svgedit.transformlist.getTransformList(selected);
		var hasMatrix = svgedit.math.hasMatrixTransform(tlist);
		box = hasMatrix ? initBbox : svgedit.utilities.getBBox(selected);
		var left = box.x, top = box.y, width = box.width,
			height = box.height;
		dx = (x - startX);
		dy = (y - startY);

		if (curConfig.gridSnapping) {
			dx = svgedit.utilities.snapToGrid(dx);
			dy = svgedit.utilities.snapToGrid(dy);
			height = svgedit.utilities.snapToGrid(height);
			width = svgedit.utilities.snapToGrid(width);
		}

		// if rotated, adjust the dx,dy values
		angle = svgedit.utilities.getRotationAngle(selected);
		if (angle) {
			var r = Math.sqrt(dx * dx + dy * dy),
				theta = Math.atan2(dy, dx) - angle * Math.PI / 180.0;
			dx = r * Math.cos(theta);
			dy = r * Math.sin(theta);
		}

		// if not stretching in y direction, set dy to 0
		// if not stretching in x direction, set dx to 0
		if (currentResizeMode.indexOf('n') === -1 && currentResizeMode.indexOf('s') === -1) {
			dy = 0;
		}
		if (currentResizeMode.indexOf('e') === -1 && currentResizeMode.indexOf('w') === -1) {
			dx = 0;
		}

		var // ts = null,
			tx = 0, ty = 0,
			sy = height ? (height + dy) / height : 1,
			sx = width ? (width + dx) / width : 1;
		// if we are dragging on the north side, then adjust the scale factor and ty
		if (currentResizeMode.indexOf('n') >= 0) {
			sy = height ? (height - dy) / height : 1;
			ty = height;
		}

		// if we dragging on the east side, then adjust the scale factor and tx
		if (currentResizeMode.indexOf('w') >= 0) {
			sx = width ? (width - dx) / width : 1;
			tx = width;
		}

		// update the transform list with translate,scale,translate
		var translateOrigin = svgroot.createSVGTransform(),
			scale = svgroot.createSVGTransform(),
			translateBack = svgroot.createSVGTransform();

		if (curConfig.gridSnapping) {
			left = svgedit.utilities.snapToGrid(left);
			tx = svgedit.utilities.snapToGrid(tx);
			top = svgedit.utilities.snapToGrid(top);
			ty = svgedit.utilities.snapToGrid(ty);
		}

		translateOrigin.setTranslate(-(left + tx), -(top + ty));
		if (evt.shiftKey) {
			if (sx === 1) {
				sx = sy;
			} else { sy = sx; }
		}
		scale.setScale(sx, sy);

		translateBack.setTranslate(left + tx, top + ty);
		if (hasMatrix) {
			var diff = angle ? 1 : 0;
			tlist.replaceItem(translateOrigin, 2 + diff);
			tlist.replaceItem(scale, 1 + diff);
			tlist.replaceItem(translateBack, Number(diff));
		} else {
			var N = tlist.numberOfItems;
			tlist.replaceItem(translateBack, N - 3);
			tlist.replaceItem(scale, N - 2);
			tlist.replaceItem(translateOrigin, N - 1);
		}

		selectorManager.requestSelector(selected).resize();

		call('transition', selectedElements);

		break;
	case 'zoom':
		realX *= currentZoom;
		realY *= currentZoom;
		svgedit.utilities.assignAttributes(rubberBox, {
			'x': Math.min(rStartX * currentZoom, realX),
			'y': Math.min(rStartY * currentZoom, realY),
			'width': Math.abs(realX - rStartX * currentZoom),
			'height': Math.abs(realY - rStartY * currentZoom)
		}, 100);
		break;
	case 'text':
		svgedit.utilities.assignAttributes(shape, {
			'x': x,
			'y': y
		}, 1000);
		break;
	case 'line':
		if (curConfig.gridSnapping) {
			x = svgedit.utilities.snapToGrid(x);
			y = svgedit.utilities.snapToGrid(y);
		}

		var x2 = x;
		var y2 = y;

		if (evt.shiftKey) {
			xya = svgedit.math.snapToAngle(startX, startY, x2, y2);
			x2 = xya.x;
			y2 = xya.y;
		}

		shape.setAttributeNS(null, 'x2', x2);
		shape.setAttributeNS(null, 'y2', y2);
		break;
	case 'foreignObject':
		// fall through
	case 'square':
		// fall through
	case 'rect':
		// fall through
	case 'image':
		var square = (currentMode === 'square') || evt.shiftKey,
			w = Math.abs(x - startX),
			h = Math.abs(y - startY),
			newX, newY;
		if (square) {
			w = h = Math.max(w, h);
			newX = startX < x ? startX : startX - w;
			newY = startY < y ? startY : startY - h;
		} else {
			newX = Math.min(startX, x);
			newY = Math.min(startY, y);
		}

		if (curConfig.gridSnapping) {
			w = svgedit.utilities.snapToGrid(w);
			h = svgedit.utilities.snapToGrid(h);
			newX = svgedit.utilities.snapToGrid(newX);
			newY = svgedit.utilities.snapToGrid(newY);
		}

		svgedit.utilities.assignAttributes(shape, {
			'width': w,
			'height': h,
			'x': newX,
			'y': newY
		}, 1000);

		break;
	case 'circle':
		c = $(shape).attr(['cx', 'cy']);
		cx = c.cx;
		cy = c.cy;
		var rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
		if (curConfig.gridSnapping) {
			rad = svgedit.utilities.snapToGrid(rad);
		}
		shape.setAttributeNS(null, 'r', rad);
		break;
	case 'ellipse':
		c = $(shape).attr(['cx', 'cy']);
		cx = c.cx;
		cy = c.cy;
		if (curConfig.gridSnapping) {
			x = svgedit.utilities.snapToGrid(x);
			cx = svgedit.utilities.snapToGrid(cx);
			y = svgedit.utilities.snapToGrid(y);
			cy = svgedit.utilities.snapToGrid(cy);
		}
		shape.setAttributeNS(null, 'rx', Math.abs(x - cx));
		var ry = Math.abs(evt.shiftKey ? (x - cx) : (y - cy));
		shape.setAttributeNS(null, 'ry', ry);
		break;
	case 'fhellipse':
	case 'fhrect':
		freehand.minx = Math.min(realX, freehand.minx);
		freehand.maxx = Math.max(realX, freehand.maxx);
		freehand.miny = Math.min(realY, freehand.miny);
		freehand.maxy = Math.max(realY, freehand.maxy);
		// Fallthrough
	case 'fhpath':
		// dAttr += + realX + ',' + realY + ' ';
		// shape.setAttributeNS(null, 'points', dAttr);
		end.x = realX; end.y = realY;
		if (controllPoint2.x && controllPoint2.y) {
			for (i = 0; i < STEP_COUNT - 1; i++) {
				parameter = i / STEP_COUNT;
				nextParameter = (i + 1) / STEP_COUNT;
				bSpline = getBsplinePoint(nextParameter);
				nextPos = bSpline;
				bSpline = getBsplinePoint(parameter);
				sumDistance += Math.sqrt((nextPos.x - bSpline.x) * (nextPos.x - bSpline.x) + (nextPos.y - bSpline.y) * (nextPos.y - bSpline.y));
				if (sumDistance > THRESHOLD_DIST) {
					dAttr += +bSpline.x + ',' + bSpline.y + ' ';
					shape.setAttributeNS(null, 'points', dAttr);
					sumDistance -= THRESHOLD_DIST;
				}
			}
		}
		controllPoint2 = {x: controllPoint1.x, y: controllPoint1.y};
		controllPoint1 = {x: start.x, y: start.y};
		start = {x: end.x, y: end.y};
		break;
	// update path stretch line coordinates
	case 'path':
		// fall through
	case 'pathedit':
		x *= currentZoom;
		y *= currentZoom;

		if (curConfig.gridSnapping) {
			x = svgedit.utilities.snapToGrid(x);
			y = svgedit.utilities.snapToGrid(y);
			startX = svgedit.utilities.snapToGrid(startX);
			startY = svgedit.utilities.snapToGrid(startY);
		}
		if (evt.shiftKey) {
			var path = svgedit.path.path;
			var x1, y1;
			if (path) {
				x1 = path.dragging ? path.dragging[0] : startX;
				y1 = path.dragging ? path.dragging[1] : startY;
			} else {
				x1 = startX;
				y1 = startY;
			}
			xya = svgedit.math.snapToAngle(x1, y1, x, y);
			x = xya.x;
			y = xya.y;
		}

		if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
			realX *= currentZoom;
			realY *= currentZoom;
			svgedit.utilities.assignAttributes(rubberBox, {
				'x': Math.min(rStartX * currentZoom, realX),
				'y': Math.min(rStartY * currentZoom, realY),
				'width': Math.abs(realX - rStartX * currentZoom),
				'height': Math.abs(realY - rStartY * currentZoom)
			}, 100);
		}
		pathActions.mouseMove(x, y);

		break;
	case 'textedit':
		x *= currentZoom;
		y *= currentZoom;
		// if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
		// 	svgedit.utilities.assignAttributes(rubberBox, {
		// 		'x': Math.min(startX, x),
		// 		'y': Math.min(startY, y),
		// 		'width': Math.abs(x - startX),
		// 		'height': Math.abs(y - startY)
		// 	}, 100);
		// }

		textActions.mouseMove(mouseX, mouseY);

		break;
	case 'rotate':
		box = svgedit.utilities.getBBox(selected);
		cx = box.x + box.width / 2;
		cy = box.y + box.height / 2;
		var m = svgedit.math.getMatrix(selected),
			center = svgedit.math.transformPoint(cx, cy, m);
		cx = center.x;
		cy = center.y;
		angle = ((Math.atan2(cy - y, cx - x) * (180 / Math.PI)) - 90) % 360;
		if (curConfig.gridSnapping) {
			angle = svgedit.utilities.snapToGrid(angle);
		}
		if (evt.shiftKey) { // restrict rotations to nice angles (WRS)
			var snap = 45;
			angle = Math.round(angle / snap) * snap;
		}

		canvas.setRotationAngle(angle < -180 ? (360 + angle) : angle, true);
		call('transition', selectedElements);
		break;
	default:
		break;
	}

	runExtensions('mouseMove', {
		event: evt,
		mouse_x: mouseX,
		mouse_y: mouseY,
		selected: selected
	});
}; // mouseMove()

// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
// and store it on the Undo stack
// - in move/resize mode, the element's attributes which were affected by the move/resize are
// identified, a ChangeElementCommand is created and stored on the stack for those attrs
// this is done in when we recalculate the selected dimensions()
var mouseUp = function (evt) {
	if (evt.button === 2) { return; }
	var tempJustSelected = justSelected;
	justSelected = null;
	if (!started) { return; }
	var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm),
		mouseX = pt.x * currentZoom,
		mouseY = pt.y * currentZoom,
		x = mouseX / currentZoom,
		y = mouseY / currentZoom,
		element = svgedit.utilities.getElem(getId()),
		keep = false;

	var realX = x;
	var realY = y;

	// TODO: Make true when in multi-unit mode
	var useUnit = false; // (curConfig.baseUnit !== 'px');
	started = false;
	var attrs, t;
	switch (currentMode) {
	// intentionally fall-through to select here
	case 'resize':
	case 'multiselect':
		if (rubberBox != null) {
			rubberBox.setAttribute('display', 'none');
			curBBoxes = [];
		}
		currentMode = 'select';
		// Fallthrough
	case 'select':
		if (selectedElements[0] != null) {
			// if we only have one selected element
			if (selectedElements[1] == null) {
				// set our current stroke/fill properties to the element's
				var selected = selectedElements[0];
				switch (selected.tagName) {
				case 'g':
				case 'use':
				case 'image':
				case 'foreignObject':
					break;
				default:
					curProperties.fill = selected.getAttribute('fill');
					curProperties.fill_opacity = selected.getAttribute('fill-opacity');
					curProperties.stroke = selected.getAttribute('stroke');
					curProperties.stroke_opacity = selected.getAttribute('stroke-opacity');
					curProperties.stroke_width = selected.getAttribute('stroke-width');
					curProperties.stroke_dasharray = selected.getAttribute('stroke-dasharray');
					curProperties.stroke_linejoin = selected.getAttribute('stroke-linejoin');
					curProperties.stroke_linecap = selected.getAttribute('stroke-linecap');
				}

				if (selected.tagName === 'text') {
					curText.font_size = selected.getAttribute('font-size');
					curText.font_family = selected.getAttribute('font-family');
				}
				selectorManager.requestSelector(selected).showGrips(true);

				// This shouldn't be necessary as it was done on mouseDown...
				// call('selected', [selected]);
			}
			// always recalculate dimensions to strip off stray identity transforms
			recalculateAllSelectedDimensions();
			// if it was being dragged/resized
			if (realX !== rStartX || realY !== rStartY) {
				var i, len = selectedElements.length;
				for (i = 0; i < len; ++i) {
					if (selectedElements[i] == null) { break; }
					if (!selectedElements[i].firstChild) {
						// Not needed for groups (incorrectly resizes elems), possibly not needed at all?
						selectorManager.requestSelector(selectedElements[i]).resize();
					}
				}
			// no change in position/size, so maybe we should move to pathedit
			} else {
				t = evt.target;
				if (selectedElements[0].nodeName === 'path' && selectedElements[1] == null) {
					pathActions.select(selectedElements[0]);
				// if it was a path
				// else, if it was selected and this is a shift-click, remove it from selection
				} else if (evt.shiftKey) {
					if (tempJustSelected !== t) {
						canvas.removeFromSelection([t]);
					}
				}
			} // no change in mouse position

			// Remove non-scaling stroke
			if (svgedit.browser.supportsNonScalingStroke()) {
				var elem = selectedElements[0];
				if (elem) {
					elem.removeAttribute('style');
					svgedit.utilities.walkTree(elem, function (elem) {
						elem.removeAttribute('style');
					});
				}
			}
		}
		return;
	case 'zoom':
		if (rubberBox != null) {
			rubberBox.setAttribute('display', 'none');
		}
		var factor = evt.shiftKey ? 0.5 : 2;
		call('zoomed', {
			'x': Math.min(rStartX, realX),
			'y': Math.min(rStartY, realY),
			'width': Math.abs(realX - rStartX),
			'height': Math.abs(realY - rStartY),
			'factor': factor
		});
		return;
	case 'fhpath':
		// Check that the path contains at least 2 points; a degenerate one-point path
		// causes problems.
		// Webkit ignores how we set the points attribute with commas and uses space
		// to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
		sumDistance = 0;
		controllPoint2 = {x: 0, y: 0};
		controllPoint1 = {x: 0, y: 0};
		start = {x: 0, y: 0};
		end = {x: 0, y: 0};
		var coords = element.getAttribute('points');
		var commaIndex = coords.indexOf(',');
		if (commaIndex >= 0) {
			keep = coords.indexOf(',', commaIndex + 1) >= 0;
		} else {
			keep = coords.indexOf(' ', coords.indexOf(' ') + 1) >= 0;
		}
		if (keep) {
			element = pathActions.smoothPolylineIntoPath(element);
		}
		break;
	case 'line':
		attrs = $(element).attr(['x1', 'x2', 'y1', 'y2']);
		keep = (attrs.x1 !== attrs.x2 || attrs.y1 !== attrs.y2);
		break;
	case 'foreignObject':
	case 'square':
	case 'rect':
	case 'image':
		attrs = $(element).attr(['width', 'height']);
		// Image should be kept regardless of size (use inherit dimensions later)
		keep = (attrs.width !== '0' || attrs.height !== '0') || currentMode === 'image';
		break;
	case 'circle':
		keep = (element.getAttribute('r') !== '0');
		break;
	case 'ellipse':
		attrs = $(element).attr(['rx', 'ry']);
		keep = (attrs.rx != null || attrs.ry != null);
		break;
	case 'fhellipse':
		if ((freehand.maxx - freehand.minx) > 0 &&
			(freehand.maxy - freehand.miny) > 0) {
			element = addSvgElementFromJson({
				element: 'ellipse',
				curStyles: true,
				attr: {
					cx: (freehand.minx + freehand.maxx) / 2,
					cy: (freehand.miny + freehand.maxy) / 2,
					rx: (freehand.maxx - freehand.minx) / 2,
					ry: (freehand.maxy - freehand.miny) / 2,
					id: getId()
				}
			});
			call('changed', [element]);
			keep = true;
		}
		break;
	case 'fhrect':
		if ((freehand.maxx - freehand.minx) > 0 &&
			(freehand.maxy - freehand.miny) > 0) {
			element = addSvgElementFromJson({
				element: 'rect',
				curStyles: true,
				attr: {
					x: freehand.minx,
					y: freehand.miny,
					width: (freehand.maxx - freehand.minx),
					height: (freehand.maxy - freehand.miny),
					id: getId()
				}
			});
			call('changed', [element]);
			keep = true;
		}
		break;
	case 'text':
		keep = true;
		selectOnly([element]);
		textActions.start(element);
		break;
	case 'path':
		// set element to null here so that it is not removed nor finalized
		element = null;
		// continue to be set to true so that mouseMove happens
		started = true;

		var res = pathActions.mouseUp(evt, element, mouseX, mouseY);
		element = res.element;
		keep = res.keep;
		break;
	case 'pathedit':
		keep = true;
		element = null;
		pathActions.mouseUp(evt);
		break;
	case 'textedit':
		keep = false;
		element = null;
		textActions.mouseUp(evt, mouseX, mouseY);
		break;
	case 'rotate':
		keep = true;
		element = null;
		currentMode = 'select';
		var batchCmd = canvas.undoMgr.finishUndoableChange();
		if (!batchCmd.isEmpty()) {
			addCommandToHistory(batchCmd);
		}
		// perform recalculation to weed out any stray identity transforms that might get stuck
		recalculateAllSelectedDimensions();
		call('changed', selectedElements);
		break;
	default:
		// This could occur in an extension
		break;
	}

	var extResult = runExtensions('mouseUp', {
		event: evt,
		mouse_x: mouseX,
		mouse_y: mouseY
	}, true);

	$.each(extResult, function (i, r) {
		if (r) {
			keep = r.keep || keep;
			element = r.element;
			started = r.started || started;
		}
	});

	if (!keep && element != null) {
		getCurrentDrawing().releaseId(getId());
		element.parentNode.removeChild(element);
		element = null;

		t = evt.target;

		// if this element is in a group, go up until we reach the top-level group
		// just below the layer groups
		// TODO: once we implement links, we also would have to check for <a> elements
		while (t.parentNode.parentNode.tagName === 'g') {
			t = t.parentNode;
		}
		// if we are not in the middle of creating a path, and we've clicked on some shape,
		// then go to Select mode.
		// WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
		if ((currentMode !== 'path' || !drawnPath) &&
			t.parentNode.id !== 'selectorParentGroup' &&
			t.id !== 'svgcanvas' && t.id !== 'svgroot'
		) {
			// switch into "select" mode if we've clicked on an element
			canvas.setMode('select');
			selectOnly([t], true);
		}
	} else if (element != null) {
		canvas.addedNew = true;

		if (useUnit) { svgedit.units.convertAttrs(element); }

		var aniDur = 0.2, cAni;
		if (opacAni.beginElement && parseFloat(element.getAttribute('opacity')) !== curShape.opacity) {
			cAni = $(opacAni).clone().attr({
				to: curShape.opacity,
				dur: aniDur
			}).appendTo(element);
			try {
				// Fails in FF4 on foreignObject
				cAni[0].beginElement();
			} catch (e) {}
		} else {
			aniDur = 0;
		}

		// Ideally this would be done on the endEvent of the animation,
		// but that doesn't seem to be supported in Webkit
		setTimeout(function () {
			if (cAni) { cAni.remove(); }
			element.setAttribute('opacity', curShape.opacity);
			element.setAttribute('style', 'pointer-events:inherit');
			cleanupElement(element);
			if (currentMode === 'path') {
				pathActions.toEditMode(element);
			} else if (curConfig.selectNew) {
				selectOnly([element], true);
			}
			// we create the insert command that is stored on the stack
			// undo means to call cmd.unapply(), redo means to call cmd.apply()
			addCommandToHistory(new svgedit.history.InsertElementCommand(element));

			call('changed', [element]);
		}, aniDur * 1000);
	}

	startTransform = null;
};

var dblClick = function (evt) {
	var evtTarget = evt.target;
	var parent = evtTarget.parentNode;

	// Do nothing if already in current group
	if (parent === currentGroup) { return; }

	var mouseTarget = getMouseTarget(evt);
	var tagName = mouseTarget.tagName;

	if (tagName === 'text' && currentMode !== 'textedit') {
		var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm);
		textActions.select(mouseTarget, pt.x, pt.y);
	}

	if ((tagName === 'g' || tagName === 'a') &&
		svgedit.utilities.getRotationAngle(mouseTarget)
	) {
		// TODO: Allow method of in-group editing without having to do
		// this (similar to editing rotated paths)

		// Ungroup and regroup
		pushGroupProperties(mouseTarget);
		mouseTarget = selectedElements[0];
		clearSelection(true);
	}
	// Reset context
	if (currentGroup) {
		leaveContext();
	}

	if ((parent.tagName !== 'g' && parent.tagName !== 'a') ||
		parent === getCurrentDrawing().getCurrentLayer() ||
		mouseTarget === selectorManager.selectorParentGroup
	) {
		// Escape from in-group edit
		return;
	}
	setContext(mouseTarget);
};

// prevent links from being followed in the canvas
var handleLinkInCanvas = function (e) {
	e.preventDefault();
	return false;
};

// Added mouseup to the container here.
// TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.
$(container).mousedown(mouseDown).mousemove(mouseMove).click(handleLinkInCanvas).dblclick(dblClick).mouseup(mouseUp);
// $(window).mouseup(mouseUp);

// TODO(rafaelcastrocouto): User preference for shift key and zoom factor
$(container).bind('mousewheel DOMMouseScroll', function (e) {
	// if (!e.shiftKey) { return; }
	e.preventDefault();
	var evt = e.originalEvent;

	rootSctm = $('#svgcontent g')[0].getScreenCTM().inverse();
	var pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm);

	var bbox = {
		'x': pt.x,
		'y': pt.y,
		'width': 0,
		'height': 0
	};

	var delta = (evt.wheelDelta) ? evt.wheelDelta : (evt.detail) ? -evt.detail : 0;
	if (!delta) { return; }

	bbox.factor = Math.max(3 / 4, Math.min(4 / 3, (delta)));

	call('zoomed', bbox);
});
}());

// Group: Text edit functions
// Functions relating to editing text elements
textActions = canvas.textActions = (function () {
var curtext;
var textinput;
var cursor;
var selblock;
var blinker;
var chardata = [];
var textbb; // , transbb;
var matrix;
var lastX, lastY;
var allowDbl;

function setCursor (index) {
	var empty = (textinput.value === '');
	$(textinput).focus();

	if (!arguments.length) {
		if (empty) {
			index = 0;
		} else {
			if (textinput.selectionEnd !== textinput.selectionStart) { return; }
			index = textinput.selectionEnd;
		}
	}

	var charbb;
	charbb = chardata[index];
	if (!empty) {
		textinput.setSelectionRange(index, index);
	}
	cursor = svgedit.utilities.getElem('text_cursor');
	if (!cursor) {
		cursor = document.createElementNS(NS.SVG, 'line');
		svgedit.utilities.assignAttributes(cursor, {
			id: 'text_cursor',
			stroke: '#333',
			'stroke-width': 1
		});
		cursor = svgedit.utilities.getElem('selectorParentGroup').appendChild(cursor);
	}

	if (!blinker) {
		blinker = setInterval(function () {
			var show = (cursor.getAttribute('display') === 'none');
			cursor.setAttribute('display', show ? 'inline' : 'none');
		}, 600);
	}

	var startPt = ptToScreen(charbb.x, textbb.y);
	var endPt = ptToScreen(charbb.x, (textbb.y + textbb.height));

	svgedit.utilities.assignAttributes(cursor, {
		x1: startPt.x,
		y1: startPt.y,
		x2: endPt.x,
		y2: endPt.y,
		visibility: 'visible',
		display: 'inline'
	});

	if (selblock) { selblock.setAttribute('d', ''); }
}

function setSelection (start, end, skipInput) {
	if (start === end) {
		setCursor(end);
		return;
	}

	if (!skipInput) {
		textinput.setSelectionRange(start, end);
	}

	selblock = svgedit.utilities.getElem('text_selectblock');
	if (!selblock) {
		selblock = document.createElementNS(NS.SVG, 'path');
		svgedit.utilities.assignAttributes(selblock, {
			id: 'text_selectblock',
			fill: 'green',
			opacity: 0.5,
			style: 'pointer-events:none'
		});
		svgedit.utilities.getElem('selectorParentGroup').appendChild(selblock);
	}

	var startbb = chardata[start];
	var endbb = chardata[end];

	cursor.setAttribute('visibility', 'hidden');

	var tl = ptToScreen(startbb.x, textbb.y),
		tr = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y),
		bl = ptToScreen(startbb.x, textbb.y + textbb.height),
		br = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y + textbb.height);

	var dstr = 'M' + tl.x + ',' + tl.y +
		' L' + tr.x + ',' + tr.y +
		' ' + br.x + ',' + br.y +
		' ' + bl.x + ',' + bl.y + 'z';

	svgedit.utilities.assignAttributes(selblock, {
		d: dstr,
		'display': 'inline'
	});
}

function getIndexFromPoint (mouseX, mouseY) {
	// Position cursor here
	var pt = svgroot.createSVGPoint();
	pt.x = mouseX;
	pt.y = mouseY;

	// No content, so return 0
	if (chardata.length === 1) { return 0; }
	// Determine if cursor should be on left or right of character
	var charpos = curtext.getCharNumAtPosition(pt);
	if (charpos < 0) {
		// Out of text range, look at mouse coords
		charpos = chardata.length - 2;
		if (mouseX <= chardata[0].x) {
			charpos = 0;
		}
	} else if (charpos >= chardata.length - 2) {
		charpos = chardata.length - 2;
	}
	var charbb = chardata[charpos];
	var mid = charbb.x + (charbb.width / 2);
	if (mouseX > mid) {
		charpos++;
	}
	return charpos;
}

function setCursorFromPoint (mouseX, mouseY) {
	setCursor(getIndexFromPoint(mouseX, mouseY));
}

function setEndSelectionFromPoint (x, y, apply) {
	var i1 = textinput.selectionStart;
	var i2 = getIndexFromPoint(x, y);

	var start = Math.min(i1, i2);
	var end = Math.max(i1, i2);
	setSelection(start, end, !apply);
}

function screenToPt (xIn, yIn) {
	var out = {
		x: xIn,
		y: yIn
	};

	out.x /= currentZoom;
	out.y /= currentZoom;

	if (matrix) {
		var pt = svgedit.math.transformPoint(out.x, out.y, matrix.inverse());
		out.x = pt.x;
		out.y = pt.y;
	}

	return out;
}

function ptToScreen (xIn, yIn) {
	var out = {
		x: xIn,
		y: yIn
	};

	if (matrix) {
		var pt = svgedit.math.transformPoint(out.x, out.y, matrix);
		out.x = pt.x;
		out.y = pt.y;
	}

	out.x *= currentZoom;
	out.y *= currentZoom;

	return out;
}

/*
// Not currently in use
function hideCursor () {
	if (cursor) {
		cursor.setAttribute('visibility', 'hidden');
	}
}
*/

function selectAll (evt) {
	setSelection(0, curtext.textContent.length);
	$(this).unbind(evt);
}

function selectWord (evt) {
	if (!allowDbl || !curtext) { return; }

	var ept = svgedit.math.transformPoint(evt.pageX, evt.pageY, rootSctm),
		mouseX = ept.x * currentZoom,
		mouseY = ept.y * currentZoom;
	var pt = screenToPt(mouseX, mouseY);

	var index = getIndexFromPoint(pt.x, pt.y);
	var str = curtext.textContent;
	var first = str.substr(0, index).replace(/[a-z0-9]+$/i, '').length;
	var m = str.substr(index).match(/^[a-z0-9]+/i);
	var last = (m ? m[0].length : 0) + index;
	setSelection(first, last);

	// Set tripleclick
	$(evt.target).click(selectAll);
	setTimeout(function () {
		$(evt.target).unbind('click', selectAll);
	}, 300);
}

return {
	select: function (target, x, y) {
		curtext = target;
		textActions.toEditMode(x, y);
	},
	start: function (elem) {
		curtext = elem;
		textActions.toEditMode();
	},
	mouseDown: function (evt, mouseTarget, startX, startY) {
		var pt = screenToPt(startX, startY);

		textinput.focus();
		setCursorFromPoint(pt.x, pt.y);
		lastX = startX;
		lastY = startY;

		// TODO: Find way to block native selection
	},
	mouseMove: function (mouseX, mouseY) {
		var pt = screenToPt(mouseX, mouseY);
		setEndSelectionFromPoint(pt.x, pt.y);
	},
	mouseUp: function (evt, mouseX, mouseY) {
		var pt = screenToPt(mouseX, mouseY);

		setEndSelectionFromPoint(pt.x, pt.y, true);

		// TODO: Find a way to make this work: Use transformed BBox instead of evt.target
		// if (lastX === mouseX && lastY === mouseY
		// 	&& !svgedit.math.rectsIntersect(transbb, {x: pt.x, y: pt.y, width: 0, height: 0})) {
		// 	textActions.toSelectMode(true);
		// }

		if (
			evt.target !== curtext &&
			mouseX < lastX + 2 &&
			mouseX > lastX - 2 &&
			mouseY < lastY + 2 &&
			mouseY > lastY - 2
		) {
			textActions.toSelectMode(true);
		}
	},
	setCursor: setCursor,
	toEditMode: function (x, y) {
		allowDbl = false;
		currentMode = 'textedit';
		selectorManager.requestSelector(curtext).showGrips(false);
		// Make selector group accept clicks
		/* var selector = */ selectorManager.requestSelector(curtext); // Do we need this? Has side effect of setting lock, so keeping for now, but next line wasn't being used
		// var sel = selector.selectorRect;

		textActions.init();

		$(curtext).css('cursor', 'text');

		// if (svgedit.browser.supportsEditableText()) {
		// 	curtext.setAttribute('editable', 'simple');
		// 	return;
		// }

		if (!arguments.length) {
			setCursor();
		} else {
			var pt = screenToPt(x, y);
			setCursorFromPoint(pt.x, pt.y);
		}

		setTimeout(function () {
			allowDbl = true;
		}, 300);
	},
	toSelectMode: function (selectElem) {
		currentMode = 'select';
		clearInterval(blinker);
		blinker = null;
		if (selblock) { $(selblock).attr('display', 'none'); }
		if (cursor) { $(cursor).attr('visibility', 'hidden'); }
		$(curtext).css('cursor', 'move');

		if (selectElem) {
			clearSelection();
			$(curtext).css('cursor', 'move');

			call('selected', [curtext]);
			addToSelection([curtext], true);
		}
		if (curtext && !curtext.textContent.length) {
			// No content, so delete
			canvas.deleteSelectedElements();
		}

		$(textinput).blur();

		curtext = false;

		// if (svgedit.browser.supportsEditableText()) {
		// 	curtext.removeAttribute('editable');
		// }
	},
	setInputElem: function (elem) {
		textinput = elem;
		// $(textinput).blur(hideCursor);
	},
	clear: function () {
		if (currentMode === 'textedit') {
			textActions.toSelectMode();
		}
	},
	init: function (inputElem) {
		if (!curtext) { return; }
		var i, end;
		// if (svgedit.browser.supportsEditableText()) {
		// 	curtext.select();
		// 	return;
		// }

		if (!curtext.parentNode) {
			// Result of the ffClone, need to get correct element
			curtext = selectedElements[0];
			selectorManager.requestSelector(curtext).showGrips(false);
		}

		var str = curtext.textContent;
		var len = str.length;

		var xform = curtext.getAttribute('transform');

		textbb = svgedit.utilities.getBBox(curtext);

		matrix = xform ? svgedit.math.getMatrix(curtext) : null;

		chardata = [];
		chardata.length = len;
		textinput.focus();

		$(curtext).unbind('dblclick', selectWord).dblclick(selectWord);

		if (!len) {
			end = {x: textbb.x + (textbb.width / 2), width: 0};
		}

		for (i = 0; i < len; i++) {
			var start = curtext.getStartPositionOfChar(i);
			end = curtext.getEndPositionOfChar(i);

			if (!svgedit.browser.supportsGoodTextCharPos()) {
				var offset = canvas.contentW * currentZoom;
				start.x -= offset;
				end.x -= offset;

				start.x /= currentZoom;
				end.x /= currentZoom;
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
};
}());

// TODO: Migrate all of this code into path.js
// Group: Path edit functions
// Functions relating to editing path elements
pathActions = canvas.pathActions = (function () {
var subpath = false;
var currentPath;
var newPoint, firstCtrl;

function resetD (p) {
	p.setAttribute('d', pathActions.convertPath(p));
}

// TODO: Move into path.js
svgedit.path.Path.prototype.endChanges = function (text) {
	if (svgedit.browser.isWebkit()) { resetD(this.elem); }
	var cmd = new svgedit.history.ChangeElementCommand(this.elem, {d: this.last_d}, text);
	addCommandToHistory(cmd);
	call('changed', [this.elem]);
};

svgedit.path.Path.prototype.addPtsToSelection = function (indexes) {
	var i, seg;
	if (!$.isArray(indexes)) { indexes = [indexes]; }
	for (i = 0; i < indexes.length; i++) {
		var index = indexes[i];
		seg = this.segs[index];
		if (seg.ptgrip) {
			if (this.selected_pts.indexOf(index) === -1 && index >= 0) {
				this.selected_pts.push(index);
			}
		}
	}
	this.selected_pts.sort();
	i = this.selected_pts.length;
	var grips = [];
	grips.length = i;
	// Loop through points to be selected and highlight each
	while (i--) {
		var pt = this.selected_pts[i];
		seg = this.segs[pt];
		seg.select(true);
		grips[i] = seg.ptgrip;
	}
	// TODO: Correct this:
	pathActions.canDeleteNodes = true;

	pathActions.closed_subpath = this.subpathIsClosed(this.selected_pts[0]);

	call('selected', grips);
};

currentPath = null;
drawnPath = null;
var hasMoved = false;

// This function converts a polyline (created by the fh_path tool) into
// a path element and coverts every three line segments into a single bezier
// curve in an attempt to smooth out the free-hand
var smoothPolylineIntoPath = function (element) {
	var i, points = element.points;
	var N = points.numberOfItems;
	if (N >= 4) {
		// loop through every 3 points and convert to a cubic bezier curve segment
		//
		// NOTE: this is cheating, it means that every 3 points has the potential to
		// be a corner instead of treating each point in an equal manner. In general,
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
		d.push(['M', curpos.x, ',', curpos.y, ' C'].join(''));
		for (i = 1; i <= (N - 4); i += 3) {
			var ct1 = points.getItem(i);
			var ct2 = points.getItem(i + 1);
			var end = points.getItem(i + 2);

			// if the previous segment had a control point, we want to smooth out
			// the control points on both sides
			if (prevCtlPt) {
				var newpts = svgedit.path.smoothControlPoints(prevCtlPt, ct1, curpos);
				if (newpts && newpts.length === 2) {
					var prevArr = d[d.length - 1].split(',');
					prevArr[2] = newpts[0].x;
					prevArr[3] = newpts[0].y;
					d[d.length - 1] = prevArr.join(',');
					ct1 = newpts[1];
				}
			}

			d.push([ct1.x, ct1.y, ct2.x, ct2.y, end.x, end.y].join(','));

			curpos = end;
			prevCtlPt = ct2;
		}
		// handle remaining line segments
		d.push('L');
		while (i < N) {
			var pt = points.getItem(i);
			d.push([pt.x, pt.y].join(','));
			i++;
		}
		d = d.join(' ');

		// create new path element
		element = addSvgElementFromJson({
			element: 'path',
			curStyles: true,
			attr: {
				id: getId(),
				d: d,
				fill: 'none'
			}
		});
		// No need to call "changed", as this is already done under mouseUp
	}
	return element;
};

return {
	mouseDown: function (evt, mouseTarget, startX, startY) {
		var id;
		if (currentMode === 'path') {
			var mouseX = startX; // Was this meant to work with the other `mouseX`? (was defined globally so adding `var` to at least avoid a global)
			var mouseY = startY; // Was this meant to work with the other `mouseY`? (was defined globally so adding `var` to at least avoid a global)

			var x = mouseX / currentZoom,
				y = mouseY / currentZoom,
				stretchy = svgedit.utilities.getElem('path_stretch_line');
			newPoint = [x, y];

			if (curConfig.gridSnapping) {
				x = svgedit.utilities.snapToGrid(x);
				y = svgedit.utilities.snapToGrid(y);
				mouseX = svgedit.utilities.snapToGrid(mouseX);
				mouseY = svgedit.utilities.snapToGrid(mouseY);
			}

			if (!stretchy) {
				stretchy = document.createElementNS(NS.SVG, 'path');
				svgedit.utilities.assignAttributes(stretchy, {
					id: 'path_stretch_line',
					stroke: '#22C',
					'stroke-width': '0.5',
					fill: 'none'
				});
				stretchy = svgedit.utilities.getElem('selectorParentGroup').appendChild(stretchy);
			}
			stretchy.setAttribute('display', 'inline');

			var keep = null;
			var index;
			// if pts array is empty, create path element with M at current point
			if (!drawnPath) {
				var dAttr = 'M' + x + ',' + y + ' '; // Was this meant to work with the other `dAttr`? (was defined globally so adding `var` to at least avoid a global)
				drawnPath = addSvgElementFromJson({
					element: 'path',
					curStyles: true,
					attr: {
						d: dAttr,
						id: getNextId(),
						opacity: curShape.opacity / 2
					}
				});
				// set stretchy line to first point
				stretchy.setAttribute('d', ['M', mouseX, mouseY, mouseX, mouseY].join(' '));
				index = subpath ? svgedit.path.path.segs.length : 0;
				svgedit.path.addPointGrip(index, mouseX, mouseY);
			} else {
				// determine if we clicked on an existing point
				var seglist = drawnPath.pathSegList;
				var i = seglist.numberOfItems;
				var FUZZ = 6 / currentZoom;
				var clickOnPoint = false;
				while (i) {
					i--;
					var item = seglist.getItem(i);
					var px = item.x, py = item.y;
					// found a matching point
					if (x >= (px - FUZZ) && x <= (px + FUZZ) &&
						y >= (py - FUZZ) && y <= (py + FUZZ)
					) {
						clickOnPoint = true;
						break;
					}
				}

				// get path element that we are in the process of creating
				id = getId();

				// Remove previous path object if previously created
				svgedit.path.removePath_(id);

				var newpath = svgedit.utilities.getElem(id);
				var newseg;
				var sSeg;
				var len = seglist.numberOfItems;
				// if we clicked on an existing point, then we are done this path, commit it
				// (i, i+1) are the x,y that were clicked on
				if (clickOnPoint) {
					// if clicked on any other point but the first OR
					// the first point was clicked on and there are less than 3 points
					// then leave the path open
					// otherwise, close the path
					if (i <= 1 && len >= 2) {
						// Create end segment
						var absX = seglist.getItem(0).x;
						var absY = seglist.getItem(0).y;

						sSeg = stretchy.pathSegList.getItem(1);
						if (sSeg.pathSegType === 4) {
							newseg = drawnPath.createSVGPathSegLinetoAbs(absX, absY);
						} else {
							newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(
								absX,
								absY,
								sSeg.x1 / currentZoom,
								sSeg.y1 / currentZoom,
								absX,
								absY
							);
						}

						var endseg = drawnPath.createSVGPathSegClosePath();
						seglist.appendItem(newseg);
						seglist.appendItem(endseg);
					} else if (len < 3) {
						keep = false;
						return keep;
					}
					$(stretchy).remove();

					// This will signal to commit the path
					// var element = newpath; // Other event handlers define own `element`, so this was probably not meant to interact with them or one which shares state (as there were none); I therefore adding a missing `var` to avoid a global
					drawnPath = null;
					started = false;

					if (subpath) {
						if (svgedit.path.path.matrix) {
							svgedit.coords.remapElement(newpath, {}, svgedit.path.path.matrix.inverse());
						}

						var newD = newpath.getAttribute('d');
						var origD = $(svgedit.path.path.elem).attr('d');
						$(svgedit.path.path.elem).attr('d', origD + newD);
						$(newpath).remove();
						if (svgedit.path.path.matrix) {
							svgedit.path.recalcRotatedPath();
						}
						svgedit.path.path.init();
						pathActions.toEditMode(svgedit.path.path.elem);
						svgedit.path.path.selectPt();
						return false;
					}
				// else, create a new point, update path element
				} else {
					// Checks if current target or parents are #svgcontent
					if (!$.contains(container, getMouseTarget(evt))) {
						// Clicked outside canvas, so don't make point
						console.log('Clicked outside canvas');
						return false;
					}

					var num = drawnPath.pathSegList.numberOfItems;
					var last = drawnPath.pathSegList.getItem(num - 1);
					var lastx = last.x, lasty = last.y;

					if (evt.shiftKey) {
						var xya = svgedit.math.snapToAngle(lastx, lasty, x, y);
						x = xya.x;
						y = xya.y;
					}

					// Use the segment defined by stretchy
					sSeg = stretchy.pathSegList.getItem(1);
					if (sSeg.pathSegType === 4) {
						newseg = drawnPath.createSVGPathSegLinetoAbs(round(x), round(y));
					} else {
						newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(
							round(x),
							round(y),
							sSeg.x1 / currentZoom,
							sSeg.y1 / currentZoom,
							sSeg.x2 / currentZoom,
							sSeg.y2 / currentZoom
						);
					}

					drawnPath.pathSegList.appendItem(newseg);

					x *= currentZoom;
					y *= currentZoom;

					// set stretchy line to latest point
					stretchy.setAttribute('d', ['M', x, y, x, y].join(' '));
					index = num;
					if (subpath) { index += svgedit.path.path.segs.length; }
					svgedit.path.addPointGrip(index, x, y);
				}
				// keep = true;
			}

			return;
		}

		// TODO: Make sure currentPath isn't null at this point
		if (!svgedit.path.path) { return; }

		svgedit.path.path.storeD();

		id = evt.target.id;
		var curPt;
		if (id.substr(0, 14) === 'pathpointgrip_') {
			// Select this point
			curPt = svgedit.path.path.cur_pt = parseInt(id.substr(14));
			svgedit.path.path.dragging = [startX, startY];
			var seg = svgedit.path.path.segs[curPt];

			// only clear selection if shift is not pressed (otherwise, add
			// node to selection)
			if (!evt.shiftKey) {
				if (svgedit.path.path.selected_pts.length <= 1 || !seg.selected) {
					svgedit.path.path.clearSelection();
				}
				svgedit.path.path.addPtsToSelection(curPt);
			} else if (seg.selected) {
				svgedit.path.path.removePtFromSelection(curPt);
			} else {
				svgedit.path.path.addPtsToSelection(curPt);
			}
		} else if (id.indexOf('ctrlpointgrip_') === 0) {
			svgedit.path.path.dragging = [startX, startY];

			var parts = id.split('_')[1].split('c');
			curPt = Number(parts[0]);
			var ctrlNum = Number(parts[1]);
			svgedit.path.path.selectPt(curPt, ctrlNum);
		}

		// Start selection box
		if (!svgedit.path.path.dragging) {
			if (rubberBox == null) {
				rubberBox = selectorManager.getRubberBandBox();
			}
			svgedit.utilities.assignAttributes(rubberBox, {
				'x': startX * currentZoom,
				'y': startY * currentZoom,
				'width': 0,
				'height': 0,
				'display': 'inline'
			}, 100);
		}
	},
	mouseMove: function (mouseX, mouseY) {
		hasMoved = true;
		if (currentMode === 'path') {
			if (!drawnPath) { return; }
			var seglist = drawnPath.pathSegList;
			var index = seglist.numberOfItems - 1;

			if (newPoint) {
				// First point
				// if (!index) { return; }

				// Set control points
				var pointGrip1 = svgedit.path.addCtrlGrip('1c1');
				var pointGrip2 = svgedit.path.addCtrlGrip('0c2');

				// dragging pointGrip1
				pointGrip1.setAttribute('cx', mouseX);
				pointGrip1.setAttribute('cy', mouseY);
				pointGrip1.setAttribute('display', 'inline');

				var ptX = newPoint[0];
				var ptY = newPoint[1];

				// set curve
				// var seg = seglist.getItem(index);
				var curX = mouseX / currentZoom;
				var curY = mouseY / currentZoom;
				var altX = (ptX + (ptX - curX));
				var altY = (ptY + (ptY - curY));

				pointGrip2.setAttribute('cx', altX * currentZoom);
				pointGrip2.setAttribute('cy', altY * currentZoom);
				pointGrip2.setAttribute('display', 'inline');

				var ctrlLine = svgedit.path.getCtrlLine(1);
				svgedit.utilities.assignAttributes(ctrlLine, {
					x1: mouseX,
					y1: mouseY,
					x2: altX * currentZoom,
					y2: altY * currentZoom,
					display: 'inline'
				});

				if (index === 0) {
					firstCtrl = [mouseX, mouseY];
				} else {
					var last = seglist.getItem(index - 1);
					var lastX = last.x;
					var lastY = last.y;

					if (last.pathSegType === 6) {
						lastX += (lastX - last.x2);
						lastY += (lastY - last.y2);
					} else if (firstCtrl) {
						lastX = firstCtrl[0] / currentZoom;
						lastY = firstCtrl[1] / currentZoom;
					}
					svgedit.path.replacePathSeg(6, index, [ptX, ptY, lastX, lastY, altX, altY], drawnPath);
				}
			} else {
				var stretchy = svgedit.utilities.getElem('path_stretch_line');
				if (stretchy) {
					var prev = seglist.getItem(index);
					if (prev.pathSegType === 6) {
						var prevX = prev.x + (prev.x - prev.x2);
						var prevY = prev.y + (prev.y - prev.y2);
						svgedit.path.replacePathSeg(6, 1, [mouseX, mouseY, prevX * currentZoom, prevY * currentZoom, mouseX, mouseY], stretchy);
					} else if (firstCtrl) {
						svgedit.path.replacePathSeg(6, 1, [mouseX, mouseY, firstCtrl[0], firstCtrl[1], mouseX, mouseY], stretchy);
					} else {
						svgedit.path.replacePathSeg(4, 1, [mouseX, mouseY], stretchy);
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
				x: mouseX,
				y: mouseY
			}, svgedit.path.path);
			var diffX = mpt.x - pt.x;
			var diffY = mpt.y - pt.y;
			svgedit.path.path.dragging = [mouseX, mouseY];

			if (svgedit.path.path.dragctrl) {
				svgedit.path.path.moveCtrl(diffX, diffY);
			} else {
				svgedit.path.path.movePts(diffX, diffY);
			}
		} else {
			svgedit.path.path.selected_pts = [];
			svgedit.path.path.eachSeg(function (i) {
				var seg = this;
				if (!seg.next && !seg.prev) { return; }

				// var item = seg.item;
				var rbb = rubberBox.getBBox();

				var pt = svgedit.path.getGripPt(seg);
				var ptBb = {
					x: pt.x,
					y: pt.y,
					width: 0,
					height: 0
				};

				var sel = svgedit.math.rectsIntersect(rbb, ptBb);

				this.select(sel);
				// Note that addPtsToSelection is not being run
				if (sel) { svgedit.path.path.selected_pts.push(seg.index); }
			});
		}
	},
	mouseUp: function (evt, element, mouseX, mouseY) {
		// Create mode
		if (currentMode === 'path') {
			newPoint = null;
			if (!drawnPath) {
				element = svgedit.utilities.getElem(getId());
				started = false;
				firstCtrl = null;
			}

			return {
				keep: true,
				element: element
			};
		}

		// Edit mode

		if (svgedit.path.path.dragging) {
			var lastPt = svgedit.path.path.cur_pt;

			svgedit.path.path.dragging = false;
			svgedit.path.path.dragctrl = false;
			svgedit.path.path.update();

			if (hasMoved) {
				svgedit.path.path.endChanges('Move path point(s)');
			}

			if (!evt.shiftKey && !hasMoved) {
				svgedit.path.path.selectPt(lastPt);
			}
		} else if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
			// Done with multi-node-select
			rubberBox.setAttribute('display', 'none');

			if (rubberBox.getAttribute('width') <= 2 && rubberBox.getAttribute('height') <= 2) {
				pathActions.toSelectMode(evt.target);
			}

		// else, move back to select mode
		} else {
			pathActions.toSelectMode(evt.target);
		}
		hasMoved = false;
	},
	toEditMode: function (element) {
		svgedit.path.path = svgedit.path.getPath_(element);
		currentMode = 'pathedit';
		clearSelection();
		svgedit.path.path.show(true).update();
		svgedit.path.path.oldbbox = svgedit.utilities.getBBox(svgedit.path.path.elem);
		subpath = false;
	},
	toSelectMode: function (elem) {
		var selPath = (elem === svgedit.path.path.elem);
		currentMode = 'select';
		svgedit.path.path.show(false);
		currentPath = false;
		clearSelection();

		if (svgedit.path.path.matrix) {
			// Rotated, so may need to re-calculate the center
			svgedit.path.recalcRotatedPath();
		}

		if (selPath) {
			call('selected', [elem]);
			addToSelection([elem], true);
		}
	},
	addSubPath: function (on) {
		if (on) {
			// Internally we go into "path" mode, but in the UI it will
			// still appear as if in "pathedit" mode.
			currentMode = 'path';
			subpath = true;
		} else {
			pathActions.clear(true);
			pathActions.toEditMode(svgedit.path.path.elem);
		}
	},
	select: function (target) {
		if (currentPath === target) {
			pathActions.toEditMode(target);
			currentMode = 'pathedit';
		// going into pathedit mode
		} else {
			currentPath = target;
		}
	},
	reorient: function () {
		var elem = selectedElements[0];
		if (!elem) { return; }
		var angle = svgedit.utilities.getRotationAngle(elem);
		if (angle === 0) { return; }

		var batchCmd = new svgedit.history.BatchCommand('Reorient path');
		var changes = {
			d: elem.getAttribute('d'),
			transform: elem.getAttribute('transform')
		};
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, changes));
		clearSelection();
		this.resetOrientation(elem);

		addCommandToHistory(batchCmd);

		// Set matrix to null
		svgedit.path.getPath_(elem).show(false).matrix = null;

		this.clear();

		addToSelection([elem], true);
		call('changed', selectedElements);
	},

	clear: function (remove) {
		currentPath = null;
		if (drawnPath) {
			var elem = svgedit.utilities.getElem(getId());
			$(svgedit.utilities.getElem('path_stretch_line')).remove();
			$(elem).remove();
			$(svgedit.utilities.getElem('pathpointgrip_container')).find('*').attr('display', 'none');
			drawnPath = firstCtrl = null;
			started = false;
		} else if (currentMode === 'pathedit') {
			this.toSelectMode();
		}
		if (svgedit.path.path) { svgedit.path.path.init().show(false); }
	},
	resetOrientation: function (path) {
		if (path == null || path.nodeName !== 'path') { return false; }
		var tlist = svgedit.transformlist.getTransformList(path);
		var m = svgedit.math.transformListToTransform(tlist).matrix;
		tlist.clear();
		path.removeAttribute('transform');
		var segList = path.pathSegList;

		// Opera/win/non-EN throws an error here.
		// TODO: Find out why!
		// Presumed fixed in Opera 10.5, so commented out for now

		// try {
		var len = segList.numberOfItems;
		// } catch(err) {
		// 	var fixed_d = pathActions.convertPath(path);
		// 	path.setAttribute('d', fixed_d);
		// 	segList = path.pathSegList;
		// 	var len = segList.numberOfItems;
		// }
		var i; // , lastX, lastY;
		for (i = 0; i < len; ++i) {
			var seg = segList.getItem(i);
			var type = seg.pathSegType;
			if (type === 1) { continue; }
			var pts = [];
			$.each(['', 1, 2], function (j, n) {
				var x = seg['x' + n], y = seg['y' + n];
				if (x !== undefined && y !== undefined) {
					var pt = svgedit.math.transformPoint(x, y, m);
					pts.splice(pts.length, 0, pt.x, pt.y);
				}
			});
			svgedit.path.replacePathSeg(type, i, pts, path);
		}

		reorientGrads(path, m);
	},
	zoomChange: function () {
		if (currentMode === 'pathedit') {
			svgedit.path.path.update();
		}
	},
	getNodePoint: function () {
		var selPt = svgedit.path.path.selected_pts.length ? svgedit.path.path.selected_pts[0] : 1;

		var seg = svgedit.path.path.segs[selPt];
		return {
			x: seg.item.x,
			y: seg.item.y,
			type: seg.type
		};
	},
	linkControlPoints: function (linkPoints) {
		svgedit.path.setLinkControlPoints(linkPoints);
	},
	clonePathNode: function () {
		svgedit.path.path.storeD();

		var selPts = svgedit.path.path.selected_pts;
		// var segs = svgedit.path.path.segs;

		var i = selPts.length;
		var nums = [];

		while (i--) {
			var pt = selPts[i];
			svgedit.path.path.addSeg(pt);

			nums.push(pt + i);
			nums.push(pt + i + 1);
		}
		svgedit.path.path.init().addPtsToSelection(nums);

		svgedit.path.path.endChanges('Clone path node(s)');
	},
	opencloseSubPath: function () {
		var selPts = svgedit.path.path.selected_pts;
		// Only allow one selected node for now
		if (selPts.length !== 1) { return; }

		var elem = svgedit.path.path.elem;
		var list = elem.pathSegList;

		// var len = list.numberOfItems;

		var index = selPts[0];

		var openPt = null;
		var startItem = null;

		// Check if subpath is already open
		svgedit.path.path.eachSeg(function (i) {
			if (this.type === 2 && i <= index) {
				startItem = this.item;
			}
			if (i <= index) { return true; }
			if (this.type === 2) {
				// Found M first, so open
				openPt = i;
				return false;
			}
			if (this.type === 1) {
				// Found Z first, so closed
				openPt = false;
				return false;
			}
		});

		if (openPt == null) {
			// Single path, so close last seg
			openPt = svgedit.path.path.segs.length - 1;
		}

		if (openPt !== false) {
			// Close this path

			// Create a line going to the previous "M"
			var newseg = elem.createSVGPathSegLinetoAbs(startItem.x, startItem.y);

			var closer = elem.createSVGPathSegClosePath();
			if (openPt === svgedit.path.path.segs.length - 1) {
				list.appendItem(newseg);
				list.appendItem(closer);
			} else {
				svgedit.path.insertItemBefore(elem, closer, openPt);
				svgedit.path.insertItemBefore(elem, newseg, openPt);
			}

			svgedit.path.path.init().selectPt(openPt + 1);
			return;
		}

		// M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
		// M 2,2 L 3,3 L 1,1

		// M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z
		// M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z

		var seg = svgedit.path.path.segs[index];

		if (seg.mate) {
			list.removeItem(index); // Removes last "L"
			list.removeItem(index); // Removes the "Z"
			svgedit.path.path.init().selectPt(index - 1);
			return;
		}

		var i, lastM, zSeg;

		// Find this sub-path's closing point and remove
		for (i = 0; i < list.numberOfItems; i++) {
			var item = list.getItem(i);

			if (item.pathSegType === 2) {
				// Find the preceding M
				lastM = i;
			} else if (i === index) {
				// Remove it
				list.removeItem(lastM);
				// index--;
			} else if (item.pathSegType === 1 && index < i) {
				// Remove the closing seg of this subpath
				zSeg = i - 1;
				list.removeItem(i);
				break;
			}
		}

		var num = (index - lastM) - 1;

		while (num--) {
			svgedit.path.insertItemBefore(elem, list.getItem(lastM), zSeg);
		}

		var pt = list.getItem(lastM);

		// Make this point the new "M"
		svgedit.path.replacePathSeg(2, lastM, [pt.x, pt.y]);

		i = index; // i is local here, so has no effect; what is the reason for this?

		svgedit.path.path.init().selectPt(0);
	},
	deletePathNode: function () {
		if (!pathActions.canDeleteNodes) { return; }
		svgedit.path.path.storeD();

		var selPts = svgedit.path.path.selected_pts;
		var i = selPts.length;

		while (i--) {
			var pt = selPts[i];
			svgedit.path.path.deleteSeg(pt);
		}

		// Cleanup
		var cleanup = function () {
			var segList = svgedit.path.path.elem.pathSegList;
			var len = segList.numberOfItems;

			var remItems = function (pos, count) {
				while (count--) {
					segList.removeItem(pos);
				}
			};

			if (len <= 1) { return true; }

			while (len--) {
				var item = segList.getItem(len);
				if (item.pathSegType === 1) {
					var prev = segList.getItem(len - 1);
					var nprev = segList.getItem(len - 2);
					if (prev.pathSegType === 2) {
						remItems(len - 1, 2);
						cleanup();
						break;
					} else if (nprev.pathSegType === 2) {
						remItems(len - 2, 3);
						cleanup();
						break;
					}
				} else if (item.pathSegType === 2) {
					if (len > 0) {
						var prevType = segList.getItem(len - 1).pathSegType;
						// Path has M M
						if (prevType === 2) {
							remItems(len - 1, 1);
							cleanup();
							break;
						// Entire path ends with Z M
						} else if (prevType === 1 && segList.numberOfItems - 1 === len) {
							remItems(len, 1);
							cleanup();
							break;
						}
					}
				}
			}
			return false;
		};

		cleanup();

		// Completely delete a path with 1 or 0 segments
		if (svgedit.path.path.elem.pathSegList.numberOfItems <= 1) {
			pathActions.toSelectMode(svgedit.path.path.elem);
			canvas.deleteSelectedElements();
			return;
		}

		svgedit.path.path.init();
		svgedit.path.path.clearSelection();

		// TODO: Find right way to select point now
		// path.selectPt(selPt);
		if (window.opera) { // Opera repaints incorrectly
			var cp = $(svgedit.path.path.elem);
			cp.attr('d', cp.attr('d'));
		}
		svgedit.path.path.endChanges('Delete path node(s)');
	},
	smoothPolylineIntoPath: smoothPolylineIntoPath,
	setSegType: function (v) {
		svgedit.path.path.setSegType(v);
	},
	moveNode: function (attr, newValue) {
		var selPts = svgedit.path.path.selected_pts;
		if (!selPts.length) { return; }

		svgedit.path.path.storeD();

		// Get first selected point
		var seg = svgedit.path.path.segs[selPts[0]];
		var diff = {x: 0, y: 0};
		diff[attr] = newValue - seg.item[attr];

		seg.move(diff.x, diff.y);
		svgedit.path.path.endChanges('Move path point');
	},
	fixEnd: function (elem) {
		// Adds an extra segment if the last seg before a Z doesn't end
		// at its M point
		// M0,0 L0,100 L100,100 z
		var segList = elem.pathSegList;
		var len = segList.numberOfItems;
		var i, lastM;
		for (i = 0; i < len; ++i) {
			var item = segList.getItem(i);
			if (item.pathSegType === 2) {
				lastM = item;
			}

			if (item.pathSegType === 1) {
				var prev = segList.getItem(i - 1);
				if (prev.x !== lastM.x || prev.y !== lastM.y) {
					// Add an L segment here
					var newseg = elem.createSVGPathSegLinetoAbs(lastM.x, lastM.y);
					svgedit.path.insertItemBefore(elem, newseg, i);
					// Can this be done better?
					pathActions.fixEnd(elem);
					break;
				}
			}
		}
		if (svgedit.browser.isWebkit()) { resetD(elem); }
	},
	// Convert a path to one with only absolute or relative values
	convertPath: svgedit.utilities.convertPath
};
})();
// end pathActions

// Group: Serialization

// Function: removeUnusedDefElems
// Looks at DOM elements inside the <defs> to see if they are referred to,
// removes them from the DOM if they are not.
//
// Returns:
// The amount of elements that were removed
var removeUnusedDefElems = this.removeUnusedDefElems = function () {
	var defs = svgcontent.getElementsByTagNameNS(NS.SVG, 'defs');
	if (!defs || !defs.length) { return 0; }

	// if (!defs.firstChild) { return; }

	var defelemUses = [],
		numRemoved = 0;
	var attrs = ['fill', 'stroke', 'filter', 'marker-start', 'marker-mid', 'marker-end'];
	var alen = attrs.length;

	var allEls = svgcontent.getElementsByTagNameNS(NS.SVG, '*');
	var allLen = allEls.length;

	var i, j;
	for (i = 0; i < allLen; i++) {
		var el = allEls[i];
		for (j = 0; j < alen; j++) {
			var ref = svgedit.utilities.getUrlFromAttr(el.getAttribute(attrs[j]));
			if (ref) {
				defelemUses.push(ref.substr(1));
			}
		}

		// gradients can refer to other gradients
		var href = getHref(el);
		if (href && href.indexOf('#') === 0) {
			defelemUses.push(href.substr(1));
		}
	}

	var defelems = $(defs).find('linearGradient, radialGradient, filter, marker, svg, symbol');
	i = defelems.length;
	while (i--) {
		var defelem = defelems[i];
		var id = defelem.id;
		if (defelemUses.indexOf(id) < 0) {
			// Not found, so remove (but remember)
			removedElements[id] = defelem;
			defelem.parentNode.removeChild(defelem);
			numRemoved++;
		}
	}

	return numRemoved;
};

// Function: svgCanvasToString
// Main function to set up the SVG content for output
//
// Returns:
// String containing the SVG image for output
this.svgCanvasToString = function () {
	// keep calling it until there are none to remove
	while (removeUnusedDefElems() > 0) {}

	pathActions.clear(true);

	// Keep SVG-Edit comment on top
	$.each(svgcontent.childNodes, function (i, node) {
		if (i && node.nodeType === 8 && node.data.indexOf('Created with') >= 0) {
			svgcontent.insertBefore(node, svgcontent.firstChild);
		}
	});

	// Move out of in-group editing mode
	if (currentGroup) {
		leaveContext();
		selectOnly([currentGroup]);
	}

	var nakedSvgs = [];

	// Unwrap gsvg if it has no special attributes (only id and style)
	$(svgcontent).find('g:data(gsvg)').each(function () {
		var attrs = this.attributes;
		var len = attrs.length;
		var i;
		for (i = 0; i < len; i++) {
			if (attrs[i].nodeName === 'id' || attrs[i].nodeName === 'style') {
				len--;
			}
		}
		// No significant attributes, so ungroup
		if (len <= 0) {
			var svg = this.firstChild;
			nakedSvgs.push(svg);
			$(this).replaceWith(svg);
		}
	});
	var output = this.svgToString(svgcontent, 0);

	// Rewrap gsvg
	if (nakedSvgs.length) {
		$(nakedSvgs).each(function () {
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
this.svgToString = function (elem, indent) {
	var out = [],
		toXml = svgedit.utilities.toXml;
	var unit = curConfig.baseUnit;
	var unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$');

	if (elem) {
		cleanupElement(elem);
		var attrs = elem.attributes,
			attr,
			i,
			childs = elem.childNodes;

		for (i = 0; i < indent; i++) { out.push(' '); }
		out.push('<'); out.push(elem.nodeName);
		if (elem.id === 'svgcontent') {
			// Process root element separately
			var res = getResolution();

			var vb = '';
			// TODO: Allow this by dividing all values by current baseVal
			// Note that this also means we should properly deal with this on import
			// if (curConfig.baseUnit !== 'px') {
			// 	var unit = curConfig.baseUnit;
			// 	var unitM = svgedit.units.getTypeMap()[unit];
			// 	res.w = svgedit.units.shortFloat(res.w / unitM);
			// 	res.h = svgedit.units.shortFloat(res.h / unitM);
			// 	vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';
			// 	res.w += unit;
			// 	res.h += unit;
			// }

			if (unit !== 'px') {
				res.w = svgedit.units.convertUnit(res.w, unit) + unit;
				res.h = svgedit.units.convertUnit(res.h, unit) + unit;
			}

			out.push(' width="' + res.w + '" height="' + res.h + '"' + vb + ' xmlns="' + NS.SVG + '"');

			var nsuris = {};

			// Check elements for namespaces, add if found
			$(elem).find('*').andSelf().each(function () {
				// var el = this;
				// for some elements have no attribute
				var uri = this.namespaceURI;
				if (uri && !nsuris[uri] && nsMap[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
					nsuris[uri] = true;
					out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
				}

				$.each(this.attributes, function (i, attr) {
					var uri = attr.namespaceURI;
					if (uri && !nsuris[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
						nsuris[uri] = true;
						out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
					}
				});
			});

			i = attrs.length;
			var attrNames = ['width', 'height', 'xmlns', 'x', 'y', 'viewBox', 'id', 'overflow'];
			while (i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.value);

				// Namespaces have already been dealt with, so skip
				if (attr.nodeName.indexOf('xmlns:') === 0) { continue; }

				// only serialize attributes we don't use internally
				if (attrVal !== '' && attrNames.indexOf(attr.localName) === -1) {
					if (!attr.namespaceURI || nsMap[attr.namespaceURI]) {
						out.push(' ');
						out.push(attr.nodeName); out.push('="');
						out.push(attrVal); out.push('"');
					}
				}
			}
		} else {
			// Skip empty defs
			if (elem.nodeName === 'defs' && !elem.firstChild) { return; }

			var mozAttrs = ['-moz-math-font-style', '_moz-math-font-style'];
			for (i = attrs.length - 1; i >= 0; i--) {
				attr = attrs.item(i);
				var attrVal = toXml(attr.value);
				// remove bogus attributes added by Gecko
				if (mozAttrs.indexOf(attr.localName) >= 0) { continue; }
				if (attrVal !== '') {
					if (attrVal.indexOf('pointer-events') === 0) { continue; }
					if (attr.localName === 'class' && attrVal.indexOf('se_') === 0) { continue; }
					out.push(' ');
					if (attr.localName === 'd') { attrVal = pathActions.convertPath(elem, true); }
					if (!isNaN(attrVal)) {
						attrVal = svgedit.units.shortFloat(attrVal);
					} else if (unitRe.test(attrVal)) {
						attrVal = svgedit.units.shortFloat(attrVal) + unit;
					}

					// Embed images when saving
					if (saveOptions.apply &&
						elem.nodeName === 'image' &&
						attr.localName === 'href' &&
						saveOptions.images &&
						saveOptions.images === 'embed'
					) {
						var img = encodableImages[attrVal];
						if (img) { attrVal = img; }
					}

					// map various namespaces to our fixed namespace prefixes
					// (the default xmlns attribute itself does not get a prefix)
					if (!attr.namespaceURI || attr.namespaceURI === NS.SVG || nsMap[attr.namespaceURI]) {
						out.push(attr.nodeName); out.push('="');
						out.push(attrVal); out.push('"');
					}
				}
			}
		}

		if (elem.hasChildNodes()) {
			out.push('>');
			indent++;
			var bOneLine = false;

			for (i = 0; i < childs.length; i++) {
				var child = childs.item(i);
				switch (child.nodeType) {
				case 1: // element node
					out.push('\n');
					out.push(this.svgToString(childs.item(i), indent));
					break;
				case 3: // text node
					var str = child.nodeValue.replace(/^\s+|\s+$/g, '');
					if (str !== '') {
						bOneLine = true;
						out.push(String(toXml(str)));
					}
					break;
				case 4: // cdata node
					out.push('\n');
					out.push(new Array(indent + 1).join(' '));
					out.push('<![CDATA[');
					out.push(child.nodeValue);
					out.push(']]>');
					break;
				case 8: // comment
					out.push('\n');
					out.push(new Array(indent + 1).join(' '));
					out.push('<!--');
					out.push(child.data);
					out.push('-->');
					break;
				} // switch on node type
			}
			indent--;
			if (!bOneLine) {
				out.push('\n');
				for (i = 0; i < indent; i++) { out.push(' '); }
			}
			out.push('</'); out.push(elem.nodeName); out.push('>');
		} else {
			out.push('/>');
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
this.embedImage = function (val, callback) {
	// load in the image and once it's loaded, get the dimensions
	$(new Image()).load(function () {
		// create a canvas the same size as the raster image
		var canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		// load the raster image into the canvas
		canvas.getContext('2d').drawImage(this, 0, 0);
		// retrieve the data: URL
		try {
			var urldata = ';svgedit_url=' + encodeURIComponent(val);
			urldata = canvas.toDataURL().replace(';base64', urldata + ';base64');
			encodableImages[val] = urldata;
		} catch (e) {
			encodableImages[val] = false;
		}
		lastGoodImgUrl = val;
		if (callback) { callback(encodableImages[val]); }
	}).attr('src', val);
};

// Function: setGoodImage
// Sets a given URL to be a "last good image" URL
this.setGoodImage = function (val) {
	lastGoodImgUrl = val;
};

this.open = function () {
	// Nothing by default, handled by optional widget/extension
};

// Function: save
// Serializes the current drawing into SVG XML text and returns it to the 'saved' handler.
// This function also includes the XML prolog. Clients of the SvgCanvas bind their save
// function to the 'saved' event.
//
// Returns:
// Nothing
this.save = function (opts) {
	// remove the selected outline before serializing
	clearSelection();
	// Update save options if provided
	if (opts) { $.extend(saveOptions, opts); }
	saveOptions.apply = true;

	// no need for doctype, see http://jwatt.org/svg/authoring/#doctype-declaration
	var str = this.svgCanvasToString();
	call('saved', str);
};

function getIssues () {
	// remove the selected outline before serializing
	clearSelection();

	// Check for known CanVG issues
	var issues = [];

	// Selector and notice
	var issueList = {
		'feGaussianBlur': uiStrings.exportNoBlur,
		'foreignObject': uiStrings.exportNoforeignObject,
		'[stroke-dasharray]': uiStrings.exportNoDashArray
	};
	var content = $(svgcontent);

	// Add font/text check if Canvas Text API is not implemented
	if (!('font' in $('<canvas>')[0].getContext('2d'))) {
		issueList.text = uiStrings.exportNoText;
	}

	$.each(issueList, function (sel, descr) {
		if (content.find(sel).length) {
			issues.push(descr);
		}
	});
	return issues;
}

// Function: rasterExport
// Generates a Data URL based on the current image, then calls "exported"
// with an object including the string, image information, and any issues found
this.rasterExport = function (imgType, quality, exportWindowName) {
	var mimeType = 'image/' + imgType.toLowerCase();
	var issues = getIssues();
	var str = this.svgCanvasToString();

	svgedit.utilities.buildCanvgCallback(function () {
		var type = imgType || 'PNG';
		if (!$('#export_canvas').length) {
			$('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
		}
		var c = $('#export_canvas')[0];
		c.width = svgCanvas.contentW;
		c.height = svgCanvas.contentH;

		canvg(c, str, {renderCallback: function () {
			var dataURLType = (type === 'ICO' ? 'BMP' : type).toLowerCase();
			var datauri = quality ? c.toDataURL('image/' + dataURLType, quality) : c.toDataURL('image/' + dataURLType);
			if (c.toBlob) {
				c.toBlob(function (blob) {
					var bloburl = svgedit.utilities.createObjectURL(blob);
					call('exported', {datauri: datauri, bloburl: bloburl, svg: str, issues: issues, type: imgType, mimeType: mimeType, quality: quality, exportWindowName: exportWindowName});
				}, mimeType, quality);
				return;
			}
			var bloburl = svgedit.utilities.dataURLToObjectURL(datauri);
			call('exported', {datauri: datauri, bloburl: bloburl, svg: str, issues: issues, type: imgType, mimeType: mimeType, quality: quality, exportWindowName: exportWindowName});
		}});
	})();
};

this.exportPDF = function (exportWindowName, outputType) {
	var that = this;
	svgedit.utilities.buildJSPDFCallback(function () {
		var res = getResolution();
		var orientation = res.w > res.h ? 'landscape' : 'portrait';
		var units = 'pt'; // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for export purposes
		var doc = jsPDF({
			orientation: orientation,
			unit: units,
			format: [res.w, res.h]
			// , compressPdf: true
		}); // Todo: Give options to use predefined jsPDF formats like "a4", etc. from pull-down (with option to keep customizable)
		var docTitle = getDocumentTitle();
		doc.setProperties({
			title: docTitle /* ,
			subject: '',
			author: '',
			keywords: '',
			creator: '' */
		});
		var issues = getIssues();
		var str = that.svgCanvasToString();
		doc.addSVG(str, 0, 0);

		// doc.output('save'); // Works to open in a new
		//  window; todo: configure this and other export
		//  options to optionally work in this manner as
		//  opposed to opening a new tab
		var obj = {svg: str, issues: issues, exportWindowName: exportWindowName};
		var method = outputType || 'dataurlstring';
		obj[method] = doc.output(method);
		call('exportedPDF', obj);
	})();
};

// Function: getSvgString
// Returns the current drawing as raw SVG XML text.
//
// Returns:
// The current drawing as raw SVG XML text.
this.getSvgString = function () {
	saveOptions.apply = false;
	return this.svgCanvasToString();
};

// Function: randomizeIds
// This function determines whether to use a nonce in the prefix, when
// generating IDs for future documents in SVG-Edit.
//
// Parameters:
// an optional boolean, which, if true, adds a nonce to the prefix. Thus
// svgCanvas.randomizeIds() <==> svgCanvas.randomizeIds(true)
//
// if you're controlling SVG-Edit externally, and want randomized IDs, call
// this BEFORE calling svgCanvas.setSvgString
//
this.randomizeIds = function (enableRandomization) {
	if (arguments.length > 0 && enableRandomization === false) {
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
var uniquifyElems = this.uniquifyElems = function (g) {
	var ids = {};
	// TODO: Handle markers and connectors. These are not yet re-identified properly
	// as their referring elements do not get remapped.
	//
	// <marker id='se_marker_end_svg_7'/>
	// <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
	//
	// Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
	// Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute
	var refElems = ['filter', 'linearGradient', 'pattern',	'radialGradient', 'symbol', 'textPath', 'use'];

	svgedit.utilities.walkTree(g, function (n) {
		// if it's an element node
		if (n.nodeType === 1) {
			// and the element has an ID
			if (n.id) {
				// and we haven't tracked this ID yet
				if (!(n.id in ids)) {
					// add this id to our map
					ids[n.id] = {elem: null, attrs: [], hrefs: []};
				}
				ids[n.id].elem = n;
			}

			// now search for all attributes on this element that might refer
			// to other elements
			$.each(refAttrs, function (i, attr) {
				var attrnode = n.getAttributeNode(attr);
				if (attrnode) {
					// the incoming file has been sanitized, so we should be able to safely just strip off the leading #
					var url = svgedit.utilities.getUrlFromAttr(attrnode.value),
						refid = url ? url.substr(1) : null;
					if (refid) {
						if (!(refid in ids)) {
							// add this id to our map
							ids[refid] = {elem: null, attrs: [], hrefs: []};
						}
						ids[refid].attrs.push(attrnode);
					}
				}
			});

			// check xlink:href now
			var href = svgedit.utilities.getHref(n);
			// TODO: what if an <image> or <a> element refers to an element internally?
			if (href && refElems.indexOf(n.nodeName) >= 0) {
				var refid = href.substr(1);
				if (refid) {
					if (!(refid in ids)) {
						// add this id to our map
						ids[refid] = {elem: null, attrs: [], hrefs: []};
					}
					ids[refid].hrefs.push(n);
				}
			}
		}
	});

	// in ids, we now have a map of ids, elements and attributes, let's re-identify
	var oldid;
	for (oldid in ids) {
		if (!oldid) { continue; }
		var elem = ids[oldid].elem;
		if (elem) {
			var newid = getNextId();

			// assign element its new id
			elem.id = newid;

			// remap all url() attributes
			var attrs = ids[oldid].attrs;
			var j = attrs.length;
			while (j--) {
				var attr = attrs[j];
				attr.ownerElement.setAttribute(attr.name, 'url(#' + newid + ')');
			}

			// remap all href attributes
			var hreffers = ids[oldid].hrefs;
			var k = hreffers.length;
			while (k--) {
				var hreffer = hreffers[k];
				svgedit.utilities.setHref(hreffer, '#' + newid);
			}
		}
	}
};

// Function setUseData
// Assigns reference data for each use element
var setUseData = this.setUseData = function (parent) {
	var elems = $(parent);

	if (parent.tagName !== 'use') {
		elems = elems.find('use');
	}

	elems.each(function () {
		var id = getHref(this).substr(1);
		var refElem = svgedit.utilities.getElem(id);
		if (!refElem) { return; }
		$(this).data('ref', refElem);
		if (refElem.tagName === 'symbol' || refElem.tagName === 'svg') {
			$(this).data('symbol', refElem).data('ref', refElem);
		}
	});
};

// Function convertGradients
// Converts gradients from userSpaceOnUse to objectBoundingBox
var convertGradients = this.convertGradients = function (elem) {
	var elems = $(elem).find('linearGradient, radialGradient');
	if (!elems.length && svgedit.browser.isWebkit()) {
		// Bug in webkit prevents regular *Gradient selector search
		elems = $(elem).find('*').filter(function () {
			return (this.tagName.indexOf('Gradient') >= 0);
		});
	}

	elems.each(function () {
		var grad = this;
		if ($(grad).attr('gradientUnits') === 'userSpaceOnUse') {
			// TODO: Support more than one element with this ref by duplicating parent grad
			var elems = $(svgcontent).find('[fill="url(#' + grad.id + ')"],[stroke="url(#' + grad.id + ')"]');
			if (!elems.length) { return; }

			// get object's bounding box
			var bb = svgedit.utilities.getBBox(elems[0]);

			// This will occur if the element is inside a <defs> or a <symbol>,
			// in which we shouldn't need to convert anyway.
			if (!bb) { return; }

			if (grad.tagName === 'linearGradient') {
				var gCoords = $(grad).attr(['x1', 'y1', 'x2', 'y2']);

				// If has transform, convert
				var tlist = grad.gradientTransform.baseVal;
				if (tlist && tlist.numberOfItems > 0) {
					var m = svgedit.math.transformListToTransform(tlist).matrix;
					var pt1 = svgedit.math.transformPoint(gCoords.x1, gCoords.y1, m);
					var pt2 = svgedit.math.transformPoint(gCoords.x2, gCoords.y2, m);

					gCoords.x1 = pt1.x;
					gCoords.y1 = pt1.y;
					gCoords.x2 = pt2.x;
					gCoords.y2 = pt2.y;
					grad.removeAttribute('gradientTransform');
				}

				$(grad).attr({
					x1: (gCoords.x1 - bb.x) / bb.width,
					y1: (gCoords.y1 - bb.y) / bb.height,
					x2: (gCoords.x2 - bb.x) / bb.width,
					y2: (gCoords.y2 - bb.y) / bb.height
				});
				grad.removeAttribute('gradientUnits');
			}
			// else {
			// 	Note: radialGradient elements cannot be easily converted
			// 	because userSpaceOnUse will keep circular gradients, while
			// 	objectBoundingBox will x/y scale the gradient according to
			// 	its bbox.
			//
			// 	For now we'll do nothing, though we should probably have
			// 	the gradient be updated as the element is moved, as
			// 	inkscape/illustrator do.
			//
			// 	var gCoords = $(grad).attr(['cx', 'cy', 'r']);
			//
			// 	$(grad).attr({
			// 		cx: (gCoords.cx - bb.x) / bb.width,
			// 		cy: (gCoords.cy - bb.y) / bb.height,
			// 		r: gCoords.r
			// 	});
			//
			// 	grad.removeAttribute('gradientUnits');
			// }
		}
	});
};

// Function: convertToGroup
// Converts selected/given <use> or child SVG element to a group
var convertToGroup = this.convertToGroup = function (elem) {
	if (!elem) {
		elem = selectedElements[0];
	}
	var $elem = $(elem);
	var batchCmd = new svgedit.history.BatchCommand();
	var ts;

	if ($elem.data('gsvg')) {
		// Use the gsvg as the new group
		var svg = elem.firstChild;
		var pt = $(svg).attr(['x', 'y']);

		$(elem.firstChild.firstChild).unwrap();
		$(elem).removeData('gsvg');

		var tlist = svgedit.transformlist.getTransformList(elem);
		var xform = svgroot.createSVGTransform();
		xform.setTranslate(pt.x, pt.y);
		tlist.appendItem(xform);
		svgedit.recalculate.recalculateDimensions(elem);
		call('selected', [elem]);
	} else if ($elem.data('symbol')) {
		elem = $elem.data('symbol');

		ts = $elem.attr('transform');
		var pos = $elem.attr(['x', 'y']);

		var vb = elem.getAttribute('viewBox');

		if (vb) {
			var nums = vb.split(' ');
			pos.x -= +nums[0];
			pos.y -= +nums[1];
		}

		// Not ideal, but works
		ts += ' translate(' + (pos.x || 0) + ',' + (pos.y || 0) + ')';

		var prev = $elem.prev();

		// Remove <use> element
		batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand($elem[0], $elem[0].nextSibling, $elem[0].parentNode));
		$elem.remove();

		// See if other elements reference this symbol
		var hasMore = $(svgcontent).find('use:data(symbol)').length;

		var g = svgdoc.createElementNS(NS.SVG, 'g');
		var childs = elem.childNodes;

		var i;
		for (i = 0; i < childs.length; i++) {
			g.appendChild(childs[i].cloneNode(true));
		}

		// Duplicate the gradients for Gecko, since they weren't included in the <symbol>
		if (svgedit.browser.isGecko()) {
			var dupeGrads = $(svgedit.utilities.findDefs()).children('linearGradient,radialGradient,pattern').clone();
			$(g).append(dupeGrads);
		}

		if (ts) {
			g.setAttribute('transform', ts);
		}

		var parent = elem.parentNode;

		uniquifyElems(g);

		// Put the dupe gradients back into <defs> (after uniquifying them)
		if (svgedit.browser.isGecko()) {
			$(findDefs()).append($(g).find('linearGradient,radialGradient,pattern'));
		}

		// now give the g itself a new id
		g.id = getNextId();

		prev.after(g);

		if (parent) {
			if (!hasMore) {
				// remove symbol/svg element
				var nextSibling = elem.nextSibling;
				parent.removeChild(elem);
				batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(elem, nextSibling, parent));
			}
			batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(g));
		}

		setUseData(g);

		if (svgedit.browser.isGecko()) {
			convertGradients(svgedit.utilities.findDefs());
		} else {
			convertGradients(g);
		}

		// recalculate dimensions on the top-level children so that unnecessary transforms
		// are removed
		svgedit.utilities.walkTreePost(g, function (n) {
			try {
				svgedit.recalculate.recalculateDimensions(n);
			} catch (e) {
				console.log(e);
			}
		});

		// Give ID for any visible element missing one
		$(g).find(visElems).each(function () {
			if (!this.id) { this.id = getNextId(); }
		});

		selectOnly([g]);

		var cm = pushGroupProperties(g, true);
		if (cm) {
			batchCmd.addSubCommand(cm);
		}

		addCommandToHistory(batchCmd);
	} else {
		console.log('Unexpected element to ungroup:', elem);
	}
};

//
// Function: setSvgString
// This function sets the current drawing as the input SVG XML.
//
// Parameters:
// xmlString - The SVG as XML text.
// preventUndo - Boolean (defaults to false) indicating if we want to do the
// changes without adding them to the undo stack - e.g. for initializing a
// drawing on page load.
//
// Returns:
// This function returns false if the set was unsuccessful, true otherwise.
this.setSvgString = function (xmlString, preventUndo) {
	try {
		// convert string into XML document
		var newDoc = svgedit.utilities.text2xml(xmlString);

		this.prepareSvg(newDoc);

		var batchCmd = new svgedit.history.BatchCommand('Change Source');

		// remove old svg document
		var nextSibling = svgcontent.nextSibling;
		var oldzoom = svgroot.removeChild(svgcontent);
		batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(oldzoom, nextSibling, svgroot));

		// set new svg document
		// If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
		if (svgdoc.adoptNode) {
			svgcontent = svgdoc.adoptNode(newDoc.documentElement);
		} else {
			svgcontent = svgdoc.importNode(newDoc.documentElement, true);
		}

		svgroot.appendChild(svgcontent);
		var content = $(svgcontent);

		canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent, idprefix);

		// retrieve or set the nonce
		var nonce = getCurrentDrawing().getNonce();
		if (nonce) {
			call('setnonce', nonce);
		} else {
			call('unsetnonce');
		}

		// change image href vals if possible
		content.find('image').each(function () {
			var image = this;
			svgedit.utilities.preventClickDefault(image);
			var val = getHref(this);
			if (val) {
				if (val.indexOf('data:') === 0) {
					// Check if an SVG-edit data URI
					var m = val.match(/svgedit_url=(.*?);/);
					if (m) {
						var url = decodeURIComponent(m[1]);
						$(new Image()).load(function () {
							image.setAttributeNS(NS.XLINK, 'xlink:href', url);
						}).attr('src', url);
					}
				}
				// Add to encodableImages if it loads
				canvas.embedImage(val);
			}
		});

		// Wrap child SVGs in group elements
		content.find('svg').each(function () {
			// Skip if it's in a <defs>
			if ($(this).closest('defs').length) { return; }

			uniquifyElems(this);

			// Check if it already has a gsvg group
			var pa = this.parentNode;
			if (pa.childNodes.length === 1 && pa.nodeName === 'g') {
				$(pa).data('gsvg', this);
				pa.id = pa.id || getNextId();
			} else {
				groupSvgElem(this);
			}
		});

		// For Firefox: Put all paint elems in defs
		if (svgedit.browser.isGecko()) {
			content.find('linearGradient, radialGradient, pattern').appendTo(svgedit.utilities.findDefs());
		}

		// Set ref element for <use> elements

		// TODO: This should also be done if the object is re-added through "redo"
		setUseData(content);

		convertGradients(content[0]);

		var attrs = {
			id: 'svgcontent',
			overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden'
		};

		var percs = false;

		// determine proper size
		if (content.attr('viewBox')) {
			var vb = content.attr('viewBox').split(' ');
			attrs.width = vb[2];
			attrs.height = vb[3];
		// handle content that doesn't have a viewBox
		} else {
			$.each(['width', 'height'], function (i, dim) {
				// Set to 100 if not given
				var val = content.attr(dim);

				if (!val) { val = '100%'; }

				if (String(val).substr(-1) === '%') {
					// Use user units if percentage given
					percs = true;
				} else {
					attrs[dim] = svgedit.units.convertToNum(dim, val);
				}
			});
		}

		// identify layers
		identifyLayers();

		// Give ID for any visible layer children missing one
		content.children().find(visElems).each(function () {
			if (!this.id) { this.id = getNextId(); }
		});

		// Percentage width/height, so let's base it on visible elements
		if (percs) {
			var bb = getStrokedBBox();
			attrs.width = bb.width + bb.x;
			attrs.height = bb.height + bb.y;
		}

		// Just in case negative numbers are given or
		// result from the percs calculation
		if (attrs.width <= 0) { attrs.width = 100; }
		if (attrs.height <= 0) { attrs.height = 100; }

		content.attr(attrs);
		this.contentW = attrs.width;
		this.contentH = attrs.height;

		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(svgcontent));
		// update root to the correct size
		var changes = content.attr(['width', 'height']);
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(svgroot, changes));

		// reset zoom
		currentZoom = 1;

		// reset transform lists
		svgedit.transformlist.resetListMap();
		clearSelection();
		svgedit.path.clearData();
		svgroot.appendChild(selectorManager.selectorParentGroup);

		if (!preventUndo) addCommandToHistory(batchCmd);
		call('changed', [svgcontent]);
	} catch (e) {
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
// This function returns null if the import was unsuccessful, or the element otherwise.
// TODO:
// * properly handle if namespace is introduced by imported content (must add to svgcontent
// and update all prefixes in the imported node)
// * properly handle recalculating dimensions, recalculateDimensions() doesn't handle
// arbitrary transform lists, but makes some assumptions about how the transform list
// was obtained
// * import should happen in top-left of current zoomed viewport
this.importSvgString = function (xmlString) {
	var j, ts;
	try {
		// Get unique ID
		var uid = svgedit.utilities.encode64(xmlString.length + xmlString).substr(0, 32);

		var useExisting = false;

		// Look for symbol and make sure symbol exists in image
		if (importIds[uid]) {
			if ($(importIds[uid].symbol).parents('#svgroot').length) {
				useExisting = true;
			}
		}

		var batchCmd = new svgedit.history.BatchCommand('Import Image');
		var symbol;
		if (useExisting) {
			symbol = importIds[uid].symbol;
			ts = importIds[uid].xform;
		} else {
			// convert string into XML document
			var newDoc = svgedit.utilities.text2xml(xmlString);

			this.prepareSvg(newDoc);

			// import new svg document into our document
			var svg;
			// If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
			if (svgdoc.adoptNode) {
				svg = svgdoc.adoptNode(newDoc.documentElement);
			} else {
				svg = svgdoc.importNode(newDoc.documentElement, true);
			}

			uniquifyElems(svg);

			var innerw = svgedit.units.convertToNum('width', svg.getAttribute('width')),
				innerh = svgedit.units.convertToNum('height', svg.getAttribute('height')),
				innervb = svg.getAttribute('viewBox'),
				// if no explicit viewbox, create one out of the width and height
				vb = innervb ? innervb.split(' ') : [0, 0, innerw, innerh];
			for (j = 0; j < 4; ++j) {
				vb[j] = +(vb[j]);
			}

			// TODO: properly handle preserveAspectRatio
			var // canvasw = +svgcontent.getAttribute('width'),
				canvash = +svgcontent.getAttribute('height');
			// imported content should be 1/3 of the canvas on its largest dimension

			if (innerh > innerw) {
				ts = 'scale(' + (canvash / 3) / vb[3] + ')';
			} else {
				ts = 'scale(' + (canvash / 3) / vb[2] + ')';
			}

			// Hack to make recalculateDimensions understand how to scale
			ts = 'translate(0) ' + ts + ' translate(0)';

			symbol = svgdoc.createElementNS(NS.SVG, 'symbol');
			var defs = svgedit.utilities.findDefs();

			if (svgedit.browser.isGecko()) {
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
			var i;
			for (i = 0; i < attrs.length; i++) {
				var attr = attrs[i];
				symbol.setAttribute(attr.nodeName, attr.value);
			}
			symbol.id = getNextId();

			// Store data
			importIds[uid] = {
				symbol: symbol,
				xform: ts
			};

			svgedit.utilities.findDefs().appendChild(symbol);
			batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(symbol));
		}

		var useEl = svgdoc.createElementNS(NS.SVG, 'use');
		useEl.id = getNextId();
		setHref(useEl, '#' + symbol.id);

		(currentGroup || getCurrentDrawing().getCurrentLayer()).appendChild(useEl);
		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(useEl));
		clearSelection();

		useEl.setAttribute('transform', ts);
		svgedit.recalculate.recalculateDimensions(useEl);
		$(useEl).data('symbol', symbol).data('ref', symbol);
		addToSelection([useEl]);

		// TODO: Find way to add this in a recalculateDimensions-parsable way
		// if (vb[0] != 0 || vb[1] != 0) {
		// 	ts = 'translate(' + (-vb[0]) + ',' + (-vb[1]) + ') ' + ts;
		// }
		addCommandToHistory(batchCmd);
		call('changed', [svgcontent]);
	} catch (e) {
		console.log(e);
		return null;
	}

	// we want to return the element so we can automatically select it
	return useEl;
};

// TODO(codedread): Move all layer/context functions in draw.js
// Layer API Functions

// Group: Layers

// Function: identifyLayers
// Updates layer system
var identifyLayers = canvas.identifyLayers = function () {
	leaveContext();
	getCurrentDrawing().identifyLayers();
};

// Function: createLayer
// Creates a new top-level layer in the drawing with the given name, sets the current layer
// to it, and then clears the selection. This function then calls the 'changed' handler.
// This is an undoable action.
//
// Parameters:
// name - The given name
this.createLayer = function (name, hrService) {
	var newLayer = getCurrentDrawing().createLayer(name, historyRecordingService(hrService));
	clearSelection();
	call('changed', [newLayer]);
};

/**
 * Creates a new top-level layer in the drawing with the given name, copies all the current layer's contents
 * to it, and then clears the selection. This function then calls the 'changed' handler.
 * This is an undoable action.
 * @param {string} name - The given name. If the layer name exists, a new name will be generated.
 * @param {svgedit.history.HistoryRecordingService} hrService - History recording service
 */
this.cloneLayer = function (name, hrService) {
	// Clone the current layer and make the cloned layer the new current layer
	var newLayer = getCurrentDrawing().cloneLayer(name, historyRecordingService(hrService));

	clearSelection();
	leaveContext();
	call('changed', [newLayer]);
};

// Function: deleteCurrentLayer
// Deletes the current layer from the drawing and then clears the selection. This function
// then calls the 'changed' handler. This is an undoable action.
this.deleteCurrentLayer = function () {
	var currentLayer = getCurrentDrawing().getCurrentLayer();
	var nextSibling = currentLayer.nextSibling;
	var parent = currentLayer.parentNode;
	currentLayer = getCurrentDrawing().deleteCurrentLayer();
	if (currentLayer) {
		var batchCmd = new svgedit.history.BatchCommand('Delete Layer');
		// store in our Undo History
		batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(currentLayer, nextSibling, parent));
		addCommandToHistory(batchCmd);
		clearSelection();
		call('changed', [parent]);
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
this.setCurrentLayer = function (name) {
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
// newname - the new name you want to give the current layer. This name must be unique
// among all layer names.
//
// Returns:
// true if the rename succeeded, false otherwise.
this.renameCurrentLayer = function (newname) {
	var drawing = getCurrentDrawing();
	var layer = drawing.getCurrentLayer();
	if (layer) {
		var result = drawing.setCurrentLayerName(newname, historyRecordingService());
		if (result) {
			call('changed', [layer]);
			return true;
		}
	}
	return false;
};

// Function: setCurrentLayerPosition
// Changes the position of the current layer to the new value. If the new index is not valid,
// this function does nothing and returns false, otherwise it returns true. This is an
// undo-able action.
//
// Parameters:
// newpos - The zero-based index of the new position of the layer. This should be between
// 0 and (number of layers - 1)
//
// Returns:
// true if the current layer position was changed, false otherwise.
this.setCurrentLayerPosition = function (newpos) {
	var drawing = getCurrentDrawing();
	var result = drawing.setCurrentLayerPosition(newpos);
	if (result) {
		addCommandToHistory(new svgedit.history.MoveElementCommand(result.currentGroup, result.oldNextSibling, svgcontent));
		return true;
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
this.setLayerVisibility = function (layername, bVisible) {
	var drawing = getCurrentDrawing();
	var prevVisibility = drawing.getLayerVisibility(layername);
	var layer = drawing.setLayerVisibility(layername, bVisible);
	if (layer) {
		var oldDisplay = prevVisibility ? 'inline' : 'none';
		addCommandToHistory(new svgedit.history.ChangeElementCommand(layer, {'display': oldDisplay}, 'Layer Visibility'));
	} else {
		return false;
	}

	if (layer === drawing.getCurrentLayer()) {
		clearSelection();
		pathActions.clear();
	}
	// call('changed', [selected]);
	return true;
};

// Function: moveSelectedToLayer
// Moves the selected elements to layername. If the name is not a valid layer name, then false
// is returned. Otherwise it returns true. This is an undo-able action.
//
// Parameters:
// layername - the name of the layer you want to which you want to move the selected elements
//
// Returns:
// true if the selected elements were moved to the layer, false otherwise.
this.moveSelectedToLayer = function (layername) {
	// find the layer
	var i;
	var drawing = getCurrentDrawing();
	var layer = drawing.getLayerByName(layername);
	if (!layer) { return false; }

	var batchCmd = new svgedit.history.BatchCommand('Move Elements to Layer');

	// loop for each selected element and move it
	var selElems = selectedElements;
	i = selElems.length;
	while (i--) {
		var elem = selElems[i];
		if (!elem) { continue; }
		var oldNextSibling = elem.nextSibling;
		// TODO: this is pretty brittle!
		var oldLayer = elem.parentNode;
		layer.appendChild(elem);
		batchCmd.addSubCommand(new svgedit.history.MoveElementCommand(elem, oldNextSibling, oldLayer));
	}

	addCommandToHistory(batchCmd);

	return true;
};

this.mergeLayer = function (hrService) {
	getCurrentDrawing().mergeLayer(historyRecordingService(hrService));
	clearSelection();
	leaveContext();
	call('changed', [svgcontent]);
};

this.mergeAllLayers = function (hrService) {
	getCurrentDrawing().mergeAllLayers(historyRecordingService(hrService));
	clearSelection();
	leaveContext();
	call('changed', [svgcontent]);
};

// Function: leaveContext
// Return from a group context to the regular kind, make any previously
// disabled elements enabled again
var leaveContext = this.leaveContext = function () {
	var i, len = disabledElems.length;
	if (len) {
		for (i = 0; i < len; i++) {
			var elem = disabledElems[i];
			var orig = elData(elem, 'orig_opac');
			if (orig !== 1) {
				elem.setAttribute('opacity', orig);
			} else {
				elem.removeAttribute('opacity');
			}
			elem.setAttribute('style', 'pointer-events: inherit');
		}
		disabledElems = [];
		clearSelection(true);
		call('contextset', null);
	}
	currentGroup = null;
};

// Function: setContext
// Set the current context (for in-group editing)
var setContext = this.setContext = function (elem) {
	leaveContext();
	if (typeof elem === 'string') {
		elem = svgedit.utilities.getElem(elem);
	}

	// Edit inside this group
	currentGroup = elem;

	// Disable other elements
	$(elem).parentsUntil('#svgcontent').andSelf().siblings().each(function () {
		var opac = this.getAttribute('opacity') || 1;
		// Store the original's opacity
		elData(this, 'orig_opac', opac);
		this.setAttribute('opacity', opac * 0.33);
		this.setAttribute('style', 'pointer-events: none');
		disabledElems.push(this);
	});

	clearSelection();
	call('contextset', currentGroup);
};

// Group: Document functions

// Function: clear
// Clears the current document. This is not an undoable action.
this.clear = function () {
	pathActions.clear();

	clearSelection();

	// clear the svgcontent node
	canvas.clearSvgContentElement();

	// create new document
	canvas.current_drawing_ = new svgedit.draw.Drawing(svgcontent);

	// create empty first layer
	canvas.createLayer('Layer 1');

	// clear the undo stack
	canvas.undoMgr.resetUndoStack();

	// reset the selector manager
	selectorManager.initGroup();

	// reset the rubber band box
	rubberBox = selectorManager.getRubberBandBox();

	call('cleared');
};

// Function: linkControlPoints
// Alias function
this.linkControlPoints = pathActions.linkControlPoints;

// Function: getContentElem
// Returns the content DOM element
this.getContentElem = function () { return svgcontent; };

// Function: getRootElem
// Returns the root DOM element
this.getRootElem = function () { return svgroot; };

// Function: getSelectedElems
// Returns the array with selected DOM elements
this.getSelectedElems = function () { return selectedElements; };

// Function: getResolution
// Returns the current dimensions and zoom level in an object
var getResolution = this.getResolution = function () {
//		var vb = svgcontent.getAttribute('viewBox').split(' ');
//		return {'w':vb[2], 'h':vb[3], 'zoom': currentZoom};

	var width = svgcontent.getAttribute('width') / currentZoom;
	var height = svgcontent.getAttribute('height') / currentZoom;

	return {
		'w': width,
		'h': height,
		'zoom': currentZoom
	};
};

// Function: getZoom
// Returns the current zoom level
this.getZoom = function () { return currentZoom; };

// Function: getSnapToGrid
// Returns the current snap to grid setting
this.getSnapToGrid = function () { return curConfig.gridSnapping; };

// Function: getVersion
// Returns a string which describes the revision number of SvgCanvas.
this.getVersion = function () {
	return 'svgcanvas.js ($Rev$)';
};

// Function: setUiStrings
// Update interface strings with given values
//
// Parameters:
// strs - Object with strings (see uiStrings for examples)
this.setUiStrings = function (strs) {
	$.extend(uiStrings, strs.notification);
};

// Function: setConfig
// Update configuration options with given values
//
// Parameters:
// opts - Object with options (see curConfig for examples)
this.setConfig = function (opts) {
	$.extend(curConfig, opts);
};

// Function: getTitle
// Returns the current group/SVG's title contents
this.getTitle = function (elem) {
	var i;
	elem = elem || selectedElements[0];
	if (!elem) { return; }
	elem = $(elem).data('gsvg') || $(elem).data('symbol') || elem;
	var childs = elem.childNodes;
	for (i = 0; i < childs.length; i++) {
		if (childs[i].nodeName === 'title') {
			return childs[i].textContent;
		}
	}
	return '';
};

// Function: setGroupTitle
// Sets the group/SVG's title content
// TODO: Combine this with setDocumentTitle
this.setGroupTitle = function (val) {
	var elem = selectedElements[0];
	elem = $(elem).data('gsvg') || elem;

	var ts = $(elem).children('title');

	var batchCmd = new svgedit.history.BatchCommand('Set Label');

	if (!val.length) {
		// Remove title element
		var tsNextSibling = ts.nextSibling;
		batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(ts[0], tsNextSibling, elem));
		ts.remove();
	} else if (ts.length) {
		// Change title contents
		var title = ts[0];
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(title, {'#text': title.textContent}));
		title.textContent = val;
	} else {
		// Add title element
		title = svgdoc.createElementNS(NS.SVG, 'title');
		title.textContent = val;
		$(elem).prepend(title);
		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(title));
	}

	addCommandToHistory(batchCmd);
};

// Function: getDocumentTitle
// Returns the current document title or an empty string if not found
var getDocumentTitle = this.getDocumentTitle = function () {
	return canvas.getTitle(svgcontent);
};

// Function: setDocumentTitle
// Adds/updates a title element for the document with the given name.
// This is an undoable action
//
// Parameters:
// newtitle - String with the new title
this.setDocumentTitle = function (newtitle) {
	var i;
	var childs = svgcontent.childNodes, docTitle = false, oldTitle = '';

	var batchCmd = new svgedit.history.BatchCommand('Change Image Title');

	for (i = 0; i < childs.length; i++) {
		if (childs[i].nodeName === 'title') {
			docTitle = childs[i];
			oldTitle = docTitle.textContent;
			break;
		}
	}
	if (!docTitle) {
		docTitle = svgdoc.createElementNS(NS.SVG, 'title');
		svgcontent.insertBefore(docTitle, svgcontent.firstChild);
	}

	if (newtitle.length) {
		docTitle.textContent = newtitle;
	} else {
		// No title given, so element is not necessary
		docTitle.parentNode.removeChild(docTitle);
	}
	batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(docTitle, {'#text': oldTitle}));
	addCommandToHistory(batchCmd);
};

// Function: getEditorNS
// Returns the editor's namespace URL, optionally adds it to root element
//
// Parameters:
// add - Boolean to indicate whether or not to add the namespace value
this.getEditorNS = function (add) {
	if (add) {
		svgcontent.setAttribute('xmlns:se', NS.SE);
	}
	return NS.SE;
};

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
this.setResolution = function (x, y) {
	var res = getResolution();
	var w = res.w, h = res.h;
	var batchCmd;

	if (x === 'fit') {
		// Get bounding box
		var bbox = getStrokedBBox();

		if (bbox) {
			batchCmd = new svgedit.history.BatchCommand('Fit Canvas to Content');
			var visEls = getVisibleElements();
			addToSelection(visEls);
			var dx = [], dy = [];
			$.each(visEls, function (i, item) {
				dx.push(bbox.x * -1);
				dy.push(bbox.y * -1);
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
	if (x !== w || y !== h) {
		if (!batchCmd) {
			batchCmd = new svgedit.history.BatchCommand('Change Image Dimensions');
		}

		x = svgedit.units.convertToNum('width', x);
		y = svgedit.units.convertToNum('height', y);

		svgcontent.setAttribute('width', x);
		svgcontent.setAttribute('height', y);

		this.contentW = x;
		this.contentH = y;
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(svgcontent, {'width': w, 'height': h}));

		svgcontent.setAttribute('viewBox', [0, 0, x / currentZoom, y / currentZoom].join(' '));
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(svgcontent, {'viewBox': ['0 0', w, h].join(' ')}));

		addCommandToHistory(batchCmd);
		call('changed', [svgcontent]);
	}
	return true;
};

// Function: getOffset
// Returns an object with x, y values indicating the svgcontent element's
// position in the editor's canvas.
this.getOffset = function () {
	return $(svgcontent).attr(['x', 'y']);
};

// Function: setBBoxZoom
// Sets the zoom level on the canvas-side based on the given value
//
// Parameters:
// val - Bounding box object to zoom to or string indicating zoom option
// editorW - Integer with the editor's workarea box's width
// editorH - Integer with the editor's workarea box's height
this.setBBoxZoom = function (val, editorW, editorH) {
	var spacer = 0.85;
	var bb;
	var calcZoom = function (bb) {
		if (!bb) { return false; }
		var wZoom = Math.round((editorW / bb.width) * 100 * spacer) / 100;
		var hZoom = Math.round((editorH / bb.height) * 100 * spacer) / 100;
		var zoomlevel = Math.min(wZoom, hZoom);
		canvas.setZoom(zoomlevel);
		return {'zoom': zoomlevel, 'bbox': bb};
	};

	if (typeof val === 'object') {
		bb = val;
		if (bb.width === 0 || bb.height === 0) {
			var newzoom = bb.zoom ? bb.zoom : currentZoom * bb.factor;
			canvas.setZoom(newzoom);
			return {'zoom': currentZoom, 'bbox': bb};
		}
		return calcZoom(bb);
	}

	switch (val) {
	case 'selection':
		if (!selectedElements[0]) { return; }
		var selectedElems = $.map(selectedElements, function (n) { if (n) { return n; } });
		bb = getStrokedBBox(selectedElems);
		break;
	case 'canvas':
		var res = getResolution();
		spacer = 0.95;
		bb = {width: res.w, height: res.h, x: 0, y: 0};
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
};

// Function: setZoom
// Sets the zoom to the given level
//
// Parameters:
// zoomlevel - Float indicating the zoom level to change to
this.setZoom = function (zoomlevel) {
	var res = getResolution();
	svgcontent.setAttribute('viewBox', '0 0 ' + res.w / zoomlevel + ' ' + res.h / zoomlevel);
	currentZoom = zoomlevel;
	$.each(selectedElements, function (i, elem) {
		if (!elem) { return; }
		selectorManager.requestSelector(elem).resize();
	});
	pathActions.zoomChange();
	runExtensions('zoomChanged', zoomlevel);
};

// Function: getMode
// Returns the current editor mode string
this.getMode = function () {
	return currentMode;
};

// Function: setMode
// Sets the editor's mode to the given string
//
// Parameters:
// name - String with the new mode to change to
this.setMode = function (name) {
	pathActions.clear(true);
	textActions.clear();
	curProperties = (selectedElements[0] && selectedElements[0].nodeName === 'text') ? curText : curShape;
	currentMode = name;
};

// Group: Element Styling

// Function: getColor
// Returns the current fill/stroke option
this.getColor = function (type) {
	return curProperties[type];
};

// Function: setColor
// Change the current stroke/fill color/gradient value
//
// Parameters:
// type - String indicating fill or stroke
// val - The value to set the stroke attribute to
// preventUndo - Boolean indicating whether or not this should be and undoable option
this.setColor = function (type, val, preventUndo) {
	curShape[type] = val;
	curProperties[type + '_paint'] = {type: 'solidColor'};
	var elems = [];
	function addNonG (e) {
		if (e.nodeName !== 'g') {
			elems.push(e);
		}
	}
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName === 'g') {
				svgedit.utilities.walkTree(elem, addNonG);
			} else {
				if (type === 'fill') {
					if (elem.tagName !== 'polyline' && elem.tagName !== 'line') {
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
			call('changed', elems);
		} else {
			changeSelectedAttributeNoUndo(type, val, elems);
		}
	}
};

// Function: setGradient
// Apply the current gradient to selected element's fill or stroke
//
// Parameters
// type - String indicating "fill" or "stroke" to apply to an element
var setGradient = this.setGradient = function (type) {
	if (!curProperties[type + '_paint'] || curProperties[type + '_paint'].type === 'solidColor') { return; }
	var grad = canvas[type + 'Grad'];
	// find out if there is a duplicate gradient already in the defs
	var duplicateGrad = findDuplicateGradient(grad);
	var defs = svgedit.utilities.findDefs();
	// no duplicate found, so import gradient into defs
	if (!duplicateGrad) {
		// var origGrad = grad;
		grad = defs.appendChild(svgdoc.importNode(grad, true));
		// get next id and set it on the grad
		grad.id = getNextId();
	} else { // use existing gradient
		grad = duplicateGrad;
	}
	canvas.setColor(type, 'url(#' + grad.id + ')');
};

// Function: findDuplicateGradient
// Check if exact gradient already exists
//
// Parameters:
// grad - The gradient DOM element to compare to others
//
// Returns:
// The existing gradient if found, null if not
var findDuplicateGradient = function (grad) {
	var defs = svgedit.utilities.findDefs();
	var existingGrads = $(defs).find('linearGradient, radialGradient');
	var i = existingGrads.length;
	var radAttrs = ['r', 'cx', 'cy', 'fx', 'fy'];
	while (i--) {
		var og = existingGrads[i];
		if (grad.tagName === 'linearGradient') {
			if (grad.getAttribute('x1') !== og.getAttribute('x1') ||
				grad.getAttribute('y1') !== og.getAttribute('y1') ||
				grad.getAttribute('x2') !== og.getAttribute('x2') ||
				grad.getAttribute('y2') !== og.getAttribute('y2')
			) {
				continue;
			}
		} else {
			var gradAttrs = $(grad).attr(radAttrs);
			var ogAttrs = $(og).attr(radAttrs);

			var diff = false;
			$.each(radAttrs, function (i, attr) {
				if (gradAttrs[attr] !== ogAttrs[attr]) { diff = true; }
			});

			if (diff) { continue; }
		}

		// else could be a duplicate, iterate through stops
		var stops = grad.getElementsByTagNameNS(NS.SVG, 'stop');
		var ostops = og.getElementsByTagNameNS(NS.SVG, 'stop');

		if (stops.length !== ostops.length) {
			continue;
		}

		var j = stops.length;
		while (j--) {
			var stop = stops[j];
			var ostop = ostops[j];

			if (stop.getAttribute('offset') !== ostop.getAttribute('offset') ||
				stop.getAttribute('stop-opacity') !== ostop.getAttribute('stop-opacity') ||
				stop.getAttribute('stop-color') !== ostop.getAttribute('stop-color')) {
				break;
			}
		}

		if (j === -1) {
			return og;
		}
	} // for each gradient in defs

	return null;
};

function reorientGrads (elem, m) {
	var i;
	var bb = svgedit.utilities.getBBox(elem);
	for (i = 0; i < 2; i++) {
		var type = i === 0 ? 'fill' : 'stroke';
		var attrVal = elem.getAttribute(type);
		if (attrVal && attrVal.indexOf('url(') === 0) {
			var grad = svgedit.utilities.getRefElem(attrVal);
			if (grad.tagName === 'linearGradient') {
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
				var pt1 = svgedit.math.transformPoint(x1, y1, m);
				var pt2 = svgedit.math.transformPoint(x2, y2, m);

				// Convert back to BB points
				var gCoords = {};

				gCoords.x1 = (pt1.x - bb.x) / bb.width;
				gCoords.y1 = (pt1.y - bb.y) / bb.height;
				gCoords.x2 = (pt2.x - bb.x) / bb.width;
				gCoords.y2 = (pt2.y - bb.y) / bb.height;

				var newgrad = grad.cloneNode(true);
				$(newgrad).attr(gCoords);

				newgrad.id = getNextId();
				svgedit.utilities.findDefs().appendChild(newgrad);
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
this.setPaint = function (type, paint) {
	// make a copy
	var p = new $.jGraduate.Paint(paint);
	this.setPaintOpacity(type, p.alpha / 100, true);

	// now set the current paint object
	curProperties[type + '_paint'] = p;
	switch (p.type) {
	case 'solidColor':
		this.setColor(type, p.solidColor !== 'none' ? '#' + p.solidColor : 'none');
		break;
	case 'linearGradient':
	case 'radialGradient':
		canvas[type + 'Grad'] = p[p.type];
		setGradient(type);
		break;
	}
};

// alias
this.setStrokePaint = function (paint) {
	this.setPaint('stroke', paint);
};

this.setFillPaint = function (paint) {
	this.setPaint('fill', paint);
};

// Function: getStrokeWidth
// Returns the current stroke-width value
this.getStrokeWidth = function () {
	return curProperties.stroke_width;
};

// Function: setStrokeWidth
// Sets the stroke width for the current selected elements
// When attempting to set a line's width to 0, this changes it to 1 instead
//
// Parameters:
// val - A Float indicating the new stroke width value
this.setStrokeWidth = function (val) {
	if (val === 0 && ['line', 'path'].indexOf(currentMode) >= 0) {
		canvas.setStrokeWidth(1);
		return;
	}
	curProperties.stroke_width = val;

	var elems = [];
	function addNonG (e) {
		if (e.nodeName !== 'g') {
			elems.push(e);
		}
	}
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName === 'g') {
				svgedit.utilities.walkTree(elem, addNonG);
			} else {
				elems.push(elem);
			}
		}
	}
	if (elems.length > 0) {
		changeSelectedAttribute('stroke-width', val, elems);
		call('changed', selectedElements);
	}
};

// Function: setStrokeAttr
// Set the given stroke-related attribute the given value for selected elements
//
// Parameters:
// attr - String with the attribute name
// val - String or number with the attribute value
this.setStrokeAttr = function (attr, val) {
	curShape[attr.replace('-', '_')] = val;
	var elems = [];

	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem) {
			if (elem.tagName === 'g') {
				svgedit.utilities.walkTree(elem, function (e) { if (e.nodeName !== 'g') { elems.push(e); } });
			} else {
				elems.push(elem);
			}
		}
	}
	if (elems.length > 0) {
		changeSelectedAttribute(attr, val, elems);
		call('changed', selectedElements);
	}
};

// Function: getStyle
// Returns current style options
this.getStyle = function () {
	return curShape;
};

// Function: getOpacity
// Returns the current opacity
this.getOpacity = function () {
	return curShape.opacity;
};

// Function: setOpacity
// Sets the given opacity to the current selected elements
this.setOpacity = function (val) {
	curShape.opacity = val;
	changeSelectedAttribute('opacity', val);
};

// Function: getOpacity
// Returns the current fill opacity
this.getFillOpacity = function () {
	return curShape.fill_opacity;
};

// Function: getStrokeOpacity
// Returns the current stroke opacity
this.getStrokeOpacity = function () {
	return curShape.stroke_opacity;
};

// Function: setPaintOpacity
// Sets the current fill/stroke opacity
//
// Parameters:
// type - String with "fill" or "stroke"
// val - Float with the new opacity value
// preventUndo - Boolean indicating whether or not this should be an undoable action
this.setPaintOpacity = function (type, val, preventUndo) {
	curShape[type + '_opacity'] = val;
	if (!preventUndo) {
		changeSelectedAttribute(type + '-opacity', val);
	} else {
		changeSelectedAttributeNoUndo(type + '-opacity', val);
	}
};

// Function: getPaintOpacity
// Gets the current fill/stroke opacity
//
// Parameters:
// type - String with "fill" or "stroke"
this.getPaintOpacity = function (type) {
	return type === 'fill' ? this.getFillOpacity() : this.getStrokeOpacity();
};

// Function: getBlur
// Gets the stdDeviation blur value of the given element
//
// Parameters:
// elem - The element to check the blur value for
this.getBlur = function (elem) {
	var val = 0;
	// var elem = selectedElements[0];

	if (elem) {
		var filterUrl = elem.getAttribute('filter');
		if (filterUrl) {
			var blur = svgedit.utilities.getElem(elem.id + '_blur');
			if (blur) {
				val = blur.firstChild.getAttribute('stdDeviation');
			}
		}
	}
	return val;
};

(function () {
var curCommand = null;
var filter = null;
var filterHidden = false;

// Function: setBlurNoUndo
// Sets the stdDeviation blur value on the selected element without being undoable
//
// Parameters:
// val - The new stdDeviation value
canvas.setBlurNoUndo = function (val) {
	if (!filter) {
		canvas.setBlur(val);
		return;
	}
	if (val === 0) {
		// Don't change the StdDev, as that will hide the element.
		// Instead, just remove the value for "filter"
		changeSelectedAttributeNoUndo('filter', '');
		filterHidden = true;
	} else {
		var elem = selectedElements[0];
		if (filterHidden) {
			changeSelectedAttributeNoUndo('filter', 'url(#' + elem.id + '_blur)');
		}
		if (svgedit.browser.isWebkit()) {
			console.log('e', elem);
			elem.removeAttribute('filter');
			elem.setAttribute('filter', 'url(#' + elem.id + '_blur)');
		}
		changeSelectedAttributeNoUndo('stdDeviation', val, [filter.firstChild]);
		canvas.setBlurOffsets(filter, val);
	}
};

function finishChange () {
	var bCmd = canvas.undoMgr.finishUndoableChange();
	curCommand.addSubCommand(bCmd);
	addCommandToHistory(curCommand);
	curCommand = null;
	filter = null;
}

// Function: setBlurOffsets
// Sets the x, y, with, height values of the filter element in order to
// make the blur not be clipped. Removes them if not neeeded
//
// Parameters:
// filter - The filter DOM element to update
// stdDev - The standard deviation value on which to base the offset size
canvas.setBlurOffsets = function (filter, stdDev) {
	if (stdDev > 3) {
		// TODO: Create algorithm here where size is based on expected blur
		svgedit.utilities.assignAttributes(filter, {
			x: '-50%',
			y: '-50%',
			width: '200%',
			height: '200%'
		}, 100);
	} else {
		// Removing these attributes hides text in Chrome (see Issue 579)
		if (!svgedit.browser.isWebkit()) {
			filter.removeAttribute('x');
			filter.removeAttribute('y');
			filter.removeAttribute('width');
			filter.removeAttribute('height');
		}
	}
};

// Function: setBlur
// Adds/updates the blur filter to the selected element
//
// Parameters:
// val - Float with the new stdDeviation blur value
// complete - Boolean indicating whether or not the action should be completed (to add to the undo manager)
canvas.setBlur = function (val, complete) {
	if (curCommand) {
		finishChange();
		return;
	}

	// Looks for associated blur, creates one if not found
	var elem = selectedElements[0];
	var elemId = elem.id;
	filter = svgedit.utilities.getElem(elemId + '_blur');

	val -= 0;

	var batchCmd = new svgedit.history.BatchCommand();

	// Blur found!
	if (filter) {
		if (val === 0) {
			filter = null;
		}
	} else {
		// Not found, so create
		var newblur = addSvgElementFromJson({ 'element': 'feGaussianBlur',
			'attr': {
				'in': 'SourceGraphic',
				'stdDeviation': val
			}
		});

		filter = addSvgElementFromJson({ 'element': 'filter',
			'attr': {
				'id': elemId + '_blur'
			}
		});

		filter.appendChild(newblur);
		svgedit.utilities.findDefs().appendChild(filter);

		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(filter));
	}

	var changes = {filter: elem.getAttribute('filter')};

	if (val === 0) {
		elem.removeAttribute('filter');
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, changes));
		return;
	}

	changeSelectedAttribute('filter', 'url(#' + elemId + '_blur)');
	batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, changes));
	canvas.setBlurOffsets(filter, val);

	curCommand = batchCmd;
	canvas.undoMgr.beginUndoableChange('stdDeviation', [filter ? filter.firstChild : null]);
	if (complete) {
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
this.getBold = function () {
	// should only have one element selected
	var selected = selectedElements[0];
	if (selected != null && selected.tagName === 'text' &&
		selectedElements[1] == null) {
		return (selected.getAttribute('font-weight') === 'bold');
	}
	return false;
};

// Function: setBold
// Make the selected element bold or normal
//
// Parameters:
// b - Boolean indicating bold (true) or normal (false)
this.setBold = function (b) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName === 'text' &&
		selectedElements[1] == null) {
		changeSelectedAttribute('font-weight', b ? 'bold' : 'normal');
	}
	if (!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getItalic
// Check whether selected element is italic or not
//
// Returns:
// Boolean indicating whether or not element is italic
this.getItalic = function () {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName === 'text' &&
		selectedElements[1] == null) {
		return (selected.getAttribute('font-style') === 'italic');
	}
	return false;
};

// Function: setItalic
// Make the selected element italic or normal
//
// Parameters:
// b - Boolean indicating italic (true) or normal (false)
this.setItalic = function (i) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName === 'text' &&
		selectedElements[1] == null) {
		changeSelectedAttribute('font-style', i ? 'italic' : 'normal');
	}
	if (!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getFontFamily
// Returns the current font family
this.getFontFamily = function () {
	return curText.font_family;
};

// Function: setFontFamily
// Set the new font family
//
// Parameters:
// val - String with the new font family
this.setFontFamily = function (val) {
	curText.font_family = val;
	changeSelectedAttribute('font-family', val);
	if (selectedElements[0] && !selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: setFontColor
// Set the new font color
//
// Parameters:
// val - String with the new font color
this.setFontColor = function (val) {
	curText.fill = val;
	changeSelectedAttribute('fill', val);
};

// Function: getFontColor
// Returns the current font color
this.getFontColor = function () {
	return curText.fill;
};

// Function: getFontSize
// Returns the current font size
this.getFontSize = function () {
	return curText.font_size;
};

// Function: setFontSize
// Applies the given font size to the selected element
//
// Parameters:
// val - Float with the new font size
this.setFontSize = function (val) {
	curText.font_size = val;
	changeSelectedAttribute('font-size', val);
	if (!selectedElements[0].textContent) {
		textActions.setCursor();
	}
};

// Function: getText
// Returns the current text (textContent) of the selected element
this.getText = function () {
	var selected = selectedElements[0];
	if (selected == null) { return ''; }
	return selected.textContent;
};

// Function: setTextContent
// Updates the text element with the given string
//
// Parameters:
// val - String with the new text
this.setTextContent = function (val) {
	changeSelectedAttribute('#text', val);
	textActions.init(val);
	textActions.setCursor();
};

// Function: setImageURL
// Sets the new image URL for the selected image element. Updates its size if
// a new URL is given
//
// Parameters:
// val - String with the image URL/path
this.setImageURL = function (val) {
	var elem = selectedElements[0];
	if (!elem) { return; }

	var attrs = $(elem).attr(['width', 'height']);
	var setsize = (!attrs.width || !attrs.height);

	var curHref = getHref(elem);

	// Do nothing if no URL change or size change
	if (curHref !== val) {
		setsize = true;
	} else if (!setsize) { return; }

	var batchCmd = new svgedit.history.BatchCommand('Change Image URL');

	setHref(elem, val);
	batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, {
		'#href': curHref
	}));

	if (setsize) {
		$(new Image()).load(function () {
			var changes = $(elem).attr(['width', 'height']);

			$(elem).attr({
				width: this.width,
				height: this.height
			});

			selectorManager.requestSelector(elem).resize();

			batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, changes));
			addCommandToHistory(batchCmd);
			call('changed', [elem]);
		}).attr('src', val);
	} else {
		addCommandToHistory(batchCmd);
	}
};

// Function: setLinkURL
// Sets the new link URL for the selected anchor element.
//
// Parameters:
// val - String with the link URL/path
this.setLinkURL = function (val) {
	var elem = selectedElements[0];
	if (!elem) { return; }
	if (elem.tagName !== 'a') {
		// See if parent is an anchor
		var parentsA = $(elem).parents('a');
		if (parentsA.length) {
			elem = parentsA[0];
		} else {
			return;
		}
	}

	var curHref = getHref(elem);

	if (curHref === val) { return; }

	var batchCmd = new svgedit.history.BatchCommand('Change Link URL');

	setHref(elem, val);
	batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(elem, {
		'#href': curHref
	}));

	addCommandToHistory(batchCmd);
};

// Function: setRectRadius
// Sets the rx & ry values to the selected rect element to change its corner radius
//
// Parameters:
// val - The new radius
this.setRectRadius = function (val) {
	var selected = selectedElements[0];
	if (selected != null && selected.tagName === 'rect') {
		var r = selected.getAttribute('rx');
		if (r !== String(val)) {
			selected.setAttribute('rx', val);
			selected.setAttribute('ry', val);
			addCommandToHistory(new svgedit.history.ChangeElementCommand(selected, {'rx': r, 'ry': r}, 'Radius'));
			call('changed', [selected]);
		}
	}
};

// Function: makeHyperlink
// Wraps the selected element(s) in an anchor element or converts group to one
this.makeHyperlink = function (url) {
	canvas.groupSelectedElements('a', url);

	// TODO: If element is a single "g", convert to "a"
	//	if (selectedElements.length > 1 && selectedElements[1]) {
};

// Function: removeHyperlink
this.removeHyperlink = function () {
	canvas.ungroupSelectedElement();
};

// Group: Element manipulation

// Function: setSegType
// Sets the new segment type to the selected segment(s).
//
// Parameters:
// new_type - Integer with the new segment type
// See http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg for list
this.setSegType = function (newType) {
	pathActions.setSegType(newType);
};

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
this.convertToPath = function (elem, getBBox) {
	if (elem == null) {
		var elems = selectedElements;
		$.each(elems, function (i, elem) {
			if (elem) { canvas.convertToPath(elem); }
		});
		return;
	}
	if (getBBox) {
		return svgedit.utilities.getBBoxOfElementAsPath(elem, addSvgElementFromJson, pathActions);
	} else {
		// TODO: Why is this applying attributes from curShape, then inside utilities.convertToPath it's pulling addition attributes from elem?
		// TODO: If convertToPath is called with one elem, curShape and elem are probably the same; but calling with multiple is a bug or cool feature.
		var attrs = {
			'fill': curShape.fill,
			'fill-opacity': curShape.fill_opacity,
			'stroke': curShape.stroke,
			'stroke-width': curShape.stroke_width,
			'stroke-dasharray': curShape.stroke_dasharray,
			'stroke-linejoin': curShape.stroke_linejoin,
			'stroke-linecap': curShape.stroke_linecap,
			'stroke-opacity': curShape.stroke_opacity,
			'opacity': curShape.opacity,
			'visibility': 'hidden'
		};
		return svgedit.utilities.convertToPath(elem, attrs, addSvgElementFromJson, pathActions, clearSelection, addToSelection, svgedit.history, addCommandToHistory);
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
var changeSelectedAttributeNoUndo = function (attr, newValue, elems) {
	if (currentMode === 'pathedit') {
		// Editing node
		pathActions.moveNode(attr, newValue);
	}
	elems = elems || selectedElements;
	var i = elems.length;
	var noXYElems = ['g', 'polyline', 'path'];
	var goodGAttrs = ['transform', 'opacity', 'filter'];

	while (i--) {
		var elem = elems[i];
		if (elem == null) { continue; }

		// Set x,y vals on elements that don't have them
		if ((attr === 'x' || attr === 'y') && noXYElems.indexOf(elem.tagName) >= 0) {
			var bbox = getStrokedBBox([elem]);
			var diffX = attr === 'x' ? newValue - bbox.x : 0;
			var diffY = attr === 'y' ? newValue - bbox.y : 0;
			canvas.moveSelectedElements(diffX * currentZoom, diffY * currentZoom, true);
			continue;
		}

		// only allow the transform/opacity/filter attribute to change on <g> elements, slightly hacky
		// TODO: FIXME: This doesn't seem right. Where's the body of this if statement?
		if (elem.tagName === 'g' && goodGAttrs.indexOf(attr) >= 0) {}
		var oldval = attr === '#text' ? elem.textContent : elem.getAttribute(attr);
		if (oldval == null) { oldval = ''; }
		if (oldval !== String(newValue)) {
			if (attr === '#text') {
				// var oldW = svgedit.utilities.getBBox(elem).width;
				elem.textContent = newValue;

				// FF bug occurs on on rotated elements
				if ((/rotate/).test(elem.getAttribute('transform'))) {
					elem = ffClone(elem);
				}
				// Hoped to solve the issue of moving text with text-anchor="start",
				// but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
				// var box = getBBox(elem), left = box.x, top = box.y, width = box.width,
				// 	height = box.height, dx = width - oldW, dy = 0;
				// var angle = svgedit.utilities.getRotationAngle(elem, true);
				// if (angle) {
				// 	var r = Math.sqrt(dx * dx + dy * dy);
				// 	var theta = Math.atan2(dy, dx) - angle;
				// 	dx = r * Math.cos(theta);
				// 	dy = r * Math.sin(theta);
				//
				// 	elem.setAttribute('x', elem.getAttribute('x') - dx);
				// 	elem.setAttribute('y', elem.getAttribute('y') - dy);
				// }
			} else if (attr === '#href') {
				setHref(elem, newValue);
			} else { elem.setAttribute(attr, newValue); }

			// Go into "select" mode for text changes
			// NOTE: Important that this happens AFTER elem.setAttribute() or else attributes like
			// font-size can get reset to their old value, ultimately by svgEditor.updateContextPanel(),
			// after calling textActions.toSelectMode() below
			if (currentMode === 'textedit' && attr !== '#text' && elem.textContent.length) {
				textActions.toSelectMode(elem);
			}

			// if (i === 0) {
			// 	selectedBBoxes[0] = svgedit.utilities.getBBox(elem);
			// }

			// Use the Firefox ffClone hack for text elements with gradients or
			// where other text attributes are changed.
			if (svgedit.browser.isGecko() && elem.nodeName === 'text' && (/rotate/).test(elem.getAttribute('transform'))) {
				if (String(newValue).indexOf('url') === 0 || (['font-size', 'font-family', 'x', 'y'].indexOf(attr) >= 0 && elem.textContent)) {
					elem = ffClone(elem);
				}
			}
			// Timeout needed for Opera & Firefox
			// codedread: it is now possible for this function to be called with elements
			// that are not in the selectedElements array, we need to only request a
			// selector if the element is in that array
			if (selectedElements.indexOf(elem) >= 0) {
				setTimeout(function () {
					// Due to element replacement, this element may no longer
					// be part of the DOM
					if (!elem.parentNode) { return; }
					selectorManager.requestSelector(elem).resize();
				}, 0);
			}
			// if this element was rotated, and we changed the position of this element
			// we need to update the rotational transform attribute
			var angle = svgedit.utilities.getRotationAngle(elem);
			if (angle !== 0 && attr !== 'transform') {
				var tlist = svgedit.transformlist.getTransformList(elem);
				var n = tlist.numberOfItems;
				while (n--) {
					var xform = tlist.getItem(n);
					if (xform.type === 4) {
						// remove old rotate
						tlist.removeItem(n);

						var box = svgedit.utilities.getBBox(elem);
						var center = svgedit.math.transformPoint(box.x + box.width / 2, box.y + box.height / 2, svgedit.math.transformListToTransform(tlist).matrix);
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
var changeSelectedAttribute = this.changeSelectedAttribute = function (attr, val, elems) {
	elems = elems || selectedElements;
	canvas.undoMgr.beginUndoableChange(attr, elems);
	// var i = elems.length;

	changeSelectedAttributeNoUndo(attr, val, elems);

	var batchCmd = canvas.undoMgr.finishUndoableChange();
	if (!batchCmd.isEmpty()) {
		addCommandToHistory(batchCmd);
	}
};

// Function: deleteSelectedElements
// Removes all selected elements from the DOM and adds the change to the
// history stack
this.deleteSelectedElements = function () {
	var i;
	var batchCmd = new svgedit.history.BatchCommand('Delete Elements');
	var len = selectedElements.length;
	var selectedCopy = []; // selectedElements is being deleted

	for (i = 0; i < len; ++i) {
		var selected = selectedElements[i];
		if (selected == null) { break; }

		var parent = selected.parentNode;
		var t = selected;

		// this will unselect the element and remove the selectedOutline
		selectorManager.releaseSelector(t);

		// Remove the path if present.
		svgedit.path.removePath_(t.id);

		// Get the parent if it's a single-child anchor
		if (parent.tagName === 'a' && parent.childNodes.length === 1) {
			t = parent;
			parent = parent.parentNode;
		}

		var nextSibling = t.nextSibling;
		var elem = parent.removeChild(t);
		selectedCopy.push(selected); // for the copy
		batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
	}
	selectedElements = [];

	if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }
	call('changed', selectedCopy);
	clearSelection();
};

// Function: cutSelectedElements
// Removes all selected elements from the DOM and adds the change to the
// history stack. Remembers removed elements on the clipboard
this.cutSelectedElements = function () {
	svgCanvas.copySelectedElements();
	svgCanvas.deleteSelectedElements();
};

// Function: copySelectedElements
// Remembers the current selected elements on the clipboard
this.copySelectedElements = function () {
	localStorage.setItem('svgedit_clipboard', JSON.stringify(
		selectedElements.map(function (x) { return getJsonFromSvgElement(x); })
	));

	$('#cmenu_canvas').enableContextMenuItems('#paste,#paste_in_place');
};

this.pasteElements = function (type, x, y) {
	var cb = JSON.parse(localStorage.getItem('svgedit_clipboard'));
	var len = cb.length;
	if (!len) { return; }

	var pasted = [];
	var batchCmd = new svgedit.history.BatchCommand('Paste elements');
	// var drawing = getCurrentDrawing();
	var changedIDs = {};

	// Recursively replace IDs and record the changes
	function checkIDs (elem) {
		if (elem.attr && elem.attr.id) {
			changedIDs[elem.attr.id] = getNextId();
			elem.attr.id = changedIDs[elem.attr.id];
		}
		if (elem.children) elem.children.forEach(checkIDs);
	}
	cb.forEach(checkIDs);

	// Give extensions like the connector extension a chance to reflect new IDs and remove invalid elements
	runExtensions('IDsUpdated', {elems: cb, changes: changedIDs}, true).forEach(function (extChanges) {
		if (!extChanges || !('remove' in extChanges)) return;

		extChanges.remove.forEach(function (removeID) {
			cb = cb.filter(function (cbItem) {
				return cbItem.attr.id !== removeID;
			});
		});
	});

	// Move elements to lastClickPoint
	while (len--) {
		var elem = cb[len];
		if (!elem) { continue; }

		var copy = addSvgElementFromJson(elem);
		pasted.push(copy);
		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(copy));

		restoreRefElems(copy);
	}

	selectOnly(pasted);

	if (type !== 'in_place') {
		var ctrX, ctrY;

		if (!type) {
			ctrX = lastClickPoint.x;
			ctrY = lastClickPoint.y;
		} else if (type === 'point') {
			ctrX = x;
			ctrY = y;
		}

		var bbox = getStrokedBBox(pasted);
		var cx = ctrX - (bbox.x + bbox.width / 2),
			cy = ctrY - (bbox.y + bbox.height / 2),
			dx = [],
			dy = [];

		$.each(pasted, function (i, item) {
			dx.push(cx);
			dy.push(cy);
		});

		var cmd = canvas.moveSelectedElements(dx, dy, false);
		if (cmd) batchCmd.addSubCommand(cmd);
	}

	addCommandToHistory(batchCmd);
	call('changed', pasted);
};

// Function: groupSelectedElements
// Wraps all the selected elements in a group (g) element

// Parameters:
// type - type of element to group into, defaults to <g>
this.groupSelectedElements = function (type, urlArg) {
	if (!type) { type = 'g'; }
	var cmdStr = '';

	switch (type) {
	case 'a':
		cmdStr = 'Make hyperlink';
		var url = '';
		if (arguments.length > 1) {
			url = urlArg;
		}
		break;
	default:
		type = 'g';
		cmdStr = 'Group Elements';
		break;
	}

	var batchCmd = new svgedit.history.BatchCommand(cmdStr);

	// create and insert the group element
	var g = addSvgElementFromJson({
		'element': type,
		'attr': {
			'id': getNextId()
		}
	});
	if (type === 'a') {
		setHref(g, url);
	}
	batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(g));

	// now move all children into the group
	var i = selectedElements.length;
	while (i--) {
		var elem = selectedElements[i];
		if (elem == null) { continue; }

		if (elem.parentNode.tagName === 'a' && elem.parentNode.childNodes.length === 1) {
			elem = elem.parentNode;
		}

		var oldNextSibling = elem.nextSibling;
		var oldParent = elem.parentNode;
		g.appendChild(elem);
		batchCmd.addSubCommand(new svgedit.history.MoveElementCommand(elem, oldNextSibling, oldParent));
	}
	if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }

	// update selection
	selectOnly([g], true);
};

// Function: pushGroupProperties
// Pushes all appropriate parent group properties down to its children, then
// removes them from the group
var pushGroupProperties = this.pushGroupProperties = function (g, undoable) {
	var children = g.childNodes;
	var len = children.length;
	var xform = g.getAttribute('transform');

	var glist = svgedit.transformlist.getTransformList(g);
	var m = svgedit.math.transformListToTransform(glist).matrix;

	var batchCmd = new svgedit.history.BatchCommand('Push group properties');

	// TODO: get all fill/stroke properties from the group that we are about to destroy
	// "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset",
	// "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
	// "stroke-width"
	// and then for each child, if they do not have the attribute (or the value is 'inherit')
	// then set the child's attribute

	var i = 0;
	var gangle = svgedit.utilities.getRotationAngle(g);

	var gattrs = $(g).attr(['filter', 'opacity']);
	var gfilter, gblur, changes;
	var drawing = getCurrentDrawing();

	for (i = 0; i < len; i++) {
		var elem = children[i];

		if (elem.nodeType !== 1) { continue; }

		if (gattrs.opacity !== null && gattrs.opacity !== 1) {
			// var c_opac = elem.getAttribute('opacity') || 1;
			var newOpac = Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100) / 100;
			changeSelectedAttribute('opacity', newOpac, [elem]);
		}

		if (gattrs.filter) {
			var cblur = this.getBlur(elem);
			var origCblur = cblur;
			if (!gblur) { gblur = this.getBlur(g); }
			if (cblur) {
				// Is this formula correct?
				cblur = Number(gblur) + Number(cblur);
			} else if (cblur === 0) {
				cblur = gblur;
			}

			// If child has no current filter, get group's filter or clone it.
			if (!origCblur) {
				// Set group's filter to use first child's ID
				if (!gfilter) {
					gfilter = svgedit.utilities.getRefElem(gattrs.filter);
				} else {
					// Clone the group's filter
					gfilter = drawing.copyElem(gfilter);
					svgedit.utilities.findDefs().appendChild(gfilter);
				}
			} else {
				gfilter = svgedit.utilities.getRefElem(elem.getAttribute('filter'));
			}

			// Change this in future for different filters
			var suffix = (gfilter.firstChild.tagName === 'feGaussianBlur') ? 'blur' : 'filter';
			gfilter.id = elem.id + '_' + suffix;
			changeSelectedAttribute('filter', 'url(#' + gfilter.id + ')', [elem]);

			// Update blur value
			if (cblur) {
				changeSelectedAttribute('stdDeviation', cblur, [gfilter.firstChild]);
				canvas.setBlurOffsets(gfilter, cblur);
			}
		}

		var chtlist = svgedit.transformlist.getTransformList(elem);

		// Don't process gradient transforms
		if (~elem.tagName.indexOf('Gradient')) { chtlist = null; }

		// Hopefully not a problem to add this. Necessary for elements like <desc/>
		if (!chtlist) { continue; }

		// Apparently <defs> can get get a transformlist, but we don't want it to have one!
		if (elem.tagName === 'defs') { continue; }

		if (glist.numberOfItems) {
			// TODO: if the group's transform is just a rotate, we can always transfer the
			// rotate() down to the children (collapsing consecutive rotates and factoring
			// out any translates)
			if (gangle && glist.numberOfItems === 1) {
				// [Rg] [Rc] [Mc]
				// we want [Tr] [Rc2] [Mc] where:
				//	- [Rc2] is at the child's current center but has the
				// sum of the group and child's rotation angles
				//	- [Tr] is the equivalent translation that this child
				// undergoes if the group wasn't there

				// [Tr] = [Rg] [Rc] [Rc2_inv]

				// get group's rotation matrix (Rg)
				var rgm = glist.getItem(0).matrix;

				// get child's rotation matrix (Rc)
				var rcm = svgroot.createSVGMatrix();
				var cangle = svgedit.utilities.getRotationAngle(elem);
				if (cangle) {
					rcm = chtlist.getItem(0).matrix;
				}

				// get child's old center of rotation
				var cbox = svgedit.utilities.getBBox(elem);
				var ceqm = svgedit.math.transformListToTransform(chtlist).matrix;
				var coldc = svgedit.math.transformPoint(cbox.x + cbox.width / 2, cbox.y + cbox.height / 2, ceqm);

				// sum group and child's angles
				var sangle = gangle + cangle;

				// get child's rotation at the old center (Rc2_inv)
				var r2 = svgroot.createSVGTransform();
				r2.setRotate(sangle, coldc.x, coldc.y);

				// calculate equivalent translate
				var trm = svgedit.math.matrixMultiply(rgm, rcm, r2.matrix.inverse());

				// set up tlist
				if (cangle) {
					chtlist.removeItem(0);
				}

				if (sangle) {
					if (chtlist.numberOfItems) {
						chtlist.insertItemBefore(r2, 0);
					} else {
						chtlist.appendItem(r2);
					}
				}

				if (trm.e || trm.f) {
					var tr = svgroot.createSVGTransform();
					tr.setTranslate(trm.e, trm.f);
					if (chtlist.numberOfItems) {
						chtlist.insertItemBefore(tr, 0);
					} else {
						chtlist.appendItem(tr);
					}
				}
			} else { // more complicated than just a rotate
				// transfer the group's transform down to each child and then
				// call svgedit.recalculate.recalculateDimensions()
				var oldxform = elem.getAttribute('transform');
				changes = {};
				changes.transform = oldxform || '';

				var newxform = svgroot.createSVGTransform();

				// [ gm ] [ chm ] = [ chm ] [ gm' ]
				// [ gm' ] = [ chmInv ] [ gm ] [ chm ]
				var chm = svgedit.math.transformListToTransform(chtlist).matrix,
					chmInv = chm.inverse();
				var gm = svgedit.math.matrixMultiply(chmInv, m, chm);
				newxform.setMatrix(gm);
				chtlist.appendItem(newxform);
			}
			var cmd = svgedit.recalculate.recalculateDimensions(elem);
			if (cmd) { batchCmd.addSubCommand(cmd); }
		}
	}

	// remove transform and make it undo-able
	if (xform) {
		changes = {};
		changes.transform = xform;
		g.setAttribute('transform', '');
		g.removeAttribute('transform');
		batchCmd.addSubCommand(new svgedit.history.ChangeElementCommand(g, changes));
	}

	if (undoable && !batchCmd.isEmpty()) {
		return batchCmd;
	}
};

// Function: ungroupSelectedElement
// Unwraps all the elements in a selected group (g) element. This requires
// significant recalculations to apply group's transforms, etc to its children
this.ungroupSelectedElement = function () {
	var g = selectedElements[0];
	if (!g) {
		return;
	}
	if ($(g).data('gsvg') || $(g).data('symbol')) {
		// Is svg, so actually convert to group
		convertToGroup(g);
		return;
	}
	if (g.tagName === 'use') {
		// Somehow doesn't have data set, so retrieve
		var symbol = svgedit.utilities.getElem(getHref(g).substr(1));
		$(g).data('symbol', symbol).data('ref', symbol);
		convertToGroup(g);
		return;
	}
	var parentsA = $(g).parents('a');
	if (parentsA.length) {
		g = parentsA[0];
	}

	// Look for parent "a"
	if (g.tagName === 'g' || g.tagName === 'a') {
		var batchCmd = new svgedit.history.BatchCommand('Ungroup Elements');
		var cmd = pushGroupProperties(g, true);
		if (cmd) { batchCmd.addSubCommand(cmd); }

		var parent = g.parentNode;
		var anchor = g.nextSibling;
		var children = new Array(g.childNodes.length);

		var i = 0;

		while (g.firstChild) {
			var elem = g.firstChild;
			var oldNextSibling = elem.nextSibling;
			var oldParent = elem.parentNode;

			// Remove child title elements
			if (elem.tagName === 'title') {
				var nextSibling = elem.nextSibling;
				batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(elem, nextSibling, oldParent));
				oldParent.removeChild(elem);
				continue;
			}

			children[i++] = elem = parent.insertBefore(elem, anchor);
			batchCmd.addSubCommand(new svgedit.history.MoveElementCommand(elem, oldNextSibling, oldParent));
		}

		// remove the group from the selection
		clearSelection();

		// delete the group element (but make undo-able)
		var gNextSibling = g.nextSibling;
		g = parent.removeChild(g);
		batchCmd.addSubCommand(new svgedit.history.RemoveElementCommand(g, gNextSibling, parent));

		if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }

		// update selection
		addToSelection(children);
	}
};

// Function: moveToTopSelectedElement
// Repositions the selected element to the bottom in the DOM to appear on top of
// other elements
this.moveToTopSelectedElement = function () {
	var selected = selectedElements[0];
	if (selected != null) {
		var t = selected;
		var oldParent = t.parentNode;
		var oldNextSibling = t.nextSibling;
		t = t.parentNode.appendChild(t);
		// If the element actually moved position, add the command and fire the changed
		// event handler.
		if (oldNextSibling !== t.nextSibling) {
			addCommandToHistory(new svgedit.history.MoveElementCommand(t, oldNextSibling, oldParent, 'top'));
			call('changed', [t]);
		}
	}
};

// Function: moveToBottomSelectedElement
// Repositions the selected element to the top in the DOM to appear under
// other elements
this.moveToBottomSelectedElement = function () {
	var selected = selectedElements[0];
	if (selected != null) {
		var t = selected;
		var oldParent = t.parentNode;
		var oldNextSibling = t.nextSibling;
		var firstChild = t.parentNode.firstChild;
		if (firstChild.tagName === 'title') {
			firstChild = firstChild.nextSibling;
		}
		// This can probably be removed, as the defs should not ever apppear
		// inside a layer group
		if (firstChild.tagName === 'defs') {
			firstChild = firstChild.nextSibling;
		}
		t = t.parentNode.insertBefore(t, firstChild);
		// If the element actually moved position, add the command and fire the changed
		// event handler.
		if (oldNextSibling !== t.nextSibling) {
			addCommandToHistory(new svgedit.history.MoveElementCommand(t, oldNextSibling, oldParent, 'bottom'));
			call('changed', [t]);
		}
	}
};

// Function: moveUpDownSelected
// Moves the select element up or down the stack, based on the visibly
// intersecting elements
//
// Parameters:
// dir - String that's either 'Up' or 'Down'
this.moveUpDownSelected = function (dir) {
	var selected = selectedElements[0];
	if (!selected) { return; }

	curBBoxes = [];
	var closest, foundCur;
	// jQuery sorts this list
	var list = $(getIntersectionList(getStrokedBBox([selected]))).toArray();
	if (dir === 'Down') { list.reverse(); }

	$.each(list, function () {
		if (!foundCur) {
			if (this === selected) {
				foundCur = true;
			}
			return;
		}
		closest = this;
		return false;
	});
	if (!closest) { return; }

	var t = selected;
	var oldParent = t.parentNode;
	var oldNextSibling = t.nextSibling;
	$(closest)[dir === 'Down' ? 'before' : 'after'](t);
	// If the element actually moved position, add the command and fire the changed
	// event handler.
	if (oldNextSibling !== t.nextSibling) {
		addCommandToHistory(new svgedit.history.MoveElementCommand(t, oldNextSibling, oldParent, 'Move ' + dir));
		call('changed', [t]);
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
this.moveSelectedElements = function (dx, dy, undoable) {
	// if undoable is not sent, default to true
	// if single values, scale them to the zoom
	if (dx.constructor !== Array) {
		dx /= currentZoom;
		dy /= currentZoom;
	}
	undoable = undoable || true;
	var batchCmd = new svgedit.history.BatchCommand('position');
	var i = selectedElements.length;
	while (i--) {
		var selected = selectedElements[i];
		if (selected != null) {
			// if (i === 0) {
			// 	selectedBBoxes[0] = svgedit.utilities.getBBox(selected);
			// }
			// var b = {};
			// for (var j in selectedBBoxes[i]) b[j] = selectedBBoxes[i][j];
			// selectedBBoxes[i] = b;

			var xform = svgroot.createSVGTransform();
			var tlist = svgedit.transformlist.getTransformList(selected);

			// dx and dy could be arrays
			if (dx.constructor === Array) {
				// if (i === 0) {
				// 	selectedBBoxes[0].x += dx[0];
				// 	selectedBBoxes[0].y += dy[0];
				// }
				xform.setTranslate(dx[i], dy[i]);
			} else {
				// if (i === 0) {
				// 	selectedBBoxes[0].x += dx;
				// 	selectedBBoxes[0].y += dy;
				// }
				xform.setTranslate(dx, dy);
			}

			if (tlist.numberOfItems) {
				tlist.insertItemBefore(xform, 0);
			} else {
				tlist.appendItem(xform);
			}

			var cmd = svgedit.recalculate.recalculateDimensions(selected);
			if (cmd) {
				batchCmd.addSubCommand(cmd);
			}

			selectorManager.requestSelector(selected).resize();
		}
	}
	if (!batchCmd.isEmpty()) {
		if (undoable) {
			addCommandToHistory(batchCmd);
		}
		call('changed', selectedElements);
		return batchCmd;
	}
};

// Function: cloneSelectedElements
// Create deep DOM copies (clones) of all selected elements and move them slightly
// from their originals
this.cloneSelectedElements = function (x, y) {
	var i, elem;
	var batchCmd = new svgedit.history.BatchCommand('Clone Elements');
	// find all the elements selected (stop at first null)
	var len = selectedElements.length;
	function sortfunction (a, b) {
		return ($(b).index() - $(a).index()); // causes an array to be sorted numerically and ascending
	}
	selectedElements.sort(sortfunction);
	for (i = 0; i < len; ++i) {
		elem = selectedElements[i];
		if (elem == null) { break; }
	}
	// use slice to quickly get the subset of elements we need
	var copiedElements = selectedElements.slice(0, i);
	this.clearSelection(true);
	// note that we loop in the reverse way because of the way elements are added
	// to the selectedElements array (top-first)
	var drawing = getCurrentDrawing();
	i = copiedElements.length;
	while (i--) {
		// clone each element and replace it within copiedElements
		elem = copiedElements[i] = drawing.copyElem(copiedElements[i]);
		(currentGroup || drawing.getCurrentLayer()).appendChild(elem);
		batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(elem));
	}

	if (!batchCmd.isEmpty()) {
		addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
		this.moveSelectedElements(x, y, false);
		addCommandToHistory(batchCmd);
	}
};

// Function: alignSelectedElements
// Aligns selected elements
//
// Parameters:
// type - String with single character indicating the alignment type
// relativeTo - String that must be one of the following:
// "selected", "largest", "smallest", "page"
this.alignSelectedElements = function (type, relativeTo) {
	var i, elem;
	var bboxes = []; // angles = [];
	var minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE, miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
	var curwidth = Number.MIN_VALUE, curheight = Number.MIN_VALUE;
	var len = selectedElements.length;
	if (!len) { return; }
	for (i = 0; i < len; ++i) {
		if (selectedElements[i] == null) { break; }
		elem = selectedElements[i];
		bboxes[i] = getStrokedBBox([elem]);

		// now bbox is axis-aligned and handles rotation
		switch (relativeTo) {
		case 'smallest':
			if (((type === 'l' || type === 'c' || type === 'r') &&
				(curwidth === Number.MIN_VALUE || curwidth > bboxes[i].width)) ||
				((type === 't' || type === 'm' || type === 'b') &&
				(curheight === Number.MIN_VALUE || curheight > bboxes[i].height))
			) {
				minx = bboxes[i].x;
				miny = bboxes[i].y;
				maxx = bboxes[i].x + bboxes[i].width;
				maxy = bboxes[i].y + bboxes[i].height;
				curwidth = bboxes[i].width;
				curheight = bboxes[i].height;
			}
			break;
		case 'largest':
			if (((type === 'l' || type === 'c' || type === 'r') &&
				(curwidth === Number.MIN_VALUE || curwidth < bboxes[i].width)) ||
				((type === 't' || type === 'm' || type === 'b') &&
				(curheight === Number.MIN_VALUE || curheight < bboxes[i].height))
			) {
				minx = bboxes[i].x;
				miny = bboxes[i].y;
				maxx = bboxes[i].x + bboxes[i].width;
				maxy = bboxes[i].y + bboxes[i].height;
				curwidth = bboxes[i].width;
				curheight = bboxes[i].height;
			}
			break;
		default: // 'selected'
			if (bboxes[i].x < minx) { minx = bboxes[i].x; }
			if (bboxes[i].y < miny) { miny = bboxes[i].y; }
			if (bboxes[i].x + bboxes[i].width > maxx) { maxx = bboxes[i].x + bboxes[i].width; }
			if (bboxes[i].y + bboxes[i].height > maxy) { maxy = bboxes[i].y + bboxes[i].height; }
			break;
		}
	} // loop for each element to find the bbox and adjust min/max

	if (relativeTo === 'page') {
		minx = 0;
		miny = 0;
		maxx = canvas.contentW;
		maxy = canvas.contentH;
	}

	var dx = new Array(len);
	var dy = new Array(len);
	for (i = 0; i < len; ++i) {
		if (selectedElements[i] == null) { break; }
		elem = selectedElements[i];
		var bbox = bboxes[i];
		dx[i] = 0;
		dy[i] = 0;
		switch (type) {
		case 'l': // left (horizontal)
			dx[i] = minx - bbox.x;
			break;
		case 'c': // center (horizontal)
			dx[i] = (minx + maxx) / 2 - (bbox.x + bbox.width / 2);
			break;
		case 'r': // right (horizontal)
			dx[i] = maxx - (bbox.x + bbox.width);
			break;
		case 't': // top (vertical)
			dy[i] = miny - bbox.y;
			break;
		case 'm': // middle (vertical)
			dy[i] = (miny + maxy) / 2 - (bbox.y + bbox.height / 2);
			break;
		case 'b': // bottom (vertical)
			dy[i] = maxy - (bbox.y + bbox.height);
			break;
		}
	}
	this.moveSelectedElements(dx, dy);
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
// * oldX - The canvas' old x coordinate
// * oldY - The canvas' old y coordinate
// * d_x - The x position difference
// * d_y - The y position difference
this.updateCanvas = function (w, h) {
	svgroot.setAttribute('width', w);
	svgroot.setAttribute('height', h);
	var bg = $('#canvasBackground')[0];
	var oldX = svgcontent.getAttribute('x');
	var oldY = svgcontent.getAttribute('y');
	var x = (w / 2 - this.contentW * currentZoom / 2);
	var y = (h / 2 - this.contentH * currentZoom / 2);

	svgedit.utilities.assignAttributes(svgcontent, {
		width: this.contentW * currentZoom,
		height: this.contentH * currentZoom,
		'x': x,
		'y': y,
		'viewBox': '0 0 ' + this.contentW + ' ' + this.contentH
	});

	svgedit.utilities.assignAttributes(bg, {
		width: svgcontent.getAttribute('width'),
		height: svgcontent.getAttribute('height'),
		x: x,
		y: y
	});

	var bgImg = svgedit.utilities.getElem('background_image');
	if (bgImg) {
		svgedit.utilities.assignAttributes(bgImg, {
			'width': '100%',
			'height': '100%'
		});
	}

	selectorManager.selectorParentGroup.setAttribute('transform', 'translate(' + x + ',' + y + ')');
	runExtensions('canvasUpdated', {new_x: x, new_y: y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY});
	return {x: x, y: y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY};
};

// Function: setBackground
// Set the background of the editor (NOT the actual document)
//
// Parameters:
// color - String with fill color to apply
// url - URL or path to image to use
this.setBackground = function (color, url) {
	var bg = svgedit.utilities.getElem('canvasBackground');
	var border = $(bg).find('rect')[0];
	var bgImg = svgedit.utilities.getElem('background_image');
	border.setAttribute('fill', color);
	if (url) {
		if (!bgImg) {
			bgImg = svgdoc.createElementNS(NS.SVG, 'image');
			svgedit.utilities.assignAttributes(bgImg, {
				'id': 'background_image',
				'width': '100%',
				'height': '100%',
				'preserveAspectRatio': 'xMinYMin',
				'style': 'pointer-events:none'
			});
		}
		setHref(bgImg, url);
		bg.appendChild(bgImg);
	} else if (bgImg) {
		bgImg.parentNode.removeChild(bgImg);
	}
};

// Function: cycleElement
// Select the next/previous element within the current layer
//
// Parameters:
// next - Boolean where true = next and false = previous element
this.cycleElement = function (next) {
	var num;
	var curElem = selectedElements[0];
	var elem = false;
	var allElems = getVisibleElements(currentGroup || getCurrentDrawing().getCurrentLayer());
	if (!allElems.length) { return; }
	if (curElem == null) {
		num = next ? allElems.length - 1 : 0;
		elem = allElems[num];
	} else {
		var i = allElems.length;
		while (i--) {
			if (allElems[i] === curElem) {
				num = next ? i - 1 : i + 1;
				if (num >= allElems.length) {
					num = 0;
				} else if (num < 0) {
					num = allElems.length - 1;
				}
				elem = allElems[num];
				break;
			}
		}
	}
	selectOnly([elem], true);
	call('selected', selectedElements);
};

this.clear();

// DEPRECATED: getPrivateMethods
// Since all methods are/should be public somehow, this function should be removed

// Being able to access private methods publicly seems wrong somehow,
// but currently appears to be the best way to allow testing and provide
// access to them to plugins.
this.getPrivateMethods = function () {
	var obj = {
		addCommandToHistory: addCommandToHistory,
		setGradient: setGradient,
		addSvgElementFromJson: addSvgElementFromJson,
		assignAttributes: assignAttributes,
		BatchCommand: BatchCommand,
		call: call,
		ChangeElementCommand: ChangeElementCommand,
		copyElem: function (elem) { return getCurrentDrawing().copyElem(elem); },
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
		preventClickDefault: svgedit.utilities.preventClickDefault,
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
	};
	return obj;
};
};
