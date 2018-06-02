var svgEditorExtension_imagelib = (function () {
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

  var extImagelib = {
    name: 'imagelib',
    init: function init(_ref) {
      var decode64 = _ref.decode64;

      var svgEditor = this;
      var imagelibStrings = void 0;

      var $ = jQuery;
      var uiStrings = svgEditor.uiStrings,
          svgCanvas = svgEditor.canvas;


      function closeBrowser() {
        $('#imgbrowse_holder').hide();
      }

      function importImage(url) {
        var newImage = svgCanvas.addSvgElementFromJson({
          element: 'image',
          attr: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            id: svgCanvas.getNextId(),
            style: 'pointer-events:inherit'
          }
        });
        svgCanvas.clearSelection();
        svgCanvas.addToSelection([newImage]);
        svgCanvas.setImageURL(url);
      }

      var pending = {};

      var mode = 's';
      var multiArr = [];
      var transferStopped = false;
      var preview = void 0,
          submit = void 0;

      window.addEventListener('message', function (evt) {
        // Receive `postMessage` data
        var response = evt.data;

        if (!response || typeof response !== 'string') {
          // Do nothing
          return;
        }
        try {
          // Todo: This block can be removed (and the above check changed to
          //   insist on an object) if embedAPI moves away from a string to
          //   an object (if IE9 support not needed)
          response = JSON.parse(response);
          if (response.namespace !== 'imagelib') {
            return;
          }
        } catch (e) {
          return;
        }

        var hasName = 'name' in response;
        var hasHref = 'href' in response;

        if (!hasName && transferStopped) {
          transferStopped = false;
          return;
        }

        var id = void 0;
        if (hasHref) {
          id = response.href;
          response = response.data;
        }

        // Hide possible transfer dialog box
        $('#dialog_box').hide();
        var entry = void 0,
            curMeta = void 0,
            svgStr = void 0,
            imgStr = void 0;
        var type = hasName ? 'meta' : response.charAt(0);
        switch (type) {
          case 'meta':
            {
              // Metadata
              transferStopped = false;
              curMeta = response;

              pending[curMeta.id] = curMeta;

              var name = curMeta.name || 'file';

              var message = uiStrings.notification.retrieving.replace('%s', name);

              if (mode !== 'm') {
                $.process_cancel(message, function () {
                  transferStopped = true;
                  // Should a message be sent back to the frame?

                  $('#dialog_box').hide();
                });
              } else {
                entry = $('<div>' + message + '</div>').data('id', curMeta.id);
                preview.append(entry);
                curMeta.entry = entry;
              }

              return;
            }
          case '<':
            svgStr = true;
            break;
          case 'd':
            {
              if (response.startsWith('data:image/svg+xml')) {
                var pre = 'data:image/svg+xml;base64,';
                var src = response.substring(pre.length);
                response = decode64(src);
                svgStr = true;
                break;
              } else if (response.startsWith('data:image/')) {
                imgStr = true;
                break;
              }
            }
          // Else fall through
          default:
            // TODO: See if there's a way to base64 encode the binary data stream
            // const str = 'data:;base64,' + svgedit.utilities.encode64(response, true);

            // Assume it's raw image data
            // importImage(str);

            // Don't give warning as postMessage may have been used by something else
            if (mode !== 'm') {
              closeBrowser();
            } else {
              pending[id].entry.remove();
            }
            // $.alert('Unexpected data was returned: ' + response, function() {
            //   if (mode !== 'm') {
            //     closeBrowser();
            //   } else {
            //     pending[id].entry.remove();
            //   }
            // });
            return;
        }

        switch (mode) {
          case 's':
            // Import one
            if (svgStr) {
              svgCanvas.importSvgString(response);
            } else if (imgStr) {
              importImage(response);
            }
            closeBrowser();
            break;
          case 'm':
            // Import multiple
            multiArr.push([svgStr ? 'svg' : 'img', response]);
            curMeta = pending[id];
            var title = void 0;
            if (svgStr) {
              if (curMeta && curMeta.name) {
                title = curMeta.name;
              } else {
                // Try to find a title
                var xml = new DOMParser().parseFromString(response, 'text/xml').documentElement;
                title = $(xml).children('title').first().text() || '(SVG #' + response.length + ')';
              }
              if (curMeta) {
                preview.children().each(function () {
                  if ($(this).data('id') === id) {
                    if (curMeta.preview_url) {
                      $(this).html('<img src="' + curMeta.preview_url + '">' + title);
                    } else {
                      $(this).text(title);
                    }
                    submit.removeAttr('disabled');
                  }
                });
              } else {
                preview.append('<div>' + title + '</div>');
                submit.removeAttr('disabled');
              }
            } else {
              if (curMeta && curMeta.preview_url) {
                title = curMeta.name || '';
              }
              if (curMeta && curMeta.preview_url) {
                entry = '<img src="' + curMeta.preview_url + '">' + title;
              } else {
                entry = '<img src="' + response + '">';
              }

              if (curMeta) {
                preview.children().each(function () {
                  if ($(this).data('id') === id) {
                    $(this).html(entry);
                    submit.removeAttr('disabled');
                  }
                });
              } else {
                preview.append($('<div>').append(entry));
                submit.removeAttr('disabled');
              }
            }
            break;
          case 'o':
            // Open
            if (!svgStr) {
              break;
            }
            svgEditor.openPrep(function (ok) {
              if (!ok) {
                return;
              }
              svgCanvas.clear();
              svgCanvas.setSvgString(response);
              // updateCanvas();
            });
            closeBrowser();
            break;
        }
      }, true);

      function toggleMulti(show) {
        $('#lib_framewrap, #imglib_opts').css({ right: show ? 200 : 10 });
        if (!preview) {
          preview = $('<div id=imglib_preview>').css({
            position: 'absolute',
            top: 45,
            right: 10,
            width: 180,
            bottom: 45,
            background: '#fff',
            overflow: 'auto'
          }).insertAfter('#lib_framewrap');

          submit = $('<button disabled>Import selected</button>').appendTo('#imgbrowse').on('click touchend', function () {
            $.each(multiArr, function (i) {
              var type = this[0];
              var data = this[1];
              if (type === 'svg') {
                svgCanvas.importSvgString(data);
              } else {
                importImage(data);
              }
              svgCanvas.moveSelectedElements(i * 20, i * 20, false);
            });
            preview.empty();
            multiArr = [];
            $('#imgbrowse_holder').hide();
          }).css({
            position: 'absolute',
            bottom: 10,
            right: -10
          });
        }

        preview.toggle(show);
        submit.toggle(show);
      }

      function showBrowser() {
        var browser = $('#imgbrowse');
        if (!browser.length) {
          $('<div id=imgbrowse_holder><div id=imgbrowse class=toolbar_button>' + '</div></div>').insertAfter('#svg_docprops');
          browser = $('#imgbrowse');

          var allLibs = imagelibStrings.select_lib;

          var libOpts = $('<ul id=imglib_opts>').appendTo(browser);
          var frame = $('<iframe/>').prependTo(browser).hide().wrap('<div id=lib_framewrap>');

          var header = $('<h1>').prependTo(browser).text(allLibs).css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
          });

          var cancel = $('<button>' + uiStrings.common.cancel + '</button>').appendTo(browser).on('click touchend', function () {
            $('#imgbrowse_holder').hide();
          }).css({
            position: 'absolute',
            top: 5,
            right: -10
          });

          var leftBlock = $('<span>').css({ position: 'absolute', top: 5, left: 10 }).appendTo(browser);

          var back = $('<button hidden>' + imagelibStrings.show_list + '</button>').appendTo(leftBlock).on('click touchend', function () {
            frame.attr('src', 'about:blank').hide();
            libOpts.show();
            header.text(allLibs);
            back.hide();
          }).css({
            'margin-right': 5
          }).hide();

          /* const type = */$('<select><option value=s>' + imagelibStrings.import_single + '</option><option value=m>' + imagelibStrings.import_multi + '</option><option value=o>' + imagelibStrings.open + '</option></select>').appendTo(leftBlock).change(function () {
            mode = $(this).val();
            switch (mode) {
              case 's':
              case 'o':
                toggleMulti(false);
                break;

              case 'm':
                // Import multiple
                toggleMulti(true);
                break;
            }
          }).css({
            'margin-top': 10
          });

          cancel.prepend($.getSvgIcon('cancel', true));
          back.prepend($.getSvgIcon('tool_imagelib', true));

          var modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;
          $.each(imagelibStrings.imgLibs, function (i, _ref2) {
            var name = _ref2.name,
                url = _ref2.url,
                description = _ref2.description;

            $('<li>').appendTo(libOpts).text(name).on('click touchend', function () {
              frame.attr('src', url({
                path: svgEditor.curConfig.extIconsPath,
                modularVersion: modularVersion
              })).show();
              header.text(name);
              libOpts.hide();
              back.show();
            }).append('<span>' + description + '</span>');
          });
        } else {
          $('#imgbrowse_holder').show();
        }
      }

      return {
        svgicons: svgEditor.curConfig.extIconsPath + 'ext-imagelib.xml',
        buttons: [{
          id: 'tool_imagelib',
          type: 'app_menu', // _flyout
          position: 4,
          title: 'Image library',
          events: {
            mouseup: showBrowser
          }
        }],
        langReady: function () {
          var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref3) {
            var tryImport = function () {
              var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(lang) {
                var url;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        url = svgEditor.curConfig.extPath + 'ext-locale/imagelib/' + lang + '.js';
                        _context.next = 3;
                        return importSetGlobalDefault(url, {
                          global: 'svgEditorExtensionLocale_imagelib_' + lang
                        });

                      case 3:
                        imagelibStrings = _context.sent;

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, this);
              }));

              return function tryImport(_x2) {
                return _ref5.apply(this, arguments);
              };
            }();

            var lang = _ref3.lang;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;
                    _context2.next = 3;
                    return tryImport(lang);

                  case 3:
                    _context2.next = 9;
                    break;

                  case 5:
                    _context2.prev = 5;
                    _context2.t0 = _context2['catch'](0);
                    _context2.next = 9;
                    return tryImport('en');

                  case 9:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this, [[0, 5]]);
          }));

          function langReady(_x) {
            return _ref4.apply(this, arguments);
          }

          return langReady;
        }(),
        callback: function callback() {
          $('<style>').text('#imgbrowse_holder {' + 'position: absolute;' + 'top: 0;' + 'left: 0;' + 'width: 100%;' + 'height: 100%;' + 'background-color: rgba(0, 0, 0, .5);' + 'z-index: 5;' + '}' + '#imgbrowse {' + 'position: absolute;' + 'top: 25px;' + 'left: 25px;' + 'right: 25px;' + 'bottom: 25px;' + 'min-width: 300px;' + 'min-height: 200px;' + 'background: #B0B0B0;' + 'border: 1px outset #777;' + '}' + '#imgbrowse h1 {' + 'font-size: 20px;' + 'margin: .4em;' + 'text-align: center;' + '}' + '#lib_framewrap,' + '#imgbrowse > ul {' + 'position: absolute;' + 'top: 45px;' + 'left: 10px;' + 'right: 10px;' + 'bottom: 10px;' + 'background: white;' + 'margin: 0;' + 'padding: 0;' + '}' + '#imgbrowse > ul {' + 'overflow: auto;' + '}' + '#imgbrowse > div {' + 'border: 1px solid #666;' + '}' + '#imglib_preview > div {' + 'padding: 5px;' + 'font-size: 12px;' + '}' + '#imglib_preview img {' + 'display: block;' + 'margin: 0 auto;' + 'max-height: 100px;' + '}' + '#imgbrowse li {' + 'list-style: none;' + 'padding: .5em;' + 'background: #E8E8E8;' + 'border-bottom: 1px solid #B0B0B0;' + 'line-height: 1.2em;' + 'font-style: sans-serif;' + '}' + '#imgbrowse li > span {' + 'color: #666;' + 'font-size: 15px;' + 'display: block;' + '}' + '#imgbrowse li:hover {' + 'background: #FFC;' + 'cursor: pointer;' + '}' + '#imgbrowse iframe {' + 'width: 100%;' + 'height: 100%;' + 'border: 0;' + '}').appendTo('head');
        }
      };
    }
  };

  return extImagelib;

}());
