/**
 * Tools for event.
 * @module event
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */
import jQueryPluginSVG from '../common/jQuery.attr.js'; // Needed for SVG attribute 
import {
  assignAttributes, cleanupElement, getElem, getRotationAngle, snapToGrid, walkTree,
  getBBox as utilsGetBBox, isNullish
} from '../common/utilities.js';
import {
  convertAttrs
} from '../common/units.js';
import {
  transformPoint, hasMatrixTransform, getMatrix, snapToAngle
} from '../common/math.js';
import {
  getTransformList
} from '../common/svgtransformlist.js';
import {
  supportsNonScalingStroke
} from '../common/browser.js';
import * as draw from './draw.js';
import * as pathModule from './path.js';
import * as hstry from './history.js';

const {
  InsertElementCommand
} = hstry;

let $ = jQueryPluginSVG(jQuery);
let eventContext_ = null;

/**
* @function module:undo.init
* @param {module:undo.eventContext} eventContext_
* @returns {void}
*/
export const init = function (eventContext) {
  eventContext_ = eventContext;
};

/**
 *
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:transition
 * @fires module:svgcanvas.SvgCanvas#event:ext_mouseMove
 * @returns {void}
 */
export const mouseMoveEvent = function (evt) {
  const selectedElements = eventContext_.getSelectedElements();
  const currentZoom = eventContext_.getCurrentZoom();
  if (!eventContext_.getStarted()) { return; }
  if (evt.button === 1 || eventContext_.getCanvas().spaceKey) { return; }

  let i, xya, c, cx, cy, dx, dy, len, angle, box,
    selected = selectedElements[0];
  const
    pt = transformPoint(evt.pageX, evt.pageY, eventContext_.getrootSctm()),

    mouseX = pt.x * currentZoom,
    mouseY = pt.y * currentZoom,
    shape = getElem(eventContext_.getId());

  let realX = mouseX / currentZoom;
  let x = realX;
  let realY = mouseY / currentZoom;
  let y = realY;

  if (eventContext_.getCurConfig().gridSnapping) {
    x = snapToGrid(x);
    y = snapToGrid(y);
  }

  evt.preventDefault();
  let tlist;
  switch (eventContext_.getCurrentMode()) {
  case 'select': {
    // we temporarily use a translate on the element(s) being dragged
    // this transform is removed upon mousing up and the element is
    // relocated to the new location
    if (selectedElements[0] !== null) {
      dx = x - eventContext_.getStartX();
      dy = y - eventContext_.getStartY();
      if (eventContext_.getCurConfig().gridSnapping) {
        dx = snapToGrid(dx);
        dy = snapToGrid(dy);
      }

/*
// Commenting out as currently has no effect
if (evt.shiftKey) {
  xya = snapToAngle(eventContext_.getStartX(), eventContext_.getStartY(), x, y);
  ({x, y} = xya);
}
*/

      if (dx !== 0 || dy !== 0) {
        len = selectedElements.length;
        for (i = 0; i < len; ++i) {
          selected = selectedElements[i];
          if (isNullish(selected)) { break; }
          // if (i === 0) {
          //   const box = utilsGetBBox(selected);
          //     selectedBBoxes[i].x = box.x + dx;
          //     selectedBBoxes[i].y = box.y + dy;
          // }

          // update the dummy transform in our transform list
          // to be a translate
          const xform = eventContext_.getSVGRoot().createSVGTransform();
          tlist = getTransformList(selected);
          // Note that if Webkit and there's no ID for this
          // element, the dummy transform may have gotten lost.
          // This results in unexpected behaviour

          xform.setTranslate(dx, dy);
          if (tlist.numberOfItems) {
            tlist.replaceItem(xform, 0);
          } else {
            tlist.appendItem(xform);
          }

          // update our internal bbox that we're tracking while dragging
          eventContext_.getCanvas().selectorManager.requestSelector(selected).resize();
        }

        eventContext_.getCanvas().call('transition', selectedElements);
      }
    }
    break;
  } case 'multiselect': {
    realX *= currentZoom;
    realY *= currentZoom;
    assignAttributes(eventContext_.getRubberBox(), {
      x: Math.min(eventContext_.getRStartX(), realX),
      y: Math.min(eventContext_.getRStartY(), realY),
      width: Math.abs(realX - eventContext_.getRStartX()),
      height: Math.abs(realY - eventContext_.getRStartY())
    }, 100);

    // for each selected:
    // - if newList contains selected, do nothing
    // - if newList doesn't contain selected, remove it from selected
    // - for any newList that was not in selectedElements, add it to selected
    const elemsToRemove = selectedElements.slice(), elemsToAdd = [],
      newList = eventContext_.getIntersectionList();

    // For every element in the intersection, add if not present in selectedElements.
    len = newList.length;
    for (i = 0; i < len; ++i) {
      const intElem = newList[i];
      // Found an element that was not selected before, so we should add it.
      if (!selectedElements.includes(intElem)) {
        elemsToAdd.push(intElem);
      }
      // Found an element that was already selected, so we shouldn't remove it.
      const foundInd = elemsToRemove.indexOf(intElem);
      if (foundInd !== -1) {
        elemsToRemove.splice(foundInd, 1);
      }
    }

    if (elemsToRemove.length > 0) {
      eventContext_.getCanvas().removeFromSelection(elemsToRemove);
    }

    if (elemsToAdd.length > 0) {
      eventContext_.getCanvas().addToSelection(elemsToAdd);
    }

    break;
  } case 'resize': {
    // we track the resize bounding box and translate/scale the selected element
    // while the mouse is down, when mouse goes up, we use this to recalculate
    // the shape's coordinates
    tlist = getTransformList(selected);
    const hasMatrix = hasMatrixTransform(tlist);
    box = hasMatrix ? eventContext_.getInitBbox() : utilsGetBBox(selected);
    let left = box.x,
      top = box.y,
      {width, height} = box;
    dx = (x - eventContext_.getStartX());
    dy = (y - eventContext_.getStartX());

    if (eventContext_.getCurConfig().gridSnapping) {
      dx = snapToGrid(dx);
      dy = snapToGrid(dy);
      height = snapToGrid(height);
      width = snapToGrid(width);
    }

    // if rotated, adjust the dx,dy values
    angle = getRotationAngle(selected);
    if (angle) {
      const r = Math.sqrt(dx * dx + dy * dy),
        theta = Math.atan2(dy, dx) - angle * Math.PI / 180.0;
      dx = r * Math.cos(theta);
      dy = r * Math.sin(theta);
    }

    // if not stretching in y direction, set dy to 0
    // if not stretching in x direction, set dx to 0
    if (!eventContext_.getCurrentResizeMode().includes('n') && !eventContext_.getCurrentResizeMode().includes('s')) {
      dy = 0;
    }
    if (!eventContext_.getCurrentResizeMode().includes('e') && !eventContext_.getCurrentResizeMode().includes('w')) {
      dx = 0;
    }

    let // ts = null,
      tx = 0, ty = 0,
      sy = height ? (height + dy) / height : 1,
      sx = width ? (width + dx) / width : 1;
    // if we are dragging on the north side, then adjust the scale factor and ty
    if (eventContext_.getCurrentResizeMode().includes('n')) {
      sy = height ? (height - dy) / height : 1;
      ty = height;
    }

    // if we dragging on the east side, then adjust the scale factor and tx
    if (eventContext_.getCurrentResizeMode().includes('w')) {
      sx = width ? (width - dx) / width : 1;
      tx = width;
    }

    // update the transform list with translate,scale,translate
    const translateOrigin = eventContext_.getSVGRoot().createSVGTransform(),
      scale = eventContext_.getSVGRoot().createSVGTransform(),
      translateBack = eventContext_.getSVGRoot().createSVGTransform();

    if (eventContext_.getCurConfig().gridSnapping) {
      left = snapToGrid(left);
      tx = snapToGrid(tx);
      top = snapToGrid(top);
      ty = snapToGrid(ty);
    }

    translateOrigin.setTranslate(-(left + tx), -(top + ty));
    if (evt.shiftKey) {
      if (sx === 1) {
        sx = sy;
      } else { sy = sx; }
    }
    scale.setScale(sx, sy);

    translateBack.setTranslate(left + tx, top + ty);
    if (hasMatrix) {
      const diff = angle ? 1 : 0;
      tlist.replaceItem(translateOrigin, 2 + diff);
      tlist.replaceItem(scale, 1 + diff);
      tlist.replaceItem(translateBack, Number(diff));
    } else {
      const N = tlist.numberOfItems;
      tlist.replaceItem(translateBack, N - 3);
      tlist.replaceItem(scale, N - 2);
      tlist.replaceItem(translateOrigin, N - 1);
    }

    eventContext_.getCanvas().selectorManager.requestSelector(selected).resize();
    eventContext_.getCanvas().call('transition', selectedElements);

    break;
  } case 'zoom': {
    realX *= currentZoom;
    realY *= currentZoom;
    assignAttributes(eventContext_.getRubberBox(), {
      x: Math.min(eventContext_.getRStartX() * currentZoom, realX),
      y: Math.min(eventContext_.getRStartY() * currentZoom, realY),
      width: Math.abs(realX - eventContext_.getRStartX() * currentZoom),
      height: Math.abs(realY - eventContext_.getRStartY() * currentZoom)
    }, 100);
    break;
  } case 'text': {
    assignAttributes(shape, {
      x,
      y
    }, 1000);
    break;
  } case 'line': {
    if (eventContext_.getCurConfig().gridSnapping) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }

    let x2 = x;
    let y2 = y;

    if (evt.shiftKey) {
      xya = snapToAngle(eventContext_.getStartX(), eventContext_.getStartY(), x2, y2);
      x2 = xya.x;
      y2 = xya.y;
    }

    shape.setAttribute('x2', x2);
    shape.setAttribute('y2', y2);
    break;
  } case 'foreignObject':
    // fall through
  case 'square':
    // fall through
  case 'rect':
    // fall through
  case 'image': {
    const square = (eventContext_.getCurrentMode() === 'square') || evt.shiftKey;
    let
      w = Math.abs(x - eventContext_.getStartX()),
      h = Math.abs(y - eventContext_.getStartY());
    let newX, newY;
    if (square) {
      w = h = Math.max(w, h);
      newX = eventContext_.getStartX() < x ? eventContext_.getStartX() : eventContext_.getStartX() - w;
      newY = eventContext_.getStartY() < y ? eventContext_.getStartY() : eventContext_.getStartY() - h;
    } else {
      newX = Math.min(eventContext_.getStartX(), x);
      newY = Math.min(eventContext_.getStartY(), y);
    }

    if (eventContext_.getCurConfig().gridSnapping) {
      w = snapToGrid(w);
      h = snapToGrid(h);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }

    assignAttributes(shape, {
      width: w,
      height: h,
      x: newX,
      y: newY
    }, 1000);

    break;
  } case 'circle': {
    c = $(shape).attr(['cx', 'cy']);
    ({cx, cy} = c);
    let rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    if (eventContext_.getCurConfig().gridSnapping) {
      rad = snapToGrid(rad);
    }
    shape.setAttribute('r', rad);
    break;
  } case 'ellipse': {
    c = $(shape).attr(['cx', 'cy']);
    ({cx, cy} = c);
    if (eventContext_.getCurConfig().gridSnapping) {
      x = snapToGrid(x);
      cx = snapToGrid(cx);
      y = snapToGrid(y);
      cy = snapToGrid(cy);
    }
    shape.setAttribute('rx', Math.abs(x - cx));
    const ry = Math.abs(evt.shiftKey ? (x - cx) : (y - cy));
    shape.setAttribute('ry', ry);
    break;
  }
  case 'fhellipse':
  case 'fhrect': {
    eventContext_.setFreehand('minx', Math.min(realX, eventContext_.getFreehand('minx')));
    eventContext_.setFreehand('maxx', Math.max(realX, eventContext_.getFreehand('maxx')));
    eventContext_.setFreehand('miny', Math.min(realY, eventContext_.getFreehand('miny')));
    eventContext_.setFreehand('maxy', Math.max(realY, eventContext_.getFreehand('maxy')));
  }
  // Fallthrough
  case 'fhpath': {
    // dAttr += + realX + ',' + realY + ' ';
    // shape.setAttribute('points', dAttr);
    eventContext_.setEnd('x', realX);
    eventContext_.setEnd('y', realY);
    if (eventContext_.getControllPoint2('x') && eventContext_.getControllPoint2('y')) {
      for (i = 0; i < eventContext_.getStepCount() - 1; i++) {
        eventContext_.setParameter(i / eventContext_.getStepCount());
        eventContext_.setNextParameter((i + 1) / eventContext_.getStepCount());
        eventContext_.setbSpline(eventContext_.getBsplinePoint(eventContext_.getNextParameter()));
        eventContext_.setNextPos({x: eventContext_.getbSpline('x'), y: eventContext_.getbSpline('y')});
        eventContext_.setbSpline( eventContext_.getBsplinePoint(eventContext_.getParameter()));
        eventContext_.setSumDistance( eventContext_.getSumDistance() + Math.sqrt((eventContext_.getNextPos('x') - eventContext_.getbSpline('x')) *
    (eventContext_.getNextPos('x') - eventContext_.getbSpline('x')) + (eventContext_.getNextPos('y') - eventContext_.getbSpline('y')) *
    (eventContext_.getNextPos('y') - eventContext_.getbSpline('y'))));
        if (eventContext_.getSumDistance() > eventContext_.getThreSholdDist()) {
          eventContext_.setSumDistance(eventContext_.getSumDistance() - eventContext_.getThreSholdDist());

          // Faster than completely re-writing the points attribute.
          const point = eventContext_.getSVGContent().createSVGPoint();
          point.x = eventContext_.getbSpline('x');
          point.y = eventContext_.getbSpline('y');
          shape.points.appendItem(point);
        }
      }
    }
    eventContext_.setControllPoint2('x', eventContext_.getControllPoint1('x'));
    eventContext_.setControllPoint2('y', eventContext_.getControllPoint1('y'));
    eventContext_.setControllPoint1('x', eventContext_.getStart('x'));
    eventContext_.setControllPoint1('y', eventContext_.getStart('y'));
    eventContext_.setStart({x: eventContext_.getEnd('x'), y: eventContext_.getEnd('y')});
    break;
    // update path stretch line coordinates
  } case 'path':
    // fall through
  case 'pathedit': {
    x *= currentZoom;
    y *= currentZoom;

    if (eventContext_.getCurConfig().gridSnapping) {
      x = snapToGrid(x);
      y = snapToGrid(y);
      eventContext_.setStartX(snapToGrid(eventContext_.getStartX()));
      eventContext_.setStartY(snapToGrid(eventContext_.getStartY()));
    }
    if (evt.shiftKey) {
      const {path} = pathModule;
      let x1, y1;
      if (path) {
        x1 = path.dragging ? path.dragging[0] : eventContext_.getStartX();
        y1 = path.dragging ? path.dragging[1] : eventContext_.getStartY();
      } else {
        x1 = eventContext_.getStartX();
        y1 = eventContext_.getStartY();
      }
      xya = snapToAngle(x1, y1, x, y);
      ({x, y} = xya);
    }

    if (eventContext_.getRubberBox() && eventContext_.getRubberBox().getAttribute('display') !== 'none') {
      realX *= currentZoom;
      realY *= currentZoom;
      assignAttributes(eventContext_.getRubberBox(), {
        x: Math.min(eventContext_.getRStartX() * currentZoom, realX),
        y: Math.min(eventContext_.getRStartY() * currentZoom, realY),
        width: Math.abs(realX - eventContext_.getRStartX() * currentZoom),
        height: Math.abs(realY - eventContext_.getRStartY() * currentZoom)
      }, 100);
    }
    eventContext_.getCanvas().pathActions.mouseMove(x, y);

    break;
  } case 'textedit': {
    x *= currentZoom;
    y *= currentZoom;
    // if (eventContext_.getRubberBox() && eventContext_.getRubberBox().getAttribute('display') !== 'none') {
    //   assignAttributes(eventContext_.getRubberBox(), {
    //     x: Math.min(eventContext_.getStartX(), x),
    //     y: Math.min(eventContext_.getStartY(), y),
    //     width: Math.abs(x - eventContext_.getStartX()),
    //     height: Math.abs(y - eventContext_.getStartY())
    //   }, 100);
    // }

    eventContext_.getCanvas().textActions.mouseMove(mouseX, mouseY);

    break;
  } case 'rotate': {
    box = utilsGetBBox(selected);
    cx = box.x + box.width / 2;
    cy = box.y + box.height / 2;
    const m = getMatrix(selected),
      center = transformPoint(cx, cy, m);
    cx = center.x;
    cy = center.y;
    angle = ((Math.atan2(cy - y, cx - x) * (180 / Math.PI)) - 90) % 360;
    if (eventContext_.getCurConfig().gridSnapping) {
      angle = snapToGrid(angle);
    }
    if (evt.shiftKey) { // restrict rotations to nice angles (WRS)
      const snap = 45;
      angle = Math.round(angle / snap) * snap;
    }

    eventContext_.getCanvas().setRotationAngle(angle < -180 ? (360 + angle) : angle, true);
    eventContext_.getCanvas().call('transition', selectedElements);
    break;
  } default:
    break;
  }

  /**
* The mouse has moved on the canvas area.
* @event module:svgcanvas.SvgCanvas#event:ext_mouseMove
* @type {PlainObject}
* @property {MouseEvent} event The event object
* @property {Float} mouse_x x coordinate on canvas
* @property {Float} mouse_y y coordinate on canvas
* @property {Element} selected Refers to the first selected element
*/
  eventContext_.getCanvas().runExtensions('mouseMove', /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseMove} */ {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY,
    selected
  });
}; // mouseMove()

// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
// and store it on the Undo stack
// - in move/resize mode, the element's attributes which were affected by the move/resize are
// identified, a ChangeElementCommand is created and stored on the stack for those attrs
// this is done in when we recalculate the selected dimensions()
/**
*
* @param {MouseEvent} evt
* @fires module:svgcanvas.SvgCanvas#event:zoomed
* @fires module:svgcanvas.SvgCanvas#event:changed
* @fires module:svgcanvas.SvgCanvas#event:ext_mouseUp
* @returns {void}
*/
export const mouseUpEvent = function (evt) {
  const selectedElements = eventContext_.getSelectedElements();
  const currentZoom = eventContext_.getCurrentZoom();
  if (evt.button === 2) { return; }
  const tempJustSelected = eventContext_.getJustSelected();
  eventContext_.setJustSelected(null);
  if (!eventContext_.getStarted()) { return; }
  const pt = transformPoint(evt.pageX, evt.pageY, eventContext_.getrootSctm()),
    mouseX = pt.x * currentZoom,
    mouseY = pt.y * currentZoom,
    x = mouseX / currentZoom,
    y = mouseY / currentZoom;

  let element = getElem(eventContext_.getId());
  let keep = false;

  const realX = x;
  const realY = y;

  // TODO: Make true when in multi-unit mode
  const useUnit = false; // (eventContext_.getCurConfig().baseUnit !== 'px');
  eventContext_.setStarted(false);
  let attrs, t;
  switch (eventContext_.getCurrentMode()) {
  // intentionally fall-through to select here
  case 'resize':
  case 'multiselect':
    if (!isNullish(eventContext_.getRubberBox())) {
      eventContext_.getRubberBox().setAttribute('display', 'none');
      eventContext_.setCurBBoxes([]);
    }
    eventContext_.setCurrentMode('select');
    // Fallthrough
  case 'select':
    if (!isNullish(selectedElements[0])) {
      // if we only have one selected element
      if (isNullish(selectedElements[1])) {
        // set our current stroke/fill properties to the element's
        const selected = selectedElements[0];
        switch (selected.tagName) {
        case 'g':
        case 'use':
        case 'image':
        case 'foreignObject':
          break;
        default:
          eventContext_.setCurProperties('fill', selected.getAttribute('fill'));
          eventContext_.setCurProperties('fill_opacity', selected.getAttribute('fill-opacity'));
          eventContext_.setCurProperties('stroke', selected.getAttribute('stroke'));
          eventContext_.setCurProperties('stroke_opacity', selected.getAttribute('stroke-opacity'));
          eventContext_.setCurProperties('stroke_width', selected.getAttribute('stroke-width'));
          eventContext_.setCurProperties('stroke_dasharray', selected.getAttribute('stroke-dasharray'));
          eventContext_.setCurProperties('stroke_linejoin', selected.getAttribute('stroke-linejoin'));
          eventContext_.setCurProperties('stroke_linecap', selected.getAttribute('stroke-linecap'));
        }

        if (selected.tagName === 'text') {
          eventContext_.setCurText('font_size', selected.getAttribute('font-size'));
          eventContext_.setCurText('font_family', selected.getAttribute('font-family'));
        }
        eventContext_.getCanvas().selectorManager.requestSelector(selected).showGrips(true);

        // This shouldn't be necessary as it was done on mouseDown...
        //  eventContext_.getCanvas().call('selected', [selected]);
      }
      // always recalculate dimensions to strip off stray identity transforms
      eventContext_.getCanvas().recalculateAllSelectedDimensions();
      // if it was being dragged/resized
      if (realX !== eventContext_.getRStartX() || realY !== eventContext_.getRStartY()) {
        const len = selectedElements.length;
        for (let i = 0; i < len; ++i) {
          if (isNullish(selectedElements[i])) { break; }
          if (!selectedElements[i].firstChild) {
            // Not needed for groups (incorrectly resizes elems), possibly not needed at all?
            eventContext_.getCanvas().selectorManager.requestSelector(selectedElements[i]).resize();
          }
        }
        // no change in position/size, so maybe we should move to pathedit
      } else {
        t = evt.target;
        if (selectedElements[0].nodeName === 'path' && isNullish(selectedElements[1])) {
          eventContext_.getCanvas().pathActions.select(selectedElements[0]);
          // if it was a path
          // else, if it was selected and this is a shift-click, remove it from selection
        } else if (evt.shiftKey) {
          if (tempJustSelected !== t) {
            eventContext_.getCanvas().removeFromSelection([t]);
          }
        }
      } // no change in mouse position

      // Remove non-scaling stroke
      if (supportsNonScalingStroke()) {
        const elem = selectedElements[0];
        if (elem) {
          elem.removeAttribute('style');
          walkTree(elem, function (el) {
            el.removeAttribute('style');
          });
        }
      }
    }
    return;
  case 'zoom': {
    if (!isNullish(eventContext_.getRubberBox())) {
      eventContext_.getRubberBox().setAttribute('display', 'none');
    }
    const factor = evt.shiftKey ? 0.5 : 2;
    eventContext_.getCanvas().call('zoomed', {
      x: Math.min(eventContext_.getRStartX(), realX),
      y: Math.min(eventContext_.getRStartY(), realY),
      width: Math.abs(realX - eventContext_.getRStartX()),
      height: Math.abs(realY - eventContext_.getRStartY()),
      factor
    });
    return;
  } case 'fhpath': {
    // Check that the path contains at least 2 points; a degenerate one-point path
    // causes problems.
    // Webkit ignores how we set the points attribute with commas and uses space
    // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
    eventContext_.setSumDistance(0);
    eventContext_.setControllPoint2('x', 0);
    eventContext_.setControllPoint2('y', 0);
    eventContext_.setControllPoint1('x', 0);
    eventContext_.setControllPoint1('y', 0);
    start = {x: 0, y: 0};
    eventContext_.setEnd('x', 0);
    eventContext_.setEnd('y', 0);
    const coords = element.getAttribute('points');
    const commaIndex = coords.indexOf(',');
    if (commaIndex >= 0) {
      keep = coords.includes(',', commaIndex + 1);
    } else {
      keep = coords.includes(' ', coords.indexOf(' ') + 1);
    }
    if (keep) {
      element = eventContext_.getCanvas().pathActions.smoothPolylineIntoPath(element);
    }
    break;
  } case 'line':
    attrs = $(element).attr(['x1', 'x2', 'y1', 'y2']);
    keep = (attrs.x1 !== attrs.x2 || attrs.y1 !== attrs.y2);
    break;
  case 'foreignObject':
  case 'square':
  case 'rect':
  case 'image':
    attrs = $(element).attr(['width', 'height']);
    // Image should be kept regardless of size (use inherit dimensions later)
    keep = (attrs.width || attrs.height) || eventContext_.getCurrentMode() === 'image';
    break;
  case 'circle':
    keep = (element.getAttribute('r') !== '0');
    break;
  case 'ellipse':
    attrs = $(element).attr(['rx', 'ry']);
    keep = (attrs.rx || attrs.ry);
    break;
  case 'fhellipse':
    if ((eventContext_.getFreehand('maxx') - eventContext_.getFreehand('minx')) > 0 &&
(eventContext_.getFreehand('maxy') - eventContext_.getFreehand('miny')) > 0) {
      element = eventContext_.addSVGElementFromJson({
        element: 'ellipse',
        curStyles: true,
        attr: {
          cx: (eventContext_.getFreehand('minx') + eventContext_.getFreehand('maxx')) / 2,
          cy: (eventContext_.getFreehand('miny') + eventContext_.getFreehand('maxy')) / 2,
          rx: (eventContext_.getFreehand('maxx') - eventContext_.getFreehand('minx')) / 2,
          ry: (eventContext_.getFreehand('maxy') - eventContext_.getFreehand('miny')) / 2,
          id: eventContext_.getId()
        }
      });
      eventContext_.getCanvas().call('changed', [element]);
      keep = true;
    }
    break;
  case 'fhrect':
    if ((eventContext_.getFreehand('maxx') - eventContext_.getFreehand('minx')) > 0 &&
(eventContext_.getFreehand('maxy') - eventContext_.getFreehand('miny')) > 0) {
      element = eventContext_.addSVGElementFromJson({
        element: 'rect',
        curStyles: true,
        attr: {
          x: eventContext_.getFreehand('minx'),
          y: eventContext_.getFreehand('miny'),
          width: (eventContext_.getFreehand('maxx') - eventContext_.getFreehand('minx')),
          height: (eventContext_.getFreehand('maxy') - eventContext_.getFreehand('miny')),
          id: eventContext_.getId()
        }
      });
      eventContext_.getCanvas().call('changed', [element]);
      keep = true;
    }
    break;
  case 'text':
    keep = true;
    eventContext_.getCanvas().selectOnly([element]);
    eventContext_.getCanvas().textActions.start(element);
    break;
  case 'path': {
    // set element to null here so that it is not removed nor finalized
    element = null;
    // continue to be set to true so that mouseMove happens
    eventContext_.setStarted(true);

    const res = eventContext_.getCanvas().pathActions.mouseUp(evt, element, mouseX, mouseY);
    ({element} = res);
    ({keep} = res);
    break;
  } case 'pathedit':
    keep = true;
    element = null;
    eventContext_.getCanvas().pathActions.mouseUp(evt);
    break;
  case 'textedit':
    keep = false;
    element = null;
    eventContext_.getCanvas().textActions.mouseUp(evt, mouseX, mouseY);
    break;
  case 'rotate': {
    keep = true;
    element = null;
    eventContext_.setCurrentMode('select');
    const batchCmd = eventContext_.getCanvas().undoMgr.finishUndoableChange();
    if (!batchCmd.isEmpty()) {
      eventContext_.addCommandToHistory(batchCmd);
    }
    // perform recalculation to weed out any stray identity transforms that might get stuck
    eventContext_.getCanvas().recalculateAllSelectedDimensions();
    eventContext_.getCanvas().call('changed', selectedElements);
    break;
  } default:
    // This could occur in an extension
    break;
}

  /**
* The main (left) mouse button is released (anywhere).
* @event module:svgcanvas.SvgCanvas#event:ext_mouseUp
* @type {PlainObject}
* @property {MouseEvent} event The event object
* @property {Float} mouse_x x coordinate on canvas
* @property {Float} mouse_y y coordinate on canvas
*/
  const extResult = eventContext_.getCanvas().runExtensions('mouseUp', /** @type {module:svgcanvas.SvgCanvas#event:ext_mouseUp} */ {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY
  }, true);

  $.each(extResult, function (i, r) {
    if (r) {
      keep = r.keep || keep;
      ({element} = r);
      eventContext_.setStarted(r.started || eventContext_.getStarted());
    }
  });

  if (!keep && !isNullish(element)) {
    eventContext_.getCanvas().getCurrentDrawing().releaseId(eventContext_.getId());
    element.remove();
    element = null;

    t = evt.target;

    // if this element is in a group, go up until we reach the top-level group
    // just below the layer groups
    // TODO: once we implement links, we also would have to check for <a> elements
    while (t && t.parentNode && t.parentNode.parentNode && t.parentNode.parentNode.tagName === 'g') {
      t = t.parentNode;
    }
    // if we are not in the middle of creating a path, and we've clicked on some shape,
    // then go to Select mode.
    // WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
    if ((eventContext_.getCurrentMode() !== 'path' || !eventContext_.getDrawnPath()) &&
t && t.parentNode &&
t.parentNode.id !== 'selectorParentGroup' &&
t.id !== 'svgcanvas' && t.id !== 'svgroot'
    ) {
      // switch into "select" mode if we've clicked on an element
      eventContext_.getCanvas().setMode('select');
      eventContext_.getCanvas().selectOnly([t], true);
    }
  } else if (!isNullish(element)) {
    /**
* @name module:svgcanvas.SvgCanvas#addedNew
* @type {boolean}
*/
    eventContext_.getCanvas().addedNew = true;

    if (useUnit) { convertAttrs(element); }

    let aniDur = 0.2;
    let cAni;
    const curShape = eventContext_.getCanvas().getStyle();
    const opacAni = eventContext_.getOpacAni();
    if (opacAni.beginElement && Number.parseFloat(element.getAttribute('opacity')) !== curShape.opacity) {
      cAni = $(opacAni).clone().attr({
        to: curShape.opacity,
        dur: aniDur
      }).appendTo(element);
      try {
        // Fails in FF4 on foreignObject
        cAni[0].beginElement();
      } catch (e) {}
    } else {
      aniDur = 0;
    }

    // Ideally this would be done on the endEvent of the animation,
    // but that doesn't seem to be supported in Webkit
    setTimeout(function () {
      if (cAni) { cAni.remove(); }
      element.setAttribute('opacity', curShape.opacity);
      element.setAttribute('style', 'pointer-events:inherit');
      cleanupElement(element);
      if (eventContext_.getCurrentMode() === 'path') {
        eventContext_.getCanvas().pathActions.toEditMode(element);
      } else if (eventContext_.getCurConfig().selectNew) {
        eventContext_.getCanvas().selectOnly([element], true);
      }
      // we create the insert command that is stored on the stack
      // undo means to call cmd.unapply(), redo means to call cmd.apply()
      eventContext_.addCommandToHistory(new InsertElementCommand(element));
      eventContext_.getCanvas().call('changed', [element]);
    }, aniDur * 1000);
  }
  eventContext_.setStartTransform(null);
};

