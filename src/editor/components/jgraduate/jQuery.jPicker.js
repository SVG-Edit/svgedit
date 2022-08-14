/* globals svgEditor */
/**
 * @file jPicker (Adapted from version 1.1.6)
 *
 * jQuery Plugin for Photoshop style color picker
 *
 * @module jPicker
 * @copyright (c) 2010 Christopher T. Tillman
 * Digital Magic Productions, Inc. ({@link http://www.digitalmagicpro.com/})
 * FREE to use, alter, copy, sell, and especially ENHANCE
 * @license MIT
 *
 * Painstakingly ported from John Dyers' excellent work on his own color picker based on the Prototype framework.
 *
 * John Dyers' website: {@link http://johndyer.name}
 * Color Picker page: {@link http://johndyer.name/photoshop-like-javascript-color-picker/}
 */
/* eslint-disable max-len */
import ColorValuePicker from './ColorValuePicker.js'
import Slider from './Slider.js'
import { findPos, mergeDeep } from '../../../common/util.js'

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
 * Whether a value is `null` or `undefined`.
 * @param {any} val
 * @returns {boolean}
 */
const isNullish = (val) => {
  return val === null || val === undefined
}

/**
* @function module:jPicker.jPicker
* @param {external:jQuery} $ The jQuery object, {@link external:jQuery.fn.$.fn.jPicker}, {@link external:jQuery.fn.$.fn.jPicker.defaults})
* @returns {external:jQuery}
*/
// const jPicker = function ($) {
/**
* @typedef {PlainObject} module:jPicker.SliderOptions
* @property {external:jQuery|PlainObject} arrow
* @property {string} arrow.image Not in use?
* @property {Float} arrow.width
* @property {Float} arrow.height
* @property {PlainObject} map
* @property {Float} map.width
* @property {Float} map.height
*/

