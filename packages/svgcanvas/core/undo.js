/**
 * Tools for undo.
 * @module undo
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import * as draw from './draw.js'
import * as hstry from './history.js'
import {
  getRotationAngle, getBBox as utilsGetBBox, setHref, getStrokedBBoxDefaultVisible
} from './utilities.js'
import {
  isGecko
} from '../common/browser.js'
import {
  transformPoint, transformListToTransform
} from './math.js'

const {
  UndoManager, HistoryEventTypes
} = hstry

let svgCanvas = null

/**
* @function module:undo.init
* @param {module:undo.undoContext} undoContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
  canvas.undoMgr = getUndoManager()
}

export const getUndoManager = () => {
  return new UndoManager({
    /**
     * @param {string} eventType One of the HistoryEvent types
     * @param {module:history.HistoryCommand} cmd Fulfills the HistoryCommand interface
     * @fires module:undo.SvgCanvas#event:changed
     * @returns {void}
     */
    handleHistoryEvent (eventType, cmd) {
      const EventTypes = HistoryEventTypes
      // TODO: handle setBlurOffsets.
      if (eventType === EventTypes.BEFORE_UNAPPLY || eventType === EventTypes.BEFORE_APPLY) {
        svgCanvas.clearSelection()
      } else if (eventType === EventTypes.AFTER_APPLY || eventType === EventTypes.AFTER_UNAPPLY) {
        const elems = cmd.elements()
        svgCanvas.pathActions.clear()
        svgCanvas.call('changed', elems)
        const cmdType = cmd.type()
        const isApply = (eventType === EventTypes.AFTER_APPLY)
        if (cmdType === 'MoveElementCommand') {
          const parent = isApply ? cmd.newParent : cmd.oldParent
          if (parent === svgCanvas.getSvgContent()) {
            draw.identifyLayers()
          }
        } else if (cmdType === 'InsertElementCommand' || cmdType === 'RemoveElementCommand') {
          if (cmd.parent === svgCanvas.getSvgContent()) {
            draw.identifyLayers()
          }
          if (cmdType === 'InsertElementCommand') {
            if (isApply) {
              svgCanvas.restoreRefElements(cmd.elem)
            }
          } else if (!isApply) {
            svgCanvas.restoreRefElements(cmd.elem)
          }
          if (cmd.elem?.tagName === 'use') {
            svgCanvas.setUseData(cmd.elem)
          }
        } else if (cmdType === 'ChangeElementCommand') {
          // if we are changing layer names, re-identify all layers
          if (cmd.elem.tagName === 'title' &&
            cmd.elem.parentNode.parentNode === svgCanvas.getSvgContent()
          ) {
            draw.identifyLayers()
          }
          const values = isApply ? cmd.newValues : cmd.oldValues
          // If stdDeviation was changed, update the blur.
          if (values.stdDeviation) {
            svgCanvas.setBlurOffsets(cmd.elem.parentNode, values.stdDeviation)
          }
          if (cmd.elem.tagName === 'text') {
            const [dx, dy] = [cmd.newValues.x - cmd.oldValues.x,
              cmd.newValues.y - cmd.oldValues.y]

            const tspans = cmd.elem.children

            for (let i = 0; i < tspans.length; i++) {
              let x = Number(tspans[i].getAttribute('x'))
              let y = Number(tspans[i].getAttribute('y'))

              const unapply = (eventType === EventTypes.AFTER_UNAPPLY)
              x = unapply ? x - dx : x + dx
              y = unapply ? y - dy : y + dy

              tspans[i].setAttribute('x', x)
              tspans[i].setAttribute('y', y)
            }
          }
        }
      }
    }
  })
}

/**
* Hack for Firefox bugs where text element features aren't updated or get
* messed up. See issue 136 and issue 137.
* This function clones the element and re-selects it.
* @function module:svgcanvas~ffClone
* @todo Test for this bug on load and add it to "support" object instead of
* browser sniffing
* @param {Element} elem - The (text) DOM element to clone
* @returns {Element} Cloned element
*/
export const ffClone = function (elem) {
  if (!isGecko()) { return elem }
  const clone = elem.cloneNode(true)
  elem.before(clone)
  elem.remove()
  svgCanvas.selectorManager.releaseSelector(elem)
  svgCanvas.setSelectedElements(0, clone)
  svgCanvas.selectorManager.requestSelector(clone).showGrips(true)
  return clone
}

