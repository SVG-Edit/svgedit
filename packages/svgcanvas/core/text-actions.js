/**
 * @module text-actions Tools for Text edit functions
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { NS } from './namespaces.js'
import { transformPoint, getMatrix } from './math.js'
import {
  assignAttributes,
  getElement,
  getBBox as utilsGetBBox
} from './utilities.js'
import { supportsGoodTextCharPos } from '../common/browser.js'

let svgCanvas = null

/**
 * @function module:text-actions.init
 * @param {module:text-actions.svgCanvas} textActionsContext
 * @returns {void}
 */
export const init = canvas => {
  svgCanvas = canvas
}

/**
 * Group: Text edit functions
 * Functions relating to editing text elements.
 * @class TextActions
 * @memberof module:svgcanvas.SvgCanvas#
 */
class TextActions {
  #curtext = null
  #textinput = null
  #cursor = null
  #selblock = null
  #blinker = null
  #chardata = []
  #textbb = null // , transbb;
  #matrix = null
  #lastX = null
  #lastY = null
  #allowDbl = false

  /**
   *
   * @param {Integer} index
   * @returns {void}
   * @private
   */
  #setCursor = (index = undefined) => {
    const empty = this.#textinput.value === ''
    this.#textinput.focus()

    if (index === undefined) {
      if (empty) {
        index = 0
      } else {
        if (this.#textinput.selectionEnd !== this.#textinput.selectionStart) {
          return
        }
        index = this.#textinput.selectionEnd
      }
    }

    const charbb = this.#chardata[index]
    if (!empty) {
      this.#textinput.setSelectionRange(index, index)
    }
    this.#cursor = getElement('text_cursor')
    if (!this.#cursor) {
      this.#cursor = document.createElementNS(NS.SVG, 'line')
      assignAttributes(this.#cursor, {
        id: 'text_cursor',
        stroke: '#333',
        'stroke-width': 1
      })
      getElement('selectorParentGroup').append(this.#cursor)
    }

