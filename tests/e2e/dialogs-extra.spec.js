import { test, expect } from './fixtures.js'

test.describe('Dialog helpers', () => {
  test('se-prompt-dialog toggles title and close', async ({ page }) => {
    await page.goto('/index.html')
    await page.waitForFunction(() => Boolean(customElements.get('se-prompt-dialog')))

    const result = await page.evaluate(() => {
      const prompt = document.createElement('se-prompt-dialog')
      document.body.append(prompt)
      prompt.title = 'Hello'
      prompt.close = true
      prompt.close = false

      return {
        title: prompt.title,
        hasCloseAttr: prompt.hasAttribute('close')
      }
    })

    expect(result.title).toBe('Hello')
    expect(result.hasCloseAttr).toBe(false)
  })

  test('seAlert creates alert dialog', async ({ page }) => {
    await page.goto('/index.html')
    await page.waitForFunction(() => typeof window.seAlert === 'function')

    const created = await page.evaluate(() => {
      const before = document.querySelectorAll('se-elix-alert-dialog').length
      window.seAlert('Cover alert dialog')
      const after = document.querySelectorAll('se-elix-alert-dialog').length
      return after > before
    })

    expect(created).toBe(true)
  })
})
