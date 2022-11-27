/**
 * Tools for selection.
 * @module selection
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import { NS } from './namespaces.js'
import {
  getBBox,
  getStrokedBBoxDefaultVisible
} from './utilities.js'
import {
  transformPoint,
  transformListToTransform,
  rectsIntersect
} from './math.js'
import * as hstry from './history.js'
import { getClosest } from '../common/util.js'

const { BatchCommand } = hstry
let svgCanvas = null

/**
 * @function module:selection.init
 * @param {module:selection.selectionContext} selectionContext
 * @returns {void}
 */
export const init = (canvas) => {
  svgCanvas = canvas
  svgCanvas.getMouseTarget = getMouseTargetMethod
  svgCanvas.clearSelection = clearSelectionMethod
  svgCanvas.addToSelection = addToSelectionMethod
  svgCanvas.getIntersectionList = getIntersectionListMethod
  svgCanvas.runExtensions = runExtensionsMethod
  svgCanvas.groupSvgElem = groupSvgElem
  svgCanvas.prepareSvg = prepareSvg
  svgCanvas.recalculateAllSelectedDimensions = recalculateAllSelectedDimensions
  svgCanvas.setRotationAngle = setRotationAngle
}

/**
 * Clears the selection. The 'selected' handler is then optionally called.
 * This should really be an intersection applying to all types rather than a union.
 * @name module:selection.SvgCanvas#clearSelection
 * @type {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
 * @fires module:selection.SvgCanvas#event:selected
 */
const clearSelectionMethod = (noCall) => {
  const selectedElements = svgCanvas.getSelectedElements()
  selectedElements.forEach((elem) => {
    if (!elem) {
      return
    }

    svgCanvas.selectorManager.releaseSelector(elem)
  })
  svgCanvas?.setEmptySelectedElements()

  if (!noCall) {
    svgCanvas.call('selected', svgCanvas.getSelectedElements())
  }
}

/**
 * Adds a list of elements to the selection. The 'selected' handler is then called.
 * @name module:selection.SvgCanvas#addToSelection
 * @type {module:path.EditorContext#addToSelection}
 * @fires module:selection.SvgCanvas#event:selected
 */
const addToSelectionMethod = (elemsToAdd, showGrips) => {
  const selectedElements = svgCanvas.getSelectedElements()
  if (!elemsToAdd.length) {
    return
  }
  // find the first null in our selectedElements array

  let firstNull = 0
  while (firstNull < selectedElements.length) {
    if (selectedElements[firstNull] === null) {
      break
    }
    ++firstNull
  }

  // now add each element consecutively
  let i = elemsToAdd.length
  while (i--) {
    let elem = elemsToAdd[i]
    if (!elem || !elem.getBBox) {
      continue
    }

    if (elem.tagName === 'a' && elem.childNodes.length === 1) {
      // Make "a" element's child be the selected element
      elem = elem.firstChild
    }

    // if it's not already there, add it
    if (!selectedElements.includes(elem)) {
      selectedElements[firstNull] = elem

      // only the first selectedBBoxes element is ever used in the codebase these days
      // if (j === 0) selectedBBoxes[0] = utilsGetBBox(elem);
      firstNull++
      const sel = svgCanvas.selectorManager.requestSelector(elem)

      if (selectedElements.length > 1) {
        sel.showGrips(false)
      }
    }
  }
  if (!selectedElements.length) {
    return
  }
  svgCanvas.call('selected', selectedElements)

  if (selectedElements.length === 1) {
    svgCanvas.selectorManager
      .requestSelector(selectedElements[0])
      .showGrips(showGrips)
  }

  // make sure the elements are in the correct order
  // See: https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

  selectedElements.sort((a, b) => {
    if (a && b && a.compareDocumentPosition) {
      return 3 - (b.compareDocumentPosition(a) & 6)
    }
    if (!a) {
      return 1
    }
    return 0
  })

  // Make sure first elements are not null
  while (!selectedElements[0]) {
    selectedElements.shift(0)
  }
}
/**
 * @name module:svgcanvas.SvgCanvas#getMouseTarget
 * @type {module:path.EditorContext#getMouseTarget}
 */
