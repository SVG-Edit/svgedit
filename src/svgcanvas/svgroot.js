/**
 * Tools for SVG Root Element.
 * @module svgcanvas
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */
import { NS } from './namespaces.js'
import { text2xml } from './utilities.js'

/**
* @function module:svgcanvas.svgRootElement svgRootElement the svg node and its children.
* @param {Element} svgdoc - window.document
* @param {ArgumentsArray} dimensions - dimensions of width and height
* @returns {svgRootElement}
*/
export const svgRootElement = function (svgdoc, dimensions) {
  return svgdoc.importNode(
    text2xml(
      `<svg id="svgroot" xmlns="${NS.SVG}" xlinkns="${NS.XLINK}" width="${dimensions[0]}" 
        height="${dimensions[1]}" x="${dimensions[0]}" y="${dimensions[1]}" overflow="visible">
        <defs>
          <filter id="canvashadow" filterUnits="objectBoundingBox">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
            <feOffset in="blur" dx="5" dy="5" result="offsetBlur"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>`
    ).documentElement,
    true
  )
}
