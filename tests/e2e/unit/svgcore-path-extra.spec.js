import { test, expect } from '../fixtures.js'

test.describe('SVG core path extras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness?.pathModule))
  })

  test('convertPath handles arcs and shorthand commands', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { pathModule, units } = window.svgHarness
      // Ensure unit helpers are initialized so shortFloat can round numbers.
      units.init({
        getRoundDigits: () => 3,
        getBaseUnit: () => 'px',
        getElement: () => null,
        getHeight: () => 100,
        getWidth: () => 100
      })
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute(
        'd',
        'M0 0 H10 V10 h-5 v-5 a5 5 0 0 1 5 5 S20 20 25 25 Z'
      )

      const rel = pathModule.convertPath(path, true)
      const abs = pathModule.convertPath(path, false)

      return { rel, abs }
    })

    expect(result.rel.toLowerCase()).toContain('a')
    expect(result.rel).toContain('s')
    expect(result.abs).toContain('L')
    expect(result.abs).toContain('A')
  })
})
