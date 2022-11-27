/**
 * Path functionality.
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import { shortFloat } from './units.js'
import { transformPoint } from './math.js'
import {
  getRotationAngle, getBBox,
  getRefElem, findDefs,
  getBBox as utilsGetBBox
} from './utilities.js'
import {
  init as pathMethodInit, ptObjToArrMethod, getGripPtMethod,
  getPointFromGripMethod, addPointGripMethod, getGripContainerMethod, addCtrlGripMethod,
  getCtrlLineMethod, getPointGripMethod, getControlPointsMethod, replacePathSegMethod,
  getSegSelectorMethod, Path
} from './path-method.js'
import {
  init as pathActionsInit, pathActionsMethod
} from './path-actions.js'

const segData = {
  2: ['x', 'y'], // PATHSEG_MOVETO_ABS
  4: ['x', 'y'], // PATHSEG_LINETO_ABS
  6: ['x', 'y', 'x1', 'y1', 'x2', 'y2'], // PATHSEG_CURVETO_CUBIC_ABS
  8: ['x', 'y', 'x1', 'y1'], // PATHSEG_CURVETO_QUADRATIC_ABS
  10: ['x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag'], // PATHSEG_ARC_ABS
  12: ['x'], // PATHSEG_LINETO_HORIZONTAL_ABS
  14: ['y'], // PATHSEG_LINETO_VERTICAL_ABS
  16: ['x', 'y', 'x2', 'y2'], // PATHSEG_CURVETO_CUBIC_SMOOTH_ABS
  18: ['x', 'y'] // PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS
}

let svgCanvas
/**
 * @tutorial LocaleDocs
 * @typedef {module:locale.LocaleStrings|PlainObject} module:path.uiStrings
 * @property {PlainObject<string, string>} ui
*/

const uiStrings = {}
/**
* @function module:path.setUiStrings
* @param {module:path.uiStrings} strs
* @returns {void}
*/
export const setUiStrings = (strs) => {
  Object.assign(uiStrings, strs.ui)
}

let pathFuncs = []

let linkControlPts = true

// Stores references to paths via IDs.
// TODO: Make this cross-document happy.
let pathData = {}

/**
* @function module:path.setLinkControlPoints
* @param {boolean} lcp
* @returns {void}
*/
export const setLinkControlPoints = (lcp) => {
  linkControlPts = lcp
}

/**
 * @name module:path.path
 * @type {null|module:path.Path}
 * @memberof module:path
*/
export let path = null

/**
* @external MouseEvent
*/

/**
* Object with the following keys/values.
* @typedef {PlainObject} module:path.SVGElementJSON
* @property {string} element - Tag name of the SVG element to create
* @property {PlainObject<string, string>} attr - Has key-value attributes to assign to the new element.
*   An `id` should be set so that {@link module:utilities.EditorContext#addSVGElementsFromJson} can later re-identify the element for modification or replacement.
* @property {boolean} [curStyles=false] - Indicates whether current style attributes should be applied first
* @property {module:path.SVGElementJSON[]} [children] - Data objects to be added recursively as children
* @property {string} [namespace="http://www.w3.org/2000/svg"] - Indicate a (non-SVG) namespace
*/
/**
 * @interface module:path.EditorContext
 * @property {module:select.SelectorManager} selectorManager
 * @property {module:svgcanvas.SvgCanvas} canvas
 */
/**
 * @function module:path.EditorContext#call
 * @param {"selected"|"changed"} ev - String with the event name
 * @param {module:svgcanvas.SvgCanvas#event:selected|module:svgcanvas.SvgCanvas#event:changed} arg - Argument to pass through to the callback function.
 *  If the event is "changed", an array of `Element`s is passed; if "selected", a single-item array of `Element` is passed.
 * @returns {void}
 */
/**
 * Note: This doesn't round to an integer necessarily.
 * @function module:path.EditorContext#round
 * @param {Float} val
 * @returns {Float} Rounded value to nearest value based on `zoom`
 */
