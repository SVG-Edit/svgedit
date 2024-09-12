import * as select from '../../../packages/svgcanvas/core/select.js'
import { NS } from '../../../packages/svgcanvas/core/namespaces.js'

describe('select', function () {
  const sandbox = document.createElement('div')
  sandbox.id = 'sandbox'

  let svgroot
  let svgContent
  const mockConfig = {
    dimensions: [640, 480]
  }
  const dataStorage = {
    _storage: new WeakMap(),
    put: function (element, key, obj) {
      if (!this._storage.has(element)) {
        this._storage.set(element, new Map())
      }
      this._storage.get(element).set(key, obj)
    },
    get: function (element, key) {
      return this._storage.get(element).get(key)
    },
    has: function (element, key) {
      return this._storage.has(element) && this._storage.get(element).has(key)
    },
    remove: function (element, key) {
      const ret = this._storage.get(element).delete(key)
      if (!this._storage.get(element).size === 0) {
        this._storage.delete(element)
      }
      return ret
    }
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
    getSvgRoot () { return svgroot },
    getSvgContent () { return svgContent },
    getDataStorage () { return dataStorage }
  }

  /**
   * Potentially reusable test set-up.
   * @returns {void}
   */
  beforeEach(() => {
    svgroot = mockSvgCanvas.createSVGElement({
      element: 'svg',
      attr: { id: 'svgroot' }
    })
    svgContent = mockSvgCanvas.createSVGElement({
      element: 'svg',
      attr: { id: 'svgcontent' }
    })

    svgroot.append(svgContent)
    /* const rect = */ svgContent.append(
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
    sandbox.append(svgroot)
  })

  /*
  function setUpWithInit () {
    select.init(mockConfig, mockFactory);
  }
  */

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
    assert.equal(typeof select.Selector, typeof function () { /* empty fn */ })
    assert.equal(typeof select.SelectorManager, typeof function () { /* empty fn */ })
    assert.equal(typeof select.init, typeof function () { /* empty fn */ })
    assert.equal(typeof select.getSelectorManager, typeof function () { /* empty fn */ })
  })

  it('Test Selector DOM structure', function () {
    assert.ok(svgroot)
    assert.ok(svgroot.hasChildNodes())

    // Verify non-existence of Selector DOM nodes
    assert.equal(svgroot.childNodes.length, 1)
    assert.equal(svgroot.childNodes.item(0), svgContent)
    assert.ok(!svgroot.querySelector('#selectorParentGroup'))

    select.init(mockSvgCanvas)

    assert.equal(svgroot.childNodes.length, 3)

    // Verify existence of canvas background.
    const cb = svgroot.childNodes.item(0)
    assert.ok(cb)
    assert.equal(cb.id, 'canvasBackground')

    assert.ok(svgroot.childNodes.item(1))
    assert.equal(svgroot.childNodes.item(1), svgContent)

    // Verify existence of selectorParentGroup.
    const spg = svgroot.childNodes.item(2)
    assert.ok(spg)
    assert.equal(svgroot.querySelector('#selectorParentGroup'), spg)
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
