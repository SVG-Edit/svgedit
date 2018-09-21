/* eslint-disable new-cap */
// Todo: Compare with latest canvg (add any improvements of ours) and add full JSDocs (denoting links to standard APIs and which are custom): https://github.com/canvg/canvg
/**
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * @module canvg
 * @license MIT
 * @author Gabe Lerner <gabelerner@gmail.com>
 * @see https://github.com/canvg/canvg
 */

import RGBColor from './rgbcolor.js';
import {canvasRGBA} from './StackBlur.js';

let canvasRGBA_ = canvasRGBA;

/**
* @callback module:canvg.StackBlurCanvasRGBA
* @param {string} id
* @param {Float} x
* @param {Float} y
* @param {Float} width
* @param {Float} height
* @param {Float} blurRadius
*/

/**
* @callback module:canvg.ForceRedraw
* @returns {boolean}
*/

/**
* @function module:canvg.setStackBlurCanvasRGBA
* @param {module:canvg.StackBlurCanvasRGBA} cb Will be passed the canvas ID, x, y, width, height, blurRadius
*/
export const setStackBlurCanvasRGBA = (cb) => {
  canvasRGBA_ = cb;
};

/**
* @typedef {PlainObject} module:canvg.CanvgOptions
* @property {boolean} opts.ignoreMouse true => ignore mouse events
* @property {boolean} opts.ignoreAnimation true => ignore animations
* @property {boolean} opts.ignoreDimensions true => does not try to resize canvas
* @property {boolean} opts.ignoreClear true => does not clear canvas
* @property {Integer} opts.offsetX int => draws at a x offset
* @property {Integer} opts.offsetY int => draws at a y offset
* @property {Integer} opts.scaleWidth int => scales horizontally to width
* @property {Integer} opts.scaleHeight int => scales vertically to height
* @property {module:canvg.ForceRedraw} opts.forceRedraw function => will call the function on every frame, if it returns true, will redraw
* @property {boolean} opts.log Adds log function
* @property {boolean} opts.useCORS Whether to set CORS `crossOrigin` for the image to `Anonymous`
*/

/**
* If called with no arguments, it will replace all `<svg>` elements on the page with `<canvas>` elements
* @function module:canvg.canvg
* @param {HTMLCanvasElement|string} target canvas element or the id of a canvas element
* @param {string|XMLDocument} s: svg string, url to svg file, or xml document
* @param {module:canvg.CanvgOptions} [opts] Optional hash of options
* @returns {Promise} All the function after the first render is completed with dom
*/
export const canvg = function (target, s, opts) {
  // no parameters
  if (target == null && s == null && opts == null) {
    const svgTags = document.querySelectorAll('svg');
    return Promise.all([...svgTags].map((svgTag) => {
      const c = document.createElement('canvas');
      c.width = svgTag.clientWidth;
      c.height = svgTag.clientHeight;
      svgTag.before(c);
      svgTag.remove();
      const div = document.createElement('div');
      div.append(svgTag);
      return canvg(c, div.innerHTML);
    }));
  }

  if (typeof target === 'string') {
    target = document.getElementById(target);
  }

  // store class on canvas
  if (target.svg != null) target.svg.stop();
  const svg = build(opts || {});
  // on i.e. 8 for flash canvas, we can't assign the property so check for it
  if (!(target.childNodes.length === 1 && target.childNodes[0].nodeName === 'OBJECT')) {
    target.svg = svg;
  }

  const ctx = target.getContext('2d');
  if (typeof s.documentElement !== 'undefined') {
    // load from xml doc
    return svg.loadXmlDoc(ctx, s);
  }
  if (s.substr(0, 1) === '<') {
    // load from xml string
    return svg.loadXml(ctx, s);
  }
  // load from url
  return svg.load(ctx, s);
};

