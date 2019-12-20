(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * For parsing color values
   * @module RGBColor
   * @author Stoyan Stefanov <sstoo@gmail.com>
   * @see https://www.phpied.com/rgb-color-parser-in-javascript/
   * @license MIT
  */
  var simpleColors = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '00ffff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000000',
    blanchedalmond: 'ffebcd',
    blue: '0000ff',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '00ffff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dodgerblue: '1e90ff',
    feldspar: 'd19275',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'ff00ff',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgrey: 'd3d3d3',
    lightgreen: '90ee90',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslateblue: '8470ff',
    lightslategray: '778899',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '00ff00',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'ff00ff',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370d8',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'd87093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    red: 'ff0000',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    violetred: 'd02090',
    wheat: 'f5deb3',
    white: 'ffffff',
    whitesmoke: 'f5f5f5',
    yellow: 'ffff00',
    yellowgreen: '9acd32'
  }; // array of color definition objects

  var colorDefs = [{
    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
    // re: /^rgb\((?<r>\d{1,3}),\s*(?<g>\d{1,3}),\s*(?<b>\d{1,3})\)$/,
    example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
    process: function process(_) {
      for (var _len = arguments.length, bits = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        bits[_key - 1] = arguments[_key];
      }

      return bits.map(function (b) {
        return parseInt(b);
      });
    }
  }, {
    re: /^(\w{2})(\w{2})(\w{2})$/,
    // re: /^(?<r>\w{2})(?<g>\w{2})(?<b>\w{2})$/,
    example: ['#00ff00', '336699'],
    process: function process(_) {
      for (var _len2 = arguments.length, bits = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        bits[_key2 - 1] = arguments[_key2];
      }

      return bits.map(function (b) {
        return parseInt(b, 16);
      });
    }
  }, {
    re: /^(\w)(\w)(\w)$/,
    // re: /^(?<r>\w{1})(?<g>\w{1})(?<b>\w{1})$/,
    example: ['#fb0', 'f0f'],
    process: function process(_) {
      for (var _len3 = arguments.length, bits = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        bits[_key3 - 1] = arguments[_key3];
      }

      return bits.map(function (b) {
        return parseInt(b + b, 16);
      });
    }
  }];
  /**
   * A class to parse color values.
   */

  var RGBColor =
  /*#__PURE__*/
  function () {
    /**
    * @param {string} colorString
    */
    function RGBColor(colorString) {
      var _this = this;

      _classCallCheck(this, RGBColor);

      this.ok = false; // strip any leading #

      if (colorString.charAt(0) === '#') {
        // remove # if any
        colorString = colorString.substr(1, 6);
      }

      colorString = colorString.replace(/ /g, '');
      colorString = colorString.toLowerCase(); // before getting into regexps, try simple matches
      // and overwrite the input

      if (colorString in simpleColors) {
        colorString = simpleColors[colorString];
      } // end of simple type-in colors
      // search through the definitions to find a match


      colorDefs.forEach(function (_ref) {
        var re = _ref.re,
            processor = _ref.process;
        var bits = re.exec(colorString);

        if (bits) {
          var _processor = processor.apply(void 0, _toConsumableArray(bits)),
              _processor2 = _slicedToArray(_processor, 3),
              r = _processor2[0],
              g = _processor2[1],
              b = _processor2[2];

          Object.assign(_this, {
            r: r,
            g: g,
            b: b
          });
          _this.ok = true;
        }
      }); // validate/cleanup values

      this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
      this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
      this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
    } // some getters

    /**
    * @returns {string}
    */


    _createClass(RGBColor, [{
      key: "toRGB",
      value: function toRGB() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
      }
      /**
      * @returns {string}
      */

    }, {
      key: "toHex",
      value: function toHex() {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);

        if (r.length === 1) {
          r = '0' + r;
        }

        if (g.length === 1) {
          g = '0' + g;
        }

        if (b.length === 1) {
          b = '0' + b;
        }

        return '#' + r + g + b;
      }
      /**
      * Offers a bulleted list of help.
      * @returns {HTMLUListElement}
      */

    }], [{
      key: "getHelpXML",
      value: function getHelpXML() {
        var examples = [].concat(_toConsumableArray(colorDefs.flatMap(function (_ref2) {
          var example = _ref2.example;
          return example;
        })), _toConsumableArray(Object.keys(simpleColors)));
        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        xml.append.apply(xml, _toConsumableArray(examples.map(function (example) {
          try {
            var listItem = document.createElement('li');
            var listColor = new RGBColor(example);
            var exampleDiv = document.createElement('div');
            exampleDiv.style.cssText = "\n  margin: 3px;\n  border: 1px solid black;\n  background: ".concat(listColor.toHex(), ";\n  color: ").concat(listColor.toHex(), ";");
            exampleDiv.append('test');
            var listItemValue = " ".concat(example, " -> ").concat(listColor.toRGB(), " -> ").concat(listColor.toHex());
            listItem.append(exampleDiv, listItemValue);
            return listItem;
          } catch (e) {
            return '';
          }
        })));
        return xml;
      }
    }]);

    return RGBColor;
  }();

  var jsPDFAPI = jsPDF.API;
  var pdfSvgAttr = {
    // allowed attributes. all others are removed from the preview.
    g: ['stroke', 'fill', 'stroke-width'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
    rect: ['x', 'y', 'width', 'height', 'stroke', 'fill', 'stroke-width'],
    ellipse: ['cx', 'cy', 'rx', 'ry', 'stroke', 'fill', 'stroke-width'],
    circle: ['cx', 'cy', 'r', 'stroke', 'fill', 'stroke-width'],
    polygon: ['points', 'stroke', 'fill', 'stroke-width'],
    // polyline attributes are the same as those of polygon
    text: ['x', 'y', 'font-size', 'font-family', 'text-anchor', 'font-weight', 'font-style', 'fill']
  };

  var attributeIsNotEmpty = function attributeIsNotEmpty(node, attr) {
    var attVal = attr ? node.getAttribute(attr) : node;
    return attVal !== '' && attVal !== null;
  };

  var nodeIs = function nodeIs(node, possible) {
    return possible.includes(node.tagName.toLowerCase());
  };

  var removeAttributes = function removeAttributes(node, attributes) {
    var toRemove = [];
    [].forEach.call(node.attributes, function (a) {
      if (attributeIsNotEmpty(a) && !attributes.includes(a.name.toLowerCase())) {
        toRemove.push(a.name);
      }
    });
    toRemove.forEach(function (a) {
      node.removeAttribute(a.name);
    });
  };

  var numRgx = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:[eE]\d+|[eE][+-]\d+|)/g;

  var getLinesOptionsOfPoly = function getLinesOptionsOfPoly(node) {
    var nums = node.getAttribute('points');
    nums = nums && nums.match(numRgx) || [];

    if (nums && nums.length) {
      nums = nums.map(function (n) {
        return Number(n);
      });

      if (nums.length % 2) {
        nums.length--;
      }
    }

    if (nums.length < 4) {
      console.log('invalid points attribute:', node); // eslint-disable-line no-console

      return undefined;
    }

    var _nums = nums,
        _nums2 = _slicedToArray(_nums, 2),
        x = _nums2[0],
        y = _nums2[1],
        lines = [];

    for (var i = 2; i < nums.length; i += 2) {
      lines.push([nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]]);
    }

    return {
      x: x,
      y: y,
      lines: lines
    };
  };

  var svgElementToPdf = function svgElementToPdf(element, pdf, options) {
    // pdf is a jsPDF object
    // console.log('options =', options);
    var remove = options.removeInvalid === undefined ? false : options.removeInvalid;
    var k = options.scale === undefined ? 1.0 : options.scale;
    var colorMode = null;
    [].forEach.call(element.children, function (node) {
      // console.log('passing: ', node);
      // let hasStrokeColor = false;
      var hasFillColor = false;
      var fillRGB;

      if (nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'text'])) {
        var fillColor = node.getAttribute('fill');

        if (attributeIsNotEmpty(fillColor)) {
          fillRGB = new RGBColor(fillColor);

          if (fillRGB.ok) {
            hasFillColor = true;
            colorMode = 'F';
          } else {
            colorMode = null;
          }
        }
      }

      if (nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'polygon', 'polyline'])) {
        if (hasFillColor) {
          pdf.setFillColor(fillRGB.r, fillRGB.g, fillRGB.b);
        }

        if (attributeIsNotEmpty(node, 'stroke-width')) {
          pdf.setLineWidth(k * parseInt(node.getAttribute('stroke-width')));
        }

        var strokeColor = node.getAttribute('stroke');

        if (attributeIsNotEmpty(strokeColor)) {
          var strokeRGB = new RGBColor(strokeColor);

          if (strokeRGB.ok) {
            // hasStrokeColor = true;
            pdf.setDrawColor(strokeRGB.r, strokeRGB.g, strokeRGB.b);

            if (colorMode === 'F') {
              colorMode = 'FD';
            } else {
              colorMode = 'S';
            }
          } else {
            colorMode = null;
          }
        }
      }

      var tag = node.tagName.toLowerCase();

      switch (tag) {
        case 'svg':
        case 'a':
        case 'g':
          svgElementToPdf(node, pdf, options);
          removeAttributes(node, pdfSvgAttr.g);
          break;

        case 'line':
          pdf.line(k * parseInt(node.getAttribute('x1')), k * parseInt(node.getAttribute('y1')), k * parseInt(node.getAttribute('x2')), k * parseInt(node.getAttribute('y2')));
          removeAttributes(node, pdfSvgAttr.line);
          break;

        case 'rect':
          pdf.rect(k * parseInt(node.getAttribute('x')), k * parseInt(node.getAttribute('y')), k * parseInt(node.getAttribute('width')), k * parseInt(node.getAttribute('height')), colorMode);
          removeAttributes(node, pdfSvgAttr.rect);
          break;

        case 'ellipse':
          pdf.ellipse(k * parseInt(node.getAttribute('cx')), k * parseInt(node.getAttribute('cy')), k * parseInt(node.getAttribute('rx')), k * parseInt(node.getAttribute('ry')), colorMode);
          removeAttributes(node, pdfSvgAttr.ellipse);
          break;

        case 'circle':
          pdf.circle(k * parseInt(node.getAttribute('cx')), k * parseInt(node.getAttribute('cy')), k * parseInt(node.getAttribute('r')), colorMode);
          removeAttributes(node, pdfSvgAttr.circle);
          break;

        case 'polygon':
        case 'polyline':
          {
            var linesOptions = getLinesOptionsOfPoly(node);

            if (linesOptions) {
              pdf.lines(linesOptions.lines, k * linesOptions.x, k * linesOptions.y, [k, k], colorMode, tag === 'polygon' // polygon is closed, polyline is not closed
              );
            }

            removeAttributes(node, pdfSvgAttr.polygon);
            break; // TODO: path
          }

        case 'text':
          {
            if (node.hasAttribute('font-family')) {
              switch ((node.getAttribute('font-family') || '').toLowerCase()) {
                case 'serif':
                  pdf.setFont('times');
                  break;

                case 'monospace':
                  pdf.setFont('courier');
                  break;

                default:
                  node.setAttribute('font-family', 'sans-serif');
                  pdf.setFont('helvetica');
              }
            }

            if (hasFillColor) {
              pdf.setTextColor(fillRGB.r, fillRGB.g, fillRGB.b);
            }

            var fontType = '';

            if (node.hasAttribute('font-weight')) {
              if (node.getAttribute('font-weight') === 'bold') {
                fontType = 'bold';
              } else {
                node.removeAttribute('font-weight');
              }
            }

            if (node.hasAttribute('font-style')) {
              if (node.getAttribute('font-style') === 'italic') {
                fontType += 'italic';
              } else {
                node.removeAttribute('font-style');
              }
            }

            pdf.setFontType(fontType);
            var pdfFontSize = node.hasAttribute('font-size') ? parseInt(node.getAttribute('font-size')) : 16;
            /**
             *
             * @param {Element} elem
             * @returns {Float}
             */

            var getWidth = function getWidth(elem) {
              var box;

              try {
                box = elem.getBBox(); // Firefox on MacOS will raise error here
              } catch (err) {
                // copy and append to body so that getBBox is available
                var nodeCopy = elem.cloneNode(true);
                var svg = elem.ownerSVGElement.cloneNode(false);
                svg.appendChild(nodeCopy);
                document.body.appendChild(svg);

                try {
                  box = nodeCopy.getBBox();
                } catch (error) {
                  box = {
                    width: 0
                  };
                }

                document.body.removeChild(svg);
              }

              return box.width;
            }; // TODO: use more accurate positioning!!


            var x,
                y,
                xOffset = 0;

            if (node.hasAttribute('text-anchor')) {
              switch (node.getAttribute('text-anchor')) {
                case 'end':
                  xOffset = getWidth(node);
                  break;

                case 'middle':
                  xOffset = getWidth(node) / 2;
                  break;

                case 'start':
                  break;

                case 'default':
                  node.setAttribute('text-anchor', 'start');
                  break;
              }

              x = parseInt(node.getAttribute('x')) - xOffset;
              y = parseInt(node.getAttribute('y'));
            } // console.log('fontSize:', pdfFontSize, 'text:', node.textContent);


            pdf.setFontSize(pdfFontSize).text(k * x, k * y, node.textContent);
            removeAttributes(node, pdfSvgAttr.text);
            break; // TODO: image
          }

        default:
          if (remove) {
            console.log("can't translate to pdf:", node); // eslint-disable-line no-console

            node.remove();
          }

      }
    });
    return pdf;
  };

  jsPDFAPI.addSVG = function (element, x, y, options) {
    options = options === undefined ? {} : options;
    options.x_offset = x;
    options.y_offset = y;

    if (typeof element === 'string') {
      element = new DOMParser().parseFromString(element, 'text/xml').documentElement;
    }

    svgElementToPdf(element, this, options);
    return this;
  };

}());
