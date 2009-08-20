/*
 * jPicker 1.0.9
 *
 * jQuery Plugin for Photoshop style color picker
 *
 * Copyright (c) 2009 Christopher T. Tillman
 * Digital Magic Productions, Inc. (http://www.digitalmagicpro.com/)
 * MIT style license, FREE to use, alter, copy, sell, and especially ENHANCE
 *
 * Painstakingly ported from John Dyers' excellent work on his own color picker based on the Prototype framework.
 *
 * John Dyers' website: (http://johndyer.name)
 * Color Picker page:   (http://johndyer.name/post/2007/09/PhotoShop-like-JavaScript-Color-Picker.aspx)
 *
 * Change Log
 * ______________
 * 1.0.9
 *   Added optional title variable for each jPicker window.
 *
 * 1.0.8
 *   Moved all images into a few sprites - now using backgroundPosition to change color maps and bars instead of changing the image - this should be faster to download and run.
 *   
 * 1.0.7
 *   RENAMED CSS FILE TO INCLUDE VERSION NUMBER!!! YOU MUST USE THIS VERSIONED CSS FILE!!! There will be no need to do your own CSS version number increments from now on.
 *   Added opacity feedback to color preview boxes.
 *   Removed reliance on "id" value of containing object. Subobjects are now found by class and container instead of id's. This drastically reduces injected code.
 *   Removed (jQuery).jPicker.getListElementById(id) function since "id" is no longer incorporated or required.
 *
 * 1.0.6
 *   Corrected picker bugs introduced with 1.0.5.
 *   Removed alpha slider bar until activated - default behavior for alpha is now OFF.
 *   Corrected Color constructor bug not allowing values of 0 for initial value (it was evaluating false and missing the init code - Thanks Pavol).
 *   Removed title tags (tooltips) from color maps and bars - They get in the way in some browsers (e.g. IE - dragging marker does NOT prevent or hide the tooltip).
 *   THERE WERE CSS FILE CHANGES WITH THIS UPDATE!!! IF YOU USE NEVER-EXPIRE HEADERS, YOU WILL NEED TO INCREMENT YOUR CSS FILE VERSION NUMBER!!!
 *
 * 1.0.5
 *   Added opacity support to picker and color/callback methods. New property "a" (alpha - range from 0-100) in all color objects now - defaults to 100% opaque. (Thank you Pavol)
 *   Added title attributes to input elements - gives short tooltip directions on what button or field does.
 *   Commit callback used to fire on control initialization (twice actually) - This has been corrected, it does not fire on initialization.
 *   THERE WERE CSS FILE CHANGES WITH THIS UPDATE!!! IF YOU USE NEVER-EXPIRE HEADERS, YOU WILL NEED TO INCREMENT YOUR CSS FILE VERSION NUMBER!!!
 *
 * 1.0.4
 *   Added ability for smaller picker icon with expandable window on any DOM element (not just input).
 *   "draggable" property renamed to "expandable" and its scope increased to create small picker icon or large static picker.
 *
 * 1.0.3
 *   Added cancelCallback function for registering an external function when user clicks cancel button. (Thank you Jeff and Pavol)
 *
 * 1.0.2
 *   Random bug fixes - speed concerns.
 *
 * 1.0.1
 *   Corrected closure based memeory leak - there may be others?
 *
 * 1.0.0
 *   First Release.
 *
 */
