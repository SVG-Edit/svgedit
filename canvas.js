var canvas = null;

function svgCanvasInit(event) {
    canvas = new svgCanvas(event.target.ownerDocument);
    top.svgCanvas = canvas;
}

function svgCanvas(doc) {

// functions

    this.assignAttributes = function(node, attrs) {
        for (i in attrs) {
            node.setAttributeNS(null, i, attrs[i]);
        }
    }

this.create_svg_element_by_json = function(data) {
    var shape = this.svgdoc.createElementNS(this.svgns, data.element);
    this.assignAttributes(shape, data.Attr);
    this.svgdoc.documentElement.appendChild(shape);
}

this.svgToString = function(elem , indent)
{
    var out = "" ;
   if (elem)
   {
      var attrs = elem.attributes;
      var attr;
      var i;
      var childs = elem.childNodes;

      // don't include scripts in output svg
      if (elem.nodeName == "script") return "";

      for (i=0; i<indent; i++) out += "  ";
      out += "<" + elem.nodeName;
      for (i=attrs.length-1; i>=0; i--)
      {
         attr = attrs.item(i);
         // don't include events in output svg
         if (attr.nodeName == "onload" ||
             attr.nodeName == "onmousedown" ||
             attr.nodeName == "onmousemove" ||
             attr.nodeName == "onmouseup") continue;
         out += " " + attr.nodeName + "=\"" + attr.nodeValue+ "\"";
      }

      if (elem.hasChildNodes())
      {
         out += ">\n";
         indent++;
         for (i=0; i<childs.length; i++)
         {
            if (childs.item(i).nodeType == 1) // element node
               out = out + this.svgToString(childs.item(i) ,indent);
            else if (childs.item(i).nodeType == 3) // text node
            {
               for (j=0; j<indent; j++) out += "  ";
               out += childs.item(i).nodeValue + "\n";
            }
         }
         indent--;
         for (i=0; i<indent; i++) out += "  ";
         out += "</" + elem.nodeName + ">\n";
      }
      else
      {
         out += " />\n";
      }

   }
   return out;
}



// constructor
    this.svgdoc = doc;
    this.svgroot = this.svgdoc.documentElement;
    this.svgns = "http://www.w3.org/2000/svg";
    this.d_attr = "" ;
    this.signature_started = 0 ;
    this.obj_num = 1 ;
    this.rect_x = null ;
    this.rect_y = null ;
    this.current_draw_element = "path" ;
    this.current_draw_element_fill = "none" ;
    this.current_draw_element_stroke_width = "1px" ;
    this.current_draw_element_stroke = "black" ;
    this.freehand_min_x = null ;
    this.freehand_max_x = null ;
    this.freehand_min_y = null ;
    this.freehand_max_y = null ;

    this.assignAttributes(this.svgroot, {
        "onmouseup":   "canvas.mouseUp(evt)",
        "onmousedown": "canvas.mouseDown(evt)",
        "onmousemove": "canvas.mouseMove(evt)"
    });

    this.serialize = function(handler) {
        var str = "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
        str = str + this.svgToString(this.svgroot, 0);
        handler(str);
    }

this.clear = function() {
    var Nodes = SVGRoot.childNodes ;
    var Length = SVGRoot.childNodes.length ;
    var i = 0 ;
    for(var Rep=0; Rep< Length; Rep++){
        if(Nodes[i].nodeType == 1){
            Nodes[i].parentNode.removeChild(Nodes[i]);
        }
        else{
            i++;
        }
    }
}

this.setMode = function(name) {
    this.current_draw_element = name;
}


this.setStrokeColor = function(color) {
    this.current_draw_element_stroke = color;
}

this.setFillColor = function(color) {
    this.current_draw_element_fill = color;
}

this.setStrokeColor = function(val) {
    this.current_draw_element_stroke_width = val;
}

this.mouseUp = function(evt)
{

   if (this.signature_started == 1 )
   {
    this.signature_started = 0 ;

    switch (this.current_draw_element)
    {
    case "select":
        var element = this.svgdoc.getElementById("rect_" + this.obj_num);
        element.parentNode.removeChild(element);
        break;
    case "path":
        this.d_attr = 0 ;
        var element = this.svgdoc.getElementById("path_" + this.obj_num);
        element.setAttribute("stroke-opacity", 1.0);
        this.obj_num++;
        break;
    case "line":
        var element = this.svgdoc.getElementById("line_" + this.obj_num);
        element.setAttribute("stroke-opacity", 1.0);
        this.obj_num++;
        break;
    case "square":
    case "rect":
        var element = this.svgdoc.getElementById("rect_" + this.obj_num);
        element.setAttribute("fill-opacity", 1.0);
        element.setAttribute("stroke-opacity", 1.0);
        this.obj_num++;
        break;
    case "circle":
    case "ellipse":
        var element = this.svgdoc.getElementById("ellipse_" + this.obj_num);
        element.setAttribute("fill-opacity", 1.0);
        element.setAttribute("stroke-opacity", 1.0);
        this.obj_num++;
        break;
    case "fhellipse":
        this.d_attr = 0 ;

        var element = this.svgdoc.getElementById("path_" + this.obj_num);
        element.parentNode.removeChild(element);

        this.create_svg_element_by_json({
            "element": "ellipse",
            "Attr": {
                "cx": (this.freehand_min_x + this.freehand_max_x ) / 2,
                "cy": (this.freehand_min_y + this.freehand_max_y ) / 2,
                "rx": (this.freehand_max_x - this.freehand_min_x ) / 2 + "px",
                "ry": (this.freehand_max_y - this.freehand_min_y ) / 2 + "px",
                "id": "ellipse_" + this.obj_num,
                "fill": this.current_draw_element_fill,
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width
                }
        });
        this.obj_num++;
        break;
    case "fhrect":
        this.d_attr = 0 ;

        var element = this.svgdoc.getElementById("path_" + this.obj_num);
        element.parentNode.removeChild(element);

        this.create_svg_element_by_json({
            "element": "rect",
            "Attr": {
                "x": this.freehand_min_x,
                "y": this.freehand_min_y,
                "width": (this.freehand_max_x - this.freehand_min_x ) + "px",
                "height": (this.freehand_max_y - this.freehand_min_y ) + "px",
                "id": "rect_" + this.obj_num,
                "fill": this.current_draw_element_fill,
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width
                }
        });
        this.obj_num = obj_num + 1 ;
        break;
    }

    }

}


this.mouseDown = function(evt)
{

    var x = evt.pageX;
    var y = evt.pageY;

    switch (this.current_draw_element)
    {
    case "select":
        this.signature_started = 1 ;
        this.rect_x = x ;
        this.rect_y = y ;
        this.create_svg_element_by_json({
            "element": "rect",
            "Attr": {
                "x": x,
                "y": y,
                "width": "1px",
                "height": "1px",
                "id": "rect_" + this.obj_num,
                "fill": 'none',
                "stroke": 'black',
                "stroke-width": '1px',
                "stroke-dasharray": "2,2"
                }
        });
        break;
    case "fhellipse":
        this.d_attr = "M" + x + " " + y + " ";
        this.signature_started = 1 ;

        this.create_svg_element_by_json({
            "element": "path",
            "Attr": {
                "d": this.d_attr,
                "id": "path_" + this.obj_num,
                "fill": "none",
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "stroke-opacity": 0.5
                }

        });

        this.freehand_min_x = x ;
        this.freehand_max_x = x ;
        this.freehand_min_y = y ;
        this.freehand_max_y = y ;

    break;
    case "fhrect":
        this.d_attr = "M" + x + " " + y + " ";
        this.signature_started = 1 ;

        this.create_svg_element_by_json({
            "element": "path",
            "Attr": {
                "d": this.d_attr,
                "id": "path_" + this.obj_num,
                "fill": "none",
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "stroke-opacity": 0.5
                }

        });

        this.freehand_min_x = x ;
        this.freehand_max_x = x ;
        this.freehand_min_y = y ;
        this.freehand_max_y = y ;

    break;
    case "path":
        this.d_attr = "M" + x + " " + y + " ";
        this.signature_started = 1 ;

        this.create_svg_element_by_json({
            "element": "path",
            "Attr": {
                "d": this.d_attr,
                "id": "path_" + this.obj_num,
                "fill": "none",
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "stroke-opacity": 0.5
                }

        });

    break;
    case "square":
    case "rect":
        this.signature_started = 1 ;
        this.rect_x = x ;
        this.rect_y = y ;
        create_svg_element_by_json({
            "element": "rect",
            "Attr": {
                "x": x,
                "y": y,
                "width": "1px",
                "height": "1px",
                "id": "rect_" + this.obj_num,
                "fill": this.current_draw_element_fill,
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "fill-opacity": 0.5,
                "stroke-opacity": 0.5
                }

        });
        break;
    case "line":
        this.signature_started = 1 ;

        this.create_svg_element_by_json({
            "element": "line",
            "Attr":    {
                "x1": this.x,
                "y1": this.y,
                "x2": this.x + 1 + "px",
                "y2": this.y + 1 + "px",
                "id": "line_" + this.obj_num,
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "stroke-opacity": 0.5
                }

        });
        break;
    case "circle":
    case "ellipse":
        this.signature_started = 1 ;
        this.create_svg_element_by_json({
            "element": "ellipse",
            "Attr": {
                "cx": x,
                "cy": y,
                "rx": 1 + "px",
                "ry": 1 + "px",
                "id": "ellipse_" + this.obj_num,
                "fill": this.current_draw_element_fill,
                "stroke": this.current_draw_element_stroke,
                "stroke-width": this.current_draw_element_stroke_width,
                "fill-opacity": 0.5,
                "stroke-opacity": 0.5
                }
        });
    break;
    case "delete":
        var T=evt.target
        if(this.svgroot == evt.target ) return ;
        T.parentNode.removeChild(T);
    break;
    }


}

this.mouseMove = function(evt)
{
    if (this.signature_started == 1 )
    {
    var x = evt.pageX;
    var y = evt.pageY;


    switch (this.current_draw_element)
    {
    case "path":

        this.d_attr = this.d_attr + "L" + x + " " + y + " ";
        var shape = this.svgdoc.getElementById("path_" + this.obj_num);
        shape.setAttributeNS(null, "d", this.d_attr);
        break;

    case "line":
        var shape = this.svgdoc.getElementById("line_" + this.obj_num);
        shape.setAttributeNS(null, "x2", x);
        shape.setAttributeNS(null, "y2", y);
    break;

    case "square":

        var shape = this.svgdoc.getElementById("rect_" + this.obj_num);
        var size = Math.max( Math.abs(x-this.rect_x) , Math.abs(y-this.rect_y) );

        shape.setAttributeNS(null, "width", this.size);
        shape.setAttributeNS(null, "height", this.size);
        if(rect_x < x ){
            shape.setAttributeNS(null, "x", this.rect_x);
        }else{
            shape.setAttributeNS(null, "x", this.rect_x - size);
        }
        if(rect_y < y ){
            shape.setAttributeNS(null, "y", this.rect_y);
        }else{
            shape.setAttributeNS(null, "y", this.rect_y - size);
        }

    break;
    case "select":
    case "rect":

        var shape = this.svgdoc.getElementById("rect_" + this.obj_num);

        if(rect_x < x ){
            shape.setAttributeNS(null, "x", this.rect_x);
            shape.setAttributeNS(null, "width", x - this.rect_x);
        }else{
            shape.setAttributeNS(null, "x", x);
            shape.setAttributeNS(null, "width", this.rect_x - x);
        }
        if(rect_y < y ){
            shape.setAttributeNS(null, "y", this.rect_y);
            shape.setAttributeNS(null, "height", y - this.rect_y);
        }else{
            shape.setAttributeNS(null, "y", y);
            shape.setAttributeNS(null, "height", this.rect_y - y);
        }

    break;
    case "circle":
        var shape = this.svgdoc.getElementById("ellipse_" + this.obj_num);
        var cx = shape.getAttributeNS(null, "cx");
        var cy = shape.getAttributeNS(null, "cy");
        var rad = Math.sqrt( (x-cx)*(x-cx) + (y-cy)*(y-cy) );

        shape.setAttributeNS(null, "rx", rad);
        shape.setAttributeNS(null, "ry", rad);
    break;
    case "ellipse":
        var shape = this.svgdoc.getElementById("ellipse_" + this.obj_num);
        var cx = shape.getAttributeNS(null, "cx");
        var cy = shape.getAttributeNS(null, "cy");

        shape.setAttributeNS(null, "rx", Math.abs(x-cx));
        shape.setAttributeNS(null, "ry", Math.abs(y-cy));
    break;

    case "fhellipse":
        this.d_attr = this.d_attr + "L" + x + " " + y + " ";
        var shape = this.svgdoc.getElementById("path_" + this.obj_num);
        shape.setAttributeNS(null, "d", this.d_attr);

        this.freehand_min_x = Math.min(x , this.freehand_min_x ) ;
        this.freehand_max_x = Math.max(x , this.freehand_max_x ) ;
        this.freehand_min_y = Math.min(y , this.freehand_min_y ) ;
        this.freehand_max_y = Math.max(y , this.freehand_max_y ) ;
    break;

    case "fhrect":
        this.d_attr = this.d_attr + "L" + x + " " + y + " ";
        var shape = this.svgdoc.getElementById("path_" + this.obj_num);
        shape.setAttributeNS(null, "d", this.d_attr);

        this.freehand_min_x = Math.min(x , this.freehand_min_x ) ;
        this.freehand_max_x = Math.max(x , this.freehand_max_x ) ;
        this.freehand_min_y = Math.min(y , this.freehand_min_y ) ;
        this.freehand_max_y = Math.max(y , this.freehand_max_y ) ;
    break;

    }

    }
}

}
