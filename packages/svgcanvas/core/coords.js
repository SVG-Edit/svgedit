/**
 * Manipulating coordinates.
 * @module coords
 * @license MIT
 */

import {
  snapToGrid,
  assignAttributes,
  getBBox,
  getRefElem,
  findDefs
} from './utilities.js'
import {
  transformPoint,
  transformListToTransform,
  matrixMultiply,
  transformBox,
  getTransformList
} from './math.js'
import { convertToNum } from './units.js'

let svgCanvas = null

/**
 * Initialize the coords module with the SVG canvas.
 * @function module:coords.init
 * @param {Object} canvas - The SVG canvas object
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
}

// This is how we map path segment types to their corresponding commands
const pathMap = [
  0,
  'z',
  'M',
  'm',
  'L',
  'l',
  'C',
  'c',
  'Q',
  'q',
  'A',
  'a',
  'H',
  'h',
  'V',
  'v',
  'S',
  's',
  'T',
  't'
]

/**
 * Applies coordinate changes to an element based on the given matrix.
 * @function module:coords.remapElement
 * @param {Element} selected - The DOM element to remap
 * @param {Object} changes - An object containing attribute changes
 * @param {SVGMatrix} m - The transformation matrix
 * @returns {void}
 */
export const remapElement = (selected, changes, m) => {
  const remap = (x, y) => transformPoint(x, y, m)
  const scalew = w => m.a * w
  const scaleh = h => m.d * h
  const doSnapping =
    svgCanvas.getGridSnapping() &&
    selected.parentNode.parentNode.localName === 'svg'
  const finishUp = () => {
    if (doSnapping) {
      Object.entries(changes).forEach(([attr, value]) => {
        changes[attr] = snapToGrid(value)
      })
    }
    assignAttributes(selected, changes, 1000, true)
  }
  const box = getBBox(selected)

  // Handle gradients and patterns
  ;['fill', 'stroke'].forEach(type => {
    const attrVal = selected.getAttribute(type)
    if (attrVal?.startsWith('url(') && (m.a < 0 || m.d < 0)) {
      const grad = getRefElem(attrVal)
      const newgrad = grad.cloneNode(true)
      if (m.a < 0) {
        // Flip x
        const x1 = newgrad.getAttribute('x1')
        const x2 = newgrad.getAttribute('x2')
        newgrad.setAttribute('x1', -(x1 - 1))
        newgrad.setAttribute('x2', -(x2 - 1))
      }

      if (m.d < 0) {
        // Flip y
        const y1 = newgrad.getAttribute('y1')
        const y2 = newgrad.getAttribute('y2')
        newgrad.setAttribute('y1', -(y1 - 1))
        newgrad.setAttribute('y2', -(y2 - 1))
      }
      newgrad.id = svgCanvas.getCurrentDrawing().getNextId()
      findDefs().append(newgrad)
      selected.setAttribute(type, 'url(#' + newgrad.id + ')')
    }
  })

  const elName = selected.tagName

  // Skip remapping for '<use>' elements
  if (elName === 'use') {
    // Do not remap '<use>' elements; transformations are handled via 'transform' attribute
    return
  }

  // Now we have a set of changes and an applied reduced transform list
  // We apply the changes directly to the DOM
  switch (elName) {
    case 'foreignObject':
    case 'rect':
    case 'image': {
      // Allow images to be inverted (give them matrix when flipped)
      if (elName === 'image' && (m.a < 0 || m.d < 0)) {
        // Convert to matrix if flipped
        const chlist = getTransformList(selected)
        const mt = svgCanvas.getSvgRoot().createSVGTransform()
        mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix, m))
        chlist.clear()
        chlist.appendItem(mt)
      } else {
        const pt1 = remap(changes.x, changes.y)
        changes.width = scalew(changes.width)
        changes.height = scaleh(changes.height)
        changes.x = pt1.x + Math.min(0, changes.width)
        changes.y = pt1.y + Math.min(0, changes.height)
        changes.width = Math.abs(changes.width)
        changes.height = Math.abs(changes.height)
      }
      finishUp()
      break
    }
    case 'ellipse': {
      const c = remap(changes.cx, changes.cy)
      changes.cx = c.x
      changes.cy = c.y
      changes.rx = Math.abs(scalew(changes.rx))
      changes.ry = Math.abs(scaleh(changes.ry))
      finishUp()
      break
    }
    case 'circle': {
      const c = remap(changes.cx, changes.cy)
      changes.cx = c.x
      changes.cy = c.y
      // Take the minimum of the new dimensions for the new circle radius
      const tbox = transformBox(box.x, box.y, box.width, box.height, m)
      const w = tbox.tr.x - tbox.tl.x
      const h = tbox.bl.y - tbox.tl.y
      changes.r = Math.min(Math.abs(w / 2), Math.abs(h / 2))
      finishUp()
      break
    }
    case 'line': {
      const pt1 = remap(changes.x1, changes.y1)
      const pt2 = remap(changes.x2, changes.y2)
      changes.x1 = pt1.x
      changes.y1 = pt1.y
      changes.x2 = pt2.x
      changes.y2 = pt2.y
      finishUp()
      break
    }
    case 'text': {
      const pt = remap(changes.x, changes.y)
      changes.x = pt.x
      changes.y = pt.y

      // Scale font-size
      let fontSize = selected.getAttribute('font-size')
      if (!fontSize) {
        // If not directly set, try computed style
        fontSize = window.getComputedStyle(selected).fontSize
      }
      const fontSizeNum = parseFloat(fontSize)
      if (!isNaN(fontSizeNum)) {
        // Assume uniform scaling and use m.a
        changes['font-size'] = fontSizeNum * Math.abs(m.a)
      }

      finishUp()

      // Handle child 'tspan' elements
      const childNodes = selected.childNodes
      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i]
        if (child.nodeType === 1 && child.tagName === 'tspan') {
          const childChanges = {}
          const hasX = child.hasAttribute('x')
          const hasY = child.hasAttribute('y')
          if (hasX) {
            const childX = convertToNum('x', child.getAttribute('x'))
            const childPtX = remap(childX, changes.y).x
            childChanges.x = childPtX
          }
          if (hasY) {
            const childY = convertToNum('y', child.getAttribute('y'))
            const childPtY = remap(changes.x, childY).y
            childChanges.y = childPtY
          }

          let tspanFS = child.getAttribute('font-size')
          if (!tspanFS) {
            tspanFS = window.getComputedStyle(child).fontSize
          }
          const tspanFSNum = parseFloat(tspanFS)
          if (!isNaN(tspanFSNum)) {
            childChanges['font-size'] = tspanFSNum * Math.abs(m.a)
          }

          if (hasX || hasY || childChanges['font-size']) {
            assignAttributes(child, childChanges, 1000, true)
          }
        }
      }
      break
    }
    case 'tspan': {
      const pt = remap(changes.x, changes.y)
      changes.x = pt.x
      changes.y = pt.y

      // Handle tspan font-size scaling
      let tspanFS = selected.getAttribute('font-size')
      if (!tspanFS) {
        tspanFS = window.getComputedStyle(selected).fontSize
      }
      const tspanFSNum = parseFloat(tspanFS)
      if (!isNaN(tspanFSNum)) {
        changes['font-size'] = tspanFSNum * Math.abs(m.a)
      }

      finishUp()
      break
    }
    case 'g': {
      const dataStorage = svgCanvas.getDataStorage()
      const gsvg = dataStorage.get(selected, 'gsvg')
      if (gsvg) {
        assignAttributes(gsvg, changes, 1000, true)
      }
      break
    }
    case 'polyline':
    case 'polygon': {
      changes.points.forEach(pt => {
        const { x, y } = remap(pt.x, pt.y)
        pt.x = x
        pt.y = y
      })
      const pstr = changes.points.map(pt => `${pt.x},${pt.y}`).join(' ')
      selected.setAttribute('points', pstr)
      break
    }
    case 'path': {
      // Handle path segments
      const segList = selected.pathSegList
      const len = segList.numberOfItems
      changes.d = []
      for (let i = 0; i < len; ++i) {
        const seg = segList.getItem(i)
        changes.d[i] = {
          type: seg.pathSegType,
          x: seg.x,
          y: seg.y,
          x1: seg.x1,
          y1: seg.y1,
          x2: seg.x2,
          y2: seg.y2,
          r1: seg.r1,
          r2: seg.r2,
          angle: seg.angle,
          largeArcFlag: seg.largeArcFlag,
          sweepFlag: seg.sweepFlag
        }
      }

      const firstseg = changes.d[0]
      let currentpt
      if (len > 0) {
        currentpt = remap(firstseg.x, firstseg.y)
        changes.d[0].x = currentpt.x
        changes.d[0].y = currentpt.y
      }
      for (let i = 1; i < len; ++i) {
        const seg = changes.d[i]
        const { type } = seg
        // If absolute or first segment, remap x, y, x1, y1, x2, y2
        if (type % 2 === 0) {
          const thisx = seg.x !== undefined ? seg.x : currentpt.x // For V commands
          const thisy = seg.y !== undefined ? seg.y : currentpt.y // For H commands
          const pt = remap(thisx, thisy)
          const pt1 = remap(seg.x1, seg.y1)
          const pt2 = remap(seg.x2, seg.y2)
          seg.x = pt.x
          seg.y = pt.y
          seg.x1 = pt1.x
          seg.y1 = pt1.y
          seg.x2 = pt2.x
          seg.y2 = pt2.y
          seg.r1 = scalew(seg.r1)
          seg.r2 = scaleh(seg.r2)
        } else {
          // For relative segments, scale x, y, x1, y1, x2, y2
          seg.x = scalew(seg.x)
          seg.y = scaleh(seg.y)
          seg.x1 = scalew(seg.x1)
          seg.y1 = scaleh(seg.y1)
          seg.x2 = scalew(seg.x2)
          seg.y2 = scaleh(seg.y2)
          seg.r1 = scalew(seg.r1)
          seg.r2 = scaleh(seg.r2)
        }
      }

      let dstr = ''
      changes.d.forEach(seg => {
        const { type } = seg
        dstr += pathMap[type]
        switch (type) {
          case 13: // relative horizontal line (h)
          case 12: // absolute horizontal line (H)
            dstr += seg.x + ' '
            break
          case 15: // relative vertical line (v)
          case 14: // absolute vertical line (V)
            dstr += seg.y + ' '
            break
          case 3: // relative move (m)
          case 5: // relative line (l)
          case 19: // relative smooth quad (t)
          case 2: // absolute move (M)
          case 4: // absolute line (L)
          case 18: // absolute smooth quad (T)
            dstr += seg.x + ',' + seg.y + ' '
            break
          case 7: // relative cubic (c)
          case 6: // absolute cubic (C)
            dstr +=
              seg.x1 +
              ',' +
              seg.y1 +
              ' ' +
              seg.x2 +
              ',' +
              seg.y2 +
              ' ' +
              seg.x +
              ',' +
              seg.y +
              ' '
            break
          case 9: // relative quad (q)
          case 8: // absolute quad (Q)
            dstr += seg.x1 + ',' + seg.y1 + ' ' + seg.x + ',' + seg.y + ' '
            break
          case 11: // relative elliptical arc (a)
          case 10: // absolute elliptical arc (A)
            dstr +=
              seg.r1 +
              ',' +
              seg.r2 +
              ' ' +
              seg.angle +
              ' ' +
              Number(seg.largeArcFlag) +
              ' ' +
              Number(seg.sweepFlag) +
              ' ' +
              seg.x +
              ',' +
              seg.y +
              ' '
            break
          case 17: // relative smooth cubic (s)
          case 16: // absolute smooth cubic (S)
            dstr += seg.x2 + ',' + seg.y2 + ' ' + seg.x + ',' + seg.y + ' '
            break
          default:
            break
        }
      })

      selected.setAttribute('d', dstr.trim())
      break
    }
    default:
      break
  }
}
