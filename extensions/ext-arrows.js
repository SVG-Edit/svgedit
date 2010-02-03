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
		var svgcontent = S.content,
			getElem = S.getElem,
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
				var has_arrow = selElems[0].getAttribute("marker-end");
				$("#arrow_list").val(has_arrow?"arrow":"none");
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
			var marker = getElem(id);

			var pathdata = {
				se_arrow_fw: {d:"m0,0l10,5l-10,5l5,-5l-5,-5z", refx:10},
				se_arrow_bk: {d:"m10,0l-10,5l10,5l-5,-5l5,-5z", refx:0}
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
		
		function setArrow(type) {
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
				selElems[0].setAttribute("marker-start", "url(#" + bk_id + ")");
				type = "end";
				id = fw_id;
			} else if (type == "start") {
				id = bk_id;
			}
			
			addMarker(id, type);
			selElems[0].setAttribute("marker-"+type, "url(#" + id + ")");			


			

		}
		
		// Init code
		(function() {
			var conn_tools = $('<div id="arrow_panel">\
			<label><select id="arrow_list">\
			<option value="none">No arrow</option>\
			<option value="end">----&gt;</option>\
			<option value="start">&lt;----</option>\
			<option value="both">&lt;---&gt;</option>\
			<option value="mid">--&gt;--</option>\
			<option value="mid_bk">--&lt;--</option>\
			</select></label></div>"').hide().appendTo("#tools_top");
			$('#arrow_list').change(function() {
				setArrow(this.value);
			});
		}());
		
		return {
			name: "Arrows",
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
			}
		};
	});
});