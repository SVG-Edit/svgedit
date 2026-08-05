import { test, expect } from './fixtures.js'
import {
  clickCanvas,
  dismissStorageDialog,
  selectEnglishAndSnap,
  setSvgSource,
  visitAndApproveStorage
} from './helpers.js'

const SAMPLE_SVG = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
   <g class="layer">
    <title>Layer 1</title>
    <circle cx="100" cy="100" r="50" fill="#FF0000" id="testCircle" stroke="#000000" stroke-width="5"/>
   </g>
  </svg>`

const REFERENCED_DEFS_SVG = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
   <defs>
    <linearGradient id="testGradient" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="#ff0000"/>
     <stop offset="1" stop-color="#0000ff"/>
    </linearGradient>
    <symbol id="testSymbol" viewBox="0 0 100 100">
     <rect width="100" height="100" fill="url(#testGradient)"/>
    </symbol>
   </defs>
   <g class="layer">
    <title>Layer 1</title>
    <use id="testUse" href="#testSymbol" x="50" y="50" width="100" height="100"/>
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

  test('keeps paste enabled when clipboard data arrives from another tab', async ({ page, context }) => {
    const secondPage = await context.newPage()
    await secondPage.goto('/index.html')
    await dismissStorageDialog(secondPage)
    await secondPage.waitForSelector('#svgroot', { timeout: 20000 })
    await selectEnglishAndSnap(secondPage)

    await page.locator('#testCircle').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#copy"]').click()

    await expect.poll(() => secondPage.evaluate(() => (
      sessionStorage.getItem('svgedit_clipboard')
    ))).toContain('"testCircle"')

    await expect.poll(() => secondPage.evaluate(() => (
      localStorage.getItem('svgedit_clipboard')
    ))).toBeNull()

    await secondPage.locator('#svgroot').click({
      position: { x: 200, y: 200 },
      button: 'right'
    })
    const pasteLink = secondPage.locator('#cmenu_canvas a[href="#paste"]')
    await expect(pasteLink.locator('..')).not.toHaveClass(/disabled/)
    await pasteLink.click()

    await expect(secondPage.locator('#svgcontent circle')).toHaveCount(1)
  })

  test('copies recursively referenced defs to another tab', async ({ page, context }) => {
    await setSvgSource(page, REFERENCED_DEFS_SVG)
    await expect(page.locator('#testUse')).toBeVisible()

    const secondPage = await context.newPage()
    await secondPage.goto('/index.html')
    await dismissStorageDialog(secondPage)
    await secondPage.waitForSelector('#svgroot', { timeout: 20000 })
    await selectEnglishAndSnap(secondPage)

    await page.locator('#testUse').click({ button: 'right' })
    await page.locator('#cmenu_canvas a[href="#copy"]').click()

    await expect.poll(() => secondPage.evaluate(() => (
      sessionStorage.getItem('svgedit_clipboard')
    ))).toContain('testSymbol')

    await secondPage.locator('#svgroot').click({
      position: { x: 240, y: 240 },
      button: 'right'
    })
    await secondPage.locator('#cmenu_canvas a[href="#paste"]').click()

    await expect(secondPage.locator('#svgcontent defs #testSymbol')).toHaveCount(1)
    await expect(secondPage.locator('#svgcontent defs #testGradient')).toHaveCount(1)
    await expect(secondPage.locator('#svgcontent use[href="#testSymbol"]')).toHaveCount(1)
  })
})
