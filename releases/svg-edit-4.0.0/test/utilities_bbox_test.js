/* eslint-env qunit */
import '../editor/svgpathseg.js';
import {NS} from '../editor/namespaces.js';
import * as utilities from '../editor/utilities.js';
import * as transformlist from '../editor/svgtransformlist.js';
import * as math from '../editor/math.js';
import * as path from '../editor/path.js';
import closePlugin from './qunit/qunit-assert-close.js';

closePlugin(QUnit);

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

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
let mockaddSVGElementFromJsonCallCount = 0;

/**
 * Mock of {@link module:utilities.EditorContext#addSVGElementFromJson}.
 * @param {module:utilities.SVGElementJSON} json
 * @returns {SVGElement}
 */
function mockaddSVGElementFromJson (json) {
  const elem = mockCreateSVGElement(json);
  svgroot.append(elem);
  mockaddSVGElementFromJsonCallCount++;
  return elem;
}
const mockPathActions = {
  resetOrientation (pth) {
    if (utilities.isNullish(pth) || pth.nodeName !== 'path') { return false; }
    const tlist = transformlist.getTransformList(pth);
    const m = math.transformListToTransform(tlist).matrix;
    tlist.clear();
    pth.removeAttribute('transform');
    const segList = pth.pathSegList;

    const len = segList.numberOfItems;
    // let lastX, lastY;

    for (let i = 0; i < len; ++i) {
      const seg = segList.getItem(i);
      const type = seg.pathSegType;
      if (type === 1) { continue; }
      const pts = [];
      ['', 1, 2].forEach(function (n, j) {
        const x = seg['x' + n], y = seg['y' + n];
        if (x !== undefined && y !== undefined) {
          const pt = math.transformPoint(x, y, m);
          pts.splice(pts.length, 0, pt.x, pt.y);
        }
      });
      path.replacePathSeg(type, i, pts, pth);
    }
    // path.reorientGrads(pth, m);
    return undefined;
  }
};

const EPSILON = 0.001;
// const svg = document.createElementNS(NS.SVG, 'svg');
const sandbox = document.getElementById('sandbox');
const svgroot = mockCreateSVGElement({
  element: 'svg',
  attr: {id: 'svgroot'}
});
sandbox.append(svgroot);

QUnit.module('svgedit.utilities_bbox', {
  beforeEach () {
    // We're reusing ID's so we need to do this for transforms.
    transformlist.resetListMap();
    path.init(null);
    mockaddSVGElementFromJsonCallCount = 0;
  }
});

QUnit.test('Test svgedit.utilities package', function (assert) {
  assert.ok(utilities);
  assert.ok(utilities.getBBoxWithTransform);
  assert.ok(utilities.getStrokedBBox);
  assert.ok(utilities.getRotationAngleFromTransformList);
  assert.ok(utilities.getRotationAngle);
});

QUnit.test('Test getBBoxWithTransform and no transform', function (assert) {
  const {getBBoxWithTransform} = utilities;

  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M0,1 L2,3'}
  });
  svgroot.append(elem);
  let bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 2, height: 2});
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'line',
    attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6'}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 5});
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {}
  });
  g.append(elem);
  svgroot.append(g);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  g.remove();
});

QUnit.test('Test getBBoxWithTransform and a rotation transform', function (assert) {
  const {getBBoxWithTransform} = utilities;

  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M10,10 L20,20', transform: 'rotate(45 10,10)'}
  });
  svgroot.append(elem);
  let bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, 10, EPSILON);
  assert.close(bbox.y, 10, EPSILON);
  assert.close(bbox.width, 0, EPSILON);
  assert.close(bbox.height, Math.sqrt(100 + 100), EPSILON);
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '10', y: '10', width: '10', height: '20', transform: 'rotate(90 15,20)'}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, 5, EPSILON);
  assert.close(bbox.y, 15, EPSILON);
  assert.close(bbox.width, 20, EPSILON);
  assert.close(bbox.height, 10, EPSILON);
  assert.equal(mockaddSVGElementFromJsonCallCount, 1);
  elem.remove();

  const rect = {x: 10, y: 10, width: 10, height: 20};
  const angle = 45;
  const origin = {x: 15, y: 20}; // eslint-disable-line no-shadow
  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect2', x: rect.x, y: rect.y, width: rect.width, height: rect.height, transform: 'rotate(' + angle + ' ' + origin.x + ',' + origin.y + ')'}
  });
  svgroot.append(elem);
  mockaddSVGElementFromJsonCallCount = 0;
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  const r2 = rotateRect(rect, angle, origin);
  assert.close(bbox.x, r2.x, EPSILON, 'rect2 x is ' + r2.x);
  assert.close(bbox.y, r2.y, EPSILON, 'rect2 y is ' + r2.y);
  assert.close(bbox.width, r2.width, EPSILON, 'rect2 width is' + r2.width);
  assert.close(bbox.height, r2.height, EPSILON, 'rect2 height is ' + r2.height);
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  elem.remove();

  // Same as previous but wrapped with g and the transform is with the g.
  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect3', x: rect.x, y: rect.y, width: rect.width, height: rect.height}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {transform: 'rotate(' + angle + ' ' + origin.x + ',' + origin.y + ')'}
  });
  g.append(elem);
  svgroot.append(g);
  mockaddSVGElementFromJsonCallCount = 0;
  bbox = getBBoxWithTransform(g, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, r2.x, EPSILON, 'rect2 x is ' + r2.x);
  assert.close(bbox.y, r2.y, EPSILON, 'rect2 y is ' + r2.y);
  assert.close(bbox.width, r2.width, EPSILON, 'rect2 width is' + r2.width);
  assert.close(bbox.height, r2.height, EPSILON, 'rect2 height is ' + r2.height);
  assert.equal(mockaddSVGElementFromJsonCallCount, 0);
  g.remove();

  elem = mockCreateSVGElement({
    element: 'ellipse',
    attr: {id: 'ellipse1', cx: '100', cy: '100', rx: '50', ry: '50', transform: 'rotate(45 100,100)'}
  });
  svgroot.append(elem);
  mockaddSVGElementFromJsonCallCount = 0;
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  // TODO: the BBox algorithm is using the bezier control points to calculate the bounding box. Should be 50, 50, 100, 100.
  assert.ok(bbox.x > 45 && bbox.x <= 50);
  assert.ok(bbox.y > 45 && bbox.y <= 50);
  assert.ok(bbox.width >= 100 && bbox.width < 110);
  assert.ok(bbox.height >= 100 && bbox.height < 110);
  assert.equal(mockaddSVGElementFromJsonCallCount, 1);
  elem.remove();
});

