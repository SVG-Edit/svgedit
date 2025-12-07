import { describe, expect, it } from 'vitest'
import dataStorage from '../../packages/svgcanvas/core/dataStorage.js'

describe('dataStorage', () => {
  it('stores, checks and retrieves keyed values per element', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    dataStorage.put(el1, 'color', 'red')
    dataStorage.put(el1, 'count', 3)
    dataStorage.put(el2, 'color', 'blue')

    expect(dataStorage.has(el1, 'color')).toBe(true)
    expect(dataStorage.has(el1, 'missing')).toBe(false)
    expect(dataStorage.get(el1, 'color')).toBe('red')
    expect(dataStorage.get(el1, 'count')).toBe(3)
    expect(dataStorage.get(el2, 'color')).toBe('blue')
  })

  it('removes values and cleans up empty element maps', () => {
    const el = document.createElement('span')
    dataStorage.put(el, 'foo', 1)
    dataStorage.put(el, 'bar', 2)

    expect(dataStorage.remove(el, 'foo')).toBe(true)
    expect(dataStorage.has(el, 'foo')).toBe(false)
    expect(dataStorage.get(el, 'bar')).toBe(2)

    // Removing the last key should drop the element from storage entirely.
    expect(dataStorage.remove(el, 'bar')).toBe(true)
    expect(dataStorage.has(el, 'bar')).toBe(false)
    expect(dataStorage.get(el, 'bar')).toBeUndefined()
  })
})
