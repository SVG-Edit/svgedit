/* globals $ */
/* eslint-disable unicorn/prefer-math-trunc */
/* eslint-disable no-bitwise */
/* eslint-disable class-methods-use-this */
/* eslint-disable node/no-unpublished-import */
import 'elix/define/PopupButton.js';
import PaintBox from './PaintBox.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  @import "./components/jgraduate/css/jGraduate.css";
  @import "./components/jgraduate/css/jPicker.css";
  #logo {
    height: 18px;
    width: 18px;
  }
  #block {
    height: 13px;
    width: 14px;
    float: right;
    background-color: darkgrey;
  }
  #picker {
    background: var(--input-color);
    height: 19px;
    line-height: 19px;
    border-radius: 3px;
    width: 52px;
    display: flex;
    align-items: center;
    margin-right: 4px;
    margin-top: 1px;
    justify-content: space-evenly;
  }
  #color_picker {
    z-index: 1000;
    top: -350px;
  }
  .popup {
    height: 420px;
    max-height: 100%;
    max-width: 100%;
    width: 645px;
  }
  </style>
  <elix-popup-button popup-position="above">
    <div id="picker" slot="source">
        <img src="./images/logo.svg" alt="icon" id="logo">
        <label for="color" title="Change xxx color" id="label"></label>
        <div id="block">
        </div>
    </div>
    <!-- hidden div -->
    <div id="color_picker" class="popup"> 
      <ul class="jGraduate_tabs">
        <li class="jGraduate_tab_color se-tabs jGraduate_tab_current" data-section="se-color-pick" data-type="col">
          Solid Color
        </li>
        <li class="jGraduate_tab_lingrad se-tabs" data-section="se-lingrad-pick" data-type="lg">
          Linear Gradient
        </li>
        <li class="jGraduate_tab_radgrad se-tabs" data-section="se-radgrad-pick" data-type="rg">
          Radial Gradient
        </li>
      </ul>
      <div class="jGraduate_colPick" id="se-color-pick"></div>
      <div class="jGraduate_gradPick" id="se-lingrad-pick">
        <!-- jGraduate_gradPick starrt -->
        <div id="color_picker_jGraduate_Swatch" class="jGraduate_Swatch">
          <h2 class="jGraduate_Title"> $settings.window.pickerTitle + </h2>
          <div id="color_picker_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>
          <div id="color_picker_jGraduate_StopSlider" class="jGraduate_StopSlider"></div>
        </div>
        <div class="jGraduate_Form jGraduate_Points jGraduate_lg_field">
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Begin Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_x1" size="3" title="Enter starting x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_y1" size="3" title="Enter starting y value between 0.0 and 1.0"/>
            </div>
          </div>
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">End Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_x2" size="3" title="Enter ending x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_y2" size="3" title="Enter ending y value between 0.0 and 1.0"/>
            </div>
          </div>
        </div>
        <div class="jGraduate_Form jGraduate_Points jGraduate_rg_field">
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Center Point</label>
            <div class="jGraduate_Form_Section">
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_cx" size="3" title="Enter x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_cy" size="3" title="Enter y value between 0.0 and 1.0"/>
            </div>
          </div>
          <div class="jGraduate_StopSection">
            <label class="jGraduate_Form_Heading">Focal Point</label>
            <div class="jGraduate_Form_Section">
              <label>Match center: <input type="checkbox" checked="checked" id="color_picker_jGraduate_match_ctr"/></label><br/>
              <label>x:</label>
              <input type="text" id="color_picker_jGraduate_fx" size="3" title="Enter x value between 0.0 and 1.0"/>
              <label>y:</label>
              <input type="text" id="color_picker_jGraduate_fy" size="3" title="Enter y value between 0.0 and 1.0"/>
            </div>
          </div>
        </div>
        <div class="jGraduate_StopSection jGraduate_SpreadMethod">
          <label class="jGraduate_Form_Heading">Spread method</label>
          <div class="jGraduate_Form_Section">
            <select class="jGraduate_spreadMethod">
              <option value=pad selected>Pad</option>
              <option value=reflect>Reflect</option>
              <option value=repeat>Repeat</option>
            </select>
          </div>
        </div>
        <div class="jGraduate_Form">
          <div class="jGraduate_Slider jGraduate_RadiusField jGraduate_rg_field">
            <label class="prelabel">Radius:</label>
            <div id="color_picker_jGraduate_Radius" class="jGraduate_SliderBar jGraduate_Radius" title="Click to set radius">
              <img id="color_picker_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="./components/jgraduate/images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_RadiusInput" size="3" value="100"/>%</label>
          </div>
          <div class="jGraduate_Slider jGraduate_EllipField jGraduate_rg_field">
            <label class="prelabel">Ellip:</label>
            <div id="color_picker_jGraduate_Ellip" class="jGraduate_SliderBar jGraduate_Ellip" title="Click to set Ellip">
              <img id="color_picker_jGraduate_EllipArrows" class="jGraduate_EllipArrows" src="./components/jgraduate/images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_EllipInput" size="3" value="0"/>%</label>
          </div>
          <div class="jGraduate_Slider jGraduate_AngleField jGraduate_rg_field">
            <label class="prelabel">Angle:</label>
            <div id="color_picker_jGraduate_Angle" class="jGraduate_SliderBar jGraduate_Angle" title="Click to set Angle">
              <img id="color_picker_jGraduate_AngleArrows" class="jGraduate_AngleArrows" src="./components/jgraduate/images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_AngleInput" size="3" value="0"/>deg</label>
          </div>
          <div class="jGraduate_Slider jGraduate_OpacField">
            <label class="prelabel">Opac:</label>
            <div id="color_picker_jGraduate_Opac" class="jGraduate_SliderBar jGraduate_Opac" title="Click to set Opac">
              <img id="color_picker_jGraduate_OpacArrows" class="jGraduate_OpacArrows" src="./components/jgraduate/images/rangearrows2.gif" />
            </div>
            <label><input type="text" id="color_picker_jGraduate_OpacInput" size="3" value="100"/>%</label>
          </div>
        </div>
        <div class="jGraduate_OkCancel">
          <input type="button" id="color_picker_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>
          <input type="button" id="color_picker_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>
        </div>
        <!-- jGraduate_gradPick end -->      
      </div>
      <div class="jGraduate_LightBox" id="se-radgrad-pick">LightBox sction</div>
      <div id="color_picker_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>
    </div>
  </elix-popup-button>
