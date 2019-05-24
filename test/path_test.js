/* eslint-env qunit */
/* globals SVGPathSeg */
import '../editor/svgpathseg.js';
import {NS} from '../editor/namespaces.js';
import * as utilities from '../editor/utilities.js';
import * as pathModule from '../editor/path.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

/**
* @typedef {GenericArray} EditorContexts
* @property {module:path.EditorContext} 0
* @property {module:path.EditorContext} 1
*/

/**
* @param {SVGSVGElement} [svg]
* @returns {EditorContexts}
*/
function getMockContexts (svg) {
  svg = svg || document.createElementNS(NS.SVG, 'svg');
  const selectorParentGroup = document.createElementNS(NS.SVG, 'g');
  selectorParentGroup.setAttribute('id', 'selectorParentGroup');
  svg.append(selectorParentGroup);
  return [
    /**
    * @implements {module:path.EditorContext}
    */
    {
      getSVGRoot () { return svg; },
      getCurrentZoom () { return 1; }
    },
    /**
    * @implements {module:utilities.EditorContext}
    */
    {
      getDOMDocument () { return svg; },
      getDOMContainer () { return svg; },
      getSVGRoot () { return svg; }
    }
  ];
}

QUnit.test('Test svgedit.path.replacePathSeg', function (assert) {
  assert.expect(6);

  const path = document.createElementNS(NS.SVG, 'path');
  path.setAttribute('d', 'M0,0 L10,11 L20,21Z');

  const [mockPathContext, mockUtilitiesContext] = getMockContexts();
  pathModule.init(mockPathContext);
  utilities.init(mockUtilitiesContext);
  new pathModule.Path(path); // eslint-disable-line no-new

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L');
  assert.equal(path.pathSegList.getItem(1).x, 10);
  assert.equal(path.pathSegList.getItem(1).y, 11);

  pathModule.replacePathSeg(SVGPathSeg.PATHSEG_LINETO_REL, 1, [30, 31], path);

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'l');
  assert.equal(path.pathSegList.getItem(1).x, 30);
  assert.equal(path.pathSegList.getItem(1).y, 31);
});

QUnit.test('Test svgedit.path.Segment.setType simple', function (assert) {
  assert.expect(9);

  const path = document.createElementNS(NS.SVG, 'path');
  path.setAttribute('d', 'M0,0 L10,11 L20,21Z');

  const [mockPathContext, mockUtilitiesContext] = getMockContexts();
  pathModule.init(mockPathContext);
  utilities.init(mockUtilitiesContext);
  new pathModule.Path(path); // eslint-disable-line no-new

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L');
  assert.equal(path.pathSegList.getItem(1).x, 10);
  assert.equal(path.pathSegList.getItem(1).y, 11);

  const segment = new pathModule.Segment(1, path.pathSegList.getItem(1));
  segment.setType(SVGPathSeg.PATHSEG_LINETO_REL, [30, 31]);
  assert.equal(segment.item.pathSegTypeAsLetter, 'l');
  assert.equal(segment.item.x, 30);
  assert.equal(segment.item.y, 31);

  // Also verify that the actual path changed.
  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'l');
  assert.equal(path.pathSegList.getItem(1).x, 30);
  assert.equal(path.pathSegList.getItem(1).y, 31);
});

QUnit.test('Test svgedit.path.Segment.setType with control points', function (assert) {
  assert.expect(14);

  // Setup the dom for a mock control group.
  const svg = document.createElementNS(NS.SVG, 'svg');
  const path = document.createElementNS(NS.SVG, 'path');
  path.setAttribute('d', 'M0,0 C11,12 13,14 15,16 Z');
  svg.append(path);

  const [mockPathContext, mockUtilitiesContext] = getMockContexts(svg);
  pathModule.init(mockPathContext);
  utilities.init(mockUtilitiesContext);
  const segment = new pathModule.Segment(1, path.pathSegList.getItem(1));
  segment.path = new pathModule.Path(path);

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C');
  assert.equal(path.pathSegList.getItem(1).x1, 11);
  assert.equal(path.pathSegList.getItem(1).y1, 12);
  assert.equal(path.pathSegList.getItem(1).x2, 13);
  assert.equal(path.pathSegList.getItem(1).y2, 14);
  assert.equal(path.pathSegList.getItem(1).x, 15);
  assert.equal(path.pathSegList.getItem(1).y, 16);

  segment.setType(SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL, [30, 31, 32, 33, 34, 35]);
  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'c');
  assert.equal(path.pathSegList.getItem(1).x1, 32);
  assert.equal(path.pathSegList.getItem(1).y1, 33);
  assert.equal(path.pathSegList.getItem(1).x2, 34);
  assert.equal(path.pathSegList.getItem(1).y2, 35);
  assert.equal(path.pathSegList.getItem(1).x, 30);
  assert.equal(path.pathSegList.getItem(1).y, 31);
});

QUnit.test('Test svgedit.path.Segment.move', function (assert) {
  assert.expect(6);

  const path = document.createElementNS(NS.SVG, 'path');
  path.setAttribute('d', 'M0,0 L10,11 L20,21Z');

  const [mockPathContext, mockUtilitiesContext] = getMockContexts();
  pathModule.init(mockPathContext);
  utilities.init(mockUtilitiesContext);
  new pathModule.Path(path); // eslint-disable-line no-new

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L');
  assert.equal(path.pathSegList.getItem(1).x, 10);
  assert.equal(path.pathSegList.getItem(1).y, 11);

  const segment = new pathModule.Segment(1, path.pathSegList.getItem(1));
  segment.move(-3, 4);
  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L');
  assert.equal(path.pathSegList.getItem(1).x, 7);
  assert.equal(path.pathSegList.getItem(1).y, 15);
});

QUnit.test('Test svgedit.path.Segment.moveCtrl', function (assert) {
  assert.expect(14);

  const path = document.createElementNS(NS.SVG, 'path');
  path.setAttribute('d', 'M0,0 C11,12 13,14 15,16 Z');

  const [mockPathContext, mockUtilitiesContext] = getMockContexts();
  pathModule.init(mockPathContext);
  utilities.init(mockUtilitiesContext);
  new pathModule.Path(path); // eslint-disable-line no-new

  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C');
  assert.equal(path.pathSegList.getItem(1).x1, 11);
  assert.equal(path.pathSegList.getItem(1).y1, 12);
  assert.equal(path.pathSegList.getItem(1).x2, 13);
  assert.equal(path.pathSegList.getItem(1).y2, 14);
  assert.equal(path.pathSegList.getItem(1).x, 15);
  assert.equal(path.pathSegList.getItem(1).y, 16);

  const segment = new pathModule.Segment(1, path.pathSegList.getItem(1));
  segment.moveCtrl(1, 100, -200);
  assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C');
  assert.equal(path.pathSegList.getItem(1).x1, 111);
  assert.equal(path.pathSegList.getItem(1).y1, -188);
  assert.equal(path.pathSegList.getItem(1).x2, 13);
  assert.equal(path.pathSegList.getItem(1).y2, 14);
  assert.equal(path.pathSegList.getItem(1).x, 15);
  assert.equal(path.pathSegList.getItem(1).y, 16);
});
