/**
 * Tools for selection.
 * @module selection
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import { NS } from '../common/namespaces.js';
import {
  isNullish, getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible
} from './utilities.js';
import { transformPoint, transformListToTransform, rectsIntersect } from './math.js';
import {
  getTransformList
} from './svgtransformlist.js';
import * as hstry from './history.js';
import { getClosest } from '../editor/components/jgraduate/Util.js';

const { BatchCommand } = hstry;
let selectionContext_ = null;
let svgCanvas = null;
let selectedElements;

/**
* @function module:selection.init
* @param {module:selection.selectionContext} selectionContext
* @returns {void}
*/
export const init = function (selectionContext) {
  selectionContext_ = selectionContext;
  svgCanvas = selectionContext_.getCanvas();
  selectedElements = selectionContext_.getSelectedElements;
};

/**
* Clears the selection. The 'selected' handler is then optionally called.
* This should really be an intersection applying to all types rather than a union.
* @name module:selection.SvgCanvas#clearSelection
* @type {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
* @fires module:selection.SvgCanvas#event:selected
*/
export const clearSelectionMethod = function (noCall) {
  selectedElements().forEach((elem) => {
    if (isNullish(elem)) {
      return;
    }
    svgCanvas.selectorManager.releaseSelector(elem);
  });
  svgCanvas.setEmptySelectedElements();

  if (!noCall) { svgCanvas.call('selected', selectedElements()); }
};

