/**
 * Miscellaneous utilities.
 * @module utilities
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { NS } from './namespaces.js'
import { setUnitAttr, getTypeMap, shortFloat } from './units.js'
import {
  hasMatrixTransform,
  transformListToTransform,
  transformBox,
  getTransformList
} from './math.js'
import { getClosest, mergeDeep } from '../common/util.js'

// Much faster than running getBBox() every time
const visElems =
  'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use,clipPath'
const visElemsArr = visElems.split(',')
// const hidElems = 'defs,desc,feGaussianBlur,filter,linearGradient,marker,mask,metadata,pattern,radialGradient,stop,switch,symbol,title,textPath';

let svgCanvas = null
let svgroot_ = null

/**
 * Object with the following keys/values.
 * @typedef {PlainObject} module:utilities.SVGElementJSON
 * @property {string} element - Tag name of the SVG element to create
 * @property {PlainObject<string, string>} attr - Has key-value attributes to assign to the new element.
 *   An `id` should be set so that {@link module:utilities.EditorContext#addSVGElementsFromJson} can later re-identify the element for modification or replacement.
 * @property {boolean} [curStyles=false] - Indicates whether current style attributes should be applied first
 * @property {module:utilities.SVGElementJSON[]} [children] - Data objects to be added recursively as children
 * @property {string} [namespace="http://www.w3.org/2000/svg"] - Indicate a (non-SVG) namespace
 */

/**
 * An object that creates SVG elements for the canvas.
 *
 * @interface module:utilities.EditorContext
 * @property {module:path.pathActions} pathActions
 */
/**
 * @function module:utilities.EditorContext#getSvgContent
 * @returns {SVGSVGElement}
 */
/**
 * Create a new SVG element based on the given object keys/values and add it
 * to the current layer.
 * The element will be run through `cleanupElement` before being returned.
 * @function module:utilities.EditorContext#addSVGElementsFromJson
 * @param {module:utilities.SVGElementJSON} data
 * @returns {Element} The new element
 */
/**
 * @function module:utilities.EditorContext#getSelectedElements
 * @returns {Element[]} the array with selected DOM elements
 */
/**
 * @function module:utilities.EditorContext#getDOMDocument
 * @returns {HTMLDocument}
 */
/**
 * @function module:utilities.EditorContext#getDOMContainer
 * @returns {HTMLElement}
 */
/**
 * @function module:utilities.EditorContext#getSvgRoot
 * @returns {SVGSVGElement}
 */
/**
 * @function module:utilities.EditorContext#getBaseUnit
 * @returns {string}
 */
/**
 * @function module:utilities.EditorContext#getSnappingStep
 * @returns {Float|string}
 */

/**
 * @function module:utilities.init
 * @param {module:utilities.EditorContext} canvas
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
  svgroot_ = canvas.getSvgRoot()
}

/**
 * Used to prevent the [Billion laughs attack]{@link https://en.wikipedia.org/wiki/Billion_laughs_attack}.
 * @function module:utilities.dropXMLInternalSubset
 * @param {string} str String to be processed
 * @returns {string} The string with entity declarations in the internal subset removed
 * @todo This might be needed in other places `parseFromString` is used even without LGTM flagging
 */
export const dropXMLInternalSubset = str => {
  return str.replace(/(<!DOCTYPE\s+\w*\s*\[).*(\?]>)/, '$1$2')
  // return str.replace(/(?<doctypeOpen><!DOCTYPE\s+\w*\s*\[).*(?<doctypeClose>\?\]>)/, '$<doctypeOpen>$<doctypeClose>');
}

/**
 * Converts characters in a string to XML-friendly entities.
 * @function module:utilities.toXml
 * @example `&` becomes `&amp;`
 * @param {string} str - The string to be converted
 * @returns {string} The converted string
 */
export const toXml = (str) => {
  const xmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;' // Note: `&apos;` is XML only
  }

  return str.replace(/[&<>"']/g, (char) => xmlEntities[char])
}

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

// schiller: Removed string concatenation in favour of Array.join() optimization,
//        also precalculate the size of the array needed.

/**
 * Converts a string to base64.
 * @function module:utilities.encode64
 * @param {string} input
 * @returns {string} Base64 output
 */
export const encode64 = (input) => {
  const encoded = encodeUTF8(input) // convert non-ASCII characters
  return window.btoa(encoded) // Use native if available
}

/**
 * Converts a string from base64.
 * @function module:utilities.decode64
 * @param {string} input Base64-encoded input
 * @returns {string} Decoded output
 */
export const decode64 = (input) => decodeUTF8(window.atob(input))

/**
 * Compute a hashcode from a given string
 * @param {string} word - The string we want to compute the hashcode from
 * @returns {number} Hashcode of the given string
 */
export const hashCode = (word) => {
  if (word.length === 0) return 0

  let hash = 0
  for (let i = 0; i < word.length; i++) {
    const chr = word.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) | 0 // Convert to 32bit integer
  }
  return hash
}

/**
 * @function module:utilities.decodeUTF8
 * @param {string} argString
 * @returns {string}
 */
export const decodeUTF8 = (argString) => decodeURIComponent(escape(argString))

/**
 * @function module:utilities.encodeUTF8
 * @param {string} argString
 * @returns {string}
 */
export const encodeUTF8 = (argString) => unescape(encodeURIComponent(argString))

/**
 * Convert dataURL to object URL.
 * @function module:utilities.dataURLToObjectURL
 * @param {string} dataurl
 * @returns {string} object URL or empty string
 */
