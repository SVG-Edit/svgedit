/*
 * ext-panning.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Luis Aguirre
 *
 */
 
/* 
	This is a very basic SVG-Edit extension to let tablet/mobile devices panning without problem
*/
 
svgEditor.addExtension("ext-panning", function() {

		return {
			name: "Extension Panning",
			svgicons: "extensions/ext-panning.xml",
			
			buttons: [{
				id: "ext-panning", 
				type: "mode", 
				title: "Panning", 
				events: {
					'click': function() {
						svgCanvas.setMode("ext-panning");
					}
				}
			}],
			mouseDown: function() {
				if(svgCanvas.getMode() == "ext-panning") {
			                svgEditor.setPan(true);	
					return {started: true};
				}
			},
			
			mouseUp: function(opts) {
				if(svgCanvas.getMode() == "ext-panning") {
			                svgEditor.setPan(false);	
				}
			}
		};
});

