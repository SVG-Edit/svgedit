/*globals $, svgCanvas, svgEditor*/
/*jslint regexp:true*/
// TODO: Might add support for "exportImage" custom
//   handler as in "ext-server_opensave.js" (and in savefile.php)

svgEditor.addExtension("php_savefile", {
	callback: function() {
		'use strict';
		function getFileNameFromTitle () {
			var title = svgCanvas.getDocumentTitle();
			return $.trim(title);
		}
		var save_svg_action = svgEditor.curConfig.extPath + 'savefile.php';
		svgEditor.setCustomHandlers({
			save: function(win, data) {
				var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data,
					filename = getFileNameFromTitle();

				$.post(save_svg_action, {output_svg: svg, filename: filename});
			}
		});
	}
});
