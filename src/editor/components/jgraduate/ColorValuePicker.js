/* globals $ */
/* eslint-disable max-len */
/* eslint-disable unicorn/prefer-math-trunc */
/* eslint-disable no-bitwise */
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
  if (precision === undefined) precision = 0;
  return Math.round(value * (10 ** precision)) / (10 ** precision);
}
/**
 * Whether a value is `null` or `undefined`.
 * @param {any} val
 * @returns {boolean}
 */
const isNullish = (val) => {
  return val === null || val === undefined;
};
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
    const that = this; // private properties and methods
    const inputs = picker.querySelectorAll('td.Text input');
    // input box key down - use arrows to alter color
    /**
     *
     * @param {Event} e
     * @returns {Event|false|void}
     */
    function keyDown (e) {
      if (e.target.value === '' && e.target !== hex.get(0) && ((!isNullish(bindedHex) && e.target !== bindedHex.get(0)) || isNullish(bindedHex))) return undefined;
      if (!validateKey(e)) return e;
      switch (e.target) {
      case red.get(0):
        switch (e.keyCode) {
        case 38:
          red.val(setValueInRange.call(that, (red.val() << 0) + 1, 0, 255));
          color.val('r', red.val(), e.target);
          return false;
        case 40:
          red.val(setValueInRange.call(that, (red.val() << 0) - 1, 0, 255));
          color.val('r', red.val(), e.target);
          return false;
        }
        break;
      case green.get(0):
        switch (e.keyCode) {
        case 38:
          green.val(setValueInRange.call(that, (green.val() << 0) + 1, 0, 255));
          color.val('g', green.val(), e.target);
          return false;
        case 40:
          green.val(setValueInRange.call(that, (green.val() << 0) - 1, 0, 255));
          color.val('g', green.val(), e.target);
          return false;
        }
        break;
      case blue.get(0):
        switch (e.keyCode) {
        case 38:
          blue.val(setValueInRange.call(that, (blue.val() << 0) + 1, 0, 255));
          color.val('b', blue.val(), e.target);
          return false;
        case 40:
          blue.val(setValueInRange.call(that, (blue.val() << 0) - 1, 0, 255));
          color.val('b', blue.val(), e.target);
          return false;
        }
        break;
      case alpha && alpha.get(0):
        switch (e.keyCode) {
        case 38:
          alpha.val(setValueInRange.call(that, Number.parseFloat(alpha.val()) + 1, 0, 100));
          color.val('a', toFixedNumeric((alpha.val() * 255) / 100, alphaPrecision), e.target);
          return false;
        case 40:
          alpha.val(setValueInRange.call(that, Number.parseFloat(alpha.val()) - 1, 0, 100));
          color.val('a', toFixedNumeric((alpha.val() * 255) / 100, alphaPrecision), e.target);
          return false;
        }
        break;
      case hue.get(0):
        switch (e.keyCode) {
        case 38:
          hue.val(setValueInRange.call(that, (hue.val() << 0) + 1, 0, 360));
          color.val('h', hue.val(), e.target);
          return false;
        case 40:
          hue.val(setValueInRange.call(that, (hue.val() << 0) - 1, 0, 360));
          color.val('h', hue.val(), e.target);
          return false;
        }
        break;
      case saturation.get(0):
        switch (e.keyCode) {
        case 38:
          saturation.val(setValueInRange.call(that, (saturation.val() << 0) + 1, 0, 100));
          color.val('s', saturation.val(), e.target);
          return false;
        case 40:
          saturation.val(setValueInRange.call(that, (saturation.val() << 0) - 1, 0, 100));
          color.val('s', saturation.val(), e.target);
          return false;
        }
        break;
      case value.get(0):
        switch (e.keyCode) {
        case 38:
          value.val(setValueInRange.call(that, (value.val() << 0) + 1, 0, 100));
          color.val('v', value.val(), e.target);
          return false;
        case 40:
          value.val(setValueInRange.call(that, (value.val() << 0) - 1, 0, 100));
          color.val('v', value.val(), e.target);
          return false;
        }
        break;
      }
      return undefined;
    }
    // input box key up - validate value and set color
    /**
    * @param {Event} e
    * @returns {Event|void}
    * @todo Why is this returning an event?
    */
    function keyUp (e) {
      if (e.target.value === '' && e.target !== hex.get(0) &&
        ((!isNullish(bindedHex) && e.target !== bindedHex.get(0)) ||
        isNullish(bindedHex))) return undefined;
      if (!validateKey(e)) return e;
      switch (e.target) {
      case red.get(0):
        red.val(setValueInRange.call(that, red.val(), 0, 255));
        color.val('r', red.val(), e.target);
        break;
      case green.get(0):
        green.val(setValueInRange.call(that, green.val(), 0, 255));
        color.val('g', green.val(), e.target);
        break;
      case blue.get(0):
        blue.val(setValueInRange.call(that, blue.val(), 0, 255));
        color.val('b', blue.val(), e.target);
        break;
      case alpha && alpha.get(0):
        alpha.val(setValueInRange.call(that, alpha.val(), 0, 100));
        color.val('a', toFixedNumeric((alpha.val() * 255) / 100, alphaPrecision), e.target);
        break;
      case hue.get(0):
        hue.val(setValueInRange.call(that, hue.val(), 0, 360));
        color.val('h', hue.val(), e.target);
        break;
      case saturation.get(0):
        saturation.val(setValueInRange.call(that, saturation.val(), 0, 100));
        color.val('s', saturation.val(), e.target);
        break;
      case value.get(0):
        value.val(setValueInRange.call(that, value.val(), 0, 100));
        color.val('v', value.val(), e.target);
        break;
      case hex.get(0):
        hex.val(hex.val().replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 6));
        bindedHex && bindedHex.val(hex.val());
        color.val('hex', hex.val() !== '' ? hex.val() : null, e.target);
        break;
      case bindedHex && bindedHex.get(0):
        bindedHex.val(bindedHex.val().replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 6));
        hex.val(bindedHex.val());
        color.val('hex', bindedHex.val() !== '' ? bindedHex.val() : null, e.target);
        break;
      case ahex && ahex.get(0):
        ahex.val(ahex.val().replace(/[^a-fA-F\d]/g, '').toLowerCase().substring(0, 2));
        color.val('a', !isNullish(ahex.val()) ? Number.parseInt(ahex.val(), 16) : null, e.target);
        break;
      }
      return undefined;
    }
    // input box blur - reset to original if value empty
    /**
    * @param {Event} e
    * @returns {void}
    */
    function blur (e) {
      if (!isNullish(color.val())) {
        switch (e.target) {
        case red.get(0): red.val(color.val('r')); break;
        case green.get(0): green.val(color.val('g')); break;
        case blue.get(0): blue.val(color.val('b')); break;
        case alpha && alpha.get(0): alpha.val(toFixedNumeric((color.val('a') * 100) / 255, alphaPrecision)); break;
        case hue.get(0): hue.val(color.val('h')); break;
        case saturation.get(0): saturation.val(color.val('s')); break;
        case value.get(0): value.val(color.val('v')); break;
        case hex.get(0):
        case bindedHex && bindedHex.get(0):
          hex.val(color.val('hex'));
          bindedHex && bindedHex.val(color.val('hex'));
          break;
        case ahex && ahex.get(0): ahex.val(color.val('ahex').substring(6)); break;
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
        return false;
      case 'c'.charCodeAt():
      case 'v'.charCodeAt():
        if (e.ctrlKey) return false;
      }
      return true;
    }

    /**
    * Constrain value within range.
    * @param {Float|string} value
    * @param {Float} min
    * @param {Float} max
    * @returns {Float|string} Returns a number or numeric string
    */
    function setValueInRange (value, min, max) {
      if (value === '' || isNaN(value)) return min;
      if (value > max) return max;
      if (value < min) return min;
      return value;
    }
    /**
    * @param {external:jQuery} ui
    * @param {Element} context
    * @returns {void}
    */
    function colorChanged (ui, context) {
      const all = ui.val('all');
      if (context !== red) red.value = (!isNullish(all) ? all.r : '');
      if (context !== green) green.value = (!isNullish(all) ? all.g : '');
      if (context !== blue) blue.value = (!isNullish(all) ? all.b : '');
      if (alpha && context !== alpha) alpha.value = (!isNullish(all) ? toFixedNumeric((all.a * 100) / 255, alphaPrecision) : '');
      if (context !== hue) hue.value = (!isNullish(all) ? all.h : '');
      if (context !== saturation) saturation.value = (!isNullish(all) ? all.s : '');
      if (context !== value) value.value = (!isNullish(all) ? all.v : '');
      if (context !== hex && ((bindedHex && context !== bindedHex) || !bindedHex)) hex.value = (!isNullish(all) ? all.hex : '');
      if (bindedHex && context !== bindedHex && context !== hex) bindedHex.value = (!isNullish(all) ? all.hex : '');
      if (ahex && context !== ahex) ahex.value = (!isNullish(all) ? all.ahex.substring(6) : '');
    }
    /**
    * Unbind all events and null objects.
    * @returns {void}
    */
    function destroy () {
      red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).unbind('keyup', keyUp).unbind('blur', blur);
      red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).unbind('keydown', keyDown);
      color.unbind(colorChanged);
      red = null;
      green = null;
      blue = null;
      alpha = null;
      hue = null;
      saturation = null;
      value = null;
      hex = null;
      ahex = null;
    }
    let
      red = inputs[3],
      green = inputs[4],
      blue = inputs[5],
      alpha = inputs.length > 7 ? inputs[6] : null,
      hue = inputs[0],
      saturation = inputs[1],
      value = inputs[2],
      hex = inputs[(inputs.length > 7) ? 7 : 6],
      ahex = inputs.length > 7 ? inputs[8] : null;
    $.extend(true, that, {
      // public properties and methods
      destroy
    });
    red.addEventListener('keyup', keyUp);
    green.addEventListener('keyup', keyUp);
    blue.addEventListener('keyup', keyUp);
    hue.addEventListener('keyup', keyUp);
    saturation.addEventListener('keyup', keyUp);
    value.addEventListener('keyup', keyUp);
    hex.addEventListener('keyup', keyUp);

    red.addEventListener('blur', blur);
    green.addEventListener('blur', blur);
    blue.addEventListener('blur', blur);
    hue.addEventListener('blur', blur);
    saturation.addEventListener('blur', blur);
    value.addEventListener('blur', blur);
    hex.addEventListener('blur', blur);

    red.addEventListener('keydown', keyDown);
    green.addEventListener('keydown', keyDown);
    blue.addEventListener('keydown', keyDown);
    hue.addEventListener('keydown', keyDown);
    saturation.addEventListener('keydown', keyDown);
    value.addEventListener('keydown', keyDown);

    if (alpha !== null) {
      alpha.addEventListener('keyup', keyUp);
      alpha.addEventListener('blur', blur);
      alpha.addEventListener('keydown', keyDown);
    }
    if (ahex !== null) {
      ahex.addEventListener('keyup', keyUp);
      ahex.addEventListener('blur', blur);
    }
    if (bindedHex !== null) {
      bindedHex.addEventListener('keyup', keyUp);
      bindedHex.addEventListener('blur', blur);
    }
    // red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).bind('keyup', keyUp).bind('blur', blur);
    // red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).bind('keydown', keyDown);
    color.bind(colorChanged);
  }
}
