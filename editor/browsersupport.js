/**
 * Browser Support module for SVG-edit
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

(function() {

if (window.svgedit == undefined) {
	window.svgedit = {};
}

svgedit.BrowserSupport = {};

var svgns = 'http://www.w3.org/2000/svg';
var userAgent = navigator.userAgent;

// Note: Browser sniffing should only be used if no other detection method is possible
svgedit.BrowserSupport.isOpera = !!window.opera;
svgedit.BrowserSupport.isWebkit = userAgent.indexOf("AppleWebKit") >= 0;
svgedit.BrowserSupport.isGecko = userAgent.indexOf('Gecko/') >= 0;

// segList functions (for FF1.5 and 2.0)
function getPathReplaceItem() {
	var path = document.createElementNS(svgns,'path');
	path.setAttribute('d','M0,0 10,10');
	var seglist = path.pathSegList;
	var seg = path.createSVGPathSegLinetoAbs(5,5);
	try {
		seglist.replaceItem(seg, 0);
		return true;
	} catch(err) {}
	return false;
}

function getPathInsertItemBefore() {
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
function getTextCharPos() {
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

function getEditableText() {
	// TODO: Find better way to check support for this
	return svgedit.BrowserSupport.isOpera;
}

function getGoodDecimals() {
	// Correct decimals on clone attributes (Opera < 10.5/win/non-en)
	var rect = document.createElementNS(svgns,'rect');
	rect.setAttribute('x',.1);
	var crect = rect.cloneNode(false);
	var retValue = (crect.getAttribute('x').indexOf(',') == -1);
	if(!retValue) {
		$.alert("NOTE: This version of Opera is known to contain bugs in SVG-edit.\n\
		Please upgrade to the <a href='http://opera.com'>latest version</a> in which the problems have been fixed.");
	}
	return retValue;
}

function getNonScalingStroke() {
	var rect = document.createElementNS(svgns,'rect');
	rect.setAttribute('style','vector-effect:non-scaling-stroke');
	return rect.style.vectorEffect === 'non-scaling-stroke';
}

svgedit.BrowserSupport.pathReplaceItem = getPathReplaceItem();
svgedit.BrowserSupport.pathInsertItemBefore = getPathInsertItemBefore();
svgedit.BrowserSupport.textCharPos = getTextCharPos();
svgedit.BrowserSupport.editableText = getEditableText();
svgedit.BrowserSupport.goodDecimals = getGoodDecimals();
svgedit.BrowserSupport.nonScalingStroke = getNonScalingStroke();

})();