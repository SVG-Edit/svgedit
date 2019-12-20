import '../../instrumented/jquery.min.js';

import {NS} from '../../instrumented/namespaces.js';
import * as utilities from '../../instrumented/utilities.js';
import * as coords from '../../instrumented/coords.js';
import * as recalculate from '../../instrumented/recalculate.js';

describe('recalculate', function () {
  // eslint-disable-next-line no-shadow
  const root = document.createElement('div');
  root.id = 'root';
  root.style.visibility = 'hidden';

  const svgroot = document.createElementNS(NS.SVG, 'svg');
  svgroot.id = 'svgroot';
  root.append(svgroot);
  const svg = document.createElementNS(NS.SVG, 'svg');
  svgroot.append(svg);

  let elemId = 1;

  /**
   * Initilize modules to set up the tests.
   * @returns {void}
   */
  function setUp () {
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
    recalculate.init(
      /**
      * @implements {module:recalculate.EditorContext}
      */
      {
        getSVGRoot () { return svg; },
        getStartTransform () { return ''; },
        setStartTransform () { /* */ }
      }
    );
  }

  let elem;

  /**
   * Initialize for tests and set up `rect` element.
   * @returns {void}
   */
  function setUpRect () {
    setUp();
    elem = document.createElementNS(NS.SVG, 'rect');
    elem.setAttribute('x', '200');
    elem.setAttribute('y', '150');
    elem.setAttribute('width', '250');
    elem.setAttribute('height', '120');
    svg.append(elem);
  }

  /**
   * Initialize for tests and set up `text` element with `tspan` child.
   * @returns {void}
   */
  function setUpTextWithTspan () {
    setUp();
    elem = document.createElementNS(NS.SVG, 'text');
    elem.setAttribute('x', '200');
    elem.setAttribute('y', '150');

    const tspan = document.createElementNS(NS.SVG, 'tspan');
    tspan.setAttribute('x', '200');
    tspan.setAttribute('y', '150');

    const theText = document.createTextNode('Foo bar');
    tspan.append(theText);
    elem.append(tspan);
    svg.append(elem);
  }

  /**
   * Tear down the tests (empty the svg element).
   * @returns {void}
   */
  afterEach(() => {
    while (svg.hasChildNodes()) {
      svg.firstChild.remove();
    }
  });

  it('Test recalculateDimensions() on rect with identity matrix', function () {
    setUpRect();
    elem.setAttribute('transform', 'matrix(1,0,0,1,0,0)');

    recalculate.recalculateDimensions(elem);

    // Ensure that the identity matrix is swallowed and the element has no
    // transform on it.
    assert.equal(elem.hasAttribute('transform'), false);
  });

  it('Test recalculateDimensions() on rect with simple translate', function () {
    setUpRect();
    elem.setAttribute('transform', 'translate(100,50)');

    recalculate.recalculateDimensions(elem);

    assert.equal(elem.hasAttribute('transform'), false);
    assert.equal(elem.getAttribute('x'), '300');
    assert.equal(elem.getAttribute('y'), '200');
    assert.equal(elem.getAttribute('width'), '250');
    assert.equal(elem.getAttribute('height'), '120');
  });

  it('Test recalculateDimensions() on text w/tspan with simple translate', function () {
    setUpTextWithTspan();
    elem.setAttribute('transform', 'translate(100,50)');

    recalculate.recalculateDimensions(elem);

    // Ensure that the identity matrix is swallowed and the element has no
    // transform on it.
    assert.equal(elem.hasAttribute('transform'), false);
    assert.equal(elem.getAttribute('x'), '300');
    assert.equal(elem.getAttribute('y'), '200');

    const tspan = elem.firstElementChild;
    assert.equal(tspan.getAttribute('x'), '300');
    assert.equal(tspan.getAttribute('y'), '200');
  });

  // TODO: Since recalculateDimensions() and surrounding code is
  // probably the largest, most complicated and strange piece of
  // code in SVG-edit, we need to write a whole lot of unit tests
  // for it here.
});
