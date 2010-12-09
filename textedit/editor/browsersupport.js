/**
 * Package: svgedit.browsersupport
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.browsersupport) {
	svgedit.browsersupport = {};
}

var svgns = 'http://www.w3.org/2000/svg';
var userAgent = navigator.userAgent;
var svg = document.createElementNS(svgns, 'svg');

// Note: Browser sniffing should only be used if no other detection method is possible
var isOpera_ = !!window.opera;
var isWebkit_ = userAgent.indexOf("AppleWebKit") >= 0;
var isGecko_ = userAgent.indexOf('Gecko/') >= 0;

svgedit.browsersupport.isOpera = function() { return isOpera_; }
svgedit.browsersupport.isWebkit = function() { return isWebkit_; }
svgedit.browsersupport.isGecko = function() { return isGecko_; }

// segList functions (for FF1.5 and 2.0)
function supportPathReplaceItem() {
	var path = document.createElementNS(svgns, 'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.replaceItem(seg, 0);
		return true;
	} catch(err) {}
	return false;
}

function supportPathInsertItemBefore() {
	var path = document.createElementNS(svgns,'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.insertItemBefore(seg, 0);
		return true;
	} catch(err) {}
	return false;
}

// text character positioning
function supportTextCharPos() {
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
}

function supportEditableText() {
	// TODO: Find better way to check support for this
	return svgedit.browsersupport.isOpera();
}

function supportGoodDecimals() {
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
}

function supportNonScalingStroke() {
	var rect = document.createElementNS(svgns, 'rect');
	rect.setAttribute('style','vector-effect:non-scaling-stroke');
	return rect.style.vectorEffect === 'non-scaling-stroke';
}

function supportNativeSVGTransformLists() {
	var rect = document.createElementNS(svgns, 'rect');
	var rxform = rect.transform.baseVal;
	
	var t1 = svg.createSVGTransform();
	rxform.appendItem(t1);
	return rxform.getItem(0) == t1;
}

svgedit.browsersupport.pathReplaceItem = supportPathReplaceItem();
svgedit.browsersupport.pathInsertItemBefore = supportPathInsertItemBefore();
svgedit.browsersupport.textCharPos = supportTextCharPos();
svgedit.browsersupport.editableText = supportEditableText();
svgedit.browsersupport.goodDecimals = supportGoodDecimals();
svgedit.browsersupport.nonScalingStroke = supportNonScalingStroke();
svgedit.browsersupport.nativeTransformLists = supportNativeSVGTransformLists();

})();