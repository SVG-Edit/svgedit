/* globals svgEditor */

/**
 * @file jGraduate 0.4
 *
 * jQuery Plugin for a gradient picker
 *
 * @module jGraduate
 * @copyright 2010 Jeff Schiller {@link http://blog.codedread.com/}, 2010 Alexis Deveria {@link http://a.deveria.com/}
 *
 * @license Apache-2.0
 * @example
 * // The Paint object is described below.
 * $.jGraduate.Paint(); // constructs a 'none' color
 * @example $.jGraduate.Paint({copy: o}); // creates a copy of the paint o
 * @example $.jGraduate.Paint({hex: '#rrggbb'}); // creates a solid color paint with hex = "#rrggbb"
 * @example $.jGraduate.Paint({linearGradient: o, a: 50}); // creates a linear gradient paint with opacity=0.5
 * @example $.jGraduate.Paint({radialGradient: o, a: 7}); // creates a radial gradient paint with opacity=0.07
 * @example $.jGraduate.Paint({hex: '#rrggbb', linearGradient: o}); // throws an exception?
*/
import SvgCanvas from '@svgedit/svgcanvas'
import { jPickerDefaults, jPickerMethod } from './jQuery.jPicker.js'
import { findPos } from '@svgedit/svgcanvas/common/util.js'

/**
 * @todo JFH: This jQuery plugin was adapted to work within a Web Component.
 * We have to rewrite it as a pure webcomponent.
*/

/**
  * The jQuery namespace.
  * @external jQuery
*/
/**
 * The jQuery plugin namespace.
 * @namespace {PlainObject} fn
 * @memberof external:jQuery
 * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
 */

const ns = {
  svg: 'http://www.w3.org/2000/svg',
  xlink: 'http://www.w3.org/1999/xlink'
}

if (!window.console) {
  window.console = {
    log () { /* empty fn */ },
    dir () { /* empty fn */ }
  }
}

/**
* Adds {@link external:jQuery.jGraduate.Paint},
* {@link external:jQuery.fn.jGraduateDefaults},
* {@link external:jQuery.fn.jGraduate}.
* @function module:jGraduate.jGraduate
* @param {external:jQuery} $ The jQuery instance to wrap
* @returns {external:jQuery}
*/
// export default function jQueryPluginJGraduate ($) {
/**
* @namespace {PlainObject} jGraduate
* @memberof external:jQuery
*/
export const jGraduate = /** @lends external:jQuery.jGraduate */ {
  /**
  * @class external:jQuery.jGraduate.Paint
  * @see module:jGraduate~Paint
  */
  Paint: SvgCanvas.Paint
}

// JSDoc doesn't show this as belonging to our `module:jGraduate.Options` type,
//   so we use `@see`
/**
* @namespace {module:jGraduate.Options} jGraduateDefaults
* @memberof external:jQuery.fn
*/
export const jGraduateDefaults = /** @lends external:jQuery.fn.jGraduateDefaults */ {
  /**
  * Creates an object with a 'none' color.
  * @type {external:jQuery.jGraduate.Paint}
  * @see module:jGraduate.Options
  */
  paint: new jGraduate.Paint(),
  /**
  * @namespace
  */
  window: {
    /**
    * @type {string}
    * @see module:jGraduate.Options
    */
    pickerTitle: 'Drag markers to pick a paint'
  },
  /**
  * @namespace
  */
  images: {
    /**
    * @type {string}
    * @see module:jGraduate.Options
    */
    clientPath: 'images/'
  },
  /**
  * @type {string}
  * @see module:jGraduate.Options
  */
  newstop: 'inverse' // same, inverse, black, white
}

const isGecko = navigator.userAgent.includes('Gecko/')

/**
* @typedef {PlainObject<string, string>} module:jGraduate.Attrs
*/
/**
* @param {SVGElement} elem
* @param {module:jGraduate.Attrs} attrs
* @returns {void}
*/
function setAttrs (elem, attrs) {
  if (isGecko) {
    Object.entries(attrs).forEach(([aname, val]) => {
      elem.setAttribute(aname, val)
    })
  } else {
    Object.entries(attrs).forEach(([aname, val]) => {
      const prop = elem[aname]
      if (prop?.constructor === 'SVGLength') {
        prop.baseVal.value = val
      } else {
        elem.setAttribute(aname, val)
      }
    })
  }
}

/**
* @param {string} name
* @param {module:jGraduate.Attrs} attrs
* @param {Element} newparent
* @returns {SVGElement}
*/
function mkElem (name, attrs, newparent) {
  const elem = document.createElementNS(ns.svg, name)
  setAttrs(elem, attrs)
  if (newparent) {
    newparent.append(elem)
  }
  return elem
}

/**
* @typedef {PlainObject} module:jGraduate.ColorOpac Object may have one or both values
* @property {string} [color] #Hex color
* @property {Float} [opac] 0-1
*/
/**
* @typedef {PlainObject} module:jGraduate.Options
* @property {module:jGraduate~Paint} [paint] A Paint object object describing the paint to display initially; defaults to a new instance without options (defaults to opaque white)
* @property {external:Window} [window]
* @property {string} [window.pickerTitle="Drag markers to pick a paint"]
* @property {PlainObject} [images]
* @property {string} [images.clientPath="images/"]
* @property {"same"|"inverse"|"black"|"white"|module:jGraduate.ColorOpac} [newstop="inverse"]
*/

/**
* @callback external:jQuery.fn.jGraduate.OkCallback
* @param {external:jQuery.jGraduate.Paint} paint
* @returns {void}
*/
/**
* @callback external:jQuery.fn.jGraduate.CancelCallback
* @returns {void}
*/

