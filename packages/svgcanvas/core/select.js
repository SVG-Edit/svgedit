/**
 * DOM element selection box tools.
 * @module select
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { isWebkit } from '../common/browser.js'
import { getRotationAngle, getBBox, getStrokedBBox } from './utilities.js'
import { transformListToTransform, transformBox, transformPoint, matrixMultiply } from './math.js'
import { NS } from './namespaces'

let svgCanvas
let selectorManager_ // A Singleton
// change radius if touch screen
const gripRadius = window.ontouchstart ? 10 : 4

/**
* Private class for DOM element selection boxes.
*/
export class Selector {
  /**
  * @param {Integer} id - Internally identify the selector
  * @param {Element} elem - DOM element associated with this selector
  * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for initialization (prevents duplicate `getBBox` call).
  */
  constructor (id, elem, bbox) {
    // this is the selector's unique number
    this.id = id

    // this holds a reference to the element for which this selector is being used
    this.selectedElement = elem

    // this is a flag used internally to track whether the selector is being used or not
    this.locked = true

    // this holds a reference to the <g> element that holds all visual elements of the selector
    this.selectorGroup = svgCanvas.createSVGElement({
      element: 'g',
      attr: { id: ('selectorGroup' + this.id) }
    })

    // this holds a reference to the path rect
    this.selectorRect = svgCanvas.createSVGElement({
      element: 'path',
      attr: {
        id: ('selectedBox' + this.id),
        fill: 'none',
        stroke: '#22C',
        'stroke-width': '1',
        'stroke-dasharray': '5,5',
        // need to specify this so that the rect is not selectable
        style: 'pointer-events:none'
      }
    })
    this.selectorGroup.append(this.selectorRect)

    // this holds a reference to the grip coordinates for this selector
    this.gripCoords = {
      nw: null,
      n: null,
      ne: null,
      e: null,
      se: null,
      s: null,
      sw: null,
      w: null
    }

    this.reset(this.selectedElement, bbox)
  }

  /**
  * Used to reset the id and element that the selector is attached to.
  * @param {Element} e - DOM element associated with this selector
  * @param {module:utilities.BBoxObject} bbox - Optional bbox to use for reset (prevents duplicate getBBox call).
  * @returns {void}
  */
  reset (e, bbox) {
    this.locked = true
    this.selectedElement = e
    this.resize(bbox)
    this.selectorGroup.setAttribute('display', 'inline')
  }

  /**
  * Show the resize grips of this selector.
  * @param {boolean} show - Indicates whether grips should be shown or not
  * @returns {void}
  */
  showGrips (show) {
    const bShow = show ? 'inline' : 'none'
    selectorManager_.selectorGripsGroup.setAttribute('display', bShow)
    const elem = this.selectedElement
    this.hasGrips = show
    if (elem && show) {
      this.selectorGroup.append(selectorManager_.selectorGripsGroup)
      Selector.updateGripCursors(getRotationAngle(elem))
    }
  }