/**
* Adds a list of elements to the selection. The 'selected' handler is then called.
* @name module:selection.SvgCanvas#addToSelection
* @type {module:path.EditorContext#addToSelection}
* @fires module:selection.SvgCanvas#event:selected
*/
export const addToSelectionMethod = function (elemsToAdd, showGrips) {
  if (!elemsToAdd.length) { return; }
  // find the first null in our selectedElements array

  let j = 0;
  while (j < selectedElements().length) {
    if (isNullish(selectedElements()[j])) {
      break;
    }
    ++j;
  }

  // now add each element consecutively
  let i = elemsToAdd.length;
  while (i--) {
    let elem = elemsToAdd[i];
    if (!elem) { continue; }
    const bbox = utilsGetBBox(elem);
    if (!bbox) { continue; }

    if (elem.tagName === 'a' && elem.childNodes.length === 1) {
      // Make "a" element's child be the selected element
      elem = elem.firstChild;
    }

    // if it's not already there, add it
    if (!selectedElements().includes(elem)) {
      selectedElements()[j] = elem;

      // only the first selectedBBoxes element is ever used in the codebase these days
      // if (j === 0) selectedBBoxes[0] = utilsGetBBox(elem);
      j++;
      const sel = svgCanvas.selectorManager.requestSelector(elem, bbox);

      if (selectedElements().length > 1) {
        sel.showGrips(false);
      }
    }
  }
  if (!selectedElements().length) {
    return;
  }
  svgCanvas.call('selected', selectedElements());

  if (selectedElements().length === 1) {
    svgCanvas.selectorManager.requestSelector(selectedElements()[0]).showGrips(showGrips);
  }

  // make sure the elements are in the correct order
  // See: https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

  selectedElements().sort(function (a, b) {
    if (a && b && a.compareDocumentPosition) {
      return 3 - (b.compareDocumentPosition(a) & 6); // eslint-disable-line no-bitwise
    }
    if (isNullish(a)) {
      return 1;
    }
    return 0;
  });

  // Make sure first elements are not null
  while (isNullish(selectedElements())[0]) {
    selectedElements().shift(0);
  }
};
/**
* @name module:svgcanvas.SvgCanvas#getMouseTarget
* @type {module:path.EditorContext#getMouseTarget}
*/
export const getMouseTargetMethod = function (evt) {
  if (isNullish(evt)) {
    return null;
  }
  let mouseTarget = evt.target;

  // if it was a <use>, Opera and WebKit return the SVGElementInstance
  if (mouseTarget.correspondingUseElement) { mouseTarget = mouseTarget.correspondingUseElement; }

  // for foreign content, go up until we find the foreignObject
  // WebKit browsers set the mouse target to the svgcanvas div
  if ([ NS.MATH, NS.HTML ].includes(mouseTarget.namespaceURI) &&
    mouseTarget.id !== 'svgcanvas'
  ) {
    while (mouseTarget.nodeName !== 'foreignObject') {
      mouseTarget = mouseTarget.parentNode;
      if (!mouseTarget) { return selectionContext_.getSVGRoot(); }
    }
  }

  // Get the desired mouseTarget with jQuery selector-fu
  // If it's root-like, select the root
  const currentLayer = svgCanvas.getCurrentDrawing().getCurrentLayer();
  const svgRoot = selectionContext_.getSVGRoot();
  const container = selectionContext_.getDOMContainer();
  const content = selectionContext_.getSVGContent();
  if ([ svgRoot, container, content, currentLayer ].includes(mouseTarget)) {
    return selectionContext_.getSVGRoot();
  }

  // If it's a selection grip, return the grip parent
  if (getClosest(mouseTarget.parentNode, '#selectorParentGroup')) {
    // While we could instead have just returned mouseTarget,
    // this makes it easier to indentify as being a selector grip
    return svgCanvas.selectorManager.selectorParentGroup;
  }

  while (!mouseTarget.parentNode?.isSameNode(selectionContext_.getCurrentGroup() || currentLayer)) {
    mouseTarget = mouseTarget.parentNode;
  }

  return mouseTarget;
};
/**
* @typedef {module:svgcanvas.ExtensionMouseDownStatus|module:svgcanvas.ExtensionMouseUpStatus|module:svgcanvas.ExtensionIDsUpdatedStatus|module:locale.ExtensionLocaleData[]|void} module:svgcanvas.ExtensionStatus
* @tutorial ExtensionDocs
*/
/**
* @callback module:svgcanvas.ExtensionVarBuilder
* @param {string} name The name of the extension
* @returns {module:svgcanvas.SvgCanvas#event:ext_addLangData}
*/
/**
* @callback module:svgcanvas.ExtensionNameFilter
* @param {string} name
* @returns {boolean}
*/
/* eslint-disable max-len */
/**
* @todo Consider: Should this return an array by default, so extension results aren't overwritten?
* @todo Would be easier to document if passing in object with key of action and vars as value; could then define an interface which tied both together
* @function module:svgcanvas.SvgCanvas#runExtensions
* @param {"mouseDown"|"mouseMove"|"mouseUp"|"zoomChanged"|"IDsUpdated"|"canvasUpdated"|"toolButtonStateUpdate"|"selectedChanged"|"elementTransition"|"elementChanged"|"langReady"|"langChanged"|"addLangData"|"onNewDocument"|"workareaResized"} action
* @param {module:svgcanvas.SvgCanvas#event:ext_mouseDown|module:svgcanvas.SvgCanvas#event:ext_mouseMove|module:svgcanvas.SvgCanvas#event:ext_mouseUp|module:svgcanvas.SvgCanvas#event:ext_zoomChanged|module:svgcanvas.SvgCanvas#event:ext_IDsUpdated|module:svgcanvas.SvgCanvas#event:ext_canvasUpdated|module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate|module:svgcanvas.SvgCanvas#event:ext_selectedChanged|module:svgcanvas.SvgCanvas#event:ext_elementTransition|module:svgcanvas.SvgCanvas#event:ext_elementChanged|module:svgcanvas.SvgCanvas#event:ext_langReady|module:svgcanvas.SvgCanvas#event:ext_langChanged|module:svgcanvas.SvgCanvas#event:ext_addLangData|module:svgcanvas.SvgCanvas#event:ext_onNewDocument|module:svgcanvas.SvgCanvas#event:ext_workareaResized|module:svgcanvas.ExtensionVarBuilder} [vars]
* @param {boolean} [returnArray]
* @param {module:svgcanvas.ExtensionNameFilter} nameFilter
* @returns {GenericArray<module:svgcanvas.ExtensionStatus>|module:svgcanvas.ExtensionStatus|false} See {@tutorial ExtensionDocs} on the ExtensionStatus.
*/
/* eslint-enable max-len */
export const runExtensionsMethod = function (action, vars, returnArray, nameFilter) {
  let result = returnArray ? [] : false;
  for (const [ name, ext ] of Object.entries(selectionContext_.getExtensions())) {
    if (nameFilter && !nameFilter(name)) {
      return;
    }
    if (ext && action in ext) {
      if (typeof vars === 'function') {
        vars = vars(name); // ext, action
      }
      if (returnArray) {
        result.push(ext[action](vars));
      } else {
        result = ext[action](vars);
      }
    }
  }
  return result;
};

