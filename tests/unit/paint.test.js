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

  it('should handle paint with null linearGradient', () => {
    const paint = new Paint({ linearGradient: null })
    expect(paint.type).toBe('none')
    expect(paint.linearGradient).toBe(null)
  })

  it('should handle paint with undefined radialGradient', () => {
    const paint = new Paint({ radialGradient: undefined })
    expect(paint.type).toBe('none')
  })

  it('should handle paint with solidColor', () => {
    const paint = new Paint({ solidColor: '#ff0000' })
    expect(paint.type).toBe('solidColor')
  })

  it('should handle paint with alpha value', () => {
    const paint = new Paint({ alpha: 0.5 })
    expect(paint.alpha).toBe(0.5)
  })

  it('should handle radialGradient with href chain', () => {
    const base = createRadial('baseRadialGrad')
    base.setAttribute('cx', '0.5')
    base.setAttribute('cy', '0.5')
    base.setAttribute('r', '0.5')
    document.body.append(base)

    const top = createRadial('topRadialGrad')
    top.setAttribute('href', '#baseRadialGrad')
    top.setAttribute('fx', '0.3')

    const paint = new Paint({ radialGradient: top })
    expect(paint.radialGradient?.getAttribute('fx')).toBe('0.3')
    expect(paint.radialGradient?.getAttribute('cx')).toBe('0.5')

    base.remove()
  })

  it('should handle linearGradient with no stops', () => {
    const grad = createLinear('noStopsGrad')
    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.querySelectorAll('stop')).toHaveLength(0)
  })

  it('should copy paint object with type none', () => {
    const original = new Paint({})
    const copy = new Paint({ copy: original })
    expect(copy.type).toBe('none')
    expect(copy.solidColor).toBe(null)
  })

  it('should copy paint object with solidColor', () => {
    const original = new Paint({ solidColor: '#ff0000' })
    const copy = new Paint({ copy: original, alpha: 75 })
    expect(copy.type).toBe('solidColor')
    expect(copy.solidColor).toBe('ff0000')
    expect(copy.alpha).toBe(original.alpha)
  })

  it('should copy paint object with linearGradient', () => {
    const grad = createLinear('copyLinearGrad')
    const original = new Paint({ linearGradient: grad })
    const copy = new Paint({ copy: original })
    expect(copy.type).toBe('linearGradient')
    expect(copy.linearGradient).not.toBe(original.linearGradient)
    expect(copy.linearGradient?.id).toBe('copyLinearGrad')
  })

  it('should copy paint object with radialGradient', () => {
    const grad = createRadial('copyRadialGrad')
    document.body.append(grad)
    const original = new Paint({ radialGradient: grad })
    const copy = new Paint({ copy: original })
    expect(copy.type).toBe('radialGradient')
    expect(copy.radialGradient).not.toBe(original.radialGradient)
    expect(copy.radialGradient?.id).toBe('copyRadialGrad')
    grad.remove()
  })

  it('should handle gradient with invalid href reference', () => {
    const grad = createLinear('invalidHrefGrad')
    grad.setAttribute('href', '#nonExistentGradient')
    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('invalidHrefGrad')
  })

  it('should normalize alpha values correctly', () => {
    const paint1 = new Paint({ alpha: 150 })
    expect(paint1.alpha).toBe(100)
    const paint2 = new Paint({ alpha: -10 })
    expect(paint2.alpha).toBe(0)
    const paint3 = new Paint({ alpha: 'invalid' })
    expect(paint3.alpha).toBe(100)
  })

  it('should handle solidColor with none value', () => {
    const paint = new Paint({ solidColor: 'none' })
    expect(paint.type).toBe('solidColor')
    expect(paint.solidColor).toBe('none')
  })

  it('should normalize solidColor without hash', () => {
    const paint = new Paint({ solidColor: 'red' })
    expect(paint.type).toBe('solidColor')
    expect(paint.solidColor).toBe('red')
  })

  it('should handle linearGradient with url() format in href', () => {
    const base = createLinear('baseUrlGrad')
    base.setAttribute('x1', '0')
    base.setAttribute('x2', '1')
    document.body.append(base)

    const top = createLinear('topUrlGrad')
    top.setAttribute('href', 'url(#baseUrlGrad)')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('x1')).toBe('0')
    expect(paint.linearGradient?.getAttribute('x2')).toBe('1')

    base.remove()
  })

  it('should handle gradient with empty string attributes', () => {
    const base = createLinear('baseEmptyGrad')
    base.setAttribute('x1', '0.5')
    document.body.append(base)

    const top = createLinear('topEmptyGrad')
    top.setAttribute('href', '#baseEmptyGrad')
    top.setAttribute('x1', '')

    const paint = new Paint({ linearGradient: top })
    // Empty attribute should be replaced by inherited value
    expect(paint.linearGradient?.getAttribute('x1')).toBe('0.5')

    base.remove()
  })

  it('should handle gradient with stops inheritance', () => {
    const base = createLinear('baseStopsGrad')
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0')
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '1')
    base.append(stop1, stop2)
    document.body.append(base)

    const top = createLinear('topNoStopsGrad')
    top.setAttribute('href', '#baseStopsGrad')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.querySelectorAll('stop')).toHaveLength(2)

    base.remove()
  })

  it('should handle mismatched gradient types', () => {
    const base = createLinear('baseMismatchGrad')
    document.body.append(base)

    const top = createRadial('topMismatchGrad')
    top.setAttribute('href', '#baseMismatchGrad')

    const paint = new Paint({ radialGradient: top })
    // Should not inherit from mismatched type
    expect(paint.radialGradient?.id).toBe('topMismatchGrad')

    base.remove()
  })

  it('should handle circular gradient references', () => {
    const grad1 = createLinear('circularGrad1')
    grad1.setAttribute('href', '#circularGrad2')
    document.body.append(grad1)

    const grad2 = createLinear('circularGrad2')
    grad2.setAttribute('href', '#circularGrad1')
    document.body.append(grad2)

    const paint = new Paint({ linearGradient: grad1 })
    // Should handle circular reference without infinite loop
    expect(paint.linearGradient?.id).toBe('circularGrad1')

    grad1.remove()
    grad2.remove()
  })

  it('should normalize alpha with null value', () => {
    const paint = new Paint({ alpha: null })
    expect(paint.alpha).toBe(0)
  })

  it('should normalize alpha with undefined', () => {
    const paint = new Paint({ alpha: undefined })
    expect(paint.alpha).toBe(100)
  })

  it('should normalize solidColor with empty string', () => {
    const paint = new Paint({ solidColor: '' })
    expect(paint.type).toBe('none')
    expect(paint.solidColor).toBe(null)
  })

  it('should normalize solidColor with whitespace', () => {
    const paint = new Paint({ solidColor: '   ' })
    expect(paint.type).toBe('solidColor')
    expect(paint.solidColor).toBe(null)
  })

  it('should handle extractHrefId with path in URL', () => {
    const grad = createLinear('pathGrad')
    grad.setAttribute('href', 'file.svg#targetGrad')
    document.body.append(grad)

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('pathGrad')

    grad.remove()
  })

  it('should handle gradient without ownerDocument', () => {
    const grad = createLinear('noDocGrad')
    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('noDocGrad')
  })

  it('should copy paint with null linearGradient', () => {
    const original = new Paint({ linearGradient: null })
    const copy = new Paint({ copy: original })
    expect(copy.type).toBe('none')
    expect(copy.linearGradient).toBe(null)
  })

  it('should handle href with double quotes in url()', () => {
    const base = createLinear('doubleQuoteGrad')
    base.setAttribute('x1', '0.25')
    document.body.append(base)

    const top = createLinear('topDoubleQuoteGrad')
    top.setAttribute('href', 'url("#doubleQuoteGrad")')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('x1')).toBe('0.25')

    base.remove()
  })

  it('should handle href with single quotes in url()', () => {
    const base = createLinear('singleQuoteGrad')
    base.setAttribute('y1', '0.75')
    document.body.append(base)

    const top = createLinear('topSingleQuoteGrad')
    top.setAttribute('href', "url('#singleQuoteGrad')")

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('y1')).toBe('0.75')

    base.remove()
  })

  it('should handle gradient with non-matching tagName case', () => {
    const base = createLinear('baseCaseGrad')
    document.body.append(base)

    const top = createRadial('topCaseGrad')
    top.setAttribute('href', '#baseCaseGrad')

    const paint = new Paint({ radialGradient: top })
    // Should not inherit from wrong gradient type
    expect(paint.radialGradient?.id).toBe('topCaseGrad')

    base.remove()
  })

  it('should handle gradient href with just hash', () => {
    const base = createLinear('hashOnlyGrad')
    base.setAttribute('x2', '1')
    document.body.append(base)

    const top = createLinear('topHashGrad')
    top.setAttribute('href', '#hashOnlyGrad')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('x2')).toBe('1')

    base.remove()
  })

  it('should handle invalid alpha values', () => {
    const paint1 = new Paint({ alpha: NaN })
    expect(paint1.alpha).toBe(100)

    const paint2 = new Paint({ alpha: Infinity })
    expect(paint2.alpha).toBe(100)

    const paint3 = new Paint({ alpha: -Infinity })
    expect(paint3.alpha).toBe(100)
  })

  it('should handle copy with missing clone method', () => {
    const original = new Paint({ linearGradient: createLinear('copyGrad') })
    original.linearGradient = { id: 'fake', cloneNode: null }
    const copy = new Paint({ copy: original })
    expect(copy.linearGradient).toBe(null)
  })

  it('should handle alpha at exact boundaries', () => {
    const paint1 = new Paint({ alpha: 0 })
    expect(paint1.alpha).toBe(0)

    const paint2 = new Paint({ alpha: 100 })
    expect(paint2.alpha).toBe(100)

    const paint3 = new Paint({ alpha: 50 })
    expect(paint3.alpha).toBe(50)
  })

  it('should handle gradient with null getAttribute', () => {
    const grad = createLinear('nullAttrGrad')
    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('nullAttrGrad')
  })

  it('should handle referenced gradient with no attributes', () => {
    const base = createLinear('emptyAttrGrad')
    document.body.append(base)

    const top = createLinear('topEmptyAttrGrad')
    top.setAttribute('href', '#emptyAttrGrad')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.id).toBe('topEmptyAttrGrad')

    base.remove()
  })

  it('should handle href with spaces in url()', () => {
    const base = createLinear('spacesGrad')
    base.setAttribute('gradientUnits', 'userSpaceOnUse')
    document.body.append(base)

    const top = createLinear('topSpacesGrad')
    top.setAttribute('href', 'url(  #spacesGrad  )')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('gradientUnits')).toBe('userSpaceOnUse')

    base.remove()
  })

  it('should handle solidColor with hash prefix', () => {
    const paint = new Paint({ solidColor: '#ff0000' })
    expect(paint.type).toBe('solidColor')
    expect(paint.solidColor).toBe('ff0000')
  })

  it('should handle solidColor without hash prefix', () => {
    const paint = new Paint({ solidColor: 'blue' })
    expect(paint.type).toBe('solidColor')
    expect(paint.solidColor).toBe('blue')
  })

  it('should handle gradient with id attribute skip', () => {
    const base = createLinear('idTestGrad')
    base.setAttribute('x1', '0.1')
    base.setAttribute('id', 'differentId')
    document.body.append(base)

    const top = createLinear('topIdTestGrad')
    top.setAttribute('href', '#idTestGrad')

    const paint = new Paint({ linearGradient: top })
    // Should not copy id attribute
    expect(paint.linearGradient?.id).not.toBe('differentId')

    base.remove()
  })

  it('should handle gradient with xlink:href attribute skip', () => {
    const base = createLinear('xlinkTestGrad')
    base.setAttribute('y1', '0.2')
    document.body.append(base)

    const top = createLinear('topXlinkTestGrad')
    top.setAttribute('xlink:href', '#xlinkTestGrad')

    const paint = new Paint({ linearGradient: top })
    expect(paint.linearGradient?.getAttribute('y1')).toBe('0.2')
    // xlink:href should be removed
    expect(paint.linearGradient?.hasAttribute('xlink:href')).toBe(false)

    base.remove()
  })

  it('should handle href pointing to path with hash', () => {
    const grad = createLinear('pathHashGrad')
    grad.setAttribute('href', 'images/file.svg#someGrad')

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('pathHashGrad')
  })

  it('should handle href ending with just hash', () => {
    const grad = createLinear('trailingHashGrad')
    grad.setAttribute('href', 'file.svg#')

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('trailingHashGrad')
  })

  it('should handle href with no hash', () => {
    const grad = createLinear('noHashGrad')
    grad.setAttribute('href', 'file.svg')

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('noHashGrad')
  })

  it('should handle empty href attribute', () => {
    const grad = createLinear('emptyHrefGrad')
    grad.setAttribute('href', '')

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('emptyHrefGrad')
  })

  it('should handle gradient with null ownerDocument fallback', () => {
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    grad.setAttribute('id', 'nullDocGrad2')
    // Don't append to document

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('nullDocGrad2')
  })

  it('should handle radialGradient with xlink:href', () => {
    const grad = createRadial('xlinkRadial')
    grad.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#baseRadial')

    const paint = new Paint({ radialGradient: grad })
    expect(paint.radialGradient?.id).toBe('xlinkRadial')
  })

  it('should handle gradient with both href and xlink:href', () => {
    const grad = createLinear('dualHref')
    grad.setAttribute('href', '#newer')
    grad.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#older')

    const paint = new Paint({ linearGradient: grad })
    expect(paint.linearGradient?.id).toBe('dualHref')
  })
})
