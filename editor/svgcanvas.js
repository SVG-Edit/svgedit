var svgcanvas = null;

function SvgCanvas(c)
{

// private members
	var container = c;
	var svgns = "http://www.w3.org/2000/svg";

	var svgdoc  = c.ownerDocument;
	var svgroot = svgdoc.createElementNS(svgns, "svg");
	svgroot.setAttribute("width", 640);
	svgroot.setAttribute("height", 480);
	svgroot.setAttributeNS(null, "id", "svgroot");
	container.appendChild(svgroot);

	var d_attr = null;
	var started = false;
	var obj_num = 1;
	var start_x = null;
	var start_y = null;
	var current_mode = "path";
	var current_fill = "none";
	var current_stroke = "black";
	var current_stroke_width = 1;
	var current_stroke_style = "none";
	var current_opacity = 1;
	var current_stroke_opacity = 1;
	var current_fill_opacity = 1;
	var freehand_min_x = null;
	var freehand_max_x = null;
	var freehand_min_y = null;
	var freehand_max_y = null;
	var selected = null;
	var selectedOutline = null;
	var events = {};

// private functions
	var getId = function() {
		return "svg_"+obj_num;
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
	}

	var addSvgElementFromJson = function(data) {
		var shape = svgdoc.createElementNS(svgns, data.element);
		assignAttributes(shape, data.attr);
		cleanupElement(shape);
		svgroot.appendChild(shape);
		return shape;
	}

	var svgToString = function(elem, indent) {
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
				out += " " + attr.nodeName + "=\"" + attr.nodeValue+ "\"";
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
						out += childs.item(i).nodeValue + "\n";
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

// public events
	// call this function to set the selected element
	// call this function with null to clear the selected element
	var selectElement = function(newSelected) 
	{
		// remove selected outline from previously selected element
		if (selected != null && selectedOutline != null) {
			svgroot.removeChild(selectedOutline);
			selectedOutline = null;
		}
		
		selected = newSelected;
		
		if (selected != null) {
			var bbox = selected.getBBox();
			
			// ideally we should create this element once during init, then remove from the DOM
			// and re-append to end of documentElement.  This will also allow us to do some
			// interesting things like animate the stroke-dashoffset using a SMIL <animate> child
			selectedOutline = addSvgElementFromJson({
					"element": "rect",
					"attr": {
						"id": "selectedBox",
						"fill": "none",
						"stroke": "blue",
						"stroke-width": "1",
						"stroke-dasharray": "5,5",
						"x": bbox.x-1,
						"y": bbox.y-1,
						"width": bbox.width+2,
						"height": bbox.height+2
					}
			});
			
			// set all our current styles to the selected styles
			current_fill = selected.getAttribute("fill");
			current_fill_opacity = selected.getAttribute("fill-opacity");
			current_stroke = selected.getAttribute("stroke");
			current_stroke_opacity = selected.getAttribute("stroke-opacity");
			current_stroke_width = selected.getAttribute("stroke-width");
			current_stroke_style = selected.getAttribute("stroke-dasharray");
		}
		
		call("selected",selected);
	}

	var mouseDown = function(evt)
	{
		var x = evt.pageX - container.offsetLeft;
		var y = evt.pageY - container.offsetTop;
		switch (current_mode) {
			case "select":
				var t = evt.target;
				if (t != svgroot) {
					selectElement(t);
				}
				break;
			case "fhellipse":
			case "fhrect":
			case "path":
				started = true;
				d_attr = "M" + x + " " + y + " ";
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
			case "delete":
				var t = evt.target;
				if (t == svgroot) return;
				t.parentNode.removeChild(t);
				call("deleted",t);
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
				d_attr += "L" + x + " " + y + " ";
				shape.setAttributeNS(null, "d", d_attr);
				break;
		}
	}

	var mouseUp = function()
	{
		if (!started) return;

		started = false;
		var element = svgdoc.getElementById(getId());
		var keep = false;
		switch (current_mode)
		{
			/*
			case "select":
				if (element.getAttribute('width') == 0 &&
				    element.getAttribute('height') == 0) {
				// only one element is selected and stored in selected variable (or null)
				} else {
				// element.getAttribute('x')
				// element.getAttribute('y')
				// should scan elements which are in rect(x,y,width,height) and select them
				}
				break;
			*/
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
				}
				break;
		}
		d_attr = null;
		obj_num++;
		if (!keep) {
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
		var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n"
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

	this.bind = function(event, f) {
		events[event] = f;
	}

	$(container).mouseup(mouseUp);
	$(container).mousedown(mouseDown);
	$(container).mousemove(mouseMove);

	this.saveHandler = function(svg) {
		alert(svg);
	}

	this.selectNone = function() {
		selectElement(null);
	}

}
