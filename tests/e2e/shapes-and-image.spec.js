import { test, expect } from './fixtures.js'
import { setSvgSource, visitAndApproveStorage } from './helpers.js'

test.describe('Shapes and images', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('renders a shape and image', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <rect id="svg_1" x="50" y="50" width="80" height="80" fill="#00ff00" />
        <image id="svg_2" href="./images/logo.svg" x="150" y="150" width="80" height="80" />
      </g>
    </svg>`)
    await expect(page.locator('#svg_1')).toHaveAttribute('width', /.+/)
    await expect(page.locator('#svg_2')).toHaveAttribute('href', './images/logo.svg')
    await page.locator('#svg_2').click()
  })
})
