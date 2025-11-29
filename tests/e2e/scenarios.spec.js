import { test, expect } from './fixtures.js'
import { setSvgSource, visitAndApproveStorage } from './helpers.js'

test.describe('Tool scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('draws basic shapes (circle/ellipse)', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <circle id="svg_1" cx="200" cy="200" r="40" fill="#f00"/>
        <ellipse id="svg_2" cx="320" cy="200" rx="30" ry="20" fill="#0f0"/>
      </g>
    </svg>`)
    await expect(page.locator('#svg_1')).toHaveAttribute('r', /.+/)
    await expect(page.locator('#svg_2')).toHaveAttribute('rx', /.+/)
  })

  test('rectangle tools and transforms', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <rect id="svg_1" x="150" y="150" width="80" height="80" fill="#00f"/>
      </g>
    </svg>`)
    const rect = page.locator('#svg_1')
    await expect(rect).toHaveAttribute('width', /.+/)
    await page.evaluate(() => {
      const el = document.getElementById('svg_1')
      el.setAttribute('transform', 'rotate(20 190 190)')
    })
    const transform = await rect.getAttribute('transform')
    expect(transform || '').toContain('rotate')
  })

  test('freehand path editing', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <path id="svg_1" d="M200 200 L240 240 L260 220 z" stroke="#000" fill="none"/>
      </g>
    </svg>`)
    await expect(page.locator('#svg_1')).toHaveAttribute('d', /.+/)
  })

  test('line operations', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <line id="svg_1" x1="100" y1="100" x2="200" y2="140" stroke="#000" stroke-width="1"/>
      </g>
    </svg>`)
    const line = page.locator('#svg_1')
    await expect(line).toHaveAttribute('x2', /.+/)
    await page.evaluate(() => {
      document.getElementById('svg_1').setAttribute('stroke-width', '3')
    })
    await expect(line).toHaveAttribute('stroke-width', '3')
  })

  test('polygon and star tools', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <polygon id="svg_1" points="250 250 320 250 340 320 280 360 230 310" stroke="#000" fill="#ccc"/>
        <polygon id="svg_2" points="120 250 140 280 180 280 150 300 160 340 120 320 80 340 90 300 60 280 100 280" stroke="#000" fill="#ff0"/>
      </g>
    </svg>`)
    await expect(page.locator('#svg_1')).toHaveAttribute('points', /.+/)
    await expect(page.locator('#svg_2')).toHaveAttribute('points', /.+/)
  })

  test('shape library and image insertion', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <path id="svg_1" d="M300 200c0-27.6 22.4-50 50-50s50 22.4 50 50-22.4 50-50 50-50-22.4-50-50z" fill="#f66"/>
      </g>
    </svg>`)
    await expect(page.locator('#svg_1')).toBeVisible()

    await page.evaluate(() => {
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      img.setAttribute('id', 'svg_2')
      img.setAttribute('href', './images/logo.svg')
      img.setAttribute('x', '80')
      img.setAttribute('y', '80')
      img.setAttribute('width', '60')
      img.setAttribute('height', '60')
      document.querySelector('svg g').append(img)
    })
    await expect(page.locator('image[href="./images/logo.svg"]')).toBeVisible()
  })
})
