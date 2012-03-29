/**
 * Package: svgedit.utilities
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) svgtransformlist.js

var svgedit = svgedit || {};

(function() {

if (!svgedit.utilities) {
	svgedit.utilities = {};
}

// Constants

// String used to encode base64.
var KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var SVGNS = 'http://www.w3.org/2000/svg';
var XLINKNS = 'http://www.w3.org/1999/xlink';
var XMLNS = "http://www.w3.org/XML/1998/namespace";

// Much faster than running getBBox() every time
var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
var visElems_arr = visElems.split(',');
//var hidElems = 'clipPath,defs,desc,feGaussianBlur,filter,linearGradient,marker,mask,metadata,pattern,radialGradient,stop,switch,symbol,title,textPath';

var editorContext_ = null;
var domdoc_ = null;
var domcontainer_ = null;
var svgroot_ = null;

svgedit.utilities.init = function(editorContext) {
	editorContext_ = editorContext;
	domdoc_ = editorContext.getDOMDocument();
	domcontainer_ = editorContext.getDOMContainer();
	svgroot_ = editorContext.getSVGRoot();
};

// Function: svgedit.utilities.toXml
// Converts characters in a string to XML-friendly entities.
//
// Example: "&" becomes "&amp;"
//
// Parameters:
// str - The string to be converted
//
// Returns:
// The converted string
svgedit.utilities.toXml = function(str) {
	return $('<p/>').text(str).html();
};
	
// Function: svgedit.utilities.fromXml
// Converts XML entities in a string to single characters. 
// Example: "&amp;" becomes "&"
//
// Parameters:
// str - The string to be converted
//
// Returns: 
// The converted string
svgedit.utilities.fromXml = function(str) {
	return $('<p/>').html(str).text();
};

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//           also precalculate the size of the array needed.

// Function: svgedit.utilities.encode64
// Converts a string to base64
svgedit.utilities.encode64 = function(input) {
	// base64 strings are 4/3 larger than the original string
//	input = svgedit.utilities.encodeUTF8(input); // convert non-ASCII characters
	input = svgedit.utilities.convertToXMLReferences(input);
	if(window.btoa) return window.btoa(input); // Use native if available
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

		output[p++] = KEYSTR.charAt(enc1);
		output[p++] = KEYSTR.charAt(enc2);
		output[p++] = KEYSTR.charAt(enc3);
		output[p++] = KEYSTR.charAt(enc4);
	} while (i < input.length);

	return output.join('');
};

// Function: svgedit.utilities.decode64
// Converts a string from base64
svgedit.utilities.decode64 = function(input) {
	if(window.atob) return window.atob(input);
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;

	 // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	 do {
		enc1 = KEYSTR.indexOf(input.charAt(i++));
		enc2 = KEYSTR.indexOf(input.charAt(i++));
		enc3 = KEYSTR.indexOf(input.charAt(i++));
		enc4 = KEYSTR.indexOf(input.charAt(i++));

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

// Function: svgedit.utilities.convertToXMLReferences 
// Converts a string to use XML references
svgedit.utilities.convertToXMLReferences = function(input) {
	var output = '';
	for (var n = 0; n < input.length; n++){
		var c = input.charCodeAt(n);
		if (c < 128) {
			output += input[n];
		} else if(c > 127) {
			output += ("&#" + c + ";");
		}
	}
	return output;
};

// Function: svgedit.utilities.text2xml
// Cross-browser compatible method of converting a string to an XML tree
// found this function here: http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
svgedit.utilities.text2xml = function(sXML) {
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

// Function: svgedit.utilities.bboxToObj
// Converts a SVGRect into an object.
// 
// Parameters:
// bbox - a SVGRect
// 
// Returns:
// An object with properties names x, y, width, height.
svgedit.utilities.bboxToObj = function(bbox) {
	return {
		x: bbox.x,
		y: bbox.y,
		width: bbox.width,
		height: bbox.height
	}
};

// Function: svgedit.utilities.walkTree
// Walks the tree and executes the callback on each element in a top-down fashion
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
svgedit.utilities.walkTree = function(elem, cbFn){
	if (elem && elem.nodeType == 1) {
		cbFn(elem);
		var i = elem.childNodes.length;
		while (i--) {
			svgedit.utilities.walkTree(elem.childNodes.item(i), cbFn);
		}
	}
};

// Function: svgedit.utilities.walkTreePost
// Walks the tree and executes the callback on each element in a depth-first fashion
// TODO: FIXME: Shouldn't this be calling walkTreePost?
//
// Parameters:
// elem - DOM element to traverse
// cbFn - Callback function to run on each element
svgedit.utilities.walkTreePost = function(elem, cbFn) {
	if (elem && elem.nodeType == 1) {
		var i = elem.childNodes.length;
		while (i--) {
			svgedit.utilities.walkTree(elem.childNodes.item(i), cbFn);
		}
		cbFn(elem);
	}
};

// Function: svgedit.utilities.getUrlFromAttr
// Extracts the URL from the url(...) syntax of some attributes.  
// Three variants:
// 	* <circle fill="url(someFile.svg#foo)" />
//  * <circle fill="url('someFile.svg#foo')" />
//  * <circle fill='url("someFile.svg#foo")' />
//
// Parameters:
// attrVal - The attribute value as a string
// 
// Returns:
// String with just the URL, like someFile.svg#foo
svgedit.utilities.getUrlFromAttr = function(attrVal) {
	if (attrVal) {		
		// url("#somegrad")
		if (attrVal.indexOf('url("') === 0) {
			return attrVal.substring(5,attrVal.indexOf('"',6));
		}
		// url('#somegrad')
		else if (attrVal.indexOf("url('") === 0) {
			return attrVal.substring(5,attrVal.indexOf("'",6));
		}
		else if (attrVal.indexOf("url(") === 0) {
			return attrVal.substring(4,attrVal.indexOf(')'));
		}
	}
	return null;
};

// Function: svgedit.utilities.getHref
// Returns the given element's xlink:href value
svgedit.utilities.getHref = function(elem) {
	return elem.getAttributeNS(XLINKNS, "href");
}

// Function: svgedit.utilities.setHref
// Sets the given element's xlink:href value
svgedit.utilities.setHref = function(elem, val) {
	elem.setAttributeNS(XLINKNS, "xlink:href", val);
}

// Function: findDefs
// Parameters:
// svgElement - The <svg> element.
//
// Returns:
// The document's <defs> element, create it first if necessary
svgedit.utilities.findDefs = function(svgElement) {
	var svgElement = editorContext_.getSVGContent().documentElement;
	var defs = svgElement.getElementsByTagNameNS(SVGNS, "defs");
	if (defs.length > 0) {
		defs = defs[0];
	}
	else {
		// first child is a comment, so call nextSibling
		defs = svgElement.insertBefore( svgElement.ownerDocument.createElementNS(SVGNS, "defs" ), svgElement.firstChild.nextSibling);
	}
	return defs;
};

// TODO(codedread): Consider moving the next to functions to bbox.js

// Function: svgedit.utilities.getPathBBox
// Get correct BBox for a path in Webkit
// Converted from code found here:
// http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
// 
// Parameters:
// path - The path DOM element to get the BBox for
//
// Returns:
// A BBox-like object
svgedit.utilities.getPathBBox = function(path) {
	var seglist = path.pathSegList;
	var tot = seglist.numberOfItems;
	
	var bounds = [[], []];
	var start = seglist.getItem(0);
	var P0 = [start.x, start.y];
	
	for(var i=0; i < tot; i++) {
		var seg = seglist.getItem(i);
		
		// Add actual points to limits
		bounds[0].push(P0[0]);
		bounds[1].push(P0[1]);
		
		if(seg.x1) {
			var P1 = [seg.x1, seg.y1],
				P2 = [seg.x2, seg.y2],
				P3 = [seg.x, seg.y];

			for(var j=0; j < 2; j++) {

				var calc = function(t) {
					return Math.pow(1-t,3) * P0[j] 
						+ 3 * Math.pow(1-t,2) * t * P1[j]
						+ 3 * (1-t) * Math.pow(t,2) * P2[j]
						+ Math.pow(t,3) * P3[j];
				};

				var b = 6 * P0[j] - 12 * P1[j] + 6 * P2[j];
				var a = -3 * P0[j] + 9 * P1[j] - 9 * P2[j] + 3 * P3[j];
				var c = 3 * P1[j] - 3 * P0[j];
				
				if(a == 0) {
					if(b == 0) {
						continue;
					}
					var t = -c / b;
					if(0 < t && t < 1) {
						bounds[j].push(calc(t));
					}
					continue;
				}
				
				var b2ac = Math.pow(b,2) - 4 * c * a;
				if(b2ac < 0) continue;
				var t1 = (-b + Math.sqrt(b2ac))/(2 * a);
				if(0 < t1 && t1 < 1) bounds[j].push(calc(t1));
				var t2 = (-b - Math.sqrt(b2ac))/(2 * a);
				if(0 < t2 && t2 < 1) bounds[j].push(calc(t2));
			}
			P0 = P3;
		} else {
			bounds[0].push(seg.x);
			bounds[1].push(seg.y);
		}
	}
	
	var x = Math.min.apply(null, bounds[0]);
	var w = Math.max.apply(null, bounds[0]) - x;
	var y = Math.min.apply(null, bounds[1]);
	var h = Math.max.apply(null, bounds[1]) - y;
	return {
		'x': x,
		'y': y,
		'width': w,
		'height': h
	};
};

// Function: groupBBFix
// Get the given/selected element's bounding box object, checking for
// horizontal/vertical lines (see issue 717)
// Note that performance is currently terrible, so some way to improve would
// be great.
//
// Parameters: 
// selected - Container or <use> DOM element
function groupBBFix(selected) {
	if(svgedit.browser.supportsHVLineContainerBBox()) {
		try { return selected.getBBox();} catch(e){} 
	}
	var ref = $.data(selected, 'ref');
	var matched = null;
	
	if(ref) {
		var copy = $(ref).children().clone().attr('visibility', 'hidden');
		$(svgroot_).append(copy);
		matched = copy.filter('line, path');
	} else {
		matched = $(selected).find('line, path');
	}
	
	var issue = false;
	if(matched.length) {
		matched.each(function() {
			var bb = this.getBBox();
			if(!bb.width || !bb.height) {
				issue = true;
			}
		});
		if(issue) {
			var elems = ref ? copy : $(selected).children();
			ret = getStrokedBBox(elems);
		} else {
			ret = selected.getBBox();
		}
	} else {
		ret = selected.getBBox();
	}
	if(ref) {
		copy.remove();
	}
	return ret;
}

// Function: svgedit.utilities.getBBox
// Get the given/selected element's bounding box object, convert it to be more
// usable when necessary
//
// Parameters:
// elem - Optional DOM element to get the BBox for
svgedit.utilities.getBBox = function(elem) {
	var selected = elem || editorContext_.geSelectedElements()[0];
	if (elem.nodeType != 1) return null;
	var ret = null;
	var elname = selected.nodeName;
	
	switch ( elname ) {
	case 'text':
		if(selected.textContent === '') {
			selected.textContent = 'a'; // Some character needed for the selector to use.
			ret = selected.getBBox();
			selected.textContent = '';
		} else {
			try { ret = selected.getBBox();} catch(e){}
		}
		break;
	case 'path':
		if(!svgedit.browser.supportsPathBBox()) {
			ret = svgedit.utilities.getPathBBox(selected);
		} else {
			try { ret = selected.getBBox();} catch(e){}
		}
		break;
	case 'g':
	case 'a':
		ret = groupBBFix(selected);
		break;
	default:

		if(elname === 'use') {
			ret = groupBBFix(selected, true);
		}
		
		if(elname === 'use' || elname === 'foreignObject') {
			if(!ret) ret = selected.getBBox();
			if(!svgedit.browser.isWebkit()) {
				var bb = {};
				bb.width = ret.width;
				bb.height = ret.height;
				bb.x = ret.x + parseFloat(selected.getAttribute('x')||0);
				bb.y = ret.y + parseFloat(selected.getAttribute('y')||0);
				ret = bb;
			}
		} else if(~visElems_arr.indexOf(elname)) {
			try { ret = selected.getBBox();} 
			catch(e) { 
				// Check if element is child of a foreignObject
				var fo = $(selected).closest("foreignObject");
				if(fo.length) {
					try {
						ret = fo[0].getBBox();
					} catch(e) {
						ret = null;
					}
				} else {
					ret = null;
				}
			}
		}
	}
	
	if(ret) {
		ret = svgedit.utilities.bboxToObj(ret);
	}

	// get the bounding box from the DOM (which is in that element's coordinate system)
	return ret;
};

// Function: svgedit.utilities.getRotationAngle
// Get the rotation angle of the given/selected DOM element
//
// Parameters:
// elem - Optional DOM element to get the angle for
// to_rad - Boolean that when true returns the value in radians rather than degrees
//
// Returns:
// Float with the angle in degrees or radians
svgedit.utilities.getRotationAngle = function(elem, to_rad) {
	var selected = elem || editorContext_.getSelectedElements()[0];
	// find the rotation transform (if any) and set it
	var tlist = svgedit.transformlist.getTransformList(selected);
	if(!tlist) return 0; // <svg> elements have no tlist
	var N = tlist.numberOfItems;
	for (var i = 0; i < N; ++i) {
		var xform = tlist.getItem(i);
		if (xform.type == 4) {
			return to_rad ? xform.angle * Math.PI / 180.0 : xform.angle;
		}
	}
	return 0.0;
};

// Function: getElem
// Get a DOM element by ID within the SVG root element.
//
// Parameters:
// id - String with the element's new ID
if (svgedit.browser.supportsSelectors()) {
	svgedit.utilities.getElem = function(id) {
		// querySelector lookup
		return svgroot_.querySelector('#'+id);
	};
} else if (svgedit.browser.supportsXpath()) {
	svgedit.utilities.getElem = function(id) {
		// xpath lookup
		return domdoc_.evaluate(
			'svg:svg[@id="svgroot"]//svg:*[@id="'+id+'"]',
			domcontainer_, 
			function() { return "http://www.w3.org/2000/svg"; },
			9,
			null).singleNodeValue;
	};
} else {
	svgedit.utilities.getElem = function(id) {
		// jQuery lookup: twice as slow as xpath in FF
		return $(svgroot_).find('[id=' + id + ']')[0];
	};
}

// Function: assignAttributes
// Assigns multiple attributes to an element.
//
// Parameters: 
// node - DOM element to apply new attribute values to
// attrs - Object with attribute keys/values
// suspendLength - Optional integer of milliseconds to suspend redraw
// unitCheck - Boolean to indicate the need to use svgedit.units.setUnitAttr
svgedit.utilities.assignAttributes = function(node, attrs, suspendLength, unitCheck) {
	if(!suspendLength) suspendLength = 0;
	// Opera has a problem with suspendRedraw() apparently
	var handle = null;
	if (!svgedit.browser.isOpera()) svgroot_.suspendRedraw(suspendLength);

	for (var i in attrs) {
		var ns = (i.substr(0,4) === "xml:" ? XMLNS : 
			i.substr(0,6) === "xlink:" ? XLINKNS : null);
			
		if(ns) {
			node.setAttributeNS(ns, i, attrs[i]);
		} else if(!unitCheck) {
			node.setAttribute(i, attrs[i]);
		} else {
			svgedit.units.setUnitAttr(node, i, attrs[i]);
		}
		
	}
	
	if (!svgedit.browser.isOpera()) svgroot_.unsuspendRedraw(handle);
};

// Function: cleanupElement
// Remove unneeded (default) attributes, makes resulting SVG smaller
//
// Parameters:
// element - DOM element to clean up
svgedit.utilities.cleanupElement = function(element) {
	var handle = svgroot_.suspendRedraw(60);
	var defaults = {
		'fill-opacity':1,
		'stop-opacity':1,
		'opacity':1,
		'stroke':'none',
		'stroke-dasharray':'none',
		'stroke-linejoin':'miter',
		'stroke-linecap':'butt',
		'stroke-opacity':1,
		'stroke-width':1,
		'rx':0,
		'ry':0
	}
	
	for(var attr in defaults) {
		var val = defaults[attr];
		if(element.getAttribute(attr) == val) {
			element.removeAttribute(attr);
		}
	}
	
	svgroot_.unsuspendRedraw(handle);
};


})();
