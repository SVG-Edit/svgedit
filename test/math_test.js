/* eslint-env qunit */
import {NS} from '../editor/namespaces.js';
import * as math from '../editor/math.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const svg = document.createElementNS(NS.SVG, 'svg');

QUnit.module('svgedit.math');

QUnit.test('Test svgedit.math package', function (assert) {
  assert.expect(7);

  assert.ok(math);
  assert.ok(math.transformPoint);
  assert.ok(math.isIdentity);
  assert.ok(math.matrixMultiply);
  assert.equal(typeof math.transformPoint, typeof function () { /* */ });
  assert.equal(typeof math.isIdentity, typeof function () { /* */ });
  assert.equal(typeof math.matrixMultiply, typeof function () { /* */ });
});

QUnit.test('Test svgedit.math.transformPoint() function', function (assert) {
  assert.expect(6);
  const {transformPoint} = math;

  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 0; m.f = 0;
  let pt = transformPoint(100, 200, m);
  assert.equal(pt.x, 100);
  assert.equal(pt.y, 200);

  m.e = 300; m.f = 400;
  pt = transformPoint(100, 200, m);
  assert.equal(pt.x, 400);
  assert.equal(pt.y, 600);

  m.a = 0.5; m.b = 0.75;
  m.c = 1.25; m.d = 2;
  pt = transformPoint(100, 200, m);
  assert.equal(pt.x, 100 * m.a + 200 * m.c + m.e);
  assert.equal(pt.y, 100 * m.b + 200 * m.d + m.f);
});

QUnit.test('Test svgedit.math.isIdentity() function', function (assert) {
  assert.expect(2);

  assert.ok(math.isIdentity(svg.createSVGMatrix()));

  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 0; m.f = 0;
  assert.ok(math.isIdentity(m));
});

QUnit.test('Test svgedit.math.matrixMultiply() function', function (assert) {
  assert.expect(5);
  const mult = math.matrixMultiply;
  const {isIdentity} = math;

  // translate there and back
  const tr1 = svg.createSVGMatrix().translate(100, 50),
    tr2 = svg.createSVGMatrix().translate(-90, 0),
    tr3 = svg.createSVGMatrix().translate(-10, -50);
  let I = mult(tr1, tr2, tr3);
  assert.ok(isIdentity(I), 'Expected identity matrix when translating there and back');

  // rotate there and back
  // TODO: currently Mozilla fails this when rotating back at -50 and then -40 degrees
  // (b and c are *almost* zero, but not zero)
  const rotThere = svg.createSVGMatrix().rotate(90),
    rotBack = svg.createSVGMatrix().rotate(-90), // TODO: set this to -50
    rotBackMore = svg.createSVGMatrix().rotate(0); // TODO: set this to -40
  I = mult(rotThere, rotBack, rotBackMore);
  assert.ok(isIdentity(I), 'Expected identity matrix when rotating there and back');

  // scale up and down
  const scaleUp = svg.createSVGMatrix().scale(4),
    scaleDown = svg.createSVGMatrix().scaleNonUniform(0.25, 1),
    scaleDownMore = svg.createSVGMatrix().scaleNonUniform(1, 0.25);
  I = mult(scaleUp, scaleDown, scaleDownMore);
  assert.ok(isIdentity(I), 'Expected identity matrix when scaling up and down');

  // test multiplication with its inverse
  I = mult(rotThere, rotThere.inverse());
  assert.ok(isIdentity(I), 'Expected identity matrix when multiplying a matrix by its inverse');
  I = mult(rotThere.inverse(), rotThere);
  assert.ok(isIdentity(I), 'Expected identity matrix when multiplying a matrix by its inverse');
});

QUnit.test('Test svgedit.math.transformBox() function', function (assert) {
  assert.expect(12);
  const {transformBox} = math;

  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 0; m.f = 0;

  const r = transformBox(10, 10, 200, 300, m);
  assert.equal(r.tl.x, 10);
  assert.equal(r.tl.y, 10);
  assert.equal(r.tr.x, 210);
  assert.equal(r.tr.y, 10);
  assert.equal(r.bl.x, 10);
  assert.equal(r.bl.y, 310);
  assert.equal(r.br.x, 210);
  assert.equal(r.br.y, 310);
  assert.equal(r.aabox.x, 10);
  assert.equal(r.aabox.y, 10);
  assert.equal(r.aabox.width, 200);
  assert.equal(r.aabox.height, 300);
});
