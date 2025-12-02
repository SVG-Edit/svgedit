import { test, expect } from '../fixtures.js'

test.describe('SVG core history/draw smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('UndoManager push/undo/redo stack sizes update', async ({ page }) => {
    const stacks = await page.evaluate(() => {
      const { history } = window.svgHarness
      class DummyCommand extends history.Command {
        constructor (text) {
          super()
          this.text = text
        }

        apply () {}
        unapply () {}
      }
      const um = new history.UndoManager()
      um.addCommandToHistory(new DummyCommand('one'))
      um.addCommandToHistory(new DummyCommand('two'))
      const beforeUndo = { undo: um.getUndoStackSize(), redo: um.getRedoStackSize() }
      um.undo()
      const afterUndo = { undo: um.getUndoStackSize(), redo: um.getRedoStackSize() }
      um.redo()
      const afterRedo = { undo: um.getUndoStackSize(), redo: um.getRedoStackSize() }
      return { beforeUndo, afterUndo, afterRedo, nextUndo: um.getNextUndoCommandText(), nextRedo: um.getNextRedoCommandText() }
    })
    expect(stacks.beforeUndo.undo).toBe(2)
    expect(stacks.beforeUndo.redo).toBe(0)
    expect(stacks.afterUndo.undo).toBe(1)
    expect(stacks.afterUndo.redo).toBe(1)
    expect(stacks.afterRedo.undo).toBe(2)
    expect(stacks.nextUndo.length).toBeGreaterThan(0)
  })

  test('draw module exports expected functions', async ({ page }) => {
    const exports = await page.evaluate(() => {
      const { draw } = window.svgHarness
      return ['init', 'randomizeIds', 'createLayer'].map(fn => typeof draw[fn] === 'function')
    })
    exports.forEach(v => expect(v).toBe(true))
  })
})