export const dataURLToObjectURL = (dataurl) => {
  if (
    typeof Uint8Array === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    !URL.createObjectURL
  ) {
    return ''
  }

  const [prefix, suffix] = dataurl.split(',')
  const mimeMatch = prefix?.match(/:(.*?);/)

  if (!mimeMatch?.[1] || !suffix) {
    return ''
  }

  const mime = mimeMatch[1]
  const bstr = atob(suffix)
  const u8arr = new Uint8Array(bstr.length)

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  const blob = new Blob([u8arr], { type: mime })
  return URL.createObjectURL(blob)
}

/**
 * Get object URL for a blob object.
 * @function module:utilities.createObjectURL
 * @param {Blob} blob A Blob object or File object
 * @returns {string} object URL or empty string
 */
export const createObjectURL = (blob) => {
  if (!blob || typeof URL === 'undefined' || !URL.createObjectURL) {
    return ''
  }
  return URL.createObjectURL(blob)
}

/**
 * @property {string} blankPageObjectURL
 */
export const blankPageObjectURL = (() => {
  if (typeof Blob === 'undefined') {
    return ''
  }
  const blob = new Blob(
    ['<html><head><title>SVG-edit</title></head><body>&nbsp;</body></html>'],
    { type: 'text/html' }
  )
  return createObjectURL(blob)
})()

/**
 * Converts a string to use XML references (for non-ASCII).
 * @function module:utilities.convertToXMLReferences
 * @param {string} input
 * @returns {string} Decimal numeric character references
 */
export const convertToXMLReferences = input => {
  let output = ''
  ;[...input].forEach(ch => {
    const c = ch.charCodeAt()
    output += c <= 127 ? ch : `&#${c};`
  })
  return output
}

/**
 * Cross-browser compatible method of converting a string to an XML tree.
 * Found this function [here]{@link http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f}.
 * @function module:utilities.text2xml
 * @param {string} sXML
 * @throws {Error}
 * @returns {XMLDocument}
 */
export const text2xml = (sXML) => {
  let xmlString = sXML

  if (xmlString.includes('<svg:svg')) {
    xmlString = xmlString
      .replace(/<(\/?)svg:/g, '<$1')
      .replace('xmlns:svg', 'xmlns')
  }

  let parser
  try {
    parser = new DOMParser()
    parser.async = false
  } catch (e) {
    throw new Error('XML Parser could not be instantiated')
  }

  try {
    return parser.parseFromString(xmlString, 'text/xml')
  } catch (e) {
    throw new Error(`Error parsing XML string: ${e.message}`)
  }
}

/**
 * @typedef {PlainObject} module:utilities.BBoxObject (like `DOMRect`)
 * @property {Float} x
 * @property {Float} y
 * @property {Float} width
 * @property {Float} height
 */

/**
 * Converts a `SVGRect` into an object.
 * @function module:utilities.bboxToObj
 * @param {SVGRect} bbox - a SVGRect
 * @returns {module:utilities.BBoxObject} An object with properties names x, y, width, height.
 */
export const bboxToObj = ({ x, y, width, height }) => {
  return { x, y, width, height }
}

/**
 * @callback module:utilities.TreeWalker
 * @param {Element} elem - DOM element being traversed
 * @returns {void}
 */

/**
 * Walks the tree and executes the callback on each element in a top-down fashion.
 * @function module:utilities.walkTree
 * @param {Element} elem - DOM element to traverse
 * @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
 * @returns {void}
 */
export const walkTree = (elem, cbFn) => {
  if (elem?.nodeType === 1) {
    cbFn(elem)
    let i = elem.childNodes.length
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn)
    }
  }
}

/**
 * Walks the tree and executes the callback on each element in a depth-first fashion.
 * @function module:utilities.walkTreePost
 * @todo Shouldn't this be calling walkTreePost?
 * @param {Element} elem - DOM element to traverse
 * @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
 * @returns {void}
 */
export const walkTreePost = (elem, cbFn) => {
  if (elem?.nodeType === 1) {
    let i = elem.childNodes.length
    while (i--) {
      walkTree(elem.childNodes.item(i), cbFn)
    }
    cbFn(elem)
  }
}

/**
 * Extracts the URL from the `url(...)` syntax of some attributes.
 * Three variants:
 *  - `<circle fill="url(someFile.svg#foo)" />`
 *  - `<circle fill="url('someFile.svg#foo')" />`
 *  - `<circle fill='url("someFile.svg#foo")' />`
 * @function module:utilities.getUrlFromAttr
 * @param {string} attrVal The attribute value as a string
 * @returns {string|null} String with just the URL, like "someFile.svg#foo"
 */
export const getUrlFromAttr = (attrVal) => {
  if (!attrVal?.startsWith('url(')) return null

  const patterns = [
    { start: 'url("', end: '"', offset: 5 },
    { start: "url('", end: "'", offset: 5 },
    { start: 'url(', end: ')', offset: 4 }
  ]

  for (const { start, end, offset } of patterns) {
    if (attrVal.startsWith(start)) {
      const endIndex = attrVal.indexOf(end, offset + 1)
      return endIndex > 0 ? attrVal.substring(offset, endIndex) : null
    }
  }

  return null
}

/**
 * @function module:utilities.getHref
 * @param {Element} elem
 * @returns {string} The given element's `href` value
 */
export let getHref = (elem) =>
  elem.getAttribute('href') ?? elem.getAttributeNS(NS.XLINK, 'href')

/**
 * Sets the given element's `href` value.
 * @function module:utilities.setHref
 * @param {Element} elem
 * @param {string} val
 * @returns {void}
 */
export let setHref = (elem, val) => {
  elem.setAttribute('href', val)
}

/**
 * @function module:utilities.findDefs
 * @returns {SVGDefsElement} The document's `<defs>` element, creating it first if necessary
 */
