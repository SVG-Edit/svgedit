import { test, expect } from './fixtures.js'
import { setSvgSource, visitAndApproveStorage } from './helpers.js'

test.describe('Group transform preservation', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('preserve group translate transform on click, move, and rotate', async ({ page }) => {
    // Load SVG with group containing translate transform
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1290 810">
      <g transform="translate(91.56,99.67)">
        <path 
          transform="matrix(0,-1,-1,0,30.1,68.3)" 
          d="M 58.3,0 C 58.3,0 57.8,30.2 29.1,30.2 0.3,30.2 0,0 0,0 Z" 
          fill="none" 
          stroke="#000000" 
          stroke-width="1"
        />
        <path 
          transform="rotate(-90,167.15,-98.85)" 
          d="M 58.3,0 C 58.3,0 57.8,30.2 29.1,30.2 0.3,30.2 0,0 0,0 Z" 
          fill="none" 
          stroke="#000000" 
          stroke-width="1"
        />
        <path 
          transform="rotate(-90,49.3,19)" 
          d="M 0,0 H 58.3 V 235.7 H 0 Z" 
          fill="none" 
          stroke="#000000" 
          stroke-width="1"
        />
      </g>
    </svg>`)

    // Wait for SVG to be loaded
    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Click on one of the paths inside the group
    // This should select the parent group
    const firstPath = page.locator('#svg_2')
    await firstPath.click()

    // Verify the group was selected (not the individual path)
    const selectedGroup = page.locator('#svg_1')
    await expect(selectedGroup).toBeVisible()

    // Test 1: Verify group transform is preserved after click
    let groupTransform = await selectedGroup.getAttribute('transform')
    expect(groupTransform).toContain('translate(91.56')
    expect(groupTransform).toContain('99.67')

    // Test 2: Move 100 pixels to the left using arrow keys
    // Press Left arrow 10 times (each press moves 10 pixels with grid snapping)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft')
    }

    // Verify group transform still contains the original translate
    groupTransform = await selectedGroup.getAttribute('transform')
    expect(groupTransform).toContain('translate(91.56')
    expect(groupTransform).toContain('99.67')
    // And now also has a translate for the movement
    expect(groupTransform).toMatch(/translate\([^)]+\).*translate\([^)]+\)/)

    // Test 3: Rotate the group
    await page.locator('#angle').evaluate(el => {
      const input = el.shadowRoot.querySelector('elix-number-spin-box')
      input.value = '5'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Verify group transform has both rotate and original translate
    groupTransform = await selectedGroup.getAttribute('transform')
    expect(groupTransform).toContain('rotate(5')
    expect(groupTransform).toContain('translate(91.56')
    expect(groupTransform).toContain('99.67')

    // Verify child paths still have their own transforms
    const path1Transform = await page.locator('#svg_2').getAttribute('transform')
    const path2Transform = await page.locator('#svg_3').getAttribute('transform')
    const path3Transform = await page.locator('#svg_4').getAttribute('transform')

    expect(path1Transform).toContain('matrix')
    expect(path2Transform).toContain('rotate(-90')
    expect(path3Transform).toContain('rotate(-90')
  })

  test('multiple arrow key movements preserve group transform', async ({ page }) => {
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <g id="testGroup" transform="translate(100,100)">
        <rect id="testRect" x="0" y="0" width="50" height="50" fill="red"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Select the group by clicking the rect
    await page.locator('#testRect').click()

    // Move right 5 times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight')
    }

    // Move down 3 times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown')
    }

    // Verify original transform is still there
    const groupTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(groupTransform).toContain('translate(100')
    expect(groupTransform).toContain('100)')
  })

  test('rotation followed by movement preserves both transforms', async ({ page }) => {
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <g id="testGroup" transform="translate(200,150)">
        <circle id="testCircle" cx="25" cy="25" r="20" fill="blue"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Select the group
    await page.locator('#testCircle').click()

    // Rotate first
    await page.locator('#angle').evaluate(el => {
      const input = el.shadowRoot.querySelector('elix-number-spin-box')
      input.value = '45'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Then move
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')

    // Verify both rotate and translate are present
    const groupTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(groupTransform).toContain('rotate(45')
    expect(groupTransform).toContain('translate(200')
    expect(groupTransform).toContain('150)')
  })

  test('multiple movements preserve group structure without flattening', async ({ page }) => {
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <g id="testGroup" transform="translate(100,100)">
        <rect id="testRect" x="0" y="0" width="50" height="50" fill="green"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Click to select the group
    const rect = page.locator('#testRect')
    await rect.click()

    // Store original transform
    const originalTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(originalTransform).toContain('translate(100')

    // First movement: move right and down using keyboard
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight')
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown')
    }

    // Verify group still has transform attribute (not flattened to children)
    let groupTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(groupTransform).toContain('translate')
    // Verify original transform is preserved
    expect(groupTransform).toContain('100')

    // Most importantly: verify child has no transform (not flattened)
    let rectTransform = await rect.getAttribute('transform')
    expect(rectTransform).toBeNull()

    // Second movement: move left and up
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowLeft')
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp')
    }

    // Verify group still has transform
    groupTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(groupTransform).toContain('translate')

    // Critical: child should STILL have no transform
    rectTransform = await rect.getAttribute('transform')
    expect(rectTransform).toBeNull()

    // Third movement: ensure consistency
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowRight')
    }

    // Final verification: group has transforms, child does not
    groupTransform = await page.locator('#testGroup').getAttribute('transform')
    expect(groupTransform).toContain('translate')
    rectTransform = await rect.getAttribute('transform')
    expect(rectTransform).toBeNull()
  })

  test('ungroup preserves element positions without jumping', async ({ page }) => {
    // Test the real bug case: group with translate containing paths with complex transforms
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <g id="testGroup" transform="translate(100,50)">
        <path id="path1" transform="matrix(0,-1,-1,0,30,60)" d="M 10,0 L 30,0 L 30,40 L 10,40 Z" fill="blue"/>
        <path id="path2" transform="rotate(-90,80,-50)" d="M 10,0 L 30,0 L 30,40 L 10,40 Z" fill="red"/>
        <path id="path3" transform="rotate(-90,30,10)" d="M 0,0 H 50 V 200 H 0 Z" fill="green"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Get initial bounding boxes before ungrouping
    const path1Box = await page.locator('#path1').boundingBox()
    const path2Box = await page.locator('#path2').boundingBox()
    const path3Box = await page.locator('#path3').boundingBox()

    // Click to select the group
    await page.locator('#testGroup').click()

    // Ungroup via keyboard shortcut or UI
    await page.keyboard.press('Control+Shift+G')

    // Wait for ungroup to complete
    await page.waitForTimeout(100)

    // Verify paths still exist and have transforms
    const path1Transform = await page.locator('#path1').getAttribute('transform')
    const path2Transform = await page.locator('#path2').getAttribute('transform')
    const path3Transform = await page.locator('#path3').getAttribute('transform')

    // All paths should have transforms (group's translate prepended to original)
    expect(path1Transform).toBeTruthy()
    expect(path2Transform).toBeTruthy()
    expect(path3Transform).toBeTruthy()

    // Critical: bounding boxes should not change (no visual jump)
    const path1BoxAfter = await page.locator('#path1').boundingBox()
    const path2BoxAfter = await page.locator('#path2').boundingBox()
    const path3BoxAfter = await page.locator('#path3').boundingBox()

    // Allow 1px tolerance for rounding
    expect(Math.abs(path1BoxAfter.x - path1Box.x)).toBeLessThan(2)
    expect(Math.abs(path1BoxAfter.y - path1Box.y)).toBeLessThan(2)
    expect(Math.abs(path2BoxAfter.x - path2Box.x)).toBeLessThan(2)
    expect(Math.abs(path2BoxAfter.y - path2Box.y)).toBeLessThan(2)
    expect(Math.abs(path3BoxAfter.x - path3Box.x)).toBeLessThan(2)
    expect(Math.abs(path3BoxAfter.y - path3Box.y)).toBeLessThan(2)
  })

  test('drag after ungroup works correctly without jumps', async ({ page }) => {
    await setSvgSource(page, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <g id="testGroup" transform="translate(100,100)">
        <rect id="rect1" x="0" y="0" width="50" height="50" fill="red"/>
        <rect id="rect2" x="60" y="0" width="50" height="50" fill="blue"/>
        <rect id="rect3" x="120" y="0" width="50" height="50" fill="green"/>
      </g>
    </svg>`)

    await page.waitForSelector('#svgroot', { timeout: 5000 })

    // Select the group by clicking one of its children
    await page.locator('#rect1').click()

    // Ungroup
    await page.keyboard.press('Control+Shift+G')
    await page.waitForTimeout(100)

    // All elements should still be selected after ungroup
    // Get their positions before drag
    const rect1Before = await page.locator('#rect1').boundingBox()
    const rect2Before = await page.locator('#rect2').boundingBox()
    const rect3Before = await page.locator('#rect3').boundingBox()

    // Drag all selected elements using arrow keys
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight')
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown')
    }

    // Get positions after drag
    const rect1After = await page.locator('#rect1').boundingBox()
    const rect2After = await page.locator('#rect2').boundingBox()
    const rect3After = await page.locator('#rect3').boundingBox()

    // All elements should have moved by approximately the same amount
    const rect1Delta = { x: rect1After.x - rect1Before.x, y: rect1After.y - rect1Before.y }
    const rect2Delta = { x: rect2After.x - rect2Before.x, y: rect2After.y - rect2Before.y }
    const rect3Delta = { x: rect3After.x - rect3Before.x, y: rect3After.y - rect3Before.y }

    // All should have moved approximately 50px right and 50px down (with grid snapping)
    expect(rect1Delta.x).toBeGreaterThan(40)
    expect(rect1Delta.y).toBeGreaterThan(40)

    // Deltas should be similar for all elements (moved together)
    expect(Math.abs(rect1Delta.x - rect2Delta.x)).toBeLessThan(5)
    expect(Math.abs(rect1Delta.y - rect2Delta.y)).toBeLessThan(5)
    expect(Math.abs(rect1Delta.x - rect3Delta.x)).toBeLessThan(5)
    expect(Math.abs(rect1Delta.y - rect3Delta.y)).toBeLessThan(5)

    // Verify transforms are consolidated (not accumulating)
    const rect1Transform = await page.locator('#rect1').getAttribute('transform')

    // Should have single consolidated transforms, not multiple stacked
    // Transform can be null (no transform) or contain at most one translate
    if (rect1Transform) {
      expect((rect1Transform.match(/translate/g) || []).length).toBeLessThanOrEqual(1)
    }
  })
})
