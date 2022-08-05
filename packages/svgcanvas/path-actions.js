/**
 * Path functionality.
 * @module path
 * @license MIT
 *
 * @copyright 2011 Alexis Deveria, 2011 Jeff Schiller
 */

import { NS } from './namespaces.js'
import { shortFloat } from './units.js'
import { ChangeElementCommand, BatchCommand } from './history.js'
import {
  transformPoint, snapToAngle, rectsIntersect,
  transformListToTransform
} from './math.js'
import {
  assignAttributes, getElement, getRotationAngle, snapToGrid,
  getBBox
} from './utilities.js'

let svgCanvas = null
let path = null

/**
* @function module:path-actions.init
* @param {module:path-actions.svgCanvas} pathActionsContext
* @returns {void}
*/
export const init = (canvas) => {
  svgCanvas = canvas
}

/**
 * Convert a path to one with only absolute or relative values.
 * @todo move to pathActions.js
 * @function module:path.convertPath
 * @param {SVGPathElement} pth - the path to convert
 * @param {boolean} toRel - true of convert to relative
 * @returns {string}
 */
export const convertPath = function (pth, toRel) {
  const { pathSegList } = pth
  const len = pathSegList.numberOfItems
  let curx = 0; let cury = 0
  let d = ''
  let lastM = null

  for (let i = 0; i < len; ++i) {
    const seg = pathSegList.getItem(i)
    // if these properties are not in the segment, set them to zero
    let x = seg.x || 0
    let y = seg.y || 0
    let x1 = seg.x1 || 0
    let y1 = seg.y1 || 0
    let x2 = seg.x2 || 0
    let y2 = seg.y2 || 0

    // const type = seg.pathSegType;
    // const pathMap = svgCanvas.getPathMap();
    // let letter = pathMap[type][toRel ? 'toLowerCase' : 'toUpperCase']();
    let letter = seg.pathSegTypeAsLetter

    switch (letter) {
      case 'z': // z,Z closepath (Z/z)
      case 'Z':
        d += 'z'
        if (lastM && !toRel) {
          curx = lastM[0]
          cury = lastM[1]
        }
        break
      case 'H': // absolute horizontal line (H)
        x -= curx
      // Fallthrough
      case 'h': // relative horizontal line (h)
        if (toRel) {
          y = 0
          curx += x
          letter = 'l'
        } else {
          y = cury
          x += curx
          curx = x
          letter = 'L'
        }
        // Convert to "line" for easier editing
        d += pathDSegment(letter, [[x, y]])
        break
      case 'V': // absolute vertical line (V)
        y -= cury
      // Fallthrough
      case 'v': // relative vertical line (v)
        if (toRel) {
          x = 0
          cury += y
          letter = 'l'
        } else {
          x = curx
          y += cury
          cury = y
          letter = 'L'
        }
        // Convert to "line" for easier editing
        d += pathDSegment(letter, [[x, y]])
        break
      case 'M': // absolute move (M)
      case 'L': // absolute line (L)
      case 'T': // absolute smooth quad (T)
        x -= curx
        y -= cury
      // Fallthrough
      case 'l': // relative line (l)
      case 'm': // relative move (m)
      case 't': // relative smooth quad (t)
        if (toRel) {
          curx += x
          cury += y
          letter = letter.toLowerCase()
        } else {
          x += curx
          y += cury
          curx = x
          cury = y
          letter = letter.toUpperCase()
        }
        if (letter === 'm' || letter === 'M') { lastM = [curx, cury] }

        d += pathDSegment(letter, [[x, y]])
        break
      case 'C': // absolute cubic (C)
        x -= curx; x1 -= curx; x2 -= curx
        y -= cury; y1 -= cury; y2 -= cury
      // Fallthrough
      case 'c': // relative cubic (c)
        if (toRel) {
          curx += x
          cury += y
          letter = 'c'
        } else {
          x += curx; x1 += curx; x2 += curx
          y += cury; y1 += cury; y2 += cury
          curx = x
          cury = y
          letter = 'C'
        }
        d += pathDSegment(letter, [[x1, y1], [x2, y2], [x, y]])
        break
      case 'Q': // absolute quad (Q)
        x -= curx; x1 -= curx
        y -= cury; y1 -= cury
      // Fallthrough
      case 'q': // relative quad (q)
        if (toRel) {
          curx += x
          cury += y
          letter = 'q'
        } else {
          x += curx; x1 += curx
          y += cury; y1 += cury
          curx = x
          cury = y
          letter = 'Q'
        }
        d += pathDSegment(letter, [[x1, y1], [x, y]])
        break
      case 'A':
        x -= curx
        y -= cury
      // fallthrough
      case 'a': // relative elliptical arc (a)
        if (toRel) {
          curx += x
          cury += y
          letter = 'a'
        } else {
          x += curx
          y += cury
          curx = x
          cury = y
          letter = 'A'
        }
        d += pathDSegment(letter, [[seg.r1, seg.r2]], [
          seg.angle,
          (seg.largeArcFlag ? 1 : 0),
          (seg.sweepFlag ? 1 : 0)
        ], [x, y])
        break
      case 'S': // absolute smooth cubic (S)
        x -= curx; x2 -= curx
        y -= cury; y2 -= cury
      // Fallthrough
      case 's': // relative smooth cubic (s)
        if (toRel) {
          curx += x
          cury += y
          letter = 's'
        } else {
          x += curx; x2 += curx
          y += cury; y2 += cury
          curx = x
          cury = y
          letter = 'S'
        }
        d += pathDSegment(letter, [[x2, y2], [x, y]])
        break
    } // switch on path segment type
  } // for each segment
  return d
}