/**
 * @function module:path.EditorContext#clearSelection
 * @param {boolean} [noCall] - When `true`, does not call the "selected" handler
 * @returns {void}
*/
/**
 * @function module:path.EditorContext#addToSelection
 * @param {Element[]} elemsToAdd - An array of DOM elements to add to the selection
 * @param {boolean} showGrips - Indicates whether the resize grips should be shown
 * @returns {void}
*/
/**
 * @function module:path.EditorContext#addCommandToHistory
 * @param {Command} cmd
 * @returns {void}
 */
/**
 * @function module:path.EditorContext#remapElement
 * @param {Element} selected - DOM element to be changed
 * @param {PlainObject<string, string>} changes - Object with changes to be remapped
 * @param {SVGMatrix} m - Matrix object to use for remapping coordinates
 * @returns {void}
 */
/**
 * @function module:path.EditorContext#addSVGElementsFromJson
 * @param {module:path.SVGElementJSON} data
 * @returns {Element} The new element
*/
/**
 * @function module:path.EditorContext#getGridSnapping
 * @returns {boolean}
 */
/**
 * @function module:path.EditorContext#getOpacity
 * @returns {Float}
 */
/**
 * @function module:path.EditorContext#getSelectedElements
 * @returns {Element[]} the array with selected DOM elements
*/
/**
 * @function module:path.EditorContext#getContainer
 * @returns {Element}
 */
/**
 * @function module:path.EditorContext#setStarted
 * @param {boolean} s
 * @returns {void}
 */
/**
 * @function module:path.EditorContext#getRubberBox
 * @returns {SVGRectElement}
*/
/**
 * @function module:path.EditorContext#setRubberBox
 * @param {SVGRectElement} rb
 * @returns {SVGRectElement} Same as parameter passed in
 */
/**
 * @function module:path.EditorContext#addPtsToSelection
 * @param {PlainObject} cfg
 * @param {boolean} cfg.closedSubpath
 * @param {SVGCircleElement[]} cfg.grips
 * @returns {void}
 */
/**
 * @function module:path.EditorContext#endChanges
 * @param {PlainObject} cfg
 * @param {string} cfg.cmd
 * @param {Element} cfg.elem
 * @returns {void}
*/
/**
 * @function module:path.EditorContext#getZoom
 * @returns {Float} The current zoom level
 */
/**
 * Returns the last created DOM element ID string.
 * @function module:path.EditorContext#getId
 * @returns {string}
 */
/**
 * Creates and returns a unique ID string for a DOM element.
 * @function module:path.EditorContext#getNextId
 * @returns {string}
*/
/**
 * Gets the desired element from a mouse event.
 * @function module:path.EditorContext#getMouseTarget
 * @param {external:MouseEvent} evt - Event object from the mouse event
 * @returns {Element} DOM element we want
 */
/**
 * @function module:path.EditorContext#getCurrentMode
 * @returns {string}
 */
/**
 * @function module:path.EditorContext#setCurrentMode
 * @param {string} cm The mode
 * @returns {string} The same mode as passed in
*/
/**
 * @function module:path.EditorContext#setDrawnPath
 * @param {SVGPathElement|null} dp
 * @returns {SVGPathElement|null} The same value as passed in
 */
/**
 * @function module:path.EditorContext#getSvgRoot
 * @returns {SVGSVGElement}
*/

/**
* @function module:path.init
* @param {module:path.EditorContext} editorContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
  svgCanvas.replacePathSeg = replacePathSegMethod
  svgCanvas.addPointGrip = addPointGripMethod
  svgCanvas.removePath_ = removePath_
  svgCanvas.getPath_ = getPath_
  svgCanvas.addCtrlGrip = addCtrlGripMethod
  svgCanvas.getCtrlLine = getCtrlLineMethod
  svgCanvas.getGripPt = getGripPt
  svgCanvas.getPointFromGrip = getPointFromGripMethod
  svgCanvas.setLinkControlPoints = setLinkControlPoints
  svgCanvas.reorientGrads = reorientGrads
  svgCanvas.getSegData = () => { return segData }
  svgCanvas.getUIStrings = () => { return uiStrings }
  svgCanvas.getPathObj = () => { return path }
  svgCanvas.setPathObj = (obj) => { path = obj }
  svgCanvas.getPathFuncs = () => { return pathFuncs }
  svgCanvas.getLinkControlPts = () => { return linkControlPts }
  pathFuncs = [0, 'ClosePath']
  const pathFuncsStrs = [
    'Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
    'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'
  ]
  pathFuncsStrs.forEach((s) => {
    pathFuncs.push(s + 'Abs')
    pathFuncs.push(s + 'Rel')
  })
  pathActionsInit(svgCanvas)
  pathMethodInit(svgCanvas)
}

/* eslint-disable max-len */
/**
* @function module:path.ptObjToArr
* @todo See if this should just live in `replacePathSeg`
* @param {string} type
* @param {SVGPathSegMovetoAbs|SVGPathSegLinetoAbs|SVGPathSegCurvetoCubicAbs|SVGPathSegCurvetoQuadraticAbs|SVGPathSegArcAbs|SVGPathSegLinetoHorizontalAbs|SVGPathSegLinetoVerticalAbs|SVGPathSegCurvetoCubicSmoothAbs|SVGPathSegCurvetoQuadraticSmoothAbs} segItem
* @returns {ArgumentsArray}
*/
/* eslint-enable max-len */
export const ptObjToArr = ptObjToArrMethod

