var svgEditorExtension_grid = (function () {
  'use strict';

  /**
   * ext-grid.js
   *
   * @license Apache-2.0
   *
   * @copyright 2010 Redou Mine, 2010 Alexis Deveria
   *
   */
  var extGrid = {
    name: 'grid',
    init: function init(_ref) {
      var $, NS, getTypeMap, importLocale, strings, svgEditor, svgCanvas, svgdoc, assignAttributes, hcanvas, canvBG, units, intervals, showGrid, canvasGrid, gridDefs, gridPattern, gridimg, gridBox, updateGrid, gridUpdate, buttons;
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              gridUpdate = function _ref3() {
                if (showGrid) {
                  updateGrid(svgCanvas.getZoom());
                }

                $('#canvasGrid').toggle(showGrid);
                $('#view_grid').toggleClass('push_button_pressed tool_button');
              };

              updateGrid = function _ref2(zoom) {
                // TODO: Try this with <line> elements, then compare performance difference
                var unit = units[svgEditor.curConfig.baseUnit]; // 1 = 1px

                var uMulti = unit * zoom; // Calculate the main number interval

                var rawM = 100 / uMulti;
                var multi = 1;
                intervals.some(function (num) {
                  multi = num;
                  return rawM <= num;
                });
                var bigInt = multi * uMulti; // Set the canvas size to the width of the container

                hcanvas.width = bigInt;
                hcanvas.height = bigInt;
                var ctx = hcanvas.getContext('2d');
                var curD = 0.5;
                var part = bigInt / 10;
                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = svgEditor.curConfig.gridColor;

                for (var i = 1; i < 10; i++) {
                  var subD = Math.round(part * i) + 0.5; // const lineNum = (i % 2)?12:10;

                  var lineNum = 0;
                  ctx.moveTo(subD, bigInt);
                  ctx.lineTo(subD, lineNum);
                  ctx.moveTo(bigInt, subD);
                  ctx.lineTo(lineNum, subD);
                }

                ctx.stroke();
                ctx.beginPath();
                ctx.globalAlpha = 0.5;
                ctx.moveTo(curD, bigInt);
                ctx.lineTo(curD, 0);
                ctx.moveTo(bigInt, curD);
                ctx.lineTo(0, curD);
                ctx.stroke();
                var datauri = hcanvas.toDataURL('image/png');
                gridimg.setAttribute('width', bigInt);
                gridimg.setAttribute('height', bigInt);
                gridimg.parentNode.setAttribute('width', bigInt);
                gridimg.parentNode.setAttribute('height', bigInt);
                svgCanvas.setHref(gridimg, datauri);
              };

              $ = _ref.$, NS = _ref.NS, getTypeMap = _ref.getTypeMap, importLocale = _ref.importLocale;
              _context.next = 5;
              return regeneratorRuntime.awrap(importLocale());

            case 5:
              strings = _context.sent;
              svgEditor = this;
              svgCanvas = svgEditor.canvas;
              svgdoc = document.getElementById('svgcanvas').ownerDocument, assignAttributes = svgCanvas.assignAttributes, hcanvas = document.createElement('canvas'), canvBG = $('#canvasBackground'), units = getTypeMap(), intervals = [0.01, 0.1, 1, 10, 100, 1000];
              showGrid = svgEditor.curConfig.showGrid || false;
              $(hcanvas).hide().appendTo('body');
              canvasGrid = svgdoc.createElementNS(NS.SVG, 'svg');
              assignAttributes(canvasGrid, {
                id: 'canvasGrid',
                width: '100%',
                height: '100%',
                x: 0,
                y: 0,
                overflow: 'visible',
                display: 'none'
              });
              canvBG.append(canvasGrid);
              gridDefs = svgdoc.createElementNS(NS.SVG, 'defs'); // grid-pattern

              gridPattern = svgdoc.createElementNS(NS.SVG, 'pattern');
              assignAttributes(gridPattern, {
                id: 'gridpattern',
                patternUnits: 'userSpaceOnUse',
                x: 0,
                // -(value.strokeWidth / 2), // position for strokewidth
                y: 0,
                // -(value.strokeWidth / 2), // position for strokewidth
                width: 100,
                height: 100
              });
              gridimg = svgdoc.createElementNS(NS.SVG, 'image');
              assignAttributes(gridimg, {
                x: 0,
                y: 0,
                width: 100,
                height: 100
              });
              gridPattern.append(gridimg);
              gridDefs.append(gridPattern);
              $('#canvasGrid').append(gridDefs); // grid-box

              gridBox = svgdoc.createElementNS(NS.SVG, 'rect');
              assignAttributes(gridBox, {
                width: '100%',
                height: '100%',
                x: 0,
                y: 0,
                'stroke-width': 0,
                stroke: 'none',
                fill: 'url(#gridpattern)',
                style: 'pointer-events: none; display:visible;'
              });
              $('#canvasGrid').append(gridBox);
              /**
               *
               * @param {Float} zoom
               * @returns {void}
               */

              buttons = [{
                id: 'view_grid',
                icon: svgEditor.curConfig.extIconsPath + 'grid.png',
                type: 'context',
                panel: 'editor_panel',
                events: {
                  click: function click() {
                    svgEditor.curConfig.showGrid = showGrid = !showGrid;
                    gridUpdate();
                  }
                }
              }];
              return _context.abrupt("return", {
                name: strings.name,
                svgicons: svgEditor.curConfig.extIconsPath + 'grid-icon.xml',
                zoomChanged: function zoomChanged(zoom) {
                  if (showGrid) {
                    updateGrid(zoom);
                  }
                },
                callback: function callback() {
                  if (showGrid) {
                    gridUpdate();
                  }
                },
                buttons: strings.buttons.map(function (button, i) {
                  return Object.assign(buttons[i], button);
                })
              });

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  };

  return extGrid;

}());
