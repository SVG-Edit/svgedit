/* eslint-disable no-var */
var iframes = document.getElementsByTagName('iframe');
for (var i = 0, len = iframes.length; i < len; ++i) {
	var f = iframes[i];
	(function (f) {
		f.addEventListener('load', function () {
			f.contentWindow.QUnit.done = function () {
				f.style.height = (f.contentDocument.body.scrollHeight + 20) + 'px';
			};
		});
	})(f);
}
