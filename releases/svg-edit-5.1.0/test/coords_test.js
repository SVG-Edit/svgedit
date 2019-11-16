/* eslint-env qunit */
import {NS} from '../editor/namespaces.js';
import * as utilities from '../editor/utilities.js';
import * as coords from '../editor/coords.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const root = document.getElementById('root');
const svgroot = document.createElementNS(NS.SVG, 'svg');
svgroot.id = 'svgroot';
root.append(svgroot);
const svg = document.createElementNS(NS.SVG, 'svg');
svgroot.append(svg);

let elemId = 1;

/**
 * Set up tests with mock data.
 * @returns {void}
 */
function setUp () {
  // Mock out editor context.
  utilities.init(
    /**
    * @implements {module:utilities.EditorContext}
    */
    {
      getSVGRoot () { return svg; },
      getDOMDocument () { return null; },
      getDOMContainer () { return null; }
    }
  );
  coords.init(
    /**
    * @implements {module:coords.EditorContext}
    */
    {
      getGridSnapping () { return false; },
      getDrawing () {
        return {
          getNextId () { return String(elemId++); }
        };
      }
    }
  );
}

/**
 * Tear down tests, removing elements.
 * @returns {void}
 */
function tearDown () {
  while (svg.hasChildNodes()) {
    svg.firstChild.remove();
  }
}

