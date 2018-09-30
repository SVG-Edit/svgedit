/* globals jQuery */
/**
 * Path functionality
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import './svgpathseg.js';
import {NS} from './namespaces.js';
import {getTransformList} from './svgtransformlist.js';
import {shortFloat} from './units.js';
import {ChangeElementCommand, BatchCommand} from './history.js';
import {
  transformPoint, getMatrix, snapToAngle, rectsIntersect,
  transformListToTransform
} from './math.js';
import {
  assignAttributes, getElem, getRotationAngle, getBBox,
  getRefElem, findDefs, snapToGrid,
  getBBox as utilsGetBBox
} from './utilities.js';
import {
  supportsPathInsertItemBefore, supportsPathReplaceItem, isWebkit
} from './browser.js';

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
 * @property {PlainObject.<string, string>} ui
*/

const uiStrings = {};
/**
* @function module:path.setUiStrings
* @param {module:path.uiStrings} strs
* @returns {undefined}
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
* @returns {undefined}
*/
export const setLinkControlPoints = function (lcp) {
  linkControlPts = lcp;
};

/**
 * @name module:path.path
 * @type {null|module:path.Path}
 * @memberof module:path
*/
export let path = null;

let editorContext_ = null;

/**
* @external MouseEvent
*/

/**
* Object with the following keys/values
* @typedef {PlainObject} module:path.SVGElementJSON
* @property {string} element - Tag name of the SVG element to create
* @property {PlainObject.<string, string>} attr - Has key-value attributes to assign to the new element
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
 * @returns {undefined}
 */
/**
 * @function module:path.EditorContext#resetD
 * @param {SVGPathElement} p
 * @returns {undefined}
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
 * @returns {undefined}
*/
/**
 * @function module:path.EditorContext#addToSelection
 * @param {Element[]} elemsToAdd - An array of DOM elements to add to the selection
 * @param {boolean} showGrips - Indicates whether the resize grips should be shown
 * @returns {undefined}
*/
/**
 * @function module:path.EditorContext#addCommandToHistory
 * @param {Command} cmd
 * @returns {undefined}
 */
/**
 * @function module:path.EditorContext#remapElement
 * @param {Element} selected - DOM element to be changed
 * @param {PlainObject.<string, string>} changes - Object with changes to be remapped
 * @param {SVGMatrix} m - Matrix object to use for remapping coordinates
 * @returns {undefined}
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
 * @returns {undefined}
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
 * @returns {undefined}
 */
/**
 * @function module:path.EditorContext#endChanges
 * @param {PlainObject} cfg
 * @param {string} cfg.cmd
 * @param {Element} cfg.elem
 * @returns {undefined}
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
* @returns {undefined}
*/
export const init = function (editorContext) {
  editorContext_ = editorContext;

  pathFuncs = [0, 'ClosePath'];
  const pathFuncsStrs = ['Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
    'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'];
  $.each(pathFuncsStrs, function (i, s) {
    pathFuncs.push(s + 'Abs');
    pathFuncs.push(s + 'Rel');
  });
};

/**
* @function module:path.insertItemBefore
* @param {Element} elem
* @param {Segment} newseg
* @param {Integer} index
* @returns {undefined}
*/
export const insertItemBefore = function (elem, newseg, index) {
  // Support insertItemBefore on paths for FF2
  const list = elem.pathSegList;

  if (supportsPathInsertItemBefore()) {
    list.insertItemBefore(newseg, index);
    return;
  }
  const len = list.numberOfItems;
  const arr = [];
  for (let i = 0; i < len; i++) {
    const curSeg = list.getItem(i);
    arr.push(curSeg);
  }
  list.clear();
  for (let i = 0; i < len; i++) {
    if (i === index) { // index + 1
      list.appendItem(newseg);
    }
    list.appendItem(arr[i]);
  }
};

/**
* @function module:path.ptObjToArr
* @todo See if this should just live in `replacePathSeg`
* @param {string} type
* @param {SVGPathSegMovetoAbs|SVGPathSegLinetoAbs|SVGPathSegCurvetoCubicAbs|SVGPathSegCurvetoQuadraticAbs|SVGPathSegArcAbs|SVGPathSegLinetoHorizontalAbs|SVGPathSegLinetoVerticalAbs|SVGPathSegCurvetoCubicSmoothAbs|SVGPathSegCurvetoQuadraticSmoothAbs} segItem
* @returns {ArgumentsArray}
*/
export const ptObjToArr = function (type, segItem) {
  const props = segData[type];
  return props.map((prop) => {
    return segItem[prop];
  });
};

/**
* @function module:path.getGripPt
* @param {Segment} seg
* @param {module:math.XYObject} altPt
* @returns {module:math.XYObject}
*/
export const getGripPt = function (seg, altPt) {
  const {path} = seg;
  let out = {
    x: altPt ? altPt.x : seg.item.x,
    y: altPt ? altPt.y : seg.item.y
  };

  if (path.matrix) {
    const pt = transformPoint(out.x, out.y, path.matrix);
    out = pt;
  }

  const currentZoom = editorContext_.getCurrentZoom();
  out.x *= currentZoom;
  out.y *= currentZoom;

  return out;
};

