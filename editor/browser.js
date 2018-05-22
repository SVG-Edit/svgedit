/* globals jQuery */
/**
 * Package: svgedit.browser
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

import './pathseg.js';
import {NS} from './svgedit.js';

const $ = jQuery;

const supportsSvg_ = (function () {
return !!document.createElementNS && !!document.createElementNS(NS.SVG, 'svg').createSVGRect;
}());

export const supportsSvg = () => supportsSvg_;

const {userAgent} = navigator;
const svg = document.createElementNS(NS.SVG, 'svg');

// Note: Browser sniffing should only be used if no other detection method is possible
const isOpera_ = !!window.opera;
const isWebkit_ = userAgent.includes('AppleWebKit');
const isGecko_ = userAgent.includes('Gecko/');
const isIE_ = userAgent.includes('MSIE');
const isChrome_ = userAgent.includes('Chrome/');
const isWindows_ = userAgent.includes('Windows');
const isMac_ = userAgent.includes('Macintosh');
const isTouch_ = 'ontouchstart' in window;

const supportsSelectors_ = (function () {
return !!svg.querySelector;
}());

const supportsXpath_ = (function () {
return !!document.evaluate;
}());

// segList functions (for FF1.5 and 2.0)
const supportsPathReplaceItem_ = (function () {
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 10,10');
const seglist = path.pathSegList;
const seg = path.createSVGPathSegLinetoAbs(5, 5);
try {
  seglist.replaceItem(seg, 1);
  return true;
} catch (err) {}
return false;
}());

const supportsPathInsertItemBefore_ = (function () {
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 10,10');
const seglist = path.pathSegList;
const seg = path.createSVGPathSegLinetoAbs(5, 5);
try {
  seglist.insertItemBefore(seg, 1);
  return true;
} catch (err) {}
return false;
}());

// text character positioning (for IE9)
const supportsGoodTextCharPos_ = (function () {
const svgroot = document.createElementNS(NS.SVG, 'svg');
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.appendChild(svgroot);
svgcontent.setAttribute('x', 5);
svgroot.appendChild(svgcontent);
const text = document.createElementNS(NS.SVG, 'text');
text.textContent = 'a';
svgcontent.appendChild(text);
const pos = text.getStartPositionOfChar(0).x;
document.documentElement.removeChild(svgroot);
return (pos === 0);
}());

const supportsPathBBox_ = (function () {
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.appendChild(svgcontent);
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 C0,0 10,10 10,0');
svgcontent.appendChild(path);
const bbox = path.getBBox();
document.documentElement.removeChild(svgcontent);
return (bbox.height > 4 && bbox.height < 5);
}());

// Support for correct bbox sizing on groups with horizontal/vertical lines
const supportsHVLineContainerBBox_ = (function () {
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.appendChild(svgcontent);
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 10,0');
const path2 = document.createElementNS(NS.SVG, 'path');
path2.setAttribute('d', 'M5,0 15,0');
const g = document.createElementNS(NS.SVG, 'g');
g.appendChild(path);
g.appendChild(path2);
svgcontent.appendChild(g);
const bbox = g.getBBox();
document.documentElement.removeChild(svgcontent);
// Webkit gives 0, FF gives 10, Opera (correctly) gives 15
return (bbox.width === 15);
}());

const supportsEditableText_ = (function () {
// TODO: Find better way to check support for this
return isOpera_;
}());

const supportsGoodDecimals_ = (function () {
// Correct decimals on clone attributes (Opera < 10.5/win/non-en)
const rect = document.createElementNS(NS.SVG, 'rect');
rect.setAttribute('x', 0.1);
const crect = rect.cloneNode(false);
const retValue = (!crect.getAttribute('x').includes(','));
if (!retValue) {
  // Todo: i18nize or remove
  $.alert('NOTE: This version of Opera is known to contain bugs in SVG-edit.\n' +
	'Please upgrade to the <a href="http://opera.com">latest version</a> in which the problems have been fixed.');
}
return retValue;
}());

const supportsNonScalingStroke_ = (function () {
const rect = document.createElementNS(NS.SVG, 'rect');
rect.setAttribute('style', 'vector-effect:non-scaling-stroke');
return rect.style.vectorEffect === 'non-scaling-stroke';
}());

let supportsNativeSVGTransformLists_ = (function () {
const rect = document.createElementNS(NS.SVG, 'rect');
const rxform = rect.transform.baseVal;
const t1 = svg.createSVGTransform();
rxform.appendItem(t1);
const r1 = rxform.getItem(0);
// Todo: Do frame-independent instance checking
return r1 instanceof SVGTransform && t1 instanceof SVGTransform &&
	r1.type === t1.type && r1.angle === t1.angle &&
	r1.matrix.a === t1.matrix.a &&
	r1.matrix.b === t1.matrix.b &&
	r1.matrix.c === t1.matrix.c &&
	r1.matrix.d === t1.matrix.d &&
	r1.matrix.e === t1.matrix.e &&
	r1.matrix.f === t1.matrix.f;
}());

// Public API

export const isOpera = () => isOpera_;
export const isWebkit = () => isWebkit_;
export const isGecko = () => isGecko_;
export const isIE = () => isIE_;
export const isChrome = () => isChrome_;
export const isWindows = () => isWindows_;
export const isMac = () => isMac_;
export const isTouch = () => isTouch_;

export const supportsSelectors = () => supportsSelectors_;
export const supportsXpath = () => supportsXpath_;

export const supportsPathReplaceItem = () => supportsPathReplaceItem_;
export const supportsPathInsertItemBefore = () => supportsPathInsertItemBefore_;
export const supportsPathBBox = () => supportsPathBBox_;
export const supportsHVLineContainerBBox = () => supportsHVLineContainerBBox_;
export const supportsGoodTextCharPos = () => supportsGoodTextCharPos_;
export const supportsEditableText = () => supportsEditableText_;
export const supportsGoodDecimals = () => supportsGoodDecimals_;
export const supportsNonScalingStroke = () => supportsNonScalingStroke_;
export const supportsNativeTransformLists = () => supportsNativeSVGTransformLists_;

// Using for unit testing
export const disableSupportsNativeTransformLists = () => {
  supportsNativeSVGTransformLists_ = false;
};
