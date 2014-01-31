/*globals $*/
this.saveHandler = function(svg) {'use strict';
	$.post("svg-editor-save.php", {svg_data: encodeURIComponent(svg)});
};
