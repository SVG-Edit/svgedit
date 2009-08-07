if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}

// this defines which elements and attributes that we support
var svgWhiteList = {
	"circle": ["cx", "cy", "fill", "fill-opacity", "id", "stroke", "r", "stroke-opacity", "stroke-width", "stroke-dasharray"],
	"defs": [],
	"ellipse": ["cx", "cy", "fill", "fill-opacity", "id", "stroke", "rx", "ry", "stroke-opacity", "stroke-width", "stroke-dasharray"],
	"line": ["fill", "fill-opacity", "id", "stroke", "stroke-opacity", "stroke-width", "stroke-dasharray", "x1", "x2", "y1", "y2"],
	"linearGradient": ["id", "x1", "x2", "y1", "y2"],
	"path": ["d", "fill", "fill-opacity", "id", "stroke", "stroke-opacity", "stroke-width", "stroke-dasharray"],
	"polyline": ["id", "points", "stroke", "stroke-opacity", "stroke-width", "stroke-dasharray"],
	"rect": ["fill", "fill-opacity", "height", "id", "stroke", "stroke-opacity", "stroke-width", "stroke-dasharray", "width", "x", "y"],
	"stop": ["id", "offset", "stop-color", "stop-opacity"],
	"svg": ["id", "height", "width", "xmlns"],
	"text": ["font-family", "font-size", "font-style", "font-weight", "id", "x", "y"],
	};


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
		for( attr in this.newValues ) {
			if (this.newValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.newValues[attr];
				else this.elem.setAttribute(attr, this.newValues[attr]);
			}
			else {
				if (attr != "#text") this.elem.textContent = "";
				else this.elem.removeAttribute(attr);
			}
		}
		return true;
	};

	this.unapply = function() {
		for( attr in this.oldValues ) {
			if (this.oldValues[attr]) {
				if (attr == "#text") this.elem.textContent = this.oldValues[attr];
				else this.elem.setAttribute(attr, this.oldValues[attr]);
			}
			else {
				if (attr == "#text") this.elem.textContent = "";
				else this.elem.removeAttribute(attr);
			}
		}
		return true;
	};
	
	this.elements = function() { return [this.elem]; }
}

function InsertElementCommand(elem, text) {
	this.elem = elem;
	this.text = text || ("Create " + elem.tagName);
	this.parent = elem.parentNode;

	this.apply = function() { this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); };

	this.unapply = function() {
		this.parent = this.elem.parentNode;
		this.elem = this.elem.parentNode.removeChild(this.elem);
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
	};

	this.unapply = function() { this.elem = this.parent.insertBefore(this.elem, this.elem.nextSibling); };

	this.elements = function() { return [this.elem]; };
}

function MoveElementCommand(elem, oldNextSibling, oldParent, text) {
	this.elem = elem;
	this.text = text ? ("Move " + elem.tagName + " to " + text) : ("Move " + elem.tagName + "top/bottom");
	this.oldNextSibling = oldNextSibling;
	this.oldParent = oldParent;
	this.newNextSibling = elem.nextSibling;
	this.newParent = elem.parentNode;

	this.apply = function() {
		this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);
	};

	this.unapply = function() {
		this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);
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

function SvgCanvas(c)
{
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
								"w":null,
								"e":null,
								"sw":null,
								"s":null,
								"se":null
								};
				
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
						// when we are in rotate mode, we will set rx/ry to 3
