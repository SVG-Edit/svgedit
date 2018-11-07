/* eslint-env qunit */
import {NS} from '../editor/namespaces.js';
import * as draw from '../editor/draw.js';
import * as units from '../editor/units.js';

import sinon from '../node_modules/sinon/pkg/sinon-esm.js';
import sinonTest from '../node_modules/sinon-test/dist/sinon-test-es.js';
import sinonQunit from './sinon/sinon-qunit.js';

sinon.test = sinonTest(sinon, {
  injectIntoThis: true,
  injectInto: null,
  properties: ['spy', 'stub', 'mock', 'clock', 'sandbox'],
  useFakeTimers: false,
  useFakeServer: false
});
sinonQunit({sinon, QUnit});

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const LAYER_CLASS = draw.Layer.CLASS_NAME;
const NONCE = 'foo';
const LAYER1 = 'Layer 1';
const LAYER2 = 'Layer 2';
const LAYER3 = 'Layer 3';
const PATH_ATTR = {
  // clone will convert relative to absolute, so the test for equality fails.
  // d:    'm7.38867,57.38867c0,-27.62431 22.37569,-50 50,-50c27.62431,0 50,22.37569 50,50c0,27.62431 -22.37569,50 -50,50c-27.62431,0 -50,-22.37569 -50,-50z',
  d: 'M7.389,57.389C7.389,29.764 29.764,7.389 57.389,7.389C85.013,7.389 107.389,29.764 107.389,57.389C107.389,85.013 85.013,107.389 57.389,107.389C29.764,107.389 7.389,85.013 7.389,57.389z',
  transform: 'rotate(45 57.388671875000036,57.388671874999986) ',
  'stroke-width': '5',
  stroke: '#660000',
  fill: '#ff0000'
};

const svg = document.createElementNS(NS.SVG, 'svg');
const sandbox = document.getElementById('sandbox');
// Firefox throws exception in getBBox() when svg is not attached to DOM.
sandbox.append(svg);

// Set up <svg> with nonce.
const svgN = document.createElementNS(NS.SVG, 'svg');
svgN.setAttributeNS(NS.XMLNS, 'xmlns:se', NS.SE);
svgN.setAttributeNS(NS.SE, 'se:nonce', NONCE);

units.init(
  /**
  * @implements {module:units.ElementContainer}
  */
  {
    // used by units.shortFloat - call path: cloneLayer -> copyElem -> convertPath -> pathDSegment -> shortFloat
    getRoundDigits () { return 3; }
  }
);

// Simplifying from svgcanvas.js usage
const idprefix = 'svg_';
const svgcontent = document.createElementNS(NS.SVG, 'svg');
const currentDrawing_ = new draw.Drawing(svgcontent, idprefix);
const getCurrentDrawing = function () {
  return currentDrawing_;
};
const setCurrentGroup = (cg) => { /* */ };
draw.init(
  /**
  * @implements {module:draw.DrawCanvasInit}
  */
  {
    getCurrentDrawing,
    setCurrentGroup
  }
);

/**
 * @param {module:utilities.SVGElementJSON} jsonMap
 * @returns {SVGElement}
 */
function createSVGElement (jsonMap) {
  const elem = document.createElementNS(NS.SVG, jsonMap.element);
  Object.entries(jsonMap.attr).forEach(([attr, value]) => {
    elem.setAttribute(attr, value);
  });
  return elem;
}

const setupSVGWith3Layers = function (svgElem) {
  const layer1 = document.createElementNS(NS.SVG, 'g');
  const layer1Title = document.createElementNS(NS.SVG, 'title');
  layer1Title.append(document.createTextNode(LAYER1));
  layer1.append(layer1Title);
  svgElem.append(layer1);

  const layer2 = document.createElementNS(NS.SVG, 'g');
  const layer2Title = document.createElementNS(NS.SVG, 'title');
  layer2Title.append(document.createTextNode(LAYER2));
  layer2.append(layer2Title);
  svgElem.append(layer2);

  const layer3 = document.createElementNS(NS.SVG, 'g');
  const layer3Title = document.createElementNS(NS.SVG, 'title');
  layer3Title.append(document.createTextNode(LAYER3));
  layer3.append(layer3Title);
  svgElem.append(layer3);

  return [layer1, layer2, layer3];
};

