var svgcanvas = null;

function svgCanvasInit(event) {
	svgcanvas = new SvgCanvas(event.target.ownerDocument);
	svgcanvas.setup(event);
	parent.SvgCanvas = svgcanvas;
}

function SvgCanvas(doc)
{

// private members

	var svgdoc = doc;
	var svgroot = svgdoc.documentElement;
	var svgns = "http://www.w3.org/2000/svg";
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

// private functions
	var getId = function() {
		return "svg_"+obj_num;
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
		svgdoc.documentElement.appendChild(shape);
	}

	var svgToString = function(elem, indent) {
		var out = "";
		if (elem) {
			var attrs = elem.attributes;
			var attr;
			var i;
			var childs = elem.childNodes;
			// don't include scripts in output svg
			if (elem.nodeName == "script") return "";
			for (i=0; i<indent; i++) out += "  ";
			out += "<" + elem.nodeName;
			for (i=attrs.length-1; i>=0; i--) {
				attr = attrs.item(i);
				// don't include events in output svg
				if (attr.nodeName == "onload" ||
					attr.nodeName == "onmousedown" ||
					attr.nodeName == "onmousemove" ||
					attr.nodeName == "onmouseup") continue;
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
	}

// public events

	this.mouseDown = function(evt)
	{
		var x = evt.pageX;
		var y = evt.pageY;
		switch (current_mode) {
			case "select":
				started = true;
				start_x = x;
				start_y = y;
				if (evt.target != svgroot)
					selected = evt.target;
				addSvgElementFromJson({
					"element": "rect",
					"attr": {
						"x": x,
						"y": y,
						"width": 0,
						"height": 0,
						"id": getId(),
						"fill": '#DBEBF9',
						"stroke": '#CEE2F7',
						"stroke-width": 1,
						"fill-opacity": 0.5
					}
				});
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
						"id": "rect_" + obj_num,
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
						"id": "ellipse_" + obj_num,
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
				break;
		}
	}

	this.mouseMove = function(evt)
	{
		if (!started) return;

		var x = evt.pageX;
		var y = evt.pageY;
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
				if(start_x < x) {
					shape.setAttributeNS(null, "x", start_x);
				} else {
					shape.setAttributeNS(null, "x", start_x - size);
				}
				if(start_y < y) {
					shape.setAttributeNS(null, "y", start_y);
				} else {
					shape.setAttributeNS(null, "y", start_y - size);
				}
				break;
			case "select":
			case "rect":
				if (start_x < x) {
					shape.setAttributeNS(null, "x", start_x);
					shape.setAttributeNS(null, "width", x - start_x);
				} else {
					shape.setAttributeNS(null, "x", x);
					shape.setAttributeNS(null, "width", start_x - x);
				}
				if (start_y < y) {
					shape.setAttributeNS(null, "y", start_y);
					shape.setAttributeNS(null, "height", y - start_y);
				} else {
					shape.setAttributeNS(null, "y", y);
					shape.setAttributeNS(null, "height", start_y - y);
				}
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
				var shape = svgdoc.getElementById(getId());
				shape.setAttributeNS(null, "d", d_attr);
				break;
		}
	}

	this.mouseUp = function(evt)
	{
		if (!started) return;

		started = false;
		var element = svgdoc.getElementById(getId());

		switch (current_mode)
		{
			case "select":
				if (element.getAttribute('width') == 0 &&
				    element.getAttribute('height') == 0) {
				// only one element is selected and stored in selected variable (or null)
				} else {
				// element.getAttribute('x')
				// element.getAttribute('y')
				// should scan elements which are in rect(x,y,width,height) and select them
				}
				element.parentNode.removeChild(element);
				element = null;
				break;
			case "path":
				d_attr = null;
				element.setAttribute("opacity", current_opacity);
				obj_num++;
				break;
			case "line":
				if (element.getAttribute('x1') == element.getAttribute('x2') &&
				    element.getAttribute('y1') == element.getAttribute('y2')) {
					element.parentNode.removeChild(element);
					element = null;
				} else {
					element.setAttribute("opacity", current_opacity);
					obj_num++;
				}
				break;
			case "square":
			case "rect":
				if (element.getAttribute('width') == 0 &&
				    element.getAttribute('height') == 0) {
					element.parentNode.removeChild(element);
					element = null;
				} else {
					element.setAttribute("opacity", current_opacity);
					obj_num++;
				}
				break;
			case "circle":
				if (element.getAttribute('r') == 0) {
					element.parentNode.removeChild(element);
					element = null;
				} else {
					element.setAttribute("opacity", current_opacity);
					obj_num++;
				}
				break;
			case "ellipse":
				if (element.getAttribute('rx') == 0 &&
				    element.getAttribute('ry') == 0) {
					element.parentNode.removeChild(element);
					element = null;
				} else {
					element.setAttribute("opacity", current_opacity);
					obj_num++;
				}
				break;
			case "fhellipse":
				d_attr = null;
				element.parentNode.removeChild(element);
				if ((freehand_max_x - freehand_min_x) > 0 &&
				    (freehand_max_y - freehand_min_y) > 0) {
					addSvgElementFromJson({
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
					obj_num++;
				}
				break;
			case "fhrect":
				d_attr = null;
				element.parentNode.removeChild(element);
				if ((freehand_max_x - freehand_min_x) > 0 &&
				    (freehand_max_y - freehand_min_y) > 0) {
					addSvgElementFromJson({
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
					obj_num++;
				}
				break;
		}
		if (element != null) {
			cleanupElement(element);
		}
	}

// public functions

	this.serialize = function(handler) {
		var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n"
		str += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
		str += svgToString(svgroot, 0);
		handler(str);
	}

	this.clear = function() {
		var nodes = svgroot.childNodes;
		var len = svgroot.childNodes.length;
		var i = 0;
		for(var rep = 0; rep < len; rep++){
			if (nodes[i].nodeType == 1) { // element node
				nodes[i].parentNode.removeChild(nodes[i]);
			} else {
				i++;
			}
		}
	}

	this.setMode = function(name) {
		current_mode = name;
	}

	this.setStrokeColor = function(color) {
		current_stroke = color;
	}

	this.setFillColor = function(color) {
		current_fill = color;
	}

	this.setStrokeWidth = function(val) {
		current_stroke_width = val;
	}

	this.setStrokeStyle = function(val) {
		current_stroke_style = val;
	}

	this.setOpacity = function(val) {
		current_opacity = val;
	}

	this.setFillOpacity = function(val) {
		current_fill_opacity = val;
	}

	this.setStrokeOpacity = function(val) {
		current_stroke_opacity = val;
	}

	this.setup = function(evt) {
		assignAttributes(svgroot, {
			"onmouseup":   "svgcanvas.mouseUp(evt)",
			"onmousedown": "svgcanvas.mouseDown(evt)",
			"onmousemove": "svgcanvas.mouseMove(evt)"
		});
	}

}