/**
* @function module:path.getGripPt
* @param {Segment} seg
* @param {module:math.XYObject} altPt
* @returns {module:math.XYObject}
*/
export const getGripPt = getGripPtMethod

/**
* @function module:path.getPointFromGrip
* @param {module:math.XYObject} pt
* @param {module:path.Path} pth
* @returns {module:math.XYObject}
*/
export const getPointFromGrip = getPointFromGripMethod

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addPointGrip
* @param {Integer} index
* @param {Integer} x
* @param {Integer} y
* @returns {SVGCircleElement}
*/
export const addPointGrip = addPointGripMethod

/**
* @function module:path.getGripContainer
* @returns {Element}
*/
export const getGripContainer = getGripContainerMethod

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addCtrlGrip
* @param {string} id
* @returns {SVGCircleElement}
*/
export const addCtrlGrip = addCtrlGripMethod

/**
* @function module:path.getCtrlLine
* @param {string} id
* @returns {SVGLineElement}
*/
export const getCtrlLine = getCtrlLineMethod

/**
* @function module:path.getPointGrip
* @param {Segment} seg
* @param {boolean} update
* @returns {SVGCircleElement}
*/
export const getPointGrip = getPointGripMethod

/**
* @function module:path.getControlPoints
* @param {Segment} seg
* @returns {PlainObject<string, SVGLineElement|SVGCircleElement>}
*/
export const getControlPoints = getControlPointsMethod

/**
* This replaces the segment at the given index. Type is given as number.
* @function module:path.replacePathSeg
* @param {Integer} type Possible values set during {@link module:path.init}
* @param {Integer} index
* @param {ArgumentsArray} pts
* @param {SVGPathElement} elem
* @returns {void}
*/
export const replacePathSeg = replacePathSegMethod

/**
* @function module:path.getSegSelector
* @param {Segment} seg
* @param {boolean} update
* @returns {SVGPathElement}
*/
export const getSegSelector = getSegSelectorMethod

/**
 * @typedef {PlainObject} Point
 * @property {Integer} x The x value
 * @property {Integer} y The y value
 */

