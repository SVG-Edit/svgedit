import { test, expect } from '../fixtures.js'

test.describe('SVG common util helpers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('computes positions and deep merges objects', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { util } = window.svgHarness
      const grand = { offsetLeft: 5, offsetTop: 6, offsetParent: null }
      const parent = { offsetLeft: 10, offsetTop: 11, offsetParent: grand }
      const child = { offsetLeft: 7, offsetTop: 8, offsetParent: parent }

      const merged = util.mergeDeep(
        { a: 1, nested: { keep: true, replace: 'old' } },
        { nested: { replace: 'new', extra: 42 }, more: 'yes' }
      )

      return {
        pos: util.findPos(child),
        isObject: util.isObject({ hello: 'world' }),
        merged
      }
    })

    expect(result.pos).toEqual({ left: 22, top: 25 })
    expect(result.isObject).toBe(true)
    expect(result.merged).toEqual({
      a: 1,
      nested: { keep: true, replace: 'new', extra: 42 },
      more: 'yes'
    })
  })

  test('finds closest ancestors by selector', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { util } = window.svgHarness
      const root = document.getElementById('root')
      root.innerHTML = ''

      const wrapper = document.createElement('div')
      wrapper.className = 'wrapper'
      const section = document.createElement('section')
      section.id = 'section'
      const child = document.createElement('span')
      child.dataset.role = 'target'

      section.append(child)
      wrapper.append(section)
      root.append(wrapper)

      return {
        byClass: util.getClosest(child, '.wrapper')?.className,
        byId: util.getClosest(child, '#section')?.id,
        byData: util.getClosest(child, '[data-role=target]')?.dataset.role,
        byTag: util.getClosest(child, 'div')?.tagName.toLowerCase()
      }
    })

    expect(result.byClass).toBe('wrapper')
    expect(result.byId).toBe('section')
    expect(result.byData).toBe('target')
    expect(result.byTag).toBe('div')
  })

  test('gathers parents with and without limits', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { util } = window.svgHarness
      const root = document.getElementById('root')
      root.innerHTML = ''

      const outer = document.createElement('div')
      outer.className = 'outer'
      const mid = document.createElement('section')
      mid.id = 'mid'
      const inner = document.createElement('span')
      inner.className = 'inner'

      mid.append(inner)
      outer.append(mid)
      root.append(outer)

      return {
        all: util.getParents(inner)?.map((el) => el.tagName.toLowerCase()),
        byClass: util.getParents(inner, '.outer')?.map((el) => el.className),
        untilMid: util.getParentsUntil(inner, '#mid')?.map((el) => el.tagName.toLowerCase()),
        untilMidFiltered: util.getParentsUntil(inner, '#mid', '.inner')?.map((el) => el.tagName.toLowerCase())
      }
    })

    expect(result.all).toEqual(['span', 'section', 'div', 'div', 'body', 'html'])
    expect(result.byClass).toEqual(['outer'])
    expect(result.untilMid).toEqual(['span'])
    expect(result.untilMidFiltered).toEqual(['span'])
  })
})
