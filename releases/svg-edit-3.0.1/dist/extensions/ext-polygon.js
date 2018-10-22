var svgEditorExtension_polygon = (function () {
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
   * ext-polygon.js
   *
   *
   * @copyright 2010 CloudCanvas, Inc. All rights reserved
   *
   */
  var extPolygon = {
    name: 'polygon',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(S) {
        var svgEditor, $, svgCanvas, importLocale, editingitex, strings, selElems, started, newFO, showPanel, setAttr, cot, sec, buttons, contextTools;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                sec = function _ref4(n) {
                  return 1 / Math.cos(n);
                };

                cot = function _ref3(n) {
                  return 1 / Math.tan(n);
                };

                setAttr = function _ref2(attr, val) {
                  svgCanvas.changeSelectedAttribute(attr, val);
                  svgCanvas.call('changed', selElems);
                };

                showPanel = function _ref(on) {
                  var fcRules = $('#fc_rules');

                  if (!fcRules.length) {
                    fcRules = $('<style id="fc_rules"></style>').appendTo('head');
                  }

                  fcRules.text(!on ? '' : ' #tool_topath { display: none !important; }');
                  $('#polygon_panel').toggle(on);
                };

                svgEditor = this;
                $ = jQuery;
                svgCanvas = svgEditor.canvas;
                importLocale = S.importLocale, editingitex = false;
                _context.next = 10;
                return importLocale();

              case 10:
                strings = _context.sent;

                /**
                * Obtained from http://code.google.com/p/passenger-top/source/browse/instiki/public/svg-edit/editor/extensions/ext-itex.js?r=3
                * This function sets the content of of the currently-selected foreignObject element,
                *   based on the itex contained in string.
                * @param {string} tex The itex text.
                * @returns {boolean} This function returns false if the set was unsuccessful, true otherwise.
                */

                /*
                function setItexString(tex) {
                  const mathns = 'http://www.w3.org/1998/Math/MathML',
                    xmlnsns = 'http://www.w3.org/2000/xmlns/',
                    ajaxEndpoint = '../../itex';
                  const elt = selElems[0];
                  try {
                    const math = svgdoc.createElementNS(mathns, 'math');
                    math.setAttributeNS(xmlnsns, 'xmlns', mathns);
                    math.setAttribute('display', 'inline');
                    const semantics = document.createElementNS(mathns, 'semantics');
                    const annotation = document.createElementNS(mathns, 'annotation');
                    annotation.setAttribute('encoding', 'application/x-tex');
                    annotation.textContent = tex;
                    const mrow = document.createElementNS(mathns, 'mrow');
                    semantics.append(mrow, annotation);
                    math.append(semantics);
                    // make an AJAX request to the server, to get the MathML
                    $.post(ajaxEndpoint, {tex, display: 'inline'}, function(data){
                      const children = data.documentElement.childNodes;
                      while (children.length > 0) {
                         mrow.append(svgdoc.adoptNode(children[0], true));
                      }
                      svgCanvas.sanitizeSvg(math);
                      svgCanvas.call('changed', [elt]);
                    });
                    elt.firstChild.replaceWith(math);
                    svgCanvas.call('changed', [elt]);
                    svgCanvas.clearSelection();
                  } catch(e) {
                    console.log(e);
                    return false;
                  }
                   return true;
                }
                */
                buttons = [{
                  id: 'tool_polygon',
                  icon: svgEditor.curConfig.extIconsPath + 'polygon.png',
                  type: 'mode',
                  position: 11,
                  events: {
                    click: function click() {
                      svgCanvas.setMode('polygon');
                      showPanel(true);
                    }
                  }
                }];
                contextTools = [{
                  type: 'input',
                  panel: 'polygon_panel',
                  id: 'polySides',
                  size: 3,
                  defval: 5,
                  events: {
                    change: function change() {
                      setAttr('sides', this.value);
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'polygon-icons.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  context_tools: strings.contextTools.map(function (contextTool, i) {
                    return Object.assign(contextTools[i], contextTool);
                  }),
                  callback: function callback() {
                    $('#polygon_panel').hide();


                    setTimeout(function () {
                      // Create source save/cancel buttons

                      /* const save = */
                      $('#tool_source_save').clone().hide().attr('id', 'polygon_save').unbind().appendTo('#tool_source_back').click(function () {
                        if (!editingitex) {
                          return;
                        } // Todo: Uncomment the setItexString() function above and handle ajaxEndpoint?
                        // setSelectMode();
                      });
                      /* const cancel = */

                      $('#tool_source_cancel').clone().hide().attr('id', 'polygon_cancel').unbind().appendTo('#tool_source_back').click(function () {
                      });
                    }, 3000);
                  },
                  mouseDown: function mouseDown(opts) {
                    // const e = opts.event;
                    var rgb = svgCanvas.getColor('fill'); // const ccRgbEl = rgb.substring(1, rgb.length);

                    var sRgb = svgCanvas.getColor('stroke'); // ccSRgbEl = sRgb.substring(1, rgb.length);

                    var sWidth = svgCanvas.getStrokeWidth();

                    if (svgCanvas.getMode() === 'polygon') {
                      started = true;
                      newFO = svgCanvas.addSVGElementFromJson({
                        element: 'polygon',
                        attr: {
                          cx: opts.start_x,
                          cy: opts.start_y,
                          id: svgCanvas.getNextId(),
                          shape: 'regularPoly',
                          sides: document.getElementById('polySides').value,
                          orient: 'x',
                          edge: 0,
                          fill: rgb,
                          strokecolor: sRgb,
                          strokeWidth: sWidth
                        }
                      });
                      return {
                        started: true
                      };
                    }
                  },
                  mouseMove: function mouseMove(opts) {
                    if (!started) {
                      return;
                    }

                    if (svgCanvas.getMode() === 'polygon') {
                      // const e = opts.event;
                      var c = $(newFO).attr(['cx', 'cy', 'sides', 'orient', 'fill', 'strokecolor', 'strokeWidth']);
                      var x = opts.mouse_x;
                      var y = opts.mouse_y;
                      var cx = c.cx,
                          cy = c.cy,
                          fill = c.fill,
                          strokecolor = c.strokecolor,
                          strokeWidth = c.strokeWidth,
                          sides = c.sides,
                          edg = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5;
                      newFO.setAttributeNS(null, 'edge', edg);
                      var inradius = edg / 2 * cot(Math.PI / sides);
                      var circumradius = inradius * sec(Math.PI / sides);
                      var points = '';

                      for (var s = 0; sides >= s; s++) {
                        var angle = 2.0 * Math.PI * s / sides;
                        x = circumradius * Math.cos(angle) + cx;
                        y = circumradius * Math.sin(angle) + cy;
                        points += x + ',' + y + ' ';
                      } // const poly = newFO.createElementNS(NS.SVG, 'polygon');


                      newFO.setAttributeNS(null, 'points', points);
                      newFO.setAttributeNS(null, 'fill', fill);
                      newFO.setAttributeNS(null, 'stroke', strokecolor);
                      newFO.setAttributeNS(null, 'stroke-width', strokeWidth); // newFO.setAttributeNS(null, 'transform', 'rotate(-90)');
                      // const shape = newFO.getAttributeNS(null, 'shape');
                      // newFO.append(poly);
                      // DrawPoly(cx, cy, sides, edg, orient);

                      return {
                        started: true
                      };
                    }
                  },
                  mouseUp: function mouseUp(opts) {
                    if (svgCanvas.getMode() === 'polygon') {
                      var attrs = $(newFO).attr('edge');
                      var keep = attrs.edge !== '0'; // svgCanvas.addToSelection([newFO], true);

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

                      if (elem && elem.getAttributeNS(null, 'shape') === 'regularPoly') {
                        if (opts.selectedElement && !opts.multiselected) {
                          $('#polySides').val(elem.getAttribute('sides'));
                          showPanel(true);
                        } else {
                          showPanel(false);
                        }
                      } else {
                        showPanel(false);
                      }
                    }
                  },
                  elementChanged: function elementChanged(opts) {}
                });

              case 14:
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

  return extPolygon;

}());
