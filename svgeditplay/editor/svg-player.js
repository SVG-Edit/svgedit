var SVGRoot = null;
var SVGdoc = null;
function Pause()
{
        //svgdoc = document.sv.getSVGDocument();
	//SVGRoot = svgdoc.documentElement;
		
        SVGRoot.pauseAnimations();
        $("#play_button").show();
        $("#pause_button").hide();
}
function Play()
{
        SVGRoot.unpauseAnimations();
        
        $("#play_button").hide();
        $("#pause_button").show();
}

$(document).ready(
	function(){
		
		var svgns = "http://www.w3.org/2000/svg";

		$("#play_button").hide();
		$("#pause_button").show();

		var assignAttributes = function(node, attrs) {
			for (i in attrs) {
				node.setAttribute(i, attrs[i]);
			}
		}
		var addSvgElementFromJson = function(container , data) {
			var shape = SVGdoc.createElementNS(svgns, data.element);
			assignAttributes(shape, data.attr);
			container.appendChild(shape);
			if(data.element=="svg"){SVGRoot=shape;}
		}
		
		
		$.get("server/SavedImage.svg", function(xmldata){
		    //alert("Data Loaded: " + xmldata);
			SVGdoc  = document.getElementById("svg_player").ownerDocument;
			
			addSvgElementFromJson(
				document.getElementById("svg_player"),
				{
					"element": "svg",
					"attr": {
						"width": 640,
						"height": 480,
						"id": "svgroot",
						"xmlns": "http://www.w3.org/2000/svg",
						"xlink": "http://www.w3.org/1999/xlink"
						}
				}
			);
			
			var AllChilds = xmldata.childNodes[1].childNodes;

			for(var i=0;i<AllChilds.length;i++){
				if(AllChilds[i].nodeType!=1){}else{


					var start_time = AllChilds[i].getAttribute("start-dur");
					var end_time = AllChilds[i].getAttribute("end-dur");
					AllChilds[i].setAttributeNS(null,"display","none");

					addSvgElementFromJson(
						AllChilds[i],
						{
							"element": "animate",
							"attr": {
								"attributeName": "display",
								"values": "inline",
								"dur": (end_time - start_time )+"ms",
								"fill": "freeze",
								"xlink": "http://www.w3.org/1999/xlink",
								"begin": start_time + "ms"
								}
						}
					);
			
					switch (AllChilds[i].nodeName){
					case "rect":
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "height",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": 0,
									"to":	AllChilds[i].getAttribute("height"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
						
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "width",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": 0,
									"to":	AllChilds[i].getAttribute("width"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
					break
					case "circle":
					
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "r",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": 0,
									"to":	AllChilds[i].getAttribute("r"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
						
					break
					case "line":
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "x2",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": AllChilds[i].getAttribute("x1"),
									"to":	AllChilds[i].getAttribute("x2"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "y2",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": AllChilds[i].getAttribute("y1"),
									"to":	AllChilds[i].getAttribute("y2"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
						
					break
					case "ellipse":
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "rx",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": 0,
									"to":	AllChilds[i].getAttribute("rx"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						
						addSvgElementFromJson(
							AllChilds[i],
							{
								"element": "animate",
								"attr": {
									"attributeName": "ry",
									"attributeType": "XML",
									"dur": (end_time - start_time )+"ms",
									"fill": "freeze",
									"from": 0,
									"to":	AllChilds[i].getAttribute("ry"),
									"xlink": "http://www.w3.org/1999/xlink",
									"begin": start_time + "ms"
									}
							}
						);
						


					break
					case "path":
						
					break
					default:
					
					}
				document.getElementById("svgroot").appendChild(AllChilds[i]);

				}
			}
			
		});
	}

);

