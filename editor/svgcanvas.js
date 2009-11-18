/*
	TODOs for TransformList:

	* See if I can transfer scales at the end of the tlist down to the children 
	* Groups of scaled groups have selector box sizing problems
	* Fix rotating of resized groups (need to re-center?)
	* Ensure ungrouping works (surely broken)
*/
/*
	TODOs for Localizing:
	
	- rename tool_path to tool_fhpath in all localization files (already updated in UI and script)
	- rename tool_poly to tool_path in all localization files (already updated in UI and script)
	- rename poly_node_x to path_node_x globally
	- rename poly_node_y to path_node_y globally
	- rename svninfo_dim to svginfo_dim globally (typo)
	- provide translations in all other non-EN lang.XX.js files for:
		- path_node_x
		- path_node_y
		- seg_type
		- straight_segments
		- curve_segments
		- tool_node_clone
		- tool_node_delete
		- selLayerLabel
		- selLayerNames
		- sidepanel_handle
*/
var isWebkit = navigator.userAgent.indexOf("AppleWebKit") != -1;
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
	"circle": ["cx", "cy", "fill", "fill-opacity", "fill-rule", "id", "opacity", "r", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform"],
	"defs": [],
	"desc": [],
	"ellipse": ["cx", "cy", "fill", "fill-opacity", "fill-rule", "id", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform"],
	"g": ["id", "display", "requiredFeatures", "systemLanguage", "transform"],
	"image": ["height", "id", "opacity", "requiredFeatures", "systemLanguage", "transform", "width", "x", "xlink:href", "xlink:title", "y"],
	"line": ["fill", "fill-opacity", "fill-rule", "id", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform", "x1", "x2", "y1", "y2"],
	"linearGradient": ["id", "gradientTransform", "gradientUnits", "requiredFeatures", "spreadMethod", "systemLanguage", "x1", "x2", "y1", "y2"],
	"path": ["d", "fill", "fill-opacity", "fill-rule", "id", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform"],
	"polygon": ["id", "fill", "fill-opacity", "fill-rule", "id", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform"],
	"polyline": ["id", "fill", "fill-opacity", "fill-rule", "opacity", "points", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform"],
	"radialGradient": ["id", "cx", "cy", "fx", "fy", "gradientTransform", "gradientUnits", "r", "requiredFeatures", "spreadMethod", "systemLanguage"],
	"rect": ["fill", "fill-opacity", "fill-rule", "height", "id", "opacity", "requiredFeatures", "rx", "ry", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform", "width", "x", "y"],
	"stop": ["id", "offset", "requiredFeatures", "stop-color", "stop-opacity", "systemLanguage"],
	"switch": ["id", "requiredFeatures", "systemLanguage"],
	"svg": ["id", "height", "requiredFeatures", "systemLanguage", "transform", "viewBox", "width", "xmlns", "xmlns:xlink"],
	"text": ["fill", "fill-opacity", "fill-rule", "font-family", "font-size", "font-style", "font-weight", "id", "opacity", "requiredFeatures", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "systemLanguage", "transform", "text-anchor", "x", "xml:space", "y"],
	"title": [],
};

function SvgCanvas(c)
{

var toXml = function(str) {
	return str.replace("&", "&amp;").replace("<", "&lt;").replace(">","&gt;");
};
var fromXml = function(str) {
	return str.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&");
};

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
		if (this.elem.tagName == "title" && this.elem.parentNode.parentNode == svgcontent) {
			identifyLayers();
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
								"id": ("selectorGrip_rotateconnector_" + this.id),
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
						"id": ("selectorGrip_resize_" + dir + "_" + this.id),
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
		}

		this.showGrips = function(show) {
			// TODO: use suspendRedraw() here
			var bShow = show ? "inline" : "none";
			this.rotateGrip.setAttribute("display", bShow);
			this.rotateGripConnector.setAttribute("display", bShow);
			var elem = this.selectedElement;
			if(elem && (elem.tagName == "text")) bShow = "none";// || elem.tagName == "g")) bShow = "none";
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
		
		// TODO: update this function to not use the cur_bbox anymore
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
			if(selected.tagName == 'g') {
				// The bbox for a group does not include stroke vals, so we
				// get the bbox based on its children. 
				var stroked_bbox = canvas.getStrokedBBox(selected.childNodes);

				$.each(bbox, function(key, val) {
					bbox[key] = bbox[key] + stroked_bbox[key] - oldbox[key];
				});
			}
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset<<1), h=bbox.height+(offset<<1);

			// loop and transform our bounding box until we reach our first rotation
			var tlist = canvas.getTransformList(this.selectedElement);
			var m = svgroot.createSVGMatrix();
			var bFoundRotate = false;
			var topleft = {x:l*current_zoom,y:t*current_zoom},
				botright = {x:(l+w)*current_zoom,y:(t+h)*current_zoom};
			var tstr = "";
			var i = tlist.numberOfItems;
			// loop backwards through the list of transforms and update the selector box coords
			while (i--) {
				var xform = tlist.getItem(i);
				// once we hit a rotate, we stop doing this and just save up the transform
				// string fragment and apply it to the selector group
				if (xform.type == 4) {
					bFoundRotate = true;
				}
				if (bFoundRotate) {
					tstr = transformToObj(xform).text + " " + tstr;
				}
				else if(!bFoundRotate) {
					m = matrixMultiply(xform.matrix,m);
				}
			}
			
			// This should probably be handled somewhere else, but for now
			// it keeps the selection box correctly positioned when zoomed
			m.e *= current_zoom;
			m.f *= current_zoom;
			
			// apply the transforms
			topleft = transformPoint( topleft.x, topleft.y, m );
			botright = transformPoint( botright.x, botright.y, m );
			
			this.selectorGroup.setAttribute("transform", "");
			this.selectorGroup.removeAttribute("transform");
			if (tstr != "") {
				this.selectorGroup.setAttribute("transform", tstr);
			}
			
			l = topleft.x;
			t = topleft.y;
			w = botright.x - topleft.x;
			h = botright.y - topleft.y;

			// TODO: handle negative?

			var sr_handle = svgroot.suspendRedraw(100);

			// TODO: move to a path instead of a rect and then plot the
			// grip coordinates more carefully
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

	var assignAttributes = function(node, attrs, suspendLength) {
		if(!suspendLength) suspendLength = 0;
		// Opera has a problem with suspendRedraw() apparently
		var handle = null;
		if (!window.opera) svgroot.suspendRedraw(suspendLength);

		for (i in attrs) {
			var ns = (i.substr(0,4) == "xml:" ? xmlns : 
				i.substr(0,6) == "xlink:" ? xlinkns : null);
			node.setAttributeNS(ns, i, attrs[i]);
		}
		
		if (!window.opera) svgroot.unsuspendRedraw(handle);
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
		if (element.getAttribute('display') == 'inline')
			element.removeAttribute('display');
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
	var xmlns = "http://www.w3.org/XML/1998/namespace";
	var idprefix = "svg_";
	var svgdoc  = c.ownerDocument;
	var svgroot = svgdoc.createElementNS(svgns, "svg");
	svgroot.setAttribute("width", 640);
	svgroot.setAttribute("height", 480);
	svgroot.setAttribute("id", "svgroot");
	svgroot.setAttribute("xmlns", svgns);
	svgroot.setAttribute("xmlns:xlink", xlinkns);
	container.appendChild(svgroot);
	var svgcontent = svgdoc.createElementNS(svgns, "svg");
	svgcontent.setAttribute('id', 'svgcontent');
	svgcontent.setAttribute('viewBox', '0 0 640 480');
	svgcontent.setAttribute("xmlns", svgns);
	svgcontent.setAttribute("xmlns:xlink", xlinkns);
	svgroot.appendChild(svgcontent);
	// TODO: make this string optional and set by the client
	// TODO: make sure this is always at the top of the SVG file right underneath the <svg> element
	var comment = svgdoc.createComment(" Created with SVG-edit - http://svg-edit.googlecode.com/ ");
	svgcontent.appendChild(comment);
	// TODO For Issue 208: this is a start on a thumbnail
//	var svgthumb = svgdoc.createElementNS(svgns, "use");
//	svgthumb.setAttribute('width', '100');
//	svgthumb.setAttribute('height', '100');
//	svgthumb.setAttributeNS(xlinkns, 'href', '#svgcontent');
//	svgroot.appendChild(svgthumb);
	// z-ordered array of tuples containing layer names and <g> elements
	// the first layer is the one at the bottom of the rendering
	var all_layers = [];
	var encodableImages = {};
	var last_good_img_url = 'images/logo.png';
	// pointer to the current layer <g>
	var current_layer = null;
	var save_options = {round_digits: 5};
	var d_attr = null;
	var started = false;
	var obj_num = 1;
	var start_x = null;
	var start_y = null;
	var start_transform = null;
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
		font_size: 24,
		font_family: 'serif'
	});

	var cur_shape = all_properties.shape;
	var cur_text = all_properties.text;
	var cur_properties = cur_shape;
	
	var freehand_min_x = null;
	var freehand_max_x = null;
	var freehand_min_y = null;
	var freehand_max_y = null;
	var current_path = null;
	var current_path_pts = [];
	var current_path_pt = -1;
	var current_path_pt_drag = -1;
	var current_path_oldd = null;
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
			// Remove empty text nodes
			if(!node.nodeValue.length) node.parentNode.removeChild(node);
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
				if(attrName == 'd') {
					// Convert to absolute
					node.setAttribute('d',convertPath(node));
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
		var defs = svgcontent.getElementsByTagNameNS(svgns, "defs");
		if(!defs || !defs.length) return;
		
		var all_els = svgcontent.getElementsByTagNameNS(svgns, '*');
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
		
		var lgrads = svgcontent.getElementsByTagNameNS(svgns, "linearGradient");
		var grad_ids = [];
		var i = lgrads.length;
		while (i--) {
			var grad = lgrads[i];
			var id = grad.id;
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
		canvas.clearPath(true);
		$.each(svgcontent.childNodes, function(i, node) {
			if(i && node.nodeType == 8 && node.data.indexOf('Created with') != -1) {
				svgcontent.insertBefore(node, svgcontent.firstChild);
			}
		});
		svgcontent.removeAttribute('id');
		var output = svgToString(svgcontent, 0);
		svgcontent.id = 'svgcontent';
		return output;
	}

	var svgToString = function(elem, indent) {
		var out = new Array();
		if (elem) {
			cleanupElement(elem);
			var attrs = elem.attributes;
			var attr;
			var i;
			var childs = elem.childNodes;
			for (i=0; i<indent; i++) out.push(" ");
			out.push("<"); out.push(elem.nodeName);
			for (i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				var attrVal = attr.nodeValue;
				if (attrVal != "") {
					if(attrVal.indexOf('pointer-events') == 0) continue;
					out.push(" "); 
					if(attr.localName == 'd') attrVal = convertPath(elem, true);
					if(!isNaN(attrVal)) {
						attrVal = shortFloat(attrVal);
					}
					
					// Embed images when saving 
					if(save_options.apply
						&& elem.nodeName == 'image' 
						&& attr.localName == 'href'
						&& save_options.images
						&& save_options.images == 'embed') {
						var img = encodableImages[attrVal];
						if(img) attrVal = img;
					}
					// map various namespaces to our fixed namespace prefixes
					// TODO: put this into a map and do a look-up instead of if-else
					if (attr.namespaceURI == xlinkns) {
						out.push('xlink:');
					}
					else if(attr.namespaceURI == 'http://www.w3.org/2000/xmlns/' && attr.localName != 'xmlns') {
						out.push('xmlns:');
					}
					else if(attr.namespaceURI == xmlns) {
						out.push('xml:');
					}
					out.push(attr.localName); out.push("=\""); 
					out.push(attrVal); out.push("\"");
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

	this.embedImage = function(val, callback) {
	
		// Below is some code to fetch the data: URL representation
		// of local image files. It is commented out until we figure out
		// a way of introducing this as an option into the UI.  Also, it 
		// does not work in Firefox at all :(

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
			var cmd = recalculateDimensions(selectedElements[i]);//,selectedBBoxes[i]);
			if (cmd) {
				batchCmd.addSubCommand(cmd);
			}
		}

		if (!batchCmd.isEmpty()) {
			addCommandToHistory(batchCmd);
			call("changed", selectedElements);
		}
	};
	
	/*
	
	The user changes shape geometry in one of several ways:
		- drag/moving it
		- rotating it
		- FUTURE: skewing it
		- resizing it
	(we ignore path node editing here)
	
	From a transformation point of view:
		- translations are always in the editor's frame of reference (NOT the element's)
		- rotations rotate the element's frame of reference
		- FUTURE: skewing skews the element's rotated frame of reference
		- resizing modifies the dimensions of the element in its rotated+skewed
		  frame of reference.
	
	Thus, from a coding point of view, what we do when the user is changing geometry is:
	
	- when the user drags an element, we PREPEND the tlist with a: 
			translate(tx,ty)
	- when the user rotates an element, we INSERT into the tlist a:
			rotate(angle,cx,cy) after any translates 
	- FUTURE: when the user skews an element, we INSERT into the tlist a:
			skewX(angle) or skewY(angle) after the rotate
	- when the user is resizing an element, we APPEND the tlist with a:
			translate(tx,ty) scale(sx,sy) translate(-tx,-ty)

	Thus, a simple element's transform list looks like the following:
		[ Translate ] [ Rotate ] [ SkewX/Y] [ Scale ]

	When the user is done changing the shape's geometry (i.e. upon lifting the mouse button)		
	we then attempt to reduce the transform list of the element by the following:
	
	- a translate can be removed by actually moving the element (modifying its x,y values)
	- a rotate cannot be removed
	- FUTURE: a skewX/skewY cannot be removed
	- a scale can be removed by resizing the element (modifying its width/height values)
		
	Thus, a simple element's transform list can always be reduced to:
		[ Rotate ] [ SkewX/Y ]
		
	However, a group is an element that contains one or more other elements, let's call 
	this a Complex Element.
		
	From the user point of view, a complex element is handled no differently 
	than a simple element.  Thus its transform list looks like the following:
		[ Translate] [ Rotate ] [ SkewX/SkewY ] [ Scale ]
		
	- all translates can be removed by moving the element's children
	- all rotations can be collapsed down to one rotation
	- all scales can be collapsed down to one scale (we cannot simply resize the children
	  because the child of a <g> may be another group - and that <g> may be rotated!)
		
	This means a complex element has a reduced transform list as:
		[ Rotate ] [ SkewX/SkewY ] [ Scale ]
		
	Next, we have to consider the case when a group is dissolved (ungrouped).  When
	the group is dissolving, the transform list must make its way down to the children.
	
	Thus, every child of the now-dissolved group inherits the transformlist.  Child N's 
	transform list looks like:
		[ Parent Rotate ] [ Parent SkewX/SkewY ] [ Parent Scale ] [ Rotate ] [ SkewX/SkewY ] [ Scale ]
	
	THINGS TO FIGURE OUT:
	
	1) It's not clear to me yet what happens when you want to rotate an element with the 
	above type of transform list.
	
	2) It's also not clear to me if we need to calculate the rotation angle of the element
	differently (nor what we should display as the element's rotation angle).
	
	*/

	// this is how we map paths to our preferred relative segment types
	var pathMap = [ 0, 'z', 'M', 'M', 'L', 'L', 'C', 'C', 'Q', 'Q', 'A', 'A', 
					'L', 'L', 'L', 'L', // TODO: be less lazy below and map them to h and v
					'S', 'S', 'T', 'T' ];
	var truePathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a', 
						'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];

	var logMatrix = function(m) {
		console.log([m.a,m.b,m.c,m.d,m.e,m.f]);
	};
	
	// this function returns the command which resulted from the selected change
	// TODO: use suspendRedraw() and unsuspendRedraw() around this function
	var recalculateDimensions = function(selected) {
		if (selected == null) return null;
		// if this element had no transforms, we are done
		var tlist = canvas.getTransformList(selected);
		if (tlist.numberOfItems == 0) return null;

		// remove any stray identity transforms
		if (tlist && tlist.numberOfItems > 0) {
			var k = tlist.numberOfItems;
			while (k--) {
				var xform = tlist.getItem(k);
				if (xform.type == 0 || xform.type == 1) {
					tlist.removeItem(k);
				}
			}
		}
		
		// we know we have some transforms, so set up return variable		
		var batchCmd = new BatchCommand("Transform");
		
		// store initial values that will be affected by reducing the transform list
		var changes = {}, initial = null;
		switch (selected.tagName)
		{
			case "line":
				changes["x1"] = selected.getAttribute("x1");
				changes["y1"] = selected.getAttribute("y1");
				changes["x2"] = selected.getAttribute("x2");
				changes["y2"] = selected.getAttribute("y2");
				break;
			case "circle":
				changes["cx"] = selected.getAttribute("cx");
				changes["cy"] = selected.getAttribute("cy");
				changes["r"] = selected.getAttribute("r");
				break;
			case "ellipse":
				changes["cx"] = selected.getAttribute("cx");
				changes["cy"] = selected.getAttribute("cy");
				changes["rx"] = selected.getAttribute("rx");
				changes["ry"] = selected.getAttribute("ry");
				break;
			case "rect":
			case "image":
				changes["x"] = selected.getAttribute("x");
				changes["y"] = selected.getAttribute("y");
				changes["width"] = selected.getAttribute("width");
				changes["height"] = selected.getAttribute("height");
				break;
			case "text":
				changes["x"] = selected.getAttribute("x");
				changes["y"] = selected.getAttribute("y");
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
				var segList = selected.pathSegList;
				var len = segList.numberOfItems;
				changes["d"] = new Array(len);
				for (var i = 0; i < len; ++i) {
					var seg = segList.getItem(i);
					changes["d"][i] = {
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
				break;
		} // switch on element type to get initial values
		
		// if we haven't created an initial array in polygon/polyline/path, then 
		// make a copy of initial values and include the transform
		if (initial == null) {
			initial = jQuery.extend(true, {}, changes);
		}
		// save the start transform value too
		initial["transform"] = start_transform ? start_transform : "";
		
		// reduce the transform list here...
		var box = canvas.getBBox(selected);
		var origcenter = {x: (box.x+box.width/2), y: (box.y+box.height/2)};
		var newcenter = {x: origcenter.x, y: origcenter.y};
		var tx = 0.0, ty = 0.0, sx = 1.0, sy = 1.0, r = 0.0;

		// if it's a group, we have special reduction loops to flatten transforms
		if (selected.tagName == "g") {
			// loop through transforms and accumulate translation and scaling
			var mat = svgroot.createSVGMatrix();
			n = tlist.numberOfItems;
			while (n--) {
				var xform = tlist.getItem(n);

				// if it's a scale, we accumulate it
				if (xform.type == 3) {
					// update the frame of reference
					mat = matrixMultiply(xform.matrix, mat);

					// accumulate the scale values
					var sobj = transformToObj(xform);
					sx *= sobj.sx;
					sy *= sobj.sy;
					tlist.removeItem(n);
				}
				// if it's a rotation, adjust the frame of reference
				else if (xform.type == 4) {
//					mat = matrixMultiply(xform.matrix, mat);
					r = xform.angle;
					tlist.removeItem(n);
				}
				// accumulate the transformed translation
				else if (xform.type == 2) {
					// determine the translation based on the accumulated transformation thus far
					var tobj = transformToObj(xform);
					var t = transformPoint(tobj.tx, tobj.ty, mat.inverse());
					// accumulate translation values
					tx += t.x;
					ty += t.y;
					tlist.removeItem(n);
				}
			}
			
			// force the accumulated translation down to the children			
			if (tx != 0 || ty != 0) {
				// we pass the translates down to the individual children
				var children = selected.childNodes;
				var c = children.length;
				while (c--) {
					var child = children.item(c);
					if (child.nodeType == 1) {
						var childTlist = canvas.getTransformList(child);
						var newxlate = svgroot.createSVGTransform();
						newxlate.setTranslate(tx,ty);
						childTlist.insertItemBefore(newxlate, 0);
						batchCmd.addSubCommand( recalculateDimensions(child) );
					}
				}
			}
			
			// now append the single scale to the end of this group's tlist
			// NOTE: we can't force this down to the children because they 
			// might be rotated on a different frame of reference than the scale
			if (sx != 1 || sy != 1) {
				var newscale = svgroot.createSVGTransform();
				newscale.setScale(sx,sy);
				tlist.appendItem(newscale);
			}
			
			if (r != 0.0) {
				// get new bbox
				var box = canvas.getBBox(selected);
				// transform the center point by any remaining scale transforms
				var cx = (box.x+box.width/2)*sx,
					cy = (box.y+box.height/2)*sy;
				var newrot = svgroot.createSVGTransform();
				newrot.setRotate(r,cx,cy);
				tlist.insertItemBefore(newrot,0);
			}
		}
		// else, it's a non-group
		else {
			// This pass loop in reverse order and removes any translates or scales.
			// Once we hit our first rotate(), we will only remove translates.
			var bRemoveTransform = true;
			n = tlist.numberOfItems;
			while (n--) {
				// once we reach an unmoveable transform, we can stop
				var xform = tlist.getItem(n);
				var m = xform.matrix;
				// if translate...
				var remap = null, scalew = null, scaleh = null;
				switch (xform.type) {
					case 2: // TRANSLATE - always remove
						remap = function(x,y) { return transformPoint(x,y,m); };
						scalew = function(w) { return w; }
						scaleh = function(h) { return h; }
						break;
					case 3: // SCALE - only remove if we haven't hit a rotate
						if (!bRemoveTransform) continue;
						remap = function(x,y) { return transformPoint(x,y,m); };
						scalew = function(w) { return m.a * w; }
						scaleh = function(h) { return m.d * h; }
						break;
					case 4: // ROTATE - only re-center if we haven't previously hit a rotate
						if (!bRemoveTransform) continue;
						// if the new center of the shape has moved, then 
						// re-center the rotation, and determine the movement 
						// offset required to keep the shape in the same place
						if (origcenter.x != newcenter.x || origcenter.y != newcenter.y) {
							var alpha = xform.angle * Math.PI / 180.0;
			
							// determine where the new rotated center should be
							var dx = newcenter.x - origcenter.x,
								dy = newcenter.y - origcenter.y,
								r = Math.sqrt(dx*dx + dy*dy),
								theta = Math.atan2(dy,dx) + alpha;
							var cx = r * Math.cos(theta) + origcenter.x,
								cy = r * Math.sin(theta) + origcenter.y;

							dx = cx - newcenter.x;
							dy = cy - newcenter.y;
					
							remap = function(x,y) { 
								return { x: x + dx, y: y + dy };
							};
							scalew = function(w) { return w; }
							scaleh = function(h) { return h; }
							// this latches to false once we hit our first rotate transform
							bRemoveTransform = false;
							var newrot = svgroot.createSVGTransform();
							newrot.setRotate(xform.angle, cx, cy);
							tlist.replaceItem(newrot, n);
						}
						break;
						// fall through to the default: continue below
					default:
						continue;
				}
				if (!remap) continue;
			
				newcenter = remap(box.x+box.width/2, box.y+box.height/2);
				var bpt = remap(box.x,box.y);
				box.x = bpt.x;
				box.y = bpt.y;
				box.width = scalew(box.width);
				box.height = scaleh(box.height);
			
				switch (selected.tagName)
				{
					case "g":
						break;
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
						changes["r"] = Math.min(box.width/2,box.height/2);
						break;
					case "ellipse":
						var c = remap(changes["cx"],changes["cy"]);
						changes["cx"] = c.x;
						changes["cy"] = c.y;
						changes["rx"] = scalew(changes["rx"]);
						changes["ry"] = scaleh(changes["ry"]);
						break;
					case "rect":
					case "image":
						var pt1 = remap(changes["x"],changes["y"]);
						changes["x"] = pt1.x;
						changes["y"] = pt1.y;
						changes["width"] = scalew(changes["width"]);
						changes["height"] = scaleh(changes["height"]);
						break;
					case "text":
						var pt1 = remap(changes["x"],changes["y"]);
						changes["x"] = pt1.x;
						changes["y"] = pt1.y;
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
						var len = changes["d"].length;
						var firstseg = changes["d"][0];
						var firstpt = remap(firstseg.x,firstseg.y);
						changes["d"][0].x = firstpt.x;
						changes["d"][0].y = firstpt.y;
						for (var i = 1; i < len; ++i) {
							var seg = changes["d"][i];
							var type = seg.type;
							// if absolute or first segment, we want to remap x, y, x1, y1, x2, y2
							// if relative, we want to scalew, scaleh
							if (type % 2 == 0) { // absolute
								var pt = remap(seg.x,seg.y),
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
						break;
				} // switch on element type to get initial values
			
				// we have eliminated the transform, so remove it from the list
				if (bRemoveTransform) {
					tlist.removeItem(n);
				}
				
				// now loop through the other transforms and adjust accordingly
				for ( var j = n; j < tlist.numberOfItems; ++j) {
					var changed_xform = tlist.getItem(j);
					switch (changed_xform.type) {
						// TODO: TRANSLATE, SCALE?
						case 4: // rotate
							var newrot = svgroot.createSVGTransform();
							newrot.setRotate(changed_xform.angle, newcenter.x, newcenter.y);
							tlist.replaceItem(newrot, j);
							break;
					}
				}
			} // looping for each transform
		} // a non-group
		
		// now we have a set of changes and an applied reduced transform list
		// we apply the changes directly to the DOM
		switch (selected.tagName)
		{
			case "line":
			case "circle":
			case "rect":
			case "ellipse":
			case "image":
			case "text":
				assignAttributes(selected, changes, 1000);
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
					dstr += truePathMap[type];
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
							dstr += seg.x + "," + seg.y + " " + seg.x1 + "," + seg.y1 + " ";
							break;
						case 11: // relative elliptical arc (a)
						case 10: // absolute elliptical arc (A)
							dstr += seg.r1 + "," + seg.r2 + " " + seg.angle + " " + seg.largeArcFlag +
								" " + seg.sweepFlag + " " + seg.x + "," + seg.y + " ";
							break;
						case 17: // relative smooth cubic (s)
						case 16: // absolute smooth cubic (S)
							dstr += seg.x + "," + seg.y + " " + seg.x2 + "," + seg.y2 + " ";
							break;
					}
				}
				selected.setAttribute("d", dstr);
				break;
		}

		// if the transform list has been emptied, remove it
		if (tlist.numberOfItems == 0) {
			selected.removeAttribute("transform");
		}
		
		batchCmd.addSubCommand(new ChangeElementCommand(selected, initial));
		
		return batchCmd;
		// -----
		// TODO: once all functionality has been restored to the above function code then
		// remove the below (old) function code

		var box = canvas.getBBox(selected);

		// if we have not moved/resized, then immediately leave
		var xform = selected.getAttribute("transform");
		var bScaleMatrix = false;
		var tlist = selected.transform.baseVal;
		var t = tlist.numberOfItems;
		while (t--) {
			var xform = tlist.getItem(t);
			if (xform.type == 3) {
				bScaleMatrix = xform.matrix;
				break;
			}
		}
		
		// Flipping points should only occur for elements without regular x,y vals
		var multiPoints = (selected.getAttribute('x') === null);
		
		// after this point, we have some change to this element
		
		var remap = function(x,y) {
				// Prevent division by 0
				if(!box.height) box.height = 1;
				if(!box.width) box.width = 1;
				
				var new_x = (((x-box.x)/box.width)*selectedBBox.width + selectedBBox.x);
				var new_y = (((y-box.y)/box.height)*selectedBBox.height + selectedBBox.y);
				
				if(multiPoints && bScaleMatrix) {
					if(bScaleMatrix.a < 0) {
						new_x = selectedBBox.x + selectedBBox.width - (new_x - selectedBBox.x);
					}
					if(bScaleMatrix.d < 0) {
						new_y = selectedBBox.y + selectedBBox.height - (new_y - selectedBBox.y);
					}
				}
				
				return {x:new_x, y:new_y};
			};
			
		var scalew = function(w) {return (w*selectedBBox.width/box.width);}
		var scaleh = function(h) {return (h*selectedBBox.height/box.height);}

		var batchCmd = new BatchCommand("Transform");
		
		// if there was a rotation transform, re-set it, otherwise empty out the transform attribute
		var angle = canvas.getRotationAngle(selected);
		if (angle) {
			// this is our old center upon which we have rotated the shape
			var tr_x = round(box.x + box.width/2),
				tr_y = round(box.y + box.height/2);
			var cx = null, cy = null;
			
			// if this was a resize, find the new cx,cy
			if (bScaleMatrix) {
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
			setPointContainerTransform(rotate);
		}
		else {
			// This fixes Firefox 2- behavior - which does not reset values when the attribute has
			// been removed, see https://bugzilla.mozilla.org/show_bug.cgi?id=320622
			selected.setAttribute("transform", "");
			selected.removeAttribute("transform");
			setPointContainerTransform("");
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
						batchCmd.addSubCommand(recalculateDimensions(child));//, childBox));
					} catch(e) {}
				}
			}
			return batchCmd;
		}	

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
				selectedBBoxes[i] = null;
			}
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

		// make sure the elements are in the correct order
		// See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
	
		selectedElements.sort(function(a,b) {
			if(a && b && a.compareDocumentPosition) {
				return 3 - (b.compareDocumentPosition(a) & 6);	
			}
		});
		
		// Make sure null value is at the end
		if(!selectedElements[0]) selectedElements.push(selectedElements.shift());
		
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
		
		var is_closed = current_path.getAttribute('d').toLowerCase().indexOf('z') != -1; 
		
		if(is_closed && point == current_path_pts.length/2 - 1) {
			current_path_pt = 0;
		} else {
			current_path_pt = point;
		}
		
		$('#pathpointgrip_container circle').attr('stroke','#00F');
		var grip = $('#pathpointgrip_' + point).attr('stroke','#0FF');
		$('#ctrlpointgrip_container circle').attr('fill', '#EEE');
		$('#ctrlpointgrip_' + current_path_pt + 'c1, #ctrlpointgrip_' + current_path_pt + 'c2').attr('fill','#0FF');
		
		updateSegLine();
		updateSegLine(true);
		
		call("selected", [grip[0]]);
	}

	// Some global variables that we may need to refactor
	var root_sctm = null;
	var mouse_target = null;

	// A (hopefully) quicker function to transform a point by a matrix
	// (this function avoids any DOM calls and just does the math)
	// Returns a x,y object representing the transformed point
	var transformPoint = function(x, y, m) {
		return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
	};
	
	// matrixMultiply() is provided because WebKit didn't implement multiply() correctly
	// on the SVGMatrix interface.  See https://bugs.webkit.org/show_bug.cgi?id=16062
	// This function tries to return a SVGMatrix that is the multiplication m1*m2.
	// As far as I can tell, there is no way for us to handle matrix multiplication 
	// of arbitrary matrices because we cannot directly set the a,b,c,d,e,f values
	// of the resulting matrix, we have to do it with translate/rotate/scale
	// TODO: investigate if webkit allows direct setting of matrix.a, etc
	var matrixMultiply = function(m1, m2) {
		var a = m1.a*m2.a + m1.c*m2.b,
			b = m1.b*m2.a + m1.d*m2.b,
			c = m1.a*m2.c + m1.c*m2.d,
			d = m1.b*m2.c + m1.d*m2.d,
			e = m1.a*m2.e + m1.c*m2.f + m1.e,
			f = m1.b*m2.e + m1.d*m2.f + m1.f;

		// now construct a matrix by analyzing a,b,c,d,e,f and trying to
		// translate, rotate, and scale the thing into place
		var m = svgroot.createSVGMatrix();
		var sx = 1, sy = 1, angle = 0;

		// translate
		m = m.translate(e,f);

		// see if there was a rotation
		var rad = Math.atan2(b,a);
		if (rad != 0 && rad != Math.PI && rad != -Math.PI) {
			m = m.rotate(180.0 * rad / Math.PI);
			sx = b / Math.sin(rad);
			sy = -c / Math.sin(rad);
		}
		else {
			sx = a / Math.cos(rad);
			sy = d / Math.cos(rad);
		}
		
		// scale
		if (sx != 1 || sy != 1) {
			m = m.scaleNonUniform(sx,sy);
		}

		// TODO: handle skews?
		return m;
	}
	
	// This returns a single matrix Transform for a given Transform List
	// (this is the equivalent of SVGTransformList.consolidate() but unlike
	//  that method, this one does not modify the actual SVGTransformList)
	var transformListToTransform = function(tlist) {
		var m = svgroot.createSVGMatrix();
		for (var i = 0; i < tlist.numberOfItems; ++i) {
			m = matrixMultiply(m, tlist.getItem(i).matrix);
		}
		return svgroot.createSVGTransformFromMatrix(m);
	};
	
	// converts a tiny object equivalent of a SVGTransform
	// has the following properties:
	// - tx, ty, sx, sy, angle, cx, cy, string
	var transformToObj = function(xform) {
		var m = xform.matrix;
		var tobj = {tx:0,ty:0,sx:1,sy:1,angle:0,cx:0,cy:0,text:""};
		switch(xform.type) {
			case 2: // TRANSFORM
				tobj.tx = m.e;
				tobj.ty = m.f;
				tobj.text = "translate(" + m.e + "," + m.f + ")";
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
				tobj.text = "rotate(" + xform.angle + " " + tobj.cx + "," + tobj.cy + ")";
				break;
			// TODO: matrix, skewX, skewY
		}
		return tobj;
	};

	// - when we are in a create mode, the element is added to the canvas
	//   but the action is not recorded until mousing up
	// - when we are in select mode, select the element, remember the position
	//   and do nothing else
	var mouseDown = function(evt)
	{
		root_sctm = svgroot.getScreenCTM().inverse();
		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm );
		var mouse_x = pt.x;
		var mouse_y = pt.y;
		evt.preventDefault();
    
		if($.inArray(current_mode, ['select', 'resize']) == -1) {
			addGradient();
		}
		
		x = mouse_x / current_zoom;
		y = mouse_y / current_zoom;
		
		start_x = x;
		start_y = y;

		// find mouse target
		mouse_target = evt.target;
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
			var gripid = evt.target.id;
			var griptype = gripid.substr(0,20);
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
						current_path = null;
					}
					// else if it's a path, go into pathedit mode in mouseup

					// insert a dummy transform so if the element is moved it will have
					// a transform to use for its translate
					tlist.insertItemBefore(svgroot.createSVGTransform(), 0);
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
				// append three dummy transforms to the tlist so that
				// we can translate,scale,translate in mousemove
				tlist.appendItem(svgroot.createSVGTransform());
				tlist.appendItem(svgroot.createSVGTransform());
				tlist.appendItem(svgroot.createSVGTransform());
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
						"style": "pointer-events:inherit"
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
						"style": "pointer-events:inherit"
					}
				});
        		newImage.setAttributeNS(xlinkns, "href", last_good_img_url);
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
						"style": "pointer-events:inherit"
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
						"style": "pointer-events:inherit"
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
						"style": "pointer-events:inherit"
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
						"style": "pointer-events:inherit"
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
						"style": "pointer-events:inherit",
						"xml:space": "preserve"
					}
				});
				newText.textContent = "text";
				break;
			case "path":
				setPointContainerTransform("");
				started = true;
				break;
			case "pathedit":
				started = true;
				current_path_oldd = current_path.getAttribute("d");
				var id = evt.target.id;
				if (id.substr(0,14) == "pathpointgrip_") {
					// Select this point
					current_path_pt_drag = parseInt(id.substr(14));
					canvas.addNodeToSelection(current_path_pt_drag);
					updateSegLine();
				} else if(id.indexOf("ctrlpointgrip_") == 0) {
					current_ctrl_pt_drag = id.split('_')[1];
					var node_num = current_ctrl_pt_drag.split('c')[0]-0;
					canvas.addNodeToSelection(node_num);
				}

				if(current_path_pt_drag == -1 && current_ctrl_pt_drag == -1) {
					// if we haven't moused down on a shape, then go into multiselect mode
					// otherwise, select it
					canvas.clearSelection();
					if (mouse_target.id != "svgroot") {
						current_path = null;
						canvas.addToSelection([mouse_target], true);
						canvas.setMode("select");
					}
					else {
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
	// a little bit for squares and paths
	var mouseMove = function(evt)
	{
		if (!started) return;
		var selected = selectedElements[0];
		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm );
		var mouse_x = pt.x;
		var mouse_y = pt.y;
		var shape = svgdoc.getElementById(getId());
    
    	x = mouse_x / current_zoom;
    	y = mouse_y / current_zoom;
    
    	evt.preventDefault();
    	
    	var setRect = function(square) {
    		var w = Math.abs(x - start_x),
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
    	}
    	
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
							var box = canvas.getBBox(selected);
							selectedBBoxes[i].x = box.x + dx;
							selectedBBoxes[i].y = box.y + dy;

							// update the dummy transform in our transform list
							// to be a translate
							var xform = svgroot.createSVGTransform();
							var tlist = canvas.getTransformList(selected);
							xform.setTranslate(dx,dy);
							if(tlist.numberOfItems) {
								tlist.replaceItem(xform, 0);
							} else {
								tlist.appendItem(xform);
							}
							
							// update our internal bbox that we're tracking while dragging
							selectorManager.requestSelector(selected).resize();//box); // TODO: remove box arg
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

				// clear out selection and set it to the new list
				canvas.clearSelection();
				// TODO: fix this, need to suppliy rect to getIntersectionList()
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
				
				// update the transform list with translate,scale,translate
				var tlist = canvas.getTransformList(selected);
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
				var N = tlist.numberOfItems;
				tlist.replaceItem(translateBack, N-3);
				tlist.replaceItem(scale, N-2);
				tlist.replaceItem(translateOrigin, N-1);
				
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
				
				selectorManager.requestSelector(selected).resize();//selectedBBox); // TODO: remove box arg
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
			case "square":
				setRect(true);
				break;
			case "rect":
			case "image":
				setRect(evt.shiftKey);
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
				// Opera has a problem with suspendRedraw() apparently
				var handle = null;
				if (!window.opera) svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
				var ry = Math.abs(evt.shiftKey?(x - cx):(y - cy));
				shape.setAttributeNS(null, "ry", ry );
				if (!window.opera) svgroot.unsuspendRedraw(handle);
				break;
			case "fhellipse":
			case "fhrect":
				freehand_min_x = Math.min(x, freehand_min_x);
				freehand_max_x = Math.max(x, freehand_max_x);
				freehand_min_y = Math.min(y, freehand_min_y);
				freehand_max_y = Math.max(y, freehand_max_y);
			// break; missing on purpose
			case "fhpath":
				start_x = x;
				start_y = y;
				d_attr += + x + "," + y + " ";
				shape.setAttributeNS(null, "points", d_attr);
				break;
			// update path stretch line coordinates
			case "path":
				var line = document.getElementById("path_stretch_line");
				if (line) {
					line.setAttribute("x2", x *= current_zoom);
					line.setAttribute("y2", y *= current_zoom);
				}
				break;
			case "pathedit":
				// if we are dragging a point, let's move it
				if (current_path_pt_drag != -1 && current_path) {
					var old_path_pts = $.map(current_path_pts, function(n){return n/current_zoom;});
					updatePath(mouse_x, mouse_y, old_path_pts);
				} else if (current_ctrl_pt_drag != -1 && current_path) {
					// Moving the control point. Since only one segment is altered,
					// we only need to do a pathSegList replace.
					var data = current_ctrl_pt_drag.split('c');
					var index = data[0]-0;
					var ctrl_num = data[1]-0;
					var c_item = current_path.pathSegList.getItem(index+1);
					
					var angle = canvas.getRotationAngle(current_path) * Math.PI / 180.0;
					if (angle) {
						// calculate the shape's old center that was used for rotation
						var box = selectedBBoxes[0];
						var cx = round(box.x + box.width/2) * current_zoom, 
							cy = round(box.y + box.height/2) * current_zoom;
						var dx = mouse_x - cx, dy = mouse_y - cy;
						var r = Math.sqrt( dx*dx + dy*dy );
						var theta = Math.atan2(dy,dx) - angle;						
						current_path_pts[i] = mouse_x = cx + r * Math.cos(theta);
						current_path_pts[i+1] = mouse_y = cy + r * Math.sin(theta);
						x = mouse_x / current_zoom;
						y = mouse_y / current_zoom;
					}
					
					c_item['x' + ctrl_num] = x;
					c_item['y' + ctrl_num] = y;
					replacePathSeg(6, index+1, [c_item.x,c_item.y, c_item.x1,c_item.y1, c_item.x2,c_item.y2]);
					
					updateSegLine(true);
					
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
				call("changed", selectedElements);
				break;
			default:
				break;
		}
	}; // mouseMove()

	var shortFloat = function(val) {
		var digits = save_options.round_digits;
		if(!isNaN(val)) {
			return Number(Number(val).toFixed(digits));
		} else if($.isArray(val)) {
			return shortFloat(val[0]) + ',' + shortFloat(val[1]);
		}
	}

	var convertPath = function(path, toRel) {
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
	};

	var resetPointGrips = function() {
		var sr = svgroot.suspendRedraw(100);
		removeAllPointGripsFromPath();
		recalcPathPoints();
		addAllPointGripsToPath();
		svgroot.unsuspendRedraw(sr);
	};
	
	var setPointContainerTransform = function(value) {
		var conts = $('#pathpointgrip_container,#ctrlpointgrip_container');
		$.each(conts,function() {
			this.setAttribute("transform", value);
			if(!value) {
				this.removeAttribute("transform");
			}
		});
	}
	
	var recalcPathPoints = function() {
		current_path_pts = [];
		var segList = current_path.pathSegList;
		var curx = segList.getItem(0).x, cury = segList.getItem(0).y;
		current_path_pts.push(curx * current_zoom);
		current_path_pts.push(cury * current_zoom);
		var len = segList.numberOfItems;
		for (var i = 1; i < len; ++i) {
			var l = segList.getItem(i);
			var x = l.x, y = l.y;
			// paths can now be closed, skip Z segments
			if (l.pathSegType == 1) {
				break;
			}
			var type = l.pathSegType;
			// current_path_pts just holds the absolute coords
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
			current_path_pts.push(curx * current_zoom);
			current_path_pts.push(cury * current_zoom);
		} // for each segment	
	}

	var removeAllPointGripsFromPath = function() {
		// loop through and hide all pointgrips
		$('#pathpointgrip_container > *').attr("display", "none");

		var line = document.getElementById("path_stretch_line");
		if (line) line.setAttribute("display", "none");
		
		$('#ctrlpointgrip_container *').attr('display','none');
	};

	var addAllPointGripsToPath = function(pointToSelect) {
		// loop through and show all pointgrips
		var len = current_path_pts.length;
		for (var i = 0; i < len; i += 2) {
			var grip = document.getElementById("pathpointgrip_"+i/2);
			if (grip) {
				assignAttributes(grip, {
					'cx': current_path_pts[i],
					'cy': current_path_pts[i+1],
					'display': 'inline'
				});
			}
			else {
				addPointGripToPath(current_path_pts[i], current_path_pts[i+1],i/2);
			}
			
			var index = i/2;
			var item = current_path.pathSegList.getItem(index);
			if(item.pathSegType == 6) {
				index -= 1;
				// Same code as when making a curve, needs to be in own function
				var cur_x = getPathPoint(index)[0];
				var cur_y = getPathPoint(index)[1];
				var next_x = getPathPoint(index+1)[0];
				var next_y = getPathPoint(index+1)[1];
				addControlPointGrip(item.x1,item.y1, cur_x,cur_y, index+'c1');
				addControlPointGrip(item.x2,item.y2, next_x,next_y, index+'c2');
			} 
		}
		// FIXME:  we cannot just use the same transform as the path because we might be 
		// at a different zoom level
		var angle = canvas.getRotationAngle(current_path);
		if (angle) {
			var bbox = canvas.getBBox(current_path);
			var cx = (bbox.x + bbox.width/2) * current_zoom,
				cy = (bbox.y + bbox.height/2) * current_zoom;
			var xform = ["rotate(", angle, " ", cx, ",", cy, ")"].join("");
			setPointContainerTransform(xform);
		}
		if(pointToSelect != null) {
			canvas.addNodeToSelection(pointToSelect);
		}
	};

	var addPointGripToPath = function(x,y,index) {
		// create the container of all the point grips
		var pointGripContainer = document.getElementById("pathpointgrip_container");
		if (!pointGripContainer) {
			var parent = document.getElementById("selectorParentGroup");
			pointGripContainer = parent.appendChild(document.createElementNS(svgns, "g"));
			pointGripContainer.id = "pathpointgrip_container";
		}

		var pointGrip = document.getElementById("pathpointgrip_"+index);
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
				'xlink:title': 'Drag point to move it. Double-click point to change segment type.'
			});
			pointGrip = pointGripContainer.appendChild(pointGrip);

			var grip = $('#pathpointgrip_'+index);
			grip.dblclick(function() {
				canvas.setSegType();
			});
		}
		
		// set up the point grip element and display it
		assignAttributes(pointGrip, {
			'cx': x,
			'cy': y,
			'display': "inline",
		});
	};
	
	var updateSegLine = function(next_node) {
		// create segment line
		var segLine = document.getElementById("segline");
		if(!segLine) {
			var pointGripContainer = $('#pathpointgrip_container')[0];
			segLine = document.createElementNS(svgns, "path");
			assignAttributes(segLine, {
				'id': "segline",
				'fill': "none",
				'stroke': "#0FF",
				'stroke-width': 2,
				'style':'pointer-events:none'
			});
			segLine = pointGripContainer.appendChild(segLine);
		}
		if(!segLine.getAttribute('d')) {
			var pt = getPathPoint(current_path_pt);
			segLine.setAttribute('d', 'M' + pt.join(',') + ' 0,0');
		}
		segLine.setAttribute('display','inline');
		
		if(current_path_pt+1 >= current_path.pathSegList.numberOfItems) {
			segLine.setAttribute('display','none');
			return;
		}
		
		if(!next_node) {
			// Replace "M" val
			replacePathSeg(2, 0, getPathPoint(current_path_pt, true), segLine);
		} else {
			var seg = current_path.pathSegList.getItem(current_path_pt+1);
			var points = [seg.x, seg.y];
			if(seg.x1 != null && seg.x2 != null) {
				points.splice(2, 0, seg.x1, seg.y1, seg.x2, seg.y2);
			}
			points = $.map(points, function(n){return n*current_zoom;});
			replacePathSeg(seg.pathSegType, 1, points, segLine);
		}
	}
	
	var updatePath = function(mouse_x, mouse_y, old_path_pts) {
    	var x = mouse_x / current_zoom;
    	var y = mouse_y / current_zoom;
    	
    	var is_closed = current_path.getAttribute('d').toLowerCase().indexOf('z') != -1; 
	
		var i = current_path_pt_drag * 2;
		var last_index = current_path_pts.length/2 - 1;
		var is_first = current_path_pt_drag == 0 || (is_closed && current_path_pt_drag == last_index);
		var is_last = !is_closed && current_path_pt_drag == last_index;
		
		// if the image is rotated, then we must modify the x,y mouse coordinates
		// and rotate them into the shape's rotated coordinate system
		// we also re-map mouse_x/y and x/y into the rotated coordinate system
		var angle = canvas.getRotationAngle(current_path) * Math.PI / 180.0;
		if (angle) {
			// calculate the shape's old center that was used for rotation
			var box = selectedBBoxes[0];
			var cx = round(box.x + box.width/2) * current_zoom, 
				cy = round(box.y + box.height/2) * current_zoom;
			var dx = mouse_x - cx, dy = mouse_y - cy;
			var r = Math.sqrt( dx*dx + dy*dy );
			var theta = Math.atan2(dy,dx) - angle;						
			current_path_pts[i] = mouse_x = cx + r * Math.cos(theta);
			current_path_pts[i+1] = mouse_y = cy + r * Math.sin(theta);
			x = mouse_x / current_zoom;
			y = mouse_y / current_zoom;
		}
		else {
			current_path_pts[i] = x * current_zoom;
			current_path_pts[i+1] = y * current_zoom;
		}
		
		if(is_first && is_closed) {
			// Update the first point
			current_path_pts[0] = current_path_pts[i];
			current_path_pts[1] = current_path_pts[i+1];
			current_path_pt_drag = 0;
		}

		var index = current_path_pt_drag;
		var abs_x = getPathPoint(index)[0];
		var abs_y = getPathPoint(index)[1];
		
		var item = current_path.pathSegList.getItem(index);
		var x_diff = x - old_path_pts[index*2];
		var y_diff = y - old_path_pts[index*2 + 1];
		
		var cur_type = item.pathSegType;
		var points = [];
		
		if(cur_type == 6) {
			points = [abs_x,abs_y, item.x1,item.y1, item.x2 + x_diff,item.y2 + y_diff];
		} else {
			if(is_first) {
				// Need absolute position for first point
				points = getPathPoint(0);
			} else {
				points = [abs_x, abs_y];
			}
		}
		replacePathSeg(cur_type, index, points);

		var setSeg = function(index,first) {
			var points, item = current_path.pathSegList.getItem(index);
			var type = item.pathSegType;
			if(first) {
				item.x += x_diff;
				item.y += y_diff;
			}

			switch (type) {
			case 1:
				points = [];
				break;
			case 4:
				points = [item.x, item.y];
				break;
			case 6:
				if(first) {
					item.x1 -= x_diff;
					item.y1 -= y_diff;
					item.x2 += x_diff;
					item.y2 += y_diff;
				}

				points = [item.x, item.y, item.x1 + x_diff,item.y1 + y_diff, item.x2,item.y2];
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
		}
			
		// move the point grip
		var grip = document.getElementById("pathpointgrip_" + current_path_pt_drag);
		if (grip) {
			grip.setAttribute("cx", mouse_x);
			grip.setAttribute("cy", mouse_y);
			if(is_closed && is_first) {
				var grip = document.getElementById("pathpointgrip_" + last_index);
				grip.setAttribute("cx", mouse_x);
				grip.setAttribute("cy", mouse_y);
			}
			call("changed", [grip]);
		}
		
		if(is_first) cur_type = last_type;
		
		if(cur_type != 4) {
			var num = is_first?last_index:index;
			var id2 = (num-1)+'c2';
			var line = document.getElementById("ctrlLine_"+id2);
			if(line) {
				// Don't do if first point on open path
				if(!(!is_closed && current_path_pt_drag == 0)) {
					var x2 = line.getAttribute('x2') - 0 + x_diff*current_zoom;
					var y2 = line.getAttribute('y2') - 0 + y_diff*current_zoom;
					addControlPointGrip(x2,y2, mouse_x,mouse_y, id2, true);
				}
			}
		}
		
		if(next_type != 4) {
			var id1 = (current_path_pt_drag)+'c1';
			var line = document.getElementById("ctrlLine_"+id1);
			if(line) {
				var x2 = line.getAttribute('x2') - 0 + x_diff*current_zoom;
				var y2 = line.getAttribute('y2') - 0 + y_diff*current_zoom;
				addControlPointGrip(x2,y2, mouse_x,mouse_y, id1, true);
			}
		}
		updateSegLine();
		if(next_type != 4) {
			updateSegLine(true);
		}
	}
	
	var getPathPoint = function(index, raw_val) {
		var len = current_path_pts.length;
		var pt_num = len/2;
		if(index < 0) {
			index += pt_num;
		} else if(index >= pt_num) {
			index -= pt_num;
		}
		var z = raw_val?1:current_zoom;
		return [current_path_pts[index*2] / z, current_path_pts[index*2 + 1] / z];
	}
	
	// This replaces the segment at the given index. Type is given as number.
	var replacePathSeg = function(type, index, pts, path) {
		if(!path) path = current_path;
		var func = 'createSVGPathSeg' + pathFuncs[type];
		var seg = path[func].apply(path, pts);
		path.pathSegList.replaceItem(seg, index);
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
				'fill': "#0FF",
				'stroke': "#55F",
				'stroke-width': 1,
				'cursor': 'move',
				'style': 'pointer-events:all',
				'xlink:title': 'Drag control point to adjust curve properties'
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

		var pt = transformPoint( evt.pageX, evt.pageY, root_sctm );
		var mouse_x = pt.x;
		var mouse_y = pt.y;
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
					// always recalculate dimensions to strip off stray identity transforms
					recalculateAllSelectedDimensions();
					// if it was being dragged/resized
					if (x != start_x || y != start_y) {
						var len = selectedElements.length;
						for	(var i = 0; i < len; ++i) {
							if (selectedElements[i] == null) break;
							if(selectedElements[i].tagName != 'g') {
								// Not needed for groups (incorrectly resizes elems), possibly not needed at all?
								selectorManager.requestSelector(selectedElements[i]).resize();//selectedBBoxes[i]); // TODO: remove box arg
							}
						}
					}
					// no change in position/size, so maybe we should move to pathedit
					else {
						var t = evt.target;
						if (selectedElements[0].nodeName == "path" && selectedElements[1] == null) {
							if (current_path == t) {
								current_mode = "pathedit";

								// recalculate current_path_pts
								recalcPathPoints();
								canvas.clearSelection();
								// save the path's bbox
								selectedBBoxes[0] = canvas.getBBox(current_path);
								addAllPointGripsToPath();
								canvas.addNodeToSelection(0);
							} // going into pathedit mode
							else {
								current_path = t;
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
				break;
			case "line":
				keep = (element.x1.baseVal.value != element.x2.baseVal.value ||
				        element.y1.baseVal.value != element.y2.baseVal.value);
				break;
			case "square":
			case "rect":
				keep = (element.width.baseVal.value && element.height.baseVal.value);
				break;
			case "image":
				keep = (element.width.baseVal.value && element.height.baseVal.value);
				break;
			case "circle":
				keep = (element.r.baseVal.value);
				break;
			case "ellipse":
				keep = (element.rx.baseVal.value && element.ry.baseVal.value);
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
							"style": "pointer-events:inherit"
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
							"style": "pointer-events:inherit"
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
				var stretchy = document.getElementById("path_stretch_line");
				if (!stretchy) {
					stretchy = document.createElementNS(svgns, "line");
					assignAttributes(stretchy, {
						'id': "path_stretch_line",
						'stroke': "blue",
						'stroke-width': "0.5"
					});
					stretchy = document.getElementById("selectorParentGroup").appendChild(stretchy);
				}
				stretchy.setAttribute("display", "inline");

				// if pts array is empty, create path element with M at current point
				if (current_path_pts.length == 0) {
					current_path_pts.push(x);
					current_path_pts.push(y);
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
							"style": "pointer-events:inherit"
						}
					});
					// set stretchy line to first point
					assignAttributes(stretchy, {
						'x1': mouse_x,
						'y1': mouse_y,
						'x2': mouse_x,
						'y2': mouse_y
					});
					addPointGripToPath(mouse_x,mouse_y,0);
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
					var path = svgdoc.getElementById(getId());
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
							path.setAttribute("d", d_attr);
						} else if(len < 3) {
							keep = false;
							break;
						}
						removeAllPointGripsFromPath();
						// this will signal to commit the path
						element = path;
						current_path_pts = [];
						started = false;
					}
					// else, create a new point, append to pts array, update path element
					else {
						var lastx = current_path_pts[len-2], lasty = current_path_pts[len-1];
						// we store absolute values in our path points array for easy checking above
						current_path_pts.push(x);
						current_path_pts.push(y);
						d_attr += "L" + round(x) + "," + round(y) + " ";
						path.setAttribute("d", d_attr);

						// set stretchy line to latest point
						assignAttributes(stretchy, {
							'x1': mouse_x,
							'y1': mouse_y,
							'x2': mouse_x,
							'y2': mouse_y
						});
						addPointGripToPath(mouse_x,mouse_y,(current_path_pts.length/2 - 1));
					}
					keep = true;
				}
				break;
			case "pathedit":
				keep = true;
				element = null;
				// if we were dragging a path point, stop it now
				if (current_path_pt_drag != -1) {
					current_path_pt_drag = -1;
					
					var batchCmd = new BatchCommand("Edit Path");
					// the attribute changes we want to undo
					var oldvalues = {};
					oldvalues["d"] = current_path_oldd;
					
					// If the path was rotated, we must now pay the piper:
					// Every path point must be rotated into the rotated coordinate system of 
					// its old center, then determine the new center, then rotate it back
					// This is because we want the path to remember its rotation
					var angle = canvas.getRotationAngle(current_path) * Math.PI / 180.0;
	
					if (angle) {
						var box = canvas.getBBox(current_path);
						var oldbox = selectedBBoxes[0];
						var oldcx = oldbox.x + oldbox.width/2,
							oldcy = oldbox.y + oldbox.height/2,
							newcx = box.x + box.width/2,
							newcy = box.y + box.height/2;
						
						// un-rotate the new center to the proper position
						var dx = newcx - oldcx,
							dy = newcy - oldcy;
						var r = Math.sqrt(dx*dx + dy*dy);
						var theta = Math.atan2(dy,dx) + angle;
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
						
						var list = current_path.pathSegList;
						var i = list.numberOfItems;
						while (i) {
							i -= 1;
							var seg = list.getItem(i);
							var type = seg.pathSegType;
							if(type == 1) continue;
							
							var rvals = getRotVals(seg.x,seg.y);
							var points = [rvals.x, rvals.y];
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
						var rotate = "rotate(" + (angle * 180.0 / Math.PI) + " " + newcx + "," + newcy + ")";
						current_path.setAttribute("transform", rotate);
							
						if(document.getElementById("pathpointgrip_container")) {
							var pcx = newcx * current_zoom,
								pcy = newcy * current_zoom;
							var xform = ["rotate(", (angle*180.0/Math.PI), " ", pcx, ",", pcy, ")"].join("");
							setPointContainerTransform(xform);
						}
						resetPointGrips();
						updateSegLine(true);

					} // if rotated

					batchCmd.addSubCommand(new ChangeElementCommand(current_path, oldvalues, "path points"));
					addCommandToHistory(batchCmd);
					call("changed", [current_path]);
					
					// If connected, last point should equal first
					if(current_path.getAttribute('d').toLowerCase().indexOf('z') != -1) {
						current_path_pts[current_path_pts.length-2] = getPathPoint(0,true)[0];
						current_path_pts[current_path_pts.length-1] = getPathPoint(0,true)[1];
					}
					updateSegLine();
					
					// make these changes undo-able
				} // if (current_path_pt_drag != -1)
				else if(current_ctrl_pt_drag != -1) {
					current_ctrl_pt_drag = -1;
					var batchCmd = new BatchCommand("Edit Path control points");
					batchCmd.addSubCommand(new ChangeElementCommand(current_path, {d:current_path_oldd}));
					addCommandToHistory(batchCmd);
					call("changed", [current_path]);
				} 	// else, move back to select mode
				else {
					current_mode = "select";
					removeAllPointGripsFromPath();
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
				// perform recalculation to weed out any stray identity transforms that might get stuck
				recalculateAllSelectedDimensions();
				break;
			default:
				console.log("Unknown mode in mouseup: " + current_mode);
				break;
		}
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
			element.setAttribute("opacity", cur_shape.opacity);
			cleanupElement(element);
			selectorManager.update();
 			if(current_mode == "path") {
 				current_path = element;
				current_mode = "pathedit";
				recalcPathPoints();
				addAllPointGripsToPath(current_path_pts.length/2 - 1);
 			} else if (current_mode == "text" || current_mode == "image") {
 				// keep us in the tool we were in unless it was a text or image element
				canvas.addToSelection([element], true);
			}
			// we create the insert command that is stored on the stack
			// undo means to call cmd.unapply(), redo means to call cmd.apply()
			addCommandToHistory(new InsertElementCommand(element));
			call("changed",[element]);
		}
		
		start_transform = null;
	};

