this.saveHandler = function(svg) {
	$.post("svg-editor-save.php", { svg_data: escape(svg) } );
});
