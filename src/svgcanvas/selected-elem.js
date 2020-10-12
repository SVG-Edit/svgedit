/**
 * Tools for SVG selected element operation.
 * @module selected-elem
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */
import jQueryPluginSVG from '../common/jQuery.attr.js'; // Needed for SVG attribute 
import * as hstry from './history.js';
import * as pathModule from './path.js';
import {
  isNullish, getStrokedBBoxDefaultVisible, setHref
} from '../common/utilities.js';
import {
  getTransformList, 
} from '../common/svgtransformlist.js';
import {
  recalculateDimensions,
} from './recalculate.js';
const {
  MoveElementCommand, BatchCommand, InsertElementCommand, RemoveElementCommand
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

/**
* Create deep DOM copies (clones) of all selected elements and move them slightly
* from their originals.
* @function module:svgcanvas.SvgCanvas#cloneSelectedElements
* @param {Float} x Float with the distance to move on the x-axis
* @param {Float} y Float with the distance to move on the y-axis
* @returns {void}
*/
export const cloneSelectedElements = function (x, y) {
  const selectedElements = elementContext_.getSelectedElements();
  const currentGroup = elementContext_.getCurrentGroup();
  let i, elem;
  const batchCmd = new BatchCommand('Clone Elements');
  // find all the elements selected (stop at first null)
  const len = selectedElements.length;
  /**
* Sorts an array numerically and ascending.
* @param {Element} a
* @param {Element} b
* @returns {Integer}
*/
  function sortfunction (a, b) {
    return ($(b).index() - $(a).index());
  }
  selectedElements.sort(sortfunction);
  for (i = 0; i < len; ++i) {
    elem = selectedElements[i];
    if (isNullish(elem)) { break; }
  }
  // use slice to quickly get the subset of elements we need
  const copiedElements = selectedElements.slice(0, i);
  this.clearSelection(true);
  // note that we loop in the reverse way because of the way elements are added
  // to the selectedElements array (top-first)
  const drawing = elementContext_.getDrawing();
  i = copiedElements.length;
  while (i--) {
    // clone each element and replace it within copiedElements
    elem = copiedElements[i] = drawing.copyElem(copiedElements[i]);
    (currentGroup || drawing.getCurrentLayer()).append(elem);
    batchCmd.addSubCommand(new InsertElementCommand(elem));
  }

  if (!batchCmd.isEmpty()) {
    elementContext_.addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
    moveSelectedElements(x, y, false);
    elementContext_.addCommandToHistory(batchCmd);
  }
};
/**
* Aligns selected elements.
* @function module:svgcanvas.SvgCanvas#alignSelectedElements
* @param {string} type - String with single character indicating the alignment type
* @param {"selected"|"largest"|"smallest"|"page"} relativeTo
* @returns {void}
*/
export const alignSelectedElements = function (type, relativeTo) {
  const selectedElements = elementContext_.getSelectedElements();
  const bboxes = []; // angles = [];
  const len = selectedElements.length;
  if (!len) { return; }
  let minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE,
    miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
  let curwidth = Number.MIN_VALUE, curheight = Number.MIN_VALUE;
  for (let i = 0; i < len; ++i) {
    if (isNullish(selectedElements[i])) { break; }
    const elem = selectedElements[i];
    bboxes[i] = getStrokedBBoxDefaultVisible([elem]);

    // now bbox is axis-aligned and handles rotation
    switch (relativeTo) {
    case 'smallest':
      if (((type === 'l' || type === 'c' || type === 'r') &&
    (curwidth === Number.MIN_VALUE || curwidth > bboxes[i].width)) ||
    ((type === 't' || type === 'm' || type === 'b') &&
    (curheight === Number.MIN_VALUE || curheight > bboxes[i].height))
      ) {
        minx = bboxes[i].x;
        miny = bboxes[i].y;
        maxx = bboxes[i].x + bboxes[i].width;
        maxy = bboxes[i].y + bboxes[i].height;
        curwidth = bboxes[i].width;
        curheight = bboxes[i].height;
      }
      break;
    case 'largest':
      if (((type === 'l' || type === 'c' || type === 'r') &&
    (curwidth === Number.MIN_VALUE || curwidth < bboxes[i].width)) ||
    ((type === 't' || type === 'm' || type === 'b') &&
    (curheight === Number.MIN_VALUE || curheight < bboxes[i].height))
      ) {
        minx = bboxes[i].x;
        miny = bboxes[i].y;
        maxx = bboxes[i].x + bboxes[i].width;
        maxy = bboxes[i].y + bboxes[i].height;
        curwidth = bboxes[i].width;
        curheight = bboxes[i].height;
      }
      break;
    default: // 'selected'
      if (bboxes[i].x < minx) { minx = bboxes[i].x; }
      if (bboxes[i].y < miny) { miny = bboxes[i].y; }
      if (bboxes[i].x + bboxes[i].width > maxx) { maxx = bboxes[i].x + bboxes[i].width; }
      if (bboxes[i].y + bboxes[i].height > maxy) { maxy = bboxes[i].y + bboxes[i].height; }
      break;
    }
  } // loop for each element to find the bbox and adjust min/max

  if (relativeTo === 'page') {
    minx = 0;
    miny = 0;
    maxx = elementContext_.getContentW();
    maxy = elementContext_.getContentH();
  }

  const dx = new Array(len);
  const dy = new Array(len);
  for (let i = 0; i < len; ++i) {
    if (isNullish(selectedElements[i])) { break; }
    // const elem = selectedElements[i];
    const bbox = bboxes[i];
    dx[i] = 0;
    dy[i] = 0;
    switch (type) {
    case 'l': // left (horizontal)
      dx[i] = minx - bbox.x;
      break;
    case 'c': // center (horizontal)
      dx[i] = (minx + maxx) / 2 - (bbox.x + bbox.width / 2);
      break;
    case 'r': // right (horizontal)
      dx[i] = maxx - (bbox.x + bbox.width);
      break;
    case 't': // top (vertical)
      dy[i] = miny - bbox.y;
      break;
    case 'm': // middle (vertical)
      dy[i] = (miny + maxy) / 2 - (bbox.y + bbox.height / 2);
      break;
    case 'b': // bottom (vertical)
      dy[i] = maxy - (bbox.y + bbox.height);
      break;
    }
  }
  moveSelectedElements(dx, dy);
};

/**
* Removes all selected elements from the DOM and adds the change to the
* history stack.
* @function module:svgcanvas.SvgCanvas#deleteSelectedElements
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const deleteSelectedElements = function () {
  const selectedElements = elementContext_.getSelectedElements();
  const batchCmd = new BatchCommand('Delete Elements');
  const len = selectedElements.length;
  const selectedCopy = []; // selectedElements is being deleted

  for (let i = 0; i < len; ++i) {
    const selected = selectedElements[i];
    if (isNullish(selected)) { break; }

    let parent = selected.parentNode;
    let t = selected;

    // this will unselect the element and remove the selectedOutline
    elementContext_.gettingSelectorManager().releaseSelector(t);

    // Remove the path if present.
    pathModule.removePath_(t.id);

    // Get the parent if it's a single-child anchor
    if (parent.tagName === 'a' && parent.childNodes.length === 1) {
      t = parent;
      parent = parent.parentNode;
    }

    const {nextSibling} = t;
    t.remove();
    const elem = t;
    selectedCopy.push(selected); // for the copy
    batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
  }
  elementContext_.setSelectedElements();

  if (!batchCmd.isEmpty()) { elementContext_.addCommandToHistory(batchCmd); }
  elementContext_.call('changed', selectedCopy);
  elementContext_.clearSelection();
};

/**
* Remembers the current selected elements on the clipboard.
* @function module:svgcanvas.SvgCanvas#copySelectedElements
* @returns {void}
*/
export const copySelectedElements = function () {
  const selectedElements = elementContext_.getSelectedElements();
  const data =
  JSON.stringify(selectedElements.map((x) => elementContext_.getJsonFromSvgElement(x)));
  // Use sessionStorage for the clipboard data.
  sessionStorage.setItem(elementContext_.getClipboardID(), data);
  elementContext_.flashStorage();

  const menu = $('#cmenu_canvas');
  // Context menu might not exist (it is provided by editor.js).
  if (menu.enableContextMenuItems) {
    menu.enableContextMenuItems('#paste,#paste_in_place');
  }
};

/**
* Wraps all the selected elements in a group (`g`) element.
* @function module:svgcanvas.SvgCanvas#groupSelectedElements
* @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
* @param {string} [urlArg]
* @returns {void}
*/
export const groupSelectedElements = function (type, urlArg) {
  const selectedElements = elementContext_.getSelectedElements();
  if (!type) { type = 'g'; }
  let cmdStr = '';
  let url;

  switch (type) {
  case 'a': {
    cmdStr = 'Make hyperlink';
    url = urlArg || '';
    break;
  } default: {
    type = 'g';
    cmdStr = 'Group Elements';
    break;
  }
  }

  const batchCmd = new BatchCommand(cmdStr);

  // create and insert the group element
  const g = elementContext_.addSVGElementFromJson({
    element: type,
    attr: {
      id: elementContext_.getNextId()
    }
  });
  if (type === 'a') {
    setHref(g, url);
  }
  batchCmd.addSubCommand(new InsertElementCommand(g));

  // now move all children into the group
  let i = selectedElements.length;
  while (i--) {
    let elem = selectedElements[i];
    if (isNullish(elem)) { continue; }

    if (elem.parentNode.tagName === 'a' && elem.parentNode.childNodes.length === 1) {
      elem = elem.parentNode;
    }

    const oldNextSibling = elem.nextSibling;
    const oldParent = elem.parentNode;
    g.append(elem);
    batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
  }
  if (!batchCmd.isEmpty()) { elementContext_.addCommandToHistory(batchCmd); }

  // update selection
  elementContext_.selectOnly([g], true);
};
