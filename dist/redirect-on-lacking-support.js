(function () {
  'use strict';

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

            var owningPathSegList = this;

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
                        var _points = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicRel(owningPathSegList, _points.x, _points.y, _points.x1, _points.y1, _points.x2, _points.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
                      {
                        var _points2 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicAbs(owningPathSegList, _points2.x, _points2.y, _points2.x1, _points2.y1, _points2.x2, _points2.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
                      {
                        var _points3 = {
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, _points3.x, _points3.y, _points3.x2, _points3.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
                      {
                        var _points4 = {
                          x2: this._parseNumber(),
                          y2: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, _points4.x, _points4.y, _points4.x2, _points4.y2);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
                      {
                        var _points5 = {
                          x1: this._parseNumber(),
                          y1: this._parseNumber(),
                          x: this._parseNumber(),
                          y: this._parseNumber()
                        };
                        return new SVGPathSegCurvetoQuadraticRel(owningPathSegList, _points5.x, _points5.y, _points5.x1, _points5.y1);
                      }

                    case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
                      var points = {
                        x1: this._parseNumber(),
                        y1: this._parseNumber(),
                        x: this._parseNumber(),
                        y: this._parseNumber()
                      };
                      return new SVGPathSegCurvetoQuadraticAbs(owningPathSegList, points.x, points.y, points.x1, points.y1);

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
      });

      SVGPathSegList._pathSegArrayAsString = function (pathSegArray) {
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
      }; // Add the pathSegList accessors to SVGPathElement.
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

  /* globals jQuery */
  var $ = jQuery;

  var supportsSVG_ = function () {
    return !!document.createElementNS && !!document.createElementNS(NS.SVG, 'svg').createSVGRect;
  }();
  /**
   * @function module:browser.supportsSvg
   * @returns {boolean}
  */


  var supportsSvg = function supportsSvg() {
    return supportsSVG_;
  };
  var _navigator = navigator,
      userAgent = _navigator.userAgent;
  var svg = document.createElementNS(NS.SVG, 'svg'); // Note: Browser sniffing should only be used if no other detection method is possible

  var isOpera_ = !!window.opera;
  var isWebkit_ = userAgent.includes('AppleWebKit');
  var isGecko_ = userAgent.includes('Gecko/');
  var isIE_ = userAgent.includes('MSIE');
  var isChrome_ = userAgent.includes('Chrome/');
  var isWindows_ = userAgent.includes('Windows');
  var isMac_ = userAgent.includes('Macintosh');

  var supportsSelectors_ = function () {
    return !!svg.querySelector;
  }();

  var supportsXpath_ = function () {
    return !!document.evaluate;
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
    var r1 = rxform.getItem(0); // Todo: Do frame-independent instance checking

    return r1 instanceof SVGTransform && t1 instanceof SVGTransform && r1.type === t1.type && r1.angle === t1.angle && r1.matrix.a === t1.matrix.a && r1.matrix.b === t1.matrix.b && r1.matrix.c === t1.matrix.c && r1.matrix.d === t1.matrix.d && r1.matrix.e === t1.matrix.e && r1.matrix.f === t1.matrix.f;
  }(); // Public API

  if (!supportsSvg()) {
    window.location = 'browser-not-supported.html';
  }

}());
