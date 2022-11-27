/**
 * Tools for SVG selected element operation.
 * @module selected-elem
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { NS } from './namespaces.js'
import * as hstry from './history.js'
import * as pathModule from './path.js'
import {
  getStrokedBBoxDefaultVisible,
  setHref,
  getElement,
  getHref,
  getVisibleElements,
  findDefs,
  getRotationAngle,
  getRefElem,
  getBBox as utilsGetBBox,
  walkTreePost,
  assignAttributes,
  getFeGaussianBlur
} from './utilities.js'
import {
  transformPoint,
  matrixMultiply,
  transformListToTransform
} from './math.js'
import { recalculateDimensions } from './recalculate.js'
import { isGecko } from '../common/browser.js'
import { getParents } from '../common/util.js'

const {
  MoveElementCommand,
  BatchCommand,
  InsertElementCommand,
  RemoveElementCommand,
  ChangeElementCommand
} = hstry

let svgCanvas = null

/**
 * @function module:selected-elem.init
 * @param {module:selected-elem.elementContext} elementContext
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
  svgCanvas.copySelectedElements = copySelectedElements
  svgCanvas.groupSelectedElements = groupSelectedElements // Wraps all the selected elements in a group (`g`) element.
  svgCanvas.pushGroupProperties = pushGroupProperty // Pushes all appropriate parent group properties down to its children
  svgCanvas.ungroupSelectedElement = ungroupSelectedElement // Unwraps all the elements in a selected group (`g`) element
  svgCanvas.moveToTopSelectedElement = moveToTopSelectedElem // Repositions the selected element to the bottom in the DOM to appear on top
  svgCanvas.moveToBottomSelectedElement = moveToBottomSelectedElem // Repositions the selected element to the top in the DOM to appear under other elements
  svgCanvas.moveUpDownSelected = moveUpDownSelected // Moves the select element up or down the stack, based on the visibly
  svgCanvas.moveSelectedElements = moveSelectedElements // Moves selected elements on the X/Y axis.
  svgCanvas.cloneSelectedElements = cloneSelectedElements // Create deep DOM copies (clones) of all selected elements and move them slightly
  svgCanvas.alignSelectedElements = alignSelectedElements // Aligns selected elements.
  svgCanvas.updateCanvas = updateCanvas // Updates the editor canvas width/height/position after a zoom has occurred.
  svgCanvas.cycleElement = cycleElement // Select the next/previous element within the current layer.
  svgCanvas.deleteSelectedElements = deleteSelectedElements // Removes all selected elements from the DOM and adds the change to the history
}

/**
 * Repositions the selected element to the bottom in the DOM to appear on top of
 * other elements.
 * @function module:selected-elem.SvgCanvas#moveToTopSelectedElem
 * @fires module:selected-elem.SvgCanvas#event:changed
 * @returns {void}
 */
const moveToTopSelectedElem = () => {
  const [selected] = svgCanvas.getSelectedElements()
  if (selected) {
    const t = selected
    const oldParent = t.parentNode
    const oldNextSibling = t.nextSibling
    t.parentNode.append(t)
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      svgCanvas.addCommandToHistory(
        new MoveElementCommand(t, oldNextSibling, oldParent, 'top')
      )
      svgCanvas.call('changed', [t])
    }
  }
}

/**
 * Repositions the selected element to the top in the DOM to appear under
 * other elements.
 * @function module:selected-elem.SvgCanvas#moveToBottomSelectedElement
 * @fires module:selected-elem.SvgCanvas#event:changed
 * @returns {void}
 */
const moveToBottomSelectedElem = () => {
  const [selected] = svgCanvas.getSelectedElements()
  if (selected) {
    let t = selected
    const oldParent = t.parentNode
    const oldNextSibling = t.nextSibling
    let { firstChild } = t.parentNode
    if (firstChild.tagName === 'title') {
      firstChild = firstChild.nextSibling
    }
    // This can probably be removed, as the defs should not ever apppear
    // inside a layer group
    if (firstChild.tagName === 'defs') {
      firstChild = firstChild.nextSibling
    }
    t = t.parentNode.insertBefore(t, firstChild)
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      svgCanvas.addCommandToHistory(
        new MoveElementCommand(t, oldNextSibling, oldParent, 'bottom')
      )
      svgCanvas.call('changed', [t])
    }
  }
}

/**
 * Moves the select element up or down the stack, based on the visibly
 * intersecting elements.
 * @function module:selected-elem.SvgCanvas#moveUpDownSelected
 * @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
 * @fires module:selected-elem.SvgCanvas#event:changed
 * @returns {void}
 */
