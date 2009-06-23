var svgcanvas = null;

if(!window.console) {
  window.console = new function() {
    this.log = function(str) {};
    this.dir = function(str) {};
  };
}

function SvgCanvas(c)
{

// private members
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
	var current_mode = "path";
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
	var selected = null;
	var selectedOutline = null;
	var selectedBBox = null;
	var selectedGrips = { 	"nw":null,
							"n":null,
							"ne":null,
							"w":null,
							"e":null,
							"sw":null,
							"s":null,
							"se":null,
						};
	var selectedOperation = 'resize'; // could be {resize,rotate}
	var events = {};

// private functions
	var getId = function() {
	    if (events["getid"]) return call("getid",obj_num);
		return idprefix+obj_num;
	}

	var call = function(event, arg) {
		if (events[event]) {
			return events[event](this,arg);
		}
	}

	var assignAttributes = function(node, attrs) {
		for (i in attrs) {
			node.setAttributeNS(null, i, attrs[i]);
		}
	}

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
	}

	var addSvgElementFromJson = function(data) {
		return canvas.updateElementFromJson(data)
	}

	var svgToString = function(elem, indent) {
		// TODO: could use the array.join() optimization trick here too
		var out = "";
		if (elem) {
			var attrs = elem.attributes;
			var attr;
			var i;
			var childs = elem.childNodes;
			for (i=0; i<indent; i++) out += "  ";
			out += "<" + elem.nodeName;
			for (i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				if (attr.nodeValue != "") {
					out += " " + attr.nodeName + "=\"" + attr.nodeValue+ "\"";
				}
			}
			if (elem.hasChildNodes()) {
				out += ">\n";
				indent++;
				for (i=0; i<childs.length; i++)
				{
					if (childs.item(i).nodeType == 1) { // element node
						out = out + svgToString(childs.item(i), indent);
					} else if (childs.item(i).nodeType == 3) { // text node
						for (j=0; j<indent; j++) out += "  ";
						out += childs.item(i).nodeValue + "";
					}
				}
				indent--;
				for (i=0; i<indent; i++) out += "  ";
				out += "</" + elem.nodeName + ">\n";
			} else {
				out += " />\n";
			}
		}
		return out;
	} // end svgToString()

	function recalculateSelectedDimensions() {
		var box = selected.getBBox();
		var remapx = function(x) {return ((x-box.x)/box.width)*selectedBBox.width + selectedBBox.x;}
		var remapy = function(y) {return ((y-box.y)/box.height)*selectedBBox.height + selectedBBox.y;}
		var scalew = function(w) {return w*selectedBBox.width/box.width;}
		var scaleh = function(h) {return h*selectedBBox.height/box.height;}

		selected.removeAttribute("transform");
		switch (selected.tagName)
		{
			case "path":
				// extract the x,y from the path, adjust it and write back the new path
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
				selected.x1.baseVal.value = remapx(selected.x1.baseVal.value);
				selected.y1.baseVal.value = remapy(selected.y1.baseVal.value);
				selected.x2.baseVal.value = remapx(selected.x2.baseVal.value);
				selected.y2.baseVal.value = remapy(selected.y2.baseVal.value);
				break;
			case "circle":
				selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
				selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
				// take the minimum of the new selected box's dimensions for the new circle radius
				selected.r.baseVal.value = Math.min(selectedBBox.width/2,selectedBBox.height/2);
				break;
			case "ellipse":
				selected.cx.baseVal.value = remapx(selected.cx.baseVal.value);
				selected.cy.baseVal.value = remapy(selected.cy.baseVal.value);
				selected.rx.baseVal.value = scalew(selected.rx.baseVal.value);
				selected.ry.baseVal.value = scaleh(selected.ry.baseVal.value);
				break;
			case "text":
				// cannot use x.baseVal.value here because x is a SVGLengthList
				selected.setAttribute("x", remapx(selected.getAttribute("x")));
				selected.setAttribute("y", remapy(selected.getAttribute("y")));
				break;
			case "rect":
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
		call("changed", selected);
	}

	var recalculateSelectedOutline = function() {
		if (selected != null && selectedOutline != null) {
			var bbox = selectedBBox;
			var selectedBox = selectedOutline.firstChild;
			var sw = parseInt(selected.getAttribute("stroke-width"));
			var offset = 1;
			if (!isNaN(sw)) {
				offset += sw/2;
			}
			if (selected.tagName == "text") {
				offset += 2;
			}
			var l=bbox.x-offset, t=bbox.y-offset, w=bbox.width+(offset<<1), h=bbox.height+(offset<<1);
			selectedBox.x.baseVal.value = l;
			selectedBox.y.baseVal.value = t;
			selectedBox.width.baseVal.value = w;
			selectedBox.height.baseVal.value = h;
			if (selectedOperation == 'resize') {
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
			} else if (selectedOperation == 'rotate') {
				selectedGrips.nw.cx.baseVal.value = l;
				selectedGrips.nw.cy.baseVal.value = t;
				selectedGrips.ne.cx.baseVal.value = l+w;
				selectedGrips.ne.cy.baseVal.value = t;
				selectedGrips.sw.cx.baseVal.value = l;
				selectedGrips.sw.cy.baseVal.value = t+h;
				selectedGrips.se.cx.baseVal.value = l+w;
				selectedGrips.se.cy.baseVal.value = t+h;
				selectedGrips.n.cx.baseVal.value = l+w/2;
				selectedGrips.n.cy.baseVal.value = t;
				selectedGrips.w.cx.baseVal.value = l;
				selectedGrips.w.cy.baseVal.value = t+h/2;
				selectedGrips.e.cx.baseVal.value = l+w;
				selectedGrips.e.cy.baseVal.value = t+h/2;
				selectedGrips.s.cx.baseVal.value = l+w/2;
				selectedGrips.s.cy.baseVal.value = t+h;
			}
		}
	}

// public events
	// call this function to set the selected element
	// call this function with null to clear the selected element
	var selectElement = function(newSelected)
	{
		if (selected == newSelected) return;

		// remove selected outline from previously selected element
		if (selected != null && selectedOutline != null) {
			// remove from DOM and store reference in JS but only if it exists in the DOM
			try {
				var theOutline = svgroot.removeChild(selectedOutline);
				selectedOutline = theOutline;
			} catch(e) { }
		}

		selected = newSelected;

		if (selected != null) {
			selectedBBox = selected.getBBox();

			// we create this element for the first time here
			if (selectedOutline == null) {
				// create a group that will hold all the elements that make
				// up the selected outline
				selectedOutline = addSvgElementFromJson({
					"element": "g",
					"attr": {
						"id": "selectedGroup",
					}
				});

				// add the bounding box
				selectedOutline.appendChild( addSvgElementFromJson({
					"element": "rect",
					"attr": {
						"id": "selectedBox",
						"fill": "none",
						"stroke": "blue",
						"stroke-width": "1",
						"stroke-dasharray": "5,5",
						"width": 1,
						"height": 1,
						// need to specify this style so that the selectedOutline is not selectable
						"style": "pointer-events:none",
					}
				}) );

				// add the corner grips
				for (dir in selectedGrips) {
					if (selectedOperation == 'resize') {
						selectedGrips[dir] = selectedOutline.appendChild( addSvgElementFromJson({
							"element": "rect",
							"attr": {
								"id": dir + "_grip",
								"fill": "blue",
								"width": 6,
								"height": 6,
								"style": ("cursor:" + dir + "-resize"),
							}
						}) );
					} else if (selectedOperation == 'rotate') {
						selectedGrips[dir] = selectedOutline.appendChild( addSvgElementFromJson({
							"element": "circle",
							"attr": {
								"id": (dir + "_grip"),
								"fill": "blue",
								"r": 3,
								"style": "cursor: crosshair",
							}
						}) );
					}
					$('#'+selectedGrips[dir].id).mousedown( function() {
						current_mode = "resize";
						current_resize_mode = this.id.substr(0,this.id.indexOf("_"));
					});
				}
			}
			// recalculate size and then re-append to bottom of document
			recalculateSelectedOutline();
			svgroot.appendChild(selectedOutline);

			// set all our current styles to the selected styles
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

			// do now show resize grips on text elements
			var gripDisplay = (selected.tagName == "text" ? "none" : "inline");
			for (dir in selectedGrips) {
				selectedGrips[dir].setAttribute("display", gripDisplay);
			}
		}

		call("selected", selected);
	}

	var mouseDown = function(evt)
	{
		var x = evt.pageX - container.offsetLeft;
		var y = evt.pageY - container.offsetTop;
		switch (current_mode) {
			case "select":
				started = true;
				start_x = x;
				start_y = y;
				var t = evt.target;
				// WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
				if (t.nodeName.toLowerCase() == "div" || t.nodeName.toLowerCase() == "svg") {
					t = null;
				}
				selectElement(t);
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
				// TODO: once we create the rect, we lose information that this was a square
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
	}

	var mouseMove = function(evt)
	{
		if (!started) return;
		var x = evt.pageX - container.offsetLeft;
		var y = evt.pageY - container.offsetTop;
		var shape = svgdoc.getElementById(getId());
		switch (current_mode)
		{
			case "select":
				// we temporarily use a translate on the element being dragged
				// this transform is removed upon mouseUp and the element is relocated to the
				// new location
				if (selected != null && selectedOutline != null) {
					var dx = x - start_x;
					var dy = y - start_y;
					selectedBBox = selected.getBBox();
					selectedBBox.x += dx;
					selectedBBox.y += dy;
					var ts = "translate(" + dx + "," + dy + ")";
					selected.setAttribute("transform", ts);
					recalculateSelectedOutline();
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
			// case "select":
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
		// fire changed event
		call("changed", selected);		
	}

	var mouseUp = function(evt)
	{
		if (!started) return;

		started = false;
		var element = svgdoc.getElementById(getId());
		var keep = false;
		switch (current_mode)
		{
			// fall-through to select here
			case "resize":
				current_mode = "select";
			case "select":
				if (selected != null) {
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
					call("changed",addSvgElementFromJson({
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
					}));
					keep = true;
				}
				break;
			case "fhrect":
				if ((freehand_max_x - freehand_min_x) > 0 &&
				    (freehand_max_y - freehand_min_y) > 0) {
					call("changed",addSvgElementFromJson({
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
					}));
					keep = true;
				}
				break;
			case "text":
				keep = true;
				selectElement(element);
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
			call("changed",element);
		}
	}

// public functions

	this.save = function() {
		// remove the selected outline before serializing
		this.selectNone();
		var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n";
		str += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
		str += svgToString(svgroot, 0);
		this.saveHandler(str);
	}

	this.clear = function() {
		var nodes = svgroot.childNodes;
		var len = svgroot.childNodes.length;
		var i = 0;
		this.selectNone();
		for(var rep = 0; rep < len; rep++){
			if (nodes[i].nodeType == 1) { // element node
				nodes[i].parentNode.removeChild(nodes[i]);
			} else {
				i++;
			}
		}
		call("cleared");
	}

	this.getMode = function() {
		return current_mode;
	}

	this.setMode = function(name) {
		current_mode = name;
	}

	this.getStrokeColor = function() {
		return current_stroke;
	}

	this.setStrokeColor = function(color) {
		current_stroke = color;
		if (selected != null) {
			selected.setAttribute("stroke", color);
			call("changed", selected);
		}
	}

	this.getFillColor = function() {
		return current_fill;
	}

	this.setFillColor = function(color) {
		current_fill = color;
		if (selected != null) {
			selected.setAttribute("fill", color);
			call("changed", selected);
		}
	}

	this.getStrokeWidth = function() {
		return current_stroke_width;
	}

	this.setStrokeWidth = function(val) {
		current_stroke_width = val;
		if (selected != null) {
			selected.setAttribute("stroke-width", val);
			recalculateSelectedOutline();
			call("changed", selected);
		}
	}

	this.getStrokeStyle = function() {
		return current_stroke_style;
	}

	this.setStrokeStyle = function(val) {
		current_stroke_style = val;
		if (selected != null) {
			selected.setAttribute("stroke-dasharray", val);
			call("changed", selected);
		}
	}

	this.getOpacity = function() {
		return current_opacity;
	}

	this.setOpacity = function(val) {
		current_opacity = val;
		if (selected != null) {
			selected.setAttribute("opacity", val);
			call("changed", selected);
		}
	}

	this.getFillOpacity = function() {
		return current_fill_opacity;
	}

	this.setFillOpacity = function(val) {
		current_fill_opacity = val;
		if (selected != null) {
			selected.setAttribute("fill-opacity", val);
			call("changed", selected);
		}
	}

	this.getStrokeOpacity = function() {
		return current_stroke_opacity;
	}

	this.setStrokeOpacity = function(val) {
		current_stroke_opacity = val;
		if (selected != null) {
			selected.setAttribute("stroke-opacity", val);
			call("changed", selected);
		}
	}

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
	}

	this.each = function(cb) {
		$(svgroot).children().each(cb);
	}

	this.bind = function(event, f) {
		events[event] = f;
	}

	this.setIdPrefix = function(p) {
		idprefix = p;
	}

	this.getFontFamily = function() {
		return current_font_family;
	}

	this.setFontFamily = function(val) {
    	current_font_family = val;
		if (selected != null) {
			selected.setAttribute("font-family", val);
			recalculateSelectedOutline();
			call("changed", selected);
		}
	}

	this.getFontSize = function() {
		return current_font_size;
	}

	this.setFontSize = function(val) {
		current_font_size = val;
		if (selected != null) {
			selected.setAttribute("font-size", val);
			recalculateSelectedOutline();
			call("changed", selected);
		}
	}

	this.getText = function() {
		if (selected == null) { return ""; }
		return selected.textContent;
	}

	this.setTextContent = function(val) {
		if (selected != null) {
			selected.textContent = val;
			recalculateSelectedOutline();
			call("changed", selected);
		}
	}

	this.setRectRadius = function(val) {
		if (selected != null && selected.tagName == "rect") {
			selected.setAttribute("rx", val);
			selected.setAttribute("rx", val);
			call("changed", selected);
		}
	}

	$(container).mouseup(mouseUp);
	$(container).mousedown(mouseDown);
	$(container).mousemove(mouseMove);

	this.saveHandler = function(svg) {
		window.open("data:image/svg+xml;base64," + Utils.encode64(svg));
	}

	this.selectNone = function() {
		selectElement(null);
	}

	this.deleteSelectedElement = function() {
		if (selected != null) {
			var t = selected;
			// this will unselect the element (and remove the selectedOutline)
			selectElement(null);
			t.parentNode.removeChild(t);
			call("deleted",t);
		}
	}

	this.moveToTopSelectedElement = function() {
		if (selected != null) {
			var t = selected;
			t.parentNode.appendChild(t);
		}
	}

	this.moveToBottomSelectedElement = function() {
		if (selected != null) {
			var t = selected;
			t.parentNode.insertBefore(t, t.parentNode.firstChild);
		}
	}

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
