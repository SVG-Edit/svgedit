/* eslint-disable indent */
/* globals jQuery, jsPDF */
/*
 * svgcanvas.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 *
 */

/* Dependencies:
1. Also expects jQuery UI for `svgCanvasToString` and
`convertToGroup` use of `:data()` selector
*/

import './pathseg.js';
import canvg from './canvg/canvg.js';
import jqPluginSVG from './jquery-svg.js'; // Needed for SVG attribute setting and array form with `attr`

import * as draw from './draw.js';
import * as pathModule from './path.js';
import {sanitizeSvg} from './sanitize.js';
import {getReverseNS, NS} from './svgedit.js';
import {
  text2xml, assignAttributes, cleanupElement, getElem, getUrlFromAttr,
  findDefs, getHref, setHref, getRefElem, getRotationAngle, getPathBBox,
  preventClickDefault, snapToGrid, walkTree, walkTreePost,
  getBBoxOfElementAsPath, convertToPath, toXml, encode64, decode64,
  buildJSPDFCallback, dataURLToObjectURL, createObjectURL,
  buildCanvgCallback, getVisibleElements, executeAfterLoads,
  init as utilsInit, getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible
} from './svgutils.js';
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
  window.console.log = function (str) { opera.postError(str); };
  window.console.dir = function (str) {};
}

// Class: SvgCanvas
// The main SvgCanvas class that manages all SVG-related functions
//
// Parameters:
// container - The container HTML element that should hold the SVG root element
// config - An object that contains configuration data

export default class {
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
container.appendChild(svgroot);

// The actual element that represents the final output SVG element
let svgcontent = svgdoc.createElementNS(NS.SVG, 'svg');

// This function resets the svgcontent element while keeping it in the DOM.
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
  svgcontent.appendChild(comment);
};
clearSvgContentElement();

// Prefix string for element IDs
let idprefix = 'svg_';

// Function: setIdPrefix
// Changes the ID prefix to the given value
//
// Parameters:
// p - String with the new prefix
canvas.setIdPrefix = function (p) {
  idprefix = p;
};

// Current svgedit.draw.Drawing object
// @type {svgedit.draw.Drawing}
canvas.current_drawing_ = new draw.Drawing(svgcontent, idprefix);

// Function: getCurrentDrawing
// Returns the current Drawing.
// @return {svgedit.draw.Drawing}
const getCurrentDrawing = canvas.getCurrentDrawing = function () {
  return canvas.current_drawing_;
};

// Float displaying the current zoom level (1 = 100%, .5 = 50%, etc)
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
* Create a new SVG element based on the given object keys/values and add it to the current layer
* The element will be ran through cleanupElement before being returned
*
* @param data - Object with the following keys/values:
* @param data.element - tag name of the SVG element to create
* @paramdata.attr - Object with attributes key-values to assign to the new element
* @param data.curStyles - Boolean indicating that current style attributes should be applied first
* @param data.children - Optional array with data objects to be added recursively as children
*
* @returns The new element
*/
const addSvgElementFromJson = this.addSvgElementFromJson = function (data) {
  if (typeof data === 'string') return svgdoc.createTextNode(data);

  let shape = getElem(data.attr.id);
  // if shape is a path but we need to create a rect/ellipse, then remove the path
  const currentLayer = getCurrentDrawing().getCurrentLayer();
  if (shape && data.element !== shape.tagName) {
    currentLayer.removeChild(shape);
    shape = null;
  }
  if (!shape) {
    shape = svgdoc.createElementNS(NS.SVG, data.element);
    if (currentLayer) {
      (currentGroup || currentLayer).appendChild(shape);
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
    data.children.forEach(function (child) {
      shape.appendChild(addSvgElementFromJson(child));
    });
  }

  return shape;
};

canvas.getTransformList = getTransformList;

canvas.matrixMultiply = matrixMultiply;
canvas.hasMatrixTransform = hasMatrixTransform;
canvas.transformListToTransform = transformListToTransform;

// initialize from units.js
// send in an object implementing the ElementContainer interface (see units.js)
unitsInit({
  getBaseUnit () { return curConfig.baseUnit; },
  getElement: getElem,
  getHeight () { return svgcontent.getAttribute('height') / currentZoom; },
  getWidth () { return svgcontent.getAttribute('width') / currentZoom; },
  getRoundDigits () { return saveOptions.round_digits; }
});

canvas.convertToNum = convertToNum;

const getSVGContent = () => { return svgcontent; };

// Returns the array with selected DOM elements
const getSelectedElements = this.getSelectedElems = function () {
  return selectedElements;
};

const pathActions = pathModule.pathActions;

utilsInit({
  pathActions, // Ok since not modifying
  getSVGContent,
  addSvgElementFromJson,
  getSelectedElements,
  getDOMDocument () { return svgdoc; },
  getDOMContainer () { return container; },
  getSVGRoot () { return svgroot; },
  // TODO: replace this mostly with a way to get the current drawing.
  getBaseUnit () { return curConfig.baseUnit; },
  getSnappingStep () { return curConfig.snappingStep; }
});

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

const getGridSnapping = () => { return curConfig.gridSnapping; };
coordsInit({
  getDrawing () { return getCurrentDrawing(); },
  getSVGRoot () { return svgroot; },
  getGridSnapping
});
this.remapElement = remapElement;

recalculateInit({
  getSVGRoot () { return svgroot; },
  getStartTransform () { return startTransform; },
  setStartTransform (transform) { startTransform = transform; }
});
this.recalculateDimensions = recalculateDimensions;

// import from sanitize.js
const nsMap = getReverseNS();
canvas.sanitizeSvg = sanitizeSvg;

// Implement the svgedit.history.HistoryEventHandler interface.
const undoMgr = canvas.undoMgr = new UndoManager({
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
        //    parent.removeChild(elem);
        //    parent.insertBefore(elem, sib);
        //  }
        // }
      }
    }
  }
});
const addCommandToHistory = function (cmd) {
  canvas.undoMgr.addCommandToHistory(cmd);
};

// Returns the current zoom level
const getCurrentZoom = this.getZoom = function () { return currentZoom; };

