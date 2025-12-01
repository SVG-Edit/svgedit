import { describe, expect, it, beforeEach, vi } from 'vitest'

import {
  add,
  getCustomHandler,
  hasCustomHandler,
  injectExtendedContextMenuItemsIntoDom,
  resetCustomMenus
} from '../../src/editor/contextmenu.js'

describe('contextmenu helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = "<ul id='cmenu_canvas'></ul>"
    resetCustomMenus()
  })

  it('validates menu entries and prevents duplicates', () => {
    expect(() => add(null)).toThrow(/must be defined/)
    add({ id: 'foo', label: 'Foo', action: () => 'ok' })
    expect(hasCustomHandler('foo')).toBe(true)
    expect(getCustomHandler('foo')()).toBe('ok')
    expect(() =>
      add({ id: 'foo', label: 'Again', action: () => {} })
    ).toThrow(/already exists/)
  })

  it('injects extensions into the context menu DOM', () => {
    const host = document.getElementById('cmenu_canvas')
    const appended = []
    host.appendChild = vi.fn((value) => {
      appended.push(value)
      return value
    })
    add({ id: 'alpha', label: 'Alpha', action: () => {}, shortcut: 'Ctrl+A' })
    add({ id: 'beta', label: 'Beta', action: () => {} })

    injectExtendedContextMenuItemsIntoDom()

    expect(host.appendChild).toHaveBeenCalledTimes(2)
    expect(appended[0]).toContain('#alpha')
    expect(appended[0]).toContain('Ctrl+A')
    expect(appended[1]).toContain('#beta')
  })
})
