import * as select from '../../../packages/svgcanvas/core/select.js'
import { NS } from '../../../packages/svgcanvas/core/namespaces.js'
import dataStorage from '../../../packages/svgcanvas/core/dataStorage.js'

describe('select', function () {
  const sandbox = document.createElement('div')
  sandbox.id = 'sandbox'

  const mockConfig = {
    dimensions: [640, 480]
  }

  /**
   * @implements {module:select.SVGFactory}
   */
  const mockSvgCanvas = {
    curConfig: mockConfig,
    createSVGElement (jsonMap) {
      const elem = document.createElementNS(NS.SVG, jsonMap.element)
      Object.entries(jsonMap.attr).forEach(([attr, value]) => {
        elem.setAttribute(attr, value)
      })
      return elem
    },
    getDataStorage () {
      return dataStorage
    }
  }

  /**
   * Potentially reusable test set-up.
   * @returns {void}
   */
  beforeEach(() => {
    mockSvgCanvas.svgRoot = mockSvgCanvas.createSVGElement({
      element: 'svg',
      attr: { id: 'svgroot' }
    })
    mockSvgCanvas.svgContent = mockSvgCanvas.createSVGElement({
      element: 'svg',
      attr: { id: 'svgcontent' }
    })

    mockSvgCanvas.svgRoot.append(mockSvgCanvas.svgContent)
    mockSvgCanvas.svgContent.append(
      mockSvgCanvas.createSVGElement({
        element: 'rect',
        attr: {
          id: 'rect',
          x: '50',
          y: '75',
          width: '200',
          height: '100'
        }
      })
    )
    sandbox.append(mockSvgCanvas.svgRoot)
  })

  /**
   * Tear down the test by emptying our sandbox area.
   * @returns {void}
   */
  afterEach(() => {
    while (sandbox.hasChildNodes()) {
      sandbox.firstChild.remove()
    }
  })

  it('Test svgedit.select package', function () {
    assert.ok(select)
    assert.ok(select.Selector)
    assert.ok(select.SelectorManager)
    assert.ok(select.init)
    assert.ok(select.getSelectorManager)
    assert.equal(typeof select, typeof {})
    assert.equal(
      typeof select.Selector,
      typeof function () {
        /* empty fn */
      }
    )
    assert.equal(
      typeof select.SelectorManager,
      typeof function () {
        /* empty fn */
      }
    )
    assert.equal(
      typeof select.init,
      typeof function () {
        /* empty fn */
      }
    )
    assert.equal(
      typeof select.getSelectorManager,
      typeof function () {
        /* empty fn */
      }
    )
  })

  it('Test Selector DOM structure', function () {
    assert.ok(mockSvgCanvas.svgRoot)
    assert.ok(mockSvgCanvas.svgRoot.hasChildNodes())

    // Verify non-existence of Selector DOM nodes
    assert.equal(mockSvgCanvas.svgRoot.childNodes.length, 1)
    assert.equal(mockSvgCanvas.svgRoot.childNodes.item(0), mockSvgCanvas.svgContent)
    assert.ok(!mockSvgCanvas.svgRoot.querySelector('#selectorParentGroup'))

    select.init(mockSvgCanvas)

    assert.equal(mockSvgCanvas.svgRoot.childNodes.length, 3)

    // Verify existence of canvas background.
    const cb = mockSvgCanvas.svgRoot.childNodes.item(0)
    assert.ok(cb)
    assert.equal(cb.id, 'canvasBackground')

    assert.ok(mockSvgCanvas.svgRoot.childNodes.item(1))
    assert.equal(mockSvgCanvas.svgRoot.childNodes.item(1), mockSvgCanvas.svgContent)

    // Verify existence of selectorParentGroup.
    const spg = mockSvgCanvas.svgRoot.childNodes.item(2)
    assert.ok(spg)
    assert.equal(mockSvgCanvas.svgRoot.querySelector('#selectorParentGroup'), spg)
    assert.equal(spg.id, 'selectorParentGroup')
    assert.equal(spg.tagName, 'g')

    // Verify existence of all grip elements.
    assert.ok(spg.querySelector('#selectorGrip_resize_nw'))
    assert.ok(spg.querySelector('#selectorGrip_resize_n'))
    assert.ok(spg.querySelector('#selectorGrip_resize_ne'))
    assert.ok(spg.querySelector('#selectorGrip_resize_e'))
    assert.ok(spg.querySelector('#selectorGrip_resize_se'))
    assert.ok(spg.querySelector('#selectorGrip_resize_s'))
    assert.ok(spg.querySelector('#selectorGrip_resize_sw'))
    assert.ok(spg.querySelector('#selectorGrip_resize_w'))
    assert.ok(spg.querySelector('#selectorGrip_rotateconnector'))
    assert.ok(spg.querySelector('#selectorGrip_rotate'))
  })
})
