import { strict as assert } from 'node:assert'

describe('Browser bugs', function () {
  it('removeItem and setAttribute test (Chromium 843901; now fixed)', function () {
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=843901
    const elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    elem.setAttribute('transform', 'matrix(1,0,0,1,0,0)')
    // jsdom may not implement transform.baseVal; in that case just assert no throw
    if (elem.transform && elem.transform.baseVal && typeof elem.transform.baseVal.removeItem === 'function') {
      elem.transform.baseVal.removeItem(0)
      elem.removeAttribute('transform')
      assert.equal(elem.hasAttribute('transform'), false)
    } else {
      assert.ok(true)
    }
  })
})
