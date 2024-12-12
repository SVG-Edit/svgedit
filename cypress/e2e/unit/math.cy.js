import { NS } from '../../../packages/svgcanvas/core/namespaces.js'
import * as math from '../../../packages/svgcanvas/core/math.js'

describe('math', function () {
  const svg = document.createElementNS(NS.SVG, 'svg')

  before(() => {
    // Ensure the SVG element is attached to the document for transform list tests
    document.body.appendChild(svg)
  })

  after(() => {
    // Cleanup
    document.body.removeChild(svg)
  })

  it('Test svgedit.math package exports', function () {
    assert.ok(math, 'math module should exist')
    const expectedFunctions = [
      'transformPoint',
      'getTransformList',
      'isIdentity',
      'matrixMultiply',
      'hasMatrixTransform',
      'transformBox',
      'transformListToTransform',
      'getMatrix',
      'snapToAngle',
      'rectsIntersect'
    ]
    expectedFunctions.forEach(fn => {
      assert.ok(
        typeof math[fn] === 'function',
        `Expected "${fn}" to be a function`
      )
    })
  })

  it('Test svgedit.math.transformPoint() function', function () {
    const { transformPoint } = math

    const m = svg.createSVGMatrix()
    m.a = 1
    m.b = 0
    m.c = 0
    m.d = 1
    m.e = 0
    m.f = 0
    let pt = transformPoint(100, 200, m)
    assert.equal(pt.x, 100, 'X should be unchanged by identity matrix')
    assert.equal(pt.y, 200, 'Y should be unchanged by identity matrix')

    m.e = 300
    m.f = 400
    pt = transformPoint(100, 200, m)
    assert.equal(pt.x, 400, 'X should be translated by 300')
    assert.equal(pt.y, 600, 'Y should be translated by 400')

    m.a = 0.5
    m.b = 0.75
    m.c = 1.25
    m.d = 2
    pt = transformPoint(100, 200, m)
    assert.equal(
      pt.x,
      100 * m.a + 200 * m.c + m.e,
      'X should match matrix multiplication'
    )
    assert.equal(
      pt.y,
      100 * m.b + 200 * m.d + m.f,
      'Y should match matrix multiplication'
    )
  })

  it('Test svgedit.math.isIdentity() function', function () {
    const { isIdentity } = math

    assert.ok(
      isIdentity(svg.createSVGMatrix()),
      'Default matrix should be identity'
    )

    const m = svg.createSVGMatrix()
    m.a = 1
    m.b = 0
    m.c = 0
    m.d = 1
    m.e = 0
    m.f = 0
    assert.ok(
      isIdentity(m),
      'Modified matrix matching identity values should be identity'
    )

    m.e = 10
    assert.notOk(isIdentity(m), 'Matrix with translation is not identity')
  })

  it('Test svgedit.math.matrixMultiply() function', function () {
    const { matrixMultiply, isIdentity } = math

    // Test empty arguments
    const iDefault = matrixMultiply()
    assert.ok(
      isIdentity(iDefault),
      'No arguments should return identity matrix'
    )

    // Translate there and back
    const tr1 = svg.createSVGMatrix().translate(100, 50)
    const tr2 = svg.createSVGMatrix().translate(-90, 0)
    const tr3 = svg.createSVGMatrix().translate(-10, -50)
    let I = matrixMultiply(tr1, tr2, tr3)
    assert.ok(isIdentity(I), 'Translating there and back should yield identity')

    // Rotate there and back
    const rotThere = svg.createSVGMatrix().rotate(90)
    const rotBack = svg.createSVGMatrix().rotate(-90)
    I = matrixMultiply(rotThere, rotBack)
    assert.ok(isIdentity(I), 'Rotating and rotating back should yield identity')

    // Scale up and down
    const scaleUp = svg.createSVGMatrix().scale(4)
    const scaleDownX = svg.createSVGMatrix().scaleNonUniform(0.25, 1)
    const scaleDownY = svg.createSVGMatrix().scaleNonUniform(1, 0.25)
    I = matrixMultiply(scaleUp, scaleDownX, scaleDownY)
    assert.ok(
      isIdentity(I),
      'Scaling up and then scaling down back to original should yield identity'
    )

    // Multiplying a matrix by its inverse
    const someMatrix = svg
      .createSVGMatrix()
      .rotate(33)
      .translate(100, 200)
      .scale(2)
    I = matrixMultiply(someMatrix, someMatrix.inverse())
    cy.log(I)
    cy.log('-----------------------------------------')
    assert.ok(
      isIdentity(I),
      'Matrix multiplied by its inverse should be identity'
    )
  })

  it('Test svgedit.math.transformBox() function', function () {
    const { transformBox } = math

    const m = svg.createSVGMatrix()
    // Identity
    const r = transformBox(10, 10, 200, 300, m)
    assert.equal(r.tl.x, 10, 'Top-left X should be 10')
    assert.equal(r.tl.y, 10, 'Top-left Y should be 10')
    assert.equal(r.tr.x, 210, 'Top-right X should be 210')
    assert.equal(r.tr.y, 10, 'Top-right Y should be 10')
    assert.equal(r.bl.x, 10, 'Bottom-left X should be 10')
    assert.equal(r.bl.y, 310, 'Bottom-left Y should be 310')
    assert.equal(r.br.x, 210, 'Bottom-right X should be 210')
    assert.equal(r.br.y, 310, 'Bottom-right Y should be 310')
    assert.equal(r.aabox.x, 10, 'AABBox X should be 10')
    assert.equal(r.aabox.y, 10, 'AABBox Y should be 10')
    assert.equal(r.aabox.width, 200, 'AABBox width should be 200')
    assert.equal(r.aabox.height, 300, 'AABBox height should be 300')

    // Transformed box
    m.e = 50
    m.f = 50
    const r2 = transformBox(0, 0, 100, 100, m)
    assert.equal(r2.aabox.x, 50, 'AABBox x should be translated by 50')
    assert.equal(r2.aabox.y, 50, 'AABBox y should be translated by 50')
  })

  it('Test svgedit.math.getTransformList() and hasMatrixTransform() functions', function () {
    const { getTransformList, hasMatrixTransform } = math

    // An element with no transform
    const rect = document.createElementNS(NS.SVG, 'rect')
    svg.appendChild(rect)
    const tlist = getTransformList(rect)
    assert.ok(tlist, 'Should get a transform list (empty)')
    assert.equal(tlist.numberOfItems, 0, 'Transform list should be empty')
    assert.notOk(
      hasMatrixTransform(tlist),
      'No matrix transform in an empty transform list'
    )

    // Add a non-identity matrix transform
    const nonIdentityMatrix = svg.createSVGMatrix().translate(10, 20).scale(2)
    const tf = svg.createSVGTransformFromMatrix(nonIdentityMatrix)
    tlist.appendItem(tf)
    assert.equal(tlist.numberOfItems, 1, 'Transform list should have one item')
    assert.ok(
      hasMatrixTransform(tlist),
      'Non-identity matrix transform should be detected'
    )

    // Add an identity transform
    const tfIdentity = svg.createSVGTransformFromMatrix(svg.createSVGMatrix()) // identity matrix
    tlist.appendItem(tfIdentity)
    assert.equal(
      tlist.numberOfItems,
      2,
      'Transform list should have two items now'
    )
    // Still should have a non-identity matrix transform present
    assert.ok(
      hasMatrixTransform(tlist),
      'Still have a non-identity matrix transform after adding an identity transform'
    )

    // Cleanup
    svg.removeChild(rect)
  })

  it('Test svgedit.math.transformListToTransform() and getMatrix() functions', function () {
    const { transformListToTransform, getMatrix } = math

    const g = document.createElementNS(NS.SVG, 'g')
    svg.appendChild(g)

    const tlist = g.transform.baseVal
    const m1 = svg.createSVGTransformFromMatrix(
      svg.createSVGMatrix().translate(10, 20)
    )
    const m2 = svg.createSVGTransformFromMatrix(
      svg.createSVGMatrix().rotate(45)
    )
    tlist.appendItem(m1)
    tlist.appendItem(m2)

    const consolidated = transformListToTransform(tlist)
    const expected = m1.matrix.multiply(m2.matrix)
    assert.equal(
      consolidated.matrix.a,
      expected.a,
      'Consolidated matrix a should match expected'
    )
    assert.equal(
      consolidated.matrix.d,
      expected.d,
      'Consolidated matrix d should match expected'
    )

    const elemMatrix = getMatrix(g)
    assert.equal(
      elemMatrix.a,
      expected.a,
      'Element matrix a should match expected'
    )
    assert.equal(
      elemMatrix.d,
      expected.d,
      'Element matrix d should match expected'
    )

    svg.removeChild(g)
  })

  it('Test svgedit.math.snapToAngle() function', function () {
    const { snapToAngle } = math

    const result = snapToAngle(0, 0, 10, 0) // Expect snap to 0 degrees
    assert.equal(
      result.x,
      10,
      'Snapped x should remain 10 when angle is already at 0°'
    )
    assert.equal(
      result.y,
      0,
      'Snapped y should remain 0 when angle is already at 0°'
    )

    // 45-degree snap from an angle close to 45° (e.g., 50°)
    const angleDegrees = 50
    const angleRadians = angleDegrees * (Math.PI / 180)
    const dx = Math.cos(angleRadians) * 100
    const dy = Math.sin(angleRadians) * 100
    const snapped = snapToAngle(0, 0, dx, dy)
    // Should snap to exactly 45°
    const expectedAngle = Math.PI / 4
    const dist = Math.hypot(dx, dy)
    assert.closeTo(
      snapped.x,
      dist * Math.cos(expectedAngle),
      0.00001,
      'X should be close to 45° projection'
    )
    assert.closeTo(
      snapped.y,
      dist * Math.sin(expectedAngle),
      0.00001,
      'Y should be close to 45° projection'
    )
  })

  it('Test svgedit.math.rectsIntersect() function', function () {
    const { rectsIntersect } = math
    const r1 = { x: 0, y: 0, width: 50, height: 50 }
    const r2 = { x: 25, y: 25, width: 50, height: 50 }
    const r3 = { x: 100, y: 100, width: 10, height: 10 }

    assert.ok(rectsIntersect(r1, r2), 'Rectangles overlapping should intersect')
    assert.notOk(
      rectsIntersect(r1, r3),
      'Non-overlapping rectangles should not intersect'
    )

    // Edge case: touching edges
    const r4 = { x: 50, y: 0, width: 50, height: 50 }
    // Note: Depending on interpretation, touching at the border might be considered intersecting or not.
    // The given function checks strict overlapping (not just touching), so this should return false.
    assert.notOk(
      rectsIntersect(r1, r4),
      'Rectangles touching at the edge should not be considered intersecting'
    )
  })
})
