/**
 * Mathematical utilities.
 * @module math
 * @license MIT
 *
 * ©2010 Alexis Deveria, ©2010 Jeff Schiller
 */

/**
 * @typedef {Object} AngleCoord45
 * @property {number} x - The angle-snapped x value
 * @property {number} y - The angle-snapped y value
 * @property {number} a - The angle (in radians) at which to snap
 */

/**
 * @typedef {Object} XYObject
 * @property {number} x
 * @property {number} y
 */

import { NS } from './namespaces.js'

// Constants
const NEAR_ZERO = 1e-10

// Create a throwaway SVG element for matrix operations
const svg = document.createElementNS(NS.SVG, 'svg')

/**
 * Transforms a point by a given matrix without DOM calls.
 * @function transformPoint
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {SVGMatrix} m - The transformation matrix
 * @returns {XYObject} The transformed point
 */
export const transformPoint = (x, y, m) => ({
  x: m.a * x + m.c * y + m.e,
  y: m.b * x + m.d * y + m.f
})

/**
 * Gets the transform list (baseVal) from an element if it exists.
 * @function getTransformList
 * @param {Element} elem - An SVG element or element with a transform list
 * @returns {SVGTransformList|undefined} The transform list, if any
 */
export const getTransformList = elem => {
  if (elem.transform?.baseVal) {
    return elem.transform.baseVal
  }
  if (elem.gradientTransform?.baseVal) {
    return elem.gradientTransform.baseVal
  }
  if (elem.patternTransform?.baseVal) {
    return elem.patternTransform.baseVal
  }
  console.warn('No transform list found. Check browser compatibility.', elem)
}

/**
 * Checks if a matrix is the identity matrix.
 * @function isIdentity
 * @param {SVGMatrix} m - The matrix to check
 * @returns {boolean} True if it's an identity matrix (1,0,0,1,0,0)
 */
export const isIdentity = m =>
  m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0

/**
 * Multiplies multiple matrices together (m1 * m2 * ...).
 * Near-zero values are rounded to zero.
 * @function matrixMultiply
 * @param {...SVGMatrix} args - The matrices to multiply
 * @returns {SVGMatrix} The resulting matrix
 */
export const matrixMultiply = (...args) => {
  // If no matrices are given, return an identity matrix
  if (args.length === 0) {
    return svg.createSVGMatrix()
  }

  const m = args.reduceRight((prev, curr) => curr.multiply(prev))

  // Round near-zero values to zero
  if (Math.abs(m.a) < NEAR_ZERO) m.a = 0
  if (Math.abs(m.b) < NEAR_ZERO) m.b = 0
  if (Math.abs(m.c) < NEAR_ZERO) m.c = 0
  if (Math.abs(m.d) < NEAR_ZERO) m.d = 0
  if (Math.abs(m.e) < NEAR_ZERO) m.e = 0
  if (Math.abs(m.f) < NEAR_ZERO) m.f = 0

  return m
}

/**
 * Checks if a transform list includes a non-identity matrix transform.
 * @function hasMatrixTransform
 * @param {SVGTransformList} [tlist] - The transform list to check
 * @returns {boolean} True if a matrix transform is found
 */
export const hasMatrixTransform = tlist => {
  if (!tlist) return false
  for (let i = 0; i < tlist.numberOfItems; i++) {
    const xform = tlist.getItem(i)
    if (
      xform.type === SVGTransform.SVG_TRANSFORM_MATRIX &&
      !isIdentity(xform.matrix)
    ) {
      return true
    }
  }
  return false
}

/**
 * @typedef {Object} TransformedBox
 * @property {XYObject} tl - Top-left coordinate
 * @property {XYObject} tr - Top-right coordinate
 * @property {XYObject} bl - Bottom-left coordinate
 * @property {XYObject} br - Bottom-right coordinate
 * @property {Object} aabox
 * @property {number} aabox.x - Axis-aligned x
 * @property {number} aabox.y - Axis-aligned y
 * @property {number} aabox.width - Axis-aligned width
 * @property {number} aabox.height - Axis-aligned height
 */

