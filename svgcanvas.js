if(!window.console) {
	window.console = {};
	window.console.log = function(str) {};
	window.console.dir = function(str) {};
}
if( window.opera ) {
	window.console.log = function(str) {opera.postError(str);}
}

// this defines which elements and attributes that we support
// TODO: add <a> elements to this
// TODO: add <tspan> to this
var svgWhiteList = {
	"circle": ["cx", "cy", "fill", "fill-opacity", "id", "opacity", "r", "stroke", "stroke-dasharray", "stroke-opacity", "stroke-width", "transform"],
	"defs": [],
	"ellipse": ["cx", "cy", "fill", "fill-opacity", "id", "opacity", "rx", "ry", "stroke", "stroke-dasharray", "stroke-opacity", "stroke-width", "transform"],
	"g": ["id", "display", "transform"],
	"image": ["height", "id", "opacity", "transform", "width", "x", "xlink:href", "xlink:title", "y"],
	"line": ["fill", "fill-opacity", "id", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-opacity", "stroke-width",  "transform", "x1", "x2", "y1", "y2"],
	"linearGradient": ["id", "gradientTransform", "gradientUnits", "spreadMethod", "x1", "x2", "y1", "y2"],
	"path": ["d", "fill", "fill-opacity", "id", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-width", "transform"],
	"polygon": ["id", "fill", "fill-opacity", "id", "opacity", "points", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-width", "transform"],
	"polyline": ["id", "fill", "fill-opacity", "opacity", "points", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-width", "transform"],
	"radialGradient": ["id", "cx", "cy", "fx", "fy", "gradientTransform", "gradientUnits", "r", "spreadMethod"],
	"rect": ["fill", "fill-opacity", "height", "id", "opacity", "rx", "ry", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-width", "transform", "width", "x", "y"],
	"stop": ["id", "offset", "stop-color", "stop-opacity"],
	"svg": ["id", "height", "transform", "viewBox", "width", "xmlns", "xmlns:xlink"],
	"text": ["fill", "fill-opacity", "font-family", "font-size", "font-style", "font-weight", "id", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity", "stroke-width", "transform", "text-anchor", "x", "y"],
	"title": [],
};

var toXml = function(str) {
	return str.replace("&", "&amp;").replace("<", "&lt;").replace(">","&gt;");
};
var fromXml = function(str) {
	return str.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&");
};

function SvgCanvas(c)
{

var pathFuncsStrs = ['Moveto','Lineto','CurvetoCubic','CurvetoQuadratic','Arc','LinetoHorizontal','LinetoVertical','CurvetoCubicSmooth','CurvetoQuadraticSmooth']
var pathFuncs = [0,'ClosePath'];
$.each(pathFuncsStrs,function(i,s){pathFuncs.push(s+'Abs');pathFuncs.push(s+'Rel');});

// These command objects are used for the Undo/Redo stack
// attrs contains the values that the attributes had before the change
function ChangeElementCommand(elem, attrs, text) {
	this.elem = elem;
	this.text = text ? ("Change " + elem.tagName + " " + text) : ("Change " + elem.tagName);
	this.newValues = {};
	this.oldValues = attrs;
	for (attr in attrs) {
		if (attr == "#text") this.newValues[attr] = elem.textContent;
		else this.newValues[attr] = elem.getAttribute(attr);
	}

	this.apply = function() {
		var bChangedTransform = false;
		for( attr in this.newValues ) {
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
				var cx = round(bbox.x + bbox.width/2),
					cy = round(bbox.y + bbox.height/2);
				var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
				if (rotate != elem.getAttribute("transform")) {
					elem.setAttribute("transform", rotate);
				}
			}
		}
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgzoom) {
			canvas.identifyLayers();
		}		
		return true;
	};

	this.unapply = function() {
		var bChangedTransform = false;
		for( attr in this.oldValues ) {
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
				var cx = round(bbox.x + bbox.width/2),
					cy = round(bbox.y + bbox.height/2);
				var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
				if (rotate != elem.getAttribute("transform")) {
					elem.setAttribute("transform", rotate);
				}
			}
		}
		// if we are changing layer names, re-identify all layers
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgzoom) {
			canvas.identifyLayers();
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
		if (this.parent == svgzoom) {
			canvas.identifyLayers();
		}		
	};

	this.unapply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.elem.parentNode.removeChild(this.elem);
		if (this.parent == svgzoom) {
			canvas.identifyLayers();
		}		
	};

	this.elements = function() { return [this.elem]; };
}

function RemoveElementCommand(elem, parent, text) {
	this.elem = elem;
	this.text = text || ("Delete " + elem.tagName);
	this.parent = parent;

	this.apply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.parent.removeChild(this.elem);
		if (this.parent == svgzoom) {
			canvas.identifyLayers();
		}		
	};

	this.unapply = function() { 
		this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); 
		if (this.parent == svgzoom) {
			canvas.identifyLayers();
		}		
	};

	this.elements = function() { return [this.elem]; };
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
		if (this.newParent == svgzoom) {
			canvas.identifyLayers();
		}
	};

	this.unapply = function() {
		this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
		if (this.oldParent == svgzoom) {
			canvas.identifyLayers();
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
	// FIXME: what's the right way to make this 'class' private to the SelectorManager? 
	function Selector(id, elem) {
		// this is the selector's unique number
		this.id = id;

		// this holds a reference to the element for which this selector is being used
		this.selectedElement = elem;

		// this is a flag used internally to track whether the selector is being used or not
		this.locked = true;

		// this function is used to reset the id and element that the selector is attached to
		this.reset = function(e) {
			this.locked = true;
			this.selectedElement = e;
			this.resize();
			selectorManager.update();
			this.selectorGroup.setAttribute("display", "inline");
		};

		// this holds a reference to the <g> element that holds all visual elements of the selector
		this.selectorGroup = addSvgElementFromJson({ "element": "g",
													"attr": {"id": ("selectorGroup"+this.id)}
													});

		// this holds a reference to <rect> element
		this.selectorRect = this.selectorGroup.appendChild( addSvgElementFromJson({
								"element": "rect",
								"attr": {
									"id": ("selectedBox"+this.id),
									"fill": "none",
									"stroke": "blue",
									"stroke-width": "1",
									"stroke-dasharray": "5,5",
									"width": 1,
									"height": 1,
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
								"id": ("selectorGrip_rotate_connector_" + this.id),
								"stroke": "blue",
								"stroke-width": "1"
							}
						}) );
		this.rotateGrip = this.selectorGroup.appendChild( addSvgElementFromJson({
							"element": "circle",
							"attr": {
								"id": ("selectorGrip_rotate_" + this.id),
								"fill": "lime",
								"r": 4,
								"stroke": "blue",
								"stroke-width": 2,
								"style": "cursor:url(images/rotate.png) 12 12, auto;"
							}
						}) );
		
		// add the corner grips
		for (dir in this.selectorGrips) {
			this.selectorGrips[dir] = this.selectorGroup.appendChild( 
				addSvgElementFromJson({
					"element": "rect",
					"attr": {
						"id": ("selectorGrip_" + dir + "_" + this.id),
						"fill": "blue",
						"width": 6,
						"height": 6,
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
			$('#'+this.selectorGrips[dir].id).mousedown( function() {
				current_mode = "resize";
				current_resize_mode = this.id.substr(13,this.id.indexOf("_",13)-13);
			});
			$('#selectorGrip_rotate_'+id).mousedown( function() {
				current_mode = "rotate";
			});
		}

		this.showGrips = function(show) {
			// TODO: use suspendRedraw() here
			var bShow = show ? "inline" : "none";
			this.rotateGrip.setAttribute("display", bShow);
			this.rotateGripConnector.setAttribute("display", bShow);
			var elem = this.selectedElement;
			if(elem && (elem.tagName == "text" || elem.tagName == "g")) bShow = "none";
			for (dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute("display", bShow);
			}
			if(elem) this.updateGripCursors(canvas.getRotationAngle(elem));
		};
		
		// Updates cursors for corner grips on rotation so arrows point the right way
		this.updateGripCursors = function(angle) {
			var dir_arr = [];
			var steps = Math.round(angle / 45);
			if(steps < 0) steps += 8;
			for (dir in this.selectorGrips) {
				dir_arr.push(dir);
			}
			while(steps > 0) {
				dir_arr.push(dir_arr.shift());
				steps--;
			}
			var i = 0;
			for (dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute('style', ("cursor:" + dir_arr[i] + "-resize"));
				i++;
			};
		};
		
		this.resize = function(cur_bbox) {
			var selectedBox = this.selectorRect;
			var selectedGrips = this.selectorGrips;
			var selected = this.selectedElement;
			var sw = round(selected.getAttribute("stroke-width"));
			var offset = 1/canvas.getZoom();
			if (selected.getAttribute("stroke") != "none" && !isNaN(sw)) {
				offset += sw/2;
			}
			if (selected.tagName == "text") {
				offset += 2/canvas.getZoom();
			}
			var oldbox = canvas.getBBox(this.selectedElement);
			var bbox = cur_bbox || oldbox;
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset<<1), h=bbox.height+(offset<<1);
			var sr_handle = svgroot.suspendRedraw(100);
			l*=current_zoom;
			t*=current_zoom;
			w*=current_zoom;
			h*=current_zoom;
			assignAttributes(selectedBox, {
				'x': l,
				'y': t,
				'width': w,
				'height': h
			});
			
			var gripCoords = {
				nw: [l-3, 		t-3],
				ne: [l+w-3, 	t-3],
				sw: [l-3, 		t+h-3],
				se: [l+w-3, 	t+h-3],
				n:  [l+w/2-3, 	t-3],
				w:	[l-3, 		t+h/2-3],
				e:	[l+w-3, 	t+h/2-3],
				s:	[l+w/2-3, 	t+h-3]
			};
			$.each(gripCoords, function(dir, coords) {
				assignAttributes(selectedGrips[dir], {
					x: coords[0], y: coords[1]
				});
			});
			
			assignAttributes(this.rotateGripConnector, { x1: l+w/2, y1: t-20, x2: l+w/2, y2: t });
			assignAttributes(this.rotateGrip, { cx: l+w/2, cy: t-20 });
			
			// empty out the transform attribute
			this.selectorGroup.setAttribute("transform", "");
			this.selectorGroup.removeAttribute("transform");
			
			// align selector group with element coordinate axes
			var elem = this.selectedElement;
			var transform = elem.getAttribute("transform");
			var angle = canvas.getRotationAngle(elem);
			if (angle) {
				var cx = round(oldbox.x + oldbox.width/2) * current_zoom
					cy = round(oldbox.y + oldbox.height/2) * current_zoom;
				this.selectorGroup.setAttribute("transform", "rotate("+angle+" " + cx + "," + cy + ")");
			}
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
			mgr.update();
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
			var N = this.selectors.length;
			var sel = this.selectorMap[elem.id];
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

		// this keeps the selector groups as the last child in the document
		this.update = function() {
			this.selectorParentGroup = svgroot.appendChild(this.selectorParentGroup);
		};

		this.getRubberBandBox = function() {
			if (this.rubberBandBox == null) {
				this.rubberBandBox = this.selectorParentGroup.appendChild(
						addSvgElementFromJson({ "element": "rect",
							"attr": {
								"id": "selectorRubberBand",
								"fill": "blue",
								"fill-opacity": 0.15,
								"stroke": "blue",
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

	var addSvgElementFromJson = function(data) {
		return canvas.updateElementFromJson(data)
	};

	var assignAttributes = function(node, attrs, suspendLength) {
		if(!suspendLength) suspendLength = 0;
		var handle = svgroot.suspendRedraw(suspendLength);

		for (i in attrs) {
			node.setAttributeNS(null, i, attrs[i]);
		}
		
		svgroot.unsuspendRedraw(handle);
	};

	// remove unneeded attributes
	// makes resulting SVG smaller
	var cleanupElement = function(element) {
		var handle = svgroot.suspendRedraw(60);
		if (element.getAttribute('fill-opacity') == '1')
			element.removeAttribute('fill-opacity');
		if (element.getAttribute('opacity') == '1')
			element.removeAttribute('opacity');
		if (element.getAttribute('stroke') == 'none')
			element.removeAttribute('stroke');
		if (element.getAttribute('stroke-dasharray') == 'none')
			element.removeAttribute('stroke-dasharray');
		if (element.getAttribute('stroke-opacity') == '1')
			element.removeAttribute('stroke-opacity');
		if (element.getAttribute('stroke-width') == '1')
			element.removeAttribute('stroke-width');
		if (element.getAttribute('rx') == '0')
			element.removeAttribute('rx')
		if (element.getAttribute('ry') == '0')
			element.removeAttribute('ry')
		svgroot.unsuspendRedraw(handle);
	};

	this.updateElementFromJson = function(data) {
		var shape = svgdoc.getElementById(data.attr.id);
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
		assignAttributes(shape, data.attr, 100);
		cleanupElement(shape);
		return shape;
	};

	// TODO: declare the variables and set them as null, then move this setup stuff to
	// an initialization function - probably just use clear()
	var canvas = this;
	var container = c;
	var svgns = "http://www.w3.org/2000/svg";
	var xlinkns = "http://www.w3.org/1999/xlink";
	var idprefix = "svg_";
	var svgdoc  = c.ownerDocument;
	var svgroot = svgdoc.createElementNS(svgns, "svg");
	svgroot.setAttribute("width", 640);
	svgroot.setAttribute("height", 480);
	svgroot.setAttribute("id", "svgroot");
	svgroot.setAttribute("xmlns", svgns);
	svgroot.setAttribute("xmlns:xlink", xlinkns);
	container.appendChild(svgroot);
	var svgzoom = svgdoc.createElementNS(svgns, "svg");
	svgzoom.setAttribute('id', 'svgzoom');
	svgzoom.setAttribute('viewBox', '0 0 640 480');
	svgzoom.setAttribute("xmlns", svgns);
	svgzoom.setAttribute("xmlns:xlink", xlinkns);
	svgroot.appendChild(svgzoom);
	var comment = svgdoc.createComment(" created with SVG-edit - http://svg-edit.googlecode.com/ ");
	svgzoom.appendChild(comment);
	// TODO For Issue 208: this is a start on a thumbnail
//	var svgthumb = svgdoc.createElementNS(svgns, "use");
//	svgthumb.setAttribute('width', '100');
//	svgthumb.setAttribute('height', '100');
//	svgthumb.setAttributeNS(xlinkns, 'href', '#svgzoom');
//	svgroot.appendChild(svgthumb);
	// z-ordered array of tuples containing layer names and <g> elements
	// the first layer is the one at the bottom of the rendering
	var all_layers = [];
	// pointer to the current layer <g>
	var current_layer = null;
	
	var d_attr = null;
	var started = false;
	var obj_num = 1;
	var start_x = null;
	var start_y = null;
	var current_mode = "select";
	var current_resize_mode = "none";
	
	var all_properties = {
		shape: {
			fill: "#FF0000",
			fill_paint: null,
			fill_opacity: 1,
			stroke: "#000000",
			stroke_paint: null,
			stroke_opacity: 1,
			stroke_width: 5,
			stroke_style: 'none',
			opacity: 1
		}
	};
	
	all_properties.text = $.extend(true, {}, all_properties.shape);
	$.extend(all_properties.text, {
		fill: "#000000",
		stroke_width: 0,
		font_size: '12pt',
		font_family: 'serif'
	});

	var cur_shape = all_properties.shape;
	var cur_text = all_properties.text;
	var cur_properties = cur_shape;
	
	var freehand_min_x = null;
	var freehand_max_x = null;
	var freehand_min_y = null;
	var freehand_max_y = null;
	var current_poly = null;
	var current_poly_pts = [];
	var current_poly_pt = -1;
	var current_poly_pt_drag = -1;
	var current_poly_oldd = null;
	var current_ctrl_pt_drag = -1;
	var current_zoom = 1;
	// this will hold all the currently selected elements
	// default size of 1 until it needs to grow bigger
	var selectedElements = new Array(1); 
	// this holds the selected's bbox
	var selectedBBoxes = new Array(1);
	var justSelected = null;
	// this object manages selectors for us
	var selectorManager = new SelectorManager();
	var rubberBox = null;
	var events = {};
	var undoStackPointer = 0;
	var undoStack = [];
	var curBBoxes = [];

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

// private functions
	var getId = function() {
		if (events["getid"]) return call("getid", obj_num);
		return idprefix + obj_num;
	};

	var getNextId = function() {
		// ensure the ID does not exist
		var id = getId();
		while (svgdoc.getElementById(id)) {
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
		}
		if (node.nodeType != 1) return;

		var doc = node.ownerDocument;
		var parent = node.parentNode;
		// can parent ever be null here?  I think the root node's parent is the document...
		if (!doc || !parent) return;

		var allowedAttrs = svgWhiteList[node.nodeName];
		// if this element is allowed
		if (allowedAttrs != undefined) {
			var i = node.attributes.length;
			while (i--) {
				// if the attribute is not in our whitelist, then remove it
				// could use jQuery's inArray(), but I don't know if that's any better
				var attrName = node.attributes.item(i).nodeName;
				if (allowedAttrs.indexOf(attrName) == -1) {
					// TODO: do I need to call setAttribute(..., "") here for Fx2?
					node.removeAttribute(attrName);
				}
			}

			// recurse to children
			i = node.childNodes.length;
			while (i--) { sanitizeSvg(node.childNodes.item(i)); }
		}
		// else, remove this element
		else {
			// remove all children from this node and insert them before this node
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

	var removeUnusedGrads = function() {
		var defs = svgzoom.getElementsByTagNameNS(svgns, "defs");
		if(!defs || !defs.length) return;
		
		var all_els = svgzoom.getElementsByTagNameNS(svgns, '*');
		var grad_uses = [];
		
		$.each(all_els, function(i, el) {
			var fill = el.getAttribute('fill');
			if(fill && fill.indexOf('url(#') == 0) {
				//found gradient
				grad_uses.push(fill);
			} 
			
			var stroke = el.getAttribute('stroke');
			if(stroke && stroke.indexOf('url(#') == 0) {
				//found gradient
				grad_uses.push(stroke);
			} 
		});
		
		var lgrads = svgzoom.getElementsByTagNameNS(svgns, "linearGradient");
		var grad_ids = [];
		var i = lgrads.length;
		while (i--) {
			var grad = lgrads[i];
			var id = grad.getAttribute('id');
			var url_id = 'url(#' + id + ')';
			if($.inArray(url_id, grad_uses) == -1) {
				// Not found, so remove
				grad.parentNode.removeChild(grad);
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
	}
	
	var svgCanvasToString = function() {
		removeUnusedGrads();
		canvas.clearPoly(true);
		var output = svgToString(svgzoom, 0);
		return output;
	}

	var svgToString = function(elem, indent) {
		var out = new Array();
		if (elem) {
			var attrs = elem.attributes;
			var attr;
			var i;
			var childs = elem.childNodes;
			for (i=0; i<indent; i++) out.push(" ");
			out.push("<"); out.push(elem.nodeName);
			for (i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				if (attr.nodeValue != "") {
					if(attr.nodeValue.indexOf('pointer-events') == 0) continue;
					out.push(" "); 
					// map various namespaces to our fixed namespace prefixes
					// TODO: put this into a map and do a look-up instead of if-else
					if (attr.namespaceURI == 'http://www.w3.org/1999/xlink') {
						out.push('xlink:');
					}
					else if(attr.namespaceURI == 'http://www.w3.org/2000/xmlns/' && attr.localName != 'xmlns') {
						out.push('xmlns:');
					}
					out.push(attr.localName); out.push("=\""); 
					out.push(attr.nodeValue); out.push("\"");
				}
			}
			if (elem.hasChildNodes()) {
				out.push(">");
				indent++;
				var bOneLine = false;
				for (i=0; i<childs.length; i++)
				{
					var child = childs.item(i);
					if (child.id == "selectorParentGroup") continue;
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
					for (i=0; i<indent; i++) out.push(" ");
				}
				out.push("</"); out.push(elem.nodeName); out.push(">");
			} else {
				out.push("/>");
			}
		}
		return out.join('');
	}; // end svgToString()

	var recalculateAllSelectedDimensions = function() {
		var text = (current_resize_mode == "none" ? "position" : "size");
		var batchCmd = new BatchCommand(text);

		var i = selectedElements.length;
		while(i--) {
			var cmd = recalculateDimensions(selectedElements[i],selectedBBoxes[i]);
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
	var pathMap = [ 0, 'z', 'm', 'm', 'l', 'l', 'c', 'c', 'q', 'q', 'a', 'a', 
					'l', 'l', 'l', 'l', // TODO: be less lazy below and map them to h and v
					's', 's', 't', 't' ];

	// this function returns the command which resulted from the selected change
	var recalculateDimensions = function(selected,selectedBBox) {
		if (selected == null || selectedBBox == null) return null;
		var box = canvas.getBBox(selected);

		// if we have not moved/resized, then immediately leave
		var xform = selected.getAttribute("transform");
		if ( (!xform || xform == "") && box.x == selectedBBox.x && box.y == selectedBBox.y &&
				box.width == selectedBBox.width && box.height == selectedBBox.height) 
		{
			return null;
		}

		// after this point, we have some change to this element

		var remap = function(x,y) {
				// Prevent division by 0
				if(!box.height) box.height = 1;
				if(!box.width) box.width = 1;
				return { 
							'x':(((x-box.x)/box.width)*selectedBBox.width + selectedBBox.x),
							'y':(((y-box.y)/box.height)*selectedBBox.height + selectedBBox.y)
							};					
			};
		var scalew = function(w) {return (w*selectedBBox.width/box.width);}
		var scaleh = function(h) {return (h*selectedBBox.height/box.height);}

		var batchCmd = new BatchCommand("Transform");
		
		// if there was a rotation transform, re-set it, otherwise empty out the transform attribute
		var angle = canvas.getRotationAngle(selected);
		var pointGripContainer = document.getElementById("polypointgrip_container");
		var ctrlPointGripContainer = document.getElementById("ctrlpointgrip_container");
		if (angle) {
			// this is our old center upon which we have rotated the shape
			var tr_x = round(box.x + box.width/2),
				tr_y = round(box.y + box.height/2);
			var cx = null, cy = null;
			
			var bFoundScale = false;
			var tlist = selected.transform.baseVal;
			var t = tlist.numberOfItems;
			while (t--) {
				var xform = tlist.getItem(t);
				if (xform.type == 3) {
					bFoundScale = true;
					break;
				}
			}
			
			// if this was a resize, find the new cx,cy
			if (bFoundScale) {
				var alpha = angle * Math.PI / 180.0;
			
				// rotate new opposite corners of bbox by angle at old center
				var dx = selectedBBox.x - tr_x,
					dy = selectedBBox.y - tr_y,
					r = Math.sqrt(dx*dx + dy*dy),
					theta = Math.atan2(dy,dx) + alpha;
				var left = r * Math.cos(theta) + tr_x,
					top = r * Math.sin(theta) + tr_y;
			
				dx += selectedBBox.width;
				dy += selectedBBox.height;
				r = Math.sqrt(dx*dx + dy*dy);
				theta = Math.atan2(dy,dx) + alpha;			
				var right = r * Math.cos(theta) + tr_x,
					bottom = r * Math.sin(theta) + tr_y;
			
				// now find mid-point of line between top-left and bottom-right to find new center
				cx = round(left + (right-left)/2);
				cy = round(top + (bottom-top)/2);
			
				// now that we know the center and the axis-aligned width/height, calculate the x,y
				selectedBBox.x = round(cx - selectedBBox.width/2),
				selectedBBox.y = round(cy - selectedBBox.height/2);
			}
			// if it was not a resize, then it was a translation only
			else {
				var tx = selectedBBox.x - box.x,
					ty = selectedBBox.y - box.y;
				cx = tr_x + tx;
				cy = tr_y + ty;
			}
			
			var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
			selected.setAttribute("transform", rotate);
			// if we were rotated, store just the old rotation (not other transforms) on the
			// undo stack
			var changes = {};
			changes["transform"] = ["rotate(", angle, " ", tr_x, ",", tr_y, ")"].join('');
			batchCmd.addSubCommand(new ChangeElementCommand(selected, changes));
			if(pointGripContainer) {
				pointGripContainer.setAttribute("transform", rotate);
			}
			if(ctrlPointGripContainer) {
				ctrlPointGripContainer.setAttribute("transform", rotate);
			}
		}
		else {
			// This fixes Firefox 2- behavior - which does not reset values when the attribute has
			// been removed, see https://bugzilla.mozilla.org/show_bug.cgi?id=320622
			selected.setAttribute("transform", "");
			selected.removeAttribute("transform");
			if(pointGripContainer) {
				pointGripContainer.setAttribute("transform", "");
				pointGripContainer.removeAttribute("transform");
			}
			if(ctrlPointGripContainer) {
				ctrlPointGripContainer.setAttribute("transform", "");
				ctrlPointGripContainer.removeAttribute("transform");
			}			
		}
		
		// if it's a group, transfer the transform attribute to each child element
		// and recursively call recalculateDimensions()
		if (selected.tagName == "g") {
			var children = selected.childNodes;
			var i = children.length;
			while (i--) {
				var child = children.item(i);
				if (child.nodeType == 1) {
					try {
						var childBox = child.getBBox();
						// TODO: to fix the rotation problem, we must account for the
						// child's rotation in the bbox adjustment
						
						// If the child is rotated at all, we should figure out the rotated
						// bbox before the group's transform, remap all four corners of the bbox
						// via the group's transform, then determine the new angle and the new center
						/*
						var childAngle = canvas.getRotationAngle(child) * Math.PI / 180.0;
						var left = childBox.x - gcx, 
							top = childBox.y - gcy,
							right = childBox.x + childBox.width - gcx,
							bottom = childBox.y + childBox.height - gcy;
						
						var ptTopLeft = remap(left,top),
							ptTopRight = remap(right,top),
							ptBottomLeft = remap(left,bottom),
							ptBottomRight = remap(right,bottom);
						*/
						var pt = remap(childBox.x,childBox.y),
							w = scalew(childBox.width),
							h = scaleh(childBox.height);
						childBox.x = pt.x; childBox.y = pt.y;
						childBox.width = w; childBox.height = h;
						batchCmd.addSubCommand(recalculateDimensions(child, childBox));
					} catch(e) {}
				}
			}
			return batchCmd;
		}	

		var changes = {};

		switch (selected.tagName)
		{
		case "g":
			// do work here :P
			break;
		// NOTE: at the moment, there's no way to create an actual polygon element except by 
		// editing source or importing from somewhere else but we'll cover it here anyway
		// polygon is handled just like polyline
		case "polygon": 
		case "polyline":
			// extract the points from the polygon/polyline, adjust it and write back the new points
			// but first, save the old points
			changes["points"] = selected.getAttribute("points");
			var list = selected.points;
			var len = list.numberOfItems;
			var newpoints = "";
			for (var i = 0; i < len; ++i) {
				var pt = list.getItem(i);
				pt = remap(pt.x,pt.y);
				newpoints += pt.x + "," + pt.y + " ";
			}
			selected.setAttributeNS(null, "points", newpoints);
			break;
		case "path":
			// extract the x,y from the path, adjust it and write back the new path
			// but first, save the old path
			changes["d"] = selected.getAttribute("d");
			var M = selected.pathSegList.getItem(0);
			var curx = M.x, cury = M.y;
			var pt = remap(curx,cury);
			var newd = "M" + pt.x + "," + pt.y;
			var segList = selected.pathSegList;
			var len = segList.numberOfItems;
			// for all path segments in the path, we first turn them into relative path segments,
			// then we remap the coordinates from the resize
			for (var i = 1; i < len; ++i) {
				var seg = segList.getItem(i);
				// if these properties are not in the segment, set them to zero
				var x = seg.x || 0,
					y = seg.y || 0,
					x1 = seg.x1 || 0,
					y1 = seg.y1 || 0,
					x2 = seg.x2 || 0,
					y2 = seg.y2 || 0;

				var type = seg.pathSegType;
				switch (type) {
					case 1: // z,Z closepath (Z/z)
						newd += "z";
						continue;
					// turn this into a relative segment then fall through
					case 2: // absolute move (M)
					case 4: // absolute line (L)
					case 12: // absolute horizontal line (H)
					case 14: // absolute vertical line (V)
					case 18: // absolute smooth quad (T)
						x -= curx;
						y -= cury;
					case 3: // relative move (m)
					case 5: // relative line (l)
					case 13: // relative horizontal line (h)
					case 15: // relative vertical line (v)
					case 19: // relative smooth quad (t)
						curx += x;
						cury += y;
						newd += [" ", pathMap[type], scalew(x), ",", scaleh(y)].join('');
						break;
					case 6: // absolute cubic (C)
						x -= curx; x1 -= curx; x2 -= curx;
						y -= cury; y1 -= cury; y2 -= cury;
					case 7: // relative cubic (c)
						curx += x;
						cury += y;
						newd += [" c", scalew(x1), ",", scaleh(y1), " ", scalew(x2), ",", scaleh(y2),
									" ", scalew(x), ",", scaleh(y)].join('');
						break;
					case 8: // absolute quad (Q)
						x -= curx; x1 -= curx;
						y -= cury; y1 -= cury;
					case 9: // relative quad (q) 
						curx += x;
						cury += y;
						newd += [" q", scalew(x1), ",", scaleh(y1), " ", scalew(x), ",", scaleh(y)].join('');
						break;
					case 10: // absolute elliptical arc (A)
						x -= curx;
						y -= cury;
					case 11: // relative elliptical arc (a)
						curx += x;
						cury += y;
						newd += [ "a", scalew(seg.r1), ",", scaleh(seg.r2), " ", seg.angle, " ", 
									(seg.largeArcFlag ? 1 : 0), " ", (seg.sweepFlag ? 1 : 0), " ", 
									scalew(x), ",", scaleh(y) ].join('')
						break;
					case 16: // absolute smooth cubic (S)
						x -= curx; x2 -= curx;
						y -= cury; y2 -= cury;
					case 17: // relative smooth cubic (s)
						curx += x;
						cury += y;
						newd += [" s", scalew(x2), ",", scaleh(y2), " ", scalew(x), ",", scaleh(y)].join('');
						break;
				} // switch on path segment type
			} // for each segment
			selected.setAttributeNS(null, "d", newd);
			break;
		case "line":
			changes["x1"] = selected.getAttribute("x1");
			changes["y1"] = selected.getAttribute("y1");
			changes["x2"] = selected.getAttribute("x2");
			changes["y2"] = selected.getAttribute("y2");
			var pt1 = remap(changes["x1"],changes["y1"]),
				pt2 = remap(changes["x2"],changes["y2"]);
			assignAttributes(selected, {
				'x1': pt1.x,
				'y1': pt1.y,
				'x2': pt2.x,
				'y2': pt2.y,
			}, 1000);
			break;
		case "circle":
			changes["cx"] = selected.getAttribute("cx");
			changes["cy"] = selected.getAttribute("cy");
			changes["r"] = selected.getAttribute("r");
			var pt = remap(changes["cx"], changes["cy"]);
			assignAttributes(selected, {
				'cx': pt.x,
				'cy': pt.y,
	
				// take the minimum of the new selected box's dimensions for the new circle radius
				'r': round(Math.min(selectedBBox.width/2,selectedBBox.height/2))
			}, 1000);
			break;
		case "ellipse":
			changes["cx"] = selected.getAttribute("cx");
			changes["cy"] = selected.getAttribute("cy");
			changes["rx"] = selected.getAttribute("rx");
			changes["ry"] = selected.getAttribute("ry");
			var pt = remap(changes["cx"], changes["cy"]);
			assignAttributes(selected, {
				'cx': pt.x,
				'cy': pt.y,
				'rx': scalew(changes["rx"]),
				'ry': scaleh(changes["ry"])
			}, 1000);
			break;
		case "text":
			changes["x"] = selected.getAttribute("x");
			changes["y"] = selected.getAttribute("y");
			var pt = remap(changes["x"], changes["y"]);
			assignAttributes(selected, {
				'x': pt.x,
				'y': pt.y
			}, 1000);
			break;
    
		case "image":
			changes["x"] = selected.getAttribute("x");
			changes["y"] = selected.getAttribute("y");
			changes["width"] = selected.getAttribute("width");
			changes["height"] = selected.getAttribute("height");
			var pt = remap(changes["x"], changes["y"]);
			assignAttributes(selected, {
				'x': pt.x,
				'y': pt.y,
				'width': scalew(changes["width"]),
				'height': scaleh(changes["height"])
			}, 1000);
			break;
		case "rect":
			changes["x"] = selected.getAttribute("x");
			changes["y"] = selected.getAttribute("y");
			changes["width"] = selected.getAttribute("width");
			changes["height"] = selected.getAttribute("height");
			var pt = remap(changes["x"], changes["y"]);
			assignAttributes(selected, {
				'x': pt.x,
				'y': pt.y,
				'width': scalew(changes["width"]),
				'height': scaleh(changes["height"])
			}, 1000);
			break;
		default: // rect
			console.log("Unknown shape type: " + selected.tagName);
			break;
		}
		if (changes) {
			batchCmd.addSubCommand(new ChangeElementCommand(selected, changes));
		}
		return batchCmd;
	};

// public events

	this.clearSelection = function() {
		if (selectedElements[0] != null) {
			var len = selectedElements.length;
			for (var i = 0; i < len; ++i) {
				var elem = selectedElements[i];
				if (elem == null) break;
				selectorManager.releaseSelector(elem);
				selectedElements[i] = null;
				selectedBBoxes[i] = null;
			}
		}
		call("selected", selectedElements);
	};

	// TODO: do we need to worry about selectedBBoxes here?
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
			if (elem.id.substr(0,13) == "selectorGrip_") continue;
			// if it's not already there, add it
			if (selectedElements.indexOf(elem) == -1) {
				selectedElements[j] = elem;
				selectedBBoxes[j++] = this.getBBox(elem);
				var sel = selectorManager.requestSelector(elem);
				if (selectedElements.length > 1) {
					sel.showGrips(false);
				}
				call("selected", selectedElements);
			}
		}

		if(showGrips) {
			selectorManager.requestSelector(selectedElements[0]).showGrips(true);
		}
		else if (selectedElements.length > 1) {
			selectorManager.requestSelector(selectedElements[0]).showGrips(false);
		}
	};

	// updates the canvas arrays selectedElements and selectedBBoxes
	// TODO: could use slice here to make this faster?
	this.removeFromSelection = function(elemsToRemove) {
		if (selectedElements[0] == null) { return; }
		if (elemsToRemove.length == 0) { return; }

		// find every element and remove it from our array copy
		var newSelectedItems = new Array(selectedElements.length);
		var newSelectedBBoxes = new Array(selectedBBoxes.length);
		var j = 0;
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			var elem = selectedElements[i];
			if (elem) {
				// keep the item
				if (elemsToRemove.indexOf(elem) == -1) {
					newSelectedBBoxes[j] = selectedBBoxes[i];
					newSelectedItems[j++] = elem;
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
	
	this.addNodeToSelection = function(point) {
		// Currently only one node can be selected at a time, should allow more later
		// Should point be the index or the grip element?
		if(point == current_poly_pts.length/2 - 1) {
			current_poly_pt = 0;
		} else {
			current_poly_pt = point;
		}
		
		$('#polypointgrip_container circle').attr('fill','#0F0');
		var grip = $('#polypointgrip_' + point).attr('fill','blue');
		call("selected", [grip[0]]);
	}

	// in mouseDown :
	// - when we are in a create mode, the element is added to the canvas
	//   but the action is not recorded until mousing up
	// - when we are in select mode, select the element, remember the position
	//   and do nothing else
	var mouseDown = function(evt)
	{
		var mouse_x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft - container.offsetLeft;
		var mouse_y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop - container.offsetTop;
		
		evt.preventDefault();
    
		if($.inArray(current_mode, ['select', 'resize']) == -1) {
			addGradient();
		}
		
		x = mouse_x / current_zoom;
		y = mouse_y / current_zoom;
		
		start_x = x;
		start_y = y;
		
		switch (current_mode) {
			case "select":
				started = true;
				current_resize_mode = "none";
				var t = evt.target;
				// if this element is in a group, go up until we reach the top-level group 
				// just below the layer groups
				// TODO: once we implement links, we also would have to check for <a> elements
				while (t.parentNode.parentNode.tagName == "g") {
					t = t.parentNode;
				}
				// WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
				var nodeName = t.nodeName.toLowerCase();
				if (nodeName != "div" && nodeName != "svg") {
					// if this element is not yet selected, clear selection and select it
					if (selectedElements.indexOf(t) == -1) {
						// only clear selection if shift is not pressed (otherwise, add 
						// element to selection)
						if (!evt.shiftKey) {
							canvas.clearSelection();
						}
						canvas.addToSelection([t]);
						justSelected = t;
						current_poly = null;
					}
					// else if it's a poly, go into polyedit mode in mouseup
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
				break;
			case "fhellipse":
			case "fhrect":
			case "path":
				started = true;
				start_x = x;
				start_y = y;
				d_attr = x + "," + y + " ";
				var stroke_w = cur_shape.stroke_width == 0?1:cur_shape.stroke_width;
				addSvgElementFromJson({
					"element": "polyline",
					"attr": {
						"points": d_attr,
						"id": getNextId(),
						"fill": "none",
						"stroke": cur_shape.stroke,
						"stroke-width": stroke_w,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"stroke-linecap": "round",
						"stroke-linejoin": "round",
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:all"
					}
				});
				freehand_min_x = x;
				freehand_max_x = x;
				freehand_min_y = y;
				freehand_max_y = y;
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
						"style": "pointer-events:all"
					}
				});
        		newImage.setAttributeNS(xlinkns, "href", "images/logo.png");
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
					"attr": {
						"x": x,
						"y": y,
						"width": 0,
						"height": 0,
						"id": getNextId(),
						"fill": cur_shape.fill,
						"stroke": cur_shape.stroke,
						"stroke-width": cur_shape.stroke_width,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill-opacity": cur_shape.fill_opacity,
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:all"
					}
				});
				break;
			case "line":
				started = true;
				var stroke_w = cur_shape.stroke_width == 0?1:cur_shape.stroke_width;
				addSvgElementFromJson({
					"element": "line",
					"attr": {
						"x1": x,
						"y1": y,
						"x2": x,
						"y2": y,
						"id": getNextId(),
						"stroke": cur_shape.stroke,
						"stroke-width": stroke_w,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill": "none",
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:all"
					}
				});
				break;
			case "circle":
				started = true;
				addSvgElementFromJson({
					"element": "circle",
					"attr": {
						"cx": x,
						"cy": y,
						"r": 0,
						"id": getNextId(),
						"fill": cur_shape.fill,
						"stroke": cur_shape.stroke,
						"stroke-width": cur_shape.stroke_width,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill-opacity": cur_shape.fill_opacity,
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:all"
					}
				});
				break;
			case "ellipse":
				started = true;
				addSvgElementFromJson({
					"element": "ellipse",
					"attr": {
						"cx": x,
						"cy": y,
						"rx": 0,
						"ry": 0,
						"id": getNextId(),
						"fill": cur_shape.fill,
						"stroke": cur_shape.stroke,
						"stroke-width": cur_shape.stroke_width,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill-opacity": cur_shape.fill_opacity,
						"opacity": cur_shape.opacity / 2,
						"style": "pointer-events:all"
					}
				});
				break;
			case "text":
				started = true;
				var newText = addSvgElementFromJson({
					"element": "text",
					"attr": {
						"x": x,
						"y": y,
						"id": getNextId(),
						"fill": cur_text.fill,
						"stroke": cur_shape.stroke,
						"stroke-width": cur_text.stroke_width,
						"stroke-dasharray": cur_shape.stroke_style,
						"stroke-opacity": cur_shape.stroke_opacity,
						"fill-opacity": cur_shape.fill_opacity,
						// fix for bug where text elements were always 50% opacity
						"opacity": cur_shape.opacity,
						"font-size": cur_text.font_size,
						"font-family": cur_text.font_family,
						"text-anchor": "middle",
						"style": "pointer-events:all"
					}
				});
				newText.textContent = "text";
				break;
			case "poly":
				started = true;
				break;
			case "polyedit":
				started = true;
				current_poly_oldd = current_poly.getAttribute("d");
				var id = evt.target.id;
				if (id.substr(0,14) == "polypointgrip_") {
					// Select this point
					current_poly_pt_drag = parseInt(id.substr(14));
					canvas.addNodeToSelection(current_poly_pt_drag);
				} else if(id.indexOf("ctrlpointgrip_") == 0) {
					current_ctrl_pt_drag = id.split('_')[1];
				}

				if(current_poly_pt_drag == -1 && current_ctrl_pt_drag == -1) {
					canvas.clearSelection();
					canvas.setMode("multiselect");
					if (rubberBox == null) {
						rubberBox = selectorManager.getRubberBandBox();
					}
					assignAttributes(rubberBox, {
						'x': start_x,
						'y': start_y,
						'width': 0,
						'height': 0,
						'display': 'inline'
					}, 100);
				}

				break;
			case "rotate":
				started = true;
				// we are starting an undoable change (a drag-rotation)
				canvas.beginUndoableChange("transform", selectedElements);
				break;
			default:
				console.log("Unknown mode in mousedown: " + current_mode);
				break;
		}
	};

	// in this function we do not record any state changes yet (but we do update
	// any elements that are still being created, moved or resized on the canvas)
	// TODO: svgcanvas should just retain a reference to the image being dragged instead
	// of the getId() and getElementById() funkiness - this will help us customize the ids 
	// a little bit for squares and polys
	var mouseMove = function(evt)
	{
		if (!started) return;
		var selected = selectedElements[0];
		var mouse_x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft - container.offsetLeft;
		var mouse_y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop - container.offsetTop;
		var shape = svgdoc.getElementById(getId());
    
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
						var ts = ["translate(",dx,",",dy,")"].join('');
						var len = selectedElements.length;
						for (var i = 0; i < len; ++i) {
							var selected = selectedElements[i];
							if (selected == null) break;
							var box = canvas.getBBox(selected);
							selectedBBoxes[i].x = box.x + dx;
							selectedBBoxes[i].y = box.y + dy;
							var angle = canvas.getRotationAngle(selected);
							if (angle) {
								var cx = round(box.x + box.width/2),
									cy = round(box.y + box.height/2);
								var xform = ts + [" rotate(", angle, " ", cx, ",", cy, ")"].join('');
 								var r = Math.sqrt( dx*dx + dy*dy );
								var theta = Math.atan2(dy,dx) - angle * Math.PI / 180.0;
								selected.setAttribute("transform", xform);
								box.x += r * Math.cos(theta); box.y += r * Math.sin(theta);
							}
							else {
								selected.setAttribute("transform", ts);
								box.x += dx; box.y += dy;
							}
							// update our internal bbox that we're tracking while dragging
							selectorManager.requestSelector(selected).resize(box);
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

				// this code will probably be faster than using getIntersectionList(), but
				// not as accurate (only grabs an element if the mouse happens to pass over
				// its bbox and elements would never be released from selection)
//				var nodeName = evt.target.nodeName.toLowerCase();
//				if (nodeName != "div" && nodeName != "svg") {
//					canvas.addToSelection([evt.target]);
//				}

				// clear out selection and set it to the new list
				canvas.clearSelection();
				canvas.addToSelection(getIntersectionList());

				/*
				// for each selected:
				// - if newList contains selected, do nothing
				// - if newList doesn't contain selected, remove it from selected
				// - for any newList that was not in selectedElements, add it to selected
				var elemsToRemove = [];
				var newList = getIntersectionList();
				var len = selectedElements.length;
				for (var i = 0; i < len; ++i) {
					var ind = newList.indexOf(selectedElements[i]);
					if (ind == -1) {
						elemsToRemove.push(selectedElements[i]);
					}
					else {
						newList[ind] = null;
					}
				}
				if (elemsToRemove.length > 0) 
					canvas.removeFromSelection(elemsToRemove);
				*/
				break;
			case "resize":
				// we track the resize bounding box and translate/scale the selected element
				// while the mouse is down, when mouse goes up, we use this to recalculate
				// the shape's coordinates
				var box=canvas.getBBox(selected), left=box.x, top=box.y, width=box.width,
					height=box.height, dx=(x-start_x), dy=(y-start_y);
								
				// if rotated, adjust the dx,dy values
				var angle = canvas.getRotationAngle(selected);
				if (angle) {
 					var r = Math.sqrt( dx*dx + dy*dy );
					var theta = Math.atan2(dy,dx) - angle * Math.PI / 180.0;
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
				
				var ts = null;
				var tx = 0, ty = 0;
				var sy = height ? (height+dy)/height : 1, 
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
				
				// find the rotation transform and prepend it
				var ts = [" translate(", (left+tx), ",", (top+ty), ") scale(", sx, ",", sy,
							") translate(", -(left+tx), ",", -(top+ty), ")"].join('');
				if (angle) {
					var cx = round(left+width/2),
						cy = round(top+height/2);
					ts = ["rotate(", angle, " ", cx, ",", cy, ")", ts].join('')
				}
				selected.setAttribute("transform", ts);

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
				
				// update box width/height
				selectedBBox.width = round(width*sx);
				selectedBBox.height = round(height*sy);

				// normalize selectedBBox
				if (selectedBBox.width < 0) {
					selectedBBox.width *= -1;
					// if we are dragging on the east side and scaled negatively
					if(current_resize_mode.indexOf("e") != -1 && sx < 0) {
						selectedBBox.x = box.x - selectedBBox.width;
					}
					else {
						selectedBBox.x -= selectedBBox.width;
					}
				}
				if (selectedBBox.height < 0) {
					selectedBBox.height *= -1;
					// if we are dragging on the south side and scaled negatively
					if(current_resize_mode.indexOf("s") != -1 && sy < 0) {
						selectedBBox.y = box.y - selectedBBox.height;
					}
					else {
						selectedBBox.y -= selectedBBox.height;
					}
				}
				
				
				selectorManager.requestSelector(selected).resize(selectedBBox);
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
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "x2", x);
				shape.setAttributeNS(null, "y2", y);
				svgroot.unsuspendRedraw(handle);
				break;
			case "square":
				var size = Math.max( Math.abs(x - start_x), Math.abs(y - start_y) );
				assignAttributes(shape,{
					'width': size,
					'height': size,
					'x': start_x < x ? start_x : start_x - size,
					'y': start_y < y ? start_y : start_y - size
				},1000);
				break;
			case "rect":
				assignAttributes(shape,{
					'width': Math.abs(x-start_x),
					'height': Math.abs(y-start_y),
					'x': Math.min(start_x,x),
					'y': Math.min(start_y,y)
				},1000);
				break;
			case "image":
				assignAttributes(shape,{
					'width': Math.abs(x-start_x),
					'height': Math.abs(y-start_y),
					'x': Math.min(start_x,x),
					'y': Math.min(start_y,y)
				},1000);
				break;
			case "circle":
				var cx = shape.getAttributeNS(null, "cx");
				var cy = shape.getAttributeNS(null, "cy");
				var rad = Math.sqrt( (x-cx)*(x-cx) + (y-cy)*(y-cy) );
				shape.setAttributeNS(null, "r", rad);
				break;
			case "ellipse":
				var cx = shape.getAttributeNS(null, "cx");
				var cy = shape.getAttributeNS(null, "cy");
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
				shape.setAttributeNS(null, "ry", Math.abs(y - cy) );
				svgroot.unsuspendRedraw(handle);
				break;
			case "fhellipse":
			case "fhrect":
				freehand_min_x = Math.min(x, freehand_min_x);
				freehand_max_x = Math.max(x, freehand_max_x);
				freehand_min_y = Math.min(y, freehand_min_y);
				freehand_max_y = Math.max(y, freehand_max_y);
			// break; missing on purpose
			case "path":
				start_x = x;
				start_y = y;
				d_attr += + x + "," + y + " ";
				shape.setAttributeNS(null, "points", d_attr);
				break;
			// update poly stretch line coordinates
			case "poly":
				var line = document.getElementById("poly_stretch_line");
				if (line) {
					line.setAttribute("x2", x *= current_zoom);
					line.setAttribute("y2", y *= current_zoom);
				}
				break;
			case "polyedit":
				// if we are dragging a point, let's move it
				if (current_poly_pt_drag != -1 && current_poly) {
					var old_poly_pts = $.map(current_poly_pts, function(n){return n/current_zoom;});
					updatePoly(mouse_x, mouse_y, old_poly_pts);
				} else if (current_ctrl_pt_drag != -1 && current_poly) {
					// Moving the control point. Since only one segment is altered,
					// we only need to do a pathSegList replace.
					var data = current_ctrl_pt_drag.split('c');
					var index = data[0]-0;
					var ctrl_num = data[1]-0;
					var c_item = current_poly.pathSegList.getItem(index+1);
					
					var angle = canvas.getRotationAngle(current_poly) * Math.PI / 180.0;
					if (angle) {
						// calculate the shape's old center that was used for rotation
						var box = selectedBBoxes[0];
						var cx = round(box.x + box.width/2) * current_zoom, 
							cy = round(box.y + box.height/2) * current_zoom;
						var dx = mouse_x - cx, dy = mouse_y - cy;
						var r = Math.sqrt( dx*dx + dy*dy );
						var theta = Math.atan2(dy,dx) - angle;						
						current_poly_pts[i] = mouse_x = cx + r * Math.cos(theta);
						current_poly_pts[i+1] = mouse_y = cy + r * Math.sin(theta);
						x = mouse_x / current_zoom;
						y = mouse_y / current_zoom;
					}
					
					c_item['x' + ctrl_num] = x - getPolyPoint(index)[0];
					c_item['y' + ctrl_num] = y - getPolyPoint(index)[1];
					replacePathSeg(7, index+1, [c_item.x,c_item.y, c_item.x1,c_item.y1, c_item.x2,c_item.y2]);

					var grip = document.getElementById("ctrlpointgrip_" + current_ctrl_pt_drag);
					if(grip) {
						grip.setAttribute("cx", mouse_x);
						grip.setAttribute("cy", mouse_y);
						
						var line = document.getElementById("ctrlLine_"+current_ctrl_pt_drag);
						line.setAttribute("x2", mouse_x);
						line.setAttribute("y2", mouse_y);
					}
				}
				break;
			case "rotate":
				var box = canvas.getBBox(selected),
					cx = round(box.x + box.width/2), 
					cy = round(box.y + box.height/2);
				var angle = round(((Math.atan2(cy-y,cx-x)  * (180/Math.PI))-90) % 360);
				canvas.setRotationAngle(angle<-180?(360+angle):angle, true);
				break;
			default:
				break;
		}
	};

	var resetPointGrips = function() {
		var sr = svgroot.suspendRedraw(100);
		removeAllPointGripsFromPoly();
		recalcPolyPoints();
		addAllPointGripsToPoly();
		svgroot.unsuspendRedraw(sr);
	};
	
	var recalcPolyPoints = function() {
		current_poly_pts = [];
		var segList = current_poly.pathSegList;
		var curx = segList.getItem(0).x, cury = segList.getItem(0).y;
		current_poly_pts.push(curx * current_zoom);
		current_poly_pts.push(cury * current_zoom);
		var len = segList.numberOfItems;
		for (var i = 1; i < len; ++i) {
			var l = segList.getItem(i);
			var x = l.x, y = l.y;
			// polys can now be closed, skip Z segments
			if (l.pathSegType == 1) {
				break;
			}
			var type = l.pathSegType;
			// current_poly_pts just holds the absolute coords
			if (type == 4) {
				curx = x;
				cury = y;
			} // type 4 (abs line)
			else if (type == 5) {
				curx += x;
				cury += y;
			} // type 5 (rel line)
			else if (type == 6) {
				curx = x;
				cury = y;
			} // type 6 (abs curve)
			else if (type == 7) {
				curx += x;
				cury += y;
			} // type 7 (rel curve)
			current_poly_pts.push(curx * current_zoom);
			current_poly_pts.push(cury * current_zoom);
		} // for each segment	
	}

	var removeAllPointGripsFromPoly = function() {
		// loop through and hide all pointgrips
		$('#polypointgrip_container > *').attr("display", "none");

		var line = document.getElementById("poly_stretch_line");
		if (line) line.setAttribute("display", "none");
		
		$('#ctrlpointgrip_container *').attr('display','none');
	};

	var addAllPointGripsToPoly = function() {
		// loop through and show all pointgrips
		var len = current_poly_pts.length;
		for (var i = 0; i < len; i += 2) {
			var grip = document.getElementById("polypointgrip_"+i/2);
			if (grip) {
				assignAttributes(grip, {
					'cx': current_poly_pts[i],
					'cy': current_poly_pts[i+1],
					'display': 'inline'
				});
			}
			else {
				addPointGripToPoly(current_poly_pts[i], current_poly_pts[i+1],i/2);
			}
			
			var index = i/2;
			var item = current_poly.pathSegList.getItem(index);
			if(item.pathSegType == 7) {
				index -= 1;
				// Same code as when making a curve, needs to be in own function
				var cur_x = getPolyPoint(index)[0];
				var cur_y = getPolyPoint(index)[1];
				var next_x = getPolyPoint(index+1)[0];
				var next_y = getPolyPoint(index+1)[1];
				addControlPointGrip(cur_x + item.x1,cur_y + item.y1, cur_x,cur_y, index+'c1');
				addControlPointGrip(cur_x + item.x2,cur_y + item.y2, next_x,next_y, index+'c2');
			} 
		}
		var pointGripContainer = document.getElementById("polypointgrip_container");
		var ctrlPointGripContainer = document.getElementById("ctrlpointgrip_container");
		// FIXME:  we cannot just use the same transform as the poly because we might be 
		// at a different zoom level
		var angle = canvas.getRotationAngle(current_poly);
		if (angle) {
			var bbox = canvas.getBBox(current_poly);
			var cx = (bbox.x + bbox.width/2) * current_zoom,
				cy = (bbox.y + bbox.height/2) * current_zoom;
			var xform = ["rotate(", angle, " ", cx, ",", cy, ")"].join("");
			pointGripContainer.setAttribute("transform", xform);
			if(ctrlPointGripContainer) ctrlPointGripContainer.setAttribute("transform", xform);
		}
	};

	var addPointGripToPoly = function(x,y,index) {
		// create the container of all the point grips
		var pointGripContainer = document.getElementById("polypointgrip_container");
		if (!pointGripContainer) {
			var parent = document.getElementById("selectorParentGroup");
			pointGripContainer = parent.appendChild(document.createElementNS(svgns, "g"));
			pointGripContainer.id = "polypointgrip_container";
		}

		var pointGrip = document.getElementById("polypointgrip_"+index);
		// create it
		if (!pointGrip) {
			pointGrip = document.createElementNS(svgns, "circle");
			assignAttributes(pointGrip, {
				'id': "polypointgrip_" + index,
				'display': "none",
				'r': 4,
				'fill': "#0F0",
				'stroke': "#00F",
				'stroke-width': 2,
				'cursor': 'move',
				'style': 'pointer-events:all'
			});
			pointGrip = pointGripContainer.appendChild(pointGrip);

			var grip = $('#polypointgrip_'+index);
			grip.mouseover( function() { this.setAttribute("stroke", "#F00"); } );
			grip.mouseout( function() {this.setAttribute("stroke", "#00F"); } );
			grip.dblclick( function() {
			
				var old_d = current_poly.getAttribute('d');
				
				// Index could have changed by deleting nodes
				index = grip[0].id.split('_')[1] - 0;
				
				var last_index = current_poly_pts.length/2 - 1;
				var is_closed = current_poly.getAttribute('d').toLowerCase().indexOf('z') != -1; 
				
				if(!is_closed && index == last_index) {
					return; // Last point of unclosed poly should do nothing
				} else if(index >= last_index && is_closed) {
					index = 0;
				}
				
				var batchCmd = new BatchCommand("Toggle Poly Segment Type");
				
				// Toggle segment to curve/straight line
				var type = current_poly.pathSegList.getItem(index+1).pathSegType;
				
				var next_index = index+1;
				
				var cur_x = getPolyPoint(index)[0];
				var cur_y = getPolyPoint(index)[1];
				var next_x = getPolyPoint(next_index)[0];
				var next_y = getPolyPoint(next_index)[1];
				
				var next_rel_x = next_x - cur_x;
				var next_rel_y = next_y - cur_y;

				if(type != 7) { // 6 = abs, 7 = rel
					// Change to CubicRel curve
					
					var ct1_x = (next_y/-2 - cur_y/-2);
					var ct1_y = (next_x/-2 - cur_x/-2);
					var ct2_x = (next_y/-2 - cur_y/-2);
					var ct2_y = (next_x/-2 - cur_x/-2);

					replacePathSeg(7, next_index, [next_rel_x,next_rel_y, ct1_x,ct1_y, ct2_x+next_rel_x,ct2_y+next_rel_y]);
					
					// Add the control points + lines
					addControlPointGrip(ct1_x+cur_x,ct1_y+cur_y, cur_x,cur_y, index+'c1');
					addControlPointGrip(ct2_x+next_x,ct2_y+next_y, next_x,next_y, index+'c2');
				} else {
					// Revert to relative line
					replacePathSeg(5, next_index, [next_rel_x,next_rel_y]);
					removeControlPointGrips(index);
				}

				batchCmd.addSubCommand(new ChangeElementCommand(current_poly, {d: old_d}));
				addCommandToHistory(batchCmd);
				call("changed", [current_poly]);
			});
		}

		// set up the point grip element and display it
		assignAttributes(pointGrip, {
			'cx': x,
			'cy': y,
			'display': "inline",
		});
	};
	
	var updatePoly = function(mouse_x, mouse_y, old_poly_pts) {
    	var x = mouse_x / current_zoom;
    	var y = mouse_y / current_zoom;
    	
    	var is_closed = current_poly.getAttribute('d').toLowerCase().indexOf('z') != -1; 
	
		var i = current_poly_pt_drag * 2;
		var last_index = current_poly_pts.length/2 - 1;
		var is_first = current_poly_pt_drag == 0 || (is_closed && current_poly_pt_drag == last_index);
		var is_last = !is_closed && current_poly_pt_drag == last_index;
		
		// if the image is rotated, then we must modify the x,y mouse coordinates
		// and rotate them into the shape's rotated coordinate system
		// we also re-map mouse_x/y and x/y into the rotated coordinate system
		var angle = canvas.getRotationAngle(current_poly) * Math.PI / 180.0;
		if (angle) {
			// calculate the shape's old center that was used for rotation
			var box = selectedBBoxes[0];
			var cx = round(box.x + box.width/2) * current_zoom, 
				cy = round(box.y + box.height/2) * current_zoom;
			var dx = mouse_x - cx, dy = mouse_y - cy;
			var r = Math.sqrt( dx*dx + dy*dy );
			var theta = Math.atan2(dy,dx) - angle;						
			current_poly_pts[i] = mouse_x = cx + r * Math.cos(theta);
			current_poly_pts[i+1] = mouse_y = cy + r * Math.sin(theta);
			x = mouse_x / current_zoom;
			y = mouse_y / current_zoom;
		}
		else {
			current_poly_pts[i] = x * current_zoom;
			current_poly_pts[i+1] = y * current_zoom;
		}
		
		if(is_first && is_closed) {
			// Update the first point
			current_poly_pts[0] = current_poly_pts[i];
			current_poly_pts[1] = current_poly_pts[i+1];
			current_poly_pt_drag = 0;
		}

		var index = current_poly_pt_drag;
		var rel_x = (getPolyPoint(index)[0] - getPolyPoint(index-1)[0]);
		var rel_y = (getPolyPoint(index)[1] - getPolyPoint(index-1)[1]);
		
		var item = current_poly.pathSegList.getItem(index);
		var x_diff = x - old_poly_pts[index*2];
		var y_diff = y - old_poly_pts[index*2 + 1];
		
		var cur_type = item.pathSegType;
		var points = [];
		
		if(cur_type == 7) {
			points = [rel_x,rel_y, item.x1,item.y1, item.x2 + x_diff,item.y2 + y_diff];
		} else {
			if(is_first) {
				// Need absolute position for first point
				points = getPolyPoint(0);
			} else {
				points = [rel_x, rel_y];
			}
		}
		replacePathSeg(cur_type, index, points);

		var setSeg = function(index,first) {
			var points, item = current_poly.pathSegList.getItem(index);
			var type = item.pathSegType;
			if(first) {
				x_diff *= -1;
				y_diff *= -1;
			}

			var end_x = item.x - x_diff;
			var end_y = item.y - y_diff;

			switch (type) {
			case 1:
				points = [];
				break;
			case 5:
				points = [end_x, end_y];
				break;
			case 7:
				points = [end_x, end_y, item.x1,item.y1, item.x2 - x_diff,item.y2 - y_diff];
				break;
			default:
				break;
			}
			replacePathSeg(type, index, points);
			return type;
		}
		
		if(is_closed || !is_last) { 
			var next_type = setSeg(index+1);
		} else {
			var next_type = 0;
		}
		
		if(is_first && is_closed) {
			var last_type = setSeg(last_index,1);
			x_diff *= -1;
			y_diff *= -1;
		}
			
		// Original method: Re-calculate the "d" attribute
// 					var oldd = current_poly.getAttribute("d");
// 					var closedPath = (oldd[oldd.length-1] == 'z' || oldd[oldd.length-1] == 'Z');
// 					var len = current_poly_pts.length/2;
// 					var arr = new Array(len+1);
// 					var curx = current_poly_pts[0]/current_zoom,
// 						cury = current_poly_pts[1]/current_zoom;
// 					arr[0] = ["M", curx, ",", cury].join('');
// 					for (var j = 1; j < len; ++j) {
// 						var px = current_poly_pts[j*2]/current_zoom, py = current_poly_pts[j*2+1]/current_zoom;
// 						arr[j] = ["l", round(px-curx), ",", round(py-cury)].join('');
// 						curx = px;
// 						cury = py;
// 					}
// 					if (closedPath) {
// 						arr[len] = "z";
// 					}
// 					// we don't want to undo this, we are in the middle of a drag
// 					current_poly.setAttribute("d", arr.join(' '));

		// move the point grip
		var grip = document.getElementById("polypointgrip_" + current_poly_pt_drag);
		if (grip) {
			grip.setAttribute("cx", mouse_x);
			grip.setAttribute("cy", mouse_y);
			
			if(is_closed && is_first) {
				var grip = document.getElementById("polypointgrip_" + last_index);
				grip.setAttribute("cx", mouse_x);
				grip.setAttribute("cy", mouse_y);
			}
			call("selected", [grip]);
		}
		
		// move the control grips + lines
		if(is_first) cur_type = last_type;
		
		if(cur_type != 5) {
			var num = is_first?last_index:index;
			var id2 = (num-1)+'c2';
			var line = document.getElementById("ctrlLine_"+id2);
			if(line) {
				var x2 = line.getAttribute('x2') - 0 + x_diff*current_zoom;
				var y2 = line.getAttribute('y2') - 0 + y_diff*current_zoom;
				addControlPointGrip(x2,y2, mouse_x,mouse_y, id2, true);
			}
		}
		
		if(next_type != 5) {
			var id1 = (current_poly_pt_drag)+'c1';
			var line = document.getElementById("ctrlLine_"+id1);
			if(line) {
				var x2 = line.getAttribute('x2') - 0 + x_diff*current_zoom;
				var y2 = line.getAttribute('y2') - 0 + y_diff*current_zoom;
				addControlPointGrip(x2,y2, mouse_x,mouse_y, id1, true);
			}
		}
		
	}
	
	var getPolyPoint = function(index, raw_val) {
		var len = current_poly_pts.length;
		var pt_num = len/2;
		if(index < 0) {
			index += pt_num;
		} else if(index >= pt_num) {
			index -= pt_num;
		}
		var z = raw_val?1:current_zoom;
		return [current_poly_pts[index*2] / z, current_poly_pts[index*2 + 1] / z];
	}
	
	// This replaces the segment at the given index. Type is given as number.
	var replacePathSeg = function(type, index, pts) {
		var poly = current_poly, func = 'createSVGPathSeg' + pathFuncs[type];
		var seg = poly[func].apply(poly, pts);
		poly.pathSegList.replaceItem(seg, index);
	}
	
	var addControlPointGrip = function(x, y, source_x, source_y, id, raw_val) {
		if(!raw_val) {
			x *= current_zoom; y *= current_zoom;
			source_x *= current_zoom; source_y *= current_zoom;
		}
	
		// create the container of all the control point grips
		var ctrlPointGripContainer = document.getElementById("ctrlpointgrip_container");
		if (!ctrlPointGripContainer) {
			var parent = document.getElementById("selectorParentGroup");
			ctrlPointGripContainer = parent.appendChild(document.createElementNS(svgns, "g"));
			ctrlPointGripContainer.id = "ctrlpointgrip_container";
		}
		ctrlPointGripContainer.setAttribute("display", "inline");
		
		var ctrlLine = document.getElementById("ctrlLine_"+id);
		if (!ctrlLine) {
			ctrlLine = document.createElementNS(svgns, "line");
			assignAttributes(ctrlLine, {
				'id': "ctrlLine_"+id,
				'stroke': "#555",
				'stroke-width': 1,
				"style": "pointer-events:none"
			});
			ctrlLine = ctrlPointGripContainer.appendChild(ctrlLine);
		}
		
		assignAttributes(ctrlLine, {
			'x1': source_x,
			'y1': source_y,
			'x2': x,
			'y2': y,
			'display': "inline"
		});
		
		var pointGrip = document.getElementById("ctrlpointgrip_"+id);
		// create it
		if (!pointGrip) {
			pointGrip = document.createElementNS(svgns, "circle");
			assignAttributes(pointGrip, {
				'id': "ctrlpointgrip_" + id,
				'display': "none",
				'r': 4,
				'fill': "#AAA",
				'stroke': "#55F",
				'stroke-width': 1,
				'cursor': 'move',
				'style': 'pointer-events:all'
			});
			pointGrip = ctrlPointGripContainer.appendChild(pointGrip);
		}
		
		assignAttributes(pointGrip, {
			'cx': x,
			'cy': y,
			'display': "inline"
		});
	}

	var removeControlPointGrips = function(index) {
		for(var i=1; i <= 2; i++) {
			$("#ctrlpointgrip_" + index + "c" + i + ",#ctrlLine_" + index + "c" + i).attr("display", "none");
		}
	}

	// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
	//   and store it on the Undo stack
	// - in move/resize mode, the element's attributes which were affected by the move/resize are
	//   identified, a ChangeElementCommand is created and stored on the stack for those attrs
	//   this is done in when we recalculate the selected dimensions()
	var mouseUp = function(evt)
	{
		var tempJustSelected = justSelected;
		justSelected = null;
		if (!started) return;

		var mouse_x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft - container.offsetLeft;
		var mouse_y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop - container.offsetTop;
		var x = mouse_x / current_zoom;
		var y = mouse_y / current_zoom;
		
		started = false;
		var element = svgdoc.getElementById(getId());
		var keep = false;
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
						if (selected.tagName != "g") {
							cur_shape.fill = selected.getAttribute("fill");
							cur_shape.fill_opacity = selected.getAttribute("fill-opacity");
							cur_shape.stroke = selected.getAttribute("stroke");
							cur_shape.stroke_opacity = selected.getAttribute("stroke-opacity");
							cur_shape.stroke_width = selected.getAttribute("stroke-width");
							cur_shape.stroke_style = selected.getAttribute("stroke-dasharray");
						}
						if (selected.tagName == "text") {
							cur_text.font_size = selected.getAttribute("font-size");
							cur_text.font_family = selected.getAttribute("font-family");
						}

						selectorManager.requestSelector(selected).showGrips(true);
					}
					// if it was being dragged/resized
					if (x != start_x || y != start_y) {
						recalculateAllSelectedDimensions();
						var len = selectedElements.length;
						for	(var i = 0; i < len; ++i) {
							if (selectedElements[i] == null) break;
							selectorManager.requestSelector(selectedElements[i]).resize(selectedBBoxes[i]);
						}
					}
					// no change in position/size, so maybe we should move to polyedit
					else {
						var t = evt.target;
						// TODO: this causes a poly that was just going to be selected to go straight to polyedit
						if (selectedElements[0].nodeName == "path" && selectedElements[1] == null) {
							if (current_poly == t) {
								current_mode = "polyedit";

								// recalculate current_poly_pts
								recalcPolyPoints();
								
								canvas.clearSelection();
								// save the poly's bbox
								selectedBBoxes[0] = canvas.getBBox(current_poly);
								addAllPointGripsToPoly();
							} // going into polyedit mode
							else {
								current_poly = t;
							}
						} // if it was a path
						// else, if it was selected and this is a shift-click, remove it from selection
						else if (evt.shiftKey && tempJustSelected != t) {
							canvas.removeFromSelection([t]);
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
				call("zoomed", {
					'x': Math.min(start_x,x),
					'y': Math.min(start_y,y),
					'width': Math.abs(x-start_x),
					'height': Math.abs(y-start_y)
				});
				return;
			case "path":
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
				break;
			case "line":
				keep = (element.getAttribute('x1') != element.getAttribute('x2') ||
				        element.getAttribute('y1') != element.getAttribute('y2'));
				break;
			case "square":
			case "rect":
				keep = (element.getAttribute('width') != 0 ||
				        element.getAttribute('height') != 0);
				break;
			case "image":
				keep = (element.getAttribute('width') != 0 ||
				        element.getAttribute('height') != 0);
				break;
			case "circle":
				keep = (element.getAttribute('r') != 0);
				break;
			case "ellipse":
				keep = (element.getAttribute('rx') != 0 ||
				        element.getAttribute('ry') != 0);
				break;
			case "fhellipse":
				if ((freehand_max_x - freehand_min_x) > 0 &&
				    (freehand_max_y - freehand_min_y) > 0) {
				    element = addSvgElementFromJson({
						"element": "ellipse",
						"attr": {
							"cx": (freehand_min_x + freehand_max_x) / 2,
							"cy": (freehand_min_y + freehand_max_y) / 2,
							"rx": (freehand_max_x - freehand_min_x) / 2,
							"ry": (freehand_max_y - freehand_min_y) / 2,
							"id": getId(),
							"fill": cur_shape.fill,
							"stroke": cur_shape.stroke,
							"stroke-width": cur_shape.stroke_width,
							"stroke-dasharray": cur_shape.stroke_style,
							"opacity": cur_shape.opacity,
							"stroke-opacity": cur_shape.stroke_opacity,
							"fill-opacity": cur_shape.fill_opacity,
							"style": "pointer-events:all"
						}
					});
					call("changed",[element]);
					keep = true;
				}
				break;
			case "fhrect":
				if ((freehand_max_x - freehand_min_x) > 0 &&
				    (freehand_max_y - freehand_min_y) > 0) {
				    element = addSvgElementFromJson({
						"element": "rect",
						"attr": {
							"x": freehand_min_x,
							"y": freehand_min_y,
							"width": (freehand_max_x - freehand_min_x),
							"height": (freehand_max_y - freehand_min_y),
							"id": getId(),
							"fill": cur_shape.fill,
							"stroke": cur_shape.stroke,
							"stroke-width": cur_shape.stroke_width,
							"stroke-dasharray": cur_shape.stroke_style,
							"opacity": cur_shape.opacity,
							"stroke-opacity": cur_shape.stroke_opacity,
							"fill-opacity": cur_shape.fill_opacity,
							"style": "pointer-events:all"
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
			case "poly":
				// set element to null here so that it is not removed nor finalized
				element = null;
				// continue to be set to true so that mouseMove happens
				started = true;
				var stretchy = document.getElementById("poly_stretch_line");
				if (!stretchy) {
					stretchy = document.createElementNS(svgns, "line");
					assignAttributes(stretchy, {
						'id': "poly_stretch_line",
						'stroke': "blue",
						'stroke-width': "0.5"
					});
					stretchy = document.getElementById("selectorParentGroup").appendChild(stretchy);
				}
				stretchy.setAttribute("display", "inline");

				// if pts array is empty, create path element with M at current point
				if (current_poly_pts.length == 0) {
					current_poly_pts.push(x);
					current_poly_pts.push(y);
					d_attr = "M" + x + "," + y + " ";
					addSvgElementFromJson({
						"element": "path",
						"attr": {
							"d": d_attr,
							"id": getNextId(),
							"fill": cur_shape.fill,
							"fill-opacity": cur_shape.fill_opacity,
							"stroke": cur_shape.stroke,
							"stroke-width": cur_shape.stroke_width,
							"stroke-dasharray": cur_shape.stroke_style,
							"stroke-opacity": cur_shape.stroke_opacity,
							"opacity": cur_shape.opacity / 2,
							"style": "pointer-events:all"
						}
					});
					// set stretchy line to first point
					assignAttributes(stretchy, {
						'x1': mouse_x,
						'y1': mouse_y,
						'x2': mouse_x,
						'y2': mouse_y
					});
					addPointGripToPoly(mouse_x,mouse_y,0);
				}
				else {
					// determine if we clicked on an existing point
					var i = current_poly_pts.length;
					var FUZZ = 6/current_zoom;
					var clickOnPoint = false;
					while(i) {
						i -= 2;
						var px = current_poly_pts[i], py = current_poly_pts[i+1];
						// found a matching point
						if ( x >= (px-FUZZ) && x <= (px+FUZZ) && y >= (py-FUZZ) && y <= (py+FUZZ) ) {
							clickOnPoint = true;
							break;
						}
					}
					
					// get poly element that we are in the process of creating
					var poly = svgdoc.getElementById(getId());
					var len = current_poly_pts.length;
					// if we clicked on an existing point, then we are done this poly, commit it
					// (i,i+1) are the x,y that were clicked on
					if (clickOnPoint) {
						// if clicked on any other point but the first OR
						// the first point was clicked on and there are less than 3 points
						// then leave the poly open
						// otherwise, close the poly
						if (i == 0 && len >= 6) {
							// Create end segment
							var rel_x = (getPolyPoint(0)[0] - getPolyPoint(-1)[0]);
							var rel_y = (getPolyPoint(0)[1] - getPolyPoint(-1)[1]);
							d_attr += ['l',rel_x,',',rel_y,'z'].join('');
							poly.setAttribute("d", d_attr);
						} else if(len < 3) {
							keep = false;
							break;
						}
						removeAllPointGripsFromPoly();
						// this will signal to commit the poly
						element = poly;
						current_poly_pts = [];
						started = false;
					}
					// else, create a new point, append to pts array, update path element
					else {
						var lastx = current_poly_pts[len-2], lasty = current_poly_pts[len-1];
						// we store absolute values in our poly points array for easy checking above
						current_poly_pts.push(x);
						current_poly_pts.push(y);
						// but we store relative coordinates in the d string of the poly for easy
						// translation around the canvas in move mode
						d_attr += "l" + round(x-lastx) + "," + round(y-lasty) + " ";
						poly.setAttribute("d", d_attr);

						// set stretchy line to latest point
						assignAttributes(stretchy, {
							'x1': mouse_x,
							'y1': mouse_y,
							'x2': mouse_x,
							'y2': mouse_y
						});
						addPointGripToPoly(mouse_x,mouse_y,(current_poly_pts.length/2 - 1));
					}
					keep = true;
				}
				break;
			case "polyedit":
				keep = true;
				element = null;
				// if we were dragging a poly point, stop it now
				if (current_poly_pt_drag != -1) {
					current_poly_pt_drag = -1;
					
					var batchCmd = new BatchCommand("Edit Poly");
					// the attribute changes we want to undo
					var oldvalues = {};
					oldvalues["d"] = current_poly_oldd;
					
					// If the poly was rotated, we must now pay the piper:
					// Every poly point must be rotated into the rotated coordinate system of 
					// its old center, then determine the new center, then rotate it back
					// This is because we want the poly to remember its rotation
					var angle = canvas.getRotationAngle(current_poly) * Math.PI / 180.0;
					if (angle) {
						var box = canvas.getBBox(current_poly);
						var oldbox = selectedBBoxes[0];
						var oldcx = round(oldbox.x + oldbox.width/2),
							oldcy = round(oldbox.y + oldbox.height/2),
							newcx = round(box.x + box.width/2),
							newcy = round(box.y + box.height/2);
						
						// un-rotate the new center to the proper position
						var dx = newcx - oldcx,
							dy = newcy - oldcy;
						var r = Math.sqrt(dx*dx + dy*dy);
						var theta = Math.atan2(dy,dx) + angle;
						newcx = round(r * Math.cos(theta) + oldcx);
						newcy = round(r * Math.sin(theta) + oldcy);
						
						var i = current_poly_pts.length;
						while (i) {
							i -= 2;
							dx = current_poly_pts[i] - oldcx;
							dy = current_poly_pts[i+1] - oldcy;
							
							// rotate the point around the old center
							r = Math.sqrt(dx*dx + dy*dy);
							theta = Math.atan2(dy,dx) + angle;
							current_poly_pts[i] = dx = r * Math.cos(theta) + oldcx;
							current_poly_pts[i+1] = dy = r * Math.sin(theta) + oldcy;
							
							// dx,dy should now hold the actual coordinates of each
							// point after being rotated

							// now we want to rotate them around the new center in the reverse direction
							dx -= newcx;
							dy -= newcy;
							
							r = Math.sqrt(dx*dx + dy*dy);
							theta = Math.atan2(dy,dx) - angle;
							
							current_poly_pts[i] = round(r * Math.cos(theta) + newcx);
							current_poly_pts[i+1] = round(r * Math.sin(theta) + newcy);
						} // loop for each point
						
						// now set the d attribute to the new value of current_poly_pts
						var oldd = current_poly.getAttribute("d");
						var closedPath = (oldd[oldd.length-1] == 'z' || oldd[oldd.length-1] == 'Z');
						var len = current_poly_pts.length/2;
						var arr = new Array(len+1);
						var curx = current_poly_pts[0]/current_zoom,
							cury = current_poly_pts[1]/current_zoom;
						arr[0] = ["M", curx, ",", cury].join('');
						assignAttributes(document.getElementById("polypointgrip_0"), 
										{"cx":curx,"cy":cury}, 100);
						for (var j = 1; j < len; ++j) {
							var px = current_poly_pts[j*2]/current_zoom, 
								py = current_poly_pts[j*2+1]/current_zoom;
							arr[j] = ["l", round(px-curx), ",", round(py-cury)].join('');
							curx = px;
							cury = py;
							assignAttributes(document.getElementById("polypointgrip_"+j), 
										{"cx":px,"cy":py}, 100);
						}
						if (closedPath) {
							arr[len] = "z";
						}
						current_poly.setAttribute("d", arr.join(' '));

						box = canvas.getBBox(current_poly);						
						selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
						selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;
						
						// now we must set the new transform to be rotated around the new center
						var rotate = "rotate(" + (angle * 180.0 / Math.PI) + " " + newcx + "," + newcy + ")";
						oldvalues["transform"] = current_poly.getAttribute("rotate");
						current_poly.setAttribute("transform", rotate);
						
						var pointGripContainer = document.getElementById("polypointgrip_container");
						var ctrlPointGripContainer = document.getElementById("ctrlpointgrip_container");
						if(pointGripContainer) {
							var pcx = newcx * current_zoom,
								pcy = newcy * current_zoom;
							var xform = ["rotate(", (angle*180.0/Math.PI), " ", pcx, ",", pcy, ")"].join("");
							pointGripContainer.setAttribute("transform", xform);
							if(ctrlPointGripContainer) {
								ctrlPointGripContainer.setAttribute("transform", xform);
							}
						}
					} // if rotated

					batchCmd.addSubCommand(new ChangeElementCommand(current_poly, oldvalues, "poly points"));
					addCommandToHistory(batchCmd);
					call("changed", [current_poly]);
					
					// If connected, last point should equal first
					if(current_poly.getAttribute('d').toLowerCase().indexOf('z') != -1) {
						current_poly_pts[current_poly_pts.length-2] = getPolyPoint(0,true)[0];
						current_poly_pts[current_poly_pts.length-1] = getPolyPoint(0,true)[1];
					}
					
					// make these changes undo-able
				} // if (current_poly_pt_drag != -1)
				else if(current_ctrl_pt_drag != -1) {
					current_ctrl_pt_drag = -1;
					var batchCmd = new BatchCommand("Edit Poly control points");
					batchCmd.addSubCommand(new ChangeElementCommand(current_poly, {d:current_poly_oldd}));
					addCommandToHistory(batchCmd);
					call("changed", [current_poly]);
				} 	// else, move back to select mode
				else {
					current_mode = "select";
					removeAllPointGripsFromPoly();
					canvas.clearSelection();
					canvas.addToSelection([evt.target]);
				}
				break;
			case "rotate":
				keep = true;
				element = null;
				current_mode = "select";
				var batchCmd = canvas.finishUndoableChange();
				if (!batchCmd.isEmpty()) { 
					addCommandToHistory(batchCmd);
				}
				break;
			default:
				console.log("Unknown mode in mouseup: " + current_mode);
				break;
		}
		if (!keep && element != null) {
			element.parentNode.removeChild(element);
			element = null;
		} else if (element != null) {
			canvas.addedNew = true;
			element.setAttribute("opacity", cur_shape.opacity);
			cleanupElement(element);
			selectorManager.update();
			canvas.addToSelection([element], true);
			// we create the insert command that is stored on the stack
			// undo means to call cmd.unapply(), redo means to call cmd.apply()
			addCommandToHistory(new InsertElementCommand(element));
			call("changed",[element]);
		}
	};

// public functions

	this.open = function(str) {
		// Nothing by default, handled by optional widget/extention
		call("opened", str);
	};

	this.save = function() {
		// remove the selected outline before serializing
		this.clearSelection();
		
		var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n";
		// no need for doctype, see http://jwatt.org/svg/authoring/#doctype-declaration
		str += svgCanvasToString();
		call("saved", str);
	};

	var walkTree = function(elem, cbFn){
		if (elem && elem.nodeType == 1) {
			cbFn(elem);
			var i = elem.childNodes.length;
			while (i--) {
				walkTree(elem.childNodes.item(i), cbFn);
			}
		}
	};
	
	this.getSvgString = function() {
		return svgCanvasToString();
	};

	// this function returns false if the set was unsuccessful, true otherwise
	// TODO: after parsing in the new text, do we need to synchronize getId()?
	this.setSvgString = function(xmlString) {
		try {
			// convert string into XML document
			var newDoc = Utils.text2xml(xmlString);

			// run it through our sanitizer to remove anything we do not support
	        sanitizeSvg(newDoc.documentElement);

			var batchCmd = new BatchCommand("Change Source");

        	// remove old svg document
    	    var oldzoom = svgroot.removeChild(svgzoom);
			batchCmd.addSubCommand(new RemoveElementCommand(oldzoom, svgroot));
        
    	    // set new svg document
        	svgzoom = svgroot.appendChild(svgdoc.importNode(newDoc.documentElement, true));
			svgzoom.setAttribute('id', 'svgzoom');
			// determine proper size
			var w, h;
			if (svgzoom.getAttribute("viewBox")) {
				var vb = svgzoom.getAttribute("viewBox").split(' ');
				w = vb[2];
				h = vb[3];
			}
			// handle old content that doesn't have a viewBox
			else {
				w = svgzoom.getAttribute("width");
				h = svgzoom.getAttribute("height");
				svgzoom.setAttribute("viewBox", ["0", "0", w, h].join(" "));
			}
			// just to be safe, remove any width/height from text so that they are 100%/100%
			svgzoom.removeAttribute('width');
			svgzoom.removeAttribute('height');
			batchCmd.addSubCommand(new InsertElementCommand(svgzoom));

			// update root to the correct size
			var changes = {};
			changes['width'] = svgroot.getAttribute('width');
			changes['height'] = svgroot.getAttribute('height');
			svgroot.setAttribute('width', w);
			svgroot.setAttribute('height', h);
			batchCmd.addSubCommand(new ChangeElementCommand(svgroot, changes));
			
			// reset zoom
			current_zoom = 1;
			
			// identify layers
			canvas.identifyLayers();
			
			selectorManager.update();

			addCommandToHistory(batchCmd);
			call("changed", [svgzoom]);
		} catch(e) {
			console.log(e);
			return false;
		}

		return true;
	};

	// Layer API Functions
	
	this.identifyLayers = function() {
		all_layers = [];
		var numchildren = svgzoom.childNodes.length;
		// loop through all children of svgzoom
		var orphans = [], layernames = [];
		for (var i = 0; i < numchildren; ++i) {
			var child = svgzoom.childNodes.item(i);
			// for each g, find its layer name
			if (child && child.nodeType == 1) {
				if (child.tagName == "g") {
					var name = getLayerName(child);
					// store layer and name in global variable
					if (name) {
						layernames.push(name);
						all_layers.push( [name,child] );
						current_layer = child;
						walkTree(child, function(e){e.setAttribute("style", "pointer-events:none");});
					}
					// if group did not have a name, it is an orphan
					else {
						orphans.push(child);
					}
				}
				// if child has a bbox (i.e. not a <title> element), then it is an orphan
				else if(child.getBBox) {
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
				walkTree(orphans[j], function(e){e.setAttribute("style", "pointer-events:none");});
				current_layer.appendChild(orphans[j]);
			}
			current_layer = svgzoom.appendChild(current_layer);
			all_layers.push( [newname, current_layer] );
		}
		walkTree(current_layer, function(e){e.setAttribute("style","pointer-events:all");});
	};
	
	this.createLayer = function(name) {
		var batchCmd = new BatchCommand("Create Layer");
		var new_layer = svgdoc.createElementNS(svgns, "g");
		var layer_title = svgdoc.createElementNS(svgns, "title");
		layer_title.textContent = name;
		new_layer.appendChild(layer_title);
		new_layer = svgzoom.appendChild(new_layer);
		batchCmd.addSubCommand(new InsertElementCommand(new_layer));
		addCommandToHistory(batchCmd);
		canvas.clearSelection();
		canvas.identifyLayers();
		canvas.setCurrentLayer(name);
		call("changed", [new_layer]);
	};
	
	this.deleteCurrentLayer = function() {
		if (current_layer && all_layers.length > 1) {
			var batchCmd = new BatchCommand("Delete Layer");
			// actually delete from the DOM and store in our Undo History
			var parent = current_layer.parentNode;
			batchCmd.addSubCommand(new RemoveElementCommand(current_layer, parent));
			parent.removeChild(current_layer);
			addCommandToHistory(batchCmd);
			canvas.clearSelection();
			canvas.identifyLayers();
			canvas.setCurrentLayer(all_layers[all_layers.length-1][0]);
			call("changed", [svgzoom]);
			return true;
		}
		return false;
	};
	
	this.getNumLayers = function() {
		return all_layers.length;
	};
	this.getLayer = function(i) {
		if (i >= 0 && i < canvas.getNumLayers()) {
			return all_layers[i][0];
		}
		return "";
	};
	
	this.getCurrentLayer = function() {
		for (var i = 0; i < all_layers.length; ++i) {
			if (all_layers[i][1] == current_layer) {
				return all_layers[i][0];
			}
		}
		return "";
	};
	
	this.setCurrentLayer = function(name) {
		name = toXml(name);
		for (var i = 0; i < all_layers.length; ++i) {
			if (name == all_layers[i][0]) {
				if (current_layer != all_layers[i][1]) {
					canvas.clearSelection();
					walkTree(current_layer,function(e){e.setAttribute("style","pointer-events:none");});
					current_layer = all_layers[i][1];
					walkTree(current_layer,function(e){e.setAttribute("style","pointer-events:all");});
				}
				return true;
			}
		}
		return false;
	};
	
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
				svgzoom.insertBefore(current_layer, refLayer);
				addCommandToHistory(new MoveElementCommand(current_layer, oldNextSibling, svgzoom));
				
				canvas.identifyLayers();
				canvas.setCurrentLayer(all_layers[newpos][0]);
				
				return true;
			}
		}
		
		// TODO: if i differs, then MoveElementCommand
		return false;
	};
	
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
		}
//		call("changed", [selected]);
		
		return true;
	};
	
	// used internally
	var getLayerName = function(g) {
		return $("title",g).text();
	};

	this.clear = function() {
		current_poly_pts = [];

		// clear the svgzoom node
		var nodes = svgzoom.childNodes;
		var len = svgzoom.childNodes.length;
		var i = 0;
		this.clearSelection();
		for(var rep = 0; rep < len; rep++){
			if (nodes[i].nodeType == 1) { // element node
				svgzoom.removeChild(nodes[i]);
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
	
	this.clearPoly = function(remove) {
		if(remove && current_mode == 'poly') {
			var elem = svgdoc.getElementById(getId());
			if(elem) elem.parentNode.removeChild(elem);
		}
		removeAllPointGripsFromPoly();
		current_poly_pts = [];
		current_poly_pt = -1;
	};
	
	this.getNodePoint = function() {	
		if(current_poly_pt != -1) {
			return getPolyPoint(current_poly_pt, true);
		} else {
			return false;
		}
	}

	this.cloneNode = function() {
		var pt = current_poly_pt, list = current_poly.pathSegList;

		var next_item = list.getItem(pt+1); 
		
		// Get point in between nodes
		if(next_item.pathSegType % 2 == 0) { // even num, so abs
			var cur_item = list.getItem(pt);
			var new_x = (next_item.x - cur_item.x) / 2;
			var new_y = (next_item.y - cur_item.y) / 2;
		} else {
			var new_x = next_item.x/2;
			var new_y = next_item.y/2;
		}
		
		var seg = current_poly.createSVGPathSegLinetoRel(new_x, new_y);
		list.insertItemBefore(seg, pt+1); // Webkit doesn't do this right.
		
		replacePathSeg(5, pt+2, [new_x, new_y]);
		
		var abs_x = (getPolyPoint(pt)[0] + new_x) * current_zoom;
		var abs_y = (getPolyPoint(pt)[1] + new_y) * current_zoom;
		
		var last_num = current_poly_pts.length/2;
		
		// Add new grip
		addPointGripToPoly(abs_x, abs_y, last_num);
		
		// Update poly_pts
		current_poly_pts.splice(pt*2 + 2, 0, abs_x, abs_y);
		
		resetPointGrips();
		this.addNodeToSelection(pt+1);
	}

	this.deleteNode = function() {
		var last_pt = current_poly_pts.length/2 - 1;
		var pt = current_poly_pt, list = current_poly.pathSegList;
		var cur_item = list.getItem(pt);
		var next_item = list.getItem(pt+1);

		if(pt == 0) {
			var next_x = getPolyPoint(1)[0];
			var next_y = getPolyPoint(1)[1];
			// Make the next point be the "M" point
			replacePathSeg(2, 1, [next_x, next_y]);
			
			// Reposition last node
			var last_item = list.getItem(last_pt);
			replacePathSeg(5, last_pt, [next_x - getPolyPoint(last_pt-1)[0], next_y - getPolyPoint(last_pt-1)[1]]);
			removeControlPointGrips(last_pt - 1);
			current_poly_pts.splice(last_pt*2, 2, next_x, next_y);
			current_poly_pts.splice(0, 2);
		} else {
			// Since relative values are used, the current point's values need to be added to the next one.
			// Hard to tell whether it should be straight or curve, so always straight for now
			replacePathSeg(5, pt+1, [next_item.x + cur_item.x, next_item.y + cur_item.y]);
			current_poly_pts.splice(pt*2, 2);
		}

		list.removeItem(pt);
		
		resetPointGrips();
		
		if(window.opera) { // Opera repaints incorrectly
			var cp = $(current_poly); cp.attr('d',cp.attr('d'));
		}
		
		this.addNodeToSelection(pt);
	}

	this.getResolution = function() {
// 		return [svgroot.getAttribute("width"), svgroot.getAttribute("height")];
		var vb = svgzoom.getAttribute("viewBox").split(' ');
		return {'w':vb[2], 'h':vb[3], 'zoom': current_zoom};
	};
	
	this.setResolution = function(x, y) {
		var res = canvas.getResolution();
		var w = res.w, h = res.h;

		if(x == 'fit') {
			canvas.clearSelection();

			// Get bounding box
			var bbox = canvas.getStrokedBBox();
			
			if(bbox) {
				canvas.addToSelection(canvas.getVisibleElements());
				$.each(selectedElements, function(i, item) {
					var sel_bb = item.getBBox();
					recalculateDimensions(item, {
						x: sel_bb.x - bbox.x,
						y: sel_bb.y - bbox.y,
						width: sel_bb.width,
						height: sel_bb.height
					});
				});
				canvas.clearSelection();
				x = Math.round(bbox.width);
				y = Math.round(bbox.height);
			} else {
				return false;
			}
		}
		x *= current_zoom;
		y *= current_zoom;
		if (x != w || y != h) {
			var handle = svgroot.suspendRedraw(1000);
			var batchCmd = new BatchCommand("Change Image Dimensions");
			svgroot.setAttribute('width', x);
			svgroot.setAttribute('height', y);
			batchCmd.addSubCommand(new ChangeElementCommand(svgroot, {"width":w, "height":h}));

			svgzoom.setAttribute("viewBox", ["0 0", x/current_zoom, y/current_zoom].join(' '));
			batchCmd.addSubCommand(new ChangeElementCommand(svgzoom, {"viewBox": ["0 0", w, h].join(' ')}));
		
			addCommandToHistory(batchCmd);
			svgroot.unsuspendRedraw(handle);
			call("changed", [svgzoom]);
		}
		return true;
	};

	this.setBBoxZoom = function(val, editor_w, editor_h) {
		var spacer = .85;
		var bb;
		var calcZoom = function(bb) {
			var w_zoom = Math.round((editor_w / bb.width)*100 * spacer)/100;
			var h_zoom = Math.round((editor_h / bb.height)*100 * spacer)/100;	
			var zoomlevel = Math.min(w_zoom,h_zoom);
			canvas.setZoom(zoomlevel);
			return {'zoom': zoomlevel, 'bbox': bb};
		}
		
		if(typeof val == 'object') {
			bb = val;
			if(bb.width == 0 || bb.height == 0) {
				canvas.setZoom(current_zoom * 2);
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
		svgroot.setAttribute("width", res.w * zoomlevel);
		svgroot.setAttribute("height", res.h * zoomlevel);
		current_zoom = zoomlevel;
		$.each(selectedElements, function(i, elem) {
			if(!elem) return;
			selectorManager.requestSelector(elem).resize();
		});
		if(current_mode == "polyedit") {
			resetPointGrips();
		}
	}

	this.getMode = function() {
		return current_mode;
	};

	this.setMode = function(name) {
		// toss out half-drawn poly
		if (current_mode == "poly" && current_poly_pts.length > 0) {
			var elem = svgdoc.getElementById(getId());
			elem.parentNode.removeChild(elem);
			canvas.clearPoly();
			canvas.clearSelection();
			started = false;
		}
		else if (current_mode == "polyedit") {
			canvas.clearPoly();
		}
		
		cur_properties = (selectedElements[0] && selectedElements[0].nodeName == 'text') ? cur_text : cur_shape;
		current_mode = name;
	};

	this.getStrokeColor = function() {
		return cur_properties.stroke;
	};

	this.setStrokeColor = function(val,preventUndo) {
		cur_shape.stroke = val;
		cur_properties.stroke_paint = {type:"solidColor"};
		if (!preventUndo) 
			this.changeSelectedAttribute("stroke", val);
		else 
			this.changeSelectedAttributeNoUndo("stroke", val);
	};

	this.getFillColor = function() {
		return cur_properties.fill;
	};

	this.setFillColor = function(val,preventUndo) {
		cur_properties.fill = val;
		cur_properties.fill_paint = {type:"solidColor"};
		// take out any path/line elements when setting fill
		var elems = [];
		var i = selectedElements.length;
		while(i--) {
			var elem = selectedElements[i];
			if (elem && elem.tagName != "polyline" && elem.tagName != "line") {
				elems.push(elem);
			}
		}
		if (elems.length > 0) {
			if (!preventUndo) 
				this.changeSelectedAttribute("fill", val, elems);
			else
				this.changeSelectedAttributeNoUndo("fill", val, elems);
		}
	};

	var findDefs = function() {
		var defs = svgzoom.getElementsByTagNameNS(svgns, "defs");
		if (defs.length > 0) {
			defs = defs[0];
		}
		else {
			// first child is a comment, so call nextSibling
			defs = svgzoom.insertBefore( svgdoc.createElementNS(svgns, "defs" ), svgzoom.firstChild.nextSibling);
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
				grad = defs.appendChild( svgdoc.importNode(grad, true) );
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
		var existing_grads = defs.getElementsByTagNameNS(svgns, "linearGradient");
		var i = existing_grads.length;
		while (i--) {
			var og = existing_grads.item(i);
			if (grad.getAttribute('x1') != og.getAttribute('x1') ||
				grad.getAttribute('y1') != og.getAttribute('y1') ||
				grad.getAttribute('x2') != og.getAttribute('x2') ||
				grad.getAttribute('y2') != og.getAttribute('y2')) 
			{
				continue;
			}

			// else could be a duplicate, iterate through stops
			var stops = grad.getElementsByTagNameNS(svgns, "stop");
			var ostops = og.getElementsByTagNameNS(svgns, "stop");

			if (stops.length != ostops.length) {
				continue;
			}

			var j = stops.length;
			while(j--) {
				var stop = stops.item(j);
				var ostop = ostops.item(j);

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

	this.setStrokePaint = function(p, addGrad) {
		// make a copy
		var p = new $.jGraduate.Paint(p);
		this.setStrokeOpacity(p.alpha/100);

		// now set the current paint object
		cur_properties.stroke_paint = p;
		if (p.type == "solidColor") {
			this.setStrokeColor("#"+p.solidColor);
		}
		else if(p.type == "linearGradient") {
			canvas.strokeGrad = p.linearGradient;
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
			this.setFillColor("#"+p.solidColor);
		}
		else if(p.type == "linearGradient") {
			canvas.fillGrad = p.linearGradient;
			if(addGrad) addGradient(); 
		}
		else {
//			console.log("none!");
		}
	};

	this.getStrokeWidth = function() {
		return cur_properties.stroke_width;
	};

	this.setStrokeWidth = function(val) {
		if(val == 0 && $.inArray(current_mode, ['line', 'path']) == -1) {
			canvas.setStrokeWidth(1);
		}
		cur_properties.stroke_width = val;
		this.changeSelectedAttribute("stroke-width", val);
	};

	this.getStrokeStyle = function() {
		return cur_shape.stroke_style;
	};

	this.setStrokeStyle = function(val) {
		cur_shape.stroke_style = val;
		this.changeSelectedAttribute("stroke-dasharray", val);
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

	this.getBBox = function(elem) {
		var selected = elem || selectedElements[0];

		if(elem.nodeName == 'text' && selected.textContent == '') {
			selected.textContent = 'a'; // Some character needed for the selector to use.
			var ret = selected.getBBox();
			selected.textContent = '';
		} else {
			var ret = selected.getBBox();
		}

		// get the bounding box from the DOM (which is in that element's coordinate system)
		return ret;
	};

	this.getRotationAngle = function(elem) {
		var selected = elem || selectedElements[0];
		if(!elem.transform) return null;
		// find the rotation transform (if any) and set it
		var tlist = selected.transform.baseVal;
		var t = tlist.numberOfItems;
		var foundRot = false;
		while (t--) {
			var xform = tlist.getItem(t);
			if (xform.type == 4) {
				return xform.angle;
			} else if (xform.type == 1) {
				// Matrix transformation. Extract the rotation. (for Webkit)
				var angle = Math.round( Math.acos(xform.matrix.a) * 180.0 / Math.PI );
				if (xform.matrix.b < 0) angle = -angle;
				return angle;
			}
		}
		return 0;
	};

	this.setRotationAngle = function(val,preventUndo) {
		var elem = selectedElements[0];
		// we use the actual element's bbox (not the calculated one) since the 
		// calculated bbox's center can change depending on the angle
		var bbox = elem.getBBox();
		var cx = round(bbox.x+bbox.width/2), cy = round(bbox.y+bbox.height/2);
		var rotate = "rotate(" + val + " " + cx + "," + cy + ")";
		if (preventUndo) {
			this.changeSelectedAttributeNoUndo("transform", rotate, selectedElements);
		}
		else {
			this.changeSelectedAttribute("transform",rotate,selectedElements);
		}
		var pointGripContainer = document.getElementById("polypointgrip_container");
		var ctrlPointGripContainer = document.getElementById("ctrlpointgrip_container");
		if(elem.nodeName == "path" && pointGripContainer) {
			pointGripContainer.setAttribute("transform", rotate);
			if(ctrlPointGripContainer) {
				ctrlPointGripContainer.setAttribute("transform", rotate);
			}
		}
		selectorManager.requestSelector(selectedElements[0]).updateGripCursors(val);
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
		this.changeSelectedAttribute("#href", val);
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
	
	this.quickClone = function(elem) {
		// Hack for Firefox bugs where text element features aren't updated
		if(navigator.userAgent.indexOf('Gecko/') == -1) return elem;
		var clone = elem.cloneNode(true)
		elem.parentNode.insertBefore(clone, elem);
		elem.parentNode.removeChild(elem);
		canvas.clearSelection();
		canvas.addToSelection([clone],true);
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
	
	// This function makes the changes to the elements and then 
	// fires the 'changed' event 
	this.changeSelectedAttributeNoUndo = function(attr, newValue, elems) {
		var handle = svgroot.suspendRedraw(1000);
		if(current_mode == 'polyedit') {
			// Editing node
			var num = (attr == 'x')?0:1;
			var old_poly_pts = $.map(current_poly_pts, function(n){return n/current_zoom;});

			current_poly_pts[current_poly_pt*2 + num] = newValue-0;
			current_poly_pt_drag = current_poly_pt;
			updatePoly(current_poly_pts[current_poly_pt*2], current_poly_pts[current_poly_pt*2 + 1], old_poly_pts);
		}
		var elems = elems || selectedElements;
		var i = elems.length;
		while (i--) {
			var elem = elems[i];
			if (elem == null) continue;
			// only allow the transform/opacity attribute to change on <g> elements, slightly hacky
			if (elem.tagName == "g" && (attr != "transform" && attr != "opacity")) continue;
			var oldval = attr == "#text" ? elem.textContent : elem.getAttribute(attr);
			if (oldval == null)  oldval = "";
			if (oldval != newValue) {
				if (attr == "#text") {
					elem.textContent = newValue;
					elem = canvas.quickClone(elem);
				} else if (attr == "#href") {
					elem.setAttributeNS(xlinkns, "href", newValue);
        		}
				else elem.setAttribute(attr, newValue);
				selectedBBoxes[i] = this.getBBox(elem);
				// Use the Firefox quickClone hack for text elements with gradients or
				// where other text attributes are changed. 
				if(elem.nodeName == 'text') {
					if((newValue+'').indexOf('url') == 0 || $.inArray(attr, ['font-size','font-family','x','y']) != -1) {
						elem = canvas.quickClone(elem);
					}
				}
				// Timeout needed for Opera & Firefox
				setTimeout(function() {
					selectorManager.requestSelector(elem).resize(selectedBBoxes[i]);
				},0);
				// if this element was rotated, and we changed the position of this element
				// we need to update the rotational transform attribute 
				var angle = canvas.getRotationAngle(elem);
				if (angle && attr != "transform") {
					var cx = round(selectedBBoxes[i].x + selectedBBoxes[i].width/2),
						cy = round(selectedBBoxes[i].y + selectedBBoxes[i].height/2);
					var rotate = ["rotate(", angle, " ", cx, ",", cy, ")"].join('');
					if (rotate != elem.getAttribute("transform")) {
						elem.setAttribute("transform", rotate);
					}
				}
			} // if oldValue != newValue
		} // for each elem
		svgroot.unsuspendRedraw(handle);		
		call("changed", elems);
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

	$(container).mouseup(mouseUp);
	$(container).mousedown(mouseDown);
	$(container).mousemove(mouseMove);

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
		
		// ensure selectors are at bottom and update selection
		selectorManager.update();
		canvas.clearSelection();
		canvas.addToSelection([g]);
	};

	// TODO: when transferring group's rotational transform to the children, must deal
	// with children who are already rotated within the group (Issue 204)
	this.ungroupSelectedElement = function() {
		var g = selectedElements[0];
		if (g.tagName == "g") {
			var batchCmd = new BatchCommand("Ungroup Elements");
			var parent = g.parentNode;
			var anchor = g.previousSibling;
			var children = new Array(g.childNodes.length);
			var xform = g.getAttribute("transform");
			var i = 0;
			var gbox = g.getBBox(),
				gx = gbox.x + gbox.width/2,
				gy = gbox.y + gbox.height/2;
			var gangle = canvas.getRotationAngle(g) * Math.PI / 180.0;
			while (g.firstChild) {
				var elem = g.firstChild;
				var oldNextSibling = elem.nextSibling;
				var oldParent = elem.parentNode;
				children[i++] = elem = parent.insertBefore(elem, anchor);
				batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
				if (xform) {
					var childBox = elem.getBBox();
					var cx = childBox.x + childBox.width/2,
						cy = childBox.y + childBox.height/2,
						dx = cx - gx,
						dy = cy - gy,
						r = Math.sqrt(dx*dx + dy*dy);
					var tangle = gangle + Math.atan2(dy,dx);
					var newcx = r * Math.cos(tangle) + gx,
						newcy = r * Math.sin(tangle) + gy;
					childBox.x += (newcx - cx);
					childBox.y += (newcy - cy);
					// now we add the angle that the element was rotated by
					// if it's non-zero, we need to set the new transform
					// otherwise, we clear it
					var angle = gangle + canvas.getRotationAngle(elem) * Math.PI / 180.0;
					var changes = {};
					changes["transform"] = elem.getAttribute("transform");
					if (angle != 0) {
						elem.setAttribute("transform", "rotate(" + (angle*180.0)/Math.PI + " " + cx + "," + cy + ")");
					}
					else {
						elem.setAttribute("transform", "");
					}
					batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
					batchCmd.addSubCommand(recalculateDimensions(elem, childBox));
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
			
			// ensure selectors are at bottom and update selection
			selectorManager.update();
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
			// first child is a comment, so call nextSibling
			var firstChild = t.parentNode.firstChild.nextSibling;
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
			dx *= current_zoom;
			dy *= current_zoom;
		}
		var undoable = undoable || true;
		var batchCmd = new BatchCommand("position");
		var i = selectedElements.length;
		while (i--) {
			var selected = selectedElements[i];
			if (selected != null) {
				selectedBBoxes[i] = this.getBBox(selected);
				// dx and dy could be arrays
				if (dx.constructor == Array) {
					selectedBBoxes[i].x += dx[i] * current_zoom;
				} else {
					selectedBBoxes[i].x += dx;
				}
				if (dy.constructor == Array) {
					selectedBBoxes[i].y += dy[i] * current_zoom;
				} else {
					selectedBBoxes[i].y += dy;
				}
				var cmd = recalculateDimensions(selected,selectedBBoxes[i]);
				if (cmd) {
					batchCmd.addSubCommand(cmd);
				}
				selectorManager.requestSelector(selected).resize(selectedBBoxes[i]);
			}
		}
		if (!batchCmd.isEmpty()) {
			if (undoable)
				addCommandToHistory(batchCmd);
			call("changed", selectedElements);
		}
	};

	this.getStrokedBBox = function(elems) {
		// TODO: Get correct BBoxes for rotated elements
		if(!elems) elems = canvas.getVisibleElements();
		if(!elems.length) return false;
		var full_bb = elems[0].getBBox();
		var max_x = full_bb.x + full_bb.width;
		var max_y = full_bb.y + full_bb.height;
		var min_x = full_bb.x;
		var min_y = full_bb.y;
		var getOffset = function(elem) {
			var sw = round(elem.getAttribute("stroke-width"));
			var offset = 0;
			if (elem.getAttribute("stroke") != "none" && !isNaN(sw)) {
				offset += sw/2;
			}
			return offset;
		}
		
		$.each(elems, function(i, elem) {
			var cur_bb = elem.getBBox();
			var offset = getOffset(elem);
			min_x = Math.min(min_x, cur_bb.x - offset);
			min_y = Math.min(min_y, cur_bb.y - offset);
		});
		
		full_bb.x = min_x;
		full_bb.y = min_y;
		
		$.each(elems, function(i, elem) {
			var cur_bb = elem.getBBox();
			var offset = getOffset(elem);
			max_x = Math.max(max_x, cur_bb.x + cur_bb.width + offset);
			max_y = Math.max(max_y, cur_bb.y + cur_bb.height + offset);
		});
		
		full_bb.width = max_x - min_x;
		full_bb.height = max_y - min_y;
		return full_bb;
	}

	this.getVisibleElements = function(parent, includeBBox) {
		if(!parent) parent = svgzoom;
		var nodes = parent.childNodes;
		var i = nodes.length;
		var contentElems = [];
		
		while (i--) {
			var elem = nodes[i];
			try {
				var box = canvas.getBBox(elem);
				if (box) {
					var item = includeBBox?{'elem':elem, 'bbox':box}:elem;
					contentElems.push(item);
				}
			} catch(e) {}
		}
		return contentElems;
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
			removeAllPointGripsFromPoly();
			var cmd = undoStack[--undoStackPointer];
			cmd.unapply();
			call("changed", cmd.elements());
		}
	};
	this.redo = function() {
		if (undoStackPointer < undoStack.length && undoStack.length > 0) {
			this.clearSelection();
			var cmd = undoStack[undoStackPointer++];
			cmd.apply();
			call("changed", cmd.elements());
		}
	};

	// this creates deep DOM copies (clones) of all selected elements
	this.cloneSelectedElements = function() {
		var copyElem = function(el) {
			// Manual clone function for Opera/Win/non-EN. 
			// Needed because cloneNode changes "." to "," on float values
			if(!window.opera) {
				var newElem = el.cloneNode(true);
				// Webkit has a bug where a cloned element's transforms become matrix()
				// we need to replace those with the original element's transforms
				// TODO: raise webkit bug
				var origtlist = el.transform.baseVal,
					newtlist = newElem.transform.baseVal;
				while (newtlist.numberOfItems > 0) {
					newtlist.removeItem(0);
				}
				for (var j = 0; j < origtlist.numberOfItems; ++j) {
					newtlist.appendItem( origtlist.getItem(j) );
				}
				return newElem;
			}
			var new_el = document.createElementNS(svgns, el.nodeName);
			$.each(el.attributes, function(i, attr) {
				var ns = attr.nodeName == 'href'?xlinkns:null;
				new_el.setAttributeNS(ns, attr.nodeName, attr.nodeValue);
			});
			
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
			return new_el;
		}
	
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
			elem.removeAttribute("id");
			elem.id = getNextId();
			current_layer.appendChild(elem);
			batchCmd.addSubCommand(new InsertElementCommand(elem));
		}

		if (!batchCmd.isEmpty()) {
			this.addToSelection(copiedElements);
			this.moveSelectedElements(20,20,false);
			addCommandToHistory(batchCmd);
			call("selected", selectedElements);
		}
	};

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
			bboxes[i] = this.getBBox(elem);
			// TODO: could make the following code block as part of getBBox() and add a parameter 
			//       to that function
			// if element is rotated, get angle and rotate the 4 corners of the bbox and get
			// the new axis-aligned bbox
			angles[i] = this.getRotationAngle(elem) * Math.PI / 180.0;
			if (angles[i]) {
				var rminx = Number.MAX_VALUE, rminy = Number.MAX_VALUE, 
					rmaxx = Number.MIN_VALUE, rmaxy = Number.MIN_VALUE;
				var cx = round(bboxes[i].x + bboxes[i].width/2),
					cy = round(bboxes[i].y + bboxes[i].height/2);
				var pts = [ [bboxes[i].x - cx, bboxes[i].y - cy], 
							[bboxes[i].x + bboxes[i].width - cx, bboxes[i].y - cy],
							[bboxes[i].x + bboxes[i].width - cx, bboxes[i].y + bboxes[i].height - cy],
							[bboxes[i].x - cx, bboxes[i].y + bboxes[i].height - cy] ];
				var j = 4;
				while (j--) {
					var x = pts[j][0],
						y = pts[j][1],
						r = Math.sqrt( x*x + y*y );
					var theta = Math.atan2(y,x) + angles[i];
					x = round(r * Math.cos(theta) + cx);
					y = round(r * Math.sin(theta) + cy);

					// now set the bbox for the shape after it's been rotated
					if (x < rminx) rminx = x;
					if (y < rminy) rminy = y;
					if (x > rmaxx) rmaxx = x;
					if (y > rmaxy) rmaxy = y;
				}
				
				bboxes[i].x = rminx;
				bboxes[i].y = rminy;
				bboxes[i].width = rmaxx - rminx;
				bboxes[i].height = rmaxy - rminy;
			}
			
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
			maxx = svgroot.getAttribute('width');
			maxy = svgroot.getAttribute('height');
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
	
	this.clear();
};

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