/**
* @param {module:canvg.CanvgOptions} opts
* @returns {object}
* @todo Flesh out exactly what object is returned here (after updating to latest and reincluding our changes here and those of StackBlur)
*/
function build (opts) {
  const svg = {opts};

  svg.FRAMERATE = 30;
  svg.MAX_VIRTUAL_PIXELS = 30000;

  svg.log = function (msg) {};
  if (svg.opts.log === true && typeof console !== 'undefined') {
    svg.log = function (msg) { console.log(msg); };
  }

  // globals
  svg.init = function (ctx) {
    let uniqueId = 0;
    svg.UniqueId = function () {
      uniqueId++;
      return 'canvg' + uniqueId;
    };
    svg.Definitions = {};
    svg.Styles = {};
    svg.Animations = [];
    svg.Images = [];
    svg.ctx = ctx;
    svg.ViewPort = {
      viewPorts: [],
      Clear () { this.viewPorts = []; },
      SetCurrent (width, height) { this.viewPorts.push({width, height}); },
      RemoveCurrent () { this.viewPorts.pop(); },
      Current () { return this.viewPorts[this.viewPorts.length - 1]; },
      width () { return this.Current().width; },
      height () { return this.Current().height; },
      ComputeSize (d) {
        if (d != null && typeof d === 'number') return d;
        if (d === 'x') return this.width();
        if (d === 'y') return this.height();
        return Math.sqrt(
          Math.pow(this.width(), 2) + Math.pow(this.height(), 2)
        ) / Math.sqrt(2);
      }
    };
  };
  svg.init();

  // images loaded
  svg.ImagesLoaded = function () {
    return svg.Images.every((img) => img.loaded);
  };

  // trim
  svg.trim = function (s) {
    return s.replace(/^\s+|\s+$/g, '');
  };

  // compress spaces
  svg.compressSpaces = function (s) {
    return s.replace(/[\s\r\t\n]+/gm, ' ');
  };

  // ajax
  svg.ajax = function (url, asynch) {
    const AJAX = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new window.ActiveXObject('Microsoft.XMLHTTP');
    if (asynch) {
      return new Promise((resolve, reject) => {
        const req = AJAX.open('GET', url, true);
        req.addEventListener('load', () => {
          resolve(AJAX.responseText);
        });
        AJAX.send(null);
      });
    }

    AJAX.open('GET', url, false);
    AJAX.send(null);
    return AJAX.responseText;
  };

  // parse xml
  svg.parseXml = function (xml) {
    if (window.DOMParser) {
      const parser = new DOMParser();
      return parser.parseFromString(xml, 'text/xml');
    } else {
      xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
      const xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(xml);
      return xmlDoc;
    }
  };

  // text extensions
  // get the text baseline
  const textBaselineMapping = {
    baseline: 'alphabetic',
    'before-edge': 'top',
    'text-before-edge': 'top',
    middle: 'middle',
    central: 'middle',
    'after-edge': 'bottom',
    'text-after-edge': 'bottom',
    ideographic: 'ideographic',
    alphabetic: 'alphabetic',
    hanging: 'hanging',
    mathematical: 'alphabetic'
  };

  svg.Property = class Property {
    constructor (name, value) {
      this.name = name;
      this.value = value;
    }

    getValue () {
      return this.value;
    }

    hasValue () {
      return (this.value != null && this.value !== '');
    }

    // return the numerical value of the property
    numValue () {
      if (!this.hasValue()) return 0;

      let n = parseFloat(this.value);
      if ((this.value + '').match(/%$/)) {
        n = n / 100.0;
      }
      return n;
    }

    valueOrDefault (def) {
      if (this.hasValue()) return this.value;
      return def;
    }

    numValueOrDefault (def) {
      if (this.hasValue()) return this.numValue();
      return def;
    }

    // color extensions
    // augment the current color value with the opacity
    addOpacity (opacityProp) {
      let newValue = this.value;
      if (opacityProp.value != null && opacityProp.value !== '' && typeof this.value === 'string') { // can only add opacity to colors, not patterns
        const color = new RGBColor(this.value);
        if (color.ok) {
          newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';
        }
      }
      return new svg.Property(this.name, newValue);
    }

    // definition extensions
    // get the definition from the definitions table
    getDefinition () {
      let name = this.value.match(/#([^)'"]+)/);
      if (name) { name = name[1]; }
      if (!name) { name = this.value; }
      return svg.Definitions[name];
    }

    isUrlDefinition () {
      return this.value.startsWith('url(');
    }

    getFillStyleDefinition (e, opacityProp) {
      let def = this.getDefinition();

      // gradient
      if (def != null && def.createGradient) {
        return def.createGradient(svg.ctx, e, opacityProp);
      }

      // pattern
      if (def != null && def.createPattern) {
        if (def.getHrefAttribute().hasValue()) {
          const pt = def.attribute('patternTransform');
          def = def.getHrefAttribute().getDefinition();
          if (pt.hasValue()) { def.attribute('patternTransform', true).value = pt.value; }
        }
        return def.createPattern(svg.ctx, e);
      }

      return null;
    }

    // length extensions
    getDPI (viewPort) {
      return 96.0; // TODO: compute?
    }

    getEM (viewPort) {
      let em = 12;

      const fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
      if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);

      return em;
    }

    getUnits () {
      const s = this.value + '';
      return s.replace(/[0-9.-]/g, '');
    }

    // get the length as pixels
    toPixels (viewPort, processPercent) {
      if (!this.hasValue()) return 0;
      const s = this.value + '';
      if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
      if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
      if (s.match(/px$/)) return this.numValue();
      if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
      if (s.match(/pc$/)) return this.numValue() * 15;
      if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
      if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
      if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
      if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
      const n = this.numValue();
      if (processPercent && n < 1.0) return n * svg.ViewPort.ComputeSize(viewPort);
      return n;
    }

    // time extensions
    // get the time as milliseconds
    toMilliseconds () {
      if (!this.hasValue()) return 0;
      const s = this.value + '';
      if (s.match(/s$/)) return this.numValue() * 1000;
      if (s.match(/ms$/)) return this.numValue();
      return this.numValue();
    }

    // angle extensions
    // get the angle as radians
    toRadians () {
      if (!this.hasValue()) return 0;
      const s = this.value + '';
      if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
      if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
      if (s.match(/rad$/)) return this.numValue();
      return this.numValue() * (Math.PI / 180.0);
    }

    toTextBaseline () {
      if (!this.hasValue()) return null;
      return textBaselineMapping[this.value];
    }
  };

  // fonts
  svg.Font = {
    Styles: 'normal|italic|oblique|inherit',
    Variants: 'normal|small-caps|inherit',
    Weights: 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit',

    CreateFont (fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
      const f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
      return {
        fontFamily: fontFamily || f.fontFamily,
        fontSize: fontSize || f.fontSize,
        fontStyle: fontStyle || f.fontStyle,
        fontWeight: fontWeight || f.fontWeight,
        fontVariant: fontVariant || f.fontVariant,
        toString () {
          return [
            this.fontStyle, this.fontVariant, this.fontWeight,
            this.fontSize, this.fontFamily
          ].join(' ');
        }
      };
    },

    Parse (s) {
      const f = {};
      const d = svg.trim(svg.compressSpaces(s || '')).split(' ');
      const set = {
        fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false
      };
      let ff = '';
      d.forEach((d) => {
        if (!set.fontStyle && this.Styles.includes(d)) {
          if (d !== 'inherit') {
            f.fontStyle = d;
          }
          set.fontStyle = true;
        } else if (!set.fontVariant && this.Variants.includes(d)) {
          if (d !== 'inherit') {
            f.fontVariant = d;
          }
          set.fontStyle = set.fontVariant = true;
        } else if (!set.fontWeight && this.Weights.includes(d)) {
          if (d !== 'inherit') {
            f.fontWeight = d;
          }
          set.fontStyle = set.fontVariant = set.fontWeight = true;
        } else if (!set.fontSize) {
          if (d !== 'inherit') {
            f.fontSize = d.split('/')[0];
          }
          set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true;
        } else {
          if (d !== 'inherit') { ff += d; }
        }
      });
      if (ff !== '') { f.fontFamily = ff; }
      return f;
    }
  };

  // points and paths
  svg.ToNumberArray = function (s) {
    const a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
    return a.map((a) => parseFloat(a));
  };
  svg.Point = class {
    constructor (x, y) {
      this.x = x;
      this.y = y;
    }

    angleTo (p) {
      return Math.atan2(p.y - this.y, p.x - this.x);
    }

    applyTransform (v) {
      const xp = this.x * v[0] + this.y * v[2] + v[4];
      const yp = this.x * v[1] + this.y * v[3] + v[5];
      this.x = xp;
      this.y = yp;
    }
  };

  svg.CreatePoint = function (s) {
    const a = svg.ToNumberArray(s);
    return new svg.Point(a[0], a[1]);
  };
  svg.CreatePath = function (s) {
    const a = svg.ToNumberArray(s);
    const path = [];
    for (let i = 0; i < a.length; i += 2) {
      path.push(new svg.Point(a[i], a[i + 1]));
    }
    return path;
  };

  // bounding box
  svg.BoundingBox = class {
    constructor (x1, y1, x2, y2) { // pass in initial points if you want
      this.x1 = Number.NaN;
      this.y1 = Number.NaN;
      this.x2 = Number.NaN;
      this.y2 = Number.NaN;
      this.addPoint(x1, y1);
      this.addPoint(x2, y2);
    }

    x () { return this.x1; }
    y () { return this.y1; }
    width () { return this.x2 - this.x1; }
    height () { return this.y2 - this.y1; }

    addPoint (x, y) {
      if (x != null) {
        if (isNaN(this.x1) || isNaN(this.x2)) {
          this.x1 = x;
          this.x2 = x;
        }
        if (x < this.x1) this.x1 = x;
        if (x > this.x2) this.x2 = x;
      }

      if (y != null) {
        if (isNaN(this.y1) || isNaN(this.y2)) {
          this.y1 = y;
          this.y2 = y;
        }
        if (y < this.y1) this.y1 = y;
        if (y > this.y2) this.y2 = y;
      }
    }
    addX (x) { this.addPoint(x, null); }
    addY (y) { this.addPoint(null, y); }

    addBoundingBox (bb) {
      this.addPoint(bb.x1, bb.y1);
      this.addPoint(bb.x2, bb.y2);
    }

    addQuadraticCurve (p0x, p0y, p1x, p1y, p2x, p2y) {
      const cp1x = p0x + 2 / 3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
      const cp1y = p0y + 2 / 3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
      const cp2x = cp1x + 1 / 3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
      const cp2y = cp1y + 1 / 3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
      this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
    }

    addBezierCurve (p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
      // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
      const p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
      this.addPoint(p0[0], p0[1]);
      this.addPoint(p3[0], p3[1]);

      for (let i = 0; i <= 1; i++) {
        const f = function (t) {
          return Math.pow(1 - t, 3) * p0[i] +
          3 * Math.pow(1 - t, 2) * t * p1[i] +
          3 * (1 - t) * Math.pow(t, 2) * p2[i] +
          Math.pow(t, 3) * p3[i];
        };

        const b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
        const a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
        const c = 3 * p1[i] - 3 * p0[i];

        if (a === 0) {
          if (b === 0) continue;
          const t = -c / b;
          if (t > 0 && t < 1) {
            if (i === 0) this.addX(f(t));
            if (i === 1) this.addY(f(t));
          }
          continue;
        }

        const b2ac = Math.pow(b, 2) - 4 * c * a;
        if (b2ac < 0) continue;
        const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
        if (t1 > 0 && t1 < 1) {
          if (i === 0) this.addX(f(t1));
          if (i === 1) this.addY(f(t1));
        }
        const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
        if (t2 > 0 && t2 < 1) {
          if (i === 0) this.addX(f(t2));
          if (i === 1) this.addY(f(t2));
        }
      }
    }

    isPointInBox (x, y) {
      return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
    }
  };

  // transforms
  svg.Transform = class {
    constructor (v) {
      this.Type = {
        translate: class {
          constructor (s) {
            this.p = svg.CreatePoint(s);
            this.apply = function (ctx) {
              ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
            };
            this.unapply = function (ctx) {
              ctx.translate(-1.0 * this.p.x || 0.0, -1.0 * this.p.y || 0.0);
            };
            this.applyToPoint = function (p) {
              p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
            };
          }
        },
        rotate: class {
          constructor (s) {
            const a = svg.ToNumberArray(s);
            this.angle = new svg.Property('angle', a[0]);
            this.cx = a[1] || 0;
            this.cy = a[2] || 0;
            this.apply = function (ctx) {
              ctx.translate(this.cx, this.cy);
              ctx.rotate(this.angle.toRadians());
              ctx.translate(-this.cx, -this.cy);
            };
            this.unapply = function (ctx) {
              ctx.translate(this.cx, this.cy);
              ctx.rotate(-1.0 * this.angle.toRadians());
              ctx.translate(-this.cx, -this.cy);
            };
            this.applyToPoint = function (p) {
              const a = this.angle.toRadians();
              p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
              p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
              p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
            };
          }
        },
        scale: class {
          constructor (s) {
            this.p = svg.CreatePoint(s);
            this.apply = function (ctx) {
              ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
            };
            this.unapply = function (ctx) {
              ctx.scale(1.0 / this.p.x || 1.0, 1.0 / this.p.y || this.p.x || 1.0);
            };
            this.applyToPoint = function (p) {
              p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
            };
          }
        },
        matrix: class {
          constructor (s) {
            this.m = svg.ToNumberArray(s);
            this.apply = function (ctx) {
              ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
            };
            this.applyToPoint = function (p) {
              p.applyTransform(this.m);
            };
          }
        }
      };
      Object.assign(this.Type, {
        SkewBase: class extends this.Type.matrix {
          constructor (s) {
            super(s);
            this.angle = new svg.Property('angle', s);
          }
        }
      });
      Object.assign(this.Type, {
        skewX: class extends this.Type.SkewBase {
          constructor (s) {
            super(s);
            this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
          }
        },
        skewY: class extends this.Type.SkewBase {
          constructor (s) {
            super(s);
            this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
          }
        }
      });

      const data = svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);
      this.transforms = data.map((d) => {
        const type = svg.trim(d.split('(')[0]);
        const s = d.split('(')[1].replace(')', '');
        const transform = new this.Type[type](s);
        transform.type = type;
        return transform;
      });
    }

    apply (ctx) {
      this.transforms.forEach((transform) => {
        transform.apply(ctx);
      });
    }

    unapply (ctx) {
      for (let i = this.transforms.length - 1; i >= 0; i--) {
        this.transforms[i].unapply(ctx);
      }
    }

    applyToPoint (p) {
      this.transforms.forEach((transform) => {
        transform.applyToPoint(p);
      });
    }
  };

  // aspect ratio
  svg.AspectRatio = function (ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
    // aspect ratio - https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
    aspectRatio = svg.compressSpaces(aspectRatio);
    aspectRatio = aspectRatio.replace(/^defer\s/, ''); // ignore defer
    const align = aspectRatio.split(' ')[0] || 'xMidYMid';
    const meetOrSlice = aspectRatio.split(' ')[1] || 'meet';

    // calculate scale
    const scaleX = width / desiredWidth;
    const scaleY = height / desiredHeight;
    const scaleMin = Math.min(scaleX, scaleY);
    const scaleMax = Math.max(scaleX, scaleY);
    if (meetOrSlice === 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
    if (meetOrSlice === 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }

    refX = new svg.Property('refX', refX);
    refY = new svg.Property('refY', refY);
    if (refX.hasValue() && refY.hasValue()) {
      ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
    } else {
      // align
      if (align.match(/^xMid/) && ((meetOrSlice === 'meet' && scaleMin === scaleY) || (meetOrSlice === 'slice' && scaleMax === scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
      if (align.match(/YMid$/) && ((meetOrSlice === 'meet' && scaleMin === scaleX) || (meetOrSlice === 'slice' && scaleMax === scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
      if (align.match(/^xMax/) && ((meetOrSlice === 'meet' && scaleMin === scaleY) || (meetOrSlice === 'slice' && scaleMax === scaleY))) ctx.translate(width - desiredWidth, 0);
      if (align.match(/YMax$/) && ((meetOrSlice === 'meet' && scaleMin === scaleX) || (meetOrSlice === 'slice' && scaleMax === scaleX))) ctx.translate(0, height - desiredHeight);
    }

    // scale
    if (align === 'none') ctx.scale(scaleX, scaleY);
    else if (meetOrSlice === 'meet') ctx.scale(scaleMin, scaleMin);
    else if (meetOrSlice === 'slice') ctx.scale(scaleMax, scaleMax);

    // translate
    ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
  };

  // elements
  svg.Element = {};

  svg.EmptyProperty = new svg.Property('EMPTY', '');

  svg.Element.ElementBase = class {
    constructor (node) {
      this.captureTextNodes = arguments[1]; // Argument from inheriting class
      this.attributes = {};
      this.styles = {};
      this.children = [];
      if (node != null && node.nodeType === 1) { // ELEMENT_NODE
        // add children
        [...node.childNodes].forEach((childNode) => {
          if (childNode.nodeType === 1) {
            this.addChild(childNode, true); // ELEMENT_NODE
          }
          if (this.captureTextNodes && (
            childNode.nodeType === 3 || childNode.nodeType === 4
          )) {
            const text = childNode.nodeValue || childNode.text || '';
            if (svg.trim(svg.compressSpaces(text)) !== '') {
              this.addChild(new svg.Element.tspan(childNode), false); // TEXT_NODE
            }
          }
        });

        // add attributes
        [...node.attributes].forEach(({nodeName, nodeValue}) => {
          this.attributes[nodeName] = new svg.Property(
            nodeName,
            nodeValue
          );
        });
        // add tag styles
        let styles = svg.Styles[node.nodeName];
        if (styles != null) {
          for (const name in styles) {
            this.styles[name] = styles[name];
          }
        }

        // add class styles
        if (this.attribute('class').hasValue()) {
          const classes = svg.compressSpaces(this.attribute('class').value).split(' ');
          classes.forEach((clss) => {
            styles = svg.Styles['.' + clss];
            if (styles != null) {
              for (const name in styles) {
                this.styles[name] = styles[name];
              }
            }
            styles = svg.Styles[node.nodeName + '.' + clss];
            if (styles != null) {
              for (const name in styles) {
                this.styles[name] = styles[name];
              }
            }
          });
        }

        // add id styles
        if (this.attribute('id').hasValue()) {
          const styles = svg.Styles['#' + this.attribute('id').value];
          if (styles != null) {
            for (const name in styles) {
              this.styles[name] = styles[name];
            }
          }
        }

        // add inline styles
        if (this.attribute('style').hasValue()) {
          const styles = this.attribute('style').value.split(';');
          styles.forEach((style) => {
            if (svg.trim(style) !== '') {
              let {name, value} = style.split(':');
              name = svg.trim(name);
              value = svg.trim(value);
              this.styles[name] = new svg.Property(name, value);
            }
          });
        }

        // add id
        if (this.attribute('id').hasValue()) {
          if (svg.Definitions[this.attribute('id').value] == null) {
            svg.Definitions[this.attribute('id').value] = this;
          }
        }
      }
    }

    // get or create attribute
    attribute (name, createIfNotExists) {
      let a = this.attributes[name];
      if (a != null) return a;

      if (createIfNotExists === true) { a = new svg.Property(name, ''); this.attributes[name] = a; }
      return a || svg.EmptyProperty;
    }

    getHrefAttribute () {
      for (const a in this.attributes) {
        if (a.match(/:href$/)) {
          return this.attributes[a];
        }
      }
      return svg.EmptyProperty;
    }

    // get or create style, crawls up node tree
    style (name, createIfNotExists, skipAncestors) {
      let s = this.styles[name];
      if (s != null) return s;

      const a = this.attribute(name);
      if (a != null && a.hasValue()) {
        this.styles[name] = a; // move up to me to cache
        return a;
      }

      if (skipAncestors !== true) {
        const p = this.parent;
        if (p != null) {
          const ps = p.style(name);
          if (ps != null && ps.hasValue()) {
            return ps;
          }
        }
      }

      if (createIfNotExists === true) { s = new svg.Property(name, ''); this.styles[name] = s; }
      return s || svg.EmptyProperty;
    }

    // base render
    render (ctx) {
      // don't render display=none
      if (this.style('display').value === 'none') return;

      // don't render visibility=hidden
      if (this.style('visibility').value === 'hidden') return;

      ctx.save();
      if (this.attribute('mask').hasValue()) { // mask
        const mask = this.attribute('mask').getDefinition();
        if (mask != null) mask.apply(ctx, this);
      } else if (this.style('filter').hasValue()) { // filter
        const filter = this.style('filter').getDefinition();
        if (filter != null) filter.apply(ctx, this);
      } else {
        this.setContext(ctx);
        this.renderChildren(ctx);
        this.clearContext(ctx);
      }
      ctx.restore();
    }

    // base set context
    setContext (ctx) {
      // OVERRIDE ME!
    }

    // base clear context
    clearContext (ctx) {
      // OVERRIDE ME!
    }

    // base render children
    renderChildren (ctx) {
      this.children.forEach((child) => {
        child.render(ctx);
      });
    }

    addChild (childNode, create) {
      const child = create
        ? svg.CreateElement(childNode)
        : childNode;
      child.parent = this;
      if (child.type !== 'title') { this.children.push(child); }
    }
  };

  svg.Element.RenderedElementBase = class extends svg.Element.ElementBase {
    setContext (ctx) {
      // fill
      if (this.style('fill').isUrlDefinition()) {
        const fs = this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));
        if (fs != null) ctx.fillStyle = fs;
      } else if (this.style('fill').hasValue()) {
        const fillStyle = this.style('fill');
        if (fillStyle.value === 'currentColor') fillStyle.value = this.style('color').value;
        ctx.fillStyle = (fillStyle.value === 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
      }
      if (this.style('fill-opacity').hasValue()) {
        let fillStyle = new svg.Property('fill', ctx.fillStyle);
        fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));
        ctx.fillStyle = fillStyle.value;
      }

      // stroke
      if (this.style('stroke').isUrlDefinition()) {
        const fs = this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));
        if (fs != null) ctx.strokeStyle = fs;
      } else if (this.style('stroke').hasValue()) {
        const strokeStyle = this.style('stroke');
        if (strokeStyle.value === 'currentColor') strokeStyle.value = this.style('color').value;
        ctx.strokeStyle = (strokeStyle.value === 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
      }
      if (this.style('stroke-opacity').hasValue()) {
        let strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
        strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));
        ctx.strokeStyle = strokeStyle.value;
      }
      if (this.style('stroke-width').hasValue()) {
        const newLineWidth = this.style('stroke-width').toPixels();
        ctx.lineWidth = newLineWidth === 0 ? 0.001 : newLineWidth; // browsers don't respect 0
      }
      if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
      if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
      if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;
      if (this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value !== 'none') {
        const gaps = svg.ToNumberArray(this.style('stroke-dasharray').value);
        if (typeof ctx.setLineDash !== 'undefined') {
          ctx.setLineDash(gaps);
        } else if (typeof ctx.webkitLineDash !== 'undefined') {
          ctx.webkitLineDash = gaps;
        } else if (typeof ctx.mozDash !== 'undefined' && !(gaps.length === 1 && gaps[0] === 0)) {
          ctx.mozDash = gaps;
        }

        const offset = this.style('stroke-dashoffset').numValueOrDefault(1);
        if (typeof ctx.lineDashOffset !== 'undefined') {
          ctx.lineDashOffset = offset;
        } else if (typeof ctx.webkitLineDashOffset !== 'undefined') {
          ctx.webkitLineDashOffset = offset;
        } else if (typeof ctx.mozDashOffset !== 'undefined') {
          ctx.mozDashOffset = offset;
        }
      }

      // font
      if (typeof ctx.font !== 'undefined') {
        ctx.font = svg.Font.CreateFont(
          this.style('font-style').value,
          this.style('font-variant').value,
          this.style('font-weight').value,
          this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '',
          this.style('font-family').value).toString();
      }

      // transform
      if (this.attribute('transform').hasValue()) {
        const transform = new svg.Transform(this.attribute('transform').value);
        transform.apply(ctx);
      }

      // clip
      if (this.style('clip-path', false, true).hasValue()) {
        const clip = this.style('clip-path', false, true).getDefinition();
        if (clip != null) clip.apply(ctx);
      }

      // opacity
      if (this.style('opacity').hasValue()) {
        ctx.globalAlpha = this.style('opacity').numValue();
      }
    }
  };

  svg.Element.PathElementBase = class extends svg.Element.RenderedElementBase {
    path (ctx) {
      if (ctx != null) ctx.beginPath();
      return new svg.BoundingBox();
    }

    renderChildren (ctx) {
      this.path(ctx);
      svg.Mouse.checkPath(this, ctx);
      if (ctx.fillStyle !== '') {
        if (this.style('fill-rule').valueOrDefault('inherit') !== 'inherit') {
          ctx.fill(this.style('fill-rule').value);
        } else {
          ctx.fill();
        }
      }
      if (ctx.strokeStyle !== '') ctx.stroke();

      const markers = this.getMarkers();
      if (markers != null) {
        if (this.style('marker-start').isUrlDefinition()) {
          const marker = this.style('marker-start').getDefinition();
          marker.render(ctx, markers[0][0], markers[0][1]);
        }
        if (this.style('marker-mid').isUrlDefinition()) {
          const marker = this.style('marker-mid').getDefinition();
          for (let i = 1; i < markers.length - 1; i++) {
            marker.render(ctx, markers[i][0], markers[i][1]);
          }
        }
        if (this.style('marker-end').isUrlDefinition()) {
          const marker = this.style('marker-end').getDefinition();
          marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1]);
        }
      }
    }

    getBoundingBox () {
      return this.path();
    }

    getMarkers () {
      return null;
    }
  };

  // svg element
  svg.Element.svg = class extends svg.Element.RenderedElementBase {
    clearContext (ctx) {
      super.clearContext(ctx);
      svg.ViewPort.RemoveCurrent();
    }

    setContext (ctx) {
      // initial values and defaults
      ctx.strokeStyle = 'rgba(0,0,0,0)';
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 4;
      if (typeof ctx.font !== 'undefined' && typeof window.getComputedStyle !== 'undefined') {
        ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');
      }

      super.setContext(ctx);

      // create new view port
      if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
      if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
      ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));

      let width = svg.ViewPort.width();
      let height = svg.ViewPort.height();

      if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
      if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
      if (typeof this.root === 'undefined') {
        width = this.attribute('width').toPixels('x');
        height = this.attribute('height').toPixels('y');

        let x = 0;
        let y = 0;
        if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
          x = -this.attribute('refX').toPixels('x');
          y = -this.attribute('refY').toPixels('y');
        }

        if (this.attribute('overflow').valueOrDefault('hidden') !== 'visible') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(width, y);
          ctx.lineTo(width, height);
          ctx.lineTo(x, height);
          ctx.closePath();
          ctx.clip();
        }
      }
      svg.ViewPort.SetCurrent(width, height);

      // viewbox
      if (this.attribute('viewBox').hasValue()) {
        const viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
        const minX = viewBox[0];
        const minY = viewBox[1];
        width = viewBox[2];
        height = viewBox[3];

        svg.AspectRatio(
          ctx,
          this.attribute('preserveAspectRatio').value,
          svg.ViewPort.width(),
          width,
          svg.ViewPort.height(),
          height,
          minX,
          minY,
          this.attribute('refX').value,
          this.attribute('refY').value
        );

        svg.ViewPort.RemoveCurrent();
        svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
      }
    }
  };

  // rect element
  svg.Element.rect = class extends svg.Element.PathElementBase {
    path (ctx) {
      const x = this.attribute('x').toPixels('x');
      const y = this.attribute('y').toPixels('y');
      const width = this.attribute('width').toPixels('x');
      const height = this.attribute('height').toPixels('y');
      let rx = this.attribute('rx').toPixels('x');
      let ry = this.attribute('ry').toPixels('y');
      if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
      if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
      rx = Math.min(rx, width / 2.0);
      ry = Math.min(ry, height / 2.0);
      if (ctx != null) {
        ctx.beginPath();
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + width - rx, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + ry);
        ctx.lineTo(x + width, y + height - ry);
        ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);
        ctx.lineTo(x + rx, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - ry);
        ctx.lineTo(x, y + ry);
        ctx.quadraticCurveTo(x, y, x + rx, y);
        ctx.closePath();
      }

      return new svg.BoundingBox(x, y, x + width, y + height);
    }
  };

  // circle element
  svg.Element.circle = class extends svg.Element.PathElementBase {
    path (ctx) {
      const cx = this.attribute('cx').toPixels('x');
      const cy = this.attribute('cy').toPixels('y');
      const r = this.attribute('r').toPixels();

      if (ctx != null) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
        ctx.closePath();
      }

      return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
    }
  };

  // ellipse element
  const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
  svg.Element.ellipse = class extends svg.Element.PathElementBase {
    path (ctx) {
      const rx = this.attribute('rx').toPixels('x');
      const ry = this.attribute('ry').toPixels('y');
      const cx = this.attribute('cx').toPixels('x');
      const cy = this.attribute('cy').toPixels('y');

      if (ctx != null) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - ry);
        ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry, cx + rx, cy - (KAPPA * ry), cx + rx, cy);
        ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
        ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
        ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
        ctx.closePath();
      }

      return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
    }
  };

  // line element
  svg.Element.line = class extends svg.Element.PathElementBase {
    getPoints () {
      return [
        new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
        new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
    }

    path (ctx) {
      const points = this.getPoints();

      if (ctx != null) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
      }

      return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
    }

    getMarkers () {
      const points = this.getPoints();
      const a = points[0].angleTo(points[1]);
      return [[points[0], a], [points[1], a]];
    }
  };

  // polyline element
  svg.Element.polyline = class extends svg.Element.PathElementBase {
    constructor (node) {
      super(node);

      this.points = svg.CreatePath(this.attribute('points').value);
    }
    path (ctx) {
      const {x, y} = this.points[0];
      const bb = new svg.BoundingBox(x, y);
      if (ctx != null) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
      for (let i = 1; i < this.points.length; i++) {
        const {x, y} = this.points[i];
        bb.addPoint(x, y);
        if (ctx != null) ctx.lineTo(x, y);
      }
      return bb;
    }

    getMarkers () {
      const markers = [];
      for (let i = 0; i < this.points.length - 1; i++) {
        markers.push([this.points[i], this.points[i].angleTo(this.points[i + 1])]);
      }
      markers.push([this.points[this.points.length - 1], markers[markers.length - 1][1]]);
      return markers;
    }
  };

  // polygon element
  svg.Element.polygon = class extends svg.Element.polyline {
    path (ctx) {
      const bb = super.path(ctx);
      if (ctx != null) {
        ctx.lineTo(this.points[0].x, this.points[0].y);
        ctx.closePath();
      }
      return bb;
    }
  };

  // path element
  svg.Element.path = class extends svg.Element.PathElementBase {
    constructor (node) {
      super(node);

      let d = this.attribute('d').value
      // TODO: convert to real lexer based on https://www.w3.org/TR/SVG11/paths.html#PathDataBNF
        .replace(/,/gm, ' ') // get rid of all commas
        .replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2') // separate commands from commands
        .replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2') // separate commands from commands
        .replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2') // separate commands from points
        .replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2') // separate commands from points
        .replace(/([0-9])([+-])/gm, '$1 $2') // separate digits when no comma
        .replace(/(\.[0-9]*)(\.)/gm, '$1 $2') // separate digits when no comma
        .replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 '); // shorthand elliptical arc path syntax
      d = svg.compressSpaces(d); // compress multiple spaces
      d = svg.trim(d);
      this.PathParser = {
        tokens: d.split(' '),

        reset () {
          this.i = -1;
          this.command = '';
          this.previousCommand = '';
          this.start = new svg.Point(0, 0);
          this.control = new svg.Point(0, 0);
          this.current = new svg.Point(0, 0);
          this.points = [];
          this.angles = [];
        },

        isEnd () {
          return this.i >= this.tokens.length - 1;
        },

        isCommandOrEnd () {
          if (this.isEnd()) return true;
          return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
        },

        isRelativeCommand () {
          switch (this.command) {
          case 'm':
          case 'l':
          case 'h':
          case 'v':
          case 'c':
          case 's':
          case 'q':
          case 't':
          case 'a':
          case 'z':
            return true;
          }
          return false;
        },

        getToken () {
          this.i++;
          return this.tokens[this.i];
        },

        getScalar () {
          return parseFloat(this.getToken());
        },

        nextCommand () {
          this.previousCommand = this.command;
          this.command = this.getToken();
        },

        getPoint () {
          const p = new svg.Point(this.getScalar(), this.getScalar());
          return this.makeAbsolute(p);
        },

        getAsControlPoint () {
          const p = this.getPoint();
          this.control = p;
          return p;
        },

        getAsCurrentPoint () {
          const p = this.getPoint();
          this.current = p;
          return p;
        },

        getReflectedControlPoint () {
          if (this.previousCommand.toLowerCase() !== 'c' &&
            this.previousCommand.toLowerCase() !== 's' &&
            this.previousCommand.toLowerCase() !== 'q' &&
            this.previousCommand.toLowerCase() !== 't') {
            return this.current;
          }

          // reflect point
          const p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
          return p;
        },

        makeAbsolute (p) {
          if (this.isRelativeCommand()) {
            p.x += this.current.x;
            p.y += this.current.y;
          }
          return p;
        },

        addMarker (p, from, priorTo) {
          // if the last angle isn't filled in because we didn't have this point yet ...
          if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
            this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
          }
          this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
        },

        addMarkerAngle (p, a) {
          this.points.push(p);
          this.angles.push(a);
        },

        getMarkerPoints () { return this.points; },
        getMarkerAngles () {
          for (let i = 0; i < this.angles.length; i++) {
            if (this.angles[i] == null) {
              for (let j = i + 1; j < this.angles.length; j++) {
                if (this.angles[j] != null) {
                  this.angles[i] = this.angles[j];
                  break;
                }
              }
            }
          }
          return this.angles;
        }
      };
    }

    path (ctx) {
      const pp = this.PathParser;
      pp.reset();

      const bb = new svg.BoundingBox();
      if (ctx != null) ctx.beginPath();
      while (!pp.isEnd()) {
        pp.nextCommand();
        switch (pp.command) {
        case 'M':
        case 'm':
          const p = pp.getAsCurrentPoint();
          pp.addMarker(p);
          bb.addPoint(p.x, p.y);
          if (ctx != null) ctx.moveTo(p.x, p.y);
          pp.start = pp.current;
          while (!pp.isCommandOrEnd()) {
            const p = pp.getAsCurrentPoint();
            pp.addMarker(p, pp.start);
            bb.addPoint(p.x, p.y);
            if (ctx != null) ctx.lineTo(p.x, p.y);
          }
          break;
        case 'L':
        case 'l':
          while (!pp.isCommandOrEnd()) {
            const c = pp.current;
            const p = pp.getAsCurrentPoint();
            pp.addMarker(p, c);
            bb.addPoint(p.x, p.y);
            if (ctx != null) ctx.lineTo(p.x, p.y);
          }
          break;
        case 'H':
        case 'h':
          while (!pp.isCommandOrEnd()) {
            const newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
            pp.addMarker(newP, pp.current);
            pp.current = newP;
            bb.addPoint(pp.current.x, pp.current.y);
            if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
          }
          break;
        case 'V':
        case 'v':
          while (!pp.isCommandOrEnd()) {
            const newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
            pp.addMarker(newP, pp.current);
            pp.current = newP;
            bb.addPoint(pp.current.x, pp.current.y);
            if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
          }
          break;
        case 'C':
        case 'c':
          while (!pp.isCommandOrEnd()) {
            const curr = pp.current;
            const p1 = pp.getPoint();
            const cntrl = pp.getAsControlPoint();
            const cp = pp.getAsCurrentPoint();
            pp.addMarker(cp, cntrl, p1);
            bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
            if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
          }
          break;
        case 'S':
        case 's':
          while (!pp.isCommandOrEnd()) {
            const curr = pp.current;
            const p1 = pp.getReflectedControlPoint();
            const cntrl = pp.getAsControlPoint();
            const cp = pp.getAsCurrentPoint();
            pp.addMarker(cp, cntrl, p1);
            bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
            if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
          }
          break;
        case 'Q':
        case 'q':
          while (!pp.isCommandOrEnd()) {
            const curr = pp.current;
            const cntrl = pp.getAsControlPoint();
            const cp = pp.getAsCurrentPoint();
            pp.addMarker(cp, cntrl, cntrl);
            bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
            if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
          }
          break;
        case 'T':
        case 't':
          while (!pp.isCommandOrEnd()) {
            const curr = pp.current;
            const cntrl = pp.getReflectedControlPoint();
            pp.control = cntrl;
            const cp = pp.getAsCurrentPoint();
            pp.addMarker(cp, cntrl, cntrl);
            bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
            if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
          }
          break;
        case 'A':
        case 'a':
          while (!pp.isCommandOrEnd()) {
            const curr = pp.current;
            let rx = pp.getScalar();
            let ry = pp.getScalar();
            const xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
            const largeArcFlag = pp.getScalar();
            const sweepFlag = pp.getScalar();
            const cp = pp.getAsCurrentPoint();

            // Conversion from endpoint to center parameterization
            // https://www.w3.org/TR/SVG11/implnote.html#ArcConversionEndpointToCenter

            // x1', y1'
            const currp = new svg.Point(
              Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
              -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
            );
            // adjust radii
            const l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
            if (l > 1) {
              rx *= Math.sqrt(l);
              ry *= Math.sqrt(l);
            }
            // cx', cy'
            let s = (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(
              ((Math.pow(rx, 2) * Math.pow(ry, 2)) - (Math.pow(rx, 2) * Math.pow(currp.y, 2)) - (Math.pow(ry, 2) * Math.pow(currp.x, 2))) /
              (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2))
            );
            if (isNaN(s)) s = 0;
            const cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
            // cx, cy
            const centp = new svg.Point(
              (curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
              (curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
            );
            // vector magnitude
            const m = function (v) {
              return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
            };
            // ratio between two vectors
            const r = function (u, v) {
              return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));
            };
            // angle between two vectors
            const a = function (u, v) {
              return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v));
            };
            // initial angle
            const a1 = a([1, 0], [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry]);
            // angle delta
            const u = [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry];
            const v = [(-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry];
            let ad = a(u, v);
            if (r(u, v) <= -1) ad = Math.PI;
            if (r(u, v) >= 1) ad = 0;

            // for markers
            const dir = 1 - sweepFlag ? 1.0 : -1.0;
            const ah = a1 + dir * (ad / 2.0);
            const halfWay = new svg.Point(
              centp.x + rx * Math.cos(ah),
              centp.y + ry * Math.sin(ah)
            );
            pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
            pp.addMarkerAngle(cp, ah - dir * Math.PI);

            bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
            if (ctx != null) {
              const r = rx > ry ? rx : ry;
              const sx = rx > ry ? 1 : rx / ry;
              const sy = rx > ry ? ry / rx : 1;

              ctx.translate(centp.x, centp.y);
              ctx.rotate(xAxisRotation);
              ctx.scale(sx, sy);
              ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
              ctx.scale(1 / sx, 1 / sy);
              ctx.rotate(-xAxisRotation);
              ctx.translate(-centp.x, -centp.y);
            }
          }
          break;
        case 'Z':
        case 'z':
          if (ctx != null) ctx.closePath();
          pp.current = pp.start;
        }
      }

      return bb;
    }

    getMarkers () {
      const points = this.PathParser.getMarkerPoints();
      const angles = this.PathParser.getMarkerAngles();

      const markers = points.map((point, i) => {
        return [point, angles[i]];
      });
      return markers;
    }
  };

  // pattern element
  svg.Element.pattern = class extends svg.Element.ElementBase {
    createPattern (ctx, element) {
      const width = this.attribute('width').toPixels('x', true);
      const height = this.attribute('height').toPixels('y', true);

      // render me using a temporary svg element
      const tempSvg = new svg.Element.svg();
      tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
      tempSvg.attributes['width'] = new svg.Property('width', width + 'px');
      tempSvg.attributes['height'] = new svg.Property('height', height + 'px');
      tempSvg.attributes['transform'] = new svg.Property('transform', this.attribute('patternTransform').value);
      tempSvg.children = this.children;

      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const cctx = c.getContext('2d');
      if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
        cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));
      }
      // render 3x3 grid so when we transform there's no white space on edges
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          cctx.save();
          cctx.translate(x * c.width, y * c.height);
          tempSvg.render(cctx);
          cctx.restore();
        }
      }
      const pattern = ctx.createPattern(c, 'repeat');
      return pattern;
    }
  };

  // marker element
  svg.Element.marker = class extends svg.Element.ElementBase {
    render (ctx, point, angle) {
      ctx.translate(point.x, point.y);
      if (this.attribute('orient').valueOrDefault('auto') === 'auto') ctx.rotate(angle);
      if (this.attribute('markerUnits').valueOrDefault('strokeWidth') === 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
      ctx.save();

      // render me using a temporary svg element
      const tempSvg = new svg.Element.svg();
      tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
      tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
      tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
      tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
      tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
      tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
      tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
      tempSvg.children = this.children;
      tempSvg.render(ctx);

      ctx.restore();
      if (this.attribute('markerUnits').valueOrDefault('strokeWidth') === 'strokeWidth') ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
      if (this.attribute('orient').valueOrDefault('auto') === 'auto') ctx.rotate(-angle);
      ctx.translate(-point.x, -point.y);
    }
  };

  // definitions element
  svg.Element.defs = class extends svg.Element.ElementBase {
    render (ctx) {
      // NOOP
    }
  };

  // base for gradients
  svg.Element.GradientBase = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');

      this.stops = [];
      this.children.forEach((child) => {
        if (child.type === 'stop') {
          this.stops.push(child);
        }
      });
    }

    getGradient () {
      // OVERRIDE ME!
    }

    createGradient (ctx, element, parentOpacityProp) {
      const stopsContainer = this.getHrefAttribute().hasValue()
        ? this.getHrefAttribute().getDefinition()
        : this;

      const addParentOpacity = function (color) {
        if (parentOpacityProp.hasValue()) {
          const p = new svg.Property('color', color);
          return p.addOpacity(parentOpacityProp).value;
        }
        return color;
      };

      const g = this.getGradient(ctx, element);
      if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
      stopsContainer.stops.forEach(({offset, color}) => {
        g.addColorStop(offset, addParentOpacity(color));
      });

      if (this.attribute('gradientTransform').hasValue()) {
        // render as transformed pattern on temporary canvas
        const rootView = svg.ViewPort.viewPorts[0];

        const rect = new svg.Element.rect();
        rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS / 3.0);
        rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS / 3.0);
        rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
        rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);

        const group = new svg.Element.g();
        group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
        group.children = [rect];

        const tempSvg = new svg.Element.svg();
        tempSvg.attributes['x'] = new svg.Property('x', 0);
        tempSvg.attributes['y'] = new svg.Property('y', 0);
        tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
        tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
        tempSvg.children = [group];

        const c = document.createElement('canvas');
        c.width = rootView.width;
        c.height = rootView.height;
        const tempCtx = c.getContext('2d');
        tempCtx.fillStyle = g;
        tempSvg.render(tempCtx);
        return tempCtx.createPattern(c, 'no-repeat');
      }

      return g;
    }
  };

  // linear gradient element
  svg.Element.linearGradient = class extends svg.Element.GradientBase {
    getGradient (ctx, element) {
      const useBB = this.gradientUnits === 'objectBoundingBox' && element.getBoundingBox;
      const bb = useBB
        ? element.getBoundingBox()
        : null;

      if (!this.attribute('x1').hasValue() &&
        !this.attribute('y1').hasValue() &&
        !this.attribute('x2').hasValue() &&
        !this.attribute('y2').hasValue()
      ) {
        this.attribute('x1', true).value = 0;
        this.attribute('y1', true).value = 0;
        this.attribute('x2', true).value = 1;
        this.attribute('y2', true).value = 0;
      }

      const x1 = (useBB
        ? bb.x() + bb.width() * this.attribute('x1').numValue()
        : this.attribute('x1').toPixels('x'));
      const y1 = (useBB
        ? bb.y() + bb.height() * this.attribute('y1').numValue()
        : this.attribute('y1').toPixels('y'));
      const x2 = (useBB
        ? bb.x() + bb.width() * this.attribute('x2').numValue()
        : this.attribute('x2').toPixels('x'));
      const y2 = (useBB
        ? bb.y() + bb.height() * this.attribute('y2').numValue()
        : this.attribute('y2').toPixels('y'));

      if (x1 === x2 && y1 === y2) return null;
      return ctx.createLinearGradient(x1, y1, x2, y2);
    }
  };

  // radial gradient element
  svg.Element.radialGradient = class extends svg.Element.GradientBase {
    getGradient (ctx, element) {
      const useBB = this.gradientUnits === 'objectBoundingBox' && element.getBoundingBox;
      const bb = useBB ? element.getBoundingBox() : null;

      if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
      if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
      if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';

      const cx = (useBB
        ? bb.x() + bb.width() * this.attribute('cx').numValue()
        : this.attribute('cx').toPixels('x'));
      const cy = (useBB
        ? bb.y() + bb.height() * this.attribute('cy').numValue()
        : this.attribute('cy').toPixels('y'));

      let fx = cx;
      let fy = cy;
      if (this.attribute('fx').hasValue()) {
        fx = (useBB
          ? bb.x() + bb.width() * this.attribute('fx').numValue()
          : this.attribute('fx').toPixels('x'));
      }
      if (this.attribute('fy').hasValue()) {
        fy = (useBB
          ? bb.y() + bb.height() * this.attribute('fy').numValue()
          : this.attribute('fy').toPixels('y'));
      }

      const r = (useBB
        ? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
        : this.attribute('r').toPixels());

      return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
    }
  };

  // gradient stop element
  svg.Element.stop = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      this.offset = this.attribute('offset').numValue();
      if (this.offset < 0) this.offset = 0;
      if (this.offset > 1) this.offset = 1;

      let stopColor = this.style('stop-color');
      if (this.style('stop-opacity').hasValue()) {
        stopColor = stopColor.addOpacity(this.style('stop-opacity'));
      }
      this.color = stopColor.value;
    }
  };

  // animation base element
  svg.Element.AnimateBase = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      svg.Animations.push(this);

      this.duration = 0.0;
      this.begin = this.attribute('begin').toMilliseconds();
      this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();

      this.initialValue = null;
      this.initialUnits = '';
      this.removed = false;

      this.from = this.attribute('from');
      this.to = this.attribute('to');
      this.values = this.attribute('values');
      if (this.values.hasValue()) this.values.value = this.values.value.split(';');
    }

    getProperty () {
      const attributeType = this.attribute('attributeType').value;
      const attributeName = this.attribute('attributeName').value;

      if (attributeType === 'CSS') {
        return this.parent.style(attributeName, true);
      }
      return this.parent.attribute(attributeName, true);
    }

    calcValue () {
      // OVERRIDE ME!
      return '';
    }

    update (delta) {
      // set initial value
      if (this.initialValue == null) {
        this.initialValue = this.getProperty().value;
        this.initialUnits = this.getProperty().getUnits();
      }

      // if we're past the end time
      if (this.duration > this.maxDuration) {
        // loop for indefinitely repeating animations
        if (this.attribute('repeatCount').value === 'indefinite' ||
          this.attribute('repeatDur').value === 'indefinite') {
          this.duration = 0.0;
        } else if (this.attribute('fill').valueOrDefault('remove') === 'freeze' && !this.frozen) {
          this.frozen = true;
          this.parent.animationFrozen = true;
          this.parent.animationFrozenValue = this.getProperty().value;
        } else if (this.attribute('fill').valueOrDefault('remove') === 'remove' && !this.removed) {
          this.removed = true;
          this.getProperty().value = this.parent.animationFrozen ? this.parent.animationFrozenValue : this.initialValue;
          return true;
        }
        return false;
      }
      this.duration = this.duration + delta;

      // if we're past the begin time
      let updated = false;
      if (this.begin < this.duration) {
        let newValue = this.calcValue(); // tween

        if (this.attribute('type').hasValue()) {
          // for transform, etc.
          const type = this.attribute('type').value;
          newValue = type + '(' + newValue + ')';
        }

        this.getProperty().value = newValue;
        updated = true;
      }

      return updated;
    }

    // fraction of duration we've covered
    progress () {
      const ret = {progress: (this.duration - this.begin) / (this.maxDuration - this.begin)};
      if (this.values.hasValue()) {
        const p = ret.progress * (this.values.value.length - 1);
        const lb = Math.floor(p), ub = Math.ceil(p);
        ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
        ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
        ret.progress = (p - lb) / (ub - lb);
      } else {
        ret.from = this.from;
        ret.to = this.to;
      }
      return ret;
    }
  };

  // animate element
  svg.Element.animate = class extends svg.Element.AnimateBase {
    calcValue () {
      const p = this.progress();

      // tween value linearly
      const newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
      return newValue + this.initialUnits;
    }
  };

  // animate color element
  svg.Element.animateColor = class extends svg.Element.AnimateBase {
    calcValue () {
      const p = this.progress();
      const from = new RGBColor(p.from.value);
      const to = new RGBColor(p.to.value);

      if (from.ok && to.ok) {
        // tween color linearly
        const r = from.r + (to.r - from.r) * p.progress;
        const g = from.g + (to.g - from.g) * p.progress;
        const b = from.b + (to.b - from.b) * p.progress;
        return 'rgb(' + parseInt(r, 10) + ',' + parseInt(g, 10) + ',' + parseInt(b, 10) + ')';
      }
      return this.attribute('from').value;
    }
  };

  // animate transform element
  svg.Element.animateTransform = class extends svg.Element.animate {
    calcValue () {
      const p = this.progress();

      // tween value linearly
      const from = svg.ToNumberArray(p.from.value);
      const to = svg.ToNumberArray(p.to.value);
      let newValue = '';
      from.forEach((fr, i) => {
        newValue += fr + (to[i] - fr) * p.progress + ' ';
      });
      return newValue;
    }
  };

  // font element
  svg.Element.font = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      this.horizAdvX = this.attribute('horiz-adv-x').numValue();

      this.isRTL = false;
      this.isArabic = false;
      this.fontFace = null;
      this.missingGlyph = null;
      this.glyphs = [];
      this.children.forEach((child) => {
        if (child.type === 'font-face') {
          this.fontFace = child;
          if (child.style('font-family').hasValue()) {
            svg.Definitions[child.style('font-family').value] = this;
          }
        } else if (child.type === 'missing-glyph') {
          this.missingGlyph = child;
        } else if (child.type === 'glyph') {
          if (child.arabicForm !== '') {
            this.isRTL = true;
            this.isArabic = true;
            if (typeof this.glyphs[child.unicode] === 'undefined') {
              this.glyphs[child.unicode] = [];
            }
            this.glyphs[child.unicode][child.arabicForm] = child;
          } else {
            this.glyphs[child.unicode] = child;
          }
        }
      });
    }
  };

  // font-face element
  svg.Element.fontface = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      this.ascent = this.attribute('ascent').value;
      this.descent = this.attribute('descent').value;
      this.unitsPerEm = this.attribute('units-per-em').numValue();
    }
  };

  // missing-glyph element
  svg.Element.missingglyph = class extends svg.Element.path {
    constructor (node) {
      super(node);

      this.horizAdvX = 0;
    }
  };

  // glyph element
  svg.Element.glyph = class extends svg.Element.path {
    constructor (node) {
      super(node);

      this.horizAdvX = this.attribute('horiz-adv-x').numValue();
      this.unicode = this.attribute('unicode').value;
      this.arabicForm = this.attribute('arabic-form').value;
    }
  };

  // text element
  svg.Element.text = class extends svg.Element.RenderedElementBase {
    constructor (node) {
      super(node, true);
    }

    setContext (ctx) {
      super.setContext(ctx);

      let textBaseline = this.style('dominant-baseline').toTextBaseline();
      if (textBaseline == null) textBaseline = this.style('alignment-baseline').toTextBaseline();
      if (textBaseline != null) ctx.textBaseline = textBaseline;
    }

    getBoundingBox () {
      const x = this.attribute('x').toPixels('x');
      const y = this.attribute('y').toPixels('y');
      const fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
      return new svg.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2.0 / 3.0) * this.children[0].getText().length, y);
    }

    renderChildren (ctx) {
      this.x = this.attribute('x').toPixels('x');
      this.y = this.attribute('y').toPixels('y');
      this.x += this.getAnchorDelta(ctx, this, 0);
      this.children.forEach((child, i) => {
        this.renderChild(ctx, this, i);
      });
    }

    getAnchorDelta (ctx, parent, startI) {
      const textAnchor = this.style('text-anchor').valueOrDefault('start');
      if (textAnchor !== 'start') {
        let width = 0;
        for (let i = startI; i < parent.children.length; i++) {
          const child = parent.children[i];
          if (i > startI && child.attribute('x').hasValue()) break; // new group
          width += child.measureTextRecursive(ctx);
        }
        return -1 * (textAnchor === 'end' ? width : width / 2.0);
      }
      return 0;
    }

    renderChild (ctx, parent, i) {
      const child = parent.children[i];
      if (child.attribute('x').hasValue()) {
        child.x = child.attribute('x').toPixels('x') + this.getAnchorDelta(ctx, parent, i);
        if (child.attribute('dx').hasValue()) child.x += child.attribute('dx').toPixels('x');
      } else {
        if (this.attribute('dx').hasValue()) this.x += this.attribute('dx').toPixels('x');
        if (child.attribute('dx').hasValue()) this.x += child.attribute('dx').toPixels('x');
        child.x = this.x;
      }
      this.x = child.x + child.measureText(ctx);

      if (child.attribute('y').hasValue()) {
        child.y = child.attribute('y').toPixels('y');
        if (child.attribute('dy').hasValue()) child.y += child.attribute('dy').toPixels('y');
      } else {
        if (this.attribute('dy').hasValue()) this.y += this.attribute('dy').toPixels('y');
        if (child.attribute('dy').hasValue()) this.y += child.attribute('dy').toPixels('y');
        child.y = this.y;
      }
      this.y = child.y;

      child.render(ctx);

      for (let i = 0; i < child.children.length; i++) {
        this.renderChild(ctx, child, i);
      }
    }
  };

  // text base
  svg.Element.TextElementBase = class extends svg.Element.RenderedElementBase {
    getGlyph (font, text, i) {
      const c = text[i];
      let glyph = null;
      if (font.isArabic) {
        let arabicForm = 'isolated';
        if ((i === 0 || text[i - 1] === ' ') && i < text.length - 2 && text[i + 1] !== ' ') arabicForm = 'terminal';
        if (i > 0 && text[i - 1] !== ' ' && i < text.length - 2 && text[i + 1] !== ' ') arabicForm = 'medial';
        if (i > 0 && text[i - 1] !== ' ' && (i === text.length - 1 || text[i + 1] === ' ')) arabicForm = 'initial';
        if (typeof font.glyphs[c] !== 'undefined') {
          glyph = font.glyphs[c][arabicForm];
          if (glyph == null && font.glyphs[c].type === 'glyph') glyph = font.glyphs[c];
        }
      } else {
        glyph = font.glyphs[c];
      }
      if (glyph == null) glyph = font.missingGlyph;
      return glyph;
    }

    renderChildren (ctx) {
      const customFont = this.parent.style('font-family').getDefinition();
      if (customFont != null) {
        const fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
        const fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
        let text = this.getText();
        if (customFont.isRTL) text = text.split('').reverse().join('');

        const dx = svg.ToNumberArray(this.parent.attribute('dx').value);
        for (let i = 0; i < text.length; i++) {
          const glyph = this.getGlyph(customFont, text, i);
          const scale = fontSize / customFont.fontFace.unitsPerEm;
          ctx.translate(this.x, this.y);
          ctx.scale(scale, -scale);
          const lw = ctx.lineWidth;
          ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
          if (fontStyle === 'italic') ctx.transform(1, 0, 0.4, 1, 0, 0);
          glyph.render(ctx);
          if (fontStyle === 'italic') ctx.transform(1, 0, -0.4, 1, 0, 0);
          ctx.lineWidth = lw;
          ctx.scale(1 / scale, -1 / scale);
          ctx.translate(-this.x, -this.y);

          this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
          if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
            this.x += dx[i];
          }
        }
        return;
      }

      if (ctx.fillStyle !== '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
      if (ctx.strokeStyle !== '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
    }

    getText () {
      // OVERRIDE ME
    }

    measureTextRecursive (ctx) {
      let width = this.measureText(ctx);
      this.children.forEach((child) => {
        width += child.measureTextRecursive(ctx);
      });
      return width;
    }

    measureText (ctx) {
      const customFont = this.parent.style('font-family').getDefinition();
      if (customFont != null) {
        const fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
        let measure = 0;
        let text = this.getText();
        if (customFont.isRTL) text = text.split('').reverse().join('');
        const dx = svg.ToNumberArray(this.parent.attribute('dx').value);
        for (let i = 0; i < text.length; i++) {
          const glyph = this.getGlyph(customFont, text, i);
          measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
          if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
            measure += dx[i];
          }
        }
        return measure;
      }

      const textToMeasure = svg.compressSpaces(this.getText());
      if (!ctx.measureText) return textToMeasure.length * 10;

      ctx.save();
      this.setContext(ctx);
      const {width} = ctx.measureText(textToMeasure);
      ctx.restore();
      return width;
    }
  };

  // tspan
  svg.Element.tspan = class extends svg.Element.TextElementBase {
    constructor (node) {
      super(node, true);

      this.text = node.nodeValue || node.text || '';
    }
    getText () {
      return this.text;
    }
  };

  // tref
  svg.Element.tref = class extends svg.Element.TextElementBase {
    getText () {
      const element = this.getHrefAttribute().getDefinition();
      if (element != null) return element.children[0].getText();
    }
  };

  // a element
  svg.Element.a = class extends svg.Element.TextElementBase {
    constructor (node) {
      super(node);

      this.hasText = true;
      [...node.childNodes].forEach((childNode) => {
        if (childNode.nodeType !== 3) {
          this.hasText = false;
        }
      });
      // this might contain text
      this.text = this.hasText ? node.childNodes[0].nodeValue : '';
    }

    getText () {
      return this.text;
    }

    renderChildren (ctx) {
      if (this.hasText) {
        // render as text element
        super.renderChildren(ctx);
        const fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
        svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
      } else {
        // render as temporary group
        const g = new svg.Element.g();
        g.children = this.children;
        g.parent = this;
        g.render(ctx);
      }
    }

    onclick () {
      window.open(this.getHrefAttribute().value);
    }

    onmousemove () {
      svg.ctx.canvas.style.cursor = 'pointer';
    }
  };

  // image element
  svg.Element.image = class extends svg.Element.RenderedElementBase {
    constructor (node) {
      super(node);

      const href = this.getHrefAttribute().value;
      if (href === '') {
        return;
      }
      this._isSvg = href.match(/\.svg$/);

      svg.Images.push(this);
      this.loaded = false;
      if (!this._isSvg) {
        this.img = document.createElement('img');
        if (svg.opts.useCORS === true) {
          this.img.crossOrigin = 'Anonymous';
        }
        const self = this;
        this.img.onload = function () {
          self.loaded = true;
        };
        this.img.onerror = function () {
          svg.log('ERROR: image "' + href + '" not found');
          self.loaded = true;
        };
        this.img.src = href;
      } else {
        svg.ajax(href, true).then((img) => {
          this.img = img;
          this.loaded = true;
        });
      }
    }
    renderChildren (ctx) {
      const x = this.attribute('x').toPixels('x');
      const y = this.attribute('y').toPixels('y');

      const width = this.attribute('width').toPixels('x');
      const height = this.attribute('height').toPixels('y');
      if (width === 0 || height === 0) return;

      ctx.save();
      if (this._isSvg) {
        ctx.drawSvg(this.img, x, y, width, height);
      } else {
        ctx.translate(x, y);
        svg.AspectRatio(
          ctx,
          this.attribute('preserveAspectRatio').value,
          width,
          this.img.width,
          height,
          this.img.height,
          0,
          0
        );
        ctx.drawImage(this.img, 0, 0);
      }
      ctx.restore();
    }

    getBoundingBox () {
      const x = this.attribute('x').toPixels('x');
      const y = this.attribute('y').toPixels('y');
      const width = this.attribute('width').toPixels('x');
      const height = this.attribute('height').toPixels('y');
      return new svg.BoundingBox(x, y, x + width, y + height);
    }
  };

  // group element
  svg.Element.g = class extends svg.Element.RenderedElementBase {
    getBoundingBox () {
      const bb = new svg.BoundingBox();
      this.children.forEach((child) => {
        bb.addBoundingBox(child.getBoundingBox());
      });
      return bb;
    }
  };

  // symbol element
  svg.Element.symbol = class extends svg.Element.RenderedElementBase {
    render (ctx) {
      // NO RENDER
    }
  };

  // style element
  svg.Element.style = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      // text, or spaces then CDATA
      let css = '';
      [...node.childNodes].forEach(({nodeValue}) => {
        css += nodeValue;
      });
      css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
      css = svg.compressSpaces(css); // replace whitespace
      const cssDefs = css.split('}');
      cssDefs.forEach((cssDef) => {
        if (svg.trim(cssDef) !== '') {
          let [cssClasses, cssProps] = cssDef.split('{');
          cssClasses = cssClasses.split(',');
          cssProps = cssProps.split(';');
          cssClasses.forEach((cssClass) => {
            cssClass = svg.trim(cssClass);
            if (cssClass !== '') {
              const props = {};
              cssProps.forEach((cssProp) => {
                const prop = cssProp.indexOf(':');
                const name = cssProp.substr(0, prop);
                const value = cssProp.substr(prop + 1, cssProp.length - prop);
                if (name != null && value != null) {
                  props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
                }
              });
              svg.Styles[cssClass] = props;
              if (cssClass === '@font-face') {
                const fontFamily = props['font-family'].value.replace(/"/g, '');
                const srcs = props['src'].value.split(',');
                srcs.forEach((src) => {
                  if (src.includes('format("svg")')) {
                    const urlStart = src.indexOf('url');
                    const urlEnd = src.indexOf(')', urlStart);
                    const url = src.substr(urlStart + 5, urlEnd - urlStart - 6);
                    // Can this ajax safely be converted to async?
                    const doc = svg.parseXml(svg.ajax(url));
                    const fonts = doc.getElementsByTagName('font');
                    [...fonts].forEach((font) => {
                      font = svg.CreateElement(font);
                      svg.Definitions[fontFamily] = font;
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  };

  // use element
  svg.Element.use = class extends svg.Element.RenderedElementBase {
    constructor (node) {
      super(node);

      this._el = this.getHrefAttribute().getDefinition();
    }

    setContext (ctx) {
      super.setContext(ctx);
      if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
      if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
    }

    path (ctx) {
      const {_el: element} = this;
      if (element != null) element.path(ctx);
    }

    getBoundingBox () {
      const {_el: element} = this;
      if (element != null) return element.getBoundingBox();
    }

    renderChildren (ctx) {
      const {_el: element} = this;
      if (element != null) {
        let tempSvg = element;
        if (element.type === 'symbol') {
          // render me using a temporary svg element in symbol cases (https://www.w3.org/TR/SVG/struct.html#UseElement)
          tempSvg = new svg.Element.svg();
          tempSvg.type = 'svg';
          tempSvg.attributes['viewBox'] = new svg.Property('viewBox', element.attribute('viewBox').value);
          tempSvg.attributes['preserveAspectRatio'] = new svg.Property('preserveAspectRatio', element.attribute('preserveAspectRatio').value);
          tempSvg.attributes['overflow'] = new svg.Property('overflow', element.attribute('overflow').value);
          tempSvg.children = element.children;
        }
        if (tempSvg.type === 'svg') {
          // if symbol or svg, inherit width/height from me
          if (this.attribute('width').hasValue()) tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
          if (this.attribute('height').hasValue()) tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
        }
        const oldParent = tempSvg.parent;
        tempSvg.parent = null;
        tempSvg.render(ctx);
        tempSvg.parent = oldParent;
      }
    }
  };

  // mask element
  svg.Element.mask = class extends svg.Element.ElementBase {
    apply (ctx, element) {
      // render as temp svg
      let x = this.attribute('x').toPixels('x');
      let y = this.attribute('y').toPixels('y');
      let width = this.attribute('width').toPixels('x');
      let height = this.attribute('height').toPixels('y');

      if (width === 0 && height === 0) {
        const bb = new svg.BoundingBox();
        this.children.forEach((child) => {
          bb.addBoundingBox(child.getBoundingBox());
        });
        x = Math.floor(bb.x1);
        y = Math.floor(bb.y1);
        width = Math.floor(bb.width());
        height = Math.floor(bb.height());
      }

      // temporarily remove mask to avoid recursion
      const mask = element.attribute('mask').value;
      element.attribute('mask').value = '';

      const cMask = document.createElement('canvas');
      cMask.width = x + width;
      cMask.height = y + height;
      const maskCtx = cMask.getContext('2d');
      this.renderChildren(maskCtx);

      const c = document.createElement('canvas');
      c.width = x + width;
      c.height = y + height;
      const tempCtx = c.getContext('2d');
      element.render(tempCtx);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
      tempCtx.fillRect(0, 0, x + width, y + height);

      ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
      ctx.fillRect(0, 0, x + width, y + height);

      // reassign mask
      element.attribute('mask').value = mask;
    }

    render (ctx) {
      // NO RENDER
    }
  };

  // clip element
  svg.Element.clipPath = class extends svg.Element.ElementBase {
    apply (ctx) {
      this.children.forEach((child) => {
        if (typeof child.path !== 'undefined') {
          let transform = null;
          if (child.attribute('transform').hasValue()) {
            transform = new svg.Transform(child.attribute('transform').value);
            transform.apply(ctx);
          }
          child.path(ctx);
          ctx.clip();
          if (transform) { transform.unapply(ctx); }
        }
      });
    }
    render (ctx) {
      // NO RENDER
    }
  };

  // filters
  svg.Element.filter = class extends svg.Element.ElementBase {
    apply (ctx, element) {
      // render as temp svg
      const bb = element.getBoundingBox();
      const x = Math.floor(bb.x1);
      const y = Math.floor(bb.y1);
      const width = Math.floor(bb.width());
      const height = Math.floor(bb.height());

      // temporarily remove filter to avoid recursion
      const filter = element.style('filter').value;
      element.style('filter').value = '';

      let px = 0, py = 0;
      this.children.forEach((child) => {
        const efd = child.extraFilterDistance || 0;
        px = Math.max(px, efd);
        py = Math.max(py, efd);
      });

      const c = document.createElement('canvas');
      c.width = width + 2 * px;
      c.height = height + 2 * py;
      const tempCtx = c.getContext('2d');
      tempCtx.translate(-x + px, -y + py);
      element.render(tempCtx);

      // apply filters
      this.children.forEach((child) => {
        child.apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);
      });

      // render on me
      ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py);

      // reassign filter
      element.style('filter', true).value = filter;
    }

    render (ctx) {
      // NO RENDER
    }
  };

  svg.Element.feMorphology = class extends svg.Element.ElementBase {
    apply (ctx, x, y, width, height) {
      // TODO: implement
    }
  };

  svg.Element.feComposite = class extends svg.Element.ElementBase {
    apply (ctx, x, y, width, height) {
      // TODO: implement
    }
  };

  function imGet (img, x, y, width, height, rgba) {
    return img[y * width * 4 + x * 4 + rgba];
  }

  function imSet (img, x, y, width, height, rgba, val) {
    img[y * width * 4 + x * 4 + rgba] = val;
  }

  svg.Element.feColorMatrix = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      let matrix = svg.ToNumberArray(this.attribute('values').value);
      switch (this.attribute('type').valueOrDefault('matrix')) { // https://www.w3.org/TR/SVG/filters.html#feColorMatrixElement
      case 'saturate':
        const s = matrix[0];
        matrix = [
          0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0,
          0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0,
          0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0, 0,
          0, 0, 0, 1, 0,
          0, 0, 0, 0, 1
        ];
        break;
      case 'hueRotate':
        const a = matrix[0] * Math.PI / 180.0;
        const c = function (m1, m2, m3) {
          return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;
        };
        matrix = [
          c(0.213, 0.787, -0.213), c(0.715, -0.715, -0.715), c(0.072, -0.072, 0.928), 0, 0,
          c(0.213, -0.213, 0.143), c(0.715, 0.285, 0.140), c(0.072, -0.072, -0.283), 0, 0,
          c(0.213, -0.213, -0.787), c(0.715, -0.715, 0.715), c(0.072, 0.928, 0.072), 0, 0,
          0, 0, 0, 1, 0,
          0, 0, 0, 0, 1
        ];
        break;
      case 'luminanceToAlpha':
        matrix = [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0.2125, 0.7154, 0.0721, 0, 0,
          0, 0, 0, 0, 1
        ];
        break;
      }
      this.matrix = matrix;

      this._m = (i, v) => {
        const mi = matrix[i];
        return mi * (mi < 0 ? v - 255 : v);
      };
    }
    apply (ctx, x, y, width, height) {
      const {_m: m} = this;
      // assuming x==0 && y==0 for now
      const srcData = ctx.getImageData(0, 0, width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const r = imGet(srcData.data, x, y, width, height, 0);
          const g = imGet(srcData.data, x, y, width, height, 1);
          const b = imGet(srcData.data, x, y, width, height, 2);
          const a = imGet(srcData.data, x, y, width, height, 3);
          imSet(srcData.data, x, y, width, height, 0, m(0, r) + m(1, g) + m(2, b) + m(3, a) + m(4, 1));
          imSet(srcData.data, x, y, width, height, 1, m(5, r) + m(6, g) + m(7, b) + m(8, a) + m(9, 1));
          imSet(srcData.data, x, y, width, height, 2, m(10, r) + m(11, g) + m(12, b) + m(13, a) + m(14, 1));
          imSet(srcData.data, x, y, width, height, 3, m(15, r) + m(16, g) + m(17, b) + m(18, a) + m(19, 1));
        }
      }
      ctx.clearRect(0, 0, width, height);
      ctx.putImageData(srcData, 0, 0);
    }
  };

  svg.Element.feGaussianBlur = class extends svg.Element.ElementBase {
    constructor (node) {
      super(node);

      this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());
      this.extraFilterDistance = this.blurRadius;
    }

    apply (ctx, x, y, width, height) {
      if (typeof canvasRGBA_ === 'undefined') {
        svg.log('ERROR: `setStackBlurCanvasRGBA` must be run for blur to work');
        return;
      }

      // Todo: This might not be a problem anymore with out `instanceof` fix
      // StackBlur requires canvas be on document
      ctx.canvas.id = svg.UniqueId();
      ctx.canvas.style.display = 'none';
      document.body.append(ctx.canvas);
      canvasRGBA_(ctx.canvas, x, y, width, height, this.blurRadius);
      ctx.canvas.remove();
    }
  };

  // title element, do nothing
  svg.Element.title = class extends svg.Element.ElementBase {
    constructor (node) {
      super();
    }
  };

  // desc element, do nothing
  svg.Element.desc = class extends svg.Element.ElementBase {
    constructor (node) {
      super();
    }
  };

  svg.Element.MISSING = class extends svg.Element.ElementBase {
    constructor (node) {
      super();
      svg.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
    }
  };

  // element factory
  svg.CreateElement = function (node) {
    const className = node.nodeName
      .replace(/^[^:]+:/, '') // remove namespace
      .replace(/-/g, ''); // remove dashes
    let e;
    if (typeof svg.Element[className] !== 'undefined') {
      e = new svg.Element[className](node);
    } else {
      e = new svg.Element.MISSING(node);
    }

    e.type = node.nodeName;
    return e;
  };

  // load from url
  svg.load = async function (ctx, url) {
    const dom = await svg.ajax(url, true);
    return svg.loadXml(ctx, dom);
  };

  // load from xml
  svg.loadXml = function (ctx, xml) {
    return svg.loadXmlDoc(ctx, svg.parseXml(xml));
  };

  svg.loadXmlDoc = function (ctx, dom) {
    let res;
    svg.init(ctx);

    const mapXY = function (p) {
      let e = ctx.canvas;
      while (e) {
        p.x -= e.offsetLeft;
        p.y -= e.offsetTop;
        e = e.offsetParent;
      }
      if (window.scrollX) p.x += window.scrollX;
      if (window.scrollY) p.y += window.scrollY;
      return p;
    };

    // bind mouse
    if (svg.opts.ignoreMouse !== true) {
      ctx.canvas.onclick = function (e) {
        const args = e != null
          ? [e.clientX, e.clientY]
          : [event.clientX, event.clientY];
        const {x, y} = mapXY(new svg.Point(...args));
        svg.Mouse.onclick(x, y);
      };
      ctx.canvas.onmousemove = function (e) {
        const args = e != null
          ? [e.clientX, e.clientY]
          : [event.clientX, event.clientY];
        const {x, y} = mapXY(new svg.Point(...args));
        svg.Mouse.onmousemove(x, y);
      };
    }

    const e = svg.CreateElement(dom.documentElement);
    e.root = true;

    // render loop
    let isFirstRender = true;
    const draw = function (resolve) {
      svg.ViewPort.Clear();
      if (ctx.canvas.parentNode) {
        svg.ViewPort.SetCurrent(
          ctx.canvas.parentNode.clientWidth,
          ctx.canvas.parentNode.clientHeight
        );
      }

      if (svg.opts.ignoreDimensions !== true) {
        // set canvas size
        if (e.style('width').hasValue()) {
          ctx.canvas.width = e.style('width').toPixels('x');
          ctx.canvas.style.width = ctx.canvas.width + 'px';
        }
        if (e.style('height').hasValue()) {
          ctx.canvas.height = e.style('height').toPixels('y');
          ctx.canvas.style.height = ctx.canvas.height + 'px';
        }
      }
      let cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
      let cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
      if (svg.opts.ignoreDimensions === true &&
        e.style('width').hasValue() && e.style('height').hasValue()
      ) {
        cWidth = e.style('width').toPixels('x');
        cHeight = e.style('height').toPixels('y');
      }
      svg.ViewPort.SetCurrent(cWidth, cHeight);

      if (svg.opts.offsetX != null) {
        e.attribute('x', true).value = svg.opts.offsetX;
      }
      if (svg.opts.offsetY != null) {
        e.attribute('y', true).value = svg.opts.offsetY;
      }
      if (svg.opts.scaleWidth != null || svg.opts.scaleHeight != null) {
        const viewBox = svg.ToNumberArray(e.attribute('viewBox').value);
        let xRatio = null, yRatio = null;

        if (svg.opts.scaleWidth != null) {
          if (e.attribute('width').hasValue()) {
            xRatio = e.attribute('width').toPixels('x') / svg.opts.scaleWidth;
          } else if (!isNaN(viewBox[2])) {
            xRatio = viewBox[2] / svg.opts.scaleWidth;
          }
        }

        if (svg.opts.scaleHeight != null) {
          if (e.attribute('height').hasValue()) {
            yRatio = e.attribute('height').toPixels('y') / svg.opts.scaleHeight;
          } else if (!isNaN(viewBox[3])) {
            yRatio = viewBox[3] / svg.opts.scaleHeight;
          }
        }

        if (xRatio == null) { xRatio = yRatio; }
        if (yRatio == null) { yRatio = xRatio; }

        e.attribute('width', true).value = svg.opts.scaleWidth;
        e.attribute('height', true).value = svg.opts.scaleHeight;
        e.attribute('viewBox', true).value = '0 0 ' + (cWidth * xRatio) + ' ' + (cHeight * yRatio);
        e.attribute('preserveAspectRatio', true).value = 'none';
      }

      // clear and render
      if (svg.opts.ignoreClear !== true) {
        ctx.clearRect(0, 0, cWidth, cHeight);
      }
      e.render(ctx);
      if (isFirstRender) {
        isFirstRender = false;
        resolve(dom);
      }
    };

    let waitingForImages = true;
    svg.intervalID = setInterval(function () {
      let needUpdate = false;

      if (waitingForImages && svg.ImagesLoaded()) {
        waitingForImages = false;
        needUpdate = true;
      }

      // need update from mouse events?
      if (svg.opts.ignoreMouse !== true) {
        needUpdate = needUpdate | svg.Mouse.hasEvents();
      }

      // need update from animations?
      if (svg.opts.ignoreAnimation !== true) {
        svg.Animations.forEach((animation) => {
          needUpdate = needUpdate | animation.update(1000 / svg.FRAMERATE);
        });
      }

      // need update from redraw?
      if (typeof svg.opts.forceRedraw === 'function') {
        if (svg.opts.forceRedraw() === true) {
          needUpdate = true;
        }
      }

      // render if needed
      if (needUpdate) {
        draw(res);
        svg.Mouse.runEvents(); // run and clear our events
      }
    }, 1000 / svg.FRAMERATE);
    return new Promise((resolve, reject) => {
      if (svg.ImagesLoaded()) {
        waitingForImages = false;
        draw(resolve);
        return;
      }
      res = resolve;
    });
  };

  svg.stop = () => {
    if (svg.intervalID) {
      clearInterval(svg.intervalID);
    }
  };

  svg.Mouse = {
    events: [],
    hasEvents () { return this.events.length !== 0; },

    onclick (x, y) {
      this.events.push({
        type: 'onclick', x, y,
        run (e) { if (e.onclick) e.onclick(); }
      });
    },

    onmousemove (x, y) {
      this.events.push({
        type: 'onmousemove', x, y,
        run (e) { if (e.onmousemove) e.onmousemove(); }
      });
    },

    eventElements: [],

    checkPath (element, ctx) {
      this.events.forEach(({x, y}, i) => {
        if (ctx.isPointInPath && ctx.isPointInPath(x, y)) {
          this.eventElements[i] = element;
        }
      });
    },

    checkBoundingBox (element, bb) {
      this.events.forEach(({x, y}, i) => {
        if (bb.isPointInBox(x, y)) {
          this.eventElements[i] = element;
        }
      });
    },

    runEvents () {
      svg.ctx.canvas.style.cursor = '';

      this.events.forEach((e, i) => {
        let element = this.eventElements[i];
        while (element) {
          e.run(element);
          element = element.parent;
        }
      });

      // done running, clear
      this.events = [];
      this.eventElements = [];
    }
  };

  return svg;
}

if (typeof CanvasRenderingContext2D !== 'undefined') {
  CanvasRenderingContext2D.prototype.drawSvg = function (s, dx, dy, dw, dh) {
    canvg(this.canvas, s, {
      ignoreMouse: true,
      ignoreAnimation: true,
      ignoreDimensions: true,
      ignoreClear: true,
      offsetX: dx,
      offsetY: dy,
      scaleWidth: dw,
      scaleHeight: dh
    });
  };
}
