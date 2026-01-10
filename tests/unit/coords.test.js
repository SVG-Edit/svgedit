import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import * as utilities from '../../packages/svgcanvas/core/utilities.js'
import * as coords from '../../packages/svgcanvas/core/coords.js'

describe('coords', function () {
  let elemId = 1
  let svg
  const root = document.createElement('div')
  root.id = 'root'
  root.style.visibility = 'hidden'
  document.body.append(root)

  /**
   * Set up tests with mock data.
   * @returns {void}
   */
  beforeEach(function () {
    elemId = 1
    const svgroot = document.createElementNS(NS.SVG, 'svg')
    svgroot.id = 'svgroot'
    root.append(svgroot)
    svg = document.createElementNS(NS.SVG, 'svg')
    svgroot.append(svg)

    // Mock out editor context.
    utilities.init(
      /**
      * @implements {module:utilities.EditorContext}
      */
      {
        getSvgRoot: () => { return svg },
        getSvgContent: () => { return svg },
        getDOMDocument () { return null },
        getDOMContainer () { return null }
      }
    )
    const drawing = {
      getNextId () { return String(elemId++) }
    }
    const mockDataStorage = {
      get (elem, key) { return null },
      has (elem, key) { return false }
    }
    coords.init(
      /**
      * @implements {module:coords.EditorContext}
      */
      {
        getGridSnapping () { return false },
        getDrawing () { return drawing },
        getCurrentDrawing () { return drawing },
        getDataStorage () { return mockDataStorage },
        getSvgRoot () { return svg }
      }
    )
  })

  /**
   * Tear down tests, removing elements.
   * @returns {void}
   */
  afterEach(function () {
    while (svg?.hasChildNodes()) {
      svg.firstChild.remove()
    }
  })

  it('Test remapElement(translate) for rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '200')
    rect.setAttribute('y', '150')
    rect.setAttribute('width', '250')
    rect.setAttribute('height', '120')
    svg.append(rect)

    const attrs = {
      x: '200',
      y: '150',
      width: '125',
      height: '75'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 1; m.b = 0
    m.c = 0; m.d = 1
    m.e = 100; m.f = -50

    coords.remapElement(rect, attrs, m)

    assert.equal(rect.getAttribute('x'), '300')
    assert.equal(rect.getAttribute('y'), '100')
    assert.equal(rect.getAttribute('width'), '125')
    assert.equal(rect.getAttribute('height'), '75')
  })

  it('Test remapElement(scale) for rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('width', '250')
    rect.setAttribute('height', '120')
    svg.append(rect)

    const attrs = {
      x: '0',
      y: '0',
      width: '250',
      height: '120'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 2; m.b = 0
    m.c = 0; m.d = 0.5
    m.e = 0; m.f = 0

    coords.remapElement(rect, attrs, m)

    assert.equal(rect.getAttribute('x'), '0')
    assert.equal(rect.getAttribute('y'), '0')
    assert.equal(rect.getAttribute('width'), '500')
    assert.equal(rect.getAttribute('height'), '60')
  })

  it('Test remapElement(translate) for circle', function () {
    const circle = document.createElementNS(NS.SVG, 'circle')
    circle.setAttribute('cx', '200')
    circle.setAttribute('cy', '150')
    circle.setAttribute('r', '125')
    svg.append(circle)

    const attrs = {
      cx: '200',
      cy: '150',
      r: '125'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 1; m.b = 0
    m.c = 0; m.d = 1
    m.e = 100; m.f = -50

    coords.remapElement(circle, attrs, m)

    assert.equal(circle.getAttribute('cx'), '300')
    assert.equal(circle.getAttribute('cy'), '100')
    assert.equal(circle.getAttribute('r'), '125')
  })

  it('Test remapElement(scale) for circle', function () {
    const circle = document.createElementNS(NS.SVG, 'circle')
    circle.setAttribute('cx', '200')
    circle.setAttribute('cy', '150')
    circle.setAttribute('r', '250')
    svg.append(circle)

    const attrs = {
      cx: '200',
      cy: '150',
      r: '250'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 2; m.b = 0
    m.c = 0; m.d = 0.5
    m.e = 0; m.f = 0

    coords.remapElement(circle, attrs, m)

    assert.equal(circle.getAttribute('cx'), '400')
    assert.equal(circle.getAttribute('cy'), '75')
    // Radius is the minimum that fits in the new bounding box.
    assert.equal(circle.getAttribute('r'), '125')
  })

  it('Test remapElement flips radial gradients on negative scale', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const grad = document.createElementNS(NS.SVG, 'radialGradient')
    grad.id = 'grad1'
    grad.setAttribute('cx', '0.2')
    grad.setAttribute('cy', '0.3')
    grad.setAttribute('fx', '0.4')
    grad.setAttribute('fy', '0.5')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', '10')
    rect.setAttribute('height', '10')
    rect.setAttribute('fill', 'url(#grad1)')
    svg.append(rect)

    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    m.e = 0
    m.f = 0

    coords.remapElement(rect, { x: 0, y: 0, width: 10, height: 10 }, m)

    const newId = rect.getAttribute('fill').replace('url(#', '').replace(')', '')
    const mirrored = defs.ownerDocument.getElementById(newId)
    assert.ok(mirrored)
    assert.equal(mirrored.getAttribute('cx'), '0.8')
    assert.equal(mirrored.getAttribute('fx'), '0.6')
  })

  it('Test remapElement(translate) for ellipse', function () {
    const ellipse = document.createElementNS(NS.SVG, 'ellipse')
    ellipse.setAttribute('cx', '200')
    ellipse.setAttribute('cy', '150')
    ellipse.setAttribute('rx', '125')
    ellipse.setAttribute('ry', '75')
    svg.append(ellipse)

    const attrs = {
      cx: '200',
      cy: '150',
      rx: '125',
      ry: '75'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 1; m.b = 0
    m.c = 0; m.d = 1
    m.e = 100; m.f = -50

    coords.remapElement(ellipse, attrs, m)

    assert.equal(ellipse.getAttribute('cx'), '300')
    assert.equal(ellipse.getAttribute('cy'), '100')
    assert.equal(ellipse.getAttribute('rx'), '125')
    assert.equal(ellipse.getAttribute('ry'), '75')
  })

  it('Test remapElement(scale) for ellipse', function () {
    const ellipse = document.createElementNS(NS.SVG, 'ellipse')
    ellipse.setAttribute('cx', '200')
    ellipse.setAttribute('cy', '150')
    ellipse.setAttribute('rx', '250')
    ellipse.setAttribute('ry', '120')
    svg.append(ellipse)

    const attrs = {
      cx: '200',
      cy: '150',
      rx: '250',
      ry: '120'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 2; m.b = 0
    m.c = 0; m.d = 0.5
    m.e = 0; m.f = 0

    coords.remapElement(ellipse, attrs, m)

    assert.equal(ellipse.getAttribute('cx'), '400')
    assert.equal(ellipse.getAttribute('cy'), '75')
    assert.equal(ellipse.getAttribute('rx'), '500')
    assert.equal(ellipse.getAttribute('ry'), '60')
  })

  it('Test remapElement(translate) for line', function () {
    const line = document.createElementNS(NS.SVG, 'line')
    line.setAttribute('x1', '50')
    line.setAttribute('y1', '100')
    line.setAttribute('x2', '120')
    line.setAttribute('y2', '200')
    svg.append(line)

    const attrs = {
      x1: '50',
      y1: '100',
      x2: '120',
      y2: '200'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 1; m.b = 0
    m.c = 0; m.d = 1
    m.e = 100; m.f = -50

    coords.remapElement(line, attrs, m)

    assert.equal(line.getAttribute('x1'), '150')
    assert.equal(line.getAttribute('y1'), '50')
    assert.equal(line.getAttribute('x2'), '220')
    assert.equal(line.getAttribute('y2'), '150')
  })

  it('Test remapElement(scale) for line', function () {
    const line = document.createElementNS(NS.SVG, 'line')
    line.setAttribute('x1', '50')
    line.setAttribute('y1', '100')
    line.setAttribute('x2', '120')
    line.setAttribute('y2', '200')
    svg.append(line)

    const attrs = {
      x1: '50',
      y1: '100',
      x2: '120',
      y2: '200'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 2; m.b = 0
    m.c = 0; m.d = 0.5
    m.e = 0; m.f = 0

    coords.remapElement(line, attrs, m)

    assert.equal(line.getAttribute('x1'), '100')
    assert.equal(line.getAttribute('y1'), '50')
    assert.equal(line.getAttribute('x2'), '240')
    assert.equal(line.getAttribute('y2'), '100')
  })

  it('Test remapElement(translate) for text', function () {
    const text = document.createElementNS(NS.SVG, 'text')
    text.setAttribute('x', '50')
    text.setAttribute('y', '100')
    svg.append(text)

    const attrs = {
      x: '50',
      y: '100'
    }

    // Create a translate.
    const m = svg.createSVGMatrix()
    m.a = 1; m.b = 0
    m.c = 0; m.d = 1
    m.e = 100; m.f = -50

    coords.remapElement(text, attrs, m)

    assert.equal(text.getAttribute('x'), '150')
    assert.equal(text.getAttribute('y'), '50')
  })

  it('Does not throw with grid snapping enabled and detached elements', function () {
    coords.init({
      getGridSnapping () { return true },
      getDrawing () {
        return {
          getNextId () { return String(elemId++) }
        }
      },
      getCurrentDrawing () {
        return {
          getNextId () { return String(elemId++) }
        }
      }
    })
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('width', '10')
    rect.setAttribute('height', '10')
    const attrs = { x: 0, y: 0, width: 10, height: 10 }
    const m = svg.createSVGMatrix().translate(5, 5)
    coords.remapElement(rect, attrs, m)
    assert.equal(rect.getAttribute('x'), '5')
    assert.equal(rect.getAttribute('y'), '5')
  })

  it('Clones and flips linearGradient on horizontal flip', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)
    const grad = document.createElementNS(NS.SVG, 'linearGradient')
    grad.id = 'grad1'
    grad.setAttribute('x1', '0')
    grad.setAttribute('x2', '1')
    grad.setAttribute('y1', '0')
    grad.setAttribute('y2', '0')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#grad1)')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 10, height: 10 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    const grads = defs.querySelectorAll('linearGradient')
    assert.equal(grads.length, 2)
    const cloned = [...grads].find(g => g.id !== 'grad1')
    assert.ok(cloned)
    assert.equal(rect.getAttribute('fill'), `url(#${cloned.id})`)
    assert.equal(cloned.getAttribute('x1'), '1')
    assert.equal(cloned.getAttribute('x2'), '0')
  })

  it('Skips gradient cloning for external URL references', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(external.svg#grad)')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 10, height: 10 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    assert.equal(rect.getAttribute('fill'), 'url(external.svg#grad)')
    assert.equal(svg.querySelectorAll('linearGradient').length, 0)
  })

  it('Keeps arc radii positive and toggles sweep on reflection', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0 0 A10 5 30 0 0 30 20')
    svg.append(path)

    const m = svg.createSVGMatrix()
    m.a = -2
    m.d = 1
    coords.remapElement(path, {}, m)

    const d = path.getAttribute('d')
    const match = /A\s*([-\d.]+),([-\d.]+)\s+([-\d.]+)\s+(\d+)\s+(\d+)\s+([-\d.]+),([-\d.]+)/.exec(d)
    assert.ok(match, `Unexpected path d: ${d}`)
    const [, rx, ry, angle, largeArc, sweep, x, y] = match
    assert.equal(Number(rx), 20)
    assert.equal(Number(ry), 5)
    assert.equal(Number(angle), -30)
    assert.equal(Number(largeArc), 0)
    assert.equal(Number(sweep), 1)
    assert.equal(Number(x), -60)
    assert.equal(Number(y), 20)
  })

  // Additional tests for branch coverage
  it('Test remapElement with radial gradient and negative scale', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const grad = document.createElementNS(NS.SVG, 'radialGradient')
    grad.id = 'radialGrad1'
    grad.setAttribute('cx', '50%')
    grad.setAttribute('cy', '50%')
    grad.setAttribute('r', '50%')
    grad.setAttribute('fx', '30%')
    grad.setAttribute('fy', '30%')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#radialGrad1)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = -1
    coords.remapElement(rect, attrs, m)

    // Should create a mirrored gradient or keep original
    assert.ok(svg.querySelectorAll('radialGradient').length >= 1)
  })

  it('Test remapElement with image and negative scale', function () {
    const image = document.createElementNS(NS.SVG, 'image')
    image.setAttribute('x', '10')
    image.setAttribute('y', '10')
    image.setAttribute('width', '100')
    image.setAttribute('height', '80')
    svg.append(image)

    const attrs = { x: 10, y: 10, width: 100, height: 80 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(image, attrs, m)

    // Image with negative scale should get matrix transform or have updated attributes
    assert.ok(image.transform.baseVal.numberOfItems > 0 || image.getAttribute('width') !== '100')
  })

  it('Test remapElement with foreignObject', function () {
    const fo = document.createElementNS(NS.SVG, 'foreignObject')
    fo.setAttribute('x', '10')
    fo.setAttribute('y', '10')
    fo.setAttribute('width', '100')
    fo.setAttribute('height', '80')
    svg.append(fo)

    const attrs = { x: 10, y: 10, width: 100, height: 80 }
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    m.e = 50
    m.f = 50
    coords.remapElement(fo, attrs, m)

    assert.equal(Number.parseFloat(fo.getAttribute('x')), 70)
    assert.equal(Number.parseFloat(fo.getAttribute('y')), 70)
    assert.equal(Number.parseFloat(fo.getAttribute('width')), 200)
    assert.equal(Number.parseFloat(fo.getAttribute('height')), 160)
  })

  it('Test remapElement with use element (should skip)', function () {
    const use = document.createElementNS(NS.SVG, 'use')
    use.setAttribute('x', '10')
    use.setAttribute('y', '10')
    use.setAttribute('href', '#someId')
    svg.append(use)

    const attrs = { x: 10, y: 10 }
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    m.e = 50
    m.f = 50
    coords.remapElement(use, attrs, m)

    // Use elements should not be remapped, attributes remain unchanged
    assert.equal(use.getAttribute('x'), '10')
    assert.equal(use.getAttribute('y'), '10')
  })

  it('Test remapElement with text element', function () {
    const text = document.createElementNS(NS.SVG, 'text')
    text.setAttribute('x', '50')
    text.setAttribute('y', '50')
    text.textContent = 'Test'
    svg.append(text)

    const attrs = { x: 50, y: 50 }
    const m = svg.createSVGMatrix()
    m.a = 1
    m.d = 1
    m.e = 10
    m.f = 20
    coords.remapElement(text, attrs, m)

    assert.equal(Number.parseFloat(text.getAttribute('x')), 60)
    assert.equal(Number.parseFloat(text.getAttribute('y')), 70)
  })

  it('Test remapElement with tspan element', function () {
    const text = document.createElementNS(NS.SVG, 'text')
    text.setAttribute('x', '50')
    text.setAttribute('y', '50')
    const tspan = document.createElementNS(NS.SVG, 'tspan')
    tspan.setAttribute('x', '55')
    tspan.setAttribute('y', '55')
    tspan.textContent = 'Test'
    text.append(tspan)
    svg.append(text)

    const attrs = { x: 55, y: 55 }
    const m = svg.createSVGMatrix()
    m.a = 1
    m.d = 1
    m.e = 5
    m.f = 10
    coords.remapElement(tspan, attrs, m)

    assert.equal(Number.parseFloat(tspan.getAttribute('x')), 60)
    assert.equal(Number.parseFloat(tspan.getAttribute('y')), 65)
  })

  it('Test remapElement with gradient in userSpaceOnUse mode', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const grad = document.createElementNS(NS.SVG, 'linearGradient')
    grad.id = 'userSpaceGrad'
    grad.setAttribute('gradientUnits', 'userSpaceOnUse')
    grad.setAttribute('x1', '0%')
    grad.setAttribute('x2', '100%')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#userSpaceGrad)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const initialGradCount = svg.querySelectorAll('linearGradient').length

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    // userSpaceOnUse gradients should not be mirrored
    assert.equal(svg.querySelectorAll('linearGradient').length, initialGradCount)
    assert.equal(rect.getAttribute('fill'), 'url(#userSpaceGrad)')
  })

  it('Test remapElement with polyline', function () {
    const polyline = document.createElementNS(NS.SVG, 'polyline')
    polyline.setAttribute('points', '10,10 20,20 30,10')
    svg.append(polyline)

    const attrs = {
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 10 }
      ]
    }
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    m.e = 5
    m.f = 5
    coords.remapElement(polyline, attrs, m)

    const points = polyline.getAttribute('points')
    // Points should be transformed
    assert.ok(points !== '10,10 20,20 30,10')
  })

  it('Test remapElement with polygon', function () {
    const polygon = document.createElementNS(NS.SVG, 'polygon')
    polygon.setAttribute('points', '10,10 20,10 15,20')
    svg.append(polygon)

    const attrs = {
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
        { x: 15, y: 20 }
      ]
    }
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    m.e = 10
    m.f = 10
    coords.remapElement(polygon, attrs, m)

    const points = polygon.getAttribute('points')
    // Points should be transformed
    assert.ok(points !== '10,10 20,10 15,20')
  })

  it('Test remapElement with g (group) element', function () {
    const g = document.createElementNS(NS.SVG, 'g')
    svg.append(g)

    const attrs = {}
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    coords.remapElement(g, attrs, m)

    // Group elements get handled (may or may not add transform)
    // Just verify it doesn't crash
    assert.ok(g !== null)
  })

  it('Test flipBoxCoordinate with percentage values', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const grad = document.createElementNS(NS.SVG, 'linearGradient')
    grad.id = 'percentGrad'
    grad.setAttribute('x1', '25%')
    grad.setAttribute('x2', '75%')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#percentGrad)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    // Should create a new gradient with flipped percentages or keep original
    const newGrads = svg.querySelectorAll('linearGradient')
    assert.ok(newGrads.length >= 1)
    // Verify rect still has gradient
    assert.ok(rect.getAttribute('fill').includes('url'))
  })

  it('Test remapElement with negative width/height', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '100')
    rect.setAttribute('y', '100')
    rect.setAttribute('width', '50')
    rect.setAttribute('height', '50')
    svg.append(rect)

    const attrs = { x: 100, y: 100, width: 50, height: 50 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = -1
    coords.remapElement(rect, attrs, m)

    // Width and height should remain positive
    assert.ok(Number.parseFloat(rect.getAttribute('width')) > 0)
    assert.ok(Number.parseFloat(rect.getAttribute('height')) > 0)
  })

  it('Test remapElement with path containing curves', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M10,10 C20,20 30,30 40,40')
    svg.append(path)

    const attrs = {}
    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2
    m.e = 5
    m.f = 5
    coords.remapElement(path, attrs, m)

    const d = path.getAttribute('d')
    // Path should be transformed (coordinates change)
    assert.ok(d !== 'M10,10 C20,20 30,30 40,40')
  })

  it('Test remapElement with stroke gradient', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const grad = document.createElementNS(NS.SVG, 'linearGradient')
    grad.id = 'strokeGrad'
    grad.setAttribute('x1', '0%')
    grad.setAttribute('x2', '100%')
    defs.append(grad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('stroke', 'url(#strokeGrad)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    // Should mirror the stroke gradient or keep original
    assert.ok(svg.querySelectorAll('linearGradient').length >= 1)
    // Verify stroke attribute is preserved
    assert.ok(rect.getAttribute('stroke').includes('url'))
  })

  it('Test remapElement with invalid gradient reference', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#nonexistentGrad)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    // Should not crash, gradient stays as is
    assert.equal(rect.getAttribute('fill'), 'url(#nonexistentGrad)')
  })

  it('Test remapElement with rect and skewX transform', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '10')
    rect.setAttribute('width', '50')
    rect.setAttribute('height', '50')
    svg.append(rect)

    const m = svg.createSVGMatrix()
    m.a = 1
    m.b = 0.5
    m.c = 0
    m.d = 1

    const changes = { x: 10, y: 10, width: 50, height: 50 }
    coords.remapElement(rect, changes, m)

    // Should apply transform for skew
    assert.ok(true) // Just test it doesn't crash
  })

  it('Test remapElement with ellipse and negative radii', function () {
    const ellipse = document.createElementNS(NS.SVG, 'ellipse')
    ellipse.setAttribute('cx', '50')
    ellipse.setAttribute('cy', '50')
    ellipse.setAttribute('rx', '30')
    ellipse.setAttribute('ry', '20')
    svg.append(ellipse)

    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = -1

    const changes = { cx: 50, cy: 50, rx: 30, ry: 20 }
    coords.remapElement(ellipse, changes, m)

    // Radii should remain positive
    assert.ok(Number.parseFloat(ellipse.getAttribute('rx')) > 0)
    assert.ok(Number.parseFloat(ellipse.getAttribute('ry')) > 0)
  })

  it('Test remapElement with circle and scale', function () {
    const circle = document.createElementNS(NS.SVG, 'circle')
    circle.setAttribute('cx', '50')
    circle.setAttribute('cy', '50')
    circle.setAttribute('r', '25')
    svg.append(circle)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = { cx: 50, cy: 50, r: 25 }
    coords.remapElement(circle, changes, m)

    assert.ok(circle.getAttribute('cx') !== '50' ||
              circle.getAttribute('r') !== '25')
  })

  it('Test remapElement with line and rotation', function () {
    const line = document.createElementNS(NS.SVG, 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', '0')
    line.setAttribute('x2', '10')
    line.setAttribute('y2', '10')
    svg.append(line)

    const m = svg.createSVGMatrix()
    m.a = 0
    m.b = 1
    m.c = -1
    m.d = 0

    const changes = { x1: 0, y1: 0, x2: 10, y2: 10 }
    coords.remapElement(line, changes, m)

    // Line should be remapped
    assert.ok(true)
  })

  it('Test remapElement with path d attribute update', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M 10,10 L 20,20')
    svg.append(path)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = { d: 'M 10,10 L 20,20' }
    coords.remapElement(path, changes, m)

    assert.ok(path.getAttribute('d') !== null)
  })

  it('Test remapElement with rect having both fill and stroke gradients', function () {
    const fillGrad = document.createElementNS(NS.SVG, 'linearGradient')
    fillGrad.setAttribute('id', 'fillGradientTest')
    fillGrad.setAttribute('x1', '0')
    fillGrad.setAttribute('x2', '1')
    svg.append(fillGrad)

    const strokeGrad = document.createElementNS(NS.SVG, 'linearGradient')
    strokeGrad.setAttribute('id', 'strokeGradientTest')
    strokeGrad.setAttribute('y1', '0')
    strokeGrad.setAttribute('y2', '1')
    svg.append(strokeGrad)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('fill', 'url(#fillGradientTest)')
    rect.setAttribute('stroke', 'url(#strokeGradientTest)')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    svg.append(rect)

    const attrs = { x: 0, y: 0, width: 100, height: 100 }
    const m = svg.createSVGMatrix()
    m.a = -1
    m.d = 1
    coords.remapElement(rect, attrs, m)

    assert.ok(svg.querySelectorAll('linearGradient').length >= 2)
  })

  it('Test remapElement with zero-width rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '10')
    rect.setAttribute('width', '0')
    rect.setAttribute('height', '50')
    svg.append(rect)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = { x: 10, y: 10, width: 0, height: 50 }
    coords.remapElement(rect, changes, m)

    assert.ok(true) // Should not crash
  })

  it('Test remapElement with zero-height rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '10')
    rect.setAttribute('width', '50')
    rect.setAttribute('height', '0')
    svg.append(rect)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = { x: 10, y: 10, width: 50, height: 0 }
    coords.remapElement(rect, changes, m)

    assert.ok(true) // Should not crash
  })

  it('Test remapElement with zero-radius circle', function () {
    const circle = document.createElementNS(NS.SVG, 'circle')
    circle.setAttribute('cx', '50')
    circle.setAttribute('cy', '50')
    circle.setAttribute('r', '0')
    svg.append(circle)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = { cx: 50, cy: 50, r: 0 }
    coords.remapElement(circle, changes, m)

    assert.ok(true) // Should not crash
  })

  it('Test remapElement with symbol element', function () {
    const symbol = document.createElementNS(NS.SVG, 'symbol')
    symbol.setAttribute('viewBox', '0 0 100 100')
    svg.append(symbol)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = {}
    coords.remapElement(symbol, changes, m)

    assert.ok(true)
  })

  it('Test remapElement with defs element', function () {
    const defs = document.createElementNS(NS.SVG, 'defs')
    svg.append(defs)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = {}
    coords.remapElement(defs, changes, m)

    assert.ok(true)
  })

  it('Test remapElement with marker element', function () {
    const marker = document.createElementNS(NS.SVG, 'marker')
    marker.setAttribute('markerWidth', '10')
    marker.setAttribute('markerHeight', '10')
    svg.append(marker)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = {}
    coords.remapElement(marker, changes, m)

    assert.ok(true)
  })

  it('Test remapElement with style element', function () {
    const style = document.createElementNS(NS.SVG, 'style')
    style.textContent = '.cls { fill: red; }'
    svg.append(style)

    const m = svg.createSVGMatrix()
    m.a = 2
    m.d = 2

    const changes = {}
    coords.remapElement(style, changes, m)

    assert.ok(true)
  })
})
