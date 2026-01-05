/**
 * Browser detection.
 * @module browser
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller, 2010 Alexis Deveria
 */

const NSSVG = 'http://www.w3.org/2000/svg'

/**
 * Browser capabilities and detection object.
 * Uses modern feature detection and lazy evaluation patterns.
 */
class BrowserDetector {
  #userAgent = navigator.userAgent
  #cachedResults = new Map()

  /**
   * Detects if the browser is WebKit-based
   * @returns {boolean}
   */
  get isWebkit () {
    if (!this.#cachedResults.has('isWebkit')) {
      this.#cachedResults.set('isWebkit', this.#userAgent.includes('AppleWebKit'))
    }
    return this.#cachedResults.get('isWebkit')
  }

  /**
   * Detects if the browser is Gecko-based
   * @returns {boolean}
   */
  get isGecko () {
    if (!this.#cachedResults.has('isGecko')) {
      this.#cachedResults.set('isGecko', this.#userAgent.includes('Gecko/'))
    }
    return this.#cachedResults.get('isGecko')
  }

  /**
   * Detects if the browser is Chrome
   * @returns {boolean}
   */
  get isChrome () {
    if (!this.#cachedResults.has('isChrome')) {
      this.#cachedResults.set('isChrome', this.#userAgent.includes('Chrome/'))
    }
    return this.#cachedResults.get('isChrome')
  }

  /**
   * Detects if the platform is macOS
   * @returns {boolean}
   */
  get isMac () {
    if (!this.#cachedResults.has('isMac')) {
      this.#cachedResults.set('isMac', this.#userAgent.includes('Macintosh'))
    }
    return this.#cachedResults.get('isMac')
  }

  /**
   * Tests if the browser supports accurate text character positioning
   * @returns {boolean}
   */
  get supportsGoodTextCharPos () {
    if (!this.#cachedResults.has('supportsGoodTextCharPos')) {
      this.#cachedResults.set('supportsGoodTextCharPos', this.#testTextCharPos())
    }
    return this.#cachedResults.get('supportsGoodTextCharPos')
  }

  /**
   * Private method to test text character positioning support
   * @returns {boolean}
   */
  #testTextCharPos () {
    const svgroot = document.createElementNS(NSSVG, 'svg')
    const svgContent = document.createElementNS(NSSVG, 'svg')
    document.documentElement.append(svgroot)
    svgContent.setAttribute('x', 5)
    svgroot.append(svgContent)
    const text = document.createElementNS(NSSVG, 'text')
    text.textContent = 'a'
    svgContent.append(text)

    try {
      const pos = text.getStartPositionOfChar(0).x
      return pos === 0
    } catch (err) {
      return false
    } finally {
      svgroot.remove()
    }
  }
}

// Create singleton instance
const browser = new BrowserDetector()

// Export as functions for backward compatibility
/**
 * @function module:browser.isWebkit
 * @returns {boolean}
 */
export const isWebkit = () => browser.isWebkit

/**
 * @function module:browser.isGecko
 * @returns {boolean}
 */
export const isGecko = () => browser.isGecko

/**
 * @function module:browser.isChrome
 * @returns {boolean}
 */
export const isChrome = () => browser.isChrome

/**
 * @function module:browser.isMac
 * @returns {boolean}
 */
export const isMac = () => browser.isMac

/**
 * @function module:browser.supportsGoodTextCharPos
 * @returns {boolean}
 */
export const supportsGoodTextCharPos = () => browser.supportsGoodTextCharPos

// Export browser instance for direct access
export default browser
