/**
 * Tools for event.
 * @module event
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import {
  assignAttributes, cleanupElement, getElement, getRotationAngle, snapToGrid, walkTree,
  preventClickDefault, setHref, getBBox
} from './utilities.js'
import {
  convertAttrs
} from './units.js'
import {
  transformPoint, hasMatrixTransform, getMatrix, snapToAngle
} from './math.js'
import * as draw from './draw.js'
import * as pathModule from './path.js'
import * as hstry from './history.js'
import { findPos } from '../../svgcanvas/common/util.js'

const {
  InsertElementCommand
} = hstry

let svgCanvas = null
let moveSelectionThresholdReached = false

/**
* @function module:undo.init
* @param {module:undo.eventContext} eventContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
  svgCanvas.mouseDownEvent = mouseDownEvent
  svgCanvas.mouseMoveEvent = mouseMoveEvent
  svgCanvas.dblClickEvent = dblClickEvent
  svgCanvas.mouseUpEvent = mouseUpEvent
  svgCanvas.mouseOutEvent = mouseOutEvent
  svgCanvas.DOMMouseScrollEvent = DOMMouseScrollEvent
}

const getBsplinePoint = (t) => {
  const spline = { x: 0, y: 0 }
  const p0 = { x: svgCanvas.getControllPoint2('x'), y: svgCanvas.getControllPoint2('y') }
  const p1 = { x: svgCanvas.getControllPoint1('x'), y: svgCanvas.getControllPoint1('y') }
  const p2 = { x: svgCanvas.getStart('x'), y: svgCanvas.getStart('y') }
  const p3 = { x: svgCanvas.getEnd('x'), y: svgCanvas.getEnd('y') }
  const S = 1.0 / 6.0
  const t2 = t * t
  const t3 = t2 * t

  const m = [
    [-1, 3, -3, 1],
    [3, -6, 3, 0],
    [-3, 0, 3, 0],
    [1, 4, 1, 0]
  ]

  spline.x = S * (
    (p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3 +
    (p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2 +
    (p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t +
    (p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3])
  )
  spline.y = S * (
    (p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3 +
    (p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2 +
    (p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t +
    (p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3])
  )

  return {
    x: spline.x,
    y: spline.y
  }
}

// update the dummy transform in our transform list
// to be a translate. We need to check if there was a transformation
// to avoid loosing it
const updateTransformList = (svgRoot, element, dx, dy) => {
  const xform = svgRoot.createSVGTransform()
  xform.setTranslate(dx, dy)
  const tlist = element.transform?.baseVal
  if (tlist.numberOfItems) {
    const firstItem = tlist.getItem(0)
    if (firstItem.type === 2) { // SVG_TRANSFORM_TRANSLATE = 2
      tlist.replaceItem(xform, 0)
    } else {
      tlist.insertItemBefore(xform, 0)
    }
  } else {
    tlist.appendItem(xform)
  }
}

/**
 *
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:transition
 * @fires module:svgcanvas.SvgCanvas#event:ext_mouseMove
 * @returns {void}
 */