    if (!this.#blinker) {
      this.#blinker = setInterval(() => {
        const show = this.#cursor.getAttribute('display') === 'none'
        this.#cursor.setAttribute('display', show ? 'inline' : 'none')
      }, 600)
    }

    const startPt = this.#ptToScreen(charbb.x, this.#textbb.y)
    const endPt = this.#ptToScreen(charbb.x, this.#textbb.y + this.#textbb.height)

    assignAttributes(this.#cursor, {
      x1: startPt.x,
      y1: startPt.y,
      x2: endPt.x,
      y2: endPt.y,
      visibility: 'visible',
      display: 'inline'
    })

    if (this.#selblock) {
      this.#selblock.setAttribute('d', '')
    }
  }

  /**
   *
   * @param {Integer} start
   * @param {Integer} end
   * @param {boolean} skipInput
   * @returns {void}
   * @private
   */
  #setSelection = (start, end, skipInput) => {
    if (start === end) {
      this.#setCursor(end)
      return
    }

    if (!skipInput) {
      this.#textinput.setSelectionRange(start, end)
    }

    this.#selblock = getElement('text_selectblock')
    if (!this.#selblock) {
      this.#selblock = document.createElementNS(NS.SVG, 'path')
      assignAttributes(this.#selblock, {
        id: 'text_selectblock',
        fill: 'green',
        opacity: 0.5,
        style: 'pointer-events:none'
      })
      getElement('selectorParentGroup').append(this.#selblock)
    }

    const startbb = this.#chardata[start]
    const endbb = this.#chardata[end]

    this.#cursor.setAttribute('visibility', 'hidden')

    const tl = this.#ptToScreen(startbb.x, this.#textbb.y)
    const tr = this.#ptToScreen(startbb.x + (endbb.x - startbb.x), this.#textbb.y)
    const bl = this.#ptToScreen(startbb.x, this.#textbb.y + this.#textbb.height)
    const br = this.#ptToScreen(
      startbb.x + (endbb.x - startbb.x),
      this.#textbb.y + this.#textbb.height
    )

    const dstr =
      'M' +
      tl.x +
      ',' +
      tl.y +
      ' L' +
      tr.x +
      ',' +
      tr.y +
      ' ' +
      br.x +
      ',' +
      br.y +
      ' ' +
      bl.x +
      ',' +
      bl.y +
      'z'

    assignAttributes(this.#selblock, {
      d: dstr,
      display: 'inline'
    })
  }

  /**
   *
   * @param {Float} mouseX
   * @param {Float} mouseY
   * @returns {Integer}
   * @private
   */
  #getIndexFromPoint = (mouseX, mouseY) => {
    // Position cursor here
    const pt = svgCanvas.getSvgRoot().createSVGPoint()
    pt.x = mouseX
    pt.y = mouseY

    // No content, so return 0
    if (this.#chardata.length === 1) {
      return 0
    }
    // Determine if cursor should be on left or right of character
    let charpos = this.#curtext.getCharNumAtPosition(pt)
    if (charpos < 0) {
      // Out of text range, look at mouse coords
      charpos = this.#chardata.length - 2
      if (mouseX <= this.#chardata[0].x) {
        charpos = 0
      }
    } else if (charpos >= this.#chardata.length - 2) {
      charpos = this.#chardata.length - 2
    }
    const charbb = this.#chardata[charpos]
    const mid = charbb.x + charbb.width / 2
    if (mouseX > mid) {
      charpos++
    }
    return charpos
  }

  /**
   *
   * @param {Float} mouseX
   * @param {Float} mouseY
   * @returns {void}
   * @private
   */
  #setCursorFromPoint = (mouseX, mouseY) => {
    this.#setCursor(this.#getIndexFromPoint(mouseX, mouseY))
  }

  /**
   *
   * @param {Float} x
   * @param {Float} y
   * @param {boolean} apply
   * @returns {void}
   * @private
   */
  #setEndSelectionFromPoint = (x, y, apply) => {
    const i1 = this.#textinput.selectionStart
    const i2 = this.#getIndexFromPoint(x, y)

    const start = Math.min(i1, i2)
    const end = Math.max(i1, i2)
    this.#setSelection(start, end, !apply)
  }

  /**
   *
   * @param {Float} xIn
   * @param {Float} yIn
   * @returns {module:math.XYObject}
   * @private
   */
  #screenToPt = (xIn, yIn) => {
    const out = {
      x: xIn,
      y: yIn
    }
    const zoom = svgCanvas.getZoom()
    out.x /= zoom
    out.y /= zoom

    if (this.#matrix) {
      const pt = transformPoint(out.x, out.y, this.#matrix.inverse())
      out.x = pt.x
      out.y = pt.y
    }

    return out
  }

  /**
   *
   * @param {Float} xIn
   * @param {Float} yIn
   * @returns {module:math.XYObject}
   * @private
   */
  #ptToScreen = (xIn, yIn) => {
    const out = {
      x: xIn,
      y: yIn
    }

    if (this.#matrix) {
      const pt = transformPoint(out.x, out.y, this.#matrix)
      out.x = pt.x
      out.y = pt.y
    }
    const zoom = svgCanvas.getZoom()
    out.x *= zoom
    out.y *= zoom

    return out
  }

  /**
   *
   * @param {Event} evt
   * @returns {void}
   * @private
   */
  #selectAll = (evt) => {
    this.#setSelection(0, this.#curtext.textContent.length)
    evt.target.removeEventListener('click', this.#selectAll)
  }

  /**
   *
   * @param {Event} evt
   * @returns {void}
   * @private
   */
  #selectWord = (evt) => {
    if (!this.#allowDbl || !this.#curtext) {
      return
    }
    const zoom = svgCanvas.getZoom()
    const ept = transformPoint(evt.pageX, evt.pageY, svgCanvas.getrootSctm())
    const mouseX = ept.x * zoom
    const mouseY = ept.y * zoom
    const pt = this.#screenToPt(mouseX, mouseY)

    const index = this.#getIndexFromPoint(pt.x, pt.y)
    const str = this.#curtext.textContent
    const first = str.slice(0, index).replace(/[a-z\d]+$/i, '').length
    const m = str.slice(index).match(/^[a-z\d]+/i)
    const last = (m ? m[0].length : 0) + index
    this.#setSelection(first, last)

    // Set tripleclick
    svgCanvas.$click(evt.target, this.#selectAll)

    setTimeout(() => {
      evt.target.removeEventListener('click', this.#selectAll)
    }, 300)
  }

  /**
   * @param {Element} target
   * @param {Float} x
   * @param {Float} y
   * @returns {void}
   */
  select (target, x, y) {
    this.#curtext = target
    svgCanvas.textActions.toEditMode(x, y)
  }

  /**
   * @param {Element} elem
   * @returns {void}
   */
  start (elem) {
    this.#curtext = elem
    svgCanvas.textActions.toEditMode()
  }

  /**
   * @param {external:MouseEvent} evt
   * @param {Element} mouseTarget
   * @param {Float} startX
   * @param {Float} startY
   * @returns {void}
   */
  mouseDown (evt, mouseTarget, startX, startY) {
    const pt = this.#screenToPt(startX, startY)

    this.#textinput.focus()
    this.#setCursorFromPoint(pt.x, pt.y)
    this.#lastX = startX
    this.#lastY = startY

    // TODO: Find way to block native selection
  }

  /**
   * @param {Float} mouseX
   * @param {Float} mouseY
   * @returns {void}
   */
  mouseMove (mouseX, mouseY) {
    const pt = this.#screenToPt(mouseX, mouseY)
    this.#setEndSelectionFromPoint(pt.x, pt.y)
  }

  /**
   * @param {external:MouseEvent} evt
   * @param {Float} mouseX
   * @param {Float} mouseY
   * @returns {void}
   */
  mouseUp (evt, mouseX, mouseY) {
    const pt = this.#screenToPt(mouseX, mouseY)

    this.#setEndSelectionFromPoint(pt.x, pt.y, true)

    // TODO: Find a way to make this work: Use transformed BBox instead of evt.target
    // if (lastX === mouseX && lastY === mouseY
    //   && !rectsIntersect(transbb, {x: pt.x, y: pt.y, width: 0, height: 0})) {
    //   svgCanvas.textActions.toSelectMode(true);
    // }

    if (
      evt.target !== this.#curtext &&
      mouseX < this.#lastX + 2 &&
      mouseX > this.#lastX - 2 &&
      mouseY < this.#lastY + 2 &&
      mouseY > this.#lastY - 2
    ) {
      svgCanvas.textActions.toSelectMode(true)
    }
  }

  /**
   * @param {Integer} index
   * @returns {void}
   */
  setCursor (index) {
    this.#setCursor(index)
  }

  /**
   * @param {Float} x
   * @param {Float} y
   * @returns {void}
   */
  toEditMode (x, y) {
    this.#allowDbl = false
    svgCanvas.setCurrentMode('textedit')
    svgCanvas.selectorManager.requestSelector(this.#curtext).showGrips(false)
    // Make selector group accept clicks
    /* const selector = */ svgCanvas.selectorManager.requestSelector(this.#curtext) // Do we need this? Has side effect of setting lock, so keeping for now, but next line wasn't being used
    // const sel = selector.selectorRect;

    svgCanvas.textActions.init()

    this.#curtext.style.cursor = 'text'

    // if (supportsEditableText()) {
    //   curtext.setAttribute('editable', 'simple');
    //   return;
    // }

    if (arguments.length === 0) {
      this.#setCursor()
    } else {
      const pt = this.#screenToPt(x, y)
      this.#setCursorFromPoint(pt.x, pt.y)
    }

    setTimeout(() => {
      this.#allowDbl = true
    }, 300)
  }

  /**
   * @param {boolean|Element} selectElem
   * @fires module:svgcanvas.SvgCanvas#event:selected
   * @returns {void}
   */
  toSelectMode (selectElem) {
    svgCanvas.setCurrentMode('select')
    clearInterval(this.#blinker)
    this.#blinker = null
    if (this.#selblock) {
      this.#selblock.setAttribute('display', 'none')
    }
    if (this.#cursor) {
      this.#cursor.setAttribute('visibility', 'hidden')
    }
    this.#curtext.style.cursor = 'move'

    if (selectElem) {
      svgCanvas.clearSelection()
      this.#curtext.style.cursor = 'move'

      svgCanvas.call('selected', [this.#curtext])
      svgCanvas.addToSelection([this.#curtext], true)
    }
    if (!this.#curtext?.textContent.length) {
      // No content, so delete
      svgCanvas.deleteSelectedElements()
    }

    this.#textinput.blur()

    this.#curtext = false

    // if (supportsEditableText()) {
    //   curtext.removeAttribute('editable');
    // }
  }

  /**
   * @param {Element} elem
   * @returns {void}
   */
  setInputElem (elem) {
    this.#textinput = elem
  }

  /**
   * @returns {void}
   */
  clear () {
    if (svgCanvas.getCurrentMode() === 'textedit') {
      svgCanvas.textActions.toSelectMode()
    }
  }

  /**
   * @param {Element} _inputElem Not in use
   * @returns {void}
   */
  init (_inputElem) {
    if (!this.#curtext) {
      return
    }
    let i
    let end
    // if (supportsEditableText()) {
    //   curtext.select();
    //   return;
    // }

    if (!this.#curtext.parentNode) {
      // Result of the ffClone, need to get correct element
      const selectedElements = svgCanvas.getSelectedElements()
      this.#curtext = selectedElements[0]
      svgCanvas.selectorManager.requestSelector(this.#curtext).showGrips(false)
    }

    const str = this.#curtext.textContent
    const len = str.length

    const xform = this.#curtext.getAttribute('transform')

    this.#textbb = utilsGetBBox(this.#curtext)

    this.#matrix = xform ? getMatrix(this.#curtext) : null

    this.#chardata = []
    this.#chardata.length = len
    this.#textinput.focus()

    this.#curtext.removeEventListener('dblclick', this.#selectWord)
    this.#curtext.addEventListener('dblclick', this.#selectWord)

    if (!len) {
      end = { x: this.#textbb.x + this.#textbb.width / 2, width: 0 }
    }

    for (i = 0; i < len; i++) {
      const start = this.#curtext.getStartPositionOfChar(i)
      end = this.#curtext.getEndPositionOfChar(i)

      if (!supportsGoodTextCharPos()) {
        const zoom = svgCanvas.getZoom()
        const offset = svgCanvas.contentW * zoom
        start.x -= offset
        end.x -= offset

        start.x /= zoom
        end.x /= zoom
      }

      // Get a "bbox" equivalent for each character. Uses the
      // bbox data of the actual text for y, height purposes

      // TODO: Decide if y, width and height are actually necessary
      this.#chardata[i] = {
        x: start.x,
        y: this.#textbb.y, // start.y?
        width: end.x - start.x,
        height: this.#textbb.height
      }
    }

    // Add a last bbox for cursor at end of text
    this.#chardata.push({
      x: end.x,
      width: 0
    })
    this.#setSelection(this.#textinput.selectionStart, this.#textinput.selectionEnd, true)
  }
}

// Export singleton instance for backward compatibility
export const textActionsMethod = new TextActions()