/**
* Takes three points and creates a smoother line based on them.
* @function module:path.smoothControlPoints
* @param {Point} ct1 - Object with x and y values (first control point)
* @param {Point} ct2 - Object with x and y values (second control point)
* @param {Point} pt - Object with x and y values (third point)
* @returns {Point[]} Array of two "smoothed" point objects
*/
export const smoothControlPoints = (ct1, ct2, pt) => {
  // each point must not be the origin
  const x1 = ct1.x - pt.x
  const y1 = ct1.y - pt.y
  const x2 = ct2.x - pt.x
  const y2 = ct2.y - pt.y

  if ((x1 !== 0 || y1 !== 0) && (x2 !== 0 || y2 !== 0)) {
    const
      r1 = Math.sqrt(x1 * x1 + y1 * y1)
    const r2 = Math.sqrt(x2 * x2 + y2 * y2)
    const nct1 = svgCanvas.getSvgRoot().createSVGPoint()
    const nct2 = svgCanvas.getSvgRoot().createSVGPoint()
    let anglea = Math.atan2(y1, x1)
    let angleb = Math.atan2(y2, x2)
    if (anglea < 0) { anglea += 2 * Math.PI }
    if (angleb < 0) { angleb += 2 * Math.PI }

    const angleBetween = Math.abs(anglea - angleb)
    const angleDiff = Math.abs(Math.PI - angleBetween) / 2

    let newAnglea; let newAngleb
    if (anglea - angleb > 0) {
      newAnglea = angleBetween < Math.PI ? (anglea + angleDiff) : (anglea - angleDiff)
      newAngleb = angleBetween < Math.PI ? (angleb - angleDiff) : (angleb + angleDiff)
    } else {
      newAnglea = angleBetween < Math.PI ? (anglea - angleDiff) : (anglea + angleDiff)
      newAngleb = angleBetween < Math.PI ? (angleb + angleDiff) : (angleb - angleDiff)
    }

    // rotate the points
    nct1.x = r1 * Math.cos(newAnglea) + pt.x
    nct1.y = r1 * Math.sin(newAnglea) + pt.y
    nct2.x = r2 * Math.cos(newAngleb) + pt.x
    nct2.y = r2 * Math.sin(newAngleb) + pt.y

    return [nct1, nct2]
  }
  return undefined
}

/**
* @function module:path.getPath_
* @param {SVGPathElement} elem
* @returns {module:path.Path}
*/
export const getPath_ = (elem) => {
  let p = pathData[elem.id]
  if (!p) {
    p = pathData[elem.id] = new Path(elem)
  }
  return p
}

/**
* @function module:path.removePath_
* @param {string} id
* @returns {void}
*/
export const removePath_ = (id) => {
  if (id in pathData) { delete pathData[id] }
}

let newcx; let newcy; let oldcx; let oldcy; let angle

const getRotVals = (x, y) => {
  let dx = x - oldcx
  let dy = y - oldcy

  // rotate the point around the old center
  let r = Math.sqrt(dx * dx + dy * dy)
  let theta = Math.atan2(dy, dx) + angle
  dx = r * Math.cos(theta) + oldcx
  dy = r * Math.sin(theta) + oldcy

  // dx,dy should now hold the actual coordinates of each
  // point after being rotated

  // now we want to rotate them around the new center in the reverse direction
  dx -= newcx
  dy -= newcy

  r = Math.sqrt(dx * dx + dy * dy)
  theta = Math.atan2(dy, dx) - angle

  return {
    x: r * Math.cos(theta) + newcx,
    y: r * Math.sin(theta) + newcy
  }
}

// If the path was rotated, we must now pay the piper:
// Every path point must be rotated into the rotated coordinate system of
// its old center, then determine the new center, then rotate it back
// This is because we want the path to remember its rotation

/**
* @function module:path.recalcRotatedPath
* @todo This is still using ye olde transform methods, can probably
* be optimized or even taken care of by `recalculateDimensions`
* @returns {void}
*/
export const recalcRotatedPath = () => {
  const currentPath = path.elem
  angle = getRotationAngle(currentPath, true)
  if (!angle) { return }
  // selectedBBoxes[0] = path.oldbbox;
  const oldbox = path.oldbbox // selectedBBoxes[0],
  oldcx = oldbox.x + oldbox.width / 2
  oldcy = oldbox.y + oldbox.height / 2
  const box = getBBox(currentPath)
  newcx = box.x + box.width / 2
  newcy = box.y + box.height / 2

  // un-rotate the new center to the proper position
  const dx = newcx - oldcx
  const dy = newcy - oldcy
  const r = Math.sqrt(dx * dx + dy * dy)
  const theta = Math.atan2(dy, dx) + angle

  newcx = r * Math.cos(theta) + oldcx
  newcy = r * Math.sin(theta) + oldcy

  const list = currentPath.pathSegList

  let i = list.numberOfItems
  while (i) {
    i -= 1
    const seg = list.getItem(i)
    const type = seg.pathSegType
    if (type === 1) { continue }

    const rvals = getRotVals(seg.x, seg.y)
    const points = [rvals.x, rvals.y]
    if (seg.x1 && seg.x2) {
      const cVals1 = getRotVals(seg.x1, seg.y1)
      const cVals2 = getRotVals(seg.x2, seg.y2)
      points.splice(points.length, 0, cVals1.x, cVals1.y, cVals2.x, cVals2.y)
    }
    replacePathSeg(type, i, points)
  } // loop for each point

  /* box = */ getBBox(currentPath)
  // selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
  // selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;

  // now we must set the new transform to be rotated around the new center
  const Rnc = svgCanvas.getSvgRoot().createSVGTransform()
  const tlist = currentPath.transform.baseVal
  Rnc.setRotate((angle * 180.0 / Math.PI), newcx, newcy)
  tlist.replaceItem(Rnc, 0)
}

