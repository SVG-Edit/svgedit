/* globals jQuery */
/**
 * Manipulating coordinates
 * @module coords
 * @license MIT
 */

import './svgpathseg.js';
import {
  snapToGrid, assignAttributes, getBBox, getRefElem, findDefs
} from './utilities.js';
import {
  transformPoint, transformListToTransform, matrixMultiply, transformBox
} from './math.js';
import {getTransformList} from './svgtransformlist.js';

const $ = jQuery;

// this is how we map paths to our preferred relative segment types
const pathMap = [0, 'z', 'M', 'm', 'L', 'l', 'C', 'c', 'Q', 'q', 'A', 'a',
  'H', 'h', 'V', 'v', 'S', 's', 'T', 't'];

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

let editorContext_ = null;

/**
* @function module:coords.init
* @param {module:coords.EditorContext} editorContext
*/
export const init = function (editorContext) {
  editorContext_ = editorContext;
};

/**
 * Applies coordinate changes to an element based on the given matrix
 * @function module:coords.remapElement
 * @implements {module:path.EditorContext#remapElement}
*/
export const remapElement = function (selected, changes, m) {
  const remap = function (x, y) { return transformPoint(x, y, m); },
    scalew = function (w) { return m.a * w; },
    scaleh = function (h) { return m.d * h; },
    doSnapping = editorContext_.getGridSnapping() && selected.parentNode.parentNode.localName === 'svg',
    finishUp = function () {
      if (doSnapping) {
        for (const o in changes) {
          changes[o] = snapToGrid(changes[o]);
        }
      }
      assignAttributes(selected, changes, 1000, true);
    },
    box = getBBox(selected);

  for (let i = 0; i < 2; i++) {
    const type = i === 0 ? 'fill' : 'stroke';
    const attrVal = selected.getAttribute(type);
    if (attrVal && attrVal.startsWith('url(')) {
      if (m.a < 0 || m.d < 0) {
        const grad = getRefElem(attrVal);
        const newgrad = grad.cloneNode(true);
        if (m.a < 0) {
          // flip x
          const x1 = newgrad.getAttribute('x1');
          const x2 = newgrad.getAttribute('x2');
          newgrad.setAttribute('x1', -(x1 - 1));
          newgrad.setAttribute('x2', -(x2 - 1));
        }

        if (m.d < 0) {
          // flip y
          const y1 = newgrad.getAttribute('y1');
          const y2 = newgrad.getAttribute('y2');
          newgrad.setAttribute('y1', -(y1 - 1));
          newgrad.setAttribute('y2', -(y2 - 1));
        }
        newgrad.id = editorContext_.getDrawing().getNextId();
        findDefs().append(newgrad);
        selected.setAttribute(type, 'url(#' + newgrad.id + ')');
      }

      // Not really working :(
      // if (selected.tagName === 'path') {
      //   reorientGrads(selected, m);
      // }
    }
  }

  const elName = selected.tagName;
  if (elName === 'g' || elName === 'text' || elName === 'tspan' || elName === 'use') {
    // if it was a translate, then just update x,y
    if (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && (m.e !== 0 || m.f !== 0)) {
      // [T][M] = [M][T']
      // therefore [T'] = [M_inv][T][M]
      const existing = transformListToTransform(selected).matrix,
        tNew = matrixMultiply(existing.inverse(), m, existing);
      changes.x = parseFloat(changes.x) + tNew.e;
      changes.y = parseFloat(changes.y) + tNew.f;
    } else {
      // we just absorb all matrices into the element and don't do any remapping
      const chlist = getTransformList(selected);
      const mt = editorContext_.getSVGRoot().createSVGTransform();
      mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix, m));
      chlist.clear();
      chlist.appendItem(mt);
    }
  }

  // now we have a set of changes and an applied reduced transform list
  // we apply the changes directly to the DOM
  switch (elName) {
  case 'foreignObject':
  case 'rect':
  case 'image': {
    // Allow images to be inverted (give them matrix when flipped)
    if (elName === 'image' && (m.a < 0 || m.d < 0)) {
      // Convert to matrix
      const chlist = getTransformList(selected);
      const mt = editorContext_.getSVGRoot().createSVGTransform();
      mt.setMatrix(matrixMultiply(transformListToTransform(chlist).matrix, m));
      chlist.clear();
      chlist.appendItem(mt);
    } else {
      const pt1 = remap(changes.x, changes.y);
      changes.width = scalew(changes.width);
      changes.height = scaleh(changes.height);
      changes.x = pt1.x + Math.min(0, changes.width);
      changes.y = pt1.y + Math.min(0, changes.height);
      changes.width = Math.abs(changes.width);
      changes.height = Math.abs(changes.height);
    }
    finishUp();
    break;
  } case 'ellipse': {
    const c = remap(changes.cx, changes.cy);
    changes.cx = c.x;
    changes.cy = c.y;
    changes.rx = scalew(changes.rx);
    changes.ry = scaleh(changes.ry);
    changes.rx = Math.abs(changes.rx);
    changes.ry = Math.abs(changes.ry);
    finishUp();
    break;
  } case 'circle': {
    const c = remap(changes.cx, changes.cy);
    changes.cx = c.x;
    changes.cy = c.y;
    // take the minimum of the new selected box's dimensions for the new circle radius
    const tbox = transformBox(box.x, box.y, box.width, box.height, m);
    const w = tbox.tr.x - tbox.tl.x, h = tbox.bl.y - tbox.tl.y;
    changes.r = Math.min(w / 2, h / 2);

    if (changes.r) { changes.r = Math.abs(changes.r); }
    finishUp();
    break;
  } case 'line': {
    const pt1 = remap(changes.x1, changes.y1);
    const pt2 = remap(changes.x2, changes.y2);
    changes.x1 = pt1.x;
    changes.y1 = pt1.y;
    changes.x2 = pt2.x;
    changes.y2 = pt2.y;
  } // Fallthrough
  case 'text':
  case 'tspan':
  case 'use': {
    finishUp();
    break;
  } case 'g': {
    const gsvg = $(selected).data('gsvg');
    if (gsvg) {
      assignAttributes(gsvg, changes, 1000, true);
    }
    break;
  } case 'polyline':
  case 'polygon': {
    const len = changes.points.length;
    for (let i = 0; i < len; ++i) {
      const pt = changes.points[i];
      const {x, y} = remap(pt.x, pt.y);
      changes.points[i].x = x;
      changes.points[i].y = y;
    }

    // const len = changes.points.length;
    let pstr = '';
    for (let i = 0; i < len; ++i) {
      const pt = changes.points[i];
      pstr += pt.x + ',' + pt.y + ' ';
    }
    selected.setAttribute('points', pstr);
    break;
  } case 'path': {
    const segList = selected.pathSegList;
    let len = segList.numberOfItems;
    changes.d = [];
    for (let i = 0; i < len; ++i) {
      const seg = segList.getItem(i);
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
    const firstseg = changes.d[0],
      currentpt = remap(firstseg.x, firstseg.y);
    changes.d[0].x = currentpt.x;
    changes.d[0].y = currentpt.y;
    for (let i = 1; i < len; ++i) {
      const seg = changes.d[i];
      const {type} = seg;
      // if absolute or first segment, we want to remap x, y, x1, y1, x2, y2
      // if relative, we want to scalew, scaleh
      if (type % 2 === 0) { // absolute
        const thisx = (seg.x !== undefined) ? seg.x : currentpt.x, // for V commands
          thisy = (seg.y !== undefined) ? seg.y : currentpt.y; // for H commands
        const pt = remap(thisx, thisy);
        const pt1 = remap(seg.x1, seg.y1);
        const pt2 = remap(seg.x2, seg.y2);
        seg.x = pt.x;
        seg.y = pt.y;
        seg.x1 = pt1.x;
        seg.y1 = pt1.y;
        seg.x2 = pt2.x;
        seg.y2 = pt2.y;
        seg.r1 = scalew(seg.r1);
        seg.r2 = scaleh(seg.r2);
      } else { // relative
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

    let dstr = '';
    len = changes.d.length;
    for (let i = 0; i < len; ++i) {
      const seg = changes.d[i];
      const {type} = seg;
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
  }
};
