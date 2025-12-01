import { test, expect } from '../fixtures.js'

test.describe('SVG namespace helpers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness?.namespaces))
  })

  test('reverse namespace map includes core URIs', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { namespaces } = window.svgHarness
      const reverse = namespaces.getReverseNS()
      return {
        svg: namespaces.NS.SVG,
        html: namespaces.NS.HTML,
        xml: namespaces.NS.XML,
        reverseSvg: reverse[namespaces.NS.SVG],
        reverseXmlns: reverse[namespaces.NS.XMLNS]
      }
    })

    expect(result.svg).toBe('http://www.w3.org/2000/svg')
    expect(result.html).toBe('http://www.w3.org/1999/xhtml')
    expect(result.xml).toBe('http://www.w3.org/XML/1998/namespace')
    expect(result.reverseSvg).toBe('svg')
    expect(result.reverseXmlns).toBe('xmlns')
  })
})
