/**
 * Path functionality.
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import { NS } from './namespaces.js'
import { ChangeElementCommand } from './history.js'
import {
  transformPoint, getMatrix
} from './math.js'
import {
  assignAttributes, getRotationAngle,
  getElement
} from './utilities.js'

let svgCanvas = null

/**
* @function module:path-actions.init
* @param {module:path-actions.svgCanvas} pathMethodsContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
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
export const ptObjToArrMethod = function (type, segItem) {
  const segData = svgCanvas.getSegData()
  const props = segData[type]
  return props.map((prop) => {
    return segItem[prop]
  })
}

/**
* @function module:path.getGripPt
* @param {Segment} seg
* @param {module:math.XYObject} altPt
* @returns {module:math.XYObject}
*/
export const getGripPtMethod = function (seg, altPt) {
  const { path: pth } = seg
  let out = {
    x: altPt ? altPt.x : seg.item.x,
    y: altPt ? altPt.y : seg.item.y
  }

  if (pth.matrix) {
    const pt = transformPoint(out.x, out.y, pth.matrix)
    out = pt
  }
  const zoom = svgCanvas.getZoom()
  out.x *= zoom
  out.y *= zoom

  return out
}
/**
* @function module:path.getPointFromGrip
* @param {module:math.XYObject} pt
* @param {module:path.Path} pth
* @returns {module:math.XYObject}
*/
export const getPointFromGripMethod = function (pt, pth) {
  const out = {
    x: pt.x,
    y: pt.y
  }

  if (pth.matrix) {
    pt = transformPoint(out.x, out.y, pth.imatrix)
    out.x = pt.x
    out.y = pt.y
  }
  const zoom = svgCanvas.getZoom()
  out.x /= zoom
  out.y /= zoom

  return out
}
/**
* @function module:path.getGripContainer
* @returns {Element}
*/
export const getGripContainerMethod = function () {
  let c = getElement('pathpointgrip_container')
  if (!c) {
    const parentElement = getElement('selectorParentGroup')
    c = document.createElementNS(NS.SVG, 'g')
    parentElement.append(c)
    c.id = 'pathpointgrip_container'
  }
  return c
}
/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addPointGrip
* @param {Integer} index
* @param {Integer} x
* @param {Integer} y
* @returns {SVGCircleElement}
*/
export const addPointGripMethod = function (index, x, y) {
  // create the container of all the point grips
  const pointGripContainer = getGripContainerMethod()

  let pointGrip = getElement('pathpointgrip_' + index)
  // create it
  if (!pointGrip) {
    pointGrip = document.createElementNS(NS.SVG, 'circle')
    const atts = {
      id: 'pathpointgrip_' + index,
      display: 'none',
      r: 4,
      fill: '#0FF',
      stroke: '#00F',
      'stroke-width': 2,
      cursor: 'move',
      style: 'pointer-events:all'
    }
    const uiStrings = svgCanvas.getUIStrings()
    if ('pathNodeTooltip' in uiStrings) { // May be empty if running path.js without svg-editor
      atts['xlink:title'] = uiStrings.pathNodeTooltip
    }
    assignAttributes(pointGrip, atts)
    pointGripContainer.append(pointGrip)

    const grip = document.getElementById('pathpointgrip_' + index)
    grip?.addEventListener('dblclick', () => {
      const path = svgCanvas.getPathObj()
      if (path) {
        path.setSegType()
      }
    })
  }
  if (x && y) {
    // set up the point grip element and display it
    assignAttributes(pointGrip, {
      cx: x,
      cy: y,
      display: 'inline'
    })
  }
  return pointGrip
}
/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addCtrlGrip
* @param {string} id
* @returns {SVGCircleElement}
*/
export const addCtrlGripMethod = function (id) {
  let pointGrip = getElement('ctrlpointgrip_' + id)
  if (pointGrip) { return pointGrip }

  pointGrip = document.createElementNS(NS.SVG, 'circle')
  const atts = {
    id: 'ctrlpointgrip_' + id,
    display: 'none',
    r: 4,
    fill: '#0FF',
    stroke: '#55F',
    'stroke-width': 1,
    cursor: 'move',
    style: 'pointer-events:all'
  }
  const uiStrings = svgCanvas.getUIStrings()
  if ('pathCtrlPtTooltip' in uiStrings) { // May be empty if running path.js without svg-editor
    atts['xlink:title'] = uiStrings.pathCtrlPtTooltip
  }
  assignAttributes(pointGrip, atts)
  getGripContainerMethod().append(pointGrip)
  return pointGrip
}
/**
* @function module:path.getCtrlLine
* @param {string} id
* @returns {SVGLineElement}
*/
export const getCtrlLineMethod = function (id) {
  let ctrlLine = getElement('ctrlLine_' + id)
  if (ctrlLine) { return ctrlLine }

  ctrlLine = document.createElementNS(NS.SVG, 'line')
  assignAttributes(ctrlLine, {
    id: 'ctrlLine_' + id,
    stroke: '#555',
    'stroke-width': 1,
    style: 'pointer-events:none'
  })
  getGripContainerMethod().append(ctrlLine)
  return ctrlLine
}
/**
* @function module:path.getPointGrip
* @param {Segment} seg
* @param {boolean} update
* @returns {SVGCircleElement}
*/
export const getPointGripMethod = function (seg, update) {
  const { index } = seg
  const pointGrip = addPointGripMethod(index)

  if (update) {
    const pt = getGripPtMethod(seg)
    assignAttributes(pointGrip, {
      cx: pt.x,
      cy: pt.y,
      display: 'inline'
    })
  }

  return pointGrip
}
/**
* @function module:path.getControlPoints
* @param {Segment} seg
* @returns {PlainObject<string, SVGLineElement|SVGCircleElement>}
*/
export const getControlPointsMethod = function (seg) {
  const { item, index } = seg
  if (!('x1' in item) || !('x2' in item)) { return null }
  const cpt = {}
  /* const pointGripContainer = */ getGripContainerMethod()

  // Note that this is intentionally not seg.prev.item
  const path = svgCanvas.getPathObj()
  const prev = path.segs[index - 1].item

  const segItems = [prev, item]

  for (let i = 1; i < 3; i++) {
    const id = index + 'c' + i

    const ctrlLine = cpt['c' + i + '_line'] = getCtrlLineMethod(id)

    const pt = getGripPtMethod(seg, { x: item['x' + i], y: item['y' + i] })
    const gpt = getGripPtMethod(seg, { x: segItems[i - 1].x, y: segItems[i - 1].y })

    assignAttributes(ctrlLine, {
      x1: pt.x,
      y1: pt.y,
      x2: gpt.x,
      y2: gpt.y,
      display: 'inline'
    })

    cpt['c' + i + '_line'] = ctrlLine

    // create it
    const pointGrip = cpt['c' + i] = addCtrlGripMethod(id)

    assignAttributes(pointGrip, {
      cx: pt.x,
      cy: pt.y,
      display: 'inline'
    })
    cpt['c' + i] = pointGrip
  }
  return cpt
}
/**
* This replaces the segment at the given index. Type is given as number.
* @function module:path.replacePathSeg
* @param {Integer} type Possible values set during {@link module:path.init}
* @param {Integer} index
* @param {ArgumentsArray} pts
* @param {SVGPathElement} elem
* @returns {void}
*/
export const replacePathSegMethod = function (type, index, pts, elem) {
  const path = svgCanvas.getPathObj()
  const pth = elem || path.elem
  const pathFuncs = svgCanvas.getPathFuncs()
  const func = 'createSVGPathSeg' + pathFuncs[type]
  const seg = pth[func](...pts)

  pth.pathSegList.replaceItem(seg, index)
}
/**
* @function module:path.getSegSelector
* @param {Segment} seg
* @param {boolean} update
* @returns {SVGPathElement}
*/
export const getSegSelectorMethod = function (seg, update) {
  const { index } = seg
  let segLine = getElement('segline_' + index)
  if (!segLine) {
    const pointGripContainer = getGripContainerMethod()
    // create segline
    segLine = document.createElementNS(NS.SVG, 'path')
    assignAttributes(segLine, {
      id: 'segline_' + index,
      display: 'none',
      fill: 'none',
      stroke: '#0FF',
      'stroke-width': 2,
      style: 'pointer-events:none',
      d: 'M0,0 0,0'
    })
    pointGripContainer.append(segLine)
  }

  if (update) {
    const { prev } = seg
    if (!prev) {
      segLine.setAttribute('display', 'none')
      return segLine
    }

    const pt = getGripPtMethod(prev)
    // Set start point
    replacePathSegMethod(2, 0, [pt.x, pt.y], segLine)

    const pts = ptObjToArrMethod(seg.type, seg.item) // , true);
    for (let i = 0; i < pts.length; i += 2) {
      const point = getGripPtMethod(seg, { x: pts[i], y: pts[i + 1] })
      pts[i] = point.x
      pts[i + 1] = point.y
    }

    replacePathSegMethod(seg.type, 1, pts, segLine)
  }
  return segLine
}
/**
*
*/
export class Segment {
  /**
  * @param {Integer} index
  * @param {SVGPathSeg} item
  * @todo Is `item` be more constrained here?
  */
  constructor (index, item) {
    this.selected = false
    this.index = index
    this.item = item
    this.type = item.pathSegType

    this.ctrlpts = []
    this.ptgrip = null
    this.segsel = null
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  showCtrlPts (y) {
    for (const i in this.ctrlpts) {
      if ({}.hasOwnProperty.call(this.ctrlpts, i)) {
        this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none')
      }
    }
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  selectCtrls (y) {
    document.getElementById('ctrlpointgrip_' + this.index + 'c1').setAttribute('fill', y ? '#0FF' : '#EEE')
    document.getElementById('ctrlpointgrip_' + this.index + 'c2').setAttribute('fill', y ? '#0FF' : '#EEE')
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  show (y) {
    if (this.ptgrip) {
      this.ptgrip.setAttribute('display', y ? 'inline' : 'none')
      this.segsel.setAttribute('display', y ? 'inline' : 'none')
      // Show/hide all control points if available
      this.showCtrlPts(y)
    }
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  select (y) {
    if (this.ptgrip) {
      this.ptgrip.setAttribute('stroke', y ? '#0FF' : '#00F')
      this.segsel.setAttribute('display', y ? 'inline' : 'none')
      if (this.ctrlpts) {
        this.selectCtrls(y)
      }
      this.selected = y
    }
  }

  /**
   * @returns {void}
   */
  addGrip () {
    this.ptgrip = getPointGripMethod(this, true)
    this.ctrlpts = getControlPointsMethod(this) // , true);
    this.segsel = getSegSelectorMethod(this, true)
  }

  /**
   * @param {boolean} full
   * @returns {void}
   */
  update (full) {
    if (this.ptgrip) {
      const pt = getGripPtMethod(this)
      assignAttributes(this.ptgrip, {
        cx: pt.x,
        cy: pt.y
      })

      getSegSelectorMethod(this, true)

      if (this.ctrlpts) {
        if (full) {
          const path = svgCanvas.getPathObj()
          this.item = path.elem.pathSegList.getItem(this.index)
          this.type = this.item.pathSegType
        }
        getControlPointsMethod(this)
      }
      // this.segsel.setAttribute('display', y ? 'inline' : 'none');
    }
  }

  /**
   * @param {Integer} dx
   * @param {Integer} dy
   * @returns {void}
   */
  move (dx, dy) {
    const { item } = this

    const curPts = this.ctrlpts
      ? [
          item.x += dx, item.y += dy,
          item.x1, item.y1, item.x2 += dx, item.y2 += dy
        ]
      : [item.x += dx, item.y += dy]

    replacePathSegMethod(
      this.type,
      this.index,
      // type 10 means ARC
      this.type === 10 ? ptObjToArrMethod(this.type, item) : curPts
    )

    if (this.next?.ctrlpts) {
      const next = this.next.item
      const nextPts = [
        next.x, next.y,
        next.x1 += dx, next.y1 += dy, next.x2, next.y2
      ]
      replacePathSegMethod(this.next.type, this.next.index, nextPts)
    }

    if (this.mate) {
      // The last point of a closed subpath has a 'mate',
      // which is the 'M' segment of the subpath
      const { item: itm } = this.mate
      const pts = [itm.x += dx, itm.y += dy]
      replacePathSegMethod(this.mate.type, this.mate.index, pts)
      // Has no grip, so does not need 'updating'?
    }

    this.update(true)
    if (this.next) { this.next.update(true) }
  }

  /**
   * @param {Integer} num
   * @returns {void}
   */
  setLinked (num) {
    let seg; let anum; let pt
    if (num === 2) {
      anum = 1
      seg = this.next
      if (!seg) { return }
      pt = this.item
    } else {
      anum = 2
      seg = this.prev
      if (!seg) { return }
      pt = seg.item
    }

    const { item } = seg
    item['x' + anum] = pt.x + (pt.x - this.item['x' + num])
    item['y' + anum] = pt.y + (pt.y - this.item['y' + num])

    const pts = [
      item.x, item.y,
      item.x1, item.y1,
      item.x2, item.y2
    ]

    replacePathSegMethod(seg.type, seg.index, pts)
    seg.update(true)
  }

  /**
   * @param {Integer} num
   * @param {Integer} dx
   * @param {Integer} dy
   * @returns {void}
   */
  moveCtrl (num, dx, dy) {
    const { item } = this
    item['x' + num] += dx
    item['y' + num] += dy

    const pts = [
      item.x, item.y,
      item.x1, item.y1, item.x2, item.y2
    ]

    replacePathSegMethod(this.type, this.index, pts)
    this.update(true)
  }

  /**
   * @param {Integer} newType Possible values set during {@link module:path.init}
   * @param {ArgumentsArray} pts
   * @returns {void}
   */
  setType (newType, pts) {
    replacePathSegMethod(newType, this.index, pts)
    this.type = newType
    const path = svgCanvas.getPathObj()
    this.item = path.elem.pathSegList.getItem(this.index)
    this.showCtrlPts(newType === 6)
    this.ctrlpts = getControlPointsMethod(this)
    this.update(true)
  }
}

/**
*
*/
export class Path {
  /**
  * @param {SVGPathElement} elem
  * @throws {Error} If constructed without a path element
  */
  constructor (elem) {
    if (!elem || elem.tagName !== 'path') {
      throw new Error('svgedit.path.Path constructed without a <path> element')
    }

    this.elem = elem
    this.segs = []
    this.selected_pts = []
    svgCanvas.setPathObj(this)
    // path = this;

    this.init()
  }

  setPathContext () {
    svgCanvas.setPathObj(this)
  }

  /**
  * Reset path data.
  * @returns {module:path.Path}
  */
  init () {
    // Hide all grips, etc

    // fixed, needed to work on all found elements, not just first
    const pointGripContainer = getGripContainerMethod()
    const elements = pointGripContainer.querySelectorAll('*')
    Array.prototype.forEach.call(elements, function (el) {
      el.setAttribute('display', 'none')
    })

    const segList = this.elem.pathSegList
    const len = segList.numberOfItems
    this.segs = []
    this.selected_pts = []
    this.first_seg = null

    // Set up segs array
    for (let i = 0; i < len; i++) {
      const item = segList.getItem(i)
      const segment = new Segment(i, item)
      segment.path = this
      this.segs.push(segment)
    }

    const { segs } = this

    let startI = null
    for (let i = 0; i < len; i++) {
      const seg = segs[i]
      const nextSeg = (i + 1) >= len ? null : segs[i + 1]
      const prevSeg = (i - 1) < 0 ? null : segs[i - 1]
      if (seg.type === 2) {
        if (prevSeg && prevSeg.type !== 1) {
          // New sub-path, last one is open,
          // so add a grip to last sub-path's first point
          const startSeg = segs[startI]
          startSeg.next = segs[startI + 1]
          startSeg.next.prev = startSeg
          startSeg.addGrip()
        }
        // Remember that this is a starter seg
        startI = i
      } else if (nextSeg?.type === 1) {
        // This is the last real segment of a closed sub-path
        // Next is first seg after "M"
        seg.next = segs[startI + 1]

        // First seg after "M"'s prev is this
        seg.next.prev = seg
        seg.mate = segs[startI]
        seg.addGrip()
        if (!this.first_seg) {
          this.first_seg = seg
        }
      } else if (!nextSeg) {
        if (seg.type !== 1) {
          // Last seg, doesn't close so add a grip
          // to last sub-path's first point
          const startSeg = segs[startI]
          startSeg.next = segs[startI + 1]
          startSeg.next.prev = startSeg
          startSeg.addGrip()
          seg.addGrip()

          if (!this.first_seg) {
            // Open path, so set first as real first and add grip
            this.first_seg = segs[startI]
          }
        }
      } else if (seg.type !== 1) {
        // Regular segment, so add grip and its "next"
        seg.addGrip()

        // Don't set its "next" if it's an "M"
        if (nextSeg && nextSeg.type !== 2) {
          seg.next = nextSeg
          seg.next.prev = seg
        }
      }
    }
    return this
  }

  /**
  * @callback module:path.PathEachSegCallback
  * @this module:path.Segment
  * @param {Integer} i The index of the seg being iterated
  * @returns {boolean|void} Will stop execution of `eachSeg` if returns `false`
  */
  /**
  * @param {module:path.PathEachSegCallback} fn
  * @returns {void}
  */
  eachSeg (fn) {
    const len = this.segs.length
    for (let i = 0; i < len; i++) {
      const ret = fn.call(this.segs[i], i)
      if (ret === false) { break }
    }
  }

  /**
  * @param {Integer} index
  * @returns {void}
  */
  addSeg (index) {
    // Adds a new segment
    const seg = this.segs[index]
    if (!seg.prev) { return }

    const { prev } = seg
    let newseg; let newX; let newY
    switch (seg.item.pathSegType) {
      case 4: {
        newX = (seg.item.x + prev.item.x) / 2
        newY = (seg.item.y + prev.item.y) / 2
        newseg = this.elem.createSVGPathSegLinetoAbs(newX, newY)
        break
      } case 6: { // make it a curved segment to preserve the shape (WRS)
      // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
        const p0x = (prev.item.x + seg.item.x1) / 2
        const p1x = (seg.item.x1 + seg.item.x2) / 2
        const p2x = (seg.item.x2 + seg.item.x) / 2
        const p01x = (p0x + p1x) / 2
        const p12x = (p1x + p2x) / 2
        newX = (p01x + p12x) / 2
        const p0y = (prev.item.y + seg.item.y1) / 2
        const p1y = (seg.item.y1 + seg.item.y2) / 2
        const p2y = (seg.item.y2 + seg.item.y) / 2
        const p01y = (p0y + p1y) / 2
        const p12y = (p1y + p2y) / 2
        newY = (p01y + p12y) / 2
        newseg = this.elem.createSVGPathSegCurvetoCubicAbs(newX, newY, p0x, p0y, p01x, p01y)
        const pts = [seg.item.x, seg.item.y, p12x, p12y, p2x, p2y]
        replacePathSegMethod(seg.type, index, pts)
        break
      }
    }
    const list = this.elem.pathSegList
    list.insertItemBefore(newseg, index)
  }

  /**
  * @param {Integer} index
  * @returns {void}
  */
  deleteSeg (index) {
    const seg = this.segs[index]
    const list = this.elem.pathSegList

    seg.show(false)
    const { next } = seg
    if (seg.mate) {
      // Make the next point be the "M" point
      const pt = [next.item.x, next.item.y]
      replacePathSegMethod(2, next.index, pt)

      // Reposition last node
      replacePathSegMethod(4, seg.index, pt)

      list.removeItem(seg.mate.index)
    } else if (!seg.prev) {
      // First node of open path, make next point the M
      // const {item} = seg;
      const pt = [next.item.x, next.item.y]
      replacePathSegMethod(2, seg.next.index, pt)
      list.removeItem(index)
    } else {
      list.removeItem(index)
    }
  }

  /**
  * @param {Integer} index
  * @returns {void}
  */
  removePtFromSelection (index) {
    const pos = this.selected_pts.indexOf(index)
    if (pos === -1) {
      return
    }
    this.segs[index].select(false)
    this.selected_pts.splice(pos, 1)
  }

  /**
  * @returns {void}
  */
  clearSelection () {
    this.eachSeg(function () {
      // 'this' is the segment here
      this.select(false)
    })
    this.selected_pts = []
  }

  /**
  * @returns {void}
  */
  storeD () {
    this.last_d = this.elem.getAttribute('d')
  }

  /**
  * @param {Integer} y
  * @returns {Path}
  */
  show (y) {
    // Shows this path's segment grips
    this.eachSeg(function () {
      // 'this' is the segment here
      this.show(y)
    })
    if (y) {
      this.selectPt(this.first_seg.index)
    }
    return this
  }

  /**
  * Move selected points.
  * @param {Integer} dx
  * @param {Integer} dy
  * @returns {void}
  */
  movePts (dx, dy) {
    let i = this.selected_pts.length
    while (i--) {
      const seg = this.segs[this.selected_pts[i]]
      seg.move(dx, dy)
    }
  }

  /**
  * @param {Integer} dx
  * @param {Integer} dy
  * @returns {void}
  */
  moveCtrl (dx, dy) {
    const seg = this.segs[this.selected_pts[0]]
    seg.moveCtrl(this.dragctrl, dx, dy)
    if (svgCanvas.getLinkControlPts()) {
      seg.setLinked(this.dragctrl)
    }
  }

  /**
  * @param {?Integer} newType See {@link https://www.w3.org/TR/SVG/single-page.html#paths-InterfaceSVGPathSeg}
  * @returns {void}
  */
  setSegType (newType) {
    this.storeD()
    let i = this.selected_pts.length
    let text
    while (i--) {
      const selPt = this.selected_pts[i]

      // Selected seg
      const cur = this.segs[selPt]
      const { prev } = cur
      if (!prev) { continue }

      if (!newType) { // double-click, so just toggle
        text = 'Toggle Path Segment Type'

        // Toggle segment to curve/straight line
        const oldType = cur.type

        newType = (oldType === 6) ? 4 : 6
      }

      newType = Number(newType)

      const curX = cur.item.x
      const curY = cur.item.y
      const prevX = prev.item.x
      const prevY = prev.item.y
      let points
      switch (newType) {
        case 6: {
          if (cur.olditem) {
            const old = cur.olditem
            points = [curX, curY, old.x1, old.y1, old.x2, old.y2]
          } else {
            const diffX = curX - prevX
            const diffY = curY - prevY
            // get control points from straight line segment
            /*
          const ct1x = (prevX + (diffY/2));
          const ct1y = (prevY - (diffX/2));
          const ct2x = (curX + (diffY/2));
          const ct2y = (curY - (diffX/2));
          */
            // create control points on the line to preserve the shape (WRS)
            const ct1x = (prevX + (diffX / 3))
            const ct1y = (prevY + (diffY / 3))
            const ct2x = (curX - (diffX / 3))
            const ct2y = (curY - (diffY / 3))
            points = [curX, curY, ct1x, ct1y, ct2x, ct2y]
          }
          break
        } case 4: {
          points = [curX, curY]

          // Store original prevve segment nums
          cur.olditem = cur.item
          break
        }
      }

      cur.setType(newType, points)
    }
    const path = svgCanvas.getPathObj()
    path.endChanges(text)
  }

  /**
  * @param {Integer} pt
  * @param {Integer} ctrlNum
  * @returns {void}
  */
  selectPt (pt, ctrlNum) {
    this.clearSelection()
    if (!pt) {
      this.eachSeg(function (i) {
        // 'this' is the segment here.
        if (this.prev) {
          pt = i
        }
      })
    }
    this.addPtsToSelection(pt)
    if (ctrlNum) {
      this.dragctrl = ctrlNum

      if (svgCanvas.getLinkControlPts()) {
        this.segs[pt].setLinked(ctrlNum)
      }
    }
  }

  /**
  * Update position of all points.
  * @returns {Path}
  */
  update () {
    const { elem } = this
    if (getRotationAngle(elem)) {
      this.matrix = getMatrix(elem)
      this.imatrix = this.matrix.inverse()
    } else {
      this.matrix = null
      this.imatrix = null
    }

    this.eachSeg(function (i) {
      this.item = elem.pathSegList.getItem(i)
      this.update()
    })

    return this
  }

  /**
  * @param {string} text
  * @returns {void}
  */
  endChanges (text) {
    const cmd = new ChangeElementCommand(this.elem, { d: this.last_d }, text)
    svgCanvas.endChanges({ cmd, elem: this.elem })
  }

  /**
  * @param {Integer|Integer[]} indexes
  * @returns {void}
  */
  addPtsToSelection (indexes) {
    if (!Array.isArray(indexes)) { indexes = [indexes] }
    indexes.forEach((index) => {
      const seg = this.segs[index]
      if (seg.ptgrip && !this.selected_pts.includes(index) && index >= 0) {
        this.selected_pts.push(index)
      }
    })
    this.selected_pts.sort()
    let i = this.selected_pts.length
    const grips = []
    grips.length = i
    // Loop through points to be selected and highlight each
    while (i--) {
      const pt = this.selected_pts[i]
      const seg = this.segs[pt]
      seg.select(true)
      grips[i] = seg.ptgrip
    }

    const closedSubpath = Path.subpathIsClosed(this.selected_pts[0])
    svgCanvas.addPtsToSelection({ grips, closedSubpath })
  }

  // STATIC
  /**
  * @param {Integer} index
  * @returns {boolean}
  */
  static subpathIsClosed (index) {
    let clsd = false
    // Check if subpath is already open
    const path = svgCanvas.getPathObj()
    path.eachSeg(function (i) {
      if (i <= index) { return true }
      if (this.type === 2) {
        // Found M first, so open
        return false
      }
      if (this.type === 1) {
        // Found Z first, so closed
        clsd = true
        return false
      }
      return true
    })

    return clsd
  }
}
