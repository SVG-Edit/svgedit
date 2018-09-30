/**
 * jGraduate 0.4
 *
 * jQuery Plugin for a gradient picker
 *
 * @module jGraduate
 * @copyright 2010 Jeff Schiller {@link http://blog.codedread.com/}, 2010 Alexis Deveria {@link http://a.deveria.com/}
 *
 * @license Apache-2.0
 * @example
 * // The Paint object is described below.
 * $.jGraduate.Paint() // constructs a 'none' color
 * @example $.jGraduate.Paint({copy: o}) // creates a copy of the paint o
 * @example $.jGraduate.Paint({hex: '#rrggbb'}) // creates a solid color paint with hex = "#rrggbb"
 * @example $.jGraduate.Paint({linearGradient: o, a: 50}) // creates a linear gradient paint with opacity=0.5
 * @example $.jGraduate.Paint({radialGradient: o, a: 7}) // creates a radial gradient paint with opacity=0.07
 * @example $.jGraduate.Paint({hex: '#rrggbb', linearGradient: o}) // throws an exception?
 *
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
};

if (!window.console) {
  window.console = {
    log (str) {},
    dir (str) {}
  };
}

/**
* Adds {@link external:jQuery.jGraduate.Paint}, {@link external:jQuery.fn.jGraduateDefaults}, {@link external:jQuery.fn.jGraduate}
* @function module:jGraduate.jGraduate
* @param {external:jQuery} $ The jQuery instance to wrap
* @returns {external:jQuery}
*/
export default function ($) {
  if (!$.loadingStylesheets) {
    $.loadingStylesheets = [];
  }
  const stylesheet = 'jgraduate/css/jGraduate.css';
  if (!$.loadingStylesheets.includes(stylesheet)) {
    $.loadingStylesheets.push(stylesheet);
  }

  /**
  * @typedef {PlainObject} module:jGraduate.jGraduatePaintOptions
  * @param {Float} [alpha]
  * @param {module:jGraduate~Paint} [copy] Copy paint object
  * @param {SVGLinearGradientElement} [linearGradient]
  * @param {SVGRadialGradientElement} [radialGradient]
  * @param {string} [solidColor]
  */

  /**
  * @memberof module:jGraduate~
  */
  class Paint {
    /**
     * @param {module:jGraduate.jGraduatePaintOptions} [opt]
    */
    constructor (opt) {
      const options = opt || {};
      this.alpha = isNaN(options.alpha) ? 100 : options.alpha;
      // copy paint object
      if (options.copy) {
        /**
         * @name module:jGraduate~Paint#type
         * @type {"none"|"solidColor"|"linearGradient"|"radialGradient"}
         */
        this.type = options.copy.type;
        /**
         * Represents opacity (0-100)
         * @name module:jGraduate~Paint#alpha
         * @type {Float}
         */
        this.alpha = options.copy.alpha;
        /**
         * Represents #RRGGBB hex of color
         * @name module:jGraduate~Paint#solidColor
         * @type {string}
         */
        this.solidColor = null;
        /**
         * @name module:jGraduate~Paint#linearGradient
         * @type {SVGLinearGradientElement}
         */
        this.linearGradient = null;
        /**
         * @name module:jGraduate~Paint#radialGradient
         * @type {SVGRadialGradientElement}
         */
        this.radialGradient = null;

        switch (this.type) {
        case 'none':
          break;
        case 'solidColor':
          this.solidColor = options.copy.solidColor;
          break;
        case 'linearGradient':
          this.linearGradient = options.copy.linearGradient.cloneNode(true);
          break;
        case 'radialGradient':
          this.radialGradient = options.copy.radialGradient.cloneNode(true);
          break;
        }
      // create linear gradient paint
      } else if (options.linearGradient) {
        this.type = 'linearGradient';
        this.solidColor = null;
        this.radialGradient = null;
        this.linearGradient = options.linearGradient.cloneNode(true);
      // create linear gradient paint
      } else if (options.radialGradient) {
        this.type = 'radialGradient';
        this.solidColor = null;
        this.linearGradient = null;
        this.radialGradient = options.radialGradient.cloneNode(true);
      // create solid color paint
      } else if (options.solidColor) {
        this.type = 'solidColor';
        this.solidColor = options.solidColor;
      // create empty paint
      } else {
        this.type = 'none';
        this.solidColor = null;
        this.linearGradient = null;
        this.radialGradient = null;
      }
    }
  }
  /**
  * @namespace {PlainObject} jGraduate
  * @memberof external:jQuery
  */
  $.jGraduate = /** @lends external:jQuery.jGraduate */ {
    /**
    * @class external:jQuery.jGraduate.Paint
    * @see module:jGraduate~Paint
    */
    Paint
  };

  // JSDoc doesn't show this as belonging to our `module:jGraduate.Options` type,
  //   so we use `@see`
  /**
  * @namespace {module:jGraduate.Options} jGraduateDefaults
  * @memberof external:jQuery.fn
  */
  $.fn.jGraduateDefaults = /** @lends external:jQuery.fn.jGraduateDefaults */ {
    /**
    * Creates an object with a 'none' color
    * @type {external:jQuery.jGraduate.Paint}
    * @see module:jGraduate.Options
    */
    paint: new $.jGraduate.Paint(),
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
  };

  const isGecko = navigator.userAgent.includes('Gecko/');

  function setAttrs (elem, attrs) {
    if (isGecko) {
      for (const aname in attrs) elem.setAttribute(aname, attrs[aname]);
    } else {
      for (const aname in attrs) {
        const val = attrs[aname], prop = elem[aname];
        if (prop && prop.constructor === 'SVGLength') {
          prop.baseVal.value = val;
        } else {
          elem.setAttribute(aname, val);
        }
      }
    }
  }

  function mkElem (name, attrs, newparent) {
    const elem = document.createElementNS(ns.svg, name);
    setAttrs(elem, attrs);
    if (newparent) {
      newparent.append(elem);
    }
    return elem;
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
  * @property {string} [window.pickerTitle='Drag markers to pick a paint']
  * @property {PlainObject} [images]
  * @property {string} [images.clientPath='images/']
  * @property {"same"|"inverse"|"black"|"white"|module:jGraduate.ColorOpac} [newstop="inverse"]
  */

  /**
  * @callback external:jQuery.fn.jGraduate.OkCallback
  * @param {external:jQuery.jGraduate.Paint} paint
  * @returns {undefined}
  */
  /**
  * @callback external:jQuery.fn.jGraduate.CancelCallback
  * @returns {undefined}
  */

  /**
  * @function external:jQuery.fn.jGraduate
  * @param {module:jGraduate.Options} [options]
  * @param {external:jQuery.fn.jGraduate.OkCallback} [okCallback] Called with a Paint object when Ok is pressed
  * @param {external:jQuery.fn.jGraduate.CancelCallback} [cancelCallback] Called with no arguments when Cancel is pressed
  * @returns {external:jQuery}
  */
  $.fn.jGraduate = function (options, okCallback, cancelCallback) {
    return this.each(function () {
      const $this = $(this),
        $settings = $.extend(true, {}, $.fn.jGraduateDefaults, options || {}),
        id = $this.attr('id'),
        idref = '#' + $this.attr('id') + ' ';

      if (!idref) {
        alert('Container element must have an id attribute to maintain unique id strings for sub-elements.');
        return;
      }

      const okClicked = function () {
        switch ($this.paint.type) {
        case 'radialGradient':
          $this.paint.linearGradient = null;
          break;
        case 'linearGradient':
          $this.paint.radialGradient = null;
          break;
        case 'solidColor':
          $this.paint.radialGradient = $this.paint.linearGradient = null;
          break;
        }
        typeof $this.okCallback === 'function' && $this.okCallback($this.paint);
        $this.hide();
      };
      const cancelClicked = function () {
        typeof $this.cancelCallback === 'function' && $this.cancelCallback();
        $this.hide();
      };

      $.extend(true, $this, { // public properties, methods, and callbacks
        // make a copy of the incoming paint
        paint: new $.jGraduate.Paint({copy: $settings.paint}),
        okCallback: typeof okCallback === 'function' ? okCallback : null,
        cancelCallback: typeof cancelCallback === 'function' ? cancelCallback : null
      });

      let // pos = $this.position(),
        color = null;
      const $win = $(window);

      if ($this.paint.type === 'none') {
        $this.paint = new $.jGraduate.Paint({solidColor: 'ffffff'});
      }

      $this.addClass('jGraduate_Picker');
      $this.html(
        '<ul class="jGraduate_tabs">' +
          '<li class="jGraduate_tab_color jGraduate_tab_current" data-type="col">Solid Color</li>' +
          '<li class="jGraduate_tab_lingrad" data-type="lg">Linear Gradient</li>' +
          '<li class="jGraduate_tab_radgrad" data-type="rg">Radial Gradient</li>' +
        '</ul>' +
        '<div class="jGraduate_colPick"></div>' +
        '<div class="jGraduate_gradPick"></div>' +
        '<div class="jGraduate_LightBox"></div>' +
        '<div id="' + id + '_jGraduate_stopPicker" class="jGraduate_stopPicker"></div>'
      );
      const colPicker = $(idref + '> .jGraduate_colPick');
      const gradPicker = $(idref + '> .jGraduate_gradPick');

      gradPicker.html(
        '<div id="' + id + '_jGraduate_Swatch" class="jGraduate_Swatch">' +
          '<h2 class="jGraduate_Title">' + $settings.window.pickerTitle + '</h2>' +
          '<div id="' + id + '_jGraduate_GradContainer" class="jGraduate_GradContainer"></div>' +
          '<div id="' + id + '_jGraduate_StopSlider" class="jGraduate_StopSlider"></div>' +
        '</div>' +
        '<div class="jGraduate_Form jGraduate_Points jGraduate_lg_field">' +
          '<div class="jGraduate_StopSection">' +
            '<label class="jGraduate_Form_Heading">Begin Point</label>' +
            '<div class="jGraduate_Form_Section">' +
              '<label>x:</label>' +
              '<input type="text" id="' + id + '_jGraduate_x1" size="3" title="Enter starting x value between 0.0 and 1.0"/>' +
              '<label>y:</label>' +
              '<input type="text" id="' + id + '_jGraduate_y1" size="3" title="Enter starting y value between 0.0 and 1.0"/>' +
            '</div>' +
          '</div>' +
          '<div class="jGraduate_StopSection">' +
            '<label class="jGraduate_Form_Heading">End Point</label>' +
            '<div class="jGraduate_Form_Section">' +
              '<label>x:</label>' +
              '<input type="text" id="' + id + '_jGraduate_x2" size="3" title="Enter ending x value between 0.0 and 1.0"/>' +
              '<label>y:</label>' +
              '<input type="text" id="' + id + '_jGraduate_y2" size="3" title="Enter ending y value between 0.0 and 1.0"/>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="jGraduate_Form jGraduate_Points jGraduate_rg_field">' +
          '<div class="jGraduate_StopSection">' +
            '<label class="jGraduate_Form_Heading">Center Point</label>' +
            '<div class="jGraduate_Form_Section">' +
              '<label>x:</label>' +
              '<input type="text" id="' + id + '_jGraduate_cx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
              '<label>y:</label>' +
              '<input type="text" id="' + id + '_jGraduate_cy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
            '</div>' +
          '</div>' +
          '<div class="jGraduate_StopSection">' +
            '<label class="jGraduate_Form_Heading">Focal Point</label>' +
            '<div class="jGraduate_Form_Section">' +
              '<label>Match center: <input type="checkbox" checked="checked" id="' + id + '_jGraduate_match_ctr"/></label><br/>' +
              '<label>x:</label>' +
              '<input type="text" id="' + id + '_jGraduate_fx" size="3" title="Enter x value between 0.0 and 1.0"/>' +
              '<label>y:</label>' +
              '<input type="text" id="' + id + '_jGraduate_fy" size="3" title="Enter y value between 0.0 and 1.0"/>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="jGraduate_StopSection jGraduate_SpreadMethod">' +
          '<label class="jGraduate_Form_Heading">Spread method</label>' +
          '<div class="jGraduate_Form_Section">' +
            '<select class="jGraduate_spreadMethod">' +
              '<option value=pad selected>Pad</option>' +
              '<option value=reflect>Reflect</option>' +
              '<option value=repeat>Repeat</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="jGraduate_Form">' +
          '<div class="jGraduate_Slider jGraduate_RadiusField jGraduate_rg_field">' +
            '<label class="prelabel">Radius:</label>' +
            '<div id="' + id + '_jGraduate_Radius" class="jGraduate_SliderBar jGraduate_Radius" title="Click to set radius">' +
              '<img id="' + id + '_jGraduate_RadiusArrows" class="jGraduate_RadiusArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
            '</div>' +
            '<label><input type="text" id="' + id + '_jGraduate_RadiusInput" size="3" value="100"/>%</label>' +
          '</div>' +
          '<div class="jGraduate_Slider jGraduate_EllipField jGraduate_rg_field">' +
            '<label class="prelabel">Ellip:</label>' +
            '<div id="' + id + '_jGraduate_Ellip" class="jGraduate_SliderBar jGraduate_Ellip" title="Click to set Ellip">' +
              '<img id="' + id + '_jGraduate_EllipArrows" class="jGraduate_EllipArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
            '</div>' +
            '<label><input type="text" id="' + id + '_jGraduate_EllipInput" size="3" value="0"/>%</label>' +
          '</div>' +
          '<div class="jGraduate_Slider jGraduate_AngleField jGraduate_rg_field">' +
            '<label class="prelabel">Angle:</label>' +
            '<div id="' + id + '_jGraduate_Angle" class="jGraduate_SliderBar jGraduate_Angle" title="Click to set Angle">' +
              '<img id="' + id + '_jGraduate_AngleArrows" class="jGraduate_AngleArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
            '</div>' +
            '<label><input type="text" id="' + id + '_jGraduate_AngleInput" size="3" value="0"/>deg</label>' +
          '</div>' +
          '<div class="jGraduate_Slider jGraduate_OpacField">' +
            '<label class="prelabel">Opac:</label>' +
            '<div id="' + id + '_jGraduate_Opac" class="jGraduate_SliderBar jGraduate_Opac" title="Click to set Opac">' +
              '<img id="' + id + '_jGraduate_OpacArrows" class="jGraduate_OpacArrows" src="' + $settings.images.clientPath + 'rangearrows2.gif">' +
            '</div>' +
            '<label><input type="text" id="' + id + '_jGraduate_OpacInput" size="3" value="100"/>%</label>' +
          '</div>' +
        '</div>' +
        '<div class="jGraduate_OkCancel">' +
          '<input type="button" id="' + id + '_jGraduate_Ok" class="jGraduate_Ok" value="OK"/>' +
          '<input type="button" id="' + id + '_jGraduate_Cancel" class="jGraduate_Cancel" value="Cancel"/>' +
        '</div>');

      // --------------
      // Set up all the SVG elements (the gradient, stops and rectangle)
      const MAX = 256,
        MARGINX = 0,
        MARGINY = 0,
        // STOP_RADIUS = 15 / 2,
        SIZEX = MAX - 2 * MARGINX,
        SIZEY = MAX - 2 * MARGINY;

      const attrInput = {};

      const SLIDERW = 145;
      $('.jGraduate_SliderBar').width(SLIDERW);

      const container = $('#' + id + '_jGraduate_GradContainer')[0];

      const svg = mkElem('svg', {
        id: id + '_jgraduate_svg',
        width: MAX,
        height: MAX,
        xmlns: ns.svg
      }, container);

      // This wasn't working as designed
      // let curType;
      // curType = curType || $this.paint.type;

      // if we are sent a gradient, import it
      let curType = $this.paint.type;

      let grad = $this.paint[curType];
      let curGradient = grad;

      const gradalpha = $this.paint.alpha;

      const isSolid = curType === 'solidColor';

      // Make any missing gradients
      switch (curType) {
      case 'solidColor':
        // fall through
      case 'linearGradient':
        if (!isSolid) {
          curGradient.id = id + '_lg_jgraduate_grad';
          grad = curGradient = svg.appendChild(curGradient); // .cloneNode(true));
        }
        mkElem('radialGradient', {
          id: id + '_rg_jgraduate_grad'
        }, svg);
        if (curType === 'linearGradient') { break; }
        // fall through
      case 'radialGradient':
        if (!isSolid) {
          curGradient.id = id + '_rg_jgraduate_grad';
          grad = curGradient = svg.appendChild(curGradient); // .cloneNode(true));
        }
        mkElem('linearGradient', {
          id: id + '_lg_jgraduate_grad'
        }, svg);
      }

      let stopGroup; // eslint-disable-line prefer-const
      if (isSolid) {
        grad = curGradient = $('#' + id + '_lg_jgraduate_grad')[0];
        color = $this.paint[curType];
        mkStop(0, '#' + color, 1);

        const type = typeof $settings.newstop;

        if (type === 'string') {
          switch ($settings.newstop) {
          case 'same':
            mkStop(1, '#' + color, 1);
            break;

          case 'inverse':
            // Invert current color for second stop
            let inverted = '';
            for (let i = 0; i < 6; i += 2) {
              // const ch = color.substr(i, 2);
              let inv = (255 - parseInt(color.substr(i, 2), 16)).toString(16);
              if (inv.length < 2) inv = 0 + inv;
              inverted += inv;
            }
            mkStop(1, '#' + inverted, 1);
            break;

          case 'white':
            mkStop(1, '#ffffff', 1);
            break;

          case 'black':
            mkStop(1, '#000000', 1);
            break;
          }
        } else if (type === 'object') {
          const opac = ('opac' in $settings.newstop) ? $settings.newstop.opac : 1;
          mkStop(1, ($settings.newstop.color || '#' + color), opac);
        }
      }

      const x1 = parseFloat(grad.getAttribute('x1') || 0.0),
        y1 = parseFloat(grad.getAttribute('y1') || 0.0),
        x2 = parseFloat(grad.getAttribute('x2') || 1.0),
        y2 = parseFloat(grad.getAttribute('y2') || 0.0);

      const cx = parseFloat(grad.getAttribute('cx') || 0.5),
        cy = parseFloat(grad.getAttribute('cy') || 0.5),
        fx = parseFloat(grad.getAttribute('fx') || cx),
        fy = parseFloat(grad.getAttribute('fy') || cy);

      const previewRect = mkElem('rect', {
        id: id + '_jgraduate_rect',
        x: MARGINX,
        y: MARGINY,
        width: SIZEX,
        height: SIZEY,
        fill: 'url(#' + id + '_jgraduate_grad)',
        'fill-opacity': gradalpha / 100
      }, svg);

      // stop visuals created here
      const beginCoord = $('<div/>').attr({
        class: 'grad_coord jGraduate_lg_field',
        title: 'Begin Stop'
      }).text(1).css({
        top: y1 * MAX,
        left: x1 * MAX
      }).data('coord', 'start').appendTo(container);

      const endCoord = beginCoord.clone().text(2).css({
        top: y2 * MAX,
        left: x2 * MAX
      }).attr('title', 'End stop').data('coord', 'end').appendTo(container);

      const centerCoord = $('<div/>').attr({
        class: 'grad_coord jGraduate_rg_field',
        title: 'Center stop'
      }).text('C').css({
        top: cy * MAX,
        left: cx * MAX
      }).data('coord', 'center').appendTo(container);

      const focusCoord = centerCoord.clone().text('F').css({
        top: fy * MAX,
        left: fx * MAX,
        display: 'none'
      }).attr('title', 'Focus point').data('coord', 'focus').appendTo(container);

      focusCoord[0].id = id + '_jGraduate_focusCoord';

      // const coords = $(idref + ' .grad_coord');

      // $(container).hover(function () {
      //   coords.animate({
      //     opacity: 1
      //   }, 500);
      // }, function () {
      //   coords.animate({
      //     opacity: .2
      //   }, 500);
      // });

      let showFocus;
      $.each(['x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'fx', 'fy'], function (i, attr) {
        const isRadial = isNaN(attr[1]);

        let attrval = curGradient.getAttribute(attr);
        if (!attrval) {
          // Set defaults
          if (isRadial) {
            // For radial points
            attrval = '0.5';
          } else {
            // Only x2 is 1
            attrval = attr === 'x2' ? '1.0' : '0.0';
          }
        }

        attrInput[attr] = $('#' + id + '_jGraduate_' + attr)
          .val(attrval)
          .change(function () {
            // TODO: Support values < 0 and > 1 (zoomable preview?)
            if (isNaN(parseFloat(this.value)) || this.value < 0) {
              this.value = 0.0;
            } else if (this.value > 1) {
              this.value = 1.0;
            }

            if (!(attr[0] === 'f' && !showFocus)) {
              if ((isRadial && curType === 'radialGradient') || (!isRadial && curType === 'linearGradient')) {
                curGradient.setAttribute(attr, this.value);
              }
            }

            const $elem = isRadial
              ? attr[0] === 'c' ? centerCoord : focusCoord
              : attr[1] === '1' ? beginCoord : endCoord;

            const cssName = attr.includes('x') ? 'left' : 'top';

            $elem.css(cssName, this.value * MAX);
          }).change();
      });

      function mkStop (n, color, opac, sel, stopElem) {
        const stop = stopElem || mkElem('stop', {'stop-color': color, 'stop-opacity': opac, offset: n}, curGradient);
        if (stopElem) {
          color = stopElem.getAttribute('stop-color');
          opac = stopElem.getAttribute('stop-opacity');
          n = stopElem.getAttribute('offset');
        } else {
          curGradient.append(stop);
        }
        if (opac === null) opac = 1;

        const pickerD = 'M-6.2,0.9c3.6-4,6.7-4.3,6.7-12.4c-0.2,7.9,3.1,8.8,6.5,12.4c3.5,3.8,2.9,9.6,0,12.3c-3.1,2.8-10.4,2.7-13.2,0C-9.6,9.9-9.4,4.4-6.2,0.9z';

        const pathbg = mkElem('path', {
          d: pickerD,
          fill: 'url(#jGraduate_trans)',
          transform: 'translate(' + (10 + n * MAX) + ', 26)'
        }, stopGroup);

        const path = mkElem('path', {
          d: pickerD,
          fill: color,
          'fill-opacity': opac,
          transform: 'translate(' + (10 + n * MAX) + ', 26)',
          stroke: '#000',
          'stroke-width': 1.5
        }, stopGroup);

        $(path).mousedown(function (e) {
          selectStop(this);
          drag = curStop;
          $win.mousemove(dragColor).mouseup(remDrags);
          stopOffset = stopMakerDiv.offset();
          e.preventDefault();
          return false;
        }).data('stop', stop).data('bg', pathbg).dblclick(function () {
          $('div.jGraduate_LightBox').show();
          const colorhandle = this;
          let stopOpacity = +stop.getAttribute('stop-opacity') || 1;
          let stopColor = stop.getAttribute('stop-color') || 1;
          let thisAlpha = (parseFloat(stopOpacity) * 255).toString(16);
          while (thisAlpha.length < 2) { thisAlpha = '0' + thisAlpha; }
          color = stopColor.substr(1) + thisAlpha;
          $('#' + id + '_jGraduate_stopPicker').css({left: 100, bottom: 15}).jPicker({
            window: {title: 'Pick the start color and opacity for the gradient'},
            images: {clientPath: $settings.images.clientPath},
            color: {active: color, alphaSupport: true}
          }, function (color, arg2) {
            stopColor = color.val('hex') ? ('#' + color.val('hex')) : 'none';
            stopOpacity = color.val('a') !== null ? color.val('a') / 256 : 1;
            colorhandle.setAttribute('fill', stopColor);
            colorhandle.setAttribute('fill-opacity', stopOpacity);
            stop.setAttribute('stop-color', stopColor);
            stop.setAttribute('stop-opacity', stopOpacity);
            $('div.jGraduate_LightBox').hide();
            $('#' + id + '_jGraduate_stopPicker').hide();
          }, null, function () {
            $('div.jGraduate_LightBox').hide();
            $('#' + id + '_jGraduate_stopPicker').hide();
          });
        });

        $(curGradient).find('stop').each(function () {
          const curS = $(this);
          if (+this.getAttribute('offset') > n) {
            if (!color) {
              const newcolor = this.getAttribute('stop-color');
              const newopac = this.getAttribute('stop-opacity');
              stop.setAttribute('stop-color', newcolor);
              path.setAttribute('fill', newcolor);
              stop.setAttribute('stop-opacity', newopac === null ? 1 : newopac);
              path.setAttribute('fill-opacity', newopac === null ? 1 : newopac);
            }
            curS.before(stop);
            return false;
          }
        });
        if (sel) selectStop(path);
        return stop;
      }

      function remStop () {
        delStop.setAttribute('display', 'none');
        const path = $(curStop);
        const stop = path.data('stop');
        const bg = path.data('bg');
        $([curStop, stop, bg]).remove();
      }

      const stopMakerDiv = $('#' + id + '_jGraduate_StopSlider');

      let stops, curStop, drag;

      const delStop = mkElem('path', {
        d: 'm9.75,-6l-19.5,19.5m0,-19.5l19.5,19.5',
        fill: 'none',
        stroke: '#D00',
        'stroke-width': 5,
        display: 'none'
      }, undefined); // stopMakerSVG);

      function selectStop (item) {
        if (curStop) curStop.setAttribute('stroke', '#000');
        item.setAttribute('stroke', 'blue');
        curStop = item;
        curStop.parentNode.append(curStop);
        //   stops = $('stop');
        //   opac_select.val(curStop.attr('fill-opacity') || 1);
        //   root.append(delStop);
      }

      let stopOffset;

      function remDrags () {
        $win.unbind('mousemove', dragColor);
        if (delStop.getAttribute('display') !== 'none') {
          remStop();
        }
        drag = null;
      }

      let scaleX = 1, scaleY = 1, angle = 0;

      let cX = cx;
      let cY = cy;
      function xform () {
        const rot = angle ? 'rotate(' + angle + ',' + cX + ',' + cY + ') ' : '';
        if (scaleX === 1 && scaleY === 1) {
          curGradient.removeAttribute('gradientTransform');
          // $('#ang').addClass('dis');
        } else {
          const x = -cX * (scaleX - 1);
          const y = -cY * (scaleY - 1);
          curGradient.setAttribute('gradientTransform', rot + 'translate(' + x + ',' + y + ') scale(' + scaleX + ',' + scaleY + ')');
          // $('#ang').removeClass('dis');
        }
      }

      function dragColor (evt) {
        let x = evt.pageX - stopOffset.left;
        const y = evt.pageY - stopOffset.top;
        x = x < 10
          ? 10
          : x > MAX + 10
            ? MAX + 10
            : x;

        const xfStr = 'translate(' + x + ', 26)';
        if (y < -60 || y > 130) {
          delStop.setAttribute('display', 'block');
          delStop.setAttribute('transform', xfStr);
        } else {
          delStop.setAttribute('display', 'none');
        }

        drag.setAttribute('transform', xfStr);
        $.data(drag, 'bg').setAttribute('transform', xfStr);
        const stop = $.data(drag, 'stop');
        const sX = (x - 10) / MAX;

        stop.setAttribute('offset', sX);

        let last = 0;
        $(curGradient).find('stop').each(function (i) {
          const cur = this.getAttribute('offset');
          const t = $(this);
          if (cur < last) {
            t.prev().before(t);
            stops = $(curGradient).find('stop');
          }
          last = cur;
        });
      }

      const stopMakerSVG = mkElem('svg', {
        width: '100%',
        height: 45
      }, stopMakerDiv[0]);

      const transPattern = mkElem('pattern', {
        width: 16,
        height: 16,
        patternUnits: 'userSpaceOnUse',
        id: 'jGraduate_trans'
      }, stopMakerSVG);

      const transImg = mkElem('image', {
        width: 16,
        height: 16
      }, transPattern);

      const bgImage = $settings.images.clientPath + 'map-opacity.png';

      transImg.setAttributeNS(ns.xlink, 'xlink:href', bgImage);

      $(stopMakerSVG).click(function (evt) {
        stopOffset = stopMakerDiv.offset();
        const {target} = evt;
        if (target.tagName === 'path') return;
        let x = evt.pageX - stopOffset.left - 8;
        x = x < 10 ? 10 : x > MAX + 10 ? MAX + 10 : x;
        mkStop(x / MAX, 0, 0, true);
        evt.stopPropagation();
      });

      $(stopMakerSVG).mouseover(function () {
        stopMakerSVG.append(delStop);
      });

      stopGroup = mkElem('g', {}, stopMakerSVG);

      mkElem('line', {
        x1: 10,
        y1: 15,
        x2: MAX + 10,
        y2: 15,
        'stroke-width': 2,
        stroke: '#000'
      }, stopMakerSVG);

      const spreadMethodOpt = gradPicker.find('.jGraduate_spreadMethod').change(function () {
        curGradient.setAttribute('spreadMethod', $(this).val());
      });

      // handle dragging the stop around the swatch
      let draggingCoord = null;

      const onCoordDrag = function (evt) {
        let x = evt.pageX - offset.left;
        let y = evt.pageY - offset.top;

        // clamp stop to the swatch
        x = x < 0 ? 0 : x > MAX ? MAX : x;
        y = y < 0 ? 0 : y > MAX ? MAX : y;

        draggingCoord.css('left', x).css('top', y);

        // calculate stop offset
        const fracx = x / SIZEX;
        const fracy = y / SIZEY;

        const type = draggingCoord.data('coord');
        const grad = curGradient;

        switch (type) {
        case 'start':
          attrInput.x1.val(fracx);
          attrInput.y1.val(fracy);
          grad.setAttribute('x1', fracx);
          grad.setAttribute('y1', fracy);
          break;
        case 'end':
          attrInput.x2.val(fracx);
          attrInput.y2.val(fracy);
          grad.setAttribute('x2', fracx);
          grad.setAttribute('y2', fracy);
          break;
        case 'center':
          attrInput.cx.val(fracx);
          attrInput.cy.val(fracy);
          grad.setAttribute('cx', fracx);
          grad.setAttribute('cy', fracy);
          cX = fracx;
          cY = fracy;
          xform();
          break;
        case 'focus':
          attrInput.fx.val(fracx);
          attrInput.fy.val(fracy);
          grad.setAttribute('fx', fracx);
          grad.setAttribute('fy', fracy);
          xform();
        }

        evt.preventDefault();
      };

      const onCoordUp = function () {
        draggingCoord = null;
        $win.unbind('mousemove', onCoordDrag).unbind('mouseup', onCoordUp);
      };

      // Linear gradient
      // (function () {

      stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');

      let numstops = stops.length;
      // if there are not at least two stops, then
      if (numstops < 2) {
        while (numstops < 2) {
          curGradient.append(document.createElementNS(ns.svg, 'stop'));
          ++numstops;
        }
        stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
      }

      for (let i = 0; i < numstops; i++) {
        mkStop(0, 0, 0, 0, stops[i]);
      }

      spreadMethodOpt.val(curGradient.getAttribute('spreadMethod') || 'pad');

      let offset;

      // No match, so show focus point
      showFocus = false;

      previewRect.setAttribute('fill-opacity', gradalpha / 100);

      $('#' + id + ' div.grad_coord').mousedown(function (evt) {
        evt.preventDefault();
        draggingCoord = $(this);
        // const sPos = draggingCoord.offset();
        offset = draggingCoord.parent().offset();
        $win.mousemove(onCoordDrag).mouseup(onCoordUp);
      });

      // bind GUI elements
      $('#' + id + '_jGraduate_Ok').bind('click', function () {
        $this.paint.type = curType;
        $this.paint[curType] = curGradient.cloneNode(true);
        $this.paint.solidColor = null;
        okClicked();
      });
      $('#' + id + '_jGraduate_Cancel').bind('click', function (paint) {
        cancelClicked();
      });

      if (curType === 'radialGradient') {
        if (showFocus) {
          focusCoord.show();
        } else {
          focusCoord.hide();
          attrInput.fx.val('');
          attrInput.fy.val('');
        }
      }

      $('#' + id + '_jGraduate_match_ctr')[0].checked = !showFocus;

      let lastfx, lastfy;

      $('#' + id + '_jGraduate_match_ctr').change(function () {
        showFocus = !this.checked;
        focusCoord.toggle(showFocus);
        attrInput.fx.val('');
        attrInput.fy.val('');
        const grad = curGradient;
        if (!showFocus) {
          lastfx = grad.getAttribute('fx');
          lastfy = grad.getAttribute('fy');
          grad.removeAttribute('fx');
          grad.removeAttribute('fy');
        } else {
          const fx = lastfx || 0.5;
          const fy = lastfy || 0.5;
          grad.setAttribute('fx', fx);
          grad.setAttribute('fy', fy);
          attrInput.fx.val(fx);
          attrInput.fy.val(fy);
        }
      });

      stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
      numstops = stops.length;
      // if there are not at least two stops, then
      if (numstops < 2) {
        while (numstops < 2) {
          curGradient.append(document.createElementNS(ns.svg, 'stop'));
          ++numstops;
        }
        stops = curGradient.getElementsByTagNameNS(ns.svg, 'stop');
      }

      let slider;

      const setSlider = function (e) {
        const {offset} = slider;
        const div = slider.parent;
        let x = (e.pageX - offset.left - parseInt(div.css('border-left-width')));
        if (x > SLIDERW) x = SLIDERW;
        if (x <= 0) x = 0;
        const posx = x - 5;
        x /= SLIDERW;

        switch (slider.type) {
        case 'radius':
          x = Math.pow(x * 2, 2.5);
          if (x > 0.98 && x < 1.02) x = 1;
          if (x <= 0.01) x = 0.01;
          curGradient.setAttribute('r', x);
          break;
        case 'opacity':
          $this.paint.alpha = parseInt(x * 100);
          previewRect.setAttribute('fill-opacity', x);
          break;
        case 'ellip':
          scaleX = 1;
          scaleY = 1;
          if (x < 0.5) {
            x /= 0.5; // 0.001
            scaleX = x <= 0 ? 0.01 : x;
          } else if (x > 0.5) {
            x /= 0.5; // 2
            x = 2 - x;
            scaleY = x <= 0 ? 0.01 : x;
          }
          xform();
          x -= 1;
          if (scaleY === x + 1) {
            x = Math.abs(x);
          }
          break;
        case 'angle':
          x = x - 0.5;
          angle = x *= 180;
          xform();
          x /= 100;
          break;
        }
        slider.elem.css({'margin-left': posx});
        x = Math.round(x * 100);
        slider.input.val(x);
      };

      let ellipVal = 0, angleVal = 0;

      if (curType === 'radialGradient') {
        const tlist = curGradient.gradientTransform.baseVal;
        if (tlist.numberOfItems === 2) {
          const t = tlist.getItem(0);
          const s = tlist.getItem(1);
          if (t.type === 2 && s.type === 3) {
            const m = s.matrix;
            if (m.a !== 1) {
              ellipVal = Math.round(-(1 - m.a) * 100);
            } else if (m.d !== 1) {
              ellipVal = Math.round((1 - m.d) * 100);
            }
          }
        } else if (tlist.numberOfItems === 3) {
          // Assume [R][T][S]
          const r = tlist.getItem(0);
          const t = tlist.getItem(1);
          const s = tlist.getItem(2);

          if (r.type === 4 &&
            t.type === 2 &&
            s.type === 3
          ) {
            angleVal = Math.round(r.angle);
            const m = s.matrix;
            if (m.a !== 1) {
              ellipVal = Math.round(-(1 - m.a) * 100);
            } else if (m.d !== 1) {
              ellipVal = Math.round((1 - m.d) * 100);
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
      };

      $.each(sliders, function (type, data) {
        const handle = $(data.handle);
        handle.mousedown(function (evt) {
          const parent = handle.parent();
          slider = {
            type,
            elem: handle,
            input: $(data.input),
            parent,
            offset: parent.offset()
          };
          $win.mousemove(dragSlider).mouseup(stopSlider);
          evt.preventDefault();
        });

        $(data.input).val(data.val).change(function () {
          const isRad = curType === 'radialGradient';
          let val = +this.value;
          let xpos = 0;
          switch (type) {
          case 'radius':
            if (isRad) curGradient.setAttribute('r', val / 100);
            xpos = (Math.pow(val / 100, 1 / 2.5) / 2) * SLIDERW;
            break;

          case 'opacity':
            $this.paint.alpha = val;
            previewRect.setAttribute('fill-opacity', val / 100);
            xpos = val * (SLIDERW / 100);
            break;

          case 'ellip':
            scaleX = scaleY = 1;
            if (val === 0) {
              xpos = SLIDERW * 0.5;
              break;
            }
            if (val > 99.5) val = 99.5;
            if (val > 0) {
              scaleY = 1 - (val / 100);
            } else {
              scaleX = -(val / 100) - 1;
            }

            xpos = SLIDERW * ((val + 100) / 2) / 100;
            if (isRad) xform();
            break;

          case 'angle':
            angle = val;
            xpos = angle / 180;
            xpos += 0.5;
            xpos *= SLIDERW;
            if (isRad) xform();
          }
          if (xpos > SLIDERW) {
            xpos = SLIDERW;
          } else if (xpos < 0) {
            xpos = 0;
          }
          handle.css({'margin-left': xpos - 5});
        }).change();
      });

      const dragSlider = function (evt) {
        setSlider(evt);
        evt.preventDefault();
      };

      const stopSlider = function (evt) {
        $win.unbind('mousemove', dragSlider).unbind('mouseup', stopSlider);
        slider = null;
      };

      // --------------
      let thisAlpha = ($this.paint.alpha * 255 / 100).toString(16);
      while (thisAlpha.length < 2) { thisAlpha = '0' + thisAlpha; }
      thisAlpha = thisAlpha.split('.')[0];
      color = $this.paint.solidColor === 'none' ? '' : $this.paint.solidColor + thisAlpha;

      if (!isSolid) {
        color = stops[0].getAttribute('stop-color');
      }

      // This should be done somewhere else, probably
      $.extend($.fn.jPicker.defaults.window, {
        alphaSupport: true, effects: {type: 'show', speed: 0}
      });

      colPicker.jPicker(
        {
          window: {title: $settings.window.pickerTitle},
          images: {clientPath: $settings.images.clientPath},
          color: {active: color, alphaSupport: true}
        },
        function (color) {
          $this.paint.type = 'solidColor';
          $this.paint.alpha = color.val('ahex') ? Math.round((color.val('a') / 255) * 100) : 100;
          $this.paint.solidColor = color.val('hex') ? color.val('hex') : 'none';
          $this.paint.radialGradient = null;
          okClicked();
        },
        null,
        function () { cancelClicked(); }
      );

      const tabs = $(idref + ' .jGraduate_tabs li');
      tabs.click(function () {
        tabs.removeClass('jGraduate_tab_current');
        $(this).addClass('jGraduate_tab_current');
        $(idref + ' > div').hide();
        const type = $(this).attr('data-type');
        /* const container = */ $(idref + ' .jGraduate_gradPick').show();
        if (type === 'rg' || type === 'lg') {
          // Show/hide appropriate fields
          $('.jGraduate_' + type + '_field').show();
          $('.jGraduate_' + (type === 'lg' ? 'rg' : 'lg') + '_field').hide();

          $('#' + id + '_jgraduate_rect')[0].setAttribute('fill', 'url(#' + id + '_' + type + '_jgraduate_grad)');

          // Copy stops

          curType = type === 'lg' ? 'linearGradient' : 'radialGradient';

          $('#' + id + '_jGraduate_OpacInput').val($this.paint.alpha).change();

          const newGrad = $('#' + id + '_' + type + '_jgraduate_grad')[0];

          if (curGradient !== newGrad) {
            const curStops = $(curGradient).find('stop');
            $(newGrad).empty().append(curStops);
            curGradient = newGrad;
            const sm = spreadMethodOpt.val();
            curGradient.setAttribute('spreadMethod', sm);
          }
          showFocus = type === 'rg' && curGradient.getAttribute('fx') != null && !(cx === fx && cy === fy);
          $('#' + id + '_jGraduate_focusCoord').toggle(showFocus);
          if (showFocus) {
            $('#' + id + '_jGraduate_match_ctr')[0].checked = false;
          }
        } else {
          $(idref + ' .jGraduate_gradPick').hide();
          $(idref + ' .jGraduate_colPick').show();
        }
      });
      $(idref + ' > div').hide();
      tabs.removeClass('jGraduate_tab_current');
      let tab;
      switch ($this.paint.type) {
      case 'linearGradient':
        tab = $(idref + ' .jGraduate_tab_lingrad');
        break;
      case 'radialGradient':
        tab = $(idref + ' .jGraduate_tab_radgrad');
        break;
      default:
        tab = $(idref + ' .jGraduate_tab_color');
        break;
      }
      $this.show();

      // jPicker will try to show after a 0ms timeout, so need to fire this after that
      setTimeout(() => {
        tab.addClass('jGraduate_tab_current').click();
      }, 10);
    });
  };
  return $;
}