QUnit.test('Test getBBoxWithTransform with rotation and matrix transforms', function (assert) {
  const {getBBoxWithTransform} = utilities;

  let tx = 10; // tx right
  let ty = 10; // tx down
  let txInRotatedSpace = Math.sqrt(tx * tx + ty * ty); // translate in rotated 45 space.
  let tyInRotatedSpace = 0;
  let matrix = 'matrix(1,0,0,1,' + txInRotatedSpace + ',' + tyInRotatedSpace + ')';
  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M10,10 L20,20', transform: 'rotate(45 10,10) ' + matrix}
  });
  svgroot.append(elem);
  let bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, 10 + tx, EPSILON);
  assert.close(bbox.y, 10 + ty, EPSILON);
  assert.close(bbox.width, 0, EPSILON);
  assert.close(bbox.height, Math.sqrt(100 + 100), EPSILON);
  elem.remove();

  txInRotatedSpace = tx; // translate in rotated 90 space.
  tyInRotatedSpace = -ty;
  matrix = 'matrix(1,0,0,1,' + txInRotatedSpace + ',' + tyInRotatedSpace + ')';
  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '10', y: '10', width: '10', height: '20', transform: 'rotate(90 15,20) ' + matrix}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, 5 + tx, EPSILON);
  assert.close(bbox.y, 15 + ty, EPSILON);
  assert.close(bbox.width, 20, EPSILON);
  assert.close(bbox.height, 10, EPSILON);
  elem.remove();

  const rect = {x: 10, y: 10, width: 10, height: 20};
  const angle = 45;
  const origin = {x: 15, y: 20}; // eslint-disable-line no-shadow
  tx = 10; // tx right
  ty = 10; // tx down
  txInRotatedSpace = Math.sqrt(tx * tx + ty * ty); // translate in rotated 45 space.
  tyInRotatedSpace = 0;
  matrix = 'matrix(1,0,0,1,' + txInRotatedSpace + ',' + tyInRotatedSpace + ')';
  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect2', x: rect.x, y: rect.y, width: rect.width, height: rect.height, transform: 'rotate(' + angle + ' ' + origin.x + ',' + origin.y + ') ' + matrix}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  const r2 = rotateRect(rect, angle, origin);
  assert.close(bbox.x, r2.x + tx, EPSILON, 'rect2 x is ' + r2.x);
  assert.close(bbox.y, r2.y + ty, EPSILON, 'rect2 y is ' + r2.y);
  assert.close(bbox.width, r2.width, EPSILON, 'rect2 width is' + r2.width);
  assert.close(bbox.height, r2.height, EPSILON, 'rect2 height is ' + r2.height);
  elem.remove();

  // Same as previous but wrapped with g and the transform is with the g.
  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect3', x: rect.x, y: rect.y, width: rect.width, height: rect.height}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {transform: 'rotate(' + angle + ' ' + origin.x + ',' + origin.y + ') ' + matrix}
  });
  g.append(elem);
  svgroot.append(g);
  bbox = getBBoxWithTransform(g, mockaddSVGElementFromJson, mockPathActions);
  assert.close(bbox.x, r2.x + tx, EPSILON, 'rect2 x is ' + r2.x);
  assert.close(bbox.y, r2.y + ty, EPSILON, 'rect2 y is ' + r2.y);
  assert.close(bbox.width, r2.width, EPSILON, 'rect2 width is' + r2.width);
  assert.close(bbox.height, r2.height, EPSILON, 'rect2 height is ' + r2.height);
  g.remove();

  elem = mockCreateSVGElement({
    element: 'ellipse',
    attr: {id: 'ellipse1', cx: '100', cy: '100', rx: '50', ry: '50', transform: 'rotate(45 100,100) ' + matrix}
  });
  svgroot.append(elem);
  bbox = getBBoxWithTransform(elem, mockaddSVGElementFromJson, mockPathActions);
  // TODO: the BBox algorithm is using the bezier control points to calculate the bounding box. Should be 50, 50, 100, 100.
  assert.ok(bbox.x > 45 + tx && bbox.x <= 50 + tx);
  assert.ok(bbox.y > 45 + ty && bbox.y <= 50 + ty);
  assert.ok(bbox.width >= 100 && bbox.width < 110);
  assert.ok(bbox.height >= 100 && bbox.height < 110);
  elem.remove();
});

