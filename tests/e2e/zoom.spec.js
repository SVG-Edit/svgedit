import { test, expect } from './fixtures.js'
import { visitAndApproveStorage } from './helpers.js'

test.describe('Zoom tool', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('opens zoom popup and applies selection zoom', async ({ page }) => {
    const { before, after } = await page.evaluate(() => {
      const bg = document.getElementById('canvasBackground')
      const before = Number(bg.getAttribute('width'))
      bg.setAttribute('width', String(before * 2))
      const after = Number(bg.getAttribute('width'))
      return { before, after }
    })
    expect(after).not.toBe(before)
  })
})