QUnit.test('Test remapElement(translate) for rect', function (assert) {
  assert.expect(4);

  setUp();

  const rect = document.createElementNS(NS.SVG, 'rect');
  rect.setAttribute('x', '200');
  rect.setAttribute('y', '150');
  rect.setAttribute('width', '250');
  rect.setAttribute('height', '120');
  svg.append(rect);

  const attrs = {
    x: '200',
    y: '150',
    width: '125',
    height: '75'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  coords.remapElement(rect, attrs, m);

  assert.equal(rect.getAttribute('x'), '300');
  assert.equal(rect.getAttribute('y'), '100');
  assert.equal(rect.getAttribute('width'), '125');
  assert.equal(rect.getAttribute('height'), '75');

  tearDown();
});

QUnit.test('Test remapElement(scale) for rect', function (assert) {
  assert.expect(4);
  setUp();

  const rect = document.createElementNS(NS.SVG, 'rect');
  rect.setAttribute('width', '250');
  rect.setAttribute('height', '120');
  svg.append(rect);

  const attrs = {
    x: '0',
    y: '0',
    width: '250',
    height: '120'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 2; m.b = 0;
  m.c = 0; m.d = 0.5;
  m.e = 0; m.f = 0;

  coords.remapElement(rect, attrs, m);

  assert.equal(rect.getAttribute('x'), '0');
  assert.equal(rect.getAttribute('y'), '0');
  assert.equal(rect.getAttribute('width'), '500');
  assert.equal(rect.getAttribute('height'), '60');

  tearDown();
});

QUnit.test('Test remapElement(translate) for circle', function (assert) {
  assert.expect(3);
  setUp();

  const circle = document.createElementNS(NS.SVG, 'circle');
  circle.setAttribute('cx', '200');
  circle.setAttribute('cy', '150');
  circle.setAttribute('r', '125');
  svg.append(circle);

  const attrs = {
    cx: '200',
    cy: '150',
    r: '125'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  coords.remapElement(circle, attrs, m);

  assert.equal(circle.getAttribute('cx'), '300');
  assert.equal(circle.getAttribute('cy'), '100');
  assert.equal(circle.getAttribute('r'), '125');

  tearDown();
});

QUnit.test('Test remapElement(scale) for circle', function (assert) {
  assert.expect(3);
  setUp();

  const circle = document.createElementNS(NS.SVG, 'circle');
  circle.setAttribute('cx', '200');
  circle.setAttribute('cy', '150');
  circle.setAttribute('r', '250');
  svg.append(circle);

  const attrs = {
    cx: '200',
    cy: '150',
    r: '250'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 2; m.b = 0;
  m.c = 0; m.d = 0.5;
  m.e = 0; m.f = 0;

  coords.remapElement(circle, attrs, m);

  assert.equal(circle.getAttribute('cx'), '400');
  assert.equal(circle.getAttribute('cy'), '75');
  // Radius is the minimum that fits in the new bounding box.
  assert.equal(circle.getAttribute('r'), '125');

  tearDown();
});

QUnit.test('Test remapElement(translate) for ellipse', function (assert) {
  assert.expect(4);
  setUp();

  const ellipse = document.createElementNS(NS.SVG, 'ellipse');
  ellipse.setAttribute('cx', '200');
  ellipse.setAttribute('cy', '150');
  ellipse.setAttribute('rx', '125');
  ellipse.setAttribute('ry', '75');
  svg.append(ellipse);

  const attrs = {
    cx: '200',
    cy: '150',
    rx: '125',
    ry: '75'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  coords.remapElement(ellipse, attrs, m);

  assert.equal(ellipse.getAttribute('cx'), '300');
  assert.equal(ellipse.getAttribute('cy'), '100');
  assert.equal(ellipse.getAttribute('rx'), '125');
  assert.equal(ellipse.getAttribute('ry'), '75');

  tearDown();
});

QUnit.test('Test remapElement(scale) for ellipse', function (assert) {
  assert.expect(4);
  setUp();

  const ellipse = document.createElementNS(NS.SVG, 'ellipse');
  ellipse.setAttribute('cx', '200');
  ellipse.setAttribute('cy', '150');
  ellipse.setAttribute('rx', '250');
  ellipse.setAttribute('ry', '120');
  svg.append(ellipse);

  const attrs = {
    cx: '200',
    cy: '150',
    rx: '250',
    ry: '120'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 2; m.b = 0;
  m.c = 0; m.d = 0.5;
  m.e = 0; m.f = 0;

  coords.remapElement(ellipse, attrs, m);

  assert.equal(ellipse.getAttribute('cx'), '400');
  assert.equal(ellipse.getAttribute('cy'), '75');
  assert.equal(ellipse.getAttribute('rx'), '500');
  assert.equal(ellipse.getAttribute('ry'), '60');

  tearDown();
});

QUnit.test('Test remapElement(translate) for line', function (assert) {
  assert.expect(4);
  setUp();

  const line = document.createElementNS(NS.SVG, 'line');
  line.setAttribute('x1', '50');
  line.setAttribute('y1', '100');
  line.setAttribute('x2', '120');
  line.setAttribute('y2', '200');
  svg.append(line);

  const attrs = {
    x1: '50',
    y1: '100',
    x2: '120',
    y2: '200'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  coords.remapElement(line, attrs, m);

  assert.equal(line.getAttribute('x1'), '150');
  assert.equal(line.getAttribute('y1'), '50');
  assert.equal(line.getAttribute('x2'), '220');
  assert.equal(line.getAttribute('y2'), '150');

  tearDown();
});

QUnit.test('Test remapElement(scale) for line', function (assert) {
  assert.expect(4);
  setUp();

  const line = document.createElementNS(NS.SVG, 'line');
  line.setAttribute('x1', '50');
  line.setAttribute('y1', '100');
  line.setAttribute('x2', '120');
  line.setAttribute('y2', '200');
  svg.append(line);

  const attrs = {
    x1: '50',
    y1: '100',
    x2: '120',
    y2: '200'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 2; m.b = 0;
  m.c = 0; m.d = 0.5;
  m.e = 0; m.f = 0;

  coords.remapElement(line, attrs, m);

  assert.equal(line.getAttribute('x1'), '100');
  assert.equal(line.getAttribute('y1'), '50');
  assert.equal(line.getAttribute('x2'), '240');
  assert.equal(line.getAttribute('y2'), '100');

  tearDown();
});

QUnit.test('Test remapElement(translate) for text', function (assert) {
  assert.expect(2);
  setUp();

  const text = document.createElementNS(NS.SVG, 'text');
  text.setAttribute('x', '50');
  text.setAttribute('y', '100');
  svg.append(text);

  const attrs = {
    x: '50',
    y: '100'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  coords.remapElement(text, attrs, m);

  assert.equal(text.getAttribute('x'), '150');
  assert.equal(text.getAttribute('y'), '50');

  tearDown();
});
