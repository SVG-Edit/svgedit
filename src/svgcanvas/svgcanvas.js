/**
 * Numerous tools for working with the editor's "canvas".
 * @module svgcanvas
 *
 * @license MIT
 *
 * @copyright 2010 Alexis Deveria, 2010 Pavol Rusnak, 2010 Jeff Schiller
 *
 */

import { Canvg as canvg } from 'canvg';
import 'pathseg'; // SVGPathSeg Polyfill (see https://github.com/progers/pathseg)

import * as pathModule from './path.js';
import * as hstry from './history.js';
import * as draw from './draw.js';
import {
  init as pasteInit, pasteElementsMethod
} from './paste-elem.js';

import {
  identifyLayers, createLayer, cloneLayer, deleteCurrentLayer,
  setCurrentLayer, renameCurrentLayer, setCurrentLayerPosition,
  setLayerVisibility, moveSelectedToLayer, mergeLayer, mergeAllLayers,
  leaveContext, setContext
} from './draw.js';
import { svgRootElement } from './svgroot.js';
import {
  init as undoInit, getUndoManager, changeSelectedAttributeNoUndoMethod,
  changeSelectedAttributeMethod, ffClone
} from './undo.js';
import {
  init as selectionInit, clearSelectionMethod, addToSelectionMethod, getMouseTargetMethod,
  getIntersectionListMethod, runExtensionsMethod, groupSvgElem, prepareSvg,
  recalculateAllSelectedDimensions, setRotationAngle
} from './selection.js';
import {
  init as textActionsInit, textActionsMethod
} from './text-actions.js';
import {
  init as eventInit, mouseMoveEvent, mouseUpEvent, mouseOutEvent,
  dblClickEvent, mouseDownEvent, DOMMouseScrollEvent
} from './event.js';
import { init as jsonInit, getJsonFromSvgElements, addSVGElementsFromJson } from './json.js';
import {
  init as elemInit, getResolutionMethod, getTitleMethod, setGroupTitleMethod,
  setDocumentTitleMethod, setResolutionMethod, getEditorNSMethod, setBBoxZoomMethod,
  setZoomMethod, setColorMethod, setGradientMethod, findDuplicateGradient, setPaintMethod,
  setStrokeWidthMethod, setStrokeAttrMethod, getBoldMethod, setBoldMethod, getItalicMethod,
  setItalicMethod, setTextAnchorMethod, getFontFamilyMethod, setFontFamilyMethod, setFontColorMethod, getFontColorMethod,
  getFontSizeMethod, setFontSizeMethod, getTextMethod, setTextContentMethod,
  setImageURLMethod, setLinkURLMethod, setRectRadiusMethod, makeHyperlinkMethod,
  removeHyperlinkMethod, setSegTypeMethod, setBackgroundMethod
} from './elem-get-set.js';
import {
  init as selectedElemInit, moveToTopSelectedElem, moveToBottomSelectedElem,
  moveUpDownSelected, moveSelectedElements, cloneSelectedElements, alignSelectedElements,
  deleteSelectedElements, copySelectedElements, groupSelectedElements, pushGroupProperty,
  ungroupSelectedElement, cycleElement, updateCanvas
} from './selected-elem.js';
import {
  init as blurInit, setBlurNoUndo, setBlurOffsets, setBlur
} from './blur-event.js';
import { sanitizeSvg } from './sanitize.js';
import { getReverseNS, NS } from './namespaces.js';
import {
  text2xml, assignAttributes, cleanupElement, getElem, getUrlFromAttr,
  findDefs, getHref, setHref, getRefElem, getRotationAngle, getPathBBox,
  preventClickDefault, walkTree, getBBoxOfElementAsPath, convertToPath, encode64, decode64,
  getVisibleElements, dropXMLInternalSubset, init as utilsInit,
  getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible, isNullish, blankPageObjectURL,
  $id, $qa, $qq, getFeGaussianBlur, stringToHTML, insertChildAtIndex
} from './utilities.js';
import {
  transformPoint, matrixMultiply, hasMatrixTransform, transformListToTransform,
  isIdentity, transformBox
} from './math.js';
import {
  convertToNum, getTypeMap, init as unitsInit
} from '../common/units.js';
import {
  svgCanvasToString, svgToString, setSvgString, exportPDF, setUseDataMethod,
  init as svgInit, importSvgString, embedImage, rasterExport,
  uniquifyElemsMethod, removeUnusedDefElemsMethod, convertGradientsMethod
} from './svg-exec.js';
import {
  isChrome
} from '../common/browser.js'; // , supportsEditableText
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
  Selector,
  init as selectInit
} from './select.js';
import {
  clearSvgContentElementInit,
  init as clearInit
} from './clear.js';
import {
  getClosest, getParents, mergeDeep
} from '../editor/components/jgraduate/Util.js';

const {
  MoveElementCommand, InsertElementCommand, RemoveElementCommand,
  ChangeElementCommand, BatchCommand
} = hstry;

const visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use';
const refAttrs = [ 'clip-path', 'fill', 'filter', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'stroke' ];

const THRESHOLD_DIST = 0.8;
const STEP_COUNT = 10;
const CLIPBOARD_ID = 'svgedit_clipboard';

if (!window.console) {
  window.console = {};
  window.console.log = (_str) => { /* empty fn */ };
  window.console.dir = (_str) => { /* empty fn */ };
}

if (window.opera) {
  window.console.log = (str) => { window.opera.postError(str); };
  window.console.dir = (_str) => { /* empty fn */ };
}

