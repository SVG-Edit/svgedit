/* eslint-env qunit */
/* globals $, svgedit */
/* eslint-disable no-var */
$(function () {
  // log function
  QUnit.log = function (details) {
    if (window.console && window.console.log) {
      window.console.log(details.result + ' :: ' + details.message);
    }
  };

  var root = document.getElementById('root');
  var svgroot = document.createElementNS(svgedit.NS.SVG, 'svg');
  svgroot.id = 'svgroot';
  root.appendChild(svgroot);
  var svg = document.createElementNS(svgedit.NS.SVG, 'svg');
  svgroot.appendChild(svg);
  var elemId = 1;
  var elem;

  function setUp () {
    svgedit.utilities.init({
      getSVGRoot: function () { return svg; },
      getDOMDocument: function () { return null; },
      getDOMContainer: function () { return null; }
    });
    svgedit.coords.init({
      getGridSnapping: function () { return false; },
      getDrawing: function () {
        return {
          getNextId: function () { return '' + elemId++; }
        };
      }
    });
    svgedit.recalculate.init({
      getSVGRoot: function () { return svg; },
      getStartTransform: function () { return ''; },
      setStartTransform: function () {}
    });
  }

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

    var tspan = document.createElementNS(svgedit.NS.SVG, 'tspan');
    tspan.setAttribute('x', '200');
    tspan.setAttribute('y', '150');

    var theText = document.createTextNode('Foo bar');
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

    var tspan = elem.firstElementChild;
    equal('300', tspan.getAttribute('x'));
    equal('200', tspan.getAttribute('y'));

    tearDown();
  });

  // TODO: Since recalculateDimensions() and surrounding code is
  // probably the largest, most complicated and strange piece of
  // code in SVG-edit, we need to write a whole lot of unit tests
  // for it here.
});