const moveUpDownSelected = dir => {
  const selectedElements = svgCanvas.getSelectedElements()
  const selected = selectedElements[0]
  if (!selected) {
    return
  }

  svgCanvas.setCurBBoxes([])
  let closest
  let foundCur
  // jQuery sorts this list
  const list = svgCanvas.getIntersectionList(
    getStrokedBBoxDefaultVisible([selected])
  )
  if (dir === 'Down') {
    list.reverse()
  }

  Array.prototype.forEach.call(list, el => {
    if (!foundCur) {
      if (el === selected) {
        foundCur = true
      }
      return true
    }
    if (closest === undefined) {
      closest = el
    }
    return false
  })
  if (!closest) {
    return
  }

  const t = selected
  const oldParent = t.parentNode
  const oldNextSibling = t.nextSibling
  if (dir === 'Down') {
    closest.insertAdjacentElement('beforebegin', t)
  } else {
    closest.insertAdjacentElement('afterend', t)
  }
  // If the element actually moved position, add the command and fire the changed
  // event handler.
  if (oldNextSibling !== t.nextSibling) {
    svgCanvas.addCommandToHistory(
      new MoveElementCommand(t, oldNextSibling, oldParent, 'Move ' + dir)
    )
    svgCanvas.call('changed', [t])
  }
}

/**
 * Moves selected elements on the X/Y axis.
 * @function module:selected-elem.SvgCanvas#moveSelectedElements
 * @param {Float} dx - Float with the distance to move on the x-axis
 * @param {Float} dy - Float with the distance to move on the y-axis
 * @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
 * @fires module:selected-elem.SvgCanvas#event:changed
 * @returns {BatchCommand|void} Batch command for the move
 */

const moveSelectedElements = (dx, dy, undoable = true) => {
  const selectedElements = svgCanvas.getSelectedElements()
  const zoom = svgCanvas.getZoom()
  // if undoable is not sent, default to true
  // if single values, scale them to the zoom
  if (!Array.isArray(dx)) {
    dx /= zoom
    dy /= zoom
  }

  const batchCmd = new BatchCommand('position')
  selectedElements.forEach((selected, i) => {
    if (selected) {
      const xform = svgCanvas.getSvgRoot().createSVGTransform()
      const tlist = selected.transform?.baseVal

      // dx and dy could be arrays
      if (Array.isArray(dx)) {
        xform.setTranslate(dx[i], dy[i])
      } else {
        xform.setTranslate(dx, dy)
      }

      if (tlist.numberOfItems) {
        tlist.insertItemBefore(xform, 0)
      } else {
        tlist.appendItem(xform)
      }

      const cmd = recalculateDimensions(selected)
      if (cmd) {
        batchCmd.addSubCommand(cmd)
      }

      svgCanvas
        .gettingSelectorManager()
        .requestSelector(selected)
        .resize()
    }
  })
  if (!batchCmd.isEmpty()) {
    if (undoable) {
      svgCanvas.addCommandToHistory(batchCmd)
    }
    svgCanvas.call('changed', selectedElements)
    return batchCmd
  }
  return undefined
}

/**
 * Create deep DOM copies (clones) of all selected elements and move them slightly
 * from their originals.
 * @function module:selected-elem.SvgCanvas#cloneSelectedElements
 * @param {Float} x Float with the distance to move on the x-axis
 * @param {Float} y Float with the distance to move on the y-axis
 * @returns {void}
 */
const cloneSelectedElements = (x, y) => {
  const selectedElements = svgCanvas.getSelectedElements()
  const currentGroup = svgCanvas.getCurrentGroup()
  let i
  let elem
  const batchCmd = new BatchCommand('Clone Elements')
  // find all the elements selected (stop at first null)
  const len = selectedElements.length

  const index = el => {
    if (!el) return -1
    let i = 0
    do {
      i++
    } while (el === el.previousElementSibling)
    return i
  }

  /**
   * Sorts an array numerically and ascending.
   * @param {Element} a
   * @param {Element} b
   * @returns {Integer}
   */
  const sortfunction = (a, b) => {
    return index(b) - index(a)
  }
  selectedElements.sort(sortfunction)
  for (i = 0; i < len; ++i) {
    elem = selectedElements[i]
    if (!elem) {
      break
    }
  }
  // use slice to quickly get the subset of elements we need
  const copiedElements = selectedElements.slice(0, i)
  svgCanvas.clearSelection(true)
  // note that we loop in the reverse way because of the way elements are added
  // to the selectedElements array (top-first)
  const drawing = svgCanvas.getDrawing()
  i = copiedElements.length
  while (i--) {
    // clone each element and replace it within copiedElements
    elem = copiedElements[i] = drawing.copyElem(copiedElements[i])
    ;(currentGroup || drawing.getCurrentLayer()).append(elem)
    batchCmd.addSubCommand(new InsertElementCommand(elem))
  }

  if (!batchCmd.isEmpty()) {
    svgCanvas.addToSelection(copiedElements.reverse()) // Need to reverse for correct selection-adding
    moveSelectedElements(x, y, false)
    svgCanvas.addCommandToHistory(batchCmd)
  }
}
/**
 * Aligns selected elements.
 * @function module:selected-elem.SvgCanvas#alignSelectedElements
 * @param {string} type - String with single character indicating the alignment type
 * @param {"selected"|"largest"|"smallest"|"page"} relativeTo
 * @returns {void}
 */
