var svgEditorExtension_webappfind = (function () {
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
  * Depends on Firefox add-on and executables from {@link https://github.com/brettz9/webappfind}
  * @author Brett Zamir
  * @license MIT
  * @todo See WebAppFind Readme for SVG-related todos
  */

  var extWebappfind = {
    name: 'webappfind',
    init: function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale = _ref.importLocale;
        var strings, svgEditor, saveMessage, readMessage, excludedMessages, pathID, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return importLocale();

              case 2:
                strings = _context.sent;
                svgEditor = this;
                // Todo: Update to new API once released

                window.addEventListener('message', function (e) {
                  if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
                  !Array.isArray(e.data) || excludedMessages.includes(e.data[0]) // Validate format and avoid our post below
                  ) {
                      return;
                    }
                  var messageType = e.data[0];
                  var svgString = void 0;
                  switch (messageType) {
                    case 'webapp-view':
                      // Populate the contents
                      pathID = e.data[1];

                      svgString = e.data[2];
                      svgEditor.loadFromString(svgString);

                      /* if ($('#tool_save_file')) {
                        $('#tool_save_file').disabled = false;
                      } */
                      break;
                    case 'webapp-save-end':
                      alert('save complete for pathID ' + e.data[1] + '!');
                      break;
                    default:
                      throw new Error('Unexpected mode');
                  }
                }, false);
                saveMessage = 'webapp-save', readMessage = 'webapp-read', excludedMessages = [readMessage, saveMessage];
                pathID = void 0;


                window.postMessage([readMessage], window.location.origin !== 'null' ? window.location.origin : '*'); // Avoid "null" string error for file: protocol (even though file protocol not currently supported by add-on)
                buttons = [{
                  id: 'webappfind_save', //
                  type: 'app_menu',
                  position: 4, // Before 0-based index position 4 (after the regular "Save Image (S)")
                  events: {
                    click: function click() {
                      if (!pathID) {
                        // Not ready yet as haven't received first payload
                        return;
                      }
                      window.postMessage([saveMessage, pathID, svgEditor.canvas.getSvgString()], window.location.origin);
                    }
                  }
                }];
                return _context.abrupt('return', {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'webappfind-icon.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  })
                });

              case 10:
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

  return extWebappfind;

}());