`;
/**
 * Whether a value is `null` or `undefined`.
 * @param {any} val
 * @returns {boolean}
 */
const isNullish = (val) => {
  return val === null || val === undefined;
};
/**
 * @class Slider
 */
class Slider {
  /**
   * @param {external:jQuery} bar
   * @param {module:jPicker.SliderOptions} options
   */
  constructor (bar, options) {
    const that = this;
    /**
     * Fire events on the supplied `context`
     * @param {module:jPicker.JPickerInit} context
     * @returns {void}
     */
    function fireChangeEvents (context) {
      changeEvents.forEach((changeEvent) => {
        changeEvent.call(that, that, context);
      });
    }

    /**
     * Bind the mousedown to the bar not the arrow for quick snapping to the clicked location.
     * @param {external:jQuery.Event} e
     * @returns {void}
     */
    function mouseDown (e) {
      const off = bar.offset();
      offset = {l: off.left | 0, t: off.top | 0};
      clearTimeout(timeout);
      // using setTimeout for visual updates - once the style is updated the browser will re-render internally allowing the next Javascript to run
      timeout = setTimeout(function () {
        setValuesFromMousePosition.call(that, e);
      }, 0);
      // Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
      $(document).bind('mousemove', mouseMove).bind('mouseup', mouseUp);
      e.preventDefault(); // don't try to select anything or drag the image to the desktop
    }
    /**
     * Set the values as the mouse moves.
     * @param {external:jQuery.Event} e
     * @returns {false}
     */
    function mouseMove (e) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        setValuesFromMousePosition.call(that, e);
      }, 0);
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    /**
     * Unbind the document events - they aren't needed when not dragging.
     * @param {external:jQuery.Event} e
     * @returns {false}
     */
    function mouseUp (e) {
      $(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
      e.stopPropagation();
      e.preventDefault();
      return false;
    }

    /**
     * Calculate mouse position and set value within the current range.
     * @param {Event} e
     * @returns {void}
     */
    function setValuesFromMousePosition (e) {
      const barW = bar.w, // local copies for YUI compressor
        barH = bar.h;
      let locX = e.pageX - offset.l,
        locY = e.pageY - offset.t;
      // keep the arrow within the bounds of the bar
      if (locX < 0) locX = 0;
      else if (locX > barW) locX = barW;
      if (locY < 0) locY = 0;
      else if (locY > barH) locY = barH;
      val.call(that, 'xy', {
        x: ((locX / barW) * rangeX) + minX,
        y: ((locY / barH) * rangeY) + minY
      });
    }
    /**
     *
     * @returns {void}
     */
    function draw () {
      const
        barW = bar.w,
        barH = bar.h,
        arrowW = arrow.w,
        arrowH = arrow.h;
      let arrowOffsetX = 0,
        arrowOffsetY = 0;
      setTimeout(function () {
        if (rangeX > 0) { // range is greater than zero
          // constrain to bounds
          arrowOffsetX = (x === maxX) ? barW : (((x / rangeX) * barW) | 0);
        }
        if (rangeY > 0) { // range is greater than zero
          // constrain to bounds
          arrowOffsetY = (y === maxY) ? barH : ((y / rangeY) * barH) | 0;
        }
        // if arrow width is greater than bar width, center arrow and prevent horizontal dragging
        if (arrowW >= barW) arrowOffsetX = (barW >> 1) - (arrowW >> 1); // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
        else arrowOffsetX -= arrowW >> 1;
        // if arrow height is greater than bar height, center arrow and prevent vertical dragging
        if (arrowH >= barH) arrowOffsetY = (barH >> 1) - (arrowH >> 1);
        else arrowOffsetY -= arrowH >> 1;
        // set the arrow position based on these offsets
        arrow.css({left: arrowOffsetX + 'px', top: arrowOffsetY + 'px'});
      });
    }

    /**
     * Get or set a value.
     * @param {?("xy"|"x"|"y")} name
     * @param {module:math.XYObject} value
     * @param {module:jPicker.Slider} context
     * @returns {module:math.XYObject|Float|void}
     */
    function val (name, value, context) {
      const set = value !== undefined;
      if (!set) {
        if (isNullish(name)) name = 'xy';
        switch (name.toLowerCase()) {
        case 'x': return x;
        case 'y': return y;
        case 'xy':
        default: return {x, y};
        }
      }
      if (!isNullish(context) && context === that) return undefined;
      let changed = false;

      let newX, newY;
      if (isNullish(name)) name = 'xy';
      switch (name.toLowerCase()) {
      case 'x':
        newX = (value && ((value.x && value.x | 0) || value | 0)) || 0;
        break;
      case 'y':
        newY = (value && ((value.y && value.y | 0) || value | 0)) || 0;
        break;
      case 'xy':
      default:
        newX = (value && value.x && value.x | 0) || 0;
        newY = (value && value.y && value.y | 0) || 0;
        break;
      }
      if (!isNullish(newX)) {
        if (newX < minX) newX = minX;
        else if (newX > maxX) newX = maxX;
        if (x !== newX) {
          x = newX;
          changed = true;
        }
      }
      if (!isNullish(newY)) {
        if (newY < minY) newY = minY;
        else if (newY > maxY) newY = maxY;
        if (y !== newY) {
          y = newY;
          changed = true;
        }
      }
      changed && fireChangeEvents.call(that, context || that);
      return undefined;
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
      const set = value !== undefined;
      if (!set) {
        if (isNullish(name)) name = 'all';
        switch (name.toLowerCase()) {
        case 'minx': return minX;
        case 'maxx': return maxX;
        case 'rangex': return {minX, maxX, rangeX};
        case 'miny': return minY;
        case 'maxy': return maxY;
        case 'rangey': return {minY, maxY, rangeY};
        case 'all':
        default: return {minX, maxX, rangeX, minY, maxY, rangeY};
        }
      }
      let // changed = false,
        newMinX,
        newMaxX,
        newMinY,
        newMaxY;
      if (isNullish(name)) name = 'all';
      switch (name.toLowerCase()) {
      case 'minx':
        newMinX = (value && ((value.minX && value.minX | 0) || value | 0)) || 0;
        break;
      case 'maxx':
        newMaxX = (value && ((value.maxX && value.maxX | 0) || value | 0)) || 0;
        break;
      case 'rangex':
        newMinX = (value && value.minX && value.minX | 0) || 0;
        newMaxX = (value && value.maxX && value.maxX | 0) || 0;
        break;
      case 'miny':
        newMinY = (value && ((value.minY && value.minY | 0) || value | 0)) || 0;
        break;
      case 'maxy':
        newMaxY = (value && ((value.maxY && value.maxY | 0) || value | 0)) || 0;
        break;
      case 'rangey':
        newMinY = (value && value.minY && value.minY | 0) || 0;
        newMaxY = (value && value.maxY && value.maxY | 0) || 0;
        break;
      case 'all':
      default:
        newMinX = (value && value.minX && value.minX | 0) || 0;
        newMaxX = (value && value.maxX && value.maxX | 0) || 0;
        newMinY = (value && value.minY && value.minY | 0) || 0;
        newMaxY = (value && value.maxY && value.maxY | 0) || 0;
        break;
      }

      if (!isNullish(newMinX) && minX !== newMinX) {
        minX = newMinX;
        rangeX = maxX - minX;
      }
      if (!isNullish(newMaxX) && maxX !== newMaxX) {
        maxX = newMaxX;
        rangeX = maxX - minX;
      }
      if (!isNullish(newMinY) && minY !== newMinY) {
        minY = newMinY;
        rangeY = maxY - minY;
      }
      if (!isNullish(newMaxY) && maxY !== newMaxY) {
        maxY = newMaxY;
        rangeY = maxY - minY;
      }
      return undefined;
    }
    /**
    * @param {GenericCallback} callback
    * @returns {void}
    */
    function bind (callback) { // eslint-disable-line promise/prefer-await-to-callbacks
      if (typeof callback === 'function') changeEvents.push(callback);
    }
    /**
    * @param {GenericCallback} callback
    * @returns {void}
    */
    function unbind (callback) { // eslint-disable-line promise/prefer-await-to-callbacks
      if (typeof callback !== 'function') return;
      let i;
      while ((i = changeEvents.includes(callback))) changeEvents.splice(i, 1);
    }
    /**
    *
    * @returns {void}
    */
    function destroy () {
      // unbind all possible events and null objects
      $(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
      bar.unbind('mousedown', mouseDown);
      bar = null;
      arrow = null;
      changeEvents = null;
    }
    let offset,
      timeout,
      x = 0,
      y = 0,
      minX = 0,
      maxX = 100,
      rangeX = 100,
      minY = 0,
      maxY = 100,
      rangeY = 100,
      arrow = bar.querySelector('img'), // bar.find('img:first'), // the arrow image to drag
      changeEvents = [];
    $.extend(
      true,
      // public properties, methods, and event bindings - these we need
      //   to access from other controls
      that,
      {
        val,
        range,
        bind,
        unbind,
        destroy
      }
    );
    // initialize this control
    arrow.src = options.arrow && options.arrow.image;
    arrow.w = (options.arrow && options.arrow.width) || arrow.width();
    arrow.h = (options.arrow && options.arrow.height) || arrow.height();
    bar.w = (options.map && options.map.width) || bar.width();
    bar.h = (options.map && options.map.height) || bar.height();
    // bind mousedown event
    // bar.bind('mousedown', mouseDown);
    bind.call(that, draw);
  }
}

/**
 * Controls for all the input elements for the typing in color values.
 */
class ColorValuePicker {
  /**
   * @param {external:jQuery} picker
   * @param {external:jQuery.jPicker.Color} color
   * @param {external:jQuery.fn.$.fn.jPicker} bindedHex
   * @param {Float} alphaPrecision
   */
  constructor (picker, color, bindedHex, alphaPrecision) {
    const that = this; // private properties and methods
    const inputs = picker.find('td.Text input');
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
      if (context !== red.get(0)) red.val(!isNullish(all) ? all.r : '');
      if (context !== green.get(0)) green.val(!isNullish(all) ? all.g : '');
      if (context !== blue.get(0)) blue.val(!isNullish(all) ? all.b : '');
      if (alpha && context !== alpha.get(0)) alpha.val(!isNullish(all) ? toFixedNumeric((all.a * 100) / 255, alphaPrecision) : '');
      if (context !== hue.get(0)) hue.val(!isNullish(all) ? all.h : '');
      if (context !== saturation.get(0)) saturation.val(!isNullish(all) ? all.s : '');
      if (context !== value.get(0)) value.val(!isNullish(all) ? all.v : '');
      if (context !== hex.get(0) && ((bindedHex && context !== bindedHex.get(0)) || !bindedHex)) hex.val(!isNullish(all) ? all.hex : '');
      if (bindedHex && context !== bindedHex.get(0) && context !== hex.get(0)) bindedHex.val(!isNullish(all) ? all.hex : '');
      if (ahex && context !== ahex.get(0)) ahex.val(!isNullish(all) ? all.ahex.substring(6) : '');
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
      red = inputs.eq(3),
      green = inputs.eq(4),
      blue = inputs.eq(5),
      alpha = inputs.length > 7 ? inputs.eq(6) : null,
      hue = inputs.eq(0),
      saturation = inputs.eq(1),
      value = inputs.eq(2),
      hex = inputs.eq(inputs.length > 7 ? 7 : 6),
      ahex = inputs.length > 7 ? inputs.eq(8) : null;
    $.extend(true, that, {
      // public properties and methods
      destroy
    });
    red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).bind('keyup', keyUp).bind('blur', blur);
    red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).bind('keydown', keyDown);
    color.bind(colorChanged);
  }
}

/**
 * @class SeColorPicker
 */
export class SeColorPicker extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.append(template.content.cloneNode(true));
    this.$logo = this._shadowRoot.getElementById('logo');
    this.$label = this._shadowRoot.getElementById('label');
    this.$block = this._shadowRoot.getElementById('block');
    this.paintBox = null;
    this.$picker = this._shadowRoot.getElementById('picker');
    this.$color_picker = this._shadowRoot.getElementById('color_picker');
    this.$tabs = this._shadowRoot.querySelectorAll('.se-tabs');
  }
  /**
   * @function initPicker
   * @returns {void}
   */
  initPicker () {
    const that = this;
    this.currentTab = 'solidColor';
    this.SLIDERW = '145px';
    this.MAX = 256;
    this.MARGINX = 0;
    this.MARGINY = 0;
    this.ns = {
      svg: 'http://www.w3.org/2000/svg',
      xlink: 'http://www.w3.org/1999/xlink'
    };
    this.isGecko = navigator.userAgent.includes('Gecko/');
    // paintbox init
    this.paintBox = new PaintBox(this.$block, this.type);
    // -------------------------------------------------------------

    this.jPicker = {
      Color: function (init) { // eslint-disable-line object-shorthand
        const that = this;
        /**
         *
         * @param {module:jPicker.Slider} context
         * @returns {void}
         */
        function fireChangeEvents (context) {
          for (let i = 0; i < changeEvents.length; i++) changeEvents[i].call(that, that, context);
        }

        /**
         * @param {string|"ahex"|"hex"|"all"|""|null|void} name String composed of letters "r", "g", "b", "a", "h", "s", and/or "v"
         * @param {module:jPicker.RGBA|module:jPicker.JPickerInit|string} [value]
         * @param {external:jQuery.jPicker.Color} context
         * @returns {module:jPicker.JPickerInit|string|null|void}
         */
        function val (name, value, context) {
          // Kind of ugly
          const set = Boolean(value);
          if (set && value.ahex === '') value.ahex = '00000000';
          if (!set) {
            let ret;
            if (isNullish(name) || name === '') name = 'all';
            if (isNullish(r)) return null;
            switch (name.toLowerCase()) {
            case 'ahex': return ColorMethods.rgbaToHex({r, g, b, a});
            case 'hex': return val('ahex').substring(0, 6);
            case 'all': return {
              r, g, b, a, h, s, v,
              hex: val.call(that, 'hex'),
              ahex: val.call(that, 'ahex')
            };
            default: {
              ret = {};
              const nameLength = name.length;
              [...name].forEach((ch) => {
                switch (ch) {
                case 'r':
                  if (nameLength === 1) ret = r;
                  else ret.r = r;
                  break;
                case 'g':
                  if (nameLength === 1) ret = g;
                  else ret.g = g;
                  break;
                case 'b':
                  if (nameLength === 1) ret = b;
                  else ret.b = b;
                  break;
                case 'a':
                  if (nameLength === 1) ret = a;
                  else ret.a = a;
                  break;
                case 'h':
                  if (nameLength === 1) ret = h;
                  else ret.h = h;
                  break;
                case 's':
                  if (nameLength === 1) ret = s;
                  else ret.s = s;
                  break;
                case 'v':
                  if (nameLength === 1) ret = v;
                  else ret.v = v;
                  break;
                }
              });
            }
            }
            return typeof ret === 'object' && !Object.keys(ret).length
              ? val.call(that, 'all')
              : ret;
          }
          if (!isNullish(context) && context === that) return undefined;
          if (isNullish(name)) name = '';

          let changed = false;
          if (isNullish(value)) {
            if (!isNullish(r)) {
              r = null;
              changed = true;
            }
            if (!isNullish(g)) {
              g = null;
              changed = true;
            }
            if (!isNullish(b)) {
              b = null;
              changed = true;
            }
            if (!isNullish(a)) {
              a = null;
              changed = true;
            }
            if (!isNullish(h)) {
              h = null;
              changed = true;
            }
            if (!isNullish(s)) {
              s = null;
              changed = true;
            }
            if (!isNullish(v)) {
              v = null;
              changed = true;
            }
            changed && fireChangeEvents.call(that, context || that);
            return undefined;
          }
          switch (name.toLowerCase()) {
          case 'ahex':
          case 'hex': {
            const ret = ColorMethods.hexToRgba((value && (value.ahex || value.hex)) || value || 'none');
            val.call(that, 'rgba', {
              r: ret.r,
              g: ret.g,
              b: ret.b,
              a: name === 'ahex'
                ? ret.a
                : !isNullish(a)
                  ? a
                  : 255
            }, context);
            break;
          } default: {
            if (value && (!isNullish(value.ahex) || !isNullish(value.hex))) {
              val.call(that, 'ahex', value.ahex || value.hex || '00000000', context);
              return undefined;
            }
            const newV = {};
            let rgb = false, hsv = false;
            if (value.r !== undefined && !name.includes('r')) name += 'r';
            if (value.g !== undefined && !name.includes('g')) name += 'g';
            if (value.b !== undefined && !name.includes('b')) name += 'b';
            if (value.a !== undefined && !name.includes('a')) name += 'a';
            if (value.h !== undefined && !name.includes('h')) name += 'h';
            if (value.s !== undefined && !name.includes('s')) name += 's';
            if (value.v !== undefined && !name.includes('v')) name += 'v';
            [...name].forEach((ch) => {
              switch (ch) {
              case 'r':
                if (hsv) return;
                rgb = true;
                newV.r = (value.r && value.r | 0) || (value | 0) || 0;
                if (newV.r < 0) newV.r = 0;
                else if (newV.r > 255) newV.r = 255;
                if (r !== newV.r) {
                  ({r} = newV);
                  changed = true;
                }
                break;
              case 'g':
                if (hsv) return;
                rgb = true;
                newV.g = (value && value.g && value.g | 0) || (value && value | 0) || 0;
                if (newV.g < 0) newV.g = 0;
                else if (newV.g > 255) newV.g = 255;
                if (g !== newV.g) {
                  ({g} = newV);
                  changed = true;
                }
                break;
              case 'b':
                if (hsv) return;
                rgb = true;
                newV.b = (value && value.b && value.b | 0) || (value && value | 0) || 0;
                if (newV.b < 0) newV.b = 0;
                else if (newV.b > 255) newV.b = 255;
                if (b !== newV.b) {
                  ({b} = newV);
                  changed = true;
                }
                break;
              case 'a':
                newV.a = value && !isNullish(value.a) ? value.a | 0 : value | 0;
                if (newV.a < 0) newV.a = 0;
                else if (newV.a > 255) newV.a = 255;
                if (a !== newV.a) {
                  ({a} = newV);
                  changed = true;
                }
                break;
              case 'h':
                if (rgb) return;
                hsv = true;
                newV.h = (value && value.h && value.h | 0) || (value && value | 0) || 0;
                if (newV.h < 0) newV.h = 0;
                else if (newV.h > 360) newV.h = 360;
                if (h !== newV.h) {
                  ({h} = newV);
                  changed = true;
                }
                break;
              case 's':
                if (rgb) return;
                hsv = true;
                newV.s = !isNullish(value.s) ? value.s | 0 : value | 0;
                if (newV.s < 0) newV.s = 0;
                else if (newV.s > 100) newV.s = 100;
                if (s !== newV.s) {
                  ({s} = newV);
                  changed = true;
                }
                break;
              case 'v':
                if (rgb) return;
                hsv = true;
                newV.v = !isNullish(value.v) ? value.v | 0 : value | 0;
                if (newV.v < 0) newV.v = 0;
                else if (newV.v > 100) newV.v = 100;
                if (v !== newV.v) {
                  ({v} = newV);
                  changed = true;
                }
                break;
              }
            });
            if (changed) {
              if (rgb) {
                r = r || 0;
                g = g || 0;
                b = b || 0;
                const ret = ColorMethods.rgbToHsv({r, g, b});
                ({h, s, v} = ret);
              } else if (hsv) {
                h = h || 0;
                s = !isNullish(s) ? s : 100;
                v = !isNullish(v) ? v : 100;
                const ret = ColorMethods.hsvToRgb({h, s, v});
                ({r, g, b} = ret);
              }
              a = !isNullish(a) ? a : 255;
              fireChangeEvents.call(that, context || that);
            }
            break;
          }
          }
          return undefined;
        }
        /**
        * @param {GenericCallback} callback
        * @returns {void}
        */
        function bind (callback) { // eslint-disable-line promise/prefer-await-to-callbacks
          if (typeof callback === 'function') changeEvents.push(callback);
        }
        /**
        * @param {GenericCallback} callback
        * @returns {void}
        */
        function unbind (callback) { // eslint-disable-line promise/prefer-await-to-callbacks
          if (typeof callback !== 'function') return;
          let i;
          while ((i = changeEvents.includes(callback))) {
            changeEvents.splice(i, 1);
          }
        }
        /**
        * Unset `changeEvents`
        * @returns {void}
        */
        function destroy () {
          changeEvents = null;
        }
        let r, g, b, a, h, s, v, changeEvents = [];

        $.extend(true, that, {
          // public properties and methods
          val,
          bind,
          unbind,
          destroy
        });
        if (init) {
          if (!isNullish(init.ahex)) {
            val('ahex', init);
          } else if (!isNullish(init.hex)) {
            val(
              (!isNullish(init.a) ? 'a' : '') + 'hex',
              !isNullish(init.a)
                ? {ahex: init.hex + ColorMethods.intToHex(init.a)}
                : init
            );
          } else if (!isNullish(init.r) && !isNullish(init.g) && !isNullish(init.b)) {
            val('rgb' + (!isNullish(init.a) ? 'a' : ''), init);
          } else if (!isNullish(init.h) && !isNullish(init.s) && !isNullish(init.v)) {
            val('hsv' + (!isNullish(init.a) ? 'a' : ''), init);
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
          if (hex === '' || hex === 'none') return {r: null, g: null, b: null, a: null};
          hex = this.validateHex(hex);
          let r = '00', g = '00', b = '00', a = '255';
          if (hex.length === 6) hex += 'ff';
          if (hex.length > 6) {
            r = hex.substring(0, 2);
            g = hex.substring(2, 4);
            b = hex.substring(4, 6);
            a = hex.substring(6, hex.length);
          } else {
            if (hex.length > 4) {
              r = hex.substring(4, hex.length);
              hex = hex.substring(0, 4);
            }
            if (hex.length > 2) {
              g = hex.substring(2, hex.length);
              hex = hex.substring(0, 2);
            }
            if (hex.length > 0) b = hex.substring(0, hex.length);
          }
          return {
            r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b), a: this.hexToInt(a)
          };
        },
        /**
        * @param {string} hex
        * @returns {string}
        */
        validateHex (hex) {
          // if (typeof hex === 'object') return '';
          hex = hex.toLowerCase().replace(/[^a-f\d]/g, '');
          if (hex.length > 8) hex = hex.substring(0, 8);
          return hex;
        },
        /**
        * @param {module:jPicker.RGBA} rgba
        * @returns {string}
        */
        rgbaToHex (rgba) {
          return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b) + this.intToHex(rgba.a);
        },
        /**
        * @param {Integer} dec
        * @returns {string}
        */
        intToHex (dec) {
          let result = (dec | 0).toString(16);
          if (result.length === 1) result = ('0' + result);
          return result.toLowerCase();
        },
        /**
        * @param {string} hex
        * @returns {Integer}
        */
        hexToInt (hex) {
          return Number.parseInt(hex, 16);
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
          const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, hsv = {h: 0, s: 0, v: 0};
          let min = 0, max = 0;
          if (r >= g && r >= b) {
            max = r;
            min = g > b ? b : g;
          } else if (g >= b && g >= r) {
            max = g;
            min = r > b ? b : r;
          } else {
            max = b;
            min = g > r ? r : g;
          }
          hsv.v = max;
          hsv.s = max ? (max - min) / max : 0;
          let delta;
          if (!hsv.s) hsv.h = 0;
          else {
            delta = max - min;
            if (r === max) hsv.h = (g - b) / delta;
            else if (g === max) hsv.h = 2 + (b - r) / delta;
            else hsv.h = 4 + (r - g) / delta;
            hsv.h = Number.parseInt(hsv.h * 60);
            if (hsv.h < 0) hsv.h += 360;
          }
          hsv.s = (hsv.s * 100) | 0;
          hsv.v = (hsv.v * 100) | 0;
          return hsv;
        },
        /**
        * @param {module:jPicker.HSV} hsv
        * @returns {module:jPicker.RGB}
        */
        hsvToRgb (hsv) {
          const rgb = {r: 0, g: 0, b: 0, a: 100};
          let {h, s, v} = hsv;
          if (s === 0) {
            if (v === 0) rgb.r = rgb.g = rgb.b = 0;
            else rgb.r = rgb.g = rgb.b = (v * 255 / 100) | 0;
          } else {
            if (h === 360) h = 0;
            h /= 60;
            s /= 100;
            v /= 100;
            const i = h | 0,
              f = h - i,
              p = v * (1 - s),
              q = v * (1 - (s * f)),
              t = v * (1 - (s * (1 - f)));
            switch (i) {
            case 0:
              rgb.r = v;
              rgb.g = t;
              rgb.b = p;
              break;
            case 1:
              rgb.r = q;
              rgb.g = v;
              rgb.b = p;
              break;
            case 2:
              rgb.r = p;
              rgb.g = v;
              rgb.b = t;
              break;
            case 3:
              rgb.r = p;
              rgb.g = q;
              rgb.b = v;
              break;
            case 4:
              rgb.r = t;
              rgb.g = p;
              rgb.b = v;
              break;
            case 5:
              rgb.r = v;
              rgb.g = p;
              rgb.b = q;
              break;
            }
            rgb.r = (rgb.r * 255) | 0;
            rgb.g = (rgb.g * 255) | 0;
            rgb.b = (rgb.b * 255) | 0;
          }
          return rgb;
        }
      },
      default: {
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
          active: '', // new Color({ahex: '#ffcc00ff'}),
          quickList: [
          /*  new Color({h: 360, s: 33, v: 100}),
            new Color({h: 360, s: 66, v: 100}),
            new Color({h: 360, s: 100, v: 100}),
            new Color({h: 360, s: 100, v: 75}),
            new Color({h: 360, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 100}),
            new Color({h: 30, s: 33, v: 100}),
            new Color({h: 30, s: 66, v: 100}),
            new Color({h: 30, s: 100, v: 100}),
            new Color({h: 30, s: 100, v: 75}),
            new Color({h: 30, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 90}),
            new Color({h: 60, s: 33, v: 100}),
            new Color({h: 60, s: 66, v: 100}),
            new Color({h: 60, s: 100, v: 100}),
            new Color({h: 60, s: 100, v: 75}),
            new Color({h: 60, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 80}),
            new Color({h: 90, s: 33, v: 100}),
            new Color({h: 90, s: 66, v: 100}),
            new Color({h: 90, s: 100, v: 100}),
            new Color({h: 90, s: 100, v: 75}),
            new Color({h: 90, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 70}),
            new Color({h: 120, s: 33, v: 100}),
            new Color({h: 120, s: 66, v: 100}),
            new Color({h: 120, s: 100, v: 100}),
            new Color({h: 120, s: 100, v: 75}),
            new Color({h: 120, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 60}),
            new Color({h: 150, s: 33, v: 100}),
            new Color({h: 150, s: 66, v: 100}),
            new Color({h: 150, s: 100, v: 100}),
            new Color({h: 150, s: 100, v: 75}),
            new Color({h: 150, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 50}),
            new Color({h: 180, s: 33, v: 100}),
            new Color({h: 180, s: 66, v: 100}),
            new Color({h: 180, s: 100, v: 100}),
            new Color({h: 180, s: 100, v: 75}),
            new Color({h: 180, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 40}),
            new Color({h: 210, s: 33, v: 100}),
            new Color({h: 210, s: 66, v: 100}),
            new Color({h: 210, s: 100, v: 100}),
            new Color({h: 210, s: 100, v: 75}),
            new Color({h: 210, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 30}),
            new Color({h: 240, s: 33, v: 100}),
            new Color({h: 240, s: 66, v: 100}),
            new Color({h: 240, s: 100, v: 100}),
            new Color({h: 240, s: 100, v: 75}),
            new Color({h: 240, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 20}),
            new Color({h: 270, s: 33, v: 100}),
            new Color({h: 270, s: 66, v: 100}),
            new Color({h: 270, s: 100, v: 100}),
            new Color({h: 270, s: 100, v: 75}),
            new Color({h: 270, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 10}),
            new Color({h: 300, s: 33, v: 100}),
            new Color({h: 300, s: 66, v: 100}),
            new Color({h: 300, s: 100, v: 100}),
            new Color({h: 300, s: 100, v: 75}),
            new Color({h: 300, s: 100, v: 50}),
            new Color({h: 180, s: 0, v: 0}),
            new Color({h: 330, s: 33, v: 100}),
            new Color({h: 330, s: 66, v: 100}),
            new Color({h: 330, s: 100, v: 100}),
            new Color({h: 330, s: 100, v: 75}),
            new Color({h: 330, s: 100, v: 50}),
            new Color() */
          ]
        },
        images: {
          clientPath: './components/jgraduate/images/',
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
        },
        localization: {
          text: {
            title: 'Drag Markers To Pick A Color',
            newColor: 'new',
            currentColor: 'current',
            ok: 'OK',
            cancel: 'Cancel'
          },
          tooltips: {
            colors: {
              newColor: 'New Color - Press &ldquo;OK&rdquo; To Commit',
              currentColor: 'Click To Revert To Original Color'
            },
            buttons: {
              ok: 'Commit To This Color Selection',
              cancel: 'Cancel And Revert To Original Color'
            },
            hue: {
              radio: 'Set To &ldquo;Hue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Hue&rdquo; Value (0-360&deg;)'
            },
            saturation: {
              radio: 'Set To &ldquo;Saturation&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Saturation&rdquo; Value (0-100%)'
            },
            value: {
              radio: 'Set To &ldquo;Value&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Value&rdquo; Value (0-100%)'
            },
            red: {
              radio: 'Set To &ldquo;Red&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Red&rdquo; Value (0-255)'
            },
            green: {
              radio: 'Set To &ldquo;Green&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Green&rdquo; Value (0-255)'
            },
            blue: {
              radio: 'Set To &ldquo;Blue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Blue&rdquo; Value (0-255)'
            },
            alpha: {
              radio: 'Set To &ldquo;Alpha&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Alpha&rdquo; Value (0-100)'
            },
            hex: {
              textbox: 'Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)',
              alpha: 'Enter A &ldquo;Alpha&rdquo; Value (#00-#ff)'
            }
          }
        }
      }
    };
    const isLessThanIE7 = Number.parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters;
    const settings = this.jPicker.default;
    const win = settings.window;
    const {Color, ColorMethods} = this.jPicker;
    const {images, localization, color} = settings; // local copies for YUI compressor
    const colorObj = {
      active: (typeof settings.color.active).toString().toLowerCase() === 'string'
        ? new Color({ahex: !win.alphaSupport && settings.color.active
          ? settings.color.active.substring(0, 6) + 'ff'
          : settings.color.active
        })
        : new Color({ahex: !win.alphaSupport &&
            settings.color.active.val('ahex')
          ? settings.color.active.val('ahex').substring(0, 6) + 'ff'
          : settings.color.active.val('ahex')
        }),
      current: (typeof settings.color.active).toString().toLowerCase() === 'string'
        ? new Color({ahex: !win.alphaSupport && settings.color.active
          ? settings.color.active.substring(0, 6) + 'ff'
          : settings.color.active})
        : new Color({ahex: !win.alphaSupport &&
            settings.color.active.val('ahex')
          ? settings.color.active.val('ahex').substring(0, 6) + 'ff'
          : settings.color.active.val('ahex')
        }),
      quickList: settings.color.quickList
    };

    /* if (typeof commitCallback !== 'function') {
      commitCallback = null;
    }
    if (typeof liveCallback !== 'function') {
      liveCallback = null;
    }
    if (typeof cancelCallback !== 'function') {
      cancelCallback = null;
    } */

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
     * User has dragged the ColorMap pointer.
     * @param {external:jQuery} ui
     * @param {?module:jPicker.Slider} context
     * @returns {void}
    */
    function mapValueChanged (ui, context) {
      const {active} = color;
      if (context !== colorMap && isNullish(active.val())) return;
      const xy = ui.val('all');
      switch (settings.color.mode) {
      case 'h':
        active.val('sv', {s: xy.x, v: 100 - xy.y}, context);
        break;
      case 's':
      case 'a':
        active.val('hv', {h: xy.x, v: 100 - xy.y}, context);
        break;
      case 'v':
        active.val('hs', {h: xy.x, s: 100 - xy.y}, context);
        break;
      case 'r':
        active.val('gb', {g: 255 - xy.y, b: xy.x}, context);
        break;
      case 'g':
        active.val('rb', {r: 255 - xy.y, b: xy.x}, context);
        break;
      case 'b':
        active.val('rg', {r: xy.x, g: 255 - xy.y}, context);
        break;
      }
    }

    /**
    * @param {external:jQuery} img
    * @param {string} src The image source
    * @returns {void}
    */
    function setImg (img, src) {
      if (isLessThanIE7 && (src.includes('AlphaBar.png') || src.includes('Bars.png') || src.includes('Maps.png'))) {
        img.attr('pngSrc', src);
        img.style.cssText = `backgroundImage: 'none', filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')'`;
        /* img.css({backgroundImage: 'none', filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')'}); */
      } else {
        console.log("came -->", src);
        img.style.backgroundImage = `url('${src}')`;
        // img.css({backgroundImage: 'url(\'' + src + '\')'});
      }
    }


    const all = null;
    let elementStartX = null, // Used to record the starting css positions for dragging the control
    elementStartY = null,
    pageStartX = null, // Used to record the mousedown coordinates for dragging the control
    pageStartY = null,
    colorMapDiv = null,
    colorBarDiv = null,
    colorMapL1 = null, // different layers of colorMap and colorBar
    colorMapL2 = null,
    colorMapL3 = null,
    colorBarL1 = null,
    colorBarL2 = null,
    colorBarL3 = null,
    colorBarL4 = null,
    colorBarL5 = null,
    colorBarL6 = null,
    colorMap = null, // color maps
    colorBar = null,
    colorPicker = null,
    activePreview = null, // color boxes above the radio buttons
    currentPreview = null,
    okButton = null,
    cancelButton = null,
    grid = null, // preset colors grid
    iconColor = null, // iconColor for popup icon
    iconAlpha = null, // iconAlpha for popup icon
    iconImage = null, // iconImage popup icon
    moveBar = null; // drag bar
    const controlHtml = `<table class="jPicker" cellpadding="0" cellspacing="0">
    <tbody id="solid-tbody">
      <tr>
        <td rowspan="9">
          <h2 class="Title">${localization.text.title}</h2>
          <div class="Map" id="Map">
            <span class="Map1" id="Map-Map1">&nbsp;</span>
            <span class="Map2" id="Map-Map2">&nbsp;</span>
            <span class="Map3" id="Map-Map3">&nbsp;</span>
            <img src="${images.clientPath + images.colorMap.arrow.file}" class="Arrow"/>
          </div>
        </td>
        <td rowspan="9">
          <div class="Bar" id="Bar">
            <span class="Map1" id="Bar-Map1">&nbsp;</span>
            <span class="Map2" id="Bar-Map2">&nbsp;</span>
            <span class="Map3" id="Bar-Map3">&nbsp;</span>
            <span class="Map4" id="Bar-Map4">&nbsp;</span>
            <span class="Map5" id="Bar-Map5">&nbsp;</span>
            <span class="Map6" id="Bar-Map6">&nbsp;</span>
            <img src="${images.clientPath + images.colorBar.arrow.file}" class="Arrow"/>
          </div>
        </td>
        <td colspan="2" class="Preview" id="Preview">
          ${localization.text.newColor}
          <div>
            <span class="Active" title="${localization.tooltips.colors.newColor}">&nbsp;</span>
            <span class="Current" title="${localization.tooltips.colors.currentColor}">&nbsp;</span>
          </div>
          ${localization.text.currentColor}
        </td>
        <td rowspan="9" class="Button">
          <input type="button" class="Ok" value="${localization.text.ok}" title="${localization.tooltips.buttons.ok}"/>
          <input type="button" class="Cancel" value="${localization.text.cancel}" title="${localization.tooltips.buttons.cancel}"/>
          <hr/>
          <div class="Grid">&nbsp;</div>
        </td>
      </tr>
      <tr class="Hue">
        <td class="Radio">
          <label title="${localization.tooltips.hue.radio}">
            <input type="radio" value="h"${settings.color.mode === 'h' ? ' checked="checked"' : ''}/>H:
          </label>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.h : ''}" title="${localization.tooltips.hue.textbox}"/>&nbsp;&deg;
        </td>
      </tr>
      <tr class="Saturation">
        <td class="Radio">
          <label title="${localization.tooltips.saturation.radio}">
            <input type="radio" value="s"${settings.color.mode === 's' ? ' checked="checked"' : ''}/>S:
          </label>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.s : ''}" title="${localization.tooltips.saturation.textbox}"/>&nbsp;%
        </td>
      </tr>
      <tr class="Value">
        <td class="Radio">
          <label title="${localization.tooltips.value.radio}">
            <input type="radio" value="v"${settings.color.mode === 'v' ? ' checked="checked"' : ''}/>V:
          </label>
          <br/>
          <br/>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.v : ''}" title="${localization.tooltips.value.textbox}"/>&nbsp;%
          <br/>
          <br/>
        </td>
      </tr>
      <tr class="Red">
        <td class="Radio">
          <label title="${localization.tooltips.red.radio}">
            <input type="radio" value="r"${settings.color.mode === 'r' ? ' checked="checked"' : ''}/>R:
          </label>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.r : ''}" title="${localization.tooltips.red.textbox}"/>
        </td>
      </tr>
      <tr class="Green">
        <td class="Radio">
          <label title="${localization.tooltips.green.radio}">
            <input type="radio" value="g"${settings.color.mode === 'g' ? ' checked="checked"' : ''}/>G:
          </label>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.g : ''}" title="${localization.tooltips.green.textbox}"/>
        </td>
      </tr>
      <tr class="Blue">
        <td class="Radio">
          <label title="${localization.tooltips.blue.radio}">
          <input type="radio" value="b"${settings.color.mode === 'b' ? ' checked="checked"' : ''}/>B:
        </label>
        </td>
        <td class="Text">
          <input type="text" maxlength="3" value="${!isNullish(all) ? all.b : ''}" title="${localization.tooltips.blue.textbox}"/>
        </td>
      </tr>
      <tr class="Alpha">
        <td class="Radio">
          ${win.alphaSupport ? `<label title="${localization.tooltips.alpha.radio}"><input type="radio" value="a"${this.jPicker.color.mode === 'a' ? ' checked="checked"' : ''}/>A:</label>` : '&nbsp;'}
        </td>
        <td class="Text">
          ${win.alphaSupport ? `<input type="text" maxlength="${3 + win.alphaPrecision}" value="${!isNullish(all) ? toFixedNumeric((all.a * 100) / 255, win.alphaPrecision) : ''}" title="${localization.tooltips.alpha.textbox}"/>&nbsp;%` : '&nbsp;'}
        </td>
      </tr>
      <tr class="Hex">
        <td colspan="2" class="Text">
          <label title="${localization.tooltips.hex.textbox}">#:
            <input type="text" maxlength="6" class="Hex" value="${!isNullish(all) ? all.hex : ''}"/>
          </label>
          ${win.alphaSupport ? `<input type="text" maxlength="2" class="AHex" value="${!isNullish(all) ? all.ahex.substring(6) : ''}" title="${localization.tooltips.hex.alpha}"/></td>` : '&nbsp;'}
      </tr>
    </tbody></table>`;
    this._shadowRoot.getElementById('se-color-pick').innerHTML = controlHtml;
    // initialize the objects to the source code just injected
    const tbody = this._shadowRoot.getElementById('solid-tbody');
    colorMapDiv = this._shadowRoot.getElementById('Map'); // tbody.find('div.Map:first');
    colorBarDiv = this._shadowRoot.getElementById('Bar'); // tbody.find('div.Bar:first');
    // const MapMaps = colorMapDiv.find('span');
    // const BarMaps = colorBarDiv.find('span');
    colorMapL1 = this._shadowRoot.getElementById('Map-Map1'); // MapMaps.filter('.Map1:first');
    colorMapL2 = this._shadowRoot.getElementById('Map-Map2'); // MapMaps.filter('.Map2:first');
    colorMapL3 = this._shadowRoot.getElementById('Map-Map3'); // MapMaps.filter('.Map3:first');
    colorBarL1 = this._shadowRoot.getElementById('Bar-Map1'); // BarMaps.filter('.Map1:first');
    colorBarL2 = this._shadowRoot.getElementById('Bar-Map2'); // BarMaps.filter('.Map2:first');
    colorBarL3 = this._shadowRoot.getElementById('Bar-Map3'); // BarMaps.filter('.Map3:first');
    colorBarL4 = this._shadowRoot.getElementById('Bar-Map4'); // BarMaps.filter('.Map4:first');
    colorBarL5 = this._shadowRoot.getElementById('Bar-Map5'); // BarMaps.filter('.Map5:first');
    colorBarL6 = this._shadowRoot.getElementById('Bar-Map6'); // BarMaps.filter('.Map6:first');

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
    );
    colorMap.bind(mapValueChanged);
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
    );
    const preview = tbody.querySelector('#Preview');
    // colorBar.bind(colorBarValueChanged);
    /* colorPicker = new ColorValuePicker(
      tbody,
      color.active,
      win.expandable && win.bindToInput ? win.input : null,
      win.alphaPrecision
    );
    const hex = !isNullish(all) ? all.hex : null,
    preview = tbody.querySelector('#Preview'), // tbody.find('.Preview'),
    button = tbody.querySelector('#Button'); // tbody.find('.Button');
     activePreview = preview.find('.Active:first').css({backgroundColor: (hex && '#' + hex) || 'transparent'});
    currentPreview = preview.find('.Current:first').css({backgroundColor: (hex && '#' + hex) || 'transparent'}).bind('click', currentClicked);
    setAlpha.call(that, currentPreview, toFixedNumeric((color.current.val('a') * 100) / 255, 4));
    okButton = button.find('.Ok:first').bind('click', okClicked);
    cancelButton = button.find('.Cancel:first').bind('click', cancelClicked); 
    grid = button.find('.Grid:first'); */
    setTimeout(function () {
      setImg.call(that, colorMapL1, images.clientPath + 'Maps.png');
      setImg.call(that, colorMapL2, images.clientPath + 'Maps.png');
      setImg.call(that, colorMapL3, images.clientPath + 'map-opacity.png');
      setImg.call(that, colorBarL1, images.clientPath + 'Bars.png');
      setImg.call(that, colorBarL2, images.clientPath + 'Bars.png');
      setImg.call(that, colorBarL3, images.clientPath + 'Bars.png');
      setImg.call(that, colorBarL4, images.clientPath + 'Bars.png');
      setImg.call(that, colorBarL5, images.clientPath + 'bar-opacity.png');
      setImg.call(that, colorBarL6, images.clientPath + 'AlphaBar.png');
      setImg.call(that, preview.querySelector('div'), images.clientPath + 'preview-opacity.png');
    }, 0);
    // preview.find('div:first')
    // tbody.find('td.Radio input').bind('click', radioClicked);
    
    // ----------------------------------------------------------------

    this.applyStyle('.jGraduate_SliderBar', 'width', this.SLIDERW);
    const container = this._shadowRoot.getElementById('color_picker_jGraduate_GradContainer');
    const svg = this.mkElem('svg', {
      id: 'color_picker_jgraduate_svg',
      width: this.MAX,
      height: this.MAX,
      xmlns: this.ns.svg
    }, container);
  }
  /**
   * @function selectAll
   * @param {string} selector
   * @returns {any}
   */
  selectAll (selector) {
    return this._shadowRoot.querySelectorAll(selector);
  }

  /**
   * @function applyStyle
   * @param {string} selector
   * @param {string} attr
   * @param {any} value
   * @returns {void}
   */
  applyStyle (selector, attr, value) {
    const elements = this.selectAll(selector);
    for (const element of elements) {
      element.style[attr] = value;
    }
  }
  /**
  * @param {SVGElement} elem
  * @param {module:jGraduate.Attrs} attrs
  * @returns {void}
  */
  setAttrs (elem, attrs) {
    if (this.isGecko) {
      Object.entries(attrs).forEach(([aname, val]) => {
        elem.setAttribute(aname, val);
      });
    } else {
      Object.entries(attrs).forEach(([aname, val]) => {
        const prop = elem[aname];
        if (prop && prop.constructor === 'SVGLength') {
          prop.baseVal.value = val;
        } else {
          elem.setAttribute(aname, val);
        }
      });
    }
  }
  /**
  * @function mkElem
  * @param {string} name
  * @param {module:jGraduate.Attrs} attrs
  * @param {Element} newparent
  * @returns {SVGElement}
  */
  mkElem (name, attrs, newparent) {
    const elem = document.createElementNS(this.ns.svg, name);
    this.setAttrs(elem, attrs);
    if (newparent) {
      newparent.append(elem);
    }
    return elem;
  }
  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'src', 'type'];
  }
  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) return;
    switch (name) {
    case 'src':
      this.$logo.setAttribute('src', newValue);
      break;
    case 'label':
      this.setAttribute('title', newValue);
      break;
    case 'type':
      this.$label.setAttribute('title', `Pick a ${newValue} Paint and Opacity`);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`unknown attribute: ${name}`);
      break;
    }
  }
  /**
   * @function get
   * @returns {any}
   */
  get label () {
    return this.$label.getAttribute('title');
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get type () {
    return this.getAttribute('type');
  }

  /**
   * @function set
   * @returns {void}
   */
  set type (value) {
    this.setAttribute('type', value);
  }
  /**
   * @function get
   * @returns {any}
   */
  get src () {
    return this.getAttribute('src');
  }

  /**
   * @function set
   * @returns {void}
   */
  set src (value) {
    this.setAttribute('src', value);
  }

  /**
   * @param {PlainObject} svgCanvas
   * @param {PlainObject} selectedElement
   * @param {bool} apply
   * @returns {void}
   */
  update (svgCanvas, selectedElement, apply) {
    const paint = this.paintBox.update(svgCanvas, selectedElement);
    if (paint && apply) {
      const changeEvent = new CustomEvent('change', {detail: {
        paint
      }});
      this.dispatchEvent(changeEvent);
    }
  }
  /**
   * @param {PlainObject} paint
   * @returns {void}
   */
  setPaint (paint) {
    this.paintBox.setPaint(paint);
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    this.initPicker();
    const self = this._shadowRoot;
    self.querySelector('#se-color-pick').style.display = 'block';
    const onTabsClickHandler = (e) => {
      e.target.parentElement.querySelectorAll('.se-tabs').forEach((ev) => {
        ev.classList.remove('jGraduate_tab_current');
        self.getElementById(ev.dataset.section).style.display = 'none';
      });
      e.target.classList.add('jGraduate_tab_current');
      self.getElementById(e.target.dataset.section).style.display = 'block';
    };
    for (let i = 0; i < this.$tabs.length; i++) {
      this.$tabs[i].addEventListener('click', onTabsClickHandler, false);
    }
  }
}

// Register
customElements.define('se-color-graduate-picker', SeColorPicker);