const alignSelectedElements = (type, relativeTo) => {
  const selectedElements = svgCanvas.getSelectedElements()
  const bboxes = [] // angles = [];
  const len = selectedElements.length
  if (!len) {
    return
  }
  let minx = Number.MAX_VALUE
  let maxx = Number.MIN_VALUE
  let miny = Number.MAX_VALUE
  let maxy = Number.MIN_VALUE

  const isHorizontalAlign = (type) => ['l', 'c', 'r', 'left', 'center', 'right'].includes(type)
  const isVerticalAlign = (type) => ['t', 'm', 'b', 'top', 'middle', 'bottom'].includes(type)

  for (let i = 0; i < len; ++i) {
    if (!selectedElements[i]) {
      break
    }
    const elem = selectedElements[i]
    bboxes[i] = getStrokedBBoxDefaultVisible([elem])
  }

  // distribute horizontal and vertical align is not support smallest and largest
  if (['smallest', 'largest'].includes(relativeTo) && ['dh', 'distrib_horiz', 'dv', 'distrib_verti'].includes(type)) {
    relativeTo = 'selected'
  }

  switch (relativeTo) {
    case 'smallest':
      if (isHorizontalAlign(type) || isVerticalAlign(type)) {
        const sortedBboxes = bboxes.slice().sort((a, b) => a.width - b.width)
        const minBbox = sortedBboxes[0]
        minx = minBbox.x
        miny = minBbox.y
        maxx = minBbox.x + minBbox.width
        maxy = minBbox.y + minBbox.height
      }
      break
    case 'largest':
      if (isHorizontalAlign(type) || isVerticalAlign(type)) {
        const sortedBboxes = bboxes.slice().sort((a, b) => a.width - b.width)
        const maxBbox = sortedBboxes[bboxes.length - 1]
        minx = maxBbox.x
        miny = maxBbox.y
        maxx = maxBbox.x + maxBbox.width
        maxy = maxBbox.y + maxBbox.height
      }
      break
    case 'page':
      minx = 0
      miny = 0
      maxx = svgCanvas.getContentW()
      maxy = svgCanvas.getContentH()
      break
    default:
      // 'selected'
      minx = Math.min(...bboxes.map(box => box.x))
      miny = Math.min(...bboxes.map(box => box.y))
      maxx = Math.max(...bboxes.map(box => box.x + box.width))
      maxy = Math.max(...bboxes.map(box => box.y + box.height))
      break
  } // adjust min/max

  let dx = []
  let dy = []

  if (['dh', 'distrib_horiz'].includes(type)) { // distribute horizontal align
    [dx, dy] = _getDistributeHorizontalDistances(relativeTo, selectedElements, bboxes, minx, maxx, miny, maxy)
  } else if (['dv', 'distrib_verti'].includes(type)) { // distribute vertical align
    [dx, dy] = _getDistributeVerticalDistances(relativeTo, selectedElements, bboxes, minx, maxx, miny, maxy)
  } else { // normal align (top, left, right, ...)
    [dx, dy] = _getNormalDistances(type, selectedElements, bboxes, minx, maxx, miny, maxy)
  }

  moveSelectedElements(dx, dy)
}

/**
 * Aligns selected elements.
 * @function module:selected-elem.SvgCanvas#alignSelectedElements
 * @param {string} type - String with single character indicating the alignment type
 * @param {"selected"|"largest"|"smallest"|"page"} relativeTo
 * @returns {void}
 */

/**
 * get distribution horizontal distances.
 * (internal call only)
 *
 * @param {string} relativeTo
 * @param {Element[]} selectedElements - the array with selected DOM elements
 * @param {module:utilities.BBoxObject} bboxes - bounding box objects
 * @param {Float} minx - selected area min-x
 * @param {Float} maxx - selected area max-x
 * @param {Float} miny - selected area min-y
 * @param {Float} maxy - selected area max-y
 * @returns {Array.Float[]} x and y distances array
 * @private
 */
const _getDistributeHorizontalDistances = (relativeTo, selectedElements, bboxes, minx, maxx, miny, maxy) => {
  const dx = []
  const dy = []

  for (let i = 0; i < selectedElements.length; i++) {
    dy[i] = 0
  }

  const bboxesSortedClone = bboxes
    .slice()
    .sort((firstBox, secondBox) => {
      const firstMaxX = firstBox.x + firstBox.width
      const secondMaxX = secondBox.x + secondBox.width

      if (firstMaxX === secondMaxX) { return 0 } else if (firstMaxX > secondMaxX) { return 1 } else { return -1 }
    })

  if (relativeTo === 'page') {
    bboxesSortedClone.unshift({ x: 0, y: 0, width: 0, height: maxy }) // virtual left box
    bboxesSortedClone.push({ x: maxx, y: 0, width: 0, height: maxy }) // virtual right box
  }

  const totalWidth = maxx - minx
  const totalBoxWidth = bboxesSortedClone.map(b => b.width).reduce((w1, w2) => w1 + w2, 0)
  const space = (totalWidth - totalBoxWidth) / (bboxesSortedClone.length - 1)
  const _dx = []

  for (let i = 0; i < bboxesSortedClone.length; ++i) {
    _dx[i] = 0

    if (i === 0) { continue }

    const orgX = bboxesSortedClone[i].x
    bboxesSortedClone[i].x = bboxesSortedClone[i - 1].x + bboxesSortedClone[i - 1].width + space
    _dx[i] = bboxesSortedClone[i].x - orgX
  }

  bboxesSortedClone.forEach((boxClone, idx) => {
    const orgIdx = bboxes.findIndex(box => box === boxClone)
    if (orgIdx !== -1) {
      dx[orgIdx] = _dx[idx]
    }
  })

  return [dx, dy]
}

