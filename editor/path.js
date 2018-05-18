/* eslint-disable no-var */
/* globals $, svgedit, svgroot */
/**
 * Package: svgedit.path
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2011 Alexis Deveria
 * Copyright(c) 2011 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) math.js
// 4) svgutils.js

(function () {
'use strict';

if (!svgedit.path) {
  svgedit.path = {};
}

var NS = svgedit.NS;
var uiStrings = {
  'pathNodeTooltip': 'Drag node to move it. Double-click node to change segment type',
  'pathCtrlPtTooltip': 'Drag control point to adjust curve properties'
};

var segData = {
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

var pathFuncs = [];

var linkControlPts = true;

// Stores references to paths via IDs.
// TODO: Make this cross-document happy.
var pathData = {};

svgedit.path.setLinkControlPoints = function (lcp) {
  linkControlPts = lcp;
};

svgedit.path.path = null;

var editorContext_ = null;

svgedit.path.init = function (editorContext) {
  editorContext_ = editorContext;

  pathFuncs = [0, 'ClosePath'];
  var pathFuncsStrs = ['Moveto', 'Lineto', 'CurvetoCubic', 'CurvetoQuadratic', 'Arc',
    'LinetoHorizontal', 'LinetoVertical', 'CurvetoCubicSmooth', 'CurvetoQuadraticSmooth'];
  $.each(pathFuncsStrs, function (i, s) {
    pathFuncs.push(s + 'Abs');
    pathFuncs.push(s + 'Rel');
  });
};

svgedit.path.insertItemBefore = function (elem, newseg, index) {
  // Support insertItemBefore on paths for FF2
  var list = elem.pathSegList;

  if (svgedit.browser.supportsPathInsertItemBefore()) {
    list.insertItemBefore(newseg, index);
    return;
  }
  var len = list.numberOfItems;
  var arr = [];
  var i;
  for (i = 0; i < len; i++) {
    var curSeg = list.getItem(i);
    arr.push(curSeg);
  }
  list.clear();
  for (i = 0; i < len; i++) {
    if (i === index) { // index + 1
      list.appendItem(newseg);
    }
    list.appendItem(arr[i]);
  }
};

// TODO: See if this should just live in replacePathSeg
svgedit.path.ptObjToArr = function (type, segItem) {
  var arr = segData[type], len = arr.length;
  var i, out = [];
  for (i = 0; i < len; i++) {
    out[i] = segItem[arr[i]];
  }
  return out;
};

svgedit.path.getGripPt = function (seg, altPt) {
  var out = {
      x: altPt ? altPt.x : seg.item.x,
      y: altPt ? altPt.y : seg.item.y
    }, path = seg.path;

  if (path.matrix) {
    var pt = svgedit.math.transformPoint(out.x, out.y, path.matrix);
    out = pt;
  }

  out.x *= editorContext_.getCurrentZoom();
  out.y *= editorContext_.getCurrentZoom();

  return out;
};

svgedit.path.getPointFromGrip = function (pt, path) {
  var out = {
    x: pt.x,
    y: pt.y
  };

  if (path.matrix) {
    pt = svgedit.math.transformPoint(out.x, out.y, path.imatrix);
    out.x = pt.x;
    out.y = pt.y;
  }

  out.x /= editorContext_.getCurrentZoom();
  out.y /= editorContext_.getCurrentZoom();

  return out;
};

svgedit.path.addPointGrip = function (index, x, y) {
  // create the container of all the point grips
  var pointGripContainer = svgedit.path.getGripContainer();

  var pointGrip = svgedit.utilities.getElem('pathpointgrip_' + index);
  // create it
  if (!pointGrip) {
    pointGrip = document.createElementNS(NS.SVG, 'circle');
    svgedit.utilities.assignAttributes(pointGrip, {
      'id': 'pathpointgrip_' + index,
      'display': 'none',
      'r': 4,
      'fill': '#0FF',
      'stroke': '#00F',
      'stroke-width': 2,
      'cursor': 'move',
      'style': 'pointer-events:all',
      'xlink:title': uiStrings.pathNodeTooltip
    });
    pointGrip = pointGripContainer.appendChild(pointGrip);

    var grip = $('#pathpointgrip_' + index);
    grip.dblclick(function () {
      if (svgedit.path.path) {
        svgedit.path.path.setSegType();
      }
    });
  }
  if (x && y) {
    // set up the point grip element and display it
    svgedit.utilities.assignAttributes(pointGrip, {
      'cx': x,
      'cy': y,
      'display': 'inline'
    });
  }
  return pointGrip;
};

svgedit.path.getGripContainer = function () {
  var c = svgedit.utilities.getElem('pathpointgrip_container');
  if (!c) {
    var parent = svgedit.utilities.getElem('selectorParentGroup');
    c = parent.appendChild(document.createElementNS(NS.SVG, 'g'));
    c.id = 'pathpointgrip_container';
  }
  return c;
};

svgedit.path.addCtrlGrip = function (id) {
  var pointGrip = svgedit.utilities.getElem('ctrlpointgrip_' + id);
  if (pointGrip) { return pointGrip; }

  pointGrip = document.createElementNS(NS.SVG, 'circle');
  svgedit.utilities.assignAttributes(pointGrip, {
    'id': 'ctrlpointgrip_' + id,
    'display': 'none',
    'r': 4,
    'fill': '#0FF',
    'stroke': '#55F',
    'stroke-width': 1,
    'cursor': 'move',
    'style': 'pointer-events:all',
    'xlink:title': uiStrings.pathCtrlPtTooltip
  });
  svgedit.path.getGripContainer().appendChild(pointGrip);
  return pointGrip;
};

svgedit.path.getCtrlLine = function (id) {
  var ctrlLine = svgedit.utilities.getElem('ctrlLine_' + id);
  if (ctrlLine) { return ctrlLine; }

  ctrlLine = document.createElementNS(NS.SVG, 'line');
  svgedit.utilities.assignAttributes(ctrlLine, {
    'id': 'ctrlLine_' + id,
    'stroke': '#555',
    'stroke-width': 1,
    'style': 'pointer-events:none'
  });
  svgedit.path.getGripContainer().appendChild(ctrlLine);
  return ctrlLine;
};

svgedit.path.getPointGrip = function (seg, update) {
  var index = seg.index;
  var pointGrip = svgedit.path.addPointGrip(index);

  if (update) {
    var pt = svgedit.path.getGripPt(seg);
    svgedit.utilities.assignAttributes(pointGrip, {
      'cx': pt.x,
      'cy': pt.y,
      'display': 'inline'
    });
  }

  return pointGrip;
};

svgedit.path.getControlPoints = function (seg) {
  var item = seg.item;
  var index = seg.index;
  if (!('x1' in item) || !('x2' in item)) { return null; }
  var cpt = {};
  /* var pointGripContainer = */ svgedit.path.getGripContainer();

  // Note that this is intentionally not seg.prev.item
  var prev = svgedit.path.path.segs[index - 1].item;

  var segItems = [prev, item];

  var i;
  for (i = 1; i < 3; i++) {
    var id = index + 'c' + i;

    var ctrlLine = cpt['c' + i + '_line'] = svgedit.path.getCtrlLine(id);

    var pt = svgedit.path.getGripPt(seg, {x: item['x' + i], y: item['y' + i]});
    var gpt = svgedit.path.getGripPt(seg, {x: segItems[i - 1].x, y: segItems[i - 1].y});

    svgedit.utilities.assignAttributes(ctrlLine, {
      'x1': pt.x,
      'y1': pt.y,
      'x2': gpt.x,
      'y2': gpt.y,
      'display': 'inline'
    });

    cpt['c' + i + '_line'] = ctrlLine;

    // create it
    var pointGrip = cpt['c' + i] = svgedit.path.addCtrlGrip(id);

    svgedit.utilities.assignAttributes(pointGrip, {
      'cx': pt.x,
      'cy': pt.y,
      'display': 'inline'
    });
    cpt['c' + i] = pointGrip;
  }
  return cpt;
};

