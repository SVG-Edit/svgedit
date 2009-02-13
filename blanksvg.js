	SVGDocument = null;
	SVGRoot = null;
	var svgns = "http://www.w3.org/2000/svg";
	
	top.clear_svg = SVGclear_svg ;
	top.set_draw_mode = SVGset_draw_mode ;
	top.submit_svg = SVGsubmit_svg ;
	top.set_stroke_color = SVGset_stroke_color;
	top.set_fill_color = SVGset_fill_color;
	top.set_stroke_width = SVGset_stroke_width ;

	
	var d_attr = "" ;
	var signature_started = 0 ;
	var path_elememt = 0 ;
	var path_num = 1 ;
	var rect_num = 1 ;
	var line_num = 1 ;
	var ellipse_num = 1 ;
	var rect_x = null ;
	var rect_y = null ;
	var current_draw_element = "path" ;
	var current_draw_element_fill = "none" ;
	var current_draw_element_stroke_width = "1px" ;
	var current_draw_element_stroke = "black" ;
	var freehandcircle_min_x = null ;	
	var freehandcircle_max_x = null ;
	var freehandcircle_min_y = null ;
	var freehandcircle_max_y = null ;


function SVGset_draw_mode(ele_name) {
	current_draw_element = ele_name;
}



function SVGset_stroke_color(col_hex){
	current_draw_element_stroke = col_hex;
}
		
function SVGset_fill_color(col_hex){
	current_draw_element_fill = col_hex;
}

function SVGset_stroke_width(val){
	current_draw_element_stroke_width = val;
}

function Initialize(LoadEvent)
{
	SVGDocument = LoadEvent.target.ownerDocument;
	SVGRoot = SVGDocument.documentElement ;
	var Attr={
		"onmouseup":"fun_mouseUP(evt)",
		"onmousedown":"fun_mouseDOWN(evt)",
		"onmousemove":"fun_mouseMOVE(evt)"
	}
	assignAttr(SVGRoot,Attr);
}



