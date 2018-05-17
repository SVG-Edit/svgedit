/* eslint-disable no-var */
/* globals $ */
$('a').click(function () {
	'use strict';
	var metaStr;
	var href = this.href;
	var target = window.parent;
	// Convert Non-SVG images to data URL first
	// (this could also have been done server-side by the library)
	if (this.href.indexOf('.svg') === -1) {
		metaStr = JSON.stringify({
			name: $(this).text(),
			id: href
		});
		target.postMessage(metaStr, '*');

		var img = new Image();
		img.onload = function () {
			var canvas = document.createElement('canvas');
			canvas.width = this.width;
			canvas.height = this.height;
			// load the raster image into the canvas
			canvas.getContext('2d').drawImage(this, 0, 0);
			// retrieve the data: URL
			var dataurl;
			try {
				dataurl = canvas.toDataURL();
			} catch (err) {
				// This fails in Firefox with file:// URLs :(
				alert('Data URL conversion failed: ' + err);
				dataurl = '';
			}
			target.postMessage('|' + href + '|' + dataurl, '*');
		};
		img.src = href;
	} else {
		// Send metadata (also indicates file is about to be sent)
		metaStr = JSON.stringify({
			name: $(this).text(),
			id: href
		});
		target.postMessage(metaStr, '*');
		// Do ajax request for image's href value
		$.get(href, function (data) {
			data = '|' + href + '|' + data;
			// This is where the magic happens!
			target.postMessage(data, '*');
		}, 'html'); // 'html' is necessary to keep returned data as a string
	}
	return false;
});