const mouseMoveEvent = (evt) => {
  // if the mouse is move without dragging an element, just return.
  if (!svgCanvas.getStarted()) { return }
  if (evt.button === 1 || svgCanvas.spaceKey) { return }

  svgCanvas.textActions.init()

  evt.preventDefault()

  const selectedElements = svgCanvas.getSelectedElements()
  const zoom = svgCanvas.getZoom()
  const svgRoot = svgCanvas.getSvgRoot()
  const selected = selectedElements[0]

  let i
  let xya
  let cx
  let cy
  let dx
  let dy
  let len
  let angle
  let box

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.getrootSctm())
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom
  const shape = getElement(svgCanvas.getId())

  let realX = mouseX / zoom
  let x = realX
  let realY = mouseY / zoom
  let y = realY

  if (svgCanvas.getCurConfig().gridSnapping) {
    x = snapToGrid(x)
    y = snapToGrid(y)
  }

  let tlist
  switch (svgCanvas.getCurrentMode()) {
    case 'select': {
      // we temporarily use a translate on the element(s) being dragged
      // this transform is removed upon mousing up and the element is
      // relocated to the new location
      if (selected) {
        dx = x - svgCanvas.getStartX()
        dy = y - svgCanvas.getStartY()
        if (svgCanvas.getCurConfig().gridSnapping) {
          dx = snapToGrid(dx)
          dy = snapToGrid(dy)
        }

        // Enable moving selection only if mouse has been moved at least 4 px in any direction
        // This prevents objects from being accidentally moved when (initially) selected
        const deltaThreshold = 4
        const deltaThresholdReached = Math.abs(dx) > deltaThreshold || Math.abs(dy) > deltaThreshold
        moveSelectionThresholdReached = moveSelectionThresholdReached || deltaThresholdReached

        if (moveSelectionThresholdReached) {
          selectedElements.forEach((el) => {
            if (el) {
              updateTransformList(svgRoot, el, dx, dy)
              // update our internal bbox that we're tracking while dragging
              svgCanvas.selectorManager.requestSelector(el).resize()
            }
          })
          svgCanvas.call('transition', selectedElements)
        }
      }
      break
    }
    case 'multiselect': {
      realX *= zoom
      realY *= zoom
      assignAttributes(svgCanvas.getRubberBox(), {
        x: Math.min(svgCanvas.getRStartX(), realX),
        y: Math.min(svgCanvas.getRStartY(), realY),
        width: Math.abs(realX - svgCanvas.getRStartX()),
        height: Math.abs(realY - svgCanvas.getRStartY())
      }, 100)

      // for each selected:
      // - if newList contains selected, do nothing
      // - if newList doesn't contain selected, remove it from selected
      // - for any newList that was not in selectedElements, add it to selected
      const elemsToRemove = selectedElements.slice(); const elemsToAdd = []
      const newList = svgCanvas.getIntersectionList()

      // For every element in the intersection, add if not present in selectedElements.
      len = newList.length
      for (i = 0; i < len; ++i) {
        const intElem = newList[i]
        // Found an element that was not selected before, so we should add it.
        if (!selectedElements.includes(intElem)) {
          elemsToAdd.push(intElem)
        }
        // Found an element that was already selected, so we shouldn't remove it.
        const foundInd = elemsToRemove.indexOf(intElem)
        if (foundInd !== -1) {
          elemsToRemove.splice(foundInd, 1)
        }
      }

      if (elemsToRemove.length > 0) {
        svgCanvas.removeFromSelection(elemsToRemove)
      }

      if (elemsToAdd.length > 0) {
        svgCanvas.addToSelection(elemsToAdd)
      }

      break
    }
    case 'resize': {
      // we track the resize bounding box and translate/scale the selected element
      // while the mouse is down, when mouse goes up, we use this to recalculate
      // the shape's coordinates
      tlist = selected.transform.baseVal
      const hasMatrix = hasMatrixTransform(tlist)
      box = hasMatrix ? svgCanvas.getInitBbox() : getBBox(selected)
      let left = box.x
      let top = box.y
      let { width, height } = box
      dx = (x - svgCanvas.getStartX())
      dy = (y - svgCanvas.getStartY())

      if (svgCanvas.getCurConfig().gridSnapping) {
        dx = snapToGrid(dx)
        dy = snapToGrid(dy)
        height = snapToGrid(height)
        width = snapToGrid(width)
      }

      // if rotated, adjust the dx,dy values
      angle = getRotationAngle(selected)
      if (angle) {
        const r = Math.sqrt(dx * dx + dy * dy)
        const theta = Math.atan2(dy, dx) - angle * Math.PI / 180.0
        dx = r * Math.cos(theta)
        dy = r * Math.sin(theta)
      }

      // if not stretching in y direction, set dy to 0
      // if not stretching in x direction, set dx to 0
      if (!svgCanvas.getCurrentResizeMode().includes('n') && !svgCanvas.getCurrentResizeMode().includes('s')) {
        dy = 0
      }
      if (!svgCanvas.getCurrentResizeMode().includes('e') && !svgCanvas.getCurrentResizeMode().includes('w')) {
        dx = 0
      }

      let // ts = null,
        tx = 0; let ty = 0
      let sy = height ? (height + dy) / height : 1
      let sx = width ? (width + dx) / width : 1
      // if we are dragging on the north side, then adjust the scale factor and ty
      if (svgCanvas.getCurrentResizeMode().includes('n')) {
        sy = height ? (height - dy) / height : 1
        ty = height
      }

      // if we dragging on the east side, then adjust the scale factor and tx
      if (svgCanvas.getCurrentResizeMode().includes('w')) {
        sx = width ? (width - dx) / width : 1
        tx = width
      }

      // update the transform list with translate,scale,translate
      const translateOrigin = svgRoot.createSVGTransform()
      const scale = svgRoot.createSVGTransform()
      const translateBack = svgRoot.createSVGTransform()

      if (svgCanvas.getCurConfig().gridSnapping) {
        left = snapToGrid(left)
        tx = snapToGrid(tx)
        top = snapToGrid(top)
        ty = snapToGrid(ty)
      }

      translateOrigin.setTranslate(-(left + tx), -(top + ty))
      // For images, we maintain aspect ratio by default and relax when shift pressed
      const maintainAspectRatio = (selected.tagName !== 'image' && evt.shiftKey) || (selected.tagName === 'image' && !evt.shiftKey)
      if (maintainAspectRatio) {
        if (sx === 1) {
          sx = sy
        } else { sy = sx }
      }
      scale.setScale(sx, sy)

      translateBack.setTranslate(left + tx, top + ty)
      if (hasMatrix) {
        const diff = angle ? 1 : 0
        tlist.replaceItem(translateOrigin, 2 + diff)
        tlist.replaceItem(scale, 1 + diff)
        tlist.replaceItem(translateBack, Number(diff))
      } else {
        const N = tlist.numberOfItems
        tlist.replaceItem(translateBack, N - 3)
        tlist.replaceItem(scale, N - 2)
        tlist.replaceItem(translateOrigin, N - 1)
      }

      svgCanvas.selectorManager.requestSelector(selected).resize()
      svgCanvas.call('transition', selectedElements)

      break
    }
    case 'zoom': {
      realX *= zoom
      realY *= zoom
      assignAttributes(svgCanvas.getRubberBox(), {
        x: Math.min(svgCanvas.getRStartX() * zoom, realX),
        y: Math.min(svgCanvas.getRStartY() * zoom, realY),
        width: Math.abs(realX - svgCanvas.getRStartX() * zoom),
        height: Math.abs(realY - svgCanvas.getRStartY() * zoom)
      }, 100)
      break
    }
    case 'text': {
      assignAttributes(shape, {
        x,
        y
      }, 1000)
      break
    }
    case 'line': {
      if (svgCanvas.getCurConfig().gridSnapping) {
        x = snapToGrid(x)
        y = snapToGrid(y)
      }

      let x2 = x
      let y2 = y

      if (evt.shiftKey) {
        xya = snapToAngle(svgCanvas.getStartX(), svgCanvas.getStartY(), x2, y2)
        x2 = xya.x
        y2 = xya.y
      }

      shape.setAttribute('x2', x2)
      shape.setAttribute('y2', y2)
      break
    }
    case 'foreignObject': // fall through
    case 'square':
    case 'rect':
    case 'image': {
      // For images, we maintain aspect ratio by default and relax when shift pressed
      const maintainAspectRatio = (svgCanvas.getCurrentMode() === 'square') ||
        (svgCanvas.getCurrentMode() === 'image' && !evt.shiftKey) ||
        (svgCanvas.getCurrentMode() !== 'image' && evt.shiftKey)

      let
        w = Math.abs(x - svgCanvas.getStartX())
      let h = Math.abs(y - svgCanvas.getStartY())
      let newX; let newY
      if (maintainAspectRatio) {
        w = h = Math.max(w, h)
        newX = svgCanvas.getStartX() < x ? svgCanvas.getStartX() : svgCanvas.getStartX() - w
        newY = svgCanvas.getStartY() < y ? svgCanvas.getStartY() : svgCanvas.getStartY() - h
      } else {
        newX = Math.min(svgCanvas.getStartX(), x)
        newY = Math.min(svgCanvas.getStartY(), y)
      }

      if (svgCanvas.getCurConfig().gridSnapping) {
        w = snapToGrid(w)
        h = snapToGrid(h)
        newX = snapToGrid(newX)
        newY = snapToGrid(newY)
      }

      assignAttributes(shape, {
        width: w,
        height: h,
        x: newX,
        y: newY
      }, 1000)

      break
    }
    case 'circle': {
      cx = Number(shape.getAttribute('cx'))
      cy = Number(shape.getAttribute('cy'))
      let rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))
      if (svgCanvas.getCurConfig().gridSnapping) {
        rad = snapToGrid(rad)
      }
      shape.setAttribute('r', rad)
      break
    }
    case 'ellipse': {
      cx = Number(shape.getAttribute('cx'))
      cy = Number(shape.getAttribute('cy'))
      if (svgCanvas.getCurConfig().gridSnapping) {
        x = snapToGrid(x)
        cx = snapToGrid(cx)
        y = snapToGrid(y)
        cy = snapToGrid(cy)
      }
      shape.setAttribute('rx', Math.abs(x - cx))
      const ry = Math.abs(evt.shiftKey ? (x - cx) : (y - cy))
      shape.setAttribute('ry', ry)
      break
    }
    case 'fhellipse':
    case 'fhrect': {
      svgCanvas.setFreehand('minx', Math.min(realX, svgCanvas.getFreehand('minx')))
      svgCanvas.setFreehand('maxx', Math.max(realX, svgCanvas.getFreehand('maxx')))
      svgCanvas.setFreehand('miny', Math.min(realY, svgCanvas.getFreehand('miny')))
      svgCanvas.setFreehand('maxy', Math.max(realY, svgCanvas.getFreehand('maxy')))
    }
    // Fallthrough
    case 'fhpath': {
      // dAttr += + realX + ',' + realY + ' ';
      // shape.setAttribute('points', dAttr);
      svgCanvas.setEnd('x', realX)
      svgCanvas.setEnd('y', realY)
      if (svgCanvas.getControllPoint2('x') && svgCanvas.getControllPoint2('y')) {
        for (i = 0; i < svgCanvas.getStepCount() - 1; i++) {
          svgCanvas.setParameter(i / svgCanvas.getStepCount())
          svgCanvas.setNextParameter((i + 1) / svgCanvas.getStepCount())
          svgCanvas.setbSpline(getBsplinePoint(svgCanvas.getNextParameter()))
          svgCanvas.setNextPos({ x: svgCanvas.getbSpline('x'), y: svgCanvas.getbSpline('y') })
          svgCanvas.setbSpline(getBsplinePoint(svgCanvas.getParameter()))
          svgCanvas.setSumDistance(
            svgCanvas.getSumDistance() + Math.sqrt((svgCanvas.getNextPos('x') -
              svgCanvas.getbSpline('x')) * (svgCanvas.getNextPos('x') -
                svgCanvas.getbSpline('x')) + (svgCanvas.getNextPos('y') -
                  svgCanvas.getbSpline('y')) * (svgCanvas.getNextPos('y') - svgCanvas.getbSpline('y')))
          )
          if (svgCanvas.getSumDistance() > svgCanvas.getThreSholdDist()) {
            svgCanvas.setSumDistance(svgCanvas.getSumDistance() - svgCanvas.getThreSholdDist())

            // Faster than completely re-writing the points attribute.
            const point = svgCanvas.getSvgContent().createSVGPoint()
            point.x = svgCanvas.getbSpline('x')
            point.y = svgCanvas.getbSpline('y')
            shape.points.appendItem(point)
          }
        }
      }
      svgCanvas.setControllPoint2('x', svgCanvas.getControllPoint1('x'))
      svgCanvas.setControllPoint2('y', svgCanvas.getControllPoint1('y'))
      svgCanvas.setControllPoint1('x', svgCanvas.getStart('x'))
      svgCanvas.setControllPoint1('y', svgCanvas.getStart('y'))
      svgCanvas.setStart({ x: svgCanvas.getEnd('x'), y: svgCanvas.getEnd('y') })
      break
      // update path stretch line coordinates
    }
    case 'path': // fall through
    case 'pathedit': {
      x *= zoom
      y *= zoom

      if (svgCanvas.getCurConfig().gridSnapping) {
        x = snapToGrid(x)
        y = snapToGrid(y)
        svgCanvas.setStartX(snapToGrid(svgCanvas.getStartX()))
        svgCanvas.setStartY(snapToGrid(svgCanvas.getStartY()))
      }
      if (evt.shiftKey) {
        const { path } = pathModule
        let x1; let y1
        if (path) {
          x1 = path.dragging ? path.dragging[0] : svgCanvas.getStartX()
          y1 = path.dragging ? path.dragging[1] : svgCanvas.getStartY()
        } else {
          x1 = svgCanvas.getStartX()
          y1 = svgCanvas.getStartY()
        }
        xya = snapToAngle(x1, y1, x, y);
        ({ x, y } = xya)
      }

      if (svgCanvas.getRubberBox()?.getAttribute('display') !== 'none') {
        realX *= zoom
        realY *= zoom
        assignAttributes(svgCanvas.getRubberBox(), {
          x: Math.min(svgCanvas.getRStartX() * zoom, realX),
          y: Math.min(svgCanvas.getRStartY() * zoom, realY),
          width: Math.abs(realX - svgCanvas.getRStartX() * zoom),
          height: Math.abs(realY - svgCanvas.getRStartY() * zoom)
        }, 100)
      }
      svgCanvas.pathActions.mouseMove(x, y)

      break
    }
    case 'textedit': {
      x *= zoom
      y *= zoom
      svgCanvas.textActions.mouseMove(mouseX, mouseY)

      break
    }
    case 'rotate': {
      box = getBBox(selected)
      cx = box.x + box.width / 2
      cy = box.y + box.height / 2
      const m = getMatrix(selected)
      const center = transformPoint(cx, cy, m)
      cx = center.x
      cy = center.y
      angle = ((Math.atan2(cy - y, cx - x) * (180 / Math.PI)) - 90) % 360
      if (svgCanvas.getCurConfig().gridSnapping) {
        angle = snapToGrid(angle)
      }
      if (evt.shiftKey) { // restrict rotations to nice angles (WRS)
        const snap = 45
        angle = Math.round(angle / snap) * snap
      }

      svgCanvas.setRotationAngle(angle < -180 ? (360 + angle) : angle, true)
      svgCanvas.call('transition', selectedElements)
      break
    }
    default:
      // A mode can be defined by an extenstion
      break
  }

  /**
  * The mouse has moved on the canvas area.
  * @event module:svgcanvas.SvgCanvas#event:ext_mouseMove
  * @type {PlainObject}
  * @property {MouseEvent} event The event object
  * @property {Float} mouse_x x coordinate on canvas
  * @property {Float} mouse_y y coordinate on canvas
  * @property {Element} selected Refers to the first selected element
  */
  svgCanvas.runExtensions('mouseMove', /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseMove} */ {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY,
    selected
  })
} // mouseMove()

