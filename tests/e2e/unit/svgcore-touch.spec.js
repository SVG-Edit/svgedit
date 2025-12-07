import { test, expect } from '../fixtures.js'

test.describe('touch event adapter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/unit-harness.html')
    await page.waitForFunction(() => Boolean(window.svgHarness))
  })

  test('translates single touch events into mouse events', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { touch } = window.svgHarness
      const target = document.createElement('div')
      document.body.append(target)

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

      const svgroot = {
        listeners: {},
        addEventListener (type, handler) { this.listeners[type] = handler },
        dispatchEvent (ev) { this.listeners[ev.type]?.(ev) }
      }

      touch.init({ svgroot })
      const ev = new TouchEvent('touchstart', {
        changedTouches: [
          new Touch({
            identifier: 1,
            target,
            clientX: 12,
            clientY: 34,
            screenX: 56,
            screenY: 78
          })
        ]
      })
      svgroot.dispatchEvent(ev)
      return received[0]
    })

    expect(result.type).toBe('mousedown')
    expect(result.clientX).toBe(12)
    expect(result.clientY).toBe(34)
    expect(result.screenX).toBe(56)
    expect(result.screenY).toBe(78)
  })

  test('ignores multi-touch gestures when forwarding', async ({ page }) => {
    const count = await page.evaluate(() => {
      const { touch } = window.svgHarness
      const target = document.createElement('div')
      document.body.append(target)
      let mouseEvents = 0
      target.addEventListener('mousedown', () => { mouseEvents++ })

      const svgroot = {
        listeners: {},
        addEventListener (type, handler) { this.listeners[type] = handler },
        dispatchEvent (ev) { this.listeners[ev.type]?.(ev) }
      }

      touch.init({ svgroot })
      const ev = new TouchEvent('touchstart', {
        changedTouches: [
          new Touch({ identifier: 1, target, clientX: 1, clientY: 2, screenX: 3, screenY: 4 }),
          new Touch({ identifier: 2, target, clientX: 5, clientY: 6, screenX: 7, screenY: 8 })
        ]
      })
      svgroot.dispatchEvent(ev)
      return mouseEvents
    })

    expect(count).toBe(0)
  })
})
