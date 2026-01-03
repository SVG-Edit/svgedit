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
    coords.init(
      /**
      * @implements {module:coords.EditorContext}
      */
      {
        getGridSnapping () { return false },
        getDrawing () { return drawing },
        getCurrentDrawing () { return drawing }
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
})