/**
*
* @returns {void}
*/
const mouseOutEvent = () => {
  const { $id } = svgCanvas
  if (svgCanvas.getCurrentMode() !== 'select' && svgCanvas.getStarted()) {
    const event = new Event('mouseup')
    $id('svgcanvas').dispatchEvent(event)
  }
}

// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
// and store it on the Undo stack
// - in move/resize mode, the element's attributes which were affected by the move/resize are
// identified, a ChangeElementCommand is created and stored on the stack for those attrs
// this is done in when we recalculate the selected dimensions()
/**
*
* @param {MouseEvent} evt
* @fires module:svgcanvas.SvgCanvas#event:zoomed
* @fires module:svgcanvas.SvgCanvas#event:changed
* @fires module:svgcanvas.SvgCanvas#event:ext_mouseUp
* @returns {void}
*/
const mouseUpEvent = (evt) => {
  moveSelectionThresholdReached = false
  if (evt.button === 2) { return }
  if (!svgCanvas.getStarted()) { return }

  svgCanvas.textActions.init()

  const selectedElements = svgCanvas.getSelectedElements()
  const zoom = svgCanvas.getZoom()

  const tempJustSelected = svgCanvas.getJustSelected()
  svgCanvas.setJustSelected(null)

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.getrootSctm())
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom
  const x = mouseX / zoom
  const y = mouseY / zoom

  let element = getElement(svgCanvas.getId())
  let keep = false

  const realX = x
  const realY = y

  // TODO: Make true when in multi-unit mode
  const useUnit = false // (svgCanvas.getCurConfig().baseUnit !== 'px');
  svgCanvas.setStarted(false)
  let t
  switch (svgCanvas.getCurrentMode()) {
    // intentionally fall-through to select here
    case 'resize':
    case 'multiselect':
      if (svgCanvas.getRubberBox()) {
        svgCanvas.getRubberBox().setAttribute('display', 'none')
        svgCanvas.setCurBBoxes([])
      }
      svgCanvas.setCurrentMode('select')
    // Fallthrough
    case 'select':
      if (selectedElements[0]) {
        // if we only have one selected element
        if (!selectedElements[1]) {
          // set our current stroke/fill properties to the element's
          const selected = selectedElements[0]
          switch (selected.tagName) {
            case 'g':
            case 'use':
            case 'image':
            case 'foreignObject':
              break
            case 'text':
              svgCanvas.setCurText('font_size', selected.getAttribute('font-size'))
              svgCanvas.setCurText('font_family', selected.getAttribute('font-family'))
            // fallthrough
            default:
              svgCanvas.setCurProperties('fill', selected.getAttribute('fill'))
              svgCanvas.setCurProperties('fill_opacity', selected.getAttribute('fill-opacity'))
              svgCanvas.setCurProperties('stroke', selected.getAttribute('stroke'))
              svgCanvas.setCurProperties('stroke_opacity', selected.getAttribute('stroke-opacity'))
              svgCanvas.setCurProperties('stroke_width', selected.getAttribute('stroke-width'))
              svgCanvas.setCurProperties('stroke_dasharray', selected.getAttribute('stroke-dasharray'))
              svgCanvas.setCurProperties('stroke_linejoin', selected.getAttribute('stroke-linejoin'))
              svgCanvas.setCurProperties('stroke_linecap', selected.getAttribute('stroke-linecap'))
          }
          svgCanvas.selectorManager.requestSelector(selected).showGrips(true)
        }
        // always recalculate dimensions to strip off stray identity transforms
        svgCanvas.recalculateAllSelectedDimensions()
        // if it was being dragged/resized
        if (realX !== svgCanvas.getRStartX() || realY !== svgCanvas.getRStartY()) {
          const len = selectedElements.length
          for (let i = 0; i < len; ++i) {
            if (!selectedElements[i]) { break }
            svgCanvas.selectorManager.requestSelector(selectedElements[i]).resize()
          }
          // no change in position/size, so maybe we should move to pathedit
        } else {
          t = evt.target
          if (selectedElements[0].nodeName === 'path' && !selectedElements[1]) {
            svgCanvas.pathActions.select(selectedElements[0])
            // if it was a path
            // else, if it was selected and this is a shift-click, remove it from selection
          } else if (evt.shiftKey && tempJustSelected !== t) {
            svgCanvas.removeFromSelection([t])
          }
        } // no change in mouse position

        // Remove non-scaling stroke
        const elem = selectedElements[0]
        if (elem) {
          elem.removeAttribute('style')
          walkTree(elem, (el) => {
            el.removeAttribute('style')
          })
        }
      }
      return
    case 'zoom': {
      svgCanvas.getRubberBox()?.setAttribute('display', 'none')
      const factor = evt.shiftKey ? 0.5 : 2
      svgCanvas.call('zoomed', {
        x: Math.min(svgCanvas.getRStartX(), realX),
        y: Math.min(svgCanvas.getRStartY(), realY),
        width: Math.abs(realX - svgCanvas.getRStartX()),
        height: Math.abs(realY - svgCanvas.getRStartY()),
        factor
      })
      return
    } case 'fhpath': {
      // Check that the path contains at least 2 points; a degenerate one-point path
      // causes problems.
      // Webkit ignores how we set the points attribute with commas and uses space
      // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
      svgCanvas.setSumDistance(0)
      svgCanvas.setControllPoint2('x', 0)
      svgCanvas.setControllPoint2('y', 0)
      svgCanvas.setControllPoint1('x', 0)
      svgCanvas.setControllPoint1('y', 0)
      svgCanvas.setStart({ x: 0, y: 0 })
      svgCanvas.setEnd('x', 0)
      svgCanvas.setEnd('y', 0)
      const coords = element.getAttribute('points')
      const commaIndex = coords.indexOf(',')
      keep = commaIndex >= 0 ? coords.includes(',', commaIndex + 1) : coords.includes(' ', coords.indexOf(' ') + 1)
      if (keep) {
        element = svgCanvas.pathActions.smoothPolylineIntoPath(element)
      }
      break
    } case 'line': {
      const x1 = element.getAttribute('x1')
      const y1 = element.getAttribute('y1')
      const x2 = element.getAttribute('x2')
      const y2 = element.getAttribute('y2')
      keep = (x1 !== x2 || y1 !== y2)
    }
      break
    case 'foreignObject':
    case 'square':
    case 'rect':
    case 'image': {
      const width = element.getAttribute('width')
      const height = element.getAttribute('height')
      // Image should be kept regardless of size (use inherit dimensions later)
      keep = (width || height) || svgCanvas.getCurrentMode() === 'image'
    }
      break
    case 'circle':
      keep = (element.getAttribute('r') !== '0')
      break
    case 'ellipse': {
      const rx = Number(element.getAttribute('rx'))
      const ry = Number(element.getAttribute('ry'))
      keep = (rx || ry)
    }
      break
    case 'fhellipse':
      if ((svgCanvas.getFreehand('maxx') - svgCanvas.getFreehand('minx')) > 0 &&
        (svgCanvas.getFreehand('maxy') - svgCanvas.getFreehand('miny')) > 0) {
        element = svgCanvas.addSVGElementsFromJson({
          element: 'ellipse',
          curStyles: true,
          attr: {
            cx: (svgCanvas.getFreehand('minx') + svgCanvas.getFreehand('maxx')) / 2,
            cy: (svgCanvas.getFreehand('miny') + svgCanvas.getFreehand('maxy')) / 2,
            rx: (svgCanvas.getFreehand('maxx') - svgCanvas.getFreehand('minx')) / 2,
            ry: (svgCanvas.getFreehand('maxy') - svgCanvas.getFreehand('miny')) / 2,
            id: svgCanvas.getId()
          }
        })
        svgCanvas.call('changed', [element])
        keep = true
      }
      break
    case 'fhrect':
      if ((svgCanvas.getFreehand('maxx') - svgCanvas.getFreehand('minx')) > 0 &&
        (svgCanvas.getFreehand('maxy') - svgCanvas.getFreehand('miny')) > 0) {
        element = svgCanvas.addSVGElementsFromJson({
          element: 'rect',
          curStyles: true,
          attr: {
            x: svgCanvas.getFreehand('minx'),
            y: svgCanvas.getFreehand('miny'),
            width: (svgCanvas.getFreehand('maxx') - svgCanvas.getFreehand('minx')),
            height: (svgCanvas.getFreehand('maxy') - svgCanvas.getFreehand('miny')),
            id: svgCanvas.getId()
          }
        })
        svgCanvas.call('changed', [element])
        keep = true
      }
      break
    case 'text':
      keep = true
      svgCanvas.selectOnly([element])
      svgCanvas.textActions.start(element)
      break
    case 'path': {
      // set element to null here so that it is not removed nor finalized
      element = null
      // continue to be set to true so that mouseMove happens
      svgCanvas.setStarted(true)

      const res = svgCanvas.pathActions.mouseUp(evt, element, mouseX, mouseY);
      ({ element } = res);
      ({ keep } = res)
      break
    } case 'pathedit':
      keep = true
      element = null
      svgCanvas.pathActions.mouseUp(evt)
      break
    case 'textedit':
      keep = false
      element = null
      svgCanvas.textActions.mouseUp(evt, mouseX, mouseY)
      break
    case 'rotate': {
      keep = true
      element = null
      svgCanvas.setCurrentMode('select')
      const batchCmd = svgCanvas.undoMgr.finishUndoableChange()
      if (!batchCmd.isEmpty()) {
        svgCanvas.addCommandToHistory(batchCmd)
      }
      // perform recalculation to weed out any stray identity transforms that might get stuck
      svgCanvas.recalculateAllSelectedDimensions()
      svgCanvas.call('changed', selectedElements)
      break
    } default:
      // This could occur in an extension
      break
  }

  /**
* The main (left) mouse button is released (anywhere).
* @event module:svgcanvas.SvgCanvas#event:ext_mouseUp
* @type {PlainObject}
* @property {MouseEvent} event The event object
* @property {Float} mouse_x x coordinate on canvas
* @property {Float} mouse_y y coordinate on canvas
*/
  const extResult = svgCanvas.runExtensions('mouseUp', {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY
  }, true)

  extResult.forEach((r) => {
    if (r) {
      keep = r.keep || keep;
      ({ element } = r)
      svgCanvas.setStarted(r.started || svgCanvas.getStarted())
    }
  })

  if (!keep && element) {
    svgCanvas.getCurrentDrawing().releaseId(svgCanvas.getId())
    element.remove()
    element = null

    t = evt.target

    // if this element is in a group, go up until we reach the top-level group
    // just below the layer groups
    // TODO: once we implement links, we also would have to check for <a> elements
    while (t?.parentNode?.parentNode?.tagName === 'g') {
      t = t.parentNode
    }
    // if we are not in the middle of creating a path, and we've clicked on some shape,
    // then go to Select mode.
    // WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
    if ((svgCanvas.getCurrentMode() !== 'path' || !svgCanvas.getDrawnPath()) &&
      t &&
      t.parentNode?.id !== 'selectorParentGroup' &&
      t.id !== 'svgcanvas' && t.id !== 'svgroot'
    ) {
      // switch into "select" mode if we've clicked on an element
      svgCanvas.setMode('select')
      svgCanvas.selectOnly([t], true)
    }
  } else if (element) {
    /**
* @name module:svgcanvas.SvgCanvas#addedNew
* @type {boolean}
*/
    svgCanvas.addedNew = true

    if (useUnit) { convertAttrs(element) }

    let aniDur = 0.2
    let cAni
    const curShape = svgCanvas.getStyle()
    const opacAni = svgCanvas.getOpacAni()
    if (opacAni.beginElement && Number.parseFloat(element.getAttribute('opacity')) !== curShape.opacity) {
      cAni = opacAni.cloneNode(true)
      cAni.setAttribute('to', curShape.opacity)
      cAni.setAttribute('dur', aniDur)
      element.appendChild(cAni)
      try {
        // Fails in FF4 on foreignObject
        cAni.beginElement()
      } catch (e) { /* empty fn */ }
    } else {
      aniDur = 0
    }

    // Ideally this would be done on the endEvent of the animation,
    // but that doesn't seem to be supported in Webkit
    setTimeout(() => {
      if (cAni) { cAni.remove() }
      element.setAttribute('opacity', curShape.opacity)
      element.setAttribute('style', 'pointer-events:inherit')
      cleanupElement(element)
      if (svgCanvas.getCurrentMode() === 'path') {
        svgCanvas.pathActions.toEditMode(element)
      } else if (svgCanvas.getCurConfig().selectNew) {
        const modes = ['circle', 'ellipse', 'square', 'rect', 'fhpath', 'line', 'fhellipse', 'fhrect', 'star', 'polygon']
        if (modes.indexOf(svgCanvas.getCurrentMode()) !== -1) {
          svgCanvas.setMode('select')
        }
        svgCanvas.selectOnly([element], true)
      }
      // we create the insert command that is stored on the stack
      // undo means to call cmd.unapply(), redo means to call cmd.apply()
      svgCanvas.addCommandToHistory(new InsertElementCommand(element))
      svgCanvas.call('changed', [element])
    }, aniDur * 1000)
  }
  svgCanvas.setStartTransform(null)
}

