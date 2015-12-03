/*globals $, svgEditor, svgedit, svgCanvas, DOMParser*/
/*jslint vars: true, eqeq: true, es5: true, todo: true */
/*
 * ext-imagelib.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("imagelib", function() {'use strict';

	var uiStrings = svgEditor.uiStrings;

	$.extend(uiStrings, {
		imagelib: {
			select_lib: 'Select an image library',
			show_list: 'Show library list',
			import_single: 'Import single',
			import_multi: 'Import multiple',
			open: 'Open as new document'
		}
	});

	var img_libs = [{
			name: 'Demo library (local)',
			url: svgEditor.curConfig.extPath + 'imagelib/index.html',
			description: 'Demonstration library for SVG-edit on this server'
		},
		{
			name: 'IAN Symbol Libraries',
			url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php',
			description: 'Free library of illustrations'
		},
		{
			name: 'Openclipart',
			url: 'https://openclipart.org/svgedit',
			description: 'Share and Use Images. Over 50,000 Public Domain SVG Images and Growing.'
		}
	];

	function closeBrowser() {
		$('#imgbrowse_holder').hide();
	}

	function importImage(url) {
		var newImage = svgCanvas.addSvgElementFromJson({
			"element": "image",
			"attr": {
				"x": 0,
				"y": 0,
				"width": 0,
				"height": 0,
				"id": svgCanvas.getNextId(),
				"style": "pointer-events:inherit"
			}
		});
		svgCanvas.clearSelection();
		svgCanvas.addToSelection([newImage]);
		svgCanvas.setImageURL(url);
	}

	var mode = 's';
	var multi_arr = [];
	var tranfer_stopped = false;
	var pending = {};
	var preview, submit;

	window.addEventListener("message", function(evt) {
		// Receive postMessage data
		var response = evt.data;
		
		if (!response || typeof response !== "string") { // Todo: Should namespace postMessage API for this extension and filter out here
			// Do nothing
			return;
		}
		try { // This block can be removed if embedAPI moves away from a string to an object (if IE9 support not needed)
			var res = JSON.parse(response);
			if (res.namespace) { // Part of embedAPI communications
				return;
			}
		}
		catch (e) {}
		
		var char1 = response.charAt(0);
		var id;
		var svg_str;
		var img_str;
		
		if (char1 != "{" && tranfer_stopped) {
			tranfer_stopped = false;
			return;
		}
		
		if (char1 == '|') {
			var secondpos = response.indexOf('|', 1);
			id = response.substr(1, secondpos-1);
			response = response.substr(secondpos+1);
			char1 = response.charAt(0);
		}
		
		
		// Hide possible transfer dialog box
		$('#dialog_box').hide();
		var entry, cur_meta;
		switch (char1) {
			case '{':
				// Metadata
				tranfer_stopped = false;
				cur_meta = JSON.parse(response);
				
				pending[cur_meta.id] = cur_meta;
				
				var name = (cur_meta.name || 'file');
				
				var message = uiStrings.notification.retrieving.replace('%s', name);
				
				if (mode != 'm') {
					$.process_cancel(message, function() {
						tranfer_stopped = true;
						// Should a message be sent back to the frame?
						
						$('#dialog_box').hide();
					});
				} else {
					entry = $('<div>' + message + '</div>').data('id', cur_meta.id);
					preview.append(entry);
					cur_meta.entry = entry;
				}
				
				return;
			case '<':
				svg_str = true;
				break;
			case 'd':
				if (response.indexOf('data:image/svg+xml') === 0) {
					var pre = 'data:image/svg+xml;base64,';
					var src = response.substring(pre.length);
					response = svgedit.utilities.decode64(src);
					svg_str = true;
					break;
				} else if (response.indexOf('data:image/') === 0) {
					img_str = true;
					break;
				}
				// Else fall through
			default:
				// TODO: See if there's a way to base64 encode the binary data stream
//				var str = 'data:;base64,' + svgedit.utilities.encode64(response, true);
			
				// Assume it's raw image data
//				importImage(str);
			
				// Don't give warning as postMessage may have been used by something else
				if (mode !== 'm') {
					closeBrowser();
				} else {
					pending[id].entry.remove();
				}
//				$.alert('Unexpected data was returned: ' + response, function() {
//					if (mode !== 'm') {
//						closeBrowser();
//					} else {
//						pending[id].entry.remove();
//					}
//				});
				return;
		}
		
		switch (mode) {
			case 's':
				// Import one
				if (svg_str) {
					svgCanvas.importSvgString(response);
				} else if (img_str) {
					importImage(response);
				}
				closeBrowser();
				break;
			case 'm':
				// Import multiple
				multi_arr.push([(svg_str ? 'svg' : 'img'), response]);
				var title;
				cur_meta = pending[id];
				if (svg_str) {
					if (cur_meta && cur_meta.name) {
						title = cur_meta.name;
					} else {
						// Try to find a title
						var xml = new DOMParser().parseFromString(response, 'text/xml').documentElement;
						title = $(xml).children('title').first().text() || '(SVG #' + response.length + ')';
					}
					if (cur_meta) {
						preview.children().each(function() {
							if ($(this).data('id') == id) {
								if (cur_meta.preview_url) {
									$(this).html('<img src="' + cur_meta.preview_url + '">' + title);
								} else {
									$(this).text(title);
								}
								submit.removeAttr('disabled');
							}
						});
					} else {
						preview.append('<div>'+title+'</div>');
						submit.removeAttr('disabled');
					}
				} else {
					if (cur_meta && cur_meta.preview_url) {
						title = cur_meta.name || '';
					}
					if (cur_meta && cur_meta.preview_url) {
						entry = '<img src="' + cur_meta.preview_url + '">' + title;
					} else {
						entry = '<img src="' + response + '">';
					}
				
					if (cur_meta) {
						preview.children().each(function() {
							if ($(this).data('id') == id) {
								$(this).html(entry);
								submit.removeAttr('disabled');
							}
						});
					} else {
						preview.append($('<div>').append(entry));
						submit.removeAttr('disabled');
					}

				}
				break;
			case 'o':
				// Open
				if (!svg_str) {break;}
				svgEditor.openPrep(function(ok) {
					if (!ok) {return;}
					svgCanvas.clear();
					svgCanvas.setSvgString(response);
					// updateCanvas();
				});
				closeBrowser();
				break;
		}
	}, true);

	function toggleMulti(show) {
	
		$('#lib_framewrap, #imglib_opts').css({right: (show ? 200 : 10)});
		if (!preview) {
			preview = $('<div id=imglib_preview>').css({
				position: 'absolute',
				top: 45,
				right: 10,
				width: 180,
				bottom: 45,
				background: '#fff',
				overflow: 'auto'
			}).insertAfter('#lib_framewrap');
			
			submit = $('<button disabled>Import selected</button>')
				.appendTo('#imgbrowse')
				.on("click touchend", function() {
				$.each(multi_arr, function(i) {
					var type = this[0];
					var data = this[1];
					if (type == 'svg') {
						svgCanvas.importSvgString(data);
					} else {
						importImage(data);
					}
					svgCanvas.moveSelectedElements(i*20, i*20, false);
				});
				preview.empty();
				multi_arr = [];
				$('#imgbrowse_holder').hide();
			}).css({
				position: 'absolute',
				bottom: 10,
				right: -10
			});

		}
		
		preview.toggle(show);
		submit.toggle(show);
	}

	function showBrowser() {

		var browser = $('#imgbrowse');
		if (!browser.length) {
			$('<div id=imgbrowse_holder><div id=imgbrowse class=toolbar_button>\
			</div></div>').insertAfter('#svg_docprops');
			browser = $('#imgbrowse');

			var all_libs = uiStrings.imagelib.select_lib;

			var lib_opts = $('<ul id=imglib_opts>').appendTo(browser);
			var frame = $('<iframe/>').prependTo(browser).hide().wrap('<div id=lib_framewrap>');
			
			var header = $('<h1>').prependTo(browser).text(all_libs).css({
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%'
			});
			
			var cancel = $('<button>' + uiStrings.common.cancel + '</button>')
				.appendTo(browser)
				.on("click touchend", function() {
				$('#imgbrowse_holder').hide();
			}).css({
				position: 'absolute',
				top: 5,
				right: -10
			});
			
			var leftBlock = $('<span>').css({position:'absolute',top:5,left:10}).appendTo(browser);
			
			var back = $('<button hidden>' + uiStrings.imagelib.show_list + '</button>')
				.appendTo(leftBlock)
				.on("click touchend", function() {
				frame.attr('src', 'about:blank').hide();
				lib_opts.show();
				header.text(all_libs);
				back.hide();
			}).css({
				'margin-right': 5
			}).hide();
			
			var type = $('<select><option value=s>' + 
			uiStrings.imagelib.import_single + '</option><option value=m>' +
			uiStrings.imagelib.import_multi + '</option><option value=o>' +
			uiStrings.imagelib.open + '</option></select>').appendTo(leftBlock).change(function() {
				mode = $(this).val();
				switch (mode) {
					case 's':
					case 'o':
						toggleMulti(false);
						break;
					
					case 'm':
						// Import multiple
						toggleMulti(true);
						break;
				}
			}).css({
				'margin-top': 10
			});
			
			cancel.prepend($.getSvgIcon('cancel', true));
			back.prepend($.getSvgIcon('tool_imagelib', true));
			
			$.each(img_libs, function(i, opts) {
				$('<li>')
					.appendTo(lib_opts)
					.text(opts.name)
					.on("click touchend", function() {
					frame.attr('src', opts.url).show();
					header.text(opts.name);
					lib_opts.hide();
					back.show();
				}).append('<span>' + opts.description + '</span>');
			});
			
		} else {
			$('#imgbrowse_holder').show();
		}
	}
	
	return {
		svgicons: svgEditor.curConfig.extPath + "ext-imagelib.xml",
		buttons: [{
			id: "tool_imagelib",
			type: "app_menu", // _flyout
			position: 4,
			title: "Image library",
			events: {
				"mouseup": showBrowser
			}
		}],
		callback: function() {
		
			$('<style>').text('\
				#imgbrowse_holder {\
					position: absolute;\
					top: 0;\
					left: 0;\
					width: 100%;\
					height: 100%;\
					background-color: rgba(0, 0, 0, .5);\
					z-index: 5;\
				}\
				\
				#imgbrowse {\
					position: absolute;\
					top: 25px;\
					left: 25px;\
					right: 25px;\
					bottom: 25px;\
					min-width: 300px;\
					min-height: 200px;\
					background: #B0B0B0;\
					border: 1px outset #777;\
				}\
				#imgbrowse h1 {\
					font-size: 20px;\
					margin: .4em;\
					text-align: center;\
				}\
				#lib_framewrap,\
				#imgbrowse > ul {\
					position: absolute;\
					top: 45px;\
					left: 10px;\
					right: 10px;\
					bottom: 10px;\
					background: white;\
					margin: 0;\
					padding: 0;\
				}\
				#imgbrowse > ul {\
					overflow: auto;\
				}\
				#imgbrowse > div {\
					border: 1px solid #666;\
				}\
				#imglib_preview > div {\
					padding: 5px;\
					font-size: 12px;\
				}\
				#imglib_preview img {\
					display: block;\
					margin: 0 auto;\
					max-height: 100px;\
				}\
				#imgbrowse li {\
					list-style: none;\
					padding: .5em;\
					background: #E8E8E8;\
					border-bottom: 1px solid #B0B0B0;\
					line-height: 1.2em;\
					font-style: sans-serif;\
					}\
				#imgbrowse li > span {\
					color: #666;\
					font-size: 15px;\
					display: block;\
					}\
				#imgbrowse li:hover {\
					background: #FFC;\
					cursor: pointer;\
					}\
				#imgbrowse iframe {\
					width: 100%;\
					height: 100%;\
					border: 0;\
				}\
			').appendTo('head');
		}
	};
});

