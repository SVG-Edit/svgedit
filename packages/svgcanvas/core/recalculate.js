/**
 * Recalculate dimensions and transformations of SVG elements.
 * @module recalculate
 * @license MIT
 */

import { convertToNum } from './units.js'
import { NS } from './namespaces.js'
import {
  getRotationAngle,
  getBBox,
  getHref,
  getRefElem,
  findDefs
} from './utilities.js'
import { BatchCommand, ChangeElementCommand } from './history.js'
import { remapElement } from './coords.js'
import {
  isIdentity,
  matrixMultiply,
  transformPoint,
  transformListToTransform,
  hasMatrixTransform,
  getTransformList
} from './math.js'
import { mergeDeep } from '../common/util.js'

let svgCanvas

/**
 * Initialize the recalculate module with the SVG canvas.
 * @function module:recalculate.init
 * @param {Object} canvas - The SVG canvas object
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
}

/**
 * Updates a `<clipPath>` element's values based on the given translation.
 * @function module:recalculate.updateClipPath
 * @param {string} attr - The clip-path attribute value containing the clipPath's ID
 * @param {number} tx - The translation's x value
 * @param {number} ty - The translation's y value
 * @param {Element} elem - The element referencing the clipPath
 * @returns {string|undefined} The clip-path attribute used after updates.
 */
export const updateClipPath = (attr, tx, ty, elem) => {
  const clipPath = getRefElem(attr)
  if (!clipPath) return undefined
  if (elem && clipPath.id) {
    const svgContent = svgCanvas.getSvgContent?.()
    if (svgContent) {
      const refSelector = `[clip-path="url(#${clipPath.id})"]`
      const users = svgContent.querySelectorAll(refSelector)
      if (users.length > 1) {
        const newClipPath = clipPath.cloneNode(true)
        newClipPath.id = svgCanvas.getNextId()
        findDefs().append(newClipPath)
        elem.setAttribute('clip-path', `url(#${newClipPath.id})`)
        return updateClipPath(`url(#${newClipPath.id})`, tx, ty)
      }
    }
  }
  const path = clipPath.firstElementChild
  if (!path) return attr
  const cpXform = getTransformList(path)
  if (!cpXform) {
    const tag = (path.tagName || '').toLowerCase()
    if (tag === 'rect') {
      const x = convertToNum('x', path.getAttribute('x') || 0) + tx
      const y = convertToNum('y', path.getAttribute('y') || 0) + ty
      path.setAttribute('x', x)
      path.setAttribute('y', y)
    } else if (tag === 'circle' || tag === 'ellipse') {
      const cx = convertToNum('cx', path.getAttribute('cx') || 0) + tx
      const cy = convertToNum('cy', path.getAttribute('cy') || 0) + ty
      path.setAttribute('cx', cx)
      path.setAttribute('cy', cy)
    } else if (tag === 'line') {
      path.setAttribute('x1', convertToNum('x1', path.getAttribute('x1') || 0) + tx)
      path.setAttribute('y1', convertToNum('y1', path.getAttribute('y1') || 0) + ty)
      path.setAttribute('x2', convertToNum('x2', path.getAttribute('x2') || 0) + tx)
      path.setAttribute('y2', convertToNum('y2', path.getAttribute('y2') || 0) + ty)
    } else if (tag === 'polyline' || tag === 'polygon') {
      const points = (path.getAttribute('points') || '').trim()
      if (points) {
        const updated = points.split(/\s+/).map((pair) => {
          const [x, y] = pair.split(',')
          const nx = Number(x) + tx
          const ny = Number(y) + ty
          return `${nx},${ny}`
        })
        path.setAttribute('points', updated.join(' '))
      }
    } else {
      path.setAttribute('transform', `translate(${tx},${ty})`)
    }
    return attr
  }
  if (cpXform.numberOfItems) {
    const translate = svgCanvas.getSvgRoot().createSVGMatrix()
    translate.e = tx
    translate.f = ty
    const combined = matrixMultiply(transformListToTransform(cpXform).matrix, translate)
    const merged = svgCanvas.getSvgRoot().createSVGTransform()
    merged.setMatrix(combined)
    cpXform.clear()
    cpXform.appendItem(merged)
    return attr
  }
  const tag = (path.tagName || '').toLowerCase()
  if ((tag === 'polyline' || tag === 'polygon') && !path.points?.numberOfItems) {
    const points = (path.getAttribute('points') || '').trim()
    if (points) {
      const updated = points.split(/\s+/).map((pair) => {
        const [x, y] = pair.split(',')
        const nx = Number(x) + tx
        const ny = Number(y) + ty
        return `${nx},${ny}`
      })
      path.setAttribute('points', updated.join(' '))
    }
    return
  }
  const newTranslate = svgCanvas.getSvgRoot().createSVGTransform()
  newTranslate.setTranslate(tx, ty)

  cpXform.appendItem(newTranslate)
  recalculateDimensions(path)
  return attr
}

