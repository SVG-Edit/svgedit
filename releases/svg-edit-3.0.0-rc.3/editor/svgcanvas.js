/* eslint-disable indent */
/* globals jQuery, jsPDF */
/**
 * Numerous tools for working with the editor's "canvas"
 * @module svgcanvas
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Pavol Rusnak, 2010 Jeff Schiller
 *
 */

/* Dependencies:
1. Also expects jQuery UI for `svgCanvasToString` and
`convertToGroup` use of `:data()` selector
*/

// Todo: Obtain/adapt latest jsPDF to utilize ES Module for `jsPDF`/avoid global

import './svgpathseg.js';
import jqPluginSVG from './jQuery.attr.js'; // Needed for SVG attribute setting and array form with `attr`

import * as draw from './draw.js';
import * as pathModule from './path.js';
import {sanitizeSvg} from './sanitize.js';
import {getReverseNS, NS} from './namespaces.js';
import {importSetGlobal, importScript} from './external/dynamic-import-polyfill/importModule.js';
import {
  text2xml, assignAttributes, cleanupElement, getElem, getUrlFromAttr,
  findDefs, getHref, setHref, getRefElem, getRotationAngle, getPathBBox,
  preventClickDefault, snapToGrid, walkTree, walkTreePost,
  getBBoxOfElementAsPath, convertToPath, toXml, encode64, decode64,
  dataURLToObjectURL, createObjectURL,
  getVisibleElements, dropXMLInteralSubset,
  init as utilsInit, getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible
} from './utilities.js';
import * as history from './history.js';
import {
  transformPoint, matrixMultiply, hasMatrixTransform, transformListToTransform,
  getMatrix, snapToAngle, isIdentity, rectsIntersect, transformBox
} from './math.js';
import {
  convertToNum, convertAttrs, convertUnit, shortFloat, getTypeMap,
  init as unitsInit
} from './units.js';
import {
  isGecko, isChrome, isIE, isWebkit, supportsNonScalingStroke, supportsGoodTextCharPos
} from './browser.js'; // , supportsEditableText
import {
  getTransformList, resetListMap,
  SVGTransformList as SVGEditTransformList
} from './svgtransformlist.js';
import {
  remapElement,
  init as coordsInit
} from './coords.js';
import {
  recalculateDimensions,
  init as recalculateInit
} from './recalculate.js';
import {
  getSelectorManager,
  init as selectInit
} from './select.js';

const $ = jqPluginSVG(jQuery);
const {
  MoveElementCommand, InsertElementCommand, RemoveElementCommand,
  ChangeElementCommand, BatchCommand, UndoManager, HistoryEventTypes
} = history;

if (!window.console) {
  window.console = {};
  window.console.log = function (str) {};
  window.console.dir = function (str) {};
}

if (window.opera) {
  window.console.log = function (str) { window.opera.postError(str); };
  window.console.dir = function (str) {};
}

