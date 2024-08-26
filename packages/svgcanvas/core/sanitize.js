/**
 * Tools for SVG sanitization.
 * @module sanitize
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { getReverseNS, NS } from './namespaces.js'
import { getHref, setHref, getUrlFromAttr } from './utilities.js'

const REVERSE_NS = getReverseNS()

// Todo: Split out into core attributes, presentation attributes, etc. so consistent
/**
 * This defines which elements and attributes that we support (or at least
 * don't remove).
 * @type {PlainObject}
 */
/* eslint-disable max-len */
const svgGenericWhiteList = ['class', 'id', 'display', 'transform', 'style']
const svgWhiteList_ = {
  // SVG Elements
  a: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'mask', 'opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'xlink:href', 'xlink:title'],
  circle: ['clip-path', 'clip-rule', 'cx', 'cy', 'enable-background', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'mask', 'opacity', 'r', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage'],
  clipPath: ['clipPathUnits'],
  defs: [],
  desc: [],
  ellipse: ['clip-path', 'clip-rule', 'cx', 'cy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'mask', 'opacity', 'requiredFeatures', 'rx', 'ry', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage'],
  feBlend: ['in', 'in2'],
  feColorMatrix: ['in', 'type', 'value', 'result', 'values'],
  feComposite: ['in', 'operator', 'result', 'in2'],
  feFlood: ['flood-color', 'in', 'result', 'flood-opacity'],
  feGaussianBlur: ['color-interpolation-filters', 'in', 'requiredFeatures', 'stdDeviation', 'result'],
  feMerge: [],
  feMergeNode: ['in'],
  feMorphology: ['in', 'operator', 'radius'],
  feOffset: ['dx', 'in', 'dy', 'result'],
  filter: ['color-interpolation-filters', 'filterRes', 'filterUnits', 'height', 'primitiveUnits', 'requiredFeatures', 'width', 'x', 'xlink:href', 'y'],
  foreignObject: ['font-size', 'height', 'opacity', 'requiredFeatures', 'width', 'x', 'y'],
  g: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-anchor'],
  image: ['clip-path', 'clip-rule', 'filter', 'height', 'mask', 'opacity', 'requiredFeatures', 'systemLanguage', 'width', 'x', 'xlink:href', 'xlink:title', 'y'],
  line: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'x1', 'x2', 'y1', 'y2'],
  linearGradient: ['gradientTransform', 'gradientUnits', 'requiredFeatures', 'spreadMethod', 'systemLanguage', 'x1', 'x2', 'xlink:href', 'y1', 'y2'],
  marker: ['markerHeight', 'markerUnits', 'markerWidth', 'orient', 'preserveAspectRatio', 'refX', 'refY', 'se_type', 'systemLanguage', 'viewBox'],
  mask: ['height', 'maskContentUnits', 'maskUnits', 'width', 'x', 'y'],
  metadata: [],
  path: ['clip-path', 'clip-rule', 'd', 'enable-background', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage'],
  pattern: ['height', 'patternContentUnits', 'patternTransform', 'patternUnits', 'requiredFeatures', 'systemLanguage', 'viewBox', 'width', 'x', 'xlink:href', 'y'],
  polygon: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'points', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'sides', 'shape', 'edge', 'point', 'starRadiusMultiplier', 'r', 'radialshift', 'r2', 'orient', 'cx', 'cy'],
  polyline: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'points', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'se:connector'],
  radialGradient: ['cx', 'cy', 'fx', 'fy', 'gradientTransform', 'gradientUnits', 'r', 'requiredFeatures', 'spreadMethod', 'systemLanguage', 'xlink:href'],
  rect: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'height', 'mask', 'opacity', 'requiredFeatures', 'rx', 'ry', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'width', 'x', 'y'],
  stop: ['offset', 'requiredFeatures', 'stop-opacity', 'systemLanguage', 'stop-color', 'gradientUnits', 'gradientTransform'],
  style: ['type'],
  svg: ['clip-path', 'clip-rule', 'enable-background', 'filter', 'height', 'mask', 'preserveAspectRatio', 'requiredFeatures', 'systemLanguage', 'version', 'viewBox', 'width', 'x', 'xmlns', 'xmlns:se', 'xmlns:xlink', 'xmlns:oi', 'oi:animations', 'y', 'stroke-linejoin', 'fill-rule', 'aria-label', 'stroke-width', 'fill-rule', 'xml:space'],
  switch: ['requiredFeatures', 'systemLanguage'],
  symbol: ['fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'opacity', 'overflow', 'preserveAspectRatio', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'viewBox', 'width', 'height'],
  text: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'text-anchor', 'letter-spacing', 'word-spacing', 'text-decoration', 'textLength', 'lengthAdjust', 'x', 'xml:space', 'y'],
  textPath: ['method', 'requiredFeatures', 'spacing', 'startOffset', 'systemLanguage', 'xlink:href'],
  title: [],
  tspan: ['clip-path', 'clip-rule', 'dx', 'dy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'mask', 'opacity', 'requiredFeatures', 'rotate', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'systemLanguage', 'text-anchor', 'textLength', 'x', 'xml:space', 'y'],
  use: ['clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'height', 'mask', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'width', 'x', 'xlink:href', 'y', 'overflow'],

  // MathML Elements
  annotation: ['encoding'],
  'annotation-xml': ['encoding'],
  maction: ['actiontype', 'other', 'selection'],
  math: ['xmlns'],
  menclose: ['notation'],
  merror: [],
  mfrac: ['linethickness'],
  mi: ['mathvariant'],
  mmultiscripts: [],
  mn: [],
  mo: ['fence', 'lspace', 'maxsize', 'minsize', 'rspace', 'stretchy'],
  mover: [],
  mpadded: ['lspace', 'width', 'height', 'depth', 'voffset'],
  mphantom: [],
  mprescripts: [],
  mroot: [],
  mrow: ['xlink:href', 'xlink:type', 'xmlns:xlink'],
  mspace: ['depth', 'height', 'width'],
  msqrt: [],
  mstyle: ['displaystyle', 'mathbackground', 'mathcolor', 'mathvariant', 'scriptlevel'],
  msub: [],
  msubsup: [],
  msup: [],
  mtable: ['align', 'columnalign', 'columnlines', 'columnspacing', 'displaystyle', 'equalcolumns', 'equalrows', 'frame', 'rowalign', 'rowlines', 'rowspacing', 'width'],
  mtd: ['columnalign', 'columnspan', 'rowalign', 'rowspan'],
  mtext: [],
  mtr: ['columnalign', 'rowalign'],
  munder: [],
  munderover: [],
  none: [],
  semantics: []
}
/* eslint-enable max-len */

// add generic attributes to all elements of the whitelist
Object.keys(svgWhiteList_).forEach((element) => { svgWhiteList_[element] = [...svgWhiteList_[element], ...svgGenericWhiteList] })

// Produce a Namespace-aware version of svgWhitelist
const svgWhiteListNS_ = {}
Object.entries(svgWhiteList_).forEach(([elt, atts]) => {
  const attNS = {}
  Object.entries(atts).forEach(([_i, att]) => {
    if (att.includes(':')) {
      const v = att.split(':')
      attNS[v[1]] = NS[(v[0]).toUpperCase()]
    } else {
      attNS[att] = att === 'xmlns' ? NS.XMLNS : null
    }
  })
  svgWhiteListNS_[elt] = attNS
})

/**
* Sanitizes the input node and its children.
* It only keeps what is allowed from our whitelist defined above.
* @function module:sanitize.sanitizeSvg
* @param {Text|Element} node - The DOM element to be checked (we'll also check its children) or text node to be cleaned up
* @returns {void}
*/
export const sanitizeSvg = (node) => {
  // Cleanup text nodes
  if (node.nodeType === 3) { // 3 === TEXT_NODE
    // Trim whitespace
    node.nodeValue = node.nodeValue.trim()
    // Remove if empty
    if (!node.nodeValue.length) {
      node.remove()
    }
  }

  // We only care about element nodes.
  // Automatically return for all non-element nodes, such as comments, etc.
  if (node.nodeType !== 1) { // 1 == ELEMENT_NODE
    return
  }

  const doc = node.ownerDocument
  const parent = node.parentNode
  // can parent ever be null here?  I think the root node's parent is the document...
  if (!doc || !parent) {
    return
  }

  const allowedAttrs = svgWhiteList_[node.nodeName]
  const allowedAttrsNS = svgWhiteListNS_[node.nodeName]
  // if this element is supported, sanitize it
  if (typeof allowedAttrs !== 'undefined') {
    const seAttrs = []
    let i = node.attributes.length
    while (i--) {
      // if the attribute is not in our whitelist, then remove it
      const attr = node.attributes.item(i)
      const attrName = attr.nodeName
      const attrLocalName = attr.localName
      const attrNsURI = attr.namespaceURI
      // Check that an attribute with the correct localName in the correct namespace is on
      // our whitelist or is a namespace declaration for one of our allowed namespaces
      if (attrNsURI !== allowedAttrsNS[attrLocalName] && attrNsURI !== NS.XMLNS &&
       !(attrNsURI === NS.XMLNS && REVERSE_NS[attr.value])) {
        // Bypassing the whitelist to allow se: and oi: prefixes
        // We can add specific namepaces on demand for now.
        // Is there a more appropriate way to do this?
        if (attrName.startsWith('se:') || attrName.startsWith('oi:') || attrName.startsWith('data-')) {
          // We should bypass the namespace aswell
          const seAttrNS = (attrName.startsWith('se:')) ? NS.SE : ((attrName.startsWith('oi:')) ? NS.OI : null)
          seAttrs.push([attrName, attr.value, seAttrNS])
        } else {
          console.warn(`sanitizeSvg: attribute ${attrName} in element ${node.nodeName} not in whitelist is removed`)
          node.removeAttributeNS(attrNsURI, attrLocalName)
        }
      }

      // For the style attribute, rewrite it in terms of XML presentational attributes
      if (attrName === 'style') {
        const props = attr.value.split(';')
        let p = props.length
        while (p--) {
          const [name, val] = props[p].split(':')
          const styleAttrName = (name || '').trim()
          const styleAttrVal = (val || '').trim()
          // Now check that this attribute is supported
          if (allowedAttrs.includes(styleAttrName)) {
            node.setAttribute(styleAttrName, styleAttrVal)
          }
        }
        node.removeAttribute('style')
      }
    }

    Object.values(seAttrs).forEach(([att, val, ns]) => {
      node.setAttributeNS(ns, att, val)
    })

    // for some elements that have a xlink:href, ensure the URI refers to a local element
    // (but not for links)
    const href = getHref(node)
    if (href &&
      ['filter', 'linearGradient', 'pattern',
        'radialGradient', 'textPath', 'use'].includes(node.nodeName) && href[0] !== '#') {
      // remove the attribute (but keep the element)
      setHref(node, '')
      console.warn(`sanitizeSvg: attribute href in element ${node.nodeName} pointing to a non-local reference (${href}) is removed`)
      node.removeAttributeNS(NS.XLINK, 'href')
    }

    // Safari crashes on a <use> without a xlink:href, so we just remove the node here
    if (node.nodeName === 'use' && !getHref(node)) {
      console.warn(`sanitizeSvg: element ${node.nodeName} without a xlink:href is removed`)
      node.remove()
      return
    }
    // if the element has attributes pointing to a non-local reference,
    // need to remove the attribute
    Object.values(['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'], (attr) => {
      let val = node.getAttribute(attr)
      if (val) {
        val = getUrlFromAttr(val)
        // simply check for first character being a '#'
        if (val && val[0] !== '#') {
          node.setAttribute(attr, '')
          console.warn(`sanitizeSvg: attribute ${attr} in element ${node.nodeName} pointing to a non-local reference (${val}) is removed`)
          node.removeAttribute(attr)
        }
      }
    })

    // recurse to children
    i = node.childNodes.length
    while (i--) { sanitizeSvg(node.childNodes.item(i)) }
  // else (element not supported), remove it
  } else {
    // remove all children from this node and insert them before this node
    // TODO: in the case of animation elements this will hardly ever be correct
    console.warn(`sanitizeSvg: element ${node.nodeName} not supported is removed`)
    const children = []
    while (node.hasChildNodes()) {
      children.push(parent.insertBefore(node.firstChild, node))
    }

    // remove this node from the document altogether
    node.remove()

    // call sanitizeSvg on each of those children
    let i = children.length
    while (i--) { sanitizeSvg(children[i]) }
  }
}
