import { test, expect } from './fixtures.js'
import { openMainMenu, visitAndApproveStorage } from './helpers.js'

test.describe('Export', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
  })

  test('export button visible in menu', async ({ page }) => {
    await openMainMenu(page)
    await expect(page.locator('#tool_export')).toBeVisible()
  })

  test('export dialog opens', async ({ page }) => {
    await openMainMenu(page)
    await page.locator('#tool_export').click()
    // Scope to the export dialog to avoid the storage dialog select (#se-storage-pref) that may also be present.
    await expect(page.locator('#export_box select')).toBeVisible()
  })
})