/**
 * TODO: refactor callers in `convertPath` to use `getPathDFromSegments` instead of this function.
 * Legacy code refactored from `svgcanvas.pathActions.convertPath`.
 * @param {string} letter - path segment command (letter in potentially either case from {@link module:path.pathMap}; see [SVGPathSeg#pathSegTypeAsLetter]{@link https://www.w3.org/TR/SVG/single-page.html#paths-__svg__SVGPathSeg__pathSegTypeAsLetter})
 * @param {GenericArray<GenericArray<Integer>>} points - x,y points
 * @param {GenericArray<GenericArray<Integer>>} [morePoints] - x,y points
 * @param {Integer[]} [lastPoint] - x,y point
 * @returns {string}
 */
function pathDSegment (letter, points, morePoints, lastPoint) {
  points.forEach(function (pnt, i) {
    points[i] = shortFloat(pnt)
  })
  let segment = letter + points.join(' ')
  if (morePoints) {
    segment += ' ' + morePoints.join(' ')
  }
  if (lastPoint) {
    segment += ' ' + shortFloat(lastPoint)
  }
  return segment
}

/**
* Group: Path edit functions.
* Functions relating to editing path elements.
* @namespace {PlainObject} pathActions
* @memberof module:path
*/
export const pathActionsMethod = (function () {
  let subpath = false
  let newPoint; let firstCtrl

  let currentPath = null
  let hasMoved = false
  // No `svgCanvas` yet but should be ok as is `null` by default
  // svgCanvas.setDrawnPath(null);

  /**
  * This function converts a polyline (created by the fh_path tool) into
  * a path element and coverts every three line segments into a single bezier
  * curve in an attempt to smooth out the free-hand.
  * @function smoothPolylineIntoPath
  * @param {Element} element
  * @returns {Element}
  */
  const smoothPolylineIntoPath = function (element) {
    let i
    const { points } = element
    const N = points.numberOfItems
    if (N >= 4) {
      // loop through every 3 points and convert to a cubic bezier curve segment
      //
      // NOTE: this is cheating, it means that every 3 points has the potential to
      // be a corner instead of treating each point in an equal manner. In general,
      // this technique does not look that good.
      //
      // I am open to better ideas!
      //
      // Reading:
      // - http://www.efg2.com/Lab/Graphics/Jean-YvesQueinecBezierCurves.htm
      // - https://www.codeproject.com/KB/graphics/BezierSpline.aspx?msg=2956963
      // - https://www.ian-ko.com/ET_GeoWizards/UserGuide/smooth.htm
      // - https://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
      let curpos = points.getItem(0); let prevCtlPt = null
      let d = []
      d.push(['M', curpos.x, ',', curpos.y, ' C'].join(''))
      for (i = 1; i <= (N - 4); i += 3) {
        let ct1 = points.getItem(i)
        const ct2 = points.getItem(i + 1)
        const end = points.getItem(i + 2)

        // if the previous segment had a control point, we want to smooth out
        // the control points on both sides
        if (prevCtlPt) {
          const newpts = svgCanvas.smoothControlPoints(prevCtlPt, ct1, curpos)
          if (newpts?.length === 2) {
            const prevArr = d[d.length - 1].split(',')
            prevArr[2] = newpts[0].x
            prevArr[3] = newpts[0].y
            d[d.length - 1] = prevArr.join(',')
            ct1 = newpts[1]
          }
        }

        d.push([ct1.x, ct1.y, ct2.x, ct2.y, end.x, end.y].join(','))

        curpos = end
        prevCtlPt = ct2
      }
      // handle remaining line segments
      d.push('L')
      while (i < N) {
        const pt = points.getItem(i)
        d.push([pt.x, pt.y].join(','))
        i++
      }
      d = d.join(' ')

      element = svgCanvas.addSVGElementsFromJson({
        element: 'path',
        curStyles: true,
        attr: {
          id: svgCanvas.getId(),
          d,
          fill: 'none'
        }
      })
      // No need to call "changed", as this is already done under mouseUp
    }
    return element
  }

  return (/** @lends module:path.pathActions */ {
    /**
    * @param {MouseEvent} evt
    * @param {Element} mouseTarget
    * @param {Float} startX
    * @param {Float} startY
    * @returns {boolean|void}
    */
    mouseDown (evt, mouseTarget, startX, startY) {
      let id
      if (svgCanvas.getCurrentMode() === 'path') {
        let mouseX = startX // Was this meant to work with the other `mouseX`? (was defined globally so adding `let` to at least avoid a global)
        let mouseY = startY // Was this meant to work with the other `mouseY`? (was defined globally so adding `let` to at least avoid a global)

        const zoom = svgCanvas.getZoom()
        let x = mouseX / zoom
        let y = mouseY / zoom
        let stretchy = getElement('path_stretch_line')
        newPoint = [x, y]

        if (svgCanvas.getGridSnapping()) {
          x = snapToGrid(x)
          y = snapToGrid(y)
          mouseX = snapToGrid(mouseX)
          mouseY = snapToGrid(mouseY)
        }

        if (!stretchy) {
          stretchy = document.createElementNS(NS.SVG, 'path')
          assignAttributes(stretchy, {
            id: 'path_stretch_line',
            stroke: '#22C',
            'stroke-width': '0.5',
            fill: 'none'
          })
          getElement('selectorParentGroup').append(stretchy)
        }
        stretchy.setAttribute('display', 'inline')

        let keep = null
        let index
        // if pts array is empty, create path element with M at current point
        const drawnPath = svgCanvas.getDrawnPath()
        if (!drawnPath) {
          const dAttr = 'M' + x + ',' + y + ' ' // Was this meant to work with the other `dAttr`? (was defined globally so adding `var` to at least avoid a global)
          /* drawnPath = */ svgCanvas.setDrawnPath(svgCanvas.addSVGElementsFromJson({
            element: 'path',
            curStyles: true,
            attr: {
              d: dAttr,
              id: svgCanvas.getNextId(),
              opacity: svgCanvas.getOpacity() / 2
            }
          }))
          // set stretchy line to first point
          stretchy.setAttribute('d', ['M', mouseX, mouseY, mouseX, mouseY].join(' '))
          index = subpath ? path.segs.length : 0
          svgCanvas.addPointGrip(index, mouseX, mouseY)
        } else {
          // determine if we clicked on an existing point
          const seglist = drawnPath.pathSegList
          let i = seglist.numberOfItems
          const FUZZ = 6 / zoom
          let clickOnPoint = false
          while (i) {
            i--
            const item = seglist.getItem(i)
            const px = item.x; const py = item.y
            // found a matching point
            if (x >= (px - FUZZ) && x <= (px + FUZZ) &&
              y >= (py - FUZZ) && y <= (py + FUZZ)
            ) {
              clickOnPoint = true
              break
            }
          }

          // get path element that we are in the process of creating
          id = svgCanvas.getId()

          // Remove previous path object if previously created
          svgCanvas.removePath_(id)

          const newpath = getElement(id)
          let newseg
          let sSeg
          const len = seglist.numberOfItems
          // if we clicked on an existing point, then we are done this path, commit it
          // (i, i+1) are the x,y that were clicked on
          if (clickOnPoint) {
            // if clicked on any other point but the first OR
            // the first point was clicked on and there are less than 3 points
            // then leave the path open
            // otherwise, close the path
            if (i <= 1 && len >= 2) {
              // Create end segment
              const absX = seglist.getItem(0).x
              const absY = seglist.getItem(0).y

              sSeg = stretchy.pathSegList.getItem(1)
              newseg = sSeg.pathSegType === 4
                ? drawnPath.createSVGPathSegLinetoAbs(absX, absY)
                : drawnPath.createSVGPathSegCurvetoCubicAbs(absX, absY, sSeg.x1 / zoom, sSeg.y1 / zoom, absX, absY)

              const endseg = drawnPath.createSVGPathSegClosePath()
              seglist.appendItem(newseg)
              seglist.appendItem(endseg)
            } else if (len < 3) {
              keep = false
              return keep
            }
            stretchy.remove()

            // This will signal to commit the path
            // const element = newpath; // Other event handlers define own `element`, so this was probably not meant to interact with them or one which shares state (as there were none); I therefore adding a missing `var` to avoid a global
            /* drawnPath = */ svgCanvas.setDrawnPath(null)
            svgCanvas.setStarted(false)

            if (subpath) {
              if (path.matrix) {
                svgCanvas.remapElement(newpath, {}, path.matrix.inverse())
              }

              const newD = newpath.getAttribute('d')
              const origD = path.elem.getAttribute('d')
              path.elem.setAttribute('d', origD + newD)
              newpath.parentNode.removeChild(newpath)
              if (path.matrix) {
                svgCanvas.recalcRotatedPath()
              }
              pathActionsMethod.toEditMode(path.elem)
              path.selectPt()
              return false
            }
          // else, create a new point, update path element
          } else {
            // Checks if current target or parents are #svgcontent
            if (!(svgCanvas.getContainer() !== svgCanvas.getMouseTarget(evt) && svgCanvas.getContainer().contains(
              svgCanvas.getMouseTarget(evt)
            ))) {
              // Clicked outside canvas, so don't make point
              return false
            }

            const num = drawnPath.pathSegList.numberOfItems
            const last = drawnPath.pathSegList.getItem(num - 1)
            const lastx = last.x; const lasty = last.y

            if (evt.shiftKey) {
              const xya = snapToAngle(lastx, lasty, x, y);
              ({ x, y } = xya)
            }

            // Use the segment defined by stretchy
            sSeg = stretchy.pathSegList.getItem(1)
            newseg = sSeg.pathSegType === 4
              ? drawnPath.createSVGPathSegLinetoAbs(svgCanvas.round(x), svgCanvas.round(y))
              : drawnPath.createSVGPathSegCurvetoCubicAbs(
                svgCanvas.round(x),
                svgCanvas.round(y),
                sSeg.x1 / zoom,
                sSeg.y1 / zoom,
                sSeg.x2 / zoom,
                sSeg.y2 / zoom
              )

            drawnPath.pathSegList.appendItem(newseg)

            x *= zoom
            y *= zoom

            // set stretchy line to latest point
            stretchy.setAttribute('d', ['M', x, y, x, y].join(' '))
            index = num
            if (subpath) { index += path.segs.length }
            svgCanvas.addPointGrip(index, x, y)
          }
          // keep = true;
        }

        return undefined
      }

      // TODO: Make sure currentPath isn't null at this point
      if (!path) { return undefined }

      path.storeD();

      ({ id } = evt.target)
      let curPt
      if (id.substr(0, 14) === 'pathpointgrip_') {
        // Select this point
        curPt = path.cur_pt = Number.parseInt(id.substr(14))
        path.dragging = [startX, startY]
        const seg = path.segs[curPt]

        // only clear selection if shift is not pressed (otherwise, add
        // node to selection)
        if (!evt.shiftKey) {
          if (path.selected_pts.length <= 1 || !seg.selected) {
            path.clearSelection()
          }
          path.addPtsToSelection(curPt)
        } else if (seg.selected) {
          path.removePtFromSelection(curPt)
        } else {
          path.addPtsToSelection(curPt)
        }
      } else if (id.startsWith('ctrlpointgrip_')) {
        path.dragging = [startX, startY]

        const parts = id.split('_')[1].split('c')
        curPt = Number(parts[0])
        const ctrlNum = Number(parts[1])
        path.selectPt(curPt, ctrlNum)
      }

      // Start selection box
      if (!path.dragging) {
        let rubberBox = svgCanvas.getRubberBox()
        if (!rubberBox) {
          rubberBox = svgCanvas.setRubberBox(
            svgCanvas.selectorManager.getRubberBandBox()
          )
        }
        const zoom = svgCanvas.getZoom()
        assignAttributes(rubberBox, {
          x: startX * zoom,
          y: startY * zoom,
          width: 0,
          height: 0,
          display: 'inline'
        }, 100)
      }
      return undefined
    },
    /**
    * @param {Float} mouseX
    * @param {Float} mouseY
    * @returns {void}
    */
    mouseMove (mouseX, mouseY) {
      const zoom = svgCanvas.getZoom()
      hasMoved = true
      const drawnPath = svgCanvas.getDrawnPath()
      if (svgCanvas.getCurrentMode() === 'path') {
        if (!drawnPath) { return }
        const seglist = drawnPath.pathSegList
        const index = seglist.numberOfItems - 1

        if (newPoint) {
          // First point
          // if (!index) { return; }

          // Set control points
          const pointGrip1 = svgCanvas.addCtrlGrip('1c1')
          const pointGrip2 = svgCanvas.addCtrlGrip('0c2')

          // dragging pointGrip1
          pointGrip1.setAttribute('cx', mouseX)
          pointGrip1.setAttribute('cy', mouseY)
          pointGrip1.setAttribute('display', 'inline')

          const ptX = newPoint[0]
          const ptY = newPoint[1]

          // set curve
          // const seg = seglist.getItem(index);
          const curX = mouseX / zoom
          const curY = mouseY / zoom
          const altX = (ptX + (ptX - curX))
          const altY = (ptY + (ptY - curY))

          pointGrip2.setAttribute('cx', altX * zoom)
          pointGrip2.setAttribute('cy', altY * zoom)
          pointGrip2.setAttribute('display', 'inline')

          const ctrlLine = svgCanvas.getCtrlLine(1)
          assignAttributes(ctrlLine, {
            x1: mouseX,
            y1: mouseY,
            x2: altX * zoom,
            y2: altY * zoom,
            display: 'inline'
          })

          if (index === 0) {
            firstCtrl = [mouseX, mouseY]
          } else {
            const last = seglist.getItem(index - 1)
            let lastX = last.x
            let lastY = last.y

            if (last.pathSegType === 6) {
              lastX += (lastX - last.x2)
              lastY += (lastY - last.y2)
            } else if (firstCtrl) {
              lastX = firstCtrl[0] / zoom
              lastY = firstCtrl[1] / zoom
            }
            svgCanvas.replacePathSeg(6, index, [ptX, ptY, lastX, lastY, altX, altY], drawnPath)
          }
        } else {
          const stretchy = getElement('path_stretch_line')
          if (stretchy) {
            const prev = seglist.getItem(index)
            if (prev.pathSegType === 6) {
              const prevX = prev.x + (prev.x - prev.x2)
              const prevY = prev.y + (prev.y - prev.y2)
              svgCanvas.replacePathSeg(
                6,
                1,
                [mouseX, mouseY, prevX * zoom, prevY * zoom, mouseX, mouseY],
                stretchy
              )
            } else if (firstCtrl) {
              svgCanvas.replacePathSeg(6, 1, [mouseX, mouseY, firstCtrl[0], firstCtrl[1], mouseX, mouseY], stretchy)
            } else {
              svgCanvas.replacePathSeg(4, 1, [mouseX, mouseY], stretchy)
            }
          }
        }
        return
      }
      // if we are dragging a point, let's move it
      if (path.dragging) {
        const pt = svgCanvas.getPointFromGrip({
          x: path.dragging[0],
          y: path.dragging[1]
        }, path)
        const mpt = svgCanvas.getPointFromGrip({
          x: mouseX,
          y: mouseY
        }, path)
        const diffX = mpt.x - pt.x
        const diffY = mpt.y - pt.y
        path.dragging = [mouseX, mouseY]

        if (path.dragctrl) {
          path.moveCtrl(diffX, diffY)
        } else {
          path.movePts(diffX, diffY)
        }
      } else {
        path.selected_pts = []
        path.eachSeg(function (_i) {
          const seg = this
          if (!seg.next && !seg.prev) { return }

          // const {item} = seg;
          const rubberBox = svgCanvas.getRubberBox()
          const rbb = getBBox(rubberBox)

          const pt = svgCanvas.getGripPt(seg)
          const ptBb = {
            x: pt.x,
            y: pt.y,
            width: 0,
            height: 0
          }

          const sel = rectsIntersect(rbb, ptBb)

          this.select(sel)
          // Note that addPtsToSelection is not being run
          if (sel) { path.selected_pts.push(seg.index) }
        })
      }
    },
    /**
     * @typedef module:path.keepElement
     * @type {PlainObject}
     * @property {boolean} keep
     * @property {Element} element
     */
    /**
    * @param {Event} evt
    * @param {Element} element
    * @param {Float} _mouseX
    * @param {Float} _mouseY
    * @returns {module:path.keepElement|void}
    */
    mouseUp (evt, element, _mouseX, _mouseY) {
      const drawnPath = svgCanvas.getDrawnPath()
      // Create mode
      if (svgCanvas.getCurrentMode() === 'path') {
        newPoint = null
        if (!drawnPath) {
          element = getElement(svgCanvas.getId())
          svgCanvas.setStarted(false)
          firstCtrl = null
        }

        return {
          keep: true,
          element
        }
      }

      // Edit mode
      const rubberBox = svgCanvas.getRubberBox()
      if (path.dragging) {
        const lastPt = path.cur_pt

        path.dragging = false
        path.dragctrl = false
        path.update()

        if (hasMoved) {
          path.endChanges('Move path point(s)')
        }

        if (!evt.shiftKey && !hasMoved) {
          path.selectPt(lastPt)
        }
      } else if (rubberBox?.getAttribute('display') !== 'none') {
        // Done with multi-node-select
        rubberBox.setAttribute('display', 'none')

        if (rubberBox.getAttribute('width') <= 2 && rubberBox.getAttribute('height') <= 2) {
          pathActionsMethod.toSelectMode(evt.target)
        }

      // else, move back to select mode
      } else {
        pathActionsMethod.toSelectMode(evt.target)
      }
      hasMoved = false
      return undefined
    },
    /**
    * @param {Element} element
    * @returns {void}
    */
    toEditMode (element) {
      path = svgCanvas.getPath_(element)
      svgCanvas.setCurrentMode('pathedit')
      svgCanvas.clearSelection()
      path.setPathContext()
      path.show(true).update()
      path.oldbbox = getBBox(path.elem)
      subpath = false
    },
    /**
    * @param {Element} elem
    * @fires module:svgcanvas.SvgCanvas#event:selected
    * @returns {void}
    */
    toSelectMode (elem) {
      const selPath = (elem === path.elem)
      svgCanvas.setCurrentMode('select')
      path.setPathContext()
      path.show(false)
      currentPath = false
      svgCanvas.clearSelection()

      if (path.matrix) {
        // Rotated, so may need to re-calculate the center
        svgCanvas.recalcRotatedPath()
      }

      if (selPath) {
        svgCanvas.call('selected', [elem])
        svgCanvas.addToSelection([elem], true)
      }
    },
    /**
    * @param {boolean} on
    * @returns {void}
    */
    addSubPath (on) {
      if (on) {
        // Internally we go into "path" mode, but in the UI it will
        // still appear as if in "pathedit" mode.
        svgCanvas.setCurrentMode('path')
        subpath = true
      } else {
        pathActionsMethod.clear(true)
        pathActionsMethod.toEditMode(path.elem)
      }
    },
    /**
    * @param {Element} target
    * @returns {void}
    */
    select (target) {
      if (currentPath === target) {
        pathActionsMethod.toEditMode(target)
        svgCanvas.setCurrentMode('pathedit')
      // going into pathedit mode
      } else {
        currentPath = target
      }
    },
    /**
    * @fires module:svgcanvas.SvgCanvas#event:changed
    * @returns {void}
    */
    reorient () {
      const elem = svgCanvas.getSelectedElements()[0]
      if (!elem) { return }
      const angl = getRotationAngle(elem)
      if (angl === 0) { return }

      const batchCmd = new BatchCommand('Reorient path')
      const changes = {
        d: elem.getAttribute('d'),
        transform: elem.getAttribute('transform')
      }
      batchCmd.addSubCommand(new ChangeElementCommand(elem, changes))
      svgCanvas.clearSelection()
      this.resetOrientation(elem)

      svgCanvas.addCommandToHistory(batchCmd)

      // Set matrix to null
      svgCanvas.getPath_(elem).show(false).matrix = null

      this.clear()

      svgCanvas.addToSelection([elem], true)
      svgCanvas.call('changed', svgCanvas.getSelectedElements())
    },

    /**
    * @param {boolean} remove Not in use
    * @returns {void}
    */
    clear () {
      const drawnPath = svgCanvas.getDrawnPath()
      currentPath = null
      if (drawnPath) {
        const elem = getElement(svgCanvas.getId())
        const psl = getElement('path_stretch_line')
        psl.parentNode.removeChild(psl)
        elem.parentNode.removeChild(elem)
        const pathpointgripContainer = getElement('pathpointgrip_container')
        const elements = pathpointgripContainer.querySelectorAll('*')
        Array.prototype.forEach.call(elements, function (el) {
          el.setAttribute('display', 'none')
        })
        firstCtrl = null
        svgCanvas.setDrawnPath(null)
        svgCanvas.setStarted(false)
      } else if (svgCanvas.getCurrentMode() === 'pathedit') {
        this.toSelectMode()
      }
      if (path) { path.init().show(false) }
    },
    /**
    * @param {?(Element|SVGPathElement)} pth
    * @returns {false|void}
    */
    resetOrientation (pth) {
      if (pth?.nodeName !== 'path') { return false }
      const tlist = pth.transform.baseVal
      const m = transformListToTransform(tlist).matrix
      tlist.clear()
      pth.removeAttribute('transform')
      const segList = pth.pathSegList

      // Opera/win/non-EN throws an error here.
      // TODO: Find out why!
      // Presumed fixed in Opera 10.5, so commented out for now

      // try {
      const len = segList.numberOfItems
      // } catch(err) {
      //   const fixed_d = pathActions.convertPath(pth);
      //   pth.setAttribute('d', fixed_d);
      //   segList = pth.pathSegList;
      //   const len = segList.numberOfItems;
      // }
      // let lastX, lastY;
      for (let i = 0; i < len; ++i) {
        const seg = segList.getItem(i)
        const type = seg.pathSegType
        if (type === 1) { continue }
        const pts = [];
        ['', 1, 2].forEach(function (n) {
          const x = seg['x' + n]; const y = seg['y' + n]
          if (x !== undefined && y !== undefined) {
            const pt = transformPoint(x, y, m)
            pts.splice(pts.length, 0, pt.x, pt.y)
          }
        })
        svgCanvas.replacePathSeg(type, i, pts, pth)
      }

      svgCanvas.reorientGrads(pth, m)
      return undefined
    },
    /**
    * @returns {void}
    */
    zoomChange () {
      if (svgCanvas.getCurrentMode() === 'pathedit') {
        path.update()
      }
    },
    /**
    * @typedef {PlainObject} module:path.NodePoint
    * @property {Float} x
    * @property {Float} y
    * @property {Integer} type
    */
    /**
    * @returns {module:path.NodePoint}
    */
    getNodePoint () {
      const selPt = path.selected_pts.length ? path.selected_pts[0] : 1

      const seg = path.segs[selPt]
      return {
        x: seg.item.x,
        y: seg.item.y,
        type: seg.type
      }
    },
    /**
    * @param {boolean} linkPoints
    * @returns {void}
    */
    linkControlPoints (linkPoints) {
      svgCanvas.setLinkControlPoints(linkPoints)
    },
    /**
    * @returns {void}
    */
    clonePathNode () {
      path.storeD()

      const selPts = path.selected_pts
      // const {segs} = path;

      let i = selPts.length
      const nums = []

      while (i--) {
        const pt = selPts[i]
        path.addSeg(pt)

        nums.push(pt + i)
        nums.push(pt + i + 1)
      }
      path.init().addPtsToSelection(nums)

      path.endChanges('Clone path node(s)')
    },
    /**
    * @returns {void}
    */
    opencloseSubPath () {
      const selPts = path.selected_pts
      // Only allow one selected node for now
      if (selPts.length !== 1) { return }

      const { elem } = path
      const list = elem.pathSegList

      // const len = list.numberOfItems;

      const index = selPts[0]

      let openPt = null
      let startItem = null

      // Check if subpath is already open
      path.eachSeg(function (i) {
        if (this.type === 2 && i <= index) {
          startItem = this.item
        }
        if (i <= index) { return true }
        if (this.type === 2) {
          // Found M first, so open
          openPt = i
          return false
        }
        if (this.type === 1) {
          // Found Z first, so closed
          openPt = false
          return false
        }
        return true
      })

      if (!openPt) {
        // Single path, so close last seg
        openPt = path.segs.length - 1
      }

      if (openPt !== false) {
        // Close this path

        // Create a line going to the previous "M"
        const newseg = elem.createSVGPathSegLinetoAbs(startItem.x, startItem.y)

        const closer = elem.createSVGPathSegClosePath()
        if (openPt === path.segs.length - 1) {
          list.appendItem(newseg)
          list.appendItem(closer)
        } else {
          list.insertItemBefore(closer, openPt)
          list.insertItemBefore(newseg, openPt)
        }

        path.init().selectPt(openPt + 1)
        return
      }

      // M 1,1 L 2,2 L 3,3 L 1,1 z // open at 2,2
      // M 2,2 L 3,3 L 1,1

      // M 1,1 L 2,2 L 1,1 z M 4,4 L 5,5 L6,6 L 5,5 z
      // M 1,1 L 2,2 L 1,1 z [M 4,4] L 5,5 L(M)6,6 L 5,5 z

      const seg = path.segs[index]

      if (seg.mate) {
        list.removeItem(index) // Removes last "L"
        list.removeItem(index) // Removes the "Z"
        path.init().selectPt(index - 1)
        return
      }

      let lastM; let zSeg

      // Find this sub-path's closing point and remove
      for (let i = 0; i < list.numberOfItems; i++) {
        const item = list.getItem(i)

        if (item.pathSegType === 2) {
          // Find the preceding M
          lastM = i
        } else if (i === index) {
          // Remove it
          list.removeItem(lastM)
          // index--;
        } else if (item.pathSegType === 1 && index < i) {
          // Remove the closing seg of this subpath
          zSeg = i - 1
          list.removeItem(i)
          break
        }
      }

      let num = (index - lastM) - 1

      while (num--) {
        list.insertItemBefore(list.getItem(lastM), zSeg)
      }

      const pt = list.getItem(lastM)

      // Make this point the new "M"
      svgCanvas.replacePathSeg(2, lastM, [pt.x, pt.y])

      // i = index; // i is local here, so has no effect; what was the intent for this?

      path.init().selectPt(0)
    },
    /**
    * @returns {void}
    */
    deletePathNode () {
      if (!pathActionsMethod.canDeleteNodes) { return }
      path.storeD()

      const selPts = path.selected_pts

      let i = selPts.length
      while (i--) {
        const pt = selPts[i]
        path.deleteSeg(pt)
      }

      // Cleanup
      const cleanup = function () {
        const segList = path.elem.pathSegList
        let len = segList.numberOfItems

        const remItems = function (pos, count) {
          while (count--) {
            segList.removeItem(pos)
          }
        }

        if (len <= 1) { return true }

        while (len--) {
          const item = segList.getItem(len)
          if (item.pathSegType === 1) {
            const prev = segList.getItem(len - 1)
            const nprev = segList.getItem(len - 2)
            if (prev.pathSegType === 2) {
              remItems(len - 1, 2)
              cleanup()
              break
            } else if (nprev.pathSegType === 2) {
              remItems(len - 2, 3)
              cleanup()
              break
            }
          } else if (item.pathSegType === 2 && len > 0) {
            const prevType = segList.getItem(len - 1).pathSegType
            // Path has M M
            if (prevType === 2) {
              remItems(len - 1, 1)
              cleanup()
              break
              // Entire path ends with Z M
            } else if (prevType === 1 && segList.numberOfItems - 1 === len) {
              remItems(len, 1)
              cleanup()
              break
            }
          }
        }
        return false
      }

      cleanup()

      // Completely delete a path with 1 or 0 segments
      if (path.elem.pathSegList.numberOfItems <= 1) {
        pathActionsMethod.toSelectMode(path.elem)
        svgCanvas.canvas.deleteSelectedElements()
        return
      }

      path.init()
      path.clearSelection()

      // TODO: Find right way to select point now
      // path.selectPt(selPt);
      if (window.opera) { // Opera repaints incorrectly
        path.elem.setAttribute('d', path.elem.getAttribute('d'))
      }
      path.endChanges('Delete path node(s)')
    },
    // Can't seem to use `@borrows` here, so using `@see`
    /**
    * Smooth polyline into path.
    * @function module:path.pathActions.smoothPolylineIntoPath
    * @see module:path~smoothPolylineIntoPath
    */
    smoothPolylineIntoPath,
    /* eslint-enable  */
    /**
    * @param {?Integer} v See {@link https://www.w3.org/TR/SVG/single-page.html#paths-InterfaceSVGPathSeg}
    * @returns {void}
    */
    setSegType (v) {
      path?.setSegType(v)
    },
    /**
    * @param {string} attr
    * @param {Float} newValue
    * @returns {void}
    */
    moveNode (attr, newValue) {
      const selPts = path.selected_pts
      if (!selPts.length) { return }

      path.storeD()

      // Get first selected point
      const seg = path.segs[selPts[0]]
      const diff = { x: 0, y: 0 }
      diff[attr] = newValue - seg.item[attr]

      seg.move(diff.x, diff.y)
      path.endChanges('Move path point')
    },
    /**
    * @param {Element} elem
    * @returns {void}
    */
    fixEnd (elem) {
      // Adds an extra segment if the last seg before a Z doesn't end
      // at its M point
      // M0,0 L0,100 L100,100 z
      const segList = elem.pathSegList
      const len = segList.numberOfItems
      let lastM
      for (let i = 0; i < len; ++i) {
        const item = segList.getItem(i)
        if (item.pathSegType === 2) { // 2 => M segment type (move to)
          lastM = item
        }

        if (item.pathSegType === 1) { // 1 => Z segment type (close path)
          const prev = segList.getItem(i - 1)
          if (prev.x !== lastM.x || prev.y !== lastM.y) {
            // Add an L segment here
            const newseg = elem.createSVGPathSegLinetoAbs(lastM.x, lastM.y)
            segList.insertItemBefore(newseg, i)
            // Can this be done better?
            pathActionsMethod.fixEnd(elem)
            break
          }
        }
      }
    },
    // Can't seem to use `@borrows` here, so using `@see`
    /**
    * Convert a path to one with only absolute or relative values.
    * @function module:path.pathActions.convertPath
    * @see module:path.convertPath
    */
    convertPath
  })
})()
// end pathActions
