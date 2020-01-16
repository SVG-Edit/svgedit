/* globals jsPDF */
/*
 * svgToPdf.js
 *
 * Copyright 2012-2014 Florian Hülsmann <fh@cbix.de>
 * Copyright 2014 Ben Gribaudo <www.bengribaudo.com>
 *
 * This script is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this file.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import RGBColor from '../canvg/rgbcolor.js';

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

  toRemove.forEach((a) => {
    node.removeAttribute(a.name);
  });
};

const numRgx = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:[eE]\d+|[eE][+-]\d+|)/g;
const getLinesOptionsOfPoly = function (node) {
  let nums = node.getAttribute('points');
  nums = (nums && nums.match(numRgx)) || [];
  if (nums && nums.length) {
    nums = nums.map((n) => Number(n));
    if (nums.length % 2) {
      nums.length--;
    }
  }
  if (nums.length < 4) {
    console.log('invalid points attribute:', node); // eslint-disable-line no-console
    return undefined;
  }
  const [x, y] = nums, lines = [];
  for (let i = 2; i < nums.length; i += 2) {
    lines.push([nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]]);
  }
  return {x, y, lines};
};

const getLinesOptionsOfPath = function (node) {
  const segList = node.pathSegList, n = segList.numberOfItems, opsList = [];
  let ops = {
    lines: []
  };
  const curr = {x: 0, y: 0};
  const reflectControl = {x: 0, y: 0};
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
    const re = [
      nums[0] * a,
      nums[1] * a,
      nums[2] + (nums[0] - nums[2]) * a,
      nums[3] + (nums[1] - nums[3]) * a,
      nums[2],
      nums[3]
    ];
    return re;
  };
  for (let i = 0, letterPrev; i < n; i++) {
    const seg = segList.getItem(i);
    const {x1, y1, x2, y2, x, y, pathSegTypeAsLetter: letter} = seg;
    const isRelative = letter >= 'a'; // lowercase letter
    switch (letter) {
    case 'M':
    case 'm': {
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
    case 'L': {
      ops.lines.push(toRelative([x, y], curr));
      break;
    }
    case 'l': {
      ops.lines.push([x, y]);
      break;
    }
    case 'H': {
      ops.lines.push([x - curr.x, 0]);
      break;
    }
    case 'h': {
      ops.lines.push([x, 0]);
      break;
    }
    case 'V': {
      ops.lines.push([0, y - curr.y]);
      break;
    }
    case 'v': {
      ops.lines.push([0, y]);
      break;
    }
    case 'Q': {
      ops.lines.push(curveQToC(toRelative([x1, y1, x, y], curr)));
      reflectControl.x = x - x1;
      reflectControl.y = y - y1;
      break;
    }
    case 'q': {
      ops.lines.push(curveQToC([x1, y1, x, y]));
      reflectControl.x = x - x1;
      reflectControl.y = y - y1;
      break;
    }
    case 'T': {
      const p1 = letterPrev && 'QqTt'.includes(letterPrev) ? reflectControl : {x: 0, y: 0};
      ops.lines.push(curveQToC([p1.x, p1.y, x - curr.x, y - curr.y]));
      reflectControl.x = x - curr.x - p1.x;
      reflectControl.y = y - curr.y - p1.y;
      break;
    }
    case 't': {
      const p1 = letterPrev && 'QqTt'.includes(letterPrev) ? reflectControl : {x: 0, y: 0};
      ops.lines.push([p1.x, p1.y, x, y]);
      reflectControl.x = x - p1.x;
      reflectControl.y = y - p1.y;
      break;
    }
    case 'C': {
      ops.lines.push(toRelative([x1, y1, x2, y2, x, y], curr));
      break;
    }
    case 'c': {
      ops.lines.push([x1, y1, x2, y2, x, y]);
      break;
    }
    case 'S':
    case 's': {
      const p1 = letterPrev && 'CcSs'.includes(letterPrev) ? reflectControl : {x: 0, y: 0};
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
    case 'a': {
      // Not support command 'A' and 'a' yet. Treat it as straight line instead.
      if (isRelative) {
        ops.lines.push([x, y]);
      } else {
        ops.lines.push(toRelative([x, y], curr));
      }
      break;
    }
    case 'z':
    case 'Z': {
      ops.closed = true;
      break;
    }
    default: {
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
  const remove = (options.removeInvalid === undefined ? false : options.removeInvalid);
  const k = (options.scale === undefined ? 1.0 : options.scale);
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
        pdf.setLineWidth(k * parseInt(node.getAttribute('stroke-width')));
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
      pdf.line(
        k * parseInt(node.getAttribute('x1')),
        k * parseInt(node.getAttribute('y1')),
        k * parseInt(node.getAttribute('x2')),
        k * parseInt(node.getAttribute('y2'))
      );
      removeAttributes(node, pdfSvgAttr.line);
      break;
    case 'rect':
      pdf.rect(
        k * parseInt(node.getAttribute('x')),
        k * parseInt(node.getAttribute('y')),
        k * parseInt(node.getAttribute('width')),
        k * parseInt(node.getAttribute('height')),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.rect);
      break;
    case 'ellipse':
      pdf.ellipse(
        k * parseInt(node.getAttribute('cx')),
        k * parseInt(node.getAttribute('cy')),
        k * parseInt(node.getAttribute('rx')),
        k * parseInt(node.getAttribute('ry')),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.ellipse);
      break;
    case 'circle':
      pdf.circle(
        k * parseInt(node.getAttribute('cx')),
        k * parseInt(node.getAttribute('cy')),
        k * parseInt(node.getAttribute('r')),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.circle);
      break;
    case 'polygon':
    case 'polyline': {
      const linesOptions = getLinesOptionsOfPoly(node);
      if (linesOptions) {
        pdf.lines(
          linesOptions.lines,
          k * linesOptions.x,
          k * linesOptions.y,
          [k, k],
          colorMode,
          tag === 'polygon' // polygon is closed, polyline is not closed
        );
      }
      removeAttributes(node, pdfSvgAttr.polygon);
      break;
    } case 'path': {
      if (colorMode) {
        const linesOptionsList = getLinesOptionsOfPath(node);
        if (linesOptionsList.length > 0) {
          linesOptionsList.forEach(function (linesOptions) {
            pdf.lines(
              linesOptions.lines,
              k * linesOptions.x,
              k * linesOptions.y,
              [k, k],
              null,
              linesOptions.closed
            );
          });
          // svg fill rule default is nonzero
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
    } case 'text': {
      if (node.hasAttribute('font-family')) {
        switch ((node.getAttribute('font-family') || '').toLowerCase()) {
        case 'serif': pdf.setFont('times'); break;
        case 'monospace': pdf.setFont('courier'); break;
        case 'times': pdf.setFont('times'); break;
        case 'courier': pdf.setFont('courier'); break;
        case 'helvetica': pdf.setFont('helvetica'); break;
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
      const pdfFontSize = node.hasAttribute('font-size')
        ? parseInt(node.getAttribute('font-size'))
        : 16;

      /**
       *
       * @param {Element} elem
       * @returns {Float}
       */
      const getWidth = (elem) => {
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
            box = {width: 0};
          }
          document.body.removeChild(svg);
        }
        return box.width;
      };
      // TODO: use more accurate positioning!!
      let x, y, xOffset = 0;
      if (node.hasAttribute('text-anchor')) {
        switch (node.getAttribute('text-anchor')) {
        case 'end': xOffset = getWidth(node); break;
        case 'middle': xOffset = getWidth(node) / 2; break;
        case 'start': break;
        case 'default': node.setAttribute('text-anchor', 'start'); break;
        }
        x = parseInt(node.getAttribute('x')) - xOffset;
        y = parseInt(node.getAttribute('y'));
      }
      // console.log('fontSize:', pdfFontSize, 'text:', node.textContent);
      pdf.setFontSize(pdfFontSize).text(
        k * x,
        k * y,
        node.textContent
      );
      removeAttributes(node, pdfSvgAttr.text);
      break;
    // TODO: image
    } default:
      if (remove) {
        console.log("can't translate to pdf:", node); // eslint-disable-line no-console
        node.remove();
      }
    }
  });
  return pdf;
};

jsPDFAPI.addSVG = function (element, x, y, options) {
  options = (options === undefined ? {} : options);
  options.x_offset = x;
  options.y_offset = y;

  if (typeof element === 'string') {
    element = new DOMParser().parseFromString(element, 'text/xml').documentElement;
  }
  svgElementToPdf(element, this, options);
  return this;
};