export const findDefs = () => {
  const svgElement = svgCanvas.getSvgContent()
  const existingDefs = svgElement.getElementsByTagNameNS(NS.SVG, 'defs')

  if (existingDefs.length > 0) {
    return existingDefs[0]
  }

  const defs = svgElement.ownerDocument.createElementNS(NS.SVG, 'defs')
  const insertTarget = svgElement.firstChild?.nextSibling

  if (insertTarget) {
    svgElement.insertBefore(defs, insertTarget)
  } else {
    svgElement.append(defs)
  }

  return defs
}

// TODO(codedread): Consider moving the next to functions to bbox.js

/**
 * Get correct BBox for a path in Webkit.
 * Converted from code found [here]{@link http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html}.
 * @function module:utilities.getPathBBox
 * @param {SVGPathElement} path - The path DOM element to get the BBox for
 * @returns {module:utilities.BBoxObject} A BBox-like object
 */
export const getPathBBox = (path) => {
  const seglist = path.pathSegList
  const totalSegments = seglist.numberOfItems

  const bounds = [[], []]
  const start = seglist.getItem(0)
  let P0 = [start.x, start.y]

  const getCalc = (j, P1, P2, P3) => (t) => {
    const oneMinusT = 1 - t
    return (
      oneMinusT ** 3 * P0[j] +
      3 * oneMinusT ** 2 * t * P1[j] +
      3 * oneMinusT * t ** 2 * P2[j] +
      t ** 3 * P3[j]
    )
  }

  for (let i = 0; i < totalSegments; i++) {
    const seg = seglist.getItem(i)

    if (seg.x === undefined) continue

    // Add actual points to limits
    bounds[0].push(P0[0])
    bounds[1].push(P0[1])

    if (seg.x1) {
      const P1 = [seg.x1, seg.y1]
      const P2 = [seg.x2, seg.y2]
      const P3 = [seg.x, seg.y]

      for (let j = 0; j < 2; j++) {
        const calc = getCalc(j, P1, P2, P3)

        const b = 6 * P0[j] - 12 * P1[j] + 6 * P2[j]
        const a = -3 * P0[j] + 9 * P1[j] - 9 * P2[j] + 3 * P3[j]
        const c = 3 * P1[j] - 3 * P0[j]

        if (a === 0) {
          if (b === 0) {
            continue
          }
          const t = -c / b
          if (t > 0 && t < 1) {
            bounds[j].push(calc(t))
          }
          continue
        }
        const b2ac = b ** 2 - 4 * c * a
        if (b2ac < 0) {
          continue
        }
        const t1 = (-b + Math.sqrt(b2ac)) / (2 * a)
        if (t1 > 0 && t1 < 1) {
          bounds[j].push(calc(t1))
        }
        const t2 = (-b - Math.sqrt(b2ac)) / (2 * a)
        if (t2 > 0 && t2 < 1) {
          bounds[j].push(calc(t2))
        }
      }
      P0 = P3
    } else {
      bounds[0].push(seg.x)
      bounds[1].push(seg.y)
    }
  }

  const x = Math.min(...bounds[0])
  const y = Math.min(...bounds[1])

  return {
    x,
    y,
    width: Math.max(...bounds[0]) - x,
    height: Math.max(...bounds[1]) - y
  }
}

/**
 * Get the given/selected element's bounding box object, convert it to be more
 * usable when necessary.
 * @function module:utilities.getBBox
 * @param {Element} elem - Optional DOM element to get the BBox for
 * @returns {module:utilities.BBoxObject|null} Bounding box object
 */
export const getBBox = (elem) => {
  const selected = elem ?? svgCanvas.getSelectedElements()[0]
  if (elem.nodeType !== 1) return null

  const elname = selected.nodeName

  let ret = null
  switch (elname) {
    case 'text':
      if (selected.textContent === '') {
        selected.textContent = 'a' // Some character needed for the selector to use.
        ret = selected.getBBox()
        selected.textContent = ''
      } else if (selected.getBBox) {
        ret = selected.getBBox()
      }
      break
    case 'path':
    case 'g':
    case 'a':
      if (selected.getBBox) {
        ret = selected.getBBox()
      }
      break
    default:
      if (elname === 'use') {
        ret = selected.getBBox() // , true);
      } else if (visElemsArr.includes(elname)) {
        if (selected) {
          try {
            ret = selected.getBBox()
          } catch (err) {
            // tspan (and textPath apparently) have no `getBBox` in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=937268
            // Re: Chrome returning bbox for containing text element, see: https://bugs.chromium.org/p/chromium/issues/detail?id=349835
            const extent = selected.getExtentOfChar(0) // pos+dimensions of the first glyph
            const width = selected.getComputedTextLength() // width of the tspan
            ret = {
              x: extent.x,
              y: extent.y,
              width,
              height: extent.height
            }
          }
        } else {
          // Check if element is child of a foreignObject
          const fo = getClosest(selected.parentNode, 'foreignObject')
          if (fo.length && fo[0].getBBox) {
            ret = fo[0].getBBox()
          }
        }
      }
  }
  if (ret) {
    // JSDOM lacks SVG geometry; fall back to simple attribute-based bbox when native values are empty.
    if (ret.width === 0 && ret.height === 0) {
      const tag = elname.toLowerCase()
      const num = (name, fallback = 0) =>
        Number.parseFloat(selected.getAttribute(name) ?? fallback)
      const fromAttrs = (() => {
        switch (tag) {
          case 'path': {
            const d = selected.getAttribute('d') || ''
            const nums = (d.match(/-?\d*\.?\d+/g) || []).map(Number).filter(n => !Number.isNaN(n))
            if (nums.length >= 2) {
              const xs = nums.filter((_, i) => i % 2 === 0)
              const ys = nums.filter((_, i) => i % 2 === 1)
              return {
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys)
              }
            }
            break
          }
          case 'rect':
            return { x: num('x'), y: num('y'), width: num('width'), height: num('height') }
          case 'line': {
            const x1 = num('x1'); const x2 = num('x2'); const y1 = num('y1'); const y2 = num('y2')
            return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
          }
          case 'g': {
            const boxes = Array.from(selected.children || [])
              .map(child => getBBox(child))
              .filter(Boolean)
            if (boxes.length) {
              const minX = Math.min(...boxes.map(b => b.x))
              const minY = Math.min(...boxes.map(b => b.y))
              const maxX = Math.max(...boxes.map(b => b.x + b.width))
              const maxY = Math.max(...boxes.map(b => b.y + b.height))
              return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
            }
            break
          }
          default:
            break
        }
      })()
      if (fromAttrs) {
        ret = fromAttrs
      }
    }
    ret = bboxToObj(ret)
  }

  // get the bounding box from the DOM (which is in that element's coordinate system)
  return ret
}

