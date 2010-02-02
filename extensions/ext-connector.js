/*
 * ext-connector.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */
 
$(function() {
	svgCanvas.addExtension("Connector", function(S) {
		var svgcontent = S.content,
			svgroot = S.root,
			getNextId = S.getNextId,
			getElem = S.getElem,
			addElem = S.addSvgElementFromJson,
			selManager = S.selectorManager,
			started = false,
			start_x,
			start_y,
			cur_line,
			start_elem,
			end_elem,
			connections = [],
			conn_sel = ".se_connector",
			se_ns,
// 			connect_str = "-SE_CONNECT-",
			selElems = [];
			
		var lang_list = {
			"en":[
				{"id": "mode_connect", "title": "Connect two objects" }
			],
			"fr":[
				{"id": "mode_connect", "title": "Connecter deux objets"}
			]
		};
		
		function showPanel(on) {
			var conn_rules = $('#connector_rules');
			if(!conn_rules.length) {
				conn_rules = $('<style id="connector_rules"><\/style>').appendTo('head');
			} 
			conn_rules.text(!on?"":"#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }");
			$('#connector_panel').toggle(on);
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
		
		function findConnectors() {
			// Check if selected elements have connections
			var elems = selElems;
			var i = elems.length;
			var connectors = $(svgcontent).find(conn_sel);
			if(!connectors.length) return;
			connections = [];
			
			var sel = ':not(a,g,svg,'+conn_sel+')';
			var all_els = [];
			// Get children from groups
			
			while(i--) {
				var elem = elems[i];
				if(!elem) continue;
				// Get all children that cannot contain children
				var solid_elems = $(elem).find(sel);
				// Include self if okay
				if($(elem).filter(sel).length) {
					solid_elems.push(elem);
				}
				$.merge(all_els, solid_elems);
			}
			
			i = all_els.length;

			if(i > 1) {
				// Multiselected, so unselect connector
				svgCanvas.removeFromSelection($(conn_sel).toArray());
			}
			
			while(i--) {
				var elem = all_els[i];
				if(!elem) continue;
				if($(elem).data('c_start')) continue;
				connectors.each(function() {
					var start = $(this).data("c_start");
					var end = $(this).data("c_end");
					if(start == elem.id || end == elem.id) {
						var bb = svgCanvas.getStrokedBBox([elem]);
						var x = bb.x + bb.width/2;
						var y = bb.y + bb.height/2;
						connections.push({
							elem: elem,
							connector: this,
							is_start: start == elem.id,
							start_x: x,
							start_y: y
						});	
					}
				});
			}
		}
		
		function updateConnectors() {
			// Updates connector lines based on selected elements
			// Is not used on mousemove, as it runs getStrokedBBox every time,
			// which isn't necessary there.
			findConnectors();
			if(connections.length) {
				// Update line with element
				var i = connections.length;
				while(i--) {
					var conn = connections[i];
					var line = conn.connector;
					var elem = conn.elem;
					var bb = svgCanvas.getStrokedBBox([elem]);
					var pt_x = bb.x + bb.width/2;
					var pt_y = bb.y + bb.height/2;
					setPoint(line, conn.is_start?0:'end', pt_x, pt_y, true);
				}
			}
		}
		
		// Do once
		(function() {
			var gse = svgCanvas.groupSelectedElements;
			
			svgCanvas.groupSelectedElements = function() {
				svgCanvas.removeFromSelection($(conn_sel).toArray());
				gse();
			}
			
			var mse = svgCanvas.moveSelectedElements;
			
			svgCanvas.moveSelectedElements = function() {
				svgCanvas.removeFromSelection($(conn_sel).toArray());
				mse.apply(this, arguments);
				updateConnectors();
			}
			
			se_ns = svgCanvas.getEditorNS();
		}());
		
		// Do on reset
		function init() {
			// Make sure all connectors have data set
			$(svgcontent).find('*').each(function() { 
				var conn = this.getAttributeNS(se_ns, "connector");
				if(conn) {
					this.setAttribute('class', conn_sel.substr(1));
					var conn_data = conn.split(' ');
					$(this).data('c_start',conn_data[0])
						.data('c_end',conn_data[1]);
					svgCanvas.getEditorNS(true);
				}
			});
			findConnectors();
		}
		
		return {
			name: "Connector",
			svgicons: "images/conn.svg",
			buttons: [{
				id: "mode_connect",
				type: "mode",
				icon: "images/cut.png",
				title: "Connect two objects",
				key: "Shift+3",
				includeWith: {
					button: '#tool_line',
					isDefault: false,
					position: 1
				},
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
					
					var mouse_target = e.target;
					
					var parents = $(mouse_target).parents();
					
					if($.inArray(svgcontent, parents) != -1) {
						// Connectable element

						start_elem = mouse_target;
						
						// Get center of source element
						var bb = svgCanvas.getStrokedBBox([start_elem]);
						var x = bb.x + bb.width/2;
						var y = bb.y + bb.height/2;
						
						started = true;
						cur_line = addElem({
							"element": "polyline",
							"attr": {
								"id": getNextId(),
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
					findConnectors();
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
						if(elem && $(elem).is(conn_sel)) {
							// Remove the "translate" transform given to move
							svgCanvas.removeFromSelection([elem]);
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
						var start_id = start_elem.id, end_id = end_elem.id;
						var conn_str = start_id + " " + end_id;
						var alt_str = end_id + " " + start_id;
						// Don't create connector if one already exists
						var dupe = $(svgcontent).find(conn_sel).filter(function() {
							var conn = this.getAttributeNS(se_ns, "connector");
							if(conn == conn_str || conn == alt_str) return true;
						});
						if(dupe.length) {
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
						$(cur_line)
							.data("c_start", start_id)
							.data("c_end", end_id);
						se_ns = svgCanvas.getEditorNS(true);
						cur_line.setAttributeNS(se_ns, "se:connector", conn_str);
						cur_line.setAttribute('class', conn_sel.substr(1));
						svgCanvas.addToSelection([cur_line]);
						svgCanvas.moveToBottomSelectedElement();
						selManager.requestSelector(cur_line).showGrips(false);
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
					if(elem && $(elem).data('c_start')) {
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
			},
			elementChanged: function(opts) {
				var elem = opts.elems[0];
				if (elem && elem.tagName == 'svg' && elem.id == "svgcontent") {
					// Update svgcontent (can change on import)
					svgcontent = elem;
					init();
				}
				
				updateConnectors();
			}
		};
	});
});