// This method rounds the incoming value to the nearest value based on the currentZoom
const round = this.round = function (val) {
  return parseInt(val * currentZoom, 10) / currentZoom;
};

// import from select.js
selectInit(curConfig, {
  createSVGElement (jsonMap) { return canvas.addSvgElementFromJson(jsonMap); },
  svgRoot () { return svgroot; },
  svgContent () { return svgcontent; },
  getCurrentZoom
});
// this object manages selectors for us
const selectorManager = this.selectorManager = getSelectorManager();

const getNextId = canvas.getNextId = function () { return getCurrentDrawing().getNextId(); };
const getId = canvas.getId = function () { return getCurrentDrawing().getId(); };

// Run the callback function associated with the given event
//
// Parameters:
// event - String with the event name
// arg - Argument to pass through to the callback function
const call = function (event, arg) {
  if (events[event]) {
    return events[event](window, arg);
  }
};

/**
* Clears the selection. The 'selected' handler is then called.
* @param {Boolean} [noCall] - When true does not call the "selected" handler
*/
const clearSelection = function (noCall) {
  selectedElements.map(function (elem) {
    if (elem == null) return;

    selectorManager.releaseSelector(elem);
  });
  selectedElements = [];

  if (!noCall) { call('selected', selectedElements); }
};

