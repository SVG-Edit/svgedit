import { test, expect } from '../fixtures.js'

test.describe('SVG core remap extras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('remapElement handles gradients, text/tspan and paths with snapping', async ({ page }) => {
    const result = await page.evaluate(() => {
      const NS = 'http://www.w3.org/2000/svg'
      const { coords, utilities, units } = window.svgHarness
      const svg = document.createElementNS(NS, 'svg')
      const defs = document.createElementNS(NS, 'defs')
      const grad = document.createElementNS(NS, 'linearGradient')
      grad.id = 'grad1'
      grad.setAttribute('x1', '0')
      grad.setAttribute('x2', '1')
      grad.setAttribute('y1', '0')
      grad.setAttribute('y2', '0')
      defs.append(grad)
      svg.append(defs)
      document.body.append(svg)

      const dataStorage = {
        store: new WeakMap(),
        put (el, key, value) {
          if (!this.store.has(el)) this.store.set(el, new Map())
          this.store.get(el).set(key, value)
        },
        get (el, key) {
          return this.store.get(el)?.get(key)
        },
        has (el, key) {
          return this.store.has(el) && this.store.get(el).has(key)
        }
      }
      let idCounter = 0
      const canvas = {
        getSvgRoot: () => svg,
        getSvgContent: () => svg,
        getDOMDocument: () => document,
        getDOMContainer: () => svg,
        getBaseUnit: () => 'px',
        getSnappingStep: () => 5,
        getGridSnapping: () => true,
        getWidth: () => 200,
        getHeight: () => 200,
        getCurrentDrawing: () => ({
          getNextId: () => 'g' + (++idCounter)
        }),
        getDataStorage: () => dataStorage
      }

      utilities.init(canvas)
      units.init(canvas)
      coords.init(canvas)

      const group = document.createElementNS(NS, 'g')
      svg.append(group)

      const text = document.createElementNS(NS, 'text')
      text.textContent = 'hello'
      text.setAttribute('x', '2')
      text.setAttribute('y', '3')
      text.setAttribute('font-size', '10')
      const tspan = document.createElementNS(NS, 'tspan')
      tspan.setAttribute('x', '4')
      tspan.setAttribute('y', '5')
      tspan.setAttribute('font-size', '8')
      tspan.textContent = 't'
      text.append(tspan)
      group.append(text)

      const textMatrix = svg.createSVGMatrix()
      textMatrix.a = -2
      textMatrix.d = 1.5
      textMatrix.e = 10
      coords.remapElement(text, { x: 2, y: 3 }, textMatrix)

      const rect = document.createElementNS(NS, 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '0')
      rect.setAttribute('width', '10')
      rect.setAttribute('height', '6')
      rect.setAttribute('fill', 'url(#grad1)')
      group.append(rect)

      const flipMatrix = svg.createSVGMatrix()
      flipMatrix.a = -1
      flipMatrix.d = -1
      coords.remapElement(rect, { x: 0, y: 0, width: 10, height: 6 }, flipMatrix)

      const path = document.createElementNS(NS, 'path')
      path.setAttribute('d', 'M0 0 L5 0 l5 5 a2 3 0 0 1 2 2 z')
      group.append(path)
      const pathMatrix = svg.createSVGMatrix()
      pathMatrix.a = 1
      pathMatrix.d = 2
      pathMatrix.e = 3
      pathMatrix.f = -1
      coords.remapElement(path, {}, pathMatrix)

      return {
        text: {
          x: text.getAttribute('x'),
          y: text.getAttribute('y'),
          fontSize: text.getAttribute('font-size'),
          tspanX: tspan.getAttribute('x'),
          tspanY: tspan.getAttribute('y'),
          tspanSize: tspan.getAttribute('font-size')
        },
        rect: {
          fill: rect.getAttribute('fill'),
          width: rect.getAttribute('width'),
          height: rect.getAttribute('height'),
          x: rect.getAttribute('x'),
          y: rect.getAttribute('y')
        },
        path: path.getAttribute('d')
      }
    })

    expect(result.text).toEqual({
      x: '5',
      y: '5',
      fontSize: '20',
      tspanX: '2',
      tspanY: '7.5',
      tspanSize: '16'
    })
    expect(result.rect.fill).toContain('url(#g')
    expect(result.rect.width).toBe('10')
    expect(result.rect.height).toBe('5')
    expect(result.rect.x).toBe('-10')
    expect(result.rect.y).toBe('-5')
    expect(result.path.startsWith('M3,')).toBe(true)
    expect(result.path).toContain('a2,6')
  })
})
