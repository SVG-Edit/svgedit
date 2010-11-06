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

// Read-only copy of configuration options.
svgedit.units.config_;

/**
 * Stores mapping of unit type to user coordinates.
 */
svgedit.units.typeMap_ = {px: 1};

/**
 * Function: svgedit.units.init()
 * Initializes this module.
 *
 * Parameters:
 * config - an object containing configuration options.
 */
svgedit.units.init = function(config) {
	svgedit.units.config_ = config;

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
	svgedit.units.typeMap_['em'] = bb.width;
	svgedit.units.typeMap_['ex'] = bb.height;
	svgedit.units.typeMap_['in'] = inch;
	svgedit.units.typeMap_['cm'] = inch / 2.54;
	svgedit.units.typeMap_['mm'] = inch / 25.4;
	svgedit.units.typeMap_['pt'] = inch / 72;
	svgedit.units.typeMap_['pc'] = inch / 6;
	svgedit.units.typeMap_['%'] = 0;
};

// Function: svgedit.units.getTypeMap
// Returns the unit object with values for each unit
svgedit.units.getTypeMap = function() {
	return svgedit.units.typeMap_;
};

// Function: svgedit.units.convertUnit
// Converts the number to given unit or baseUnit
svgedit.units.convertUnit = function(val, unit) {
	unit = unit || svgedit.units.config_.baseUnit;
//	baseVal.convertToSpecifiedUnits(unitNumMap[unit]);
//	var val = baseVal.valueInSpecifiedUnits;
//	baseVal.convertToSpecifiedUnits(1);
	return val / svgedit.units.typeMap_[unit];
};

// Function: svgedit.units.setUnitAttr
// Sets an element's attribute based on the unit in its current value.
//
// Parameters: 
// elem - DOM element to be changed
// attr - String with the name of the attribute associated with the value
// val - String with the attribute value to convert
svgedit.units.setUnitAttr = function(elem, attr, val) {
	if(!isNaN(val)) {
		// New value is a number, so check currently used unit
		var old_val = elem.getAttribute(attr);
		
		// Enable this for alternate mode
//		if(old_val !== null && (isNaN(old_val) || curConfig.baseUnit !== 'px')) {
//			// Old value was a number, so get unit, then convert
//			var unit;
//			if(old_val.substr(-1) === '%') {
//				var res = getResolution();
//				unit = '%';
//				val *= 100;
//				if(w_attrs.indexOf(attr) >= 0) {
//					val = val / res.w;
//				} else if(h_attrs.indexOf(attr) >= 0) {
//					val = val / res.h;
//				} else {
//					return val / Math.sqrt((res.w*res.w) + (res.h*res.h))/Math.sqrt(2);
//				}
//			} else {
//				if(curConfig.baseUnit !== 'px') {
//					unit = svgedit.units.config_.baseUnit;
//				} else {
//					unit = old_val.substr(-2);
//				}
//				val = val / svgedit.units.typeMap_[unit];
//			}
//		
//		val += unit;
//		}
	}
	elem.setAttribute(attr, val);
};

})();