const getMouseTargetMethod = (evt) => {
  if (!evt) {
    return null
  }
  let mouseTarget = evt.target

  // if it was a <use>, Opera and WebKit return the SVGElementInstance
  if (mouseTarget.correspondingUseElement) {
    mouseTarget = mouseTarget.correspondingUseElement
  }

  // for foreign content, go up until we find the foreignObject
  // WebKit browsers set the mouse target to the svgcanvas div
  if (
    [NS.MATH, NS.HTML].includes(mouseTarget.namespaceURI) &&
    mouseTarget.id !== 'svgcanvas'
  ) {
    while (mouseTarget.nodeName !== 'foreignObject') {
      mouseTarget = mouseTarget.parentNode
      if (!mouseTarget) {
        return svgCanvas.getSvgRoot()
      }
    }
  }

  // Get the desired mouseTarget with jQuery selector-fu
  // If it's root-like, select the root
  const currentLayer = svgCanvas.getCurrentDrawing().getCurrentLayer()
  const svgRoot = svgCanvas.getSvgRoot()
  const container = svgCanvas.getDOMContainer()
  const content = svgCanvas.getSvgContent()
  if ([svgRoot, container, content, currentLayer].includes(mouseTarget)) {
    return svgCanvas.getSvgRoot()
  }

  // If it's a selection grip, return the grip parent
  if (getClosest(mouseTarget.parentNode, '#selectorParentGroup')) {
    // While we could instead have just returned mouseTarget,
    // this makes it easier to indentify as being a selector grip
    return svgCanvas.selectorManager.selectorParentGroup
  }

  while (
    !mouseTarget?.parentNode?.isSameNode(
      svgCanvas.getCurrentGroup() || currentLayer
    )
  ) {
    mouseTarget = mouseTarget.parentNode
  }

  return mouseTarget
}
/**
 * @typedef {module:svgcanvas.ExtensionMouseDownStatus|module:svgcanvas.ExtensionMouseUpStatus|module:svgcanvas.ExtensionIDsUpdatedStatus|module:locale.ExtensionLocaleData[]|void} module:svgcanvas.ExtensionStatus
 * @tutorial ExtensionDocs
 */
/**
 * @callback module:svgcanvas.ExtensionVarBuilder
 * @param {string} name The name of the extension
 * @returns {module:svgcanvas.SvgCanvas#event:ext_addLangData}
 */
/**
 * @callback module:svgcanvas.ExtensionNameFilter
 * @param {string} name
 * @returns {boolean}
 */
/* eslint-disable max-len */
/**
 * @todo Consider: Should this return an array by default, so extension results aren't overwritten?
 * @todo Would be easier to document if passing in object with key of action and vars as value; could then define an interface which tied both together
 * @function module:svgcanvas.SvgCanvas#runExtensions
 * @param {"mouseDown"|"mouseMove"|"mouseUp"|"zoomChanged"|"IDsUpdated"|"canvasUpdated"|"toolButtonStateUpdate"|"selectedChanged"|"elementTransition"|"elementChanged"|"langReady"|"langChanged"|"addLangData"|"workareaResized"} action
 * @param {module:svgcanvas.SvgCanvas#event:ext_mouseDown|module:svgcanvas.SvgCanvas#event:ext_mouseMove|module:svgcanvas.SvgCanvas#event:ext_mouseUp|module:svgcanvas.SvgCanvas#event:ext_zoomChanged|module:svgcanvas.SvgCanvas#event:ext_IDsUpdated|module:svgcanvas.SvgCanvas#event:ext_canvasUpdated|module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate|module:svgcanvas.SvgCanvas#event:ext_selectedChanged|module:svgcanvas.SvgCanvas#event:ext_elementTransition|module:svgcanvas.SvgCanvas#event:ext_elementChanged|module:svgcanvas.SvgCanvas#event:ext_langReady|module:svgcanvas.SvgCanvas#event:ext_langChanged|module:svgcanvas.SvgCanvas#event:ext_addLangData|module:svgcanvas.SvgCanvas#event:ext_workareaResized|module:svgcanvas.ExtensionVarBuilder} [vars]
 * @param {boolean} [returnArray]
 * @returns {GenericArray<module:svgcanvas.ExtensionStatus>|module:svgcanvas.ExtensionStatus|false} See {@tutorial ExtensionDocs} on the ExtensionStatus.
 */
