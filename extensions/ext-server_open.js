/*
 * ext-server_open.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */
 
svgEditor.addExtension("server_open", {
	callback: function() {
		// Do nothing if client support is found
		if(window.FileReader) return;
	
		// Change these to appropriate script file
		var open_svg_action = 'extensions/fileopen.php?type=load_svg';
		var import_svg_action = 'extensions/fileopen.php?type=import_svg';
		var import_img_action = 'extensions/fileopen.php?type=import_img';
		
		// Set up function for PHP uploader to use
		svgEditor.processFile = function(str64, type) {
			var xmlstr = svgCanvas.Utils.decode64(str64);
			
			switch ( type ) {
				case 'load_svg':
					svgCanvas.clear();
					svgCanvas.setSvgString(xmlstr);
					svgEditor.updateCanvas();
					break;
				case 'import_svg':
					svgCanvas.importSvgString(xmlstr);
					svgEditor.updateCanvas();					
					break;
			}
		}
	
		// Create upload form
		var open_svg_form = $('<form>');
		open_svg_form.attr({
			enctype: 'multipart/form-data',
			method: 'post',
			action: open_svg_action,
			target: 'upload_target'
		});
		
		// Create import form
		var import_svg_form = open_svg_form.clone().attr('action', import_svg_action);
		
		// Create image form
		var import_img_form = open_svg_form.clone().attr('action', import_img_action);
		
		// It appears necessory to rebuild this input every time a file is 
		// selected so the same file can be picked and the change event can fire.
		function rebuildInput(form) {
			form.empty();
			var inp = $('<input type="file" name="svg_file">').appendTo(form);
			
			if(form[0] == open_svg_form[0]) {
				inp.change(function() {
					// This takes care of the "are you sure" dialog box
					svgEditor.openPrep(function(ok) {
						if(!ok) {
							rebuildInput(form);
							return;
						}
						// This submits the form, which returns the file data using svgEditor.uploadSVG
						form.submit();
						
						rebuildInput(form);
					});
				});
			} else {
				inp.change(function() {
					// This submits the form, which returns the file data using svgEditor.uploadSVG
					form.submit();
					rebuildInput(form);
				});
			}
		}
		
		// Create the input elements
		rebuildInput(open_svg_form);
		rebuildInput(import_svg_form);
		rebuildInput(import_img_form);

		// Create upload target (hidden iframe)
		var target = $('<iframe name="upload_target" src="#"/>').hide().appendTo('body');
		
		// Add forms to buttons
		$("#tool_open").show().prepend(open_svg_form);
		$("#tool_import").show().prepend(import_svg_form);
	}
});

