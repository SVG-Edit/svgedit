var svgEditorExtension_placemark = (function () {
  'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

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

  /**
   * ext-placemark.js
   *
   *
   * @copyright 2010 CloudCanvas, Inc. All rights reserved
   *
   */
  var extPlacemark = {
    name: 'placemark',
    init: function init(S) {
      var svgEditor, svgCanvas, addElem, $, importLocale, selElems, started, newPM, strings, markerTypes, showPanel, getLinked, updateText, updateFont, addMarker, setMarker, colorChanged, updateReferences, setArrowFromButton, getTitle, addMarkerButtons, buttons, contextTools;
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              addMarkerButtons = function _ref11(buttons) {
                Object.keys(markerTypes).forEach(function (id) {
                  var title = getTitle(String(id));
                  buttons.push({
                    id: 'placemark_marker_' + id,
                    svgicon: id,
                    icon: svgEditor.curConfig.extIconsPath + 'markers-' + id + '.png',
                    title: title,
                    type: 'context',
                    events: {
                      click: setArrowFromButton
                    },
                    panel: 'placemark_panel',
                    list: 'placemark_marker',
                    isDefault: id === 'leftarrow'
                  });
                });
                return buttons;
              };

              getTitle = function _ref10(id) {
                var langList = strings.langList;
                var item = langList.find(function (itm) {
                  return itm.id === id;
                });
                return item ? item.title : id;
              };

              setArrowFromButton = function _ref9(ev) {
                var parts = this.id.split('_');
                var val = parts[2];

                if (parts[3]) {
                  val += '_' + parts[3];
                }

                $('#placemark_marker').attr('value', val);
              };

              updateReferences = function _ref8(el) {
                var id = 'placemark_marker_' + el.id;
                var markerName = 'marker-start';
                var marker = getLinked(el, markerName);

                if (!marker || !marker.attributes["class"]) {
                  return;
                } // not created by this extension


                var url = el.getAttribute(markerName);

                if (url) {
                  var len = el.id.length;
                  var linkid = url.substr(-len - 1, len);

                  if (el.id !== linkid) {
                    var val = $('#placemark_marker').attr('value') || 'leftarrow';
                    addMarker(id, val);
                    svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');
                    svgCanvas.call('changed', selElems);
                  }
                }
              };

              colorChanged = function _ref7(el) {
                var color = el.getAttribute('stroke');
                var marker = getLinked(el, 'marker-start'); // console.log(marker);

                if (!marker) {
                  return;
                }

                if (!marker.attributes["class"]) {
                  return;
                } // not created by this extension


                var ch = marker.lastElementChild;

                if (!ch) {
                  return;
                }

                var curfill = ch.getAttribute('fill');
                var curstroke = ch.getAttribute('stroke');

                if (curfill && curfill !== 'none') {
                  ch.setAttribute('fill', color);
                }

                if (curstroke && curstroke !== 'none') {
                  ch.setAttribute('stroke', color);
                }
              };

              setMarker = function _ref6(el, val) {
                var markerName = 'marker-start';
                var marker = getLinked(el, markerName);

                if (marker) {
                  $(marker).remove();
                }

                el.removeAttribute(markerName);

                if (val === 'nomarker') {
                  svgCanvas.call('changed', [el]);
                  return;
                } // Set marker on element


                var id = 'placemark_marker_' + el.id;
                addMarker(id, val);
                el.setAttribute(markerName, 'url(#' + id + ')');
                svgCanvas.call('changed', [el]);
              };

              addMarker = function _ref5(id, val) {
                var marker = svgCanvas.getElem(id);

                if (marker) {
                  return undefined;
                } // console.log(id);


                if (val === '' || val === 'nomarker') {
                  return undefined;
                }

                var color = svgCanvas.getColor('stroke'); // NOTE: Safari didn't like a negative value in viewBox
                // so we use a standardized 0 0 100 100
                // with 50 50 being mapped to the marker position

                var scale = 2; // parseFloat($('#marker_size').val());

                var strokeWidth = 10;
                var refX = 50;
                var refY = 50;
                var viewBox = '0 0 100 100';
                var markerWidth = 5 * scale;
                var markerHeight = 5 * scale;
                var seType = val;

                if (!markerTypes[seType]) {
                  return undefined;
                } // an unknown type!
                // positional markers(arrows) at end of line


                if (seType.includes('left')) refX = 0;
                if (seType.includes('right')) refX = 100; // create a generic marker

                marker = addElem({
                  element: 'marker',
                  attr: {
                    id: id,
                    markerUnits: 'strokeWidth',
                    orient: 'auto',
                    style: 'pointer-events:none',
                    "class": seType
                  }
                });
                var mel = addElem(markerTypes[seType]);
                var fillcolor = seType.substr(-2) === '_o' ? 'none' : color;
                mel.setAttribute('fill', fillcolor);
                mel.setAttribute('stroke', color);
                mel.setAttribute('stroke-width', strokeWidth);
                marker.append(mel);
                marker.setAttribute('viewBox', viewBox);
                marker.setAttribute('markerWidth', markerWidth);
                marker.setAttribute('markerHeight', markerHeight);
                marker.setAttribute('refX', refX);
                marker.setAttribute('refY', refY);
                svgCanvas.findDefs().append(marker);
                return marker;
              };

              updateFont = function _ref4(font) {
                font = font.split(' ');
                var fontSize = parseInt(font.pop());
                font = font.join(' ');
                selElems.forEach(function (elem) {
                  if (elem && elem.getAttribute('class').includes('placemark')) {
                    $(elem).children().each(function (_, i) {
                      var _i$id$split3 = i.id.split('_'),
                          _i$id$split4 = _slicedToArray(_i$id$split3, 3),
                          type = _i$id$split4[2];

                      if (type === 'txt') {
                        $(i).attr({
                          'font-family': font,
                          'font-size': fontSize
                        });
                      }
                    });
                  }
                });
              };

              updateText = function _ref3(txt) {
                var items = txt.split(';');
                selElems.forEach(function (elem) {
                  if (elem && elem.getAttribute('class').includes('placemark')) {
                    $(elem).children().each(function (_, i) {
                      var _i$id$split = i.id.split('_'),
                          _i$id$split2 = _slicedToArray(_i$id$split, 4),
                          type = _i$id$split2[2],
                          n = _i$id$split2[3];

                      if (type === 'txt') {
                        $(i).text(items[n]);
                      }
                    });
                  }
                });
              };

              getLinked = function _ref2(elem, attr) {
                if (!elem) {
                  return null;
                }

                var str = elem.getAttribute(attr);

                if (!str) {
                  return null;
                } // const m = str.match(/\(#(?<id>.+)\)/);
                // if (!m || !m.groups.id) {


                var m = str.match(/\(#(.*)\)/);

                if (!m || m.length !== 2) {
                  return null;
                }

                return svgCanvas.getElem(m[1]); // return svgCanvas.getElem(m.groups.id);
              };

              showPanel = function _ref(on) {
                $('#placemark_panel').toggle(on);
              };

              svgEditor = this;
              svgCanvas = svgEditor.canvas;
              addElem = svgCanvas.addSVGElementFromJson;
              $ = S.$, importLocale = S.importLocale; // {svgcontent},

              _context.next = 17;
              return regeneratorRuntime.awrap(importLocale());

            case 17:
              strings = _context.sent;
              markerTypes = {
                nomarker: {},
                forwardslash: {
                  element: 'path',
                  attr: {
                    d: 'M30,100 L70,0'
                  }
                },
                reverseslash: {
                  element: 'path',
                  attr: {
                    d: 'M30,0 L70,100'
                  }
                },
                verticalslash: {
                  element: 'path',
                  attr: {
                    d: 'M50,0 L50,100'
                  }
                },
                xmark: {
                  element: 'path',
                  attr: {
                    d: 'M20,80 L80,20 M80,80 L20,20'
                  }
                },
                leftarrow: {
                  element: 'path',
                  attr: {
                    d: 'M0,50 L100,90 L70,50 L100,10 Z'
                  }
                },
                rightarrow: {
                  element: 'path',
                  attr: {
                    d: 'M100,50 L0,90 L30,50 L0,10 Z'
                  }
                },
                box: {
                  element: 'path',
                  attr: {
                    d: 'M20,20 L20,80 L80,80 L80,20 Z'
                  }
                },
                star: {
                  element: 'path',
                  attr: {
                    d: 'M10,30 L90,30 L20,90 L50,10 L80,90 Z'
                  }
                },
                mcircle: {
                  element: 'circle',
                  attr: {
                    r: 30,
                    cx: 50,
                    cy: 50
                  }
                },
                triangle: {
                  element: 'path',
                  attr: {
                    d: 'M10,80 L50,20 L80,80 Z'
                  }
                }
              }; // duplicate shapes to support unfilled (open) marker types with an _o suffix

              ['leftarrow', 'rightarrow', 'box', 'star', 'mcircle', 'triangle'].forEach(function (v) {
                markerTypes[v + '_o'] = markerTypes[v];
              });
              /**
               *
               * @param {boolean} on
               * @returns {void}
               */

              buttons = [{
                id: 'tool_placemark',
                icon: svgEditor.curConfig.extIconsPath + 'placemark.png',
                type: 'mode',
                position: 12,
                events: {
                  click: function click() {
                    showPanel(true);
                    svgCanvas.setMode('placemark');
                  }
                }
              }];
              contextTools = [{
                type: 'button-select',
                panel: 'placemark_panel',
                id: 'placemark_marker',
                colnum: 3,
                events: {
                  change: setArrowFromButton
                }
              }, {
                type: 'input',
                panel: 'placemark_panel',
                id: 'placemarkText',
                size: 20,
                defval: '',
                events: {
                  change: function change() {
                    updateText(this.value);
                  }
                }
              }, {
                type: 'input',
                panel: 'placemark_panel',
                id: 'placemarkFont',
                size: 7,
                defval: 'Arial 10',
                events: {
                  change: function change() {
                    updateFont(this.value);
                  }
                }
              }];
              return _context.abrupt("return", {
                name: strings.name,
                svgicons: svgEditor.curConfig.extIconsPath + 'placemark-icons.xml',
                buttons: addMarkerButtons(strings.buttons.map(function (button, i) {
                  return Object.assign(buttons[i], button);
                })),
                context_tools: strings.contextTools.map(function (contextTool, i) {
                  return Object.assign(contextTools[i], contextTool);
                }),
                callback: function callback() {
                  $('#placemark_panel').hide(); // const endChanges = function(){};
                },
                mouseDown: function mouseDown(opts) {
                  // const rgb = svgCanvas.getColor('fill');
                  var sRgb = svgCanvas.getColor('stroke');
                  var sWidth = svgCanvas.getStrokeWidth();

                  if (svgCanvas.getMode() === 'placemark') {
                    started = true;
                    var id = svgCanvas.getNextId();
                    var items = $('#placemarkText').val().split(';');
                    var font = $('#placemarkFont').val().split(' ');
                    var fontSize = parseInt(font.pop());
                    font = font.join(' ');
                    var x0 = opts.start_x + 10,
                        y0 = opts.start_y + 10;
                    var maxlen = 0;
                    var children = [{
                      element: 'line',
                      attr: {
                        id: id + '_pline_0',
                        fill: 'none',
                        stroke: sRgb,
                        'stroke-width': sWidth,
                        'stroke-linecap': 'round',
                        x1: opts.start_x,
                        y1: opts.start_y,
                        x2: x0,
                        y2: y0
                      }
                    }];
                    items.forEach(function (i, n) {
                      maxlen = Math.max(maxlen, i.length);
                      children.push({
                        element: 'line',
                        attr: {
                          id: id + '_tline_' + n,
                          fill: 'none',
                          stroke: sRgb,
                          'stroke-width': sWidth,
                          'stroke-linecap': 'round',
                          x1: x0,
                          y1: y0 + (fontSize + 6) * n,
                          x2: x0 + i.length * fontSize * 0.5 + fontSize,
                          y2: y0 + (fontSize + 6) * n
                        }
                      });
                      children.push({
                        element: 'text',
                        attr: {
                          id: id + '_txt_' + n,
                          fill: sRgb,
                          stroke: 'none',
                          'stroke-width': 0,
                          x: x0 + 3,
                          y: y0 - 3 + (fontSize + 6) * n,
                          'font-family': font,
                          'font-size': fontSize,
                          'text-anchor': 'start'
                        },
                        children: [i]
                      });
                    });

                    if (items.length > 0) {
                      children.push({
                        element: 'line',
                        attr: {
                          id: id + '_vline_0',
                          fill: 'none',
                          stroke: sRgb,
                          'stroke-width': sWidth,
                          'stroke-linecap': 'round',
                          x1: x0,
                          y1: y0,
                          x2: x0,
                          y2: y0 + (fontSize + 6) * (items.length - 1)
                        }
                      });
                    }

                    newPM = svgCanvas.addSVGElementFromJson({
                      element: 'g',
                      attr: {
                        id: id,
                        "class": 'placemark',
                        fontSize: fontSize,
                        maxlen: maxlen,
                        lines: items.length,
                        x: opts.start_x,
                        y: opts.start_y,
                        px: opts.start_x,
                        py: opts.start_y
                      },
                      children: children
                    });
                    setMarker(newPM.firstElementChild, $('#placemark_marker').attr('value') || 'leftarrow');
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

                  if (svgCanvas.getMode() === 'placemark') {
                    var x = opts.mouse_x / svgCanvas.getZoom();
                    var y = opts.mouse_y / svgCanvas.getZoom();

                    var _$$attr = $(newPM).attr(['fontSize', 'maxlen', 'lines', 'px', 'py']),
                        fontSize = _$$attr.fontSize,
                        maxlen = _$$attr.maxlen,
                        lines = _$$attr.lines,
                        px = _$$attr.px,
                        py = _$$attr.py;

                    $(newPM).attr({
                      x: x,
                      y: y
                    });
                    $(newPM).children().each(function (_, i) {
                      var _i$id$split5 = i.id.split('_'),
                          _i$id$split6 = _slicedToArray(_i$id$split5, 4),
                          type = _i$id$split6[2],
                          n = _i$id$split6[3];

                      var y0 = y + (fontSize + 6) * n,
                          x0 = x + maxlen * fontSize * 0.5 + fontSize;
                      var nx = x + (x0 - x) / 2 < px ? x0 : x;
                      var ny = y + (fontSize + 6) * (lines - 1) / 2 < py ? y + (fontSize + 6) * (lines - 1) : y;

                      if (type === 'pline') {
                        i.setAttribute('x2', nx);
                        i.setAttribute('y2', ny);
                      }

                      if (type === 'tline') {
                        i.setAttribute('x1', x);
                        i.setAttribute('y1', y0);
                        i.setAttribute('x2', x0);
                        i.setAttribute('y2', y0);
                      }

                      if (type === 'vline') {
                        i.setAttribute('x1', nx);
                        i.setAttribute('y1', y);
                        i.setAttribute('x2', nx);
                        i.setAttribute('y2', y + (fontSize + 6) * (lines - 1));
                      }

                      if (type === 'txt') {
                        i.setAttribute('x', x + fontSize / 2);
                        i.setAttribute('y', y0 - 3);
                      }
                    });
                    return {
                      started: true
                    };
                  }

                  return undefined;
                },
                mouseUp: function mouseUp() {
                  if (svgCanvas.getMode() === 'placemark') {
                    var _$$attr2 = $(newPM).attr(['x', 'y', 'px', 'py']),
                        x = _$$attr2.x,
                        y = _$$attr2.y,
                        px = _$$attr2.px,
                        py = _$$attr2.py;

                    return {
                      keep: x != px && y != py,
                      // eslint-disable-line eqeqeq
                      element: newPM
                    };
                  }

                  return undefined;
                },
                selectedChanged: function selectedChanged(opts) {
                  // Use this to update the current selected elements
                  selElems = opts.elems;
                  selElems.forEach(function (elem) {
                    if (elem && elem.getAttribute('class').includes('placemark')) {
                      var txt = [];
                      $(elem).children().each(function (n, i) {
                        var _i$id$split7 = i.id.split('_'),
                            _i$id$split8 = _slicedToArray(_i$id$split7, 3),
                            type = _i$id$split8[2];

                        if (type === 'txt') {
                          $('#placemarkFont').val(i.getAttribute('font-family') + ' ' + i.getAttribute('font-size'));
                          txt.push($(i).text());
                        }
                      });
                      $('#placemarkText').val(txt.join(';'));
                      showPanel(true);
                    } else {
                      showPanel(false);
                    }
                  });
                },
                elementChanged: function elementChanged(opts) {
                  opts.elems.forEach(function (elem) {
                    if (elem.id.includes('pline_0')) {
                      // need update marker of pline_0
                      colorChanged(elem);
                      updateReferences(elem);
                    }
                  });
                }
              });

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  };

  return extPlacemark;

}());