/**
* The main SvgCanvas class that manages all SVG-related functions
* @memberof module:svgcanvas
*
* @borrows module:coords.remapElement as #remapElement
* @borrows module:recalculate.recalculateDimensions as #recalculateDimensions
*
* @borrows module:utilities.cleanupElement as #cleanupElement
* @borrows module:utilities.getStrokedBBoxDefaultVisible as #getStrokedBBox
* @borrows module:utilities.getVisibleElements as #getVisibleElements
* @borrows module:utilities.findDefs as #findDefs
* @borrows module:utilities.getUrlFromAttr as #getUrlFromAttr
* @borrows module:utilities.getHref as #getHref
* @borrows module:utilities.setHref as #setHref
* @borrows module:utilities.getRotationAngle as #getRotationAngle
* @borrows module:utilities.getBBox as #getBBox
* @borrows module:utilities.getElem as #getElem
* @borrows module:utilities.getRefElem as #getRefElem
* @borrows module:utilities.assignAttributes as #assignAttributes
*
* @borrows module:SVGTransformList.getTransformList as #getTransformList
* @borrows module:math.matrixMultiply as #matrixMultiply
* @borrows module:math.hasMatrixTransform as #hasMatrixTransform
* @borrows module:math.transformListToTransform as #transformListToTransform
* @borrows module:units.convertToNum as #convertToNum
* @borrows module:sanitize.sanitizeSvg as #sanitizeSvg
* @borrows module:path.pathActions.linkControlPoints as #linkControlPoints
*/
class SvgCanvas {
  /**
  * @param {HTMLElement} container - The container HTML element that should hold the SVG root element
  * @param {module:SVGEditor.curConfig} config - An object that contains configuration data
  */
  constructor (container, config) {
// Alias Namespace constants

// Default configuration options
const curConfig = {
  show_outside_canvas: true,
  selectNew: true,
  dimensions: [640, 480]
};

// Update config with new one if given
if (config) {
  $.extend(curConfig, config);
}

// Array with width/height of canvas
const {dimensions} = curConfig;

const canvas = this;

// "document" element associated with the container (same as window.document using default svg-editor.js)
// NOTE: This is not actually a SVG document, but an HTML document.
const svgdoc = container.ownerDocument;

// This is a container for the document being edited, not the document itself.
/**
 * @name module:svgcanvas~svgroot
 * @type {SVGSVGElement}
 */
const svgroot = svgdoc.importNode(
  text2xml(
    '<svg id="svgroot" xmlns="' + NS.SVG + '" xlinkns="' + NS.XLINK + '" ' +
      'width="' + dimensions[0] + '" height="' + dimensions[1] + '" x="' + dimensions[0] + '" y="' + dimensions[1] + '" overflow="visible">' +
      '<defs>' +
        '<filter id="canvashadow" filterUnits="objectBoundingBox">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>' +
          '<feOffset in="blur" dx="5" dy="5" result="offsetBlur"/>' +
          '<feMerge>' +
            '<feMergeNode in="offsetBlur"/>' +
            '<feMergeNode in="SourceGraphic"/>' +
          '</feMerge>' +
        '</filter>' +
      '</defs>' +
    '</svg>'
  ).documentElement,
  true
);
container.append(svgroot);

/**
 * The actual element that represents the final output SVG element
 * @name module:svgcanvas~svgcontent
 * @type {SVGSVGElement}
 */
let svgcontent = svgdoc.createElementNS(NS.SVG, 'svg');

/**
* This function resets the svgcontent element while keeping it in the DOM.
* @function module:svgcanvas.SvgCanvas#clearSvgContentElement
* @returns {undefined}
*/
const clearSvgContentElement = canvas.clearSvgContentElement = function () {
  $(svgcontent).empty();

  // TODO: Clear out all other attributes first?
  $(svgcontent).attr({
    id: 'svgcontent',
    width: dimensions[0],
    height: dimensions[1],
    x: dimensions[0],
    y: dimensions[1],
    overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden',
    xmlns: NS.SVG,
    'xmlns:se': NS.SE,
    'xmlns:xlink': NS.XLINK
  }).appendTo(svgroot);

  // TODO: make this string optional and set by the client
  const comment = svgdoc.createComment(' Created with SVG-edit - https://github.com/SVG-Edit/svgedit');
  svgcontent.append(comment);
};
clearSvgContentElement();

// Prefix string for element IDs
let idprefix = 'svg_';

/**
* Changes the ID prefix to the given value
* @function module:svgcanvas.SvgCanvas#setIdPrefix
* @param {string} p - String with the new prefix
* @returns {undefined}
*/
canvas.setIdPrefix = function (p) {
  idprefix = p;
};

/**
* Current draw.Drawing object
* @type {module:draw.Drawing}
* @name module:svgcanvas.SvgCanvas#current_drawing_
*/
canvas.current_drawing_ = new draw.Drawing(svgcontent, idprefix);

/**
* Returns the current Drawing.
* @function module:svgcanvas.SvgCanvas#getCurrentDrawing
* @implements {module:draw.DrawCanvasInit#getCurrentDrawing}
*/
const getCurrentDrawing = canvas.getCurrentDrawing = function () {
  return canvas.current_drawing_;
};

/**
* Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
* @type {Float}
*/
let currentZoom = 1;

// pointer to current group (for in-group editing)
let currentGroup = null;

// Object containing data for the currently selected styles
const allProperties = {
  shape: {
    fill: (curConfig.initFill.color === 'none' ? '' : '#') + curConfig.initFill.color,
    fill_paint: null,
    fill_opacity: curConfig.initFill.opacity,
    stroke: '#' + curConfig.initStroke.color,
    stroke_paint: null,
    stroke_opacity: curConfig.initStroke.opacity,
    stroke_width: curConfig.initStroke.width,
    stroke_dasharray: 'none',
    stroke_linejoin: 'miter',
    stroke_linecap: 'butt',
    opacity: curConfig.initOpacity
  }
};

allProperties.text = $.extend(true, {}, allProperties.shape);
$.extend(allProperties.text, {
  fill: '#000000',
  stroke_width: curConfig.text && curConfig.text.stroke_width,
  font_size: curConfig.text && curConfig.text.font_size,
  font_family: curConfig.text && curConfig.text.font_family
});

// Current shape style properties
const curShape = allProperties.shape;

// Array with all the currently selected elements
// default size of 1 until it needs to grow bigger
let selectedElements = [];

/**
* @typedef {PlainObject} module:svgcanvas.SVGAsJSON
* @property {string} element
* @property {PlainObject.<string, string>} attr
* @property {module:svgcanvas.SVGAsJSON[]} children
*/

/**
* @function module:svgcanvas.SvgCanvas#getContentElem
* @param {Text|Element} data
* @returns {module:svgcanvas.SVGAsJSON}
*/
const getJsonFromSvgElement = this.getJsonFromSvgElement = function (data) {
  // Text node
  if (data.nodeType === 3) return data.nodeValue;

  const retval = {
    element: data.tagName,
    // namespace: nsMap[data.namespaceURI],
    attr: {},
    children: []
  };

  // Iterate attributes
  for (let i = 0, attr; (attr = data.attributes[i]); i++) {
    retval.attr[attr.name] = attr.value;
  }

  // Iterate children
  for (let i = 0, node; (node = data.childNodes[i]); i++) {
    retval.children[i] = getJsonFromSvgElement(node);
  }

  return retval;
};

/**
* This should really be an intersection implementing all rather than a union
* @function module:svgcanvas.SvgCanvas#addSVGElementFromJson
* @implements {module:utilities.EditorContext#addSVGElementFromJson|module:path.EditorContext#addSVGElementFromJson}
*/
const addSVGElementFromJson = this.addSVGElementFromJson = function (data) {
  if (typeof data === 'string') return svgdoc.createTextNode(data);

  let shape = getElem(data.attr.id);
  // if shape is a path but we need to create a rect/ellipse, then remove the path
  const currentLayer = getCurrentDrawing().getCurrentLayer();
  if (shape && data.element !== shape.tagName) {
    shape.remove();
    shape = null;
  }
  if (!shape) {
    const ns = data.namespace || NS.SVG;
    shape = svgdoc.createElementNS(ns, data.element);
    if (currentLayer) {
      (currentGroup || currentLayer).append(shape);
    }
  }
  if (data.curStyles) {
    assignAttributes(shape, {
      fill: curShape.fill,
      stroke: curShape.stroke,
      'stroke-width': curShape.stroke_width,
      'stroke-dasharray': curShape.stroke_dasharray,
      'stroke-linejoin': curShape.stroke_linejoin,
      'stroke-linecap': curShape.stroke_linecap,
      'stroke-opacity': curShape.stroke_opacity,
      'fill-opacity': curShape.fill_opacity,
      opacity: curShape.opacity / 2,
      style: 'pointer-events:inherit'
    }, 100);
  }
  assignAttributes(shape, data.attr, 100);
  cleanupElement(shape);

  // Children
  if (data.children) {
    data.children.forEach((child) => {
      shape.append(addSVGElementFromJson(child));
    });
  }

  return shape;
};

canvas.getTransformList = getTransformList;

canvas.matrixMultiply = matrixMultiply;
canvas.hasMatrixTransform = hasMatrixTransform;
canvas.transformListToTransform = transformListToTransform;

/**
* @implements {module:utilities.EditorContext#getBaseUnit}
*/
const getBaseUnit = () => { return curConfig.baseUnit; };

/**
* initialize from units.js.
* Send in an object implementing the ElementContainer interface (see units.js)
*/
unitsInit(
  /**
  * @implements {module:units.ElementContainer}
  */
  {
    getBaseUnit,
    getElement: getElem,
    getHeight () { return svgcontent.getAttribute('height') / currentZoom; },
    getWidth () { return svgcontent.getAttribute('width') / currentZoom; },
    getRoundDigits () { return saveOptions.round_digits; }
  }
);

canvas.convertToNum = convertToNum;

/**
* This should really be an intersection implementing all rather than a union
* @implements {module:draw.DrawCanvasInit#getSVGContent|module:utilities.EditorContext#getSVGContent}
*/
const getSVGContent = () => { return svgcontent; };

/**
* Should really be an intersection with all needing to apply rather than a union
* @function module:svgcanvas.SvgCanvas#getSelectedElements
* @implements {module:utilities.EditorContext#getSelectedElements|module:draw.DrawCanvasInit#getSelectedElements|module:path.EditorContext#getSelectedElements}
*/
const getSelectedElements = this.getSelectedElems = function () {
  return selectedElements;
};

const pathActions = pathModule.pathActions;

/**
* This should actually be an intersection as all interfaces should be met
* @implements {module:utilities.EditorContext#getSVGRoot|module:recalculate.EditorContext#getSVGRoot|module:coords.EditorContext#getSVGRoot|module:path.EditorContext#getSVGRoot}
*/
const getSVGRoot = () => svgroot;

utilsInit(
  /**
  * @implements {module:utilities.EditorContext}
  */
  {
    pathActions, // Ok since not modifying
    getSVGContent,
    addSVGElementFromJson,
    getSelectedElements,
    getDOMDocument () { return svgdoc; },
    getDOMContainer () { return container; },
    getSVGRoot,
    // TODO: replace this mostly with a way to get the current drawing.
    getBaseUnit,
    getSnappingStep () { return curConfig.snappingStep; }
  }
);

canvas.findDefs = findDefs;
canvas.getUrlFromAttr = getUrlFromAttr;
canvas.getHref = getHref;
canvas.setHref = setHref;
/* const getBBox = */ canvas.getBBox = utilsGetBBox;
canvas.getRotationAngle = getRotationAngle;
canvas.getElem = getElem;
canvas.getRefElem = getRefElem;
canvas.assignAttributes = assignAttributes;

this.cleanupElement = cleanupElement;

/**
* This should actually be an intersection not a union as all should apply
* @implements {module:coords.EditorContext|module:path.EditorContext}
*/
const getGridSnapping = () => { return curConfig.gridSnapping; };

coordsInit(
  /**
  * @implements {module:coords.EditorContext}
  */
  {
    getDrawing () { return getCurrentDrawing(); },
    getSVGRoot,
    getGridSnapping
  }
);
this.remapElement = remapElement;

recalculateInit(
  /**
  * @implements {module:recalculate.EditorContext}
  */
  {
    getSVGRoot,
    getStartTransform () { return startTransform; },
    setStartTransform (transform) { startTransform = transform; }
  }
);
this.recalculateDimensions = recalculateDimensions;

// import from sanitize.js
const nsMap = getReverseNS();
canvas.sanitizeSvg = sanitizeSvg;

/**
* @name undoMgr
* @memberof module:svgcanvas.SvgCanvas#
* @type {module:history.HistoryEventHandler}
*/
const undoMgr = canvas.undoMgr = new UndoManager({
  /**
   * @param {string} eventType One of the HistoryEvent types
   * @param {module:history.HistoryCommand} cmd Fulfills the HistoryCommand interface
   * @fires module:svgcanvas.SvgCanvas#event:changed
   * @returns {undefined}
   */
  handleHistoryEvent (eventType, cmd) {
    const EventTypes = HistoryEventTypes;
    // TODO: handle setBlurOffsets.
    if (eventType === EventTypes.BEFORE_UNAPPLY || eventType === EventTypes.BEFORE_APPLY) {
      canvas.clearSelection();
    } else if (eventType === EventTypes.AFTER_APPLY || eventType === EventTypes.AFTER_UNAPPLY) {
      const elems = cmd.elements();
      canvas.pathActions.clear();
      call('changed', elems);
      const cmdType = cmd.type();
      const isApply = (eventType === EventTypes.AFTER_APPLY);
      if (cmdType === MoveElementCommand.type()) {
        const parent = isApply ? cmd.newParent : cmd.oldParent;
        if (parent === svgcontent) {
          draw.identifyLayers();
        }
      } else if (cmdType === InsertElementCommand.type() ||
          cmdType === RemoveElementCommand.type()) {
        if (cmd.parent === svgcontent) {
          draw.identifyLayers();
        }
        if (cmdType === InsertElementCommand.type()) {
          if (isApply) { restoreRefElems(cmd.elem); }
        } else {
          if (!isApply) { restoreRefElems(cmd.elem); }
        }
        if (cmd.elem.tagName === 'use') {
          setUseData(cmd.elem);
        }
      } else if (cmdType === ChangeElementCommand.type()) {
        // if we are changing layer names, re-identify all layers
        if (cmd.elem.tagName === 'title' &&
          cmd.elem.parentNode.parentNode === svgcontent
        ) {
          draw.identifyLayers();
        }
        const values = isApply ? cmd.newValues : cmd.oldValues;
        // If stdDeviation was changed, update the blur.
        if (values.stdDeviation) {
          canvas.setBlurOffsets(cmd.elem.parentNode, values.stdDeviation);
        }
        // This is resolved in later versions of webkit, perhaps we should
        // have a featured detection for correct 'use' behavior?
        // ——————————
        // Remove & Re-add hack for Webkit (issue 775)
        // if (cmd.elem.tagName === 'use' && isWebkit()) {
        //  const {elem} = cmd;
        //  if (!elem.getAttribute('x') && !elem.getAttribute('y')) {
        //    const parent = elem.parentNode;
        //    const sib = elem.nextSibling;
        //    elem.remove();
        //    parent.insertBefore(elem, sib);
        //    // Ok to replace above with this? `sib.before(elem);`
        //  }
        // }
      }
    }
  }
});

/**
* This should really be an intersection applying to all types rather than a union
* @function module:svgcanvas~addCommandToHistory
* @implements {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory}
*/
const addCommandToHistory = function (cmd) {
  canvas.undoMgr.addCommandToHistory(cmd);
};

/**
* This should really be an intersection applying to all types rather than a union
* @function module:svgcanvas.SvgCanvas#getZoom
* @implements {module:path.EditorContext#getCurrentZoom|module:select.SVGFactory#getCurrentZoom}
*/
const getCurrentZoom = this.getZoom = function () { return currentZoom; };

/**
* This method rounds the incoming value to the nearest value based on the `currentZoom`
* @function module:svgcanvas.SvgCanvas#round
* @implements {module:path.EditorContext#round}
*/
const round = this.round = function (val) {
  return parseInt(val * currentZoom, 10) / currentZoom;
};

selectInit(
  curConfig,
  /**
  * Export to select.js
  * @implements {module:select.SVGFactory}
  */
  {
    createSVGElement (jsonMap) { return canvas.addSVGElementFromJson(jsonMap); },
    svgRoot () { return svgroot; },
    svgContent () { return svgcontent; },
    getCurrentZoom
  }
);
/**
* This object manages selectors for us
* @name module:svgcanvas.SvgCanvas#selectorManager
* @type {module:select.SelectorManager}
*/
const selectorManager = this.selectorManager = getSelectorManager();

/**
* @function module:svgcanvas.SvgCanvas#getNextId
* @implements {module:path.EditorContext#getNextId}
*/
const getNextId = canvas.getNextId = function () {
  return getCurrentDrawing().getNextId();
};

/**
* @function module:svgcanvas.SvgCanvas#getId
* @implements {module:path.EditorContext#getId}
*/
const getId = canvas.getId = function () {
  return getCurrentDrawing().getId();
};

/**
* The "implements" should really be an intersection applying to all types rather than a union
* @function module:svgcanvas.SvgCanvas#call
* @implements {module:draw.DrawCanvasInit#call|module:path.EditorContext#call}
* @param {"selected"|"changed"|"contextset"|"pointsAdded"|"extension_added"|"extensions_added"|"message"|"transition"|"zoomed"|"updateCanvas"|"zoomDone"|"saved"|"exported"|"exportedPDF"|"setnonce"|"unsetnonce"|"cleared"} ev - String with the event name
* @param {module:svgcanvas.SvgCanvas#event:GenericCanvasEvent} arg - Argument to pass through to the callback function.
* @returns {undefined}
*/
const call = function (ev, arg) {
  if (events[ev]) {
    return events[ev](window, arg);
  }
};

/**
* Clears the selection. The 'selected' handler is then optionally called.
* This should really be an intersection applying to all types rather than a union
* @function module:svgcanvas.SvgCanvas#clearSelection
* @implements {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
* @fires module:svgcanvas.SvgCanvas#event:selected
*/
const clearSelection = this.clearSelection = function (noCall) {
  selectedElements.forEach((elem) => {
    if (elem == null) {
      return;
    }
    selectorManager.releaseSelector(elem);
  });
  selectedElements = [];

  if (!noCall) { call('selected', selectedElements); }
};

/**
* Adds a list of elements to the selection. The 'selected' handler is then called.
* @function module:svgcanvas.SvgCanvas#addToSelection
* @implements {module:path.EditorContext#addToSelection}
* @fires module:svgcanvas.SvgCanvas#event:selected
*/
const addToSelection = this.addToSelection = function (elemsToAdd, showGrips) {
  if (!elemsToAdd.length) { return; }
  // find the first null in our selectedElements array

  let j = 0;
  while (j < selectedElements.length) {
    if (selectedElements[j] == null) {
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
      const sel = selectorManager.requestSelector(elem, bbox);

      if (selectedElements.length > 1) {
        sel.showGrips(false);
      }
    }
  }
  call('selected', selectedElements);

  if (showGrips || selectedElements.length === 1) {
    selectorManager.requestSelector(selectedElements[0]).showGrips(true);
  } else {
    selectorManager.requestSelector(selectedElements[0]).showGrips(false);
  }

  // make sure the elements are in the correct order
  // See: https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition

  selectedElements.sort(function (a, b) {
    if (a && b && a.compareDocumentPosition) {
      return 3 - (b.compareDocumentPosition(a) & 6);
    }
    if (a == null) {
      return 1;
    }
  });

  // Make sure first elements are not null
  while (selectedElements[0] == null) {
    selectedElements.shift(0);
  }
};

/**
* @implements {module:path.EditorContext#getOpacity}
*/
const getOpacity = function () {
  return curShape.opacity;
};

/**
* @function module:svgcanvas.SvgCanvas#getMouseTarget
* @implements {module:path.EditorContext#getMouseTarget}
*/
const getMouseTarget = this.getMouseTarget = function (evt) {
  if (evt == null) {
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
      if (!mouseTarget) { return svgroot; }
    }
  }

  // Get the desired mouseTarget with jQuery selector-fu
  // If it's root-like, select the root
  const currentLayer = getCurrentDrawing().getCurrentLayer();
  if ([svgroot, container, svgcontent, currentLayer].includes(mouseTarget)) {
    return svgroot;
  }

  const $target = $(mouseTarget);

  // If it's a selection grip, return the grip parent
  if ($target.closest('#selectorParentGroup').length) {
    // While we could instead have just returned mouseTarget,
    // this makes it easier to indentify as being a selector grip
    return selectorManager.selectorParentGroup;
  }

  while (mouseTarget.parentNode !== (currentGroup || currentLayer)) {
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
* @namespace {module:path.pathActions} pathActions
* @memberof module:svgcanvas.SvgCanvas#
* @see module:path.pathActions
*/
canvas.pathActions = pathActions;
/**
* @implements {module:path.EditorContext#resetD}
*/
function resetD (p) {
  p.setAttribute('d', pathActions.convertPath(p));
}
pathModule.init(
  /**
  * @implements {module:path.EditorContext}
  */
  {
    selectorManager, // Ok since not changing
    canvas, // Ok since not changing
    call,
    resetD,
    round,
    clearSelection,
    addToSelection,
    addCommandToHistory,
    remapElement,
    addSVGElementFromJson,
    getGridSnapping,
    getOpacity,
    getSelectedElements,
    getContainer () {
      return container;
    },
    setStarted (s) {
      started = s;
    },
    getRubberBox () {
      return rubberBox;
    },
    setRubberBox (rb) {
      rubberBox = rb;
      return rubberBox;
    },
    /**
     * @param {boolean} closedSubpath
     * @param {SVGCircleElement[]} grips
     * @fires module:svgcanvas.SvgCanvas#event:pointsAdded
     * @fires module:svgcanvas.SvgCanvas#event:selected
     */
    addPtsToSelection ({closedSubpath, grips}) {
      // TODO: Correct this:
      pathActions.canDeleteNodes = true;
      pathActions.closed_subpath = closedSubpath;
      call('pointsAdded', {closedSubpath, grips});
      call('selected', grips);
    },
    /**
     * @param {ChangeElementCommand} cmd
     * @param {SVGPathElement} elem
     * @fires module:svgcanvas.SvgCanvas#event:changed
     * @returns {undefined}
     */
    endChanges ({cmd, elem}) {
      addCommandToHistory(cmd);
      call('changed', [elem]);
    },
    getCurrentZoom,
    getId,
    getNextId,
    getMouseTarget,
    getCurrentMode () {
      return currentMode;
    },
    setCurrentMode (cm) {
      currentMode = cm;
      return currentMode;
    },
    getDrawnPath () {
      return drawnPath;
    },
    setDrawnPath (dp) {
      drawnPath = dp;
      return drawnPath;
    },
    getSVGRoot
  }
);

// Interface strings, usually for title elements
const uiStrings = {};

const visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
const refAttrs = ['clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke'];

const elData = $.data;

// Animation element to change the opacity of any newly created element
const opacAni = document.createElementNS(NS.SVG, 'animate');
$(opacAni).attr({
  attributeName: 'opacity',
  begin: 'indefinite',
  dur: 1,
  fill: 'freeze'
}).appendTo(svgroot);

const restoreRefElems = function (elem) {
  // Look for missing reference elements, restore any found
  const attrs = $(elem).attr(refAttrs);
  for (const o in attrs) {
    const val = attrs[o];
    if (val && val.startsWith('url(')) {
      const id = getUrlFromAttr(val).substr(1);
      const ref = getElem(id);
      if (!ref) {
        findDefs().append(removedElements[id]);
        delete removedElements[id];
      }
    }
  }

  const childs = elem.getElementsByTagName('*');

  if (childs.length) {
    for (let i = 0, l = childs.length; i < l; i++) {
      restoreRefElems(childs[i]);
    }
  }
};

// (function () {
// TODO For Issue 208: this is a start on a thumbnail
//  const svgthumb = svgdoc.createElementNS(NS.SVG, 'use');
//  svgthumb.setAttribute('width', '100');
//  svgthumb.setAttribute('height', '100');
//  setHref(svgthumb, '#svgcontent');
//  svgroot.append(svgthumb);
// }());

/**
 * @typedef {PlainObject} module:svgcanvas.SaveOptions
 * @property {boolean} apply
 * @property {"embed"} [image]
 * @property {Integer} round_digits
 */

// Object to contain image data for raster images that were found encodable
const encodableImages = {},

  // Object with save options
  /**
   * @type {module:svgcanvas.SaveOptions}
   */
  saveOptions = {round_digits: 5},

  // Object with IDs for imported files, to see if one was already added
  importIds = {},

  // Current text style properties
  curText = allProperties.text,

  // Object to contain all included extensions
  extensions = {},

  // Map of deleted reference elements
  removedElements = {};

let
  // String with image URL of last loadable image
  lastGoodImgUrl = curConfig.imgPath + 'logo.png',

  // Boolean indicating whether or not a draw action has been started
  started = false,

  // String with an element's initial transform attribute value
  startTransform = null,

  // String indicating the current editor mode
  currentMode = 'select',

  // String with the current direction in which an element is being resized
  currentResizeMode = 'none',

  // Current general properties
  curProperties = curShape,

  // Array with selected elements' Bounding box object
  // selectedBBoxes = new Array(1),

  // The DOM element that was just selected
  justSelected = null,

  // DOM element for selection rectangle drawn by the user
  rubberBox = null,

  // Array of current BBoxes, used in getIntersectionList().
  curBBoxes = [],

  // Canvas point for the most recent right click
  lastClickPoint = null;

/**
* @typedef {module:svgcanvas.ExtensionMouseDownStatus|module:svgcanvas.ExtensionMouseUpStatus|module:svgcanvas.ExtensionIDsUpdatedStatus|module:locale.ExtensionLocaleData[]|undefined} module:svgcanvas.ExtensionStatus
* @tutorial ExtensionDocs
*/
/**
* @callback module:svgcanvas.ExtensionVarBuilder
* @param {string} name The name of the extension
*/
/**
* @todo Consider: Should this return an array by default, so extension results aren't overwritten?
* @todo Would be easier to document if passing in object with key of action and vars as value; could then define an interface which tied both together
* @function module:svgcanvas.SvgCanvas#runExtensions
* @param {"mouseDown"|"mouseMove"|"mouseUp"|"zoomChanged"|"IDsUpdated"|"canvasUpdated"|"toolButtonStateUpdate"|"selectedChanged"|"elementTransition"|"elementChanged"|"langReady"|"langChanged"|"addLangData"|"onNewDocument"|"workareaResized"} action
* @param {module:svgcanvas.SvgCanvas#event:ext-mouseDown|module:svgcanvas.SvgCanvas#event:ext-mouseMove|module:svgcanvas.SvgCanvas#event:ext-mouseUp|module:svgcanvas.SvgCanvas#event:ext-zoomChanged|module:svgcanvas.SvgCanvas#event:ext-IDsUpdated|module:svgcanvas.SvgCanvas#event:ext-canvasUpdated|module:svgcanvas.SvgCanvas#event:ext-toolButtonStateUpdate|module:svgcanvas.SvgCanvas#event:ext-selectedChanged|module:svgcanvas.SvgCanvas#event:ext-elementTransition|module:svgcanvas.SvgCanvas#event:ext-elementChanged|module:svgcanvas.SvgCanvas#event:ext-langReady|module:svgcanvas.SvgCanvas#event:ext-langChanged|module:svgcanvas.SvgCanvas#event:ext-addLangData|module:svgcanvas.SvgCanvas#event:ext-onNewDocument|module:svgcanvas.SvgCanvas#event:ext-workareaResized|module:svgcanvas.ExtensionVarBuilder} [vars]
* @param {boolean} [returnArray]
* @returns {GenericArray.<module:svgcanvas.ExtensionStatus>|module:svgcanvas.ExtensionStatus|false} See {@tutorial ExtensionDocs} on the ExtensionStatus.
*/
const runExtensions = this.runExtensions = function (action, vars, returnArray) {
  let result = returnArray ? [] : false;
  $.each(extensions, function (name, ext) {
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
 * @property {module:SVGEditor.ContextTool[]|PlainObject.<string, module:SVGEditor.ContextTool>} [context_tools]
 * @property {module:SVGEditor.Button[]|PlainObject.<Integer, module:SVGEditor.Button>} [buttons]
 * @property {string} [svgicons] The location of a local SVG or SVGz file
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#mouseDown
 * @param {module:svgcanvas.SvgCanvas#event:ext-mouseDown} arg
 * @returns {undefined|module:svgcanvas.ExtensionMouseDownStatus}
 */
/**
 * @function module:svgcanvas.ExtensionInitResponse#mouseMove
 * @param {module:svgcanvas.SvgCanvas#event:ext-mouseMove} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#mouseUp
 * @param {module:svgcanvas.SvgCanvas#event:ext-mouseUp} arg
 * @returns {module:svgcanvas.ExtensionMouseUpStatus}
 */
/**
 * @function module:svgcanvas.ExtensionInitResponse#zoomChanged
 * @param {module:svgcanvas.SvgCanvas#event:ext-zoomChanged} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#IDsUpdated
 * @param {module:svgcanvas.SvgCanvas#event:ext-IDsUpdated} arg
 * @returns {module:svgcanvas.ExtensionIDsUpdatedStatus}
 */
/**
 * @function module:svgcanvas.ExtensionInitResponse#canvasUpdated
 * @param {module:svgcanvas.SvgCanvas#event:ext-canvasUpdated} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#toolButtonStateUpdate
 * @param {module:svgcanvas.SvgCanvas#event:ext-toolButtonStateUpdate} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#selectedChanged
 * @param {module:svgcanvas.SvgCanvas#event:ext-selectedChanged} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#elementTransition
 * @param {module:svgcanvas.SvgCanvas#event:ext-elementTransition} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#elementChanged
 * @param {module:svgcanvas.SvgCanvas#event:ext-elementChanged} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#langReady
 * @param {module:svgcanvas.SvgCanvas#event:ext-langReady} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#langChanged
 * @param {module:svgcanvas.SvgCanvas#event:ext-langChanged} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#addLangData
 * @param {module:svgcanvas.SvgCanvas#event:ext-addLangData} arg
 * @returns {Promise} Resolves to {@link module:locale.ExtensionLocaleData}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#onNewDocument
 * @param {module:svgcanvas.SvgCanvas#event:ext-onNewDocument} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#workareaResized
 * @param {module:svgcanvas.SvgCanvas#event:ext-workareaResized} arg
 * @returns {undefined}
*/
/**
 * @function module:svgcanvas.ExtensionInitResponse#callback
 * @param {module:svgcanvas.SvgCanvas#event:ext-callback} arg
 * @returns {undefined}
*/

/**
* @callback module:svgcanvas.ExtensionInitCallback
* @this module:SVGEditor
* @param {module:svgcanvas.ExtensionArgumentObject} arg
* @returns {Promise} Resolves to [ExtensionInitResponse]{@link module:svgcanvas.ExtensionInitResponse} or `undefined`
*/
/**
* Add an extension to the editor
* @function module:svgcanvas.SvgCanvas#addExtension
* @param {string} name - String with the ID of the extension. Used internally; no need for i18n.
* @param {module:svgcanvas.ExtensionInitCallback} [extInitFunc] - Function supplied by the extension with its data
* @param {module:SVGEditor~ImportLocale} importLocale
* @fires module:svgcanvas.SvgCanvas#event:extension_added
* @throws {TypeError} If `extInitFunc` is not a function
* @returns {Promise} Resolves to `undefined`
*/
this.addExtension = async function (name, extInitFunc, importLocale) {
  if (typeof extInitFunc !== 'function') {
    throw new TypeError('Function argument expected for `svgcanvas.addExtension`');
  }
  if (!(name in extensions)) {
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
    const argObj = $.extend(canvas.getPrivateMethods(), {
      importLocale,
      svgroot,
      svgcontent,
      nonce: getCurrentDrawing().getNonce(),
      selectorManager
    });
    const extObj = await extInitFunc(argObj);
    if (extObj) {
      extObj.name = name;
    }

    extensions[name] = extObj;
    return call('extension_added', extObj);
  } else {
    console.log('Cannot add extension "' + name + '", an extension by that name already exists.');
  }
};

/**
* This method sends back an array or a NodeList full of elements that
* intersect the multi-select rubber-band-box on the currentLayer only.
*
* We brute-force `getIntersectionList` for browsers that do not support it (Firefox).
*
* Reference:
* Firefox does not implement `getIntersectionList()`, see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=501421}
* @function module:svgcanvas.SvgCanvas#getIntersectionList
* @param {SVGRect} rect
* @returns {Element[]|NodeList} Bbox elements
*/
const getIntersectionList = this.getIntersectionList = function (rect) {
  if (rubberBox == null) { return null; }

  const parent = currentGroup || getCurrentDrawing().getCurrentLayer();

  let rubberBBox;
  if (!rect) {
    rubberBBox = rubberBox.getBBox();
    const bb = svgcontent.createSVGRect();

    for (const o in rubberBBox) {
      bb[o] = rubberBBox[o] / currentZoom;
    }
    rubberBBox = bb;
  } else {
    rubberBBox = svgcontent.createSVGRect();
    rubberBBox.x = rect.x;
    rubberBBox.y = rect.y;
    rubberBBox.width = rect.width;
    rubberBBox.height = rect.height;
  }

  let resultList = null;
  if (!isIE) {
    if (typeof svgroot.getIntersectionList === 'function') {
      // Offset the bbox of the rubber box by the offset of the svgcontent element.
      rubberBBox.x += parseInt(svgcontent.getAttribute('x'), 10);
      rubberBBox.y += parseInt(svgcontent.getAttribute('y'), 10);

      resultList = svgroot.getIntersectionList(rubberBBox, parent);
    }
  }

  if (resultList == null || typeof resultList.item !== 'function') {
    resultList = [];

    if (!curBBoxes.length) {
      // Cache all bboxes
      curBBoxes = getVisibleElementsAndBBoxes(parent);
    }
    let i = curBBoxes.length;
    while (i--) {
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

this.getStrokedBBox = getStrokedBBoxDefaultVisible;

this.getVisibleElements = getVisibleElements;

/**
* @typedef {PlainObject} ElementAndBBox
* @property {Element} elem - The element
* @property {module:utilities.BBoxObject} bbox - The element's BBox as retrieved from `getStrokedBBoxDefaultVisible`
*/

/**
* Get all elements that have a BBox (excludes `<defs>`, `<title>`, etc).
* Note that 0-opacity, off-screen etc elements are still considered "visible"
* for this function
* @function module:svgcanvas.SvgCanvas#getVisibleElementsAndBBoxes
* @param {Element} parent - The parent DOM element to search within
* @returns {ElementAndBBox[]} An array with objects that include:
*/
const getVisibleElementsAndBBoxes = this.getVisibleElementsAndBBoxes = function (parent) {
  if (!parent) {
    parent = $(svgcontent).children(); // Prevent layers from being included
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
* Wrap an SVG element into a group element, mark the group as 'gsvg'
* @function module:svgcanvas.SvgCanvas#groupSvgElem
* @param {Element} elem - SVG element to wrap
* @returns {undefined}
*/
const groupSvgElem = this.groupSvgElem = function (elem) {
  const g = document.createElementNS(NS.SVG, 'g');
  elem.replaceWith(g);
  $(g).append(elem).data('gsvg', elem)[0].id = getNextId();
};

// Set scope for these functions

// Object to contain editor event names and callback functions
const events = {};

canvas.call = call;
/**
 * Array of what was changed (elements, layers)
 * @event module:svgcanvas.SvgCanvas#event:changed
 * @type {Element[]}
 */
/**
 * Array of selected elements
 * @event module:svgcanvas.SvgCanvas#event:selected
 * @type {Element[]}
 */
/**
 * Array of selected elements
 * @event module:svgcanvas.SvgCanvas#event:transition
 * @type {Element[]}
 */
/**
 * The Element is always `SVGGElement`?
 * If not `null`, will be the set current group element
 * @event module:svgcanvas.SvgCanvas#event:contextset
 * @type {null|Element}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:pointsAdded
 * @type {PlainObject}
 * @property {boolean} closedSubpath
 * @property {SVGCircleElement[]} grips Grips elements
 */

/**
 * @event module:svgcanvas.SvgCanvas#event:zoomed
 * @type {PlainObject}
 * @property {Float} x
 * @property {Float} y
 * @property {Float} width
 * @property {Float} height
 * @property {0.5|2} factor
 * @see module:SVGEditor.BBoxObjectWithFactor
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:updateCanvas
 * @type {PlainObject}
 * @property {false} center
 * @property {module:math.XYObject} newCtr
 */
/**
 * @typedef {PlainObject} module:svgcanvas.ExtensionInitResponsePlusName
 * @implements {module:svgcanvas.ExtensionInitResponse}
 * @property {string} name The extension's resolved ID (whether explicit or based on file name)
 */
/**
 * Generalized extension object response of
 * [`init()`]{@link module:svgcanvas.ExtensionInitCallback}
 * along with the name of the extension.
 * @event module:svgcanvas.SvgCanvas#event:extension_added
 * @type {module:svgcanvas.ExtensionInitResponsePlusName|undefined}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:extensions_added
 * @type {undefined}
*/
/**
 * @typedef {PlainObject} module:svgcanvas.Message
 * @property {Any} data The data
 * @property {string} origin The origin
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:message
 * @type {module:svgcanvas.Message}
 */
/**
 * SVG canvas converted to string
 * @event module:svgcanvas.SvgCanvas#event:saved
 * @type {string}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:setnonce
 * @type {!(string|Integer)}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:unsetnonce
 * @type {undefined}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:zoomDone
 * @type {undefined}
*/
/**
 * @event module:svgcanvas.SvgCanvas#event:cleared
 * @type {undefined}
*/

/**
 * @event module:svgcanvas.SvgCanvas#event:exported
 * @type {module:svgcanvas.ImageExportedResults}
 */
/**
 * @event module:svgcanvas.SvgCanvas#event:exportedPDF
 * @type {module:svgcanvas.PDFExportedResults}
 */
/**
 * Creating a cover-all class until {@link https://github.com/jsdoc3/jsdoc/issues/1545} may be supported.
 * `undefined` may be returned by {@link module:svgcanvas.SvgCanvas#event:extension_added} if the extension's `init` returns `undefined` It is also the type for the following events "zoomDone", "unsetnonce", "cleared", and "extensions_added".
 * @event module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
 * @type {module:svgcanvas.SvgCanvas#event:selected|module:svgcanvas.SvgCanvas#event:changed|module:svgcanvas.SvgCanvas#event:contextset|module:svgcanvas.SvgCanvas#event:pointsAdded|module:svgcanvas.SvgCanvas#event:extension_added|module:svgcanvas.SvgCanvas#event:extensions_added|module:svgcanvas.SvgCanvas#event:message|module:svgcanvas.SvgCanvas#event:transition|module:svgcanvas.SvgCanvas#event:zoomed|module:svgcanvas.SvgCanvas#event:updateCanvas|module:svgcanvas.SvgCanvas#event:saved|module:svgcanvas.SvgCanvas#event:exported|module:svgcanvas.SvgCanvas#event:exportedPDF|module:svgcanvas.SvgCanvas#event:setnonce|module:svgcanvas.SvgCanvas#event:unsetnonce|undefined}
 */

/**
* @callback module:svgcanvas.EventHandler
* @param {external:Window} win
* @param {module:svgcanvas.SvgCanvas#event:GenericCanvasEvent} arg
* @listens module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
*/

/**
* Attaches a callback function to an event
* @function module:svgcanvas.SvgCanvas#bind
* @param {"changed"|"contextset"|"selected"|"pointsAdded"|"extension_added"|"extensions_added"|"message"|"transition"|"zoomed"|"updateCanvas"|"zoomDone"|"saved"|"exported"|"exportedPDF"|"setnonce"|"unsetnonce"|"cleared"} ev - String indicating the name of the event
* @param {module:svgcanvas.EventHandler} f - The callback function to bind to the event
* @returns {module:svgcanvas.EventHandler} The previous event
*/
canvas.bind = function (ev, f) {
  const old = events[ev];
  events[ev] = f;
  return old;
};

/**
* Runs the SVG Document through the sanitizer and then updates its paths.
* @function module:svgcanvas.SvgCanvas#prepareSvg
* @param {XMLDocument} newDoc - The SVG DOM document
* @returns {undefined}
*/
this.prepareSvg = function (newDoc) {
  this.sanitizeSvg(newDoc.documentElement);

  // convert paths into absolute commands
  const paths = [...newDoc.getElementsByTagNameNS(NS.SVG, 'path')];
  paths.forEach((path) => {
    path.setAttribute('d', pathActions.convertPath(path));
    pathActions.fixEnd(path);
  });
};

/**
* Hack for Firefox bugs where text element features aren't updated or get
* messed up. See issue 136 and issue 137.
* This function clones the element and re-selects it.
* @function module:svgcanvas~ffClone
* @todo Test for this bug on load and add it to "support" object instead of
* browser sniffing
* @param {Element} elem - The (text) DOM element to clone
* @returns {Element} Cloned element
*/
const ffClone = function (elem) {
  if (!isGecko()) { return elem; }
  const clone = elem.cloneNode(true);
  elem.before(clone);
  elem.remove();
  selectorManager.releaseSelector(elem);
  selectedElements[0] = clone;
  selectorManager.requestSelector(clone).showGrips(true);
  return clone;
};

// `this.each` is deprecated, if any extension used this it can be recreated by doing this:
// * @example $(canvas.getRootElem()).children().each(...)
// * @function module:svgcanvas.SvgCanvas#each
// this.each = function (cb) {
//  $(svgroot).children().each(cb);
// };

/**
* Removes any old rotations if present, prepends a new rotation at the
* transformed center
* @function module:svgcanvas.SvgCanvas#setRotationAngle
* @param {string|Float} val - The new rotation angle in degrees
* @param {boolean} preventUndo - Indicates whether the action should be undoable or not
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setRotationAngle = function (val, preventUndo) {
  // ensure val is the proper type
  val = parseFloat(val);
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
    const Rnc = svgroot.createSVGTransform();
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
    changeSelectedAttribute('transform', newTransform, selectedElements);
    call('changed', selectedElements);
  }
  // const pointGripContainer = getElem('pathpointgrip_container');
  // if (elem.nodeName === 'path' && pointGripContainer) {
  //   pathActions.setPointContainerTransform(elem.getAttribute('transform'));
  // }
  const selector = selectorManager.requestSelector(selectedElements[0]);
  selector.resize();
  selector.updateGripCursors(val);
};

/**
* Runs `recalculateDimensions` on the selected elements,
* adding the changes to a single batch command
* @function module:svgcanvas.SvgCanvas#recalculateAllSelectedDimensions
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
const recalculateAllSelectedDimensions = this.recalculateAllSelectedDimensions = function () {
  const text = (currentResizeMode === 'none' ? 'position' : 'size');
  const batchCmd = new BatchCommand(text);

  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    // if (getRotationAngle(elem) && !hasMatrixTransform(getTransformList(elem))) { continue; }
    const cmd = recalculateDimensions(elem);
    if (cmd) {
      batchCmd.addSubCommand(cmd);
    }
  }

  if (!batchCmd.isEmpty()) {
    addCommandToHistory(batchCmd);
    call('changed', selectedElements);
  }
};

/**
 * Debug tool to easily see the current matrix in the browser's console
 * @function module:svgcanvas~logMatrix
 * @param {SVGMatrix} m The matrix
 * @returns {undefined}
 */
const logMatrix = function (m) {
  console.log([m.a, m.b, m.c, m.d, m.e, m.f]);
};

// Root Current Transformation Matrix in user units
let rootSctm = null;

/**
* Group: Selection
*/

// TODO: do we need to worry about selectedBBoxes here?

/**
* Selects only the given elements, shortcut for clearSelection(); addToSelection()
* @function module:svgcanvas.SvgCanvas#selectOnly
* @param {Element[]} elems - an array of DOM elements to be selected
* @param {boolean} showGrips - Indicates whether the resize grips should be shown
* @returns {undefined}
*/
const selectOnly = this.selectOnly = function (elems, showGrips) {
  clearSelection(true);
  addToSelection(elems, showGrips);
};

// TODO: could use slice here to make this faster?
// TODO: should the 'selected' handler

/**
* Removes elements from the selection.
* @function module:svgcanvas.SvgCanvas#removeFromSelection
* @param {Element[]} elemsToRemove - An array of elements to remove from selection
* @returns {undefined}
*/
/* const removeFromSelection = */ this.removeFromSelection = function (elemsToRemove) {
  if (selectedElements[0] == null) { return; }
  if (!elemsToRemove.length) { return; }

  // find every element and remove it from our array copy
  const newSelectedItems = [],
    len = selectedElements.length;
  for (let i = 0; i < len; ++i) {
    const elem = selectedElements[i];
    if (elem) {
      // keep the item
      if (!elemsToRemove.includes(elem)) {
        newSelectedItems.push(elem);
      } else { // remove the item and its selector
        selectorManager.releaseSelector(elem);
      }
    }
  }
  // the copy becomes the master now
  selectedElements = newSelectedItems;
};

/**
* Clears the selection, then adds all elements in the current layer to the selection.
* @function module:svgcanvas.SvgCanvas#selectAllInCurrentLayer
* @returns {undefined}
*/
this.selectAllInCurrentLayer = function () {
  const currentLayer = getCurrentDrawing().getCurrentLayer();
  if (currentLayer) {
    currentMode = 'select';
    selectOnly($(currentGroup || currentLayer).children());
  }
};

let drawnPath = null;

// Mouse events
(function () {
const freehand = {
  minx: null,
  miny: null,
  maxx: null,
  maxy: null
};
const THRESHOLD_DIST = 0.8,
  STEP_COUNT = 10;
let dAttr = null,
  startX = null,
  startY = null,
  rStartX = null,
  rStartY = null,
  initBbox = {},
  sumDistance = 0,
  controllPoint2 = {x: 0, y: 0},
  controllPoint1 = {x: 0, y: 0},
  start = {x: 0, y: 0},
  end = {x: 0, y: 0},
  bSpline = {x: 0, y: 0},
  nextPos = {x: 0, y: 0},
  parameter,
  nextParameter;

const getBsplinePoint = function (t) {
  const spline = {x: 0, y: 0},
    p0 = controllPoint2,
    p1 = controllPoint1,
    p2 = start,
    p3 = end,
    S = 1.0 / 6.0,
    t2 = t * t,
    t3 = t2 * t;

  const m = [
    [-1, 3, -3, 1],
    [3, -6, 3, 0],
    [-3, 0, 3, 0],
    [1, 4, 1, 0]
  ];

  spline.x = S * (
    (p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3 +
      (p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2 +
      (p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t +
      (p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3])
  );
  spline.y = S * (
    (p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3 +
      (p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2 +
      (p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t +
      (p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3])
  );

  return {
    x: spline.x,
    y: spline.y
  };
};
/**
 * - When we are in a create mode, the element is added to the canvas but the
 *   action is not recorded until mousing up.
 * - When we are in select mode, select the element, remember the position
 *   and do nothing else
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:ext-mouseDown
 * @returns {undefined}
 */
const mouseDown = function (evt) {
  if (canvas.spaceKey || evt.button === 1) { return; }

  const rightClick = evt.button === 2;

  if (evt.altKey) { // duplicate when dragging
    canvas.cloneSelectedElements(0, 0);
  }

  rootSctm = $('#svgcontent g')[0].getScreenCTM().inverse();

  const pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
    mouseX = pt.x * currentZoom,
    mouseY = pt.y * currentZoom;

  evt.preventDefault();

  if (rightClick) {
    currentMode = 'select';
    lastClickPoint = pt;
  }

  // This would seem to be unnecessary...
  // if (!['select', 'resize'].includes(currentMode)) {
  //   setGradient();
  // }

  let x = mouseX / currentZoom,
    y = mouseY / currentZoom;
  let mouseTarget = getMouseTarget(evt);

  if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
    mouseTarget = mouseTarget.firstChild;
  }

  // realX/y ignores grid-snap value
  const realX = x;
  rStartX = startX = x;
  const realY = y;
  rStartY = startY = y;

  if (curConfig.gridSnapping) {
    x = snapToGrid(x);
    y = snapToGrid(y);
    startX = snapToGrid(startX);
    startY = snapToGrid(startY);
  }

  // if it is a selector grip, then it must be a single element selected,
  // set the mouseTarget to that and update the mode to rotate/resize

  if (mouseTarget === selectorManager.selectorParentGroup && selectedElements[0] != null) {
    const grip = evt.target;
    const griptype = elData(grip, 'type');
    // rotating
    if (griptype === 'rotate') {
      currentMode = 'rotate';
    // resizing
    } else if (griptype === 'resize') {
      currentMode = 'resize';
      currentResizeMode = elData(grip, 'dir');
    }
    mouseTarget = selectedElements[0];
  }

  startTransform = mouseTarget.getAttribute('transform');
  let i, strokeW;
  const tlist = getTransformList(mouseTarget);
  switch (currentMode) {
  case 'select':
    started = true;
    currentResizeMode = 'none';
    if (rightClick) { started = false; }

    if (mouseTarget !== svgroot) {
      // if this element is not yet selected, clear selection and select it
      if (!selectedElements.includes(mouseTarget)) {
        // only clear selection if shift is not pressed (otherwise, add
        // element to selection)
        if (!evt.shiftKey) {
          // No need to do the call here as it will be done on addToSelection
          clearSelection(true);
        }
        addToSelection([mouseTarget]);
        justSelected = mouseTarget;
        pathActions.clear();
      }
      // else if it's a path, go into pathedit mode in mouseup

      if (!rightClick) {
        // insert a dummy transform so if the element(s) are moved it will have
        // a transform to use for its translate
        for (i = 0; i < selectedElements.length; ++i) {
          if (selectedElements[i] == null) { continue; }
          const slist = getTransformList(selectedElements[i]);
          if (slist.numberOfItems) {
            slist.insertItemBefore(svgroot.createSVGTransform(), 0);
          } else {
            slist.appendItem(svgroot.createSVGTransform());
          }
        }
      }
    } else if (!rightClick) {
      clearSelection();
      currentMode = 'multiselect';
      if (rubberBox == null) {
        rubberBox = selectorManager.getRubberBandBox();
      }
      rStartX *= currentZoom;
      rStartY *= currentZoom;
      // console.log('p',[evt.pageX, evt.pageY]);
      // console.log('c',[evt.clientX, evt.clientY]);
      // console.log('o',[evt.offsetX, evt.offsetY]);
      // console.log('s',[startX, startY]);

      assignAttributes(rubberBox, {
        x: rStartX,
        y: rStartY,
        width: 0,
        height: 0,
        display: 'inline'
      }, 100);
    }
    break;
  case 'zoom':
    started = true;
    if (rubberBox == null) {
      rubberBox = selectorManager.getRubberBandBox();
    }
    assignAttributes(rubberBox, {
      x: realX * currentZoom,
      y: realX * currentZoom,
      width: 0,
      height: 0,
      display: 'inline'
    }, 100);
    break;
  case 'resize':
    started = true;
    startX = x;
    startY = y;

    // Getting the BBox from the selection box, since we know we
    // want to orient around it
    initBbox = utilsGetBBox($('#selectedBox0')[0]);
    const bb = {};
    $.each(initBbox, function (key, val) {
      bb[key] = val / currentZoom;
    });
    initBbox = bb;

    // append three dummy transforms to the tlist so that
    // we can translate,scale,translate in mousemove
    const pos = getRotationAngle(mouseTarget) ? 1 : 0;

    if (hasMatrixTransform(tlist)) {
      tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
      tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
      tlist.insertItemBefore(svgroot.createSVGTransform(), pos);
    } else {
      tlist.appendItem(svgroot.createSVGTransform());
      tlist.appendItem(svgroot.createSVGTransform());
      tlist.appendItem(svgroot.createSVGTransform());

      if (supportsNonScalingStroke()) {
        // Handle crash for newer Chrome and Safari 6 (Mobile and Desktop):
        // https://code.google.com/p/svg-edit/issues/detail?id=904
        // Chromium issue: https://code.google.com/p/chromium/issues/detail?id=114625
        // TODO: Remove this workaround once vendor fixes the issue
        const iswebkit = isWebkit();

        let delayedStroke;
        if (iswebkit) {
          delayedStroke = function (ele) {
            const _stroke = ele.getAttributeNS(null, 'stroke');
            ele.removeAttributeNS(null, 'stroke');
            // Re-apply stroke after delay. Anything higher than 1 seems to cause flicker
            if (_stroke !== null) setTimeout(function () { ele.setAttributeNS(null, 'stroke', _stroke); }, 0);
          };
        }
        mouseTarget.style.vectorEffect = 'non-scaling-stroke';
        if (iswebkit) { delayedStroke(mouseTarget); }

        const all = mouseTarget.getElementsByTagName('*'),
          len = all.length;
        for (i = 0; i < len; i++) {
          if (!all[i].style) { // mathML
            continue;
          }
          all[i].style.vectorEffect = 'non-scaling-stroke';
          if (iswebkit) { delayedStroke(all[i]); }
        }
      }
    }
    break;
  case 'fhellipse':
  case 'fhrect':
  case 'fhpath':
    start.x = realX;
    start.y = realY;
    started = true;
    dAttr = realX + ',' + realY + ' ';
    // Commented out as doing nothing now:
    // strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
    addSVGElementFromJson({
      element: 'polyline',
      curStyles: true,
      attr: {
        points: dAttr,
        id: getNextId(),
        fill: 'none',
        opacity: curShape.opacity / 2,
        'stroke-linecap': 'round',
        style: 'pointer-events:none'
      }
    });
    freehand.minx = realX;
    freehand.maxx = realX;
    freehand.miny = realY;
    freehand.maxy = realY;
    break;
  case 'image':
    started = true;
    const newImage = addSVGElementFromJson({
      element: 'image',
      attr: {
        x,
        y,
        width: 0,
        height: 0,
        id: getNextId(),
        opacity: curShape.opacity / 2,
        style: 'pointer-events:inherit'
      }
    });
    setHref(newImage, lastGoodImgUrl);
    preventClickDefault(newImage);
    break;
  case 'square':
    // FIXME: once we create the rect, we lose information that this was a square
    // (for resizing purposes this could be important)
    // Fallthrough
  case 'rect':
    started = true;
    startX = x;
    startY = y;
    addSVGElementFromJson({
      element: 'rect',
      curStyles: true,
      attr: {
        x,
        y,
        width: 0,
        height: 0,
        id: getNextId(),
        opacity: curShape.opacity / 2
      }
    });
    break;
  case 'line':
    started = true;
    strokeW = Number(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
    addSVGElementFromJson({
      element: 'line',
      curStyles: true,
      attr: {
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        id: getNextId(),
        stroke: curShape.stroke,
        'stroke-width': strokeW,
        'stroke-dasharray': curShape.stroke_dasharray,
        'stroke-linejoin': curShape.stroke_linejoin,
        'stroke-linecap': curShape.stroke_linecap,
        'stroke-opacity': curShape.stroke_opacity,
        fill: 'none',
        opacity: curShape.opacity / 2,
        style: 'pointer-events:none'
      }
    });
    break;
  case 'circle':
    started = true;
    addSVGElementFromJson({
      element: 'circle',
      curStyles: true,
      attr: {
        cx: x,
        cy: y,
        r: 0,
        id: getNextId(),
        opacity: curShape.opacity / 2
      }
    });
    break;
  case 'ellipse':
    started = true;
    addSVGElementFromJson({
      element: 'ellipse',
      curStyles: true,
      attr: {
        cx: x,
        cy: y,
        rx: 0,
        ry: 0,
        id: getNextId(),
        opacity: curShape.opacity / 2
      }
    });
    break;
  case 'text':
    started = true;
    /* const newText = */ addSVGElementFromJson({
      element: 'text',
      curStyles: true,
      attr: {
        x,
        y,
        id: getNextId(),
        fill: curText.fill,
        'stroke-width': curText.stroke_width,
        'font-size': curText.font_size,
        'font-family': curText.font_family,
        'text-anchor': 'middle',
        'xml:space': 'preserve',
        opacity: curShape.opacity
      }
    });
    // newText.textContent = 'text';
    break;
  case 'path':
    // Fall through
  case 'pathedit':
    startX *= currentZoom;
    startY *= currentZoom;
    pathActions.mouseDown(evt, mouseTarget, startX, startY);
    started = true;
    break;
  case 'textedit':
    startX *= currentZoom;
    startY *= currentZoom;
    textActions.mouseDown(evt, mouseTarget, startX, startY);
    started = true;
    break;
  case 'rotate':
    started = true;
    // we are starting an undoable change (a drag-rotation)
    canvas.undoMgr.beginUndoableChange('transform', selectedElements);
    break;
  default:
    // This could occur in an extension
    break;
  }

  /**
   * The main (left) mouse button is held down on the canvas area
   * @event module:svgcanvas.SvgCanvas#event:ext-mouseDown
   * @type {PlainObject}
   * @property {MouseEvent} event The event object
   * @property {Float} start_x x coordinate on canvas
   * @property {Float} start_y y coordinate on canvas
   * @property {Element[]} selectedElements An array of the selected Elements
  */
  const extResult = runExtensions('mouseDown', /** @type {module:svgcanvas.SvgCanvas#event:ext-mouseDown} */ {
    event: evt,
    start_x: startX,
    start_y: startY,
    selectedElements
  }, true);

  $.each(extResult, function (i, r) {
    if (r && r.started) {
      started = true;
    }
  });
};

// in this function we do not record any state changes yet (but we do update
// any elements that are still being created, moved or resized on the canvas)
/**
 *
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:transition
 * @fires module:svgcanvas.SvgCanvas#event:ext-mouseMove
 * @returns {undefined}
 */
const mouseMove = function (evt) {
  if (!started) { return; }
  if (evt.button === 1 || canvas.spaceKey) { return; }

  let i, xya, c, cx, cy, dx, dy, len, angle, box,
    selected = selectedElements[0];
  const
    pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
    mouseX = pt.x * currentZoom,
    mouseY = pt.y * currentZoom,
    shape = getElem(getId());

  let realX = mouseX / currentZoom;
  let x = realX;
  let realY = mouseY / currentZoom;
  let y = realY;

  if (curConfig.gridSnapping) {
    x = snapToGrid(x);
    y = snapToGrid(y);
  }

  evt.preventDefault();
  let tlist;
  switch (currentMode) {
  case 'select': {
    // we temporarily use a translate on the element(s) being dragged
    // this transform is removed upon mousing up and the element is
    // relocated to the new location
    if (selectedElements[0] !== null) {
      dx = x - startX;
      dy = y - startY;

      if (curConfig.gridSnapping) {
        dx = snapToGrid(dx);
        dy = snapToGrid(dy);
      }

      /*
      // Commenting out as currently has no effect
      if (evt.shiftKey) {
        xya = snapToAngle(startX, startY, x, y);
        ({x, y} = xya);
      }
      */

      if (dx !== 0 || dy !== 0) {
        len = selectedElements.length;
        for (i = 0; i < len; ++i) {
          selected = selectedElements[i];
          if (selected == null) { break; }
          // if (i === 0) {
          //   const box = utilsGetBBox(selected);
          //     selectedBBoxes[i].x = box.x + dx;
          //     selectedBBoxes[i].y = box.y + dy;
          // }

          // update the dummy transform in our transform list
          // to be a translate
          const xform = svgroot.createSVGTransform();
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
          selectorManager.requestSelector(selected).resize();
        }

        call('transition', selectedElements);
      }
    }
    break;
  } case 'multiselect': {
    realX *= currentZoom;
    realY *= currentZoom;
    assignAttributes(rubberBox, {
      x: Math.min(rStartX, realX),
      y: Math.min(rStartY, realY),
      width: Math.abs(realX - rStartX),
      height: Math.abs(realY - rStartY)
    }, 100);

    // for each selected:
    // - if newList contains selected, do nothing
    // - if newList doesn't contain selected, remove it from selected
    // - for any newList that was not in selectedElements, add it to selected
    const elemsToRemove = selectedElements.slice(), elemsToAdd = [],
      newList = getIntersectionList();

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
      canvas.removeFromSelection(elemsToRemove);
    }

    if (elemsToAdd.length > 0) {
      canvas.addToSelection(elemsToAdd);
    }

    break;
  } case 'resize': {
    // we track the resize bounding box and translate/scale the selected element
    // while the mouse is down, when mouse goes up, we use this to recalculate
    // the shape's coordinates
    tlist = getTransformList(selected);
    const hasMatrix = hasMatrixTransform(tlist);
    box = hasMatrix ? initBbox : utilsGetBBox(selected);
    let left = box.x,
      top = box.y,
      {width, height} = box;
    dx = (x - startX);
    dy = (y - startY);

    if (curConfig.gridSnapping) {
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
    if (!currentResizeMode.includes('n') && !currentResizeMode.includes('s')) {
      dy = 0;
    }
    if (!currentResizeMode.includes('e') && !currentResizeMode.includes('w')) {
      dx = 0;
    }

    let // ts = null,
      tx = 0, ty = 0,
      sy = height ? (height + dy) / height : 1,
      sx = width ? (width + dx) / width : 1;
    // if we are dragging on the north side, then adjust the scale factor and ty
    if (currentResizeMode.includes('n')) {
      sy = height ? (height - dy) / height : 1;
      ty = height;
    }

    // if we dragging on the east side, then adjust the scale factor and tx
    if (currentResizeMode.includes('w')) {
      sx = width ? (width - dx) / width : 1;
      tx = width;
    }

    // update the transform list with translate,scale,translate
    const translateOrigin = svgroot.createSVGTransform(),
      scale = svgroot.createSVGTransform(),
      translateBack = svgroot.createSVGTransform();

    if (curConfig.gridSnapping) {
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

    selectorManager.requestSelector(selected).resize();

    call('transition', selectedElements);

    break;
  } case 'zoom': {
    realX *= currentZoom;
    realY *= currentZoom;
    assignAttributes(rubberBox, {
      x: Math.min(rStartX * currentZoom, realX),
      y: Math.min(rStartY * currentZoom, realY),
      width: Math.abs(realX - rStartX * currentZoom),
      height: Math.abs(realY - rStartY * currentZoom)
    }, 100);
    break;
  } case 'text': {
    assignAttributes(shape, {
      x,
      y
    }, 1000);
    break;
  } case 'line': {
    if (curConfig.gridSnapping) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }

    let x2 = x;
    let y2 = y;

    if (evt.shiftKey) {
      xya = snapToAngle(startX, startY, x2, y2);
      x2 = xya.x;
      y2 = xya.y;
    }

    shape.setAttributeNS(null, 'x2', x2);
    shape.setAttributeNS(null, 'y2', y2);
    break;
  } case 'foreignObject':
    // fall through
  case 'square':
    // fall through
  case 'rect':
    // fall through
  case 'image': {
    const square = (currentMode === 'square') || evt.shiftKey;
    let
      w = Math.abs(x - startX),
      h = Math.abs(y - startY);
    let newX, newY;
    if (square) {
      w = h = Math.max(w, h);
      newX = startX < x ? startX : startX - w;
      newY = startY < y ? startY : startY - h;
    } else {
      newX = Math.min(startX, x);
      newY = Math.min(startY, y);
    }

    if (curConfig.gridSnapping) {
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
    if (curConfig.gridSnapping) {
      rad = snapToGrid(rad);
    }
    shape.setAttributeNS(null, 'r', rad);
    break;
  } case 'ellipse': {
    c = $(shape).attr(['cx', 'cy']);
    ({cx, cy} = c);
    if (curConfig.gridSnapping) {
      x = snapToGrid(x);
      cx = snapToGrid(cx);
      y = snapToGrid(y);
      cy = snapToGrid(cy);
    }
    shape.setAttributeNS(null, 'rx', Math.abs(x - cx));
    const ry = Math.abs(evt.shiftKey ? (x - cx) : (y - cy));
    shape.setAttributeNS(null, 'ry', ry);
    break;
  }
  case 'fhellipse':
  case 'fhrect': {
    freehand.minx = Math.min(realX, freehand.minx);
    freehand.maxx = Math.max(realX, freehand.maxx);
    freehand.miny = Math.min(realY, freehand.miny);
    freehand.maxy = Math.max(realY, freehand.maxy);
  }
  // Fallthrough
  case 'fhpath': {
    // dAttr += + realX + ',' + realY + ' ';
    // shape.setAttributeNS(null, 'points', dAttr);
    end.x = realX; end.y = realY;
    if (controllPoint2.x && controllPoint2.y) {
      for (i = 0; i < STEP_COUNT - 1; i++) {
        parameter = i / STEP_COUNT;
        nextParameter = (i + 1) / STEP_COUNT;
        bSpline = getBsplinePoint(nextParameter);
        nextPos = bSpline;
        bSpline = getBsplinePoint(parameter);
        sumDistance += Math.sqrt((nextPos.x - bSpline.x) * (nextPos.x - bSpline.x) + (nextPos.y - bSpline.y) * (nextPos.y - bSpline.y));
        if (sumDistance > THRESHOLD_DIST) {
          sumDistance -= THRESHOLD_DIST;

          // Faster than completely re-writing the points attribute.
          const point = svgcontent.createSVGPoint();
          point.x = bSpline.x;
          point.y = bSpline.y;
          shape.points.appendItem(point);
        }
      }
    }
    controllPoint2 = {x: controllPoint1.x, y: controllPoint1.y};
    controllPoint1 = {x: start.x, y: start.y};
    start = {x: end.x, y: end.y};
    break;
  // update path stretch line coordinates
  } case 'path': {
  }
  // fall through
  case 'pathedit': {
    x *= currentZoom;
    y *= currentZoom;

    if (curConfig.gridSnapping) {
      x = snapToGrid(x);
      y = snapToGrid(y);
      startX = snapToGrid(startX);
      startY = snapToGrid(startY);
    }
    if (evt.shiftKey) {
      const {path} = pathModule;
      let x1, y1;
      if (path) {
        x1 = path.dragging ? path.dragging[0] : startX;
        y1 = path.dragging ? path.dragging[1] : startY;
      } else {
        x1 = startX;
        y1 = startY;
      }
      xya = snapToAngle(x1, y1, x, y);
      ({x, y} = xya);
    }

    if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
      realX *= currentZoom;
      realY *= currentZoom;
      assignAttributes(rubberBox, {
        x: Math.min(rStartX * currentZoom, realX),
        y: Math.min(rStartY * currentZoom, realY),
        width: Math.abs(realX - rStartX * currentZoom),
        height: Math.abs(realY - rStartY * currentZoom)
      }, 100);
    }
    pathActions.mouseMove(x, y);

    break;
  } case 'textedit': {
    x *= currentZoom;
    y *= currentZoom;
    // if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
    //   assignAttributes(rubberBox, {
    //     x: Math.min(startX, x),
    //     y: Math.min(startY, y),
    //     width: Math.abs(x - startX),
    //     height: Math.abs(y - startY)
    //   }, 100);
    // }

    textActions.mouseMove(mouseX, mouseY);

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
    if (curConfig.gridSnapping) {
      angle = snapToGrid(angle);
    }
    if (evt.shiftKey) { // restrict rotations to nice angles (WRS)
      const snap = 45;
      angle = Math.round(angle / snap) * snap;
    }

    canvas.setRotationAngle(angle < -180 ? (360 + angle) : angle, true);
    call('transition', selectedElements);
    break;
  } default:
    break;
  }

  /**
  * The mouse has moved on the canvas area
  * @event module:svgcanvas.SvgCanvas#event:ext-mouseMove
  * @type {PlainObject}
  * @property {MouseEvent} event The event object
  * @property {Float} mouse_x x coordinate on canvas
  * @property {Float} mouse_y y coordinate on canvas
  * @property {Element} selected Refers to the first selected element
  */
  runExtensions('mouseMove', /** @type {module:svgcanvas.SvgCanvas#event:ext-mouseMove} */ {
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
 * @fires module:svgcanvas.SvgCanvas#event:ext-mouseUp
 * @returns {undefined}
 */
const mouseUp = function (evt) {
  if (evt.button === 2) { return; }
  const tempJustSelected = justSelected;
  justSelected = null;
  if (!started) { return; }
  const pt = transformPoint(evt.pageX, evt.pageY, rootSctm),
    mouseX = pt.x * currentZoom,
    mouseY = pt.y * currentZoom,
    x = mouseX / currentZoom,
    y = mouseY / currentZoom;

  let element = getElem(getId());
  let keep = false;

  const realX = x;
  const realY = y;

  // TODO: Make true when in multi-unit mode
  const useUnit = false; // (curConfig.baseUnit !== 'px');
  started = false;
  let attrs, t;
  switch (currentMode) {
  // intentionally fall-through to select here
  case 'resize':
  case 'multiselect':
    if (rubberBox != null) {
      rubberBox.setAttribute('display', 'none');
      curBBoxes = [];
    }
    currentMode = 'select';
    // Fallthrough
  case 'select':
    if (selectedElements[0] != null) {
      // if we only have one selected element
      if (selectedElements[1] == null) {
        // set our current stroke/fill properties to the element's
        const selected = selectedElements[0];
        switch (selected.tagName) {
        case 'g':
        case 'use':
        case 'image':
        case 'foreignObject':
          break;
        default:
          curProperties.fill = selected.getAttribute('fill');
          curProperties.fill_opacity = selected.getAttribute('fill-opacity');
          curProperties.stroke = selected.getAttribute('stroke');
          curProperties.stroke_opacity = selected.getAttribute('stroke-opacity');
          curProperties.stroke_width = selected.getAttribute('stroke-width');
          curProperties.stroke_dasharray = selected.getAttribute('stroke-dasharray');
          curProperties.stroke_linejoin = selected.getAttribute('stroke-linejoin');
          curProperties.stroke_linecap = selected.getAttribute('stroke-linecap');
        }

        if (selected.tagName === 'text') {
          curText.font_size = selected.getAttribute('font-size');
          curText.font_family = selected.getAttribute('font-family');
        }
        selectorManager.requestSelector(selected).showGrips(true);

        // This shouldn't be necessary as it was done on mouseDown...
        // call('selected', [selected]);
      }
      // always recalculate dimensions to strip off stray identity transforms
      recalculateAllSelectedDimensions();
      // if it was being dragged/resized
      if (realX !== rStartX || realY !== rStartY) {
        const len = selectedElements.length;
        for (let i = 0; i < len; ++i) {
          if (selectedElements[i] == null) { break; }
          if (!selectedElements[i].firstChild) {
            // Not needed for groups (incorrectly resizes elems), possibly not needed at all?
            selectorManager.requestSelector(selectedElements[i]).resize();
          }
        }
      // no change in position/size, so maybe we should move to pathedit
      } else {
        t = evt.target;
        if (selectedElements[0].nodeName === 'path' && selectedElements[1] == null) {
          pathActions.select(selectedElements[0]);
        // if it was a path
        // else, if it was selected and this is a shift-click, remove it from selection
        } else if (evt.shiftKey) {
          if (tempJustSelected !== t) {
            canvas.removeFromSelection([t]);
          }
        }
      } // no change in mouse position

      // Remove non-scaling stroke
      if (supportsNonScalingStroke()) {
        const elem = selectedElements[0];
        if (elem) {
          elem.removeAttribute('style');
          walkTree(elem, function (elem) {
            elem.removeAttribute('style');
          });
        }
      }
    }
    return;
  case 'zoom':
    if (rubberBox != null) {
      rubberBox.setAttribute('display', 'none');
    }
    const factor = evt.shiftKey ? 0.5 : 2;
    call('zoomed', {
      x: Math.min(rStartX, realX),
      y: Math.min(rStartY, realY),
      width: Math.abs(realX - rStartX),
      height: Math.abs(realY - rStartY),
      factor
    });
    return;
  case 'fhpath':
    // Check that the path contains at least 2 points; a degenerate one-point path
    // causes problems.
    // Webkit ignores how we set the points attribute with commas and uses space
    // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
    sumDistance = 0;
    controllPoint2 = {x: 0, y: 0};
    controllPoint1 = {x: 0, y: 0};
    start = {x: 0, y: 0};
    end = {x: 0, y: 0};
    const coords = element.getAttribute('points');
    const commaIndex = coords.indexOf(',');
    if (commaIndex >= 0) {
      keep = coords.indexOf(',', commaIndex + 1) >= 0;
    } else {
      keep = coords.indexOf(' ', coords.indexOf(' ') + 1) >= 0;
    }
    if (keep) {
      element = pathActions.smoothPolylineIntoPath(element);
    }
    break;
  case 'line':
    attrs = $(element).attr(['x1', 'x2', 'y1', 'y2']);
    keep = (attrs.x1 !== attrs.x2 || attrs.y1 !== attrs.y2);
    break;
  case 'foreignObject':
  case 'square':
  case 'rect':
  case 'image':
    attrs = $(element).attr(['width', 'height']);
    // Image should be kept regardless of size (use inherit dimensions later)
    keep = (attrs.width || attrs.height) || currentMode === 'image';
    break;
  case 'circle':
    keep = (element.getAttribute('r') !== '0');
    break;
  case 'ellipse':
    attrs = $(element).attr(['rx', 'ry']);
    keep = (attrs.rx || attrs.ry);
    break;
  case 'fhellipse':
    if ((freehand.maxx - freehand.minx) > 0 &&
      (freehand.maxy - freehand.miny) > 0) {
      element = addSVGElementFromJson({
        element: 'ellipse',
        curStyles: true,
        attr: {
          cx: (freehand.minx + freehand.maxx) / 2,
          cy: (freehand.miny + freehand.maxy) / 2,
          rx: (freehand.maxx - freehand.minx) / 2,
          ry: (freehand.maxy - freehand.miny) / 2,
          id: getId()
        }
      });
      call('changed', [element]);
      keep = true;
    }
    break;
  case 'fhrect':
    if ((freehand.maxx - freehand.minx) > 0 &&
      (freehand.maxy - freehand.miny) > 0) {
      element = addSVGElementFromJson({
        element: 'rect',
        curStyles: true,
        attr: {
          x: freehand.minx,
          y: freehand.miny,
          width: (freehand.maxx - freehand.minx),
          height: (freehand.maxy - freehand.miny),
          id: getId()
        }
      });
      call('changed', [element]);
      keep = true;
    }
    break;
  case 'text':
    keep = true;
    selectOnly([element]);
    textActions.start(element);
    break;
  case 'path':
    // set element to null here so that it is not removed nor finalized
    element = null;
    // continue to be set to true so that mouseMove happens
    started = true;

    const res = pathActions.mouseUp(evt, element, mouseX, mouseY);
    ({element} = res);
    ({keep} = res);
    break;
  case 'pathedit':
    keep = true;
    element = null;
    pathActions.mouseUp(evt);
    break;
  case 'textedit':
    keep = false;
    element = null;
    textActions.mouseUp(evt, mouseX, mouseY);
    break;
  case 'rotate':
    keep = true;
    element = null;
    currentMode = 'select';
    const batchCmd = canvas.undoMgr.finishUndoableChange();
    if (!batchCmd.isEmpty()) {
      addCommandToHistory(batchCmd);
    }
    // perform recalculation to weed out any stray identity transforms that might get stuck
    recalculateAllSelectedDimensions();
    call('changed', selectedElements);
    break;
  default:
    // This could occur in an extension
    break;
  }

  /**
  * The main (left) mouse button is released (anywhere)
  * @event module:svgcanvas.SvgCanvas#event:ext-mouseUp
  * @type {PlainObject}
  * @property {MouseEvent} event The event object
  * @property {Float} mouse_x x coordinate on canvas
  * @property {Float} mouse_y y coordinate on canvas
  */
  const extResult = runExtensions('mouseUp', /** @type {module:svgcanvas.SvgCanvas#event:ext-mouseUp} */ {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY
  }, true);

  $.each(extResult, function (i, r) {
    if (r) {
      keep = r.keep || keep;
      ({element} = r);
      started = r.started || started;
    }
  });

  if (!keep && element != null) {
    getCurrentDrawing().releaseId(getId());
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
    if ((currentMode !== 'path' || !drawnPath) &&
      t && t.parentNode &&
      t.parentNode.id !== 'selectorParentGroup' &&
      t.id !== 'svgcanvas' && t.id !== 'svgroot'
    ) {
      // switch into "select" mode if we've clicked on an element
      canvas.setMode('select');
      selectOnly([t], true);
    }
  } else if (element != null) {
    /**
    * @name module:svgcanvas.SvgCanvas#addedNew
    * @type {boolean}
    */
    canvas.addedNew = true;

    if (useUnit) { convertAttrs(element); }

    let aniDur = 0.2;
    let cAni;
    if (opacAni.beginElement && parseFloat(element.getAttribute('opacity')) !== curShape.opacity) {
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
      if (currentMode === 'path') {
        pathActions.toEditMode(element);
      } else if (curConfig.selectNew) {
        selectOnly([element], true);
      }
      // we create the insert command that is stored on the stack
      // undo means to call cmd.unapply(), redo means to call cmd.apply()
      addCommandToHistory(new InsertElementCommand(element));

      call('changed', [element]);
    }, aniDur * 1000);
  }

  startTransform = null;
};

const dblClick = function (evt) {
  const evtTarget = evt.target;
  const parent = evtTarget.parentNode;

  // Do nothing if already in current group
  if (parent === currentGroup) { return; }

  let mouseTarget = getMouseTarget(evt);
  const {tagName} = mouseTarget;

  if (tagName === 'text' && currentMode !== 'textedit') {
    const pt = transformPoint(evt.pageX, evt.pageY, rootSctm);
    textActions.select(mouseTarget, pt.x, pt.y);
  }

  if ((tagName === 'g' || tagName === 'a') &&
    getRotationAngle(mouseTarget)
  ) {
    // TODO: Allow method of in-group editing without having to do
    // this (similar to editing rotated paths)

    // Ungroup and regroup
    pushGroupProperties(mouseTarget);
    mouseTarget = selectedElements[0];
    clearSelection(true);
  }
  // Reset context
  if (currentGroup) {
    draw.leaveContext();
  }

  if ((parent.tagName !== 'g' && parent.tagName !== 'a') ||
    parent === getCurrentDrawing().getCurrentLayer() ||
    mouseTarget === selectorManager.selectorParentGroup
  ) {
    // Escape from in-group edit
    return;
  }
  draw.setContext(mouseTarget);
};

// prevent links from being followed in the canvas
const handleLinkInCanvas = function (e) {
  e.preventDefault();
  return false;
};

// Added mouseup to the container here.
// TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.
$(container).mousedown(mouseDown).mousemove(mouseMove).click(handleLinkInCanvas).dblclick(dblClick).mouseup(mouseUp);
// $(window).mouseup(mouseUp);

// TODO(rafaelcastrocouto): User preference for shift key and zoom factor
$(container).bind(
  'mousewheel DOMMouseScroll',
  /**
   * @param {Event} e
   * @fires module:svgcanvas.SvgCanvas#event:updateCanvas
   * @fires module:svgcanvas.SvgCanvas#event:zoomDone
   * @returns {undefined}
   */
  function (e) {
    if (!e.shiftKey) { return; }

    e.preventDefault();
    const evt = e.originalEvent;

    rootSctm = $('#svgcontent g')[0].getScreenCTM().inverse();

    const workarea = $('#workarea');
    const scrbar = 15;
    const rulerwidth = curConfig.showRulers ? 16 : 0;

    // mouse relative to content area in content pixels
    const pt = transformPoint(evt.pageX, evt.pageY, rootSctm);

    // full work area width in screen pixels
    const editorFullW = workarea.width();
    const editorFullH = workarea.height();

    // work area width minus scroll and ruler in screen pixels
    const editorW = editorFullW - scrbar - rulerwidth;
    const editorH = editorFullH - scrbar - rulerwidth;

    // work area width in content pixels
    const workareaViewW = editorW * rootSctm.a;
    const workareaViewH = editorH * rootSctm.d;

    // content offset from canvas in screen pixels
    const wOffset = workarea.offset();
    const wOffsetLeft = wOffset['left'] + rulerwidth;
    const wOffsetTop = wOffset['top'] + rulerwidth;

    const delta = (evt.wheelDelta) ? evt.wheelDelta : (evt.detail) ? -evt.detail : 0;
    if (!delta) { return; }

    let factor = Math.max(3 / 4, Math.min(4 / 3, (delta)));

    let wZoom, hZoom;
    if (factor > 1) {
      wZoom = Math.ceil(editorW / workareaViewW * factor * 100) / 100;
      hZoom = Math.ceil(editorH / workareaViewH * factor * 100) / 100;
    } else {
      wZoom = Math.floor(editorW / workareaViewW * factor * 100) / 100;
      hZoom = Math.floor(editorH / workareaViewH * factor * 100) / 100;
    }
    let zoomlevel = Math.min(wZoom, hZoom);
    zoomlevel = Math.min(10, Math.max(0.01, zoomlevel));
    if (zoomlevel === currentZoom) {
      return;
    }
    factor = zoomlevel / currentZoom;

    // top left of workarea in content pixels before zoom
    const topLeftOld = transformPoint(wOffsetLeft, wOffsetTop, rootSctm);

    // top left of workarea in content pixels after zoom
    const topLeftNew = {
      x: pt.x - (pt.x - topLeftOld.x) / factor,
      y: pt.y - (pt.y - topLeftOld.y) / factor
    };

    // top left of workarea in canvas pixels relative to content after zoom
    const topLeftNewCanvas = {
      x: topLeftNew.x * zoomlevel,
      y: topLeftNew.y * zoomlevel
    };

    // new center in canvas pixels
    const newCtr = {
      x: topLeftNewCanvas.x - rulerwidth + editorFullW / 2,
      y: topLeftNewCanvas.y - rulerwidth + editorFullH / 2
    };

    canvas.setZoom(zoomlevel);
    $('#zoom').val((zoomlevel * 100).toFixed(1));

    call('updateCanvas', {center: false, newCtr});
    call('zoomDone');
  }
);
}());

/**
* Group: Text edit functions
* Functions relating to editing text elements
* @namespace {PlainObject} textActions
* @memberof module:svgcanvas.SvgCanvas#
*/
const textActions = canvas.textActions = (function () {
let curtext;
let textinput;
let cursor;
let selblock;
let blinker;
let chardata = [];
let textbb; // , transbb;
let matrix;
let lastX, lastY;
let allowDbl;

function setCursor (index) {
  const empty = (textinput.value === '');
  $(textinput).focus();

  if (!arguments.length) {
    if (empty) {
      index = 0;
    } else {
      if (textinput.selectionEnd !== textinput.selectionStart) { return; }
      index = textinput.selectionEnd;
    }
  }

  const charbb = chardata[index];
  if (!empty) {
    textinput.setSelectionRange(index, index);
  }
  cursor = getElem('text_cursor');
  if (!cursor) {
    cursor = document.createElementNS(NS.SVG, 'line');
    assignAttributes(cursor, {
      id: 'text_cursor',
      stroke: '#333',
      'stroke-width': 1
    });
    cursor = getElem('selectorParentGroup').appendChild(cursor);
  }

  if (!blinker) {
    blinker = setInterval(function () {
      const show = (cursor.getAttribute('display') === 'none');
      cursor.setAttribute('display', show ? 'inline' : 'none');
    }, 600);
  }

  const startPt = ptToScreen(charbb.x, textbb.y);
  const endPt = ptToScreen(charbb.x, (textbb.y + textbb.height));

  assignAttributes(cursor, {
    x1: startPt.x,
    y1: startPt.y,
    x2: endPt.x,
    y2: endPt.y,
    visibility: 'visible',
    display: 'inline'
  });

  if (selblock) { selblock.setAttribute('d', ''); }
}

function setSelection (start, end, skipInput) {
  if (start === end) {
    setCursor(end);
    return;
  }

  if (!skipInput) {
    textinput.setSelectionRange(start, end);
  }

  selblock = getElem('text_selectblock');
  if (!selblock) {
    selblock = document.createElementNS(NS.SVG, 'path');
    assignAttributes(selblock, {
      id: 'text_selectblock',
      fill: 'green',
      opacity: 0.5,
      style: 'pointer-events:none'
    });
    getElem('selectorParentGroup').append(selblock);
  }

  const startbb = chardata[start];
  const endbb = chardata[end];

  cursor.setAttribute('visibility', 'hidden');

  const tl = ptToScreen(startbb.x, textbb.y),
    tr = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y),
    bl = ptToScreen(startbb.x, textbb.y + textbb.height),
    br = ptToScreen(startbb.x + (endbb.x - startbb.x), textbb.y + textbb.height);

  const dstr = 'M' + tl.x + ',' + tl.y +
    ' L' + tr.x + ',' + tr.y +
    ' ' + br.x + ',' + br.y +
    ' ' + bl.x + ',' + bl.y + 'z';

  assignAttributes(selblock, {
    d: dstr,
    display: 'inline'
  });
}

function getIndexFromPoint (mouseX, mouseY) {
  // Position cursor here
  const pt = svgroot.createSVGPoint();
  pt.x = mouseX;
  pt.y = mouseY;

  // No content, so return 0
  if (chardata.length === 1) { return 0; }
  // Determine if cursor should be on left or right of character
  let charpos = curtext.getCharNumAtPosition(pt);
  if (charpos < 0) {
    // Out of text range, look at mouse coords
    charpos = chardata.length - 2;
    if (mouseX <= chardata[0].x) {
      charpos = 0;
    }
  } else if (charpos >= chardata.length - 2) {
    charpos = chardata.length - 2;
  }
  const charbb = chardata[charpos];
  const mid = charbb.x + (charbb.width / 2);
  if (mouseX > mid) {
    charpos++;
  }
  return charpos;
}

function setCursorFromPoint (mouseX, mouseY) {
  setCursor(getIndexFromPoint(mouseX, mouseY));
}

function setEndSelectionFromPoint (x, y, apply) {
  const i1 = textinput.selectionStart;
  const i2 = getIndexFromPoint(x, y);

  const start = Math.min(i1, i2);
  const end = Math.max(i1, i2);
  setSelection(start, end, !apply);
}

function screenToPt (xIn, yIn) {
  const out = {
    x: xIn,
    y: yIn
  };

  out.x /= currentZoom;
  out.y /= currentZoom;

  if (matrix) {
    const pt = transformPoint(out.x, out.y, matrix.inverse());
    out.x = pt.x;
    out.y = pt.y;
  }

  return out;
}

function ptToScreen (xIn, yIn) {
  const out = {
    x: xIn,
    y: yIn
  };

  if (matrix) {
    const pt = transformPoint(out.x, out.y, matrix);
    out.x = pt.x;
    out.y = pt.y;
  }

  out.x *= currentZoom;
  out.y *= currentZoom;

  return out;
}

/*
// Not currently in use
function hideCursor () {
  if (cursor) {
    cursor.setAttribute('visibility', 'hidden');
  }
}
*/

function selectAll (evt) {
  setSelection(0, curtext.textContent.length);
  $(this).unbind(evt);
}

function selectWord (evt) {
  if (!allowDbl || !curtext) { return; }

  const ept = transformPoint(evt.pageX, evt.pageY, rootSctm),
    mouseX = ept.x * currentZoom,
    mouseY = ept.y * currentZoom;
  const pt = screenToPt(mouseX, mouseY);

  const index = getIndexFromPoint(pt.x, pt.y);
  const str = curtext.textContent;
  const first = str.substr(0, index).replace(/[a-z0-9]+$/i, '').length;
  const m = str.substr(index).match(/^[a-z0-9]+/i);
  const last = (m ? m[0].length : 0) + index;
  setSelection(first, last);

  // Set tripleclick
  $(evt.target).click(selectAll);
  setTimeout(function () {
    $(evt.target).unbind('click', selectAll);
  }, 300);
}

return /** @lends module:svgcanvas.SvgCanvas#textActions */ {
  /**
  * @param {Element} target
  * @param {Float} x
  * @param {Float} y
  * @returns {undefined}
  */
  select (target, x, y) {
    curtext = target;
    textActions.toEditMode(x, y);
  },
  /**
  * @param {Element} elem
  * @returns {undefined}
  */
  start (elem) {
    curtext = elem;
    textActions.toEditMode();
  },
  /**
  * @param {external:MouseEvent} evt
  * @param {Element} mouseTarget
  * @param {Float} startX
  * @param {Float} startY
  * @returns {undefined}
  */
  mouseDown (evt, mouseTarget, startX, startY) {
    const pt = screenToPt(startX, startY);

    textinput.focus();
    setCursorFromPoint(pt.x, pt.y);
    lastX = startX;
    lastY = startY;

    // TODO: Find way to block native selection
  },
  /**
  * @param {Float} mouseX
  * @param {Float} mouseY
  * @returns {undefined}
  */
  mouseMove (mouseX, mouseY) {
    const pt = screenToPt(mouseX, mouseY);
    setEndSelectionFromPoint(pt.x, pt.y);
  },
  /**
  * @param {external:MouseEvent}
  * @param {Float} mouseX
  * @param {Float} mouseY
  * @returns {undefined}
  */
  mouseUp (evt, mouseX, mouseY) {
    const pt = screenToPt(mouseX, mouseY);

    setEndSelectionFromPoint(pt.x, pt.y, true);

    // TODO: Find a way to make this work: Use transformed BBox instead of evt.target
    // if (lastX === mouseX && lastY === mouseY
    //   && !rectsIntersect(transbb, {x: pt.x, y: pt.y, width: 0, height: 0})) {
    //   textActions.toSelectMode(true);
    // }

    if (
      evt.target !== curtext &&
      mouseX < lastX + 2 &&
      mouseX > lastX - 2 &&
      mouseY < lastY + 2 &&
      mouseY > lastY - 2
    ) {
      textActions.toSelectMode(true);
    }
  },
  /**
  * @function
  * @param {Integer} index
  * @returns {undefined}
  */
  setCursor,
  /**
  * @param {Float} x
  * @param {Float} y
  * @returns {undefined}
  */
  toEditMode (x, y) {
    allowDbl = false;
    currentMode = 'textedit';
    selectorManager.requestSelector(curtext).showGrips(false);
    // Make selector group accept clicks
    /* const selector = */ selectorManager.requestSelector(curtext); // Do we need this? Has side effect of setting lock, so keeping for now, but next line wasn't being used
    // const sel = selector.selectorRect;

    textActions.init();

    $(curtext).css('cursor', 'text');

    // if (supportsEditableText()) {
    //   curtext.setAttribute('editable', 'simple');
    //   return;
    // }

    if (!arguments.length) {
      setCursor();
    } else {
      const pt = screenToPt(x, y);
      setCursorFromPoint(pt.x, pt.y);
    }

    setTimeout(function () {
      allowDbl = true;
    }, 300);
  },
  /**
  * @param {boolean|Element} selectElem
  * @fires module:svgcanvas.SvgCanvas#event:selected
  * @returns {undefined}
  */
  toSelectMode (selectElem) {
    currentMode = 'select';
    clearInterval(blinker);
    blinker = null;
    if (selblock) { $(selblock).attr('display', 'none'); }
    if (cursor) { $(cursor).attr('visibility', 'hidden'); }
    $(curtext).css('cursor', 'move');

    if (selectElem) {
      clearSelection();
      $(curtext).css('cursor', 'move');

      call('selected', [curtext]);
      addToSelection([curtext], true);
    }
    if (curtext && !curtext.textContent.length) {
      // No content, so delete
      canvas.deleteSelectedElements();
    }

    $(textinput).blur();

    curtext = false;

    // if (supportsEditableText()) {
    //   curtext.removeAttribute('editable');
    // }
  },
  /**
  * @param {Element} elem
  * @returns {undefined}
  */
  setInputElem (elem) {
    textinput = elem;
    // $(textinput).blur(hideCursor);
  },
  /**
  * @returns {undefined}
  */
  clear () {
    if (currentMode === 'textedit') {
      textActions.toSelectMode();
    }
  },
  /**
  * @param {Element} inputElem Not in use
  * @returns {undefined}
  */
  init (inputElem) {
    if (!curtext) { return; }
    let i, end;
    // if (supportsEditableText()) {
    //   curtext.select();
    //   return;
    // }

    if (!curtext.parentNode) {
      // Result of the ffClone, need to get correct element
      curtext = selectedElements[0];
      selectorManager.requestSelector(curtext).showGrips(false);
    }

    const str = curtext.textContent;
    const len = str.length;

    const xform = curtext.getAttribute('transform');

    textbb = utilsGetBBox(curtext);

    matrix = xform ? getMatrix(curtext) : null;

    chardata = [];
    chardata.length = len;
    textinput.focus();

    $(curtext).unbind('dblclick', selectWord).dblclick(selectWord);

    if (!len) {
      end = {x: textbb.x + (textbb.width / 2), width: 0};
    }

    for (i = 0; i < len; i++) {
      const start = curtext.getStartPositionOfChar(i);
      end = curtext.getEndPositionOfChar(i);

      if (!supportsGoodTextCharPos()) {
        const offset = canvas.contentW * currentZoom;
        start.x -= offset;
        end.x -= offset;

        start.x /= currentZoom;
        end.x /= currentZoom;
      }

      // Get a "bbox" equivalent for each character. Uses the
      // bbox data of the actual text for y, height purposes

      // TODO: Decide if y, width and height are actually necessary
      chardata[i] = {
        x: start.x,
        y: textbb.y, // start.y?
        width: end.x - start.x,
        height: textbb.height
      };
    }

    // Add a last bbox for cursor at end of text
    chardata.push({
      x: end.x,
      width: 0
    });
    setSelection(textinput.selectionStart, textinput.selectionEnd, true);
  }
};
}());

/**
* Group: Serialization
*/

/**
* Looks at DOM elements inside the `<defs>` to see if they are referred to,
* removes them from the DOM if they are not.
* @function module:svgcanvas.SvgCanvas#removeUnusedDefElems
* @returns {Integer} The number of elements that were removed
*/
const removeUnusedDefElems = this.removeUnusedDefElems = function () {
  const defs = svgcontent.getElementsByTagNameNS(NS.SVG, 'defs');
  if (!defs || !defs.length) { return 0; }

  // if (!defs.firstChild) { return; }

  const defelemUses = [];
  let numRemoved = 0;
  const attrs = ['fill', 'stroke', 'filter', 'marker-start', 'marker-mid', 'marker-end'];
  const alen = attrs.length;

  const allEls = svgcontent.getElementsByTagNameNS(NS.SVG, '*');
  const allLen = allEls.length;

  let i, j;
  for (i = 0; i < allLen; i++) {
    const el = allEls[i];
    for (j = 0; j < alen; j++) {
      const ref = getUrlFromAttr(el.getAttribute(attrs[j]));
      if (ref) {
        defelemUses.push(ref.substr(1));
      }
    }

    // gradients can refer to other gradients
    const href = getHref(el);
    if (href && href.startsWith('#')) {
      defelemUses.push(href.substr(1));
    }
  }

  const defelems = $(defs).find('linearGradient, radialGradient, filter, marker, svg, symbol');
  i = defelems.length;
  while (i--) {
    const defelem = defelems[i];
    const {id} = defelem;
    if (!defelemUses.includes(id)) {
      // Not found, so remove (but remember)
      removedElements[id] = defelem;
      defelem.remove();
      numRemoved++;
    }
  }

  return numRemoved;
};

/**
* Main function to set up the SVG content for output
* @function module:svgcanvas.SvgCanvas#svgCanvasToString
* @returns {string} The SVG image for output
*/
this.svgCanvasToString = function () {
  // keep calling it until there are none to remove
  while (removeUnusedDefElems() > 0) {}

  pathActions.clear(true);

  // Keep SVG-Edit comment on top
  $.each(svgcontent.childNodes, function (i, node) {
    if (i && node.nodeType === 8 && node.data.includes('Created with')) {
      svgcontent.firstChild.before(node);
    }
  });

  // Move out of in-group editing mode
  if (currentGroup) {
    draw.leaveContext();
    selectOnly([currentGroup]);
  }

  const nakedSvgs = [];

  // Unwrap gsvg if it has no special attributes (only id and style)
  $(svgcontent).find('g:data(gsvg)').each(function () {
    const attrs = this.attributes;
    let len = attrs.length;
    for (let i = 0; i < len; i++) {
      if (attrs[i].nodeName === 'id' || attrs[i].nodeName === 'style') {
        len--;
      }
    }
    // No significant attributes, so ungroup
    if (len <= 0) {
      const svg = this.firstChild;
      nakedSvgs.push(svg);
      $(this).replaceWith(svg);
    }
  });
  const output = this.svgToString(svgcontent, 0);

  // Rewrap gsvg
  if (nakedSvgs.length) {
    $(nakedSvgs).each(function () {
      groupSvgElem(this);
    });
  }

  return output;
};

/**
* Sub function ran on each SVG element to convert it to a string as desired
* @function module:svgcanvas.SvgCanvas#svgToString
* @param {Element} elem - The SVG element to convert
* @param {Integer} indent - Number of spaces to indent this tag
* @returns {string} The given element as an SVG tag
*/
this.svgToString = function (elem, indent) {
  const out = [];
  const unit = curConfig.baseUnit;
  const unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$');

  if (elem) {
    cleanupElement(elem);
    const attrs = Array.from(elem.attributes);
    let i;
    const childs = elem.childNodes;
    attrs.sort((a, b) => a.name > b.name ? -1 : 1);

    for (i = 0; i < indent; i++) { out.push(' '); }
    out.push('<'); out.push(elem.nodeName);
    if (elem.id === 'svgcontent') {
      // Process root element separately
      const res = getResolution();

      const vb = '';
      // TODO: Allow this by dividing all values by current baseVal
      // Note that this also means we should properly deal with this on import
      // if (curConfig.baseUnit !== 'px') {
      //   const unit = curConfig.baseUnit;
      //   const unitM = getTypeMap()[unit];
      //   res.w = shortFloat(res.w / unitM);
      //   res.h = shortFloat(res.h / unitM);
      //   vb = ' viewBox="' + [0, 0, res.w, res.h].join(' ') + '"';
      //   res.w += unit;
      //   res.h += unit;
      // }

      if (unit !== 'px') {
        res.w = convertUnit(res.w, unit) + unit;
        res.h = convertUnit(res.h, unit) + unit;
      }

      out.push(' width="' + res.w + '" height="' + res.h + '"' + vb + ' xmlns="' + NS.SVG + '"');

      const nsuris = {};

      // Check elements for namespaces, add if found
      $(elem).find('*').andSelf().each(function () {
        // const el = this;
        // for some elements have no attribute
        const uri = this.namespaceURI;
        if (uri && !nsuris[uri] && nsMap[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
          nsuris[uri] = true;
          out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
        }

        $.each(this.attributes, function (i, attr) {
          const uri = attr.namespaceURI;
          if (uri && !nsuris[uri] && nsMap[uri] !== 'xmlns' && nsMap[uri] !== 'xml') {
            nsuris[uri] = true;
            out.push(' xmlns:' + nsMap[uri] + '="' + uri + '"');
          }
        });
      });

      i = attrs.length;
      const attrNames = ['width', 'height', 'xmlns', 'x', 'y', 'viewBox', 'id', 'overflow'];
      while (i--) {
        const attr = attrs[i];
        const attrVal = toXml(attr.value);

        // Namespaces have already been dealt with, so skip
        if (attr.nodeName.startsWith('xmlns:')) { continue; }

        // only serialize attributes we don't use internally
        if (attrVal !== '' && !attrNames.includes(attr.localName)) {
          if (!attr.namespaceURI || nsMap[attr.namespaceURI]) {
            out.push(' ');
            out.push(attr.nodeName); out.push('="');
            out.push(attrVal); out.push('"');
          }
        }
      }
    } else {
      // Skip empty defs
      if (elem.nodeName === 'defs' && !elem.firstChild) { return; }

      const mozAttrs = ['-moz-math-font-style', '_moz-math-font-style'];
      for (i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        let attrVal = toXml(attr.value);
        // remove bogus attributes added by Gecko
        if (mozAttrs.includes(attr.localName)) { continue; }
        if (attrVal !== '') {
          if (attrVal.startsWith('pointer-events')) { continue; }
          if (attr.localName === 'class' && attrVal.startsWith('se_')) { continue; }
          out.push(' ');
          if (attr.localName === 'd') { attrVal = pathActions.convertPath(elem, true); }
          if (!isNaN(attrVal)) {
            attrVal = shortFloat(attrVal);
          } else if (unitRe.test(attrVal)) {
            attrVal = shortFloat(attrVal) + unit;
          }

          // Embed images when saving
          if (saveOptions.apply &&
            elem.nodeName === 'image' &&
            attr.localName === 'href' &&
            saveOptions.images &&
            saveOptions.images === 'embed'
          ) {
            const img = encodableImages[attrVal];
            if (img) { attrVal = img; }
          }

          // map various namespaces to our fixed namespace prefixes
          // (the default xmlns attribute itself does not get a prefix)
          if (!attr.namespaceURI || attr.namespaceURI === NS.SVG || nsMap[attr.namespaceURI]) {
            out.push(attr.nodeName); out.push('="');
            out.push(attrVal); out.push('"');
          }
        }
      }
    }

    if (elem.hasChildNodes()) {
      out.push('>');
      indent++;
      let bOneLine = false;

      for (i = 0; i < childs.length; i++) {
        const child = childs.item(i);
        switch (child.nodeType) {
        case 1: // element node
          out.push('\n');
          out.push(this.svgToString(childs.item(i), indent));
          break;
        case 3: // text node
          const str = child.nodeValue.replace(/^\s+|\s+$/g, '');
          if (str !== '') {
            bOneLine = true;
            out.push(String(toXml(str)));
          }
          break;
        case 4: // cdata node
          out.push('\n');
          out.push(new Array(indent + 1).join(' '));
          out.push('<![CDATA[');
          out.push(child.nodeValue);
          out.push(']]>');
          break;
        case 8: // comment
          out.push('\n');
          out.push(new Array(indent + 1).join(' '));
          out.push('<!--');
          out.push(child.data);
          out.push('-->');
          break;
        } // switch on node type
      }
      indent--;
      if (!bOneLine) {
        out.push('\n');
        for (i = 0; i < indent; i++) { out.push(' '); }
      }
      out.push('</'); out.push(elem.nodeName); out.push('>');
    } else {
      out.push('/>');
    }
  }
  return out.join('');
}; // end svgToString()

/**
 * Function to run when image data is found
 * @callback module:svgcanvas.ImageEmbeddedCallback
 * @param {string|false} result Data URL
 * @returns {undefined}
 */
/**
* Converts a given image file to a data URL when possible, then runs a given callback
* @function module:svgcanvas.SvgCanvas#embedImage
* @param {string} src - The path/URL of the image
* @param {module:svgcanvas.ImageEmbeddedCallback} [callback] - Function to run when image data is found
* @returns {Promise} Resolves to Data URL (string|false)
*/
this.embedImage = function (src, callback) {
  return new Promise(function (resolve, reject) {
    // load in the image and once it's loaded, get the dimensions
    $(new Image()).load(function (response, status, xhr) {
      if (status === 'error') {
        reject(new Error('Error loading image: ' + xhr.status + ' ' + xhr.statusText));
        return;
      }
      // create a canvas the same size as the raster image
      const cvs = document.createElement('canvas');
      cvs.width = this.width;
      cvs.height = this.height;
      // load the raster image into the canvas
      cvs.getContext('2d').drawImage(this, 0, 0);
      // retrieve the data: URL
      try {
        let urldata = ';svgedit_url=' + encodeURIComponent(src);
        urldata = cvs.toDataURL().replace(';base64', urldata + ';base64');
        encodableImages[src] = urldata;
      } catch (e) {
        encodableImages[src] = false;
      }
      lastGoodImgUrl = src;
      if (callback) { callback(encodableImages[src]); }
      resolve(encodableImages[src]);
    }).attr('src', src);
  });
};

/**
* Sets a given URL to be a "last good image" URL
* @function module:svgcanvas.SvgCanvas#setGoodImage
* @param {string} val
* @returns {undefined}
*/
this.setGoodImage = function (val) {
  lastGoodImgUrl = val;
};

/**
* Does nothing by default, handled by optional widget/extension
* @function module:svgcanvas.SvgCanvas#open
* @returns {undefined}
*/
this.open = function () {
};

/**
* Serializes the current drawing into SVG XML text and passes it to the 'saved' handler.
* This function also includes the XML prolog. Clients of the `SvgCanvas` bind their save
* function to the 'saved' event.
* @function module:svgcanvas.SvgCanvas#save
* @param {module:svgcanvas.SaveOptions} opts
* @fires module:svgcanvas.SvgCanvas#event:saved
* @returns {undefined}
*/
this.save = function (opts) {
  // remove the selected outline before serializing
  clearSelection();
  // Update save options if provided
  if (opts) { $.extend(saveOptions, opts); }
  saveOptions.apply = true;

  // no need for doctype, see https://jwatt.org/svg/authoring/#doctype-declaration
  const str = this.svgCanvasToString();
  call('saved', str);
};

/**
* Codes only is useful for locale-independent detection
*/
function getIssues () {
  // remove the selected outline before serializing
  clearSelection();

  // Check for known CanVG issues
  const issues = [];
  const issueCodes = [];

  // Selector and notice
  const issueList = {
    feGaussianBlur: uiStrings.exportNoBlur,
    foreignObject: uiStrings.exportNoforeignObject,
    '[stroke-dasharray]': uiStrings.exportNoDashArray
  };
  const content = $(svgcontent);

  // Add font/text check if Canvas Text API is not implemented
  if (!('font' in $('<canvas>')[0].getContext('2d'))) {
    issueList.text = uiStrings.exportNoText;
  }

  $.each(issueList, function (sel, descr) {
    if (content.find(sel).length) {
      issueCodes.push(sel);
      issues.push(descr);
    }
  });
  return {issues, issueCodes};
}

let canvg;
/**
* @typedef {"feGaussianBlur"|"foreignObject"|"[stroke-dasharray]"|"text"} module:svgcanvas.IssueCode
*/
/**
* @typedef {PlainObject} module:svgcanvas.ImageExportedResults
* @property {string} datauri Contents as a Data URL
* @property {string} bloburl May be the empty string
* @property {string} svg The SVG contents as a string
* @property {string[]} issues The localization messages of `issueCodes`
* @property {module:svgcanvas.IssueCode[]} issueCodes CanVG issues found with the SVG
* @property {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} type The chosen image type
* @property {"image/png"|"image/jpeg"|"image/bmp"|"image/webp"} mimeType The image MIME type
* @property {Float} quality A decimal between 0 and 1 (for use with JPEG or WEBP)
* @property {string} exportWindowName A convenience for passing along a `window.name` to target a window on which the export could be added
*/

/**
 * Function to run when image data is found
 * @callback module:svgcanvas.ImageExportedCallback
 * @param {module:svgcanvas.ImageExportedResults} obj
 * @returns {undefined}
 */
/**
* Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image,
* then calls "exported" with an object including the string, image
* information, and any issues found
* @function module:svgcanvas.SvgCanvas#rasterExport
* @param {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} [imgType="PNG"]
* @param {Float} [quality] Between 0 and 1
* @param {string} [exportWindowName]
* @param {module:svgcanvas.ImageExportedCallback} [cb]
* @fires module:svgcanvas.SvgCanvas#event:exported
* @todo Confirm/fix ICO type
* @returns {Promise} Resolves to {@link module:svgcanvas.ImageExportedResults}
*/
this.rasterExport = function (imgType, quality, exportWindowName, cb) {
  const type = imgType === 'ICO' ? 'BMP' : (imgType || 'PNG');
  const mimeType = 'image/' + type.toLowerCase();
  const {issues, issueCodes} = getIssues();
  const svg = this.svgCanvasToString();

  return new Promise(async (resolve, reject) => {
    if (!canvg) {
      ({canvg} = await importSetGlobal(curConfig.canvgPath + 'canvg.js', {
        global: 'canvg'
      }));
    }
    if (!$('#export_canvas').length) {
      $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
    }
    const c = $('#export_canvas')[0];
    c.width = canvas.contentW;
    c.height = canvas.contentH;

    await canvg(c, svg);
    const dataURLType = type.toLowerCase();
    const datauri = quality
      ? c.toDataURL('image/' + dataURLType, quality)
      : c.toDataURL('image/' + dataURLType);
    let bloburl;
    function done () {
      const obj = {
        datauri, bloburl, svg, issues, issueCodes, type: imgType,
        mimeType, quality, exportWindowName
      };
      call('exported', obj);
      if (cb) {
        cb(obj);
      }
      resolve(obj);
    }
    if (c.toBlob) {
      c.toBlob((blob) => {
        bloburl = createObjectURL(blob);
        done();
      }, mimeType, quality);
      return;
    }
    bloburl = dataURLToObjectURL(datauri);
    done();
  });
};
/**
 * @external jsPDF
 */
/**
 * @typedef {undefined|"save"|"arraybuffer"|"blob"|"datauristring"|"dataurlstring"|"dataurlnewwindow"|"datauri"|"dataurl"} external:jsPDF.OutputType
 * @todo Newer version to add also allows these `outputType` values "bloburi"|"bloburl" which return strings, so document here and for `outputType` of `module:svgcanvas.PDFExportedResults` below if added
*/
/**
* @typedef {PlainObject} module:svgcanvas.PDFExportedResults
* @property {string} svg The SVG PDF output
* @property {string|ArrayBuffer|Blob|window} output The output based on the `outputType`;
* if `undefined`, "datauristring", "dataurlstring", "datauri",
* or "dataurl", will be a string (`undefined` gives a document, while the others
* build as Data URLs; "datauri" and "dataurl" change the location of the current page); if
* "arraybuffer", will return `ArrayBuffer`; if "blob", returns a `Blob`;
* if "dataurlnewwindow", will change the current page's location and return a string
* if in Safari and no window object is found; otherwise opens in, and returns, a new `window`
* object; if "save", will have the same return as "dataurlnewwindow" if
* `navigator.getUserMedia` support is found without `URL.createObjectURL` support; otherwise
* returns `undefined` but attempts to save
* @property {external:jsPDF.OutputType} outputType
* @property {string[]} issues The human-readable localization messages of corresponding `issueCodes`
* @property {module:svgcanvas.IssueCode[]} issueCodes
* @property {string} exportWindowName
*/

/**
 * Function to run when PDF data is found
 * @callback module:svgcanvas.PDFExportedCallback
 * @param {module:svgcanvas.PDFExportedResults} obj
 * @returns {undefined}
 */
/**
* Generates a PDF based on the current image, then calls "exportedPDF" with
* an object including the string, the data URL, and any issues found
* @function module:svgcanvas.SvgCanvas#exportPDF
* @param {string} exportWindowName Will also be used for the download file name here
* @param {external:jsPDF.OutputType} [outputType="dataurlstring"]
* @param {module:svgcanvas.PDFExportedCallback} cb
* @fires module:svgcanvas.SvgCanvas#event:exportedPDF
* @returns {Promise} Resolves to {@link module:svgcanvas.PDFExportedResults}
*/
this.exportPDF = function (exportWindowName, outputType, cb) {
  const that = this;
  return new Promise(async (resolve, reject) => {
    if (!window.jsPDF) {
      // Todo: Switch to `import()` when widely supported and available (also allow customization of path)
      await importScript([
        // We do not currently have these paths configurable as they are
        //   currently global-only, so not Rolled-up
        'jspdf/underscore-min.js',
        'jspdf/jspdf.min.js'
      ]);

      const modularVersion = !('svgEditor' in window) ||
        !window.svgEditor ||
        window.svgEditor.modules !== false;
      // Todo: Switch to `import()` when widely supported and available (also allow customization of path)
      await importScript(curConfig.jspdfPath + 'jspdf.plugin.svgToPdf.js', {
        type: modularVersion
          ? 'module'
          : 'text/javascript'
      });
      // await importModule('jspdf/jspdf.plugin.svgToPdf.js');
    }

    const res = getResolution();
    const orientation = res.w > res.h ? 'landscape' : 'portrait';
    const unit = 'pt'; // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for export purposes

    // Todo: Give options to use predefined jsPDF formats like "a4", etc. from pull-down (with option to keep customizable)
    const doc = jsPDF({
      orientation,
      unit,
      format: [res.w, res.h]
      // , compressPdf: true
    });
    const docTitle = getDocumentTitle();
    doc.setProperties({
      title: docTitle /* ,
      subject: '',
      author: '',
      keywords: '',
      creator: '' */
    });
    const {issues, issueCodes} = getIssues();
    const svg = that.svgCanvasToString();
    doc.addSVG(svg, 0, 0);

    // doc.output('save'); // Works to open in a new
    //  window; todo: configure this and other export
    //  options to optionally work in this manner as
    //  opposed to opening a new tab
    outputType = outputType || 'dataurlstring';
    const obj = {svg, issues, issueCodes, exportWindowName, outputType};
    obj.output = doc.output(outputType, outputType === 'save' ? (exportWindowName || 'svg.pdf') : undefined);
    if (cb) {
      cb(obj);
    }
    resolve(obj);
    call('exportedPDF', obj);
  });
};

/**
* Returns the current drawing as raw SVG XML text.
* @function module:svgcanvas.SvgCanvas#getSvgString
* @returns {string} The current drawing as raw SVG XML text.
*/
this.getSvgString = function () {
  saveOptions.apply = false;
  return this.svgCanvasToString();
};

/**
* This function determines whether to use a nonce in the prefix, when
* generating IDs for future documents in SVG-Edit.
* If you're controlling SVG-Edit externally, and want randomized IDs, call
* this BEFORE calling svgCanvas.setSvgString
* @function module:svgcanvas.SvgCanvas#randomizeIds
* @param {boolean} [enableRandomization] If true, adds a nonce to the prefix. Thus
* `svgCanvas.randomizeIds() <==> svgCanvas.randomizeIds(true)`
* @returns {undefined}
*/
this.randomizeIds = function (enableRandomization) {
  if (arguments.length > 0 && enableRandomization === false) {
    draw.randomizeIds(false, getCurrentDrawing());
  } else {
    draw.randomizeIds(true, getCurrentDrawing());
  }
};

/**
* Ensure each element has a unique ID
* @function module:svgcanvas.SvgCanvas#uniquifyElems
* @param {Element} g - The parent element of the tree to give unique IDs
* @returns {undefined}
*/
const uniquifyElems = this.uniquifyElems = function (g) {
  const ids = {};
  // TODO: Handle markers and connectors. These are not yet re-identified properly
  // as their referring elements do not get remapped.
  //
  // <marker id='se_marker_end_svg_7'/>
  // <polyline id='svg_7' se:connector='svg_1 svg_6' marker-end='url(#se_marker_end_svg_7)'/>
  //
  // Problem #1: if svg_1 gets renamed, we do not update the polyline's se:connector attribute
  // Problem #2: if the polyline svg_7 gets renamed, we do not update the marker id nor the polyline's marker-end attribute
  const refElems = ['filter', 'linearGradient', 'pattern', 'radialGradient', 'symbol', 'textPath', 'use'];

  walkTree(g, function (n) {
    // if it's an element node
    if (n.nodeType === 1) {
      // and the element has an ID
      if (n.id) {
        // and we haven't tracked this ID yet
        if (!(n.id in ids)) {
          // add this id to our map
          ids[n.id] = {elem: null, attrs: [], hrefs: []};
        }
        ids[n.id].elem = n;
      }

      // now search for all attributes on this element that might refer
      // to other elements
      $.each(refAttrs, function (i, attr) {
        const attrnode = n.getAttributeNode(attr);
        if (attrnode) {
          // the incoming file has been sanitized, so we should be able to safely just strip off the leading #
          const url = getUrlFromAttr(attrnode.value),
            refid = url ? url.substr(1) : null;
          if (refid) {
            if (!(refid in ids)) {
              // add this id to our map
              ids[refid] = {elem: null, attrs: [], hrefs: []};
            }
            ids[refid].attrs.push(attrnode);
          }
        }
      });

      // check xlink:href now
      const href = getHref(n);
      // TODO: what if an <image> or <a> element refers to an element internally?
      if (href && refElems.includes(n.nodeName)) {
        const refid = href.substr(1);
        if (refid) {
          if (!(refid in ids)) {
            // add this id to our map
            ids[refid] = {elem: null, attrs: [], hrefs: []};
          }
          ids[refid].hrefs.push(n);
        }
      }
    }
  });

  // in ids, we now have a map of ids, elements and attributes, let's re-identify
  for (const oldid in ids) {
    if (!oldid) { continue; }
    const {elem} = ids[oldid];
    if (elem) {
      const newid = getNextId();

      // assign element its new id
      elem.id = newid;

      // remap all url() attributes
      const {attrs} = ids[oldid];
      let j = attrs.length;
      while (j--) {
        const attr = attrs[j];
        attr.ownerElement.setAttribute(attr.name, 'url(#' + newid + ')');
      }

      // remap all href attributes
      const hreffers = ids[oldid].hrefs;
      let k = hreffers.length;
      while (k--) {
        const hreffer = hreffers[k];
        setHref(hreffer, '#' + newid);
      }
    }
  }
};

/**
* Assigns reference data for each use element
* @function module:svgcanvas.SvgCanvas#setUseData
* @param {Element} parent
* @returns {undefined}
*/
const setUseData = this.setUseData = function (parent) {
  let elems = $(parent);

  if (parent.tagName !== 'use') {
    elems = elems.find('use');
  }

  elems.each(function () {
    const id = getHref(this).substr(1);
    const refElem = getElem(id);
    if (!refElem) { return; }
    $(this).data('ref', refElem);
    if (refElem.tagName === 'symbol' || refElem.tagName === 'svg') {
      $(this).data('symbol', refElem).data('ref', refElem);
    }
  });
};

/**
* Converts gradients from userSpaceOnUse to objectBoundingBox
* @function module:svgcanvas.SvgCanvas#convertGradients
* @param {Element} elem
* @returns {undefined}
*/
const convertGradients = this.convertGradients = function (elem) {
  let elems = $(elem).find('linearGradient, radialGradient');
  if (!elems.length && isWebkit()) {
    // Bug in webkit prevents regular *Gradient selector search
    elems = $(elem).find('*').filter(function () {
      return (this.tagName.includes('Gradient'));
    });
  }

  elems.each(function () {
    const grad = this;
    if ($(grad).attr('gradientUnits') === 'userSpaceOnUse') {
      // TODO: Support more than one element with this ref by duplicating parent grad
      const elems = $(svgcontent).find('[fill="url(#' + grad.id + ')"],[stroke="url(#' + grad.id + ')"]');
      if (!elems.length) { return; }

      // get object's bounding box
      const bb = utilsGetBBox(elems[0]);

      // This will occur if the element is inside a <defs> or a <symbol>,
      // in which we shouldn't need to convert anyway.
      if (!bb) { return; }

      if (grad.tagName === 'linearGradient') {
        const gCoords = $(grad).attr(['x1', 'y1', 'x2', 'y2']);

        // If has transform, convert
        const tlist = grad.gradientTransform.baseVal;
        if (tlist && tlist.numberOfItems > 0) {
          const m = transformListToTransform(tlist).matrix;
          const pt1 = transformPoint(gCoords.x1, gCoords.y1, m);
          const pt2 = transformPoint(gCoords.x2, gCoords.y2, m);

          gCoords.x1 = pt1.x;
          gCoords.y1 = pt1.y;
          gCoords.x2 = pt2.x;
          gCoords.y2 = pt2.y;
          grad.removeAttribute('gradientTransform');
        }

        $(grad).attr({
          x1: (gCoords.x1 - bb.x) / bb.width,
          y1: (gCoords.y1 - bb.y) / bb.height,
          x2: (gCoords.x2 - bb.x) / bb.width,
          y2: (gCoords.y2 - bb.y) / bb.height
        });
        grad.removeAttribute('gradientUnits');
      }
      // else {
      //   Note: radialGradient elements cannot be easily converted
      //   because userSpaceOnUse will keep circular gradients, while
      //   objectBoundingBox will x/y scale the gradient according to
      //   its bbox.
      //
      //   For now we'll do nothing, though we should probably have
      //   the gradient be updated as the element is moved, as
      //   inkscape/illustrator do.
      //
      //   const gCoords = $(grad).attr(['cx', 'cy', 'r']);
      //
      //   $(grad).attr({
      //     cx: (gCoords.cx - bb.x) / bb.width,
      //     cy: (gCoords.cy - bb.y) / bb.height,
      //     r: gCoords.r
      //   });
      //
      //   grad.removeAttribute('gradientUnits');
      // }
    }
  });
};

/**
* Converts selected/given `<use>` or child SVG element to a group
* @function module:svgcanvas.SvgCanvas#convertToGroup
* @param {Element} elem
* @fires module:svgcanvas.SvgCanvas#event:selected
* @returns {undefined}
*/
const convertToGroup = this.convertToGroup = function (elem) {
  if (!elem) {
    elem = selectedElements[0];
  }
  const $elem = $(elem);
  const batchCmd = new BatchCommand();
  let ts;

  if ($elem.data('gsvg')) {
    // Use the gsvg as the new group
    const svg = elem.firstChild;
    const pt = $(svg).attr(['x', 'y']);

    $(elem.firstChild.firstChild).unwrap();
    $(elem).removeData('gsvg');

    const tlist = getTransformList(elem);
    const xform = svgroot.createSVGTransform();
    xform.setTranslate(pt.x, pt.y);
    tlist.appendItem(xform);
    recalculateDimensions(elem);
    call('selected', [elem]);
  } else if ($elem.data('symbol')) {
    elem = $elem.data('symbol');

    ts = $elem.attr('transform');
    const pos = $elem.attr(['x', 'y']);

    const vb = elem.getAttribute('viewBox');

    if (vb) {
      const nums = vb.split(' ');
      pos.x -= +nums[0];
      pos.y -= +nums[1];
    }

    // Not ideal, but works
    ts += ' translate(' + (pos.x || 0) + ',' + (pos.y || 0) + ')';

    const prev = $elem.prev();

    // Remove <use> element
    batchCmd.addSubCommand(new RemoveElementCommand($elem[0], $elem[0].nextSibling, $elem[0].parentNode));
    $elem.remove();

    // See if other elements reference this symbol
    const hasMore = $(svgcontent).find('use:data(symbol)').length;

    const g = svgdoc.createElementNS(NS.SVG, 'g');
    const childs = elem.childNodes;

    let i;
    for (i = 0; i < childs.length; i++) {
      g.append(childs[i].cloneNode(true));
    }

    // Duplicate the gradients for Gecko, since they weren't included in the <symbol>
    if (isGecko()) {
      const dupeGrads = $(findDefs()).children('linearGradient,radialGradient,pattern').clone();
      $(g).append(dupeGrads);
    }

    if (ts) {
      g.setAttribute('transform', ts);
    }

    const parent = elem.parentNode;

    uniquifyElems(g);

    // Put the dupe gradients back into <defs> (after uniquifying them)
    if (isGecko()) {
      $(findDefs()).append($(g).find('linearGradient,radialGradient,pattern'));
    }

    // now give the g itself a new id
    g.id = getNextId();

    prev.after(g);

    if (parent) {
      if (!hasMore) {
        // remove symbol/svg element
        const {nextSibling} = elem;
        elem.remove();
        batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
      }
      batchCmd.addSubCommand(new InsertElementCommand(g));
    }

    setUseData(g);

    if (isGecko()) {
      convertGradients(findDefs());
    } else {
      convertGradients(g);
    }

    // recalculate dimensions on the top-level children so that unnecessary transforms
    // are removed
    walkTreePost(g, function (n) {
      try {
        recalculateDimensions(n);
      } catch (e) {
        console.log(e);
      }
    });

    // Give ID for any visible element missing one
    $(g).find(visElems).each(function () {
      if (!this.id) { this.id = getNextId(); }
    });

    selectOnly([g]);

    const cm = pushGroupProperties(g, true);
    if (cm) {
      batchCmd.addSubCommand(cm);
    }

    addCommandToHistory(batchCmd);
  } else {
    console.log('Unexpected element to ungroup:', elem);
  }
};

/**
* This function sets the current drawing as the input SVG XML.
* @function module:svgcanvas.SvgCanvas#setSvgString
* @param {string} xmlString - The SVG as XML text.
* @param {boolean} [preventUndo=false] - Indicates if we want to do the
* changes without adding them to the undo stack - e.g. for initializing a
* drawing on page load.
* @fires module:svgcanvas.SvgCanvas#event:setnonce
* @fires module:svgcanvas.SvgCanvas#event:unsetnonce
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} This function returns `false` if the set was
*     unsuccessful, `true` otherwise.
*/
this.setSvgString = function (xmlString, preventUndo) {
  try {
    // convert string into XML document
    const newDoc = text2xml(xmlString);
    if (newDoc.firstElementChild &&
      newDoc.firstElementChild.namespaceURI !== NS.SVG) {
      return false;
    }

    this.prepareSvg(newDoc);

    const batchCmd = new BatchCommand('Change Source');

    // remove old svg document
    const {nextSibling} = svgcontent;
    const oldzoom = svgroot.removeChild(svgcontent);
    batchCmd.addSubCommand(new RemoveElementCommand(oldzoom, nextSibling, svgroot));

    // set new svg document
    // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
    if (svgdoc.adoptNode) {
      svgcontent = svgdoc.adoptNode(newDoc.documentElement);
    } else {
      svgcontent = svgdoc.importNode(newDoc.documentElement, true);
    }

    svgroot.append(svgcontent);
    const content = $(svgcontent);

    canvas.current_drawing_ = new draw.Drawing(svgcontent, idprefix);

    // retrieve or set the nonce
    const nonce = getCurrentDrawing().getNonce();
    if (nonce) {
      call('setnonce', nonce);
    } else {
      call('unsetnonce');
    }

    // change image href vals if possible
    content.find('image').each(function () {
      const image = this;
      preventClickDefault(image);
      const val = getHref(this);
      if (val) {
        if (val.startsWith('data:')) {
          // Check if an SVG-edit data URI
          const m = val.match(/svgedit_url=(.*?);/);
          if (m) {
            const url = decodeURIComponent(m[1]);
            $(new Image()).load(function () {
              image.setAttributeNS(NS.XLINK, 'xlink:href', url);
            }).attr('src', url);
          }
        }
        // Add to encodableImages if it loads
        canvas.embedImage(val);
      }
    });

    // Wrap child SVGs in group elements
    content.find('svg').each(function () {
      // Skip if it's in a <defs>
      if ($(this).closest('defs').length) { return; }

      uniquifyElems(this);

      // Check if it already has a gsvg group
      const pa = this.parentNode;
      if (pa.childNodes.length === 1 && pa.nodeName === 'g') {
        $(pa).data('gsvg', this);
        pa.id = pa.id || getNextId();
      } else {
        groupSvgElem(this);
      }
    });

    // For Firefox: Put all paint elems in defs
    if (isGecko()) {
      content.find('linearGradient, radialGradient, pattern').appendTo(findDefs());
    }

    // Set ref element for <use> elements

    // TODO: This should also be done if the object is re-added through "redo"
    setUseData(content);

    convertGradients(content[0]);

    const attrs = {
      id: 'svgcontent',
      overflow: curConfig.show_outside_canvas ? 'visible' : 'hidden'
    };

    let percs = false;

    // determine proper size
    if (content.attr('viewBox')) {
      const vb = content.attr('viewBox').split(' ');
      attrs.width = vb[2];
      attrs.height = vb[3];
    // handle content that doesn't have a viewBox
    } else {
      $.each(['width', 'height'], function (i, dim) {
        // Set to 100 if not given
        const val = content.attr(dim) || '100%';

        if (String(val).substr(-1) === '%') {
          // Use user units if percentage given
          percs = true;
        } else {
          attrs[dim] = convertToNum(dim, val);
        }
      });
    }

    // identify layers
    draw.identifyLayers();

    // Give ID for any visible layer children missing one
    content.children().find(visElems).each(function () {
      if (!this.id) { this.id = getNextId(); }
    });

    // Percentage width/height, so let's base it on visible elements
    if (percs) {
      const bb = getStrokedBBoxDefaultVisible();
      attrs.width = bb.width + bb.x;
      attrs.height = bb.height + bb.y;
    }

    // Just in case negative numbers are given or
    // result from the percs calculation
    if (attrs.width <= 0) { attrs.width = 100; }
    if (attrs.height <= 0) { attrs.height = 100; }

    content.attr(attrs);
    this.contentW = attrs.width;
    this.contentH = attrs.height;

    batchCmd.addSubCommand(new InsertElementCommand(svgcontent));
    // update root to the correct size
    const changes = content.attr(['width', 'height']);
    batchCmd.addSubCommand(new ChangeElementCommand(svgroot, changes));

    // reset zoom
    currentZoom = 1;

    // reset transform lists
    resetListMap();
    clearSelection();
    pathModule.clearData();
    svgroot.append(selectorManager.selectorParentGroup);

    if (!preventUndo) addCommandToHistory(batchCmd);
    call('changed', [svgcontent]);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
};

/**
* This function imports the input SVG XML as a `<symbol>` in the `<defs>`, then adds a
* `<use>` to the current layer.
* @function module:svgcanvas.SvgCanvas#importSvgString
* @param {string} xmlString - The SVG as XML text.
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {null|Element} This function returns null if the import was unsuccessful, or the element otherwise.
* @todo
* - properly handle if namespace is introduced by imported content (must add to svgcontent
* and update all prefixes in the imported node)
* - properly handle recalculating dimensions, `recalculateDimensions()` doesn't handle
* arbitrary transform lists, but makes some assumptions about how the transform list
* was obtained
*/
this.importSvgString = function (xmlString) {
  let j, ts, useEl;
  try {
    // Get unique ID
    const uid = encode64(xmlString.length + xmlString).substr(0, 32);

    let useExisting = false;
    // Look for symbol and make sure symbol exists in image
    if (importIds[uid]) {
      if ($(importIds[uid].symbol).parents('#svgroot').length) {
        useExisting = true;
      }
    }

    const batchCmd = new BatchCommand('Import Image');
    let symbol;
    if (useExisting) {
      ({symbol} = importIds[uid]);
      ts = importIds[uid].xform;
    } else {
      // convert string into XML document
      const newDoc = text2xml(xmlString);

      this.prepareSvg(newDoc);

      // import new svg document into our document
      let svg;
      // If DOM3 adoptNode() available, use it. Otherwise fall back to DOM2 importNode()
      if (svgdoc.adoptNode) {
        svg = svgdoc.adoptNode(newDoc.documentElement);
      } else {
        svg = svgdoc.importNode(newDoc.documentElement, true);
      }

      uniquifyElems(svg);

      const innerw = convertToNum('width', svg.getAttribute('width')),
        innerh = convertToNum('height', svg.getAttribute('height')),
        innervb = svg.getAttribute('viewBox'),
        // if no explicit viewbox, create one out of the width and height
        vb = innervb ? innervb.split(' ') : [0, 0, innerw, innerh];
      for (j = 0; j < 4; ++j) {
        vb[j] = +(vb[j]);
      }

      // TODO: properly handle preserveAspectRatio
      const // canvasw = +svgcontent.getAttribute('width'),
        canvash = +svgcontent.getAttribute('height');
      // imported content should be 1/3 of the canvas on its largest dimension

      if (innerh > innerw) {
        ts = 'scale(' + (canvash / 3) / vb[3] + ')';
      } else {
        ts = 'scale(' + (canvash / 3) / vb[2] + ')';
      }

      // Hack to make recalculateDimensions understand how to scale
      ts = 'translate(0) ' + ts + ' translate(0)';

      symbol = svgdoc.createElementNS(NS.SVG, 'symbol');
      const defs = findDefs();

      if (isGecko()) {
        // Move all gradients into root for Firefox, workaround for this bug:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=353575
        // TODO: Make this properly undo-able.
        $(svg).find('linearGradient, radialGradient, pattern').appendTo(defs);
      }

      while (svg.firstChild) {
        const first = svg.firstChild;
        symbol.append(first);
      }
      const attrs = svg.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        symbol.setAttribute(attr.nodeName, attr.value);
      }
      symbol.id = getNextId();

      // Store data
      importIds[uid] = {
        symbol,
        xform: ts
      };

      findDefs().append(symbol);
      batchCmd.addSubCommand(new InsertElementCommand(symbol));
    }

    useEl = svgdoc.createElementNS(NS.SVG, 'use');
    useEl.id = getNextId();
    setHref(useEl, '#' + symbol.id);

    (currentGroup || getCurrentDrawing().getCurrentLayer()).append(useEl);
    batchCmd.addSubCommand(new InsertElementCommand(useEl));
    clearSelection();

    useEl.setAttribute('transform', ts);
    recalculateDimensions(useEl);
    $(useEl).data('symbol', symbol).data('ref', symbol);
    addToSelection([useEl]);

    // TODO: Find way to add this in a recalculateDimensions-parsable way
    // if (vb[0] !== 0 || vb[1] !== 0) {
    //   ts = 'translate(' + (-vb[0]) + ',' + (-vb[1]) + ') ' + ts;
    // }
    addCommandToHistory(batchCmd);
    call('changed', [svgcontent]);
  } catch (e) {
    console.log(e);
    return null;
  }

  // we want to return the element so we can automatically select it
  return useEl;
};

// Could deprecate, but besides external uses, their usage makes clear that
//  canvas is a dependency for all of these
[
  'identifyLayers', 'createLayer', 'cloneLayer', 'deleteCurrentLayer',
  'setCurrentLayer', 'renameCurrentLayer', 'setCurrentLayerPosition',
  'setLayerVisibility', 'moveSelectedToLayer', 'mergeLayer', 'mergeAllLayers',
  'leaveContext', 'setContext'
].forEach((prop) => {
  canvas[prop] = draw[prop];
});
draw.init(
  /**
  * @implements {module:draw.DrawCanvasInit}
  */
  {
    pathActions,
    getCurrentGroup () {
      return currentGroup;
    },
    setCurrentGroup (cg) {
      currentGroup = cg;
    },
    getSelectedElements,
    getSVGContent,
    undoMgr,
    elData,
    getCurrentDrawing,
    clearSelection,
    call,
    addCommandToHistory,
    /**
     * @fires module:svgcanvas.SvgCanvas#event:changed
     * @returns {undefined}
     */
    changeSVGContent () {
      call('changed', [svgcontent]);
    }
  }
);

/**
* Group: Document functions
*/

/**
* Clears the current document. This is not an undoable action.
* @function module:svgcanvas.SvgCanvas#clear
* @fires module:svgcanvas.SvgCanvas#event:cleared
* @returns {undefined}
*/
this.clear = function () {
  pathActions.clear();

  clearSelection();

  // clear the svgcontent node
  canvas.clearSvgContentElement();

  // create new document
  canvas.current_drawing_ = new draw.Drawing(svgcontent);

  // create empty first layer
  canvas.createLayer('Layer 1');

  // clear the undo stack
  canvas.undoMgr.resetUndoStack();

  // reset the selector manager
  selectorManager.initGroup();

  // reset the rubber band box
  rubberBox = selectorManager.getRubberBandBox();

  call('cleared');
};

// Alias function
this.linkControlPoints = pathActions.linkControlPoints;

/**
* @function module:svgcanvas.SvgCanvas#getContentElem
* @returns {Element} The content DOM element
*/
this.getContentElem = function () { return svgcontent; };

/**
* @function module:svgcanvas.SvgCanvas#getRootElem
* @returns {SVGSVGElement} The root DOM element
*/
this.getRootElem = function () { return svgroot; };

/**
* @typedef {PlainObject} DimensionsAndZoom
* @property {Float} w Width
* @property {Float} h Height
* @property {Float} zoom Zoom
*/

/**
* @function module:svgcanvas.SvgCanvas#getResolution
* @returns {DimensionsAndZoom} The current dimensions and zoom level in an object
*/
const getResolution = this.getResolution = function () {
//    const vb = svgcontent.getAttribute('viewBox').split(' ');
//    return {w:vb[2], h:vb[3], zoom: currentZoom};

  const w = svgcontent.getAttribute('width') / currentZoom;
  const h = svgcontent.getAttribute('height') / currentZoom;

  return {
    w,
    h,
    zoom: currentZoom
  };
};

/**
* @function module:svgcanvas.SvgCanvas#getSnapToGrid
* @returns {boolean} The current snap to grid setting
*/
this.getSnapToGrid = function () { return curConfig.gridSnapping; };

/**
* @function module:svgcanvas.SvgCanvas#getVersion
* @returns {string} A string which describes the revision number of SvgCanvas.
*/
this.getVersion = function () {
  return 'svgcanvas.js ($Rev$)';
};

/**
* Update interface strings with given values
* @function module:svgcanvas.SvgCanvas#setUiStrings
* @param {module:path.uiStrings} strs - Object with strings (see the [locales API]{@link module:locale.LocaleStrings} and the [tutorial]{@tutorial LocaleDocs})
* @returns {undefined}
*/
this.setUiStrings = function (strs) {
  Object.assign(uiStrings, strs.notification);
  pathModule.setUiStrings(strs);
};

/**
* Update configuration options with given values
* @function module:svgcanvas.SvgCanvas#setConfig
* @param {module:SVGEditor.Config} opts - Object with options
* @returns {undefined}
*/
this.setConfig = function (opts) {
  Object.assign(curConfig, opts);
};

/**
* @function module:svgcanvas.SvgCanvas#getTitle
* @param {Element} elem
* @returns {string|undefined} the current group/SVG's title contents
*/
this.getTitle = function (elem) {
  elem = elem || selectedElements[0];
  if (!elem) { return; }
  elem = $(elem).data('gsvg') || $(elem).data('symbol') || elem;
  const childs = elem.childNodes;
  for (let i = 0; i < childs.length; i++) {
    if (childs[i].nodeName === 'title') {
      return childs[i].textContent;
    }
  }
  return '';
};

/**
* Sets the group/SVG's title content
* @function module:svgcanvas.SvgCanvas#setGroupTitle
* @param {string} val
* @todo Combine this with `setDocumentTitle`
* @returns {undefined}
*/
this.setGroupTitle = function (val) {
  let elem = selectedElements[0];
  elem = $(elem).data('gsvg') || elem;

  const ts = $(elem).children('title');

  const batchCmd = new BatchCommand('Set Label');

  let title;
  if (!val.length) {
    // Remove title element
    const tsNextSibling = ts.nextSibling;
    batchCmd.addSubCommand(new RemoveElementCommand(ts[0], tsNextSibling, elem));
    ts.remove();
  } else if (ts.length) {
    // Change title contents
    title = ts[0];
    batchCmd.addSubCommand(new ChangeElementCommand(title, {'#text': title.textContent}));
    title.textContent = val;
  } else {
    // Add title element
    title = svgdoc.createElementNS(NS.SVG, 'title');
    title.textContent = val;
    $(elem).prepend(title);
    batchCmd.addSubCommand(new InsertElementCommand(title));
  }

  addCommandToHistory(batchCmd);
};

/**
* @function module:svgcanvas.SvgCanvas#getDocumentTitle
* @returns {string|undefined} The current document title or an empty string if not found
*/
const getDocumentTitle = this.getDocumentTitle = function () {
  return canvas.getTitle(svgcontent);
};

/**
* Adds/updates a title element for the document with the given name.
* This is an undoable action
* @function module:svgcanvas.SvgCanvas#setDocumentTitle
* @param {string} newTitle - String with the new title
* @returns {undefined}
*/
this.setDocumentTitle = function (newTitle) {
  const childs = svgcontent.childNodes;
  let docTitle = false, oldTitle = '';

  const batchCmd = new BatchCommand('Change Image Title');

  for (let i = 0; i < childs.length; i++) {
    if (childs[i].nodeName === 'title') {
      docTitle = childs[i];
      oldTitle = docTitle.textContent;
      break;
    }
  }
  if (!docTitle) {
    docTitle = svgdoc.createElementNS(NS.SVG, 'title');
    svgcontent.insertBefore(docTitle, svgcontent.firstChild);
    // svgcontent.firstChild.before(docTitle); // Ok to replace above with this?
  }

  if (newTitle.length) {
    docTitle.textContent = newTitle;
  } else {
    // No title given, so element is not necessary
    docTitle.remove();
  }
  batchCmd.addSubCommand(new ChangeElementCommand(docTitle, {'#text': oldTitle}));
  addCommandToHistory(batchCmd);
};

/**
* Returns the editor's namespace URL, optionally adding it to the root element
* @function module:svgcanvas.SvgCanvas#getEditorNS
* @param {boolean} [add] - Indicates whether or not to add the namespace value
* @returns {string} The editor's namespace URL
*/
this.getEditorNS = function (add) {
  if (add) {
    svgcontent.setAttribute('xmlns:se', NS.SE);
  }
  return NS.SE;
};

/**
* Changes the document's dimensions to the given size
* @function module:svgcanvas.SvgCanvas#setResolution
* @param {Float|"fit"} x - Number with the width of the new dimensions in user units.
* Can also be the string "fit" to indicate "fit to content"
* @param {Float} y - Number with the height of the new dimensions in user units.
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} Indicates if resolution change was successful.
* It will fail on "fit to content" option with no content to fit to.
*/
this.setResolution = function (x, y) {
  const res = getResolution();
  const {w, h} = res;
  let batchCmd;

  if (x === 'fit') {
    // Get bounding box
    const bbox = getStrokedBBoxDefaultVisible();

    if (bbox) {
      batchCmd = new BatchCommand('Fit Canvas to Content');
      const visEls = getVisibleElements();
      addToSelection(visEls);
      const dx = [], dy = [];
      $.each(visEls, function (i, item) {
        dx.push(bbox.x * -1);
        dy.push(bbox.y * -1);
      });

      const cmd = canvas.moveSelectedElements(dx, dy, true);
      batchCmd.addSubCommand(cmd);
      clearSelection();

      x = Math.round(bbox.width);
      y = Math.round(bbox.height);
    } else {
      return false;
    }
  }
  if (x !== w || y !== h) {
    if (!batchCmd) {
      batchCmd = new BatchCommand('Change Image Dimensions');
    }

    x = convertToNum('width', x);
    y = convertToNum('height', y);

    svgcontent.setAttribute('width', x);
    svgcontent.setAttribute('height', y);

    this.contentW = x;
    this.contentH = y;
    batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {width: w, height: h}));

    svgcontent.setAttribute('viewBox', [0, 0, x / currentZoom, y / currentZoom].join(' '));
    batchCmd.addSubCommand(new ChangeElementCommand(svgcontent, {viewBox: ['0 0', w, h].join(' ')}));

    addCommandToHistory(batchCmd);
    call('changed', [svgcontent]);
  }
  return true;
};

/**
* @typedef {module:jQueryAttr.Attributes} module:svgcanvas.ElementPositionInCanvas
* @property {Float} x
* @property {Float} y
*/

/**
* @function module:svgcanvas.SvgCanvas#getOffset
* @returns {module:svgcanvas.ElementPositionInCanvas} An object with `x`, `y` values indicating the svgcontent element's
* position in the editor's canvas.
*/
this.getOffset = function () {
  return $(svgcontent).attr(['x', 'y']);
};

/**
 * @typedef {PlainObject} module:svgcanvas.ZoomAndBBox
 * @property {Float} zoom
 * @property {module:utilities.BBoxObject} bbox
 */
/**
* Sets the zoom level on the canvas-side based on the given value
* @function module:svgcanvas.SvgCanvas#setBBoxZoom
* @param {"selection"|"canvas"|"content"|"layer"|module:SVGEditor.BBoxObjectWithFactor} val - Bounding box object to zoom to or string indicating zoom option. Note: the object value type is defined in `svg-editor.js`
* @param {Integer} editorW - The editor's workarea box's width
* @param {Integer} editorH - The editor's workarea box's height
* @returns {module:svgcanvas.ZoomAndBBox|undefined}
*/
this.setBBoxZoom = function (val, editorW, editorH) {
  let spacer = 0.85;
  let bb;
  const calcZoom = function (bb) {
    if (!bb) { return false; }
    const wZoom = Math.round((editorW / bb.width) * 100 * spacer) / 100;
    const hZoom = Math.round((editorH / bb.height) * 100 * spacer) / 100;
    const zoom = Math.min(wZoom, hZoom);
    canvas.setZoom(zoom);
    return {zoom, bbox: bb};
  };

  if (typeof val === 'object') {
    bb = val;
    if (bb.width === 0 || bb.height === 0) {
      const newzoom = bb.zoom ? bb.zoom : currentZoom * bb.factor;
      canvas.setZoom(newzoom);
      return {zoom: currentZoom, bbox: bb};
    }
    return calcZoom(bb);
  }

  switch (val) {
  case 'selection':
    if (!selectedElements[0]) { return; }
    const selectedElems = $.map(selectedElements, function (n) { if (n) { return n; } });
    bb = getStrokedBBoxDefaultVisible(selectedElems);
    break;
  case 'canvas':
    const res = getResolution();
    spacer = 0.95;
    bb = {width: res.w, height: res.h, x: 0, y: 0};
    break;
  case 'content':
    bb = getStrokedBBoxDefaultVisible();
    break;
  case 'layer':
    bb = getStrokedBBoxDefaultVisible(getVisibleElements(getCurrentDrawing().getCurrentLayer()));
    break;
  default:
    return;
  }
  return calcZoom(bb);
};

/**
* The zoom level has changed. Supplies the new zoom level as a number (not percentage).
* @event module:svgcanvas.SvgCanvas#event:ext-zoomChanged
* @type {Float}
*/
/**
* The bottom panel was updated
* @event module:svgcanvas.SvgCanvas#event:ext-toolButtonStateUpdate
* @type {PlainObject}
* @property {boolean} nofill Indicates fill is disabled
* @property {boolean} nostroke Indicates stroke is disabled
*/
/**
* The element selection has changed (elements were added/removed from selection)
* @event module:svgcanvas.SvgCanvas#event:ext-selectedChanged
* @type {PlainObject}
* @property {Element[]} elems Array of the newly selected elements
* @property {Element|null} selectedElement The single selected element
* @property {boolean} multiselected Indicates whether one or more elements were selected
*/
/**
* Called when part of element is in process of changing, generally on
* mousemove actions like rotate, move, etc.
* @event module:svgcanvas.SvgCanvas#event:ext-elementTransition
* @type {PlainObject}
* @property {Element[]} elems Array of transitioning elements
*/
/**
* One or more elements were changed
* @event module:svgcanvas.SvgCanvas#event:ext-elementChanged
* @type {PlainObject}
* @property {Element[]} elems Array of the affected elements
*/
/**
* Invoked as soon as the locale is ready
* @event module:svgcanvas.SvgCanvas#event:ext-langReady
* @type {PlainObject}
* @property {string} lang The two-letter language code
* @property {module:SVGEditor.uiStrings} uiStrings
* @property {module:SVGEditor~ImportLocale} importLocale
*/
/**
* The language was changed. Two-letter code of the new language.
* @event module:svgcanvas.SvgCanvas#event:ext-langChanged
* @type {string}
*/
/**
* Means for an extension to add locale data. The two-letter language code.
* @event module:svgcanvas.SvgCanvas#event:ext-addLangData
* @type {PlainObject}
* @property {string} lang
* @property {module:SVGEditor~ImportLocale} importLocale
*/
/**
 * Called when new image is created
 * @event module:svgcanvas.SvgCanvas#event:ext-onNewDocument
 * @type {undefined}
 */
/**
 * Called when sidepanel is resized or toggled
 * @event module:svgcanvas.SvgCanvas#event:ext-workareaResized
 * @type {undefined}
*/
/**
 * Called upon addition of the extension, or, if svgicons are set,
 * after the icons are ready when extension SVG icons have loaded.
 * @event module:svgcanvas.SvgCanvas#event:ext-callback
 * @type {undefined}
*/

/**
* Sets the zoom to the given level
* @function module:svgcanvas.SvgCanvas#setZoom
* @param {Float} zoomLevel - Float indicating the zoom level to change to
* @fires module:svgcanvas.SvgCanvas#event:ext-zoomChanged
* @returns {undefined}
*/
this.setZoom = function (zoomLevel) {
  const res = getResolution();
  svgcontent.setAttribute('viewBox', '0 0 ' + res.w / zoomLevel + ' ' + res.h / zoomLevel);
  currentZoom = zoomLevel;
  $.each(selectedElements, function (i, elem) {
    if (!elem) { return; }
    selectorManager.requestSelector(elem).resize();
  });
  pathActions.zoomChange();
  runExtensions('zoomChanged', /** @type {module:svgcanvas.SvgCanvas#event:ext-zoomChanged} */ zoomLevel);
};

/**
* @function module:svgcanvas.SvgCanvas#getMode
* @returns {string} The current editor mode string
*/
this.getMode = function () {
  return currentMode;
};

/**
* Sets the editor's mode to the given string
* @function module:svgcanvas.SvgCanvas#setMode
* @param {string} name - String with the new mode to change to
* @returns {undefined}
*/
this.setMode = function (name) {
  pathActions.clear(true);
  textActions.clear();
  curProperties = (selectedElements[0] && selectedElements[0].nodeName === 'text') ? curText : curShape;
  currentMode = name;
};

/**
* Group: Element Styling
*/

/**
* @typedef {PlainObject} module:svgcanvas.PaintOptions
* @property {"solidColor"} type
*/

/**
* @function module:svgcanvas.SvgCanvas#getColor
* @param {string} type
* @returns {string|module:svgcanvas.PaintOptions|Float|module:jGraduate~Paint} The current fill/stroke option
*/
this.getColor = function (type) {
  return curProperties[type];
};

/**
* Change the current stroke/fill color/gradient value
* @function module:svgcanvas.SvgCanvas#setColor
* @param {string} type - String indicating fill or stroke
* @param {string} val - The value to set the stroke attribute to
* @param {boolean} preventUndo - Boolean indicating whether or not this should be an undoable option
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setColor = function (type, val, preventUndo) {
  curShape[type] = val;
  curProperties[type + '_paint'] = {type: 'solidColor'};
  const elems = [];
  function addNonG (e) {
    if (e.nodeName !== 'g') {
      elems.push(e);
    }
  }
  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, addNonG);
      } else {
        if (type === 'fill') {
          if (elem.tagName !== 'polyline' && elem.tagName !== 'line') {
            elems.push(elem);
          }
        } else {
          elems.push(elem);
        }
      }
    }
  }
  if (elems.length > 0) {
    if (!preventUndo) {
      changeSelectedAttribute(type, val, elems);
      call('changed', elems);
    } else {
      changeSelectedAttributeNoUndo(type, val, elems);
    }
  }
};

/**
* Apply the current gradient to selected element's fill or stroke
* @function module:svgcanvas.SvgCanvas#setGradient
* @param {"fill"|"stroke"} type - String indicating "fill" or "stroke" to apply to an element
* @returns {undefined}
*/
const setGradient = this.setGradient = function (type) {
  if (!curProperties[type + '_paint'] || curProperties[type + '_paint'].type === 'solidColor') { return; }
  let grad = canvas[type + 'Grad'];
  // find out if there is a duplicate gradient already in the defs
  const duplicateGrad = findDuplicateGradient(grad);
  const defs = findDefs();
  // no duplicate found, so import gradient into defs
  if (!duplicateGrad) {
    // const origGrad = grad;
    grad = defs.appendChild(svgdoc.importNode(grad, true));
    // get next id and set it on the grad
    grad.id = getNextId();
  } else { // use existing gradient
    grad = duplicateGrad;
  }
  canvas.setColor(type, 'url(#' + grad.id + ')');
};

/**
* Check if exact gradient already exists
* @function module:svgcanvas~findDuplicateGradient
* @param {SVGGradientElement} grad - The gradient DOM element to compare to others
* @returns {SVGGradientElement} The existing gradient if found, `null` if not
*/
const findDuplicateGradient = function (grad) {
  const defs = findDefs();
  const existingGrads = $(defs).find('linearGradient, radialGradient');
  let i = existingGrads.length;
  const radAttrs = ['r', 'cx', 'cy', 'fx', 'fy'];
  while (i--) {
    const og = existingGrads[i];
    if (grad.tagName === 'linearGradient') {
      if (grad.getAttribute('x1') !== og.getAttribute('x1') ||
        grad.getAttribute('y1') !== og.getAttribute('y1') ||
        grad.getAttribute('x2') !== og.getAttribute('x2') ||
        grad.getAttribute('y2') !== og.getAttribute('y2')
      ) {
        continue;
      }
    } else {
      const gradAttrs = $(grad).attr(radAttrs);
      const ogAttrs = $(og).attr(radAttrs);

      let diff = false;
      $.each(radAttrs, function (i, attr) {
        if (gradAttrs[attr] !== ogAttrs[attr]) { diff = true; }
      });

      if (diff) { continue; }
    }

    // else could be a duplicate, iterate through stops
    const stops = grad.getElementsByTagNameNS(NS.SVG, 'stop');
    const ostops = og.getElementsByTagNameNS(NS.SVG, 'stop');

    if (stops.length !== ostops.length) {
      continue;
    }

    let j = stops.length;
    while (j--) {
      const stop = stops[j];
      const ostop = ostops[j];

      if (stop.getAttribute('offset') !== ostop.getAttribute('offset') ||
        stop.getAttribute('stop-opacity') !== ostop.getAttribute('stop-opacity') ||
        stop.getAttribute('stop-color') !== ostop.getAttribute('stop-color')) {
        break;
      }
    }

    if (j === -1) {
      return og;
    }
  } // for each gradient in defs

  return null;
};

/**
* Set a color/gradient to a fill/stroke
* @function module:svgcanvas.SvgCanvas#setPaint
* @param {"fill"|"stroke"} type - String with "fill" or "stroke"
* @param {module:jGraduate.jGraduatePaintOptions} paint - The jGraduate paint object to apply
* @returns {undefined}
*/
this.setPaint = function (type, paint) {
  // make a copy
  const p = new $.jGraduate.Paint(paint);
  this.setPaintOpacity(type, p.alpha / 100, true);

  // now set the current paint object
  curProperties[type + '_paint'] = p;
  switch (p.type) {
  case 'solidColor':
    this.setColor(type, p.solidColor !== 'none' ? '#' + p.solidColor : 'none');
    break;
  case 'linearGradient':
  case 'radialGradient':
    canvas[type + 'Grad'] = p[p.type];
    setGradient(type);
    break;
  }
};

/**
* @function module:svgcanvas.SvgCanvas#setStrokePaint
* @param {module:jGraduate~Paint} paint
* @returns {undefined}
*/
this.setStrokePaint = function (paint) {
  this.setPaint('stroke', paint);
};

/**
* @function module:svgcanvas.SvgCanvas#setFillPaint
* @param {module:jGraduate~Paint} paint
* @returns {undefined}
*/
this.setFillPaint = function (paint) {
  this.setPaint('fill', paint);
};

/**
* @function module:svgcanvas.SvgCanvas#getStrokeWidth
* @returns {Float|string} The current stroke-width value
*/
this.getStrokeWidth = function () {
  return curProperties.stroke_width;
};

/**
* Sets the stroke width for the current selected elements.
* When attempting to set a line's width to 0, this changes it to 1 instead
* @function module:svgcanvas.SvgCanvas#setStrokeWidth
* @param {Float} val - A Float indicating the new stroke width value
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setStrokeWidth = function (val) {
  if (val === 0 && ['line', 'path'].includes(currentMode)) {
    canvas.setStrokeWidth(1);
    return;
  }
  curProperties.stroke_width = val;

  const elems = [];
  function addNonG (e) {
    if (e.nodeName !== 'g') {
      elems.push(e);
    }
  }
  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, addNonG);
      } else {
        elems.push(elem);
      }
    }
  }
  if (elems.length > 0) {
    changeSelectedAttribute('stroke-width', val, elems);
    call('changed', selectedElements);
  }
};

/**
* Set the given stroke-related attribute the given value for selected elements
* @function module:svgcanvas.SvgCanvas#setStrokeAttr
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the attribute value
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setStrokeAttr = function (attr, val) {
  curShape[attr.replace('-', '_')] = val;
  const elems = [];

  let i = selectedElements.length;
  while (i--) {
    const elem = selectedElements[i];
    if (elem) {
      if (elem.tagName === 'g') {
        walkTree(elem, function (e) { if (e.nodeName !== 'g') { elems.push(e); } });
      } else {
        elems.push(elem);
      }
    }
  }
  if (elems.length > 0) {
    changeSelectedAttribute(attr, val, elems);
    call('changed', selectedElements);
  }
};

/**
* @typedef {PlainObject} module:svgcanvas.StyleOptions
* @property {string} fill
* @property {Float} fill_opacity
* @property {string} stroke
* @property {Float} stroke_width
* @property {string} stroke_dasharray
* @property {string} stroke_linejoin
* @property {string} stroke_linecap
* @property {Float} stroke_opacity
* @property {Float} opacity
*/

/**
* @function module:svgcanvas.SvgCanvas#getStyle
* @returns {module:svgcanvas.StyleOptions} current style options
*/
this.getStyle = function () {
  return curShape;
};

/**
* @function module:svgcanvas.SvgCanvas#getOpacity
* @returns {Float} the current opacity
*/
this.getOpacity = getOpacity;

/**
* Sets the given opacity to the current selected elements
* @function module:svgcanvas.SvgCanvas#setOpacity
* @param {string} val
* @returns {undefined}
*/
this.setOpacity = function (val) {
  curShape.opacity = val;
  changeSelectedAttribute('opacity', val);
};

/**
* @function module:svgcanvas.SvgCanvas#getFillOpacity
* @returns {Float} the current fill opacity
*/
this.getFillOpacity = function () {
  return curShape.fill_opacity;
};

/**
* @function module:svgcanvas.SvgCanvas#getStrokeOpacity
* @returns {string} the current stroke opacity
*/
this.getStrokeOpacity = function () {
  return curShape.stroke_opacity;
};

/**
* Sets the current fill/stroke opacity
* @function module:svgcanvas.SvgCanvas#setPaintOpacity
* @param {string} type - String with "fill" or "stroke"
* @param {Float} val - Float with the new opacity value
* @param {boolean} preventUndo - Indicates whether or not this should be an undoable action
* @returns {undefined}
*/
this.setPaintOpacity = function (type, val, preventUndo) {
  curShape[type + '_opacity'] = val;
  if (!preventUndo) {
    changeSelectedAttribute(type + '-opacity', val);
  } else {
    changeSelectedAttributeNoUndo(type + '-opacity', val);
  }
};

/**
* Gets the current fill/stroke opacity
* @function module:svgcanvas.SvgCanvas#getPaintOpacity
* @param {"fill"|"stroke"} type - String with "fill" or "stroke"
* @returns {Float} Fill/stroke opacity
*/
this.getPaintOpacity = function (type) {
  return type === 'fill' ? this.getFillOpacity() : this.getStrokeOpacity();
};

/**
* Gets the `stdDeviation` blur value of the given element
* @function module:svgcanvas.SvgCanvas#getBlur
* @param {Element} elem - The element to check the blur value for
* @returns {string} stdDeviation blur attribute value
*/
this.getBlur = function (elem) {
  let val = 0;
  // const elem = selectedElements[0];

  if (elem) {
    const filterUrl = elem.getAttribute('filter');
    if (filterUrl) {
      const blur = getElem(elem.id + '_blur');
      if (blur) {
        val = blur.firstChild.getAttribute('stdDeviation');
      }
    }
  }
  return val;
};

(function () {
let curCommand = null;
let filter = null;
let filterHidden = false;

/**
* Sets the `stdDeviation` blur value on the selected element without being undoable
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {undefined}
*/
canvas.setBlurNoUndo = function (val) {
  if (!filter) {
    canvas.setBlur(val);
    return;
  }
  if (val === 0) {
    // Don't change the StdDev, as that will hide the element.
    // Instead, just remove the value for "filter"
    changeSelectedAttributeNoUndo('filter', '');
    filterHidden = true;
  } else {
    const elem = selectedElements[0];
    if (filterHidden) {
      changeSelectedAttributeNoUndo('filter', 'url(#' + elem.id + '_blur)');
    }
    if (isWebkit()) {
      console.log('e', elem);
      elem.removeAttribute('filter');
      elem.setAttribute('filter', 'url(#' + elem.id + '_blur)');
    }
    changeSelectedAttributeNoUndo('stdDeviation', val, [filter.firstChild]);
    canvas.setBlurOffsets(filter, val);
  }
};

function finishChange () {
  const bCmd = canvas.undoMgr.finishUndoableChange();
  curCommand.addSubCommand(bCmd);
  addCommandToHistory(curCommand);
  curCommand = null;
  filter = null;
}

/**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filter - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {undefined}
*/
canvas.setBlurOffsets = function (filter, stdDev) {
  if (stdDev > 3) {
    // TODO: Create algorithm here where size is based on expected blur
    assignAttributes(filter, {
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%'
    }, 100);
  } else {
    // Removing these attributes hides text in Chrome (see Issue 579)
    if (!isWebkit()) {
      filter.removeAttribute('x');
      filter.removeAttribute('y');
      filter.removeAttribute('width');
      filter.removeAttribute('height');
    }
  }
};

/**
* Adds/updates the blur filter to the selected element
* @function module:svgcanvas.SvgCanvas#setBlur
* @param {Float} val - Float with the new `stdDeviation` blur value
* @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
* @returns {undefined}
*/
canvas.setBlur = function (val, complete) {
  if (curCommand) {
    finishChange();
    return;
  }

  // Looks for associated blur, creates one if not found
  const elem = selectedElements[0];
  const elemId = elem.id;
  filter = getElem(elemId + '_blur');

  val -= 0;

  const batchCmd = new BatchCommand();

  // Blur found!
  if (filter) {
    if (val === 0) {
      filter = null;
    }
  } else {
    // Not found, so create
    const newblur = addSVGElementFromJson({element: 'feGaussianBlur',
      attr: {
        in: 'SourceGraphic',
        stdDeviation: val
      }
    });

    filter = addSVGElementFromJson({element: 'filter',
      attr: {
        id: elemId + '_blur'
      }
    });

    filter.append(newblur);
    findDefs().append(filter);

    batchCmd.addSubCommand(new InsertElementCommand(filter));
  }

  const changes = {filter: elem.getAttribute('filter')};

  if (val === 0) {
    elem.removeAttribute('filter');
    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
    return;
  }

  changeSelectedAttribute('filter', 'url(#' + elemId + '_blur)');
  batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
  canvas.setBlurOffsets(filter, val);

  curCommand = batchCmd;
  canvas.undoMgr.beginUndoableChange('stdDeviation', [filter ? filter.firstChild : null]);
  if (complete) {
    canvas.setBlurNoUndo(val);
    finishChange();
  }
};
}());

/**
* Check whether selected element is bold or not
* @function module:svgcanvas.SvgCanvas#getBold
* @returns {boolean} Indicates whether or not element is bold
*/
this.getBold = function () {
  // should only have one element selected
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    return (selected.getAttribute('font-weight') === 'bold');
  }
  return false;
};

/**
* Make the selected element bold or normal
* @function module:svgcanvas.SvgCanvas#setBold
* @param {boolean} b - Indicates bold (`true`) or normal (`false`)
* @returns {undefined}
*/
this.setBold = function (b) {
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    changeSelectedAttribute('font-weight', b ? 'bold' : 'normal');
  }
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

/**
* Check whether selected element is italic or not
* @function module:svgcanvas.SvgCanvas#getItalic
* @returns {boolean} Indicates whether or not element is italic
*/
this.getItalic = function () {
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    return (selected.getAttribute('font-style') === 'italic');
  }
  return false;
};

/**
* Make the selected element italic or normal
* @function module:svgcanvas.SvgCanvas#setItalic
* @param {boolean} b - Indicates italic (`true`) or normal (`false`)
* @returns {undefined}
*/
this.setItalic = function (i) {
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    changeSelectedAttribute('font-style', i ? 'italic' : 'normal');
  }
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

/**
* @function module:svgcanvas.SvgCanvas#getFontFamily
* @returns {string} The current font family
*/
this.getFontFamily = function () {
  return curText.font_family;
};

/**
* Set the new font family
* @function module:svgcanvas.SvgCanvas#setFontFamily
* @param {string} val - String with the new font family
* @returns {undefined}
*/
this.setFontFamily = function (val) {
  curText.font_family = val;
  changeSelectedAttribute('font-family', val);
  if (selectedElements[0] && !selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

/**
* Set the new font color
* @function module:svgcanvas.SvgCanvas#setFontColor
* @param {string} val - String with the new font color
* @returns {undefined}
*/
this.setFontColor = function (val) {
  curText.fill = val;
  changeSelectedAttribute('fill', val);
};

/**
* @function module:svgcanvas.SvgCanvas#getFontColor
* @returns {string} The current font color
*/
this.getFontColor = function () {
  return curText.fill;
};

/**
* @function module:svgcanvas.SvgCanvas#getFontSize
* @returns {Float} The current font size
*/
this.getFontSize = function () {
  return curText.font_size;
};

/**
* Applies the given font size to the selected element
* @function module:svgcanvas.SvgCanvas#setFontSize
* @param {Float} val - Float with the new font size
* @returns {undefined}
*/
this.setFontSize = function (val) {
  curText.font_size = val;
  changeSelectedAttribute('font-size', val);
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

/**
* @function module:svgcanvas.SvgCanvas#getText
* @returns {string} The current text (`textContent`) of the selected element
*/
this.getText = function () {
  const selected = selectedElements[0];
  if (selected == null) { return ''; }
  return selected.textContent;
};

/**
* Updates the text element with the given string
* @function module:svgcanvas.SvgCanvas#setTextContent
* @param {string} val - String with the new text
* @returns {undefined}
*/
this.setTextContent = function (val) {
  changeSelectedAttribute('#text', val);
  textActions.init(val);
  textActions.setCursor();
};

/**
* Sets the new image URL for the selected image element. Updates its size if
* a new URL is given
* @function module:svgcanvas.SvgCanvas#setImageURL
* @param {string} val - String with the image URL/path
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setImageURL = function (val) {
  const elem = selectedElements[0];
  if (!elem) { return; }

  const attrs = $(elem).attr(['width', 'height']);
  const setsize = (!attrs.width || !attrs.height);

  const curHref = getHref(elem);

  // Do nothing if no URL change or size change
  if (curHref === val && !setsize) {
    return;
  }

  const batchCmd = new BatchCommand('Change Image URL');

  setHref(elem, val);
  batchCmd.addSubCommand(new ChangeElementCommand(elem, {
    '#href': curHref
  }));

  $(new Image()).load(function () {
    const changes = $(elem).attr(['width', 'height']);

    $(elem).attr({
      width: this.width,
      height: this.height
    });

    selectorManager.requestSelector(elem).resize();

    batchCmd.addSubCommand(new ChangeElementCommand(elem, changes));
    addCommandToHistory(batchCmd);
    call('changed', [elem]);
  }).attr('src', val);
};

/**
* Sets the new link URL for the selected anchor element.
* @function module:svgcanvas.SvgCanvas#setLinkURL
* @param {string} val - String with the link URL/path
* @returns {undefined}
*/
this.setLinkURL = function (val) {
  let elem = selectedElements[0];
  if (!elem) { return; }
  if (elem.tagName !== 'a') {
    // See if parent is an anchor
    const parentsA = $(elem).parents('a');
    if (parentsA.length) {
      elem = parentsA[0];
    } else {
      return;
    }
  }

  const curHref = getHref(elem);

  if (curHref === val) { return; }

  const batchCmd = new BatchCommand('Change Link URL');

  setHref(elem, val);
  batchCmd.addSubCommand(new ChangeElementCommand(elem, {
    '#href': curHref
  }));

  addCommandToHistory(batchCmd);
};

/**
* Sets the `rx` and `ry` values to the selected `rect` element to change its corner radius
* @function module:svgcanvas.SvgCanvas#setRectRadius
* @param {string|Float} val - The new radius
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.setRectRadius = function (val) {
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'rect') {
    const r = selected.getAttribute('rx');
    if (r !== String(val)) {
      selected.setAttribute('rx', val);
      selected.setAttribute('ry', val);
      addCommandToHistory(new ChangeElementCommand(selected, {rx: r, ry: r}, 'Radius'));
      call('changed', [selected]);
    }
  }
};

/**
* Wraps the selected element(s) in an anchor element or converts group to one
* @function module:svgcanvas.SvgCanvas#makeHyperlink
* @param {string} url
* @returns {undefined}
*/
this.makeHyperlink = function (url) {
  canvas.groupSelectedElements('a', url);

  // TODO: If element is a single "g", convert to "a"
  //  if (selectedElements.length > 1 && selectedElements[1]) {
};

/**
* @function module:svgcanvas.SvgCanvas#removeHyperlink
* @returns {undefined}
*/
this.removeHyperlink = function () {
  canvas.ungroupSelectedElement();
};

/**
* Group: Element manipulation
*/

/**
* Sets the new segment type to the selected segment(s).
* @function module:svgcanvas.SvgCanvas#setSegType
* @param {Integer} newType - New segment type. See {@link https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg} for list
* @returns {undefined}
*/
this.setSegType = function (newType) {
  pathActions.setSegType(newType);
};

/**
* Convert selected element to a path, or get the BBox of an element-as-path
* @function module:svgcanvas.SvgCanvas#convertToPath
* @todo (codedread): Remove the getBBox argument and split this function into two.
* @param {Element} elem - The DOM element to be converted
* @param {boolean} getBBox - Boolean on whether or not to only return the path's BBox
* @returns {undefined|DOMRect|false|SVGPathElement|null} If the getBBox flag is true, the resulting path's bounding box object.
* Otherwise the resulting path element is returned.
*/
this.convertToPath = function (elem, getBBox) {
  if (elem == null) {
    const elems = selectedElements;
    $.each(elems, function (i, elem) {
      if (elem) { canvas.convertToPath(elem); }
    });
    return;
  }
  if (getBBox) {
    return getBBoxOfElementAsPath(elem, addSVGElementFromJson, pathActions);
  }
  // TODO: Why is this applying attributes from curShape, then inside utilities.convertToPath it's pulling addition attributes from elem?
  // TODO: If convertToPath is called with one elem, curShape and elem are probably the same; but calling with multiple is a bug or cool feature.
  const attrs = {
    fill: curShape.fill,
    'fill-opacity': curShape.fill_opacity,
    stroke: curShape.stroke,
    'stroke-width': curShape.stroke_width,
    'stroke-dasharray': curShape.stroke_dasharray,
    'stroke-linejoin': curShape.stroke_linejoin,
    'stroke-linecap': curShape.stroke_linecap,
    'stroke-opacity': curShape.stroke_opacity,
    opacity: curShape.opacity,
    visibility: 'hidden'
  };
  return convertToPath(elem, attrs, addSVGElementFromJson, pathActions, clearSelection, addToSelection, history, addCommandToHistory);
};

/**
* This function makes the changes to the elements. It does not add the change
* to the history stack.
* @param {string} attr - Attribute name
* @param {string|Float} newValue - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {undefined}
*/
const changeSelectedAttributeNoUndo = function (attr, newValue, elems) {
  if (currentMode === 'pathedit') {
    // Editing node
    pathActions.moveNode(attr, newValue);
  }
  elems = elems || selectedElements;
  let i = elems.length;
  const noXYElems = ['g', 'polyline', 'path'];
  const goodGAttrs = ['transform', 'opacity', 'filter'];

  while (i--) {
    let elem = elems[i];
    if (elem == null) { continue; }

    // Set x,y vals on elements that don't have them
    if ((attr === 'x' || attr === 'y') && noXYElems.includes(elem.tagName)) {
      const bbox = getStrokedBBoxDefaultVisible([elem]);
      const diffX = attr === 'x' ? newValue - bbox.x : 0;
      const diffY = attr === 'y' ? newValue - bbox.y : 0;
      canvas.moveSelectedElements(diffX * currentZoom, diffY * currentZoom, true);
      continue;
    }

    // only allow the transform/opacity/filter attribute to change on <g> elements, slightly hacky
    // TODO: FIXME: This doesn't seem right. Where's the body of this if statement?
    if (elem.tagName === 'g' && goodGAttrs.includes(attr)) {}
    let oldval = attr === '#text' ? elem.textContent : elem.getAttribute(attr);
    if (oldval == null) { oldval = ''; }
    if (oldval !== String(newValue)) {
      if (attr === '#text') {
        // const oldW = utilsGetBBox(elem).width;
        elem.textContent = newValue;

        // FF bug occurs on on rotated elements
        if ((/rotate/).test(elem.getAttribute('transform'))) {
          elem = ffClone(elem);
        }
        // Hoped to solve the issue of moving text with text-anchor="start",
        // but this doesn't actually fix it. Hopefully on the right track, though. -Fyrd
        // const box = getBBox(elem), left = box.x, top = box.y, {width, height} = box,
        //   dx = width - oldW, dy = 0;
        // const angle = getRotationAngle(elem, true);
        // if (angle) {
        //   const r = Math.sqrt(dx * dx + dy * dy);
        //   const theta = Math.atan2(dy, dx) - angle;
        //   dx = r * Math.cos(theta);
        //   dy = r * Math.sin(theta);
        //
        //   elem.setAttribute('x', elem.getAttribute('x') - dx);
        //   elem.setAttribute('y', elem.getAttribute('y') - dy);
        // }
      } else if (attr === '#href') {
        setHref(elem, newValue);
      } else { elem.setAttribute(attr, newValue); }

      // Go into "select" mode for text changes
      // NOTE: Important that this happens AFTER elem.setAttribute() or else attributes like
      // font-size can get reset to their old value, ultimately by svgEditor.updateContextPanel(),
      // after calling textActions.toSelectMode() below
      if (currentMode === 'textedit' && attr !== '#text' && elem.textContent.length) {
        textActions.toSelectMode(elem);
      }

      // if (i === 0) {
      //   selectedBBoxes[0] = utilsGetBBox(elem);
      // }

      // Use the Firefox ffClone hack for text elements with gradients or
      // where other text attributes are changed.
      if (isGecko() && elem.nodeName === 'text' && (/rotate/).test(elem.getAttribute('transform'))) {
        if (String(newValue).startsWith('url') || (['font-size', 'font-family', 'x', 'y'].includes(attr) && elem.textContent)) {
          elem = ffClone(elem);
        }
      }
      // Timeout needed for Opera & Firefox
      // codedread: it is now possible for this function to be called with elements
      // that are not in the selectedElements array, we need to only request a
      // selector if the element is in that array
      if (selectedElements.includes(elem)) {
        setTimeout(function () {
          // Due to element replacement, this element may no longer
          // be part of the DOM
          if (!elem.parentNode) { return; }
          selectorManager.requestSelector(elem).resize();
        }, 0);
      }
      // if this element was rotated, and we changed the position of this element
      // we need to update the rotational transform attribute
      const angle = getRotationAngle(elem);
      if (angle !== 0 && attr !== 'transform') {
        const tlist = getTransformList(elem);
        let n = tlist.numberOfItems;
        while (n--) {
          const xform = tlist.getItem(n);
          if (xform.type === 4) {
            // remove old rotate
            tlist.removeItem(n);

            const box = utilsGetBBox(elem);
            const center = transformPoint(box.x + box.width / 2, box.y + box.height / 2, transformListToTransform(tlist).matrix);
            const cx = center.x,
              cy = center.y;
            const newrot = svgroot.createSVGTransform();
            newrot.setRotate(angle, cx, cy);
            tlist.insertItemBefore(newrot, n);
            break;
          }
        }
      }
    } // if oldValue != newValue
  } // for each elem
};

/**
* Change the given/selected element and add the original value to the history stack.
* If you want to change all `selectedElements`, ignore the `elems` argument.
* If you want to change only a subset of `selectedElements`, then send the
* subset to this function in the `elems` argument.
* @function module:svgcanvas.SvgCanvas#changeSelectedAttribute
* @param {string} attr - String with the attribute name
* @param {string|Float} newValue - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {undefined}
*/
const changeSelectedAttribute = this.changeSelectedAttribute = function (attr, val, elems) {
  elems = elems || selectedElements;
  canvas.undoMgr.beginUndoableChange(attr, elems);
  // const i = elems.length;

  changeSelectedAttributeNoUndo(attr, val, elems);

  const batchCmd = canvas.undoMgr.finishUndoableChange();
  if (!batchCmd.isEmpty()) {
    addCommandToHistory(batchCmd);
  }
};

/**
* Removes all selected elements from the DOM and adds the change to the
* history stack
* @function module:svgcanvas.SvgCanvas#deleteSelectedElements
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.deleteSelectedElements = function () {
  const batchCmd = new BatchCommand('Delete Elements');
  const len = selectedElements.length;
  const selectedCopy = []; // selectedElements is being deleted

  for (let i = 0; i < len; ++i) {
    const selected = selectedElements[i];
    if (selected == null) { break; }

    let parent = selected.parentNode;
    let t = selected;

    // this will unselect the element and remove the selectedOutline
    selectorManager.releaseSelector(t);

    // Remove the path if present.
    pathModule.removePath_(t.id);

    // Get the parent if it's a single-child anchor
    if (parent.tagName === 'a' && parent.childNodes.length === 1) {
      t = parent;
      parent = parent.parentNode;
    }

    const {nextSibling} = t;
    const elem = parent.removeChild(t);
    selectedCopy.push(selected); // for the copy
    batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, parent));
  }
  selectedElements = [];

  if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }
  call('changed', selectedCopy);
  clearSelection();
};

/**
* Removes all selected elements from the DOM and adds the change to the
* history stack. Remembers removed elements on the clipboard
* @function module:svgcanvas.SvgCanvas#cutSelectedElements
* @returns {undefined}
*/
this.cutSelectedElements = function () {
  canvas.copySelectedElements();
  canvas.deleteSelectedElements();
};

/**
* Remembers the current selected elements on the clipboard
* @function module:svgcanvas.SvgCanvas#copySelectedElements
* @returns {undefined}
*/
this.copySelectedElements = function () {
  localStorage.setItem('svgedit_clipboard', JSON.stringify(
    selectedElements.map(function (x) { return getJsonFromSvgElement(x); })
  ));

  $('#cmenu_canvas').enableContextMenuItems('#paste,#paste_in_place');
};

/**
* @function module:svgcanvas.SvgCanvas#pasteElements
* @param {"in_place"|"point"|undefined} type
* @param {Integer|undefined} x Expected if type is "point"
* @param {Integer|undefined} y Expected if type is "point"
* @fires module:svgcanvas.SvgCanvas#event:changed
* @fires module:svgcanvas.SvgCanvas#event:ext-IDsUpdated
* @returns {undefined}
*/
this.pasteElements = function (type, x, y) {
  let clipb = JSON.parse(localStorage.getItem('svgedit_clipboard'));
  let len = clipb.length;
  if (!len) { return; }

  const pasted = [];
  const batchCmd = new BatchCommand('Paste elements');
  // const drawing = getCurrentDrawing();
  /**
  * @typedef {PlainObject.<string, string>} module:svgcanvas.ChangedIDs
  */
  /**
   * @type {module:svgcanvas.ChangedIDs}
   */
  const changedIDs = {};

  // Recursively replace IDs and record the changes
  function checkIDs (elem) {
    if (elem.attr && elem.attr.id) {
      changedIDs[elem.attr.id] = getNextId();
      elem.attr.id = changedIDs[elem.attr.id];
    }
    if (elem.children) elem.children.forEach(checkIDs);
  }
  clipb.forEach(checkIDs);

  // Give extensions like the connector extension a chance to reflect new IDs and remove invalid elements
  /**
  * Triggered when `pasteElements` is called from a paste action (context menu or key)
  * @event module:svgcanvas.SvgCanvas#event:ext-IDsUpdated
  * @type {PlainObject}
  * @property {module:svgcanvas.SVGAsJSON[]} elems
  * @property {module:svgcanvas.ChangedIDs} changes Maps past ID (on attribute) to current ID
  */
  runExtensions(
    'IDsUpdated',
    /** @type {module:svgcanvas.SvgCanvas#event:ext-IDsUpdated} */
    {elems: clipb, changes: changedIDs},
    true
  ).forEach(function (extChanges) {
    if (!extChanges || !('remove' in extChanges)) return;

    extChanges.remove.forEach(function (removeID) {
      clipb = clipb.filter(function (clipBoardItem) {
        return clipBoardItem.attr.id !== removeID;
      });
    });
  });

  // Move elements to lastClickPoint
  while (len--) {
    const elem = clipb[len];
    if (!elem) { continue; }

    const copy = addSVGElementFromJson(elem);
    pasted.push(copy);
    batchCmd.addSubCommand(new InsertElementCommand(copy));

    restoreRefElems(copy);
  }

  selectOnly(pasted);

  if (type !== 'in_place') {
    let ctrX, ctrY;

    if (!type) {
      ctrX = lastClickPoint.x;
      ctrY = lastClickPoint.y;
    } else if (type === 'point') {
      ctrX = x;
      ctrY = y;
    }

    const bbox = getStrokedBBoxDefaultVisible(pasted);
    const cx = ctrX - (bbox.x + bbox.width / 2),
      cy = ctrY - (bbox.y + bbox.height / 2),
      dx = [],
      dy = [];

    $.each(pasted, function (i, item) {
      dx.push(cx);
      dy.push(cy);
    });

    const cmd = canvas.moveSelectedElements(dx, dy, false);
    if (cmd) batchCmd.addSubCommand(cmd);
  }

  addCommandToHistory(batchCmd);
  call('changed', pasted);
};

/**
* Wraps all the selected elements in a group (`g`) element
* @function module:svgcanvas.SvgCanvas#groupSelectedElements
* @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
* @param {string} [urlArg]
* @returns {undefined}
*/
this.groupSelectedElements = function (type, urlArg) {
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
  const g = addSVGElementFromJson({
    element: type,
    attr: {
      id: getNextId()
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
    if (elem == null) { continue; }

    if (elem.parentNode.tagName === 'a' && elem.parentNode.childNodes.length === 1) {
      elem = elem.parentNode;
    }

    const oldNextSibling = elem.nextSibling;
    const oldParent = elem.parentNode;
    g.append(elem);
    batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
  }
  if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }

  // update selection
  selectOnly([g], true);
};

/**
* Pushes all appropriate parent group properties down to its children, then
* removes them from the group
* @function module:svgcanvas.SvgCanvas#pushGroupProperties
* @param {SVGAElement|SVGGElement} g
* @param {boolean} undoable
* @returns {undefined}
*/
const pushGroupProperties = this.pushGroupProperties = function (g, undoable) {
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

  const gattrs = $(g).attr(['filter', 'opacity']);
  let gfilter, gblur, changes;
  const drawing = getCurrentDrawing();

  for (let i = 0; i < len; i++) {
    const elem = children[i];

    if (elem.nodeType !== 1) { continue; }

    if (gattrs.opacity !== null && gattrs.opacity !== 1) {
      // const c_opac = elem.getAttribute('opacity') || 1;
      const newOpac = Math.round((elem.getAttribute('opacity') || 1) * gattrs.opacity * 100) / 100;
      changeSelectedAttribute('opacity', newOpac, [elem]);
    }

    if (gattrs.filter) {
      let cblur = this.getBlur(elem);
      const origCblur = cblur;
      if (!gblur) { gblur = this.getBlur(g); }
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

      // Change this in future for different filters
      const suffix = (gfilter.firstChild.tagName === 'feGaussianBlur') ? 'blur' : 'filter';
      gfilter.id = elem.id + '_' + suffix;
      changeSelectedAttribute('filter', 'url(#' + gfilter.id + ')', [elem]);

      // Update blur value
      if (cblur) {
        changeSelectedAttribute('stdDeviation', cblur, [gfilter.firstChild]);
        canvas.setBlurOffsets(gfilter, cblur);
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
        let rcm = svgroot.createSVGMatrix();
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
        const r2 = svgroot.createSVGTransform();
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
          const tr = svgroot.createSVGTransform();
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

        const newxform = svgroot.createSVGTransform();

        // [ gm ] [ chm ] = [ chm ] [ gm' ]
        // [ gm' ] = [ chmInv ] [ gm ] [ chm ]
        const chm = transformListToTransform(chtlist).matrix,
          chmInv = chm.inverse();
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
};

/**
* Unwraps all the elements in a selected group (`g`) element. This requires
* significant recalculations to apply group's transforms, etc. to its children
* @function module:svgcanvas.SvgCanvas#ungroupSelectedElement
* @returns {undefined}
*/
this.ungroupSelectedElement = function () {
  let g = selectedElements[0];
  if (!g) {
    return;
  }
  if ($(g).data('gsvg') || $(g).data('symbol')) {
    // Is svg, so actually convert to group
    convertToGroup(g);
    return;
  }
  if (g.tagName === 'use') {
    // Somehow doesn't have data set, so retrieve
    const symbol = getElem(getHref(g).substr(1));
    $(g).data('symbol', symbol).data('ref', symbol);
    convertToGroup(g);
    return;
  }
  const parentsA = $(g).parents('a');
  if (parentsA.length) {
    g = parentsA[0];
  }

  // Look for parent "a"
  if (g.tagName === 'g' || g.tagName === 'a') {
    const batchCmd = new BatchCommand('Ungroup Elements');
    const cmd = pushGroupProperties(g, true);
    if (cmd) { batchCmd.addSubCommand(cmd); }

    const parent = g.parentNode;
    const anchor = g.nextSibling;
    const children = new Array(g.childNodes.length);

    let i = 0;
    while (g.firstChild) {
      let elem = g.firstChild;
      const oldNextSibling = elem.nextSibling;
      const oldParent = elem.parentNode;

      // Remove child title elements
      if (elem.tagName === 'title') {
        const {nextSibling} = elem;
        batchCmd.addSubCommand(new RemoveElementCommand(elem, nextSibling, oldParent));
        elem.remove();
        continue;
      }

      children[i++] = elem = parent.insertBefore(elem, anchor);
      batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
    }

    // remove the group from the selection
    clearSelection();

    // delete the group element (but make undo-able)
    const gNextSibling = g.nextSibling;
    g = parent.removeChild(g);
    batchCmd.addSubCommand(new RemoveElementCommand(g, gNextSibling, parent));

    if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }

    // update selection
    addToSelection(children);
  }
};

/**
* Repositions the selected element to the bottom in the DOM to appear on top of
* other elements
* @function module:svgcanvas.SvgCanvas#moveToTopSelectedElement
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.moveToTopSelectedElement = function () {
  const [selected] = selectedElements;
  if (selected != null) {
    let t = selected;
    const oldParent = t.parentNode;
    const oldNextSibling = t.nextSibling;
    t = t.parentNode.appendChild(t);
    // If the element actually moved position, add the command and fire the changed
    // event handler.
    if (oldNextSibling !== t.nextSibling) {
      addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'top'));
      call('changed', [t]);
    }
  }
};

/**
* Repositions the selected element to the top in the DOM to appear under
* other elements
* @function module:svgcanvas.SvgCanvas#moveToBottomSelectedElement
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.moveToBottomSelectedElement = function () {
  const [selected] = selectedElements;
  if (selected != null) {
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
      addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'bottom'));
      call('changed', [t]);
    }
  }
};

/**
* Moves the select element up or down the stack, based on the visibly
* intersecting elements
* @function module:svgcanvas.SvgCanvas#moveUpDownSelected
* @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {undefined}
*/
this.moveUpDownSelected = function (dir) {
  const selected = selectedElements[0];
  if (!selected) { return; }

  curBBoxes = [];
  let closest, foundCur;
  // jQuery sorts this list
  const list = $(getIntersectionList(getStrokedBBoxDefaultVisible([selected]))).toArray();
  if (dir === 'Down') { list.reverse(); }

  $.each(list, function () {
    if (!foundCur) {
      if (this === selected) {
        foundCur = true;
      }
      return;
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
    addCommandToHistory(new MoveElementCommand(t, oldNextSibling, oldParent, 'Move ' + dir));
    call('changed', [t]);
  }
};

/**
* Moves selected elements on the X/Y axis
* @function module:svgcanvas.SvgCanvas#moveSelectedElements
* @param {Float} dx - Float with the distance to move on the x-axis
* @param {Float} dy - Float with the distance to move on the y-axis
* @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {BatchCommand} Batch command for the move
*/
this.moveSelectedElements = function (dx, dy, undoable) {
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
    if (selected != null) {
      // if (i === 0) {
      //   selectedBBoxes[0] = utilsGetBBox(selected);
      // }
      // const b = {};
      // for (const j in selectedBBoxes[i]) b[j] = selectedBBoxes[i][j];
      // selectedBBoxes[i] = b;

      const xform = svgroot.createSVGTransform();
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

      selectorManager.requestSelector(selected).resize();
    }
  }
  if (!batchCmd.isEmpty()) {
    if (undoable) {
      addCommandToHistory(batchCmd);
    }
    call('changed', selectedElements);
    return batchCmd;
  }
};

/**
* Create deep DOM copies (clones) of all selected elements and move them slightly
* from their originals
* @function module:svgcanvas.SvgCanvas#cloneSelectedElements
* @param {Float} x Float with the distance to move on the x-axis
* @param {Float} y Float with the distance to move on the y-axis
* @returns {undefined}
*/
this.cloneSelectedElements = function (x, y) {
  let i, elem;
  const batchCmd = new BatchCommand('Clone Elements');
  // find all the elements selected (stop at first null)
  const len = selectedElements.length;
  function sortfunction (a, b) {
    return ($(b).index() - $(a).index()); // causes an array to be sorted numerically and ascending
  }
  selectedElements.sort(sortfunction);
  for (i = 0; i < len; ++i) {
    elem = selectedElements[i];
    if (elem == null) { break; }
  }
  // use slice to quickly get the subset of elements we need
  const copiedElements = selectedElements.slice(0, i);
  this.clearSelection(true);
  // note that we loop in the reverse way because of the way elements are added
  // to the selectedElements array (top-first)
  const drawing = getCurrentDrawing();
  i = copiedElements.length;
  while (i--) {
    // clone each element and replace it within copiedElements
    elem = copiedElements[i] = drawing.copyElem(copiedElements[i]);
    (currentGroup || drawing.getCurrentLayer()).append(elem);
    batchCmd.addSubCommand(new InsertElementCommand(elem));
  }

  if (!batchCmd.isEmpty()) {
    addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
    this.moveSelectedElements(x, y, false);
    addCommandToHistory(batchCmd);
  }
};

/**
* Aligns selected elements
* @function module:svgcanvas.SvgCanvas#alignSelectedElements
* @param {string} type - String with single character indicating the alignment type
* @param {"selected"|"largest"|"smallest"|"page"} relativeTo
* @returns {undefined}
*/
this.alignSelectedElements = function (type, relativeTo) {
  const bboxes = []; // angles = [];
  const len = selectedElements.length;
  if (!len) { return; }
  let minx = Number.MAX_VALUE, maxx = Number.MIN_VALUE,
    miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
  let curwidth = Number.MIN_VALUE, curheight = Number.MIN_VALUE;
  for (let i = 0; i < len; ++i) {
    if (selectedElements[i] == null) { break; }
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
    maxx = canvas.contentW;
    maxy = canvas.contentH;
  }

  const dx = new Array(len);
  const dy = new Array(len);
  for (let i = 0; i < len; ++i) {
    if (selectedElements[i] == null) { break; }
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
  this.moveSelectedElements(dx, dy);
};

/**
* Group: Additional editor tools
*/

/**
* @name module:svgcanvas.SvgCanvas#contentW
* @type {Float}
*/
this.contentW = getResolution().w;
/**
* @name module:svgcanvas.SvgCanvas#contentH
* @type {Float}
*/
this.contentH = getResolution().h;

/**
* @typedef {PlainObject} module:svgcanvas.CanvasInfo
* @property {Float} x - The canvas' new x coordinate
* @property {Float} y - The canvas' new y coordinate
* @property {string} oldX - The canvas' old x coordinate
* @property {string} oldY - The canvas' old y coordinate
* @property {Float} d_x - The x position difference
* @property {Float} d_y - The y position difference
*/

/**
* Updates the editor canvas width/height/position after a zoom has occurred
* @function module:svgcanvas.SvgCanvas#updateCanvas
* @param {Float} w - Float with the new width
* @param {Float} h - Float with the new height
* @fires module:svgcanvas.SvgCanvas#event:ext-canvasUpdated
* @returns {module:svgcanvas.CanvasInfo}
*/
this.updateCanvas = function (w, h) {
  svgroot.setAttribute('width', w);
  svgroot.setAttribute('height', h);
  const bg = $('#canvasBackground')[0];
  const oldX = svgcontent.getAttribute('x');
  const oldY = svgcontent.getAttribute('y');
  const x = (w / 2 - this.contentW * currentZoom / 2);
  const y = (h / 2 - this.contentH * currentZoom / 2);

  assignAttributes(svgcontent, {
    width: this.contentW * currentZoom,
    height: this.contentH * currentZoom,
    x,
    y,
    viewBox: '0 0 ' + this.contentW + ' ' + this.contentH
  });

  assignAttributes(bg, {
    width: svgcontent.getAttribute('width'),
    height: svgcontent.getAttribute('height'),
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

  selectorManager.selectorParentGroup.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  /**
  * Invoked upon updates to the canvas.
  * @event module:svgcanvas.SvgCanvas#event:ext-canvasUpdated
  * @type {PlainObject}
  * @property {Integer} new_x
  * @property {Integer} new_y
  * @property {string} old_x (Of Integer)
  * @property {string} old_y (Of Integer)
  * @property {Integer} d_x
  * @property {Integer} d_y
  */
  runExtensions(
    'canvasUpdated',
    /**
     * @type {module:svgcanvas.SvgCanvas#event:ext-canvasUpdated}
     */
    {new_x: x, new_y: y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY}
  );
  return {x, y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY};
};

/**
* Set the background of the editor (NOT the actual document)
* @function module:svgcanvas.SvgCanvas#setBackground
* @param {string} color - String with fill color to apply
* @param {string} url - URL or path to image to use
* @returns {undefined}
*/
this.setBackground = function (color, url) {
  const bg = getElem('canvasBackground');
  const border = $(bg).find('rect')[0];
  let bgImg = getElem('background_image');
  border.setAttribute('fill', color);
  if (url) {
    if (!bgImg) {
      bgImg = svgdoc.createElementNS(NS.SVG, 'image');
      assignAttributes(bgImg, {
        id: 'background_image',
        width: '100%',
        height: '100%',
        preserveAspectRatio: 'xMinYMin',
        style: 'pointer-events:none'
      });
    }
    setHref(bgImg, url);
    bg.append(bgImg);
  } else if (bgImg) {
    bgImg.remove();
  }
};

/**
* Select the next/previous element within the current layer
* @function module:svgcanvas.SvgCanvas#cycleElement
* @param {boolean} next - true = next and false = previous element
* @fires module:svgcanvas.SvgCanvas#event:selected
* @returns {undefined}
*/
this.cycleElement = function (next) {
  let num;
  const curElem = selectedElements[0];
  let elem = false;
  const allElems = getVisibleElements(currentGroup || getCurrentDrawing().getCurrentLayer());
  if (!allElems.length) { return; }
  if (curElem == null) {
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
  selectOnly([elem], true);
  call('selected', selectedElements);
};

this.clear();

/**
* @interface module:svgcanvas.PrivateMethods
* @type {PlainObject}
* @property {module:svgcanvas~addCommandToHistory} addCommandToHistory
* @property {module:history.HistoryCommand} BatchCommand
* @property {module:history.HistoryCommand} ChangeElementCommand
* @property {module:utilities.decode64} decode64
* @property {module:utilities.dropXMLInteralSubset} dropXMLInteralSubset
* @property {module:utilities.encode64} encode64
* @property {module:svgcanvas~ffClone} ffClone
* @property {module:svgcanvas~findDuplicateGradient} findDuplicateGradient
* @property {module:utilities.getPathBBox} getPathBBox
* @property {module:units.getTypeMap} getTypeMap
* @property {module:draw.identifyLayers} identifyLayers
* @property {module:history.HistoryCommand} InsertElementCommand
* @property {module:browser.isChrome} isChrome
* @property {module:math.isIdentity} isIdentity
* @property {module:browser.isIE} isIE
* @property {module:svgcanvas~logMatrix} logMatrix
* @property {module:history.HistoryCommand} MoveElementCommand
* @property {module:namespaces.NS} NS
* @property {module:utilities.preventClickDefault} preventClickDefault
* @property {module:history.HistoryCommand} RemoveElementCommand
* @property {module:SVGTransformList.SVGEditTransformList} SVGEditTransformList
* @property {module:utilities.text2xml} text2xml
* @property {module:math.transformBox} transformBox
* @property {module:math.transformPoint} transformPoint
* @property {module:utilities.walkTree} walkTree
*/
/**
* @deprecated getPrivateMethods
* Since all methods are/should be public somehow, this function should be removed;
*  we might require `import` in place of this in the future once ES6 Modules
*  widespread

* Being able to access private methods publicly seems wrong somehow,
* but currently appears to be the best way to allow testing and provide
* access to them to plugins.
* @function module:svgcanvas.SvgCanvas#getPrivateMethods
* @returns {module:svgcanvas.PrivateMethods}
*/
this.getPrivateMethods = function () {
  const obj = {
    addCommandToHistory,
    BatchCommand,
    ChangeElementCommand,
    decode64,
    dropXMLInteralSubset,
    encode64,
    ffClone,
    findDefs,
    findDuplicateGradient,
    getElem,
    getPathBBox,
    getTypeMap,
    getUrlFromAttr,
    identifyLayers: draw.identifyLayers,
    InsertElementCommand,
    isChrome,
    isIdentity,
    isIE,
    logMatrix,
    MoveElementCommand,
    NS,
    preventClickDefault,
    RemoveElementCommand,
    SVGEditTransformList,
    text2xml,
    transformBox,
    transformPoint,
    walkTree
  };
  return obj;
};
  } // End constructor
} // End class

export default SvgCanvas;
