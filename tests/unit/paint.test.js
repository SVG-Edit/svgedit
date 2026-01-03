import { describe, expect, it } from 'vitest'
import Paint from '../../packages/svgcanvas/core/paint.js'

const createLinear = (id) => {
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  if (id) grad.id = id
  return grad
}

const createRadial = (id) => {
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
  if (id) grad.id = id
  grad.setAttribute('cx', '0.5')
  grad.setAttribute('cy', '0.5')
  return grad
}

describe('Paint', () => {
  it('defaults to an empty paint when no options are provided', () => {
    const paint = new Paint()
    expect(paint.type).toBe('none')
    expect(paint.alpha).toBe(100)
    expect(paint.solidColor).toBeNull()
    expect(paint.linearGradient).toBeNull()
    expect(paint.radialGradient).toBeNull()
  })

  it('normalizes solid colors and copies alpha', () => {
    const base = new Paint({ solidColor: '#00ff00', alpha: 65 })
    const copy = new Paint({ copy: base })

    expect(copy.type).toBe('solidColor')
    expect(copy.alpha).toBe(65)
    expect(copy.solidColor).toBe('00ff00')
    expect(copy.linearGradient).toBeNull()
    expect(copy.radialGradient).toBeNull()
  })

  it('copies gradients by cloning the underlying nodes', () => {
    const linear = createLinear('lin1')
    const base = new Paint({ linearGradient: linear })
    const clone = new Paint({ copy: base })

    expect(clone.type).toBe('linearGradient')
    expect(clone.linearGradient).not.toBe(base.linearGradient)
    expect(clone.linearGradient?.isEqualNode(base.linearGradient)).toBe(true)
  })

  it('resolves linked linear gradients via href/xlink:href', () => {
    const referenced = createLinear('refGrad')
    referenced.setAttribute('gradientUnits', 'userSpaceOnUse')
    const stop0 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop0.setAttribute('offset', '0')
    stop0.setAttribute('stop-color', '#000000')
    stop0.setAttribute('stop-opacity', '1')
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '1')
    stop1.setAttribute('stop-color', '#ffffff')
    stop1.setAttribute('stop-opacity', '1')
    referenced.append(stop0, stop1)
    document.body.append(referenced)
    const referencing = createLinear('linkGrad')
    referencing.setAttribute('xlink:href', '#refGrad')
    referencing.setAttribute('x2', '0.5')

    const paint = new Paint({ linearGradient: referencing })
    expect(paint.type).toBe('linearGradient')
    expect(paint.linearGradient).not.toBeNull()
    expect(paint.linearGradient?.getAttribute('gradientUnits')).toBe('userSpaceOnUse')
    expect(paint.linearGradient?.getAttribute('x2')).toBe('0.5')
    expect(paint.linearGradient?.querySelectorAll('stop')).toHaveLength(2)
    expect(paint.linearGradient?.hasAttribute('xlink:href')).toBe(false)
  })

  it('creates radial gradients from provided element when no href is set', () => {
    const radial = createRadial('rad1')
    const paint = new Paint({ radialGradient: radial })

    expect(paint.type).toBe('radialGradient')
    expect(paint.radialGradient).not.toBe(radial)
    expect(paint.radialGradient?.id).toBe('rad1')
    expect(paint.linearGradient).toBeNull()
  })

  it('resolves multi-level gradient chains and strips href', () => {
    const base = createLinear('baseGrad')
    base.setAttribute('gradientUnits', 'userSpaceOnUse')
    base.setAttribute('y2', '0.75')
    const baseStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    baseStop.setAttribute('offset', '0')
    baseStop.setAttribute('stop-color', '#111111')
    base.append(baseStop)

    const mid = createLinear('midGrad')
    mid.setAttribute('href', '#baseGrad')
    mid.setAttribute('x1', '0.2')
    document.body.append(base, mid)

    const top = createLinear('topGrad')
    top.setAttribute('xlink:href', '#midGrad')
    top.setAttribute('x2', '0.9')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('x2')).toBe('0.9')
    expect(paint.linearGradient?.getAttribute('x1')).toBe('0.2')
    expect(paint.linearGradient?.getAttribute('y2')).toBe('0.75')
    expect(paint.linearGradient?.getAttribute('gradientUnits')).toBe('userSpaceOnUse')
    expect(paint.linearGradient?.querySelectorAll('stop')).toHaveLength(1)
    expect(paint.linearGradient?.hasAttribute('href')).toBe(false)
    expect(paint.linearGradient?.hasAttribute('xlink:href')).toBe(false)

    base.remove()
    mid.remove()
  })
})
