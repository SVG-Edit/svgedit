import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'

describe('selected-elem', () => {
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
    sessionStorage.clear()
  })

  afterEach(() => {
    document.body.textContent = ''
    sessionStorage.clear()
  })

  it('copies selection without requiring context menu DOM', () => {
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-copy',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })

    svgCanvas.selectOnly([rect], true)

    expect(() => svgCanvas.copySelectedElements()).not.toThrow()

    const raw = sessionStorage.getItem(svgCanvas.getClipboardID())
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].element).toBe('rect')
    expect(parsed[0].attr.id).toBe('rect-copy')
  })

  it('moves element to bottom even with whitespace/title/defs nodes', () => {
    const rect1 = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-bottom-1',
        x: 10,
        y: 10,
        width: 10,
        height: 10
      }
    })
    const rect2 = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-bottom-2',
        x: 30,
        y: 10,
        width: 10,
        height: 10
      }
    })

    const parent = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: { id: 'move-bottom-container' }
    })
    parent.append(rect1, rect2)
    parent.insertBefore(document.createTextNode('\n'), parent.firstChild)
    const title = document.createElementNS(NS.SVG, 'title')
    title.textContent = 'Layer'
    parent.insertBefore(title, rect1)
    const defs = document.createElementNS(NS.SVG, 'defs')
    parent.insertBefore(defs, rect1)

    svgCanvas.selectOnly([rect2], true)
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    expect(() => svgCanvas.moveToBottomSelectedElement()).not.toThrow()
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize + 1)

    const order = Array.from(parent.childNodes)
      .filter((n) => n.nodeType === 1)
      .map((n) => (n.tagName === 'title' || n.tagName === 'defs') ? n.tagName : n.id)

    expect(order).toEqual(['title', 'defs', 'rect-bottom-2', 'rect-bottom-1'])
  })

  it('ungroups a <use> when it is the first element child', () => {
    const defs = svgCanvas.getSvgContent().querySelector('defs') ||
      svgCanvas.getSvgContent().appendChild(document.createElementNS(NS.SVG, 'defs'))

    const symbol = document.createElementNS(NS.SVG, 'symbol')
    symbol.id = 'symbol-test'
    const symRect = document.createElementNS(NS.SVG, 'rect')
    symRect.setAttribute('x', '10')
    symRect.setAttribute('y', '20')
    symRect.setAttribute('width', '30')
    symRect.setAttribute('height', '40')
    symbol.append(symRect)
    defs.append(symbol)

    const container = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: { id: 'use-container' }
    })
    const use = svgCanvas.addSVGElementsFromJson({
      element: 'use',
      attr: { id: 'use-test', href: '#symbol-test' }
    })
    container.append(use)
    svgCanvas.setUseData(use)
    svgCanvas.selectOnly([use], true)

    expect(() => svgCanvas.ungroupSelectedElement()).not.toThrow()

    expect(container.querySelector('use')).toBeNull()
    const group = container.firstElementChild
    expect(group).toBeTruthy()
    expect(group.tagName).toBe('g')
    expect(group.querySelector('rect')).toBeTruthy()
  })

  it('does not crash ungrouping a <use> without href', () => {
    const use = svgCanvas.addSVGElementsFromJson({
      element: 'use',
      attr: { id: 'use-no-href' }
    })
    svgCanvas.selectOnly([use], true)

    const originalWarn = console.warn
    console.warn = () => {}
    try {
      expect(() => svgCanvas.ungroupSelectedElement()).not.toThrow()
    } finally {
      console.warn = originalWarn
    }
    expect(svgCanvas.getSvgContent().querySelector('#use-no-href')).toBeTruthy()
  })
})
