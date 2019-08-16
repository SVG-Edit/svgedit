/* eslint-env qunit */

import '../editor/svgpathseg.js';
import SvgCanvas from '../editor/svgcanvas.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

// helper functions
/*
const isIdentity = function (m) {
  return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
};
const matrixString = function (m) {
  return [m.a, m.b, m.c, m.d, m.e, m.f].join(',');
};
*/

const svgCanvas = new SvgCanvas(
  document.getElementById('svgcanvas'), {
    canvas_expansion: 3,
    dimensions: [640, 480],
    initFill: {
      color: 'FF0000', // solid red
      opacity: 1
    },
    initStroke: {
      width: 5,
      color: '000000', // solid black
      opacity: 1
    },
    initOpacity: 1,
    imgPath: '../editor/images/',
    langPath: 'locale/',
    extPath: 'extensions/',
    extensions: ['ext-arrows.js', 'ext-connector.js', 'ext-eyedropper.js'],
    initTool: 'select',
    wireframe: false
  }
);

const
  // svgroot = document.getElementById('svgroot'),
  // svgdoc = svgroot.documentElement,
  svgns = 'http://www.w3.org/2000/svg',
  xlinkns = 'http://www.w3.org/1999/xlink';

QUnit.module('Basic Module');

QUnit.test('Test existence of SvgCanvas object', function (assert) {
  assert.expect(1);
  assert.equal(typeof {}, typeof svgCanvas);
});

QUnit.module('Path Module');

QUnit.test('Test path conversion from absolute to relative', function (assert) {
  assert.expect(6);
  const convert = svgCanvas.pathActions.convertPath;

  // TODO: Test these paths:
  // "m400.00491,625.01379a1.78688,1.78688 0 1 1-3.57373,0a1.78688,1.78688 0 1 13.57373,0z"
  // "m36.812,15.8566c-28.03099,0 -26.28099,12.15601 -26.28099,12.15601l0.03099,12.59399h26.75v3.781h-37.37399c0,0 -17.938,-2.034 -133.00001,26.25c115.06201,28.284 130.71801,27.281 130.71801,27.281h9.34399v-13.125c0,0 -0.504,-15.656 15.40601,-15.656h26.532c0,0 14.90599,0.241 14.90599,-14.406v-24.219c0,0 2.263,-14.65601 -27.032,-14.65601zm-14.75,8.4684c2.662,0 4.813,2.151 4.813,4.813c0,2.661 -2.151,4.812 -4.813,4.812c-2.661,0 -4.812,-2.151 -4.812,-4.812c0,-2.662 2.151,-4.813 4.812,-4.813z"
  // "m 0,0 l 200,0 l 0,100 L 0,100"

  svgCanvas.setSvgString(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' x='300'>" +
      "<path id='p1' d='M100,100 L200,100 L100,100Z'/>" +
      "<path id='p2' d='m 0,0 l 200,0 l 0,100 L 0,100'/>" +
    '</svg>'
  );

  const p1 = document.getElementById('p1'),
    p2 = document.getElementById('p2'),
    dAbs = p1.getAttribute('d'),
    seglist = p1.pathSegList;

  assert.equal(p1.nodeName, 'path', "Expected 'path', got");

  assert.equal(seglist.numberOfItems, 4, 'Number of segments before conversion');

  // verify segments before conversion
  let curseg = seglist.getItem(0);
  assert.equal(curseg.pathSegTypeAsLetter.toUpperCase(), 'M', 'Before conversion, segment #1 type');
  curseg = seglist.getItem(1);
  assert.equal(curseg.pathSegTypeAsLetter.toUpperCase(), 'L', 'Before conversion, segment #2 type');
  curseg = seglist.getItem(3);
  assert.equal(curseg.pathSegTypeAsLetter.toUpperCase(), 'Z', 'Before conversion, segment #3 type' + dAbs);

  // convert and verify segments
  let d = convert(p1, true);
  assert.equal(d, 'm100,100l100,0l-100,0z', 'Converted path to relative string');

  // TODO: see why this isn't working in SVG-edit
  d = convert(p2, true);
  console.log('Convert true', d);
  d = convert(p2, false);
  console.log('Convert false', d);
});