//						"rx": 3,
//						"ry": 3,
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
		}
	
		this.showGrips = function(show) {
			// TODO: use suspendRedraw() here
			for (dir in this.selectorGrips) {
				this.selectorGrips[dir].setAttribute("display", show ? "inline" : "none");
			}
		};
		
		this.resize = function(bbox) {
			var selectedBox = this.selectorRect;
			var selectedGrips = this.selectorGrips;
			var selected = this.selectedElement;
			var sw = parseInt(selected.getAttribute("stroke-width"));
			var offset = 1;
			if (!isNaN(sw)) {
				offset += sw/2;
			}
			if (selected.tagName == "text") {
				offset += 2;
			}
			var bbox = bbox || this.selectedElement.getBBox();
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset<<1), h=bbox.height+(offset<<1);
			// TODO: use suspendRedraw() here
			selectedBox.x.baseVal.value = l;
			selectedBox.y.baseVal.value = t;
			selectedBox.width.baseVal.value = w;
			selectedBox.height.baseVal.value = h;
			selectedGrips.nw.x.baseVal.value = l-3;
			selectedGrips.nw.y.baseVal.value = t-3;
			selectedGrips.ne.x.baseVal.value = l+w-3;
			selectedGrips.ne.y.baseVal.value = t-3;
			selectedGrips.sw.x.baseVal.value = l-3;
			selectedGrips.sw.y.baseVal.value = t+h-3;
			selectedGrips.se.x.baseVal.value = l+w-3;
			selectedGrips.se.y.baseVal.value = t+h-3;
			selectedGrips.n.x.baseVal.value = l+w/2-3;
			selectedGrips.n.y.baseVal.value = t-3;
			selectedGrips.w.x.baseVal.value = l-3;
			selectedGrips.w.y.baseVal.value = t+h/2-3;
			selectedGrips.e.x.baseVal.value = l+w-3;
			selectedGrips.e.y.baseVal.value = t+h/2-3;
			selectedGrips.s.x.baseVal.value = l+w/2-3;
			selectedGrips.s.y.baseVal.value = t+h-3;
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
		// private function
		var initGroup = function() {
			mgr.selectorParentGroup = addSvgElementFromJson({
											"element": "g",
											"attr": {"id": "selectorParentGroup"}
										});			
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
		
		initGroup();
	}
	// **************************************************************************************

	var addSvgElementFromJson = function(data) {
		return canvas.updateElementFromJson(data)
	};

	var assignAttributes = function(node, attrs) {
		var handle = svgroot.suspendRedraw(60);
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
			svgroot.removeChild(shape);
			shape = null;
		}
		if (!shape) {
			shape = svgdoc.createElementNS(svgns, data.element);
			svgroot.appendChild(shape);
		}
		assignAttributes(shape, data.attr);
		cleanupElement(shape);
		return shape;
	};
	
	var canvas = this;
	var container = c;
	var svgns = "http://www.w3.org/2000/svg";

	var idprefix = "svg_";
	var svgdoc  = c.ownerDocument;
	var svgroot = svgdoc.createElementNS(svgns, "svg");
	svgroot.setAttribute("width", 640);
	svgroot.setAttribute("height", 480);
	svgroot.setAttribute("id", "svgroot");
	svgroot.setAttribute("xmlns", svgns);
	container.appendChild(svgroot);

	var d_attr = null;
	var started = false;
	var obj_num = 1;
	var start_x = null;
	var start_y = null;
	var current_mode = "select";
	var current_resize_mode = "none";
	var current_fill = "#FF0000";
	var current_stroke = "#000000";
	var current_stroke_paint = null;
	var current_fill_paint = null;
	var current_stroke_width = 5;
	var current_stroke_style = "none";
	var current_opacity = 1;
	var current_stroke_opacity = 1;
	var current_fill_opacity = 1;
	var current_font_size = "12pt";
	var current_font_family = "serif";
	var freehand_min_x = null;
	var freehand_max_x = null;
	var freehand_min_y = null;
	var freehand_max_y = null;
	var current_poly_pts = [];
	// this will hold all the currently selected elements
	// default size of 1 until it needs to grow bigger
	var selectedElements = new Array(1); 
	// this holds the selected's bbox
	var selectedBBoxes = new Array(1);
	// this object manages selectors for us
	var selectorManager = new SelectorManager();
	var rubberBox = null;
	var events = {};
	var undoStackPointer = 0;
	var undoStack = [];

	// This method sends back an array or a NodeList full of elements that
	// intersect the multi-select rubber-band-box.
	// 
	// Since the only browser that supports the SVG DOM getIntersectionList is Opera, 
	// we need to provide an implementation here.  We brute-force it for now.
	// 
	// Reference:
	// Firefox does not implement getIntersectionList(), see https://bugzilla.mozilla.org/show_bug.cgi?id=501421
	// Webkit does not implement getIntersectionList(), see https://bugs.webkit.org/show_bug.cgi?id=11274
	var getIntersectionList = function(rect) {
		if (rubberBox == null) { return null; }
		
		var resultList = null;
		try {
			resultList = svgroot.getIntersectionList(rect, null);
		} catch(e) { }
		
		if (resultList == null || typeof(resultList.item) != "function") 
		{
			resultList = [];
			
			var rubberBBox = rubberBox.getBBox();
			var nodes = svgroot.childNodes;
			var i = svgroot.childNodes.length;
			while (i--) {
				// need to do this since the defs has no bbox and causes an exception
				// to be thrown in Mozilla
				try {
//					if (nodes[i].tagName == "defs") continue;				
					if (nodes[i].id != "selectorParentGroup" &&
						Utils.rectsIntersect(rubberBBox, nodes[i].getBBox())) 
					{
						resultList.push(nodes[i]);
					}
				} catch(e) {
					// do nothing, this element did not have a bbox
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
					out.push(" "); out.push(attr.nodeName); out.push("=\""); 
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
							out.push(str + "");
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
			var cmd = recalculateSelectedDimensions(i);
			if (cmd) {
				batchCmd.addSubCommand(cmd);
			}
		}

		if (!batchCmd.isEmpty()) {
			addCommandToHistory(batchCmd);
			call("changed", selectedElements);
		}
	};
	
	// this function returns the command which resulted from th selected change
	var recalculateSelectedDimensions = function(i) {
		var selected = selectedElements[i];
		if (selected == null) return null;
		var selectedBBox = selectedBBoxes[i];
		var box = selected.getBBox();

		// if we have not moved/resized, then immediately leave
		if (box.x == selectedBBox.x && box.y == selectedBBox.y &&
			box.width == selectedBBox.width && box.height == selectedBBox.height) {
			return null;
		}

		// after this point, we have some change to this element
		
		var remapx = function(x) {return ((x-box.x)/box.width)*selectedBBox.width + selectedBBox.x;}
		var remapy = function(y) {return ((y-box.y)/box.height)*selectedBBox.height + selectedBBox.y;}
		var scalew = function(w) {return w*selectedBBox.width/box.width;}
		var scaleh = function(h) {return h*selectedBBox.height/box.height;}

		var changes = {};

		// This fixes Firefox 2- behavior - which does not reset values when
		// the attribute has been removed
		// see https://bugzilla.mozilla.org/show_bug.cgi?id=320622
		selected.setAttribute("transform", "");
		selected.removeAttribute("transform");
		switch (selected.tagName)
		{
		case "polyline":
			// extract the x,y from the path, adjust it and write back the new path
			// but first, save the old path
			changes["points"] = selected.getAttribute("points");
			var list = selected.points;
			var len = list.numberOfItems;
			var newpoints = "";
			for (var i = 0; i < len; ++i) {
				var pt = list.getItem(i);
				var x = remapx(pt.x), y = remapy(pt.y);
				// we only need to scale the relative coordinates (no need to translate)
				newpoints += x + "," + y + " ";
			}
			selected.setAttributeNS(null, "points", newpoints);
			break;
		case "path":
			// extract the x,y from the path, adjust it and write back the new path
			// but first, save the old path
			changes["d"] = selected.getAttribute("d");
			var M = selected.pathSegList.getItem(0);
			var curx = M.x, cury = M.y;
			var newd = "M" + remapx(curx) + "," + remapy(cury);
			var segList = selected.pathSegList;
			var len = segList.numberOfItems;
			for (var i = 1; i < len; ++i) {
				var l = segList.getItem(i);
				var x = l.x, y = l.y;
				// polys can now be closed, skip Z segments
				if (l.pathSegType == 1) {
					newd += "z";
					continue;
				}
				// webkit browsers normalize things and this becomes an absolute
				// line segment!  we need to turn this back into a rel line segment
				// see https://bugs.webkit.org/show_bug.cgi?id=26487
				if (l.pathSegType == 4) {
					x -= curx;
					y -= cury;
					curx += x;
					cury += y;
				}
				// we only need to scale the relative coordinates (no need to translate)
				newd += " l" + scalew(x) + "," + scaleh(y);
			}
			selected.setAttributeNS(null, "d", newd);
			break;
		case "line":
			changes["x1"] = selected.x1.baseVal.value;
			changes["y1"] = selected.y1.baseVal.value;
			changes["x2"] = selected.x2.baseVal.value;
			changes["y2"] = selected.y2.baseVal.value;
			var handle = svgroot.suspendRedraw(1000);			
			selected.x1.baseVal.value = remapx(selected.x1.baseVal.value);
			selected.y1.baseVal.value = remapy(selected.y1.baseVal.value);
			selected.x2.baseVal.value = remapx(selected.x2.baseVal.value);
			selected.y2.baseVal.value = remapy(selected.y2.baseVal.value);
			svgroot.unsuspendRedraw(handle);			
			break;
		case "circle":
			changes["cx"] = selected.cx.baseVal.value;
			changes["cy"] = selected.cy.baseVal.value;
			changes["r"] = selected.r.baseVal.value;
			var handle = svgroot.suspendRedraw(1000);
			selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
			selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
			// take the minimum of the new selected box's dimensions for the new circle radius
			selected.r.baseVal.value = Math.min(selectedBBox.width/2,selectedBBox.height/2);
			svgroot.unsuspendRedraw(handle);			
			break;
		case "ellipse":
			changes["cx"] = selected.cx.baseVal.value;
			changes["cy"] = selected.cy.baseVal.value;
			changes["rx"] = selected.rx.baseVal.value;
			changes["ry"] = selected.ry.baseVal.value;
			var handle = svgroot.suspendRedraw(1000);
			selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
			selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
			selected.rx.baseVal.value = scalew(selected.rx.baseVal.value);
			selected.ry.baseVal.value = scaleh(selected.ry.baseVal.value);
			svgroot.unsuspendRedraw(handle);			
			break;
		case "text":
			// cannot use x.baseVal.value here because x is a SVGLengthList
			changes["x"] = selected.getAttribute("x");
			changes["y"] = selected.getAttribute("y");
			var handle = svgroot.suspendRedraw(1000);
			selected.setAttribute("x", remapx(selected.getAttribute("x")));
			selected.setAttribute("y", remapy(selected.getAttribute("y")));
			svgroot.unsuspendRedraw(handle);			
			break;
		case "rect":
			changes["x"] = selected.x.baseVal.value;
			changes["y"] = selected.y.baseVal.value;
			changes["width"] = selected.width.baseVal.value;
			changes["height"] = selected.height.baseVal.value;
			var handle = svgroot.suspendRedraw(1000);
			selected.x.baseVal.value = remapx(selected.x.baseVal.value);
			selected.y.baseVal.value = remapy(selected.y.baseVal.value);
			selected.width.baseVal.value = scalew(selected.width.baseVal.value);
			selected.height.baseVal.value = scaleh(selected.height.baseVal.value);
			svgroot.unsuspendRedraw(handle);			
			break;
		default: // rect
			console.log("Unknown shape type: " + selected.tagName);
			break;
		}
		if (changes) {
			return new ChangeElementCommand(selected, changes);
		}
	};

// public events

	this.clearSelection = function() {
		if (selectedElements[0] == null) { return; }
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			var elem = selectedElements[i];
			if (elem == null) break;
			selectorManager.releaseSelector(elem);
			selectedElements[i] = null;
			selectedBBoxes[i] = null;
		}
		call("selected", selectedElements);
	};
	
	this.addToSelection = function(elemsToAdd) {
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
				selectedBBoxes[j++] = elem.getBBox();
				selectorManager.requestSelector(elem);
				call("selected", selectedElements);
			}
		}
	};
	
	// 
	this.removeFromSelection = function(elemsToRemove) {
		if (selectedElements[0] == null) { return; }
		if (elemsToRemove.length == 0) { return; }

		// find every element and remove it from our array copy		
		var newSelectedItems = new Array(selectedElements.length);
		var j = 0;
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			var elem = selectedElements[i];
			if (elem) {
				// keep the item
				if (elemsToRemove.indexOf(elem) == -1) {
					newSelectedItems[j++] = elem;
				}
				else { // remove the item and its selector
					selectorManager.releaseSelector(elem);
				}
			}
		}
		// the copy becomes the master now
		selectedElements = newSelectedItems;
	};

	// in mouseDown :
	// - when we are in a create mode, the element is added to the canvas
	//   but the action is not recorded until mousing up
	// - when we are in select mode, select the element, remember the position
	//   and do nothing else
	var mouseDown = function(evt)
	{
		var x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft;
		var y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop;
		switch (current_mode) {
			case "select":
				started = true;
				start_x = x;
				start_y = y;
				current_resize_mode = "none";
				var t = evt.target;
				// WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
				var nodeName = t.nodeName.toLowerCase();
				if (nodeName != "div" && nodeName != "svg") {
					// if this element is not yet selected, clear selection and select it
					if (selectedElements.indexOf(t) == -1) {
						canvas.clearSelection();
						canvas.addToSelection([t]);
					}
					// else the user is going to manipulate the selected elements
				}
				else {
					canvas.clearSelection();
					current_mode = "multiselect";
					if (rubberBox == null) {
						rubberBox = selectorManager.getRubberBandBox();
					}
					rubberBox.x.baseVal.value = start_x;
					rubberBox.y.baseVal.value = start_y;
					rubberBox.width.baseVal.value = 0;
					rubberBox.height.baseVal.value = 0;
					rubberBox.setAttribute("display", "inline");
				}
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
				addSvgElementFromJson({
					"element": "polyline",
					"attr": {
						"points": d_attr,
						"id": getNextId(),
						"fill": "none",
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"opacity": current_opacity / 2
					}
				});
				freehand_min_x = x;
				freehand_max_x = x;
				freehand_min_y = y;
				freehand_max_y = y;
				break;
			case "square":
				// FIXME: once we create the rect, we lose information that this was a square
				// (for resizing purposes this is important)
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
						"fill": current_fill,
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill-opacity": current_fill_opacity,
						"opacity": current_opacity / 2
					}
				});
				break;
			case "line":
				started = true;
				addSvgElementFromJson({
					"element": "line",
					"attr": {
						"x1": x,
						"y1": y,
						"x2": x,
						"y2": y,
						"id": getNextId(),
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill": "none",
						"opacity": current_opacity / 2
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
						"fill": current_fill,
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill-opacity": current_fill_opacity,
						"opacity": current_opacity / 2
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
						"fill": current_fill,
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill-opacity": current_fill_opacity,
						"opacity": current_opacity / 2
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
						"fill": current_fill,
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill-opacity": current_fill_opacity,
						// fix for bug where text elements were always 50% opacity
						"opacity": current_opacity,
						"font-size": current_font_size,
						"font-family": current_font_family
					}
				});
				newText.textContent = "text";
				break;
			case "poly":
				started = true;
				break;
			default:
				console.log("Unknown mode in mousedown: " + current_mode);
				break;
		}
	};

	// in mouseMove we do not record any state changes yet (but we do update
	// any elements that are still being created, moved or resized on the canvas)
	// TODO: svgcanvas should just retain a reference to the image being dragged instead
	// of the getId() and getElementById() funkiness - this will help us customize the ids 
	// a little bit for squares and polys
	var mouseMove = function(evt)
	{
		if (!started) return;
		var selected = selectedElements[0];
		var x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft;
		var y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop;
		var shape = svgdoc.getElementById(getId());
		switch (current_mode)
		{
			case "select":
				// we temporarily use a translate on the element being dragged
				// this transform is removed upon mousing up and the element is 
				// relocated to the new location
				if (selectedElements[0] != null) {
					var dx = x - start_x;
					var dy = y - start_y;
					var ts = ["translate(",dx,",",dy,")"].join('');
					var len = selectedElements.length;
					for (var i = 0; i < len; ++i) {
						var selected = selectedElements[i];
						if (selected == null) break;
						selected.setAttribute("transform", ts);
						var box = selected.getBBox();
						box.x += dx; box.y += dy;
						selectorManager.requestSelector(selected).resize(box);
						selectedBBoxes[i] = box;
					}
				}
				break;
			case "multiselect":
				rubberBox.x.baseVal.value = Math.min(start_x,x);
				rubberBox.y.baseVal.value = Math.min(start_y,y);
				rubberBox.width.baseVal.value = Math.abs(x-start_x);
				rubberBox.height.baseVal.value = Math.abs(y-start_y);

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
				var box=selected.getBBox(), left=box.x, top=box.y, width=box.width,
					height=box.height, dx=(x-start_x), dy=(y-start_y);
				var tx=0, ty=0, sx=1, sy=1;
				var ts = null;
				if(current_resize_mode.indexOf("n") != -1) {
					ty = dy;
					sy = (height-dy)/height;
				}
				else if(current_resize_mode.indexOf("s") != -1) {
					sy = (height+dy)/height;
				}
				if(current_resize_mode.indexOf("e") != -1) {
					sx = (width+dx)/width;
				}
				else if(current_resize_mode.indexOf("w") != -1) {
					tx = dx;
					sx = (width-dx)/width;
				}

				var selectedBBox = selectedBBoxes[0];
				selectedBBox.x = left+tx;
				selectedBBox.y = top+ty;
				selectedBBox.width = width*sx;
				selectedBBox.height = height*sy;
				// normalize selectedBBox
				if (selectedBBox.width < 0) {
					selectedBBox.x += selectedBBox.width;
					selectedBBox.width = -selectedBBox.width;
				}
				if (selectedBBox.height < 0) {
					selectedBBox.y += selectedBBox.height;
					selectedBBox.height = -selectedBBox.height;
				}

				selected.setAttribute("transform", ("translate(" + (left+tx) + "," + (top+ty) + 
					") scale(" + (sx) + "," + (sy) + ") translate(" + (-left) + "," + (-top) + ")"));
				selectorManager.requestSelector(selected).resize(selectedBBox);
				break;
			case "text":
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttribute("x", x);
				shape.setAttribute("y", y);
				svgroot.unsuspendRedraw(handle);			
				break;
			case "line":
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "x2", x);
				shape.setAttributeNS(null, "y2", y);
				svgroot.unsuspendRedraw(handle);			
				break;
			case "square":
				var size = Math.max( Math.abs(x - start_x), Math.abs(y - start_y) );
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "width", size);
				shape.setAttributeNS(null, "height", size);
				shape.setAttributeNS(null, "x", start_x < x ? start_x : start_x - size);
				shape.setAttributeNS(null, "y", start_y < y ? start_y : start_y - size);
				svgroot.unsuspendRedraw(handle);			
				break;
			case "rect":
				var handle = svgroot.suspendRedraw(1000);
				shape.setAttributeNS(null, "x", Math.min(start_x,x));
				shape.setAttributeNS(null, "y", Math.min(start_y,y));
				shape.setAttributeNS(null, "width", Math.abs(x-start_x));
				shape.setAttributeNS(null, "height", Math.abs(y-start_y));
				svgroot.unsuspendRedraw(handle);			
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
//				var dx = x - start_x;
//				var dy = y - start_y;
				start_x = x;
				start_y = y;
				d_attr += + x + "," + y + " ";
				shape.setAttributeNS(null, "points", d_attr);
				break;
			// update poly stretch line coordinates
			case "poly":
				var line = document.getElementById("poly_stretch_line");
				if (line) {
					line.setAttribute("x2", x);
					line.setAttribute("y2", y);
				}
				break;
			default:
				break;
		}
		// TODO: should we fire the change event here?  I'm thinking only fire
		// this event when the user mouses up.  That's when the action (create,
		// move, resize, draw) has finished
		// Only question is whether in Wave Gadget mode whether we want to see the 
		// person live-dragging the element around (for instance)
