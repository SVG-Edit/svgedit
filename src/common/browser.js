/**
 * Browser detection.
 * @module browser
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller, 2010 Alexis Deveria
 */

import 'pathseg';

const { userAgent } = navigator;

// Note: Browser sniffing should only be used if no other detection method is possible
const isWebkit_ = userAgent.includes('AppleWebKit');
const isGecko_ = userAgent.includes('Gecko/');
const isChrome_ = userAgent.includes('Chrome/');
const isMac_ = userAgent.includes('Macintosh');
const isTouch_ = 'ontouchstart' in window;

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



