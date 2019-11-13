var svgEditorExtension_imagelib = (function () {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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
    init: function init(_ref) {
      var $, decode64, importLocale, dropXMLInternalSubset, imagelibStrings, modularVersion, svgEditor, uiStrings, svgCanvas, extIconsPath, allowedImageLibOrigins, closeBrowser, importImage, pending, mode, multiArr, transferStopped, preview, submit, toggleMulti, showBrowser, buttons;
      return regeneratorRuntime.async(function init$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              showBrowser = function _ref9() {
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
                  var leftBlock = $('<span>').css({
                    position: 'absolute',
                    top: 5,
                    left: 10
                  }).appendTo(browser);
                  var back = $('<button hidden>' + imagelibStrings.show_list + '</button>').appendTo(leftBlock).on('click touchend', function () {
                    frame.attr('src', 'about:blank').hide();
                    libOpts.show();
                    header.text(allLibs);
                    back.hide();
                  }).css({
                    'margin-right': 5
                  }).hide();
                  /* const type = */

                  $('<select><option value=s>' + imagelibStrings.import_single + '</option><option value=m>' + imagelibStrings.import_multi + '</option><option value=o>' + imagelibStrings.open + '</option></select>').appendTo(leftBlock).change(function () {
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
                  imagelibStrings.imgLibs.forEach(function (_ref5) {
                    var name = _ref5.name,
                        url = _ref5.url,
                        description = _ref5.description;
                    $('<li>').appendTo(libOpts).text(name).on('click touchend', function () {
                      frame.attr('src', url).show();
                      header.text(name);
                      libOpts.hide();
                      back.show();
                    }).append("<span>".concat(description, "</span>"));
                  });
                } else {
                  $('#imgbrowse_holder').show();
                }
              };

              toggleMulti = function _ref8(show) {
                $('#lib_framewrap, #imglib_opts').css({
                  right: show ? 200 : 10
                });

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

              importImage = function _ref7(url) {
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

              closeBrowser = function _ref6() {
                $('#imgbrowse_holder').hide();
              };

              $ = _ref.$, decode64 = _ref.decode64, importLocale = _ref.importLocale, dropXMLInternalSubset = _ref.dropXMLInternalSubset;
              _context2.next = 7;
              return regeneratorRuntime.awrap(importLocale());

            case 7:
              imagelibStrings = _context2.sent;
              modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;
              svgEditor = this;
              uiStrings = svgEditor.uiStrings, svgCanvas = svgEditor.canvas, extIconsPath = svgEditor.curConfig.extIconsPath;
              imagelibStrings.imgLibs = imagelibStrings.imgLibs.map(function (_ref2) {
                var name = _ref2.name,
                    url = _ref2.url,
                    description = _ref2.description;
                // Todo: Adopt some standard formatting library like `fluent.js` instead
                url = url.replace(/\{path\}/g, extIconsPath).replace(/\{modularVersion\}/g, modularVersion ? imagelibStrings.moduleEnding || '-es' : '');
                return {
                  name: name,
                  url: url,
                  description: description
                };
              });
              allowedImageLibOrigins = imagelibStrings.imgLibs.map(function (_ref3) {
                var url = _ref3.url;

                try {
                  return new URL(url).origin;
                } catch (err) {
                  return location.origin;
                }
              });
              /**
              *
              * @returns {void}
              */

              pending = {};
              mode = 's';
              multiArr = [];
              transferStopped = false;
              // Receive `postMessage` data
              window.addEventListener('message', function _callee(_ref4) {
                var origin, response, id, type, hasName, hasHref, char1, secondpos, entry, curMeta, svgStr, imgStr, name, message, pre, src, title, xml, ok;
                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        origin = _ref4.origin, response = _ref4.data;

                        if (!(!response || !['string', 'object'].includes(_typeof(response)))) {
                          _context.next = 3;
                          break;
                        }

                        return _context.abrupt("return");

                      case 3:
                        _context.prev = 3;
                        // Todo: This block can be removed (and the above check changed to
                        //   insist on an object) if embedAPI moves away from a string to
                        //   an object (if IE9 support not needed)
                        response = _typeof(response) === 'object' ? response : JSON.parse(response);

                        if (!(response.namespace !== 'imagelib')) {
                          _context.next = 7;
                          break;
                        }

                        return _context.abrupt("return");

                      case 7:
                        if (!(!allowedImageLibOrigins.includes('*') && !allowedImageLibOrigins.includes(origin))) {
                          _context.next = 10;
                          break;
                        }

                        // Todo: Surface this error to user?
                        console.log("Origin ".concat(origin, " not whitelisted for posting to ").concat(window.origin)); // eslint-disable-line no-console

                        return _context.abrupt("return");

                      case 10:
                        hasName = 'name' in response;
                        hasHref = 'href' in response;

                        if (!(!hasName && transferStopped)) {
                          _context.next = 15;
                          break;
                        }

                        transferStopped = false;
                        return _context.abrupt("return");

                      case 15:
                        if (hasHref) {
                          id = response.href;
                          response = response.data;
                        } // Hide possible transfer dialog box


                        $('#dialog_box').hide();
                        type = hasName ? 'meta' : response.charAt(0);
                        _context.next = 28;
                        break;

                      case 20:
                        _context.prev = 20;
                        _context.t0 = _context["catch"](3);

                        if (!(typeof response === 'string')) {
                          _context.next = 28;
                          break;
                        }

                        char1 = response.charAt(0);

                        if (!(char1 !== '{' && transferStopped)) {
                          _context.next = 27;
                          break;
                        }

                        transferStopped = false;
                        return _context.abrupt("return");

                      case 27:
                        if (char1 === '|') {
                          secondpos = response.indexOf('|', 1);
                          id = response.substr(1, secondpos - 1);
                          response = response.substr(secondpos + 1);
                          type = response.charAt(0);
                        }

                      case 28:
                        _context.t1 = type;
                        _context.next = _context.t1 === 'meta' ? 31 : _context.t1 === '<' ? 47 : _context.t1 === 'd' ? 49 : 60;
                        break;

                      case 31:
                        // Metadata
                        transferStopped = false;
                        curMeta = response; // Should be safe to add dynamic property as passed metadata

                        pending[curMeta.id] = curMeta; // lgtm [js/remote-property-injection]

                        name = curMeta.name || 'file';
                        message = uiStrings.notification.retrieving.replace('%s', name);

                        if (!(mode !== 'm')) {
                          _context.next = 43;
                          break;
                        }

                        _context.next = 39;
                        return regeneratorRuntime.awrap($.process_cancel(message));

                      case 39:
                        // eslint-disable-next-line require-atomic-updates
                        transferStopped = true; // Should a message be sent back to the frame?

                        $('#dialog_box').hide();
                        _context.next = 46;
                        break;

                      case 43:
                        entry = $('<div>').text(message).data('id', curMeta.id);
                        preview.append(entry);
                        curMeta.entry = entry;

                      case 46:
                        return _context.abrupt("return");

                      case 47:
                        svgStr = true;
                        return _context.abrupt("break", 62);

                      case 49:
                        if (!response.startsWith('data:image/svg+xml')) {
                          _context.next = 57;
                          break;
                        }

                        pre = 'data:image/svg+xml;base64,';
                        src = response.substring(pre.length);
                        response = decode64(src);
                        svgStr = true;
                        return _context.abrupt("break", 62);

                      case 57:
                        if (!response.startsWith('data:image/')) {
                          _context.next = 60;
                          break;
                        }

                        imgStr = true;
                        return _context.abrupt("break", 62);

                      case 60:
                        // TODO: See if there's a way to base64 encode the binary data stream
                        // const str = 'data:;base64,' + svgedit.utilities.encode64(response, true);
                        // Assume it's raw image data
                        // importImage(str);
                        // Don't give warning as postMessage may have been used by something else
                        if (mode !== 'm') {
                          closeBrowser();
                        } else {
                          pending[id].entry.remove();
                        } // await $.alert('Unexpected data was returned: ' + response, function() {
                        //   if (mode !== 'm') {
                        //     closeBrowser();
                        //   } else {
                        //     pending[id].entry.remove();
                        //   }
                        // });


                        return _context.abrupt("return");

                      case 62:
                        _context.t2 = mode;
                        _context.next = _context.t2 === 's' ? 65 : _context.t2 === 'm' ? 68 : _context.t2 === 'o' ? 72 : 83;
                        break;

                      case 65:
                        // Import one
                        if (svgStr) {
                          svgCanvas.importSvgString(response);
                        } else if (imgStr) {
                          importImage(response);
                        }

                        closeBrowser();
                        return _context.abrupt("break", 83);

                      case 68:
                        // Import multiple
                        multiArr.push([svgStr ? 'svg' : 'img', response]);
                        curMeta = pending[id];

                        if (svgStr) {
                          if (curMeta && curMeta.name) {
                            title = curMeta.name;
                          } else {
                            // Try to find a title
                            // `dropXMLInternalSubset` is to help prevent the billion laughs attack
                            xml = new DOMParser().parseFromString(dropXMLInternalSubset(response), 'text/xml').documentElement; // lgtm [js/xml-bomb]

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

                        return _context.abrupt("break", 83);

                      case 72:
                        if (svgStr) {
                          _context.next = 74;
                          break;
                        }

                        return _context.abrupt("break", 83);

                      case 74:
                        closeBrowser();
                        _context.next = 77;
                        return regeneratorRuntime.awrap(svgEditor.openPrep());

                      case 77:
                        ok = _context.sent;

                        if (ok) {
                          _context.next = 80;
                          break;
                        }

                        return _context.abrupt("return");

                      case 80:
                        svgCanvas.clear();
                        svgCanvas.setSvgString(response); // updateCanvas();

                        return _context.abrupt("break", 83);

                      case 83:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, null, null, [[3, 20]]);
              }, true);
              /**
              * @param {boolean} show
              * @returns {void}
              */

              buttons = [{
                id: 'tool_imagelib',
                type: 'app_menu',
                // _flyout
                icon: extIconsPath + 'imagelib.png',
                position: 4,
                events: {
                  mouseup: showBrowser
                }
              }];
              return _context2.abrupt("return", {
                svgicons: extIconsPath + 'ext-imagelib.xml',
                buttons: imagelibStrings.buttons.map(function (button, i) {
                  return Object.assign(buttons[i], button);
                }),
                callback: function callback() {
                  $('<style>').text('#imgbrowse_holder {' + 'position: absolute;' + 'top: 0;' + 'left: 0;' + 'width: 100%;' + 'height: 100%;' + 'background-color: rgba(0, 0, 0, .5);' + 'z-index: 5;' + '}' + '#imgbrowse {' + 'position: absolute;' + 'top: 25px;' + 'left: 25px;' + 'right: 25px;' + 'bottom: 25px;' + 'min-width: 300px;' + 'min-height: 200px;' + 'background: #B0B0B0;' + 'border: 1px outset #777;' + '}' + '#imgbrowse h1 {' + 'font-size: 20px;' + 'margin: .4em;' + 'text-align: center;' + '}' + '#lib_framewrap,' + '#imgbrowse > ul {' + 'position: absolute;' + 'top: 45px;' + 'left: 10px;' + 'right: 10px;' + 'bottom: 10px;' + 'background: white;' + 'margin: 0;' + 'padding: 0;' + '}' + '#imgbrowse > ul {' + 'overflow: auto;' + '}' + '#imgbrowse > div {' + 'border: 1px solid #666;' + '}' + '#imglib_preview > div {' + 'padding: 5px;' + 'font-size: 12px;' + '}' + '#imglib_preview img {' + 'display: block;' + 'margin: 0 auto;' + 'max-height: 100px;' + '}' + '#imgbrowse li {' + 'list-style: none;' + 'padding: .5em;' + 'background: #E8E8E8;' + 'border-bottom: 1px solid #B0B0B0;' + 'line-height: 1.2em;' + 'font-style: sans-serif;' + '}' + '#imgbrowse li > span {' + 'color: #666;' + 'font-size: 15px;' + 'display: block;' + '}' + '#imgbrowse li:hover {' + 'background: #FFC;' + 'cursor: pointer;' + '}' + '#imgbrowse iframe {' + 'width: 100%;' + 'height: 100%;' + 'border: 0;' + '}').appendTo('head');
                }
              });

            case 20:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  };

  return extImagelib;

}());
