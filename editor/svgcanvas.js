if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}

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
}

// TODO: create a 'typing' command object that tracks changes in text
// if a new Typing command is created and the top command on the stack is also a Typing
// and they both affect the same element, then collapse the two commands into one

// TODO: create a 'batch' command object that you can add an arbitrary number of 
// commands to (this will be useful for making changes to many elements in a 
// multiselection at one, we don't want to have to undo each element's change)

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
									"style": "pointer-events:none",
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
								"se":null,
								};
				
		// add the corner grips
		for (dir in this.selectorGrips) {
			this.selectorGrips[dir] = this.selectorGroup.appendChild( addSvgElementFromJson({
										"element": "rect",
										"attr": {
											"id": ("selectorGrip_" + dir + "_" + this.id),
											"fill": "blue",
											"width": 6,
											"height": 6,
											"style": ("cursor:" + dir + "-resize"),
											// when we are in rotate mode, we will set rx/ry to 3
//											"rx": 3,
//											"ry": 3,
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

	// TODO: add accessor methods to determine number of currently selected elements
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

			if (this.selectorParentGroup == null) {
				initGroup();											
			}

			// if we've already acquired one for this element, return it
			if (typeof(this.selectorMap[elem]) == "object") {
				this.selectorMap[elem].locked = true;
				return this.selectorMap[elem];
			}
			
			for (var i = 0; i < N; ++i) {
				if (this.selectors[i] && !this.selectors[i].locked) {
					this.selectors[i].locked = true;
					this.selectors[i].reset(elem);
					this.selectorMap[elem] = this.selectors[i];
					return this.selectors[i];
				}
			}
			// if we reached here, no available selectors were found, we create one
			this.selectors[N] = new Selector(N, elem);
			this.selectorParentGroup.appendChild(this.selectors[N].selectorGroup);
			this.selectorMap[elem] = this.selectors[N];
			return this.selectors[N];
		};
		this.releaseSelector = function(elem) {
			if (elem == null) return;
			var N = this.selectors.length;
			var sel = this.selectorMap[elem];
			for (var i = 0; i < N; ++i) {
				if (this.selectors[i] && this.selectors[i] == sel) {
					if (sel.locked == false) {
						console.log("WARNING! selector was released but was already unlocked");
					}
					delete this.selectorMap[elem];
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
			if (this.selectorParentGroup == null) {
				initGroup();
			}
			this.selectorParentGroup = svgroot.appendChild(this.selectorParentGroup);
		}
		
		this.getRubberBandBox = function() {
			if (this.selectorParentGroup == null) {
				initGroup();
			}
			
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
								"style": "pointer-events:none",
							}
						}));
			}
			return this.rubberBandBox;
		}
	}
	// **************************************************************************************

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
	var current_fill = "none";
	var current_stroke = "black";
	var current_stroke_width = 1;
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
	// this will hold all the currently selected elements
	// default size of 1 until it needs to grow bigger
	var selectedElements = new Array(1); 
	// this holds the selected's bbox
	var selectedBBoxes = new Array(1);
	// this object manages selectors for us
	var selectorManager = new SelectorManager();
	// this object holds the one-and-only selector (for now)
	var theSelector = null;
	var rubberBox = null;
	var events = {};
	var undoStackPointer = 0;
	var undoStack = [];

	// Since the only browser that supports getIntersectionList is Opera, we need to 
	// provide an implementation here.  We brute-force it for now.
	// Firefox does not implement getIntersectionList(), see https://bugzilla.mozilla.org/show_bug.cgi?id=501421
	// Webkit does not implement getIntersectionList(), see https://bugs.webkit.org/show_bug.cgi?id=11274
	var getIntersectionList = function(rect) {
		var resultList = null;
		try {
			resultList = svgroot.getIntersectionList(rect, null);
		} catch(e) { }
		
		if (resultList == null || typeof(resultList.item) != "function") 
		{
			// TODO: provide brute-force algorithm, looking at every element's bbox for intersection
			console.log("brute force!");
		}
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
		undoStack[undoStack.length] = cmd;
		undoStackPointer = undoStack.length;
	};

