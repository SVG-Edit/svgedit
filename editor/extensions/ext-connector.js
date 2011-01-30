/*
 * ext-connector.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */
 
svgEditor.addExtension("Connector", function(S) {
	var svgcontent = S.svgcontent,
		svgroot = S.svgroot,
		getNextId = S.getNextId,
		getElem = S.getElem,
		addElem = S.addSvgElementFromJson,
		selManager = S.selectorManager,
		curConfig = svgEditor.curConfig,
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
		
	elData = $.data;
		
	var lang_list = {
		"en":[
			{"id": "mode_connect", "title": "Connect two objects" }
		],
		"fr":[
			{"id": "mode_connect", "title": "Connecter deux objets"}
		]
	};
	
	function getOffset(side, line) {
		var give_offset = !!line.getAttribute('marker-' + side);
// 		var give_offset = $(line).data(side+'_off');

		// TODO: Make this number (5) be based on marker width/height
		var size = line.getAttribute('stroke-width') * 5;
		return give_offset ? size : 0;
	}
	
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
	
	function updateLine(diff_x, diff_y) {
		// Update line with element
		var i = connections.length;
		while(i--) {
			var conn = connections[i];
			var line = conn.connector;
			var elem = conn.elem;
			
			var pre = conn.is_start?'start':'end';
// 						var sw = line.getAttribute('stroke-width') * 5;
			
			// Update bbox for this element
			var bb = elData(line, pre+'_bb');
			bb.x = conn.start_x + diff_x;
			bb.y = conn.start_y + diff_y;
			elData(line, pre+'_bb', bb);
			
			var alt_pre = conn.is_start?'end':'start';
			
			// Get center pt of connected element
			var bb2 = elData(line, alt_pre+'_bb');
			var src_x = bb2.x + bb2.width/2;
			var src_y = bb2.y + bb2.height/2;
			
			// Set point of element being moved
			var pt = getBBintersect(src_x, src_y, bb, getOffset(pre, line)); // $(line).data(pre+'_off')?sw:0
			setPoint(line, conn.is_start?0:'end', pt.x, pt.y, true);
			
			// Set point of connected element
			var pt2 = getBBintersect(pt.x, pt.y, elData(line, alt_pre + '_bb'), getOffset(alt_pre, line));
			setPoint(line, conn.is_start?'end':0, pt2.x, pt2.y, true);

		}
	}
	
	function findConnectors(elems) {
		if(!elems) elems = selElems;
		var connectors = $(svgcontent).find(conn_sel);
		connections = [];

		// Loop through connectors to see if one is connected to the element
		connectors.each(function() {
			var start = elData(this, "c_start");
			var end = elData(this, "c_end");
			
			var parts = [getElem(start), getElem(end)];
			for(var i=0; i<2; i++) {
				var c_elem = parts[i];
				var add_this = false;
				// The connected element might be part of a selected group
				$(c_elem).parents().each(function() {
					if($.inArray(this, elems) !== -1) {
						// Pretend this element is selected
						add_this = true;
					}
				});
				
				if(!c_elem || !c_elem.parentNode) {
					$(this).remove();
					continue;
				}
				if($.inArray(c_elem, elems) !== -1 || add_this) {
					var bb = svgCanvas.getStrokedBBox([c_elem]);
					connections.push({
						elem: c_elem,
						connector: this,
						is_start: (i === 0),
						start_x: bb.x,
						start_y: bb.y
					});	
				}
			}
		});
	}
	
	function updateConnectors(elems) {
		// Updates connector lines based on selected elements
		// Is not used on mousemove, as it runs getStrokedBBox every time,
		// which isn't necessary there.
		findConnectors(elems);
		if(connections.length) {
			// Update line with element
			var i = connections.length;
			while(i--) {
				var conn = connections[i];
				var line = conn.connector;
				var elem = conn.elem;

				var sw = line.getAttribute('stroke-width') * 5;
				var pre = conn.is_start?'start':'end';
				
				// Update bbox for this element
				var bb = svgCanvas.getStrokedBBox([elem]);
				bb.x = conn.start_x;
				bb.y = conn.start_y;
				elData(line, pre+'_bb', bb);
				var add_offset = elData(line, pre+'_off');
			
				var alt_pre = conn.is_start?'end':'start';
				
				// Get center pt of connected element
				var bb2 = elData(line, alt_pre+'_bb');
				var src_x = bb2.x + bb2.width/2;
				var src_y = bb2.y + bb2.height/2;
				
				// Set point of element being moved
				var pt = getBBintersect(src_x, src_y, bb, getOffset(pre, line));
				setPoint(line, conn.is_start?0:'end', pt.x, pt.y, true);
				
				// Set point of connected element
				var pt2 = getBBintersect(pt.x, pt.y, elData(line, alt_pre + '_bb'), getOffset(alt_pre, line));
				setPoint(line, conn.is_start?'end':0, pt2.x, pt2.y, true);
				
				// Update points attribute manually for webkit
				if(navigator.userAgent.indexOf('AppleWebKit') != -1) {
					var pts = line.points;
					var len = pts.numberOfItems;
					var pt_arr = Array(len);
					for(var j=0; j< len; j++) {
						var pt = pts.getItem(j);
						pt_arr[j] = pt.x + ',' + pt.y;
					}	
					line.setAttribute("points",pt_arr.join(" ")); 
				}

			}
		}
	}
	
	function getBBintersect(x, y, bb, offset) {
		if(offset) {
			offset -= 0;
			bb = $.extend({}, bb);
			bb.width += offset;
			bb.height += offset;
			bb.x -= offset/2;
			bb.y -= offset/2;
		}
	
		var mid_x = bb.x + bb.width/2;
		var mid_y = bb.y + bb.height/2;
		var len_x = x - mid_x;
		var len_y = y - mid_y;
		
		var slope = Math.abs(len_y/len_x);
		
		var ratio;
		
		if(slope < bb.height/bb.width) {
			ratio = (bb.width/2) / Math.abs(len_x);
		} else {
			ratio = (bb.height/2) / Math.abs(len_y);
		}
		
		
		return {
			x: mid_x + len_x * ratio,
			y: mid_y + len_y * ratio
		}
	}
	
	// Do once
	(function() {
		var gse = svgCanvas.groupSelectedElements;
		
		svgCanvas.groupSelectedElements = function() {
			svgCanvas.removeFromSelection($(conn_sel).toArray());
			return gse.apply(this, arguments);
		}
		
		var mse = svgCanvas.moveSelectedElements;
		
		svgCanvas.moveSelectedElements = function() {
			svgCanvas.removeFromSelection($(conn_sel).toArray());
			var cmd = mse.apply(this, arguments);
			updateConnectors();
			return cmd;
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
				var sbb = svgCanvas.getStrokedBBox([getElem(conn_data[0])]);
				var ebb = svgCanvas.getStrokedBBox([getElem(conn_data[1])]);
				$(this).data('c_start',conn_data[0])
					.data('c_end',conn_data[1])
					.data('start_bb', sbb)
					.data('end_bb', ebb);
				svgCanvas.getEditorNS(true);
			}
		});
// 			updateConnectors();
	}
	
// 		$(svgroot).parent().mousemove(function(e) {
// // 			if(started 
// // 				|| svgCanvas.getMode() != "connector"
// // 				|| e.target.parentNode.parentNode != svgcontent) return;
// 			
// 			console.log('y')
// // 			if(e.target.parentNode.parentNode === svgcontent) {
// // 					
// // 			}
// 		});
	
	return {
		name: "Connector",
		svgicons: "images/conn.svg",
		buttons: [{
			id: "mode_connect",
			type: "mode",
			icon: "images/cut.png",
			title: "Connect two objects",
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
					
					// If child of foreignObject, use parent
					var fo = $(mouse_target).closest("foreignObject");
					start_elem = fo.length ? fo[0] : mouse_target;
					
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
							"stroke": '#' + curConfig.initStroke.color,
							"stroke-width": (!start_elem.stroke_width || start_elem.stroke_width == 0) ? curConfig.initStroke.width : start_elem.stroke_width,
							"fill": "none",
							"opacity": curConfig.initStroke.opacity,
							"style": "pointer-events:none"
						}
					});
					elData(cur_line, 'start_bb', bb);
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
				
				var sw = cur_line.getAttribute('stroke-width') * 3;
				// Set start point (adjusts based on bb)
				var pt = getBBintersect(x, y, elData(cur_line, 'start_bb'), getOffset('start', cur_line));
				start_x = pt.x;
				start_y = pt.y;
				
				setPoint(cur_line, 0, pt.x, pt.y, true);
				
				// Set end point
				setPoint(cur_line, 'end', x, y, true);
			} else if(mode == "select") {
				var slen = selElems.length;
				
				while(slen--) {
					var elem = selElems[slen];
					// Look for selected connector elements
					if(elem && elData(elem, 'c_start')) {
						// Remove the "translate" transform given to move
						svgCanvas.removeFromSelection([elem]);
						svgCanvas.getTransformList(elem).clear();

					}
				}
				if(connections.length) {
					updateLine(diff_x, diff_y);

					
				}
			} 
		},
		mouseUp: function(opts) {
			var zoom = svgCanvas.getZoom();
			var e = opts.event,
				x = opts.mouse_x/zoom,
				y = opts.mouse_y/zoom,
				mouse_target = e.target;
			
			if(svgCanvas.getMode() == "connector") {
				var fo = $(mouse_target).closest("foreignObject");
				if(fo.length) mouse_target = fo[0];
				
				var parents = $(mouse_target).parents();

				if(mouse_target == start_elem) {
					// Start line through click
					started = true;
					return {
						keep: true,
						element: null,
						started: started
					}						
				} else if($.inArray(svgcontent, parents) === -1) {
					// Not a valid target element, so remove line
					$(cur_line).remove();
					started = false;
					return {
						keep: false,
						element: null,
						started: started
					}
				} else {
					// Valid end element
					end_elem = mouse_target;
					
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
					
					var pt = getBBintersect(start_x, start_y, bb, getOffset('start', cur_line));
					setPoint(cur_line, 'end', pt.x, pt.y, true);
					$(cur_line)
						.data("c_start", start_id)
						.data("c_end", end_id)
						.data("end_bb", bb);
					se_ns = svgCanvas.getEditorNS(true);
					cur_line.setAttributeNS(se_ns, "se:connector", conn_str);
					cur_line.setAttribute('class', conn_sel.substr(1));
					cur_line.setAttribute('opacity', 1);
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
			// TODO: Find better way to skip operations if no connectors are in use
			if(!$(svgcontent).find(conn_sel).length) return;
			
			if(svgCanvas.getMode() == 'connector') {
				svgCanvas.setMode('select');
			}
			
			// Use this to update the current selected elements
			selElems = opts.elems;
			
			var i = selElems.length;
			
			while(i--) {
				var elem = selElems[i];
				if(elem && elData(elem, 'c_start')) {
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
			updateConnectors();
		},
		elementChanged: function(opts) {
			var elem = opts.elems[0];
			if (elem && elem.tagName == 'svg' && elem.id == "svgcontent") {
				// Update svgcontent (can change on import)
				svgcontent = elem;
				init();
			}
			
			// Has marker, so change offset
			if(elem && (
				elem.getAttribute("marker-start") ||
				elem.getAttribute("marker-mid") ||
				elem.getAttribute("marker-end")
			)) {
				var start = elem.getAttribute("marker-start");
				var mid = elem.getAttribute("marker-mid");
				var end = elem.getAttribute("marker-end");
				cur_line = elem;
				$(elem)
					.data("start_off", !!start)
					.data("end_off", !!end);
				
				if(elem.tagName == "line" && mid) {
					// Convert to polyline to accept mid-arrow
					
					var x1 = elem.getAttribute('x1')-0;
					var x2 = elem.getAttribute('x2')-0;
					var y1 = elem.getAttribute('y1')-0;
					var y2 = elem.getAttribute('y2')-0;
					var id = elem.id;
					
					var mid_pt = (' '+((x1+x2)/2)+','+((y1+y2)/2) + ' ');
					var pline = addElem({
						"element": "polyline",
						"attr": {
							"points": (x1+','+y1+ mid_pt +x2+','+y2),
							"stroke": elem.getAttribute('stroke'),
							"stroke-width": elem.getAttribute('stroke-width'),
							"marker-mid": mid,
							"fill": "none",
							"opacity": elem.getAttribute('opacity') || 1
						}
					});
					$(elem).after(pline).remove();
					svgCanvas.clearSelection();
					pline.id = id;
					svgCanvas.addToSelection([pline]);
					elem = pline;
				}
			}
			// Update line if it's a connector
			if(elem.getAttribute('class') == conn_sel.substr(1)) {
				var start = getElem(elData(elem, 'c_start'));
				updateConnectors([start]);
			} else {
				updateConnectors();
			}
		},
		toolButtonStateUpdate: function(opts) {
			if(opts.nostroke) {
				if ($('#mode_connect').hasClass('tool_button_current')) {
					clickSelect();
				}
			}
			$('#mode_connect')
				.toggleClass('disabled',opts.nostroke);
		}
	};
});
