/*
 * ext-eyedropper.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 *
 */

svgEditor.addExtension("eyedropper", function(S) {
		var svgcontent = S.svgcontent,
			svgns = "http://www.w3.org/2000/svg",
			svgdoc = S.svgroot.parentNode.ownerDocument,
			ChangeElementCommand = svgCanvas.getPrivateMethods().ChangeElementCommand,
			addToHistory = svgCanvas.getPrivateMethods().addCommandToHistory,
			currentStyle = {fillPaint: "red", fillOpacity: 1.0,
							strokePaint: "black", strokeOpacity: 1.0, 
							strokeWidth: 5, strokeDashArray: null,
							opacity: 1.0 };
		
		return {
			name: "eyedropper",
			svgicons: "extensions/eyedropper-icon.xml",
			buttons: [{
				id: "tool_eyedropper",
				type: "mode",
				title: "Eye Dropper Tool",
				events: {
					"click": function() {
						svgCanvas.setMode("eyedropper");
					}
				}
			}],
			
			// if we have selected an element, grab its paint and enable the eye dropper button
			selectedChanged: function(opts) {
				// if we are in eyedropper mode, we don't want to disable the eye-dropper tool
				var mode = svgCanvas.getMode();
				if (mode == "eyedropper") return;

				var elem = null;
				var tool = $('#tool_eyedropper');
				// enable-eye-dropper if one element is selected
				if (opts.elems.length == 1 && opts.elems[0] && 
					$.inArray(opts.elems[0].nodeName, ['svg', 'g', 'use']) == -1) 
				{
					elem = opts.elems[0];
					tool.removeClass('disabled');
					// grab the current style
					currentStyle.fillPaint = elem.getAttribute("fill") || "black";
					currentStyle.fillOpacity = elem.getAttribute("fill-opacity") || 1.0;
					currentStyle.strokePaint = elem.getAttribute("stroke");
					currentStyle.strokeOpacity = elem.getAttribute("stroke-opacity") || 1.0;
					currentStyle.strokeWidth = elem.getAttribute("stroke-width");
					currentStyle.strokeDashArray = elem.getAttribute("stroke-dasharray");
					currentStyle.opacity = elem.getAttribute("opacity") || 1.0;
				}
				// disable eye-dropper tool
				else {
					tool.addClass('disabled');
				}
			},
			
			mouseDown: function(opts) {
				var mode = svgCanvas.getMode();
				if (mode == "eyedropper") {
					var e = opts.event;
					var target = e.target;
					if ($.inArray(target.nodeName, ['svg', 'g', 'use']) == -1) {
						var changes = {};

						var change = function(elem, attrname, newvalue) {
							changes[attrname] = elem.getAttribute(attrname);
							elem.setAttribute(attrname, newvalue);
						};
						
						if (currentStyle.fillPaint) 		change(target, "fill", currentStyle.fillPaint);
						if (currentStyle.fillOpacity) 		change(target, "fill-opacity", currentStyle.fillOpacity);
						if (currentStyle.strokePaint) 		change(target, "stroke", currentStyle.strokePaint);
						if (currentStyle.strokeOpacity) 	change(target, "stroke-opacity", currentStyle.strokeOpacity);
						if (currentStyle.strokeWidth) 		change(target, "stroke-width", currentStyle.strokeWidth);
						if (currentStyle.strokeDashArray) 	change(target, "stroke-dasharray", currentStyle.strokeDashArray);
						if (currentStyle.opacity) 			change(target, "opacity", currentStyle.opacity);
						
						addToHistory(new ChangeElementCommand(target, changes));
					}
				}
			},
		};
});
