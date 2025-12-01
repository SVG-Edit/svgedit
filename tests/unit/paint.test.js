import { describe, expect, it } from 'vitest'
import Paint from '../../packages/svgcanvas/core/paint.js'

const createLinear = (id) => {
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  if (id) grad.id = id
  grad.setAttribute('x1', '0')
  grad.setAttribute('x2', '1')
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

  it('copies a solid color paint including alpha', () => {
    const base = new Paint({ solidColor: '#00ff00', alpha: 65 })
    const copy = new Paint({ copy: base })

    expect(copy.type).toBe('solidColor')
    expect(copy.alpha).toBe(65)
    expect(copy.solidColor).toBe('#00ff00')
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
    document.body.append(referenced)
    const referencing = createLinear('linkGrad')
    referencing.setAttribute('xlink:href', '#refGrad')

    const paint = new Paint({ linearGradient: referencing })
    expect(paint.type).toBe('linearGradient')
    expect(paint.linearGradient).not.toBeNull()
    expect(paint.linearGradient?.id).toBe('refGrad')
  })

  it('creates radial gradients from provided element when no href is set', () => {
    const radial = createRadial('rad1')
    const paint = new Paint({ radialGradient: radial })

    expect(paint.type).toBe('radialGradient')
    expect(paint.radialGradient).not.toBe(radial)
    expect(paint.radialGradient?.id).toBe('rad1')
    expect(paint.linearGradient).toBeNull()
  })
})
