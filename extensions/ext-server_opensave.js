/*
 * ext-server_opensave.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("server_opensave", {
	callback: function() {

		var save_svg_action = 'extensions/filesave.php';
		var save_png_action = 'extensions/filesave.php';
	
		// Create upload target (hidden iframe)
		var target = $('<iframe name="output_frame" src="#"/>').hide().appendTo('body');
	
		svgEditor.setCustomHandlers({
			save: function(win, data) {
				var svg = "<?xml version='1.0'?>\n" + data;
				
				var title = svgCanvas.getDocumentTitle();
				var filename = title.replace(/[^a-z0-9\.\_\-]+/gi, '_');
				
				var form = $('<form>').attr({
					method: 'post',
					action: save_svg_action,
					target: 'output_frame'
				})	.append('<input type="hidden" name="output_svg" value="' + encodeURI(svg) + '">')
					.append('<input type="hidden" name="filename" value="' + filename + '">')
					.appendTo('body')
					.submit().remove();
			},
			pngsave: function(win, data) {
				var issues = data.issues;
				
				if(!$('#export_canvas').length) {
					$('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
				}
				var c = $('#export_canvas')[0];
				
				c.width = svgCanvas.contentW;
				c.height = svgCanvas.contentH;
				canvg(c, data.svg);
				
				// Timeout to allow canvg to run a bit
				setTimeout(function() {
					var datauri = c.toDataURL('image/png');
					
					var uiStrings = svgEditor.uiStrings;
					var note = '';
					
					// Check if there's issues
					if(issues.length) {
						var pre = "\n \u2022 ";
						note += ("\n\n" + pre + issues.join(pre));
					} 
					
					if(note.length) {
						alert(note);
					}
					
					var title = svgCanvas.getDocumentTitle();
					var filename = title.replace(/[^a-z0-9\.\_\-]+/gi, '_');
					
					var form = $('<form>').attr({
						method: 'post',
						action: save_png_action,
						target: 'output_frame'
					})	.append('<input type="hidden" name="output_png" value="' + datauri + '">')
						.append('<input type="hidden" name="filename" value="' + filename + '">')
						.appendTo('body')
						.submit().remove();
				}, 1000);
	
				
			}
		});
	
		// Do nothing if client support is found
		if(window.FileReader) return;
		
		var cancelled = false;
	
		// Change these to appropriate script file
		var open_svg_action = 'extensions/fileopen.php?type=load_svg';
		var import_svg_action = 'extensions/fileopen.php?type=import_svg';
		var import_img_action = 'extensions/fileopen.php?type=import_img';
		
		// Set up function for PHP uploader to use
		svgEditor.processFile = function(str64, type) {
			if(cancelled) {
				cancelled = false;
				return;
			}
		
			$('#dialog_box').hide();
		
			if(type != 'import_img') {
				var xmlstr = svgCanvas.Utils.decode64(str64);
			}
			
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
				case 'import_img':
					svgCanvas.setGoodImage(str64);
					break;
			}
		}
	
		// Create upload form
		var open_svg_form = $('<form>');
		open_svg_form.attr({
			enctype: 'multipart/form-data',
			method: 'post',
			action: open_svg_action,
			target: 'output_frame'
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
			
			
			function submit() {
				// This submits the form, which returns the file data using svgEditor.uploadSVG
				form.submit();
				
				rebuildInput(form);
				$.process_cancel("Uploading...", function() {
					cancelled = true;
					$('#dialog_box').hide();
				});
			}
			
			if(form[0] == open_svg_form[0]) {
				inp.change(function() {
					// This takes care of the "are you sure" dialog box
					svgEditor.openPrep(function(ok) {
						if(!ok) {
							rebuildInput(form);
							return;
						}
						submit();
					});
				});
			} else {
				inp.change(function() {
					// This submits the form, which returns the file data using svgEditor.uploadSVG
					submit();
				});
			}
		}
		
		// Create the input elements
		rebuildInput(open_svg_form);
		rebuildInput(import_svg_form);
		rebuildInput(import_img_form);

		// Add forms to buttons
		$("#tool_open").show().prepend(open_svg_form);
		$("#tool_import").show().prepend(import_svg_form);
		$("#tool_image").prepend(import_img_form);
	}
});