const dblClickEvent = (evt) => {
  const selectedElements = svgCanvas.getSelectedElements()
  const evtTarget = evt.target
  const parent = evtTarget.parentNode

  let mouseTarget = svgCanvas.getMouseTarget(evt)
  const { tagName } = mouseTarget

  if (tagName === 'text' && svgCanvas.getCurrentMode() !== 'textedit') {
    const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.getrootSctm())
    svgCanvas.textActions.select(mouseTarget, pt.x, pt.y)
  }

  // Do nothing if already in current group
  if (parent === svgCanvas.getCurrentGroup()) { return }

  if ((tagName === 'g' || tagName === 'a') && getRotationAngle(mouseTarget)) {
    // TODO: Allow method of in-group editing without having to do
    // this (similar to editing rotated paths)

    // Ungroup and regroup
    svgCanvas.pushGroupProperties(mouseTarget)
    mouseTarget = selectedElements[0]
    svgCanvas.clearSelection(true)
  }
  // Reset context
  if (svgCanvas.getCurrentGroup()) {
    draw.leaveContext()
  }

  if ((parent.tagName !== 'g' && parent.tagName !== 'a') ||
    parent === svgCanvas.getCurrentDrawing().getCurrentLayer() ||
    mouseTarget === svgCanvas.selectorManager.selectorParentGroup
  ) {
    // Escape from in-group edit
    return
  }
  draw.setContext(mouseTarget)
}