/**
* @typedef {PlainObject} module:jPicker.JPickerInit
* @property {Integer} [a]
* @property {Integer} [b]
* @property {Integer} [g]
* @property {Integer} [h]
* @property {Integer} [r]
* @property {Integer} [s]
* @property {Integer} [v]
* @property {string} [hex]
* @property {string} [ahex]
*/
/**
* @namespace {PlainObject} jPicker
* @memberof external:jQuery
*/
export const jPicker = /** @lends external:jQuery.jPicker */ {
  /**
  * Array holding references to each active instance of the jPicker control.
  * @type {external:jQuery.fn.$.fn.jPicker[]}
  */
  List: [],
  /**
  * Color object - we will be able to assign by any color space type or
  * retrieve any color space info.
  * We want this public so we can optionally assign new color objects to
  * initial values using inputs other than a string hex value (also supported)
  * Note: JSDoc didn't document when expressed here as an ES6 Class.
  * @namespace
  * @class
  * @memberof external:jQuery.jPicker
  * @param {module:jPicker.JPickerInit} init
  * @returns {external:jQuery.jPicker.Color}
  */
  Color: function (init) {
    const that = this
    /**
     *
     * @param {module:jPicker.Slider} context
     * @returns {void}
     */
    function fireChangeEvents (context) {
      for (let i = 0; i < changeEvents.length; i++) changeEvents[i].call(that, that, context)
    }

    /**
     * @param {string|"ahex"|"hex"|"all"|""|null|void} name String composed of letters "r", "g", "b", "a", "h", "s", and/or "v"
     * @param {module:jPicker.RGBA|module:jPicker.JPickerInit|string} [value]
     * @param {external:jQuery.jPicker.Color} context
     * @returns {module:jPicker.JPickerInit|string|null|void}
     */
    function val (name, value, context) {
      // Kind of ugly
      const set = Boolean(value)
      if (set && value.ahex === '') value.ahex = '00000000'
      if (!set) {
        let ret
        if (isNullish(name) || name === '') name = 'all'
        if (isNullish(r)) return null
        switch (name.toLowerCase()) {
          case 'ahex': return ColorMethods.rgbaToHex({ r, g, b, a })
          case 'hex': return val('ahex').substring(0, 6)
          case 'all': return {
            r,
            g,
            b,
            a,
            h,
            s,
            v,
            hex: val.call(that, 'hex'),
            ahex: val.call(that, 'ahex')
          }
          default: {
            ret = {}
            const nameLength = name.length;
            [...name].forEach((ch) => {
              switch (ch) {
                case 'r':
                  if (nameLength === 1) ret = r
                  else ret.r = r
                  break
                case 'g':
                  if (nameLength === 1) ret = g
                  else ret.g = g
                  break
                case 'b':
                  if (nameLength === 1) ret = b
                  else ret.b = b
                  break
                case 'a':
                  if (nameLength === 1) ret = a
                  else ret.a = a
                  break
                case 'h':
                  if (nameLength === 1) ret = h
                  else ret.h = h
                  break
                case 's':
                  if (nameLength === 1) ret = s
                  else ret.s = s
                  break
                case 'v':
                  if (nameLength === 1) ret = v
                  else ret.v = v
                  break
              }
            })
          }
        }
        return typeof ret === 'object' && !Object.keys(ret).length
          ? val.call(that, 'all')
          : ret
      }
      if (!isNullish(context) && context === that) return undefined
      if (isNullish(name)) name = ''

      let changed = false
      if (isNullish(value)) {
        if (!isNullish(r)) {
          r = null
          changed = true
        }
        if (!isNullish(g)) {
          g = null
          changed = true
        }
        if (!isNullish(b)) {
          b = null
          changed = true
        }
        if (!isNullish(a)) {
          a = null
          changed = true
        }
        if (!isNullish(h)) {
          h = null
          changed = true
        }
        if (!isNullish(s)) {
          s = null
          changed = true
        }
        if (!isNullish(v)) {
          v = null
          changed = true
        }
        changed && fireChangeEvents.call(that, context || that)
        return undefined
      }
      switch (name.toLowerCase()) {
        case 'ahex':
        case 'hex': {
          const ret = ColorMethods.hexToRgba((value && (value.ahex || value.hex)) || value || 'none')
          val.call(that, 'rgba', {
            r: ret.r,
            g: ret.g,
            b: ret.b,
            a: name === 'ahex'
              ? ret.a
              : !isNullish(a)
                  ? a
                  : 255
          }, context)
          break
        } default: {
          if (value && (!isNullish(value.ahex) || !isNullish(value.hex))) {
            val.call(that, 'ahex', value.ahex || value.hex || '00000000', context)
            return undefined
          }
          const newV = {}
          let rgb = false; let hsv = false
          if (value.r !== undefined && !name.includes('r')) name += 'r'
          if (value.g !== undefined && !name.includes('g')) name += 'g'
          if (value.b !== undefined && !name.includes('b')) name += 'b'
          if (value.a !== undefined && !name.includes('a')) name += 'a'
          if (value.h !== undefined && !name.includes('h')) name += 'h'
          if (value.s !== undefined && !name.includes('s')) name += 's'
          if (value.v !== undefined && !name.includes('v')) name += 'v';
          [...name].forEach((ch) => {
            switch (ch) {
              case 'r':
                if (hsv) return
                rgb = true
                newV.r = (value.r && value.r | 0) || (value | 0) || 0
                if (newV.r < 0) newV.r = 0
                else if (newV.r > 255) newV.r = 255
                if (r !== newV.r) {
                  ({ r } = newV)
                  changed = true
                }
                break
              case 'g':
                if (hsv) return
                rgb = true
                newV.g = (value && value.g && value.g | 0) || (value && value | 0) || 0
                if (newV.g < 0) newV.g = 0
                else if (newV.g > 255) newV.g = 255
                if (g !== newV.g) {
                  ({ g } = newV)
                  changed = true
                }
                break
              case 'b':
                if (hsv) return
                rgb = true
                newV.b = (value && value.b && value.b | 0) || (value && value | 0) || 0
                if (newV.b < 0) newV.b = 0
                else if (newV.b > 255) newV.b = 255
                if (b !== newV.b) {
                  ({ b } = newV)
                  changed = true
                }
                break
              case 'a':
                newV.a = value && !isNullish(value.a) ? value.a | 0 : value | 0
                if (newV.a < 0) newV.a = 0
                else if (newV.a > 255) newV.a = 255
                if (a !== newV.a) {
                  ({ a } = newV)
                  changed = true
                }
                break
              case 'h':
                if (rgb) return
                hsv = true
                newV.h = (value && value.h && value.h | 0) || (value && value | 0) || 0
                if (newV.h < 0) newV.h = 0
                else if (newV.h > 360) newV.h = 360
                if (h !== newV.h) {
                  ({ h } = newV)
                  changed = true
                }
                break
              case 's':
                if (rgb) return
                hsv = true
                newV.s = !isNullish(value.s) ? value.s | 0 : value | 0
                if (newV.s < 0) newV.s = 0
                else if (newV.s > 100) newV.s = 100
                if (s !== newV.s) {
                  ({ s } = newV)
                  changed = true
                }
                break
              case 'v':
                if (rgb) return
                hsv = true
                newV.v = !isNullish(value.v) ? value.v | 0 : value | 0
                if (newV.v < 0) newV.v = 0
                else if (newV.v > 100) newV.v = 100
                if (v !== newV.v) {
                  ({ v } = newV)
                  changed = true
                }
                break
            }
          })
          if (changed) {
            if (rgb) {
              r = r || 0
              g = g || 0
              b = b || 0
              const ret = ColorMethods.rgbToHsv({ r, g, b });
              ({ h, s, v } = ret)
            } else if (hsv) {
              h = h || 0
              s = !isNullish(s) ? s : 100
              v = !isNullish(v) ? v : 100
              const ret = ColorMethods.hsvToRgb({ h, s, v });
              ({ r, g, b } = ret)
            }
            a = !isNullish(a) ? a : 255
            fireChangeEvents.call(that, context || that)
          }
          break
        }
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
      while ((i = changeEvents.includes(callback))) {
        changeEvents.splice(i, 1)
      }
    }
    /**
    * Unset `changeEvents`
    * @returns {void}
    */
    function destroy () {
      changeEvents = null
    }
    let r; let g; let b; let a; let h; let s; let v; let changeEvents = []
    Object.assign(that, {
      // public properties and methods
      val,
      bind,
      unbind,
      destroy
    })
    if (init) {
      if (!isNullish(init.ahex)) {
        val('ahex', init)
      } else if (!isNullish(init.hex)) {
        val(
          (!isNullish(init.a) ? 'a' : '') + 'hex',
          !isNullish(init.a)
            ? { ahex: init.hex + ColorMethods.intToHex(init.a) }
            : init
        )
      } else if (!isNullish(init.r) && !isNullish(init.g) && !isNullish(init.b)) {
        val('rgb' + (!isNullish(init.a) ? 'a' : ''), init)
      } else if (!isNullish(init.h) && !isNullish(init.s) && !isNullish(init.v)) {
        val('hsv' + (!isNullish(init.a) ? 'a' : ''), init)
      }
    }
  },
  /**
  * Color conversion methods  - make public to give use to external scripts.
  * @namespace
  */
  ColorMethods: {
    /**
    * @typedef {PlainObject} module:jPicker.RGBA
    * @property {Integer} r
    * @property {Integer} g
    * @property {Integer} b
    * @property {Integer} a
    */
    /**
    * @typedef {PlainObject} module:jPicker.RGB
    * @property {Integer} r
    * @property {Integer} g
    * @property {Integer} b
    */
    /**
    * @param {string} hex
    * @returns {module:jPicker.RGBA}
    */
    hexToRgba (hex) {
      if (hex === '' || hex === 'none') return { r: null, g: null, b: null, a: null }
      hex = this.validateHex(hex)
      let r = '00'; let g = '00'; let b = '00'; let a = '255'
      if (hex.length === 6) hex += 'ff'
      if (hex.length > 6) {
        r = hex.substring(0, 2)
        g = hex.substring(2, 4)
        b = hex.substring(4, 6)
        a = hex.substring(6, hex.length)
      } else {
        if (hex.length > 4) {
          r = hex.substring(4, hex.length)
          hex = hex.substring(0, 4)
        }
        if (hex.length > 2) {
          g = hex.substring(2, hex.length)
          hex = hex.substring(0, 2)
        }
        if (hex.length > 0) b = hex.substring(0, hex.length)
      }
      return {
        r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b), a: this.hexToInt(a)
      }
    },
    /**
    * @param {string} hex
    * @returns {string}
    */
    validateHex (hex) {
      // if (typeof hex === 'object') return '';
      hex = hex.toLowerCase().replace(/[^a-f\d]/g, '')
      if (hex.length > 8) hex = hex.substring(0, 8)
      return hex
    },
    /**
    * @param {module:jPicker.RGBA} rgba
    * @returns {string}
    */
    rgbaToHex (rgba) {
      return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b) + this.intToHex(rgba.a)
    },
    /**
    * @param {Integer} dec
    * @returns {string}
    */
    intToHex (dec) {
      let result = (dec | 0).toString(16)
      if (result.length === 1) result = ('0' + result)
      return result.toLowerCase()
    },
    /**
    * @param {string} hex
    * @returns {Integer}
    */
    hexToInt (hex) {
      return Number.parseInt(hex, 16)
    },
    /**
    * @typedef {PlainObject} module:jPicker.HSV
    * @property {Integer} h
    * @property {Integer} s
    * @property {Integer} v
    */
    /**
    * @param {module:jPicker.RGB} rgb
    * @returns {module:jPicker.HSV}
    */
    rgbToHsv (rgb) {
      const r = rgb.r / 255; const g = rgb.g / 255; const b = rgb.b / 255; const hsv = { h: 0, s: 0, v: 0 }
      let min = 0; let max = 0
      if (r >= g && r >= b) {
        max = r
        min = g > b ? b : g
      } else if (g >= b && g >= r) {
        max = g
        min = r > b ? b : r
      } else {
        max = b
        min = g > r ? r : g
      }
      hsv.v = max
      hsv.s = max ? (max - min) / max : 0
      let delta
      if (!hsv.s) hsv.h = 0
      else {
        delta = max - min
        if (r === max) hsv.h = (g - b) / delta
        else if (g === max) hsv.h = 2 + (b - r) / delta
        else hsv.h = 4 + (r - g) / delta
        hsv.h = Number.parseInt(hsv.h * 60)
        if (hsv.h < 0) hsv.h += 360
      }
      hsv.s = (hsv.s * 100) | 0
      hsv.v = (hsv.v * 100) | 0
      return hsv
    },
    /**
    * @param {module:jPicker.HSV} hsv
    * @returns {module:jPicker.RGB}
    */
    hsvToRgb (hsv) {
      const rgb = { r: 0, g: 0, b: 0, a: 100 }
      let { h, s, v } = hsv
      if (s === 0) {
        if (v === 0) rgb.r = rgb.g = rgb.b = 0
        else rgb.r = rgb.g = rgb.b = (v * 255 / 100) | 0
      } else {
        if (h === 360) h = 0
        h /= 60
        s /= 100
        v /= 100
        const i = h | 0
        const f = h - i
        const p = v * (1 - s)
        const q = v * (1 - (s * f))
        const t = v * (1 - (s * (1 - f)))
        switch (i) {
          case 0:
            rgb.r = v
            rgb.g = t
            rgb.b = p
            break
          case 1:
            rgb.r = q
            rgb.g = v
            rgb.b = p
            break
          case 2:
            rgb.r = p
            rgb.g = v
            rgb.b = t
            break
          case 3:
            rgb.r = p
            rgb.g = q
            rgb.b = v
            break
          case 4:
            rgb.r = t
            rgb.g = p
            rgb.b = v
            break
          case 5:
            rgb.r = v
            rgb.g = p
            rgb.b = q
            break
        }
        rgb.r = (rgb.r * 255) | 0
        rgb.g = (rgb.g * 255) | 0
        rgb.b = (rgb.b * 255) | 0
      }
      return rgb
    }
  }
}
const { Color, List, ColorMethods } = jPicker // local copies for YUI compressor
/**
 * @function external:jQuery.fn.jPicker
 * @see {@link external:jQuery.fn.$.fn.jPicker}
 */

/**
* Will be bound to active {@link jQuery.jPicker.Color}.
* @callback module:jPicker.LiveCallback
* @param {external:jQuery} ui
* @param {Element} context
* @returns {void}
*/
/**
* @callback module:jPicker.CommitCallback
* @param {external:jQuery.jPicker.Color} activeColor
* @param {external:jQuery} okButton
* @returns {void} Return value not used.
*/
/**
 * @callback module:jPicker.CancelCallback
 * @param {external:jQuery.jPicker.Color} activeColor
 * @param {external:jQuery} cancelButton
 * @returns {void} Return value not used.
 */