/**
* @function external:jQuery.fn.jGraduate
* @param {module:jGraduate.Options} [options]
* @param {external:jQuery.fn.jGraduate.OkCallback} [okCallback] Called with a Paint object when Ok is pressed
* @param {external:jQuery.fn.jGraduate.CancelCallback} [cancelCallback] Called with no arguments when Cancel is pressed
* @returns {external:jQuery}
*/
export function jGraduateMethod (elem, options, okCallback, cancelCallback, i18next) {
  const $this = elem
  const $settings = Object.assign({}, jGraduateDefaults, options || {})
  const id = $this.getAttribute('id')
  const idref = '#' + $this.getAttribute('id') + ' '

  if (!idref) {
    alert('Container element must have an id attribute to maintain unique id strings for sub-elements.')
    return
  }

  const okClicked = function () {
    switch ($this.paint.type) {
      case 'radialGradient':
        $this.paint.linearGradient = null
        break
      case 'linearGradient':
        $this.paint.radialGradient = null
        break
      case 'solidColor':
        $this.paint.radialGradient = $this.paint.linearGradient = null
        break
    }
    typeof $this.okCallback === 'function' && $this.okCallback($this.paint)
    $this.style.display = 'none'
  }
  const cancelClicked = function () {
    typeof $this.cancelCallback === 'function' && $this.cancelCallback()
    $this.style.display = 'none'
  }
  Object.assign($this, {
    // make a copy of the incoming paint
    paint: new jGraduate.Paint({ copy: $settings.paint }),
    okCallback: typeof okCallback === 'function' ? okCallback : null,
    cancelCallback: typeof cancelCallback === 'function' ? cancelCallback : null
  })

  let // pos = $this.position(),
    color = null
  const $win = window

  if ($this.paint.type === 'none') {
    $this.paint = new jGraduate.Paint({ solidColor: 'ffffff' })
  }
  $this.classList.add('jGraduate_Picker')
  $this.innerHTML = `<ul class="jGraduate_tabs">
      <li class="jGraduate_tab_color jGraduate_tab_current" id="jGraduate_tab_color" data-type="col">${i18next.t('config.jgraduate_solid_color')}</li>
      <li class="jGraduate_tab_lingrad" id="jGraduate_tab_lingrad" data-type="lg">${i18next.t('config.jgraduate_linear_gradient')}</li>
      <li class="jGraduate_tab_radgrad" id="jGraduate_tab_radgrad" data-type="rg">${i18next.t('config.jgraduate_radial_gradient')}</li>
    </ul>
    <div class="jGraduate_colPick" id="jGraduate_colPick"></div>
    <div class="jGraduate_gradPick" id="jGraduate_gradPick"></div>
    <div class="jGraduate_LightBox" id="jGraduate_LightBox"></div>
    <div id="${id}_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>`
  const colPicker = $this.querySelector('#jGraduate_colPick')
  const gradPicker = $this.querySelector('#jGraduate_gradPick')
  const html = `<div id="${id}_jGraduate_Swatch" class="jGraduate_Swatch">
        <h2 class="jGraduate_Title">${$settings.window.pickerTitle}</h2>
        <div id="${id}_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>
        <div id="${id}_jGraduate_StopSlider" class="jGraduate_StopSlider"></div>
      </div>
      <div class="jGraduate_Form jGraduate_Points jGraduate_lg_field">
        <div class="jGraduate_StopSection">
          <label class="jGraduate_Form_Heading">${i18next.t('config.jgraduate_begin_point')}</label>
          <div class="jGraduate_Form_Section">
            <label>x:</label>
              <input type="text" id="${id}_jGraduate_x1" size="3" title="${i18next.t('config.jgraduate_enter_starting_x')}"/>
            <label>y:</label>
            <input type="text" id="${id}_jGraduate_y1" size="3" title="${i18next.t('config.jgraduate_enter_starting_y')}"/>
          </div>
        </div>
        <div class="jGraduate_StopSection">
          <label class="jGraduate_Form_Heading">${i18next.t('config.jgraduate_end_point')}</label>
          <div class="jGraduate_Form_Section">
            <label>x:</label>
            <input type="text" id="${id}_jGraduate_x2" size="3" title="${i18next.t('config.jgraduate_enter_ending_x')}"/>
            <label>y:</label>
            <input type="text" id="${id}_jGraduate_y2" size="3" title="${i18next.t('config.jgraduate_enter_ending_y')}"/>
          </div>
        </div>
      </div>
      <div class="jGraduate_Form jGraduate_Points jGraduate_rg_field">
        <div class="jGraduate_StopSection">
          <label class="jGraduate_Form_Heading">${i18next.t('config.jgraduate_center_point')}</label>
          <div class="jGraduate_Form_Section">
            <label>x:</label>
            <input type="text" id="${id}_jGraduate_cx" size="3" title="${i18next.t('config.jgraduate_enter_value_x')}"/>
            <label>y:</label>
            <input type="text" id="${id}_jGraduate_cy" size="3" title="${i18next.t('config.jgraduate_enter_value_y')}"/>
          </div>
        </div>
        <div class="jGraduate_StopSection">
          <label class="jGraduate_Form_Heading">${i18next.t('config.jgraduate_focal_point')}</label>
          <div class="jGraduate_Form_Section">
            <label>${i18next.t('config.jgraduate_match_center')} <input type="checkbox" checked="checked" id="${id}_jGraduate_match_ctr"/></label><br/>
            <label>x:</label>
            <input type="text" id="${id}_jGraduate_fx" size="3" title="${i18next.t('config.jgraduate_enter_focal_x')}"/>
            <label>y:</label>
            <input type="text" id="${id}_jGraduate_fy" size="3" title="${i18next.t('config.jgraduate_enter_focal_y')}"/>
          </div>
        </div>
      </div>
      <div class="jGraduate_StopSection jGraduate_SpreadMethod">
        <label class="jGraduate_Form_Heading">${i18next.t('config.jgraduate_spread_method')}</label>
        <div class="jGraduate_Form_Section">
          <select class="jGraduate_spreadMethod" id="jGraduate_spreadMethod">
            <option value=pad selected>${i18next.t('properties.jgraduate_pad')}</option>
            <option value=reflect>${i18next.t('properties.jgraduate_reflect')}</option>
            <option value=repeat>${i18next.t('properties.jgraduate_repeat')}</option>
          </select>
        </div>
      </div>
      <div class="jGraduate_Form">
        <div class="jGraduate_Slider jGraduate_RadiusField jGraduate_rg_field">
          <label class="prelabel">${i18next.t('config.jgraduate_radius')}</label>
          <div id="${id}_jGraduate_Radius" class="jGraduate_SliderBar jGraduate_Radius" title="${i18next.t('config.jgraduate_set_radius')}">
            <img id="${id}_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="${$settings.images.clientPath}rangearrows2.gif">
          </div>
          <label><input type="text" id="${id}_jGraduate_RadiusInput" size="3" value="100"/>%</label>
        </div>
        <div class="jGraduate_Slider jGraduate_EllipField jGraduate_rg_field">
          <label class="prelabel">${i18next.t('config.jgraduate_ellip')}</label>
          <div id="${id}_jGraduate_Ellip" class="jGraduate_SliderBar jGraduate_Ellip" title="${i18next.t('config.jgraduate_set_ellip')}">
            <img id="${id}_jGraduate_EllipArrows" class="jGraduate_EllipArrows" src="${$settings.images.clientPath}rangearrows2.gif">
          </div>
          <label><input type="text" id="${id}_jGraduate_EllipInput" size="3" value="0"/>%</label>
        </div>
        <div class="jGraduate_Slider jGraduate_AngleField jGraduate_rg_field">
          <label class="prelabel">${i18next.t('config.jgraduate_angle')}</label>
          <div id="${id}_jGraduate_Angle" class="jGraduate_SliderBar jGraduate_Angle" title="${i18next.t('config.jgraduate_set_angle')}">
            <img id="${id}_jGraduate_AngleArrows" class="jGraduate_AngleArrows" src="${$settings.images.clientPath}rangearrows2.gif">
          </div>
          <label><input type="text" id="${id}_jGraduate_AngleInput" size="3" value="0"/>${i18next.t('config.jgraduate_deg')}</label>
        </div>
        <div class="jGraduate_Slider jGraduate_OpacField">
          <label class="prelabel">${i18next.t('config.jgraduate_opac')}</label>
          <div id="${id}_jGraduate_Opac" class="jGraduate_SliderBar jGraduate_Opac" title="${i18next.t('config.jgraduate_set_opac')}">
            <img id="${id}_jGraduate_OpacArrows" class="jGraduate_OpacArrows" src="${$settings.images.clientPath}rangearrows2.gif">
          </div>
          <label><input type="text" id="${id}_jGraduate_OpacInput" size="3" value="100"/>%</label>
        </div>
      </div>
      <div class="jGraduate_OkCancel">
        <input type="button" id="${id}_jGraduate_Ok" class="jGraduate_Ok" value="${i18next.t('common.ok')}"/>
        <input type="button" id="${id}_jGraduate_Cancel" class="jGraduate_Cancel" value="${i18next.t('common.cancel')}"/>
      </div>`
  const div = document.createElement('div')
  div.innerHTML = html
  while (div.children.length > 0) {
    gradPicker.appendChild(div.children[0])
  }
  /* eslint-enable max-len */
  // --------------
  // Set up all the SVG elements (the gradient, stops and rectangle)
  const MAX = 256
  const MARGINX = 0
  const MARGINY = 0
  // STOP_RADIUS = 15 / 2,
  const SIZEX = MAX - 2 * MARGINX
  const SIZEY = MAX - 2 * MARGINY

  const attrInput = {}

  const SLIDERW = 145
  const JQSliderBars = $this.querySelectorAll('.jGraduate_SliderBar')
  for (const JQSliderBar of JQSliderBars) {
    JQSliderBar.style.width = SLIDERW + 'px'
  }
  // JFH !!!!!!
  const container = $this.querySelector('#' + id + '_jGraduate_GradContainer')

  const svg = mkElem('svg', {
    id: id + '_jgraduate_svg',
    width: MAX,
    height: MAX,
    xmlns: ns.svg
  }, container)

  // This wasn't working as designed
  // let curType;
  // curType = curType || $this.paint.type;

  // if we are sent a gradient, import it
  let curType = $this.paint.type

  let grad = $this.paint[curType]
  let curGradient = grad

  const gradalpha = $this.paint.alpha

  const isSolid = curType === 'solidColor'

  // Make any missing gradients
  switch (curType) {
    case 'solidColor':
    // fall through
    case 'linearGradient':
      if (!isSolid) {
        curGradient.id = id + '_lg_jgraduate_grad'
        grad = curGradient = svg.appendChild(curGradient)
      }
      mkElem('radialGradient', {
        id: id + '_rg_jgraduate_grad'
      }, svg)
      if (curType === 'linearGradient') { break }
    // fall through
    case 'radialGradient':
      if (!isSolid) {
        curGradient.id = id + '_rg_jgraduate_grad'
        grad = curGradient = svg.appendChild(curGradient)
      }
      mkElem('linearGradient', {
        id: id + '_lg_jgraduate_grad'
      }, svg)
  }

  let stopGroup // eslint-disable-line prefer-const
  if (isSolid) {
    // JFH !!!!!!!!
    grad = curGradient = $this.querySelector('#' + id + '_lg_jgraduate_grad')
    color = $this.paint[curType]
    mkStop(0, '#' + color, 1)

    const type = typeof $settings.newstop

    if (type === 'string') {
      switch ($settings.newstop) {
        case 'same':
          mkStop(1, '#' + color, 1)
          break

        case 'inverse': {
        // Invert current color for second stop
          let inverted = ''
          for (let i = 0; i < 6; i += 2) {
          // const ch = color.substr(i, 2);
            let inv = (255 - Number.parseInt(color.substr(i, 2), 16)).toString(16)
            if (inv.length < 2) inv = 0 + inv
            inverted += inv
          }
          mkStop(1, '#' + inverted, 1)
          break
        } case 'white':
          mkStop(1, '#ffffff', 1)
          break

        case 'black':
          mkStop(1, '#000000', 1)
          break
      }
    } else if (type === 'object') {
      const opac = ('opac' in $settings.newstop) ? $settings.newstop.opac : 1
      mkStop(1, ($settings.newstop.color || '#' + color), opac)
    }
  }

  const x1 = Number.parseFloat(grad.getAttribute('x1') || 0.0)
  const y1 = Number.parseFloat(grad.getAttribute('y1') || 0.0)
  const x2 = Number.parseFloat(grad.getAttribute('x2') || 1.0)
  const y2 = Number.parseFloat(grad.getAttribute('y2') || 0.0)

  const cx = Number.parseFloat(grad.getAttribute('cx') || 0.5)
  const cy = Number.parseFloat(grad.getAttribute('cy') || 0.5)
  const fx = Number.parseFloat(grad.getAttribute('fx') || cx)
  const fy = Number.parseFloat(grad.getAttribute('fy') || cy)

  const previewRect = mkElem('rect', {
    id: id + '_jgraduate_rect',
    x: MARGINX,
    y: MARGINY,
    width: SIZEX,
    height: SIZEY,
    fill: 'url(#' + id + '_jgraduate_grad)',
    'fill-opacity': gradalpha / 100
  }, svg)

  // stop visuals created here
  const beginCoord = document.createElement('div')
  beginCoord.setAttribute('class', 'grad_coord jGraduate_lg_field')
  beginCoord.setAttribute('title', 'Begin Stop')
  beginCoord.textContent = 1
  beginCoord.style.top = y1 * MAX
  beginCoord.style.left = x1 * MAX
  beginCoord.dataset.coord = 'start'
  container.appendChild(beginCoord)

  const endCoord = document.createElement('div')
  endCoord.setAttribute('class', 'grad_coord jGraduate_lg_field')
  endCoord.setAttribute('title', 'End stop')
  endCoord.textContent = 2
  endCoord.style.top = y2 * MAX
  endCoord.style.left = x2 * MAX
  endCoord.dataset.coord = 'end'
  container.appendChild(endCoord)

  const centerCoord = document.createElement('div')
  centerCoord.setAttribute('class', 'grad_coord jGraduate_rg_field')
  centerCoord.setAttribute('title', 'Center stop')
  centerCoord.textContent = 'C'
  centerCoord.style.top = cy * MAX
  centerCoord.style.left = cx * MAX
  centerCoord.dataset.coord = 'center'
  container.appendChild(centerCoord)

  const focusCoord = document.createElement('div')
  focusCoord.setAttribute('class', 'grad_coord jGraduate_rg_field')
  focusCoord.setAttribute('title', 'Focus point')
  focusCoord.textContent = 'F'
  focusCoord.style.top = fy * MAX
  focusCoord.style.left = fx * MAX
  focusCoord.style.display = 'none'
  focusCoord.dataset.coord = 'focus'
  focusCoord.setAttribute('id', id + '_jGraduate_focusCoord')
  container.appendChild(focusCoord)

  let showFocus
  const onAttrChangeHandler = (e, attr, isRadial) => {
    // TODO: Support values < 0 and > 1 (zoomable preview?)
    if (isNaN(Number.parseFloat(e.target.value)) || e.target.value < 0) {
      e.target.value = 0.0
    } else if (e.target.value > 1) {
      e.target.value = 1.0
    }

    if (!(attr[0] === 'f' &&
      !showFocus) &&
      ((isRadial && curType === 'radialGradient') || (!isRadial && curType === 'linearGradient'))) {
      curGradient.setAttribute(attr, e.target.value)
    }

    const $elem = isRadial
      ? attr[0] === 'c' ? centerCoord : focusCoord
      : attr[1] === '1' ? beginCoord : endCoord

    if (attr.includes('x') === 'left') {
      $elem.style.left = e.target.value * MAX
    } else if (attr.includes('x') === 'top') {
      $elem.style.top = e.target.value * MAX
    }
  }
  for (const [, attr] of ['x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'fx', 'fy'].entries()) {
    const isRadial = isNaN(attr[1])

    let attrval = curGradient.getAttribute(attr)
    if (!attrval) {
      // Set defaults
      if (isRadial) {
        // For radial points
        attrval = '0.5'
      } else {
        // Only x2 is 1
        attrval = attr === 'x2' ? '1.0' : '0.0'
      }
    }

    attrInput[attr] = $this.querySelector('#' + id + '_jGraduate_' + attr)
    attrInput[attr].value = attrval
    attrInput[attr].addEventListener('change', (evt) => onAttrChangeHandler(evt, attr, isRadial))
    attrInput[attr].dispatchEvent(new Event('change'))
  }

  /**
   *
   * @param {Float} n
   * @param {Float|string} colr
   * @param {Float} opac
   * @param {boolean} [sel]
   * @param {SVGStopElement} [stopElem]
   * @returns {SVGStopElement}
   */
  function mkStop (n, colr, opac, sel, stopElem) {
    const stop = stopElem || mkElem('stop', {
      id: 'jq_stop_' + Math.floor((Math.random() * 10000) + 1),
      'stop-color': colr,
      'stop-opacity': opac,
      offset: n
    }, curGradient)
    if (stopElem) {
      colr = stopElem.getAttribute('stop-color')
      opac = stopElem.getAttribute('stop-opacity')
      n = stopElem.getAttribute('offset')
    } else {
      curGradient.appendChild(stop)
    }
    if (opac === null) opac = 1

    const pickerD = 'M-6.2,0.9c3.6-4,6.7-4.3,6.7-12.4c-0.2,7.9,' +
      '3.1,8.8,6.5,12.4c3.5,3.8,2.9,9.6,0,12.3c-3.1,2.8-10.4,' +
      '2.7-13.2,0C-9.6,9.9-9.4,4.4-6.2,0.9z'

    const pathbg = mkElem('path', {
      id: 'jq_pathbg_' + Math.floor((Math.random() * 10000) + 1),
      d: pickerD,
      fill: 'url(#jGraduate_trans)',
      transform: 'translate(' + (10 + n * MAX) + ', 26)'
    }, stopGroup)

    const path = mkElem('path', {
      d: pickerD,
      fill: colr,
      'fill-opacity': opac,
      transform: 'translate(' + (10 + n * MAX) + ', 26)',
      stroke: '#000',
      'stroke-width': 1.5
    }, stopGroup)

    path.addEventListener('mousedown', function (e) {
      selectStop(this)
      drag = curStop
      $win.addEventListener('mousemove', dragColor)
      $win.addEventListener('mouseup', remDrags)
      stopOffset = findPos(stopMakerDiv)
      e.preventDefault()
      return false
    })
    path.dataset.stop = stop.getAttribute('id')
    path.dataset.bg = pathbg.getAttribute('id')
    path.addEventListener('dblclick', function () {
      $this.querySelector('#jGraduate_LightBox').style.display = 'block'
      const colorhandle = this
      let stopOpacity = Number(stop.getAttribute('stop-opacity')) || 1
      let stopColor = stop.getAttribute('stop-color') || 1
      let thisAlpha = (Number.parseFloat(stopOpacity) * 255).toString(16)
      while (thisAlpha.length < 2) { thisAlpha = '0' + thisAlpha }
      colr = stopColor.substr(1) + thisAlpha
      const jqPickerElem = $this.querySelector('#' + id + '_jGraduate_stopPicker')
      jqPickerElem.style.left = '100px'
      jqPickerElem.style.bottom = '15px'
      jPickerMethod(jqPickerElem, {
        window: { title: 'Pick the start color and opacity for the gradient' },
        images: { clientPath: $settings.images.clientPath },
        color: { active: colr, alphaSupport: true }
      }, function (clr) {
        stopColor = clr.val('hex') ? ('#' + clr.val('hex')) : 'none'
        stopOpacity = clr.val('a') !== null ? clr.val('a') / 256 : 1
        colorhandle.setAttribute('fill', stopColor)
        colorhandle.setAttribute('fill-opacity', stopOpacity)
        stop.setAttribute('stop-color', stopColor)
        stop.setAttribute('stop-opacity', stopOpacity)
        $this.querySelector('#jGraduate_LightBox').style.display = 'none'
        $this.querySelector('#' + id + '_jGraduate_stopPicker').style.display = 'none'
      }, null, function () {
        $this.querySelector('#jGraduate_LightBox').style.display = 'none'
        $this.querySelector('#' + id + '_jGraduate_stopPicker').style.display = 'none'
      },
      i18next
      )
    })
    const jqStopEls = curGradient.querySelectorAll('stop')
    for (const jqStopEl of jqStopEls) {
      const curS = jqStopEl
      if (Number(jqStopEl.getAttribute('offset')) > n) {
        if (!colr) {
          const newcolor = jqStopEl.getAttribute('stop-color')
          const newopac = jqStopEl.getAttribute('stop-opacity')
          stop.setAttribute('stop-color', newcolor)
          path.setAttribute('fill', newcolor)
          stop.setAttribute('stop-opacity', newopac === null ? 1 : newopac)
          path.setAttribute('fill-opacity', newopac === null ? 1 : newopac)
        }
        curS.insertAdjacentElement('beforebegin', stop)
        // curS.before(stop);
        // return false;
      }
      // return true;
    }
    if (sel) selectStop(path)
    return stop
  }

  /**
  *
  * @returns {void}
  */
  function remStop () {
    delStop.setAttribute('display', 'none')
    const path = curStop
    delete path.dataset.stop
    delete path.dataset.bg
    curStop.parentNode.removeChild(curStop)
  }

  const stopMakerDiv = $this.querySelector('#' + id + '_jGraduate_StopSlider')

  let stops; let curStop; let drag

  const delStop = mkElem('path', {
    d: 'm9.75,-6l-19.5,19.5m0,-19.5l19.5,19.5',
    fill: 'none',
    stroke: '#D00',
    'stroke-width': 5,
    display: 'none'
  }, undefined) // stopMakerSVG);

  /**
  * @param {Element} item
  * @returns {void}
  */
  function selectStop (item) {
    if (curStop) curStop.setAttribute('stroke', '#000')
    item.setAttribute('stroke', 'blue')
    curStop = item
  }

  let stopOffset

  /**
  *
  * @returns {void}
  */
  function remDrags () {
    $win.removeEventListener('mousemove', dragColor)
    if (delStop.getAttribute('display') !== 'none') {
      remStop()
    }
    drag = null
  }

  let scaleX = 1; let scaleY = 1; let angle = 0

  let cX = cx
  let cY = cy
  /**
  *
  * @returns {void}
  */
  function xform () {
    const rot = angle ? 'rotate(' + angle + ',' + cX + ',' + cY + ') ' : ''
    if (scaleX === 1 && scaleY === 1) {
      curGradient.removeAttribute('gradientTransform')
    } else {
      const x = -cX * (scaleX - 1)
      const y = -cY * (scaleY - 1)
      curGradient.setAttribute(
        'gradientTransform',
        rot + 'translate(' + x + ',' + y + ') scale(' +
          scaleX + ',' + scaleY + ')'
      )
    }
  }

  /**
  * @param {Event} evt
  * @returns {void}
  */
  function dragColor (evt) {
    let x = evt.pageX - stopOffset.left
    const y = evt.pageY - stopOffset.top
    x = x < 10
      ? 10
      : x > MAX + 10
        ? MAX + 10
        : x

    const xfStr = 'translate(' + x + ', 26)'
    if (y < -60 || y > 130) {
      delStop.setAttribute('display', 'block')
      delStop.setAttribute('transform', xfStr)
    } else {
      delStop.setAttribute('display', 'none')
    }

    drag.setAttribute('transform', xfStr)
    const jqpgpath = $this.querySelector('#' + drag.dataset.bg)
    jqpgpath.setAttribute('transform', xfStr)
    const stop = $this.querySelector('#' + drag.dataset.stop)
    const sX = (x - 10) / MAX

    stop.setAttribute('offset', sX)

    let last = 0
    const jqStopElems = curGradient.querySelectorAll('stop');
    [].forEach.call(jqStopElems, function (jqStopElem) {
      const cur = jqStopElem.getAttribute('offset')
      const t = jqStopElem
      if (cur < last) {
        t.previousElementSibling.insertAdjacentElement('beforebegin', t)
        stops = curGradient.querySelectorAll('stop')
      }
      last = cur
    })
  }

  const stopMakerSVG = mkElem('svg', {
    width: '100%',
    height: 45
  }, stopMakerDiv)

  const transPattern = mkElem('pattern', {
    width: 16,
    height: 16,
    patternUnits: 'userSpaceOnUse',
    id: 'jGraduate_trans'
  }, stopMakerSVG)

  const transImg = mkElem('image', {
    width: 16,
    height: 16
  }, transPattern)

  const bgImage = $settings.images.clientPath + 'map-opacity.png'

  transImg.setAttributeNS(ns.xlink, 'xlink:href', bgImage)

  svgEditor.$click(stopMakerSVG, function (evt) {
    stopOffset = findPos(stopMakerDiv)
    const { target } = evt
    if (target.tagName === 'path') return
    let x = evt.pageX - stopOffset.left - 8
    x = x < 10 ? 10 : x > MAX + 10 ? MAX + 10 : x
    mkStop(x / MAX, 0, 0, true)
    evt.stopPropagation()
  })

  stopMakerSVG.addEventListener('mouseover', function () {
    stopMakerSVG.append(delStop)
  })

  stopGroup = mkElem('g', {}, stopMakerSVG)

  mkElem('line', {
    x1: 10,
    y1: 15,
    x2: MAX + 10,
    y2: 15,
    'stroke-width': 2,
    stroke: '#000'
  }, stopMakerSVG)
  const spreadMethodOpt = gradPicker.querySelector('#jGraduate_spreadMethod')
  spreadMethodOpt.addEventListener('change', function () {
    curGradient.setAttribute('spreadMethod', this.value)
  })

  // handle dragging the stop around the swatch
  let draggingCoord = null

  const onCoordDrag = function (evt) {
    let x = evt.pageX - offset.left
    let y = evt.pageY - offset.top

    // clamp stop to the swatch
    x = x < 0 ? 0 : x > MAX ? MAX : x
    y = y < 0 ? 0 : y > MAX ? MAX : y

    draggingCoord.style.left = x + 'px'
    draggingCoord.style.top = y + 'px'

    // calculate stop offset
    const fracx = x / SIZEX
    const fracy = y / SIZEY

    const type = draggingCoord.dataset.coord
    const grd = curGradient

    switch (type) {
      case 'start':
        attrInput.x1.value = fracx
        attrInput.y1.value = fracy
        grd.setAttribute('x1', fracx)
        grd.setAttribute('y1', fracy)
        break
      case 'end':
        attrInput.x2.value = fracx
        attrInput.y2.value = fracy
        grd.setAttribute('x2', fracx)
        grd.setAttribute('y2', fracy)
        break
      case 'center':
        attrInput.cx.value = fracx
        attrInput.cy.value = fracy
        grd.setAttribute('cx', fracx)
        grd.setAttribute('cy', fracy)
        cX = fracx
        cY = fracy
        xform()
        break
      case 'focus':
        attrInput.fx.value = fracx
        attrInput.fy.value = fracy
        grd.setAttribute('fx', fracx)
        grd.setAttribute('fy', fracy)
        xform()
    }

    evt.preventDefault()
  }

  const onCoordUp = function () {
    draggingCoord = null
    $win.removeEventListener('mousemove', onCoordDrag)
    $win.removeEventListener('mouseup', onCoordUp)
  }

  // Linear gradient
  // (function () {

  stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop')

  let numstops = stops.length
  // if there are not at least two stops, then
  if (numstops < 2) {
    while (numstops < 2) {
      curGradient.append(document.createElementNS(ns.svg, 'stop'))
      ++numstops
    }
    stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop')
  }

  for (let i = 0; i < numstops; i++) {
    mkStop(0, 0, 0, 0, stops[i])
  }

  spreadMethodOpt.setAttribute('value', curGradient.getAttribute('spreadMethod') || 'pad')

  let offset

  // No match, so show focus point
  showFocus = false

  previewRect.setAttribute('fill-opacity', gradalpha / 100)

  const JQGradCoords = $this.querySelectorAll('#' + id + ' div.grad_coord')
  const onMouseDownGradCoords = (e) => {
    e.preventDefault()
    draggingCoord = e.target
    offset = findPos(draggingCoord.parentNode)
    $win.addEventListener('mousemove', onCoordDrag)
    $win.addEventListener('mouseup', onCoordUp)
  }
  for (const JQGradCoord of JQGradCoords) {
    JQGradCoord.addEventListener('mousedown', onMouseDownGradCoords)
  }

  // bind GUI elements
  svgEditor.$click($this.querySelector('#' + id + '_jGraduate_Ok'), function () {
    $this.paint.type = curType
    $this.paint[curType] = curGradient.cloneNode(true)
    $this.paint.solidColor = null
    okClicked()
  })
  svgEditor.$click($this.querySelector('#' + id + '_jGraduate_Cancel'), cancelClicked)

  if (curType === 'radialGradient') {
    if (showFocus) {
      focusCoord.style.display = 'block'
    } else {
      focusCoord.style.display = 'none'
      attrInput.fx.value = ''
      attrInput.fy.value = ''
    }
  }

  $this.querySelector('#' + id + '_jGraduate_match_ctr').checked = !showFocus

  let lastfx; let lastfy
  const onMatchCtrHandler = (e) => {
    showFocus = !e.target.checked
    if (showFocus) {
      focusCoord.style.display = 'block'
    } else {
      focusCoord.style.display = 'none'
    }
    attrInput.fx.value = ''
    attrInput.fy.value = ''
    const grd = curGradient
    if (!showFocus) {
      lastfx = grd.getAttribute('fx')
      lastfy = grd.getAttribute('fy')
      grd.removeAttribute('fx')
      grd.removeAttribute('fy')
    } else {
      const fX = lastfx || 0.5
      const fY = lastfy || 0.5
      grd.setAttribute('fx', fX)
      grd.setAttribute('fy', fY)
      attrInput.fx.value = fX
      attrInput.fy.value = fY
    }
  }
  $this.querySelector('#' + id + '_jGraduate_match_ctr').addEventListener('change', onMatchCtrHandler)
  stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop')
  numstops = stops.length
  // if there are not at least two stops, then
  if (numstops < 2) {
    while (numstops < 2) {
      curGradient.append(document.createElementNS(ns.svg, 'stop'))
      ++numstops
    }
    stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop')
  }

  let slider

  const setSlider = function (e) {
    const { offset: { left } } = slider
    const divi = slider.parent
    let x = (e.pageX - left - Number.parseInt(getComputedStyle(divi, null).getPropertyValue('border-left-width')))
    if (x > SLIDERW) x = SLIDERW
    if (x <= 0) x = 0
    const posx = x - 5
    x /= SLIDERW

    switch (slider.type) {
      case 'radius':
        x = (x * 2) ** 2.5
        if (x > 0.98 && x < 1.02) x = 1
        if (x <= 0.01) x = 0.01
        curGradient.setAttribute('r', x)
        break
      case 'opacity':
        $this.paint.alpha = Number.parseInt(x * 100)
        previewRect.setAttribute('fill-opacity', x)
        break
      case 'ellip':
        scaleX = 1
        scaleY = 1
        if (x < 0.5) {
          x /= 0.5 // 0.001
          scaleX = x <= 0 ? 0.01 : x
        } else if (x > 0.5) {
          x /= 0.5 // 2
          x = 2 - x
          scaleY = x <= 0 ? 0.01 : x
        }
        xform()
        x -= 1
        if (scaleY === x + 1) {
          x = Math.abs(x)
        }
        break
      case 'angle':
        x -= 0.5
        angle = x *= 180
        xform()
        x /= 100
        break
    }
    slider.elem.style.marginLeft = posx + 'px'
    x = Math.round(x * 100)
    slider.input.value = x
  }

  let ellipVal = 0; let angleVal = 0

  if (curType === 'radialGradient') {
    const tlist = curGradient.gradientTransform.baseVal
    if (tlist.numberOfItems === 2) {
      const t = tlist.getItem(0)
      const s = tlist.getItem(1)
      if (t.type === 2 && s.type === 3) {
        const m = s.matrix
        if (m.a !== 1) {
          ellipVal = Math.round(-(1 - m.a) * 100)
        } else if (m.d !== 1) {
          ellipVal = Math.round((1 - m.d) * 100)
        }
      }
    } else if (tlist.numberOfItems === 3) {
      // Assume [R][T][S]
      const r = tlist.getItem(0)
      const t = tlist.getItem(1)
      const s = tlist.getItem(2)

      if (r.type === 4 &&
        t.type === 2 &&
        s.type === 3
      ) {
        angleVal = Math.round(r.angle)
        const m = s.matrix
        if (m.a !== 1) {
          ellipVal = Math.round(-(1 - m.a) * 100)
        } else if (m.d !== 1) {
          ellipVal = Math.round((1 - m.d) * 100)
        }
      }
    }
  }
  const sliders = {
    radius: {
      handle: '#' + id + '_jGraduate_RadiusArrows',
      input: '#' + id + '_jGraduate_RadiusInput',
      val: (curGradient.getAttribute('r') || 0.5) * 100
    },
    opacity: {
      handle: '#' + id + '_jGraduate_OpacArrows',
      input: '#' + id + '_jGraduate_OpacInput',
      val: $this.paint.alpha || 100
    },
    ellip: {
      handle: '#' + id + '_jGraduate_EllipArrows',
      input: '#' + id + '_jGraduate_EllipInput',
      val: ellipVal
    },
    angle: {
      handle: '#' + id + '_jGraduate_AngleArrows',
      input: '#' + id + '_jGraduate_AngleInput',
      val: angleVal
    }
  }
  for (const [, [type, data]] of Object.entries(Object.entries(sliders))) {
    const handle = $this.querySelector(data.handle)
    const sInput = $this.querySelector(data.input)
    handle.addEventListener('mousedown', function (evt) {
      const parent = handle.parentNode
      slider = {
        type,
        elem: handle,
        input: sInput,
        parent,
        offset: findPos(parent)
      }
      $win.addEventListener('mousemove', dragSlider)
      $win.addEventListener('mouseup', stopSlider)
      evt.preventDefault()
    })
    sInput.value = data.val
    sInput.addEventListener('change', function () {
      const isRad = curType === 'radialGradient'
      let val = Number(this.value)
      let xpos = 0
      switch (type) {
        case 'radius':
          if (isRad) curGradient.setAttribute('r', val / 100)
          xpos = (((val / 100) ** (1 / 2.5)) / 2) * SLIDERW
          break

        case 'opacity':
          $this.paint.alpha = val
          previewRect.setAttribute('fill-opacity', val / 100)
          xpos = val * (SLIDERW / 100)
          break

        case 'ellip':
          scaleX = scaleY = 1
          if (val === 0) {
            xpos = SLIDERW * 0.5
            break
          }
          if (val > 99.5) val = 99.5
          if (val > 0) {
            scaleY = 1 - (val / 100)
          } else {
            scaleX = -(val / 100) - 1
          }

          xpos = SLIDERW * ((val + 100) / 2) / 100
          if (isRad) xform()
          break

        case 'angle':
          angle = val
          xpos = angle / 180
          xpos += 0.5
          xpos *= SLIDERW
          if (isRad) xform()
      }
      if (xpos > SLIDERW) {
        xpos = SLIDERW
      } else if (xpos < 0) {
        xpos = 0
      }
      handle.style.marginLeft = (xpos - 5) + 'px'
    })
    sInput.dispatchEvent(new Event('change'))
  }

  const dragSlider = function (evt) {
    setSlider(evt)
    evt.preventDefault()
  }

  const stopSlider = function () {
    $win.removeEventListener('mousemove', dragSlider)
    $win.removeEventListener('mouseup', stopSlider)
    slider = null
  }

  // --------------
  let thisAlpha = ($this.paint.alpha * 255 / 100).toString(16)
  while (thisAlpha.length < 2) { thisAlpha = '0' + thisAlpha }
  thisAlpha = thisAlpha.split('.')[0]
  color = $this.paint.solidColor === 'none' ? '' : $this.paint.solidColor + thisAlpha

  if (!isSolid) {
    color = stops[0].getAttribute('stop-color')
  }
  // This should be done somewhere else, probably
  Object.assign(jPickerDefaults.window, {
    alphaSupport: true, effects: { type: 'show', speed: 0 }
  })

  jPickerMethod(
    colPicker,
    {
      window: { title: $settings.window.pickerTitle },
      images: { clientPath: $settings.images.clientPath },
      color: { active: color, alphaSupport: true }
    },
    function (clr) {
      $this.paint.type = 'solidColor'
      $this.paint.alpha = clr.val('ahex') ? Math.round((clr.val('a') / 255) * 100) : 100
      $this.paint.solidColor = clr.val('hex') ? clr.val('hex') : 'none'
      $this.paint.radialGradient = null
      okClicked()
    },
    null,
    function () { cancelClicked() },
    i18next
  )

  // JFH !!!!
  const tabs = $this.querySelectorAll('.jGraduate_tabs li')
  const onTabsClickHandler = (e) => {
    for (const tab of tabs) {
      tab.classList.remove('jGraduate_tab_current')
    }
    e.target.classList.add('jGraduate_tab_current')
    const innerDivs = $this.querySelectorAll(idref + ' > div');
    [].forEach.call(innerDivs, function (innerDiv) {
      innerDiv.style.display = 'none'
    })
    const type = e.target.dataset.type
    gradPicker.style.display = 'block'
    if (type === 'rg' || type === 'lg') {
      const tFileds = $this.querySelectorAll('.jGraduate_' + type + '_field');
      [].forEach.call(tFileds, function (tFiled) {
        tFiled.style.display = 'block'
      })
      const t1Fileds = $this.querySelectorAll('.jGraduate_' + (type === 'lg' ? 'rg' : 'lg') + '_field');
      [].forEach.call(t1Fileds, function (tFiled) {
        tFiled.style.display = 'none'
      })
      $this.querySelectorAll('#' + id + '_jgraduate_rect')[0]
        .setAttribute('fill', 'url(#' + id + '_' + type + '_jgraduate_grad)')
      curType = type === 'lg' ? 'linearGradient' : 'radialGradient'
      const jOpacInput = $this.querySelector('#' + id + '_jGraduate_OpacInput')
      jOpacInput.value = $this.paint.alpha
      jOpacInput.dispatchEvent(new Event('change'))
      const newGrad = $this.querySelectorAll('#' + id + '_' + type + '_jgraduate_grad')[0]
      if (curGradient !== newGrad) {
        const curStops = curGradient.querySelectorAll('stop')
        while (newGrad.firstChild) {
          newGrad.removeChild(newGrad.firstChild)
        }
        [].forEach.call(curStops, function (curS) {
          newGrad.appendChild(curS)
        })
        curGradient = newGrad
        const sm = spreadMethodOpt.getAttribute('value')
        curGradient.setAttribute('spreadMethod', sm)
      }
      showFocus = type === 'rg' && curGradient.getAttribute('fx') !== null && !(cx === fx && cy === fy)
      const jQfocusCoord = $this.querySelectorAll('#' + id + '_jGraduate_focusCoord')
      if (jQfocusCoord[0].style.display === 'none') {
        jQfocusCoord[0].style.display = 'block'
      } else {
        jQfocusCoord[0].style.display = 'none'
      }
      if (showFocus) {
        $this.querySelectorAll('#' + id + '_jGraduate_match_ctr')[0].checked = false
      }
    } else {
      gradPicker.style.display = 'none'
      colPicker.style.display = 'block'
    }
  }
  for (const tab of tabs) {
    svgEditor.$click(tab, onTabsClickHandler)
  }
  const innerDivs = $this.querySelectorAll(idref + ' > div');
  [].forEach.call(innerDivs, function (innerDiv) {
    innerDiv.style.display = 'none'
  })
  for (const tab of tabs) {
    tab.classList.remove('jGraduate_tab_current')
  }
  let tab
  switch ($this.paint.type) {
    case 'linearGradient':
      tab = $this.querySelector(idref + ' .jGraduate_tab_lingrad')
      break
    case 'radialGradient':
      tab = $this.querySelector(idref + ' .jGraduate_tab_radgrad')
      break
    default:
      tab = $this.querySelector(idref + ' .jGraduate_tab_color')
      break
  }
  $this.style.display = 'block'

  // jPicker will try to show after a 0ms timeout, so need to fire this after that
  setTimeout(() => {
    tab.classList.add('jGraduate_tab_current')
    tab.dispatchEvent(new Event('click'))
  }, 10)
}
