/* globals jQuery */
/**
 * Path functionality.
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import {NS} from '../common/namespaces.js';
import {getTransformList} from '../common/svgtransformlist.js';
import {shortFloat} from '../common/units.js';
import {ChangeElementCommand} from './history.js';
import {
  transformPoint, getMatrix
} from '../common/math.js';
import {
  assignAttributes, getElem, getRotationAngle, getBBox,
  getRefElem, findDefs, isNullish,
  getBBox as utilsGetBBox
} from '../common/utilities.js';
import {
  supportsPathReplaceItem, isWebkit
} from '../common/browser.js';
import {
  init as pathMethodInit, insertItemBeforeMethod, ptObjToArrMethod, getGripPtMethod,
  getPointFromGripMethod, addPointGripMethod, getGripContainerMethod, addCtrlGripMethod,
  getCtrlLineMethod
} from './path-method.js';
import {
  init as pathActionsInit, pathActionsMethod
} from './path-actions.js';

const $ = jQuery;

const segData = {
  2: ['x', 'y'], // PATHSEG_MOVETO_ABS
  4: ['x', 'y'], // PATHSEG_LINETO_ABS
  6: ['x', 'y', 'x1', 'y1', 'x2', 'y2'], // PATHSEG_CURVETO_CUBIC_ABS
  8: ['x', 'y', 'x1', 'y1'], // PATHSEG_CURVETO_QUADRATIC_ABS
  10: ['x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag'], // PATHSEG_ARC_ABS
  12: ['x'], // PATHSEG_LINETO_HORIZONTAL_ABS
  14: ['y'], // PATHSEG_LINETO_VERTICAL_ABS
  16: ['x', 'y', 'x2', 'y2'], // PATHSEG_CURVETO_CUBIC_SMOOTH_ABS
  18: ['x', 'y'] // PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS
};

/**
 * @tutorial LocaleDocs
 * @typedef {module:locale.LocaleStrings|PlainObject} module:path.uiStrings
 * @property {PlainObject<string, string>} ui
*/

const uiStrings = {};
/**
* @function module:path.setUiStrings
* @param {module:path.uiStrings} strs
* @returns {void}
*/
export const setUiStrings = function (strs) {
  Object.assign(uiStrings, strs.ui);
};

let pathFuncs = [];

let linkControlPts = true;

// Stores references to paths via IDs.
// TODO: Make this cross-document happy.
let pathData = {};

/**
* @function module:path.setLinkControlPoints
* @param {boolean} lcp
* @returns {void}
*/
export const setLinkControlPoints = function (lcp) {
  linkControlPts = lcp;
};

/**
 * @name module:path.path
 * @type {null|module:path.Path}
 * @memberof module:path
*/
export let path = null; // eslint-disable-line import/no-mutable-exports

let editorContext_ = null;

/**
* @external MouseEvent
*/

/**
* Object with the following keys/values.
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
 * Note: This doesn't round to an integer necessarily.
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
 * Returns the last created DOM element ID string.
 * @function module:path.EditorContext#getId
 * @returns {string}
 */
/**
 * Creates and returns a unique ID string for a DOM element.
 * @function module:path.EditorContext#getNextId
 * @returns {string}
*/
/**
 * Gets the desired element from a mouse event.
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
export const init = function (editorContext) {
  editorContext_ = editorContext;

  pathFuncs = [0, 'ClosePath'];
  const pathFuncsStrs = [
    'Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
    'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'
  ];
  $.each(pathFuncsStrs, function (i, s) {
    pathFuncs.push(s + 'Abs');
    pathFuncs.push(s + 'Rel');
  });
};

pathMethodInit(
  /**
* @implements {module:path-method.pathMethodsContext}
*/
  {
    getEditorContext () { return editorContext_; },
    getSegData () { return segData; },
    getUIStrings () { return uiStrings; }
  }
);

/**
* @function module:path.insertItemBefore
* @param {Element} elem
* @param {Segment} newseg
* @param {Integer} index
* @returns {void}
*/
export const insertItemBefore = insertItemBeforeMethod;

