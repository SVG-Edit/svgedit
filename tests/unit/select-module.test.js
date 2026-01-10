import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { init as selectInit, getSelectorManager, Selector, SelectorManager } from '../../packages/svgcanvas/core/select.js'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'

describe('Select Module', () => {
  let svgRoot
  let svgContent
  let svgCanvas
  let rectElement
  let circleElement

  beforeEach(() => {
    // Create mock SVG elements
    svgRoot = document.createElementNS(NS.SVG, 'svg')
    svgRoot.setAttribute('width', '640')
    svgRoot.setAttribute('height', '480')
    document.body.append(svgRoot)

    svgContent = document.createElementNS(NS.SVG, 'g')
    svgContent.setAttribute('id', 'svgcontent')
    svgRoot.append(svgContent)

    rectElement = document.createElementNS(NS.SVG, 'rect')
    rectElement.setAttribute('id', 'rect1')
    rectElement.setAttribute('x', '10')
    rectElement.setAttribute('y', '10')
    rectElement.setAttribute('width', '100')
    rectElement.setAttribute('height', '50')
    svgContent.append(rectElement)

    circleElement = document.createElementNS(NS.SVG, 'circle')
    circleElement.setAttribute('id', 'circle1')
    circleElement.setAttribute('cx', '200')
    circleElement.setAttribute('cy', '200')
    circleElement.setAttribute('r', '50')
    svgContent.append(circleElement)

    // Mock data storage
    const mockDataStorage = {
      _storage: new Map(),
      put: function (element, key, value) {
        if (!this._storage.has(element)) {
          this._storage.set(element, new Map())
        }
        this._storage.get(element).set(key, value)
      },
      get: function (element, key) {
        return this._storage.has(element) ? this._storage.get(element).get(key) : undefined
      },
      has: function (element, key) {
        return this._storage.has(element) && this._storage.get(element).has(key)
      }
    }

    // Mock svgCanvas
    svgCanvas = {
      getSvgRoot: () => svgRoot,
      getSvgContent: () => svgContent,
      getZoom: () => 1,
      getDataStorage: () => mockDataStorage,
      curConfig: {
        imgPath: 'images',
        dimensions: [640, 480]
      },
      createSVGElement: vi.fn((config) => {
        const elem = document.createElementNS(NS.SVG, config.element)
        if (config.attr) {
          Object.entries(config.attr).forEach(([key, value]) => {
            elem.setAttribute(key, String(value))
          })
        }
        return elem
      })
    }

    // Initialize select module
    selectInit(svgCanvas)
  })

  afterEach(() => {
    document.body.textContent = ''
  })

  describe('Module initialization', () => {
    it('should initialize and return SelectorManager singleton', () => {
      const manager = getSelectorManager()
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(SelectorManager)
    })

    it('should return the same SelectorManager instance', () => {
      const manager1 = getSelectorManager()
      const manager2 = getSelectorManager()
      expect(manager1).toBe(manager2)
    })

    it('should not expose private selectorManager field', () => {
      const manager = getSelectorManager()
      expect(manager.selectorManager).toBeUndefined()
      expect(manager.selectorManager_).toBeUndefined()
    })
  })

  describe('SelectorManager class', () => {
    let manager

    beforeEach(() => {
      manager = getSelectorManager()
    })

    it('should have initialized all required properties', () => {
      expect(manager.selectorParentGroup).toBeDefined()
      expect(manager.rubberBandBox).toBeNull()
      expect(manager.selectors).toEqual([])
      expect(manager.selectorMap).toEqual({})
      expect(manager.selectorGrips).toBeDefined()
      expect(manager.selectorGripsGroup).toBeDefined()
      expect(manager.rotateGripConnector).toBeDefined()
      expect(manager.rotateGrip).toBeDefined()
    })

    it('should have all 8 selector grips', () => {
      const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
      directions.forEach(dir => {
        expect(manager.selectorGrips[dir]).toBeDefined()
        expect(manager.selectorGrips[dir].tagName).toBe('circle')
      })
    })

    it('should create selectorParentGroup in DOM', () => {
      const parentGroup = svgRoot.querySelector('#selectorParentGroup')
      expect(parentGroup).toBeDefined()
      expect(parentGroup).toBe(manager.selectorParentGroup)
    })

    describe('requestSelector', () => {
      it('should create a new selector for an element', () => {
        const selector = manager.requestSelector(rectElement)
        expect(selector).toBeInstanceOf(Selector)
        expect(selector.selectedElement).toBe(rectElement)
        expect(selector.locked).toBe(true)
      })

      it('should return existing selector for same element', () => {
        const selector1 = manager.requestSelector(rectElement)
        const selector2 = manager.requestSelector(rectElement)
        expect(selector1).toBe(selector2)
      })

      it('should reuse unlocked selectors', () => {
        const selector1 = manager.requestSelector(rectElement)
        manager.releaseSelector(rectElement)
        const selector2 = manager.requestSelector(circleElement)
        expect(selector1).toBe(selector2)
        expect(selector2.selectedElement).toBe(circleElement)
      })

      it('should create multiple selectors when needed', () => {
        const selector1 = manager.requestSelector(rectElement)
        const selector2 = manager.requestSelector(circleElement)
        expect(selector1).not.toBe(selector2)
        expect(manager.selectors.length).toBe(2)
      })

      it('should return null for null element', () => {
        const selector = manager.requestSelector(null)
        expect(selector).toBeNull()
      })

      it('should add selector to selectorMap', () => {
        const selector = manager.requestSelector(rectElement)
        expect(manager.selectorMap[rectElement.id]).toBe(selector)
      })
    })

    describe('releaseSelector', () => {
      it('should unlock selector', () => {
        const selector = manager.requestSelector(rectElement)
        expect(selector.locked).toBe(true)
        manager.releaseSelector(rectElement)
        expect(selector.locked).toBe(false)
      })

      it('should remove selector from selectorMap', () => {
        manager.requestSelector(rectElement)
        expect(manager.selectorMap[rectElement.id]).toBeDefined()
        manager.releaseSelector(rectElement)
        expect(manager.selectorMap[rectElement.id]).toBeUndefined()
      })

      it('should clear selectedElement', () => {
        const selector = manager.requestSelector(rectElement)
        manager.releaseSelector(rectElement)
        expect(selector.selectedElement).toBeNull()
      })

      it('should hide selector group', () => {
        const selector = manager.requestSelector(rectElement)
        manager.releaseSelector(rectElement)
        expect(selector.selectorGroup.getAttribute('display')).toBe('none')
      })

      it('should handle null element gracefully', () => {
        expect(() => manager.releaseSelector(null)).not.toThrow()
      })
    })

    describe('getRubberBandBox', () => {
      it('should create rubber band box on first call', () => {
        const rubberBand = manager.getRubberBandBox()
        expect(rubberBand).toBeDefined()
        expect(rubberBand.tagName).toBe('rect')
        expect(rubberBand.id).toBe('selectorRubberBand')
      })

      it('should return same rubber band box on subsequent calls', () => {
        const rubberBand1 = manager.getRubberBandBox()
        const rubberBand2 = manager.getRubberBandBox()
        expect(rubberBand1).toBe(rubberBand2)
      })

      it('should have correct initial display state', () => {
        const rubberBand = manager.getRubberBandBox()
        expect(rubberBand.getAttribute('display')).toBe('none')
      })
    })

    describe('initGroup', () => {
      it('should reset selectors and selectorMap', () => {
        manager.requestSelector(rectElement)
        manager.initGroup()
        expect(manager.selectors).toEqual([])
        expect(manager.selectorMap).toEqual({})
      })

      it('should recreate selectorParentGroup', () => {
        const oldGroup = manager.selectorParentGroup
        manager.initGroup()
        const newGroup = manager.selectorParentGroup
        expect(newGroup).not.toBe(oldGroup)
        expect(newGroup.id).toBe('selectorParentGroup')
      })

      it('should create canvasBackground if not exists', () => {
        // Remove any existing background
        const existing = document.getElementById('canvasBackground')
        if (existing) existing.remove()

        manager.initGroup()
        const background = document.getElementById('canvasBackground')
        expect(background).toBeDefined()
        expect(background.tagName).toBe('svg')
      })
    })
  })

  describe('Selector class', () => {
    let manager
    let selector

    beforeEach(() => {
      manager = getSelectorManager()
      selector = manager.requestSelector(rectElement)
    })

    it('should have correct initial properties', () => {
      expect(selector.id).toBeDefined()
      expect(selector.selectedElement).toBe(rectElement)
      expect(selector.locked).toBe(true)
      expect(selector.selectorGroup).toBeDefined()
      expect(selector.selectorRect).toBeDefined()
    })

    it('should have all grip coordinates initialized', () => {
      const expectedGrips = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
      expectedGrips.forEach(grip => {
        expect(selector.gripCoords[grip]).toBeDefined()
      })
    })

    describe('reset', () => {
      it('should update selectedElement', () => {
        selector.reset(circleElement)
        expect(selector.selectedElement).toBe(circleElement)
      })

      it('should lock the selector', () => {
        selector.locked = false
        selector.reset(circleElement)
        expect(selector.locked).toBe(true)
      })

      it('should show selectorGroup', () => {
        selector.selectorGroup.setAttribute('display', 'none')
        selector.reset(circleElement)
        expect(selector.selectorGroup.getAttribute('display')).toBe('inline')
      })
    })

    describe('resize', () => {
      it('should update selectorRect d attribute', () => {
        selector.resize()
        const d = selector.selectorRect.getAttribute('d')
        expect(d).toBeTruthy()
        expect(d).toMatch(/^M/)
      })

      it('should update grip coordinates', () => {
        selector.resize()
        expect(selector.gripCoords.nw).toBeDefined()
        expect(Array.isArray(selector.gripCoords.nw)).toBe(true)
        expect(selector.gripCoords.nw.length).toBe(2)
      })

      it('should use provided bbox when given', () => {
        const customBbox = { x: 50, y: 50, width: 200, height: 100 }
        selector.resize(customBbox)
        const d = selector.selectorRect.getAttribute('d')
        expect(d).toBeTruthy()
      })
    })

    describe('showGrips', () => {
      it('should show grips when true', () => {
        selector.showGrips(true)
        expect(selector.hasGrips).toBe(true)
        expect(manager.selectorGripsGroup.getAttribute('display')).toBe('inline')
      })

      it('should hide grips when false', () => {
        selector.showGrips(true)
        selector.showGrips(false)
        expect(selector.hasGrips).toBe(false)
        expect(manager.selectorGripsGroup.getAttribute('display')).toBe('none')
      })

      it('should append gripsGroup to selectorGroup when showing', () => {
        selector.showGrips(true)
        expect(selector.selectorGroup.contains(manager.selectorGripsGroup)).toBe(true)
      })
    })

    describe('updateGripCursors (static)', () => {
      it('should update cursor styles for rotated elements', () => {
        Selector.updateGripCursors(45)
        const updatedCursor = manager.selectorGrips.nw.getAttribute('style')
        // After 45-degree rotation, cursors should shift
        expect(updatedCursor).toBeTruthy()
        expect(updatedCursor).toMatch(/cursor:/)
      })

      it('should handle negative angles', () => {
        expect(() => Selector.updateGripCursors(-45)).not.toThrow()
      })

      it('should handle zero angle', () => {
        Selector.updateGripCursors(0)
        expect(manager.selectorGrips.nw.getAttribute('style')).toMatch(/nw-resize/)
      })

      it('should handle 360-degree rotation', () => {
        Selector.updateGripCursors(360)
        expect(manager.selectorGrips.nw.getAttribute('style')).toMatch(/nw-resize/)
      })
    })
  })

  describe('Integration scenarios', () => {
    let manager

    beforeEach(() => {
      manager = getSelectorManager()
    })

    it('should handle multiple element selection workflow', () => {
      const selector1 = manager.requestSelector(rectElement)
      const selector2 = manager.requestSelector(circleElement)

      expect(selector1.selectedElement).toBe(rectElement)
      expect(selector2.selectedElement).toBe(circleElement)
      expect(manager.selectors.length).toBe(2)

      selector1.showGrips(true)
      expect(selector1.hasGrips).toBe(true)

      manager.releaseSelector(rectElement)
      expect(selector1.locked).toBe(false)
    })

    it('should handle selector reuse efficiently', () => {
      // Create and release multiple selectors
      const s1 = manager.requestSelector(rectElement)
      manager.releaseSelector(rectElement)

      const s2 = manager.requestSelector(circleElement)
      manager.releaseSelector(circleElement)

      const s3 = manager.requestSelector(rectElement)

      // Should reuse the same selector object
      expect(s1).toBe(s2)
      expect(s2).toBe(s3)
      expect(manager.selectors.length).toBe(1)
    })

    it('should handle element with transforms', () => {
      rectElement.setAttribute('transform', 'rotate(45 60 35)')
      const selector = manager.requestSelector(rectElement)

      expect(() => selector.resize()).not.toThrow()
      expect(selector.selectorRect.getAttribute('d')).toBeTruthy()
    })

    it('should handle group elements', () => {
      const group = document.createElementNS(NS.SVG, 'g')
      group.setAttribute('id', 'testgroup')
      group.append(rectElement.cloneNode())
      svgContent.append(group)

      const selector = manager.requestSelector(group)
      expect(() => selector.resize()).not.toThrow()
    })

    it('should handle rubber band box for multi-select', () => {
      const rubberBand = manager.getRubberBandBox()

      rubberBand.setAttribute('x', '10')
      rubberBand.setAttribute('y', '10')
      rubberBand.setAttribute('width', '100')
      rubberBand.setAttribute('height', '100')
      rubberBand.setAttribute('display', 'inline')

      expect(rubberBand.getAttribute('display')).toBe('inline')
    })
  })

  describe('Edge cases', () => {
    let manager

    beforeEach(() => {
      manager = getSelectorManager()
    })

    it('should handle elements with zero dimensions', () => {
      const zeroRect = document.createElementNS(NS.SVG, 'rect')
      zeroRect.setAttribute('id', 'zerorect')
      zeroRect.setAttribute('width', '0')
      zeroRect.setAttribute('height', '0')
      svgContent.append(zeroRect)

      const selector = manager.requestSelector(zeroRect)
      expect(() => selector.resize()).not.toThrow()
    })

    it('should handle elements without id', () => {
      const noIdRect = document.createElementNS(NS.SVG, 'rect')
      svgContent.append(noIdRect)

      const selector = manager.requestSelector(noIdRect)
      expect(selector).toBeDefined()
    })

    it('should handle requesting same element twice without release', () => {
      const selector1 = manager.requestSelector(rectElement)
      const selector2 = manager.requestSelector(rectElement)

      expect(selector1).toBe(selector2)
      expect(selector1.locked).toBe(true)
    })
  })

  describe('Private field encapsulation', () => {
    it('should not expose SelectModule private field', () => {
      const manager = getSelectorManager()
      expect(manager.selectorManager).toBeUndefined()
      expect(manager['#selectorManager']).toBeUndefined()
    })
  })
})