/**
 * get distribution vertical distances.
 * (internal call only)
 *
 * @param {string} relativeTo
 * @param {Element[]} selectedElements - the array with selected DOM elements
 * @param {module:utilities.BBoxObject} bboxes - bounding box objects
 * @param {Float} minx - selected area min-x
 * @param {Float} maxx - selected area max-x
 * @param {Float} miny - selected area min-y
 * @param {Float} maxy - selected area max-y
 * @returns {Array.Float[]}} x and y distances array
 * @private
 */
const _getDistributeVerticalDistances = (relativeTo, selectedElements, bboxes, minx, maxx, miny, maxy) => {
  const dx = []
  const dy = []

  for (let i = 0; i < selectedElements.length; i++) {
    dx[i] = 0
  }

  const bboxesSortedClone = bboxes
    .slice()
    .sort((firstBox, secondBox) => {
      const firstMaxY = firstBox.y + firstBox.height
      const secondMaxY = secondBox.y + secondBox.height

      if (firstMaxY === secondMaxY) { return 0 } else if (firstMaxY > secondMaxY) { return 1 } else { return -1 }
    })

  if (relativeTo === 'page') {
    bboxesSortedClone.unshift({ x: 0, y: 0, width: maxx, height: 0 }) // virtual top box
    bboxesSortedClone.push({ x: 0, y: maxy, width: maxx, height: 0 }) // virtual bottom box
  }

  const totalHeight = maxy - miny
  const totalBoxHeight = bboxesSortedClone.map(b => b.height).reduce((h1, h2) => h1 + h2, 0)
  const space = (totalHeight - totalBoxHeight) / (bboxesSortedClone.length - 1)
  const _dy = []

  for (let i = 0; i < bboxesSortedClone.length; ++i) {
    _dy[i] = 0

    if (i === 0) { continue }

    const orgY = bboxesSortedClone[i].y
    bboxesSortedClone[i].y = bboxesSortedClone[i - 1].y + bboxesSortedClone[i - 1].height + space
    _dy[i] = bboxesSortedClone[i].y - orgY
  }

  bboxesSortedClone.forEach((boxClone, idx) => {
    const orgIdx = bboxes.findIndex(box => box === boxClone)
    if (orgIdx !== -1) {
      dy[orgIdx] = _dy[idx]
    }
  })

  return [dx, dy]
}

/**
 * get normal align distances.
 * (internal call only)
 *
 * @param {string} type
 * @param {Element[]} selectedElements - the array with selected DOM elements
 * @param {module:utilities.BBoxObject} bboxes - bounding box objects
 * @param {Float} minx - selected area min-x
 * @param {Float} maxx - selected area max-x
 * @param {Float} miny - selected area min-y
 * @param {Float} maxy - selected area max-y
 * @returns {Array.Float[]} x and y distances array
 * @private
 */
const _getNormalDistances = (type, selectedElements, bboxes, minx, maxx, miny, maxy) => {
  const len = selectedElements.length
  const dx = new Array(len)
  const dy = new Array(len)

  for (let i = 0; i < len; ++i) {
    if (!selectedElements[i]) {
      break
    }
    // const elem = selectedElements[i];
    const bbox = bboxes[i]
    dx[i] = 0
    dy[i] = 0

    switch (type) {
      case 'l': // left (horizontal)
      case 'left': // left (horizontal)
        dx[i] = minx - bbox.x
        break
      case 'c': // center (horizontal)
      case 'center': // center (horizontal)
        dx[i] = (minx + maxx) / 2 - (bbox.x + bbox.width / 2)
        break
      case 'r': // right (horizontal)
      case 'right': // right (horizontal)
        dx[i] = maxx - (bbox.x + bbox.width)
        break
      case 't': // top (vertical)
      case 'top': // top (vertical)
        dy[i] = miny - bbox.y
        break
      case 'm': // middle (vertical)
      case 'middle': // middle (vertical)
        dy[i] = (miny + maxy) / 2 - (bbox.y + bbox.height / 2)
        break
      case 'b': // bottom (vertical)
      case 'bottom': // bottom (vertical)
        dy[i] = maxy - (bbox.y + bbox.height)
        break
    }
  }

  return [dx, dy]
}

/**
 * Removes all selected elements from the DOM and adds the change to the
 * history stack.
 * @function module:selected-elem.SvgCanvas#deleteSelectedElements
 * @fires module:selected-elem.SvgCanvas#event:changed
 * @returns {void}
 */
const deleteSelectedElements = () => {
  const selectedElements = svgCanvas.getSelectedElements()
  const batchCmd = new BatchCommand('Delete Elements')
  const selectedCopy = [] // selectedElements is being deleted

  selectedElements.forEach(selected => {
    if (selected) {
      let parent = selected.parentNode
      let t = selected
      // this will unselect the element and remove the selectedOutline
      svgCanvas.gettingSelectorManager().releaseSelector(t)
      // Remove the path if present.
      pathModule.removePath_(t.id)
      // Get the parent if it's a single-child anchor
      if (parent.tagName === 'a' && parent.childNodes.length === 1) {
        t = parent
        parent = parent.parentNode
      }
      const { nextSibling } = t
      t.remove()
      const elem = t
      selectedCopy.push(selected) // for the copy
      batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent))
    }
  })
  svgCanvas.setEmptySelectedElements()

  if (!batchCmd.isEmpty()) {
    svgCanvas.addCommandToHistory(batchCmd)
  }
  svgCanvas.call('changed', selectedCopy)
  svgCanvas.clearSelection()
}

