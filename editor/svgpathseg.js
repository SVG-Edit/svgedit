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
(() => {
if (!('SVGPathSeg' in window)) {
  // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSeg
  class SVGPathSeg {
    constructor (type, typeAsLetter, owningPathSegList) {
      this.pathSegType = type;
      this.pathSegTypeAsLetter = typeAsLetter;
      this._owningPathSegList = owningPathSegList;
    }
    // Notify owning PathSegList on any changes so they can be synchronized back to the path element.
    _segmentChanged () {
      if (this._owningPathSegList) {
        this._owningPathSegList.segmentChanged(this);
      }
    }
  }
  SVGPathSeg.prototype.classname = 'SVGPathSeg';

  SVGPathSeg.PATHSEG_UNKNOWN = 0;
  SVGPathSeg.PATHSEG_CLOSEPATH = 1;
  SVGPathSeg.PATHSEG_MOVETO_ABS = 2;
  SVGPathSeg.PATHSEG_MOVETO_REL = 3;
  SVGPathSeg.PATHSEG_LINETO_ABS = 4;
  SVGPathSeg.PATHSEG_LINETO_REL = 5;
  SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS = 6;
  SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL = 7;
  SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS = 8;
  SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL = 9;
  SVGPathSeg.PATHSEG_ARC_ABS = 10;
  SVGPathSeg.PATHSEG_ARC_REL = 11;
  SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS = 12;
  SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL = 13;
  SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS = 14;
  SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL = 15;
  SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS = 16;
  SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL = 17;
  SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
  SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;

  class SVGPathSegClosePath extends SVGPathSeg {
    constructor (owningPathSegList) {
      super(SVGPathSeg.PATHSEG_CLOSEPATH, 'z', owningPathSegList);
    }
    toString () { return '[object SVGPathSegClosePath]'; }
    _asPathString () { return this.pathSegTypeAsLetter; }
    clone () { return new SVGPathSegClosePath(undefined); }
  }

  class SVGPathSegMovetoAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_MOVETO_ABS, 'M', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegMovetoAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegMovetoAbs(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegMovetoAbs.prototype, {
    x: {
      get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true
    },
    y: {
      get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true
    }
  });

  class SVGPathSegMovetoRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_MOVETO_REL, 'm', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegMovetoRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegMovetoRel(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegMovetoRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegLinetoAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_LINETO_ABS, 'L', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegLinetoAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegLinetoAbs(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegLinetoAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegLinetoRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_LINETO_REL, 'l', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegLinetoRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegLinetoRel(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegLinetoRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoCubicAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x1, y1, x2, y2) {
      super(SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS, 'C', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x1 = x1;
      this._y1 = y1;
      this._x2 = x2;
      this._y2 = y2;
    }
    toString () { return '[object SVGPathSegCurvetoCubicAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoCubicAbs(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2); }
  }
  Object.defineProperties(SVGPathSegCurvetoCubicAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x1: {get () { return this._x1; }, set (x1) { this._x1 = x1; this._segmentChanged(); }, enumerable: true},
    y1: {get () { return this._y1; }, set (y1) { this._y1 = y1; this._segmentChanged(); }, enumerable: true},
    x2: {get () { return this._x2; }, set (x2) { this._x2 = x2; this._segmentChanged(); }, enumerable: true},
    y2: {get () { return this._y2; }, set (y2) { this._y2 = y2; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoCubicRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x1, y1, x2, y2) {
      super(SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL, 'c', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x1 = x1;
      this._y1 = y1;
      this._x2 = x2;
      this._y2 = y2;
    }
    toString () { return '[object SVGPathSegCurvetoCubicRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoCubicRel(undefined, this._x, this._y, this._x1, this._y1, this._x2, this._y2); }
  }
  Object.defineProperties(SVGPathSegCurvetoCubicRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x1: {get () { return this._x1; }, set (x1) { this._x1 = x1; this._segmentChanged(); }, enumerable: true},
    y1: {get () { return this._y1; }, set (y1) { this._y1 = y1; this._segmentChanged(); }, enumerable: true},
    x2: {get () { return this._x2; }, set (x2) { this._x2 = x2; this._segmentChanged(); }, enumerable: true},
    y2: {get () { return this._y2; }, set (y2) { this._y2 = y2; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoQuadraticAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x1, y1) {
      super(SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS, 'Q', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x1 = x1;
      this._y1 = y1;
    }
    toString () { return '[object SVGPathSegCurvetoQuadraticAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoQuadraticAbs(undefined, this._x, this._y, this._x1, this._y1); }
  }
  Object.defineProperties(SVGPathSegCurvetoQuadraticAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x1: {get () { return this._x1; }, set (x1) { this._x1 = x1; this._segmentChanged(); }, enumerable: true},
    y1: {get () { return this._y1; }, set (y1) { this._y1 = y1; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoQuadraticRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x1, y1) {
      super(SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL, 'q', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x1 = x1;
      this._y1 = y1;
    }
    toString () { return '[object SVGPathSegCurvetoQuadraticRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x1 + ' ' + this._y1 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoQuadraticRel(undefined, this._x, this._y, this._x1, this._y1); }
  }
  Object.defineProperties(SVGPathSegCurvetoQuadraticRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x1: {get () { return this._x1; }, set (x1) { this._x1 = x1; this._segmentChanged(); }, enumerable: true},
    y1: {get () { return this._y1; }, set (y1) { this._y1 = y1; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegArcAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
      super(SVGPathSeg.PATHSEG_ARC_ABS, 'A', owningPathSegList);
      this._x = x;
      this._y = y;
      this._r1 = r1;
      this._r2 = r2;
      this._angle = angle;
      this._largeArcFlag = largeArcFlag;
      this._sweepFlag = sweepFlag;
    }
    toString () { return '[object SVGPathSegArcAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegArcAbs(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag); }
  }
  Object.defineProperties(SVGPathSegArcAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    r1: {get () { return this._r1; }, set (r1) { this._r1 = r1; this._segmentChanged(); }, enumerable: true},
    r2: {get () { return this._r2; }, set (r2) { this._r2 = r2; this._segmentChanged(); }, enumerable: true},
    angle: {get () { return this._angle; }, set (angle) { this._angle = angle; this._segmentChanged(); }, enumerable: true},
    largeArcFlag: {get () { return this._largeArcFlag; }, set (largeArcFlag) { this._largeArcFlag = largeArcFlag; this._segmentChanged(); }, enumerable: true},
    sweepFlag: {get () { return this._sweepFlag; }, set (sweepFlag) { this._sweepFlag = sweepFlag; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegArcRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y, r1, r2, angle, largeArcFlag, sweepFlag) {
      super(SVGPathSeg.PATHSEG_ARC_REL, 'a', owningPathSegList);
      this._x = x;
      this._y = y;
      this._r1 = r1;
      this._r2 = r2;
      this._angle = angle;
      this._largeArcFlag = largeArcFlag;
      this._sweepFlag = sweepFlag;
    }
    toString () { return '[object SVGPathSegArcRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._r1 + ' ' + this._r2 + ' ' + this._angle + ' ' + (this._largeArcFlag ? '1' : '0') + ' ' + (this._sweepFlag ? '1' : '0') + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegArcRel(undefined, this._x, this._y, this._r1, this._r2, this._angle, this._largeArcFlag, this._sweepFlag); }
  }
  Object.defineProperties(SVGPathSegArcRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    r1: {get () { return this._r1; }, set (r1) { this._r1 = r1; this._segmentChanged(); }, enumerable: true},
    r2: {get () { return this._r2; }, set (r2) { this._r2 = r2; this._segmentChanged(); }, enumerable: true},
    angle: {get () { return this._angle; }, set (angle) { this._angle = angle; this._segmentChanged(); }, enumerable: true},
    largeArcFlag: {get () { return this._largeArcFlag; }, set (largeArcFlag) { this._largeArcFlag = largeArcFlag; this._segmentChanged(); }, enumerable: true},
    sweepFlag: {get () { return this._sweepFlag; }, set (sweepFlag) { this._sweepFlag = sweepFlag; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegLinetoHorizontalAbs extends SVGPathSeg {
    constructor (owningPathSegList, x) {
      super(SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS, 'H', owningPathSegList);
      this._x = x;
    }
    toString () { return '[object SVGPathSegLinetoHorizontalAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x; }
    clone () { return new SVGPathSegLinetoHorizontalAbs(undefined, this._x); }
  }
  Object.defineProperty(SVGPathSegLinetoHorizontalAbs.prototype, 'x', {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true});

  class SVGPathSegLinetoHorizontalRel extends SVGPathSeg {
    constructor (owningPathSegList, x) {
      super(SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL, 'h', owningPathSegList);
      this._x = x;
    }
    toString () { return '[object SVGPathSegLinetoHorizontalRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x; }
    clone () { return new SVGPathSegLinetoHorizontalRel(undefined, this._x); }
  }
  Object.defineProperty(SVGPathSegLinetoHorizontalRel.prototype, 'x', {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true});

  class SVGPathSegLinetoVerticalAbs extends SVGPathSeg {
    constructor (owningPathSegList, y) {
      super(SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS, 'V', owningPathSegList);
      this._y = y;
    }
    toString () { return '[object SVGPathSegLinetoVerticalAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._y; }
    clone () { return new SVGPathSegLinetoVerticalAbs(undefined, this._y); }
  }
  Object.defineProperty(SVGPathSegLinetoVerticalAbs.prototype, 'y', {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true});

  class SVGPathSegLinetoVerticalRel extends SVGPathSeg {
    constructor (owningPathSegList, y) {
      super(SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL, 'v', owningPathSegList);
      this._y = y;
    }
    toString () { return '[object SVGPathSegLinetoVerticalRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._y; }
    clone () { return new SVGPathSegLinetoVerticalRel(undefined, this._y); }
  }
  Object.defineProperty(SVGPathSegLinetoVerticalRel.prototype, 'y', {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true});

  class SVGPathSegCurvetoCubicSmoothAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x2, y2) {
      super(SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS, 'S', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x2 = x2;
      this._y2 = y2;
    }
    toString () { return '[object SVGPathSegCurvetoCubicSmoothAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoCubicSmoothAbs(undefined, this._x, this._y, this._x2, this._y2); }
  }
  Object.defineProperties(SVGPathSegCurvetoCubicSmoothAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x2: {get () { return this._x2; }, set (x2) { this._x2 = x2; this._segmentChanged(); }, enumerable: true},
    y2: {get () { return this._y2; }, set (y2) { this._y2 = y2; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoCubicSmoothRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y, x2, y2) {
      super(SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL, 's', owningPathSegList);
      this._x = x;
      this._y = y;
      this._x2 = x2;
      this._y2 = y2;
    }
    toString () { return '[object SVGPathSegCurvetoCubicSmoothRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x2 + ' ' + this._y2 + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoCubicSmoothRel(undefined, this._x, this._y, this._x2, this._y2); }
  }
  Object.defineProperties(SVGPathSegCurvetoCubicSmoothRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true},
    x2: {get () { return this._x2; }, set (x2) { this._x2 = x2; this._segmentChanged(); }, enumerable: true},
    y2: {get () { return this._y2; }, set (y2) { this._y2 = y2; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoQuadraticSmoothAbs extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS, 'T', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegCurvetoQuadraticSmoothAbs]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoQuadraticSmoothAbs(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegCurvetoQuadraticSmoothAbs.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true}
  });

  class SVGPathSegCurvetoQuadraticSmoothRel extends SVGPathSeg {
    constructor (owningPathSegList, x, y) {
      super(SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL, 't', owningPathSegList);
      this._x = x;
      this._y = y;
    }
    toString () { return '[object SVGPathSegCurvetoQuadraticSmoothRel]'; }
    _asPathString () { return this.pathSegTypeAsLetter + ' ' + this._x + ' ' + this._y; }
    clone () { return new SVGPathSegCurvetoQuadraticSmoothRel(undefined, this._x, this._y); }
  }
  Object.defineProperties(SVGPathSegCurvetoQuadraticSmoothRel.prototype, {
    x: {get () { return this._x; }, set (x) { this._x = x; this._segmentChanged(); }, enumerable: true},
    y: {get () { return this._y; }, set (y) { this._y = y; this._segmentChanged(); }, enumerable: true}
  });

  // Add createSVGPathSeg* functions to SVGPathElement.
  // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathElement.
  SVGPathElement.prototype.createSVGPathSegClosePath = function () { return new SVGPathSegClosePath(undefined); };
  SVGPathElement.prototype.createSVGPathSegMovetoAbs = function (x, y) { return new SVGPathSegMovetoAbs(undefined, x, y); };
  SVGPathElement.prototype.createSVGPathSegMovetoRel = function (x, y) { return new SVGPathSegMovetoRel(undefined, x, y); };
  SVGPathElement.prototype.createSVGPathSegLinetoAbs = function (x, y) { return new SVGPathSegLinetoAbs(undefined, x, y); };
  SVGPathElement.prototype.createSVGPathSegLinetoRel = function (x, y) { return new SVGPathSegLinetoRel(undefined, x, y); };
  SVGPathElement.prototype.createSVGPathSegCurvetoCubicAbs = function (x, y, x1, y1, x2, y2) { return new SVGPathSegCurvetoCubicAbs(undefined, x, y, x1, y1, x2, y2); };
  SVGPathElement.prototype.createSVGPathSegCurvetoCubicRel = function (x, y, x1, y1, x2, y2) { return new SVGPathSegCurvetoCubicRel(undefined, x, y, x1, y1, x2, y2); };
  SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticAbs = function (x, y, x1, y1) { return new SVGPathSegCurvetoQuadraticAbs(undefined, x, y, x1, y1); };
  SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticRel = function (x, y, x1, y1) { return new SVGPathSegCurvetoQuadraticRel(undefined, x, y, x1, y1); };
  SVGPathElement.prototype.createSVGPathSegArcAbs = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) { return new SVGPathSegArcAbs(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag); };
  SVGPathElement.prototype.createSVGPathSegArcRel = function (x, y, r1, r2, angle, largeArcFlag, sweepFlag) { return new SVGPathSegArcRel(undefined, x, y, r1, r2, angle, largeArcFlag, sweepFlag); };
  SVGPathElement.prototype.createSVGPathSegLinetoHorizontalAbs = function (x) { return new SVGPathSegLinetoHorizontalAbs(undefined, x); };
  SVGPathElement.prototype.createSVGPathSegLinetoHorizontalRel = function (x) { return new SVGPathSegLinetoHorizontalRel(undefined, x); };
  SVGPathElement.prototype.createSVGPathSegLinetoVerticalAbs = function (y) { return new SVGPathSegLinetoVerticalAbs(undefined, y); };
  SVGPathElement.prototype.createSVGPathSegLinetoVerticalRel = function (y) { return new SVGPathSegLinetoVerticalRel(undefined, y); };
  SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothAbs = function (x, y, x2, y2) { return new SVGPathSegCurvetoCubicSmoothAbs(undefined, x, y, x2, y2); };
  SVGPathElement.prototype.createSVGPathSegCurvetoCubicSmoothRel = function (x, y, x2, y2) { return new SVGPathSegCurvetoCubicSmoothRel(undefined, x, y, x2, y2); };
  SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothAbs = function (x, y) { return new SVGPathSegCurvetoQuadraticSmoothAbs(undefined, x, y); };
  SVGPathElement.prototype.createSVGPathSegCurvetoQuadraticSmoothRel = function (x, y) { return new SVGPathSegCurvetoQuadraticSmoothRel(undefined, x, y); };

  if (!('getPathSegAtLength' in SVGPathElement.prototype)) {
    // Add getPathSegAtLength to SVGPathElement.
    // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-__svg__SVGPathElement__getPathSegAtLength
    // This polyfill requires SVGPathElement.getTotalLength to implement the distance-along-a-path algorithm.
    SVGPathElement.prototype.getPathSegAtLength = function (distance) {
      if (distance === undefined || !isFinite(distance)) {
        throw new Error('Invalid arguments.');
      }

      const measurementElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      measurementElement.setAttribute('d', this.getAttribute('d'));
      let lastPathSegment = measurementElement.pathSegList.numberOfItems - 1;

      // If the path is empty, return 0.
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

  window.SVGPathSeg = SVGPathSeg;
  window.SVGPathSegClosePath = SVGPathSegClosePath;
  window.SVGPathSegMovetoAbs = SVGPathSegMovetoAbs;
  window.SVGPathSegMovetoRel = SVGPathSegMovetoRel;
  window.SVGPathSegLinetoAbs = SVGPathSegLinetoAbs;
  window.SVGPathSegLinetoRel = SVGPathSegLinetoRel;
  window.SVGPathSegCurvetoCubicAbs = SVGPathSegCurvetoCubicAbs;
  window.SVGPathSegCurvetoCubicRel = SVGPathSegCurvetoCubicRel;
  window.SVGPathSegCurvetoQuadraticAbs = SVGPathSegCurvetoQuadraticAbs;
  window.SVGPathSegCurvetoQuadraticRel = SVGPathSegCurvetoQuadraticRel;
  window.SVGPathSegArcAbs = SVGPathSegArcAbs;
  window.SVGPathSegArcRel = SVGPathSegArcRel;
  window.SVGPathSegLinetoHorizontalAbs = SVGPathSegLinetoHorizontalAbs;
  window.SVGPathSegLinetoHorizontalRel = SVGPathSegLinetoHorizontalRel;
  window.SVGPathSegLinetoVerticalAbs = SVGPathSegLinetoVerticalAbs;
  window.SVGPathSegLinetoVerticalRel = SVGPathSegLinetoVerticalRel;
  window.SVGPathSegCurvetoCubicSmoothAbs = SVGPathSegCurvetoCubicSmoothAbs;
  window.SVGPathSegCurvetoCubicSmoothRel = SVGPathSegCurvetoCubicSmoothRel;
  window.SVGPathSegCurvetoQuadraticSmoothAbs = SVGPathSegCurvetoQuadraticSmoothAbs;
  window.SVGPathSegCurvetoQuadraticSmoothRel = SVGPathSegCurvetoQuadraticSmoothRel;
}

// Checking for SVGPathSegList in window checks for the case of an implementation without the
// SVGPathSegList API.
// The second check for appendItem is specific to Firefox 59+ which removed only parts of the
// SVGPathSegList API (e.g., appendItem). In this case we need to re-implement the entire API
// so the polyfill data (i.e., _list) is used throughout.
if (!('SVGPathSegList' in window) || !('appendItem' in window.SVGPathSegList.prototype)) {
  // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGPathSegList
  class SVGPathSegList {
    constructor (pathElement) {
      this._pathElement = pathElement;
      this._list = this._parsePath(this._pathElement.getAttribute('d'));

      // Use a MutationObserver to catch changes to the path's "d" attribute.
      this._mutationObserverConfig = {attributes: true, attributeFilter: ['d']};
      this._pathElementMutationObserver = new MutationObserver(this._updateListFromPathMutations.bind(this));
      this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
    }
    // Process any pending mutations to the path element and update the list as needed.
    // This should be the first call of all public functions and is needed because
    // MutationObservers are not synchronous so we can have pending asynchronous mutations.
    _checkPathSynchronizedToList () {
      this._updateListFromPathMutations(this._pathElementMutationObserver.takeRecords());
    }

    _updateListFromPathMutations (mutationRecords) {
      if (!this._pathElement) {
        return;
      }
      let hasPathMutations = false;
      mutationRecords.forEach((record) => {
        if (record.attributeName === 'd') {
          hasPathMutations = true;
        }
      });
      if (hasPathMutations) {
        this._list = this._parsePath(this._pathElement.getAttribute('d'));
      }
    }

    // Serialize the list and update the path's 'd' attribute.
    _writeListToPath () {
      this._pathElementMutationObserver.disconnect();
      this._pathElement.setAttribute('d', SVGPathSegList._pathSegArrayAsString(this._list));
      this._pathElementMutationObserver.observe(this._pathElement, this._mutationObserverConfig);
    }

    // When a path segment changes the list needs to be synchronized back to the path element.
    segmentChanged (pathSeg) {
      this._writeListToPath();
    }

    clear () {
      this._checkPathSynchronizedToList();

      this._list.forEach((pathSeg) => {
        pathSeg._owningPathSegList = null;
      });
      this._list = [];
      this._writeListToPath();
    }

    initialize (newItem) {
      this._checkPathSynchronizedToList();

      this._list = [newItem];
      newItem._owningPathSegList = this;
      this._writeListToPath();
      return newItem;
    }

    _checkValidIndex (index) {
      if (isNaN(index) || index < 0 || index >= this.numberOfItems) {
        throw new Error('INDEX_SIZE_ERR');
      }
    }

    getItem (index) {
      this._checkPathSynchronizedToList();

      this._checkValidIndex(index);
      return this._list[index];
    }

    insertItemBefore (newItem, index) {
      this._checkPathSynchronizedToList();

      // Spec: If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
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

    replaceItem (newItem, index) {
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

    removeItem (index) {
      this._checkPathSynchronizedToList();

      this._checkValidIndex(index);
      const item = this._list[index];
      this._list.splice(index, 1);
      this._writeListToPath();
      return item;
    }

    appendItem (newItem) {
      this._checkPathSynchronizedToList();

      if (newItem._owningPathSegList) {
        // SVG2 spec says to make a copy.
        newItem = newItem.clone();
      }
      this._list.push(newItem);
      newItem._owningPathSegList = this;
      // TODO: Optimize this to just append to the existing attribute.
      this._writeListToPath();
      return newItem;
    }

    // This closely follows SVGPathParser::parsePath from Source/core/svg/SVGPathParser.cpp.
    _parsePath (string) {
      if (!string || !string.length) {
        return [];
      }

      const owningPathSegList = this; // eslint-disable-line consistent-this

      class Builder {
        constructor () {
          this.pathSegList = [];
        }
        appendSegment (pathSeg) {
          this.pathSegList.push(pathSeg);
        }
      }

      class Source {
        constructor (string) {
          this._string = string;
          this._currentIndex = 0;
          this._endIndex = this._string.length;
          this._previousCommand = SVGPathSeg.PATHSEG_UNKNOWN;

          this._skipOptionalSpaces();
        }
        _isCurrentSpace () {
          const character = this._string[this._currentIndex];
          return character <= ' ' && (character === ' ' || character === '\n' || character === '\t' || character === '\r' || character === '\f');
        }

        _skipOptionalSpaces () {
          while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
            this._currentIndex++;
          }
          return this._currentIndex < this._endIndex;
        }

        _skipOptionalSpacesOrDelimiter () {
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

        hasMoreData () {
          return this._currentIndex < this._endIndex;
        }

        peekSegmentType () {
          const lookahead = this._string[this._currentIndex];
          return this._pathSegTypeFromChar(lookahead);
        }

        _pathSegTypeFromChar (lookahead) {
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

        _nextCommandHelper (lookahead, previousCommand) {
          // Check for remaining coordinates in the current command.
          if ((lookahead === '+' || lookahead === '-' || lookahead === '.' || (lookahead >= '0' && lookahead <= '9')) && previousCommand !== SVGPathSeg.PATHSEG_CLOSEPATH) {
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

        initialCommandIsMoveTo () {
          // If the path is empty it is still valid, so return true.
          if (!this.hasMoreData()) {
            return true;
          }
          const command = this.peekSegmentType();
          // Path must start with moveTo.
          return command === SVGPathSeg.PATHSEG_MOVETO_ABS || command === SVGPathSeg.PATHSEG_MOVETO_REL;
        }

        // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from Source/core/svg/SVGParserUtilities.cpp.
        // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF
        _parseNumber () {
          let exponent = 0;
          let integer = 0;
          let frac = 1;
          let decimal = 0;
          let sign = 1;
          let expsign = 1;

          const startIndex = this._currentIndex;

          this._skipOptionalSpaces();

          // Read the sign.
          if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '+') {
            this._currentIndex++;
          } else if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '-') {
            this._currentIndex++;
            sign = -1;
          }

          if (this._currentIndex === this._endIndex || ((this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') && this._string.charAt(this._currentIndex) !== '.')) {
            // The first character of a number must be one of [0-9+-.].
            return undefined;
          }

          // Read the integer part, build right-to-left.
          const startIntPartIndex = this._currentIndex;
          while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
            this._currentIndex++; // Advance to first non-digit.
          }

          if (this._currentIndex !== startIntPartIndex) {
            let scanIntPartIndex = this._currentIndex - 1;
            let multiplier = 1;
            while (scanIntPartIndex >= startIntPartIndex) {
              integer += multiplier * (this._string.charAt(scanIntPartIndex--) - '0');
              multiplier *= 10;
            }
          }

          // Read the decimals.
          if (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) === '.') {
            this._currentIndex++;

            // There must be a least one digit following the .
            if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
              return undefined;
            }
            while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
              frac *= 10;
              decimal += (this._string.charAt(this._currentIndex) - '0') / frac;
              this._currentIndex += 1;
            }
          }

          // Read the exponent part.
          if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string.charAt(this._currentIndex) === 'e' || this._string.charAt(this._currentIndex) === 'E') && (this._string.charAt(this._currentIndex + 1) !== 'x' && this._string.charAt(this._currentIndex + 1) !== 'm')) {
            this._currentIndex++;

            // Read the sign of the exponent.
            if (this._string.charAt(this._currentIndex) === '+') {
              this._currentIndex++;
            } else if (this._string.charAt(this._currentIndex) === '-') {
              this._currentIndex++;
              expsign = -1;
            }

            // There must be an exponent.
            if (this._currentIndex >= this._endIndex || this._string.charAt(this._currentIndex) < '0' || this._string.charAt(this._currentIndex) > '9') {
              return undefined;
            }

            while (this._currentIndex < this._endIndex && this._string.charAt(this._currentIndex) >= '0' && this._string.charAt(this._currentIndex) <= '9') {
              exponent *= 10;
              exponent += (this._string.charAt(this._currentIndex) - '0');
              this._currentIndex++;
            }
          }

          let number = integer + decimal;
          number *= sign;

          if (exponent) {
            number *= 10 ** (expsign * exponent);
          }

          if (startIndex === this._currentIndex) {
            return undefined;
          }

          this._skipOptionalSpacesOrDelimiter();

          return number;
        }

        _parseArcFlag () {
          if (this._currentIndex >= this._endIndex) {
            return undefined;
          }
          let flag = false;
          const flagChar = this._string.charAt(this._currentIndex++);
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

        parseSegment () {
          const lookahead = this._string[this._currentIndex];
          let command = this._pathSegTypeFromChar(lookahead);
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
          case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), x2: this._parseNumber(), y2: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoCubicRel(owningPathSegList, points.x, points.y, points.x1, points.y1, points.x2, points.y2);
          } case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), x2: this._parseNumber(), y2: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoCubicAbs(owningPathSegList, points.x, points.y, points.x1, points.y1, points.x2, points.y2);
          } case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL: {
            const points = {x2: this._parseNumber(), y2: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoCubicSmoothRel(owningPathSegList, points.x, points.y, points.x2, points.y2);
          } case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS: {
            const points = {x2: this._parseNumber(), y2: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoCubicSmoothAbs(owningPathSegList, points.x, points.y, points.x2, points.y2);
          } case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoQuadraticRel(owningPathSegList, points.x, points.y, points.x1, points.y1);
          } case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegCurvetoQuadraticAbs(owningPathSegList, points.x, points.y, points.x1, points.y1);
          } case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
            return new SVGPathSegCurvetoQuadraticSmoothRel(owningPathSegList, this._parseNumber(), this._parseNumber());
          case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
            return new SVGPathSegCurvetoQuadraticSmoothAbs(owningPathSegList, this._parseNumber(), this._parseNumber());
          case SVGPathSeg.PATHSEG_ARC_REL: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), arcAngle: this._parseNumber(), arcLarge: this._parseArcFlag(), arcSweep: this._parseArcFlag(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegArcRel(owningPathSegList, points.x, points.y, points.x1, points.y1, points.arcAngle, points.arcLarge, points.arcSweep);
          } case SVGPathSeg.PATHSEG_ARC_ABS: {
            const points = {x1: this._parseNumber(), y1: this._parseNumber(), arcAngle: this._parseNumber(), arcLarge: this._parseArcFlag(), arcSweep: this._parseArcFlag(), x: this._parseNumber(), y: this._parseNumber()};
            return new SVGPathSegArcAbs(owningPathSegList, points.x, points.y, points.x1, points.y1, points.arcAngle, points.arcLarge, points.arcSweep);
          } default:
            throw new Error('Unknown path seg type.');
          }
        }
      }

      const builder = new Builder();
      const source = new Source(string);

      if (!source.initialCommandIsMoveTo()) {
        return [];
      }
      while (source.hasMoreData()) {
        const pathSeg = source.parseSegment();
        if (!pathSeg) {
          return [];
        }
        builder.appendSegment(pathSeg);
      }

      return builder.pathSegList;
    }

    // STATIC
    static _pathSegArrayAsString (pathSegArray) {
      let string = '';
      let first = true;
      pathSegArray.forEach((pathSeg) => {
        if (first) {
          first = false;
          string += pathSeg._asPathString();
        } else {
          string += ' ' + pathSeg._asPathString();
        }
      });
      return string;
    }
  }

  SVGPathSegList.prototype.classname = 'SVGPathSegList';

  Object.defineProperty(SVGPathSegList.prototype, 'numberOfItems', {
    get () {
      this._checkPathSynchronizedToList();
      return this._list.length;
    },
    enumerable: true
  });

  // Add the pathSegList accessors to SVGPathElement.
  // Spec: https://www.w3.org/TR/SVG11/single-page.html#paths-InterfaceSVGAnimatedPathData
  Object.defineProperties(SVGPathElement.prototype, {
    pathSegList: {
      get () {
        if (!this._pathSegList) {
          this._pathSegList = new SVGPathSegList(this);
        }
        return this._pathSegList;
      },
      enumerable: true
    },
    // TODO: The following are not implemented and simply return SVGPathElement.pathSegList.
    normalizedPathSegList: {get () { return this.pathSegList; }, enumerable: true},
    animatedPathSegList: {get () { return this.pathSegList; }, enumerable: true},
    animatedNormalizedPathSegList: {get () { return this.pathSegList; }, enumerable: true}
  });
  window.SVGPathSegList = SVGPathSegList;
}
})();