const createSomeElementsInGroup = function (group) {
  group.append(
    createSVGElement({
      element: 'path',
      attr: PATH_ATTR
    }),
    // createSVGElement({
    //    element: 'path',
    //    attr: {d: 'M0,1L2,3'}
    // }),
    createSVGElement({
      element: 'rect',
      attr: {x: '0', y: '1', width: '5', height: '10'}
    }),
    createSVGElement({
      element: 'line',
      attr: {x1: '0', y1: '1', x2: '5', y2: '6'}
    })
  );

  const g = createSVGElement({
    element: 'g',
    attr: {}
  });
  g.append(createSVGElement({
    element: 'rect',
    attr: {x: '0', y: '1', width: '5', height: '10'}
  }));
  group.append(g);
  return 4;
};

const cleanupSVG = function (svgElem) {
  while (svgElem.firstChild) { svgElem.firstChild.remove(); }
};

QUnit.module('svgedit.draw.Drawing');

QUnit.test('Test draw module', function (assert) {
  assert.expect(4);

  assert.ok(draw);
  assert.equal(typeof draw, typeof {});

  assert.ok(draw.Drawing);
  assert.equal(typeof draw.Drawing, typeof function () { /* */ });
});

QUnit.test('Test document creation', function (assert) {
  assert.expect(3);

  let doc;
  try {
    doc = new draw.Drawing();
    assert.ok(false, 'Created drawing without a valid <svg> element');
  } catch (e) {
    assert.ok(true);
  }

  try {
    doc = new draw.Drawing(svg);
    assert.ok(doc);
    assert.equal(typeof doc, typeof {});
  } catch (e) {
    assert.ok(false, 'Could not create document from valid <svg> element: ' + e);
  }
});

QUnit.test('Test nonce', function (assert) {
  assert.expect(7);

  let doc = new draw.Drawing(svg);
  assert.equal(doc.getNonce(), '');

  doc = new draw.Drawing(svgN);
  assert.equal(doc.getNonce(), NONCE);
  assert.equal(doc.getSvgElem().getAttributeNS(NS.SE, 'nonce'), NONCE);

  doc.clearNonce();
  assert.ok(!doc.getNonce());
  assert.ok(!doc.getSvgElem().getAttributeNS(NS.SE, 'se:nonce'));

  doc.setNonce(NONCE);
  assert.equal(doc.getNonce(), NONCE);
  assert.equal(doc.getSvgElem().getAttributeNS(NS.SE, 'nonce'), NONCE);
});

QUnit.test('Test getId() and getNextId() without nonce', function (assert) {
  assert.expect(7);

  const elem2 = document.createElementNS(NS.SVG, 'circle');
  elem2.id = 'svg_2';
  svg.append(elem2);

  const doc = new draw.Drawing(svg);

  assert.equal(doc.getId(), 'svg_0');

  assert.equal(doc.getNextId(), 'svg_1');
  assert.equal(doc.getId(), 'svg_1');

  assert.equal(doc.getNextId(), 'svg_3');
  assert.equal(doc.getId(), 'svg_3');

  assert.equal(doc.getNextId(), 'svg_4');
  assert.equal(doc.getId(), 'svg_4');
  // clean out svg document
  cleanupSVG(svg);
});

QUnit.test('Test getId() and getNextId() with prefix without nonce', function (assert) {
  assert.expect(7);

  const prefix = 'Bar-';
  const doc = new draw.Drawing(svg, prefix);

  assert.equal(doc.getId(), prefix + '0');

  assert.equal(doc.getNextId(), prefix + '1');
  assert.equal(doc.getId(), prefix + '1');

  assert.equal(doc.getNextId(), prefix + '2');
  assert.equal(doc.getId(), prefix + '2');

  assert.equal(doc.getNextId(), prefix + '3');
  assert.equal(doc.getId(), prefix + '3');

  cleanupSVG(svg);
});

QUnit.test('Test getId() and getNextId() with nonce', function (assert) {
  assert.expect(7);

  const prefix = 'svg_' + NONCE;

  const elem2 = document.createElementNS(NS.SVG, 'circle');
  elem2.id = prefix + '_2';
  svgN.append(elem2);

  const doc = new draw.Drawing(svgN);

  assert.equal(doc.getId(), prefix + '_0');

  assert.equal(doc.getNextId(), prefix + '_1');
  assert.equal(doc.getId(), prefix + '_1');

  assert.equal(doc.getNextId(), prefix + '_3');
  assert.equal(doc.getId(), prefix + '_3');

  assert.equal(doc.getNextId(), prefix + '_4');
  assert.equal(doc.getId(), prefix + '_4');

  cleanupSVG(svgN);
});

