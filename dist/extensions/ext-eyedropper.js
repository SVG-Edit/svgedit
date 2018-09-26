var svgEditorExtension_eyedropper = (function () {
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
   * ext-eyedropper.js
   *
   * @license MIT
   *
   * @copyright 2010 Jeff Schiller
   *
   */
  var extEyedropper = {
    name: 'eyedropper',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(S) {
        var strings, svgEditor, $, ChangeElementCommand, svgCanvas, addToHistory, currentStyle, getStyle, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                getStyle = function _ref(opts) {
                  // if we are in eyedropper mode, we don't want to disable the eye-dropper tool
                  var mode = svgCanvas.getMode();

                  if (mode === 'eyedropper') {
                    return;
                  }

                  var tool = $('#tool_eyedropper'); // enable-eye-dropper if one element is selected

                  var elem = null;

                  if (!opts.multiselected && opts.elems[0] && !['svg', 'g', 'use'].includes(opts.elems[0].nodeName)) {
                    elem = opts.elems[0];
                    tool.removeClass('disabled'); // grab the current style

                    currentStyle.fillPaint = elem.getAttribute('fill') || 'black';
                    currentStyle.fillOpacity = elem.getAttribute('fill-opacity') || 1.0;
                    currentStyle.strokePaint = elem.getAttribute('stroke');
                    currentStyle.strokeOpacity = elem.getAttribute('stroke-opacity') || 1.0;
                    currentStyle.strokeWidth = elem.getAttribute('stroke-width');
                    currentStyle.strokeDashArray = elem.getAttribute('stroke-dasharray');
                    currentStyle.strokeLinecap = elem.getAttribute('stroke-linecap');
                    currentStyle.strokeLinejoin = elem.getAttribute('stroke-linejoin');
                    currentStyle.opacity = elem.getAttribute('opacity') || 1.0; // disable eye-dropper tool
                  } else {
                    tool.addClass('disabled');
                  }
                };

                _context.next = 3;
                return S.importLocale();

              case 3:
                strings = _context.sent;
                svgEditor = this;
                $ = jQuery;
                ChangeElementCommand = S.ChangeElementCommand, svgCanvas = svgEditor.canvas, addToHistory = function addToHistory(cmd) {
                  svgCanvas.undoMgr.addCommandToHistory(cmd);
                }, currentStyle = {
                  fillPaint: 'red',
                  fillOpacity: 1.0,
                  strokePaint: 'black',
                  strokeOpacity: 1.0,
                  strokeWidth: 5,
                  strokeDashArray: null,
                  opacity: 1.0,
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter'
                };
                buttons = [{
                  id: 'tool_eyedropper',
                  icon: svgEditor.curConfig.extIconsPath + 'eyedropper.png',
                  type: 'mode',
                  events: {
                    click: function click() {
                      svgCanvas.setMode('eyedropper');
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'eyedropper-icon.xml',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  // if we have selected an element, grab its paint and enable the eye dropper button
                  selectedChanged: getStyle,
                  elementChanged: getStyle,
                  mouseDown: function mouseDown(opts) {
                    var mode = svgCanvas.getMode();

                    if (mode === 'eyedropper') {
                      var e = opts.event;
                      var target = e.target;

                      if (!['svg', 'g', 'use'].includes(target.nodeName)) {
                        var changes = {};

                        var change = function change(elem, attrname, newvalue) {
                          changes[attrname] = elem.getAttribute(attrname);
                          elem.setAttribute(attrname, newvalue);
                        };

                        if (currentStyle.fillPaint) {
                          change(target, 'fill', currentStyle.fillPaint);
                        }

                        if (currentStyle.fillOpacity) {
                          change(target, 'fill-opacity', currentStyle.fillOpacity);
                        }

                        if (currentStyle.strokePaint) {
                          change(target, 'stroke', currentStyle.strokePaint);
                        }

                        if (currentStyle.strokeOpacity) {
                          change(target, 'stroke-opacity', currentStyle.strokeOpacity);
                        }

                        if (currentStyle.strokeWidth) {
                          change(target, 'stroke-width', currentStyle.strokeWidth);
                        }

                        if (currentStyle.strokeDashArray) {
                          change(target, 'stroke-dasharray', currentStyle.strokeDashArray);
                        }

                        if (currentStyle.opacity) {
                          change(target, 'opacity', currentStyle.opacity);
                        }

                        if (currentStyle.strokeLinecap) {
                          change(target, 'stroke-linecap', currentStyle.strokeLinecap);
                        }

                        if (currentStyle.strokeLinejoin) {
                          change(target, 'stroke-linejoin', currentStyle.strokeLinejoin);
                        }

                        addToHistory(new ChangeElementCommand(target, changes));
                      }
                    }
                  }
                });

              case 9:
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

  return extEyedropper;

}());
