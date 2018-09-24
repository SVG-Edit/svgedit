var svgEditorExtension_helloworld = (function () {
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

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
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
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  /* globals jQuery */
  /**
   * ext-helloworld.js
   *
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria
   *
   */

  /**
  * This is a very basic SVG-Edit extension. It adds a "Hello World" button in
  *  the left ("mode") panel. Clicking on the button, and then the canvas
  *  will show the user the point on the canvas that was clicked on.
  */
  var extHelloworld = {
    name: 'helloworld',
    init: function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale = _ref.importLocale;
        var strings, svgEditor, $, svgCanvas;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return importLocale();

              case 2:
                strings = _context.sent;
                svgEditor = this;
                $ = jQuery;
                svgCanvas = svgEditor.canvas;
                return _context.abrupt('return', {
                  name: strings.name,
                  // For more notes on how to make an icon file, see the source of
                  // the helloworld-icon.xml
                  svgicons: svgEditor.curConfig.extIconsPath + 'helloworld-icon.xml',

                  // Multiple buttons can be added in this array
                  buttons: [{
                    // Must match the icon ID in helloworld-icon.xml
                    id: 'hello_world',

                    // Fallback, e.g., for `file:///` access
                    icon: svgEditor.curConfig.extIconsPath + 'helloworld.png',

                    // This indicates that the button will be added to the "mode"
                    // button panel on the left side
                    type: 'mode',

                    // Tooltip text
                    title: strings.buttons[0].title,

                    // Events
                    events: {
                      click: function click() {
                        // The action taken when the button is clicked on.
                        // For "mode" buttons, any other button will
                        // automatically be de-pressed.
                        svgCanvas.setMode('hello_world');
                      }
                    }
                  }],
                  // This is triggered when the main mouse button is pressed down
                  // on the editor canvas (not the tool panels)
                  mouseDown: function mouseDown() {
                    // Check the mode on mousedown
                    if (svgCanvas.getMode() === 'hello_world') {
                      // The returned object must include "started" with
                      // a value of true in order for mouseUp to be triggered
                      return { started: true };
                    }
                  },


                  // This is triggered from anywhere, but "started" must have been set
                  // to true (see above). Note that "opts" is an object with event info
                  mouseUp: function mouseUp(opts) {
                    // Check the mode on mouseup
                    if (svgCanvas.getMode() === 'hello_world') {
                      var zoom = svgCanvas.getZoom();

                      // Get the actual coordinate by dividing by the zoom value
                      var x = opts.mouse_x / zoom;
                      var y = opts.mouse_y / zoom;

                      // We do our own formatting
                      var text = strings.text;

                      [['x', x], ['y', y]].forEach(function (_ref3) {
                        var _ref4 = slicedToArray(_ref3, 2),
                            prop = _ref4[0],
                            val = _ref4[1];

                        text = text.replace('{' + prop + '}', val);
                      });

                      // Show the text using the custom alert function
                      $.alert(text);
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

  return extHelloworld;

}());
