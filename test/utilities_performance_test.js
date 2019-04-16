/* eslint-env qunit */
import '../editor/svgpathseg.js';
import {NS} from '../editor/namespaces.js';
import * as utilities from '../editor/utilities.js';
import * as transformlist from '../editor/svgtransformlist.js';
import * as math from '../editor/math.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const currentLayer = document.getElementById('layer1');

/**
 * Create an SVG element for a mock.
 * @param {module:utilities.SVGElementJSON} jsonMap
 * @returns {SVGElement}
 */
function mockCreateSVGElement (jsonMap) {
  const elem = document.createElementNS(NS.SVG, jsonMap.element);
  Object.entries(jsonMap.attr).forEach(([attr, value]) => {
    elem.setAttribute(attr, value);
  });
  return elem;
}

/**
 * Mock of {@link module:utilities.EditorContext#addSVGElementFromJson}.
 * @param {module:utilities.SVGElementJSON} json
 * @returns {SVGElement}
 */
function mockaddSVGElementFromJson (json) {
  const elem = mockCreateSVGElement(json);
  currentLayer.append(elem);
  return elem;
}

// const svg = document.createElementNS(NS.SVG, 'svg');
const groupWithMatrixTransform = document.getElementById('svg_group_with_matrix_transform');
const textWithMatrixTransform = document.getElementById('svg_text_with_matrix_transform');

/**
 * Toward performance testing, fill document with clones of element.
 * @param {SVGElement} elem
 * @param {Integer} count
 * @returns {void}
 */
function fillDocumentByCloningElement (elem, count) {
  const elemId = elem.getAttribute('id') + '-';
  for (let index = 0; index < count; index++) {
    const clone = elem.cloneNode(true); // t: deep clone
    // Make sure you set a unique ID like a real document.
    clone.setAttribute('id', elemId + index);
    const {parentNode} = elem;
    parentNode.append(clone);
  }
}

QUnit.module('svgedit.utilities_performance');

const mockPathActions = {
  resetOrientation (path) {
    if (utilities.isNullish(path) || path.nodeName !== 'path') { return false; }
    const tlist = transformlist.getTransformList(path);
    const m = math.transformListToTransform(tlist).matrix;
    tlist.clear();
    path.removeAttribute('transform');
    const segList = path.pathSegList;

    const len = segList.numberOfItems;
    // let lastX, lastY;

    for (let i = 0; i < len; ++i) {
      const seg = segList.getItem(i);
      const type = seg.pathSegType;
      if (type === 1) {
        continue;
      }
      const pts = [];
      ['', 1, 2].forEach(function (n, j) {
        const x = seg['x' + n],
          y = seg['y' + n];
        if (x !== undefined && y !== undefined) {
          const pt = math.transformPoint(x, y, m);
          pts.splice(pts.length, 0, pt.x, pt.y);
        }
      });
      // path.replacePathSeg(type, i, pts, path);
    }

    // utilities.reorientGrads(path, m);
    return undefined;
  }
};

// //////////////////////////////////////////////////////////
// Performance times with various browsers on Macbook 2011 8MB RAM OS X El Capitan 10.11.4
//
// To see 'Before Optimization' performance, making the following two edits.
// 1. utilities.getStrokedBBox - change if( elems.length === 1) to if( false && elems.length === 1)
// 2. utilities.getBBoxWithTransform - uncomment 'Old technique that was very slow'

// Chrome
// Before Optimization
//   Pass1 svgCanvas.getStrokedBBox total ms 4,218, ave ms 41.0,   min/max 37 51
//   Pass2 svgCanvas.getStrokedBBox total ms 4,458, ave ms 43.3,   min/max 32 63
// Optimized Code
//   Pass1 svgCanvas.getStrokedBBox total ms 1,112, ave ms 10.8,   min/max 9 20
//   Pass2 svgCanvas.getStrokedBBox total ms    34, ave ms  0.3,   min/max 0 20

// Firefox
// Before Optimization
//   Pass1 svgCanvas.getStrokedBBox total ms 3,794, ave ms 36.8,   min/max 33 48
//   Pass2 svgCanvas.getStrokedBBox total ms 4,049, ave ms 39.3,   min/max 28 53
// Optimized Code
//   Pass1 svgCanvas.getStrokedBBox total ms   104, ave ms 1.0,   min/max 0 23
//   Pass2 svgCanvas.getStrokedBBox total ms    71, ave ms 0.7,   min/max 0 23

// Safari
// Before Optimization
//   Pass1 svgCanvas.getStrokedBBox total ms 4,840, ave ms 47.0,   min/max 45 62
//   Pass2 svgCanvas.getStrokedBBox total ms 4,849, ave ms 47.1,   min/max 34 62
// Optimized Code
//   Pass1 svgCanvas.getStrokedBBox total ms    42, ave ms 0.4,   min/max 0 23
//   Pass2 svgCanvas.getStrokedBBox total ms    17, ave ms 0.2,   min/max 0 23

QUnit.test('Test svgCanvas.getStrokedBBox() performance with matrix transforms', function (assert) {
  const done = assert.async();
  assert.expect(2);
  const {getStrokedBBox} = utilities;
  const {children} = currentLayer;

  let lastTime, now,
    min = Number.MAX_VALUE,
    max = 0,
    total = 0;

  fillDocumentByCloningElement(groupWithMatrixTransform, 50);
  fillDocumentByCloningElement(textWithMatrixTransform, 50);

  // The first pass through all elements is slower.
  const count = children.length;
  const start = lastTime = now = Date.now();
  // Skip the first child which is the title.
  for (let index = 1; index < count; index++) {
    const child = children[index];
    /* const obj = */ getStrokedBBox([child], mockaddSVGElementFromJson, mockPathActions);
    now = Date.now(); const delta = now - lastTime; lastTime = now;
    total += delta;
    min = Math.min(min, delta);
    max = Math.max(max, delta);
  }
  total = lastTime - start;
  const ave = total / count;
  assert.ok(ave < 20, 'svgedit.utilities.getStrokedBBox average execution time is less than 20 ms');
  console.log('Pass1 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + ave.toFixed(1) + ',\t min/max ' + min + ' ' + max);

  // The second pass is two to ten times faster.
  setTimeout(function () {
    const ct = children.length;

    const strt = lastTime = now = Date.now();
    // Skip the first child which is the title.
    for (let index = 1; index < ct; index++) {
      const child = children[index];
      /* const obj = */ getStrokedBBox([child], mockaddSVGElementFromJson, mockPathActions);
      now = Date.now(); const delta = now - lastTime; lastTime = now;
      total += delta;
      min = Math.min(min, delta);
      max = Math.max(max, delta);
    }

    total = lastTime - strt;
    const avg = total / ct;
    assert.ok(avg < 2, 'svgedit.utilities.getStrokedBBox average execution time is less than 1 ms');
    console.log('Pass2 svgCanvas.getStrokedBBox total ms ' + total + ', ave ms ' + avg.toFixed(1) + ',\t min/max ' + min + ' ' + max);

    done();
  });
});
