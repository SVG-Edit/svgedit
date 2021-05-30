/**
 * Tools for SVG selected element operation.
 * @module selected-elem
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Jeff Schiller
 */

import { NS } from '../common/namespaces.js';
import * as hstry from './history.js';
import * as pathModule from './path.js';
import {
  isNullish, getStrokedBBoxDefaultVisible, setHref, getElem, getHref, getVisibleElements,
  findDefs, getRotationAngle, getRefElem, getBBox as utilsGetBBox, walkTreePost, assignAttributes, getFeGaussianBlur
} from './utilities.js';
import {
  transformPoint, matrixMultiply, transformListToTransform
} from './math.js';
import {
  getTransformList
} from './svgtransformlist.js';
import {
  recalculateDimensions
} from './recalculate.js';
import {
  isGecko
} from '../common/browser.js'; // , supportsEditableText
import { getParents } from '../editor/components/jgraduate/Util.js';

const {
  MoveElementCommand, BatchCommand, InsertElementCommand, RemoveElementCommand, ChangeElementCommand
} = hstry;

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
  const [ selected ] = elementContext_.getSelectedElements();
  if (!isNullish(selected)) {
    const t = selected;
    const oldParent = t.parentNode;
    const oldNextSibling = t.nextSibling;
    t.parentNode.append(t);
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      elementContext_.addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'top'));
      elementContext_.call('changed', [ t ]);
    }
  }
};

/**
* Repositions the selected element to the top in the DOM to appear under
* other elements.
* @function module:selected-elem.SvgCanvas#moveToBottomSelectedElement
* @fires module:selected-elem.SvgCanvas#event:changed
* @returns {void}
*/
export const moveToBottomSelectedElem = function () {
  const [ selected ] = elementContext_.getSelectedElements();
  if (!isNullish(selected)) {
    let t = selected;
    const oldParent = t.parentNode;
    const oldNextSibling = t.nextSibling;
    let { firstChild } = t.parentNode;
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
      elementContext_.call('changed', [ t ]);
    }
  }
};

/**
* Moves the select element up or down the stack, based on the visibly
* intersecting elements.
* @function module:selected-elem.SvgCanvas#moveUpDownSelected
* @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
* @fires module:selected-elem.SvgCanvas#event:changed
* @returns {void}
*/
export const moveUpDownSelected = function (dir) {
  const selectedElements = elementContext_.getSelectedElements();
  const selected = selectedElements[0];
  if (!selected) { return; }

  elementContext_.setCurBBoxes([]);
  // curBBoxes = [];
  let closest; let foundCur;
  // jQuery sorts this list
  const list = elementContext_.getIntersectionList(getStrokedBBoxDefaultVisible([ selected ]));
  if (dir === 'Down') { list.reverse(); }

  Array.prototype.forEach.call(list, function (el) {
    if (!foundCur) {
      if (el === selected) {
        foundCur = true;
      }
      return true;
    }
    closest = el;
    return false;
  });
  if (!closest) { return; }

  const t = selected;
  const oldParent = t.parentNode;
  const oldNextSibling = t.nextSibling;
  if (dir === 'Down') {
    closest.insertAdjacentElement('beforebegin', t);
  } else {
    closest.insertAdjacentElement('afterend', t);
  }
  // If the element actually moved position, add the command and fire the changed
  // event handler.
  if (oldNextSibling !== t.nextSibling) {
    elementContext_.addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'Move ' + dir));
    elementContext_.call('changed', [ t ]);
  }
};