/**
* @function module:path.ptObjToArr
* @todo See if this should just live in `replacePathSeg`
* @param {string} type
* @param {SVGPathSegMovetoAbs|SVGPathSegLinetoAbs|SVGPathSegCurvetoCubicAbs|SVGPathSegCurvetoQuadraticAbs|SVGPathSegArcAbs|SVGPathSegLinetoHorizontalAbs|SVGPathSegLinetoVerticalAbs|SVGPathSegCurvetoCubicSmoothAbs|SVGPathSegCurvetoQuadraticSmoothAbs} segItem
* @returns {ArgumentsArray}
*/
export const ptObjToArr = ptObjToArrMethod;

/**
* @function module:path.getGripPt
* @param {Segment} seg
* @param {module:math.XYObject} altPt
* @returns {module:math.XYObject}
*/
export const getGripPt = getGripPtMethod;

/**
* @function module:path.getPointFromGrip
* @param {module:math.XYObject} pt
* @param {module:path.Path} pth
* @returns {module:math.XYObject}
*/
export const getPointFromGrip = getPointFromGripMethod;

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addPointGrip
* @param {Integer} index
* @param {Integer} x
* @param {Integer} y
* @returns {SVGCircleElement}
*/
export const addPointGrip = addPointGripMethod;

/**
* @function module:path.getGripContainer
* @returns {Element}
*/
export const getGripContainer = getGripContainerMethod;

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addCtrlGrip
* @param {string} id
* @returns {SVGCircleElement}
*/
export const addCtrlGrip = addCtrlGripMethod;

/**
* @function module:path.getCtrlLine
* @param {string} id
* @returns {SVGLineElement}
*/
export const getCtrlLine = getCtrlLineMethod;

