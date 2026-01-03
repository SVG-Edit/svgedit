import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as draw from '../../packages/svgcanvas/core/draw.js'
import dataStorage from '../../packages/svgcanvas/core/dataStorage.js'

const NS_SVG = 'http://www.w3.org/2000/svg'

describe('draw context', () => {
  let currentGroup = null
  /** @type {{event: string, arg: any}[]} */
  const calls = []
  let svgContent
  let editGroup
  let sibling

  const canvas = {
    getDataStorage: () => dataStorage,
    getSvgContent: () => svgContent,
    clearSelection: () => {},
    call: (event, arg) => {
      calls.push({ event, arg })
    },
    getCurrentGroup: () => currentGroup,
    setCurrentGroup: (group) => {
      currentGroup = group
    }
  }

  beforeEach(() => {
    draw.init(canvas)
    draw.leaveContext()

    currentGroup = null
    calls.length = 0
    document.body.innerHTML = ''

    svgContent = document.createElementNS(NS_SVG, 'svg')
    svgContent.id = 'svgcontent'
    editGroup = document.createElementNS(NS_SVG, 'g')
    editGroup.id = 'edit'
    sibling = document.createElementNS(NS_SVG, 'rect')
    sibling.id = 'sib'
    sibling.setAttribute('opacity', 'inherit')
    svgContent.append(editGroup, sibling)
    document.body.append(svgContent)
  })

  afterEach(() => {
    draw.leaveContext()
    document.body.innerHTML = ''
  })

  it('ignores unknown element ids', () => {
    expect(() => draw.setContext('does-not-exist')).not.toThrow()
    expect(currentGroup).toBe(null)
    expect(calls.length).toBe(0)
  })

  it('handles non-numeric opacity and restores it', () => {
    draw.setContext(editGroup)

    expect(currentGroup).toBe(editGroup)
    expect(calls[0]).toStrictEqual({ event: 'contextset', arg: editGroup })
    expect(sibling.getAttribute('opacity')).toBe('0.33')
    expect(sibling.getAttribute('style')).toBe('pointer-events: none')
    expect(dataStorage.get(sibling, 'orig_opac')).toBe('inherit')

    draw.leaveContext()

    expect(currentGroup).toBe(null)
    expect(calls[1]).toStrictEqual({ event: 'contextset', arg: null })
    expect(sibling.getAttribute('opacity')).toBe('inherit')
    expect(sibling.getAttribute('style')).toBe('pointer-events: inherit')
    expect(dataStorage.has(sibling, 'orig_opac')).toBe(false)
  })
})