/**
 * Follows these conditions:
 * - When we are in a create mode, the element is added to the canvas but the
 *   action is not recorded until mousing up.
 * - When we are in select mode, select the element, remember the position
 *   and do nothing else.
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:ext_mouseDown
 * @returns {void}
 */
const mouseDownEvent = (evt) => {
  const dataStorage = svgCanvas.getDataStorage()
  const selectedElements = svgCanvas.getSelectedElements()
  const zoom = svgCanvas.getZoom()
  const curShape = svgCanvas.getStyle()
  const svgRoot = svgCanvas.getSvgRoot()
  const { $id } = svgCanvas

  if (svgCanvas.spaceKey || evt.button === 1) { return }

  const rightClick = (evt.button === 2)

  if (evt.altKey) { // duplicate when dragging
    svgCanvas.cloneSelectedElements(0, 0)
  }

  svgCanvas.setRootSctm($id('svgcontent').querySelector('g').getScreenCTM().inverse())

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.getrootSctm())
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom

  evt.preventDefault()

  if (rightClick) {
    if (svgCanvas.getCurrentMode() === 'path') {
      return
    }
    svgCanvas.setCurrentMode('select')
    svgCanvas.setLastClickPoint(pt)
  }

  let x = mouseX / zoom
  let y = mouseY / zoom
  let mouseTarget = svgCanvas.getMouseTarget(evt)

  if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
    mouseTarget = mouseTarget.firstChild
  }

  // realX/y ignores grid-snap value
  const realX = x
  svgCanvas.setStartX(x)
  svgCanvas.setRStartX(x)
  const realY = y
  svgCanvas.setStartY(y)
  svgCanvas.setRStartY(y)

  if (svgCanvas.getCurConfig().gridSnapping) {
    x = snapToGrid(x)
    y = snapToGrid(y)
    svgCanvas.setStartX(snapToGrid(svgCanvas.getStartX()))
    svgCanvas.setStartY(snapToGrid(svgCanvas.getStartY()))
  }

  // if it is a selector grip, then it must be a single element selected,
  // set the mouseTarget to that and update the mode to rotate/resize

  if (mouseTarget === svgCanvas.selectorManager.selectorParentGroup && selectedElements[0]) {
    const grip = evt.target
    const griptype = dataStorage.get(grip, 'type')
    // rotating
    if (griptype === 'rotate') {
      svgCanvas.setCurrentMode('rotate')
      // svgCanvas.setCurrentRotateMode(dataStorage.get(grip, 'dir'));
      // resizing
    } else if (griptype === 'resize') {
      svgCanvas.setCurrentMode('resize')
      svgCanvas.setCurrentResizeMode(dataStorage.get(grip, 'dir'))
    }
    mouseTarget = selectedElements[0]
  }

  svgCanvas.setStartTransform(mouseTarget.getAttribute('transform'))

  const tlist = mouseTarget.transform.baseVal
  // consolidate transforms using standard SVG but keep the transformation used for the move/scale
  if (tlist.numberOfItems > 1) {
    const firstTransform = tlist.getItem(0)
    tlist.removeItem(0)
    tlist.consolidate()
    tlist.insertItemBefore(firstTransform, 0)
  }
  switch (svgCanvas.getCurrentMode()) {
    case 'select':
      svgCanvas.setStarted(true)
      svgCanvas.setCurrentResizeMode('none')
      if (rightClick) { svgCanvas.setStarted(false) }

      if (mouseTarget !== svgRoot) {
        // if this element is not yet selected, clear selection and select it
        if (!selectedElements.includes(mouseTarget)) {
          // only clear selection if shift is not pressed (otherwise, add
          // element to selection)
          if (!evt.shiftKey) {
            // No need to do the call here as it will be done on addToSelection
            svgCanvas.clearSelection(true)
          }
          svgCanvas.addToSelection([mouseTarget])
          svgCanvas.setJustSelected(mouseTarget)
          svgCanvas.pathActions.clear()
        }
        // else if it's a path, go into pathedit mode in mouseup

        if (!rightClick) {
          // insert a dummy transform so if the element(s) are moved it will have
          // a transform to use for its translate
          for (const selectedElement of selectedElements) {
            if (!selectedElement) { continue }
            const slist = selectedElement.transform?.baseVal
            if (slist.numberOfItems) {
              slist.insertItemBefore(svgRoot.createSVGTransform(), 0)
            } else {
              slist.appendItem(svgRoot.createSVGTransform())
            }
          }
        }
      } else if (!rightClick) {
        svgCanvas.clearSelection()
        svgCanvas.setCurrentMode('multiselect')
        if (!svgCanvas.getRubberBox()) {
          svgCanvas.setRubberBox(svgCanvas.selectorManager.getRubberBandBox())
        }
        svgCanvas.setRStartX(svgCanvas.getRStartX() * zoom)
        svgCanvas.setRStartY(svgCanvas.getRStartY() * zoom)

        assignAttributes(svgCanvas.getRubberBox(), {
          x: svgCanvas.getRStartX(),
          y: svgCanvas.getRStartY(),
          width: 0,
          height: 0,
          display: 'inline'
        }, 100)
      }
      break
    case 'zoom':
      svgCanvas.setStarted(true)
      if (!svgCanvas.getRubberBox()) {
        svgCanvas.setRubberBox(svgCanvas.selectorManager.getRubberBandBox())
      }
      assignAttributes(svgCanvas.getRubberBox(), {
        x: realX * zoom,
        y: realX * zoom,
        width: 0,
        height: 0,
        display: 'inline'
      }, 100)
      break
    case 'resize': {
      svgCanvas.setStarted(true)
      svgCanvas.setStartX(x)
      svgCanvas.setStartY(y)

      // Getting the BBox from the selection box, since we know we
      // want to orient around it
      svgCanvas.setInitBbox(getBBox($id('selectedBox0')))
      const bb = {}
      for (const [key, val] of Object.entries(svgCanvas.getInitBbox())) {
        bb[key] = val / zoom
      }
      svgCanvas.setInitBbox(bb)

      // append three dummy transforms to the tlist so that
      // we can translate,scale,translate in mousemove
      const pos = getRotationAngle(mouseTarget) ? 1 : 0

      if (hasMatrixTransform(tlist)) {
        tlist.insertItemBefore(svgRoot.createSVGTransform(), pos)
        tlist.insertItemBefore(svgRoot.createSVGTransform(), pos)
        tlist.insertItemBefore(svgRoot.createSVGTransform(), pos)
      } else {
        tlist.appendItem(svgRoot.createSVGTransform())
        tlist.appendItem(svgRoot.createSVGTransform())
        tlist.appendItem(svgRoot.createSVGTransform())
      }
      break
    }
    case 'fhellipse':
    case 'fhrect':
    case 'fhpath':
      svgCanvas.setStart({ x: realX, y: realY })
      svgCanvas.setControllPoint1('x', 0)
      svgCanvas.setControllPoint1('y', 0)
      svgCanvas.setControllPoint2('x', 0)
      svgCanvas.setControllPoint2('y', 0)
      svgCanvas.setStarted(true)
      svgCanvas.setDAttr(realX + ',' + realY + ' ')
      // Commented out as doing nothing now:
      // strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
      svgCanvas.addSVGElementsFromJson({
        element: 'polyline',
        curStyles: true,
        attr: {
          points: svgCanvas.getDAttr(),
          id: svgCanvas.getNextId(),
          fill: 'none',
          opacity: curShape.opacity / 2,
          'stroke-linecap': 'round',
          style: 'pointer-events:none'
        }
      })
      svgCanvas.setFreehand('minx', realX)
      svgCanvas.setFreehand('maxx', realX)
      svgCanvas.setFreehand('miny', realY)
      svgCanvas.setFreehand('maxy', realY)
      break
    case 'image': {
      svgCanvas.setStarted(true)
      const newImage = svgCanvas.addSVGElementsFromJson({
        element: 'image',
        attr: {
          x,
          y,
          width: 0,
          height: 0,
          id: svgCanvas.getNextId(),
          opacity: curShape.opacity / 2,
          style: 'pointer-events:inherit'
        }
      })
      setHref(newImage, svgCanvas.getLastGoodImgUrl())
      preventClickDefault(newImage)
      break
    } case 'square':
    // TODO: once we create the rect, we lose information that this was a square
    // (for resizing purposes this could be important)
    // Fallthrough
    case 'rect':
      svgCanvas.setStarted(true)
      svgCanvas.setStartX(x)
      svgCanvas.setStartY(y)
      svgCanvas.addSVGElementsFromJson({
        element: 'rect',
        curStyles: true,
        attr: {
          x,
          y,
          width: 0,
          height: 0,
          id: svgCanvas.getNextId(),
          opacity: curShape.opacity / 2
        }
      })
      break
    case 'line': {
      svgCanvas.setStarted(true)
      const strokeW = Number(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width
      svgCanvas.addSVGElementsFromJson({
        element: 'line',
        curStyles: true,
        attr: {
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          id: svgCanvas.getNextId(),
          stroke: curShape.stroke,
          'stroke-width': strokeW,
          'stroke-dasharray': curShape.stroke_dasharray,
          'stroke-linejoin': curShape.stroke_linejoin,
          'stroke-linecap': curShape.stroke_linecap,
          'stroke-opacity': curShape.stroke_opacity,
          fill: 'none',
          opacity: curShape.opacity / 2,
          style: 'pointer-events:none'
        }
      })
      break
    } case 'circle':
      svgCanvas.setStarted(true)
      svgCanvas.addSVGElementsFromJson({
        element: 'circle',
        curStyles: true,
        attr: {
          cx: x,
          cy: y,
          r: 0,
          id: svgCanvas.getNextId(),
          opacity: curShape.opacity / 2
        }
      })
      break
    case 'ellipse':
      svgCanvas.setStarted(true)
      svgCanvas.addSVGElementsFromJson({
        element: 'ellipse',
        curStyles: true,
        attr: {
          cx: x,
          cy: y,
          rx: 0,
          ry: 0,
          id: svgCanvas.getNextId(),
          opacity: curShape.opacity / 2
        }
      })
      break
    case 'text':
      svgCanvas.setStarted(true)
      /* const newText = */ svgCanvas.addSVGElementsFromJson({
        element: 'text',
        curStyles: true,
        attr: {
          x,
          y,
          id: svgCanvas.getNextId(),
          fill: svgCanvas.getCurText('fill'),
          'stroke-width': svgCanvas.getCurText('stroke_width'),
          'font-size': svgCanvas.getCurText('font_size'),
          'font-family': svgCanvas.getCurText('font_family'),
          'text-anchor': 'middle',
          'xml:space': 'preserve',
          opacity: curShape.opacity
        }
      })
      // newText.textContent = 'text';
      break
    case 'path':
    // Fall through
    case 'pathedit':
      svgCanvas.setStartX(svgCanvas.getStartX() * zoom)
      svgCanvas.setStartY(svgCanvas.getStartY() * zoom)
      svgCanvas.pathActions.mouseDown(evt, mouseTarget, svgCanvas.getStartX(), svgCanvas.getStartY())
      svgCanvas.setStarted(true)
      break
    case 'textedit':
      svgCanvas.setStartX(svgCanvas.getStartX() * zoom)
      svgCanvas.setStartY(svgCanvas.getStartY() * zoom)
      svgCanvas.textActions.mouseDown(evt, mouseTarget, svgCanvas.getStartX(), svgCanvas.getStartY())
      svgCanvas.setStarted(true)
      break
    case 'rotate':
      svgCanvas.setStarted(true)
      // we are starting an undoable change (a drag-rotation)
      svgCanvas.undoMgr.beginUndoableChange('transform', selectedElements)
      break
    default:
      // This could occur in an extension
      break
  }

  /**
* The main (left) mouse button is held down on the canvas area.
* @event module:svgcanvas.SvgCanvas#event:ext_mouseDown
* @type {PlainObject}
* @property {MouseEvent} event The event object
* @property {Float} start_x x coordinate on canvas
* @property {Float} start_y y coordinate on canvas
* @property {Element[]} selectedElements An array of the selected Elements
*/
  const extResult = svgCanvas.runExtensions('mouseDown', {
    event: evt,
    start_x: svgCanvas.getStartX(),
    start_y: svgCanvas.getStartY(),
    selectedElements
  }, true)

  extResult.forEach((r) => {
    if (r?.started) {
      svgCanvas.setStarted(true)
    }
  })
}
/**
 * @param {Event} e
 * @fires module:event.SvgCanvas#event:updateCanvas
 * @fires module:event.SvgCanvas#event:zoomDone
 * @returns {void}
 */
