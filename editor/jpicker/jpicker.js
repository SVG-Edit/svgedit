/*
 * jPicker 1.0.2
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
 */
(function($)
{
  var Slider = // encapsulate slider functionality for the ColorMap and ColorBar - could be useful to use a jQuery UI draggable for this with certain extensions
      function(id, options)
      {
        var $this = this, // private properties, methods, and events - keep these variables and classes invisible to outside code
          bar = $('#' + id), // 1D or 2D area used for dragging
          arrow = $('#' + id + '_Arrow'), // the arrow image image to drag
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
      function(id)
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
              hue: $('#' + id + '_jPicker_Hue'),
              saturation: $('#' + id + '_jPicker_Saturation'),
              value: $('#' + id + '_jPicker_Brightness'),
              red: $('#' + id + '_jPicker_Red'),
              green: $('#' + id + '_jPicker_Green'),
              blue: $('#' + id + '_jPicker_Blue'),
              hex: $('#' + id + '_jPicker_Hex')
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
          destroy:
              function()
              {
                // unbind all events and null objects
                fields.hue.add(fields.saturation).add(fields.value).unbind('keyup', events.hsvKeyUp).unbind('blur', hsvBlur);
                fields.red.add(fields.green).add(fields.blue).unbind('keyup', events.rgbKeyUp).unbind('blur', rgbBlur);
                fields.hex.unbind('keyup', $this.hexKeyUp);
                fields = null;
                color = null;
                $this.valuesChanged = null;
              }
        });
        var fields = $this.fields, color = $this.color; // local copies for YUI compressor
        fields.hue.add(fields.saturation).add(fields.value).bind('keyup', hsvKeyUp).bind('blur', hsvBlur);
        fields.red.add(fields.green).add(fields.blue).bind('keyup', rgbKeyUp).bind('blur', rgbBlur);
        fields.hex.bind('keyup', hexKeyUp);
        if (fields.hex.val() != '')
        {
          color.fromHex(fields.hex.val());
          $this.setValuesFromHex();
        }
      };
  $.jPicker =
    {
      List: [], // array holding references to each active instance of the control
      getListElementById: // retrieve the jPicker object by the initiating objects id
        function(id)
        {
          var List = $.jPicker.List;
          for (i = 0; i < List.length; i++) if (List[i].id == id) return List[i];
          return null;
        },
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
            else if (init.r) $this.fromRgb(init.r, init.g, init.b);
            else if (init.h) $this.fromHsv(init.h, init.s, init.v);
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
            var $this = $(this), id = $this.attr('id'), $settings = $.extend(true, {}, $.fn.jPicker.defaults, options); // local copies for YUI compressor
            if (!id)
            {
              alert('Container element must have an id attribute to maintain unique id strings for sub-elements.');
              return;
            }
            if ($this.get(0).nodeName.toLowerCase() == 'input') // Add color picker icon if binding to an input element and bind the events to the input
            {
              $.extend(true, $settings,
                {
                  window:
                  {
                    bindToInput: true,
                    input: $this
                  }
                });
              if (ColorMethods.validateHex($this.val()))
              {
                $settings.color.active = new Color({ hex: $this.val() });
                $settings.color.current = new Color({ hex: $this.val() });
              }
              $this.after('<span id="' + id + '_jPicker_Picker" class="jPicker_Picker"><span id="' + id + '_jPicker_Color" class="jPicker_Color">&nbsp;</span><span id="' + id + '_jPicker_Icon" class="jPicker_Icon" title="Click To Open Color Picker">&nbsp;</span><span id="' + id + '_jPicker_Container" class="jPicker_Container">&nbsp;</span></span>');
            }
            else // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
            {
              $settings.window.draggable = false;
              $settings.window.liveUpdate = false;
            }
            var isLessThanIE7 = parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters, // needed to run the AlphaImageLoader function for IE6
              colorMapL1 = null, // different layers of colorMap and colorBar
              colorMapL2 = null,
              colorBarL1 = null,
              colorBarL2 = null,
              colorBarL3 = null,
              colorBarL4 = null,
              container = null,
              hue = null, // radio buttons
              saturation = null,
              value = null,
              red = null,
              green = null,
              blue = null,
              colorMap = null, // color maps
              colorBar = null,
              colorPicker = null,
              elementStartX = null, // Used to record the starting css positions for dragging the control
              elementStartY = null,
              pageStartX = null, // Used to record the mousedown coordinates for dragging the control
              pageStartY = null,
              activeColor = null, // color boxes above the radio buttons
              currentColor = null,
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
                          img.css({ backgroundColor: '', backgroundImage: 'none', filter: '' });
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
                      setImg(colorMapL2, clientPath + 'map-hue.png');
                      setAlpha(colorMapL2, 100);
                      setImg(colorBarL4, clientPath + 'bar-hue.png');
                      colorMap.mxX = 100;
                      colorMap.mxY = 100;
                      colorBar.mxY = 360;
                      break;
                    case 's':
                      saturation.attr('checked', true);
                      setImg(colorMapL1, clientPath + 'map-saturation.png');
                      setImg(colorMapL2, clientPath + 'map-saturation-overlay.png');
                      setAlpha(colorMapL2, 0);
                      setBG(colorBarL3, active.hex);
                      setImg(colorBarL4, clientPath + 'bar-saturation.png');
                      colorMap.mxX = 360;
                      colorMap.mxY = 100;
                      colorBar.mxY = 100;
                      break;
                    case 'v':
                      value.attr('checked', true);
                      setBG(colorMapL1, '000');
                      setImg(colorMapL2, clientPath + 'map-brightness.png');
                      colorBarL3.css({ backgroundColor: '#' + active.hex });
                      setImg(colorBarL4, clientPath + 'bar-brightness.png');
                      colorMap.mxX = 360;
                      colorMap.mxY = 100;
                      colorBar.mxY = 100;
                      break;
                    case 'r':
                      red.attr('checked', true);
                      setImg(colorMapL2, clientPath + 'map-red-max.png');
                      setImg(colorMapL1, clientPath + 'map-red-min.png');
                      setImg(colorBarL4, clientPath + 'bar-red-tl.png');
                      setImg(colorBarL3, clientPath + 'bar-red-tr.png');
                      setImg(colorBarL2, clientPath + 'bar-red-br.png');
                      setImg(colorBarL1, clientPath + 'bar-red-bl.png');
                      break;
                    case 'g':
                      green.attr('checked', true);
                      setImg(colorMapL2, clientPath + 'map-green-max.png');
                      setImg(colorMapL1, clientPath + 'map-green-min.png');
                      setImg(colorBarL4, clientPath + 'bar-green-tl.png');
                      setImg(colorBarL3, clientPath + 'bar-green-tr.png');
                      setImg(colorBarL2, clientPath + 'bar-green-br.png');
                      setImg(colorBarL1, clientPath + 'bar-green-bl.png');
                      break;
                    case 'b':
                      blue.attr('checked', true);
                      setImg(colorMapL2, clientPath + 'map-blue-max.png');
                      setImg(colorMapL1, clientPath + 'map-blue-min.png');
                      setImg(colorBarL4, clientPath + 'bar-blue-tl.png');
                      setImg(colorBarL3, clientPath + 'bar-blue-tr.png');
                      setImg(colorBarL2, clientPath + 'bar-blue-br.png');
                      setImg(colorBarL1, clientPath + 'bar-blue-bl.png');
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
                  if (window.bindToInput && window.liveUpdate)
                  {
                    window.input.val(active.hex).css(
                      {
                        backgroundColor: '#' + active.hex,
                        color: active.v > 75 ? '#000000' : '#ffffff'
                      });
                    colorBox.css({ backgroundColor: '#' + active.hex });
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
                  if (window.bindToInput && window.liveUpdate)
                  {
                    window.input.val(colorPicker.fields.hex.val()).css(
                      {
                        backgroundColor: '#' + active.hex,
                        color: active.v > 75 ? '#000000' : '#ffffff'
                      });
                    colorBox.css({ backgroundColor: '#' + active.hex });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              mapValueChanged = // user has dragged the ColorMap pointer
                function()
                {
                  if (!colorPicker || !colorMap || !colorBar) return;
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
                  if (window.bindToInput && window.liveUpdate)
                  {
                    window.input.val(active.hex).css(
                      {
                        backgroundColor: '#' + active.hex,
                        color: active.v > 75 ? '#000000' : '#ffffff'
                      });
                    colorBox.css({ backgroundColor: '#' + active.hex });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
                },
              barValueChanged = // user has dragged the ColorBar slider
                function()
                {
                  if (!colorPicker || !colorMap || !colorBar) return;
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
                  if (window.bindToInput && window.liveUpdate)
                  {
                    window.input.val(active.hex).css(
                      {
                        backgroundColor: '#' + active.hex,
                        color: active.v > 75 ? '#000000' : '#ffffff'
                      });
                    colorBox.css({ backgroundColor: '#' + active.hex });
                  }
                  $.isFunction($this.liveCallback) && $this.liveCallback(active);
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
                  colorBar.setArrowPositionFromValues();
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
                },
              updatePreview =
                function()
                {
                  try
                  {
                    activeColor.css({ backgroundColor: '#' + colorPicker.color.hex });
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
                      var newColor = new Color({ h: active.h, s: 100, v: 100 });
                      setBG(colorMapL1, newColor.hex);
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
              setAlpha =
                function(obj, alpha)
                {
                  if (alpha == 0)
                  {
                    obj.css({ display: 'none' });
                    return;
                  }
                  else if (alpha < 100)
                  {
                    obj.css({ display: '' });
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
                    obj.css({ display: '' });
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
                  colorPicker.setValuesFromHex();
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
                  window.bindToInput && $this.hide();
                  $.isFunction($this.cancelCallback) && $this.cancelCallback();
                },
              commitColor = // commit the color changes
                function()
                {
                  var active = color.active; // local copies for YUI compressor
                  color.current = new Color({ hex: active.hex });
                  currentColor.css({ backgroundColor: '#' + active.hex });
                  if (window.bindToInput)
                  {
                    window.input.val(active.hex).css(
                      {
                        backgroundColor: '#' + active.hex,
                        color: active.v > 75 ? '#000000' : '#ffffff'
                      });
                    colorBox.css({ backgroundColor: '#' + active.hex });
                  }
                  $.isFunction($this.commitCallback) && $this.commitCallback(active);
                },
              okClicked =
                function()
                {
                  commitColor();
                  window.bindToInput && $this.hide();
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
                  colorPicker.setValuesFromHex();
                  $.isFunction(colorPicker.valuesChanged) && colorPicker.valuesChanged(colorPicker);
                };
            $.extend(true, $this, // pulic properties, methods, and callbacks
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
                    color.current = new Color({ hex: color.active.hex });
                    currentColor.css({ backgroundColor: '#' + color.active.hex });
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
                    if (window.bindToInput)
                    {
                      colorIcon = $('#' + $this.id + '_jPicker_Icon').unbind('click', colorIconClicked);
                      window.input.unbind('keyup', bindedHexKeyUp).unbind('change', bindedHexKeyUp);
                    }
                    hue.add(saturation).add(value).add(red).add(green).add(blue).unbind('click', radioClicked);
                    currentColor.unbind('click', currentClicked);
                    cancelButton.unbind('click', cancelClicked);
                    okButton.unbind('click', okClicked);
                    if (window.draggable) moveBar.unbind('mousedown', moveBarMouseDown);
                    if (color.quickList && color.quickList.length > 0)
                      for (i = 0; i < color.quickList.length; i++)
                        $('#' + $this.id + '_jPicker_Grid_' + i, container).unbind('click', quickPickClicked);
                    hue = null;
                    saturation = null;
                    value = null;
                    red = null;
                    green = null;
                    blue = null;
                    colorMapL1 = null;
                    colorMapL2 = null;
                    colorBarL1 = null;
                    colorBarL2 = null;
                    colorBarL3 = null;
                    colorBarL4 = null;
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
            container = window.bindToInput ? $('#' + id + '_jPicker_Container') : $this;
            if (window.bindToInput)
              container.css( // positions must be set and display set to absolute before source code injection or IE will size the container to fit the window
                {
                  left: window.position.x == 'left' ? '-535px' : window.position.x == 'center' ? '-268px' : window.position.x == 'right' ? '0px' : window.position.x == 'screenCenter' ?
                    (($(document).width() >> 1) - 268) - $('#' + id + '_jPicker_Picker').offset().left + 'px' : window.position.x,
                  position: 'absolute',
                  top: window.position.y == 'top' ? '-320px' : window.position.y == 'center' ? '-148px' : window.position.y == 'bottom' ? '25px' : window.position.y
                });
            // if default colors are hex strings, change them to color objects
            if ((typeof (color.active)).toString().toLowerCase() == 'string') color.active = new Color({ hex: color.active.substring(1) });
            if ((typeof (color.current)).toString().toLowerCase() == 'string') color.current = new Color({ hex: color.current.substring(1) });
            // inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
            // this control really is tabular data, so I believe it is the right move
            container.html('<table class="jPicker_table"><tbody>' + (window.draggable ? '<tr><td id="' + $this.id + '_jPicker_MoveBar" class="jPicker_MoveBar" colspan=6></td></tr>' : '') + '<tr><td rowspan="9"><div id="' + $this.id + '_jPicker_ColorMap" class="jPicker_ColorMap"><span id="' + $this.id + '_jPicker_ColorMap_l1" class="jPicker_ColorMap_l1">&nbsp;</span><span id="' + $this.id + '_jPicker_ColorMap_l2" class="jPicker_ColorMap_l2">&nbsp;</span><img id="' + $this.id + '_jPicker_ColorMap_Arrow" src="' + images.clientPath + images.colorMap.arrow.file + '" class="jPicker_ColorMap_Arrow"/></div></td><td rowspan="9"><div id="' + $this.id + '_jPicker_ColorBar" class="jPicker_ColorBar"><span id="' + $this.id + '_jPicker_ColorBar_l1" class="jPicker_ColorBar_l1">&nbsp;</span><span id="' + $this.id + '_jPicker_ColorBar_l2" class="jPicker_ColorBar_l2">&nbsp;</span><span id="' + $this.id + '_jPicker_ColorBar_l3" class="jPicker_ColorBar_l3">&nbsp;</span><span id="' + $this.id + '_jPicker_ColorBar_l4" class="jPicker_ColorBar_l4">&nbsp;</span><img id="' + $this.id + '_jPicker_ColorBar_Arrow" src="' + images.clientPath + images.colorBar.arrow.file + '" class="jPicker_ColorBar_Arrow"/></div></td><td colspan="3" class="jPicker_Preview">new<div><span id="' + $this.id + '_jPicker_Active" class="jPicker_Active">&nbsp;</span><span id="' + $this.id + '_jPicker_Current" class="jPicker_Current">&nbsp;</span></div>current</td><td rowspan="9" class="jPicker_OkCancel"><input type="button" id="' + $this.id + '_jPicker_Ok" class="jPicker_Ok" value="OK"/><input type="button" id="' + $this.id + '_jPicker_Cancel" class="jPicker_Cancel" value="Cancel"/><hr/><div id="' + $this.id + '_jPicker_Grid" class="jPicker_Grid">&nbsp;</div></td></tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_HueRadio" name="' + $this.id + '_jPicker_Mode" value="h"/></td><td><label for="' + $this.id + '_jPicker_HueRadio">H:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Hue" name="' + $this.id + '_jPicker_Hue" value="' + color.active.h + '"/> &deg;</td</tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_SaturationRadio" name="' + $this.id + '_jPicker_Mode" value="s"/></td><td><label for="' + $this.id + '_jPicker_SaturationRadio">S:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Saturation" name="' + $this.id + '_jPicker_Saturation" value="' + color.active.s + '"/> %</td></tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_BrightnessRadio" name="' + $this.id + '_jPicker_Mode" value="v"/></td><td><label for="' + $this.id + '_jPicker_BrightnessRadio">B:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Brightness" name="' + $this.id + '_jPicker_Brightness" value="' + color.active.v + '"/> %</td></tr><tr><td colspan="3" class="jPicker_Spacer">&nbsp;</td></tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_RedRadio" name="' + $this.id + '_jPicker_Mode" value="r"/></td><td><label for="' + $this.id + '_jPicker_RedRadio">R:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Red" name="' + $this.id + '_jPicker_Red" value="' + color.active.r + '"/></td></tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_GreenRadio" name="' + $this.id + '_jPicker_Mode" value="g"/></td><td><label for="' + $this.id + '_jPicker_GreenRadio">G:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Green" name="' + $this.id + '_jPicker_Green" value="' + color.active.g + '"/></td></tr><tr><td><input type="radio" id="' + $this.id + '_jPicker_BlueRadio" name="' + $this.id + '_jPicker_Mode" value="b"/></td><td><label for="' + $this.id + '_jPicker_BlueRadio">B:</label></td><td><input type="text" class="jPicker_RadioText" id="' + $this.id + '_jPicker_Blue" name="' + $this.id + '_jPicker_Blue" value="' + color.active.b + '"/></td></tr><tr><td colspan="3" class="jPicker_EnterHex">#:<input type="text" class="jPicker_Hex" id="' + $this.id + '_jPicker_Hex" name="' + $this.id + '_jPicker_Hex" value="' + color.active.hex + '"/></td></tr></tbody></table>');
            // initialize the objects to the source code just injected
            hue = $('#' + $this.id + '_jPicker_HueRadio', container);
            saturation = $('#' + $this.id + '_jPicker_SaturationRadio', container);
            value = $('#' + $this.id + '_jPicker_BrightnessRadio', container);
            red = $('#' + $this.id + '_jPicker_RedRadio', container);
            green = $('#' + $this.id + '_jPicker_GreenRadio', container);
            blue = $('#' + $this.id + '_jPicker_BlueRadio', container);
            colorMapL1 = $('#' + $this.id + '_jPicker_ColorMap_l1', container);
            colorMapL2 = $('#' + $this.id + '_jPicker_ColorMap_l2', container);
            colorBarL1 = $('#' + $this.id + '_jPicker_ColorBar_l1', container);
            colorBarL2 = $('#' + $this.id + '_jPicker_ColorBar_l2', container);
            colorBarL3 = $('#' + $this.id + '_jPicker_ColorBar_l3', container);
            colorBarL4 = $('#' + $this.id + '_jPicker_ColorBar_l4', container);
            activeColor = $('#' + $this.id + '_jPicker_Active', container).css({ backgroundColor: '#' + color.active.hex });
            currentColor = $('#' + $this.id + '_jPicker_Current', container).css({ backgroundColor: '#' + color.current.hex });
            okButton = $('#' + $this.id + '_jPicker_Ok', container);
            cancelButton = $('#' + $this.id + '_jPicker_Cancel', container);
            grid = $('#' + $this.id + '_jPicker_Grid', container);
            $this.color = $('#' + $this.id + '_jPicker_Color');
            $this.icon = $('#' + $this.id + '_jPicker_Icon');
            // create color pickers and maps
            colorPicker = new ColorValuePicker($this.id, textValuesChanged);
            colorMap = new Slider($this.id + '_jPicker_ColorMap',
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
            colorBar = new Slider($this.id + '_jPicker_ColorBar',
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
              barValueChanged);
            // bind to input
            if (window.bindToInput)
            {
              colorBox = $('#' + $this.id + '_jPicker_Color').css({ backgroundColor: '#' + color.current.hex });
              colorIcon = $('#' + $this.id + '_jPicker_Icon').css(
                {
                  backgroundImage: 'url(' + images.clientPath + images.picker.file + ')'
                }).bind('click', colorIconClicked);
              window.input.bind('keyup', bindedHexKeyUp).bind('change', bindedHexKeyUp);
            }
            hue.add(saturation).add(value).add(red).add(green).add(blue).bind('click', radioClicked);
            currentColor.bind('click', currentClicked);
            cancelButton.bind('click', cancelClicked);
            okButton.bind('click', okClicked);
            if (window.draggable) moveBar = $('#' + $this.id + '_jPicker_MoveBar', container).bind('mousedown', moveBarMouseDown);
            // initialize quick list
            if (color.quickList && color.quickList.length > 0)
            {
              grid.html('');
              for (i = 0; i < color.quickList.length; i++)
              {
                /* if default colors are hex strings, change them to color objects */
                if ((typeof (color.quickList[i])).toString().toLowerCase() == 'string') color.quickList[i] = new Color({ hex: color.quickList[i].substring(1) });
                grid.append('<span id="' + $this.id + '_jPicker_Grid_' + i + '" class="jPicker_QuickColor">&nbsp;</span>');
                $('#' + $this.id + '_jPicker_Grid_' + i, container).css({ backgroundColor: '#' + color.quickList[i].hex }).bind('click', { i: i }, quickPickClicked);
              }
            }
            setColorMode(color.mode);
            colorPicker.fields.hex.val(colorBar.hex);
            colorPicker.setValuesFromHex();
            positionMapAndBarArrows();
            updateVisuals();
            commitColor();
            $.isFunction($this.commitCallback) && $this.commitCallback(color.current);
            if (!window.bindToInput) $this.show();
            List.push($this);
          });
      };
  $.fn.jPicker.defaults = /* jPicker defaults - you can change anything in this section (such as the clientPath to your images) without fear of breaking the program */
      {
      window:
        {
          position:
          {
            x: 'screenCenter', /* acceptable values "left", "center", "right", "screenCenter", or relative px value */
            y: 'top' /* acceptable values "top", "bottom", "center", or relative px value */
          },
          draggable: true, /* set to false automatically if not binded to an input element */
          liveUpdate: true /* set false if you want the user to have to click "OK" before the binded input box updates values */
        },
      color:
        {
          mode: 'h', /* acceptabled values "h" (hue), "s" (saturation), "v" (brightness), "r" (red), "g" (green), "b" (blue) */
          current: new Color({ hex: 'ffffff' }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) INCLUDING the "#" prefix */
          active: new Color({ hex: 'ffc000' }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) INCLUDING the "#" prefix */
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
          picker:
          {
            file: 'picker.gif', /* Color Picker icon */
            width: 25,
            height: 24
          }
        }
    };
})(jQuery);