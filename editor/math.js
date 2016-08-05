/*globals svgedit*/
/*jslint vars: true, eqeq: true */
/**
 * Package: svedit.math
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// None.
 
/**
* @typedef AngleCoord45
* @type {object}
* @property {number} x - The angle-snapped x value
* @property {number} y - The angle-snapped y value
* @property {number} a - The angle at which to snap
*/

(function() {'use strict';

if (!svgedit.math) {
	svgedit.math = {};
}

// Constants
var NEAR_ZERO = 1e-14;

// Throw away SVGSVGElement used for creating matrices/transforms.
var svg = document.createElementNS(svgedit.NS.SVG, 'svg');

/**
 * A (hopefully) quicker function to transform a point by a matrix
 * (this function avoids any DOM calls and just does the math)
 * @param {number} x - Float representing the x coordinate
 * @param {number} y - Float representing the y coordinate
 * @param {SVGMatrix} m - Matrix object to transform the point with
 * @returns {object} An x, y object representing the transformed point
*/
svgedit.math.transformPoint = function (x, y, m) {
	return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
};


/**
 * Helper function to check if the matrix performs no actual transform 
 * (i.e. exists for identity purposes)
 * @param {SVGMatrix} m - The matrix object to check
 * @returns {boolean} Indicates whether or not the matrix is 1,0,0,1,0,0
*/
svgedit.math.isIdentity = function (m) {
	return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
};


/**
 * This function tries to return a SVGMatrix that is the multiplication m1*m2.
 * We also round to zero when it's near zero
 * @param {...SVGMatrix} matr - Two or more matrix objects to multiply
 * @returns {SVGMatrix} The matrix object resulting from the calculation
*/
svgedit.math.matrixMultiply = function (matr) {
	var args = arguments, i = args.length, m = args[i-1];

	while (i-- > 1) {
		var m1 = args[i-1];
		m = m1.multiply(m);
	}
	if (Math.abs(m.a) < NEAR_ZERO) {m.a = 0;}
	if (Math.abs(m.b) < NEAR_ZERO) {m.b = 0;}
	if (Math.abs(m.c) < NEAR_ZERO) {m.c = 0;}
	if (Math.abs(m.d) < NEAR_ZERO) {m.d = 0;}
	if (Math.abs(m.e) < NEAR_ZERO) {m.e = 0;}
	if (Math.abs(m.f) < NEAR_ZERO) {m.f = 0;}

	return m;
};

/**
 * See if the given transformlist includes a non-indentity matrix transform
 * @param {object} [tlist] - The transformlist to check
 * @returns {boolean} Whether or not a matrix transform was found
*/
svgedit.math.hasMatrixTransform = function (tlist) {
	if (!tlist) {return false;}
	var num = tlist.numberOfItems;
	while (num--) {
		var xform = tlist.getItem(num);
		if (xform.type == 1 && !svgedit.math.isIdentity(xform.matrix)) {return true;}
	}
	return false;
};

/**
 * Transforms a rectangle based on the given matrix
 * @param {number} l - Float with the box's left coordinate
 * @param {number} t - Float with the box's top coordinate
 * @param {number} w - Float with the box width
 * @param {number} h - Float with the box height
 * @param {SVGMatrix} m - Matrix object to transform the box by
 * @returns {object} An object with the following values:
 * tl - The top left coordinate (x,y object)
 * tr - The top right coordinate (x,y object)
 * bl - The bottom left coordinate (x,y object)
 * br - The bottom right coordinate (x,y object)
 * aabox - Object with the following values:
 * x - Float with the axis-aligned x coordinate
 * y - Float with the axis-aligned y coordinate
 * width - Float with the axis-aligned width coordinate
 * height - Float with the axis-aligned height coordinate
*/
svgedit.math.transformBox = function (l, t, w, h, m) {
	var transformPoint = svgedit.math.transformPoint,

		tl = transformPoint(l, t, m),
		tr = transformPoint((l + w), t, m),
		bl = transformPoint(l, (t + h), m),
		br = transformPoint((l + w), (t + h), m),

		minx = Math.min(tl.x, tr.x, bl.x, br.x),
		maxx = Math.max(tl.x, tr.x, bl.x, br.x),
		miny = Math.min(tl.y, tr.y, bl.y, br.y),
		maxy = Math.max(tl.y, tr.y, bl.y, br.y);

	return {
		tl: tl,
		tr: tr,
		bl: bl,
		br: br,
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
 * (this is the equivalent of SVGTransformList.consolidate() but unlike
 * that method, this one does not modify the actual SVGTransformList)
 * This function is very liberal with its min, max arguments
 * @param {object} tlist - The transformlist object
 * @param {integer} [min=0] - Optional integer indicating start transform position
 * @param {integer} [max] - Optional integer indicating end transform position;
 *   defaults to one less than the tlist's numberOfItems
 * @returns {object} A single matrix transform object
*/
svgedit.math.transformListToTransform = function (tlist, min, max) {
	if (tlist == null) {
		// Or should tlist = null have been prevented before this?
		return svg.createSVGTransformFromMatrix(svg.createSVGMatrix());
	}
	min = min || 0;
	max = max || (tlist.numberOfItems - 1);
	min = parseInt(min, 10);
	max = parseInt(max, 10);
	if (min > max) { var temp = max; max = min; min = temp; }
	var m = svg.createSVGMatrix();
	var i;
	for (i = min; i <= max; ++i) {
		// if our indices are out of range, just use a harmless identity matrix
		var mtom = (i >= 0 && i < tlist.numberOfItems ? 
						tlist.getItem(i).matrix :
						svg.createSVGMatrix());
		m = svgedit.math.matrixMultiply(m, mtom);
	}
	return svg.createSVGTransformFromMatrix(m);
};


/**
 * Get the matrix object for a given element
 * @param {Element} elem - The DOM element to check
 * @returns {SVGMatrix} The matrix object associated with the element's transformlist
*/
svgedit.math.getMatrix = function (elem) {
	var tlist = svgedit.transformlist.getTransformList(elem);
	return svgedit.math.transformListToTransform(tlist).matrix;
};


/**
 * Returns a 45 degree angle coordinate associated with the two given
 * coordinates
 * @param {number} x1 - First coordinate's x value
 * @param {number} x2 - Second coordinate's x value
 * @param {number} y1 - First coordinate's y value
 * @param {number} y2 - Second coordinate's y value
 * @returns {AngleCoord45}
*/
svgedit.math.snapToAngle = function (x1, y1, x2, y2) {
	var snap = Math.PI / 4; // 45 degrees
	var dx = x2 - x1;
	var dy = y2 - y1;
	var angle = Math.atan2(dy, dx);
	var dist = Math.sqrt(dx * dx + dy * dy);
	var snapangle = Math.round(angle / snap) * snap;

	return {
		x: x1 + dist * Math.cos(snapangle),
		y: y1 + dist * Math.sin(snapangle),
		a: snapangle
	};
};


/**
 * Check if two rectangles (BBoxes objects) intersect each other
 * @param {SVGRect} r1 - The first BBox-like object
 * @param {SVGRect} r2 - The second BBox-like object
 * @returns {boolean} True if rectangles intersect
 */
svgedit.math.rectsIntersect = function (r1, r2) {
	return r2.x < (r1.x + r1.width) &&
		(r2.x + r2.width) > r1.x &&
		r2.y < (r1.y + r1.height) &&
		(r2.y + r2.height) > r1.y;
};

}());
