/**
 * Tools for selection.
 * @module selection
 * @license MIT
 * @copyright 2011 Jeff Schiller
 */

import {NS} from '../common/namespaces.js';
import {
  isNullish, getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible
} from '../common/utilities.js';
import {transformPoint, transformListToTransform, rectsIntersect} from '../common/math.js';
import jQueryPluginSVG from '../common/jQuery.attr.js';
import {
  getTransformList
} from '../common/svgtransformlist.js';
import * as hstry from './history.js';

const {BatchCommand} = hstry;
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
export const runExtensionsMethod = function (action, vars, returnArray, nameFilter) {
  let result = returnArray ? [] : false;
  $.each(selectionContext_.getExtensions(), function (name, ext) {
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
  });
  return result;
};

/**
* @typedef {PlainObject} module:svgcanvas.ExtensionMouseDownStatus
* @property {boolean} started Indicates that creating/editing has started
*/
/**
* @typedef {PlainObject} module:svgcanvas.ExtensionMouseUpStatus
* @property {boolean} keep Indicates if the current element should be kept
* @property {boolean} started Indicates if editing should still be considered as "started"
* @property {Element} element The element being affected
*/
/**
* @typedef {PlainObject} module:svgcanvas.ExtensionIDsUpdatedStatus
* @property {string[]} remove Contains string IDs (used by `ext-connector.js`)
*/

/**
* @interface module:svgcanvas.ExtensionInitResponse
* @property {module:SVGEditor.ContextTool[]|PlainObject<string, module:SVGEditor.ContextTool>} [context_tools]
* @property {module:SVGEditor.Button[]|PlainObject<Integer, module:SVGEditor.Button>} [buttons]
* @property {string} [svgicons] The location of a local SVG or SVGz file
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#mouseDown
* @param {module:svgcanvas.SvgCanvas#event:ext_mouseDown} arg
* @returns {void|module:svgcanvas.ExtensionMouseDownStatus}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#mouseMove
* @param {module:svgcanvas.SvgCanvas#event:ext_mouseMove} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#mouseUp
* @param {module:svgcanvas.SvgCanvas#event:ext_mouseUp} arg
* @returns {module:svgcanvas.ExtensionMouseUpStatus}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#zoomChanged
* @param {module:svgcanvas.SvgCanvas#event:ext_zoomChanged} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#IDsUpdated
* @param {module:svgcanvas.SvgCanvas#event:ext_IDsUpdated} arg
* @returns {module:svgcanvas.ExtensionIDsUpdatedStatus}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#canvasUpdated
* @param {module:svgcanvas.SvgCanvas#event:ext_canvasUpdated} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#toolButtonStateUpdate
* @param {module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#selectedChanged
* @param {module:svgcanvas.SvgCanvas#event:ext_selectedChanged} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#elementTransition
* @param {module:svgcanvas.SvgCanvas#event:ext_elementTransition} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#elementChanged
* @param {module:svgcanvas.SvgCanvas#event:ext_elementChanged} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#langReady
* @param {module:svgcanvas.SvgCanvas#event:ext_langReady} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#langChanged
* @param {module:svgcanvas.SvgCanvas#event:ext_langChanged} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#addLangData
* @param {module:svgcanvas.SvgCanvas#event:ext_addLangData} arg
* @returns {Promise<module:locale.ExtensionLocaleData>} Resolves to {@link module:locale.ExtensionLocaleData}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#onNewDocument
* @param {module:svgcanvas.SvgCanvas#event:ext_onNewDocument} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#workareaResized
* @param {module:svgcanvas.SvgCanvas#event:ext_workareaResized} arg
* @returns {void}
*/
/**
* @function module:svgcanvas.ExtensionInitResponse#callback
* @this module:SVGEditor
* @param {module:svgcanvas.SvgCanvas#event:ext_callback} arg
* @returns {void}
*/