QUnit.test('Test getId() and getNextId() with prefix with nonce', function (assert) {
  assert.expect(7);

  const PREFIX = 'Bar-';
  const doc = new draw.Drawing(svgN, PREFIX);

  const prefix = PREFIX + NONCE + '_';
  assert.equal(doc.getId(), prefix + '0');

  assert.equal(doc.getNextId(), prefix + '1');
  assert.equal(doc.getId(), prefix + '1');

  assert.equal(doc.getNextId(), prefix + '2');
  assert.equal(doc.getId(), prefix + '2');

  assert.equal(doc.getNextId(), prefix + '3');
  assert.equal(doc.getId(), prefix + '3');

  cleanupSVG(svgN);
});

QUnit.test('Test releaseId()', function (assert) {
  assert.expect(6);

  const doc = new draw.Drawing(svg);

  const firstId = doc.getNextId();
  /* const secondId = */ doc.getNextId();

  const result = doc.releaseId(firstId);
  assert.ok(result);
  assert.equal(doc.getNextId(), firstId);
  assert.equal(doc.getNextId(), 'svg_3');

  assert.ok(!doc.releaseId('bad-id'));
  assert.ok(doc.releaseId(firstId));
  assert.ok(!doc.releaseId(firstId));

  cleanupSVG(svg);
});

QUnit.test('Test getNumLayers', function (assert) {
  assert.expect(3);
  const drawing = new draw.Drawing(svg);
  assert.equal(typeof drawing.getNumLayers, typeof function () { /* */ });
  assert.equal(drawing.getNumLayers(), 0);

  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.equal(drawing.getNumLayers(), 3);

  cleanupSVG(svg);
});

QUnit.test('Test hasLayer', function (assert) {
  assert.expect(5);

  setupSVGWith3Layers(svg);
  const drawing = new draw.Drawing(svg);
  drawing.identifyLayers();

  assert.equal(typeof drawing.hasLayer, typeof function () { /* */ });
  assert.ok(!drawing.hasLayer('invalid-layer'));

  assert.ok(drawing.hasLayer(LAYER3));
  assert.ok(drawing.hasLayer(LAYER2));
  assert.ok(drawing.hasLayer(LAYER1));

  cleanupSVG(svg);
});

QUnit.test('Test identifyLayers() with empty document', function (assert) {
  assert.expect(11);

  const drawing = new draw.Drawing(svg);
  assert.equal(drawing.getCurrentLayer(), null);
  // By default, an empty document gets an empty group created.
  drawing.identifyLayers();

  // Check that <svg> element now has one child node
  assert.ok(drawing.getSvgElem().hasChildNodes());
  assert.equal(drawing.getSvgElem().childNodes.length, 1);

  // Check that all_layers are correctly set up.
  assert.equal(drawing.getNumLayers(), 1);
  const emptyLayer = drawing.all_layers[0];
  assert.ok(emptyLayer);
  const layerGroup = emptyLayer.getGroup();
  assert.equal(layerGroup, drawing.getSvgElem().firstChild);
  assert.equal(layerGroup.tagName, 'g');
  assert.equal(layerGroup.getAttribute('class'), LAYER_CLASS);
  assert.ok(layerGroup.hasChildNodes());
  assert.equal(layerGroup.childNodes.length, 1);
  const firstChild = layerGroup.childNodes.item(0);
  assert.equal(firstChild.tagName, 'title');

  cleanupSVG(svg);
});

QUnit.test('Test identifyLayers() with some layers', function (assert) {
  assert.expect(8);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);

  assert.equal(svg.childNodes.length, 3);

  drawing.identifyLayers();

  assert.equal(drawing.getNumLayers(), 3);
  assert.equal(drawing.all_layers[0].getGroup(), svg.childNodes.item(0));
  assert.equal(drawing.all_layers[1].getGroup(), svg.childNodes.item(1));
  assert.equal(drawing.all_layers[2].getGroup(), svg.childNodes.item(2));

  assert.equal(drawing.all_layers[0].getGroup().getAttribute('class'), LAYER_CLASS);
  assert.equal(drawing.all_layers[1].getGroup().getAttribute('class'), LAYER_CLASS);
  assert.equal(drawing.all_layers[2].getGroup().getAttribute('class'), LAYER_CLASS);

  cleanupSVG(svg);
});