/**
* While it would seem this should specify the name `jPicker` for JSDoc, that doesn't
*   get us treated as a function as well as a namespace (even with `@function name`),
*   so we use an approach to add a redundant `$.fn.` in the name.
* @namespace
* @memberof external:jQuery.fn
* @param {any} elem
* @param {external:jQuery.fn.jPickerOptions} options
* @param {module:jPicker.CommitCallback} [commitCallback]
* @param {module:jPicker.LiveCallback} [liveCallback]
* @param {module:jPicker.CancelCallback} [cancelCallback]
* @returns {void}
*/
export function jPickerMethod (elem, options, commitCallback, liveCallback, cancelCallback, i18next) {
  let sets = mergeDeep({}, jPickerDefaults) // local copies for YUI compressor
  sets = mergeDeep(sets, options)

  const that = elem
  const settings = sets
  if (that.nodeName.toLowerCase() === 'input') { // Add color picker icon if binding to an input element and bind the events to the input
    Object.assign(settings, {
      window: {
        bindToInput: true,
        expandable: true,
        input: that
      }
    })
    if (that.value === '') {
      settings.color.active = new Color({ hex: null })
      settings.color.current = new Color({ hex: null })
    } else if (ColorMethods.validateHex(that.value)) {
      settings.color.active = new Color({ hex: that.value, a: settings.color.active.val('a') })
      settings.color.current = new Color({ hex: that.value, a: settings.color.active.val('a') })
    }
  }
  if (settings.window.expandable) {
    const content = document.createElement('span')
    content.classList.add('jPicker')
    content.innerHTML = `<span class="Icon" id="jq-ae-Icon">
      <span class="Color" id="jq-ae-Color">&nbsp;</span>
      <span class="Alpha" id="jq-ae-Alpha">&nbsp;</span>
      <span class="Image" id="jq-ae-Image" title="${i18next.t('config.open_color_picker')}">&nbsp;</span>
      <span class="Container" id="Container">&nbsp;</span>
    </span>`
    that.insertAdjacentElement('afterend', content)
  } else {
    settings.window.liveUpdate = false // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
  }
  const isLessThanIE7 = Number.parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters // needed to run the AlphaImageLoader function for IE6
  // set color mode and update visuals for the new color mode
  /**
   *
   * @param {"h"|"s"|"v"|"r"|"g"|"b"|"a"} colorMode
   * @throws {Error} Invalid mode
   * @returns {void}
   */
  function setColorMode (colorMode) {
    const { active } = color // local copies for YUI compressor
    // {clientPath} = images,
    const hex = active.val('hex')
    let rgbMap; let rgbBar
    settings.color.mode = colorMode
    switch (colorMode) {
      case 'h':
        setTimeout(function () {
          setBG.call(that, colorMapDiv, 'transparent')
          setImgLoc.call(that, colorMapL1, 0)
          setAlpha.call(that, colorMapL1, 100)
          setImgLoc.call(that, colorMapL2, 260)
          setAlpha.call(that, colorMapL2, 100)
          setBG.call(that, colorBarDiv, 'transparent')
          setImgLoc.call(that, colorBarL1, 0)
          setAlpha.call(that, colorBarL1, 100)
          setImgLoc.call(that, colorBarL2, 260)
          setAlpha.call(that, colorBarL2, 100)
          setImgLoc.call(that, colorBarL3, 260)
          setAlpha.call(that, colorBarL3, 100)
          setImgLoc.call(that, colorBarL4, 260)
          setAlpha.call(that, colorBarL4, 100)
          setImgLoc.call(that, colorBarL6, 260)
          setAlpha.call(that, colorBarL6, 100)
        }, 0)
        colorMap.range('all', { minX: 0, maxX: 100, minY: 0, maxY: 100 })
        colorBar.range('rangeY', { minY: 0, maxY: 360 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('s'), y: 100 - active.val('v') }, colorMap)
        colorBar.val('y', 360 - active.val('h'), colorBar)
        break
      case 's':
        setTimeout(function () {
          setBG.call(that, colorMapDiv, 'transparent')
          setImgLoc.call(that, colorMapL1, -260)
          setImgLoc.call(that, colorMapL2, -520)
          setImgLoc.call(that, colorBarL1, -260)
          setImgLoc.call(that, colorBarL2, -520)
          setImgLoc.call(that, colorBarL6, 260)
          setAlpha.call(that, colorBarL6, 100)
        }, 0)
        colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 })
        colorBar.range('rangeY', { minY: 0, maxY: 100 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('v') }, colorMap)
        colorBar.val('y', 100 - active.val('s'), colorBar)
        break
      case 'v':
        setTimeout(function () {
          setBG.call(that, colorMapDiv, '000000')
          setImgLoc.call(that, colorMapL1, -780)
          setImgLoc.call(that, colorMapL2, 260)
          setBG.call(that, colorBarDiv, hex)
          setImgLoc.call(that, colorBarL1, -520)
          setImgLoc.call(that, colorBarL2, 260)
          setAlpha.call(that, colorBarL2, 100)
          setImgLoc.call(that, colorBarL6, 260)
          setAlpha.call(that, colorBarL6, 100)
        }, 0)
        colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 })
        colorBar.range('rangeY', { minY: 0, maxY: 100 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('s') }, colorMap)
        colorBar.val('y', 100 - active.val('v'), colorBar)
        break
      case 'r':
        rgbMap = -1040
        rgbBar = -780
        colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 })
        colorBar.range('rangeY', { minY: 0, maxY: 255 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('b'), y: 255 - active.val('g') }, colorMap)
        colorBar.val('y', 255 - active.val('r'), colorBar)
        break
      case 'g':
        rgbMap = -1560
        rgbBar = -1820
        colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 })
        colorBar.range('rangeY', { minY: 0, maxY: 255 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('b'), y: 255 - active.val('r') }, colorMap)
        colorBar.val('y', 255 - active.val('g'), colorBar)
        break
      case 'b':
        rgbMap = -2080
        rgbBar = -2860
        colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 })
        colorBar.range('rangeY', { minY: 0, maxY: 255 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('r'), y: 255 - active.val('g') }, colorMap)
        colorBar.val('y', 255 - active.val('b'), colorBar)
        break
      case 'a':
        setTimeout(function () {
          setBG.call(that, colorMapDiv, 'transparent')
          setImgLoc.call(that, colorMapL1, -260)
          setImgLoc.call(that, colorMapL2, -520)
          setImgLoc.call(that, colorBarL1, 260)
          setImgLoc.call(that, colorBarL2, 260)
          setAlpha.call(that, colorBarL2, 100)
          setImgLoc.call(that, colorBarL6, 0)
          setAlpha.call(that, colorBarL6, 100)
        }, 0)
        colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 })
        colorBar.range('rangeY', { minY: 0, maxY: 255 })
        if (isNullish(active.val('ahex'))) break
        colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('v') }, colorMap)
        colorBar.val('y', 255 - active.val('a'), colorBar)
        break
      default:
        throw new Error('Invalid Mode')
    }
    switch (colorMode) {
      case 'h':
        break
      case 's':
      case 'v':
      case 'a':
        setTimeout(function () {
          setAlpha.call(that, colorMapL1, 100)
          setAlpha.call(that, colorBarL1, 100)
          setImgLoc.call(that, colorBarL3, 260)
          setAlpha.call(that, colorBarL3, 100)
          setImgLoc.call(that, colorBarL4, 260)
          setAlpha.call(that, colorBarL4, 100)
        }, 0)
        break
      case 'r':
      case 'g':
      case 'b':
        setTimeout(function () {
          setBG.call(that, colorMapDiv, 'transparent')
          setBG.call(that, colorBarDiv, 'transparent')
          setAlpha.call(that, colorBarL1, 100)
          setAlpha.call(that, colorMapL1, 100)
          setImgLoc.call(that, colorMapL1, rgbMap)
          setImgLoc.call(that, colorMapL2, rgbMap - 260)
          setImgLoc.call(that, colorBarL1, rgbBar - 780)
          setImgLoc.call(that, colorBarL2, rgbBar - 520)
          setImgLoc.call(that, colorBarL3, rgbBar)
          setImgLoc.call(that, colorBarL4, rgbBar - 260)
          setImgLoc.call(that, colorBarL6, 260)
          setAlpha.call(that, colorBarL6, 100)
        }, 0)
        break
    }
    if (isNullish(active.val('ahex'))) return
    activeColorChanged.call(that, active)
  }
  /**
   * Update color when user changes text values.
   * @param {external:jQuery} ui
   * @param {?module:jPicker.Slider} context
   * @returns {void}
  */
  function activeColorChanged (ui, context) {
    if (isNullish(context) || (context !== colorBar && context !== colorMap)) positionMapAndBarArrows.call(that, ui, context)
    setTimeout(function () {
      updatePreview.call(that, ui)
      updateMapVisuals.call(that, ui)
      updateBarVisuals.call(that, ui)
    }, 0)
  }

  /**
   * User has dragged the ColorMap pointer.
   * @param {external:jQuery} ui
   * @param {?module:jPicker.Slider} context
   * @returns {void}
  */
  function mapValueChanged (ui, context) {
    const { active } = color
    if (context !== colorMap && isNullish(active.val())) return
    const xy = ui.val('all')
    switch (settings.color.mode) {
      case 'h':
        active.val('sv', { s: xy.x, v: 100 - xy.y }, context)
        break
      case 's':
      case 'a':
        active.val('hv', { h: xy.x, v: 100 - xy.y }, context)
        break
      case 'v':
        active.val('hs', { h: xy.x, s: 100 - xy.y }, context)
        break
      case 'r':
        active.val('gb', { g: 255 - xy.y, b: xy.x }, context)
        break
      case 'g':
        active.val('rb', { r: 255 - xy.y, b: xy.x }, context)
        break
      case 'b':
        active.val('rg', { r: xy.x, g: 255 - xy.y }, context)
        break
    }
  }

  /**
   * User has dragged the ColorBar slider.
   * @param {external:jQuery} ui
   * @param {?module:jPicker.Slider} context
   * @returns {void}
  */
  function colorBarValueChanged (ui, context) {
    const { active } = color
    if (context !== colorBar && isNullish(active.val())) return
    switch (settings.color.mode) {
      case 'h':
        active.val('h', { h: 360 - ui.val('y') }, context)
        break
      case 's':
        active.val('s', { s: 100 - ui.val('y') }, context)
        break
      case 'v':
        active.val('v', { v: 100 - ui.val('y') }, context)
        break
      case 'r':
        active.val('r', { r: 255 - ui.val('y') }, context)
        break
      case 'g':
        active.val('g', { g: 255 - ui.val('y') }, context)
        break
      case 'b':
        active.val('b', { b: 255 - ui.val('y') }, context)
        break
      case 'a':
        active.val('a', 255 - ui.val('y'), context)
        break
    }
  }

  /**
   * Position map and bar arrows to match current color.
   * @param {external:jQuery} ui
   * @param {?module:jPicker.Slider} context
   * @returns {void}
  */
  function positionMapAndBarArrows (ui, context) {
    if (context !== colorMap) {
      switch (settings.color.mode) {
        case 'h': {
          const sv = ui.val('sv')
          colorMap.val('xy', { x: !isNullish(sv) ? sv.s : 100, y: 100 - (!isNullish(sv) ? sv.v : 100) }, context)
          break
        } case 's':
          // Fall through
        case 'a': {
          const hv = ui.val('hv')
          colorMap.val('xy', { x: (hv && hv.h) || 0, y: 100 - (!isNullish(hv) ? hv.v : 100) }, context)
          break
        } case 'v': {
          const hs = ui.val('hs')
          colorMap.val('xy', { x: (hs && hs.h) || 0, y: 100 - (!isNullish(hs) ? hs.s : 100) }, context)
          break
        } case 'r': {
          const bg = ui.val('bg')
          colorMap.val('xy', { x: (bg && bg.b) || 0, y: 255 - ((bg && bg.g) || 0) }, context)
          break
        } case 'g': {
          const br = ui.val('br')
          colorMap.val('xy', { x: (br && br.b) || 0, y: 255 - ((br && br.r) || 0) }, context)
          break
        } case 'b': {
          const rg = ui.val('rg')
          colorMap.val('xy', { x: (rg && rg.r) || 0, y: 255 - ((rg && rg.g) || 0) }, context)
          break
        }
      }
    }
    if (context !== colorBar) {
      switch (settings.color.mode) {
        case 'h':
          colorBar.val('y', 360 - (ui.val('h') || 0), context)
          break
        case 's': {
          const s = ui.val('s')
          colorBar.val('y', 100 - (!isNullish(s) ? s : 100), context)
          break
        } case 'v': {
          const v = ui.val('v')
          colorBar.val('y', 100 - (!isNullish(v) ? v : 100), context)
          break
        } case 'r':
          colorBar.val('y', 255 - (ui.val('r') || 0), context)
          break
        case 'g':
          colorBar.val('y', 255 - (ui.val('g') || 0), context)
          break
        case 'b':
          colorBar.val('y', 255 - (ui.val('b') || 0), context)
          break
        case 'a': {
          const a = ui.val('a')
          colorBar.val('y', 255 - (!isNullish(a) ? a : 255), context)
          break
        }
      }
    }
  }
  /**
  * @param {external:jQuery} ui
  * @returns {void}
  */
  function updatePreview (ui) {
    try {
      const all = ui.val('all')
      activePreview.style.backgroundColor = (all && '#' + all.hex) || 'transparent'
      setAlpha.call(that, activePreview, (all && toFixedNumeric((all.a * 100) / 255, 4)) || 0)
    } catch (e) { /* empty fn */ }
  }
  /**
  * @param {external:jQuery} ui
  * @returns {void}
  */
  function updateMapVisuals (ui) {
    switch (settings.color.mode) {
      case 'h':
        setBG.call(that, colorMapDiv, new Color({ h: ui.val('h') || 0, s: 100, v: 100 }).val('hex'))
        break
      case 's':
      case 'a': {
        const s = ui.val('s')
        setAlpha.call(that, colorMapL2, 100 - (!isNullish(s) ? s : 100))
        break
      } case 'v': {
        const v = ui.val('v')
        setAlpha.call(that, colorMapL1, !isNullish(v) ? v : 100)
        break
      } case 'r':
        setAlpha.call(that, colorMapL2, toFixedNumeric((ui.val('r') || 0) / 255 * 100, 4))
        break
      case 'g':
        setAlpha.call(that, colorMapL2, toFixedNumeric((ui.val('g') || 0) / 255 * 100, 4))
        break
      case 'b':
        setAlpha.call(that, colorMapL2, toFixedNumeric((ui.val('b') || 0) / 255 * 100))
        break
    }
    const a = ui.val('a')
    setAlpha.call(that, colorMapL3, toFixedNumeric(((255 - (a || 0)) * 100) / 255, 4))
  }
  /**
  * @param {external:jQuery} ui
  * @returns {void}
  */
  function updateBarVisuals (ui) {
    switch (settings.color.mode) {
      case 'h': {
        const a = ui.val('a')
        setAlpha.call(that, colorBarL5, toFixedNumeric(((255 - (a || 0)) * 100) / 255, 4))
        break
      } case 's': {
        const hva = ui.val('hva')
        const saturatedColor = new Color({ h: (hva && hva.h) || 0, s: 100, v: !isNullish(hva) ? hva.v : 100 })
        setBG.call(that, colorBarDiv, saturatedColor.val('hex'))
        setAlpha.call(that, colorBarL2, 100 - (!isNullish(hva) ? hva.v : 100))
        setAlpha.call(that, colorBarL5, toFixedNumeric(((255 - ((hva && hva.a) || 0)) * 100) / 255, 4))
        break
      } case 'v': {
        const hsa = ui.val('hsa')
        const valueColor = new Color({ h: (hsa && hsa.h) || 0, s: !isNullish(hsa) ? hsa.s : 100, v: 100 })
        setBG.call(that, colorBarDiv, valueColor.val('hex'))
        setAlpha.call(that, colorBarL5, toFixedNumeric(((255 - ((hsa && hsa.a) || 0)) * 100) / 255, 4))
        break
      } case 'r':
      case 'g':
      case 'b': {
        const rgba = ui.val('rgba')
        let hValue = 0; let vValue = 0
        if (settings.color.mode === 'r') {
          hValue = (rgba && rgba.b) || 0
          vValue = (rgba && rgba.g) || 0
        } else if (settings.color.mode === 'g') {
          hValue = (rgba && rgba.b) || 0
          vValue = (rgba && rgba.r) || 0
        } else if (settings.color.mode === 'b') {
          hValue = (rgba && rgba.r) || 0
          vValue = (rgba && rgba.g) || 0
        }
        const middle = vValue > hValue ? hValue : vValue
        setAlpha.call(that, colorBarL2, hValue > vValue ? toFixedNumeric(((hValue - vValue) / (255 - vValue)) * 100, 4) : 0)
        setAlpha.call(that, colorBarL3, vValue > hValue ? toFixedNumeric(((vValue - hValue) / (255 - hValue)) * 100, 4) : 0)
        setAlpha.call(that, colorBarL4, toFixedNumeric((middle / 255) * 100, 4))
        setAlpha.call(that, colorBarL5, toFixedNumeric(((255 - ((rgba && rgba.a) || 0)) * 100) / 255, 4))
        break
      } case 'a': {
        const a = ui.val('a')
        setBG.call(that, colorBarDiv, ui.val('hex') || '000000')
        setAlpha.call(that, colorBarL5, !isNullish(a) ? 0 : 100)
        setAlpha.call(that, colorBarL6, !isNullish(a) ? 100 : 0)
        break
      }
    }
  }
  /**
  * @param {external:jQuery} el
  * @param {string} [c="transparent"]
  * @returns {void}
  */
  function setBG (el, c) {
    el.style.backgroundColor = (c && c.length === 6 && '#' + c) || 'transparent'
  }

  /**
  * @param {external:jQuery} img
  * @param {string} src The image source
  * @returns {void}
  */
  function setImg (img, src) {
    if (isLessThanIE7 && (src.includes('AlphaBar.png') || src.includes('Bars.png') || src.includes('Maps.png'))) {
      img.setAttribute('pngSrc', src)
      img.style.backgroundImage = 'none'
      img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')'
    } else img.style.backgroundImage = 'url(\'' + src + '\')'
  }
  /**
  * @param {external:jQuery} img
  * @param {Float} y
  * @returns {void}
  */
  function setImgLoc (img, y) {
    img.style.top = y + 'px'
  }
  /**
  * @param {external:jQuery} obj
  * @param {Float} alpha
  * @returns {void}
  */
  function setAlpha (obj, alpha) {
    obj.style.visibility = (alpha > 0) ? 'visible' : 'hidden'
    if (alpha > 0 && alpha < 100) {
      if (isLessThanIE7) {
        const src = obj.getAttribute('pngSrc')
        if (!isNullish(src) && (
          src.includes('AlphaBar.png') || src.includes('Bars.png') || src.includes('Maps.png')
        )) {
          obj.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src +
          '\', sizingMethod=\'scale\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')'
        } else obj.style.opacity = toFixedNumeric(alpha / 100, 4)
      } else obj.style.opacity = toFixedNumeric(alpha / 100, 4)
    } else if (alpha === 0 || alpha === 100) {
      if (isLessThanIE7) {
        const src = obj.getAttribute('pngSrc')
        if (!isNullish(src) && (
          src.includes('AlphaBar.png') || src.includes('Bars.png') || src.includes('Maps.png')
        )) {
          obj.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src +
          '\', sizingMethod=\'scale\')'
        } else obj.style.opacity = ''
      } else obj.style.opacity = ''
    }
  }

  /**
  * Revert color to original color when opened.
  * @returns {void}
  */
  function revertColor () {
    color.active.val('ahex', color.current.val('ahex'))
  }
  /**
  * Commit the color changes.
  * @returns {void}
  */
  function commitColor () {
    color.current.val('ahex', color.active.val('ahex'))
  }
  /**
  * @param {Event} e
  * @returns {void}
  */
  function radioClicked (e) {
    const rChecks = that.querySelectorAll('input[type="radio"]:checked')
    for (const rCheck of rChecks) {
      if (rCheck.value !== e.target.value) {
        rCheck.checked = false
      }
    }
    setColorMode.call(that, e.target.value)
  }
  /**
  *
  * @returns {void}
  */
  function currentClicked () {
    revertColor.call(that)
  }
  /**
  *
  * @returns {void}
  */
  function cancelClicked () {
    revertColor.call(that)
    settings.window.expandable && hide.call(that)
    typeof cancelCallback === 'function' && cancelCallback.call(that, color.active, cancelButton)
  }
  /**
  *
  * @returns {void}
  */
  function okClicked () {
    commitColor.call(that)
    settings.window.expandable && hide.call(that)
    typeof commitCallback === 'function' && commitCallback.call(that, color.active, okButton)
  }
  /**
  *
  * @returns {void}
  */
  function iconImageClicked () {
    show.call(that)
  }
  /**
  * @param {external:jQuery} ui
  * @returns {void}
  */
  function currentColorChanged (ui) {
    const hex = ui.val('hex')
    currentPreview.style.backgroundColor = (hex && '#' + hex) || 'transparent'
    setAlpha.call(that, currentPreview, toFixedNumeric(((ui.val('a') || 0) * 100) / 255, 4))
  }
  /**
  * @param {external:jQuery} ui
  * @returns {void}
  */
  function expandableColorChanged (ui) {
    const hex = ui.val('hex')
    const va = ui.val('va')
    iconColor.style.backgroundColor = (hex && '#' + hex) || 'transparent'
    setAlpha.call(that, iconAlpha, toFixedNumeric(((255 - ((va && va.a) || 0)) * 100) / 255, 4))
    if (settings.window.bindToInput && settings.window.updateInputColor) {
      settings.window.input.style.backgroundColor = (hex && '#' + hex) || 'transparent'
      settings.window.input.style.color = isNullish(va) || va.v > 75 ? '#000000' : '#ffffff'
    }
  }
  /**
  * @param {Event} e
  * @returns {void}
  */
  function moveBarMouseDown (e) {
    elementStartX = Number.parseInt(container.style.left)
    elementStartY = Number.parseInt(container.style.top)
    pageStartX = e.pageX
    pageStartY = e.pageY
    // bind events to document to move window - we will unbind these on mouseup
    document.addEventListener('mousemove', documentMouseMove)
    document.addEventListener('mouseup', documentMouseUp)
    e.preventDefault() // prevent attempted dragging of the column
  }
  /**
  * @param {Event} e
  * @returns {false}
  */
  function documentMouseMove (e) {
    container.style.left = elementStartX - (pageStartX - e.pageX) + 'px'
    container.style.top = elementStartY - (pageStartY - e.pageY) + 'px'
    if (settings.window.expandable) {
      const prev = container.previousElementSibling
      prev.style.left = container.style.left
      prev.style.top = container.style.top
    }
    e.stopPropagation()
    e.preventDefault()
    return false
  }
  /**
  * @param {Event} e
  * @returns {false}
  */
  function documentMouseUp (e) {
    document.removeEventListener('mousemove', documentMouseMove)
    document.removeEventListener('mouseup', documentMouseUp)
    e.stopPropagation()
    e.preventDefault()
    return false
  }
  /**
  * @param {Event} e
  * @returns {false}
  */
  function quickPickClicked (e) {
    e.preventDefault()
    e.stopPropagation()
    color.active.val('ahex', e.target.getAttribute('title') || null, e.target)
    return false
  }
  /**
  *
  * @returns {void}
  */
  function show () {
    color.current.val('ahex', color.active.val('ahex'))
    /**
    *
    * @returns {void}
    */
    function attachIFrame () {
      if (!settings.window.expandable) return
      const table = container.querySelector('#jPicker-table')
      container.insertAdjacentElement('beforebegin', document.createElement('iframe'))
      const pELem = container.previousElementSibling
      pELem.style.width = parseFloat(getComputedStyle(table, null).width.replace('px', ''))
      pELem.style.height = parseFloat(getComputedStyle(container, null).height.replace('px', ''))
      pELem.style.opacity = 0
      pELem.style.position = 'absolute'
      pELem.style.left = getComputedStyle(container, null).getPropertyValue('left')
      pELem.style.top = getComputedStyle(container, null).getPropertyValue('top')
    }
    if (settings.window.expandable) {
      container.style.zIndex = 20
    }
    container.style.display = 'block'
    attachIFrame()
    /* switch (settings.window.effects.type) {
    case 'fade':
      container.fadeIn(settings.window.effects.speed.show, attachIFrame);
      break;
    case 'slide':
      container.slideDown(settings.window.effects.speed.show, attachIFrame);
      break;
    case 'show':
    default:
      container.show(settings.window.effects.speed.show, attachIFrame);
      break;
    } */
  }
  /**
  *
  * @returns {void}
  */
  function hide () {
    /**
    *
    * @returns {void}
    */
    function removeIFrame () {
      if (settings.window.expandable) container.style.zIndex = 10
      if (!settings.window.expandable) return
      container.prev().remove()
    }
    container.style.display = 'none'
    removeIFrame()
    /* switch (settings.window.effects.type) {
    case 'fade':
      container.fadeOut(settings.window.effects.speed.hide, removeIFrame);
      break;
    case 'slide':
      container.slideUp(settings.window.effects.speed.hide, removeIFrame);
      break;
    case 'show':
    default:
      container.hide(settings.window.effects.speed.hide, removeIFrame);
      break;
    } */
  }
  /**
  *
  * @returns {void}
  */
  function initialize () {
    const nexts = that.nextElementSibling
    const win = settings.window
    const popup = win.expandable ? nexts.querySelector('#Container') : null
    container = win.expandable ? document.createElement('div') : that
    container.classList.add('jPicker')
    container.classList.add('Container')
    if (win.expandable) container.style.display = 'none'
    container.onselectstart = function (e) {
      if (e.target.nodeName.toLowerCase() !== 'input') return false
      return true
    }
    // inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
    // this control really is tabular data, so I believe it is the right move
    const all = color.active.val('all')
    if (win.alphaPrecision < 0) win.alphaPrecision = 0
    else if (win.alphaPrecision > 2) win.alphaPrecision = 2
    const controlHtml = `<table class="jPicker" id="jPicker-table" cellpadding="0" cellspacing="0">
      <tbody>
        ${win.expandable ? '<tr><td class="Move" colspan="5">&nbsp;</td></tr>' : ''}
        <tr>
          <td rowspan="9"><h2 class="Title">${win.title || 'config.jpicker_title'}</h2><div class="Map" id="Map"><span class="Map1" id="MMap1">&nbsp;</span><span class="Map2" id="MMap2">&nbsp;</span><span class="Map3" id="MMap3">&nbsp;</span><img src="${images.clientPath + images.colorMap.arrow.file}" class="Arrow"/></div></td>
          <td rowspan="9"><div class="Bar" id="Bar"><span class="Map1" id="Map1">&nbsp;</span><span class="Map2" id="Map2">&nbsp;</span><span class="Map3" id="Map3">&nbsp;</span><span class="Map4" id="Map4">&nbsp;</span><span class="Map5" id="Map5">&nbsp;</span><span class="Map6" id="Map6">&nbsp;</span><img src="${images.clientPath + images.colorBar.arrow.file}" class="Arrow"/></div></td>
          <td colspan="2" class="Preview" id="Preview">${i18next.t('config.jpicker_new_color')}<div id="preview-div"><span class="Active" id="Active" title="${i18next.t('config.jpicker_tooltip_colors_new_color')}">&nbsp;</span><span class="Current" id="Current" title="${i18next.t('config.jpicker_tooltip_colors_current_color')}">&nbsp;</span></div>${i18next.t('config.jpicker_current_color')}</td>
          <td rowspan="9" class="Button" id="Button"><input type="button" class="Ok" id="Ok" value="${i18next.t('common.ok')}" title="${i18next.t('config.jpicker_tooltip_buttons_ok')}"/><input type="button" class="Cancel" id="Cancel" value="${i18next.t('common.cancel')}" title="${i18next.t('config.jpicker_tooltip_buttons_cancel')}"/><hr/><div class="Grid" id="Grid"></div></td>
        </tr>
        <tr class="Hue">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_hue_radio')}"><input type="radio" value="h"${settings.color.mode === 'h' ? ' checked="checked"' : ''}/>H:</label></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.h : ''}" title="${i18next.t('config.jpicker_tooltip_hue_textbox')}"/>&nbsp;&deg;</td>
        </tr>
        <tr class="Saturation">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_saturation_radio')}"><input type="radio" value="s"${settings.color.mode === 's' ? ' checked="checked"' : ''}/>S:</label></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.s : ''}" title="${i18next.t('config.jpicker_tooltip_saturation_textbox')}"/>&nbsp;%</td>
        </tr>
        <tr class="Value">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_value_radio')}"><input type="radio" value="v"${settings.color.mode === 'v' ? ' checked="checked"' : ''}/>V:</label><br/><br/></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.v : ''}" title="${i18next.t('config.jpicker_tooltip_value_textbox')}"/>&nbsp;%<br/><br/></td>
        </tr>
        <tr class="Red">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_red_radio')}"><input type="radio" value="r"${settings.color.mode === 'r' ? ' checked="checked"' : ''}/>R:</label></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.r : ''}" title="${i18next.t('config.jpicker_tooltip_red_textbox')}"/></td>
        </tr>
        <tr class="Green">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_green_radio')}"><input type="radio" value="g"${settings.color.mode === 'g' ? ' checked="checked"' : ''}/>G:</label></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.g : ''}" title="${i18next.t('config.jpicker_tooltip_green_textbox')}"/></td>
        </tr>
        <tr class="Blue">
          <td class="Radio"><label title="${i18next.t('config.jpicker_tooltip_blue_radio')}"><input type="radio" value="b"${settings.color.mode === 'b' ? ' checked="checked"' : ''}/>B:</label></td>
          <td class="Text"><input type="text" maxlength="3" value="${all ? all.b : ''}" title="${i18next.t('config.jpicker_tooltip_blue_textbox')}"/></td>
        </tr>
        <tr class="Alpha">
          <td class="Radio">${win.alphaSupport ? `<label title="${i18next.t('config.jpicker_tooltip_alpha_radio')}"><input type="radio" value="a"${settings.color.mode === 'a' ? ' checked="checked"' : ''}/>A:</label>` : '&nbsp;'}</td>
          <td class="Text">${win.alphaSupport ? `<input type="text" maxlength="${3 + win.alphaPrecision}" value="${all ? toFixedNumeric((all.a * 100) / 255, win.alphaPrecision) : ''}" title="${i18next.t('config.jpicker_tooltip_alpha_textbox')}"/>&nbsp;%` : '&nbsp;'}</td>
        </tr>
        <tr class="Hex">
          <td colspan="2" class="Text"><label title="${i18next.t('config.jpicker_tooltip_hex_textbox')}">#:<input type="text" maxlength="6" class="Hex" value="${all ? all.hex : ''}"/></label>${win.alphaSupport ? `<input type="text" maxlength="2" class="AHex" value="${all ? all.ahex.substring(6) : ''}" title="${i18next.t('config.jpicker_tooltip_hex_alpha')}"/></td>` : '&nbsp;'}
        </tr>
      </tbody></table>`
    if (win.expandable) {
      container.innerHTML = controlHtml
      if (!that.querySelectorAll('div.jPicker.Container').length) {
        document.body.insertBefore(container, document.body.firstChild)
      } else {
        that.querySelector('div.jPicker.Container:last').insertAdjacentElement('afterend', container)
      }
      container.addEventListener('mousedown', function () {
        container.style.zIndex = 20
      })
      const poslt = findPos(popup)
      container.style.position = 'absolute'
      container.style.left =
        win.position.x === 'left'
          ? (poslt.left - 530 - (win.position.y === 'center' ? 25 : 0)) + 'px'
          : win.position.x === 'center'
            ? (poslt.left - 260) + 'px'
            : win.position.x === 'right'
              ? (poslt.left - 10 + (win.position.y === 'center' ? 25 : 0)) + 'px'
              : win.position.x === 'screenCenter'
                ? ((document.width >> 1) - 260) + 'px'
                : (poslt.left + Number.parseInt(win.position.x)) + 'px'
      container.style.top =
        win.position.y === 'top'
          ? (poslt.top - 312) + 'px'
          : win.position.y === 'center'
            ? (poslt.top - 156) + 'px'
            : win.position.y === 'bottom'
              ? (poslt.top + 25) + 'px'
              : (poslt.top + Number.parseInt(win.position.y)) + 'px'
    } else {
      container = that
      const newDiv = document.createElement('div')
      newDiv.innerHTML = controlHtml
      while (newDiv.children.length > 0) {
        container.appendChild(newDiv.children[0])
      }
    }
    // initialize the objects to the source code just injected
    const tbody = container.querySelector('tbody')
    colorMapDiv = tbody.querySelector('#Map')
    colorBarDiv = tbody.querySelector('#Bar')
    colorMapL1 = colorMapDiv.querySelector('#MMap1')
    colorMapL2 = colorMapDiv.querySelector('#MMap2')
    colorMapL3 = colorMapDiv.querySelector('#MMap3')
    colorBarL1 = colorBarDiv.querySelector('#Map1')
    colorBarL2 = colorBarDiv.querySelector('#Map2')
    colorBarL3 = colorBarDiv.querySelector('#Map3')
    colorBarL4 = colorBarDiv.querySelector('#Map4')
    colorBarL5 = colorBarDiv.querySelector('#Map5')
    colorBarL6 = colorBarDiv.querySelector('#Map6')
    // create color pickers and maps
    colorMap = new Slider(
      colorMapDiv,
      {
        map: {
          width: images.colorMap.width,
          height: images.colorMap.height
        },
        arrow: {
          image: images.clientPath + images.colorMap.arrow.file,
          width: images.colorMap.arrow.width,
          height: images.colorMap.arrow.height
        }
      }
    )
    colorMap.bind(mapValueChanged)
    colorBar = new Slider(
      colorBarDiv,
      {
        map: {
          width: images.colorBar.width,
          height: images.colorBar.height
        },
        arrow: {
          image: images.clientPath + images.colorBar.arrow.file,
          width: images.colorBar.arrow.width,
          height: images.colorBar.arrow.height
        }
      }
    )
    colorBar.bind(colorBarValueChanged)
    colorPicker = new ColorValuePicker(
      tbody,
      color.active,
      win.expandable && win.bindToInput ? win.input : null,
      win.alphaPrecision
    )
    const hex = all ? all.hex : null
    const preview = tbody.querySelector('#Preview')
    const button = tbody.querySelector('#Button')
    activePreview = preview.querySelector('#Active')
    activePreview.style.backgroundColor = (hex) ? '#' + hex : 'transparent'
    currentPreview = preview.querySelector('#Current')
    currentPreview.style.backgroundColor = (hex) ? '#' + hex : 'transparent'
    svgEditor.$click(currentPreview, currentClicked)
    setAlpha.call(that, currentPreview, toFixedNumeric((color.current.val('a') * 100) / 255, 4))
    okButton = button.querySelector('#Ok')
    svgEditor.$click(okButton, okClicked)
    cancelButton = button.querySelector('#Cancel')
    svgEditor.$click(cancelButton, cancelClicked)
    grid = button.querySelector('#Grid')
    setTimeout(function () {
      setImg.call(that, colorMapL1, images.clientPath + 'Maps.png')
      setImg.call(that, colorMapL2, images.clientPath + 'Maps.png')
      setImg.call(that, colorMapL3, images.clientPath + 'map-opacity.png')
      setImg.call(that, colorBarL1, images.clientPath + 'Bars.png')
      setImg.call(that, colorBarL2, images.clientPath + 'Bars.png')
      setImg.call(that, colorBarL3, images.clientPath + 'Bars.png')
      setImg.call(that, colorBarL4, images.clientPath + 'Bars.png')
      setImg.call(that, colorBarL5, images.clientPath + 'bar-opacity.png')
      setImg.call(that, colorBarL6, images.clientPath + 'AlphaBar.png')
      setImg.call(that, preview.querySelector('#preview-div'), images.clientPath + 'preview-opacity.png')
    }, 0)
    const radioInputs = tbody.querySelectorAll('td.Radio input')
    for (const radioInput of radioInputs) {
      svgEditor.$click(radioInput, radioClicked)
    }
    // initialize quick list
    if (color.quickList && color.quickList.length > 0) {
      let html = ''
      for (let i = 0; i < color.quickList.length; i++) {
        /* if default colors are hex strings, change them to color objects */
        if ((typeof (color.quickList[i])).toString().toLowerCase() === 'string') {
          color.quickList[i] = new Color({ hex: color.quickList[i] })
        }
        const alpha = color.quickList[i].val('a')
        let ahex = color.quickList[i].val('ahex')
        if (!win.alphaSupport && ahex) ahex = ahex.substring(0, 6) + 'ff'
        const quickHex = color.quickList[i].val('hex')
        if (!ahex) ahex = '00000000'
        html += '<span class="QuickColor"' + (' title="#' + ahex + '"') + ' style="background-color:' + ((quickHex && '#' + quickHex) || '') + ';' + (quickHex ? '' : 'background-image:url(' + images.clientPath + 'NoColor.png)') + (win.alphaSupport && alpha && alpha < 255 ? ';opacity:' + toFixedNumeric(alpha / 255, 4) + ';filter:Alpha(opacity=' + toFixedNumeric(alpha / 2.55, 4) + ')' : '') + '">&nbsp;</span>'
      }
      setImg.call(that, grid, images.clientPath + 'bar-opacity.png')
      const div = document.createElement('div')
      div.innerHTML = html
      while (div.children.length > 0) {
        grid.appendChild(div.children[0])
      }
      // grid.html(html);
      const QuickColorSels = grid.querySelectorAll('.QuickColor')
      for (const QuickColorSel of QuickColorSels) {
        svgEditor.$click(QuickColorSel, quickPickClicked)
      }
    }
    setColorMode.call(that, settings.color.mode)
    color.active.bind(activeColorChanged)
    typeof liveCallback === 'function' && color.active.bind(liveCallback)
    color.current.bind(currentColorChanged)
    // bind to input
    if (win.expandable) {
      that.icon = popup.parentNode
      iconColor = that.icon.querySelector('.Color')
      iconColor.style.backgroundColor = (hex && '#' + hex) || 'transparent'
      iconAlpha = that.icon.querySelector('.Alpha')
      setImg.call(that, iconAlpha, images.clientPath + 'bar-opacity.png')
      setAlpha.call(that, iconAlpha, toFixedNumeric(((255 - (all ? all.a : 0)) * 100) / 255, 4))
      iconImage = that.icon.querySelector('.Image')
      iconImage.style.backgroundImage = 'url(\'' + images.clientPath + images.picker.file + '\')'
      svgEditor.$click(iconImage, iconImageClicked)
      if (win.bindToInput && win.updateInputColor) {
        win.input.style.backgroundColor = (hex && '#' + hex) || 'transparent'
        win.input.style.color = isNullish(all) || all.v > 75 ? '#000000' : '#ffffff'
      }
      moveBar = tbody.querySelector('.Move')
      moveBar.addEventListener('mousedown', moveBarMouseDown)
      color.active.bind(expandableColorChanged)
    } else {
      show.call(that)
    }
  }
  /**
  *
  * @returns {void}
  */
  function destroy () {
    const radioInputs = container.querySelectorAll('td.Radio input')
    for (const radioInput of radioInputs) {
      radioInput.removeEventListener('click', radioClicked)
    }
    currentPreview.removeEventListener('click', currentClicked)
    cancelButton.removeEventListener('click', cancelClicked)
    okButton.removeEventListener('click', okClicked)
    if (settings.window.expandable) {
      iconImage.removeEventListener('click', iconImageClicked)
      moveBar.removeEventListener('mousedown', moveBarMouseDown)
      that.icon = null
    }
    const jqQuickColors = container.querySelectorAll('.QuickColor')
    for (const jqQuickColor of jqQuickColors) {
      jqQuickColor.removeEventListener('click', quickPickClicked)
    }
    colorMapDiv = null
    colorBarDiv = null
    colorMapL1 = null
    colorMapL2 = null
    colorMapL3 = null
    colorBarL1 = null
    colorBarL2 = null
    colorBarL3 = null
    colorBarL4 = null
    colorBarL5 = null
    colorBarL6 = null
    colorMap.destroy()
    colorMap = null
    colorBar.destroy()
    colorBar = null
    colorPicker.destroy()
    colorPicker = null
    activePreview = null
    currentPreview = null
    okButton = null
    cancelButton = null
    grid = null
    commitCallback = null
    cancelCallback = null
    liveCallback = null
    container.html('')
    for (let i = 0; i < List.length; i++) {
      if (List[i] === that) {
        List.splice(i, 1)
        i-- // Decrement to ensure we don't miss next item (lgtm warning)
      }
    }
  }
  const { images } = settings // local copies for YUI compressor
  const color = {
    active: (typeof settings.color.active).toString().toLowerCase() === 'string'
      ? new Color({
        ahex: !settings.window.alphaSupport && settings.color.active
          ? settings.color.active.substring(0, 6) + 'ff'
          : settings.color.active
      })
      : new Color({
        ahex: !settings.window.alphaSupport &&
          settings.color.active.val('ahex')
          ? settings.color.active.val('ahex').substring(0, 6) + 'ff'
          : settings.color.active.val('ahex')
      }),
    current: (typeof settings.color.active).toString().toLowerCase() === 'string'
      ? new Color({
        ahex: !settings.window.alphaSupport && settings.color.active
          ? settings.color.active.substring(0, 6) + 'ff'
          : settings.color.active
      })
      : new Color({
        ahex: !settings.window.alphaSupport &&
          settings.color.active.val('ahex')
          ? settings.color.active.val('ahex').substring(0, 6) + 'ff'
          : settings.color.active.val('ahex')
      }),
    quickList: settings.color.quickList
  }

  if (typeof commitCallback !== 'function') {
    commitCallback = null
  }
  if (typeof liveCallback !== 'function') {
    liveCallback = null
  }
  if (typeof cancelCallback !== 'function') {
    cancelCallback = null
  }

  let elementStartX = null // Used to record the starting css positions for dragging the control
  let elementStartY = null
  let pageStartX = null // Used to record the mousedown coordinates for dragging the control
  let pageStartY = null
  let container = null
  let colorMapDiv = null
  let colorBarDiv = null
  let colorMapL1 = null // different layers of colorMap and colorBar
  let colorMapL2 = null
  let colorMapL3 = null
  let colorBarL1 = null
  let colorBarL2 = null
  let colorBarL3 = null
  let colorBarL4 = null
  let colorBarL5 = null
  let colorBarL6 = null
  let colorMap = null // color maps
  let colorBar = null
  let colorPicker = null
  let activePreview = null // color boxes above the radio buttons
  let currentPreview = null
  let okButton = null
  let cancelButton = null
  let grid = null // preset colors grid
  let iconColor = null // iconColor for popup icon
  let iconAlpha = null // iconAlpha for popup icon
  let iconImage = null // iconImage popup icon
  let moveBar = null // drag bar
  Object.assign(that, {
    // public properties, methods, and callbacks
    commitCallback, // commitCallback function can be overridden to return the selected color to a method you specify when the user clicks "OK"
    liveCallback, // liveCallback function can be overridden to return the selected color to a method you specify in live mode (continuous update)
    cancelCallback, // cancelCallback function can be overridden to a method you specify when the user clicks "Cancel"
    color,
    show,
    hide,
    destroy // destroys this control entirely, removing all events and objects, and removing itself from the List
  })
  List.push(that)
  setTimeout(function () {
    initialize.call(that)
  }, 0)
}
/**
* @typedef {PlainObject} external:jQuery.fn.jPickerOptionsIconInfo
* @property {string} file Color Map/Color Bar/Color Picker arrow icon
* @property {Float} width
* @property {Float} height
*/
/**
* @typedef {PlainObject} external:jQuery.fn.jPickerOptionsImagesDimensionsArrow
* @property {Float} width
* @property {Float} height
* @property {external:jQuery.fn.jPickerOptionsIconInfo} arrow
*/
/**
* @typedef {PlainObject} external:jQuery.fn.jPickerOptionsRadioTextboxLocale
* @property {string} radio
* @property {string} textbox
*/
/**
* @typedef {PlainObject} external:jQuery.fn.jPickerOptions
* @property {PlainObject} window
* @property {string|null} window.title Any title for the jPicker window itself - displays
* "Drag Markers To Pick A Color" if left null
* @property {PlainObject} window.effects
* @property {"slide"|"show"|"fade"} window.effects.type Effect used to show/hide an expandable picker
* @property {PlainObject} window.effects.speed
* @property {"fast"|"slow"|Float} window.effects.speed.show Duration of "show" effect. Time in milliseconds.
* @property {"fast"|"slow"|Float} window.effects.speed.hide Duration of "hide" effect. Time in milliseconds
* @property {PlainObject} window.position
* @property {"left"|"center"|"right"|"screenCenter"|Float} window.position.x Relative px value
* @property {"top"|"bottom"|"center"|Float} window.position.y Relative px value
* @property {boolean} window.expandable Defaults to large static picker - set to `true` to make an expandable
* picker (small icon with popup) - set automatically when binded to input element; added by `$.fn.jPicker`
* @property {boolean} window.liveUpdate Set `false` if you want the user to have to click "OK" before the
* binded input box updates values (always `true` for expandable picker)
* @property {boolean} window.alphaSupport Set to `true` to enable alpha picking
* @property {Float} window.alphaPrecision Set decimal precision for alpha percentage display - hex codes do
* not map directly to percentage integers - range 0-2
* @property {boolean} window.updateInputColor Set to `false` to prevent binded input colors from changing
* @property {boolean} [window.bindToInput] Added by `$.fn.jPicker`
* @property {external:jQuery} [window.input] Added by `$.fn.jPicker`
* @property {PlainObject} color
* @property {"h"|"s"|"v"|"r"|"g"|"b"|"a"} color.mode Symbols stand for "h" (hue), "s" (saturation), "v" (value), "r" (red), "g" (green), "b" (blue), "a" (alpha)
* @property {Color|string} color.active Strings are HEX values (e.g. #ffc000) WITH OR WITHOUT the "#" prefix
* @property {Color[]|string[]} color.quickList The quick pick color list
* Strings are HEX values (e.g. #ffc000) WITH OR WITHOUT the "#" prefix
* @property {PlainObject} images
* @property {string} images.clientPath Path to image files
* @property {external:jQuery.fn.jPickerOptionsImagesDimensionsArrow} images.colorMap
* @property {external:jQuery.fn.jPickerOptionsImagesDimensionsArrow} images.colorBar
* @property {external:jQuery.fn.jPickerOptionsIconInfo} images.picker
* @property {PlainObject} localization alter these to change the text presented by the picker (e.g. different language)
* @property {PlainObject} localization.text
* @property {string} localization.text.title
* @property {string} localization.text.newColor
* @property {string} localization.text.currentColor
* @property {string} localization.text.ok
* @property {string} localization.text.cancel
* @property {PlainObject} localization.tooltips
* @property {PlainObject} localization.tooltips.colors
* @property {string} localization.tooltips.colors.newColor
* @property {string} localization.tooltips.colors.currentColor
* @property {PlainObject} localization.tooltips.buttons
* @property {string} localization.tooltips.buttons.ok
* @property {string} localization.tooltips.buttons.cancel
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.hue
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.saturation
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.value
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.red
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.green
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.blue
* @property {external:jQuery.fn.jPickerOptionsRadioTextboxLocale} localization.tooltips.alpha
* @property {PlainObject} localization.tooltips.hex
* @property {string} localization.tooltips.hex.textbox
* @property {string} localization.tooltips.hex.alpha
*/
/**
* The jPicker defaults - you can change anything in this section (such as the
* clientPath to your images) without fear of breaking the program.
* @namespace {external:jQuery.fn.jPickerOptions} defaults
* @memberof external:jQuery.fn.$.fn.jPicker
* @borrows external:jQuery.fn.jPickerOptions as external:jQuery.fn.jPicker.defaults
* @see Source for all of the values
*/
export const jPickerDefaults = {
  window: {
    title: null,
    effects: {
      type: 'slide',
      speed: {
        show: 'slow',
        hide: 'fast'
      }
    },
    position: {
      x: 'screenCenter',
      y: 'top'
    },
    expandable: false,
    liveUpdate: true,
    alphaSupport: false,
    alphaPrecision: 0,
    updateInputColor: true
  },
  color: {
    mode: 'h',
    active: new Color({ ahex: '#ffcc00ff' }),
    quickList: [
      new Color({ h: 360, s: 33, v: 100 }),
      new Color({ h: 360, s: 66, v: 100 }),
      new Color({ h: 360, s: 100, v: 100 }),
      new Color({ h: 360, s: 100, v: 75 }),
      new Color({ h: 360, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 100 }),
      new Color({ h: 30, s: 33, v: 100 }),
      new Color({ h: 30, s: 66, v: 100 }),
      new Color({ h: 30, s: 100, v: 100 }),
      new Color({ h: 30, s: 100, v: 75 }),
      new Color({ h: 30, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 90 }),
      new Color({ h: 60, s: 33, v: 100 }),
      new Color({ h: 60, s: 66, v: 100 }),
      new Color({ h: 60, s: 100, v: 100 }),
      new Color({ h: 60, s: 100, v: 75 }),
      new Color({ h: 60, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 80 }),
      new Color({ h: 90, s: 33, v: 100 }),
      new Color({ h: 90, s: 66, v: 100 }),
      new Color({ h: 90, s: 100, v: 100 }),
      new Color({ h: 90, s: 100, v: 75 }),
      new Color({ h: 90, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 70 }),
      new Color({ h: 120, s: 33, v: 100 }),
      new Color({ h: 120, s: 66, v: 100 }),
      new Color({ h: 120, s: 100, v: 100 }),
      new Color({ h: 120, s: 100, v: 75 }),
      new Color({ h: 120, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 60 }),
      new Color({ h: 150, s: 33, v: 100 }),
      new Color({ h: 150, s: 66, v: 100 }),
      new Color({ h: 150, s: 100, v: 100 }),
      new Color({ h: 150, s: 100, v: 75 }),
      new Color({ h: 150, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 50 }),
      new Color({ h: 180, s: 33, v: 100 }),
      new Color({ h: 180, s: 66, v: 100 }),
      new Color({ h: 180, s: 100, v: 100 }),
      new Color({ h: 180, s: 100, v: 75 }),
      new Color({ h: 180, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 40 }),
      new Color({ h: 210, s: 33, v: 100 }),
      new Color({ h: 210, s: 66, v: 100 }),
      new Color({ h: 210, s: 100, v: 100 }),
      new Color({ h: 210, s: 100, v: 75 }),
      new Color({ h: 210, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 30 }),
      new Color({ h: 240, s: 33, v: 100 }),
      new Color({ h: 240, s: 66, v: 100 }),
      new Color({ h: 240, s: 100, v: 100 }),
      new Color({ h: 240, s: 100, v: 75 }),
      new Color({ h: 240, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 20 }),
      new Color({ h: 270, s: 33, v: 100 }),
      new Color({ h: 270, s: 66, v: 100 }),
      new Color({ h: 270, s: 100, v: 100 }),
      new Color({ h: 270, s: 100, v: 75 }),
      new Color({ h: 270, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 10 }),
      new Color({ h: 300, s: 33, v: 100 }),
      new Color({ h: 300, s: 66, v: 100 }),
      new Color({ h: 300, s: 100, v: 100 }),
      new Color({ h: 300, s: 100, v: 75 }),
      new Color({ h: 300, s: 100, v: 50 }),
      new Color({ h: 180, s: 0, v: 0 }),
      new Color({ h: 330, s: 33, v: 100 }),
      new Color({ h: 330, s: 66, v: 100 }),
      new Color({ h: 330, s: 100, v: 100 }),
      new Color({ h: 330, s: 100, v: 75 }),
      new Color({ h: 330, s: 100, v: 50 }),
      new Color()
    ]
  },
  images: {
    clientPath: '/jPicker/images/',
    colorMap: {
      width: 256,
      height: 256,
      arrow: {
        file: 'mappoint.gif',
        width: 15,
        height: 15
      }
    },
    colorBar: {
      width: 20,
      height: 256,
      arrow: {
        file: 'rangearrows.gif',
        width: 20,
        height: 7
      }
    },
    picker: {
      file: 'picker.gif',
      width: 25,
      height: 24
    }
  }
}