/**
* @function module:path.getPointGrip
* @param {Segment} seg
* @param {boolean} update
* @returns {SVGCircleElement}
*/
export const getPointGrip = function (seg, update) {
  const {index} = seg;
  const pointGrip = addPointGrip(index);

  if (update) {
    const pt = getGripPt(seg);
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
export const getControlPoints = function (seg) {
  const {item, index} = seg;
  if (!('x1' in item) || !('x2' in item)) { return null; }
  const cpt = {};
  /* const pointGripContainer = */ getGripContainer();

  // Note that this is intentionally not seg.prev.item
  const prev = path.segs[index - 1].item;

  const segItems = [prev, item];

  for (let i = 1; i < 3; i++) {
    const id = index + 'c' + i;

    const ctrlLine = cpt['c' + i + '_line'] = getCtrlLine(id);

    const pt = getGripPt(seg, {x: item['x' + i], y: item['y' + i]});
    const gpt = getGripPt(seg, {x: segItems[i - 1].x, y: segItems[i - 1].y});

    assignAttributes(ctrlLine, {
      x1: pt.x,
      y1: pt.y,
      x2: gpt.x,
      y2: gpt.y,
      display: 'inline'
    });

    cpt['c' + i + '_line'] = ctrlLine;

    // create it
    const pointGrip = cpt['c' + i] = addCtrlGrip(id);

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
export const replacePathSeg = function (type, index, pts, elem) {
  const pth = elem || path.elem;

  const func = 'createSVGPathSeg' + pathFuncs[type];
  const seg = pth[func](...pts);

  if (supportsPathReplaceItem()) {
    pth.pathSegList.replaceItem(seg, index);
  } else {
    const segList = pth.pathSegList;
    const len = segList.numberOfItems;
    const arr = [];
    for (let i = 0; i < len; i++) {
      const curSeg = segList.getItem(i);
      arr.push(curSeg);
    }
    segList.clear();
    for (let i = 0; i < len; i++) {
      if (i === index) {
        segList.appendItem(seg);
      } else {
        segList.appendItem(arr[i]);
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
export const getSegSelector = function (seg, update) {
  const {index} = seg;
  let segLine = getElem('segline_' + index);
  if (!segLine) {
    const pointGripContainer = getGripContainer();
    // create segline
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
    const {prev} = seg;
    if (!prev) {
      segLine.setAttribute('display', 'none');
      return segLine;
    }

    const pt = getGripPt(prev);
    // Set start point
    replacePathSeg(2, 0, [pt.x, pt.y], segLine);

    const pts = ptObjToArr(seg.type, seg.item); // , true);
    for (let i = 0; i < pts.length; i += 2) {
      const point = getGripPt(seg, {x: pts[i], y: pts[i + 1]});
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
export const smoothControlPoints = function (ct1, ct2, pt) {
  // each point must not be the origin
  const x1 = ct1.x - pt.x,
    y1 = ct1.y - pt.y,
    x2 = ct2.x - pt.x,
    y2 = ct2.y - pt.y;

  if ((x1 !== 0 || y1 !== 0) && (x2 !== 0 || y2 !== 0)) {
    const
      r1 = Math.sqrt(x1 * x1 + y1 * y1),
      r2 = Math.sqrt(x2 * x2 + y2 * y2),
      nct1 = editorContext_.getSVGRoot().createSVGPoint(),
      nct2 = editorContext_.getSVGRoot().createSVGPoint();
    let anglea = Math.atan2(y1, x1),
      angleb = Math.atan2(y2, x2);
    if (anglea < 0) { anglea += 2 * Math.PI; }
    if (angleb < 0) { angleb += 2 * Math.PI; }

    const angleBetween = Math.abs(anglea - angleb),
      angleDiff = Math.abs(Math.PI - angleBetween) / 2;

    let newAnglea, newAngleb;
    if (anglea - angleb > 0) {
      newAnglea = angleBetween < Math.PI ? (anglea + angleDiff) : (anglea - angleDiff);
      newAngleb = angleBetween < Math.PI ? (angleb - angleDiff) : (angleb + angleDiff);
    } else {
      newAnglea = angleBetween < Math.PI ? (anglea - angleDiff) : (anglea + angleDiff);
      newAngleb = angleBetween < Math.PI ? (angleb + angleDiff) : (angleb - angleDiff);
    }

    // rotate the points
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
export class Segment {
  /**
  * @param {Integer} index
  * @param {SVGPathSeg} item
  * @todo Is `item` be more constrained here?
  */
  constructor (index, item) {
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
  showCtrlPts (y) {
    for (const i in this.ctrlpts) {
      if ({}.hasOwnProperty.call(this.ctrlpts, i)) {
        this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none');
      }
    }
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  selectCtrls (y) {
    $('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2')
      .attr('fill', y ? '#0FF' : '#EEE');
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  show (y) {
    if (this.ptgrip) {
      this.ptgrip.setAttribute('display', y ? 'inline' : 'none');
      this.segsel.setAttribute('display', y ? 'inline' : 'none');
      // Show/hide all control points if available
      this.showCtrlPts(y);
    }
  }

  /**
   * @param {boolean} y
   * @returns {void}
   */
  select (y) {
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
  addGrip () {
    this.ptgrip = getPointGrip(this, true);
    this.ctrlpts = getControlPoints(this); // , true);
    this.segsel = getSegSelector(this, true);
  }

  /**
   * @param {boolean} full
   * @returns {void}
   */
  update (full) {
    if (this.ptgrip) {
      const pt = getGripPt(this);
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
      }
      // this.segsel.setAttribute('display', y ? 'inline' : 'none');
    }
  }

  /**
   * @param {Integer} dx
   * @param {Integer} dy
   * @returns {void}
   */
  move (dx, dy) {
    const {item} = this;

    const curPts = this.ctrlpts
      ? [
        item.x += dx, item.y += dy,
        item.x1, item.y1, item.x2 += dx, item.y2 += dy
      ]
      : [item.x += dx, item.y += dy];

    replacePathSeg(
      this.type,
      this.index,
      // type 10 means ARC
      this.type === 10 ? ptObjToArr(this.type, item) : curPts
    );

    if (this.next && this.next.ctrlpts) {
      const next = this.next.item;
      const nextPts = [
        next.x, next.y,
        next.x1 += dx, next.y1 += dy, next.x2, next.y2
      ];
      replacePathSeg(this.next.type, this.next.index, nextPts);
    }

    if (this.mate) {
      // The last point of a closed subpath has a 'mate',
      // which is the 'M' segment of the subpath
      const {item: itm} = this.mate;
      const pts = [itm.x += dx, itm.y += dy];
      replacePathSeg(this.mate.type, this.mate.index, pts);
      // Has no grip, so does not need 'updating'?
    }

    this.update(true);
    if (this.next) { this.next.update(true); }
  }

  /**
   * @param {Integer} num
   * @returns {void}
   */
  setLinked (num) {
    let seg, anum, pt;
    if (num === 2) {
      anum = 1;
      seg = this.next;
      if (!seg) { return; }
      pt = this.item;
    } else {
      anum = 2;
      seg = this.prev;
      if (!seg) { return; }
      pt = seg.item;
    }

    const {item} = seg;
    item['x' + anum] = pt.x + (pt.x - this.item['x' + num]);
    item['y' + anum] = pt.y + (pt.y - this.item['y' + num]);

    const pts = [
      item.x, item.y,
      item.x1, item.y1,
      item.x2, item.y2
    ];

    replacePathSeg(seg.type, seg.index, pts);
    seg.update(true);
  }

  /**
   * @param {Integer} num
   * @param {Integer} dx
   * @param {Integer} dy
   * @returns {void}
   */
  moveCtrl (num, dx, dy) {
    const {item} = this;
    item['x' + num] += dx;
    item['y' + num] += dy;

    const pts = [
      item.x, item.y,
      item.x1, item.y1, item.x2, item.y2
    ];

    replacePathSeg(this.type, this.index, pts);
    this.update(true);
  }

  /**
   * @param {Integer} newType Possible values set during {@link module:path.init}
   * @param {ArgumentsArray} pts
   * @returns {void}
   */
  setType (newType, pts) {
    replacePathSeg(newType, this.index, pts);
    this.type = newType;
    this.item = path.elem.pathSegList.getItem(this.index);
    this.showCtrlPts(newType === 6);
    this.ctrlpts = getControlPoints(this);
    this.update(true);
  }
}

/**
*
*/
export class Path {
  /**
  * @param {SVGPathElement} elem
  * @throws {Error} If constructed without a path element
  */
  constructor (elem) {
    if (!elem || elem.tagName !== 'path') {
      throw new Error('svgedit.path.Path constructed without a <path> element');
    }

    this.elem = elem;
    this.segs = [];
    this.selected_pts = [];
    path = this;

    this.init();
  }

  /**
  * Reset path data.
  * @returns {module:path.Path}
  */
  init () {
    // Hide all grips, etc

    // fixed, needed to work on all found elements, not just first
    $(getGripContainer()).find('*').each(function () {
      $(this).attr('display', 'none');
    });

    const segList = this.elem.pathSegList;
    const len = segList.numberOfItems;
    this.segs = [];
    this.selected_pts = [];
    this.first_seg = null;

    // Set up segs array
    for (let i = 0; i < len; i++) {
      const item = segList.getItem(i);
      const segment = new Segment(i, item);
      segment.path = this;
      this.segs.push(segment);
    }

    const {segs} = this;

    let startI = null;
    for (let i = 0; i < len; i++) {
      const seg = segs[i];
      const nextSeg = (i + 1) >= len ? null : segs[i + 1];
      const prevSeg = (i - 1) < 0 ? null : segs[i - 1];
      if (seg.type === 2) {
        if (prevSeg && prevSeg.type !== 1) {
          // New sub-path, last one is open,
          // so add a grip to last sub-path's first point
          const startSeg = segs[startI];
          startSeg.next = segs[startI + 1];
          startSeg.next.prev = startSeg;
          startSeg.addGrip();
        }
        // Remember that this is a starter seg
        startI = i;
      } else if (nextSeg && nextSeg.type === 1) {
        // This is the last real segment of a closed sub-path
        // Next is first seg after "M"
        seg.next = segs[startI + 1];

        // First seg after "M"'s prev is this
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
          const startSeg = segs[startI];
          startSeg.next = segs[startI + 1];
          startSeg.next.prev = startSeg;
          startSeg.addGrip();
          seg.addGrip();

          if (!this.first_seg) {
            // Open path, so set first as real first and add grip
            this.first_seg = segs[startI];
          }
        }
      } else if (seg.type !== 1) {
        // Regular segment, so add grip and its "next"
        seg.addGrip();

        // Don't set its "next" if it's an "M"
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
  eachSeg (fn) {
    const len = this.segs.length;
    for (let i = 0; i < len; i++) {
      const ret = fn.call(this.segs[i], i);
      if (ret === false) { break; }
    }
  }

  /**
  * @param {Integer} index
  * @returns {void}
  */
  addSeg (index) {
    // Adds a new segment
    const seg = this.segs[index];
    if (!seg.prev) { return; }

    const {prev} = seg;
    let newseg, newX, newY;
    switch (seg.item.pathSegType) {
    case 4: {
      newX = (seg.item.x + prev.item.x) / 2;
      newY = (seg.item.y + prev.item.y) / 2;
      newseg = this.elem.createSVGPathSegLinetoAbs(newX, newY);
      break;
    } case 6: { // make it a curved segment to preserve the shape (WRS)
      // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm#Geometric_interpretation
      const p0x = (prev.item.x + seg.item.x1) / 2;
      const p1x = (seg.item.x1 + seg.item.x2) / 2;
      const p2x = (seg.item.x2 + seg.item.x) / 2;
      const p01x = (p0x + p1x) / 2;
      const p12x = (p1x + p2x) / 2;
      newX = (p01x + p12x) / 2;
      const p0y = (prev.item.y + seg.item.y1) / 2;
      const p1y = (seg.item.y1 + seg.item.y2) / 2;
      const p2y = (seg.item.y2 + seg.item.y) / 2;
      const p01y = (p0y + p1y) / 2;
      const p12y = (p1y + p2y) / 2;
      newY = (p01y + p12y) / 2;
      newseg = this.elem.createSVGPathSegCurvetoCubicAbs(newX, newY, p0x, p0y, p01x, p01y);
      const pts = [seg.item.x, seg.item.y, p12x, p12y, p2x, p2y];
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
  deleteSeg (index) {
    const seg = this.segs[index];
    const list = this.elem.pathSegList;

    seg.show(false);
    const {next} = seg;
    if (seg.mate) {
      // Make the next point be the "M" point
      const pt = [next.item.x, next.item.y];
      replacePathSeg(2, next.index, pt);

      // Reposition last node
      replacePathSeg(4, seg.index, pt);

      list.removeItem(seg.mate.index);
    } else if (!seg.prev) {
      // First node of open path, make next point the M
      // const {item} = seg;
      const pt = [next.item.x, next.item.y];
      replacePathSeg(2, seg.next.index, pt);
      list.removeItem(index);
    } else {
      list.removeItem(index);
    }
  }

  /**
  * @param {Integer} index
  * @returns {void}
  */
  removePtFromSelection (index) {
    const pos = this.selected_pts.indexOf(index);
    if (pos === -1) {
      return;
    }
    this.segs[index].select(false);
    this.selected_pts.splice(pos, 1);
  }

  /**
  * @returns {void}
  */
  clearSelection () {
    this.eachSeg(function () {
      // 'this' is the segment here
      this.select(false);
    });
    this.selected_pts = [];
  }

  /**
  * @returns {void}
  */
  storeD () {
    this.last_d = this.elem.getAttribute('d');
  }

  /**
  * @param {Integer} y
  * @returns {Path}
  */
  show (y) {
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
  movePts (dx, dy) {
    let i = this.selected_pts.length;
    while (i--) {
      const seg = this.segs[this.selected_pts[i]];
      seg.move(dx, dy);
    }
  }

  /**
  * @param {Integer} dx
  * @param {Integer} dy
  * @returns {void}
  */
  moveCtrl (dx, dy) {
    const seg = this.segs[this.selected_pts[0]];
    seg.moveCtrl(this.dragctrl, dx, dy);
    if (linkControlPts) {
      seg.setLinked(this.dragctrl);
    }
  }

  /**
  * @param {?Integer} newType See {@link https://www.w3.org/TR/SVG/single-page.html#paths-InterfaceSVGPathSeg}
  * @returns {void}
  */
  setSegType (newType) {
    this.storeD();
    let i = this.selected_pts.length;
    let text;
    while (i--) {
      const selPt = this.selected_pts[i];

      // Selected seg
      const cur = this.segs[selPt];
      const {prev} = cur;
      if (!prev) { continue; }

      if (!newType) { // double-click, so just toggle
        text = 'Toggle Path Segment Type';

        // Toggle segment to curve/straight line
        const oldType = cur.type;

        newType = (oldType === 6) ? 4 : 6;
      }

      newType = Number(newType);

      const curX = cur.item.x;
      const curY = cur.item.y;
      const prevX = prev.item.x;
      const prevY = prev.item.y;
      let points;
      switch (newType) {
      case 6: {
        if (cur.olditem) {
          const old = cur.olditem;
          points = [curX, curY, old.x1, old.y1, old.x2, old.y2];
        } else {
          const diffX = curX - prevX;
          const diffY = curY - prevY;
          // get control points from straight line segment
          /*
          const ct1x = (prevX + (diffY/2));
          const ct1y = (prevY - (diffX/2));
          const ct2x = (curX + (diffY/2));
          const ct2y = (curY - (diffX/2));
          */
          // create control points on the line to preserve the shape (WRS)
          const ct1x = (prevX + (diffX / 3));
          const ct1y = (prevY + (diffY / 3));
          const ct2x = (curX - (diffX / 3));
          const ct2y = (curY - (diffY / 3));
          points = [curX, curY, ct1x, ct1y, ct2x, ct2y];
        }
        break;
      } case 4: {
        points = [curX, curY];

        // Store original prevve segment nums
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
  selectPt (pt, ctrlNum) {
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
  update () {
    const {elem} = this;
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
  endChanges (text) {
    if (isWebkit()) { editorContext_.resetD(this.elem); }
    const cmd = new ChangeElementCommand(this.elem, {d: this.last_d}, text);
    editorContext_.endChanges({cmd, elem: this.elem});
  }

  /**
  * @param {Integer|Integer[]} indexes
  * @returns {void}
  */
  addPtsToSelection (indexes) {
    if (!Array.isArray(indexes)) { indexes = [indexes]; }
    indexes.forEach((index) => {
      const seg = this.segs[index];
      if (seg.ptgrip) {
        if (!this.selected_pts.includes(index) && index >= 0) {
          this.selected_pts.push(index);
        }
      }
    });
    this.selected_pts.sort();
    let i = this.selected_pts.length;
    const grips = [];
    grips.length = i;
    // Loop through points to be selected and highlight each
    while (i--) {
      const pt = this.selected_pts[i];
      const seg = this.segs[pt];
      seg.select(true);
      grips[i] = seg.ptgrip;
    }

    const closedSubpath = Path.subpathIsClosed(this.selected_pts[0]);
    editorContext_.addPtsToSelection({grips, closedSubpath});
  }

  // STATIC
  /**
  * @param {Integer} index
  * @returns {boolean}
  */
  static subpathIsClosed (index) {
    let clsd = false;
    // Check if subpath is already open
    path.eachSeg(function (i) {
      if (i <= index) { return true; }
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
}

/**
* @function module:path.getPath_
* @param {SVGPathElement} elem
* @returns {module:path.Path}
*/
export const getPath_ = function (elem) {
  let p = pathData[elem.id];
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
export const removePath_ = function (id) {
  if (id in pathData) { delete pathData[id]; }
};

let newcx, newcy, oldcx, oldcy, angle;

const getRotVals = function (x, y) {
  let dx = x - oldcx;
  let dy = y - oldcy;

  // rotate the point around the old center
  let r = Math.sqrt(dx * dx + dy * dy);
  let theta = Math.atan2(dy, dx) + angle;
  dx = r * Math.cos(theta) + oldcx;
  dy = r * Math.sin(theta) + oldcy;

  // dx,dy should now hold the actual coordinates of each
  // point after being rotated

  // now we want to rotate them around the new center in the reverse direction
  dx -= newcx;
  dy -= newcy;

  r = Math.sqrt(dx * dx + dy * dy);
  theta = Math.atan2(dy, dx) - angle;

  return {x: r * Math.cos(theta) + newcx,
    y: r * Math.sin(theta) + newcy};
};

// If the path was rotated, we must now pay the piper:
// Every path point must be rotated into the rotated coordinate system of
// its old center, then determine the new center, then rotate it back
// This is because we want the path to remember its rotation

/**
* @function module:path.recalcRotatedPath
* @todo This is still using ye olde transform methods, can probably
* be optimized or even taken care of by `recalculateDimensions`
* @returns {void}
*/
export const recalcRotatedPath = function () {
  const currentPath = path.elem;
  angle = getRotationAngle(currentPath, true);
  if (!angle) { return; }
  // selectedBBoxes[0] = path.oldbbox;
  const oldbox = path.oldbbox; // selectedBBoxes[0],
  oldcx = oldbox.x + oldbox.width / 2;
  oldcy = oldbox.y + oldbox.height / 2;
  const box = getBBox(currentPath);
  newcx = box.x + box.width / 2;
  newcy = box.y + box.height / 2;

  // un-rotate the new center to the proper position
  const dx = newcx - oldcx,
    dy = newcy - oldcy,
    r = Math.sqrt(dx * dx + dy * dy),
    theta = Math.atan2(dy, dx) + angle;

  newcx = r * Math.cos(theta) + oldcx;
  newcy = r * Math.sin(theta) + oldcy;

  const list = currentPath.pathSegList;

  let i = list.numberOfItems;
  while (i) {
    i -= 1;
    const seg = list.getItem(i),
      type = seg.pathSegType;
    if (type === 1) { continue; }

    const rvals = getRotVals(seg.x, seg.y),
      points = [rvals.x, rvals.y];
    if (!isNullish(seg.x1) && !isNullish(seg.x2)) {
      const cVals1 = getRotVals(seg.x1, seg.y1);
      const cVals2 = getRotVals(seg.x2, seg.y2);
      points.splice(points.length, 0, cVals1.x, cVals1.y, cVals2.x, cVals2.y);
    }
    replacePathSeg(type, i, points);
  } // loop for each point

  /* box = */ getBBox(currentPath);
  // selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
  // selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;

  // now we must set the new transform to be rotated around the new center
  const Rnc = editorContext_.getSVGRoot().createSVGTransform(),
    tlist = getTransformList(currentPath);
  Rnc.setRotate((angle * 180.0 / Math.PI), newcx, newcy);
  tlist.replaceItem(Rnc, 0);
};

// ====================================
// Public API starts here

/**
* @function module:path.clearData
* @returns {void}
*/
export const clearData = function () {
  pathData = {};
};

// Making public for mocking
/**
* @function module:path.reorientGrads
* @param {Element} elem
* @param {SVGMatrix} m
* @returns {void}
*/
export const reorientGrads = function (elem, m) {
  const bb = utilsGetBBox(elem);
  for (let i = 0; i < 2; i++) {
    const type = i === 0 ? 'fill' : 'stroke';
    const attrVal = elem.getAttribute(type);
    if (attrVal && attrVal.startsWith('url(')) {
      const grad = getRefElem(attrVal);
      if (grad.tagName === 'linearGradient') {
        let x1 = grad.getAttribute('x1') || 0;
        let y1 = grad.getAttribute('y1') || 0;
        let x2 = grad.getAttribute('x2') || 1;
        let y2 = grad.getAttribute('y2') || 0;

        // Convert to USOU points
        x1 = (bb.width * x1) + bb.x;
        y1 = (bb.height * y1) + bb.y;
        x2 = (bb.width * x2) + bb.x;
        y2 = (bb.height * y2) + bb.y;

        // Transform those points
        const pt1 = transformPoint(x1, y1, m);
        const pt2 = transformPoint(x2, y2, m);

        // Convert back to BB points
        const gCoords = {
          x1: (pt1.x - bb.x) / bb.width,
          y1: (pt1.y - bb.y) / bb.height,
          x2: (pt2.x - bb.x) / bb.width,
          y2: (pt2.y - bb.y) / bb.height
        };

        const newgrad = grad.cloneNode(true);
        $(newgrad).attr(gCoords);

        newgrad.id = editorContext_.getNextId();
        findDefs().append(newgrad);
        elem.setAttribute(type, 'url(#' + newgrad.id + ')');
      }
    }
  }
};

/**
* This is how we map paths to our preferred relative segment types.
* @name module:path.pathMap
* @type {GenericArray}
*/
const pathMap = [
  0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a',
  'H', 'h', 'V', 'v', 'S', 's', 'T', 't'
];

/**
 * Convert a path to one with only absolute or relative values.
 * @todo move to pathActions.js
 * @function module:path.convertPath
 * @param {SVGPathElement} pth - the path to convert
 * @param {boolean} toRel - true of convert to relative
 * @returns {string}
 */
export const convertPath = function (pth, toRel) {
  const {pathSegList} = pth;
  const len = pathSegList.numberOfItems;
  let curx = 0, cury = 0;
  let d = '';
  let lastM = null;

  for (let i = 0; i < len; ++i) {
    const seg = pathSegList.getItem(i);
    // if these properties are not in the segment, set them to zero
    let x = seg.x || 0,
      y = seg.y || 0,
      x1 = seg.x1 || 0,
      y1 = seg.y1 || 0,
      x2 = seg.x2 || 0,
      y2 = seg.y2 || 0;

    const type = seg.pathSegType;
    let letter = pathMap[type][toRel ? 'toLowerCase' : 'toUpperCase']();

    switch (type) {
    case 1: // z,Z closepath (Z/z)
      d += 'z';
      if (lastM && !toRel) {
        curx = lastM[0];
        cury = lastM[1];
      }
      break;
    case 12: // absolute horizontal line (H)
      x -= curx;
      // Fallthrough
    case 13: // relative horizontal line (h)
      if (toRel) {
        y = 0;
        curx += x;
        letter = 'l';
      } else {
        y = cury;
        x += curx;
        curx = x;
        letter = 'L';
      }
      // Convert to "line" for easier editing
      d += pathDSegment(letter, [[x, y]]);
      break;
    case 14: // absolute vertical line (V)
      y -= cury;
      // Fallthrough
    case 15: // relative vertical line (v)
      if (toRel) {
        x = 0;
        cury += y;
        letter = 'l';
      } else {
        x = curx;
        y += cury;
        cury = y;
        letter = 'L';
      }
      // Convert to "line" for easier editing
      d += pathDSegment(letter, [[x, y]]);
      break;
    case 2: // absolute move (M)
    case 4: // absolute line (L)
    case 18: // absolute smooth quad (T)
      x -= curx;
      y -= cury;
      // Fallthrough
    case 5: // relative line (l)
    case 3: // relative move (m)
    case 19: // relative smooth quad (t)
      if (toRel) {
        curx += x;
        cury += y;
      } else {
        x += curx;
        y += cury;
        curx = x;
        cury = y;
      }
      if (type === 2 || type === 3) { lastM = [curx, cury]; }

      d += pathDSegment(letter, [[x, y]]);
      break;
    case 6: // absolute cubic (C)
      x -= curx; x1 -= curx; x2 -= curx;
      y -= cury; y1 -= cury; y2 -= cury;
      // Fallthrough
    case 7: // relative cubic (c)
      if (toRel) {
        curx += x;
        cury += y;
      } else {
        x += curx; x1 += curx; x2 += curx;
        y += cury; y1 += cury; y2 += cury;
        curx = x;
        cury = y;
      }
      d += pathDSegment(letter, [[x1, y1], [x2, y2], [x, y]]);
      break;
    case 8: // absolute quad (Q)
      x -= curx; x1 -= curx;
      y -= cury; y1 -= cury;
      // Fallthrough
    case 9: // relative quad (q)
      if (toRel) {
        curx += x;
        cury += y;
      } else {
        x += curx; x1 += curx;
        y += cury; y1 += cury;
        curx = x;
        cury = y;
      }
      d += pathDSegment(letter, [[x1, y1], [x, y]]);
      break;
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    case 10: // absolute elliptical arc (A)
      x -= curx;
      y -= cury;
      // Fallthrough
    case 11: // relative elliptical arc (a)
      if (toRel) {
        curx += x;
        cury += y;
      } else {
        x += curx;
        y += cury;
        curx = x;
        cury = y;
      }
      d += pathDSegment(letter, [[seg.r1, seg.r2]], [
        seg.angle,
        (seg.largeArcFlag ? 1 : 0),
        (seg.sweepFlag ? 1 : 0)
      ], [x, y]);
      break;
    case 16: // absolute smooth cubic (S)
      x -= curx; x2 -= curx;
      y -= cury; y2 -= cury;
      // Fallthrough
    case 17: // relative smooth cubic (s)
      if (toRel) {
        curx += x;
        cury += y;
      } else {
        x += curx; x2 += curx;
        y += cury; y2 += cury;
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
function pathDSegment (letter, points, morePoints, lastPoint) {
  $.each(points, function (i, pnt) {
    points[i] = shortFloat(pnt);
  });
  let segment = letter + points.join(' ');
  if (morePoints) {
    segment += ' ' + morePoints.join(' ');
  }
  if (lastPoint) {
    segment += ' ' + shortFloat(lastPoint);
  }
  return segment;
}

pathActionsInit(
  /**
* @implements {module:text-actions.textActionsContext}
*/
  {
    getEditorContext () { return editorContext_; },
    getPathMap () { return pathMap; },
    smoothControlPoints,
    addPointGrip,
    recalcRotatedPath,
    removePath_,
    addCtrlGrip,
    getCtrlLine,
    replacePathSeg,
    insertItemBefore,
    getPointFromGrip,
    getGripPt,
    getPath_,
    reorientGrads,
    setLinkControlPoints
  }
);
/* eslint-disable jsdoc/require-property */
/**
* Group: Path edit functions.
* Functions relating to editing path elements.
* @namespace {PlainObject} pathActions
* @memberof module:path
*/
export const pathActions = pathActionsMethod;
// end pathActions