/**
 * Remembers the current selected elements on the clipboard.
 * @function module:selected-elem.SvgCanvas#copySelectedElements
 * @returns {void}
 */
const copySelectedElements = () => {
  const selectedElements = svgCanvas.getSelectedElements()
  const data = JSON.stringify(
    selectedElements.map(x => svgCanvas.getJsonFromSvgElements(x))
  )
  // Use sessionStorage for the clipboard data.
  sessionStorage.setItem(svgCanvas.getClipboardID(), data)
  svgCanvas.flashStorage()

  // Context menu might not exist (it is provided by editor.js).
  const canvMenu = document.getElementById('se-cmenu_canvas')
  canvMenu.setAttribute('enablemenuitems', '#paste,#paste_in_place')
}

/**
 * Wraps all the selected elements in a group (`g`) element.
 * @function module:selected-elem.SvgCanvas#groupSelectedElements
 * @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
 * @param {string} [urlArg]
 * @returns {void}
 */
const groupSelectedElements = (type, urlArg) => {
  const selectedElements = svgCanvas.getSelectedElements()
  if (!type) {
    type = 'g'
  }
  let cmdStr = ''
  let url

  switch (type) {
    case 'a': {
      cmdStr = 'Make hyperlink'
      url = urlArg || ''
      break
    }
    default: {
      type = 'g'
      cmdStr = 'Group Elements'
      break
    }
  }

  const batchCmd = new BatchCommand(cmdStr)

  // create and insert the group element
  const g = svgCanvas.addSVGElementsFromJson({
    element: type,
    attr: {
      id: svgCanvas.getNextId()
    }
  })
  if (type === 'a') {
    setHref(g, url)
  }
  batchCmd.addSubCommand(new InsertElementCommand(g))

  // now move all children into the group
  let i = selectedElements.length
  while (i--) {
    let elem = selectedElements[i]
    if (!elem) {
      continue
    }

    if (
      elem.parentNode.tagName === 'a' &&
      elem.parentNode.childNodes.length === 1
    ) {
      elem = elem.parentNode
    }

    const oldNextSibling = elem.nextSibling
    const oldParent = elem.parentNode
    g.append(elem)
    batchCmd.addSubCommand(
      new MoveElementCommand(elem, oldNextSibling, oldParent)
    )
  }
  if (!batchCmd.isEmpty()) {
    svgCanvas.addCommandToHistory(batchCmd)
  }

  // update selection
  svgCanvas.selectOnly([g], true)
}

/**
 * Pushes all appropriate parent group properties down to its children, then
 * removes them from the group.
 * @function module:selected-elem.SvgCanvas#pushGroupProperty
 * @param {SVGAElement|SVGGElement} g
 * @param {boolean} undoable
 * @returns {BatchCommand|void}
 */
