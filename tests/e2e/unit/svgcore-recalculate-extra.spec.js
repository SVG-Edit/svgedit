import { test, expect } from '../fixtures.js'

test.describe('SVG core recalculate extra cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('scales elements and flips gradients/matrices', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { utilities, coords, recalculate } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
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
        },
        remove (el, key) {
          const bucket = this.store.get(el)
          if (!bucket) return false
          const deleted = bucket.delete(key)
          if (!bucket.size) this.store.delete(el)
          return deleted
        }
      }

      const canvasStub = {
        getSvgRoot: () => svg,
        getStartTransform: () => '',
        setStartTransform: () => {},
        getDataStorage: () => dataStorage,
        getCurrentDrawing: () => ({ getNextId: () => 'g1' })
      }

      utilities.init({
        getSvgRoot: () => svg,
        getDOMDocument: () => document,
        getDOMContainer: () => svg,
        getDataStorage: () => dataStorage
      })
      coords.init({
        getGridSnapping: () => false,
        getDrawing: () => ({ getNextId: () => 'id2' }),
        getDataStorage: () => dataStorage
      })
      recalculate.init(canvasStub)

      // Scale about center via translate/scale/translate sequence
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '5')
      rect.setAttribute('y', '6')
      rect.setAttribute('width', '10')
      rect.setAttribute('height', '8')
      rect.setAttribute('transform', 'translate(5 5) scale(2 3) translate(-5 -5)')
      svg.append(rect)

      // Flip with gradient fill using matrix
      const rectFlip = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectFlip.setAttribute('x', '0')
      rectFlip.setAttribute('y', '0')
      rectFlip.setAttribute('width', '4')
      rectFlip.setAttribute('height', '4')
      rectFlip.setAttribute('fill', 'url(#grad1)')
      rectFlip.setAttribute('transform', 'matrix(-1 0 0 1 0 0)')
      svg.append(rectFlip)

      recalculate.recalculateDimensions(rect)
      recalculate.recalculateDimensions(rectFlip)

      return {
        rect: {
          width: rect.getAttribute('width'),
          height: rect.getAttribute('height'),
          transformRemoved: rect.hasAttribute('transform')
        },
        flip: {
          width: rectFlip.getAttribute('width'),
          height: rectFlip.getAttribute('height'),
          fill: rectFlip.getAttribute('fill')
        }
      }
    })

    expect(Number(result.rect.width)).toBeGreaterThan(10)
    expect(Number(result.rect.height)).toBeGreaterThan(8)
    expect(result.rect.transformRemoved).toBe(false) // scaling keeps transform list
    expect(result.flip.fill.startsWith('url(')).toBe(true)
  })

  test('recalculateDimensions reapplies rotations and updates clip paths', async ({ page }) => {
    const result = await page.evaluate(() => {
      const NS = 'http://www.w3.org/2000/svg'
      const { utilities, coords, recalculate } = window.svgHarness
      const svg = document.createElementNS(NS, 'svg')
      const defs = document.createElementNS(NS, 'defs')
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
      const drawing = {
        next: 0,
        getNextId () {
          this.next += 1
          return 'd' + this.next
        }
      }

      const canvasStub = {
        getSvgRoot: () => svg,
        getSvgContent: () => svg,
        getDOMDocument: () => document,
        getDOMContainer: () => svg,
        getDataStorage: () => dataStorage,
        getStartTransform: () => '',
        setStartTransform: () => {},
        getCurrentDrawing: () => drawing
      }
      utilities.init(canvasStub)
      coords.init({
        getGridSnapping: () => false,
        getDrawing: () => drawing,
        getDataStorage: () => dataStorage,
        getCurrentDrawing: () => drawing,
        getSvgRoot: () => svg
      })
      recalculate.init(canvasStub)

      const rect = document.createElementNS(NS, 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '0')
      rect.setAttribute('width', '10')
      rect.setAttribute('height', '10')
      rect.setAttribute('transform', 'translate(10 5) rotate(30)')
      svg.append(rect)

      const clipPath = document.createElementNS(NS, 'clipPath')
      clipPath.id = 'clip1'
      const clipRect = document.createElementNS(NS, 'rect')
      clipRect.setAttribute('x', '0')
      clipRect.setAttribute('y', '0')
      clipRect.setAttribute('width', '4')
      clipRect.setAttribute('height', '4')
      clipPath.append(clipRect)
      defs.append(clipPath)

      const cmd = recalculate.recalculateDimensions(rect)
      recalculate.updateClipPath('url(#clip1)', 3, -2)

      return {
        rect: {
          x: rect.getAttribute('x'),
          y: rect.getAttribute('y'),
          transform: rect.getAttribute('transform'),
          hasCommand: Boolean(cmd)
        },
        clip: {
          x: clipRect.getAttribute('x'),
          y: clipRect.getAttribute('y'),
          transforms: clipRect.transform.baseVal.numberOfItems
        }
      }
    })

    expect(result.rect.x).toBe('10')
    expect(result.rect.y).toBe('5')
    expect(result.rect.transform).toContain('rotate(')
    expect(result.rect.transform).not.toContain('translate')
    expect(result.rect.hasCommand).toBe(true)
    expect(result.clip.x).toBe('3')
    expect(result.clip.y).toBe('-2')
    expect(result.clip.transforms).toBe(0)
  })

  test('recalculateDimensions remaps polygons and matrix transforms', async ({ page }) => {
    const result = await page.evaluate(() => {
      const NS = 'http://www.w3.org/2000/svg'
      const { utilities, coords, recalculate } = window.svgHarness
      const svg = document.createElementNS(NS, 'svg')
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
      const drawing = {
        next: 0,
        getNextId () {
          this.next += 1
          return 'p' + this.next
        }
      }
      const canvasStub = {
        getSvgRoot: () => svg,
        getSvgContent: () => svg,
        getDOMDocument: () => document,
        getDOMContainer: () => svg,
        getDataStorage: () => dataStorage,
        getStartTransform: () => '',
        setStartTransform: () => {},
        getCurrentDrawing: () => drawing
      }
      utilities.init(canvasStub)
      coords.init({
        getGridSnapping: () => false,
        getDrawing: () => drawing,
        getDataStorage: () => dataStorage,
        getCurrentDrawing: () => drawing,
        getSvgRoot: () => svg
      })
      recalculate.init(canvasStub)

      const poly = document.createElementNS(NS, 'polygon')
      poly.setAttribute('points', '0,0 10,0 10,10')
      poly.setAttribute('transform', 'translate(5 5) scale(-1 2) translate(-5 -5)')
      svg.append(poly)

      const path = document.createElementNS(NS, 'path')
      path.setAttribute('d', 'M0 0 L1 0 L1 1 z')
      path.setAttribute('transform', 'matrix(1 0 0 1 7 8)')
      svg.append(path)

      const rect = document.createElementNS(NS, 'rect')
      rect.setAttribute('x', '1')
      rect.setAttribute('y', '2')
      rect.setAttribute('width', '5')
      rect.setAttribute('height', '4')
      rect.setAttribute('transform', 'matrix(1 0 0 1 7 8)')
      svg.append(rect)

      const useElem = document.createElementNS(NS, 'use')
      useElem.setAttribute('href', '#missing')
      useElem.setAttribute('transform', 'translate(3 4)')
      svg.append(useElem)

      const cmdPoly = recalculate.recalculateDimensions(poly)
      const cmdPath = recalculate.recalculateDimensions(path)
      recalculate.recalculateDimensions(rect)
      const cmdUse = recalculate.recalculateDimensions(useElem)

      return {
        poly: {
          points: poly.getAttribute('points'),
          hasTransform: poly.hasAttribute('transform'),
          hasCommand: Boolean(cmdPoly)
        },
        path: {
          d: path.getAttribute('d'),
          transform: path.getAttribute('transform') || '',
          hasCommand: Boolean(cmdPath)
        },
        rect: {
          x: rect.getAttribute('x'),
          transform: rect.getAttribute('transform')
        },
        useResult: cmdUse
      }
    })

    expect(result.poly.hasTransform).toBe(false)
    expect(result.poly.points).toContain('-5')
    expect(result.poly.hasCommand).toBe(true)
    expect(result.path.d.startsWith('M7,8')).toBe(true)
    expect(result.path.transform).toBe('')
    expect(result.path.hasCommand).toBe(true)
    expect(result.rect.x).toBe('1')
    expect(result.rect.transform).toContain('matrix')
    expect(result.useResult).toBeNull()
  })
})