// ====================================
// Public API starts here

/**
* @function module:path.clearData
* @returns {void}
*/
export const clearData = () => {
  pathData = {}
}

// Making public for mocking
/**
* @function module:path.reorientGrads
* @param {Element} elem
* @param {SVGMatrix} m
* @returns {void}
*/
export const reorientGrads = (elem, m) => {
  const bb = utilsGetBBox(elem)
  for (let i = 0; i < 2; i++) {
    const type = i === 0 ? 'fill' : 'stroke'
    const attrVal = elem.getAttribute(type)
    if (attrVal && attrVal.startsWith('url(')) {
      const grad = getRefElem(attrVal)
      if (grad.tagName === 'linearGradient') {
        let x1 = grad.getAttribute('x1') || 0
        let y1 = grad.getAttribute('y1') || 0
        let x2 = grad.getAttribute('x2') || 1
        let y2 = grad.getAttribute('y2') || 0

        // Convert to USOU points
        x1 = (bb.width * x1) + bb.x
        y1 = (bb.height * y1) + bb.y
        x2 = (bb.width * x2) + bb.x
        y2 = (bb.height * y2) + bb.y

        // Transform those points
        const pt1 = transformPoint(x1, y1, m)
        const pt2 = transformPoint(x2, y2, m)

        // Convert back to BB points
        const gCoords = {
          x1: (pt1.x - bb.x) / bb.width,
          y1: (pt1.y - bb.y) / bb.height,
          x2: (pt2.x - bb.x) / bb.width,
          y2: (pt2.y - bb.y) / bb.height
        }

        const newgrad = grad.cloneNode(true)
        for (const [key, value] of Object.entries(gCoords)) {
          newgrad.setAttribute(key, value)
        }
        newgrad.id = svgCanvas.getNextId()
        findDefs().append(newgrad)
        elem.setAttribute(type, 'url(#' + newgrad.id + ')')
      }
    }
  }
}

/**
* This is how we map paths to our preferred relative segment types.
* @name module:path.pathMap
* @type {GenericArray}
*/
const pathMap = [
  0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a',
  'H', 'h', 'V', 'v', 'S', 's', 'T', 't'
]

/**
 * Convert a path to one with only absolute or relative values.
 * @todo move to pathActions.js
 * @function module:path.convertPath
 * @param {SVGPathElement} pth - the path to convert
 * @param {boolean} toRel - true of convert to relative
 * @returns {string}
 */
