/**
 * Package: svgedit.browser
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

var svgedit = svgedit || {};

(function() {

if (!svgedit.browser) {
	svgedit.browser = {};
}

var supportsSvg_ = (function() {
        return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
})();
svgedit.browser.supportsSvg = function() { return supportsSvg_; }
if(!svgedit.browser.supportsSvg()) {
	window.location = "browser-not-supported.html";
}
else{

var svgns = 'http://www.w3.org/2000/svg';
var userAgent = navigator.userAgent;
var svg = document.createElementNS(svgns, 'svg');

// Note: Browser sniffing should only be used if no other detection method is possible
var isOpera_ = !!window.opera;
var isWebkit_ = userAgent.indexOf("AppleWebKit") >= 0;
var isGecko_ = userAgent.indexOf('Gecko/') >= 0;

var supportsSelectors_ = (function() {
	return !!svg.querySelector;
})();

var supportsXpath_ = (function() {
	return !!document.evaluate;
})();

// segList functions (for FF1.5 and 2.0)
var supportsPathReplaceItem_ = (function() {
	var path = document.createElementNS(svgns, 'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.replaceItem(seg, 0);
		return true;
	} catch(err) {}
	return false;
})();

var supportsPathInsertItemBefore_ = (function() {
	var path = document.createElementNS(svgns,'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.insertItemBefore(seg, 0);
		return true;
	} catch(err) {}
	return false;
})();

// text character positioning
var supportsTextCharPos_ = (function() {
	var retValue = false;
	var svgcontent = document.createElementNS(svgns, 'svg');
	document.documentElement.appendChild(svgcontent);
	try {
		var text = document.createElementNS(svgns,'text');
		text.textContent = 'a';
		svgcontent.appendChild(text);
		text.getStartPositionOfChar(0);
		retValue = true;
	} catch(err) {}
	document.documentElement.removeChild(svgcontent);
	return retValue;
})();

var supportsEditableText_ = (function() {
	// TODO: Find better way to check support for this
	return isOpera_;
})();

var supportsGoodDecimals_ = (function() {
	// Correct decimals on clone attributes (Opera < 10.5/win/non-en)
	var rect = document.createElementNS(svgns, 'rect');
	rect.setAttribute('x',.1);
	var crect = rect.cloneNode(false);
	var retValue = (crect.getAttribute('x').indexOf(',') == -1);
	if(!retValue) {
		$.alert("NOTE: This version of Opera is known to contain bugs in SVG-edit.\n\
		Please upgrade to the <a href='http://opera.com'>latest version</a> in which the problems have been fixed.");
	}
	return retValue;
})();

var supportsNonScalingStroke_ = (function() {
	var rect = document.createElementNS(svgns, 'rect');
	rect.setAttribute('style','vector-effect:non-scaling-stroke');
	return rect.style.vectorEffect === 'non-scaling-stroke';
})();

var supportsNativeSVGTransformLists_ = (function() {
	var rect = document.createElementNS(svgns, 'rect');
	var rxform = rect.transform.baseVal;
	
	var t1 = svg.createSVGTransform();
	rxform.appendItem(t1);
	return rxform.getItem(0) == t1;
})();

// Public API

svgedit.browser.isOpera = function() { return isOpera_; }
svgedit.browser.isWebkit = function() { return isWebkit_; }
svgedit.browser.isGecko = function() { return isGecko_; }

svgedit.browser.supportsSelectors = function() { return supportsSelectors_; }
svgedit.browser.supportsXpath = function() { return supportsXpath_; }

svgedit.browser.supportsPathReplaceItem = function() { return supportsPathReplaceItem_; }
svgedit.browser.supportsPathInsertItemBefore = function() { return supportsPathInsertItemBefore_; }
svgedit.browser.supportsTextCharPos = function() { return supportsTextCharPos_; }
svgedit.browser.supportsEditableText = function() { return supportsEditableText_; }
svgedit.browser.supportsGoodDecimals = function() { return supportsGoodDecimals_; }
svgedit.browser.supportsNonScalingStroke = function() { return supportsNonScalingStroke_; }
svgedit.browser.supportsNativeTransformLists = function() { return supportsNativeSVGTransformLists_; }

}

})();
