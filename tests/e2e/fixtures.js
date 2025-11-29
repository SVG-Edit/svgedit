import { test as base, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Playwright fixture that captures Istanbul coverage from instrumented builds.
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page)
    const coverage = await page.evaluate(() => globalThis.__coverage__ || null)
    if (!coverage) return

    const nycDir = path.join(process.cwd(), '.nyc_output')
    fs.mkdirSync(nycDir, { recursive: true })
    const slug = testInfo.title.replace(/[^\w-]+/g, '_')
    const file = path.join(nycDir, `playwright-${slug}.json`)
    fs.writeFileSync(file, JSON.stringify(coverage))
  }
})

export { expect }
