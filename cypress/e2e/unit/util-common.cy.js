import assert from 'assert'
import {
  findPos,
  isObject,
  mergeDeep,
  getClosest,
  getParents,
  getParentsUntil
} from '../../../packages/svgcanvas/common/util.js'

describe('Util Functions', () => {
  context('findPos', () => {
    it('should correctly compute cumulative offsets when offsetParent exists', () => {
      const grandparent = document.createElement('div')
      Object.defineProperty(grandparent, 'offsetLeft', { get: () => 100 })
      Object.defineProperty(grandparent, 'offsetTop', { get: () => 200 })
      Object.defineProperty(grandparent, 'offsetParent', { get: () => null })

      const container = document.createElement('div')
      Object.defineProperty(container, 'offsetLeft', { get: () => 10 })
      Object.defineProperty(container, 'offsetTop', { get: () => 20 })
      Object.defineProperty(container, 'offsetParent', {
        get: () => grandparent
      })

      const child = document.createElement('div')
      Object.defineProperty(child, 'offsetLeft', { get: () => 5 })
      Object.defineProperty(child, 'offsetTop', { get: () => 5 })
      Object.defineProperty(child, 'offsetParent', { get: () => container })

      const pos = findPos(child)
      assert.equal(pos.left, 115)
      assert.equal(pos.top, 225)
    })
  })

  context('isObject', () => {
    it('should return true for plain objects', () => {
      assert.equal(isObject({}), true)
      assert.equal(isObject({ a: 1 }), true)
    })
    it('should return false for non-objects such as arrays, null, and primitives', () => {
      assert.equal(isObject([]), false)
      assert.equal(isObject(42), false)
      assert.equal(isObject('test'), false)
    })
  })

  context('mergeDeep', () => {
    it('should merge two objects deeply', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: { d: 3 }, e: 4 }
      const merged = mergeDeep(target, source)
      assert.deepEqual(merged, { a: 1, b: { c: 2, d: 3 }, e: 4 })
    })

    it('should override non-object properties in target with source values', () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { a: 100, b: 200 }
      const merged = mergeDeep(target, source)
      assert.deepEqual(merged, { a: 100, b: 200 })
    })
  })

  context('getClosest', () => {
    let container
    beforeEach(() => {
      container = document.createElement('div')
      container.innerHTML = `
            <div id="parent" class="parent-class">
                <div class="child-class" data-test="child">
                    <span id="target">Text</span>
                </div>
            </div>`
      document.body.appendChild(container)
    })
    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return the closest element matching a class selector', () => {
      const target = document.getElementById('target')
      const closest = getClosest(target, '.parent-class')
      assert.notEqual(closest, null)
      assert.equal(closest.id, 'parent')
    })

    it('should return the closest element matching an id selector', () => {
      const target = document.getElementById('target')
      const closest = getClosest(target, '#parent')
      assert.notEqual(closest, null)
      assert.equal(closest.id, 'parent')
    })

    it('should return the closest element matching a data attribute selector', () => {
      const target = document.getElementById('target')
      const closest = getClosest(target, '[data-test="child"]')
      assert.notEqual(closest, null)
      assert.equal(closest.classList.contains('child-class'), true)
    })

    it('should return the closest element matching a tag selector', () => {
      const target = document.getElementById('target')
      const closest = getClosest(target, 'div')
      assert.notEqual(closest, null)
      // The immediate parent with class "child-class" is the first <div> element encountered.
      assert.equal(closest.classList.contains('child-class'), true)
    })

    it('should return null when no matching element is found', () => {
      const target = document.getElementById('target')
      const closest = getClosest(target, '.non-existent')
      assert.equal(closest, null)
    })
  })

  context('getParents', () => {
    let container
    beforeEach(() => {
      container = document.createElement('div')
      container.innerHTML = `
            <section id="grandparent" class="gp">
                <div id="parent" class="p">
                    <span id="child" class="c">Content</span>
                </div>
            </section>`
      document.body.appendChild(container)
    })
    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return all parent elements when no selector is provided', () => {
      const child = document.getElementById('child')
      const parents = getParents(child)
      assert.ok(Array.isArray(parents))
      // At least the parent div and section should be included.
      assert.ok(parents.includes(document.getElementById('parent')))
      assert.ok(parents.includes(document.getElementById('grandparent')))
    })

    it('should return only parent elements that match a class selector', () => {
      const child = document.getElementById('child')
      const parents = getParents(child, '.p')
      assert.ok(Array.isArray(parents))
      assert.equal(parents.length, 1)
      assert.equal(parents[0].id, 'parent')
    })

    it('should return only parent elements that match an id selector', () => {
      const child = document.getElementById('child')
      const parents = getParents(child, '#grandparent')
      assert.ok(Array.isArray(parents))
      assert.equal(parents.length, 1)
      assert.equal(parents[0].id, 'grandparent')
    })

    it('should return only parent elements that match a tag selector', () => {
      const child = document.getElementById('child')
      const parents = getParents(child, 'section')
      assert.ok(Array.isArray(parents))
      assert.equal(parents[0].tagName.toLowerCase(), 'section')
    })
  })

  context('getParentsUntil', () => {
    let container
    beforeEach(() => {
      container = document.createElement('div')
      container.innerHTML = `
            <div id="ancestor">
                <div id="parent">
                    <div class="intermediate">
                        <span id="child">Content</span>
                    </div>
                </div>
            </div>`
      document.body.appendChild(container)
    })
    afterEach(() => {
      document.body.removeChild(container)
    })

    it('should return parents until reaching the specified parent (using an id selector)', () => {
      const child = document.getElementById('child')
      const result = getParentsUntil(child, '#parent', '.intermediate')
      // The intermediate element should be included but should stop before reaching the parent with id "parent".
      assert.ok(result.every(el => el.id !== 'parent'))
    })

    it('should return all parents when the until parent is not found', () => {
      const child = document.getElementById('child')
      const result = getParentsUntil(child, '.nonexistent', '.intermediate')
      assert.ok(Array.isArray(result))
      assert.ok(result.length > 0)
    })
  })
})
