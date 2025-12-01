import { test, expect } from '../fixtures.js'

test.describe('clear module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('clears canvas content and sets default attributes', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { clearModule } = window.svgHarness
      const svgContent = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgContent.append(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
      const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const canvas = {
        getCurConfig: () => ({ dimensions: [100, 50], show_outside_canvas: false }),
        getSvgContent: () => svgContent,
        getSvgRoot: () => svgRoot,
        getDOMDocument: () => document
      }

      clearModule.init(canvas)
      clearModule.clearSvgContentElementInit()
      const comment = svgContent.firstChild

      return {
        childCount: svgContent.childNodes.length,
        isComment: comment.nodeType,
        overflow: svgContent.getAttribute('overflow'),
        width: svgContent.getAttribute('width'),
        height: svgContent.getAttribute('height'),
        appended: svgRoot.contains(svgContent)
      }
    })

    expect(result.childCount).toBe(1)
    expect(result.isComment).toBe(8)
    expect(result.overflow).toBe('hidden')
    expect(result.width).toBe('100')
    expect(result.height).toBe('50')
    expect(result.appended).toBe(true)
  })

  test('honors show_outside_canvas flag when clearing', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const { clearModule } = window.svgHarness
      const svgContent = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      clearModule.init({
        getCurConfig: () => ({ dimensions: [10, 20], show_outside_canvas: true }),
        getSvgContent: () => svgContent,
        getSvgRoot: () => svgRoot,
        getDOMDocument: () => document
      })
      clearModule.clearSvgContentElementInit()
      return svgContent.getAttribute('overflow')
    })

    expect(overflow).toBe('visible')
  })
})
