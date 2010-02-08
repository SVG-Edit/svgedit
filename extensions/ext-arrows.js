/*
 * ext-arrows.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

 
$(function() {
	svgCanvas.addExtension("Arrows", function(S) {
		var svgcontent = S.svgcontent,
			addElem = S.addSvgElementFromJson,
			selElems;
			
		var lang_list = {
			"en":[
				{"id": "arrow_none", "textContent": "No arrow" }
			],
			"fr":[
				{"id": "arrow_none", "textContent": "Sans flèche" }
			]
		};
		
		var pathdata = {
			fw: {d:"m0,0l10,5l-10,5l5,-5l-5,-5z", refx:8, id:"se_arrow_fw"},
			bk: {d:"m10,0l-10,5l10,5l-5,-5l5,-5z", refx:2, id:"se_arrow_bk"}
		}
		function getLinked(elem, attr) {
			var str = elem.getAttribute(attr);
			if(!str) return null;
			var m = str.match(/\(\#(.*)\)/);
			if(!m || m.length !== 2) {
				return null;
			}
			return S.getElem(m[1]);
		}
		
		function showPanel(on) {
			$('#arrow_panel').toggle(on);
			
			if(on) {
				var el = selElems[0];
				var end = el.getAttribute("marker-end");
				var start = el.getAttribute("marker-start");
				var mid = el.getAttribute("marker-mid");
				var val;
				
				if(end && start) {
					val = "both";
				} else if(end) {
					val = "end";
				} else if(start) {
					val = "start";
				} else if(mid) {
					val = "mid";
					if(mid.indexOf("bk") != -1) {
						val = "mid_bk";
					}
				}
				
				if(!start && !mid && !end) {
					val = "none";
				}
				
				$("#arrow_list").val(val);
			}
		}
		
		function resetMarker() {
			var el = selElems[0];
			el.removeAttribute("marker-start");
			el.removeAttribute("marker-mid");
			el.removeAttribute("marker-end");
		}
		
		function addMarker(dir, type, id) {
			// TODO: Make marker (or use?) per arrow type, since refX can be different
			id = id || 'se_arrow_' + dir;
			
			var marker = S.getElem(id);

			var data = pathdata[dir];
			
			if(type == "mid") {
				data.refx = 5;
			}

			if(!marker) {
				marker = addElem({
					"element": "marker",
					"attr": {
						"viewBox": "0 0 10 10",
						"id": id,
						"refY": 5,
						"markerUnits": "strokeWidth",
						"markerWidth": 5,
						"markerHeight": 5,
						"orient": "auto",
						"style": "pointer-events:none" // Currently needed for Opera
					}
				});
				var arrow = addElem({
					"element": "path",
					"attr": {
						"d": data.d,
						"fill": "#000000"
					}
				});
				marker.appendChild(arrow);
				S.findDefs().appendChild(marker);
			} 
			
			marker.setAttribute('refX', data.refx);
			
			return marker;
		}
		
		function setArrow() {
			var type = this.value;
			resetMarker();
		
			if(type == "none") {
				return;
			}
		
			// Set marker on element
			var dir = "fw";
			if(type == "mid_bk") {
				type = "mid";
				dir = "bk";
			} else if(type == "both") {
				addMarker("bk", type);
				svgCanvas.changeSelectedAttribute("marker-start", "url(#" + pathdata.bk.id + ")");
				type = "end";
				dir = "fw";
			} else if (type == "start") {
				dir = "bk";
			}
			
			addMarker(dir, type);
			svgCanvas.changeSelectedAttribute("marker-"+type, "url(#" + pathdata[dir].id + ")");
			S.call("changed", selElems);
		}
		
		function colorChanged(elem) {
			var color = elem.getAttribute('stroke');
			
			var mtypes = ['start','mid','end'];
			var defs = S.findDefs();
			
			$.each(mtypes, function(i, type) {
				var marker = getLinked(elem, 'marker-'+type);
				if(!marker) return;
				
				var cur_color = $(marker).children().attr('fill');
				var cur_d = $(marker).children().attr('d');
				var new_marker = null;
				if(cur_color === color) return;
				
				var all_markers = $(defs).find('marker');
				// Different color, check if already made
				all_markers.each(function() {
					var attrs = $(this).children().attr(['fill', 'd']);
					if(attrs.fill === color && attrs.d === cur_d) {
						// Found another marker with this color and this path
						new_marker = this;
					}
				});
				
				if(!new_marker) {
					// Create a new marker with this color
					var last_id = marker.id;
					var dir = last_id.indexOf('_fw') !== -1?'fw':'bk';
					
					new_marker = addMarker(dir, type, 'se_arrow_' + dir + all_markers.length);

					$(new_marker).children().attr('fill', color);
				}
				
				$(elem).attr('marker-'+type, "url(#" + new_marker.id + ")");
				
				// Check if last marker can be removed
				var remove = true;
				$(S.svgcontent).find('line, polyline, path, polygon').each(function() {
					var elem = this;
					$.each(mtypes, function(j, mtype) {
						if($(elem).attr('marker-' + mtype) === "url(#" + marker.id + ")") {
							return remove = false;
						}
					});
					if(!remove) return false;
				});
				
				// Not found, so can safely remove
				if(remove) {
					$(marker).remove();
				}

			});
			
		}
		
		return {
			name: "Arrows",
			context_tools: [{
				type: "select",
				panel: "arrow_panel",
				title: "Select arrow type",
				id: "arrow_list",
				options: {
					none: "No arrow",
					end: "----&gt;",
					start: "&lt;----",
					both: "&lt;---&gt;",
					mid: "--&gt;--",
					mid_bk: "--&lt;--"
				},
				defval: "none",
				events: {
					change: setArrow
				}
			}],
			callback: function() {
				$('#arrow_panel').hide();
			},
			addLangData: function(lang) {
				return {
					data: lang_list[lang]
				};
			},
			selectedChanged: function(opts) {
				
				// Use this to update the current selected elements
				selElems = opts.elems;
				
				var i = selElems.length;
				var marker_elems = ['line','path','polyline','polygon'];
				
				while(i--) {
					var elem = selElems[i];
					if(elem && $.inArray(elem.tagName, marker_elems) != -1) {
						if(opts.selectedElement && !opts.multiselected) {
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
				if(elem && (
					elem.getAttribute("marker-start") ||
					elem.getAttribute("marker-mid") ||
					elem.getAttribute("marker-end")
				)) {
	// 								var start = elem.getAttribute("marker-start");
	// 								var mid = elem.getAttribute("marker-mid");
	// 								var end = elem.getAttribute("marker-end");
					// Has marker, so see if it should match color
					colorChanged(elem);
				}
				
			}
		};
	});
});