/**
* Moves selected elements on the X/Y axis.
* @function module:selected-elem.SvgCanvas#moveSelectedElements
* @param {Float} dx - Float with the distance to move on the x-axis
* @param {Float} dy - Float with the distance to move on the y-axis
* @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
* @fires module:selected-elem.SvgCanvas#event:changed
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
* @function module:selected-elem.SvgCanvas#cloneSelectedElements
* @param {Float} x Float with the distance to move on the x-axis
* @param {Float} y Float with the distance to move on the y-axis
* @returns {void}
*/
export const cloneSelectedElements = function (x, y) {
  const selectedElements = elementContext_.getSelectedElements();
  const currentGroup = elementContext_.getCurrentGroup();
  let i; let elem;
  const batchCmd = new BatchCommand('Clone Elements');
  // find all the elements selected (stop at first null)
  const len = selectedElements.length;

  function index(el) {
    if (!el) return -1;
    let i = 0;
    do {
      i++;
    } while (el == el.previousElementSibling);
    return i;
  }

  /**
* Sorts an array numerically and ascending.
* @param {Element} a
* @param {Element} b
* @returns {Integer}
*/
  function sortfunction(a, b) {
    return (index(b) - index(a));
  }
  selectedElements.sort(sortfunction);
  for (i = 0; i < len; ++i) {
    elem = selectedElements[i];
    if (isNullish(elem)) { break; }
  }
  // use slice to quickly get the subset of elements we need
  const copiedElements = selectedElements.slice(0, i);
  elementContext_.clearSelection(true);
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
* @function module:selected-elem.SvgCanvas#alignSelectedElements
* @param {string} type - String with single character indicating the alignment type
* @param {"selected"|"largest"|"smallest"|"page"} relativeTo
* @returns {void}
*/
export const alignSelectedElements = function (type, relativeTo) {
  const selectedElements = elementContext_.getSelectedElements();
  const bboxes = []; // angles = [];
  const len = selectedElements.length;
  if (!len) { return; }
  let minx = Number.MAX_VALUE; let maxx = Number.MIN_VALUE;
  let miny = Number.MAX_VALUE; let maxy = Number.MIN_VALUE;
  let curwidth = Number.MIN_VALUE; let curheight = Number.MIN_VALUE;
  for (let i = 0; i < len; ++i) {
    if (isNullish(selectedElements[i])) { break; }
    const elem = selectedElements[i];
    bboxes[i] = getStrokedBBoxDefaultVisible([ elem ]);

    // now bbox is axis-aligned and handles rotation
    switch (relativeTo) {
    case 'smallest':
      if (((type === 'l' || type === 'c' || type === 'r' || type === 'left' || type === 'center' || type === 'right') &&
          (curwidth === Number.MIN_VALUE || curwidth > bboxes[i].width)) ||
          ((type === 't' || type === 'm' || type === 'b' || type === 'top' || type === 'middle' || type === 'bottom') &&
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
      if (((type === 'l' || type === 'c' || type === 'r' || type === 'left' || type === 'center' || type === 'right') &&
          (curwidth === Number.MIN_VALUE || curwidth < bboxes[i].width)) ||
          ((type === 't' || type === 'm' || type === 'b' || type === 'top' || type === 'middle' || type === 'bottom') &&
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
    case 'left': // left (horizontal)
      dx[i] = minx - bbox.x;
      break;
    case 'c': // center (horizontal)
    case 'center': // center (horizontal)
      dx[i] = (minx + maxx) / 2 - (bbox.x + bbox.width / 2);
      break;
    case 'r': // right (horizontal)
    case 'right': // right (horizontal)
      dx[i] = maxx - (bbox.x + bbox.width);
      break;
    case 't': // top (vertical)
    case 'top': // top (vertical)
      dy[i] = miny - bbox.y;
      break;
    case 'm': // middle (vertical)
    case 'middle': // middle (vertical)
      dy[i] = (miny + maxy) / 2 - (bbox.y + bbox.height / 2);
      break;
    case 'b': // bottom (vertical)
    case 'bottom': // bottom (vertical)
      dy[i] = maxy - (bbox.y + bbox.height);
      break;
    }
  }
  moveSelectedElements(dx, dy);
};

/**
* Removes all selected elements from the DOM and adds the change to the
* history stack.
* @function module:selected-elem.SvgCanvas#deleteSelectedElements
* @fires module:selected-elem.SvgCanvas#event:changed
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

    const { nextSibling } = t;
    t.remove();
    const elem = t;
    selectedCopy.push(selected); // for the copy
    batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
  }
  elementContext_.getCanvas().setEmptySelectedElements();

  if (!batchCmd.isEmpty()) { elementContext_.addCommandToHistory(batchCmd); }
  elementContext_.call('changed', selectedCopy);
  elementContext_.clearSelection();
};

/**
* Remembers the current selected elements on the clipboard.
* @function module:selected-elem.SvgCanvas#copySelectedElements
* @returns {void}
*/
export const copySelectedElements = function () {
  const selectedElements = elementContext_.getSelectedElements();
  const data =
    JSON.stringify(selectedElements.map((x) => elementContext_.getJsonFromSvgElement(x)));
  // Use sessionStorage for the clipboard data.
  sessionStorage.setItem(elementContext_.getClipboardID(), data);
  elementContext_.flashStorage();

  // Context menu might not exist (it is provided by editor.js).
  const canvMenu = document.getElementById('se-cmenu_canvas');
  canvMenu.setAttribute('enablemenuitems', '#paste,#paste_in_place');
};

/**
* Wraps all the selected elements in a group (`g`) element.
* @function module:selected-elem.SvgCanvas#groupSelectedElements
* @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
* @param {string} [urlArg]
* @returns {void}
*/
export const groupSelectedElements = function (type, urlArg) {
  const selectedElements = elementContext_.getSelectedElements();
  if (!type) { type = 'g'; }
  let cmdStr = '';
  let url;

  // eslint-disable-next-line sonarjs/no-small-switch
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
  elementContext_.selectOnly([ g ], true);
};

/**
* Pushes all appropriate parent group properties down to its children, then
* removes them from the group.
* @function module:selected-elem.SvgCanvas#pushGroupProperty
* @param {SVGAElement|SVGGElement} g
* @param {boolean} undoable
* @returns {BatchCommand|void}
*/
export const pushGroupProperty = function (g, undoable) {
  const children = g.childNodes;
  const len = children.length;
  const xform = g.getAttribute('transform');

  const glist = getTransformList(g);
  const m = transformListToTransform(glist).matrix;

  const batchCmd = new BatchCommand('Push group properties');

  // TODO: get all fill/stroke properties from the group that we are about to destroy
  // "fill", "fill-opacity", "fill-rule", "stroke", "stroke-dasharray", "stroke-dashoffset",
  // "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
  // "stroke-width"
  // and then for each child, if they do not have the attribute (or the value is 'inherit')
  // then set the child's attribute

  const gangle = getRotationAngle(g);

  const gattrs = {
    filter: g.getAttribute('filter'),
    opacity: g.getAttribute('opacity')
  };
  let gfilter; let gblur; let changes;
  const drawing = elementContext_.getDrawing();

  for (let i = 0; i < len; i++) {
    const elem = children[i];

    if (elem.nodeType !== 1) { continue; }

    if (gattrs.opacity !== null && gattrs.opacity !== 1) {
      // const c_opac = elem.getAttribute('opacity') || 1;
      const newOpac = Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100) / 100;
      elementContext_.changeSelectedAttribute('opacity', newOpac, [ elem ]);
    }

    if (gattrs.filter) {
      let cblur = elementContext_.getCanvas().getBlur(elem);
      const origCblur = cblur;
      if (!gblur) { gblur = elementContext_.getCanvas().getBlur(g); }
      if (cblur) {
        // Is this formula correct?
        cblur = Number(gblur) + Number(cblur);
      } else if (cblur === 0) {
        cblur = gblur;
      }

      // If child has no current filter, get group's filter or clone it.
      if (!origCblur) {
        // Set group's filter to use first child's ID
        if (!gfilter) {
          gfilter = getRefElem(gattrs.filter);
        } else {
          // Clone the group's filter
          gfilter = drawing.copyElem(gfilter);
          findDefs().append(gfilter);
        }
      } else {
        gfilter = getRefElem(elem.getAttribute('filter'));
      }
      // const filterElem = getRefElem(gfilter);
      const blurElem = getFeGaussianBlur(gfilter);
      // Change this in future for different filters
      const suffix = (blurElem?.tagName === 'feGaussianBlur') ? 'blur' : 'filter';
      gfilter.id = elem.id + '_' + suffix;
      elementContext_.changeSelectedAttribute('filter', 'url(#' + gfilter.id + ')', [ elem ]);

      // Update blur value
      if (cblur) {
        elementContext_.changeSelectedAttribute('stdDeviation', cblur, [ blurElem ]);
        elementContext_.getCanvas().setBlurOffsets(gfilter, cblur);
      }
    }

    let chtlist = getTransformList(elem);

    // Don't process gradient transforms
    if (elem.tagName.includes('Gradient')) { chtlist = null; }

    // Hopefully not a problem to add this. Necessary for elements like <desc/>
    if (!chtlist) { continue; }

    // Apparently <defs> can get get a transformlist, but we don't want it to have one!
    if (elem.tagName === 'defs') { continue; }

    if (glist.numberOfItems) {
      // TODO: if the group's transform is just a rotate, we can always transfer the
      // rotate() down to the children (collapsing consecutive rotates and factoring
      // out any translates)
      if (gangle && glist.numberOfItems === 1) {
        // [Rg] [Rc] [Mc]
        // we want [Tr] [Rc2] [Mc] where:
        //  - [Rc2] is at the child's current center but has the
        // sum of the group and child's rotation angles
        //  - [Tr] is the equivalent translation that this child
        // undergoes if the group wasn't there

        // [Tr] = [Rg] [Rc] [Rc2_inv]

        // get group's rotation matrix (Rg)
        const rgm = glist.getItem(0).matrix;

        // get child's rotation matrix (Rc)
        let rcm = elementContext_.getSVGRoot().createSVGMatrix();
        const cangle = getRotationAngle(elem);
        if (cangle) {
          rcm = chtlist.getItem(0).matrix;
        }

        // get child's old center of rotation
        const cbox = utilsGetBBox(elem);
        const ceqm = transformListToTransform(chtlist).matrix;
        const coldc = transformPoint(cbox.x + cbox.width / 2, cbox.y + cbox.height / 2, ceqm);

        // sum group and child's angles
        const sangle = gangle + cangle;

        // get child's rotation at the old center (Rc2_inv)
        const r2 = elementContext_.getSVGRoot().createSVGTransform();
        r2.setRotate(sangle, coldc.x, coldc.y);

        // calculate equivalent translate
        const trm = matrixMultiply(rgm, rcm, r2.matrix.inverse());

        // set up tlist
        if (cangle) {
          chtlist.removeItem(0);
        }

        if (sangle) {
          if (chtlist.numberOfItems) {
            chtlist.insertItemBefore(r2, 0);
          } else {
            chtlist.appendItem(r2);
          }
        }

        if (trm.e || trm.f) {
          const tr = elementContext_.getSVGRoot().createSVGTransform();
          tr.setTranslate(trm.e, trm.f);
          if (chtlist.numberOfItems) {
            chtlist.insertItemBefore(tr, 0);
          } else {
            chtlist.appendItem(tr);
          }
        }
      } else { // more complicated than just a rotate
        // transfer the group's transform down to each child and then
        // call recalculateDimensions()
        const oldxform = elem.getAttribute('transform');
        changes = {};
        changes.transform = oldxform || '';

        const newxform = elementContext_.getSVGRoot().createSVGTransform();

        // [ gm ] [ chm ] = [ chm ] [ gm' ]
        // [ gm' ] = [ chmInv ] [ gm ] [ chm ]
        const chm = transformListToTransform(chtlist).matrix;
        const chmInv = chm.inverse();
        const gm = matrixMultiply(chmInv, m, chm);
        newxform.setMatrix(gm);
        chtlist.appendItem(newxform);
      }
      const cmd = recalculateDimensions(elem);
      if (cmd) { batchCmd.addSubCommand(cmd); }
    }
  }

  // remove transform and make it undo-able
  if (xform) {
    changes = {};
    changes.transform = xform;
    g.setAttribute('transform', '');
    g.removeAttribute('transform');
    batchCmd.addSubCommand(new ChangeElementCommand(g, changes));
  }

  if (undoable && !batchCmd.isEmpty()) {
    return batchCmd;
  }
  return undefined;
};

/**
* Converts selected/given `<use>` or child SVG element to a group.
* @function module:selected-elem.SvgCanvas#convertToGroup
* @param {Element} elem
* @fires module:selected-elem.SvgCanvas#event:selected
* @returns {void}
*/
export const convertToGroup = function (elem) {
  const selectedElements = elementContext_.getSelectedElements();
  if (!elem) {
    elem = selectedElements[0];
  }
  const $elem = elem;
  const batchCmd = new BatchCommand();
  let ts;
  const dataStorage = elementContext_.getDataStorage();
  if (dataStorage.has($elem, 'gsvg')) {
    // Use the gsvg as the new group
    const svg = elem.firstChild;
    const pt = {
      x: svg.getAttribute('x'),
      y: svg.getAttribute('y')
    };

    // $(elem.firstChild.firstChild).unwrap();
    const firstChild = elem.firstChild.firstChild;
    if (firstChild) {
      // eslint-disable-next-line no-unsanitized/property
      firstChild.outerHTML = firstChild.innerHTML;
    }
    dataStorage.remove(elem, 'gsvg');

    const tlist = getTransformList(elem);
    const xform = elementContext_.getSVGRoot().createSVGTransform();
    xform.setTranslate(pt.x, pt.y);
    tlist.appendItem(xform);
    recalculateDimensions(elem);
    elementContext_.call('selected', [ elem ]);
  } else if (dataStorage.has($elem, 'symbol')) {
    elem = dataStorage.get($elem, 'symbol');

    ts = $elem.getAttribute('transform');
    const pos = {
      x: $elem.getAttribute('x'),
      y: $elem.getAttribute('y')
    };

    const vb = elem.getAttribute('viewBox');

    if (vb) {
      const nums = vb.split(' ');
      pos.x -= Number(nums[0]);
      pos.y -= Number(nums[1]);
    }

    // Not ideal, but works
    ts += ' translate(' + (pos.x || 0) + ',' + (pos.y || 0) + ')';

    const prev = $elem.prev();

    // Remove <use> element
    batchCmd.addSubCommand(new RemoveElementCommand($elem[0], $elem[0].nextSibling, $elem[0].parentNode));
    $elem.remove();

    // See if other elements reference this symbol
    const svgcontent = elementContext_.getSVGContent();
    const hasMore = svgcontent.querySelectorAll('use:data(symbol)').length;

    const g = elementContext_.getDOMDocument().createElementNS(NS.SVG, 'g');
    const childs = elem.childNodes;

    let i;
    for (i = 0; i < childs.length; i++) {
      g.append(childs[i].cloneNode(true));
    }

    // Duplicate the gradients for Gecko, since they weren't included in the <symbol>
    if (isGecko()) {
      const svgElement = findDefs();
      const gradients = svgElement.querySelectorAll('linearGradient,radialGradient,pattern');
      for (let i = 0, im = gradients.length; im > i; i++) {
        g.appendChild(gradients[i].cloneNode(true));
      }
    }

    if (ts) {
      g.setAttribute('transform', ts);
    }

    const parent = elem.parentNode;

    elementContext_.uniquifyElems(g);

    // Put the dupe gradients back into <defs> (after uniquifying them)
    if (isGecko()) {
      const svgElement = findDefs();
      const elements = g.querySelectorAll('linearGradient,radialGradient,pattern');
      for (let i = 0, im = elements.length; im > i; i++) {
        svgElement.appendChild(elements[i]);
      }
    }

    // now give the g itself a new id
    g.id = elementContext_.getNextId();

    prev.after(g);

    if (parent) {
      if (!hasMore) {
        // remove symbol/svg element
        const { nextSibling } = elem;
        elem.remove();
        batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
      }
      batchCmd.addSubCommand(new InsertElementCommand(g));
    }

    elementContext_.setUseData(g);

    if (isGecko()) {
      elementContext_.convertGradients(findDefs());
    } else {
      elementContext_.convertGradients(g);
    }

    // recalculate dimensions on the top-level children so that unnecessary transforms
    // are removed
    walkTreePost(g, function (n) {
      try {
        recalculateDimensions(n);
      } catch (e) {
        console.error(e);
      }
    });

    // Give ID for any visible element missing one
    const visElems = g.querySelectorAll(elementContext_.getVisElems());
    Array.prototype.forEach.call(visElems, function (el) {
      if (!el.id) { el.id = elementContext_.getNextId(); }
    });

    elementContext_.selectOnly([ g ]);

    const cm = pushGroupProperty(g, true);
    if (cm) {
      batchCmd.addSubCommand(cm);
    }

    elementContext_.addCommandToHistory(batchCmd);
  } else {
    console.warn('Unexpected element to ungroup:', elem);
  }
};

/**
* Unwraps all the elements in a selected group (`g`) element. This requires
* significant recalculations to apply group's transforms, etc. to its children.
* @function module:selected-elem.SvgCanvas#ungroupSelectedElement
* @returns {void}
*/
export const ungroupSelectedElement = function () {
  const selectedElements = elementContext_.getSelectedElements();
  const dataStorage = elementContext_.getDataStorage();
  let g = selectedElements[0];
  if (!g) {
    return;
  }
  if (dataStorage.has(g, 'gsvg') || dataStorage.has(g, 'symbol')) {
    // Is svg, so actually convert to group
    convertToGroup(g);
    return;
  }
  if (g.tagName === 'use') {
    // Somehow doesn't have data set, so retrieve
    const symbol = getElem(getHref(g).substr(1));
    dataStorage.put(g, 'symbol', symbol);
    dataStorage.put(g, 'ref', symbol);
    convertToGroup(g);
    return;
  }
  const parentsA = getParents(g.parentNode, 'a');
  if (parentsA?.length) {
    g = parentsA[0];
  }

  // Look for parent "a"
  if (g.tagName === 'g' || g.tagName === 'a') {
    const batchCmd = new BatchCommand('Ungroup Elements');
    const cmd = pushGroupProperty(g, true);
    if (cmd) { batchCmd.addSubCommand(cmd); }

    const parent = g.parentNode;
    const anchor = g.nextSibling;
    const children = new Array(g.childNodes.length);

    let i = 0;
    while (g.firstChild) {
      const elem = g.firstChild;
      const oldNextSibling = elem.nextSibling;
      const oldParent = elem.parentNode;

      // Remove child title elements
      if (elem.tagName === 'title') {
        const { nextSibling } = elem;
        batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, oldParent));
        elem.remove();
        continue;
      }

      if (anchor) {
        anchor.before(elem);
      } else {
        g.after(elem);
      }
      children[i++] = elem;
      batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
    }

    // remove the group from the selection
    elementContext_.clearSelection();

    // delete the group element (but make undo-able)
    const gNextSibling = g.nextSibling;
    g.remove();
    batchCmd.addSubCommand(new RemoveElementCommand(g, gNextSibling, parent));

    if (!batchCmd.isEmpty()) { elementContext_.addCommandToHistory(batchCmd); }

    // update selection
    elementContext_.addToSelection(children);
  }
};
/**
* Updates the editor canvas width/height/position after a zoom has occurred.
* @function module:svgcanvas.SvgCanvas#updateCanvas
* @param {Float} w - Float with the new width
* @param {Float} h - Float with the new height
* @fires module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
* @returns {module:svgcanvas.CanvasInfo}
*/
export const updateCanvas = function (w, h) {
  elementContext_.getSVGRoot().setAttribute('width', w);
  elementContext_.getSVGRoot().setAttribute('height', h);
  const currentZoom = elementContext_.getCurrentZoom();
  const bg = document.getElementById('canvasBackground');
  const oldX = elementContext_.getSVGContent().getAttribute('x');
  const oldY = elementContext_.getSVGContent().getAttribute('y');
  const x = ((w - this.contentW * currentZoom) / 2);
  const y = ((h - this.contentH * currentZoom) / 2);

  assignAttributes(elementContext_.getSVGContent(), {
    width: this.contentW * currentZoom,
    height: this.contentH * currentZoom,
    x,
    y,
    viewBox: '0 0 ' + this.contentW + ' ' + this.contentH
  });

  assignAttributes(bg, {
    width: elementContext_.getSVGContent().getAttribute('width'),
    height: elementContext_.getSVGContent().getAttribute('height'),
    x,
    y
  });

  const bgImg = getElem('background_image');
  if (bgImg) {
    assignAttributes(bgImg, {
      width: '100%',
      height: '100%'
    });
  }

  elementContext_.getCanvas().selectorManager.selectorParentGroup.setAttribute('transform', 'translate(' + x + ',' + y + ')');

  /**
* Invoked upon updates to the canvas.
* @event module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
* @type {PlainObject}
* @property {Integer} new_x
* @property {Integer} new_y
* @property {string} old_x (Of Integer)
* @property {string} old_y (Of Integer)
* @property {Integer} d_x
* @property {Integer} d_y
*/
  elementContext_.getCanvas().runExtensions(
    'canvasUpdated',
    /**
 * @type {module:svgcanvas.SvgCanvas#event:ext_canvasUpdated}
 */
    { new_x: x, new_y: y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY }
  );
  return { x, y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY };
};
/**
* Select the next/previous element within the current layer.
* @function module:svgcanvas.SvgCanvas#cycleElement
* @param {boolean} next - true = next and false = previous element
* @fires module:svgcanvas.SvgCanvas#event:selected
* @returns {void}
*/
export const cycleElement = function (next) {
  const selectedElements = elementContext_.getSelectedElements();
  const currentGroup = elementContext_.getCurrentGroup();
  let num;
  const curElem = selectedElements[0];
  let elem = false;
  const allElems = getVisibleElements(currentGroup || elementContext_.getCanvas().getCurrentDrawing().getCurrentLayer());
  if (!allElems.length) { return; }
  if (isNullish(curElem)) {
    num = next ? allElems.length - 1 : 0;
    elem = allElems[num];
  } else {
    let i = allElems.length;
    while (i--) {
      if (allElems[i] === curElem) {
        num = next ? i - 1 : i + 1;
        if (num >= allElems.length) {
          num = 0;
        } else if (num < 0) {
          num = allElems.length - 1;
        }
        elem = allElems[num];
        break;
      }
    }
  }
  elementContext_.getCanvas().selectOnly([ elem ], true);
  elementContext_.call('selected', selectedElements);
};