/**
* This function makes the changes to the elements. It does not add the change
* to the history stack.
* @param {string} attr - Attribute name
* @param {string|Float} newValue - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
export const changeSelectedAttributeNoUndoMethod = (attr, newValue, elems) => {
  if (attr === 'id') {
    // if the user is changing the id, then de-select the element first
    // change the ID, then re-select it with the new ID
    // as this change can impact other extensions, a 'renamedElement' event is thrown
    const elem = elems[0]
    const oldId = elem.id
    if (oldId !== newValue) {
      svgCanvas.clearSelection()
      elem.id = newValue
      svgCanvas.addToSelection([elem], true)
      svgCanvas.call('elementRenamed', { elem, oldId, newId: newValue })
    }
    return
  }
  const selectedElements = svgCanvas.getSelectedElements()
  const zoom = svgCanvas.getZoom()
  if (svgCanvas.getCurrentMode() === 'pathedit') {
    // Editing node
    svgCanvas.pathActions.moveNode(attr, newValue)
  }
  elems = elems ?? selectedElements
  let i = elems.length
  const noXYElems = ['g', 'polyline', 'path']

  while (i--) {
    let elem = elems[i]
    if (!elem) { continue }

    // Set x,y vals on elements that don't have them
    if ((attr === 'x' || attr === 'y') && noXYElems.includes(elem.tagName)) {
      const bbox = getStrokedBBoxDefaultVisible([elem])
      const diffX = attr === 'x' ? newValue - bbox.x : 0
      const diffY = attr === 'y' ? newValue - bbox.y : 0
      svgCanvas.moveSelectedElements(diffX * zoom, diffY * zoom, true)
      continue
    }

    let oldval = attr === '#text' ? elem.textContent : elem.getAttribute(attr)
    if (!oldval) { oldval = '' }
    if (oldval !== String(newValue)) {
      if (attr === '#text') {
        // const oldW = utilsGetBBox(elem).width;
        elem.textContent = newValue

        // FF bug occurs on on rotated elements
        if ((/rotate/).test(elem.getAttribute('transform'))) {
          elem = ffClone(elem)
        }
        // Hoped to solve the issue of moving text with text-anchor="start",
        // but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
      } else if (attr === '#href') {
        setHref(elem, newValue)
      } else if (newValue) {
        elem.setAttribute(attr, newValue)
      } else if (typeof newValue === 'number') {
        elem.setAttribute(attr, newValue)
      } else {
        elem.removeAttribute(attr)
      }

      // Go into "select" mode for text changes
      // NOTE: Important that this happens AFTER elem.setAttribute() or else attributes like
      // font-size can get reset to their old value, ultimately by svgEditor.updateContextPanel(),
      // after calling textActions.toSelectMode() below
      if (svgCanvas.getCurrentMode() === 'textedit' && attr !== '#text' && elem.textContent.length) {
        svgCanvas.textActions.toSelectMode(elem)
      }

      // Use the Firefox ffClone hack for text elements with gradients or
      // where other text attributes are changed.
      if (isGecko() &&
        elem.nodeName === 'text' &&
        (/rotate/).test(elem.getAttribute('transform')) &&
        (String(newValue).startsWith('url') || (['font-size', 'font-family', 'x', 'y'].includes(attr) && elem.textContent))) {
        elem = ffClone(elem)
      }
      // Timeout needed for Opera & Firefox
      // codedread: it is now possible for this function to be called with elements
      // that are not in the selectedElements array, we need to only request a
      // selector if the element is in that array
      if (selectedElements.includes(elem)) {
        setTimeout(function () {
          // Due to element replacement, this element may no longer
          // be part of the DOM
          if (!elem.parentNode) { return }
          svgCanvas.selectorManager.requestSelector(elem).resize()
        }, 0)
      }
      // if this element was rotated, and we changed the position of this element
      // we need to update the rotational transform attribute
      const angle = getRotationAngle(elem)
      if (angle !== 0 && attr !== 'transform') {
        const tlist = elem.transform?.baseVal
        let n = tlist.numberOfItems
        while (n--) {
          const xform = tlist.getItem(n)
          if (xform.type === 4) {
            // remove old rotate
            tlist.removeItem(n)

            const box = utilsGetBBox(elem)
            const center = transformPoint(
              box.x + box.width / 2, box.y + box.height / 2, transformListToTransform(tlist).matrix
            )
            const cx = center.x
            const cy = center.y
            const newrot = svgCanvas.getSvgRoot().createSVGTransform()
            newrot.setRotate(angle, cx, cy)
            tlist.insertItemBefore(newrot, n)
            break
          }
        }
      }
    } // if oldValue != newValue
  } // for each elem
}

/**
* Change the given/selected element and add the original value to the history stack.
* If you want to change all `selectedElements`, ignore the `elems` argument.
* If you want to change only a subset of `selectedElements`, then send the
* subset to this function in the `elems` argument.
* @function module:svgcanvas.SvgCanvas#changeSelectedAttribute
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
export const changeSelectedAttributeMethod = function (attr, val, elems) {
  const selectedElements = svgCanvas.getSelectedElements()
  elems = elems || selectedElements
  svgCanvas.undoMgr.beginUndoableChange(attr, elems)

  changeSelectedAttributeNoUndoMethod(attr, val, elems)

  const batchCmd = svgCanvas.undoMgr.finishUndoableChange()
  if (!batchCmd.isEmpty()) {
    // svgCanvas.addCommandToHistory(batchCmd);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd)
  }
}
