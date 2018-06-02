var svgEditorExtension_storage = (function () {
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

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  // MIT License
  // From: https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js

  function toAbsoluteURL(url) {
    var a = document.createElement('a');
    a.setAttribute('href', url); // <a href="hoge.html">
    return a.cloneNode(false).href; // -> "http://example.com/hoge.html"
  }

  function addScriptAtts(script, atts) {
    ['id', 'class', 'type'].forEach(function (prop) {
      if (prop in atts) {
        script[prop] = atts[prop];
      }
    });
  }

  // Additions by Brett
  var importSetGlobalDefault = function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, config) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', importSetGlobal(url, _extends({}, config, { returnDefault: true })));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function importSetGlobalDefault(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var importSetGlobal = function () {
    var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, _ref2) {
      var global = _ref2.global,
          returnDefault = _ref2.returnDefault;
      var modularVersion;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Todo: Replace calls to this function with `import()` when supported
              modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;

              if (!modularVersion) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt('return', importModule(url, undefined, { returnDefault: returnDefault }));

            case 3:
              _context2.next = 5;
              return importScript(url);

            case 5:
              return _context2.abrupt('return', window[global]);

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function importSetGlobal(_x3, _x4) {
      return _ref3.apply(this, arguments);
    };
  }();
  // Addition by Brett
  function importScript(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importScript(u, atts);
      }));
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var destructor = function destructor() {
        script.onerror = null;
        script.onload = null;
        script.remove();
        script.src = '';
      };
      script.defer = 'defer';
      addScriptAtts(script, atts);
      script.onerror = function () {
        reject(new Error('Failed to import: ' + url));
        destructor();
      };
      script.onload = function () {
        resolve();
        destructor();
      };
      script.src = url;

      document.head.append(script);
    });
  }

  function importModule(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref4$returnDefault = _ref4.returnDefault,
        returnDefault = _ref4$returnDefault === undefined ? false : _ref4$returnDefault;

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importModule(u, atts);
      }));
    }
    return new Promise(function (resolve, reject) {
      var vector = '$importModule$' + Math.random().toString(32).slice(2);
      var script = document.createElement('script');
      var destructor = function destructor() {
        delete window[vector];
        script.onerror = null;
        script.onload = null;
        script.remove();
        URL.revokeObjectURL(script.src);
        script.src = '';
      };
      addScriptAtts(script, atts);
      script.defer = 'defer';
      script.type = 'module';
      script.onerror = function () {
        reject(new Error('Failed to import: ' + url));
        destructor();
      };
      script.onload = function () {
        resolve(window[vector]);
        destructor();
      };
      var absURL = toAbsoluteURL(url);
      var loader = 'import * as m from \'' + absURL.replace(/'/g, "\\'") + '\'; window.' + vector + ' = ' + (returnDefault ? 'm.default || ' : '') + 'm;'; // export Module
      var blob = new Blob([loader], { type: 'text/javascript' });
      script.src = URL.createObjectURL(blob);

      document.head.append(script);
    });
  }

  /* globals jQuery */

  var extStorage = {
    name: 'storage',
    init: function init() {
      var svgEditor = this;
      var $ = jQuery;
      var svgCanvas = svgEditor.canvas;

      // We could empty any already-set data for users when they decline storage,
      //  but it would be a risk for users who wanted to store but accidentally
      // said "no"; instead, we'll let those who already set it, delete it themselves;
      // to change, set the "emptyStorageOnDecline" config setting to true
      // in svgedit-config-iife.js/svgedit-config-es.js.
      var _svgEditor$curConfig = svgEditor.curConfig,
          emptyStorageOnDecline = _svgEditor$curConfig.emptyStorageOnDecline,
          noStorageOnLoad = _svgEditor$curConfig.noStorageOnLoad,
          forceStorage = _svgEditor$curConfig.forceStorage;
      var storage = svgEditor.storage;


      function replaceStoragePrompt(val) {
        val = val ? 'storagePrompt=' + val : '';
        var loc = top.location; // Allow this to work with the embedded editor as well
        if (loc.href.includes('storagePrompt=')) {
          loc.href = loc.href.replace(/([&?])storagePrompt=[^&]*(&?)/, function (n0, n1, amp) {
            return (val ? n1 : '') + val + (!val && amp ? n1 : amp || '');
          });
        } else {
          loc.href += (loc.href.includes('?') ? '&' : '?') + val;
        }
      }
      function setSVGContentStorage(val) {
        if (storage) {
          var name = 'svgedit-' + svgEditor.curConfig.canvasName;
          if (!val) {
            storage.removeItem(name);
          } else {
            storage.setItem(name, val);
          }
        }
      }

      function expireCookie(cookie) {
        document.cookie = encodeURIComponent(cookie) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      function removeStoragePrefCookie() {
        expireCookie('store');
      }

      function emptyStorage() {
        setSVGContentStorage('');
        for (var name in svgEditor.curPrefs) {
          if (svgEditor.curPrefs.hasOwnProperty(name)) {
            name = 'svg-edit-' + name;
            if (storage) {
              storage.removeItem(name);
            }
            expireCookie(name);
          }
        }
      }

      // emptyStorage();

      /**
      * Listen for unloading: If and only if opted in by the user, set the content
      *   document and preferences into storage:
      * 1. Prevent save warnings (since we're automatically saving unsaved
      *       content into storage)
      * 2. Use localStorage to set SVG contents (potentially too large to allow in cookies)
      * 3. Use localStorage (where available) or cookies to set preferences.
      */
      function setupBeforeUnloadListener() {
        window.addEventListener('beforeunload', function (e) {
          // Don't save anything unless the user opted in to storage
          if (!document.cookie.match(/(?:^|;\s*)store=(?:prefsAndContent|prefsOnly)/)) {
            return;
          }
          if (document.cookie.match(/(?:^|;\s*)store=prefsAndContent/)) {
            setSVGContentStorage(svgCanvas.getSvgString());
          }

          svgEditor.setConfig({ no_save_warning: true }); // No need for explicit saving at all once storage is on
          // svgEditor.showSaveWarning = false;

          var curPrefs = svgEditor.curPrefs;


          for (var key in curPrefs) {
            if (curPrefs.hasOwnProperty(key)) {
              // It's our own config, so we don't need to iterate up the prototype chain
              var val = curPrefs[key];
              var store = val !== undefined;
              key = 'svg-edit-' + key;
              if (!store) {
                continue;
              }
              if (storage) {
                storage.setItem(key, val);
              } else if (window.widget) {
                window.widget.setPreferenceForKey(val, key);
              } else {
                val = encodeURIComponent(val);
                document.cookie = encodeURIComponent(key) + '=' + val + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
              }
            }
          }
        }, false);
      }

      var loaded = false;
      return {
        name: 'storage',
        langReady: function () {
          var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref) {
            var tryImport = function () {
              var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(lang) {
                var url;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        url = svgEditor.curConfig.extPath + 'ext-locale/storage/' + lang + '.js';
                        _context.next = 3;
                        return importSetGlobalDefault(url, {
                          global: 'svgEditorExtensionLocale_storage_' + lang
                        });

                      case 3:
                        confirmSetStorage = _context.sent;

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, this);
              }));

              return function tryImport(_x2) {
                return _ref3.apply(this, arguments);
              };
            }();

            var lang = _ref.lang;

            var _$$deparam$querystrin, storagePrompt, confirmSetStorage, _confirmSetStorage, message, storagePrefsAndContent, storagePrefsOnly, storagePrefs, storageNoPrefsOrContent, storageNoPrefs, rememberLabel, rememberTooltip, options, oldContainerWidth, oldContainerMarginLeft, oldContentHeight, oldContainerHeight;

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _$$deparam$querystrin = $.deparam.querystring(true), storagePrompt = _$$deparam$querystrin.storagePrompt;
                    confirmSetStorage = void 0;
                    _context2.prev = 2;
                    _context2.next = 5;
                    return tryImport(lang);

                  case 5:
                    _context2.next = 11;
                    break;

                  case 7:
                    _context2.prev = 7;
                    _context2.t0 = _context2['catch'](2);
                    _context2.next = 11;
                    return tryImport('en');

                  case 11:
                    _confirmSetStorage = confirmSetStorage, message = _confirmSetStorage.message, storagePrefsAndContent = _confirmSetStorage.storagePrefsAndContent, storagePrefsOnly = _confirmSetStorage.storagePrefsOnly, storagePrefs = _confirmSetStorage.storagePrefs, storageNoPrefsOrContent = _confirmSetStorage.storageNoPrefsOrContent, storageNoPrefs = _confirmSetStorage.storageNoPrefs, rememberLabel = _confirmSetStorage.rememberLabel, rememberTooltip = _confirmSetStorage.rememberTooltip;

                    // No need to run this one-time dialog again just because the user
                    //   changes the language

                    if (!loaded) {
                      _context2.next = 14;
                      break;
                    }

                    return _context2.abrupt('return');

                  case 14:
                    loaded = true;

                    // Note that the following can load even if "noStorageOnLoad" is
                    //   set to false; to avoid any chance of storage, avoid this
                    //   extension! (and to avoid using any prior storage, set the
                    //   config option "noStorageOnLoad" to true).
                    if (!forceStorage && (
                    // If the URL has been explicitly set to always prompt the
                    //  user (e.g., so one can be pointed to a URL where one
                    // can alter one's settings, say to prevent future storage)...
                    storagePrompt === true ||
                    // ...or...if the URL at least doesn't explicitly prevent a
                    //  storage prompt (as we use for users who
                    // don't want to set cookies at all but who don't want
                    // continual prompts about it)...
                    storagePrompt !== false &&
                    // ...and this user hasn't previously indicated a desire for storage
                    !document.cookie.match(/(?:^|;\s*)store=(?:prefsAndContent|prefsOnly)/)
                    // ...then show the storage prompt.
                    )) {
                      options = [];

                      if (storage) {
                        options.unshift({ value: 'prefsAndContent', text: storagePrefsAndContent }, { value: 'prefsOnly', text: storagePrefsOnly }, { value: 'noPrefsOrContent', text: storageNoPrefsOrContent });
                      } else {
                        options.unshift({ value: 'prefsOnly', text: storagePrefs }, { value: 'noPrefsOrContent', text: storageNoPrefs });
                      }

                      // Hack to temporarily provide a wide and high enough dialog
                      oldContainerWidth = $('#dialog_container')[0].style.width, oldContainerMarginLeft = $('#dialog_container')[0].style.marginLeft, oldContentHeight = $('#dialog_content')[0].style.height, oldContainerHeight = $('#dialog_container')[0].style.height;

                      $('#dialog_content')[0].style.height = '120px';
                      $('#dialog_container')[0].style.height = '170px';
                      $('#dialog_container')[0].style.width = '800px';
                      $('#dialog_container')[0].style.marginLeft = '-400px';

                      // Open select-with-checkbox dialog
                      // From svg-editor.js
                      $.select(message, options, function (pref, checked) {
                        if (pref && pref !== 'noPrefsOrContent') {
                          // Regardless of whether the user opted
                          // to remember the choice (and move to a URL which won't
                          // ask them again), we have to assume the user
                          // doesn't even want to remember their not wanting
                          // storage, so we don't set the cookie or continue on with
                          //  setting storage on beforeunload
                          document.cookie = 'store=' + encodeURIComponent(pref) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT'; // 'prefsAndContent' | 'prefsOnly'
                          // If the URL was configured to always insist on a prompt, if
                          //    the user does indicate a wish to store their info, we
                          //    don't want ask them again upon page refresh so move
                          //    them instead to a URL which does not always prompt
                          if (storagePrompt === true && checked) {
                            replaceStoragePrompt();
                            return;
                          }
                        } else {
                          // The user does not wish storage (or cancelled, which we treat equivalently)
                          removeStoragePrefCookie();
                          if (pref && // If the user explicitly expresses wish for no storage
                          emptyStorageOnDecline) {
                            emptyStorage();
                          }
                          if (pref && checked) {
                            // Open a URL which won't set storage and won't prompt user about storage
                            replaceStoragePrompt('false');
                            return;
                          }
                        }

                        // Reset width/height of dialog (e.g., for use by Export)
                        $('#dialog_container')[0].style.width = oldContainerWidth;
                        $('#dialog_container')[0].style.marginLeft = oldContainerMarginLeft;
                        $('#dialog_content')[0].style.height = oldContentHeight;
                        $('#dialog_container')[0].style.height = oldContainerHeight;

                        // It should be enough to (conditionally) add to storage on
                        //   beforeunload, but if we wished to update immediately,
                        //   we might wish to try setting:
                        //       svgEditor.setConfig({noStorageOnLoad: true});
                        //   and then call:
                        //       svgEditor.loadContentAndPrefs();

                        // We don't check for noStorageOnLoad here because
                        //   the prompt gives the user the option to store data
                        setupBeforeUnloadListener();

                        svgEditor.storagePromptClosed = true;
                      }, null, null, {
                        label: rememberLabel,
                        checked: false,
                        tooltip: rememberTooltip
                      });
                    } else if (!noStorageOnLoad || forceStorage) {
                      setupBeforeUnloadListener();
                    }

                  case 16:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this, [[2, 7]]);
          }));

          function langReady(_x) {
            return _ref2.apply(this, arguments);
          }

          return langReady;
        }()
      };
    }
  };

  return extStorage;

}());
