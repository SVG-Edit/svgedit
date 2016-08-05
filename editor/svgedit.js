/*globals $, svgedit*/
/**
 *
 * Licensed under the MIT License
 * main object, loaded first so other modules have the guarantee of its existence
 */

svgedit = {
	// common namepaces constants in alpha order
	NS: {
		HTML: 'http://www.w3.org/1999/xhtml',
		MATH: 'http://www.w3.org/1998/Math/MathML',
		SVG: 'http://www.w3.org/2000/svg',
		XLINK: 'http://www.w3.org/1999/xlink',
		XML: 'http://www.w3.org/XML/1998/namespace',
		XMLNS: 'http://www.w3.org/2000/xmlns/' // see http://www.w3.org/TR/REC-xml-names/#xmlReserved
	},
	ignoredNS: {
		SE: 'https://github.com/SVG-Edit/svgedit'
	}
};

// return the svgedit.NS with key values switched and lowercase
svgedit.getReverseNS = function() {'use strict';
	var reverseNS = {};
	$.each($.extend({}, this.NS, this.ignoredNS), function(name, URI) {
		reverseNS[URI] = name.toLowerCase();
	});
	return reverseNS;
};