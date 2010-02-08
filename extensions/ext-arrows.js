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
		
		function addMarker(id, type) {
			// TODO: Make marker (or use?) per arrow type, since refX can be different
			var marker = S.getElem(id);

			var pathdata = {
				se_arrow_fw: {d:"m0,0l10,5l-10,5l5,-5l-5,-5z", refx:8},
				se_arrow_bk: {d:"m10,0l-10,5l10,5l-5,-5l5,-5z", refx:2}
			}
			
			var data = pathdata[id];
			
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
						"orient": "auto"
					}
				});
				var arrow = addElem({
					"element": "path",
					"attr": {
						"d": data.d,
						"fill": "#000"
					}
				});
				marker.appendChild(arrow);
				S.findDefs().appendChild(marker);
			} 
			
			marker.setAttribute('refX', data.refx);
		}
		
		function setArrow() {
			var type = this.value;
			resetMarker();
		
			if(type == "none") {
				return;
			}
		
			var fw_id = "se_arrow_fw";
			var bk_id = "se_arrow_bk";
			
			// Set marker on element
			var id = fw_id;
			if(type == "mid_bk") {
				type = "mid";
				id = bk_id;
			} else if(type == "both") {
				addMarker(bk_id, type);
				svgCanvas.changeSelectedAttribute("marker-start", "url(#" + bk_id + ")");
				type = "end";
				id = fw_id;
			} else if (type == "start") {
				id = bk_id;
			}
			
			addMarker(id, type);
			svgCanvas.changeSelectedAttribute("marker-"+type, "url(#" + id + ")");
			S.call("changed", selElems);
		}
		
		function colorChanged(elem) {
			var color = elem.getAttribute('stroke');
			
			var markers = ['start','mid','end'];
			
			$.each(markers, function(i, type) {
				var href = elem.getAttribute('marker-'+type);
				if(href) {
					var marker_id = href.match(/\(\#(.*)\)/)[1];
					var marker = S.getElem(marker_id);
					var shape = marker.firstChild;
					var cur_color = shape.getAttribute('fill');
					console.log(cur_color, color);
					
					
					// If color matches, ignore
					// If color doesn't match, look for marker with shape that does match color
					// - Found? Use its URL!
					// - Not found? Create new one (based on this one) but with new fill
					// (don't remove old marker: removeUnused* can take care of that)
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
