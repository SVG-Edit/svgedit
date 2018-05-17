/* eslint-env qunit */
/* globals $ */
$(function () {
	// log function
	QUnit.log = function (details) {
		if (window.console && window.console.log) {
			window.console.log(details.result + ' :: ' + details.message);
		}
	};
});
