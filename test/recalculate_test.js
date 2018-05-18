/* eslint-env qunit */
/* globals svgedit */

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
  svgedit.recalculate.init({
    getSVGRoot () { return svg; },
    getStartTransform () { return ''; },
    setStartTransform () {}
  });
}

let elem;

function setUpRect () {
  setUp();
  elem = document.createElementNS(svgedit.NS.SVG, 'rect');
  elem.setAttribute('x', '200');
  elem.setAttribute('y', '150');
  elem.setAttribute('width', '250');
  elem.setAttribute('height', '120');
  svg.appendChild(elem);
}

function setUpTextWithTspan () {
  setUp();
  elem = document.createElementNS(svgedit.NS.SVG, 'text');
  elem.setAttribute('x', '200');
  elem.setAttribute('y', '150');

  const tspan = document.createElementNS(svgedit.NS.SVG, 'tspan');
  tspan.setAttribute('x', '200');
  tspan.setAttribute('y', '150');

  const theText = document.createTextNode('Foo bar');
  tspan.appendChild(theText);
  elem.appendChild(tspan);
  svg.appendChild(elem);
}

function tearDown () {
  while (svg.hasChildNodes()) {
    svg.removeChild(svg.firstChild);
  }
}

test('Test recalculateDimensions() on rect with identity matrix', function () {
  expect(1);

  setUpRect();
  elem.setAttribute('transform', 'matrix(1,0,0,1,0,0)');

  svgedit.recalculate.recalculateDimensions(elem);

  // Ensure that the identity matrix is swallowed and the element has no
  // transform on it.
  equal(false, elem.hasAttribute('transform'));

  tearDown();
});

test('Test recalculateDimensions() on rect with simple translate', function () {
  expect(5);

  setUpRect();
  elem.setAttribute('transform', 'translate(100,50)');

  svgedit.recalculate.recalculateDimensions(elem);

  equal(false, elem.hasAttribute('transform'));
  equal('300', elem.getAttribute('x'));
  equal('200', elem.getAttribute('y'));
  equal('250', elem.getAttribute('width'));
  equal('120', elem.getAttribute('height'));
  tearDown();
});

test('Test recalculateDimensions() on text w/tspan with simple translate', function () {
  expect(5);

  setUpTextWithTspan();
  elem.setAttribute('transform', 'translate(100,50)');

  svgedit.recalculate.recalculateDimensions(elem);

  // Ensure that the identity matrix is swallowed and the element has no
  // transform on it.
  equal(false, elem.hasAttribute('transform'));
  equal('300', elem.getAttribute('x'));
  equal('200', elem.getAttribute('y'));

  const tspan = elem.firstElementChild;
  equal('300', tspan.getAttribute('x'));
  equal('200', tspan.getAttribute('y'));

  tearDown();
});

// TODO: Since recalculateDimensions() and surrounding code is
// probably the largest, most complicated and strange piece of
// code in SVG-edit, we need to write a whole lot of unit tests
// for it here.
