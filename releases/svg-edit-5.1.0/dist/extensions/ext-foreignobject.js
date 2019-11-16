var svgEditorExtension_foreignobject = (function () {
  'use strict';

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
    init: function init(S) {
      var svgEditor, $, text2xml, NS, importLocale, svgCanvas, svgdoc, strings, properlySourceSizeTextArea, showPanel, toggleSourceButtons, selElems, started, newFO, editingforeign, setForeignString, showForeignEditor, setAttr, buttons, contextTools;
      return regeneratorRuntime.async(function init$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              setAttr = function _ref5(attr, val) {
                svgCanvas.changeSelectedAttribute(attr, val);
                svgCanvas.call('changed', selElems);
              };

              showForeignEditor = function _ref4() {
                var elt = selElems[0];

                if (!elt || editingforeign) {
                  return;
                }

                editingforeign = true;
                toggleSourceButtons(true);
                elt.removeAttribute('fill');
                var str = svgCanvas.svgToString(elt, 0);
                $('#svg_source_textarea').val(str);
                $('#svg_source_editor').fadeIn();
                properlySourceSizeTextArea();
                $('#svg_source_textarea').focus();
              };

              setForeignString = function _ref3(xmlString) {
                var elt = selElems[0]; // The parent `Element` to append to

                try {
                  // convert string into XML document
                  var newDoc = text2xml('<svg xmlns="' + NS.SVG + '" xmlns:xlink="' + NS.XLINK + '">' + xmlString + '</svg>'); // run it through our sanitizer to remove anything we do not support

                  svgCanvas.sanitizeSvg(newDoc.documentElement);
                  elt.replaceWith(svgdoc.importNode(newDoc.documentElement.firstChild, true));
                  svgCanvas.call('changed', [elt]);
                  svgCanvas.clearSelection();
                } catch (e) {
                  // Todo: Surface error to user
                  console.log(e); // eslint-disable-line no-console

                  return false;
                }

                return true;
              };

              toggleSourceButtons = function _ref2(on) {
                $('#tool_source_save, #tool_source_cancel').toggle(!on);
                $('#foreign_save, #foreign_cancel').toggle(on);
              };

              showPanel = function _ref(on) {
                var fcRules = $('#fc_rules');

                if (!fcRules.length) {
                  fcRules = $('<style id="fc_rules"></style>').appendTo('head');
                }

                fcRules.text(!on ? '' : ' #tool_topath { display: none !important; }');
                $('#foreignObject_panel').toggle(on);
              };

              svgEditor = this;
              $ = S.$, text2xml = S.text2xml, NS = S.NS, importLocale = S.importLocale;
              svgCanvas = svgEditor.canvas;
              svgdoc = S.svgroot.parentNode.ownerDocument;
              _context2.next = 11;
              return regeneratorRuntime.awrap(importLocale());

            case 11:
              strings = _context2.sent;

              properlySourceSizeTextArea = function properlySourceSizeTextArea() {
                // TODO: remove magic numbers here and get values from CSS
                var height = $('#svg_source_container').height() - 80;
                $('#svg_source_textarea').css('height', height);
              };
              /**
              * @param {boolean} on
              * @returns {void}
              */


              editingforeign = false;
              /**
              * This function sets the content of element elt to the input XML.
              * @param {string} xmlString - The XML text
              * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
              */

              buttons = [{
                id: 'tool_foreign',
                icon: svgEditor.curConfig.extIconsPath + 'foreignobject-tool.png',
                type: 'mode',
                events: {
                  click: function click() {
                    svgCanvas.setMode('foreign');
                  }
                }
              }, {
                id: 'edit_foreign',
                icon: svgEditor.curConfig.extIconsPath + 'foreignobject-edit.png',
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
              return _context2.abrupt("return", {
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
                  }; // TODO: Needs to be done after orig icon loads


                  setTimeout(function () {
                    // Create source save/cancel buttons

                    /* const save = */
                    $('#tool_source_save').clone().hide().attr('id', 'foreign_save').unbind().appendTo('#tool_source_back').click(function _callee() {
                      var ok;
                      return regeneratorRuntime.async(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              if (editingforeign) {
                                _context.next = 2;
                                break;
                              }

                              return _context.abrupt("return");

                            case 2:
                              if (setForeignString($('#svg_source_textarea').val())) {
                                _context.next = 11;
                                break;
                              }

                              _context.next = 5;
                              return regeneratorRuntime.awrap($.confirm('Errors found. Revert to original?'));

                            case 5:
                              ok = _context.sent;

                              if (ok) {
                                _context.next = 8;
                                break;
                              }

                              return _context.abrupt("return");

                            case 8:
                              endChanges();
                              _context.next = 12;
                              break;

                            case 11:
                              endChanges();

                            case 12:
                            case "end":
                              return _context.stop();
                          }
                        }
                      });
                    });
                    /* const cancel = */

                    $('#tool_source_cancel').clone().hide().attr('id', 'foreign_cancel').unbind().appendTo('#tool_source_back').click(function () {
                      endChanges();
                    });
                  }, 3000);
                },
                mouseDown: function mouseDown(opts) {
                  // const e = opts.event;
                  if (svgCanvas.getMode() !== 'foreign') {
                    return undefined;
                  }

                  started = true;
                  newFO = svgCanvas.addSVGElementFromJson({
                    element: 'foreignObject',
                    attr: {
                      x: opts.start_x,
                      y: opts.start_y,
                      id: svgCanvas.getNextId(),
                      'font-size': 16,
                      // cur_text.font_size,
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
                  mi.textContent = "\u03A6";
                  var mo = svgdoc.createElementNS(NS.MATH, 'mo');
                  mo.textContent = "\u222A";
                  var mi2 = svgdoc.createElementNS(NS.MATH, 'mi');
                  mi2.textContent = "\u2133";
                  m.append(mi, mo, mi2);
                  newFO.append(m);
                  return {
                    started: true
                  };
                },
                mouseUp: function mouseUp(opts) {
                  // const e = opts.event;
                  if (svgCanvas.getMode() !== 'foreign' || !started) {
                    return undefined;
                  }

                  var attrs = $(newFO).attr(['width', 'height']);
                  var keep = attrs.width !== '0' || attrs.height !== '0';
                  svgCanvas.addToSelection([newFO], true);
                  return {
                    keep: keep,
                    element: newFO
                  };
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
                elementChanged: function elementChanged(opts) {// const elem = opts.elems[0];
                }
              });

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  };

  return extForeignobject;

}());
