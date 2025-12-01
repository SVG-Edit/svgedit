import { test, expect } from '../fixtures.js'

test.describe('SVG core recalculate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('recalculateDimensions swallows identity and applies translations', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { utilities, coords, recalculate } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
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
      const initContexts = () => {
        utilities.init({
          getSvgRoot: () => svg,
          getDOMDocument: () => document,
          getDOMContainer: () => svg,
          getDataStorage: () => dataStorage
        })
        coords.init({
          getGridSnapping: () => false,
          getDrawing: () => ({ getNextId: () => '1' }),
          getDataStorage: () => dataStorage
        })
        recalculate.init({
          getSvgRoot: () => svg,
          getStartTransform: () => '',
          setStartTransform: () => {},
          getDataStorage: () => dataStorage
        })
      }
      initContexts()

      const identityRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      identityRect.setAttribute('x', '10')
      identityRect.setAttribute('y', '10')
      identityRect.setAttribute('width', '20')
      identityRect.setAttribute('height', '30')
      identityRect.setAttribute('transform', 'matrix(1,0,0,1,0,0)')
      svg.append(identityRect)

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '200')
      rect.setAttribute('y', '150')
      rect.setAttribute('width', '250')
      rect.setAttribute('height', '120')
      rect.setAttribute('transform', 'translate(100,50)')
      svg.append(rect)

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', '200')
      text.setAttribute('y', '150')
      text.setAttribute('transform', 'translate(100,50)')
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      tspan.setAttribute('x', '200')
      tspan.setAttribute('y', '150')
      tspan.textContent = 'Foo bar'
      text.append(tspan)
      svg.append(text)

      recalculate.recalculateDimensions(identityRect)
      recalculate.recalculateDimensions(rect)
      recalculate.recalculateDimensions(text)

      return {
        identityHasTransform: identityRect.hasAttribute('transform'),
        rectAttrs: {
          x: rect.getAttribute('x'),
          y: rect.getAttribute('y'),
          width: rect.getAttribute('width'),
          height: rect.getAttribute('height')
        },
        textAttrs: {
          x: text.getAttribute('x'),
          y: text.getAttribute('y')
        },
        tspanAttrs: {
          x: tspan.getAttribute('x'),
          y: tspan.getAttribute('y')
        }
      }
    })

    expect(result.identityHasTransform).toBe(false)
    expect(result.rectAttrs).toEqual({
      x: '300',
      y: '200',
      width: '250',
      height: '120'
    })
    expect(result.textAttrs).toEqual({ x: '300', y: '200' })
    expect(result.tspanAttrs).toEqual({ x: '300', y: '200' })
  })
})
