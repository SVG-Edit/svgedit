var svgEditorExtension_webappfind = (function () {
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
  * Depends on Firefox add-on and executables from {@link https://github.com/brettz9/webappfind}
  * @author Brett Zamir
  * @license MIT
  * @todo See WebAppFind Readme for SVG-related todos
  */
  var extWebappfind = {
    name: 'webappfind',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref) {
        var importLocale, strings, svgEditor, saveMessage, readMessage, excludedMessages, pathID, buttons;
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
                saveMessage = 'save', readMessage = 'read', excludedMessages = [readMessage, saveMessage];
                this.canvas.bind('message',
                /**
                * @param {external:Window} win
                * @param {module:svgcanvas.SvgCanvas#event:message} data
                * @listens module:svgcanvas.SvgCanvas#event:message
                * @throws {Error} Unexpected event type
                * @returns {undefined}
                */
                function (win, _ref2) {
                  var data = _ref2.data,
                      origin = _ref2.origin;
                  // console.log('data, origin', data, origin);
                  var type, content;

                  try {
                    var _data$webappfind = data.webappfind;
                    type = _data$webappfind.type;
                    pathID = _data$webappfind.pathID;
                    content = _data$webappfind.content;

                    // May throw if data is not an object
                    if (origin !== location.origin || // We are only interested in a message sent as though within this URL by our browser add-on
                    excludedMessages.includes(type) // Avoid our post below (other messages might be possible in the future which may also need to be excluded if your subsequent code makes assumptions on the type of message this is)
                    ) {
                        return;
                      }
                  } catch (err) {
                    return;
                  }

                  switch (type) {
                    case 'view':
                      // Populate the contents
                      svgEditor.loadFromString(content);
                      /* if ($('#tool_save_file')) {
                        $('#tool_save_file').disabled = false;
                      } */

                      break;

                    case 'save-end':
                      alert("save complete for pathID ".concat(pathID, "!"));
                      break;

                    default:
                      throw new Error('Unexpected WebAppFind event type');
                  }
                });
                /*
                window.postMessage({
                  webappfind: {
                    type: readMessage
                  }
                }, window.location.origin === 'null'
                  // Avoid "null" string error for `file:` protocol (even though
                  //  file protocol not currently supported by Firefox)
                  ? '*'
                  : window.location.origin
                );
                */

                buttons = [{
                  id: 'webappfind_save',
                  //
                  icon: svgEditor.curConfig.extIconsPath + 'webappfind.png',
                  type: 'app_menu',
                  position: 4,
                  // Before 0-based index position 4 (after the regular "Save Image (S)")
                  events: {
                    click: function click() {
                      if (!pathID) {
                        // Not ready yet as haven't received first payload
                        return;
                      }

                      window.postMessage({
                        webappfind: {
                          type: saveMessage,
                          pathID: pathID,
                          content: svgEditor.canvas.getSvgString()
                        }
                      }, window.location.origin === 'null' // Avoid "null" string error for `file:` protocol (even
                      //  though file protocol not currently supported by add-on)
                      ? '*' : window.location.origin);
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'webappfind-icon.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  })
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

  return extWebappfind;

}());
