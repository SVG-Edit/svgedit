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

svgEditor.addExtension('ext-panning', function() {
	return {
		name: 'Extension Panning',
		svgicons: 'extensions/ext-panning.xml',
		buttons: [{
			id: 'ext-panning',
			type: 'mode',
			title: 'Panning',
			events: {
				click: function() {
					svgCanvas.setMode('ext-panning');
				}
			}
		}],
		mouseDown: function() {
			if(svgCanvas.getMode() == 'ext-panning') {
				svgEditor.setPanning(true);
				return {started: true};
			}
		},
		mouseUp: function() {
			if(svgCanvas.getMode() == 'ext-panning') {
				svgEditor.setPanning(false);
				return {
					keep: false,
					element: null
				};
			}
		}
	};
});
