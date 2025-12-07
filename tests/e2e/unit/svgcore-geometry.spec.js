import { test, expect } from '../fixtures.js'

test.describe('SVG core math and coords', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('math helpers consolidate transforms and snapping', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { math } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.append(svg)
      const identity = math.transformPoint(100, 200, svg.createSVGMatrix())
      const translatedMatrix = svg.createSVGMatrix()
      translatedMatrix.e = 300
      translatedMatrix.f = 400
      const translated = math.transformPoint(5, 5, translatedMatrix)
      const tlist = math.getTransformList(svg)
      const hasMatrixBefore = math.hasMatrixTransform(tlist)
      const tf = svg.createSVGTransformFromMatrix(translatedMatrix)
      tlist.appendItem(tf)
      const consolidated = math.transformListToTransform(tlist).matrix
      const hasMatrixAfter = math.hasMatrixTransform(tlist)
      const multiplied = math.matrixMultiply(
        svg.createSVGMatrix().translate(10, 20),
        svg.createSVGMatrix().translate(-10, -20)
      )
      const snapped = math.snapToAngle(0, 0, 10, 5)
      const intersects = {
        overlap: math.rectsIntersect(
          { x: 0, y: 0, width: 50, height: 50 },
          { x: 25, y: 25, width: 10, height: 10 }
        ),
        apart: math.rectsIntersect(
          { x: 0, y: 0, width: 10, height: 10 },
          { x: 100, y: 100, width: 5, height: 5 }
        )
      }
      return {
        identity,
        translated,
        hasMatrixBefore,
        hasMatrixAfter,
        consolidated: { e: consolidated.e, f: consolidated.f },
        multiplied: { e: multiplied.e, f: multiplied.f },
        snapped,
        intersects
      }
    })
    expect(result.identity).toEqual({ x: 100, y: 200 })
    expect(result.translated).toEqual({ x: 305, y: 405 })
    expect(result.hasMatrixBefore).toBe(false)
    expect(result.hasMatrixAfter).toBe(true)
    expect(result.consolidated.e).toBe(300)
    expect(result.consolidated.f).toBe(400)
    expect(result.multiplied.e).toBe(0)
    expect(result.multiplied.f).toBe(0)
    expect(result.snapped.a).toBeCloseTo(Math.PI / 4)
    expect(result.intersects.overlap).toBe(true)
    expect(result.intersects.apart).toBe(false)
  })

  test('coords.remapElement handles translation and scaling', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { coords, utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.append(svg)
      utilities.init({
        getSvgRoot: () => svg,
        getDOMDocument: () => document,
        getDOMContainer: () => svg
      })
      coords.init({
        getGridSnapping: () => false,
        getDrawing: () => ({ getNextId: () => '1' })
      })
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '200')
      rect.setAttribute('y', '150')
      rect.setAttribute('width', '250')
      rect.setAttribute('height', '120')
      svg.append(rect)
      const translateMatrix = svg.createSVGMatrix()
      translateMatrix.e = 100
      translateMatrix.f = -50
      coords.remapElement(
        rect,
        { x: '200', y: '150', width: '125', height: '75' },
        translateMatrix
      )
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', '200')
      circle.setAttribute('cy', '150')
      circle.setAttribute('r', '250')
      svg.append(circle)
      const scaleMatrix = svg.createSVGMatrix()
      scaleMatrix.a = 2
      scaleMatrix.d = 0.5
      coords.remapElement(
        circle,
        { cx: '200', cy: '150', r: '250' },
        scaleMatrix
      )
      return {
        rect: {
          x: rect.getAttribute('x'),
          y: rect.getAttribute('y'),
          width: rect.getAttribute('width'),
          height: rect.getAttribute('height')
        },
        circle: {
          cx: circle.getAttribute('cx'),
          cy: circle.getAttribute('cy'),
          r: circle.getAttribute('r')
        }
      }
    })
    expect(result.rect).toEqual({ x: '300', y: '100', width: '125', height: '75' })
    expect(result.circle).toEqual({ cx: '400', cy: '75', r: '125' })
  })
})
