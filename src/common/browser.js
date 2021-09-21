/**
 * Browser detection.
 * @module browser
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller, 2010 Alexis Deveria
 */

const NSSVG = 'http://www.w3.org/2000/svg';

const { userAgent } = navigator;

// Note: Browser sniffing should only be used if no other detection method is possible
const isWebkit_ = userAgent.includes('AppleWebKit');
const isGecko_ = userAgent.includes('Gecko/');
const isChrome_ = userAgent.includes('Chrome/');
const isMac_ = userAgent.includes('Macintosh');
const isTouch_ = 'ontouchstart' in window;

// text character positioning (for IE9 and now Chrome)
const supportsGoodTextCharPos_ = (function () {
  const svgroot = document.createElementNS(NSSVG, 'svg');
  const svgcontent = document.createElementNS(NSSVG, 'svg');
  document.documentElement.append(svgroot);
  svgcontent.setAttribute('x', 5);
  svgroot.append(svgcontent);
  const text = document.createElementNS(NSSVG, 'text');
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

// Support for correct bbox sizing on groups with horizontal/vertical lines
const supportsHVLineContainerBBox_ = (function () {
  const svgcontent = document.createElementNS(NSSVG, 'svg');
  document.documentElement.append(svgcontent);
  const path = document.createElementNS(NSSVG, 'path');
  path.setAttribute('d', 'M0,0 10,0');
  const path2 = document.createElementNS(NSSVG, 'path');
  path2.setAttribute('d', 'M5,0 15,0');
  const g = document.createElementNS(NSSVG, 'g');
  g.append(path, path2);
  svgcontent.append(g);
  const bbox = g.getBBox();
  svgcontent.remove();
  // Webkit gives 0, FF gives 10, Opera (correctly) gives 15
  return (bbox.width === 15);
}());

const supportsNonScalingStroke_ = (function () {
  const rect = document.createElementNS(NSSVG, 'rect');
  rect.setAttribute('style', 'vector-effect:non-scaling-stroke');
  return rect.style.vectorEffect === 'non-scaling-stroke';
}());

// Public API

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
 * @function module:browser.isChrome
 * @returns {boolean}
*/
export const isChrome = () => isChrome_;

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
* @function module:browser.supportsNonScalingStroke
* @returns {boolean}
*/
export const supportsNonScalingStroke = () => supportsNonScalingStroke_;

