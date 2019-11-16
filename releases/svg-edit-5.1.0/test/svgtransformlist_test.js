/* eslint-env qunit */

import {NS} from '../editor/namespaces.js';
import * as transformlist from '../editor/svgtransformlist.js';
import {disableSupportsNativeTransformLists} from '../editor/browser.js';
import almostEqualsPlugin from './qunit/qunit-assert-almostEquals.js';
import expectOutOfBoundsExceptionPlugin from './qunit/qunit-assert-expectOutOfBoundsException.js';

almostEqualsPlugin(QUnit);
expectOutOfBoundsExceptionPlugin(QUnit);

disableSupportsNativeTransformLists();

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const svgroot = document.querySelector('#svgroot');
let svgcontent, rect, circle;

/**
 * Set up tests, adding elements.
 * @returns {void}
 */
function setUp () {
  svgcontent = svgroot.appendChild(document.createElementNS(NS.SVG, 'svg'));
  rect = svgcontent.appendChild(document.createElementNS(NS.SVG, 'rect'));
  rect.id = 'r';
  circle = svgcontent.appendChild(document.createElementNS(NS.SVG, 'circle'));
  circle.id = 'c';
}

/**
 * Tear down tests, emptying SVG root, and resetting list map.
 * @returns {void}
 */
function tearDown () {
  transformlist.resetListMap();
  while (svgroot.hasChildNodes()) {
    svgroot.firstChild.remove();
  }
}

QUnit.module('svgedit.svgtransformlist');

QUnit.test('Test svgedit.transformlist package', function (assert) {
  assert.expect(2);

  assert.ok(transformlist);
  assert.ok(transformlist.getTransformList);
});

QUnit.test('Test svgedit.transformlist.getTransformList() function', function (assert) {
  assert.expect(4);
  setUp();

  const rxform = transformlist.getTransformList(rect);
  const cxform = transformlist.getTransformList(circle);

  assert.ok(rxform);
  assert.ok(cxform);
  assert.equal(typeof rxform, typeof {});
  assert.equal(typeof cxform, typeof {});

  tearDown();
});

QUnit.test('Test SVGTransformList.numberOfItems property', function (assert) {
  assert.expect(2);
  setUp();

  const rxform = transformlist.getTransformList(rect);

  assert.equal(typeof rxform.numberOfItems, typeof 0);
  assert.equal(rxform.numberOfItems, 0);

  tearDown();
});

QUnit.test('Test SVGTransformList.initialize()', function (assert) {
  assert.expect(6);
  setUp();

  const rxform = transformlist.getTransformList(rect);
  const cxform = transformlist.getTransformList(circle);

  const t = svgcontent.createSVGTransform();
  assert.ok(t);
  assert.ok(rxform.initialize);
  assert.equal(typeof rxform.initialize, typeof function () { /* */ });
  rxform.initialize(t);
  assert.equal(rxform.numberOfItems, 1);
  assert.equal(cxform.numberOfItems, 0);

  // If a transform was already in a transform list, this should
  // remove it from its old list and add it to this list.
  cxform.initialize(t);
  // This also fails in Firefox native.
  // assert.equal(rxform.numberOfItems, 0, 'Did not remove transform from list before initializing another transformlist');
  assert.equal(cxform.numberOfItems, 1);

  tearDown();
});

QUnit.test('Test SVGTransformList.appendItem() and getItem()', function (assert) {
  assert.expect(12);
  setUp();

  const rxform = transformlist.getTransformList(rect);
  const cxform = transformlist.getTransformList(circle);

  const t1 = svgcontent.createSVGTransform(),
    t2 = svgcontent.createSVGTransform(),
    t3 = svgcontent.createSVGTransform();

  assert.ok(rxform.appendItem);
  assert.ok(rxform.getItem);
  assert.equal(typeof rxform.appendItem, typeof function () { /* */ });
  assert.equal(typeof rxform.getItem, typeof function () { /* */ });

  rxform.appendItem(t1);
  rxform.appendItem(t2);
  rxform.appendItem(t3);

  assert.equal(rxform.numberOfItems, 3);
  const rxf = rxform.getItem(0);
  assert.equal(rxf, t1);
  assert.equal(rxform.getItem(1), t2);
  assert.equal(rxform.getItem(2), t3);

  assert.expectOutOfBoundsException(rxform, 'getItem', -1);
  assert.expectOutOfBoundsException(rxform, 'getItem', 3);
  cxform.appendItem(t1);
  // These also fail in Firefox native.
  // assert.equal(rxform.numberOfItems, 2, 'Did not remove a transform from a list before appending it to a new transformlist');
  // assert.equal(rxform.getItem(0), t2, 'Found the wrong transform in a transformlist');
  // assert.equal(rxform.getItem(1), t3, 'Found the wrong transform in a transformlist');

  assert.equal(cxform.numberOfItems, 1);
  assert.equal(cxform.getItem(0), t1);
  tearDown();
});

