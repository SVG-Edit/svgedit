import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { init as initTouch } from '../../packages/svgcanvas/core/touch.js'

const createSvgRoot = () => {
  const listeners = {}
  return {
    listeners,
    addEventListener (type, handler) { listeners[type] = handler },
    dispatch (type, event) { listeners[type]?.(event) }
  }
}

const OriginalMouseEvent = global.MouseEvent

beforeAll(() => {
  // JSDOM's MouseEvent requires a real Window; a lightweight stub keeps the adapter logic testable.
  global.MouseEvent = class extends Event {
    constructor (type, init = {}) {
      super(type, init)
      this.clientX = init.clientX
      this.clientY = init.clientY
      this.screenX = init.screenX
      this.screenY = init.screenY
      this.button = init.button ?? 0
      this.relatedTarget = init.relatedTarget ?? null
    }
  }
})

afterAll(() => {
  global.MouseEvent = OriginalMouseEvent
})

describe('touch adapter', () => {
  it('translates single touch to mouse event on target', () => {
    const svgroot = createSvgRoot()
    const svgCanvas = { svgroot }
    initTouch(svgCanvas)

    const target = document.createElement('div')
    const received = []
    target.addEventListener('mousedown', (ev) => {
      received.push({
        type: ev.type,
        clientX: ev.clientX,
        clientY: ev.clientY,
        screenX: ev.screenX,
        screenY: ev.screenY
      })
    })

    const preventDefault = vi.fn()
    svgroot.dispatch('touchstart', {
      type: 'touchstart',
      changedTouches: [{
        target,
        clientX: 12,
        clientY: 34,
        screenX: 56,
        screenY: 78
      }],
      preventDefault
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(received).toEqual([{
      type: 'mousedown',
      clientX: 12,
      clientY: 34,
      screenX: 56,
      screenY: 78
    }])
  })

  it('maps move events and ignores multi-touch gestures', () => {
    const svgroot = createSvgRoot()
    initTouch({ svgroot })

    const target = document.createElement('div')
    let mouseDown = 0
    let mouseMove = 0
    target.addEventListener('mousedown', () => { mouseDown++ })
    target.addEventListener('mousemove', () => { mouseMove++ })

    svgroot.dispatch('touchstart', {
      type: 'touchstart',
      changedTouches: [
        { target, clientX: 1, clientY: 2, screenX: 3, screenY: 4 },
        { target, clientX: 5, clientY: 6, screenX: 7, screenY: 8 }
      ],
      preventDefault: vi.fn()
    })

    expect(mouseDown).toBe(0)

    svgroot.dispatch('touchmove', {
      type: 'touchmove',
      changedTouches: [
        { target, clientX: 9, clientY: 10, screenX: 11, screenY: 12 }
      ],
      preventDefault: vi.fn()
    })

    expect(mouseMove).toBe(1)
  })

  it('returns early on unknown event types', () => {
    const svgroot = createSvgRoot()
    initTouch({ svgroot })
    const target = document.createElement('div')
    let mouseCount = 0
    target.addEventListener('mousedown', () => { mouseCount++ })

    const preventDefault = vi.fn()
    svgroot.dispatch('touchcancel', {
      type: 'touchcancel',
      changedTouches: [{ target, clientX: 0, clientY: 0, screenX: 0, screenY: 0 }],
      preventDefault
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(mouseCount).toBe(0)
  })
})
