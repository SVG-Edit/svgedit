import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'

describe('blur-event', () => {
  let svgCanvas

  const createSvgCanvas = () => {
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

    svgCanvas = new SvgCanvas(document.getElementById('svgcanvas'), {
      canvas_expansion: 3,
      dimensions: [640, 480],
      initFill: {
        color: 'FF0000',
        opacity: 1
      },
      initStroke: {
        width: 5,
        color: '000000',
        opacity: 1
      },
      initOpacity: 1,
      imgPath: '../editor/images',
      langPath: 'locale/',
      extPath: 'extensions/',
      extensions: [],
      initTool: 'select',
      wireframe: false
    })
  }

  beforeEach(() => {
    createSvgCanvas()
  })

  afterEach(() => {
    document.body.textContent = ''
  })

  it('does not create a filter or history when setting blur to 0 on a new element', () => {
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-blur-zero',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })

    svgCanvas.selectOnly([rect], true)
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    svgCanvas.setBlur(0, true)

    expect(rect.hasAttribute('filter')).toBe(false)
    expect(svgCanvas.getSvgContent().querySelector('#rect-blur-zero_blur')).toBeNull()
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize)
  })

  it('creates a blur filter and records a single history entry', () => {
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-blur-create',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })

    svgCanvas.selectOnly([rect], true)
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    svgCanvas.setBlur(1.2, true)

    expect(rect.getAttribute('filter')).toBe('url(#rect-blur-create_blur)')
    const filter = svgCanvas.getSvgContent().querySelector('#rect-blur-create_blur')
    expect(filter).toBeTruthy()
    expect(filter.querySelector('feGaussianBlur').getAttribute('stdDeviation')).toBe('1.2')
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize + 1)
  })

  it('removes blur and supports undo/redo', () => {
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-blur-undo',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })

    svgCanvas.selectOnly([rect], true)
    svgCanvas.setBlur(2, true)

    const undoSize = svgCanvas.undoMgr.getUndoStackSize()
    svgCanvas.setBlur(0, true)

    expect(rect.hasAttribute('filter')).toBe(false)
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize + 1)

    svgCanvas.undoMgr.undo()
    expect(rect.getAttribute('filter')).toBe('url(#rect-blur-undo_blur)')

    svgCanvas.undoMgr.redo()
    expect(rect.hasAttribute('filter')).toBe(false)
  })
})
