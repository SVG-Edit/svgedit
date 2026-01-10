/**
 * Tools for blur event.
 * @module blur
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

let svgCanvas = null

/**
* @function module:blur.init
* @param {module:blur.blurContext} blurContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
}

/**
 * @param {Element} filterElem
 * @returns {?Element}
 */
const getFeGaussianBlurElem = (filterElem) => {
  if (!filterElem || filterElem.nodeType !== 1) return null
  return filterElem.querySelector('feGaussianBlur') || filterElem.firstElementChild
}

/**
* Sets the `stdDeviation` blur value on the selected element without being undoable.
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {void}
*/
export const setBlurNoUndo = (val) => {
  const selectedElements = svgCanvas.getSelectedElements()
  const elem = selectedElements[0]
  if (!elem) return

  let filter = svgCanvas.getFilter()
  if (!filter) {
    filter = svgCanvas.getElement(`${elem.id}_blur`)
  }

  if (val === 0) {
    // Don't change the StdDev, as that will hide the element.
    // Instead, just remove the value for "filter"
    svgCanvas.changeSelectedAttributeNoUndo('filter', '')
    svgCanvas.setFilterHidden(true)
  } else {
    if (!filter) {
      // Create the filter if missing, but don't add history.
      const blurElem = svgCanvas.addSVGElementsFromJson({
        element: 'feGaussianBlur',
        attr: {
          in: 'SourceGraphic',
          stdDeviation: val
        }
      })
      filter = svgCanvas.addSVGElementsFromJson({
        element: 'filter',
        attr: {
          id: `${elem.id}_blur`
        }
      })
      filter.append(blurElem)
      svgCanvas.findDefs().append(filter)
    }

    if (svgCanvas.getFilterHidden() || !elem.getAttribute('filter')) {
      svgCanvas.changeSelectedAttributeNoUndo('filter', `url(#${filter.id})`)
      svgCanvas.setFilterHidden(false)
    }

    const blurElem = getFeGaussianBlurElem(filter)
    if (!blurElem) {
      return
    }
    svgCanvas.changeSelectedAttributeNoUndo('stdDeviation', val, [blurElem])
    svgCanvas.setBlurOffsets(filter, val)
  }
}

/**
* Finishes the blur change command and adds it to history if not empty.
* @returns {void}
*/
const finishChange = () => {
  const curCommand = svgCanvas.getCurCommand()
  if (!curCommand) {
    svgCanvas.setCurCommand(null)
    svgCanvas.setFilter(null)
    svgCanvas.setFilterHidden(false)
    return
  }
  const bCmd = svgCanvas.undoMgr.finishUndoableChange()
  if (!bCmd.isEmpty()) {
    curCommand.addSubCommand(bCmd)
  }
  if (!curCommand.isEmpty()) {
    svgCanvas.addCommandToHistory(curCommand)
  }
  svgCanvas.setCurCommand(null)
  svgCanvas.setFilter(null)
  svgCanvas.setFilterHidden(false)
}

/**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded.
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filterElem - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {void}
*/
export const setBlurOffsets = (filterElem, stdDev) => {
  if (!filterElem || filterElem.nodeType !== 1) {
    return
  }

  stdDev = Number(stdDev) || 0

  if (stdDev > 3) {
    // TODO: Create algorithm here where size is based on expected blur
    svgCanvas.assignAttributes(filterElem, {
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%'
    }, 100)
  } else {
    filterElem.removeAttribute('x')
    filterElem.removeAttribute('y')
    filterElem.removeAttribute('width')
    filterElem.removeAttribute('height')
  }
}

/**
* Adds/updates the blur filter to the selected element.
* @function module:svgcanvas.SvgCanvas#setBlur
* @param {Float} val - Float with the new `stdDeviation` blur value
* @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
* @returns {void}
*/
export const setBlur = (val, complete) => {
  const {
    InsertElementCommand, ChangeElementCommand, BatchCommand
  } = svgCanvas.history

  const selectedElements = svgCanvas.getSelectedElements()
  if (svgCanvas.getCurCommand()) {
    finishChange()
    return
  }

  // Looks for associated blur, creates one if not found
  const elem = selectedElements[0]
  if (!elem) {
    return
  }
  const elemId = elem.id
  let filter = svgCanvas.getElement(`${elemId}_blur`)
  svgCanvas.setFilter(filter)

  val = Number(val) || 0

  const batchCmd = new BatchCommand('Change blur')

  if (val === 0) {
    const oldFilter = elem.getAttribute('filter')
    if (!oldFilter) {
      return
    }
    const changes = { filter: oldFilter }
    elem.removeAttribute('filter')
    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes))
    svgCanvas.addCommandToHistory(batchCmd)
    svgCanvas.setFilter(null)
    svgCanvas.setFilterHidden(true)
    return
  }

  // Ensure blur filter exists.
  if (!filter) {
    const newblur = svgCanvas.addSVGElementsFromJson({
      element: 'feGaussianBlur',
      attr: {
        in: 'SourceGraphic',
        stdDeviation: val
      }
    })

    filter = svgCanvas.addSVGElementsFromJson({
      element: 'filter',
      attr: {
        id: `${elemId}_blur`
      }
    })
    filter.append(newblur)
    const defs = svgCanvas.findDefs()
    if (defs && defs.ownerDocument === filter.ownerDocument) {
      defs.append(filter)
    }
    svgCanvas.setFilter(filter)
    batchCmd.addSubCommand(new InsertElementCommand(filter))
  }

  const changes = { filter: elem.getAttribute('filter') }
  svgCanvas.changeSelectedAttributeNoUndo('filter', `url(#${filter.id})`)
  batchCmd.addSubCommand(new ChangeElementCommand(elem, changes))
  svgCanvas.setBlurOffsets(filter, val)
  svgCanvas.setCurCommand(batchCmd)

  const blurElem = getFeGaussianBlurElem(filter)
  svgCanvas.undoMgr.beginUndoableChange('stdDeviation', [blurElem])
  if (complete) {
    svgCanvas.setBlurNoUndo(val)
    finishChange()
  }
}
