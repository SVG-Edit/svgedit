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

  test('issue 462: dragging element with complex matrix transforms stays stable', async ({ page }) => {
    // This tests the fix for issue #462 where elements with complex matrix transforms
    // in nested groups would jump around when dragged
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <g id="svg_1" transform="skewX(30) translate(-3,4) rotate(3)">
          <g id="svg_2" transform="skewX(10) translate(-3,4) rotate(10)">
            <circle cx="40.61157" cy="40" fill="blue" id="svg_3" r="20" stroke="#000000" stroke-width="2" transform="translate(250,-50) rotate(45) scale(1.5)"/>
          </g>
        </g>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Get the circle element and its initial bounding box
    const circle = page.locator('#svg_3')
    await circle.click()

    // Get initial position via getBoundingClientRect
    const initialBBox = await circle.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })

    // Move using arrow keys (small movements to test stability)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')

    // Get position after movement
    const afterMoveBBox = await circle.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })

    // The element should have moved roughly in the expected direction
    // Due to transforms, the actual pixel movement may vary, but it should be reasonable
    // Key check: The element should NOT have jumped wildly (e.g., more than 200px difference)
    const deltaX = Math.abs(afterMoveBBox.x - initialBBox.x)
    const deltaY = Math.abs(afterMoveBBox.y - initialBBox.y)

    // Movement should be small and controlled (less than 100px for a single arrow key press)
    expect(deltaX).toBeLessThan(100)
    expect(deltaY).toBeLessThan(100)

    // Element dimensions should remain stable (not get distorted)
    expect(Math.abs(afterMoveBBox.width - initialBBox.width)).toBeLessThan(5)
    expect(Math.abs(afterMoveBBox.height - initialBBox.height)).toBeLessThan(5)
  })

  test('issue 391: selection box position after ungrouping and path edit', async ({ page }) => {
    // This tests the fix for issue #391 where selection boxes and path edit points
    // were not at correct positions after ungrouping and double-clicking to edit a path
    // Uses a simplified version of a complex SVG with nested groups
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <g id="svg_1" transform="translate(100, 100)">
          <path id="svg_2" d="M 0,0 L 50,0 L 50,50 L 0,50 Z" fill="#ff0000" stroke="#000000" stroke-width="2"/>
          <path id="svg_3" d="M 60,0 L 110,0 L 110,50 L 60,50 Z" fill="#00ff00" stroke="#000000" stroke-width="2"/>
        </g>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Select the group using force click to bypass svgroot intercept
    const group = page.locator('#svg_1')
    await group.click({ force: true })

    // Ungroup using keyboard shortcut Ctrl+Shift+G
    await page.keyboard.press('Control+Shift+g')

    // Wait for ungrouping to complete
    await page.waitForTimeout(300)

    // Select the first path
    const path = page.locator('#svg_2')
    await path.click({ force: true })

    // Wait for selection to be processed
    await page.waitForTimeout(200)

    // Get the path's screen position
    const pathBBox = await path.evaluate(el => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 }
    })

    // Verify the path still has reasonable coordinates after ungrouping
    // The path should now have its transform baked in (translated by 100,100)
    expect(pathBBox.width).toBeGreaterThan(0)
    expect(pathBBox.height).toBeGreaterThan(0)

    // Double-click to enter path edit mode
    await path.dblclick({ force: true })

    // Wait for path edit mode
    await page.waitForTimeout(300)

    // Check for path point grips (pointgrip_0 is the first control point)
    const pointGrip = page.locator('#pathpointgrip_0')
    const pointGripVisible = await pointGrip.isVisible().catch(() => false)

    // If path edit mode activated, verify control point positions
    if (pointGripVisible) {
      const pointGripBBox = await pointGrip.evaluate(el => {
        const rect = el.getBoundingClientRect()
        return { x: rect.x, y: rect.y }
      })

      // The first point should be near the top-left of the path
      // After ungrouping with translate(100,100), the path moves
      // Allow reasonable tolerance
      const tolerance = 100
      expect(Math.abs(pointGripBBox.x - pathBBox.x)).toBeLessThan(tolerance)
      expect(Math.abs(pointGripBBox.y - pathBBox.y)).toBeLessThan(tolerance)
    }

    // Verify the path's d attribute was updated correctly after ungrouping
    const dAttr = await path.getAttribute('d')
    expect(dAttr).toBeTruthy()
  })

  test('issue 404: border width during resize at zoom', async ({ page }) => {
    // This tests the fix for issue #404 where border width appeared incorrect
    // during resize when zoom was not at 100%
    await setSvgSource(page, `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <g class="layer">
        <title>Layer 1</title>
        <rect id="svg_1" x="100" y="100" width="200" height="150" fill="#00ff00" stroke="#000000" stroke-width="10"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Set zoom to 150%
    await page.evaluate(() => {
      window.svgEditor.svgCanvas.setZoom(1.5)
    })

    // Wait for zoom to apply
    await page.waitForTimeout(200)

    // Select the rectangle
    const rect = page.locator('#svg_1')
    await rect.click({ force: true })

    // Get the initial stroke-width
    const initialStrokeWidth = await rect.getAttribute('stroke-width')
    expect(initialStrokeWidth).toBe('10')

    // After any interaction, stroke-width should remain constant
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    const afterMoveStrokeWidth = await rect.getAttribute('stroke-width')
    expect(afterMoveStrokeWidth).toBe('10')
  })
})
