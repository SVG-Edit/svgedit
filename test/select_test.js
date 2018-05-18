/* eslint-env qunit */
/* globals svgedit, equals */

// log function
QUnit.log = function (details) {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
};

module('svgedit.select');

const sandbox = document.getElementById('sandbox');
let svgroot;
let svgcontent;
const mockConfig = {
  dimensions: [640, 480]
};
const mockFactory = {
  createSVGElement (jsonMap) {
    const elem = document.createElementNS(svgedit.NS.SVG, jsonMap['element']);
    for (const attr in jsonMap.attr) {
      elem.setAttribute(attr, jsonMap.attr[attr]);
    }
    return elem;
  },
  svgRoot () { return svgroot; },
  svgContent () { return svgcontent; }
};

function setUp () {
  svgroot = mockFactory.createSVGElement({
    element: 'svg',
    attr: {id: 'svgroot'}
  });
  svgcontent = svgroot.appendChild(
    mockFactory.createSVGElement({
      element: 'svg',
      attr: {id: 'svgcontent'}
    })
  );
  /* const rect = */ svgcontent.appendChild(
    mockFactory.createSVGElement({
      element: 'rect',
      attr: {
        id: 'rect',
        x: '50',
        y: '75',
        width: '200',
        height: '100'
      }
    })
  );
  sandbox.appendChild(svgroot);
}

/*
function setUpWithInit () {
  setUp();
  svgedit.select.init(mockConfig, mockFactory);
}
*/

function tearDown () {
  while (sandbox.hasChildNodes()) {
    sandbox.removeChild(sandbox.firstChild);
  }
}

test('Test svgedit.select package', function () {
  expect(10);

  ok(svgedit.select);
  ok(svgedit.select.Selector);
  ok(svgedit.select.SelectorManager);
  ok(svgedit.select.init);
  ok(svgedit.select.getSelectorManager);
  equals(typeof svgedit.select, typeof {});
  equals(typeof svgedit.select.Selector, typeof function () {});
  equals(typeof svgedit.select.SelectorManager, typeof function () {});
  equals(typeof svgedit.select.init, typeof function () {});
  equals(typeof svgedit.select.getSelectorManager, typeof function () {});
});

test('Test Selector DOM structure', function () {
  expect(24);

  setUp();

  ok(svgroot);
  ok(svgroot.hasChildNodes());

  // Verify non-existence of Selector DOM nodes
  equals(svgroot.childNodes.length, 1);
  equals(svgroot.childNodes.item(0), svgcontent);
  ok(!svgroot.querySelector('#selectorParentGroup'));

  svgedit.select.init(mockConfig, mockFactory);

  equals(svgroot.childNodes.length, 3);

  // Verify existence of canvas background.
  const cb = svgroot.childNodes.item(0);
  ok(cb);
  equals(cb.id, 'canvasBackground');

  ok(svgroot.childNodes.item(1));
  equals(svgroot.childNodes.item(1), svgcontent);

  // Verify existence of selectorParentGroup.
  const spg = svgroot.childNodes.item(2);
  ok(spg);
  equals(svgroot.querySelector('#selectorParentGroup'), spg);
  equals(spg.id, 'selectorParentGroup');
  equals(spg.tagName, 'g');

  // Verify existence of all grip elements.
  ok(spg.querySelector('#selectorGrip_resize_nw'));
  ok(spg.querySelector('#selectorGrip_resize_n'));
  ok(spg.querySelector('#selectorGrip_resize_ne'));
  ok(spg.querySelector('#selectorGrip_resize_e'));
  ok(spg.querySelector('#selectorGrip_resize_se'));
  ok(spg.querySelector('#selectorGrip_resize_s'));
  ok(spg.querySelector('#selectorGrip_resize_sw'));
  ok(spg.querySelector('#selectorGrip_resize_w'));
  ok(spg.querySelector('#selectorGrip_rotateconnector'));
  ok(spg.querySelector('#selectorGrip_rotate'));

  tearDown();
});
