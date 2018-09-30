/**
 * Tools for working with units
 * @module units
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import {NS} from './namespaces.js';

const wAttrs = ['x', 'x1', 'cx', 'rx', 'width'];
const hAttrs = ['y', 'y1', 'cy', 'ry', 'height'];
const unitAttrs = ['r', 'radius', ...wAttrs, ...hAttrs];
// unused
/*
const unitNumMap = {
  '%': 2,
  em: 3,
  ex: 4,
  px: 5,
  cm: 6,
  mm: 7,
  in: 8,
  pt: 9,
  pc: 10
};
*/
// Container of elements.
let elementContainer_;

// Stores mapping of unit type to user coordinates.
let typeMap_ = {};

/**
 * @interface module:units.ElementContainer
 */
/**
 * @function module:units.ElementContainer#getBaseUnit
 * @returns {string} The base unit type of the container ('em')
 */
/**
 * @function module:units.ElementContainer#getElement
 * @returns {Element} An element in the container given an id
 */
/**
 * @function module:units.ElementContainer#getHeight
 * @returns {Float} The container's height
 */
/**
 * @function module:units.ElementContainer#getWidth
 * @returns {Float} The container's width
 */
/**
 * @function module:units.ElementContainer#getRoundDigits
 * @returns {Integer} The number of digits number should be rounded to
 */

/**
 * @typedef {PlainObject} module:units.TypeMap
 * @property {Float} em
 * @property {Float} ex
 * @property {Float} in
 * @property {Float} cm
 * @property {Float} mm
 * @property {Float} pt
 * @property {Float} pc
 * @property {Integer} px
 * @property {0} %
 */

/**
 * Initializes this module.
 *
 * @function module:units.init
 * @param {module:units.ElementContainer} elementContainer - An object implementing the ElementContainer interface.
 * @returns {undefined}
 */
export const init = function (elementContainer) {
  elementContainer_ = elementContainer;

  // Get correct em/ex values by creating a temporary SVG.
  const svg = document.createElementNS(NS.SVG, 'svg');
  document.body.append(svg);
  const rect = document.createElementNS(NS.SVG, 'rect');
  rect.setAttribute('width', '1em');
  rect.setAttribute('height', '1ex');
  rect.setAttribute('x', '1in');
  svg.append(rect);
  const bb = rect.getBBox();
  svg.remove();

  const inch = bb.x;
  typeMap_ = {
    em: bb.width,
    ex: bb.height,
    in: inch,
    cm: inch / 2.54,
    mm: inch / 25.4,
    pt: inch / 72,
    pc: inch / 6,
    px: 1,
    '%': 0
  };
};

/**
* Group: Unit conversion functions
*/

/**
 * @function module:units.getTypeMap
 * @returns {module:units.TypeMap} The unit object with values for each unit
*/
export const getTypeMap = function () {
  return typeMap_;
};

/**
* @typedef {GenericArray} module:units.CompareNumbers
* @property {Integer} length 2
* @property {Float} 0
* @property {Float} 1
*/

/**
* Rounds a given value to a float with number of digits defined in
* `round_digits` of `saveOptions`
*
* @function module:units.shortFloat
* @param {string|Float|module:units.CompareNumbers} val - The value (or Array of two numbers) to be rounded
* @returns {Float|string} If a string/number was given, returns a Float. If an array, return a string
* with comma-separated floats
*/
export const shortFloat = function (val) {
  const digits = elementContainer_.getRoundDigits();
  if (!isNaN(val)) {
    // Note that + converts to Number
    return +((+val).toFixed(digits));
  }
  if (Array.isArray(val)) {
    return shortFloat(val[0]) + ',' + shortFloat(val[1]);
  }
  return parseFloat(val).toFixed(digits) - 0;
};

/**
* Converts the number to given unit or baseUnit
* @function module:units.convertUnit
* @returns {Float}
*/
export const convertUnit = function (val, unit) {
  unit = unit || elementContainer_.getBaseUnit();
  // baseVal.convertToSpecifiedUnits(unitNumMap[unit]);
  // const val = baseVal.valueInSpecifiedUnits;
  // baseVal.convertToSpecifiedUnits(1);
  return shortFloat(val / typeMap_[unit]);
};

