var svgEditorExtension_foreignobject = (function () {
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

  /* globals jQuery */
  /**
   * ext-foreignobject.js
   *
   * @license Apache-2.0
   *
   * @copyright 2010 Jacques Distler, 2010 Alexis Deveria
   *
   */

  var extForeignobject = {
    name: 'foreignobject',
    init: function () {
      var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(S) {
        var svgEditor, text2xml, NS, importLocale, $, svgCanvas, svgdoc, strings, properlySourceSizeTextArea, showPanel, toggleSourceButtons, selElems, started, newFO, editingforeign, setForeignString, showForeignEditor, setAttr, buttons, contextTools;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                setAttr = function setAttr(attr, val) {
                  svgCanvas.changeSelectedAttribute(attr, val);
                  S.call('changed', selElems);
                };

                showForeignEditor = function showForeignEditor() {
                  var elt = selElems[0];
                  if (!elt || editingforeign) {
                    return;
                  }
                  editingforeign = true;
                  toggleSourceButtons(true);
                  elt.removeAttribute('fill');

                  var str = S.svgToString(elt, 0);
                  $('#svg_source_textarea').val(str);
                  $('#svg_source_editor').fadeIn();
                  properlySourceSizeTextArea();
                  $('#svg_source_textarea').focus();
                };

                setForeignString = function setForeignString(xmlString) {
                  var elt = selElems[0];
                  try {
                    // convert string into XML document
                    var newDoc = text2xml('<svg xmlns="' + NS.SVG + '" xmlns:xlink="' + NS.XLINK + '">' + xmlString + '</svg>');
                    // run it through our sanitizer to remove anything we do not support
                    S.sanitizeSvg(newDoc.documentElement);
                    elt.replaceWith(svgdoc.importNode(newDoc.documentElement.firstChild, true));
                    S.call('changed', [elt]);
                    svgCanvas.clearSelection();
                  } catch (e) {
                    console.log(e);
                    return false;
                  }

                  return true;
                };

                toggleSourceButtons = function toggleSourceButtons(on) {
                  $('#tool_source_save, #tool_source_cancel').toggle(!on);
                  $('#foreign_save, #foreign_cancel').toggle(on);
                };

                showPanel = function showPanel(on) {
                  var fcRules = $('#fc_rules');
                  if (!fcRules.length) {
                    fcRules = $('<style id="fc_rules"></style>').appendTo('head');
                  }
                  fcRules.text(!on ? '' : ' #tool_topath { display: none !important; }');
                  $('#foreignObject_panel').toggle(on);
                };

                svgEditor = this;
                text2xml = S.text2xml, NS = S.NS, importLocale = S.importLocale;
                $ = jQuery;
                svgCanvas = svgEditor.canvas;
                svgdoc = S.svgroot.parentNode.ownerDocument;
                _context.next = 12;
                return importLocale();

              case 12:
                strings = _context.sent;

                properlySourceSizeTextArea = function properlySourceSizeTextArea() {
                  // TODO: remove magic numbers here and get values from CSS
                  var height = $('#svg_source_container').height() - 80;
                  $('#svg_source_textarea').css('height', height);
                };

                selElems = void 0, started = void 0, newFO = void 0, editingforeign = false;

                /**
                * This function sets the content of element elt to the input XML.
                * @param {string} xmlString - The XML text
                * @param {Element} elt - the parent element to append to
                * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
                */

                buttons = [{
                  id: 'tool_foreign',
                  type: 'mode',
                  events: {
                    click: function click() {
                      svgCanvas.setMode('foreign');
                    }
                  }
                }, {
                  id: 'edit_foreign',
                  type: 'context',
                  panel: 'foreignObject_panel',
                  events: {
                    click: function click() {
                      showForeignEditor();
                    }
                  }
                }];
                contextTools = [{
                  type: 'input',
                  panel: 'foreignObject_panel',
                  id: 'foreign_width',
                  size: 3,
                  events: {
                    change: function change() {
                      setAttr('width', this.value);
                    }
                  }
                }, {
                  type: 'input',
                  panel: 'foreignObject_panel',
                  id: 'foreign_height',
                  events: {
                    change: function change() {
                      setAttr('height', this.value);
                    }
                  }
                }, {
                  type: 'input',
                  panel: 'foreignObject_panel',
                  id: 'foreign_font_size',
                  size: 2,
                  defval: 16,
                  events: {
                    change: function change() {
                      setAttr('font-size', this.value);
                    }
                  }
                }];
                return _context.abrupt('return', {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'foreignobject-icons.xml',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  context_tools: strings.contextTools.map(function (contextTool, i) {
                    return Object.assign(contextTools[i], contextTool);
                  }),
                  callback: function callback() {
                    $('#foreignObject_panel').hide();

                    var endChanges = function endChanges() {
                      $('#svg_source_editor').hide();
                      editingforeign = false;
                      $('#svg_source_textarea').blur();
                      toggleSourceButtons(false);
                    };

                    // TODO: Needs to be done after orig icon loads
                    setTimeout(function () {
                      // Create source save/cancel buttons
                      /* const save = */$('#tool_source_save').clone().hide().attr('id', 'foreign_save').unbind().appendTo('#tool_source_back').click(function () {
                        if (!editingforeign) {
                          return;
                        }

                        if (!setForeignString($('#svg_source_textarea').val())) {
                          $.confirm('Errors found. Revert to original?', function (ok) {
                            if (!ok) {
                              return false;
                            }
                            endChanges();
                          });
                        } else {
                          endChanges();
                        }
                        // setSelectMode();
                      });

                      /* const cancel = */$('#tool_source_cancel').clone().hide().attr('id', 'foreign_cancel').unbind().appendTo('#tool_source_back').click(function () {
                        endChanges();
                      });
                    }, 3000);
                  },
                  mouseDown: function mouseDown(opts) {
                    // const e = opts.event;

                    if (svgCanvas.getMode() === 'foreign') {
                      started = true;
                      newFO = S.addSVGElementFromJson({
                        element: 'foreignObject',
                        attr: {
                          x: opts.start_x,
                          y: opts.start_y,
                          id: S.getNextId(),
                          'font-size': 16, // cur_text.font_size,
                          width: '48',
                          height: '20',
                          style: 'pointer-events:inherit'
                        }
                      });
                      var m = svgdoc.createElementNS(NS.MATH, 'math');
                      m.setAttributeNS(NS.XMLNS, 'xmlns', NS.MATH);
                      m.setAttribute('display', 'inline');
                      var mi = svgdoc.createElementNS(NS.MATH, 'mi');
                      mi.setAttribute('mathvariant', 'normal');
                      mi.textContent = '\u03A6';
                      var mo = svgdoc.createElementNS(NS.MATH, 'mo');
                      mo.textContent = '\u222A';
                      var mi2 = svgdoc.createElementNS(NS.MATH, 'mi');
                      mi2.textContent = '\u2133';
                      m.append(mi, mo, mi2);
                      newFO.append(m);
                      return {
                        started: true
                      };
                    }
                  },
                  mouseUp: function mouseUp(opts) {
                    // const e = opts.event;
                    if (svgCanvas.getMode() === 'foreign' && started) {
                      var attrs = $(newFO).attr(['width', 'height']);
                      var keep = attrs.width !== '0' || attrs.height !== '0';
                      svgCanvas.addToSelection([newFO], true);

                      return {
                        keep: keep,
                        element: newFO
                      };
                    }
                  },
                  selectedChanged: function selectedChanged(opts) {
                    // Use this to update the current selected elements
                    selElems = opts.elems;

                    var i = selElems.length;
                    while (i--) {
                      var elem = selElems[i];
                      if (elem && elem.tagName === 'foreignObject') {
                        if (opts.selectedElement && !opts.multiselected) {
                          $('#foreign_font_size').val(elem.getAttribute('font-size'));
                          $('#foreign_width').val(elem.getAttribute('width'));
                          $('#foreign_height').val(elem.getAttribute('height'));
                          showPanel(true);
                        } else {
                          showPanel(false);
                        }
                      } else {
                        showPanel(false);
                      }
                    }
                  },
                  elementChanged: function elementChanged(opts) {
                    // const elem = opts.elems[0];
                  }
                });

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  };

  return extForeignobject;

}());
