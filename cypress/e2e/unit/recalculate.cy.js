import { NS } from '../../../packages/svgcanvas/core/namespaces.js'
import * as utilities from '../../../packages/svgcanvas/core/utilities.js'
import * as coords from '../../../packages/svgcanvas/core/coords.js'
import * as recalculate from '../../../packages/svgcanvas/core/recalculate.js'

describe('recalculate', function () {
  const root = document.createElement('div')
  root.id = 'root'
  root.style.visibility = 'hidden'

  const svgroot = document.createElementNS(NS.SVG, 'svg')
  svgroot.id = 'svgroot'
  root.append(svgroot)
  const svg = document.createElementNS(NS.SVG, 'svg')
  svgroot.append(svg)

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

  let elemId = 1

  /**
   * Initilize modules to set up the tests.
   * @returns {void}
   */
  function setUp () {
    utilities.init(
      /**
      * @implements {module:utilities.EditorContext}
      */
      {
        getSvgRoot () { return svg },
        getDOMDocument () { return null },
        getDOMContainer () { return null },
        getDataStorage () { return dataStorage }
      }
    )
    coords.init(
      /**
      * @implements {module:coords.EditorContext}
      */
      {
        getGridSnapping () { return false },
        getDrawing () {
          return {
            getNextId () { return String(elemId++) }
          }
        },
        getDataStorage () { return dataStorage }
      }
    )
    recalculate.init(
      /**
      * @implements {module:recalculate.EditorContext}
      */
      {
        getSvgRoot () { return svg },
        getStartTransform () { return '' },
        setStartTransform () { /* empty fn */ },
        getDataStorage () { return dataStorage }
      }
    )
  }

  let elem

  /**
   * Initialize for tests and set up `rect` element.
   * @returns {void}
   */
  function setUpRect () {
    setUp()
    elem = document.createElementNS(NS.SVG, 'rect')
    elem.setAttribute('x', '200')
    elem.setAttribute('y', '150')
    elem.setAttribute('width', '250')
    elem.setAttribute('height', '120')
    svg.append(elem)
  }

  /**
   * Initialize for tests and set up `text` element with `tspan` child.
   * @returns {void}
   */
  function setUpTextWithTspan () {
    setUp()
    elem = document.createElementNS(NS.SVG, 'text')
    elem.setAttribute('x', '200')
    elem.setAttribute('y', '150')

    const tspan = document.createElementNS(NS.SVG, 'tspan')
    tspan.setAttribute('x', '200')
    tspan.setAttribute('y', '150')

    const theText = 'Foo bar'
    tspan.append(theText)
    elem.append(tspan)
    svg.append(elem)
  }

  /**
   * Tear down the tests (empty the svg element).
   * @returns {void}
   */
  afterEach(() => {
    while (svg.hasChildNodes()) {
      svg.firstChild.remove()
    }
  })

  it('Test recalculateDimensions() on rect with identity matrix', function () {
    setUpRect()
    elem.setAttribute('transform', 'matrix(1,0,0,1,0,0)')

    recalculate.recalculateDimensions(elem)

    // Ensure that the identity matrix is swallowed and the element has no
    // transform on it.
    assert.equal(elem.hasAttribute('transform'), false)
  })

  it('Test recalculateDimensions() on rect with simple translate', function () {
    setUpRect()
    elem.setAttribute('transform', 'translate(100,50)')

    recalculate.recalculateDimensions(elem)

    assert.equal(elem.hasAttribute('transform'), false)
    assert.equal(elem.getAttribute('x'), '300')
    assert.equal(elem.getAttribute('y'), '200')
    assert.equal(elem.getAttribute('width'), '250')
    assert.equal(elem.getAttribute('height'), '120')
  })

  it('Test recalculateDimensions() on text w/tspan with simple translate', function () {
    setUpTextWithTspan()
    elem.setAttribute('transform', 'translate(100,50)')

    recalculate.recalculateDimensions(elem)

    // Ensure that the identity matrix is swallowed and the element has no
    // transform on it.
    assert.equal(elem.hasAttribute('transform'), false)
    assert.equal(elem.getAttribute('x'), '300')
    assert.equal(elem.getAttribute('y'), '200')

    const tspan = elem.firstElementChild
    assert.equal(tspan.getAttribute('x'), '300')
    assert.equal(tspan.getAttribute('y'), '200')
  })

  // TODO: Since recalculateDimensions() and surrounding code is
  // probably the largest, most complicated and strange piece of
  // code in SVG-edit, we need to write a whole lot of unit tests
  // for it here.
})
