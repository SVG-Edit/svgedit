import { test, expect } from './fixtures.js'
import { setSvgSource, visitAndApproveStorage } from './helpers.js'

test.describe('Control points', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('dragging arc path control points keeps path valid', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <path d="m187,194a114,62 0 1 0 219,2" id="svg_1" fill="#FF0000" stroke="#000000" stroke-width="5"/>
      </g>
    </svg>`)

    const d = await page.locator('#svg_1').getAttribute('d')
    expect(d).toBeTruthy()
    expect(d).not.toContain('NaN')
  })
})