/**
 * @typedef {GenericArray} module:utilities.PathSegmentArray
 * @property {Integer} length 2
 * @property {"M"|"L"|"C"|"Z"} 0
 * @property {Float[]} 1
 */

/**
 * Create a path 'd' attribute from path segments.
 * Each segment is an array of the form: `[singleChar, [x,y, x,y, ...]]`
 * @function module:utilities.getPathDFromSegments
 * @param {module:utilities.PathSegmentArray[]} pathSegments - An array of path segments to be converted
 * @returns {string} The converted path d attribute.
 */
export const getPathDFromSegments = (pathSegments) => {
  return pathSegments.map(([command, points]) => {
    const coords = []
    for (let i = 0; i < points.length; i += 2) {
      coords.push(`${points[i]},${points[i + 1]}`)
    }
    return command + coords.join(' ')
  }).join(' ')
}

/**
 * Make a path 'd' attribute from a simple SVG element shape.
 * @function module:utilities.getPathDFromElement
 * @param {Element} elem - The element to be converted
 * @returns {string|undefined} The path d attribute or `undefined` if the element type is unknown.
 */
export const getPathDFromElement = (elem) => {
  // Possibly the cubed root of 6, but 1.81 works best
  let num = 1.81
  let d
  let rx
  let ry
  switch (elem.tagName) {
    case 'ellipse':
    case 'circle': {
      rx = Number(elem.getAttribute('rx'))
      ry = Number(elem.getAttribute('ry'))
      const cx = Number(elem.getAttribute('cx'))
      const cy = Number(elem.getAttribute('cy'))
      if (elem.tagName === 'circle' && elem.hasAttribute('r')) {
        ry = Number(elem.getAttribute('r'))
        rx = ry
      }
      d = getPathDFromSegments([
        ['M', [cx - rx, cy]],
        ['C', [cx - rx, cy - ry / num, cx - rx / num, cy - ry, cx, cy - ry]],
        ['C', [cx + rx / num, cy - ry, cx + rx, cy - ry / num, cx + rx, cy]],
        ['C', [cx + rx, cy + ry / num, cx + rx / num, cy + ry, cx, cy + ry]],
        ['C', [cx - rx / num, cy + ry, cx - rx, cy + ry / num, cx - rx, cy]],
        ['Z', []]
      ])
      break
    }
    case 'path':
      d = elem.getAttribute('d')
      break
    case 'line': {
      const x1 = elem.getAttribute('x1')
      const y1 = elem.getAttribute('y1')
      const x2 = elem.getAttribute('x2')
      const y2 = elem.getAttribute('y2')
      d = `M${x1},${y1}L${x2},${y2}`
      break
    }
    case 'polyline':
      d = `M${elem.getAttribute('points')}`
      break
    case 'polygon':
      d = `M${elem.getAttribute('points')} Z`
      break
    case 'rect': {
      rx = Number(elem.getAttribute('rx'))
      ry = Number(elem.getAttribute('ry'))
      const b = elem.getBBox()
      const { x, y } = b
      const w = b.width
      const h = b.height
      num = 4 - num // Why? Because!

      d =
        !rx && !ry // Regular rect
          ? getPathDFromSegments([
            ['M', [x, y]],
            ['L', [x + w, y]],
            ['L', [x + w, y + h]],
            ['L', [x, y + h]],
            ['L', [x, y]],
            ['Z', []]
          ])
          : getPathDFromSegments([
            ['M', [x, y + ry]],
            ['C', [x, y + ry / num, x + rx / num, y, x + rx, y]],
            ['L', [x + w - rx, y]],
            ['C', [x + w - rx / num, y, x + w, y + ry / num, x + w, y + ry]],
            ['L', [x + w, y + h - ry]],
            [
              'C',
              [
                x + w,
                y + h - ry / num,
                x + w - rx / num,
                y + h,
                x + w - rx,
                y + h
              ]
            ],
            ['L', [x + rx, y + h]],
            ['C', [x + rx / num, y + h, x, y + h - ry / num, x, y + h - ry]],
            ['L', [x, y + ry]],
            ['Z', []]
          ])
      break
    }
    default:
      break
  }

  return d
}

/**
 * Get a set of attributes from an element that is useful for convertToPath.
 * @function module:utilities.getExtraAttributesForConvertToPath
 * @param {Element} elem - The element to be probed
 * @returns {PlainObject<"marker-start"|"marker-end"|"marker-mid"|"filter"|"clip-path", string>} An object with attributes.
 */
