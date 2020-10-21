/**
 * Tools for selection.
 * @module selection
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import {NS} from '../common/namespaces.js';
import {isNullish, getBBox as utilsGetBBox} from '../common/utilities.js';
import jQueryPluginSVG from '../common/jQuery.attr.js';

const $ = jQueryPluginSVG(jQuery);
let selectionContext_ = null;

/**
* @function module:selection.init
* @param {module:selection.selectionContext} selectionContext
* @returns {void}
*/
export const init = function (selectionContext) {
  selectionContext_ = selectionContext;
};

/**
* Clears the selection. The 'selected' handler is then optionally called.
* This should really be an intersection applying to all types rather than a union.
* @name module:selection.SvgCanvas#clearSelection
* @type {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
* @fires module:selection.SvgCanvas#event:selected
*/
export const clearSelectionMethod = function (noCall) {
  const selectedElements = selectionContext_.getSelectedElements();
  selectedElements.forEach((elem) => {
    if (isNullish(elem)) {
      return;
    }
    selectionContext_.getCanvas().selectorManager.releaseSelector(elem);
  });
  selectionContext_.setSelectedElements([]);

  if (!noCall) { selectionContext_.getCanvas().call('selected', selectionContext_.getSelectedElements()); }
};

/**
* Adds a list of elements to the selection. The 'selected' handler is then called.
* @name module:selection.SvgCanvas#addToSelection
* @type {module:path.EditorContext#addToSelection}
* @fires module:selection.SvgCanvas#event:selected
*/
export const addToSelectionMethod = function (elemsToAdd, showGrips) {
  const selectedElements = selectionContext_.getSelectedElements();
  if (!elemsToAdd.length) { return; }
  // find the first null in our selectedElements array

  let j = 0;
  while (j < selectedElements.length) {
    if (isNullish(selectedElements[j])) {
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
    if (!selectedElements.includes(elem)) {
      selectedElements[j] = elem;

      // only the first selectedBBoxes element is ever used in the codebase these days
      // if (j === 0) selectedBBoxes[0] = utilsGetBBox(elem);
      j++;
      const sel = selectionContext_.getCanvas().selectorManager.requestSelector(elem, bbox);

      if (selectedElements.length > 1) {
        sel.showGrips(false);
      }
    }
  }
  if (!selectedElements.length) {
    return;
  }
  selectionContext_.getCanvas().call('selected', selectedElements);

  if (selectedElements.length === 1) {
    selectionContext_.getCanvas().selectorManager.requestSelector(selectedElements[0]).showGrips(showGrips);
  }

  // make sure the elements are in the correct order
  // See: https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

  selectedElements.sort(function (a, b) {
    if (a && b && a.compareDocumentPosition) {
      return 3 - (b.compareDocumentPosition(a) & 6); // eslint-disable-line no-bitwise
    }
    if (isNullish(a)) {
      return 1;
    }
    return 0;
  });

  // Make sure first elements are not null
  while (isNullish(selectedElements[0])) {
    selectedElements.shift(0);
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
  if ([NS.MATH, NS.HTML].includes(mouseTarget.namespaceURI) &&
mouseTarget.id !== 'svgcanvas'
  ) {
    while (mouseTarget.nodeName !== 'foreignObject') {
      mouseTarget = mouseTarget.parentNode;
      if (!mouseTarget) { return selectionContext_.getSVGRoot(); }
    }
  }

  // Get the desired mouseTarget with jQuery selector-fu
  // If it's root-like, select the root
  const currentLayer = selectionContext_.getCanvas().getCurrentDrawing().getCurrentLayer();
  const svgRoot = selectionContext_.getSVGRoot();
  const container = selectionContext_.getDOMContainer();
  const content = selectionContext_.getSVGContent();
  if ([svgRoot, container, content, currentLayer].includes(mouseTarget)) {
    return selectionContext_.getSVGRoot();
  }

  const $target = $(mouseTarget);

  // If it's a selection grip, return the grip parent
  if ($target.closest('#selectorParentGroup').length) {
    // While we could instead have just returned mouseTarget,
    // this makes it easier to indentify as being a selector grip
    return selectionContext_.getCanvas().selectorManager.selectorParentGroup;
  }

  while (mouseTarget.parentNode !== (selectionContext_.getCurrentGroup() || currentLayer)) {
    mouseTarget = mouseTarget.parentNode;
  }

  //
  // // go up until we hit a child of a layer
  // while (mouseTarget.parentNode.parentNode.tagName == 'g') {
  //   mouseTarget = mouseTarget.parentNode;
  // }
  // Webkit bubbles the mouse event all the way up to the div, so we
  // set the mouseTarget to the svgroot like the other browsers
  // if (mouseTarget.nodeName.toLowerCase() == 'div') {
  //   mouseTarget = svgroot;
  // }

  return mouseTarget;
};
