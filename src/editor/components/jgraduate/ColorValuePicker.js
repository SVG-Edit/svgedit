/**
* @external Math
*/
/**
* @memberof external:Math
* @param {Float} value
* @param {Float} precision
* @returns {Float}
*/
function toFixedNumeric (value, precision) {
  if (precision === undefined) precision = 0
  return Math.round(value * (10 ** precision)) / (10 ** precision)
}
/**
 * Controls for all the input elements for the typing in color values.
 */
export default class ColorValuePicker {
  /**
   * @param {external:jQuery} picker
   * @param {external:jQuery.jPicker.Color} color
   * @param {external:jQuery.fn.$.fn.jPicker} bindedHex
   * @param {Float} alphaPrecision
   */
  constructor (picker, color, bindedHex, alphaPrecision) {
    const that = this // private properties and methods
    const inputs = picker.querySelectorAll('td.Text input')
    // input box key down - use arrows to alter color
    /**
     *
     * @param {Event} e
     * @returns {Event|false|void}
     */
    function keyDown (e) {
      if (e.target.value === '' && e.target !== hex && ((bindedHex && e.target !== bindedHex) || !bindedHex)) return undefined
      if (!validateKey(e)) return e
      switch (e.target) {
        case red:
          switch (e.keyCode) {
            case 38:
              red.value = setValueInRange.call(that, (red.value << 0) + 1, 0, 255)
              color.val('r', red.value, e.target)
              return false
            case 40:
              red.value = setValueInRange.call(that, (red.value << 0) - 1, 0, 255)
              color.val('r', red.value, e.target)
              return false
          }
          break
        case green:
          switch (e.keyCode) {
            case 38:
              green.value = setValueInRange.call(that, (green.value << 0) + 1, 0, 255)
              color.val('g', green.value, e.target)
              return false
            case 40:
              green.value = setValueInRange.call(that, (green.value << 0) - 1, 0, 255)
              color.val('g', green.value, e.target)
              return false
          }
          break
        case blue:
          switch (e.keyCode) {
            case 38:
              blue.value = setValueInRange.call(that, (blue.value << 0) + 1, 0, 255)
              color.val('b', blue.value, e.target)
              return false
            case 40:
              blue.value = setValueInRange.call(that, (blue.value << 0) - 1, 0, 255)
              color.val('b', blue.value, e.target)
              return false
          }
          break
        case alpha:
          switch (e.keyCode) {
            case 38:
              alpha.value = setValueInRange.call(that, Number.parseFloat(alpha.value) + 1, 0, 100)
              color.val('a', toFixedNumeric((alpha.value * 255) / 100, alphaPrecision), e.target)
              return false
            case 40:
              alpha.value = setValueInRange.call(that, Number.parseFloat(alpha.value) - 1, 0, 100)
              color.val('a', toFixedNumeric((alpha.value * 255) / 100, alphaPrecision), e.target)
              return false
          }
          break
        case hue:
          switch (e.keyCode) {
            case 38:
              hue.value = setValueInRange.call(that, (hue.value << 0) + 1, 0, 360)
              color.val('h', hue.value, e.target)
              return false
            case 40:
              hue.value = setValueInRange.call(that, (hue.value << 0) - 1, 0, 360)
              color.val('h', hue.value, e.target)
              return false
          }
          break
        case saturation:
          switch (e.keyCode) {
            case 38:
              saturation.value = setValueInRange.call(that, (saturation.value << 0) + 1, 0, 100)
              color.val('s', saturation.value, e.target)
              return false
            case 40:
              saturation.value = setValueInRange.call(that, (saturation.value << 0) - 1, 0, 100)
              color.val('s', saturation.value, e.target)
              return false
          }
          break
        case value:
          switch (e.keyCode) {
            case 38:
              value.value = setValueInRange.call(that, (value.value << 0) + 1, 0, 100)
              color.val('v', value.value, e.target)
              return false
            case 40:
              value.value = setValueInRange.call(that, (value.value << 0) - 1, 0, 100)
              color.val('v', value.value, e.target)
              return false
          }
          break
      }
      return undefined
    }
    // input box key up - validate value and set color
    /**
    * @param {Event} e
    * @returns {Event|void}
    * @todo Why is this returning an event?
    */
    function keyUp (e) {
      if (e.target.value === '' && e.target !== hex &&
        ((bindedHex && e.target !== bindedHex) ||
        !bindedHex)) return undefined
      if (!validateKey(e)) return e
      switch (e.target) {
        case red:
          red.value = setValueInRange.call(that, red.value, 0, 255)
          color.val('r', red.value, e.target)
          break
        case green:
          green.value = setValueInRange.call(that, green.value, 0, 255)
          color.val('g', green.value, e.target)
          break
        case blue:
          blue.value = setValueInRange.call(that, blue.value, 0, 255)
          color.val('b', blue.value, e.target)
          break
        case alpha:
          alpha.value = setValueInRange.call(that, alpha.value, 0, 100)
          color.val('a', toFixedNumeric((alpha.value * 255) / 100, alphaPrecision), e.target)
          break
        case hue:
          hue.value = setValueInRange.call(that, hue.value, 0, 360)
          color.val('h', hue.value, e.target)
          break
        case saturation:
          saturation.value = setValueInRange.call(that, saturation.value, 0, 100)
          color.val('s', saturation.value, e.target)
          break
        case value:
          value.value = setValueInRange.call(that, value.value, 0, 100)
          color.val('v', value.value, e.target)
          break
        case hex:
          hex.value = hex.value.replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 6)
          bindedHex && bindedHex.val(hex.value)
          color.val('hex', hex.value !== '' ? hex.value : null, e.target)
          break
        case bindedHex:
          bindedHex.value = bindedHex.value.replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 6)
          hex.val(bindedHex.value)
          color.val('hex', bindedHex.value !== '' ? bindedHex.value : null, e.target)
          break
        case ahex:
          ahex.value = ahex.value.replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 2)
          color.val('a', ahex.value ? Number.parseInt(ahex.value, 16) : null, e.target)
          break
      }
      return undefined
    }
    // input box blur - reset to original if value empty
    /**
    * @param {Event} e
    * @returns {void}
    */
    function blur (e) {
      if (color.value) {
        switch (e.target) {
          case red:
            color.value = 'r'
            red.value = color.value
            break
          case green:
            color.value = 'g'
            green.value = color.value
            break
          case blue:
            color.value = 'b'
            blue.value = color.value
            break
          case alpha:
            color.value = 'a'
            alpha.value = toFixedNumeric((color.value * 100) / 255, alphaPrecision)
            break
          case hue:
            color.value = 'h'
            hue.value = color.value
            break
          case saturation:
            color.value = 's'
            saturation.value = color.value
            break
          case value:
            color.value = 'v'
            value.value = color.value
            break
          case hex:
          case bindedHex:
            color.value = 'hex'
            hex.value = color.value
            bindedHex.value = color.value
            break
          case ahex:
            color.value = 'ahex'
            ahex.value = color.value.substring(6)
            break
        }
      }
    }
    /**
    * @param {Event} e
    * @returns {boolean}
    */
    function validateKey (e) {
      switch (e.keyCode) {
        case 9:
        case 16:
        case 29:
        case 37:
        case 39:
          return false
        case 'c'.charCodeAt():
        case 'v'.charCodeAt():
          if (e.ctrlKey) return false
      }
      return true
    }

    /**
    * Constrain value within range.
    * @param {Float|string} value
    * @param {Float} min
    * @param {Float} max
    * @returns {Float|string} Returns a number or numeric string
    */
    function setValueInRange (value, min, max) {
      if (value === '' || isNaN(value)) return min
      if (value > max) return max
      if (value < min) return min
      return value
    }
    /**
    * @param {external:jQuery} ui
    * @param {Element} context
    * @returns {void}
    */
    function colorChanged (ui, context) {
      const all = ui.val('all')
      if (context !== red) red.value = (all ? all.r : '')
      if (context !== green) green.value = (all ? all.g : '')
      if (context !== blue) blue.value = (all ? all.b : '')
      if (alpha && context !== alpha) alpha.value = (all ? toFixedNumeric((all.a * 100) / 255, alphaPrecision) : '')
      if (context !== hue) hue.value = (all ? all.h : '')
      if (context !== saturation) saturation.value = (all ? all.s : '')
      if (context !== value) value.value = (all ? all.v : '')
      if (context !== hex && ((bindedHex && context !== bindedHex) || !bindedHex)) hex.value = (all ? all.hex : '')
      if (bindedHex && context !== bindedHex && context !== hex) bindedHex.value = (all ? all.hex : '')
      if (ahex && context !== ahex) ahex.value = (all ? all.ahex.substring(6) : '')
    }
    /**
    * Unbind all events and null objects.
    * @returns {void}
    */
    function destroy () {
      red.removeEventListener('keyup', keyUp)
      green.removeEventListener('keyup', keyUp)
      blue.removeEventListener('keyup', keyUp)
      hue.removeEventListener('keyup', keyUp)
      saturation.removeEventListener('keyup', keyUp)
      value.removeEventListener('keyup', keyUp)
      hex.removeEventListener('keyup', keyUp)

      red.removeEventListener('blur', blur)
      green.removeEventListener('blur', blur)
      blue.removeEventListener('blur', blur)
      hue.removeEventListener('blur', blur)
      saturation.removeEventListener('blur', blur)
      value.removeEventListener('blur', blur)
      hex.removeEventListener('blur', blur)

      red.removeEventListener('keydown', keyDown)
      green.removeEventListener('keydown', keyDown)
      blue.removeEventListener('keydown', keyDown)
      hue.removeEventListener('keydown', keyDown)
      saturation.removeEventListener('keydown', keyDown)
      value.removeEventListener('keydown', keyDown)

      if (alpha !== null) {
        alpha.removeEventListener('keyup', keyUp)
        alpha.removeEventListener('blur', blur)
        alpha.removeEventListener('keydown', keyDown)
      }
      if (ahex !== null) {
        ahex.removeEventListener('keyup', keyUp)
        ahex.removeEventListener('blur', blur)
      }
      if (bindedHex !== null) {
        bindedHex.removeEventListener('keyup', keyUp)
        bindedHex.removeEventListener('blur', blur)
      }
      color.unbind(colorChanged)
      red = null
      green = null
      blue = null
      alpha = null
      hue = null
      saturation = null
      value = null
      hex = null
      ahex = null
    }
    let
      red = inputs[3]
    let green = inputs[4]
    let blue = inputs[5]
    let alpha = inputs.length > 7 ? inputs[6] : null
    let hue = inputs[0]
    let saturation = inputs[1]
    let value = inputs[2]
    let hex = inputs[(inputs.length > 7) ? 7 : 6]
    let ahex = inputs.length > 7 ? inputs[8] : null
    Object.assign(that, { destroy })
    red.addEventListener('keyup', keyUp)
    green.addEventListener('keyup', keyUp)
    blue.addEventListener('keyup', keyUp)
    hue.addEventListener('keyup', keyUp)
    saturation.addEventListener('keyup', keyUp)
    value.addEventListener('keyup', keyUp)
    hex.addEventListener('keyup', keyUp)

    red.addEventListener('blur', blur)
    green.addEventListener('blur', blur)
    blue.addEventListener('blur', blur)
    hue.addEventListener('blur', blur)
    saturation.addEventListener('blur', blur)
    value.addEventListener('blur', blur)
    hex.addEventListener('blur', blur)

    red.addEventListener('keydown', keyDown)
    green.addEventListener('keydown', keyDown)
    blue.addEventListener('keydown', keyDown)
    hue.addEventListener('keydown', keyDown)
    saturation.addEventListener('keydown', keyDown)
    value.addEventListener('keydown', keyDown)

    if (alpha !== null) {
      alpha.addEventListener('keyup', keyUp)
      alpha.addEventListener('blur', blur)
      alpha.addEventListener('keydown', keyDown)
    }
    if (ahex !== null) {
      ahex.addEventListener('keyup', keyUp)
      ahex.addEventListener('blur', blur)
    }
    if (bindedHex !== null) {
      bindedHex.addEventListener('keyup', keyUp)
      bindedHex.addEventListener('blur', blur)
    }
    color.bind(colorChanged)
  }
}
