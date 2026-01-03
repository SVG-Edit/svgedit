import { describe, expect, it } from 'vitest'
import { clearSvgContentElementInit, init as initClear } from '../../packages/svgcanvas/core/clear.js'

const buildCanvas = (showOutside = false) => {
  const svgContent = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svgContent.append(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
  const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const curConfig = { dimensions: [300, 150], show_outside_canvas: showOutside }

  return {
    svgContent,
    svgRoot,
    curConfig,
    canvas: {
      getCurConfig: () => curConfig,
      getSvgContent: () => svgContent,
      getSvgRoot: () => svgRoot,
      getDOMDocument: () => document
    }
  }
}

describe('clearSvgContentElementInit', () => {
  it('clears existing children and sets canvas attributes', () => {
    const { canvas, svgContent, svgRoot } = buildCanvas(false)
    initClear(canvas)

    clearSvgContentElementInit()

    expect(svgRoot.contains(svgContent)).toBe(true)
    expect(svgContent.childNodes[0].nodeType).toBe(Node.COMMENT_NODE)
    expect(svgContent.getAttribute('id')).toBe('svgcontent')
    expect(svgContent.getAttribute('width')).toBe('300')
    expect(svgContent.getAttribute('height')).toBe('150')
    expect(svgContent.getAttribute('x')).toBe('300')
    expect(svgContent.getAttribute('y')).toBe('150')
    expect(svgContent.getAttribute('overflow')).toBe('hidden')
    expect(svgContent.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
  })

  it('resets stale svgcontent attributes', () => {
    const { canvas, svgContent } = buildCanvas(false)
    svgContent.setAttribute('viewBox', '0 0 10 10')
    svgContent.setAttribute('class', 'stale')
    initClear(canvas)

    clearSvgContentElementInit()

    expect(svgContent.getAttribute('viewBox')).toBe(null)
    expect(svgContent.getAttribute('class')).toBe(null)
  })

  it('honors show_outside_canvas by leaving overflow visible', () => {
    const { canvas, svgContent } = buildCanvas(true)
    initClear(canvas)

    clearSvgContentElementInit()

    expect(svgContent.getAttribute('overflow')).toBe('visible')
  })
})
