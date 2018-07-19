var svgEditorExtension_panning = (function () {
  'use strict';

  var asyncToGenerator = function (fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
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
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  };

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
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale = _ref.importLocale;
        var strings, svgEditor, svgCanvas, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return importLocale();

              case 2:
                strings = _context.sent;
                svgEditor = this;
                svgCanvas = svgEditor.canvas;
                buttons = [{
                  id: 'ext-panning',
                  type: 'mode',
                  events: {
                    click: function click() {
                      svgCanvas.setMode('ext-panning');
                    }
                  }
                }];
                return _context.abrupt('return', {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'ext-panning.xml',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  mouseDown: function mouseDown() {
                    if (svgCanvas.getMode() === 'ext-panning') {
                      svgEditor.setPanning(true);
                      return { started: true };
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

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref2.apply(this, arguments);
      }

      return init;
    }()
  };

  return extPanning;

}());