QUnit.test('Test identifyLayers() with some layers and orphans', function (assert) {
  assert.expect(14);

  setupSVGWith3Layers(svg);

  const orphan1 = document.createElementNS(NS.SVG, 'rect');
  const orphan2 = document.createElementNS(NS.SVG, 'rect');
  svg.append(orphan1, orphan2);

  assert.equal(svg.childNodes.length, 5);

  const drawing = new draw.Drawing(svg);
  drawing.identifyLayers();

  assert.equal(drawing.getNumLayers(), 4);
  assert.equal(drawing.all_layers[0].getGroup(), svg.childNodes.item(0));
  assert.equal(drawing.all_layers[1].getGroup(), svg.childNodes.item(1));
  assert.equal(drawing.all_layers[2].getGroup(), svg.childNodes.item(2));
  assert.equal(drawing.all_layers[3].getGroup(), svg.childNodes.item(3));

  assert.equal(drawing.all_layers[0].getGroup().getAttribute('class'), LAYER_CLASS);
  assert.equal(drawing.all_layers[1].getGroup().getAttribute('class'), LAYER_CLASS);
  assert.equal(drawing.all_layers[2].getGroup().getAttribute('class'), LAYER_CLASS);
  assert.equal(drawing.all_layers[3].getGroup().getAttribute('class'), LAYER_CLASS);

  const layer4 = drawing.all_layers[3].getGroup();
  assert.equal(layer4.tagName, 'g');
  assert.equal(layer4.childNodes.length, 3);
  assert.equal(layer4.childNodes.item(1), orphan1);
  assert.equal(layer4.childNodes.item(2), orphan2);

  cleanupSVG(svg);
});

QUnit.test('Test getLayerName()', function (assert) {
  assert.expect(4);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);

  drawing.identifyLayers();

  assert.equal(drawing.getNumLayers(), 3);
  assert.equal(drawing.getLayerName(0), LAYER1);
  assert.equal(drawing.getLayerName(1), LAYER2);
  assert.equal(drawing.getLayerName(2), LAYER3);

  cleanupSVG(svg);
});

QUnit.test('Test getCurrentLayer()', function (assert) {
  assert.expect(4);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.getCurrentLayer);
  assert.equal(typeof drawing.getCurrentLayer, typeof function () { /* */ });
  assert.ok(drawing.getCurrentLayer());
  assert.equal(drawing.getCurrentLayer(), drawing.all_layers[2].getGroup());

  cleanupSVG(svg);
});

QUnit.test('Test setCurrentLayer() and getCurrentLayerName()', function (assert) {
  assert.expect(6);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.setCurrentLayer);
  assert.equal(typeof drawing.setCurrentLayer, typeof function () { /* */ });

  drawing.setCurrentLayer(LAYER2);
  assert.equal(drawing.getCurrentLayerName(), LAYER2);
  assert.equal(drawing.getCurrentLayer(), drawing.all_layers[1].getGroup());

  drawing.setCurrentLayer(LAYER3);
  assert.equal(drawing.getCurrentLayerName(), LAYER3);
  assert.equal(drawing.getCurrentLayer(), drawing.all_layers[2].getGroup());

  cleanupSVG(svg);
});

QUnit.test('Test setCurrentLayerName()', function (assert) {
  const mockHrService = {
    changeElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.setCurrentLayerName);
  assert.equal(typeof drawing.setCurrentLayerName, typeof function () { /* */ });

  const oldName = drawing.getCurrentLayerName();
  const newName = 'New Name';
  assert.ok(drawing.layer_map[oldName]);
  assert.equal(drawing.layer_map[newName], undefined); // newName shouldn't exist.
  const result = drawing.setCurrentLayerName(newName, mockHrService);
  assert.equal(result, newName);
  assert.equal(drawing.getCurrentLayerName(), newName);
  // Was the map updated?
  assert.equal(drawing.layer_map[oldName], undefined);
  assert.equal(drawing.layer_map[newName], drawing.current_layer);
  // Was mockHrService called?
  assert.ok(mockHrService.changeElement.calledOnce);
  assert.equal(oldName, mockHrService.changeElement.getCall(0).args[1]['#text']);
  assert.equal(newName, mockHrService.changeElement.getCall(0).args[0].textContent);

  cleanupSVG(svg);
});

