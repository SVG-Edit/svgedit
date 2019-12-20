import '../../instrumented/jquery.min.js';

import {NS} from '../../instrumented/namespaces.js';
import * as utilities from '../../instrumented/utilities.js';
import * as coords from '../../instrumented/coords.js';

describe('coords', function () {
  let elemId = 1;

  // eslint-disable-next-line no-shadow
  const root = document.createElement('div');
  root.id = 'root';
  root.style.visibility = 'hidden';
  document.body.append(root);

  /**
   * Set up tests with mock data.
   * @returns {void}
   */
  beforeEach(function () {
    const svgroot = document.createElementNS(NS.SVG, 'svg');
    svgroot.id = 'svgroot';
    root.append(svgroot);
    this.svg = document.createElementNS(NS.SVG, 'svg');
    svgroot.append(this.svg);

    // Mock out editor context.
    utilities.init(
      /**
      * @implements {module:utilities.EditorContext}
      */
      {
        getSVGRoot: () => { return this.svg; },
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
  });

  /**
   * Tear down tests, removing elements.
   * @returns {void}
   */
  afterEach(function () {
    while (this.svg.hasChildNodes()) {
      this.svg.firstChild.remove();
    }
  });

  it('Test remapElement(translate) for rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('x', '200');
    rect.setAttribute('y', '150');
    rect.setAttribute('width', '250');
    rect.setAttribute('height', '120');
    this.svg.append(rect);

    const attrs = {
      x: '200',
      y: '150',
      width: '125',
      height: '75'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 100; m.f = -50;

    coords.remapElement(rect, attrs, m);

    assert.equal(rect.getAttribute('x'), '300');
    assert.equal(rect.getAttribute('y'), '100');
    assert.equal(rect.getAttribute('width'), '125');
    assert.equal(rect.getAttribute('height'), '75');
  });

  it('Test remapElement(scale) for rect', function () {
    const rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('width', '250');
    rect.setAttribute('height', '120');
    this.svg.append(rect);

    const attrs = {
      x: '0',
      y: '0',
      width: '250',
      height: '120'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 2; m.b = 0;
    m.c = 0; m.d = 0.5;
    m.e = 0; m.f = 0;

    coords.remapElement(rect, attrs, m);

    assert.equal(rect.getAttribute('x'), '0');
    assert.equal(rect.getAttribute('y'), '0');
    assert.equal(rect.getAttribute('width'), '500');
    assert.equal(rect.getAttribute('height'), '60');
  });

  it('Test remapElement(translate) for circle', function () {
    const circle = document.createElementNS(NS.SVG, 'circle');
    circle.setAttribute('cx', '200');
    circle.setAttribute('cy', '150');
    circle.setAttribute('r', '125');
    this.svg.append(circle);

    const attrs = {
      cx: '200',
      cy: '150',
      r: '125'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 100; m.f = -50;

    coords.remapElement(circle, attrs, m);

    assert.equal(circle.getAttribute('cx'), '300');
    assert.equal(circle.getAttribute('cy'), '100');
    assert.equal(circle.getAttribute('r'), '125');
  });

  it('Test remapElement(scale) for circle', function () {
    const circle = document.createElementNS(NS.SVG, 'circle');
    circle.setAttribute('cx', '200');
    circle.setAttribute('cy', '150');
    circle.setAttribute('r', '250');
    this.svg.append(circle);

    const attrs = {
      cx: '200',
      cy: '150',
      r: '250'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 2; m.b = 0;
    m.c = 0; m.d = 0.5;
    m.e = 0; m.f = 0;

    coords.remapElement(circle, attrs, m);

    assert.equal(circle.getAttribute('cx'), '400');
    assert.equal(circle.getAttribute('cy'), '75');
    // Radius is the minimum that fits in the new bounding box.
    assert.equal(circle.getAttribute('r'), '125');
  });

  it('Test remapElement(translate) for ellipse', function () {
    const ellipse = document.createElementNS(NS.SVG, 'ellipse');
    ellipse.setAttribute('cx', '200');
    ellipse.setAttribute('cy', '150');
    ellipse.setAttribute('rx', '125');
    ellipse.setAttribute('ry', '75');
    this.svg.append(ellipse);

    const attrs = {
      cx: '200',
      cy: '150',
      rx: '125',
      ry: '75'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 100; m.f = -50;

    coords.remapElement(ellipse, attrs, m);

    assert.equal(ellipse.getAttribute('cx'), '300');
    assert.equal(ellipse.getAttribute('cy'), '100');
    assert.equal(ellipse.getAttribute('rx'), '125');
    assert.equal(ellipse.getAttribute('ry'), '75');
  });

  it('Test remapElement(scale) for ellipse', function () {
    const ellipse = document.createElementNS(NS.SVG, 'ellipse');
    ellipse.setAttribute('cx', '200');
    ellipse.setAttribute('cy', '150');
    ellipse.setAttribute('rx', '250');
    ellipse.setAttribute('ry', '120');
    this.svg.append(ellipse);

    const attrs = {
      cx: '200',
      cy: '150',
      rx: '250',
      ry: '120'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 2; m.b = 0;
    m.c = 0; m.d = 0.5;
    m.e = 0; m.f = 0;

    coords.remapElement(ellipse, attrs, m);

    assert.equal(ellipse.getAttribute('cx'), '400');
    assert.equal(ellipse.getAttribute('cy'), '75');
    assert.equal(ellipse.getAttribute('rx'), '500');
    assert.equal(ellipse.getAttribute('ry'), '60');
  });

  it('Test remapElement(translate) for line', function () {
    const line = document.createElementNS(NS.SVG, 'line');
    line.setAttribute('x1', '50');
    line.setAttribute('y1', '100');
    line.setAttribute('x2', '120');
    line.setAttribute('y2', '200');
    this.svg.append(line);

    const attrs = {
      x1: '50',
      y1: '100',
      x2: '120',
      y2: '200'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 100; m.f = -50;

    coords.remapElement(line, attrs, m);

    assert.equal(line.getAttribute('x1'), '150');
    assert.equal(line.getAttribute('y1'), '50');
    assert.equal(line.getAttribute('x2'), '220');
    assert.equal(line.getAttribute('y2'), '150');
  });

  it('Test remapElement(scale) for line', function () {
    const line = document.createElementNS(NS.SVG, 'line');
    line.setAttribute('x1', '50');
    line.setAttribute('y1', '100');
    line.setAttribute('x2', '120');
    line.setAttribute('y2', '200');
    this.svg.append(line);

    const attrs = {
      x1: '50',
      y1: '100',
      x2: '120',
      y2: '200'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 2; m.b = 0;
    m.c = 0; m.d = 0.5;
    m.e = 0; m.f = 0;

    coords.remapElement(line, attrs, m);

    assert.equal(line.getAttribute('x1'), '100');
    assert.equal(line.getAttribute('y1'), '50');
    assert.equal(line.getAttribute('x2'), '240');
    assert.equal(line.getAttribute('y2'), '100');
  });

  it('Test remapElement(translate) for text', function () {
    const text = document.createElementNS(NS.SVG, 'text');
    text.setAttribute('x', '50');
    text.setAttribute('y', '100');
    this.svg.append(text);

    const attrs = {
      x: '50',
      y: '100'
    };

    // Create a translate.
    const m = this.svg.createSVGMatrix();
    m.a = 1; m.b = 0;
    m.c = 0; m.d = 1;
    m.e = 100; m.f = -50;

    coords.remapElement(text, attrs, m);

    assert.equal(text.getAttribute('x'), '150');
    assert.equal(text.getAttribute('y'), '50');
  });
});
