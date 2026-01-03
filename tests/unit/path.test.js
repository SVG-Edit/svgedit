/* globals SVGPathSeg */
import 'pathseg'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import * as utilities from '../../packages/svgcanvas/core/utilities.js'
import { convertPath as convertPathActions } from '../../packages/svgcanvas/core/path-actions.js'
import * as pathModule from '../../packages/svgcanvas/core/path.js'
import { Path, Segment } from '../../packages/svgcanvas/core/path-method.js'
import { init as unitsInit } from '../../packages/svgcanvas/core/units.js'

describe('path', function () {
  /**
  * @typedef {GenericArray} EditorContexts
  * @property {module:path.EditorContext} 0
  * @property {module:path.EditorContext} 1
  */

  /**
  * @param {SVGSVGElement} [svg]
  * @returns {EditorContexts}
  */
  function getMockContexts (svg) {
    svg = svg || document.createElementNS(NS.SVG, 'svg')
    const selectorParentGroup = document.createElementNS(NS.SVG, 'g')
    selectorParentGroup.setAttribute('id', 'selectorParentGroup')
    svg.append(selectorParentGroup)
    return [
      /**
      * @implements {module:path.EditorContext}
      */
      {
        getSvgRoot () { return svg },
        getZoom () { return 1 }
      },
      /**
      * @implements {module:utilities.EditorContext}
      */
      {
        getDOMDocument () { return svg },
        getDOMContainer () { return svg },
        getSvgRoot () { return svg }
      }
    ]
  }

  it('Test svgedit.path.init exposes recalcRotatedPath', function () {
    const [mockPathContext] = getMockContexts()
    pathModule.init(mockPathContext)
    assert.equal(typeof mockPathContext.recalcRotatedPath, 'function')
  })

  it('Test svgedit.path.replacePathSeg', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 L10,11 L20,21Z')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    new Path(path) // eslint-disable-line no-new

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L')
    assert.equal(path.pathSegList.getItem(1).x, 10)
    assert.equal(path.pathSegList.getItem(1).y, 11)

    pathModule.replacePathSeg(SVGPathSeg.PATHSEG_LINETO_REL, 1, [30, 31], path)

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'l')
    assert.equal(path.pathSegList.getItem(1).x, 30)
    assert.equal(path.pathSegList.getItem(1).y, 31)
  })

  it('Test svgedit.path.Segment.setType simple', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 L10,11 L20,21Z')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    new Path(path) // eslint-disable-line no-new

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L')
    assert.equal(path.pathSegList.getItem(1).x, 10)
    assert.equal(path.pathSegList.getItem(1).y, 11)

    const segment = new Segment(1, path.pathSegList.getItem(1))
    segment.setType(SVGPathSeg.PATHSEG_LINETO_REL, [30, 31])
    assert.equal(segment.item.pathSegTypeAsLetter, 'l')
    assert.equal(segment.item.x, 30)
    assert.equal(segment.item.y, 31)

    // Also verify that the actual path changed.
    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'l')
    assert.equal(path.pathSegList.getItem(1).x, 30)
    assert.equal(path.pathSegList.getItem(1).y, 31)
  })

  it('Test svgedit.path.Segment.setType with control points', function () {
    // Setup the dom for a mock control group.
    const svg = document.createElementNS(NS.SVG, 'svg')
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 C11,12 13,14 15,16 Z')
    svg.append(path)

    const [mockPathContext, mockUtilitiesContext] = getMockContexts(svg)
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    const segment = new Segment(1, path.pathSegList.getItem(1))
    segment.path = new Path(path)

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C')
    assert.equal(path.pathSegList.getItem(1).x1, 11)
    assert.equal(path.pathSegList.getItem(1).y1, 12)
    assert.equal(path.pathSegList.getItem(1).x2, 13)
    assert.equal(path.pathSegList.getItem(1).y2, 14)
    assert.equal(path.pathSegList.getItem(1).x, 15)
    assert.equal(path.pathSegList.getItem(1).y, 16)

    segment.setType(SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL, [30, 31, 32, 33, 34, 35])
    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'c')
    assert.equal(path.pathSegList.getItem(1).x1, 32)
    assert.equal(path.pathSegList.getItem(1).y1, 33)
    assert.equal(path.pathSegList.getItem(1).x2, 34)
    assert.equal(path.pathSegList.getItem(1).y2, 35)
    assert.equal(path.pathSegList.getItem(1).x, 30)
    assert.equal(path.pathSegList.getItem(1).y, 31)
  })

  it('Test svgedit.path.Segment.move', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 L10,11 L20,21Z')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    new Path(path) // eslint-disable-line no-new

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L')
    assert.equal(path.pathSegList.getItem(1).x, 10)
    assert.equal(path.pathSegList.getItem(1).y, 11)

    const segment = new Segment(1, path.pathSegList.getItem(1))
    segment.move(-3, 4)
    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'L')
    assert.equal(path.pathSegList.getItem(1).x, 7)
    assert.equal(path.pathSegList.getItem(1).y, 15)
  })

  it('Test svgedit.path.Segment.move for quadratic curve', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 Q11,12 15,16')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    const pathObj = new Path(path)

    pathObj.segs[1].move(-3, 4)
    const seg = path.pathSegList.getItem(1)

    assert.equal(seg.pathSegTypeAsLetter, 'Q')
    assert.equal(seg.x, 12)
    assert.equal(seg.y, 20)
    assert.equal(seg.x1, 11)
    assert.equal(seg.y1, 12)
  })

  it('Test svgedit.path.Segment.move for smooth cubic curve', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 S13,14 15,16')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    const pathObj = new Path(path)

    pathObj.segs[1].move(5, -6)
    const seg = path.pathSegList.getItem(1)

    assert.equal(seg.pathSegTypeAsLetter, 'S')
    assert.equal(seg.x, 20)
    assert.equal(seg.y, 10)
    assert.equal(seg.x2, 18)
    assert.equal(seg.y2, 8)
  })

  it('Test moving start point moves next quadratic control point', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 Q10,0 20,0')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    const pathObj = new Path(path)

    pathObj.segs[0].move(5, 5)
    const seg = path.pathSegList.getItem(1)

    assert.equal(seg.pathSegTypeAsLetter, 'Q')
    assert.equal(seg.x, 20)
    assert.equal(seg.y, 0)
    assert.equal(seg.x1, 15)
    assert.equal(seg.y1, 5)
  })

  it('Test svgedit.path.Segment.moveCtrl', function () {
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 C11,12 13,14 15,16 Z')

    const [mockPathContext, mockUtilitiesContext] = getMockContexts()
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    new Path(path) // eslint-disable-line no-new

    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C')
    assert.equal(path.pathSegList.getItem(1).x1, 11)
    assert.equal(path.pathSegList.getItem(1).y1, 12)
    assert.equal(path.pathSegList.getItem(1).x2, 13)
    assert.equal(path.pathSegList.getItem(1).y2, 14)
    assert.equal(path.pathSegList.getItem(1).x, 15)
    assert.equal(path.pathSegList.getItem(1).y, 16)

    const segment = new Segment(1, path.pathSegList.getItem(1))
    segment.moveCtrl(1, 100, -200)
    assert.equal(path.pathSegList.getItem(1).pathSegTypeAsLetter, 'C')
    assert.equal(path.pathSegList.getItem(1).x1, 111)
    assert.equal(path.pathSegList.getItem(1).y1, -188)
    assert.equal(path.pathSegList.getItem(1).x2, 13)
    assert.equal(path.pathSegList.getItem(1).y2, 14)
    assert.equal(path.pathSegList.getItem(1).x, 15)
    assert.equal(path.pathSegList.getItem(1).y, 16)
  })

  it('Test svgedit.path.convertPath', function () {
    unitsInit({
      getRoundDigits () { return 5 }
    })

    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M40,55h20v20')

    const abs = pathModule.convertPath(path)
    assert.equal(abs, 'M40,55L60,55L60,75')

    const rel = pathModule.convertPath(path, true)
    assert.equal(rel, 'm40,55l20,0l0,20')
  })

  it('Test convertPath resets after closepath when relative', function () {
    unitsInit({
      getRoundDigits () { return 5 }
    })

    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M10,10 L20,10 Z L15,10')
    const expected = 'm10,10l10,0zl5,0'

    assert.equal(pathModule.convertPath(path, true), expected)
    assert.equal(convertPathActions(path, true), expected)
  })

  it('Test recalcRotatedPath preserves zero control points', function () {
    const svg = document.createElementNS(NS.SVG, 'svg')
    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 C0,10 0,20 30,30')
    path.setAttribute('transform', 'rotate(45 0 0)')
    svg.append(path)

    const [mockPathContext, mockUtilitiesContext] = getMockContexts(svg)
    pathModule.init(mockPathContext)
    utilities.init(mockUtilitiesContext)
    const pathObj = new Path(path)
    pathObj.oldbbox = utilities.getBBox(path)

    pathModule.recalcRotatedPath()

    const seg = path.pathSegList.getItem(1)
    assert.equal(seg.pathSegTypeAsLetter, 'C')
    assert.closeTo(seg.x1, 0, 1e-6)
    assert.closeTo(seg.y1, 10, 1e-6)
    assert.closeTo(seg.x2, 0, 1e-6)
    assert.closeTo(seg.y2, 20, 1e-6)
    assert.closeTo(seg.x, 30, 1e-6)
    assert.closeTo(seg.y, 30, 1e-6)
  })

  it('Test convertPath handles relative arcs', function () {
    unitsInit({
      getRoundDigits () { return 5 }
    })

    const path = document.createElementNS(NS.SVG, 'path')
    path.setAttribute('d', 'M0,0 a10,20 30 0 1 40,50')

    const abs = pathModule.convertPath(path)
    assert.ok(abs.includes('A10,20 30 0 1 40,50'))

    const rel = pathModule.convertPath(path, true)
    assert.ok(rel.includes('a10,20 30 0 1 40,50'))
  })
})
