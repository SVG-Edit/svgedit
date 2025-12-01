import { describe, it, expect, beforeEach } from 'vitest'

import { init as initUnits } from '../../packages/svgcanvas/core/units.js'
import {
  init as initUtilities,
  findDefs,
  assignAttributes,
  snapToGrid,
  getHref,
  setHref,
  dropXMLInternalSubset,
  encodeUTF8,
  decodeUTF8
} from '../../packages/svgcanvas/core/utilities.js'

describe('utilities extra coverage', () => {
  let svg

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.innerHTML = ''
    document.body.append(svg)

    // Initialize units and utilities with a minimal canvas/context stub
    initUnits({
      getBaseUnit: () => 'px',
      getWidth: () => 200,
      getHeight: () => 100,
      getRoundDigits: () => 2
    })
    initUtilities({
      getSvgRoot: () => svg,
      getSvgContent: () => svg,
      getDOMDocument: () => document,
      getDOMContainer: () => svg,
      getBaseUnit: () => 'cm',
      getSnappingStep: () => 0.5
    })
  })

  it('creates defs and removes namespaced attributes via assignAttributes', () => {
    const defs = findDefs()
    expect(defs.tagName).toBe('defs')
    expect(svg.querySelectorAll('defs').length).toBe(1)

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
    assignAttributes(rect, { width: '10', height: '5', 'xml:space': undefined }, 0, true)
    expect(rect.getAttribute('width')).toBe('10')
    expect(rect.getAttribute('height')).toBe('5')
  })

  it('snaps to grid with unit conversion and handles href helpers', () => {
    const value = snapToGrid(2.3)
    expect(value).toBe(0)

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    setHref(use, '#ref')
    expect(getHref(use)).toBe('#ref')
  })

  it('drops XML internal subsets and round trips UTF8 helpers', () => {
    const doc = '<!DOCTYPE svg [<!ENTITY test "x">]><svg/>'
    expect(dropXMLInternalSubset(doc)).toContain('<!DOCTYPE svg')

    const mixed = 'äöü & < >'
    const encoded = encodeUTF8(mixed)
    expect(decodeUTF8(encoded)).toBe(mixed)
  })
})
