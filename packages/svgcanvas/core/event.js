/**
 * Tools for event.
 * @module event
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import {
  assignAttributes,
  cleanupElement,
  getElement,
  getRotationAngle,
  snapToGrid,
  walkTree,
  preventClickDefault,
  setHref,
  getBBox
} from './utilities.js'
import { convertAttrs } from './units.js'
import {
  transformPoint,
  hasMatrixTransform,
  getMatrix,
  snapToAngle,
  getTransformList
} from './math.js'
import * as draw from './draw.js'
import * as pathModule from './path.js'
import * as hstry from './history.js'
import { findPos } from '../../svgcanvas/common/util.js'

const { InsertElementCommand } = hstry

let svgCanvas = null
let moveSelectionThresholdReached = false

/**
 * @function module:undo.init
 * @param {module:undo.eventContext} eventContext
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
  svgCanvas.mouseDownEvent = mouseDownEvent
  svgCanvas.mouseMoveEvent = mouseMoveEvent
  svgCanvas.dblClickEvent = dblClickEvent
  svgCanvas.mouseUpEvent = mouseUpEvent
  svgCanvas.mouseOutEvent = mouseOutEvent
  svgCanvas.DOMMouseScrollEvent = DOMMouseScrollEvent
}

const getBsplinePoint = t => {
  const spline = { x: 0, y: 0 }
  const p0 = {
    x: svgCanvas.controllPoint2.x,
    y: svgCanvas.controllPoint2.y
  }
  const p1 = {
    x: svgCanvas.controllPoint1.x,
    y: svgCanvas.controllPoint1.y
  }
  const p2 = { x: svgCanvas.start.x, y: svgCanvas.start.y }
  const p3 = { x: svgCanvas.end.x, y: svgCanvas.end.y }
  const S = 1.0 / 6.0
  const t2 = t * t
  const t3 = t2 * t

  const m = [
    [-1, 3, -3, 1],
    [3, -6, 3, 0],
    [-3, 0, 3, 0],
    [1, 4, 1, 0]
  ]

  spline.x =
    S *
    ((p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3 +
      (p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2 +
      (p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t +
      (p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3]))
  spline.y =
    S *
    ((p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3 +
      (p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2 +
      (p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t +
      (p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3]))

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
  const tlist = getTransformList(element)
  if (tlist.numberOfItems) {
    const firstItem = tlist.getItem(0)
    if (firstItem.type === 2) {
      // SVG_TRANSFORM_TRANSLATE = 2
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
const mouseMoveEvent = evt => {
  // if the mouse is move without dragging an element, just return.
  if (!svgCanvas.started) {
    return
  }
  if (evt.button === 1 || svgCanvas.spaceKey) {
    return
  }

  svgCanvas.textActions.init()

  evt.preventDefault()

  const selectedElements = svgCanvas.selectedElements
  const zoom = svgCanvas.zoom
  const svgRoot = svgCanvas.svgRoot
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

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.rootSctm)
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom
  const shape = getElement(svgCanvas.id)

  let realX = mouseX / zoom
  let x = realX
  let realY = mouseY / zoom
  let y = realY

  if (svgCanvas.curConfig.gridSnapping) {
    x = snapToGrid(x)
    y = snapToGrid(y)
  }

  let tlist
  switch (svgCanvas.currentMode) {
    case 'select': {
      // we temporarily use a translate on the element(s) being dragged
      // this transform is removed upon mousing up and the element is
      // relocated to the new location
      if (selected) {
        dx = x - svgCanvas.startX
        dy = y - svgCanvas.startY
        if (svgCanvas.curConfig.gridSnapping) {
          dx = snapToGrid(dx)
          dy = snapToGrid(dy)
        }

        // Enable moving selection only if mouse has been moved at least 4 px in any direction
        // This prevents objects from being accidentally moved when (initially) selected
        const deltaThreshold = 4
        const deltaThresholdReached =
          Math.abs(dx) > deltaThreshold || Math.abs(dy) > deltaThreshold
        moveSelectionThresholdReached =
          moveSelectionThresholdReached || deltaThresholdReached

        if (moveSelectionThresholdReached) {
          selectedElements.forEach(el => {
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
      assignAttributes(
        svgCanvas.rubberBox,
        {
          x: Math.min(svgCanvas.rStartX, realX),
          y: Math.min(svgCanvas.rStartY, realY),
          width: Math.abs(realX - svgCanvas.rStartX),
          height: Math.abs(realY - svgCanvas.rStartY)
        },
        100
      )

      // for each selected:
      // - if newList contains selected, do nothing
      // - if newList doesn't contain selected, remove it from selected
      // - for any newList that was not in selectedElements, add it to selected
      const elemsToRemove = selectedElements.slice()
      const elemsToAdd = []
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
      tlist = getTransformList(selected)
      const hasMatrix = hasMatrixTransform(tlist)
      box = hasMatrix ? svgCanvas.initBbox : getBBox(selected)
      let left = box.x
      let top = box.y
      let { width, height } = box
      dx = x - svgCanvas.startX
      dy = y - svgCanvas.startY

      if (svgCanvas.curConfig.gridSnapping) {
        dx = snapToGrid(dx)
        dy = snapToGrid(dy)
        height = snapToGrid(height)
        width = snapToGrid(width)
      }

      // if rotated, adjust the dx,dy values
      angle = getRotationAngle(selected)
      if (angle) {
        const r = Math.sqrt(dx * dx + dy * dy)
        const theta = Math.atan2(dy, dx) - (angle * Math.PI) / 180.0
        dx = r * Math.cos(theta)
        dy = r * Math.sin(theta)
      }

      // if not stretching in y direction, set dy to 0
      // if not stretching in x direction, set dx to 0
      if (
        !svgCanvas.currentResizeMode.includes('n') &&
        !svgCanvas.currentResizeMode.includes('s')
      ) {
        dy = 0
      }
      if (
        !svgCanvas.currentResizeMode.includes('e') &&
        !svgCanvas.currentResizeMode.includes('w')
      ) {
        dx = 0
      }

      let // ts = null,
        tx = 0
      let ty = 0
      let sy = height ? (height + dy) / height : 1
      let sx = width ? (width + dx) / width : 1
      // if we are dragging on the north side, then adjust the scale factor and ty
      if (svgCanvas.currentResizeMode.includes('n')) {
        sy = height ? (height - dy) / height : 1
        ty = height
      }

      // if we dragging on the east side, then adjust the scale factor and tx
      if (svgCanvas.currentResizeMode.includes('w')) {
        sx = width ? (width - dx) / width : 1
        tx = width
      }

      // update the transform list with translate,scale,translate
      const translateOrigin = svgRoot.createSVGTransform()
      const scale = svgRoot.createSVGTransform()
      const translateBack = svgRoot.createSVGTransform()

      if (svgCanvas.curConfig.gridSnapping) {
        left = snapToGrid(left)
        tx = snapToGrid(tx)
        top = snapToGrid(top)
        ty = snapToGrid(ty)
      }

      translateOrigin.setTranslate(-(left + tx), -(top + ty))
      // For images, we maintain aspect ratio by default and relax when shift pressed
      const maintainAspectRatio =
        (selected.tagName !== 'image' && evt.shiftKey) ||
        (selected.tagName === 'image' && !evt.shiftKey)
      if (maintainAspectRatio) {
        if (sx === 1) {
          sx = sy
        } else {
          sy = sx
        }
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
      assignAttributes(
        svgCanvas.rubberBox,
        {
          x: Math.min(svgCanvas.rStartX * zoom, realX),
          y: Math.min(svgCanvas.rStartY * zoom, realY),
          width: Math.abs(realX - svgCanvas.rStartX * zoom),
          height: Math.abs(realY - svgCanvas.rStartY * zoom)
        },
        100
      )
      break
    }
    case 'text': {
      assignAttributes(
        shape,
        {
          x,
          y
        },
        1000
      )
      break
    }
    case 'line': {
      if (svgCanvas.curConfig.gridSnapping) {
        x = snapToGrid(x)
        y = snapToGrid(y)
      }

      let x2 = x
      let y2 = y

      if (evt.shiftKey) {
        xya = snapToAngle(svgCanvas.startX, svgCanvas.startY, x2, y2)
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
      const maintainAspectRatio =
        svgCanvas.currentMode === 'square' ||
        (svgCanvas.currentMode === 'image' && !evt.shiftKey) ||
        (svgCanvas.currentMode !== 'image' && evt.shiftKey)

      let w = Math.abs(x - svgCanvas.startX)
      let h = Math.abs(y - svgCanvas.startY)
      let newX
      let newY
      if (maintainAspectRatio) {
        w = h = Math.max(w, h)
        newX = svgCanvas.startX < x ? svgCanvas.startX : svgCanvas.startX - w
        newY = svgCanvas.startY < y ? svgCanvas.startY : svgCanvas.startY - h
      } else {
        newX = Math.min(svgCanvas.startX, x)
        newY = Math.min(svgCanvas.startY, y)
      }

      if (svgCanvas.curConfig.gridSnapping) {
        w = snapToGrid(w)
        h = snapToGrid(h)
        newX = snapToGrid(newX)
        newY = snapToGrid(newY)
      }

      assignAttributes(
        shape,
        {
          width: w,
          height: h,
          x: newX,
          y: newY
        },
        1000
      )

      break
    }
    case 'circle': {
      cx = Number(shape.getAttribute('cx'))
      cy = Number(shape.getAttribute('cy'))
      let rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))
      if (svgCanvas.curConfig.gridSnapping) {
        rad = snapToGrid(rad)
      }
      shape.setAttribute('r', rad)
      break
    }
    case 'ellipse': {
      cx = Number(shape.getAttribute('cx'))
      cy = Number(shape.getAttribute('cy'))
      if (svgCanvas.curConfig.gridSnapping) {
        x = snapToGrid(x)
        cx = snapToGrid(cx)
        y = snapToGrid(y)
        cy = snapToGrid(cy)
      }
      shape.setAttribute('rx', Math.abs(x - cx))
      const ry = Math.abs(evt.shiftKey ? x - cx : y - cy)
      shape.setAttribute('ry', ry)
      break
    }
    case 'fhellipse':
    case 'fhrect': {
      svgCanvas.freehand.minx = Math.min(realX, svgCanvas.freehand.minx)
      svgCanvas.freehand.maxx = Math.max(realX, svgCanvas.freehand.maxx)
      svgCanvas.freehand.miny = Math.min(realY, svgCanvas.freehand.miny)
      svgCanvas.freehand.maxy = Math.max(realY, svgCanvas.freehand.maxy)
    }
    // Fallthrough
    case 'fhpath': {
      // Reset values using direct property assignment:
      svgCanvas.sumDistance = 0
      svgCanvas.controllPoint2.x = 0
      svgCanvas.controllPoint2.y = 0
      svgCanvas.controllPoint1.x = 0
      svgCanvas.controllPoint1.y = 0
      svgCanvas.start = { x: 0, y: 0 }
      svgCanvas.end.x = 0
      svgCanvas.end.y = 0
      if (svgCanvas.controllPoint2.x && svgCanvas.controllPoint2.y) {
        for (let i = 0; i < svgCanvas.stepCount - 1; i++) {
          svgCanvas.parameter = i / svgCanvas.stepCount
          svgCanvas.nextParameter = (i + 1) / svgCanvas.stepCount
          svgCanvas.bSpline = getBsplinePoint(svgCanvas.nextParameter)
          svgCanvas.nextPos = { x: svgCanvas.bSpline.x, y: svgCanvas.bSpline.y }
          svgCanvas.bSpline = getBsplinePoint(svgCanvas.parameter)
          svgCanvas.sumDistance =
            svgCanvas.sumDistance +
            Math.sqrt(
              (svgCanvas.nextPos.x - svgCanvas.bSpline.x) *
                (svgCanvas.nextPos.x - svgCanvas.bSpline.x) +
                (svgCanvas.nextPos.y - svgCanvas.bSpline.y) *
                  (svgCanvas.nextPos.y - svgCanvas.bSpline.y)
            )
          if (svgCanvas.sumDistance > svgCanvas.thresholdDist) {
            svgCanvas.sumDistance =
              svgCanvas.sumDistance - svgCanvas.thresholdDist
            const point = svgCanvas.svgContent.createSVGPoint()
            point.x = svgCanvas.bSpline.x
            point.y = svgCanvas.bSpline.y
            shape.points.appendItem(point)
          }
        }
      }
      // After loop, update control points directly:
      svgCanvas.controllPoint2.x = svgCanvas.controllPoint1.x
      svgCanvas.controllPoint2.y = svgCanvas.controllPoint1.y
      svgCanvas.controllPoint1.x = svgCanvas.start.x
      svgCanvas.controllPoint1.y = svgCanvas.start.y
      svgCanvas.start = { x: svgCanvas.end.x, y: svgCanvas.end.y }
      break
      // update path stretch line coordinates
    }
    case 'path': // fall through
    case 'pathedit': {
      x *= zoom
      y *= zoom

      if (svgCanvas.curConfig.gridSnapping) {
        x = snapToGrid(x)
        y = snapToGrid(y)
        svgCanvas.startX = snapToGrid(svgCanvas.startX)
        svgCanvas.startY = snapToGrid(svgCanvas.startY)
      }
      if (evt.shiftKey) {
        const { path } = pathModule
        let x1
        let y1
        if (path) {
          x1 = path.dragging ? path.dragging[0] : svgCanvas.startX
          y1 = path.dragging ? path.dragging[1] : svgCanvas.startY
        } else {
          x1 = svgCanvas.startX
          y1 = svgCanvas.startY
        }
        xya = snapToAngle(x1, y1, x, y)
        ;({ x, y } = xya)
      }

      if (svgCanvas.rubberBox?.getAttribute('display') !== 'none') {
        realX *= zoom
        realY *= zoom
        assignAttributes(
          svgCanvas.rubberBox,
          {
            x: Math.min(svgCanvas.rStartX * zoom, realX),
            y: Math.min(svgCanvas.rStartY * zoom, realY),
            width: Math.abs(realX - svgCanvas.rStartX * zoom),
            height: Math.abs(realY - svgCanvas.rStartY * zoom)
          },
          100
        )
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
      angle = (Math.atan2(cy - y, cx - x) * (180 / Math.PI) - 90) % 360
      if (svgCanvas.curConfig.gridSnapping) {
        angle = snapToGrid(angle)
      }
      if (evt.shiftKey) {
        // restrict rotations to nice angles (WRS)
        const snap = 45
        angle = Math.round(angle / snap) * snap
      }

      svgCanvas.setRotationAngle(angle < -180 ? 360 + angle : angle, true)
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
  svgCanvas.runExtensions(
    'mouseMove',
    /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseMove} */ {
      event: evt,
      mouse_x: mouseX,
      mouse_y: mouseY,
      selected
    }
  )
} // mouseMove()