/**
* Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
* Note that 0-opacity, off-screen etc elements are still considered "visible"
* for this function.
* @function module:svgcanvas.SvgCanvas#getVisibleElementsAndBBoxes
* @param {Element} parent - The parent DOM element to search within
* @returns {ElementAndBBox[]} An array with objects that include:
*/
export const getVisibleElementsAndBBoxes = function (parent) {
  if (!parent) {
    const svgcontent = selectionContext_.getSVGContent();
    parent = svgcontent.children; // Prevent layers from being included
  }
  const contentElems = [];
  const elements = parent.children;
  Array.prototype.forEach.call(elements, function (elem) {
    if (elem.getBBox) {
      contentElems.push({ elem, bbox: getStrokedBBoxDefaultVisible([ elem ]) });
    }
  });
  return contentElems.reverse();
};

/**
* This method sends back an array or a NodeList full of elements that
* intersect the multi-select rubber-band-box on the currentLayer only.
*
* We brute-force `getIntersectionList` for browsers that do not support it (Firefox).
*
* Reference:
* Firefox does not implement `getIntersectionList()`, see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=501421}.
* @function module:svgcanvas.SvgCanvas#getIntersectionList
* @param {SVGRect} rect
* @returns {Element[]|NodeList} Bbox elements
*/
export const getIntersectionListMethod = function (rect) {
  const currentZoom = selectionContext_.getCurrentZoom();
  if (isNullish(selectionContext_.getRubberBox())) { return null; }

  const parent = selectionContext_.getCurrentGroup() || svgCanvas.getCurrentDrawing().getCurrentLayer();

  let rubberBBox;
  if (!rect) {
    rubberBBox = selectionContext_.getRubberBox().getBBox();
    const bb = selectionContext_.getSVGContent().createSVGRect();

    [ 'x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left' ].forEach((o) => {
      bb[o] = rubberBBox[o] / currentZoom;
    });
    rubberBBox = bb;
  } else {
    rubberBBox = selectionContext_.getSVGContent().createSVGRect();
    rubberBBox.x = rect.x;
    rubberBBox.y = rect.y;
    rubberBBox.width = rect.width;
    rubberBBox.height = rect.height;
  }

  let resultList = null;

  if (isNullish(resultList) || typeof resultList.item !== 'function') {
    resultList = [];

    if (!selectionContext_.getCurBBoxes().length) {
      // Cache all bboxes
      selectionContext_.setCurBBoxes(getVisibleElementsAndBBoxes(parent));
    }
    let i = selectionContext_.getCurBBoxes().length;
    while (i--) {
      const curBBoxes = selectionContext_.getCurBBoxes();
      if (!rubberBBox.width) { continue; }
      if (rectsIntersect(rubberBBox, curBBoxes[i].bbox)) {
        resultList.push(curBBoxes[i].elem);
      }
    }
  }

  // addToSelection expects an array, but it's ok to pass a NodeList
  // because using square-bracket notation is allowed:
  // https://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
  return resultList;
};

/**
* @typedef {PlainObject} ElementAndBBox
* @property {Element} elem - The element
* @property {module:utilities.BBoxObject} bbox - The element's BBox as retrieved from `getStrokedBBoxDefaultVisible`
*/

/**
* Wrap an SVG element into a group element, mark the group as 'gsvg'.
* @function module:svgcanvas.SvgCanvas#groupSvgElem
* @param {Element} elem - SVG element to wrap
* @returns {void}
*/
export const groupSvgElem = function (elem) {
  const dataStorage = selectionContext_.getDataStorage();
  const g = document.createElementNS(NS.SVG, 'g');
  elem.replaceWith(g);
  g.appendChild(elem);
  dataStorage.put(g, 'gsvg', elem);
  g.id = svgCanvas.getNextId();
};

