import { test, expect } from '../fixtures.js'

test.describe('SVG core smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('math basics work with real SVG matrices', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { math } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const m = svg.createSVGMatrix().translate(50, 75)
      const pt = math.transformPoint(10, 20, m)
      const isId = math.isIdentity(svg.createSVGMatrix())
      const box = math.transformBox(0, 0, 10, 20, m)
      return {
        pt,
        isId,
        box: {
          x: box.aabox.x,
          y: box.aabox.y,
          width: box.aabox.width,
          height: box.aabox.height
        }
      }
    })
    expect(result.isId).toBe(true)
    expect(result.pt.x).toBe(60)
    expect(result.pt.y).toBe(95)
    expect(result.box).toEqual({ x: 50, y: 75, width: 10, height: 20 })
  })

  test('coords module exposes remapElement', async ({ page }) => {
    const hasRemap = await page.evaluate(() => {
      return typeof window.svgHarness.coords.remapElement === 'function'
    })
    expect(hasRemap).toBe(true)
  })

  test('path.convertPath converts to relative without throwing', async ({ page }) => {
    const d = await page.evaluate(() => {
      const { pathModule, units } = window.svgHarness
      units.init({
        getRoundDigits: () => 2,
        getBaseUnit: () => 'px'
      })
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M0 0 L10 0 L10 10 Z')
      svg.append(path)
      pathModule.convertPath(path, true)
      return path.getAttribute('d')
    })
    expect(d?.toLowerCase()).toContain('m')
    expect(d?.toLowerCase()).toContain('z')
  })

  test('utilities getBBoxFromPath returns finite numbers', async ({ page }) => {
    const bbox = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '1')
      rect.setAttribute('width', '5')
      rect.setAttribute('height', '10')
      svg.append(rect)
      const res = utilities.getBBoxOfElementAsPath(
        rect,
        (json) => {
          const el = document.createElementNS('http://www.w3.org/2000/svg', json.element)
          Object.entries(json.attr).forEach(([k, v]) => el.setAttribute(k, v))
          svg.append(el)
          return el
        },
        { resetOrientation: () => {} }
      )
      return { x: res.x, y: res.y, width: res.width, height: res.height }
    })
    expect(Number.isFinite(bbox.x)).toBe(true)
    expect(Number.isFinite(bbox.y)).toBe(true)
    expect(Number.isFinite(bbox.width)).toBe(true)
    expect(Number.isFinite(bbox.height)).toBe(true)
  })
})