const pushGroupProperty = (g, undoable) => {
  const children = g.childNodes
  const len = children.length
  const xform = g.getAttribute('transform')

  const glist = g.transform.baseVal
  const m = transformListToTransform(glist).matrix

  const batchCmd = new BatchCommand('Push group properties')

  // TODO: get all fill/stroke properties from the group that we are about to destroy
  // "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset",
  // "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
  // "stroke-width"
  // and then for each child, if they do not have the attribute (or the value is 'inherit')
  // then set the child's attribute

  const gangle = getRotationAngle(g)

  const gattrs = {
    filter: g.getAttribute('filter'),
    opacity: g.getAttribute('opacity')
  }
  let gfilter
  let gblur
  let changes
  const drawing = svgCanvas.getDrawing()

  for (let i = 0; i < len; i++) {
    const elem = children[i]

    if (elem.nodeType !== 1) {
      continue
    }

    if (gattrs.opacity !== null && gattrs.opacity !== 1) {
      // const c_opac = elem.getAttribute('opacity') || 1;
      const newOpac =
        Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100) /
        100
      svgCanvas.changeSelectedAttribute('opacity', newOpac, [elem])
    }

    if (gattrs.filter) {
      let cblur = svgCanvas.getBlur(elem)
      const origCblur = cblur
      if (!gblur) {
        gblur = svgCanvas.getBlur(g)
      }
      if (cblur) {
        // Is this formula correct?
        cblur = Number(gblur) + Number(cblur)
      } else if (cblur === 0) {
        cblur = gblur
      }

      // If child has no current filter, get group's filter or clone it.
      if (!origCblur) {
        // Set group's filter to use first child's ID
        if (!gfilter) {
          gfilter = getRefElem(gattrs.filter)
        } else {
          // Clone the group's filter
          gfilter = drawing.copyElem(gfilter)
          findDefs().append(gfilter)

          // const filterElem = getRefElem(gfilter);
          const blurElem = getFeGaussianBlur(gfilter)
          // Change this in future for different filters
          const suffix =
            blurElem?.tagName === 'feGaussianBlur' ? 'blur' : 'filter'
          gfilter.id = elem.id + '_' + suffix
          svgCanvas.changeSelectedAttribute(
            'filter',
            'url(#' + gfilter.id + ')',
            [elem]
          )
        }
      } else {
        gfilter = getRefElem(elem.getAttribute('filter'))
      }
      // const filterElem = getRefElem(gfilter);
      const blurElem = getFeGaussianBlur(gfilter)

      // Update blur value
      if (cblur) {
        svgCanvas.changeSelectedAttribute('stdDeviation', cblur, [blurElem])
        svgCanvas.setBlurOffsets(gfilter, cblur)
      }
    }

    let chtlist = elem.transform?.baseVal

    // Don't process gradient transforms
    if (elem.tagName.includes('Gradient')) {
      chtlist = null
    }

    // Hopefully not a problem to add this. Necessary for elements like <desc/>
    if (!chtlist) {
      continue
    }

    // Apparently <defs> can get get a transformlist, but we don't want it to have one!
    if (elem.tagName === 'defs') {
      continue
    }

    if (glist.numberOfItems) {
      // TODO: if the group's transform is just a rotate, we can always transfer the
      // rotate() down to the children (collapsing consecutive rotates and factoring
      // out any translates)
      if (gangle && glist.numberOfItems === 1) {
        // [Rg] [Rc] [Mc]
        // we want [Tr] [Rc2] [Mc] where:
        //  - [Rc2] is at the child's current center but has the
        // sum of the group and child's rotation angles
        //  - [Tr] is the equivalent translation that this child
        // undergoes if the group wasn't there

        // [Tr] = [Rg] [Rc] [Rc2_inv]

        // get group's rotation matrix (Rg)
        const rgm = glist.getItem(0).matrix

        // get child's rotation matrix (Rc)
        let rcm = svgCanvas.getSvgRoot().createSVGMatrix()
        const cangle = getRotationAngle(elem)
        if (cangle) {
          rcm = chtlist.getItem(0).matrix
        }

        // get child's old center of rotation
        const cbox = utilsGetBBox(elem)
        const ceqm = transformListToTransform(chtlist).matrix
        const coldc = transformPoint(
          cbox.x + cbox.width / 2,
          cbox.y + cbox.height / 2,
          ceqm
        )

        // sum group and child's angles
        const sangle = gangle + cangle

        // get child's rotation at the old center (Rc2_inv)
        const r2 = svgCanvas.getSvgRoot().createSVGTransform()
        r2.setRotate(sangle, coldc.x, coldc.y)

        // calculate equivalent translate
        const trm = matrixMultiply(rgm, rcm, r2.matrix.inverse())

        // set up tlist
        if (cangle) {
          chtlist.removeItem(0)
        }

        if (sangle) {
          if (chtlist.numberOfItems) {
            chtlist.insertItemBefore(r2, 0)
          } else {
            chtlist.appendItem(r2)
          }
        }

        if (trm.e || trm.f) {
          const tr = svgCanvas.getSvgRoot().createSVGTransform()
          tr.setTranslate(trm.e, trm.f)
          if (chtlist.numberOfItems) {
            chtlist.insertItemBefore(tr, 0)
          } else {
            chtlist.appendItem(tr)
          }
        }
      } else {
        // more complicated than just a rotate
        // transfer the group's transform down to each child and then
        // call recalculateDimensions()
        const oldxform = elem.getAttribute('transform')
        changes = {}
        changes.transform = oldxform || ''

        const newxform = svgCanvas.getSvgRoot().createSVGTransform()

        // [ gm ] [ chm ] = [ chm ] [ gm' ]
        // [ gm' ] = [ chmInv ] [ gm ] [ chm ]
        const chm = transformListToTransform(chtlist).matrix
        const chmInv = chm.inverse()
        const gm = matrixMultiply(chmInv, m, chm)
        newxform.setMatrix(gm)
        chtlist.appendItem(newxform)
      }
      const cmd = recalculateDimensions(elem)
      if (cmd) {
        batchCmd.addSubCommand(cmd)
      }
    }
  }

  // remove transform and make it undo-able
  if (xform) {
    changes = {}
    changes.transform = xform
    g.setAttribute('transform', '')
    g.removeAttribute('transform')
    batchCmd.addSubCommand(new ChangeElementCommand(g, changes))
  }

  if (undoable && !batchCmd.isEmpty()) {
    return batchCmd
  }
  return undefined
}

/**
 * Converts selected/given `<use>` or child SVG element to a group.
 * @function module:selected-elem.SvgCanvas#convertToGroup
 * @param {Element} elem
 * @fires module:selected-elem.SvgCanvas#event:selected
 * @returns {void}
 */
