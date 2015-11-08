/*globals $, svgroot */
/*jslint vars: true, eqeq: true, forin: true*/
/**
 * Coords.
 *
 * Licensed under the MIT License
 *
 */

// Dependencies:
// 1) jquery.js
// 2) math.js
// 3) pathseg.js
// 4) browser.js
// 5) svgutils.js
// 6) units.js
// 7) svgtransformlist.js

var svgedit = svgedit || {};

(function() {'use strict';

if (!svgedit.coords) {
  svgedit.coords = {};
}

// this is how we map paths to our preferred relative segment types
var pathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a', 
    'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];

/**
 * @typedef editorContext
 * @type {?object}
 * @property {function} getGridSnapping
 * @property {function} getDrawing
*/
var editorContext_ = null;

/**
* @param {editorContext} editorContext
*/
svgedit.coords.init = function(editorContext) {
  editorContext_ = editorContext;
};

/**
 * Applies coordinate changes to an element based on the given matrix
 * @param {Element} selected - DOM element to be changed
 * @param {object} changes - Object with changes to be remapped
 * @param {SVGMatrix} m - Matrix object to use for remapping coordinates
*/
svgedit.coords.remapElement = function(selected, changes, m) {
  var i, type,
    remap = function(x, y) { return svgedit.math.transformPoint(x, y, m); },
    scalew = function(w) { return m.a * w; },
    scaleh = function(h) { return m.d * h; },
    doSnapping = editorContext_.getGridSnapping() && selected.parentNode.parentNode.localName === 'svg',
    finishUp = function() {
      var o;
      if (doSnapping) {
        for (o in changes) {
          changes[o] = svgedit.utilities.snapToGrid(changes[o]);
        }
      }
      svgedit.utilities.assignAttributes(selected, changes, 1000, true);
    },
    box = svgedit.utilities.getBBox(selected);

  for (i = 0; i < 2; i++) {
    type = i === 0 ? 'fill' : 'stroke';
    var attrVal = selected.getAttribute(type);
    if (attrVal && attrVal.indexOf('url(') === 0) {
      if (m.a < 0 || m.d < 0) {
        var grad = svgedit.utilities.getRefElem(attrVal);
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
        newgrad.id = editorContext_.getDrawing().getNextId();
        svgedit.utilities.findDefs().appendChild(newgrad);
        selected.setAttribute(type, 'url(#' + newgrad.id + ')');
      }

      // Not really working :(
//      if (selected.tagName === 'path') {
//        reorientGrads(selected, m);
//      }
    }
  }

  var elName = selected.tagName;
  var chlist, mt;
  if (elName === 'g' || elName === 'text' || elName == 'tspan' || elName === 'use') {
    // if it was a translate, then just update x,y
    if (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1 && (m.e != 0 || m.f != 0) ) {
      // [T][M] = [M][T']
      // therefore [T'] = [M_inv][T][M]
      var existing = svgedit.math.transformListToTransform(selected).matrix,
          t_new = svgedit.math.matrixMultiply(existing.inverse(), m, existing);
      changes.x = parseFloat(changes.x) + t_new.e;
      changes.y = parseFloat(changes.y) + t_new.f;
    } else {
      // we just absorb all matrices into the element and don't do any remapping
      chlist = svgedit.transformlist.getTransformList(selected);
      mt = svgroot.createSVGTransform();
      mt.setMatrix(svgedit.math.matrixMultiply(svgedit.math.transformListToTransform(chlist).matrix, m));
      chlist.clear();
      chlist.appendItem(mt);
    }
  }
  var c, pt, pt1, pt2, len;
  // now we have a set of changes and an applied reduced transform list
  // we apply the changes directly to the DOM
  switch (elName) {
    case 'foreignObject':
    case 'rect':
    case 'image':
      // Allow images to be inverted (give them matrix when flipped)
      if (elName === 'image' && (m.a < 0 || m.d < 0)) {
        // Convert to matrix
        chlist = svgedit.transformlist.getTransformList(selected);
        mt = svgroot.createSVGTransform();
        mt.setMatrix(svgedit.math.matrixMultiply(svgedit.math.transformListToTransform(chlist).matrix, m));
        chlist.clear();
        chlist.appendItem(mt);
      } else {
        pt1 = remap(changes.x, changes.y);
        changes.width = scalew(changes.width);
        changes.height = scaleh(changes.height);
        changes.x = pt1.x + Math.min(0, changes.width);
        changes.y = pt1.y + Math.min(0, changes.height);
        changes.width = Math.abs(changes.width);
        changes.height = Math.abs(changes.height);
      }
      finishUp();
      break;
    case 'ellipse':
      c = remap(changes.cx, changes.cy);
      changes.cx = c.x;
      changes.cy = c.y;
      changes.rx = scalew(changes.rx);
      changes.ry = scaleh(changes.ry);
      changes.rx = Math.abs(changes.rx);
      changes.ry = Math.abs(changes.ry);
      finishUp();
      break;
    case 'circle':
      c = remap(changes.cx,changes.cy);
      changes.cx = c.x;
      changes.cy = c.y;
      // take the minimum of the new selected box's dimensions for the new circle radius
      var tbox = svgedit.math.transformBox(box.x, box.y, box.width, box.height, m);
      var w = tbox.tr.x - tbox.tl.x, h = tbox.bl.y - tbox.tl.y;
      changes.r = Math.min(w/2, h/2);

      if (changes.r) {changes.r = Math.abs(changes.r);}
      finishUp();
      break;
    case 'line':
      pt1 = remap(changes.x1, changes.y1);
      pt2 = remap(changes.x2, changes.y2);
      changes.x1 = pt1.x;
      changes.y1 = pt1.y;
      changes.x2 = pt2.x;
      changes.y2 = pt2.y;
      // deliberately fall through here
    case 'text':
    case 'tspan':
    case 'use':
      finishUp();
      break;
    case 'g':
      var gsvg = $(selected).data('gsvg');
      if (gsvg) {
          svgedit.utilities.assignAttributes(gsvg, changes, 1000, true);
      }
      break;
    case 'polyline':
    case 'polygon':
      len = changes.points.length;
      for (i = 0; i < len; ++i) {
        pt = changes.points[i];
        pt = remap(pt.x, pt.y);
        changes.points[i].x = pt.x;
        changes.points[i].y = pt.y;
      }

      len = changes.points.length;
      var pstr = '';
      for (i = 0; i < len; ++i) {
        pt = changes.points[i];
        pstr += pt.x + ',' + pt.y + ' ';
      }
      selected.setAttribute('points', pstr);
      break;
    case 'path':
      var seg;
      var segList = selected.pathSegList;
      len = segList.numberOfItems;
      changes.d = [];
      for (i = 0; i < len; ++i) {
          seg = segList.getItem(i);
          changes.d[i] = {
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

      len = changes.d.length;
      var firstseg = changes.d[0],
          currentpt = remap(firstseg.x, firstseg.y);
      changes.d[0].x = currentpt.x;
      changes.d[0].y = currentpt.y;
      for (i = 1; i < len; ++i) {
        seg = changes.d[i];
        type = seg.type;
        // if absolute or first segment, we want to remap x, y, x1, y1, x2, y2
        // if relative, we want to scalew, scaleh
        if (type % 2 == 0) { // absolute
          var thisx = (seg.x != undefined) ? seg.x : currentpt.x, // for V commands
              thisy = (seg.y != undefined) ? seg.y : currentpt.y; // for H commands
          pt = remap(thisx,thisy);
          pt1 = remap(seg.x1, seg.y1);
          pt2 = remap(seg.x2, seg.y2);
          seg.x = pt.x;
          seg.y = pt.y;
          seg.x1 = pt1.x;
          seg.y1 = pt1.y;
          seg.x2 = pt2.x;
          seg.y2 = pt2.y;
          seg.r1 = scalew(seg.r1);
          seg.r2 = scaleh(seg.r2);
        }
        else { // relative
          seg.x = scalew(seg.x);
          seg.y = scaleh(seg.y);
          seg.x1 = scalew(seg.x1);
          seg.y1 = scaleh(seg.y1);
          seg.x2 = scalew(seg.x2);
          seg.y2 = scaleh(seg.y2);
          seg.r1 = scalew(seg.r1);
          seg.r2 = scaleh(seg.r2);
        }
      } // for each segment

      var dstr = '';
      len = changes.d.length;
      for (i = 0; i < len; ++i) {
        seg = changes.d[i];
        type = seg.type;
        dstr += pathMap[type];
        switch (type) {
            case 13: // relative horizontal line (h)
            case 12: // absolute horizontal line (H)
                dstr += seg.x + ' ';
                break;
            case 15: // relative vertical line (v)
            case 14: // absolute vertical line (V)
                dstr += seg.y + ' ';
                break;
            case 3: // relative move (m)
            case 5: // relative line (l)
            case 19: // relative smooth quad (t)
            case 2: // absolute move (M)
            case 4: // absolute line (L)
            case 18: // absolute smooth quad (T)
                dstr += seg.x + ',' + seg.y + ' ';
                break;
            case 7: // relative cubic (c)
            case 6: // absolute cubic (C)
                dstr += seg.x1 + ',' + seg.y1 + ' ' + seg.x2 + ',' + seg.y2 + ' ' +
                     seg.x + ',' + seg.y + ' ';
                break;
            case 9: // relative quad (q) 
            case 8: // absolute quad (Q)
                dstr += seg.x1 + ',' + seg.y1 + ' ' + seg.x + ',' + seg.y + ' ';
                break;
            case 11: // relative elliptical arc (a)
            case 10: // absolute elliptical arc (A)
                dstr += seg.r1 + ',' + seg.r2 + ' ' + seg.angle + ' ' + (+seg.largeArcFlag) +
                    ' ' + (+seg.sweepFlag) + ' ' + seg.x + ',' + seg.y + ' ';
                break;
            case 17: // relative smooth cubic (s)
            case 16: // absolute smooth cubic (S)
                dstr += seg.x2 + ',' + seg.y2 + ' ' + seg.x + ',' + seg.y + ' ';
                break;
          }
      }

      selected.setAttribute('d', dstr);
      break;
    }
};

}());
