/* eslint-env qunit */
/* globals svgedit, equals */

// log function
QUnit.log = function (details) {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
};

const root = document.getElementById('root');
const svgroot = document.createElementNS(svgedit.NS.SVG, 'svg');
svgroot.id = 'svgroot';
root.appendChild(svgroot);
const svg = document.createElementNS(svgedit.NS.SVG, 'svg');
svgroot.appendChild(svg);

let elemId = 1;
function setUp () {
  // Mock out editor context.
  svgedit.utilities.init({
    getSVGRoot () { return svg; },
    getDOMDocument () { return null; },
    getDOMContainer () { return null; }
  });
  svgedit.coords.init({
    getGridSnapping () { return false; },
    getDrawing () {
      return {
        getNextId () { return '' + elemId++; }
      };
    }
  });
}

function tearDown () {
  while (svg.hasChildNodes()) {
    svg.removeChild(svg.firstChild);
  }
}

test('Test remapElement(translate) for rect', function () {
  expect(4);

  setUp();

  const rect = document.createElementNS(svgedit.NS.SVG, 'rect');
  rect.setAttribute('x', '200');
  rect.setAttribute('y', '150');
  rect.setAttribute('width', '250');
  rect.setAttribute('height', '120');
  svg.appendChild(rect);

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

  svgedit.coords.remapElement(rect, attrs, m);

  equals(rect.getAttribute('x'), '300');
  equals(rect.getAttribute('y'), '100');
  equals(rect.getAttribute('width'), '125');
  equals(rect.getAttribute('height'), '75');

  tearDown();
});

test('Test remapElement(scale) for rect', function () {
  expect(4);
  setUp();

  const rect = document.createElementNS(svgedit.NS.SVG, 'rect');
  rect.setAttribute('width', '250');
  rect.setAttribute('height', '120');
  svg.appendChild(rect);

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

  svgedit.coords.remapElement(rect, attrs, m);

  equals(rect.getAttribute('x'), '0');
  equals(rect.getAttribute('y'), '0');
  equals(rect.getAttribute('width'), '500');
  equals(rect.getAttribute('height'), '60');

  tearDown();
});

test('Test remapElement(translate) for circle', function () {
  expect(3);
  setUp();

  const circle = document.createElementNS(svgedit.NS.SVG, 'circle');
  circle.setAttribute('cx', '200');
  circle.setAttribute('cy', '150');
  circle.setAttribute('r', '125');
  svg.appendChild(circle);

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

  svgedit.coords.remapElement(circle, attrs, m);

  equals(circle.getAttribute('cx'), '300');
  equals(circle.getAttribute('cy'), '100');
  equals(circle.getAttribute('r'), '125');

  tearDown();
});

test('Test remapElement(scale) for circle', function () {
  expect(3);
  setUp();

  const circle = document.createElementNS(svgedit.NS.SVG, 'circle');
  circle.setAttribute('cx', '200');
  circle.setAttribute('cy', '150');
  circle.setAttribute('r', '250');
  svg.appendChild(circle);

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

  svgedit.coords.remapElement(circle, attrs, m);

  equals(circle.getAttribute('cx'), '400');
  equals(circle.getAttribute('cy'), '75');
  // Radius is the minimum that fits in the new bounding box.
  equals(circle.getAttribute('r'), '125');

  tearDown();
});

test('Test remapElement(translate) for ellipse', function () {
  expect(4);
  setUp();

  const ellipse = document.createElementNS(svgedit.NS.SVG, 'ellipse');
  ellipse.setAttribute('cx', '200');
  ellipse.setAttribute('cy', '150');
  ellipse.setAttribute('rx', '125');
  ellipse.setAttribute('ry', '75');
  svg.appendChild(ellipse);

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

  svgedit.coords.remapElement(ellipse, attrs, m);

  equals(ellipse.getAttribute('cx'), '300');
  equals(ellipse.getAttribute('cy'), '100');
  equals(ellipse.getAttribute('rx'), '125');
  equals(ellipse.getAttribute('ry'), '75');

  tearDown();
});

test('Test remapElement(scale) for ellipse', function () {
  expect(4);
  setUp();

  const ellipse = document.createElementNS(svgedit.NS.SVG, 'ellipse');
  ellipse.setAttribute('cx', '200');
  ellipse.setAttribute('cy', '150');
  ellipse.setAttribute('rx', '250');
  ellipse.setAttribute('ry', '120');
  svg.appendChild(ellipse);

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

  svgedit.coords.remapElement(ellipse, attrs, m);

  equals(ellipse.getAttribute('cx'), '400');
  equals(ellipse.getAttribute('cy'), '75');
  equals(ellipse.getAttribute('rx'), '500');
  equals(ellipse.getAttribute('ry'), '60');

  tearDown();
});

test('Test remapElement(translate) for line', function () {
  expect(4);
  setUp();

  const line = document.createElementNS(svgedit.NS.SVG, 'line');
  line.setAttribute('x1', '50');
  line.setAttribute('y1', '100');
  line.setAttribute('x2', '120');
  line.setAttribute('y2', '200');
  svg.appendChild(line);

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

  svgedit.coords.remapElement(line, attrs, m);

  equals(line.getAttribute('x1'), '150');
  equals(line.getAttribute('y1'), '50');
  equals(line.getAttribute('x2'), '220');
  equals(line.getAttribute('y2'), '150');

  tearDown();
});

test('Test remapElement(scale) for line', function () {
  expect(4);
  setUp();

  const line = document.createElementNS(svgedit.NS.SVG, 'line');
  line.setAttribute('x1', '50');
  line.setAttribute('y1', '100');
  line.setAttribute('x2', '120');
  line.setAttribute('y2', '200');
  svg.appendChild(line);

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

  svgedit.coords.remapElement(line, attrs, m);

  equals(line.getAttribute('x1'), '100');
  equals(line.getAttribute('y1'), '50');
  equals(line.getAttribute('x2'), '240');
  equals(line.getAttribute('y2'), '100');

  tearDown();
});

test('Test remapElement(translate) for text', function () {
  expect(2);
  setUp();

  const text = document.createElementNS(svgedit.NS.SVG, 'text');
  text.setAttribute('x', '50');
  text.setAttribute('y', '100');
  svg.appendChild(text);

  const attrs = {
    x: '50',
    y: '100'
  };

  // Create a translate.
  const m = svg.createSVGMatrix();
  m.a = 1; m.b = 0;
  m.c = 0; m.d = 1;
  m.e = 100; m.f = -50;

  svgedit.coords.remapElement(text, attrs, m);

  equals(text.getAttribute('x'), '150');
  equals(text.getAttribute('y'), '50');

  tearDown();
});
