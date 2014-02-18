/*globals svgEditor, svgedit, svgCanvas, canvg, $*/
/*jslint eqeq: true*/
/*
 * ext-server_opensave.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("server_opensave", {
	callback: function() {
		'use strict';
		function getFileNameFromTitle () {
			var title = svgCanvas.getDocumentTitle();
			// We convert (to underscore) only those disallowed Win7 file name characters
			return $.trim(title).replace(/[\/\\:*?"<>|]/g, '_');
		}
		function xhtmlEscape(str) {
			return str.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); // < is actually disallowed above anyways
		}
		function clientDownloadSupport (filename, suffix, uri) {
			var a,
				support = $('<a>')[0].download === '';
			if (support) {
				a = $('<a>hidden</a>').attr({download: (filename || 'image') + suffix, href: uri}).css('display', 'none').appendTo('body');
				a[0].click();
				return true;
			}
		}
		var open_svg_action, import_svg_action, import_img_action,
			open_svg_form, import_svg_form, import_img_form,
			save_svg_action = svgEditor.curConfig.extPath + 'filesave.php',
			save_img_action = svgEditor.curConfig.extPath + 'filesave.php',
			// Create upload target (hidden iframe)
			cancelled = false;
	
		$('<iframe name="output_frame" src="#"/>').hide().appendTo('body');
		svgEditor.setCustomHandlers({
			save: function(win, data) {
				var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + data, // Firefox doesn't seem to know it is UTF-8 (no matter whether we use or skip the clientDownload code) despite the Content-Disposition header containing UTF-8, but adding the encoding works
					filename = getFileNameFromTitle();

				if (clientDownloadSupport(filename, '.svg', 'data:image/svg+xml;charset=UTF-8;base64,' + svgedit.utilities.encode64(svg))) {
					return;
				}

				$('<form>').attr({
					method: 'post',
					action: save_svg_action,
					target: 'output_frame'
				}).append('<input type="hidden" name="output_svg" value="' + xhtmlEscape(svg) + '">')
					.append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">')
					.appendTo('body')
					.submit().remove();
			},
			exportImage: function(win, data) {
				var c,
					issues = data.issues,
					mimeType = data.mimeType,
					quality = data.quality;
				
				if(!$('#export_canvas').length) {
					$('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
				}
				c = $('#export_canvas')[0];
				
				c.width = svgCanvas.contentW;
				c.height = svgCanvas.contentH;
				canvg(c, data.svg, {renderCallback: function() {
					var pre, filename, suffix,
						datauri = quality ? c.toDataURL(mimeType, quality) : c.toDataURL(mimeType),
						// uiStrings = svgEditor.uiStrings,
						note = '';
					
					// Check if there are issues
					if (issues.length) {
						pre = "\n \u2022 ";
						note += ("\n\n" + pre + issues.join(pre));
					} 
					
					if(note.length) {
						alert(note);
					}
					
					filename = getFileNameFromTitle();
					suffix = '.' + data.type.toLowerCase();
					
					if (clientDownloadSupport(filename, suffix, datauri)) {
						return;
					}

					$('<form>').attr({
						method: 'post',
						action: save_img_action,
						target: 'output_frame'
					}).append('<input type="hidden" name="output_img" value="' + datauri + '">')
						.append('<input type="hidden" name="mime" value="' + mimeType + '">')
						.append('<input type="hidden" name="filename" value="' + xhtmlEscape(filename) + '">')
						.appendTo('body')
						.submit().remove();
				}});
	
				
			}
		});

		// Do nothing if client support is found
		if (window.FileReader) {return;}
		
		// Change these to appropriate script file
		open_svg_action = svgEditor.curConfig.extPath + 'fileopen.php?type=load_svg';
		import_svg_action = svgEditor.curConfig.extPath + 'fileopen.php?type=import_svg';
		import_img_action = svgEditor.curConfig.extPath + 'fileopen.php?type=import_img';
		
		// Set up function for PHP uploader to use
		svgEditor.processFile = function(str64, type) {
			var xmlstr;
			if (cancelled) {
				cancelled = false;
				return;
			}
		
			$('#dialog_box').hide();

			if (type !== 'import_img') {
				xmlstr = svgedit.utilities.decode64(str64);
			}
			
			switch (type) {
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
		};
	
		// Create upload form
		open_svg_form = $('<form>');
		open_svg_form.attr({
			enctype: 'multipart/form-data',
			method: 'post',
			action: open_svg_action,
			target: 'output_frame'
		});
		
		// Create import form
		import_svg_form = open_svg_form.clone().attr('action', import_svg_action);

		// Create image form
		import_img_form = open_svg_form.clone().attr('action', import_img_action);
		
		// It appears necessary to rebuild this input every time a file is 
		// selected so the same file can be picked and the change event can fire.
		function rebuildInput(form) {
			form.empty();
			var inp = $('<input type="file" name="svg_file">').appendTo(form);
			
			
			function submit() {
				// This submits the form, which returns the file data using svgEditor.processFile()
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
					// This submits the form, which returns the file data using svgEditor.processFile()
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

