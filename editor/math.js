/**
 * SVG-edit Math Utilities
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// None.

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.math) {
	svgedit.math = {};
}

// Constants
var NEAR_ZERO = 1e-14;

// Throw away SVGSVGElement used for creating matrices/transforms.
var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

// Function: svgedit.math.transformPoint
// A (hopefully) quicker function to transform a point by a matrix
// (this function avoids any DOM calls and just does the math)
// 
// Parameters:
// x - Float representing the x coordinate
// y - Float representing the y coordinate
// m - Matrix object to transform the point with
// Returns a x,y object representing the transformed point
svgedit.math.transformPoint = function(x, y, m) {
	return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f};
};


// Function: svgedit.math.isIdentity
// Helper function to check if the matrix performs no actual transform 
// (i.e. exists for identity purposes)
//
// Parameters: 
// m - The matrix object to check
//
// Returns:
// Boolean indicating whether or not the matrix is 1,0,0,1,0,0
svgedit.math.isIdentity = function(m) {
	return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
};


// Function: svgedit.math.matrixMultiply
// This function tries to return a SVGMatrix that is the multiplication m1*m2.
// We also round to zero when it's near zero
// 
// Parameters:
// >= 2 Matrix objects to multiply
//
// Returns: 
// The matrix object resulting from the calculation
svgedit.math.matrixMultiply = function() {
	var args = arguments, i = args.length, m = args[i-1];
	
	while(i-- > 1) {
		var m1 = args[i-1];
		m = m1.multiply(m);
	}
	if (Math.abs(m.a) < NEAR_ZERO) m.a = 0;
	if (Math.abs(m.b) < NEAR_ZERO) m.b = 0;
	if (Math.abs(m.c) < NEAR_ZERO) m.c = 0;
	if (Math.abs(m.d) < NEAR_ZERO) m.d = 0;
	if (Math.abs(m.e) < NEAR_ZERO) m.e = 0;
	if (Math.abs(m.f) < NEAR_ZERO) m.f = 0;
	
	return m;
};

// Function: svgedit.math.hasMatrixTransform
// See if the given transformlist includes a non-indentity matrix transform
//
// Parameters: 
// tlist - The transformlist to check
//
// Returns: 
// Boolean on whether or not a matrix transform was found
svgedit.math.hasMatrixTransform = function(tlist) {
	if(!tlist) return false;
	var num = tlist.numberOfItems;
	while (num--) {
		var xform = tlist.getItem(num);
		if (xform.type == 1 && !svgedit.math.isIdentity(xform.matrix)) return true;
	}
	return false;
};

// Function: svgedit.math.transformBox
// Transforms a rectangle based on the given matrix
//
// Parameters:
// l - Float with the box's left coordinate
// t - Float with the box's top coordinate
// w - Float with the box width
// h - Float with the box height
// m - Matrix object to transform the box by
// 
// Returns:
// An object with the following values:
// * tl - The top left coordinate (x,y object)
// * tr - The top right coordinate (x,y object)
// * bl - The bottom left coordinate (x,y object)
// * br - The bottom right coordinate (x,y object)
// * aabox - Object with the following values:
// * Float with the axis-aligned x coordinate
// * Float with the axis-aligned y coordinate
// * Float with the axis-aligned width coordinate
// * Float with the axis-aligned height coordinate
svgedit.math.transformBox = function(l, t, w, h, m) {
	var topleft = {x:l,y:t},
		topright = {x:(l+w),y:t},
		botright = {x:(l+w),y:(t+h)},
		botleft = {x:l,y:(t+h)};
	var transformPoint = svgedit.math.transformPoint;
	topleft = transformPoint( topleft.x, topleft.y, m );
	var minx = topleft.x,
		maxx = topleft.x,
		miny = topleft.y,
		maxy = topleft.y;
	topright = transformPoint( topright.x, topright.y, m );
	minx = Math.min(minx, topright.x);
	maxx = Math.max(maxx, topright.x);
	miny = Math.min(miny, topright.y);
	maxy = Math.max(maxy, topright.y);
	botleft = transformPoint( botleft.x, botleft.y, m);
	minx = Math.min(minx, botleft.x);
	maxx = Math.max(maxx, botleft.x);
	miny = Math.min(miny, botleft.y);
	maxy = Math.max(maxy, botleft.y);
	botright = transformPoint( botright.x, botright.y, m );
	minx = Math.min(minx, botright.x);
	maxx = Math.max(maxx, botright.x);
	miny = Math.min(miny, botright.y);
	maxy = Math.max(maxy, botright.y);

	return {tl:topleft, tr:topright, bl:botleft, br:botright, 
			aabox: {x:minx, y:miny, width:(maxx-minx), height:(maxy-miny)} };
};

// Function: svgedit.math.transformListToTransform
// This returns a single matrix Transform for a given Transform List
// (this is the equivalent of SVGTransformList.consolidate() but unlike
//  that method, this one does not modify the actual SVGTransformList)
// This function is very liberal with its min,max arguments
// 
// Parameters:
// tlist - The transformlist object
// min - Optional integer indicating start transform position
// max - Optional integer indicating end transform position
//
// Returns:
// A single matrix transform object
svgedit.math.transformListToTransform = function(tlist, min, max) {
	if(tlist == null) {
		// Or should tlist = null have been prevented before this?
		return svg.createSVGTransformFromMatrix(svg.createSVGMatrix());
	}
	var min = min == undefined ? 0 : min;
	var max = max == undefined ? (tlist.numberOfItems-1) : max;
	min = parseInt(min);
	max = parseInt(max);
	if (min > max) { var temp = max; max = min; min = temp; }
	var m = svg.createSVGMatrix();
	for (var i = min; i <= max; ++i) {
		// if our indices are out of range, just use a harmless identity matrix
		var mtom = (i >= 0 && i < tlist.numberOfItems ? 
						tlist.getItem(i).matrix :
						svg.createSVGMatrix());
		m = svgedit.math.matrixMultiply(m, mtom);
	}
	return svg.createSVGTransformFromMatrix(m);
};


// Function: svgedit.math.snapToAngle
// Returns a 45 degree angle coordinate associated with the two given 
// coordinates
// 
// Parameters:
// x1 - First coordinate's x value
// x2 - Second coordinate's x value
// y1 - First coordinate's y value
// y2 - Second coordinate's y value
//
// Returns: 
// Object with the following values:
// x - The angle-snapped x value
// y - The angle-snapped y value
// snapangle - The angle at which to snap
svgedit.math.snapToAngle = function(x1,y1,x2,y2) {
	var snap = Math.PI/4; // 45 degrees
	var dx = x2 - x1;
	var dy = y2 - y1;
	var angle = Math.atan2(dy,dx);
	var dist = Math.sqrt(dx * dx + dy * dy);
	var snapangle= Math.round(angle/snap)*snap;
	var x = x1 + dist*Math.cos(snapangle);	
	var y = y1 + dist*Math.sin(snapangle);
	//console.log(x1,y1,x2,y2,x,y,angle)
	return {x:x, y:y, a:snapangle};
};

})();