export const dblClickEvent = function (evt) {
  const selectedElements = eventContext_.getSelectedElements();
  const evtTarget = evt.target;
  const parent = evtTarget.parentNode;

  let mouseTarget = eventContext_.getCanvas().getMouseTarget(evt);
  const {tagName} = mouseTarget;

  if (tagName === 'text' && eventContext_.getCurrentMode() !== 'textedit') {
    const pt = transformPoint(evt.pageX, evt.pageY, eventContext_.getrootSctm());
    eventContext_.getCanvas().textActions.select(mouseTarget, pt.x, pt.y);
  }

  // Do nothing if already in current group
  if (parent === eventContext_.getCurrentGroup()) { return; }

  if ((tagName === 'g' || tagName === 'a') && getRotationAngle(mouseTarget)) {
    // TODO: Allow method of in-group editing without having to do
    // this (similar to editing rotated paths)

    // Ungroup and regroup
    eventContext_.getCanvas().pushGroupProperties(mouseTarget);
    mouseTarget = selectedElements[0];
    eventContext_.getCanvas().clearSelection(true);
  }
  // Reset context
  if (eventContext_.getCurrentGroup()) {
    draw.leaveContext();
  }

  if ((parent.tagName !== 'g' && parent.tagName !== 'a') ||
parent === eventContext_.getCanvas().getCurrentDrawing().getCurrentLayer() ||
mouseTarget === eventContext_.getCanvas().selectorManager.selectorParentGroup
  ) {
    // Escape from in-group edit
    return;
  }
  draw.setContext(mouseTarget);
};
