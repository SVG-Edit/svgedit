import { test, expect } from './fixtures.js'
import { clickCanvas, setSvgSource, visitAndApproveStorage } from './helpers.js'

const SAMPLE_SVG = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
   <g class="layer">
    <title>Layer 1</title>
    <circle cx="100" cy="100" r="50" fill="#FF0000" id="testCircle" stroke="#000000" stroke-width="5"/>
   </g>
  </svg>`

test.describe('Clipboard', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
    await setSvgSource(page, SAMPLE_SVG)
    await expect(page.locator('#testCircle')).toBeVisible()
  })

  test('copy, paste, cut and delete shapes', async ({ page }) => {
    await page.locator('#testCircle').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#copy"]').click()

    await clickCanvas(page, { x: 200, y: 200 })
    await page.locator('#svgroot').click({ position: { x: 200, y: 200 }, button: 'right' })
    await page.locator('#cmenu_canvas a[href="#paste"]').click()

    await expect(page.locator('#svg_1')).toBeVisible()
    await expect(page.locator('#svg_2')).toHaveCount(0)

    await page.locator('#testCircle').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#cut"]').click()
    await expect(page.locator('#testCircle')).toHaveCount(0)
    await expect(page.locator('#svg_1')).toBeVisible()

    await page.locator('#svgroot').click({ position: { x: 240, y: 240 }, button: 'right' })
    await page.locator('#cmenu_canvas a[href="#paste"]').click()
    await expect(page.locator('#svg_2')).toBeVisible()

    await page.locator('#svg_2').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#delete"]').click()
    await page.locator('#svg_1').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#delete"]').click()
    await expect(page.locator('#svg_1')).toHaveCount(0)
    await expect(page.locator('#svg_2')).toHaveCount(0)
  })
})