function fun_mouseUP(evt)
{

	
   if (signature_started == 1 )
   {
	signature_started = 0 ;

	switch (current_draw_element)
	{
	case "path":
		d_attr = 0 ;
		path_num = path_num + 1 ;
		break
	case "rect":
		rect_num = rect_num + 1 ;
		break
	case "line":
		line_num = line_num + 1 ;
		break
	case "ellipse":
		ellipse_num = ellipse_num + 1 ;
		break
	case "freehandcircle":
		d_attr = 0 ;
				
		var element = SVGDocument.getElementById("path_" + path_num);
		element.parentNode.removeChild(element); 
		
		create_svg_element_by_json({
			"element": "ellipse",
			"Attr": {
				"cx": (freehandcircle_min_x + freehandcircle_max_x ) / 2,
				"cy": (freehandcircle_min_y + freehandcircle_max_y ) / 2,
				"rx": (freehandcircle_max_x - freehandcircle_min_x ) / 2 + "px",
				"ry": (freehandcircle_max_y - freehandcircle_min_y ) / 2 + "px",
				"id": "ellipse_" + ellipse_num,
				"fill": current_draw_element_fill,
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		});
		ellipse_num = ellipse_num + 1 ;
		break;
	}//switch

    }//if

}//function


function fun_mouseDOWN(evt)
{
	
	var x = evt.pageX;
	var y = evt.pageY;

	switch (current_draw_element)
	{
	case "freehandcircle":
		d_attr = "M" + x + " " + y + " ";
		signature_started = 1 ;

		create_svg_element_by_json({
			"element": "path",
			"Attr": {
				"d": d_attr,
				"id": "path_" + path_num,
				"fill": "none",
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		
		});
		
		freehandcircle_min_x = x ;	
		freehandcircle_max_x = x ;
		freehandcircle_min_y = y ;
		freehandcircle_max_y = y ;	
		
	break
	case "path":
		d_attr = "M" + x + " " + y + " ";
		signature_started = 1 ;
		
		create_svg_element_by_json({
			"element": "path",
			"Attr": {
				"d": d_attr,
				"id": "path_" + path_num,
				"fill": "none",
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		
		});
		
	break
	case "rect":
		signature_started = 1 ;
		rect_x = x ;
		rect_y = y ;
		create_svg_element_by_json({
			"element": "rect",
			"Attr": {
				"x": x,
				"y": y,
				"width": "1px",
				"height": "1px",
				"id": "rect_" + rect_num,
				"fill": current_draw_element_fill,
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		
		});
		break
	case "line":
		signature_started = 1 ;

		create_svg_element_by_json({
			"element": "line",
			"Attr":	{
				"x1": x,
				"y1": y,
				"x2": x + 1 + "px",
				"y2": y + 1 + "px",
				"id": "line_" + line_num,
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		
		});
		break
	case "ellipse":
		signature_started = 1 ;
		create_svg_element_by_json({
			"element": "ellipse",
			"Attr": {
				"cx": x,
				"cy": y,
				"rx": 1 + "px",
				"ry": 1 + "px",
				"id": "ellipse_" + ellipse_num,
				"fill": current_draw_element_fill,
				"stroke": current_draw_element_stroke,
				"stroke-width": current_draw_element_stroke_width
				}
		});
	break
	case "delete":
		var T=evt.target
		if(SVGRoot == evt.target ) return ;
		T.parentNode.removeChild(T);
	break;
	}//switch

	
}

function fun_mouseMOVE(evt)
{
	if (signature_started == 1 )
	{
	var x = evt.pageX;
	var y = evt.pageY;


	switch (current_draw_element)
	{
	case "path":

		d_attr = d_attr + "L" + x + " " + y + " ";
		var shape = SVGDocument.getElementById("path_" + path_num);
		shape.setAttributeNS(null, "d", d_attr);
		break

	case "rect":

		var shape = SVGDocument.getElementById("rect_" + rect_num);
		var start_x = shape.getAttributeNS(null, "x");
		var start_y = shape.getAttributeNS(null, "y");

		if(rect_x < x ){
			shape.setAttributeNS(null, "x", rect_x);
			shape.setAttributeNS(null, "width", x - rect_x);
		}else{
			shape.setAttributeNS(null, "x", x);
			shape.setAttributeNS(null, "width", rect_x - x);
		}
		if(rect_y < y ){
			shape.setAttributeNS(null, "y", rect_y);
			shape.setAttributeNS(null, "height", y - rect_y);
		}else{
			shape.setAttributeNS(null, "y", y);
			shape.setAttributeNS(null, "height", rect_y - y);
		}
					
	break
	case "line":
		var shape = SVGDocument.getElementById("line_" + line_num);
		shape.setAttributeNS(null, "x2", x);
		shape.setAttributeNS(null, "y2", y);
	break
	case "ellipse":
		var shape = SVGDocument.getElementById("ellipse_" + ellipse_num);
		var cx = shape.getAttributeNS(null, "cx");
		var cy = shape.getAttributeNS(null, "cy");
		var rad = Math.sqrt( (x-cx)*(x-cx) + (y-cy)*(y-cy) );
		
		shape.setAttributeNS(null, "rx", rad);
		shape.setAttributeNS(null, "ry", rad);
	break;

	case "freehandcircle":
		d_attr = d_attr + "L" + x + " " + y + " ";
		var shape = SVGDocument.getElementById("path_" + path_num);
		shape.setAttributeNS(null, "d", d_attr);

		freehandcircle_min_x = min_of(x , freehandcircle_min_x ) ;	
		freehandcircle_max_x = max_of(x , freehandcircle_max_x ) ;	
		freehandcircle_min_y = min_of(y , freehandcircle_min_y ) ;	
		freehandcircle_max_y = max_of(y , freehandcircle_max_y ) ;	
	break;
		
	}//switch

	}//if
}//function



function min_of(a ,b){
	if (a < b ) { return a ;}
	else {return b ;}
}
function max_of(a ,b){
	if (a > b ) { return a ;}
	else {return b ;}
}


function create_svg_element_by_json(data)
{
	var shape = SVGDocument.createElementNS(svgns, data.element);
	assignAttr(shape, data.Attr);
	SVGDocument.documentElement.appendChild(shape);
	
}//function
function assignAttr(Node,Attr){
	for (i in Attr) {
		Node.setAttributeNS(null, i, Attr[i]);
	}
}//function
	   

function SVGclear_svg()
{
	for(var i=1; i<path_num; i++){
	var element = SVGDocument.getElementById("path_" + i);
	if(element != null ) { element.parentNode.removeChild(element); } 

	}
	path_num = 1 ;
}

	
	function SvgToString(elem , indent)
	{
	var out = "" ;
	   if (elem)
	   {
	      var attrs = elem.attributes;
	      var attr;
	      var i;
	      var childs = elem.childNodes;

	      for (i=0; i<indent; i++) out += "  ";
	      out += "<" + elem.nodeName;
	

	      for (i=attrs.length-1; i>=0; i--)
	      {
	         attr = attrs.item(i);
	         out += " " + attr.nodeName + "=\"" + attr.nodeValue+ "\"";
	      }


	
	      if (elem.hasChildNodes())
	      {
	         out += ">\n";
	         indent++;
	         for (i=0; i<childs.length; i++)
	         {
	            if (childs.item(i).nodeType == 1) // element node ..
	               out = out + SvgToString(childs.item(i) ,indent);
	            else if (childs.item(i).nodeType == 3) // text node ..
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
  
function SVGsubmit_svg(){
	var str = "<?xml version=\"1.0\" standalone=\"no\"?> \
	<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \
	\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> \n"
        str = str + SvgToString(SVGRoot , 0);
	top.return_str_to_html(str);
}

