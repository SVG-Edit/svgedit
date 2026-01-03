import { strict as assert } from 'node:assert'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import Layer from '../../packages/svgcanvas/core/layer.js'

describe('Layer', function () {
  it('preserves inline styles while applying pointer-events', function () {
    const svg = document.createElementNS(NS.SVG, 'svg')
    const group = document.createElementNS(NS.SVG, 'g')
    group.setAttribute('style', 'fill: red; opacity: 0.5; pointer-events: none;')

    const child = document.createElementNS(NS.SVG, 'rect')
    child.setAttribute('style', 'stroke: blue; opacity: 0.25; pointer-events: none;')
    group.append(child)
    svg.append(group)

    const layer = new Layer('Layer 1', group)

    assert.equal(group.style.getPropertyValue('fill'), 'red')
    assert.equal(group.style.getPropertyValue('opacity'), '0.5')
    assert.equal(group.style.getPropertyValue('pointer-events'), 'none')
    assert.equal(child.style.getPropertyValue('stroke'), 'blue')
    assert.equal(child.style.getPropertyValue('opacity'), '0.25')
    assert.equal(child.style.getPropertyValue('pointer-events'), 'inherit')

    layer.activate()
    assert.equal(group.style.getPropertyValue('fill'), 'red')
    assert.equal(group.style.getPropertyValue('opacity'), '0.5')
    assert.equal(group.style.getPropertyValue('pointer-events'), 'all')

    layer.deactivate()
    assert.equal(group.style.getPropertyValue('fill'), 'red')
    assert.equal(group.style.getPropertyValue('opacity'), '0.5')
    assert.equal(group.style.getPropertyValue('pointer-events'), 'none')
  })

  it('manages layer metadata and lifecycle helpers', function () {
    const svg = document.createElementNS(NS.SVG, 'svg')
    const anchor = document.createElementNS(NS.SVG, 'g')
    anchor.setAttribute('class', 'anchor')
    svg.append(anchor)

    const layer = new Layer('Layer 1', anchor, svg)
    const group = layer.getGroup()

    assert.equal(layer.getName(), 'Layer 1')
    assert.equal(group.previousSibling, anchor)
    assert.ok(group.classList.contains('layer'))
    assert.equal(group.style.getPropertyValue('pointer-events'), 'all')

    const title = layer.getTitleElement()
    assert.ok(title)
    assert.equal(title.textContent, 'Layer 1')

    layer.setVisible(false)
    assert.equal(group.getAttribute('display'), 'none')
    assert.equal(layer.isVisible(), false)

    layer.setVisible(true)
    assert.equal(group.getAttribute('display'), 'inline')
    assert.equal(layer.isVisible(), true)

    assert.equal(layer.getOpacity(), 1)
    layer.setOpacity(0.25)
    assert.equal(layer.getOpacity(), 0.25)
    layer.setOpacity(2)
    assert.equal(layer.getOpacity(), 0.25)

    const rect = document.createElementNS(NS.SVG, 'rect')
    const circle = document.createElementNS(NS.SVG, 'circle')
    layer.appendChildren([rect, circle])
    assert.ok(group.contains(rect))
    assert.ok(group.contains(circle))

    const hrCalls = []
    const hrService = {
      changeElement: (...args) => {
        hrCalls.push(args)
      }
    }
    const renamed = layer.setName('Renamed', hrService)
    assert.equal(renamed, 'Renamed')
    assert.equal(layer.getName(), 'Renamed')
    assert.equal(title.textContent, 'Renamed')
    assert.equal(hrCalls.length, 1)
    assert.equal(hrCalls[0][0], title)
    assert.deepEqual(hrCalls[0][1], { '#text': 'Layer 1' })

    assert.equal(Layer.isLayer(group), true)
    assert.equal(Layer.isLayer(document.createElementNS(NS.SVG, 'rect')), false)

    const appended = new Layer('Layer 2', null, svg)
    assert.equal(svg.lastChild, appended.getGroup())

    const removedGroup = layer.removeGroup()
    assert.equal(removedGroup, group)
    assert.equal(group.parentNode, null)
    assert.equal(layer.getGroup(), undefined)
  })
})
