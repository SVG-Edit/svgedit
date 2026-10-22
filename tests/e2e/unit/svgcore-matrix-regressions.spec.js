import { test, expect } from '../fixtures.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/unit-harness.html')
  await page.waitForFunction(() => Boolean(window.svgHarness))
})

test('matrix products preserve non-commuting 2D transforms and 3D inputs', async ({ page }) => {
  const products = await page.evaluate(() => {
    const { math } = window.svgHarness
    const fields = ['a', 'b', 'c', 'd', 'e', 'f']
    const cases = [
      [],
      [new DOMMatrix([2, 0.3, -0.2, 0.5, 12, -7])],
      [
        new DOMMatrix().translate(20, -10).rotate(35),
        new DOMMatrix().scale(2, 0.5).skewX(12),
        new DOMMatrix().translate(-4, 9)
      ],
      [
        new DOMMatrix().translate(4, 5, 6).rotateAxisAngle(1, 1, 0, 30),
        new DOMMatrix().rotateAxisAngle(0, 1, 1, 25).scale(2, 3, 4)
      ]
    ]
    return cases.map(matrices => {
      const actual = math.matrixMultiply(...matrices)
      const expected = matrices.reduce((product, matrix) => product.multiply(matrix), new DOMMatrix())
      return fields.map(field => ({ actual: actual[field], expected: expected[field] }))
    })
  })
  for (const product of products) {
    for (const entry of product) expect(entry.actual).toBeCloseTo(entry.expected, 10)
  }
})

test('empty transform lists return independent identity transforms', async ({ page }) => {
  const result = await page.evaluate(() => {
    const { math } = window.svgHarness
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const first = math.transformListToTransform(rect.transform.baseVal)
    first.matrix.e = 99
    const next = math.transformListToTransform(rect.transform.baseVal)
    const absent = math.transformListToTransform(null)
    return {
      firstTranslation: first.matrix.e,
      next: ['a', 'b', 'c', 'd', 'e', 'f'].map(field => next.matrix[field]),
      absent: ['a', 'b', 'c', 'd', 'e', 'f'].map(field => absent.matrix[field])
    }
  })
  expect(result.firstTranslation).toBe(99)
  expect(result.next).toEqual([1, 0, 0, 1, 0, 0])
  expect(result.absent).toEqual([1, 0, 0, 1, 0, 0])
})
