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
				{"id": "arrow_none", "textContent": "No arrow" },
				{"id": "arrow_arrow", "textContent": "Arrow" }
			],
			"fr":[
				{"id": "arrow_none", "textContent": "Sans flèche" },
				{"id": "arrow_arrow", "textContent": "Flèche" }
			]
		};
		
	
		function showPanel(on) {
			$('#arrow_panel').toggle(on);
			
			if(on) {
				var has_arrow = selElems[0].getAttribute("marker-mid");
				$("#arrow_list").val(has_arrow?"arrow":"none");
			}
		}
		
		function addArrow() {
			var defs = S.findDefs();
			var m_id = "se_arrow";
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
						"markerWidth": 5,
						"markerHeight": 5,
						"orient": "auto"
					}
				});
				var arrow = addElem({
					"element": "path",
					"attr": {
						"d": "m0,0l10,5l-10,5l5,-5l-5,-5z",
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
			var conn_tools = $('<div id="arrow_panel">\
			<label><select id="arrow_list">\
			<option id="arrow_none" value="none">No arrow</option>\
			<option id="arrow_arrow" value="arrow">Arrow</option>\
			</select></label></div>"').hide().appendTo("#tools_top");
			$('#arrow_list').change(function() {
				switch ( this.value ) {
					case "arrow":
						addArrow();
						break;
					case "none":
						remArrow();
						break;
				}
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