//		call("changed", selected);
	};

	// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
	//   and store it on the Undo stack
	// - in move/resize mode, the element's attributes which were affected by the move/resize are
	//   identified, a ChangeElementCommand is created and stored on the stack for those attrs
	//   this is done in when we recalculate the selected dimensions()
	var mouseUp = function(evt)
	{
		if (!started) return;

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
				}
				current_mode = "select";
			case "select":
				if (selectedElements[0] != null) {
					// if we only have one selected element
					if (selectedElements[1] == null) {
						// set our current stroke/fill properties to the element's
						var selected = selectedElements[0];
						current_fill = selected.getAttribute("fill");
						current_fill_opacity = selected.getAttribute("fill-opacity");
						current_stroke = selected.getAttribute("stroke");
						current_stroke_opacity = selected.getAttribute("stroke-opacity");
						current_stroke_width = selected.getAttribute("stroke-width");
						current_stroke_style = selected.getAttribute("stroke-dasharray");
						if (selected.tagName == "text") {
							current_font_size = selected.getAttribute("font-size");
							current_font_family = selected.getAttribute("font-family");
						}
						
						selectorManager.requestSelector(selected).showGrips(selected.tagName != "text");
					}
					recalculateAllSelectedDimensions();
					var len = selectedElements.length;
					for(var i = 0; i < len; ++i) {
						if (selectedElements[i] == null) break;
						selectorManager.requestSelector(selectedElements[i]).resize(selectedBBoxes[i]);
					}
				}				
				// we return immediately from select so that the obj_num is not incremented
				return;
				break;
			case "path":
				keep = true;
				break;
			case "line":
				keep = (element.getAttribute('x1') != element.getAttribute('x2') ||
				        element.getAttribute('y1') == element.getAttribute('y2'));
				break;
			case "square":
			case "rect":
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
							"fill": current_fill,
							"stroke": current_stroke,
							"stroke-width": current_stroke_width,
							"stroke-dasharray": current_stroke_style,
							"opacity": current_opacity,
							"stroke-opacity": current_stroke_opacity,
							"fill-opacity": current_fill_opacity
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
							"fill": current_fill,
							"stroke": current_stroke,
							"stroke-width": current_stroke_width,
							"stroke-dasharray": current_stroke_style,
							"opacity": current_opacity,
							"stroke-opacity": current_stroke_opacity,
							"fill-opacity": current_fill_opacity
						}
					});
					call("changed",[element]);
					keep = true;
				}
				break;
			case "text":
				keep = true;
				canvas.clearSelection();
				canvas.addToSelection([element]);
				break;
			case "poly":
				var x = evt.pageX - container.parentNode.offsetLeft + container.parentNode.scrollLeft;
				var y = evt.pageY - container.parentNode.offsetTop + container.parentNode.scrollTop;
				
				// set element to null here so that it is not removed nor finalized
				element = null;
				// continue to be set to true so that mouseMove happens
				started = true;
				
				var stretchy = document.getElementById("poly_stretch_line");
				if (!stretchy) {
					stretchy = document.createElementNS(svgns, "line");
					stretchy.id = "poly_stretch_line";
					stretchy.setAttribute("stroke-width", "0.5");
					stretchy.setAttribute("stroke", "blue");
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
							"fill": current_fill,
							"fill-opacity": current_fill_opacity,
							"stroke": current_stroke,
							"stroke-width": current_stroke_width,
							"stroke-dasharray": current_stroke_style,
							"stroke-opacity": current_stroke_opacity,
							"opacity": current_opacity / 2
						}
					});
					// set stretchy line to first point
					stretchy.setAttribute("x1", x);
					stretchy.setAttribute("y1", y);
					stretchy.setAttribute("x2", x);
					stretchy.setAttribute("y2", y);
				}
				else {
					// determine if we clicked on an existing point
					var i = current_poly_pts.length;
					var FUZZ = 6;
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
					
					// if we clicked on an existing point, then we are done this poly, commit it
					// (i,i+1) are the x,y that were clicked on
					if (clickOnPoint) {
						// if clicked on any other point but the first OR
						// the first point was clicked on and there are less than 3 points
						// then leave the poly open
						// otherwise, close the poly
						if (i == 0 && current_poly_pts.length >= 6) {
							poly.setAttribute("d", d_attr + "z");
						}

						// this will signal to commit the poly
						element = poly;
						current_poly_pts = [];
						started = false;
						document.getElementById("poly_stretch_line").setAttribute("display", "none");
					}
					// else, create a new point, append to pts array, update path element
					else {
						var len = current_poly_pts.length;
						var lastx = current_poly_pts[len-2], lasty = current_poly_pts[len-1];
						// we store absolute values in our poly points array for easy checking above
						current_poly_pts.push(x);
						current_poly_pts.push(y);
						// but we store relative coordinates in the d string of the poly for easy
						// translation around the canvas in move mode
						d_attr += "l" + parseInt(x-lastx) + "," + parseInt(y-lasty) + " ";
						poly.setAttribute("d", d_attr);
						
						// set stretchy line to latest point
						stretchy.setAttribute("x1", x);
						stretchy.setAttribute("y1", y);
						stretchy.setAttribute("x2", x);
						stretchy.setAttribute("y2", y);
					}
					keep = true;
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
			element.setAttribute("opacity", current_opacity);
			cleanupElement(element);
			selectorManager.update();
			// we create the insert command that is stored on the stack
			// undo means to call cmd.unapply(), redo means to call cmd.apply()
			addCommandToHistory(new InsertElementCommand(element));
			call("changed",[element]);
		}
	};

