import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import * as utilities from '../../packages/svgcanvas/core/utilities.js'
import {
  init as initJson,
  addSVGElementsFromJson,
  getJsonFromSvgElements
} from '../../packages/svgcanvas/core/json.js'

const createSvgElement = (name) => document.createElementNS(NS.SVG, name)

describe('json', () => {
  /** @type {HTMLDivElement} */
  let root
  /** @type {SVGSVGElement} */
  let svgRoot
  /** @type {SVGGElement} */
  let layer

  beforeEach(() => {
    root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)

    svgRoot = /** @type {SVGSVGElement} */ (createSvgElement('svg'))
    svgRoot.id = 'svgroot'
    root.append(svgRoot)

    layer = /** @type {SVGGElement} */ (createSvgElement('g'))
    layer.id = 'layer1'
    svgRoot.append(layer)

    utilities.init({
      getSvgRoot: () => svgRoot
    })

    initJson({
      getDOMDocument: () => document,
      getSvgRoot: () => svgRoot,
      getDrawing: () => ({ getCurrentLayer: () => layer }),
      getCurrentGroup: () => null,
      getCurShape: () => ({
        fill: 'none',
        stroke: '#000000',
        stroke_width: 1,
        stroke_dasharray: 'none',
        stroke_linejoin: 'miter',
        stroke_linecap: 'butt',
        stroke_opacity: 1,
        fill_opacity: 1,
        opacity: 1
      })
    })
  })

  afterEach(() => {
    root.remove()
  })

  it('getJsonFromSvgElements() ignores comment nodes', () => {
    const g = createSvgElement('g')
    const comment = document.createComment('hi')
    const rect = createSvgElement('rect')
    rect.setAttribute('x', '1')
    g.append(comment, rect)

    const json = getJsonFromSvgElements(g)
    expect(json.element).toBe('g')
    expect(json.children).toHaveLength(1)
    expect(json.children[0].element).toBe('rect')
  })

  it('addSVGElementsFromJson() does not treat missing id as "undefined"', () => {
    const existing = createSvgElement('rect')
    existing.id = 'undefined'
    layer.append(existing)

    const circle = addSVGElementsFromJson({
      element: 'circle',
      attr: {
        cx: 0,
        cy: 0,
        r: 5
      }
    })

    expect(layer.querySelector('#undefined')).toBe(existing)
    expect(circle?.tagName).toBe('circle')
    expect(layer.contains(circle)).toBe(true)
  })

  it('addSVGElementsFromJson() replaces children when reusing an element by id', () => {
    const group = createSvgElement('g')
    group.id = 'reuse'
    const oldChild = createSvgElement('rect')
    group.append(oldChild)
    layer.append(group)

    addSVGElementsFromJson({
      element: 'g',
      attr: { id: 'reuse' },
      children: [
        {
          element: 'circle',
          attr: { id: 'newChild' }
        }
      ]
    })

    expect(group.children).toHaveLength(1)
    expect(group.firstElementChild?.tagName).toBe('circle')
    expect(group.querySelector('rect')).toBeNull()
  })

  it('addSVGElementsFromJson() handles ids that are not valid CSS selectors', () => {
    const rect = createSvgElement('rect')
    rect.id = 'a:b'
    layer.append(rect)

    expect(() => {
      addSVGElementsFromJson({
        element: 'rect',
        attr: {
          id: 'a:b',
          x: 10
        }
      })
    }).not.toThrow()
    expect(rect.getAttribute('x')).toBe('10')
  })
})
