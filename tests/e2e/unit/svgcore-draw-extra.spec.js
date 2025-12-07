import { test, expect } from '../fixtures.js'

test.describe('SVG core draw extras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness?.draw))
  })

  test('Drawing merges layers and moves children upward', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { draw } = window.svgHarness
      const NS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(NS, 'svg')
      document.body.append(svg)
      const drawing = new draw.Drawing(svg, 'id_')
      drawing.identifyLayers()
      const hrLog = []
      const hrService = {
        startBatchCommand: (name) => hrLog.push('start:' + name),
        endBatchCommand: () => hrLog.push('end'),
        removeElement: (el) => hrLog.push('remove:' + el.tagName),
        moveElement: (el) => hrLog.push('move:' + el.tagName),
        insertElement: (el) => hrLog.push('insert:' + el.tagName)
      }

      const baseLayer = drawing.getCurrentLayer()
      const rect = document.createElementNS(NS, 'rect')
      baseLayer.append(rect)

      drawing.createLayer('Layer 2', hrService)
      const layer2 = drawing.getCurrentLayer()
      const circle = document.createElementNS(NS, 'circle')
      layer2.append(circle)

      drawing.mergeLayer(hrService)

      return {
        mergedShapes: baseLayer.querySelectorAll('rect,circle').length,
        layersAfterMerge: drawing.getNumLayers(),
        currentName: drawing.getCurrentLayerName(),
        log: hrLog
      }
    })

    expect(result.layersAfterMerge).toBe(1)
    expect(result.mergedShapes).toBe(2)
    expect(result.currentName).toContain('Layer')
    expect(result.log.some(entry => entry.startsWith('start:Merge Layer'))).toBe(true)
    expect(result.log.some(entry => entry.startsWith('move:circle'))).toBe(true)
  })

  test('mergeAllLayers collapses multiple layers into one', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { draw } = window.svgHarness
      const NS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(NS, 'svg')
      document.body.append(svg)
      const drawing = new draw.Drawing(svg, 'id_')
      drawing.identifyLayers()
      const hrLog = []
      const hrService = {
        startBatchCommand: (name) => hrLog.push('start:' + name),
        endBatchCommand: () => hrLog.push('end'),
        removeElement: () => {},
        moveElement: () => {},
        insertElement: () => {}
      }

      // Make three layers with a child each
      const baseLayer = drawing.getCurrentLayer()
      baseLayer.append(document.createElementNS(NS, 'rect'))
      drawing.createLayer('Layer 2', hrService)
      drawing.getCurrentLayer().append(document.createElementNS(NS, 'circle'))
      drawing.createLayer('Layer 3', hrService)
      drawing.getCurrentLayer().append(document.createElementNS(NS, 'line'))

      drawing.mergeAllLayers(hrService)

      const remaining = drawing.getCurrentLayer()
      return {
        finalLayers: drawing.getNumLayers(),
        shapes: remaining.querySelectorAll('rect,circle,line').length,
        log: hrLog
      }
    })

    expect(result.finalLayers).toBe(1)
    expect(result.shapes).toBe(3)
    expect(result.log.some(entry => entry === 'start:Merge all Layers')).toBe(true)
    expect(result.log.at(-1)).toBe('end')
  })
})
