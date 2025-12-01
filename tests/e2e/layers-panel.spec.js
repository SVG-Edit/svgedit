import { test, expect } from './fixtures.js'

const layerNames = async (page) => {
  return page.$$eval('#layerlist tbody tr.layer td.layername', (nodes) =>
    nodes.map((n) => n.textContent.trim())
  )
}

const toggleVisibilityFor = async (page, name) => {
  const row = page.locator('#layerlist tbody tr.layer', {
    has: page.locator('td.layername', { hasText: name })
  })
  await row.locator('td.layervis').click()
}

test.describe('Layers panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html')
    await page.evaluate(() => {
      const dlg = document.getElementById('se-storage-dialog')
      if (dlg) dlg.remove()
    })
    const panelHandle = page.locator('div#sidepanel_handle').first()
    await panelHandle.waitFor({ state: 'visible' })
    await panelHandle.click()
    await page.waitForSelector('#layer_new', { state: 'visible' })
  })

  test('creates, renames, toggles and deletes layers', async ({ page }) => {
    const initialNames = await layerNames(page)
    expect(initialNames.length).toBeGreaterThan(0)

    page.once('dialog', (dialog) => dialog.accept('Layer 2'))
    await page.click('#layer_new')
    await expect.poll(() => layerNames(page)).resolves.toContain('Layer 2')

    await page.locator('#layerlist td.layername', { hasText: 'Layer 2' }).click()
    page.once('dialog', (dialog) => dialog.accept('Renamed Layer'))
    await page.click('#layer_rename')
    await expect.poll(() => layerNames(page)).resolves.toContain('Renamed Layer')

    await toggleVisibilityFor(page, 'Renamed Layer')
    const visibilityClass = await page.$eval(
      '#layerlist tbody tr.layer td.layername:has-text("Renamed Layer")',
      (node) => node.parentElement?.querySelector('td.layervis')?.className || ''
    )
    expect(visibilityClass).toContain('layerinvis')

    const panelHandle = page.locator('div#sidepanel_handle').first()
    await panelHandle.click()
    await panelHandle.click()

    await page.locator('#layerlist td.layername', { hasText: 'Renamed Layer' }).click()
    await page.click('#layer_delete')
    await expect.poll(() => layerNames(page)).resolves.not.toContain('Renamed Layer')
  })
})