/**
* @function module:path.getPointFromGrip
* @param {module:math.XYObject} pt
* @param {module:path.Path} path
* @returns {module:math.XYObject}
*/
export const getPointFromGrip = function (pt, path) {
  const out = {
    x: pt.x,
    y: pt.y
  };

  if (path.matrix) {
    pt = transformPoint(out.x, out.y, path.imatrix);
    out.x = pt.x;
    out.y = pt.y;
  }

  const currentZoom = editorContext_.getCurrentZoom();
  out.x /= currentZoom;
  out.y /= currentZoom;

  return out;
};

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip
* @function module:path.addPointGrip
* @param {Integer} index
* @param {Integer} x
* @param {Integer} y
* @returns {SVGCircleElement}
*/
export const addPointGrip = function (index, x, y) {
  // create the container of all the point grips
  const pointGripContainer = getGripContainer();

  let pointGrip = getElem('pathpointgrip_' + index);
  // create it
  if (!pointGrip) {
    pointGrip = document.createElementNS(NS.SVG, 'circle');
    const atts = {
      id: 'pathpointgrip_' + index,
      display: 'none',
      r: 4,
      fill: '#0FF',
      stroke: '#00F',
      'stroke-width': 2,
      cursor: 'move',
      style: 'pointer-events:all'
    };
    if ('pathNodeTooltip' in uiStrings) { // May be empty if running path.js without svg-editor
      atts['xlink:title'] = uiStrings.pathNodeTooltip;
    }
    assignAttributes(pointGrip, atts);
    pointGrip = pointGripContainer.appendChild(pointGrip);

    const grip = $('#pathpointgrip_' + index);
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
export const getGripContainer = function () {
  let c = getElem('pathpointgrip_container');
  if (!c) {
    const parent = getElem('selectorParentGroup');
    c = parent.appendChild(document.createElementNS(NS.SVG, 'g'));
    c.id = 'pathpointgrip_container';
  }
  return c;
};

/**
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip
* @function module:path.addCtrlGrip
* @param {string} id
* @returns {SVGCircleElement}
*/
export const addCtrlGrip = function (id) {
  let pointGrip = getElem('ctrlpointgrip_' + id);
  if (pointGrip) { return pointGrip; }

  pointGrip = document.createElementNS(NS.SVG, 'circle');
  const atts = {
    id: 'ctrlpointgrip_' + id,
    display: 'none',
    r: 4,
    fill: '#0FF',
    stroke: '#55F',
    'stroke-width': 1,
    cursor: 'move',
    style: 'pointer-events:all'
  };
  if ('pathCtrlPtTooltip' in uiStrings) { // May be empty if running path.js without svg-editor
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
export const getCtrlLine = function (id) {
  let ctrlLine = getElem('ctrlLine_' + id);
  if (ctrlLine) { return ctrlLine; }

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
* @returns {PlainObject.<string, SVGLineElement|SVGCircleElement>}
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
*/
export const replacePathSeg = function (type, index, pts, elem) {
  const pth = elem || path.elem;

  const func = 'createSVGPathSeg' + pathFuncs[type];
  const seg = pth[func].apply(pth, pts);

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
      const pt = getGripPt(seg, {x: pts[i], y: pts[i + 1]});
      pts[i] = pt.x;
      pts[i + 1] = pt.y;
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
* Takes three points and creates a smoother line based on them
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
   * @returns {undefined}
   */
  showCtrlPts (y) {
    for (const i in this.ctrlpts) {
      if (this.ctrlpts.hasOwnProperty(i)) {
        this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none');
      }
    }
  }

  /**
   * @param {boolean} y
   * @returns {undefined}
   */
  selectCtrls (y) {
    $('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2')
      .attr('fill', y ? '#0FF' : '#EEE');
  }

  /**
   * @param {boolean} y
   * @returns {undefined}
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
   * @returns {undefined}
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
   * @returns {undefined}
   */
  addGrip () {
    this.ptgrip = getPointGrip(this, true);
    this.ctrlpts = getControlPoints(this); // , true);
    this.segsel = getSegSelector(this, true);
  }

  /**
   * @param {boolean} full
   * @returns {undefined}
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
   * @returns {undefined}
   */
  move (dx, dy) {
    const {item} = this;

    const curPts = this.ctrlpts
      ? [item.x += dx, item.y += dy,
        item.x1, item.y1, item.x2 += dx, item.y2 += dy
      ]
      : [item.x += dx, item.y += dy];

    replacePathSeg(this.type, this.index, curPts);

    if (this.next && this.next.ctrlpts) {
      const next = this.next.item;
      const nextPts = [next.x, next.y,
        next.x1 += dx, next.y1 += dy, next.x2, next.y2];
      replacePathSeg(this.next.type, this.next.index, nextPts);
    }

    if (this.mate) {
      // The last point of a closed subpath has a 'mate',
      // which is the 'M' segment of the subpath
      const {item} = this.mate;
      const pts = [item.x += dx, item.y += dy];
      replacePathSeg(this.mate.type, this.mate.index, pts);
      // Has no grip, so does not need 'updating'?
    }

    this.update(true);
    if (this.next) { this.next.update(true); }
  }

  /**
   * @param {Integer} num
   * @returns {undefined}
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

    const pts = [item.x, item.y,
      item.x1, item.y1,
      item.x2, item.y2];

    replacePathSeg(seg.type, seg.index, pts);
    seg.update(true);
  }

  /**
   * @param {Integer} num
   * @param {Integer} dx
   * @param {Integer} dy
   * @returns {undefined}
   */
  moveCtrl (num, dx, dy) {
    const {item} = this;
    item['x' + num] += dx;
    item['y' + num] += dy;

    const pts = [item.x, item.y,
      item.x1, item.y1, item.x2, item.y2];

    replacePathSeg(this.type, this.index, pts);
    this.update(true);
  }

  /**
   * @param {Integer} newType Possible values set during {@link module:path.init}
   * @param {ArgumentsArray} pts
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
  * @param {SVGPathElement}
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
  * Reset path data
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
        if (this.first_seg == null) {
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
  * @returns {boolean} Will stop execution of `eachSeg` if returns `false`
  */
  /**
  * @param {module:path.PathEachSegCallback} fn
  * @returns {undefined}
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
  * @returns {undefined}
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
  * @returns {undefined}
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
  * @returns {boolean}
  */
  subpathIsClosed (index) {
    let closed = false;
    // Check if subpath is already open
    path.eachSeg(function (i) {
      if (i <= index) { return true; }
      if (this.type === 2) {
        // Found M first, so open
        return false;
      }
      if (this.type === 1) {
        // Found Z first, so closed
        closed = true;
        return false;
      }
    });

    return closed;
  }

  /**
  * @param {Integer} index
  * @returns {undefined}
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
  * @returns {undefined}
  */
  clearSelection () {
    this.eachSeg(function () {
      // 'this' is the segment here
      this.select(false);
    });
    this.selected_pts = [];
  }

  /**
  * @returns {undefined}
  */
  storeD () {
    this.last_d = this.elem.getAttribute('d');
  }

  /**
  * @param {Integer} y
  * @returns {undefined}
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
  * Move selected points
  * @param {Integer} dx
  * @param {Integer} dy
  * @returns {undefined}
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
  * @returns {undefined}
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
  * @returns {undefined}
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
  * @returns {undefined}
  */
  selectPt (pt, ctrlNum) {
    this.clearSelection();
    if (pt == null) {
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
  * Update position of all points
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
  * @returns {undefined}
  */
  endChanges (text) {
    if (isWebkit()) { editorContext_.resetD(this.elem); }
    const cmd = new ChangeElementCommand(this.elem, {d: this.last_d}, text);
    editorContext_.endChanges({cmd, elem: this.elem});
  }

  /**
  * @param {Integer|Integer[]} indexes
  * @returns {undefined}
  */
  addPtsToSelection (indexes) {
    if (!Array.isArray(indexes)) { indexes = [indexes]; }
    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      const seg = this.segs[index];
      if (seg.ptgrip) {
        if (!this.selected_pts.includes(index) && index >= 0) {
          this.selected_pts.push(index);
        }
      }
    }
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

    const closedSubpath = this.subpathIsClosed(this.selected_pts[0]);
    editorContext_.addPtsToSelection({grips, closedSubpath});
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
* @returns {undefined}
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
* @returns {undefined}
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
    if (seg.x1 != null && seg.x2 != null) {
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
* @returns {undefined}
*/
export const clearData = function () {
  pathData = {};
};

// Making public for mocking
/**
* @function module:path.reorientGrads
* @param {Element} elem
* @param {SVGMatrix} m
* @returns {undefined}
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
        const gCoords = {};

        gCoords.x1 = (pt1.x - bb.x) / bb.width;
        gCoords.y1 = (pt1.y - bb.y) / bb.height;
        gCoords.x2 = (pt2.x - bb.x) / bb.width;
        gCoords.y2 = (pt2.y - bb.y) / bb.height;

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
* This is how we map paths to our preferred relative segment types
* @name module:path.pathMap
* @type {GenericArray}
*/
const pathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a',
  'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];

/**
 * Convert a path to one with only absolute or relative values
 * @todo move to pathActions.js
 * @function module:path.convertPath
 * @param {SVGPathElement} path - the path to convert
 * @param {boolean} toRel - true of convert to relative
 * @returns {string}
 */
export const convertPath = function (path, toRel) {
  const segList = path.pathSegList;
  const len = segList.numberOfItems;
  let curx = 0, cury = 0;
  let d = '';
  let lastM = null;

  for (let i = 0; i < len; ++i) {
    const seg = segList.getItem(i);
    // if these properties are not in the segment, set them to zero
    let x = seg.x || 0,
      y = seg.y || 0,
      x1 = seg.x1 || 0,
      y1 = seg.y1 || 0,
      x2 = seg.x2 || 0,
      y2 = seg.y2 || 0;

    const type = seg.pathSegType;
    let letter = pathMap[type]['to' + (toRel ? 'Lower' : 'Upper') + 'Case']();

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
        curx += x;
        letter = 'l';
      } else {
        x += curx;
        curx = x;
        letter = 'L';
      }
      // Convert to "line" for easier editing
      d += pathDSegment(letter, [[x, cury]]);
      break;
    case 14: // absolute vertical line (V)
      y -= cury;
      // Fallthrough
    case 15: // relative vertical line (v)
      if (toRel) {
        cury += y;
        letter = 'l';
      } else {
        y += cury;
        cury = y;
        letter = 'L';
      }
      // Convert to "line" for easier editing
      d += pathDSegment(letter, [[curx, y]]);
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
 * TODO: refactor callers in convertPath to use getPathDFromSegments instead of this function.
 * Legacy code refactored from svgcanvas.pathActions.convertPath
 * @param {string} letter - path segment command (letter in potentially either case from {@link module:path.pathMap}; see [SVGPathSeg#pathSegTypeAsLetter]{@link https://www.w3.org/TR/SVG/single-page.html#paths-__svg__SVGPathSeg__pathSegTypeAsLetter})
 * @param {Integer[][]} points - x,y points
 * @param {Integer[][]} [morePoints] - x,y points
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

/**
* Group: Path edit functions
* Functions relating to editing path elements
* @namespace {PlainObject} pathActions
* @memberof module:path
*/
export const pathActions = (function () {
  let subpath = false;
  let newPoint, firstCtrl;

  let currentPath = null;
  let hasMoved = false;
  // No `editorContext_` yet but should be ok as is `null` by default
  // editorContext_.setDrawnPath(null);

  /**
  * This function converts a polyline (created by the fh_path tool) into
  * a path element and coverts every three line segments into a single bezier
  * curve in an attempt to smooth out the free-hand
  * @function smoothPolylineIntoPath
  * @param {Element} element
  * @returns {Element}
  */
  const smoothPolylineIntoPath = function (element) {
    let i;
    const {points} = element;
    const N = points.numberOfItems;
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
      let curpos = points.getItem(0), prevCtlPt = null;
      let d = [];
      d.push(['M', curpos.x, ',', curpos.y, ' C'].join(''));
      for (i = 1; i <= (N - 4); i += 3) {
        let ct1 = points.getItem(i);
        const ct2 = points.getItem(i + 1);
        const end = points.getItem(i + 2);

        // if the previous segment had a control point, we want to smooth out
        // the control points on both sides
        if (prevCtlPt) {
          const newpts = smoothControlPoints(prevCtlPt, ct1, curpos);
          if (newpts && newpts.length === 2) {
            const prevArr = d[d.length - 1].split(',');
            prevArr[2] = newpts[0].x;
            prevArr[3] = newpts[0].y;
            d[d.length - 1] = prevArr.join(',');
            ct1 = newpts[1];
          }
        }

        d.push([ct1.x, ct1.y, ct2.x, ct2.y, end.x, end.y].join(','));

        curpos = end;
        prevCtlPt = ct2;
      }
      // handle remaining line segments
      d.push('L');
      while (i < N) {
        const pt = points.getItem(i);
        d.push([pt.x, pt.y].join(','));
        i++;
      }
      d = d.join(' ');

      // create new path element
      element = editorContext_.addSVGElementFromJson({
        element: 'path',
        curStyles: true,
        attr: {
          id: editorContext_.getId(),
          d,
          fill: 'none'
        }
      });
      // No need to call "changed", as this is already done under mouseUp
    }
    return element;
  };

  return (/** @lends module:path.pathActions */ {
    /**
    * @param {MouseEvent} evt
    * @param {Element} mouseTarget
    * @param {Float} startX
    * @param {Float} startY
    * @returns {undefined}
    */
    mouseDown (evt, mouseTarget, startX, startY) {
      let id;
      if (editorContext_.getCurrentMode() === 'path') {
        let mouseX = startX; // Was this meant to work with the other `mouseX`? (was defined globally so adding `let` to at least avoid a global)
        let mouseY = startY; // Was this meant to work with the other `mouseY`? (was defined globally so adding `let` to at least avoid a global)

        const currentZoom = editorContext_.getCurrentZoom();
        let x = mouseX / currentZoom,
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

        let keep = null;
        let index;
        // if pts array is empty, create path element with M at current point
        const drawnPath = editorContext_.getDrawnPath();
        if (!drawnPath) {
          const dAttr = 'M' + x + ',' + y + ' '; // Was this meant to work with the other `dAttr`? (was defined globally so adding `var` to at least avoid a global)
          /* drawnPath = */ editorContext_.setDrawnPath(editorContext_.addSVGElementFromJson({
            element: 'path',
            curStyles: true,
            attr: {
              d: dAttr,
              id: editorContext_.getNextId(),
              opacity: editorContext_.getOpacity() / 2
            }
          }));
          // set stretchy line to first point
          stretchy.setAttribute('d', ['M', mouseX, mouseY, mouseX, mouseY].join(' '));
          index = subpath ? path.segs.length : 0;
          addPointGrip(index, mouseX, mouseY);
        } else {
          // determine if we clicked on an existing point
          const seglist = drawnPath.pathSegList;
          let i = seglist.numberOfItems;
          const FUZZ = 6 / currentZoom;
          let clickOnPoint = false;
          while (i) {
            i--;
            const item = seglist.getItem(i);
            const px = item.x, py = item.y;
            // found a matching point
            if (x >= (px - FUZZ) && x <= (px + FUZZ) &&
              y >= (py - FUZZ) && y <= (py + FUZZ)
            ) {
              clickOnPoint = true;
              break;
            }
          }

          // get path element that we are in the process of creating
          id = editorContext_.getId();

          // Remove previous path object if previously created
          removePath_(id);

          const newpath = getElem(id);
          let newseg;
          let sSeg;
          const len = seglist.numberOfItems;
          // if we clicked on an existing point, then we are done this path, commit it
          // (i, i+1) are the x,y that were clicked on
          if (clickOnPoint) {
            // if clicked on any other point but the first OR
            // the first point was clicked on and there are less than 3 points
            // then leave the path open
            // otherwise, close the path
            if (i <= 1 && len >= 2) {
              // Create end segment
              const absX = seglist.getItem(0).x;
              const absY = seglist.getItem(0).y;

              sSeg = stretchy.pathSegList.getItem(1);
              if (sSeg.pathSegType === 4) {
                newseg = drawnPath.createSVGPathSegLinetoAbs(absX, absY);
              } else {
                newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(
                  absX,
                  absY,
                  sSeg.x1 / currentZoom,
                  sSeg.y1 / currentZoom,
                  absX,
                  absY
                );
              }

              const endseg = drawnPath.createSVGPathSegClosePath();
              seglist.appendItem(newseg);
              seglist.appendItem(endseg);
            } else if (len < 3) {
              keep = false;
              return keep;
            }
            $(stretchy).remove();

            // This will signal to commit the path
            // const element = newpath; // Other event handlers define own `element`, so this was probably not meant to interact with them or one which shares state (as there were none); I therefore adding a missing `var` to avoid a global
            /* drawnPath = */ editorContext_.setDrawnPath(null);
            editorContext_.setStarted(false);

            if (subpath) {
              if (path.matrix) {
                editorContext_.remapElement(newpath, {}, path.matrix.inverse());
              }

              const newD = newpath.getAttribute('d');
              const origD = $(path.elem).attr('d');
              $(path.elem).attr('d', origD + newD);
              $(newpath).remove();
              if (path.matrix) {
                recalcRotatedPath();
              }
              init();
              pathActions.toEditMode(path.elem);
              path.selectPt();
              return false;
            }
          // else, create a new point, update path element
          } else {
            // Checks if current target or parents are #svgcontent
            if (!$.contains(
              editorContext_.getContainer(),
              editorContext_.getMouseTarget(evt)
            )) {
              // Clicked outside canvas, so don't make point
              console.log('Clicked outside canvas');
              return false;
            }

            const num = drawnPath.pathSegList.numberOfItems;
            const last = drawnPath.pathSegList.getItem(num - 1);
            const lastx = last.x, lasty = last.y;

            if (evt.shiftKey) {
              const xya = snapToAngle(lastx, lasty, x, y);
              ({x, y} = xya);
            }

            // Use the segment defined by stretchy
            sSeg = stretchy.pathSegList.getItem(1);
            if (sSeg.pathSegType === 4) {
              newseg = drawnPath.createSVGPathSegLinetoAbs(
                editorContext_.round(x),
                editorContext_.round(y)
              );
            } else {
              newseg = drawnPath.createSVGPathSegCurvetoCubicAbs(
                editorContext_.round(x),
                editorContext_.round(y),
                sSeg.x1 / currentZoom,
                sSeg.y1 / currentZoom,
                sSeg.x2 / currentZoom,
                sSeg.y2 / currentZoom
              );
            }

            drawnPath.pathSegList.appendItem(newseg);

            x *= currentZoom;
            y *= currentZoom;

            // set stretchy line to latest point
            stretchy.setAttribute('d', ['M', x, y, x, y].join(' '));
            index = num;
            if (subpath) { index += path.segs.length; }
            addPointGrip(index, x, y);
          }
          // keep = true;
        }

        return;
      }

      // TODO: Make sure currentPath isn't null at this point
      if (!path) { return; }

      path.storeD();

      ({id} = evt.target);
      let curPt;
      if (id.substr(0, 14) === 'pathpointgrip_') {
        // Select this point
        curPt = path.cur_pt = parseInt(id.substr(14), 10);
        path.dragging = [startX, startY];
        const seg = path.segs[curPt];

        // only clear selection if shift is not pressed (otherwise, add
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

        const parts = id.split('_')[1].split('c');
        curPt = Number(parts[0]);
        const ctrlNum = Number(parts[1]);
        path.selectPt(curPt, ctrlNum);
      }

      // Start selection box
      if (!path.dragging) {
        let rubberBox = editorContext_.getRubberBox();
        if (rubberBox == null) {
          rubberBox = editorContext_.setRubberBox(
            editorContext_.selectorManager.getRubberBandBox()
          );
        }
        const currentZoom = editorContext_.getCurrentZoom();
        assignAttributes(rubberBox, {
          x: startX * currentZoom,
          y: startY * currentZoom,
          width: 0,
          height: 0,
          display: 'inline'
        }, 100);
      }
    },
    /**
    * @param {Float} mouseX
    * @param {Float} mouseY
    * @returns {undefined}
    */
    mouseMove (mouseX, mouseY) {
      const currentZoom = editorContext_.getCurrentZoom();
      hasMoved = true;
      const drawnPath = editorContext_.getDrawnPath();
      if (editorContext_.getCurrentMode() === 'path') {
        if (!drawnPath) { return; }
        const seglist = drawnPath.pathSegList;
        const index = seglist.numberOfItems - 1;

        if (newPoint) {
          // First point
          // if (!index) { return; }

          // Set control points
          const pointGrip1 = addCtrlGrip('1c1');
          const pointGrip2 = addCtrlGrip('0c2');

          // dragging pointGrip1
          pointGrip1.setAttribute('cx', mouseX);
          pointGrip1.setAttribute('cy', mouseY);
          pointGrip1.setAttribute('display', 'inline');

          const ptX = newPoint[0];
          const ptY = newPoint[1];

          // set curve
          // const seg = seglist.getItem(index);
          const curX = mouseX / currentZoom;
          const curY = mouseY / currentZoom;
          const altX = (ptX + (ptX - curX));
          const altY = (ptY + (ptY - curY));

          pointGrip2.setAttribute('cx', altX * currentZoom);
          pointGrip2.setAttribute('cy', altY * currentZoom);
          pointGrip2.setAttribute('display', 'inline');

          const ctrlLine = getCtrlLine(1);
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
            const last = seglist.getItem(index - 1);
            let lastX = last.x;
            let lastY = last.y;

            if (last.pathSegType === 6) {
              lastX += (lastX - last.x2);
              lastY += (lastY - last.y2);
            } else if (firstCtrl) {
              lastX = firstCtrl[0] / currentZoom;
              lastY = firstCtrl[1] / currentZoom;
            }
            replacePathSeg(6, index, [ptX, ptY, lastX, lastY, altX, altY], drawnPath);
          }
        } else {
          const stretchy = getElem('path_stretch_line');
          if (stretchy) {
            const prev = seglist.getItem(index);
            if (prev.pathSegType === 6) {
              const prevX = prev.x + (prev.x - prev.x2);
              const prevY = prev.y + (prev.y - prev.y2);
              replacePathSeg(6, 1, [mouseX, mouseY, prevX * currentZoom, prevY * currentZoom, mouseX, mouseY], stretchy);
            } else if (firstCtrl) {
              replacePathSeg(6, 1, [mouseX, mouseY, firstCtrl[0], firstCtrl[1], mouseX, mouseY], stretchy);
            } else {
              replacePathSeg(4, 1, [mouseX, mouseY], stretchy);
            }
          }
        }
        return;
      }
      // if we are dragging a point, let's move it
      if (path.dragging) {
        const pt = getPointFromGrip({
          x: path.dragging[0],
          y: path.dragging[1]
        }, path);
        const mpt = getPointFromGrip({
          x: mouseX,
          y: mouseY
        }, path);
        const diffX = mpt.x - pt.x;
        const diffY = mpt.y - pt.y;
        path.dragging = [mouseX, mouseY];

        if (path.dragctrl) {
          path.moveCtrl(diffX, diffY);
        } else {
          path.movePts(diffX, diffY);
        }
      } else {
        path.selected_pts = [];
        path.eachSeg(function (i) {
          const seg = this;
          if (!seg.next && !seg.prev) { return; }

          // const {item} = seg;
          const rubberBox = editorContext_.getRubberBox();
          const rbb = rubberBox.getBBox();

          const pt = getGripPt(seg);
          const ptBb = {
            x: pt.x,
            y: pt.y,
            width: 0,
            height: 0
          };

          const sel = rectsIntersect(rbb, ptBb);

          this.select(sel);
          // Note that addPtsToSelection is not being run
          if (sel) { path.selected_pts.push(seg.index); }
        });
      }
    },
    /**
    * @param {Event} evt
    * @param {Element} element
    * @param {Float} mouseX
    * @param {Float} mouseY
    * @returns {undefined}
    */
    mouseUp (evt, element, mouseX, mouseY) {
      const drawnPath = editorContext_.getDrawnPath();
      // Create mode
      if (editorContext_.getCurrentMode() === 'path') {
        newPoint = null;
        if (!drawnPath) {
          element = getElem(editorContext_.getId());
          editorContext_.setStarted(false);
          firstCtrl = null;
        }

        return {
          keep: true,
          element
        };
      }

      // Edit mode
      const rubberBox = editorContext_.getRubberBox();
      if (path.dragging) {
        const lastPt = path.cur_pt;

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
        }

      // else, move back to select mode
      } else {
        pathActions.toSelectMode(evt.target);
      }
      hasMoved = false;
    },
    /**
    * @param {Element} element
    * @returns {undefined}
    */
    toEditMode (element) {
      path = getPath_(element);
      editorContext_.setCurrentMode('pathedit');
      editorContext_.clearSelection();
      path.show(true).update();
      path.oldbbox = utilsGetBBox(path.elem);
      subpath = false;
    },
    /**
    * @param {Element} element
    * @fires module:svgcanvas.SvgCanvas#event:selected
    * @returns {undefined}
    */
    toSelectMode (elem) {
      const selPath = (elem === path.elem);
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
    * @returns {undefined}
    */
    addSubPath (on) {
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
    * @returns {undefined}
    */
    select (target) {
      if (currentPath === target) {
        pathActions.toEditMode(target);
        editorContext_.setCurrentMode('pathedit');
      // going into pathedit mode
      } else {
        currentPath = target;
      }
    },
    /**
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {undefined}
    */
    reorient () {
      const elem = editorContext_.getSelectedElements()[0];
      if (!elem) { return; }
      const angle = getRotationAngle(elem);
      if (angle === 0) { return; }

      const batchCmd = new BatchCommand('Reorient path');
      const changes = {
        d: elem.getAttribute('d'),
        transform: elem.getAttribute('transform')
      };
      batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
      editorContext_.clearSelection();
      this.resetOrientation(elem);

      editorContext_.addCommandToHistory(batchCmd);

      // Set matrix to null
      getPath_(elem).show(false).matrix = null;

      this.clear();

      editorContext_.addToSelection([elem], true);
      editorContext_.call('changed', editorContext_.getSelectedElements());
    },

    /**
    * @param {boolean} remove Not in use
    * @returns {undefined}
    */
    clear (remove) {
      const drawnPath = editorContext_.getDrawnPath();
      currentPath = null;
      if (drawnPath) {
        const elem = getElem(editorContext_.getId());
        $(getElem('path_stretch_line')).remove();
        $(elem).remove();
        $(getElem('pathpointgrip_container')).find('*').attr('display', 'none');
        firstCtrl = null;
        editorContext_.setDrawnPath(null);
        editorContext_.setStarted(false);
      } else if (editorContext_.getCurrentMode() === 'pathedit') {
        this.toSelectMode();
      }
      if (path) { path.init().show(false); }
    },
    /**
    * @param {?(Element|SVGPathElement)} pth
    * @returns {false|undefined}
    */
    resetOrientation (pth) {
      if (pth == null || pth.nodeName !== 'path') { return false; }
      const tlist = getTransformList(pth);
      const m = transformListToTransform(tlist).matrix;
      tlist.clear();
      pth.removeAttribute('transform');
      const segList = pth.pathSegList;

      // Opera/win/non-EN throws an error here.
      // TODO: Find out why!
      // Presumed fixed in Opera 10.5, so commented out for now

      // try {
      const len = segList.numberOfItems;
      // } catch(err) {
      //   const fixed_d = pathActions.convertPath(pth);
      //   pth.setAttribute('d', fixed_d);
      //   segList = pth.pathSegList;
      //   const len = segList.numberOfItems;
      // }
      // let lastX, lastY;
      for (let i = 0; i < len; ++i) {
        const seg = segList.getItem(i);
        const type = seg.pathSegType;
        if (type === 1) { continue; }
        const pts = [];
        $.each(['', 1, 2], function (j, n) {
          const x = seg['x' + n], y = seg['y' + n];
          if (x !== undefined && y !== undefined) {
            const pt = transformPoint(x, y, m);
            pts.splice(pts.length, 0, pt.x, pt.y);
          }
        });
        replacePathSeg(type, i, pts, pth);
      }

      reorientGrads(pth, m);
    },
    /**
    * @returns {undefined}
    */
    zoomChange () {
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
    getNodePoint () {
      const selPt = path.selected_pts.length ? path.selected_pts[0] : 1;

      const seg = path.segs[selPt];
      return {
        x: seg.item.x,
        y: seg.item.y,
        type: seg.type
      };
    },
    /**
    * @param {boolean} linkPoints
    * @returns {undefined}
    */
    linkControlPoints (linkPoints) {
      setLinkControlPoints(linkPoints);
    },
    /**
    * @returns {undefined}
    */
    clonePathNode () {
      path.storeD();

      const selPts = path.selected_pts;
      // const {segs} = path;

      let i = selPts.length;
      const nums = [];

      while (i--) {
        const pt = selPts[i];
        path.addSeg(pt);

        nums.push(pt + i);
        nums.push(pt + i + 1);
      }
      path.init().addPtsToSelection(nums);

      path.endChanges('Clone path node(s)');
    },
    /**
    * @returns {undefined}
    */
    opencloseSubPath () {
      const selPts = path.selected_pts;
      // Only allow one selected node for now
      if (selPts.length !== 1) { return; }

      const {elem} = path;
      const list = elem.pathSegList;

      // const len = list.numberOfItems;

      const index = selPts[0];

      let openPt = null;
      let startItem = null;

      // Check if subpath is already open
      path.eachSeg(function (i) {
        if (this.type === 2 && i <= index) {
          startItem = this.item;
        }
        if (i <= index) { return true; }
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
      });

      if (openPt == null) {
        // Single path, so close last seg
        openPt = path.segs.length - 1;
      }

      if (openPt !== false) {
        // Close this path

        // Create a line going to the previous "M"
        const newseg = elem.createSVGPathSegLinetoAbs(startItem.x, startItem.y);

        const closer = elem.createSVGPathSegClosePath();
        if (openPt === path.segs.length - 1) {
          list.appendItem(newseg);
          list.appendItem(closer);
        } else {
          insertItemBefore(elem, closer, openPt);
          insertItemBefore(elem, newseg, openPt);
        }

        path.init().selectPt(openPt + 1);
        return;
      }

      // M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
      // M 2,2 L 3,3 L 1,1

      // M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z
      // M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z

      const seg = path.segs[index];

      if (seg.mate) {
        list.removeItem(index); // Removes last "L"
        list.removeItem(index); // Removes the "Z"
        path.init().selectPt(index - 1);
        return;
      }

      let lastM, zSeg;

      // Find this sub-path's closing point and remove
      for (let i = 0; i < list.numberOfItems; i++) {
        const item = list.getItem(i);

        if (item.pathSegType === 2) {
          // Find the preceding M
          lastM = i;
        } else if (i === index) {
          // Remove it
          list.removeItem(lastM);
          // index--;
        } else if (item.pathSegType === 1 && index < i) {
          // Remove the closing seg of this subpath
          zSeg = i - 1;
          list.removeItem(i);
          break;
        }
      }

      let num = (index - lastM) - 1;

      while (num--) {
        insertItemBefore(elem, list.getItem(lastM), zSeg);
      }

      const pt = list.getItem(lastM);

      // Make this point the new "M"
      replacePathSeg(2, lastM, [pt.x, pt.y]);

      // i = index; // i is local here, so has no effect; what was the intent for this?

      path.init().selectPt(0);
    },
    /**
    * @returns {undefined}
    */
    deletePathNode () {
      if (!pathActions.canDeleteNodes) { return; }
      path.storeD();

      const selPts = path.selected_pts;

      let i = selPts.length;
      while (i--) {
        const pt = selPts[i];
        path.deleteSeg(pt);
      }

      // Cleanup
      const cleanup = function () {
        const segList = path.elem.pathSegList;
        let len = segList.numberOfItems;

        const remItems = function (pos, count) {
          while (count--) {
            segList.removeItem(pos);
          }
        };

        if (len <= 1) { return true; }

        while (len--) {
          const item = segList.getItem(len);
          if (item.pathSegType === 1) {
            const prev = segList.getItem(len - 1);
            const nprev = segList.getItem(len - 2);
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
              const prevType = segList.getItem(len - 1).pathSegType;
              // Path has M M
              if (prevType === 2) {
                remItems(len - 1, 1);
                cleanup();
                break;
              // Entire path ends with Z M
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

      cleanup();

      // Completely delete a path with 1 or 0 segments
      if (path.elem.pathSegList.numberOfItems <= 1) {
        pathActions.toSelectMode(path.elem);
        editorContext_.canvas.deleteSelectedElements();
        return;
      }

      path.init();
      path.clearSelection();

      // TODO: Find right way to select point now
      // path.selectPt(selPt);
      if (window.opera) { // Opera repaints incorrectly
        const cp = $(path.elem);
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
    smoothPolylineIntoPath,
    /**
    * @returns {undefined}
    */
    setSegType (v) {
      path.setSegType(v);
    },
    /**
    * @param {string} attr
    * @param {Float} newValue
    * @returns {undefined}
    */
    moveNode (attr, newValue) {
      const selPts = path.selected_pts;
      if (!selPts.length) { return; }

      path.storeD();

      // Get first selected point
      const seg = path.segs[selPts[0]];
      const diff = {x: 0, y: 0};
      diff[attr] = newValue - seg.item[attr];

      seg.move(diff.x, diff.y);
      path.endChanges('Move path point');
    },
    /**
    * @param {Element} elem
    * @returns {undefined}
    */
    fixEnd (elem) {
      // Adds an extra segment if the last seg before a Z doesn't end
      // at its M point
      // M0,0 L0,100 L100,100 z
      const segList = elem.pathSegList;
      const len = segList.numberOfItems;
      let lastM;
      for (let i = 0; i < len; ++i) {
        const item = segList.getItem(i);
        if (item.pathSegType === 2) {
          lastM = item;
        }

        if (item.pathSegType === 1) {
          const prev = segList.getItem(i - 1);
          if (prev.x !== lastM.x || prev.y !== lastM.y) {
            // Add an L segment here
            const newseg = elem.createSVGPathSegLinetoAbs(lastM.x, lastM.y);
            insertItemBefore(elem, newseg, i);
            // Can this be done better?
            pathActions.fixEnd(elem);
            break;
          }
        }
      }
      if (isWebkit()) { editorContext_.resetD(elem); }
    },
    // Can't seem to use `@borrows` here, so using `@see`
    /**
    * Convert a path to one with only absolute or relative values
    * @function module:path.pathActions.convertPath
    * @see module:path.convertPath
    */
    convertPath
  });
})();
// end pathActions
