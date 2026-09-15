import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'

// Regression test: importing an SVG must be a single, fully-reversible undo step.
// Previously the import inserted the <use>/<symbol> as one history command and then
// centered the element with two further alignSelectedElements() commands, so a single
// undo only reversed the centering and the imported content lingered in the DOM,
// reappearing when the document was saved.
describe('import is a single atomic undo step', function () {
  let svgCanvas

  beforeEach(() => {
    document.body.textContent = ''
    const svgEditor = document.createElement('div')
    svgEditor.id = 'svg_editor'
    const svgcanvas = document.createElement('div')
    svgcanvas.style.visibility = 'hidden'
    svgcanvas.id = 'svgcanvas'
    const workarea = document.createElement('div')
    workarea.id = 'workarea'
    workarea.append(svgcanvas)
    const toolsLeft = document.createElement('div')
    toolsLeft.id = 'tools_left'
    svgEditor.append(workarea, toolsLeft)
    document.body.append(svgEditor)

    svgCanvas = new SvgCanvas(
      document.getElementById('svgcanvas'), {
        canvas_expansion: 3,
        dimensions: [640, 480],
        initFill: { color: 'FF0000', opacity: 1 },
        initStroke: { width: 5, color: '000000', opacity: 1 },
        initOpacity: 1,
        imgPath: '../editor/images',
        langPath: 'locale/',
        extPath: 'extensions/',
        extensions: [],
        initTool: 'select',
        wireframe: false
      }
    )
  })

  const imported = "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect id='importedRect' x='0' y='0' width='50' height='50' fill='blue'/></svg>"

  it('bundles import + centering into a single undo step', function () {
    const newElement = svgCanvas.importSvgString(imported, false, false, true)
    svgCanvas.selectOnly([newElement])

    // The whole import must be a single undoable step.
    assert.equal(svgCanvas.undoMgr.getUndoStackSize(), 1)

    const afterImport = svgCanvas.svgCanvasToString()
    assert.ok(afterImport.includes('<use'), 'import should add a <use>')
  })

  it('a single undo after import leaves nothing to save', function () {
    const newElement = svgCanvas.importSvgString(imported, false, false, true)
    svgCanvas.selectOnly([newElement])

    svgCanvas.undoMgr.undo()

    const out = svgCanvas.svgCanvasToString()
    assert.ok(!(out.includes('<use')), 'no <use> should remain after undo')
    assert.ok(!(out.includes('<symbol')), 'no <symbol> should remain after undo')
    assert.ok(!(out.includes('rect')), 'no imported content should be saved after undo')
  })

  it('redo restores the imported content in one step', function () {
    const newElement = svgCanvas.importSvgString(imported, false, false, true)
    svgCanvas.selectOnly([newElement])
    svgCanvas.undoMgr.undo()
    svgCanvas.undoMgr.redo()

    assert.equal(svgCanvas.undoMgr.getUndoStackSize(), 1)
    const out = svgCanvas.svgCanvasToString()
    assert.ok(out.includes('<use'), '<use> should return after redo')
  })
})
