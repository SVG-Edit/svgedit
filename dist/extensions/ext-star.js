var svgEditorExtension_star = (function () {
  'use strict';

  /**
   * ext-star.js
   *
   *
   * @copyright 2010 CloudCanvas, Inc. All rights reserved
   *
   */
  var extStar = {
    name: 'star',
    init: function init(S) {
      var svgEditor, svgCanvas, $, importLocale, selElems, started, newFO, strings, showPanel, setAttr, buttons, contextTools;
      return regeneratorRuntime.async(function init$(_context) {
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
              svgCanvas = svgEditor.canvas;
              $ = S.$, importLocale = S.importLocale; // {svgcontent},

              _context.next = 7;
              return regeneratorRuntime.awrap(importLocale());

            case 7:
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

                  return undefined;
                },
                mouseMove: function mouseMove(opts) {
                  if (!started) {
                    return undefined;
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
                    newFO.setAttribute('r', circumradius);
                    newFO.setAttribute('r2', inradius);
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

                    newFO.setAttribute('points', polyPoints);
                    newFO.setAttribute('fill', fill);
                    newFO.setAttribute('stroke', strokecolor);
                    newFO.setAttribute('stroke-width', strokeWidth);
                    /* const shape = */

                    newFO.getAttribute('shape');
                    return {
                      started: true
                    };
                  }

                  return undefined;
                },
                mouseUp: function mouseUp() {
                  if (svgCanvas.getMode() === 'star') {
                    var attrs = $(newFO).attr(['r']); // svgCanvas.addToSelection([newFO], true);

                    return {
                      keep: attrs.r !== '0',
                      element: newFO
                    };
                  }

                  return undefined;
                },
                selectedChanged: function selectedChanged(opts) {
                  // Use this to update the current selected elements
                  selElems = opts.elems;
                  var i = selElems.length;

                  while (i--) {
                    var elem = selElems[i];

                    if (elem && elem.getAttribute('shape') === 'star') {
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
                elementChanged: function elementChanged(opts) {// const elem = opts.elems[0];
                }
              });

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  };

  return extStar;

}());
