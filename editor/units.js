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

var svgedit = svgedit || {};

(function() {

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

// Container of elements.
var elementContainer_;

/**
 * Stores mapping of unit type to user coordinates.
 */
var typeMap_ = {px: 1};

/**
 * ElementContainer interface
 *
 * function getBaseUnit() - returns a string of the base unit type of the container ("em")
 * function getElement() - returns an element in the container given an id
 * function getHeight() - returns the container's height
 * function getWidth() - returns the container's width
 * function getRoundDigits() - returns the number of digits number should be rounded to
 */

/**
 * Function: svgedit.units.init()
 * Initializes this module.
 *
 * Parameters:
 * elementContainer - an object implementing the ElementContainer interface.
 */
svgedit.units.init = function(elementContainer) {
	elementContainer_ = elementContainer;

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
	typeMap_['em'] = bb.width;
	typeMap_['ex'] = bb.height;
	typeMap_['in'] = inch;
	typeMap_['cm'] = inch / 2.54;
	typeMap_['mm'] = inch / 25.4;
	typeMap_['pt'] = inch / 72;
	typeMap_['pc'] = inch / 6;
	typeMap_['%'] = 0;
};

// Group: Unit conversion functions

// Function: svgedit.units.getTypeMap
// Returns the unit object with values for each unit
svgedit.units.getTypeMap = function() {
	return typeMap_;
};

// Function: svgedit.units.shortFloat
// Rounds a given value to a float with number of digits defined in save_options
//
// Parameters: 
// val - The value as a String, Number or Array of two numbers to be rounded
//
// Returns:
// If a string/number was given, returns a Float. If an array, return a string
// with comma-seperated floats
svgedit.units.shortFloat = function(val) {
	var digits = elementContainer_.getRoundDigits();
	if(!isNaN(val)) {
		// Note that + converts to Number
		return +((+val).toFixed(digits));
	} else if($.isArray(val)) {
		return svgedit.units.shortFloat(val[0]) + ',' + svgedit.units.shortFloat(val[1]);
	}
	return parseFloat(val).toFixed(digits) - 0;
};

// Function: svgedit.units.convertUnit
// Converts the number to given unit or baseUnit
svgedit.units.convertUnit = function(val, unit) {
	unit = unit || elementContainer_.getBaseUnit();
//	baseVal.convertToSpecifiedUnits(unitNumMap[unit]);
//	var val = baseVal.valueInSpecifiedUnits;
//	baseVal.convertToSpecifiedUnits(1);
	return svgedit.unit.shortFloat(val / typeMap_[unit]);
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
//		if(old_val !== null && (isNaN(old_val) || elementContainer_.getBaseUnit() !== 'px')) {
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
//				if(elementContainer_.getBaseUnit() !== 'px') {
//					unit = elementContainer_.getBaseUnit();
//				} else {
//					unit = old_val.substr(-2);
//				}
//				val = val / typeMap_[unit];
//			}
//		
//		val += unit;
//		}
	}
	elem.setAttribute(attr, val);
};

var attrsToConvert = {
	"line": ['x1', 'x2', 'y1', 'y2'],
	"circle": ['cx', 'cy', 'r'],
	"ellipse": ['cx', 'cy', 'rx', 'ry'],
	"foreignObject": ['x', 'y', 'width', 'height'],
	"rect": ['x', 'y', 'width', 'height'],
	"image": ['x', 'y', 'width', 'height'],
	"use": ['x', 'y', 'width', 'height'],
	"text": ['x', 'y']
};

// Function: svgedit.units.convertAttrs
// Converts all applicable attributes to the configured baseUnit
//
// Parameters:
// element - a DOM element whose attributes should be converted
svgedit.units.convertAttrs = function(element) {
	var elName = element.tagName;
	var unit = elementContainer_.getBaseUnit();
	var attrs = attrsToConvert[elName];
	if(!attrs) return;
	var len = attrs.length
	for(var i = 0; i < len; i++) {
		var attr = attrs[i];
		var cur = element.getAttribute(attr);
		if(cur) {
			if(!isNaN(cur)) {
				element.setAttribute(attr, (cur / typeMap_[unit]) + unit);
			} else {
				// Convert existing?
			}
		}
	}
};

// Function: svgedit.units.convertToNum
// Converts given values to numbers. Attributes must be supplied in 
// case a percentage is given
//
// Parameters:
// attr - String with the name of the attribute associated with the value
// val - String with the attribute value to convert
svgedit.units.convertToNum = function(attr, val) {
	// Return a number if that's what it already is
	if(!isNaN(val)) return val-0;
	
	if(val.substr(-1) === '%') {
		// Deal with percentage, depends on attribute
		var num = val.substr(0, val.length-1)/100;
		var width = elementContainer_.getWidth();
		var height = elementContainer_.getHeight();
		
		if(w_attrs.indexOf(attr) >= 0) {
			return num * width;
		} else if(h_attrs.indexOf(attr) >= 0) {
			return num * height;
		} else {
			return num * Math.sqrt((width*width) + (height*height))/Math.sqrt(2);
		}
	} else {
		var unit = val.substr(-2);
		var num = val.substr(0, val.length-2);
		// Note that this multiplication turns the string into a number
		return num * typeMap_[unit];
	}
};

// Function: svgedit.units.isValidUnit
// Check if an attribute's value is in a valid format
//
// Parameters: 
// attr - String with the name of the attribute associated with the value
// val - String with the attribute value to check
svgedit.units.isValidUnit = function(attr, val) {
	var valid = false;
	if(unit_attrs.indexOf(attr) >= 0) {
		// True if it's just a number
		if(!isNaN(val)) {
			valid = true;
		} else {
		// Not a number, check if it has a valid unit
			val = val.toLowerCase();
			$.each(typeMap_, function(unit) {
				if(valid) return;
				var re = new RegExp('^-?[\\d\\.]+' + unit + '$');
				if(re.test(val)) valid = true;
			});
		}
	} else if (attr == "id") {
		// if we're trying to change the id, make sure it's not already present in the doc
		// and the id value is valid.

		var result = false;
		// because getElem() can throw an exception in the case of an invalid id
		// (according to http://www.w3.org/TR/xml-id/ IDs must be a NCName)
		// we wrap it in an exception and only return true if the ID was valid and
		// not already present
		try {
			var elem = elementContainer_.getElement(val);
			result = (elem == null);
		} catch(e) {}
		return result;
	} else {
		valid = true;
	}
	
	return valid;
};


})();