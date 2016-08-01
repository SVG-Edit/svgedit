/*globals $, svgedit*/
/**
 *
 * Licensed under the MIT License
 * main object, loaded first so other modules have the guarantee of its existence
 */

svgedit = {
	// common namepaces constants in alpha order
	NS: {
		html: 'http://www.w3.org/1999/xhtml',
		math: 'http://www.w3.org/1998/Math/MathML',
		svg: 'http://www.w3.org/2000/svg',
		xlink: 'http://www.w3.org/1999/xlink',
		xml: 'http://www.w3.org/XML/1998/namespace',
		xmlns: 'http://www.w3.org/2000/xmlns/' // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
	},
	ignoredNS: {
		se: 'https://github.com/SVG-Edit/svgedit'
	}
};

// return the svgedit.NS with key values switched
svgedit.getReverseNS = function() {'use strict';
	var reverseNS = {};
	$.each($.extend({}, this.NS, this.ignoredNS), function(name, URI) {
		reverseNS[URI] = name;
	});
	return reverseNS;
};