// public functions

	// Group: Serialization

	// Function: open
	// Calls the 'opened' handler and sends the SVG XML text.  Clients of the SvgCanvas bind
	// their load function (typically calls to setSvgString() to the 'opened' event.
	this.open = function(str) {
		// Nothing by default, handled by optional widget/extension
		call("opened", str);
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
	
	// Function: getSvgString
	// Returns the current drawing as raw SVG XML text.
	//
	// Returns:
	// The current drawing as raw SVG XML text.
	this.getSvgString = function() {
		save_options.apply = false;
		return svgCanvasToString();
	};

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
        	
        	// change image href vals if possible
        	$(svgcontent).find('image').each(function() {
        		var image = this;
        		var val = this.getAttributeNS(xlinkns, "href");
				if(val.indexOf('data:') === 0) {
					// Check if an SVG-edit data URI
					var m = val.match(/svgedit_url=(.*?);/);
					if(m) {
						var url = decodeURIComponent(m[1]);
						$(new Image()).load(function() {
							image.setAttributeNS(xlinkns,'href',url);
						}).attr('src',url);
					}
				}
        		// Add to encodableImages if it loads
        		canvas.embedImage(val);
        	});
        	
        	// Fix XML for Opera/Win/Non-EN
			if(window.opera) {
				canvas.fixOperaXML(svgcontent, newDoc.documentElement);
			}
        	
			svgcontent.setAttribute('id', 'svgcontent');
			// determine proper size
			var w, h;
			if (svgcontent.getAttribute("viewBox")) {
				var vb = svgcontent.getAttribute("viewBox").split(' ');
				w = vb[2];
				h = vb[3];
			}
			// handle old content that doesn't have a viewBox
			else {
				w = svgcontent.getAttribute("width");
				h = svgcontent.getAttribute("height");
				svgcontent.setAttribute("viewBox", ["0", "0", w, h].join(" "));
			}
			// just to be safe, remove any width/height from text so that they are 100%/100%
			svgcontent.removeAttribute('width');
			svgcontent.removeAttribute('height');
			batchCmd.addSubCommand(new InsertElementCommand(svgcontent));

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
			identifyLayers();
			
			selectorManager.update();

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

	// Function: clear
	// Clears the current document.  This is not an undoable action.
	this.clear = function() {
		current_path_pts = [];

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
	
	// TODO: should this be an 'internal' function?
	this.clearPath = function(remove) {
		if(remove && current_mode == "path") {
			var elem = svgdoc.getElementById(getId());
			if(elem) elem.parentNode.removeChild(elem);
		}
		removeAllPointGripsFromPath();
		current_path_pts = [];
		current_path_pt = -1;
	};
	
	// TODO: should this be an 'internal' function?
	this.getNodePoint = function() {	
		if(current_path_pt != -1) {
			var pt = getPathPoint(current_path_pt, true);
			var list = current_path.pathSegList;
			var segtype;
			if(list.numberOfItems > current_path_pt+1) {
				segtype = list.getItem(current_path_pt+1).pathSegType;
			} else {
				segtype = false;
			}
			return {
				x: pt[0],
				y: pt[1],
				type: segtype
			}
		} else {
			return false;
		}
	}

	this.clonePathNode = function() {
	
		var pt = current_path_pt, list = current_path.pathSegList;

		var next_item = list.getItem(pt+1); 
		
		// Get point in between nodes
		if(next_item.pathSegType % 2 == 0) { // even num, so abs
			var cur_item = list.getItem(pt);
			var new_x = (next_item.x + cur_item.x) / 2;
			var new_y = (next_item.y + cur_item.y) / 2;
		} else {
			var new_x = next_item.x/2;
			var new_y = next_item.y/2;
		}
		
		var seg = current_path.createSVGPathSegLinetoAbs(new_x, new_y);
		list.insertItemBefore(seg, pt+1); // Webkit doesn't do this right.
		
		var abs_x = (getPathPoint(pt)[0] + new_x) * current_zoom;
		var abs_y = (getPathPoint(pt)[1] + new_y) * current_zoom;
		
		var last_num = current_path_pts.length/2;
		
		// Add new grip
		addPointGripToPath(abs_x, abs_y, last_num);

		// Update path_pts
		current_path_pts.splice(pt*2 + 2, 0, abs_x, abs_y);
		
		resetPointGrips();
		this.addNodeToSelection(pt+1);
		
	// 	current_path.setAttribute("d", convertToD(current_path.pathSegList));
	}

	this.deletePathNode = function() {
		var last_pt = current_path_pts.length/2 - 1;
		var pt = current_path_pt, list = current_path.pathSegList;
		var cur_item = list.getItem(pt);
		var next_item = list.getItem(pt+1);

		if(pt == 0) {
			var next_x = getPathPoint(1)[0];
			var next_y = getPathPoint(1)[1];
			// Make the next point be the "M" point
			replacePathSeg(2, 1, [next_x, next_y]);
			
			// Reposition last node
			var last_item = list.getItem(last_pt);
			replacePathSeg(4, last_pt, [next_x, next_y]);
			removeControlPointGrips(last_pt - 1);
			current_path_pts.splice(last_pt*2, 2, next_x, next_y);
			current_path_pts.splice(0, 2);
		} else {
			current_path_pts.splice(pt*2, 2);
		}

		list.removeItem(pt);
		
		resetPointGrips();
		
		if(window.opera) { // Opera repaints incorrectly
			var cp = $(current_path); cp.attr('d',cp.attr('d'));
		}
		
		this.addNodeToSelection(pt);
	}

	this.getResolution = function() {
// 		return [svgroot.getAttribute("width"), svgroot.getAttribute("height")];
		var vb = svgcontent.getAttribute("viewBox").split(' ');
		return {'w':vb[2], 'h':vb[3], 'zoom': current_zoom};
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
	
	this.setResolution = function(x, y) {
		var res = canvas.getResolution();
		var w = res.w, h = res.h;
		var batchCmd;

		if(x == 'fit') {
			canvas.clearSelection();

			// Get bounding box
			var bbox = canvas.getStrokedBBox();
			
			if(bbox) {
				batchCmd = new BatchCommand("Fit Canvas to Content");
				var visEls = canvas.getVisibleElements();
				$.each(visEls, function(i, item) {
					var sel_bb = item.getBBox();
					// TODO: we are not using the second argument here anymore, what to do?
					var cmd = recalculateDimensions(item, {
						x: sel_bb.x - bbox.x,
						y: sel_bb.y - bbox.y,
						width: sel_bb.width,
						height: sel_bb.height
					});
					batchCmd.addSubCommand(cmd);
				});
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
			if(!batchCmd) {
				batchCmd = new BatchCommand("Change Image Dimensions");
			}
			svgroot.setAttribute('width', x);
			svgroot.setAttribute('height', y);
			batchCmd.addSubCommand(new ChangeElementCommand(svgroot, {"width":w, "height":h}));

			svgcontent.setAttribute("viewBox", ["0 0", x/current_zoom, y/current_zoom].join(' '));
			batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {"viewBox": ["0 0", w, h].join(' ')}));
		
			addCommandToHistory(batchCmd);
			svgroot.unsuspendRedraw(handle);
			call("changed", [svgcontent]);
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
		svgroot.setAttribute("width", res.w * zoomlevel);
		svgroot.setAttribute("height", res.h * zoomlevel);
		current_zoom = zoomlevel;
		$.each(selectedElements, function(i, elem) {
			if(!elem) return;
			selectorManager.requestSelector(elem).resize();
		});
		if(current_mode == "pathedit") {
			resetPointGrips();
		}
	}

	this.getMode = function() {
		return current_mode;
	};

	this.setMode = function(name) {
		// toss out half-drawn path
		if (current_mode == "path" && current_path_pts.length > 0) {
			var elem = svgdoc.getElementById(getId());
			elem.parentNode.removeChild(elem);
			canvas.clearPath();
			canvas.clearSelection();
			started = false;
		}
		else if (current_mode == "pathedit") {
			canvas.clearPath();
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
	
	// Group: Fill and Stroke

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

	// When attempting to set a line's width to 0, change it to 1 instead
	this.setStrokeWidth = function(val) {
		if(val == 0 && $.inArray(current_mode, ['line', 'path']) != -1) {
			canvas.setStrokeWidth(1);
			return;
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

	// returns an object that behaves like a SVGTransformList
	this.getTransformList = function(elem) {
		if (isWebkit) {
			var t = svgTransformLists[elem.id];
			if (!t) {
				svgTransformLists[elem.id] = new SVGEditTransformList(elem);
				t = svgTransformLists[elem.id];
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
		} else {
			try { ret = selected.getBBox(); } 
			catch(e) { ret = null; }
		}

		// get the bounding box from the DOM (which is in that element's coordinate system)
		return ret;
	};

	// TODO: do we need to sum up all rotation angles?
	this.getRotationAngle = function(elem) {
		var selected = elem || selectedElements[0];
		// find the rotation transform (if any) and set it
		var tlist = canvas.getTransformList(selected);
		var t = tlist.numberOfItems;
		while (t--) {
			var xform = tlist.getItem(t);
			if (xform.type == 4) {
				return xform.angle;
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
		var tlist = canvas.getTransformList(elem);
		var rotIndex = 0;
		// find the index of the rotation transform
		var n = tlist.numberOfItems;
		while (n--) {
			var xform = tlist.getItem(n);
			if (xform.type == 4) {
				rotIndex = n;
				tlist.removeItem(n);
				break;
			}
		}
		// if we are not rotated yet, insert a dummy xform
				
		var m = elem.getCTM();
		var center = transformPoint(cx,cy,m);
		var newrot = svgroot.createSVGTransform();
		newrot.setRotate(val, center.x, center.y);
		tlist.insertItemBefore(newrot, rotIndex);

		// TODO: remove this seperate chunk of code where we replace the rotation transform
		// because calling setRotate() above changes the live transform in the list
		if (preventUndo) {
			// we don't need to undo, just update the transform list
			// Opera Bug: for whatever reason, sometimes Opera doesn't let you 
			// replace the 0th transform (perhaps if it's an identity matrix?)
			try {
				tlist.replaceItem(newrot, rotIndex);
			} catch(e) {
				tlist.insertItemBefore(newrot,rotIndex);
			}
		}
		else {
			// FIXME: we need to do it, then undo it, then redo it so it can be undo-able! :)
			// TODO: figure out how to make changes to transform list undo-able cross-browser
			var oldTransform = elem.getAttribute("transform");
			tlist.replaceItem(newrot, rotIndex);
			var newTransform = elem.getAttribute("transform");
			elem.setAttribute("transform", oldTransform);
			this.changeSelectedAttribute("transform",newTransform,selectedElements);
		}
		var pointGripContainer = document.getElementById("pathpointgrip_container");
		if(elem.nodeName == "path" && pointGripContainer) {
			setPointContainerTransform(elem.getAttribute("transform"));
		}
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
		var grip = $('#pathpointgrip_' + current_path_pt);
		var old_d = current_path.getAttribute('d');
		
		var index = grip[0].id.split('_')[1] - 0;
		
		var last_index = current_path_pts.length/2 - 1;
		var is_closed = current_path.getAttribute('d').toLowerCase().indexOf('z') != -1; 

		if(!is_closed && index == last_index) {
			return; // Last point of unclosed path should do nothing
		} else if(index >= last_index && is_closed) {
			index = 0;
		}

		var next_index = index+1;
		var cur_x = getPathPoint(index)[0];
		var cur_y = getPathPoint(index)[1];
		var next_x = getPathPoint(next_index)[0];
		var next_y = getPathPoint(next_index)[1];
		
		if(!new_type) { // double-click, so just toggle
			var batchCmd = new BatchCommand("Toggle Path Segment Type");

			// Toggle segment to curve/straight line
			var old_type = current_path.pathSegList.getItem(index+1).pathSegType;
			
			new_type = (old_type == 6) ? 4 : 6;

		} else {
			new_type -= 0;
			var batchCmd = new BatchCommand("Change Path Segment Type");
		}
		
		var points;

		var bb = current_path.getBBox();
		
		switch ( new_type ) {
		case 6:
			var diff_x = next_x - cur_x;
			var diff_y = next_y - cur_y;
		
			var ct1_x = cur_x + (diff_y/2);
			var ct1_y = cur_y - (diff_x/2);
			var ct2_x = next_x + (diff_y/2);
			var ct2_y = next_y - (diff_x/2);
			
			points = [next_x,next_y, ct1_x,ct1_y, ct2_x,ct2_y];
			break;
		case 4:
			points = [next_x,next_y];
			removeControlPointGrips(index);
			break;
		}
		
		replacePathSeg(new_type, next_index, points);
		
		addAllPointGripsToPath(); 
		recalculateDimensions(current_path);//, current_path.getBBox());
		updateSegLine(true);
		
		batchCmd.addSubCommand(new ChangeElementCommand(current_path, {d: old_d}));
		addCommandToHistory(batchCmd);
		call("changed", [current_path]);
	}
	
	this.quickClone = function(elem) {
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
			var num = (attr == 'x')?0:1;
			var old_path_pts = $.map(current_path_pts, function(n){return n/current_zoom;});

			current_path_pts[current_path_pt*2 + num] = newValue-0;
			current_path_pt_drag = current_path_pt;
			updatePath(current_path_pts[current_path_pt*2], current_path_pts[current_path_pt*2 + 1], old_path_pts);
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
			if (oldval !== newValue) {
				if (attr == "#text") {
					var old_w = elem.getBBox().width;
					elem.textContent = newValue;
					elem = canvas.quickClone(elem);
					
					// Hoped to solve the issue of moving text with text-anchor="start",
					// but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
					
// 					var box=canvas.getBBox(elem), left=box.x, top=box.y, width=box.width,
// 						height=box.height, dx = width - old_w, dy=0;
// 					var angle = canvas.getRotationAngle(elem);
// 					if (angle) {
// 						var r = Math.sqrt( dx*dx + dy*dy );
// 						var theta = Math.atan2(dy,dx) - angle * Math.PI / 180.0;
// 						dx = r * Math.cos(theta);
// 						dy = r * Math.sin(theta);
// 						
// 						elem.setAttribute('x', elem.getAttribute('x')-dx);
// 						elem.setAttribute('y', elem.getAttribute('y')-dy);
// 					}
					
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
					selectorManager.requestSelector(elem).resize();//elem.getBBox()); // TODO: remove box arg
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
		canvas.addToSelection([g], true);
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
					batchCmd.addSubCommand(recalculateDimensions(elem));//, childBox));
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
			dx /= current_zoom;
			dy /= current_zoom;
		}
		var undoable = undoable || true;
		var batchCmd = new BatchCommand("position");
		var i = selectedElements.length;
		while (i--) {
			var selected = selectedElements[i];
			if (selected != null) {
				selectedBBoxes[i] = this.getBBox(selected);
				
				var xform = svgroot.createSVGTransform();
				var tlist = canvas.getTransformList(selected);
				
				// dx and dy could be arrays
				if (dx.constructor == Array) {
					selectedBBoxes[i].x += dx[i];
					selectedBBoxes[i].y += dy[i];
					xform.setTranslate(dx[i],dy[i]);
				} else {
					selectedBBoxes[i].x += dx;
					selectedBBoxes[i].y += dy;
					xform.setTranslate(dx,dy);
				}
				
				tlist.appendItem(xform);
				
				var cmd = recalculateDimensions(selected);//,selectedBBoxes[i]);
				if (cmd) {
					batchCmd.addSubCommand(cmd);
				}
				selectorManager.requestSelector(selected).resize();//selectedBBoxes[i]);
			}
		}
		if (!batchCmd.isEmpty()) {
			if (undoable)
				addCommandToHistory(batchCmd);
			call("changed", selectedElements);
		}
	};

	this.getStrokedBBox = function(elems) {
		if(!elems) elems = canvas.getVisibleElements();
		if(!elems.length) return false;
		
		// Make sure the expected BBox is returned if the element is a group
		var getCheckedBBox = function(elem) {
			if(elem.tagName == 'g') {
				return canvas.getStrokedBBox(elem.childNodes);
			} else {
				try {
					var bb = elem.getBBox();
					var angle = canvas.getRotationAngle(elem) * Math.PI / 180.0;
					if (angle) {
						var rminx = Number.MAX_VALUE, rminy = Number.MAX_VALUE, 
							rmaxx = Number.MIN_VALUE, rmaxy = Number.MIN_VALUE;
						var cx = round(bb.x + bb.width/2),
							cy = round(bb.y + bb.height/2);
						var pts = [ [bb.x - cx, bb.y - cy], 
									[bb.x + bb.width - cx, bb.y - cy],
									[bb.x + bb.width - cx, bb.y + bb.height - cy],
									[bb.x - cx, bb.y + bb.height - cy] ];
						var j = 4;
						while (j--) {
							var x = pts[j][0],
								y = pts[j][1],
								r = Math.sqrt( x*x + y*y );
							var theta = Math.atan2(y,x) + angle;
							x = round(r * Math.cos(theta) + cx);
							y = round(r * Math.sin(theta) + cy);
		
							// now set the bbox for the shape after it's been rotated
							if (x < rminx) rminx = x;
							if (y < rminy) rminy = y;
							if (x > rmaxx) rmaxx = x;
							if (y > rmaxy) rmaxy = y;
						}
						
						bb.x = rminx;
						bb.y = rminy;
						bb.width = rmaxx - rminx;
						bb.height = rmaxy - rminy;
					}
				
					return bb;
				} catch(e) { return null; }
			}
		}
		var full_bb;
		$.each(elems, function() {
			if(full_bb) return;
			full_bb = getCheckedBBox(this);
		});
		
		if(elems.length == 1) return full_bb;
		
		var max_x = full_bb.x + full_bb.width;
		var max_y = full_bb.y + full_bb.height;
		var min_x = full_bb.x;
		var min_y = full_bb.y;
		
		var getOffset = function(elem) {
			var sw = elem.getAttribute("stroke-width");
			var offset = 0;
			if (elem.getAttribute("stroke") != "none" && !isNaN(sw)) {
				offset += sw/2;
			}
			return offset;
		}
		
		$.each(elems, function(i, elem) {
			var cur_bb = getCheckedBBox(elem);
			if(!cur_bb) return;
			var offset = getOffset(elem);
			min_x = Math.min(min_x, cur_bb.x - offset);
			min_y = Math.min(min_y, cur_bb.y - offset);
		});
		
		full_bb.x = min_x;
		full_bb.y = min_y;
		
		$.each(elems, function(i, elem) {
			var cur_bb = getCheckedBBox(elem);
			if(!cur_bb) return;
			var offset = getOffset(elem);
			max_x = Math.max(max_x, cur_bb.x + cur_bb.width + offset);
			max_y = Math.max(max_y, cur_bb.y + cur_bb.height + offset);
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
			removeAllPointGripsFromPath();
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

	// this function no longer uses cloneNode because we need to update the id
	// of every copied element (even the descendants)
	// we also do it manually because Opera/Win/non-EN puts , instead of .
	var copyElem = function(el) {
		// manually create a copy of the element
		var new_el = document.createElementNS(svgns, el.nodeName);
		$.each(el.attributes, function(i, attr) {
			var ns = attr.nodeName == 'href' ? xlinkns : 
				attr.prefix == "xml" ? xmlns : null;
			new_el.setAttributeNS(ns, attr.nodeName, attr.nodeValue);
		});
		// set the copied element's new id
		new_el.removeAttribute("id");
		new_el.id = getNextId();
		// manually increment obj_num because our cloned elements are not in the DOM yet
		obj_num++; 
		
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
		return new_el;
	};
	
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
	
	// Function: getVersion
	// Returns a string which describes the revision number of SvgCanvas.
	this.getVersion = function() {
		return "svgcanvas.js ($Rev$)";
	};
	
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
