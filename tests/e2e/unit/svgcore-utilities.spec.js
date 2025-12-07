import { test, expect } from '../fixtures.js'

test.describe('SVG core utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('units.convertAttrs appends base unit', async ({ page }) => {
    const attrs = await page.evaluate(() => {
      const { units } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '10')
      rect.setAttribute('y', '20')
      rect.setAttribute('width', '30')
      rect.setAttribute('height', '40')
      svg.append(rect)
      units.init({
        getRoundDigits: () => 2,
        getBaseUnit: () => 'cm'
      })
      units.convertAttrs(rect)
      return {
        x: rect.getAttribute('x'),
        y: rect.getAttribute('y'),
        width: rect.getAttribute('width'),
        height: rect.getAttribute('height')
      }
    })
    expect(attrs.x?.endsWith('cm')).toBe(true)
    expect(attrs.y?.endsWith('cm')).toBe(true)
    expect(attrs.width?.endsWith('cm')).toBe(true)
    expect(attrs.height?.endsWith('cm')).toBe(true)
  })

  test('utilities.getStrokedBBox returns finite numbers', async ({ page }) => {
    const bbox = await page.evaluate(() => {
      const { utilities, units } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '200')
      svg.setAttribute('height', '200')
      document.body.append(svg)
      units.init({
        getRoundDigits: () => 2,
        getBaseUnit: () => 'px'
      })
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '10')
      rect.setAttribute('y', '20')
      rect.setAttribute('width', '30')
      rect.setAttribute('height', '40')
      rect.setAttribute('stroke', '#000')
      rect.setAttribute('stroke-width', '10')
      svg.append(rect)
      const addSvg = (json) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', json.element)
        Object.entries(json.attr).forEach(([k, v]) => el.setAttribute(k, v))
        svg.append(el)
        return el
      }
      const res = utilities.getStrokedBBox([rect], addSvg, { resetOrientation: () => {} })
      return { x: res.x, y: res.y, width: res.width, height: res.height }
    })
    expect(Number.isFinite(bbox.x)).toBe(true)
    expect(Number.isFinite(bbox.y)).toBe(true)
    expect(Number.isFinite(bbox.width)).toBe(true)
    expect(Number.isFinite(bbox.height)).toBe(true)
  })

  test('utilities XML and base64 helpers escape and roundtrip correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      return {
        escaped: utilities.toXml("PB&J '\"<>"),
        encoded: utilities.encode64('abcdef'),
        decoded: utilities.decode64('MTIzNDU='),
        xmlRefs: utilities.convertToXMLReferences('ABC')
      }
    })
    expect(result.escaped).toBe('PB&amp;J &#x27;&quot;&lt;&gt;')
    expect(result.encoded).toBe('YWJjZGVm')
    expect(result.decoded).toBe('12345')
    expect(result.xmlRefs).toBe('ABC')
  })

  test('utilities.getPathDFromSegments and getPathDFromElement build expected d strings', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.append(svg)
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '1')
      rect.setAttribute('width', '5')
      rect.setAttribute('height', '10')
      svg.append(rect)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '0')
      line.setAttribute('y1', '1')
      line.setAttribute('x2', '5')
      line.setAttribute('y2', '6')
      svg.append(line)
      const dSegments = utilities.getPathDFromSegments([
        ['M', [1, 2]],
        ['Z', []]
      ])
      return {
        segments: dSegments.trim(),
        rect: utilities.getPathDFromElement(rect),
        line: utilities.getPathDFromElement(line)
      }
    })
    expect(result.segments).toBe('M1,2 Z')
    expect(result.rect).toBe('M0,1 L5,1 L5,11 L0,11 L0,1 Z')
    expect(result.line).toBe('M0,1L5,6')
  })

  test('utilities.getBBoxOfElementAsPath mirrors element geometry', async ({ page }) => {
    const bbox = await page.evaluate(() => {
      const { utilities } = window.svgHarness
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      document.body.append(svg)
      const create = (tag, attrs) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
        return el
      }
      const addSvg = (json) => {
        const el = create(json.element, json.attr)
        svg.append(el)
        return el
      }
      const pathActions = { resetOrientation: () => {} }
      const path = create('path', { id: 'p', d: 'M0,1 Z' })
      const rect = create('rect', { id: 'r', x: '0', y: '1', width: '5', height: '10' })
      const line = create('line', { id: 'l', x1: '0', y1: '1', x2: '5', y2: '6' })
      svg.append(path, rect, line)
      return {
        path: utilities.bboxToObj(utilities.getBBoxOfElementAsPath(path, addSvg, pathActions)),
        rect: utilities.bboxToObj(utilities.getBBoxOfElementAsPath(rect, addSvg, pathActions)),
        line: utilities.bboxToObj(utilities.getBBoxOfElementAsPath(line, addSvg, pathActions))
      }
    })
    expect(bbox.path).toEqual({ x: 0, y: 1, width: 0, height: 0 })
    expect(bbox.rect).toEqual({ x: 0, y: 1, width: 5, height: 10 })
    expect(bbox.line).toEqual({ x: 0, y: 1, width: 5, height: 5 })
  })
})
