var svgEditorExtension_arrows = (function () {
  'use strict';

  /**
   * ext-arrows.js
   *
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria
   *
   */
  var extArrows = {
    name: 'arrows',
    init: function init(S) {
      var strings, svgEditor, svgCanvas, addElem, nonce, $, prefix, selElems, arrowprefix, randomizeIds, setArrowNonce, unsetArrowNonce, pathdata, getLinked, showPanel, resetMarker, addMarker, setArrow, colorChanged, contextTools;
      return regeneratorRuntime.async(function init$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              colorChanged = function _ref10(elem) {
                var color = elem.getAttribute('stroke');
                var mtypes = ['start', 'mid', 'end'];
                var defs = svgCanvas.findDefs();
                $.each(mtypes, function (i, type) {
                  var marker = getLinked(elem, 'marker-' + type);

                  if (!marker) {
                    return;
                  }

                  var curColor = $(marker).children().attr('fill');
                  var curD = $(marker).children().attr('d');

                  if (curColor === color) {
                    return;
                  }

                  var allMarkers = $(defs).find('marker');
                  var newMarker = null; // Different color, check if already made

                  allMarkers.each(function () {
                    var attrs = $(this).children().attr(['fill', 'd']);

                    if (attrs.fill === color && attrs.d === curD) {
                      // Found another marker with this color and this path
                      newMarker = this; // eslint-disable-line consistent-this
                    }
                  });

                  if (!newMarker) {
                    // Create a new marker with this color
                    var lastId = marker.id;
                    var dir = lastId.includes('_fw') ? 'fw' : 'bk';
                    newMarker = addMarker(dir, type, arrowprefix + dir + allMarkers.length);
                    $(newMarker).children().attr('fill', color);
                  }

                  $(elem).attr('marker-' + type, 'url(#' + newMarker.id + ')'); // Check if last marker can be removed

                  var remove = true;
                  $(S.svgcontent).find('line, polyline, path, polygon').each(function () {
                    var element = this; // eslint-disable-line consistent-this

                    $.each(mtypes, function (j, mtype) {
                      if ($(element).attr('marker-' + mtype) === 'url(#' + marker.id + ')') {
                        remove = false;
                        return remove;
                      }

                      return undefined;
                    });

                    if (!remove) {
                      return false;
                    }

                    return undefined;
                  }); // Not found, so can safely remove

                  if (remove) {
                    $(marker).remove();
                  }
                });
              };

              setArrow = function _ref9() {
                resetMarker();
                var type = this.value;

                if (type === 'none') {
                  return;
                } // Set marker on element


                var dir = 'fw';

                if (type === 'mid_bk') {
                  type = 'mid';
                  dir = 'bk';
                } else if (type === 'both') {
                  addMarker('bk', type);
                  svgCanvas.changeSelectedAttribute('marker-start', 'url(#' + pathdata.bk.id + ')');
                  type = 'end';
                  dir = 'fw';
                } else if (type === 'start') {
                  dir = 'bk';
                }

                addMarker(dir, type);
                svgCanvas.changeSelectedAttribute('marker-' + type, 'url(#' + pathdata[dir].id + ')');
                svgCanvas.call('changed', selElems);
              };

              addMarker = function _ref8(dir, type, id) {
                // TODO: Make marker (or use?) per arrow type, since refX can be different
                id = id || arrowprefix + dir;
                var data = pathdata[dir];

                if (type === 'mid') {
                  data.refx = 5;
                }

                var marker = svgCanvas.getElem(id);

                if (!marker) {
                  marker = addElem({
                    element: 'marker',
                    attr: {
                      viewBox: '0 0 10 10',
                      id: id,
                      refY: 5,
                      markerUnits: 'strokeWidth',
                      markerWidth: 5,
                      markerHeight: 5,
                      orient: 'auto',
                      style: 'pointer-events:none' // Currently needed for Opera

                    }
                  });
                  var arrow = addElem({
                    element: 'path',
                    attr: {
                      d: data.d,
                      fill: '#000000'
                    }
                  });
                  marker.append(arrow);
                  svgCanvas.findDefs().append(marker);
                }

                marker.setAttribute('refX', data.refx);
                return marker;
              };

              resetMarker = function _ref7() {
                var el = selElems[0];
                el.removeAttribute('marker-start');
                el.removeAttribute('marker-mid');
                el.removeAttribute('marker-end');
              };

              showPanel = function _ref6(on) {
                $('#arrow_panel').toggle(on);

                if (on) {
                  var el = selElems[0];
                  var end = el.getAttribute('marker-end');
                  var start = el.getAttribute('marker-start');
                  var mid = el.getAttribute('marker-mid');
                  var val;

                  if (end && start) {
                    val = 'both';
                  } else if (end) {
                    val = 'end';
                  } else if (start) {
                    val = 'start';
                  } else if (mid) {
                    val = 'mid';

                    if (mid.includes('bk')) {
                      val = 'mid_bk';
                    }
                  }

                  if (!start && !mid && !end) {
                    val = 'none';
                  }

                  $('#arrow_list').val(val);
                }
              };

              getLinked = function _ref5(elem, attr) {
                var str = elem.getAttribute(attr);

                if (!str) {
                  return null;
                }

                var m = str.match(/\(#(.*)\)/); // const m = str.match(/\(#(?<id>.+)\)/);
                // if (!m || !m.groups.id) {

                if (!m || m.length !== 2) {
                  return null;
                }

                return svgCanvas.getElem(m[1]); // return svgCanvas.getElem(m.groups.id);
              };

              unsetArrowNonce = function _ref4(win) {
                randomizeIds = false;
                arrowprefix = prefix;
                pathdata.fw.id = arrowprefix + 'fw';
                pathdata.bk.id = arrowprefix + 'bk';
              };

              setArrowNonce = function _ref3(win, n) {
                randomizeIds = true;
                arrowprefix = prefix + n + '_';
                pathdata.fw.id = arrowprefix + 'fw';
                pathdata.bk.id = arrowprefix + 'bk';
              };

              _context2.next = 10;
              return regeneratorRuntime.awrap(S.importLocale());

            case 10:
              strings = _context2.sent;
              svgEditor = this;
              svgCanvas = svgEditor.canvas;
              // {svgcontent} = S,
              addElem = svgCanvas.addSVGElementFromJson, nonce = S.nonce, $ = S.$, prefix = 'se_arrow_';
              randomizeIds = S.randomize_ids;
              /**
              * @param {Window} win
              * @param {!(string|Integer)} n
              * @returns {void}
              */

              svgCanvas.bind('setnonce', setArrowNonce);
              svgCanvas.bind('unsetnonce', unsetArrowNonce);

              if (randomizeIds) {
                arrowprefix = prefix + nonce + '_';
              } else {
                arrowprefix = prefix;
              }

              pathdata = {
                fw: {
                  d: 'm0,0l10,5l-10,5l5,-5l-5,-5z',
                  refx: 8,
                  id: arrowprefix + 'fw'
                },
                bk: {
                  d: 'm10,0l-10,5l10,5l-5,-5l5,-5z',
                  refx: 2,
                  id: arrowprefix + 'bk'
                }
              };
              /**
               * Gets linked element.
               * @param {Element} elem
               * @param {string} attr
               * @returns {Element}
              */

              contextTools = [{
                type: 'select',
                panel: 'arrow_panel',
                id: 'arrow_list',
                defval: 'none',
                events: {
                  change: setArrow
                }
              }];
              return _context2.abrupt("return", {
                name: strings.name,
                context_tools: strings.contextTools.map(function (contextTool, i) {
                  return Object.assign(contextTools[i], contextTool);
                }),
                callback: function callback() {
                  $('#arrow_panel').hide(); // Set ID so it can be translated in locale file

                  $('#arrow_list option')[0].id = 'connector_no_arrow';
                },
                addLangData: function addLangData(_ref) {
                  var lang, importLocale, _ref2, langList;

                  return regeneratorRuntime.async(function addLangData$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          lang = _ref.lang, importLocale = _ref.importLocale;
                          _context.next = 3;
                          return regeneratorRuntime.awrap(importLocale());

                        case 3:
                          _ref2 = _context.sent;
                          langList = _ref2.langList;
                          return _context.abrupt("return", {
                            data: langList
                          });

                        case 6:
                        case "end":
                          return _context.stop();
                      }
                    }
                  });
                },
                selectedChanged: function selectedChanged(opts) {
                  // Use this to update the current selected elements
                  selElems = opts.elems;
                  var markerElems = ['line', 'path', 'polyline', 'polygon'];
                  var i = selElems.length;

                  while (i--) {
                    var elem = selElems[i];

                    if (elem && markerElems.includes(elem.tagName)) {
                      if (opts.selectedElement && !opts.multiselected) {
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
                  var elem = opts.elems[0];

                  if (elem && (elem.getAttribute('marker-start') || elem.getAttribute('marker-mid') || elem.getAttribute('marker-end'))) {
                    // const start = elem.getAttribute('marker-start');
                    // const mid = elem.getAttribute('marker-mid');
                    // const end = elem.getAttribute('marker-end');
                    // Has marker, so see if it should match color
                    colorChanged(elem);
                  }
                }
              });

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  };

  return extArrows;

}());