QUnit.module('Import Module');

QUnit.test('Test import use', function (assert) {
  assert.expect(3);

  svgCanvas.setSvgString(
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='400' x='300'>" +
      "<rect id='the-rect' width='200' height='200'/>" +
      "<use id='the-use' xlink:href='#the-rect'/>" +
      "<use id='foreign-use' xlink:href='somefile.svg#the-rect'/>" +
      "<use id='no-use'/>" +
    '</svg>'
  );

  const u = document.getElementById('the-use'),
    fu = document.getElementById('foreign-use'),
    nfu = document.getElementById('no-use');

  assert.equal((u && u.nodeName === 'use'), true, 'Did not import <use> element');
  assert.equal(fu, null, 'Removed <use> element that had a foreign href');
  assert.equal(nfu, null, 'Removed <use> element that had no href');
});

// This test shows that an element with an invalid attribute is still parsed in properly
// and only the attribute is not imported
QUnit.test('Test invalid attribute', function (assert) {
  assert.expect(2);

  svgCanvas.setSvgString(
    '<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">' +
      '<text x="182.75" y="173.5" id="the-text" fill="#008000" font-size="150" font-family="serif" text-anchor="middle" d="M116,222 L110,108">words</text>' +
    '</svg>'
  );

  const t = document.getElementById('the-text');

  assert.equal((t && t.nodeName === 'text'), true, 'Did not import <text> element');
  assert.equal(t.getAttribute('d'), null, 'Imported a <text> with a d attribute');
});

// This test makes sure import/export properly handles namespaced attributes
QUnit.test('Test importing/exporting namespaced attributes', function (assert) {
  assert.expect(5);
  /* const setStr = */ svgCanvas.setSvgString(
    '<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:se="http://svg-edit.googlecode.com" xmlns:foo="http://example.com">' +
      '<image xlink:href="../editor/images/logo.png"/>' +
      '<polyline id="se_test_elem" se:foo="bar" foo:bar="baz"/>' +
    '</svg>'
  );
  const attrVal = document.getElementById('se_test_elem').getAttributeNS('http://svg-edit.googlecode.com', 'foo');

  assert.equal(attrVal === 'bar', true, 'Preserved namespaced attribute on import');
  //
  // console.log('getSvgString' in svgCanvas)

  const output = svgCanvas.getSvgString();
  // } catch(e) {console.log(e)}
  // console.log('output',output);
  const hasXlink = output.includes('xmlns:xlink="http://www.w3.org/1999/xlink"');
  const hasSe = output.includes('xmlns:se=');
  const hasFoo = output.includes('xmlns:foo=');
  const hasAttr = output.includes('se:foo="bar"');

  assert.equal(hasAttr, true, 'Preserved namespaced attribute on export');
  assert.equal(hasXlink, true, 'Included xlink: xmlns');
  assert.equal(hasSe, true, 'Included se: xmlns');
  assert.equal(hasFoo, false, 'Did not include foo: xmlns');
});

QUnit.test('Test import math elements inside a foreignObject', function (assert) {
  assert.expect(4);
  /* const set = */ svgCanvas.setSvgString(
    '<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:se="http://svg-edit.googlecode.com" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<foreignObject id="fo" width="24" height="26" font-size="24"><math id="m" display="inline" xmlns="http://www.w3.org/1998/Math/MathML">' +
          '<msub>' +
            '<mi>A</mi>' +
            '<mn>0</mn>' +
          '</msub>' +
        '</math>' +
      '</foreignObject>' +
    '</svg>'
  );
  const fo = document.getElementById('fo');
  // we cannot use getElementById('math') because not all browsers understand MathML and do not know to use the @id attribute
  // see Bug https://bugs.webkit.org/show_bug.cgi?id=35042
  const math = fo.firstChild;

  assert.equal(Boolean(math), true, 'Math element exists');
  assert.equal(math.nodeName, 'math', 'Math element has the proper nodeName');
  assert.equal(math.getAttribute('id'), 'm', 'Math element has an id');
  assert.equal(math.namespaceURI, 'http://www.w3.org/1998/Math/MathML', 'Preserved MathML namespace');
});