/**
 * Transforms a rectangular box using a given matrix.
 * @function transformBox
 * @param {number} l - Left coordinate
 * @param {number} t - Top coordinate
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {SVGMatrix} m - Transformation matrix
 * @returns {TransformedBox} The transformed box information
 */
export const transformBox = (l, t, w, h, m) => {
  const tl = transformPoint(l, t, m)
  const tr = transformPoint(l + w, t, m)
  const bl = transformPoint(l, t + h, m)
  const br = transformPoint(l + w, t + h, m)

  const minx = Math.min(tl.x, tr.x, bl.x, br.x)
  const maxx = Math.max(tl.x, tr.x, bl.x, br.x)
  const miny = Math.min(tl.y, tr.y, bl.y, br.y)
  const maxy = Math.max(tl.y, tr.y, bl.y, br.y)

  return {
    tl,
    tr,
    bl,
    br,
    aabox: {
      x: minx,
      y: miny,
      width: maxx - minx,
      height: maxy - miny
    }
  }
}

/**
 * Consolidates a transform list into a single matrix transform without modifying the original list.
 * @function transformListToTransform
 * @param {SVGTransformList} tlist - The transform list
 * @param {number} [min=0] - Optional start index
 * @param {number} [max] - Optional end index, defaults to tlist length-1
 * @returns {SVGTransform} A single transform from the combined matrices
 */
export const transformListToTransform = (tlist, min = 0, max = null) => {
  if (!tlist) {
    return svg.createSVGTransformFromMatrix(svg.createSVGMatrix())
  }

  const start = Number.parseInt(min, 10)
  const end = Number.parseInt(max ?? tlist.numberOfItems - 1, 10)
  const low = Math.min(start, end)
  const high = Math.max(start, end)

  let combinedMatrix = svg.createSVGMatrix()
  for (let i = low; i <= high; i++) {
    // If out of range, use identity
    const currentMatrix =
      i >= 0 && i < tlist.numberOfItems
        ? tlist.getItem(i).matrix
        : svg.createSVGMatrix()
    combinedMatrix = matrixMultiply(combinedMatrix, currentMatrix)
  }

  return svg.createSVGTransformFromMatrix(combinedMatrix)
}

/**
 * Gets the matrix of a given element's transform list.
 * @function getMatrix
 * @param {Element} elem - The element to check
 * @returns {SVGMatrix} The transformation matrix
 */
export const getMatrix = elem => {
  const tlist = getTransformList(elem)
  return transformListToTransform(tlist).matrix
}

/**
 * Returns a coordinate snapped to the nearest 45-degree angle.
 * @function snapToAngle
 * @param {number} x1 - First point's x
 * @param {number} y1 - First point's y
 * @param {number} x2 - Second point's x
 * @param {number} y2 - Second point's y
 * @returns {AngleCoord45} The angle-snapped coordinates and angle
 */
export const snapToAngle = (x1, y1, x2, y2) => {
  const snap = Math.PI / 4 // 45 degrees
  const dx = x2 - x1
  const dy = y2 - y1
  const angle = Math.atan2(dy, dx)
  const dist = Math.hypot(dx, dy)
  const snapAngle = Math.round(angle / snap) * snap

  return {
    x: x1 + dist * Math.cos(snapAngle),
    y: y1 + dist * Math.sin(snapAngle),
    a: snapAngle
  }
}

/**
 * Checks if two rectangles intersect.
 * Both r1 and r2 are expected to have {x, y, width, height}.
 * @function rectsIntersect
 * @param {{x:number,y:number,width:number,height:number}} r1 - First rectangle
 * @param {{x:number,y:number,width:number,height:number}} r2 - Second rectangle
 * @returns {boolean} True if the rectangles intersect
 */
export const rectsIntersect = (r1, r2) =>
  r2.x < r1.x + r1.width &&
  r2.x + r2.width > r1.x &&
  r2.y < r1.y + r1.height &&
  r2.y + r2.height > r1.y
