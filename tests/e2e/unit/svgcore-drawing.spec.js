import { test, expect } from '../fixtures.js'

test.describe('SVG core drawing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('manages ids and adopts orphaned elements into layers', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { draw, namespaces } = window.svgHarness
      const svg = document.createElementNS(namespaces.NS.SVG, 'svg')
      document.getElementById('root').append(svg)

      const existingLayer = document.createElementNS(namespaces.NS.SVG, 'g')
      existingLayer.classList.add('layer')
      const title = document.createElementNS(namespaces.NS.SVG, 'title')
      title.textContent = 'Layer 1'
      existingLayer.append(title)
      const orphan = document.createElementNS(namespaces.NS.SVG, 'rect')
      orphan.id = 'rect-orphan'
      svg.append(existingLayer, orphan)

      const drawing = new draw.Drawing(svg, 'p_')
      drawing.identifyLayers()

      const id1 = drawing.getNextId()
      const id2 = drawing.getNextId()
      const released = drawing.releaseId(id2)
      const reused = drawing.getNextId()
      const next = drawing.getNextId()

      return {
        id1,
        id2,
        released,
        reused,
        next,
        layerCount: drawing.getNumLayers(),
        currentLayer: drawing.getCurrentLayerName(),
        orphanParentTag: orphan.parentNode?.tagName.toLowerCase()
      }
    })

    expect(result.id1).toBe('p_1')
    expect(result.id2).toBe('p_2')
    expect(result.released).toBe(true)
    expect(result.reused).toBe(result.id2)
    expect(result.next).toBe('p_3')
    expect(result.layerCount).toBe(2)
    expect(result.currentLayer).toBe('Layer 2')
    expect(result.orphanParentTag).toBe('g')
  })

  test('reorders and toggles layers', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { draw, namespaces } = window.svgHarness
      const svg = document.createElementNS(namespaces.NS.SVG, 'svg')
      document.getElementById('root').append(svg)
      const drawing = new draw.Drawing(svg)
      drawing.identifyLayers() // creates first layer
      const originalName = drawing.getCurrentLayerName()

      drawing.createLayer('Layer Two')
      drawing.createLayer('Layer Three')
      drawing.setCurrentLayer('Layer Two')
      const movedDown = drawing.setCurrentLayerPosition(2)
      const orderAfterDown = [
        drawing.getLayerName(0),
        drawing.getLayerName(1),
        drawing.getLayerName(2)
      ]

      drawing.setCurrentLayer('Layer Three')
      const movedUp = drawing.setCurrentLayerPosition(0)
      const orderAfterUp = [
        drawing.getLayerName(0),
        drawing.getLayerName(1),
        drawing.getLayerName(2)
      ]

      const target = drawing.getCurrentLayerName()
      drawing.setLayerVisibility(target, false)
      const hidden = drawing.getLayerVisibility(target)
      drawing.setLayerOpacity(target, 0.5)

      return {
        originalName,
        movedDown: Boolean(movedDown),
        movedUp: Boolean(movedUp),
        orderAfterDown,
        orderAfterUp,
        hidden,
        opacity: drawing.getLayerOpacity(target)
      }
    })

    expect(result.originalName).toBe('Layer 1')
    expect(result.movedDown).toBe(true)
    expect(result.orderAfterDown[2]).toBe('Layer Two')
    expect(result.movedUp).toBe(true)
    expect(result.orderAfterUp[0]).toBe('Layer Three')
    expect(result.hidden).toBe(false)
    expect(result.opacity).toBe(0.5)
  })

  test('clones and deletes layers and randomizes ids', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { draw, namespaces } = window.svgHarness
      const svg = document.createElementNS(namespaces.NS.SVG, 'svg')
      document.getElementById('root').append(svg)
      const drawing = new draw.Drawing(svg)
      drawing.identifyLayers()

      const currentLayer = drawing.getCurrentLayer()
      const circle = document.createElementNS(namespaces.NS.SVG, 'circle')
      circle.setAttribute('id', 'seed')
      currentLayer.append(circle)

      const cloneGroup = drawing.cloneLayer('Duplicated')
      const clonedCircle = cloneGroup?.querySelector('circle')
      const beforeDelete = drawing.getNumLayers()
      const deleted = drawing.deleteCurrentLayer()
      const afterDelete = drawing.getNumLayers()

      draw.randomizeIds(true, drawing)
      const nonceSet = drawing.getNonce()
      draw.randomizeIds(false, drawing)

      return {
        cloneHasChild: Boolean(clonedCircle),
        beforeDelete,
        afterDelete,
        deletedTag: deleted?.tagName.toLowerCase(),
        nonceSet,
        nonceCleared: drawing.getNonce()
      }
    })

    expect(result.cloneHasChild).toBe(true)
    expect(result.beforeDelete).toBe(2)
    expect(result.afterDelete).toBe(1)
    expect(result.deletedTag).toBe('g')
    expect(result.nonceSet).not.toBe('')
    expect(result.nonceCleared).toBe('')
  })
})
