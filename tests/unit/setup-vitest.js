import { AssertionError, strict as assert } from 'node:assert'

// Provide a global assert (some legacy tests expect it).
globalThis.assert = assert

// Add a lightweight closeTo helper to mimic chai.assert.closeTo.
assert.closeTo = function (actual, expected, delta, message) {
  const ok = Math.abs(actual - expected) <= delta
  if (!ok) {
    throw new AssertionError({
      message: message || `expected ${actual} to be within ${delta} of ${expected}`,
      actual,
      expected
    })
  }
}

// Mocha-style aliases expected by legacy tests.
globalThis.before = globalThis.beforeAll
globalThis.after = globalThis.afterAll

// JSDOM lacks many SVG APIs; provide minimal stubs used in tests.
const win = globalThis.window || globalThis

// Simple SVG matrix/transform/point polyfills good enough for unit tests.
class SVGMatrixPolyfill {
  constructor (a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f
  }

  multiply (m) {
    return new SVGMatrixPolyfill(
      this.a * m.a + this.c * m.b,
      this.b * m.a + this.d * m.b,
      this.a * m.c + this.c * m.d,
      this.b * m.c + this.d * m.d,
      this.a * m.e + this.c * m.f + this.e,
      this.b * m.e + this.d * m.f + this.f
    )
  }

  translate (x, y) { return this.multiply(new SVGMatrixPolyfill(1, 0, 0, 1, x, y)) }
  scale (s) { return this.multiply(new SVGMatrixPolyfill(s, 0, 0, s, 0, 0)) }
  scaleNonUniform (sx, sy) { return this.multiply(new SVGMatrixPolyfill(sx, 0, 0, sy, 0, 0)) }
  rotate (deg) {
    const rad = deg * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    return this.multiply(new SVGMatrixPolyfill(cos, sin, -sin, cos, 0, 0))
  }

  flipX () { return this.scale(-1, 1) }
  flipY () { return this.scale(1, -1) }
  skewX (deg) {
    const rad = deg * Math.PI / 180
    return this.multiply(new SVGMatrixPolyfill(1, 0, Math.tan(rad), 1, 0, 0))
  }

  skewY (deg) {
    const rad = deg * Math.PI / 180
    return this.multiply(new SVGMatrixPolyfill(1, Math.tan(rad), 0, 1, 0, 0))
  }

  inverse () {
    const det = this.a * this.d - this.b * this.c
    if (!det) return new SVGMatrixPolyfill()
    return new SVGMatrixPolyfill(
      this.d / det,
      -this.b / det,
      -this.c / det,
      this.a / det,
      (this.c * this.f - this.d * this.e) / det,
      (this.b * this.e - this.a * this.f) / det
    )
  }
}

class SVGTransformPolyfill {
  constructor (type = SVGTransformPolyfill.SVG_TRANSFORM_MATRIX, matrix = new SVGMatrixPolyfill()) {
    this.type = type
    this.matrix = matrix
  }

  setMatrix (matrix) {
    this.type = SVGTransformPolyfill.SVG_TRANSFORM_MATRIX
    this.matrix = matrix
  }

  setTranslate (x, y) {
    this.type = SVGTransformPolyfill.SVG_TRANSFORM_TRANSLATE
    this.matrix = new SVGMatrixPolyfill(1, 0, 0, 1, x, y)
  }

  setScale (sx, sy = sx) {
    this.type = SVGTransformPolyfill.SVG_TRANSFORM_SCALE
    this.matrix = new SVGMatrixPolyfill(sx, 0, 0, sy, 0, 0)
  }

  setRotate (angle, cx = 0, cy = 0) {
    // Translate to center, rotate, then translate back.
    const ang = Number(angle) || 0
    const cxNum = Number(cx) || 0
    const cyNum = Number(cy) || 0
    const rotate = new SVGMatrixPolyfill().translate(cxNum, cyNum).rotate(ang).translate(-cxNum, -cyNum)
    this.type = SVGTransformPolyfill.SVG_TRANSFORM_ROTATE
    this.angle = ang
    this.cx = cxNum
    this.cy = cyNum
    this.matrix = rotate
  }
}
SVGTransformPolyfill.SVG_TRANSFORM_UNKNOWN = 0
SVGTransformPolyfill.SVG_TRANSFORM_MATRIX = 1
SVGTransformPolyfill.SVG_TRANSFORM_TRANSLATE = 2
SVGTransformPolyfill.SVG_TRANSFORM_SCALE = 3
SVGTransformPolyfill.SVG_TRANSFORM_ROTATE = 4
SVGTransformPolyfill.SVG_TRANSFORM_SKEWX = 5
SVGTransformPolyfill.SVG_TRANSFORM_SKEWY = 6

