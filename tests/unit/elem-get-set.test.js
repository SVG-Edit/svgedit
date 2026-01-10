import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import * as history from '../../packages/svgcanvas/core/history.js'
import dataStorage from '../../packages/svgcanvas/core/dataStorage.js'
import { init as initElemGetSet } from '../../packages/svgcanvas/core/elem-get-set.js'
import * as undo from '../../packages/svgcanvas/core/undo.js'

const createSvgElement = (name) => {
  return document.createElementNS(NS.SVG, name)
}

describe('elem-get-set', () => {
  /** @type {any} */
  let canvas
  /** @type {any[]} */
  let historyStack
  /** @type {SVGSVGElement} */
  let svgContent

  beforeEach(() => {
    historyStack = []
    svgContent = /** @type {SVGSVGElement} */ (createSvgElement('svg'))
    canvas = {
      history,
      zoom: 1,
      contentW: 100,
      contentH: 100,
      selectorManager: {
        requestSelector () {
          return { resize () {} }
        }
      },
      pathActions: {
        zoomChange () {},
        clear () {}
      },
      runExtensions () {},
      call () {},
      getDOMDocument () { return document },
      getSvgContent () { return svgContent },
      getSelectedElements () { return this.selectedElements || [] },
      getDataStorage () { return dataStorage },
      getZoom () { return this.zoom },
      setZoom (value) { this.zoom = value },
      getResolution () {
        return {
          w: Number(svgContent.getAttribute('width')) / this.zoom,
          h: Number(svgContent.getAttribute('height')) / this.zoom,
          zoom: this.zoom
        }
      },
      addCommandToHistory (cmd) {
        historyStack.push(cmd)
      }
    }
    svgContent.setAttribute('width', '100')
    svgContent.setAttribute('height', '100')
    initElemGetSet(canvas)
  })

  afterEach(() => {
    while (svgContent.firstChild) {
      svgContent.firstChild.remove()
    }
  })

  it('setGroupTitle() inserts title and undo removes it', () => {
    const g = createSvgElement('g')
    svgContent.append(g)
    canvas.selectedElements = [g]

    canvas.setGroupTitle('Hello')
    expect(g.firstChild?.nodeName).toBe('title')
    expect(g.firstChild?.textContent).toBe('Hello')
    expect(historyStack).toHaveLength(1)

    historyStack[0].unapply(null)
    expect(g.querySelector('title')).toBeNull()

    historyStack[0].apply(null)
    expect(g.querySelector('title')?.textContent).toBe('Hello')
  })

  it('setGroupTitle() updates title text with undo/redo', () => {
    const g = createSvgElement('g')
    const title = createSvgElement('title')
    title.textContent = 'Old'
    g.append(title)
    svgContent.append(g)
    canvas.selectedElements = [g]

    canvas.setGroupTitle('New')
    expect(g.querySelector('title')?.textContent).toBe('New')
    expect(historyStack).toHaveLength(1)

    historyStack[0].unapply(null)
    expect(g.querySelector('title')?.textContent).toBe('Old')

    historyStack[0].apply(null)
    expect(g.querySelector('title')?.textContent).toBe('New')
  })

  it('setGroupTitle() removes title and undo restores it', () => {
    const g = createSvgElement('g')
    const title = createSvgElement('title')
    title.textContent = 'Label'
    g.append(title)
    svgContent.append(g)
    canvas.selectedElements = [g]

    canvas.setGroupTitle('')
    expect(g.querySelector('title')).toBeNull()
    expect(historyStack).toHaveLength(1)

    historyStack[0].unapply(null)
    expect(g.querySelector('title')?.textContent).toBe('Label')

    historyStack[0].apply(null)
    expect(g.querySelector('title')).toBeNull()
  })

  it('setDocumentTitle() inserts and removes title with undo/redo', () => {
    canvas.setDocumentTitle('Doc')
    const docTitle = svgContent.querySelector(':scope > title')
    expect(docTitle?.textContent).toBe('Doc')
    expect(historyStack).toHaveLength(1)

    historyStack[0].unapply(null)
    expect(svgContent.querySelector(':scope > title')).toBeNull()

    historyStack[0].apply(null)
    expect(svgContent.querySelector(':scope > title')?.textContent).toBe('Doc')
  })

  it('setDocumentTitle() does nothing when empty and no title exists', () => {
    canvas.setDocumentTitle('')
    expect(svgContent.querySelector(':scope > title')).toBeNull()
    expect(historyStack).toHaveLength(0)
  })

  it('setBBoxZoom() returns the computed zoom for zero-size bbox', () => {
    canvas.zoom = 1
    canvas.selectedElements = [createSvgElement('rect')]

    const bbox = { width: 0, height: 0, x: 0, y: 0, factor: 2 }
    const result = canvas.setBBoxZoom(bbox, 100, 100)

    expect(result?.zoom).toBe(2)
    expect(canvas.getZoom()).toBe(2)
  })

  it('setImageURL() records undo even when image fails to load', () => {
    const originalImage = globalThis.Image
    try {
      globalThis.Image = class FakeImage {
        constructor () {
          this.width = 10
          this.height = 10
          this.onload = null
          this.onerror = null
        }

        get src () {
          return this._src
        }

        set src (value) {
          this._src = value
          this.onerror && this.onerror(new Error('load failed'))
        }
      }

      const image = createSvgElement('image')
      image.setAttribute('href', 'old.png')
      svgContent.append(image)
      canvas.selectedElements = [image]

      canvas.setImageURL('bad.png')
      expect(image.getAttribute('href')).toBe('bad.png')
      expect(historyStack).toHaveLength(1)

      historyStack[0].unapply(null)
      expect(image.getAttribute('href')).toBe('old.png')

      historyStack[0].apply(null)
      expect(image.getAttribute('href')).toBe('bad.png')
    } finally {
      globalThis.Image = originalImage
    }
  })

  it('setRectRadius() preserves attribute absence on undo', () => {
    const rect = createSvgElement('rect')
    svgContent.append(rect)
    canvas.selectedElements = [rect]

    canvas.setRectRadius('5')
    expect(rect.getAttribute('rx')).toBe('5')
    expect(rect.getAttribute('ry')).toBe('5')
    expect(historyStack).toHaveLength(1)

    historyStack[0].unapply(null)
    expect(rect.hasAttribute('rx')).toBe(false)
    expect(rect.hasAttribute('ry')).toBe(false)
  })

  it('undo updates contentW/contentH for svgContent size changes', () => {
    const svg = createSvgElement('svg')

    const localCanvas = {
      contentW: 100,
      contentH: 100,
      getSvgContent () { return svg },
      clearSelection () {},
      pathActions: { clear () {} },
      call () {}
    }
    undo.init(localCanvas)

    svg.setAttribute('width', '200')
    svg.setAttribute('height', '150')
    localCanvas.contentW = 200
    localCanvas.contentH = 150
    const cmd = new history.ChangeElementCommand(svg, { width: 100, height: 100 })
    localCanvas.undoMgr.addCommandToHistory(cmd)

    localCanvas.undoMgr.undo()
    expect(localCanvas.contentW).toBe(100)
    expect(localCanvas.contentH).toBe(100)

    localCanvas.undoMgr.redo()
    expect(localCanvas.contentW).toBe(200)
    expect(localCanvas.contentH).toBe(150)
  })
})