  /**
  * Updates the selector to match the element's size.
  * @param {module:utilities.BBoxObject} [bbox] - BBox to use for resize (prevents duplicate getBBox call).
  * @returns {void}
  */
  resize (bbox) {
    const dataStorage = svgCanvas.getDataStorage()
    const selectedBox = this.selectorRect
    const mgr = selectorManager_
    const selectedGrips = mgr.selectorGrips
    const selected = this.selectedElement
    const zoom = svgCanvas.getZoom()
    let offset = 1 / zoom
    const sw = selected.getAttribute('stroke-width')
    if (selected.getAttribute('stroke') !== 'none' && !isNaN(sw)) {
      offset += (sw / 2)
    }

    const { tagName } = selected
    if (tagName === 'text') {
      offset += 2 / zoom
    }

    // find the transformations applied to the parent of the selected element
    const svg = document.createElementNS(NS.SVG, 'svg')
    let parentTransformationMatrix = svg.createSVGMatrix()
    let currentElt = selected
    while (currentElt.parentNode) {
      if (currentElt.parentNode && currentElt.parentNode.tagName === 'g' && currentElt.parentNode.transform) {
        if (currentElt.parentNode.transform.baseVal.numberOfItems) {
          parentTransformationMatrix = matrixMultiply(transformListToTransform(selected.parentNode.transform.baseVal).matrix, parentTransformationMatrix)
        }
      }
      currentElt = currentElt.parentNode
    }

    // loop and transform our bounding box until we reach our first rotation
    const tlist = selected.transform.baseVal

    // combines the parent transformation with that of the selected element if necessary
    const m = parentTransformationMatrix ? matrixMultiply(parentTransformationMatrix, transformListToTransform(tlist).matrix) : transformListToTransform(tlist).matrix

    // This should probably be handled somewhere else, but for now
    // it keeps the selection box correctly positioned when zoomed
    m.e *= zoom
    m.f *= zoom

    if (!bbox) {
      bbox = getBBox(selected)
    }
    // TODO: getBBox (previous line) already knows to call getStrokedBBox when tagName === 'g'. Remove this?
    // TODO: getBBox doesn't exclude 'gsvg' and calls getStrokedBBox for any 'g'. Should getBBox be updated?
    if (tagName === 'g' && !dataStorage.has(selected, 'gsvg')) {
      // The bbox for a group does not include stroke vals, so we
      // get the bbox based on its children.
      const strokedBbox = getStrokedBBox([selected.childNodes])
      if (strokedBbox) {
        bbox = strokedBbox
      }
    }

    if (bbox) {
      // apply the transforms
      const l = bbox.x; const t = bbox.y; const w = bbox.width; const h = bbox.height
      // bbox = {x: l, y: t, width: w, height: h}; // Not in use

      // we need to handle temporary transforms too
      // if skewed, get its transformed box, then find its axis-aligned bbox

      // *
      offset *= zoom

      const nbox = transformBox(l * zoom, t * zoom, w * zoom, h * zoom, m)
      const { aabox } = nbox
      let nbax = aabox.x - offset
      let nbay = aabox.y - offset
      let nbaw = aabox.width + (offset * 2)
      let nbah = aabox.height + (offset * 2)

      // now if the shape is rotated, un-rotate it
      const cx = nbax + nbaw / 2
      const cy = nbay + nbah / 2

      const angle = getRotationAngle(selected)
      if (angle) {
        const rot = svgCanvas.getSvgRoot().createSVGTransform()
        rot.setRotate(-angle, cx, cy)
        const rotm = rot.matrix
        nbox.tl = transformPoint(nbox.tl.x, nbox.tl.y, rotm)
        nbox.tr = transformPoint(nbox.tr.x, nbox.tr.y, rotm)
        nbox.bl = transformPoint(nbox.bl.x, nbox.bl.y, rotm)
        nbox.br = transformPoint(nbox.br.x, nbox.br.y, rotm)

        // calculate the axis-aligned bbox
        const { tl } = nbox
        let minx = tl.x
        let miny = tl.y
        let maxx = tl.x
        let maxy = tl.y

        const { min, max } = Math

        minx = min(minx, min(nbox.tr.x, min(nbox.bl.x, nbox.br.x))) - offset
        miny = min(miny, min(nbox.tr.y, min(nbox.bl.y, nbox.br.y))) - offset
        maxx = max(maxx, max(nbox.tr.x, max(nbox.bl.x, nbox.br.x))) + offset
        maxy = max(maxy, max(nbox.tr.y, max(nbox.bl.y, nbox.br.y))) + offset

        nbax = minx
        nbay = miny
        nbaw = (maxx - minx)
        nbah = (maxy - miny)
      }

      const dstr = 'M' + nbax + ',' + nbay +
        ' L' + (nbax + nbaw) + ',' + nbay +
        ' ' + (nbax + nbaw) + ',' + (nbay + nbah) +
        ' ' + nbax + ',' + (nbay + nbah) + 'z'

      const xform = angle ? 'rotate(' + [angle, cx, cy].join(',') + ')' : ''

      // TODO(codedread): Is this needed?
      //  if (selected === selectedElements[0]) {
      this.gripCoords = {
        nw: [nbax, nbay],
        ne: [nbax + nbaw, nbay],
        sw: [nbax, nbay + nbah],
        se: [nbax + nbaw, nbay + nbah],
        n: [nbax + (nbaw) / 2, nbay],
        w: [nbax, nbay + (nbah) / 2],
        e: [nbax + nbaw, nbay + (nbah) / 2],
        s: [nbax + (nbaw) / 2, nbay + nbah]
      }
      selectedBox.setAttribute('d', dstr)
      this.selectorGroup.setAttribute('transform', xform)
      Object.entries(this.gripCoords).forEach(([dir, coords]) => {
        selectedGrips[dir].setAttribute('cx', coords[0])
        selectedGrips[dir].setAttribute('cy', coords[1])
      })

      // we want to go 20 pixels in the negative transformed y direction, ignoring scale
      mgr.rotateGripConnector.setAttribute('x1', nbax + (nbaw) / 2)
      mgr.rotateGripConnector.setAttribute('y1', nbay)
      mgr.rotateGripConnector.setAttribute('x2', nbax + (nbaw) / 2)
      mgr.rotateGripConnector.setAttribute('y2', nbay - (gripRadius * 5))

      mgr.rotateGrip.setAttribute('cx', nbax + (nbaw) / 2)
      mgr.rotateGrip.setAttribute('cy', nbay - (gripRadius * 5))
    }
  }

