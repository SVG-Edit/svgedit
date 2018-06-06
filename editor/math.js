/**
 * Mathematical utilities
 * @module math
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

/**
* @typedef {PlainObject} module:math.AngleCoord45
* @property {Float} x - The angle-snapped x value
* @property {Float} y - The angle-snapped y value
* @property {Integer} a - The angle at which to snap
*/

/**
* @typedef {PlainObject} module:math.XYObject
* @property {Float} x
* @property {Float} y
*/

import {NS} from './namespaces.js';
import {getTransformList} from './svgtransformlist.js';

// Constants
const NEAR_ZERO = 1e-14;

// Throw away SVGSVGElement used for creating matrices/transforms.
const svg = document.createElementNS(NS.SVG, 'svg');

/**
 * A (hopefully) quicker function to transform a point by a matrix
 * (this function avoids any DOM calls and just does the math)
 * @function module:math.transformPoint
 * @param {Float} x - Float representing the x coordinate
 * @param {Float} y - Float representing the y coordinate
 * @param {SVGMatrix} m - Matrix object to transform the point with
 * @returns {module:math.XYObject} An x, y object representing the transformed point
*/
export const transformPoint = function (x, y, m) {
  return {x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
};

/**
 * Helper function to check if the matrix performs no actual transform
 * (i.e. exists for identity purposes)
 * @function module:math.isIdentity
 * @param {SVGMatrix} m - The matrix object to check
 * @returns {boolean} Indicates whether or not the matrix is 1,0,0,1,0,0
*/
export const isIdentity = function (m) {
  return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
};

/**
 * This function tries to return a `SVGMatrix` that is the multiplication `m1 * m2`.
 * We also round to zero when it's near zero
 * @function module:math.matrixMultiply
 * @param {...SVGMatrix} args - Matrix objects to multiply
 * @returns {SVGMatrix} The matrix object resulting from the calculation
*/
export const matrixMultiply = function (...args) {
  const m = args.reduceRight((prev, m1) => {
    return m1.multiply(prev);
  });

  if (Math.abs(m.a) < NEAR_ZERO) { m.a = 0; }
  if (Math.abs(m.b) < NEAR_ZERO) { m.b = 0; }
  if (Math.abs(m.c) < NEAR_ZERO) { m.c = 0; }
  if (Math.abs(m.d) < NEAR_ZERO) { m.d = 0; }
  if (Math.abs(m.e) < NEAR_ZERO) { m.e = 0; }
  if (Math.abs(m.f) < NEAR_ZERO) { m.f = 0; }

  return m;
};

/**
 * See if the given transformlist includes a non-indentity matrix transform
 * @function module:math.hasMatrixTransform
 * @param {SVGTransformList} [tlist] - The transformlist to check
 * @returns {boolean} Whether or not a matrix transform was found
*/
export const hasMatrixTransform = function (tlist) {
  if (!tlist) { return false; }
  let num = tlist.numberOfItems;
  while (num--) {
    const xform = tlist.getItem(num);
    if (xform.type === 1 && !isIdentity(xform.matrix)) { return true; }
  }
  return false;
};

/**
* @typedef {PlainObject} module:math.TransformedBox An object with the following values
* @property {module:math.XYObject} tl - The top left coordinate
* @property {module:math.XYObject} tr - The top right coordinate
* @property {module:math.XYObject} bl - The bottom left coordinate
* @property {module:math.XYObject} br - The bottom right coordinate
* @property {PlainObject} aabox - Object with the following values:
* @property {Float} aabox.x - Float with the axis-aligned x coordinate
* @property {Float} aabox.y - Float with the axis-aligned y coordinate
* @property {Float} aabox.width - Float with the axis-aligned width coordinate
* @property {Float} aabox.height - Float with the axis-aligned height coordinate
*/

/**
 * Transforms a rectangle based on the given matrix
 * @function module:math.transformBox
 * @param {Float} l - Float with the box's left coordinate
 * @param {Float} t - Float with the box's top coordinate
 * @param {Float} w - Float with the box width
 * @param {Float} h - Float with the box height
 * @param {SVGMatrix} m - Matrix object to transform the box by
 * @returns {module:math.TransformedBox}
*/
export const transformBox = function (l, t, w, h, m) {
  const tl = transformPoint(l, t, m),
    tr = transformPoint((l + w), t, m),
    bl = transformPoint(l, (t + h), m),
    br = transformPoint((l + w), (t + h), m),

    minx = Math.min(tl.x, tr.x, bl.x, br.x),
    maxx = Math.max(tl.x, tr.x, bl.x, br.x),
    miny = Math.min(tl.y, tr.y, bl.y, br.y),
    maxy = Math.max(tl.y, tr.y, bl.y, br.y);

  return {
    tl,
    tr,
    bl,
    br,
    aabox: {
      x: minx,
      y: miny,
      width: (maxx - minx),
      height: (maxy - miny)
    }
  };
};

/**
 * This returns a single matrix Transform for a given Transform List
 * (this is the equivalent of `SVGTransformList.consolidate()` but unlike
 * that method, this one does not modify the actual `SVGTransformList`).
 * This function is very liberal with its `min`, `max` arguments
 * @function module:math.transformListToTransform
 * @param {SVGTransformList} tlist - The transformlist object
 * @param {Integer} [min=0] - Optional integer indicating start transform position
 * @param {Integer} [max] - Optional integer indicating end transform position;
 *   defaults to one less than the tlist's `numberOfItems`
 * @returns {SVGTransform} A single matrix transform object
*/
export const transformListToTransform = function (tlist, min, max) {
  if (tlist == null) {
    // Or should tlist = null have been prevented before this?
    return svg.createSVGTransformFromMatrix(svg.createSVGMatrix());
  }
  min = min || 0;
  max = max || (tlist.numberOfItems - 1);
  min = parseInt(min, 10);
  max = parseInt(max, 10);
  if (min > max) { const temp = max; max = min; min = temp; }
  let m = svg.createSVGMatrix();
  for (let i = min; i <= max; ++i) {
    // if our indices are out of range, just use a harmless identity matrix
    const mtom = (i >= 0 && i < tlist.numberOfItems
      ? tlist.getItem(i).matrix
      : svg.createSVGMatrix());
    m = matrixMultiply(m, mtom);
  }
  return svg.createSVGTransformFromMatrix(m);
};

/**
 * Get the matrix object for a given element
 * @function module:math.getMatrix
 * @param {Element} elem - The DOM element to check
 * @returns {SVGMatrix} The matrix object associated with the element's transformlist
*/
export const getMatrix = function (elem) {
  const tlist = getTransformList(elem);
  return transformListToTransform(tlist).matrix;
};

/**
 * Returns a 45 degree angle coordinate associated with the two given
 * coordinates
 * @function module:math.snapToAngle
 * @param {Integer} x1 - First coordinate's x value
 * @param {Integer} x2 - Second coordinate's x value
 * @param {Integer} y1 - First coordinate's y value
 * @param {Integer} y2 - Second coordinate's y value
 * @returns {module:math.AngleCoord45}
*/
export const snapToAngle = function (x1, y1, x2, y2) {
  const snap = Math.PI / 4; // 45 degrees
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const snapangle = Math.round(angle / snap) * snap;

  return {
    x: x1 + dist * Math.cos(snapangle),
    y: y1 + dist * Math.sin(snapangle),
    a: snapangle
  };
};

/**
 * Check if two rectangles (BBoxes objects) intersect each other
 * @function module:math.rectsIntersect
 * @param {SVGRect} r1 - The first BBox-like object
 * @param {SVGRect} r2 - The second BBox-like object
 * @returns {boolean} True if rectangles intersect
 */
export const rectsIntersect = function (r1, r2) {
  return r2.x < (r1.x + r1.width) &&
    (r2.x + r2.width) > r1.x &&
    r2.y < (r1.y + r1.height) &&
    (r2.y + r2.height) > r1.y;
};