/**
 *
 * @returns {void}
 */
const mouseOutEvent = () => {
  const { $id } = svgCanvas
  if (svgCanvas.currentMode !== 'select' && svgCanvas.started) {
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
const mouseUpEvent = evt => {
  evt.preventDefault()
  moveSelectionThresholdReached = false
  if (evt.button === 2) {
    return
  }
  if (!svgCanvas.started) {
    return
  }

  svgCanvas.textActions.init()

  const selectedElements = svgCanvas.selectedElements
  const zoom = svgCanvas.zoom

  const tempJustSelected = svgCanvas.justSelected
  svgCanvas.justSelected = null

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.rootSctm)
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom
  const x = mouseX / zoom
  const y = mouseY / zoom

  let element = getElement(svgCanvas.id)
  let keep = false

  const realX = x
  const realY = y

  // TODO: Make true when in multi-unit mode
  const useUnit = false
  svgCanvas.started = false
  let t
  switch (svgCanvas.currentMode) {
    // intentionally fall-through to select here
    case 'resize':
    case 'multiselect':
      if (svgCanvas.rubberBox) {
        svgCanvas.rubberBox.setAttribute('display', 'none')
        svgCanvas.curBBoxes = []
      }
      svgCanvas.currentMode = 'select'
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
              svgCanvas.curText.font_size = selected.getAttribute('font-size')
              svgCanvas.curText.font_family =
                selected.getAttribute('font-family')

            // fallthrough
            default:
              svgCanvas.setCurProperties('fill', selected.getAttribute('fill'))
              svgCanvas.setCurProperties(
                'fill_opacity',
                selected.getAttribute('fill-opacity')
              )
              svgCanvas.setCurProperties(
                'stroke',
                selected.getAttribute('stroke')
              )
              svgCanvas.setCurProperties(
                'stroke_opacity',
                selected.getAttribute('stroke-opacity')
              )
              svgCanvas.setCurProperties(
                'stroke_width',
                selected.getAttribute('stroke-width')
              )
              svgCanvas.setCurProperties(
                'stroke_dasharray',
                selected.getAttribute('stroke-dasharray')
              )
              svgCanvas.setCurProperties(
                'stroke_linejoin',
                selected.getAttribute('stroke-linejoin')
              )
              svgCanvas.setCurProperties(
                'stroke_linecap',
                selected.getAttribute('stroke-linecap')
              )
          }
          svgCanvas.selectorManager.requestSelector(selected).showGrips(true)
        }
        // always recalculate dimensions to strip off stray identity transforms
        svgCanvas.recalculateAllSelectedDimensions()
        // if it was being dragged/resized
        if (realX !== svgCanvas.rStartX || realY !== svgCanvas.rStartY) {
          const len = selectedElements.length
          for (let i = 0; i < len; ++i) {
            if (!selectedElements[i]) {
              break
            }
            svgCanvas.selectorManager
              .requestSelector(selectedElements[i])
              .resize()
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
          walkTree(elem, el => {
            el.removeAttribute('style')
          })
        }
      }
      return
    case 'zoom': {
      svgCanvas.rubberBox?.setAttribute('display', 'none')
      const factor = evt.shiftKey ? 0.5 : 2
      svgCanvas.call('zoomed', {
        x: Math.min(svgCanvas.rStartX, realX),
        y: Math.min(svgCanvas.rStartY, realY),
        width: Math.abs(realX - svgCanvas.rStartX),
        height: Math.abs(realY - svgCanvas.rStartY),
        factor
      })
      return
    }
    case 'fhpath': {
      // Reset values using direct property assignment:
      svgCanvas.sumDistance = 0
      svgCanvas.controllPoint2.x = 0
      svgCanvas.controllPoint2.y = 0
      svgCanvas.controllPoint1.x = 0
      svgCanvas.controllPoint1.y = 0
      svgCanvas.start = { x: 0, y: 0 }
      svgCanvas.end.x = 0
      svgCanvas.end.y = 0
      // Check that the path contains at least 2 points; a degenerate one-point path
      // causes problems.
      // Webkit ignores how we set the points attribute with commas and uses space
      // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
      const coords = element.getAttribute('points')
      const commaIndex = coords.indexOf(',')
      keep =
        commaIndex >= 0
          ? coords.includes(',', commaIndex + 1)
          : coords.includes(' ', coords.indexOf(' ') + 1)
      if (keep) {
        element = svgCanvas.pathActions.smoothPolylineIntoPath(element)
      }
      break
    }
    case 'line':
      {
        const x1 = element.getAttribute('x1')
        const y1 = element.getAttribute('y1')
        const x2 = element.getAttribute('x2')
        const y2 = element.getAttribute('y2')
        keep = x1 !== x2 || y1 !== y2
      }
      break
    case 'foreignObject':
    case 'square':
    case 'rect':
    case 'image':
      {
        const width = element.getAttribute('width')
        const height = element.getAttribute('height')
        // Image should be kept regardless of size (use inherit dimensions later)
        const widthNum = Number(width)
        const heightNum = Number(height)
        keep =
          widthNum >= 1 || heightNum >= 1 || svgCanvas.currentMode === 'image'
      }
      break
    case 'circle':
      keep = element.getAttribute('r') !== '0'
      break
    case 'ellipse':
      {
        const rx = Number(element.getAttribute('rx'))
        const ry = Number(element.getAttribute('ry'))
        keep = rx || ry
      }
      break
    case 'fhellipse':
      if (
        svgCanvas.freehand.maxx - svgCanvas.freehand.minx > 0 &&
        svgCanvas.freehand.maxy - svgCanvas.freehand.miny > 0
      ) {
        element = svgCanvas.addSVGElementsFromJson({
          element: 'ellipse',
          curStyles: true,
          attr: {
            cx: (svgCanvas.freehand.minx + svgCanvas.freehand.maxx) / 2,
            cy: (svgCanvas.freehand.miny + svgCanvas.freehand.maxy) / 2,
            rx: (svgCanvas.freehand.maxx - svgCanvas.freehand.minx) / 2,
            ry: (svgCanvas.freehand.maxy - svgCanvas.freehand.miny) / 2,
            id: svgCanvas.id
          }
        })
        svgCanvas.call('changed', [element])
        keep = true
      }
      break
    case 'fhrect':
      if (
        svgCanvas.freehand.maxx - svgCanvas.freehand.minx > 0 &&
        svgCanvas.freehand.maxy - svgCanvas.freehand.miny > 0
      ) {
        element = svgCanvas.addSVGElementsFromJson({
          element: 'rect',
          curStyles: true,
          attr: {
            x: svgCanvas.freehand.minx,
            y: svgCanvas.freehand.miny,
            width: svgCanvas.freehand.maxx - svgCanvas.freehand.minx,
            height: svgCanvas.freehand.maxy - svgCanvas.freehand.miny,
            id: svgCanvas.id
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
      svgCanvas.started = true

      const res = svgCanvas.pathActions.mouseUp(evt, element, mouseX, mouseY)
      ;({ element } = res)
      ;({ keep } = res)
      break
    }
    case 'pathedit':
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
      svgCanvas.currentMode = 'select'
      const batchCmd = svgCanvas.undoMgr.finishUndoableChange()
      if (!batchCmd.isEmpty()) {
        svgCanvas.addCommandToHistory(batchCmd)
      }
      // perform recalculation to weed out any stray identity transforms that might get stuck
      svgCanvas.recalculateAllSelectedDimensions()
      svgCanvas.call('changed', selectedElements)
      break
    }
    default:
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
  const extResult = svgCanvas.runExtensions(
    'mouseUp',
    {
      event: evt,
      mouse_x: mouseX,
      mouse_y: mouseY
    },
    true
  )

  extResult.forEach(r => {
    if (r) {
      keep = r.keep || keep
      ;({ element } = r)
      svgCanvas.starter = r.started || svgCanvas.started
    }
  })

  if (!keep && element) {
    svgCanvas.getCurrentDrawing().releaseId(svgCanvas.id)
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
    if (
      (svgCanvas.currentMode !== 'path' || !svgCanvas.drawnPath) &&
      t &&
      t.parentNode?.id !== 'selectorParentGroup' &&
      t.id !== 'svgcanvas' &&
      t.id !== 'svgroot'
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

    if (useUnit) {
      convertAttrs(element)
    }

    let aniDur = 0.2
    let cAni
    const curShape = svgCanvas.curShape
    const opacAni = svgCanvas.opacAni
    if (
      opacAni.beginElement &&
      Number.parseFloat(element.getAttribute('opacity')) !== curShape.opacity
    ) {
      cAni = opacAni.cloneNode(true)
      cAni.setAttribute('to', curShape.opacity)
      cAni.setAttribute('dur', aniDur)
      element.appendChild(cAni)
      try {
        // Fails in FF4 on foreignObject
        cAni.beginElement()
      } catch (e) {
        /* empty fn */
      }
    } else {
      aniDur = 0
    }

    // Ideally this would be done on the endEvent of the animation,
    // but that doesn't seem to be supported in Webkit
    setTimeout(() => {
      if (cAni) {
        cAni.remove()
      }
      element.setAttribute('opacity', curShape.opacity)
      element.setAttribute('style', 'pointer-events:inherit')
      cleanupElement(element)
      if (svgCanvas.currentMode === 'path') {
        svgCanvas.pathActions.toEditMode(element)
      } else if (svgCanvas.curConfig.selectNew) {
        const modes = [
          'circle',
          'ellipse',
          'square',
          'rect',
          'fhpath',
          'line',
          'fhellipse',
          'fhrect',
          'star',
          'polygon',
          'shapelib'
        ]
        if (modes.indexOf(svgCanvas.currentMode) !== -1 && !evt.altKey) {
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
  svgCanvas.startTransform = null
}

const dblClickEvent = evt => {
  const selectedElements = svgCanvas.selectedElements
  const evtTarget = evt.target
  const parent = evtTarget.parentNode

  let mouseTarget = svgCanvas.getMouseTarget(evt)
  const { tagName } = mouseTarget

  if (tagName === 'text' && svgCanvas.currentMode !== 'textedit') {
    const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.rootSctm)
    svgCanvas.textActions.select(mouseTarget, pt.x, pt.y)
  }

  // Do nothing if already in current group
  if (parent === svgCanvas.currentGroup) {
    return
  }

  if ((tagName === 'g' || tagName === 'a') && getRotationAngle(mouseTarget)) {
    // TODO: Allow method of in-group editing without having to do
    // this (similar to editing rotated paths)

    // Ungroup and regroup
    svgCanvas.pushGroupProperties(mouseTarget)
    mouseTarget = selectedElements[0]
    svgCanvas.clearSelection(true)
  }
  // Reset context
  if (svgCanvas.currentGroup) {
    draw.leaveContext()
  }

  if (
    (parent.tagName !== 'g' && parent.tagName !== 'a') ||
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
const mouseDownEvent = evt => {
  const dataStorage = svgCanvas.getDataStorage()
  const selectedElements = svgCanvas.selectedElements
  const zoom = svgCanvas.zoom
  const curShape = svgCanvas.curShape
  const svgRoot = svgCanvas.svgRoot
  const { $id } = svgCanvas

  if (svgCanvas.spaceKey || evt.button === 1) {
    return
  }

  const rightClick = evt.button === 2

  if (evt.altKey) {
    // duplicate when dragging
    svgCanvas.cloneSelectedElements(0, 0)
  }

  svgCanvas.rootSctm = $id('svgcontent')
    .querySelector('g')
    .getScreenCTM()
    .inverse()

  const pt = transformPoint(evt.clientX, evt.clientY, svgCanvas.rootSctm)
  const mouseX = pt.x * zoom
  const mouseY = pt.y * zoom

  evt.preventDefault()

  if (rightClick) {
    if (svgCanvas.currentMode === 'path') {
      return
    }
    svgCanvas.currentMode = 'select'
    svgCanvas.lastClickPoint = pt
  }

  let x = mouseX / zoom
  let y = mouseY / zoom
  let mouseTarget = svgCanvas.getMouseTarget(evt)

  if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
    mouseTarget = mouseTarget.firstChild
  }

  // realX/y ignores grid-snap value
  const realX = x
  svgCanvas.startX = x
  svgCanvas.rStartX = x
  const realY = y
  svgCanvas.startY = y
  svgCanvas.rStartY = y

  if (svgCanvas.curConfig.gridSnapping) {
    x = snapToGrid(x)
    y = snapToGrid(y)
    svgCanvas.startX = snapToGrid(svgCanvas.startX)
    svgCanvas.startY = snapToGrid(svgCanvas.startY)
  }

  // if it is a selector grip, then it must be a single element selected,
  // set the mouseTarget to that and update the mode to rotate/resize

  if (
    mouseTarget === svgCanvas.selectorManager.selectorParentGroup &&
    selectedElements[0]
  ) {
    const grip = evt.target
    const griptype = dataStorage.get(grip, 'type')
    // rotating
    if (griptype === 'rotate') {
      svgCanvas.currentMode = 'rotate'
      // svgCanvas.setCurrentRotateMode(dataStorage.get(grip, 'dir'));
      // resizing
    } else if (griptype === 'resize') {
      svgCanvas.currentMode = 'resize'
      svgCanvas.currentResizeMode = dataStorage.get(grip, 'dir')
    }
    mouseTarget = selectedElements[0]
  }

  svgCanvas.startTransform = mouseTarget.getAttribute('transform')

  const tlist = getTransformList(mouseTarget)
  // consolidate transforms using standard SVG but keep the transformation used for the move/scale
  if (tlist.numberOfItems > 1) {
    const firstTransform = tlist.getItem(0)
    tlist.removeItem(0)
    tlist.consolidate()
    tlist.insertItemBefore(firstTransform, 0)
  }
  switch (svgCanvas.currentMode) {
    case 'select':
      svgCanvas.started = true
      svgCanvas.currentResizeMode = 'none'
      if (rightClick) {
        svgCanvas.started = false
      }

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
          svgCanvas.justSelected = mouseTarget
          svgCanvas.pathActions.clear()
        }
        // else if it's a path, go into pathedit mode in mouseup

        if (!rightClick) {
          // insert a dummy transform so if the element(s) are moved it will have
          // a transform to use for its translate
          for (const selectedElement of selectedElements) {
            if (!selectedElement) {
              continue
            }
            const slist = getTransformList(selectedElement)
            if (slist.numberOfItems) {
              slist.insertItemBefore(svgRoot.createSVGTransform(), 0)
            } else {
              slist.appendItem(svgRoot.createSVGTransform())
            }
          }
        }
      } else if (!rightClick) {
        svgCanvas.clearSelection()
        svgCanvas.currentMode = 'multiselect'
        if (!svgCanvas.rubberBox) {
          svgCanvas.rubberBox = svgCanvas.selectorManager.getRubberBandBox()
        }
        svgCanvas.rStartX = svgCanvas.rStartX * zoom
        svgCanvas.rStartY = svgCanvas.rStartY * zoom

        assignAttributes(
          svgCanvas.rubberBox,
          {
            x: svgCanvas.rStartX,
            y: svgCanvas.rStartY,
            width: 0,
            height: 0,
            display: 'inline'
          },
          100
        )
      }
      break
    case 'zoom':
      svgCanvas.started = true
      if (!svgCanvas.rubberBox) {
        svgCanvas.rubberBox = svgCanvas.selectorManager.getRubberBandBox()
      }
      assignAttributes(
        svgCanvas.rubberBox,
        {
          x: realX * zoom,
          y: realX * zoom,
          width: 0,
          height: 0,
          display: 'inline'
        },
        100
      )
      break
    case 'resize': {
      svgCanvas.started = true
      svgCanvas.startX = x
      svgCanvas.startY = y

      // Getting the BBox from the selection box, since we know we
      // want to orient around it
      svgCanvas.initBbox = getBBox($id('selectedBox0'))
      const bb = {}
      for (const [key, val] of Object.entries(svgCanvas.initBbox)) {
        bb[key] = val / zoom
      }
      svgCanvas.initBbox = bb

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
      svgCanvas.start = { x: realX, y: realY }
      svgCanvas.controllPoint1.x = 0
      svgCanvas.controllPoint1.y = 0
      svgCanvas.controllPoint2.x = 0
      svgCanvas.controllPoint2.y = 0
      svgCanvas.started = true
      svgCanvas.dAttr = realX + ',' + realY + ' '
      // Commented out as doing nothing now:
      // strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
      svgCanvas.addSVGElementsFromJson({
        element: 'polyline',
        curStyles: true,
        attr: {
          points: svgCanvas.dAttr,
          id: svgCanvas.getNextId(),
          fill: 'none',
          opacity: curShape.opacity / 2,
          'stroke-linecap': 'round',
          style: 'pointer-events:none'
        }
      })
      svgCanvas.freehand.minx = realX
      svgCanvas.freehand.maxx = realX
      svgCanvas.freehand.miny = realY
      svgCanvas.freehand.maxy = realY
      break
    case 'image': {
      svgCanvas.started = true
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
      setHref(newImage, svgCanvas.lastGoodImgUrl)
      preventClickDefault(newImage)
      break
    }
    case 'square':
    // TODO: once we create the rect, we lose information that this was a square
    // (for resizing purposes this could be important)
    // Fallthrough
    case 'rect':
      svgCanvas.started = true
      svgCanvas.startX = x
      svgCanvas.startY = y
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
      svgCanvas.started = true
      const strokeW =
        Number(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width
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
    }
    case 'circle':
      svgCanvas.started = true
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
      svgCanvas.started = true
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
      svgCanvas.started = true
      /* const newText = */ svgCanvas.addSVGElementsFromJson({
        element: 'text',
        curStyles: true,
        attr: {
          x,
          y,
          id: svgCanvas.getNextId(),
          fill: svgCanvas.curText.fill,
          'stroke-width': svgCanvas.curText.stroke_width,
          'font-size': svgCanvas.curText.font_size,
          'font-family': svgCanvas.curText.font_family,
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
      svgCanvas.startX = svgCanvas.startX * zoom
      svgCanvas.startY = svgCanvas.startY * zoom
      svgCanvas.pathActions.mouseDown(
        evt,
        mouseTarget,
        svgCanvas.startX,
        svgCanvas.startY
      )
      svgCanvas.started = true
      break
    case 'textedit':
      svgCanvas.startX = svgCanvas.startX * zoom
      svgCanvas.startY = svgCanvas.startY * zoom
      svgCanvas.textActions.mouseDown(
        evt,
        mouseTarget,
        svgCanvas.startX,
        svgCanvas.startY
      )
      svgCanvas.started = true
      break
    case 'rotate':
      svgCanvas.started = true
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
  const extResult = svgCanvas.runExtensions(
    'mouseDown',
    {
      event: evt,
      start_x: svgCanvas.startX,
      start_y: svgCanvas.startY,
      selectedElements
    },
    true
  )

  extResult.forEach(r => {
    if (r?.started) {
      svgCanvas.started = true
    }
  })
}
/**
 * @param {Event} e
 * @fires module:event.SvgCanvas#event:updateCanvas
 * @fires module:event.SvgCanvas#event:zoomDone
 * @returns {void}
 */
const DOMMouseScrollEvent = e => {
  const zoom = svgCanvas.zoom
  const { $id } = svgCanvas
  if (!e.shiftKey) {
    return
  }

  e.preventDefault()

  svgCanvas.rootSctm = $id('svgcontent')
    .querySelector('g')
    .getScreenCTM()
    .inverse()

  const workarea = document.getElementById('workarea')
  const scrbar = 15
  const rulerwidth = svgCanvas.curConfig.showRulers ? 16 : 0

  // mouse relative to content area in content pixels
  const pt = transformPoint(e.clientX, e.clientY, svgCanvas.rootSctm)

  // full work area width in screen pixels
  const editorFullW = parseFloat(
    getComputedStyle(workarea, null).width.replace('px', '')
  )
  const editorFullH = parseFloat(
    getComputedStyle(workarea, null).height.replace('px', '')
  )

  // work area width minus scroll and ruler in screen pixels
  const editorW = editorFullW - scrbar - rulerwidth
  const editorH = editorFullH - scrbar - rulerwidth

  // work area width in content pixels
  const workareaViewW = editorW * svgCanvas.rootSctm.a
  const workareaViewH = editorH * svgCanvas.rootSctm.d

  // content offset from canvas in screen pixels
  const wOffset = findPos(workarea)
  const wOffsetLeft = wOffset.left + rulerwidth
  const wOffsetTop = wOffset.top + rulerwidth

  const delta = e.wheelDelta ? e.wheelDelta : e.detail ? -e.detail : 0
  if (!delta) {
    return
  }

  let factor = Math.max(3 / 4, Math.min(4 / 3, delta))

  let wZoom
  let hZoom
  if (factor > 1) {
    wZoom = Math.ceil((editorW / workareaViewW) * factor * 100) / 100
    hZoom = Math.ceil((editorH / workareaViewH) * factor * 100) / 100
  } else {
    wZoom = Math.floor((editorW / workareaViewW) * factor * 100) / 100
    hZoom = Math.floor((editorH / workareaViewH) * factor * 100) / 100
  }
  let zoomlevel = Math.min(wZoom, hZoom)
  zoomlevel = Math.min(10, Math.max(0.01, zoomlevel))
  if (zoomlevel === zoom) {
    return
  }
  factor = zoomlevel / zoom

  // top left of workarea in content pixels before zoom
  const topLeftOld = transformPoint(wOffsetLeft, wOffsetTop, svgCanvas.rootSctm)

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

  svgCanvas.zoom = zoomlevel
  document.getElementById('zoom').value = (zoomlevel * 100).toFixed(1)

  svgCanvas.call('updateCanvas', { center: false, newCtr })
  svgCanvas.call('zoomDone')
}
