import { test, expect } from '../fixtures.js'

test.describe('SVG core modules in browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('units.convertUnit returns finite and px passthrough', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { units } = window.svgHarness
      units.init({
        getRoundDigits: () => 2,
        getBaseUnit: () => 'px'
      })
      return {
        defaultConv: units.convertUnit(42),
        pxConv: units.convertUnit(42, 'px')
      }
    })
    expect(result.defaultConv).toBeGreaterThan(0)
    expect(result.defaultConv).not.toBe(Infinity)
    expect(result.pxConv).toBe(42)
  })

  test('units.shortFloat and isValidUnit mirror legacy behavior', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { units } = window.svgHarness
      document.body.innerHTML = ''
      const unique = document.createElement('div')
      unique.id = 'uniqueId'
      const other = document.createElement('div')
      other.id = 'otherId'
      document.body.append(unique, other)
      units.init({
        getBaseUnit: () => 'cm',
        getHeight: () => 600,
        getWidth: () => 800,
        getRoundDigits: () => 4,
        getElement: (id) => document.getElementById(id)
      })
      return {
        shortFloat: [
          units.shortFloat(0.00000001),
          units.shortFloat(1),
          units.shortFloat(3.45678),
          units.shortFloat(1.23443),
          units.shortFloat(1.23455)
        ],
        validUnits: [
          '0',
          '1',
          '1.1',
          '-1.1',
          '.6mm',
          '-.6cm',
          '6000in',
          '6px',
          '6.3pc',
          '-0.4em',
          '-0.ex',
          '40.123%'
        ].map((val) => units.isValidUnit(val)),
        idChecks: {
          okExisting: units.isValidUnit('id', 'uniqueId', unique),
          okNew: units.isValidUnit('id', 'newId', unique),
          dupNoElem: units.isValidUnit('id', 'uniqueId'),
          dupOther: units.isValidUnit('id', 'uniqueId', other)
        }
      }
    })
    expect(result.shortFloat).toEqual([0, 1, 3.4568, 1.2344, 1.2346])
    result.validUnits.forEach((isValid) => expect(isValid).toBe(true))
    expect(result.idChecks.okExisting).toBe(true)
    expect(result.idChecks.okNew).toBe(true)
    expect(result.idChecks.dupNoElem).toBe(false)
    expect(result.idChecks.dupOther).toBe(false)
  })

  test('utilities.getPathDFromElement on rect', async ({ page }) => {
    const pathD = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '1')
      rect.setAttribute('width', '5')
      rect.setAttribute('height', '10')
      svg.append(rect)
      return utilities.getPathDFromElement(rect)
    })
    expect(pathD?.startsWith('M')).toBe(true)
  })

  test('utilities.getBBoxOfElementAsPath returns numbers', async ({ page }) => {
    const bbox = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '1')
      rect.setAttribute('width', '2')
      rect.setAttribute('height', '2')
      svg.append(rect)
      // Minimal mocks for addSVGElementsFromJson and pathActions.resetOrientation
      const addSvg = (json) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', json.element)
        Object.entries(json.attr).forEach(([k, v]) => el.setAttribute(k, v))
        svg.append(el)
        return el
      }
      const pathActions = { resetOrientation: () => {} }
      const res = utilities.getBBoxOfElementAsPath(rect, addSvg, pathActions)
      return { x: res.x, y: res.y, width: res.width, height: res.height }
    })
    expect(Number.isFinite(bbox.x)).toBe(true)
    expect(Number.isFinite(bbox.y)).toBe(true)
    expect(Number.isFinite(bbox.width)).toBe(true)
    expect(Number.isFinite(bbox.height)).toBe(true)
  })

  test('path.convertPath converts absolute to relative', async ({ page }) => {
    const dRel = await page.evaluate(() => {
      const { pathModule, units } = window.svgHarness
      units.init({
        getRoundDigits: () => 2,
        getBaseUnit: () => 'px'
      })
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M0 0 L10 0 L10 10 Z')
      svg.append(path)
      pathModule.convertPath(path, true)
      return path.getAttribute('d')
    })
    expect(dRel?.length > 0).toBe(true)
    expect(dRel.toLowerCase()).toContain('z')
  })

  test('path.convertPath normalizes relative and absolute commands', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { pathModule, units } = window.svgHarness
      units.init({
        getRoundDigits: () => 5,
        getBaseUnit: () => 'px'
      })
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'm40,55h20v20')
      svg.append(path)
      const abs = pathModule.convertPath(path)
      const rel = pathModule.convertPath(path, true)
      return { abs, rel }
    })
    expect(result.abs).toBe('M40,55L60,55L60,75')
    expect(result.rel).toBe('m40,55l20,0l0,20')
  })
})
