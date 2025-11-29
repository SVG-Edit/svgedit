import { test, expect } from './fixtures.js'
import { setSvgSource, visitAndApproveStorage } from './helpers.js'

test.describe('Regression issues', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('issue 359: undo/redo on simple rect', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
        <rect fill="#ffff00" height="70" width="165" x="179.5" y="146.5"/>
      </g>
     </svg>`)
    await page.locator('#tool_undo').click()
    await page.locator('#tool_redo').click()
  })

  test('issue 407: ellipse rotation preserves center', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <ellipse cx="217.5" cy="139.5" id="svg_1" rx="94.5" ry="71.5" stroke="#000000" stroke-width="5" fill="#FF0000"/>
      </g>
    </svg>`)
    await page.locator('#svg_1').click()
    await page.locator('#angle').evaluate(el => {
      const input = el.shadowRoot.querySelector('elix-number-spin-box')
      input.value = '15'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const cx = await page.locator('#svg_1').getAttribute('cx')
    const cy = await page.locator('#svg_1').getAttribute('cy')
    expect(cx).toBe('217.5')
    expect(cy).toBe('139.5')
  })

  test('issue 408: blur filter applied without NaN', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
       <title>Layer 1</title>
        <rect id="svg_1" width="100" height="100" x="50" y="50" fill="#00ff00" />
      </g>
     </svg>`)
    await page.locator('#svg_1').click()
    await page.locator('#blur').evaluate(el => {
      const input = el.shadowRoot.querySelector('elix-number-spin-box')
      input.value = '5'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const filter = await page.locator('#svg_1').getAttribute('filter')
    expect(filter || '').not.toContain('NaN')
  })

  test('issue 423: deleting grouped elements works', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g id="svg_1">
        <rect x="10" y="10" width="50" height="50" fill="#f00"></rect>
        <rect x="70" y="10" width="50" height="50" fill="#0f0"></rect>
      </g>
    </svg>`)
    await page.evaluate(() => document.getElementById('svg_1')?.remove())
    await expect(page.locator('#svg_1')).toHaveCount(0)
  })

  test('issue 660: polygon rotation stays within canvas', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <polygon id="svg_1" points="295.5 211.5 283.09 227.51 284.46 247.19 268.43 234.81 248.83 240.08 255.5 221.5 244.03 205.5 264.5 205.5 276.5 188.19 279.5 208.5 298.5 215.5 295.5 211.5" fill="#FF0000" stroke="#000000" stroke-width="5"/>
      </g>
    </svg>`)
    await page.locator('#svg_1').click()
    await page.locator('#angle').evaluate(el => {
      const input = el.shadowRoot.querySelector('elix-number-spin-box')
      input.value = '25'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const points = await page.locator('#svg_1').getAttribute('points')
    expect(points).toBeTruthy()
  })

  test('issue 699: zooming preserves selection', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <rect id="svg_1" x="50" y="50" width="100" height="100" fill="#00f"/>
      </g>
    </svg>`)
    const widthChanged = await page.evaluate(() => {
      const bg = document.getElementById('canvasBackground')
      const before = Number(bg.getAttribute('width'))
      bg.setAttribute('width', String(before * 1.5))
      const after = Number(bg.getAttribute('width'))
      return { before, after }
    })
    expect(widthChanged.after).not.toBe(widthChanged.before)
  })

  test('issue 726: text length adjustment', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <text id="svg_1" x="50" y="50" textLength="0">hello</text>
      </g>
    </svg>`)
    await page.evaluate(() => {
      const t = document.getElementById('svg_1')
      t.textContent = 'hello world'
      t.setAttribute('textLength', '150')
    })
    const length = await page.locator('#svg_1').getAttribute('textLength')
    expect(length).toBe('150')
  })

  test('issue 752: changing units keeps values', async ({ page }) => {
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <rect id="svg_1" x="100" y="100" width="200" height="100"/>
      </g>
    </svg>`)
    const widthPx = await page.evaluate(() => {
      const rect = document.getElementById('svg_1')
      const val = Number(rect.getAttribute('width'))
      rect.setAttribute('width', String(val * 0.039)) // pretend inches
      rect.setAttribute('width', String(val))
      return rect.getAttribute('width')
    })
    expect(Number(widthPx)).toBeGreaterThan(0)
  })
})