const DOMMouseScrollEvent = (e) => {
  const zoom = svgCanvas.getZoom()
  const { $id } = svgCanvas
  if (!e.shiftKey) { return }

  e.preventDefault()

  svgCanvas.setRootSctm($id('svgcontent').querySelector('g').getScreenCTM().inverse())

  const workarea = document.getElementById('workarea')
  const scrbar = 15
  const rulerwidth = svgCanvas.getCurConfig().showRulers ? 16 : 0

  // mouse relative to content area in content pixels
  const pt = transformPoint(e.clientX, e.clientY, svgCanvas.getrootSctm())

  // full work area width in screen pixels
  const editorFullW = parseFloat(getComputedStyle(workarea, null).width.replace('px', ''))
  const editorFullH = parseFloat(getComputedStyle(workarea, null).height.replace('px', ''))

  // work area width minus scroll and ruler in screen pixels
  const editorW = editorFullW - scrbar - rulerwidth
  const editorH = editorFullH - scrbar - rulerwidth

  // work area width in content pixels
  const workareaViewW = editorW * svgCanvas.getrootSctm().a
  const workareaViewH = editorH * svgCanvas.getrootSctm().d

  // content offset from canvas in screen pixels
  const wOffset = findPos(workarea)
  const wOffsetLeft = wOffset.left + rulerwidth
  const wOffsetTop = wOffset.top + rulerwidth

  const delta = (e.wheelDelta) ? e.wheelDelta : (e.detail) ? -e.detail : 0
  if (!delta) { return }

  let factor = Math.max(3 / 4, Math.min(4 / 3, (delta)))

  let wZoom; let hZoom
  if (factor > 1) {
    wZoom = Math.ceil(editorW / workareaViewW * factor * 100) / 100
    hZoom = Math.ceil(editorH / workareaViewH * factor * 100) / 100
  } else {
    wZoom = Math.floor(editorW / workareaViewW * factor * 100) / 100
    hZoom = Math.floor(editorH / workareaViewH * factor * 100) / 100
  }
  let zoomlevel = Math.min(wZoom, hZoom)
  zoomlevel = Math.min(10, Math.max(0.01, zoomlevel))
  if (zoomlevel === zoom) {
    return
  }
  factor = zoomlevel / zoom

  // top left of workarea in content pixels before zoom
  const topLeftOld = transformPoint(wOffsetLeft, wOffsetTop, svgCanvas.getrootSctm())

  // top left of workarea in content pixels after zoom
  const topLeftNew = {
    x: pt.x - (pt.x - topLeftOld.x) / factor,
    y: pt.y - (pt.y - topLeftOld.y) / factor
  }

  // top left of workarea in canvas pixels relative to content after zoom
  const topLeftNewCanvas = {
    x: topLeftNew.x * zoomlevel,
    y: topLeftNew.y * zoomlevel
  }

  // new center in canvas pixels
  const newCtr = {
    x: topLeftNewCanvas.x - rulerwidth + editorFullW / 2,
    y: topLeftNewCanvas.y - rulerwidth + editorFullH / 2
  }

  svgCanvas.setZoom(zoomlevel)
  document.getElementById('zoom').value = ((zoomlevel * 100).toFixed(1))

  svgCanvas.call('updateCanvas', { center: false, newCtr })
  svgCanvas.call('zoomDone')
}
