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


$.SvgCanvas = function(container, config)
{
var isOpera = !!window.opera,
	isWebkit = navigator.userAgent.indexOf("AppleWebKit") != -1,
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


// console.log('Start profiling')
// setTimeout(function() {
// 	canvas.addToSelection(canvas.getVisibleElements());
// 	console.log('Stop profiling')
// },3000);


	uiStrings = {
		"pathNodeTooltip":"Drag node to move it. Double-click node to change segment type",
		"pathCtrlPtTooltip":"Drag control point to adjust curve properties"
	},
	
	curConfig = {
		show_outside_canvas: true,
		dimensions: [640, 480]
	},
	
	toXml = function(str) {
		return $('<p/>').text(str).html();
	},
	
	fromXml = function(str) {
		return $('<p/>').html(str).text();
	};

	if(config) {
		$.extend(curConfig, config);
	}

	var unit_types = {'em':0,'ex':0,'px':1,'cm':35.43307,'mm':3.543307,'in':90,'pt':1.25,'pc':15,'%':0};
	
// These command objects are used for the Undo/Redo stack
// attrs contains the values that the attributes had before the change
function ChangeElementCommand(elem, attrs, text) {
	this.elem = elem;
	this.text = text ? ("Change " + elem.tagName + " " + text) : ("Change " + elem.tagName);
	this.newValues = {};
	this.oldValues = attrs;
	for (var attr in attrs) {
		if (attr == "#text") this.newValues[attr] = elem.textContent;
		else this.newValues[attr] = elem.getAttribute(attr);
	}

	this.apply = function() {
		var bChangedTransform = false;
		for(var attr in this.newValues ) {
			if (this.newValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.newValues[attr];
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
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = canvas.getRotationAngle(elem);
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

	this.unapply = function() {
		var bChangedTransform = false;
		for(var attr in this.oldValues ) {
			if (this.oldValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.oldValues[attr];
				else this.elem.setAttribute(attr, this.oldValues[attr]);
			}
			else {
				if (attr == "#text") this.elem.textContent = "";
				else this.elem.removeAttribute(attr);
			}
			if (attr == "transform") { bChangedTransform = true; }
		}
		// relocate rotational transform, if necessary
		if(!bChangedTransform) {
			var angle = canvas.getRotationAngle(elem);
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

	this.elements = function() { return [this.elem]; }
}

function InsertElementCommand(elem, text) {
	this.elem = elem;
	this.text = text || ("Create " + elem.tagName);
	this.parent = elem.parentNode;

	this.apply = function() { 
		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	this.unapply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.elem.parentNode.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	this.elements = function() { return [this.elem]; };
}

// this is created for an element that has or will be removed from the DOM
// (creating this object does not remove the element from the DOM itself)
function RemoveElementCommand(elem, parent, text) {
	this.elem = elem;
	this.text = text || ("Delete " + elem.tagName);
	this.parent = parent;

	this.apply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.parent.removeChild(this.elem);
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	this.unapply = function() { 
		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
		if (this.parent == svgcontent) {
			identifyLayers();
		}		
	};

	this.elements = function() { return [this.elem]; };
	
	// special hack for webkit: remove this element's entry in the svgTransformLists map
	if (svgTransformLists[elem.id]) {
		delete svgTransformLists[elem.id];
	}

}

function MoveElementCommand(elem, oldNextSibling, oldParent, text) {
	this.elem = elem;
	this.text = text ? ("Move " + elem.tagName + " to " + text) : ("Move " + elem.tagName);
	this.oldNextSibling = oldNextSibling;
	this.oldParent = oldParent;
	this.newNextSibling = elem.nextSibling;
	this.newParent = elem.parentNode;

	this.apply = function() {
		this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);
		if (this.newParent == svgcontent) {
			identifyLayers();
		}
	};

	this.unapply = function() {
		this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
		if (this.oldParent == svgcontent) {
			identifyLayers();
		}
	};

	this.elements = function() { return [this.elem]; };
}

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

// this command object acts an arbitrary number of subcommands 
function BatchCommand(text) {
	this.text = text || "Batch Command";
	this.stack = [];

	this.apply = function() {
		var len = this.stack.length;
		for (var i = 0; i < len; ++i) {
			this.stack[i].apply();
		}
	};

	this.unapply = function() {
		for (var i = this.stack.length-1; i >= 0; i--) {
			this.stack[i].unapply();
		}
	};

	this.elements = function() {
		// iterate through all our subcommands and find all the elements we are changing
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

	this.addSubCommand = function(cmd) { this.stack.push(cmd); };

	this.isEmpty = function() { return this.stack.length == 0; };
}

// private members

	// **************************************************************************************
	function Selector(id, elem) {
		// this is the selector's unique number
		this.id = id;

		// this holds a reference to the element for which this selector is being used
		this.selectedElement = elem;

		// this is a flag used internally to track whether the selector is being used or not
		this.locked = true;

		// this function is used to reset the id and element that the selector is attached to
		this.reset = function(e, update) {
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

		this.showGrips = function(show) {
			// TODO: use suspendRedraw() here
			var bShow = show ? "inline" : "none";
			this.rotateGrip.setAttribute("display", bShow);
			this.rotateGripConnector.setAttribute("display", bShow);
			var elem = this.selectedElement;
			for (var dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute("display", bShow);
			}
			if(elem) this.updateGripCursors(canvas.getRotationAngle(elem));
		};
		
		// Updates cursors for corner grips on rotation so arrows point the right way
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
		
		this.resize = function() {
			var selectedBox = this.selectorRect,
				selectedGrips = this.selectorGrips,
				selected = this.selectedElement,
				 sw = round(selected.getAttribute("stroke-width"));
			var offset = 1/canvas.getZoom();
			if (selected.getAttribute("stroke") != "none" && !isNaN(sw)) {
				offset += sw/2;
			}
			if (selected.tagName == "text") {
				offset += 2/canvas.getZoom();
			}
			var bbox = canvas.getBBox(selected);
			if(selected.tagName == 'g') {
				// The bbox for a group does not include stroke vals, so we
				// get the bbox based on its children. 
				var stroked_bbox = canvas.getStrokedBBox(selected.childNodes);
				$.each(bbox, function(key, val) {
					bbox[key] = stroked_bbox[key];
				});
			}

			// loop and transform our bounding box until we reach our first rotation
			var tlist = canvas.getTransformList(selected),
				m = transformListToTransform(tlist).matrix;

			// This should probably be handled somewhere else, but for now
			// it keeps the selection box correctly positioned when zoomed
			m.e *= current_zoom;
			m.f *= current_zoom;
			
			// apply the transforms
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset<<1), h=bbox.height+(offset<<1),
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
			var angle = canvas.getRotationAngle(selected);
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

	function SelectorManager() {

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
	}
	// **************************************************************************************

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
		this._elem = elem || null;
		this._xforms = [];
		// TODO: how do we capture the undo-ability in the changed transform list?
		this._update = function() {
			var tstr = "";
			var concatMatrix = svgroot.createSVGMatrix();
			for (var i = 0; i < this.numberOfItems; ++i) {
				var xform = this._list.getItem(i);
				tstr += transformToObj(xform).text + " ";
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

	var addSvgElementFromJson = function(data) {
		return canvas.updateElementFromJson(data)
	};

	// TODO: declare the variables and set them as null, then move this setup stuff to
	// an initialization function - probably just use clear()
	
	var canvas = this,
		svgns = "http://www.w3.org/2000/svg",
		xlinkns = "http://www.w3.org/1999/xlink",
		xmlns = "http://www.w3.org/XML/1998/namespace",
		xmlnsns = "http://www.w3.org/2000/xmlns/", // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
		se_ns = "http://svg-edit.googlecode.com",
		htmlns = "http://www.w3.org/1999/xhtml",
		mathns = "http://www.w3.org/1998/Math/MathML",
		idprefix = "svg_",
		svgdoc  = container.ownerDocument,
		dimensions = curConfig.dimensions,
		svgroot = svgdoc.importNode(Utils.text2xml('<svg id="svgroot" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
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
		
		$(svgroot).appendTo(container);
		
		var opac_ani = document.createElementNS(svgns, 'animate');
 		$(opac_ani).attr({
 			attributeName: 'opacity',
 			begin: 'indefinite',
 			dur: 1,
 			fill: 'freeze'
 		}).appendTo(svgroot);
	
    //nonce to uniquify id's
    var nonce = Math.floor(Math.random()*100001);
    var randomize_ids = false;
    
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
	if (randomize_ids) svgcontent.setAttributeNS(se_ns, 'se:nonce', nonce);

	var convertToNum, convertToUnit, setUnitAttr;
	
	(function() {
		var w_attrs = ['x', 'x1', 'cx', 'rx', 'width'];
		var h_attrs = ['y', 'y1', 'cy', 'ry', 'height'];
		var unit_attrs = $.merge(['r','radius'], w_attrs);
		$.merge(unit_attrs, h_attrs);
		
		// Converts given values to numbers. Attributes must be supplied in 
		// case a percentage is given
		convertToNum = function(attr, val) {
			// Return a number if that's what it already is
			if(!isNaN(val)) return val-0;
			
			if(val.substr(-1) === '%') {
				// Deal with percentage, depends on attribute
				var num = val.substr(0, val.length-1)/100;
				var res = canvas.getResolution();
				
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
		
		setUnitAttr = function(elem, attr, val) {
			if(!isNaN(val)) {
				// New value is a number, so check currently used unit
				var old_val = elem.getAttribute(attr);
				
				if(old_val !== null && isNaN(old_val)) {
					// Old value was a number, so get unit, then convert
					var unit;
					if(old_val.substr(-1) === '%') {
						var res = canvas.getResolution();
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

	var assignAttributes = function(node, attrs, suspendLength, unitCheck) {
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

	// remove unneeded attributes
	// makes resulting SVG smaller
	var cleanupElement = function(element) {
		var handle = svgroot.suspendRedraw(60);
		var defaults = {
			'fill-opacity':1,
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

	this.updateElementFromJson = function(data) {
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
		//	svgthumb.setAttributeNS(xlinkns, 'href', '#svgcontent');
		//	svgroot.appendChild(svgthumb);

	})();
	// z-ordered array of tuples containing layer names and <g> elements
	// the first layer is the one at the bottom of the rendering
	var all_layers = [],
		encodableImages = {},
		last_good_img_url = curConfig.imgPath + 'logo.png',
		// pointer to the current layer <g>
		current_layer = null,
		save_options = {round_digits: 5},
		started = false,
		obj_num = 1,
		start_transform = null,
		current_mode = "select",
		current_resize_mode = "none",
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

	var cur_shape = all_properties.shape,
		cur_text = all_properties.text,
		cur_properties = cur_shape,
		current_zoom = 1,
		// this will hold all the currently selected elements
		// default size of 1 until it needs to grow bigger
		selectedElements = new Array(1),
		// this holds the selected's bbox
		selectedBBoxes = new Array(1),
		justSelected = null,
		// this object manages selectors for us
		selectorManager = new SelectorManager(),
		rubberBox = null,
		events = {},
		undoStackPointer = 0,
		undoStack = [],
		curBBoxes = [],
		extensions = {};
	
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
	
	// This method rounds the incoming value to the nearest value based on the current_zoom
	var round = function(val){
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
	var getIntersectionList = function(rect) {
		if (rubberBox == null) { return null; }

		if(!curBBoxes.length) {
			// Cache all bboxes
			curBBoxes = canvas.getVisibleElements(current_layer, true);
		}
		
		var resultList = null;
		try {
			resultList = current_layer.getIntersectionList(rect, null);
		} catch(e) { }

		if (resultList == null || typeof(resultList.item) != "function") {
			resultList = [];

			var rubberBBox = rubberBox.getBBox();
			$.each(rubberBBox, function(key, val) {
				rubberBBox[key] = val / current_zoom;
			});
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

	// FIXME: we MUST compress consecutive text changes to the same element
	// (right now each keystroke is saved as a separate command that includes the
	// entire text contents of the text element)
	// TODO: consider limiting the history that we store here (need to do some slicing)
	var addCommandToHistory = function(cmd) {
		// if our stack pointer is not at the end, then we have to remove
		// all commands after the pointer and insert the new command
		if (undoStackPointer < undoStack.length && undoStack.length > 0) {
			undoStack = undoStack.splice(0, undoStackPointer);
		}
		undoStack.push(cmd);
		undoStackPointer = undoStack.length;
	};
	
	this.getHistoryPosition = function() {
		return undoStackPointer;
	};

// private functions
	var getId = function() {
		if (events["getid"]) return call("getid", obj_num);
		if (randomize_ids) {
		  return idprefix + nonce +'_' + obj_num;
		} else {
		return idprefix + obj_num;
		}
	};

	var getNextId = function() {
		// ensure the ID does not exist
		var id = getId();
		
		while (getElem(id)) {
			obj_num++;
			id = getId();
		}
		return id;
	};

	var call = function(event, arg) {
		if (events[event]) {
			return events[event](this,arg);
		}
	};

	// this function sanitizes the input node and its children
	// this function only keeps what is allowed from our whitelist defined above
	var sanitizeSvg = function(node) {
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
				}
			}
			
			$.each(se_attrs, function(i, attr) {
				node.setAttributeNS(se_ns, attr[0], attr[1]);
			});
			
			// for some elements that have a xlink:href, ensure the URI refers to a local element
			// (but not for links)
			var href = node.getAttributeNS(xlinkns,"href");
			if(href && 
			   $.inArray(node.nodeName, ["filter", "linearGradient", "pattern", 
			   							 "radialGradient", "textPath", "use"]) != -1)
			{
				// TODO: we simply check if the first character is a #, is this bullet-proof?
				if (href[0] != "#") {
					// remove the attribute (but keep the element)
					node.setAttributeNS(xlinkns, "xlink:href", "");
					node.removeAttributeNS(xlinkns, "href");
				}
			}
			
			// Safari crashes on a <use> without a xlink:href, so we just remove the node here
			if (node.nodeName == "use" && !node.getAttributeNS(xlinkns,"href")) {
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
	
	// extracts the URL from the url(...) syntax of some attributes.  Three variants:
	// i.e. <circle fill="url(someFile.svg#foo)" /> or
	//      <circle fill="url('someFile.svg#foo')" /> or
	//      <circle fill='url("someFile.svg#foo")' />
	this.getUrlFromAttr = function(attrVal) {
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
	var getUrlFromAttr = this.getUrlFromAttr;

	var removeUnusedGrads = function() {
		var defs = svgcontent.getElementsByTagNameNS(svgns, "defs");
		if(!defs || !defs.length) return 0;
		
		var all_els = svgcontent.getElementsByTagNameNS(svgns, '*'),
			grad_uses = [],
			numRemoved = 0;
		
		$.each(all_els, function(i, el) {
			var fill = getUrlFromAttr(el.getAttribute('fill'));
			if(fill) {
				grad_uses.push(fill.substr(1));
			}
			
			var stroke = getUrlFromAttr(el.getAttribute('stroke'));
			if (stroke) {
				grad_uses.push(stroke.substr(1));
			}
			
			// gradients can refer to other gradients
			var href = el.getAttributeNS(xlinkns, "href");
			if (href && href.indexOf('#') == 0) {
				grad_uses.push(href.substr(1));
			}
		});
		
		var grads = $(svgcontent).find("linearGradient, radialGradient");
			grad_ids = [],
			i = grads.length;
		while (i--) {
			var grad = grads[i];
			var id = grad.id;
			if($.inArray(id, grad_uses) == -1) {
				// Not found, so remove
				grad.parentNode.removeChild(grad);
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
	
	var svgCanvasToString = function() {
		// keep calling it until there are none to remove
		while (removeUnusedGrads() > 0) {};
		pathActions.clear(true);
		
		// Keep SVG-Edit comment on top
		$.each(svgcontent.childNodes, function(i, node) {
			if(i && node.nodeType == 8 && node.data.indexOf('Created with') != -1) {
				svgcontent.insertBefore(node, svgcontent.firstChild);
			}
		});
		
		var output = svgToString(svgcontent, 0);
		return output;
	}

	var svgToString = function(elem, indent) {
		var out = new Array();

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
				var res = canvas.getResolution();
				out.push(' width="' + res.w + '" height="' + res.h + '" xmlns="'+svgns+'"');
				var i = attrs.length;
				while (i--) {
					attr = attrs.item(i);
					var attrVal = toXml(attr.nodeValue);
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
					if (attr.localName == '-moz-math-font-style') continue;
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

	// importNode, like cloneNode, causes the comma-to-period
	// issue in Opera/Win/non-en. Thankfully we can compare to the original XML
	// and simply use the original value when necessary
	this.fixOperaXML = function(elem, orig_el) {
		var x_attrs = elem.attributes;
		$.each(x_attrs, function(i, attr) {
			if(attr.nodeValue.indexOf(',') == -1) return;
			// attr val has comma, so let's get the good value
			var ns = attr.prefix == 'xlink' ? xlinkns : 
				attr.prefix == "xml" ? xmlns : null;
			var good_attrval = orig_el.getAttribute(attr.localName);
			if(ns) {
				elem.setAttributeNS(ns, attr.nodeName, good_attrval);
			} else {
				elem.setAttribute(attr.nodeName, good_attrval);
			}
		});

		var childs = elem.childNodes;
		var o_childs = orig_el.childNodes;
		$.each(childs, function(i, child) {
			if(child.nodeType == 1) {
				canvas.fixOperaXML(child, o_childs[i]);
			}
		});
	}

	var recalculateAllSelectedDimensions = function() {
		var text = (current_resize_mode == "none" ? "position" : "size");
		var batchCmd = new BatchCommand(text);

		var i = selectedElements.length;
		while(i--) {
			var cmd = recalculateDimensions(selectedElements[i]);
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

	var logMatrix = function(m) {
		console.log([m.a,m.b,m.c,m.d,m.e,m.f]);
	};
	
	var remapElement = function(selected,changes,m) {
		var remap = function(x,y) { return transformPoint(x,y,m); },
			scalew = function(w) { return m.a*w; },
			scaleh = function(h) { return m.d*h; },
			box = canvas.getBBox(selected);

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
				var pt1 = remap(changes["x"],changes["y"]);
				changes["x"] = pt1.x;
				changes["y"] = pt1.y;
				break;
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
					var chlist = canvas.getTransformList(selected);
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
				assignAttributes(selected, changes, 1000, true);
				break;
			case "use":
				assignAttributes(selected, changes, 1000, true);
				break;
			case "ellipse":
				changes.rx = Math.abs(changes.rx);
				changes.ry = Math.abs(changes.ry);
			case "circle":
				if(changes.r) changes.r = Math.abs(changes.r);
			case "line":
			case "text":
				assignAttributes(selected, changes, 1000, true);
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
	
	// this function returns the command which resulted from the selected change
	// TODO: use suspendRedraw() and unsuspendRedraw() around this function
	var recalculateDimensions = function(selected) {
		if (selected == null) return null;
		
		var tlist = canvas.getTransformList(selected);

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
		}
		
		// if this element had no transforms, we are done
		if (!tlist || tlist.numberOfItems == 0) {
			selected.removeAttribute("transform");
			return null;
		}
		
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
				attrs = ["x", "y"];
				break;
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
		
		// if it's a group, we have special processing to flatten transforms
		if (selected.tagName == "g" || selected.tagName == "a") {
			var box = canvas.getBBox(selected),
				oldcenter = {x: box.x+box.width/2, y: box.y+box.height/2},
				newcenter = transformPoint(box.x+box.width/2, box.y+box.height/2,
								transformListToTransform(tlist).matrix),
				m = svgroot.createSVGMatrix();
			
			// temporarily strip off the rotate and save the old center
			var gangle = canvas.getRotationAngle(selected);
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
						var childTlist = canvas.getTransformList(child);
						var m = transformListToTransform(childTlist).matrix;
					
						var angle = canvas.getRotationAngle(child);
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
//							if(href == useElem.getAttributeNS(xlinkns, "href")) {
//								var usexlate = svgroot.createSVGTransform();
//								usexlate.setTranslate(-tx,-ty);
//								canvas.getTransformList(useElem).insertItemBefore(usexlate,0);
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
					while (c--) {
						var child = children.item(c);
						if (child.nodeType == 1) {
							var old_start_transform = start_transform;
							start_transform = child.getAttribute("transform");
							
							var childTlist = canvas.getTransformList(child);
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
									if(href == useElem.getAttributeNS(xlinkns, "href")) {
										var usexlate = svgroot.createSVGTransform();
										usexlate.setTranslate(-tx,-ty);
										canvas.getTransformList(useElem).insertItemBefore(usexlate,0);
										batchCmd.addSubCommand( recalculateDimensions(useElem) );
									}
								}
								start_transform = old_start_transform;
							}
						}
					}
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
						var childTlist = canvas.getTransformList(child);
						
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
							var childTlist = canvas.getTransformList(child);
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
			var box = canvas.getBBox(selected),
				oldcenter = {x: box.x+box.width/2, y: box.y+box.height/2},
				newcenter = transformPoint(box.x+box.width/2, box.y+box.height/2,
								transformListToTransform(tlist).matrix),
				m = svgroot.createSVGMatrix(),
				// temporarily strip off the rotate and save the old center
				angle = canvas.getRotationAngle(selected);
			if (angle) {
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
			
			// first, if it was a scale of a non-skewed element, then the second-last  
			// transform will be the [S]
			// if we had [M][T][S][T] we want to extract the matrix equivalent of
			// [T][S][T] and push it down to the element
			if (N >= 3 && tlist.getItem(N-2).type == 3 && 
				tlist.getItem(N-3).type == 2 && tlist.getItem(N-1).type == 2 &&
				selected.nodeName != "use") 
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
					var newRot = svgroot.createSVGTransform();
					newRot.setRotate(angle,newcenter.x,newcenter.y);
					tlist.insertItemBefore(newRot, 0);
				}
			}
			// [Rold][M][T][S][-T] became [Rold][M]
			// we want it to be [Rnew][M][Tr] where Tr is the
			// translation required to re-center it
			// Therefore, [Tr] = [M_inv][Rnew_inv][Rold][M]
			else if (operation == 3) {
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

// public events

	// Group: Selection

	// Function: clearSelection
	// Clears the selection.  The 'selected' handler is then called.
	this.clearSelection = function() {
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
		call("selected", selectedElements);
	};

	// TODO: do we need to worry about selectedBBoxes here?
	
	// Function: addToSelection
	// Adds a list of elements to the selection.  The 'selected' handler is then called.
	//
	// Parameters:
	// elemsToAdd - an array of DOM elements to add to the selection
	// showGrips - a boolean flag indicating whether the resize grips should be shown
	this.addToSelection = function(elemsToAdd, showGrips) {
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
			// we ignore any selectors
			if (!elem || elem.id.substr(0,13) == "selectorGrip_" || !this.getBBox(elem)) continue;
			// if it's not already there, add it
			if (selectedElements.indexOf(elem) == -1) {
				selectedElements[j] = elem;
				// only the first selectedBBoxes element is ever used in the codebase these days
				if (j == 0) selectedBBoxes[j] = this.getBBox(elem);
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

	// TODO: could use slice here to make this faster?
	// TODO: should the 'selected' handler
	
	// Function: removeFromSelection
	// Removes elements from the selection.
	//
	// Parameters:
	// elemsToRemove - an array of elements to remove from selection
	this.removeFromSelection = function(elemsToRemove) {
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
	
	// Some global variables that we may need to refactor
	var root_sctm = null;

	// A (hopefully) quicker function to transform a point by a matrix
	// (this function avoids any DOM calls and just does the math)
	// Returns a x,y object representing the transformed point
	var transformPoint = function(x, y, m) {
		return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
	};
	
	var isIdentity = function(m) {
		return (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && m.e == 0 && m.f == 0);
	}
	
	// expects three points to be sent, each point must have an x,y field
	// returns an array of two points that are the smoothed
	this.smoothControlPoints = function(ct1, ct2, pt) {
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
	var smoothControlPoints = this.smoothControlPoints;
		

	// matrixMultiply() is provided because WebKit didn't implement multiply() correctly
	// on the SVGMatrix interface.  See https://bugs.webkit.org/show_bug.cgi?id=16062
	// This function tries to return a SVGMatrix that is the multiplication m1*m2.
	// We also round to zero when it's near zero
	this.matrixMultiply = function() {
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
	var matrixMultiply = this.matrixMultiply;
	
	// This returns a single matrix Transform for a given Transform List
	// (this is the equivalent of SVGTransformList.consolidate() but unlike
	//  that method, this one does not modify the actual SVGTransformList)
	// This function is very liberal with its min,max arguments
	var transformListToTransform = function(tlist, min, max) {
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
	
	var hasMatrixTransform = function(tlist) {
		if(!tlist) return false;
		var num = tlist.numberOfItems;
		while (num--) {
			var xform = tlist.getItem(num);
			if (xform.type == 1 && !isIdentity(xform.matrix)) return true;
		}
		return false;
	}

//  // Easy way to loop through transform list, but may not be worthwhile	
// 	var eachXform = function(elem, callback) {
// 		var tlist = canvas.getTransformList(elem);
// 		var num = tlist.numberOfItems;
// 		if(num == 0) return;
// 		while(num--) {
// 			var xform = tlist.getItem(num);
// 			callback(xform, tlist);
// 		}
// 	}
	
    // FIXME: this should not have anything to do with zoom here - update the one place it is used this way
    // converts a tiny object equivalent of a SVGTransform
	// has the following properties:
	// - tx, ty, sx, sy, angle, cx, cy, string
	var transformToObj = function(xform, mZoom) {
		var m = xform.matrix,
			tobj = {tx:0,ty:0,sx:1,sy:1,angle:0,cx:0,cy:0,text:""},
			z = mZoom?current_zoom:1;
		switch(xform.type) {
			case 1: // MATRIX
				tobj.text = "matrix(" + [m.a,m.b,m.c,m.d,m.e,m.f].join(",") + ")";
				break;
			case 2: // TRANSLATE
				tobj.tx = m.e;
				tobj.ty = m.f;
				tobj.text = "translate(" + m.e*z + "," + m.f*z + ")";
				break;
			case 3: // SCALE
				tobj.sx = m.a;
				tobj.sy = m.d;
				if (m.a == m.d) tobj.text = "scale(" + m.a + ")";
				else tobj.text = "scale(" + m.a + "," + m.d + ")";
				break;
			case 4: // ROTATE
				tobj.angle = xform.angle;
				// this prevents divide by zero
				if (xform.angle != 0) {
					var K = 1 - m.a;
					tobj.cy = ( K * m.f + m.b*m.e ) / ( K*K + m.b*m.b );
					tobj.cx = ( m.e - m.b * tobj.cy ) / K;
				}
				tobj.text = "rotate(" + xform.angle + " " + tobj.cx*z + "," + tobj.cy*z + ")";
				break;
		}
		return tobj;
	};
	
	var transformBox = function(l, t, w, h, m) {
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

	// Mouse events
	(function() {
		
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
			if(evt.button === 1 || canvas.spaceKey) return;
			root_sctm = svgcontent.getScreenCTM().inverse();
			var pt = transformPoint( evt.pageX, evt.pageY, root_sctm ),
				mouse_x = pt.x * current_zoom,
				mouse_y = pt.y * current_zoom;
			evt.preventDefault();
		
			if($.inArray(current_mode, ['select', 'resize']) == -1) {
				addGradient();
			}
			
			var x = mouse_x / current_zoom,
				y = mouse_y / current_zoom,
				mouse_target = evt.target;
			
			start_x = x;
			start_y = y;
	
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
			
			// go up until we hit a child of a layer
			while (mouse_target.parentNode.parentNode.tagName == "g") {
				mouse_target = mouse_target.parentNode;
			}
			// Webkit bubbles the mouse event all the way up to the div, so we
			// set the mouse_target to the svgroot like the other browsers
			if (mouse_target.nodeName.toLowerCase() == "div") {
				mouse_target = svgroot;
			}
			// if it is a selector grip, then it must be a single element selected, 
			// set the mouse_target to that and update the mode to rotate/resize
			if (mouse_target.parentNode == selectorManager.selectorParentGroup && selectedElements[0] != null) {
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
			var tlist = canvas.getTransformList(mouse_target);
			switch (current_mode) {
				case "select":
					started = true;
					current_resize_mode = "none";
					
					if (mouse_target != svgroot) {
						// if this element is not yet selected, clear selection and select it
						if (selectedElements.indexOf(mouse_target) == -1) {
							// only clear selection if shift is not pressed (otherwise, add 
							// element to selection)
							if (!evt.shiftKey) {
								canvas.clearSelection();
							}
							canvas.addToSelection([mouse_target]);
							justSelected = mouse_target;
							pathActions.clear();
						}
						// else if it's a path, go into pathedit mode in mouseup
	
						// insert a dummy transform so if the element(s) are moved it will have
						// a transform to use for its translate
						for (var i = 0; i < selectedElements.length; ++i) {
							if(selectedElements[i] == null) continue;
							var slist = canvas.getTransformList(selectedElements[i]);
							slist.insertItemBefore(svgroot.createSVGTransform(), 0);
						}
					}
					else {
						canvas.clearSelection();
						current_mode = "multiselect";
						if (rubberBox == null) {
							rubberBox = selectorManager.getRubberBandBox();
						}
						start_x *= current_zoom;
						start_y *= current_zoom;
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
					init_bbox = canvas.getBBox($('#selectedBox0')[0]);
					$.each(init_bbox, function(key, val) {
						init_bbox[key] = val/current_zoom;
					});
					
					// append three dummy transforms to the tlist so that
					// we can translate,scale,translate in mousemove
					var pos = canvas.getRotationAngle(mouse_target)?1:0;
					
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
					newImage.setAttributeNS(xlinkns, "xlink:href", last_good_img_url);
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
					newText.textContent = "text";
					break;
				case "path":
					// Fall through
				case "pathedit":
					start_x *= current_zoom;
					start_y *= current_zoom;
					pathActions.mouseDown(evt, mouse_target, start_x, start_y);
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
		
			x = mouse_x / current_zoom;
			y = mouse_y / current_zoom;
		
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
						if (dx != 0 || dy != 0) {
							var len = selectedElements.length;
							for (var i = 0; i < len; ++i) {
								var selected = selectedElements[i];
								if (selected == null) break;
								if (i==0) {
									var box = canvas.getBBox(selected);
									selectedBBoxes[i].x = box.x + dx;
									selectedBBoxes[i].y = box.y + dy;
								}
	
								// update the dummy transform in our transform list
								// to be a translate
								var xform = svgroot.createSVGTransform();
								var tlist = canvas.getTransformList(selected);
								xform.setTranslate(dx,dy);
								if(tlist.numberOfItems) {
									tlist.replaceItem(xform, 0);
									// TODO: Webkit returns null here, find out why
	// 								console.log(selected.getAttribute("transform"))
	
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
						canvas.addToSelection(elemsToAdd);
					break;
				case "resize":
					// we track the resize bounding box and translate/scale the selected element
					// while the mouse is down, when mouse goes up, we use this to recalculate
					// the shape's coordinates
					var tlist = canvas.getTransformList(selected),
						hasMatrix = hasMatrixTransform(tlist),
						box=hasMatrix?init_bbox:canvas.getBBox(selected), 
						left=box.x, top=box.y, width=box.width,
						height=box.height, dx=(x-start_x), dy=(y-start_y);
									
					// if rotated, adjust the dx,dy values
					var angle = canvas.getRotationAngle(selected);
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
					shape.setAttributeNS(null, "x2", x);
					shape.setAttributeNS(null, "y2", y);
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
					shape.setAttributeNS(null, "r", rad);
					break;
				case "ellipse":
					var c = $(shape).attr(["cx", "cy"]);
					var cx = c.cx, cy = c.cy;
					// Opera has a problem with suspendRedraw() apparently
						handle = null;
					if (!window.opera) svgroot.suspendRedraw(1000);
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
					if(rubberBox && rubberBox.getAttribute('display') != 'none') {
						assignAttributes(rubberBox, {
							'x': Math.min(start_x,x),
							'y': Math.min(start_y,y),
							'width': Math.abs(x-start_x),
							'height': Math.abs(y-start_y)
						},100);
					}
					
					pathActions.mouseMove(mouse_x, mouse_y);
					
					break;
				case "rotate":
					var box = canvas.getBBox(selected),
						cx = box.x + box.width/2, 
						cy = box.y + box.height/2,
						m = transformListToTransform(canvas.getTransformList(selected)).matrix,
						center = transformPoint(cx,cy,m);
					cx = center.x;
					cy = center.y;
					var angle = ((Math.atan2(cy-y,cx-x)  * (180/Math.PI))-90) % 360;
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
		
		var mouseUp = function(evt)
		{
			if(evt.button === 1) return;
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
							call("selected", [selected]);
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
					keep = (attrs.width != 0 || attrs.height != 0);
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
					canvas.clearSelection();
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
					canvas.addToSelection([t], true);
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
					c_ani[0].beginElement();
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
						canvas.addToSelection([element], true);
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

	var pathActions = function() {
		
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
			14: ['y']
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
					path.setSegType();
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
				if(canvas.getRotationAngle(p.elem)) {
					var tlist = canvas.getTransformList(path.elem);
					p.matrix = transformListToTransform(tlist).matrix;
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
				var prev = seg.prev;
				
				var new_x = (seg.item.x + prev.item.x) / 2;
				var new_y = (seg.item.y + prev.item.y) / 2;
				
				var list = elem.pathSegList;
				var newseg = elem.createSVGPathSegLinetoAbs(new_x, new_y);
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
							var ct1_x = (prev_x + (diff_y/2));
							var ct1_y = (prev_y - (diff_x/2));
							var ct2_x = (cur_x + (diff_y/2));
							var ct2_y = (cur_y - (diff_x/2));
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
			var angle = canvas.getRotationAngle(current_path, true);
			if(!angle) return;
			selectedBBoxes[0] = path.oldbbox;
			var box = canvas.getBBox(current_path),
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
	
			box = canvas.getBBox(current_path);						
			selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
			selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;
			
			// now we must set the new transform to be rotated around the new center
			var R_nc = svgroot.createSVGTransform(),
				tlist = canvas.getTransformList(current_path);
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
								var new_d = newpath.getAttribute("d");
								var orig_d = $(path.elem).attr("d");
								$(path.elem).attr("d", orig_d + new_d);
								$(newpath).remove();
								path.init();
								pathActions.toEditMode(path.elem);
								path.selectPt();
								return false;
							}
						}
						// else, create a new point, append to pts array, update path element
						else {
							// Checks if current target or parents are #svgcontent
							if(!$.contains(container, evt.target)) {
								// Clicked outside canvas, so don't make point
								return false;
							}

							var lastx = current_path_pts[len-2], lasty = current_path_pts[len-1];
							// we store absolute values in our path points array for easy checking above
							current_path_pts.push(x);
							current_path_pts.push(y);
							d_attr += "L" + round(x) + "," + round(y) + " ";

							newpath.setAttribute("d", d_attr);
	
							// set stretchy line to latest point
							assignAttributes(stretchy, {
								'x1': mouse_x,
								'y1': mouse_y,
								'x2': mouse_x,
								'y2': mouse_y
							});
							var index = (current_path_pts.length/2 - 1);
							if(subpath) index += path.segs.length;
							addPointGrip(index, mouse_x, mouse_y);
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
				canvas.clearSelection();
				path.show(true).update();
				path.oldbbox = canvas.getBBox(path.elem);
				subpath = false;
			},
			toSelectMode: function(elem) {
				var selPath = (elem == path.elem);
				current_mode = "select";
				path.show(false);
				current_path = false;
				canvas.clearSelection();
				
				if(path.matrix) {
					// Rotated, so may need to re-calculate the center
					recalcRotatedPath();
				}
				
				if(selPath) {
					call("selected", [elem]);
					canvas.addToSelection([elem], true);
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
				var angle = canvas.getRotationAngle(elem);
				if(angle == 0) return;
				
				var batchCmd = new BatchCommand("Reorient path");
				var changes = {
					d: elem.getAttribute('d'),
					transform: elem.getAttribute('transform')
				};
				batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
				canvas.clearSelection();
				this.resetOrientation(elem);
				addCommandToHistory(batchCmd);

				getPath(elem).show(false);

				this.clear();
		
				canvas.addToSelection([elem], true);
				call("changed", selectedElements);
			},
			
			clear: function(remove) {
				if(remove && current_mode == "path") {
					var elem = getElem(getId());
					if(elem) elem.parentNode.removeChild(elem);
				}
				if(path) path.init().show(false);
				current_path = null;
			},
			resetOrientation: function(path) {
				if(path == null || path.nodeName != 'path') return false;
				var tlist = canvas.getTransformList(path);
				var m = transformListToTransform(tlist).matrix;
				tlist.clear();
				path.removeAttribute("transform");
				var segList = path.pathSegList;
				
				// Opera/win/non-EN throws an error here.
				// TODO: Find out why!
				try {
					var len = segList.numberOfItems;
				} catch(err) {
					var fixed_d = pathActions.convertPath(path);
					path.setAttribute('d', fixed_d);
					segList = path.pathSegList;
					var len = segList.numberOfItems;
				}
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
			modeChange: function() {
				// toss out half-drawn path
				if (current_mode == "path" && current_path_pts.length > 0) {
					var elem = getElem(getId());
					elem.parentNode.removeChild(elem);
					this.clear();
					canvas.clearSelection();
					started = false;
				}
				else if (current_mode == "pathedit") {
					this.clear();
					this.toSelectMode();
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
						if(prev.x != last_m.x && prev.y != last_m.y) {
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
						var last = last?shortFloat(last):'';
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
						case 3: // relative move (m)
						case 5: // relative line (l)
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
	this.pathActions = pathActions;
	
	var shortFloat = function(val) {
		var digits = save_options.round_digits;
		if(!isNaN(val)) {
			return Number(Number(val).toFixed(digits));
		} else if($.isArray(val)) {
			return shortFloat(val[0]) + ',' + shortFloat(val[1]);
		}
	}
	
	// Convert an element to a path
	this.convertToPath = function(elem, getBBox, angle) {
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
				var tlist = canvas.getTransformList(path);
				if(hasMatrixTransform(tlist)) {
					pathActions.resetOrientation(path);
				}
			}
			
			batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
			batchCmd.addSubCommand(new InsertElementCommand(path));

			canvas.clearSelection();
			elem.parentNode.removeChild(elem)
			path.setAttribute('id', id);
			path.removeAttribute("visibility");
			canvas.addToSelection([path], true);
			
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
	


	// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
	//   and store it on the Undo stack
	// - in move/resize mode, the element's attributes which were affected by the move/resize are
	//   identified, a ChangeElementCommand is created and stored on the stack for those attrs
	//   this is done in when we recalculate the selected dimensions()

// public functions

	// Group: Serialization

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
		this.clearSelection();
		// Update save options if provided
		if(opts) $.extend(save_options, opts);
		save_options.apply = true;
		
		// no need for doctype, see http://jwatt.org/svg/authoring/#doctype-declaration
		var str = svgCanvasToString();
		call("saved", str);
	};

	// Walks the tree and executes the callback on each element in a top-down fashion
	var walkTree = function(elem, cbFn){
		if (elem && elem.nodeType == 1) {
			cbFn(elem);
			var i = elem.childNodes.length;
			while (i--) {
				walkTree(elem.childNodes.item(i), cbFn);
			}
		}
	};
	// Walks the tree and executes the callback on each element in a depth-first fashion
	var walkTreePost = function(elem, cbFn) {
		if (elem && elem.nodeType == 1) {
			var i = elem.childNodes.length;
			while (i--) {
				walkTree(elem.childNodes.item(i), cbFn);
			}
			cbFn(elem);
		}
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
        	$(svgcontent).find('image').each(function() {
        		var image = this;
        		preventClickDefault(image);
        		var val = this.getAttributeNS(xlinkns, "href");
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
        	
        	// convert gradients with userSpaceOnUse to objectBoundingBox
        	$(svgcontent).find('linearGradient, radialGradient').each(function() {
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
        	
        	// Fix XML for Opera/Win/Non-EN
			if(!support.goodDecimals) {
				canvas.fixOperaXML(svgcontent, newDoc.documentElement);
			}
			
			// recalculate dimensions on the top-level children so that unnecessary transforms
			// are removed
			walkTreePost(svgcontent, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
			
			var content = $(svgcontent);
        	
			var attrs = {
				id: 'svgcontent',
				overflow: curConfig.show_outside_canvas?'visible':'hidden'
			};
			
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
					var val = content.attr(dim) || 100;

					if((val+'').substr(-1) === "%") {
						// Use user units if percentage given
						attrs[dim] = parseInt(val);
					} else {
						attrs[dim] = convertToNum(dim, val);
					}
				});
			}
			
			content.attr(attrs);
			batchCmd.addSubCommand(new InsertElementCommand(svgcontent));
			// update root to the correct size
			var changes = content.attr(["width", "height"]);
			batchCmd.addSubCommand(new ChangeElementCommand(svgroot, changes));
			
			// reset zoom
			current_zoom = 1;
			
			// identify layers
			identifyLayers();
			
			// reset transform lists
			svgTransformLists = {};
			canvas.clearSelection();
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
	// This function imports the input SVG XML into the current layer in the drawing
	//
	// Parameters:
	// xmlString - The SVG as XML text.
	//
	// Returns:
	// This function returns false if the import was unsuccessful, true otherwise.

	// TODO: properly handle if namespace is introduced by imported content (must add to svgcontent
	//       and update all prefixes in the imported node)
	// TODO: properly handle recalculating dimensions, recalculateDimensions() doesn't handle
	//       arbitrary transform lists, but makes some assumptions about how the transform list 
	//       was obtained
	// TODO: import should happen in top-left of current zoomed viewport	
	// TODO: create a new layer for the imported SVG
	this.importSvgString = function(xmlString) {
		try {
			// convert string into XML document
			var newDoc = Utils.text2xml(xmlString);
			// run it through our sanitizer to remove anything we do not support
	        sanitizeSvg(newDoc.documentElement);

			var batchCmd = new BatchCommand("Change Source");

			// import new svg document into our document
			var importedNode = svgdoc.importNode(newDoc.documentElement, true);
        
			if (current_layer) {
				// TODO: properly handle if width/height are not specified or if in percentages
				// TODO: properly handle if width/height are in units (px, etc)
				var innerw = importedNode.getAttribute("width"),
					innerh = importedNode.getAttribute("height"),
					innervb = importedNode.getAttribute("viewBox"),
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
				if (vb[0] != 0 || vb[1] != 0)
					ts = "translate(" + (-vb[0]) + "," + (-vb[1]) + ") " + ts;

				// add all children of the imported <svg> to the <g> we create
				var g = svgdoc.createElementNS(svgns, "g");
				while (importedNode.hasChildNodes())
					g.appendChild(importedNode.firstChild);
				if (ts)
					g.setAttribute("transform", ts);
    	    		
				// now ensure each element has a unique ID
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
						var href = n.getAttributeNS(xlinkns,"href");
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
    	    				hreffer.setAttributeNS(xlinkns, "xlink:href", "#"+newid);
    	    			}
    	    		}
    	    	}
    	    	
    	    	// now give the g itself a new id
				g.id = getNextId();
				// manually increment obj_num because our cloned elements are not in the DOM yet
				obj_num++;
				
    	    	current_layer.appendChild(g);
    	    }
    	    
        	// change image href vals if possible
//        	$(svgcontent).find('image').each(function() {
//        		var image = this;
//        		preventClickDefault(image);
//        		var val = this.getAttributeNS(xlinkns, "href");
//				if(val.indexOf('data:') === 0) {
//					// Check if an SVG-edit data URI
//					var m = val.match(/svgedit_url=(.*?);/);
//					if(m) {
//						var url = decodeURIComponent(m[1]);
//						$(new Image()).load(function() {
//							image.setAttributeNS(xlinkns,'xlink:href',url);
//						}).attr('src',url);
//					}
//				}
//        		// Add to encodableImages if it loads
//        		canvas.embedImage(val);
//        	});
        	
        	// Fix XML for Opera/Win/Non-EN
			if(!support.goodDecimals) {
				canvas.fixOperaXML(svgcontent, importedNode);
			}
			
			// recalculate dimensions on the top-level children so that unnecessary transforms
			// are removed
			walkTreePost(importedNode, function(n){try{recalculateDimensions(n)}catch(e){console.log(e)}});
			
			
			batchCmd.addSubCommand(new InsertElementCommand(svgcontent));

			// reset zoom - TODO: why?
//			current_zoom = 1;
			
			// identify layers
//			identifyLayers();
			
			// reset transform lists
			svgTransformLists = {};
			canvas.clearSelection();
			
			addCommandToHistory(batchCmd);
			call("changed", [svgcontent]);
		} catch(e) {
			console.log(e);
			return false;
		}

		return true;
	};
	
	// Layer API Functions

	// Group: Layers

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
				else if(canvas.getBBox(child) && child.nodeName != 'defs') { // Opera returns a BBox for defs
					var bb = canvas.getBBox(child);
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
		canvas.clearSelection();
		identifyLayers();
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
			canvas.clearSelection();
			identifyLayers();
			canvas.setCurrentLayer(all_layers[all_layers.length-1][0]);
			call("changed", [svgcontent]);
			return true;
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
		name = toXml(name);
		for (var i = 0; i < all_layers.length; ++i) {
			if (name == all_layers[i][0]) {
				if (current_layer != all_layers[i][1]) {
					canvas.clearSelection();
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
				all_layers[i][0] = toXml(newname);
			
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
			canvas.clearSelection();
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
	
	// Function: selectAllInCurrentLayer
	// Clears the selection, then adds all elements in the current layer to the selection.
	// This function then fires the selected event.
	this.selectAllInCurrentLayer = function() {
		if (current_layer) {
			canvas.clearSelection();
			canvas.addToSelection($(current_layer).children());
			current_mode = "select";
			call("selected", selectedElements);			
		}
	};

	// Function: clear
	// Clears the current document.  This is not an undoable action.
	this.clear = function() {
		pathActions.clear();

		// clear the svgcontent node
		var nodes = svgcontent.childNodes;
		var len = svgcontent.childNodes.length;
		var i = 0;
		this.clearSelection();
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
	
	this.linkControlPoints = function(linkPoints) {
		pathActions.linkControlPoints(linkPoints);
	}

	this.getContentElem = function() { return svgcontent; };
	this.getRootElem = function() { return svgroot; };
	this.getSelectedElems = function() { return selectedElements; };

	this.getResolution = function() {
// 		var vb = svgcontent.getAttribute("viewBox").split(' ');
// 		return {'w':vb[2], 'h':vb[3], 'zoom': current_zoom};
			
		return {
			'w':svgcontent.getAttribute("width"),
			'h':svgcontent.getAttribute("height"),
			'zoom': current_zoom
		};
	};
	
	this.getImageTitle = function() {
		var childs = svgcontent.childNodes;
		for (var i=0; i<childs.length; i++) {
			if(childs[i].nodeName == 'title') {
				return childs[i].textContent;
			}
		}
		return '';
	}
	
	this.setImageTitle = function(newtitle) {
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
	
	this.getEditorNS = function(add) {
		if(add) {
			svgcontent.setAttribute('xmlns:se', se_ns);
		}
		return se_ns;
	}
	
	this.setResolution = function(x, y) {
		var res = canvas.getResolution();
		var w = res.w, h = res.h;
		var batchCmd;

		if(x == 'fit') {
			// Get bounding box
			var bbox = canvas.getStrokedBBox();
			
			if(bbox) {
				batchCmd = new BatchCommand("Fit Canvas to Content");
				var visEls = canvas.getVisibleElements();
				canvas.addToSelection(visEls);
				var dx = [], dy = [];
				$.each(visEls, function(i, item) {
					dx.push(bbox.x*-1);
					dy.push(bbox.y*-1);
				});
				
				var cmd = canvas.moveSelectedElements(dx, dy, true);
				batchCmd.addSubCommand(cmd);
				canvas.clearSelection();
				
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
			batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {"width":w, "height":h}));

			svgcontent.setAttribute("viewBox", [0, 0, x/current_zoom, y/current_zoom].join(' '));
			batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {"viewBox": ["0 0", w, h].join(' ')}));
		
			addCommandToHistory(batchCmd);
			svgroot.unsuspendRedraw(handle);
			call("changed", [svgcontent]);
		}
		return true;
	};
	
	this.getOffset = function() {
		return $(svgcontent).attr(['x', 'y']);
	}
	
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
				bb = canvas.getStrokedBBox(sel_elems);
				break;
			case 'canvas':
				var res = canvas.getResolution();
				spacer = .95;
				bb = {width:res.w, height:res.h ,x:0, y:0};
				break;
			case 'content':
				bb = canvas.getStrokedBBox();
				break;
			case 'layer':
				bb = canvas.getStrokedBBox(canvas.getVisibleElements(current_layer));
				break;
			default:
				return;
		}
		return calcZoom(bb);
	}

	this.setZoom = function(zoomlevel) {
		var res = canvas.getResolution();
		svgcontent.setAttribute("viewBox", "0 0 " + res.w/zoomlevel + " " + res.h/zoomlevel);
		current_zoom = zoomlevel;
		$.each(selectedElements, function(i, elem) {
			if(!elem) return;
			selectorManager.requestSelector(elem).resize();
		});
		pathActions.zoomChange();
		runExtensions("zoomChanged", zoomlevel);
	}

	this.getMode = function() {
		return current_mode;
	};

	this.setMode = function(name) {
		pathActions.modeChange();
		
		cur_properties = (selectedElements[0] && selectedElements[0].nodeName == 'text') ? cur_text : cur_shape;
		current_mode = name;
	};

	this.getStrokeColor = function() {
		return cur_properties.stroke;
	};

	// TODO: rewrite setFillColor(), setStrokeColor(), setStrokeWidth(), setStrokeStyle() 
	// to use a common function?
	this.setStrokeColor = function(val,preventUndo) {
		cur_shape.stroke = val;
		cur_properties.stroke_paint = {type:"solidColor"};
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
			if (!preventUndo) {
				this.changeSelectedAttribute("stroke", val, elems);
				call("changed", elems);
			} else 
				this.changeSelectedAttributeNoUndo("stroke", val, elems);
		}
	};

	this.getFillColor = function() {
		return cur_properties.fill;
	};

	this.setFillColor = function(val,preventUndo) {
		cur_properties.fill = val;
		cur_properties.fill_paint = {type:"solidColor"};
		// take out any path/line elements when setting fill
		// add all descendants of groups (but remove groups)
		var elems = [];
		var i = selectedElements.length;
		while (i--) {
			var elem = selectedElements[i];
			if (elem) {
				if (elem.tagName == "g")
					walkTree(elem, function(e){if(e.nodeName!="g") elems.push(e);});
				else if (elem.tagName != "polyline" && elem.tagName != "line")
					elems.push(elem);
			}
		}
		if (elems.length > 0) {
			if (!preventUndo) {
				this.changeSelectedAttribute("fill", val, elems);
				call("changed", elems);
			} else
				this.changeSelectedAttributeNoUndo("fill", val, elems);
		}
	};

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

	var addGradient = function() {
		$.each(['stroke','fill'],function(i,type) {
			
			if(!cur_properties[type + '_paint'] || cur_properties[type + '_paint'].type == "solidColor") return;
			var grad = canvas[type + 'Grad'];
			// find out if there is a duplicate gradient already in the defs
			var duplicate_grad = findDuplicateGradient(grad);
			var defs = findDefs();
			// no duplicate found, so import gradient into defs
			if (!duplicate_grad) {
				var orig_grad = grad;
				grad = defs.appendChild( svgdoc.importNode(grad, true) );
				canvas.fixOperaXML(grad, orig_grad);
				// get next id and set it on the grad
				grad.id = getNextId();
			}
			else { // use existing gradient
				grad = duplicate_grad;
			}
			var functype = type=='fill'?'Fill':'Stroke';
			canvas['set'+ functype +'Color']("url(#" + grad.id + ")");
		});
	}

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
	
	// Group: Fill and Stroke

	this.setStrokePaint = function(p, addGrad) {
		// make a copy
		var p = new $.jGraduate.Paint(p);
		this.setStrokeOpacity(p.alpha/100);

		// now set the current paint object
		cur_properties.stroke_paint = p;
		if (p.type == "solidColor") {
			this.setStrokeColor(p.solidColor != "none" ? "#"+p.solidColor : "none");
		}
		else if(p.type == "linearGradient") {
			canvas.strokeGrad = p.linearGradient;
			if(addGrad) addGradient(); 
		}
		else if(p.type == "radialGradient") {
			canvas.strokeGrad = p.radialGradient;
			if(addGrad) addGradient(); 
		}
		else {
//			console.log("none!");
		}
	};

	this.setFillPaint = function(p, addGrad) {
		// make a copy
		var p = new $.jGraduate.Paint(p);
		this.setFillOpacity(p.alpha/100, true);

		// now set the current paint object
		cur_properties.fill_paint = p;
		if (p.type == "solidColor") {
			this.setFillColor(p.solidColor != "none" ? "#"+p.solidColor : "none");
		}
		else if(p.type == "linearGradient") {
			canvas.fillGrad = p.linearGradient;
			if(addGrad) addGradient(); 
		}
		else if(p.type == "radialGradient") {
			canvas.fillGrad = p.radialGradient;
			if(addGrad) addGradient(); 
		}
		else {
//			console.log("none!");
		}
	};

	this.getStrokeWidth = function() {
		return cur_properties.stroke_width;
	};

	// When attempting to set a line's width to 0, change it to 1 instead
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
			this.changeSelectedAttribute("stroke-width", val, elems);
		}
	};

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
			this.changeSelectedAttribute(attr, val, elems);
		}
	};
	
	this.getOpacity = function() {
		return cur_shape.opacity;
	};

	this.setOpacity = function(val) {
		cur_shape.opacity = val;
		this.changeSelectedAttribute("opacity", val);
	};

	this.getFillOpacity = function() {
		return cur_shape.fill_opacity;
	};

	this.setFillOpacity = function(val, preventUndo) {
		cur_shape.fill_opacity = val;
		if (!preventUndo)
			this.changeSelectedAttribute("fill-opacity", val);
		else
			this.changeSelectedAttributeNoUndo("fill-opacity", val);
	};

	this.getStrokeOpacity = function() {
		return cur_shape.stroke_opacity;
	};

	this.setStrokeOpacity = function(val, preventUndo) {
		cur_shape.stroke_opacity = val;
		if (!preventUndo)
			this.changeSelectedAttribute("stroke-opacity", val);
		else
			this.changeSelectedAttributeNoUndo("stroke-opacity", val);
	};

	// returns an object that behaves like a SVGTransformList
	this.getTransformList = function(elem) {
		// Opera is included here because Opera/Win/Non-EN seems to change 
		// transformlist float vals to use a comma rather than a period.
		if (isWebkit || !support.goodDecimals) {
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
		return null;
	};

	this.getBBox = function(elem) {
		var selected = elem || selectedElements[0];
		if (elem.nodeType != 1) return null;
		var ret = null;
		if(elem.nodeName == 'text' && selected.textContent == '') {
			selected.textContent = 'a'; // Some character needed for the selector to use.
			ret = selected.getBBox();
			selected.textContent = '';
		} else if (elem.nodeName == 'g' && isOpera) {
			// deal with an opera bug here
			// the bbox on a 'g' is not correct if the elements inside have been moved
			// so we create a new g, add all the children to it, add it to the DOM, get its bbox
			// then put all the children back on the old g and remove the new g
			// (this means we make no changes to the DOM, which saves us a lot of headache at
			//  the cost of performance)
			ret = selected.getBBox();
			var newg = document.createElementNS(svgns, "g");
			while (selected.firstChild) { newg.appendChild(selected.firstChild); }
			var i = selected.attributes.length;
			while(i--) { newg.setAttributeNode(selected.attributes.item(i).cloneNode(true)); }
			selected.parentNode.appendChild(newg);
			ret = newg.getBBox();
			while (newg.firstChild) { selected.appendChild(newg.firstChild); }
			selected.parentNode.removeChild(newg);
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

	// we get the rotation angle in the tlist
	this.getRotationAngle = function(elem, to_rad) {
		var selected = elem || selectedElements[0];
		// find the rotation transform (if any) and set it
		var tlist = canvas.getTransformList(selected);
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

	// this should:
	// - remove any old rotations if present
	// - prepend a new rotation at the transformed center
	this.setRotationAngle = function(val,preventUndo) {
		// ensure val is the proper type
		val = parseFloat(val);
		var elem = selectedElements[0];
		var oldTransform = elem.getAttribute("transform");
		var bbox = canvas.getBBox(elem);
		var cx = bbox.x+bbox.width/2, cy = bbox.y+bbox.height/2;
		var tlist = canvas.getTransformList(elem);
		
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
			tlist.insertItemBefore(R_nc,0);
		}
		else if (tlist.numberOfItems == 0) {
			elem.removeAttribute("transform");
		}
		
		if (!preventUndo) {
			// we need to undo it, then redo it so it can be undo-able! :)
			// TODO: figure out how to make changes to transform list undo-able cross-browser?
			var newTransform = elem.getAttribute("transform");
			elem.setAttribute("transform", oldTransform);
			this.changeSelectedAttribute("transform",newTransform,selectedElements);
		}
		var pointGripContainer = getElem("pathpointgrip_container");
// 		if(elem.nodeName == "path" && pointGripContainer) {
// 			pathActions.setPointContainerTransform(elem.getAttribute("transform"));
// 		}
		var selector = selectorManager.requestSelector(selectedElements[0]);
		selector.resize();
		selector.updateGripCursors(val);
	};

	this.each = function(cb) {
		$(svgroot).children().each(cb);
	};

	this.bind = function(event, f) {
	  var old = events[event];
		events[event] = f;
		return old;
	};

	this.setIdPrefix = function(p) {
		idprefix = p;
	};

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

	this.setBold = function(b) {
		var selected = selectedElements[0];
		if (selected != null && selected.tagName  == "text" &&
			selectedElements[1] == null) 
		{
			this.changeSelectedAttribute("font-weight", b ? "bold" : "normal");
		}
	};

	this.getItalic = function() {
		var selected = selectedElements[0];
		if (selected != null && selected.tagName  == "text" &&
			selectedElements[1] == null) 
		{
			return (selected.getAttribute("font-style") == "italic");
		}
		return false;
	};

	this.setItalic = function(i) {
		var selected = selectedElements[0];
		if (selected != null && selected.tagName  == "text" &&
			selectedElements[1] == null) 
		{
			this.changeSelectedAttribute("font-style", i ? "italic" : "normal");
		}
	};

	this.getFontFamily = function() {
		return cur_text.font_family;
	};

	this.setFontFamily = function(val) {
    	cur_text.font_family = val;
		this.changeSelectedAttribute("font-family", val);
	};

	this.getFontSize = function() {
		return cur_text.font_size;
	};

	this.setFontSize = function(val) {
		cur_text.font_size = val;
		this.changeSelectedAttribute("font-size", val);
	};

	this.getText = function() {
		var selected = selectedElements[0];
		if (selected == null) { return ""; }
		return selected.textContent;
	};

	this.setTextContent = function(val) {
		this.changeSelectedAttribute("#text", val);
	};

	this.setImageURL = function(val) {
		svgCanvas.changeSelectedAttribute("#href", val);
	};

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
	
	this.setSegType = function(new_type) {
		pathActions.setSegType(new_type);
	}
	
	var ffClone = function(elem) {
		// Hack for Firefox bugs where text element features aren't updated
		if(navigator.userAgent.indexOf('Gecko/') == -1) return elem;
		var clone = elem.cloneNode(true)
		elem.parentNode.insertBefore(clone, elem);
		elem.parentNode.removeChild(elem);
		selectorManager.releaseSelector(elem);
		selectedElements[0] = clone;
		selectorManager.requestSelector(clone).showGrips(true);
		return clone;
	}

	// New functions for refactoring of Undo/Redo
	
	// this is the stack that stores the original values, the elements and
	// the attribute name for begin/finish
	var undoChangeStackPointer = -1;
	var undoableChangeStack = [];
	
	// This function tells the canvas to remember the old values of the 
	// attrName attribute for each element sent in.  The elements and values 
	// are stored on a stack, so the next call to finishUndoableChange() will 
	// pop the elements and old values off the stack, gets the current values
	// from the DOM and uses all of these to construct the undo-able command.
	this.beginUndoableChange = function(attrName, elems) {
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
	
	// This function makes the changes to the elements
	this.changeSelectedAttributeNoUndo = function(attr, newValue, elems) {
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
			// Set x,y vals on elements that don't have them
			if((attr == 'x' || attr == 'y') && $.inArray(elem.tagName, ['g', 'polyline', 'path']) != -1) {
				var bbox = canvas.getStrokedBBox([elem]);
				var diff_x = attr == 'x' ? newValue - bbox.x : 0;
				var diff_y = attr == 'y' ? newValue - bbox.y : 0;
				canvas.moveSelectedElements(diff_x*current_zoom, diff_y*current_zoom, true);
				continue;
			}
			
			// only allow the transform/opacity attribute to change on <g> elements, slightly hacky
			if (elem.tagName == "g" && (attr != "transform" && attr != "opacity")) continue;
			var oldval = attr == "#text" ? elem.textContent : elem.getAttribute(attr);
			if (oldval == null)  oldval = "";
			if (oldval != String(newValue)) {
				if (attr == "#text") {
					var old_w = canvas.getBBox(elem).width;
					elem.textContent = newValue;
					elem = ffClone(elem);
					
					// Hoped to solve the issue of moving text with text-anchor="start",
					// but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
					
// 					var box=canvas.getBBox(elem), left=box.x, top=box.y, width=box.width,
// 						height=box.height, dx = width - old_w, dy=0;
// 					var angle = canvas.getRotationAngle(elem, true);
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
					elem.setAttributeNS(xlinkns, "xlink:href", newValue);
        		}
				else elem.setAttribute(attr, newValue);
				if (i==0)
					selectedBBoxes[i] = this.getBBox(elem);
				// Use the Firefox ffClone hack for text elements with gradients or
				// where other text attributes are changed. 
				if(elem.nodeName == 'text') {
					if((newValue+'').indexOf('url') == 0 || $.inArray(attr, ['font-size','font-family','x','y']) != -1) {
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
				var angle = canvas.getRotationAngle(elem);
				if (angle != 0 && attr != "transform") {
					var tlist = canvas.getTransformList(elem);
					var n = tlist.numberOfItems;
					while (n--) {
						var xform = tlist.getItem(n);
						if (xform.type == 4) {
							// remove old rotate
							tlist.removeItem(n);
							
							var box = canvas.getBBox(elem);
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
	
	// This function returns a BatchCommand object which summarizes the
	// change since beginUndoableChange was called.  The command can then
	// be added to the command history
	this.finishUndoableChange = function() {
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

	// If you want to change all selectedElements, ignore the elems argument.
	// If you want to change only a subset of selectedElements, then send the
	// subset to this function in the elems argument.
	this.changeSelectedAttribute = function(attr, val, elems) {
		var elems = elems || selectedElements;
		canvas.beginUndoableChange(attr, elems);
		var i = elems.length;

		canvas.changeSelectedAttributeNoUndo(attr, val, elems);

		var batchCmd = canvas.finishUndoableChange();
		if (!batchCmd.isEmpty()) { 
			addCommandToHistory(batchCmd);
		}
	};
	
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
		canvas.clearSelection();
	};
	
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
		canvas.clearSelection();
		canvas.addToSelection([g], true);
	};

	this.ungroupSelectedElement = function() {
		var g = selectedElements[0];
		if (g.tagName == "g") {
			var batchCmd = new BatchCommand("Ungroup Elements");
			var parent = g.parentNode;
			var anchor = g.previousSibling;
			var children = new Array(g.childNodes.length);
			var xform = g.getAttribute("transform");
			// get consolidated matrix
			var glist = canvas.getTransformList(g);
			var m = transformListToTransform(glist).matrix;

			// TODO: get all fill/stroke properties from the group that we are about to destroy
			// "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset", 
			// "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", 
			// "stroke-width"
			// and then for each child, if they do not have the attribute (or the value is 'inherit')
			// then set the child's attribute

			// TODO: get the group's opacity and propagate it down to the children (multiply it
			// by the child's opacity (or 1.0)
			
			var i = 0;
			var gangle = canvas.getRotationAngle(g);
			while (g.firstChild) {
				var elem = g.firstChild;
				var oldNextSibling = elem.nextSibling;
				var oldParent = elem.parentNode;
				children[i++] = elem = parent.insertBefore(elem, anchor);
				batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));

				var chtlist = canvas.getTransformList(elem);
				
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
						var cangle = canvas.getRotationAngle(elem);
						if (cangle) {
							rcm = chtlist.getItem(0).matrix;
						}
						
						// get child's old center of rotation
						var cbox = canvas.getBBox(elem);
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
			canvas.clearSelection();
			
			// delete the group element (but make undo-able)
			g = parent.removeChild(g);
			batchCmd.addSubCommand(new RemoveElementCommand(g, parent));

			if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
			
			// update selection
			canvas.addToSelection(children);
		}
	};

	this.moveToTopSelectedElement = function() {
		var selected = selectedElements[0];
		if (selected != null) {
			var t = selected;
			var oldParent = t.parentNode;
			var oldNextSibling = t.nextSibling;
			if (oldNextSibling == selectorManager.selectorParentGroup) oldNextSibling = null;
			t = t.parentNode.appendChild(t);
			addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "top"));
		}
	};

	this.moveToBottomSelectedElement = function() {
		var selected = selectedElements[0];
		if (selected != null) {
			var t = selected;
			var oldParent = t.parentNode;
			var oldNextSibling = t.nextSibling;
			if (oldNextSibling == selectorManager.selectorParentGroup) oldNextSibling = null;
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
					selectedBBoxes[i] = this.getBBox(selected);
				
				var xform = svgroot.createSVGTransform();
				var tlist = canvas.getTransformList(selected);
				
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
				
				tlist.insertItemBefore(xform, 0);
				
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

	var getPathBBox = function(path) {
		// Get correct BBox for a path in Webkit
	
		// Converted from code found here:
		// http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
	
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
	
	this.updateCanvas = function(w, h, w_orig, h_orig) {
		svgroot.setAttribute("width", w);
		svgroot.setAttribute("height", h);
		var bg = $('#canvasBackground')[0];
		var old_x = svgcontent.getAttribute('x');
		var old_y = svgcontent.getAttribute('y');
		var x = (w/2 - svgcontent.getAttribute('width')*current_zoom/2);
		var y = (h/2 - svgcontent.getAttribute('height')*current_zoom/2);

		assignAttributes(svgcontent, {
			'x': x,
			'y': y
		});
		
		assignAttributes(bg, {
			width: svgcontent.getAttribute('width') * current_zoom,
			height: svgcontent.getAttribute('height') * current_zoom,
			x: x,
			y: y
		});
		
		selectorManager.selectorParentGroup.setAttribute("transform","translate(" + x + "," + y + ")");
		
		return {x:x, y:y, old_x:old_x, old_y:old_y, d_x:x - old_x, d_y:y - old_y};
	}

	this.getStrokedBBox = function(elems) {
		if(!elems) elems = canvas.getVisibleElements();
		if(!elems.length) return false;
		// Make sure the expected BBox is returned if the element is a group
		var getCheckedBBox = function(elem) {
		
			try {
				// TODO: Fix issue with rotated groups. Currently they work
				// fine in FF, but not in other browsers (same problem mentioned
				// in Issue 339 comment #2).
				
				var bb = canvas.getBBox(elem);
				
				var angle = canvas.getRotationAngle(elem);
				if ((angle && angle % 90) || hasMatrixTransform(canvas.getTransformList(elem))) {
					// Accurate way to get BBox of rotated element in Firefox:
					// Put element in group and get its BBox
					
					var good_bb = false;
					
					// Get the BBox from the raw path for these elements
					var elemNames = ['ellipse','path','line','polyline','polygon'];
					if($.inArray(elem.tagName, elemNames) != -1) {
						bb = good_bb = canvas.convertToPath(elem, true, angle);
					} else if(elem.tagName == 'rect') {
						// Look for radius
						var rx = elem.getAttribute('rx');
						var ry = elem.getAttribute('ry');
						if(rx || ry) {
							bb = good_bb = canvas.convertToPath(elem, true, angle);
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

	this.getVisibleElements = function(parent, includeBBox) {
		if(!parent) parent = $(svgcontent).children(); // Prevent layers from being included
		
		var contentElems = [];
		$(parent).children().each(function(i, elem) {
			try {
				var box = elem.getBBox();
				if (box) {
					var item = includeBBox?{'elem':elem, 'bbox':canvas.getStrokedBBox([elem])}:elem;
					contentElems.push(item);
				}
			} catch(e) {}
		});
		return contentElems.reverse();
	}
	
	this.cycleElement = function(next) {
		var cur_elem = selectedElements[0];
		var elem = false;
		var all_elems = this.getVisibleElements(current_layer);
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
		canvas.clearSelection();
		canvas.addToSelection([elem], true);
		call("selected", selectedElements);
	}

	var resetUndoStack = function() {
		undoStack = [];
		undoStackPointer = 0;
	};

	this.getUndoStackSize = function() { return undoStackPointer; };
	this.getRedoStackSize = function() { return undoStack.length - undoStackPointer; };

	this.getNextUndoCommandText = function() { 
		if (undoStackPointer > 0) 
			return undoStack[undoStackPointer-1].text;
		return "";
	};
	this.getNextRedoCommandText = function() { 
		if (undoStackPointer < undoStack.length) 
			return undoStack[undoStackPointer].text;
		return "";
	};

	this.undo = function() {
		if (undoStackPointer > 0) {
			this.clearSelection();
			var cmd = undoStack[--undoStackPointer];
			cmd.unapply();
			pathActions.clear();
			call("changed", cmd.elements());
		}
	};
	this.redo = function() {
		if (undoStackPointer < undoStack.length && undoStack.length > 0) {
			this.clearSelection();
			var cmd = undoStack[undoStackPointer++];
			cmd.apply();
			pathActions.clear();
			call("changed", cmd.elements());
		}
	};

	// this function no longer uses cloneNode because we need to update the id
	// of every copied element (even the descendants)
	// we also do it manually because Opera/Win/non-EN puts , instead of .
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
		if((isWebkit || !support.goodDecimals) && el.nodeName == 'path') {
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
		if(new_el.tagName == 'image') {
			preventClickDefault(new_el);
		}
		return new_el;
	};
	
	var preventClickDefault = function(img) {
     	$(img).click(function(e){e.preventDefault()});
	}
	
	// this creates deep DOM copies (clones) of all selected elements
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
			this.addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
			this.moveSelectedElements(20,20,false);
			addCommandToHistory(batchCmd);
			call("selected", selectedElements);
		}
	};

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
			bg_img.setAttributeNS(xlinkns, "xlink:href", url);
			bg.appendChild(bg_img);
		} else if(bg_img) {
			bg_img.parentNode.removeChild(bg_img);
		}
	}

	// aligns selected elements (type is a char - see switch below for explanation)
	// relative_to can be "selected", "largest", "smallest", "page"
	this.alignSelectedElements = function(type, relative_to) {
		var bboxes = [], angles = [];
		var minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE, miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
		var curwidth = Number.MIN_VALUE, curheight = Number.MIN_VALUE;
		var len = selectedElements.length;
		if (!len) return;
		for (var i = 0; i < len; ++i) {
			if (selectedElements[i] == null) break;
			var elem = selectedElements[i];
			bboxes[i] = canvas.getStrokedBBox([elem]);
			
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
			maxx = svgcontent.getAttribute('width');
			maxy = svgcontent.getAttribute('height');
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
	this.getZoom = function(){return current_zoom;};
	
	// Function: getVersion
	// Returns a string which describes the revision number of SvgCanvas.
	this.getVersion = function() {
		return "svgcanvas.js ($Rev$)";
	};
	
	this.setUiStrings = function(strs) {
		$.extend(uiStrings, strs);
	}

	this.setConfig = function(opts) {
		$.extend(curConfig, opts);
	}
	
	this.clear();

	function getElem(id) {
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
	
	// Being able to access private methods publicly seems wrong somehow,
	// but currently appears to be the best way to allow testing and provide
	// access to them to plugins.
	this.getPrivateMethods = function() {
		return {
			addCommandToHistory: addCommandToHistory,
			addGradient: addGradient,
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
			fromXml: fromXml,
			getElem: getElem,
			getId: getId,
			getIntersectionList: getIntersectionList,
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
			removeUnusedGrads: removeUnusedGrads,
			resetUndoStack: resetUndoStack,
			round: round,
			runExtensions: runExtensions,
			sanitizeSvg: sanitizeSvg,
			Selector: Selector,
			SelectorManager: SelectorManager,
			shortFloat: shortFloat,
			svgCanvasToString: svgCanvasToString,
			SVGEditTransformList: SVGEditTransformList,
			svgToString: svgToString,
			toString: toString,
			toXml: toXml,
			transformBox: transformBox,
			transformListToTransform: transformListToTransform,
			transformPoint: transformPoint,
			transformToObj: transformToObj,
			walkTree: walkTree
		}
	}
	
	this.addExtension = function(name, ext_func) {
		if(!(name in extensions)) {
			// Provide private vars/funcs here. Is there a better way to do this?
			var ext = ext_func($.extend(canvas.getPrivateMethods(), {
				svgroot: svgroot,
				svgcontent: svgcontent,
				nonce: nonce,
				selectorManager: selectorManager
			}));
			extensions[name] = ext;
			call("extension_added", ext);
		} else {
			console.log('Cannot add extension "' + name + '", an extension by that name already exists"');
		}
	};
	
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
		
		// Correct decimals on clone attributes (Opera/win/non-en)
		var rect = document.createElementNS(svgns,'rect');
		rect.setAttribute('x',.1);
		var crect = rect.cloneNode(false);
		support.goodDecimals = (crect.getAttribute('x').indexOf(',') == -1);
		
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
// Static class for various utility functions

var Utils = {

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//           also precalculate the size of the array needed.

	"_keyStr" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

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

			output[p++] = this._keyStr.charAt(enc1);
			output[p++] = this._keyStr.charAt(enc2);
			output[p++] = this._keyStr.charAt(enc3);
			output[p++] = this._keyStr.charAt(enc4);
		} while (i < input.length);

		return output.join('');
	},
	
	"decode64" : function(input) {
		if(window.atob) return window.atob(input);
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
	
		 // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
		 do {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
	
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
	
	// based on http://phpjs.org/functions/utf8_encode:577
	// codedread:does not seem to work with webkit-based browsers on OSX
	"encodeUTF8": function(input) {
		//return unescape(encodeURIComponent(input)); //may or may not work
		var output = '';
		for (var n = 0; n < input.length; n++){
			var c = input.charCodeAt(n);
			if (c < 128) {
				output += input[n];
			}
			else if (c > 127) {
				if (c < 2048){
					output += String.fromCharCode((c >> 6) | 192);
				} 
				else {
					output += String.fromCharCode((c >> 12) | 224) + String.fromCharCode((c >> 6) & 63 | 128);
				}
				output += String.fromCharCode((c & 63) | 128);
			}
		}
		return output;
	},
	
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

	"rectsIntersect": function(r1, r2) {
		return r2.x < (r1.x+r1.width) && 
			(r2.x+r2.width) > r1.x &&
			r2.y < (r1.y+r1.height) &&
			(r2.y+r2.height) > r1.y;
	},

	// found this function http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
	"text2xml": function(sXML) {
		// NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
		//return $(xml)[0];
		var out;
		try{
			var dXML = ($.browser.msie)?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
			dXML.async = false;
		} catch(e){ 
			throw new Error("XML Parser could not be instantiated"); 
		};
		try{
			if($.browser.msie) out = (dXML.loadXML(sXML))?dXML:false;
			else out = dXML.parseFromString(sXML, "text/xml");
		}
		catch(e){ throw new Error("Error parsing XML string"); };
		return out;
	}

};