// Adds a list of elements to the selection. The 'selected' handler is then called.
//
// Parameters:
// elemsToAdd - an array of DOM elements to add to the selection
// showGrips - a boolean flag indicating whether the resize grips should be shown
const addToSelection = function (elemsToAdd, showGrips) {
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

const getOpacity = function () {
  return curShape.opacity;
};

// Gets the desired element from a mouse event
//
// Parameters:
// evt - Event object from the mouse event
//
// Returns:
// DOM element we want
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

canvas.pathActions = pathActions;
function resetD (p) {
  p.setAttribute('d', pathActions.convertPath(p));
}
pathModule.init({
  selectorManager, // Ok since not changing
  canvas, // Ok since not changing
  call,
  resetD,
  round,
  clearSelection,
  addToSelection,
  addCommandToHistory,
  remapElement,
  addSvgElementFromJson,
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
  addPtsToSelection ({closedSubpath, grips}) {
    // TODO: Correct this:
    pathActions.canDeleteNodes = true;
    pathActions.closed_subpath = closedSubpath;
    call('selected', grips);
  },
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
  setCurrentmode (cm) {
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
  getSVGRoot () { return svgroot; }
});

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
        findDefs().appendChild(removedElements[id]);
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
//  svgroot.appendChild(svgthumb);
// }());

// Object to contain image data for raster images that were found encodable
const encodableImages = {},

  // Object with save options
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

// Should this return an array by default, so extension results aren't overwritten?
const runExtensions = this.runExtensions = function (action, vars, returnArray) {
  let result = returnArray ? [] : false;
  $.each(extensions, function (name, opts) {
    if (opts && action in opts) {
      if (returnArray) {
        result.push(opts[action](vars));
      } else {
        result = opts[action](vars);
      }
    }
  });
  return result;
};

// Function: addExtension
// Add an extension to the editor
//
// Parameters:
// name - String with the ID of the extension
// extFunc - Function supplied by the extension with its data
this.addExtension = function (name, extFunc) {
  let ext;
  if (!(name in extensions)) {
    // Provide private vars/funcs here. Is there a better way to do this?
    const argObj = $.extend(canvas.getPrivateMethods(), {
      svgroot,
      svgcontent,
      nonce: getCurrentDrawing().getNonce(),
      selectorManager
    });
    if (typeof extFunc === 'function') {
      ext = extFunc(argObj);
    } else {
      ext = extFunc;
      if (ext.callback) {
        ext.callback = ext.callback.bind(ext, argObj);
      }
    }
    extensions[name] = ext;
    call('extension_added', ext);
  } else {
    console.log('Cannot add extension "' + name + '", an extension by that name already exists.');
  }
};

// This method sends back an array or a NodeList full of elements that
// intersect the multi-select rubber-band-box on the currentLayer only.
//
// We brute-force getIntersectionList for browsers that do not support it (Firefox).
//
// Reference:
// Firefox does not implement getIntersectionList(), see https://bugzilla.mozilla.org/show_bug.cgi?id=501421
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

// Function: getVisibleElementsAndBBoxes
// Get all elements that have a BBox (excludes <defs>, <title>, etc).
// Note that 0-opacity, off-screen etc elements are still considered "visible"
// for this function
//
// Parameters:
// parent - The parent DOM element to search within
//
// Returns:
// An array with objects that include:
// * elem - The element
// * bbox - The element's BBox as retrieved from getStrokedBBoxDefaultVisible
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

// Function: groupSvgElem
// Wrap an SVG element into a group element, mark the group as 'gsvg'
//
// Parameters:
// elem - SVG element to wrap
const groupSvgElem = this.groupSvgElem = function (elem) {
  const g = document.createElementNS(NS.SVG, 'g');
  elem.parentNode.replaceChild(g, elem);
  $(g).append(elem).data('gsvg', elem)[0].id = getNextId();
};

// Set scope for these functions

// Object to contain editor event names and callback functions
const events = {};

canvas.call = call;

// Function: bind
// Attaches a callback function to an event
//
// Parameters:
// event - String indicating the name of the event
// f - The callback function to bind to the event
//
// Return:
// The previous event
canvas.bind = function (event, f) {
  const old = events[event];
  events[event] = f;
  return old;
};

// Function: canvas.prepareSvg
// Runs the SVG Document through the sanitizer and then updates its paths.
//
// Parameters:
// newDoc - The SVG DOM document
this.prepareSvg = function (newDoc) {
  this.sanitizeSvg(newDoc.documentElement);

  // convert paths into absolute commands
  const paths = newDoc.getElementsByTagNameNS(NS.SVG, 'path');
  for (let i = 0, len = paths.length; i < len; ++i) {
    const path = paths[i];
    path.setAttribute('d', pathActions.convertPath(path));
    pathActions.fixEnd(path);
  }
};

// Function: ffClone
// Hack for Firefox bugs where text element features aren't updated or get
// messed up. See issue 136 and issue 137.
// This function clones the element and re-selects it
// TODO: Test for this bug on load and add it to "support" object instead of
// browser sniffing
//
// Parameters:
// elem - The (text) DOM element to clone
const ffClone = function (elem) {
  if (!isGecko()) { return elem; }
  const clone = elem.cloneNode(true);
  elem.parentNode.insertBefore(clone, elem);
  elem.parentNode.removeChild(elem);
  selectorManager.releaseSelector(elem);
  selectedElements[0] = clone;
  selectorManager.requestSelector(clone).showGrips(true);
  return clone;
};

// this.each is deprecated, if any extension used this it can be recreated by doing this:
// $(canvas.getRootElem()).children().each(...)

// this.each = function (cb) {
//  $(svgroot).children().each(cb);
// };

// Function: setRotationAngle
// Removes any old rotations if present, prepends a new rotation at the
// transformed center
//
// Parameters:
// val - The new rotation angle in degrees
// preventUndo - Boolean indicating whether the action should be undoable or not
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

// Function: recalculateAllSelectedDimensions
// Runs recalculateDimensions on the selected elements,
// adding the changes to a single batch command
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

// Debug tool to easily see the current matrix in the browser's console
const logMatrix = function (m) {
  console.log([m.a, m.b, m.c, m.d, m.e, m.f]);
};

// Root Current Transformation Matrix in user units
let rootSctm = null;

// Group: Selection

this.clearSelection = clearSelection;

// TODO: do we need to worry about selectedBBoxes here?

this.addToSelection = addToSelection;

// Function: selectOnly()
// Selects only the given elements, shortcut for clearSelection(); addToSelection()
//
// Parameters:
// elems - an array of DOM elements to be selected
const selectOnly = this.selectOnly = function (elems, showGrips) {
  clearSelection(true);
  addToSelection(elems, showGrips);
};

// TODO: could use slice here to make this faster?
// TODO: should the 'selected' handler

// Function: removeFromSelection
// Removes elements from the selection.
//
// Parameters:
// elemsToRemove - an array of elements to remove from selection
/* const removeFromSelection = */ this.removeFromSelection = function (elemsToRemove) {
  if (selectedElements[0] == null) { return; }
  if (!elemsToRemove.length) { return; }

  // find every element and remove it from our array copy
  let j = 0;
  const newSelectedItems = [],
    len = selectedElements.length;
  newSelectedItems.length = len;
  for (let i = 0; i < len; ++i) {
    const elem = selectedElements[i];
    if (elem) {
      // keep the item
      if (!elemsToRemove.includes(elem)) {
        newSelectedItems[j] = elem;
        j++;
      } else { // remove the item and its selector
        selectorManager.releaseSelector(elem);
      }
    }
  }
  // the copy becomes the master now
  selectedElements = newSelectedItems;
};

// Function: selectAllInCurrentLayer
// Clears the selection, then adds all elements in the current layer to the selection.
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
// - when we are in a create mode, the element is added to the canvas
// but the action is not recorded until mousing up
// - when we are in select mode, select the element, remember the position
// and do nothing else
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
    strokeW = parseFloat(curShape.stroke_width) === 0 ? 1 : curShape.stroke_width;
    addSvgElementFromJson({
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
    const newImage = addSvgElementFromJson({
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
    addSvgElementFromJson({
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
    addSvgElementFromJson({
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
    addSvgElementFromJson({
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
    addSvgElementFromJson({
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
    /* const newText = */ addSvgElementFromJson({
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

  const extResult = runExtensions('mouseDown', {
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

      if (evt.shiftKey) {
        xya = snapToAngle(startX, startY, x, y);
        ({x, y} = xya);
      }

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
          dAttr += +bSpline.x + ',' + bSpline.y + ' ';
          shape.setAttributeNS(null, 'points', dAttr);
          sumDistance -= THRESHOLD_DIST;
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

  runExtensions('mouseMove', {
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
    keep = (attrs.width !== '0' || attrs.height !== '0') || currentMode === 'image';
    break;
  case 'circle':
    keep = (element.getAttribute('r') !== '0');
    break;
  case 'ellipse':
    attrs = $(element).attr(['rx', 'ry']);
    keep = (attrs.rx != null || attrs.ry != null);
    break;
  case 'fhellipse':
    if ((freehand.maxx - freehand.minx) > 0 &&
      (freehand.maxy - freehand.miny) > 0) {
      element = addSvgElementFromJson({
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
      element = addSvgElementFromJson({
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

  const extResult = runExtensions('mouseUp', {
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
    element.parentNode.removeChild(element);
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
$(container).bind('mousewheel DOMMouseScroll', function (e) {
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
});
}());

// Group: Text edit functions
// Functions relating to editing text elements
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
    getElem('selectorParentGroup').appendChild(selblock);
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

return {
  select (target, x, y) {
    curtext = target;
    textActions.toEditMode(x, y);
  },
  start (elem) {
    curtext = elem;
    textActions.toEditMode();
  },
  mouseDown (evt, mouseTarget, startX, startY) {
    const pt = screenToPt(startX, startY);

    textinput.focus();
    setCursorFromPoint(pt.x, pt.y);
    lastX = startX;
    lastY = startY;

    // TODO: Find way to block native selection
  },
  mouseMove (mouseX, mouseY) {
    const pt = screenToPt(mouseX, mouseY);
    setEndSelectionFromPoint(pt.x, pt.y);
  },
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
  setCursor,
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
  setInputElem (elem) {
    textinput = elem;
    // $(textinput).blur(hideCursor);
  },
  clear () {
    if (currentMode === 'textedit') {
      textActions.toSelectMode();
    }
  },
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

// Group: Serialization

// Function: removeUnusedDefElems
// Looks at DOM elements inside the <defs> to see if they are referred to,
// removes them from the DOM if they are not.
//
// Returns:
// The amount of elements that were removed
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
      defelem.parentNode.removeChild(defelem);
      numRemoved++;
    }
  }

  return numRemoved;
};

// Function: svgCanvasToString
// Main function to set up the SVG content for output
//
// Returns:
// String containing the SVG image for output
this.svgCanvasToString = function () {
  // keep calling it until there are none to remove
  while (removeUnusedDefElems() > 0) {}

  pathActions.clear(true);

  // Keep SVG-Edit comment on top
  $.each(svgcontent.childNodes, function (i, node) {
    if (i && node.nodeType === 8 && node.data.includes('Created with')) {
      svgcontent.insertBefore(node, svgcontent.firstChild);
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

// Function: svgToString
// Sub function ran on each SVG element to convert it to a string as desired
//
// Parameters:
// elem - The SVG element to convert
// indent - Integer with the amount of spaces to indent this tag
//
// Returns:
// String with the given element as an SVG tag
this.svgToString = function (elem, indent) {
  const out = [];
  const unit = curConfig.baseUnit;
  const unitRe = new RegExp('^-?[\\d\\.]+' + unit + '$');

  if (elem) {
    cleanupElement(elem);
    const attrs = elem.attributes;
    let attr, i;
    const childs = elem.childNodes;

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
        attr = attrs.item(i);
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
        attr = attrs.item(i);
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

// Function: embedImage
// Converts a given image file to a data URL when possible, then runs a given callback
//
// Parameters:
// val - String with the path/URL of the image
// callback - Optional function to run when image data is found, supplies the
// result (data URL or false) as first parameter.
this.embedImage = function (val, callback) {
  // load in the image and once it's loaded, get the dimensions
  $(new Image()).load(function () {
    // create a canvas the same size as the raster image
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    // load the raster image into the canvas
    canvas.getContext('2d').drawImage(this, 0, 0);
    // retrieve the data: URL
    try {
      let urldata = ';svgedit_url=' + encodeURIComponent(val);
      urldata = canvas.toDataURL().replace(';base64', urldata + ';base64');
      encodableImages[val] = urldata;
    } catch (e) {
      encodableImages[val] = false;
    }
    lastGoodImgUrl = val;
    if (callback) { callback(encodableImages[val]); }
  }).attr('src', val);
};

// Function: setGoodImage
// Sets a given URL to be a "last good image" URL
this.setGoodImage = function (val) {
  lastGoodImgUrl = val;
};

this.open = function () {
  // Nothing by default, handled by optional widget/extension
};

// Function: save
// Serializes the current drawing into SVG XML text and returns it to the 'saved' handler.
// This function also includes the XML prolog. Clients of the SvgCanvas bind their save
// function to the 'saved' event.
//
// Returns:
// Nothing
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
function getIssues ({codesOnly = false} = {}) {
  // remove the selected outline before serializing
  clearSelection();

  // Check for known CanVG issues
  const issues = [];

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
      issues.push(codesOnly ? sel : descr);
    }
  });
  return issues;
}

// Function: rasterExport
// Generates a Data URL based on the current image, then calls "exported"
// with an object including the string, image information, and any issues found
this.rasterExport = function (imgType, quality, exportWindowName) {
  const mimeType = 'image/' + imgType.toLowerCase();
  const issues = getIssues();
  const issueCodes = getIssues({codesOnly: true});
  const str = this.svgCanvasToString();

  buildCanvgCallback(function () {
    const type = imgType || 'PNG';
    if (!$('#export_canvas').length) {
      $('<canvas>', {id: 'export_canvas'}).hide().appendTo('body');
    }
    const c = $('#export_canvas')[0];
    c.width = canvas.contentW;
    c.height = canvas.contentH;

    canvg(c, str, {renderCallback () {
      const dataURLType = (type === 'ICO' ? 'BMP' : type).toLowerCase();
      const datauri = quality ? c.toDataURL('image/' + dataURLType, quality) : c.toDataURL('image/' + dataURLType);
      if (c.toBlob) {
        c.toBlob(function (blob) {
          const bloburl = createObjectURL(blob);
          call('exported', {datauri, bloburl, svg: str, issues, issueCodes, type: imgType, mimeType, quality, exportWindowName});
        }, mimeType, quality);
        return;
      }
      const bloburl = dataURLToObjectURL(datauri);
      call('exported', {datauri, bloburl, svg: str, issues, issueCodes, type: imgType, mimeType, quality, exportWindowName});
    }});
  })();
};

this.exportPDF = function (exportWindowName, outputType) {
  const that = this;
  buildJSPDFCallback(function () {
    const res = getResolution();
    const orientation = res.w > res.h ? 'landscape' : 'portrait';
    const unit = 'pt'; // curConfig.baseUnit; // We could use baseUnit, but that is presumably not intended for export purposes
    const doc = jsPDF({
      orientation,
      unit,
      format: [res.w, res.h]
      // , compressPdf: true
    }); // Todo: Give options to use predefined jsPDF formats like "a4", etc. from pull-down (with option to keep customizable)
    const docTitle = getDocumentTitle();
    doc.setProperties({
      title: docTitle /* ,
      subject: '',
      author: '',
      keywords: '',
      creator: '' */
    });
    const issues = getIssues();
    const issueCodes = getIssues({codesOnly: true});
    const str = that.svgCanvasToString();
    doc.addSVG(str, 0, 0);

    // doc.output('save'); // Works to open in a new
    //  window; todo: configure this and other export
    //  options to optionally work in this manner as
    //  opposed to opening a new tab
    const obj = {svg: str, issues, issueCodes, exportWindowName};
    const method = outputType || 'dataurlstring';
    obj[method] = doc.output(method);
    call('exportedPDF', obj);
  })();
};

// Function: getSvgString
// Returns the current drawing as raw SVG XML text.
//
// Returns:
// The current drawing as raw SVG XML text.
this.getSvgString = function () {
  saveOptions.apply = false;
  return this.svgCanvasToString();
};

// Function: randomizeIds
// This function determines whether to use a nonce in the prefix, when
// generating IDs for future documents in SVG-Edit.
//
// Parameters:
// an optional boolean, which, if true, adds a nonce to the prefix. Thus
// svgCanvas.randomizeIds() <==> svgCanvas.randomizeIds(true)
//
// if you're controlling SVG-Edit externally, and want randomized IDs, call
// this BEFORE calling svgCanvas.setSvgString
//
this.randomizeIds = function (enableRandomization) {
  if (arguments.length > 0 && enableRandomization === false) {
    draw.randomizeIds(false, getCurrentDrawing());
  } else {
    draw.randomizeIds(true, getCurrentDrawing());
  }
};

// Function: uniquifyElems
// Ensure each element has a unique ID
//
// Parameters:
// g - The parent element of the tree to give unique IDs
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

// Function setUseData
// Assigns reference data for each use element
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

// Function convertGradients
// Converts gradients from userSpaceOnUse to objectBoundingBox
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

// Function: convertToGroup
// Converts selected/given <use> or child SVG element to a group
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
      g.appendChild(childs[i].cloneNode(true));
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
        parent.removeChild(elem);
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

//
// Function: setSvgString
// This function sets the current drawing as the input SVG XML.
//
// Parameters:
// xmlString - The SVG as XML text.
// preventUndo - Boolean (defaults to false) indicating if we want to do the
// changes without adding them to the undo stack - e.g. for initializing a
// drawing on page load.
//
// Returns:
// This function returns false if the set was unsuccessful, true otherwise.
this.setSvgString = function (xmlString, preventUndo) {
  try {
    // convert string into XML document
    const newDoc = text2xml(xmlString);

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

    svgroot.appendChild(svgcontent);
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
    svgroot.appendChild(selectorManager.selectorParentGroup);

    if (!preventUndo) addCommandToHistory(batchCmd);
    call('changed', [svgcontent]);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
};

// Function: importSvgString
// This function imports the input SVG XML as a <symbol> in the <defs>, then adds a
// <use> to the current layer.
//
// Parameters:
// xmlString - The SVG as XML text.
//
// Returns:
// This function returns null if the import was unsuccessful, or the element otherwise.
// TODO:
// * properly handle if namespace is introduced by imported content (must add to svgcontent
// and update all prefixes in the imported node)
// * properly handle recalculating dimensions, recalculateDimensions() doesn't handle
// arbitrary transform lists, but makes some assumptions about how the transform list
// was obtained
// * import should happen in top-left of current zoomed viewport
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
        symbol.appendChild(first);
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

      findDefs().appendChild(symbol);
      batchCmd.addSubCommand(new InsertElementCommand(symbol));
    }

    useEl = svgdoc.createElementNS(NS.SVG, 'use');
    useEl.id = getNextId();
    setHref(useEl, '#' + symbol.id);

    (currentGroup || getCurrentDrawing().getCurrentLayer()).appendChild(useEl);
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
draw.init({
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
  changeSvgcontent () {
    call('changed', [svgcontent]);
  }
});

// Group: Document functions

// Function: clear
// Clears the current document. This is not an undoable action.
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

// Function: linkControlPoints
// Alias function
this.linkControlPoints = pathActions.linkControlPoints;

// Function: getContentElem
// Returns the content DOM element
this.getContentElem = function () { return svgcontent; };

// Function: getRootElem
// Returns the root DOM element
this.getRootElem = function () { return svgroot; };

// Function: getResolution
// Returns the current dimensions and zoom level in an object
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

// Function: getSnapToGrid
// Returns the current snap to grid setting
this.getSnapToGrid = function () { return curConfig.gridSnapping; };

// Function: getVersion
// Returns a string which describes the revision number of SvgCanvas.
this.getVersion = function () {
  return 'svgcanvas.js ($Rev$)';
};

/**
* Update interface strings with given values
* @param strs - Object with strings (see locales file)
*/
this.setUiStrings = function (strs) {
  Object.assign(uiStrings, strs.notification);
  pathModule.setUiStrings(strs);
};

// Function: setConfig
// Update configuration options with given values
//
// Parameters:
// opts - Object with options (see curConfig for examples)
this.setConfig = function (opts) {
  Object.assign(curConfig, opts);
};

// Function: getTitle
// Returns the current group/SVG's title contents
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

// Function: setGroupTitle
// Sets the group/SVG's title content
// TODO: Combine this with setDocumentTitle
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

// Function: getDocumentTitle
// Returns the current document title or an empty string if not found
const getDocumentTitle = this.getDocumentTitle = function () {
  return canvas.getTitle(svgcontent);
};

// Function: setDocumentTitle
// Adds/updates a title element for the document with the given name.
// This is an undoable action
//
// Parameters:
// newtitle - String with the new title
this.setDocumentTitle = function (newtitle) {
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
  }

  if (newtitle.length) {
    docTitle.textContent = newtitle;
  } else {
    // No title given, so element is not necessary
    docTitle.parentNode.removeChild(docTitle);
  }
  batchCmd.addSubCommand(new ChangeElementCommand(docTitle, {'#text': oldTitle}));
  addCommandToHistory(batchCmd);
};

// Function: getEditorNS
// Returns the editor's namespace URL, optionally adds it to root element
//
// Parameters:
// add - Boolean to indicate whether or not to add the namespace value
this.getEditorNS = function (add) {
  if (add) {
    svgcontent.setAttribute('xmlns:se', NS.SE);
  }
  return NS.SE;
};

// Function: setResolution
// Changes the document's dimensions to the given size
//
// Parameters:
// x - Number with the width of the new dimensions in user units.
// Can also be the string "fit" to indicate "fit to content"
// y - Number with the height of the new dimensions in user units.
//
// Returns:
// Boolean to indicate if resolution change was succesful.
// It will fail on "fit to content" option with no content to fit to.
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

// Function: getOffset
// Returns an object with x, y values indicating the svgcontent element's
// position in the editor's canvas.
this.getOffset = function () {
  return $(svgcontent).attr(['x', 'y']);
};

// Function: setBBoxZoom
// Sets the zoom level on the canvas-side based on the given value
//
// Parameters:
// val - Bounding box object to zoom to or string indicating zoom option
// editorW - Integer with the editor's workarea box's width
// editorH - Integer with the editor's workarea box's height
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

// Function: setZoom
// Sets the zoom to the given level
//
// Parameters:
// zoomlevel - Float indicating the zoom level to change to
this.setZoom = function (zoomlevel) {
  const res = getResolution();
  svgcontent.setAttribute('viewBox', '0 0 ' + res.w / zoomlevel + ' ' + res.h / zoomlevel);
  currentZoom = zoomlevel;
  $.each(selectedElements, function (i, elem) {
    if (!elem) { return; }
    selectorManager.requestSelector(elem).resize();
  });
  pathActions.zoomChange();
  runExtensions('zoomChanged', zoomlevel);
};

// Function: getMode
// Returns the current editor mode string
this.getMode = function () {
  return currentMode;
};

// Function: setMode
// Sets the editor's mode to the given string
//
// Parameters:
// name - String with the new mode to change to
this.setMode = function (name) {
  pathActions.clear(true);
  textActions.clear();
  curProperties = (selectedElements[0] && selectedElements[0].nodeName === 'text') ? curText : curShape;
  currentMode = name;
};

// Group: Element Styling

// Function: getColor
// Returns the current fill/stroke option
this.getColor = function (type) {
  return curProperties[type];
};

// Function: setColor
// Change the current stroke/fill color/gradient value
//
// Parameters:
// type - String indicating fill or stroke
// val - The value to set the stroke attribute to
// preventUndo - Boolean indicating whether or not this should be and undoable option
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

// Function: setGradient
// Apply the current gradient to selected element's fill or stroke
//
// Parameters
// type - String indicating "fill" or "stroke" to apply to an element
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

// Function: findDuplicateGradient
// Check if exact gradient already exists
//
// Parameters:
// grad - The gradient DOM element to compare to others
//
// Returns:
// The existing gradient if found, null if not
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

// Function: setPaint
// Set a color/gradient to a fill/stroke
//
// Parameters:
// type - String with "fill" or "stroke"
// paint - The jGraduate paint object to apply
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

// alias
this.setStrokePaint = function (paint) {
  this.setPaint('stroke', paint);
};

this.setFillPaint = function (paint) {
  this.setPaint('fill', paint);
};

// Function: getStrokeWidth
// Returns the current stroke-width value
this.getStrokeWidth = function () {
  return curProperties.stroke_width;
};

// Function: setStrokeWidth
// Sets the stroke width for the current selected elements
// When attempting to set a line's width to 0, this changes it to 1 instead
//
// Parameters:
// val - A Float indicating the new stroke width value
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

// Function: setStrokeAttr
// Set the given stroke-related attribute the given value for selected elements
//
// Parameters:
// attr - String with the attribute name
// val - String or number with the attribute value
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

// Function: getStyle
// Returns current style options
this.getStyle = function () {
  return curShape;
};

// Returns the current opacity
this.getOpacity = getOpacity;

// Function: setOpacity
// Sets the given opacity to the current selected elements
this.setOpacity = function (val) {
  curShape.opacity = val;
  changeSelectedAttribute('opacity', val);
};

// Function: getOpacity
// Returns the current fill opacity
this.getFillOpacity = function () {
  return curShape.fill_opacity;
};

// Function: getStrokeOpacity
// Returns the current stroke opacity
this.getStrokeOpacity = function () {
  return curShape.stroke_opacity;
};

// Function: setPaintOpacity
// Sets the current fill/stroke opacity
//
// Parameters:
// type - String with "fill" or "stroke"
// val - Float with the new opacity value
// preventUndo - Boolean indicating whether or not this should be an undoable action
this.setPaintOpacity = function (type, val, preventUndo) {
  curShape[type + '_opacity'] = val;
  if (!preventUndo) {
    changeSelectedAttribute(type + '-opacity', val);
  } else {
    changeSelectedAttributeNoUndo(type + '-opacity', val);
  }
};

// Function: getPaintOpacity
// Gets the current fill/stroke opacity
//
// Parameters:
// type - String with "fill" or "stroke"
this.getPaintOpacity = function (type) {
  return type === 'fill' ? this.getFillOpacity() : this.getStrokeOpacity();
};

// Function: getBlur
// Gets the stdDeviation blur value of the given element
//
// Parameters:
// elem - The element to check the blur value for
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

// Function: setBlurNoUndo
// Sets the stdDeviation blur value on the selected element without being undoable
//
// Parameters:
// val - The new stdDeviation value
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

// Function: setBlurOffsets
// Sets the x, y, with, height values of the filter element in order to
// make the blur not be clipped. Removes them if not neeeded
//
// Parameters:
// filter - The filter DOM element to update
// stdDev - The standard deviation value on which to base the offset size
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

// Function: setBlur
// Adds/updates the blur filter to the selected element
//
// Parameters:
// val - Float with the new stdDeviation blur value
// complete - Boolean indicating whether or not the action should be completed (to add to the undo manager)
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
    const newblur = addSvgElementFromJson({ element: 'feGaussianBlur',
      attr: {
        in: 'SourceGraphic',
        stdDeviation: val
      }
    });

    filter = addSvgElementFromJson({ element: 'filter',
      attr: {
        id: elemId + '_blur'
      }
    });

    filter.appendChild(newblur);
    findDefs().appendChild(filter);

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

// Function: getBold
// Check whether selected element is bold or not
//
// Returns:
// Boolean indicating whether or not element is bold
this.getBold = function () {
  // should only have one element selected
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    return (selected.getAttribute('font-weight') === 'bold');
  }
  return false;
};

// Function: setBold
// Make the selected element bold or normal
//
// Parameters:
// b - Boolean indicating bold (true) or normal (false)
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

// Function: getItalic
// Check whether selected element is italic or not
//
// Returns:
// Boolean indicating whether or not element is italic
this.getItalic = function () {
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' &&
    selectedElements[1] == null) {
    return (selected.getAttribute('font-style') === 'italic');
  }
  return false;
};

// Function: setItalic
// Make the selected element italic or normal
//
// Parameters:
// b - Boolean indicating italic (true) or normal (false)
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

// Function: getFontFamily
// Returns the current font family
this.getFontFamily = function () {
  return curText.font_family;
};

// Function: setFontFamily
// Set the new font family
//
// Parameters:
// val - String with the new font family
this.setFontFamily = function (val) {
  curText.font_family = val;
  changeSelectedAttribute('font-family', val);
  if (selectedElements[0] && !selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

// Function: setFontColor
// Set the new font color
//
// Parameters:
// val - String with the new font color
this.setFontColor = function (val) {
  curText.fill = val;
  changeSelectedAttribute('fill', val);
};

// Function: getFontColor
// Returns the current font color
this.getFontColor = function () {
  return curText.fill;
};

// Function: getFontSize
// Returns the current font size
this.getFontSize = function () {
  return curText.font_size;
};

// Function: setFontSize
// Applies the given font size to the selected element
//
// Parameters:
// val - Float with the new font size
this.setFontSize = function (val) {
  curText.font_size = val;
  changeSelectedAttribute('font-size', val);
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

// Function: getText
// Returns the current text (textContent) of the selected element
this.getText = function () {
  const selected = selectedElements[0];
  if (selected == null) { return ''; }
  return selected.textContent;
};

// Function: setTextContent
// Updates the text element with the given string
//
// Parameters:
// val - String with the new text
this.setTextContent = function (val) {
  changeSelectedAttribute('#text', val);
  textActions.init(val);
  textActions.setCursor();
};

// Function: setImageURL
// Sets the new image URL for the selected image element. Updates its size if
// a new URL is given
//
// Parameters:
// val - String with the image URL/path
this.setImageURL = function (val) {
  const elem = selectedElements[0];
  if (!elem) { return; }

  const attrs = $(elem).attr(['width', 'height']);
  let setsize = (!attrs.width || !attrs.height);

  const curHref = getHref(elem);

  // Do nothing if no URL change or size change
  if (curHref !== val) {
    setsize = true;
  } else if (!setsize) { return; }

  const batchCmd = new BatchCommand('Change Image URL');

  setHref(elem, val);
  batchCmd.addSubCommand(new ChangeElementCommand(elem, {
    '#href': curHref
  }));

  if (setsize) {
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
  } else {
    addCommandToHistory(batchCmd);
  }
};

// Function: setLinkURL
// Sets the new link URL for the selected anchor element.
//
// Parameters:
// val - String with the link URL/path
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

// Function: setRectRadius
// Sets the rx & ry values to the selected rect element to change its corner radius
//
// Parameters:
// val - The new radius
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

// Function: makeHyperlink
// Wraps the selected element(s) in an anchor element or converts group to one
this.makeHyperlink = function (url) {
  canvas.groupSelectedElements('a', url);

  // TODO: If element is a single "g", convert to "a"
  //  if (selectedElements.length > 1 && selectedElements[1]) {
};

// Function: removeHyperlink
this.removeHyperlink = function () {
  canvas.ungroupSelectedElement();
};

// Group: Element manipulation

// Function: setSegType
// Sets the new segment type to the selected segment(s).
//
// Parameters:
// new_type - Integer with the new segment type
// See https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg for list
this.setSegType = function (newType) {
  pathActions.setSegType(newType);
};

// TODO(codedread): Remove the getBBox argument and split this function into two.
// Function: convertToPath
// Convert selected element to a path, or get the BBox of an element-as-path
//
// Parameters:
// elem - The DOM element to be converted
// getBBox - Boolean on whether or not to only return the path's BBox
//
// Returns:
// If the getBBox flag is true, the resulting path's bounding box object.
// Otherwise the resulting path element is returned.
this.convertToPath = function (elem, getBBox) {
  if (elem == null) {
    const elems = selectedElements;
    $.each(elems, function (i, elem) {
      if (elem) { canvas.convertToPath(elem); }
    });
    return;
  }
  if (getBBox) {
    return getBBoxOfElementAsPath(elem, addSvgElementFromJson, pathActions);
  } else {
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
    return convertToPath(elem, attrs, addSvgElementFromJson, pathActions, clearSelection, addToSelection, history, addCommandToHistory);
  }
};

// Function: changeSelectedAttributeNoUndo
// This function makes the changes to the elements. It does not add the change
// to the history stack.
//
// Parameters:
// attr - String with the attribute name
// newValue - String or number with the new attribute value
// elems - The DOM elements to apply the change to
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

// Function: changeSelectedAttribute
// Change the given/selected element and add the original value to the history stack
// If you want to change all selectedElements, ignore the elems argument.
// If you want to change only a subset of selectedElements, then send the
// subset to this function in the elems argument.
//
// Parameters:
// attr - String with the attribute name
// newValue - String or number with the new attribute value
// elems - The DOM elements to apply the change to
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

// Function: deleteSelectedElements
// Removes all selected elements from the DOM and adds the change to the
// history stack
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
*/
this.cutSelectedElements = function () {
  canvas.copySelectedElements();
  canvas.deleteSelectedElements();
};

/**
* Remembers the current selected elements on the clipboard
*/
this.copySelectedElements = function () {
  localStorage.setItem('svgedit_clipboard', JSON.stringify(
    selectedElements.map(function (x) { return getJsonFromSvgElement(x); })
  ));

  $('#cmenu_canvas').enableContextMenuItems('#paste,#paste_in_place');
};

this.pasteElements = function (type, x, y) {
  let cb = JSON.parse(localStorage.getItem('svgedit_clipboard'));
  let len = cb.length;
  if (!len) { return; }

  const pasted = [];
  const batchCmd = new BatchCommand('Paste elements');
  // const drawing = getCurrentDrawing();
  const changedIDs = {};

  // Recursively replace IDs and record the changes
  function checkIDs (elem) {
    if (elem.attr && elem.attr.id) {
      changedIDs[elem.attr.id] = getNextId();
      elem.attr.id = changedIDs[elem.attr.id];
    }
    if (elem.children) elem.children.forEach(checkIDs);
  }
  cb.forEach(checkIDs);

  // Give extensions like the connector extension a chance to reflect new IDs and remove invalid elements
  runExtensions('IDsUpdated', {elems: cb, changes: changedIDs}, true).forEach(function (extChanges) {
    if (!extChanges || !('remove' in extChanges)) return;

    extChanges.remove.forEach(function (removeID) {
      cb = cb.filter(function (cbItem) {
        return cbItem.attr.id !== removeID;
      });
    });
  });

  // Move elements to lastClickPoint
  while (len--) {
    const elem = cb[len];
    if (!elem) { continue; }

    const copy = addSvgElementFromJson(elem);
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

// Function: groupSelectedElements
// Wraps all the selected elements in a group (g) element

// Parameters:
// type - type of element to group into, defaults to <g>
this.groupSelectedElements = function (type, urlArg) {
  if (!type) { type = 'g'; }
  let cmdStr = '';
  let url;

  switch (type) {
  case 'a': {
    cmdStr = 'Make hyperlink';
    url = '';
    if (arguments.length > 1) {
      url = urlArg;
    }
    break;
  } default: {
    type = 'g';
    cmdStr = 'Group Elements';
    break;
  }
  }

  const batchCmd = new BatchCommand(cmdStr);

  // create and insert the group element
  const g = addSvgElementFromJson({
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
    g.appendChild(elem);
    batchCmd.addSubCommand(new MoveElementCommand(elem, oldNextSibling, oldParent));
  }
  if (!batchCmd.isEmpty()) { addCommandToHistory(batchCmd); }

  // update selection
  selectOnly([g], true);
};

// Function: pushGroupProperties
// Pushes all appropriate parent group properties down to its children, then
// removes them from the group
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
          findDefs().appendChild(gfilter);
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

// Function: ungroupSelectedElement
// Unwraps all the elements in a selected group (g) element. This requires
// significant recalculations to apply group's transforms, etc to its children
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
        oldParent.removeChild(elem);
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

// Function: moveToTopSelectedElement
// Repositions the selected element to the bottom in the DOM to appear on top of
// other elements
this.moveToTopSelectedElement = function () {
  const selected = selectedElements[0];
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

// Function: moveToBottomSelectedElement
// Repositions the selected element to the top in the DOM to appear under
// other elements
this.moveToBottomSelectedElement = function () {
  const selected = selectedElements[0];
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

// Function: moveUpDownSelected
// Moves the select element up or down the stack, based on the visibly
// intersecting elements
//
// Parameters:
// dir - String that's either 'Up' or 'Down'
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

// Function: moveSelectedElements
// Moves selected elements on the X/Y axis
//
// Parameters:
// dx - Float with the distance to move on the x-axis
// dy - Float with the distance to move on the y-axis
// undoable - Boolean indicating whether or not the action should be undoable
//
// Returns:
// Batch command for the move
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

// Function: cloneSelectedElements
// Create deep DOM copies (clones) of all selected elements and move them slightly
// from their originals
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
    (currentGroup || drawing.getCurrentLayer()).appendChild(elem);
    batchCmd.addSubCommand(new InsertElementCommand(elem));
  }

  if (!batchCmd.isEmpty()) {
    addToSelection(copiedElements.reverse()); // Need to reverse for correct selection-adding
    this.moveSelectedElements(x, y, false);
    addCommandToHistory(batchCmd);
  }
};

// Function: alignSelectedElements
// Aligns selected elements
//
// Parameters:
// type - String with single character indicating the alignment type
// relativeTo - String that must be one of the following:
// "selected", "largest", "smallest", "page"
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

// Group: Additional editor tools

this.contentW = getResolution().w;
this.contentH = getResolution().h;

// Function: updateCanvas
// Updates the editor canvas width/height/position after a zoom has occurred
//
// Parameters:
// w - Float with the new width
// h - Float with the new height
//
// Returns:
// Object with the following values:
// * x - The canvas' new x coordinate
// * y - The canvas' new y coordinate
// * oldX - The canvas' old x coordinate
// * oldY - The canvas' old y coordinate
// * d_x - The x position difference
// * d_y - The y position difference
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
  runExtensions('canvasUpdated', {new_x: x, new_y: y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY});
  return {x, y, old_x: oldX, old_y: oldY, d_x: x - oldX, d_y: y - oldY};
};

// Function: setBackground
// Set the background of the editor (NOT the actual document)
//
// Parameters:
// color - String with fill color to apply
// url - URL or path to image to use
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
    bg.appendChild(bgImg);
  } else if (bgImg) {
    bgImg.parentNode.removeChild(bgImg);
  }
};

// Function: cycleElement
// Select the next/previous element within the current layer
//
// Parameters:
// next - Boolean where true = next and false = previous element
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

// DEPRECATED: getPrivateMethods
// Since all methods are/should be public somehow, this function should be removed;
//  we might require `import` in place of this in the future once ES6 Modules
//  widespread

// Being able to access private methods publicly seems wrong somehow,
// but currently appears to be the best way to allow testing and provide
// access to them to plugins.
this.getPrivateMethods = function () {
  const obj = {
    addCommandToHistory,
    setGradient,
    addSvgElementFromJson,
    assignAttributes,
    BatchCommand,
    buildCanvgCallback,
    call,
    canvg,
    ChangeElementCommand,
    copyElem (elem) { return getCurrentDrawing().copyElem(elem); },
    decode64,
    encode64,
    executeAfterLoads,
    ffClone,
    findDefs,
    findDuplicateGradient,
    getElem,
    getId,
    getIntersectionList,
    getMouseTarget,
    getNextId,
    getPathBBox,
    getTypeMap,
    getUrlFromAttr,
    hasMatrixTransform,
    identifyLayers: draw.identifyLayers,
    InsertElementCommand,
    isChrome,
    isIdentity,
    isIE,
    logMatrix,
    matrixMultiply,
    MoveElementCommand,
    NS,
    preventClickDefault,
    recalculateAllSelectedDimensions,
    recalculateDimensions,
    remapElement,
    RemoveElementCommand,
    removeUnusedDefElems,
    round,
    runExtensions,
    sanitizeSvg,
    SVGEditTransformList,
    text2xml,
    toString,
    transformBox,
    transformListToTransform,
    transformPoint,
    walkTree
  };
  return obj;
};
  } // End constructor
} // End class
