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
import { warn } from '../common/logger.js'

// Constants
export const NEAR_ZERO = 1e-10

// Create a throwaway SVG element for matrix operations
const svg = document.createElementNS(NS.SVG, 'svg')

const createTransformFromMatrix = (m) => {
  const createFallback = (matrix) => {
    const fallback = svg.createSVGMatrix()
    Object.assign(fallback, {
      a: matrix.a,
      b: matrix.b,
      c: matrix.c,
      d: matrix.d,
      e: matrix.e,
      f: matrix.f
    })
    return fallback
  }

  try {
    return svg.createSVGTransformFromMatrix(m)
  } catch (e) {
    const t = svg.createSVGTransform()
    try {
      t.setMatrix(m)
      return t
    } catch (err) {
      try {
        return svg.createSVGTransformFromMatrix(createFallback(m))
      } catch (e2) {
        t.setMatrix(createFallback(m))
        return t
      }
    }
  }
}

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
 * Normalizes a rotation angle to the (-180, 180] range.
 * @function normalizeRotationAngle
 * @param {number|string} angle - The angle in degrees
 * @returns {number} The normalized angle, or zero for invalid input
 */
export const normalizeRotationAngle = (angle) => {
  let normalized = Number.parseFloat(angle)
  if (!Number.isFinite(normalized)) return 0
  normalized %= 360
  if (normalized > 180) normalized -= 360
  if (normalized <= -180) normalized += 360
  return Math.abs(normalized) < NEAR_ZERO ? 0 : normalized
}

/**
 * Gets the center encoded by a typed SVG rotation transform.
 * The transform matrix must come from `setRotate()` and therefore contain
 * only rotation and the translation induced by its center.
 * @function getRotationCenterFromRotateTransform
 * @param {SVGTransform} transform - A typed SVG rotation transform
 * @returns {XYObject} The rotation center
 */
export const getRotationCenterFromRotateTransform = (transform) => {
  if (transform.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
    throw new TypeError('Expected an SVG rotation transform')
  }

  if (Number.isFinite(transform.cx) && Number.isFinite(transform.cy)) {
    return { x: transform.cx, y: transform.cy }
  }

  const angle = transform.angle * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const det = (1 - cos) * (1 - cos) + sin * sin

  if (Math.abs(det) < NEAR_ZERO) {
    return { x: 0, y: 0 }
  }

  const { e, f } = transform.matrix
  return {
    x: ((1 - cos) * e - sin * f) / det,
    y: (sin * e + (1 - cos) * f) / det
  }
}

/**
 * Gets the combined angle and first encoded center from a transform list.
 * @function getRotationTransformSummary
 * @param {SVGTransformList} tlist - The transform list
 * @returns {{rotationAngle: number, rotationCenter: XYObject|null}} Rotation details
 */
export const getRotationTransformSummary = (tlist) => {
  let rotationAngle = 0
  let rotationCenter = null

  if (tlist) {
    for (let i = 0; i < tlist.numberOfItems; i++) {
      const transform = tlist.getItem(i)
      if (transform.type === SVGTransform.SVG_TRANSFORM_ROTATE) {
        rotationAngle += transform.angle
        rotationCenter ||= getRotationCenterFromRotateTransform(transform)
      }
    }
  }

  return {
    rotationAngle: normalizeRotationAngle(rotationAngle),
    rotationCenter
  }
}

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
  warn('No transform list found. Check browser compatibility.', elem, 'math')
}

/**
 * Checks if a matrix is the identity matrix.
 * @function isIdentity
 * @param {SVGMatrix} m - The matrix to check
 * @returns {boolean} True if it's an identity matrix (1,0,0,1,0,0)
 */
export const isIdentity = m =>
  Math.abs(m.a - 1) < NEAR_ZERO &&
  Math.abs(m.b) < NEAR_ZERO &&
  Math.abs(m.c) < NEAR_ZERO &&
  Math.abs(m.d - 1) < NEAR_ZERO &&
  Math.abs(m.e) < NEAR_ZERO &&
  Math.abs(m.f) < NEAR_ZERO

/**
 * Multiplies multiple matrices together (m1 * m2 * ...).
 * Near-zero values are rounded to zero.
 * @function matrixMultiply
 * @param {...SVGMatrix} args - The matrices to multiply
 * @returns {SVGMatrix} The resulting matrix
 */
export const matrixMultiply = (...args) => {
  if (args.length === 0) {
    return svg.createSVGMatrix()
  }

  const normalizeNearZero = (matrix) => {
    const props = ['a', 'b', 'c', 'd', 'e', 'f']
    for (const prop of props) {
      if (Math.abs(matrix[prop]) < NEAR_ZERO) {
        matrix[prop] = 0
      }
    }
    return matrix
  }

  if (args.some(matrix => matrix.is2D === false) && typeof DOMMatrix === 'function' && typeof DOMMatrix.fromMatrix === 'function') {
    const result = args.reduce(
      (acc, curr) => acc.multiply(DOMMatrix.fromMatrix(curr)),
      new DOMMatrix()
    )

    const out = svg.createSVGMatrix()
    Object.assign(out, {
      a: result.a,
      b: result.b,
      c: result.c,
      d: result.d,
      e: result.e,
      f: result.f
    })

    return normalizeNearZero(out)
  }

  let a = 1
  let b = 0
  let c = 0
  let d = 1
  let e = 0
  let f = 0
  for (const curr of args) {
    const { a: ca, b: cb, c: cc, d: cd, e: ce, f: cf } = curr
    const nextA = a * ca + c * cb
    const nextB = b * ca + d * cb
    const nextC = a * cc + c * cd
    const nextD = b * cc + d * cd
    const nextE = a * ce + c * cf + e
    const nextF = b * ce + d * cf + f
    a = nextA
    b = nextB
    c = nextC
    d = nextD
    e = nextE
    f = nextF
  }

  const out = svg.createSVGMatrix()
  Object.assign(out, { a, b, c, d, e, f })
  return normalizeNearZero(out)
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
  if (!tlist || tlist.numberOfItems === 0) {
    return createTransformFromMatrix(svg.createSVGMatrix())
  }

  const start = Number.parseInt(min, 10)
  const end = Number.parseInt(max ?? tlist.numberOfItems - 1, 10)
  const [low, high] = [Math.min(start, end), Math.max(start, end)]

  const matrices = []
  for (let i = low; i <= high; i++) {
    const matrix = (i >= 0 && i < tlist.numberOfItems)
      ? tlist.getItem(i).matrix
      : svg.createSVGMatrix()
    matrices.push(matrix)
  }

  const combinedMatrix = matrixMultiply(...matrices)

  const out = svg.createSVGMatrix()
  Object.assign(out, {
    a: combinedMatrix.a,
    b: combinedMatrix.b,
    c: combinedMatrix.c,
    d: combinedMatrix.d,
    e: combinedMatrix.e,
    f: combinedMatrix.f
  })

  return createTransformFromMatrix(out)
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