/**
* Runs the SVG Document through the sanitizer and then updates its paths.
* @function module:svgcanvas.SvgCanvas#prepareSvg
* @param {XMLDocument} newDoc - The SVG DOM document
* @returns {void}
*/
export const prepareSvg = function (newDoc) {
  svgCanvas.sanitizeSvg(newDoc.documentElement);

  // convert paths into absolute commands
  const paths = [ ...newDoc.getElementsByTagNameNS(NS.SVG, 'path') ];
  paths.forEach((path) => {
    path.setAttribute('d', svgCanvas.pathActions.convertPath(path));
    svgCanvas.pathActions.fixEnd(path);
  });
};

/**
* Removes any old rotations if present, prepends a new rotation at the
* transformed center.
* @function module:svgcanvas.SvgCanvas#setRotationAngle
* @param {string|Float} val - The new rotation angle in degrees
* @param {boolean} preventUndo - Indicates whether the action should be undoable or not
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const setRotationAngle = function (val, preventUndo) {
  // ensure val is the proper type
  val = Number.parseFloat(val);
  const elem = selectedElements()[0];
  const oldTransform = elem.getAttribute('transform');
  const bbox = utilsGetBBox(elem);
  const cx = bbox.x + bbox.width / 2; const cy = bbox.y + bbox.height / 2;
  const tlist = getTransformList(elem);

  // only remove the real rotational transform if present (i.e. at index=0)
  if (tlist.numberOfItems > 0) {
    const xform = tlist.getItem(0);
    if (xform.type === 4) {
      tlist.removeItem(0);
    }
  }
  // find Rnc and insert it
  if (val !== 0) {
    const center = transformPoint(cx, cy, transformListToTransform(tlist).matrix);
    const Rnc = selectionContext_.getSVGRoot().createSVGTransform();
    Rnc.setRotate(val, center.x, center.y);
    if (tlist.numberOfItems) {
      tlist.insertItemBefore(Rnc, 0);
    } else {
      tlist.appendItem(Rnc);
    }
  } else if (tlist.numberOfItems === 0) {
    elem.removeAttribute('transform');
  }

  if (!preventUndo) {
    // we need to undo it, then redo it so it can be undo-able! :)
    // TODO: figure out how to make changes to transform list undo-able cross-browser?
    const newTransform = elem.getAttribute('transform');
    if (oldTransform) {
      elem.setAttribute('transform', oldTransform);
    } else {
      elem.removeAttribute('transform');
    }
    svgCanvas.changeSelectedAttribute('transform', newTransform, selectedElements());
    svgCanvas.call('changed', selectedElements());
  }
  // const pointGripContainer = getElem('pathpointgrip_container');
  // if (elem.nodeName === 'path' && pointGripContainer) {
  //   pathActions.setPointContainerTransform(elem.getAttribute('transform'));
  // }
  const selector = svgCanvas.selectorManager.requestSelector(selectedElements()[0]);
  selector.resize();
  selectionContext_.getSelector().updateGripCursors(val);
};

/**
* Runs `recalculateDimensions` on the selected elements,
* adding the changes to a single batch command.
* @function module:svgcanvas.SvgCanvas#recalculateAllSelectedDimensions
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
export const recalculateAllSelectedDimensions = function () {
  const text = (selectionContext_.getCurrentResizeMode() === 'none' ? 'position' : 'size');
  const batchCmd = new BatchCommand(text);

  let i = selectedElements().length;
  while (i--) {
    const elem = selectedElements()[i];
    // if (getRotationAngle(elem) && !hasMatrixTransform(getTransformList(elem))) { continue; }
    const cmd = svgCanvas.recalculateDimensions(elem);
    if (cmd) {
      batchCmd.addSubCommand(cmd);
    }
  }

  if (!batchCmd.isEmpty()) {
    selectionContext_.addCommandToHistory(batchCmd);
    svgCanvas.call('changed', selectedElements());
  }
};
