/* globals jQuery */
/**
 * Package: svgedit.path
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2011 Alexis Deveria
 * Copyright(c) 2011 Jeff Schiller
 */

import './pathseg.js';
import * as pathModule from './path.js';
import {NS} from './svgedit.js';
import {getTransformList} from './svgtransformlist.js';
import {ChangeElementCommand} from './history.js';
import {transformPoint, getMatrix} from './math.js';
import {
  assignAttributes, getElem, getRotationAngle, getBBox
} from './svgutils.js';
import {
  supportsPathInsertItemBefore, supportsPathReplaceItem, isWebkit
} from './browser.js';

const $ = jQuery;

const segData = {
  2: ['x', 'y'],
  4: ['x', 'y'],
  6: ['x', 'y', 'x1', 'y1', 'x2', 'y2'],
  8: ['x', 'y', 'x1', 'y1'],
  10: ['x', 'y', 'r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag'],
  12: ['x'],
  14: ['y'],
  16: ['x', 'y', 'x2', 'y2'],
  18: ['x', 'y']
};

const uiStrings = {};
export const setUiStrings = function (strs) {
  Object.assign(uiStrings, strs.ui);
};

let pathFuncs = [];

let linkControlPts = true;

// Stores references to paths via IDs.
// TODO: Make this cross-document happy.
let pathData = {};

export const setLinkControlPoints = function (lcp) {
  linkControlPts = lcp;
};

export const path = null;

let editorContext_ = null;

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

// TODO: See if this should just live in replacePathSeg
export const ptObjToArr = function (type, segItem) {
  const arr = segData[type], len = arr.length;
  const out = [];
  for (let i = 0; i < len; i++) {
    out[i] = segItem[arr[i]];
  }
  return out;
};

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
      if (pathModule.path) {
        pathModule.path.setSegType();
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
  getGripContainer().appendChild(pointGrip);
  return pointGrip;
};

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
  getGripContainer().appendChild(ctrlLine);
  return ctrlLine;
};

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

export const getControlPoints = function (seg) {
  const {item, index} = seg;
  if (!('x1' in item) || !('x2' in item)) { return null; }
  const cpt = {};
  /* const pointGripContainer = */ getGripContainer();

  // Note that this is intentionally not seg.prev.item
  const prev = pathModule.path.segs[index - 1].item;

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

// This replaces the segment at the given index. Type is given as number.
export const replacePathSeg = function (type, index, pts, elem) {
  const path = elem || pathModule.path.elem;

  const func = 'createSVGPathSeg' + pathFuncs[type];
  const seg = path[func].apply(path, pts);

  if (supportsPathReplaceItem()) {
    path.pathSegList.replaceItem(seg, index);
  } else {
    const segList = path.pathSegList;
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
    pointGripContainer.appendChild(segLine);
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

    const pts = ptObjToArr(seg.type, seg.item, true);
    for (let i = 0; i < pts.length; i += 2) {
      const pt = getGripPt(seg, {x: pts[i], y: pts[i + 1]});
      pts[i] = pt.x;
      pts[i + 1] = pt.y;
    }

    replacePathSeg(seg.type, 1, pts, segLine);
  }
  return segLine;
};

// Function: smoothControlPoints
// Takes three points and creates a smoother line based on them
//
// Parameters:
// ct1 - Object with x and y values (first control point)
// ct2 - Object with x and y values (second control point)
// pt - Object with x and y values (third point)
//
// Returns:
// Array of two "smoothed" point objects
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

export class Segment {
  constructor (index, item) {
    this.selected = false;
    this.index = index;
    this.item = item;
    this.type = item.pathSegType;

    this.ctrlpts = [];
    this.ptgrip = null;
    this.segsel = null;
  }

  showCtrlPts (y) {
    for (const i in this.ctrlpts) {
      if (this.ctrlpts.hasOwnProperty(i)) {
        this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none');
      }
    }
  }

  selectCtrls (y) {
    $('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2')
      .attr('fill', y ? '#0FF' : '#EEE');
  }

  show (y) {
    if (this.ptgrip) {
      this.ptgrip.setAttribute('display', y ? 'inline' : 'none');
      this.segsel.setAttribute('display', y ? 'inline' : 'none');
      // Show/hide all control points if available
      this.showCtrlPts(y);
    }
  }

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

  addGrip () {
    this.ptgrip = getPointGrip(this, true);
    this.ctrlpts = getControlPoints(this, true);
    this.segsel = getSegSelector(this, true);
  }

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
          this.item = pathModule.path.elem.pathSegList.getItem(this.index);
          this.type = this.item.pathSegType;
        }
        getControlPoints(this);
      }
      // this.segsel.setAttribute('display', y?'inline':'none');
    }
  }

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

  moveCtrl (num, dx, dy) {
    const {item} = this;
    item['x' + num] += dx;
    item['y' + num] += dy;

    const pts = [item.x, item.y,
      item.x1, item.y1, item.x2, item.y2];

    replacePathSeg(this.type, this.index, pts);
    this.update(true);
  }

  setType (newType, pts) {
    replacePathSeg(newType, this.index, pts);
    this.type = newType;
    this.item = pathModule.path.elem.pathSegList.getItem(this.index);
    this.showCtrlPts(newType === 6);
    this.ctrlpts = getControlPoints(this);
    this.update(true);
  }
}