/**
* @callback module:svgcanvas.ExtensionInitCallback
* @this module:SVGEditor
* @param {module:svgcanvas.ExtensionArgumentObject} arg
* @returns {Promise<module:svgcanvas.ExtensionInitResponse|void>} Resolves to [ExtensionInitResponse]{@link module:svgcanvas.ExtensionInitResponse} or `undefined`
*/
/**
* @typedef {PlainObject} module:svgcanvas.ExtensionInitArgs
* @property {external:jQuery} $
* @property {module:SVGEditor~ImportLocale} importLocale
*/
/**
* Add an extension to the editor.
* @function module:svgcanvas.SvgCanvas#addExtension
* @param {string} name - String with the ID of the extension. Used internally; no need for i18n.
* @param {module:svgcanvas.ExtensionInitCallback} [extInitFunc] - Function supplied by the extension with its data
* @param {module:svgcanvas.ExtensionInitArgs} initArgs
* @fires module:svgcanvas.SvgCanvas#event:extension_added
* @throws {TypeError|Error} `TypeError` if `extInitFunc` is not a function, `Error`
*   if extension of supplied name already exists
* @returns {Promise<void>} Resolves to `undefined`
*/
export const addExtension = async function (name, extInitFunc, {$: jq, importLocale}) {
  if (typeof extInitFunc !== 'function') {
    throw new TypeError('Function argument expected for `svgcanvas.addExtension`');
  }
  if (name in selectionContext_.getExtensions()) {
    throw new Error('Cannot add extension "' + name + '", an extension by that name already exists.');
  }
  // Provide private vars/funcs here. Is there a better way to do this?
  /**
* @typedef {module:svgcanvas.PrivateMethods} module:svgcanvas.ExtensionArgumentObject
* @property {SVGSVGElement} svgroot See {@link module:svgcanvas~svgroot}
* @property {SVGSVGElement} svgcontent See {@link module:svgcanvas~svgcontent}
* @property {!(string|Integer)} nonce See {@link module:draw.Drawing#getNonce}
* @property {module:select.SelectorManager} selectorManager
* @property {module:SVGEditor~ImportLocale} importLocale
*/
  /**
* @type {module:svgcanvas.ExtensionArgumentObject}
* @see {@link module:svgcanvas.PrivateMethods} source for the other methods/properties
*/
  const svgroot = selectionContext_.getSVGRoot();
  const svgcontent = selectionContext_.getSVGContent();
  const selectorManage = selectionContext_.getCanvas().selectorManager;
  const argObj = $.extend(selectionContext_.getCanvas().getPrivateMethods(), {
    $: jq,
    importLocale,
    svgroot,
    svgcontent,
    nonce: selectionContext_.getCanvas().getCurrentDrawing().getNonce(),
    selectorManage
  });
  const extObj = await extInitFunc(argObj);
  if (extObj) {
    extObj.name = name;
  }
  selectionContext_.setExtensions[name] = extObj;
  return selectionContext_.getCanvas().call('extension_added', extObj);
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
    parent = $(selectionContext_.getSVGContent()).children(); // Prevent layers from being included
  }
  const contentElems = [];
  $(parent).children().each(function (i, elem) {
    if (elem.getBBox) {
      contentElems.push({elem, bbox: getStrokedBBoxDefaultVisible([elem])});
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

  const parent = selectionContext_.getCurrentGroup() || selectionContext_.getCanvas().getCurrentDrawing().getCurrentLayer();

  let rubberBBox;
  if (!rect) {
    rubberBBox = selectionContext_.getRubberBox().getBBox();
    const bb = selectionContext_.getSVGContent().createSVGRect();

    ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'].forEach((o) => {
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
  if (!selectionContext_.isIE()) {
    if (typeof selectionContext_.getSVGRoot().getIntersectionList === 'function') {
      // Offset the bbox of the rubber box by the offset of the svgcontent element.
      rubberBBox.x += Number.parseInt(selectionContext_.getSVGContent().getAttribute('x'));
      rubberBBox.y += Number.parseInt(selectionContext_.getSVGContent().getAttribute('y'));

      resultList = selectionContext_.getSVGRoot().getIntersectionList(rubberBBox, parent);
    }
  }

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
  const g = document.createElementNS(NS.SVG, 'g');
  elem.replaceWith(g);
  $(g).append(elem).data('gsvg', elem)[0].id = selectionContext_.getCanvas().getNextId();
};

/**
* Runs the SVG Document through the sanitizer and then updates its paths.
* @function module:svgcanvas.SvgCanvas#prepareSvg
* @param {XMLDocument} newDoc - The SVG DOM document
* @returns {void}
*/
export const prepareSvg = function (newDoc) {
  selectionContext_.getCanvas().sanitizeSvg(newDoc.documentElement);

  // convert paths into absolute commands
  const paths = [...newDoc.getElementsByTagNameNS(NS.SVG, 'path')];
  paths.forEach((path) => {
    path.setAttribute('d', selectionContext_.getCanvas().pathActions.convertPath(path));
    selectionContext_.getCanvas().pathActions.fixEnd(path);
  });
};
// `this.each` is deprecated, if any extension used this it can be recreated by doing this:
// * @example $(canvas.getRootElem()).children().each(...)
// * @function module:svgcanvas.SvgCanvas#each
// this.each = function (cb) {
//  $(svgroot).children().each(cb);
// };

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
  const selectedElements = selectionContext_.getSelectedElements();
  // ensure val is the proper type
  val = Number.parseFloat(val);
  const elem = selectedElements[0];
  const oldTransform = elem.getAttribute('transform');
  const bbox = utilsGetBBox(elem);
  const cx = bbox.x + bbox.width / 2, cy = bbox.y + bbox.height / 2;
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
    elem.setAttribute('transform', oldTransform);
    selectionContext_.getCanvas().changeSelectedAttribute('transform', newTransform, selectedElements);
    selectionContext_.getCanvas().call('changed', selectedElements);
  }
  // const pointGripContainer = getElem('pathpointgrip_container');
  // if (elem.nodeName === 'path' && pointGripContainer) {
  //   pathActions.setPointContainerTransform(elem.getAttribute('transform'));
  // }
  const selector = selectionContext_.getCanvas().selectorManager.requestSelector(selectedElements[0]);
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
  const selectedElements = selectionContext_.getSelectedElements();
  const text = (selectionContext_.getCurrentResizeMode() === 'none' ? 'position' : 'size');
  const batchCmd = new BatchCommand(text);

  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    // if (getRotationAngle(elem) && !hasMatrixTransform(getTransformList(elem))) { continue; }
    const cmd = selectionContext_.getCanvas().recalculateDimensions(elem);
    if (cmd) {
      batchCmd.addSubCommand(cmd);
    }
  }

  if (!batchCmd.isEmpty()) {
    selectionContext_.addCommandToHistory(batchCmd);
    selectionContext_.getCanvas().call('changed', selectedElements);
  }
};