QUnit.test('Test importing SVG into existing drawing', function (assert) {
  assert.expect(3);

  /* const doc = */ svgCanvas.setSvgString(
    '<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">' +
      '<g><title>Layer 1</title>' +
        '<circle cx="200" cy="200" r="50" fill="blue"/>' +
        '<ellipse cx="300" cy="100" rx="40" ry="30" fill="green"/>' +
      '</g>' +
    '</svg>'
  );

  svgCanvas.importSvgString(
    '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="50" cy="50" r="40" fill="yellow"/>' +
      '<rect width="20" height="20" fill="blue"/>' +
    '</svg>'
  );

  const svgcontent = document.getElementById('svgcontent'),
    circles = svgcontent.getElementsByTagNameNS(svgns, 'circle'),
    rects = svgcontent.getElementsByTagNameNS(svgns, 'rect'),
    ellipses = svgcontent.getElementsByTagNameNS(svgns, 'ellipse');
  assert.equal(circles.length, 2, 'Found two circles upon importing');
  assert.equal(rects.length, 1, 'Found one rectangle upon importing');
  assert.equal(ellipses.length, 1, 'Found one ellipse upon importing');
});

QUnit.test('Test importing SVG remaps IDs', function (assert) {
  assert.expect(6);

  /* const doc = */ svgCanvas.setSvgString(
    '<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">' +
      '<g><title>Layer 1</title>' +
        '<ellipse id="svg_1" cx="200" cy="200" rx="50" ry="20" fill="blue"/>' +
        '<ellipse id="svg_2" cx="300" cy="100" rx="40" ry="30" fill="green"/>' +
        '<ellipse id="svg_3" cx="300" cy="100" rx="40" ry="30" fill="green"/>' +
      '</g>' +
    '</svg>'
  );

  svgCanvas.importSvgString(
    '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" xmlns:xl="http://www.w3.org/1999/xlink">' +
      '<defs>' +
        '<linearGradient id="svg_2">' +
          '<stop stop-color="red" offset="0"/>' +
          '<stop stop-color="green" offset="1"/>' +
        '</linearGradient>' +
        '<rect id="svg_3" width="20" height="20" fill="blue" stroke="url(#svg_2)"/>' +
      '</defs>' +
      '<circle id="svg_1" cx="50" cy="50" r="40" fill="url(#svg_2)"/>' +
      '<use id="svg_4" width="30" height="30" xl:href="#svg_3"/>' +
    '</svg>'
  );

  const svgcontent = document.getElementById('svgcontent'),
    circles = svgcontent.getElementsByTagNameNS(svgns, 'circle'),
    rects = svgcontent.getElementsByTagNameNS(svgns, 'rect'),
    // ellipses = svgcontent.getElementsByTagNameNS(svgns, 'ellipse'),
    defs = svgcontent.getElementsByTagNameNS(svgns, 'defs'),
    // grads = svgcontent.getElementsByTagNameNS(svgns, 'linearGradient'),
    uses = svgcontent.getElementsByTagNameNS(svgns, 'use');
  assert.notEqual(circles.item(0).id, 'svg_1', 'Circle not re-identified');
  assert.notEqual(rects.item(0).id, 'svg_3', 'Rectangle not re-identified');
  // TODO: determine why this test fails in WebKit browsers
  // assert.equal(grads.length, 1, 'Linear gradient imported');
  const grad = defs.item(0).firstChild;
  assert.notEqual(grad.id, 'svg_2', 'Linear gradient not re-identified');
  assert.notEqual(circles.item(0).getAttribute('fill'), 'url(#svg_2)', 'Circle fill value not remapped');
  assert.notEqual(rects.item(0).getAttribute('stroke'), 'url(#svg_2)', 'Rectangle stroke value not remapped');
  assert.notEqual(uses.item(0).getAttributeNS(xlinkns, 'href'), '#svg_3');
});
