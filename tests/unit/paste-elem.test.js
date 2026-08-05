import SvgCanvas from '../../packages/svgcanvas/svgcanvas.js'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'

describe('paste-elem', () => {
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

  const addGradient = (id, color) => {
    const gradient = document.createElementNS(NS.SVG, 'linearGradient')
    gradient.id = id
    const stop = document.createElementNS(NS.SVG, 'stop')
    stop.setAttribute('offset', '0%')
    stop.setAttribute('stop-color', color)
    gradient.append(stop)
    svgCanvas.findDefs().append(gradient)
    return gradient
  }

  const addSymbol = (id, fill) => {
    const symbol = document.createElementNS(NS.SVG, 'symbol')
    symbol.id = id
    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.setAttribute('width', '20')
    rect.setAttribute('height', '20')
    rect.setAttribute('fill', fill)
    symbol.append(rect)
    svgCanvas.findDefs().append(symbol)
    return symbol
  }

  const addUse = (id, targetId) => {
    return svgCanvas.addSVGElementsFromJson({
      element: 'use',
      attr: { id, href: `#${targetId}` }
    })
  }

  const prepareUseConflict = () => {
    addSymbol('shared-symbol', '#f00')
    const use = addUse('source-use', 'shared-symbol')
    svgCanvas.selectOnly([use], true)
    svgCanvas.copySelectedElements()
    svgCanvas.clear()
    addSymbol('shared-symbol', '#00f')
  }

  beforeEach(() => {
    createSvgCanvas()
    sessionStorage.clear()
  })

  afterEach(() => {
    document.body.textContent = ''
    sessionStorage.clear()
  })

  it('pastes copied elements and assigns new IDs', async () => {
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'rect-original',
        x: 10,
        y: 20,
        width: 30,
        height: 40
      }
    })

    svgCanvas.selectOnly([rect], true)
    svgCanvas.copySelectedElements()

    const undoSize = svgCanvas.undoMgr.getUndoStackSize()
    await svgCanvas.pasteElements('in_place')

    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize + 1)
    const pasted = svgCanvas.getSelectedElements()[0]
    expect(pasted).toBeTruthy()
    expect(pasted.tagName).toBe('rect')
    expect(pasted.id).not.toBe('rect-original')

    expect(svgCanvas.getSvgContent().querySelector('#rect-original')).toBeTruthy()
    expect(svgCanvas.getSvgContent().querySelector('#' + pasted.id)).toBe(pasted)
  })

  it('remaps internal url(#id) references when pasting', async () => {
    const group = svgCanvas.addSVGElementsFromJson({
      element: 'g',
      attr: { id: 'group-original' }
    })

    const defs = document.createElementNS(NS.SVG, 'defs')
    const gradient = document.createElementNS(NS.SVG, 'linearGradient')
    gradient.id = 'grad-original'
    const stop = document.createElementNS(NS.SVG, 'stop')
    stop.setAttribute('offset', '0%')
    stop.setAttribute('stop-color', '#000')
    gradient.append(stop)
    defs.append(gradient)

    const rect = document.createElementNS(NS.SVG, 'rect')
    rect.id = 'rect-with-fill'
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', '10')
    rect.setAttribute('height', '10')
    rect.setAttribute('fill', 'url(#grad-original)')
    group.append(defs, rect)

    svgCanvas.selectOnly([group], true)
    svgCanvas.copySelectedElements()
    await svgCanvas.pasteElements('in_place')

    const pastedGroup = svgCanvas.getSelectedElements()[0]
    const pastedGradient = pastedGroup.querySelector('linearGradient')
    const pastedRect = pastedGroup.querySelector('rect')

    expect(pastedGradient).toBeTruthy()
    expect(pastedRect).toBeTruthy()
    expect(pastedGradient.id).not.toBe('grad-original')
    expect(pastedRect.getAttribute('fill')).toBe('url(#' + pastedGradient.id + ')')
  })

  it('does not throw on invalid clipboard JSON', async () => {
    sessionStorage.setItem(svgCanvas.getClipboardID(), 'not-json')
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    await expect(svgCanvas.pasteElements('in_place')).resolves.toBeUndefined()
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize)
  })

  it('does not throw on empty clipboard', async () => {
    sessionStorage.setItem(svgCanvas.getClipboardID(), '[]')
    const undoSize = svgCanvas.undoMgr.getUndoStackSize()

    await expect(svgCanvas.pasteElements('in_place')).resolves.toBeUndefined()
    expect(svgCanvas.undoMgr.getUndoStackSize()).toBe(undoSize)
  })

  it('does not duplicate external defs when pasting in the same document', async () => {
    addSymbol('same-document-symbol', '#f00')
    const use = addUse('same-document-use', 'same-document-symbol')
    svgCanvas.selectOnly([use], true)
    svgCanvas.copySelectedElements()

    await svgCanvas.pasteElements('in_place')

    expect(svgCanvas.getSvgContent().querySelectorAll('#same-document-symbol')).toHaveLength(1)
    expect(svgCanvas.getSvgContent().querySelectorAll('use')).toHaveLength(2)
    expect(svgCanvas.getSelectedElements()[0].getAttribute('href')).toBe('#same-document-symbol')
  })

  it('imports recursive dependencies when pasting into another document', async () => {
    addGradient('source-gradient', '#f00')
    addSymbol('source-symbol', 'url(#source-gradient)')
    const use = addUse('source-use', 'source-symbol')
    svgCanvas.selectOnly([use], true)
    svgCanvas.copySelectedElements()

    svgCanvas.clear()
    await svgCanvas.pasteElements('in_place')

    const pasted = svgCanvas.getSelectedElements()[0]
    const symbol = svgCanvas.getSvgContent().querySelector('#source-symbol')
    const gradient = svgCanvas.getSvgContent().querySelector('#source-gradient')

    expect(pasted.id).not.toBe('source-use')
    expect(pasted.getAttribute('href')).toBe('#source-symbol')
    expect(symbol).toBeTruthy()
    expect(symbol.querySelector('rect').getAttribute('fill')).toBe('url(#source-gradient)')
    expect(gradient.querySelector('stop').getAttribute('stop-color')).toBe('#f00')
  })

  it('reuses equivalent dependencies already present in the target', async () => {
    addGradient('equivalent-gradient', '#f00')
    addSymbol('equivalent-symbol', 'url(#equivalent-gradient)')
    const use = addUse('equivalent-use', 'equivalent-symbol')
    svgCanvas.selectOnly([use], true)
    svgCanvas.copySelectedElements()

    svgCanvas.clear()
    addGradient('equivalent-gradient', '#f00')
    addSymbol('equivalent-symbol', 'url(#equivalent-gradient)')
    await svgCanvas.pasteElements('in_place')

    expect(svgCanvas.getSvgContent().querySelectorAll('#equivalent-gradient')).toHaveLength(1)
    expect(svgCanvas.getSvgContent().querySelectorAll('#equivalent-symbol')).toHaveLength(1)
    expect(svgCanvas.getSelectedElements()[0].getAttribute('href')).toBe('#equivalent-symbol')
  })

  it('renames a different visual dependency and rewrites only incoming references', async () => {
    addGradient('shared-gradient', '#f00')
    const rect = svgCanvas.addSVGElementsFromJson({
      element: 'rect',
      attr: {
        id: 'gradient-rect',
        width: 20,
        height: 20,
        fill: 'url(#shared-gradient)'
      }
    })
    svgCanvas.selectOnly([rect], true)
    svgCanvas.copySelectedElements()

    svgCanvas.clear()
    const existing = addGradient('shared-gradient', '#00f')
    await svgCanvas.pasteElements('in_place')

    const pasted = svgCanvas.getSelectedElements()[0]
    const match = pasted.getAttribute('fill').match(/^url\(#(.+)\)$/)
    const importedId = match?.[1]

    expect(importedId).toBeTruthy()
    expect(importedId).not.toBe('shared-gradient')
    expect(existing.querySelector('stop').getAttribute('stop-color')).toBe('#00f')
    expect(svgCanvas.getSvgContent().querySelector(`#${importedId} stop`).getAttribute('stop-color')).toBe('#f00')
  })

  it('can reuse an existing direct use target after one conflict prompt', async () => {
    prepareUseConflict()
    let reportedConflicts
    svgCanvas.bind('resolveClipboardConflicts', (_win, info) => {
      reportedConflicts = info.conflicts
      return 'use-existing'
    })

    await svgCanvas.pasteElements('in_place')

    const pasted = svgCanvas.getSelectedElements()[0]
    expect(reportedConflicts).toEqual(['shared-symbol'])
    expect(pasted.getAttribute('href')).toBe('#shared-symbol')
    expect(svgCanvas.getSvgContent().querySelectorAll('symbol')).toHaveLength(1)
    expect(svgCanvas.getSvgContent().querySelector('#shared-symbol rect').getAttribute('fill')).toBe('#00f')
  })

  it('can keep both different direct use targets', async () => {
    prepareUseConflict()
    svgCanvas.bind('resolveClipboardConflicts', () => 'keep-both')

    await svgCanvas.pasteElements('in_place')

    const pasted = svgCanvas.getSelectedElements()[0]
    const importedId = pasted.getAttribute('href').slice(1)
    expect(importedId).not.toBe('shared-symbol')
    expect(svgCanvas.getSvgContent().querySelectorAll('symbol')).toHaveLength(2)
    expect(svgCanvas.getSvgContent().querySelector('#shared-symbol rect').getAttribute('fill')).toBe('#00f')
    expect(svgCanvas.getSvgContent().querySelector(`#${importedId} rect`).getAttribute('fill')).toBe('#f00')
  })

  it('can replace a direct use target as one undoable paste', async () => {
    prepareUseConflict()
    svgCanvas.bind('resolveClipboardConflicts', () => 'replace-existing')

    await svgCanvas.pasteElements('in_place')

    expect(svgCanvas.getSvgContent().querySelector('#shared-symbol rect').getAttribute('fill')).toBe('#f00')
    expect(svgCanvas.getSvgContent().querySelectorAll('use')).toHaveLength(1)

    svgCanvas.undoMgr.undo()
    expect(svgCanvas.getSvgContent().querySelector('#shared-symbol rect').getAttribute('fill')).toBe('#00f')
    expect(svgCanvas.getSvgContent().querySelectorAll('use')).toHaveLength(0)

    svgCanvas.undoMgr.redo()
    expect(svgCanvas.getSvgContent().querySelector('#shared-symbol rect').getAttribute('fill')).toBe('#f00')
    expect(svgCanvas.getSvgContent().querySelectorAll('use')).toHaveLength(1)
  })

  it('still accepts the legacy array clipboard format', async () => {
    sessionStorage.setItem(svgCanvas.getClipboardID(), JSON.stringify([{
      element: 'rect',
      attr: { id: 'legacy-rect', width: 10, height: 10 }
    }]))

    await svgCanvas.pasteElements('in_place')

    const pasted = svgCanvas.getSelectedElements()[0]
    expect(pasted.tagName).toBe('rect')
    expect(pasted.id).not.toBe('legacy-rect')
  })
})