  // STATIC methods
  /**
  * Updates cursors for corner grips on rotation so arrows point the right way.
  * @param {Float} angle - Current rotation angle in degrees
  * @returns {void}
  */
  static updateGripCursors (angle) {
    const dirArr = Object.keys(selectorManager_.selectorGrips)
    let steps = Math.round(angle / 45)
    if (steps < 0) { steps += 8 }
    while (steps > 0) {
      dirArr.push(dirArr.shift())
      steps--
    }
    Object.values(selectorManager_.selectorGrips).forEach((gripElement, i) => {
      gripElement.setAttribute('style', ('cursor:' + dirArr[i] + '-resize'))
    })
  }
}

/**
* Manage all selector objects (selection boxes).
*/
export class SelectorManager {
  /**
   * Sets up properties and calls `initGroup`.
   */
  constructor () {
    // this will hold the <g> element that contains all selector rects/grips
    this.selectorParentGroup = null

    // this is a special rect that is used for multi-select
    this.rubberBandBox = null

    // this will hold objects of type Selector (see above)
    this.selectors = []

    // this holds a map of SVG elements to their Selector object
    this.selectorMap = {}

    // this holds a reference to the grip elements
    this.selectorGrips = {
      nw: null,
      n: null,
      ne: null,
      e: null,
      se: null,
      s: null,
      sw: null,
      w: null
    }

    this.selectorGripsGroup = null
    this.rotateGripConnector = null
    this.rotateGrip = null

    this.initGroup()
  }

  /**
  * Resets the parent selector group element.
  * @returns {void}
  */
  initGroup () {
    const dataStorage = svgCanvas.getDataStorage()
    // remove old selector parent group if it existed
    if (this.selectorParentGroup?.parentNode) {
      this.selectorParentGroup.remove()
    }

    // create parent selector group and add it to svgroot
    this.selectorParentGroup = svgCanvas.createSVGElement({
      element: 'g',
      attr: { id: 'selectorParentGroup' }
    })
    this.selectorGripsGroup = svgCanvas.createSVGElement({
      element: 'g',
      attr: { display: 'none' }
    })
    this.selectorParentGroup.append(this.selectorGripsGroup)
    svgCanvas.getSvgRoot().append(this.selectorParentGroup)

    this.selectorMap = {}
    this.selectors = []
    this.rubberBandBox = null

    // add the corner grips
    Object.keys(this.selectorGrips).forEach((dir) => {
      const grip = svgCanvas.createSVGElement({
        element: 'circle',
        attr: {
          id: ('selectorGrip_resize_' + dir),
          fill: '#22C',
          r: gripRadius,
          style: ('cursor:' + dir + '-resize'),
          // This expands the mouse-able area of the grips making them
          // easier to grab with the mouse.
          // This works in Opera and WebKit, but does not work in Firefox
          // see https://bugzilla.mozilla.org/show_bug.cgi?id=500174
          'stroke-width': 2,
          'pointer-events': 'all'
        }
      })

      dataStorage.put(grip, 'dir', dir)
      dataStorage.put(grip, 'type', 'resize')
      this.selectorGrips[dir] = grip
      this.selectorGripsGroup.append(grip)
    })

    // add rotator elems
    this.rotateGripConnector =
      svgCanvas.createSVGElement({
        element: 'line',
        attr: {
          id: ('selectorGrip_rotateconnector'),
          stroke: '#22C',
          'stroke-width': '1'
        }
      })
    this.selectorGripsGroup.append(this.rotateGripConnector)

    this.rotateGrip =
      svgCanvas.createSVGElement({
        element: 'circle',
        attr: {
          id: 'selectorGrip_rotate',
          fill: 'lime',
          r: gripRadius,
          stroke: '#22C',
          'stroke-width': 2,
          style: `cursor:url(${svgCanvas.curConfig.imgPath}/rotate.svg) 12 12, auto;`
        }
      })
    this.selectorGripsGroup.append(this.rotateGrip)
    dataStorage.put(this.rotateGrip, 'type', 'rotate')

    if (document.getElementById('canvasBackground')) { return }

    const [width, height] = svgCanvas.curConfig.dimensions
    const canvasbg = svgCanvas.createSVGElement({
      element: 'svg',
      attr: {
        id: 'canvasBackground',
        width,
        height,
        x: 0,
        y: 0,
        overflow: (isWebkit() ? 'none' : 'visible'), // Chrome 7 has a problem with this when zooming out
        style: 'pointer-events:none'
      }
    })

    const rect = svgCanvas.createSVGElement({
      element: 'rect',
      attr: {
        width: '100%',
        height: '100%',
        x: 0,
        y: 0,
        'stroke-width': 1,
        stroke: '#000',
        fill: '#FFF',
        style: 'pointer-events:none'
      }
    })
    canvasbg.append(rect)
    svgCanvas.getSvgRoot().insertBefore(canvasbg, svgCanvas.getSvgContent())
  }