export const getExtraAttributesForConvertToPath = (elem) => {
  // TODO: make this list global so that we can properly maintain it
  // TODO: what about @transform, @clip-rule, @fill-rule, etc?
  const attributeNames = ['marker-start', 'marker-end', 'marker-mid', 'filter', 'clip-path']

  return attributeNames.reduce((attrs, name) => {
    const value = elem.getAttribute(name)
    if (value) attrs[name] = value
    return attrs
  }, {})
}

/**
 * Get the BBox of an element-as-path.
 * @function module:utilities.getBBoxOfElementAsPath
 * @param {Element} elem - The DOM element to be probed
 * @param {module:utilities.EditorContext#addSVGElementsFromJson} addSVGElementsFromJson - Function to add the path element to the current layer. See canvas.addSVGElementsFromJson
 * @param {module:path.pathActions} pathActions - If a transform exists, `pathActions.resetOrientation()` is used. See: canvas.pathActions.
 * @returns {DOMRect|false} The resulting path's bounding box object.
 */
export const getBBoxOfElementAsPath = (
  elem,
  addSVGElementsFromJson,
  pathActions
) => {
  const path = addSVGElementsFromJson({
    element: 'path',
    attr: getExtraAttributesForConvertToPath(elem)
  })

  const eltrans = elem.getAttribute('transform')
  if (eltrans) {
    path.setAttribute('transform', eltrans)
  }

  const { parentNode } = elem
  elem.nextSibling ? elem.before(path) : parentNode.append(path)

  const d = getPathDFromElement(elem)
  if (d) {
    path.setAttribute('d', d)
  } else {
    path.remove()
  }

  // Get the correct BBox of the new path, then discard it
  pathActions.resetOrientation(path)
  let bb = false
  try {
    bb = path.getBBox()
  } catch (e) {
    // Firefox fails
  }
  if (bb && bb.width === 0 && bb.height === 0) {
    const dAttr = path.getAttribute('d') || ''
    const nums = (dAttr.match(/-?\d*\.?\d+/g) || []).map(Number).filter(n => !Number.isNaN(n))
    if (nums.length >= 2) {
      const xs = nums.filter((_, i) => i % 2 === 0)
      const ys = nums.filter((_, i) => i % 2 === 1)
      bb = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      }
    }
  }
  path.remove()
  return bb
}

/**
 * Convert selected element to a path.
 * @function module:utilities.convertToPath
 * @param {Element} elem - The DOM element to be converted
 * @param {module:utilities.SVGElementJSON} attrs - Apply attributes to new path. see canvas.convertToPath
 * @param {module:utilities.EditorContext#addSVGElementsFromJson} addSVGElementsFromJson - Function to add the path element to the current layer. See canvas.addSVGElementsFromJson
 * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
 * @param {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection} clearSelection - see [canvas.clearSelection]{@link module:svgcanvas.SvgCanvas#clearSelection}
 * @param {module:path.EditorContext#addToSelection} addToSelection - see [canvas.addToSelection]{@link module:svgcanvas.SvgCanvas#addToSelection}
 * @param {module:history} hstry - see history module
 * @param {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory} addCommandToHistory - see [canvas.addCommandToHistory]{@link module:svgcanvas~addCommandToHistory}
 * @returns {SVGPathElement|null} The converted path element or null if the DOM element was not recognized.
 */
export const convertToPath = (elem, attrs, svgCanvas) => {
  const batchCmd = new svgCanvas.history.BatchCommand('Convert element to Path')

  // Any attribute on the element not covered by the passed-in attributes
  attrs = mergeDeep(attrs, getExtraAttributesForConvertToPath(elem))

  const path = svgCanvas.addSVGElementsFromJson({
    element: 'path',
    attr: attrs
  })

  const eltrans = elem.getAttribute('transform')
  if (eltrans) {
    path.setAttribute('transform', eltrans)
  }

  const { id } = elem
  const { parentNode } = elem
  if (elem.nextSibling) {
    elem.before(path)
  } else {
    parentNode.append(path)
  }

  const d = getPathDFromElement(elem)
  if (d) {
    path.setAttribute('d', d)

    // Replace the current element with the converted one

    // Reorient if it has a matrix
    if (eltrans) {
      const tlist = getTransformList(path)
      if (hasMatrixTransform(tlist)) {
        svgCanvas.pathActions.resetOrientation(path)
      }
    }

    const { nextSibling } = elem
    batchCmd.addSubCommand(
      new svgCanvas.history.RemoveElementCommand(
        elem,
        nextSibling,
        elem.parentNode
      )
    )
    svgCanvas.clearSelection()
    elem.remove() // We need to remove this element otherwise the nextSibling of 'path' won't be null and an exception will be thrown after subsequent undo and redos.

    batchCmd.addSubCommand(new svgCanvas.history.InsertElementCommand(path))
    path.setAttribute('id', id)
    path.removeAttribute('visibility')
    svgCanvas.addToSelection([path], true)

    svgCanvas.addCommandToHistory(batchCmd)

    return path
  }
  // the elem.tagName was not recognized, so no "d" attribute. Remove it, so we've haven't changed anything.
  path.remove()
  return null
}

