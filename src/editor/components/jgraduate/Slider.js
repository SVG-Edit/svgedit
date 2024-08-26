import { findPos } from '@svgedit/svgcanvas/common/util.js'
/**
 * Whether a value is `null` or `undefined`.
 * @param {any} val
 * @returns {boolean}
 */
const isNullish = (val) => {
  return val === null || val === undefined
}
/**
 * Encapsulate slider functionality for the ColorMap and ColorBar -
 * could be useful to use a jQuery UI draggable for this with certain extensions.
 * @memberof module:jPicker
 */
export default class Slider {
  /**
   * @param {external:jQuery} bar
   * @param {module:jPicker.SliderOptions} options
   */
  constructor (bar, options) {
    const that = this
    /**
     * Fire events on the supplied `context`
     * @param {module:jPicker.JPickerInit} context
     * @returns {void}
     */
    function fireChangeEvents (context) {
      changeEvents.forEach((changeEvent) => {
        changeEvent.call(that, that, context)
      })
    }

    /**
     * Bind the mousedown to the bar not the arrow for quick snapping to the clicked location.
     * @param {external:jQuery.Event} e
     * @returns {void}
     */
    function mouseDown (e) {
      const off = findPos(bar)
      offset = { l: off.left | 0, t: off.top | 0 }
      clearTimeout(timeout)
      // using setTimeout for visual updates - once the style is updated the browser will re-render internally allowing the next Javascript to run
      timeout = setTimeout(function () {
        setValuesFromMousePosition.call(that, e)
      }, 0)
      // Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
      e.preventDefault() // don't try to select anything or drag the image to the desktop
    }
    /**
     * Set the values as the mouse moves.
     * @param {external:jQuery.Event} e
     * @returns {false}
     */
    function mouseMove (e) {
      clearTimeout(timeout)
      timeout = setTimeout(function () {
        setValuesFromMousePosition.call(that, e)
      }, 0)
      e.stopPropagation()
      e.preventDefault()
      return false
    }
    /**
     * Unbind the document events - they aren't needed when not dragging.
     * @param {external:jQuery.Event} e
     * @returns {false}
     */
    function mouseUp (e) {
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)
      e.stopPropagation()
      e.preventDefault()
      return false
    }

    /**
     * Calculate mouse position and set value within the current range.
     * @param {Event} e
     * @returns {void}
     */
    function setValuesFromMousePosition (e) {
      const barW = bar.w // local copies for YUI compressor
      const barH = bar.h
      let locX = e.pageX - offset.l
      let locY = e.pageY - offset.t
      // keep the arrow within the bounds of the bar
      if (locX < 0) locX = 0
      else if (locX > barW) locX = barW
      if (locY < 0) locY = 0
      else if (locY > barH) locY = barH
      val.call(that, 'xy', {
        x: ((locX / barW) * rangeX) + minX,
        y: ((locY / barH) * rangeY) + minY
      })
    }
    /**
     *
     * @returns {void}
     */
    function draw () {
      const
        barW = bar.w
      const barH = bar.h
      const arrowW = arrow.w
      const arrowH = arrow.h
      let arrowOffsetX = 0
      let arrowOffsetY = 0
      setTimeout(function () {
        if (rangeX > 0) { // range is greater than zero
          // constrain to bounds
          if (x === maxX) arrowOffsetX = barW
          else arrowOffsetX = ((x / rangeX) * barW) | 0
        }
        if (rangeY > 0) { // range is greater than zero
          // constrain to bounds
          if (y === maxY) arrowOffsetY = barH
          else arrowOffsetY = ((y / rangeY) * barH) | 0
        }
        // if arrow width is greater than bar width, center arrow and prevent horizontal dragging
        if (arrowW >= barW) arrowOffsetX = (barW >> 1) - (arrowW >> 1) // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
        else arrowOffsetX -= arrowW >> 1
        // if arrow height is greater than bar height, center arrow and prevent vertical dragging
        if (arrowH >= barH) arrowOffsetY = (barH >> 1) - (arrowH >> 1)
        else arrowOffsetY -= arrowH >> 1
        // set the arrow position based on these offsets
        arrow.style.left = arrowOffsetX + 'px'
        arrow.style.top = arrowOffsetY + 'px'
      })
    }

    /**
     * Get or set a value.
     * @param {?("xy"|"x"|"y")} name
     * @param {module:math.XYObject} value
     * @param {module:jPicker.Slider} context
     * @returns {module:math.XYObject|Float|void}
     */
    function val (name, value, context) {
      const set = value !== undefined
      if (!set) {
        if (isNullish(name)) name = 'xy'
        switch (name.toLowerCase()) {
          case 'x': return x
          case 'y': return y
          case 'xy':
          default: return { x, y }
        }
      }
      if (!isNullish(context) && context === that) return undefined
      let changed = false

      let newX; let newY
      if (isNullish(name)) name = 'xy'
      switch (name.toLowerCase()) {
        case 'x':
          newX = (value && ((value.x && value.x | 0) || value | 0)) || 0
          break
        case 'y':
          newY = (value && ((value.y && value.y | 0) || value | 0)) || 0
          break
        case 'xy':
        default:
          newX = (value && value.x && value.x | 0) || 0
          newY = (value && value.y && value.y | 0) || 0
          break
      }
      if (!isNullish(newX)) {
        if (newX < minX) newX = minX
        else if (newX > maxX) newX = maxX
        if (x !== newX) {
          x = newX
          changed = true
        }
      }
      if (!isNullish(newY)) {
        if (newY < minY) newY = minY
        else if (newY > maxY) newY = maxY
        if (y !== newY) {
          y = newY
          changed = true
        }
      }
      changed && fireChangeEvents.call(that, context || that)
      return undefined
    }

