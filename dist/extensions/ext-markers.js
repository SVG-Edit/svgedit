var svgEditorExtension_markers = (function () {
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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _wrapRegExp(re, groups) {
    _wrapRegExp = function (re, groups) {
      return new BabelRegExp(re, groups);
    };

    var _RegExp = _wrapNativeSuper(RegExp);

    var _super = RegExp.prototype;

    var _groups = new WeakMap();

    function BabelRegExp(re, groups) {
      var _this = _RegExp.call(this, re);

      _groups.set(_this, groups);

      return _this;
    }

    _inherits(BabelRegExp, _RegExp);

    BabelRegExp.prototype.exec = function (str) {
      var result = _super.exec.call(this, str);

      if (result) result.groups = buildGroups(result, this);
      return result;
    };

    BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
      if (typeof substitution === "string") {
        var groups = _groups.get(this);

        return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
          return "$" + groups[name];
        }));
      } else if (typeof substitution === "function") {
        var _this = this;

        return _super[Symbol.replace].call(this, str, function () {
          var args = [];
          args.push.apply(args, arguments);

          if (typeof args[args.length - 1] !== "object") {
            args.push(buildGroups(args, _this));
          }

          return substitution.apply(this, args);
        });
      } else {
        return _super[Symbol.replace].call(this, str, substitution);
      }
    };

    function buildGroups(result, re) {
      var g = _groups.get(re);

      return Object.keys(g).reduce(function (groups, name) {
        groups[name] = result[g[name]];
        return groups;
      }, Object.create(null));
    }

    return _wrapRegExp.apply(this, arguments);
  }

  /**
   * ext-markers.js
   *
   * @license Apache-2.0
   *
   * @copyright 2010 Will Schleter based on ext-arrows.js by Copyright(c) 2010 Alexis Deveria
   *
   * This extension provides for the addition of markers to the either end
   * or the middle of a line, polyline, path, polygon.
   *
   * Markers may be either a graphic or arbitary text
   *
   * to simplify the coding and make the implementation as robust as possible,
   * markers are not shared - every object has its own set of markers.
   * this relationship is maintained by a naming convention between the
   * ids of the markers and the ids of the object
   *
   * The following restrictions exist for simplicty of use and programming
   *    objects and their markers to have the same color
   *    marker size is fixed
   *    text marker font, size, and attributes are fixed
   *    an application specific attribute - se_type - is added to each marker element
   *        to store the type of marker
   *
   * @todo
   *    remove some of the restrictions above
   *    add option for keeping text aligned to horizontal
   *    add support for dimension extension lines
   *
  */
  var extMarkers = {
    name: 'markers',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(S) {
        var strings, svgEditor, $, svgCanvas, addElem, mtypes, markerPrefix, idPrefix, markerTypes, getLinked, setIcon, selElems, showPanel, addMarker, convertline, setMarker, colorChanged, updateReferences, triggerTextEntry, showTextPrompt, _showTextPrompt, setArrowFromButton, _setArrowFromButton, getTitle, buildButtonList, contextTools;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                buildButtonList = function _ref16() {
                  var buttons = []; // const i = 0;

                  /*
                  buttons.push({
                    id: idPrefix + 'markers_off',
                    title: 'Turn off all markers',
                    type: 'context',
                    events: { click: setMarkerSet },
                    panel: 'marker_panel'
                  });
                  buttons.push({
                    id: idPrefix + 'markers_dimension',
                    title: 'Dimension',
                    type: 'context',
                    events: { click: setMarkerSet },
                    panel: 'marker_panel'
                  });
                  buttons.push({
                    id: idPrefix + 'markers_label',
                    title: 'Label',
                    type: 'context',
                    events: { click: setMarkerSet },
                    panel: 'marker_panel'
                  });
                  */

                  $.each(mtypes, function (k, pos) {
                    var listname = pos + '_marker_list';
                    var def = true;
                    Object.keys(markerTypes).forEach(function (id) {
                      var title = getTitle(String(id));
                      buttons.push({
                        id: idPrefix + pos + '_' + id,
                        svgicon: id,
                        icon: svgEditor.curConfig.extIconsPath + 'markers-' + id + '.png',
                        title: title,
                        type: 'context',
                        events: {
                          click: setArrowFromButton
                        },
                        panel: 'marker_panel',
                        list: listname,
                        isDefault: def
                      });
                      def = false;
                    });
                  });
                  return buttons;
                };

                getTitle = function _ref15(id) {
                  var langList = strings.langList;
                  var item = langList.find(function (itm) {
                    return itm.id === id;
                  });
                  return item ? item.title : id;
                };

                _setArrowFromButton = function _ref14() {
                  _setArrowFromButton = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2(ev) {
                    var parts, pos, val;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            parts = this.id.split('_');
                            pos = parts[1];
                            val = parts[2];

                            if (parts[3]) {
                              val += '_' + parts[3];
                            }

                            if (!(val !== 'textmarker')) {
                              _context2.next = 8;
                              break;
                            }

                            triggerTextEntry(pos, '\\' + val);
                            _context2.next = 10;
                            break;

                          case 8:
                            _context2.next = 10;
                            return showTextPrompt(pos);

                          case 10:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));
                  return _setArrowFromButton.apply(this, arguments);
                };

                setArrowFromButton = function _ref13(_x3) {
                  return _setArrowFromButton.apply(this, arguments);
                };

                _showTextPrompt = function _ref12() {
                  _showTextPrompt = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee(pos) {
                    var def, txt;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            def = $('#' + pos + '_marker').val();

                            if (def.substr(0, 1) === '\\') {
                              def = '';
                            }

                            _context.next = 4;
                            return $.prompt('Enter text for ' + pos + ' marker', def);

                          case 4:
                            txt = _context.sent;

                            if (txt) {
                              triggerTextEntry(pos, txt);
                            }

                          case 6:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));
                  return _showTextPrompt.apply(this, arguments);
                };

                showTextPrompt = function _ref11(_x2) {
                  return _showTextPrompt.apply(this, arguments);
                };

                triggerTextEntry = function _ref10(pos, val) {
                  $('#' + pos + '_marker').val(val);
                  $('#' + pos + '_marker').change(); // const txtbox = $('#'+pos+'_marker');
                  // if (val.substr(0,1)=='\\') {txtbox.hide();}
                  // else {txtbox.show();}
                };

                updateReferences = function _ref9(el) {
                  $.each(mtypes, function (i, pos) {
                    var id = markerPrefix + pos + '_' + el.id;
                    var markerName = 'marker-' + pos;
                    var marker = getLinked(el, markerName);

                    if (!marker || !marker.attributes.se_type) {
                      return;
                    } // not created by this extension


                    var url = el.getAttribute(markerName);

                    if (url) {
                      var len = el.id.length;
                      var linkid = url.substr(-len - 1, len);

                      if (el.id !== linkid) {
                        var val = $('#' + pos + '_marker').attr('value');
                        addMarker(id, val);
                        svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');

                        if (el.tagName === 'line' && pos === 'mid') {
                          el = convertline(el);
                        }

                        svgCanvas.call('changed', selElems);
                      }
                    }
                  });
                };

                colorChanged = function _ref8(elem) {
                  var color = elem.getAttribute('stroke');
                  $.each(mtypes, function (i, pos) {
                    var marker = getLinked(elem, 'marker-' + pos);

                    if (!marker) {
                      return;
                    }

                    if (!marker.attributes.se_type) {
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
                  });
                };

                setMarker = function _ref7() {
                  var poslist = {
                    start_marker: 'start',
                    mid_marker: 'mid',
                    end_marker: 'end'
                  };
                  var pos = poslist[this.id];
                  var markerName = 'marker-' + pos;
                  var el = selElems[0];
                  var marker = getLinked(el, markerName);

                  if (marker) {
                    $(marker).remove();
                  }

                  el.removeAttribute(markerName);
                  var val = this.value;

                  if (val === '') {
                    val = '\\nomarker';
                  }

                  if (val === '\\nomarker') {
                    setIcon(pos, val);
                    svgCanvas.call('changed', selElems);
                    return;
                  } // Set marker on element


                  var id = markerPrefix + pos + '_' + el.id;
                  addMarker(id, val);
                  svgCanvas.changeSelectedAttribute(markerName, 'url(#' + id + ')');

                  if (el.tagName === 'line' && pos === 'mid') {
                    convertline(el);
                  }

                  svgCanvas.call('changed', selElems);
                  setIcon(pos, val);
                };

                convertline = function _ref6(elem) {
                  // this routine came from the connectors extension
                  // it is needed because midpoint markers don't work with line elements
                  if (elem.tagName !== 'line') {
                    return elem;
                  } // Convert to polyline to accept mid-arrow


                  var x1 = Number(elem.getAttribute('x1'));
                  var x2 = Number(elem.getAttribute('x2'));
                  var y1 = Number(elem.getAttribute('y1'));
                  var y2 = Number(elem.getAttribute('y2'));
                  var id = elem.id;
                  var midPt = ' ' + (x1 + x2) / 2 + ',' + (y1 + y2) / 2 + ' ';
                  var pline = addElem({
                    element: 'polyline',
                    attr: {
                      points: x1 + ',' + y1 + midPt + x2 + ',' + y2,
                      stroke: elem.getAttribute('stroke'),
                      'stroke-width': elem.getAttribute('stroke-width'),
                      fill: 'none',
                      opacity: elem.getAttribute('opacity') || 1
                    }
                  });
                  $.each(mtypes, function (i, pos) {
                    // get any existing marker definitions
                    var nam = 'marker-' + pos;
                    var m = elem.getAttribute(nam);

                    if (m) {
                      pline.setAttribute(nam, elem.getAttribute(nam));
                    }
                  });
                  var batchCmd = new S.BatchCommand();
                  batchCmd.addSubCommand(new S.RemoveElementCommand(elem, elem.parentNode));
                  batchCmd.addSubCommand(new S.InsertElementCommand(pline));
                  $(elem).after(pline).remove();
                  svgCanvas.clearSelection();
                  pline.id = id;
                  svgCanvas.addToSelection([pline]);
                  S.addCommandToHistory(batchCmd);
                  return pline;
                };

                addMarker = function _ref5(id, val) {
                  var txtBoxBg = '#ffffff';
                  var txtBoxBorder = 'none';
                  var txtBoxStrokeWidth = 0;
                  var marker = svgCanvas.getElem(id);

                  if (marker) {
                    return undefined;
                  }

                  if (val === '' || val === '\\nomarker') {
                    return undefined;
                  }

                  var el = selElems[0];
                  var color = el.getAttribute('stroke'); // NOTE: Safari didn't like a negative value in viewBox
                  // so we use a standardized 0 0 100 100
                  // with 50 50 being mapped to the marker position

                  var strokeWidth = 10;
                  var refX = 50;
                  var refY = 50;
                  var viewBox = '0 0 100 100';
                  var markerWidth = 5;
                  var markerHeight = 5;
                  var seType;

                  if (val.substr(0, 1) === '\\') {
                    seType = val.substr(1);
                  } else {
                    seType = 'textmarker';
                  }

                  if (!markerTypes[seType]) {
                    return undefined;
                  } // an unknown type!
                  // create a generic marker


                  marker = addElem({
                    element: 'marker',
                    attr: {
                      id: id,
                      markerUnits: 'strokeWidth',
                      orient: 'auto',
                      style: 'pointer-events:none',
                      se_type: seType
                    }
                  });

                  if (seType !== 'textmarker') {
                    var mel = addElem(markerTypes[seType]);
                    var fillcolor = seType.substr(-2) === '_o' ? 'none' : color;
                    mel.setAttribute('fill', fillcolor);
                    mel.setAttribute('stroke', color);
                    mel.setAttribute('stroke-width', strokeWidth);
                    marker.append(mel);
                  } else {
                    var text = addElem(markerTypes[seType]); // have to add text to get bounding box

                    text.textContent = val;
                    var tb = text.getBBox(); // alert(tb.x + ' ' + tb.y + ' ' + tb.width + ' ' + tb.height);

                    var pad = 1;
                    var bb = tb;
                    bb.x = 0;
                    bb.y = 0;
                    bb.width += pad * 2;
                    bb.height += pad * 2; // shift text according to its size

                    text.setAttribute('x', pad);
                    text.setAttribute('y', bb.height - pad - tb.height / 4); // kludge?

                    text.setAttribute('fill', color);
                    refX = bb.width / 2 + pad;
                    refY = bb.height / 2 + pad;
                    viewBox = bb.x + ' ' + bb.y + ' ' + bb.width + ' ' + bb.height;
                    markerWidth = bb.width / 10;
                    markerHeight = bb.height / 10;
                    var box = addElem({
                      element: 'rect',
                      attr: {
                        x: bb.x,
                        y: bb.y,
                        width: bb.width,
                        height: bb.height,
                        fill: txtBoxBg,
                        stroke: txtBoxBorder,
                        'stroke-width': txtBoxStrokeWidth
                      }
                    });
                    marker.setAttribute('orient', 0);
                    marker.append(box, text);
                  }

                  marker.setAttribute('viewBox', viewBox);
                  marker.setAttribute('markerWidth', markerWidth);
                  marker.setAttribute('markerHeight', markerHeight);
                  marker.setAttribute('refX', refX);
                  marker.setAttribute('refY', refY);
                  svgCanvas.findDefs().append(marker);
                  return marker;
                };

                showPanel = function _ref4(on) {
                  $('#marker_panel').toggle(on);

                  if (on) {
                    var el = selElems[0];
                    var val, ci;
                    $.each(mtypes, function (i, pos) {
                      var m = getLinked(el, 'marker-' + pos);
                      var txtbox = $('#' + pos + '_marker');

                      if (!m) {
                        val = '\\nomarker';
                        ci = val;
                        txtbox.hide(); // hide text box
                      } else {
                        if (!m.attributes.se_type) {
                          return;
                        } // not created by this extension


                        val = '\\' + m.attributes.se_type.textContent;
                        ci = val;

                        if (val === '\\textmarker') {
                          val = m.lastChild.textContent; // txtbox.show(); // show text box
                        } else {
                          txtbox.hide(); // hide text box
                        }
                      }

                      txtbox.val(val);
                      setIcon(pos, ci);
                    });
                  }
                };

                setIcon = function _ref3(pos, id) {
                  if (id.substr(0, 1) !== '\\') {
                    id = '\\textmarker';
                  }

                  var ci = '#' + idPrefix + pos + '_' + id.substr(1);
                  svgEditor.setIcon('#cur_' + pos + '_marker_list', $(ci).children());
                  $(ci).addClass('current').siblings().removeClass('current');
                };

                getLinked = function _ref2(elem, attr) {
                  var str = elem.getAttribute(attr);

                  if (!str) {
                    return null;
                  }

                  var m = str.match(_wrapRegExp(/\(#(.+)\)/, {
                    id: 1
                  }));

                  if (!m || !m.groups.id) {
                    return null;
                  }

                  return svgCanvas.getElem(m.groups.id);
                };

                _context3.next = 17;
                return S.importLocale();

              case 17:
                strings = _context3.sent;
                svgEditor = this;
                $ = S.$;
                svgCanvas = svgEditor.canvas;
                addElem = svgCanvas.addSVGElementFromJson;
                mtypes = ['start', 'mid', 'end'];
                markerPrefix = 'se_marker_';
                idPrefix = 'mkr_'; // note - to add additional marker types add them below with a unique id
                // and add the associated icon(s) to marker-icons.svg
                // the geometry is normalized to a 100x100 box with the origin at lower left
                // Safari did not like negative values for low left of viewBox
                // remember that the coordinate system has +y downward

                markerTypes = {
                  nomarker: {},
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
                  textmarker: {
                    element: 'text',
                    attr: {
                      x: 0,
                      y: 0,
                      'stroke-width': 0,
                      stroke: 'none',
                      'font-size': 75,
                      'font-family': 'serif',
                      'text-anchor': 'left',
                      'xml:space': 'preserve'
                    }
                  },
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
                  xmark: {
                    element: 'path',
                    attr: {
                      d: 'M20,80 L80,20 M80,80 L20,20'
                    }
                  },
                  triangle: {
                    element: 'path',
                    attr: {
                      d: 'M10,80 L50,20 L80,80 Z'
                    }
                  },
                  mcircle: {
                    element: 'circle',
                    attr: {
                      r: 30,
                      cx: 50,
                      cy: 50
                    }
                  }
                }; // duplicate shapes to support unfilled (open) marker types with an _o suffix

                ['leftarrow', 'rightarrow', 'box', 'star', 'mcircle', 'triangle'].forEach(function (v) {
                  markerTypes[v + '_o'] = markerTypes[v];
                });
                /**
                * @param {Element} elem - A graphic element will have an attribute like marker-start
                * @param {"marker-start"|"marker-mid"|"marker-end"} attr
                * @returns {Element} The marker element that is linked to the graphic element
                */

                contextTools = [{
                  type: 'input',
                  panel: 'marker_panel',
                  id: 'start_marker',
                  size: 3,
                  events: {
                    change: setMarker
                  }
                }, {
                  type: 'button-select',
                  panel: 'marker_panel',
                  id: 'start_marker_list',
                  colnum: 3,
                  events: {
                    change: setArrowFromButton
                  }
                }, {
                  type: 'input',
                  panel: 'marker_panel',
                  id: 'mid_marker',
                  defval: '',
                  size: 3,
                  events: {
                    change: setMarker
                  }
                }, {
                  type: 'button-select',
                  panel: 'marker_panel',
                  id: 'mid_marker_list',
                  colnum: 3,
                  events: {
                    change: setArrowFromButton
                  }
                }, {
                  type: 'input',
                  panel: 'marker_panel',
                  id: 'end_marker',
                  size: 3,
                  events: {
                    change: setMarker
                  }
                }, {
                  type: 'button-select',
                  panel: 'marker_panel',
                  id: 'end_marker_list',
                  colnum: 3,
                  events: {
                    change: setArrowFromButton
                  }
                }];
                return _context3.abrupt("return", {
                  name: strings.name,
                  svgicons: svgEditor.curConfig.extIconsPath + 'markers-icons.xml',
                  callback: function callback() {
                    $('#marker_panel').addClass('toolset').hide();
                  },

                  /* async */
                  addLangData: function addLangData(_ref) {
                    var importLocale = _ref.importLocale,
                        lang = _ref.lang;
                    return {
                      data: strings.langList
                    };
                  },
                  selectedChanged: function selectedChanged(opts) {
                    // Use this to update the current selected elements
                    // console.log('selectChanged',opts);
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
                    // console.log('elementChanged',opts);
                    var elem = opts.elems[0];

                    if (elem && (elem.getAttribute('marker-start') || elem.getAttribute('marker-mid') || elem.getAttribute('marker-end'))) {
                      colorChanged(elem);
                      updateReferences(elem);
                    } // changing_flag = false; // Not apparently in use

                  },
                  buttons: buildButtonList(),
                  context_tools: strings.contextTools.map(function (contextTool, i) {
                    return Object.assign(contextTools[i], contextTool);
                  })
                });

              case 29:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function init(_x) {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  };

  return extMarkers;

}());