QUnit.test('Test createLayer()', function (assert) {
  assert.expect(10);

  const mockHrService = {
    startBatchCommand: this.spy(),
    endBatchCommand: this.spy(),
    insertElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.createLayer);
  assert.equal(typeof drawing.createLayer, typeof function () { /* */ });

  const NEW_LAYER_NAME = 'Layer A';
  const layerG = drawing.createLayer(NEW_LAYER_NAME, mockHrService);
  assert.equal(drawing.getNumLayers(), 4);
  assert.equal(layerG, drawing.getCurrentLayer());
  assert.equal(layerG.getAttribute('class'), LAYER_CLASS);
  assert.equal(NEW_LAYER_NAME, drawing.getCurrentLayerName());
  assert.equal(NEW_LAYER_NAME, drawing.getLayerName(3));

  assert.equal(layerG, mockHrService.insertElement.getCall(0).args[0]);
  assert.ok(mockHrService.startBatchCommand.calledOnce);
  assert.ok(mockHrService.endBatchCommand.calledOnce);

  cleanupSVG(svg);
});

QUnit.test('Test mergeLayer()', function (assert) {
  const mockHrService = {
    startBatchCommand: this.spy(),
    endBatchCommand: this.spy(),
    moveElement: this.spy(),
    removeElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  const layers = setupSVGWith3Layers(svg);
  const elementCount = createSomeElementsInGroup(layers[2]) + 1; // +1 for title element
  assert.equal(layers[1].childElementCount, 1);
  assert.equal(layers[2].childElementCount, elementCount);
  drawing.identifyLayers();
  assert.equal(drawing.getCurrentLayer(), layers[2]);

  assert.ok(drawing.mergeLayer);
  assert.equal(typeof drawing.mergeLayer, typeof function () { /* */ });

  drawing.mergeLayer(mockHrService);

  assert.equal(drawing.getNumLayers(), 2);
  assert.equal(svg.childElementCount, 2);
  assert.equal(drawing.getCurrentLayer(), layers[1]);
  assert.equal(layers[1].childElementCount, elementCount);

  // check history record
  assert.ok(mockHrService.startBatchCommand.calledOnce);
  assert.ok(mockHrService.endBatchCommand.calledOnce);
  assert.equal(mockHrService.startBatchCommand.getCall(0).args[0], 'Merge Layer');
  assert.equal(mockHrService.moveElement.callCount, elementCount - 1); // -1 because the title was not moved.
  assert.equal(mockHrService.removeElement.callCount, 2); // remove group and title.

  cleanupSVG(svg);
});

QUnit.test('Test mergeLayer() when no previous layer to merge', function (assert) {
  const mockHrService = {
    startBatchCommand: this.spy(),
    endBatchCommand: this.spy(),
    moveElement: this.spy(),
    removeElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  const layers = setupSVGWith3Layers(svg);
  drawing.identifyLayers();
  drawing.setCurrentLayer(LAYER1);
  assert.equal(drawing.getCurrentLayer(), layers[0]);

  drawing.mergeLayer(mockHrService);

  assert.equal(drawing.getNumLayers(), 3);
  assert.equal(svg.childElementCount, 3);
  assert.equal(drawing.getCurrentLayer(), layers[0]);
  assert.equal(layers[0].childElementCount, 1);
  assert.equal(layers[1].childElementCount, 1);
  assert.equal(layers[2].childElementCount, 1);

  // check history record
  assert.equal(mockHrService.startBatchCommand.callCount, 0);
  assert.equal(mockHrService.endBatchCommand.callCount, 0);
  assert.equal(mockHrService.moveElement.callCount, 0);
  assert.equal(mockHrService.removeElement.callCount, 0);

  cleanupSVG(svg);
});

QUnit.test('Test mergeAllLayers()', function (assert) {
  const mockHrService = {
    startBatchCommand: this.spy(),
    endBatchCommand: this.spy(),
    moveElement: this.spy(),
    removeElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  const layers = setupSVGWith3Layers(svg);
  const elementCount = createSomeElementsInGroup(layers[0]) + 1; // +1 for title element
  createSomeElementsInGroup(layers[1]);
  createSomeElementsInGroup(layers[2]);
  assert.equal(layers[0].childElementCount, elementCount);
  assert.equal(layers[1].childElementCount, elementCount);
  assert.equal(layers[2].childElementCount, elementCount);
  drawing.identifyLayers();

  assert.ok(drawing.mergeAllLayers);
  assert.equal(typeof drawing.mergeAllLayers, typeof function () { /* */ });

  drawing.mergeAllLayers(mockHrService);

  assert.equal(drawing.getNumLayers(), 1);
  assert.equal(svg.childElementCount, 1);
  assert.equal(drawing.getCurrentLayer(), layers[0]);
  assert.equal(layers[0].childElementCount, elementCount * 3 - 2); // -2 because two titles were deleted.

  // check history record
  assert.equal(mockHrService.startBatchCommand.callCount, 3); // mergeAllLayers + 2 * mergeLayer
  assert.equal(mockHrService.endBatchCommand.callCount, 3);
  assert.equal(mockHrService.startBatchCommand.getCall(0).args[0], 'Merge all Layers');
  assert.equal(mockHrService.startBatchCommand.getCall(1).args[0], 'Merge Layer');
  assert.equal(mockHrService.startBatchCommand.getCall(2).args[0], 'Merge Layer');
  // moveElement count is times 3 instead of 2, because one layer's elements were moved twice.
  // moveElement count is minus 3 because the three titles were not moved.
  assert.equal(mockHrService.moveElement.callCount, elementCount * 3 - 3);
  assert.equal(mockHrService.removeElement.callCount, 2 * 2); // remove group and title twice.

  cleanupSVG(svg);
});

QUnit.test('Test cloneLayer()', function (assert) {
  const mockHrService = {
    startBatchCommand: this.spy(),
    endBatchCommand: this.spy(),
    insertElement: this.spy()
  };

  const drawing = new draw.Drawing(svg);
  const layers = setupSVGWith3Layers(svg);
  const layer3 = layers[2];
  const elementCount = createSomeElementsInGroup(layer3) + 1; // +1 for title element
  assert.equal(layer3.childElementCount, elementCount);
  drawing.identifyLayers();

  assert.ok(drawing.cloneLayer);
  assert.equal(typeof drawing.cloneLayer, typeof function () { /* */ });

  const clone = drawing.cloneLayer('clone', mockHrService);

  assert.equal(drawing.getNumLayers(), 4);
  assert.equal(svg.childElementCount, 4);
  assert.equal(drawing.getCurrentLayer(), clone);
  assert.equal(clone.childElementCount, elementCount);

  // check history record
  assert.ok(mockHrService.startBatchCommand.calledOnce); // mergeAllLayers + 2 * mergeLayer
  assert.ok(mockHrService.endBatchCommand.calledOnce);
  assert.equal(mockHrService.startBatchCommand.getCall(0).args[0], 'Duplicate Layer');
  assert.equal(mockHrService.insertElement.callCount, 1);
  assert.equal(mockHrService.insertElement.getCall(0).args[0], clone);

  // check that path is cloned properly
  assert.equal(clone.childNodes.length, elementCount);
  const path = clone.childNodes[1];
  assert.equal(path.id, 'svg_1');
  assert.equal(path.getAttribute('d'), PATH_ATTR.d);
  assert.equal(path.getAttribute('transform'), PATH_ATTR.transform);
  assert.equal(path.getAttribute('fill'), PATH_ATTR.fill);
  assert.equal(path.getAttribute('stroke'), PATH_ATTR.stroke);
  assert.equal(path.getAttribute('stroke-width'), PATH_ATTR['stroke-width']);

  // check that g is cloned properly
  const g = clone.childNodes[4];
  assert.equal(g.childNodes.length, 1);
  assert.equal(g.id, 'svg_4');

  cleanupSVG(svg);
});

QUnit.test('Test getLayerVisibility()', function (assert) {
  assert.expect(5);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.getLayerVisibility);
  assert.equal(typeof drawing.getLayerVisibility, typeof function () { /* */ });
  assert.ok(drawing.getLayerVisibility(LAYER1));
  assert.ok(drawing.getLayerVisibility(LAYER2));
  assert.ok(drawing.getLayerVisibility(LAYER3));

  cleanupSVG(svg);
});

QUnit.test('Test setLayerVisibility()', function (assert) {
  assert.expect(6);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.setLayerVisibility);
  assert.equal(typeof drawing.setLayerVisibility, typeof function () { /* */ });

  drawing.setLayerVisibility(LAYER3, false);
  drawing.setLayerVisibility(LAYER2, true);
  drawing.setLayerVisibility(LAYER1, false);

  assert.ok(!drawing.getLayerVisibility(LAYER1));
  assert.ok(drawing.getLayerVisibility(LAYER2));
  assert.ok(!drawing.getLayerVisibility(LAYER3));

  drawing.setLayerVisibility(LAYER3, 'test-string');
  assert.ok(!drawing.getLayerVisibility(LAYER3));

  cleanupSVG(svg);
});

QUnit.test('Test getLayerOpacity()', function (assert) {
  assert.expect(5);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.getLayerOpacity);
  assert.equal(typeof drawing.getLayerOpacity, typeof function () { /* */ });
  assert.strictEqual(drawing.getLayerOpacity(LAYER1), 1.0);
  assert.strictEqual(drawing.getLayerOpacity(LAYER2), 1.0);
  assert.strictEqual(drawing.getLayerOpacity(LAYER3), 1.0);

  cleanupSVG(svg);
});