class SVGTransformListPolyfill {
  constructor () {
    this._items = []
  }

  get numberOfItems () { return this._items.length }
  getItem (i) { return this._items[i] }
  appendItem (item) { this._items.push(item); return item }
  insertItemBefore (item, index) {
    const idx = Math.max(0, Math.min(index, this._items.length))
    this._items.splice(idx, 0, item)
    return item
  }

  removeItem (index) {
    if (index < 0 || index >= this._items.length) return undefined
    const [removed] = this._items.splice(index, 1)
    return removed
  }

  clear () { this._items = [] }
  initialize (item) { this._items = [item]; return item }
  consolidate () {
    if (!this._items.length) return null
    const matrix = this._items.reduce(
      (acc, t) => acc.multiply(t.matrix),
      new SVGMatrixPolyfill()
    )
    const consolidated = new SVGTransformPolyfill()
    consolidated.setMatrix(matrix)
    this._items = [consolidated]
    return consolidated
  }
}

const parseTransformAttr = (attr) => {
  const list = new SVGTransformListPolyfill()
  if (!attr) return list
  const matcher = /([a-zA-Z]+)\(([^)]+)\)/g
  let match
  while ((match = matcher.exec(attr))) {
    const [, type, raw] = match
    const nums = raw.split(/[,\s]+/).filter(Boolean).map(Number)
    const t = new SVGTransformPolyfill()
    switch (type) {
      case 'matrix':
        t.setMatrix(new SVGMatrixPolyfill(...nums))
        break
      case 'translate':
        t.setTranslate(nums[0] ?? 0, nums[1] ?? 0)
        break
      case 'scale':
        t.setScale(nums[0] ?? 1, nums[1] ?? nums[0] ?? 1)
        break
      case 'rotate':
        t.setRotate(nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0)
        break
      default:
        t.setMatrix(new SVGMatrixPolyfill())
        break
    }
    list.appendItem(t)
  }
  return list
}

const ensureTransformList = (elem) => {
  if (!elem.__transformList) {
    const parsed = parseTransformAttr(elem.getAttribute?.('transform'))
    elem.__transformList = parsed
  }
  return elem.__transformList
}

if (!win.SVGElement) {
  win.SVGElement = win.Element
}
const svgElementProto = win.SVGElement?.prototype

// Basic constructors for missing SVG types.
if (!win.SVGSVGElement) win.SVGSVGElement = win.SVGElement
if (!win.SVGGraphicsElement) win.SVGGraphicsElement = win.SVGElement
if (!win.SVGGeometryElement) win.SVGGeometryElement = win.SVGElement
// Ensure SVGPathElement exists so the pathseg polyfill can patch it.
win.SVGPathElement = win.SVGElement || function SVGPathElement () {}

// Matrix/transform helpers.
win.SVGMatrix = win.SVGMatrix || SVGMatrixPolyfill
win.DOMMatrix = win.DOMMatrix || SVGMatrixPolyfill
win.SVGTransform = win.SVGTransform || SVGTransformPolyfill
win.SVGTransformList = win.SVGTransformList || SVGTransformListPolyfill