/**
* Sets an element's attribute based on the unit in its current value.
*
* @function module:units.setUnitAttr
* @param {Element} elem - DOM element to be changed
* @param {string} attr - Name of the attribute associated with the value
* @param {string} val - Attribute value to convert
* @returns {undefined}
*/
export const setUnitAttr = function (elem, attr, val) {
  //  if (!isNaN(val)) {
  // New value is a number, so check currently used unit
  // const oldVal = elem.getAttribute(attr);

  // Enable this for alternate mode
  // if (oldVal !== null && (isNaN(oldVal) || elementContainer_.getBaseUnit() !== 'px')) {
  //   // Old value was a number, so get unit, then convert
  //   let unit;
  //   if (oldVal.substr(-1) === '%') {
  //     const res = getResolution();
  //     unit = '%';
  //     val *= 100;
  //     if (wAttrs.includes(attr)) {
  //       val = val / res.w;
  //     } else if (hAttrs.includes(attr)) {
  //       val = val / res.h;
  //     } else {
  //       return val / Math.sqrt((res.w*res.w) + (res.h*res.h))/Math.sqrt(2);
  //     }
  //   } else {
  //     if (elementContainer_.getBaseUnit() !== 'px') {
  //       unit = elementContainer_.getBaseUnit();
  //     } else {
  //       unit = oldVal.substr(-2);
  //     }
  //     val = val / typeMap_[unit];
  //   }
  //
  // val += unit;
  // }
  // }
  elem.setAttribute(attr, val);
};

const attrsToConvert = {
  line: ['x1', 'x2', 'y1', 'y2'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  foreignObject: ['x', 'y', 'width', 'height'],
  rect: ['x', 'y', 'width', 'height'],
  image: ['x', 'y', 'width', 'height'],
  use: ['x', 'y', 'width', 'height'],
  text: ['x', 'y']
};

/**
* Converts all applicable attributes to the configured baseUnit
* @function module:units.convertAttrs
* @param {Element} element - A DOM element whose attributes should be converted
* @returns {undefined}
*/
export const convertAttrs = function (element) {
  const elName = element.tagName;
  const unit = elementContainer_.getBaseUnit();
  const attrs = attrsToConvert[elName];
  if (!attrs) { return; }

  const len = attrs.length;
  for (let i = 0; i < len; i++) {
    const attr = attrs[i];
    const cur = element.getAttribute(attr);
    if (cur) {
      if (!isNaN(cur)) {
        element.setAttribute(attr, (cur / typeMap_[unit]) + unit);
      }
      // else {
      // Convert existing?
      // }
    }
  }
};

/**
* Converts given values to numbers. Attributes must be supplied in
* case a percentage is given
*
* @function module:units.convertToNum
* @param {string} attr - Name of the attribute associated with the value
* @param {string} val - Attribute value to convert
* @returns {Float} The converted number
*/
export const convertToNum = function (attr, val) {
  // Return a number if that's what it already is
  if (!isNaN(val)) { return val - 0; }
  if (val.substr(-1) === '%') {
    // Deal with percentage, depends on attribute
    const num = val.substr(0, val.length - 1) / 100;
    const width = elementContainer_.getWidth();
    const height = elementContainer_.getHeight();

    if (wAttrs.includes(attr)) {
      return num * width;
    }
    if (hAttrs.includes(attr)) {
      return num * height;
    }
    return num * Math.sqrt((width * width) + (height * height)) / Math.sqrt(2);
  }
  const unit = val.substr(-2);
  const num = val.substr(0, val.length - 2);
  // Note that this multiplication turns the string into a number
  return num * typeMap_[unit];
};

/**
* Check if an attribute's value is in a valid format
* @function module:units.isValidUnit
* @param {string} attr - The name of the attribute associated with the value
* @param {string} val - The attribute value to check
* @returns {boolean} Whether the unit is valid
*/
export const isValidUnit = function (attr, val, selectedElement) {
  if (unitAttrs.includes(attr)) {
    // True if it's just a number
    if (!isNaN(val)) {
      return true;
    }
    // Not a number, check if it has a valid unit
    val = val.toLowerCase();
    return Object.keys(typeMap_).some((unit) => {
      const re = new RegExp('^-?[\\d\\.]+' + unit + '$');
      return re.test(val);
    });
  }
  if (attr === 'id') {
    // if we're trying to change the id, make sure it's not already present in the doc
    // and the id value is valid.

    let result = false;
    // because getElem() can throw an exception in the case of an invalid id
    // (according to https://www.w3.org/TR/xml-id/ IDs must be a NCName)
    // we wrap it in an exception and only return true if the ID was valid and
    // not already present
    try {
      const elem = elementContainer_.getElement(val);
      result = (elem == null || elem === selectedElement);
    } catch (e) {}
    return result;
  }
  return true;
};
