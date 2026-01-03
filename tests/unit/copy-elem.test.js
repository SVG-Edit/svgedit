import { describe, expect, it } from 'vitest'
import { copyElem } from '../../packages/svgcanvas/core/copy-elem.js'
import dataStorage from '../../packages/svgcanvas/core/dataStorage.js'

const NS_SVG = 'http://www.w3.org/2000/svg'

const buildIdGenerator = () => {
  let next = 0
  return () => `svg_${++next}`
}

describe('copyElem', () => {
  it('clones elements and assigns new ids', () => {
    const getNextId = buildIdGenerator()
    const group = document.createElementNS(NS_SVG, 'g')
    group.id = 'old_group'
    group.setAttribute('fill', 'red')
    const rect = document.createElementNS(NS_SVG, 'rect')
    rect.id = 'old_rect'
    group.append(rect)

    const cloned = copyElem(group, getNextId)

    expect(cloned.id).toBe('svg_1')
    expect(cloned.getAttribute('fill')).toBe('red')
    expect(cloned.querySelector('rect')?.id).toBe('svg_2')
  })

  it('preserves mixed content order', () => {
    const getNextId = buildIdGenerator()
    const text = document.createElementNS(NS_SVG, 'text')
    text.append(document.createTextNode('hello '))
    const tspan = document.createElementNS(NS_SVG, 'tspan')
    tspan.append(document.createTextNode('world'))
    text.append(tspan)
    text.append(document.createTextNode('!'))

    const cloned = copyElem(text, getNextId)

    expect(cloned.childNodes[0].nodeType).toBe(Node.TEXT_NODE)
    expect(cloned.childNodes[0].nodeValue).toBe('hello ')
    expect(cloned.childNodes[1].nodeName.toLowerCase()).toBe('tspan')
    expect(cloned.childNodes[2].nodeType).toBe(Node.TEXT_NODE)
    expect(cloned.childNodes[2].nodeValue).toBe('!')
    expect(cloned.textContent).toBe('hello world!')
  })

  it('copies gsvg dataStorage to the cloned element', () => {
    const getNextId = buildIdGenerator()
    const group = document.createElementNS(NS_SVG, 'g')
    const innerSvg = document.createElementNS(NS_SVG, 'svg')
    innerSvg.append(document.createElementNS(NS_SVG, 'rect'))
    group.append(innerSvg)
    dataStorage.put(group, 'gsvg', innerSvg)

    const cloned = copyElem(group, getNextId)
    const clonedSvg = cloned.firstElementChild

    expect(dataStorage.has(cloned, 'gsvg')).toBe(true)
    expect(dataStorage.get(cloned, 'gsvg')).toBe(clonedSvg)
    expect(dataStorage.get(cloned, 'gsvg')).not.toBe(innerSvg)
  })

  it('copies symbol/ref dataStorage to the cloned element', () => {
    const getNextId = buildIdGenerator()
    const symbol = document.createElementNS(NS_SVG, 'symbol')
    symbol.id = 'sym1'
    const use = document.createElementNS(NS_SVG, 'use')
    use.setAttribute('href', '#sym1')
    dataStorage.put(use, 'ref', symbol)
    dataStorage.put(use, 'symbol', symbol)

    const cloned = copyElem(use, getNextId)

    expect(dataStorage.get(cloned, 'ref')).toBe(symbol)
    expect(dataStorage.get(cloned, 'symbol')).toBe(symbol)
  })

  it('prevents default click behaviour on cloned images', () => {
    const getNextId = buildIdGenerator()
    const image = document.createElementNS(NS_SVG, 'image')

    const cloned = copyElem(image, getNextId)
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true })
    cloned.dispatchEvent(evt)

    expect(evt.defaultPrevented).toBe(true)
  })
})