export const convertPath = (pth, toRel) => {
  const { pathSegList } = pth
  const len = pathSegList.numberOfItems
  let curx = 0; let cury = 0
  let d = ''
  let lastM = null

  for (let i = 0; i < len; ++i) {
    const seg = pathSegList.getItem(i)
    // if these properties are not in the segment, set them to zero
    let x = seg.x || 0
    let y = seg.y || 0
    let x1 = seg.x1 || 0
    let y1 = seg.y1 || 0
    let x2 = seg.x2 || 0
    let y2 = seg.y2 || 0

    const type = seg.pathSegType
    let letter = pathMap[type][toRel ? 'toLowerCase' : 'toUpperCase']()

    switch (type) {
      case 1: // z,Z closepath (Z/z)
        d += 'z'
        if (lastM && !toRel) {
          curx = lastM[0]
          cury = lastM[1]
        }
        break
      case 12: // absolute horizontal line (H)
        x -= curx
      // Fallthrough
      case 13: // relative horizontal line (h)
        if (toRel) {
          y = 0
          curx += x
          letter = 'l'
        } else {
          y = cury
          x += curx
          curx = x
          letter = 'L'
        }
        // Convert to "line" for easier editing
        d += pathDSegment(letter, [[x, y]])
        break
      case 14: // absolute vertical line (V)
        y -= cury
      // Fallthrough
      case 15: // relative vertical line (v)
        if (toRel) {
          x = 0
          cury += y
          letter = 'l'
        } else {
          x = curx
          y += cury
          cury = y
          letter = 'L'
        }
        // Convert to "line" for easier editing
        d += pathDSegment(letter, [[x, y]])
        break
      case 2: // absolute move (M)
      case 4: // absolute line (L)
      case 18: // absolute smooth quad (T)
      case 10: // absolute elliptical arc (A)
        x -= curx
        y -= cury
      // Fallthrough
      case 5: // relative line (l)
      case 3: // relative move (m)
      case 19: // relative smooth quad (t)
        if (toRel) {
          curx += x
          cury += y
        } else {
          x += curx
          y += cury
          curx = x
          cury = y
        }
        if (type === 2 || type === 3) { lastM = [curx, cury] }

        d += pathDSegment(letter, [[x, y]])
        break
      case 6: // absolute cubic (C)
        x -= curx; x1 -= curx; x2 -= curx
        y -= cury; y1 -= cury; y2 -= cury
      // Fallthrough
      case 7: // relative cubic (c)
        if (toRel) {
          curx += x
          cury += y
        } else {
          x += curx; x1 += curx; x2 += curx
          y += cury; y1 += cury; y2 += cury
          curx = x
          cury = y
        }
        d += pathDSegment(letter, [[x1, y1], [x2, y2], [x, y]])
        break
      case 8: // absolute quad (Q)
        x -= curx; x1 -= curx
        y -= cury; y1 -= cury
      // Fallthrough
      case 9: // relative quad (q)
        if (toRel) {
          curx += x
          cury += y
        } else {
          x += curx; x1 += curx
          y += cury; y1 += cury
          curx = x
          cury = y
        }
        d += pathDSegment(letter, [[x1, y1], [x, y]])
        break
      // Fallthrough
      case 11: // relative elliptical arc (a)
        if (toRel) {
          curx += x
          cury += y
        } else {
          x += curx
          y += cury
          curx = x
          cury = y
        }
        d += pathDSegment(letter, [[seg.r1, seg.r2]], [
          seg.angle,
          (seg.largeArcFlag ? 1 : 0),
          (seg.sweepFlag ? 1 : 0)
        ], [x, y])
        break
      case 16: // absolute smooth cubic (S)
        x -= curx; x2 -= curx
        y -= cury; y2 -= cury
      // Fallthrough
      case 17: // relative smooth cubic (s)
        if (toRel) {
          curx += x
          cury += y
        } else {
          x += curx; x2 += curx
          y += cury; y2 += cury
          curx = x
          cury = y
        }
        d += pathDSegment(letter, [[x2, y2], [x, y]])
        break
    } // switch on path segment type
  } // for each segment
  return d
}

/**
 * TODO: refactor callers in `convertPath` to use `getPathDFromSegments` instead of this function.
 * Legacy code refactored from `svgcanvas.pathActions.convertPath`.
 * @param {string} letter - path segment command (letter in potentially either case from {@link module:path.pathMap}; see [SVGPathSeg#pathSegTypeAsLetter]{@link https://www.w3.org/TR/SVG/single-page.html#paths-__svg__SVGPathSeg__pathSegTypeAsLetter})
 * @param {GenericArray<GenericArray<Integer>>} points - x,y points
 * @param {GenericArray<GenericArray<Integer>>} [morePoints] - x,y points
 * @param {Integer[]} [lastPoint] - x,y point
 * @returns {string}
 */
const pathDSegment = (letter, points, morePoints, lastPoint) => {
  points.forEach((pnt, i) => {
    points[i] = shortFloat(pnt)
  })
  let segment = letter + points.join(' ')
  if (morePoints) {
    segment += ' ' + morePoints.join(' ')
  }
  if (lastPoint) {
    segment += ' ' + shortFloat(lastPoint)
  }
  return segment
}

/**
* Group: Path edit functions.
* Functions relating to editing path elements.
*/
export const pathActions = pathActionsMethod
// end pathActions