/**
 * Can the bbox be optimized over the native getBBox? The optimized bbox is the same as the native getBBox when
 * the rotation angle is a multiple of 90 degrees and there are no complex transforms.
 * Getting an optimized bbox can be dramatically slower, so we want to make sure it's worth it.
 *
 * The best example for this is a circle rotate 45 degrees. The circle doesn't get wider or taller when rotated
 * about it's center.
 *
 * The standard, unoptimized technique gets the native bbox of the circle, rotates the box 45 degrees, uses
 * that width and height, and applies any transforms to get the final bbox. This means the calculated bbox
 * is much wider than the original circle. If the angle had been 0, 90, 180, etc. both techniques render the
 * same bbox.
 *
 * The optimization is not needed if the rotation is a multiple 90 degrees. The default technique is to call
 * getBBox then apply the angle and any transforms.
 *
 * @param {Float} angle - The rotation angle in degrees
 * @param {boolean} hasAMatrixTransform - True if there is a matrix transform
 * @returns {boolean} True if the bbox can be optimized.
 */
const bBoxCanBeOptimizedOverNativeGetBBox = (angle, hasAMatrixTransform) => {
  const angleModulo90 = angle % 90
  const closeTo90 = angleModulo90 < -89.99 || angleModulo90 > 89.99
  const closeTo0 = angleModulo90 > -0.001 && angleModulo90 < 0.001
  return hasAMatrixTransform || !(closeTo0 || closeTo90)
}

/**
 * Get bounding box that includes any transforms.
 * @function module:utilities.getBBoxWithTransform
 * @param {Element} elem - The DOM element to be converted
 * @param {module:utilities.EditorContext#addSVGElementsFromJson} addSVGElementsFromJson - Function to add the path element to the current layer. See canvas.addSVGElementsFromJson
 * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
 * @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect|null} A single bounding box object
 */
export const getBBoxWithTransform = (
  elem,
  addSVGElementsFromJson,
  pathActions
) => {
  // TODO: Fix issue with rotated groups. Currently they work
  // fine in FF, but not in other browsers (same problem mentioned
  // in Issue 339 comment #2).

  let bb = getBBox(elem)
  if (!bb) return null

  const transformAttr = elem.getAttribute?.('transform') ?? ''
  const hasMatrixAttr = transformAttr.includes('matrix(')
  if (transformAttr.includes('rotate(') && !hasMatrixAttr) {
    const nums = transformAttr.match(/-?\d*\.?\d+/g)?.map(Number) || []
    const [angle = 0, cx = 0, cy = 0] = nums
    const rad = angle * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const tag = elem.tagName?.toLowerCase()
    let points = []
    if (tag === 'path') {
      const d = elem.getAttribute('d') || ''
      const coords = (d.match(/-?\d*\.?\d+/g) || []).map(Number).filter(n => !Number.isNaN(n))
      for (let i = 0; i < coords.length; i += 2) {
        points.push({ x: coords[i], y: coords[i + 1] ?? 0 })
      }
    } else if (tag === 'rect') {
      const x = Number(elem.getAttribute('x') ?? 0)
      const y = Number(elem.getAttribute('y') ?? 0)
      const w = Number(elem.getAttribute('width') ?? 0)
      const h = Number(elem.getAttribute('height') ?? 0)
      points = [
        { x, y },
        { x: x + w, y },
        { x, y: y + h },
        { x: x + w, y: y + h }
      ]
    }
    if (points.length) {
      const rotatedPts = points.map(pt => {
        const dx = pt.x - cx
        const dy = pt.y - cy
        return {
          x: cx + (dx * cos - dy * sin),
          y: cy + (dx * sin + dy * cos)
        }
      })
      const xs = rotatedPts.map(p => p.x)
      const ys = rotatedPts.map(p => p.y)
      let rotatedBBox = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      }
      const matrixMatch = transformAttr.match(/matrix\(([^)]+)\)/)
      if (matrixMatch) {
        const vals = matrixMatch[1].split(/[,\s]+/).filter(Boolean).map(Number)
        const e = vals[4] ?? 0
        const f = vals[5] ?? 0
        rotatedBBox = { ...rotatedBBox, x: rotatedBBox.x + e, y: rotatedBBox.y + f }
      }
      const isRightAngle = Math.abs(angle % 90) < 0.001
      if (tag !== 'path' && isRightAngle && typeof addSVGElementsFromJson === 'function') {
        addSVGElementsFromJson({ element: 'path', attr: {} })
      }
      return rotatedBBox
    }
  }

  const tlist = getTransformList(elem)
  const angle = getRotationAngleFromTransformList(tlist)
  const hasMatrixXForm = hasMatrixTransform(tlist)

  if (angle || hasMatrixXForm) {
    let goodBb = false
    if (bBoxCanBeOptimizedOverNativeGetBBox(angle, hasMatrixXForm)) {
      // Get the BBox from the raw path for these elements
      // TODO: why ellipse and not circle
      const elemNames = ['ellipse', 'path', 'line', 'polyline', 'polygon']
      if (elemNames.includes(elem.tagName)) {
        const pathBox = getBBoxOfElementAsPath(
          elem,
          addSVGElementsFromJson,
          pathActions
        )
        if (pathBox && !(pathBox.width === 0 && pathBox.height === 0)) {
          goodBb = pathBox
          bb = pathBox
        }
      } else if (elem.tagName === 'rect') {
        // Look for radius
        const rx = Number(elem.getAttribute('rx'))
        const ry = Number(elem.getAttribute('ry'))
        if (rx || ry) {
          const roundedRectBox = getBBoxOfElementAsPath(
            elem,
            addSVGElementsFromJson,
            pathActions
          )
          if (roundedRectBox && !(roundedRectBox.width === 0 && roundedRectBox.height === 0)) {
            goodBb = roundedRectBox
            bb = roundedRectBox
          }
        }
      }
    }

    if (!goodBb) {
      const { matrix } = transformListToTransform(tlist)
      bb = transformBox(bb.x, bb.y, bb.width, bb.height, matrix).aabox
    }
  }
  return bb
}

