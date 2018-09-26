var svgEditorExtension_panning = (function () {
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

  /**
   * ext-panning.js
   *
   * @license MIT
   *
   * @copyright 2013 Luis Aguirre
   *
   */

  /*
    This is a very basic SVG-Edit extension to let tablet/mobile devices pan without problem
  */
  var extPanning = {
    name: 'panning',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale, strings, svgEditor, svgCanvas, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                importLocale = _ref.importLocale;
                _context.next = 3;
                return importLocale();

              case 3:
                strings = _context.sent;
                svgEditor = this;
                svgCanvas = svgEditor.canvas;
                buttons = [{
                  id: 'ext-panning',
                  icon: svgEditor.curConfig.extIconsPath + 'panning.png',
                  type: 'mode',
                  events: {
                    click: function click() {
                      svgCanvas.setMode('ext-panning');
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  mouseDown: function mouseDown() {
                    if (svgCanvas.getMode() === 'ext-panning') {
                      svgEditor.setPanning(true);
                      return {
                        started: true
                      };
                    }
                  },
                  mouseUp: function mouseUp() {
                    if (svgCanvas.getMode() === 'ext-panning') {
                      svgEditor.setPanning(false);
                      return {
                        keep: false,
                        element: null
                      };
                    }
                  }
                });

              case 8:
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

  return extPanning;

}());
