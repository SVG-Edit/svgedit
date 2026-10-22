import { test, expect } from './fixtures.js'
import { visitAndApproveStorage } from './helpers.js'

test.describe('Bulk selection regressions', () => {
  test.beforeEach(async ({ page }) => {
    await visitAndApproveStorage(page)
    await page.waitForFunction(() => window.svgEditor?.isReady)
    await page.evaluate(() => {
      window.svgEditor.loadSvgString(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
        <rect id="first" x="30" y="40" width="60" height="35" fill="red" stroke="none"/>
        <rect id="second" x="180" y="120" width="90" height="55" fill="blue" stroke="none"/>
        <rect id="third" x="340" y="220" width="40" height="80" fill="green" stroke="none"/>
      </svg>`)
    })
  })

  test('positions resize grips after bulk movement, undo and redo', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const canvas = window.svgEditor.svgCanvas
      const positions = []
      const checkGrips = (id) => {
        const element = document.getElementById(id)
        canvas.selectOnly([element], true)
        const bounds = element.getBoundingClientRect()
        const grip = document.getElementById('selectorGrip_resize_se')
        const point = new DOMPoint(grip.cx.baseVal.value, grip.cy.baseVal.value)
          .matrixTransform(grip.getScreenCTM())
        positions.push({
          id,
          dx: point.x - bounds.right,
          dy: point.y - bounds.bottom,
          selected: canvas.getSelectedElements().filter(Boolean).map(element => element.id)
        })
      }
      for (const id of ['first', 'second', 'third']) checkGrips(id)
      canvas.selectAllInCurrentLayer()
      canvas.moveSelectedElements(20, 10)
      canvas.undoMgr.undo()
      canvas.undoMgr.redo()
      for (const id of ['third', 'first', 'second']) checkGrips(id)
      return positions
    })
    for (const position of positions) {
      expect(position.selected).toEqual([position.id])
      expect(Math.abs(position.dx)).toBeLessThan(3)
      expect(Math.abs(position.dy)).toBeLessThan(3)
    }
  })

  test('reuses selection outlines when clearing and rebuilding selections', async ({ page }) => {
    const result = await page.evaluate(() => {
      const canvas = window.svgEditor.svgCanvas
      const ids = ['first', 'second', 'third']
      const selectionErrors = []
      canvas.selectAllInCurrentLayer()
      const originalCount = document.querySelectorAll('[id^="selectorGroup"]').length
      for (let i = 0; i < 30; i++) {
        canvas.clearSelection()
        const id = ids[i % ids.length]
        canvas.selectOnly([document.getElementById(id)])
        const selected = canvas.getSelectedElements().filter(Boolean)
        if (selected.length !== 1 || selected[0].id !== id) selectionErrors.push(id)
      }
      canvas.selectAllInCurrentLayer()
      const finalIds = canvas.getSelectedElements().filter(Boolean).map(element => element.id).sort()
      const finalCount = document.querySelectorAll('[id^="selectorGroup"]').length
      canvas.clearSelection()
      const visibleOutlines = Array.from(document.querySelectorAll('[id^="selectedBox"]'))
        .filter(element => element.getBoundingClientRect().width > 0).length
      return { selectionErrors, originalCount, finalCount, finalIds, visibleOutlines }
    })
    expect(result.selectionErrors).toEqual([])
    expect(result.finalIds).toEqual(['first', 'second', 'third'])
    expect(result.finalCount).toBe(result.originalCount)
    expect(result.visibleOutlines).toBe(0)
  })
})
