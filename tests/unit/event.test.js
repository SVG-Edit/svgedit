import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import { init as initEvent } from '../../packages/svgcanvas/core/event.js'

const createSvgElement = (name) => {
  return document.createElementNS(NS.SVG, name)
}

describe('event', () => {
  /** @type {HTMLDivElement} */
  let root
  /** @type {any} */
  let canvas
  /** @type {HTMLDivElement} */
  let svgcanvas
  /** @type {SVGSVGElement} */
  let svgcontent
  /** @type {SVGGElement} */
  let contentGroup
  /** @type {SVGRectElement} */
  let rubberBox

  beforeEach(() => {
    root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)

    svgcanvas = document.createElement('div')
    svgcanvas.id = 'svgcanvas'
    root.append(svgcanvas)

    svgcontent = /** @type {SVGSVGElement} */ (createSvgElement('svg'))
    svgcontent.id = 'svgcontent'
    root.append(svgcontent)

    contentGroup = /** @type {SVGGElement} */ (createSvgElement('g'))
    svgcontent.append(contentGroup)

    contentGroup.getScreenCTM = () => ({
      inverse: () => ({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0
      })
    })

    Object.defineProperty(contentGroup, 'transform', {
      value: { baseVal: { numberOfItems: 0 } },
      configurable: true
    })

    rubberBox = /** @type {SVGRectElement} */ (createSvgElement('rect'))

    canvas = {
      spaceKey: false,
      started: false,
      rootSctm: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      rubberBox: null,
      selectorManager: {
        selectorParentGroup: createSvgElement('g'),
        getRubberBandBox () {
          return rubberBox
        }
      },
      $id (id) {
        return document.getElementById(id)
      },
      getDataStorage () {
        return { get () {} }
      },
      getSelectedElements () {
        return []
      },
      getZoom () {
        return 1
      },
      getStyle () {
        return { opacity: 1 }
      },
      getSvgRoot () {
        return svgcontent
      },
      getCurConfig () {
        return { gridSnapping: false, showRulers: false }
      },
      setRootSctm (m) {
        this.rootSctm = m
      },
      getrootSctm () {
        return this.rootSctm
      },
      getStarted () {
        return this.started
      },
      setStarted (started) {
        this.started = started
      },
      setStartX (x) {
        this.startX = x
      },
      setStartY (y) {
        this.startY = y
      },
      getStartX () {
        return this.startX
      },
      getStartY () {
        return this.startY
      },
      setRStartX (x) {
        this.rStartX = x
      },
      setRStartY (y) {
        this.rStartY = y
      },
      getMouseTarget () {
        return contentGroup
      },
      getCurrentMode () {
        return this.currentMode || 'zoom'
      },
      setCurrentMode (mode) {
        this.currentMode = mode
      },
      setMode () {},
      setLastClickPoint () {},
      setStartTransform () {},
      clearSelection () {},
      setCurrentResizeMode () {},
      setJustSelected () {},
      pathActions: {
        clear () {}
      },
      setRubberBox (box) {
        this.rubberBox = box
      },
      getRubberBox () {
        return this.rubberBox
      },
      runExtensions () {
        return []
      }
    }

    initEvent(canvas)
  })

  afterEach(() => {
    root.remove()
  })

  it('mouseDownEvent() zoom mode uses clientY for rubberbox y', () => {
    canvas.setCurrentMode('zoom')
    canvas.mouseDownEvent({
      clientX: 10,
      clientY: 20,
      button: 0,
      altKey: false,
      shiftKey: false,
      preventDefault () {},
      target: contentGroup
    })

    expect(rubberBox.getAttribute('x')).toBe('10')
    expect(rubberBox.getAttribute('y')).toBe('20')
  })

  it('mouseOutEvent() dispatches mouseup with coordinates', () => {
    canvas.setCurrentMode('rect')
    canvas.setStarted(true)

    /** @type {{ x: number, y: number }|null} */
    let received = null
    svgcanvas.addEventListener('mouseup', (evt) => {
      received = { x: evt.clientX, y: evt.clientY }
    })

    canvas.mouseOutEvent(new MouseEvent('mouseleave', { clientX: 15, clientY: 25 }))

    expect(received).toEqual({ x: 15, y: 25 })
  })

  it('mouseDownEvent() returns early if root group is missing', () => {
    while (svgcontent.firstChild) {
      svgcontent.firstChild.remove()
    }
    expect(() => {
      canvas.mouseDownEvent({ button: 0 })
    }).not.toThrow()
  })
})
