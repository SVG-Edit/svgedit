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
  text: ['x', 'y', 'font-size', 'font-family', 'text-anchor', 'font-weight', 'font-style', 'fill']
};

const attributeIsNotEmpty = function (node, attr) {
  const attVal = attr ? node.getAttribute(attr) : node;
  return attVal !== '' && attVal !== null;
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

const numRgx = /[+-]?(?:\d+\.\d*|\d+|\.\d+)(?:[eE][+-]?\d+)?/g;
const getLinesOptionsOfPoly = function (node) {
  let nums = node.getAttribute('points');
  nums = (nums && nums.match(numRgx)) || [];
  if (nums && nums.length) {
    nums = nums.map(Number);
    if (nums.length % 2) {
      nums.length--;
    }
  }
  if (nums.length < 4) {
    console.log('invalid points attribute:', node);
    return;
  }
  const [x, y] = nums, lines = [];
  for (let i = 2; i < nums.length; i += 2) {
    lines.push([nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]]);
  }
  return {x, y, lines};
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
    if (nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'text'])) {
      const fillColor = node.getAttribute('fill');
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
        pdf.setLineWidth(k * parseInt(node.getAttribute('stroke-width'), 10));
      }
      const strokeColor = node.getAttribute('stroke');
      if (attributeIsNotEmpty(strokeColor)) {
        const strokeRGB = new RGBColor(strokeColor);
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
        k * parseInt(node.getAttribute('x1'), 10),
        k * parseInt(node.getAttribute('y1'), 10),
        k * parseInt(node.getAttribute('x2'), 10),
        k * parseInt(node.getAttribute('y2'), 10)
      );
      removeAttributes(node, pdfSvgAttr.line);
      break;
    case 'rect':
      pdf.rect(
        k * parseInt(node.getAttribute('x'), 10),
        k * parseInt(node.getAttribute('y'), 10),
        k * parseInt(node.getAttribute('width'), 10),
        k * parseInt(node.getAttribute('height'), 10),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.rect);
      break;
    case 'ellipse':
      pdf.ellipse(
        k * parseInt(node.getAttribute('cx'), 10),
        k * parseInt(node.getAttribute('cy'), 10),
        k * parseInt(node.getAttribute('rx'), 10),
        k * parseInt(node.getAttribute('ry'), 10),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.ellipse);
      break;
    case 'circle':
      pdf.circle(
        k * parseInt(node.getAttribute('cx'), 10),
        k * parseInt(node.getAttribute('cy'), 10),
        k * parseInt(node.getAttribute('r'), 10),
        colorMode
      );
      removeAttributes(node, pdfSvgAttr.circle);
      break;
    case 'polygon':
    case 'polyline':
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
    // TODO: path
    case 'text':
      if (node.hasAttribute('font-family')) {
        switch ((node.getAttribute('font-family') || '').toLowerCase()) {
        case 'serif': pdf.setFont('times'); break;
        case 'monospace': pdf.setFont('courier'); break;
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
        ? parseInt(node.getAttribute('font-size'), 10)
        : 16;

      const getWidth = (node) => {
        let box;
        try {
          box = node.getBBox(); // Firefox on MacOS will raise error here
        } catch (err) {
          // copy and append to body so that getBBox is available
          const nodeCopy = node.cloneNode(true);
          const svg = node.ownerSVGElement.cloneNode(false);
          svg.appendChild(nodeCopy);
          document.body.appendChild(svg);
          try {
            box = nodeCopy.getBBox();
          } catch (err) {
            box = {width: 0};
          }
          document.body.removeChild(svg);
        }
        return box.width;
      };
      // FIXME: use more accurate positioning!!
      let x, y, xOffset = 0;
      if (node.hasAttribute('text-anchor')) {
        switch (node.getAttribute('text-anchor')) {
        case 'end': xOffset = getWidth(node); break;
        case 'middle': xOffset = getWidth(node) / 2; break;
        case 'start': break;
        case 'default': node.setAttribute('text-anchor', 'start'); break;
        }
        x = parseInt(node.getAttribute('x'), 10) - xOffset;
        y = parseInt(node.getAttribute('y'), 10);
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
    default:
      if (remove) {
        console.log("can't translate to pdf:", node);
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