// private functions
	var getId = function() {
		if (events["getid"]) return call("getid", obj_num);
		return idprefix + obj_num;
	};

	var call = function(event, arg) {
		if (events[event]) {
			return events[event](this,arg);
		}
	};

	var assignAttributes = function(node, attrs) {
		for (i in attrs) {
			node.setAttributeNS(null, i, attrs[i]);
		}
	};

	// remove unneeded attributes
	// makes resulting SVG smaller
	var cleanupElement = function(element) {
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
	};

	var addSvgElementFromJson = function(data) {
		return canvas.updateElementFromJson(data)
	};

	var svgToString = function(elem, indent) {
		// TODO: could use the array.join() optimization trick here too
		var out = "";
		if (elem) {
			var attrs = elem.attributes;
			var attr;
			var i;
			var childs = elem.childNodes;
			for (i=0; i<indent; i++) out += " ";
			out += "<" + elem.nodeName;
			for (i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				if (attr.nodeValue != "") {
					out += " " + attr.nodeName + "=\"" + attr.nodeValue+ "\"";
				}
			}
			if (elem.hasChildNodes()) {
				out += ">";
				indent++;
				var bOneLine = false;
				for (i=0; i<childs.length; i++)
				{
					var child = childs.item(i);
					if (child.id == "selectorParentGroup") continue;
					if (child.nodeType == 1) { // element node
						out += "\n" + svgToString(childs.item(i), indent);
					} else if (child.nodeType == 3) { // text node
						bOneLine = true;
						out += child.nodeValue + "";
					}
				}
				indent--;
				if (!bOneLine) {
					out += "\n";
					for (i=0; i<indent; i++) out += " ";
				}
				out += "</" + elem.nodeName + ">";
			} else {
				out += "/>";
			}
		}
		return out;
	}; // end svgToString()

	var recalculateSelectedDimensions = function() {
		for (var i = 0; i < selectedElements.length; ++i) {
			var selected = selectedElements[i];
			if (selected == null) break;
			var selectedBBox = selectedBBoxes[i];
			var box = selected.getBBox();

			// if we have not moved/resized, then immediately leave
			if (box.x == selectedBBox.x && box.y == selectedBBox.y &&
				box.width == selectedBBox.width && box.height == selectedBBox.height) {
				return;
			}

			// after this point, we have some change

			var remapx = function(x) {return ((x-box.x)/box.width)*selectedBBox.width + selectedBBox.x;}
			var remapy = function(y) {return ((y-box.y)/box.height)*selectedBBox.height + selectedBBox.y;}
			var scalew = function(w) {return w*selectedBBox.width/box.width;}
			var scaleh = function(h) {return h*selectedBBox.height/box.height;}

			var changes = {};

			selected.removeAttribute("transform");
			switch (selected.tagName)
			{
			case "path":
				// extract the x,y from the path, adjust it and write back the new path
				// but first, save the old path
				changes["d"] = selected.getAttribute("d");
				var M = selected.pathSegList.getItem(0);
				var curx = M.x, cury = M.y;
				var newd = "M" + remapx(curx) + "," + remapy(cury);
				for (var i = 1; i < selected.pathSegList.numberOfItems; ++i) {
					var l = selected.pathSegList.getItem(i);
					var x = l.x, y = l.y;
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
				selected.x1.baseVal.value = remapx(selected.x1.baseVal.value);
				selected.y1.baseVal.value = remapy(selected.y1.baseVal.value);
				selected.x2.baseVal.value = remapx(selected.x2.baseVal.value);
				selected.y2.baseVal.value = remapy(selected.y2.baseVal.value);
				break;
			case "circle":
				changes["cx"] = selected.cx.baseVal.value;
				changes["cy"] = selected.cy.baseVal.value;
				changes["r"] = selected.r.baseVal.value;
				selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
				selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
				// take the minimum of the new selected box's dimensions for the new circle radius
				selected.r.baseVal.value = Math.min(selectedBBox.width/2,selectedBBox.height/2);
				break;
			case "ellipse":
				changes["cx"] = selected.cx.baseVal.value;
				changes["cy"] = selected.cy.baseVal.value;
				changes["rx"] = selected.rx.baseVal.value;
				changes["ry"] = selected.ry.baseVal.value;
				selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
				selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
				selected.rx.baseVal.value = scalew(selected.rx.baseVal.value);
				selected.ry.baseVal.value = scaleh(selected.ry.baseVal.value);
				break;
			case "text":
				// cannot use x.baseVal.value here because x is a SVGLengthList
				changes["x"] = selected.getAttribute("x");
				changes["y"] = selected.getAttribute("y");
				selected.setAttribute("x", remapx(selected.getAttribute("x")));
				selected.setAttribute("y", remapy(selected.getAttribute("y")));
				break;
			case "rect":
				changes["x"] = selected.x.baseVal.value;
				changes["y"] = selected.y.baseVal.value;
				changes["width"] = selected.width.baseVal.value;
				changes["height"] = selected.height.baseVal.value;
				selected.x.baseVal.value = remapx(selected.x.baseVal.value);
				selected.y.baseVal.value = remapy(selected.y.baseVal.value);
				selected.width.baseVal.value = scalew(selected.width.baseVal.value);
				selected.height.baseVal.value = scaleh(selected.height.baseVal.value);
				break;
			default: // rect
				console.log("Unknown shape type: " + selected.tagName);
				break;
			}
			// fire changed event
			if (changes) {
				var text = (current_resize_mode == "none" ? "position" : "size");
				// TODO: store these changes in a batch command
				addCommandToHistory(new ChangeElementCommand(selected, changes, text));
			}
		}
		// TODO: add the batch command to history
		call("changed", selectedElements);
	};

	var recalculateSelectedOutline = function() {
		for (var i = 0; i < selectedElements.length; ++i) {
			var selected = selectedElements[i];
			if (selected == null) break;
			var selectedBBox = selectedBBoxes[i]
			var theSelector = selectorManager.requestSelector(selected);
			if (selected != null && theSelector != null) {
				theSelector.resize(selectedBBox);
			}
		}
	};

// public events

	// TODO: grab code here and add to addSelection...
	
	this.clearSelection = function() {
		if (selectedElements[0] == null) { return; }
		
		for (var i = 0; i < selectedElements.length; ++i) {
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
		for (var i = 0; i < elemsToAdd.length; ++i) {
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
		for (var i = 0; i < selectedElements.length; ++i) {
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
				if (t.nodeName.toLowerCase() != "div" && t.nodeName.toLowerCase() != "svg") {
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
				d_attr = "M" + x + "," + y + " ";
				addSvgElementFromJson({
					"element": "path",
					"attr": {
						"d": d_attr,
						"id": getId(),
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
						"id": getId(),
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
						"id": getId(),
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
						"id": getId(),
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
						"id": getId(),
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
						"id": getId(),
						"fill": current_fill,
						"stroke": current_stroke,
						"stroke-width": current_stroke_width,
						"stroke-dasharray": current_stroke_style,
						"stroke-opacity": current_stroke_opacity,
						"fill-opacity": current_fill_opacity,
						// fix for bug where text elements were always 50% opacity
						"opacity": current_opacity,
						"font-size": current_font_size,
						"font-family": current_font_family,
					}
				});
				newText.textContent = "text";
				break;
		}
	};

	// in mouseMove we do not record any state changes yet (but we do update
	// any elements that are still being created, moved or resized on the canvas)
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
					var ts = "translate(" + dx + "," + dy + ")";
					for (var i = 0; i < selectedElements.length; ++i) {
						var selected = selectedElements[i];
						if (selected == null) break;
						selectedBBoxes[i] = selected.getBBox();
						selectedBBoxes[i].x += dx;
						selectedBBoxes[i].y += dy;
						selected.setAttribute("transform", ts);
					}
					recalculateSelectedOutline();
				}
				break;
			case "multiselect":
				rubberBox.x.baseVal.value = Math.min(start_x,x);
				rubberBox.y.baseVal.value = Math.min(start_y,y);
				rubberBox.width.baseVal.value = Math.abs(x-start_x);
				rubberBox.height.baseVal.value = Math.abs(y-start_y);
				
				// evt.target is the element that the mouse pointer is passing over
				// TODO: add new targets to the selectedElements array, create a 
				// selector for it, etc
				var nodeName = evt.target.nodeName;
				if (nodeName != "div" && nodeName != "svg") {
					canvas.addToSelection([evt.target]);
				}
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

				ts = "translate(" + (left+tx) + "," + (top+ty) + ") scale(" + (sx) + "," + (sy) +
						") translate(" + (-left) + "," + (-top) + ")";
				selected.setAttribute("transform", ts);
				recalculateSelectedOutline();
				break;
			case "text":
				shape.setAttribute("x", x);
				shape.setAttribute("y", y);
				break;
			case "line":
				shape.setAttributeNS(null, "x2", x);
				shape.setAttributeNS(null, "y2", y);
				break;
			case "square":
				var size = Math.max( Math.abs(x - start_x), Math.abs(y - start_y) );
				shape.setAttributeNS(null, "width", size);
				shape.setAttributeNS(null, "height", size);
				shape.setAttributeNS(null, "x", start_x < x ? start_x : start_x - size);
				shape.setAttributeNS(null, "y", start_y < y ? start_y : start_y - size);
				break;
			case "rect":
				shape.setAttributeNS(null, "x", Math.min(start_x,x));
				shape.setAttributeNS(null, "y", Math.min(start_y,y));
				shape.setAttributeNS(null, "width", Math.abs(x-start_x));
				shape.setAttributeNS(null, "height", Math.abs(y-start_y));
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
				shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
				shape.setAttributeNS(null, "ry", Math.abs(y - cy) );
				break;
			case "fhellipse":
			case "fhrect":
				freehand_min_x = Math.min(x, freehand_min_x);
				freehand_max_x = Math.max(x, freehand_max_x);
				freehand_min_y = Math.min(y, freehand_min_y);
				freehand_max_y = Math.max(y, freehand_max_y);
			// break; missing on purpose
			case "path":
				var dx = x - start_x;
				var dy = y - start_y;
				start_x = x;
				start_y = y;
				d_attr += "l" + dx + "," + dy + " ";
				shape.setAttributeNS(null, "d", d_attr);
				break;
		}
		// TODO: should we fire the change event here?  I'm thinking only fire
		// this event when the user mouses up.  That's when the action (create,
		// move, resize, draw) has finished
		// fire changed event
//		call("changed", selected);
	};

	// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
	//   and store it on the Undo stack
	// - in move/resize mode, the element's attributes which were affected by the move/resize are
	//   identified, a ChangeElementCommand is created and stored on the stack for those attrs
	//   this is done in recalculateSelectedDimensions()
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
					recalculateSelectedDimensions();
					recalculateSelectedOutline();
					// we return immediately from select so that the obj_num is not incremented
					return;
				}				
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
		}
		d_attr = null;
		obj_num++;
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
		// see http://jwatt.org/svg/authoring/#doctype-declaration