QUnit.test('Test SVGTransformList.removeItem()', function (assert) {
  assert.expect(7);
  setUp();

  const rxform = transformlist.getTransformList(rect);

  const t1 = svgcontent.createSVGTransform(),
    t2 = svgcontent.createSVGTransform();
  assert.ok(rxform.removeItem);
  assert.equal(typeof rxform.removeItem, typeof function () { /* */ });
  rxform.appendItem(t1);
  rxform.appendItem(t2);

  const removedTransform = rxform.removeItem(0);
  assert.equal(rxform.numberOfItems, 1);
  assert.equal(removedTransform, t1);
  assert.equal(rxform.getItem(0), t2);

  assert.expectOutOfBoundsException(rxform, 'removeItem', -1);
  assert.expectOutOfBoundsException(rxform, 'removeItem', 1);

  tearDown();
});

QUnit.test('Test SVGTransformList.replaceItem()', function (assert) {
  assert.expect(8);
  setUp();

  const rxform = transformlist.getTransformList(rect);
  const cxform = transformlist.getTransformList(circle);

  assert.ok(rxform.replaceItem);
  assert.equal(typeof rxform.replaceItem, typeof function () { /* */ });

  const t1 = svgcontent.createSVGTransform(),
    t2 = svgcontent.createSVGTransform(),
    t3 = svgcontent.createSVGTransform();

  rxform.appendItem(t1);
  rxform.appendItem(t2);
  cxform.appendItem(t3);

  const newItem = rxform.replaceItem(t3, 0);
  assert.equal(rxform.numberOfItems, 2);
  assert.equal(newItem, t3);
  assert.equal(rxform.getItem(0), t3);
  assert.equal(rxform.getItem(1), t2);
  // Fails in Firefox native
  // assert.equal(cxform.numberOfItems, 0);

  // test replaceItem within a list
  rxform.appendItem(t1);
  rxform.replaceItem(t1, 0);
  // Fails in Firefox native
  // assert.equal(rxform.numberOfItems, 2);
  assert.equal(rxform.getItem(0), t1);
  assert.equal(rxform.getItem(1), t2);

  tearDown();
});

QUnit.test('Test SVGTransformList.insertItemBefore()', function (assert) {
  assert.expect(10);
  setUp();

  const rxform = transformlist.getTransformList(rect);
  const cxform = transformlist.getTransformList(circle);

  assert.ok(rxform.insertItemBefore);
  assert.equal(typeof rxform.insertItemBefore, typeof function () { /* */ });

  const t1 = svgcontent.createSVGTransform(),
    t2 = svgcontent.createSVGTransform(),
    t3 = svgcontent.createSVGTransform();

  rxform.appendItem(t1);
  rxform.appendItem(t2);
  cxform.appendItem(t3);

  const newItem = rxform.insertItemBefore(t3, 0);
  assert.equal(rxform.numberOfItems, 3);
  assert.equal(newItem, t3);
  assert.equal(rxform.getItem(0), t3);
  assert.equal(rxform.getItem(1), t1);
  assert.equal(rxform.getItem(2), t2);
  // Fails in Firefox native
  // assert.equal(cxform.numberOfItems, 0);

  rxform.insertItemBefore(t2, 1);
  // Fails in Firefox native (they make copies of the transforms)
  // assert.equal(rxform.numberOfItems, 3);
  assert.equal(rxform.getItem(0), t3);
  assert.equal(rxform.getItem(1), t2);
  assert.equal(rxform.getItem(2), t1);
  tearDown();
});

