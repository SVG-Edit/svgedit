/*
 * ext-closepath.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 *
 */

// This extension adds a simple button to the contextual panel for paths
// The button toggles whether the path is open or closed
$(function() {
	svgCanvas.addExtension("ClosePath", function(S) {
		var selElems,
			updateButton = function(path) {
				var seglist = path.pathSegList,
					button = $('#closepath_panel > div.tool_button')[0];
					$(button).html(seglist.getItem(seglist.numberOfItems - 1).pathSegType==1 ? "open":"close");
			},
			showPanel = function(on) {
				$('#closepath_panel').toggle(on);
				if (on) {
					var path = selElems[0];
					if (path) updateButton(path);
				}
			},
		
			toggleClosed = function() {
				var path = selElems[0];
				if (path) {
					var seglist = path.pathSegList,
						last = seglist.numberOfItems - 1;					
					// is closed
					if(seglist.getItem(last).pathSegType == 1) {
						seglist.removeItem(last);
					}
					else {
						seglist.appendItem(path.createSVGPathSegClosePath());
					}
					updateButton(path);
				}
			};
		
		return {
			name: "ClosePath",
			context_tools: [{
				type: "tool_button",
				panel: "closepath_panel",
				title: "Open or Close path",
				id: "close",
				events: { mousedown: toggleClosed }
			}],
			callback: function() {
				$('#closepath_panel').hide();
			},
			selectedChanged: function(opts) {
				selElems = opts.elems;
				var i = selElems.length;
				
				while(i--) {
					var elem = selElems[i];
					if(elem && elem.tagName == 'path') {
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
		};
	});
});