export class Path {
  constructor (elem) {
    if (!elem || elem.tagName !== 'path') {
      throw new Error('svgedit.path.Path constructed without a <path> element');
    }

    this.elem = elem;
    this.segs = [];
    this.selected_pts = [];
    pathModule.path = this;

    this.init();
  }

  // Reset path data
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

  eachSeg (fn) {
    const len = this.segs.length;
    for (let i = 0; i < len; i++) {
      const ret = fn.call(this.segs[i], i);
      if (ret === false) { break; }
    }
  }

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

  subpathIsClosed (index) {
    let closed = false;
    // Check if subpath is already open
    pathModule.path.eachSeg(function (i) {
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

  removePtFromSelection (index) {
    const pos = this.selected_pts.indexOf(index);
    if (pos === -1) {
      return;
    }
    this.segs[index].select(false);
    this.selected_pts.splice(pos, 1);
  }

  clearSelection () {
    this.eachSeg(function () {
      // 'this' is the segment here
      this.select(false);
    });
    this.selected_pts = [];
  }

  storeD () {
    this.last_d = this.elem.getAttribute('d');
  }

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

  // Move selected points
  movePts (dx, dy) {
    let i = this.selected_pts.length;
    while (i--) {
      const seg = this.segs[this.selected_pts[i]];
      seg.move(dx, dy);
    }
  }

  moveCtrl (dx, dy) {
    const seg = this.segs[this.selected_pts[0]];
    seg.moveCtrl(this.dragctrl, dx, dy);
    if (linkControlPts) {
      seg.setLinked(this.dragctrl);
    }
  }

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
    pathModule.path.endChanges(text);
  }

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

  // Update position of all points
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

  endChanges (text) {
    if (isWebkit()) { editorContext_.resetD(this.elem); }
    const cmd = new ChangeElementCommand(this.elem, {d: this.last_d}, text);
    editorContext_.endChanges({cmd, elem: this.elem});
  }

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

export const getPath_ = function (elem) {
  let p = pathData[elem.id];
  if (!p) {
    p = pathData[elem.id] = new Path(elem);
  }
  return p;
};

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

// TODO: This is still using ye olde transform methods, can probably
// be optimized or even taken care of by `recalculateDimensions`
export const recalcRotatedPath = function () {
  const currentPath = pathModule.path.elem;
  angle = getRotationAngle(currentPath, true);
  if (!angle) { return; }
  // selectedBBoxes[0] = pathModule.path.oldbbox;
  const oldbox = pathModule.path.oldbbox; // selectedBBoxes[0],
  oldcx = oldbox.x + oldbox.width / 2;
  oldcy = oldbox.y + oldbox.height / 2;
  let box = getBBox(currentPath);
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

  box = getBBox(currentPath);
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

export const clearData = function () {
  pathData = {};
};
