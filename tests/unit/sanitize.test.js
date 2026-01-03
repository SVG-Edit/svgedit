import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import * as sanitize from '../../packages/svgcanvas/core/sanitize.js'
import * as utilities from '../../packages/svgcanvas/core/utilities.js'

describe('sanitize', function () {
  /** @type {HTMLDivElement} */
  let container
  /** @type {SVGSVGElement} */
  let svg
  let originalWarn

  const createSvgElement = (name) => document.createElementNS(NS.SVG, name)

  beforeEach(() => {
    originalWarn = console.warn
    console.warn = () => {}
    container = document.createElement('div')
    svg = /** @type {SVGSVGElement} */ (createSvgElement('svg'))
    container.append(svg)
    document.body.append(container)

    utilities.init({
      getSvgRoot: () => svg
    })
  })

  afterEach(() => {
    container.remove()
    console.warn = originalWarn
  })

  it('sanitizeSvg() strips ws from style attr', function () {
    const rect = createSvgElement('rect')
    rect.setAttribute('style', 'stroke: blue ;\t\tstroke-width :\t\t40; vector-effect: non-scaling-stroke;')
    // sanitizeSvg() requires the node to have a parent and a document.
    svg.append(rect)
    sanitize.sanitizeSvg(rect)

    assert.equal(rect.getAttribute('stroke'), 'blue')
    assert.equal(rect.getAttribute('stroke-width'), '40')
    assert.equal(rect.hasAttribute('style'), false)
    assert.equal(rect.hasAttribute('vector-effect'), false)
  })

  it('sanitizeSvg() removes disallowed attributes but keeps data-*', function () {
    const rect = createSvgElement('rect')
    rect.setAttribute('onclick', 'alert(1)')
    rect.setAttribute('data-note', 'safe')
    svg.append(rect)

    sanitize.sanitizeSvg(rect)

    assert.equal(rect.hasAttribute('onclick'), false)
    assert.equal(rect.getAttribute('data-note'), 'safe')
  })

  it('sanitizeSvg() mirrors xlink:href to href', function () {
    const image = createSvgElement('image')
    image.setAttributeNS(NS.XLINK, 'xlink:href', 'http://example.com/test.png')
    svg.append(image)

    sanitize.sanitizeSvg(image)

    assert.equal(image.getAttribute('href'), 'http://example.com/test.png')
    assert.equal(image.hasAttributeNS(NS.XLINK, 'href'), false)
  })

  it('sanitizeSvg() drops non-local hrefs on local-only elements', function () {
    const gradient = createSvgElement('linearGradient')
    gradient.setAttribute('href', 'http://example.com/grad')
    svg.append(gradient)

    sanitize.sanitizeSvg(gradient)

    assert.equal(gradient.hasAttribute('href'), false)
  })

  it('sanitizeSvg() removes <use> without href', function () {
    const use = createSvgElement('use')
    svg.append(use)

    sanitize.sanitizeSvg(use)

    assert.equal(use.parentNode, null)
    assert.equal(svg.querySelector('use'), null)
  })

  it('sanitizeSvg() keeps <use> with a local href', function () {
    const symbol = createSvgElement('symbol')
    symbol.id = 'icon'
    symbol.setAttribute('viewBox', '0 0 200 100')
    svg.append(symbol)

    const use = createSvgElement('use')
    use.setAttribute('href', '#icon')
    svg.append(use)

    sanitize.sanitizeSvg(use)

    assert.equal(use.parentNode, svg)
    assert.equal(use.getAttribute('href'), '#icon')
    assert.equal(use.hasAttribute('width'), false)
    assert.equal(use.hasAttribute('height'), false)
  })

  it('sanitizeSvg() removes non-local url() paint references', function () {
    const rect = createSvgElement('rect')
    rect.setAttribute('fill', 'url(http://example.com/pat)')
    svg.append(rect)

    sanitize.sanitizeSvg(rect)

    assert.equal(rect.hasAttribute('fill'), false)
  })

  it('sanitizeSvg() trims and removes text nodes', function () {
    const text = createSvgElement('text')
    text.append(document.createTextNode('  Hello  '), document.createTextNode('   '))
    svg.append(text)

    sanitize.sanitizeSvg(text)

    assert.equal(text.textContent, 'Hello')
  })

  it('sanitizeSvg() removes unsupported elements but keeps children', function () {
    const unknown = createSvgElement('foo')
    const rect = createSvgElement('rect')
    unknown.append(rect)
    svg.append(unknown)

    sanitize.sanitizeSvg(unknown)

    assert.equal(svg.querySelector('foo'), null)
    assert.equal(rect.parentNode, svg)
  })
})
