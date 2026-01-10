import { NS, getReverseNS } from '../../packages/svgcanvas/core/namespaces.js'

describe('namespaces', function () {
  it('exposes common namespace constants', function () {
    assert.equal(NS.SVG, 'http://www.w3.org/2000/svg')
    assert.equal(NS.XLINK, 'http://www.w3.org/1999/xlink')
    assert.equal(NS.XML, 'http://www.w3.org/XML/1998/namespace')
    assert.equal(NS.XMLNS, 'http://www.w3.org/2000/xmlns/')
  })

  it('creates a reverse namespace lookup', function () {
    const reverse = getReverseNS()

    assert.equal(reverse[NS.SVG], 'svg')
    assert.equal(reverse[NS.XLINK], 'xlink')
    assert.equal(reverse[NS.SE], 'se')
    assert.equal(reverse[NS.OI], 'oi')
    assert.equal(reverse[NS.XML], 'xml')
    assert.equal(reverse[NS.XMLNS], 'xmlns')
    assert.equal(reverse[NS.HTML], 'html')
    assert.equal(reverse[NS.MATH], 'math')
  })
})
