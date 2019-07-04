var svgEditorExtension_arrows = (function () {
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
   * ext-arrows.js
   *
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria
   *
   */
  var extArrows = {
    name: 'arrows',
    init: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(S) {
        var strings, svgEditor, svgCanvas, addElem, nonce, $, prefix, selElems, arrowprefix, randomizeIds, setArrowNonce, unsetArrowNonce, pathdata, getLinked, showPanel, resetMarker, addMarker, setArrow, colorChanged, contextTools;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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

                  var m = str.match(_wrapRegExp(/\(#(.+)\)/, {
                    id: 1
                  }));

                  if (!m || !m.groups.id) {
                    return null;
                  }

                  return svgCanvas.getElem(m.groups.id);
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
                return S.importLocale();

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
                  addLangData: function () {
                    var _addLangData = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee(_ref) {
                      var lang, importLocale, _ref2, langList;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              lang = _ref.lang, importLocale = _ref.importLocale;
                              _context.next = 3;
                              return importLocale();

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
                      }, _callee);
                    }));

                    function addLangData(_x2) {
                      return _addLangData.apply(this, arguments);
                    }

                    return addLangData;
                  }(),
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
        }, _callee2, this);
      }));

      function init(_x) {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  };

  return extArrows;

}());