/* eslint-enable max-len */
const runExtensionsMethod = (
  action,
  vars,
  returnArray
) => {
  let result = returnArray ? [] : false
  for (const [name, ext] of Object.entries(svgCanvas.getExtensions())) {
    if (typeof vars === 'function') {
      vars = vars(name) // ext, action
    }
    if (ext.eventBased) {
      const event = new CustomEvent('svgedit', {
        detail: {
          action,
          vars
        }
      })
      document.dispatchEvent(event)
    } else if (ext[action]) {
      if (returnArray) {
        result.push(ext[action](vars))
      } else {
        result = ext[action](vars)
      }
    }
  }
  return result
}

/**
 * Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
 * Note that 0-opacity, off-screen etc elements are still considered "visible"
 * for this function.
 * @function module:svgcanvas.SvgCanvas#getVisibleElementsAndBBoxes
 * @param {Element} parent - The parent DOM element to search within
 * @returns {ElementAndBBox[]} An array with objects that include:
 */
const getVisibleElementsAndBBoxes = (parent) => {
  if (!parent) {
    const svgContent = svgCanvas.getSvgContent()
    parent = svgContent.children // Prevent layers from being included
  }
  const contentElems = []
  const elements = parent.children
  Array.from(elements).forEach((elem) => {
    if (elem.getBBox) {
      contentElems.push({ elem, bbox: getStrokedBBoxDefaultVisible([elem]) })
    }
  })
  return contentElems.reverse()
}

/**
 * This method sends back an array or a NodeList full of elements that
 * intersect the multi-select rubber-band-box on the currentLayer only.
 *
 * We brute-force `getIntersectionList` for browsers that do not support it (Firefox).
 *
 * Reference:
 * Firefox does not implement `getIntersectionList()`, see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=501421}.
 * @function module:svgcanvas.SvgCanvas#getIntersectionList
 * @param {SVGRect} rect
 * @returns {Element[]|NodeList} Bbox elements
 */
const getIntersectionListMethod = (rect) => {
  const zoom = svgCanvas.getZoom()
  if (!svgCanvas.getRubberBox()) {
    return null
  }

  const parent =
    svgCanvas.getCurrentGroup() ||
    svgCanvas.getCurrentDrawing().getCurrentLayer()

  let rubberBBox
  if (!rect) {
    rubberBBox = getBBox(svgCanvas.getRubberBox())
    const bb = svgCanvas.getSvgContent().createSVGRect();

    ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'].forEach(
      (o) => {
        bb[o] = rubberBBox[o] / zoom
      }
    )
    rubberBBox = bb
  } else {
    rubberBBox = svgCanvas.getSvgContent().createSVGRect()
    rubberBBox.x = rect.x
    rubberBBox.y = rect.y
    rubberBBox.width = rect.width
    rubberBBox.height = rect.height
  }

  const resultList = []
  if (svgCanvas.getCurBBoxes().length === 0) {
    // Cache all bboxes
    svgCanvas.setCurBBoxes(getVisibleElementsAndBBoxes(parent))
  }
  let i = svgCanvas.getCurBBoxes().length
  while (i--) {
    const curBBoxes = svgCanvas.getCurBBoxes()
    if (!rubberBBox.width) {
      continue
    }
    if (curBBoxes[i].bbox && rectsIntersect(rubberBBox, curBBoxes[i].bbox)) {
      resultList.push(curBBoxes[i].elem)
    }
  }

  // addToSelection expects an array, but it's ok to pass a NodeList
  // because using square-bracket notation is allowed:
  // https://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
  return resultList
}

/**
 * @typedef {PlainObject} ElementAndBBox
 * @property {Element} elem - The element
 * @property {module:utilities.BBoxObject} bbox - The element's BBox as retrieved from `getStrokedBBoxDefaultVisible`
 */

/**
 * Wrap an SVG element into a group element, mark the group as 'gsvg'.
 * @function module:svgcanvas.SvgCanvas#groupSvgElem
 * @param {Element} elem - SVG element to wrap
 * @returns {void}
 */
const groupSvgElem = (elem) => {
  const dataStorage = svgCanvas.getDataStorage()
  const g = document.createElementNS(NS.SVG, 'g')
  elem.replaceWith(g)
  g.appendChild(elem)
  dataStorage.put(g, 'gsvg', elem)
  g.id = svgCanvas.getNextId()
}