QUnit.test('Test setLayerOpacity()', function (assert) {
  assert.expect(6);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  assert.ok(drawing.setLayerOpacity);
  assert.equal(typeof drawing.setLayerOpacity, typeof function () { /* */ });

  drawing.setLayerOpacity(LAYER1, 0.4);
  drawing.setLayerOpacity(LAYER2, 'invalid-string');
  drawing.setLayerOpacity(LAYER3, -1.4);

  assert.strictEqual(drawing.getLayerOpacity(LAYER1), 0.4);
  console.log('layer2 opacity ' + drawing.getLayerOpacity(LAYER2));
  assert.strictEqual(drawing.getLayerOpacity(LAYER2), 1.0);
  assert.strictEqual(drawing.getLayerOpacity(LAYER3), 1.0);

  drawing.setLayerOpacity(LAYER3, 100);
  assert.strictEqual(drawing.getLayerOpacity(LAYER3), 1.0);

  cleanupSVG(svg);
});

QUnit.test('Test deleteCurrentLayer()', function (assert) {
  assert.expect(6);

  const drawing = new draw.Drawing(svg);
  setupSVGWith3Layers(svg);
  drawing.identifyLayers();

  drawing.setCurrentLayer(LAYER2);

  const curLayer = drawing.getCurrentLayer();
  assert.equal(curLayer, drawing.all_layers[1].getGroup());
  const deletedLayer = drawing.deleteCurrentLayer();

  assert.equal(curLayer, deletedLayer);
  assert.equal(drawing.getNumLayers(), 2);
  assert.equal(LAYER1, drawing.all_layers[0].getName());
  assert.equal(LAYER3, drawing.all_layers[1].getName());
  assert.equal(drawing.getCurrentLayer(), drawing.all_layers[1].getGroup());
});

