$(function() {
	svgCanvas.addExtension("Connector", function(vars) {
		
		var svgcontent = vars.content;
		var getNextId = vars.getNextId;
		var addElem = vars.addSvgElementFromJson;
		var selManager = vars.selectorManager;
		var started = false,
			start_x,
			start_y,
			cur_line,
			start_elem,
			end_elem,
			connections = [],
			conn_class = "se_connect",
			connect_str = "-SE_CONNECT-",
			selElems;
		
		// Init code
// 		(function() {
// 
// 
// 		}());
		
		
		return {
			name: "Connector",
			svgicons: "images/conn.svg",
			buttons: [{
				id: "mode_connect",
				type: "mode",
				icon: "images/cut.png",
				events: {
					'click': function() {
						svgCanvas.setMode("connector");
					}
				}
			}],
			mouseDown: function(opts) {
				var e = opts.event;
				
				start_x = opts.start_x,
				start_y = opts.start_y;
				var mode = svgCanvas.getMode();
				
				if(mode == "connector") {
					
					if(started) return;
					
					if(e.target.parentNode.parentNode == svgcontent) {
						// Connectable element
						start_elem = e.target;
						
						// Get center of source element
						var bb = svgCanvas.getStrokedBBox([start_elem]);
						var x = bb.x + bb.width/2;
						var y = bb.y + bb.height/2;
						
						started = true;
						cur_line = addElem({
							"element": "line",
							"attr": {
								"x1": x,
								"y1": y,
								"x2": start_x,
								"y2": start_y,
								"id": getNextId(),
								"stroke": '#000',
								"stroke-width": 1,
								"fill": "none",
								"opacity": .5,
								"style": "pointer-events:none"
							}
						});
					}
					return {
						started: true
					};
				} else if(mode == "select") {
					
					// Check if selected elements have connections
					var elems = opts.selectedElements;
					var i = elems.length;
					var connectors = $(svgcontent).find("." + conn_class);
					if(!connectors.length) return;
					
					connections = [];
					
					while(i--) {
						var elem = elems[i];
						if(!elem) continue;
						if(elem.getAttribute('class') == conn_class) continue;
						var elem_id = elem.id;
						connectors.each(function() {
							var con_id = this.id;
							if(con_id.indexOf(elem_id) != -1) {
								var is_start = true;
								if(con_id.indexOf(connect_str + elem_id) != -1) {
									// Found connector (selected is end elem)
									is_start = false;
								}
								
								var bb = svgCanvas.getStrokedBBox([elem]);
								var x = bb.x + bb.width/2;
								var y = bb.y + bb.height/2;
								
								connections.push({
									elem: elem,
									connector: this,
									is_start: is_start,
									start_x: x,
									start_y: y
								});	
							}
						});
					}
				}
			},
			mouseMove: function(opts) {
				var zoom = svgCanvas.getZoom();
				var e = opts.event;
				var x = opts.mouse_x/zoom;
				var y = opts.mouse_y/zoom;
				
				var	diff_x = x - start_x,
					diff_y = y - start_y;
									
				var mode = svgCanvas.getMode();
				
				if(mode == "connector" && started) {
					cur_line.setAttributeNS(null, "x2", x);
					cur_line.setAttributeNS(null, "y2", y);
				} else if(mode == "select") {
					var slen = selElems.length;
					
					while(slen--) {
						var elem = selElems[slen];
						// Look for selected connector elements
						if(elem && elem.getAttribute('class') == conn_class) {
							// Remove the "translate" transform given to move
							svgCanvas.getTransformList(elem).clear();
						}
					}
					
					if(connections.length) {
						// Update line with element
						var i = connections.length;
						
						while(i--) {
							var conn = connections[i];
							var line = conn.connector;
							var elem = conn.elem;
							var n = conn.is_start ? 1 : 2;
							line.setAttributeNS(null, "x"+n, conn.start_x + diff_x);
							line.setAttributeNS(null, "y"+n, conn.start_y + diff_y);
						}
					}
				} 
			},
			mouseUp: function(opts) {
				var zoom = svgCanvas.getZoom();
				var e = opts.event,
					x = opts.mouse_x/zoom,
					y = opts.mouse_y/zoom;
				
				if(svgCanvas.getMode() == "connector") {
					if(e.target.parentNode.parentNode != svgcontent) {
						// Not a valid target element, so remove line
						$(cur_line).remove();
						started = false;
						return {
							keep: false,
							element: null,
							started: started
						}
					} else if(e.target == start_elem) {
						// Start line through click
						started = true;
						return {
							keep: true,
							element: null,
							started: started
						}						
					} else {
						// Valid end element
						end_elem = e.target;
						var line_id = start_elem.id + connect_str + end_elem.id;
						var alt_line_id = end_elem.id + connect_str + start_elem.id;
						
						// Don't create connector if one already exists
						if($('#'+line_id + ', #' + alt_line_id).length) {
							$(cur_line).remove();
							return {
								keep: false,
								element: null,
								started: false
							}
						}
						
						var bb = svgCanvas.getStrokedBBox([end_elem]);
						var x = bb.x + bb.width/2;
						var y = bb.y + bb.height/2;
						cur_line.setAttributeNS(null, "x2", x);
						cur_line.setAttributeNS(null, "y2", y);
						cur_line.id = line_id;
						console.log('cur_line',cur_line.id);
						cur_line.setAttribute("class", conn_class);
						svgCanvas.addToSelection([cur_line]);
						svgCanvas.moveToBottomSelectedElement();
						
						started = false;
						return {
							keep: true,
							element: cur_line,
							started: started
						}
					}
				}
			},
			selectedChanged: function(opts) {
				
				// Use this to update the current selected elements
				selElems = opts.elems;
				
				var i = selElems.length;
				
// 				var to_hide = $('#tool_clone, #tool_topath, div.toolset:has(#angle), #line_panel');
				
				while(i--) {
					var elem = selElems[i];
					if(elem && elem.getAttribute('class') == conn_class) {
						selManager.requestSelector(elem).showGrips(false);
						
						if(opts.selectedElement && !opts.multiselected) {
							// TODO: Set up context tools and hide most regular line tools

						}
					} 
				}
			}
		};
	});
});