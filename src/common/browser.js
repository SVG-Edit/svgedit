/**
 * Browser detection.
 * @module browser
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller, 2010 Alexis Deveria
 */

const NSSVG = 'http://www.w3.org/2000/svg'

const { userAgent } = navigator

// Note: Browser sniffing should only be used if no other detection method is possible
const isWebkit_ = userAgent.includes('AppleWebKit')
const isGecko_ = userAgent.includes('Gecko/')
const isChrome_ = userAgent.includes('Chrome/')
const isMac_ = userAgent.includes('Macintosh')

// text character positioning (for IE9 and now Chrome)
const supportsGoodTextCharPos_ = (function () {
  const svgroot = document.createElementNS(NSSVG, 'svg')
  const svgContent = document.createElementNS(NSSVG, 'svg')
  document.documentElement.append(svgroot)
  svgContent.setAttribute('x', 5)
  svgroot.append(svgContent)
  const text = document.createElementNS(NSSVG, 'text')
  text.textContent = 'a'
  svgContent.append(text)
  try { // Chrome now fails here
    const pos = text.getStartPositionOfChar(0).x
    return (pos === 0)
  } catch (err) {
    return false
  } finally {
    svgroot.remove()
  }
}())

// Public API

/**
 * @function module:browser.isWebkit
 * @returns {boolean}
*/
export const isWebkit = () => isWebkit_
/**
 * @function module:browser.isGecko
 * @returns {boolean}
*/
export const isGecko = () => isGecko_
/**
 * @function module:browser.isChrome
 * @returns {boolean}
*/
export const isChrome = () => isChrome_

/**
 * @function module:browser.isMac
 * @returns {boolean}
*/
export const isMac = () => isMac_

/**
 * @function module:browser.supportsGoodTextCharPos
 * @returns {boolean}
*/
export const supportsGoodTextCharPos = () => supportsGoodTextCharPos_
