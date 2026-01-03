/**
 * Tools for SVG handle on JSON format.
 * @module svgcanvas
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */
import { getElement, assignAttributes, cleanupElement } from './utilities.js'
import { NS } from './namespaces.js'

let svgCanvas = null
let svgdoc_ = null

/**
 * @function module:json.jsonContext#getSelectedElements
 * @returns {Element[]} the array with selected DOM elements
*/
/**
 * @function module:json.jsonContext#getDOMDocument
 * @returns {HTMLDocument}
*/

/**
* @function module:json.init
* @param {module:json.jsonContext} jsonContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
  svgdoc_ = canvas.getDOMDocument?.() || (typeof document !== 'undefined' ? document : null)
}
/**
* @function module:json.getJsonFromSvgElements Iterate element and return json format
* @param {ArgumentsArray} data - element
* @returns {svgRootElement}
*/
export const getJsonFromSvgElements = (data) => {
  if (!data) return null

  // Text node
  if (data.nodeType === 3 || data.nodeType === 4) return data.nodeValue
  // Ignore non-element nodes (e.g., comments)
  if (data.nodeType !== 1) return null

  const retval = {
    element: data.tagName,
    // namespace: nsMap[data.namespaceURI],
    attr: {},
    children: []
  }

  // Iterate attributes
  const attributes = data.attributes
  if (attributes) {
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i]
      if (!attr) continue
      retval.attr[attr.name] = attr.value
    }
  }

  // Iterate children
  const childNodes = data.childNodes
  if (childNodes) {
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i]
      const child = getJsonFromSvgElements(node)
      if (child !== null && child !== undefined) {
        retval.children.push(child)
      }
    }
  }

  return retval
}

/**
* This should really be an intersection implementing all rather than a union.
* @name module:json.addSVGElementsFromJson
* @type {module:utilities.EditorContext#addSVGElementsFromJson|module:path.EditorContext#addSVGElementsFromJson}
*/

export const addSVGElementsFromJson = (data) => {
  if (!svgdoc_) { return null }
  if (data === null || data === undefined) return svgdoc_.createTextNode('')
  if (typeof data === 'string') return svgdoc_.createTextNode(data)

  const attrs = data.attr || {}
  const id = attrs.id
  let shape = null
  if (typeof id === 'string' && id) {
    try {
      shape = getElement(id)
    } catch (e) {
      // Ignore (CSS selector may be invalid); fallback to getElementById below
    }
    if (!shape) {
      const byId = svgdoc_.getElementById?.(id)
      const svgRoot = svgCanvas?.getSvgRoot?.()
      if (byId && (!svgRoot || svgRoot.contains(byId))) {
        shape = byId
      }
    }
  }
  // if shape is a path but we need to create a rect/ellipse, then remove the path
  const currentLayer = svgCanvas?.getDrawing?.()?.getCurrentLayer?.()
  if (shape && data.element !== shape.tagName) {
    shape.remove()
    shape = null
  }
  if (!shape) {
    const ns = data.namespace || NS.SVG
    shape = svgdoc_.createElementNS(ns, data.element)
    if (currentLayer) {
      (svgCanvas.getCurrentGroup() || currentLayer).append(shape)
    }
  }
  const curShape = svgCanvas.getCurShape?.() || {}
  if (data.curStyles) {
    const curOpacity = Number(curShape.opacity)
    const opacity = Number.isFinite(curOpacity) ? (curOpacity / 2) : 0.5
    assignAttributes(shape, {
      fill: curShape.fill,
      stroke: curShape.stroke,
      'stroke-width': curShape.stroke_width,
      'stroke-dasharray': curShape.stroke_dasharray,
      'stroke-linejoin': curShape.stroke_linejoin,
      'stroke-linecap': curShape.stroke_linecap,
      'stroke-opacity': curShape.stroke_opacity,
      'fill-opacity': curShape.fill_opacity,
      opacity,
      style: 'pointer-events:inherit'
    }, 100)
  }
  assignAttributes(shape, attrs, 100)
  cleanupElement(shape)

  // Children
  if (data.children) {
    while (shape.firstChild) {
      shape.firstChild.remove()
    }
    data.children.forEach((child) => {
      const childNode = addSVGElementsFromJson(child)
      if (childNode) {
        shape.append(childNode)
      }
    })
  }

  return shape
}