QUnit.test('Test SVGTransformList.init() for translate(200,100)', function (assert) {
  assert.expect(8);
  setUp();
  rect.setAttribute('transform', 'translate(200,100)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const translate = rxform.getItem(0);
  assert.equal(translate.type, 2);

  const m = translate.matrix;
  assert.equal(m.a, 1);
  assert.equal(m.b, 0);
  assert.equal(m.c, 0);
  assert.equal(m.d, 1);
  assert.equal(m.e, 200);
  assert.equal(m.f, 100);

  tearDown();
});

QUnit.test('Test SVGTransformList.init() for scale(4)', function (assert) {
  assert.expect(8);
  setUp();
  rect.setAttribute('transform', 'scale(4)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const scale = rxform.getItem(0);
  assert.equal(scale.type, 3);

  const m = scale.matrix;
  assert.equal(m.a, 4);
  assert.equal(m.b, 0);
  assert.equal(m.c, 0);
  assert.equal(m.d, 4);
  assert.equal(m.e, 0);
  assert.equal(m.f, 0);

  tearDown();
});

QUnit.test('Test SVGTransformList.init() for scale(4,3)', function (assert) {
  assert.expect(8);
  setUp();
  rect.setAttribute('transform', 'scale(4,3)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const scale = rxform.getItem(0);
  assert.equal(scale.type, 3);

  const m = scale.matrix;
  assert.equal(m.a, 4);
  assert.equal(m.b, 0);
  assert.equal(m.c, 0);
  assert.equal(m.d, 3);
  assert.equal(m.e, 0);
  assert.equal(m.f, 0);

  tearDown();
});

QUnit.test('Test SVGTransformList.init() for rotate(45)', function (assert) {
  assert.expect(9);
  setUp();
  rect.setAttribute('transform', 'rotate(45)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const rotate = rxform.getItem(0);
  assert.equal(rotate.type, 4);
  assert.equal(rotate.angle, 45);

  const m = rotate.matrix;
  assert.almostEquals(1 / Math.sqrt(2), m.a);
  assert.almostEquals(1 / Math.sqrt(2), m.b);
  assert.almostEquals(-1 / Math.sqrt(2), m.c);
  assert.almostEquals(1 / Math.sqrt(2), m.d);
  assert.equal(m.e, 0);
  assert.equal(m.f, 0);

  tearDown();
});

QUnit.test('Test SVGTransformList.init() for rotate(45, 100, 200)', function (assert) {
  assert.expect(9);
  setUp();
  rect.setAttribute('transform', 'rotate(45, 100, 200)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const rotate = rxform.getItem(0);
  assert.equal(rotate.type, 4);
  assert.equal(rotate.angle, 45);

  const m = rotate.matrix;
  assert.almostEquals(m.a, 1 / Math.sqrt(2));
  assert.almostEquals(m.b, 1 / Math.sqrt(2));
  assert.almostEquals(m.c, -1 / Math.sqrt(2));
  assert.almostEquals(m.d, 1 / Math.sqrt(2));

  const r = svgcontent.createSVGMatrix();
  r.a = 1 / Math.sqrt(2); r.b = 1 / Math.sqrt(2);
  r.c = -1 / Math.sqrt(2); r.d = 1 / Math.sqrt(2);

  const t = svgcontent.createSVGMatrix();
  t.e = -100; t.f = -200;

  const t_ = svgcontent.createSVGMatrix();
  t_.e = 100; t_.f = 200;

  const result = t_.multiply(r).multiply(t);

  assert.almostEquals(m.e, result.e);
  assert.almostEquals(m.f, result.f);

  tearDown();
});

QUnit.test('Test SVGTransformList.init() for matrix(1, 2, 3, 4, 5, 6)', function (assert) {
  assert.expect(8);
  setUp();
  rect.setAttribute('transform', 'matrix(1,2,3,4,5,6)');

  const rxform = transformlist.getTransformList(rect);
  assert.equal(rxform.numberOfItems, 1);

  const mt = rxform.getItem(0);
  assert.equal(mt.type, 1);

  const m = mt.matrix;
  assert.equal(m.a, 1);
  assert.equal(m.b, 2);
  assert.equal(m.c, 3);
  assert.equal(m.d, 4);
  assert.equal(m.e, 5);
  assert.equal(m.f, 6);

  tearDown();
});