/**
 * Recalculates the dimensions and transformations of a selected element.
 * @function module:recalculate.recalculateDimensions
 * @param {Element} selected - The DOM element to recalculate
 * @returns {Command|null} Undo command object with the resulting change, or null if no change
 */
export const recalculateDimensions = selected => {
  if (!selected) return null

  // Don't recalculate dimensions for groups - this would push their transforms down to children
  // Groups should maintain their transform attribute on the group element itself
  if (selected.tagName === 'g' || selected.tagName === 'a') {
    return null
  }

  if (
    (selected.getAttribute?.('clip-path')) &&
    selected.querySelector?.('[clip-path]')
  ) {
    // Keep transforms when clip-paths are present to avoid mutating defs.
    return null
  }
  const svgroot = svgCanvas.getSvgRoot()
  const dataStorage = svgCanvas.getDataStorage()
  const tlist = getTransformList(selected)

  // Remove any unnecessary transforms (identity matrices, zero-degree rotations)
  if (tlist?.numberOfItems > 0) {
    let k = tlist.numberOfItems
    const noi = k
    while (k--) {
      const xform = tlist.getItem(k)
      if (xform.type === SVGTransform.SVG_TRANSFORM_MATRIX) {
        if (isIdentity(xform.matrix)) {
          if (noi === 1) {
            // Remove the 'transform' attribute if only identity matrix remains
            selected.removeAttribute('transform')
            return null
          }
          tlist.removeItem(k)
        }
      } else if (
        xform.type === SVGTransform.SVG_TRANSFORM_ROTATE &&
        xform.angle === 0
      ) {
        tlist.removeItem(k) // Remove zero-degree rotations
      } else if (
        xform.type === SVGTransform.SVG_TRANSFORM_TRANSLATE &&
        xform.matrix.e === 0 &&
        xform.matrix.f === 0
      ) {
        tlist.removeItem(k) // Remove zero translations
      }
    }

    // End here if all it has is a rotation
    if (tlist.numberOfItems === 1 && getRotationAngle(selected)) {
      return null
    }
  }

  // If this element had no transforms, we are done
  if (!tlist || tlist.numberOfItems === 0) {
    selected.removeAttribute('transform')
    return null
  }

  // Avoid remapping transforms on <use> to preserve referenced positioning/rotation
  if (selected.tagName === 'use') {
    return null
  }

  // Set up undo command
  const batchCmd = new BatchCommand('Transform')

  // Handle special cases for specific elements
  switch (selected.tagName) {
    // Ignore these elements, as they can absorb the [M] transformation
    case 'line':
    case 'polyline':
    case 'polygon':
    case 'path':
      break
    default:
      // For elements like 'use', ensure transforms are handled correctly
      if (
        (tlist.numberOfItems === 1 &&
          tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_MATRIX) ||
        (tlist.numberOfItems === 2 &&
          tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_MATRIX &&
          tlist.getItem(1).type === SVGTransform.SVG_TRANSFORM_ROTATE)
      ) {
        return null
      }
  }

  // Grouped SVG element (special handling for 'gsvg')
  const gsvg = dataStorage.has(selected, 'gsvg')
    ? dataStorage.get(selected, 'gsvg')
    : undefined

  // Store initial values affected by reducing the transform list
  let changes = {}
  let initial = null
  let attrs = []

  // Determine which attributes to adjust based on element type
  switch (selected.tagName) {
    case 'line':
      attrs = ['x1', 'y1', 'x2', 'y2']
      break
    case 'circle':
      attrs = ['cx', 'cy', 'r']
      break
    case 'ellipse':
      attrs = ['cx', 'cy', 'rx', 'ry']
      break
    case 'foreignObject':
    case 'rect':
    case 'image':
      attrs = ['width', 'height', 'x', 'y']
      break
    case 'text':
    case 'tspan':
      attrs = ['x', 'y']
      break
    case 'polygon':
    case 'polyline': {
      initial = {}
      initial.points = selected.getAttribute('points')
      const list = selected.points
      const len = list.numberOfItems
      changes.points = new Array(len)
      for (let i = 0; i < len; ++i) {
        const pt = list.getItem(i)
        changes.points[i] = { x: pt.x, y: pt.y }
      }
      break
    }
    case 'path':
      initial = {}
      initial.d = selected.getAttribute('d')
      changes.d = selected.getAttribute('d')
      break
  }

  // Collect initial attribute values
  if (attrs.length) {
    attrs.forEach(attr => {
      changes[attr] = convertToNum(attr, selected.getAttribute(attr))
    })
  } else if (gsvg) {
    // Special case for GSVG elements
    changes = {
      x: Number(gsvg.getAttribute('x')) || 0,
      y: Number(gsvg.getAttribute('y')) || 0
    }
  }

  // If initial values were not set for polygon/polyline/path, create a copy
  if (!initial) {
    initial = mergeDeep({}, changes)
    for (const [attr, val] of Object.entries(initial)) {
      initial[attr] = convertToNum(attr, val)
    }
  }
  // Save the start transform value
  initial.transform = svgCanvas.getStartTransform() || ''

  let oldcenter, newcenter

  // Handle group elements ('g' or 'a')
  if ((selected.tagName === 'g' && !gsvg) || selected.tagName === 'a') {
    const box = getBBox(selected)

    oldcenter = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    newcenter = transformPoint(
      box.x + box.width / 2,
      box.y + box.height / 2,
      transformListToTransform(tlist).matrix
    )

    const gangle = getRotationAngle(selected)
    if (gangle) {
      const a = gangle * Math.PI / 180
      const s = Math.abs(a) > (1.0e-10) ? Math.sin(a) / (1 - Math.cos(a)) : 2 / a
      for (let i = 0; i < tlist.numberOfItems; ++i) {
        const xform = tlist.getItem(i)
        if (xform.type === SVGTransform.SVG_TRANSFORM_ROTATE) {
          const rm = xform.matrix
          oldcenter.y = (s * rm.e + rm.f) / 2
          oldcenter.x = (rm.e - s * rm.f) / 2
          tlist.removeItem(i)
          break
        }
      }
    }

    const N = tlist.numberOfItems
    let tx = 0
    let ty = 0
    let operation = 0

    let firstM
    if (N) {
      firstM = tlist.getItem(0).matrix
    }

    let oldStartTransform
    if (
      N >= 3 &&
      tlist.getItem(N - 2).type === SVGTransform.SVG_TRANSFORM_SCALE &&
      tlist.getItem(N - 3).type === SVGTransform.SVG_TRANSFORM_TRANSLATE &&
      tlist.getItem(N - 1).type === SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
      operation = 3 // scale

      const tm = tlist.getItem(N - 3).matrix
      const sm = tlist.getItem(N - 2).matrix
      const tmn = tlist.getItem(N - 1).matrix

      const children = selected.childNodes
      let c = children.length
      while (c--) {
        const child = children.item(c)
        if (child.nodeType !== 1) continue

        const childTlist = getTransformList(child)
        if (!childTlist) continue

        const m = transformListToTransform(childTlist).matrix

        const angle = getRotationAngle(child)
        oldStartTransform = svgCanvas.getStartTransform()
        svgCanvas.setStartTransform(child.getAttribute('transform'))

        if (angle || hasMatrixTransform(childTlist)) {
          const e2t = svgroot.createSVGTransform()
          e2t.setMatrix(matrixMultiply(tm, sm, tmn, m))
          childTlist.clear()
          childTlist.appendItem(e2t)
        } else {
          const t2n = matrixMultiply(m.inverse(), tmn, m)
          const t2 = svgroot.createSVGMatrix()
          t2.e = -t2n.e
          t2.f = -t2n.f

          const s2 = matrixMultiply(
            t2.inverse(),
            m.inverse(),
            tm,
            sm,
            tmn,
            m,
            t2n.inverse()
          )

          const translateOrigin = svgroot.createSVGTransform()
          const scale = svgroot.createSVGTransform()
          const translateBack = svgroot.createSVGTransform()
          translateOrigin.setTranslate(t2n.e, t2n.f)
          scale.setScale(s2.a, s2.d)
          translateBack.setTranslate(t2.e, t2.f)
          childTlist.appendItem(translateBack)
          childTlist.appendItem(scale)
          childTlist.appendItem(translateOrigin)
        }

        const recalculatedDimensions = recalculateDimensions(child)
        if (recalculatedDimensions) {
          batchCmd.addSubCommand(recalculatedDimensions)
        }
        svgCanvas.setStartTransform(oldStartTransform)
      }

      tlist.removeItem(N - 1)
      tlist.removeItem(N - 2)
      tlist.removeItem(N - 3)
    } else if (N >= 3 && tlist.getItem(N - 1).type === SVGTransform.SVG_TRANSFORM_MATRIX) {
      operation = 3 // scale (matrix imposition)
      const m = transformListToTransform(tlist).matrix
      const e2t = svgroot.createSVGTransform()
      e2t.setMatrix(m)
      tlist.clear()
      tlist.appendItem(e2t)
    } else if (
      (N === 1 ||
        (N > 1 && tlist.getItem(1).type !== SVGTransform.SVG_TRANSFORM_SCALE)) &&
      tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
      operation = 2 // translate
      const tM = transformListToTransform(tlist).matrix
      tlist.removeItem(0)
      const mInv = transformListToTransform(tlist).matrix.inverse()
      const m2 = matrixMultiply(mInv, tM)

      tx = m2.e
      ty = m2.f

      if (tx !== 0 || ty !== 0) {
        const selectedClipPath = selected.getAttribute?.('clip-path')
        if (selectedClipPath) {
          updateClipPath(selectedClipPath, tx, ty, selected)
        }

        const children = selected.childNodes
        let c = children.length

        const clipPathsDone = []
        while (c--) {
          const child = children.item(c)
          if (child.nodeType !== 1) continue

          const clipPathAttr = child.getAttribute('clip-path')
          if (clipPathAttr && !clipPathsDone.includes(clipPathAttr)) {
            const updatedAttr = updateClipPath(clipPathAttr, tx, ty, child)
            clipPathsDone.push(updatedAttr || clipPathAttr)
          }

          const childTlist = getTransformList(child)
          if (!childTlist) continue

          oldStartTransform = svgCanvas.getStartTransform()
          svgCanvas.setStartTransform(child.getAttribute('transform'))

          const newxlate = svgroot.createSVGTransform()
          newxlate.setTranslate(tx, ty)
          if (childTlist.numberOfItems) {
            childTlist.insertItemBefore(newxlate, 0)
          } else {
            childTlist.appendItem(newxlate)
          }
          const recalculatedDimensions = recalculateDimensions(child)
          if (recalculatedDimensions) {
            batchCmd.addSubCommand(recalculatedDimensions)
          }

          const uses = selected.getElementsByTagNameNS(NS.SVG, 'use')
          const href = `#${child.id}`
          let u = uses.length
          while (u--) {
            const useElem = uses.item(u)
            if (href === getHref(useElem)) {
              const usexlate = svgroot.createSVGTransform()
              usexlate.setTranslate(-tx, -ty)
              const useTlist = getTransformList(useElem)
              useTlist?.insertItemBefore(usexlate, 0)
              const useRecalc = recalculateDimensions(useElem)
              if (useRecalc) {
                batchCmd.addSubCommand(useRecalc)
              }
            }
          }

          svgCanvas.setStartTransform(oldStartTransform)
        }
      }
    } else if (
      N === 1 &&
      tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_MATRIX &&
      !gangle
    ) {
      operation = 1
      const m = tlist.getItem(0).matrix
      const children = selected.childNodes
      let c = children.length
      while (c--) {
        const child = children.item(c)
        if (child.nodeType !== 1) continue

        const childTlist = getTransformList(child)
        if (!childTlist) continue

        oldStartTransform = svgCanvas.getStartTransform()
        svgCanvas.setStartTransform(child.getAttribute('transform'))

        const em = matrixMultiply(m, transformListToTransform(childTlist).matrix)
        const e2m = svgroot.createSVGTransform()
        e2m.setMatrix(em)
        childTlist.clear()
        childTlist.appendItem(e2m)

        const recalculatedDimensions = recalculateDimensions(child)
        if (recalculatedDimensions) {
          batchCmd.addSubCommand(recalculatedDimensions)
        }
        svgCanvas.setStartTransform(oldStartTransform)

        const sw = child.getAttribute('stroke-width')
        if (child.getAttribute('stroke') !== 'none' && !Number.isNaN(Number(sw))) {
          const avg = (Math.abs(em.a) + Math.abs(em.d)) / 2
          child.setAttribute('stroke-width', Number(sw) * avg)
        }
      }
      tlist.clear()
    } else {
      if (gangle) {
        const newRot = svgroot.createSVGTransform()
        newRot.setRotate(gangle, newcenter.x, newcenter.y)
        if (tlist.numberOfItems) {
          tlist.insertItemBefore(newRot, 0)
        } else {
          tlist.appendItem(newRot)
        }
      }
      if (tlist.numberOfItems === 0) {
        selected.removeAttribute('transform')
      }
      return null
    }

    if (operation === 2) {
      if (gangle) {
        newcenter = {
          x: oldcenter.x + firstM.e,
          y: oldcenter.y + firstM.f
        }

        const newRot = svgroot.createSVGTransform()
        newRot.setRotate(gangle, newcenter.x, newcenter.y)
        if (tlist.numberOfItems) {
          tlist.insertItemBefore(newRot, 0)
        } else {
          tlist.appendItem(newRot)
        }
      }
    } else if (operation === 3) {
      const m = transformListToTransform(tlist).matrix
      const roldt = svgroot.createSVGTransform()
      roldt.setRotate(gangle, oldcenter.x, oldcenter.y)
      const rold = roldt.matrix
      const rnew = svgroot.createSVGTransform()
      rnew.setRotate(gangle, newcenter.x, newcenter.y)
      const rnewInv = rnew.matrix.inverse()
      const mInv = m.inverse()
      const extrat = matrixMultiply(mInv, rnewInv, rold, m)

      tx = extrat.e
      ty = extrat.f

      if (tx !== 0 || ty !== 0) {
        const children = selected.childNodes
        let c = children.length
        while (c--) {
          const child = children.item(c)
          if (child.nodeType !== 1) continue

          const childTlist = getTransformList(child)
          if (!childTlist) continue

          oldStartTransform = svgCanvas.getStartTransform()
          svgCanvas.setStartTransform(child.getAttribute('transform'))

          const newxlate = svgroot.createSVGTransform()
          newxlate.setTranslate(tx, ty)
          if (childTlist.numberOfItems) {
            childTlist.insertItemBefore(newxlate, 0)
          } else {
            childTlist.appendItem(newxlate)
          }

          const recalculatedDimensions = recalculateDimensions(child)
          if (recalculatedDimensions) {
            batchCmd.addSubCommand(recalculatedDimensions)
          }
          svgCanvas.setStartTransform(oldStartTransform)
        }
      }

      if (gangle) {
        if (tlist.numberOfItems) {
          tlist.insertItemBefore(rnew, 0)
        } else {
          tlist.appendItem(rnew)
        }
      }
    }
  } else {
    // Non-group elements

    // Get the bounding box of the element
    const box = getBBox(selected)

    // Handle elements without a bounding box (e.g., <defs>, <metadata>)
    if (!box && selected.tagName !== 'path') return null

    let m // Transformation matrix

    // Adjust for elements with x and y attributes
    let x = 0
    let y = 0
    if (['use', 'image', 'text', 'tspan'].includes(selected.tagName)) {
      x = convertToNum('x', selected.getAttribute('x') || '0')
      y = convertToNum('y', selected.getAttribute('y') || '0')
    }

    // Handle rotation transformations
    const angle = getRotationAngle(selected)
    if (angle) {
      if (selected.localName === 'image') {
        // Use the center of the image as the rotation center
        const xAttr = convertToNum('x', selected.getAttribute('x') || '0')
        const yAttr = convertToNum('y', selected.getAttribute('y') || '0')
        const width = convertToNum('width', selected.getAttribute('width') || '0')
        const height = convertToNum('height', selected.getAttribute('height') || '0')
        const cx = xAttr + width / 2
        const cy = yAttr + height / 2
        oldcenter = { x: cx, y: cy }
        const transform = transformListToTransform(tlist).matrix
        newcenter = transformPoint(cx, cy, transform)
      } else if (selected.localName === 'text') {
        // Use the center of the bounding box as the rotation center for text
        const cx = box.x + box.width / 2
        const cy = box.y + box.height / 2
        oldcenter = { x: cx, y: cy }
        newcenter = transformPoint(cx, cy, transformListToTransform(tlist).matrix)
      } else {
        // Include x and y in the rotation center calculation for other elements
        oldcenter = {
          x: box.x + box.width / 2 + x,
          y: box.y + box.height / 2 + y
        }
        newcenter = transformPoint(
          box.x + box.width / 2 + x,
          box.y + box.height / 2 + y,
          transformListToTransform(tlist).matrix
        )
      }

      // Remove the rotation transform from the list
      for (let i = 0; i < tlist.numberOfItems; ++i) {
        const xform = tlist.getItem(i)
        if (xform.type === SVGTransform.SVG_TRANSFORM_ROTATE) {
          tlist.removeItem(i)
          break
        }
      }
    }

    const N = tlist.numberOfItems

    // Handle specific transformation cases
    if (
      N >= 3 &&
      tlist.getItem(N - 3).type === SVGTransform.SVG_TRANSFORM_TRANSLATE &&
      tlist.getItem(N - 2).type === SVGTransform.SVG_TRANSFORM_SCALE &&
      tlist.getItem(N - 1).type === SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
      // Scaling operation
      m = transformListToTransform(tlist, N - 3, N - 1).matrix
      tlist.removeItem(N - 1)
      tlist.removeItem(N - 2)
      tlist.removeItem(N - 3)

      // Handle remapping for scaling
      if (selected.tagName === 'use') {
        // For '<use>' elements, adjust the transform attribute directly
        const mExisting = transformListToTransform(
          getTransformList(selected)
        ).matrix
        const mNew = matrixMultiply(mExisting, m)

        // Clear the transform list and set the new transform
        tlist.clear()
        const newTransform = svgroot.createSVGTransform()
        newTransform.setMatrix(mNew)
        tlist.appendItem(newTransform)
      } else {
        // Remap other elements normally
        remapElement(selected, changes, m)
      }

      // Restore rotation if needed
      if (angle) {
        const matrix = transformListToTransform(tlist).matrix
        const oldRotation = svgroot.createSVGTransform()
        oldRotation.setRotate(angle, oldcenter.x, oldcenter.y)
        const oldRotMatrix = oldRotation.matrix
        const newRotation = svgroot.createSVGTransform()
        newRotation.setRotate(angle, newcenter.x, newcenter.y)
        const newRotInvMatrix = newRotation.matrix.inverse()
        const matrixInv = matrix.inverse()
        const extraTransform = matrixMultiply(
          matrixInv,
          newRotInvMatrix,
          oldRotMatrix,
          matrix
        )

        // Remap the element with the extra transformation
        remapElement(selected, changes, extraTransform)

        if (tlist.numberOfItems) {
          tlist.insertItemBefore(newRotation, 0)
        } else {
          tlist.appendItem(newRotation)
        }
      }
    } else if (
      (N === 1 ||
        (N > 1 &&
          tlist.getItem(1).type !== SVGTransform.SVG_TRANSFORM_SCALE)) &&
      tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
      // Translation operation
      const oldTranslate = tlist.getItem(0).matrix
      const remainingTransforms = transformListToTransform(tlist, 1).matrix
      const remainingTransformsInv = remainingTransforms.inverse()
      m = matrixMultiply(
        remainingTransformsInv,
        oldTranslate,
        remainingTransforms
      )
      tlist.removeItem(0)

      // Handle remapping for translation
      if (selected.tagName === 'use') {
        // For '<use>' elements, adjust the transform attribute directly
        const mExisting = transformListToTransform(
          getTransformList(selected)
        ).matrix
        const mNew = matrixMultiply(mExisting, m)

        // Clear the transform list and set the new transform
        tlist.clear()
        const newTransform = svgroot.createSVGTransform()
        newTransform.setMatrix(mNew)
        tlist.appendItem(newTransform)
      } else {
        // Remap other elements normally
        remapElement(selected, changes, m)
      }

      // Restore rotation if needed
      if (angle) {
        if (!hasMatrixTransform(tlist)) {
          newcenter = {
            x: oldcenter.x + m.e,
            y: oldcenter.y + m.f
          }
        }
        const newRot = svgroot.createSVGTransform()
        newRot.setRotate(angle, newcenter.x, newcenter.y)
        if (tlist.numberOfItems) {
          tlist.insertItemBefore(newRot, 0)
        } else {
          tlist.appendItem(newRot)
        }
      }
    } else if (
      N === 1 &&
      tlist.getItem(0).type === SVGTransform.SVG_TRANSFORM_MATRIX &&
      !angle
    ) {
      // Matrix operation
      m = transformListToTransform(tlist).matrix
      tlist.clear()

      // Handle remapping for matrix operation
      if (selected.tagName === 'use') {
        // For '<use>' elements, adjust the transform attribute directly
        const mExisting = transformListToTransform(
          getTransformList(selected)
        ).matrix
        const mNew = matrixMultiply(mExisting, m)

        // Clear the transform list and set the new transform
        tlist.clear()
        const newTransform = svgroot.createSVGTransform()
        newTransform.setMatrix(mNew)
        tlist.appendItem(newTransform)
      } else {
        // Remap other elements normally
        remapElement(selected, changes, m)
      }
    } else {
      // Rotation or other transformations
      if (angle) {
        const newRot = svgroot.createSVGTransform()
        newRot.setRotate(angle, newcenter.x, newcenter.y)

        if (tlist.numberOfItems) {
          tlist.insertItemBefore(newRot, 0)
        } else {
          tlist.appendItem(newRot)
        }
      }
      if (tlist.numberOfItems === 0) {
        selected.removeAttribute('transform')
      }
      return null
    }
  } // End of non-group elements handling

  // Remove the 'transform' attribute if no transforms remain
  if (tlist.numberOfItems === 0) {
    selected.removeAttribute('transform')
  }

  // Record the changes for undo functionality
  batchCmd.addSubCommand(new ChangeElementCommand(selected, initial))

  return batchCmd
}
