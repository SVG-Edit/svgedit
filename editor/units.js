/**
 * Package: svgedit.units
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.units) {
	svgedit.units = {};
}

var w_attrs = ['x', 'x1', 'cx', 'rx', 'width'];
var h_attrs = ['y', 'y1', 'cy', 'ry', 'height'];
var unit_attrs = $.merge(['r','radius'], w_attrs);

var unitNumMap = {
	'%':  2,
	'em': 3,
	'ex': 4,
	'px': 5,
	'cm': 6,
	'mm': 7,
	'in': 8,
	'pt': 9,
	'pc': 10
};

$.merge(unit_attrs, h_attrs);

/**
 * Stores mapping of unit type to user coordinates.
 */
svgedit.units.typeMap = {px: 1};

/**
 * Initializes this module.
 */
svgedit.units.init = function() {
	var svgns = 'http://www.w3.org/2000/svg';

	// Get correct em/ex values by creating a temporary SVG.
	var svg = document.createElementNS(svgns, 'svg');
	document.body.appendChild(svg);
	var rect = document.createElementNS(svgns,'rect');
	rect.setAttribute('width',"1em");
	rect.setAttribute('height',"1ex");
	rect.setAttribute('x',"1in");
	svg.appendChild(rect);
	var bb = rect.getBBox();
	document.body.removeChild(svg);

	var inch = bb.x;
	svgedit.units.typeMap['em'] = bb.width;
	svgedit.units.typeMap['ex'] = bb.height;
	svgedit.units.typeMap['in'] = inch;
	svgedit.units.typeMap['cm'] = inch / 2.54;
	svgedit.units.typeMap['mm'] = inch / 25.4;
	svgedit.units.typeMap['pt'] = inch / 72;
	svgedit.units.typeMap['pc'] = inch / 6;
	svgedit.units.typeMap['%'] = 0;
};

})();