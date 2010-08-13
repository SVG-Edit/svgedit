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
svgEditor.addExtension("ClosePath", function(S) {
		var selElems,
			updateButton = function(path) {
				var seglist = path.pathSegList,
					closed = seglist.getItem(seglist.numberOfItems - 1).pathSegType==1,
					showbutton = closed ? '#tool_openpath' : '#tool_closepath',
					hidebutton = closed ? '#tool_closepath' : '#tool_openpath';
					$(hidebutton).hide();
					$(showbutton).show();
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
			svgicons: "extensions/closepath_icons.svg",
			buttons: [{
				id: "tool_openpath",
				type: "context",
				panel: "closepath_panel",
				title: "Open path",
				events: {
					'click': function() {
						toggleClosed();
					}
				}
			},
			{
				id: "tool_closepath",
				type: "context",
				panel: "closepath_panel",
				title: "Close path",
				events: {
					'click': function() {
						toggleClosed();
					}
				}
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
			}
		};
});