// This replaces the segment at the given index. Type is given as number.
svgedit.path.replacePathSeg = function (type, index, pts, elem) {
  var path = elem || svgedit.path.path.elem;

  var func = 'createSVGPathSeg' + pathFuncs[type];
  var seg = path[func].apply(path, pts);

  if (svgedit.browser.supportsPathReplaceItem()) {
    path.pathSegList.replaceItem(seg, index);
  } else {
    var segList = path.pathSegList;
    var len = segList.numberOfItems;
    var arr = [];
    var i;
    for (i = 0; i < len; i++) {
      var curSeg = segList.getItem(i);
      arr.push(curSeg);
    }
    segList.clear();
    for (i = 0; i < len; i++) {
      if (i === index) {
        segList.appendItem(seg);
      } else {
        segList.appendItem(arr[i]);
      }
    }
  }
};

svgedit.path.getSegSelector = function (seg, update) {
  var index = seg.index;
  var segLine = svgedit.utilities.getElem('segline_' + index);
  if (!segLine) {
    var pointGripContainer = svgedit.path.getGripContainer();
    // create segline
    segLine = document.createElementNS(NS.SVG, 'path');
    svgedit.utilities.assignAttributes(segLine, {
      'id': 'segline_' + index,
      'display': 'none',
      'fill': 'none',
      'stroke': '#0FF',
      'stroke-width': 2,
      'style': 'pointer-events:none',
      'd': 'M0,0 0,0'
    });
    pointGripContainer.appendChild(segLine);
  }

  if (update) {
    var prev = seg.prev;
    if (!prev) {
      segLine.setAttribute('display', 'none');
      return segLine;
    }

    var pt = svgedit.path.getGripPt(prev);
    // Set start point
    svgedit.path.replacePathSeg(2, 0, [pt.x, pt.y], segLine);

    var pts = svgedit.path.ptObjToArr(seg.type, seg.item, true);
    var i;
    for (i = 0; i < pts.length; i += 2) {
      pt = svgedit.path.getGripPt(seg, {x: pts[i], y: pts[i + 1]});
      pts[i] = pt.x;
      pts[i + 1] = pt.y;
    }

    svgedit.path.replacePathSeg(seg.type, 1, pts, segLine);
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
svgedit.path.smoothControlPoints = function (ct1, ct2, pt) {
  // each point must not be the origin
  var x1 = ct1.x - pt.x,
    y1 = ct1.y - pt.y,
    x2 = ct2.x - pt.x,
    y2 = ct2.y - pt.y;

  if ((x1 !== 0 || y1 !== 0) && (x2 !== 0 || y2 !== 0)) {
    var anglea = Math.atan2(y1, x1),
      angleb = Math.atan2(y2, x2),
      r1 = Math.sqrt(x1 * x1 + y1 * y1),
      r2 = Math.sqrt(x2 * x2 + y2 * y2),
      nct1 = editorContext_.getSVGRoot().createSVGPoint(),
      nct2 = editorContext_.getSVGRoot().createSVGPoint();
    if (anglea < 0) { anglea += 2 * Math.PI; }
    if (angleb < 0) { angleb += 2 * Math.PI; }

    var angleBetween = Math.abs(anglea - angleb),
      angleDiff = Math.abs(Math.PI - angleBetween) / 2;

    var newAnglea, newAngleb;
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

svgedit.path.Segment = function (index, item) {
  this.selected = false;
  this.index = index;
  this.item = item;
  this.type = item.pathSegType;

  this.ctrlpts = [];
  this.ptgrip = null;
  this.segsel = null;
};

svgedit.path.Segment.prototype.showCtrlPts = function (y) {
  var i;
  for (i in this.ctrlpts) {
    if (this.ctrlpts.hasOwnProperty(i)) {
      this.ctrlpts[i].setAttribute('display', y ? 'inline' : 'none');
    }
  }
};

svgedit.path.Segment.prototype.selectCtrls = function (y) {
  $('#ctrlpointgrip_' + this.index + 'c1, #ctrlpointgrip_' + this.index + 'c2')
    .attr('fill', y ? '#0FF' : '#EEE');
};

svgedit.path.Segment.prototype.show = function (y) {
  if (this.ptgrip) {
    this.ptgrip.setAttribute('display', y ? 'inline' : 'none');
    this.segsel.setAttribute('display', y ? 'inline' : 'none');
    // Show/hide all control points if available
    this.showCtrlPts(y);
  }
};

svgedit.path.Segment.prototype.select = function (y) {
  if (this.ptgrip) {
    this.ptgrip.setAttribute('stroke', y ? '#0FF' : '#00F');
    this.segsel.setAttribute('display', y ? 'inline' : 'none');
    if (this.ctrlpts) {
      this.selectCtrls(y);
    }
    this.selected = y;
  }
};

svgedit.path.Segment.prototype.addGrip = function () {
  this.ptgrip = svgedit.path.getPointGrip(this, true);
  this.ctrlpts = svgedit.path.getControlPoints(this, true);
  this.segsel = svgedit.path.getSegSelector(this, true);
};

svgedit.path.Segment.prototype.update = function (full) {
  if (this.ptgrip) {
    var pt = svgedit.path.getGripPt(this);
    svgedit.utilities.assignAttributes(this.ptgrip, {
      'cx': pt.x,
      'cy': pt.y
    });

    svgedit.path.getSegSelector(this, true);

    if (this.ctrlpts) {
      if (full) {
        this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
        this.type = this.item.pathSegType;
      }
      svgedit.path.getControlPoints(this);
    }
    // this.segsel.setAttribute('display', y?'inline':'none');
  }
};

svgedit.path.Segment.prototype.move = function (dx, dy) {
  var curPts, item = this.item;

  if (this.ctrlpts) {
    curPts = [item.x += dx, item.y += dy,
      item.x1, item.y1, item.x2 += dx, item.y2 += dy];
  } else {
    curPts = [item.x += dx, item.y += dy];
  }

  svgedit.path.replacePathSeg(this.type, this.index, curPts);

  if (this.next && this.next.ctrlpts) {
    var next = this.next.item;
    var nextPts = [next.x, next.y,
      next.x1 += dx, next.y1 += dy, next.x2, next.y2];
    svgedit.path.replacePathSeg(this.next.type, this.next.index, nextPts);
  }

  if (this.mate) {
    // The last point of a closed subpath has a 'mate',
    // which is the 'M' segment of the subpath
    item = this.mate.item;
    var pts = [item.x += dx, item.y += dy];
    svgedit.path.replacePathSeg(this.mate.type, this.mate.index, pts);
    // Has no grip, so does not need 'updating'?
  }

  this.update(true);
  if (this.next) { this.next.update(true); }
};

svgedit.path.Segment.prototype.setLinked = function (num) {
  var seg, anum, pt;
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

  var item = seg.item;
  item['x' + anum] = pt.x + (pt.x - this.item['x' + num]);
  item['y' + anum] = pt.y + (pt.y - this.item['y' + num]);

  var pts = [item.x, item.y,
    item.x1, item.y1,
    item.x2, item.y2];

  svgedit.path.replacePathSeg(seg.type, seg.index, pts);
  seg.update(true);
};

svgedit.path.Segment.prototype.moveCtrl = function (num, dx, dy) {
  var item = this.item;
  item['x' + num] += dx;
  item['y' + num] += dy;

  var pts = [item.x, item.y,
    item.x1, item.y1, item.x2, item.y2];

  svgedit.path.replacePathSeg(this.type, this.index, pts);
  this.update(true);
};

svgedit.path.Segment.prototype.setType = function (newType, pts) {
  svgedit.path.replacePathSeg(newType, this.index, pts);
  this.type = newType;
  this.item = svgedit.path.path.elem.pathSegList.getItem(this.index);
  this.showCtrlPts(newType === 6);
  this.ctrlpts = svgedit.path.getControlPoints(this);
  this.update(true);
};

svgedit.path.Path = function (elem) {
  if (!elem || elem.tagName !== 'path') {
    throw new Error('svgedit.path.Path constructed without a <path> element');
  }

  this.elem = elem;
  this.segs = [];
  this.selected_pts = [];
  svgedit.path.path = this;

  this.init();
};

// Reset path data
svgedit.path.Path.prototype.init = function () {
  // Hide all grips, etc

  // fixed, needed to work on all found elements, not just first
  $(svgedit.path.getGripContainer()).find('*').each(function () {
    $(this).attr('display', 'none');
  });

  var segList = this.elem.pathSegList;
  var len = segList.numberOfItems;
  this.segs = [];
  this.selected_pts = [];
  this.first_seg = null;

  // Set up segs array
  var i;
  for (i = 0; i < len; i++) {
    var item = segList.getItem(i);
    var segment = new svgedit.path.Segment(i, item);
    segment.path = this;
    this.segs.push(segment);
  }

  var segs = this.segs;
  var startI = null;

  for (i = 0; i < len; i++) {
    var seg = segs[i];
    var nextSeg = (i + 1) >= len ? null : segs[i + 1];
    var prevSeg = (i - 1) < 0 ? null : segs[i - 1];
    var startSeg;
    if (seg.type === 2) {
      if (prevSeg && prevSeg.type !== 1) {
        // New sub-path, last one is open,
        // so add a grip to last sub-path's first point
        startSeg = segs[startI];
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
        startSeg = segs[startI];
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
};

svgedit.path.Path.prototype.eachSeg = function (fn) {
  var i;
  var len = this.segs.length;
  for (i = 0; i < len; i++) {
    var ret = fn.call(this.segs[i], i);
    if (ret === false) { break; }
  }
};

svgedit.path.Path.prototype.addSeg = function (index) {
  // Adds a new segment
  var seg = this.segs[index];
  if (!seg.prev) { return; }

  var prev = seg.prev;
  var newseg, newX, newY;
  switch (seg.item.pathSegType) {
  case 4:
    newX = (seg.item.x + prev.item.x) / 2;
    newY = (seg.item.y + prev.item.y) / 2;
    newseg = this.elem.createSVGPathSegLinetoAbs(newX, newY);
    break;
  case 6: // make it a curved segment to preserve the shape (WRS)
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
    svgedit.path.replacePathSeg(seg.type, index, pts);
    break;
  }

  svgedit.path.insertItemBefore(this.elem, newseg, index);
};

svgedit.path.Path.prototype.deleteSeg = function (index) {
  var seg = this.segs[index];
  var list = this.elem.pathSegList;

  seg.show(false);
  var next = seg.next;
  var pt;
  if (seg.mate) {
    // Make the next point be the "M" point
    pt = [next.item.x, next.item.y];
    svgedit.path.replacePathSeg(2, next.index, pt);

    // Reposition last node
    svgedit.path.replacePathSeg(4, seg.index, pt);

    list.removeItem(seg.mate.index);
  } else if (!seg.prev) {
    // First node of open path, make next point the M
    // var item = seg.item;
    pt = [next.item.x, next.item.y];
    svgedit.path.replacePathSeg(2, seg.next.index, pt);
    list.removeItem(index);
  } else {
    list.removeItem(index);
  }
};

svgedit.path.Path.prototype.subpathIsClosed = function (index) {
  var closed = false;
  // Check if subpath is already open
  svgedit.path.path.eachSeg(function (i) {
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
};

svgedit.path.Path.prototype.removePtFromSelection = function (index) {
  var pos = this.selected_pts.indexOf(index);
  if (pos === -1) {
    return;
  }
  this.segs[index].select(false);
  this.selected_pts.splice(pos, 1);
};

svgedit.path.Path.prototype.clearSelection = function () {
  this.eachSeg(function () {
    // 'this' is the segment here
    this.select(false);
  });
  this.selected_pts = [];
};

svgedit.path.Path.prototype.storeD = function () {
  this.last_d = this.elem.getAttribute('d');
};

svgedit.path.Path.prototype.show = function (y) {
  // Shows this path's segment grips
  this.eachSeg(function () {
    // 'this' is the segment here
    this.show(y);
  });
  if (y) {
    this.selectPt(this.first_seg.index);
  }
  return this;
};

// Move selected points
svgedit.path.Path.prototype.movePts = function (dx, dy) {
  var i = this.selected_pts.length;
  while (i--) {
    var seg = this.segs[this.selected_pts[i]];
    seg.move(dx, dy);
  }
};

svgedit.path.Path.prototype.moveCtrl = function (dx, dy) {
  var seg = this.segs[this.selected_pts[0]];
  seg.moveCtrl(this.dragctrl, dx, dy);
  if (linkControlPts) {
    seg.setLinked(this.dragctrl);
  }
};

svgedit.path.Path.prototype.setSegType = function (newType) {
  this.storeD();
  var i = this.selected_pts.length;
  var text;
  while (i--) {
    var selPt = this.selected_pts[i];

    // Selected seg
    var cur = this.segs[selPt];
    var prev = cur.prev;
    if (!prev) { continue; }

    if (!newType) { // double-click, so just toggle
      text = 'Toggle Path Segment Type';

      // Toggle segment to curve/straight line
      var oldType = cur.type;

      newType = (oldType === 6) ? 4 : 6;
    }

    newType = Number(newType);

    var curX = cur.item.x;
    var curY = cur.item.y;
    var prevX = prev.item.x;
    var prevY = prev.item.y;
    var points;
    switch (newType) {
    case 6:
      if (cur.olditem) {
        var old = cur.olditem;
        points = [curX, curY, old.x1, old.y1, old.x2, old.y2];
      } else {
        var diffX = curX - prevX;
        var diffY = curY - prevY;
        // get control points from straight line segment
        /*
        var ct1x = (prevX + (diffY/2));
        var ct1y = (prevY - (diffX/2));
        var ct2x = (curX + (diffY/2));
        var ct2y = (curY - (diffX/2));
        */
        // create control points on the line to preserve the shape (WRS)
        var ct1x = (prevX + (diffX / 3));
        var ct1y = (prevY + (diffY / 3));
        var ct2x = (curX - (diffX / 3));
        var ct2y = (curY - (diffY / 3));
        points = [curX, curY, ct1x, ct1y, ct2x, ct2y];
      }
      break;
    case 4:
      points = [curX, curY];

      // Store original prevve segment nums
      cur.olditem = cur.item;
      break;
    }

    cur.setType(newType, points);
  }
  svgedit.path.path.endChanges(text);
};

svgedit.path.Path.prototype.selectPt = function (pt, ctrlNum) {
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
};

// Update position of all points
svgedit.path.Path.prototype.update = function () {
  var elem = this.elem;
  if (svgedit.utilities.getRotationAngle(elem)) {
    this.matrix = svgedit.math.getMatrix(elem);
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
};

svgedit.path.getPath_ = function (elem) {
  var p = pathData[elem.id];
  if (!p) {
    p = pathData[elem.id] = new svgedit.path.Path(elem);
  }
  return p;
};

svgedit.path.removePath_ = function (id) {
  if (id in pathData) { delete pathData[id]; }
};
var newcx, newcy, oldcx, oldcy, angle;
var getRotVals = function (x, y) {
  var dx = x - oldcx;
  var dy = y - oldcy;

  // rotate the point around the old center
  var r = Math.sqrt(dx * dx + dy * dy);
  var theta = Math.atan2(dy, dx) + angle;
  dx = r * Math.cos(theta) + oldcx;
  dy = r * Math.sin(theta) + oldcy;

  // dx,dy should now hold the actual coordinates of each
  // point after being rotated

  // now we want to rotate them around the new center in the reverse direction
  dx -= newcx;
  dy -= newcy;

  r = Math.sqrt(dx * dx + dy * dy);
  theta = Math.atan2(dy, dx) - angle;

  return {'x': r * Math.cos(theta) + newcx,
    'y': r * Math.sin(theta) + newcy};
};

// If the path was rotated, we must now pay the piper:
// Every path point must be rotated into the rotated coordinate system of
// its old center, then determine the new center, then rotate it back
// This is because we want the path to remember its rotation

// TODO: This is still using ye olde transform methods, can probably
// be optimized or even taken care of by recalculateDimensions
svgedit.path.recalcRotatedPath = function () {
  var currentPath = svgedit.path.path.elem;
  angle = svgedit.utilities.getRotationAngle(currentPath, true);
  if (!angle) { return; }
  // selectedBBoxes[0] = svgedit.path.path.oldbbox;
  var box = svgedit.utilities.getBBox(currentPath),
    oldbox = svgedit.path.path.oldbbox; // selectedBBoxes[0],
  oldcx = oldbox.x + oldbox.width / 2;
  oldcy = oldbox.y + oldbox.height / 2;
  newcx = box.x + box.width / 2;
  newcy = box.y + box.height / 2;

  // un-rotate the new center to the proper position
  var dx = newcx - oldcx,
    dy = newcy - oldcy,
    r = Math.sqrt(dx * dx + dy * dy),
    theta = Math.atan2(dy, dx) + angle;

  newcx = r * Math.cos(theta) + oldcx;
  newcy = r * Math.sin(theta) + oldcy;

  var list = currentPath.pathSegList,
    i = list.numberOfItems;
  while (i) {
    i -= 1;
    var seg = list.getItem(i),
      type = seg.pathSegType;
    if (type === 1) { continue; }

    var rvals = getRotVals(seg.x, seg.y),
      points = [rvals.x, rvals.y];
    if (seg.x1 != null && seg.x2 != null) {
      var cVals1 = getRotVals(seg.x1, seg.y1);
      var cVals2 = getRotVals(seg.x2, seg.y2);
      points.splice(points.length, 0, cVals1.x, cVals1.y, cVals2.x, cVals2.y);
    }
    svgedit.path.replacePathSeg(type, i, points);
  } // loop for each point

  box = svgedit.utilities.getBBox(currentPath);
  // selectedBBoxes[0].x = box.x; selectedBBoxes[0].y = box.y;
  // selectedBBoxes[0].width = box.width; selectedBBoxes[0].height = box.height;

  // now we must set the new transform to be rotated around the new center
  var Rnc = svgroot.createSVGTransform(),
    tlist = svgedit.transformlist.getTransformList(currentPath);
  Rnc.setRotate((angle * 180.0 / Math.PI), newcx, newcy);
  tlist.replaceItem(Rnc, 0);
};

// ====================================
// Public API starts here

svgedit.path.clearData = function () {
  pathData = {};
};
}());
