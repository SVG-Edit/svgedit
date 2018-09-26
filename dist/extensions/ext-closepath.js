var svgEditorExtension_closepath = (function () {
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
   * ext-closepath.js
   *
   * @license MIT
   *
   * @copyright 2010 Jeff Schiller
   *
   */
  // This extension adds a simple button to the contextual panel for paths
  // The button toggles whether the path is open or closed
  var extClosepath = {
    name: 'closepath',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale, strings, $, svgEditor, selElems, updateButton, showPanel, toggleClosed, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                importLocale = _ref.importLocale;
                _context.next = 3;
                return importLocale();

              case 3:
                strings = _context.sent;
                $ = jQuery;
                svgEditor = this;

                updateButton = function updateButton(path) {
                  var seglist = path.pathSegList,
                      closed = seglist.getItem(seglist.numberOfItems - 1).pathSegType === 1,
                      showbutton = closed ? '#tool_openpath' : '#tool_closepath',
                      hidebutton = closed ? '#tool_closepath' : '#tool_openpath';
                  $(hidebutton).hide();
                  $(showbutton).show();
                };

                showPanel = function showPanel(on) {
                  $('#closepath_panel').toggle(on);

                  if (on) {
                    var path = selElems[0];

                    if (path) {
                      updateButton(path);
                    }
                  }
                };

                toggleClosed = function toggleClosed() {
                  var path = selElems[0];

                  if (path) {
                    var seglist = path.pathSegList,
                        last = seglist.numberOfItems - 1; // is closed

                    if (seglist.getItem(last).pathSegType === 1) {
                      seglist.removeItem(last);
                    } else {
                      seglist.appendItem(path.createSVGPathSegClosePath());
                    }

                    updateButton(path);
                  }
                };

                buttons = [{
                  id: 'tool_openpath',
                  icon: svgEditor.curConfig.extIconsPath + 'openpath.png',
                  type: 'context',
                  panel: 'closepath_panel',
                  events: {
                    click: function click() {
                      toggleClosed();
                    }
                  }
                }, {
                  id: 'tool_closepath',
                  icon: svgEditor.curConfig.extIconsPath + 'closepath.png',
                  type: 'context',
                  panel: 'closepath_panel',
                  events: {
                    click: function click() {
                      toggleClosed();
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'closepath_icons.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  callback: function callback() {
                    $('#closepath_panel').hide();
                  },
                  selectedChanged: function selectedChanged(opts) {
                    selElems = opts.elems;
                    var i = selElems.length;

                    while (i--) {
                      var elem = selElems[i];

                      if (elem && elem.tagName === 'path') {
                        if (opts.selectedElement && !opts.multiselected) {
                          showPanel(true);
                        } else {
                          showPanel(false);
                        }
                      } else {
                        showPanel(false);
                      }
                    }
                  }
                });

              case 11:
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

  return extClosepath;

}());
