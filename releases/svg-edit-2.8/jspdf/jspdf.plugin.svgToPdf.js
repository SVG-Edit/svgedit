/*globals RGBColor, DOMParser, jsPDF*/
/*jslint eqeq:true, vars:true*/
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

(function(jsPDFAPI, undef) {
'use strict';

var pdfSvgAttr = {
    // allowed attributes. all others are removed from the preview.
    g: ['stroke', 'fill', 'stroke-width'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
    rect: ['x', 'y', 'width', 'height', 'stroke', 'fill', 'stroke-width'],
    ellipse: ['cx', 'cy', 'rx', 'ry', 'stroke', 'fill', 'stroke-width'],
    circle: ['cx', 'cy', 'r', 'stroke', 'fill', 'stroke-width'],
    text: ['x', 'y', 'font-size', 'font-family', 'text-anchor', 'font-weight', 'font-style', 'fill']
};

var attributeIsNotEmpty = function (node, attr) {
    var attVal = attr ? node.getAttribute(attr) : node;
    return attVal !== '' && attVal !== null;
};

var nodeIs = function (node, possible) {
    return possible.indexOf(node.tagName.toLowerCase()) > -1;
};

var removeAttributes = function(node, attributes) {
    var toRemove = [];
    [].forEach.call(node.attributes, function(a) {
        if (attributeIsNotEmpty(a) && attributes.indexOf(a.name.toLowerCase()) == -1) {
            toRemove.push(a.name);
        }
    });

    toRemove.forEach(function(a) {
        node.removeAttribute(a.name);
    });
};

var svgElementToPdf = function(element, pdf, options) {
    // pdf is a jsPDF object
    //console.log("options =", options);
    var remove = (options.removeInvalid == undef ? false : options.removeInvalid);
    var k = (options.scale == undef ? 1.0 : options.scale);
    var colorMode = null;
    [].forEach.call(element.children, function(node) {
        //console.log("passing: ", node);
        var hasFillColor = false;
        var hasStrokeColor = false;
        var fillRGB;
        if(nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle', 'text'])) {
            var fillColor = node.getAttribute('fill');
            if(attributeIsNotEmpty(fillColor)) {
                fillRGB = new RGBColor(fillColor);
                if(fillRGB.ok) {
                    hasFillColor = true;
                    colorMode = 'F';
                } else {
                    colorMode = null;
                }
            }
        }
        if(nodeIs(node, ['g', 'line', 'rect', 'ellipse', 'circle'])) {
            if(hasFillColor) {
                pdf.setFillColor(fillRGB.r, fillRGB.g, fillRGB.b);
            }
            if(attributeIsNotEmpty(node, 'stroke-width')) {
                pdf.setLineWidth(k * parseInt(node.getAttribute('stroke-width'), 10));
            }
            var strokeColor = node.getAttribute('stroke');
            if(attributeIsNotEmpty(strokeColor)) {
                var strokeRGB = new RGBColor(strokeColor);
                if(strokeRGB.ok) {
                    hasStrokeColor = true;
                    pdf.setDrawColor(strokeRGB.r, strokeRGB.g, strokeRGB.b);
                    if(colorMode == 'F') {
                        colorMode = 'FD';
                    } else {
                        colorMode = null;
                    }
                } else {
                    colorMode = null;
                }
            }
        }
        switch(node.tagName.toLowerCase()) {
            case 'svg':
            case 'a':
            case 'g':
                svgElementToPdf(node, pdf, options);
                removeAttributes(node, pdfSvgAttr.g);
                break;
            case 'line':
                pdf.line(
                    k*parseInt(node.getAttribute('x1'), 10),
                    k*parseInt(node.getAttribute('y1'), 10),
                    k*parseInt(node.getAttribute('x2'), 10),
                    k*parseInt(node.getAttribute('y2'), 10)
                );
                removeAttributes(node, pdfSvgAttr.line);
                break;
            case 'rect':
                pdf.rect(
                    k*parseInt(node.getAttribute('x'), 10),
                    k*parseInt(node.getAttribute('y'), 10),
                    k*parseInt(node.getAttribute('width'), 10),
                    k*parseInt(node.getAttribute('height'), 10),
                    colorMode
                );
                removeAttributes(node, pdfSvgAttr.rect);
                break;
            case 'ellipse':
                pdf.ellipse(
                    k*parseInt(node.getAttribute('cx'), 10),
                    k*parseInt(node.getAttribute('cy'), 10),
                    k*parseInt(node.getAttribute('rx'), 10),
                    k*parseInt(node.getAttribute('ry'), 10),
                    colorMode
                );
                removeAttributes(node, pdfSvgAttr.ellipse);
                break;
            case 'circle':
                pdf.circle(
                    k*parseInt(node.getAttribute('cx'), 10),
                    k*parseInt(node.getAttribute('cy'), 10),
                    k*parseInt(node.getAttribute('r'), 10),
                    colorMode
                );
                removeAttributes(node, pdfSvgAttr.circle);
                break;
            case 'text':
                if(node.hasAttribute('font-family')) {
                    switch((node.getAttribute('font-family') || '').toLowerCase()) {
                        case 'serif': pdf.setFont('times'); break;
                        case 'monospace': pdf.setFont('courier'); break;
                        default:
                            node.setAttribute('font-family', 'sans-serif');
                            pdf.setFont('helvetica');
                    }
                }
                if(hasFillColor) {
                    pdf.setTextColor(fillRGB.r, fillRGB.g, fillRGB.b);
                }
                var fontType = "";
                if(node.hasAttribute('font-weight')) {
                    if(node.getAttribute('font-weight') == "bold") {
                        fontType = "bold";
                    } else {
                        node.removeAttribute('font-weight');
                    }
                }
                if(node.hasAttribute('font-style')) {
                    if(node.getAttribute('font-style') == "italic") {
                        fontType += "italic";
                    } else {
                        node.removeAttribute('font-style');
                    }
                }
                pdf.setFontType(fontType);
                var pdfFontSize = 16;
                if(node.hasAttribute('font-size')) {
                    pdfFontSize = parseInt(node.getAttribute('font-size'), 10);
                }
                var box = node.getBBox();
                //FIXME: use more accurate positioning!!
                var x, y, xOffset = 0;
                if(node.hasAttribute('text-anchor')) {
                    switch(node.getAttribute('text-anchor')) {
                        case 'end': xOffset = box.width; break;
                        case 'middle': xOffset = box.width / 2; break;
                        case 'start': break;
                        case 'default': node.setAttribute('text-anchor', 'start'); break;
                    }
                    x = parseInt(node.getAttribute('x'), 10) - xOffset;
                    y = parseInt(node.getAttribute('y'), 10);
                }
                //console.log("fontSize:", pdfFontSize, "text:", node.textContent);
                pdf.setFontSize(pdfFontSize).text(
                    k * x,
                    k * y,
                    node.textContent
                );
                removeAttributes(node, pdfSvgAttr.text);
                break;
            //TODO: image
            default:
                if (remove) {
                    console.log("can't translate to pdf:", node);
                    node.parentNode.removeChild(node);
                }
        }
    });
    return pdf;
};

    jsPDFAPI.addSVG = function(element, x, y, options) {

        options = (options === undef ? {} : options);
        options.x_offset = x;
        options.y_offset = y;

        if (typeof element === 'string') {
            element = new DOMParser().parseFromString(element, 'text/xml').documentElement;
        }
        svgElementToPdf(element, this, options);
        return this;
    };
}(jsPDF.API));