// public functions

	this.save = function() {
		// remove the selected outline before serializing
		this.clearSelection();
		var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n";
		// no need for doctype, see http://jwatt.org/svg/authoring/#doctype-declaration
		str += svgToString(svgroot, 0);
		this.saveHandler(str);
	};
	
	this.getSvgString = function() {
		return svgToString(svgroot, 0);
	};

	// this function returns false if the set was unsuccessful, true otherwise
	// TODO: should this function keep throwing the exception?
	// FIXME: after parsing in the new file, how do we synchronize getId()?
	this.setSvgString = function(xmlString) {
		try {
			// convert string into XML document
			var newDoc = Utils.text2xml(xmlString);

			// run it through our sanitizer to remove anything we do not support
	        sanitizeSvg(newDoc.documentElement);

			var batchCmd = new BatchCommand("Change Source");

        	// remove old root
    	    var oldroot = container.removeChild(svgroot);
			batchCmd.addSubCommand(new RemoveElementCommand(oldroot, container));
        
    	    // set new root
        	svgroot = container.appendChild(svgdoc.importNode(newDoc.documentElement, true));
			batchCmd.addSubCommand(new InsertElementCommand(svgroot));
			
			addCommandToHistory(batchCmd);
			call("changed", [svgroot]);
		} catch(e) {
			console.log(e);
			return false;
		}
		
		return true;
	};

	this.clear = function() {
		var nodes = svgroot.childNodes;
		var len = svgroot.childNodes.length;
		var i = 0;
		this.clearSelection();
		for(var rep = 0; rep < len; rep++){
			if (nodes[i].nodeType == 1) { // element node
				nodes[i].parentNode.removeChild(nodes[i]);
			} else {
				i++;
			}
		}
		// clear the undo stack
		resetUndoStack();
		call("cleared");
	};

	this.getResolution = function() {
		return [svgroot.getAttribute("width"), svgroot.getAttribute("height")];
	};
	this.setResolution = function(x, y) {
		var w = svgroot.getAttribute("width"),
			h = svgroot.getAttribute("height");

		var handle = svgroot.suspendRedraw(1000);			
		svgroot.setAttribute("width", x);
		svgroot.setAttribute("height", y);
		svgroot.unsuspendRedraw(handle);			
		addCommandToHistory(new ChangeElementCommand(svgroot, {"width":w,"height":h}, "resolution"));
		call("changed", [svgroot]);
	};

	this.getMode = function() {
		return current_mode;
	};

	this.setMode = function(name) {
		// toss out half-drawn poly
		if (current_mode == "poly" && current_poly_pts.length > 0) {
			element.parentNode.removeChild(svgdoc.getElementById(getId()));
			current_poly_pts = [];
		}
		current_mode = name;		
	};

	this.getStrokeColor = function() {
		return current_stroke;
	};

	this.setStrokeColor = function(val) {
		current_stroke = val;
		this.changeSelectedAttribute("stroke", val);
	};

	this.getFillColor = function() {
		return current_fill;
	};

	this.setFillColor = function(val) {
		current_fill = val;
		// take out any path/line elements when setting fill
		var elems = [];
		var i = selectedElements.length;
		while(i--) {
			var elem = selectedElements[i];
			if (elem && elem.tagName != "polyline" && elem.tagName != "line") {
				elems.push(elem);
			}
		}
		if (elems.length > 0) 
			this.changeSelectedAttribute("fill", val, elems);
	};

	var findDefs = function() {
		var defs = svgroot.getElementsByTagNameNS(svgns, "defs");
		if (defs.length > 0) {
			defs = defs[0];
		}
		else {
			defs = svgroot.insertBefore( svgdoc.createElementNS(svgns, "defs" ), svgroot.firstChild);
		}
		return defs;
	};
	
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
	
	this.setStrokePaint = function(p) {
		current_stroke_paint = new $.jGraduate.Paint(p);
		if (current_stroke_paint.type == "solidColor") {
			this.setStrokeColor("#"+current_stroke_paint.solidColor);
		}
		else if(current_stroke_paint.type == "linearGradient") {
			// find out if there is a duplicate gradient already in the defs
			var grad = current_stroke_paint.linearGradient;
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
			
			this.setStrokeColor("url(#" + grad.id + ")");
		}
		else {
//			console.log("none!");
		}
		this.setStrokeOpacity(current_stroke_paint.alpha/100);		
	};

	// TODO: rework this so that we are not append elements into the SVG at this stage
	// This should only be done at the actual creation stage or when we change a selected 
	// element's fill paint - at that point, batch up the creation of the gradient element
	// with the creation/change
	this.setFillPaint = function(p) {
		// copy the incoming paint object
		current_fill_paint = new $.jGraduate.Paint(p);
		if (current_fill_paint.type == "solidColor") {
			this.setFillColor("#"+current_fill_paint.solidColor);
		}
		else if(current_fill_paint.type == "linearGradient") {
			// find out if there is a duplicate gradient already in the defs
			var grad = current_fill_paint.linearGradient;
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
			
			this.setFillColor("url(#" + grad.id + ")");
		}
		else {
//			console.log("none!");
		}
		this.setFillOpacity(current_fill_paint.alpha/100);
	};

	this.getStrokeWidth = function() {
		return current_stroke_width;
	};

	this.setStrokeWidth = function(val) {
		current_stroke_width = val;
		this.changeSelectedAttribute("stroke-width", val);
	};

	this.getStrokeStyle = function() {
		return current_stroke_style;
	};

	this.setStrokeStyle = function(val) {
		current_stroke_style = val;
		this.changeSelectedAttribute("stroke-dasharray", val);
	};

	this.getOpacity = function() {
		return current_opacity;
	};

	this.setOpacity = function(val) {
		current_opacity = val;
		this.changeSelectedAttribute("opacity", val);
	};

	this.getFillOpacity = function() {
		return current_fill_opacity;
	};

	this.setFillOpacity = function(val) {
		current_fill_opacity = val;
		this.changeSelectedAttribute("fill-opacity", val);
	};

	this.getStrokeOpacity = function() {
		return current_stroke_opacity;
	};

	this.setStrokeOpacity = function(val) {
		current_stroke_opacity = val;
		this.changeSelectedAttribute("stroke-opacity", val);
	};

	this.each = function(cb) {
		$(svgroot).children().each(cb);
	};

	this.bind = function(event, f) {
		events[event] = f;
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
		return current_font_family;
	};

	this.setFontFamily = function(val) {
    	current_font_family = val;
		this.changeSelectedAttribute("font-family", val);
	};

	this.getFontSize = function() {
		return current_font_size;
	};

	this.setFontSize = function(val) {
		current_font_size = val;
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

	// If you want to change all selectedElements, ignore the elems argument.
	// If you want to change only a subset of selectedElements, then send the
	// subset to this function in the elems argument.
	this.changeSelectedAttribute = function(attr, val, elems) {
		var elems = elems || selectedElements;
		var batchCmd = new BatchCommand("Change " + attr);
		var i = elems.length;
		var handle = svgroot.suspendRedraw(1000);
		while(i--) {
			var elem = elems[i];
			if (elem == null) continue;
			
			var oldval = (attr == "#text" ? elem.textContent : elem.getAttribute(attr));
			if (oldval != val) {
				if (attr == "#text") elem.textContent = val;
				else elem.setAttribute(attr, val);
				selectedBBoxes[i] = elem.getBBox();
				selectorManager.requestSelector(elem).resize(selectedBBoxes[i]);				
				var changes = {};
				changes[attr] = oldval;
				batchCmd.addSubCommand(new ChangeElementCommand(elem, changes, attr));
			}
		}
		svgroot.unsuspendRedraw(handle);
		if (!batchCmd.isEmpty()) { 
			addCommandToHistory(batchCmd);
			call("changed", elems);
		}
	};

	$(container).mouseup(mouseUp);
	$(container).mousedown(mouseDown);
	$(container).mousemove(mouseMove);

	this.saveHandler = function(svg) {
		window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
	};

	this.deleteSelectedElements = function() {
		var batchCmd = new BatchCommand("Delete Elements");
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			var selected = selectedElements[i];
			if (selected == null) break;

			var parent = selected.parentNode;
			var t = selected;
			// this will unselect the element and remove the selectedOutline
			selectorManager.releaseSelector(t);
			var elem = parent.removeChild(t);
			selectedElements[i] = null;
			batchCmd.addSubCommand(new RemoveElementCommand(elem, parent));
		}
		if (!batchCmd.isEmpty()) addCommandToHistory(batchCmd);
		call("selected", selectedElements);
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
			if (firstChild.tagName == 'defs') {
				firstChild = firstChild.nextSibling;
			}
			t = t.parentNode.insertBefore(t, firstChild);
			addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "bottom"));
		}
	};

	this.moveSelectedElements = function(dx,dy,undoable) {
		// if undoable is not sent, default to true
		var undoable = undoable&&true;
		var batchCmd = new BatchCommand("position");
		var i = selectedElements.length;
		while (i--) {
			var selected = selectedElements[i];
			if (selected != null) {
				selectedBBoxes[i] = selected.getBBox();
				selectedBBoxes[i].x += dx;
				selectedBBoxes[i].y += dy;
				var cmd = recalculateSelectedDimensions(i);
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
		var batchCmd = new BatchCommand("Clone Elements");
		var copiedElements = [];
		var len = selectedElements.length;
		for (var i = 0; i < len; ++i) {
			if (selectedElements[i] == null) break;
			copiedElements.push(selectedElements[i].cloneNode(true));
		}
		this.clearSelection();
		var len = copiedElements.length;
		for (var i = 0; i < len; ++i) {
			var elem = copiedElements[i];
			elem.id = getNextId();
			svgroot.appendChild(elem);
			batchCmd.addSubCommand(new InsertElementCommand(elem));
		}
		
		if (!batchCmd.isEmpty()) {
			this.addToSelection(copiedElements);
			this.moveSelectedElements(20,20,false);
			addCommandToHistory(batchCmd);
			call("selected", selectedElements);
		}		
	};

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
