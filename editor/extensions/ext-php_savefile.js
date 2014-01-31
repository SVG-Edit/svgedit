/*globals $, svgCanvas, svgEditor*/
/*jslint regexp:true*/
// TODO: Might add support for "exportImage" custom
//   handler as in "ext-server_opensave.js" (and in savefile.php)

svgEditor.addExtension("php_savefile", {
	callback: function() {
		'use strict';
		function getFileNameFromTitle () {
			var title = svgCanvas.getDocumentTitle();
			return $.trim(title); // .replace(/[^a-z0-9\.\_\-]+/gi, '_'); // We could do this more stringent client-side filtering, but we need to do on the server anyways
		}
		var save_svg_action = 'extensions/savefile.php';
		svgEditor.setCustomHandlers({
			save: function(win, data) {
				var svg = "<?xml version=\"1.0\"?>\n" + data,
					filename = getFileNameFromTitle();

				$.post(save_svg_action, {output_svg: svg, filename: filename});
			}
		});
	}
});

this.saveHandler = function(svg) {'use strict';
	$.post("svg-editor-save.php", {svg_data: svg});
};
