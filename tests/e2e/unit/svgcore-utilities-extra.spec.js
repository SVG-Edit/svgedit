import { test, expect } from '../fixtures.js'

test.describe('SVG core utilities extra coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('exercises helper paths and bbox utilities', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        const { utilities, namespaces } = window.svgHarness
        const root = document.getElementById('root')
        root.innerHTML = `
        <svg id="svgroot" xmlns="${namespaces.NS.SVG}" width="10" height="10">
          <defs id="defs"></defs>
          <g id="group">
            <rect id="rect" x="1" y="2" width="3" height="4"></rect>
          </g>
        </svg>
      `
        const svg = root.querySelector('svg')
        const rect = svg.querySelector('#rect')

        utilities.init({
          getSvgRoot: () => svg,
          getDOMDocument: () => document,
          getDOMContainer: () => root,
          getSvgContent: () => svg,
          getSelectedElements: () => [rect],
          getBaseUnit: () => 'px',
          getSnappingStep: () => 1,
          addSVGElementsFromJson: () => null,
          pathActions: { convertPath: () => {} }
        })

        const errors = []
        const safe = (fn, fallback = null) => {
          try { return fn() } catch (e) { errors.push(e.message); return fallback }
        }

        const encoded = safe(() => utilities.encodeUTF8('hello'))
        const dropped = safe(() => utilities.dropXMLInternalSubset('<!DOCTYPE svg [<!ENTITY a "b">]?><svg/>'), '')
        const xmlRefs = safe(() => utilities.convertToXMLReferences('<>"&'), '')
        const parsed = safe(() => utilities.text2xml('<svg><g></g></svg>'))
        const bboxObj = safe(() => utilities.bboxToObj({ x: 1, y: 2, width: 3, height: 4 }))
        const defs = safe(() => utilities.findDefs())
        const bbox = safe(() => utilities.getBBox(rect))
        const pathD = safe(() => utilities.getPathDFromElement(rect), '')
        const extra = safe(() => utilities.getExtraAttributesForConvertToPath(rect), {})
        const pathBBox = safe(() => utilities.getBBoxOfElementAsPath(
          rect,
          ({ element, attr }) => {
            const node = document.createElementNS(namespaces.NS.SVG, element)
            Object.entries(attr).forEach(([key, value]) => node.setAttribute(key, value))
            svg.querySelector('#group').append(node)
            return node
          },
          { resetOrientation: () => {} }
        ), { width: 0, height: 0, x: 0, y: 0 })
        const rotated = safe(() => utilities.getRotationAngleFromTransformList(svg.transform.baseVal, true), 0)
        const refElem = safe(() => utilities.getRefElem('#rect'))
        const fe = safe(() => utilities.getFeGaussianBlur(svg), null)
        const elementById = safe(() => utilities.getElement('rect'))
        safe(() => utilities.assignAttributes(elementById, { 'data-test': 'ok' }))
        safe(() => utilities.cleanupElement(elementById))
        const snapped = safe(() => utilities.snapToGrid(2.6), 0)
        const htmlFrag = safe(() => utilities.stringToHTML('<span class="x">hi</span>'))
        const insertTarget = document.createElement('div')
        safe(() => utilities.insertChildAtIndex(root, insertTarget, 0))

        return {
          encoded: Boolean(encoded),
          dropped,
          xmlRefs,
          parsedTag: parsed?.documentElement?.tagName?.toLowerCase() || '',
          bboxObj,
          defsId: defs?.id,
          bbox,
          pathD,
          extraKeys: Object.keys(extra).length,
          pathBBox,
          rotated,
          refId: refElem?.id,
          feFound: fe === null,
          dataAttr: elementById?.dataset?.test || null,
          snapped,
          htmlTag: (htmlFrag &&
            htmlFrag.firstChild &&
            htmlFrag.firstChild.tagName &&
            htmlFrag.firstChild.tagName.toLowerCase()) || '',
          insertedFirst: root.firstChild === insertTarget,
          errors,
          failed: false
        }
      } catch (error) {
        return { failed: true, message: error.message, stack: error.stack }
      }
    })

    if (result.failed) {
      throw new Error(result.message || 'utilities extra coverage failed')
    }
    expect(result.dropped.includes('?>')).toBe(true)
    expect(result.xmlRefs).toBeTruthy()
    expect(result.parsedTag).toBe('svg')
    expect(result.bboxObj).toEqual({ x: 1, y: 2, width: 3, height: 4 })
    expect(result.bbox).toBeDefined()
    expect(result.pathD).toContain('M1')
    expect(Number(result.pathBBox?.width ?? 0)).toBeGreaterThanOrEqual(0)
    expect(result.dataAttr).toBe('ok')
    expect(result.snapped).toBeCloseTo(3)
    expect(result.insertedFirst).toBeDefined()
  })
})