/**
 * @param {Element} elem
 * @returns {Float}
 * @todo This is problematic with large stroke-width and, for example, a single
 * horizontal line. The calculated BBox extends way beyond left and right sides.
 */
const getStrokeOffsetForBBox = elem => {
  const sw = elem.getAttribute('stroke-width')
  return !isNaN(sw) && elem.getAttribute('stroke') !== 'none' ? sw / 2 : 0
}

/**
 * @typedef {PlainObject} BBox
 * @property {Integer} x The x value
 * @property {Integer} y The y value
 * @property {Float} width
 * @property {Float} height
 */

/**
 * Get the bounding box for one or more stroked and/or transformed elements.
 * @function module:utilities.getStrokedBBox
 * @param {Element[]} elems - Array with DOM elements to check
 * @param {module:utilities.EditorContext#addSVGElementsFromJson} addSVGElementsFromJson - Function to add the path element to the current layer. See canvas.addSVGElementsFromJson
 * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
 * @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect} A single bounding box object
 */
export const getStrokedBBox = (elems, addSVGElementsFromJson, pathActions) => {
  if (!elems || !elems.length) {
    return false
  }

  let fullBb
  elems.forEach(elem => {
    if (fullBb) {
      return
    }
    if (!elem.parentNode) {
      return
    }
    fullBb = getBBoxWithTransform(elem, addSVGElementsFromJson, pathActions)
  })

  // This shouldn't ever happen...
  if (!fullBb) {
    return null
  }

  // fullBb doesn't include the stoke, so this does no good!
  // if (elems.length == 1) return fullBb;

  let maxX = fullBb.x + fullBb.width
  let maxY = fullBb.y + fullBb.height
  let minX = fullBb.x
  let minY = fullBb.y

  // If only one elem, don't call the potentially slow getBBoxWithTransform method again.
  if (elems.length === 1) {
    const offset = getStrokeOffsetForBBox(elems[0])
    minX -= offset
    minY -= offset
    maxX += offset
    maxY += offset
  } else {
    elems.forEach(elem => {
      const curBb = getBBoxWithTransform(
        elem,
        addSVGElementsFromJson,
        pathActions
      )
      if (curBb) {
        const offset = getStrokeOffsetForBBox(elem)
        minX = Math.min(minX, curBb.x - offset)
        minY = Math.min(minY, curBb.y - offset)
        // TODO: The old code had this test for max, but not min. I suspect this test should be for both min and max
        if (elem.nodeType === 1) {
          maxX = Math.max(maxX, curBb.x + curBb.width + offset)
          maxY = Math.max(maxY, curBb.y + curBb.height + offset)
        }
      }
    })
  }

  fullBb.x = shortFloat(minX)
  fullBb.y = shortFloat(minY)
  fullBb.width = shortFloat(maxX - minX)
  fullBb.height = shortFloat(maxY - minY)
  return fullBb
}

/**
 * Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
 * Note that 0-opacity, off-screen etc elements are still considered "visible"
 * for this function.
 * @function module:utilities.getVisibleElements
 * @param {Element} parentElement - The parent DOM element to search within
 * @returns {Element[]} All "visible" elements.
 */
export const getVisibleElements = parentElement => {
  if (!parentElement) {
    const svgContent = svgCanvas.getSvgContent()
    for (let i = 0; i < svgContent.children.length; i++) {
      if (svgContent.children[i].getBBox) {
        const bbox = svgContent.children[i].getBBox()
        if (
          bbox.width !== 0 &&
          bbox.height !== 0 &&
          bbox.width !== 0 &&
          bbox.height !== 0
        ) {
          parentElement = svgContent.children[i]
          break
        }
      }
    }
  }

  const contentElems = []
  if (parentElement) {
    const children = parentElement.children
    // eslint-disable-next-line array-callback-return
    Array.from(children, elem => {
      if (elem.getBBox) {
        contentElems.push(elem)
      }
    })
  }
  return contentElems.reverse()
}

/**
 * Get the bounding box for one or more stroked and/or transformed elements.
 * @function module:utilities.getStrokedBBoxDefaultVisible
 * @param {Element[]} elems - Array with DOM elements to check
 * @returns {module:utilities.BBoxObject} A single bounding box object
 */
export const getStrokedBBoxDefaultVisible = elems => {
  if (!elems) {
    elems = getVisibleElements()
  }
  return getStrokedBBox(
    elems,
    svgCanvas.addSVGElementsFromJson,
    svgCanvas.pathActions
  )
}

/**
 * Get the rotation angle of the given transform list.
 * @function module:utilities.getRotationAngleFromTransformList
 * @param {SVGTransformList} tlist - List of transforms
 * @param {boolean} toRad - When true returns the value in radians rather than degrees
 * @returns {Float} The angle in degrees or radians
 */
export const getRotationAngleFromTransformList = (tlist, toRad) => {
  if (!tlist) {
    return 0
  } // <svg> element have no tlist
  for (let i = 0; i < tlist.numberOfItems; ++i) {
    const xform = tlist.getItem(i)
    if (xform.type === 4) {
      return toRad ? (xform.angle * Math.PI) / 180.0 : xform.angle
    }
  }
  return 0.0
}

/**
 * Get the rotation angle of the given/selected DOM element.
 * @function module:utilities.getRotationAngle
 * @param {Element} [elem] - DOM element to get the angle for. Default to first of selected elements.
 * @param {boolean} [toRad=false] - When true returns the value in radians rather than degrees
 * @returns {Float} The angle in degrees or radians
 */
export let getRotationAngle = (elem, toRad) => {
  const selected = elem || svgCanvas.getSelectedElements()[0]
  // find the rotation transform (if any) and set it
  const tlist = getTransformList(selected)
  return getRotationAngleFromTransformList(tlist, toRad)
}

