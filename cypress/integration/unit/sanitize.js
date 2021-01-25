import '../../../instrumented/editor/jquery.min.js';

import {NS} from '../../../instrumented/common/namespaces.js';
import * as sanitize from '../../../instrumented/svgcanvas/sanitize.js';

describe('sanitize', function () {
  const svg = document.createElementNS(NS.SVG, 'svg');

  it('Test sanitizeSvg() strips ws from style attr', function () {
    const rect = document.createElementNS(NS.SVG, 'rect');
    rect.setAttribute('style', 'stroke: blue ;\t\tstroke-width :\t\t40;');
    // sanitizeSvg() requires the node to have a parent and a document.
    svg.append(rect);
    sanitize.sanitizeSvg(rect);

    assert.equal(rect.getAttribute('stroke'), 'blue');
    assert.equal(rect.getAttribute('stroke-width'), '40');
  });

  it('Test sanitizeSvg() does not strip letter-spacing attribute from text', function () {
    const text = document.createElementNS(NS.SVG, 'text');
    text.setAttribute('letter-spacing', '150');
    svg.append(text);

    sanitize.sanitizeSvg(text);

    assert.equal(text.getAttribute('letter-spacing'), '150');
  });

  it('Test sanitizeSvg() does not strip text-anchor attribute from text', function () {
    const text = document.createElementNS(NS.SVG, 'text');
    text.setAttribute('text-anchor', 'end');
    svg.append(text);

    sanitize.sanitizeSvg(text);

    assert.equal(text.getAttribute('text-anchor'), 'end');
  });

  it('Test sanitizeSvg() does not strip text-decoration attribute from text', function () {
    const text = document.createElementNS(NS.SVG, 'text');
    text.setAttribute('text-decoration', 'underline');
    svg.append(text);

    sanitize.sanitizeSvg(text);

    assert.equal(text.getAttribute('text-decoration'), 'underline');
  });

  it('Test sanitizeSvg() does not strip word-spacing attribute from text', function () {
    const text = document.createElementNS(NS.SVG, 'text');
    text.setAttribute('word-spacing', '10');
    svg.append(text);

    sanitize.sanitizeSvg(text);

    assert.equal(text.getAttribute('word-spacing'), '10');
  });
});
