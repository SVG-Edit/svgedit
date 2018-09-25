var svgEditorExtension_imagelib = (function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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

  /* globals jQuery */
  /**
   * ext-imagelib.js
   *
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria
   *
   */
  var extImagelib = {
    name: 'imagelib',
    init: function () {
      var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
        var decode64 = _ref.decode64,
            importLocale = _ref.importLocale,
            dropXMLInternalSubset = _ref.dropXMLInternalSubset;
        var imagelibStrings, modularVersion, svgEditor, $, uiStrings, svgCanvas, extIconsPath, allowedImageLibOrigins, closeBrowser, importImage, pending, mode, multiArr, transferStopped, preview, submit, toggleMulti, showBrowser, buttons;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                showBrowser = function showBrowser() {
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

                    imagelibStrings.imgLibs.forEach(function (_ref6) {
                      var name = _ref6.name,
                          url = _ref6.url,
                          description = _ref6.description;

                      $('<li>').appendTo(libOpts).text(name).on('click touchend', function () {
                        frame.attr('src', url).show();
                        header.text(name);
                        libOpts.hide();
                        back.show();
                      }).append('<span>' + description + '</span>');
                    });
                  } else {
                    $('#imgbrowse_holder').show();
                  }
                };

                toggleMulti = function toggleMulti(show) {
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
                };

                importImage = function importImage(url) {
                  var newImage = svgCanvas.addSVGElementFromJson({
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
                };

                closeBrowser = function closeBrowser() {
                  $('#imgbrowse_holder').hide();
                };

                _context.next = 6;
                return importLocale();

              case 6:
                imagelibStrings = _context.sent;
                modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;
                svgEditor = this;
                $ = jQuery;
                uiStrings = svgEditor.uiStrings, svgCanvas = svgEditor.canvas, extIconsPath = svgEditor.curConfig.extIconsPath;


                imagelibStrings.imgLibs = imagelibStrings.imgLibs.map(function (_ref3) {
                  var name = _ref3.name,
                      url = _ref3.url,
                      description = _ref3.description;

                  // Todo: Adopt some standard formatting library like `fluent.js` instead
                  url = url.replace(/\{path\}/g, extIconsPath).replace(/\{modularVersion\}/g, modularVersion ? imagelibStrings.moduleEnding || '-es' : '');
                  return { name: name, url: url, description: description };
                });
                allowedImageLibOrigins = imagelibStrings.imgLibs.map(function (_ref4) {
                  var url = _ref4.url;

                  try {
                    return new URL(url).origin;
                  } catch (err) {
                    return location.origin;
                  }
                });
                pending = {};
                mode = 's';
                multiArr = [];
                transferStopped = false;
                preview = void 0, submit = void 0;

                // Receive `postMessage` data

                window.addEventListener('message', function (_ref5) {
                  var origin = _ref5.origin,
                      response = _ref5.data;

                  if (!response || !['string', 'object'].includes(typeof response === 'undefined' ? 'undefined' : _typeof(response))) {
                    // Do nothing
                    return;
                  }
                  var id = void 0;
                  var type = void 0;
                  try {
                    // Todo: This block can be removed (and the above check changed to
                    //   insist on an object) if embedAPI moves away from a string to
                    //   an object (if IE9 support not needed)
                    response = (typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' ? response : JSON.parse(response);
                    if (response.namespace !== 'imagelib') {
                      return;
                    }
                    if (!allowedImageLibOrigins.includes('*') && !allowedImageLibOrigins.includes(origin)) {
                      console.log('Origin ' + origin + ' not whitelisted for posting to ' + window.origin);
                      return;
                    }
                    var hasName = 'name' in response;
                    var hasHref = 'href' in response;

                    if (!hasName && transferStopped) {
                      transferStopped = false;
                      return;
                    }

                    if (hasHref) {
                      id = response.href;
                      response = response.data;
                    }

                    // Hide possible transfer dialog box
                    $('#dialog_box').hide();
                    type = hasName ? 'meta' : response.charAt(0);
                  } catch (e) {
                    // This block is for backward compatibility (for IAN and Openclipart)
                    if (typeof response === 'string') {
                      var char1 = response.charAt(0);

                      if (char1 !== '{' && transferStopped) {
                        transferStopped = false;
                        return;
                      }

                      if (char1 === '|') {
                        var secondpos = response.indexOf('|', 1);
                        id = response.substr(1, secondpos - 1);
                        response = response.substr(secondpos + 1);
                        type = response.charAt(0);
                      }
                    }
                    return;
                  }

                  var entry = void 0,
                      curMeta = void 0,
                      svgStr = void 0,
                      imgStr = void 0;
                  switch (type) {
                    case 'meta':
                      {
                        // Metadata
                        transferStopped = false;
                        curMeta = response;

                        // Should be safe to add dynamic property as passed metadata
                        pending[curMeta.id] = curMeta; // lgtm [js/remote-property-injection]

                        var name = curMeta.name || 'file';

                        var message = uiStrings.notification.retrieving.replace('%s', name);

                        if (mode !== 'm') {
                          $.process_cancel(message, function () {
                            transferStopped = true;
                            // Should a message be sent back to the frame?

                            $('#dialog_box').hide();
                          });
                        } else {
                          entry = $('<div>').text(message).data('id', curMeta.id);
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
                          // `dropXMLInternalSubset` is to help prevent the billion laughs attack
                          var xml = new DOMParser().parseFromString(dropXMLInternalSubset(response), 'text/xml').documentElement; // lgtm [js/xml-bomb]
                          title = $(xml).children('title').first().text() || '(SVG #' + response.length + ')';
                        }
                        if (curMeta) {
                          preview.children().each(function () {
                            if ($(this).data('id') === id) {
                              if (curMeta.preview_url) {
                                $(this).html($('<span>').append($('<img>').attr('src', curMeta.preview_url), document.createTextNode(title)));
                              } else {
                                $(this).text(title);
                              }
                              submit.removeAttr('disabled');
                            }
                          });
                        } else {
                          preview.append($('<div>').text(title));
                          submit.removeAttr('disabled');
                        }
                      } else {
                        if (curMeta && curMeta.preview_url) {
                          title = curMeta.name || '';
                        }
                        if (curMeta && curMeta.preview_url) {
                          entry = $('<span>').append($('<img>').attr('src', curMeta.preview_url), document.createTextNode(title));
                        } else {
                          entry = $('<img>').attr('src', response);
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

                buttons = [{
                  id: 'tool_imagelib',
                  type: 'app_menu', // _flyout
                  icon: extIconsPath + 'imagelib.png',
                  position: 4,
                  events: {
                    mouseup: showBrowser
                  }
                }];
                return _context.abrupt('return', {
                  svgicons: extIconsPath + 'ext-imagelib.xml',
                  buttons: imagelibStrings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  callback: function callback() {
                    $('<style>').text('#imgbrowse_holder {' + 'position: absolute;' + 'top: 0;' + 'left: 0;' + 'width: 100%;' + 'height: 100%;' + 'background-color: rgba(0, 0, 0, .5);' + 'z-index: 5;' + '}' + '#imgbrowse {' + 'position: absolute;' + 'top: 25px;' + 'left: 25px;' + 'right: 25px;' + 'bottom: 25px;' + 'min-width: 300px;' + 'min-height: 200px;' + 'background: #B0B0B0;' + 'border: 1px outset #777;' + '}' + '#imgbrowse h1 {' + 'font-size: 20px;' + 'margin: .4em;' + 'text-align: center;' + '}' + '#lib_framewrap,' + '#imgbrowse > ul {' + 'position: absolute;' + 'top: 45px;' + 'left: 10px;' + 'right: 10px;' + 'bottom: 10px;' + 'background: white;' + 'margin: 0;' + 'padding: 0;' + '}' + '#imgbrowse > ul {' + 'overflow: auto;' + '}' + '#imgbrowse > div {' + 'border: 1px solid #666;' + '}' + '#imglib_preview > div {' + 'padding: 5px;' + 'font-size: 12px;' + '}' + '#imglib_preview img {' + 'display: block;' + 'margin: 0 auto;' + 'max-height: 100px;' + '}' + '#imgbrowse li {' + 'list-style: none;' + 'padding: .5em;' + 'background: #E8E8E8;' + 'border-bottom: 1px solid #B0B0B0;' + 'line-height: 1.2em;' + 'font-style: sans-serif;' + '}' + '#imgbrowse li > span {' + 'color: #666;' + 'font-size: 15px;' + 'display: block;' + '}' + '#imgbrowse li:hover {' + 'background: #FFC;' + 'cursor: pointer;' + '}' + '#imgbrowse iframe {' + 'width: 100%;' + 'height: 100%;' + 'border: 0;' + '}').appendTo('head');
                  }
                });

              case 21:
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

  return extImagelib;

}());
