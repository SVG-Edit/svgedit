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

  /* globals jQuery */

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
    init: function init() {
      var svgEditor = this;
      var $ = jQuery;
      var svgCanvas = svgEditor.canvas; // We could empty any already-set data for users when they decline storage,
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
      } // emptyStorage();

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

          svgEditor.setConfig({
            no_save_warning: true
          }); // No need for explicit saving at all once storage is on
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
          var _langReady = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(_ref) {
            var importLocale, _$$deparam$querystrin, storagePrompt, confirmSetStorage, message, storagePrefsAndContent, storagePrefsOnly, storagePrefs, storageNoPrefsOrContent, storageNoPrefs, rememberLabel, rememberTooltip, options, oldContainerWidth, oldContainerMarginLeft, oldContentHeight, oldContainerHeight;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    importLocale = _ref.importLocale;
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

                    if (!forceStorage && ( // If the URL has been explicitly set to always prompt the
                    //  user (e.g., so one can be pointed to a URL where one
                    // can alter one's settings, say to prevent future storage)...
                    storagePrompt === true || // ...or...if the URL at least doesn't explicitly prevent a
                    //  storage prompt (as we use for users who
                    // don't want to set cookies at all but who don't want
                    // continual prompts about it)...
                    storagePrompt !== false && // ...and this user hasn't previously indicated a desire for storage
                    !document.cookie.match(/(?:^|;\s*)store=(?:prefsAndContent|prefsOnly)/) // ...then show the storage prompt.
                    )) {
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
                        } // Reset width/height of dialog (e.g., for use by Export)


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
                        svgEditor.storagePromptClosed = true;
                      }, null, null, {
                        label: rememberLabel,
                        checked: false,
                        tooltip: rememberTooltip
                      });
                    } else if (!noStorageOnLoad || forceStorage) {
                      setupBeforeUnloadListener();
                    }

                  case 10:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function langReady(_x) {
            return _langReady.apply(this, arguments);
          };
        }()
      };
    }
  };

  return extStorage;

}());
