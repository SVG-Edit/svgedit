/* globals jQuery */
/**
 * Path functionality.
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import {NS} from '../common/namespaces.js';
import {
  transformPoint
} from '../common/math.js';
import {
  assignAttributes, getElem
} from '../common/utilities.js';
import {
  supportsPathInsertItemBefore
} from '../common/browser.js';

const $ = jQuery;
let pathMethodsContext_ = null;
let editorContext_ = null;

/**
* @function module:path-actions.init
* @param {module:path-actions.pathMethodsContext_} pathMethodsContext
* @returns {void}
*/
export const init = function (pathMethodsContext) {
  pathMethodsContext_ = pathMethodsContext;
};

/**
* @function module:path.insertItemBefore
* @param {Element} elem
* @param {Segment} newseg
* @param {Integer} index
* @returns {void}
*/
export const insertItemBeforeMethod = function (elem, newseg, index) {
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
export const ptObjToArrMethod = function (type, segItem) {
  const segData = pathMethodsContext_.getSegData();
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
export const getGripPtMethod = function (seg, altPt) {
  const {path: pth} = seg;
  let out = {
    x: altPt ? altPt.x : seg.item.x,
    y: altPt ? altPt.y : seg.item.y
  };

  if (pth.matrix) {
    const pt = transformPoint(out.x, out.y, pth.matrix);
    out = pt;
  }
  editorContext_ = pathMethodsContext_.getEditorContext();
  const currentZoom = editorContext_.getCurrentZoom();
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
export const getPointFromGripMethod = function (pt, pth) {
  const out = {
    x: pt.x,
    y: pt.y
  };

  if (pth.matrix) {
    pt = transformPoint(out.x, out.y, pth.imatrix);
    out.x = pt.x;
    out.y = pt.y;
  }
  editorContext_ = pathMethodsContext_.getEditorContext();
  const currentZoom = editorContext_.getCurrentZoom();
  out.x /= currentZoom;
  out.y /= currentZoom;

  return out;
};
/**
* @function module:path.getGripContainer
* @returns {Element}
*/
export const getGripContainerMethod = function () {
  let c = getElem('pathpointgrip_container');
  if (!c) {
    const parentElement = getElem('selectorParentGroup');
    c = parentElement.appendChild(document.createElementNS(NS.SVG, 'g'));
    c.id = 'pathpointgrip_container';
  }
  return c;
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
export const addPointGripMethod = function (index, x, y) {
  // create the container of all the point grips
  const pointGripContainer = getGripContainerMethod();

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
    const uiStrings = pathMethodsContext_.getUIStrings();
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
* Requires prior call to `setUiStrings` if `xlink:title`
*    to be set on the grip.
* @function module:path.addCtrlGrip
* @param {string} id
* @returns {SVGCircleElement}
*/
export const addCtrlGripMethod = function (id) {
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
  const uiStrings = pathMethodsContext_.getUIStrings();
  if ('pathCtrlPtTooltip' in uiStrings) { // May be empty if running path.js without svg-editor
    atts['xlink:title'] = uiStrings.pathCtrlPtTooltip;
  }
  assignAttributes(pointGrip, atts);
  getGripContainerMethod().append(pointGrip);
  return pointGrip;
};
/**
* @function module:path.getCtrlLine
* @param {string} id
* @returns {SVGLineElement}
*/
export const getCtrlLineMethod = function (id) {
  let ctrlLine = getElem('ctrlLine_' + id);
  if (ctrlLine) { return ctrlLine; }

  ctrlLine = document.createElementNS(NS.SVG, 'line');
  assignAttributes(ctrlLine, {
    id: 'ctrlLine_' + id,
    stroke: '#555',
    'stroke-width': 1,
    style: 'pointer-events:none'
  });
  getGripContainerMethod().append(ctrlLine);
  return ctrlLine;
};