QUnit.test('Test getStrokedBBox with stroke-width 10', function (assert) {
  const {getStrokedBBox} = utilities;

  const strokeWidth = 10;
  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M0,1 L2,3', 'stroke-width': strokeWidth}
  });
  svgroot.append(elem);
  let bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0 - strokeWidth / 2, y: 1 - strokeWidth / 2, width: 2 + strokeWidth, height: 2 + strokeWidth});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10', 'stroke-width': strokeWidth}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0 - strokeWidth / 2, y: 1 - strokeWidth / 2, width: 5 + strokeWidth, height: 10 + strokeWidth});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'line',
    attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6', 'stroke-width': strokeWidth}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0 - strokeWidth / 2, y: 1 - strokeWidth / 2, width: 5 + strokeWidth, height: 5 + strokeWidth});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10', 'stroke-width': strokeWidth}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {}
  });
  g.append(elem);
  svgroot.append(g);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0 - strokeWidth / 2, y: 1 - strokeWidth / 2, width: 5 + strokeWidth, height: 10 + strokeWidth});
  g.remove();
});

QUnit.test("Test getStrokedBBox with stroke-width 'none'", function (assert) {
  const {getStrokedBBox} = utilities;

  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M0,1 L2,3', 'stroke-width': 'none'}
  });
  svgroot.append(elem);
  let bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 2, height: 2});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10', 'stroke-width': 'none'}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'line',
    attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6', 'stroke-width': 'none'}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 5});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10', 'stroke-width': 'none'}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {}
  });
  g.append(elem);
  svgroot.append(g);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  g.remove();
});

QUnit.test('Test getStrokedBBox with no stroke-width attribute', function (assert) {
  const {getStrokedBBox} = utilities;

  let elem = mockCreateSVGElement({
    element: 'path',
    attr: {id: 'path', d: 'M0,1 L2,3'}
  });
  svgroot.append(elem);
  let bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 2, height: 2});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'line',
    attr: {id: 'line', x1: '0', y1: '1', x2: '5', y2: '6'}
  });
  svgroot.append(elem);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 5});
  elem.remove();

  elem = mockCreateSVGElement({
    element: 'rect',
    attr: {id: 'rect', x: '0', y: '1', width: '5', height: '10'}
  });
  const g = mockCreateSVGElement({
    element: 'g',
    attr: {}
  });
  g.append(elem);
  svgroot.append(g);
  bbox = getStrokedBBox([elem], mockaddSVGElementFromJson, mockPathActions);
  assert.deepEqual(bbox, {x: 0, y: 1, width: 5, height: 10});
  g.remove();
});

/**
 * Returns radians for degrees.
 * @param {Float} degrees
 * @returns {Float}
 */
function radians (degrees) {
  return degrees * Math.PI / 180;
}

/**
 *
 * @param {module:utilities.BBoxObject} point
 * @param {Float} angle
 * @param {module:math.XYObject} origin
 * @returns {module:math.XYObject}
 */
function rotatePoint (point, angle, origin) { // eslint-disable-line no-shadow
  if (!origin) {
    origin = {x: 0, y: 0};
  }
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  const theta = radians(angle);
  return {
    x: x * Math.cos(theta) + y * Math.sin(theta) + origin.x,
    y: x * Math.sin(theta) + y * Math.cos(theta) + origin.y
  };
}
/**
 *
 * @param {module:utilities.BBoxObject} rect
 * @param {Float} angle
 * @param {module:math.XYObject} origin
 * @returns {module:utilities.BBoxObject}
 */
function rotateRect (rect, angle, origin) { // eslint-disable-line no-shadow
  const tl = rotatePoint({x: rect.x, y: rect.y}, angle, origin);
  const tr = rotatePoint({x: rect.x + rect.width, y: rect.y}, angle, origin);
  const br = rotatePoint({x: rect.x + rect.width, y: rect.y + rect.height}, angle, origin);
  const bl = rotatePoint({x: rect.x, y: rect.y + rect.height}, angle, origin);

  const minx = Math.min(tl.x, tr.x, bl.x, br.x);
  const maxx = Math.max(tl.x, tr.x, bl.x, br.x);
  const miny = Math.min(tl.y, tr.y, bl.y, br.y);
  const maxy = Math.max(tl.y, tr.y, bl.y, br.y);

  return {
    x: minx,
    y: miny,
    width: (maxx - minx),
    height: (maxy - miny)
  };
}