QUnit.test('Test svgedit.draw.randomizeIds()', function (assert) {
  assert.expect(9);

  // Confirm in LET_DOCUMENT_DECIDE mode that the document decides
  // if there is a nonce.
  let drawing = new draw.Drawing(svgN.cloneNode(true));
  assert.ok(drawing.getNonce());

  drawing = new draw.Drawing(svg.cloneNode(true));
  assert.ok(!drawing.getNonce());

  // Confirm that a nonce is set once we're in ALWAYS_RANDOMIZE mode.
  draw.randomizeIds(true, drawing);
  assert.ok(drawing.getNonce());

  // Confirm new drawings in ALWAYS_RANDOMIZE mode have a nonce.
  drawing = new draw.Drawing(svg.cloneNode(true));
  assert.ok(drawing.getNonce());

  drawing.clearNonce();
  assert.ok(!drawing.getNonce());

  // Confirm new drawings in NEVER_RANDOMIZE mode do not have a nonce
  // but that their se:nonce attribute is left alone.
  draw.randomizeIds(false, drawing);
  assert.ok(!drawing.getNonce());
  assert.ok(drawing.getSvgElem().getAttributeNS(NS.SE, 'nonce'));

  drawing = new draw.Drawing(svg.cloneNode(true));
  assert.ok(!drawing.getNonce());

  drawing = new draw.Drawing(svgN.cloneNode(true));
  assert.ok(!drawing.getNonce());
});
