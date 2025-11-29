import { expect } from '@playwright/test'

export async function visitAndApproveStorage (page) {
  await page.goto('about:blank')
  await page.context().clearCookies()
  await page.goto('/index.html')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  const storageOk = page.locator('#storage_ok')
  if (await storageOk.count()) {
    await storageOk.click()
  } else {
    await page.waitForSelector('#svgroot', { timeout: 20000 })
  }
  await selectEnglishAndSnap(page)
}

export async function selectEnglishAndSnap (page) {
  await page.waitForFunction(() => window.svgEditor && window.svgEditor.setConfig, null, { timeout: 20000 })
  await page.evaluate(() => {
    window.svgEditor.setConfig({
      lang: 'en',
      gridSnapping: true
    })
  })
}

export async function openMainMenu (page) {
  await page.locator('#main_button').click()
}

export async function setSvgSource (page, svgMarkup) {
  await page.locator('#tool_source').click()
  const textarea = page.locator('#svg_source_textarea')
  await expect(textarea).toBeVisible()
  await textarea.fill(svgMarkup)
  await page.locator('#tool_source_save').click()
}

export async function clickCanvas (page, point) {
  const canvas = page.locator('#svgroot')
  const box = await canvas.boundingBox()
  if (!box) {
    throw new Error('Could not determine canvas bounds')
  }
  await page.mouse.click(box.x + point.x, box.y + point.y)
}

export async function dragOnCanvas (page, start, end) {
  const canvas = page.locator('#svgroot')
  const box = await canvas.boundingBox()
  if (!box) {
    throw new Error('Could not determine canvas bounds')
  }
  const startX = box.x + start.x
  const startY = box.y + start.y
  const endX = box.x + end.x
  const endY = box.y + end.y

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(endX, endY)
  await page.mouse.up()
}