    /**
    * @typedef {PlainObject} module:jPicker.MinMaxRangeX
    * @property {Float} minX
    * @property {Float} maxX
    * @property {Float} rangeX
    */
    /**
    * @typedef {PlainObject} module:jPicker.MinMaxRangeY
    * @property {Float} minY
    * @property {Float} maxY
    * @property {Float} rangeY
    */
    /**
    * @typedef {module:jPicker.MinMaxRangeY|module:jPicker.MinMaxRangeX} module:jPicker.MinMaxRangeXY
    */

    /**
     *
     * @param {"minx"|"maxx"|"rangex"|"miny"|"maxy"|"rangey"|"all"} name
     * @param {module:jPicker.MinMaxRangeXY} value
     * @returns {module:jPicker.MinMaxRangeXY|module:jPicker.MinMaxRangeX|module:jPicker.MinMaxRangeY|void}
     */
    function range (name, value) {
      const set = value !== undefined
      if (!set) {
        if (isNullish(name)) name = 'all'
        switch (name.toLowerCase()) {
          case 'minx': return minX
          case 'maxx': return maxX
          case 'rangex': return { minX, maxX, rangeX }
          case 'miny': return minY
          case 'maxy': return maxY
          case 'rangey': return { minY, maxY, rangeY }
          case 'all':
          default: return { minX, maxX, rangeX, minY, maxY, rangeY }
        }
      }
      let // changed = false,
        newMinX
      let newMaxX
      let newMinY
      let newMaxY
      if (isNullish(name)) name = 'all'
      switch (name.toLowerCase()) {
        case 'minx':
          newMinX = (value && ((value.minX && value.minX | 0) || value | 0)) || 0
          break
        case 'maxx':
          newMaxX = (value && ((value.maxX && value.maxX | 0) || value | 0)) || 0
          break
        case 'rangex':
          newMinX = (value && value.minX && value.minX | 0) || 0
          newMaxX = (value && value.maxX && value.maxX | 0) || 0
          break
        case 'miny':
          newMinY = (value && ((value.minY && value.minY | 0) || value | 0)) || 0
          break
        case 'maxy':
          newMaxY = (value && ((value.maxY && value.maxY | 0) || value | 0)) || 0
          break
        case 'rangey':
          newMinY = (value && value.minY && value.minY | 0) || 0
          newMaxY = (value && value.maxY && value.maxY | 0) || 0
          break
        case 'all':
        default:
          newMinX = (value && value.minX && value.minX | 0) || 0
          newMaxX = (value && value.maxX && value.maxX | 0) || 0
          newMinY = (value && value.minY && value.minY | 0) || 0
          newMaxY = (value && value.maxY && value.maxY | 0) || 0
          break
      }

      if (!isNullish(newMinX) && minX !== newMinX) {
        minX = newMinX
        rangeX = maxX - minX
      }
      if (!isNullish(newMaxX) && maxX !== newMaxX) {
        maxX = newMaxX
        rangeX = maxX - minX
      }
      if (!isNullish(newMinY) && minY !== newMinY) {
        minY = newMinY
        rangeY = maxY - minY
      }
      if (!isNullish(newMaxY) && maxY !== newMaxY) {
        maxY = newMaxY
        rangeY = maxY - minY
      }
      return undefined
    }
    /**
    * @param {GenericCallback} callback
    * @returns {void}
    */
    function bind (callback) {
      if (typeof callback === 'function') changeEvents.push(callback)
    }
    /**
    * @param {GenericCallback} callback
    * @returns {void}
    */
    function unbind (callback) {
      if (typeof callback !== 'function') return
      let i
      while ((i = changeEvents.includes(callback))) changeEvents.splice(i, 1)
    }
    /**
    *
    * @returns {void}
    */
    function destroy () {
      // unbind all possible events and null objects
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)
      bar.removeEventListener('mousedown', mouseDown)
      bar = null
      arrow = null
      changeEvents = null
    }
    let offset
    let timeout
    let x = 0
    let y = 0
    let minX = 0
    let maxX = 100
    let rangeX = 100
    let minY = 0
    let maxY = 100
    let rangeY = 100
    let arrow = bar.querySelector('img') // the arrow image to drag
    let changeEvents = []
    Object.assign(that, {
      val,
      range,
      bind,
      unbind,
      destroy
    })
    // initialize this control
    arrow.src = options.arrow && options.arrow.image
    arrow.w = (options.arrow && options.arrow.width) || parseFloat(getComputedStyle(arrow, null).width.replace('px', ''))
    arrow.h = (options.arrow && options.arrow.height) || parseFloat(getComputedStyle(arrow, null).height.replace('px', ''))
    bar.w = (options.map && options.map.width) || parseFloat(getComputedStyle(bar, null).width.replace('px', ''))
    bar.h = (options.map && options.map.height) || parseFloat(getComputedStyle(bar, null).height.replace('px', ''))
    bar.addEventListener('mousedown', mouseDown)
    bind.call(that, draw)
  }
}
