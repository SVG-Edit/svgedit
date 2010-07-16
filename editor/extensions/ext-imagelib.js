/*
 * ext-imagelib.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension("imagelib", function() {

	var img_libs = [{
			name: 'Demo library (local)',
			url: 'extensions/imagelib/index.html',
			description: 'Demonstration library for SVG-edit on this server'
		}, 
		{
			name: 'IAN Symbol Libraries',
			url: 'http://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php',
			description: 'Free library of 2300+ illustrations'
		}
	];
	
	var xlinkns = "http://www.w3.org/1999/xlink";

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

	 window.addEventListener("message", function(evt) {
		// Receive postMessage data
		var response = evt.data;
		
		if(!response) {
			$.alert('No data was given', closeBrowser);
			return;
		}
		
		var char1 = response.charAt(0);
		
		switch (char1) {
			case '<':
				svgCanvas.importSvgString(response);
				break;
			case 'd':
				if(response.indexOf('data:image/svg+xml') === 0) {
					var pre = 'data:image/svg+xml;base64,';
					var src = response.substring(pre.length);
					svgCanvas.importSvgString(svgCanvas.Utils.decode64(src));
					break;
				} else if(response.indexOf('data:image/') === 0) {
					
					importImage(response);
					break;
				}
				// Else fall through
			default:
				// TODO: See if there's a way to base64 encode the binary data stream
// 				var str = 'data:;base64,' + svgCanvas.Utils.encode64(response, true);
			
				// Assume it's raw image data
// 				importImage(str);
			
				$.alert('Unexpected data was returned: ' + response, closeBrowser);
				return;
		}
		
		closeBrowser();
		
	}, true);
	

	function showBrowser() {
		var browser = $('#imgbrowse');
		if(!browser.length) {
			$('<div id=imgbrowse_holder><div id=imgbrowse>\
			</div></div>').insertAfter('#svg_docprops');
			browser = $('#imgbrowse');

			var all_libs = 'Select an image library';

			var lib_opts = $('<ul id=imglib_opts>').appendTo(browser);
			var frame = $('<iframe/>').prependTo(browser).hide().wrap('<div>');
			
			var header = $('<h1>').prependTo(browser).text(all_libs);
			
			var cancel = $('<input type=button value=Cancel>').appendTo(browser).click(function() {
				$('#imgbrowse_holder').hide();
			}).css({
				position: 'absolute',
				top: 5,
				right: 5
			});

			var back = $('<input type=button value="Show libraries">').appendTo(browser).click(function() {
				frame.hide();
				lib_opts.show();
				header.text(all_libs);
			}).css({
				position: 'absolute',
				top: 5,
				left: 5
			});
			
			$.each(img_libs, function(i, opts) {
				$('<li>').appendTo(lib_opts).text(opts.name).click(function() {
					frame.attr('src', opts.url).show();
					header.text(name);
					lib_opts.hide();
				}).append('<span>' + opts.description + '</span>');
			});
			
		} else {
			$('#imgbrowse_holder').show();
		}
	}
	
	return {
		svgicons: "extensions/ext-imagelib.xml",
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
					z-index: 4;\
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
				#imgbrowse > div,\
				#imgbrowse > ul {\
					position: absolute;\
					top: 36px;\
					left: 10px;\
					right: 10px;\
					bottom: 10px;\
					border: 1px solid #666;\
					background: white;\
					margin: 0;\
					padding: 0;\
					overflow: auto;\
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
	}
});

