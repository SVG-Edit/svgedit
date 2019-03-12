/* eslint-env qunit */
import {NS} from '../editor/namespaces.js';
import * as sanitize from '../editor/sanitize.js';

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});

const svg = document.createElementNS(NS.SVG, 'svg');

QUnit.test('Test sanitizeSvg() strips ws from style attr', function (assert) {
  assert.expect(2);

  const rect = document.createElementNS(NS.SVG, 'rect');
  rect.setAttribute('style', 'stroke: blue ;\t\tstroke-width :\t\t40;');
  // sanitizeSvg() requires the node to have a parent and a document.
  svg.append(rect);
  sanitize.sanitizeSvg(rect);

  assert.equal(rect.getAttribute('stroke'), 'blue');
  assert.equal(rect.getAttribute('stroke-width'), '40');
});
