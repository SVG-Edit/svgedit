var svgEditorExtension_grid = (function () {
  'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  /* globals jQuery */

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
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref) {
        var NS, getTypeMap, importLocale, strings, svgEditor, $, svgCanvas, svgdoc, assignAttributes, hcanvas, canvBG, units, intervals, showGrid, canvasGrid, gridPattern, gridimg, gridBox, updateGrid, gridUpdate, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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

                  for (var i = 0; i < intervals.length; i++) {
                    var num = intervals[i];
                    multi = num;

                    if (rawM <= num) {
                      break;
                    }
                  }

                  var bigInt = multi * uMulti; // Set the canvas size to the width of the container

                  hcanvas.width = bigInt;
                  hcanvas.height = bigInt;
                  var ctx = hcanvas.getContext('2d');
                  var curD = 0.5;
                  var part = bigInt / 10;
                  ctx.globalAlpha = 0.2;
                  ctx.strokeStyle = svgEditor.curConfig.gridColor;

                  for (var _i = 1; _i < 10; _i++) {
                    var subD = Math.round(part * _i) + 0.5; // const lineNum = (i % 2)?12:10;

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

                NS = _ref.NS, getTypeMap = _ref.getTypeMap, importLocale = _ref.importLocale;
                _context.next = 5;
                return importLocale();

              case 5:
                strings = _context.sent;
                svgEditor = this;
                $ = jQuery;
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
                canvBG.append(canvasGrid); // grid-pattern

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
                $('#svgroot defs').append(gridPattern); // grid-box

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

              case 26:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function init(_x) {
        return _init.apply(this, arguments);
      };
    }()
  };

  return extGrid;

}());