  /**
  *
  * @param {Element} elem - DOM element to get the selector for
  * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for reset (prevents duplicate getBBox call).
  * @returns {Selector} The selector based on the given element
  */
  requestSelector (elem, bbox) {
    if (!elem) { return null }

    const N = this.selectors.length
    // If we've already acquired one for this element, return it.
    if (typeof this.selectorMap[elem.id] === 'object') {
      this.selectorMap[elem.id].locked = true
      return this.selectorMap[elem.id]
    }
    for (let i = 0; i < N; ++i) {
      if (!this.selectors[i]?.locked) {
        this.selectors[i].locked = true
        this.selectors[i].reset(elem, bbox)
        this.selectorMap[elem.id] = this.selectors[i]
        return this.selectors[i]
      }
    }
    // if we reached here, no available selectors were found, we create one
    this.selectors[N] = new Selector(N, elem, bbox)
    this.selectorParentGroup.append(this.selectors[N].selectorGroup)
    this.selectorMap[elem.id] = this.selectors[N]
    return this.selectors[N]
  }

  /**
  * Removes the selector of the given element (hides selection box).
  *
  * @param {Element} elem - DOM element to remove the selector for
  * @returns {void}
  */
  releaseSelector (elem) {
    if (!elem) { return }
    const N = this.selectors.length
    const sel = this.selectorMap[elem.id]
    if (!sel?.locked) {
      // TODO(codedread): Ensure this exists in this module.
      console.warn('WARNING! selector was released but was already unlocked')
    }
    for (let i = 0; i < N; ++i) {
      if (this.selectors[i] && this.selectors[i] === sel) {
        delete this.selectorMap[elem.id]
        sel.locked = false
        sel.selectedElement = null
        sel.showGrips(false)

        // remove from DOM and store reference in JS but only if it exists in the DOM
        try {
          sel.selectorGroup.setAttribute('display', 'none')
        } catch (e) { /* empty fn */ }

        break
      }
    }
  }

  /**
  * @returns {SVGRectElement} The rubberBandBox DOM element. This is the rectangle drawn by
  * the user for selecting/zooming
  */
  getRubberBandBox () {
    if (!this.rubberBandBox) {
      this.rubberBandBox =
        svgCanvas.createSVGElement({
          element: 'rect',
          attr: {
            id: 'selectorRubberBand',
            fill: '#22C',
            'fill-opacity': 0.15,
            stroke: '#22C',
            'stroke-width': 0.5,
            display: 'none',
            style: 'pointer-events:none'
          }
        })
      this.selectorParentGroup.append(this.rubberBandBox)
    }
    return this.rubberBandBox
  }
}

/**
 * An object that creates SVG elements for the canvas.
 *
 * @interface module:select.SVGFactory
 */
/**
 * @function module:select.SVGFactory#createSVGElement
 * @param {module:utilities.EditorContext#addSVGElementsFromJson} jsonMap
 * @returns {SVGElement}
 */
/**
 * @function module:select.SVGFactory#svgRoot
 * @returns {SVGSVGElement}
 */
/**
 * @function module:select.SVGFactory#svgContent
 * @returns {SVGSVGElement}
 */
/**
 * @function module:select.SVGFactory#getZoom
 * @returns {Float} The current zoom level
 */

/**
 * @typedef {GenericArray} module:select.Dimensions
 * @property {Integer} length 2
 * @property {Float} 0 Width
 * @property {Float} 1 Height
 */
/**
 * @typedef {PlainObject} module:select.Config
 * @property {string} imgPath
 * @property {module:select.Dimensions} dimensions
 */

/**
 * Initializes this module.
 * @function module:select.init
 * @param {module:select.Config} config - An object containing configurable parameters (imgPath)
 * @param {module:select.SVGFactory} svgFactory - An object implementing the SVGFactory interface.
 * @returns {void}
 */
export const init = (canvas) => {
  svgCanvas = canvas
  selectorManager_ = new SelectorManager()
}

/**
 * @function module:select.getSelectorManager
 * @returns {module:select.SelectorManager} The SelectorManager instance.
 */
export const getSelectorManager = () => selectorManager_
