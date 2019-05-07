/* eslint-env qunit */
import * as select from '../editor/select.js';
import {NS} from '../editor/namespaces.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

QUnit.module('svgedit.select');

const sandbox = document.getElementById('sandbox');
let svgroot;
let svgcontent;
const mockConfig = {
  dimensions: [640, 480]
};

/**
* @implements {module:select.SVGFactory}
*/
const mockFactory = {
  createSVGElement (jsonMap) {
    const elem = document.createElementNS(NS.SVG, jsonMap.element);
    Object.entries(jsonMap.attr).forEach(([attr, value]) => {
      elem.setAttribute(attr, value);
    });
    return elem;
  },
  svgRoot () { return svgroot; },
  svgContent () { return svgcontent; }
};

/**
 * Potentially reusable test set-up.
 * @returns {void}
 */
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
  sandbox.append(svgroot);
}

/*
function setUpWithInit () {
  setUp();
  select.init(mockConfig, mockFactory);
}
*/

/**
 * Tear down the test by emptying our sandbox area.
 * @returns {void}
 */
function tearDown () {
  while (sandbox.hasChildNodes()) {
    sandbox.firstChild.remove();
  }
}

QUnit.test('Test svgedit.select package', function (assert) {
  assert.expect(10);

  assert.ok(select);
  assert.ok(select.Selector);
  assert.ok(select.SelectorManager);
  assert.ok(select.init);
  assert.ok(select.getSelectorManager);
  assert.equal(typeof select, typeof {});
  assert.equal(typeof select.Selector, typeof function () { /* */ });
  assert.equal(typeof select.SelectorManager, typeof function () { /* */ });
  assert.equal(typeof select.init, typeof function () { /* */ });
  assert.equal(typeof select.getSelectorManager, typeof function () { /* */ });
});

QUnit.test('Test Selector DOM structure', function (assert) {
  assert.expect(24);

  setUp();

  assert.ok(svgroot);
  assert.ok(svgroot.hasChildNodes());

  // Verify non-existence of Selector DOM nodes
  assert.equal(svgroot.childNodes.length, 1);
  assert.equal(svgroot.childNodes.item(0), svgcontent);
  assert.ok(!svgroot.querySelector('#selectorParentGroup'));

  select.init(mockConfig, mockFactory);

  assert.equal(svgroot.childNodes.length, 3);

  // Verify existence of canvas background.
  const cb = svgroot.childNodes.item(0);
  assert.ok(cb);
  assert.equal(cb.id, 'canvasBackground');

  assert.ok(svgroot.childNodes.item(1));
  assert.equal(svgroot.childNodes.item(1), svgcontent);

  // Verify existence of selectorParentGroup.
  const spg = svgroot.childNodes.item(2);
  assert.ok(spg);
  assert.equal(svgroot.querySelector('#selectorParentGroup'), spg);
  assert.equal(spg.id, 'selectorParentGroup');
  assert.equal(spg.tagName, 'g');

  // Verify existence of all grip elements.
  assert.ok(spg.querySelector('#selectorGrip_resize_nw'));
  assert.ok(spg.querySelector('#selectorGrip_resize_n'));
  assert.ok(spg.querySelector('#selectorGrip_resize_ne'));
  assert.ok(spg.querySelector('#selectorGrip_resize_e'));
  assert.ok(spg.querySelector('#selectorGrip_resize_se'));
  assert.ok(spg.querySelector('#selectorGrip_resize_s'));
  assert.ok(spg.querySelector('#selectorGrip_resize_sw'));
  assert.ok(spg.querySelector('#selectorGrip_resize_w'));
  assert.ok(spg.querySelector('#selectorGrip_rotateconnector'));
  assert.ok(spg.querySelector('#selectorGrip_rotate'));

  tearDown();
});
