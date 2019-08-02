var SvgCanvas = (function () {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
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

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
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

  /* globals SVGPathSeg, SVGPathSegMovetoRel, SVGPathSegMovetoAbs,
      SVGPathSegMovetoRel, SVGPathSegLinetoRel, SVGPathSegLinetoAbs,
      SVGPathSegLinetoHorizontalRel, SVGPathSegLinetoHorizontalAbs,
      SVGPathSegLinetoVerticalRel, SVGPathSegLinetoVerticalAbs,
      SVGPathSegClosePath, SVGPathSegCurvetoCubicRel,
      SVGPathSegCurvetoCubicAbs, SVGPathSegCurvetoCubicSmoothRel,
      SVGPathSegCurvetoCubicSmoothAbs, SVGPathSegCurvetoQuadraticRel,
      SVGPathSegCurvetoQuadraticAbs, SVGPathSegCurvetoQuadraticSmoothRel,
      SVGPathSegCurvetoQuadraticSmoothAbs, SVGPathSegArcRel, SVGPathSegArcAbs */

  /**
  * SVGPathSeg API polyfill
  * https://github.com/progers/pathseg
  *
  * This is a drop-in replacement for the `SVGPathSeg` and `SVGPathSegList` APIs
  * that were removed from SVG2 ({@link https://lists.w3.org/Archives/Public/www-svg/2015Jun/0044.html}),
  * including the latest spec changes which were implemented in Firefox 43 and
  * Chrome 46.
  */

  /* eslint-disable no-shadow, class-methods-use-this */
  // Linting: We avoid `no-shadow` as ESLint thinks these are still available globals
  // Linting: We avoid `class-methods-use-this` as this is a polyfill that must
  //   follow the conventions
  (function () {
    if (!('SVGPathSeg' in window)) {
      // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSeg
      var _SVGPathSeg =
      /*#__PURE__*/
      function () {
        function _SVGPathSeg(type, typeAsLetter, owningPathSegList) {
          _classCallCheck(this, _SVGPathSeg);

          this.pathSegType = type;
          this.pathSegTypeAsLetter = typeAsLetter;
          this._owningPathSegList = owningPathSegList;
        } // Notify owning PathSegList on any changes so they can be synchronized back to the path element.


        _createClass(_SVGPathSeg, [{
          key: "_segmentChanged",
          value: function _segmentChanged() {
            if (this._owningPathSegList) {
              this._owningPathSegList.segmentChanged(this);
            }
          }
        }]);

        return _SVGPathSeg;
      }();

      _SVGPathSeg.prototype.classname = 'SVGPathSeg';
      _SVGPathSeg.PATHSEG_UNKNOWN = 0;
      _SVGPathSeg.PATHSEG_CLOSEPATH = 1;
      _SVGPathSeg.PATHSEG_MOVETO_ABS = 2;
      _SVGPathSeg.PATHSEG_MOVETO_REL = 3;
      _SVGPathSeg.PATHSEG_LINETO_ABS = 4;
      _SVGPathSeg.PATHSEG_LINETO_REL = 5;
      _SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS = 6;
      _SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL = 7;
      _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS = 8;
      _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL = 9;
      _SVGPathSeg.PATHSEG_ARC_ABS = 10;
      _SVGPathSeg.PATHSEG_ARC_REL = 11;
      _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS = 12;
      _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL = 13;
      _SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS = 14;
      _SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL = 15;
      _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS = 16;
      _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL = 17;
      _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
      _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;

      var _SVGPathSegClosePath =
      /*#__PURE__*/
      function (_SVGPathSeg2) {
        _inherits(_SVGPathSegClosePath, _SVGPathSeg2);

        function _SVGPathSegClosePath(owningPathSegList) {
          _classCallCheck(this, _SVGPathSegClosePath);

          return _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegClosePath).call(this, _SVGPathSeg.PATHSEG_CLOSEPATH, 'z', owningPathSegList));
        }

        _createClass(_SVGPathSegClosePath, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegClosePath]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegClosePath(undefined);
          }
        }]);

        return _SVGPathSegClosePath;
      }(_SVGPathSeg);

      var _SVGPathSegMovetoAbs =
      /*#__PURE__*/
      function (_SVGPathSeg3) {
        _inherits(_SVGPathSegMovetoAbs, _SVGPathSeg3);

        function _SVGPathSegMovetoAbs(owningPathSegList, x, y) {
          var _this;

          _classCallCheck(this, _SVGPathSegMovetoAbs);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegMovetoAbs).call(this, _SVGPathSeg.PATHSEG_MOVETO_ABS, 'M', owningPathSegList));
          _this._x = x;
          _this._y = y;
          return _this;
        }

        _createClass(_SVGPathSegMovetoAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegMovetoAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegMovetoAbs(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegMovetoAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegMovetoAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegMovetoRel =
      /*#__PURE__*/
      function (_SVGPathSeg4) {
        _inherits(_SVGPathSegMovetoRel, _SVGPathSeg4);

        function _SVGPathSegMovetoRel(owningPathSegList, x, y) {
          var _this2;

          _classCallCheck(this, _SVGPathSegMovetoRel);

          _this2 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegMovetoRel).call(this, _SVGPathSeg.PATHSEG_MOVETO_REL, 'm', owningPathSegList));
          _this2._x = x;
          _this2._y = y;
          return _this2;
        }

        _createClass(_SVGPathSegMovetoRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegMovetoRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegMovetoRel(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegMovetoRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegMovetoRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegLinetoAbs =
      /*#__PURE__*/
      function (_SVGPathSeg5) {
        _inherits(_SVGPathSegLinetoAbs, _SVGPathSeg5);

        function _SVGPathSegLinetoAbs(owningPathSegList, x, y) {
          var _this3;

          _classCallCheck(this, _SVGPathSegLinetoAbs);

          _this3 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoAbs).call(this, _SVGPathSeg.PATHSEG_LINETO_ABS, 'L', owningPathSegList));
          _this3._x = x;
          _this3._y = y;
          return _this3;
        }

        _createClass(_SVGPathSegLinetoAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoAbs(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegLinetoAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegLinetoAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegLinetoRel =
      /*#__PURE__*/
      function (_SVGPathSeg6) {
        _inherits(_SVGPathSegLinetoRel, _SVGPathSeg6);

        function _SVGPathSegLinetoRel(owningPathSegList, x, y) {
          var _this4;

          _classCallCheck(this, _SVGPathSegLinetoRel);

          _this4 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoRel).call(this, _SVGPathSeg.PATHSEG_LINETO_REL, 'l', owningPathSegList));
          _this4._x = x;
          _this4._y = y;
          return _this4;
        }

        _createClass(_SVGPathSegLinetoRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoRel(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegLinetoRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegLinetoRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoCubicAbs =
      /*#__PURE__*/
      function (_SVGPathSeg7) {
        _inherits(_SVGPathSegCurvetoCubicAbs, _SVGPathSeg7);

        function _SVGPathSegCurvetoCubicAbs(owningPathSegList, x, y, x1, y1, x2, y2) {
          var _this5;

          _classCallCheck(this, _SVGPathSegCurvetoCubicAbs);

          _this5 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoCubicAbs).call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS, 'C', owningPathSegList));
          _this5._x = x;
          _this5._y = y;
          _this5._x1 = x1;
          _this5._y1 = y1;
          _this5._x2 = x2;
          _this5._y2 = y2;
          return _this5;
        }

        _createClass(_SVGPathSegCurvetoCubicAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoCubicAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoCubicAbs(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2);
          }
        }]);

        return _SVGPathSegCurvetoCubicAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoCubicAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x1: {
          get: function get() {
            return this._x1;
          },
          set: function set(x1) {
            this._x1 = x1;

            this._segmentChanged();
          },
          enumerable: true
        },
        y1: {
          get: function get() {
            return this._y1;
          },
          set: function set(y1) {
            this._y1 = y1;

            this._segmentChanged();
          },
          enumerable: true
        },
        x2: {
          get: function get() {
            return this._x2;
          },
          set: function set(x2) {
            this._x2 = x2;

            this._segmentChanged();
          },
          enumerable: true
        },
        y2: {
          get: function get() {
            return this._y2;
          },
          set: function set(y2) {
            this._y2 = y2;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoCubicRel =
      /*#__PURE__*/
      function (_SVGPathSeg8) {
        _inherits(_SVGPathSegCurvetoCubicRel, _SVGPathSeg8);

        function _SVGPathSegCurvetoCubicRel(owningPathSegList, x, y, x1, y1, x2, y2) {
          var _this6;

          _classCallCheck(this, _SVGPathSegCurvetoCubicRel);

          _this6 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoCubicRel).call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL, 'c', owningPathSegList));
          _this6._x = x;
          _this6._y = y;
          _this6._x1 = x1;
          _this6._y1 = y1;
          _this6._x2 = x2;
          _this6._y2 = y2;
          return _this6;
        }

        _createClass(_SVGPathSegCurvetoCubicRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoCubicRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoCubicRel(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2);
          }
        }]);

        return _SVGPathSegCurvetoCubicRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoCubicRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x1: {
          get: function get() {
            return this._x1;
          },
          set: function set(x1) {
            this._x1 = x1;

            this._segmentChanged();
          },
          enumerable: true
        },
        y1: {
          get: function get() {
            return this._y1;
          },
          set: function set(y1) {
            this._y1 = y1;

            this._segmentChanged();
          },
          enumerable: true
        },
        x2: {
          get: function get() {
            return this._x2;
          },
          set: function set(x2) {
            this._x2 = x2;

            this._segmentChanged();
          },
          enumerable: true
        },
        y2: {
          get: function get() {
            return this._y2;
          },
          set: function set(y2) {
            this._y2 = y2;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoQuadraticAbs =
      /*#__PURE__*/
      function (_SVGPathSeg9) {
        _inherits(_SVGPathSegCurvetoQuadraticAbs, _SVGPathSeg9);

        function _SVGPathSegCurvetoQuadraticAbs(owningPathSegList, x, y, x1, y1) {
          var _this7;

          _classCallCheck(this, _SVGPathSegCurvetoQuadraticAbs);

          _this7 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoQuadraticAbs).call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS, 'Q', owningPathSegList));
          _this7._x = x;
          _this7._y = y;
          _this7._x1 = x1;
          _this7._y1 = y1;
          return _this7;
        }

        _createClass(_SVGPathSegCurvetoQuadraticAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoQuadraticAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoQuadraticAbs(undefined, this._x, this._y, this._x1, this._y1);
          }
        }]);

        return _SVGPathSegCurvetoQuadraticAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoQuadraticAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x1: {
          get: function get() {
            return this._x1;
          },
          set: function set(x1) {
            this._x1 = x1;

            this._segmentChanged();
          },
          enumerable: true
        },
        y1: {
          get: function get() {
            return this._y1;
          },
          set: function set(y1) {
            this._y1 = y1;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoQuadraticRel =
      /*#__PURE__*/
      function (_SVGPathSeg10) {
        _inherits(_SVGPathSegCurvetoQuadraticRel, _SVGPathSeg10);

        function _SVGPathSegCurvetoQuadraticRel(owningPathSegList, x, y, x1, y1) {
          var _this8;

          _classCallCheck(this, _SVGPathSegCurvetoQuadraticRel);

          _this8 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoQuadraticRel).call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL, 'q', owningPathSegList));
          _this8._x = x;
          _this8._y = y;
          _this8._x1 = x1;
          _this8._y1 = y1;
          return _this8;
        }

        _createClass(_SVGPathSegCurvetoQuadraticRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoQuadraticRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoQuadraticRel(undefined, this._x, this._y, this._x1, this._y1);
          }
        }]);

        return _SVGPathSegCurvetoQuadraticRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoQuadraticRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x1: {
          get: function get() {
            return this._x1;
          },
          set: function set(x1) {
            this._x1 = x1;

            this._segmentChanged();
          },
          enumerable: true
        },
        y1: {
          get: function get() {
            return this._y1;
          },
          set: function set(y1) {
            this._y1 = y1;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegArcAbs =
      /*#__PURE__*/
      function (_SVGPathSeg11) {
        _inherits(_SVGPathSegArcAbs, _SVGPathSeg11);

        function _SVGPathSegArcAbs(owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
          var _this9;

          _classCallCheck(this, _SVGPathSegArcAbs);

          _this9 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegArcAbs).call(this, _SVGPathSeg.PATHSEG_ARC_ABS, 'A', owningPathSegList));
          _this9._x = x;
          _this9._y = y;
          _this9._r1 = r1;
          _this9._r2 = r2;
          _this9._angle = angle;
          _this9._largeArcFlag = largeArcFlag;
          _this9._sweepFlag = sweepFlag;
          return _this9;
        }

        _createClass(_SVGPathSegArcAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegArcAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegArcAbs(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag);
          }
        }]);

        return _SVGPathSegArcAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegArcAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        r1: {
          get: function get() {
            return this._r1;
          },
          set: function set(r1) {
            this._r1 = r1;

            this._segmentChanged();
          },
          enumerable: true
        },
        r2: {
          get: function get() {
            return this._r2;
          },
          set: function set(r2) {
            this._r2 = r2;

            this._segmentChanged();
          },
          enumerable: true
        },
        angle: {
          get: function get() {
            return this._angle;
          },
          set: function set(angle) {
            this._angle = angle;

            this._segmentChanged();
          },
          enumerable: true
        },
        largeArcFlag: {
          get: function get() {
            return this._largeArcFlag;
          },
          set: function set(largeArcFlag) {
            this._largeArcFlag = largeArcFlag;

            this._segmentChanged();
          },
          enumerable: true
        },
        sweepFlag: {
          get: function get() {
            return this._sweepFlag;
          },
          set: function set(sweepFlag) {
            this._sweepFlag = sweepFlag;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegArcRel =
      /*#__PURE__*/
      function (_SVGPathSeg12) {
        _inherits(_SVGPathSegArcRel, _SVGPathSeg12);

        function _SVGPathSegArcRel(owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
          var _this10;

          _classCallCheck(this, _SVGPathSegArcRel);

          _this10 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegArcRel).call(this, _SVGPathSeg.PATHSEG_ARC_REL, 'a', owningPathSegList));
          _this10._x = x;
          _this10._y = y;
          _this10._r1 = r1;
          _this10._r2 = r2;
          _this10._angle = angle;
          _this10._largeArcFlag = largeArcFlag;
          _this10._sweepFlag = sweepFlag;
          return _this10;
        }

        _createClass(_SVGPathSegArcRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegArcRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegArcRel(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag);
          }
        }]);

        return _SVGPathSegArcRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegArcRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        r1: {
          get: function get() {
            return this._r1;
          },
          set: function set(r1) {
            this._r1 = r1;

            this._segmentChanged();
          },
          enumerable: true
        },
        r2: {
          get: function get() {
            return this._r2;
          },
          set: function set(r2) {
            this._r2 = r2;

            this._segmentChanged();
          },
          enumerable: true
        },
        angle: {
          get: function get() {
            return this._angle;
          },
          set: function set(angle) {
            this._angle = angle;

            this._segmentChanged();
          },
          enumerable: true
        },
        largeArcFlag: {
          get: function get() {
            return this._largeArcFlag;
          },
          set: function set(largeArcFlag) {
            this._largeArcFlag = largeArcFlag;

            this._segmentChanged();
          },
          enumerable: true
        },
        sweepFlag: {
          get: function get() {
            return this._sweepFlag;
          },
          set: function set(sweepFlag) {
            this._sweepFlag = sweepFlag;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegLinetoHorizontalAbs =
      /*#__PURE__*/
      function (_SVGPathSeg13) {
        _inherits(_SVGPathSegLinetoHorizontalAbs, _SVGPathSeg13);

        function _SVGPathSegLinetoHorizontalAbs(owningPathSegList, x) {
          var _this11;

          _classCallCheck(this, _SVGPathSegLinetoHorizontalAbs);

          _this11 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoHorizontalAbs).call(this, _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS, 'H', owningPathSegList));
          _this11._x = x;
          return _this11;
        }

        _createClass(_SVGPathSegLinetoHorizontalAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoHorizontalAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoHorizontalAbs(undefined, this._x);
          }
        }]);

        return _SVGPathSegLinetoHorizontalAbs;
      }(_SVGPathSeg);

      Object.defineProperty(_SVGPathSegLinetoHorizontalAbs.prototype, 'x', {
        get: function get() {
          return this._x;
        },
        set: function set(x) {
          this._x = x;

          this._segmentChanged();
        },
        enumerable: true
      });

      var _SVGPathSegLinetoHorizontalRel =
      /*#__PURE__*/
      function (_SVGPathSeg14) {
        _inherits(_SVGPathSegLinetoHorizontalRel, _SVGPathSeg14);

        function _SVGPathSegLinetoHorizontalRel(owningPathSegList, x) {
          var _this12;

          _classCallCheck(this, _SVGPathSegLinetoHorizontalRel);

          _this12 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoHorizontalRel).call(this, _SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL, 'h', owningPathSegList));
          _this12._x = x;
          return _this12;
        }

        _createClass(_SVGPathSegLinetoHorizontalRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoHorizontalRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoHorizontalRel(undefined, this._x);
          }
        }]);

        return _SVGPathSegLinetoHorizontalRel;
      }(_SVGPathSeg);

      Object.defineProperty(_SVGPathSegLinetoHorizontalRel.prototype, 'x', {
        get: function get() {
          return this._x;
        },
        set: function set(x) {
          this._x = x;

          this._segmentChanged();
        },
        enumerable: true
      });

      var _SVGPathSegLinetoVerticalAbs =
      /*#__PURE__*/
      function (_SVGPathSeg15) {
        _inherits(_SVGPathSegLinetoVerticalAbs, _SVGPathSeg15);

        function _SVGPathSegLinetoVerticalAbs(owningPathSegList, y) {
          var _this13;

          _classCallCheck(this, _SVGPathSegLinetoVerticalAbs);

          _this13 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoVerticalAbs).call(this, _SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS, 'V', owningPathSegList));
          _this13._y = y;
          return _this13;
        }

        _createClass(_SVGPathSegLinetoVerticalAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoVerticalAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoVerticalAbs(undefined, this._y);
          }
        }]);

        return _SVGPathSegLinetoVerticalAbs;
      }(_SVGPathSeg);

      Object.defineProperty(_SVGPathSegLinetoVerticalAbs.prototype, 'y', {
        get: function get() {
          return this._y;
        },
        set: function set(y) {
          this._y = y;

          this._segmentChanged();
        },
        enumerable: true
      });

      var _SVGPathSegLinetoVerticalRel =
      /*#__PURE__*/
      function (_SVGPathSeg16) {
        _inherits(_SVGPathSegLinetoVerticalRel, _SVGPathSeg16);

        function _SVGPathSegLinetoVerticalRel(owningPathSegList, y) {
          var _this14;

          _classCallCheck(this, _SVGPathSegLinetoVerticalRel);

          _this14 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegLinetoVerticalRel).call(this, _SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL, 'v', owningPathSegList));
          _this14._y = y;
          return _this14;
        }

        _createClass(_SVGPathSegLinetoVerticalRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegLinetoVerticalRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegLinetoVerticalRel(undefined, this._y);
          }
        }]);

        return _SVGPathSegLinetoVerticalRel;
      }(_SVGPathSeg);

      Object.defineProperty(_SVGPathSegLinetoVerticalRel.prototype, 'y', {
        get: function get() {
          return this._y;
        },
        set: function set(y) {
          this._y = y;

          this._segmentChanged();
        },
        enumerable: true
      });

      var _SVGPathSegCurvetoCubicSmoothAbs =
      /*#__PURE__*/
      function (_SVGPathSeg17) {
        _inherits(_SVGPathSegCurvetoCubicSmoothAbs, _SVGPathSeg17);

        function _SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, x, y, x2, y2) {
          var _this15;

          _classCallCheck(this, _SVGPathSegCurvetoCubicSmoothAbs);

          _this15 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoCubicSmoothAbs).call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS, 'S', owningPathSegList));
          _this15._x = x;
          _this15._y = y;
          _this15._x2 = x2;
          _this15._y2 = y2;
          return _this15;
        }

        _createClass(_SVGPathSegCurvetoCubicSmoothAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoCubicSmoothAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoCubicSmoothAbs(undefined, this._x, this._y, this._x2, this._y2);
          }
        }]);

        return _SVGPathSegCurvetoCubicSmoothAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoCubicSmoothAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x2: {
          get: function get() {
            return this._x2;
          },
          set: function set(x2) {
            this._x2 = x2;

            this._segmentChanged();
          },
          enumerable: true
        },
        y2: {
          get: function get() {
            return this._y2;
          },
          set: function set(y2) {
            this._y2 = y2;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoCubicSmoothRel =
      /*#__PURE__*/
      function (_SVGPathSeg18) {
        _inherits(_SVGPathSegCurvetoCubicSmoothRel, _SVGPathSeg18);

        function _SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, x, y, x2, y2) {
          var _this16;

          _classCallCheck(this, _SVGPathSegCurvetoCubicSmoothRel);

          _this16 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoCubicSmoothRel).call(this, _SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL, 's', owningPathSegList));
          _this16._x = x;
          _this16._y = y;
          _this16._x2 = x2;
          _this16._y2 = y2;
          return _this16;
        }

        _createClass(_SVGPathSegCurvetoCubicSmoothRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoCubicSmoothRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoCubicSmoothRel(undefined, this._x, this._y, this._x2, this._y2);
          }
        }]);

        return _SVGPathSegCurvetoCubicSmoothRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoCubicSmoothRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        },
        x2: {
          get: function get() {
            return this._x2;
          },
          set: function set(x2) {
            this._x2 = x2;

            this._segmentChanged();
          },
          enumerable: true
        },
        y2: {
          get: function get() {
            return this._y2;
          },
          set: function set(y2) {
            this._y2 = y2;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoQuadraticSmoothAbs =
      /*#__PURE__*/
      function (_SVGPathSeg19) {
        _inherits(_SVGPathSegCurvetoQuadraticSmoothAbs, _SVGPathSeg19);

        function _SVGPathSegCurvetoQuadraticSmoothAbs(owningPathSegList, x, y) {
          var _this17;

          _classCallCheck(this, _SVGPathSegCurvetoQuadraticSmoothAbs);

          _this17 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoQuadraticSmoothAbs).call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS, 'T', owningPathSegList));
          _this17._x = x;
          _this17._y = y;
          return _this17;
        }

        _createClass(_SVGPathSegCurvetoQuadraticSmoothAbs, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoQuadraticSmoothAbs]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoQuadraticSmoothAbs(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegCurvetoQuadraticSmoothAbs;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoQuadraticSmoothAbs.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      });

      var _SVGPathSegCurvetoQuadraticSmoothRel =
      /*#__PURE__*/
      function (_SVGPathSeg20) {
        _inherits(_SVGPathSegCurvetoQuadraticSmoothRel, _SVGPathSeg20);

        function _SVGPathSegCurvetoQuadraticSmoothRel(owningPathSegList, x, y) {
          var _this18;

          _classCallCheck(this, _SVGPathSegCurvetoQuadraticSmoothRel);

          _this18 = _possibleConstructorReturn(this, _getPrototypeOf(_SVGPathSegCurvetoQuadraticSmoothRel).call(this, _SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL, 't', owningPathSegList));
          _this18._x = x;
          _this18._y = y;
          return _this18;
        }

        _createClass(_SVGPathSegCurvetoQuadraticSmoothRel, [{
          key: "toString",
          value: function toString() {
            return '[object SVGPathSegCurvetoQuadraticSmoothRel]';
          }
        }, {
          key: "_asPathString",
          value: function _asPathString() {
            return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y;
          }
        }, {
          key: "clone",
          value: function clone() {
            return new _SVGPathSegCurvetoQuadraticSmoothRel(undefined, this._x, this._y);
          }
        }]);

        return _SVGPathSegCurvetoQuadraticSmoothRel;
      }(_SVGPathSeg);

      Object.defineProperties(_SVGPathSegCurvetoQuadraticSmoothRel.prototype, {
        x: {
          get: function get() {
            return this._x;
          },
          set: function set(x) {
            this._x = x;

            this._segmentChanged();
          },
          enumerable: true
        },
        y: {
          get: function get() {
            return this._y;
          },
          set: function set(y) {
            this._y = y;

            this._segmentChanged();
          },
          enumerable: true
        }
      }); // Add createSVGPathSeg* functions to SVGPathElement.
      // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathElement.

      SVGPathElement.prototype.createSVGPathSegClosePath = function () {
        return new _SVGPathSegClosePath(undefined);
      };

      SVGPathElement.prototype.createSVGPathSegMovetoAbs = function (x, y) {
        return new _SVGPathSegMovetoAbs(undefined, x, y);
      };

      SVGPathElement.prototype.createSVGPathSegMovetoRel = function (x, y) {
        return new _SVGPathSegMovetoRel(undefined, x, y);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoAbs = function (x, y) {
        return new _SVGPathSegLinetoAbs(undefined, x, y);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoRel = function (x, y) {
        return new _SVGPathSegLinetoRel(undefined, x, y);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoCubicAbs = function (x, y, x1, y1, x2, y2) {
        return new _SVGPathSegCurvetoCubicAbs(undefined, x, y, x1, y1, x2, y2);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoCubicRel = function (x, y, x1, y1, x2, y2) {
        return new _SVGPathSegCurvetoCubicRel(undefined, x, y, x1, y1, x2, y2);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticAbs = function (x, y, x1, y1) {
        return new _SVGPathSegCurvetoQuadraticAbs(undefined, x, y, x1, y1);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticRel = function (x, y, x1, y1) {
        return new _SVGPathSegCurvetoQuadraticRel(undefined, x, y, x1, y1);
      };

      SVGPathElement.prototype.createSVGPathSegArcAbs = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
        return new _SVGPathSegArcAbs(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
      };

      SVGPathElement.prototype.createSVGPathSegArcRel = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
        return new _SVGPathSegArcRel(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoHorizontalAbs = function (x) {
        return new _SVGPathSegLinetoHorizontalAbs(undefined, x);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoHorizontalRel = function (x) {
        return new _SVGPathSegLinetoHorizontalRel(undefined, x);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoVerticalAbs = function (y) {
        return new _SVGPathSegLinetoVerticalAbs(undefined, y);
      };

      SVGPathElement.prototype.createSVGPathSegLinetoVerticalRel = function (y) {
        return new _SVGPathSegLinetoVerticalRel(undefined, y);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothAbs = function (x, y, x2, y2) {
        return new _SVGPathSegCurvetoCubicSmoothAbs(undefined, x, y, x2, y2);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothRel = function (x, y, x2, y2) {
        return new _SVGPathSegCurvetoCubicSmoothRel(undefined, x, y, x2, y2);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothAbs = function (x, y) {
        return new _SVGPathSegCurvetoQuadraticSmoothAbs(undefined, x, y);
      };

      SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothRel = function (x, y) {
        return new _SVGPathSegCurvetoQuadraticSmoothRel(undefined, x, y);
      };

      if (!('getPathSegAtLength' in SVGPathElement.prototype)) {
        // Add getPathSegAtLength to SVGPathElement.
        // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-__svg__SVGPathElement__getPathSegAtLength
        // This polyfill requires SVGPathElement.getTotalLength to implement the distance-along-a-path algorithm.
        SVGPathElement.prototype.getPathSegAtLength = function (distance) {
          if (distance === undefined || !isFinite(distance)) {
            throw new Error('Invalid arguments.');
          }

          var measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          measurementElement.setAttribute('d', this.getAttribute('d'));
          var lastPathSegment = measurementElement.pathSegList.numberOfItems - 1; // If the path is empty, return 0.

          if (lastPathSegment <= 0) {
            return 0;
          }

          do {
            measurementElement.pathSegList.removeItem(lastPathSegment);

            if (distance > measurementElement.getTotalLength()) {
              break;
            }

            lastPathSegment--;
          } while (lastPathSegment > 0);

          return lastPathSegment;
        };
      }

      window.SVGPathSeg = _SVGPathSeg;
      window.SVGPathSegClosePath = _SVGPathSegClosePath;
      window.SVGPathSegMovetoAbs = _SVGPathSegMovetoAbs;
      window.SVGPathSegMovetoRel = _SVGPathSegMovetoRel;
      window.SVGPathSegLinetoAbs = _SVGPathSegLinetoAbs;
      window.SVGPathSegLinetoRel = _SVGPathSegLinetoRel;
      window.SVGPathSegCurvetoCubicAbs = _SVGPathSegCurvetoCubicAbs;
      window.SVGPathSegCurvetoCubicRel = _SVGPathSegCurvetoCubicRel;
      window.SVGPathSegCurvetoQuadraticAbs = _SVGPathSegCurvetoQuadraticAbs;
      window.SVGPathSegCurvetoQuadraticRel = _SVGPathSegCurvetoQuadraticRel;
      window.SVGPathSegArcAbs = _SVGPathSegArcAbs;
      window.SVGPathSegArcRel = _SVGPathSegArcRel;
      window.SVGPathSegLinetoHorizontalAbs = _SVGPathSegLinetoHorizontalAbs;
      window.SVGPathSegLinetoHorizontalRel = _SVGPathSegLinetoHorizontalRel;
      window.SVGPathSegLinetoVerticalAbs = _SVGPathSegLinetoVerticalAbs;
      window.SVGPathSegLinetoVerticalRel = _SVGPathSegLinetoVerticalRel;
      window.SVGPathSegCurvetoCubicSmoothAbs = _SVGPathSegCurvetoCubicSmoothAbs;
      window.SVGPathSegCurvetoCubicSmoothRel = _SVGPathSegCurvetoCubicSmoothRel;
      window.SVGPathSegCurvetoQuadraticSmoothAbs = _SVGPathSegCurvetoQuadraticSmoothAbs;
      window.SVGPathSegCurvetoQuadraticSmoothRel = _SVGPathSegCurvetoQuadraticSmoothRel;
    } // Checking for SVGPathSegList in window checks for the case of an implementation without the
    // SVGPathSegList API.
    // The second check for appendItem is specific to Firefox 59+ which removed only parts of the
    // SVGPathSegList API (e.g., appendItem). In this case we need to re-implement the entire API
    // so the polyfill data (i.e., _list) is used throughout.


    if (!('SVGPathSegList' in window) || !('appendItem' in window.SVGPathSegList.prototype)) {
      // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSegList
      var SVGPathSegList =
      /*#__PURE__*/
      function () {
        function SVGPathSegList(pathElement) {
          _classCallCheck(this, SVGPathSegList);

          this._pathElement = pathElement;
          this._list = this._parsePath(this._pathElement.getAttribute('d')); // Use a MutationObserver to catch changes to the path's "d" attribute.

          this._mutationObserverConfig = {
            attributes: true,
            attributeFilter: ['d']
          };
          this._pathElementMutationObserver = new MutationObserver(this._updateListFromPathMutations.bind(this));

          this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
        } // Process any pending mutations to the path element and update the list as needed.
        // This should be the first call of all public functions and is needed because
        // MutationObservers are not synchronous so we can have pending asynchronous mutations.


        _createClass(SVGPathSegList, [{
          key: "_checkPathSynchronizedToList",
          value: function _checkPathSynchronizedToList() {
            this._updateListFromPathMutations(this._pathElementMutationObserver.takeRecords());
          }
        }, {
          key: "_updateListFromPathMutations",
          value: function _updateListFromPathMutations(mutationRecords) {
            if (!this._pathElement) {
              return;
            }

            var hasPathMutations = false;
            mutationRecords.forEach(function (record) {
              if (record.attributeName === 'd') {
                hasPathMutations = true;
              }
            });

            if (hasPathMutations) {
              this._list = this._parsePath(this._pathElement.getAttribute('d'));
            }
          } // Serialize the list and update the path's 'd' attribute.

        }, {
          key: "_writeListToPath",
          value: function _writeListToPath() {
            this._pathElementMutationObserver.disconnect();

            this._pathElement.setAttribute('d', SVGPathSegList._pathSegArrayAsString(this._list));

            this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
          } // When a path segment changes the list needs to be synchronized back to the path element.

        }, {
          key: "segmentChanged",
          value: function segmentChanged(pathSeg) {
            this._writeListToPath();
          }
        }, {
          key: "clear",
          value: function clear() {
            this._checkPathSynchronizedToList();

            this._list.forEach(function (pathSeg) {
              pathSeg._owningPathSegList = null;
            });

            this._list = [];

            this._writeListToPath();
          }
        }, {
          key: "initialize",
          value: function initialize(newItem) {
            this._checkPathSynchronizedToList();

            this._list = [newItem];
            newItem._owningPathSegList = this;

            this._writeListToPath();

            return newItem;
          }
        }, {
          key: "_checkValidIndex",
          value: function _checkValidIndex(index) {
            if (isNaN(index) || index < 0 || index >= this.numberOfItems) {
              throw new Error('INDEX_SIZE_ERR');
            }
          }
        }, {
          key: "getItem",
          value: function getItem(index) {
            this._checkPathSynchronizedToList();

            this._checkValidIndex(index);

            return this._list[index];
          }
        }, {
          key: "insertItemBefore",
          value: function insertItemBefore(newItem, index) {
            this._checkPathSynchronizedToList(); // Spec: If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.


            if (index > this.numberOfItems) {
              index = this.numberOfItems;
            }

            if (newItem._owningPathSegList) {
              // SVG2 spec says to make a copy.
              newItem = newItem.clone();
            }

            this._list.splice(index, 0, newItem);

            newItem._owningPathSegList = this;

            this._writeListToPath();

            return newItem;
          }
        }, {
          key: "replaceItem",
          value: function replaceItem(newItem, index) {
            this._checkPathSynchronizedToList();

            if (newItem._owningPathSegList) {
              // SVG2 spec says to make a copy.
              newItem = newItem.clone();
            }

            this._checkValidIndex(index);

            this._list[index] = newItem;
            newItem._owningPathSegList = this;

            this._writeListToPath();

            return newItem;
          }
        }, {
          key: "removeItem",
          value: function removeItem(index) {
            this._checkPathSynchronizedToList();

            this._checkValidIndex(index);

            var item = this._list[index];

            this._list.splice(index, 1);

            this._writeListToPath();

            return item;
          }
        }, {
          key: "appendItem",
          value: function appendItem(newItem) {
            this._checkPathSynchronizedToList();

            if (newItem._owningPathSegList) {
              // SVG2 spec says to make a copy.
              newItem = newItem.clone();
            }

            this._list.push(newItem);

            newItem._owningPathSegList = this; // TODO: Optimize this to just append to the existing attribute.

            this._writeListToPath();

            return newItem;
          } // This closely follows SVGPathParser::parsePath from Source/core/svg/SVGPathParser.cpp.

        }, {
          key: "_parsePath",
          value: function _parsePath(string) {
            if (!string || !string.length) {
              return [];
            }

            var owningPathSegList = this; // eslint-disable-line consistent-this

            var Builder =
            /*#__PURE__*/
            function () {
              function Builder() {
                _classCallCheck(this, Builder);

                this.pathSegList = [];
              }

              _createClass(Builder, [{
                key: "appendSegment",
                value: function appendSegment(pathSeg) {
                  this.pathSegList.push(pathSeg);
                }
              }]);

              return Builder;
            }();

            var Source =
            /*#__PURE__*/
            function () {
              function Source(string) {
                _classCallCheck(this, Source);

                this._string = string;
                this._currentIndex = 0;
                this._endIndex = this._string.length;
                this._previousCommand = SVGPathSeg.PATHSEG_UNKNOWN;

                this._skipOptionalSpaces();
              }

              _createClass(Source, [{
                key: "_isCurrentSpace",
                value: function _isCurrentSpace() {
                  var character = this._string[this._currentIndex];
                  return character <= ' ' && (character === ' ' || character === '\n' || character === '\t' || character === '\r' || character === '\f');
                }
              }, {
                key: "_skipOptionalSpaces",
                value: function _skipOptionalSpaces() {
                  while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
                    this._currentIndex++;
                  }

                  return this._currentIndex < this._endIndex;
                }
              }, {
                key: "_skipOptionalSpacesOrDelimiter",
                value: function _skipOptionalSpacesOrDelimiter() {
                  if (this._currentIndex < this._endIndex && !this._isCurrentSpace() && this._string.charAt(this._currentIndex) !== ',') {
                    return false;
                  }

                  if (this._skipOptionalSpaces()) {
                    if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === ',') {
                      this._currentIndex++;

                      this._skipOptionalSpaces();
                    }
                  }

                  return this._currentIndex < this._endIndex;
                }
              }, {
                key: "hasMoreData",
                value: function hasMoreData() {
                  return this._currentIndex < this._endIndex;
                }
              }, {
                key: "peekSegmentType",
                value: function peekSegmentType() {
                  var lookahead = this._string[this._currentIndex];
                  return this._pathSegTypeFromChar(lookahead);
                }
              }, {
                key: "_pathSegTypeFromChar",
                value: function _pathSegTypeFromChar(lookahead) {
                  switch (lookahead) {
                    case 'Z':
                    case 'z':
                      return SVGPathSeg.PATHSEG_CLOSEPATH;

                    case 'M':
                      return SVGPathSeg.PATHSEG_MOVETO_ABS;

                    case 'm':
                      return SVGPathSeg.PATHSEG_MOVETO_REL;

                    case 'L':
                      return SVGPathSeg.PATHSEG_LINETO_ABS;

                    case 'l':
                      return SVGPathSeg.PATHSEG_LINETO_REL;

                    case 'C':
                      return SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS;

                    case 'c':
                      return SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL;

                    case 'Q':
                      return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS;

                    case 'q':
                      return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL;

                    case 'A':
                      return SVGPathSeg.PATHSEG_ARC_ABS;

                    case 'a':
                      return SVGPathSeg.PATHSEG_ARC_REL;

                    case 'H':
                      return SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS;

                    case 'h':
                      return SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL;

                    case 'V':
                      return SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS;

                    case 'v':
                      return SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL;

                    case 'S':
                      return SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS;

                    case 's':
                      return SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL;

                    case 'T':
                      return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS;

                    case 't':
                      return SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL;

                    default:
                      return SVGPathSeg.PATHSEG_UNKNOWN;
                  }
                }
              }, {
                key: "_nextCommandHelper",
                value: function _nextCommandHelper(lookahead, previousCommand) {
                  // Check for remaining coordinates in the current command.
                  if ((lookahead === '+' || lookahead === '-' || lookahead === '.' || lookahead >= '0' && lookahead <= '9') && previousCommand !== SVGPathSeg.PATHSEG_CLOSEPATH) {
                    if (previousCommand === SVGPathSeg.PATHSEG_MOVETO_ABS) {
                      return SVGPathSeg.PATHSEG_LINETO_ABS;
                    }

                    if (previousCommand === SVGPathSeg.PATHSEG_MOVETO_REL) {
                      return SVGPathSeg.PATHSEG_LINETO_REL;
                    }

                    return previousCommand;
                  }

                  return SVGPathSeg.PATHSEG_UNKNOWN;
                }
              }, {
                key: "initialCommandIsMoveTo",
                value: function initialCommandIsMoveTo() {
                  // If the path is empty it is still valid, so return true.
                  if (!this.hasMoreData()) {
                    return true;
                  }

                  var command = this.peekSegmentType(); // Path must start with moveTo.

                  return command === SVGPathSeg.PATHSEG_MOVETO_ABS || command === SVGPathSeg.PATHSEG_MOVETO_REL;
                } // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from Source/core/svg/SVGParserUtilities.cpp.
                // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF

              }, {
                key: "_parseNumber",
                value: function _parseNumber() {
                  var exponent = 0;
                  var integer = 0;
                  var frac = 1;
                  var decimal = 0;
                  var sign = 1;
                  var expsign = 1;
                  var startIndex = this._currentIndex;

                  this._skipOptionalSpaces(); // Read the sign.


                  if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '+') {
                    this._currentIndex++;
                  } else if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '-') {
                    this._currentIndex++;
                    sign = -1;
                  }

                  if (this._currentIndex === this._endIndex || (this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') && this._string.charAt(this._currentIndex) !== '.') {
                    // The first character of a number must be one of [0-9+-.].
                    return undefined;
                  } // Read the integer part, build right-to-left.


                  var startIntPartIndex = this._currentIndex;

                  while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                    this._currentIndex++; // Advance to first non-digit.
                  }

                  if (this._currentIndex !== startIntPartIndex) {
                    var scanIntPartIndex = this._currentIndex - 1;
                    var multiplier = 1;

                    while (scanIntPartIndex >= startIntPartIndex) {
                      integer += multiplier * (this._string.charAt(scanIntPartIndex--) - '0');
                      multiplier *= 10;
                    }
                  } // Read the decimals.


                  if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '.') {
                    this._currentIndex++; // There must be a least one digit following the .

                    if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
                      return undefined;
                    }

                    while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                      frac *= 10;
                      decimal += (this._string.charAt(this._currentIndex) - '0') / frac;
                      this._currentIndex += 1;
                    }
                  } // Read the exponent part.


                  if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string.charAt(this._currentIndex) === 'e' || this._string.charAt(this._currentIndex) === 'E') && this._string.charAt(this._currentIndex + 1) !== 'x' && this._string.charAt(this._currentIndex + 1) !== 'm') {
                    this._currentIndex++; // Read the sign of the exponent.

                    if (this._string.charAt(this._currentIndex) === '+') {
                      this._currentIndex++;
                    } else if (this._string.charAt(this._currentIndex) === '-') {
                      this._currentIndex++;
                      expsign = -1;
                    } // There must be an exponent.


                    if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
                      return undefined;
                    }

                    while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
                      exponent *= 10;
                      exponent += this._string.charAt(this._currentIndex) - '0';
                      this._currentIndex++;
                    }
                  }

                  var number = integer + decimal;
                  number *= sign;

                  if (exponent) {
                    number *= Math.pow(10, expsign * exponent);
                  }

                  if (startIndex === this._currentIndex) {
                    return undefined;
                  }

                  this._skipOptionalSpacesOrDelimiter();

                  return number;
                }
              }, {
                key: "_parseArcFlag",
                value: function _parseArcFlag() {
                  if (this._currentIndex >= this._endIndex) {
                    return undefined;
                  }

                  var flag = false;

                  var flagChar = this._string.charAt(this._currentIndex++);

                  if (flagChar === '0') {
                    flag = false;
                  } else if (flagChar === '1') {
                    flag = true;
                  } else {
                    return undefined;
                  }

                  this._skipOptionalSpacesOrDelimiter();

                  return flag;
                }
              }, {
                key: "parseSegment",
                value: function parseSegment() {
                  var lookahead = this._string[this._currentIndex];

                  var command = this._pathSegTypeFromChar(lookahead);

                  if (command === SVGPathSeg.PATHSEG_UNKNOWN) {
                    // Possibly an implicit command. Not allowed if this is the first command.
                    if (this._previousCommand === SVGPathSeg.PATHSEG_UNKNOWN) {
                      return null;
                    }

                    command = this._nextCommandHelper(lookahead, this._previousCommand);

                    if (command === SVGPathSeg.PATHSEG_UNKNOWN) {
                      return null;
                    }
                  } else {
                    this._currentIndex++;
                  }

                  this._previousCommand = command;

                  switch (command) {
                    case SVGPathSeg.PATHSEG_MOVETO_REL:
                      return new SVGPathSegMovetoRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_MOVETO_ABS:
                      return new SVGPathSegMovetoAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_REL:
                      return new SVGPathSegLinetoRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_ABS:
                      return new SVGPathSegLinetoAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
                      return new SVGPathSegLinetoHorizontalRel(owningPathSegList, this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
                      return new SVGPathSegLinetoHorizontalAbs(owningPathSegList, this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
                      return new SVGPathSegLinetoVerticalRel(owningPathSegList, this._parseNumber());

                    case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
                      return new SVGPathSegLinetoVerticalAbs(owningPathSegList, this._parseNumber());

                    case SVGPathSeg.PATHSEG_CLOSEPATH:
                      this._skipOptionalSpaces();

                      return new SVGPathSegClosePath(owningPathSegList);

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
                      {
                        var points = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicRel(owningPathSegList, points.x, points.y, points.x1, points.y1, points.x2, points.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
                      {
                        var _points = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicAbs(owningPathSegList, _points.x, _points.y, _points.x1, _points.y1, _points.x2, _points.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
                      {
                        var _points2 = {
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, _points2.x, _points2.y, _points2.x2, _points2.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
                      {
                        var _points3 = {
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, _points3.x, _points3.y, _points3.x2, _points3.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
                      {
                        var _points4 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoQuadraticRel(owningPathSegList, _points4.x, _points4.y, _points4.x1, _points4.y1);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
                      {
                        var _points5 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoQuadraticAbs(owningPathSegList, _points5.x, _points5.y, _points5.x1, _points5.y1);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
                      return new SVGPathSegCurvetoQuadraticSmoothRel(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
                      return new SVGPathSegCurvetoQuadraticSmoothAbs(owningPathSegList, this._parseNumber(), this._parseNumber());

                    case SVGPathSeg.PATHSEG_ARC_REL:
                      {
                        var _points6 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          arcAngle: this._parseNumber(),
                          arcLarge: this._parseArcFlag(),
                          arcSweep: this._parseArcFlag(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegArcRel(owningPathSegList, _points6.x, _points6.y, _points6.x1, _points6.y1, _points6.arcAngle, _points6.arcLarge, _points6.arcSweep);
                      }

                    case SVGPathSeg.PATHSEG_ARC_ABS:
                      {
                        var _points7 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          arcAngle: this._parseNumber(),
                          arcLarge: this._parseArcFlag(),
                          arcSweep: this._parseArcFlag(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegArcAbs(owningPathSegList, _points7.x, _points7.y, _points7.x1, _points7.y1, _points7.arcAngle, _points7.arcLarge, _points7.arcSweep);
                      }

                    default:
                      throw new Error('Unknown path seg type.');
                  }
                }
              }]);

              return Source;
            }();

            var builder = new Builder();
            var source = new Source(string);

            if (!source.initialCommandIsMoveTo()) {
              return [];
            }

            while (source.hasMoreData()) {
              var pathSeg = source.parseSegment();

              if (!pathSeg) {
                return [];
              }

              builder.appendSegment(pathSeg);
            }

            return builder.pathSegList;
          } // STATIC

        }], [{
          key: "_pathSegArrayAsString",
          value: function _pathSegArrayAsString(pathSegArray) {
            var string = '';
            var first = true;
            pathSegArray.forEach(function (pathSeg) {
              if (first) {
                first = false;
                string += pathSeg._asPathString();
              } else {
                string += ' ' + pathSeg._asPathString();
              }
            });
            return string;
          }
        }]);

        return SVGPathSegList;
      }();

      SVGPathSegList.prototype.classname = 'SVGPathSegList';
      Object.defineProperty(SVGPathSegList.prototype, 'numberOfItems', {
        get: function get() {
          this._checkPathSynchronizedToList();

          return this._list.length;
        },
        enumerable: true
      }); // Add the pathSegList accessors to SVGPathElement.
      // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGAnimatedPathData

      Object.defineProperties(SVGPathElement.prototype, {
        pathSegList: {
          get: function get() {
            if (!this._pathSegList) {
              this._pathSegList = new SVGPathSegList(this);
            }

            return this._pathSegList;
          },
          enumerable: true
        },
        // FIXME: The following are not implemented and simply return SVGPathElement.pathSegList.
        normalizedPathSegList: {
          get: function get() {
            return this.pathSegList;
          },
          enumerable: true
        },
        animatedPathSegList: {
          get: function get() {
            return this.pathSegList;
          },
          enumerable: true
        },
        animatedNormalizedPathSegList: {
          get: function get() {
            return this.pathSegList;
          },
          enumerable: true
        }
      });
      window.SVGPathSegList = SVGPathSegList;
    }
  })();

  /**
   * jQuery module to work with SVG attributes
   * @module jQueryAttr
   * @license MIT
   */

  /**
  * This fixes `$(...).attr()` to work as expected with SVG elements.
  * Does not currently use `*AttributeNS()` since we rarely need that.
  * Adds {@link external:jQuery.fn.attr}.
  * See {@link https://api.jquery.com/attr/} for basic documentation of `.attr()`.
  *
  * Additional functionality:
  * - When getting attributes, a string that's a number is returned as type number.
  * - If an array is supplied as the first parameter, multiple values are returned
  *    as an object with values for each given attribute.
  * @function module:jQueryAttr.jQueryAttr
  * @param {external:jQuery} $ The jQuery object to which to add the plug-in
  * @returns {external:jQuery}
  */
  function jQueryPluginSVG($) {
    var proxied = $.fn.attr,
        svgns = 'http://www.w3.org/2000/svg';
    /**
    * @typedef {PlainObject<string, string|Float>} module:jQueryAttr.Attributes
    */

    /**
    * @function external:jQuery.fn.attr
    * @param {string|string[]|PlainObject<string, string>} key
    * @param {string} value
    * @returns {external:jQuery|module:jQueryAttr.Attributes}
    */

    $.fn.attr = function (key, value) {
      var len = this.length;

      if (!len) {
        return proxied.call(this, key, value);
      }

      for (var i = 0; i < len; ++i) {
        var elem = this[i]; // set/get SVG attribute

        if (elem.namespaceURI === svgns) {
          // Setting attribute
          if (value !== undefined) {
            elem.setAttribute(key, value);
          } else if (Array.isArray(key)) {
            // Getting attributes from array
            var obj = {};
            var j = key.length;

            while (j--) {
              var aname = key[j];
              var attr = elem.getAttribute(aname); // This returns a number when appropriate

              if (attr || attr === '0') {
                attr = isNaN(attr) ? attr : attr - 0;
              }

              obj[aname] = attr;
            }

            return obj;
          }

          if (_typeof(key) === 'object') {
            // Setting attributes from object
            for (var _i = 0, _Object$entries = Object.entries(key); _i < _Object$entries.length; _i++) {
              var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                  name = _Object$entries$_i[0],
                  val = _Object$entries$_i[1];

              elem.setAttribute(name, val);
            } // Getting attribute

          } else {
            var _attr = elem.getAttribute(key);

            if (_attr || _attr === '0') {
              _attr = isNaN(_attr) ? _attr : _attr - 0;
            }

            return _attr;
          }
        } else {
          return proxied.call(this, key, value);
        }
      }

      return this;
    };

    return $;
  }

  /**
   * @module jQueryPluginDBox
   */

  /**
  * @param {external:jQuery} $
  * @param {PlainObject} [strings]
  * @param {PlainObject} [strings.ok]
  * @param {PlainObject} [strings.cancel]
  * @returns {external:jQuery}
  */
  function jQueryPluginDBox($) {
    var strings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      ok: 'Ok',
      cancel: 'Cancel'
    };
    // This sets up alternative dialog boxes. They mostly work the same way as
    // their UI counterparts, expect instead of returning the result, a callback
    // needs to be included that returns the result as its first parameter.
    // In the future we may want to add additional types of dialog boxes, since
    // they should be easy to handle this way.
    $('#dialog_container').draggable({
      cancel: '#dialog_content, #dialog_buttons *',
      containment: 'window'
    }).css('position', 'absolute');
    var box = $('#dialog_box'),
        btnHolder = $('#dialog_buttons'),
        dialogContent = $('#dialog_content');
    /**
    * @typedef {PlainObject} module:jQueryPluginDBox.PromiseResultObject
    * @property {string|true} response
    * @property {boolean} checked
    */

    /**
    * Resolves to `false` (if cancelled), for prompts and selects
    * without checkboxes, it resolves to the value of the form control. For other
    * types without checkboxes, it resolves to `true`. For checkboxes, it resolves
    * to an object with the `response` key containing the same value as the previous
    * mentioned (string or `true`) and a `checked` (boolean) property.
    * @typedef {Promise<boolean|string|module:jQueryPluginDBox.PromiseResultObject>} module:jQueryPluginDBox.ResultPromise
    */

    /**
    * @typedef {PlainObject} module:jQueryPluginDBox.SelectOption
    * @property {string} text
    * @property {string} value
    */

    /**
    * @typedef {PlainObject} module:jQueryPluginDBox.CheckboxInfo
    * @property {string} label Label for the checkbox
    * @property {string} value Value of the checkbox
    * @property {string} tooltip Tooltip on the checkbox label
    * @property {boolean} checked Whether the checkbox is checked by default
    */

    /**
     * Triggered upon a change of value for the select pull-down.
     * @callback module:jQueryPluginDBox.SelectChangeListener
     * @returns {void}
     */

    /**
     * Creates a dialog of the specified type with a given message
     *  and any defaults and type-specific metadata. Returns a `Promise`
     *  which resolves differently depending on whether the dialog
     *  was cancelled or okayed (with the response and any checked state).
     * @param {"alert"|"prompt"|"select"|"process"} type
     * @param {string} msg
     * @param {string} [defaultVal]
     * @param {module:jQueryPluginDBox.SelectOption[]} [opts]
     * @param {module:jQueryPluginDBox.SelectChangeListener} [changeListener]
     * @param {module:jQueryPluginDBox.CheckboxInfo} [checkbox]
     * @returns {jQueryPluginDBox.ResultPromise}
    */

    function dbox(type, msg, defaultVal, opts, changeListener, checkbox) {
      dialogContent.html('<p>' + msg.replace(/\n/g, '</p><p>') + '</p>').toggleClass('prompt', type === 'prompt');
      btnHolder.empty();
      var ok = $('<input type="button" data-ok="" value="' + strings.ok + '">').appendTo(btnHolder);
      return new Promise(function (resolve, reject) {
        // eslint-disable-line promise/avoid-new
        if (type !== 'alert') {
          $('<input type="button" value="' + strings.cancel + '">').appendTo(btnHolder).click(function () {
            box.hide();
            resolve(false);
          });
        }

        var ctrl, chkbx;

        if (type === 'prompt') {
          ctrl = $('<input type="text">').prependTo(btnHolder);
          ctrl.val(defaultVal || '');
          ctrl.bind('keydown', 'return', function () {
            ok.click();
          });
        } else if (type === 'select') {
          var div = $('<div style="text-align:center;">');
          ctrl = $("<select aria-label=\"".concat(msg, "\">")).appendTo(div);

          if (checkbox) {
            var label = $('<label>').text(checkbox.label);
            chkbx = $('<input type="checkbox">').appendTo(label);
            chkbx.val(checkbox.value);

            if (checkbox.tooltip) {
              label.attr('title', checkbox.tooltip);
            }

            chkbx.prop('checked', Boolean(checkbox.checked));
            div.append($('<div>').append(label));
          }

          $.each(opts || [], function (opt, val) {
            if (_typeof(val) === 'object') {
              ctrl.append($('<option>').val(val.value).html(val.text));
            } else {
              ctrl.append($('<option>').html(val));
            }
          });
          dialogContent.append(div);

          if (defaultVal) {
            ctrl.val(defaultVal);
          }

          if (changeListener) {
            ctrl.bind('change', 'return', changeListener);
          }

          ctrl.bind('keydown', 'return', function () {
            ok.click();
          });
        } else if (type === 'process') {
          ok.hide();
        }

        box.show();
        ok.click(function () {
          box.hide();
          var response = type === 'prompt' || type === 'select' ? ctrl.val() : true;

          if (chkbx) {
            resolve({
              response: response,
              checked: chkbx.prop('checked')
            });
            return;
          }

          resolve(response);
        }).focus();

        if (type === 'prompt' || type === 'select') {
          ctrl.focus();
        }
      });
    }
    /**
    * @param {string} msg Message to alert
    * @returns {jQueryPluginDBox.ResultPromise}
    */


    $.alert = function (msg) {
      return dbox('alert', msg);
    };
    /**
    * @param {string} msg Message for which to ask confirmation
    * @returns {jQueryPluginDBox.ResultPromise}
    */


    $.confirm = function (msg) {
      return dbox('confirm', msg);
    };
    /**
    * @param {string} msg Message to indicate upon cancelable indicator
    * @returns {jQueryPluginDBox.ResultPromise}
    */


    $.process_cancel = function (msg) {
      return dbox('process', msg);
    };
    /**
    * @param {string} msg Message to accompany the prompt
    * @param {string} [defaultText=''] The default text to show for the prompt
    * @returns {jQueryPluginDBox.ResultPromise}
    */


    $.prompt = function (msg) {
      var defaultText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return dbox('prompt', msg, defaultText);
    };

    $.select = function (msg, opts, changeListener, txt, checkbox) {
      return dbox('select', msg, txt, opts, changeListener, checkbox);
    };

    return $;
  }

  /**
   * Namespaces or tools therefor
   * @module namespaces
   * @license MIT
  */

  /**
  * Common namepaces constants in alpha order
  * @enum {string}
  * @type {PlainObject}
  * @memberof module:namespaces
  */
  var NS = {
    HTML: 'http://www.w3.org/1999/xhtml',
    MATH: 'http://www.w3.org/1998/Math/MathML',
    SE: 'http://svg-edit.googlecode.com',
    SVG: 'http://www.w3.org/2000/svg',
    XLINK: 'http://www.w3.org/1999/xlink',
    XML: 'http://www.w3.org/XML/1998/namespace',
    XMLNS: 'http://www.w3.org/2000/xmlns/' // see http://www.w3.org/TR/REC-xml-names/#xmlReserved

  };
  /**
  * @function module:namespaces.getReverseNS
  * @returns {string} The NS with key values switched and lowercase
  */

  var getReverseNS = function getReverseNS() {
    var reverseNS = {};
    Object.entries(NS).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          name = _ref2[0],
          URI = _ref2[1];

      reverseNS[URI] = name.toLowerCase();
    });
    return reverseNS;
  };

  var $ = jQuery;

  var supportsSVG_ = function () {
    return Boolean(document.createElementNS && document.createElementNS(NS.SVG, 'svg').createSVGRect);
  }();
  var _navigator = navigator,
      userAgent = _navigator.userAgent;
  var svg = document.createElementNS(NS.SVG, 'svg'); // Note: Browser sniffing should only be used if no other detection method is possible

  var isOpera_ = Boolean(window.opera);
  var isWebkit_ = userAgent.includes('AppleWebKit');
  var isGecko_ = userAgent.includes('Gecko/');
  var isIE_ = userAgent.includes('MSIE');
  var isChrome_ = userAgent.includes('Chrome/');
  var isWindows_ = userAgent.includes('Windows');
  var isMac_ = userAgent.includes('Macintosh');
  var isTouch_ = 'ontouchstart' in window;

  var supportsSelectors_ = function () {
    return Boolean(svg.querySelector);
  }();

  var supportsXpath_ = function () {
    return Boolean(document.evaluate);
  }(); // segList functions (for FF1.5 and 2.0)


  var supportsPathReplaceItem_ = function () {
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,10');
    var seglist = path.pathSegList;
    var seg = path.createSVGPathSegLinetoAbs(5, 5);

    try {
      seglist.replaceItem(seg, 1);
      return true;
    } catch (err) {}

    return false;
  }();

  var supportsPathInsertItemBefore_ = function () {
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,10');
    var seglist = path.pathSegList;
    var seg = path.createSVGPathSegLinetoAbs(5, 5);

    try {
      seglist.insertItemBefore(seg, 1);
      return true;
    } catch (err) {}

    return false;
  }(); // text character positioning (for IE9 and now Chrome)


  var supportsGoodTextCharPos_ = function () {
    var svgroot = document.createElementNS(NS.SVG, 'svg');
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.append(svgroot);
    svgcontent.setAttribute('x', 5);
    svgroot.append(svgcontent);
    var text = document.createElementNS(NS.SVG, 'text');
    text.textContent = 'a';
    svgcontent.append(text);

    try {
      // Chrome now fails here
      var pos = text.getStartPositionOfChar(0).x;
      return pos === 0;
    } catch (err) {
      return false;
    } finally {
      svgroot.remove();
    }
  }();

  var supportsPathBBox_ = function () {
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.append(svgcontent);
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 C0,0 10,10 10,0');
    svgcontent.append(path);
    var bbox = path.getBBox();
    svgcontent.remove();
    return bbox.height > 4 && bbox.height < 5;
  }(); // Support for correct bbox sizing on groups with horizontal/vertical lines


  var supportsHVLineContainerBBox_ = function () {
    var svgcontent = document.createElementNS(NS.SVG, 'svg');
    document.documentElement.append(svgcontent);
    var path = document.createElementNS(NS.SVG, 'path');
    path.setAttribute('d', 'M0,0 10,0');
    var path2 = document.createElementNS(NS.SVG, 'path');
    path2.setAttribute('d', 'M5,0 15,0');
    var g = document.createElementNS(NS.SVG, 'g');
    g.append(path, path2);
    svgcontent.append(g);
    var bbox = g.getBBox();
    svgcontent.remove(); // Webkit gives 0, FF gives 10, Opera (correctly) gives 15

    return bbox.width === 15;
  }();

  var supportsGoodDecimals_ = function () {
    // Correct decimals on clone attributes (Opera < 10.5/win/non-en)
    var rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('x', 0.1);
    var crect = rect.cloneNode(false);
    var retValue = !crect.getAttribute('x').includes(',');

    if (!retValue) {
      // Todo: i18nize or remove
      $.alert('NOTE: This version of Opera is known to contain bugs in SVG-edit.\n' + 'Please upgrade to the <a href="http://opera.com">latest version</a> in which the problems have been fixed.');
    }

    return retValue;
  }();

  var supportsNonScalingStroke_ = function () {
    var rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('style', 'vector-effect:non-scaling-stroke');
    return rect.style.vectorEffect === 'non-scaling-stroke';
  }();

  var supportsNativeSVGTransformLists_ = function () {
    var rect = document.createElementNS(NS.SVG, 'rect');
    var rxform = rect.transform.baseVal;
    var t1 = svg.createSVGTransform();
    rxform.appendItem(t1);
    var r1 = rxform.getItem(0);

    var isSVGTransform = function isSVGTransform(o) {
      // https://developer.mozilla.org/en-US/docs/Web/API/SVGTransform
      return o && _typeof(o) === 'object' && typeof o.setMatrix === 'function' && 'angle' in o;
    };

    return isSVGTransform(r1) && isSVGTransform(t1) && r1.type === t1.type && r1.angle === t1.angle && r1.matrix.a === t1.matrix.a && r1.matrix.b === t1.matrix.b && r1.matrix.c === t1.matrix.c && r1.matrix.d === t1.matrix.d && r1.matrix.e === t1.matrix.e && r1.matrix.f === t1.matrix.f;
  }(); // Public API

  /**
   * @function module:browser.isOpera
   * @returns {boolean}
  */


  var isOpera = function isOpera() {
    return isOpera_;
  };
  /**
   * @function module:browser.isWebkit
   * @returns {boolean}
  */

  var isWebkit = function isWebkit() {
    return isWebkit_;
  };
  /**
   * @function module:browser.isGecko
   * @returns {boolean}
  */

  var isGecko = function isGecko() {
    return isGecko_;
  };
  /**
   * @function module:browser.isIE
   * @returns {boolean}
  */

  var isIE = function isIE() {
    return isIE_;
  };
  /**
   * @function module:browser.isChrome
   * @returns {boolean}
  */

  var isChrome = function isChrome() {
    return isChrome_;
  };
  /**
   * @function module:browser.isTouch
   * @returns {boolean}
  */

  var isTouch = function isTouch() {
    return isTouch_;
  };
  /**
   * @function module:browser.supportsSelectors
   * @returns {boolean}
  */

  var supportsSelectors = function supportsSelectors() {
    return supportsSelectors_;
  };
  /**
   * @function module:browser.supportsXpath
   * @returns {boolean}
  */

  var supportsXpath = function supportsXpath() {
    return supportsXpath_;
  };
  /**
   * @function module:browser.supportsPathReplaceItem
   * @returns {boolean}
  */

  var supportsPathReplaceItem = function supportsPathReplaceItem() {
    return supportsPathReplaceItem_;
  };
  /**
   * @function module:browser.supportsPathInsertItemBefore
   * @returns {boolean}
  */

  var supportsPathInsertItemBefore = function supportsPathInsertItemBefore() {
    return supportsPathInsertItemBefore_;
  };
  /**
   * @function module:browser.supportsPathBBox
   * @returns {boolean}
  */

  var supportsPathBBox = function supportsPathBBox() {
    return supportsPathBBox_;
  };
  /**
   * @function module:browser.supportsHVLineContainerBBox
   * @returns {boolean}
  */

  var supportsHVLineContainerBBox = function supportsHVLineContainerBBox() {
    return supportsHVLineContainerBBox_;
  };
  /**
   * @function module:browser.supportsGoodTextCharPos
   * @returns {boolean}
  */

  var supportsGoodTextCharPos = function supportsGoodTextCharPos() {
    return supportsGoodTextCharPos_;
  };
  /**
  * @function module:browser.supportsNonScalingStroke
  * @returns {boolean}
  */

  var supportsNonScalingStroke = function supportsNonScalingStroke() {
    return supportsNonScalingStroke_;
  };
  /**
  * @function module:browser.supportsNativeTransformLists
  * @returns {boolean}
  */

  var supportsNativeTransformLists = function supportsNativeTransformLists() {
    return supportsNativeSVGTransformLists_;
  };

  var svgroot = document.createElementNS(NS.SVG, 'svg');
  /**
   * Helper function to convert `SVGTransform` to a string.
   * @param {SVGTransform} xform
   * @returns {string}
   */

  function transformToString(xform) {
    var m = xform.matrix;
    var text = '';

    switch (xform.type) {
      case 1:
        // MATRIX
        text = 'matrix(' + [m.a, m.b, m.c, m.d, m.e, m.f].join(',') + ')';
        break;

      case 2:
        // TRANSLATE
        text = 'translate(' + m.e + ',' + m.f + ')';
        break;

      case 3:
        // SCALE
        if (m.a === m.d) {
          text = 'scale(' + m.a + ')';
        } else {
          text = 'scale(' + m.a + ',' + m.d + ')';
        }

        break;

      case 4:
        {
          // ROTATE
          var cx = 0;
          var cy = 0; // this prevents divide by zero

          if (xform.angle !== 0) {
            var K = 1 - m.a;
            cy = (K * m.f + m.b * m.e) / (K * K + m.b * m.b);
            cx = (m.e - m.b * cy) / K;
          }

          text = 'rotate(' + xform.angle + ' ' + cx + ',' + cy + ')';
          break;
        }
    }

    return text;
  }
  /**
   * Map of SVGTransformList objects.
   */


  var listMap_ = {};
  /**
  * @interface module:SVGTransformList.SVGEditTransformList
  * @property {Integer} numberOfItems unsigned long
  */

  /**
  * @function module:SVGTransformList.SVGEditTransformList#clear
  * @returns {void}
  */

  /**
  * @function module:SVGTransformList.SVGEditTransformList#initialize
  * @param {SVGTransform} newItem
  * @returns {SVGTransform}
  */

  /**
  * (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
  * @function module:SVGTransformList.SVGEditTransformList#getItem
  * @param {Integer} index unsigned long
  * @returns {SVGTransform}
  */

  /**
  * (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
  * @function module:SVGTransformList.SVGEditTransformList#insertItemBefore
  * @param {SVGTransform} newItem
  * @param {Integer} index unsigned long
  * @returns {SVGTransform}
  */

  /**
  * (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
  * @function module:SVGTransformList.SVGEditTransformList#replaceItem
  * @param {SVGTransform} newItem
  * @param {Integer} index unsigned long
  * @returns {SVGTransform}
  */

  /**
  * (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
  * @function module:SVGTransformList.SVGEditTransformList#removeItem
  * @param {Integer} index unsigned long
  * @returns {SVGTransform}
  */

  /**
  * @function module:SVGTransformList.SVGEditTransformList#appendItem
  * @param {SVGTransform} newItem
  * @returns {SVGTransform}
  */

  /**
  * NOT IMPLEMENTED
  * @ignore
  * @function module:SVGTransformList.SVGEditTransformList#createSVGTransformFromMatrix
  * @param {SVGMatrix} matrix
  * @returns {SVGTransform}
  */

  /**
  * NOT IMPLEMENTED
  * @ignore
  * @function module:SVGTransformList.SVGEditTransformList#consolidate
  * @returns {SVGTransform}
  */

  /**
  * SVGTransformList implementation for Webkit.
  * These methods do not currently raise any exceptions.
  * These methods also do not check that transforms are being inserted.  This is basically
  * implementing as much of SVGTransformList that we need to get the job done.
  * @implements {module:SVGTransformList.SVGEditTransformList}
  */

  var SVGTransformList =
  /*#__PURE__*/
  function () {
    // eslint-disable-line no-shadow

    /**
    * @param {Element} elem
    * @returns {SVGTransformList}
    */
    function SVGTransformList(elem) {
      _classCallCheck(this, SVGTransformList);

      this._elem = elem || null;
      this._xforms = []; // TODO: how do we capture the undo-ability in the changed transform list?

      this._update = function () {
        var tstr = ''; // /* const concatMatrix = */ svgroot.createSVGMatrix();

        for (var i = 0; i < this.numberOfItems; ++i) {
          var xform = this._list.getItem(i);

          tstr += transformToString(xform) + ' ';
        }

        this._elem.setAttribute('transform', tstr);
      };

      this._list = this;

      this._init = function () {
        var _this = this;

        // Transform attribute parser
        var str = this._elem.getAttribute('transform');

        if (!str) {
          return;
        } // TODO: Add skew support in future


        var re = _wrapRegExp(/\s*((?:scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/, {
          xform: 1
        });

        var m = true;

        while (m) {
          m = str.match(re);
          str = str.replace(re, '');

          if (m && m.groups.xform) {
            (function () {
              var x = m.groups.xform;

              var _x$split = x.split(/\s*\(/),
                  _x$split2 = _slicedToArray(_x$split, 2),
                  name = _x$split2[0],
                  bits = _x$split2[1];

              var valBits = bits.match(_wrapRegExp(/\s*(.*?)\s*\)/, {
                nonWhitespace: 1
              }));
              valBits.groups.nonWhitespace = valBits.groups.nonWhitespace.replace(_wrapRegExp(/(\d)-/g, {
                digit: 1
              }), '$<digit> -');
              var valArr = valBits.groups.nonWhitespace.split(/[, ]+/);

              var letters = _toConsumableArray('abcdef');

              var mtx = svgroot.createSVGMatrix();
              Object.values(valArr).forEach(function (item, i) {
                valArr[i] = parseFloat(item);

                if (name === 'matrix') {
                  mtx[letters[i]] = valArr[i];
                }
              });
              var xform = svgroot.createSVGTransform();
              var fname = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
              var values = name === 'matrix' ? [mtx] : valArr;

              if (name === 'scale' && values.length === 1) {
                values.push(values[0]);
              } else if (name === 'translate' && values.length === 1) {
                values.push(0);
              } else if (name === 'rotate' && values.length === 1) {
                values.push(0, 0);
              }

              xform[fname].apply(xform, _toConsumableArray(values));

              _this._list.appendItem(xform);
            })();
          }
        }
      };

      this._removeFromOtherLists = function (item) {
        if (item) {
          // Check if this transform is already in a transformlist, and
          // remove it if so.
          Object.values(listMap_).some(function (tl) {
            for (var i = 0, len = tl._xforms.length; i < len; ++i) {
              if (tl._xforms[i] === item) {
                tl.removeItem(i);
                return true;
              }
            }

            return false;
          });
        }
      };

      this.numberOfItems = 0;
    }
    /**
    * @returns {void}
    */


    _createClass(SVGTransformList, [{
      key: "clear",
      value: function clear() {
        this.numberOfItems = 0;
        this._xforms = [];
      }
      /**
      * @param {SVGTransform} newItem
      * @returns {void}
      */

    }, {
      key: "initialize",
      value: function initialize(newItem) {
        this.numberOfItems = 1;

        this._removeFromOtherLists(newItem);

        this._xforms = [newItem];
      }
      /**
      * @param {Integer} index unsigned long
      * @throws {Error}
      * @returns {SVGTransform}
      */

    }, {
      key: "getItem",
      value: function getItem(index) {
        if (index < this.numberOfItems && index >= 0) {
          return this._xforms[index];
        }

        var err = new Error('DOMException with code=INDEX_SIZE_ERR');
        err.code = 1;
        throw err;
      }
      /**
      * @param {SVGTransform} newItem
      * @param {Integer} index unsigned long
      * @returns {SVGTransform}
      */

    }, {
      key: "insertItemBefore",
      value: function insertItemBefore(newItem, index) {
        var retValue = null;

        if (index >= 0) {
          if (index < this.numberOfItems) {
            this._removeFromOtherLists(newItem);

            var newxforms = new Array(this.numberOfItems + 1); // TODO: use array copying and slicing

            var i;

            for (i = 0; i < index; ++i) {
              newxforms[i] = this._xforms[i];
            }

            newxforms[i] = newItem;

            for (var j = i + 1; i < this.numberOfItems; ++j, ++i) {
              newxforms[j] = this._xforms[i];
            }

            this.numberOfItems++;
            this._xforms = newxforms;
            retValue = newItem;

            this._list._update();
          } else {
            retValue = this._list.appendItem(newItem);
          }
        }

        return retValue;
      }
      /**
      * @param {SVGTransform} newItem
      * @param {Integer} index unsigned long
      * @returns {SVGTransform}
      */

    }, {
      key: "replaceItem",
      value: function replaceItem(newItem, index) {
        var retValue = null;

        if (index < this.numberOfItems && index >= 0) {
          this._removeFromOtherLists(newItem);

          this._xforms[index] = newItem;
          retValue = newItem;

          this._list._update();
        }

        return retValue;
      }
      /**
      * @param {Integer} index unsigned long
      * @throws {Error}
      * @returns {SVGTransform}
      */

    }, {
      key: "removeItem",
      value: function removeItem(index) {
        if (index < this.numberOfItems && index >= 0) {
          var retValue = this._xforms[index];
          var newxforms = new Array(this.numberOfItems - 1);
          var i;

          for (i = 0; i < index; ++i) {
            newxforms[i] = this._xforms[i];
          }

          for (var j = i; j < this.numberOfItems - 1; ++j, ++i) {
            newxforms[j] = this._xforms[i + 1];
          }

          this.numberOfItems--;
          this._xforms = newxforms;

          this._list._update();

          return retValue;
        }

        var err = new Error('DOMException with code=INDEX_SIZE_ERR');
        err.code = 1;
        throw err;
      }
      /**
      * @param {SVGTransform} newItem
      * @returns {SVGTransform}
      */

    }, {
      key: "appendItem",
      value: function appendItem(newItem) {
        this._removeFromOtherLists(newItem);

        this._xforms.push(newItem);

        this.numberOfItems++;

        this._list._update();

        return newItem;
      }
    }]);

    return SVGTransformList;
  }();
  /**
  * @function module:SVGTransformList.resetListMap
  * @returns {void}
  */

  var resetListMap = function resetListMap() {
    listMap_ = {};
  };
  /**
   * Removes transforms of the given element from the map.
   * @function module:SVGTransformList.removeElementFromListMap
   * @param {Element} elem - a DOM Element
   * @returns {void}
   */

  var removeElementFromListMap = function removeElementFromListMap(elem) {
    // eslint-disable-line import/no-mutable-exports
    if (elem.id && listMap_[elem.id]) {
      delete listMap_[elem.id];
    }
  };
  /**
  * Returns an object that behaves like a `SVGTransformList` for the given DOM element.
  * @function module:SVGTransformList.getTransformList
  * @param {Element} elem - DOM element to get a transformlist from
  * @todo The polyfill should have `SVGAnimatedTransformList` and this should use it
  * @returns {SVGAnimatedTransformList|SVGTransformList}
  */

  var getTransformList = function getTransformList(elem) {
    if (!supportsNativeTransformLists()) {
      var id = elem.id || 'temp';
      var t = listMap_[id];

      if (!t || id === 'temp') {
        listMap_[id] = new SVGTransformList(elem);

        listMap_[id]._init();

        t = listMap_[id];
      }

      return t;
    }

    if (elem.transform) {
      return elem.transform.baseVal;
    }

    if (elem.gradientTransform) {
      return elem.gradientTransform.baseVal;
    }

    if (elem.patternTransform) {
      return elem.patternTransform.baseVal;
    }

    return null;
  };

  /**
   * Tools for working with units
   * @module units
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
   */
  var wAttrs = ['x', 'x1', 'cx', 'rx', 'width'];
  var hAttrs = ['y', 'y1', 'cy', 'ry', 'height'];

  /*
  const unitNumMap = {
    '%': 2,
    em: 3,
    ex: 4,
    px: 5,
    cm: 6,
    mm: 7,
    in: 8,
    pt: 9,
    pc: 10
  };
  */
  // Container of elements.

  var elementContainer_; // Stores mapping of unit type to user coordinates.

  var typeMap_ = {};
  /**
   * @interface module:units.ElementContainer
   */

  /**
   * @function module:units.ElementContainer#getBaseUnit
   * @returns {string} The base unit type of the container ('em')
   */

  /**
   * @function module:units.ElementContainer#getElement
   * @returns {?Element} An element in the container given an id
   */

  /**
   * @function module:units.ElementContainer#getHeight
   * @returns {Float} The container's height
   */

  /**
   * @function module:units.ElementContainer#getWidth
   * @returns {Float} The container's width
   */

  /**
   * @function module:units.ElementContainer#getRoundDigits
   * @returns {Integer} The number of digits number should be rounded to
   */

  /**
   * @typedef {PlainObject} module:units.TypeMap
   * @property {Float} em
   * @property {Float} ex
   * @property {Float} in
   * @property {Float} cm
   * @property {Float} mm
   * @property {Float} pt
   * @property {Float} pc
   * @property {Integer} px
   * @property {0} %
   */

  /**
   * Initializes this module.
   *
   * @function module:units.init
   * @param {module:units.ElementContainer} elementContainer - An object implementing the ElementContainer interface.
   * @returns {void}
   */

  var init = function init(elementContainer) {
    elementContainer_ = elementContainer; // Get correct em/ex values by creating a temporary SVG.

    var svg = document.createElementNS(NS.SVG, 'svg');
    document.body.append(svg);
    var rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('width', '1em');
    rect.setAttribute('height', '1ex');
    rect.setAttribute('x', '1in');
    svg.append(rect);
    var bb = rect.getBBox();
    svg.remove();
    var inch = bb.x;
    typeMap_ = {
      em: bb.width,
      ex: bb.height,
      "in": inch,
      cm: inch / 2.54,
      mm: inch / 25.4,
      pt: inch / 72,
      pc: inch / 6,
      px: 1,
      '%': 0
    };
  };
  /**
  * Group: Unit conversion functions
  */

  /**
   * @function module:units.getTypeMap
   * @returns {module:units.TypeMap} The unit object with values for each unit
  */

  var getTypeMap = function getTypeMap() {
    return typeMap_;
  };
  /**
  * @typedef {GenericArray} module:units.CompareNumbers
  * @property {Integer} length 2
  * @property {Float} 0
  * @property {Float} 1
  */

  /**
  * Rounds a given value to a float with number of digits defined in
  * `round_digits` of `saveOptions`
  *
  * @function module:units.shortFloat
  * @param {string|Float|module:units.CompareNumbers} val - The value (or Array of two numbers) to be rounded
  * @returns {Float|string} If a string/number was given, returns a Float. If an array, return a string
  * with comma-separated floats
  */

  var shortFloat = function shortFloat(val) {
    var digits = elementContainer_.getRoundDigits();

    if (!isNaN(val)) {
      return Number(Number(val).toFixed(digits));
    }

    if (Array.isArray(val)) {
      return shortFloat(val[0]) + ',' + shortFloat(val[1]);
    }

    return parseFloat(val).toFixed(digits) - 0;
  };
  /**
  * Converts the number to given unit or baseUnit.
  * @function module:units.convertUnit
  * @param {string|Float} val
  * @param {"em"|"ex"|"in"|"cm"|"mm"|"pt"|"pc"|"px"|"%"} [unit]
  * @returns {Float}
  */

  var convertUnit = function convertUnit(val, unit) {
    unit = unit || elementContainer_.getBaseUnit(); // baseVal.convertToSpecifiedUnits(unitNumMap[unit]);
    // const val = baseVal.valueInSpecifiedUnits;
    // baseVal.convertToSpecifiedUnits(1);

    return shortFloat(val / typeMap_[unit]);
  };
  /**
  * Sets an element's attribute based on the unit in its current value.
  *
  * @function module:units.setUnitAttr
  * @param {Element} elem - DOM element to be changed
  * @param {string} attr - Name of the attribute associated with the value
  * @param {string} val - Attribute value to convert
  * @returns {void}
  */

  var setUnitAttr = function setUnitAttr(elem, attr, val) {
    //  if (!isNaN(val)) {
    // New value is a number, so check currently used unit
    // const oldVal = elem.getAttribute(attr);
    // Enable this for alternate mode
    // if (oldVal !== null && (isNaN(oldVal) || elementContainer_.getBaseUnit() !== 'px')) {
    //   // Old value was a number, so get unit, then convert
    //   let unit;
    //   if (oldVal.substr(-1) === '%') {
    //     const res = getResolution();
    //     unit = '%';
    //     val *= 100;
    //     if (wAttrs.includes(attr)) {
    //       val = val / res.w;
    //     } else if (hAttrs.includes(attr)) {
    //       val = val / res.h;
    //     } else {
    //       return val / Math.sqrt((res.w*res.w) + (res.h*res.h))/Math.sqrt(2);
    //     }
    //   } else {
    //     if (elementContainer_.getBaseUnit() !== 'px') {
    //       unit = elementContainer_.getBaseUnit();
    //     } else {
    //       unit = oldVal.substr(-2);
    //     }
    //     val = val / typeMap_[unit];
    //   }
    //
    // val += unit;
    // }
    // }
    elem.setAttribute(attr, val);
  };
  /**
  * Converts given values to numbers. Attributes must be supplied in
  * case a percentage is given.
  *
  * @function module:units.convertToNum
  * @param {string} attr - Name of the attribute associated with the value
  * @param {string} val - Attribute value to convert
  * @returns {Float} The converted number
  */

  var convertToNum = function convertToNum(attr, val) {
    // Return a number if that's what it already is
    if (!isNaN(val)) {
      return val - 0;
    }

    if (val.substr(-1) === '%') {
      // Deal with percentage, depends on attribute
      var _num = val.substr(0, val.length - 1) / 100;

      var width = elementContainer_.getWidth();
      var height = elementContainer_.getHeight();

      if (wAttrs.includes(attr)) {
        return _num * width;
      }

      if (hAttrs.includes(attr)) {
        return _num * height;
      }

      return _num * Math.sqrt(width * width + height * height) / Math.sqrt(2);
    }

    var unit = val.substr(-2);
    var num = val.substr(0, val.length - 2); // Note that this multiplication turns the string into a number

    return num * typeMap_[unit];
  };

  /**
  * Group: Undo/Redo history management
  */

  var HistoryEventTypes = {
    BEFORE_APPLY: 'before_apply',
    AFTER_APPLY: 'after_apply',
    BEFORE_UNAPPLY: 'before_unapply',
    AFTER_UNAPPLY: 'after_unapply'
  }; // const removedElements = {};

  /**
  * Base class for commands.
  */

  var Command =
  /*#__PURE__*/
  function () {
    function Command() {
      _classCallCheck(this, Command);
    }

    _createClass(Command, [{
      key: "getText",

      /**
      * @returns {string}
      */
      value: function getText() {
        return this.text;
      }
    }]);

    return Command;
  }(); // Todo: Figure out why the interface members aren't showing
  //   up (with or without modules applied), despite our apparently following
  //   http://usejsdoc.org/tags-interface.html#virtual-comments

  /**
   * An interface that all command objects must implement.
   * @interface module:history.HistoryCommand
  */

  /**
   * Applies
   *
   * @function module:history.HistoryCommand#apply
   * @param {module:history.HistoryEventHandler}
   * @fires module:history~Command#event:history
   * @returns {void|true}
   */

  /**
   *
   * Unapplies
   * @function module:history.HistoryCommand#unapply
   * @param {module:history.HistoryEventHandler}
   * @fires module:history~Command#event:history
   * @returns {void|true}
   */

  /**
   * Returns the elements
   * @function module:history.HistoryCommand#elements
   * @returns {Element[]}
   */

  /**
   * Gets the text
   * @function module:history.HistoryCommand#getText
   * @returns {string}
   */

  /**
   * Gives the type
   * @function module:history.HistoryCommand.type
   * @returns {string}
   */

  /**
   * Gives the type
   * @function module:history.HistoryCommand#type
   * @returns {string}
  */

  /**
   * @event module:history~Command#event:history
   * @type {module:history.HistoryCommand}
   */

  /**
   * An interface for objects that will handle history events.
   * @interface module:history.HistoryEventHandler
   */

  /**
   *
   * @function module:history.HistoryEventHandler#handleHistoryEvent
   * @param {string} eventType One of the HistoryEvent types
   * @param {module:history~Command#event:history} command
   * @listens module:history~Command#event:history
   * @returns {void}
   *
   */

  /**
   * History command for an element that had its DOM position changed.
   * @implements {module:history.HistoryCommand}
   * @param {Element} elem - The DOM element that was moved
   * @param {Element} oldNextSibling - The element's next sibling before it was moved
   * @param {Element} oldParent - The element's parent before it was moved
   * @param {string} [text] - An optional string visible to user related to this change
  */


  var MoveElementCommand =
  /*#__PURE__*/
  function (_Command) {
    _inherits(MoveElementCommand, _Command);

    function MoveElementCommand(elem, oldNextSibling, oldParent, text) {
      var _this;

      _classCallCheck(this, MoveElementCommand);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(MoveElementCommand).call(this));
      _this.elem = elem;
      _this.text = text ? 'Move ' + elem.tagName + ' to ' + text : 'Move ' + elem.tagName;
      _this.oldNextSibling = oldNextSibling;
      _this.oldParent = oldParent;
      _this.newNextSibling = elem.nextSibling;
      _this.newParent = elem.parentNode;
      return _this;
    }

    _createClass(MoveElementCommand, [{
      key: "type",
      value: function type() {
        // eslint-disable-line class-methods-use-this
        return 'svgedit.history.MoveElementCommand';
      }
      /**
       * Re-positions the element.
       * @param {module:history.HistoryEventHandler} handler
       * @fires module:history~Command#event:history
       * @returns {void}
      */

    }, {
      key: "apply",
      value: function apply(handler) {
        // TODO(codedread): Refactor this common event code into a base HistoryCommand class.
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
        }

        this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
        }
      }
      /**
       * Positions the element back to its original location.
       * @param {module:history.HistoryEventHandler} handler
       * @fires module:history~Command#event:history
       * @returns {void}
      */

    }, {
      key: "unapply",
      value: function unapply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
        }

        this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
        }
      }
      /**
      * @returns {Element[]} Array with element associated with this command
      */

    }, {
      key: "elements",
      value: function elements() {
        return [this.elem];
      }
    }]);

    return MoveElementCommand;
  }(Command);
  MoveElementCommand.type = MoveElementCommand.prototype.type;
  /**
  * History command for an element that was added to the DOM.
  * @implements {module:history.HistoryCommand}
  *
  * @param {Element} elem - The newly added DOM element
  * @param {string} text - An optional string visible to user related to this change
  */

  var InsertElementCommand =
  /*#__PURE__*/
  function (_Command2) {
    _inherits(InsertElementCommand, _Command2);

    function InsertElementCommand(elem, text) {
      var _this2;

      _classCallCheck(this, InsertElementCommand);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(InsertElementCommand).call(this));
      _this2.elem = elem;
      _this2.text = text || 'Create ' + elem.tagName;
      _this2.parent = elem.parentNode;
      _this2.nextSibling = _this2.elem.nextSibling;
      return _this2;
    }

    _createClass(InsertElementCommand, [{
      key: "type",
      value: function type() {
        // eslint-disable-line class-methods-use-this
        return 'svgedit.history.InsertElementCommand';
      }
      /**
      * Re-inserts the new element.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "apply",
      value: function apply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
        }

        this.elem = this.parent.insertBefore(this.elem, this.nextSibling);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
        }
      }
      /**
      * Removes the element.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "unapply",
      value: function unapply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
        }

        this.parent = this.elem.parentNode;
        this.elem = this.elem.parentNode.removeChild(this.elem);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
        }
      }
      /**
      * @returns {Element[]} Array with element associated with this command
      */

    }, {
      key: "elements",
      value: function elements() {
        return [this.elem];
      }
    }]);

    return InsertElementCommand;
  }(Command);
  InsertElementCommand.type = InsertElementCommand.prototype.type;
  /**
  * History command for an element removed from the DOM.
  * @implements {module:history.HistoryCommand}
  * @param {Element} elem - The removed DOM element
  * @param {Node} oldNextSibling - The DOM element's nextSibling when it was in the DOM
  * @param {Element} oldParent - The DOM element's parent
  * @param {string} [text] - An optional string visible to user related to this change
  */

  var RemoveElementCommand =
  /*#__PURE__*/
  function (_Command3) {
    _inherits(RemoveElementCommand, _Command3);

    function RemoveElementCommand(elem, oldNextSibling, oldParent, text) {
      var _this3;

      _classCallCheck(this, RemoveElementCommand);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(RemoveElementCommand).call(this));
      _this3.elem = elem;
      _this3.text = text || 'Delete ' + elem.tagName;
      _this3.nextSibling = oldNextSibling;
      _this3.parent = oldParent; // special hack for webkit: remove this element's entry in the svgTransformLists map

      removeElementFromListMap(elem);
      return _this3;
    }

    _createClass(RemoveElementCommand, [{
      key: "type",
      value: function type() {
        // eslint-disable-line class-methods-use-this
        return 'svgedit.history.RemoveElementCommand';
      }
      /**
      * Re-removes the new element.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "apply",
      value: function apply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
        }

        removeElementFromListMap(this.elem);
        this.parent = this.elem.parentNode;
        this.elem = this.parent.removeChild(this.elem);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
        }
      }
      /**
      * Re-adds the new element.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "unapply",
      value: function unapply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
        }

        removeElementFromListMap(this.elem);

        if (isNullish(this.nextSibling)) {
          if (window.console) {
            console.log('Error: reference element was lost'); // eslint-disable-line no-console
          }
        }

        this.parent.insertBefore(this.elem, this.nextSibling); // Don't use `before` or `prepend` as `this.nextSibling` may be `null`

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
        }
      }
      /**
      * @returns {Element[]} Array with element associated with this command
      */

    }, {
      key: "elements",
      value: function elements() {
        return [this.elem];
      }
    }]);

    return RemoveElementCommand;
  }(Command);
  RemoveElementCommand.type = RemoveElementCommand.prototype.type;
  /**
  * @typedef {"#text"|"#href"|string} module:history.CommandAttributeName
  */

  /**
  * @typedef {PlainObject<module:history.CommandAttributeName, string>} module:history.CommandAttributes
  */

  /**
  * History command to make a change to an element.
  * Usually an attribute change, but can also be textcontent.
  * @implements {module:history.HistoryCommand}
  * @param {Element} elem - The DOM element that was changed
  * @param {module:history.CommandAttributes} attrs - Attributes to be changed with the values they had *before* the change
  * @param {string} text - An optional string visible to user related to this change
  */

  var ChangeElementCommand =
  /*#__PURE__*/
  function (_Command4) {
    _inherits(ChangeElementCommand, _Command4);

    function ChangeElementCommand(elem, attrs, text) {
      var _this4;

      _classCallCheck(this, ChangeElementCommand);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(ChangeElementCommand).call(this));
      _this4.elem = elem;
      _this4.text = text ? 'Change ' + elem.tagName + ' ' + text : 'Change ' + elem.tagName;
      _this4.newValues = {};
      _this4.oldValues = attrs;

      for (var attr in attrs) {
        if (attr === '#text') {
          _this4.newValues[attr] = elem.textContent;
        } else if (attr === '#href') {
          _this4.newValues[attr] = getHref(elem);
        } else {
          _this4.newValues[attr] = elem.getAttribute(attr);
        }
      }

      return _this4;
    }

    _createClass(ChangeElementCommand, [{
      key: "type",
      value: function type() {
        // eslint-disable-line class-methods-use-this
        return 'svgedit.history.ChangeElementCommand';
      }
      /**
      * Performs the stored change action.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {true}
      */

    }, {
      key: "apply",
      value: function apply(handler) {
        var _this5 = this;

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
        }

        var bChangedTransform = false;
        Object.entries(this.newValues).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              attr = _ref2[0],
              value = _ref2[1];

          if (value) {
            if (attr === '#text') {
              _this5.elem.textContent = value;
            } else if (attr === '#href') {
              setHref(_this5.elem, value);
            } else {
              _this5.elem.setAttribute(attr, value);
            }
          } else if (attr === '#text') {
            _this5.elem.textContent = '';
          } else {
            _this5.elem.setAttribute(attr, '');

            _this5.elem.removeAttribute(attr);
          }

          if (attr === 'transform') {
            bChangedTransform = true;
          }
        }); // relocate rotational transform, if necessary

        if (!bChangedTransform) {
          var angle = getRotationAngle(this.elem);

          if (angle) {
            var bbox = this.elem.getBBox();
            var cx = bbox.x + bbox.width / 2,
                cy = bbox.y + bbox.height / 2;
            var rotate = ['rotate(', angle, ' ', cx, ',', cy, ')'].join('');

            if (rotate !== this.elem.getAttribute('transform')) {
              this.elem.setAttribute('transform', rotate);
            }
          }
        }

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
        }

        return true;
      }
      /**
      * Reverses the stored change action.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {true}
      */

    }, {
      key: "unapply",
      value: function unapply(handler) {
        var _this6 = this;

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
        }

        var bChangedTransform = false;
        Object.entries(this.oldValues).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              attr = _ref4[0],
              value = _ref4[1];

          if (value) {
            if (attr === '#text') {
              _this6.elem.textContent = value;
            } else if (attr === '#href') {
              setHref(_this6.elem, value);
            } else {
              _this6.elem.setAttribute(attr, value);
            }
          } else if (attr === '#text') {
            _this6.elem.textContent = '';
          } else {
            _this6.elem.removeAttribute(attr);
          }

          if (attr === 'transform') {
            bChangedTransform = true;
          }
        }); // relocate rotational transform, if necessary

        if (!bChangedTransform) {
          var angle = getRotationAngle(this.elem);

          if (angle) {
            var bbox = this.elem.getBBox();
            var cx = bbox.x + bbox.width / 2,
                cy = bbox.y + bbox.height / 2;
            var rotate = ['rotate(', angle, ' ', cx, ',', cy, ')'].join('');

            if (rotate !== this.elem.getAttribute('transform')) {
              this.elem.setAttribute('transform', rotate);
            }
          }
        } // Remove transformlist to prevent confusion that causes bugs like 575.


        removeElementFromListMap(this.elem);

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
        }

        return true;
      }
      /**
      * @returns {Element[]} Array with element associated with this command
      */

    }, {
      key: "elements",
      value: function elements() {
        return [this.elem];
      }
    }]);

    return ChangeElementCommand;
  }(Command);
  ChangeElementCommand.type = ChangeElementCommand.prototype.type; // TODO: create a 'typing' command object that tracks changes in text
  // if a new Typing command is created and the top command on the stack is also a Typing
  // and they both affect the same element, then collapse the two commands into one

  /**
  * History command that can contain/execute multiple other commands.
  * @implements {module:history.HistoryCommand}
  */

  var BatchCommand =
  /*#__PURE__*/
  function (_Command5) {
    _inherits(BatchCommand, _Command5);

    /**
    * @param {string} [text] - An optional string visible to user related to this change
    */
    function BatchCommand(text) {
      var _this7;

      _classCallCheck(this, BatchCommand);

      _this7 = _possibleConstructorReturn(this, _getPrototypeOf(BatchCommand).call(this));
      _this7.text = text || 'Batch Command';
      _this7.stack = [];
      return _this7;
    }

    _createClass(BatchCommand, [{
      key: "type",
      value: function type() {
        // eslint-disable-line class-methods-use-this
        return 'svgedit.history.BatchCommand';
      }
      /**
      * Runs "apply" on all subcommands.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "apply",
      value: function apply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_APPLY, this);
        }

        var len = this.stack.length;

        for (var i = 0; i < len; ++i) {
          this.stack[i].apply(handler);
        }

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_APPLY, this);
        }
      }
      /**
      * Runs "unapply" on all subcommands.
      * @param {module:history.HistoryEventHandler} handler
      * @fires module:history~Command#event:history
      * @returns {void}
      */

    }, {
      key: "unapply",
      value: function unapply(handler) {
        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.BEFORE_UNAPPLY, this);
        }

        for (var i = this.stack.length - 1; i >= 0; i--) {
          this.stack[i].unapply(handler);
        }

        if (handler) {
          handler.handleHistoryEvent(HistoryEventTypes.AFTER_UNAPPLY, this);
        }
      }
      /**
      * Iterate through all our subcommands.
      * @returns {Element[]} All the elements we are changing
      */

    }, {
      key: "elements",
      value: function elements() {
        var elems = [];
        var cmd = this.stack.length;

        while (cmd--) {
          var thisElems = this.stack[cmd].elements();
          var elem = thisElems.length;

          while (elem--) {
            if (!elems.includes(thisElems[elem])) {
              elems.push(thisElems[elem]);
            }
          }
        }

        return elems;
      }
      /**
      * Adds a given command to the history stack.
      * @param {Command} cmd - The undo command object to add
      * @returns {void}
      */

    }, {
      key: "addSubCommand",
      value: function addSubCommand(cmd) {
        this.stack.push(cmd);
      }
      /**
      * @returns {boolean} Indicates whether or not the batch command is empty
      */

    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return !this.stack.length;
      }
    }]);

    return BatchCommand;
  }(Command);
  BatchCommand.type = BatchCommand.prototype.type;
  /**
  *
  */

  var UndoManager =
  /*#__PURE__*/
  function () {
    /**
    * @param {module:history.HistoryEventHandler} historyEventHandler
    */
    function UndoManager(historyEventHandler) {
      _classCallCheck(this, UndoManager);

      this.handler_ = historyEventHandler || null;
      this.undoStackPointer = 0;
      this.undoStack = []; // this is the stack that stores the original values, the elements and
      // the attribute name for begin/finish

      this.undoChangeStackPointer = -1;
      this.undoableChangeStack = [];
    }
    /**
    * Resets the undo stack, effectively clearing the undo/redo history.
    * @returns {void}
    */


    _createClass(UndoManager, [{
      key: "resetUndoStack",
      value: function resetUndoStack() {
        this.undoStack = [];
        this.undoStackPointer = 0;
      }
      /**
      * @returns {Integer} Current size of the undo history stack
      */

    }, {
      key: "getUndoStackSize",
      value: function getUndoStackSize() {
        return this.undoStackPointer;
      }
      /**
      * @returns {Integer} Current size of the redo history stack
      */

    }, {
      key: "getRedoStackSize",
      value: function getRedoStackSize() {
        return this.undoStack.length - this.undoStackPointer;
      }
      /**
      * @returns {string} String associated with the next undo command
      */

    }, {
      key: "getNextUndoCommandText",
      value: function getNextUndoCommandText() {
        return this.undoStackPointer > 0 ? this.undoStack[this.undoStackPointer - 1].getText() : '';
      }
      /**
      * @returns {string} String associated with the next redo command
      */

    }, {
      key: "getNextRedoCommandText",
      value: function getNextRedoCommandText() {
        return this.undoStackPointer < this.undoStack.length ? this.undoStack[this.undoStackPointer].getText() : '';
      }
      /**
      * Performs an undo step.
      * @returns {void}
      */

    }, {
      key: "undo",
      value: function undo() {
        if (this.undoStackPointer > 0) {
          var cmd = this.undoStack[--this.undoStackPointer];
          cmd.unapply(this.handler_);
        }
      }
      /**
      * Performs a redo step.
      * @returns {void}
      */

    }, {
      key: "redo",
      value: function redo() {
        if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
          var cmd = this.undoStack[this.undoStackPointer++];
          cmd.apply(this.handler_);
        }
      }
      /**
      * Adds a command object to the undo history stack.
      * @param {Command} cmd - The command object to add
      * @returns {void}
      */

    }, {
      key: "addCommandToHistory",
      value: function addCommandToHistory(cmd) {
        // FIXME: we MUST compress consecutive text changes to the same element
        // (right now each keystroke is saved as a separate command that includes the
        // entire text contents of the text element)
        // TODO: consider limiting the history that we store here (need to do some slicing)
        // if our stack pointer is not at the end, then we have to remove
        // all commands after the pointer and insert the new command
        if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
          this.undoStack = this.undoStack.splice(0, this.undoStackPointer);
        }

        this.undoStack.push(cmd);
        this.undoStackPointer = this.undoStack.length;
      }
      /**
      * This function tells the canvas to remember the old values of the
      * `attrName` attribute for each element sent in.  The elements and values
      * are stored on a stack, so the next call to `finishUndoableChange()` will
      * pop the elements and old values off the stack, gets the current values
      * from the DOM and uses all of these to construct the undo-able command.
      * @param {string} attrName - The name of the attribute being changed
      * @param {Element[]} elems - Array of DOM elements being changed
      * @returns {void}
      */

    }, {
      key: "beginUndoableChange",
      value: function beginUndoableChange(attrName, elems) {
        var p = ++this.undoChangeStackPointer;
        var i = elems.length;
        var oldValues = new Array(i),
            elements = new Array(i);

        while (i--) {
          var elem = elems[i];

          if (isNullish(elem)) {
            continue;
          }

          elements[i] = elem;
          oldValues[i] = elem.getAttribute(attrName);
        }

        this.undoableChangeStack[p] = {
          attrName: attrName,
          oldValues: oldValues,
          elements: elements
        };
      }
      /**
      * This function returns a `BatchCommand` object which summarizes the
      * change since `beginUndoableChange` was called.  The command can then
      * be added to the command history.
      * @returns {BatchCommand} Batch command object with resulting changes
      */

    }, {
      key: "finishUndoableChange",
      value: function finishUndoableChange() {
        var p = this.undoChangeStackPointer--;
        var changeset = this.undoableChangeStack[p];
        var attrName = changeset.attrName;
        var batchCmd = new BatchCommand('Change ' + attrName);
        var i = changeset.elements.length;

        while (i--) {
          var elem = changeset.elements[i];

          if (isNullish(elem)) {
            continue;
          }

          var changes = {};
          changes[attrName] = changeset.oldValues[i];

          if (changes[attrName] !== elem.getAttribute(attrName)) {
            batchCmd.addSubCommand(new ChangeElementCommand(elem, changes, attrName));
          }
        }

        this.undoableChangeStack[p] = null;
        return batchCmd;
      }
    }]);

    return UndoManager;
  }();

  var hstry = /*#__PURE__*/Object.freeze({
    HistoryEventTypes: HistoryEventTypes,
    MoveElementCommand: MoveElementCommand,
    InsertElementCommand: InsertElementCommand,
    RemoveElementCommand: RemoveElementCommand,
    ChangeElementCommand: ChangeElementCommand,
    BatchCommand: BatchCommand,
    UndoManager: UndoManager
  });

  /**
   * Mathematical utilities
   * @module math
   * @license MIT
   *
   * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
   */

  var NEAR_ZERO = 1e-14; // Throw away SVGSVGElement used for creating matrices/transforms.

  var svg$1 = document.createElementNS(NS.SVG, 'svg');
  /**
   * A (hopefully) quicker function to transform a point by a matrix
   * (this function avoids any DOM calls and just does the math).
   * @function module:math.transformPoint
   * @param {Float} x - Float representing the x coordinate
   * @param {Float} y - Float representing the y coordinate
   * @param {SVGMatrix} m - Matrix object to transform the point with
   * @returns {module:math.XYObject} An x, y object representing the transformed point
  */

  var transformPoint = function transformPoint(x, y, m) {
    return {
      x: m.a * x + m.c * y + m.e,
      y: m.b * x + m.d * y + m.f
    };
  };
  /**
   * Helper function to check if the matrix performs no actual transform
   * (i.e. exists for identity purposes).
   * @function module:math.isIdentity
   * @param {SVGMatrix} m - The matrix object to check
   * @returns {boolean} Indicates whether or not the matrix is 1,0,0,1,0,0
  */

  var isIdentity = function isIdentity(m) {
    return m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
  };
  /**
   * This function tries to return a `SVGMatrix` that is the multiplication `m1 * m2`.
   * We also round to zero when it's near zero.
   * @function module:math.matrixMultiply
   * @param {...SVGMatrix} args - Matrix objects to multiply
   * @returns {SVGMatrix} The matrix object resulting from the calculation
  */

  var matrixMultiply = function matrixMultiply() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var m = args.reduceRight(function (prev, m1) {
      return m1.multiply(prev);
    });

    if (Math.abs(m.a) < NEAR_ZERO) {
      m.a = 0;
    }

    if (Math.abs(m.b) < NEAR_ZERO) {
      m.b = 0;
    }

    if (Math.abs(m.c) < NEAR_ZERO) {
      m.c = 0;
    }

    if (Math.abs(m.d) < NEAR_ZERO) {
      m.d = 0;
    }

    if (Math.abs(m.e) < NEAR_ZERO) {
      m.e = 0;
    }

    if (Math.abs(m.f) < NEAR_ZERO) {
      m.f = 0;
    }

    return m;
  };
  var hasMatrixTransform = function hasMatrixTransform(tlist) {
    if (!tlist) {
      return false;
    }

    var num = tlist.numberOfItems;

    while (num--) {
      var xform = tlist.getItem(num);

      if (xform.type === 1 && !isIdentity(xform.matrix)) {
        return true;
      }
    }

    return false;
  };
  /**
  * @typedef {PlainObject} module:math.TransformedBox An object with the following values
  * @property {module:math.XYObject} tl - The top left coordinate
  * @property {module:math.XYObject} tr - The top right coordinate
  * @property {module:math.XYObject} bl - The bottom left coordinate
  * @property {module:math.XYObject} br - The bottom right coordinate
  * @property {PlainObject} aabox - Object with the following values:
  * @property {Float} aabox.x - Float with the axis-aligned x coordinate
  * @property {Float} aabox.y - Float with the axis-aligned y coordinate
  * @property {Float} aabox.width - Float with the axis-aligned width coordinate
  * @property {Float} aabox.height - Float with the axis-aligned height coordinate
  */

  /**
   * Transforms a rectangle based on the given matrix.
   * @function module:math.transformBox
   * @param {Float} l - Float with the box's left coordinate
   * @param {Float} t - Float with the box's top coordinate
   * @param {Float} w - Float with the box width
   * @param {Float} h - Float with the box height
   * @param {SVGMatrix} m - Matrix object to transform the box by
   * @returns {module:math.TransformedBox}
  */

  var transformBox = function transformBox(l, t, w, h, m) {
    var tl = transformPoint(l, t, m),
        tr = transformPoint(l + w, t, m),
        bl = transformPoint(l, t + h, m),
        br = transformPoint(l + w, t + h, m),
        minx = Math.min(tl.x, tr.x, bl.x, br.x),
        maxx = Math.max(tl.x, tr.x, bl.x, br.x),
        miny = Math.min(tl.y, tr.y, bl.y, br.y),
        maxy = Math.max(tl.y, tr.y, bl.y, br.y);
    return {
      tl: tl,
      tr: tr,
      bl: bl,
      br: br,
      aabox: {
        x: minx,
        y: miny,
        width: maxx - minx,
        height: maxy - miny
      }
    };
  };
  /**
   * This returns a single matrix Transform for a given Transform List
   * (this is the equivalent of `SVGTransformList.consolidate()` but unlike
   * that method, this one does not modify the actual `SVGTransformList`).
   * This function is very liberal with its `min`, `max` arguments.
   * @function module:math.transformListToTransform
   * @param {SVGTransformList} tlist - The transformlist object
   * @param {Integer} [min=0] - Optional integer indicating start transform position
   * @param {Integer} [max] - Optional integer indicating end transform position;
   *   defaults to one less than the tlist's `numberOfItems`
   * @returns {SVGTransform} A single matrix transform object
  */

  var transformListToTransform = function transformListToTransform(tlist, min, max) {
    if (isNullish(tlist)) {
      // Or should tlist = null have been prevented before this?
      return svg$1.createSVGTransformFromMatrix(svg$1.createSVGMatrix());
    }

    min = min || 0;
    max = max || tlist.numberOfItems - 1;
    min = parseInt(min);
    max = parseInt(max);

    if (min > max) {
      var temp = max;
      max = min;
      min = temp;
    }

    var m = svg$1.createSVGMatrix();

    for (var i = min; i <= max; ++i) {
      // if our indices are out of range, just use a harmless identity matrix
      var mtom = i >= 0 && i < tlist.numberOfItems ? tlist.getItem(i).matrix : svg$1.createSVGMatrix();
      m = matrixMultiply(m, mtom);
    }

    return svg$1.createSVGTransformFromMatrix(m);
  };
  /**
   * Get the matrix object for a given element.
   * @function module:math.getMatrix
   * @param {Element} elem - The DOM element to check
   * @returns {SVGMatrix} The matrix object associated with the element's transformlist
  */

  var getMatrix = function getMatrix(elem) {
    var tlist = getTransformList(elem);
    return transformListToTransform(tlist).matrix;
  };
  /**
   * Returns a 45 degree angle coordinate associated with the two given
   * coordinates.
   * @function module:math.snapToAngle
   * @param {Integer} x1 - First coordinate's x value
   * @param {Integer} y1 - First coordinate's y value
   * @param {Integer} x2 - Second coordinate's x value
   * @param {Integer} y2 - Second coordinate's y value
   * @returns {module:math.AngleCoord45}
  */

  var snapToAngle = function snapToAngle(x1, y1, x2, y2) {
    var snap = Math.PI / 4; // 45 degrees

    var dx = x2 - x1;
    var dy = y2 - y1;
    var angle = Math.atan2(dy, dx);
    var dist = Math.sqrt(dx * dx + dy * dy);
    var snapangle = Math.round(angle / snap) * snap;
    return {
      x: x1 + dist * Math.cos(snapangle),
      y: y1 + dist * Math.sin(snapangle),
      a: snapangle
    };
  };
  /**
   * Check if two rectangles (BBoxes objects) intersect each other.
   * @function module:math.rectsIntersect
   * @param {SVGRect} r1 - The first BBox-like object
   * @param {SVGRect} r2 - The second BBox-like object
   * @returns {boolean} True if rectangles intersect
   */

  var rectsIntersect = function rectsIntersect(r1, r2) {
    return r2.x < r1.x + r1.width && r2.x + r2.width > r1.x && r2.y < r1.y + r1.height && r2.y + r2.height > r1.y;
  };

  var $$1 = jQuery;
  var segData = {
    2: ['x', 'y'],
    // PATHSEG_MOVETO_ABS
    4: ['x', 'y'],
    // PATHSEG_LINETO_ABS
    6: ['x', 'y', 'x1', 'y1', 'x2', 'y2'],
    // PATHSEG_CURVETO_CUBIC_ABS
    8: ['x', 'y', 'x1', 'y1'],
    // PATHSEG_CURVETO_QUADRATIC_ABS
    10: ['x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag'],
    // PATHSEG_ARC_ABS
    12: ['x'],
    // PATHSEG_LINETO_HORIZONTAL_ABS
    14: ['y'],
    // PATHSEG_LINETO_VERTICAL_ABS
    16: ['x', 'y', 'x2', 'y2'],
    // PATHSEG_CURVETO_CUBIC_SMOOTH_ABS
    18: ['x', 'y'] // PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS

  };
  /**
   * @tutorial LocaleDocs
   * @typedef {module:locale.LocaleStrings|PlainObject} module:path.uiStrings
   * @property {PlainObject<string, string>} ui
  */

  var uiStrings = {};
  /**
  * @function module:path.setUiStrings
  * @param {module:path.uiStrings} strs
  * @returns {void}
  */

  var setUiStrings = function setUiStrings(strs) {
    Object.assign(uiStrings, strs.ui);
  };
  var pathFuncs = [];
  var linkControlPts = true; // Stores references to paths via IDs.
  // TODO: Make this cross-document happy.

  var pathData = {};
  /**
  * @function module:path.setLinkControlPoints
  * @param {boolean} lcp
  * @returns {void}
  */

  var setLinkControlPoints = function setLinkControlPoints(lcp) {
    linkControlPts = lcp;
  };
  /**
   * @name module:path.path
   * @type {null|module:path.Path}
   * @memberof module:path
  */

  var path = null; // eslint-disable-line import/no-mutable-exports

  var editorContext_ = null;
  /**
  * @external MouseEvent
  */

  /**
  * Object with the following keys/values
  * @typedef {PlainObject} module:path.SVGElementJSON
  * @property {string} element - Tag name of the SVG element to create
  * @property {PlainObject<string, string>} attr - Has key-value attributes to assign to the new element. An `id` should be set so that {@link module:utilities.EditorContext#addSVGElementFromJson} can later re-identify the element for modification or replacement.
  * @property {boolean} [curStyles=false] - Indicates whether current style attributes should be applied first
  * @property {module:path.SVGElementJSON[]} [children] - Data objects to be added recursively as children
  * @property {string} [namespace="http://www.w3.org/2000/svg"] - Indicate a (non-SVG) namespace
  */

  /**
   * @interface module:path.EditorContext
   * @property {module:select.SelectorManager} selectorManager
   * @property {module:svgcanvas.SvgCanvas} canvas
   */

  /**
   * @function module:path.EditorContext#call
   * @param {"selected"|"changed"} ev - String with the event name
   * @param {module:svgcanvas.SvgCanvas#event:selected|module:svgcanvas.SvgCanvas#event:changed} arg - Argument to pass through to the callback function. If the event is "changed", an array of `Element`s is passed; if "selected", a single-item array of `Element` is passed.
   * @returns {void}
   */

  /**
   * @function module:path.EditorContext#resetD
   * @param {SVGPathElement} p
   * @returns {void}
  */

  /**
   * Note: This doesn't round to an integer necessarily
   * @function module:path.EditorContext#round
   * @param {Float} val
   * @returns {Float} Rounded value to nearest value based on `currentZoom`
   */

  /**
   * @function module:path.EditorContext#clearSelection
   * @param {boolean} [noCall] - When `true`, does not call the "selected" handler
   * @returns {void}
  */

  /**
   * @function module:path.EditorContext#addToSelection
   * @param {Element[]} elemsToAdd - An array of DOM elements to add to the selection
   * @param {boolean} showGrips - Indicates whether the resize grips should be shown
   * @returns {void}
  */

  /**
   * @function module:path.EditorContext#addCommandToHistory
   * @param {Command} cmd
   * @returns {void}
   */

  /**
   * @function module:path.EditorContext#remapElement
   * @param {Element} selected - DOM element to be changed
   * @param {PlainObject<string, string>} changes - Object with changes to be remapped
   * @param {SVGMatrix} m - Matrix object to use for remapping coordinates
   * @returns {void}
   */

  /**
   * @function module:path.EditorContext#addSVGElementFromJson
   * @param {module:path.SVGElementJSON} data
   * @returns {Element} The new element
  */

  /**
   * @function module:path.EditorContext#getGridSnapping
   * @returns {boolean}
   */

  /**
   * @function module:path.EditorContext#getOpacity
   * @returns {Float}
   */

  /**
   * @function module:path.EditorContext#getSelectedElements
   * @returns {Element[]} the array with selected DOM elements
  */

  /**
   * @function module:path.EditorContext#getContainer
   * @returns {Element}
   */

  /**
   * @function module:path.EditorContext#setStarted
   * @param {boolean} s
   * @returns {void}
   */

  /**
   * @function module:path.EditorContext#getRubberBox
   * @returns {SVGRectElement}
  */

  /**
   * @function module:path.EditorContext#setRubberBox
   * @param {SVGRectElement} rb
   * @returns {SVGRectElement} Same as parameter passed in
   */

  /**
   * @function module:path.EditorContext#addPtsToSelection
   * @param {PlainObject} cfg
   * @param {boolean} cfg.closedSubpath
   * @param {SVGCircleElement[]} cfg.grips
   * @returns {void}
   */

  /**
   * @function module:path.EditorContext#endChanges
   * @param {PlainObject} cfg
   * @param {string} cfg.cmd
   * @param {Element} cfg.elem
   * @returns {void}
  */

  /**
   * @function module:path.EditorContext#getCurrentZoom
   * @returns {Float} The current zoom level
   */

  /**
   * Returns the last created DOM element ID string
   * @function module:path.EditorContext#getId
   * @returns {string}
   */

  /**
   * Creates and returns a unique ID string for a DOM element
   * @function module:path.EditorContext#getNextId
   * @returns {string}
  */

  /**
   * Gets the desired element from a mouse event
   * @function module:path.EditorContext#getMouseTarget
   * @param {external:MouseEvent} evt - Event object from the mouse event
   * @returns {Element} DOM element we want
   */

  /**
   * @function module:path.EditorContext#getCurrentMode
   * @returns {string}
   */

  /**
   * @function module:path.EditorContext#setCurrentMode
   * @param {string} cm The mode
   * @returns {string} The same mode as passed in
  */

  /**
   * @function module:path.EditorContext#getDrawnPath
   * @returns {SVGPathElement|null}
   */

  /**
   * @function module:path.EditorContext#setDrawnPath
   * @param {SVGPathElement|null} dp
   * @returns {SVGPathElement|null} The same value as passed in
   */

  /**
   * @function module:path.EditorContext#getSVGRoot
   * @returns {SVGSVGElement}
  */

  /**
  * @function module:path.init
  * @param {module:path.EditorContext} editorContext
  * @returns {void}
  */

  var init$1 = function init(editorContext) {
    editorContext_ = editorContext;
    pathFuncs = [0, 'ClosePath'];
    var pathFuncsStrs = ['Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc', 'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'];
    $$1.each(pathFuncsStrs, function (i, s) {
      pathFuncs.push(s + 'Abs');
      pathFuncs.push(s + 'Rel');
    });
  };
  /**
  * @function module:path.insertItemBefore
  * @param {Element} elem
  * @param {Segment} newseg
  * @param {Integer} index
  * @returns {void}
  */

  var insertItemBefore = function insertItemBefore(elem, newseg, index) {
    // Support insertItemBefore on paths for FF2
    var list = elem.pathSegList;

    if (supportsPathInsertItemBefore()) {
      list.insertItemBefore(newseg, index);
      return;
    }

    var len = list.numberOfItems;
    var arr = [];

    for (var i = 0; i < len; i++) {
      var curSeg = list.getItem(i);
      arr.push(curSeg);
    }

    list.clear();

    for (var _i = 0; _i < len; _i++) {
      if (_i === index) {
        // index + 1
        list.appendItem(newseg);
      }

      list.appendItem(arr[_i]);
    }
  };
  /**
  * @function module:path.ptObjToArr
  * @todo See if this should just live in `replacePathSeg`
  * @param {string} type
  * @param {SVGPathSegMovetoAbs|SVGPathSegLinetoAbs|SVGPathSegCurvetoCubicAbs|SVGPathSegCurvetoQuadraticAbs|SVGPathSegArcAbs|SVGPathSegLinetoHorizontalAbs|SVGPathSegLinetoVerticalAbs|SVGPathSegCurvetoCubicSmoothAbs|SVGPathSegCurvetoQuadraticSmoothAbs} segItem
  * @returns {ArgumentsArray}
  */

  var ptObjToArr = function ptObjToArr(type, segItem) {
    var props = segData[type];
    return props.map(function (prop) {
      return segItem[prop];
    });
  };
  /**
  * @function module:path.getGripPt
  * @param {Segment} seg
  * @param {module:math.XYObject} altPt
  * @returns {module:math.XYObject}
  */

  var getGripPt = function getGripPt(seg, altPt) {
    var pth = seg.path;
    var out = {
      x: altPt ? altPt.x : seg.item.x,
      y: altPt ? altPt.y : seg.item.y
    };

    if (pth.matrix) {
      var pt = transformPoint(out.x, out.y, pth.matrix);
      out = pt;
    }

    var currentZoom = editorContext_.getCurrentZoom();
    out.x *= currentZoom;
    out.y *= currentZoom;
    return out;
  };
  /**
  * @function module:path.getPointFromGrip
  * @param {module:math.XYObject} pt
  * @param {module:path.Path} pth
  * @returns {module:math.XYObject}
  */

  var getPointFromGrip = function getPointFromGrip(pt, pth) {
    var out = {
      x: pt.x,
      y: pt.y
    };

    if (pth.matrix) {
      pt = transformPoint(out.x, out.y, pth.imatrix);
      out.x = pt.x;
      out.y = pt.y;
    }

    var currentZoom = editorContext_.getCurrentZoom();
    out.x /= currentZoom;
    out.y /= currentZoom;
    return out;
  };
  /**
  * Requires prior call to `setUiStrings` if `xlink:title`
  *    to be set on the grip.
  * @function module:path.addPointGrip
  * @param {Integer} index
  * @param {Integer} x
  * @param {Integer} y
  * @returns {SVGCircleElement}
  */

  var addPointGrip = function addPointGrip(index, x, y) {
    // create the container of all the point grips
    var pointGripContainer = getGripContainer();
    var pointGrip = getElem('pathpointgrip_' + index); // create it

    if (!pointGrip) {
      pointGrip = document.createElementNS(NS.SVG, 'circle');
      var atts = {
        id: 'pathpointgrip_' + index,
        display: 'none',
        r: 4,
        fill: '#0FF',
        stroke: '#00F',
        'stroke-width': 2,
        cursor: 'move',
        style: 'pointer-events:all'
      };

      if ('pathNodeTooltip' in uiStrings) {
        // May be empty if running path.js without svg-editor
        atts['xlink:title'] = uiStrings.pathNodeTooltip;
      }

      assignAttributes(pointGrip, atts);
      pointGrip = pointGripContainer.appendChild(pointGrip);
      var grip = $$1('#pathpointgrip_' + index);
      grip.dblclick(function () {
        if (path) {
          path.setSegType();
        }
      });
    }

    if (x && y) {
      // set up the point grip element and display it
      assignAttributes(pointGrip, {
        cx: x,
        cy: y,
        display: 'inline'
      });
    }

    return pointGrip;
  };
  /**
  * @function module:path.getGripContainer
  * @returns {Element}
  */

  var getGripContainer = function getGripContainer() {
    var c = getElem('pathpointgrip_container');

    if (!c) {
      var parentElement = getElem('selectorParentGroup');
      c = parentElement.appendChild(document.createElementNS(NS.SVG, 'g'));
      c.id = 'pathpointgrip_container';
    }

    return c;
  };
  /**
  * Requires prior call to `setUiStrings` if `xlink:title`
  *    to be set on the grip.
  * @function module:path.addCtrlGrip
  * @param {string} id
  * @returns {SVGCircleElement}
  */

  var addCtrlGrip = function addCtrlGrip(id) {
    var pointGrip = getElem('ctrlpointgrip_' + id);

    if (pointGrip) {
      return pointGrip;
    }

    pointGrip = document.createElementNS(NS.SVG, 'circle');
    var atts = {
      id: 'ctrlpointgrip_' + id,
      display: 'none',
      r: 4,
      fill: '#0FF',
      stroke: '#55F',
      'stroke-width': 1,
      cursor: 'move',
      style: 'pointer-events:all'
    };

    if ('pathCtrlPtTooltip' in uiStrings) {
      // May be empty if running path.js without svg-editor
      atts['xlink:title'] = uiStrings.pathCtrlPtTooltip;
    }

    assignAttributes(pointGrip, atts);
    getGripContainer().append(pointGrip);
    return pointGrip;
  };
  /**
  * @function module:path.getCtrlLine
  * @param {string} id
  * @returns {SVGLineElement}
  */

  var getCtrlLine = function getCtrlLine(id) {
    var ctrlLine = getElem('ctrlLine_' + id);

    if (ctrlLine) {
      return ctrlLine;
    }

    ctrlLine = document.createElementNS(NS.SVG, 'line');
    assignAttributes(ctrlLine, {
      id: 'ctrlLine_' + id,
      stroke: '#555',
      'stroke-width': 1,
      style: 'pointer-events:none'
    });
    getGripContainer().append(ctrlLine);
    return ctrlLine;
  };
  /**
  * @function module:path.getPointGrip
  * @param {Segment} seg
  * @param {boolean} update
  * @returns {SVGCircleElement}
  */

  var getPointGrip = function getPointGrip(seg, update) {
    var index = seg.index;
    var pointGrip = addPointGrip(index);

    if (update) {
      var pt = getGripPt(seg);
      assignAttributes(pointGrip, {
        cx: pt.x,
        cy: pt.y,
        display: 'inline'
      });
    }

    return pointGrip;
  };
  /**
  * @function module:path.getControlPoints
  * @param {Segment} seg
  * @returns {PlainObject<string, SVGLineElement|SVGCircleElement>}
  */

  var getControlPoints = function getControlPoints(seg) {
    var item = seg.item,
        index = seg.index;

    if (!('x1' in item) || !('x2' in item)) {
      return null;
    }

    var cpt = {};
    /* const pointGripContainer = */

    getGripContainer(); // Note that this is intentionally not seg.prev.item

    var prev = path.segs[index - 1].item;
    var segItems = [prev, item];

    for (var i = 1; i < 3; i++) {
      var id = index + 'c' + i;
      var ctrlLine = cpt['c' + i + '_line'] = getCtrlLine(id);
      var pt = getGripPt(seg, {
        x: item['x' + i],
        y: item['y' + i]
      });
      var gpt = getGripPt(seg, {
        x: segItems[i - 1].x,
        y: segItems[i - 1].y
      });
      assignAttributes(ctrlLine, {
        x1: pt.x,
        y1: pt.y,
        x2: gpt.x,
        y2: gpt.y,
        display: 'inline'
      });
      cpt['c' + i + '_line'] = ctrlLine; // create it

      var pointGrip = cpt['c' + i] = addCtrlGrip(id);
      assignAttributes(pointGrip, {
        cx: pt.x,
        cy: pt.y,
        display: 'inline'
      });
      cpt['c' + i] = pointGrip;
    }

    return cpt;
  };
  /**
  * This replaces the segment at the given index. Type is given as number.
  * @function module:path.replacePathSeg
  * @param {Integer} type Possible values set during {@link module:path.init}
  * @param {Integer} index
  * @param {ArgumentsArray} pts
  * @param {SVGPathElement} elem
  * @returns {void}
  */

  var replacePathSeg = function replacePathSeg(type, index, pts, elem) {
    var pth = elem || path.elem;
    var func = 'createSVGPathSeg' + pathFuncs[type];
    var seg = pth[func].apply(pth, _toConsumableArray(pts));

    if (supportsPathReplaceItem()) {
      pth.pathSegList.replaceItem(seg, index);
    } else {
      var segList = pth.pathSegList;
      var len = segList.numberOfItems;
      var arr = [];

      for (var i = 0; i < len; i++) {
        var curSeg = segList.getItem(i);
        arr.push(curSeg);
      }

      segList.clear();

      for (var _i2 = 0; _i2 < len; _i2++) {
        if (_i2 === index) {
          segList.appendItem(seg);
        } else {
          segList.appendItem(arr[_i2]);
        }
      }
    }
  };
  /**
  * @function module:path.getSegSelector
  * @param {Segment} seg
  * @param {boolean} update
  * @returns {SVGPathElement}
  */

  var getSegSelector = function getSegSelector(seg, update) {
    var index = seg.index;
    var segLine = getElem('segline_' + index);

    if (!segLine) {
      var pointGripContainer = getGripContainer(); // create segline

      segLine = document.createElementNS(NS.SVG, 'path');
      assignAttributes(segLine, {
        id: 'segline_' + index,
        display: 'none',
        fill: 'none',
        stroke: '#0FF',
        'stroke-width': 2,
        style: 'pointer-events:none',
        d: 'M0,0 0,0'
      });
      pointGripContainer.append(segLine);
    }

    if (update) {
      var prev = seg.prev;

      if (!prev) {
        segLine.setAttribute('display', 'none');
        return segLine;
      }

      var pt = getGripPt(prev); // Set start point

      replacePathSeg(2, 0, [pt.x, pt.y], segLine);
      var pts = ptObjToArr(seg.type, seg.item); // , true);

      for (var i = 0; i < pts.length; i += 2) {
        var point = getGripPt(seg, {
          x: pts[i],
          y: pts[i + 1]
        });
        pts[i] = point.x;
        pts[i + 1] = point.y;
      }

      replacePathSeg(seg.type, 1, pts, segLine);
    }

    return segLine;
  };
  /**
   * @typedef {PlainObject} Point
   * @property {Integer} x The x value
   * @property {Integer} y The y value
   */

  /**
  * Takes three points and creates a smoother line based on them.
  * @function module:path.smoothControlPoints
  * @param {Point} ct1 - Object with x and y values (first control point)
  * @param {Point} ct2 - Object with x and y values (second control point)
  * @param {Point} pt - Object with x and y values (third point)
  * @returns {Point[]} Array of two "smoothed" point objects
  */

  var smoothControlPoints = function smoothControlPoints(ct1, ct2, pt) {
    // each point must not be the origin
    var x1 = ct1.x - pt.x,
        y1 = ct1.y - pt.y,
        x2 = ct2.x - pt.x,
        y2 = ct2.y - pt.y;

    if ((x1 !== 0 || y1 !== 0) && (x2 !== 0 || y2 !== 0)) {
      var r1 = Math.sqrt(x1 * x1 + y1 * y1),
          r2 = Math.sqrt(x2 * x2 + y2 * y2),
          nct1 = editorContext_.getSVGRoot().createSVGPoint(),
          nct2 = editorContext_.getSVGRoot().createSVGPoint();
      var anglea = Math.atan2(y1, x1),
          angleb = Math.atan2(y2, x2);

      if (anglea < 0) {
        anglea += 2 * Math.PI;
      }

      if (angleb < 0) {
        angleb += 2 * Math.PI;
      }

      var angleBetween = Math.abs(anglea - angleb),
          angleDiff = Math.abs(Math.PI - angleBetween) / 2;
      var newAnglea, newAngleb;

      if (anglea - angleb > 0) {
        newAnglea = angleBetween < Math.PI ? anglea + angleDiff : anglea - angleDiff;
        newAngleb = angleBetween < Math.PI ? angleb - angleDiff : angleb + angleDiff;
      } else {
        newAnglea = angleBetween < Math.PI ? anglea - angleDiff : anglea + angleDiff;
        newAngleb = angleBetween < Math.PI ? angleb + angleDiff : angleb - angleDiff;
      } // rotate the points


      nct1.x = r1 * Math.cos(newAnglea) + pt.x;
      nct1.y = r1 * Math.sin(newAnglea) + pt.y;
      nct2.x = r2 * Math.cos(newAngleb) + pt.x;
      nct2.y = r2 * Math.sin(newAngleb) + pt.y;
      return [nct1, nct2];
    }

    return undefined;
  };
  /**
  *
  */

  var Segment =
  /*#__PURE__*/
  function () {
    /**
    * @param {Integer} index
    * @param {SVGPathSeg} item
    * @todo Is `item` be more constrained here?
    */
    function Segment(index, item) {
      _classCallCheck(this, Segment);

      this.selected = false;
      this.index = index;
      this.item = item;
      this.type = item.pathSegType;
      this.ctrlpts = [];
      this.ptgrip = null;
      this.segsel = null;
    }
    /**
     * @param {boolean} y
     * @returns {void}
     */


    _createClass(Segment, [{
      key: "showCtrlPts",
      value: function showCtrlPts(y) {
        for (var i in this.ctrlpts) {
          if ({}.hasOwnProperty.call(this.ctrlpts, i)) {
            this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none');
          }
        }
      }
      /**
       * @param {boolean} y
       * @returns {void}
       */

    }, {
      key: "selectCtrls",
      value: function selectCtrls(y) {
        $$1('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2').attr('fill', y ? '#0FF' : '#EEE');
      }
      /**
       * @param {boolean} y
       * @returns {void}
       */

    }, {
      key: "show",
      value: function show(y) {
        if (this.ptgrip) {
          this.ptgrip.setAttribute('display', y ? 'inline' : 'none');
          this.segsel.setAttribute('display', y ? 'inline' : 'none'); // Show/hide all control points if available

          this.showCtrlPts(y);
        }
      }
      /**
       * @param {boolean} y
       * @returns {void}
       */

    }, {
      key: "select",
      value: function select(y) {
        if (this.ptgrip) {
          this.ptgrip.setAttribute('stroke', y ? '#0FF' : '#00F');
          this.segsel.setAttribute('display', y ? 'inline' : 'none');

          if (this.ctrlpts) {
            this.selectCtrls(y);
          }

          this.selected = y;
        }
      }
      /**
       * @returns {void}
       */

    }, {
      key: "addGrip",
      value: function addGrip() {
        this.ptgrip = getPointGrip(this, true);
        this.ctrlpts = getControlPoints(this); // , true);

        this.segsel = getSegSelector(this, true);
      }
      /**
       * @param {boolean} full
       * @returns {void}
       */

    }, {
      key: "update",
      value: function update(full) {
        if (this.ptgrip) {
          var pt = getGripPt(this);
          assignAttributes(this.ptgrip, {
            cx: pt.x,
            cy: pt.y
          });
          getSegSelector(this, true);

          if (this.ctrlpts) {
            if (full) {
              this.item = path.elem.pathSegList.getItem(this.index);
              this.type = this.item.pathSegType;
            }

            getControlPoints(this);
          } // this.segsel.setAttribute('display', y ? 'inline' : 'none');

        }
      }
      /**
       * @param {Integer} dx
       * @param {Integer} dy
       * @returns {void}
       */

    }, {
      key: "move",
      value: function move(dx, dy) {
        var item = this.item;
        var curPts = this.ctrlpts ? [item.x += dx, item.y += dy, item.x1, item.y1, item.x2 += dx, item.y2 += dy] : [item.x += dx, item.y += dy];
        replacePathSeg(this.type, this.index, // type 10 means ARC
        this.type === 10 ? ptObjToArr(this.type, item) : curPts);

        if (this.next && this.next.ctrlpts) {
          var next = this.next.item;
          var nextPts = [next.x, next.y, next.x1 += dx, next.y1 += dy, next.x2, next.y2];
          replacePathSeg(this.next.type, this.next.index, nextPts);
        }

        if (this.mate) {
          // The last point of a closed subpath has a 'mate',
          // which is the 'M' segment of the subpath
          var itm = this.mate.item;
          var pts = [itm.x += dx, itm.y += dy];
          replacePathSeg(this.mate.type, this.mate.index, pts); // Has no grip, so does not need 'updating'?
        }

        this.update(true);

        if (this.next) {
          this.next.update(true);
        }
      }
      /**
       * @param {Integer} num
       * @returns {void}
       */

    }, {
      key: "setLinked",
      value: function setLinked(num) {
        var seg, anum, pt;

        if (num === 2) {
          anum = 1;
          seg = this.next;

          if (!seg) {
            return;
          }

          pt = this.item;
        } else {
          anum = 2;
          seg = this.prev;

          if (!seg) {
            return;
          }

          pt = seg.item;
        }

        var _seg = seg,
            item = _seg.item;
        item['x' + anum] = pt.x + (pt.x - this.item['x' + num]);
        item['y' + anum] = pt.y + (pt.y - this.item['y' + num]);
        var pts = [item.x, item.y, item.x1, item.y1, item.x2, item.y2];
        replacePathSeg(seg.type, seg.index, pts);
        seg.update(true);
      }
      /**
       * @param {Integer} num
       * @param {Integer} dx
       * @param {Integer} dy
       * @returns {void}
       */

    }, {
      key: "moveCtrl",
      value: function moveCtrl(num, dx, dy) {
        var item = this.item;
        item['x' + num] += dx;
        item['y' + num] += dy;
        var pts = [item.x, item.y, item.x1, item.y1, item.x2, item.y2];
        replacePathSeg(this.type, this.index, pts);
        this.update(true);
      }
      /**
       * @param {Integer} newType Possible values set during {@link module:path.init}
       * @param {ArgumentsArray} pts
       * @returns {void}
       */

    }, {
      key: "setType",
      value: function setType(newType, pts) {
        replacePathSeg(newType, this.index, pts);
        this.type = newType;
        this.item = path.elem.pathSegList.getItem(this.index);
        this.showCtrlPts(newType === 6);
        this.ctrlpts = getControlPoints(this);
        this.update(true);
      }
    }]);

    return Segment;
  }();
  /**
  *
  */

  var Path =
  /*#__PURE__*/
  function () {
    /**
    * @param {SVGPathElement} elem
    * @throws {Error} If constructed without a path element
    */
    function Path(elem) {
      _classCallCheck(this, Path);

      if (!elem || elem.tagName !== 'path') {
        throw new Error('svgedit.path.Path constructed without a <path> element');
      }

      this.elem = elem;
      this.segs = [];
      this.selected_pts = [];
      path = this; // eslint-disable-line consistent-this

      this.init();
    }
    /**
    * Reset path data.
    * @returns {module:path.Path}
    */


    _createClass(Path, [{
      key: "init",
      value: function init() {
        // Hide all grips, etc
        // fixed, needed to work on all found elements, not just first
        $$1(getGripContainer()).find('*').each(function () {
          $$1(this).attr('display', 'none');
        });
        var segList = this.elem.pathSegList;
        var len = segList.numberOfItems;
        this.segs = [];
        this.selected_pts = [];
        this.first_seg = null; // Set up segs array

        for (var i = 0; i < len; i++) {
          var item = segList.getItem(i);
          var segment = new Segment(i, item);
          segment.path = this;
          this.segs.push(segment);
        }

        var segs = this.segs;
        var startI = null;

        for (var _i3 = 0; _i3 < len; _i3++) {
          var seg = segs[_i3];
          var nextSeg = _i3 + 1 >= len ? null : segs[_i3 + 1];
          var prevSeg = _i3 - 1 < 0 ? null : segs[_i3 - 1];

          if (seg.type === 2) {
            if (prevSeg && prevSeg.type !== 1) {
              // New sub-path, last one is open,
              // so add a grip to last sub-path's first point
              var startSeg = segs[startI];
              startSeg.next = segs[startI + 1];
              startSeg.next.prev = startSeg;
              startSeg.addGrip();
            } // Remember that this is a starter seg


            startI = _i3;
          } else if (nextSeg && nextSeg.type === 1) {
            // This is the last real segment of a closed sub-path
            // Next is first seg after "M"
            seg.next = segs[startI + 1]; // First seg after "M"'s prev is this

            seg.next.prev = seg;
            seg.mate = segs[startI];
            seg.addGrip();

            if (isNullish(this.first_seg)) {
              this.first_seg = seg;
            }
          } else if (!nextSeg) {
            if (seg.type !== 1) {
              // Last seg, doesn't close so add a grip
              // to last sub-path's first point
              var _startSeg = segs[startI];
              _startSeg.next = segs[startI + 1];
              _startSeg.next.prev = _startSeg;

              _startSeg.addGrip();

              seg.addGrip();

              if (!this.first_seg) {
                // Open path, so set first as real first and add grip
                this.first_seg = segs[startI];
              }
            }
          } else if (seg.type !== 1) {
            // Regular segment, so add grip and its "next"
            seg.addGrip(); // Don't set its "next" if it's an "M"

            if (nextSeg && nextSeg.type !== 2) {
              seg.next = nextSeg;
              seg.next.prev = seg;
            }
          }
        }

        return this;
      }
      /**
      * @callback module:path.PathEachSegCallback
      * @this module:path.Segment
      * @param {Integer} i The index of the seg being iterated
      * @returns {boolean|void} Will stop execution of `eachSeg` if returns `false`
      */

      /**
      * @param {module:path.PathEachSegCallback} fn
      * @returns {void}
      */

    }, {
      key: "eachSeg",
      value: function eachSeg(fn) {
        var len = this.segs.length;

        for (var i = 0; i < len; i++) {
          var ret = fn.call(this.segs[i], i);

          if (ret === false) {
            break;
          }
        }
      }
      /**
      * @param {Integer} index
      * @returns {void}
      */

    }, {
      key: "addSeg",
      value: function addSeg(index) {
        // Adds a new segment
        var seg = this.segs[index];

        if (!seg.prev) {
          return;
        }

        var prev = seg.prev;
        var newseg, newX, newY;

        switch (seg.item.pathSegType) {
          case 4:
            {
              newX = (seg.item.x + prev.item.x) / 2;
              newY = (seg.item.y + prev.item.y) / 2;
              newseg = this.elem.createSVGPathSegLinetoAbs(newX, newY);
              break;
            }

          case 6:
            {
              // make it a curved segment to preserve the shape (WRS)
              // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
              var p0x = (prev.item.x + seg.item.x1) / 2;
              var p1x = (seg.item.x1 + seg.item.x2) / 2;
              var p2x = (seg.item.x2 + seg.item.x) / 2;
              var p01x = (p0x + p1x) / 2;
              var p12x = (p1x + p2x) / 2;
              newX = (p01x + p12x) / 2;
              var p0y = (prev.item.y + seg.item.y1) / 2;
              var p1y = (seg.item.y1 + seg.item.y2) / 2;
              var p2y = (seg.item.y2 + seg.item.y) / 2;
              var p01y = (p0y + p1y) / 2;
              var p12y = (p1y + p2y) / 2;
              newY = (p01y + p12y) / 2;
              newseg = this.elem.createSVGPathSegCurvetoCubicAbs(newX, newY, p0x, p0y, p01x, p01y);
              var pts = [seg.item.x, seg.item.y, p12x, p12y, p2x, p2y];
              replacePathSeg(seg.type, index, pts);
              break;
            }
        }

        insertItemBefore(this.elem, newseg, index);
      }
      /**
      * @param {Integer} index
      * @returns {void}
      */

    }, {
      key: "deleteSeg",
      value: function deleteSeg(index) {
        var seg = this.segs[index];
        var list = this.elem.pathSegList;
        seg.show(false);
        var next = seg.next;

        if (seg.mate) {
          // Make the next point be the "M" point
          var pt = [next.item.x, next.item.y];
          replacePathSeg(2, next.index, pt); // Reposition last node

          replacePathSeg(4, seg.index, pt);
          list.removeItem(seg.mate.index);
        } else if (!seg.prev) {
          // First node of open path, make next point the M
          // const {item} = seg;
          var _pt = [next.item.x, next.item.y];
          replacePathSeg(2, seg.next.index, _pt);
          list.removeItem(index);
        } else {
          list.removeItem(index);
        }
      }
      /**
      * @param {Integer} index
      * @returns {void}
      */

    }, {
      key: "removePtFromSelection",
      value: function removePtFromSelection(index) {
        var pos = this.selected_pts.indexOf(index);

        if (pos === -1) {
          return;
        }

        this.segs[index].select(false);
        this.selected_pts.splice(pos, 1);
      }
      /**
      * @returns {void}
      */

    }, {
      key: "clearSelection",
      value: function clearSelection() {
        this.eachSeg(function () {
          // 'this' is the segment here
          this.select(false);
        });
        this.selected_pts = [];
      }
      /**
      * @returns {void}
      */

    }, {
      key: "storeD",
      value: function storeD() {
        this.last_d = this.elem.getAttribute('d');
      }
      /**
      * @param {Integer} y
      * @returns {Path}
      */

    }, {
      key: "show",
      value: function show(y) {
        // Shows this path's segment grips
        this.eachSeg(function () {
          // 'this' is the segment here
          this.show(y);
        });

        if (y) {
          this.selectPt(this.first_seg.index);
        }

        return this;
      }
      /**
      * Move selected points.
      * @param {Integer} dx
      * @param {Integer} dy
      * @returns {void}
      */

    }, {
      key: "movePts",
      value: function movePts(dx, dy) {
        var i = this.selected_pts.length;

        while (i--) {
          var seg = this.segs[this.selected_pts[i]];
          seg.move(dx, dy);
        }
      }
      /**
      * @param {Integer} dx
      * @param {Integer} dy
      * @returns {void}
      */

    }, {
      key: "moveCtrl",
      value: function moveCtrl(dx, dy) {
        var seg = this.segs[this.selected_pts[0]];
        seg.moveCtrl(this.dragctrl, dx, dy);

        if (linkControlPts) {
          seg.setLinked(this.dragctrl);
        }
      }
      /**
      * @param {?Integer} newType See {@link https://www.w3.org/TR/SVG/single-page.html#paths-InterfaceSVGPathSeg}
      * @returns {void}
      */

    }, {
      key: "setSegType",
      value: function setSegType(newType) {
        this.storeD();
        var i = this.selected_pts.length;
        var text;

        while (i--) {
          var selPt = this.selected_pts[i]; // Selected seg

          var cur = this.segs[selPt];
          var prev = cur.prev;

          if (!prev) {
            continue;
          }

          if (!newType) {
            // double-click, so just toggle
            text = 'Toggle Path Segment Type'; // Toggle segment to curve/straight line

            var oldType = cur.type;
            newType = oldType === 6 ? 4 : 6;
          }

          newType = Number(newType);
          var curX = cur.item.x;
          var curY = cur.item.y;
          var prevX = prev.item.x;
          var prevY = prev.item.y;
          var points = void 0;

          switch (newType) {
            case 6:
              {
                if (cur.olditem) {
                  var old = cur.olditem;
                  points = [curX, curY, old.x1, old.y1, old.x2, old.y2];
                } else {
                  var diffX = curX - prevX;
                  var diffY = curY - prevY; // get control points from straight line segment

                  /*
                  const ct1x = (prevX + (diffY/2));
                  const ct1y = (prevY - (diffX/2));
                  const ct2x = (curX + (diffY/2));
                  const ct2y = (curY - (diffX/2));
                  */
                  // create control points on the line to preserve the shape (WRS)

                  var ct1x = prevX + diffX / 3;
                  var ct1y = prevY + diffY / 3;
                  var ct2x = curX - diffX / 3;
                  var ct2y = curY - diffY / 3;
                  points = [curX, curY, ct1x, ct1y, ct2x, ct2y];
                }

                break;
              }

            case 4:
              {
                points = [curX, curY]; // Store original prevve segment nums

                cur.olditem = cur.item;
                break;
              }
          }

          cur.setType(newType, points);
        }

        path.endChanges(text);
      }
      /**
      * @param {Integer} pt
      * @param {Integer} ctrlNum
      * @returns {void}
      */

    }, {
      key: "selectPt",
      value: function selectPt(pt, ctrlNum) {
        this.clearSelection();

        if (isNullish(pt)) {
          this.eachSeg(function (i) {
            // 'this' is the segment here.
            if (this.prev) {
              pt = i;
            }
          });
        }

        this.addPtsToSelection(pt);

        if (ctrlNum) {
          this.dragctrl = ctrlNum;

          if (linkControlPts) {
            this.segs[pt].setLinked(ctrlNum);
          }
        }
      }
      /**
      * Update position of all points.
      * @returns {Path}
      */

    }, {
      key: "update",
      value: function update() {
        var elem = this.elem;

        if (getRotationAngle(elem)) {
          this.matrix = getMatrix(elem);
          this.imatrix = this.matrix.inverse();
        } else {
          this.matrix = null;
          this.imatrix = null;
        }

        this.eachSeg(function (i) {
          this.item = elem.pathSegList.getItem(i);
          this.update();
        });
        return this;
      }
      /**
      * @param {string} text
      * @returns {void}
      */

    }, {
      key: "endChanges",
      value: function endChanges(text) {
        if (isWebkit()) {
          editorContext_.resetD(this.elem);
        }

        var cmd = new ChangeElementCommand(this.elem, {
          d: this.last_d
        }, text);
        editorContext_.endChanges({
          cmd: cmd,
          elem: this.elem
        });
      }
      /**
      * @param {Integer|Integer[]} indexes
      * @returns {void}
      */

    }, {
      key: "addPtsToSelection",
      value: function addPtsToSelection(indexes) {
        var _this = this;

        if (!Array.isArray(indexes)) {
          indexes = [indexes];
        }

        indexes.forEach(function (index) {
          var seg = _this.segs[index];

          if (seg.ptgrip) {
            if (!_this.selected_pts.includes(index) && index >= 0) {
              _this.selected_pts.push(index);
            }
          }
        });
        this.selected_pts.sort();
        var i = this.selected_pts.length;
        var grips = [];
        grips.length = i; // Loop through points to be selected and highlight each

        while (i--) {
          var pt = this.selected_pts[i];
          var seg = this.segs[pt];
          seg.select(true);
          grips[i] = seg.ptgrip;
        }

        var closedSubpath = Path.subpathIsClosed(this.selected_pts[0]);
        editorContext_.addPtsToSelection({
          grips: grips,
          closedSubpath: closedSubpath
        });
      } // STATIC

      /**
      * @param {Integer} index
      * @returns {boolean}
      */

    }], [{
      key: "subpathIsClosed",
      value: function subpathIsClosed(index) {
        var clsd = false; // Check if subpath is already open

        path.eachSeg(function (i) {
          if (i <= index) {
            return true;
          }

          if (this.type === 2) {
            // Found M first, so open
            return false;
          }

          if (this.type === 1) {
            // Found Z first, so closed
            clsd = true;
            return false;
          }

          return true;
        });
        return clsd;
      }
    }]);

    return Path;
  }();
  /**
  * @function module:path.getPath_
  * @param {SVGPathElement} elem
  * @returns {module:path.Path}
  */

  var getPath_ = function getPath_(elem) {
    var p = pathData[elem.id];

    if (!p) {
      p = pathData[elem.id] = new Path(elem);
    }

    return p;
  };
  /**
  * @function module:path.removePath_
  * @param {string} id
  * @returns {void}
  */

  var removePath_ = function removePath_(id) {
    if (id in pathData) {
      delete pathData[id];
    }
  };
  var newcx, newcy, oldcx, oldcy, angle;

  var getRotVals = function getRotVals(x, y) {
    var dx = x - oldcx;
    var dy = y - oldcy; // rotate the point around the old center

    var r = Math.sqrt(dx * dx + dy * dy);
    var theta = Math.atan2(dy, dx) + angle;
    dx = r * Math.cos(theta) + oldcx;
    dy = r * Math.sin(theta) + oldcy; // dx,dy should now hold the actual coordinates of each
    // point after being rotated
    // now we want to rotate them around the new center in the reverse direction

    dx -= newcx;
    dy -= newcy;
    r = Math.sqrt(dx * dx + dy * dy);
    theta = Math.atan2(dy, dx) - angle;
    return {
      x: r * Math.cos(theta) + newcx,
      y: r * Math.sin(theta) + newcy
    };
  }; // If the path was rotated, we must now pay the piper:
  // Every path point must be rotated into the rotated coordinate system of
  // its old center, then determine the new center, then rotate it back
  // This is because we want the path to remember its rotation

  /**
  * @function module:path.recalcRotatedPath
  * @todo This is still using ye olde transform methods, can probably
  * be optimized or even taken care of by `recalculateDimensions`
  * @returns {void}
  */


  var recalcRotatedPath = function recalcRotatedPath() {
    var currentPath = path.elem;
    angle = getRotationAngle(currentPath, true);

    if (!angle) {
      return;
    } // selectedBBoxes[0] = path.oldbbox;


    var oldbox = path.oldbbox; // selectedBBoxes[0],

    oldcx = oldbox.x + oldbox.width / 2;
    oldcy = oldbox.y + oldbox.height / 2;
    var box = getBBox(currentPath);
    newcx = box.x + box.width / 2;
    newcy = box.y + box.height / 2; // un-rotate the new center to the proper position

    var dx = newcx - oldcx,
        dy = newcy - oldcy,
        r = Math.sqrt(dx * dx + dy * dy),
        theta = Math.atan2(dy, dx) + angle;
    newcx = r * Math.cos(theta) + oldcx;
    newcy = r * Math.sin(theta) + oldcy;
    var list = currentPath.pathSegList;
    var i = list.numberOfItems;

    while (i) {
      i -= 1;
      var seg = list.getItem(i),
          type = seg.pathSegType;

      if (type === 1) {
        continue;
      }

      var rvals = getRotVals(seg.x, seg.y),
          points = [rvals.x, rvals.y];

      if (!isNullish(seg.x1) && !isNullish(seg.x2)) {
        var cVals1 = getRotVals(seg.x1, seg.y1);
        var cVals2 = getRotVals(seg.x2, seg.y2);
        points.splice(points.length, 0, cVals1.x, cVals1.y, cVals2.x, cVals2.y);
      }

      replacePathSeg(type, i, points);
    } // loop for each point

    /* box = */


    getBBox(currentPath); // selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
    // selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;
    // now we must set the new transform to be rotated around the new center

    var Rnc = editorContext_.getSVGRoot().createSVGTransform(),
        tlist = getTransformList(currentPath);
    Rnc.setRotate(angle * 180.0 / Math.PI, newcx, newcy);
    tlist.replaceItem(Rnc, 0);
  }; // ====================================
  // Public API starts here

  /**
  * @function module:path.clearData
  * @returns {void}
  */

  var clearData = function clearData() {
    pathData = {};
  }; // Making public for mocking

  /**
  * @function module:path.reorientGrads
  * @param {Element} elem
  * @param {SVGMatrix} m
  * @returns {void}
  */

  var reorientGrads = function reorientGrads(elem, m) {
    var bb = getBBox(elem);

    for (var i = 0; i < 2; i++) {
      var type = i === 0 ? 'fill' : 'stroke';
      var attrVal = elem.getAttribute(type);

      if (attrVal && attrVal.startsWith('url(')) {
        var grad = getRefElem(attrVal);

        if (grad.tagName === 'linearGradient') {
          var x1 = grad.getAttribute('x1') || 0;
          var y1 = grad.getAttribute('y1') || 0;
          var x2 = grad.getAttribute('x2') || 1;
          var y2 = grad.getAttribute('y2') || 0; // Convert to USOU points

          x1 = bb.width * x1 + bb.x;
          y1 = bb.height * y1 + bb.y;
          x2 = bb.width * x2 + bb.x;
          y2 = bb.height * y2 + bb.y; // Transform those points

          var pt1 = transformPoint(x1, y1, m);
          var pt2 = transformPoint(x2, y2, m); // Convert back to BB points

          var gCoords = {
            x1: (pt1.x - bb.x) / bb.width,
            y1: (pt1.y - bb.y) / bb.height,
            x2: (pt2.x - bb.x) / bb.width,
            y2: (pt2.y - bb.y) / bb.height
          };
          var newgrad = grad.cloneNode(true);
          $$1(newgrad).attr(gCoords);
          newgrad.id = editorContext_.getNextId();
          findDefs().append(newgrad);
          elem.setAttribute(type, 'url(#' + newgrad.id + ')');
        }
      }
    }
  };
  /**
  * This is how we map paths to our preferred relative segment types
  * @name module:path.pathMap
  * @type {GenericArray}
  */

  var pathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a', 'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];
  /**
   * Convert a path to one with only absolute or relative values.
   * @todo move to pathActions.js
   * @function module:path.convertPath
   * @param {SVGPathElement} pth - the path to convert
   * @param {boolean} toRel - true of convert to relative
   * @returns {string}
   */

  var convertPath = function convertPath(pth, toRel) {
    var pathSegList = pth.pathSegList;
    var len = pathSegList.numberOfItems;
    var curx = 0,
        cury = 0;
    var d = '';
    var lastM = null;

    for (var i = 0; i < len; ++i) {
      var seg = pathSegList.getItem(i); // if these properties are not in the segment, set them to zero

      var x = seg.x || 0,
          y = seg.y || 0,
          x1 = seg.x1 || 0,
          y1 = seg.y1 || 0,
          x2 = seg.x2 || 0,
          y2 = seg.y2 || 0;
      var type = seg.pathSegType;
      var letter = pathMap[type]['to' + (toRel ? 'Lower' : 'Upper') + 'Case']();

      switch (type) {
        case 1:
          // z,Z closepath (Z/z)
          d += 'z';

          if (lastM && !toRel) {
            curx = lastM[0];
            cury = lastM[1];
          }

          break;

        case 12:
          // absolute horizontal line (H)
          x -= curx;
        // Fallthrough

        case 13:
          // relative horizontal line (h)
          if (toRel) {
            curx += x;
            letter = 'l';
          } else {
            x += curx;
            curx = x;
            letter = 'L';
          } // Convert to "line" for easier editing


          d += pathDSegment(letter, [[x, cury]]);
          break;

        case 14:
          // absolute vertical line (V)
          y -= cury;
        // Fallthrough

        case 15:
          // relative vertical line (v)
          if (toRel) {
            cury += y;
            letter = 'l';
          } else {
            y += cury;
            cury = y;
            letter = 'L';
          } // Convert to "line" for easier editing


          d += pathDSegment(letter, [[curx, y]]);
          break;

        case 2: // absolute move (M)

        case 4: // absolute line (L)

        case 18:
          // absolute smooth quad (T)
          x -= curx;
          y -= cury;
        // Fallthrough

        case 5: // relative line (l)

        case 3: // relative move (m)

        case 19:
          // relative smooth quad (t)
          if (toRel) {
            curx += x;
            cury += y;
          } else {
            x += curx;
            y += cury;
            curx = x;
            cury = y;
          }

          if (type === 2 || type === 3) {
            lastM = [curx, cury];
          }

          d += pathDSegment(letter, [[x, y]]);
          break;

        case 6:
          // absolute cubic (C)
          x -= curx;
          x1 -= curx;
          x2 -= curx;
          y -= cury;
          y1 -= cury;
          y2 -= cury;
        // Fallthrough

        case 7:
          // relative cubic (c)
          if (toRel) {
            curx += x;
            cury += y;
          } else {
            x += curx;
            x1 += curx;
            x2 += curx;
            y += cury;
            y1 += cury;
            y2 += cury;
            curx = x;
            cury = y;
          }

          d += pathDSegment(letter, [[x1, y1], [x2, y2], [x, y]]);
          break;

        case 8:
          // absolute quad (Q)
          x -= curx;
          x1 -= curx;
          y -= cury;
          y1 -= cury;
        // Fallthrough

        case 9:
          // relative quad (q)
          if (toRel) {
            curx += x;
            cury += y;
          } else {
            x += curx;
            x1 += curx;
            y += cury;
            y1 += cury;
            curx = x;
            cury = y;
          }

          d += pathDSegment(letter, [[x1, y1], [x, y]]);
          break;
        // eslint-disable-next-line sonarjs/no-duplicated-branches

        case 10:
          // absolute elliptical arc (A)
          x -= curx;
          y -= cury;
        // Fallthrough

        case 11:
          // relative elliptical arc (a)
          if (toRel) {
            curx += x;
            cury += y;
          } else {
            x += curx;
            y += cury;
            curx = x;
            cury = y;
          }

          d += pathDSegment(letter, [[seg.r1, seg.r2]], [seg.angle, seg.largeArcFlag ? 1 : 0, seg.sweepFlag ? 1 : 0], [x, y]);
          break;

        case 16:
          // absolute smooth cubic (S)
          x -= curx;
          x2 -= curx;
          y -= cury;
          y2 -= cury;
        // Fallthrough

        case 17:
          // relative smooth cubic (s)
          if (toRel) {
            curx += x;
            cury += y;
          } else {
            x += curx;
            x2 += curx;
            y += cury;
            y2 += cury;
            curx = x;
            cury = y;
          }

          d += pathDSegment(letter, [[x2, y2], [x, y]]);
          break;
      } // switch on path segment type

    } // for each segment


    return d;
  };
  /**
   * TODO: refactor callers in `convertPath` to use `getPathDFromSegments` instead of this function.
   * Legacy code refactored from `svgcanvas.pathActions.convertPath`.
   * @param {string} letter - path segment command (letter in potentially either case from {@link module:path.pathMap}; see [SVGPathSeg#pathSegTypeAsLetter]{@link https://www.w3.org/TR/SVG/single-page.html#paths-__svg__SVGPathSeg__pathSegTypeAsLetter})
   * @param {GenericArray<GenericArray<Integer>>} points - x,y points
   * @param {GenericArray<GenericArray<Integer>>} [morePoints] - x,y points
   * @param {Integer[]} [lastPoint] - x,y point
   * @returns {string}
   */

  function pathDSegment(letter, points, morePoints, lastPoint) {
    $$1.each(points, function (i, pnt) {
      points[i] = shortFloat(pnt);
    });
    var segment = letter + points.join(' ');

    if (morePoints) {
      segment += ' ' + morePoints.join(' ');
    }

    if (lastPoint) {
      segment += ' ' + shortFloat(lastPoint);
    }

    return segment;
  }
  /**
  * Group: Path edit functions
  * Functions relating to editing path elements
  * @namespace {PlainObject} pathActions
  * @memberof module:path
  */


  var pathActions = function () {
    var subpath = false;
    var newPoint, firstCtrl;
    var currentPath = null;
    var hasMoved = false; // No `editorContext_` yet but should be ok as is `null` by default
    // editorContext_.setDrawnPath(null);

    /**
    * This function converts a polyline (created by the fh_path tool) into
    * a path element and coverts every three line segments into a single bezier
    * curve in an attempt to smooth out the free-hand.
    * @function smoothPolylineIntoPath
    * @param {Element} element
    * @returns {Element}
    */

    var smoothPolylineIntoPath = function smoothPolylineIntoPath(element) {
      var i;
      var _element = element,
          points = _element.points;
      var N = points.numberOfItems;

      if (N >= 4) {
        // loop through every 3 points and convert to a cubic bezier curve segment
        //
        // NOTE: this is cheating, it means that every 3 points has the potential to
        // be a corner instead of treating each point in an equal manner. In general,
        // this technique does not look that good.
        //
        // I am open to better ideas!
        //
        // Reading:
        // - http://www.efg2.com/Lab/Graphics/Jean-YvesQueinecBezierCurves.htm
        // - https://www.codeproject.com/KB/graphics/BezierSpline.aspx?msg=2956963
        // - https://www.ian-ko.com/ET_GeoWizards/UserGuide/smooth.htm
        // - https://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
        var curpos = points.getItem(0),
            prevCtlPt = null;
        var d = [];
        d.push(['M', curpos.x, ',', curpos.y, ' C'].join(''));

        for (i = 1; i <= N - 4; i += 3) {
          var ct1 = points.getItem(i);
          var ct2 = points.getItem(i + 1);
          var end = points.getItem(i + 2); // if the previous segment had a control point, we want to smooth out
          // the control points on both sides

          if (prevCtlPt) {
            var newpts = smoothControlPoints(prevCtlPt, ct1, curpos);

            if (newpts && newpts.length === 2) {
              var prevArr = d[d.length - 1].split(',');
              prevArr[2] = newpts[0].x;
              prevArr[3] = newpts[0].y;
              d[d.length - 1] = prevArr.join(',');
              ct1 = newpts[1];
            }
          }

          d.push([ct1.x, ct1.y, ct2.x, ct2.y, end.x, end.y].join(','));
          curpos = end;
          prevCtlPt = ct2;
        } // handle remaining line segments


        d.push('L');

        while (i < N) {
          var pt = points.getItem(i);
          d.push([pt.x, pt.y].join(','));
          i++;
        }

        d = d.join(' '); // create new path element

        element = editorContext_.addSVGElementFromJson({
          element: 'path',
          curStyles: true,
          attr: {
            id: editorContext_.getId(),
            d: d,
            fill: 'none'
          }
        }); // No need to call "changed", as this is already done under mouseUp
      }

      return element;
    };

    return (
      /** @lends module:path.pathActions */
      {
        /**
        * @param {MouseEvent} evt
        * @param {Element} mouseTarget
        * @param {Float} startX
        * @param {Float} startY
        * @returns {boolean|void}
        */
        mouseDown: function mouseDown(evt, mouseTarget, startX, startY) {
          var id;

          if (editorContext_.getCurrentMode() === 'path') {
            var mouseX = startX; // Was this meant to work with the other `mouseX`? (was defined globally so adding `let` to at least avoid a global)

            var mouseY = startY; // Was this meant to work with the other `mouseY`? (was defined globally so adding `let` to at least avoid a global)

            var currentZoom = editorContext_.getCurrentZoom();
            var x = mouseX / currentZoom,
                y = mouseY / currentZoom,
                stretchy = getElem('path_stretch_line');
            newPoint = [x, y];

            if (editorContext_.getGridSnapping()) {
              x = snapToGrid(x);
              y = snapToGrid(y);
              mouseX = snapToGrid(mouseX);
              mouseY = snapToGrid(mouseY);
            }

            if (!stretchy) {
              stretchy = document.createElementNS(NS.SVG, 'path');
              assignAttributes(stretchy, {
                id: 'path_stretch_line',
                stroke: '#22C',
                'stroke-width': '0.5',
                fill: 'none'
              });
              stretchy = getElem('selectorParentGroup').appendChild(stretchy);
            }

            stretchy.setAttribute('display', 'inline');
            var keep = null;
            var index; // if pts array is empty, create path element with M at current point

            var drawnPath = editorContext_.getDrawnPath();

            if (!drawnPath) {
              var dAttr = 'M' + x + ',' + y + ' '; // Was this meant to work with the other `dAttr`? (was defined globally so adding `var` to at least avoid a global)

              /* drawnPath = */

              editorContext_.setDrawnPath(editorContext_.addSVGElementFromJson({
                element: 'path',
                curStyles: true,
                attr: {
                  d: dAttr,
                  id: editorContext_.getNextId(),
                  opacity: editorContext_.getOpacity() / 2
                }
              })); // set stretchy line to first point

              stretchy.setAttribute('d', ['M', mouseX, mouseY, mouseX, mouseY].join(' '));
              index = subpath ? path.segs.length : 0;
              addPointGrip(index, mouseX, mouseY);
            } else {
              // determine if we clicked on an existing point
              var seglist = drawnPath.pathSegList;
              var i = seglist.numberOfItems;
              var FUZZ = 6 / currentZoom;
              var clickOnPoint = false;

              while (i) {
                i--;
                var item = seglist.getItem(i);
                var px = item.x,
                    py = item.y; // found a matching point

                if (x >= px - FUZZ && x <= px + FUZZ && y >= py - FUZZ && y <= py + FUZZ) {
                  clickOnPoint = true;
                  break;
                }
              } // get path element that we are in the process of creating


              id = editorContext_.getId(); // Remove previous path object if previously created

              removePath_(id);
              var newpath = getElem(id);
              var newseg;
              var sSeg;
              var len = seglist.numberOfItems; // if we clicked on an existing point, then we are done this path, commit it
              // (i, i+1) are the x,y that were clicked on

              if (clickOnPoint) {
                // if clicked on any other point but the first OR
                // the first point was clicked on and there are less than 3 points
                // then leave the path open
                // otherwise, close the path
                if (i <= 1 && len >= 2) {
                  // Create end segment
                  var absX = seglist.getItem(0).x;
                  var absY = seglist.getItem(0).y;
                  sSeg = stretchy.pathSegList.getItem(1);

                  if (sSeg.pathSegType === 4) {
                    newseg = drawnPath.createSVGPathSegLinetoAbs(absX, absY);
                  } else {
                    newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(absX, absY, sSeg.x1 / currentZoom, sSeg.y1 / currentZoom, absX, absY);
                  }

                  var endseg = drawnPath.createSVGPathSegClosePath();
                  seglist.appendItem(newseg);
                  seglist.appendItem(endseg);
                } else if (len < 3) {
                  keep = false;
                  return keep;
                }

                $$1(stretchy).remove(); // This will signal to commit the path
                // const element = newpath; // Other event handlers define own `element`, so this was probably not meant to interact with them or one which shares state (as there were none); I therefore adding a missing `var` to avoid a global

                /* drawnPath = */

                editorContext_.setDrawnPath(null);
                editorContext_.setStarted(false);

                if (subpath) {
                  if (path.matrix) {
                    editorContext_.remapElement(newpath, {}, path.matrix.inverse());
                  }

                  var newD = newpath.getAttribute('d');
                  var origD = $$1(path.elem).attr('d');
                  $$1(path.elem).attr('d', origD + newD);
                  $$1(newpath).remove();

                  if (path.matrix) {
                    recalcRotatedPath();
                  }

                  init$1();
                  pathActions.toEditMode(path.elem);
                  path.selectPt();
                  return false;
                } // else, create a new point, update path element

              } else {
                // Checks if current target or parents are #svgcontent
                if (!$$1.contains(editorContext_.getContainer(), editorContext_.getMouseTarget(evt))) {
                  // Clicked outside canvas, so don't make point
                  // console.log('Clicked outside canvas');
                  return false;
                }

                var num = drawnPath.pathSegList.numberOfItems;
                var last = drawnPath.pathSegList.getItem(num - 1);
                var lastx = last.x,
                    lasty = last.y;

                if (evt.shiftKey) {
                  var xya = snapToAngle(lastx, lasty, x, y);
                  x = xya.x;
                  y = xya.y;
                } // Use the segment defined by stretchy


                sSeg = stretchy.pathSegList.getItem(1);

                if (sSeg.pathSegType === 4) {
                  newseg = drawnPath.createSVGPathSegLinetoAbs(editorContext_.round(x), editorContext_.round(y));
                } else {
                  newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(editorContext_.round(x), editorContext_.round(y), sSeg.x1 / currentZoom, sSeg.y1 / currentZoom, sSeg.x2 / currentZoom, sSeg.y2 / currentZoom);
                }

                drawnPath.pathSegList.appendItem(newseg);
                x *= currentZoom;
                y *= currentZoom; // set stretchy line to latest point

                stretchy.setAttribute('d', ['M', x, y, x, y].join(' '));
                index = num;

                if (subpath) {
                  index += path.segs.length;
                }

                addPointGrip(index, x, y);
              } // keep = true;

            }

            return undefined;
          } // TODO: Make sure currentPath isn't null at this point


          if (!path) {
            return undefined;
          }

          path.storeD();
          id = evt.target.id;
          var curPt;

          if (id.substr(0, 14) === 'pathpointgrip_') {
            // Select this point
            curPt = path.cur_pt = parseInt(id.substr(14));
            path.dragging = [startX, startY];
            var seg = path.segs[curPt]; // only clear selection if shift is not pressed (otherwise, add
            // node to selection)

            if (!evt.shiftKey) {
              if (path.selected_pts.length <= 1 || !seg.selected) {
                path.clearSelection();
              }

              path.addPtsToSelection(curPt);
            } else if (seg.selected) {
              path.removePtFromSelection(curPt);
            } else {
              path.addPtsToSelection(curPt);
            }
          } else if (id.startsWith('ctrlpointgrip_')) {
            path.dragging = [startX, startY];
            var parts = id.split('_')[1].split('c');
            curPt = Number(parts[0]);
            var ctrlNum = Number(parts[1]);
            path.selectPt(curPt, ctrlNum);
          } // Start selection box


          if (!path.dragging) {
            var rubberBox = editorContext_.getRubberBox();

            if (isNullish(rubberBox)) {
              rubberBox = editorContext_.setRubberBox(editorContext_.selectorManager.getRubberBandBox());
            }

            var _currentZoom = editorContext_.getCurrentZoom();

            assignAttributes(rubberBox, {
              x: startX * _currentZoom,
              y: startY * _currentZoom,
              width: 0,
              height: 0,
              display: 'inline'
            });
          }

          return undefined;
        },

        /**
        * @param {Float} mouseX
        * @param {Float} mouseY
        * @returns {void}
        */
        mouseMove: function mouseMove(mouseX, mouseY) {
          var currentZoom = editorContext_.getCurrentZoom();
          hasMoved = true;
          var drawnPath = editorContext_.getDrawnPath();

          if (editorContext_.getCurrentMode() === 'path') {
            if (!drawnPath) {
              return;
            }

            var seglist = drawnPath.pathSegList;
            var index = seglist.numberOfItems - 1;

            if (newPoint) {
              // First point
              // if (!index) { return; }
              // Set control points
              var pointGrip1 = addCtrlGrip('1c1');
              var pointGrip2 = addCtrlGrip('0c2'); // dragging pointGrip1

              pointGrip1.setAttribute('cx', mouseX);
              pointGrip1.setAttribute('cy', mouseY);
              pointGrip1.setAttribute('display', 'inline');
              var ptX = newPoint[0];
              var ptY = newPoint[1]; // set curve
              // const seg = seglist.getItem(index);

              var curX = mouseX / currentZoom;
              var curY = mouseY / currentZoom;
              var altX = ptX + (ptX - curX);
              var altY = ptY + (ptY - curY);
              pointGrip2.setAttribute('cx', altX * currentZoom);
              pointGrip2.setAttribute('cy', altY * currentZoom);
              pointGrip2.setAttribute('display', 'inline');
              var ctrlLine = getCtrlLine(1);
              assignAttributes(ctrlLine, {
                x1: mouseX,
                y1: mouseY,
                x2: altX * currentZoom,
                y2: altY * currentZoom,
                display: 'inline'
              });

              if (index === 0) {
                firstCtrl = [mouseX, mouseY];
              } else {
                var last = seglist.getItem(index - 1);
                var lastX = last.x;
                var lastY = last.y;

                if (last.pathSegType === 6) {
                  lastX += lastX - last.x2;
                  lastY += lastY - last.y2;
                } else if (firstCtrl) {
                  lastX = firstCtrl[0] / currentZoom;
                  lastY = firstCtrl[1] / currentZoom;
                }

                replacePathSeg(6, index, [ptX, ptY, lastX, lastY, altX, altY], drawnPath);
              }
            } else {
              var stretchy = getElem('path_stretch_line');

              if (stretchy) {
                var prev = seglist.getItem(index);

                if (prev.pathSegType === 6) {
                  var prevX = prev.x + (prev.x - prev.x2);
                  var prevY = prev.y + (prev.y - prev.y2);
                  replacePathSeg(6, 1, [mouseX, mouseY, prevX * currentZoom, prevY * currentZoom, mouseX, mouseY], stretchy);
                } else if (firstCtrl) {
                  replacePathSeg(6, 1, [mouseX, mouseY, firstCtrl[0], firstCtrl[1], mouseX, mouseY], stretchy);
                } else {
                  replacePathSeg(4, 1, [mouseX, mouseY], stretchy);
                }
              }
            }

            return;
          } // if we are dragging a point, let's move it


          if (path.dragging) {
            var pt = getPointFromGrip({
              x: path.dragging[0],
              y: path.dragging[1]
            }, path);
            var mpt = getPointFromGrip({
              x: mouseX,
              y: mouseY
            }, path);
            var diffX = mpt.x - pt.x;
            var diffY = mpt.y - pt.y;
            path.dragging = [mouseX, mouseY];

            if (path.dragctrl) {
              path.moveCtrl(diffX, diffY);
            } else {
              path.movePts(diffX, diffY);
            }
          } else {
            path.selected_pts = [];
            path.eachSeg(function (i) {
              var seg = this; // eslint-disable-line consistent-this

              if (!seg.next && !seg.prev) {
                return;
              } // const {item} = seg;


              var rubberBox = editorContext_.getRubberBox();
              var rbb = rubberBox.getBBox();
              var pt = getGripPt(seg);
              var ptBb = {
                x: pt.x,
                y: pt.y,
                width: 0,
                height: 0
              };
              var sel = rectsIntersect(rbb, ptBb);
              this.select(sel); // Note that addPtsToSelection is not being run

              if (sel) {
                path.selected_pts.push(seg.index);
              }
            });
          }
        },

        /**
         * @typedef module:path.keepElement
         * @type {PlainObject}
         * @property {boolean} keep
         * @property {Element} element
         */

        /**
        * @param {Event} evt
        * @param {Element} element
        * @param {Float} mouseX
        * @param {Float} mouseY
        * @returns {module:path.keepElement|void}
        */
        mouseUp: function mouseUp(evt, element, mouseX, mouseY) {
          var drawnPath = editorContext_.getDrawnPath(); // Create mode

          if (editorContext_.getCurrentMode() === 'path') {
            newPoint = null;

            if (!drawnPath) {
              element = getElem(editorContext_.getId());
              editorContext_.setStarted(false);
              firstCtrl = null;
            }

            return {
              keep: true,
              element: element
            };
          } // Edit mode


          var rubberBox = editorContext_.getRubberBox();

          if (path.dragging) {
            var lastPt = path.cur_pt;
            path.dragging = false;
            path.dragctrl = false;
            path.update();

            if (hasMoved) {
              path.endChanges('Move path point(s)');
            }

            if (!evt.shiftKey && !hasMoved) {
              path.selectPt(lastPt);
            }
          } else if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
            // Done with multi-node-select
            rubberBox.setAttribute('display', 'none');

            if (rubberBox.getAttribute('width') <= 2 && rubberBox.getAttribute('height') <= 2) {
              pathActions.toSelectMode(evt.target);
            } // else, move back to select mode

          } else {
            pathActions.toSelectMode(evt.target);
          }

          hasMoved = false;
          return undefined;
        },

        /**
        * @param {Element} element
        * @returns {void}
        */
        toEditMode: function toEditMode(element) {
          path = getPath_(element);
          editorContext_.setCurrentMode('pathedit');
          editorContext_.clearSelection();
          path.show(true).update();
          path.oldbbox = getBBox(path.elem);
          subpath = false;
        },

        /**
        * @param {Element} elem
        * @fires module:svgcanvas.SvgCanvas#event:selected
        * @returns {void}
        */
        toSelectMode: function toSelectMode(elem) {
          var selPath = elem === path.elem;
          editorContext_.setCurrentMode('select');
          path.show(false);
          currentPath = false;
          editorContext_.clearSelection();

          if (path.matrix) {
            // Rotated, so may need to re-calculate the center
            recalcRotatedPath();
          }

          if (selPath) {
            editorContext_.call('selected', [elem]);
            editorContext_.addToSelection([elem], true);
          }
        },

        /**
        * @param {boolean} on
        * @returns {void}
        */
        addSubPath: function addSubPath(on) {
          if (on) {
            // Internally we go into "path" mode, but in the UI it will
            // still appear as if in "pathedit" mode.
            editorContext_.setCurrentMode('path');
            subpath = true;
          } else {
            pathActions.clear(true);
            pathActions.toEditMode(path.elem);
          }
        },

        /**
        * @param {Element} target
        * @returns {void}
        */
        select: function select(target) {
          if (currentPath === target) {
            pathActions.toEditMode(target);
            editorContext_.setCurrentMode('pathedit'); // going into pathedit mode
          } else {
            currentPath = target;
          }
        },

        /**
        * @fires module:svgcanvas.SvgCanvas#event:changed
        * @returns {void}
        */
        reorient: function reorient() {
          var elem = editorContext_.getSelectedElements()[0];

          if (!elem) {
            return;
          }

          var angl = getRotationAngle(elem);

          if (angl === 0) {
            return;
          }

          var batchCmd = new BatchCommand('Reorient path');
          var changes = {
            d: elem.getAttribute('d'),
            transform: elem.getAttribute('transform')
          };
          batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
          editorContext_.clearSelection();
          this.resetOrientation(elem);
          editorContext_.addCommandToHistory(batchCmd); // Set matrix to null

          getPath_(elem).show(false).matrix = null;
          this.clear();
          editorContext_.addToSelection([elem], true);
          editorContext_.call('changed', editorContext_.getSelectedElements());
        },

        /**
        * @param {boolean} remove Not in use
        * @returns {void}
        */
        clear: function clear(remove) {
          var drawnPath = editorContext_.getDrawnPath();
          currentPath = null;

          if (drawnPath) {
            var elem = getElem(editorContext_.getId());
            $$1(getElem('path_stretch_line')).remove();
            $$1(elem).remove();
            $$1(getElem('pathpointgrip_container')).find('*').attr('display', 'none');
            firstCtrl = null;
            editorContext_.setDrawnPath(null);
            editorContext_.setStarted(false);
          } else if (editorContext_.getCurrentMode() === 'pathedit') {
            this.toSelectMode();
          }

          if (path) {
            path.init().show(false);
          }
        },

        /**
        * @param {?(Element|SVGPathElement)} pth
        * @returns {false|void}
        */
        resetOrientation: function resetOrientation(pth) {
          if (isNullish(pth) || pth.nodeName !== 'path') {
            return false;
          }

          var tlist = getTransformList(pth);
          var m = transformListToTransform(tlist).matrix;
          tlist.clear();
          pth.removeAttribute('transform');
          var segList = pth.pathSegList; // Opera/win/non-EN throws an error here.
          // TODO: Find out why!
          // Presumed fixed in Opera 10.5, so commented out for now
          // try {

          var len = segList.numberOfItems; // } catch(err) {
          //   const fixed_d = pathActions.convertPath(pth);
          //   pth.setAttribute('d', fixed_d);
          //   segList = pth.pathSegList;
          //   const len = segList.numberOfItems;
          // }
          // let lastX, lastY;

          var _loop = function _loop(i) {
            var seg = segList.getItem(i);
            var type = seg.pathSegType;

            if (type === 1) {
              return "continue";
            }

            var pts = [];
            $$1.each(['', 1, 2], function (j, n) {
              var x = seg['x' + n],
                  y = seg['y' + n];

              if (x !== undefined && y !== undefined) {
                var pt = transformPoint(x, y, m);
                pts.splice(pts.length, 0, pt.x, pt.y);
              }
            });
            replacePathSeg(type, i, pts, pth);
          };

          for (var i = 0; i < len; ++i) {
            var _ret = _loop(i);

            if (_ret === "continue") continue;
          }

          reorientGrads(pth, m);
          return undefined;
        },

        /**
        * @returns {void}
        */
        zoomChange: function zoomChange() {
          if (editorContext_.getCurrentMode() === 'pathedit') {
            path.update();
          }
        },

        /**
        * @typedef {PlainObject} module:path.NodePoint
        * @property {Float} x
        * @property {Float} y
        * @property {Integer} type
        */

        /**
        * @returns {module:path.NodePoint}
        */
        getNodePoint: function getNodePoint() {
          var selPt = path.selected_pts.length ? path.selected_pts[0] : 1;
          var seg = path.segs[selPt];
          return {
            x: seg.item.x,
            y: seg.item.y,
            type: seg.type
          };
        },

        /**
        * @param {boolean} linkPoints
        * @returns {void}
        */
        linkControlPoints: function linkControlPoints(linkPoints) {
          setLinkControlPoints(linkPoints);
        },

        /**
        * @returns {void}
        */
        clonePathNode: function clonePathNode() {
          path.storeD();
          var selPts = path.selected_pts; // const {segs} = path;

          var i = selPts.length;
          var nums = [];

          while (i--) {
            var pt = selPts[i];
            path.addSeg(pt);
            nums.push(pt + i);
            nums.push(pt + i + 1);
          }

          path.init().addPtsToSelection(nums);
          path.endChanges('Clone path node(s)');
        },

        /**
        * @returns {void}
        */
        opencloseSubPath: function opencloseSubPath() {
          var selPts = path.selected_pts; // Only allow one selected node for now

          if (selPts.length !== 1) {
            return;
          }

          var _path = path,
              elem = _path.elem;
          var list = elem.pathSegList; // const len = list.numberOfItems;

          var index = selPts[0];
          var openPt = null;
          var startItem = null; // Check if subpath is already open

          path.eachSeg(function (i) {
            if (this.type === 2 && i <= index) {
              startItem = this.item;
            }

            if (i <= index) {
              return true;
            }

            if (this.type === 2) {
              // Found M first, so open
              openPt = i;
              return false;
            }

            if (this.type === 1) {
              // Found Z first, so closed
              openPt = false;
              return false;
            }

            return true;
          });

          if (isNullish(openPt)) {
            // Single path, so close last seg
            openPt = path.segs.length - 1;
          }

          if (openPt !== false) {
            // Close this path
            // Create a line going to the previous "M"
            var newseg = elem.createSVGPathSegLinetoAbs(startItem.x, startItem.y);
            var closer = elem.createSVGPathSegClosePath();

            if (openPt === path.segs.length - 1) {
              list.appendItem(newseg);
              list.appendItem(closer);
            } else {
              insertItemBefore(elem, closer, openPt);
              insertItemBefore(elem, newseg, openPt);
            }

            path.init().selectPt(openPt + 1);
            return;
          } // M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
          // M 2,2 L 3,3 L 1,1
          // M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z
          // M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z


          var seg = path.segs[index];

          if (seg.mate) {
            list.removeItem(index); // Removes last "L"

            list.removeItem(index); // Removes the "Z"

            path.init().selectPt(index - 1);
            return;
          }

          var lastM, zSeg; // Find this sub-path's closing point and remove

          for (var i = 0; i < list.numberOfItems; i++) {
            var item = list.getItem(i);

            if (item.pathSegType === 2) {
              // Find the preceding M
              lastM = i;
            } else if (i === index) {
              // Remove it
              list.removeItem(lastM); // index--;
            } else if (item.pathSegType === 1 && index < i) {
              // Remove the closing seg of this subpath
              zSeg = i - 1;
              list.removeItem(i);
              break;
            }
          }

          var num = index - lastM - 1;

          while (num--) {
            insertItemBefore(elem, list.getItem(lastM), zSeg);
          }

          var pt = list.getItem(lastM); // Make this point the new "M"

          replacePathSeg(2, lastM, [pt.x, pt.y]); // i = index; // i is local here, so has no effect; what was the intent for this?

          path.init().selectPt(0);
        },

        /**
        * @returns {void}
        */
        deletePathNode: function deletePathNode() {
          if (!pathActions.canDeleteNodes) {
            return;
          }

          path.storeD();
          var selPts = path.selected_pts;
          var i = selPts.length;

          while (i--) {
            var pt = selPts[i];
            path.deleteSeg(pt);
          } // Cleanup


          var cleanup = function cleanup() {
            var segList = path.elem.pathSegList;
            var len = segList.numberOfItems;

            var remItems = function remItems(pos, count) {
              while (count--) {
                segList.removeItem(pos);
              }
            };

            if (len <= 1) {
              return true;
            }

            while (len--) {
              var item = segList.getItem(len);

              if (item.pathSegType === 1) {
                var prev = segList.getItem(len - 1);
                var nprev = segList.getItem(len - 2);

                if (prev.pathSegType === 2) {
                  remItems(len - 1, 2);
                  cleanup();
                  break;
                } else if (nprev.pathSegType === 2) {
                  remItems(len - 2, 3);
                  cleanup();
                  break;
                }
              } else if (item.pathSegType === 2) {
                if (len > 0) {
                  var prevType = segList.getItem(len - 1).pathSegType; // Path has M M

                  if (prevType === 2) {
                    remItems(len - 1, 1);
                    cleanup();
                    break; // Entire path ends with Z M
                  } else if (prevType === 1 && segList.numberOfItems - 1 === len) {
                    remItems(len, 1);
                    cleanup();
                    break;
                  }
                }
              }
            }

            return false;
          };

          cleanup(); // Completely delete a path with 1 or 0 segments

          if (path.elem.pathSegList.numberOfItems <= 1) {
            pathActions.toSelectMode(path.elem);
            editorContext_.canvas.deleteSelectedElements();
            return;
          }

          path.init();
          path.clearSelection(); // TODO: Find right way to select point now
          // path.selectPt(selPt);

          if (window.opera) {
            // Opera repaints incorrectly
            var cp = $$1(path.elem);
            cp.attr('d', cp.attr('d'));
          }

          path.endChanges('Delete path node(s)');
        },
        // Can't seem to use `@borrows` here, so using `@see`

        /**
        * Smooth polyline into path
        * @function module:path.pathActions.smoothPolylineIntoPath
        * @see module:path~smoothPolylineIntoPath
        */
        smoothPolylineIntoPath: smoothPolylineIntoPath,

        /**
        * @param {?Integer} v See {@link https://www.w3.org/TR/SVG/single-page.html#paths-InterfaceSVGPathSeg}
        * @returns {void}
        */
        setSegType: function setSegType(v) {
          path.setSegType(v);
        },

        /**
        * @param {string} attr
        * @param {Float} newValue
        * @returns {void}
        */
        moveNode: function moveNode(attr, newValue) {
          var selPts = path.selected_pts;

          if (!selPts.length) {
            return;
          }

          path.storeD(); // Get first selected point

          var seg = path.segs[selPts[0]];
          var diff = {
            x: 0,
            y: 0
          };
          diff[attr] = newValue - seg.item[attr];
          seg.move(diff.x, diff.y);
          path.endChanges('Move path point');
        },

        /**
        * @param {Element} elem
        * @returns {void}
        */
        fixEnd: function fixEnd(elem) {
          // Adds an extra segment if the last seg before a Z doesn't end
          // at its M point
          // M0,0 L0,100 L100,100 z
          var segList = elem.pathSegList;
          var len = segList.numberOfItems;
          var lastM;

          for (var i = 0; i < len; ++i) {
            var item = segList.getItem(i);

            if (item.pathSegType === 2) {
              lastM = item;
            }

            if (item.pathSegType === 1) {
              var prev = segList.getItem(i - 1);

              if (prev.x !== lastM.x || prev.y !== lastM.y) {
                // Add an L segment here
                var newseg = elem.createSVGPathSegLinetoAbs(lastM.x, lastM.y);
                insertItemBefore(elem, newseg, i); // Can this be done better?

                pathActions.fixEnd(elem);
                break;
              }
            }
          }

          if (isWebkit()) {
            editorContext_.resetD(elem);
          }
        },
        // Can't seem to use `@borrows` here, so using `@see`

        /**
        * Convert a path to one with only absolute or relative values
        * @function module:path.pathActions.convertPath
        * @see module:path.convertPath
        */
        convertPath: convertPath
      }
    );
  }(); // end pathActions

  var $$2 = jQueryPluginSVG(jQuery); // String used to encode base64.

  var KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; // Much faster than running getBBox() every time

  var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
  var visElemsArr = visElems.split(','); // const hidElems = 'clipPath,defs,desc,feGaussianBlur,filter,linearGradient,marker,mask,metadata,pattern,radialGradient,stop,switch,symbol,title,textPath';

  var editorContext_$1 = null;
  var domdoc_ = null;
  var domcontainer_ = null;
  var svgroot_ = null;
  /**
  * Object with the following keys/values
  * @typedef {PlainObject} module:utilities.SVGElementJSON
  * @property {string} element - Tag name of the SVG element to create
  * @property {PlainObject<string, string>} attr - Has key-value attributes to assign to the new element. An `id` should be set so that {@link module:utilities.EditorContext#addSVGElementFromJson} can later re-identify the element for modification or replacement.
  * @property {boolean} [curStyles=false] - Indicates whether current style attributes should be applied first
  * @property {module:utilities.SVGElementJSON[]} [children] - Data objects to be added recursively as children
  * @property {string} [namespace="http://www.w3.org/2000/svg"] - Indicate a (non-SVG) namespace
  */

  /**
   * An object that creates SVG elements for the canvas.
   *
   * @interface module:utilities.EditorContext
   * @property {module:path.pathActions} pathActions
   */

  /**
   * @function module:utilities.EditorContext#getSVGContent
   * @returns {SVGSVGElement}
   */

  /**
   * Create a new SVG element based on the given object keys/values and add it
   * to the current layer.
   * The element will be run through `cleanupElement` before being returned
   * @function module:utilities.EditorContext#addSVGElementFromJson
   * @param {module:utilities.SVGElementJSON} data
   * @returns {Element} The new element
  */

  /**
   * @function module:utilities.EditorContext#getSelectedElements
   * @returns {Element[]} the array with selected DOM elements
  */

  /**
   * @function module:utilities.EditorContext#getDOMDocument
   * @returns {HTMLDocument}
  */

  /**
   * @function module:utilities.EditorContext#getDOMContainer
   * @returns {HTMLElement}
  */

  /**
   * @function module:utilities.EditorContext#getSVGRoot
   * @returns {SVGSVGElement}
  */

  /**
   * @function module:utilities.EditorContext#getBaseUnit
   * @returns {string}
  */

  /**
   * @function module:utilities.EditorContext#getSnappingStep
   * @returns {Float|string}
  */

  /**
  * @function module:utilities.init
  * @param {module:utilities.EditorContext} editorContext
  * @returns {void}
  */

  var init$2 = function init(editorContext) {
    editorContext_$1 = editorContext;
    domdoc_ = editorContext.getDOMDocument();
    domcontainer_ = editorContext.getDOMContainer();
    svgroot_ = editorContext.getSVGRoot();
  };
  /**
   * Used to prevent the [Billion laughs attack]{@link https://en.wikipedia.org/wiki/Billion_laughs_attack}.
   * @function module:utilities.dropXMLInteralSubset
   * @param {string} str String to be processed
   * @returns {string} The string with entity declarations in the internal subset removed
   * @todo This might be needed in other places `parseFromString` is used even without LGTM flagging
   */

  var dropXMLInteralSubset = function dropXMLInteralSubset(str) {
    return str.replace(_wrapRegExp(/(<!DOCTYPE\s+\w*\s*\[).*(\?\]>)/, {
      doctypeOpen: 1,
      doctypeClose: 2
    }), '$<doctypeOpen>$<doctypeClose>');
  };
  /**
  * Converts characters in a string to XML-friendly entities.
  * @function module:utilities.toXml
  * @example `&` becomes `&amp;`
  * @param {string} str - The string to be converted
  * @returns {string} The converted string
  */

  var toXml = function toXml(str) {
    // &apos; is ok in XML, but not HTML
    // &gt; does not normally need escaping, though it can if within a CDATA expression (and preceded by "]]")
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); // Note: `&apos;` is XML only
  };
  // public domain.  It would be nice if you left this header intact.
  // Base64 code from Tyler Akins -- http://rumkin.com
  // schiller: Removed string concatenation in favour of Array.join() optimization,
  //        also precalculate the size of the array needed.

  /**
  * Converts a string to base64.
  * @function module:utilities.encode64
  * @param {string} input
  * @returns {string} Base64 output
  */

  function encode64(input) {
    // base64 strings are 4/3 larger than the original string
    input = encodeUTF8(input); // convert non-ASCII characters
    // input = convertToXMLReferences(input);

    if (window.btoa) {
      return window.btoa(input); // Use native if available
    }

    var output = new Array(Math.floor((input.length + 2) / 3) * 4);
    var i = 0,
        p = 0;

    do {
      var chr1 = input.charCodeAt(i++);
      var chr2 = input.charCodeAt(i++);
      var chr3 = input.charCodeAt(i++);
      /* eslint-disable no-bitwise */

      var enc1 = chr1 >> 2;
      var enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      var enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      var enc4 = chr3 & 63;
      /* eslint-enable no-bitwise */

      if (isNaN(chr2)) {
        enc3 = 64;
        enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output[p++] = KEYSTR.charAt(enc1);
      output[p++] = KEYSTR.charAt(enc2);
      output[p++] = KEYSTR.charAt(enc3);
      output[p++] = KEYSTR.charAt(enc4);
    } while (i < input.length);

    return output.join('');
  }
  /**
  * Converts a string from base64.
  * @function module:utilities.decode64
  * @param {string} input Base64-encoded input
  * @returns {string} Decoded output
  */

  function decode64(input) {
    if (window.atob) {
      return decodeUTF8(window.atob(input));
    } // remove all characters that are not A-Z, a-z, 0-9, +, /, or =


    input = input.replace(/[^A-Za-z0-9+/=]/g, '');
    var output = '';
    var i = 0;

    do {
      var enc1 = KEYSTR.indexOf(input.charAt(i++));
      var enc2 = KEYSTR.indexOf(input.charAt(i++));
      var enc3 = KEYSTR.indexOf(input.charAt(i++));
      var enc4 = KEYSTR.indexOf(input.charAt(i++));
      /* eslint-disable no-bitwise */

      var chr1 = enc1 << 2 | enc2 >> 4;
      var chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      var chr3 = (enc3 & 3) << 6 | enc4;
      /* eslint-enable no-bitwise */

      output += String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }

      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    } while (i < input.length);

    return decodeUTF8(output);
  }
  /**
  * @function module:utilities.decodeUTF8
  * @param {string} argString
  * @returns {string}
  */

  function decodeUTF8(argString) {
    return decodeURIComponent(escape(argString));
  } // codedread:does not seem to work with webkit-based browsers on OSX // Brettz9: please test again as function upgraded

  /**
  * @function module:utilities.encodeUTF8
  * @param {string} argString
  * @returns {string}
  */

  var encodeUTF8 = function encodeUTF8(argString) {
    return unescape(encodeURIComponent(argString));
  };
  /**
   * Convert dataURL to object URL.
   * @function module:utilities.dataURLToObjectURL
   * @param {string} dataurl
   * @returns {string} object URL or empty string
   */

  var dataURLToObjectURL = function dataURLToObjectURL(dataurl) {
    if (typeof Uint8Array === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
      return '';
    }

    var _dataurl$split = dataurl.split(','),
        _dataurl$split2 = _slicedToArray(_dataurl$split, 2),
        prefix = _dataurl$split2[0],
        suffix = _dataurl$split2[1],
        _prefix$match = prefix.match(_wrapRegExp(/:(.*?);/, {
      mime: 1
    })),
        mime = _prefix$match.groups.mime,
        bstr = atob(suffix);

    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    var blob = new Blob([u8arr], {
      type: mime
    });
    return URL.createObjectURL(blob);
  };
  /**
   * Get object URL for a blob object.
   * @function module:utilities.createObjectURL
   * @param {Blob} blob A Blob object or File object
   * @returns {string} object URL or empty string
   */

  var createObjectURL = function createObjectURL(blob) {
    if (!blob || typeof URL === 'undefined' || !URL.createObjectURL) {
      return '';
    }

    return URL.createObjectURL(blob);
  };
  /**
   * @property {string} blankPageObjectURL
   */

  var blankPageObjectURL = function () {
    if (typeof Blob === 'undefined') {
      return '';
    }

    var blob = new Blob(['<html><head><title>SVG-edit</title></head><body>&nbsp;</body></html>'], {
      type: 'text/html'
    });
    return createObjectURL(blob);
  }();
  /**
  * Cross-browser compatible method of converting a string to an XML tree.
  * Found this function [here]{@link http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f}.
  * @function module:utilities.text2xml
  * @param {string} sXML
  * @throws {Error}
  * @returns {XMLDocument}
  */

  var text2xml = function text2xml(sXML) {
    if (sXML.includes('<svg:svg')) {
      // eslint-disable-next-line prefer-named-capture-group
      sXML = sXML.replace(/<(\/?)svg:/g, '<$1').replace('xmlns:svg', 'xmlns');
    }

    var out, dXML;

    try {
      dXML = window.DOMParser ? new DOMParser() : new window.ActiveXObject('Microsoft.XMLDOM');
      dXML.async = false;
    } catch (e) {
      throw new Error('XML Parser could not be instantiated');
    }

    try {
      if (dXML.loadXML) {
        out = dXML.loadXML(sXML) ? dXML : false;
      } else {
        out = dXML.parseFromString(sXML, 'text/xml');
      }
    } catch (e2) {
      throw new Error('Error parsing XML string');
    }

    return out;
  };
  /**
  * @typedef {PlainObject} module:utilities.BBoxObject (like `DOMRect`)
  * @property {Float} x
  * @property {Float} y
  * @property {Float} width
  * @property {Float} height
  */

  /**
  * Converts a `SVGRect` into an object.
  * @function module:utilities.bboxToObj
  * @param {SVGRect} bbox - a SVGRect
  * @returns {module:utilities.BBoxObject} An object with properties names x, y, width, height.
  */

  var bboxToObj = function bboxToObj(_ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;
    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  };
  /**
  * @callback module:utilities.TreeWalker
  * @param {Element} elem - DOM element being traversed
  * @returns {void}
  */

  /**
  * Walks the tree and executes the callback on each element in a top-down fashion.
  * @function module:utilities.walkTree
  * @param {Element} elem - DOM element to traverse
  * @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
  * @returns {void}
  */

  var walkTree = function walkTree(elem, cbFn) {
    if (elem && elem.nodeType === 1) {
      cbFn(elem);
      var i = elem.childNodes.length;

      while (i--) {
        walkTree(elem.childNodes.item(i), cbFn);
      }
    }
  };
  /**
  * Walks the tree and executes the callback on each element in a depth-first fashion.
  * @function module:utilities.walkTreePost
  * @todo FIXME: Shouldn't this be calling walkTreePost?
  * @param {Element} elem - DOM element to traverse
  * @param {module:utilities.TreeWalker} cbFn - Callback function to run on each element
  * @returns {void}
  */

  var walkTreePost = function walkTreePost(elem, cbFn) {
    if (elem && elem.nodeType === 1) {
      var i = elem.childNodes.length;

      while (i--) {
        walkTree(elem.childNodes.item(i), cbFn);
      }

      cbFn(elem);
    }
  };
  /**
  * Extracts the URL from the `url(...)` syntax of some attributes.
  * Three variants:
  *  - `<circle fill="url(someFile.svg#foo)" />`
  *  - `<circle fill="url('someFile.svg#foo')" />`
  *  - `<circle fill='url("someFile.svg#foo")' />`
  * @function module:utilities.getUrlFromAttr
  * @param {string} attrVal The attribute value as a string
  * @returns {string} String with just the URL, like "someFile.svg#foo"
  */

  var getUrlFromAttr = function getUrlFromAttr(attrVal) {
    if (attrVal) {
      // url('#somegrad')
      if (attrVal.startsWith('url("')) {
        return attrVal.substring(5, attrVal.indexOf('"', 6));
      } // url('#somegrad')


      if (attrVal.startsWith("url('")) {
        return attrVal.substring(5, attrVal.indexOf("'", 6));
      }

      if (attrVal.startsWith('url(')) {
        return attrVal.substring(4, attrVal.indexOf(')'));
      }
    }

    return null;
  };
  /**
  * @function module:utilities.getHref
  * @param {Element} elem
  * @returns {string} The given element's `xlink:href` value
  */

  var getHref = function getHref(elem) {
    // eslint-disable-line import/no-mutable-exports
    return elem.getAttributeNS(NS.XLINK, 'href');
  };
  /**
  * Sets the given element's `xlink:href` value.
  * @function module:utilities.setHref
  * @param {Element} elem
  * @param {string} val
  * @returns {void}
  */

  var setHref = function setHref(elem, val) {
    // eslint-disable-line import/no-mutable-exports
    elem.setAttributeNS(NS.XLINK, 'xlink:href', val);
  };
  /**
  * @function module:utilities.findDefs
  * @returns {SVGDefsElement} The document's `<defs>` element, creating it first if necessary
  */

  var findDefs = function findDefs() {
    var svgElement = editorContext_$1.getSVGContent();
    var defs = svgElement.getElementsByTagNameNS(NS.SVG, 'defs');

    if (defs.length > 0) {
      defs = defs[0];
    } else {
      defs = svgElement.ownerDocument.createElementNS(NS.SVG, 'defs');

      if (svgElement.firstChild) {
        // first child is a comment, so call nextSibling
        svgElement.insertBefore(defs, svgElement.firstChild.nextSibling); // svgElement.firstChild.nextSibling.before(defs); // Not safe
      } else {
        svgElement.append(defs);
      }
    }

    return defs;
  }; // TODO(codedread): Consider moving the next to functions to bbox.js

  /**
  * Get correct BBox for a path in Webkit.
  * Converted from code found [here]{@link http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html}.
  * @function module:utilities.getPathBBox
  * @param {SVGPathElement} path - The path DOM element to get the BBox for
  * @returns {module:utilities.BBoxObject} A BBox-like object
  */

  var getPathBBox = function getPathBBox(path) {
    var seglist = path.pathSegList;
    var tot = seglist.numberOfItems;
    var bounds = [[], []];
    var start = seglist.getItem(0);
    var P0 = [start.x, start.y];

    var getCalc = function getCalc(j, P1, P2, P3) {
      return function (t) {
        return 1 - Math.pow(t, 3) * P0[j] + 3 * 1 - Math.pow(t, 2) * t * P1[j] + 3 * (1 - t) * Math.pow(t, 2) * P2[j] + Math.pow(t, 3) * P3[j];
      };
    };

    for (var i = 0; i < tot; i++) {
      var seg = seglist.getItem(i);

      if (seg.x === undefined) {
        continue;
      } // Add actual points to limits


      bounds[0].push(P0[0]);
      bounds[1].push(P0[1]);

      if (seg.x1) {
        var P1 = [seg.x1, seg.y1],
            P2 = [seg.x2, seg.y2],
            P3 = [seg.x, seg.y];

        for (var j = 0; j < 2; j++) {
          var calc = getCalc(j, P1, P2, P3);
          var b = 6 * P0[j] - 12 * P1[j] + 6 * P2[j];
          var a = -3 * P0[j] + 9 * P1[j] - 9 * P2[j] + 3 * P3[j];
          var c = 3 * P1[j] - 3 * P0[j];

          if (a === 0) {
            if (b === 0) {
              continue;
            }

            var t = -c / b;

            if (t > 0 && t < 1) {
              bounds[j].push(calc(t));
            }

            continue;
          }

          var b2ac = Math.pow(b, 2) - 4 * c * a;

          if (b2ac < 0) {
            continue;
          }

          var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);

          if (t1 > 0 && t1 < 1) {
            bounds[j].push(calc(t1));
          }

          var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);

          if (t2 > 0 && t2 < 1) {
            bounds[j].push(calc(t2));
          }
        }

        P0 = P3;
      } else {
        bounds[0].push(seg.x);
        bounds[1].push(seg.y);
      }
    }

    var x = Math.min.apply(null, bounds[0]);
    var w = Math.max.apply(null, bounds[0]) - x;
    var y = Math.min.apply(null, bounds[1]);
    var h = Math.max.apply(null, bounds[1]) - y;
    return {
      x: x,
      y: y,
      width: w,
      height: h
    };
  };
  /**
  * Get the given/selected element's bounding box object, checking for
  * horizontal/vertical lines (see issue 717)
  * Note that performance is currently terrible, so some way to improve would
  * be great.
  * @param {Element} selected - Container or `<use>` DOM element
  * @returns {DOMRect} Bounding box object
  */

  function groupBBFix(selected) {
    if (supportsHVLineContainerBBox()) {
      try {
        return selected.getBBox();
      } catch (e) {}
    }

    var ref = $$2.data(selected, 'ref');
    var matched = null;
    var ret, copy;

    if (ref) {
      copy = $$2(ref).children().clone().attr('visibility', 'hidden');
      $$2(svgroot_).append(copy);
      matched = copy.filter('line, path');
    } else {
      matched = $$2(selected).find('line, path');
    }

    var issue = false;

    if (matched.length) {
      matched.each(function () {
        var bb = this.getBBox();

        if (!bb.width || !bb.height) {
          issue = true;
        }
      });

      if (issue) {
        var elems = ref ? copy : $$2(selected).children();
        ret = getStrokedBBox(elems);
      } else {
        ret = selected.getBBox();
      }
    } else {
      ret = selected.getBBox();
    }

    if (ref) {
      copy.remove();
    }

    return ret;
  }
  /**
  * Get the given/selected element's bounding box object, convert it to be more
  * usable when necessary.
  * @function module:utilities.getBBox
  * @param {Element} elem - Optional DOM element to get the BBox for
  * @returns {module:utilities.BBoxObject} Bounding box object
  */


  var getBBox = function getBBox(elem) {
    var selected = elem || editorContext_$1.geSelectedElements()[0];

    if (elem.nodeType !== 1) {
      return null;
    }

    var elname = selected.nodeName;
    var ret = null;

    switch (elname) {
      case 'text':
        if (selected.textContent === '') {
          selected.textContent = 'a'; // Some character needed for the selector to use.

          ret = selected.getBBox();
          selected.textContent = '';
        } else if (selected.getBBox) {
          ret = selected.getBBox();
        }

        break;

      case 'path':
        if (!supportsPathBBox()) {
          ret = getPathBBox(selected);
        } else if (selected.getBBox) {
          ret = selected.getBBox();
        }

        break;

      case 'g':
      case 'a':
        ret = groupBBFix(selected);
        break;

      default:
        if (elname === 'use') {
          ret = groupBBFix(selected); // , true);
        }

        if (elname === 'use' || elname === 'foreignObject' && isWebkit()) {
          if (!ret) {
            ret = selected.getBBox();
          } // This is resolved in later versions of webkit, perhaps we should
          // have a featured detection for correct 'use' behavior?
          // ——————————


          if (!isWebkit()) {
            var _ret = ret,
                x = _ret.x,
                y = _ret.y,
                width = _ret.width,
                height = _ret.height;
            var bb = {
              width: width,
              height: height,
              x: x + parseFloat(selected.getAttribute('x') || 0),
              y: y + parseFloat(selected.getAttribute('y') || 0)
            };
            ret = bb;
          }
        } else if (visElemsArr.includes(elname)) {
          if (selected) {
            try {
              ret = selected.getBBox();
            } catch (err) {
              // tspan (and textPath apparently) have no `getBBox` in Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=937268
              // Re: Chrome returning bbox for containing text element, see: https://bugs.chromium.org/p/chromium/issues/detail?id=349835
              var extent = selected.getExtentOfChar(0); // pos+dimensions of the first glyph

              var _width = selected.getComputedTextLength(); // width of the tspan


              ret = {
                x: extent.x,
                y: extent.y,
                width: _width,
                height: extent.height
              };
            }
          } else {
            // Check if element is child of a foreignObject
            var fo = $$2(selected).closest('foreignObject');

            if (fo.length) {
              if (fo[0].getBBox) {
                ret = fo[0].getBBox();
              }
            }
          }
        }

    }

    if (ret) {
      ret = bboxToObj(ret);
    } // get the bounding box from the DOM (which is in that element's coordinate system)


    return ret;
  };
  /**
  * @typedef {GenericArray} module:utilities.PathSegmentArray
  * @property {Integer} length 2
  * @property {"M"|"L"|"C"|"Z"} 0
  * @property {Float[]} 1
  */

  /**
  * Create a path 'd' attribute from path segments.
  * Each segment is an array of the form: `[singleChar, [x,y, x,y, ...]]`
  * @function module:utilities.getPathDFromSegments
  * @param {module:utilities.PathSegmentArray[]} pathSegments - An array of path segments to be converted
  * @returns {string} The converted path d attribute.
  */

  var getPathDFromSegments = function getPathDFromSegments(pathSegments) {
    var d = '';
    $$2.each(pathSegments, function (j, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          singleChar = _ref3[0],
          pts = _ref3[1];

      d += singleChar;

      for (var i = 0; i < pts.length; i += 2) {
        d += pts[i] + ',' + pts[i + 1] + ' ';
      }
    });
    return d;
  };
  /**
  * Make a path 'd' attribute from a simple SVG element shape.
  * @function module:utilities.getPathDFromElement
  * @param {Element} elem - The element to be converted
  * @returns {string} The path d attribute or `undefined` if the element type is unknown.
  */

  var getPathDFromElement = function getPathDFromElement(elem) {
    // Possibly the cubed root of 6, but 1.81 works best
    var num = 1.81;
    var d, a, rx, ry;

    switch (elem.tagName) {
      case 'ellipse':
      case 'circle':
        {
          a = $$2(elem).attr(['rx', 'ry', 'cx', 'cy']);
          var _a = a,
              cx = _a.cx,
              cy = _a.cy;
          var _a2 = a;
          rx = _a2.rx;
          ry = _a2.ry;

          if (elem.tagName === 'circle') {
            ry = $$2(elem).attr('r');
            rx = ry;
          }

          d = getPathDFromSegments([['M', [cx - rx, cy]], ['C', [cx - rx, cy - ry / num, cx - rx / num, cy - ry, cx, cy - ry]], ['C', [cx + rx / num, cy - ry, cx + rx, cy - ry / num, cx + rx, cy]], ['C', [cx + rx, cy + ry / num, cx + rx / num, cy + ry, cx, cy + ry]], ['C', [cx - rx / num, cy + ry, cx - rx, cy + ry / num, cx - rx, cy]], ['Z', []]]);
          break;
        }

      case 'path':
        d = elem.getAttribute('d');
        break;

      case 'line':
        a = $$2(elem).attr(['x1', 'y1', 'x2', 'y2']);
        d = 'M' + a.x1 + ',' + a.y1 + 'L' + a.x2 + ',' + a.y2;
        break;

      case 'polyline':
        d = 'M' + elem.getAttribute('points');
        break;

      case 'polygon':
        d = 'M' + elem.getAttribute('points') + ' Z';
        break;

      case 'rect':
        {
          var r = $$2(elem).attr(['rx', 'ry']);
          rx = r.rx;
          ry = r.ry;
          var b = elem.getBBox();
          var x = b.x,
              y = b.y,
              w = b.width,
              h = b.height;
          num = 4 - num; // Why? Because!

          if (!rx && !ry) {
            // Regular rect
            d = getPathDFromSegments([['M', [x, y]], ['L', [x + w, y]], ['L', [x + w, y + h]], ['L', [x, y + h]], ['L', [x, y]], ['Z', []]]);
          } else {
            d = getPathDFromSegments([['M', [x, y + ry]], ['C', [x, y + ry / num, x + rx / num, y, x + rx, y]], ['L', [x + w - rx, y]], ['C', [x + w - rx / num, y, x + w, y + ry / num, x + w, y + ry]], ['L', [x + w, y + h - ry]], ['C', [x + w, y + h - ry / num, x + w - rx / num, y + h, x + w - rx, y + h]], ['L', [x + rx, y + h]], ['C', [x + rx / num, y + h, x, y + h - ry / num, x, y + h - ry]], ['L', [x, y + ry]], ['Z', []]]);
          }

          break;
        }

      default:
        break;
    }

    return d;
  };
  /**
  * Get a set of attributes from an element that is useful for convertToPath.
  * @function module:utilities.getExtraAttributesForConvertToPath
  * @param {Element} elem - The element to be probed
  * @returns {PlainObject<"marker-start"|"marker-end"|"marker-mid"|"filter"|"clip-path", string>} An object with attributes.
  */

  var getExtraAttributesForConvertToPath = function getExtraAttributesForConvertToPath(elem) {
    var attrs = {}; // TODO: make this list global so that we can properly maintain it
    // TODO: what about @transform, @clip-rule, @fill-rule, etc?

    $$2.each(['marker-start', 'marker-end', 'marker-mid', 'filter', 'clip-path'], function () {
      var a = elem.getAttribute(this);

      if (a) {
        attrs[this] = a;
      }
    });
    return attrs;
  };
  /**
  * Get the BBox of an element-as-path.
  * @function module:utilities.getBBoxOfElementAsPath
  * @param {Element} elem - The DOM element to be probed
  * @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
  * @param {module:path.pathActions} pathActions - If a transform exists, `pathActions.resetOrientation()` is used. See: canvas.pathActions.
  * @returns {DOMRect|false} The resulting path's bounding box object.
  */

  var getBBoxOfElementAsPath = function getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions) {
    var path = addSVGElementFromJson({
      element: 'path',
      attr: getExtraAttributesForConvertToPath(elem)
    });
    var eltrans = elem.getAttribute('transform');

    if (eltrans) {
      path.setAttribute('transform', eltrans);
    }

    var parentNode = elem.parentNode;

    if (elem.nextSibling) {
      elem.before(path);
    } else {
      parentNode.append(path);
    }

    var d = getPathDFromElement(elem);

    if (d) {
      path.setAttribute('d', d);
    } else {
      path.remove();
    } // Get the correct BBox of the new path, then discard it


    pathActions.resetOrientation(path);
    var bb = false;

    try {
      bb = path.getBBox();
    } catch (e) {// Firefox fails
    }

    path.remove();
    return bb;
  };
  /**
  * Convert selected element to a path.
  * @function module:utilities.convertToPath
  * @param {Element} elem - The DOM element to be converted
  * @param {module:utilities.SVGElementJSON} attrs - Apply attributes to new path. see canvas.convertToPath
  * @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
  * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
  * @param {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection} clearSelection - see [canvas.clearSelection]{@link module:svgcanvas.SvgCanvas#clearSelection}
  * @param {module:path.EditorContext#addToSelection} addToSelection - see [canvas.addToSelection]{@link module:svgcanvas.SvgCanvas#addToSelection}
  * @param {module:history} hstry - see history module
  * @param {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory} addCommandToHistory - see [canvas.addCommandToHistory]{@link module:svgcanvas~addCommandToHistory}
  * @returns {SVGPathElement|null} The converted path element or null if the DOM element was not recognized.
  */

  var convertToPath = function convertToPath(elem, attrs, addSVGElementFromJson, pathActions, clearSelection, addToSelection, hstry, addCommandToHistory) {
    var batchCmd = new hstry.BatchCommand('Convert element to Path'); // Any attribute on the element not covered by the passed-in attributes

    attrs = $$2.extend({}, attrs, getExtraAttributesForConvertToPath(elem));
    var path = addSVGElementFromJson({
      element: 'path',
      attr: attrs
    });
    var eltrans = elem.getAttribute('transform');

    if (eltrans) {
      path.setAttribute('transform', eltrans);
    }

    var id = elem.id;
    var parentNode = elem.parentNode;

    if (elem.nextSibling) {
      elem.before(path);
    } else {
      parentNode.append(path);
    }

    var d = getPathDFromElement(elem);

    if (d) {
      path.setAttribute('d', d); // Replace the current element with the converted one
      // Reorient if it has a matrix

      if (eltrans) {
        var tlist = getTransformList(path);

        if (hasMatrixTransform(tlist)) {
          pathActions.resetOrientation(path);
        }
      }

      var nextSibling = elem.nextSibling;
      batchCmd.addSubCommand(new hstry.RemoveElementCommand(elem, nextSibling, parent));
      batchCmd.addSubCommand(new hstry.InsertElementCommand(path));
      clearSelection();
      elem.remove();
      path.setAttribute('id', id);
      path.removeAttribute('visibility');
      addToSelection([path], true);
      addCommandToHistory(batchCmd);
      return path;
    } // the elem.tagName was not recognized, so no "d" attribute. Remove it, so we've haven't changed anything.


    path.remove();
    return null;
  };
  /**
  * Can the bbox be optimized over the native getBBox? The optimized bbox is the same as the native getBBox when
  * the rotation angle is a multiple of 90 degrees and there are no complex transforms.
  * Getting an optimized bbox can be dramatically slower, so we want to make sure it's worth it.
  *
  * The best example for this is a circle rotate 45 degrees. The circle doesn't get wider or taller when rotated
  * about it's center.
  *
  * The standard, unoptimized technique gets the native bbox of the circle, rotates the box 45 degrees, uses
  * that width and height, and applies any transforms to get the final bbox. This means the calculated bbox
  * is much wider than the original circle. If the angle had been 0, 90, 180, etc. both techniques render the
  * same bbox.
  *
  * The optimization is not needed if the rotation is a multiple 90 degrees. The default technique is to call
  * getBBox then apply the angle and any transforms.
  *
  * @param {Float} angle - The rotation angle in degrees
  * @param {boolean} hasAMatrixTransform - True if there is a matrix transform
  * @returns {boolean} True if the bbox can be optimized.
  */

  function bBoxCanBeOptimizedOverNativeGetBBox(angle, hasAMatrixTransform) {
    var angleModulo90 = angle % 90;
    var closeTo90 = angleModulo90 < -89.99 || angleModulo90 > 89.99;
    var closeTo0 = angleModulo90 > -0.001 && angleModulo90 < 0.001;
    return hasAMatrixTransform || !(closeTo0 || closeTo90);
  }
  /**
  * Get bounding box that includes any transforms.
  * @function module:utilities.getBBoxWithTransform
  * @param {Element} elem - The DOM element to be converted
  * @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
  * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
  * @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect} A single bounding box object
  */


  var getBBoxWithTransform = function getBBoxWithTransform(elem, addSVGElementFromJson, pathActions) {
    // TODO: Fix issue with rotated groups. Currently they work
    // fine in FF, but not in other browsers (same problem mentioned
    // in Issue 339 comment #2).
    var bb = getBBox(elem);

    if (!bb) {
      return null;
    }

    var tlist = getTransformList(elem);
    var angle = getRotationAngleFromTransformList(tlist);
    var hasMatrixXForm = hasMatrixTransform(tlist);

    if (angle || hasMatrixXForm) {
      var goodBb = false;

      if (bBoxCanBeOptimizedOverNativeGetBBox(angle, hasMatrixXForm)) {
        // Get the BBox from the raw path for these elements
        // TODO: why ellipse and not circle
        var elemNames = ['ellipse', 'path', 'line', 'polyline', 'polygon'];

        if (elemNames.includes(elem.tagName)) {
          goodBb = getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
          bb = goodBb;
        } else if (elem.tagName === 'rect') {
          // Look for radius
          var rx = elem.getAttribute('rx');
          var ry = elem.getAttribute('ry');

          if (rx || ry) {
            goodBb = getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
            bb = goodBb;
          }
        }
      }

      if (!goodBb) {
        var _transformListToTrans = transformListToTransform(tlist),
            matrix = _transformListToTrans.matrix;

        bb = transformBox(bb.x, bb.y, bb.width, bb.height, matrix).aabox; // Old technique that was exceedingly slow with large documents.
        //
        // Accurate way to get BBox of rotated element in Firefox:
        // Put element in group and get its BBox
        //
        // Must use clone else FF freaks out
        // const clone = elem.cloneNode(true);
        // const g = document.createElementNS(NS.SVG, 'g');
        // const parent = elem.parentNode;
        // parent.append(g);
        // g.append(clone);
        // const bb2 = bboxToObj(g.getBBox());
        // g.remove();
      }
    }

    return bb;
  };
  /**
   * @param {Element} elem
   * @returns {Float}
   * @todo This is problematic with large stroke-width and, for example, a single
   * horizontal line. The calculated BBox extends way beyond left and right sides.
   */

  function getStrokeOffsetForBBox(elem) {
    var sw = elem.getAttribute('stroke-width');
    return !isNaN(sw) && elem.getAttribute('stroke') !== 'none' ? sw / 2 : 0;
  }
  /**
   * @typedef {PlainObject} BBox
   * @property {Integer} x The x value
   * @property {Integer} y The y value
   * @property {Float} width
   * @property {Float} height
   */

  /**
  * Get the bounding box for one or more stroked and/or transformed elements.
  * @function module:utilities.getStrokedBBox
  * @param {Element[]} elems - Array with DOM elements to check
  * @param {module:utilities.EditorContext#addSVGElementFromJson} addSVGElementFromJson - Function to add the path element to the current layer. See canvas.addSVGElementFromJson
  * @param {module:path.pathActions} pathActions - If a transform exists, pathActions.resetOrientation() is used. See: canvas.pathActions.
  * @returns {module:utilities.BBoxObject|module:math.TransformedBox|DOMRect} A single bounding box object
  */


  var getStrokedBBox = function getStrokedBBox(elems, addSVGElementFromJson, pathActions) {
    if (!elems || !elems.length) {
      return false;
    }

    var fullBb;
    $$2.each(elems, function () {
      if (fullBb) {
        return;
      }

      if (!this.parentNode) {
        return;
      }

      fullBb = getBBoxWithTransform(this, addSVGElementFromJson, pathActions);
    }); // This shouldn't ever happen...

    if (fullBb === undefined) {
      return null;
    } // fullBb doesn't include the stoke, so this does no good!
    // if (elems.length == 1) return fullBb;


    var maxX = fullBb.x + fullBb.width;
    var maxY = fullBb.y + fullBb.height;
    var minX = fullBb.x;
    var minY = fullBb.y; // If only one elem, don't call the potentially slow getBBoxWithTransform method again.

    if (elems.length === 1) {
      var offset = getStrokeOffsetForBBox(elems[0]);
      minX -= offset;
      minY -= offset;
      maxX += offset;
      maxY += offset;
    } else {
      $$2.each(elems, function (i, elem) {
        var curBb = getBBoxWithTransform(elem, addSVGElementFromJson, pathActions);

        if (curBb) {
          var _offset = getStrokeOffsetForBBox(elem);

          minX = Math.min(minX, curBb.x - _offset);
          minY = Math.min(minY, curBb.y - _offset); // TODO: The old code had this test for max, but not min. I suspect this test should be for both min and max

          if (elem.nodeType === 1) {
            maxX = Math.max(maxX, curBb.x + curBb.width + _offset);
            maxY = Math.max(maxY, curBb.y + curBb.height + _offset);
          }
        }
      });
    }

    fullBb.x = minX;
    fullBb.y = minY;
    fullBb.width = maxX - minX;
    fullBb.height = maxY - minY;
    return fullBb;
  };
  /**
  * Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
  * Note that 0-opacity, off-screen etc elements are still considered "visible"
  * for this function.
  * @function module:utilities.getVisibleElements
  * @param {Element} parentElement - The parent DOM element to search within
  * @returns {Element[]} All "visible" elements.
  */

  var getVisibleElements = function getVisibleElements(parentElement) {
    if (!parentElement) {
      parentElement = $$2(editorContext_$1.getSVGContent()).children(); // Prevent layers from being included
    }

    var contentElems = [];
    $$2(parentElement).children().each(function (i, elem) {
      if (elem.getBBox) {
        contentElems.push(elem);
      }
    });
    return contentElems.reverse();
  };
  /**
  * Get the bounding box for one or more stroked and/or transformed elements.
  * @function module:utilities.getStrokedBBoxDefaultVisible
  * @param {Element[]} elems - Array with DOM elements to check
  * @returns {module:utilities.BBoxObject} A single bounding box object
  */

  var getStrokedBBoxDefaultVisible = function getStrokedBBoxDefaultVisible(elems) {
    if (!elems) {
      elems = getVisibleElements();
    }

    return getStrokedBBox(elems, editorContext_$1.addSVGElementFromJson, editorContext_$1.pathActions);
  };
  /**
  * Get the rotation angle of the given transform list.
  * @function module:utilities.getRotationAngleFromTransformList
  * @param {SVGTransformList} tlist - List of transforms
  * @param {boolean} toRad - When true returns the value in radians rather than degrees
  * @returns {Float} The angle in degrees or radians
  */

  var getRotationAngleFromTransformList = function getRotationAngleFromTransformList(tlist, toRad) {
    if (!tlist) {
      return 0;
    } // <svg> elements have no tlist


    var N = tlist.numberOfItems;

    for (var i = 0; i < N; ++i) {
      var xform = tlist.getItem(i);

      if (xform.type === 4) {
        return toRad ? xform.angle * Math.PI / 180.0 : xform.angle;
      }
    }

    return 0.0;
  };
  /**
  * Get the rotation angle of the given/selected DOM element.
  * @function module:utilities.getRotationAngle
  * @param {Element} [elem] - DOM element to get the angle for. Default to first of selected elements.
  * @param {boolean} [toRad=false] - When true returns the value in radians rather than degrees
  * @returns {Float} The angle in degrees or radians
  */

  var getRotationAngle = function getRotationAngle(elem, toRad) {
    // eslint-disable-line import/no-mutable-exports
    var selected = elem || editorContext_$1.getSelectedElements()[0]; // find the rotation transform (if any) and set it

    var tlist = getTransformList(selected);
    return getRotationAngleFromTransformList(tlist, toRad);
  };
  /**
  * Get the reference element associated with the given attribute value.
  * @function module:utilities.getRefElem
  * @param {string} attrVal - The attribute value as a string
  * @returns {Element} Reference element
  */

  var getRefElem = function getRefElem(attrVal) {
    return getElem(getUrlFromAttr(attrVal).substr(1));
  };
  /**
  * Get a DOM element by ID within the SVG root element.
  * @function module:utilities.getElem
  * @param {string} id - String with the element's new ID
  * @returns {?Element}
  */

  var getElem = supportsSelectors() ? function (id) {
    // querySelector lookup
    return svgroot_.querySelector('#' + id);
  } : supportsXpath() ? function (id) {
    // xpath lookup
    return domdoc_.evaluate('svg:svg[@id="svgroot"]//svg:*[@id="' + id + '"]', domcontainer_, function () {
      return NS.SVG;
    }, 9, null).singleNodeValue;
  } : function (id) {
    // jQuery lookup: twice as slow as xpath in FF
    return $$2(svgroot_).find('[id=' + id + ']')[0];
  };
  /**
  * Assigns multiple attributes to an element.
  * @function module:utilities.assignAttributes
  * @param {Element} elem - DOM element to apply new attribute values to
  * @param {PlainObject<string, string>} attrs - Object with attribute keys/values
  * @param {Integer} [suspendLength] - Milliseconds to suspend redraw
  * @param {boolean} [unitCheck=false] - Boolean to indicate the need to use units.setUnitAttr
  * @returns {void}
  */

  var assignAttributes = function assignAttributes(elem, attrs, suspendLength, unitCheck) {
    for (var _i = 0, _Object$entries = Object.entries(attrs); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      var ns = key.substr(0, 4) === 'xml:' ? NS.XML : key.substr(0, 6) === 'xlink:' ? NS.XLINK : null;

      if (ns) {
        elem.setAttributeNS(ns, key, value);
      } else if (!unitCheck) {
        elem.setAttribute(key, value);
      } else {
        setUnitAttr(elem, key, value);
      }
    }
  };
  /**
  * Remove unneeded (default) attributes, making resulting SVG smaller.
  * @function module:utilities.cleanupElement
  * @param {Element} element - DOM element to clean up
  * @returns {void}
  */

  var cleanupElement = function cleanupElement(element) {
    var defaults = {
      'fill-opacity': 1,
      'stop-opacity': 1,
      opacity: 1,
      stroke: 'none',
      'stroke-dasharray': 'none',
      'stroke-linejoin': 'miter',
      'stroke-linecap': 'butt',
      'stroke-opacity': 1,
      'stroke-width': 1,
      rx: 0,
      ry: 0
    };

    if (element.nodeName === 'ellipse') {
      // Ellipse elements require rx and ry attributes
      delete defaults.rx;
      delete defaults.ry;
    }

    Object.entries(defaults).forEach(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          attr = _ref5[0],
          val = _ref5[1];

      if (element.getAttribute(attr) === String(val)) {
        element.removeAttribute(attr);
      }
    });
  };
  /**
  * Round value to for snapping.
  * @function module:utilities.snapToGrid
  * @param {Float} value
  * @returns {Integer}
  */

  var snapToGrid = function snapToGrid(value) {
    var unit = editorContext_$1.getBaseUnit();
    var stepSize = editorContext_$1.getSnappingStep();

    if (unit !== 'px') {
      stepSize *= getTypeMap()[unit];
    }

    value = Math.round(value / stepSize) * stepSize;
    return value;
  };
  /**
   * Prevents default browser click behaviour on the given element.
   * @function module:utilities.preventClickDefault
   * @param {Element} img - The DOM element to prevent the click on
   * @returns {void}
   */

  var preventClickDefault = function preventClickDefault(img) {
    $$2(img).click(function (e) {
      e.preventDefault();
    });
  };
  /**
   * @callback module:utilities.GetNextID
   * @returns {string} The ID
   */

  /**
   * Create a clone of an element, updating its ID and its children's IDs when needed.
   * @function module:utilities.copyElem
   * @param {Element} el - DOM element to clone
   * @param {module:utilities.GetNextID} getNextId - The getter of the next unique ID.
   * @returns {Element} The cloned element
   */

  var copyElem = function copyElem(el, getNextId) {
    // manually create a copy of the element
    var newEl = document.createElementNS(el.namespaceURI, el.nodeName);
    $$2.each(el.attributes, function (i, attr) {
      if (attr.localName !== '-moz-math-font-style') {
        newEl.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.value);
      }
    }); // set the copied element's new id

    newEl.removeAttribute('id');
    newEl.id = getNextId(); // Opera's "d" value needs to be reset for Opera/Win/non-EN
    // Also needed for webkit (else does not keep curved segments on clone)

    if (isWebkit() && el.nodeName === 'path') {
      var fixedD = convertPath(el);
      newEl.setAttribute('d', fixedD);
    } // now create copies of all children


    $$2.each(el.childNodes, function (i, child) {
      switch (child.nodeType) {
        case 1:
          // element node
          newEl.append(copyElem(child, getNextId));
          break;

        case 3:
          // text node
          newEl.textContent = child.nodeValue;
          break;

        default:
          break;
      }
    });

    if ($$2(el).data('gsvg')) {
      $$2(newEl).data('gsvg', newEl.firstChild);
    } else if ($$2(el).data('symbol')) {
      var ref = $$2(el).data('symbol');
      $$2(newEl).data('ref', ref).data('symbol', ref);
    } else if (newEl.tagName === 'image') {
      preventClickDefault(newEl);
    }

    return newEl;
  };
  /**
   * Whether a value is `null` or `undefined`.
   * @param {any} val
   * @returns {boolean}
   */

  var isNullish = function isNullish(val) {
    return val === null || val === undefined;
  };

  var $$3 = jQuery;
  /**
   * This class encapsulates the concept of a layer in the drawing. It can be constructed with
   * an existing group element or, with three parameters, will create a new layer group element.
   *
   * @example
   * const l1 = new Layer('name', group);          // Use the existing group for this layer.
   * const l2 = new Layer('name', group, svgElem); // Create a new group and add it to the DOM after group.
   * const l3 = new Layer('name', null, svgElem);  // Create a new group and add it to the DOM as the last layer.
   * @memberof module:layer
   */

  var Layer =
  /*#__PURE__*/
  function () {
    /**
    * @param {string} name - Layer name
    * @param {SVGGElement|null} group - An existing SVG group element or null.
    *     If group and no svgElem, use group for this layer.
    *     If group and svgElem, create a new group element and insert it in the DOM after group.
    *     If no group and svgElem, create a new group element and insert it in the DOM as the last layer.
    * @param {SVGGElement} [svgElem] - The SVG DOM element. If defined, use this to add
    *     a new layer to the document.
    */
    function Layer(name, group, svgElem) {
      _classCallCheck(this, Layer);

      this.name_ = name;
      this.group_ = svgElem ? null : group;

      if (svgElem) {
        // Create a group element with title and add it to the DOM.
        var svgdoc = svgElem.ownerDocument;
        this.group_ = svgdoc.createElementNS(NS.SVG, 'g');
        var layerTitle = svgdoc.createElementNS(NS.SVG, 'title');
        layerTitle.textContent = name;
        this.group_.append(layerTitle);

        if (group) {
          $$3(group).after(this.group_);
        } else {
          svgElem.append(this.group_);
        }
      }

      addLayerClass(this.group_);
      walkTree(this.group_, function (e) {
        e.setAttribute('style', 'pointer-events:inherit');
      });
      this.group_.setAttribute('style', svgElem ? 'pointer-events:all' : 'pointer-events:none');
    }
    /**
     * Get the layer's name.
     * @returns {string} The layer name
     */


    _createClass(Layer, [{
      key: "getName",
      value: function getName() {
        return this.name_;
      }
      /**
       * Get the group element for this layer.
       * @returns {SVGGElement} The layer SVG group
       */

    }, {
      key: "getGroup",
      value: function getGroup() {
        return this.group_;
      }
      /**
       * Active this layer so it takes pointer events.
       * @returns {void}
       */

    }, {
      key: "activate",
      value: function activate() {
        this.group_.setAttribute('style', 'pointer-events:all');
      }
      /**
       * Deactive this layer so it does NOT take pointer events.
       * @returns {void}
       */

    }, {
      key: "deactivate",
      value: function deactivate() {
        this.group_.setAttribute('style', 'pointer-events:none');
      }
      /**
       * Set this layer visible or hidden based on 'visible' parameter.
       * @param {boolean} visible - If true, make visible; otherwise, hide it.
       * @returns {void}
       */

    }, {
      key: "setVisible",
      value: function setVisible(visible) {
        var expected = visible === undefined || visible ? 'inline' : 'none';
        var oldDisplay = this.group_.getAttribute('display');

        if (oldDisplay !== expected) {
          this.group_.setAttribute('display', expected);
        }
      }
      /**
       * Is this layer visible?
       * @returns {boolean} True if visible.
       */

    }, {
      key: "isVisible",
      value: function isVisible() {
        return this.group_.getAttribute('display') !== 'none';
      }
      /**
       * Get layer opacity.
       * @returns {Float} Opacity value.
       */

    }, {
      key: "getOpacity",
      value: function getOpacity() {
        var opacity = this.group_.getAttribute('opacity');

        if (isNullish(opacity)) {
          return 1;
        }

        return parseFloat(opacity);
      }
      /**
       * Sets the opacity of this layer. If opacity is not a value between 0.0 and 1.0,
       * nothing happens.
       * @param {Float} opacity - A float value in the range 0.0-1.0
       * @returns {void}
       */

    }, {
      key: "setOpacity",
      value: function setOpacity(opacity) {
        if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
          this.group_.setAttribute('opacity', opacity);
        }
      }
      /**
       * Append children to this layer.
       * @param {SVGGElement} children - The children to append to this layer.
       * @returns {void}
       */

    }, {
      key: "appendChildren",
      value: function appendChildren(children) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;
            this.group_.append(child);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      /**
      * @returns {SVGTitleElement|null}
      */

    }, {
      key: "getTitleElement",
      value: function getTitleElement() {
        var len = this.group_.childNodes.length;

        for (var i = 0; i < len; ++i) {
          var child = this.group_.childNodes.item(i);

          if (child && child.tagName === 'title') {
            return child;
          }
        }

        return null;
      }
      /**
       * Set the name of this layer.
       * @param {string} name - The new name.
       * @param {module:history.HistoryRecordingService} hrService - History recording service
       * @returns {string|null} The new name if changed; otherwise, null.
       */

    }, {
      key: "setName",
      value: function setName(name, hrService) {
        var previousName = this.name_;
        name = toXml(name); // now change the underlying title element contents

        var title = this.getTitleElement();

        if (title) {
          $$3(title).empty();
          title.textContent = name;
          this.name_ = name;

          if (hrService) {
            hrService.changeElement(title, {
              '#text': previousName
            });
          }

          return this.name_;
        }

        return null;
      }
      /**
       * Remove this layer's group from the DOM. No more functions on group can be called after this.
       * @returns {SVGGElement} The layer SVG group that was just removed.
       */

    }, {
      key: "removeGroup",
      value: function removeGroup() {
        var parent = this.group_.parentNode;
        var group = parent.removeChild(this.group_);
        this.group_ = undefined;
        return group;
      }
    }]);

    return Layer;
  }();
  /**
   * @property {string} CLASS_NAME - class attribute assigned to all layer groups.
   */


  Layer.CLASS_NAME = 'layer';
  /**
   * @property {RegExp} CLASS_REGEX - Used to test presence of class Layer.CLASS_NAME
   */

  Layer.CLASS_REGEX = new RegExp('(\\s|^)' + Layer.CLASS_NAME + '(\\s|$)');
  /**
   * Add class `Layer.CLASS_NAME` to the element (usually `class='layer'`).
   *
   * @param {SVGGElement} elem - The SVG element to update
   * @returns {void}
   */

  function addLayerClass(elem) {
    var classes = elem.getAttribute('class');

    if (isNullish(classes) || !classes.length) {
      elem.setAttribute('class', Layer.CLASS_NAME);
    } else if (!Layer.CLASS_REGEX.test(classes)) {
      elem.setAttribute('class', classes + ' ' + Layer.CLASS_NAME);
    }
  }

  /**
   * History recording service.
   *
   * A self-contained service interface for recording history. Once injected, no other dependencies
   * or globals are required (example: UndoManager, command types, etc.). Easy to mock for unit tests.
   * Built on top of history classes in history.js.
   *
   * There is a simple start/end interface for batch commands.
   *
   * HistoryRecordingService.NO_HISTORY is a singleton that can be passed in to functions
   * that record history. This helps when the caller requires that no history be recorded.
   *
   * The following will record history: insert, batch, insert.
   * @example
   * hrService = new history.HistoryRecordingService(this.undoMgr);
   * hrService.insertElement(elem, text);         // add simple command to history.
   * hrService.startBatchCommand('create two elements');
   * hrService.changeElement(elem, attrs, text);  // add to batchCommand
   * hrService.changeElement(elem, attrs2, text); // add to batchCommand
   * hrService.endBatchCommand();                  // add batch command with two change commands to history.
   * hrService.insertElement(elem, text);         // add simple command to history.
   *
   * @example
   * // Note that all functions return this, so commands can be chained, like so:
   * hrService
   *   .startBatchCommand('create two elements')
   *   .insertElement(elem, text)
   *   .changeElement(elem, attrs, text)
   *   .endBatchCommand();
   *
   * @memberof module:history
   */

  var HistoryRecordingService =
  /*#__PURE__*/
  function () {
    /**
    * @param {history.UndoManager|null} undoManager - The undo manager.
    *     A value of `null` is valid for cases where no history recording is required.
    *     See singleton: {@link module:history.HistoryRecordingService.HistoryRecordingService.NO_HISTORY}
    */
    function HistoryRecordingService(undoManager) {
      _classCallCheck(this, HistoryRecordingService);

      this.undoManager_ = undoManager;
      this.currentBatchCommand_ = null;
      this.batchCommandStack_ = [];
    }
    /**
     * Start a batch command so multiple commands can recorded as a single history command.
     * Requires a corresponding call to endBatchCommand. Start and end commands can be nested.
     *
     * @param {string} text - Optional string describing the batch command.
     * @returns {module:history.HistoryRecordingService}
     */


    _createClass(HistoryRecordingService, [{
      key: "startBatchCommand",
      value: function startBatchCommand(text) {
        if (!this.undoManager_) {
          return this;
        }

        this.currentBatchCommand_ = new BatchCommand(text);
        this.batchCommandStack_.push(this.currentBatchCommand_);
        return this;
      }
      /**
       * End a batch command and add it to the history or a parent batch command.
       * @returns {module:history.HistoryRecordingService}
       */

    }, {
      key: "endBatchCommand",
      value: function endBatchCommand() {
        if (!this.undoManager_) {
          return this;
        }

        if (this.currentBatchCommand_) {
          var batchCommand = this.currentBatchCommand_;
          this.batchCommandStack_.pop();
          var len = this.batchCommandStack_.length;
          this.currentBatchCommand_ = len ? this.batchCommandStack_[len - 1] : null;
          this.addCommand_(batchCommand);
        }

        return this;
      }
      /**
       * Add a `MoveElementCommand` to the history or current batch command.
       * @param {Element} elem - The DOM element that was moved
       * @param {Element} oldNextSibling - The element's next sibling before it was moved
       * @param {Element} oldParent - The element's parent before it was moved
       * @param {string} [text] - An optional string visible to user related to this change
       * @returns {module:history.HistoryRecordingService}
       */

    }, {
      key: "moveElement",
      value: function moveElement(elem, oldNextSibling, oldParent, text) {
        if (!this.undoManager_) {
          return this;
        }

        this.addCommand_(new MoveElementCommand(elem, oldNextSibling, oldParent, text));
        return this;
      }
      /**
       * Add an `InsertElementCommand` to the history or current batch command.
       * @param {Element} elem - The DOM element that was added
       * @param {string} [text] - An optional string visible to user related to this change
       * @returns {module:history.HistoryRecordingService}
       */

    }, {
      key: "insertElement",
      value: function insertElement(elem, text) {
        if (!this.undoManager_) {
          return this;
        }

        this.addCommand_(new InsertElementCommand(elem, text));
        return this;
      }
      /**
       * Add a `RemoveElementCommand` to the history or current batch command.
       * @param {Element} elem - The DOM element that was removed
       * @param {Element} oldNextSibling - The element's next sibling before it was removed
       * @param {Element} oldParent - The element's parent before it was removed
       * @param {string} [text] - An optional string visible to user related to this change
       * @returns {module:history.HistoryRecordingService}
       */

    }, {
      key: "removeElement",
      value: function removeElement(elem, oldNextSibling, oldParent, text) {
        if (!this.undoManager_) {
          return this;
        }

        this.addCommand_(new RemoveElementCommand(elem, oldNextSibling, oldParent, text));
        return this;
      }
      /**
       * Add a `ChangeElementCommand` to the history or current batch command.
       * @param {Element} elem - The DOM element that was changed
       * @param {module:history.CommandAttributes} attrs - An object with the attributes to be changed and the values they had *before* the change
       * @param {string} [text] - An optional string visible to user related to this change
       * @returns {module:history.HistoryRecordingService}
       */

    }, {
      key: "changeElement",
      value: function changeElement(elem, attrs, text) {
        if (!this.undoManager_) {
          return this;
        }

        this.addCommand_(new ChangeElementCommand(elem, attrs, text));
        return this;
      }
      /**
       * Private function to add a command to the history or current batch command.
       * @private
       * @param {Command} cmd
       * @returns {module:history.HistoryRecordingService|void}
       */

    }, {
      key: "addCommand_",
      value: function addCommand_(cmd) {
        if (!this.undoManager_) {
          return this;
        }

        if (this.currentBatchCommand_) {
          this.currentBatchCommand_.addSubCommand(cmd);
        } else {
          this.undoManager_.addCommandToHistory(cmd);
        }

        return undefined;
      }
    }]);

    return HistoryRecordingService;
  }();
  /**
   * @memberof module:history.HistoryRecordingService
   * @property {module:history.HistoryRecordingService} NO_HISTORY - Singleton that can be passed to functions that record history, but the caller requires that no history be recorded.
   */


  HistoryRecordingService.NO_HISTORY = new HistoryRecordingService();

  var $$4 = jQuery;
  var visElems$1 = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use'.split(',');
  var RandomizeModes = {
    LET_DOCUMENT_DECIDE: 0,
    ALWAYS_RANDOMIZE: 1,
    NEVER_RANDOMIZE: 2
  };
  var randIds = RandomizeModes.LET_DOCUMENT_DECIDE; // Array with current disabled elements (for in-group editing)

  var disabledElems = [];
  /**
   * Get a HistoryRecordingService.
   * @param {module:history.HistoryRecordingService} [hrService] - if exists, return it instead of creating a new service.
   * @returns {module:history.HistoryRecordingService}
   */

  function historyRecordingService(hrService) {
    return hrService || new HistoryRecordingService(canvas_.undoMgr);
  }
  /**
   * Find the layer name in a group element.
   * @param {Element} group The group element to search in.
   * @returns {string} The layer name or empty string.
   */


  function findLayerNameInGroup(group) {
    return $$4('title', group).text() || (isOpera() && group.querySelectorAll // Hack for Opera 10.60
    ? $$4(group.querySelectorAll('title')).text() : '');
  }
  /**
   * Given a set of names, return a new unique name.
   * @param {string[]} existingLayerNames - Existing layer names.
   * @returns {string} - The new name.
   */


  function getNewLayerName(existingLayerNames) {
    var i = 1; // TODO(codedread): What about internationalization of "Layer"?

    while (existingLayerNames.includes('Layer ' + i)) {
      i++;
    }

    return 'Layer ' + i;
  }
  /**
   * This class encapsulates the concept of a SVG-edit drawing.
   */


  var Drawing =
  /*#__PURE__*/
  function () {
    /**
    * @param {SVGSVGElement} svgElem - The SVG DOM Element that this JS object
    *     encapsulates.  If the svgElem has a se:nonce attribute on it, then
    *     IDs will use the nonce as they are generated.
    * @param {string} [optIdPrefix=svg_] - The ID prefix to use.
    * @throws {Error} If not initialized with an SVG element
    */
    function Drawing(svgElem, optIdPrefix) {
      _classCallCheck(this, Drawing);

      if (!svgElem || !svgElem.tagName || !svgElem.namespaceURI || svgElem.tagName !== 'svg' || svgElem.namespaceURI !== NS.SVG) {
        throw new Error('Error: svgedit.draw.Drawing instance initialized without a <svg> element');
      }
      /**
      * The SVG DOM Element that represents this drawing.
      * @type {SVGSVGElement}
      */


      this.svgElem_ = svgElem;
      /**
      * The latest object number used in this drawing.
      * @type {Integer}
      */

      this.obj_num = 0;
      /**
      * The prefix to prepend to each element id in the drawing.
      * @type {string}
      */

      this.idPrefix = optIdPrefix || 'svg_';
      /**
      * An array of released element ids to immediately reuse.
      * @type {Integer[]}
      */

      this.releasedNums = [];
      /**
      * The z-ordered array of Layer objects. Each layer has a name
      * and group element.
      * The first layer is the one at the bottom of the rendering.
      * @type {Layer[]}
      */

      this.all_layers = [];
      /**
      * Map of all_layers by name.
      *
      * Note: Layers are ordered, but referenced externally by name; so, we need both container
      * types depending on which function is called (i.e. all_layers and layer_map).
      *
      * @type {PlainObject<string, Layer>}
      */

      this.layer_map = {};
      /**
      * The current layer being used.
      * @type {Layer}
      */

      this.current_layer = null;
      /**
      * The nonce to use to uniquely identify elements across drawings.
      * @type {!string}
      */

      this.nonce_ = '';
      var n = this.svgElem_.getAttributeNS(NS.SE, 'nonce'); // If already set in the DOM, use the nonce throughout the document
      // else, if randomizeIds(true) has been called, create and set the nonce.

      if (n && randIds !== RandomizeModes.NEVER_RANDOMIZE) {
        this.nonce_ = n;
      } else if (randIds === RandomizeModes.ALWAYS_RANDOMIZE) {
        this.setNonce(Math.floor(Math.random() * 100001));
      }
    }
    /**
     * @param {string} id Element ID to retrieve
     * @returns {Element} SVG element within the root SVGSVGElement
    */


    _createClass(Drawing, [{
      key: "getElem_",
      value: function getElem_(id) {
        if (this.svgElem_.querySelector) {
          // querySelector lookup
          return this.svgElem_.querySelector('#' + id);
        } // jQuery lookup: twice as slow as xpath in FF


        return $$4(this.svgElem_).find('[id=' + id + ']')[0];
      }
      /**
       * @returns {SVGSVGElement}
       */

    }, {
      key: "getSvgElem",
      value: function getSvgElem() {
        return this.svgElem_;
      }
      /**
       * @returns {!(string|Integer)} The previously set nonce
       */

    }, {
      key: "getNonce",
      value: function getNonce() {
        return this.nonce_;
      }
      /**
       * @param {!(string|Integer)} n The nonce to set
       * @returns {void}
       */

    }, {
      key: "setNonce",
      value: function setNonce(n) {
        this.svgElem_.setAttributeNS(NS.XMLNS, 'xmlns:se', NS.SE);
        this.svgElem_.setAttributeNS(NS.SE, 'se:nonce', n);
        this.nonce_ = n;
      }
      /**
       * Clears any previously set nonce.
       * @returns {void}
       */

    }, {
      key: "clearNonce",
      value: function clearNonce() {
        // We deliberately leave any se:nonce attributes alone,
        // we just don't use it to randomize ids.
        this.nonce_ = '';
      }
      /**
       * Returns the latest object id as a string.
       * @returns {string} The latest object Id.
       */

    }, {
      key: "getId",
      value: function getId() {
        return this.nonce_ ? this.idPrefix + this.nonce_ + '_' + this.obj_num : this.idPrefix + this.obj_num;
      }
      /**
       * Returns the next object Id as a string.
       * @returns {string} The next object Id to use.
       */

    }, {
      key: "getNextId",
      value: function getNextId() {
        var oldObjNum = this.obj_num;
        var restoreOldObjNum = false; // If there are any released numbers in the release stack,
        // use the last one instead of the next obj_num.
        // We need to temporarily use obj_num as that is what getId() depends on.

        if (this.releasedNums.length > 0) {
          this.obj_num = this.releasedNums.pop();
          restoreOldObjNum = true;
        } else {
          // If we are not using a released id, then increment the obj_num.
          this.obj_num++;
        } // Ensure the ID does not exist.


        var id = this.getId();

        while (this.getElem_(id)) {
          if (restoreOldObjNum) {
            this.obj_num = oldObjNum;
            restoreOldObjNum = false;
          }

          this.obj_num++;
          id = this.getId();
        } // Restore the old object number if required.


        if (restoreOldObjNum) {
          this.obj_num = oldObjNum;
        }

        return id;
      }
      /**
       * Releases the object Id, letting it be used as the next id in getNextId().
       * This method DOES NOT remove any elements from the DOM, it is expected
       * that client code will do this.
       * @param {string} id - The id to release.
       * @returns {boolean} True if the id was valid to be released, false otherwise.
      */

    }, {
      key: "releaseId",
      value: function releaseId(id) {
        // confirm if this is a valid id for this Document, else return false
        var front = this.idPrefix + (this.nonce_ ? this.nonce_ + '_' : '');

        if (typeof id !== 'string' || !id.startsWith(front)) {
          return false;
        } // extract the obj_num of this id


        var num = parseInt(id.substr(front.length)); // if we didn't get a positive number or we already released this number
        // then return false.

        if (typeof num !== 'number' || num <= 0 || this.releasedNums.includes(num)) {
          return false;
        } // push the released number into the released queue


        this.releasedNums.push(num);
        return true;
      }
      /**
       * Returns the number of layers in the current drawing.
       * @returns {Integer} The number of layers in the current drawing.
      */

    }, {
      key: "getNumLayers",
      value: function getNumLayers() {
        return this.all_layers.length;
      }
      /**
       * Check if layer with given name already exists.
       * @param {string} name - The layer name to check
       * @returns {boolean}
      */

    }, {
      key: "hasLayer",
      value: function hasLayer(name) {
        return this.layer_map[name] !== undefined;
      }
      /**
       * Returns the name of the ith layer. If the index is out of range, an empty string is returned.
       * @param {Integer} i - The zero-based index of the layer you are querying.
       * @returns {string} The name of the ith layer (or the empty string if none found)
      */

    }, {
      key: "getLayerName",
      value: function getLayerName(i) {
        return i >= 0 && i < this.getNumLayers() ? this.all_layers[i].getName() : '';
      }
      /**
       * @returns {SVGGElement|null} The SVGGElement representing the current layer.
       */

    }, {
      key: "getCurrentLayer",
      value: function getCurrentLayer() {
        return this.current_layer ? this.current_layer.getGroup() : null;
      }
      /**
       * Get a layer by name.
       * @param {string} name
       * @returns {SVGGElement} The SVGGElement representing the named layer or null.
       */

    }, {
      key: "getLayerByName",
      value: function getLayerByName(name) {
        var layer = this.layer_map[name];
        return layer ? layer.getGroup() : null;
      }
      /**
       * Returns the name of the currently selected layer. If an error occurs, an empty string
       * is returned.
       * @returns {string} The name of the currently active layer (or the empty string if none found).
      */

    }, {
      key: "getCurrentLayerName",
      value: function getCurrentLayerName() {
        return this.current_layer ? this.current_layer.getName() : '';
      }
      /**
       * Set the current layer's name.
       * @param {string} name - The new name.
       * @param {module:history.HistoryRecordingService} hrService - History recording service
       * @returns {string|null} The new name if changed; otherwise, null.
       */

    }, {
      key: "setCurrentLayerName",
      value: function setCurrentLayerName(name, hrService) {
        var finalName = null;

        if (this.current_layer) {
          var oldName = this.current_layer.getName();
          finalName = this.current_layer.setName(name, hrService);

          if (finalName) {
            delete this.layer_map[oldName];
            this.layer_map[finalName] = this.current_layer;
          }
        }

        return finalName;
      }
      /**
       * Set the current layer's position.
       * @param {Integer} newpos - The zero-based index of the new position of the layer. Range should be 0 to layers-1
       * @returns {{title: SVGGElement, previousName: string}|null} If the name was changed, returns {title:SVGGElement, previousName:string}; otherwise null.
       */

    }, {
      key: "setCurrentLayerPosition",
      value: function setCurrentLayerPosition(newpos) {
        var layerCount = this.getNumLayers();

        if (!this.current_layer || newpos < 0 || newpos >= layerCount) {
          return null;
        }

        var oldpos;

        for (oldpos = 0; oldpos < layerCount; ++oldpos) {
          if (this.all_layers[oldpos] === this.current_layer) {
            break;
          }
        } // some unknown error condition (current_layer not in all_layers)


        if (oldpos === layerCount) {
          return null;
        }

        if (oldpos !== newpos) {
          // if our new position is below us, we need to insert before the node after newpos
          var currentGroup = this.current_layer.getGroup();
          var oldNextSibling = currentGroup.nextSibling;
          var refGroup = null;

          if (newpos > oldpos) {
            if (newpos < layerCount - 1) {
              refGroup = this.all_layers[newpos + 1].getGroup();
            } // if our new position is above us, we need to insert before the node at newpos

          } else {
            refGroup = this.all_layers[newpos].getGroup();
          }

          this.svgElem_.insertBefore(currentGroup, refGroup); // Ok to replace with `refGroup.before(currentGroup);`?

          this.identifyLayers();
          this.setCurrentLayer(this.getLayerName(newpos));
          return {
            currentGroup: currentGroup,
            oldNextSibling: oldNextSibling
          };
        }

        return null;
      }
      /**
      * @param {module:history.HistoryRecordingService} hrService
      * @returns {void}
      */

    }, {
      key: "mergeLayer",
      value: function mergeLayer(hrService) {
        var currentGroup = this.current_layer.getGroup();
        var prevGroup = $$4(currentGroup).prev()[0];

        if (!prevGroup) {
          return;
        }

        hrService.startBatchCommand('Merge Layer');
        var layerNextSibling = currentGroup.nextSibling;
        hrService.removeElement(currentGroup, layerNextSibling, this.svgElem_);

        while (currentGroup.firstChild) {
          var child = currentGroup.firstChild;

          if (child.localName === 'title') {
            hrService.removeElement(child, child.nextSibling, currentGroup);
            child.remove();
            continue;
          }

          var oldNextSibling = child.nextSibling;
          prevGroup.append(child);
          hrService.moveElement(child, oldNextSibling, currentGroup);
        } // Remove current layer's group


        this.current_layer.removeGroup(); // Remove the current layer and set the previous layer as the new current layer

        var index = this.all_layers.indexOf(this.current_layer);

        if (index > 0) {
          var _name = this.current_layer.getName();

          this.current_layer = this.all_layers[index - 1];
          this.all_layers.splice(index, 1);
          delete this.layer_map[_name];
        }

        hrService.endBatchCommand();
      }
      /**
      * @param {module:history.HistoryRecordingService} hrService
      * @returns {void}
      */

    }, {
      key: "mergeAllLayers",
      value: function mergeAllLayers(hrService) {
        // Set the current layer to the last layer.
        this.current_layer = this.all_layers[this.all_layers.length - 1];
        hrService.startBatchCommand('Merge all Layers');

        while (this.all_layers.length > 1) {
          this.mergeLayer(hrService);
        }

        hrService.endBatchCommand();
      }
      /**
       * Sets the current layer. If the name is not a valid layer name, then this
       * function returns `false`. Otherwise it returns `true`. This is not an
       * undo-able action.
       * @param {string} name - The name of the layer you want to switch to.
       * @returns {boolean} `true` if the current layer was switched, otherwise `false`
       */

    }, {
      key: "setCurrentLayer",
      value: function setCurrentLayer(name) {
        var layer = this.layer_map[name];

        if (layer) {
          if (this.current_layer) {
            this.current_layer.deactivate();
          }

          this.current_layer = layer;
          this.current_layer.activate();
          return true;
        }

        return false;
      }
      /**
       * Deletes the current layer from the drawing and then clears the selection.
       * This function then calls the 'changed' handler.  This is an undoable action.
       * @todo Does this actually call the 'changed' handler?
       * @returns {SVGGElement} The SVGGElement of the layer removed or null.
       */

    }, {
      key: "deleteCurrentLayer",
      value: function deleteCurrentLayer() {
        if (this.current_layer && this.getNumLayers() > 1) {
          var oldLayerGroup = this.current_layer.removeGroup();
          this.identifyLayers();
          return oldLayerGroup;
        }

        return null;
      }
      /**
       * Updates layer system and sets the current layer to the
       * top-most layer (last `<g>` child of this drawing).
       * @returns {void}
      */

    }, {
      key: "identifyLayers",
      value: function identifyLayers() {
        this.all_layers = [];
        this.layer_map = {};
        var numchildren = this.svgElem_.childNodes.length; // loop through all children of SVG element

        var orphans = [],
            layernames = [];
        var layer = null;
        var childgroups = false;

        for (var i = 0; i < numchildren; ++i) {
          var child = this.svgElem_.childNodes.item(i); // for each g, find its layer name

          if (child && child.nodeType === 1) {
            if (child.tagName === 'g') {
              childgroups = true;

              var _name2 = findLayerNameInGroup(child);

              if (_name2) {
                layernames.push(_name2);
                layer = new Layer(_name2, child);
                this.all_layers.push(layer);
                this.layer_map[_name2] = layer;
              } else {
                // if group did not have a name, it is an orphan
                orphans.push(child);
              }
            } else if (visElems$1.includes(child.nodeName)) {
              // Child is "visible" (i.e. not a <title> or <defs> element), so it is an orphan
              orphans.push(child);
            }
          }
        } // If orphans or no layers found, create a new layer and add all the orphans to it


        if (orphans.length > 0 || !childgroups) {
          layer = new Layer(getNewLayerName(layernames), null, this.svgElem_);
          layer.appendChildren(orphans);
          this.all_layers.push(layer);
          this.layer_map[name] = layer;
        } else {
          layer.activate();
        }

        this.current_layer = layer;
      }
      /**
       * Creates a new top-level layer in the drawing with the given name and
       * makes it the current layer.
       * @param {string} name - The given name. If the layer name exists, a new name will be generated.
       * @param {module:history.HistoryRecordingService} hrService - History recording service
       * @returns {SVGGElement} The SVGGElement of the new layer, which is
       *     also the current layer of this drawing.
      */

    }, {
      key: "createLayer",
      value: function createLayer(name, hrService) {
        if (this.current_layer) {
          this.current_layer.deactivate();
        } // Check for duplicate name.


        if (name === undefined || name === null || name === '' || this.layer_map[name]) {
          name = getNewLayerName(Object.keys(this.layer_map));
        } // Crate new layer and add to DOM as last layer


        var layer = new Layer(name, null, this.svgElem_); // Like to assume hrService exists, but this is backwards compatible with old version of createLayer.

        if (hrService) {
          hrService.startBatchCommand('Create Layer');
          hrService.insertElement(layer.getGroup());
          hrService.endBatchCommand();
        }

        this.all_layers.push(layer);
        this.layer_map[name] = layer;
        this.current_layer = layer;
        return layer.getGroup();
      }
      /**
       * Creates a copy of the current layer with the given name and makes it the current layer.
       * @param {string} name - The given name. If the layer name exists, a new name will be generated.
       * @param {module:history.HistoryRecordingService} hrService - History recording service
       * @returns {SVGGElement} The SVGGElement of the new layer, which is
       *     also the current layer of this drawing.
      */

    }, {
      key: "cloneLayer",
      value: function cloneLayer(name, hrService) {
        var _this = this;

        if (!this.current_layer) {
          return null;
        }

        this.current_layer.deactivate(); // Check for duplicate name.

        if (name === undefined || name === null || name === '' || this.layer_map[name]) {
          name = getNewLayerName(Object.keys(this.layer_map));
        } // Create new group and add to DOM just after current_layer


        var currentGroup = this.current_layer.getGroup();
        var layer = new Layer(name, currentGroup, this.svgElem_);
        var group = layer.getGroup(); // Clone children

        var children = _toConsumableArray(currentGroup.childNodes);

        children.forEach(function (child) {
          if (child.localName === 'title') {
            return;
          }

          group.append(_this.copyElem(child));
        });

        if (hrService) {
          hrService.startBatchCommand('Duplicate Layer');
          hrService.insertElement(group);
          hrService.endBatchCommand();
        } // Update layer containers and current_layer.


        var index = this.all_layers.indexOf(this.current_layer);

        if (index >= 0) {
          this.all_layers.splice(index + 1, 0, layer);
        } else {
          this.all_layers.push(layer);
        }

        this.layer_map[name] = layer;
        this.current_layer = layer;
        return group;
      }
      /**
       * Returns whether the layer is visible.  If the layer name is not valid,
       * then this function returns `false`.
       * @param {string} layerName - The name of the layer which you want to query.
       * @returns {boolean} The visibility state of the layer, or `false` if the layer name was invalid.
      */

    }, {
      key: "getLayerVisibility",
      value: function getLayerVisibility(layerName) {
        var layer = this.layer_map[layerName];
        return layer ? layer.isVisible() : false;
      }
      /**
       * Sets the visibility of the layer. If the layer name is not valid, this
       * function returns `null`, otherwise it returns the `SVGElement` representing
       * the layer. This is an undo-able action.
       * @param {string} layerName - The name of the layer to change the visibility
       * @param {boolean} bVisible - Whether the layer should be visible
       * @returns {?SVGGElement} The SVGGElement representing the layer if the
       *   `layerName` was valid, otherwise `null`.
      */

    }, {
      key: "setLayerVisibility",
      value: function setLayerVisibility(layerName, bVisible) {
        if (typeof bVisible !== 'boolean') {
          return null;
        }

        var layer = this.layer_map[layerName];

        if (!layer) {
          return null;
        }

        layer.setVisible(bVisible);
        return layer.getGroup();
      }
      /**
       * Returns the opacity of the given layer.  If the input name is not a layer, `null` is returned.
       * @param {string} layerName - name of the layer on which to get the opacity
       * @returns {?Float} The opacity value of the given layer.  This will be a value between 0.0 and 1.0, or `null`
       * if `layerName` is not a valid layer
      */

    }, {
      key: "getLayerOpacity",
      value: function getLayerOpacity(layerName) {
        var layer = this.layer_map[layerName];

        if (!layer) {
          return null;
        }

        return layer.getOpacity();
      }
      /**
       * Sets the opacity of the given layer.  If the input name is not a layer,
       * nothing happens. If opacity is not a value between 0.0 and 1.0, then
       * nothing happens.
       * NOTE: this function exists solely to apply a highlighting/de-emphasis
       * effect to a layer. When it is possible for a user to affect the opacity
       * of a layer, we will need to allow this function to produce an undo-able
       * action.
       * @param {string} layerName - Name of the layer on which to set the opacity
       * @param {Float} opacity - A float value in the range 0.0-1.0
       * @returns {void}
      */

    }, {
      key: "setLayerOpacity",
      value: function setLayerOpacity(layerName, opacity) {
        if (typeof opacity !== 'number' || opacity < 0.0 || opacity > 1.0) {
          return;
        }

        var layer = this.layer_map[layerName];

        if (layer) {
          layer.setOpacity(opacity);
        }
      }
      /**
       * Create a clone of an element, updating its ID and its children's IDs when needed.
       * @param {Element} el - DOM element to clone
       * @returns {Element}
       */

    }, {
      key: "copyElem",
      value: function copyElem$1(el) {
        var that = this;

        var getNextIdClosure = function getNextIdClosure() {
          return that.getNextId();
        };

        return copyElem(el, getNextIdClosure);
      }
    }]);

    return Drawing;
  }();
  /**
   * Called to ensure that drawings will or will not have randomized ids.
   * The currentDrawing will have its nonce set if it doesn't already.
   * @function module:draw.randomizeIds
   * @param {boolean} enableRandomization - flag indicating if documents should have randomized ids
   * @param {draw.Drawing} currentDrawing
   * @returns {void}
   */

  var randomizeIds = function randomizeIds(enableRandomization, currentDrawing) {
    randIds = enableRandomization === false ? RandomizeModes.NEVER_RANDOMIZE : RandomizeModes.ALWAYS_RANDOMIZE;

    if (randIds === RandomizeModes.ALWAYS_RANDOMIZE && !currentDrawing.getNonce()) {
      currentDrawing.setNonce(Math.floor(Math.random() * 100001));
    } else if (randIds === RandomizeModes.NEVER_RANDOMIZE && currentDrawing.getNonce()) {
      currentDrawing.clearNonce();
    }
  }; // Layer API Functions

  /**
  * Group: Layers
  */

  /**
   * @see {@link https://api.jquery.com/jQuery.data/}
   * @name external:jQuery.data
   */

  /**
   * @interface module:draw.DrawCanvasInit
   * @property {module:path.pathActions} pathActions
   * @property {external:jQuery.data} elData
   * @property {module:history.UndoManager} undoMgr
   */

  /**
   * @function module:draw.DrawCanvasInit#getCurrentGroup
   * @returns {Element}
   */

  /**
   * @function module:draw.DrawCanvasInit#setCurrentGroup
   * @param {Element} cg
   * @returns {void}
  */

  /**
   * @function module:draw.DrawCanvasInit#getSelectedElements
   * @returns {Element[]} the array with selected DOM elements
  */

  /**
   * @function module:draw.DrawCanvasInit#getSVGContent
   * @returns {SVGSVGElement}
   */

  /**
   * @function module:draw.DrawCanvasInit#getCurrentDrawing
   * @returns {module:draw.Drawing}
   */

  /**
   * @function module:draw.DrawCanvasInit#clearSelection
   * @param {boolean} [noCall] - When `true`, does not call the "selected" handler
   * @returns {void}
  */

  /**
   * Run the callback function associated with the given event
   * @function module:draw.DrawCanvasInit#call
   * @param {"changed"|"contextset"} ev - String with the event name
   * @param {module:svgcanvas.SvgCanvas#event:changed|module:svgcanvas.SvgCanvas#event:contextset} arg - Argument to pass through to the callback
   * function. If the event is "changed", a (single-item) array of `Element`s is
   * passed. If the event is "contextset", the arg is `null` or `Element`.
   * @returns {void}
   */

  /**
   * @function module:draw.DrawCanvasInit#addCommandToHistory
   * @param {Command} cmd
   * @returns {void}
  */

  /**
   * @function module:draw.DrawCanvasInit#changeSVGContent
   * @returns {void}
   */

  var canvas_;
  /**
  * @function module:draw.init
  * @param {module:draw.DrawCanvasInit} canvas
  * @returns {void}
  */

  var init$3 = function init(canvas) {
    canvas_ = canvas;
  };
  /**
  * Updates layer system.
  * @function module:draw.identifyLayers
  * @returns {void}
  */

  var identifyLayers = function identifyLayers() {
    leaveContext();
    canvas_.getCurrentDrawing().identifyLayers();
  };
  /**
  * Creates a new top-level layer in the drawing with the given name, sets the current layer
  * to it, and then clears the selection. This function then calls the 'changed' handler.
  * This is an undoable action.
  * @function module:draw.createLayer
  * @param {string} name - The given name
  * @param {module:history.HistoryRecordingService} hrService
  * @fires module:svgcanvas.SvgCanvas#event:changed
  * @returns {void}
  */

  var createLayer = function createLayer(name, hrService) {
    var newLayer = canvas_.getCurrentDrawing().createLayer(name, historyRecordingService(hrService));
    canvas_.clearSelection();
    canvas_.call('changed', [newLayer]);
  };
  /**
   * Creates a new top-level layer in the drawing with the given name, copies all the current layer's contents
   * to it, and then clears the selection. This function then calls the 'changed' handler.
   * This is an undoable action.
   * @function module:draw.cloneLayer
   * @param {string} name - The given name. If the layer name exists, a new name will be generated.
   * @param {module:history.HistoryRecordingService} hrService - History recording service
   * @fires module:svgcanvas.SvgCanvas#event:changed
   * @returns {void}
   */

  var cloneLayer = function cloneLayer(name, hrService) {
    // Clone the current layer and make the cloned layer the new current layer
    var newLayer = canvas_.getCurrentDrawing().cloneLayer(name, historyRecordingService(hrService));
    canvas_.clearSelection();
    leaveContext();
    canvas_.call('changed', [newLayer]);
  };
  /**
  * Deletes the current layer from the drawing and then clears the selection. This function
  * then calls the 'changed' handler. This is an undoable action.
  * @function module:draw.deleteCurrentLayer
  * @fires module:svgcanvas.SvgCanvas#event:changed
  * @returns {boolean} `true` if an old layer group was found to delete
  */

  var deleteCurrentLayer = function deleteCurrentLayer() {
    var currentLayer = canvas_.getCurrentDrawing().getCurrentLayer();
    var _currentLayer = currentLayer,
        nextSibling = _currentLayer.nextSibling;
    var parent = currentLayer.parentNode;
    currentLayer = canvas_.getCurrentDrawing().deleteCurrentLayer();

    if (currentLayer) {
      var batchCmd = new BatchCommand('Delete Layer'); // store in our Undo History

      batchCmd.addSubCommand(new RemoveElementCommand(currentLayer, nextSibling, parent));
      canvas_.addCommandToHistory(batchCmd);
      canvas_.clearSelection();
      canvas_.call('changed', [parent]);
      return true;
    }

    return false;
  };
  /**
  * Sets the current layer. If the name is not a valid layer name, then this function returns
  * false. Otherwise it returns true. This is not an undo-able action.
  * @function module:draw.setCurrentLayer
  * @param {string} name - The name of the layer you want to switch to.
  * @returns {boolean} true if the current layer was switched, otherwise false
  */

  var setCurrentLayer = function setCurrentLayer(name) {
    var result = canvas_.getCurrentDrawing().setCurrentLayer(toXml(name));

    if (result) {
      canvas_.clearSelection();
    }

    return result;
  };
  /**
  * Renames the current layer. If the layer name is not valid (i.e. unique), then this function
  * does nothing and returns `false`, otherwise it returns `true`. This is an undo-able action.
  * @function module:draw.renameCurrentLayer
  * @param {string} newName - the new name you want to give the current layer. This name must
  * be unique among all layer names.
  * @fires module:svgcanvas.SvgCanvas#event:changed
  * @returns {boolean} Whether the rename succeeded
  */

  var renameCurrentLayer = function renameCurrentLayer(newName) {
    var drawing = canvas_.getCurrentDrawing();
    var layer = drawing.getCurrentLayer();

    if (layer) {
      var result = drawing.setCurrentLayerName(newName, historyRecordingService());

      if (result) {
        canvas_.call('changed', [layer]);
        return true;
      }
    }

    return false;
  };
  /**
  * Changes the position of the current layer to the new value. If the new index is not valid,
  * this function does nothing and returns false, otherwise it returns true. This is an
  * undo-able action.
  * @function module:draw.setCurrentLayerPosition
  * @param {Integer} newPos - The zero-based index of the new position of the layer. This should be between
  * 0 and (number of layers - 1)
  * @returns {boolean} `true` if the current layer position was changed, `false` otherwise.
  */

  var setCurrentLayerPosition = function setCurrentLayerPosition(newPos) {
    var drawing = canvas_.getCurrentDrawing();
    var result = drawing.setCurrentLayerPosition(newPos);

    if (result) {
      canvas_.addCommandToHistory(new MoveElementCommand(result.currentGroup, result.oldNextSibling, canvas_.getSVGContent()));
      return true;
    }

    return false;
  };
  /**
  * Sets the visibility of the layer. If the layer name is not valid, this function return
  * `false`, otherwise it returns `true`. This is an undo-able action.
  * @function module:draw.setLayerVisibility
  * @param {string} layerName - The name of the layer to change the visibility
  * @param {boolean} bVisible - Whether the layer should be visible
  * @returns {boolean} true if the layer's visibility was set, false otherwise
  */

  var setLayerVisibility = function setLayerVisibility(layerName, bVisible) {
    var drawing = canvas_.getCurrentDrawing();
    var prevVisibility = drawing.getLayerVisibility(layerName);
    var layer = drawing.setLayerVisibility(layerName, bVisible);

    if (layer) {
      var oldDisplay = prevVisibility ? 'inline' : 'none';
      canvas_.addCommandToHistory(new ChangeElementCommand(layer, {
        display: oldDisplay
      }, 'Layer Visibility'));
    } else {
      return false;
    }

    if (layer === drawing.getCurrentLayer()) {
      canvas_.clearSelection();
      canvas_.pathActions.clear();
    } // call('changed', [selected]);


    return true;
  };
  /**
  * Moves the selected elements to layerName. If the name is not a valid layer name, then `false`
  * is returned. Otherwise it returns `true`. This is an undo-able action.
  * @function module:draw.moveSelectedToLayer
  * @param {string} layerName - The name of the layer you want to which you want to move the selected elements
  * @returns {boolean} Whether the selected elements were moved to the layer.
  */

  var moveSelectedToLayer = function moveSelectedToLayer(layerName) {
    // find the layer
    var drawing = canvas_.getCurrentDrawing();
    var layer = drawing.getLayerByName(layerName);

    if (!layer) {
      return false;
    }

    var batchCmd = new BatchCommand('Move Elements to Layer'); // loop for each selected element and move it

    var selElems = canvas_.getSelectedElements();
    var i = selElems.length;

    while (i--) {
      var elem = selElems[i];

      if (!elem) {
        continue;
      }

      var oldNextSibling = elem.nextSibling; // TODO: this is pretty brittle!

      var oldLayer = elem.parentNode;
      layer.append(elem);
      batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldLayer));
    }

    canvas_.addCommandToHistory(batchCmd);
    return true;
  };
  /**
  * @function module:draw.mergeLayer
  * @param {module:history.HistoryRecordingService} hrService
  * @returns {void}
  */

  var mergeLayer = function mergeLayer(hrService) {
    canvas_.getCurrentDrawing().mergeLayer(historyRecordingService(hrService));
    canvas_.clearSelection();
    leaveContext();
    canvas_.changeSVGContent();
  };
  /**
  * @function module:draw.mergeAllLayers
  * @param {module:history.HistoryRecordingService} hrService
  * @returns {void}
  */

  var mergeAllLayers = function mergeAllLayers(hrService) {
    canvas_.getCurrentDrawing().mergeAllLayers(historyRecordingService(hrService));
    canvas_.clearSelection();
    leaveContext();
    canvas_.changeSVGContent();
  };
  /**
  * Return from a group context to the regular kind, make any previously
  * disabled elements enabled again.
  * @function module:draw.leaveContext
  * @fires module:svgcanvas.SvgCanvas#event:contextset
  * @returns {void}
  */

  var leaveContext = function leaveContext() {
    var len = disabledElems.length;

    if (len) {
      for (var i = 0; i < len; i++) {
        var elem = disabledElems[i];
        var orig = canvas_.elData(elem, 'orig_opac');

        if (orig !== 1) {
          elem.setAttribute('opacity', orig);
        } else {
          elem.removeAttribute('opacity');
        }

        elem.setAttribute('style', 'pointer-events: inherit');
      }

      disabledElems = [];
      canvas_.clearSelection(true);
      canvas_.call('contextset', null);
    }

    canvas_.setCurrentGroup(null);
  };
  /**
  * Set the current context (for in-group editing).
  * @function module:draw.setContext
  * @param {Element} elem
  * @fires module:svgcanvas.SvgCanvas#event:contextset
  * @returns {void}
  */

  var setContext = function setContext(elem) {
    leaveContext();

    if (typeof elem === 'string') {
      elem = getElem(elem);
    } // Edit inside this group


    canvas_.setCurrentGroup(elem); // Disable other elements

    $$4(elem).parentsUntil('#svgcontent').andSelf().siblings().each(function () {
      var opac = this.getAttribute('opacity') || 1; // Store the original's opacity

      canvas_.elData(this, 'orig_opac', opac);
      this.setAttribute('opacity', opac * 0.33);
      this.setAttribute('style', 'pointer-events: none');
      disabledElems.push(this);
    });
    canvas_.clearSelection();
    canvas_.call('contextset', canvas_.getCurrentGroup());
  };

  var REVERSE_NS = getReverseNS(); // Todo: Split out into core attributes, presentation attributes, etc. so consistent

  /**
   * This defines which elements and attributes that we support (or at least
   * don't remove)
   * @type {PlainObject}
   */

  var svgWhiteList_ = {
    // SVG Elements
    a: ['class', 'clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'mask', 'opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform', 'xlink:href', 'xlink:title'],
    circle: ['class', 'clip-path', 'clip-rule', 'cx', 'cy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'mask', 'opacity', 'r', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform'],
    clipPath: ['class', 'clipPathUnits', 'id'],
    defs: [],
    style: ['type'],
    desc: [],
    ellipse: ['class', 'clip-path', 'clip-rule', 'cx', 'cy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'mask', 'opacity', 'requiredFeatures', 'rx', 'ry', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform'],
    feGaussianBlur: ['class', 'color-interpolation-filters', 'id', 'requiredFeatures', 'stdDeviation'],
    feMorphology: ['class', 'in', 'operator', 'radius'],
    filter: ['class', 'color-interpolation-filters', 'filterRes', 'filterUnits', 'height', 'id', 'primitiveUnits', 'requiredFeatures', 'width', 'x', 'xlink:href', 'y'],
    foreignObject: ['class', 'font-size', 'height', 'id', 'opacity', 'requiredFeatures', 'style', 'transform', 'width', 'x', 'y'],
    g: ['class', 'clip-path', 'clip-rule', 'id', 'display', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-anchor'],
    image: ['class', 'clip-path', 'clip-rule', 'filter', 'height', 'id', 'mask', 'opacity', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:href', 'xlink:title', 'y'],
    line: ['class', 'clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform', 'x1', 'x2', 'y1', 'y2'],
    linearGradient: ['class', 'id', 'gradientTransform', 'gradientUnits', 'requiredFeatures', 'spreadMethod', 'systemLanguage', 'x1', 'x2', 'xlink:href', 'y1', 'y2'],
    marker: ['id', 'class', 'markerHeight', 'markerUnits', 'markerWidth', 'orient', 'preserveAspectRatio', 'refX', 'refY', 'systemLanguage', 'viewBox'],
    mask: ['class', 'height', 'id', 'maskContentUnits', 'maskUnits', 'width', 'x', 'y'],
    metadata: ['class', 'id'],
    path: ['class', 'clip-path', 'clip-rule', 'd', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform'],
    pattern: ['class', 'height', 'id', 'patternContentUnits', 'patternTransform', 'patternUnits', 'requiredFeatures', 'style', 'systemLanguage', 'viewBox', 'width', 'x', 'xlink:href', 'y'],
    polygon: ['class', 'clip-path', 'clip-rule', 'id', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'id', 'class', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'points', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform'],
    polyline: ['class', 'clip-path', 'clip-rule', 'id', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'points', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform'],
    radialGradient: ['class', 'cx', 'cy', 'fx', 'fy', 'gradientTransform', 'gradientUnits', 'id', 'r', 'requiredFeatures', 'spreadMethod', 'systemLanguage', 'xlink:href'],
    rect: ['class', 'clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'height', 'id', 'mask', 'opacity', 'requiredFeatures', 'rx', 'ry', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform', 'width', 'x', 'y'],
    stop: ['class', 'id', 'offset', 'requiredFeatures', 'stop-color', 'stop-opacity', 'style', 'systemLanguage'],
    svg: ['class', 'clip-path', 'clip-rule', 'filter', 'id', 'height', 'mask', 'preserveAspectRatio', 'requiredFeatures', 'style', 'systemLanguage', 'viewBox', 'width', 'x', 'xmlns', 'xmlns:se', 'xmlns:xlink', 'y'],
    "switch": ['class', 'id', 'requiredFeatures', 'systemLanguage'],
    symbol: ['class', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'id', 'opacity', 'preserveAspectRatio', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'transform', 'viewBox'],
    text: ['class', 'clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'id', 'mask', 'opacity', 'requiredFeatures', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'text-anchor', 'transform', 'x', 'xml:space', 'y'],
    textPath: ['class', 'id', 'method', 'requiredFeatures', 'spacing', 'startOffset', 'style', 'systemLanguage', 'transform', 'xlink:href'],
    title: [],
    tspan: ['class', 'clip-path', 'clip-rule', 'dx', 'dy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'id', 'mask', 'opacity', 'requiredFeatures', 'rotate', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'systemLanguage', 'text-anchor', 'textLength', 'transform', 'x', 'xml:space', 'y'],
    use: ['class', 'clip-path', 'clip-rule', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'height', 'id', 'mask', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'transform', 'width', 'x', 'xlink:href', 'y'],
    // MathML Elements
    annotation: ['encoding'],
    'annotation-xml': ['encoding'],
    maction: ['actiontype', 'other', 'selection'],
    math: ['class', 'id', 'display', 'xmlns'],
    menclose: ['notation'],
    merror: [],
    mfrac: ['linethickness'],
    mi: ['mathvariant'],
    mmultiscripts: [],
    mn: [],
    mo: ['fence', 'lspace', 'maxsize', 'minsize', 'rspace', 'stretchy'],
    mover: [],
    mpadded: ['lspace', 'width', 'height', 'depth', 'voffset'],
    mphantom: [],
    mprescripts: [],
    mroot: [],
    mrow: ['xlink:href', 'xlink:type', 'xmlns:xlink'],
    mspace: ['depth', 'height', 'width'],
    msqrt: [],
    mstyle: ['displaystyle', 'mathbackground', 'mathcolor', 'mathvariant', 'scriptlevel'],
    msub: [],
    msubsup: [],
    msup: [],
    mtable: ['align', 'columnalign', 'columnlines', 'columnspacing', 'displaystyle', 'equalcolumns', 'equalrows', 'frame', 'rowalign', 'rowlines', 'rowspacing', 'width'],
    mtd: ['columnalign', 'columnspan', 'rowalign', 'rowspan'],
    mtext: [],
    mtr: ['columnalign', 'rowalign'],
    munder: [],
    munderover: [],
    none: [],
    semantics: []
  }; // Produce a Namespace-aware version of svgWhitelist

  var svgWhiteListNS_ = {};
  Object.entries(svgWhiteList_).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        elt = _ref2[0],
        atts = _ref2[1];

    var attNS = {};
    Object.entries(atts).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          i = _ref4[0],
          att = _ref4[1];

      if (att.includes(':')) {
        var v = att.split(':');
        attNS[v[1]] = NS[v[0].toUpperCase()];
      } else {
        attNS[att] = att === 'xmlns' ? NS.XMLNS : null;
      }
    });
    svgWhiteListNS_[elt] = attNS;
  });
  /**
  * Sanitizes the input node and its children.
  * It only keeps what is allowed from our whitelist defined above.
  * @function module:sanitize.sanitizeSvg
  * @param {Text|Element} node - The DOM element to be checked (we'll also check its children) or text node to be cleaned up
  * @returns {void}
  */

  var sanitizeSvg = function sanitizeSvg(node) {
    // Cleanup text nodes
    if (node.nodeType === 3) {
      // 3 === TEXT_NODE
      // Trim whitespace
      node.nodeValue = node.nodeValue.replace(/^\s+|\s+$/g, ''); // Remove if empty

      if (!node.nodeValue.length) {
        node.remove();
      }
    } // We only care about element nodes.
    // Automatically return for all non-element nodes, such as comments, etc.


    if (node.nodeType !== 1) {
      // 1 == ELEMENT_NODE
      return;
    }

    var doc = node.ownerDocument;
    var parent = node.parentNode; // can parent ever be null here?  I think the root node's parent is the document...

    if (!doc || !parent) {
      return;
    }

    var allowedAttrs = svgWhiteList_[node.nodeName];
    var allowedAttrsNS = svgWhiteListNS_[node.nodeName]; // if this element is supported, sanitize it

    if (typeof allowedAttrs !== 'undefined') {
      var seAttrs = [];
      var i = node.attributes.length;

      while (i--) {
        // if the attribute is not in our whitelist, then remove it
        // could use jQuery's inArray(), but I don't know if that's any better
        var attr = node.attributes.item(i);
        var attrName = attr.nodeName;
        var attrLocalName = attr.localName;
        var attrNsURI = attr.namespaceURI; // Check that an attribute with the correct localName in the correct namespace is on
        // our whitelist or is a namespace declaration for one of our allowed namespaces

        if (!({}.hasOwnProperty.call(allowedAttrsNS, attrLocalName) && attrNsURI === allowedAttrsNS[attrLocalName] && attrNsURI !== NS.XMLNS) && !(attrNsURI === NS.XMLNS && REVERSE_NS[attr.value])) {
          // TODO(codedread): Programmatically add the se: attributes to the NS-aware whitelist.
          // Bypassing the whitelist to allow se: prefixes.
          // Is there a more appropriate way to do this?
          if (attrName.startsWith('se:') || attrName.startsWith('data-')) {
            seAttrs.push([attrName, attr.value]);
          }

          node.removeAttributeNS(attrNsURI, attrLocalName);
        } // Add spaces before negative signs where necessary


        if (isGecko()) {
          switch (attrName) {
            case 'transform':
            case 'gradientTransform':
            case 'patternTransform':
              {
                var val = attr.value.replace(_wrapRegExp(/(\d)-/g, {
                  digit: 1
                }), '$<digit> -');
                node.setAttribute(attrName, val);
                break;
              }
          }
        } // For the style attribute, rewrite it in terms of XML presentational attributes


        if (attrName === 'style') {
          var props = attr.value.split(';');
          var p = props.length;

          while (p--) {
            var _props$p$split = props[p].split(':'),
                _props$p$split2 = _slicedToArray(_props$p$split, 2),
                name = _props$p$split2[0],
                _val = _props$p$split2[1];

            var styleAttrName = (name || '').trim();

            var styleAttrVal = (_val || '').trim(); // Now check that this attribute is supported


            if (allowedAttrs.includes(styleAttrName)) {
              node.setAttribute(styleAttrName, styleAttrVal);
            }
          }

          node.removeAttribute('style');
        }
      }

      Object.values(seAttrs).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            att = _ref6[0],
            val = _ref6[1];

        node.setAttributeNS(NS.SE, att, val);
      }); // for some elements that have a xlink:href, ensure the URI refers to a local element
      // (but not for links)

      var href = getHref(node);

      if (href && ['filter', 'linearGradient', 'pattern', 'radialGradient', 'textPath', 'use'].includes(node.nodeName)) {
        // TODO: we simply check if the first character is a #, is this bullet-proof?
        if (href[0] !== '#') {
          // remove the attribute (but keep the element)
          setHref(node, '');
          node.removeAttributeNS(NS.XLINK, 'href');
        }
      } // Safari crashes on a <use> without a xlink:href, so we just remove the node here


      if (node.nodeName === 'use' && !getHref(node)) {
        node.remove();
        return;
      } // if the element has attributes pointing to a non-local reference,
      // need to remove the attribute


      Object.values(['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'], function (attr) {
        var val = node.getAttribute(attr);

        if (val) {
          val = getUrlFromAttr(val); // simply check for first character being a '#'

          if (val && val[0] !== '#') {
            node.setAttribute(attr, '');
            node.removeAttribute(attr);
          }
        }
      }); // recurse to children

      i = node.childNodes.length;

      while (i--) {
        sanitizeSvg(node.childNodes.item(i));
      } // else (element not supported), remove it

    } else {
      // remove all children from this node and insert them before this node
      // FIXME: in the case of animation elements this will hardly ever be correct
      var children = [];

      while (node.hasChildNodes()) {
        children.push(parent.insertBefore(node.firstChild, node));
      } // remove this node from the document altogether


      node.remove(); // call sanitizeSvg on each of those children

      var _i = children.length;

      while (_i--) {
        sanitizeSvg(children[_i]);
      }
    }
  };

  // MIT License
  // From: https://github.com/uupaa/dynamic-import-polyfill/blob/master/importModule.js

  /**
   * @module importModule
   */

  /**
   * Converts a possible relative URL into an absolute one.
   * @param {string} url
   * @returns {string}
   */
  function toAbsoluteURL(url) {
    var a = document.createElement('a');
    a.setAttribute('href', url); // <a href="hoge.html">

    return a.cloneNode(false).href; // -> "http://example.com/hoge.html"
  }
  /**
   * Add any of the whitelisted attributes to the script tag.
   * @param {HTMLScriptElement} script
   * @param {PlainObject<string, string>} atts
   * @returns {void}
   */


  function addScriptAtts(script, atts) {
    ['id', 'class', 'type'].forEach(function (prop) {
      if (prop in atts) {
        script[prop] = atts[prop];
      }
    });
  } // Additions by Brett
  /**
  * @function module:importModule.importSetGlobal
  * @param {string|string[]} url
  * @param {module:importModule.ImportConfig} config
  * @returns {Promise<ArbitraryModule>} The promise resolves to either an `ArbitraryModule` or
  *   any other value depends on the export of the targeted module.
  */

  function importSetGlobal(_x, _x2) {
    return _importSetGlobal.apply(this, arguments);
  }
  /**
   *
   * @author Brett Zamir (other items are from `dynamic-import-polyfill`)
   * @param {string|string[]} url
   * @param {PlainObject} [atts={}]
   * @returns {Promise<void|Error>} Resolves to `undefined` or rejects with an `Error` upon a
   *   script loading error
   */

  function _importSetGlobal() {
    _importSetGlobal = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(url, _ref) {
      var glob, returnDefault, modularVersion;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              glob = _ref.global, returnDefault = _ref.returnDefault;
              // Todo: Replace calls to this function with `import()` when supported
              modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false;

              if (!modularVersion) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", importModule(url, undefined, {
                returnDefault: returnDefault
              }));

            case 4:
              _context.next = 6;
              return importScript(url);

            case 6:
              return _context.abrupt("return", window[glob]);

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _importSetGlobal.apply(this, arguments);
  }

  function importScript(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importScript(u, atts);
      }));
    }

    return new Promise(function (resolve, reject) {
      // eslint-disable-line promise/avoid-new
      var script = document.createElement('script');
      /**
       *
       * @returns {void}
       */

      function scriptOnError() {
        reject(new Error("Failed to import: ".concat(url)));
        destructor();
      }
      /**
       *
       * @returns {void}
       */


      function scriptOnLoad() {
        resolve();
        destructor();
      }

      var destructor = function destructor() {
        script.removeEventListener('error', scriptOnError);
        script.removeEventListener('load', scriptOnLoad);
        script.remove();
        script.src = '';
      };

      script.defer = 'defer';
      addScriptAtts(script, atts);
      script.addEventListener('error', scriptOnError);
      script.addEventListener('load', scriptOnLoad);
      script.src = url;
      document.head.append(script);
    });
  }
  /**
  *
  * @param {string|string[]} url
  * @param {PlainObject} [atts={}]
  * @param {PlainObject} opts
  * @param {boolean} [opts.returnDefault=false} = {}]
  * @returns {Promise<any>} Resolves to value of loading module or rejects with
  *   `Error` upon a script loading error.
  */

  function importModule(url) {
    var atts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref2$returnDefault = _ref2.returnDefault,
        returnDefault = _ref2$returnDefault === void 0 ? false : _ref2$returnDefault;

    if (Array.isArray(url)) {
      return Promise.all(url.map(function (u) {
        return importModule(u, atts);
      }));
    }

    return new Promise(function (resolve, reject) {
      // eslint-disable-line promise/avoid-new
      var vector = '$importModule$' + Math.random().toString(32).slice(2);
      var script = document.createElement('script');
      /**
       *
       * @returns {void}
       */

      function scriptOnError() {
        reject(new Error("Failed to import: ".concat(url)));
        destructor();
      }
      /**
       *
       * @returns {void}
       */


      function scriptOnLoad() {
        resolve(window[vector]);
        destructor();
      }

      var destructor = function destructor() {
        delete window[vector];
        script.removeEventListener('error', scriptOnError);
        script.removeEventListener('load', scriptOnLoad);
        script.remove();
        URL.revokeObjectURL(script.src);
        script.src = '';
      };

      addScriptAtts(script, atts);
      script.defer = 'defer';
      script.type = 'module';
      script.addEventListener('error', scriptOnError);
      script.addEventListener('load', scriptOnLoad);
      var absURL = toAbsoluteURL(url);
      var loader = "import * as m from '".concat(absURL.replace(/'/g, "\\'"), "'; window.").concat(vector, " = ").concat(returnDefault ? 'm.default || ' : '', "m;"); // export Module

      var blob = new Blob([loader], {
        type: 'text/javascript'
      });
      script.src = URL.createObjectURL(blob);
      document.head.append(script);
    });
  }

  var $$5 = jQuery; // this is how we map paths to our preferred relative segment types

  var pathMap$1 = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a', 'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];
  /**
   * @interface module:coords.EditorContext
   */

  /**
   * @function module:coords.EditorContext#getGridSnapping
   * @returns {boolean}
   */

  /**
   * @function module:coords.EditorContext#getDrawing
   * @returns {module:draw.Drawing}
  */

  /**
   * @function module:coords.EditorContext#getSVGRoot
   * @returns {SVGSVGElement}
  */

  var editorContext_$2 = null;
  /**
  * @function module:coords.init
  * @param {module:svgcanvas.SvgCanvas#event:pointsAdded} editorContext
  * @returns {void}
  */

  var init$4 = function init(editorContext) {
    editorContext_$2 = editorContext;
  };
  /**
   * Applies coordinate changes to an element based on the given matrix.
   * @name module:coords.remapElement
   * @type {module:path.EditorContext#remapElement}
  */

  var remapElement = function remapElement(selected, changes, m) {
    var remap = function remap(x, y) {
      return transformPoint(x, y, m);
    },
        scalew = function scalew(w) {
      return m.a * w;
    },
        scaleh = function scaleh(h) {
      return m.d * h;
    },
        doSnapping = editorContext_$2.getGridSnapping() && selected.parentNode.parentNode.localName === 'svg',
        finishUp = function finishUp() {
      if (doSnapping) {
        Object.entries(changes).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              o = _ref2[0],
              value = _ref2[1];

          changes[o] = snapToGrid(value);
        });
      }

      assignAttributes(selected, changes, 1000, true);
    },
        box = getBBox(selected);

    for (var i = 0; i < 2; i++) {
      var type = i === 0 ? 'fill' : 'stroke';
      var attrVal = selected.getAttribute(type);

      if (attrVal && attrVal.startsWith('url(')) {
        if (m.a < 0 || m.d < 0) {
          var grad = getRefElem(attrVal);
          var newgrad = grad.cloneNode(true);

          if (m.a < 0) {
            // flip x
            var x1 = newgrad.getAttribute('x1');
            var x2 = newgrad.getAttribute('x2');
            newgrad.setAttribute('x1', -(x1 - 1));
            newgrad.setAttribute('x2', -(x2 - 1));
          }

          if (m.d < 0) {
            // flip y
            var y1 = newgrad.getAttribute('y1');
            var y2 = newgrad.getAttribute('y2');
            newgrad.setAttribute('y1', -(y1 - 1));
            newgrad.setAttribute('y2', -(y2 - 1));
          }

          newgrad.id = editorContext_$2.getDrawing().getNextId();
          findDefs().append(newgrad);
          selected.setAttribute(type, 'url(#' + newgrad.id + ')');
        } // Not really working :(
        // if (selected.tagName === 'path') {
        //   reorientGrads(selected, m);
        // }

      }
    }

    var elName = selected.tagName;

    if (elName === 'g' || elName === 'text' || elName === 'tspan' || elName === 'use') {
      // if it was a translate, then just update x,y
      if (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && (m.e !== 0 || m.f !== 0)) {
        // [T][M] = [M][T']
        // therefore [T'] = [M_inv][T][M]
        var existing = transformListToTransform(selected).matrix,
            tNew = matrixMultiply(existing.inverse(), m, existing);
        changes.x = parseFloat(changes.x) + tNew.e;
        changes.y = parseFloat(changes.y) + tNew.f;
      } else {
        // we just absorb all matrices into the element and don't do any remapping
        var chlist = getTransformList(selected);
        var mt = editorContext_$2.getSVGRoot().createSVGTransform();
        mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix, m));
        chlist.clear();
        chlist.appendItem(mt);
      }
    } // now we have a set of changes and an applied reduced transform list
    // we apply the changes directly to the DOM


    switch (elName) {
      case 'foreignObject':
      case 'rect':
      case 'image':
        {
          // Allow images to be inverted (give them matrix when flipped)
          if (elName === 'image' && (m.a < 0 || m.d < 0)) {
            // Convert to matrix
            var _chlist = getTransformList(selected);

            var _mt = editorContext_$2.getSVGRoot().createSVGTransform();

            _mt.setMatrix(matrixMultiply(transformListToTransform(_chlist).matrix, m));

            _chlist.clear();

            _chlist.appendItem(_mt);
          } else {
            var pt1 = remap(changes.x, changes.y);
            changes.width = scalew(changes.width);
            changes.height = scaleh(changes.height);
            changes.x = pt1.x + Math.min(0, changes.width);
            changes.y = pt1.y + Math.min(0, changes.height);
            changes.width = Math.abs(changes.width);
            changes.height = Math.abs(changes.height);
          }

          finishUp();
          break;
        }

      case 'ellipse':
        {
          var c = remap(changes.cx, changes.cy);
          changes.cx = c.x;
          changes.cy = c.y;
          changes.rx = scalew(changes.rx);
          changes.ry = scaleh(changes.ry);
          changes.rx = Math.abs(changes.rx);
          changes.ry = Math.abs(changes.ry);
          finishUp();
          break;
        }

      case 'circle':
        {
          var _c = remap(changes.cx, changes.cy);

          changes.cx = _c.x;
          changes.cy = _c.y; // take the minimum of the new selected box's dimensions for the new circle radius

          var tbox = transformBox(box.x, box.y, box.width, box.height, m);
          var w = tbox.tr.x - tbox.tl.x,
              h = tbox.bl.y - tbox.tl.y;
          changes.r = Math.min(w / 2, h / 2);

          if (changes.r) {
            changes.r = Math.abs(changes.r);
          }

          finishUp();
          break;
        }

      case 'line':
        {
          var _pt = remap(changes.x1, changes.y1);

          var pt2 = remap(changes.x2, changes.y2);
          changes.x1 = _pt.x;
          changes.y1 = _pt.y;
          changes.x2 = pt2.x;
          changes.y2 = pt2.y;
        }
      // Fallthrough

      case 'text':
      case 'tspan':
      case 'use':
        {
          finishUp();
          break;
        }

      case 'g':
        {
          var gsvg = $$5(selected).data('gsvg');

          if (gsvg) {
            assignAttributes(gsvg, changes, 1000, true);
          }

          break;
        }

      case 'polyline':
      case 'polygon':
        {
          var len = changes.points.length;

          for (var _i = 0; _i < len; ++_i) {
            var pt = changes.points[_i];

            var _remap = remap(pt.x, pt.y),
                x = _remap.x,
                y = _remap.y;

            changes.points[_i].x = x;
            changes.points[_i].y = y;
          } // const len = changes.points.length;


          var pstr = '';

          for (var _i2 = 0; _i2 < len; ++_i2) {
            var _pt2 = changes.points[_i2];
            pstr += _pt2.x + ',' + _pt2.y + ' ';
          }

          selected.setAttribute('points', pstr);
          break;
        }

      case 'path':
        {
          var segList = selected.pathSegList;
          var _len = segList.numberOfItems;
          changes.d = [];

          for (var _i3 = 0; _i3 < _len; ++_i3) {
            var seg = segList.getItem(_i3);
            changes.d[_i3] = {
              type: seg.pathSegType,
              x: seg.x,
              y: seg.y,
              x1: seg.x1,
              y1: seg.y1,
              x2: seg.x2,
              y2: seg.y2,
              r1: seg.r1,
              r2: seg.r2,
              angle: seg.angle,
              largeArcFlag: seg.largeArcFlag,
              sweepFlag: seg.sweepFlag
            };
          }

          _len = changes.d.length;
          var firstseg = changes.d[0],
              currentpt = remap(firstseg.x, firstseg.y);
          changes.d[0].x = currentpt.x;
          changes.d[0].y = currentpt.y;

          for (var _i4 = 1; _i4 < _len; ++_i4) {
            var _seg = changes.d[_i4];
            var _type = _seg.type; // if absolute or first segment, we want to remap x, y, x1, y1, x2, y2
            // if relative, we want to scalew, scaleh

            if (_type % 2 === 0) {
              // absolute
              var thisx = _seg.x !== undefined ? _seg.x : currentpt.x,
                  // for V commands
              thisy = _seg.y !== undefined ? _seg.y : currentpt.y; // for H commands

              var _pt3 = remap(thisx, thisy);

              var _pt4 = remap(_seg.x1, _seg.y1);

              var _pt5 = remap(_seg.x2, _seg.y2);

              _seg.x = _pt3.x;
              _seg.y = _pt3.y;
              _seg.x1 = _pt4.x;
              _seg.y1 = _pt4.y;
              _seg.x2 = _pt5.x;
              _seg.y2 = _pt5.y;
              _seg.r1 = scalew(_seg.r1);
              _seg.r2 = scaleh(_seg.r2);
            } else {
              // relative
              _seg.x = scalew(_seg.x);
              _seg.y = scaleh(_seg.y);
              _seg.x1 = scalew(_seg.x1);
              _seg.y1 = scaleh(_seg.y1);
              _seg.x2 = scalew(_seg.x2);
              _seg.y2 = scaleh(_seg.y2);
              _seg.r1 = scalew(_seg.r1);
              _seg.r2 = scaleh(_seg.r2);
            }
          } // for each segment


          var dstr = '';
          _len = changes.d.length;

          for (var _i5 = 0; _i5 < _len; ++_i5) {
            var _seg2 = changes.d[_i5];
            var _type2 = _seg2.type;
            dstr += pathMap$1[_type2];

            switch (_type2) {
              case 13: // relative horizontal line (h)

              case 12:
                // absolute horizontal line (H)
                dstr += _seg2.x + ' ';
                break;

              case 15: // relative vertical line (v)

              case 14:
                // absolute vertical line (V)
                dstr += _seg2.y + ' ';
                break;

              case 3: // relative move (m)

              case 5: // relative line (l)

              case 19: // relative smooth quad (t)

              case 2: // absolute move (M)

              case 4: // absolute line (L)

              case 18:
                // absolute smooth quad (T)
                dstr += _seg2.x + ',' + _seg2.y + ' ';
                break;

              case 7: // relative cubic (c)

              case 6:
                // absolute cubic (C)
                dstr += _seg2.x1 + ',' + _seg2.y1 + ' ' + _seg2.x2 + ',' + _seg2.y2 + ' ' + _seg2.x + ',' + _seg2.y + ' ';
                break;

              case 9: // relative quad (q)

              case 8:
                // absolute quad (Q)
                dstr += _seg2.x1 + ',' + _seg2.y1 + ' ' + _seg2.x + ',' + _seg2.y + ' ';
                break;

              case 11: // relative elliptical arc (a)

              case 10:
                // absolute elliptical arc (A)
                dstr += _seg2.r1 + ',' + _seg2.r2 + ' ' + _seg2.angle + ' ' + Number(_seg2.largeArcFlag) + ' ' + Number(_seg2.sweepFlag) + ' ' + _seg2.x + ',' + _seg2.y + ' ';
                break;

              case 17: // relative smooth cubic (s)

              case 16:
                // absolute smooth cubic (S)
                dstr += _seg2.x2 + ',' + _seg2.y2 + ' ' + _seg2.x + ',' + _seg2.y + ' ';
                break;
            }
          }

          selected.setAttribute('d', dstr);
          break;
        }
    }
  };

  /* globals jQuery */
  var $$6 = jQueryPluginSVG(jQuery);
  var context_;
  /**
  * @interface module:recalculate.EditorContext
  */

  /**
   * @function module:recalculate.EditorContext#getSVGRoot
   * @returns {SVGSVGElement} The root DOM element
   */

  /**
   * @function module:recalculate.EditorContext#getStartTransform
   * @returns {string}
  */

  /**
   * @function module:recalculate.EditorContext#setStartTransform
   * @param {string} transform
   * @returns {void}
   */

  /**
  * @function module:recalculate.init
  * @param {module:recalculate.EditorContext} editorContext
  * @returns {void}
  */

  var init$5 = function init(editorContext) {
    context_ = editorContext;
  };
  /**
  * Updates a `<clipPath>`s values based on the given translation of an element.
  * @function module:recalculate.updateClipPath
  * @param {string} attr - The clip-path attribute value with the clipPath's ID
  * @param {Float} tx - The translation's x value
  * @param {Float} ty - The translation's y value
  * @returns {void}
  */

  var updateClipPath = function updateClipPath(attr, tx, ty) {
    var path = getRefElem(attr).firstChild;
    var cpXform = getTransformList(path);
    var newxlate = context_.getSVGRoot().createSVGTransform();
    newxlate.setTranslate(tx, ty);
    cpXform.appendItem(newxlate); // Update clipPath's dimensions

    recalculateDimensions(path);
  };
  /**
  * Decides the course of action based on the element's transform list.
  * @function module:recalculate.recalculateDimensions
  * @param {Element} selected - The DOM element to recalculate
  * @returns {Command} Undo command object with the resulting change
  */

  var recalculateDimensions = function recalculateDimensions(selected) {
    if (isNullish(selected)) {
      return null;
    } // Firefox Issue - 1081


    if (selected.nodeName === 'svg' && navigator.userAgent.includes('Firefox/20')) {
      return null;
    }

    var svgroot = context_.getSVGRoot();
    var tlist = getTransformList(selected); // remove any unnecessary transforms

    if (tlist && tlist.numberOfItems > 0) {
      var k = tlist.numberOfItems;
      var noi = k;

      while (k--) {
        var xform = tlist.getItem(k);

        if (xform.type === 0) {
          tlist.removeItem(k); // remove identity matrices
        } else if (xform.type === 1) {
          if (isIdentity(xform.matrix)) {
            if (noi === 1) {
              // Overcome Chrome bug (though only when noi is 1) with
              //    `removeItem` preventing `removeAttribute` from
              //    subsequently working
              // See https://bugs.chromium.org/p/chromium/issues/detail?id=843901
              selected.removeAttribute('transform');
              return null;
            }

            tlist.removeItem(k);
          } // remove zero-degree rotations

        } else if (xform.type === 4) {
          if (xform.angle === 0) {
            tlist.removeItem(k);
          }
        }
      } // End here if all it has is a rotation


      if (tlist.numberOfItems === 1 && getRotationAngle(selected)) {
        return null;
      }
    } // if this element had no transforms, we are done


    if (!tlist || tlist.numberOfItems === 0) {
      // Chrome apparently had a bug that requires clearing the attribute first.
      selected.setAttribute('transform', ''); // However, this still next line currently doesn't work at all in Chrome

      selected.removeAttribute('transform'); // selected.transform.baseVal.clear(); // Didn't help for Chrome bug

      return null;
    } // TODO: Make this work for more than 2


    if (tlist) {
      var mxs = [];
      var _k = tlist.numberOfItems;

      while (_k--) {
        var _xform = tlist.getItem(_k);

        if (_xform.type === 1) {
          mxs.push([_xform.matrix, _k]);
        } else if (mxs.length) {
          mxs = [];
        }
      }

      if (mxs.length === 2) {
        var mNew = svgroot.createSVGTransformFromMatrix(matrixMultiply(mxs[1][0], mxs[0][0]));
        tlist.removeItem(mxs[0][1]);
        tlist.removeItem(mxs[1][1]);
        tlist.insertItemBefore(mNew, mxs[1][1]);
      } // combine matrix + translate


      _k = tlist.numberOfItems;

      if (_k >= 2 && tlist.getItem(_k - 2).type === 1 && tlist.getItem(_k - 1).type === 2) {
        var mt = svgroot.createSVGTransform();
        var m = matrixMultiply(tlist.getItem(_k - 2).matrix, tlist.getItem(_k - 1).matrix);
        mt.setMatrix(m);
        tlist.removeItem(_k - 2);
        tlist.removeItem(_k - 2);
        tlist.appendItem(mt);
      }
    } // If it still has a single [M] or [R][M], return null too (prevents BatchCommand from being returned).


    switch (selected.tagName) {
      // Ignore these elements, as they can absorb the [M]
      case 'line':
      case 'polyline':
      case 'polygon':
      case 'path':
        break;

      default:
        if (tlist.numberOfItems === 1 && tlist.getItem(0).type === 1 || tlist.numberOfItems === 2 && tlist.getItem(0).type === 1 && tlist.getItem(0).type === 4) {
          return null;
        }

    } // Grouped SVG element


    var gsvg = $$6(selected).data('gsvg'); // we know we have some transforms, so set up return variable

    var batchCmd = new BatchCommand('Transform'); // store initial values that will be affected by reducing the transform list

    var changes = {};
    var initial = null;
    var attrs = [];

    switch (selected.tagName) {
      case 'line':
        attrs = ['x1', 'y1', 'x2', 'y2'];
        break;

      case 'circle':
        attrs = ['cx', 'cy', 'r'];
        break;

      case 'ellipse':
        attrs = ['cx', 'cy', 'rx', 'ry'];
        break;

      case 'foreignObject':
      case 'rect':
      case 'image':
        attrs = ['width', 'height', 'x', 'y'];
        break;

      case 'use':
      case 'text':
      case 'tspan':
        attrs = ['x', 'y'];
        break;

      case 'polygon':
      case 'polyline':
        {
          initial = {};
          initial.points = selected.getAttribute('points');
          var list = selected.points;
          var len = list.numberOfItems;
          changes.points = new Array(len);

          for (var i = 0; i < len; ++i) {
            var pt = list.getItem(i);
            changes.points[i] = {
              x: pt.x,
              y: pt.y
            };
          }

          break;
        }

      case 'path':
        initial = {};
        initial.d = selected.getAttribute('d');
        changes.d = selected.getAttribute('d');
        break;
    } // switch on element type to get initial values


    if (attrs.length) {
      changes = $$6(selected).attr(attrs);
      $$6.each(changes, function (attr, val) {
        changes[attr] = convertToNum(attr, val);
      });
    } else if (gsvg) {
      // GSVG exception
      changes = {
        x: $$6(gsvg).attr('x') || 0,
        y: $$6(gsvg).attr('y') || 0
      };
    } // if we haven't created an initial array in polygon/polyline/path, then
    // make a copy of initial values and include the transform


    if (isNullish(initial)) {
      initial = $$6.extend(true, {}, changes);
      $$6.each(initial, function (attr, val) {
        initial[attr] = convertToNum(attr, val);
      });
    } // save the start transform value too


    initial.transform = context_.getStartTransform() || '';
    var oldcenter, newcenter; // if it's a regular group, we have special processing to flatten transforms

    if (selected.tagName === 'g' && !gsvg || selected.tagName === 'a') {
      var box = getBBox(selected);
      oldcenter = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };
      newcenter = transformPoint(box.x + box.width / 2, box.y + box.height / 2, transformListToTransform(tlist).matrix); // let m = svgroot.createSVGMatrix();
      // temporarily strip off the rotate and save the old center

      var gangle = getRotationAngle(selected);

      if (gangle) {
        var a = gangle * Math.PI / 180;
        var s;

        if (Math.abs(a) > 1.0e-10) {
          s = Math.sin(a) / (1 - Math.cos(a));
        } else {
          // FIXME: This blows up if the angle is exactly 0!
          s = 2 / a;
        }

        for (var _i = 0; _i < tlist.numberOfItems; ++_i) {
          var _xform2 = tlist.getItem(_i);

          if (_xform2.type === 4) {
            // extract old center through mystical arts
            var rm = _xform2.matrix;
            oldcenter.y = (s * rm.e + rm.f) / 2;
            oldcenter.x = (rm.e - s * rm.f) / 2;
            tlist.removeItem(_i);
            break;
          }
        }
      }

      var N = tlist.numberOfItems;
      var tx = 0,
          ty = 0,
          operation = 0;
      var firstM;

      if (N) {
        firstM = tlist.getItem(0).matrix;
      }

      var oldStartTransform; // first, if it was a scale then the second-last transform will be it

      if (N >= 3 && tlist.getItem(N - 2).type === 3 && tlist.getItem(N - 3).type === 2 && tlist.getItem(N - 1).type === 2) {
        operation = 3; // scale
        // if the children are unrotated, pass the scale down directly
        // otherwise pass the equivalent matrix() down directly

        var tm = tlist.getItem(N - 3).matrix,
            sm = tlist.getItem(N - 2).matrix,
            tmn = tlist.getItem(N - 1).matrix;
        var children = selected.childNodes;
        var c = children.length;

        while (c--) {
          var child = children.item(c);
          tx = 0;
          ty = 0;

          if (child.nodeType === 1) {
            var childTlist = getTransformList(child); // some children might not have a transform (<metadata>, <defs>, etc)

            if (!childTlist) {
              continue;
            }

            var _m = transformListToTransform(childTlist).matrix; // Convert a matrix to a scale if applicable
            // if (hasMatrixTransform(childTlist) && childTlist.numberOfItems == 1) {
            //   if (m.b==0 && m.c==0 && m.e==0 && m.f==0) {
            //     childTlist.removeItem(0);
            //     const translateOrigin = svgroot.createSVGTransform(),
            //       scale = svgroot.createSVGTransform(),
            //       translateBack = svgroot.createSVGTransform();
            //     translateOrigin.setTranslate(0, 0);
            //     scale.setScale(m.a, m.d);
            //     translateBack.setTranslate(0, 0);
            //     childTlist.appendItem(translateBack);
            //     childTlist.appendItem(scale);
            //     childTlist.appendItem(translateOrigin);
            //   }
            // }

            var angle = getRotationAngle(child);
            oldStartTransform = context_.getStartTransform();
            var childxforms = [];
            context_.setStartTransform(child.getAttribute('transform'));

            if (angle || hasMatrixTransform(childTlist)) {
              var e2t = svgroot.createSVGTransform();
              e2t.setMatrix(matrixMultiply(tm, sm, tmn, _m));
              childTlist.clear();
              childTlist.appendItem(e2t);
              childxforms.push(e2t); // if not rotated or skewed, push the [T][S][-T] down to the child
            } else {
              // update the transform list with translate,scale,translate
              // slide the [T][S][-T] from the front to the back
              // [T][S][-T][M] = [M][T2][S2][-T2]
              // (only bringing [-T] to the right of [M])
              // [T][S][-T][M] = [T][S][M][-T2]
              // [-T2] = [M_inv][-T][M]
              var t2n = matrixMultiply(_m.inverse(), tmn, _m); // [T2] is always negative translation of [-T2]

              var t2 = svgroot.createSVGMatrix();
              t2.e = -t2n.e;
              t2.f = -t2n.f; // [T][S][-T][M] = [M][T2][S2][-T2]
              // [S2] = [T2_inv][M_inv][T][S][-T][M][-T2_inv]

              var s2 = matrixMultiply(t2.inverse(), _m.inverse(), tm, sm, tmn, _m, t2n.inverse());
              var translateOrigin = svgroot.createSVGTransform(),
                  scale = svgroot.createSVGTransform(),
                  translateBack = svgroot.createSVGTransform();
              translateOrigin.setTranslate(t2n.e, t2n.f);
              scale.setScale(s2.a, s2.d);
              translateBack.setTranslate(t2.e, t2.f);
              childTlist.appendItem(translateBack);
              childTlist.appendItem(scale);
              childTlist.appendItem(translateOrigin);
              childxforms.push(translateBack);
              childxforms.push(scale);
              childxforms.push(translateOrigin); // logMatrix(translateBack.matrix);
              // logMatrix(scale.matrix);
            } // not rotated


            batchCmd.addSubCommand(recalculateDimensions(child)); // TODO: If any <use> have this group as a parent and are
            // referencing this child, then we need to impose a reverse
            // scale on it so that when it won't get double-translated
            // const uses = selected.getElementsByTagNameNS(NS.SVG, 'use');
            // const href = '#' + child.id;
            // let u = uses.length;
            // while (u--) {
            //   const useElem = uses.item(u);
            //   if (href == getHref(useElem)) {
            //     const usexlate = svgroot.createSVGTransform();
            //     usexlate.setTranslate(-tx,-ty);
            //     getTransformList(useElem).insertItemBefore(usexlate,0);
            //     batchCmd.addSubCommand( recalculateDimensions(useElem) );
            //   }
            // }

            context_.setStartTransform(oldStartTransform);
          } // element

        } // for each child
        // Remove these transforms from group


        tlist.removeItem(N - 1);
        tlist.removeItem(N - 2);
        tlist.removeItem(N - 3);
      } else if (N >= 3 && tlist.getItem(N - 1).type === 1) {
        operation = 3; // scale

        var _m2 = transformListToTransform(tlist).matrix;

        var _e2t = svgroot.createSVGTransform();

        _e2t.setMatrix(_m2);

        tlist.clear();
        tlist.appendItem(_e2t); // next, check if the first transform was a translate
        // if we had [ T1 ] [ M ] we want to transform this into [ M ] [ T2 ]
        // therefore [ T2 ] = [ M_inv ] [ T1 ] [ M ]
      } else if ((N === 1 || N > 1 && tlist.getItem(1).type !== 3) && tlist.getItem(0).type === 2) {
        operation = 2; // translate

        var T_M = transformListToTransform(tlist).matrix;
        tlist.removeItem(0);
        var mInv = transformListToTransform(tlist).matrix.inverse();
        var M2 = matrixMultiply(mInv, T_M);
        tx = M2.e;
        ty = M2.f;

        if (tx !== 0 || ty !== 0) {
          // we pass the translates down to the individual children
          var _children = selected.childNodes;
          var _c = _children.length;
          var clipPathsDone = [];

          while (_c--) {
            var _child = _children.item(_c);

            if (_child.nodeType === 1) {
              // Check if child has clip-path
              if (_child.getAttribute('clip-path')) {
                // tx, ty
                var attr = _child.getAttribute('clip-path');

                if (!clipPathsDone.includes(attr)) {
                  updateClipPath(attr, tx, ty);
                  clipPathsDone.push(attr);
                }
              }

              oldStartTransform = context_.getStartTransform();
              context_.setStartTransform(_child.getAttribute('transform'));

              var _childTlist = getTransformList(_child); // some children might not have a transform (<metadata>, <defs>, etc)


              if (_childTlist) {
                var newxlate = svgroot.createSVGTransform();
                newxlate.setTranslate(tx, ty);

                if (_childTlist.numberOfItems) {
                  _childTlist.insertItemBefore(newxlate, 0);
                } else {
                  _childTlist.appendItem(newxlate);
                }

                batchCmd.addSubCommand(recalculateDimensions(_child)); // If any <use> have this group as a parent and are
                // referencing this child, then impose a reverse translate on it
                // so that when it won't get double-translated

                var uses = selected.getElementsByTagNameNS(NS.SVG, 'use');
                var href = '#' + _child.id;
                var u = uses.length;

                while (u--) {
                  var useElem = uses.item(u);

                  if (href === getHref(useElem)) {
                    var usexlate = svgroot.createSVGTransform();
                    usexlate.setTranslate(-tx, -ty);
                    getTransformList(useElem).insertItemBefore(usexlate, 0);
                    batchCmd.addSubCommand(recalculateDimensions(useElem));
                  }
                }

                context_.setStartTransform(oldStartTransform);
              }
            }
          }

          context_.setStartTransform(oldStartTransform);
        } // else, a matrix imposition from a parent group
        // keep pushing it down to the children

      } else if (N === 1 && tlist.getItem(0).type === 1 && !gangle) {
        operation = 1;
        var _m3 = tlist.getItem(0).matrix,
            _children2 = selected.childNodes;
        var _c2 = _children2.length;

        while (_c2--) {
          var _child2 = _children2.item(_c2);

          if (_child2.nodeType === 1) {
            oldStartTransform = context_.getStartTransform();
            context_.setStartTransform(_child2.getAttribute('transform'));

            var _childTlist2 = getTransformList(_child2);

            if (!_childTlist2) {
              continue;
            }

            var em = matrixMultiply(_m3, transformListToTransform(_childTlist2).matrix);
            var e2m = svgroot.createSVGTransform();
            e2m.setMatrix(em);

            _childTlist2.clear();

            _childTlist2.appendItem(e2m, 0);

            batchCmd.addSubCommand(recalculateDimensions(_child2));
            context_.setStartTransform(oldStartTransform); // Convert stroke
            // TODO: Find out if this should actually happen somewhere else

            var sw = _child2.getAttribute('stroke-width');

            if (_child2.getAttribute('stroke') !== 'none' && !isNaN(sw)) {
              var avg = (Math.abs(em.a) + Math.abs(em.d)) / 2;

              _child2.setAttribute('stroke-width', sw * avg);
            }
          }
        }

        tlist.clear(); // else it was just a rotate
      } else {
        if (gangle) {
          var newRot = svgroot.createSVGTransform();
          newRot.setRotate(gangle, newcenter.x, newcenter.y);

          if (tlist.numberOfItems) {
            tlist.insertItemBefore(newRot, 0);
          } else {
            tlist.appendItem(newRot);
          }
        }

        if (tlist.numberOfItems === 0) {
          selected.removeAttribute('transform');
        }

        return null;
      } // if it was a translate, put back the rotate at the new center


      if (operation === 2) {
        if (gangle) {
          newcenter = {
            x: oldcenter.x + firstM.e,
            y: oldcenter.y + firstM.f
          };

          var _newRot = svgroot.createSVGTransform();

          _newRot.setRotate(gangle, newcenter.x, newcenter.y);

          if (tlist.numberOfItems) {
            tlist.insertItemBefore(_newRot, 0);
          } else {
            tlist.appendItem(_newRot);
          }
        } // if it was a resize

      } else if (operation === 3) {
        var _m4 = transformListToTransform(tlist).matrix;
        var roldt = svgroot.createSVGTransform();
        roldt.setRotate(gangle, oldcenter.x, oldcenter.y);
        var rold = roldt.matrix;
        var rnew = svgroot.createSVGTransform();
        rnew.setRotate(gangle, newcenter.x, newcenter.y);

        var rnewInv = rnew.matrix.inverse(),
            _mInv = _m4.inverse(),
            extrat = matrixMultiply(_mInv, rnewInv, rold, _m4);

        tx = extrat.e;
        ty = extrat.f;

        if (tx !== 0 || ty !== 0) {
          // now push this transform down to the children
          // we pass the translates down to the individual children
          var _children3 = selected.childNodes;
          var _c3 = _children3.length;

          while (_c3--) {
            var _child3 = _children3.item(_c3);

            if (_child3.nodeType === 1) {
              oldStartTransform = context_.getStartTransform();
              context_.setStartTransform(_child3.getAttribute('transform'));

              var _childTlist3 = getTransformList(_child3);

              var _newxlate = svgroot.createSVGTransform();

              _newxlate.setTranslate(tx, ty);

              if (_childTlist3.numberOfItems) {
                _childTlist3.insertItemBefore(_newxlate, 0);
              } else {
                _childTlist3.appendItem(_newxlate);
              }

              batchCmd.addSubCommand(recalculateDimensions(_child3));
              context_.setStartTransform(oldStartTransform);
            }
          }
        }

        if (gangle) {
          if (tlist.numberOfItems) {
            tlist.insertItemBefore(rnew, 0);
          } else {
            tlist.appendItem(rnew);
          }
        }
      } // else, it's a non-group

    } else {
      // FIXME: box might be null for some elements (<metadata> etc), need to handle this
      var _box = getBBox(selected); // Paths (and possbly other shapes) will have no BBox while still in <defs>,
      // but we still may need to recalculate them (see issue 595).
      // TODO: Figure out how to get BBox from these elements in case they
      // have a rotation transform


      if (!_box && selected.tagName !== 'path') return null;

      var _m5; // = svgroot.createSVGMatrix();
      // temporarily strip off the rotate and save the old center


      var _angle = getRotationAngle(selected);

      if (_angle) {
        oldcenter = {
          x: _box.x + _box.width / 2,
          y: _box.y + _box.height / 2
        };
        newcenter = transformPoint(_box.x + _box.width / 2, _box.y + _box.height / 2, transformListToTransform(tlist).matrix);

        var _a = _angle * Math.PI / 180;

        var _s = Math.abs(_a) > 1.0e-10 ? Math.sin(_a) / (1 - Math.cos(_a)) // FIXME: This blows up if the angle is exactly 0!
        : 2 / _a;

        for (var _i2 = 0; _i2 < tlist.numberOfItems; ++_i2) {
          var _xform3 = tlist.getItem(_i2);

          if (_xform3.type === 4) {
            // extract old center through mystical arts
            var _rm = _xform3.matrix;
            oldcenter.y = (_s * _rm.e + _rm.f) / 2;
            oldcenter.x = (_rm.e - _s * _rm.f) / 2;
            tlist.removeItem(_i2);
            break;
          }
        }
      } // 2 = translate, 3 = scale, 4 = rotate, 1 = matrix imposition


      var _operation = 0;
      var _N = tlist.numberOfItems; // Check if it has a gradient with userSpaceOnUse, in which case
      // adjust it by recalculating the matrix transform.
      // TODO: Make this work in Webkit using transformlist.SVGTransformList

      if (!isWebkit()) {
        var fill = selected.getAttribute('fill');

        if (fill && fill.startsWith('url(')) {
          var paint = getRefElem(fill);
          var type = 'pattern';
          if (paint.tagName !== type) type = 'gradient';
          var attrVal = paint.getAttribute(type + 'Units');

          if (attrVal === 'userSpaceOnUse') {
            // Update the userSpaceOnUse element
            _m5 = transformListToTransform(tlist).matrix;
            var gtlist = getTransformList(paint);
            var gmatrix = transformListToTransform(gtlist).matrix;
            _m5 = matrixMultiply(_m5, gmatrix);
            var mStr = 'matrix(' + [_m5.a, _m5.b, _m5.c, _m5.d, _m5.e, _m5.f].join(',') + ')';
            paint.setAttribute(type + 'Transform', mStr);
          }
        }
      } // first, if it was a scale of a non-skewed element, then the second-last
      // transform will be the [S]
      // if we had [M][T][S][T] we want to extract the matrix equivalent of
      // [T][S][T] and push it down to the element


      if (_N >= 3 && tlist.getItem(_N - 2).type === 3 && tlist.getItem(_N - 3).type === 2 && tlist.getItem(_N - 1).type === 2) {
        // Removed this so a <use> with a given [T][S][T] would convert to a matrix.
        // Is that bad?
        //  && selected.nodeName != 'use'
        _operation = 3; // scale

        _m5 = transformListToTransform(tlist, _N - 3, _N - 1).matrix;
        tlist.removeItem(_N - 1);
        tlist.removeItem(_N - 2);
        tlist.removeItem(_N - 3); // if we had [T][S][-T][M], then this was a skewed element being resized
        // Thus, we simply combine it all into one matrix
      } else if (_N === 4 && tlist.getItem(_N - 1).type === 1) {
        _operation = 3; // scale

        _m5 = transformListToTransform(tlist).matrix;

        var _e2t2 = svgroot.createSVGTransform();

        _e2t2.setMatrix(_m5);

        tlist.clear();
        tlist.appendItem(_e2t2); // reset the matrix so that the element is not re-mapped

        _m5 = svgroot.createSVGMatrix(); // if we had [R][T][S][-T][M], then this was a rotated matrix-element
        // if we had [T1][M] we want to transform this into [M][T2]
        // therefore [ T2 ] = [ M_inv ] [ T1 ] [ M ] and we can push [T2]
        // down to the element
      } else if ((_N === 1 || _N > 1 && tlist.getItem(1).type !== 3) && tlist.getItem(0).type === 2) {
        _operation = 2; // translate

        var oldxlate = tlist.getItem(0).matrix,
            meq = transformListToTransform(tlist, 1).matrix,
            meqInv = meq.inverse();
        _m5 = matrixMultiply(meqInv, oldxlate, meq);
        tlist.removeItem(0); // else if this child now has a matrix imposition (from a parent group)
        // we might be able to simplify
      } else if (_N === 1 && tlist.getItem(0).type === 1 && !_angle) {
        // Remap all point-based elements
        _m5 = transformListToTransform(tlist).matrix;

        switch (selected.tagName) {
          case 'line':
            changes = $$6(selected).attr(['x1', 'y1', 'x2', 'y2']);
          // Fallthrough

          case 'polyline':
          case 'polygon':
            changes.points = selected.getAttribute('points');

            if (changes.points) {
              var _list = selected.points;
              var _len = _list.numberOfItems;
              changes.points = new Array(_len);

              for (var _i3 = 0; _i3 < _len; ++_i3) {
                var _pt = _list.getItem(_i3);

                changes.points[_i3] = {
                  x: _pt.x,
                  y: _pt.y
                };
              }
            }

          // Fallthrough

          case 'path':
            changes.d = selected.getAttribute('d');
            _operation = 1;
            tlist.clear();
            break;

          default:
            break;
        } // if it was a rotation, put the rotate back and return without a command
        // (this function has zero work to do for a rotate())

      } else {
        // operation = 4; // rotation
        if (_angle) {
          var _newRot2 = svgroot.createSVGTransform();

          _newRot2.setRotate(_angle, newcenter.x, newcenter.y);

          if (tlist.numberOfItems) {
            tlist.insertItemBefore(_newRot2, 0);
          } else {
            tlist.appendItem(_newRot2);
          }
        }

        if (tlist.numberOfItems === 0) {
          selected.removeAttribute('transform');
        }

        return null;
      } // if it was a translate or resize, we need to remap the element and absorb the xform


      if (_operation === 1 || _operation === 2 || _operation === 3) {
        remapElement(selected, changes, _m5);
      } // if we are remapping
      // if it was a translate, put back the rotate at the new center


      if (_operation === 2) {
        if (_angle) {
          if (!hasMatrixTransform(tlist)) {
            newcenter = {
              x: oldcenter.x + _m5.e,
              y: oldcenter.y + _m5.f
            };
          }

          var _newRot3 = svgroot.createSVGTransform();

          _newRot3.setRotate(_angle, newcenter.x, newcenter.y);

          if (tlist.numberOfItems) {
            tlist.insertItemBefore(_newRot3, 0);
          } else {
            tlist.appendItem(_newRot3);
          }
        } // We have special processing for tspans:  Tspans are not transformable
        // but they can have x,y coordinates (sigh).  Thus, if this was a translate,
        // on a text element, also translate any tspan children.


        if (selected.tagName === 'text') {
          var _children4 = selected.childNodes;
          var _c4 = _children4.length;

          while (_c4--) {
            var _child4 = _children4.item(_c4);

            if (_child4.tagName === 'tspan') {
              var tspanChanges = {
                x: $$6(_child4).attr('x') || 0,
                y: $$6(_child4).attr('y') || 0
              };
              remapElement(_child4, tspanChanges, _m5);
            }
          }
        } // [Rold][M][T][S][-T] became [Rold][M]
        // we want it to be [Rnew][M][Tr] where Tr is the
        // translation required to re-center it
        // Therefore, [Tr] = [M_inv][Rnew_inv][Rold][M]

      } else if (_operation === 3 && _angle) {
        var _transformListToTrans = transformListToTransform(tlist),
            matrix = _transformListToTrans.matrix;

        var _roldt = svgroot.createSVGTransform();

        _roldt.setRotate(_angle, oldcenter.x, oldcenter.y);

        var _rold = _roldt.matrix;

        var _rnew = svgroot.createSVGTransform();

        _rnew.setRotate(_angle, newcenter.x, newcenter.y);

        var _rnewInv = _rnew.matrix.inverse();

        var _mInv2 = matrix.inverse();

        var _extrat = matrixMultiply(_mInv2, _rnewInv, _rold, matrix);

        remapElement(selected, changes, _extrat);

        if (_angle) {
          if (tlist.numberOfItems) {
            tlist.insertItemBefore(_rnew, 0);
          } else {
            tlist.appendItem(_rnew);
          }
        }
      }
    } // a non-group
    // if the transform list has been emptied, remove it


    if (tlist.numberOfItems === 0) {
      selected.removeAttribute('transform');
    }

    batchCmd.addSubCommand(new ChangeElementCommand(selected, initial));
    return batchCmd;
  };

  var $$7 = jQuery;
  var svgFactory_;
  var config_;
  var selectorManager_; // A Singleton

  var gripRadius = isTouch() ? 10 : 4;
  /**
  * Private class for DOM element selection boxes.
  */

  var Selector =
  /*#__PURE__*/
  function () {
    /**
    * @param {Integer} id - Internally identify the selector
    * @param {Element} elem - DOM element associated with this selector
    * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for initialization (prevents duplicate `getBBox` call).
    */
    function Selector(id, elem, bbox) {
      _classCallCheck(this, Selector);

      // this is the selector's unique number
      this.id = id; // this holds a reference to the element for which this selector is being used

      this.selectedElement = elem; // this is a flag used internally to track whether the selector is being used or not

      this.locked = true; // this holds a reference to the <g> element that holds all visual elements of the selector

      this.selectorGroup = svgFactory_.createSVGElement({
        element: 'g',
        attr: {
          id: 'selectorGroup' + this.id
        }
      }); // this holds a reference to the path rect

      this.selectorRect = this.selectorGroup.appendChild(svgFactory_.createSVGElement({
        element: 'path',
        attr: {
          id: 'selectedBox' + this.id,
          fill: 'none',
          stroke: '#22C',
          'stroke-width': '1',
          'stroke-dasharray': '5,5',
          // need to specify this so that the rect is not selectable
          style: 'pointer-events:none'
        }
      })); // this holds a reference to the grip coordinates for this selector

      this.gripCoords = {
        nw: null,
        n: null,
        ne: null,
        e: null,
        se: null,
        s: null,
        sw: null,
        w: null
      };
      this.reset(this.selectedElement, bbox);
    }
    /**
    * Used to reset the id and element that the selector is attached to.
    * @param {Element} e - DOM element associated with this selector
    * @param {module:utilities.BBoxObject} bbox - Optional bbox to use for reset (prevents duplicate getBBox call).
    * @returns {void}
    */


    _createClass(Selector, [{
      key: "reset",
      value: function reset(e, bbox) {
        this.locked = true;
        this.selectedElement = e;
        this.resize(bbox);
        this.selectorGroup.setAttribute('display', 'inline');
      }
      /**
      * Show the resize grips of this selector.
      * @param {boolean} show - Indicates whether grips should be shown or not
      * @returns {void}
      */

    }, {
      key: "showGrips",
      value: function showGrips(show) {
        var bShow = show ? 'inline' : 'none';
        selectorManager_.selectorGripsGroup.setAttribute('display', bShow);
        var elem = this.selectedElement;
        this.hasGrips = show;

        if (elem && show) {
          this.selectorGroup.append(selectorManager_.selectorGripsGroup);
          Selector.updateGripCursors(getRotationAngle(elem));
        }
      }
      /**
      * Updates the selector to match the element's size.
      * @param {module:utilities.BBoxObject} [bbox] - BBox to use for resize (prevents duplicate getBBox call).
      * @returns {void}
      */

    }, {
      key: "resize",
      value: function resize(bbox) {
        var selectedBox = this.selectorRect,
            mgr = selectorManager_,
            selectedGrips = mgr.selectorGrips,
            selected = this.selectedElement,
            sw = selected.getAttribute('stroke-width'),
            currentZoom = svgFactory_.getCurrentZoom();
        var offset = 1 / currentZoom;

        if (selected.getAttribute('stroke') !== 'none' && !isNaN(sw)) {
          offset += sw / 2;
        }

        var tagName = selected.tagName;

        if (tagName === 'text') {
          offset += 2 / currentZoom;
        } // loop and transform our bounding box until we reach our first rotation


        var tlist = getTransformList(selected);
        var m = transformListToTransform(tlist).matrix; // This should probably be handled somewhere else, but for now
        // it keeps the selection box correctly positioned when zoomed

        m.e *= currentZoom;
        m.f *= currentZoom;

        if (!bbox) {
          bbox = getBBox(selected);
        } // TODO: getBBox (previous line) already knows to call getStrokedBBox when tagName === 'g'. Remove this?
        // TODO: getBBox doesn't exclude 'gsvg' and calls getStrokedBBox for any 'g'. Should getBBox be updated?


        if (tagName === 'g' && !$$7.data(selected, 'gsvg')) {
          // The bbox for a group does not include stroke vals, so we
          // get the bbox based on its children.
          var strokedBbox = getStrokedBBox([selected.childNodes]);

          if (strokedBbox) {
            bbox = strokedBbox;
          }
        } // apply the transforms


        var l = bbox.x,
            t = bbox.y,
            w = bbox.width,
            h = bbox.height; // bbox = {x: l, y: t, width: w, height: h}; // Not in use
        // we need to handle temporary transforms too
        // if skewed, get its transformed box, then find its axis-aligned bbox
        // *

        offset *= currentZoom;
        var nbox = transformBox(l * currentZoom, t * currentZoom, w * currentZoom, h * currentZoom, m),
            aabox = nbox.aabox;
        var nbax = aabox.x - offset,
            nbay = aabox.y - offset,
            nbaw = aabox.width + offset * 2,
            nbah = aabox.height + offset * 2; // now if the shape is rotated, un-rotate it

        var cx = nbax + nbaw / 2,
            cy = nbay + nbah / 2;
        var angle = getRotationAngle(selected);

        if (angle) {
          var rot = svgFactory_.svgRoot().createSVGTransform();
          rot.setRotate(-angle, cx, cy);
          var rotm = rot.matrix;
          nbox.tl = transformPoint(nbox.tl.x, nbox.tl.y, rotm);
          nbox.tr = transformPoint(nbox.tr.x, nbox.tr.y, rotm);
          nbox.bl = transformPoint(nbox.bl.x, nbox.bl.y, rotm);
          nbox.br = transformPoint(nbox.br.x, nbox.br.y, rotm); // calculate the axis-aligned bbox

          var tl = nbox.tl;
          var minx = tl.x,
              miny = tl.y,
              maxx = tl.x,
              maxy = tl.y;
          var min = Math.min,
              max = Math.max;
          minx = min(minx, min(nbox.tr.x, min(nbox.bl.x, nbox.br.x))) - offset;
          miny = min(miny, min(nbox.tr.y, min(nbox.bl.y, nbox.br.y))) - offset;
          maxx = max(maxx, max(nbox.tr.x, max(nbox.bl.x, nbox.br.x))) + offset;
          maxy = max(maxy, max(nbox.tr.y, max(nbox.bl.y, nbox.br.y))) + offset;
          nbax = minx;
          nbay = miny;
          nbaw = maxx - minx;
          nbah = maxy - miny;
        }

        var dstr = 'M' + nbax + ',' + nbay + ' L' + (nbax + nbaw) + ',' + nbay + ' ' + (nbax + nbaw) + ',' + (nbay + nbah) + ' ' + nbax + ',' + (nbay + nbah) + 'z';
        selectedBox.setAttribute('d', dstr);
        var xform = angle ? 'rotate(' + [angle, cx, cy].join(',') + ')' : '';
        this.selectorGroup.setAttribute('transform', xform); // TODO(codedread): Is this needed?
        //  if (selected === selectedElements[0]) {

        this.gripCoords = {
          nw: [nbax, nbay],
          ne: [nbax + nbaw, nbay],
          sw: [nbax, nbay + nbah],
          se: [nbax + nbaw, nbay + nbah],
          n: [nbax + nbaw / 2, nbay],
          w: [nbax, nbay + nbah / 2],
          e: [nbax + nbaw, nbay + nbah / 2],
          s: [nbax + nbaw / 2, nbay + nbah]
        };
        Object.entries(this.gripCoords).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              dir = _ref2[0],
              coords = _ref2[1];

          selectedGrips[dir].setAttribute('cx', coords[0]);
          selectedGrips[dir].setAttribute('cy', coords[1]);
        }); // we want to go 20 pixels in the negative transformed y direction, ignoring scale

        mgr.rotateGripConnector.setAttribute('x1', nbax + nbaw / 2);
        mgr.rotateGripConnector.setAttribute('y1', nbay);
        mgr.rotateGripConnector.setAttribute('x2', nbax + nbaw / 2);
        mgr.rotateGripConnector.setAttribute('y2', nbay - gripRadius * 5);
        mgr.rotateGrip.setAttribute('cx', nbax + nbaw / 2);
        mgr.rotateGrip.setAttribute('cy', nbay - gripRadius * 5); // }
      } // STATIC methods

      /**
      * Updates cursors for corner grips on rotation so arrows point the right way.
      * @param {Float} angle - Current rotation angle in degrees
      * @returns {void}
      */

    }], [{
      key: "updateGripCursors",
      value: function updateGripCursors(angle) {
        var dirArr = Object.keys(selectorManager_.selectorGrips);
        var steps = Math.round(angle / 45);

        if (steps < 0) {
          steps += 8;
        }

        while (steps > 0) {
          dirArr.push(dirArr.shift());
          steps--;
        }

        Object.values(selectorManager_.selectorGrips).forEach(function (gripElement, i) {
          gripElement.setAttribute('style', 'cursor:' + dirArr[i] + '-resize');
        });
      }
    }]);

    return Selector;
  }();
  /**
  * Manage all selector objects (selection boxes).
  */

  var SelectorManager =
  /*#__PURE__*/
  function () {
    function SelectorManager() {
      _classCallCheck(this, SelectorManager);

      // this will hold the <g> element that contains all selector rects/grips
      this.selectorParentGroup = null; // this is a special rect that is used for multi-select

      this.rubberBandBox = null; // this will hold objects of type Selector (see above)

      this.selectors = []; // this holds a map of SVG elements to their Selector object

      this.selectorMap = {}; // this holds a reference to the grip elements

      this.selectorGrips = {
        nw: null,
        n: null,
        ne: null,
        e: null,
        se: null,
        s: null,
        sw: null,
        w: null
      };
      this.selectorGripsGroup = null;
      this.rotateGripConnector = null;
      this.rotateGrip = null;
      this.initGroup();
    }
    /**
    * Resets the parent selector group element.
    * @returns {void}
    */


    _createClass(SelectorManager, [{
      key: "initGroup",
      value: function initGroup() {
        var _this = this;

        // remove old selector parent group if it existed
        if (this.selectorParentGroup && this.selectorParentGroup.parentNode) {
          this.selectorParentGroup.remove();
        } // create parent selector group and add it to svgroot


        this.selectorParentGroup = svgFactory_.createSVGElement({
          element: 'g',
          attr: {
            id: 'selectorParentGroup'
          }
        });
        this.selectorGripsGroup = svgFactory_.createSVGElement({
          element: 'g',
          attr: {
            display: 'none'
          }
        });
        this.selectorParentGroup.append(this.selectorGripsGroup);
        svgFactory_.svgRoot().append(this.selectorParentGroup);
        this.selectorMap = {};
        this.selectors = [];
        this.rubberBandBox = null; // add the corner grips

        Object.keys(this.selectorGrips).forEach(function (dir) {
          var grip = svgFactory_.createSVGElement({
            element: 'circle',
            attr: {
              id: 'selectorGrip_resize_' + dir,
              fill: '#22C',
              r: gripRadius,
              style: 'cursor:' + dir + '-resize',
              // This expands the mouse-able area of the grips making them
              // easier to grab with the mouse.
              // This works in Opera and WebKit, but does not work in Firefox
              // see https://bugzilla.mozilla.org/show_bug.cgi?id=500174
              'stroke-width': 2,
              'pointer-events': 'all'
            }
          });
          $$7.data(grip, 'dir', dir);
          $$7.data(grip, 'type', 'resize');
          _this.selectorGrips[dir] = _this.selectorGripsGroup.appendChild(grip);
        }); // add rotator elems

        this.rotateGripConnector = this.selectorGripsGroup.appendChild(svgFactory_.createSVGElement({
          element: 'line',
          attr: {
            id: 'selectorGrip_rotateconnector',
            stroke: '#22C',
            'stroke-width': '1'
          }
        }));
        this.rotateGrip = this.selectorGripsGroup.appendChild(svgFactory_.createSVGElement({
          element: 'circle',
          attr: {
            id: 'selectorGrip_rotate',
            fill: 'lime',
            r: gripRadius,
            stroke: '#22C',
            'stroke-width': 2,
            style: 'cursor:url(' + config_.imgPath + 'rotate.png) 12 12, auto;'
          }
        }));
        $$7.data(this.rotateGrip, 'type', 'rotate');

        if ($$7('#canvasBackground').length) {
          return;
        }

        var _config_$dimensions = _slicedToArray(config_.dimensions, 2),
            width = _config_$dimensions[0],
            height = _config_$dimensions[1];

        var canvasbg = svgFactory_.createSVGElement({
          element: 'svg',
          attr: {
            id: 'canvasBackground',
            width: width,
            height: height,
            x: 0,
            y: 0,
            overflow: isWebkit() ? 'none' : 'visible',
            // Chrome 7 has a problem with this when zooming out
            style: 'pointer-events:none'
          }
        });
        var rect = svgFactory_.createSVGElement({
          element: 'rect',
          attr: {
            width: '100%',
            height: '100%',
            x: 0,
            y: 0,
            'stroke-width': 1,
            stroke: '#000',
            fill: '#FFF',
            style: 'pointer-events:none'
          }
        }); // Both Firefox and WebKit are too slow with this filter region (especially at higher
        // zoom levels) and Opera has at least one bug
        // if (!isOpera()) rect.setAttribute('filter', 'url(#canvashadow)');

        canvasbg.append(rect);
        svgFactory_.svgRoot().insertBefore(canvasbg, svgFactory_.svgContent()); // Ok to replace above with `svgFactory_.svgContent().before(canvasbg);`?
      }
      /**
      *
      * @param {Element} elem - DOM element to get the selector for
      * @param {module:utilities.BBoxObject} [bbox] - Optional bbox to use for reset (prevents duplicate getBBox call).
      * @returns {Selector} The selector based on the given element
      */

    }, {
      key: "requestSelector",
      value: function requestSelector(elem, bbox) {
        if (isNullish(elem)) {
          return null;
        }

        var N = this.selectors.length; // If we've already acquired one for this element, return it.

        if (_typeof(this.selectorMap[elem.id]) === 'object') {
          this.selectorMap[elem.id].locked = true;
          return this.selectorMap[elem.id];
        }

        for (var i = 0; i < N; ++i) {
          if (this.selectors[i] && !this.selectors[i].locked) {
            this.selectors[i].locked = true;
            this.selectors[i].reset(elem, bbox);
            this.selectorMap[elem.id] = this.selectors[i];
            return this.selectors[i];
          }
        } // if we reached here, no available selectors were found, we create one


        this.selectors[N] = new Selector(N, elem, bbox);
        this.selectorParentGroup.append(this.selectors[N].selectorGroup);
        this.selectorMap[elem.id] = this.selectors[N];
        return this.selectors[N];
      }
      /**
      * Removes the selector of the given element (hides selection box).
      *
      * @param {Element} elem - DOM element to remove the selector for
      * @returns {void}
      */

    }, {
      key: "releaseSelector",
      value: function releaseSelector(elem) {
        if (isNullish(elem)) {
          return;
        }

        var N = this.selectors.length,
            sel = this.selectorMap[elem.id];

        if (!sel.locked) {
          // TODO(codedread): Ensure this exists in this module.
          console.log('WARNING! selector was released but was already unlocked'); // eslint-disable-line no-console
        }

        for (var i = 0; i < N; ++i) {
          if (this.selectors[i] && this.selectors[i] === sel) {
            delete this.selectorMap[elem.id];
            sel.locked = false;
            sel.selectedElement = null;
            sel.showGrips(false); // remove from DOM and store reference in JS but only if it exists in the DOM

            try {
              sel.selectorGroup.setAttribute('display', 'none');
            } catch (e) {}

            break;
          }
        }
      }
      /**
      * @returns {SVGRectElement} The rubberBandBox DOM element. This is the rectangle drawn by
      * the user for selecting/zooming
      */

    }, {
      key: "getRubberBandBox",
      value: function getRubberBandBox() {
        if (!this.rubberBandBox) {
          this.rubberBandBox = this.selectorParentGroup.appendChild(svgFactory_.createSVGElement({
            element: 'rect',
            attr: {
              id: 'selectorRubberBand',
              fill: '#22C',
              'fill-opacity': 0.15,
              stroke: '#22C',
              'stroke-width': 0.5,
              display: 'none',
              style: 'pointer-events:none'
            }
          }));
        }

        return this.rubberBandBox;
      }
    }]);

    return SelectorManager;
  }();
  /**
   * An object that creates SVG elements for the canvas.
   *
   * @interface module:select.SVGFactory
   */

  /**
   * @function module:select.SVGFactory#createSVGElement
   * @param {module:utilities.EditorContext#addSVGElementFromJson} jsonMap
   * @returns {SVGElement}
   */

  /**
   * @function module:select.SVGFactory#svgRoot
   * @returns {SVGSVGElement}
   */

  /**
   * @function module:select.SVGFactory#svgContent
   * @returns {SVGSVGElement}
   */

  /**
   * @function module:select.SVGFactory#getCurrentZoom
   * @returns {Float} The current zoom level
   */

  /**
   * @typedef {GenericArray} module:select.Dimensions
   * @property {Integer} length 2
   * @property {Float} 0 Width
   * @property {Float} 1 Height
   */

  /**
   * @typedef {PlainObject} module:select.Config
   * @property {string} imgPath
   * @property {module:select.Dimensions} dimensions
   */

  /**
   * Initializes this module.
   * @function module:select.init
   * @param {module:select.Config} config - An object containing configurable parameters (imgPath)
   * @param {module:select.SVGFactory} svgFactory - An object implementing the SVGFactory interface.
   * @returns {void}
   */

  var init$6 = function init(config, svgFactory) {
    config_ = config;
    svgFactory_ = svgFactory;
    selectorManager_ = new SelectorManager();
  };
  /**
   * @function module:select.getSelectorManager
   * @returns {module:select.SelectorManager} The SelectorManager instance.
   */

  var getSelectorManager = function getSelectorManager() {
    return selectorManager_;
  };

  var $$8 = jQueryPluginSVG(jQuery);
  var MoveElementCommand$1 = MoveElementCommand,
      InsertElementCommand$1 = InsertElementCommand,
      RemoveElementCommand$1 = RemoveElementCommand,
      ChangeElementCommand$1 = ChangeElementCommand,
      BatchCommand$1 = BatchCommand,
      UndoManager$1 = UndoManager,
      HistoryEventTypes$1 = HistoryEventTypes;

  if (!window.console) {
    window.console = {};

    window.console.log = function (str) {
      /* */
    };

    window.console.dir = function (str) {
      /* */
    };
  }

  if (window.opera) {
    window.console.log = function (str) {
      window.opera.postError(str);
    };

    window.console.dir = function (str) {
      /* */
    };
  } // Reenable after fixing eslint-plugin-jsdoc to handle

  /**
  * The main SvgCanvas class that manages all SVG-related functions.
  * @memberof module:svgcanvas
  *
  * @borrows module:coords.remapElement as #remapElement
  * @borrows module:recalculate.recalculateDimensions as #recalculateDimensions
  *
  * @borrows module:utilities.cleanupElement as #cleanupElement
  * @borrows module:utilities.getStrokedBBoxDefaultVisible as #getStrokedBBox
  * @borrows module:utilities.getVisibleElements as #getVisibleElements
  * @borrows module:utilities.findDefs as #findDefs
  * @borrows module:utilities.getUrlFromAttr as #getUrlFromAttr
  * @borrows module:utilities.getHref as #getHref
  * @borrows module:utilities.setHref as #setHref
  * @borrows module:utilities.getRotationAngle as #getRotationAngle
  * @borrows module:utilities.getBBox as #getBBox
  * @borrows module:utilities.getElem as #getElem
  * @borrows module:utilities.getRefElem as #getRefElem
  * @borrows module:utilities.assignAttributes as #assignAttributes
  *
  * @borrows module:SVGTransformList.getTransformList as #getTransformList
  * @borrows module:math.matrixMultiply as #matrixMultiply
  * @borrows module:math.hasMatrixTransform as #hasMatrixTransform
  * @borrows module:math.transformListToTransform as #transformListToTransform
  * @borrows module:units.convertToNum as #convertToNum
  * @borrows module:sanitize.sanitizeSvg as #sanitizeSvg
  * @borrows module:path.pathActions.linkControlPoints as #linkControlPoints
  */


  var SvgCanvas =
  /**
  * @param {HTMLElement} container - The container HTML element that should hold the SVG root element
  * @param {module:SVGEditor.curConfig} config - An object that contains configuration data
  */
  function SvgCanvas(container, config) {
    _classCallCheck(this, SvgCanvas);

    // Alias Namespace constants
    // Default configuration options
    var curConfig = {
      show_outside_canvas: true,
      selectNew: true,
      dimensions: [640, 480]
    }; // Update config with new one if given

    if (config) {
      $$8.extend(curConfig, config);
    } // Array with width/height of canvas


    var dimensions = curConfig.dimensions;
    var canvas = this; // eslint-disable-line consistent-this
    // "document" element associated with the container (same as window.document using default svg-editor.js)
    // NOTE: This is not actually a SVG document, but an HTML document.

    var svgdoc = container.ownerDocument; // This is a container for the document being edited, not the document itself.

    /**
     * @name module:svgcanvas~svgroot
     * @type {SVGSVGElement}
     */

    var svgroot = svgdoc.importNode(text2xml('<svg id="svgroot" xmlns="' + NS.SVG + '" xlinkns="' + NS.XLINK + '" ' + 'width="' + dimensions[0] + '" height="' + dimensions[1] + '" x="' + dimensions[0] + '" y="' + dimensions[1] + '" overflow="visible">' + '<defs>' + '<filter id="canvashadow" filterUnits="objectBoundingBox">' + '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>' + '<feOffset in="blur" dx="5" dy="5" result="offsetBlur"/>' + '<feMerge>' + '<feMergeNode in="offsetBlur"/>' + '<feMergeNode in="SourceGraphic"/>' + '</feMerge>' + '</filter>' + '</defs>' + '</svg>').documentElement, true);
    container.append(svgroot);
    /**
     * The actual element that represents the final output SVG element
     * @name module:svgcanvas~svgcontent
     * @type {SVGSVGElement}
     */

    var svgcontent = svgdoc.createElementNS(NS.SVG, 'svg');
    /**
    * This function resets the svgcontent element while keeping it in the DOM.
    * @function module:svgcanvas.SvgCanvas#clearSvgContentElement
    * @returns {void}
    */

    var clearSvgContentElement = canvas.clearSvgContentElement = function () {
      $$8(svgcontent).empty(); // TODO: Clear out all other attributes first?

      $$8(svgcontent).attr({
        id: 'svgcontent',
        width: dimensions[0],
        height: dimensions[1],
        x: dimensions[0],
        y: dimensions[1],
        overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
        xmlns: NS.SVG,
        'xmlns:se': NS.SE,
        'xmlns:xlink': NS.XLINK
      }).appendTo(svgroot); // TODO: make this string optional and set by the client

      var comment = svgdoc.createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
      svgcontent.append(comment);
    };

    clearSvgContentElement(); // Prefix string for element IDs

    var idprefix = 'svg_';
    /**
    * Changes the ID prefix to the given value.
    * @function module:svgcanvas.SvgCanvas#setIdPrefix
    * @param {string} p - String with the new prefix
    * @returns {void}
    */

    canvas.setIdPrefix = function (p) {
      idprefix = p;
    };
    /**
    * Current draw.Drawing object
    * @type {module:draw.Drawing}
    * @name module:svgcanvas.SvgCanvas#current_drawing_
    */


    canvas.current_drawing_ = new Drawing(svgcontent, idprefix);
    /**
    * Returns the current Drawing.
    * @name module:svgcanvas.SvgCanvas#getCurrentDrawing
    * @type {module:draw.DrawCanvasInit#getCurrentDrawing}
    */

    var getCurrentDrawing = canvas.getCurrentDrawing = function () {
      return canvas.current_drawing_;
    };
    /**
    * Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
    * @type {Float}
    */


    var currentZoom = 1; // pointer to current group (for in-group editing)

    var currentGroup = null; // Object containing data for the currently selected styles

    var allProperties = {
      shape: {
        fill: (curConfig.initFill.color === 'none' ? '' : '#') + curConfig.initFill.color,
        fill_paint: null,
        fill_opacity: curConfig.initFill.opacity,
        stroke: '#' + curConfig.initStroke.color,
        stroke_paint: null,
        stroke_opacity: curConfig.initStroke.opacity,
        stroke_width: curConfig.initStroke.width,
        stroke_dasharray: 'none',
        stroke_linejoin: 'miter',
        stroke_linecap: 'butt',
        opacity: curConfig.initOpacity
      }
    };
    allProperties.text = $$8.extend(true, {}, allProperties.shape);
    $$8.extend(allProperties.text, {
      fill: '#000000',
      stroke_width: curConfig.text && curConfig.text.stroke_width,
      font_size: curConfig.text && curConfig.text.font_size,
      font_family: curConfig.text && curConfig.text.font_family
    }); // Current shape style properties

    var curShape = allProperties.shape; // Array with all the currently selected elements
    // default size of 1 until it needs to grow bigger

    var selectedElements = [];
    /**
    * @typedef {PlainObject} module:svgcanvas.SVGAsJSON
    * @property {string} element
    * @property {PlainObject<string, string>} attr
    * @property {module:svgcanvas.SVGAsJSON[]} children
    */

    /**
    * @function module:svgcanvas.SvgCanvas#getContentElem
    * @param {Text|Element} data
    * @returns {module:svgcanvas.SVGAsJSON}
    */

    var getJsonFromSvgElement = this.getJsonFromSvgElement = function (data) {
      // Text node
      if (data.nodeType === 3) return data.nodeValue;
      var retval = {
        element: data.tagName,
        // namespace: nsMap[data.namespaceURI],
        attr: {},
        children: []
      }; // Iterate attributes

      for (var i = 0, attr; attr = data.attributes[i]; i++) {
        retval.attr[attr.name] = attr.value;
      } // Iterate children


      for (var _i = 0, node; node = data.childNodes[_i]; _i++) {
        retval.children[_i] = getJsonFromSvgElement(node);
      }

      return retval;
    };
    /**
    * This should really be an intersection implementing all rather than a union.
    * @name module:svgcanvas.SvgCanvas#addSVGElementFromJson
    * @type {module:utilities.EditorContext#addSVGElementFromJson|module:path.EditorContext#addSVGElementFromJson}
    */


    var addSVGElementFromJson = this.addSVGElementFromJson = function (data) {
      if (typeof data === 'string') return svgdoc.createTextNode(data);
      var shape = getElem(data.attr.id); // if shape is a path but we need to create a rect/ellipse, then remove the path

      var currentLayer = getCurrentDrawing().getCurrentLayer();

      if (shape && data.element !== shape.tagName) {
        shape.remove();
        shape = null;
      }

      if (!shape) {
        var ns = data.namespace || NS.SVG;
        shape = svgdoc.createElementNS(ns, data.element);

        if (currentLayer) {
          (currentGroup || currentLayer).append(shape);
        }
      }

      if (data.curStyles) {
        assignAttributes(shape, {
          fill: curShape.fill,
          stroke: curShape.stroke,
          'stroke-width': curShape.stroke_width,
          'stroke-dasharray': curShape.stroke_dasharray,
          'stroke-linejoin': curShape.stroke_linejoin,
          'stroke-linecap': curShape.stroke_linecap,
          'stroke-opacity': curShape.stroke_opacity,
          'fill-opacity': curShape.fill_opacity,
          opacity: curShape.opacity / 2,
          style: 'pointer-events:inherit'
        });
      }

      assignAttributes(shape, data.attr);
      cleanupElement(shape); // Children

      if (data.children) {
        data.children.forEach(function (child) {
          shape.append(addSVGElementFromJson(child));
        });
      }

      return shape;
    };

    canvas.getTransformList = getTransformList;
    canvas.matrixMultiply = matrixMultiply;
    canvas.hasMatrixTransform = hasMatrixTransform;
    canvas.transformListToTransform = transformListToTransform;
    /**
    * @type {module:utilities.EditorContext#getBaseUnit}
    */

    var getBaseUnit = function getBaseUnit() {
      return curConfig.baseUnit;
    };
    /**
    * initialize from units.js.
    * Send in an object implementing the ElementContainer interface (see units.js)
    */


    init(
    /**
    * @implements {module:units.ElementContainer}
    */
    {
      getBaseUnit: getBaseUnit,
      getElement: getElem,
      getHeight: function getHeight() {
        return svgcontent.getAttribute('height') / currentZoom;
      },
      getWidth: function getWidth() {
        return svgcontent.getAttribute('width') / currentZoom;
      },
      getRoundDigits: function getRoundDigits() {
        return saveOptions.round_digits;
      }
    });
    canvas.convertToNum = convertToNum;
    /**
    * This should really be an intersection implementing all rather than a union.
    * @type {module:draw.DrawCanvasInit#getSVGContent|module:utilities.EditorContext#getSVGContent}
    */

    var getSVGContent = function getSVGContent() {
      return svgcontent;
    };
    /**
    * Should really be an intersection with all needing to apply rather than a union.
    * @name module:svgcanvas.SvgCanvas#getSelectedElements
    * @type {module:utilities.EditorContext#getSelectedElements|module:draw.DrawCanvasInit#getSelectedElements|module:path.EditorContext#getSelectedElements}
    */


    var getSelectedElements = this.getSelectedElems = function () {
      return selectedElements;
    };

    var pathActions$1 = pathActions;
    /**
    * This should actually be an intersection as all interfaces should be met.
    * @type {module:utilities.EditorContext#getSVGRoot|module:recalculate.EditorContext#getSVGRoot|module:coords.EditorContext#getSVGRoot|module:path.EditorContext#getSVGRoot}
    */

    var getSVGRoot = function getSVGRoot() {
      return svgroot;
    };

    init$2(
    /**
    * @implements {module:utilities.EditorContext}
    */
    {
      pathActions: pathActions$1,
      // Ok since not modifying
      getSVGContent: getSVGContent,
      addSVGElementFromJson: addSVGElementFromJson,
      getSelectedElements: getSelectedElements,
      getDOMDocument: function getDOMDocument() {
        return svgdoc;
      },
      getDOMContainer: function getDOMContainer() {
        return container;
      },
      getSVGRoot: getSVGRoot,
      // TODO: replace this mostly with a way to get the current drawing.
      getBaseUnit: getBaseUnit,
      getSnappingStep: function getSnappingStep() {
        return curConfig.snappingStep;
      }
    });
    canvas.findDefs = findDefs;
    canvas.getUrlFromAttr = getUrlFromAttr;
    canvas.getHref = getHref;
    canvas.setHref = setHref;
    /* const getBBox = */

    canvas.getBBox = getBBox;
    canvas.getRotationAngle = getRotationAngle;
    canvas.getElem = getElem;
    canvas.getRefElem = getRefElem;
    canvas.assignAttributes = assignAttributes;
    this.cleanupElement = cleanupElement;
    /**
    * This should actually be an intersection not a union as all should apply.
    * @type {module:coords.EditorContext#getGridSnapping|module:path.EditorContext#getGridSnapping}
    */

    var getGridSnapping = function getGridSnapping() {
      return curConfig.gridSnapping;
    };

    init$4(
    /**
    * @implements {module:coords.EditorContext}
    */
    {
      getDrawing: function getDrawing() {
        return getCurrentDrawing();
      },
      getSVGRoot: getSVGRoot,
      getGridSnapping: getGridSnapping
    });
    this.remapElement = remapElement;
    init$5(
    /**
    * @implements {module:recalculate.EditorContext}
    */
    {
      getSVGRoot: getSVGRoot,
      getStartTransform: function getStartTransform() {
        return startTransform;
      },
      setStartTransform: function setStartTransform(transform) {
        startTransform = transform;
      }
    });
    this.recalculateDimensions = recalculateDimensions; // import from sanitize.js

    var nsMap = getReverseNS();
    canvas.sanitizeSvg = sanitizeSvg;
    /**
    * @name undoMgr
    * @memberof module:svgcanvas.SvgCanvas#
    * @type {module:history.HistoryEventHandler}
    */

    var undoMgr = canvas.undoMgr = new UndoManager$1({
      /**
       * @param {string} eventType One of the HistoryEvent types
       * @param {module:history.HistoryCommand} cmd Fulfills the HistoryCommand interface
       * @fires module:svgcanvas.SvgCanvas#event:changed
       * @returns {void}
       */
      handleHistoryEvent: function handleHistoryEvent(eventType, cmd) {
        var EventTypes = HistoryEventTypes$1; // TODO: handle setBlurOffsets.

        if (eventType === EventTypes.BEFORE_UNAPPLY || eventType === EventTypes.BEFORE_APPLY) {
          canvas.clearSelection();
        } else if (eventType === EventTypes.AFTER_APPLY || eventType === EventTypes.AFTER_UNAPPLY) {
          var elems = cmd.elements();
          canvas.pathActions.clear();
          call('changed', elems);
          var cmdType = cmd.type();
          var isApply = eventType === EventTypes.AFTER_APPLY;

          if (cmdType === MoveElementCommand$1.type()) {
            var parent = isApply ? cmd.newParent : cmd.oldParent;

            if (parent === svgcontent) {
              identifyLayers();
            }
          } else if (cmdType === InsertElementCommand$1.type() || cmdType === RemoveElementCommand$1.type()) {
            if (cmd.parent === svgcontent) {
              identifyLayers();
            }

            if (cmdType === InsertElementCommand$1.type()) {
              if (isApply) {
                restoreRefElems(cmd.elem);
              }
            } else if (!isApply) {
              restoreRefElems(cmd.elem);
            }

            if (cmd.elem.tagName === 'use') {
              setUseData(cmd.elem);
            }
          } else if (cmdType === ChangeElementCommand$1.type()) {
            // if we are changing layer names, re-identify all layers
            if (cmd.elem.tagName === 'title' && cmd.elem.parentNode.parentNode === svgcontent) {
              identifyLayers();
            }

            var values = isApply ? cmd.newValues : cmd.oldValues; // If stdDeviation was changed, update the blur.

            if (values.stdDeviation) {
              canvas.setBlurOffsets(cmd.elem.parentNode, values.stdDeviation);
            } // This is resolved in later versions of webkit, perhaps we should
            // have a featured detection for correct 'use' behavior?
            // ——————————
            // Remove & Re-add hack for Webkit (issue 775)
            // if (cmd.elem.tagName === 'use' && isWebkit()) {
            //  const {elem} = cmd;
            //  if (!elem.getAttribute('x') && !elem.getAttribute('y')) {
            //    const parent = elem.parentNode;
            //    const sib = elem.nextSibling;
            //    elem.remove();
            //    parent.insertBefore(elem, sib);
            //    // Ok to replace above with this? `sib.before(elem);`
            //  }
            // }

          }
        }
      }
    });
    /**
    * This should really be an intersection applying to all types rather than a union.
    * @name module:svgcanvas~addCommandToHistory
    * @type {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory}
    */

    var addCommandToHistory = function addCommandToHistory(cmd) {
      canvas.undoMgr.addCommandToHistory(cmd);
    };
    /**
    * This should really be an intersection applying to all types rather than a union.
    * @name module:svgcanvas.SvgCanvas#getZoom
    * @type {module:path.EditorContext#getCurrentZoom|module:select.SVGFactory#getCurrentZoom}
    */


    var getCurrentZoom = this.getZoom = function () {
      return currentZoom;
    };
    /**
    * This method rounds the incoming value to the nearest value based on the `currentZoom`
    * @name module:svgcanvas.SvgCanvas#round
    * @type {module:path.EditorContext#round}
    */


    var round = this.round = function (val) {
      return parseInt(val * currentZoom) / currentZoom;
    };

    init$6(curConfig,
    /**
    * Export to select.js
    * @implements {module:select.SVGFactory}
    */
    {
      createSVGElement: function createSVGElement(jsonMap) {
        return canvas.addSVGElementFromJson(jsonMap);
      },
      svgRoot: function svgRoot() {
        return svgroot;
      },
      svgContent: function svgContent() {
        return svgcontent;
      },
      getCurrentZoom: getCurrentZoom
    });
    /**
    * This object manages selectors for us
    * @name module:svgcanvas.SvgCanvas#selectorManager
    * @type {module:select.SelectorManager}
    */

    var selectorManager = this.selectorManager = getSelectorManager();
    /**
    * @name module:svgcanvas.SvgCanvas#getNextId
    * @type {module:path.EditorContext#getNextId}
    */

    var getNextId = canvas.getNextId = function () {
      return getCurrentDrawing().getNextId();
    };
    /**
    * @name module:svgcanvas.SvgCanvas#getId
    * @type {module:path.EditorContext#getId}
    */


    var getId = canvas.getId = function () {
      return getCurrentDrawing().getId();
    };
    /**
    * The "implements" should really be an intersection applying to all types rather than a union.
    * @name module:svgcanvas.SvgCanvas#call
    * @type {module:draw.DrawCanvasInit#call|module:path.EditorContext#call}
    */


    var call = function call(ev, arg) {
      if (events[ev]) {
        return events[ev](window, arg);
      }

      return undefined;
    };
    /**
    * Clears the selection. The 'selected' handler is then optionally called.
    * This should really be an intersection applying to all types rather than a union.
    * @name module:svgcanvas.SvgCanvas#clearSelection
    * @type {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
    * @fires module:svgcanvas.SvgCanvas#event:selected
    */


    var clearSelection = this.clearSelection = function (noCall) {
      selectedElements.forEach(function (elem) {
        if (isNullish(elem)) {
          return;
        }

        selectorManager.releaseSelector(elem);
      });
      selectedElements = [];

      if (!noCall) {
        call('selected', selectedElements);
      }
    };
    /**
    * Adds a list of elements to the selection. The 'selected' handler is then called.
    * @name module:svgcanvas.SvgCanvas#addToSelection
    * @type {module:path.EditorContext#addToSelection}
    * @fires module:svgcanvas.SvgCanvas#event:selected
    */


    var addToSelection = this.addToSelection = function (elemsToAdd, showGrips) {
      if (!elemsToAdd.length) {
        return;
      } // find the first null in our selectedElements array


      var j = 0;

      while (j < selectedElements.length) {
        if (isNullish(selectedElements[j])) {
          break;
        }

        ++j;
      } // now add each element consecutively


      var i = elemsToAdd.length;

      while (i--) {
        var elem = elemsToAdd[i];

        if (!elem) {
          continue;
        }

        var bbox = getBBox(elem);

        if (!bbox) {
          continue;
        }

        if (elem.tagName === 'a' && elem.childNodes.length === 1) {
          // Make "a" element's child be the selected element
          elem = elem.firstChild;
        } // if it's not already there, add it


        if (!selectedElements.includes(elem)) {
          selectedElements[j] = elem; // only the first selectedBBoxes element is ever used in the codebase these days
          // if (j === 0) selectedBBoxes[0] = utilsGetBBox(elem);

          j++;
          var sel = selectorManager.requestSelector(elem, bbox);

          if (selectedElements.length > 1) {
            sel.showGrips(false);
          }
        }
      }

      call('selected', selectedElements);

      if (showGrips || selectedElements.length === 1) {
        selectorManager.requestSelector(selectedElements[0]).showGrips(true);
      } else {
        selectorManager.requestSelector(selectedElements[0]).showGrips(false);
      } // make sure the elements are in the correct order
      // See: https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition


      selectedElements.sort(function (a, b) {
        if (a && b && a.compareDocumentPosition) {
          return 3 - (b.compareDocumentPosition(a) & 6); // eslint-disable-line no-bitwise
        }

        if (isNullish(a)) {
          return 1;
        }

        return 0;
      }); // Make sure first elements are not null

      while (isNullish(selectedElements[0])) {
        selectedElements.shift(0);
      }
    };
    /**
    * @type {module:path.EditorContext#getOpacity}
    */


    var getOpacity = function getOpacity() {
      return curShape.opacity;
    };
    /**
    * @name module:svgcanvas.SvgCanvas#getMouseTarget
    * @type {module:path.EditorContext#getMouseTarget}
    */


    var getMouseTarget = this.getMouseTarget = function (evt) {
      if (isNullish(evt)) {
        return null;
      }

      var mouseTarget = evt.target; // if it was a <use>, Opera and WebKit return the SVGElementInstance

      if (mouseTarget.correspondingUseElement) {
        mouseTarget = mouseTarget.correspondingUseElement;
      } // for foreign content, go up until we find the foreignObject
      // WebKit browsers set the mouse target to the svgcanvas div


      if ([NS.MATH, NS.HTML].includes(mouseTarget.namespaceURI) && mouseTarget.id !== 'svgcanvas') {
        while (mouseTarget.nodeName !== 'foreignObject') {
          mouseTarget = mouseTarget.parentNode;

          if (!mouseTarget) {
            return svgroot;
          }
        }
      } // Get the desired mouseTarget with jQuery selector-fu
      // If it's root-like, select the root


      var currentLayer = getCurrentDrawing().getCurrentLayer();

      if ([svgroot, container, svgcontent, currentLayer].includes(mouseTarget)) {
        return svgroot;
      }

      var $target = $$8(mouseTarget); // If it's a selection grip, return the grip parent

      if ($target.closest('#selectorParentGroup').length) {
        // While we could instead have just returned mouseTarget,
        // this makes it easier to indentify as being a selector grip
        return selectorManager.selectorParentGroup;
      }

      while (mouseTarget.parentNode !== (currentGroup || currentLayer)) {
        mouseTarget = mouseTarget.parentNode;
      } //
      // // go up until we hit a child of a layer
      // while (mouseTarget.parentNode.parentNode.tagName == 'g') {
      //   mouseTarget = mouseTarget.parentNode;
      // }
      // Webkit bubbles the mouse event all the way up to the div, so we
      // set the mouseTarget to the svgroot like the other browsers
      // if (mouseTarget.nodeName.toLowerCase() == 'div') {
      //   mouseTarget = svgroot;
      // }


      return mouseTarget;
    };
    /**
    * @namespace {module:path.pathActions} pathActions
    * @memberof module:svgcanvas.SvgCanvas#
    * @see module:path.pathActions
    */


    canvas.pathActions = pathActions$1;
    /**
    * @type {module:path.EditorContext#resetD}
    */

    function resetD(p) {
      p.setAttribute('d', pathActions$1.convertPath(p));
    }

    init$1(
    /**
    * @implements {module:path.EditorContext}
    */
    {
      selectorManager: selectorManager,
      // Ok since not changing
      canvas: canvas,
      // Ok since not changing
      call: call,
      resetD: resetD,
      round: round,
      clearSelection: clearSelection,
      addToSelection: addToSelection,
      addCommandToHistory: addCommandToHistory,
      remapElement: remapElement,
      addSVGElementFromJson: addSVGElementFromJson,
      getGridSnapping: getGridSnapping,
      getOpacity: getOpacity,
      getSelectedElements: getSelectedElements,
      getContainer: function getContainer() {
        return container;
      },
      setStarted: function setStarted(s) {
        started = s;
      },
      getRubberBox: function getRubberBox() {
        return rubberBox;
      },
      setRubberBox: function setRubberBox(rb) {
        rubberBox = rb;
        return rubberBox;
      },

      /**
       * @param {PlainObject} ptsInfo
       * @param {boolean} ptsInfo.closedSubpath
       * @param {SVGCircleElement[]} ptsInfo.grips
       * @fires module:svgcanvas.SvgCanvas#event:pointsAdded
       * @fires module:svgcanvas.SvgCanvas#event:selected
       * @returns {void}
       */
      addPtsToSelection: function addPtsToSelection(_ref) {
        var closedSubpath = _ref.closedSubpath,
            grips = _ref.grips;
        // TODO: Correct this:
        pathActions$1.canDeleteNodes = true;
        pathActions$1.closed_subpath = closedSubpath;
        call('pointsAdded', {
          closedSubpath: closedSubpath,
          grips: grips
        });
        call('selected', grips);
      },

      /**
       * @param {PlainObject} changes
       * @param {ChangeElementCommand} changes.cmd
       * @param {SVGPathElement} changes.elem
       * @fires module:svgcanvas.SvgCanvas#event:changed
       * @returns {void}
       */
      endChanges: function endChanges(_ref2) {
        var cmd = _ref2.cmd,
            elem = _ref2.elem;
        addCommandToHistory(cmd);
        call('changed', [elem]);
      },
      getCurrentZoom: getCurrentZoom,
      getId: getId,
      getNextId: getNextId,
      getMouseTarget: getMouseTarget,
      getCurrentMode: function getCurrentMode() {
        return currentMode;
      },
      setCurrentMode: function setCurrentMode(cm) {
        currentMode = cm;
        return currentMode;
      },
      getDrawnPath: function getDrawnPath() {
        return drawnPath;
      },
      setDrawnPath: function setDrawnPath(dp) {
        drawnPath = dp;
        return drawnPath;
      },
      getSVGRoot: getSVGRoot
    }); // Interface strings, usually for title elements

    var uiStrings = {};
    var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
    var refAttrs = ['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'];
    var elData = $$8.data; // Animation element to change the opacity of any newly created element

    var opacAni = document.createElementNS(NS.SVG, 'animate');
    $$8(opacAni).attr({
      attributeName: 'opacity',
      begin: 'indefinite',
      dur: 1,
      fill: 'freeze'
    }).appendTo(svgroot);

    var restoreRefElems = function restoreRefElems(elem) {
      // Look for missing reference elements, restore any found
      var attrs = $$8(elem).attr(refAttrs);
      Object.values(attrs).forEach(function (val) {
        if (val && val.startsWith('url(')) {
          var id = getUrlFromAttr(val).substr(1);
          var ref = getElem(id);

          if (!ref) {
            findDefs().append(removedElements[id]);
            delete removedElements[id];
          }
        }
      });
      var childs = elem.getElementsByTagName('*');

      if (childs.length) {
        for (var i = 0, l = childs.length; i < l; i++) {
          restoreRefElems(childs[i]);
        }
      }
    }; // (function () {
    // TODO For Issue 208: this is a start on a thumbnail
    //  const svgthumb = svgdoc.createElementNS(NS.SVG, 'use');
    //  svgthumb.setAttribute('width', '100');
    //  svgthumb.setAttribute('height', '100');
    //  setHref(svgthumb, '#svgcontent');
    //  svgroot.append(svgthumb);
    // }());

    /**
     * @typedef {PlainObject} module:svgcanvas.SaveOptions
     * @property {boolean} apply
     * @property {"embed"} [image]
     * @property {Integer} round_digits
     */
    // Object to contain image data for raster images that were found encodable


    var encodableImages = {},
        // Object with save options

    /**
     * @type {module:svgcanvas.SaveOptions}
     */
    saveOptions = {
      round_digits: 5
    },
        // Object with IDs for imported files, to see if one was already added
    importIds = {},
        // Current text style properties
    curText = allProperties.text,
        // Object to contain all included extensions
    extensions = {},
        // Map of deleted reference elements
    removedElements = {};
    var // String with image URL of last loadable image
    lastGoodImgUrl = curConfig.imgPath + 'logo.png',
        // Boolean indicating whether or not a draw action has been started
    started = false,
        // String with an element's initial transform attribute value
    startTransform = null,
        // String indicating the current editor mode
    currentMode = 'select',
        // String with the current direction in which an element is being resized
    currentResizeMode = 'none',
        // Current general properties
    curProperties = curShape,
        // Array with selected elements' Bounding box object
    // selectedBBoxes = new Array(1),
    // The DOM element that was just selected
    justSelected = null,
        // DOM element for selection rectangle drawn by the user
    rubberBox = null,
        // Array of current BBoxes, used in getIntersectionList().
    curBBoxes = [],
        // Canvas point for the most recent right click
    lastClickPoint = null;

    this.runExtension = function (name, action, vars) {
      return this.runExtensions(action, vars, false, function (n) {
        return n === name;
      });
    };
    /**
    * @typedef {module:svgcanvas.ExtensionMouseDownStatus|module:svgcanvas.ExtensionMouseUpStatus|module:svgcanvas.ExtensionIDsUpdatedStatus|module:locale.ExtensionLocaleData[]|void} module:svgcanvas.ExtensionStatus
    * @tutorial ExtensionDocs
    */

    /**
    * @callback module:svgcanvas.ExtensionVarBuilder
    * @param {string} name The name of the extension
    * @returns {module:svgcanvas.SvgCanvas#event:ext_addLangData}
    */

    /**
    * @callback module:svgcanvas.ExtensionNameFilter
    * @param {string} name
    * @returns {boolean}
    */

    /**
    * @todo Consider: Should this return an array by default, so extension results aren't overwritten?
    * @todo Would be easier to document if passing in object with key of action and vars as value; could then define an interface which tied both together
    * @function module:svgcanvas.SvgCanvas#runExtensions
    * @param {"mouseDown"|"mouseMove"|"mouseUp"|"zoomChanged"|"IDsUpdated"|"canvasUpdated"|"toolButtonStateUpdate"|"selectedChanged"|"elementTransition"|"elementChanged"|"langReady"|"langChanged"|"addLangData"|"onNewDocument"|"workareaResized"} action
    * @param {module:svgcanvas.SvgCanvas#event:ext_mouseDown|module:svgcanvas.SvgCanvas#event:ext_mouseMove|module:svgcanvas.SvgCanvas#event:ext_mouseUp|module:svgcanvas.SvgCanvas#event:ext_zoomChanged|module:svgcanvas.SvgCanvas#event:ext_IDsUpdated|module:svgcanvas.SvgCanvas#event:ext_canvasUpdated|module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate|module:svgcanvas.SvgCanvas#event:ext_selectedChanged|module:svgcanvas.SvgCanvas#event:ext_elementTransition|module:svgcanvas.SvgCanvas#event:ext_elementChanged|module:svgcanvas.SvgCanvas#event:ext_langReady|module:svgcanvas.SvgCanvas#event:ext_langChanged|module:svgcanvas.SvgCanvas#event:ext_addLangData|module:svgcanvas.SvgCanvas#event:ext_onNewDocument|module:svgcanvas.SvgCanvas#event:ext_workareaResized|module:svgcanvas.ExtensionVarBuilder} [vars]
    * @param {boolean} [returnArray]
    * @param {module:svgcanvas.ExtensionNameFilter} nameFilter
    * @returns {GenericArray<module:svgcanvas.ExtensionStatus>|module:svgcanvas.ExtensionStatus|false} See {@tutorial ExtensionDocs} on the ExtensionStatus.
    */


    var runExtensions = this.runExtensions = function (action, vars, returnArray, nameFilter) {
      var result = returnArray ? [] : false;
      $$8.each(extensions, function (name, ext) {
        if (nameFilter && !nameFilter(name)) {
          return;
        }

        if (ext && action in ext) {
          if (typeof vars === 'function') {
            vars = vars(name); // ext, action
          }

          if (returnArray) {
            result.push(ext[action](vars));
          } else {
            result = ext[action](vars);
          }
        }
      });
      return result;
    };
    /**
    * @typedef {PlainObject} module:svgcanvas.ExtensionMouseDownStatus
    * @property {boolean} started Indicates that creating/editing has started
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.ExtensionMouseUpStatus
    * @property {boolean} keep Indicates if the current element should be kept
    * @property {boolean} started Indicates if editing should still be considered as "started"
    * @property {Element} element The element being affected
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.ExtensionIDsUpdatedStatus
    * @property {string[]} remove Contains string IDs (used by `ext-connector.js`)
    */

    /**
     * @interface module:svgcanvas.ExtensionInitResponse
     * @property {module:SVGEditor.ContextTool[]|PlainObject<string, module:SVGEditor.ContextTool>} [context_tools]
     * @property {module:SVGEditor.Button[]|PlainObject<Integer, module:SVGEditor.Button>} [buttons]
     * @property {string} [svgicons] The location of a local SVG or SVGz file
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#mouseDown
     * @param {module:svgcanvas.SvgCanvas#event:ext_mouseDown} arg
     * @returns {void|module:svgcanvas.ExtensionMouseDownStatus}
     */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#mouseMove
     * @param {module:svgcanvas.SvgCanvas#event:ext_mouseMove} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#mouseUp
     * @param {module:svgcanvas.SvgCanvas#event:ext_mouseUp} arg
     * @returns {module:svgcanvas.ExtensionMouseUpStatus}
     */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#zoomChanged
     * @param {module:svgcanvas.SvgCanvas#event:ext_zoomChanged} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#IDsUpdated
     * @param {module:svgcanvas.SvgCanvas#event:ext_IDsUpdated} arg
     * @returns {module:svgcanvas.ExtensionIDsUpdatedStatus}
     */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#canvasUpdated
     * @param {module:svgcanvas.SvgCanvas#event:ext_canvasUpdated} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#toolButtonStateUpdate
     * @param {module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#selectedChanged
     * @param {module:svgcanvas.SvgCanvas#event:ext_selectedChanged} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#elementTransition
     * @param {module:svgcanvas.SvgCanvas#event:ext_elementTransition} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#elementChanged
     * @param {module:svgcanvas.SvgCanvas#event:ext_elementChanged} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#langReady
     * @param {module:svgcanvas.SvgCanvas#event:ext_langReady} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#langChanged
     * @param {module:svgcanvas.SvgCanvas#event:ext_langChanged} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#addLangData
     * @param {module:svgcanvas.SvgCanvas#event:ext_addLangData} arg
     * @returns {Promise<module:locale.ExtensionLocaleData>} Resolves to {@link module:locale.ExtensionLocaleData}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#onNewDocument
     * @param {module:svgcanvas.SvgCanvas#event:ext_onNewDocument} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#workareaResized
     * @param {module:svgcanvas.SvgCanvas#event:ext_workareaResized} arg
     * @returns {void}
    */

    /**
     * @function module:svgcanvas.ExtensionInitResponse#callback
     * @this module:SVGEditor
     * @param {module:svgcanvas.SvgCanvas#event:ext_callback} arg
     * @returns {void}
    */

    /**
    * @callback module:svgcanvas.ExtensionInitCallback
    * @this module:SVGEditor
    * @param {module:svgcanvas.ExtensionArgumentObject} arg
    * @returns {Promise<module:svgcanvas.ExtensionInitResponse|void>} Resolves to [ExtensionInitResponse]{@link module:svgcanvas.ExtensionInitResponse} or `undefined`
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.ExtensionInitArgs
    * @param {external:jQuery} initArgs.$
    * @param {module:SVGEditor~ImportLocale} initArgs.importLocale
    */

    /**
    * Add an extension to the editor.
    * @function module:svgcanvas.SvgCanvas#addExtension
    * @param {string} name - String with the ID of the extension. Used internally; no need for i18n.
    * @param {module:svgcanvas.ExtensionInitCallback} [extInitFunc] - Function supplied by the extension with its data
    * @param {module:svgcanvas.ExtensionInitArgs} initArgs
    * @fires module:svgcanvas.SvgCanvas#event:extension_added
    * @throws {TypeError|Error} `TypeError` if `extInitFunc` is not a function, `Error`
    *   if extension of supplied name already exists
    * @returns {Promise<void>} Resolves to `undefined`
    */


    this.addExtension =
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(name, extInitFunc, _ref3) {
        var jq, importLocale, argObj, extObj;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                jq = _ref3.$, importLocale = _ref3.importLocale;

                if (!(typeof extInitFunc !== 'function')) {
                  _context.next = 3;
                  break;
                }

                throw new TypeError('Function argument expected for `svgcanvas.addExtension`');

              case 3:
                if (!(name in extensions)) {
                  _context.next = 5;
                  break;
                }

                throw new Error('Cannot add extension "' + name + '", an extension by that name already exists.');

              case 5:
                // Provide private vars/funcs here. Is there a better way to do this?

                /**
                 * @typedef {module:svgcanvas.PrivateMethods} module:svgcanvas.ExtensionArgumentObject
                 * @property {SVGSVGElement} svgroot See {@link module:svgcanvas~svgroot}
                 * @property {SVGSVGElement} svgcontent See {@link module:svgcanvas~svgcontent}
                 * @property {!(string|Integer)} nonce See {@link module:draw.Drawing#getNonce}
                 * @property {module:select.SelectorManager} selectorManager
                 * @property {module:SVGEditor~ImportLocale} importLocale
                 */

                /**
                 * @type {module:svgcanvas.ExtensionArgumentObject}
                 * @see {@link module:svgcanvas.PrivateMethods} source for the other methods/properties
                 */
                argObj = $$8.extend(canvas.getPrivateMethods(), {
                  $: jq,
                  importLocale: importLocale,
                  svgroot: svgroot,
                  svgcontent: svgcontent,
                  nonce: getCurrentDrawing().getNonce(),
                  selectorManager: selectorManager
                });
                _context.next = 8;
                return extInitFunc(argObj);

              case 8:
                extObj = _context.sent;

                if (extObj) {
                  extObj.name = name;
                } // eslint-disable-next-line require-atomic-updates


                extensions[name] = extObj;
                return _context.abrupt("return", call('extension_added', extObj));

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2, _x3) {
        return _ref4.apply(this, arguments);
      };
    }();
    /**
    * This method sends back an array or a NodeList full of elements that
    * intersect the multi-select rubber-band-box on the currentLayer only.
    *
    * We brute-force `getIntersectionList` for browsers that do not support it (Firefox).
    *
    * Reference:
    * Firefox does not implement `getIntersectionList()`, see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=501421}.
    * @function module:svgcanvas.SvgCanvas#getIntersectionList
    * @param {SVGRect} rect
    * @returns {Element[]|NodeList} Bbox elements
    */


    var getIntersectionList = this.getIntersectionList = function (rect) {
      if (isNullish(rubberBox)) {
        return null;
      }

      var parent = currentGroup || getCurrentDrawing().getCurrentLayer();
      var rubberBBox;

      if (!rect) {
        rubberBBox = rubberBox.getBBox();
        var bb = svgcontent.createSVGRect();
        ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'].forEach(function (o) {
          bb[o] = rubberBBox[o] / currentZoom;
        });
        rubberBBox = bb;
      } else {
        rubberBBox = svgcontent.createSVGRect();
        rubberBBox.x = rect.x;
        rubberBBox.y = rect.y;
        rubberBBox.width = rect.width;
        rubberBBox.height = rect.height;
      }

      var resultList = null;

      if (!isIE()) {
        if (typeof svgroot.getIntersectionList === 'function') {
          // Offset the bbox of the rubber box by the offset of the svgcontent element.
          rubberBBox.x += parseInt(svgcontent.getAttribute('x'));
          rubberBBox.y += parseInt(svgcontent.getAttribute('y'));
          resultList = svgroot.getIntersectionList(rubberBBox, parent);
        }
      }

      if (isNullish(resultList) || typeof resultList.item !== 'function') {
        resultList = [];

        if (!curBBoxes.length) {
          // Cache all bboxes
          curBBoxes = getVisibleElementsAndBBoxes(parent);
        }

        var i = curBBoxes.length;

        while (i--) {
          if (!rubberBBox.width) {
            continue;
          }

          if (rectsIntersect(rubberBBox, curBBoxes[i].bbox)) {
            resultList.push(curBBoxes[i].elem);
          }
        }
      } // addToSelection expects an array, but it's ok to pass a NodeList
      // because using square-bracket notation is allowed:
      // https://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html


      return resultList;
    };

    this.getStrokedBBox = getStrokedBBoxDefaultVisible;
    this.getVisibleElements = getVisibleElements;
    /**
    * @typedef {PlainObject} ElementAndBBox
    * @property {Element} elem - The element
    * @property {module:utilities.BBoxObject} bbox - The element's BBox as retrieved from `getStrokedBBoxDefaultVisible`
    */

    /**
    * Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
    * Note that 0-opacity, off-screen etc elements are still considered "visible"
    * for this function.
    * @function module:svgcanvas.SvgCanvas#getVisibleElementsAndBBoxes
    * @param {Element} parent - The parent DOM element to search within
    * @returns {ElementAndBBox[]} An array with objects that include:
    */

    var getVisibleElementsAndBBoxes = this.getVisibleElementsAndBBoxes = function (parent) {
      if (!parent) {
        parent = $$8(svgcontent).children(); // Prevent layers from being included
      }

      var contentElems = [];
      $$8(parent).children().each(function (i, elem) {
        if (elem.getBBox) {
          contentElems.push({
            elem: elem,
            bbox: getStrokedBBoxDefaultVisible([elem])
          });
        }
      });
      return contentElems.reverse();
    };
    /**
    * Wrap an SVG element into a group element, mark the group as 'gsvg'.
    * @function module:svgcanvas.SvgCanvas#groupSvgElem
    * @param {Element} elem - SVG element to wrap
    * @returns {void}
    */


    var groupSvgElem = this.groupSvgElem = function (elem) {
      var g = document.createElementNS(NS.SVG, 'g');
      elem.replaceWith(g);
      $$8(g).append(elem).data('gsvg', elem)[0].id = getNextId();
    }; // Set scope for these functions
    // Object to contain editor event names and callback functions


    var events = {};
    canvas.call = call;
    /**
     * Array of what was changed (elements, layers)
     * @event module:svgcanvas.SvgCanvas#event:changed
     * @type {Element[]}
     */

    /**
     * Array of selected elements
     * @event module:svgcanvas.SvgCanvas#event:selected
     * @type {Element[]}
     */

    /**
     * Array of selected elements
     * @event module:svgcanvas.SvgCanvas#event:transition
     * @type {Element[]}
     */

    /**
     * The Element is always `SVGGElement`?
     * If not `null`, will be the set current group element
     * @event module:svgcanvas.SvgCanvas#event:contextset
     * @type {null|Element}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:pointsAdded
     * @type {PlainObject}
     * @property {boolean} closedSubpath
     * @property {SVGCircleElement[]} grips Grips elements
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:zoomed
     * @type {PlainObject}
     * @property {Float} x
     * @property {Float} y
     * @property {Float} width
     * @property {Float} height
     * @property {0.5|2} factor
     * @see module:SVGEditor.BBoxObjectWithFactor
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:updateCanvas
     * @type {PlainObject}
     * @property {false} center
     * @property {module:math.XYObject} newCtr
     */

    /**
     * @typedef {PlainObject} module:svgcanvas.ExtensionInitResponsePlusName
     * @implements {module:svgcanvas.ExtensionInitResponse}
     * @property {string} name The extension's resolved ID (whether explicit or based on file name)
     */

    /**
     * Generalized extension object response of
     * [`init()`]{@link module:svgcanvas.ExtensionInitCallback}
     * along with the name of the extension.
     * @event module:svgcanvas.SvgCanvas#event:extension_added
     * @type {module:svgcanvas.ExtensionInitResponsePlusName|void}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:extensions_added
     * @type {void}
    */

    /**
     * @typedef {PlainObject} module:svgcanvas.Message
     * @property {any} data The data
     * @property {string} origin The origin
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:message
     * @type {module:svgcanvas.Message}
     */

    /**
     * SVG canvas converted to string
     * @event module:svgcanvas.SvgCanvas#event:saved
     * @type {string}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:setnonce
     * @type {!(string|Integer)}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:unsetnonce
     * @type {void}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:zoomDone
     * @type {void}
    */

    /**
     * @event module:svgcanvas.SvgCanvas#event:cleared
     * @type {void}
    */

    /**
     * @event module:svgcanvas.SvgCanvas#event:exported
     * @type {module:svgcanvas.ImageExportedResults}
     */

    /**
     * @event module:svgcanvas.SvgCanvas#event:exportedPDF
     * @type {module:svgcanvas.PDFExportedResults}
     */

    /**
     * Creating a cover-all class until {@link https://github.com/jsdoc3/jsdoc/issues/1545} may be supported.
     * `undefined` may be returned by {@link module:svgcanvas.SvgCanvas#event:extension_added} if the extension's `init` returns `undefined` It is also the type for the following events "zoomDone", "unsetnonce", "cleared", and "extensions_added".
     * @event module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
     * @type {module:svgcanvas.SvgCanvas#event:selected|module:svgcanvas.SvgCanvas#event:changed|module:svgcanvas.SvgCanvas#event:contextset|module:svgcanvas.SvgCanvas#event:pointsAdded|module:svgcanvas.SvgCanvas#event:extension_added|module:svgcanvas.SvgCanvas#event:extensions_added|module:svgcanvas.SvgCanvas#event:message|module:svgcanvas.SvgCanvas#event:transition|module:svgcanvas.SvgCanvas#event:zoomed|module:svgcanvas.SvgCanvas#event:updateCanvas|module:svgcanvas.SvgCanvas#event:saved|module:svgcanvas.SvgCanvas#event:exported|module:svgcanvas.SvgCanvas#event:exportedPDF|module:svgcanvas.SvgCanvas#event:setnonce|module:svgcanvas.SvgCanvas#event:unsetnonce|void}
     */

    /**
     * The promise return, if present, resolves to `undefined`
     *  (`extension_added`, `exported`, `saved`)
     * @typedef {Promise<void>|void} module:svgcanvas.EventHandlerReturn
    */

    /**
    * @callback module:svgcanvas.EventHandler
    * @param {external:Window} win
    * @param {module:svgcanvas.SvgCanvas#event:GenericCanvasEvent} arg
    * @listens module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
    * @returns {module:svgcanvas.EventHandlerReturn}
    */

    /**
    * Attaches a callback function to an event.
    * @function module:svgcanvas.SvgCanvas#bind
    * @param {"changed"|"contextset"|"selected"|"pointsAdded"|"extension_added"|"extensions_added"|"message"|"transition"|"zoomed"|"updateCanvas"|"zoomDone"|"saved"|"exported"|"exportedPDF"|"setnonce"|"unsetnonce"|"cleared"} ev - String indicating the name of the event
    * @param {module:svgcanvas.EventHandler} f - The callback function to bind to the event
    * @returns {module:svgcanvas.EventHandler} The previous event
    */

    canvas.bind = function (ev, f) {
      var old = events[ev];
      events[ev] = f;
      return old;
    };
    /**
    * Runs the SVG Document through the sanitizer and then updates its paths.
    * @function module:svgcanvas.SvgCanvas#prepareSvg
    * @param {XMLDocument} newDoc - The SVG DOM document
    * @returns {void}
    */


    this.prepareSvg = function (newDoc) {
      this.sanitizeSvg(newDoc.documentElement); // convert paths into absolute commands

      var paths = _toConsumableArray(newDoc.getElementsByTagNameNS(NS.SVG, 'path'));

      paths.forEach(function (path) {
        path.setAttribute('d', pathActions$1.convertPath(path));
        pathActions$1.fixEnd(path);
      });
    };
    /**
    * Hack for Firefox bugs where text element features aren't updated or get
    * messed up. See issue 136 and issue 137.
    * This function clones the element and re-selects it.
    * @function module:svgcanvas~ffClone
    * @todo Test for this bug on load and add it to "support" object instead of
    * browser sniffing
    * @param {Element} elem - The (text) DOM element to clone
    * @returns {Element} Cloned element
    */


    var ffClone = function ffClone(elem) {
      if (!isGecko()) {
        return elem;
      }

      var clone = elem.cloneNode(true);
      elem.before(clone);
      elem.remove();
      selectorManager.releaseSelector(elem);
      selectedElements[0] = clone;
      selectorManager.requestSelector(clone).showGrips(true);
      return clone;
    }; // `this.each` is deprecated, if any extension used this it can be recreated by doing this:
    // * @example $(canvas.getRootElem()).children().each(...)
    // * @function module:svgcanvas.SvgCanvas#each
    // this.each = function (cb) {
    //  $(svgroot).children().each(cb);
    // };

    /**
    * Removes any old rotations if present, prepends a new rotation at the
    * transformed center.
    * @function module:svgcanvas.SvgCanvas#setRotationAngle
    * @param {string|Float} val - The new rotation angle in degrees
    * @param {boolean} preventUndo - Indicates whether the action should be undoable or not
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setRotationAngle = function (val, preventUndo) {
      // ensure val is the proper type
      val = parseFloat(val);
      var elem = selectedElements[0];
      var oldTransform = elem.getAttribute('transform');
      var bbox = getBBox(elem);
      var cx = bbox.x + bbox.width / 2,
          cy = bbox.y + bbox.height / 2;
      var tlist = getTransformList(elem); // only remove the real rotational transform if present (i.e. at index=0)

      if (tlist.numberOfItems > 0) {
        var xform = tlist.getItem(0);

        if (xform.type === 4) {
          tlist.removeItem(0);
        }
      } // find Rnc and insert it


      if (val !== 0) {
        var center = transformPoint(cx, cy, transformListToTransform(tlist).matrix);
        var Rnc = svgroot.createSVGTransform();
        Rnc.setRotate(val, center.x, center.y);

        if (tlist.numberOfItems) {
          tlist.insertItemBefore(Rnc, 0);
        } else {
          tlist.appendItem(Rnc);
        }
      } else if (tlist.numberOfItems === 0) {
        elem.removeAttribute('transform');
      }

      if (!preventUndo) {
        // we need to undo it, then redo it so it can be undo-able! :)
        // TODO: figure out how to make changes to transform list undo-able cross-browser?
        var newTransform = elem.getAttribute('transform');
        elem.setAttribute('transform', oldTransform);
        changeSelectedAttribute('transform', newTransform, selectedElements);
        call('changed', selectedElements);
      } // const pointGripContainer = getElem('pathpointgrip_container');
      // if (elem.nodeName === 'path' && pointGripContainer) {
      //   pathActions.setPointContainerTransform(elem.getAttribute('transform'));
      // }


      var selector = selectorManager.requestSelector(selectedElements[0]);
      selector.resize();
      Selector.updateGripCursors(val);
    };
    /**
    * Runs `recalculateDimensions` on the selected elements,
    * adding the changes to a single batch command.
    * @function module:svgcanvas.SvgCanvas#recalculateAllSelectedDimensions
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    var recalculateAllSelectedDimensions = this.recalculateAllSelectedDimensions = function () {
      var text = currentResizeMode === 'none' ? 'position' : 'size';
      var batchCmd = new BatchCommand$1(text);
      var i = selectedElements.length;

      while (i--) {
        var elem = selectedElements[i]; // if (getRotationAngle(elem) && !hasMatrixTransform(getTransformList(elem))) { continue; }

        var cmd = recalculateDimensions(elem);

        if (cmd) {
          batchCmd.addSubCommand(cmd);
        }
      }

      if (!batchCmd.isEmpty()) {
        addCommandToHistory(batchCmd);
        call('changed', selectedElements);
      }
    };
    /**
     * Debug tool to easily see the current matrix in the browser's console.
     * @function module:svgcanvas~logMatrix
     * @param {SVGMatrix} m The matrix
     * @returns {void}
     */


    var logMatrix = function logMatrix(m) {
      console.log([m.a, m.b, m.c, m.d, m.e, m.f]); // eslint-disable-line no-console
    }; // Root Current Transformation Matrix in user units


    var rootSctm = null;
    /**
    * Group: Selection
    */
    // TODO: do we need to worry about selectedBBoxes here?

    /**
    * Selects only the given elements, shortcut for `clearSelection(); addToSelection()`.
    * @function module:svgcanvas.SvgCanvas#selectOnly
    * @param {Element[]} elems - an array of DOM elements to be selected
    * @param {boolean} showGrips - Indicates whether the resize grips should be shown
    * @returns {void}
    */

    var selectOnly = this.selectOnly = function (elems, showGrips) {
      clearSelection(true);
      addToSelection(elems, showGrips);
    }; // TODO: could use slice here to make this faster?
    // TODO: should the 'selected' handler

    /**
    * Removes elements from the selection.
    * @function module:svgcanvas.SvgCanvas#removeFromSelection
    * @param {Element[]} elemsToRemove - An array of elements to remove from selection
    * @returns {void}
    */

    /* const removeFromSelection = */


    this.removeFromSelection = function (elemsToRemove) {
      if (isNullish(selectedElements[0])) {
        return;
      }

      if (!elemsToRemove.length) {
        return;
      } // find every element and remove it from our array copy


      var newSelectedItems = [],
          len = selectedElements.length;

      for (var i = 0; i < len; ++i) {
        var elem = selectedElements[i];

        if (elem) {
          // keep the item
          if (!elemsToRemove.includes(elem)) {
            newSelectedItems.push(elem);
          } else {
            // remove the item and its selector
            selectorManager.releaseSelector(elem);
          }
        }
      } // the copy becomes the master now


      selectedElements = newSelectedItems;
    };
    /**
    * Clears the selection, then adds all elements in the current layer to the selection.
    * @function module:svgcanvas.SvgCanvas#selectAllInCurrentLayer
    * @returns {void}
    */


    this.selectAllInCurrentLayer = function () {
      var currentLayer = getCurrentDrawing().getCurrentLayer();

      if (currentLayer) {
        currentMode = 'select';
        selectOnly($$8(currentGroup || currentLayer).children());
      }
    };

    var drawnPath = null; // Mouse events

    (function () {
      var freehand = {
        minx: null,
        miny: null,
        maxx: null,
        maxy: null
      };
      var THRESHOLD_DIST = 0.8,
          STEP_COUNT = 10;
      var dAttr = null,
          startX = null,
          startY = null,
          rStartX = null,
          rStartY = null,
          initBbox = {},
          sumDistance = 0,
          controllPoint2 = {
        x: 0,
        y: 0
      },
          controllPoint1 = {
        x: 0,
        y: 0
      },
          start = {
        x: 0,
        y: 0
      },
          end = {
        x: 0,
        y: 0
      },
          bSpline = {
        x: 0,
        y: 0
      },
          nextPos = {
        x: 0,
        y: 0
      },
          parameter,
          nextParameter;

      var getBsplinePoint = function getBsplinePoint(t) {
        var spline = {
          x: 0,
          y: 0
        },
            p0 = controllPoint2,
            p1 = controllPoint1,
            p2 = start,
            p3 = end,
            S = 1.0 / 6.0,
            t2 = t * t,
            t3 = t2 * t;
        var m = [[-1, 3, -3, 1], [3, -6, 3, 0], [-3, 0, 3, 0], [1, 4, 1, 0]];
        spline.x = S * ((p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3 + (p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2 + (p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t + (p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3]));
        spline.y = S * ((p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3 + (p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2 + (p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t + (p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3]));
        return {
          x: spline.x,
          y: spline.y
        };
      };
      /**
       * Follows these conditions:
       * - When we are in a create mode, the element is added to the canvas but the
       *   action is not recorded until mousing up.
       * - When we are in select mode, select the element, remember the position
       *   and do nothing else.
       * @param {MouseEvent} evt
       * @fires module:svgcanvas.SvgCanvas#event:ext_mouseDown
       * @returns {void}
       */


      var mouseDown = function mouseDown(evt) {
        if (canvas.spaceKey || evt.button === 1) {
          return;
        }

        var rightClick = evt.button === 2;

        if (evt.altKey) {
          // duplicate when dragging
          canvas.cloneSelectedElements(0, 0);
        }

        rootSctm = $$8('#svgcontent g')[0].getScreenCTM().inverse();
        var pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
            mouseX = pt.x * currentZoom,
            mouseY = pt.y * currentZoom;
        evt.preventDefault();

        if (rightClick) {
          currentMode = 'select';
          lastClickPoint = pt;
        } // This would seem to be unnecessary...
        // if (!['select', 'resize'].includes(currentMode)) {
        //   setGradient();
        // }


        var x = mouseX / currentZoom,
            y = mouseY / currentZoom;
        var mouseTarget = getMouseTarget(evt);

        if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
          mouseTarget = mouseTarget.firstChild;
        } // realX/y ignores grid-snap value


        var realX = x;
        rStartX = startX = x;
        var realY = y;
        rStartY = startY = y;

        if (curConfig.gridSnapping) {
          x = snapToGrid(x);
          y = snapToGrid(y);
          startX = snapToGrid(startX);
          startY = snapToGrid(startY);
        } // if it is a selector grip, then it must be a single element selected,
        // set the mouseTarget to that and update the mode to rotate/resize


        if (mouseTarget === selectorManager.selectorParentGroup && !isNullish(selectedElements[0])) {
          var grip = evt.target;
          var griptype = elData(grip, 'type'); // rotating

          if (griptype === 'rotate') {
            currentMode = 'rotate'; // resizing
          } else if (griptype === 'resize') {
            currentMode = 'resize';
            currentResizeMode = elData(grip, 'dir');
          }

          mouseTarget = selectedElements[0];
        }

        startTransform = mouseTarget.getAttribute('transform');
        var tlist = getTransformList(mouseTarget);

        switch (currentMode) {
          case 'select':
            started = true;
            currentResizeMode = 'none';

            if (rightClick) {
              started = false;
            }

            if (mouseTarget !== svgroot) {
              // if this element is not yet selected, clear selection and select it
              if (!selectedElements.includes(mouseTarget)) {
                // only clear selection if shift is not pressed (otherwise, add
                // element to selection)
                if (!evt.shiftKey) {
                  // No need to do the call here as it will be done on addToSelection
                  clearSelection(true);
                }

                addToSelection([mouseTarget]);
                justSelected = mouseTarget;
                pathActions$1.clear();
              } // else if it's a path, go into pathedit mode in mouseup


              if (!rightClick) {
                // insert a dummy transform so if the element(s) are moved it will have
                // a transform to use for its translate
                for (var _i2 = 0, _selectedElements = selectedElements; _i2 < _selectedElements.length; _i2++) {
                  var selectedElement = _selectedElements[_i2];

                  if (isNullish(selectedElement)) {
                    continue;
                  }

                  var slist = getTransformList(selectedElement);

                  if (slist.numberOfItems) {
                    slist.insertItemBefore(svgroot.createSVGTransform(), 0);
                  } else {
                    slist.appendItem(svgroot.createSVGTransform());
                  }
                }
              }
            } else if (!rightClick) {
              clearSelection();
              currentMode = 'multiselect';

              if (isNullish(rubberBox)) {
                rubberBox = selectorManager.getRubberBandBox();
              }

              rStartX *= currentZoom;
              rStartY *= currentZoom; // console.log('p',[evt.pageX, evt.pageY]);
              // console.log('c',[evt.clientX, evt.clientY]);
              // console.log('o',[evt.offsetX, evt.offsetY]);
              // console.log('s',[startX, startY]);

              assignAttributes(rubberBox, {
                x: rStartX,
                y: rStartY,
                width: 0,
                height: 0,
                display: 'inline'
              });
            }

            break;

          case 'zoom':
            started = true;

            if (isNullish(rubberBox)) {
              rubberBox = selectorManager.getRubberBandBox();
            }

            assignAttributes(rubberBox, {
              x: realX * currentZoom,
              y: realX * currentZoom,
              width: 0,
              height: 0,
              display: 'inline'
            });
            break;

          case 'resize':
            {
              started = true;
              startX = x;
              startY = y; // Getting the BBox from the selection box, since we know we
              // want to orient around it

              initBbox = getBBox($$8('#selectedBox0')[0]);
              var bb = {};
              $$8.each(initBbox, function (key, val) {
                bb[key] = val / currentZoom;
              });
              initBbox = bb; // append three dummy transforms to the tlist so that
              // we can translate,scale,translate in mousemove

              var pos = getRotationAngle(mouseTarget) ? 1 : 0;

              if (hasMatrixTransform(tlist)) {
                tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
                tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
                tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
              } else {
                tlist.appendItem(svgroot.createSVGTransform());
                tlist.appendItem(svgroot.createSVGTransform());
                tlist.appendItem(svgroot.createSVGTransform());

                if (supportsNonScalingStroke()) {
                  // Handle crash for newer Chrome and Safari 6 (Mobile and Desktop):
                  // https://code.google.com/p/svg-edit/issues/detail?id=904
                  // Chromium issue: https://code.google.com/p/chromium/issues/detail?id=114625
                  // TODO: Remove this workaround once vendor fixes the issue
                  var iswebkit = isWebkit();
                  var delayedStroke;

                  if (iswebkit) {
                    delayedStroke = function delayedStroke(ele) {
                      var stroke_ = ele.getAttribute('stroke');
                      ele.removeAttribute('stroke'); // Re-apply stroke after delay. Anything higher than 1 seems to cause flicker

                      if (stroke_ !== null) setTimeout(function () {
                        ele.setAttribute('stroke', stroke_);
                      }, 0);
                    };
                  }

                  mouseTarget.style.vectorEffect = 'non-scaling-stroke';

                  if (iswebkit) {
                    delayedStroke(mouseTarget);
                  }

                  var all = mouseTarget.getElementsByTagName('*'),
                      len = all.length;

                  for (var i = 0; i < len; i++) {
                    if (!all[i].style) {
                      // mathML
                      continue;
                    }

                    all[i].style.vectorEffect = 'non-scaling-stroke';

                    if (iswebkit) {
                      delayedStroke(all[i]);
                    }
                  }
                }
              }

              break;
            }

          case 'fhellipse':
          case 'fhrect':
          case 'fhpath':
            start.x = realX;
            start.y = realY;
            started = true;
            dAttr = realX + ',' + realY + ' '; // Commented out as doing nothing now:
            // strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;

            addSVGElementFromJson({
              element: 'polyline',
              curStyles: true,
              attr: {
                points: dAttr,
                id: getNextId(),
                fill: 'none',
                opacity: curShape.opacity / 2,
                'stroke-linecap': 'round',
                style: 'pointer-events:none'
              }
            });
            freehand.minx = realX;
            freehand.maxx = realX;
            freehand.miny = realY;
            freehand.maxy = realY;
            break;

          case 'image':
            {
              started = true;
              var newImage = addSVGElementFromJson({
                element: 'image',
                attr: {
                  x: x,
                  y: y,
                  width: 0,
                  height: 0,
                  id: getNextId(),
                  opacity: curShape.opacity / 2,
                  style: 'pointer-events:inherit'
                }
              });
              setHref(newImage, lastGoodImgUrl);
              preventClickDefault(newImage);
              break;
            }

          case 'square': // FIXME: once we create the rect, we lose information that this was a square
          // (for resizing purposes this could be important)
          // Fallthrough

          case 'rect':
            started = true;
            startX = x;
            startY = y;
            addSVGElementFromJson({
              element: 'rect',
              curStyles: true,
              attr: {
                x: x,
                y: y,
                width: 0,
                height: 0,
                id: getNextId(),
                opacity: curShape.opacity / 2
              }
            });
            break;

          case 'line':
            {
              started = true;
              var strokeW = Number(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
              addSVGElementFromJson({
                element: 'line',
                curStyles: true,
                attr: {
                  x1: x,
                  y1: y,
                  x2: x,
                  y2: y,
                  id: getNextId(),
                  stroke: curShape.stroke,
                  'stroke-width': strokeW,
                  'stroke-dasharray': curShape.stroke_dasharray,
                  'stroke-linejoin': curShape.stroke_linejoin,
                  'stroke-linecap': curShape.stroke_linecap,
                  'stroke-opacity': curShape.stroke_opacity,
                  fill: 'none',
                  opacity: curShape.opacity / 2,
                  style: 'pointer-events:none'
                }
              });
              break;
            }

          case 'circle':
            started = true;
            addSVGElementFromJson({
              element: 'circle',
              curStyles: true,
              attr: {
                cx: x,
                cy: y,
                r: 0,
                id: getNextId(),
                opacity: curShape.opacity / 2
              }
            });
            break;

          case 'ellipse':
            started = true;
            addSVGElementFromJson({
              element: 'ellipse',
              curStyles: true,
              attr: {
                cx: x,
                cy: y,
                rx: 0,
                ry: 0,
                id: getNextId(),
                opacity: curShape.opacity / 2
              }
            });
            break;

          case 'text':
            started = true;
            /* const newText = */

            addSVGElementFromJson({
              element: 'text',
              curStyles: true,
              attr: {
                x: x,
                y: y,
                id: getNextId(),
                fill: curText.fill,
                'stroke-width': curText.stroke_width,
                'font-size': curText.font_size,
                'font-family': curText.font_family,
                'text-anchor': 'middle',
                'xml:space': 'preserve',
                opacity: curShape.opacity
              }
            }); // newText.textContent = 'text';

            break;

          case 'path': // Fall through

          case 'pathedit':
            startX *= currentZoom;
            startY *= currentZoom;
            pathActions$1.mouseDown(evt, mouseTarget, startX, startY);
            started = true;
            break;

          case 'textedit':
            startX *= currentZoom;
            startY *= currentZoom;
            textActions.mouseDown(evt, mouseTarget, startX, startY);
            started = true;
            break;

          case 'rotate':
            started = true; // we are starting an undoable change (a drag-rotation)

            canvas.undoMgr.beginUndoableChange('transform', selectedElements);
            break;

          default:
            // This could occur in an extension
            break;
        }
        /**
         * The main (left) mouse button is held down on the canvas area
         * @event module:svgcanvas.SvgCanvas#event:ext_mouseDown
         * @type {PlainObject}
         * @property {MouseEvent} event The event object
         * @property {Float} start_x x coordinate on canvas
         * @property {Float} start_y y coordinate on canvas
         * @property {Element[]} selectedElements An array of the selected Elements
        */


        var extResult = runExtensions('mouseDown',
        /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseDown} */
        {
          event: evt,
          start_x: startX,
          start_y: startY,
          selectedElements: selectedElements
        }, true);
        $$8.each(extResult, function (i, r) {
          if (r && r.started) {
            started = true;
          }
        });
      }; // in this function we do not record any state changes yet (but we do update
      // any elements that are still being created, moved or resized on the canvas)

      /**
       *
       * @param {MouseEvent} evt
       * @fires module:svgcanvas.SvgCanvas#event:transition
       * @fires module:svgcanvas.SvgCanvas#event:ext_mouseMove
       * @returns {void}
       */


      var mouseMove = function mouseMove(evt) {
        if (!started) {
          return;
        }

        if (evt.button === 1 || canvas.spaceKey) {
          return;
        }

        var i,
            xya,
            c,
            cx,
            cy,
            dx,
            dy,
            len,
            angle,
            box,
            selected = selectedElements[0];
        var pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
            mouseX = pt.x * currentZoom,
            mouseY = pt.y * currentZoom,
            shape = getElem(getId());
        var realX = mouseX / currentZoom;
        var x = realX;
        var realY = mouseY / currentZoom;
        var y = realY;

        if (curConfig.gridSnapping) {
          x = snapToGrid(x);
          y = snapToGrid(y);
        }

        evt.preventDefault();
        var tlist;

        switch (currentMode) {
          case 'select':
            {
              // we temporarily use a translate on the element(s) being dragged
              // this transform is removed upon mousing up and the element is
              // relocated to the new location
              if (selectedElements[0] !== null) {
                dx = x - startX;
                dy = y - startY;

                if (curConfig.gridSnapping) {
                  dx = snapToGrid(dx);
                  dy = snapToGrid(dy);
                }
                /*
                // Commenting out as currently has no effect
                if (evt.shiftKey) {
                  xya = snapToAngle(startX, startY, x, y);
                  ({x, y} = xya);
                }
                */


                if (dx !== 0 || dy !== 0) {
                  len = selectedElements.length;

                  for (i = 0; i < len; ++i) {
                    selected = selectedElements[i];

                    if (isNullish(selected)) {
                      break;
                    } // if (i === 0) {
                    //   const box = utilsGetBBox(selected);
                    //     selectedBBoxes[i].x = box.x + dx;
                    //     selectedBBoxes[i].y = box.y + dy;
                    // }
                    // update the dummy transform in our transform list
                    // to be a translate


                    var xform = svgroot.createSVGTransform();
                    tlist = getTransformList(selected); // Note that if Webkit and there's no ID for this
                    // element, the dummy transform may have gotten lost.
                    // This results in unexpected behaviour

                    xform.setTranslate(dx, dy);

                    if (tlist.numberOfItems) {
                      tlist.replaceItem(xform, 0);
                    } else {
                      tlist.appendItem(xform);
                    } // update our internal bbox that we're tracking while dragging


                    selectorManager.requestSelector(selected).resize();
                  }

                  call('transition', selectedElements);
                }
              }

              break;
            }

          case 'multiselect':
            {
              realX *= currentZoom;
              realY *= currentZoom;
              assignAttributes(rubberBox, {
                x: Math.min(rStartX, realX),
                y: Math.min(rStartY, realY),
                width: Math.abs(realX - rStartX),
                height: Math.abs(realY - rStartY)
              }); // for each selected:
              // - if newList contains selected, do nothing
              // - if newList doesn't contain selected, remove it from selected
              // - for any newList that was not in selectedElements, add it to selected

              var elemsToRemove = selectedElements.slice(),
                  elemsToAdd = [],
                  newList = getIntersectionList(); // For every element in the intersection, add if not present in selectedElements.

              len = newList.length;

              for (i = 0; i < len; ++i) {
                var intElem = newList[i]; // Found an element that was not selected before, so we should add it.

                if (!selectedElements.includes(intElem)) {
                  elemsToAdd.push(intElem);
                } // Found an element that was already selected, so we shouldn't remove it.


                var foundInd = elemsToRemove.indexOf(intElem);

                if (foundInd !== -1) {
                  elemsToRemove.splice(foundInd, 1);
                }
              }

              if (elemsToRemove.length > 0) {
                canvas.removeFromSelection(elemsToRemove);
              }

              if (elemsToAdd.length > 0) {
                canvas.addToSelection(elemsToAdd);
              }

              break;
            }

          case 'resize':
            {
              // we track the resize bounding box and translate/scale the selected element
              // while the mouse is down, when mouse goes up, we use this to recalculate
              // the shape's coordinates
              tlist = getTransformList(selected);
              var hasMatrix = hasMatrixTransform(tlist);
              box = hasMatrix ? initBbox : getBBox(selected);
              var left = box.x,
                  top = box.y,
                  _box = box,
                  width = _box.width,
                  height = _box.height;
              dx = x - startX;
              dy = y - startY;

              if (curConfig.gridSnapping) {
                dx = snapToGrid(dx);
                dy = snapToGrid(dy);
                height = snapToGrid(height);
                width = snapToGrid(width);
              } // if rotated, adjust the dx,dy values


              angle = getRotationAngle(selected);

              if (angle) {
                var r = Math.sqrt(dx * dx + dy * dy),
                    theta = Math.atan2(dy, dx) - angle * Math.PI / 180.0;
                dx = r * Math.cos(theta);
                dy = r * Math.sin(theta);
              } // if not stretching in y direction, set dy to 0
              // if not stretching in x direction, set dx to 0


              if (!currentResizeMode.includes('n') && !currentResizeMode.includes('s')) {
                dy = 0;
              }

              if (!currentResizeMode.includes('e') && !currentResizeMode.includes('w')) {
                dx = 0;
              }

              var // ts = null,
              tx = 0,
                  ty = 0,
                  sy = height ? (height + dy) / height : 1,
                  sx = width ? (width + dx) / width : 1; // if we are dragging on the north side, then adjust the scale factor and ty

              if (currentResizeMode.includes('n')) {
                sy = height ? (height - dy) / height : 1;
                ty = height;
              } // if we dragging on the east side, then adjust the scale factor and tx


              if (currentResizeMode.includes('w')) {
                sx = width ? (width - dx) / width : 1;
                tx = width;
              } // update the transform list with translate,scale,translate


              var translateOrigin = svgroot.createSVGTransform(),
                  scale = svgroot.createSVGTransform(),
                  translateBack = svgroot.createSVGTransform();

              if (curConfig.gridSnapping) {
                left = snapToGrid(left);
                tx = snapToGrid(tx);
                top = snapToGrid(top);
                ty = snapToGrid(ty);
              }

              translateOrigin.setTranslate(-(left + tx), -(top + ty));

              if (evt.shiftKey) {
                if (sx === 1) {
                  sx = sy;
                } else {
                  sy = sx;
                }
              }

              scale.setScale(sx, sy);
              translateBack.setTranslate(left + tx, top + ty);

              if (hasMatrix) {
                var diff = angle ? 1 : 0;
                tlist.replaceItem(translateOrigin, 2 + diff);
                tlist.replaceItem(scale, 1 + diff);
                tlist.replaceItem(translateBack, Number(diff));
              } else {
                var N = tlist.numberOfItems;
                tlist.replaceItem(translateBack, N - 3);
                tlist.replaceItem(scale, N - 2);
                tlist.replaceItem(translateOrigin, N - 1);
              }

              selectorManager.requestSelector(selected).resize();
              call('transition', selectedElements);
              break;
            }

          case 'zoom':
            {
              realX *= currentZoom;
              realY *= currentZoom;
              assignAttributes(rubberBox, {
                x: Math.min(rStartX * currentZoom, realX),
                y: Math.min(rStartY * currentZoom, realY),
                width: Math.abs(realX - rStartX * currentZoom),
                height: Math.abs(realY - rStartY * currentZoom)
              });
              break;
            }

          case 'text':
            {
              assignAttributes(shape, {
                x: x,
                y: y
              });
              break;
            }

          case 'line':
            {
              if (curConfig.gridSnapping) {
                x = snapToGrid(x);
                y = snapToGrid(y);
              }

              var x2 = x;
              var y2 = y;

              if (evt.shiftKey) {
                xya = snapToAngle(startX, startY, x2, y2);
                x2 = xya.x;
                y2 = xya.y;
              }

              shape.setAttribute('x2', x2);
              shape.setAttribute('y2', y2);
              break;
            }

          case 'foreignObject': // fall through

          case 'square': // fall through

          case 'rect': // fall through

          case 'image':
            {
              var square = currentMode === 'square' || evt.shiftKey;
              var w = Math.abs(x - startX),
                  h = Math.abs(y - startY);
              var newX, newY;

              if (square) {
                w = h = Math.max(w, h);
                newX = startX < x ? startX : startX - w;
                newY = startY < y ? startY : startY - h;
              } else {
                newX = Math.min(startX, x);
                newY = Math.min(startY, y);
              }

              if (curConfig.gridSnapping) {
                w = snapToGrid(w);
                h = snapToGrid(h);
                newX = snapToGrid(newX);
                newY = snapToGrid(newY);
              }

              assignAttributes(shape, {
                width: w,
                height: h,
                x: newX,
                y: newY
              });
              break;
            }

          case 'circle':
            {
              c = $$8(shape).attr(['cx', 'cy']);
              var _c = c;
              cx = _c.cx;
              cy = _c.cy;
              var rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));

              if (curConfig.gridSnapping) {
                rad = snapToGrid(rad);
              }

              shape.setAttribute('r', rad);
              break;
            }

          case 'ellipse':
            {
              c = $$8(shape).attr(['cx', 'cy']);
              var _c2 = c;
              cx = _c2.cx;
              cy = _c2.cy;

              if (curConfig.gridSnapping) {
                x = snapToGrid(x);
                cx = snapToGrid(cx);
                y = snapToGrid(y);
                cy = snapToGrid(cy);
              }

              shape.setAttribute('rx', Math.abs(x - cx));
              var ry = Math.abs(evt.shiftKey ? x - cx : y - cy);
              shape.setAttribute('ry', ry);
              break;
            }

          case 'fhellipse':
          case 'fhrect':
            {
              freehand.minx = Math.min(realX, freehand.minx);
              freehand.maxx = Math.max(realX, freehand.maxx);
              freehand.miny = Math.min(realY, freehand.miny);
              freehand.maxy = Math.max(realY, freehand.maxy);
            }
          // Fallthrough

          case 'fhpath':
            {
              // dAttr += + realX + ',' + realY + ' ';
              // shape.setAttribute('points', dAttr);
              end.x = realX;
              end.y = realY;

              if (controllPoint2.x && controllPoint2.y) {
                for (i = 0; i < STEP_COUNT - 1; i++) {
                  parameter = i / STEP_COUNT;
                  nextParameter = (i + 1) / STEP_COUNT;
                  bSpline = getBsplinePoint(nextParameter);
                  nextPos = bSpline;
                  bSpline = getBsplinePoint(parameter);
                  sumDistance += Math.sqrt((nextPos.x - bSpline.x) * (nextPos.x - bSpline.x) + (nextPos.y - bSpline.y) * (nextPos.y - bSpline.y));

                  if (sumDistance > THRESHOLD_DIST) {
                    sumDistance -= THRESHOLD_DIST; // Faster than completely re-writing the points attribute.

                    var point = svgcontent.createSVGPoint();
                    point.x = bSpline.x;
                    point.y = bSpline.y;
                    shape.points.appendItem(point);
                  }
                }
              }

              controllPoint2 = {
                x: controllPoint1.x,
                y: controllPoint1.y
              };
              controllPoint1 = {
                x: start.x,
                y: start.y
              };
              start = {
                x: end.x,
                y: end.y
              };
              break; // update path stretch line coordinates
            }

          case 'path': // fall through

          case 'pathedit':
            {
              x *= currentZoom;
              y *= currentZoom;

              if (curConfig.gridSnapping) {
                x = snapToGrid(x);
                y = snapToGrid(y);
                startX = snapToGrid(startX);
                startY = snapToGrid(startY);
              }

              if (evt.shiftKey) {
                var path$1 = path;
                var x1, y1;

                if (path$1) {
                  x1 = path$1.dragging ? path$1.dragging[0] : startX;
                  y1 = path$1.dragging ? path$1.dragging[1] : startY;
                } else {
                  x1 = startX;
                  y1 = startY;
                }

                xya = snapToAngle(x1, y1, x, y);
                var _xya = xya;
                x = _xya.x;
                y = _xya.y;
              }

              if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
                realX *= currentZoom;
                realY *= currentZoom;
                assignAttributes(rubberBox, {
                  x: Math.min(rStartX * currentZoom, realX),
                  y: Math.min(rStartY * currentZoom, realY),
                  width: Math.abs(realX - rStartX * currentZoom),
                  height: Math.abs(realY - rStartY * currentZoom)
                });
              }

              pathActions$1.mouseMove(x, y);
              break;
            }

          case 'textedit':
            {
              x *= currentZoom;
              y *= currentZoom; // if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
              //   assignAttributes(rubberBox, {
              //     x: Math.min(startX, x),
              //     y: Math.min(startY, y),
              //     width: Math.abs(x - startX),
              //     height: Math.abs(y - startY)
              //   }, 100);
              // }

              textActions.mouseMove(mouseX, mouseY);
              break;
            }

          case 'rotate':
            {
              box = getBBox(selected);
              cx = box.x + box.width / 2;
              cy = box.y + box.height / 2;
              var m = getMatrix(selected),
                  center = transformPoint(cx, cy, m);
              cx = center.x;
              cy = center.y;
              angle = (Math.atan2(cy - y, cx - x) * (180 / Math.PI) - 90) % 360;

              if (curConfig.gridSnapping) {
                angle = snapToGrid(angle);
              }

              if (evt.shiftKey) {
                // restrict rotations to nice angles (WRS)
                var snap = 45;
                angle = Math.round(angle / snap) * snap;
              }

              canvas.setRotationAngle(angle < -180 ? 360 + angle : angle, true);
              call('transition', selectedElements);
              break;
            }

          default:
            break;
        }
        /**
        * The mouse has moved on the canvas area
        * @event module:svgcanvas.SvgCanvas#event:ext_mouseMove
        * @type {PlainObject}
        * @property {MouseEvent} event The event object
        * @property {Float} mouse_x x coordinate on canvas
        * @property {Float} mouse_y y coordinate on canvas
        * @property {Element} selected Refers to the first selected element
        */


        runExtensions('mouseMove',
        /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseMove} */
        {
          event: evt,
          mouse_x: mouseX,
          mouse_y: mouseY,
          selected: selected
        });
      }; // mouseMove()
      // - in create mode, the element's opacity is set properly, we create an InsertElementCommand
      // and store it on the Undo stack
      // - in move/resize mode, the element's attributes which were affected by the move/resize are
      // identified, a ChangeElementCommand is created and stored on the stack for those attrs
      // this is done in when we recalculate the selected dimensions()

      /**
       *
       * @param {MouseEvent} evt
       * @fires module:svgcanvas.SvgCanvas#event:zoomed
       * @fires module:svgcanvas.SvgCanvas#event:changed
       * @fires module:svgcanvas.SvgCanvas#event:ext_mouseUp
       * @returns {void}
       */


      var mouseUp = function mouseUp(evt) {
        if (evt.button === 2) {
          return;
        }

        var tempJustSelected = justSelected;
        justSelected = null;

        if (!started) {
          return;
        }

        var pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
            mouseX = pt.x * currentZoom,
            mouseY = pt.y * currentZoom,
            x = mouseX / currentZoom,
            y = mouseY / currentZoom;
        var element = getElem(getId());
        var keep = false;
        var realX = x;
        var realY = y; // TODO: Make true when in multi-unit mode

        started = false;
        var attrs, t;

        switch (currentMode) {
          // intentionally fall-through to select here
          case 'resize':
          case 'multiselect':
            if (!isNullish(rubberBox)) {
              rubberBox.setAttribute('display', 'none');
              curBBoxes = [];
            }

            currentMode = 'select';
          // Fallthrough

          case 'select':
            if (!isNullish(selectedElements[0])) {
              // if we only have one selected element
              if (isNullish(selectedElements[1])) {
                // set our current stroke/fill properties to the element's
                var selected = selectedElements[0];

                switch (selected.tagName) {
                  case 'g':
                  case 'use':
                  case 'image':
                  case 'foreignObject':
                    break;

                  default:
                    curProperties.fill = selected.getAttribute('fill');
                    curProperties.fill_opacity = selected.getAttribute('fill-opacity');
                    curProperties.stroke = selected.getAttribute('stroke');
                    curProperties.stroke_opacity = selected.getAttribute('stroke-opacity');
                    curProperties.stroke_width = selected.getAttribute('stroke-width');
                    curProperties.stroke_dasharray = selected.getAttribute('stroke-dasharray');
                    curProperties.stroke_linejoin = selected.getAttribute('stroke-linejoin');
                    curProperties.stroke_linecap = selected.getAttribute('stroke-linecap');
                }

                if (selected.tagName === 'text') {
                  curText.font_size = selected.getAttribute('font-size');
                  curText.font_family = selected.getAttribute('font-family');
                }

                selectorManager.requestSelector(selected).showGrips(true); // This shouldn't be necessary as it was done on mouseDown...
                // call('selected', [selected]);
              } // always recalculate dimensions to strip off stray identity transforms


              recalculateAllSelectedDimensions(); // if it was being dragged/resized

              if (realX !== rStartX || realY !== rStartY) {
                var len = selectedElements.length;

                for (var i = 0; i < len; ++i) {
                  if (isNullish(selectedElements[i])) {
                    break;
                  }

                  if (!selectedElements[i].firstChild) {
                    // Not needed for groups (incorrectly resizes elems), possibly not needed at all?
                    selectorManager.requestSelector(selectedElements[i]).resize();
                  }
                } // no change in position/size, so maybe we should move to pathedit

              } else {
                t = evt.target;

                if (selectedElements[0].nodeName === 'path' && isNullish(selectedElements[1])) {
                  pathActions$1.select(selectedElements[0]); // if it was a path
                  // else, if it was selected and this is a shift-click, remove it from selection
                } else if (evt.shiftKey) {
                  if (tempJustSelected !== t) {
                    canvas.removeFromSelection([t]);
                  }
                }
              } // no change in mouse position
              // Remove non-scaling stroke


              if (supportsNonScalingStroke()) {
                var elem = selectedElements[0];

                if (elem) {
                  elem.removeAttribute('style');
                  walkTree(elem, function (el) {
                    el.removeAttribute('style');
                  });
                }
              }
            }

            return;

          case 'zoom':
            {
              if (!isNullish(rubberBox)) {
                rubberBox.setAttribute('display', 'none');
              }

              var factor = evt.shiftKey ? 0.5 : 2;
              call('zoomed', {
                x: Math.min(rStartX, realX),
                y: Math.min(rStartY, realY),
                width: Math.abs(realX - rStartX),
                height: Math.abs(realY - rStartY),
                factor: factor
              });
              return;
            }

          case 'fhpath':
            {
              // Check that the path contains at least 2 points; a degenerate one-point path
              // causes problems.
              // Webkit ignores how we set the points attribute with commas and uses space
              // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
              sumDistance = 0;
              controllPoint2 = {
                x: 0,
                y: 0
              };
              controllPoint1 = {
                x: 0,
                y: 0
              };
              start = {
                x: 0,
                y: 0
              };
              end = {
                x: 0,
                y: 0
              };
              var coords = element.getAttribute('points');
              var commaIndex = coords.indexOf(',');

              if (commaIndex >= 0) {
                keep = coords.includes(',', commaIndex + 1);
              } else {
                keep = coords.includes(' ', coords.indexOf(' ') + 1);
              }

              if (keep) {
                element = pathActions$1.smoothPolylineIntoPath(element);
              }

              break;
            }

          case 'line':
            attrs = $$8(element).attr(['x1', 'x2', 'y1', 'y2']);
            keep = attrs.x1 !== attrs.x2 || attrs.y1 !== attrs.y2;
            break;

          case 'foreignObject':
          case 'square':
          case 'rect':
          case 'image':
            attrs = $$8(element).attr(['width', 'height']); // Image should be kept regardless of size (use inherit dimensions later)

            keep = attrs.width || attrs.height || currentMode === 'image';
            break;

          case 'circle':
            keep = element.getAttribute('r') !== '0';
            break;

          case 'ellipse':
            attrs = $$8(element).attr(['rx', 'ry']);
            keep = attrs.rx || attrs.ry;
            break;

          case 'fhellipse':
            if (freehand.maxx - freehand.minx > 0 && freehand.maxy - freehand.miny > 0) {
              element = addSVGElementFromJson({
                element: 'ellipse',
                curStyles: true,
                attr: {
                  cx: (freehand.minx + freehand.maxx) / 2,
                  cy: (freehand.miny + freehand.maxy) / 2,
                  rx: (freehand.maxx - freehand.minx) / 2,
                  ry: (freehand.maxy - freehand.miny) / 2,
                  id: getId()
                }
              });
              call('changed', [element]);
              keep = true;
            }

            break;

          case 'fhrect':
            if (freehand.maxx - freehand.minx > 0 && freehand.maxy - freehand.miny > 0) {
              element = addSVGElementFromJson({
                element: 'rect',
                curStyles: true,
                attr: {
                  x: freehand.minx,
                  y: freehand.miny,
                  width: freehand.maxx - freehand.minx,
                  height: freehand.maxy - freehand.miny,
                  id: getId()
                }
              });
              call('changed', [element]);
              keep = true;
            }

            break;

          case 'text':
            keep = true;
            selectOnly([element]);
            textActions.start(element);
            break;

          case 'path':
            {
              // set element to null here so that it is not removed nor finalized
              element = null; // continue to be set to true so that mouseMove happens

              started = true;
              var res = pathActions$1.mouseUp(evt, element, mouseX, mouseY);
              element = res.element;
              keep = res.keep;
              break;
            }

          case 'pathedit':
            keep = true;
            element = null;
            pathActions$1.mouseUp(evt);
            break;

          case 'textedit':
            keep = false;
            element = null;
            textActions.mouseUp(evt, mouseX, mouseY);
            break;

          case 'rotate':
            {
              keep = true;
              element = null;
              currentMode = 'select';
              var batchCmd = canvas.undoMgr.finishUndoableChange();

              if (!batchCmd.isEmpty()) {
                addCommandToHistory(batchCmd);
              } // perform recalculation to weed out any stray identity transforms that might get stuck


              recalculateAllSelectedDimensions();
              call('changed', selectedElements);
              break;
            }

          default:
            // This could occur in an extension
            break;
        }
        /**
        * The main (left) mouse button is released (anywhere)
        * @event module:svgcanvas.SvgCanvas#event:ext_mouseUp
        * @type {PlainObject}
        * @property {MouseEvent} event The event object
        * @property {Float} mouse_x x coordinate on canvas
        * @property {Float} mouse_y y coordinate on canvas
        */


        var extResult = runExtensions('mouseUp',
        /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseUp} */
        {
          event: evt,
          mouse_x: mouseX,
          mouse_y: mouseY
        }, true);
        $$8.each(extResult, function (i, r) {
          if (r) {
            keep = r.keep || keep;
            element = r.element;
            started = r.started || started;
          }
        });

        if (!keep && !isNullish(element)) {
          getCurrentDrawing().releaseId(getId());
          element.remove();
          element = null;
          t = evt.target; // if this element is in a group, go up until we reach the top-level group
          // just below the layer groups
          // TODO: once we implement links, we also would have to check for <a> elements

          while (t && t.parentNode && t.parentNode.parentNode && t.parentNode.parentNode.tagName === 'g') {
            t = t.parentNode;
          } // if we are not in the middle of creating a path, and we've clicked on some shape,
          // then go to Select mode.
          // WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>


          if ((currentMode !== 'path' || !drawnPath) && t && t.parentNode && t.parentNode.id !== 'selectorParentGroup' && t.id !== 'svgcanvas' && t.id !== 'svgroot') {
            // switch into "select" mode if we've clicked on an element
            canvas.setMode('select');
            selectOnly([t], true);
          }
        } else if (!isNullish(element)) {
          /**
          * @name module:svgcanvas.SvgCanvas#addedNew
          * @type {boolean}
          */
          canvas.addedNew = true;

          var aniDur = 0.2;
          var cAni;

          if (opacAni.beginElement && parseFloat(element.getAttribute('opacity')) !== curShape.opacity) {
            cAni = $$8(opacAni).clone().attr({
              to: curShape.opacity,
              dur: aniDur
            }).appendTo(element);

            try {
              // Fails in FF4 on foreignObject
              cAni[0].beginElement();
            } catch (e) {}
          } else {
            aniDur = 0;
          } // Ideally this would be done on the endEvent of the animation,
          // but that doesn't seem to be supported in Webkit


          setTimeout(function () {
            if (cAni) {
              cAni.remove();
            }

            element.setAttribute('opacity', curShape.opacity);
            element.setAttribute('style', 'pointer-events:inherit');
            cleanupElement(element);

            if (currentMode === 'path') {
              pathActions$1.toEditMode(element);
            } else if (curConfig.selectNew) {
              selectOnly([element], true);
            } // we create the insert command that is stored on the stack
            // undo means to call cmd.unapply(), redo means to call cmd.apply()


            addCommandToHistory(new InsertElementCommand$1(element));
            call('changed', [element]);
          }, aniDur * 1000);
        }

        startTransform = null;
      };

      var dblClick = function dblClick(evt) {
        var evtTarget = evt.target;
        var parent = evtTarget.parentNode; // Do nothing if already in current group

        if (parent === currentGroup) {
          return;
        }

        var mouseTarget = getMouseTarget(evt);
        var _mouseTarget = mouseTarget,
            tagName = _mouseTarget.tagName;

        if (tagName === 'text' && currentMode !== 'textedit') {
          var pt = transformPoint(evt.pageX, evt.pageY, rootSctm);
          textActions.select(mouseTarget, pt.x, pt.y);
        }

        if ((tagName === 'g' || tagName === 'a') && getRotationAngle(mouseTarget)) {
          // TODO: Allow method of in-group editing without having to do
          // this (similar to editing rotated paths)
          // Ungroup and regroup
          pushGroupProperties(mouseTarget);
          mouseTarget = selectedElements[0];
          clearSelection(true);
        } // Reset context


        if (currentGroup) {
          leaveContext();
        }

        if (parent.tagName !== 'g' && parent.tagName !== 'a' || parent === getCurrentDrawing().getCurrentLayer() || mouseTarget === selectorManager.selectorParentGroup) {
          // Escape from in-group edit
          return;
        }

        setContext(mouseTarget);
      }; // prevent links from being followed in the canvas


      var handleLinkInCanvas = function handleLinkInCanvas(e) {
        e.preventDefault();
        return false;
      }; // Added mouseup to the container here.
      // TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.


      $$8(container).mousedown(mouseDown).mousemove(mouseMove).click(handleLinkInCanvas).dblclick(dblClick).mouseup(mouseUp); // $(window).mouseup(mouseUp);
      // TODO(rafaelcastrocouto): User preference for shift key and zoom factor

      $$8(container).bind('mousewheel DOMMouseScroll',
      /**
       * @param {Event} e
       * @fires module:svgcanvas.SvgCanvas#event:updateCanvas
       * @fires module:svgcanvas.SvgCanvas#event:zoomDone
       * @returns {void}
       */
      function (e) {
        if (!e.shiftKey) {
          return;
        }

        e.preventDefault();
        var evt = e.originalEvent;
        rootSctm = $$8('#svgcontent g')[0].getScreenCTM().inverse();
        var workarea = $$8('#workarea');
        var scrbar = 15;
        var rulerwidth = curConfig.showRulers ? 16 : 0; // mouse relative to content area in content pixels

        var pt = transformPoint(evt.pageX, evt.pageY, rootSctm); // full work area width in screen pixels

        var editorFullW = workarea.width();
        var editorFullH = workarea.height(); // work area width minus scroll and ruler in screen pixels

        var editorW = editorFullW - scrbar - rulerwidth;
        var editorH = editorFullH - scrbar - rulerwidth; // work area width in content pixels

        var workareaViewW = editorW * rootSctm.a;
        var workareaViewH = editorH * rootSctm.d; // content offset from canvas in screen pixels

        var wOffset = workarea.offset();
        var wOffsetLeft = wOffset.left + rulerwidth;
        var wOffsetTop = wOffset.top + rulerwidth;
        var delta = evt.wheelDelta ? evt.wheelDelta : evt.detail ? -evt.detail : 0;

        if (!delta) {
          return;
        }

        var factor = Math.max(3 / 4, Math.min(4 / 3, delta));
        var wZoom, hZoom;

        if (factor > 1) {
          wZoom = Math.ceil(editorW / workareaViewW * factor * 100) / 100;
          hZoom = Math.ceil(editorH / workareaViewH * factor * 100) / 100;
        } else {
          wZoom = Math.floor(editorW / workareaViewW * factor * 100) / 100;
          hZoom = Math.floor(editorH / workareaViewH * factor * 100) / 100;
        }

        var zoomlevel = Math.min(wZoom, hZoom);
        zoomlevel = Math.min(10, Math.max(0.01, zoomlevel));

        if (zoomlevel === currentZoom) {
          return;
        }

        factor = zoomlevel / currentZoom; // top left of workarea in content pixels before zoom

        var topLeftOld = transformPoint(wOffsetLeft, wOffsetTop, rootSctm); // top left of workarea in content pixels after zoom

        var topLeftNew = {
          x: pt.x - (pt.x - topLeftOld.x) / factor,
          y: pt.y - (pt.y - topLeftOld.y) / factor
        }; // top left of workarea in canvas pixels relative to content after zoom

        var topLeftNewCanvas = {
          x: topLeftNew.x * zoomlevel,
          y: topLeftNew.y * zoomlevel
        }; // new center in canvas pixels

        var newCtr = {
          x: topLeftNewCanvas.x - rulerwidth + editorFullW / 2,
          y: topLeftNewCanvas.y - rulerwidth + editorFullH / 2
        };
        canvas.setZoom(zoomlevel);
        $$8('#zoom').val((zoomlevel * 100).toFixed(1));
        call('updateCanvas', {
          center: false,
          newCtr: newCtr
        });
        call('zoomDone');
      });
    })();
    /**
    * Group: Text edit functions
    * Functions relating to editing text elements
    * @namespace {PlainObject} textActions
    * @memberof module:svgcanvas.SvgCanvas#
    */


    var textActions = canvas.textActions = function () {
      var curtext;
      var textinput;
      var cursor;
      var selblock;
      var blinker;
      var chardata = [];
      var textbb; // , transbb;

      var matrix;
      var lastX, lastY;
      var allowDbl;
      /**
       *
       * @param {Integer} index
       * @returns {void}
       */

      function setCursor(index) {
        var empty = textinput.value === '';
        $$8(textinput).focus();

        if (!arguments.length) {
          if (empty) {
            index = 0;
          } else {
            if (textinput.selectionEnd !== textinput.selectionStart) {
              return;
            }

            index = textinput.selectionEnd;
          }
        }

        var charbb = chardata[index];

        if (!empty) {
          textinput.setSelectionRange(index, index);
        }

        cursor = getElem('text_cursor');

        if (!cursor) {
          cursor = document.createElementNS(NS.SVG, 'line');
          assignAttributes(cursor, {
            id: 'text_cursor',
            stroke: '#333',
            'stroke-width': 1
          });
          cursor = getElem('selectorParentGroup').appendChild(cursor);
        }

        if (!blinker) {
          blinker = setInterval(function () {
            var show = cursor.getAttribute('display') === 'none';
            cursor.setAttribute('display', show ? 'inline' : 'none');
          }, 600);
        }

        var startPt = ptToScreen(charbb.x, textbb.y);
        var endPt = ptToScreen(charbb.x, textbb.y + textbb.height);
        assignAttributes(cursor, {
          x1: startPt.x,
          y1: startPt.y,
          x2: endPt.x,
          y2: endPt.y,
          visibility: 'visible',
          display: 'inline'
        });

        if (selblock) {
          selblock.setAttribute('d', '');
        }
      }
      /**
       *
       * @param {Integer} start
       * @param {Integer} end
       * @param {boolean} skipInput
       * @returns {void}
       */


      function setSelection(start, end, skipInput) {
        if (start === end) {
          setCursor(end);
          return;
        }

        if (!skipInput) {
          textinput.setSelectionRange(start, end);
        }

        selblock = getElem('text_selectblock');

        if (!selblock) {
          selblock = document.createElementNS(NS.SVG, 'path');
          assignAttributes(selblock, {
            id: 'text_selectblock',
            fill: 'green',
            opacity: 0.5,
            style: 'pointer-events:none'
          });
          getElem('selectorParentGroup').append(selblock);
        }

        var startbb = chardata[start];
        var endbb = chardata[end];
        cursor.setAttribute('visibility', 'hidden');
        var tl = ptToScreen(startbb.x, textbb.y),
            tr = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y),
            bl = ptToScreen(startbb.x, textbb.y + textbb.height),
            br = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y + textbb.height);
        var dstr = 'M' + tl.x + ',' + tl.y + ' L' + tr.x + ',' + tr.y + ' ' + br.x + ',' + br.y + ' ' + bl.x + ',' + bl.y + 'z';
        assignAttributes(selblock, {
          d: dstr,
          display: 'inline'
        });
      }
      /**
       *
       * @param {Float} mouseX
       * @param {Float} mouseY
       * @returns {Integer}
       */


      function getIndexFromPoint(mouseX, mouseY) {
        // Position cursor here
        var pt = svgroot.createSVGPoint();
        pt.x = mouseX;
        pt.y = mouseY; // No content, so return 0

        if (chardata.length === 1) {
          return 0;
        } // Determine if cursor should be on left or right of character


        var charpos = curtext.getCharNumAtPosition(pt);

        if (charpos < 0) {
          // Out of text range, look at mouse coords
          charpos = chardata.length - 2;

          if (mouseX <= chardata[0].x) {
            charpos = 0;
          }
        } else if (charpos >= chardata.length - 2) {
          charpos = chardata.length - 2;
        }

        var charbb = chardata[charpos];
        var mid = charbb.x + charbb.width / 2;

        if (mouseX > mid) {
          charpos++;
        }

        return charpos;
      }
      /**
       *
       * @param {Float} mouseX
       * @param {Float} mouseY
       * @returns {void}
       */


      function setCursorFromPoint(mouseX, mouseY) {
        setCursor(getIndexFromPoint(mouseX, mouseY));
      }
      /**
       *
       * @param {Float} x
       * @param {Float} y
       * @param {boolean} apply
       * @returns {void}
       */


      function setEndSelectionFromPoint(x, y, apply) {
        var i1 = textinput.selectionStart;
        var i2 = getIndexFromPoint(x, y);
        var start = Math.min(i1, i2);
        var end = Math.max(i1, i2);
        setSelection(start, end, !apply);
      }
      /**
       *
       * @param {Float} xIn
       * @param {Float} yIn
       * @returns {module:math.XYObject}
       */


      function screenToPt(xIn, yIn) {
        var out = {
          x: xIn,
          y: yIn
        };
        out.x /= currentZoom;
        out.y /= currentZoom;

        if (matrix) {
          var pt = transformPoint(out.x, out.y, matrix.inverse());
          out.x = pt.x;
          out.y = pt.y;
        }

        return out;
      }
      /**
       *
       * @param {Float} xIn
       * @param {Float} yIn
       * @returns {module:math.XYObject}
       */


      function ptToScreen(xIn, yIn) {
        var out = {
          x: xIn,
          y: yIn
        };

        if (matrix) {
          var pt = transformPoint(out.x, out.y, matrix);
          out.x = pt.x;
          out.y = pt.y;
        }

        out.x *= currentZoom;
        out.y *= currentZoom;
        return out;
      }
      /*
      // Not currently in use
      function hideCursor () {
        if (cursor) {
          cursor.setAttribute('visibility', 'hidden');
        }
      }
      */

      /**
       *
       * @param {Event} evt
       * @returns {void}
       */


      function selectAll(evt) {
        setSelection(0, curtext.textContent.length);
        $$8(this).unbind(evt);
      }
      /**
       *
       * @param {Event} evt
       * @returns {void}
       */


      function selectWord(evt) {
        if (!allowDbl || !curtext) {
          return;
        }

        var ept = transformPoint(evt.pageX, evt.pageY, rootSctm),
            mouseX = ept.x * currentZoom,
            mouseY = ept.y * currentZoom;
        var pt = screenToPt(mouseX, mouseY);
        var index = getIndexFromPoint(pt.x, pt.y);
        var str = curtext.textContent;
        var first = str.substr(0, index).replace(/[a-z0-9]+$/i, '').length;
        var m = str.substr(index).match(/^[a-z0-9]+/i);
        var last = (m ? m[0].length : 0) + index;
        setSelection(first, last); // Set tripleclick

        $$8(evt.target).click(selectAll);
        setTimeout(function () {
          $$8(evt.target).unbind('click', selectAll);
        }, 300);
      }

      return (
        /** @lends module:svgcanvas.SvgCanvas#textActions */
        {
          /**
          * @param {Element} target
          * @param {Float} x
          * @param {Float} y
          * @returns {void}
          */
          select: function select(target, x, y) {
            curtext = target;
            textActions.toEditMode(x, y);
          },

          /**
          * @param {Element} elem
          * @returns {void}
          */
          start: function start(elem) {
            curtext = elem;
            textActions.toEditMode();
          },

          /**
          * @param {external:MouseEvent} evt
          * @param {Element} mouseTarget
          * @param {Float} startX
          * @param {Float} startY
          * @returns {void}
          */
          mouseDown: function mouseDown(evt, mouseTarget, startX, startY) {
            var pt = screenToPt(startX, startY);
            textinput.focus();
            setCursorFromPoint(pt.x, pt.y);
            lastX = startX;
            lastY = startY; // TODO: Find way to block native selection
          },

          /**
          * @param {Float} mouseX
          * @param {Float} mouseY
          * @returns {void}
          */
          mouseMove: function mouseMove(mouseX, mouseY) {
            var pt = screenToPt(mouseX, mouseY);
            setEndSelectionFromPoint(pt.x, pt.y);
          },

          /**
          * @param {external:MouseEvent} evt
          * @param {Float} mouseX
          * @param {Float} mouseY
          * @returns {void}
          */
          mouseUp: function mouseUp(evt, mouseX, mouseY) {
            var pt = screenToPt(mouseX, mouseY);
            setEndSelectionFromPoint(pt.x, pt.y, true); // TODO: Find a way to make this work: Use transformed BBox instead of evt.target
            // if (lastX === mouseX && lastY === mouseY
            //   && !rectsIntersect(transbb, {x: pt.x, y: pt.y, width: 0, height: 0})) {
            //   textActions.toSelectMode(true);
            // }

            if (evt.target !== curtext && mouseX < lastX + 2 && mouseX > lastX - 2 && mouseY < lastY + 2 && mouseY > lastY - 2) {
              textActions.toSelectMode(true);
            }
          },

          /**
          * @function
          * @param {Integer} index
          * @returns {void}
          */
          setCursor: setCursor,

          /**
          * @param {Float} x
          * @param {Float} y
          * @returns {void}
          */
          toEditMode: function toEditMode(x, y) {
            allowDbl = false;
            currentMode = 'textedit';
            selectorManager.requestSelector(curtext).showGrips(false); // Make selector group accept clicks

            /* const selector = */

            selectorManager.requestSelector(curtext); // Do we need this? Has side effect of setting lock, so keeping for now, but next line wasn't being used
            // const sel = selector.selectorRect;

            textActions.init();
            $$8(curtext).css('cursor', 'text'); // if (supportsEditableText()) {
            //   curtext.setAttribute('editable', 'simple');
            //   return;
            // }

            if (!arguments.length) {
              setCursor();
            } else {
              var pt = screenToPt(x, y);
              setCursorFromPoint(pt.x, pt.y);
            }

            setTimeout(function () {
              allowDbl = true;
            }, 300);
          },

          /**
          * @param {boolean|Element} selectElem
          * @fires module:svgcanvas.SvgCanvas#event:selected
          * @returns {void}
          */
          toSelectMode: function toSelectMode(selectElem) {
            currentMode = 'select';
            clearInterval(blinker);
            blinker = null;

            if (selblock) {
              $$8(selblock).attr('display', 'none');
            }

            if (cursor) {
              $$8(cursor).attr('visibility', 'hidden');
            }

            $$8(curtext).css('cursor', 'move');

            if (selectElem) {
              clearSelection();
              $$8(curtext).css('cursor', 'move');
              call('selected', [curtext]);
              addToSelection([curtext], true);
            }

            if (curtext && !curtext.textContent.length) {
              // No content, so delete
              canvas.deleteSelectedElements();
            }

            $$8(textinput).blur();
            curtext = false; // if (supportsEditableText()) {
            //   curtext.removeAttribute('editable');
            // }
          },

          /**
          * @param {Element} elem
          * @returns {void}
          */
          setInputElem: function setInputElem(elem) {
            textinput = elem; // $(textinput).blur(hideCursor);
          },

          /**
          * @returns {void}
          */
          clear: function clear() {
            if (currentMode === 'textedit') {
              textActions.toSelectMode();
            }
          },

          /**
          * @param {Element} inputElem Not in use
          * @returns {void}
          */
          init: function init(inputElem) {
            if (!curtext) {
              return;
            }

            var i, end; // if (supportsEditableText()) {
            //   curtext.select();
            //   return;
            // }

            if (!curtext.parentNode) {
              // Result of the ffClone, need to get correct element
              curtext = selectedElements[0];
              selectorManager.requestSelector(curtext).showGrips(false);
            }

            var str = curtext.textContent;
            var len = str.length;
            var xform = curtext.getAttribute('transform');
            textbb = getBBox(curtext);
            matrix = xform ? getMatrix(curtext) : null;
            chardata = [];
            chardata.length = len;
            textinput.focus();
            $$8(curtext).unbind('dblclick', selectWord).dblclick(selectWord);

            if (!len) {
              end = {
                x: textbb.x + textbb.width / 2,
                width: 0
              };
            }

            for (i = 0; i < len; i++) {
              var start = curtext.getStartPositionOfChar(i);
              end = curtext.getEndPositionOfChar(i);

              if (!supportsGoodTextCharPos()) {
                var offset = canvas.contentW * currentZoom;
                start.x -= offset;
                end.x -= offset;
                start.x /= currentZoom;
                end.x /= currentZoom;
              } // Get a "bbox" equivalent for each character. Uses the
              // bbox data of the actual text for y, height purposes
              // TODO: Decide if y, width and height are actually necessary


              chardata[i] = {
                x: start.x,
                y: textbb.y,
                // start.y?
                width: end.x - start.x,
                height: textbb.height
              };
            } // Add a last bbox for cursor at end of text


            chardata.push({
              x: end.x,
              width: 0
            });
            setSelection(textinput.selectionStart, textinput.selectionEnd, true);
          }
        }
      );
    }();
    /**
    * Group: Serialization
    */

    /**
    * Looks at DOM elements inside the `<defs>` to see if they are referred to,
    * removes them from the DOM if they are not.
    * @function module:svgcanvas.SvgCanvas#removeUnusedDefElems
    * @returns {Integer} The number of elements that were removed
    */


    var removeUnusedDefElems = this.removeUnusedDefElems = function () {
      var defs = svgcontent.getElementsByTagNameNS(NS.SVG, 'defs');

      if (!defs || !defs.length) {
        return 0;
      } // if (!defs.firstChild) { return; }


      var defelemUses = [];
      var numRemoved = 0;
      var attrs = ['fill', 'stroke', 'filter', 'marker-start', 'marker-mid', 'marker-end'];
      var alen = attrs.length;
      var allEls = svgcontent.getElementsByTagNameNS(NS.SVG, '*');
      var allLen = allEls.length;
      var i, j;

      for (i = 0; i < allLen; i++) {
        var el = allEls[i];

        for (j = 0; j < alen; j++) {
          var ref = getUrlFromAttr(el.getAttribute(attrs[j]));

          if (ref) {
            defelemUses.push(ref.substr(1));
          }
        } // gradients can refer to other gradients


        var href = getHref(el);

        if (href && href.startsWith('#')) {
          defelemUses.push(href.substr(1));
        }
      }

      var defelems = $$8(defs).find('linearGradient, radialGradient, filter, marker, svg, symbol');
      i = defelems.length;

      while (i--) {
        var defelem = defelems[i];
        var id = defelem.id;

        if (!defelemUses.includes(id)) {
          // Not found, so remove (but remember)
          removedElements[id] = defelem;
          defelem.remove();
          numRemoved++;
        }
      }

      return numRemoved;
    };
    /**
    * Main function to set up the SVG content for output.
    * @function module:svgcanvas.SvgCanvas#svgCanvasToString
    * @returns {string} The SVG image for output
    */


    this.svgCanvasToString = function () {
      // keep calling it until there are none to remove
      while (removeUnusedDefElems() > 0) {} // eslint-disable-line no-empty


      pathActions$1.clear(true); // Keep SVG-Edit comment on top

      $$8.each(svgcontent.childNodes, function (i, node) {
        if (i && node.nodeType === 8 && node.data.includes('Created with')) {
          svgcontent.firstChild.before(node);
        }
      }); // Move out of in-group editing mode

      if (currentGroup) {
        leaveContext();
        selectOnly([currentGroup]);
      }

      var nakedSvgs = []; // Unwrap gsvg if it has no special attributes (only id and style)

      $$8(svgcontent).find('g:data(gsvg)').each(function () {
        var attrs = this.attributes;
        var len = attrs.length;

        for (var i = 0; i < len; i++) {
          if (attrs[i].nodeName === 'id' || attrs[i].nodeName === 'style') {
            len--;
          }
        } // No significant attributes, so ungroup


        if (len <= 0) {
          var svg = this.firstChild;
          nakedSvgs.push(svg);
          $$8(this).replaceWith(svg);
        }
      });
      var output = this.svgToString(svgcontent, 0); // Rewrap gsvg

      if (nakedSvgs.length) {
        $$8(nakedSvgs).each(function () {
          groupSvgElem(this);
        });
      }

      return output;
    };
    /**
    * Sub function ran on each SVG element to convert it to a string as desired.
    * @function module:svgcanvas.SvgCanvas#svgToString
    * @param {Element} elem - The SVG element to convert
    * @param {Integer} indent - Number of spaces to indent this tag
    * @returns {string} The given element as an SVG tag
    */


    this.svgToString = function (elem, indent) {
      var out = [];
      var unit = curConfig.baseUnit;
      var unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$');

      if (elem) {
        cleanupElement(elem);

        var attrs = _toConsumableArray(elem.attributes);

        var childs = elem.childNodes;
        attrs.sort(function (a, b) {
          return a.name > b.name ? -1 : 1;
        });

        for (var i = 0; i < indent; i++) {
          out.push(' ');
        }

        out.push('<');
        out.push(elem.nodeName);

        if (elem.id === 'svgcontent') {
          // Process root element separately
          var res = getResolution();
          var vb = ''; // TODO: Allow this by dividing all values by current baseVal
          // Note that this also means we should properly deal with this on import
          // if (curConfig.baseUnit !== 'px') {
          //   const unit = curConfig.baseUnit;
          //   const unitM = getTypeMap()[unit];
          //   res.w = shortFloat(res.w / unitM);
          //   res.h = shortFloat(res.h / unitM);
          //   vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';
          //   res.w += unit;
          //   res.h += unit;
          // }

          if (unit !== 'px') {
            res.w = convertUnit(res.w, unit) + unit;
            res.h = convertUnit(res.h, unit) + unit;
          }

          out.push(' width="' + res.w + '" height="' + res.h + '"' + vb + ' xmlns="' + NS.SVG + '"');
          var nsuris = {}; // Check elements for namespaces, add if found

          $$8(elem).find('*').andSelf().each(function () {
            // const el = this;
            // for some elements have no attribute
            var uri = this.namespaceURI;

            if (uri && !nsuris[uri] && nsMap[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
              nsuris[uri] = true;
              out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
            }

            $$8.each(this.attributes, function (i, attr) {
              var u = attr.namespaceURI;

              if (u && !nsuris[u] && nsMap[u] !== 'xmlns' && nsMap[u] !== 'xml') {
                nsuris[u] = true;
                out.push(' xmlns:' + nsMap[u] + '="' + u + '"');
              }
            });
          });
          var _i3 = attrs.length;
          var attrNames = ['width', 'height', 'xmlns', 'x', 'y', 'viewBox', 'id', 'overflow'];

          while (_i3--) {
            var attr = attrs[_i3];
            var attrVal = toXml(attr.value); // Namespaces have already been dealt with, so skip

            if (attr.nodeName.startsWith('xmlns:')) {
              continue;
            } // only serialize attributes we don't use internally


            if (attrVal !== '' && !attrNames.includes(attr.localName)) {
              if (!attr.namespaceURI || nsMap[attr.namespaceURI]) {
                out.push(' ');
                out.push(attr.nodeName);
                out.push('="');
                out.push(attrVal);
                out.push('"');
              }
            }
          }
        } else {
          // Skip empty defs
          if (elem.nodeName === 'defs' && !elem.firstChild) {
            return '';
          }

          var mozAttrs = ['-moz-math-font-style', '_moz-math-font-style'];

          for (var _i4 = attrs.length - 1; _i4 >= 0; _i4--) {
            var _attr = attrs[_i4];

            var _attrVal = toXml(_attr.value); // remove bogus attributes added by Gecko


            if (mozAttrs.includes(_attr.localName)) {
              continue;
            }

            if (_attrVal !== '') {
              if (_attrVal.startsWith('pointer-events')) {
                continue;
              }

              if (_attr.localName === 'class' && _attrVal.startsWith('se_')) {
                continue;
              }

              out.push(' ');

              if (_attr.localName === 'd') {
                _attrVal = pathActions$1.convertPath(elem, true);
              }

              if (!isNaN(_attrVal)) {
                _attrVal = shortFloat(_attrVal);
              } else if (unitRe.test(_attrVal)) {
                _attrVal = shortFloat(_attrVal) + unit;
              } // Embed images when saving


              if (saveOptions.apply && elem.nodeName === 'image' && _attr.localName === 'href' && saveOptions.images && saveOptions.images === 'embed') {
                var img = encodableImages[_attrVal];

                if (img) {
                  _attrVal = img;
                }
              } // map various namespaces to our fixed namespace prefixes
              // (the default xmlns attribute itself does not get a prefix)


              if (!_attr.namespaceURI || _attr.namespaceURI === NS.SVG || nsMap[_attr.namespaceURI]) {
                out.push(_attr.nodeName);
                out.push('="');
                out.push(_attrVal);
                out.push('"');
              }
            }
          }
        }

        if (elem.hasChildNodes()) {
          out.push('>');
          indent++;
          var bOneLine = false;

          for (var _i5 = 0; _i5 < childs.length; _i5++) {
            var child = childs.item(_i5);

            switch (child.nodeType) {
              case 1:
                // element node
                out.push('\n');
                out.push(this.svgToString(childs.item(_i5), indent));
                break;

              case 3:
                {
                  // text node
                  var str = child.nodeValue.replace(/^\s+|\s+$/g, '');

                  if (str !== '') {
                    bOneLine = true;
                    out.push(String(toXml(str)));
                  }

                  break;
                }

              case 4:
                // cdata node
                out.push('\n');
                out.push(new Array(indent + 1).join(' '));
                out.push('<![CDATA[');
                out.push(child.nodeValue);
                out.push(']]>');
                break;

              case 8:
                // comment
                out.push('\n');
                out.push(new Array(indent + 1).join(' '));
                out.push('<!--');
                out.push(child.data);
                out.push('-->');
                break;
            } // switch on node type

          }

          indent--;

          if (!bOneLine) {
            out.push('\n');

            for (var _i6 = 0; _i6 < indent; _i6++) {
              out.push(' ');
            }
          }

          out.push('</');
          out.push(elem.nodeName);
          out.push('>');
        } else {
          out.push('/>');
        }
      }

      return out.join('');
    }; // end svgToString()

    /**
     * Function to run when image data is found
     * @callback module:svgcanvas.ImageEmbeddedCallback
     * @param {string|false} result Data URL
     * @returns {void}
     */

    /**
    * Converts a given image file to a data URL when possible, then runs a given callback.
    * @function module:svgcanvas.SvgCanvas#embedImage
    * @param {string} src - The path/URL of the image
    * @returns {Promise<string|false>} Resolves to a Data URL (string|false)
    */


    this.embedImage = function (src) {
      // Todo: Remove this Promise in favor of making an async/await `Image.load` utility
      return new Promise(function (resolve, reject) {
        // eslint-disable-line promise/avoid-new
        // load in the image and once it's loaded, get the dimensions
        $$8(new Image()).load(function (response, status, xhr) {
          if (status === 'error') {
            reject(new Error('Error loading image: ' + xhr.status + ' ' + xhr.statusText));
            return;
          } // create a canvas the same size as the raster image


          var cvs = document.createElement('canvas');
          cvs.width = this.width;
          cvs.height = this.height; // load the raster image into the canvas

          cvs.getContext('2d').drawImage(this, 0, 0); // retrieve the data: URL

          try {
            var urldata = ';svgedit_url=' + encodeURIComponent(src);
            urldata = cvs.toDataURL().replace(';base64', urldata + ';base64');
            encodableImages[src] = urldata;
          } catch (e) {
            encodableImages[src] = false;
          }

          lastGoodImgUrl = src;
          resolve(encodableImages[src]);
        }).attr('src', src);
      });
    };
    /**
    * Sets a given URL to be a "last good image" URL.
    * @function module:svgcanvas.SvgCanvas#setGoodImage
    * @param {string} val
    * @returns {void}
    */


    this.setGoodImage = function (val) {
      lastGoodImgUrl = val;
    };
    /**
    * Does nothing by default, handled by optional widget/extension.
    * @function module:svgcanvas.SvgCanvas#open
    * @returns {void}
    */


    this.open = function () {
      /* */
    };
    /**
    * Serializes the current drawing into SVG XML text and passes it to the 'saved' handler.
    * This function also includes the XML prolog. Clients of the `SvgCanvas` bind their save
    * function to the 'saved' event.
    * @function module:svgcanvas.SvgCanvas#save
    * @param {module:svgcanvas.SaveOptions} opts
    * @fires module:svgcanvas.SvgCanvas#event:saved
    * @returns {void}
    */


    this.save = function (opts) {
      // remove the selected outline before serializing
      clearSelection(); // Update save options if provided

      if (opts) {
        $$8.extend(saveOptions, opts);
      }

      saveOptions.apply = true; // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration

      var str = this.svgCanvasToString();
      call('saved', str);
    };
    /**
    * @typedef {PlainObject} module:svgcanvas.IssuesAndCodes
    * @property {string[]} issueCodes The locale-independent code names
    * @property {string[]} issues The localized descriptions
    */

    /**
    * Codes only is useful for locale-independent detection.
    * @returns {module:svgcanvas.IssuesAndCodes}
    */


    function getIssues() {
      // remove the selected outline before serializing
      clearSelection(); // Check for known CanVG issues

      var issues = [];
      var issueCodes = []; // Selector and notice

      var issueList = {
        feGaussianBlur: uiStrings.exportNoBlur,
        foreignObject: uiStrings.exportNoforeignObject,
        '[stroke-dasharray]': uiStrings.exportNoDashArray
      };
      var content = $$8(svgcontent); // Add font/text check if Canvas Text API is not implemented

      if (!('font' in $$8('<canvas>')[0].getContext('2d'))) {
        issueList.text = uiStrings.exportNoText;
      }

      $$8.each(issueList, function (sel, descr) {
        if (content.find(sel).length) {
          issueCodes.push(sel);
          issues.push(descr);
        }
      });
      return {
        issues: issues,
        issueCodes: issueCodes
      };
    }

    var canvg;
    /**
    * @typedef {"feGaussianBlur"|"foreignObject"|"[stroke-dasharray]"|"text"} module:svgcanvas.IssueCode
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.ImageExportedResults
    * @property {string} datauri Contents as a Data URL
    * @property {string} bloburl May be the empty string
    * @property {string} svg The SVG contents as a string
    * @property {string[]} issues The localization messages of `issueCodes`
    * @property {module:svgcanvas.IssueCode[]} issueCodes CanVG issues found with the SVG
    * @property {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} type The chosen image type
    * @property {"image/png"|"image/jpeg"|"image/bmp"|"image/webp"} mimeType The image MIME type
    * @property {Float} quality A decimal between 0 and 1 (for use with JPEG or WEBP)
    * @property {string} exportWindowName A convenience for passing along a `window.name` to target a window on which the export could be added
    */

    /**
    * Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image,
    * then calls "exported" with an object including the string, image
    * information, and any issues found.
    * @function module:svgcanvas.SvgCanvas#rasterExport
    * @param {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} [imgType="PNG"]
    * @param {Float} [quality] Between 0 and 1
    * @param {string} [exportWindowName]
    * @param {PlainObject} [opts]
    * @param {boolean} [opts.avoidEvent]
    * @fires module:svgcanvas.SvgCanvas#event:exported
    * @todo Confirm/fix ICO type
    * @returns {Promise<module:svgcanvas.ImageExportedResults>} Resolves to {@link module:svgcanvas.ImageExportedResults}
    */

    this.rasterExport =
    /*#__PURE__*/
    function () {
      var _ref5 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(imgType, quality, exportWindowName) {
        var opts,
            type,
            mimeType,
            _getIssues,
            issues,
            issueCodes,
            svg,
            _ref6,
            c,
            _args2 = arguments;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                opts = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {};
                type = imgType === 'ICO' ? 'BMP' : imgType || 'PNG';
                mimeType = 'image/' + type.toLowerCase();
                _getIssues = getIssues(), issues = _getIssues.issues, issueCodes = _getIssues.issueCodes;
                svg = this.svgCanvasToString();

                if (canvg) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 8;
                return importSetGlobal(curConfig.canvgPath + 'canvg.js', {
                  global: 'canvg'
                });

              case 8:
                _ref6 = _context2.sent;
                canvg = _ref6.canvg;

              case 10:
                if (!$$8('#export_canvas').length) {
                  $$8('<canvas>', {
                    id: 'export_canvas'
                  }).hide().appendTo('body');
                }

                c = $$8('#export_canvas')[0];
                c.width = canvas.contentW;
                c.height = canvas.contentH;
                _context2.next = 16;
                return canvg(c, svg);

              case 16:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  // eslint-disable-line promise/avoid-new
                  var dataURLType = type.toLowerCase();
                  var datauri = quality ? c.toDataURL('image/' + dataURLType, quality) : c.toDataURL('image/' + dataURLType);
                  var bloburl;
                  /**
                   * Called when `bloburl` is available for export.
                   * @returns {void}
                   */

                  function done() {
                    var obj = {
                      datauri: datauri,
                      bloburl: bloburl,
                      svg: svg,
                      issues: issues,
                      issueCodes: issueCodes,
                      type: imgType,
                      mimeType: mimeType,
                      quality: quality,
                      exportWindowName: exportWindowName
                    };

                    if (!opts.avoidEvent) {
                      call('exported', obj);
                    }

                    resolve(obj);
                  }

                  if (c.toBlob) {
                    c.toBlob(function (blob) {
                      bloburl = createObjectURL(blob);
                      done();
                    }, mimeType, quality);
                    return;
                  }

                  bloburl = dataURLToObjectURL(datauri);
                  done();
                }));

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x4, _x5, _x6) {
        return _ref5.apply(this, arguments);
      };
    }();
    /**
     * @external jsPDF
     */

    /**
     * @typedef {void|"save"|"arraybuffer"|"blob"|"datauristring"|"dataurlstring"|"dataurlnewwindow"|"datauri"|"dataurl"} external:jsPDF.OutputType
     * @todo Newer version to add also allows these `outputType` values "bloburi"|"bloburl" which return strings, so document here and for `outputType` of `module:svgcanvas.PDFExportedResults` below if added
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.PDFExportedResults
    * @property {string} svg The SVG PDF output
    * @property {string|ArrayBuffer|Blob|window} output The output based on the `outputType`;
    * if `undefined`, "datauristring", "dataurlstring", "datauri",
    * or "dataurl", will be a string (`undefined` gives a document, while the others
    * build as Data URLs; "datauri" and "dataurl" change the location of the current page); if
    * "arraybuffer", will return `ArrayBuffer`; if "blob", returns a `Blob`;
    * if "dataurlnewwindow", will change the current page's location and return a string
    * if in Safari and no window object is found; otherwise opens in, and returns, a new `window`
    * object; if "save", will have the same return as "dataurlnewwindow" if
    * `navigator.getUserMedia` support is found without `URL.createObjectURL` support; otherwise
    * returns `undefined` but attempts to save
    * @property {external:jsPDF.OutputType} outputType
    * @property {string[]} issues The human-readable localization messages of corresponding `issueCodes`
    * @property {module:svgcanvas.IssueCode[]} issueCodes
    * @property {string} exportWindowName
    */

    /**
    * Generates a PDF based on the current image, then calls "exportedPDF" with
    * an object including the string, the data URL, and any issues found.
    * @function module:svgcanvas.SvgCanvas#exportPDF
    * @param {string} [exportWindowName] Will also be used for the download file name here
    * @param {external:jsPDF.OutputType} [outputType="dataurlstring"]
    * @fires module:svgcanvas.SvgCanvas#event:exportedPDF
    * @returns {Promise<module:svgcanvas.PDFExportedResults>} Resolves to {@link module:svgcanvas.PDFExportedResults}
    */


    this.exportPDF =
    /*#__PURE__*/
    function () {
      var _ref7 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(exportWindowName) {
        var outputType,
            modularVersion,
            res,
            orientation,
            unit,
            doc,
            docTitle,
            _getIssues2,
            issues,
            issueCodes,
            svg,
            obj,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                outputType = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : isChrome() ? 'save' : undefined;

                if (window.jsPDF) {
                  _context3.next = 7;
                  break;
                }

                _context3.next = 4;
                return importScript([// We do not currently have these paths configurable as they are
                //   currently global-only, so not Rolled-up
                'jspdf/underscore-min.js', 'jspdf/jspdf.min.js']);

              case 4:
                modularVersion = !('svgEditor' in window) || !window.svgEditor || window.svgEditor.modules !== false; // Todo: Switch to `import()` when widely supported and available (also allow customization of path)

                _context3.next = 7;
                return importScript(curConfig.jspdfPath + 'jspdf.plugin.svgToPdf.js', {
                  type: modularVersion ? 'module' : 'text/javascript'
                });

              case 7:
                res = getResolution();
                orientation = res.w > res.h ? 'landscape' : 'portrait';
                unit = 'pt'; // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for export purposes
                // Todo: Give options to use predefined jsPDF formats like "a4", etc. from pull-down (with option to keep customizable)

                doc = jsPDF({
                  orientation: orientation,
                  unit: unit,
                  format: [res.w, res.h] // , compressPdf: true

                });
                docTitle = getDocumentTitle();
                doc.setProperties({
                  title: docTitle
                  /* ,
                  subject: '',
                  author: '',
                  keywords: '',
                  creator: '' */

                });
                _getIssues2 = getIssues(), issues = _getIssues2.issues, issueCodes = _getIssues2.issueCodes;
                svg = this.svgCanvasToString();
                doc.addSVG(svg, 0, 0); // doc.output('save'); // Works to open in a new
                //  window; todo: configure this and other export
                //  options to optionally work in this manner as
                //  opposed to opening a new tab

                outputType = outputType || 'dataurlstring';
                obj = {
                  svg: svg,
                  issues: issues,
                  issueCodes: issueCodes,
                  exportWindowName: exportWindowName,
                  outputType: outputType
                };
                obj.output = doc.output(outputType, outputType === 'save' ? exportWindowName || 'svg.pdf' : undefined);
                call('exportedPDF', obj);
                return _context3.abrupt("return", obj);

              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x7) {
        return _ref7.apply(this, arguments);
      };
    }();
    /**
    * Returns the current drawing as raw SVG XML text.
    * @function module:svgcanvas.SvgCanvas#getSvgString
    * @returns {string} The current drawing as raw SVG XML text.
    */


    this.getSvgString = function () {
      saveOptions.apply = false;
      return this.svgCanvasToString();
    };
    /**
    * This function determines whether to use a nonce in the prefix, when
    * generating IDs for future documents in SVG-Edit.
    * If you're controlling SVG-Edit externally, and want randomized IDs, call
    * this BEFORE calling `svgCanvas.setSvgString`.
    * @function module:svgcanvas.SvgCanvas#randomizeIds
    * @param {boolean} [enableRandomization] If true, adds a nonce to the prefix. Thus
    * `svgCanvas.randomizeIds() <==> svgCanvas.randomizeIds(true)`
    * @returns {void}
    */


    this.randomizeIds = function (enableRandomization) {
      if (arguments.length > 0 && enableRandomization === false) {
        randomizeIds(false, getCurrentDrawing());
      } else {
        randomizeIds(true, getCurrentDrawing());
      }
    };
    /**
    * Ensure each element has a unique ID.
    * @function module:svgcanvas.SvgCanvas#uniquifyElems
    * @param {Element} g - The parent element of the tree to give unique IDs
    * @returns {void}
    */


    var uniquifyElems = this.uniquifyElems = function (g) {
      var ids = {}; // TODO: Handle markers and connectors. These are not yet re-identified properly
      // as their referring elements do not get remapped.
      //
      // <marker id='se_marker_end_svg_7'/>
      // <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
      //
      // Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
      // Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute

      var refElems = ['filter', 'linearGradient', 'pattern', 'radialGradient', 'symbol', 'textPath', 'use'];
      walkTree(g, function (n) {
        // if it's an element node
        if (n.nodeType === 1) {
          // and the element has an ID
          if (n.id) {
            // and we haven't tracked this ID yet
            if (!(n.id in ids)) {
              // add this id to our map
              ids[n.id] = {
                elem: null,
                attrs: [],
                hrefs: []
              };
            }

            ids[n.id].elem = n;
          } // now search for all attributes on this element that might refer
          // to other elements


          $$8.each(refAttrs, function (i, attr) {
            var attrnode = n.getAttributeNode(attr);

            if (attrnode) {
              // the incoming file has been sanitized, so we should be able to safely just strip off the leading #
              var url = getUrlFromAttr(attrnode.value),
                  refid = url ? url.substr(1) : null;

              if (refid) {
                if (!(refid in ids)) {
                  // add this id to our map
                  ids[refid] = {
                    elem: null,
                    attrs: [],
                    hrefs: []
                  };
                }

                ids[refid].attrs.push(attrnode);
              }
            }
          }); // check xlink:href now

          var href = getHref(n); // TODO: what if an <image> or <a> element refers to an element internally?

          if (href && refElems.includes(n.nodeName)) {
            var refid = href.substr(1);

            if (refid) {
              if (!(refid in ids)) {
                // add this id to our map
                ids[refid] = {
                  elem: null,
                  attrs: [],
                  hrefs: []
                };
              }

              ids[refid].hrefs.push(n);
            }
          }
        }
      }); // in ids, we now have a map of ids, elements and attributes, let's re-identify

      for (var oldid in ids) {
        if (!oldid) {
          continue;
        }

        var elem = ids[oldid].elem;

        if (elem) {
          var newid = getNextId(); // assign element its new id

          elem.id = newid; // remap all url() attributes

          var attrs = ids[oldid].attrs;
          var j = attrs.length;

          while (j--) {
            var attr = attrs[j];
            attr.ownerElement.setAttribute(attr.name, 'url(#' + newid + ')');
          } // remap all href attributes


          var hreffers = ids[oldid].hrefs;
          var k = hreffers.length;

          while (k--) {
            var hreffer = hreffers[k];
            setHref(hreffer, '#' + newid);
          }
        }
      }
    };
    /**
    * Assigns reference data for each use element.
    * @function module:svgcanvas.SvgCanvas#setUseData
    * @param {Element} parent
    * @returns {void}
    */


    var setUseData = this.setUseData = function (parent) {
      var elems = $$8(parent);

      if (parent.tagName !== 'use') {
        elems = elems.find('use');
      }

      elems.each(function () {
        var id = getHref(this).substr(1);
        var refElem = getElem(id);

        if (!refElem) {
          return;
        }

        $$8(this).data('ref', refElem);

        if (refElem.tagName === 'symbol' || refElem.tagName === 'svg') {
          $$8(this).data('symbol', refElem).data('ref', refElem);
        }
      });
    };
    /**
    * Converts gradients from userSpaceOnUse to objectBoundingBox.
    * @function module:svgcanvas.SvgCanvas#convertGradients
    * @param {Element} elem
    * @returns {void}
    */


    var convertGradients = this.convertGradients = function (elem) {
      var elems = $$8(elem).find('linearGradient, radialGradient');

      if (!elems.length && isWebkit()) {
        // Bug in webkit prevents regular *Gradient selector search
        elems = $$8(elem).find('*').filter(function () {
          return this.tagName.includes('Gradient');
        });
      }

      elems.each(function () {
        var grad = this; // eslint-disable-line consistent-this

        if ($$8(grad).attr('gradientUnits') === 'userSpaceOnUse') {
          // TODO: Support more than one element with this ref by duplicating parent grad
          var fillStrokeElems = $$8(svgcontent).find('[fill="url(#' + grad.id + ')"],[stroke="url(#' + grad.id + ')"]');

          if (!fillStrokeElems.length) {
            return;
          } // get object's bounding box


          var bb = getBBox(fillStrokeElems[0]); // This will occur if the element is inside a <defs> or a <symbol>,
          // in which we shouldn't need to convert anyway.

          if (!bb) {
            return;
          }

          if (grad.tagName === 'linearGradient') {
            var gCoords = $$8(grad).attr(['x1', 'y1', 'x2', 'y2']); // If has transform, convert

            var tlist = grad.gradientTransform.baseVal;

            if (tlist && tlist.numberOfItems > 0) {
              var m = transformListToTransform(tlist).matrix;
              var pt1 = transformPoint(gCoords.x1, gCoords.y1, m);
              var pt2 = transformPoint(gCoords.x2, gCoords.y2, m);
              gCoords.x1 = pt1.x;
              gCoords.y1 = pt1.y;
              gCoords.x2 = pt2.x;
              gCoords.y2 = pt2.y;
              grad.removeAttribute('gradientTransform');
            }

            $$8(grad).attr({
              x1: (gCoords.x1 - bb.x) / bb.width,
              y1: (gCoords.y1 - bb.y) / bb.height,
              x2: (gCoords.x2 - bb.x) / bb.width,
              y2: (gCoords.y2 - bb.y) / bb.height
            });
            grad.removeAttribute('gradientUnits');
          } // else {
          //   Note: radialGradient elements cannot be easily converted
          //   because userSpaceOnUse will keep circular gradients, while
          //   objectBoundingBox will x/y scale the gradient according to
          //   its bbox.
          //
          //   For now we'll do nothing, though we should probably have
          //   the gradient be updated as the element is moved, as
          //   inkscape/illustrator do.
          //
          //   const gCoords = $(grad).attr(['cx', 'cy', 'r']);
          //
          //   $(grad).attr({
          //     cx: (gCoords.cx - bb.x) / bb.width,
          //     cy: (gCoords.cy - bb.y) / bb.height,
          //     r: gCoords.r
          //   });
          //
          //   grad.removeAttribute('gradientUnits');
          // }

        }
      });
    };
    /**
    * Converts selected/given `<use>` or child SVG element to a group.
    * @function module:svgcanvas.SvgCanvas#convertToGroup
    * @param {Element} elem
    * @fires module:svgcanvas.SvgCanvas#event:selected
    * @returns {void}
    */


    var convertToGroup = this.convertToGroup = function (elem) {
      if (!elem) {
        elem = selectedElements[0];
      }

      var $elem = $$8(elem);
      var batchCmd = new BatchCommand$1();
      var ts;

      if ($elem.data('gsvg')) {
        // Use the gsvg as the new group
        var svg = elem.firstChild;
        var pt = $$8(svg).attr(['x', 'y']);
        $$8(elem.firstChild.firstChild).unwrap();
        $$8(elem).removeData('gsvg');
        var tlist = getTransformList(elem);
        var xform = svgroot.createSVGTransform();
        xform.setTranslate(pt.x, pt.y);
        tlist.appendItem(xform);
        recalculateDimensions(elem);
        call('selected', [elem]);
      } else if ($elem.data('symbol')) {
        elem = $elem.data('symbol');
        ts = $elem.attr('transform');
        var pos = $elem.attr(['x', 'y']);
        var vb = elem.getAttribute('viewBox');

        if (vb) {
          var nums = vb.split(' ');
          pos.x -= Number(nums[0]);
          pos.y -= Number(nums[1]);
        } // Not ideal, but works


        ts += ' translate(' + (pos.x || 0) + ',' + (pos.y || 0) + ')';
        var prev = $elem.prev(); // Remove <use> element

        batchCmd.addSubCommand(new RemoveElementCommand$1($elem[0], $elem[0].nextSibling, $elem[0].parentNode));
        $elem.remove(); // See if other elements reference this symbol

        var hasMore = $$8(svgcontent).find('use:data(symbol)').length;
        var g = svgdoc.createElementNS(NS.SVG, 'g');
        var childs = elem.childNodes;
        var i;

        for (i = 0; i < childs.length; i++) {
          g.append(childs[i].cloneNode(true));
        } // Duplicate the gradients for Gecko, since they weren't included in the <symbol>


        if (isGecko()) {
          var dupeGrads = $$8(findDefs()).children('linearGradient,radialGradient,pattern').clone();
          $$8(g).append(dupeGrads);
        }

        if (ts) {
          g.setAttribute('transform', ts);
        }

        var parent = elem.parentNode;
        uniquifyElems(g); // Put the dupe gradients back into <defs> (after uniquifying them)

        if (isGecko()) {
          $$8(findDefs()).append($$8(g).find('linearGradient,radialGradient,pattern'));
        } // now give the g itself a new id


        g.id = getNextId();
        prev.after(g);

        if (parent) {
          if (!hasMore) {
            // remove symbol/svg element
            var _elem = elem,
                nextSibling = _elem.nextSibling;
            elem.remove();
            batchCmd.addSubCommand(new RemoveElementCommand$1(elem, nextSibling, parent));
          }

          batchCmd.addSubCommand(new InsertElementCommand$1(g));
        }

        setUseData(g);

        if (isGecko()) {
          convertGradients(findDefs());
        } else {
          convertGradients(g);
        } // recalculate dimensions on the top-level children so that unnecessary transforms
        // are removed


        walkTreePost(g, function (n) {
          try {
            recalculateDimensions(n);
          } catch (e) {
            console.log(e); // eslint-disable-line no-console
          }
        }); // Give ID for any visible element missing one

        $$8(g).find(visElems).each(function () {
          if (!this.id) {
            this.id = getNextId();
          }
        });
        selectOnly([g]);
        var cm = pushGroupProperties(g, true);

        if (cm) {
          batchCmd.addSubCommand(cm);
        }

        addCommandToHistory(batchCmd);
      } else {
        console.log('Unexpected element to ungroup:', elem); // eslint-disable-line no-console
      }
    };
    /**
    * This function sets the current drawing as the input SVG XML.
    * @function module:svgcanvas.SvgCanvas#setSvgString
    * @param {string} xmlString - The SVG as XML text.
    * @param {boolean} [preventUndo=false] - Indicates if we want to do the
    * changes without adding them to the undo stack - e.g. for initializing a
    * drawing on page load.
    * @fires module:svgcanvas.SvgCanvas#event:setnonce
    * @fires module:svgcanvas.SvgCanvas#event:unsetnonce
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {boolean} This function returns `false` if the set was
    *     unsuccessful, `true` otherwise.
    */


    this.setSvgString = function (xmlString, preventUndo) {
      try {
        // convert string into XML document
        var newDoc = text2xml(xmlString);

        if (newDoc.firstElementChild && newDoc.firstElementChild.namespaceURI !== NS.SVG) {
          return false;
        }

        this.prepareSvg(newDoc);
        var batchCmd = new BatchCommand$1('Change Source'); // remove old svg document

        var _svgcontent = svgcontent,
            nextSibling = _svgcontent.nextSibling;
        var oldzoom = svgroot.removeChild(svgcontent);
        batchCmd.addSubCommand(new RemoveElementCommand$1(oldzoom, nextSibling, svgroot)); // set new svg document
        // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()

        if (svgdoc.adoptNode) {
          svgcontent = svgdoc.adoptNode(newDoc.documentElement);
        } else {
          svgcontent = svgdoc.importNode(newDoc.documentElement, true);
        }

        svgroot.append(svgcontent);
        var content = $$8(svgcontent);
        canvas.current_drawing_ = new Drawing(svgcontent, idprefix); // retrieve or set the nonce

        var nonce = getCurrentDrawing().getNonce();

        if (nonce) {
          call('setnonce', nonce);
        } else {
          call('unsetnonce');
        } // change image href vals if possible


        content.find('image').each(function () {
          var image = this; // eslint-disable-line consistent-this

          preventClickDefault(image);
          var val = getHref(this);

          if (val) {
            if (val.startsWith('data:')) {
              // Check if an SVG-edit data URI
              var m = val.match(_wrapRegExp(/svgedit_url=(.*?);/, {
                url: 1
              }));

              if (m) {
                var url = decodeURIComponent(m.groups.url);
                $$8(new Image()).load(function () {
                  image.setAttributeNS(NS.XLINK, 'xlink:href', url);
                }).attr('src', url);
              }
            } // Add to encodableImages if it loads


            canvas.embedImage(val);
          }
        }); // Wrap child SVGs in group elements

        content.find('svg').each(function () {
          // Skip if it's in a <defs>
          if ($$8(this).closest('defs').length) {
            return;
          }

          uniquifyElems(this); // Check if it already has a gsvg group

          var pa = this.parentNode;

          if (pa.childNodes.length === 1 && pa.nodeName === 'g') {
            $$8(pa).data('gsvg', this);
            pa.id = pa.id || getNextId();
          } else {
            groupSvgElem(this);
          }
        }); // For Firefox: Put all paint elems in defs

        if (isGecko()) {
          content.find('linearGradient, radialGradient, pattern').appendTo(findDefs());
        } // Set ref element for <use> elements
        // TODO: This should also be done if the object is re-added through "redo"


        setUseData(content);
        convertGradients(content[0]);
        var attrs = {
          id: 'svgcontent',
          overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden'
        };
        var percs = false; // determine proper size

        if (content.attr('viewBox')) {
          var vb = content.attr('viewBox').split(' ');
          attrs.width = vb[2];
          attrs.height = vb[3]; // handle content that doesn't have a viewBox
        } else {
          $$8.each(['width', 'height'], function (i, dim) {
            // Set to 100 if not given
            var val = content.attr(dim) || '100%';

            if (String(val).substr(-1) === '%') {
              // Use user units if percentage given
              percs = true;
            } else {
              attrs[dim] = convertToNum(dim, val);
            }
          });
        } // identify layers


        identifyLayers(); // Give ID for any visible layer children missing one

        content.children().find(visElems).each(function () {
          if (!this.id) {
            this.id = getNextId();
          }
        }); // Percentage width/height, so let's base it on visible elements

        if (percs) {
          var bb = getStrokedBBoxDefaultVisible();
          attrs.width = bb.width + bb.x;
          attrs.height = bb.height + bb.y;
        } // Just in case negative numbers are given or
        // result from the percs calculation


        if (attrs.width <= 0) {
          attrs.width = 100;
        }

        if (attrs.height <= 0) {
          attrs.height = 100;
        }

        content.attr(attrs);
        this.contentW = attrs.width;
        this.contentH = attrs.height;
        batchCmd.addSubCommand(new InsertElementCommand$1(svgcontent)); // update root to the correct size

        var changes = content.attr(['width', 'height']);
        batchCmd.addSubCommand(new ChangeElementCommand$1(svgroot, changes)); // reset zoom

        currentZoom = 1; // reset transform lists

        resetListMap();
        clearSelection();
        clearData();
        svgroot.append(selectorManager.selectorParentGroup);
        if (!preventUndo) addCommandToHistory(batchCmd);
        call('changed', [svgcontent]);
      } catch (e) {
        console.log(e); // eslint-disable-line no-console

        return false;
      }

      return true;
    };
    /**
    * This function imports the input SVG XML as a `<symbol>` in the `<defs>`, then adds a
    * `<use>` to the current layer.
    * @function module:svgcanvas.SvgCanvas#importSvgString
    * @param {string} xmlString - The SVG as XML text.
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {null|Element} This function returns null if the import was unsuccessful, or the element otherwise.
    * @todo
    * - properly handle if namespace is introduced by imported content (must add to svgcontent
    * and update all prefixes in the imported node)
    * - properly handle recalculating dimensions, `recalculateDimensions()` doesn't handle
    * arbitrary transform lists, but makes some assumptions about how the transform list
    * was obtained
    */


    this.importSvgString = function (xmlString) {
      var j, ts, useEl;

      try {
        // Get unique ID
        var uid = encode64(xmlString.length + xmlString).substr(0, 32);
        var useExisting = false; // Look for symbol and make sure symbol exists in image

        if (importIds[uid]) {
          if ($$8(importIds[uid].symbol).parents('#svgroot').length) {
            useExisting = true;
          }
        }

        var batchCmd = new BatchCommand$1('Import Image');
        var symbol;

        if (useExisting) {
          symbol = importIds[uid].symbol;
          ts = importIds[uid].xform;
        } else {
          // convert string into XML document
          var newDoc = text2xml(xmlString);
          this.prepareSvg(newDoc); // import new svg document into our document

          var svg; // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()

          if (svgdoc.adoptNode) {
            svg = svgdoc.adoptNode(newDoc.documentElement);
          } else {
            svg = svgdoc.importNode(newDoc.documentElement, true);
          }

          uniquifyElems(svg);
          var innerw = convertToNum('width', svg.getAttribute('width')),
              innerh = convertToNum('height', svg.getAttribute('height')),
              innervb = svg.getAttribute('viewBox'),
              // if no explicit viewbox, create one out of the width and height
          vb = innervb ? innervb.split(' ') : [0, 0, innerw, innerh];

          for (j = 0; j < 4; ++j) {
            vb[j] = Number(vb[j]);
          } // TODO: properly handle preserveAspectRatio


          var // canvasw = +svgcontent.getAttribute('width'),
          canvash = Number(svgcontent.getAttribute('height')); // imported content should be 1/3 of the canvas on its largest dimension

          if (innerh > innerw) {
            ts = 'scale(' + canvash / 3 / vb[3] + ')';
          } else {
            ts = 'scale(' + canvash / 3 / vb[2] + ')';
          } // Hack to make recalculateDimensions understand how to scale


          ts = 'translate(0) ' + ts + ' translate(0)';
          symbol = svgdoc.createElementNS(NS.SVG, 'symbol');
          var defs = findDefs();

          if (isGecko()) {
            // Move all gradients into root for Firefox, workaround for this bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=353575
            // TODO: Make this properly undo-able.
            $$8(svg).find('linearGradient, radialGradient, pattern').appendTo(defs);
          }

          while (svg.firstChild) {
            var first = svg.firstChild;
            symbol.append(first);
          }

          var attrs = svg.attributes;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = attrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var attr = _step.value;
              // Ok for `NamedNodeMap`
              symbol.setAttribute(attr.nodeName, attr.value);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          symbol.id = getNextId(); // Store data

          importIds[uid] = {
            symbol: symbol,
            xform: ts
          };
          findDefs().append(symbol);
          batchCmd.addSubCommand(new InsertElementCommand$1(symbol));
        }

        useEl = svgdoc.createElementNS(NS.SVG, 'use');
        useEl.id = getNextId();
        setHref(useEl, '#' + symbol.id);
        (currentGroup || getCurrentDrawing().getCurrentLayer()).append(useEl);
        batchCmd.addSubCommand(new InsertElementCommand$1(useEl));
        clearSelection();
        useEl.setAttribute('transform', ts);
        recalculateDimensions(useEl);
        $$8(useEl).data('symbol', symbol).data('ref', symbol);
        addToSelection([useEl]); // TODO: Find way to add this in a recalculateDimensions-parsable way
        // if (vb[0] !== 0 || vb[1] !== 0) {
        //   ts = 'translate(' + (-vb[0]) + ',' + (-vb[1]) + ') ' + ts;
        // }

        addCommandToHistory(batchCmd);
        call('changed', [svgcontent]);
      } catch (e) {
        console.log(e); // eslint-disable-line no-console

        return null;
      } // we want to return the element so we can automatically select it


      return useEl;
    }; // Could deprecate, but besides external uses, their usage makes clear that
    //  canvas is a dependency for all of these


    var dr = {
      identifyLayers: identifyLayers,
      createLayer: createLayer,
      cloneLayer: cloneLayer,
      deleteCurrentLayer: deleteCurrentLayer,
      setCurrentLayer: setCurrentLayer,
      renameCurrentLayer: renameCurrentLayer,
      setCurrentLayerPosition: setCurrentLayerPosition,
      setLayerVisibility: setLayerVisibility,
      moveSelectedToLayer: moveSelectedToLayer,
      mergeLayer: mergeLayer,
      mergeAllLayers: mergeAllLayers,
      leaveContext: leaveContext,
      setContext: setContext
    };
    Object.entries(dr).forEach(function (_ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
          prop = _ref9[0],
          propVal = _ref9[1];

      canvas[prop] = propVal;
    });
    init$3(
    /**
    * @implements {module:draw.DrawCanvasInit}
    */
    {
      pathActions: pathActions$1,
      getCurrentGroup: function getCurrentGroup() {
        return currentGroup;
      },
      setCurrentGroup: function setCurrentGroup(cg) {
        currentGroup = cg;
      },
      getSelectedElements: getSelectedElements,
      getSVGContent: getSVGContent,
      undoMgr: undoMgr,
      elData: elData,
      getCurrentDrawing: getCurrentDrawing,
      clearSelection: clearSelection,
      call: call,
      addCommandToHistory: addCommandToHistory,

      /**
       * @fires module:svgcanvas.SvgCanvas#event:changed
       * @returns {void}
       */
      changeSVGContent: function changeSVGContent() {
        call('changed', [svgcontent]);
      }
    });
    /**
    * Group: Document functions
    */

    /**
    * Clears the current document. This is not an undoable action.
    * @function module:svgcanvas.SvgCanvas#clear
    * @fires module:svgcanvas.SvgCanvas#event:cleared
    * @returns {void}
    */

    this.clear = function () {
      pathActions$1.clear();
      clearSelection(); // clear the svgcontent node

      canvas.clearSvgContentElement(); // create new document

      canvas.current_drawing_ = new Drawing(svgcontent); // create empty first layer

      canvas.createLayer('Layer 1'); // clear the undo stack

      canvas.undoMgr.resetUndoStack(); // reset the selector manager

      selectorManager.initGroup(); // reset the rubber band box

      rubberBox = selectorManager.getRubberBandBox();
      call('cleared');
    }; // Alias function


    this.linkControlPoints = pathActions$1.linkControlPoints;
    /**
    * @function module:svgcanvas.SvgCanvas#getContentElem
    * @returns {Element} The content DOM element
    */

    this.getContentElem = function () {
      return svgcontent;
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getRootElem
    * @returns {SVGSVGElement} The root DOM element
    */


    this.getRootElem = function () {
      return svgroot;
    };
    /**
    * @typedef {PlainObject} DimensionsAndZoom
    * @property {Float} w Width
    * @property {Float} h Height
    * @property {Float} zoom Zoom
    */

    /**
    * @function module:svgcanvas.SvgCanvas#getResolution
    * @returns {DimensionsAndZoom} The current dimensions and zoom level in an object
    */


    var getResolution = this.getResolution = function () {
      //    const vb = svgcontent.getAttribute('viewBox').split(' ');
      //    return {w:vb[2], h:vb[3], zoom: currentZoom};
      var w = svgcontent.getAttribute('width') / currentZoom;
      var h = svgcontent.getAttribute('height') / currentZoom;
      return {
        w: w,
        h: h,
        zoom: currentZoom
      };
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getSnapToGrid
    * @returns {boolean} The current snap to grid setting
    */


    this.getSnapToGrid = function () {
      return curConfig.gridSnapping;
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getVersion
    * @returns {string} A string which describes the revision number of SvgCanvas.
    */


    this.getVersion = function () {
      return 'svgcanvas.js ($Rev$)';
    };
    /**
    * Update interface strings with given values.
    * @function module:svgcanvas.SvgCanvas#setUiStrings
    * @param {module:path.uiStrings} strs - Object with strings (see the [locales API]{@link module:locale.LocaleStrings} and the [tutorial]{@tutorial LocaleDocs})
    * @returns {void}
    */


    this.setUiStrings = function (strs) {
      Object.assign(uiStrings, strs.notification);
      $$8 = jQueryPluginDBox($$8, strs.common);
      setUiStrings(strs);
    };
    /**
    * Update configuration options with given values.
    * @function module:svgcanvas.SvgCanvas#setConfig
    * @param {module:SVGEditor.Config} opts - Object with options
    * @returns {void}
    */


    this.setConfig = function (opts) {
      Object.assign(curConfig, opts);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getTitle
    * @param {Element} [elem]
    * @returns {string|void} the current group/SVG's title contents or
    * `undefined` if no element is passed nd there are no selected elements.
    */


    this.getTitle = function (elem) {
      elem = elem || selectedElements[0];

      if (!elem) {
        return undefined;
      }

      elem = $$8(elem).data('gsvg') || $$8(elem).data('symbol') || elem;
      var childs = elem.childNodes;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = childs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var child = _step2.value;

          if (child.nodeName === 'title') {
            return child.textContent;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return '';
    };
    /**
    * Sets the group/SVG's title content.
    * @function module:svgcanvas.SvgCanvas#setGroupTitle
    * @param {string} val
    * @todo Combine this with `setDocumentTitle`
    * @returns {void}
    */


    this.setGroupTitle = function (val) {
      var elem = selectedElements[0];
      elem = $$8(elem).data('gsvg') || elem;
      var ts = $$8(elem).children('title');
      var batchCmd = new BatchCommand$1('Set Label');
      var title;

      if (!val.length) {
        // Remove title element
        var tsNextSibling = ts.nextSibling;
        batchCmd.addSubCommand(new RemoveElementCommand$1(ts[0], tsNextSibling, elem));
        ts.remove();
      } else if (ts.length) {
        // Change title contents
        title = ts[0];
        batchCmd.addSubCommand(new ChangeElementCommand$1(title, {
          '#text': title.textContent
        }));
        title.textContent = val;
      } else {
        // Add title element
        title = svgdoc.createElementNS(NS.SVG, 'title');
        title.textContent = val;
        $$8(elem).prepend(title);
        batchCmd.addSubCommand(new InsertElementCommand$1(title));
      }

      addCommandToHistory(batchCmd);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getDocumentTitle
    * @returns {string|void} The current document title or an empty string if not found
    */


    var getDocumentTitle = this.getDocumentTitle = function () {
      return canvas.getTitle(svgcontent);
    };
    /**
    * Adds/updates a title element for the document with the given name.
    * This is an undoable action.
    * @function module:svgcanvas.SvgCanvas#setDocumentTitle
    * @param {string} newTitle - String with the new title
    * @returns {void}
    */


    this.setDocumentTitle = function (newTitle) {
      var childs = svgcontent.childNodes;
      var docTitle = false,
          oldTitle = '';
      var batchCmd = new BatchCommand$1('Change Image Title');
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = childs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var child = _step3.value;

          if (child.nodeName === 'title') {
            docTitle = child;
            oldTitle = docTitle.textContent;
            break;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (!docTitle) {
        docTitle = svgdoc.createElementNS(NS.SVG, 'title');
        svgcontent.insertBefore(docTitle, svgcontent.firstChild); // svgcontent.firstChild.before(docTitle); // Ok to replace above with this?
      }

      if (newTitle.length) {
        docTitle.textContent = newTitle;
      } else {
        // No title given, so element is not necessary
        docTitle.remove();
      }

      batchCmd.addSubCommand(new ChangeElementCommand$1(docTitle, {
        '#text': oldTitle
      }));
      addCommandToHistory(batchCmd);
    };
    /**
    * Returns the editor's namespace URL, optionally adding it to the root element.
    * @function module:svgcanvas.SvgCanvas#getEditorNS
    * @param {boolean} [add] - Indicates whether or not to add the namespace value
    * @returns {string} The editor's namespace URL
    */


    this.getEditorNS = function (add) {
      if (add) {
        svgcontent.setAttribute('xmlns:se', NS.SE);
      }

      return NS.SE;
    };
    /**
    * Changes the document's dimensions to the given size.
    * @function module:svgcanvas.SvgCanvas#setResolution
    * @param {Float|"fit"} x - Number with the width of the new dimensions in user units.
    * Can also be the string "fit" to indicate "fit to content".
    * @param {Float} y - Number with the height of the new dimensions in user units.
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {boolean} Indicates if resolution change was successful.
    * It will fail on "fit to content" option with no content to fit to.
    */


    this.setResolution = function (x, y) {
      var res = getResolution();
      var w = res.w,
          h = res.h;
      var batchCmd;

      if (x === 'fit') {
        // Get bounding box
        var bbox = getStrokedBBoxDefaultVisible();

        if (bbox) {
          batchCmd = new BatchCommand$1('Fit Canvas to Content');
          var visEls = getVisibleElements();
          addToSelection(visEls);
          var dx = [],
              dy = [];
          $$8.each(visEls, function (i, item) {
            dx.push(bbox.x * -1);
            dy.push(bbox.y * -1);
          });
          var cmd = canvas.moveSelectedElements(dx, dy, true);
          batchCmd.addSubCommand(cmd);
          clearSelection();
          x = Math.round(bbox.width);
          y = Math.round(bbox.height);
        } else {
          return false;
        }
      }

      if (x !== w || y !== h) {
        if (!batchCmd) {
          batchCmd = new BatchCommand$1('Change Image Dimensions');
        }

        x = convertToNum('width', x);
        y = convertToNum('height', y);
        svgcontent.setAttribute('width', x);
        svgcontent.setAttribute('height', y);
        this.contentW = x;
        this.contentH = y;
        batchCmd.addSubCommand(new ChangeElementCommand$1(svgcontent, {
          width: w,
          height: h
        }));
        svgcontent.setAttribute('viewBox', [0, 0, x / currentZoom, y / currentZoom].join(' '));
        batchCmd.addSubCommand(new ChangeElementCommand$1(svgcontent, {
          viewBox: ['0 0', w, h].join(' ')
        }));
        addCommandToHistory(batchCmd);
        call('changed', [svgcontent]);
      }

      return true;
    };
    /**
    * @typedef {module:jQueryAttr.Attributes} module:svgcanvas.ElementPositionInCanvas
    * @property {Float} x
    * @property {Float} y
    */

    /**
    * @function module:svgcanvas.SvgCanvas#getOffset
    * @returns {module:svgcanvas.ElementPositionInCanvas} An object with `x`, `y` values indicating the svgcontent element's
    * position in the editor's canvas.
    */


    this.getOffset = function () {
      return $$8(svgcontent).attr(['x', 'y']);
    };
    /**
     * @typedef {PlainObject} module:svgcanvas.ZoomAndBBox
     * @property {Float} zoom
     * @property {module:utilities.BBoxObject} bbox
     */

    /**
    * Sets the zoom level on the canvas-side based on the given value.
    * @function module:svgcanvas.SvgCanvas#setBBoxZoom
    * @param {"selection"|"canvas"|"content"|"layer"|module:SVGEditor.BBoxObjectWithFactor} val - Bounding box object to zoom to or string indicating zoom option. Note: the object value type is defined in `svg-editor.js`
    * @param {Integer} editorW - The editor's workarea box's width
    * @param {Integer} editorH - The editor's workarea box's height
    * @returns {module:svgcanvas.ZoomAndBBox|void}
    */


    this.setBBoxZoom = function (val, editorW, editorH) {
      var spacer = 0.85;
      var bb;

      var calcZoom = function calcZoom(bb) {
        // eslint-disable-line no-shadow
        if (!bb) {
          return false;
        }

        var wZoom = Math.round(editorW / bb.width * 100 * spacer) / 100;
        var hZoom = Math.round(editorH / bb.height * 100 * spacer) / 100;
        var zoom = Math.min(wZoom, hZoom);
        canvas.setZoom(zoom);
        return {
          zoom: zoom,
          bbox: bb
        };
      };

      if (_typeof(val) === 'object') {
        bb = val;

        if (bb.width === 0 || bb.height === 0) {
          var newzoom = bb.zoom ? bb.zoom : currentZoom * bb.factor;
          canvas.setZoom(newzoom);
          return {
            zoom: currentZoom,
            bbox: bb
          };
        }

        return calcZoom(bb);
      }

      switch (val) {
        case 'selection':
          {
            if (!selectedElements[0]) {
              return undefined;
            }

            var selectedElems = $$8.map(selectedElements, function (n) {
              if (n) {
                return n;
              }

              return undefined;
            });
            bb = getStrokedBBoxDefaultVisible(selectedElems);
            break;
          }

        case 'canvas':
          {
            var res = getResolution();
            spacer = 0.95;
            bb = {
              width: res.w,
              height: res.h,
              x: 0,
              y: 0
            };
            break;
          }

        case 'content':
          bb = getStrokedBBoxDefaultVisible();
          break;

        case 'layer':
          bb = getStrokedBBoxDefaultVisible(getVisibleElements(getCurrentDrawing().getCurrentLayer()));
          break;

        default:
          return undefined;
      }

      return calcZoom(bb);
    };
    /**
    * The zoom level has changed. Supplies the new zoom level as a number (not percentage).
    * @event module:svgcanvas.SvgCanvas#event:ext_zoomChanged
    * @type {Float}
    */

    /**
    * The bottom panel was updated
    * @event module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate
    * @type {PlainObject}
    * @property {boolean} nofill Indicates fill is disabled
    * @property {boolean} nostroke Indicates stroke is disabled
    */

    /**
    * The element selection has changed (elements were added/removed from selection)
    * @event module:svgcanvas.SvgCanvas#event:ext_selectedChanged
    * @type {PlainObject}
    * @property {Element[]} elems Array of the newly selected elements
    * @property {Element|null} selectedElement The single selected element
    * @property {boolean} multiselected Indicates whether one or more elements were selected
    */

    /**
    * Called when part of element is in process of changing, generally on
    * mousemove actions like rotate, move, etc.
    * @event module:svgcanvas.SvgCanvas#event:ext_elementTransition
    * @type {PlainObject}
    * @property {Element[]} elems Array of transitioning elements
    */

    /**
    * One or more elements were changed
    * @event module:svgcanvas.SvgCanvas#event:ext_elementChanged
    * @type {PlainObject}
    * @property {Element[]} elems Array of the affected elements
    */

    /**
    * Invoked as soon as the locale is ready
    * @event module:svgcanvas.SvgCanvas#event:ext_langReady
    * @type {PlainObject}
    * @property {string} lang The two-letter language code
    * @property {module:SVGEditor.uiStrings} uiStrings
    * @property {module:SVGEditor~ImportLocale} importLocale
    */

    /**
    * The language was changed. Two-letter code of the new language.
    * @event module:svgcanvas.SvgCanvas#event:ext_langChanged
    * @type {string}
    */

    /**
    * Means for an extension to add locale data. The two-letter language code.
    * @event module:svgcanvas.SvgCanvas#event:ext_addLangData
    * @type {PlainObject}
    * @property {string} lang
    * @property {module:SVGEditor~ImportLocale} importLocale
    */

    /**
     * Called when new image is created
     * @event module:svgcanvas.SvgCanvas#event:ext_onNewDocument
     * @type {void}
     */

    /**
     * Called when sidepanel is resized or toggled
     * @event module:svgcanvas.SvgCanvas#event:ext_workareaResized
     * @type {void}
    */

    /**
     * Called upon addition of the extension, or, if svgicons are set,
     * after the icons are ready when extension SVG icons have loaded.
     * @event module:svgcanvas.SvgCanvas#event:ext_callback
     * @type {void}
    */

    /**
    * Sets the zoom to the given level.
    * @function module:svgcanvas.SvgCanvas#setZoom
    * @param {Float} zoomLevel - Float indicating the zoom level to change to
    * @fires module:svgcanvas.SvgCanvas#event:ext_zoomChanged
    * @returns {void}
    */


    this.setZoom = function (zoomLevel) {
      var res = getResolution();
      svgcontent.setAttribute('viewBox', '0 0 ' + res.w / zoomLevel + ' ' + res.h / zoomLevel);
      currentZoom = zoomLevel;
      $$8.each(selectedElements, function (i, elem) {
        if (!elem) {
          return;
        }

        selectorManager.requestSelector(elem).resize();
      });
      pathActions$1.zoomChange();
      runExtensions('zoomChanged',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_zoomChanged} */
      zoomLevel);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getMode
    * @returns {string} The current editor mode string
    */


    this.getMode = function () {
      return currentMode;
    };
    /**
    * Sets the editor's mode to the given string.
    * @function module:svgcanvas.SvgCanvas#setMode
    * @param {string} name - String with the new mode to change to
    * @returns {void}
    */


    this.setMode = function (name) {
      pathActions$1.clear(true);
      textActions.clear();
      curProperties = selectedElements[0] && selectedElements[0].nodeName === 'text' ? curText : curShape;
      currentMode = name;
    };
    /**
    * Group: Element Styling
    */

    /**
    * @typedef {PlainObject} module:svgcanvas.PaintOptions
    * @property {"solidColor"} type
    */

    /**
    * @function module:svgcanvas.SvgCanvas#getColor
    * @param {string} type
    * @returns {string|module:svgcanvas.PaintOptions|Float|module:jGraduate~Paint} The current fill/stroke option
    */


    this.getColor = function (type) {
      return curProperties[type];
    };
    /**
    * Change the current stroke/fill color/gradient value.
    * @function module:svgcanvas.SvgCanvas#setColor
    * @param {string} type - String indicating fill or stroke
    * @param {string} val - The value to set the stroke attribute to
    * @param {boolean} preventUndo - Boolean indicating whether or not this should be an undoable option
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setColor = function (type, val, preventUndo) {
      curShape[type] = val;
      curProperties[type + '_paint'] = {
        type: 'solidColor'
      };
      var elems = [];
      /**
       *
       * @param {Element} e
       * @returns {void}
       */

      function addNonG(e) {
        if (e.nodeName !== 'g') {
          elems.push(e);
        }
      }

      var i = selectedElements.length;

      while (i--) {
        var elem = selectedElements[i];

        if (elem) {
          if (elem.tagName === 'g') {
            walkTree(elem, addNonG);
          } else if (type === 'fill') {
            if (elem.tagName !== 'polyline' && elem.tagName !== 'line') {
              elems.push(elem);
            }
          } else {
            elems.push(elem);
          }
        }
      }

      if (elems.length > 0) {
        if (!preventUndo) {
          changeSelectedAttribute(type, val, elems);
          call('changed', elems);
        } else {
          changeSelectedAttributeNoUndo(type, val, elems);
        }
      }
    };
    /**
    * Apply the current gradient to selected element's fill or stroke.
    * @function module:svgcanvas.SvgCanvas#setGradient
    * @param {"fill"|"stroke"} type - String indicating "fill" or "stroke" to apply to an element
    * @returns {void}
    */


    var setGradient = this.setGradient = function (type) {
      if (!curProperties[type + '_paint'] || curProperties[type + '_paint'].type === 'solidColor') {
        return;
      }

      var grad = canvas[type + 'Grad']; // find out if there is a duplicate gradient already in the defs

      var duplicateGrad = findDuplicateGradient(grad);
      var defs = findDefs(); // no duplicate found, so import gradient into defs

      if (!duplicateGrad) {
        // const origGrad = grad;
        grad = defs.appendChild(svgdoc.importNode(grad, true)); // get next id and set it on the grad

        grad.id = getNextId();
      } else {
        // use existing gradient
        grad = duplicateGrad;
      }

      canvas.setColor(type, 'url(#' + grad.id + ')');
    };
    /**
    * Check if exact gradient already exists.
    * @function module:svgcanvas~findDuplicateGradient
    * @param {SVGGradientElement} grad - The gradient DOM element to compare to others
    * @returns {SVGGradientElement} The existing gradient if found, `null` if not
    */


    var findDuplicateGradient = function findDuplicateGradient(grad) {
      var defs = findDefs();
      var existingGrads = $$8(defs).find('linearGradient, radialGradient');
      var i = existingGrads.length;
      var radAttrs = ['r', 'cx', 'cy', 'fx', 'fy'];

      while (i--) {
        var og = existingGrads[i];

        if (grad.tagName === 'linearGradient') {
          if (grad.getAttribute('x1') !== og.getAttribute('x1') || grad.getAttribute('y1') !== og.getAttribute('y1') || grad.getAttribute('x2') !== og.getAttribute('x2') || grad.getAttribute('y2') !== og.getAttribute('y2')) {
            continue;
          }
        } else {
          var _ret = function () {
            var gradAttrs = $$8(grad).attr(radAttrs);
            var ogAttrs = $$8(og).attr(radAttrs);
            var diff = false;
            $$8.each(radAttrs, function (j, attr) {
              if (gradAttrs[attr] !== ogAttrs[attr]) {
                diff = true;
              }
            });

            if (diff) {
              return "continue";
            }
          }();

          if (_ret === "continue") continue;
        } // else could be a duplicate, iterate through stops


        var stops = grad.getElementsByTagNameNS(NS.SVG, 'stop');
        var ostops = og.getElementsByTagNameNS(NS.SVG, 'stop');

        if (stops.length !== ostops.length) {
          continue;
        }

        var j = stops.length;

        while (j--) {
          var stop = stops[j];
          var ostop = ostops[j];

          if (stop.getAttribute('offset') !== ostop.getAttribute('offset') || stop.getAttribute('stop-opacity') !== ostop.getAttribute('stop-opacity') || stop.getAttribute('stop-color') !== ostop.getAttribute('stop-color')) {
            break;
          }
        }

        if (j === -1) {
          return og;
        }
      } // for each gradient in defs


      return null;
    };
    /**
    * Set a color/gradient to a fill/stroke.
    * @function module:svgcanvas.SvgCanvas#setPaint
    * @param {"fill"|"stroke"} type - String with "fill" or "stroke"
    * @param {module:jGraduate.jGraduatePaintOptions} paint - The jGraduate paint object to apply
    * @returns {void}
    */


    this.setPaint = function (type, paint) {
      // make a copy
      var p = new $$8.jGraduate.Paint(paint);
      this.setPaintOpacity(type, p.alpha / 100, true); // now set the current paint object

      curProperties[type + '_paint'] = p;

      switch (p.type) {
        case 'solidColor':
          this.setColor(type, p.solidColor !== 'none' ? '#' + p.solidColor : 'none');
          break;

        case 'linearGradient':
        case 'radialGradient':
          canvas[type + 'Grad'] = p[p.type];
          setGradient(type);
          break;
      }
    };
    /**
    * @function module:svgcanvas.SvgCanvas#setStrokePaint
    * @param {module:jGraduate~Paint} paint
    * @returns {void}
    */


    this.setStrokePaint = function (paint) {
      this.setPaint('stroke', paint);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#setFillPaint
    * @param {module:jGraduate~Paint} paint
    * @returns {void}
    */


    this.setFillPaint = function (paint) {
      this.setPaint('fill', paint);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getStrokeWidth
    * @returns {Float|string} The current stroke-width value
    */


    this.getStrokeWidth = function () {
      return curProperties.stroke_width;
    };
    /**
    * Sets the stroke width for the current selected elements.
    * When attempting to set a line's width to 0, this changes it to 1 instead.
    * @function module:svgcanvas.SvgCanvas#setStrokeWidth
    * @param {Float} val - A Float indicating the new stroke width value
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setStrokeWidth = function (val) {
      if (val === 0 && ['line', 'path'].includes(currentMode)) {
        canvas.setStrokeWidth(1);
        return;
      }

      curProperties.stroke_width = val;
      var elems = [];
      /**
       *
       * @param {Element} e
       * @returns {void}
       */

      function addNonG(e) {
        if (e.nodeName !== 'g') {
          elems.push(e);
        }
      }

      var i = selectedElements.length;

      while (i--) {
        var elem = selectedElements[i];

        if (elem) {
          if (elem.tagName === 'g') {
            walkTree(elem, addNonG);
          } else {
            elems.push(elem);
          }
        }
      }

      if (elems.length > 0) {
        changeSelectedAttribute('stroke-width', val, elems);
        call('changed', selectedElements);
      }
    };
    /**
    * Set the given stroke-related attribute the given value for selected elements.
    * @function module:svgcanvas.SvgCanvas#setStrokeAttr
    * @param {string} attr - String with the attribute name
    * @param {string|Float} val - String or number with the attribute value
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setStrokeAttr = function (attr, val) {
      curShape[attr.replace('-', '_')] = val;
      var elems = [];
      var i = selectedElements.length;

      while (i--) {
        var elem = selectedElements[i];

        if (elem) {
          if (elem.tagName === 'g') {
            walkTree(elem, function (e) {
              if (e.nodeName !== 'g') {
                elems.push(e);
              }
            });
          } else {
            elems.push(elem);
          }
        }
      }

      if (elems.length > 0) {
        changeSelectedAttribute(attr, val, elems);
        call('changed', selectedElements);
      }
    };
    /**
    * @typedef {PlainObject} module:svgcanvas.StyleOptions
    * @property {string} fill
    * @property {Float} fill_opacity
    * @property {string} stroke
    * @property {Float} stroke_width
    * @property {string} stroke_dasharray
    * @property {string} stroke_linejoin
    * @property {string} stroke_linecap
    * @property {Float} stroke_opacity
    * @property {Float} opacity
    */

    /**
    * @function module:svgcanvas.SvgCanvas#getStyle
    * @returns {module:svgcanvas.StyleOptions} current style options
    */


    this.getStyle = function () {
      return curShape;
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getOpacity
    * @returns {Float} the current opacity
    */


    this.getOpacity = getOpacity;
    /**
    * Sets the given opacity on the current selected elements.
    * @function module:svgcanvas.SvgCanvas#setOpacity
    * @param {string} val
    * @returns {void}
    */

    this.setOpacity = function (val) {
      curShape.opacity = val;
      changeSelectedAttribute('opacity', val);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getFillOpacity
    * @returns {Float} the current fill opacity
    */


    this.getFillOpacity = function () {
      return curShape.fill_opacity;
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getStrokeOpacity
    * @returns {string} the current stroke opacity
    */


    this.getStrokeOpacity = function () {
      return curShape.stroke_opacity;
    };
    /**
    * Sets the current fill/stroke opacity.
    * @function module:svgcanvas.SvgCanvas#setPaintOpacity
    * @param {string} type - String with "fill" or "stroke"
    * @param {Float} val - Float with the new opacity value
    * @param {boolean} preventUndo - Indicates whether or not this should be an undoable action
    * @returns {void}
    */


    this.setPaintOpacity = function (type, val, preventUndo) {
      curShape[type + '_opacity'] = val;

      if (!preventUndo) {
        changeSelectedAttribute(type + '-opacity', val);
      } else {
        changeSelectedAttributeNoUndo(type + '-opacity', val);
      }
    };
    /**
    * Gets the current fill/stroke opacity.
    * @function module:svgcanvas.SvgCanvas#getPaintOpacity
    * @param {"fill"|"stroke"} type - String with "fill" or "stroke"
    * @returns {Float} Fill/stroke opacity
    */


    this.getPaintOpacity = function (type) {
      return type === 'fill' ? this.getFillOpacity() : this.getStrokeOpacity();
    };
    /**
    * Gets the `stdDeviation` blur value of the given element.
    * @function module:svgcanvas.SvgCanvas#getBlur
    * @param {Element} elem - The element to check the blur value for
    * @returns {string} stdDeviation blur attribute value
    */


    this.getBlur = function (elem) {
      var val = 0; // const elem = selectedElements[0];

      if (elem) {
        var filterUrl = elem.getAttribute('filter');

        if (filterUrl) {
          var blur = getElem(elem.id + '_blur');

          if (blur) {
            val = blur.firstChild.getAttribute('stdDeviation');
          }
        }
      }

      return val;
    };

    (function () {
      var curCommand = null;
      var filter = null;
      var filterHidden = false;
      /**
      * Sets the `stdDeviation` blur value on the selected element without being undoable.
      * @function module:svgcanvas.SvgCanvas#setBlurNoUndo
      * @param {Float} val - The new `stdDeviation` value
      * @returns {void}
      */

      canvas.setBlurNoUndo = function (val) {
        if (!filter) {
          canvas.setBlur(val);
          return;
        }

        if (val === 0) {
          // Don't change the StdDev, as that will hide the element.
          // Instead, just remove the value for "filter"
          changeSelectedAttributeNoUndo('filter', '');
          filterHidden = true;
        } else {
          var elem = selectedElements[0];

          if (filterHidden) {
            changeSelectedAttributeNoUndo('filter', 'url(#' + elem.id + '_blur)');
          }

          if (isWebkit()) {
            // console.log('e', elem); // eslint-disable-line no-console
            elem.removeAttribute('filter');
            elem.setAttribute('filter', 'url(#' + elem.id + '_blur)');
          }

          changeSelectedAttributeNoUndo('stdDeviation', val, [filter.firstChild]);
          canvas.setBlurOffsets(filter, val);
        }
      };
      /**
       *
       * @returns {void}
       */


      function finishChange() {
        var bCmd = canvas.undoMgr.finishUndoableChange();
        curCommand.addSubCommand(bCmd);
        addCommandToHistory(curCommand);
        curCommand = null;
        filter = null;
      }
      /**
      * Sets the `x`, `y`, `width`, `height` values of the filter element in order to
      * make the blur not be clipped. Removes them if not neeeded.
      * @function module:svgcanvas.SvgCanvas#setBlurOffsets
      * @param {Element} filterElem - The filter DOM element to update
      * @param {Float} stdDev - The standard deviation value on which to base the offset size
      * @returns {void}
      */


      canvas.setBlurOffsets = function (filterElem, stdDev) {
        if (stdDev > 3) {
          // TODO: Create algorithm here where size is based on expected blur
          assignAttributes(filterElem, {
            x: '-50%',
            y: '-50%',
            width: '200%',
            height: '200%'
          }); // Removing these attributes hides text in Chrome (see Issue 579)
        } else if (!isWebkit()) {
          filterElem.removeAttribute('x');
          filterElem.removeAttribute('y');
          filterElem.removeAttribute('width');
          filterElem.removeAttribute('height');
        }
      };
      /**
      * Adds/updates the blur filter to the selected element.
      * @function module:svgcanvas.SvgCanvas#setBlur
      * @param {Float} val - Float with the new `stdDeviation` blur value
      * @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
      * @returns {void}
      */


      canvas.setBlur = function (val, complete) {
        if (curCommand) {
          finishChange();
          return;
        } // Looks for associated blur, creates one if not found


        var elem = selectedElements[0];
        var elemId = elem.id;
        filter = getElem(elemId + '_blur');
        val -= 0;
        var batchCmd = new BatchCommand$1(); // Blur found!

        if (filter) {
          if (val === 0) {
            filter = null;
          }
        } else {
          // Not found, so create
          var newblur = addSVGElementFromJson({
            element: 'feGaussianBlur',
            attr: {
              "in": 'SourceGraphic',
              stdDeviation: val
            }
          });
          filter = addSVGElementFromJson({
            element: 'filter',
            attr: {
              id: elemId + '_blur'
            }
          });
          filter.append(newblur);
          findDefs().append(filter);
          batchCmd.addSubCommand(new InsertElementCommand$1(filter));
        }

        var changes = {
          filter: elem.getAttribute('filter')
        };

        if (val === 0) {
          elem.removeAttribute('filter');
          batchCmd.addSubCommand(new ChangeElementCommand$1(elem, changes));
          return;
        }

        changeSelectedAttribute('filter', 'url(#' + elemId + '_blur)');
        batchCmd.addSubCommand(new ChangeElementCommand$1(elem, changes));
        canvas.setBlurOffsets(filter, val);
        curCommand = batchCmd;
        canvas.undoMgr.beginUndoableChange('stdDeviation', [filter ? filter.firstChild : null]);

        if (complete) {
          canvas.setBlurNoUndo(val);
          finishChange();
        }
      };
    })();
    /**
    * Check whether selected element is bold or not.
    * @function module:svgcanvas.SvgCanvas#getBold
    * @returns {boolean} Indicates whether or not element is bold
    */


    this.getBold = function () {
      // should only have one element selected
      var selected = selectedElements[0];

      if (!isNullish(selected) && selected.tagName === 'text' && isNullish(selectedElements[1])) {
        return selected.getAttribute('font-weight') === 'bold';
      }

      return false;
    };
    /**
    * Make the selected element bold or normal.
    * @function module:svgcanvas.SvgCanvas#setBold
    * @param {boolean} b - Indicates bold (`true`) or normal (`false`)
    * @returns {void}
    */


    this.setBold = function (b) {
      var selected = selectedElements[0];

      if (!isNullish(selected) && selected.tagName === 'text' && isNullish(selectedElements[1])) {
        changeSelectedAttribute('font-weight', b ? 'bold' : 'normal');
      }

      if (!selectedElements[0].textContent) {
        textActions.setCursor();
      }
    };
    /**
    * Check whether selected element is in italics or not.
    * @function module:svgcanvas.SvgCanvas#getItalic
    * @returns {boolean} Indicates whether or not element is italic
    */


    this.getItalic = function () {
      var selected = selectedElements[0];

      if (!isNullish(selected) && selected.tagName === 'text' && isNullish(selectedElements[1])) {
        return selected.getAttribute('font-style') === 'italic';
      }

      return false;
    };
    /**
    * Make the selected element italic or normal.
    * @function module:svgcanvas.SvgCanvas#setItalic
    * @param {boolean} i - Indicates italic (`true`) or normal (`false`)
    * @returns {void}
    */


    this.setItalic = function (i) {
      var selected = selectedElements[0];

      if (!isNullish(selected) && selected.tagName === 'text' && isNullish(selectedElements[1])) {
        changeSelectedAttribute('font-style', i ? 'italic' : 'normal');
      }

      if (!selectedElements[0].textContent) {
        textActions.setCursor();
      }
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getFontFamily
    * @returns {string} The current font family
    */


    this.getFontFamily = function () {
      return curText.font_family;
    };
    /**
    * Set the new font family.
    * @function module:svgcanvas.SvgCanvas#setFontFamily
    * @param {string} val - String with the new font family
    * @returns {void}
    */


    this.setFontFamily = function (val) {
      curText.font_family = val;
      changeSelectedAttribute('font-family', val);

      if (selectedElements[0] && !selectedElements[0].textContent) {
        textActions.setCursor();
      }
    };
    /**
    * Set the new font color.
    * @function module:svgcanvas.SvgCanvas#setFontColor
    * @param {string} val - String with the new font color
    * @returns {void}
    */


    this.setFontColor = function (val) {
      curText.fill = val;
      changeSelectedAttribute('fill', val);
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getFontColor
    * @returns {string} The current font color
    */


    this.getFontColor = function () {
      return curText.fill;
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getFontSize
    * @returns {Float} The current font size
    */


    this.getFontSize = function () {
      return curText.font_size;
    };
    /**
    * Applies the given font size to the selected element.
    * @function module:svgcanvas.SvgCanvas#setFontSize
    * @param {Float} val - Float with the new font size
    * @returns {void}
    */


    this.setFontSize = function (val) {
      curText.font_size = val;
      changeSelectedAttribute('font-size', val);

      if (!selectedElements[0].textContent) {
        textActions.setCursor();
      }
    };
    /**
    * @function module:svgcanvas.SvgCanvas#getText
    * @returns {string} The current text (`textContent`) of the selected element
    */


    this.getText = function () {
      var selected = selectedElements[0];

      if (isNullish(selected)) {
        return '';
      }

      return selected.textContent;
    };
    /**
    * Updates the text element with the given string.
    * @function module:svgcanvas.SvgCanvas#setTextContent
    * @param {string} val - String with the new text
    * @returns {void}
    */


    this.setTextContent = function (val) {
      changeSelectedAttribute('#text', val);
      textActions.init(val);
      textActions.setCursor();
    };
    /**
    * Sets the new image URL for the selected image element. Updates its size if
    * a new URL is given.
    * @function module:svgcanvas.SvgCanvas#setImageURL
    * @param {string} val - String with the image URL/path
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setImageURL = function (val) {
      var elem = selectedElements[0];

      if (!elem) {
        return;
      }

      var attrs = $$8(elem).attr(['width', 'height']);
      var setsize = !attrs.width || !attrs.height;
      var curHref = getHref(elem); // Do nothing if no URL change or size change

      if (curHref === val && !setsize) {
        return;
      }

      var batchCmd = new BatchCommand$1('Change Image URL');
      setHref(elem, val);
      batchCmd.addSubCommand(new ChangeElementCommand$1(elem, {
        '#href': curHref
      }));
      $$8(new Image()).load(function () {
        var changes = $$8(elem).attr(['width', 'height']);
        $$8(elem).attr({
          width: this.width,
          height: this.height
        });
        selectorManager.requestSelector(elem).resize();
        batchCmd.addSubCommand(new ChangeElementCommand$1(elem, changes));
        addCommandToHistory(batchCmd);
        call('changed', [elem]);
      }).attr('src', val);
    };
    /**
    * Sets the new link URL for the selected anchor element.
    * @function module:svgcanvas.SvgCanvas#setLinkURL
    * @param {string} val - String with the link URL/path
    * @returns {void}
    */


    this.setLinkURL = function (val) {
      var elem = selectedElements[0];

      if (!elem) {
        return;
      }

      if (elem.tagName !== 'a') {
        // See if parent is an anchor
        var parentsA = $$8(elem).parents('a');

        if (parentsA.length) {
          elem = parentsA[0];
        } else {
          return;
        }
      }

      var curHref = getHref(elem);

      if (curHref === val) {
        return;
      }

      var batchCmd = new BatchCommand$1('Change Link URL');
      setHref(elem, val);
      batchCmd.addSubCommand(new ChangeElementCommand$1(elem, {
        '#href': curHref
      }));
      addCommandToHistory(batchCmd);
    };
    /**
    * Sets the `rx` and `ry` values to the selected `rect` element
    * to change its corner radius.
    * @function module:svgcanvas.SvgCanvas#setRectRadius
    * @param {string|Float} val - The new radius
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.setRectRadius = function (val) {
      var selected = selectedElements[0];

      if (!isNullish(selected) && selected.tagName === 'rect') {
        var r = selected.getAttribute('rx');

        if (r !== String(val)) {
          selected.setAttribute('rx', val);
          selected.setAttribute('ry', val);
          addCommandToHistory(new ChangeElementCommand$1(selected, {
            rx: r,
            ry: r
          }, 'Radius'));
          call('changed', [selected]);
        }
      }
    };
    /**
    * Wraps the selected element(s) in an anchor element or converts group to one.
    * @function module:svgcanvas.SvgCanvas#makeHyperlink
    * @param {string} url
    * @returns {void}
    */


    this.makeHyperlink = function (url) {
      canvas.groupSelectedElements('a', url); // TODO: If element is a single "g", convert to "a"
      //  if (selectedElements.length > 1 && selectedElements[1]) {
    };
    /**
    * @function module:svgcanvas.SvgCanvas#removeHyperlink
    * @returns {void}
    */


    this.removeHyperlink = function () {
      canvas.ungroupSelectedElement();
    };
    /**
    * Group: Element manipulation
    */

    /**
    * Sets the new segment type to the selected segment(s).
    * @function module:svgcanvas.SvgCanvas#setSegType
    * @param {Integer} newType - New segment type. See {@link https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg} for list
    * @returns {void}
    */


    this.setSegType = function (newType) {
      pathActions$1.setSegType(newType);
    };
    /**
    * Convert selected element to a path, or get the BBox of an element-as-path.
    * @function module:svgcanvas.SvgCanvas#convertToPath
    * @todo (codedread): Remove the getBBox argument and split this function into two.
    * @param {Element} elem - The DOM element to be converted
    * @param {boolean} getBBox - Boolean on whether or not to only return the path's BBox
    * @returns {void|DOMRect|false|SVGPathElement|null} If the getBBox flag is true, the resulting path's bounding box object.
    * Otherwise the resulting path element is returned.
    */


    this.convertToPath = function (elem, getBBox) {
      if (isNullish(elem)) {
        var elems = selectedElements;
        $$8.each(elems, function (i, el) {
          if (el) {
            canvas.convertToPath(el);
          }
        });
        return undefined;
      }

      if (getBBox) {
        return getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions$1);
      } // TODO: Why is this applying attributes from curShape, then inside utilities.convertToPath it's pulling addition attributes from elem?
      // TODO: If convertToPath is called with one elem, curShape and elem are probably the same; but calling with multiple is a bug or cool feature.


      var attrs = {
        fill: curShape.fill,
        'fill-opacity': curShape.fill_opacity,
        stroke: curShape.stroke,
        'stroke-width': curShape.stroke_width,
        'stroke-dasharray': curShape.stroke_dasharray,
        'stroke-linejoin': curShape.stroke_linejoin,
        'stroke-linecap': curShape.stroke_linecap,
        'stroke-opacity': curShape.stroke_opacity,
        opacity: curShape.opacity,
        visibility: 'hidden'
      };
      return convertToPath(elem, attrs, addSVGElementFromJson, pathActions$1, clearSelection, addToSelection, hstry, addCommandToHistory);
    };
    /**
    * This function makes the changes to the elements. It does not add the change
    * to the history stack.
    * @param {string} attr - Attribute name
    * @param {string|Float} newValue - String or number with the new attribute value
    * @param {Element[]} elems - The DOM elements to apply the change to
    * @returns {void}
    */


    var changeSelectedAttributeNoUndo = function changeSelectedAttributeNoUndo(attr, newValue, elems) {
      if (currentMode === 'pathedit') {
        // Editing node
        pathActions$1.moveNode(attr, newValue);
      }

      elems = elems || selectedElements;
      var i = elems.length;
      var noXYElems = ['g', 'polyline', 'path']; // const goodGAttrs = ['transform', 'opacity', 'filter'];

      var _loop = function _loop() {
        var elem = elems[i];

        if (isNullish(elem)) {
          return "continue";
        } // Set x,y vals on elements that don't have them


        if ((attr === 'x' || attr === 'y') && noXYElems.includes(elem.tagName)) {
          var bbox = getStrokedBBoxDefaultVisible([elem]);
          var diffX = attr === 'x' ? newValue - bbox.x : 0;
          var diffY = attr === 'y' ? newValue - bbox.y : 0;
          canvas.moveSelectedElements(diffX * currentZoom, diffY * currentZoom, true);
          return "continue";
        } // only allow the transform/opacity/filter attribute to change on <g> elements, slightly hacky
        // TODO: FIXME: Missing statement body
        // if (elem.tagName === 'g' && goodGAttrs.includes(attr)) {}


        var oldval = attr === '#text' ? elem.textContent : elem.getAttribute(attr);

        if (isNullish(oldval)) {
          oldval = '';
        }

        if (oldval !== String(newValue)) {
          if (attr === '#text') {
            // const oldW = utilsGetBBox(elem).width;
            elem.textContent = newValue; // FF bug occurs on on rotated elements

            if (/rotate/.test(elem.getAttribute('transform'))) {
              elem = ffClone(elem);
            } // Hoped to solve the issue of moving text with text-anchor="start",
            // but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
            // const box = getBBox(elem), left = box.x, top = box.y, {width, height} = box,
            //   dx = width - oldW, dy = 0;
            // const angle = getRotationAngle(elem, true);
            // if (angle) {
            //   const r = Math.sqrt(dx * dx + dy * dy);
            //   const theta = Math.atan2(dy, dx) - angle;
            //   dx = r * Math.cos(theta);
            //   dy = r * Math.sin(theta);
            //
            //   elem.setAttribute('x', elem.getAttribute('x') - dx);
            //   elem.setAttribute('y', elem.getAttribute('y') - dy);
            // }

          } else if (attr === '#href') {
            setHref(elem, newValue);
          } else {
            elem.setAttribute(attr, newValue);
          } // Go into "select" mode for text changes
          // NOTE: Important that this happens AFTER elem.setAttribute() or else attributes like
          // font-size can get reset to their old value, ultimately by svgEditor.updateContextPanel(),
          // after calling textActions.toSelectMode() below


          if (currentMode === 'textedit' && attr !== '#text' && elem.textContent.length) {
            textActions.toSelectMode(elem);
          } // if (i === 0) {
          //   selectedBBoxes[0] = utilsGetBBox(elem);
          // }
          // Use the Firefox ffClone hack for text elements with gradients or
          // where other text attributes are changed.


          if (isGecko() && elem.nodeName === 'text' && /rotate/.test(elem.getAttribute('transform'))) {
            if (String(newValue).startsWith('url') || ['font-size', 'font-family', 'x', 'y'].includes(attr) && elem.textContent) {
              elem = ffClone(elem);
            }
          } // Timeout needed for Opera & Firefox
          // codedread: it is now possible for this function to be called with elements
          // that are not in the selectedElements array, we need to only request a
          // selector if the element is in that array


          if (selectedElements.includes(elem)) {
            setTimeout(function () {
              // Due to element replacement, this element may no longer
              // be part of the DOM
              if (!elem.parentNode) {
                return;
              }

              selectorManager.requestSelector(elem).resize();
            }, 0);
          } // if this element was rotated, and we changed the position of this element
          // we need to update the rotational transform attribute


          var angle = getRotationAngle(elem);

          if (angle !== 0 && attr !== 'transform') {
            var tlist = getTransformList(elem);
            var n = tlist.numberOfItems;

            while (n--) {
              var xform = tlist.getItem(n);

              if (xform.type === 4) {
                // remove old rotate
                tlist.removeItem(n);
                var box = getBBox(elem);
                var center = transformPoint(box.x + box.width / 2, box.y + box.height / 2, transformListToTransform(tlist).matrix);
                var cx = center.x,
                    cy = center.y;
                var newrot = svgroot.createSVGTransform();
                newrot.setRotate(angle, cx, cy);
                tlist.insertItemBefore(newrot, n);
                break;
              }
            }
          }
        } // if oldValue != newValue

      };

      while (i--) {
        var _ret2 = _loop();

        if (_ret2 === "continue") continue;
      } // for each elem

    };
    /**
    * Change the given/selected element and add the original value to the history stack.
    * If you want to change all `selectedElements`, ignore the `elems` argument.
    * If you want to change only a subset of `selectedElements`, then send the
    * subset to this function in the `elems` argument.
    * @function module:svgcanvas.SvgCanvas#changeSelectedAttribute
    * @param {string} attr - String with the attribute name
    * @param {string|Float} val - String or number with the new attribute value
    * @param {Element[]} elems - The DOM elements to apply the change to
    * @returns {void}
    */


    var changeSelectedAttribute = this.changeSelectedAttribute = function (attr, val, elems) {
      elems = elems || selectedElements;
      canvas.undoMgr.beginUndoableChange(attr, elems); // const i = elems.length;

      changeSelectedAttributeNoUndo(attr, val, elems);
      var batchCmd = canvas.undoMgr.finishUndoableChange();

      if (!batchCmd.isEmpty()) {
        addCommandToHistory(batchCmd);
      }
    };
    /**
    * Removes all selected elements from the DOM and adds the change to the
    * history stack.
    * @function module:svgcanvas.SvgCanvas#deleteSelectedElements
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.deleteSelectedElements = function () {
      var batchCmd = new BatchCommand$1('Delete Elements');
      var len = selectedElements.length;
      var selectedCopy = []; // selectedElements is being deleted

      for (var i = 0; i < len; ++i) {
        var selected = selectedElements[i];

        if (isNullish(selected)) {
          break;
        }

        var parent = selected.parentNode;
        var t = selected; // this will unselect the element and remove the selectedOutline

        selectorManager.releaseSelector(t); // Remove the path if present.

        removePath_(t.id); // Get the parent if it's a single-child anchor

        if (parent.tagName === 'a' && parent.childNodes.length === 1) {
          t = parent;
          parent = parent.parentNode;
        }

        var _t = t,
            nextSibling = _t.nextSibling;
        var elem = parent.removeChild(t);
        selectedCopy.push(selected); // for the copy

        batchCmd.addSubCommand(new RemoveElementCommand$1(elem, nextSibling, parent));
      }

      selectedElements = [];

      if (!batchCmd.isEmpty()) {
        addCommandToHistory(batchCmd);
      }

      call('changed', selectedCopy);
      clearSelection();
    };
    /**
    * Removes all selected elements from the DOM and adds the change to the
    * history stack. Remembers removed elements on the clipboard.
    * @function module:svgcanvas.SvgCanvas#cutSelectedElements
    * @returns {void}
    */


    this.cutSelectedElements = function () {
      canvas.copySelectedElements();
      canvas.deleteSelectedElements();
    };
    /**
    * Remembers the current selected elements on the clipboard.
    * @function module:svgcanvas.SvgCanvas#copySelectedElements
    * @returns {void}
    */


    this.copySelectedElements = function () {
      localStorage.setItem('svgedit_clipboard', JSON.stringify(selectedElements.map(function (x) {
        return getJsonFromSvgElement(x);
      })));
      $$8('#cmenu_canvas').enableContextMenuItems('#paste,#paste_in_place');
    };
    /**
    * @function module:svgcanvas.SvgCanvas#pasteElements
    * @param {"in_place"|"point"|void} type
    * @param {Integer|void} x Expected if type is "point"
    * @param {Integer|void} y Expected if type is "point"
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @fires module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
    * @returns {void}
    */


    this.pasteElements = function (type, x, y) {
      var clipb = JSON.parse(localStorage.getItem('svgedit_clipboard'));
      var len = clipb.length;

      if (!len) {
        return;
      }

      var pasted = [];
      var batchCmd = new BatchCommand$1('Paste elements'); // const drawing = getCurrentDrawing();

      /**
      * @typedef {PlainObject<string, string>} module:svgcanvas.ChangedIDs
      */

      /**
       * @type {module:svgcanvas.ChangedIDs}
       */

      var changedIDs = {}; // Recursively replace IDs and record the changes

      /**
       *
       * @param {module:svgcanvas.SVGAsJSON} elem
       * @returns {void}
       */

      function checkIDs(elem) {
        if (elem.attr && elem.attr.id) {
          changedIDs[elem.attr.id] = getNextId();
          elem.attr.id = changedIDs[elem.attr.id];
        }

        if (elem.children) elem.children.forEach(checkIDs);
      }

      clipb.forEach(checkIDs); // Give extensions like the connector extension a chance to reflect new IDs and remove invalid elements

      /**
      * Triggered when `pasteElements` is called from a paste action (context menu or key)
      * @event module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
      * @type {PlainObject}
      * @property {module:svgcanvas.SVGAsJSON[]} elems
      * @property {module:svgcanvas.ChangedIDs} changes Maps past ID (on attribute) to current ID
      */

      runExtensions('IDsUpdated',
      /** @type {module:svgcanvas.SvgCanvas#event:ext_IDsUpdated} */
      {
        elems: clipb,
        changes: changedIDs
      }, true).forEach(function (extChanges) {
        if (!extChanges || !('remove' in extChanges)) return;
        extChanges.remove.forEach(function (removeID) {
          clipb = clipb.filter(function (clipBoardItem) {
            return clipBoardItem.attr.id !== removeID;
          });
        });
      }); // Move elements to lastClickPoint

      while (len--) {
        var elem = clipb[len];

        if (!elem) {
          continue;
        }

        var copy = addSVGElementFromJson(elem);
        pasted.push(copy);
        batchCmd.addSubCommand(new InsertElementCommand$1(copy));
        restoreRefElems(copy);
      }

      selectOnly(pasted);

      if (type !== 'in_place') {
        var ctrX, ctrY;

        if (!type) {
          ctrX = lastClickPoint.x;
          ctrY = lastClickPoint.y;
        } else if (type === 'point') {
          ctrX = x;
          ctrY = y;
        }

        var bbox = getStrokedBBoxDefaultVisible(pasted);
        var cx = ctrX - (bbox.x + bbox.width / 2),
            cy = ctrY - (bbox.y + bbox.height / 2),
            dx = [],
            dy = [];
        $$8.each(pasted, function (i, item) {
          dx.push(cx);
          dy.push(cy);
        });
        var cmd = canvas.moveSelectedElements(dx, dy, false);
        if (cmd) batchCmd.addSubCommand(cmd);
      }

      addCommandToHistory(batchCmd);
      call('changed', pasted);
    };
    /**
    * Wraps all the selected elements in a group (`g`) element.
    * @function module:svgcanvas.SvgCanvas#groupSelectedElements
    * @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
    * @param {string} [urlArg]
    * @returns {void}
    */


    this.groupSelectedElements = function (type, urlArg) {
      if (!type) {
        type = 'g';
      }

      var cmdStr = '';
      var url;

      switch (type) {
        case 'a':
          {
            cmdStr = 'Make hyperlink';
            url = urlArg || '';
            break;
          }

        default:
          {
            type = 'g';
            cmdStr = 'Group Elements';
            break;
          }
      }

      var batchCmd = new BatchCommand$1(cmdStr); // create and insert the group element

      var g = addSVGElementFromJson({
        element: type,
        attr: {
          id: getNextId()
        }
      });

      if (type === 'a') {
        setHref(g, url);
      }

      batchCmd.addSubCommand(new InsertElementCommand$1(g)); // now move all children into the group

      var i = selectedElements.length;

      while (i--) {
        var elem = selectedElements[i];

        if (isNullish(elem)) {
          continue;
        }

        if (elem.parentNode.tagName === 'a' && elem.parentNode.childNodes.length === 1) {
          elem = elem.parentNode;
        }

        var oldNextSibling = elem.nextSibling;
        var oldParent = elem.parentNode;
        g.append(elem);
        batchCmd.addSubCommand(new MoveElementCommand$1(elem, oldNextSibling, oldParent));
      }

      if (!batchCmd.isEmpty()) {
        addCommandToHistory(batchCmd);
      } // update selection


      selectOnly([g], true);
    };
    /**
    * Pushes all appropriate parent group properties down to its children, then
    * removes them from the group.
    * @function module:svgcanvas.SvgCanvas#pushGroupProperties
    * @param {SVGAElement|SVGGElement} g
    * @param {boolean} undoable
    * @returns {BatchCommand|void}
    */


    var pushGroupProperties = this.pushGroupProperties = function (g, undoable) {
      var children = g.childNodes;
      var len = children.length;
      var xform = g.getAttribute('transform');
      var glist = getTransformList(g);
      var m = transformListToTransform(glist).matrix;
      var batchCmd = new BatchCommand$1('Push group properties'); // TODO: get all fill/stroke properties from the group that we are about to destroy
      // "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset",
      // "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
      // "stroke-width"
      // and then for each child, if they do not have the attribute (or the value is 'inherit')
      // then set the child's attribute

      var gangle = getRotationAngle(g);
      var gattrs = $$8(g).attr(['filter', 'opacity']);
      var gfilter, gblur, changes;
      var drawing = getCurrentDrawing();

      for (var i = 0; i < len; i++) {
        var elem = children[i];

        if (elem.nodeType !== 1) {
          continue;
        }

        if (gattrs.opacity !== null && gattrs.opacity !== 1) {
          // const c_opac = elem.getAttribute('opacity') || 1;
          var newOpac = Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100) / 100;
          changeSelectedAttribute('opacity', newOpac, [elem]);
        }

        if (gattrs.filter) {
          var cblur = this.getBlur(elem);
          var origCblur = cblur;

          if (!gblur) {
            gblur = this.getBlur(g);
          }

          if (cblur) {
            // Is this formula correct?
            cblur = Number(gblur) + Number(cblur);
          } else if (cblur === 0) {
            cblur = gblur;
          } // If child has no current filter, get group's filter or clone it.


          if (!origCblur) {
            // Set group's filter to use first child's ID
            if (!gfilter) {
              gfilter = getRefElem(gattrs.filter);
            } else {
              // Clone the group's filter
              gfilter = drawing.copyElem(gfilter);
              findDefs().append(gfilter);
            }
          } else {
            gfilter = getRefElem(elem.getAttribute('filter'));
          } // Change this in future for different filters


          var suffix = gfilter.firstChild.tagName === 'feGaussianBlur' ? 'blur' : 'filter';
          gfilter.id = elem.id + '_' + suffix;
          changeSelectedAttribute('filter', 'url(#' + gfilter.id + ')', [elem]); // Update blur value

          if (cblur) {
            changeSelectedAttribute('stdDeviation', cblur, [gfilter.firstChild]);
            canvas.setBlurOffsets(gfilter, cblur);
          }
        }

        var chtlist = getTransformList(elem); // Don't process gradient transforms

        if (elem.tagName.includes('Gradient')) {
          chtlist = null;
        } // Hopefully not a problem to add this. Necessary for elements like <desc/>


        if (!chtlist) {
          continue;
        } // Apparently <defs> can get get a transformlist, but we don't want it to have one!


        if (elem.tagName === 'defs') {
          continue;
        }

        if (glist.numberOfItems) {
          // TODO: if the group's transform is just a rotate, we can always transfer the
          // rotate() down to the children (collapsing consecutive rotates and factoring
          // out any translates)
          if (gangle && glist.numberOfItems === 1) {
            // [Rg] [Rc] [Mc]
            // we want [Tr] [Rc2] [Mc] where:
            //  - [Rc2] is at the child's current center but has the
            // sum of the group and child's rotation angles
            //  - [Tr] is the equivalent translation that this child
            // undergoes if the group wasn't there
            // [Tr] = [Rg] [Rc] [Rc2_inv]
            // get group's rotation matrix (Rg)
            var rgm = glist.getItem(0).matrix; // get child's rotation matrix (Rc)

            var rcm = svgroot.createSVGMatrix();
            var cangle = getRotationAngle(elem);

            if (cangle) {
              rcm = chtlist.getItem(0).matrix;
            } // get child's old center of rotation


            var cbox = getBBox(elem);
            var ceqm = transformListToTransform(chtlist).matrix;
            var coldc = transformPoint(cbox.x + cbox.width / 2, cbox.y + cbox.height / 2, ceqm); // sum group and child's angles

            var sangle = gangle + cangle; // get child's rotation at the old center (Rc2_inv)

            var r2 = svgroot.createSVGTransform();
            r2.setRotate(sangle, coldc.x, coldc.y); // calculate equivalent translate

            var trm = matrixMultiply(rgm, rcm, r2.matrix.inverse()); // set up tlist

            if (cangle) {
              chtlist.removeItem(0);
            }

            if (sangle) {
              if (chtlist.numberOfItems) {
                chtlist.insertItemBefore(r2, 0);
              } else {
                chtlist.appendItem(r2);
              }
            }

            if (trm.e || trm.f) {
              var tr = svgroot.createSVGTransform();
              tr.setTranslate(trm.e, trm.f);

              if (chtlist.numberOfItems) {
                chtlist.insertItemBefore(tr, 0);
              } else {
                chtlist.appendItem(tr);
              }
            }
          } else {
            // more complicated than just a rotate
            // transfer the group's transform down to each child and then
            // call recalculateDimensions()
            var oldxform = elem.getAttribute('transform');
            changes = {};
            changes.transform = oldxform || '';
            var newxform = svgroot.createSVGTransform(); // [ gm ] [ chm ] = [ chm ] [ gm' ]
            // [ gm' ] = [ chmInv ] [ gm ] [ chm ]

            var chm = transformListToTransform(chtlist).matrix,
                chmInv = chm.inverse();
            var gm = matrixMultiply(chmInv, m, chm);
            newxform.setMatrix(gm);
            chtlist.appendItem(newxform);
          }

          var cmd = recalculateDimensions(elem);

          if (cmd) {
            batchCmd.addSubCommand(cmd);
          }
        }
      } // remove transform and make it undo-able


      if (xform) {
        changes = {};
        changes.transform = xform;
        g.setAttribute('transform', '');
        g.removeAttribute('transform');
        batchCmd.addSubCommand(new ChangeElementCommand$1(g, changes));
      }

      if (undoable && !batchCmd.isEmpty()) {
        return batchCmd;
      }

      return undefined;
    };
    /**
    * Unwraps all the elements in a selected group (`g`) element. This requires
    * significant recalculations to apply group's transforms, etc. to its children.
    * @function module:svgcanvas.SvgCanvas#ungroupSelectedElement
    * @returns {void}
    */


    this.ungroupSelectedElement = function () {
      var g = selectedElements[0];

      if (!g) {
        return;
      }

      if ($$8(g).data('gsvg') || $$8(g).data('symbol')) {
        // Is svg, so actually convert to group
        convertToGroup(g);
        return;
      }

      if (g.tagName === 'use') {
        // Somehow doesn't have data set, so retrieve
        var symbol = getElem(getHref(g).substr(1));
        $$8(g).data('symbol', symbol).data('ref', symbol);
        convertToGroup(g);
        return;
      }

      var parentsA = $$8(g).parents('a');

      if (parentsA.length) {
        g = parentsA[0];
      } // Look for parent "a"


      if (g.tagName === 'g' || g.tagName === 'a') {
        var batchCmd = new BatchCommand$1('Ungroup Elements');
        var cmd = pushGroupProperties(g, true);

        if (cmd) {
          batchCmd.addSubCommand(cmd);
        }

        var parent = g.parentNode;
        var anchor = g.nextSibling;
        var children = new Array(g.childNodes.length);
        var i = 0;

        while (g.firstChild) {
          var elem = g.firstChild;
          var oldNextSibling = elem.nextSibling;
          var oldParent = elem.parentNode; // Remove child title elements

          if (elem.tagName === 'title') {
            var _elem2 = elem,
                nextSibling = _elem2.nextSibling;
            batchCmd.addSubCommand(new RemoveElementCommand$1(elem, nextSibling, oldParent));
            elem.remove();
            continue;
          }

          children[i++] = elem = parent.insertBefore(elem, anchor);
          batchCmd.addSubCommand(new MoveElementCommand$1(elem, oldNextSibling, oldParent));
        } // remove the group from the selection


        clearSelection(); // delete the group element (but make undo-able)

        var gNextSibling = g.nextSibling;
        g = parent.removeChild(g);
        batchCmd.addSubCommand(new RemoveElementCommand$1(g, gNextSibling, parent));

        if (!batchCmd.isEmpty()) {
          addCommandToHistory(batchCmd);
        } // update selection


        addToSelection(children);
      }
    };
    /**
    * Repositions the selected element to the bottom in the DOM to appear on top of
    * other elements.
    * @function module:svgcanvas.SvgCanvas#moveToTopSelectedElement
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.moveToTopSelectedElement = function () {
      var _selectedElements2 = selectedElements,
          _selectedElements3 = _slicedToArray(_selectedElements2, 1),
          selected = _selectedElements3[0];

      if (!isNullish(selected)) {
        var t = selected;
        var oldParent = t.parentNode;
        var oldNextSibling = t.nextSibling;
        t = t.parentNode.appendChild(t); // If the element actually moved position, add the command and fire the changed
        // event handler.

        if (oldNextSibling !== t.nextSibling) {
          addCommandToHistory(new MoveElementCommand$1(t, oldNextSibling, oldParent, 'top'));
          call('changed', [t]);
        }
      }
    };
    /**
    * Repositions the selected element to the top in the DOM to appear under
    * other elements.
    * @function module:svgcanvas.SvgCanvas#moveToBottomSelectedElement
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.moveToBottomSelectedElement = function () {
      var _selectedElements4 = selectedElements,
          _selectedElements5 = _slicedToArray(_selectedElements4, 1),
          selected = _selectedElements5[0];

      if (!isNullish(selected)) {
        var t = selected;
        var oldParent = t.parentNode;
        var oldNextSibling = t.nextSibling;
        var firstChild = t.parentNode.firstChild;

        if (firstChild.tagName === 'title') {
          firstChild = firstChild.nextSibling;
        } // This can probably be removed, as the defs should not ever apppear
        // inside a layer group


        if (firstChild.tagName === 'defs') {
          firstChild = firstChild.nextSibling;
        }

        t = t.parentNode.insertBefore(t, firstChild); // If the element actually moved position, add the command and fire the changed
        // event handler.

        if (oldNextSibling !== t.nextSibling) {
          addCommandToHistory(new MoveElementCommand$1(t, oldNextSibling, oldParent, 'bottom'));
          call('changed', [t]);
        }
      }
    };
    /**
    * Moves the select element up or down the stack, based on the visibly
    * intersecting elements.
    * @function module:svgcanvas.SvgCanvas#moveUpDownSelected
    * @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */


    this.moveUpDownSelected = function (dir) {
      var selected = selectedElements[0];

      if (!selected) {
        return;
      }

      curBBoxes = [];
      var closest, foundCur; // jQuery sorts this list

      var list = $$8(getIntersectionList(getStrokedBBoxDefaultVisible([selected]))).toArray();

      if (dir === 'Down') {
        list.reverse();
      }

      $$8.each(list, function () {
        if (!foundCur) {
          if (this === selected) {
            foundCur = true;
          }

          return true;
        }

        closest = this; // eslint-disable-line consistent-this

        return false;
      });

      if (!closest) {
        return;
      }

      var t = selected;
      var oldParent = t.parentNode;
      var oldNextSibling = t.nextSibling;
      $$8(closest)[dir === 'Down' ? 'before' : 'after'](t); // If the element actually moved position, add the command and fire the changed
      // event handler.

      if (oldNextSibling !== t.nextSibling) {
        addCommandToHistory(new MoveElementCommand$1(t, oldNextSibling, oldParent, 'Move ' + dir));
        call('changed', [t]);
      }
    };
    /**
    * Moves selected elements on the X/Y axis.
    * @function module:svgcanvas.SvgCanvas#moveSelectedElements
    * @param {Float} dx - Float with the distance to move on the x-axis
    * @param {Float} dy - Float with the distance to move on the y-axis
    * @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {BatchCommand|void} Batch command for the move
    */


    this.moveSelectedElements = function (dx, dy, undoable) {
      // if undoable is not sent, default to true
      // if single values, scale them to the zoom
      if (dx.constructor !== Array) {
        dx /= currentZoom;
        dy /= currentZoom;
      }

      undoable = undoable || true;
      var batchCmd = new BatchCommand$1('position');
      var i = selectedElements.length;

      while (i--) {
        var selected = selectedElements[i];

        if (!isNullish(selected)) {
          // if (i === 0) {
          //   selectedBBoxes[0] = utilsGetBBox(selected);
          // }
          // const b = {};
          // for (const j in selectedBBoxes[i]) b[j] = selectedBBoxes[i][j];
          // selectedBBoxes[i] = b;
          var xform = svgroot.createSVGTransform();
          var tlist = getTransformList(selected); // dx and dy could be arrays

          if (dx.constructor === Array) {
            // if (i === 0) {
            //   selectedBBoxes[0].x += dx[0];
            //   selectedBBoxes[0].y += dy[0];
            // }
            xform.setTranslate(dx[i], dy[i]);
          } else {
            // if (i === 0) {
            //   selectedBBoxes[0].x += dx;
            //   selectedBBoxes[0].y += dy;
            // }
            xform.setTranslate(dx, dy);
          }

          if (tlist.numberOfItems) {
            tlist.insertItemBefore(xform, 0);
          } else {
            tlist.appendItem(xform);
          }

          var cmd = recalculateDimensions(selected);

          if (cmd) {
            batchCmd.addSubCommand(cmd);
          }

          selectorManager.requestSelector(selected).resize();
        }
      }

      if (!batchCmd.isEmpty()) {
        if (undoable) {
          addCommandToHistory(batchCmd);
        }

        call('changed', selectedElements);
        return batchCmd;
      }

      return undefined;
    };
    /**
    * Create deep DOM copies (clones) of all selected elements and move them slightly
    * from their originals.
    * @function module:svgcanvas.SvgCanvas#cloneSelectedElements
    * @param {Float} x Float with the distance to move on the x-axis
    * @param {Float} y Float with the distance to move on the y-axis
    * @returns {void}
    */


    this.cloneSelectedElements = function (x, y) {
      var i, elem;
      var batchCmd = new BatchCommand$1('Clone Elements'); // find all the elements selected (stop at first null)

      var len = selectedElements.length;
      /**
       * Sorts an array numerically and ascending.
       * @param {Element} a
       * @param {Element} b
       * @returns {Integer}
       */

      function sortfunction(a, b) {
        return $$8(b).index() - $$8(a).index();
      }

      selectedElements.sort(sortfunction);

      for (i = 0; i < len; ++i) {
        elem = selectedElements[i];

        if (isNullish(elem)) {
          break;
        }
      } // use slice to quickly get the subset of elements we need


      var copiedElements = selectedElements.slice(0, i);
      this.clearSelection(true); // note that we loop in the reverse way because of the way elements are added
      // to the selectedElements array (top-first)

      var drawing = getCurrentDrawing();
      i = copiedElements.length;

      while (i--) {
        // clone each element and replace it within copiedElements
        elem = copiedElements[i] = drawing.copyElem(copiedElements[i]);
        (currentGroup || drawing.getCurrentLayer()).append(elem);
        batchCmd.addSubCommand(new InsertElementCommand$1(elem));
      }

      if (!batchCmd.isEmpty()) {
        addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding

        this.moveSelectedElements(x, y, false);
        addCommandToHistory(batchCmd);
      }
    };
    /**
    * Aligns selected elements.
    * @function module:svgcanvas.SvgCanvas#alignSelectedElements
    * @param {string} type - String with single character indicating the alignment type
    * @param {"selected"|"largest"|"smallest"|"page"} relativeTo
    * @returns {void}
    */


    this.alignSelectedElements = function (type, relativeTo) {
      var bboxes = []; // angles = [];

      var len = selectedElements.length;

      if (!len) {
        return;
      }

      var minx = Number.MAX_VALUE,
          maxx = Number.MIN_VALUE,
          miny = Number.MAX_VALUE,
          maxy = Number.MIN_VALUE;
      var curwidth = Number.MIN_VALUE,
          curheight = Number.MIN_VALUE;

      for (var i = 0; i < len; ++i) {
        if (isNullish(selectedElements[i])) {
          break;
        }

        var elem = selectedElements[i];
        bboxes[i] = getStrokedBBoxDefaultVisible([elem]); // now bbox is axis-aligned and handles rotation

        switch (relativeTo) {
          case 'smallest':
            if ((type === 'l' || type === 'c' || type === 'r') && (curwidth === Number.MIN_VALUE || curwidth > bboxes[i].width) || (type === 't' || type === 'm' || type === 'b') && (curheight === Number.MIN_VALUE || curheight > bboxes[i].height)) {
              minx = bboxes[i].x;
              miny = bboxes[i].y;
              maxx = bboxes[i].x + bboxes[i].width;
              maxy = bboxes[i].y + bboxes[i].height;
              curwidth = bboxes[i].width;
              curheight = bboxes[i].height;
            }

            break;

          case 'largest':
            if ((type === 'l' || type === 'c' || type === 'r') && (curwidth === Number.MIN_VALUE || curwidth < bboxes[i].width) || (type === 't' || type === 'm' || type === 'b') && (curheight === Number.MIN_VALUE || curheight < bboxes[i].height)) {
              minx = bboxes[i].x;
              miny = bboxes[i].y;
              maxx = bboxes[i].x + bboxes[i].width;
              maxy = bboxes[i].y + bboxes[i].height;
              curwidth = bboxes[i].width;
              curheight = bboxes[i].height;
            }

            break;

          default:
            // 'selected'
            if (bboxes[i].x < minx) {
              minx = bboxes[i].x;
            }

            if (bboxes[i].y < miny) {
              miny = bboxes[i].y;
            }

            if (bboxes[i].x + bboxes[i].width > maxx) {
              maxx = bboxes[i].x + bboxes[i].width;
            }

            if (bboxes[i].y + bboxes[i].height > maxy) {
              maxy = bboxes[i].y + bboxes[i].height;
            }

            break;
        }
      } // loop for each element to find the bbox and adjust min/max


      if (relativeTo === 'page') {
        minx = 0;
        miny = 0;
        maxx = canvas.contentW;
        maxy = canvas.contentH;
      }

      var dx = new Array(len);
      var dy = new Array(len);

      for (var _i7 = 0; _i7 < len; ++_i7) {
        if (isNullish(selectedElements[_i7])) {
          break;
        } // const elem = selectedElements[i];


        var bbox = bboxes[_i7];
        dx[_i7] = 0;
        dy[_i7] = 0;

        switch (type) {
          case 'l':
            // left (horizontal)
            dx[_i7] = minx - bbox.x;
            break;

          case 'c':
            // center (horizontal)
            dx[_i7] = (minx + maxx) / 2 - (bbox.x + bbox.width / 2);
            break;

          case 'r':
            // right (horizontal)
            dx[_i7] = maxx - (bbox.x + bbox.width);
            break;

          case 't':
            // top (vertical)
            dy[_i7] = miny - bbox.y;
            break;

          case 'm':
            // middle (vertical)
            dy[_i7] = (miny + maxy) / 2 - (bbox.y + bbox.height / 2);
            break;

          case 'b':
            // bottom (vertical)
            dy[_i7] = maxy - (bbox.y + bbox.height);
            break;
        }
      }

      this.moveSelectedElements(dx, dy);
    };
    /**
    * Group: Additional editor tools
    */

    /**
    * @name module:svgcanvas.SvgCanvas#contentW
    * @type {Float}
    */


    this.contentW = getResolution().w;
    /**
    * @name module:svgcanvas.SvgCanvas#contentH
    * @type {Float}
    */

    this.contentH = getResolution().h;
    /**
    * @typedef {PlainObject} module:svgcanvas.CanvasInfo
    * @property {Float} x - The canvas' new x coordinate
    * @property {Float} y - The canvas' new y coordinate
    * @property {string} oldX - The canvas' old x coordinate
    * @property {string} oldY - The canvas' old y coordinate
    * @property {Float} d_x - The x position difference
    * @property {Float} d_y - The y position difference
    */

    /**
    * Updates the editor canvas width/height/position after a zoom has occurred.
    * @function module:svgcanvas.SvgCanvas#updateCanvas
    * @param {Float} w - Float with the new width
    * @param {Float} h - Float with the new height
    * @fires module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
    * @returns {module:svgcanvas.CanvasInfo}
    */

    this.updateCanvas = function (w, h) {
      svgroot.setAttribute('width', w);
      svgroot.setAttribute('height', h);
      var bg = $$8('#canvasBackground')[0];
      var oldX = svgcontent.getAttribute('x');
      var oldY = svgcontent.getAttribute('y');
      var x = (w - this.contentW * currentZoom) / 2;
      var y = (h - this.contentH * currentZoom) / 2;
      assignAttributes(svgcontent, {
        width: this.contentW * currentZoom,
        height: this.contentH * currentZoom,
        x: x,
        y: y,
        viewBox: '0 0 ' + this.contentW + ' ' + this.contentH
      });
      assignAttributes(bg, {
        width: svgcontent.getAttribute('width'),
        height: svgcontent.getAttribute('height'),
        x: x,
        y: y
      });
      var bgImg = getElem('background_image');

      if (bgImg) {
        assignAttributes(bgImg, {
          width: '100%',
          height: '100%'
        });
      }

      selectorManager.selectorParentGroup.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      /**
      * Invoked upon updates to the canvas.
      * @event module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
      * @type {PlainObject}
      * @property {Integer} new_x
      * @property {Integer} new_y
      * @property {string} old_x (Of Integer)
      * @property {string} old_y (Of Integer)
      * @property {Integer} d_x
      * @property {Integer} d_y
      */

      runExtensions('canvasUpdated',
      /**
       * @type {module:svgcanvas.SvgCanvas#event:ext_canvasUpdated}
       */
      {
        new_x: x,
        new_y: y,
        old_x: oldX,
        old_y: oldY,
        d_x: x - oldX,
        d_y: y - oldY
      });
      return {
        x: x,
        y: y,
        old_x: oldX,
        old_y: oldY,
        d_x: x - oldX,
        d_y: y - oldY
      };
    };
    /**
    * Set the background of the editor (NOT the actual document).
    * @function module:svgcanvas.SvgCanvas#setBackground
    * @param {string} color - String with fill color to apply
    * @param {string} url - URL or path to image to use
    * @returns {void}
    */


    this.setBackground = function (color, url) {
      var bg = getElem('canvasBackground');
      var border = $$8(bg).find('rect')[0];
      var bgImg = getElem('background_image');
      border.setAttribute('fill', color);

      if (url) {
        if (!bgImg) {
          bgImg = svgdoc.createElementNS(NS.SVG, 'image');
          assignAttributes(bgImg, {
            id: 'background_image',
            width: '100%',
            height: '100%',
            preserveAspectRatio: 'xMinYMin',
            style: 'pointer-events:none'
          });
        }

        setHref(bgImg, url);
        bg.append(bgImg);
      } else if (bgImg) {
        bgImg.remove();
      }
    };
    /**
    * Select the next/previous element within the current layer.
    * @function module:svgcanvas.SvgCanvas#cycleElement
    * @param {boolean} next - true = next and false = previous element
    * @fires module:svgcanvas.SvgCanvas#event:selected
    * @returns {void}
    */


    this.cycleElement = function (next) {
      var num;
      var curElem = selectedElements[0];
      var elem = false;
      var allElems = getVisibleElements(currentGroup || getCurrentDrawing().getCurrentLayer());

      if (!allElems.length) {
        return;
      }

      if (isNullish(curElem)) {
        num = next ? allElems.length - 1 : 0;
        elem = allElems[num];
      } else {
        var i = allElems.length;

        while (i--) {
          if (allElems[i] === curElem) {
            num = next ? i - 1 : i + 1;

            if (num >= allElems.length) {
              num = 0;
            } else if (num < 0) {
              num = allElems.length - 1;
            }

            elem = allElems[num];
            break;
          }
        }
      }

      selectOnly([elem], true);
      call('selected', selectedElements);
    };

    this.clear();
    /**
    * @interface module:svgcanvas.PrivateMethods
    * @type {PlainObject}
    * @property {module:svgcanvas~addCommandToHistory} addCommandToHistory
    * @property {module:history.HistoryCommand} BatchCommand
    * @property {module:history.HistoryCommand} ChangeElementCommand
    * @property {module:utilities.decode64} decode64
    * @property {module:utilities.dropXMLInteralSubset} dropXMLInteralSubset
    * @property {module:utilities.encode64} encode64
    * @property {module:svgcanvas~ffClone} ffClone
    * @property {module:svgcanvas~findDuplicateGradient} findDuplicateGradient
    * @property {module:utilities.getPathBBox} getPathBBox
    * @property {module:units.getTypeMap} getTypeMap
    * @property {module:draw.identifyLayers} identifyLayers
    * @property {module:history.HistoryCommand} InsertElementCommand
    * @property {module:browser.isChrome} isChrome
    * @property {module:math.isIdentity} isIdentity
    * @property {module:browser.isIE} isIE
    * @property {module:svgcanvas~logMatrix} logMatrix
    * @property {module:history.HistoryCommand} MoveElementCommand
    * @property {module:namespaces.NS} NS
    * @property {module:utilities.preventClickDefault} preventClickDefault
    * @property {module:history.HistoryCommand} RemoveElementCommand
    * @property {module:SVGTransformList.SVGEditTransformList} SVGEditTransformList
    * @property {module:utilities.text2xml} text2xml
    * @property {module:math.transformBox} transformBox
    * @property {module:math.transformPoint} transformPoint
    * @property {module:utilities.walkTree} walkTree
    */

    /**
    * @deprecated getPrivateMethods
    * Since all methods are/should be public somehow, this function should be removed;
    *  we might require `import` in place of this in the future once ES6 Modules
    *  widespread
    
    * Being able to access private methods publicly seems wrong somehow,
    * but currently appears to be the best way to allow testing and provide
    * access to them to plugins.
    * @function module:svgcanvas.SvgCanvas#getPrivateMethods
    * @returns {module:svgcanvas.PrivateMethods}
    */

    this.getPrivateMethods = function () {
      var obj = {
        addCommandToHistory: addCommandToHistory,
        BatchCommand: BatchCommand$1,
        ChangeElementCommand: ChangeElementCommand$1,
        decode64: decode64,
        dropXMLInteralSubset: dropXMLInteralSubset,
        encode64: encode64,
        ffClone: ffClone,
        findDefs: findDefs,
        findDuplicateGradient: findDuplicateGradient,
        getElem: getElem,
        getPathBBox: getPathBBox,
        getTypeMap: getTypeMap,
        getUrlFromAttr: getUrlFromAttr,
        identifyLayers: identifyLayers,
        InsertElementCommand: InsertElementCommand$1,
        isChrome: isChrome,
        isIdentity: isIdentity,
        isIE: isIE,
        logMatrix: logMatrix,
        MoveElementCommand: MoveElementCommand$1,
        NS: NS,
        preventClickDefault: preventClickDefault,
        RemoveElementCommand: RemoveElementCommand$1,
        SVGEditTransformList: SVGTransformList,
        text2xml: text2xml,
        transformBox: transformBox,
        transformPoint: transformPoint,
        walkTree: walkTree
      };
      return obj;
    };
  } // End constructor
  ; // End class

  return SvgCanvas;

}());