/**
 * Runs the SVG Document through the sanitizer and then updates its paths.
 * @function module:svgcanvas.SvgCanvas#prepareSvg
 * @param {XMLDocument} newDoc - The SVG DOM document
 * @returns {void}
 */
const prepareSvg = (newDoc) => {
  svgCanvas.sanitizeSvg(newDoc.documentElement)

  // convert paths into absolute commands
  const paths = [...newDoc.getElementsByTagNameNS(NS.SVG, 'path')]
  paths.forEach((path) => {
    const convertedPath = svgCanvas.pathActions.convertPath(path)
    path.setAttribute('d', convertedPath)
    svgCanvas.pathActions.fixEnd(path)
  })
}

/**
 * Removes any old rotations if present, prepends a new rotation at the
 * transformed center.
 * @function module:svgcanvas.SvgCanvas#setRotationAngle
 * @param {string|Float} val - The new rotation angle in degrees
 * @param {boolean} preventUndo - Indicates whether the action should be undoable or not
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @returns {void}
 */
const setRotationAngle = (val, preventUndo) => {
  const selectedElements = svgCanvas.getSelectedElements()
  // ensure val is the proper type
  val = Number.parseFloat(val)
  const elem = selectedElements[0]
  const oldTransform = elem.getAttribute('transform')
  const bbox = getBBox(elem)
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  const tlist = elem.transform.baseVal

  // only remove the real rotational transform if present (i.e. at index=0)
  if (tlist.numberOfItems > 0) {
    const xform = tlist.getItem(0)
    if (xform.type === 4) {
      tlist.removeItem(0)
    }
  }
  // find Rnc and insert it
  if (val !== 0) {
    const center = transformPoint(
      cx,
      cy,
      transformListToTransform(tlist).matrix
    )
    const Rnc = svgCanvas.getSvgRoot().createSVGTransform()
    Rnc.setRotate(val, center.x, center.y)
    if (tlist.numberOfItems) {
      tlist.insertItemBefore(Rnc, 0)
    } else {
      tlist.appendItem(Rnc)
    }
  } else if (tlist.numberOfItems === 0) {
    elem.removeAttribute('transform')
  }

  if (!preventUndo) {
    // we need to undo it, then redo it so it can be undo-able! :)
    // TODO: figure out how to make changes to transform list undo-able cross-browser?
    let newTransform = elem.getAttribute('transform')
    // new transform is something like: 'rotate(5 1.39625e-8 -11)'
    // we round the x so it becomes 'rotate(5 0 -11)'
    if (newTransform) {
      const newTransformArray = newTransform.split(' ')
      const round = (num) => Math.round(Number(num) + Number.EPSILON)
      const x = round(newTransformArray[1])
      newTransform = `${newTransformArray[0]} ${x} ${newTransformArray[2]}`
    }

    if (oldTransform) {
      elem.setAttribute('transform', oldTransform)
    } else {
      elem.removeAttribute('transform')
    }
    svgCanvas.changeSelectedAttribute(
      'transform',
      newTransform,
      selectedElements
    )
    svgCanvas.call('changed', selectedElements)
  }
  // const pointGripContainer = getElement('pathpointgrip_container');
  // if (elem.nodeName === 'path' && pointGripContainer) {
  //   pathActions.setPointContainerTransform(elem.getAttribute('transform'));
  // }
  const selector = svgCanvas.selectorManager.requestSelector(
    selectedElements[0]
  )
  selector.resize()
  svgCanvas.getSelector().updateGripCursors(val)
}

/**
 * Runs `recalculateDimensions` on the selected elements,
 * adding the changes to a single batch command.
 * @function module:svgcanvas.SvgCanvas#recalculateAllSelectedDimensions
 * @fires module:svgcanvas.SvgCanvas#event:changed
 * @returns {void}
 */
const recalculateAllSelectedDimensions = () => {
  const text =
    svgCanvas.getCurrentResizeMode() === 'none' ? 'position' : 'size'
  const batchCmd = new BatchCommand(text)
  const selectedElements = svgCanvas.getSelectedElements()

  selectedElements.forEach((elem) => {
    const cmd = svgCanvas.recalculateDimensions(elem)
    if (cmd) {
      batchCmd.addSubCommand(cmd)
    }
  })

  if (!batchCmd.isEmpty()) {
    svgCanvas.addCommandToHistory(batchCmd)
    svgCanvas.call('changed', selectedElements)
  }
}
