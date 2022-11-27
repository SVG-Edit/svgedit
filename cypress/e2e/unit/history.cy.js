import { NS } from '../../../packages/svgcanvas/core/namespaces.js'
import * as utilities from '../../../packages/svgcanvas/core/utilities.js'
import * as history from '../../../packages/svgcanvas/core/history.js'

describe('history', function () {
  // TODO(codedread): Write tests for handling history events.

  utilities.mock({
    getHref () { return '#foo' },
    setHref () { /* empty fn */ },
    getRotationAngle () { return 0 }
  })

  // const svg = document.createElementNS(NS.SVG, 'svg');
  let undoMgr = null

  class MockCommand extends history.Command {
    constructor (optText) {
      super()
      this.text = optText
    }

    apply (handler) {
      super.apply(handler, () => { /* empty fn */ })
    }

    unapply (handler) {
      super.unapply(handler, () => { /* empty fn */ })
    }

    elements () { return [] }
  }

  /*
  class MockHistoryEventHandler {
    handleHistoryEvent (eventType, command) {}
  }
  */

  /**
   * Set up tests (with undo manager).
   * @returns {void}
   */
  beforeEach(function () {
    undoMgr = new history.UndoManager()

    document.body.textContent = ''
    this.divparent = document.createElement('div')
    this.divparent.id = 'divparent'
    this.divparent.style.visibility = 'hidden'

    for (let i = 1; i <= 5; i++) {
      const div = document.createElement('div')
      const id = `div${i}`
      div.id = id
      this[id] = div
    }

    this.divparent.append(this.div1, this.div2, this.div3)

    this.div4.style.visibility = 'hidden'
    this.div4.append(this.div5)

    document.body.append(this.divparent, this.div)
  })
  /**
   * Tear down tests, destroying undo manager.
   * @returns {void}
   */
  afterEach(() => {
    undoMgr = null
  })

  it('Test svgedit.history package', function () {
    assert.ok(history)
    assert.ok(history.MoveElementCommand)
    assert.ok(history.InsertElementCommand)
    assert.ok(history.ChangeElementCommand)
    assert.ok(history.RemoveElementCommand)
    assert.ok(history.BatchCommand)
    assert.ok(history.UndoManager)
    assert.equal(typeof history.MoveElementCommand, typeof function () { /* empty fn */ })
    assert.equal(typeof history.InsertElementCommand, typeof function () { /* empty fn */ })
    assert.equal(typeof history.ChangeElementCommand, typeof function () { /* empty fn */ })
    assert.equal(typeof history.RemoveElementCommand, typeof function () { /* empty fn */ })
    assert.equal(typeof history.BatchCommand, typeof function () { /* empty fn */ })
    assert.equal(typeof history.UndoManager, typeof function () { /* empty fn */ })
  })

  it('Test UndoManager methods', function () {
    assert.ok(undoMgr)
    assert.ok(undoMgr.addCommandToHistory)
    assert.ok(undoMgr.getUndoStackSize)
    assert.ok(undoMgr.getRedoStackSize)
    assert.ok(undoMgr.resetUndoStack)
    assert.ok(undoMgr.getNextUndoCommandText)
    assert.ok(undoMgr.getNextRedoCommandText)

    assert.equal(typeof undoMgr, typeof {})
    assert.equal(typeof undoMgr.addCommandToHistory, typeof function () { /* empty fn */ })
    assert.equal(typeof undoMgr.getUndoStackSize, typeof function () { /* empty fn */ })
    assert.equal(typeof undoMgr.getRedoStackSize, typeof function () { /* empty fn */ })
    assert.equal(typeof undoMgr.resetUndoStack, typeof function () { /* empty fn */ })
    assert.equal(typeof undoMgr.getNextUndoCommandText, typeof function () { /* empty fn */ })
    assert.equal(typeof undoMgr.getNextRedoCommandText, typeof function () { /* empty fn */ })
  })

  it('Test UndoManager.addCommandToHistory() function', function () {
    assert.equal(undoMgr.getUndoStackSize(), 0)
    undoMgr.addCommandToHistory(new MockCommand())
    assert.equal(undoMgr.getUndoStackSize(), 1)
    undoMgr.addCommandToHistory(new MockCommand())
    assert.equal(undoMgr.getUndoStackSize(), 2)
  })

  it('Test UndoManager.getUndoStackSize() and getRedoStackSize() functions', function () {
    undoMgr.addCommandToHistory(new MockCommand())
    undoMgr.addCommandToHistory(new MockCommand())
    undoMgr.addCommandToHistory(new MockCommand())

    assert.equal(undoMgr.getUndoStackSize(), 3)
    assert.equal(undoMgr.getRedoStackSize(), 0)

    undoMgr.undo()
    assert.equal(undoMgr.getUndoStackSize(), 2)
    assert.equal(undoMgr.getRedoStackSize(), 1)

    undoMgr.undo()
    assert.equal(undoMgr.getUndoStackSize(), 1)
    assert.equal(undoMgr.getRedoStackSize(), 2)

    undoMgr.undo()
    assert.equal(undoMgr.getUndoStackSize(), 0)
    assert.equal(undoMgr.getRedoStackSize(), 3)

    undoMgr.undo()
    assert.equal(undoMgr.getUndoStackSize(), 0)
    assert.equal(undoMgr.getRedoStackSize(), 3)

    undoMgr.redo()
    assert.equal(undoMgr.getUndoStackSize(), 1)
    assert.equal(undoMgr.getRedoStackSize(), 2)

    undoMgr.redo()
    assert.equal(undoMgr.getUndoStackSize(), 2)
    assert.equal(undoMgr.getRedoStackSize(), 1)

    undoMgr.redo()
    assert.equal(undoMgr.getUndoStackSize(), 3)
    assert.equal(undoMgr.getRedoStackSize(), 0)

    undoMgr.redo()
    assert.equal(undoMgr.getUndoStackSize(), 3)
    assert.equal(undoMgr.getRedoStackSize(), 0)
  })

  it('Test UndoManager.resetUndoStackSize() function', function () {
    undoMgr.addCommandToHistory(new MockCommand())
    undoMgr.addCommandToHistory(new MockCommand())
    undoMgr.addCommandToHistory(new MockCommand())
    undoMgr.undo()

    assert.equal(undoMgr.getUndoStackSize(), 2)
    assert.equal(undoMgr.getRedoStackSize(), 1)

    undoMgr.resetUndoStack()

    assert.equal(undoMgr.getUndoStackSize(), 0)
    assert.equal(undoMgr.getRedoStackSize(), 0)
  })

  it('Test UndoManager.getNextUndoCommandText() function', function () {
    assert.equal(undoMgr.getNextUndoCommandText(), '')

    undoMgr.addCommandToHistory(new MockCommand('First'))
    undoMgr.addCommandToHistory(new MockCommand('Second'))
    undoMgr.addCommandToHistory(new MockCommand('Third'))

    assert.equal(undoMgr.getNextUndoCommandText(), 'Third')

    undoMgr.undo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'Second')

    undoMgr.undo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'First')

    undoMgr.undo()
    assert.equal(undoMgr.getNextUndoCommandText(), '')

    undoMgr.redo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'First')

    undoMgr.redo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'Second')

    undoMgr.redo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'Third')

    undoMgr.redo()
    assert.equal(undoMgr.getNextUndoCommandText(), 'Third')
  })

  it('Test UndoManager.getNextRedoCommandText() function', function () {
    assert.equal(undoMgr.getNextRedoCommandText(), '')

    undoMgr.addCommandToHistory(new MockCommand('First'))
    undoMgr.addCommandToHistory(new MockCommand('Second'))
    undoMgr.addCommandToHistory(new MockCommand('Third'))

    assert.equal(undoMgr.getNextRedoCommandText(), '')

    undoMgr.undo()
    assert.equal(undoMgr.getNextRedoCommandText(), 'Third')

    undoMgr.undo()
    assert.equal(undoMgr.getNextRedoCommandText(), 'Second')

    undoMgr.undo()
    assert.equal(undoMgr.getNextRedoCommandText(), 'First')

    undoMgr.redo()
    assert.equal(undoMgr.getNextRedoCommandText(), 'Second')

    undoMgr.redo()
    assert.equal(undoMgr.getNextRedoCommandText(), 'Third')

    undoMgr.redo()
    assert.equal(undoMgr.getNextRedoCommandText(), '')
  })

  it('Test UndoManager.undo() and redo() functions', function () {
    let lastCalled = null
    const cmd1 = new MockCommand()
    const cmd2 = new MockCommand()
    const cmd3 = new MockCommand()
    cmd1.apply = function () { lastCalled = 'cmd1.apply' }
    cmd2.apply = function () { lastCalled = 'cmd2.apply' }
    cmd3.apply = function () { lastCalled = 'cmd3.apply' }
    cmd1.unapply = function () { lastCalled = 'cmd1.unapply' }
    cmd2.unapply = function () { lastCalled = 'cmd2.unapply' }
    cmd3.unapply = function () { lastCalled = 'cmd3.unapply' }

    undoMgr.addCommandToHistory(cmd1)
    undoMgr.addCommandToHistory(cmd2)
    undoMgr.addCommandToHistory(cmd3)

    assert.ok(!lastCalled)

    undoMgr.undo()
    assert.equal(lastCalled, 'cmd3.unapply')

    undoMgr.redo()
    assert.equal(lastCalled, 'cmd3.apply')

    undoMgr.undo()
    undoMgr.undo()
    assert.equal(lastCalled, 'cmd2.unapply')

    undoMgr.undo()
    assert.equal(lastCalled, 'cmd1.unapply')
    lastCalled = null

    undoMgr.undo()
    assert.ok(!lastCalled)

    undoMgr.redo()
    assert.equal(lastCalled, 'cmd1.apply')

    undoMgr.redo()
    assert.equal(lastCalled, 'cmd2.apply')

    undoMgr.redo()
    assert.equal(lastCalled, 'cmd3.apply')
    lastCalled = null

    undoMgr.redo()
    assert.ok(!lastCalled)
  })

  it('Test MoveElementCommand', function () {
    let move = new history.MoveElementCommand(this.div3, this.div1, this.divparent)
    assert.ok(move.unapply)
    assert.ok(move.apply)
    assert.equal(typeof move.unapply, typeof function () { /* empty fn */ })
    assert.equal(typeof move.apply, typeof function () { /* empty fn */ })

    move.unapply()
    assert.equal(this.divparent.firstElementChild, this.div3)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div1)
    assert.equal(this.divparent.lastElementChild, this.div2)

    move.apply()
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div2)
    assert.equal(this.divparent.lastElementChild, this.div3)

    move = new history.MoveElementCommand(this.div1, null, this.divparent)

    move.unapply()
    assert.equal(this.divparent.firstElementChild, this.div2)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div3)
    assert.equal(this.divparent.lastElementChild, this.div1)

    move.apply()
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div2)
    assert.equal(this.divparent.lastElementChild, this.div3)

    move = new history.MoveElementCommand(this.div2, this.div5, this.div4)

    move.unapply()
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div3)
    assert.equal(this.divparent.lastElementChild, this.div3)
    assert.equal(this.div4.firstElementChild, this.div2)
    assert.equal(this.div4.firstElementChild.nextElementSibling, this.div5)

    move.apply()
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.divparent.firstElementChild.nextElementSibling, this.div2)
    assert.equal(this.divparent.lastElementChild, this.div3)
    assert.equal(this.div4.firstElementChild, this.div5)
    assert.equal(this.div4.lastElementChild, this.div5)
  })

  it('Test InsertElementCommand', function () {
    let insert = new history.InsertElementCommand(this.div3)
    assert.ok(insert.unapply)
    assert.ok(insert.apply)
    assert.equal(typeof insert.unapply, typeof function () { /* empty fn */ })
    assert.equal(typeof insert.apply, typeof function () { /* empty fn */ })

    insert.unapply()
    assert.equal(this.divparent.childElementCount, 2)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.divparent.lastElementChild, this.div2)

    insert.apply()
    assert.equal(this.divparent.childElementCount, 3)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)

    insert = new history.InsertElementCommand(this.div2)

    insert.unapply()
    assert.equal(this.divparent.childElementCount, 2)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div3)
    assert.equal(this.divparent.lastElementChild, this.div3)

    insert.apply()
    assert.equal(this.divparent.childElementCount, 3)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)
  })

  it('Test RemoveElementCommand', function () {
    const div6 = document.createElement('div')
    div6.id = 'div6'

    let remove = new history.RemoveElementCommand(div6, null, this.divparent)
    assert.ok(remove.unapply)
    assert.ok(remove.apply)
    assert.equal(typeof remove.unapply, typeof function () { /* empty fn */ })
    assert.equal(typeof remove.apply, typeof function () { /* empty fn */ })

    remove.unapply()
    assert.equal(this.divparent.childElementCount, 4)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)
    assert.equal(this.div3.nextElementSibling, div6)

    remove.apply()
    assert.equal(this.divparent.childElementCount, 3)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)

    remove = new history.RemoveElementCommand(div6, this.div2, this.divparent)

    remove.unapply()
    assert.equal(this.divparent.childElementCount, 4)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, div6)
    assert.equal(div6.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)

    remove.apply()
    assert.equal(this.divparent.childElementCount, 3)
    assert.equal(this.divparent.firstElementChild, this.div1)
    assert.equal(this.div1.nextElementSibling, this.div2)
    assert.equal(this.div2.nextElementSibling, this.div3)
  })

  it('Test ChangeElementCommand', function () {
    this.div1.setAttribute('title', 'new title')
    let change = new history.ChangeElementCommand(this.div1,
      { title: 'old title', class: 'foo' })
    assert.ok(change.unapply)
    assert.ok(change.apply)
    assert.equal(typeof change.unapply, typeof function () { /* empty fn */ })
    assert.equal(typeof change.apply, typeof function () { /* empty fn */ })

    change.unapply()
    assert.equal(this.div1.getAttribute('title'), 'old title')
    assert.equal(this.div1.getAttribute('class'), 'foo')

    change.apply()
    assert.equal(this.div1.getAttribute('title'), 'new title')
    assert.ok(!this.div1.getAttribute('class'))

    this.div1.textContent = 'inner text'
    change = new history.ChangeElementCommand(this.div1,
      { '#text': null })

    change.unapply()
    assert.ok(!this.div1.textContent)

    change.apply()
    assert.equal(this.div1.textContent, 'inner text')

    this.div1.textContent = ''
    change = new history.ChangeElementCommand(this.div1,
      { '#text': 'old text' })

    change.unapply()
    assert.equal(this.div1.textContent, 'old text')

    change.apply()
    assert.ok(!this.div1.textContent)

    // TODO(codedread): Refactor this #href stuff in history.js and svgcanvas.js
    const rect = document.createElementNS(NS.SVG, 'rect')
    let justCalled = null
    let gethrefvalue = null
    let sethrefvalue = null
    utilities.mock({
      getHref (elem) {
        assert.equal(elem, rect)
        justCalled = 'getHref'
        return gethrefvalue
      },
      setHref (elem, val) {
        assert.equal(elem, rect)
        assert.equal(val, sethrefvalue)
        justCalled = 'setHref'
      },
      getRotationAngle () { return 0 }
    })

    gethrefvalue = '#newhref'
    change = new history.ChangeElementCommand(rect,
      { '#href': '#oldhref' })
    assert.equal(justCalled, 'getHref')

    justCalled = null
    sethrefvalue = '#oldhref'
    change.unapply()
    assert.equal(justCalled, 'setHref')

    justCalled = null
    sethrefvalue = '#newhref'
    change.apply()
    assert.equal(justCalled, 'setHref')

    const line = document.createElementNS(NS.SVG, 'line')
    line.setAttribute('class', 'newClass')
    change = new history.ChangeElementCommand(line, { class: 'oldClass' })

    assert.ok(change.unapply)
    assert.ok(change.apply)
    assert.equal(typeof change.unapply, typeof function () { /* empty fn */ })
    assert.equal(typeof change.apply, typeof function () { /* empty fn */ })

    change.unapply()
    assert.equal(line.getAttribute('class'), 'oldClass')

    change.apply()
    assert.equal(line.getAttribute('class'), 'newClass')
  })

  it('Test BatchCommand', function () {
    let concatResult = ''
    MockCommand.prototype.apply = function () { concatResult += this.text }

    const batch = new history.BatchCommand()
    assert.ok(batch.unapply)
    assert.ok(batch.apply)
    assert.ok(batch.addSubCommand)
    assert.ok(batch.isEmpty)
    assert.equal(typeof batch.unapply, 'function')
    assert.equal(typeof batch.apply, 'function')
    assert.equal(typeof batch.addSubCommand, 'function')
    assert.equal(typeof batch.isEmpty, 'function')

    assert.ok(batch.isEmpty())

    batch.addSubCommand(new MockCommand('a'))
    assert.ok(!batch.isEmpty())
    batch.addSubCommand(new MockCommand('b'))
    batch.addSubCommand(new MockCommand('c'))

    assert.ok(!concatResult)
    batch.apply()
    assert.equal(concatResult, 'abc')

    MockCommand.prototype.apply = function () { /* empty fn */ }
    MockCommand.prototype.unapply = function () { concatResult += this.text }
    concatResult = ''
    assert.ok(!concatResult)
    batch.unapply()
    assert.equal(concatResult, 'cba')

    MockCommand.prototype.unapply = function () { /* empty fn */ }
  })
})
