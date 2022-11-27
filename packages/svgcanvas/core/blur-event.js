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
* Sets the `stdDeviation` blur value on the selected element without being undoable.
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {void}
*/
export const setBlurNoUndo = function (val) {
  const selectedElements = svgCanvas.getSelectedElements()
  if (!svgCanvas.getFilter()) {
    svgCanvas.setBlur(val)
    return
  }
  if (val === 0) {
    // Don't change the StdDev, as that will hide the element.
    // Instead, just remove the value for "filter"
    svgCanvas.changeSelectedAttributeNoUndo('filter', '')
    svgCanvas.setFilterHidden(true)
  } else {
    const elem = selectedElements[0]
    if (svgCanvas.getFilterHidden()) {
      svgCanvas.changeSelectedAttributeNoUndo('filter', 'url(#' + elem.id + '_blur)')
    }
    const filter = svgCanvas.getFilter()
    svgCanvas.changeSelectedAttributeNoUndo('stdDeviation', val, [filter.firstChild])
    svgCanvas.setBlurOffsets(filter, val)
  }
}

/**
*
* @returns {void}
*/
function finishChange () {
  const bCmd = svgCanvas.undoMgr.finishUndoableChange()
  svgCanvas.getCurCommand().addSubCommand(bCmd)
  svgCanvas.addCommandToHistory(svgCanvas.getCurCommand())
  svgCanvas.setCurCommand(null)
  svgCanvas.setFilter(null)
}

/**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded.
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filterElem - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {void}
*/
export const setBlurOffsets = function (filterElem, stdDev) {
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
export const setBlur = function (val, complete) {
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
  const elemId = elem.id
  svgCanvas.setFilter(svgCanvas.getElement(elemId + '_blur'))

  val -= 0

  const batchCmd = new BatchCommand()

  // Blur found!
  if (svgCanvas.getFilter()) {
    if (val === 0) {
      svgCanvas.setFilter(null)
    }
  } else {
    // Not found, so create
    const newblur = svgCanvas.addSVGElementsFromJson({
      element: 'feGaussianBlur',
      attr: {
        in: 'SourceGraphic',
        stdDeviation: val
      }
    })

    svgCanvas.setFilter(svgCanvas.addSVGElementsFromJson({
      element: 'filter',
      attr: {
        id: elemId + '_blur'
      }
    }))
    svgCanvas.getFilter().append(newblur)
    svgCanvas.findDefs().append(svgCanvas.getFilter())

    batchCmd.addSubCommand(new InsertElementCommand(svgCanvas.getFilter()))
  }

  const changes = { filter: elem.getAttribute('filter') }

  if (val === 0) {
    elem.removeAttribute('filter')
    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes))
    return
  }

  svgCanvas.changeSelectedAttribute('filter', 'url(#' + elemId + '_blur)')
  batchCmd.addSubCommand(new ChangeElementCommand(elem, changes))
  svgCanvas.setBlurOffsets(svgCanvas.getFilter(), val)
  const filter = svgCanvas.getFilter()
  svgCanvas.setCurCommand(batchCmd)
  svgCanvas.undoMgr.beginUndoableChange('stdDeviation', [filter ? filter.firstChild : null])
  if (complete) {
    svgCanvas.setBlurNoUndo(val)
    finishChange()
  }
}
