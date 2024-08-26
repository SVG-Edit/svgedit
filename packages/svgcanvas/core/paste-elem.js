import {
  getStrokedBBoxDefaultVisible
} from './utilities.js'
import * as hstry from './history.js'

const {
  InsertElementCommand, BatchCommand
} = hstry

let svgCanvas = null

/**
* @function module:paste-elem.init
* @param {module:paste-elem.pasteContext} pasteContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
}

/**
* @function module:svgcanvas.SvgCanvas#pasteElements
* @param {"in_place"|"point"|void} type
* @param {Integer|void} x Expected if type is "point"
* @param {Integer|void} y Expected if type is "point"
* @fires module:svgcanvas.SvgCanvas#event:changed
* @fires module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
* @returns {void}
*/
export const pasteElementsMethod = function (type, x, y) {
  let clipb = JSON.parse(sessionStorage.getItem(svgCanvas.getClipboardID()))
  if (!clipb) return
  let len = clipb.length
  if (!len) return

  const pasted = []
  const batchCmd = new BatchCommand('Paste elements')
  // const drawing = getCurrentDrawing();
  /**
* @typedef {PlainObject<string, string>} module:svgcanvas.ChangedIDs
*/
  /**
* @type {module:svgcanvas.ChangedIDs}
*/
  const changedIDs = {}

  // Recursively replace IDs and record the changes
  /**
*
* @param {module:svgcanvas.SVGAsJSON} elem
* @returns {void}
*/
  function checkIDs (elem) {
    if (elem.attr?.id) {
      changedIDs[elem.attr.id] = svgCanvas.getNextId()
      elem.attr.id = changedIDs[elem.attr.id]
    }
    if (elem.children) elem.children.forEach((child) => checkIDs(child))
  }
  clipb.forEach((elem) => checkIDs(elem))

  // Give extensions like the connector extension a chance to reflect new IDs and remove invalid elements
  /**
* Triggered when `pasteElements` is called from a paste action (context menu or key).
* @event module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
* @type {PlainObject}
* @property {module:svgcanvas.SVGAsJSON[]} elems
* @property {module:svgcanvas.ChangedIDs} changes Maps past ID (on attribute) to current ID
*/
  svgCanvas.runExtensions(
    'IDsUpdated',
    /** @type {module:svgcanvas.SvgCanvas#event:ext_IDsUpdated} */
    { elems: clipb, changes: changedIDs },
    true
  ).forEach(function (extChanges) {
    if (!extChanges || !('remove' in extChanges)) return

    extChanges.remove.forEach(function (removeID) {
      clipb = clipb.filter(function (clipBoardItem) {
        return clipBoardItem.attr.id !== removeID
      })
    })
  })

  // Move elements to lastClickPoint
  while (len--) {
    const elem = clipb[len]
    if (!elem) { continue }

    const copy = svgCanvas.addSVGElementsFromJson(elem)
    pasted.push(copy)
    batchCmd.addSubCommand(new InsertElementCommand(copy))

    svgCanvas.restoreRefElements(copy)
  }

  svgCanvas.selectOnly(pasted)

  if (type !== 'in_place') {
    let ctrX; let ctrY

    if (!type) {
      ctrX = svgCanvas.getLastClickPoint('x')
      ctrY = svgCanvas.getLastClickPoint('y')
    } else if (type === 'point') {
      ctrX = x
      ctrY = y
    }

    const bbox = getStrokedBBoxDefaultVisible(pasted)
    const cx = ctrX - (bbox.x + bbox.width / 2)
    const cy = ctrY - (bbox.y + bbox.height / 2)
    const dx = []
    const dy = []

    pasted.forEach(function (_item) {
      dx.push(cx)
      dy.push(cy)
    })

    const cmd = svgCanvas.moveSelectedElements(dx, dy, false)
    if (cmd) batchCmd.addSubCommand(cmd)
  }

  svgCanvas.addCommandToHistory(batchCmd)
  svgCanvas.call('changed', pasted)
}
