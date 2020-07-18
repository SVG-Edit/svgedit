(function () {
  'use strict';

  /**
   * For parsing color values.
   * @module RGBColor
   * @author Stoyan Stefanov <sstoo@gmail.com>
   * @see https://www.phpied.com/rgb-color-parser-in-javascript/
   * @license MIT
  */
  const simpleColors = {
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

  const colorDefs = [{
    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
    // re: /^rgb\((?<r>\d{1,3}),\s*(?<g>\d{1,3}),\s*(?<b>\d{1,3})\)$/,
    example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],

    process(_, ...bits) {
      return bits.map(b => Number.parseInt(b));
    }

  }, {
    re: /^(\w{2})(\w{2})(\w{2})$/,
    // re: /^(?<r>\w{2})(?<g>\w{2})(?<b>\w{2})$/,
    example: ['#00ff00', '336699'],

    process(_, ...bits) {
      return bits.map(b => Number.parseInt(b, 16));
    }

  }, {
    re: /^(\w)(\w)(\w)$/,
    // re: /^(?<r>\w{1})(?<g>\w{1})(?<b>\w{1})$/,
    example: ['#fb0', 'f0f'],

    process(_, ...bits) {
      return bits.map(b => Number.parseInt(b + b, 16));
    }

  }];
  /**
   * A class to parse color values.
   */

  class RGBColor {
    /**
    * @param {string} colorString
    */
    constructor(colorString) {
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


      colorDefs.forEach(({
        re,
        process: processor
      }) => {
        const bits = re.exec(colorString);

        if (bits) {
          const [r, g, b] = processor(...bits);
          Object.assign(this, {
            r,
            g,
            b
          });
          this.ok = true;
        }
      }); // validate/cleanup values

      this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
      this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
      this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
    } // some getters

    /**
    * @returns {string}
    */


    toRGB() {
      return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    /**
    * @returns {string}
    */


    toHex() {
      let r = this.r.toString(16);
      let g = this.g.toString(16);
      let b = this.b.toString(16);

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


    static getHelpXML() {
      const examples = [// add regexps
      ...colorDefs.flatMap(({
        example
      }) => {
        return example;
      }), // add type-in colors
      ...Object.keys(simpleColors)];
      const xml = document.createElement('ul');
      xml.setAttribute('id', 'rgbcolor-examples');
      xml.append(...examples.map(example => {
        try {
          const listItem = document.createElement('li');
          const listColor = new RGBColor(example);
          const exampleDiv = document.createElement('div');
          exampleDiv.style.cssText = `
  margin: 3px;
  border: 1px solid black;
  background: ${listColor.toHex()};
  color: ${listColor.toHex()};`;
          exampleDiv.append('test');
          const listItemValue = ` ${example} -> ${listColor.toRGB()} -> ${listColor.toHex()}`;
          listItem.append(exampleDiv, listItemValue);
          return listItem;
        } catch (e) {
          return '';
        }
      }));
      return xml;
    }

  }

  /* globals jsPDF */
  const jsPDFAPI = jsPDF.API;
  const pdfSvgAttr = {
    // allowed attributes. all others are removed from the preview.
    g: ['stroke', 'fill', 'stroke-width'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
    rect: ['x', 'y', 'width', 'height', 'stroke', 'fill', 'stroke-width'],
    ellipse: ['cx', 'cy', 'rx', 'ry', 'stroke', 'fill', 'stroke-width'],
    circle: ['cx', 'cy', 'r', 'stroke', 'fill', 'stroke-width'],
    polygon: ['points', 'stroke', 'fill', 'stroke-width'],
    // polyline attributes are the same as those of polygon
    path: ['d', 'stroke', 'fill', 'stroke-width'],
    text: ['x', 'y', 'font-size', 'font-family', 'text-anchor', 'font-weight', 'font-style', 'fill']
  };

  const attributeIsNotEmpty = function (node, attr) {
    const attVal = attr ? node.getAttribute(attr) : node;
    return attVal !== '' && attVal !== null && attVal !== 'null';
  };

  const nodeIs = function (node, possible) {
    return possible.includes(node.tagName.toLowerCase());
  };

  const removeAttributes = function (node, attributes) {
    const toRemove = [];
    [].forEach.call(node.attributes, function (a) {
      if (attributeIsNotEmpty(a) && !attributes.includes(a.name.toLowerCase())) {
        toRemove.push(a.name);
      }
    });
    toRemove.forEach(a => {
      node.removeAttribute(a.name);
    });
  };

  const numRgx = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:[eE]\d+|[eE][+-]\d+|)/g;

  const getLinesOptionsOfPoly = function (node) {
    let nums = node.getAttribute('points');
    nums = nums && nums.match(numRgx) || [];

    if (nums && nums.length) {
      nums = nums.map(n => Number(n));

      if (nums.length % 2) {
        nums.length--;
      }
    }

    if (nums.length < 4) {
      console.log('invalid points attribute:', node); // eslint-disable-line no-console

      return undefined;
    }

    const [x, y] = nums,
          lines = [];

    for (let i = 2; i < nums.length; i += 2) {
      lines.push([nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]]);
    }

    return {
      x,
      y,
      lines
    };
  };

  const getLinesOptionsOfPath = function (node) {
    const segList = node.pathSegList,
          n = segList.numberOfItems,
          opsList = [];
    let ops = {
      lines: []
    };
    const curr = {
      x: 0,
      y: 0
    };
    const reflectControl = {
      x: 0,
      y: 0
    };

    const toRelative = function (nums, relativeTo) {
      const re = [];

      for (let i = 0; i < nums.length - 1; i += 2) {
        re[i] = nums[i] - relativeTo.x;
        re[i + 1] = nums[i + 1] - relativeTo.y;
      }

      return re;
    };

    const curveQToC = function (nums) {
      const a = 2 / 3;
      const re = [nums[0] * a, nums[1] * a, nums[2] + (nums[0] - nums[2]) * a, nums[3] + (nums[1] - nums[3]) * a, nums[2], nums[3]];
      return re;
    };

    for (let i = 0, letterPrev; i < n; i++) {
      const seg = segList.getItem(i);
      const {
        x1,
        y1,
        x2,
        y2,
        x,
        y,
        pathSegTypeAsLetter: letter
      } = seg;
      const isRelative = letter >= 'a'; // lowercase letter

      switch (letter) {
        case 'M':
        case 'm':
          {
            if (ops.lines.length && Object.prototype.hasOwnProperty.call(ops, 'x')) {
              opsList.push(ops);
            }

            ops = {
              lines: [],
              x: isRelative ? x + curr.x : x,
              y: isRelative ? y + curr.y : y,
              closed: false
            };
            ops.closed = false;
            break;
          }

        case 'L':
          {
            ops.lines.push(toRelative([x, y], curr));
            break;
          }

        case 'l':
          {
            ops.lines.push([x, y]);
            break;
          }

        case 'H':
          {
            ops.lines.push([x - curr.x, 0]);
            break;
          }

        case 'h':
          {
            ops.lines.push([x, 0]);
            break;
          }

        case 'V':
          {
            ops.lines.push([0, y - curr.y]);
            break;
          }

        case 'v':
          {
            ops.lines.push([0, y]);
            break;
          }

        case 'Q':
          {
            ops.lines.push(curveQToC(toRelative([x1, y1, x, y], curr)));
            reflectControl.x = x - x1;
            reflectControl.y = y - y1;
            break;
          }

        case 'q':
          {
            ops.lines.push(curveQToC([x1, y1, x, y]));
            reflectControl.x = x - x1;
            reflectControl.y = y - y1;
            break;
          }

        case 'T':
          {
            const p1 = letterPrev && 'QqTt'.includes(letterPrev) ? reflectControl : {
              x: 0,
              y: 0
            };
            ops.lines.push(curveQToC([p1.x, p1.y, x - curr.x, y - curr.y]));
            reflectControl.x = x - curr.x - p1.x;
            reflectControl.y = y - curr.y - p1.y;
            break;
          }

        case 't':
          {
            const p1 = letterPrev && 'QqTt'.includes(letterPrev) ? reflectControl : {
              x: 0,
              y: 0
            };
            ops.lines.push([p1.x, p1.y, x, y]);
            reflectControl.x = x - p1.x;
            reflectControl.y = y - p1.y;
            break;
          }

        case 'C':
          {
            ops.lines.push(toRelative([x1, y1, x2, y2, x, y], curr));
            break;
          }

        case 'c':
          {
            ops.lines.push([x1, y1, x2, y2, x, y]);
            break;
          }

        case 'S':
        case 's':
          {
            const p1 = letterPrev && 'CcSs'.includes(letterPrev) ? reflectControl : {
              x: 0,
              y: 0
            };

            if (isRelative) {
              ops.lines.push([p1.x, p1.y, x2, y2, x, y]);
            } else {
              ops.lines.push([p1.x, p1.y].concat(toRelative([x2, y2, x, y], curr)));
            }

            reflectControl.x = x - x2;
            reflectControl.y = y - y2;
            break;
          }

        case 'A':
        case 'a':
          {
            // Not support command 'A' and 'a' yet. Treat it as straight line instead.
            if (isRelative) {
              ops.lines.push([x, y]);
            } else {
              ops.lines.push(toRelative([x, y], curr));
            }

            break;
          }

        case 'z':
        case 'Z':
          {
            ops.closed = true;
            break;
          }

        default:
          {
            // throw new Error('Unknown path command ' + letter);
            return opsList;
          }
      }

      if (letter === 'Z' || letter === 'z') {
        curr.x = ops.x;
        curr.y = ops.y;
      } else {
        if (letter !== 'V' && letter !== 'v') {
          curr.x = isRelative ? x + curr.x : x;
        }

        if (letter !== 'H' && letter !== 'h') {
          curr.y = isRelative ? y + curr.y : y;
        }
      }

      letterPrev = letter;
    }

    if (ops.lines.length && Object.prototype.hasOwnProperty.call(ops, 'x')) {
      opsList.push(ops);
    }

    return opsList;
  };

  const svgElementToPdf = function (element, pdf, options) {
    // pdf is a jsPDF object
    // console.log('options =', options);
    const remove = options.removeInvalid === undefined ? false : options.removeInvalid;
    const k = options.scale === undefined ? 1.0 : options.scale;
    let colorMode = null;
    [].forEach.call(element.children, function (node) {
      // console.log('passing: ', node);
      // let hasStrokeColor = false;
      let hasFillColor = false;
      let fillRGB;
      colorMode = null;

      if (nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'path', 'text'])) {
        const fillColor = node.getAttribute('fill');

        if (attributeIsNotEmpty(fillColor) && node.getAttribute('fill-opacity') !== '0') {
          fillRGB = new RGBColor(fillColor);

          if (fillRGB.ok) {
            hasFillColor = true;
            colorMode = 'F';
          } else {
            colorMode = null;
          }
        }
      }

      if (nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'path'])) {
        if (hasFillColor) {
          pdf.setFillColor(fillRGB.r, fillRGB.g, fillRGB.b);
        }

        if (attributeIsNotEmpty(node, 'stroke-width')) {
          pdf.setLineWidth(k * Number.parseInt(node.getAttribute('stroke-width')));
        }

        const strokeColor = node.getAttribute('stroke');

        if (attributeIsNotEmpty(strokeColor) && node.getAttribute('stroke-width') !== '0' && node.getAttribute('stroke-opacity') !== '0') {
          const strokeRGB = new RGBColor(strokeColor);

          if (strokeRGB.ok) {
            // hasStrokeColor = true;
            pdf.setDrawColor(strokeRGB.r, strokeRGB.g, strokeRGB.b);

            if (hasFillColor) {
              colorMode = 'FD';
            } else {
              colorMode = 'S';
            }
          } else {
            colorMode = null;
          }
        }
      }

      const tag = node.tagName.toLowerCase();

      switch (tag) {
        case 'svg':
        case 'a':
        case 'g':
          svgElementToPdf(node, pdf, options);
          removeAttributes(node, pdfSvgAttr.g);
          break;

        case 'line':
          pdf.line(k * Number.parseInt(node.getAttribute('x1')), k * Number.parseInt(node.getAttribute('y1')), k * Number.parseInt(node.getAttribute('x2')), k * Number.parseInt(node.getAttribute('y2')));
          removeAttributes(node, pdfSvgAttr.line);
          break;

        case 'rect':
          pdf.rect(k * Number.parseInt(node.getAttribute('x')), k * Number.parseInt(node.getAttribute('y')), k * Number.parseInt(node.getAttribute('width')), k * Number.parseInt(node.getAttribute('height')), colorMode);
          removeAttributes(node, pdfSvgAttr.rect);
          break;

        case 'ellipse':
          pdf.ellipse(k * Number.parseInt(node.getAttribute('cx')), k * Number.parseInt(node.getAttribute('cy')), k * Number.parseInt(node.getAttribute('rx')), k * Number.parseInt(node.getAttribute('ry')), colorMode);
          removeAttributes(node, pdfSvgAttr.ellipse);
          break;

        case 'circle':
          pdf.circle(k * Number.parseInt(node.getAttribute('cx')), k * Number.parseInt(node.getAttribute('cy')), k * Number.parseInt(node.getAttribute('r')), colorMode);
          removeAttributes(node, pdfSvgAttr.circle);
          break;

        case 'polygon':
        case 'polyline':
          {
            const linesOptions = getLinesOptionsOfPoly(node);

            if (linesOptions) {
              pdf.lines(linesOptions.lines, k * linesOptions.x, k * linesOptions.y, [k, k], colorMode, tag === 'polygon' // polygon is closed, polyline is not closed
              );
            }

            removeAttributes(node, pdfSvgAttr.polygon);
            break;
          }

        case 'path':
          {
            if (colorMode) {
              const linesOptionsList = getLinesOptionsOfPath(node);

              if (linesOptionsList.length > 0) {
                linesOptionsList.forEach(function (linesOptions) {
                  pdf.lines(linesOptions.lines, k * linesOptions.x, k * linesOptions.y, [k, k], null, linesOptions.closed);
                }); // svg fill rule default is nonzero

                const fillRule = node.getAttribute('fill-rule');

                if (fillRule === 'evenodd') {
                  // f* : fill using even-odd rule
                  // B* : stroke and fill using even-odd rule
                  if (colorMode === 'F') {
                    colorMode = 'f*';
                  } else if (colorMode === 'FD') {
                    colorMode = 'B*';
                  }
                }

                pdf.internal.write(pdf.internal.getStyle(colorMode));
              }
            }

            removeAttributes(node, pdfSvgAttr.path);
            break;
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

                case 'times':
                  pdf.setFont('times');
                  break;

                case 'courier':
                  pdf.setFont('courier');
                  break;

                case 'helvetica':
                  pdf.setFont('helvetica');
                  break;

                default:
                  node.setAttribute('font-family', 'sans-serif');
                  pdf.setFont('helvetica');
              }
            }

            if (hasFillColor) {
              pdf.setTextColor(fillRGB.r, fillRGB.g, fillRGB.b);
            }

            let fontType = '';

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
            const pdfFontSize = node.hasAttribute('font-size') ? Number.parseInt(node.getAttribute('font-size')) : 16;
            /**
             *
             * @param {Element} elem
             * @returns {Float}
             */

            const getWidth = elem => {
              let box;

              try {
                box = elem.getBBox(); // Firefox on MacOS will raise error here
              } catch (err) {
                // copy and append to body so that getBBox is available
                const nodeCopy = elem.cloneNode(true);
                const svg = elem.ownerSVGElement.cloneNode(false);
                svg.appendChild(nodeCopy);
                document.body.appendChild(svg);

                try {
                  box = nodeCopy.getBBox();
                } catch (error) {
                  box = {
                    width: 0
                  };
                }

                svg.remove();
              }

              return box.width;
            }; // TODO: use more accurate positioning!!


            let x,
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

              x = Number.parseInt(node.getAttribute('x')) - xOffset;
              y = Number.parseInt(node.getAttribute('y'));
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
