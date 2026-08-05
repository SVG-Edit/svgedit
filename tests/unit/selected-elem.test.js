import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import { getTransformList } from '../../packages/svgcanvas/core/math.js'

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
    localStorage.clear()
  })

  afterEach(() => {
    document.body.textContent = ''
    sessionStorage.clear()
    localStorage.clear()
  })

  it('copies selection without requiring context menu DOM', () => {
    let clipboardChanges = 0
    svgCanvas.bind('clipboardChanged', () => {
      clipboardChanges++
    })
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
    expect(parsed.version).toBe(2)
    expect(parsed.elements).toHaveLength(1)
    expect(parsed.elements[0].element).toBe('rect')
    expect(parsed.elements[0].attr.id).toBe('rect-copy')
    expect(parsed.dependencies).toEqual([])
    expect(svgCanvas.hasClipboardData()).toBe(true)
    expect(clipboardChanges).toBe(1)
  })

  it('copies recursive external dependencies for cross-document paste', () => {
    const defs = svgCanvas.findDefs()
    const gradient = document.createElementNS(NS.SVG, 'linearGradient')
    gradient.id = 'gradient-copy'
    const stop = document.createElementNS(NS.SVG, 'stop')
    stop.setAttribute('offset', '0%')
    stop.setAttribute('stop-color', '#f00')
    gradient.append(stop)

    const symbol = document.createElementNS(NS.SVG, 'symbol')
    symbol.id = 'symbol-copy'
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('width', '20')
    rect.setAttribute('height', '20')
    rect.setAttribute('fill', 'url(#gradient-copy)')
    symbol.append(rect)
    defs.append(gradient, symbol)

    const use = svgCanvas.addSVGElementsFromJson({
      element: 'use',
      attr: { id: 'use-copy', href: '#symbol-copy' }
    })
    svgCanvas.selectOnly([use], true)
    svgCanvas.copySelectedElements()

    const clipboard = JSON.parse(
      sessionStorage.getItem(svgCanvas.getClipboardID())
    )
    const dependencyIds = clipboard.dependencies.map((item) => item.attr.id)

    expect(dependencyIds).toEqual(expect.arrayContaining([
      'symbol-copy',
      'gradient-copy'
    ]))
    expect(clipboard.useTargetIds).toEqual(['symbol-copy'])
  })

  it('does not flash missing or invalid clipboard data', () => {
    expect(svgCanvas.hasClipboardData()).toBe(false)
    svgCanvas.flashStorage()
    expect(localStorage.getItem(svgCanvas.getClipboardID())).toBeNull()

    sessionStorage.setItem(svgCanvas.getClipboardID(), '[]')
    expect(svgCanvas.hasClipboardData()).toBe(false)

    sessionStorage.setItem(svgCanvas.getClipboardID(), 'not-json')
    expect(svgCanvas.hasClipboardData()).toBe(false)
    svgCanvas.flashStorage()
    expect(localStorage.getItem(svgCanvas.getClipboardID())).toBeNull()
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

  it('recenters group rotation after a programmatic move', () => {
    const group = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: {
        id: 'move-rotated-group',
        transform: 'rotate(30 50 25)'
      }
    })
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: { x: 0, y: 0, width: 100, height: 50 }
    })
    group.append(rect)
    svgCanvas.selectOnly([group], true)

    svgCanvas.moveSelectedElements(10, 20)

    const tlist = getTransformList(group)
    expect(tlist.numberOfItems).toBeLessThanOrEqual(2)
    expect(tlist.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_ROTATE)
    expect(tlist.getItem(0).angle).toBeCloseTo(30, 5)
    expect(tlist.getItem(0).cx).toBeCloseTo(60, 5)
    expect(tlist.getItem(0).cy).toBeCloseTo(45, 5)
    if (tlist.numberOfItems > 1) {
      expect(tlist.getItem(1).type).toBe(SVGTransform.SVG_TRANSFORM_MATRIX)
    }
  })

  // Regression test for https://github.com/SVG-Edit/svgedit/issues/953:
  // a single Ungroup action on imported SVG content (represented as a <use>
  // referencing a local <symbol>, per importSvgString()) must fully unwrap
  // it, not just silently convert the <use> into an equivalent <g> that
  // still requires a second Ungroup to actually flatten.
  it('fully ungroups a <use> (imported SVG content) in a single call', () => {
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
    expect(container.querySelector('g')).toBeNull()
    const rect = container.firstElementChild
    expect(rect).toBeTruthy()
    expect(rect.tagName).toBe('rect')
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

  it('normalizes transforms pushed to a child group during ungroup', () => {
    const group = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: {
        id: 'ungroup-source-group',
        transform: 'translate(20,30) rotate(15 10 10) scale(1.2,0.8)'
      }
    })
    const childGroup = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: {
        id: 'ungroup-child-group',
        transform: 'rotate(10 5 5) translate(3,4)'
      }
    })
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'ungroup-child-rect',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })
    childGroup.append(rect)
    group.append(childGroup)

    svgCanvas.selectOnly([group], true)
    svgCanvas.ungroupSelectedElement()

    const normalized = svgCanvas.getSvgContent().querySelector('#ungroup-child-group')
    const removedGroup = svgCanvas.getSvgContent().querySelector('#ungroup-source-group')
    const tlist = getTransformList(normalized)

    expect(removedGroup).toBeNull()
    expect(tlist.numberOfItems).toBeLessThanOrEqual(2)
    expect(tlist.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_ROTATE)
    expect(tlist.getItem(0).angle).toBeCloseTo(25, 5)
    if (tlist.numberOfItems > 1) {
      expect(tlist.getItem(1).type).toBe(SVGTransform.SVG_TRANSFORM_MATRIX)
    }
  })

  it('normalizes transforms pushed to text during ungroup without changing font-size', () => {
    const group = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: {
        id: 'ungroup-text-source-group',
        transform: 'translate(20,30) rotate(15 0 0) scale(1.2,0.8)'
      }
    })
    const text = svgCanvas.addSVGElementsFromJson({
      element: 'text',
      attr: {
        id: 'ungroup-text',
        x: 10,
        y: 20,
        'font-size': 18,
        transform: 'rotate(10 10 20)'
      }
    })
    text.textContent = 'Text'
    group.append(text)

    svgCanvas.selectOnly([group], true)
    svgCanvas.ungroupSelectedElement()

    const normalized = svgCanvas.getSvgContent().querySelector('#ungroup-text')
    const tlist = getTransformList(normalized)

    expect(normalized.getAttribute('font-size')).toBe('18')
    expect(normalized.getAttribute('x')).toBe('10')
    expect(normalized.getAttribute('y')).toBe('20')
    expect(tlist.numberOfItems).toBe(2)
    expect(tlist.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_ROTATE)
    expect(tlist.getItem(1).type).toBe(SVGTransform.SVG_TRANSFORM_MATRIX)
    expect(tlist.getItem(0).angle).toBeCloseTo(25, 5)
  })

  it('normalizes transforms pushed to use during ungroup', () => {
    const group = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: {
        id: 'ungroup-use-source-group',
        transform: 'rotate(49.1078 556.55 387.55) matrix(1.63619 0 0 2.87547 -1096.09 180.372)'
      }
    })
    const use = svgCanvas.addSVGElementsFromJson({
      element: 'use',
      attr: {
        id: 'ungroup-use',
        x: 1017,
        y: 62,
        href: '#hmi-directive-alphanumeric',
        transform: 'translate(1017 62) scale(0.96875 1) translate(-1017 -62)'
      }
    })
    group.append(use)

    svgCanvas.selectOnly([group], true)
    svgCanvas.ungroupSelectedElement()

    const normalized = svgCanvas.getSvgContent().querySelector('#ungroup-use')
    const tlist = getTransformList(normalized)

    expect(tlist.numberOfItems).toBe(2)
    expect(tlist.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_ROTATE)
    expect(tlist.getItem(1).type).toBe(SVGTransform.SVG_TRANSFORM_MATRIX)
    expect(tlist.getItem(0).angle).toBeCloseTo(49.1078, 5)
  })
})