(function($, version)
{
  var Slider = // encapsulate slider functionality for the ColorMap and ColorBar - could be useful to use a jQuery UI draggable for this with certain extensions
      function(bar, options)
      {
        var $this = this, // private properties, methods, and events - keep these variables and classes invisible to outside code
          arrow = $('img', bar), // the arrow image image to drag
          barMouseDown = // bind the mousedown to the bar not the arrow for quick snapping to the clicked location
            function(e)
            {
              setValuesFromMousePosition(e);
              // Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
              $(document).bind('mousemove', docMouseMove).bind('mouseup', docMouseUp);
              e.stopPropagation();
              e.preventDefault(); // don't try to select anything or drag the image to the desktop
              return false;
            },
          docMouseMove = // set the values as the mouse moves
            function(e)
            {
              setValuesFromMousePosition(e);
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          docMouseUp = // unbind the document events - they aren't needed when not dragging
            function(e)
            {
              $(document).unbind('mouseup', docMouseUp).unbind('mousemove', docMouseMove);
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          setValuesFromMousePosition = // calculate mouse position and set value within the current range
            function(e)
            {
              var offset = bar.offset(), // lets not calculate this more than once
                  x = e.pageX - offset.left - parseInt(bar.css('border-left-width')),
                  y = e.pageY - offset.top - parseInt(bar.css('border-top-width')),
                  barW = bar.w, // local copies for YUI compressor
                  barH = bar.h,
                  newX,
                  newY;
              // keep the arrow within the bounds of the bar
              if (x < 0) x = 0;
              else if (x > barW) x = barW;
              if (y < 0) y = 0;
              else if (y > barH) y = barH;
              // we will use Math.floor for ALL conversion to pixel lengths - parseInt takes a string as input so it boxes the number into a string THEN converts it
              // number.toFixed(0) spends time processing rounding which when dealing with imprecise pixels is unnecessary
              newX = Math.floor(x / barW * $this.mxX);
              newY = Math.floor(y / barH * $this.mxY);
              $this.x = newX;
              $this.y = newY;
              // if x or y have no range, set it to 1D dragging
              if ($this.mxX == $this.mnX) x = 0;
              if ($this.mxY == $this.mnY) y = 0;
              // set the arrow position
              $this.setArrowPosition(x, y);
              // check if this.valuesChanged is a function and execute it if it is
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            };
        $.extend(true, $this, // public properties, methods, and event - these we need to access from other controls
          {
            settings: options, // we'll set map and arrow dimensions and image sources
            x: 0, // this is the calculated x value based on the x range and mouse position
            y: 0, // this is the calculated y value based on the y range and mouse position
            mnX: 0, // set the min x value
            mxX: 0, // set the max x value
            mnY: 100, // set the min y value
            mxY: 100, // set the max y value
            valuesChanged: $.isFunction(arguments[2]) && arguments[2] || null, // pass this argument or assign the variable to register for callbacks
            setPositioningVariables:
              function(e)
              {
                var map = $this.settings.map; // local copy for YUI compressor
                bar.w = map && map.width || bar.width();
                bar.h = map && map.height || bar.height();
                $this.MinX = 0;
                $this.MinY = 0;
                $this.MaxX = bar.w;
                $this.MaxY = bar.h;
              },
            setArrowPositionFromValues:
              function(e)
              {
                $this.setPositioningVariables();
                var arrowOffsetX = 0,
                    arrowOffsetY = 0,
                    // local copies for YUI compressor
                    mnX = $this.mnX,
                    mxX = $this.mxX,
                    mnY = $this.mnY,
                    mxY = $this.mxY,
                    x = $this.x,
                    y = $this.y;
                if (mnX != mxX) // range is greater than zero
                {
                  // constrain to bounds
                  if (x == mnX) arrowOffsetX = 0;
                  else if (x == mxX) arrowOffsetX = bar.w;
                  else // set arrow x position
                  {
                    if (mnX < 1) mxX += Math.abs(mnX) + 1;
                    if (x < 1) x += 1;
                    arrowOffsetX = x / mxX * bar.w;
                    if (parseInt(arrowOffsetX) == (mxX - 1)) arrowOffsetX = mxX;
                    else arrowOffsetX = parseInt(arrowOffsetX);
                    if (mnX < 1) arrowOffsetX -= Math.abs(mnX) - 1;
                  }
                }
                if (mnY != mxY) // range is greater than zero
                {
                  // constrain to bounds
                  if (y == mnY) arrowOffsetY = 0;
                  else if (y == mxY) arrowOffsetY = bar.h;
                  else // set arrow y position
                  {
                    if (mnY < 1) mxY += Math.abs(mnY) + 1;
                    if (y < 1) y += 1;
                    arrowOffsetY = y / mxY * bar.h;
                    if (parseInt(arrowOffsetY) == (mxY - 1)) arrowOffsetY = mxY;
                    else arrowOffsetY = parseInt(arrowOffsetY);
                    if (mnY < 1) arrowOffsetY -= Math.abs(mnY) - 1;
                  }
                }
                // set the arrow position based on these offsets
                $this.setArrowPosition(arrowOffsetX, arrowOffsetY);
              },
            setArrowPosition:
              function(offsetX, offsetY)
              {
                var barW = bar.w, // local copies for YUI compressor
                    barH = bar.h,
                    arrowW = arrow.w,
                    arrowH = arrow.h;
                // constrain arrow to bar x
                if (offsetX < 0) offsetX = 0;
                else if (offsetX > barW) offsetX = barW;
                // constrain arrow to bar y
                if (offsetY < 0) offsetY = 0;
                else if (offsetY > barH) offsetY = barH;
                // if arrow width is greater than bar width, center arrow and prevent horizontal dragging
                if (arrowW > barW) offsetX = (barW >> 1) - (arrowW >> 1); // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
                else offsetX -= arrowW >> 1;
                // if arrow height is greater than bar height, center arrow and prevent vertical dragging
                if (arrowH > barH) offsetY = (barH >> 1) - (arrowH >> 1);
                else offsetY -= arrowH >> 1;
                // set the elements offsets
                arrow.css({ left: offsetX + 'px', top: offsetY + 'px' });
              },
            destroy:
              function()
              {
                // unbind all possible events and null objects
                $(document).unbind('mouseup', docMouseUp).unbind('mousemove', docMouseMove);
                bar.unbind('mousedown', barMouseDown);
                bar = null;
                arrow = null;
                $this.valuesChanged = null;
              }
          });
        // initialize this control
        arrow.src = $this.settings.arrow && $this.settings.arrow.image;
        arrow.w = $this.settings.arrow && $this.settings.arrow.width || arrow.width();
        arrow.h = $this.settings.arrow && $this.settings.arrow.height || arrow.height();
        $this.setPositioningVariables();
        // bind mousedown event
        bar.bind('mousedown', barMouseDown);
        $this.setArrowPositionFromValues();
        // first callback to set initial values
        $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
      },
    ColorValuePicker = // controls for all the input elements for the typing in color values
      function(picker)
      {
        var $this = this, // private properties and methods 
          hsvKeyUp = // hue, saturation, or brightness input box key up - validate value and set color
            function(e)
            {
              if (e.target.value == '') return;
              validateHsv(e);
              $this.setValuesFromHsv();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          rgbKeyUp = // red, green, or blue input box key up - validate and set color
            function(e)
            {
              if (e.target.value == '') return;
              validateRgb(e);
              $this.setValuesFromRgb();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          alphaKeyUp = // alpha input box blur - validate and set color
            function(e)
            {
              if (e.target.value == '') return;
              validateAlpha(e);
              color.a = e.target.value;
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          hsvBlur = // hue, saturation, or brightness input box blur - reset to original if value empty
            function(e)
            {
              if (e.target.value == '') $this.setValuesFromRgb();
            },
          rgbBlur = // red, green, or blue input box blur - reset to original value if empty
            function(e)
            {
              if (e.target.value == '') $this.setValuesFromHsv();
            },
          alphaBlur = // alpha input box blur - reset to 100 if empty
            function(e)
            {
              if (e.target.value == '') fields.alpha.val(100);
            },
          hexKeyUp = // hex input box key up - validate and set color
            function(e)
            {
              if (e.target.value == '') return;
              validateHex(e);
              $this.setValuesFromHex();
              $.isFunction($this.valuesChanged) && $this.valuesChanged($this);
            },
          hexBlur = // hex input box blur - reset to original value if empty
            function(e)
            {
              if (e.target.value == '') $this.setValuesFromHsv();
            },
          validateRgb = // validate rgb values
            function(e)
            {
              if (!validateKey(e)) return e;
              fields.red.val(setValueInRange(fields.red.val(), 0, 255));
              fields.green.val(setValueInRange(fields.green.val(), 0, 255));
              fields.blue.val(setValueInRange(fields.blue.val(), 0, 255));
            },
          validateAlpha = // validate alpha value
            function(e)
            {
              if (!validateKey(e)) return e;
              fields.alpha.val(setValueInRange(fields.alpha.val(), 0, 100));
            },
          validateHsv = // validate hsv values
            function(e)
            {
              if (!validateKey(e)) return e;
              fields.hue.val(setValueInRange(fields.hue.val(), 0, 360));
              fields.saturation.val(setValueInRange(fields.saturation.val(), 0, 100));
              fields.value.val(setValueInRange(fields.value.val(), 0, 100));
            },
          validateHex = // validate hex value
            function(e)
            {
              if (!validateKey(e)) return e;
              fields.hex.val(fields.hex.val().replace(/[^a-fA-F0-9]/g, '0').toLowerCase().substring(0, 6));
            },
          validateKey = // validate key
            function(e)
            {
              switch(e.keyCode)
              {
                case 9:
                case 16:
                case 29:
                case 37:
                case 38:
                case 40:
                  return false;
                case 'c'.charCodeAt():
                case 'v'.charCodeAt():
                  if (e.ctrlKey) return false;
              }
              return true;
            },
          setValueInRange = // constrain value within range
            function(value, min, max)
            {
              if (value == '' || isNaN(value)) return min;
              value = parseInt(value);
              if (value > max) return max;
              if (value < min) return min;
              return value;
            };
        $.extend(true, $this, // public properties and methods
          {
          color: new Color(),
          fields:
            {
              hue: $('.jPicker_HueText', picker),
              saturation: $('.jPicker_SaturationText', picker),
              value: $('.jPicker_BrightnessText', picker),
              red: $('.jPicker_RedText', picker),
              green: $('.jPicker_GreenText', picker),
              blue: $('.jPicker_BlueText', picker),
              hex: $('.jPicker_HexText', picker),
              alpha: $('.jPicker_AlphaText', picker)
            },
          valuesChanged: $.isFunction(arguments[1]) && arguments[1] || null,
          bindedHexKeyUp: // binded input element key up
              function(e)
              {
                hexKeyUp(e);
              },
          setValuesFromRgb: // set values when rgb changes
              function()
              {
                color.fromRgb(fields.red.val(), fields.green.val(), fields.blue.val());
                fields.hex.val(color.hex);
                fields.hue.val(color.h);
                fields.saturation.val(color.s);
                fields.value.val(color.v);
              },
          setValuesFromHsv: // set values when hsv changes
              function()
              {
                color.fromHsv(fields.hue.val(), fields.saturation.val(), fields.value.val());
                fields.hex.val(color.hex);
                fields.red.val(color.r);
                fields.green.val(color.g);
                fields.blue.val(color.b);
              },
          setValuesFromHex: // set values when hex changes
              function()
              {
                color.fromHex(fields.hex.val());
                fields.red.val(color.r);
                fields.green.val(color.g);
                fields.blue.val(color.b);
                fields.hue.val(color.h);
                fields.saturation.val(color.s);
                fields.value.val(color.v);
              },
          setAlphaFromValue: // set alpha value when bar changes
              function()
              {
                color.a=fields.alpha.val();
              },
          destroy:
              function()
              {
                // unbind all events and null objects
                fields.hue.add(fields.saturation).add(fields.value).unbind('keyup', events.hsvKeyUp).unbind('blur', hsvBlur);
                fields.red.add(fields.green).add(fields.blue).unbind('keyup', events.rgbKeyUp).unbind('blur', rgbBlur);
                fields.alpha.unbind('keyup', alphaKeyUp).unbind('blur', alphaBlur);
                fields.hex.unbind('keyup', hexKeyUp);
                fields = null;
                color = null;
                $this.valuesChanged = null;
              }
        });
        var fields = $this.fields, color = $this.color; // local copies for YUI compressor
        fields.hue.add(fields.saturation).add(fields.value).bind('keyup', hsvKeyUp).bind('blur', hsvBlur);
        fields.red.add(fields.green).add(fields.blue).bind('keyup', rgbKeyUp).bind('blur', rgbBlur);
        fields.alpha.bind('keyup', alphaKeyUp).bind('blur', alphaBlur);
        fields.hex.bind('keyup', hexKeyUp).bind('blur', hexBlur);
        if (fields.hex.val() != '')
        {
          color.fromHex(fields.hex.val());
          $this.setValuesFromHex();
        }
      };
  $.jPicker =
    {
      List: [], // array holding references to each active instance of the control
      Color: // color object - we will be able to assign by any color space type or retrieve any color space info
             // we want this public so we can optionally assign new color objects to initial values using inputs other than a string hex value (also supported)
        function(init)
        {
          var $this = this;
          $.extend(true, $this, // public properties and methods
            {
            r: 0, // Red
            g: 0, // Green
            b: 0, // Blue
            h: 0, // Hue
            s: 0, // Saturation
            v: 0, // Brightness
            a: 100, // Alpha
            hex: '', // Hex
            fromRgb:
              function(r, g, b)
              {
                var $this = this;
                $this.r = r;
                $this.g = g;
                $this.b = b;
                var newHsv = ColorMethods.rgbToHsv($this);
                $this.h = newHsv.h;
                $this.s = newHsv.s;
                $this.v = newHsv.v;
                $this.hex = ColorMethods.rgbToHex($this);
              },
            fromHsv:
              function(h, s, v)
              {
                var $this = this;
                $this.h = h;
                $this.s = s;
                $this.v = v;
                var newRgb = ColorMethods.hsvToRgb($this);
                $this.r = newRgb.r;
                $this.g = newRgb.g;
                $this.b = newRgb.b;
                $this.hex = ColorMethods.rgbToHex(newRgb);
              },
            fromHex:
              function(hex)
              {
                var $this = this;
                $this.hex = hex;
                var newRgb = ColorMethods.hexToRgb(hex);
                $this.r = newRgb.r;
                $this.g = newRgb.g;
                $this.b = newRgb.b;
                var newHsv = ColorMethods.rgbToHsv(newRgb);
                $this.h = newHsv.h;
                $this.s = newHsv.s;
                $this.v = newHsv.v;
                $this.hex = ColorMethods.rgbToHex(newRgb);
              }
          });
          if (init)
          {
            if (init.hex) $this.fromHex(init.hex);
            else if (!isNaN(init.r)) $this.fromRgb(init.r, init.g, init.b);
            else if (!isNaN(init.h)) $this.fromHsv(init.h, init.s, init.v);
            if (!isNaN(init.a)) $this.a = init.a;
          }
        },
      ColorMethods: // color conversion methods  - make public to give use to external scripts
      {
      hexToRgb:
          function(hex)
          {
            hex = this.validateHex(hex);
            var r = '00', g = '00', b = '00';
            if (hex.length == 6)
            {
              r = hex.substring(0, 2);
              g = hex.substring(2, 4);
              b = hex.substring(4, 6);
            }
            else
            {
              if (hex.length > 4)
              {
                r = hex.substring(4, hex.length);
                hex = hex.substring(0, 4);
              }
              if (hex.length > 2)
              {
                g = hex.substring(2, hex.length);
                hex = hex.substring(0, 2);
              }
              if (hex.length > 0) b = hex.substring(0, hex.length);
            }
            return { r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b) };
          },
      validateHex:
          function(hex)
          {
            hex = hex.toLowerCase().replace(/[^a-f0-9]/g, '0');
            if (hex.length > 6) hex = hex.substring(0, 6);
            return hex;
          },
      rgbToHex:
          function(rgb)
          {
            return this.intToHex(rgb.r) + this.intToHex(rgb.g) + this.intToHex(rgb.b);
          },
      intToHex:
          function(dec)
          {
            var result = parseInt(dec).toString(16);
            if (result.length == 1) result = ('0' + result);
            return result.toLowerCase();
          },
      hexToInt:
          function(hex)
          {
            return parseInt(hex, 16);
          },
      rgbToHsv:
          function(rgb)
          {
            var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, hsv = { h: 0, s: 0, v: 0 }, min = 0, max = 0, delta;
            if (r >= g && r >= b)
            {
              max = r;
              min = g > b ? b : g;
            }
            else if (g >= b && g >= r)
            {
              max = g;
              min = r > b ? b : r;
            }
            else
            {
              max = b;
              min = g > r ? r : g;
            }
            hsv.v = max;
            hsv.s = max ? (max - min) / max : 0;
            if (!hsv.s) hsv.h = 0;
            else
            {
              delta = max - min;
              if (r == max) hsv.h = (g - b) / delta;
              else if (g == max) hsv.h = 2 + (b - r) / delta;
              else hsv.h = 4 + (r - g) / delta;
              hsv.h = parseInt(hsv.h * 60);
              if (hsv.h < 0) hsv.h += 360;
            }
            hsv.s = parseInt(hsv.s * 100);
            hsv.v = parseInt(hsv.v * 100);
            return hsv;
          },
      hsvToRgb:
          function(hsv)
          {
            var rgb = { r: 0, g: 0, b: 0 }, h = hsv.h, s = hsv.s, v = hsv.v;
            if (s == 0)
            {
              if (v == 0) rgb.r = rgb.g = rgb.b = 0;
              else rgb.r = rgb.g = rgb.b = parseInt(v * 255 / 100);
            }
            else
            {
              if (h == 360) h = 0;
              h /= 60;
              s = s / 100;
              v = v / 100;
              var i = parseInt(h),
                  f = h - i,
                  p = v * (1 - s),
                  q = v * (1 - (s * f)),
                  t = v * (1 - (s * (1 - f)));
              switch (i)
              {
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
              rgb.r = parseInt(rgb.r * 255);
              rgb.g = parseInt(rgb.g * 255);
              rgb.b = parseInt(rgb.b * 255);
            }
            return rgb;
          }
    }
  };
  var Color = $.jPicker.Color, List = $.jPicker.List, ColorMethods = $.jPicker.ColorMethods; // local copies for YUI compressor
  $.fn.jPicker =
      function(options)
      {
        var $arguments = arguments;
        return this.each(
          function()
          {
            var $this = $(this), $settings = $.extend(true, {}, $.fn.jPicker.defaults, options); // local copies for YUI compressor
            if ($this.get(0).nodeName.toLowerCase() == 'input') // Add color picker icon if binding to an input element and bind the events to the input
            {
              $.extend(true, $settings,
                {
                  window:
                  {
                    bindToInput: true,
                    expandable: true,
                    input: $this
                  }
                });
              if (ColorMethods.validateHex($this.val()))
              {
                $settings.color.active = new Color({ hex: $this.val(), a: $settings.color.active.a });
                $settings.color.current = new Color({ hex: $this.val(), a: $settings.color.active.a });
              }
            }
            if ($settings.window.expandable)
              $this.after('<span class="jPicker_Picker"><span class="jPicker_Color">&nbsp;</span><span class="jPicker_Icon" title="Click To Open Color Picker">&nbsp;</span><span class="jPicker_Container">&nbsp;</span></span>');
            else $settings.window.liveUpdate = false; // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
            var isLessThanIE7 = parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters, // needed to run the AlphaImageLoader function for IE6
              colorMapL1 = null, // different layers of colorMap and colorBar
              colorMapL2 = null,
              colorMapL3 = null,
              colorBarL1 = null,
              colorBarL2 = null,
              colorBarL3 = null,
              colorBarL4 = null,
              colorBarL5 = null,
              enableAlpha = null,
              alphaCheckbox = null,
              alphaBarDiv = null,
              alphaBarL1 = null,
              alphaBarL2 = null,
              container = null,
              hue = null, // radio buttons
              saturation = null,
              value = null,
              red = null,
              green = null,
              blue = null,
              colorMap = null, // color maps
              colorBar = null,
              alphaBar = null,
              colorPicker = null,
              elementStartX = null, // Used to record the starting css positions for dragging the control
              elementStartY = null,
              pageStartX = null, // Used to record the mousedown coordinates for dragging the control
              pageStartY = null,
              activeColor = null, // color boxes above the radio buttons
              currentColor = null,
              currentActiveBG = null,
              okButton = null,
              cancelButton = null,
              grid = null, // preset colors grid
              colorBox = null, // colorBox for popup button
              colorIcon = null, // colorIcon popup icon
              moveBar = null, // drag bar
              setColorMode = // set color mode and update visuals for the new color mode
                function(colorMode)
                {
                  color.active = colorPicker.color;
                  var active = color.active, // local copies for YUI compressor
                      clientPath = images.clientPath,
                      resetImage =
                        function(img)
                        {
                          setAlpha(img, 100);
                          img.css({ backgroundColor: '', backgroundPosition: '0px 0px', filter: '' });
                        };
                  resetImage(colorMapL1); // reset images
                  resetImage(colorMapL2);
                  resetImage(colorBarL1);
                  resetImage(colorBarL2);
                  resetImage(colorBarL3);
                  resetImage(colorBarL4);
                  hue.add(saturation).add(value).add(red).add(green).add(blue).removeAttr('checked');
                  switch (colorMode)
                  {
                    case 'h':
                      hue.attr('checked', true);
                      colorMapL1.css({ backgroundColor: '#' + active.hex });
                      colorMapL2.css({ backgroundColor: 'transparent' });
                      setImgLoc(colorMapL2, -256);
                      setAlpha(colorMapL2, 100);
                      setImgLoc(colorBarL4, -256);
                      colorMap.mxX = 100;
                      colorMap.mxY = 100;
                      colorBar.mxY = 360;
                      break;
                    case 's':
                      saturation.attr('checked', true);
                      setImgLoc(colorMapL1, -512);
                      setImgLoc(colorMapL2, -768);
                      setAlpha(colorMapL2, 0);
                      setBG(colorBarL3, active.hex);
                      setImgLoc(colorBarL4, -512);
                      colorMap.mxX = 360;
                      colorMap.mxY = 100;
                      colorBar.mxY = 100;
                      break;
                    case 'v':
                      value.attr('checked', true);
                      setBG(colorMapL1, '000');
                      setImgLoc(colorMapL2, -1024);
                      colorBarL3.css({ backgroundColor: '#' + active.hex });
                      setImgLoc(colorBarL4, -768);
                      colorMap.mxX = 360;
                      colorMap.mxY = 100;
                      colorBar.mxY = 100;
                      break;
                    case 'r':
                      red.attr('checked', true);
                      setImgLoc(colorMapL2, -1536);
                      setImgLoc(colorMapL1, -1280);
                      setImgLoc(colorBarL4, -1024);
                      setImgLoc(colorBarL3, -1280);
                      setImgLoc(colorBarL2, -1536);
                      setImgLoc(colorBarL1, -1792);
                      break;
                    case 'g':
                      green.attr('checked', true);
                      setImgLoc(colorMapL2, -2048);
                      setImgLoc(colorMapL1, -1792);
                      setImgLoc(colorBarL4, -2048);
                      setImgLoc(colorBarL3, -2304);
                      setImgLoc(colorBarL2, -2560);
                      setImgLoc(colorBarL1, -2816);
                      break;
                    case 'b':
                      blue.attr('checked', true);
                      setImgLoc(colorMapL2, -2560);
                      setImgLoc(colorMapL1, -2304);
                      setImgLoc(colorBarL4, -3072);
                      setImgLoc(colorBarL3, -3328);
                      setImgLoc(colorBarL2, -3584);
                      setImgLoc(colorBarL1, -3840);
                      break;
                    default:
                      throw ('Invalid Mode');
                      break;
                  }
                  switch (colorMode)
                  {
                    case 'h':
                    case 's':
                    case 'v':
                      colorMap.mnX = 1;
                      colorMap.mnY = 1;
                      colorBar.mnY = 1;
                      break;
                    case 'r':
                    case 'g':
                    case 'b':
                      colorMap.mnX = 0;
                      colorMap.mnY = 0;
                      colorBar.mnY = 0;
                      colorMap.mxX = 255;
                      colorMap.mxY = 255;
                      colorBar.mxY = 255;
                      break;
                  }
                  color.mode = colorMode;
                  positionMapAndBarArrows();
                  updateMapVisuals();
                  updateBarVisuals();
                  if (window.expandable && window.liveUpdate)
                  {
                    colorBox.css({ backgroundColor: '#' + active.hex });
                    if (window.bindToInput)
                      window.input.val(active.hex).css(
                        {
                          backgroundColor: '#' + active.hex,
                          color: active.v > 75 ? '#000000' : '#ffffff'
                        });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              textValuesChanged = // Update color when user changes text values
                function()
                {
                  positionMapAndBarArrows();
                  updateVisuals();
                  color.active = colorPicker.color;
                  var active = color.active; // local copy for YUI compressor
                  if (window.expandable && window.liveUpdate)
                  {
                    colorBox.css({ backgroundColor: '#' + active.hex });
                    if (window.bindToInput)
                      window.input.val(colorPicker.fields.hex.val()).css(
                        {
                          backgroundColor: '#' + active.hex,
                          color: active.v > 75 ? '#000000' : '#ffffff'
                        });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              mapValueChanged = // user has dragged the ColorMap pointer
                function()
                {
                  if (!colorPicker || !colorMap || !colorBar || !alphaBar) return;
                  color.active = colorPicker.color;
                  var fields = colorPicker.fields, // local copies for YUI compressor
                      active = color.active;
                  switch (color.mode)
                  {
                    case 'h':
                      fields.saturation.val(colorMap.x);
                      fields.value.val(100 - colorMap.y);
                      break;
                    case 's':
                      fields.hue.val(colorMap.x);
                      fields.value.val(100 - colorMap.y);
                      break;
                    case 'v':
                      fields.hue.val(colorMap.x);
                      fields.saturation.val(100 - colorMap.y);
                      break;
                    case 'r':
                      fields.blue.val(colorMap.x);
                      fields.green.val(255 - colorMap.y);
                      break;
                    case 'g':
                      fields.blue.val(colorMap.x);
                      fields.red.val(255 - colorMap.y);
                      break;
                    case 'b':
                      fields.red.val(colorMap.x);
                      fields.green.val(255 - colorMap.y);
                      break;
                  }
                  switch (color.mode)
                  {
                    case 'h':
                    case 's':
                    case 'v':
                      colorPicker.setValuesFromHsv();
                      break;
                    case 'r':
                    case 'g':
                    case 'b':
                      colorPicker.setValuesFromRgb();
                      break;
                  }
                  updateVisuals();
                  if (window.expandable && window.liveUpdate)
                  {
                    colorBox.css({ backgroundColor: '#' + active.hex });
                    if (window.bindToInput)
                      window.input.val(active.hex).css(
                        {
                          backgroundColor: '#' + active.hex,
                          color: active.v > 75 ? '#000000' : '#ffffff'
                        });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              colorBarValueChanged = // user has dragged the ColorBar slider
                function()
                {
                  if (!colorPicker || !colorMap || !colorBar || !alphaBar) return;
                  color.active = colorPicker.color;
                  var fields = colorPicker.fields, // local copies for YUI compressor
                      active = color.active;
                  switch (color.mode)
                  {
                    case 'h':
                      fields.hue.val(360 - colorBar.y);
                      break;
                    case 's':
                      fields.saturation.val(100 - colorBar.y);
                      break;
                    case 'v':
                      fields.value.val(100 - colorBar.y);
                      break;
                    case 'r':
                      fields.red.val(255 - colorBar.y);
                      break;
                    case 'g':
                      fields.green.val(255 - colorBar.y);
                      break;
                    case 'b':
                      fields.blue.val(255 - colorBar.y);
                      break;
                  }
                  switch (color.mode)
                  {
                    case 'h':
                    case 's':
                    case 'v':
                      colorPicker.setValuesFromHsv();
                      break;
                    case 'r':
                    case 'g':
                    case 'b':
                      colorPicker.setValuesFromRgb();
                      break;
                  }
                  updateVisuals();
                  if (window.expandable && window.liveUpdate)
                  {
                    colorBox.css({ backgroundColor: '#' + active.hex });
                    if (window.bindToInput)
                      window.input.val(active.hex).css(
                        {
                          backgroundColor: '#' + active.hex,
                          color: active.v > 75 ? '#000000' : '#ffffff'
                        });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              alphaBarValueChanged =
                function()
                {
                  if (!colorPicker || !colorMap || !colorBar || !alphaBar) return;
                  color.active = colorPicker.color;
                  var fields = colorPicker.fields, // local copies for YUI compressor
                      active = color.active;
                  fields.alpha.val(alphaBar.x);
                  colorPicker.setAlphaFromValue();
                  updateVisuals();
                  $.isFunction($this.liveCallback) && $this.liveCallback(color.active);
                },
              positionMapAndBarArrows = // position map and bar arrows to match current color
                function()
                {
                  color.active = colorPicker.color;
                  var sliderValue = 0,
                      active = color.active; // local copy for YUI compressor
                  switch ($this.settings.color.mode)
                  {
                    case 'h':
                      sliderValue = 360 - active.h;
                      break;
                    case 's':
                      sliderValue = 100 - active.s;
                      break;
                    case 'v':
                      sliderValue = 100 - active.v;
                      break;
                    case 'r':
                      sliderValue = 255 - active.r;
                      break;
                    case 'g':
                      sliderValue = 255 - active.g;
                      break;
                    case 'b':
                      sliderValue = 255 - active.b;
                      break;
                  }
                  colorBar.y = sliderValue;
                  alphaBar.x = active.a;
                  colorBar.setArrowPositionFromValues();
                  alphaBar.setArrowPositionFromValues();
                  var mapX = 0, mapY = 0;
                  switch ($this.settings.color.mode)
                  {
                    case 'h':
                      mapX = active.s;
                      mapY = 100 - active.v;
                      break;
                    case 's':
                      mapX = active.h;
                      mapY = 100 - active.v;
                      break;
                    case 'v':
                      mapX = active.h;
                      mapY = 100 - active.s;
                      break;
                    case 'r':
                      mapX = active.b;
                      mapY = 256 - active.g;
                      break;
                    case 'g':
                      mapX = active.b;
                      mapY = 256 - active.r;
                      break;
                    case 'b':
                      mapX = active.r;
                      mapY = 256 - active.g;
                      break;
                  }
                  colorMap.x = mapX;
                  colorMap.y = mapY;
                  colorMap.setArrowPositionFromValues();
                },
              updateVisuals =
                function()
                {
                  updatePreview();
                  updateMapVisuals();
                  updateBarVisuals();
                  updateAlphaVisuals();
                },
              updatePreview =
                function()
                {
                  try
                  {
                    activeColor.css({ backgroundColor: '#' + colorPicker.color.hex });
                    setAlpha(activeColor, colorPicker.color.a);
                  }
                  catch (e) { }
                },
              updateMapVisuals =
                function()
                {
                  if (!color || !colorPicker) return;
                  color.active = colorPicker.color;
                  var active = color.active; // local copy for YUI compressor
                  switch (color.mode)
                  {
                    case 'h':
                      setBG(colorMapL1, new Color({ h: active.h, s: 100, v: 100 }).hex);
                      break;
                    case 's':
                      setAlpha(colorMapL2, 100 - active.s);
                      break;
                    case 'v':
                      setAlpha(colorMapL2, active.v);
                      break;
                    case 'r':
                      setAlpha(colorMapL2, active.r / 256 * 100);
                      break;
                    case 'g':
                      setAlpha(colorMapL2, active.g / 256 * 100);
                      break;
                    case 'b':
                      setAlpha(colorMapL2, active.b / 256 * 100);
                      break;
                  }
                  setAlpha(colorMapL3, 100 - active.a);
                },
              updateBarVisuals =
                function()
                {
                  if (!color || !colorPicker) return;
                  color.active = colorPicker.color;
                  var active = color.active, // local copy for YUI compressor
                      mode = color.mode,
                      fields = colorPicker.fields;
                  switch (mode)
                  {
                    case 'h':
                      break;
                    case 's':
                      var saturatedColor = new Color({ h: active.h, s: 100, v: active.v });
                      setBG(colorBarL3, saturatedColor.hex);
                      break;
                    case 'v':
                      var valueColor = new Color({ h: active.h, s: active.s, v: 100 });
                      setBG(colorBarL3, valueColor.hex);
                      break;
                    case 'r':
                    case 'g':
                    case 'b':
                      var hValue = 0, vValue = 0;
                      if (mode == 'r')
                      {
                        hValue = fields.blue.val();
                        vValue = fields.green.val();
                      }
                      else if (mode == 'g')
                      {
                        hValue = fields.blue.val();
                        vValue = fields.red.val();
                      }
                      else if (mode == 'b')
                      {
                        hValue = fields.red.val();
                        vValue = fields.green.val();
                      }
                      var horzPer = hValue / 256 * 100, vertPer = vValue / 256 * 100, horzPerRev = (256 - hValue) / 256 * 100, vertPerRev = (256 - vValue) / 256 * 100;
                      setAlpha(colorBarL4, vertPer > horzPerRev ? horzPerRev : vertPer);
                      setAlpha(colorBarL3, vertPer > horzPer ? horzPer : vertPer);
                      setAlpha(colorBarL2, vertPerRev > horzPer ? horzPer : vertPerRev);
                      setAlpha(colorBarL1, vertPerRev > horzPerRev ? horzPerRev : vertPerRev);
                      break;
                  }
                  setAlpha(colorBarL5, 100 - active.a);
                },
              updateAlphaVisuals =
                function()
                {
                  setBG(alphaBarL1, colorPicker.color.hex);
                },
              setBG =
                function(el, c)
                {
                  try
                  {
                    el.css({ backgroundColor: '#' + c });
                  }
                  catch (e) { }
                },
              setImg =
                function(img, src)
                {
                  if (src.indexOf('png') && this.isLessThanIE7)
                  {
                    img.attr('pngSrc', src);
                    img.css({ backgroundImage: 'none', filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\')' });
                  }
                  else img.css({ backgroundImage: 'url(' + src + ')' });
                },
              setImgLoc =
                function(img, y)
                {
                  img.css({ backgroundPosition: '0px ' + y + 'px' });
                },
              setAlpha =
                function(obj, alpha)
                {
                  if (alpha < 100)
                  {
                    if (this.isLessThanIE7)
                    {
                      var src = obj.attr('pngSrc');
                      if (src != null && src.indexOf('map-hue') == -1)
                        obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')' });
                    }
                    else obj.css({ opacity: alpha / 100 });
                  }
                  else if (alpha == 100) // IE7 still will not combine 8-bit PNG translucency AND element opacity without drawing errors
                                         // Even opacity:1.0 (or filter:Alpha(opacity=100)) causes issues, so remove it if opaque
                  {
                    if (this.isLessThanIE7)
                    {
                      var src = obj.attr('pngSrc');
                      if (src != null && src.indexOf('map-hue') == -1) obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\')' });
                    }
                    else obj.css({ opacity: '' });
                  }
                },
              revertColor = // revert color to original color when opened
                function()
                {
                  colorPicker.fields.hex.val(color.current.hex);
                  colorPicker.fields.alpha.val(color.current.a);
                  colorPicker.setValuesFromHex();
                  colorPicker.setAlphaFromValue();
                  $.isFunction(colorPicker.valuesChanged) && colorPicker.valuesChanged(colorPicker);
                },
              radioClicked =
                function(e)
                {
                  setColorMode(e.target.value);
                },
              currentClicked =
                function()
                {
                  revertColor();
                },
              cancelClicked =
                function()
                {
                  revertColor();
                  window.expandable && $this.hide();
                  $.isFunction($this.cancelCallback) && $this.cancelCallback();
                },
              commitColor = // commit the color changes
                function()
                {
                  var active = color.active; // local copies for YUI compressor
                  color.current = new Color({ hex: active.hex });
                  color.current.a = active.a;
                  currentColor.css({ backgroundColor: '#' + active.hex });
                  setAlpha(currentColor, colorPicker.color.a);
                  if (window.expandable)
                  {
                    colorBox.css({ backgroundColor: '#' + active.hex });
                    if (window.bindToInput)
                      window.input.val(active.hex).css(
                        {
                          backgroundColor: '#' + active.hex,
                          color: active.v > 75 ? '#000000' : '#ffffff'
                        });
                  }
                  $.isFunction($this.commitCallback) && $this.commitCallback(active);
                },
              okClicked =
                function()
                {
                  commitColor();
                  window.expandable && $this.hide();
                },
              colorIconClicked =
                function()
                {
                  $this.show();
                },
              moveBarMouseDown =
                function(e)
                {
                  var element = window.element, // local copies for YUI compressor
                      page = window.page;
                  elementStartX = parseInt(container.css('left'));
                  elementStartY = parseInt(container.css('top'));
                  pageStartX = e.pageX;
                  pageStartY = e.pageY;
                  // bind events to document to move window - we will unbind these on mouseup
                  $(document).bind('mousemove', documentMouseMove).bind('mouseup', documentMouseUp);
                  e.stopPropagation();
                  e.preventDefault(); // prevent attempted dragging of the column
                  return false;
                },
              documentMouseMove =
                function(e)
                {
                  container.css({ left: elementStartX - (pageStartX - e.pageX) + 'px', top: elementStartY - (pageStartY - e.pageY) + 'px' });
                  e.stopPropagation();
                  e.preventDefault();
                  return false;
                },
              documentMouseUp =
                function(e)
                {
                  $(document).unbind('mousemove', documentMouseMove).unbind('mouseup', documentMouseUp);
                  e.stopPropagation();
                  e.preventDefault();
                  return false;
                },
              bindedHexKeyUp =
                function(e)
                {
                  colorPicker.fields.hex.val($this.settings.window.input.val());
                  colorPicker.bindedHexKeyUp(e);
                },
              quickPickClicked =
                function(e)
                {
                  colorPicker.fields.hex.val(color.quickList[e.data.i].hex);
                  colorPicker.fields.alpha.val(color.quickList[e.data.i].a);
                  colorPicker.setValuesFromHex();
                  colorPicker.setAlphaFromValue();
                  $.isFunction(colorPicker.valuesChanged) && colorPicker.valuesChanged(colorPicker);
                };
            $.extend(true, $this, // public properties, methods, and callbacks
              {
                id: $this.attr('id'),
                settings: $settings,
                color: null,
                icon: null,
                commitCallback: $.isFunction($arguments[1]) && $arguments[1] || null, // commitCallback function can be overridden to return the selected color to a method you specify when the user clicks "OK"
                liveCallback: $.isFunction($arguments[2]) && $arguments[2] || null, // liveCallback function can be overridden to return the selected color to a method you specify in live mode (continuous update)
                cancelCallback: $.isFunction($arguments[3]) && $arguments[3] || null, // cancelCallback function can be overridden to a method you specify when the user clicks "Cancel"
                show:
                  function()
                  {
                    if (document.all) // In IE, due to calculated z-index values, we need to hide all color picker icons that appear later in the source code than this one
                    {
                      var foundthis = false;
                      for (i = 0; i < List.length; i++)
                      {
                        if (foundthis) List[i].color.add(List[i].icon).css({ display: 'none' });
                        if (List[i].id == $this.id) foundthis = true;
                      }
                    }
                    color.current = new Color({ hex: color.active.hex, a: color.active.a });
                    currentColor.css({ backgroundColor: '#' + color.active.hex });
                    setAlpha(currentColor, color.active.a);
                    container.css({ display: 'block' });
                    colorMap.setPositioningVariables();
                    colorBar.setPositioningVariables();
                    positionMapAndBarArrows();
                  },
                hide:
                  function()
                  {
                    if (document.all) // In IE, show the previously hidden color picker icons again
                    {
                      var foundthis = false;
                      for (i = 0; i < List.length; i++)
                      {
                        if (foundthis) List[i].color.add(List[i].icon).css({ display: 'block' });
                        if (List[i].id == $this.id) foundthis = true;
                      }
                    }
                    container.css({ display: 'none' });
                  },
                destroy: // destroys this control entirely, removing all events and objects, and removing itself from the List
                  function()
                  {
                    if (window.expandable) colorIcon = $('.jPicker_Icon', container).unbind('click', colorIconClicked);
                    if (window.bindToInput) window.input.unbind('keyup', bindedHexKeyUp).unbind('change', bindedHexKeyUp);
                    hue.add(saturation).add(value).add(red).add(green).add(blue).unbind('click', radioClicked);
                    currentColor.unbind('click', currentClicked);
                    cancelButton.unbind('click', cancelClicked);
                    okButton.unbind('click', okClicked);
                    if (window.expandable) moveBar.unbind('mousedown', moveBarMouseDown);
                    $('.jPicker_QuickColor', container).unbind('click', quickPickClicked);
                    hue = null;
                    saturation = null;
                    value = null;
                    red = null;
                    green = null;
                    blue = null;
                    colorMapL1 = null;
                    colorMapL2 = null;
                    colorMapL3 = null;
                    colorBarL1 = null;
                    colorBarL2 = null;
                    colorBarL3 = null;
                    colorBarL4 = null;
                    colorBarL5 = null;
                    enableAlpha = null;
                    alphaCheckbox = null;
                    alphaBarDiv = null;
                    alphaBarL1 = null;
                    alphaBarL2 = null;
                    currentActiveBG = null;
                    activeColor = null;
                    currentColor = null;
                    okButton = null;
                    cancelButton = null;
                    grid = null;
                    $this.color = null;
                    $this.icon = null;
                    colorMap.destroy();
                    colorMap = null;
                    colorBar.destroy();
                    colorBar = null;
                    alphaBar.destroy();
                    alphaBar = null;
                    colorPicker.destroy();
                    colorPicker = null;
                    $this.commitCallback = null;
                    $this.cancelCallback = null;
                    $this.liveCallback = null;
                    container.html('');
                    for (i = 0; i < List.length; i++) if (List[i].id == $this.id) List.splice(i, 1);
                  }
              });
            var images = $this.settings.images, // local copies for YUI compressor
                window = $this.settings.window,
                color = $this.settings.color;
            container = window.expandable ? $('.jPicker_Container', $this.next()) : $this;
            if (window.expandable)
              container.css( // positions must be set and display set to absolute before source code injection or IE will size the container to fit the window
                {
                  left: window.position.x == 'left' ? '-526px' : window.position.x == 'center' ? '-259px' : window.position.x == 'right' ? '0px' : window.position.x == 'screenCenter' ?
                    (($(document).width() >> 1) - 259) - $this.next().offset().left + 'px' : window.position.x,
                  position: 'absolute',
                  top: window.position.y == 'top' ? '-340px' : window.position.y == 'center' ? '-153px' : window.position.y == 'bottom' ? '25px' : window.position.y
                });
            // if default colors are hex strings, change them to color objects
            if ((typeof (color.active)).toString().toLowerCase() == 'string') color.active = new Color({ hex: color.active.substring(1) });
            // inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
            // this control really is tabular data, so I believe it is the right move
            if (!color.alphaSupport) color.active.a = 100;
            container.html('<table class="jPicker_table"><tbody>' + (window.expandable ? '<tr><td class="jPicker_MoveBar" colspan="6">&nbsp;</td></tr>' : '') + '<tr><td rowspan="8"><h2 class="jPicker_Title">' + (window.title || 'Drag Markers To Pick A Color') + '</h2><div class="jPicker_ColorMap"><span class="jPicker_ColorMap_l1">&nbsp;</span><span class="jPicker_ColorMap_l2">&nbsp;</span><span class="jPicker_ColorMap_l3">&nbsp;</span><img src="' + images.clientPath + images.colorMap.arrow.file + '" class="jPicker_ColorMap_Arrow"/></div></td><td rowspan="8"><div class="jPicker_ColorBar"><span class="jPicker_ColorBar_l1">&nbsp;</span><span class="jPicker_ColorBar_l2">&nbsp;</span><span class="jPicker_ColorBar_l3">&nbsp;</span><span class="jPicker_ColorBar_l4">&nbsp;</span><span class="jPicker_ColorBar_l5">&nbsp;</span><img src="' + images.clientPath + images.colorBar.arrow.file + '" class="jPicker_ColorBar_Arrow"/></div></td><td colspan="3" class="jPicker_Preview">new<div class="jPicker_NewCurrent"><span class="jPicker_Active" title="New Color - Press &ldquo;OK&rdquo; To Commit">&nbsp;</span><span class="jPicker_Current" title="Click To Revert To Original Color">&nbsp;</span></div>current</td><td rowspan="9" class="jPicker_OkCancel"><input type="button" class="jPicker_Ok" value="OK" title="Commit To This Color Selection"/><input type="button" class="jPicker_Cancel" value="Cancel" title="Cancel And Revert To Original Color"/><hr/><div class="jPicker_Grid">&nbsp;</div></td></tr><tr><td><input type="radio" class="jPicker_HueRadio" id="jPicker_Hue_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="h" title="Set To &ldquo;Hue&rdquo; Color Mode"/></td><td><label for="jPicker_Hue_'+List.length+'" title="Set To &ldquo;Hue&rdquo; Color Mode">H:</label></td><td><input type="text" class="jPicker_HueText" value="' + color.active.h + '" title="Enter A &ldquo;Hue&rdquo; Value (0-360&deg;)"/> &deg;</td</tr><tr><td><input type="radio" class="jPicker_SaturationRadio" id="jPicker_Saturation_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="s" title="Set To &ldquo;Saturation&rdquo; Color Mode"/></td><td><label for="jPicker_Saturation_'+List.length+'" title="Set To &ldquo;Saturation&rdquo; Color Mode">S:</label></td><td><input type="text" class="jPicker_SaturationText" value="' + color.active.s + '" title="Enter A &ldquo;Saturation&rdquo; Value (0-100%)"/> %</td></tr><tr><td><input type="radio" class="jPicker_BrightnessRadio" id="jPicker_Brightness_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="v" title="Set To &ldquo;Brightness&rdquo; Color Mode"/></td><td><label for="jPicker_Brightness_'+List.length+'" title="Set To &ldquo;Brightness&rdquo; Color Mode">B:</label></td><td><input type="text" class="jPicker_BrightnessText" value="' + color.active.v + '" title="Enter A &ldquo;Brightness&rdquo; Value (0-100%)"/> %</td></tr><tr><td colspan="3" class="jPicker_Spacer">&nbsp;</td></tr><tr><td><input type="radio" class="jPicker_RedRadio" id="jPicker_Red_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="r" title="Set To &ldquo;Red&rdquo; Color Mode"/></td><td><label for="jPicker_Red_'+List.length+'" title="Set To &ldquo;Red&rdquo; Color Mode">R:</label></td><td><input type="text" class="jPicker_RedText" value="' + color.active.r + '" title="Enter A &ldquo;Red&rdquo; Value (0-255)"/></td></tr><tr><td><input type="radio" class="jPicker_GreenRadio" id="jPicker_Green_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="g" title="Set To &ldquo;Green&rdquo; Color Mode"/></td><td><label for="jPicker_Green_'+List.length+'" title="Set To &ldquo;Green&rdquo; Color Mode">G:</label></td><td><input type="text" class="jPicker_GreenText" value="' + color.active.g + '" title="Enter A &ldquo;Green&rdquo; Value (0-255)"/></td></tr><tr><td><input type="radio" class="jPicker_BlueRadio" id="jPicker_Blue_'+List.length+'" name="jPicker_Mode_'+List.length+'" value="b" title="Set To &ldquo;Blue&rdquo; Color Mode"/></td><td><label for="jPicker_Blue_'+List.length+'" title="Set To &ldquo;Blue&rdquo; Color Mode">B:</label></td><td><input type="text" class="jPicker_BlueText" value="' + color.active.b + '" title="Enter A &ldquo;Blue&rdquo; Value (0-255)"/></td></tr><tr><td><div class="jPicker_EnableAlpha"><input type="checkbox" class="jPicker_AlphaCheckbox" id="jPicker_AlphaCheckbox_'+List.length+'" title="Enable Alpha (Transparency) Support"/><label for="jPicker_AlphaCheckbox_'+List.length+'" title="Enabled Alpha (Transparency) Support">Enable Alpha (Transparency) Support</label></div><div class="jPicker_AlphaBar"><span class="jPicker_AlphaBar_l1">&nbsp;</span><span class="jPicker_AlphaBar_l2">&nbsp;</span><img src="' + images.clientPath + images.alphaBar.arrow.file + '" class="jPicker_AlphaBar_Arrow"/></div></td><td colspan="2" class="jPicker_OpacityCol"><label for="jPicker_Alpha_'+List.length+'" title="Enter An &ldquo;Alpha&rdquo; Value (0-100%)">A:</label><input type="text" class="jPicker_AlphaText" id="jPicker_Alpha_'+List.length+'" value="' + color.active.a + '" title="Enter An &ldquo;Alpha&rdquo; Value (0-100%)"/><span>%</span></td><td colspan="3" class="jPicker_HexCol"><label for="jPicker_Hex_'+List.length+'" title="Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)">#:</label><input type="text" class="jPicker_HexText" id="jPicker_Hex_'+List.length+'" value="' + color.active.hex + '" title="Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)"/></td><td colspan="2" class="jPicker_EnterHex"></td><td>&nbsp;</td></tr></tbody></table>');
            // initialize the objects to the source code just injected
            hue = $('.jPicker_HueRadio', container);
            saturation = $('.jPicker_SaturationRadio', container);
            value = $('.jPicker_BrightnessRadio', container);
            red = $('.jPicker_RedRadio', container);
            green = $('.jPicker_GreenRadio', container);
            blue = $('.jPicker_BlueRadio', container);
            colorMapL1 = $('.jPicker_ColorMap_l1', container);
            colorMapL2 = $('.jPicker_ColorMap_l2', container);
            colorMapL3 = $('.jPicker_ColorMap_l3', container);
            colorBarL1 = $('.jPicker_ColorBar_l1', container);
            colorBarL2 = $('.jPicker_ColorBar_l2', container);
            colorBarL3 = $('.jPicker_ColorBar_l3', container);
            colorBarL4 = $('.jPicker_ColorBar_l4', container);
            colorBarL5 = $('.jPicker_ColorBar_l5', container);
            alphaBarL1 = $('.jPicker_AlphaBar_l1', container);
            alphaBarL2 = $('.jPicker_AlphaBar_l2', container);
            enableAlpha = $('.jPicker_EnableAlpha', container);
            alphaCheckbox = $('.jPicker_AlphaCheckbox', container);
            alphaBarDiv = $('.jPicker_AlphaBar', container);
            currentActiveBG = $('.jPicker_NewCurrent', container);
            activeColor = $('.jPicker_Active', container).css({ backgroundColor: '#' + color.active.hex });
            currentColor = $('.jPicker_Current', container).css({ backgroundColor: '#' + color.active.hex });
            okButton = $('.jPicker_Ok', container);
            cancelButton = $('.jPicker_Cancel', container);
            grid = $('.jPicker_Grid', container);
            $this.color = $('.Picker_Color');
            $this.icon = $('.jPicker_Icon');
            // create color pickers and maps
            colorPicker = new ColorValuePicker(container, textValuesChanged);
            colorMap = new Slider($('.jPicker_ColorMap', container),
              {
                map:
                {
                  width: images.colorMap.width,
                  height: images.colorMap.height
                },
                arrow:
                {
                  image: images.clientPath + images.colorMap.arrow.file,
                  width: images.colorMap.arrow.width,
                  height: images.colorMap.arrow.height
                }
              },
              mapValueChanged);
            colorBar = new Slider($('.jPicker_ColorBar', container),
              {
                map:
                {
                  width: images.colorBar.width,
                  height: images.colorBar.height
                },
                arrow:
                {
                  image: images.clientPath + images.colorBar.arrow.file,
                  width: images.colorBar.arrow.width,
                  height: images.colorBar.arrow.height
                }
              },
              colorBarValueChanged);
            alphaBar = new Slider($('.jPicker_AlphaBar', container),
              {
                map:
                {
                  width: images.alphaBar.width,
                  height: images.alphaBar.height
                },
                arrow:
                {
                  image: images.clientPath + images.alphaBar.arrow.file,
                  width: images.alphaBar.arrow.width,
                  height: images.alphaBar.arrow.height
                }
              },
              alphaBarValueChanged);
            alphaBar.mnX = 0;
            alphaBar.mxX = 100;
            setImg(colorMapL1, images.clientPath + 'Maps.png');
            setImg(colorMapL2, images.clientPath + 'Maps.png');
            setImg(colorMapL3, images.clientPath + 'map-opacity.png');
            setImg(colorBarL1, images.clientPath + 'Bars.png');
            setImg(colorBarL2, images.clientPath + 'Bars.png');
            setImg(colorBarL3, images.clientPath + 'Bars.png');
            setImg(colorBarL4, images.clientPath + 'Bars.png');
            setImg(colorBarL5, images.clientPath + 'bar-opacity.png');
            setImg(alphaBarL2, images.clientPath + 'Maps.png');
            setImgLoc(alphaBarL2, -2816);
            setImg(currentActiveBG, images.clientPath + 'preview-opacity.png');
            currentActiveBG.css({ backgroundPosition: '1px 1px' });
            if (color.alphaSupport)
            {
              enableAlpha.hide();
              alphaBarDiv.show();
              $('td.jPicker_OpacityCol *', container).show();
            }
            else
              alphaCheckbox.bind('click',
                function()
                {
                  enableAlpha.hide();
                  alphaBarDiv.show();
                  $('td.jPicker_OpacityCol *', container).show();
                });
            // bind to input
            if (window.expandable)
            {
              colorBox = $('.jPicker_Color', $this.next()).css({ backgroundColor: '#' + color.active.hex });
              colorIcon = $('.jPicker_Icon', $this.next()).css(
                {
                  backgroundImage: 'url(' + images.clientPath + images.picker.file + ')'
                }).bind('click', colorIconClicked);
              if (window.bindToInput) window.input.bind('keyup', bindedHexKeyUp).bind('change', bindedHexKeyUp);
            }
            hue.add(saturation).add(value).add(red).add(green).add(blue).bind('click', radioClicked);
            currentColor.bind('click', currentClicked);
            cancelButton.bind('click', cancelClicked);
            okButton.bind('click', okClicked);
            if (window.expandable) moveBar = $('.jPicker_MoveBar', container).bind('mousedown', moveBarMouseDown);
            // initialize quick list
            if (color.quickList && color.quickList.length > 0)
            {
              grid.html('');
              for (i = 0; i < color.quickList.length; i++)
              {
                /* if default colors are hex strings, change them to color objects */
                if ((typeof (color.quickList[i])).toString().toLowerCase() == 'string') color.quickList[i] = new Color({ hex: color.quickList[i].substring(1) });
                grid.append('<span class="jPicker_QuickColor" title="#' + color.quickList[i].hex + '">&nbsp;</span>');
                $('.jPicker_QuickColor', container).eq(i).css({ backgroundColor: '#' + color.quickList[i].hex }).bind('click', { i: i }, quickPickClicked);
              }
            }
            setColorMode(color.mode);
            colorPicker.fields.hex.val(colorBar.hex);
            colorPicker.setValuesFromHex();
            colorPicker.setAlphaFromValue();
            positionMapAndBarArrows();
            updateVisuals();
            if (!window.expandable) $this.show();
            List.push($this);
          });
      };
  $.fn.jPicker.defaults = /* jPicker defaults - you can change anything in this section (such as the clientPath to your images) without fear of breaking the program */
      {
      window:
        {
          title: null, /* any title for the jPicker window itself - displays "Drag Markers To Pick A Color" if left null */
          position:
          {
            x: 'screenCenter', /* acceptable values "left", "center", "right", "screenCenter", or relative px value */
            y: 'top' /* acceptable values "top", "bottom", "center", or relative px value */
          },
          expandable: false, /* default to large static picker - set to true to make an expandable picker (small icon with popup) - set automatically when binded to input element */
          liveUpdate: true /* set false if you want the user to have to click "OK" before the binded input box updates values */
        },
      color:
        {
          mode: 'h', /* acceptabled values "h" (hue), "s" (saturation), "v" (brightness), "r" (red), "g" (green), "b" (blue) */
          active: new Color({ hex: 'ffc000' }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) INCLUDING the "#" prefix */
          alphaSupport: false, /* change to true to enable alpha editing support (without this, alpha will always be 100) */
          quickList: /* the quick pick color list */
            [
              new Color({ h: 360, s: 33, v: 100 }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) INCLUDING the "#" prefix */
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
              new Color({ h: 330, s: 100, v: 50 })
            ]
        },
      images:
        {
          clientPath: '/jPicker/images/', /* Path to image files */
          colorMap:
          {
            width: 256,
            height: 256,
            arrow:
            {
              file: 'mappoint.gif', /* ColorMap arrow icon */
              width: 15,
              height: 15
            }
          },
          colorBar:
          {
            width: 20,
            height: 256,
            arrow:
            {
              file: 'rangearrows.gif', /* ColorBar arrow icon */
              width: 40,
              height: 9
            }
          },
          alphaBar:
          {
            width: 256,
            height: 20,
            arrow:
            {
              file: 'rangearrows2.gif', /* AlphaBar arrow icon */
              width: 9,
              height: 40
            }
          },
          picker:
          {
            file: 'picker.gif', /* Color Picker icon */
            width: 25,
            height: 24
          }
        }
    };
})(jQuery, '1.0.9');
