import { test, expect } from './fixtures.js'

test.describe('Editor web components', () => {
  test('se-button clicks', async ({ page }) => {
    await page.goto('/index.html')
    await page.exposeFunction('onSeButton', () => {})
    await page.evaluate(() => {
      const el = document.createElement('se-button')
      el.id = 'playwright-se-button'
      el.style.display = 'inline-block'
      el.addEventListener('click', window.onSeButton)
      document.body.append(el)
    })
    const button = page.locator('#playwright-se-button')
    await expect(button).toHaveCount(1)
    await button.click()
  })

  test('se-flying-button clicks', async ({ page }) => {
    await page.goto('/index.html')
    await page.exposeFunction('onSeFlying', () => {})
    await page.evaluate(() => {
      const el = document.createElement('se-flying-button')
      el.id = 'playwright-se-flying'
      el.style.display = 'inline-block'
      el.addEventListener('click', window.onSeFlying)
      document.body.append(el)
    })
    const button = page.locator('#playwright-se-flying')
    await expect(button).toHaveCount(1)
    await button.evaluate(el => el.click())
  })

  test('se-explorer-button clicks', async ({ page }) => {
    await page.goto('/index.html')
    await page.exposeFunction('onSeExplorer', () => {})
    await page.evaluate(() => {
      const el = document.createElement('se-explorer-button')
      el.id = 'playwright-se-explorer'
      el.style.display = 'inline-block'
      el.addEventListener('click', window.onSeExplorer)
      document.body.append(el)
    })
    const button = page.locator('#playwright-se-explorer')
    await expect(button).toHaveCount(1)
    await button.evaluate(el => el.click())
  })
})
