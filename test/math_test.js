/* eslint-env qunit */
/* globals $, svgedit, equals */
/* eslint-disable no-var */
$(function () {
  // log function
  QUnit.log = function (details) {
    if (window.console && window.console.log) {
      window.console.log(details.result + ' :: ' + details.message);
    }
  };

  var svg = document.createElementNS(svgedit.NS.SVG, 'svg');

  module('svgedit.math');

  test('Test svgedit.math package', function () {
    expect(7);

    ok(svgedit.math);
    ok(svgedit.math.transformPoint);
    ok(svgedit.math.isIdentity);
    ok(svgedit.math.matrixMultiply);
    equals(typeof svgedit.math.transformPoint, typeof function () {});
    equals(typeof svgedit.math.isIdentity, typeof function () {});
    equals(typeof svgedit.math.matrixMultiply, typeof function () {});
  });

  test('Test svgedit.math.transformPoint() function', function () {
    expect(6);
    var transformPoint = svgedit.math.transformPoint;

    var m = svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 0; m.f = 0;
    var pt = transformPoint(100, 200, m);
    equals(pt.x, 100);
    equals(pt.y, 200);

    m.e = 300; m.f = 400;
    pt = transformPoint(100, 200, m);
    equals(pt.x, 400);
    equals(pt.y, 600);

    m.a = 0.5; m.b = 0.75;
    m.c = 1.25; m.d = 2;
    pt = transformPoint(100, 200, m);
    equals(pt.x, 100 * m.a + 200 * m.c + m.e);
    equals(pt.y, 100 * m.b + 200 * m.d + m.f);
  });

  test('Test svgedit.math.isIdentity() function', function () {
    expect(2);

    ok(svgedit.math.isIdentity(svg.createSVGMatrix()));

    var m = svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 0; m.f = 0;
    ok(svgedit.math.isIdentity(m));
  });

  test('Test svgedit.math.matrixMultiply() function', function () {
    expect(5);
    var mult = svgedit.math.matrixMultiply;
    var isIdentity = svgedit.math.isIdentity;

    // translate there and back
    var tr1 = svg.createSVGMatrix().translate(100, 50),
      tr2 = svg.createSVGMatrix().translate(-90, 0),
      tr3 = svg.createSVGMatrix().translate(-10, -50),
      I = mult(tr1, tr2, tr3);
    ok(isIdentity(I), 'Expected identity matrix when translating there and back');

    // rotate there and back
    // TODO: currently Mozilla fails this when rotating back at -50 and then -40 degrees
    // (b and c are *almost* zero, but not zero)
    var rotThere = svg.createSVGMatrix().rotate(90),
      rotBack = svg.createSVGMatrix().rotate(-90), // TODO: set this to -50
      rotBackMore = svg.createSVGMatrix().rotate(0); // TODO: set this to -40
    I = mult(rotThere, rotBack, rotBackMore);
    ok(isIdentity(I), 'Expected identity matrix when rotating there and back');

    // scale up and down
    var scaleUp = svg.createSVGMatrix().scale(4),
      scaleDown = svg.createSVGMatrix().scaleNonUniform(0.25, 1),
      scaleDownMore = svg.createSVGMatrix().scaleNonUniform(1, 0.25);
    I = mult(scaleUp, scaleDown, scaleDownMore);
    ok(isIdentity(I), 'Expected identity matrix when scaling up and down');

    // test multiplication with its inverse
    I = mult(rotThere, rotThere.inverse());
    ok(isIdentity(I), 'Expected identity matrix when multiplying a matrix by its inverse');
    I = mult(rotThere.inverse(), rotThere);
    ok(isIdentity(I), 'Expected identity matrix when multiplying a matrix by its inverse');
  });

  test('Test svgedit.math.transformBox() function', function () {
    expect(12);
    var transformBox = svgedit.math.transformBox;

    var m = svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 0; m.f = 0;

    var r = transformBox(10, 10, 200, 300, m);
    equals(r.tl.x, 10);
    equals(r.tl.y, 10);
    equals(r.tr.x, 210);
    equals(r.tr.y, 10);
    equals(r.bl.x, 10);
    equals(r.bl.y, 310);
    equals(r.br.x, 210);
    equals(r.br.y, 310);
    equals(r.aabox.x, 10);
    equals(r.aabox.y, 10);
    equals(r.aabox.width, 200);
    equals(r.aabox.height, 300);
  });
});
