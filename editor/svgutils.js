/**
 * SVG-edit Utilities
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery

(function() {

if (window.svgedit == undefined) {
	window.svgedit = {};
}

svgedit.Utilities = {
};

// String used to encode base64.
svgedit.Utilities._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

// Function: svgedit.Utilities.toXml
// Converts characters in a string to XML-friendly entities.
//
// Example: "&" becomes "&amp;"
//
// Parameters:
// str - The string to be converted
//
// Returns:
// The converted string
svgedit.Utilities.toXml = function(str) {
	return $('<p/>').text(str).html();
};
	
// Function: svgedit.Utilities.fromXml
// Converts XML entities in a string to single characters. 
// Example: "&amp;" becomes "&"
//
// Parameters:
// str - The string to be converted
//
// Returns: 
// The converted string
svgedit.Utilities.fromXml = function(str) {
	return $('<p/>').html(str).text();
};


// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//           also precalculate the size of the array needed.

// Function: Utils.encode64
// Converts a string to base64
svgedit.Utilities.encode64 = function(input) {
	// base64 strings are 4/3 larger than the original string
//	input = Utils.encodeUTF8(input); // convert non-ASCII characters
	input = Utils.convertToXMLReferences(input);
	if(window.btoa) return window.btoa(input); // Use native if available
	var _keyStr = svgedit.Utilities._keyStr;
	var output = new Array( Math.floor( (input.length + 2) / 3 ) * 4 );
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0, p = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output[p++] = _keyStr.charAt(enc1);
		output[p++] = _keyStr.charAt(enc2);
		output[p++] = _keyStr.charAt(enc3);
		output[p++] = _keyStr.charAt(enc4);
	} while (i < input.length);

	return output.join('');
};

// Function: Utils.decode64
// Converts a string from base64
svgedit.Utilities.decode64 = function(input) {
	if(window.atob) return window.atob(input);
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	 // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	 do {
		enc1 = _keyStr.indexOf(input.charAt(i++));
		enc2 = _keyStr.indexOf(input.charAt(i++));
		enc3 = _keyStr.indexOf(input.charAt(i++));
		enc4 = _keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
		   output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
		   output = output + String.fromCharCode(chr3);
		}

		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";

	 } while (i < input.length);
	 return unescape(output);
};

// Currently not being used, so commented out for now
// based on http://phpjs.org/functions/utf8_encode:577
// codedread:does not seem to work with webkit-based browsers on OSX
// 		"encodeUTF8": function(input) {
// 			//return unescape(encodeURIComponent(input)); //may or may not work
// 			var output = '';
// 			for (var n = 0; n < input.length; n++){
// 				var c = input.charCodeAt(n);
// 				if (c < 128) {
// 					output += input[n];
// 				}
// 				else if (c > 127) {
// 					if (c < 2048){
// 						output += String.fromCharCode((c >> 6) | 192);
// 					} 
// 					else {
// 						output += String.fromCharCode((c >> 12) | 224) + String.fromCharCode((c >> 6) & 63 | 128);
// 					}
// 					output += String.fromCharCode((c & 63) | 128);
// 				}
// 			}
// 			return output;
// 		},

// Function: svgedit.Utilities.convertToXMLReferences 
// Converts a string to use XML references
svgedit.Utilities.convertToXMLReferences = function(input) {
	var output = '';
	for (var n = 0; n < input.length; n++){
		var c = input.charCodeAt(n);
		if (c < 128) {
			output += input[n];
		}
		else if(c > 127) {
			output += ("&#" + c + ";");
		}
	}
	return output;
};

// Function: rectsIntersect
// Check if two rectangles (BBoxes objects) intersect each other
//
// Paramaters:
// r1 - The first BBox-like object
// r2 - The second BBox-like object
//
// Returns:
// Boolean that's true if rectangles intersect
svgedit.Utilities.rectsIntersect = function(r1, r2) {
	return r2.x < (r1.x+r1.width) && 
		(r2.x+r2.width) > r1.x &&
		r2.y < (r1.y+r1.height) &&
		(r2.y+r2.height) > r1.y;
};

// Function: snapToAngle
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
svgedit.Utilities.snapToAngle = function(x1,y1,x2,y2) {
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
},

// Function: text2xml
// Cross-browser compatible method of converting a string to an XML tree
// found this function here: http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
svgedit.Utilities.text2xml = function(sXML) {
	if(sXML.indexOf('<svg:svg') >= 0) {
		sXML = sXML.replace(/<(\/?)svg:/g, '<$1').replace('xmlns:svg', 'xmlns');
	}

	var out;
	try{
		var dXML = (window.DOMParser)?new DOMParser():new ActiveXObject("Microsoft.XMLDOM");
		dXML.async = false;
	} catch(e){ 
		throw new Error("XML Parser could not be instantiated"); 
	};
	try{
		if(dXML.loadXML) out = (dXML.loadXML(sXML))?dXML:false;
		else out = dXML.parseFromString(sXML, "text/xml");
	}
	catch(e){ throw new Error("Error parsing XML string"); };
	return out;
};

// Function: bboxToObj
// Converts a SVGRect into an object.
// 
// Parameters:
// bbox - a SVGRect
// 
// Returns:
// An object with properties names x, y, width, height.
svgedit.Utilities.bboxToObj = function(bbox) {
	return {
		x: bbox.x,
		y: bbox.y,
		width: bbox.width,
		height: bbox.height
	}
};

})();