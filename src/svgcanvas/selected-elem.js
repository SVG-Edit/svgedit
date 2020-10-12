/**
 * Tools for SVG selected element operation.
 * @module selected-elem
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */
import jQueryPluginSVG from '../common/jQuery.attr.js'; // Needed for SVG attribute 
import * as hstry from './history.js';
import {
  isNullish, getStrokedBBoxDefaultVisible
} from '../common/utilities.js';
import {
  getTransformList, 
} from '../common/svgtransformlist.js';
import {
  recalculateDimensions,
} from './recalculate.js';
const {
  MoveElementCommand, BatchCommand
} = hstry;
let $ = jQueryPluginSVG(jQuery);

let elementContext_ = null;

/**
* @function module:selected-elem.init
* @param {module:selected-elem.elementContext} elementContext
* @returns {void}
*/
export const init = function (elementContext) {
  elementContext_ = elementContext;
};

/**
* Repositions the selected element to the bottom in the DOM to appear on top of
* other elements.
* @function module:selected-elem.SvgCanvas#moveToTopSelectedElem
* @fires module:selected-elem.SvgCanvas#event:changed
* @returns {void}
*/
export const moveToTopSelectedElem = function () {
  const [selected] = elementContext_.getSelectedElements();
  if (!isNullish(selected)) {
    let t = selected;
    const oldParent = t.parentNode;
    const oldNextSibling = t.nextSibling;
    t = t.parentNode.appendChild(t);
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      elementContext_.addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'top'));
      elementContext_.call('changed', [t]);
    }
  }
};

/**
* Repositions the selected element to the top in the DOM to appear under
* other elements.
* @function module:svgcanvas.SvgCanvas#moveToBottomSelectedElement
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const moveToBottomSelectedElem = function () {
  const [selected] = elementContext_.getSelectedElements();
  if (!isNullish(selected)) {
    let t = selected;
    const oldParent = t.parentNode;
    const oldNextSibling = t.nextSibling;
    let {firstChild} = t.parentNode;
    if (firstChild.tagName === 'title') {
      firstChild = firstChild.nextSibling;
    }
    // This can probably be removed, as the defs should not ever apppear
    // inside a layer group
    if (firstChild.tagName === 'defs') {
      firstChild = firstChild.nextSibling;
    }
    t = t.parentNode.insertBefore(t, firstChild);
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      elementContext_.addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'bottom'));
      elementContext_.call('changed', [t]);
    }
  }
};

/**
* Moves the select element up or down the stack, based on the visibly
* intersecting elements.
* @function module:svgcanvas.SvgCanvas#moveUpDownSelected
* @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const moveUpDownSelected = function (dir) {
  console.log('moveUpDownSelected -----> ');
  const selectedElements = elementContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!selected) { return; }

  elementContext_.setCurBBoxes([]);
  // curBBoxes = [];
  let closest, foundCur;
  // jQuery sorts this list
  const list = $(elementContext_.getIntersectionList(getStrokedBBoxDefaultVisible([selected]))).toArray();
  if (dir === 'Down') { list.reverse(); }

  $.each(list, function () {
    if (!foundCur) {
      if (this === selected) {
        foundCur = true;
      }
      return true;
    }
    closest = this;
    return false;
  });
  if (!closest) { return; }

  const t = selected;
  const oldParent = t.parentNode;
  const oldNextSibling = t.nextSibling;
  $(closest)[dir === 'Down' ? 'before' : 'after'](t);
  // If the element actually moved position, add the command and fire the changed
  // event handler.
  if (oldNextSibling !== t.nextSibling) {
    elementContext_.addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'Move ' + dir));
    elementContext_.call('changed', [t]);
  }
};

/**
* Moves selected elements on the X/Y axis.
* @function module:svgcanvas.SvgCanvas#moveSelectedElements
* @param {Float} dx - Float with the distance to move on the x-axis
* @param {Float} dy - Float with the distance to move on the y-axis
* @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {BatchCommand|void} Batch command for the move
*/

export const moveSelectedElements = function (dx, dy, undoable) {
  const selectedElements = elementContext_.getSelectedElements();
  const currentZoom = elementContext_.getCurrentZoom();
  // if undoable is not sent, default to true
  // if single values, scale them to the zoom
  if (dx.constructor !== Array) {
    dx /= currentZoom;
    dy /= currentZoom;
  }
  undoable = undoable || true;
  const batchCmd = new BatchCommand('position');
  let i = selectedElements.length;
  while (i--) {
    const selected = selectedElements[i];
    if (!isNullish(selected)) {
      // if (i === 0) {
      //   selectedBBoxes[0] = utilsGetBBox(selected);
      // }
      // const b = {};
      // for (const j in selectedBBoxes[i]) b[j] = selectedBBoxes[i][j];
      // selectedBBoxes[i] = b;

      const xform = elementContext_.getSVGRoot().createSVGTransform();
      const tlist = getTransformList(selected);

      // dx and dy could be arrays
      if (dx.constructor === Array) {
        // if (i === 0) {
        //   selectedBBoxes[0].x += dx[0];
        //   selectedBBoxes[0].y += dy[0];
        // }
        xform.setTranslate(dx[i], dy[i]);
      } else {
        // if (i === 0) {
        //   selectedBBoxes[0].x += dx;
        //   selectedBBoxes[0].y += dy;
        // }
        xform.setTranslate(dx, dy);
      }

      if (tlist.numberOfItems) {
        tlist.insertItemBefore(xform, 0);
      } else {
        tlist.appendItem(xform);
      }

      const cmd = recalculateDimensions(selected);
      if (cmd) {
        batchCmd.addSubCommand(cmd);
      }

      elementContext_.gettingSelectorManager().requestSelector(selected).resize();
    }
  }
  if (!batchCmd.isEmpty()) {
    if (undoable) {
      elementContext_.addCommandToHistory(batchCmd);
    }
    elementContext_.call('changed', selectedElements);
    return batchCmd;
  }
  return undefined;
};