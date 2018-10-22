var svgEditorExtension_star = (function () {
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
   * ext-star.js
   *
   *
   * @copyright 2010 CloudCanvas, Inc. All rights reserved
   *
   */
  var extStar = {
    name: 'star',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(S) {
        var svgEditor, $, svgCanvas, importLocale, selElems, started, newFO, strings, showPanel, setAttr, buttons, contextTools;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
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
                  $('#star_panel').toggle(on);
                };

                svgEditor = this;
                $ = jQuery;
                svgCanvas = svgEditor.canvas;
                importLocale = S.importLocale; // {svgcontent},

                _context.next = 8;
                return importLocale();

              case 8:
                strings = _context.sent;

                /*
                function cot(n){
                  return 1 / Math.tan(n);
                }
                 function sec(n){
                  return 1 / Math.cos(n);
                }
                */
                buttons = [{
                  id: 'tool_star',
                  icon: svgEditor.curConfig.extIconsPath + 'star.png',
                  type: 'mode',
                  position: 12,
                  events: {
                    click: function click() {
                      showPanel(true);
                      svgCanvas.setMode('star');
                    }
                  }
                }];
                contextTools = [{
                  type: 'input',
                  panel: 'star_panel',
                  id: 'starNumPoints',
                  size: 3,
                  defval: 5,
                  events: {
                    change: function change() {
                      setAttr('point', this.value);
                    }
                  }
                }, {
                  type: 'input',
                  panel: 'star_panel',
                  id: 'starRadiusMulitplier',
                  size: 3,
                  defval: 2.5
                }, {
                  type: 'input',
                  panel: 'star_panel',
                  id: 'radialShift',
                  size: 3,
                  defval: 0,
                  events: {
                    change: function change() {
                      setAttr('radialshift', this.value);
                    }
                  }
                }];
                return _context.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'star-icons.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  context_tools: strings.contextTools.map(function (contextTool, i) {
                    return Object.assign(contextTools[i], contextTool);
                  }),
                  callback: function callback() {
                    $('#star_panel').hide(); // const endChanges = function(){};
                  },
                  mouseDown: function mouseDown(opts) {
                    var rgb = svgCanvas.getColor('fill'); // const ccRgbEl = rgb.substring(1, rgb.length);

                    var sRgb = svgCanvas.getColor('stroke'); // const ccSRgbEl = sRgb.substring(1, rgb.length);

                    var sWidth = svgCanvas.getStrokeWidth();

                    if (svgCanvas.getMode() === 'star') {
                      started = true;
                      newFO = svgCanvas.addSVGElementFromJson({
                        element: 'polygon',
                        attr: {
                          cx: opts.start_x,
                          cy: opts.start_y,
                          id: svgCanvas.getNextId(),
                          shape: 'star',
                          point: document.getElementById('starNumPoints').value,
                          r: 0,
                          radialshift: document.getElementById('radialShift').value,
                          r2: 0,
                          orient: 'point',
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

                    if (svgCanvas.getMode() === 'star') {
                      var c = $(newFO).attr(['cx', 'cy', 'point', 'orient', 'fill', 'strokecolor', 'strokeWidth', 'radialshift']);
                      var x = opts.mouse_x;
                      var y = opts.mouse_y;
                      var cx = c.cx,
                          cy = c.cy,
                          fill = c.fill,
                          strokecolor = c.strokecolor,
                          strokeWidth = c.strokeWidth,
                          radialshift = c.radialshift,
                          point = c.point,
                          orient = c.orient,
                          circumradius = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / 1.5,
                          inradius = circumradius / document.getElementById('starRadiusMulitplier').value;
                      newFO.setAttributeNS(null, 'r', circumradius);
                      newFO.setAttributeNS(null, 'r2', inradius);
                      var polyPoints = '';

                      for (var s = 0; point >= s; s++) {
                        var angle = 2.0 * Math.PI * (s / point);

                        if (orient === 'point') {
                          angle -= Math.PI / 2;
                        } else if (orient === 'edge') {
                          angle = angle + Math.PI / point - Math.PI / 2;
                        }

                        x = circumradius * Math.cos(angle) + cx;
                        y = circumradius * Math.sin(angle) + cy;
                        polyPoints += x + ',' + y + ' ';

                        if (!isNaN(inradius)) {
                          angle = 2.0 * Math.PI * (s / point) + Math.PI / point;

                          if (orient === 'point') {
                            angle -= Math.PI / 2;
                          } else if (orient === 'edge') {
                            angle = angle + Math.PI / point - Math.PI / 2;
                          }

                          angle += radialshift;
                          x = inradius * Math.cos(angle) + cx;
                          y = inradius * Math.sin(angle) + cy;
                          polyPoints += x + ',' + y + ' ';
                        }
                      }

                      newFO.setAttributeNS(null, 'points', polyPoints);
                      newFO.setAttributeNS(null, 'fill', fill);
                      newFO.setAttributeNS(null, 'stroke', strokecolor);
                      newFO.setAttributeNS(null, 'stroke-width', strokeWidth);
                      /* const shape = */

                      newFO.getAttributeNS(null, 'shape');
                      return {
                        started: true
                      };
                    }
                  },
                  mouseUp: function mouseUp() {
                    if (svgCanvas.getMode() === 'star') {
                      var attrs = $(newFO).attr(['r']); // svgCanvas.addToSelection([newFO], true);

                      return {
                        keep: attrs.r !== '0',
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

                      if (elem && elem.getAttributeNS(null, 'shape') === 'star') {
                        if (opts.selectedElement && !opts.multiselected) {
                          // $('#starRadiusMulitplier').val(elem.getAttribute('r2'));
                          $('#starNumPoints').val(elem.getAttribute('point'));
                          $('#radialShift').val(elem.getAttribute('radialshift'));
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

              case 12:
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

  return extStar;

}());