// Reenable after fixing eslint-plugin-jsdoc to handle
/**
* The main SvgCanvas class that manages all SVG-related functions.
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
  * @param {module:SVGeditor.configObj.curConfig} config - An object that contains configuration data
  */
  constructor(container, config) {
    // imported methods
    this.getJsonFromSvgElements = getJsonFromSvgElements;
    this.addSVGElemensFromJson = addSVGElementsFromJson;
    this.clearSvgContentElement = clearSvgContentElementInit;
    this.textActions = textActionsMethod;
    this.undoMgr = getUndoManager();
    this.getIntersectionList = getIntersectionListMethod;
    this.getStrokedBBox = getStrokedBBoxDefaultVisible;
    this.getVisibleElements = getVisibleElements;
    this.uniquifyElems = uniquifyElemsMethod;
    this.setUseData = setUseDataMethod;
    this.convertGradients = convertGradientsMethod;
    this.setSvgString = setSvgString;
    this.importSvgString = importSvgString;
    this.runExtensions = runExtensionsMethod;
    this.clearSelection = clearSelectionMethod;
    this.addToSelection = addToSelectionMethod;


    // Default configuration options
    this.curConfig = {
      show_outside_canvas: true,
      selectNew: true,
      dimensions: [ 640, 480 ]
    };

    // Update config with new one if given
    this.mergeDeep = mergeDeep;
    if (config) {
      this.curConfig = this.mergeDeep(this.curConfig, config);
    }

    // Array with width/height of canvas
    const { dimensions } = this.curConfig;

    this.$id = $id;
    this.$qq = $qq;
    this.$qa = $qa;
    this.encode64 = encode64;
    this.decode64 = decode64;
    this.stringToHTML = stringToHTML;
    this.insertChildAtIndex = insertChildAtIndex;
    this.getClosest = getClosest;
    this.getParents = getParents;
    /** A storage solution aimed at replacing jQuerys data function.
 * Implementation Note: Elements are stored in a (WeakMap)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap].
 * This makes sure the data is garbage collected when the node is removed.
 */
    this.dataStorage = {
      _storage: new WeakMap(),
      put: function (element, key, obj) {
        if (!this._storage.has(element)) {
          this._storage.set(element, new Map());
        }
        this._storage.get(element).set(key, obj);
      },
      get: function (element, key) {
        return this._storage.get(element)?.get(key);
      },
      has: function (element, key) {
        return this._storage.has(element) && this._storage.get(element).has(key);
      },
      remove: function (element, key) {
        const ret = this._storage.get(element).delete(key);
        if (!this._storage.get(element).size === 0) {
          this._storage.delete(element);
        }
        return ret;
      }
    };

    this.isLayer = draw.Layer.isLayer;

    // "document" element associated with the container (same as window.document using default svg-editor.js)
    // NOTE: This is not actually a SVG document, but an HTML document.
    this.svgdoc = window.document;

    // This is a container for the document being edited, not the document itself.
    /**
 * @name module:svgcanvas~svgroot
 * @type {SVGSVGElement}
 */
    this.svgroot = svgRootElement(this.svgdoc, dimensions);
    container.append(this.svgroot);

    /**
 * The actual element that represents the final output SVG element.
 * @name module:svgcanvas~svgcontent
 * @type {SVGSVGElement}
 */
    this.svgContent = this.svgdoc.createElementNS(NS.SVG, 'svg');

    clearInit(this);
    this.clearSvgContentElement();

    // Prefix string for element IDs
    this.idprefix = 'svg_';

    /**
* Current `draw.Drawing` object.
* @type {module:draw.Drawing}
* @name module:svgcanvas.SvgCanvas#current_drawing_
*/
    this.current_drawing_ = new draw.Drawing(this.svgContent, this.idprefix);
    /**
* Float displaying the current zoom level (1 = 100%, .5 = 50%, etc.).
* @type {Float}
*/
    this.zoom = 1;

    // pointer to current group (for in-group editing)
    this.currentGroup = null;

    // Object containing data for the currently selected styles
    const allProperties = {
      shape: {
        fill: (this.curConfig.initFill.color === 'none' ? '' : '#') + this.curConfig.initFill.color,
        fill_paint: null,
        fill_opacity: this.curConfig.initFill.opacity,
        stroke: '#' + this.curConfig.initStroke.color,
        stroke_paint: null,
        stroke_opacity: this.curConfig.initStroke.opacity,
        stroke_width: this.curConfig.initStroke.width,
        stroke_dasharray: 'none',
        stroke_linejoin: 'miter',
        stroke_linecap: 'butt',
        opacity: this.curConfig.initOpacity
      }
    };
    allProperties.text = this.mergeDeep({}, allProperties.shape);
    allProperties.text = this.mergeDeep(allProperties.text, {
      fill: '#000000',
      stroke_width: this.curConfig.text && this.curConfig.text.stroke_width,
      font_size: this.curConfig.text && this.curConfig.text.font_size,
      font_family: this.curConfig.text && this.curConfig.text.font_family
    });

    // Current shape style properties
    this.curShape = allProperties.shape;

    // Array with all the currently selected elements
    // default size of 1 until it needs to grow bigger
    this.selectedElements = [];

    jsonInit(this);

    this.matrixMultiply = matrixMultiply;
    this.hasMatrixTransform = hasMatrixTransform;
    this.transformListToTransform = transformListToTransform;

    /**
* Initialize from units.js.
* Send in an object implementing the ElementContainer interface (see units.js).
*/
    unitsInit(this);
    this.convertToNum = convertToNum;
    const { pathActions } = pathModule;
    utilsInit(this);
    this.findDefs = findDefs;
    this.getUrlFromAttr = getUrlFromAttr;
    this.getHref = getHref;
    this.setHref = setHref;
    /* const getBBox = */ this.getBBox = utilsGetBBox;
    this.getRotationAngle = getRotationAngle;
    this.getElem = getElem;
    this.getRefElem = getRefElem;
    this.assignAttributes = assignAttributes;
    this.cleanupElement = cleanupElement;
    coordsInit(this);
    this.remapElement = remapElement;
    recalculateInit(this);
    this.recalculateDimensions = recalculateDimensions;
    // import from sanitize.js
    this.nsMap = getReverseNS();
    this.sanitizeSvg = sanitizeSvg;
    selectInit(this.curConfig, this);
    this.selectorManager = getSelectorManager();

    /**
* The "implements" should really be an intersection applying to all types rather than a union.
* @name module:svgcanvas.SvgCanvas#call
* @type {module:draw.DrawCanvasInit#call|module:path.EditorContext#call}
*/
    const call = (ev, arg) => {
      if (events[ev]) {
        return events[ev](window, arg);
      }
      return undefined;
    };

    undoInit(this);
    selectionInit(this);
    /**
    * @type {module:path.EditorContext#getOpacity}
    */
    const getOpacity = function () {
      return this.curShape.opacity;
    };

    this.getMouseTarget = getMouseTargetMethod;

    this.pathActions = pathActions;
    pathModule.init(this);
    // Interface strings, usually for title elements
    this.uiStrings = {};

    // Animation element to change the opacity of any newly created element
    this.opacAni = document.createElementNS(NS.SVG, 'animate');
    this.opacAni.setAttribute('attributeName', 'opacity');
    this.opacAni.setAttribute('begin', 'indefinite');
    this.opacAni.setAttribute('dur', 1);
    this.opacAni.setAttribute('fill', 'freeze');
    this.svgroot.appendChild(this.opacAni);

    // (function () {
    // TODO For Issue 208: this is a start on a thumbnail
    //  const svgthumb = this.svgdoc.createElementNS(NS.SVG, 'use');
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
    this.addToSelectionencodableImages = {};
    // Object with save options
    this.saveOptions = { round_digits: 5 };
    // Object with IDs for imported files, to see if one was already added
    this.importIds = {};
    // Current text style properties
    this.curText = allProperties.text;
    // Object to contain all included extensions
    this.extensions = {};
    // Map of deleted reference elements
    this.removedElements = {};

    // String with image URL of last loadable image
    this.lastGoodImgUrl = `${this.curConfig.imgPath}/logo.svg`;
    // Boolean indicating whether or not a draw action has been this.started
    this.started = false;
    // String with an element's initial transform attribute value
    this.startTransform = null;
    // String indicating the current editor mode
    this.currentMode = 'select';
    // String with the current direction in which an element is being resized
    this.currentResizeMode = 'none';
    // Current general properties
    this.curProperties = this.curShape;
    // Array with selected elements' Bounding box object
    // selectedBBoxes = new Array(1),
    // The DOM element that was just selected
    this.justSelected = null;
    // DOM element for selection rectangle drawn by the user
    this.rubberBox = null;
    // Array of current BBoxes, used in getIntersectionList().
    this.curBBoxes = [];
    // Canvas point for the most recent right click
    this.lastClickPoint = null;

    /**
* Wrap an SVG element into a group element, mark the group as 'gsvg'.
* @function module:svgcanvas.SvgCanvas#groupSvgElem
* @param {Element} elem - SVG element to wrap
* @returns {void}
*/
    this.groupSvgElem = groupSvgElem;

    // Set scope for these functions

    // Object to contain editor event names and callback functions
    const events = {};

    this.call = call;
    /**
 * Array of what was changed (elements, layers).
 * @event module:svgcanvas.SvgCanvas#event:changed
 * @type {Element[]}
 */
    /**
 * Array of selected elements.
 * @event module:svgcanvas.SvgCanvas#event:selected
 * @type {Element[]}
 */
    /**
 * Array of selected elements.
 * @event module:svgcanvas.SvgCanvas#event:transition
 * @type {Element[]}
 */
    /**
 * The Element is always `SVGGElement`?
 * If not `null`, will be the set current group element.
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
 * @type {module:svgcanvas.ExtensionInitResponsePlusName|void}
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:extensions_added
 * @type {void}
*/
    /**
 * @typedef {PlainObject} module:svgcanvas.Message
 * @property {any} data The data
 * @property {string} origin The origin
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:message
 * @type {module:svgcanvas.Message}
 */
    /**
 * SVG canvas converted to string.
 * @event module:svgcanvas.SvgCanvas#event:saved
 * @type {string}
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:setnonce
 * @type {!(string|Integer)}
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:unsetnonce
 * @type {void}
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:zoomDone
 * @type {void}
*/
    /**
 * @event module:svgcanvas.SvgCanvas#event:cleared
 * @type {void}
*/

    /**
 * @event module:svgcanvas.SvgCanvas#event:exported
 * @type {module:svgcanvas.ImageExportedResults}
 */
    /**
 * @event module:svgcanvas.SvgCanvas#event:exportedPDF
 * @type {module:svgcanvas.PDFExportedResults}
 */
    /* eslint-disable max-len */
    /**
 * Creating a cover-all class until {@link https://github.com/jsdoc3/jsdoc/issues/1545} may be supported.
 * `undefined` may be returned by {@link module:svgcanvas.SvgCanvas#event:extension_added} if the extension's `init` returns `undefined` It is also the type for the following events "zoomDone", "unsetnonce", "cleared", and "extensions_added".
 * @event module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
 * @type {module:svgcanvas.SvgCanvas#event:selected|module:svgcanvas.SvgCanvas#event:changed|module:svgcanvas.SvgCanvas#event:contextset|module:svgcanvas.SvgCanvas#event:pointsAdded|module:svgcanvas.SvgCanvas#event:extension_added|module:svgcanvas.SvgCanvas#event:extensions_added|module:svgcanvas.SvgCanvas#event:message|module:svgcanvas.SvgCanvas#event:transition|module:svgcanvas.SvgCanvas#event:zoomed|module:svgcanvas.SvgCanvas#event:updateCanvas|module:svgcanvas.SvgCanvas#event:saved|module:svgcanvas.SvgCanvas#event:exported|module:svgcanvas.SvgCanvas#event:exportedPDF|module:svgcanvas.SvgCanvas#event:setnonce|module:svgcanvas.SvgCanvas#event:unsetnonce|void}
 */
    /* eslint-enable max-len */

    /**
 * The promise return, if present, resolves to `undefined`
 *  (`extension_added`, `exported`, `saved`).
 * @typedef {Promise<void>|void} module:svgcanvas.EventHandlerReturn
*/

    /**
* @callback module:svgcanvas.EventHandler
* @param {external:Window} win
* @param {module:svgcanvas.SvgCanvas#event:GenericCanvasEvent} arg
* @listens module:svgcanvas.SvgCanvas#event:GenericCanvasEvent
* @returns {module:svgcanvas.EventHandlerReturn}
*/
    /* eslint-disable max-len */
    /**
* Attaches a callback function to an event.
* @function module:svgcanvas.SvgCanvas#bind
* @param {"changed"|"contextset"|"selected"|"pointsAdded"|"extension_added"|"extensions_added"|"message"|"transition"|"zoomed"|"updateCanvas"|"zoomDone"|"saved"|"exported"|"exportedPDF"|"setnonce"|"unsetnonce"|"cleared"} ev - String indicating the name of the event
* @param {module:svgcanvas.EventHandler} f - The callback function to bind to the event
* @returns {module:svgcanvas.EventHandler} The previous event
*/
    /* eslint-enable max-len */
    this.bind = function (ev, f) {
      const old = events[ev];
      events[ev] = f;
      return old;
    };

    /**
* Runs the SVG Document through the sanitizer and then updates its paths.
* @function module:svgcanvas.SvgCanvas#prepareSvg
* @param {XMLDocument} newDoc - The SVG DOM document
* @returns {void}
*/
    this.prepareSvg = prepareSvg;

    /**
* Removes any old rotations if present, prepends a new rotation at the
* transformed center.
* @function module:svgcanvas.SvgCanvas#setRotationAngle
* @param {string|Float} val - The new rotation angle in degrees
* @param {boolean} preventUndo - Indicates whether the action should be undoable or not
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setRotationAngle = setRotationAngle;

    /**
* Runs `recalculateDimensions` on the selected elements,
* adding the changes to a single batch command.
* @function module:svgcanvas.SvgCanvas#recalculateAllSelectedDimensions
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.recalculateAllSelectedDimensions = recalculateAllSelectedDimensions;

    /**
 * Debug tool to easily see the current matrix in the browser's console.
 * @function module:svgcanvas~logMatrix
 * @param {SVGMatrix} m The matrix
 * @returns {void}
 */
    const logMatrix = function (m) {
      console.info([ m.a, m.b, m.c, m.d, m.e, m.f ]);
    };

    // Root Current Transformation Matrix in user units
    this.rootSctm = null;

    /**
* Group: Selection.
*/

    // TODO: do we need to worry about selectedBBoxes here?

    /**
* Selects only the given elements, shortcut for `clearSelection(); addToSelection()`.
* @function module:svgcanvas.SvgCanvas#selectOnly
* @param {Element[]} elems - an array of DOM elements to be selected
* @param {boolean} showGrips - Indicates whether the resize grips should be shown
* @returns {void}
*/
    const selectOnly = this.selectOnly = (elems, showGrips) => {
      this.clearSelection(true);
      this.addToSelection(elems, showGrips);
    };

    // TODO: could use slice here to make this faster?
    // TODO: should the 'selected' handler

    /**
* Removes elements from the selection.
* @function module:svgcanvas.SvgCanvas#removeFromSelection
* @param {Element[]} elemsToRemove - An array of elements to remove from selection
* @returns {void}
*/
    /* const removeFromSelection = */ this.removeFromSelection = function (elemsToRemove) {
      if (isNullish(this.selectedElements[0])) { return; }
      if (!elemsToRemove.length) { return; }

      // find every element and remove it from our array copy
      const newSelectedItems = [];
      const len = this.selectedElements.length;
      for (let i = 0; i < len; ++i) {
        const elem = this.selectedElements[i];
        if (elem) {
          // keep the item
          if (!elemsToRemove.includes(elem)) {
            newSelectedItems.push(elem);
          } else { // remove the item and its selector
            this.selectorManager.releaseSelector(elem);
          }
        }
      }
      // the copy becomes the master now
      this.selectedElements = newSelectedItems;
    };

    /**
* Clears the selection, then adds all elements in the current layer to the selection.
* @function module:svgcanvas.SvgCanvas#selectAllInCurrentLayer
* @returns {void}
*/
    this.selectAllInCurrentLayer = function () {
      const currentLayer = this.getCurrentDrawing().getCurrentLayer();
      if (currentLayer) {
        this.currentMode = 'select';
        if (this.currentGroup) {
          selectOnly(this.currentGroup.children);
        } else {
          selectOnly(currentLayer.children);
        }
      }
    };

    this.drawnPath = null;

    // Mouse events
    this.freehand = {
      minx: null,
      miny: null,
      maxx: null,
      maxy: null
    };

    this.dAttr = null;
    this.startX = null;
    this.startY = null;
    this.rStartX = null;
    this.rStartY = null;
    this.initBbox = {};
    this.sumDistance = 0;
    this.controllPoint2 = { x: 0, y: 0 };
    this.controllPoint1 = { x: 0, y: 0 };
    this.start = { x: 0, y: 0 };
    this.end = { x: 0, y: 0 };
    this.bSpline = { x: 0, y: 0 };
    this.nextPos = { x: 0, y: 0 };
    this.parameter;
    this.nextParameter;

    /**
      * @function eventInit Initialize from event.js
      * @returns {void}
      */
    eventInit(this);
    /**
 * Follows these conditions:
 * - When we are in a create mode, the element is added to the canvas but the
 *   action is not recorded until mousing up.
 * - When we are in select mode, select the element, remember the position
 *   and do nothing else.
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:ext_mouseDown
 * @returns {void}
 */

    const mouseUp = mouseUpEvent.bind(this);
    const mouseOut = mouseOutEvent.bind(this);
    const dblClick = dblClickEvent.bind(this);

    // prevent links from being followed in the canvas
    const handleLinkInCanvas = function (e) {
      e.preventDefault();
      return false;
    };
    container.addEventListener('mousedown', mouseDownEvent);
    container.addEventListener('mousemove', mouseMoveEvent);
    container.addEventListener('click', handleLinkInCanvas);
    container.addEventListener('dblclick', dblClick);
    container.addEventListener('mouseup', mouseUp);
    container.addEventListener('mouseleave', mouseOut);
    container.addEventListener('mousewheel', DOMMouseScrollEvent);
    container.addEventListener('DOMMouseScroll', DOMMouseScrollEvent);

    textActionsInit(this);

    this.getSvgOption = () => { return this.saveOptions; };
    this.setSvgOption = (key, value) => { this.saveOptions[key] = value; };

    svgInit(this);

    /**
* Looks at DOM elements inside the `<defs>` to see if they are referred to,
* removes them from the DOM if they are not.
* @function module:svgcanvas.SvgCanvas#removeUnusedDefElems
* @returns {Integer} The number of elements that were removed
*/
    this.removeUnusedDefElems = removeUnusedDefElemsMethod;

    /**
* Main function to set up the SVG content for output.
* @function module:svgcanvas.SvgCanvas#svgCanvasToString
* @returns {string} The SVG image for output
*/
    this.svgCanvasToString = svgCanvasToString;

    /**
* Sub function ran on each SVG element to convert it to a string as desired.
* @function module:svgcanvas.SvgCanvas#svgToString
* @param {Element} elem - The SVG element to convert
* @param {Integer} indent - Number of spaces to indent this tag
* @returns {string} The given element as an SVG tag
*/
    this.svgToString = svgToString;

    /**
 * Function to run when image data is found.
 * @callback module:svgcanvas.ImageEmbeddedCallback
 * @param {string|false} result Data URL
 * @returns {void}
 */
    /**
* Converts a given image file to a data URL when possible, then runs a given callback.
* @function module:svgcanvas.SvgCanvas#embedImage
* @param {string} src - The path/URL of the image
* @returns {Promise<string|false>} Resolves to a Data URL (string|false)
*/
    this.embedImage = embedImage;

    /**
* Sets a given URL to be a "last good image" URL.
* @function module:svgcanvas.SvgCanvas#setGoodImage
* @param {string} val
* @returns {void}
*/
    this.setGoodImage = function (val) {
      this.lastGoodImgUrl = val;
    };

    /**
* @typedef {PlainObject} module:svgcanvas.IssuesAndCodes
* @property {string[]} issueCodes The locale-independent code names
* @property {string[]} issues The localized descriptions
*/

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
* Generates a PNG (or JPG, BMP, WEBP) Data URL based on the current image,
* then calls "exported" with an object including the string, image
* information, and any issues found.
* @function module:svgcanvas.SvgCanvas#rasterExport
* @param {"PNG"|"JPEG"|"BMP"|"WEBP"|"ICO"} [imgType="PNG"]
* @param {Float} [quality] Between 0 and 1
* @param {string} [exportWindowName]
* @param {PlainObject} [opts]
* @param {boolean} [opts.avoidEvent]
* @fires module:svgcanvas.SvgCanvas#event:exported
* @todo Confirm/fix ICO type
* @returns {Promise<module:svgcanvas.ImageExportedResults>} Resolves to {@link module:svgcanvas.ImageExportedResults}
*/
    this.rasterExport = rasterExport;

    /**
 * @typedef {void|"save"|"arraybuffer"|"blob"|"datauristring"|"dataurlstring"|"dataurlnewwindow"|"datauri"|"dataurl"} external:jsPDF.OutputType
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
* Generates a PDF based on the current image, then calls "exportedPDF" with
* an object including the string, the data URL, and any issues found.
* @function module:svgcanvas.SvgCanvas#exportPDF
* @param {string} [exportWindowName] Will also be used for the download file name here
* @param {external:jsPDF.OutputType} [outputType="dataurlstring"]
* @fires module:svgcanvas.SvgCanvas#event:exportedPDF
* @returns {Promise<module:svgcanvas.PDFExportedResults>} Resolves to {@link module:svgcanvas.PDFExportedResults}
*/
    this.exportPDF = exportPDF;

    /**
* Returns the current drawing as raw SVG XML text.
* @function module:svgcanvas.SvgCanvas#getSvgString
* @returns {string} The current drawing as raw SVG XML text.
*/
    this.getSvgString = function () {
      this.saveOptions.apply = false;
      return this.svgCanvasToString();
    };

    /**
* This function determines whether to use a nonce in the prefix, when
* generating IDs for future documents in SVG-Edit.
* If you're controlling SVG-Edit externally, and want randomized IDs, call
* this BEFORE calling `svgCanvas.setSvgString`.
* @function module:svgcanvas.SvgCanvas#randomizeIds
* @param {boolean} [enableRandomization] If true, adds a nonce to the prefix. Thus
* `svgCanvas.randomizeIds() <==> svgCanvas.randomizeIds(true)`
* @returns {void}
*/
    this.randomizeIds = function (enableRandomization) {
      if (arguments.length > 0 && enableRandomization === false) {
        draw.randomizeIds(false, this.getCurrentDrawing());
      } else {
        draw.randomizeIds(true, this.getCurrentDrawing());
      }
    };

    // Could deprecate, but besides external uses, their usage makes clear that
    //  canvas is a dependency for all of these
    const dr = {
      identifyLayers, createLayer, cloneLayer, deleteCurrentLayer,
      setCurrentLayer, renameCurrentLayer, setCurrentLayerPosition,
      setLayerVisibility, moveSelectedToLayer, mergeLayer, mergeAllLayers,
      leaveContext, setContext
    };
    Object.entries(dr).forEach(([ prop, propVal ]) => {
      this[prop] = propVal;
    });
    draw.init(this);

    // Alias function
    this.linkControlPoints = pathActions.linkControlPoints;

    elemInit(this);
    /**
* @function module:svgcanvas.SvgCanvas#getResolution
* @returns {DimensionsAndZoom} The current dimensions and zoom level in an object
*/
    const getResolution = this.getResolution = getResolutionMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getSnapToGrid
* @returns {boolean} The current snap to grid setting
*/
    this.getSnapToGrid = function () { return this.curConfig.gridSnapping; };

    /**
* @function module:svgcanvas.SvgCanvas#getVersion
* @returns {string} A string which describes the revision number of SvgCanvas.
*/
    this.getVersion = function () {
      return 'svgcanvas.js ($Rev$)';
    };

    /**
* Update interface strings with given values.
* @function module:svgcanvas.SvgCanvas#setUiStrings
* @param {module:path.uiStrings} strs - Object with strings (see the [locales API]{@link module:locale.LocaleStrings} and the [tutorial]{@tutorial LocaleDocs})
* @returns {void}
*/
    this.setUiStrings = function (strs) {
      Object.assign(this.uiStrings, strs.notification);
      pathModule.setUiStrings(strs);
    };

    /**
* Update configuration options with given values.
* @function module:svgcanvas.SvgCanvas#setConfig
* @param {module:SVGEditor.Config} opts - Object with options
* @returns {void}
*/
    this.setConfig = function (opts) {
      Object.assign(this.curConfig, opts);
    };

    /**
* @function module:svgcanvas.SvgCanvas#getTitle
* @param {Element} [elem]
* @returns {string|void} the current group/SVG's title contents or
* `undefined` if no element is passed nd there are no selected elements.
*/
    this.getTitle = getTitleMethod;

    /**
* Sets the group/SVG's title content.
* @function module:svgcanvas.SvgCanvas#setGroupTitle
* @param {string} val
* @todo Combine this with `setDocumentTitle`
* @returns {void}
*/
    this.setGroupTitle = setGroupTitleMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getDocumentTitle
* @returns {string|void} The current document title or an empty string if not found
*/
    this.getDocumentTitle = function () {
      return this.getTitle(this.svgContent);
    };

    /**
* Adds/updates a title element for the document with the given name.
* This is an undoable action.
* @function module:svgcanvas.SvgCanvas#setDocumentTitle
* @param {string} newTitle - String with the new title
* @returns {void}
*/
    this.setDocumentTitle = setDocumentTitleMethod;

    /**
* Returns the editor's namespace URL, optionally adding it to the root element.
* @function module:svgcanvas.SvgCanvas#getEditorNS
* @param {boolean} [add] - Indicates whether or not to add the namespace value
* @returns {string} The editor's namespace URL
*/
    this.getEditorNS = getEditorNSMethod;

    /**
* Changes the document's dimensions to the given size.
* @function module:svgcanvas.SvgCanvas#setResolution
* @param {Float|"fit"} x - Number with the width of the new dimensions in user units.
* Can also be the string "fit" to indicate "fit to content".
* @param {Float} y - Number with the height of the new dimensions in user units.
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {boolean} Indicates if resolution change was successful.
* It will fail on "fit to content" option with no content to fit to.
*/
    this.setResolution = setResolutionMethod;

    /**
* @typedef {module:jQueryAttr.Attributes} module:svgcanvas.ElementPositionInCanvas
* @property {Float} x
* @property {Float} y
*/

    /**
* @function module:svgcanvas.SvgCanvas#getOffset
* @returns {module:svgcanvas.ElementPositionInCanvas} An object with `x`, `y` values indicating the svgcontent element's
* position in the editor's this.
*/
    this.getOffset = function () {
      return { x: Number(this.svgContent.getAttribute('x')), y: Number(this.svgContent.getAttribute('y')) };
    };

    /**
 * @typedef {PlainObject} module:svgcanvas.ZoomAndBBox
 * @property {Float} zoom
 * @property {module:utilities.BBoxObject} bbox
 */
    /**
* Sets the zoom level on the canvas-side based on the given value.
* @function module:svgcanvas.SvgCanvas#setBBoxZoom
* @param {"selection"|"canvas"|"content"|"layer"|module:SVGEditor.BBoxObjectWithFactor} val - Bounding box object to zoom to or string indicating zoom option. Note: the object value type is defined in `svg-editor.js`
* @param {Integer} editorW - The editor's workarea box's width
* @param {Integer} editorH - The editor's workarea box's height
* @returns {module:svgcanvas.ZoomAndBBox|void}
*/
    this.setBBoxZoom = setBBoxZoomMethod;

    /**
* The zoom level has changed. Supplies the new zoom level as a number (not percentage).
* @event module:svgcanvas.SvgCanvas#event:ext_zoomChanged
* @type {Float}
*/
    /**
* The bottom panel was updated.
* @event module:svgcanvas.SvgCanvas#event:ext_toolButtonStateUpdate
* @type {PlainObject}
* @property {boolean} nofill Indicates fill is disabled
* @property {boolean} nostroke Indicates stroke is disabled
*/
    /**
* The element selection has changed (elements were added/removed from selection).
* @event module:svgcanvas.SvgCanvas#event:ext_selectedChanged
* @type {PlainObject}
* @property {Element[]} elems Array of the newly selected elements
* @property {Element|null} selectedElement The single selected element
* @property {boolean} multiselected Indicates whether one or more elements were selected
*/
    /**
* Called when part of element is in process of changing, generally on
* mousemove actions like rotate, move, etc.
* @event module:svgcanvas.SvgCanvas#event:ext_elementTransition
* @type {PlainObject}
* @property {Element[]} elems Array of transitioning elements
*/
    /**
* One or more elements were changed.
* @event module:svgcanvas.SvgCanvas#event:ext_elementChanged
* @type {PlainObject}
* @property {Element[]} elems Array of the affected elements
*/
    /**
* Invoked as soon as the locale is ready.
* @event module:svgcanvas.SvgCanvas#event:ext_langReady
* @type {PlainObject}
* @property {string} lang The two-letter language code
* @property {module:SVGEditor.uiStrings} uiStrings
* @property {module:SVGEditor~ImportLocale} importLocale
*/
    /**
* The language was changed. Two-letter code of the new language.
* @event module:svgcanvas.SvgCanvas#event:ext_langChanged
* @type {string}
*/
    /**
* Means for an extension to add locale data. The two-letter language code.
* @event module:svgcanvas.SvgCanvas#event:ext_addLangData
* @type {PlainObject}
* @property {string} lang
* @property {module:SVGEditor~ImportLocale} importLocale
*/
    /**
 * Called when new image is created.
 * @event module:svgcanvas.SvgCanvas#event:ext_onNewDocument
 * @type {void}
 */
    /**
 * Called when sidepanel is resized or toggled.
 * @event module:svgcanvas.SvgCanvas#event:ext_workareaResized
 * @type {void}
*/
    /**
 * Called upon addition of the extension, or, if svgicons are set,
 * after the icons are ready when extension SVG icons have loaded.
 * @event module:svgcanvas.SvgCanvas#event:ext_callback
 * @type {void}
*/

    /**
* Sets the zoom to the given level.
* @function module:svgcanvas.SvgCanvas#setZoom
* @param {Float} zoomLevel - Float indicating the zoom level to change to
* @fires module:svgcanvas.SvgCanvas#event:ext_zoomChanged
* @returns {void}
*/
    this.setCurrentZoom = setZoomMethod;

    /**
* Group: Element Styling.
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
      return this.curProperties[type];
    };

    /**
* Change the current stroke/fill color/gradient value.
* @function module:svgcanvas.SvgCanvas#setColor
* @param {string} type - String indicating fill or stroke
* @param {string} val - The value to set the stroke attribute to
* @param {boolean} preventUndo - Boolean indicating whether or not this should be an undoable option
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setColor = setColorMethod;

    /**
* Apply the current gradient to selected element's fill or stroke.
* @function module:svgcanvas.SvgCanvas#setGradient
* @param {"fill"|"stroke"} type - String indicating "fill" or "stroke" to apply to an element
* @returns {void}
*/
    this.setGradient = setGradientMethod;

    /**
* Set a color/gradient to a fill/stroke.
* @function module:svgcanvas.SvgCanvas#setPaint
* @param {"fill"|"stroke"} type - String with "fill" or "stroke"
* @param {module:jGraduate.jGraduatePaintOptions} paint - The jGraduate paint object to apply
* @returns {void}
*/
    this.setPaint = setPaintMethod;

    /**
* @function module:svgcanvas.SvgCanvas#setStrokePaint
* @param {module:jGraduate~Paint} paint
* @returns {void}
*/
    this.setStrokePaint = function (paint) {
      this.setPaint('stroke', paint);
    };

    /**
* @function module:svgcanvas.SvgCanvas#setFillPaint
* @param {module:jGraduate~Paint} paint
* @returns {void}
*/
    this.setFillPaint = function (paint) {
      this.setPaint('fill', paint);
    };

    /**
* @function module:svgcanvas.SvgCanvas#getStrokeWidth
* @returns {Float|string} The current stroke-width value
*/
    this.getStrokeWidth = function () {
      return this.curProperties.stroke_width;
    };

    /**
* Sets the stroke width for the current selected elements.
* When attempting to set a line's width to 0, this changes it to 1 instead.
* @function module:svgcanvas.SvgCanvas#setStrokeWidth
* @param {Float} val - A Float indicating the new stroke width value
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setStrokeWidth = setStrokeWidthMethod;

    /**
* Set the given stroke-related attribute the given value for selected elements.
* @function module:svgcanvas.SvgCanvas#setStrokeAttr
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the attribute value
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setStrokeAttr = setStrokeAttrMethod;

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
      return this.curShape;
    };

    /**
* @function module:svgcanvas.SvgCanvas#getOpacity
* @returns {Float} the current opacity
*/
    this.getOpacity = getOpacity;

    /**
* Sets the given opacity on the current selected elements.
* @function module:svgcanvas.SvgCanvas#setOpacity
* @param {string} val
* @returns {void}
*/
    this.setOpacity = function (val) {
      this.curShape.opacity = val;
      changeSelectedAttribute('opacity', val);
    };

    /**
* @function module:svgcanvas.SvgCanvas#getFillOpacity
* @returns {Float} the current fill opacity
*/
    this.getFillOpacity = function () {
      return this.curShape.fill_opacity;
    };

    /**
* @function module:svgcanvas.SvgCanvas#getStrokeOpacity
* @returns {string} the current stroke opacity
*/
    this.getStrokeOpacity = function () {
      return this.curShape.stroke_opacity;
    };

    /**
* Sets the current fill/stroke opacity.
* @function module:svgcanvas.SvgCanvas#setPaintOpacity
* @param {string} type - String with "fill" or "stroke"
* @param {Float} val - Float with the new opacity value
* @param {boolean} preventUndo - Indicates whether or not this should be an undoable action
* @returns {void}
*/
    this.setPaintOpacity = function (type, val, preventUndo) {
      this.curShape[type + '_opacity'] = val;
      if (!preventUndo) {
        changeSelectedAttribute(type + '-opacity', val);
      } else {
        changeSelectedAttributeNoUndo(type + '-opacity', val);
      }
    };

    /**
* Gets the current fill/stroke opacity.
* @function module:svgcanvas.SvgCanvas#getPaintOpacity
* @param {"fill"|"stroke"} type - String with "fill" or "stroke"
* @returns {Float} Fill/stroke opacity
*/
    this.getPaintOpacity = function (type) {
      return type === 'fill' ? this.getFillOpacity() : this.getStrokeOpacity();
    };

    /**
* Gets the `stdDeviation` blur value of the given element.
* @function module:svgcanvas.SvgCanvas#getBlur
* @param {Element} elem - The element to check the blur value for
* @returns {string} stdDeviation blur attribute value
*/
    this.getBlur = function (elem) {
      let val = 0;
      if (elem) {
        const filterUrl = elem.getAttribute('filter');
        if (filterUrl) {
          const blur = getElem(elem.id + '_blur');
          if (blur) {
            val = blur.firstChild.getAttribute('stdDeviation');
          } else {
            const filterElem = getRefElem(filterUrl);
            const blurElem = getFeGaussianBlur(filterElem);
            if (blurElem !== null) {
              val = blurElem.getAttribute('stdDeviation');
            }
          }
        }
      }
      return val;
    };

    this.curCommand = null;
    this.filter = null;
    this.filterHidden = false;

    blurInit(this);
    /**
* Sets the `stdDeviation` blur value on the selected element without being undoable.
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {void}
*/
    this.setBlurNoUndo = setBlurNoUndo;

    /**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded.
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filterElem - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {void}
*/
    this.setBlurOffsets = setBlurOffsets;

    /**
* Adds/updates the blur filter to the selected element.
* @function module:svgcanvas.SvgCanvas#setBlur
* @param {Float} val - Float with the new `stdDeviation` blur value
* @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
* @returns {void}
*/
    this.setBlur = setBlur;


    /**
* Check whether selected element is bold or not.
* @function module:svgcanvas.SvgCanvas#getBold
* @returns {boolean} Indicates whether or not element is bold
*/
    this.getBold = getBoldMethod;

    /**
* Make the selected element bold or normal.
* @function module:svgcanvas.SvgCanvas#setBold
* @param {boolean} b - Indicates bold (`true`) or normal (`false`)
* @returns {void}
*/
    this.setBold = setBoldMethod;

    /**
* Check whether selected element is in italics or not.
* @function module:svgcanvas.SvgCanvas#getItalic
* @returns {boolean} Indicates whether or not element is italic
*/
    this.getItalic = getItalicMethod;

    /**
* Make the selected element italic or normal.
* @function module:svgcanvas.SvgCanvas#setItalic
* @param {boolean} i - Indicates italic (`true`) or normal (`false`)
* @returns {void}
*/
    this.setItalic = setItalicMethod;

    /**
* Set the new text anchor.
* @function module:svgcanvas.SvgCanvas#setTextAnchor
* @param {string} textAnchor - The value of the text anchor (start, middle or end)
* @returns {void}
*/
    this.setTextAnchor = setTextAnchorMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getFontFamily
* @returns {string} The current font family
*/
    this.getFontFamily = getFontFamilyMethod;

    /**
* Set the new font family.
* @function module:svgcanvas.SvgCanvas#setFontFamily
* @param {string} val - String with the new font family
* @returns {void}
*/
    this.setFontFamily = setFontFamilyMethod;

    /**
* Set the new font color.
* @function module:svgcanvas.SvgCanvas#setFontColor
* @param {string} val - String with the new font color
* @returns {void}
*/
    this.setFontColor = setFontColorMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getFontColor
* @returns {string} The current font color
*/
    this.getFontColor = getFontColorMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getFontSize
* @returns {Float} The current font size
*/
    this.getFontSize = getFontSizeMethod;

    /**
* Applies the given font size to the selected element.
* @function module:svgcanvas.SvgCanvas#setFontSize
* @param {Float} val - Float with the new font size
* @returns {void}
*/
    this.setFontSize = setFontSizeMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getText
* @returns {string} The current text (`textContent`) of the selected element
*/
    this.getText = getTextMethod;

    /**
* Updates the text element with the given string.
* @function module:svgcanvas.SvgCanvas#setTextContent
* @param {string} val - String with the new text
* @returns {void}
*/
    this.setTextContent = setTextContentMethod;

    /**
* Sets the new image URL for the selected image element. Updates its size if
* a new URL is given.
* @function module:svgcanvas.SvgCanvas#setImageURL
* @param {string} val - String with the image URL/path
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setImageURL = setImageURLMethod;

    /**
* Sets the new link URL for the selected anchor element.
* @function module:svgcanvas.SvgCanvas#setLinkURL
* @param {string} val - String with the link URL/path
* @returns {void}
*/
    this.setLinkURL = setLinkURLMethod;

    /**
* Sets the `rx` and `ry` values to the selected `rect` element
* to change its corner radius.
* @function module:svgcanvas.SvgCanvas#setRectRadius
* @param {string|Float} val - The new radius
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.setRectRadius = setRectRadiusMethod;

    /**
* Wraps the selected element(s) in an anchor element or converts group to one.
* @function module:svgcanvas.SvgCanvas#makeHyperlink
* @param {string} url
* @returns {void}
*/
    this.makeHyperlink = makeHyperlinkMethod;

    /**
* @function module:svgcanvas.SvgCanvas#removeHyperlink
* @returns {void}
*/
    this.removeHyperlink = removeHyperlinkMethod;

    /**
* Group: Element manipulation.
*/

    /**
* Sets the new segment type to the selected segment(s).
* @function module:svgcanvas.SvgCanvas#setSegType
* @param {Integer} newType - New segment type. See {@link https://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSeg} for list
* @returns {void}
*/
    this.setSegType = setSegTypeMethod;

    /**
* Convert selected element to a path, or get the BBox of an element-as-path.
* @function module:svgcanvas.SvgCanvas#convertToPath
* @todo (codedread): Remove the getBBox argument and split this function into two.
* @param {Element} elem - The DOM element to be converted
* @param {boolean} getBBox - Boolean on whether or not to only return the path's BBox
* @returns {void|DOMRect|false|SVGPathElement|null} If the getBBox flag is true, the resulting path's bounding box object.
* Otherwise the resulting path element is returned.
*/
    this.convertToPath = (elem, getBBox) => {
      if (isNullish(elem)) {
        const elems = this.selectedElements;
        elems.forEach(function(el){
          if (el) { this.convertToPath(el); }
        });
        return undefined;
      }
      if (getBBox) {
        return getBBoxOfElementAsPath(elem, this.addSVGElemensFromJson, pathActions);
      }
      // TODO: Why is this applying attributes from this.curShape, then inside utilities.convertToPath it's pulling addition attributes from elem?
      // TODO: If convertToPath is called with one elem, this.curShape and elem are probably the same; but calling with multiple is a bug or cool feature.
      const attrs = {
        fill: this.curShape.fill,
        'fill-opacity': this.curShape.fill_opacity,
        stroke: this.curShape.stroke,
        'stroke-width': this.curShape.stroke_width,
        'stroke-dasharray': this.curShape.stroke_dasharray,
        'stroke-linejoin': this.curShape.stroke_linejoin,
        'stroke-linecap': this.curShape.stroke_linecap,
        'stroke-opacity': this.curShape.stroke_opacity,
        opacity: this.curShape.opacity,
        visibility: 'hidden'
      };
      return convertToPath(
        elem, attrs, this.addSVGElemensFromJson, pathActions,
        this.clearSelection, this.addToSelection, hstry, this.addCommandToHistory
      );
    };

    /**
* This function makes the changes to the elements. It does not add the change
* to the history stack.
* @param {string} attr - Attribute name
* @param {string|Float} newValue - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
    const changeSelectedAttributeNoUndo = changeSelectedAttributeNoUndoMethod;

    /**
* Change the given/selected element and add the original value to the history stack.
* If you want to change all `selectedElements`, ignore the `elems` argument.
* If you want to change only a subset of `selectedElements`, then send the
* subset to this function in the `elems` argument.
* @function module:svgcanvas.SvgCanvas#changeSelectedAttribute
* @param {string} attr - String with the attribute name
* @param {string|Float} val - String or number with the new attribute value
* @param {Element[]} elems - The DOM elements to apply the change to
* @returns {void}
*/
    const changeSelectedAttribute = this.changeSelectedAttribute = changeSelectedAttributeMethod;

    /**
* Initialize from select-elem.js.
* Send in an object implementing the ElementContainer interface (see select-elem.js).
*/
    selectedElemInit(this);

    /**
* Removes all selected elements from the DOM and adds the change to the
* history stack.
* @function module:svgcanvas.SvgCanvas#deleteSelectedElements
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.deleteSelectedElements = deleteSelectedElements;

    /**
* Removes all selected elements from the DOM and adds the change to the
* history stack. Remembers removed elements on the clipboard.
* @function module:svgcanvas.SvgCanvas#cutSelectedElements
* @returns {void}
*/
    this.cutSelectedElements = () => {
      this.copySelectedElements();
      this.deleteSelectedElements();
    };

    /**
* Flash the clipboard data momentarily on localStorage so all tabs can see.
* @returns {void}
*/
    function flashStorage() {
      const data = sessionStorage.getItem(CLIPBOARD_ID);
      localStorage.setItem(CLIPBOARD_ID, data);
      setTimeout(function () {
        localStorage.removeItem(CLIPBOARD_ID);
      }, 1);
    }

    /**
* Transfers sessionStorage from one tab to another.
* @param {!Event} ev Storage event.
* @returns {void}
*/
    function storageChange(ev) {
      if (!ev.newValue) return; // This is a call from removeItem.
      if (ev.key === CLIPBOARD_ID + '_startup') {
        // Another tab asked for our sessionStorage.
        localStorage.removeItem(CLIPBOARD_ID + '_startup');
        flashStorage();
      } else if (ev.key === CLIPBOARD_ID) {
        // Another tab sent data.
        sessionStorage.setItem(CLIPBOARD_ID, ev.newValue);
      }
    }

    // Listen for changes to localStorage.
    window.addEventListener('storage', storageChange, false);
    // Ask other tabs for sessionStorage (this is ONLY to trigger event).
    localStorage.setItem(CLIPBOARD_ID + '_startup', Math.random());
    /**
* Remembers the current selected elements on the clipboard.
* @function module:svgcanvas.SvgCanvas#copySelectedElements
* @returns {void}
*/
    this.copySelectedElements = copySelectedElements;

    pasteInit(this);
    this.pasteElements = pasteElementsMethod;

    /**
* Wraps all the selected elements in a group (`g`) element.
* @function module:svgcanvas.SvgCanvas#groupSelectedElements
* @param {"a"|"g"} [type="g"] - type of element to group into, defaults to `<g>`
* @param {string} [urlArg]
* @returns {void}
*/
    this.groupSelectedElements = groupSelectedElements;

    /**
* Pushes all appropriate parent group properties down to its children, then
* removes them from the group.
* @function module:svgcanvas.SvgCanvas#pushGroupProperties
* @param {SVGAElement|SVGGElement} g
* @param {boolean} undoable
* @returns {BatchCommand|void}
*/
    this.pushGroupProperties = pushGroupProperty;

    /**
* Unwraps all the elements in a selected group (`g`) element. This requires
* significant recalculations to apply group's transforms, etc. to its children.
* @function module:svgcanvas.SvgCanvas#ungroupSelectedElement
* @returns {void}
*/
    this.ungroupSelectedElement = ungroupSelectedElement;

    /**
* Repositions the selected element to the bottom in the DOM to appear on top of
* other elements.
* @function module:svgcanvas.SvgCanvas#moveToTopSelectedElement
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.moveToTopSelectedElement = moveToTopSelectedElem;

    /**
* Repositions the selected element to the top in the DOM to appear under
* other elements.
* @function module:svgcanvas.SvgCanvas#moveToBottomSelectedElement
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.moveToBottomSelectedElement = moveToBottomSelectedElem;

    /**
* Moves the select element up or down the stack, based on the visibly
* intersecting elements.
* @function module:svgcanvas.SvgCanvas#moveUpDownSelected
* @param {"Up"|"Down"} dir - String that's either 'Up' or 'Down'
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {void}
*/
    this.moveUpDownSelected = moveUpDownSelected;

    /**
* Moves selected elements on the X/Y axis.
* @function module:svgcanvas.SvgCanvas#moveSelectedElements
* @param {Float} dx - Float with the distance to move on the x-axis
* @param {Float} dy - Float with the distance to move on the y-axis
* @param {boolean} undoable - Boolean indicating whether or not the action should be undoable
* @fires module:svgcanvas.SvgCanvas#event:changed
* @returns {BatchCommand|void} Batch command for the move
*/
    this.moveSelectedElements = moveSelectedElements;

    /**
* Create deep DOM copies (clones) of all selected elements and move them slightly
* from their originals.
* @function module:svgcanvas.SvgCanvas#cloneSelectedElements
* @param {Float} x Float with the distance to move on the x-axis
* @param {Float} y Float with the distance to move on the y-axis
* @returns {void}
*/
    this.cloneSelectedElements = cloneSelectedElements;

    /**
* Aligns selected elements.
* @function module:svgcanvas.SvgCanvas#alignSelectedElements
* @param {string} type - String with single character indicating the alignment type
* @param {"selected"|"largest"|"smallest"|"page"} relativeTo
* @returns {void}
*/
    this.alignSelectedElements = alignSelectedElements;

    /**
* Group: Additional editor tools.
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
* Updates the editor canvas width/height/position after a zoom has occurred.
* @function module:svgcanvas.SvgCanvas#updateCanvas
* @param {Float} w - Float with the new width
* @param {Float} h - Float with the new height
* @fires module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
* @returns {module:svgcanvas.CanvasInfo}
*/
    this.updateCanvas = updateCanvas;

    /**
* Set the background of the editor (NOT the actual document).
* @function module:svgcanvas.SvgCanvas#setBackground
* @param {string} color - String with fill color to apply
* @param {string} url - URL or path to image to use
* @returns {void}
*/
    this.setBackground = setBackgroundMethod;

    /**
* Select the next/previous element within the current layer.
* @function module:svgcanvas.SvgCanvas#cycleElement
* @param {boolean} next - true = next and false = previous element
* @fires module:svgcanvas.SvgCanvas#event:selected
* @returns {void}
*/
    this.cycleElement = cycleElement;

    this.clear();

    /**
* @interface module:svgcanvas.PrivateMethods
* @type {PlainObject}
* @property {module:svgcanvas~addCommandToHistory} addCommandToHistory
* @property {module:history.HistoryCommand} BatchCommand
* @property {module:history.HistoryCommand} ChangeElementCommand
* @property {module:utilities.decode64} decode64
* @property {module:utilities.dropXMLInternalSubset} dropXMLInternalSubset
* @property {module:utilities.encode64} encode64
* @property {module:svgcanvas~ffClone} ffClone
* @property {module:svgcanvas~findDuplicateGradient} findDuplicateGradient
* @property {module:utilities.getPathBBox} getPathBBox
* @property {module:units.getTypeMap} getTypeMap
* @property {module:draw.identifyLayers} identifyLayers
* @property {module:history.HistoryCommand} InsertElementCommand
* @property {module:browser.isChrome} isChrome
* @property {module:math.isIdentity} isIdentity
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
    this.getPrivateMethods = () => {
      return {
        addCommandToHistory: this.addCommandToHistory,
        BatchCommand,
        ChangeElementCommand,
        decode64,
        dropXMLInternalSubset,
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
        logMatrix,
        MoveElementCommand,
        NS,
        preventClickDefault,
        RemoveElementCommand,
        text2xml,
        transformBox,
        transformPoint,
        walkTree
      };
    };
  } // End constructor
  getSelectedElements() { return this.selectedElements; }
  setSelectedElements(key, value) {
    this.selectedElements[key] = value;
  }
  setEmptySelectedElements() { this.selectedElements = []; }
  getSvgRoot() { return this.svgroot; }
  getDOMDocument() { return this.svgdoc; }
  getDOMContainer() { return this.container; }
  getCurConfig() { return this.curConfig; }
  setIdPrefix(p) { this.idprefix = p; }
  getCurrentDrawing() { return this.current_drawing_;}
  getCurShape() { return this.curShape; }
  getCurrentGroup() { return this.currentGroup; }
  getBaseUnit() { return this.curConfig.baseUnit; }
  getHeight() { return this.svgContent.getAttribute('height') / this.zoom; }
  getWidth() { return this.svgContent.getAttribute('width') / this.zoom; }
  getRoundDigits() { return this.saveOptions.round_digits; }
  getSnappingStep() { return this.curConfig.snappingStep; }
  getGridSnapping() { return this.curConfig.gridSnapping; }
  getStartTransform() { return this.startTransform; }
  setStartTransform(transform) { this.startTransform = transform; }
  getZoom ()  { return this.zoom; }
  round(val) {           return Number.parseInt(val * this.zoom) / this.zoom;  }
  createSVGElement(jsonMap) { return this.addSVGElemensFromJson(jsonMap); }
  getContainer() { return this.container; }
  setStarted(s) { this.started = s; }
  getRubberBox() { return this.rubberBox; }
  setRubberBox(rb) {
    this.rubberBox = rb;
    return this.rubberBox;
  }
  addPtsToSelection({ closedSubpath, grips }) {
    // TODO: Correct this:
    this.pathActions.canDeleteNodes = true;
    this.pathActions.closed_subpath = closedSubpath;
    this.call('pointsAdded', { closedSubpath, grips });
    this.call('selected', grips);
  }
  /**
     * @param {PlainObject} changes
     * @param {ChangeElementCommand} changes.cmd
     * @param {SVGPathElement} changes.elem
     * @fires module:svgcanvas.SvgCanvas#event:changed
     * @returns {void}
     */
  endChanges({ cmd, elem }) {
    this.addCommandToHistory(cmd);
    this.call('changed', [ elem ]);
  }
  getCurrentMode() {
    return this.currentMode;
  }
  setCurrentMode(cm) {
    this.currentMode = cm;
    return this.currentMode;
  }
  getDrawnPath() {
    return this.drawnPath;
  }
  setDrawnPath(dp) {
    this.drawnPath = dp;
    return this.drawnPath;
  }
  setCurrentGroup(cg) {
    this.currentGroup = cg;
  }
  changeSvgContent() {
    this.call('changed', [ this.svgContent ]);
  }
  getStarted() { return this.started; }
  getCanvas() { return this; }
  getrootSctm() { return this.rootSctm; }
  getStartX() { return this.startX; }
  setStartX(value) { this.startX = value; }
  getStartY() { return this.startY; }
  setStartY(value) { this.startY = value; }
  getRStartX() { return this.rStartX; }
  getRStartY() { return this.rStartY; }
  getInitBbox() { return this.initBbox; }
  getCurrentResizeMode() { return this.currentResizeMode; }
  getJustSelected() { return this.justSelected; }
  getOpacAni() { return this.opacAni; }
  getParameter() { return this.parameter; }
  getNextParameter() { return this.nextParameter; }
  getStepCount() { return STEP_COUNT; }
  getThreSholdDist() { return THRESHOLD_DIST; }
  getSumDistance() { return this.sumDistance; }
  getStart(key) { return this.start[key]; }
  getEnd(key) { return this.end[key]; }
  getbSpline(key) { return this.bSpline[key]; }
  getNextPos(key) { return this.addToSelection.nextPos[key]; }
  getControllPoint1(key) { return this.controllPoint1[key]; }
  getControllPoint2(key) { return this.controllPoint2[key]; }
  getFreehand(key) { return this.freehand[key]; }
  getDrawing() { return this.getCurrentDrawing(); }
  getDAttr() { return this.dAttr; }
  getLastGoodImgUrl() { return this.lastGoodImgUrl; }
  getCurText(key) { return this.curText[key]; }
  setDAttr(value) { this.dAttr = value; }
  setEnd(key, value) { this.end[key] = value; }
  setControllPoint1(key, value) { this.controllPoint1[key] = value; }
  setControllPoint2(key, value) { this.controllPoint2[key] = value; }
  setJustSelected(value) { this.justSelected = value; }
  setParameter(value) { this.parameter = value; }
  setStart(value) { this.start = value; }
  setRStartX(value) { this.rStartX = value; }
  setRStartY(value) { this.rStartY = value; }
  setSumDistance(value) { this.sumDistance = value; }
  setbSpline(value) { this.bSpline = value; }
  setNextPos(value) { this.nextPos = value; }
  setNextParameter(value) { this.nextParameter = value; }
  setCurProperties(key, value) { this.curProperties[key] = value; }
  setCurText(key, value) { this.curText[key] = value; }
  setFreehand(key, value) { this.freehand[key] = value; }
  setCurBBoxes(value) { this.curBBoxes = value; }
  setInitBbox(value) { this.initBbox = value; }
  setRootSctm(value) { this.rootSctm = value; }
  setCurrentResizeMode(value) { this.currentResizeMode = value; }
  setLastClickPoint(value) { this.lastClickPoint = value; }
  getId() {
    return this.getCurrentDrawing().getId();
  }
  getUIStrings() { return this.uiStrings; }
  getNsMap() { return this.nsMap; }
  getSvgOptionApply() { return this.saveOptions.apply; }
  getSvgOptionImages() { return this.saveOptions.images; }
  getEncodableImages(key) { return this.encodableImages[key]; }
  setEncodableImages(key, value) { this.encodableImages[key] = value; }
  getVisElems() { return visElems; }
  getIdPrefix() { return this.idprefix; }
  getDataStorage() { return this.dataStorage; }
  setZoom(value) { this.zoom = value; }
  getImportIds(key) { return this.importIds[key]; }
  setImportIds(key, value) { this.importIds[key] = value; }
  setRemovedElements(key, value) { this.removedElements[key] = value; }
  setSvgContent(value) { this.svgContent = value; }
  getrefAttrs() { return refAttrs; }
  getcanvg() { return canvg; }
  setCanvas(key, value) { this[key] = value; }
  getCurProperties(key) { return this.curProperties[key]; }
  setCurShape(key, value) { this.curShape[key] = value; }
  gettingSelectorManager() { return this.selectorManager; }
  getContentW() { return this.contentW; }
  getContentH() { return this.contentH; }
  getClipboardID() { return CLIPBOARD_ID; }
  getSvgContent() { return this.svgContent; }
  getExtensions() { return this.extensions; }
  getSelector() { return Selector; }

  /**
  * @function module:svgcanvas.SvgCanvas#getMode
  * @returns {string} The current editor mode string
  */
  getMode() {
    return this.currentMode;
  }
  getNextId() {
    return this.getCurrentDrawing().getNextId();
  }
  /**
* Sets the editor's mode to the given string.
* @function module:svgcanvas.SvgCanvas#setMode
* @param {string} name - String with the new mode to change to
* @returns {void}
*/
  setMode(name) {
    this.pathActions.clear(true);
    this.textActions.clear();
    this.curProperties = (this.selectedElements[0] && this.selectedElements[0].nodeName === 'text') ? this.curText : this.curShape;
    this.currentMode = name;
  }
  /**
* Clears the current document. This is not an undoable action.
* @function module:svgcanvas.SvgCanvas#clear
* @fires module:svgcanvas.SvgCanvas#event:cleared
* @returns {void}
*/
  clear() {
    this.pathActions.clear();

    this.clearSelection();

    // clear the svgcontent node
    this.clearSvgContentElement();

    // create new document
    this.current_drawing_ = new draw.Drawing(this.svgContent);

    // create empty first layer
    this.createLayer('Layer 1');

    // clear the undo stack
    this.undoMgr.resetUndoStack();

    // reset the selector manager
    this.selectorManager.initGroup();

    // reset the rubber band box
    this.rubberBox = this.selectorManager.getRubberBandBox();

    this.call('cleared');
  }
  runExtension (name, action, vars) {
    return this.runExtensions(action, vars, false, (n) => n === name);
  }
  async addExtension  (name, extInitFunc, { importLocale }) {
    if (typeof extInitFunc !== 'function') {
      throw new TypeError('Function argument expected for `svgcanvas.addExtension`');
    }
    if (name in this.extensions) {
      throw new Error('Cannot add extension "' + name + '", an extension by that name already exists.');
    }
    const argObj = this.mergeDeep(this.getPrivateMethods(), {
      importLocale,
      svgroot: this.svgroot,
      svgContent: this.svgContent,
      nonce: this.getCurrentDrawing().getNonce(),
      selectorManager: this.selectorManager
    });
    const extObj = await extInitFunc(argObj);
    if (extObj) {
      extObj.name = name;
    }
    this.extensions[name] = extObj;
    return this.call('extension_added', extObj);
  }
  addCommandToHistory(cmd) {
    this.undoMgr.addCommandToHistory(cmd);
  }
  restoreRefElements(elem) {
    // Look for missing reference elements, restore any found
    const attrs = {};
    refAttrs.forEach(function (item, _) {
      attrs[item] = elem.getAttribute(item);
    });
    Object.values(attrs).forEach((val) => {
      if (val && val.startsWith('url(')) {
        const id = getUrlFromAttr(val).substr(1);
        const ref = getElem(id);
        if (!ref) {
          findDefs().append(this.removedElements[id]);
          delete this.removedElements[id];
        }
      }
    });
    const childs = elem.getElementsByTagName('*');

    if (childs.length) {
      for (let i = 0, l = childs.length; i < l; i++) {
        this.restoreRefElements(childs[i]);
      }
    }
  }
} // End class

// attach utilities function to the class that are used by SvgEdit so
// we can avoid using the whole utilities.js file in svgEdit.js
SvgCanvas.isNullish = isNullish;
SvgCanvas.encode64 = encode64;
SvgCanvas.decode64 = decode64;
SvgCanvas.$id = $id;
SvgCanvas.$qq = $qq;
SvgCanvas.$qa = $qa;
SvgCanvas.mergeDeep = mergeDeep;
SvgCanvas.getClosest = getClosest;
SvgCanvas.getParents = getParents;
SvgCanvas.blankPageObjectURL = blankPageObjectURL;

export default SvgCanvas;
