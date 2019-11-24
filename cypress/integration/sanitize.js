import '../../instrumented/jquery.min.js';

import {NS} from '../../instrumented/namespaces.js';
import * as sanitize from '../../instrumented/sanitize.js';

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
});
