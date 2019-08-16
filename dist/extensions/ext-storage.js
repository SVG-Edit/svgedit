var svgEditorExtension_storage = (function () {
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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
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
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function _wrapRegExp(re, groups) {
    _wrapRegExp = function (re, groups) {
      return new BabelRegExp(re, groups);
    };

    var _RegExp = _wrapNativeSuper(RegExp);

    var _super = RegExp.prototype;

    var _groups = new WeakMap();

    function BabelRegExp(re, groups) {
      var _this = _RegExp.call(this, re);

      _groups.set(_this, groups);

      return _this;
    }

    _inherits(BabelRegExp, _RegExp);

    BabelRegExp.prototype.exec = function (str) {
      var result = _super.exec.call(this, str);

      if (result) result.groups = buildGroups(result, this);
      return result;
    };

    BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
      if (typeof substitution === "string") {
        var groups = _groups.get(this);

        return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
          return "$" + groups[name];
        }));
      } else if (typeof substitution === "function") {
        var _this = this;

        return _super[Symbol.replace].call(this, str, function () {
          var args = [];
          args.push.apply(args, arguments);

          if (typeof args[args.length - 1] !== "object") {
            args.push(buildGroups(args, _this));
          }

          return substitution.apply(this, args);
        });
      } else {
        return _super[Symbol.replace].call(this, str, substitution);
      }
    };

    function buildGroups(result, re) {
      var g = _groups.get(re);

      return Object.keys(g).reduce(function (groups, name) {
        groups[name] = result[g[name]];
        return groups;
      }, Object.create(null));
    }

    return _wrapRegExp.apply(this, arguments);
  }

  /**
   * ext-storage.js
   *
   * This extension allows automatic saving of the SVG canvas contents upon
   *  page unload (which can later be automatically retrieved upon future
   *  editor loads).
   *
   *  The functionality was originally part of the SVG Editor, but moved to a
   *  separate extension to make the setting behavior optional, and adapted
   *  to inform the user of its setting of local data.
   * Dependencies:
   *
   * 1. jQuery BBQ (for deparam)
   * @license MIT
   *
   * @copyright 2010 Brett Zamir
   * @todo Revisit on whether to use $.pref over directly setting curConfig in all
   *   extensions for a more public API (not only for extPath and imagePath,
   *   but other currently used config in the extensions)
   * @todo We might provide control of storage settings through the UI besides the
   *   initial (or URL-forced) dialog. *
  */
  var extStorage = {
    name: 'storage',
    init: function init(_ref) {
      var $ = _ref.$;
      var svgEditor = this;
      var svgCanvas = svgEditor.canvas; // We could empty any already-set data for users when they decline storage,
      //  but it would be a risk for users who wanted to store but accidentally
      // said "no"; instead, we'll let those who already set it, delete it themselves;
      // to change, set the "emptyStorageOnDecline" config setting to true
      // in svgedit-config-iife.js/svgedit-config-es.js.

      var _svgEditor$curConfig = svgEditor.curConfig,
          emptyStorageOnDecline = _svgEditor$curConfig.emptyStorageOnDecline,
          noStorageOnLoad = _svgEditor$curConfig.noStorageOnLoad,
          forceStorage = _svgEditor$curConfig.forceStorage;
      var storage = svgEditor.storage,
          updateCanvas = svgEditor.updateCanvas;
      /**
       * Replace `storagePrompt` parameter within URL.
       * @param {string} val
       * @returns {void}
       */

      function replaceStoragePrompt(val) {
        val = val ? 'storagePrompt=' + val : '';
        var loc = top.location; // Allow this to work with the embedded editor as well

        if (loc.href.includes('storagePrompt=')) {
          loc.href = loc.href.replace(_wrapRegExp(/([&?])storagePrompt=[^&]*(&?)/, {
            sep: 1,
            amp: 2
          }), function (n0, sep, amp) {
            return (val ? sep : '') + val + (!val && amp ? sep : amp || '');
          });
        } else {
          loc.href += (loc.href.includes('?') ? '&' : '?') + val;
        }
      }
      /**
       * Sets SVG content as a string with "svgedit-" and the current
       *   canvas name as namespace.
       * @param {string} val
       * @returns {void}
       */


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
      /**
       * Set the cookie to expire.
       * @param {string} cookie
       * @returns {void}
       */


      function expireCookie(cookie) {
        document.cookie = encodeURIComponent(cookie) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      /**
       * Expire the storage cookie.
       * @returns {void}
       */


      function removeStoragePrefCookie() {
        expireCookie('svgeditstore');
      }
      /**
       * Empties storage for each of the current preferences.
       * @returns {void}
       */


      function emptyStorage() {
        setSVGContentStorage('');
        Object.keys(svgEditor.curPrefs).forEach(function (name) {
          name = 'svg-edit-' + name;

          if (storage) {
            storage.removeItem(name);
          }

          expireCookie(name);
        });
      } // emptyStorage();

      /**
      * Listen for unloading: If and only if opted in by the user, set the content
      *   document and preferences into storage:
      * 1. Prevent save warnings (since we're automatically saving unsaved
      *       content into storage)
      * 2. Use localStorage to set SVG contents (potentially too large to allow in cookies)
      * 3. Use localStorage (where available) or cookies to set preferences.
      * @returns {void}
      */


      function setupBeforeUnloadListener() {
        window.addEventListener('beforeunload', function (e) {
          // Don't save anything unless the user opted in to storage
          if (!document.cookie.match(/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/)) {
            return;
          }

          if (document.cookie.match(/(?:^|;\s*)svgeditstore=prefsAndContent/)) {
            setSVGContentStorage(svgCanvas.getSvgString());
          }

          svgEditor.setConfig({
            no_save_warning: true
          }); // No need for explicit saving at all once storage is on
          // svgEditor.showSaveWarning = false;

          var curPrefs = svgEditor.curPrefs;
          Object.entries(curPrefs).forEach(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                key = _ref3[0],
                val = _ref3[1];

            var store = val !== undefined;
            key = 'svg-edit-' + key;

            if (!store) {
              return;
            }

            if (storage) {
              storage.setItem(key, val);
            } else if (window.widget) {
              window.widget.setPreferenceForKey(val, key);
            } else {
              val = encodeURIComponent(val);
              document.cookie = encodeURIComponent(key) + '=' + val + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
            }
          });
        });
      }

      var loaded = false;
      return {
        name: 'storage',
        langReady: function () {
          var _langReady = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(_ref4) {
            var importLocale, _$$deparam$querystrin, storagePrompt, confirmSetStorage, message, storagePrefsAndContent, storagePrefsOnly, storagePrefs, storageNoPrefsOrContent, storageNoPrefs, rememberLabel, rememberTooltip, options, oldContainerWidth, oldContainerMarginLeft, oldContentHeight, oldContainerHeight, _ref5, pref, checked;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    importLocale = _ref4.importLocale;
                    _$$deparam$querystrin = $.deparam.querystring(true), storagePrompt = _$$deparam$querystrin.storagePrompt;
                    _context.next = 4;
                    return importLocale();

                  case 4:
                    confirmSetStorage = _context.sent;
                    message = confirmSetStorage.message, storagePrefsAndContent = confirmSetStorage.storagePrefsAndContent, storagePrefsOnly = confirmSetStorage.storagePrefsOnly, storagePrefs = confirmSetStorage.storagePrefs, storageNoPrefsOrContent = confirmSetStorage.storageNoPrefsOrContent, storageNoPrefs = confirmSetStorage.storageNoPrefs, rememberLabel = confirmSetStorage.rememberLabel, rememberTooltip = confirmSetStorage.rememberTooltip; // No need to run this one-time dialog again just because the user
                    //   changes the language

                    if (!loaded) {
                      _context.next = 8;
                      break;
                    }

                    return _context.abrupt("return");

                  case 8:
                    loaded = true; // Note that the following can load even if "noStorageOnLoad" is
                    //   set to false; to avoid any chance of storage, avoid this
                    //   extension! (and to avoid using any prior storage, set the
                    //   config option "noStorageOnLoad" to true).

                    if (!(!forceStorage && ( // If the URL has been explicitly set to always prompt the
                    //  user (e.g., so one can be pointed to a URL where one
                    // can alter one's settings, say to prevent future storage)...
                    storagePrompt === true || // ...or...if the URL at least doesn't explicitly prevent a
                    //  storage prompt (as we use for users who
                    // don't want to set cookies at all but who don't want
                    // continual prompts about it)...
                    storagePrompt !== false && // ...and this user hasn't previously indicated a desire for storage
                    !document.cookie.match(/(?:^|;\s*)svgeditstore=(?:prefsAndContent|prefsOnly)/) // ...then show the storage prompt.
                    ))) {
                      _context.next = 44;
                      break;
                    }

                    options = [];

                    if (storage) {
                      options.unshift({
                        value: 'prefsAndContent',
                        text: storagePrefsAndContent
                      }, {
                        value: 'prefsOnly',
                        text: storagePrefsOnly
                      }, {
                        value: 'noPrefsOrContent',
                        text: storageNoPrefsOrContent
                      });
                    } else {
                      options.unshift({
                        value: 'prefsOnly',
                        text: storagePrefs
                      }, {
                        value: 'noPrefsOrContent',
                        text: storageNoPrefs
                      });
                    } // Hack to temporarily provide a wide and high enough dialog


                    oldContainerWidth = $('#dialog_container')[0].style.width, oldContainerMarginLeft = $('#dialog_container')[0].style.marginLeft, oldContentHeight = $('#dialog_content')[0].style.height, oldContainerHeight = $('#dialog_container')[0].style.height;
                    $('#dialog_content')[0].style.height = '120px';
                    $('#dialog_container')[0].style.height = '170px';
                    $('#dialog_container')[0].style.width = '800px';
                    $('#dialog_container')[0].style.marginLeft = '-400px'; // Open select-with-checkbox dialog
                    // From svg-editor.js

                    svgEditor.storagePromptState = 'waiting';
                    _context.next = 20;
                    return $.select(message, options, null, null, {
                      label: rememberLabel,
                      checked: true,
                      tooltip: rememberTooltip
                    });

                  case 20:
                    _ref5 = _context.sent;
                    pref = _ref5.response;
                    checked = _ref5.checked;

                    if (!(pref && pref !== 'noPrefsOrContent')) {
                      _context.next = 30;
                      break;
                    }

                    // Regardless of whether the user opted
                    // to remember the choice (and move to a URL which won't
                    // ask them again), we have to assume the user
                    // doesn't even want to remember their not wanting
                    // storage, so we don't set the cookie or continue on with
                    //  setting storage on beforeunload
                    // eslint-disable-next-line require-atomic-updates
                    document.cookie = 'svgeditstore=' + encodeURIComponent(pref) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT'; // 'prefsAndContent' | 'prefsOnly'
                    // If the URL was configured to always insist on a prompt, if
                    //    the user does indicate a wish to store their info, we
                    //    don't want ask them again upon page refresh so move
                    //    them instead to a URL which does not always prompt

                    if (!(storagePrompt === true && checked)) {
                      _context.next = 28;
                      break;
                    }

                    replaceStoragePrompt();
                    return _context.abrupt("return");

                  case 28:
                    _context.next = 35;
                    break;

                  case 30:
                    // The user does not wish storage (or cancelled, which we treat equivalently)
                    removeStoragePrefCookie();

                    if (pref && // If the user explicitly expresses wish for no storage
                    emptyStorageOnDecline) {
                      emptyStorage();
                    }

                    if (!(pref && checked)) {
                      _context.next = 35;
                      break;
                    }

                    // Open a URL which won't set storage and won't prompt user about storage
                    replaceStoragePrompt('false');
                    return _context.abrupt("return");

                  case 35:
                    // Reset width/height of dialog (e.g., for use by Export)
                    $('#dialog_container')[0].style.width = oldContainerWidth;
                    $('#dialog_container')[0].style.marginLeft = oldContainerMarginLeft;
                    $('#dialog_content')[0].style.height = oldContentHeight;
                    $('#dialog_container')[0].style.height = oldContainerHeight; // It should be enough to (conditionally) add to storage on
                    //   beforeunload, but if we wished to update immediately,
                    //   we might wish to try setting:
                    //       svgEditor.setConfig({noStorageOnLoad: true});
                    //   and then call:
                    //       svgEditor.loadContentAndPrefs();
                    // We don't check for noStorageOnLoad here because
                    //   the prompt gives the user the option to store data

                    setupBeforeUnloadListener();
                    svgEditor.storagePromptState = 'closed';
                    updateCanvas(true);
                    _context.next = 45;
                    break;

                  case 44:
                    if (!noStorageOnLoad || forceStorage) {
                      setupBeforeUnloadListener();
                    }

                  case 45:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function langReady(_x) {
            return _langReady.apply(this, arguments);
          }

          return langReady;
        }()
      };
    }
  };

  return extStorage;

}());