const convertToGroup = elem => {
  const selectedElements = svgCanvas.getSelectedElements()
  if (!elem) {
    elem = selectedElements[0]
  }
  const $elem = elem
  const batchCmd = new BatchCommand()
  let ts
  const dataStorage = svgCanvas.getDataStorage()
  if (dataStorage.has($elem, 'gsvg')) {
    // Use the gsvg as the new group
    const svg = elem.firstChild
    const pt = {
      x: Number(svg.getAttribute('x')),
      y: Number(svg.getAttribute('y'))
    }

    // $(elem.firstChild.firstChild).unwrap();
    const firstChild = elem.firstChild.firstChild
    if (firstChild) {
      firstChild.outerHTML = firstChild.innerHTML
    }
    dataStorage.remove(elem, 'gsvg')

    const tlist = elem.transform.baseVal
    const xform = svgCanvas.getSvgRoot().createSVGTransform()
    xform.setTranslate(pt.x, pt.y)
    tlist.appendItem(xform)
    recalculateDimensions(elem)
    svgCanvas.call('selected', [elem])
  } else if (dataStorage.has($elem, 'symbol')) {
    elem = dataStorage.get($elem, 'symbol')

    ts = $elem.getAttribute('transform') || ''
    const pos = {
      x: Number($elem.getAttribute('x')),
      y: Number($elem.getAttribute('y'))
    }

    const vb = elem.getAttribute('viewBox')

    if (vb) {
      const nums = vb.split(' ')
      pos.x -= Number(nums[0])
      pos.y -= Number(nums[1])
    }

    // Not ideal, but works
    ts += ' translate(' + (pos.x || 0) + ',' + (pos.y || 0) + ')'

    const prev = $elem.previousElementSibling

    // Remove <use> element
    batchCmd.addSubCommand(
      new RemoveElementCommand(
        $elem,
        $elem.nextElementSibling,
        $elem.parentNode
      )
    )
    $elem.remove()

    // See if other elements reference this symbol
    const svgContent = svgCanvas.getSvgContent()
    // const hasMore = svgContent.querySelectorAll('use:data(symbol)').length;
    // @todo review this logic
    const hasMore = svgContent.querySelectorAll('use').length

    const g = svgCanvas.getDOMDocument().createElementNS(NS.SVG, 'g')
    const childs = elem.childNodes

    let i
    for (i = 0; i < childs.length; i++) {
      g.append(childs[i].cloneNode(true))
    }

    // Duplicate the gradients for Gecko, since they weren't included in the <symbol>
    if (isGecko()) {
      const svgElement = findDefs()
      const gradients = svgElement.querySelectorAll(
        'linearGradient,radialGradient,pattern'
      )
      for (let i = 0, im = gradients.length; im > i; i++) {
        g.appendChild(gradients[i].cloneNode(true))
      }
    }

    if (ts) {
      g.setAttribute('transform', ts)
    }

    const parent = elem.parentNode

    svgCanvas.uniquifyElems(g)

    // Put the dupe gradients back into <defs> (after uniquifying them)
    if (isGecko()) {
      const svgElement = findDefs()
      const elements = g.querySelectorAll(
        'linearGradient,radialGradient,pattern'
      )
      for (let i = 0, im = elements.length; im > i; i++) {
        svgElement.appendChild(elements[i])
      }
    }

    // now give the g itself a new id
    g.id = svgCanvas.getNextId()

    prev.after(g)

    if (parent) {
      if (!hasMore) {
        // remove symbol/svg element
        const { nextSibling } = elem
        elem.remove()
        batchCmd.addSubCommand(
          new RemoveElementCommand(elem, nextSibling, parent)
        )
      }
      batchCmd.addSubCommand(new InsertElementCommand(g))
    }

    svgCanvas.setUseData(g)

    if (isGecko()) {
      svgCanvas.convertGradients(findDefs())
    } else {
      svgCanvas.convertGradients(g)
    }

    // recalculate dimensions on the top-level children so that unnecessary transforms
    // are removed
    walkTreePost(g, n => {
      try {
        recalculateDimensions(n)
      } catch (e) {
        console.error(e)
      }
    })

    // Give ID for any visible element missing one
    const visElems = g.querySelectorAll(svgCanvas.getVisElems())
    Array.prototype.forEach.call(visElems, el => {
      if (!el.id) {
        el.id = svgCanvas.getNextId()
      }
    })

    svgCanvas.selectOnly([g])

    const cm = pushGroupProperty(g, true)
    if (cm) {
      batchCmd.addSubCommand(cm)
    }

    svgCanvas.addCommandToHistory(batchCmd)
  } else {
    console.warn('Unexpected element to ungroup:', elem)
  }
}

/**
 * Unwraps all the elements in a selected group (`g`) element. This requires
 * significant recalculations to apply group's transforms, etc. to its children.
 * @function module:selected-elem.SvgCanvas#ungroupSelectedElement
 * @returns {void}
 */
