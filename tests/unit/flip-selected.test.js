import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'

describe('flipSelectedElements', () => {
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

  it('flips a simple line horizontally and records history', () => {
    const line = svgCanvas.addSVGElementsFromJson({
      element: 'line',
      attr: {
        id: 'line-basic',
        x1: 10,
        y1: 20,
        x2: 30,
        y2: 20,
        stroke: '#000'
      }
    })

    svgCanvas.selectOnly([line], true)
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    svgCanvas.flipSelectedElements(-1, 1)

    expect(Number(line.getAttribute('x1'))).toBe(30)
    expect(Number(line.getAttribute('x2'))).toBe(10)
    expect(line.hasAttribute('transform')).toBe(false)
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize + 1)
  })

  it('flips around the visual center when a transform exists and can be undone', () => {
    const line = svgCanvas.addSVGElementsFromJson({
      element: 'line',
      attr: {
        id: 'line-transformed',
        x1: 10,
        y1: 0,
        x2: 30,
        y2: 0,
        stroke: '#000',
        transform: 'translate(100,0)'
      }
    })

    svgCanvas.selectOnly([line], true)
    svgCanvas.flipSelectedElements(-1, 1)

    expect(Number(line.getAttribute('x1'))).toBe(130)
    expect(Number(line.getAttribute('x2'))).toBe(110)
    expect(line.hasAttribute('transform')).toBe(false)

    svgCanvas.undoMgr.undo()

    expect(Number(line.getAttribute('x1'))).toBe(10)
    expect(Number(line.getAttribute('x2'))).toBe(30)
    expect(line.getAttribute('transform')).toMatch(/translate\(100[ ,]0\)/)
  })
})