if (svgElementProto) {
  if (!svgElementProto.createSVGMatrix) {
    svgElementProto.createSVGMatrix = () => new SVGMatrixPolyfill()
  }
  if (!svgElementProto.createSVGTransform) {
    svgElementProto.createSVGTransform = () => new SVGTransformPolyfill()
  }
  if (!svgElementProto.createSVGTransformFromMatrix) {
    svgElementProto.createSVGTransformFromMatrix = (matrix) => {
      const t = new SVGTransformPolyfill()
      t.setMatrix(matrix)
      return t
    }
  }
  if (!svgElementProto.createSVGPoint) {
    svgElementProto.createSVGPoint = () => ({
      x: 0,
      y: 0,
      matrixTransform (m) {
        return {
          x: m.a * this.x + m.c * this.y + m.e,
          y: m.b * this.x + m.d * this.y + m.f
        }
      }
    })
  }
  svgElementProto.getBBox = function () {
    const tag = (this.tagName || '').toLowerCase()
    const parseLength = (attr, fallback = 0) => {
      const raw = this.getAttribute?.(attr)
      if (raw == null) return fallback
      const str = String(raw)
      const n = Number.parseFloat(str)
      if (Number.isNaN(n)) return fallback
      if (str.endsWith('in')) return n * 96
      if (str.endsWith('cm')) return n * 96 / 2.54
      if (str.endsWith('mm')) return n * 96 / 25.4
      if (str.endsWith('pt')) return n * 96 / 72
      if (str.endsWith('pc')) return n * 16
      if (str.endsWith('em')) return n * 16
      if (str.endsWith('ex')) return n * 8
      return n
    }
    const parsePoints = () => (this.getAttribute?.('points') || '')
      .trim()
      .split(/\\s+/)
      .map(pair => pair.split(',').map(Number))
      .filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y))

    if (tag === 'path') {
      const d = this.getAttribute?.('d') || ''
      const nums = (d.match(/-?\\d*\\.?\\d+/g) || [])
        .map(Number)
        .filter(n => !Number.isNaN(n))
      if (nums.length >= 2) {
        let minx = Infinity; let miny = Infinity
        let maxx = -Infinity; let maxy = -Infinity
        for (let i = 0; i < nums.length; i += 2) {
          const x = nums[i]; const y = nums[i + 1]
          if (x < minx) minx = x
          if (x > maxx) maxx = x
          if (y < miny) miny = y
          if (y > maxy) maxy = y
        }
        return {
          x: minx === Infinity ? 0 : minx,
          y: miny === Infinity ? 0 : miny,
          width: maxx === -Infinity ? 0 : maxx - minx,
          height: maxy === -Infinity ? 0 : maxy - miny
        }
      }
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    if (tag === 'rect') {
      const x = parseLength('x')
      const y = parseLength('y')
      const width = parseLength('width')
      const height = parseLength('height')
      return { x, y, width, height }
    }

    if (tag === 'line') {
      const x1 = parseLength('x1'); const y1 = parseLength('y1')
      const x2 = parseLength('x2'); const y2 = parseLength('y2')
      const minx = Math.min(x1, x2); const miny = Math.min(y1, y2)
      return { x: minx, y: miny, width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
    }

    if (tag === 'circle') {
      const cx = parseLength('cx'); const cy = parseLength('cy'); const r = parseLength('r') || parseLength('rx') || parseLength('ry')
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 }
    }

    if (tag === 'ellipse') {
      const cx = parseLength('cx'); const cy = parseLength('cy'); const rx = parseLength('rx'); const ry = parseLength('ry')
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 }
    }

    if (tag === 'polyline' || tag === 'polygon') {
      const pts = parsePoints()
      if (!pts.length) return { x: 0, y: 0, width: 0, height: 0 }
      const xs = pts.map(([x]) => x)
      const ys = pts.map(([, y]) => y)
      const minx = Math.min(...xs); const maxx = Math.max(...xs)
      const miny = Math.min(...ys); const maxy = Math.max(...ys)
      return { x: minx, y: miny, width: maxx - minx, height: maxy - miny }
    }

    return { x: 0, y: 0, width: 0, height: 0 }
  }
  if (!Object.getOwnPropertyDescriptor(svgElementProto, 'transform')) {
    Object.defineProperty(svgElementProto, 'transform', {
      get () {
        const baseVal = ensureTransformList(this)
        return { baseVal }
      }
    })
  }
}

// Ensure pathseg polyfill can attach to prototypes.
await import('pathseg')

// Add minimal chai-like helpers some legacy tests expect.
assert.close = (actual, expected, delta, message) =>
  assert.closeTo(actual, expected, delta, message)
assert.notOk = (val, message) => {
  if (val) {
    throw new AssertionError({ message: message || `expected ${val} to be falsy`, actual: val, expected: false })
  }
}
assert.isBelow = (val, limit, message) => {
  if (!(val < limit)) {
    throw new AssertionError({ message: message || `expected ${val} to be below ${limit}`, actual: val, expected: `< ${limit}` })
  }
}