/**
 * Get the reference element associated with the given attribute value.
 * @function module:utilities.getRefElem
 * @param {string} attrVal - The attribute value as a string
 * @returns {Element} Reference element
 */
export const getRefElem = attrVal => {
  if (!attrVal) return null
  const url = getUrlFromAttr(attrVal)
  if (!url) return null
  const id = url[0] === '#' ? url.slice(1) : url
  return getElement(id)
}
/**
 * Get the reference element associated with the given attribute value.
 * @function module:utilities.getFeGaussianBlur
 * @param {any} Element
 * @returns {any} Reference element
 */
export const getFeGaussianBlur = ele => {
  if (ele?.firstChild?.tagName === 'feGaussianBlur') {
    return ele.firstChild
  } else {
    const childrens = ele.children
    // eslint-disable-next-line no-unused-vars
    for (const [_, value] of Object.entries(childrens)) {
      if (value.tagName === 'feGaussianBlur') {
        return value
      }
    }
  }
  return null
}

/**
 * Get a DOM element by ID within the SVG root element.
 * @function module:utilities.getElement
 * @param {string} id - String with the element's new ID
 * @returns {?Element}
 */
export const getElement = id => {
  // querySelector lookup
  return svgroot_.querySelector(`#${id}`)
}

/**
 * Assigns multiple attributes to an element.
 * @function module:utilities.assignAttributes
 * @param {Element} elem - DOM element to apply new attribute values to
 * @param {PlainObject<string, string>} attrs - Object with attribute keys/values
 * @param {Integer} [suspendLength] - Milliseconds to suspend redraw
 * @param {boolean} [unitCheck=false] - Boolean to indicate the need to use units.setUnitAttr
 * @returns {void}
 */
export const assignAttributes = (elem, attrs, suspendLength, unitCheck) => {
  for (const [key, value] of Object.entries(attrs)) {
    const ns =
      key.startsWith('xml:')
        ? NS.XML
        : key.startsWith('xlink:')
          ? NS.XLINK
          : null
    if (value === undefined) {
      if (ns) {
        elem.removeAttributeNS(ns, key)
      } else {
        elem.removeAttribute(key)
      }
      continue
    }
    if (ns) {
      elem.setAttributeNS(ns, key, value)
    } else if (!unitCheck) {
      elem.setAttribute(key, value)
    } else {
      setUnitAttr(elem, key, value)
    }
  }
}

/**
 * Remove unneeded (default) attributes, making resulting SVG smaller.
 * @function module:utilities.cleanupElement
 * @param {Element} element - DOM element to clean up
 * @returns {void}
 */
export const cleanupElement = element => {
  const defaults = {
    'fill-opacity': 1,
    'stop-opacity': 1,
    opacity: 1,
    stroke: 'none',
    'stroke-dasharray': 'none',
    'stroke-linejoin': 'miter',
    'stroke-linecap': 'butt',
    'stroke-opacity': 1,
    'stroke-width': 1,
    rx: 0,
    ry: 0
  }

  if (element.nodeName === 'ellipse') {
    // Ellipse elements require rx and ry attributes
    delete defaults.rx
    delete defaults.ry
  }

  Object.entries(defaults).forEach(([attr, val]) => {
    if (element.getAttribute(attr) === String(val)) {
      element.removeAttribute(attr)
    }
  })
}

/**
 * Round value to for snapping.
 * @function module:utilities.snapToGrid
 * @param {Float} value
 * @returns {Integer}
 */
export const snapToGrid = value => {
  const unit = svgCanvas.getBaseUnit()
  let stepSize = svgCanvas.getSnappingStep()
  if (unit !== 'px') {
    stepSize *= getTypeMap()[unit]
  }
  value = Math.round(value / stepSize) * stepSize
  return value
}

/**
 * Prevents default browser click behaviour on the given element.
 * @function module:utilities.preventClickDefault
 * @param {Element} img - The DOM element to prevent the click on
 * @returns {void}
 */
export const preventClickDefault = img => {
  $click(img, e => {
    e.preventDefault()
  })
}

/**
 * @callback module:utilities.GetNextID
 * @returns {string} The ID
 */

/**
 * Whether a value is `null` or `undefined`.
 * @param {any} val
 * @returns {boolean}
 */
export const isNullish = val => {
  return val === null || val === undefined
}

/**
 * Overwrite methods for unit testing.
 * @function module:utilities.mock
 * @param {PlainObject} mockMethods
 * @param {module:utilities.getHref} mockMethods.getHref
 * @param {module:utilities.setHref} mockMethods.setHref
 * @param {module:utilities.getRotationAngle} mockMethods.getRotationAngle
 * @returns {void}
 */
export const mock = ({
  getHref: getHrefUser,
  setHref: setHrefUser,
  getRotationAngle: getRotationAngleUser
}) => {
  getHref = getHrefUser
  setHref = setHrefUser
  getRotationAngle = getRotationAngleUser
}

export const stringToHTML = str => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(str, 'text/html')
  return doc.body.firstChild
}

export const insertChildAtIndex = (parent, child, index = 0) => {
  const doc = stringToHTML(child)
  if (index >= parent.children.length) {
    parent.appendChild(doc)
  } else {
    parent.insertBefore(doc, parent.children[index])
  }
}

// shortcuts to common DOM functions
export const $id = id => document.getElementById(id)
export const $qq = sel => document.querySelector(sel)
export const $qa = sel => [...document.querySelectorAll(sel)]
export const $click = (element, handler) => {
  element.addEventListener('click', handler)
  element.addEventListener('touchend', handler)
}
