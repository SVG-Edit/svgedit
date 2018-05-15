/* eslint-disable no-var */
window.setTimeout(function () {
	var iframes = document.getElementsByTagName('iframe');
	for (var i = 0, len = iframes.length; i < len; ++i) {
		var f = iframes[i];
		f.style.height = (f.contentDocument.body.scrollHeight + 20) + 'px';
	}
}, 5000);