const ungroupSelectedElement = () => {
  const selectedElements = svgCanvas.getSelectedElements()
  const dataStorage = svgCanvas.getDataStorage()
  let g = selectedElements[0]
  if (!g) {
    return
  }
  if (dataStorage.has(g, 'gsvg') || dataStorage.has(g, 'symbol')) {
    // Is svg, so actually convert to group
    convertToGroup(g)
    return
  }
  if (g.tagName === 'use') {
    // Somehow doesn't have data set, so retrieve
    const symbol = getElement(getHref(g).substr(1))
    dataStorage.put(g, 'symbol', symbol)
    dataStorage.put(g, 'ref', symbol)
    convertToGroup(g)
    return
  }
  const parentsA = getParents(g.parentNode, 'a')
  if (parentsA?.length) {
    g = parentsA[0]
  }

  // Look for parent "a"
  if (g.tagName === 'g' || g.tagName === 'a') {
    const batchCmd = new BatchCommand('Ungroup Elements')
    const cmd = pushGroupProperty(g, true)
    if (cmd) {
      batchCmd.addSubCommand(cmd)
    }

    const parent = g.parentNode
    const anchor = g.nextSibling
    const children = new Array(g.childNodes.length)

    let i = 0
    while (g.firstChild) {
      const elem = g.firstChild
      const oldNextSibling = elem.nextSibling
      const oldParent = elem.parentNode

      // Remove child title elements
      if (elem.tagName === 'title') {
        const { nextSibling } = elem
        batchCmd.addSubCommand(
          new RemoveElementCommand(elem, nextSibling, oldParent)
        )
        elem.remove()
        continue
      }

      children[i++] = parent.insertBefore(elem, anchor)
      batchCmd.addSubCommand(
        new MoveElementCommand(elem, oldNextSibling, oldParent)
      )
    }

    // remove the group from the selection
    svgCanvas.clearSelection()

    // delete the group element (but make undo-able)
    const gNextSibling = g.nextSibling
    g.remove()
    batchCmd.addSubCommand(new RemoveElementCommand(g, gNextSibling, parent))

    if (!batchCmd.isEmpty()) {
      svgCanvas.addCommandToHistory(batchCmd)
    }

    // update selection
    svgCanvas.addToSelection(children)
  }
}
/**
 * Updates the editor canvas width/height/position after a zoom has occurred.
 * @function module:svgcanvas.SvgCanvas#updateCanvas
 * @param {Float} w - Float with the new width
 * @param {Float} h - Float with the new height
 * @fires module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
 * @returns {module:svgcanvas.CanvasInfo}
 */
const updateCanvas = (w, h) => {
  svgCanvas.getSvgRoot().setAttribute('width', w)
  svgCanvas.getSvgRoot().setAttribute('height', h)
  const zoom = svgCanvas.getZoom()
  const bg = document.getElementById('canvasBackground')
  const oldX = Number(svgCanvas.getSvgContent().getAttribute('x'))
  const oldY = Number(svgCanvas.getSvgContent().getAttribute('y'))
  const x = (w - svgCanvas.contentW * zoom) / 2
  const y = (h - svgCanvas.contentH * zoom) / 2

  assignAttributes(svgCanvas.getSvgContent(), {
    width: svgCanvas.contentW * zoom,
    height: svgCanvas.contentH * zoom,
    x,
    y,
    viewBox: '0 0 ' + svgCanvas.contentW + ' ' + svgCanvas.contentH
  })

  assignAttributes(bg, {
    width: svgCanvas.getSvgContent().getAttribute('width'),
    height: svgCanvas.getSvgContent().getAttribute('height'),
    x,
    y
  })

  const bgImg = getElement('background_image')
  if (bgImg) {
    assignAttributes(bgImg, {
      width: '100%',
      height: '100%'
    })
  }

  svgCanvas.selectorManager.selectorParentGroup.setAttribute(
    'transform',
    'translate(' + x + ',' + y + ')'
  )

  /**
   * Invoked upon updates to the canvas.
   * @event module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
   * @type {PlainObject}
   * @property {Integer} new_x
   * @property {Integer} new_y
   * @property {string} old_x (Of Integer)
   * @property {string} old_y (Of Integer)
   * @property {Integer} d_x
   * @property {Integer} d_y
   */
  svgCanvas.runExtensions(
    'canvasUpdated',
    /**
     * @type {module:svgcanvas.SvgCanvas#event:ext_canvasUpdated}
     */
    {
      new_x: x,
      new_y: y,
      old_x: oldX,
      old_y: oldY,
      d_x: x - oldX,
      d_y: y - oldY
    }
  )
  return { x, y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY }
}
/**
 * Select the next/previous element within the current layer.
 * @function module:svgcanvas.SvgCanvas#cycleElement
 * @param {boolean} next - true = next and false = previous element
 * @fires module:svgcanvas.SvgCanvas#event:selected
 * @returns {void}
 */
const cycleElement = next => {
  const selectedElements = svgCanvas.getSelectedElements()
  const currentGroup = svgCanvas.getCurrentGroup()
  let num
  const curElem = selectedElements[0]
  let elem = false
  const allElems = getVisibleElements(
    currentGroup || svgCanvas.getCurrentDrawing().getCurrentLayer()
  )
  if (!allElems.length) {
    return
  }
  if (!curElem) {
    num = next ? allElems.length - 1 : 0
    elem = allElems[num]
  } else {
    let i = allElems.length
    while (i--) {
      if (allElems[i] === curElem) {
        num = next ? i - 1 : i + 1
        if (num >= allElems.length) {
          num = 0
        } else if (num < 0) {
          num = allElems.length - 1
        }
        elem = allElems[num]
        break
      }
    }
  }
  svgCanvas.selectOnly([elem], true)
  svgCanvas.call('selected', selectedElements)
}
