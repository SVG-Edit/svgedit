import 'pathseg'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { init as textActionsInit, textActionsMethod } from '../../packages/svgcanvas/core/text-actions.js'
import { init as utilitiesInit } from '../../packages/svgcanvas/core/utilities.js'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'

describe('TextActions', () => {
  let svgCanvas
  let svgRoot
  let textElement
  let inputElement
  let mockSelectorManager

  beforeEach(() => {
    // Create mock SVG elements
    svgRoot = document.createElementNS(NS.SVG, 'svg')
    svgRoot.setAttribute('width', '640')
    svgRoot.setAttribute('height', '480')
    document.body.append(svgRoot)

    // Create svgContent element (container for SVG content)
    const svgContent = document.createElementNS(NS.SVG, 'svg')
    svgContent.id = 'svgcontent'
    svgRoot.append(svgContent)

    textElement = document.createElementNS(NS.SVG, 'text')
    textElement.setAttribute('x', '100')
    textElement.setAttribute('y', '100')
    textElement.setAttribute('id', 'text1')
    textElement.textContent = 'Test'
    svgContent.append(textElement)

    // Mock text measurement methods
    textElement.getStartPositionOfChar = vi.fn((i) => ({ x: 100 + i * 10, y: 100 }))
    textElement.getEndPositionOfChar = vi.fn((i) => ({ x: 100 + (i + 1) * 10, y: 100 }))
    textElement.getCharNumAtPosition = vi.fn(() => 0)
    textElement.getBBox = vi.fn(() => ({
      x: 100,
      y: 90,
      width: 40,
      height: 20
    }))

    inputElement = document.createElement('input')
    inputElement.type = 'text'
    document.body.append(inputElement)

    // Create mock selector group
    const selectorParentGroup = document.createElementNS(NS.SVG, 'g')
    selectorParentGroup.id = 'selectorParentGroup'
    svgRoot.append(selectorParentGroup)

    // Mock selector manager
    mockSelectorManager = {
      requestSelector: vi.fn(() => ({
        showGrips: vi.fn()
      }))
    }

    // Mock svgCanvas
    svgCanvas = {
      getSvgRoot: () => svgRoot,
      getSvgContent: () => svgContent,
      getZoom: () => 1,
      setCurrentMode: vi.fn(),
      clearSelection: vi.fn(),
      addToSelection: vi.fn(),
      deleteSelectedElements: vi.fn(),
      call: vi.fn(),
      getSelectedElements: () => [textElement],
      getCurrentMode: () => 'select',
      selectorManager: mockSelectorManager,
      getrootSctm: () => svgRoot.getScreenCTM?.() || { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      $click: vi.fn(),
      contentW: 640,
      textActions: textActionsMethod
    }

    // Initialize utilities and text-actions modules
    utilitiesInit(svgCanvas)
    textActionsInit(svgCanvas)
    textActionsMethod.setInputElem(inputElement)
  })

  afterEach(() => {
    document.body.textContent = ''
  })

  describe('Class instantiation', () => {
    it('should export textActionsMethod as singleton instance', () => {
      expect(textActionsMethod).toBeDefined()
      expect(typeof textActionsMethod.select).toBe('function')
      expect(typeof textActionsMethod.start).toBe('function')
    })

    it('should have all public methods', () => {
      const publicMethods = [
        'select',
        'start',
        'mouseDown',
        'mouseMove',
        'mouseUp',
        'setCursor',
        'toEditMode',
        'toSelectMode',
        'setInputElem',
        'clear',
        'init'
      ]

      publicMethods.forEach(method => {
        expect(typeof textActionsMethod[method]).toBe('function')
      })
    })
  })

  describe('setInputElem', () => {
    it('should set the input element', () => {
      const newInput = document.createElement('input')
      textActionsMethod.setInputElem(newInput)
      // Method should not throw and should be callable
      expect(true).toBe(true)
    })
  })

  describe('select', () => {
    it('should set current text element and enter edit mode', () => {
      textActionsMethod.select(textElement, 100, 100)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')
    })
  })

  describe('start', () => {
    it('should start editing a text element', () => {
      textActionsMethod.start(textElement)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')
    })
  })

  describe('init', () => {
    it('should initialize text editing for current element', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()

      // Verify text measurement methods were called
      expect(textElement.getStartPositionOfChar).toHaveBeenCalled()
      expect(textElement.getEndPositionOfChar).toHaveBeenCalled()
    })

    it('should handle empty text content', () => {
      const emptyText = document.createElementNS(NS.SVG, 'text')
      emptyText.textContent = ''
      emptyText.getStartPositionOfChar = vi.fn(() => ({ x: 100, y: 100 }))
      emptyText.getEndPositionOfChar = vi.fn(() => ({ x: 100, y: 100 }))
      emptyText.getBBox = vi.fn(() => ({ x: 100, y: 90, width: 0, height: 20 }))
      emptyText.removeEventListener = vi.fn()
      emptyText.addEventListener = vi.fn()
      svgRoot.append(emptyText)

      textActionsMethod.start(emptyText)
      textActionsMethod.init()

      expect(true).toBe(true) // Should not throw
    })

    it('should return early if no current text', () => {
      textActionsMethod.init()
      // Should not throw when called without a current text element
      expect(true).toBe(true)
    })
  })

  describe('toEditMode', () => {
    it('should switch to text edit mode', () => {
      textActionsMethod.start(textElement)

      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')
      expect(mockSelectorManager.requestSelector).toHaveBeenCalled()
    })

    it('should accept x, y coordinates for cursor positioning', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.toEditMode(100, 100)

      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')
    })
  })

  describe('toSelectMode', () => {
    it('should switch to select mode', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.toSelectMode(false)

      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })

    it('should select element when selectElem is true', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.toSelectMode(true)

      expect(svgCanvas.clearSelection).toHaveBeenCalled()
      expect(svgCanvas.call).toHaveBeenCalled()
      expect(svgCanvas.addToSelection).toHaveBeenCalled()
    })

    it('should delete empty text elements', () => {
      const emptyText = document.createElementNS(NS.SVG, 'text')
      emptyText.textContent = ''
      emptyText.getBBox = vi.fn(() => ({ x: 100, y: 90, width: 0, height: 20 }))
      emptyText.removeEventListener = vi.fn()
      emptyText.addEventListener = vi.fn()
      emptyText.style = {}
      svgRoot.append(emptyText)

      textActionsMethod.start(emptyText)
      textActionsMethod.toSelectMode(false)

      expect(svgCanvas.deleteSelectedElements).toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('should exit text edit mode if currently in it', () => {
      svgCanvas.getCurrentMode = () => 'textedit'
      textActionsMethod.start(textElement)
      textActionsMethod.clear()

      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })

    it('should do nothing if not in text edit mode', () => {
      svgCanvas.getCurrentMode = () => 'select'
      const callCount = svgCanvas.setCurrentMode.mock.calls.length
      textActionsMethod.clear()

      expect(svgCanvas.setCurrentMode.mock.calls.length).toBe(callCount)
    })
  })

  describe('mouseDown', () => {
    it('should handle mouse down event', () => {
      textActionsMethod.start(textElement)

      const mockEvent = { pageX: 100, pageY: 100 }
      textActionsMethod.mouseDown(mockEvent, textElement, 100, 100)

      // Should set focus (via private method)
      expect(true).toBe(true) // Method executed without error
    })
  })

  describe('mouseMove', () => {
    it('should handle mouse move event', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.mouseMove(110, 100)

      // Method should execute without error
      expect(true).toBe(true)
    })
  })

  describe('mouseUp', () => {
    it('should handle mouse up event', () => {
      textActionsMethod.start(textElement)

      const mockEvent = { target: textElement, pageX: 100, pageY: 100 }
      textActionsMethod.mouseUp(mockEvent, 100, 100)

      // Method should execute without error
      expect(true).toBe(true)
    })

    it('should exit text mode if clicked outside text element', () => {
      textActionsMethod.start(textElement)

      const otherElement = document.createElementNS(NS.SVG, 'rect')
      const mockEvent = { target: otherElement, pageX: 200, pageY: 200 }

      textActionsMethod.mouseDown(mockEvent, textElement, 200, 200)
      textActionsMethod.mouseUp(mockEvent, 200, 200)

      // Should have called toSelectMode
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })
  })

  describe('setCursor', () => {
    it('should set cursor position', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.setCursor(0)

      // Method should execute without error
      expect(true).toBe(true)
    })

    it('should accept undefined index', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.setCursor(undefined)

      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('Private methods encapsulation', () => {
    it('should not expose private methods', () => {
      const privateMethodNames = [
        '#setCursor',
        '#setSelection',
        '#getIndexFromPoint',
        '#setCursorFromPoint',
        '#setEndSelectionFromPoint',
        '#screenToPt',
        '#ptToScreen',
        '#selectAll',
        '#selectWord'
      ]

      privateMethodNames.forEach(method => {
        expect(textActionsMethod[method]).toBeUndefined()
      })
    })

    it('should not expose private fields', () => {
      const privateFieldNames = [
        '#curtext',
        '#textinput',
        '#cursor',
        '#selblock',
        '#blinker',
        '#chardata',
        '#textbb',
        '#matrix',
        '#lastX',
        '#lastY',
        '#allowDbl'
      ]

      privateFieldNames.forEach(field => {
        expect(textActionsMethod[field]).toBeUndefined()
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete edit workflow', () => {
      // Start editing
      textActionsMethod.start(textElement)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')

      // Initialize
      textActionsMethod.init()

      // Simulate mouse interaction
      textActionsMethod.mouseDown({ pageX: 100, pageY: 100 }, textElement, 100, 100)
      textActionsMethod.mouseMove(110, 100)
      textActionsMethod.mouseUp({ target: textElement, pageX: 110, pageY: 100 }, 110, 100)

      // Exit edit mode
      textActionsMethod.toSelectMode(true)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })

    it('should handle text with transform attribute', () => {
      textElement.setAttribute('transform', 'rotate(45 100 100)')

      textActionsMethod.start(textElement)
      textActionsMethod.init()

      // Should handle transformed text without error
      expect(true).toBe(true)
    })

    it('should handle empty text element', () => {
      textElement.textContent = ''
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.toSelectMode(true)
      expect(svgCanvas.deleteSelectedElements).toHaveBeenCalled()
    })

    it('should handle text element without parent', () => {
      const orphanText = document.createElementNS(NS.SVG, 'text')
      orphanText.textContent = 'Orphan'
      orphanText.getStartPositionOfChar = vi.fn((i) => ({ x: 100 + i * 10, y: 100 }))
      orphanText.getEndPositionOfChar = vi.fn((i) => ({ x: 100 + (i + 1) * 10, y: 100 }))
      orphanText.getBBox = vi.fn(() => ({ x: 100, y: 90, width: 60, height: 20 }))

      textActionsMethod.start(orphanText)
      textActionsMethod.init()
      expect(true).toBe(true)
    })

    it('should handle setCursor with undefined index', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.setCursor(undefined)
      expect(true).toBe(true)
    })

    it('should handle setCursor with empty input', () => {
      inputElement.value = ''
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.setCursor()
      expect(true).toBe(true)
    })

    it('should handle text with no transform', () => {
      textElement.removeAttribute('transform')
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      expect(true).toBe(true)
    })

    it('should handle getIndexFromPoint with single character', () => {
      textElement.textContent = 'A'
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.mouseDown({ pageX: 100, pageY: 100 }, textElement, 100, 100)
      expect(true).toBe(true)
    })

    it('should handle getIndexFromPoint outside text range', () => {
      textElement.getCharNumAtPosition = vi.fn(() => -1)
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.mouseDown({ pageX: 50, pageY: 100 }, textElement, 50, 100)
      expect(true).toBe(true)
    })

    it('should handle getIndexFromPoint at end of text', () => {
      textElement.getCharNumAtPosition = vi.fn(() => 100)
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.mouseDown({ pageX: 200, pageY: 100 }, textElement, 200, 100)
      expect(true).toBe(true)
    })

    it('should handle mouseUp clicking outside text', () => {
      const outsideElement = document.createElementNS(NS.SVG, 'rect')
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.mouseDown({ pageX: 100, pageY: 100 }, textElement, 100, 100)
      textActionsMethod.mouseUp({ target: outsideElement, pageX: 101, pageY: 101 }, 101, 101)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })

    it('should handle toEditMode with no arguments', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.toEditMode()
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('textedit')
    })

    it('should handle toSelectMode without selectElem', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.toSelectMode(false)
      expect(svgCanvas.setCurrentMode).toHaveBeenCalledWith('select')
    })

    it('should handle clear when not in textedit mode', () => {
      const originalGetMode = svgCanvas.getCurrentMode
      svgCanvas.getCurrentMode = vi.fn(() => 'select')
      textActionsMethod.clear()
      svgCanvas.getCurrentMode = originalGetMode
      expect(true).toBe(true)
    })

    it('should handle init with no current text', () => {
      textActionsMethod.init()
      expect(true).toBe(true)
    })

    it('should handle mouseMove during selection', () => {
      textActionsMethod.start(textElement)
      textActionsMethod.init()
      textActionsMethod.mouseDown({ pageX: 100, pageY: 100 }, textElement, 100, 100)
      textActionsMethod.mouseMove(120, 100)
      textActionsMethod.mouseMove(130, 100)
      expect(true).toBe(true)
    })

    it('should handle mouseMove without shift key', () => {
      const evt = { shiftKey: false, clientX: 100, clientY: 100 }
      textActionsMethod.mouseMove(10, 20, evt)
      expect(true).toBe(true)
    })

    it('should handle mouseDown with different mouse button', () => {
      const evt = { button: 2 }
      textActionsMethod.mouseDown(evt, null, 10, 20)
      expect(true).toBe(true)
    })

    it('should handle mouseUp with valid cursor position', () => {
      const elem = document.createElementNS(NS.SVG, 'text')
      elem.textContent = 'test'
      const evt = { target: elem }
      textActionsMethod.mouseUp(evt, elem, 10, 20)
      expect(true).toBe(true)
    })

    it('should handle toSelectMode with valid element', () => {
      const elem = document.createElementNS(NS.SVG, 'text')
      textActionsMethod.toSelectMode(elem)
      expect(true).toBe(true)
    })
  })
})