//		str += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
		str += svgToString(svgroot, 0);
		this.saveHandler(str);
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
		call("cleared");
	};

	this.setResolution = function(x, y) {
		var w = svgroot.getAttribute("width"),
			h = svgroot.getAttribute("height");
		svgroot.setAttribute("width", x);
		svgroot.setAttribute("height", y);
		addCommandToHistory(new ChangeElementCommand(svgroot, {"width":w,"height":h}, "resolution"));
		call("changed", [svgroot]);
	};

	this.getMode = function() {
		return current_mode;
	};

	this.setMode = function(name) {
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
		this.changeSelectedAttribute("fill", val);
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

	this.each = function(cb) {
		$(svgroot).children().each(cb);
	};

	this.bind = function(event, f) {
		events[event] = f;
	};

	this.setIdPrefix = function(p) {
		idprefix = p;
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

	this.changeSelectedAttribute = function(attr, val) {
		for (var i = 0; i < selectedElements.length; ++i) {
			var selected = selectedElements[i];
			if (selected == null) break;
			
			var oldval = (attr == "#text" ? selected.textContent : selected.getAttribute(attr));
			if (oldval != val) {
				if (attr == "#text") selected.textContent = val;
				else selected.setAttribute(attr, val);
				selectedBBoxes[i] = selected.getBBox();
				recalculateSelectedOutline();
				var changes = {};
				changes[attr] = oldval;
				// TODO: create a batch command here
				addCommandToHistory(new ChangeElementCommand(selected, changes, attr));
			}
		}
		// TODO: add batch command to history here
		call("changed", selectedElements);
	};

	$(container).mouseup(mouseUp);
	$(container).mousedown(mouseDown);
	$(container).mousemove(mouseMove);

	this.saveHandler = function(svg) {
		window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
	};

	this.deleteSelectedElement = function() {
		var selected = selectedElements[0];
		if (selected != null) {
			var parent = selected.parentNode;
			var t = selected;
			// this will unselect the element (and remove the selectedOutline)
			this.removeFromSelection([t]);
			var elem = parent.removeChild(t);
			addCommandToHistory(new RemoveElementCommand(elem, parent));
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
			t = t.parentNode.insertBefore(t, t.parentNode.firstChild);
			addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, "bottom"));
		}
	};

	this.moveSelectedElement = function(dx,dy) {
		var selected = selectedElements[0];
		if (selected != null) {
			selectedBBoxes[0] = selected.getBBox();
			selectedBBoxes[0].x += dx;
			selectedBBoxes[0].y += dy;

			recalculateSelectedDimensions();
			recalculateSelectedOutline();
		}
	};

	this.getUndoStackSize = function() { return undoStackPointer; }
	this.getRedoStackSize = function() { return undoStack.length - undoStackPointer; }

	this.undo = function() {
		if (undoStackPointer > 0) {
			this.clearSelection();
			var cmd = undoStack[--undoStackPointer];
			cmd.unapply();
			call("changed", [cmd.elem]);
		}
	}
	this.redo = function() {
		if (undoStackPointer < undoStack.length && undoStack.length > 0) {
			this.clearSelection();
			var cmd = undoStack[undoStackPointer++];
			cmd.apply();
			call("changed", [cmd.elem]);
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
	}

}
