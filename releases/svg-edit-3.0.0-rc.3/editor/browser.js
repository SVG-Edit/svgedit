/* globals jQuery */
/**
 * Browser detection
 * @module browser
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller, 2010 Alexis Deveria
 */

// Dependencies:
// 1) jQuery (for $.alert())

import './svgpathseg.js';
import {NS} from './namespaces.js';

const $ = jQuery;

const supportsSVG_ = (function () {
return !!document.createElementNS && !!document.createElementNS(NS.SVG, 'svg').createSVGRect;
}());

/**
 * @function module:browser.supportsSvg
 * @returns {boolean}
*/
export const supportsSvg = () => supportsSVG_;

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

// text character positioning (for IE9 and now Chrome)
const supportsGoodTextCharPos_ = (function () {
const svgroot = document.createElementNS(NS.SVG, 'svg');
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.append(svgroot);
svgcontent.setAttribute('x', 5);
svgroot.append(svgcontent);
const text = document.createElementNS(NS.SVG, 'text');
text.textContent = 'a';
svgcontent.append(text);
try { // Chrome now fails here
  const pos = text.getStartPositionOfChar(0).x;
  return (pos === 0);
} catch (err) {
  return false;
} finally {
  svgroot.remove();
}
}());

const supportsPathBBox_ = (function () {
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.append(svgcontent);
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 C0,0 10,10 10,0');
svgcontent.append(path);
const bbox = path.getBBox();
svgcontent.remove();
return (bbox.height > 4 && bbox.height < 5);
}());

// Support for correct bbox sizing on groups with horizontal/vertical lines
const supportsHVLineContainerBBox_ = (function () {
const svgcontent = document.createElementNS(NS.SVG, 'svg');
document.documentElement.append(svgcontent);
const path = document.createElementNS(NS.SVG, 'path');
path.setAttribute('d', 'M0,0 10,0');
const path2 = document.createElementNS(NS.SVG, 'path');
path2.setAttribute('d', 'M5,0 15,0');
const g = document.createElementNS(NS.SVG, 'g');
g.append(path, path2);
svgcontent.append(g);
const bbox = g.getBBox();
svgcontent.remove();
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

/**
 * @function module:browser.isOpera
 * @returns {boolean}
*/
export const isOpera = () => isOpera_;
/**
 * @function module:browser.isWebkit
 * @returns {boolean}
*/
export const isWebkit = () => isWebkit_;
/**
 * @function module:browser.isGecko
 * @returns {boolean}
*/
export const isGecko = () => isGecko_;
/**
 * @function module:browser.isIE
 * @returns {boolean}
*/
export const isIE = () => isIE_;
/**
 * @function module:browser.isChrome
 * @returns {boolean}
*/
export const isChrome = () => isChrome_;
/**
 * @function module:browser.isWindows
 * @returns {boolean}
*/
export const isWindows = () => isWindows_;
/**
 * @function module:browser.isMac
 * @returns {boolean}
*/
export const isMac = () => isMac_;
/**
 * @function module:browser.isTouch
 * @returns {boolean}
*/
export const isTouch = () => isTouch_;

/**
 * @function module:browser.supportsSelectors
 * @returns {boolean}
*/
export const supportsSelectors = () => supportsSelectors_;

/**
 * @function module:browser.supportsXpath
 * @returns {boolean}
*/
export const supportsXpath = () => supportsXpath_;

/**
 * @function module:browser.supportsPathReplaceItem
 * @returns {boolean}
*/
export const supportsPathReplaceItem = () => supportsPathReplaceItem_;

/**
 * @function module:browser.supportsPathInsertItemBefore
 * @returns {boolean}
*/
export const supportsPathInsertItemBefore = () => supportsPathInsertItemBefore_;

/**
 * @function module:browser.supportsPathBBox
 * @returns {boolean}
*/
export const supportsPathBBox = () => supportsPathBBox_;

/**
 * @function module:browser.supportsHVLineContainerBBox
 * @returns {boolean}
*/
export const supportsHVLineContainerBBox = () => supportsHVLineContainerBBox_;

/**
 * @function module:browser.supportsGoodTextCharPos
 * @returns {boolean}
*/
export const supportsGoodTextCharPos = () => supportsGoodTextCharPos_;

/**
* @function module:browser.supportsEditableText
 * @returns {boolean}
*/
export const supportsEditableText = () => supportsEditableText_;

/**
 * @function module:browser.supportsGoodDecimals
 * @returns {boolean}
*/
export const supportsGoodDecimals = () => supportsGoodDecimals_;

/**
* @function module:browser.supportsNonScalingStroke
* @returns {boolean}
*/
export const supportsNonScalingStroke = () => supportsNonScalingStroke_;

/**
* @function module:browser.supportsNativeTransformLists
* @returns {boolean}
*/
export const supportsNativeTransformLists = () => supportsNativeSVGTransformLists_;

/**
 * Set `supportsNativeSVGTransformLists_` to `false` (for unit testing)
 * @function module:browser.disableSupportsNativeTransformLists
 * @returns {undefined}
*/
export const disableSupportsNativeTransformLists = () => {
  supportsNativeSVGTransformLists_ = false;
};
