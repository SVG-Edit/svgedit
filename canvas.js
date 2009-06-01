var canvas = null;

function svgCanvasInit(event) {
	canvas = new SvgCanvas(event.target.ownerDocument);
	canvas.setup(event);
	top.SvgCanvas = canvas;
}

function SvgCanvas(doc)
{

// private members

	var svgdoc = doc;
	var svgroot = svgdoc.documentElement;
	var svgns = "http://www.w3.org/2000/svg";
	var d_attr = "";
	var signature_started = 0;
	var obj_num = 1;
	var rect_x = null;
	var rect_y = null;
	var current_draw_element = "path";
	var current_draw_element_fill = "none";
	var current_draw_element_stroke = "black";
	var current_draw_element_stroke_width = "1px";
	var current_draw_element_stroke_style = "0";
	var freehand_min_x = null;
	var freehand_max_x = null;
	var freehand_min_y = null;
	var freehand_max_y = null;

// private functions

	var assignAttributes = function(node, attrs) {
		for (i in attrs) {
			node.setAttributeNS(null, i, attrs[i]);
		}
	}

	var createSvgElementFromJson = function(data) {
		var shape = svgdoc.createElementNS(svgns, data.element);
		assignAttributes(shape, data.attr);
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
					if (childs.item(i).nodeType == 1) // element node
					out = out + svgToString(childs.item(i), indent);
					else if (childs.item(i).nodeType == 3) // text node
					{
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

// private events

	this.mouseDown = function(evt)
	{
		var x = evt.pageX;
		var y = evt.pageY;
		switch (current_draw_element)
		{
		case "select":
			signature_started = 1;
			rect_x = x;
			rect_y = y;
			createSvgElementFromJson({
				"element": "rect",
				"attr": {
					"x": x,
					"y": y,
					"width": "1px",
					"height": "1px",
					"id": "rect_" + obj_num,
					"fill": 'none',
					"stroke": 'black',
					"stroke-width": '1px',
					"stroke-dasharray": "2,2"
				}
			});
			break;
		case "fhellipse":
			d_attr = "M" + x + " " + y + " ";
			signature_started = 1;
			createSvgElementFromJson({
				"element": "path",
				"attr": {
					"d": d_attr,
					"id": "path_" + obj_num,
					"fill": "none",
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"stroke-opacity": 0.5
				}
			});
			freehand_min_x = x;
			freehand_max_x = x;
			freehand_min_y = y;
			freehand_max_y = y;
		break;
		case "fhrect":
			d_attr = "M" + x + " " + y + " ";
			signature_started = 1;
			createSvgElementFromJson({
				"element": "path",
				"attr": {
					"d": d_attr,
					"id": "path_" + obj_num,
					"fill": "none",
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"stroke-opacity": 0.5
				}
			});
			freehand_min_x = x;
			freehand_max_x = x;
			freehand_min_y = y;
			freehand_max_y = y;
		break;
		case "path":
			d_attr = "M" + x + " " + y + " ";
			signature_started = 1;
			createSvgElementFromJson({
				"element": "path",
				"attr": {
					"d": d_attr,
					"id": "path_" + obj_num,
					"fill": "none",
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"stroke-opacity": 0.5
				}
			});
		break;
		case "square":
		case "rect":
			signature_started = 1;
			rect_x = x;
			rect_y = y;
			createSvgElementFromJson({
				"element": "rect",
				"attr": {
					"x": x,
					"y": y,
					"width": "1px",
					"height": "1px",
					"id": "rect_" + obj_num,
					"fill": current_draw_element_fill,
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"fill-opacity": 0.5,
					"stroke-opacity": 0.5
				}
			});
			break;
		case "line":
			signature_started = 1;
			createSvgElementFromJson({
				"element": "line",
				"attr": {
					"x1": x,
					"y1": y,
					"x2": x + 1 + "px",
					"y2": y + 1 + "px",
					"id": "line_" + obj_num,
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"stroke-opacity": 0.5
				}
			});
			break;
		case "circle":
		case "ellipse":
			signature_started = 1;
			createSvgElementFromJson({
				"element": "ellipse",
				"attr": {
					"cx": x,
					"cy": y,
					"rx": 1 + "px",
					"ry": 1 + "px",
					"id": "ellipse_" + obj_num,
					"fill": current_draw_element_fill,
					"stroke": current_draw_element_stroke,
					"stroke-width": current_draw_element_stroke_width,
					"stroke-dasharray": current_draw_element_stroke_style,
					"fill-opacity": 0.5,
					"stroke-opacity": 0.5
				}
			});
		break;
		case "delete":
			var t = evt.target;
			if(svgroot == evt.target) return;
			t.parentNode.removeChild(t);
			break;
		}
	}

	this.mouseMove = function(evt)
	{
		if (signature_started == 1)
		{
			var x = evt.pageX;
			var y = evt.pageY;
			switch (current_draw_element)
			{
				case "path":
					d_attr = d_attr + "L" + x + " " + y + " ";
					var shape = svgdoc.getElementById("path_" + obj_num);
					shape.setAttributeNS(null, "d", d_attr);
					break;
				case "line":
					var shape = svgdoc.getElementById("line_" + obj_num);
					shape.setAttributeNS(null, "x2", x);
					shape.setAttributeNS(null, "y2", y);
					break;
				case "square":
					var shape = svgdoc.getElementById("rect_" + obj_num);
					var size = Math.max( Math.abs(x - rect_x), Math.abs(y - rect_y) );
					shape.setAttributeNS(null, "width", size);
					shape.setAttributeNS(null, "height", size);
					if(rect_x < x) {
						shape.setAttributeNS(null, "x", rect_x);
					} else {
						shape.setAttributeNS(null, "x", rect_x - size);
					}
					if(rect_y < y) {
						shape.setAttributeNS(null, "y", rect_y);
					} else {
						shape.setAttributeNS(null, "y", rect_y - size);
					}
					break;
				case "select":
				case "rect":
					var shape = svgdoc.getElementById("rect_" + obj_num);
					if (rect_x < x) {
						shape.setAttributeNS(null, "x", rect_x);
						shape.setAttributeNS(null, "width", x - rect_x);
					} else {
						shape.setAttributeNS(null, "x", x);
						shape.setAttributeNS(null, "width", rect_x - x);
					}
					if (rect_y < y) {
						shape.setAttributeNS(null, "y", rect_y);
						shape.setAttributeNS(null, "height", y - rect_y);
					} else {
						shape.setAttributeNS(null, "y", y);
						shape.setAttributeNS(null, "height", rect_y - y);
					}
					break;
				case "circle":
					var shape = svgdoc.getElementById("ellipse_" + obj_num);
					var cx = shape.getAttributeNS(null, "cx");
					var cy = shape.getAttributeNS(null, "cy");
					var rad = Math.sqrt( (x-cx)*(x-cx) + (y-cy)*(y-cy) );
					shape.setAttributeNS(null, "rx", rad);
					shape.setAttributeNS(null, "ry", rad);
					break;
				case "ellipse":
					var shape = svgdoc.getElementById("ellipse_" + obj_num);
					var cx = shape.getAttributeNS(null, "cx");
					var cy = shape.getAttributeNS(null, "cy");
					shape.setAttributeNS(null, "rx", Math.abs(x - cx) );
					shape.setAttributeNS(null, "ry", Math.abs(y - cy) );
					break;
				case "fhellipse":
					d_attr = d_attr + "L" + x + " " + y + " ";
					var shape = svgdoc.getElementById("path_" + obj_num);
					shape.setAttributeNS(null, "d", d_attr);
					freehand_min_x = Math.min(x, freehand_min_x);
					freehand_max_x = Math.max(x, freehand_max_x);
					freehand_min_y = Math.min(y, freehand_min_y);
					freehand_max_y = Math.max(y, freehand_max_y);
					break;
				case "fhrect":
					d_attr = d_attr + "L" + x + " " + y + " ";
					var shape = svgdoc.getElementById("path_" + obj_num);
					shape.setAttributeNS(null, "d", d_attr);
					freehand_min_x = Math.min(x, freehand_min_x);
					freehand_max_x = Math.max(x, freehand_max_x);
					freehand_min_y = Math.min(y, freehand_min_y);
					freehand_max_y = Math.max(y, freehand_max_y);
					break;
			}
		}
	}

	this.mouseUp = function(evt)
	{
		if (signature_started == 1)
		{
			signature_started = 0;
			switch (current_draw_element)
			{
				case "select":
					var element = svgdoc.getElementById("rect_" + obj_num);
					element.parentNode.removeChild(element);
					break;
				case "path":
					d_attr = 0;
					var element = svgdoc.getElementById("path_" + obj_num);
					element.setAttribute("stroke-opacity", 1.0);
					obj_num++;
					break;
				case "line":
					var element = svgdoc.getElementById("line_" + obj_num);
					element.setAttribute("stroke-opacity", 1.0);
					obj_num++;
					break;
				case "square":
				case "rect":
					var element = svgdoc.getElementById("rect_" + obj_num);
					element.setAttribute("fill-opacity", 1.0);
					element.setAttribute("stroke-opacity", 1.0);
					obj_num++;
					break;
				case "circle":
				case "ellipse":
					var element = svgdoc.getElementById("ellipse_" + obj_num);
					element.setAttribute("fill-opacity", 1.0);
					element.setAttribute("stroke-opacity", 1.0);
					obj_num++;
					break;
				case "fhellipse":
					d_attr = 0;
					var element = svgdoc.getElementById("path_" + obj_num);
					element.parentNode.removeChild(element);
					createSvgElementFromJson({
						"element": "ellipse",
						"attr": {
							"cx": (freehand_min_x + freehand_max_x) / 2,
							"cy": (freehand_min_y + freehand_max_y) / 2,
							"rx": (freehand_max_x - freehand_min_x) / 2 + "px",
							"ry": (freehand_max_y - freehand_min_y) / 2 + "px",
							"id": "ellipse_" + obj_num,
							"fill": current_draw_element_fill,
							"stroke": current_draw_element_stroke,
							"stroke-width": current_draw_element_stroke_width,
							"stroke-dasharray": current_draw_element_stroke_style
						}
					});
					obj_num++;
					break;
				case "fhrect":
					d_attr = 0;
					var element = svgdoc.getElementById("path_" + obj_num);
					element.parentNode.removeChild(element);
					createSvgElementFromJson({
						"element": "rect",
						"attr": {
							"x": freehand_min_x,
							"y": freehand_min_y,
							"width": (freehand_max_x - freehand_min_x) + "px",
							"height": (freehand_max_y - freehand_min_y) + "px",
							"id": "rect_" + obj_num,
							"fill": current_draw_element_fill,
							"stroke": current_draw_element_stroke,
							"stroke-width": current_draw_element_stroke_width,
							"stroke-dasharray": current_draw_element_stroke_style
						}
					});
					obj_num++;
					break;
			}
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
			if (nodes[i].nodeType == 1) {	// element
				nodes[i].parentNode.removeChild(nodes[i]);
			} else {
				i++;
			}
		}
	}

	this.setMode = function(name) {
		current_draw_element = name;
	}

	this.setStrokeColor = function(color) {
		current_draw_element_stroke = color;
	}

	this.setFillColor = function(color) {
		current_draw_element_fill = color;
	}

	this.setStrokeWidth = function(val) {
		current_draw_element_stroke_width = val;
	}

	this.setStrokeStyle = function(val) {
		current_draw_element_stroke_style = val;
	}

	this.setup = function(evt) {
		assignAttributes(svgroot, {
			"onmouseup":   "canvas.mouseUp(evt)",
			"onmousedown": "canvas.mouseDown(evt)",
			"onmousemove": "canvas.mouseMove(evt)"
		});
	}

}
