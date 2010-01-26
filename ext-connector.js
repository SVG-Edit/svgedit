$(function() {
	svgCanvas.addExtension("Connector", function(vars) {
		
		var svgcontent = vars.content,
			svgroot = vars.root,
			getNextId = vars.getNextId,
			getElem = vars.getElem,
			addElem = vars.addSvgElementFromJson,
			selManager = vars.selectorManager,
			started = false,
			start_x,
			start_y,
			cur_line,
			start_elem,
			end_elem,
			connections = [],
			conn_class = "se_connect",
			connect_str = "-SE_CONNECT-",
			selElems;
			
		var lang_list = {
			"en":[
				{"id": "mode_connect", "title": "Connect two objects" },
				{"id": "conn_arrow_none", "textContent": "No arrow" },
				{"id": "conn_arrow_arrow", "textContent": "Arrow" }
			],
			"fr":[
				{"id": "mode_connect", "title": "Connecter deux objets"},
				{"id": "conn_arrow_none", "textContent": "Sans flèche" },
				{"id": "conn_arrow_arrow", "textContent": "Flèche" }
			]
		};
		
		function showPanel(on) {
			var conn_rules = $('#connector_rules');
			if(!conn_rules.length) {
				conn_rules = $('<style id="connector_rules"><\/style>').appendTo('head');
			} 
			conn_rules.text(!on?"":"#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }");
			$('#connector_panel').toggle(on);
			
			if(on) {
				var has_arrow = selElems[0].getAttribute("marker-mid");
				$("#connector_arrow").val(has_arrow?"arrow":"none");
			}
		}
		
		function setPoint(elem, pos, x, y, setMid) {
			var pts = elem.points;
			var pt = svgroot.createSVGPoint();
			pt.x = x;
			pt.y = y;
			if(pos === 'end') pos = pts.numberOfItems-1;
			// TODO: Test for this on init, then use alt only if needed
			try {
				pts.replaceItem(pt, pos);
			} catch(err) {
				// Should only occur in FF which formats points attr as "n,n n,n", so just split
				var pt_arr = elem.getAttribute("points").split(" ");
				for(var i=0; i< pt_arr.length; i++) {
					if(i == pos) {
						pt_arr[i] = x + ',' + y;
					}
				}
				elem.setAttribute("points",pt_arr.join(" ")); 
			}
			
			if(setMid) {
				// Add center point
				var pt_start = pts.getItem(0);
				var pt_end = pts.getItem(pts.numberOfItems-1);
				setPoint(elem, 1, (pt_end.x + pt_start.x)/2, (pt_end.y + pt_start.y)/2);
			}
		}
		
		function addArrow() {
			var defs = vars.findDefs();
			var m_id = "se_connector_arrow";
			var marker = getElem(m_id);
			
			if(!marker) {
				marker = addElem({
					"element": "marker",
					"attr": {
						"viewBox": "0 0 10 10",
						"id": m_id,
						"refX": 5,
						"refY": 5,
						"markerUnits": "strokeWidth",
						"markerWidth": 16,
						"markerHeight": 14,
						"orient": "auto"
					}
				});
				var arrow = addElem({
					"element": "path",
					"attr": {
						"d": "M0,0 L10,5 L0,10 z",
						"fill": "#000"
					}
				});
				
				marker.appendChild(arrow);
				defs.appendChild(marker);
			}
			
			selElems[0].setAttribute("marker-mid", "url(#" + m_id + ")");
		}

		function remArrow() {
			selElems[0].removeAttribute("marker-mid");
		}
		
		// Init code
		(function() {
			var conn_tools = $('<div id="connector_panel">\
			<label><select id="connector_arrow">\
			<option id="conn_arrow_none" value="none">No arrow</option>\
			<option id="conn_arrow_arrow" value="arrow">Arrow</option>\
			</select></label></div>"').hide().appendTo("#tools_top");
			
			$('#connector_arrow').change(function() {
				switch ( this.value ) {
					case "arrow":
						addArrow();
						break;
					case "none":
						remArrow();
						break;
				}
			});

			vars.extendWhitelist({
				"marker": ["viewBox", "id", "refX", "refY", "markerUnits", "markerWidth", "markerHeight", "orient"],
				"polyline": ["class", "marker-mid"]
			});
		}());
		
		return {
			name: "Connector",
			svgicons: "images/conn.svg",
			buttons: [{
				id: "mode_connect",
				type: "mode",
				icon: "images/cut.png",
				title: "Connect two objects",
				events: {
					'click': function() {
						svgCanvas.setMode("connector");
					}
				}
			}],
			addLangData: function(lang) {
				return {
					data: lang_list[lang]
				};
			},
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
							"element": "polyline",
							"attr": {
								"points": (x+','+y+' '+x+','+y+' '+start_x+','+start_y),
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
					// Set middle point for marker
					setPoint(cur_line, 'end', x, y, true);
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
							var pt_x = conn.start_x + diff_x;
							var pt_y = conn.start_y + diff_y;
							setPoint(line, conn.is_start?0:'end', pt_x, pt_y, true);
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
						setPoint(cur_line, 'end', x, y, true);
						cur_line.id = line_id;
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
				
				while(i--) {
					var elem = selElems[i];
					if(elem && elem.getAttribute('class') == conn_class) {
						selManager.requestSelector(elem).showGrips(false);
						
						if(opts.selectedElement && !opts.multiselected) {
							// TODO: Set up context tools and hide most regular line tools
							showPanel(true);
						} else {
							showPanel(false);
						}
					} else {
						showPanel(false);
					}
				}
			}
		};
	});
});