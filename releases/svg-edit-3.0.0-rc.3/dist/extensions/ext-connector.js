var svgEditorExtension_connector = (function () {
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
   * ext-connector.js
   *
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria
   *
   */
  var extConnector = {
    name: 'connector',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(S) {
        var $, svgEditor, svgCanvas, getElem, svgroot, importLocale, addElem, selManager, connSel, elData, strings, startX, startY, curLine, startElem, endElem, seNs, svgcontent, started, connections, selElems, getBBintersect, getOffset, showPanel, setPoint, updateLine, findConnectors, updateConnectors, init, buttons;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                init = function _ref9() {
                  // Make sure all connectors have data set
                  $(svgcontent).find('*').each(function () {
                    var conn = this.getAttributeNS(seNs, 'connector');

                    if (conn) {
                      this.setAttribute('class', connSel.substr(1));
                      var connData = conn.split(' ');
                      var sbb = svgCanvas.getStrokedBBox([getElem(connData[0])]);
                      var ebb = svgCanvas.getStrokedBBox([getElem(connData[1])]);
                      $(this).data('c_start', connData[0]).data('c_end', connData[1]).data('start_bb', sbb).data('end_bb', ebb);
                      svgCanvas.getEditorNS(true);
                    }
                  }); // updateConnectors();
                };

                updateConnectors = function _ref8(elems) {
                  // Updates connector lines based on selected elements
                  // Is not used on mousemove, as it runs getStrokedBBox every time,
                  // which isn't necessary there.
                  findConnectors(elems);

                  if (connections.length) {
                    // Update line with element
                    var i = connections.length;

                    while (i--) {
                      var conn = connections[i];
                      var line = conn.connector;
                      var elem = conn.elem; // const sw = line.getAttribute('stroke-width') * 5;

                      var pre = conn.is_start ? 'start' : 'end'; // Update bbox for this element

                      var bb = svgCanvas.getStrokedBBox([elem]);
                      bb.x = conn.start_x;
                      bb.y = conn.start_y;
                      elData(line, pre + '_bb', bb);
                      /* const addOffset = */

                      elData(line, pre + '_off');
                      var altPre = conn.is_start ? 'end' : 'start'; // Get center pt of connected element

                      var bb2 = elData(line, altPre + '_bb');
                      var srcX = bb2.x + bb2.width / 2;
                      var srcY = bb2.y + bb2.height / 2; // Set point of element being moved

                      var pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line));
                      setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true); // Set point of connected element

                      var pt2 = getBBintersect(pt.x, pt.y, elData(line, altPre + '_bb'), getOffset(altPre, line));
                      setPoint(line, conn.is_start ? 'end' : 0, pt2.x, pt2.y, true); // Update points attribute manually for webkit

                      if (navigator.userAgent.includes('AppleWebKit')) {
                        var pts = line.points;
                        var len = pts.numberOfItems;
                        var ptArr = [];

                        for (var j = 0; j < len; j++) {
                          pt = pts.getItem(j);
                          ptArr[j] = pt.x + ',' + pt.y;
                        }

                        line.setAttribute('points', ptArr.join(' '));
                      }
                    }
                  }
                };

                findConnectors = function _ref7() {
                  var elems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : selElems;
                  var connectors = $(svgcontent).find(connSel);
                  connections = []; // Loop through connectors to see if one is connected to the element

                  connectors.each(function () {
                    var addThis;

                    function add() {
                      if (elems.includes(this)) {
                        // Pretend this element is selected
                        addThis = true;
                      }
                    } // Grab the ends


                    var parts = [];
                    ['start', 'end'].forEach(function (pos, i) {
                      var key = 'c_' + pos;
                      var part = elData(this, key);

                      if (part == null) {
                        part = document.getElementById(this.attributes['se:connector'].value.split(' ')[i]);
                        elData(this, 'c_' + pos, part.id);
                        elData(this, pos + '_bb', svgCanvas.getStrokedBBox([part]));
                      } else part = document.getElementById(part);

                      parts.push(part);
                    }.bind(this));

                    for (var i = 0; i < 2; i++) {
                      var cElem = parts[i];
                      addThis = false; // The connected element might be part of a selected group

                      $(cElem).parents().each(add);

                      if (!cElem || !cElem.parentNode) {
                        $(this).remove();
                        continue;
                      }

                      if (elems.includes(cElem) || addThis) {
                        var bb = svgCanvas.getStrokedBBox([cElem]);
                        connections.push({
                          elem: cElem,
                          connector: this,
                          is_start: i === 0,
                          start_x: bb.x,
                          start_y: bb.y
                        });
                      }
                    }
                  });
                };

                updateLine = function _ref6(diffX, diffY) {
                  // Update line with element
                  var i = connections.length;

                  while (i--) {
                    var conn = connections[i];
                    var line = conn.connector; // const {elem} = conn;

                    var pre = conn.is_start ? 'start' : 'end'; // const sw = line.getAttribute('stroke-width') * 5;
                    // Update bbox for this element

                    var bb = elData(line, pre + '_bb');
                    bb.x = conn.start_x + diffX;
                    bb.y = conn.start_y + diffY;
                    elData(line, pre + '_bb', bb);
                    var altPre = conn.is_start ? 'end' : 'start'; // Get center pt of connected element

                    var bb2 = elData(line, altPre + '_bb');
                    var srcX = bb2.x + bb2.width / 2;
                    var srcY = bb2.y + bb2.height / 2; // Set point of element being moved

                    var pt = getBBintersect(srcX, srcY, bb, getOffset(pre, line)); // $(line).data(pre+'_off')?sw:0

                    setPoint(line, conn.is_start ? 0 : 'end', pt.x, pt.y, true); // Set point of connected element

                    var pt2 = getBBintersect(pt.x, pt.y, elData(line, altPre + '_bb'), getOffset(altPre, line));
                    setPoint(line, conn.is_start ? 'end' : 0, pt2.x, pt2.y, true);
                  }
                };

                setPoint = function _ref5(elem, pos, x, y, setMid) {
                  var pts = elem.points;
                  var pt = svgroot.createSVGPoint();
                  pt.x = x;
                  pt.y = y;

                  if (pos === 'end') {
                    pos = pts.numberOfItems - 1;
                  } // TODO: Test for this on init, then use alt only if needed


                  try {
                    pts.replaceItem(pt, pos);
                  } catch (err) {
                    // Should only occur in FF which formats points attr as "n,n n,n", so just split
                    var ptArr = elem.getAttribute('points').split(' ');

                    for (var i = 0; i < ptArr.length; i++) {
                      if (i === pos) {
                        ptArr[i] = x + ',' + y;
                      }
                    }

                    elem.setAttribute('points', ptArr.join(' '));
                  }

                  if (setMid) {
                    // Add center point
                    var ptStart = pts.getItem(0);
                    var ptEnd = pts.getItem(pts.numberOfItems - 1);
                    setPoint(elem, 1, (ptEnd.x + ptStart.x) / 2, (ptEnd.y + ptStart.y) / 2);
                  }
                };

                showPanel = function _ref4(on) {
                  var connRules = $('#connector_rules');

                  if (!connRules.length) {
                    connRules = $('<style id="connector_rules"></style>').appendTo('head');
                  }

                  connRules.text(!on ? '' : '#tool_clone, #tool_topath, #tool_angle, #xy_panel { display: none !important; }');
                  $('#connector_panel').toggle(on);
                };

                getOffset = function _ref3(side, line) {
                  var giveOffset = !!line.getAttribute('marker-' + side); // const giveOffset = $(line).data(side+'_off');
                  // TODO: Make this number (5) be based on marker width/height

                  var size = line.getAttribute('stroke-width') * 5;
                  return giveOffset ? size : 0;
                };

                getBBintersect = function _ref2(x, y, bb, offset) {
                  if (offset) {
                    offset -= 0;
                    bb = $.extend({}, bb);
                    bb.width += offset;
                    bb.height += offset;
                    bb.x -= offset / 2;
                    bb.y -= offset / 2;
                  }

                  var midX = bb.x + bb.width / 2;
                  var midY = bb.y + bb.height / 2;
                  var lenX = x - midX;
                  var lenY = y - midY;
                  var slope = Math.abs(lenY / lenX);
                  var ratio;

                  if (slope < bb.height / bb.width) {
                    ratio = bb.width / 2 / Math.abs(lenX);
                  } else {
                    ratio = lenY ? bb.height / 2 / Math.abs(lenY) : 0;
                  }

                  return {
                    x: midX + lenX * ratio,
                    y: midY + lenY * ratio
                  };
                };

                $ = jQuery;
                svgEditor = this;
                svgCanvas = svgEditor.canvas;
                getElem = svgCanvas.getElem;
                svgroot = S.svgroot, importLocale = S.importLocale, addElem = svgCanvas.addSVGElementFromJson, selManager = S.selectorManager, connSel = '.se_connector', elData = $.data;
                _context2.next = 15;
                return importLocale();

              case 15:
                strings = _context2.sent;
                svgcontent = S.svgcontent, started = false, connections = [], selElems = [];

                // Do once
                (function () {
                  var gse = svgCanvas.groupSelectedElements;

                  svgCanvas.groupSelectedElements = function () {
                    svgCanvas.removeFromSelection($(connSel).toArray());
                    return gse.apply(this, arguments);
                  };

                  var mse = svgCanvas.moveSelectedElements;

                  svgCanvas.moveSelectedElements = function () {
                    var cmd = mse.apply(this, arguments);
                    updateConnectors();
                    return cmd;
                  };

                  seNs = svgCanvas.getEditorNS();
                })(); // Do on reset


                // $(svgroot).parent().mousemove(function (e) {
                // // if (started
                // //   || svgCanvas.getMode() !== 'connector'
                // //  || e.target.parentNode.parentNode !== svgcontent) return;
                //
                // console.log('y')
                // // if (e.target.parentNode.parentNode === svgcontent) {
                // //
                // // }
                // });
                buttons = [{
                  id: 'mode_connect',
                  type: 'mode',
                  icon: svgEditor.curConfig.imgPath + 'cut.png',
                  includeWith: {
                    button: '#tool_line',
                    isDefault: false,
                    position: 1
                  },
                  events: {
                    click: function click() {
                      svgCanvas.setMode('connector');
                    }
                  }
                }];
                return _context2.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.imgPath + 'conn.svg',
                  buttons: strings.buttons.map(function (button, i) {
                    return Object.assign(buttons[i], button);
                  }),
                  addLangData: function () {
                    var _addLangData = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee(_ref) {
                      var lang, importLocale;
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              lang = _ref.lang, importLocale = _ref.importLocale;
                              return _context.abrupt("return", {
                                data: strings.langList
                              });

                            case 2:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee, this);
                    }));

                    return function addLangData(_x2) {
                      return _addLangData.apply(this, arguments);
                    };
                  }(),
                  mouseDown: function mouseDown(opts) {
                    var e = opts.event;
                    startX = opts.start_x;
                    startY = opts.start_y;
                    var mode = svgCanvas.getMode();
                    var initStroke = svgEditor.curConfig.initStroke;

                    if (mode === 'connector') {
                      if (started) {
                        return;
                      }

                      var mouseTarget = e.target;
                      var parents = $(mouseTarget).parents();

                      if ($.inArray(svgcontent, parents) !== -1) {
                        // Connectable element
                        // If child of foreignObject, use parent
                        var fo = $(mouseTarget).closest('foreignObject');
                        startElem = fo.length ? fo[0] : mouseTarget; // Get center of source element

                        var bb = svgCanvas.getStrokedBBox([startElem]);
                        var x = bb.x + bb.width / 2;
                        var y = bb.y + bb.height / 2;
                        started = true;
                        curLine = addElem({
                          element: 'polyline',
                          attr: {
                            id: svgCanvas.getNextId(),
                            points: x + ',' + y + ' ' + x + ',' + y + ' ' + startX + ',' + startY,
                            stroke: '#' + initStroke.color,
                            'stroke-width': !startElem.stroke_width || startElem.stroke_width === 0 ? initStroke.width : startElem.stroke_width,
                            fill: 'none',
                            opacity: initStroke.opacity,
                            style: 'pointer-events:none'
                          }
                        });
                        elData(curLine, 'start_bb', bb);
                      }

                      return {
                        started: true
                      };
                    }

                    if (mode === 'select') {
                      findConnectors();
                    }
                  },
                  mouseMove: function mouseMove(opts) {
                    var zoom = svgCanvas.getZoom(); // const e = opts.event;

                    var x = opts.mouse_x / zoom;
                    var y = opts.mouse_y / zoom;
                    var diffX = x - startX,
                        diffY = y - startY;
                    var mode = svgCanvas.getMode();

                    if (mode === 'connector' && started) {
                      // const sw = curLine.getAttribute('stroke-width') * 3;
                      // Set start point (adjusts based on bb)
                      var pt = getBBintersect(x, y, elData(curLine, 'start_bb'), getOffset('start', curLine));
                      startX = pt.x;
                      startY = pt.y;
                      setPoint(curLine, 0, pt.x, pt.y, true); // Set end point

                      setPoint(curLine, 'end', x, y, true);
                    } else if (mode === 'select') {
                      var slen = selElems.length;

                      while (slen--) {
                        var elem = selElems[slen]; // Look for selected connector elements

                        if (elem && elData(elem, 'c_start')) {
                          // Remove the "translate" transform given to move
                          svgCanvas.removeFromSelection([elem]);
                          svgCanvas.getTransformList(elem).clear();
                        }
                      }

                      if (connections.length) {
                        updateLine(diffX, diffY);
                      }
                    }
                  },
                  mouseUp: function mouseUp(opts) {
                    // const zoom = svgCanvas.getZoom();
                    var e = opts.event; // , x = opts.mouse_x / zoom,
                    // , y = opts.mouse_y / zoom,

                    var mouseTarget = e.target;

                    if (svgCanvas.getMode() !== 'connector') {
                      return;
                    }

                    var fo = $(mouseTarget).closest('foreignObject');

                    if (fo.length) {
                      mouseTarget = fo[0];
                    }

                    var parents = $(mouseTarget).parents();

                    if (mouseTarget === startElem) {
                      // Start line through click
                      started = true;
                      return {
                        keep: true,
                        element: null,
                        started: started
                      };
                    }

                    if ($.inArray(svgcontent, parents) === -1) {
                      // Not a valid target element, so remove line
                      $(curLine).remove();
                      started = false;
                      return {
                        keep: false,
                        element: null,
                        started: started
                      };
                    } // Valid end element


                    endElem = mouseTarget;
                    var startId = startElem.id,
                        endId = endElem.id;
                    var connStr = startId + ' ' + endId;
                    var altStr = endId + ' ' + startId; // Don't create connector if one already exists

                    var dupe = $(svgcontent).find(connSel).filter(function () {
                      var conn = this.getAttributeNS(seNs, 'connector');

                      if (conn === connStr || conn === altStr) {
                        return true;
                      }
                    });

                    if (dupe.length) {
                      $(curLine).remove();
                      return {
                        keep: false,
                        element: null,
                        started: false
                      };
                    }

                    var bb = svgCanvas.getStrokedBBox([endElem]);
                    var pt = getBBintersect(startX, startY, bb, getOffset('start', curLine));
                    setPoint(curLine, 'end', pt.x, pt.y, true);
                    $(curLine).data('c_start', startId).data('c_end', endId).data('end_bb', bb);
                    seNs = svgCanvas.getEditorNS(true);
                    curLine.setAttributeNS(seNs, 'se:connector', connStr);
                    curLine.setAttribute('class', connSel.substr(1));
                    curLine.setAttribute('opacity', 1);
                    svgCanvas.addToSelection([curLine]);
                    svgCanvas.moveToBottomSelectedElement();
                    selManager.requestSelector(curLine).showGrips(false);
                    started = false;
                    return {
                      keep: true,
                      element: curLine,
                      started: started
                    };
                  },
                  selectedChanged: function selectedChanged(opts) {
                    // TODO: Find better way to skip operations if no connectors are in use
                    if (!$(svgcontent).find(connSel).length) {
                      return;
                    }

                    if (svgCanvas.getMode() === 'connector') {
                      svgCanvas.setMode('select');
                    } // Use this to update the current selected elements


                    selElems = opts.elems;
                    var i = selElems.length;

                    while (i--) {
                      var elem = selElems[i];

                      if (elem && elData(elem, 'c_start')) {
                        selManager.requestSelector(elem).showGrips(false);

                        if (opts.selectedElement && !opts.multiselected) {
                          // TODO: Set up context tools and hide most regular line tools
                          showPanel(true);
                        } else {
                          showPanel(false);
                        }
                      } else {
                        showPanel(false);
                      }
                    }

                    updateConnectors();
                  },
                  elementChanged: function elementChanged(opts) {
                    var elem = opts.elems[0];

                    if (elem && elem.tagName === 'svg' && elem.id === 'svgcontent') {
                      // Update svgcontent (can change on import)
                      svgcontent = elem;
                      init();
                    } // Has marker, so change offset


                    if (elem && (elem.getAttribute('marker-start') || elem.getAttribute('marker-mid') || elem.getAttribute('marker-end'))) {
                      var start = elem.getAttribute('marker-start');
                      var mid = elem.getAttribute('marker-mid');
                      var end = elem.getAttribute('marker-end');
                      curLine = elem;
                      $(elem).data('start_off', !!start).data('end_off', !!end);

                      if (elem.tagName === 'line' && mid) {
                        // Convert to polyline to accept mid-arrow
                        var x1 = Number(elem.getAttribute('x1'));
                        var x2 = Number(elem.getAttribute('x2'));
                        var y1 = Number(elem.getAttribute('y1'));
                        var y2 = Number(elem.getAttribute('y2'));
                        var _elem = elem,
                            id = _elem.id;
                        var midPt = ' ' + (x1 + x2) / 2 + ',' + (y1 + y2) / 2 + ' ';
                        var pline = addElem({
                          element: 'polyline',
                          attr: {
                            points: x1 + ',' + y1 + midPt + x2 + ',' + y2,
                            stroke: elem.getAttribute('stroke'),
                            'stroke-width': elem.getAttribute('stroke-width'),
                            'marker-mid': mid,
                            fill: 'none',
                            opacity: elem.getAttribute('opacity') || 1
                          }
                        });
                        $(elem).after(pline).remove();
                        svgCanvas.clearSelection();
                        pline.id = id;
                        svgCanvas.addToSelection([pline]);
                        elem = pline;
                      }
                    } // Update line if it's a connector


                    if (elem.getAttribute('class') === connSel.substr(1)) {
                      var _start = getElem(elData(elem, 'c_start'));

                      updateConnectors([_start]);
                    } else {
                      updateConnectors();
                    }
                  },
                  IDsUpdated: function IDsUpdated(input) {
                    var remove = [];
                    input.elems.forEach(function (elem) {
                      if ('se:connector' in elem.attr) {
                        elem.attr['se:connector'] = elem.attr['se:connector'].split(' ').map(function (oldID) {
                          return input.changes[oldID];
                        }).join(' '); // Check validity - the field would be something like 'svg_21 svg_22', but
                        // if one end is missing, it would be 'svg_21' and therefore fail this test

                        if (!/. ./.test(elem.attr['se:connector'])) {
                          remove.push(elem.attr.id);
                        }
                      }
                    });
                    return {
                      remove: remove
                    };
                  },
                  toolButtonStateUpdate: function toolButtonStateUpdate(opts) {
                    if (opts.nostroke) {
                      if ($('#mode_connect').hasClass('tool_button_current')) {
                        svgEditor.clickSelect();
                      }
                    }

                    $('#mode_connect').toggleClass('disabled', opts.nostroke);
                  }
                });

              case 20:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function init(_x) {
        return _init.apply(this, arguments);
      };
    }()
  };

  return extConnector;

}());
