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
import 'pathseg';

import * as pathModule from './path.js';
import * as hstry from './history.js';
import * as draw from './draw.js';
import {
  init as pasteInit, pasteElementsMethod
} from './paste-elem.js';

// eslint-disable-next-line no-duplicate-imports
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
import { getReverseNS, NS } from '../common/namespaces.js';
import {
  text2xml, assignAttributes, cleanupElement, getElem, getUrlFromAttr,
  findDefs, getHref, setHref, getRefElem, getRotationAngle, getPathBBox,
  preventClickDefault, walkTree, getBBoxOfElementAsPath, convertToPath, encode64, decode64,
  getVisibleElements, dropXMLInternalSubset, init as utilsInit,
  getBBox as utilsGetBBox, getStrokedBBoxDefaultVisible, isNullish, blankPageObjectURL,
  $id, $qa, $qq, getFeGaussianBlur
} from './utilities.js';
import {
  transformPoint, matrixMultiply, hasMatrixTransform, transformListToTransform,
  isIdentity, transformBox
} from './math.js';
import {
  convertToNum, getTypeMap, init as unitsInit
} from '../common/units.js';
import {
  svgCanvasToString, svgToString, setSvgString, save, exportPDF, setUseDataMethod,
  init as svgInit, importSvgString, embedImage, rasterExport,
  uniquifyElemsMethod, removeUnusedDefElemsMethod, convertGradientsMethod
} from './svg-exec.js';
import {
  isChrome, isWebkit
} from '../common/browser.js'; // , supportsEditableText
import {
  getTransformList, SVGTransformList as SVGEditTransformList
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

if (!window.console) {
  window.console = {};
  window.console.log = function (_str) { /* empty fn */ };
  window.console.dir = function (_str) { /* empty fn */ };
}

if (window.opera) {
  window.console.log = function (str) { window.opera.postError(str); };
  window.console.dir = function (_str) { /* empty fn */ };
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
  * @param {module:SVGeditor.configObj.curConfig} config - An object that contains configuration data
  */
  constructor(container, config) {
    // Alias Namespace constants

    // Default configuration options
    let curConfig = {
      show_outside_canvas: true,
      selectNew: true,
      dimensions: [ 640, 480 ]
    };

    // Update config with new one if given
    this.mergeDeep = mergeDeep;
    if (config) {
      curConfig = this.mergeDeep(curConfig, config);
    }

    // Array with width/height of canvas
    const { dimensions } = curConfig;

    const canvas = this;

    this.$id = $id;
    this.$qq = $qq;
    this.$qa = $qa;
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
    const getDataStorage = this.getDataStorage = function () { return canvas.dataStorage; };

    this.isLayer = draw.Layer.isLayer;

    // "document" element associated with the container (same as window.document using default svg-editor.js)
    // NOTE: This is not actually a SVG document, but an HTML document.
    // JFH const svgdoc = container.ownerDocument;
    const svgdoc = window.document;

    // This is a container for the document being edited, not the document itself.
    /**
 * @name module:svgcanvas~svgroot
 * @type {SVGSVGElement}
 */
    const svgroot = svgRootElement(svgdoc, dimensions);
    const getSVGRoot = () => svgroot;
    container.append(svgroot);

    /**
 * The actual element that represents the final output SVG element.
 * @name module:svgcanvas~svgcontent
 * @type {SVGSVGElement}
 */
    let svgcontent = svgdoc.createElementNS(NS.SVG, 'svg');

    /**
* This should really be an intersection implementing all rather than a union.
* @type {module:draw.DrawCanvasInit#getSVGContent|module:utilities.EditorContext#getSVGContent}
*/
    const getSVGContent = () => { return svgcontent; };

    clearInit(
      /**
  * @implements {module:utilities.EditorContext}
  */
      {
        getSVGContent,
        getDOMDocument() { return svgdoc; },
        getDOMContainer() { return container; },
        getSVGRoot,
        getCurConfig() { return curConfig; }
      }
    );
    /**
* This function resets the svgcontent element while keeping it in the DOM.
* @function module:svgcanvas.SvgCanvas#clearSvgContentElement
* @returns {void}
*/
    const clearSvgContentElement = canvas.clearSvgContentElement = clearSvgContentElementInit;
    clearSvgContentElement();

    // Prefix string for element IDs
    let idprefix = 'svg_';

    /**
* Changes the ID prefix to the given value.
* @function module:svgcanvas.SvgCanvas#setIdPrefix
* @param {string} p - String with the new prefix
* @returns {void}
*/
    canvas.setIdPrefix = function (p) {
      idprefix = p;
    };

    /**
* Current `draw.Drawing` object.
* @type {module:draw.Drawing}
* @name module:svgcanvas.SvgCanvas#current_drawing_
*/
    canvas.current_drawing_ = new draw.Drawing(svgcontent, idprefix);

    /**
* Returns the current Drawing.
* @name module:svgcanvas.SvgCanvas#getCurrentDrawing
* @type {module:draw.DrawCanvasInit#getCurrentDrawing}
*/
    const getCurrentDrawing = canvas.getCurrentDrawing = function () {
      return canvas.current_drawing_;
    };

    /**
* Float displaying the current zoom level (1 = 100%, .5 = 50%, etc.).
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
    allProperties.text = this.mergeDeep({}, allProperties.shape);
    allProperties.text = this.mergeDeep(allProperties.text, {
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

    jsonInit(
      /**
  * @implements {module:json.jsonContext}
  */
      {
        getDOMDocument() { return svgdoc; },
        getDrawing() { return getCurrentDrawing(); },
        getCurShape() { return curShape; },
        getCurrentGroup() { return currentGroup; }
      }
    );

    /**
* @typedef {PlainObject} module:svgcanvas.SVGAsJSON
* @property {string} element
* @property {PlainObject<string, string>} attr
* @property {module:svgcanvas.SVGAsJSON[]} children
*/

    /**
* @function module:svgcanvas.SvgCanvas#getContentElem
* @param {Text|Element} data
* @returns {module:svgcanvas.SVGAsJSON}
*/
    const getJsonFromSvgElement = this.getJsonFromSvgElement = getJsonFromSvgElements;

    /**
* This should really be an intersection implementing all rather than a union.
* @name module:svgcanvas.SvgCanvas#addSVGElementFromJson
* @type {module:utilities.EditorContext#addSVGElementFromJson|module:path.EditorContext#addSVGElementFromJson}
*/
    const addSVGElementFromJson = this.addSVGElementFromJson = addSVGElementsFromJson;

    canvas.getTransformList = getTransformList;
    canvas.matrixMultiply = matrixMultiply;
    canvas.hasMatrixTransform = hasMatrixTransform;
    canvas.transformListToTransform = transformListToTransform;

    /**
* @type {module:utilities.EditorContext#getBaseUnit}
*/
    const getBaseUnit = () => { return curConfig.baseUnit; };

    /**
* Initialize from units.js.
* Send in an object implementing the ElementContainer interface (see units.js).
*/
    unitsInit(
      /**
  * @implements {module:units.ElementContainer}
  */
      {
        getBaseUnit,
        getElement: getElem,
        getHeight() { return svgcontent.getAttribute('height') / currentZoom; },
        getWidth() { return svgcontent.getAttribute('width') / currentZoom; },
        getRoundDigits() { return saveOptions.round_digits; }
      }
    );

    canvas.convertToNum = convertToNum;

    /**
* Should really be an intersection with all needing to apply rather than a union.
* @name module:svgcanvas.SvgCanvas#getSelectedElements
* @type {module:utilities.EditorContext#getSelectedElements|module:draw.DrawCanvasInit#getSelectedElements|module:path.EditorContext#getSelectedElements}
*/
    const getSelectedElements = this.getSelectedElems = function () {
      return selectedElements;
    };

    this.setSelectedElements = function (key, value) {
      selectedElements[key] = value;
    };
    this.setEmptySelectedElements = function () {
      selectedElements = [];
    };

    const { pathActions } = pathModule;

    /**
* This should actually be an intersection as all interfaces should be met.
* @type {module:utilities.EditorContext#getSVGRoot|module:recalculate.EditorContext#getSVGRoot|module:coords.EditorContext#getSVGRoot|module:path.EditorContext#getSVGRoot}
*/

    utilsInit(
      /**
  * @implements {module:utilities.EditorContext}
  */
      {
        pathActions, // Ok since not modifying
        getSVGContent,
        addSVGElementFromJson,
        getSelectedElements,
        getDOMDocument() { return svgdoc; },
        getDOMContainer() { return container; },
        getSVGRoot,
        // TODO: replace this mostly with a way to get the current drawing.
        getBaseUnit,
        getSnappingStep() { return curConfig.snappingStep; },
        getDataStorage
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
* This should actually be an intersection not a union as all should apply.
* @type {module:coords.EditorContext#getGridSnapping|module:path.EditorContext#getGridSnapping}
*/
    const getGridSnapping = () => { return curConfig.gridSnapping; };

    coordsInit(
      /**
  * @implements {module:coords.EditorContext}
  */
      {
        getDrawing() { return getCurrentDrawing(); },
        getDataStorage,
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
        getStartTransform() { return startTransform; },
        setStartTransform(transform) { startTransform = transform; },
        getDataStorage
      }
    );
    this.recalculateDimensions = recalculateDimensions;

    // import from sanitize.js
    const nsMap = getReverseNS();
    canvas.sanitizeSvg = sanitizeSvg;

    /**
* This should really be an intersection applying to all types rather than a union.
* @name module:svgcanvas.SvgCanvas#getZoom
* @type {module:path.EditorContext#getCurrentZoom|module:select.SVGFactory#getCurrentZoom}
*/
    const getCurrentZoom = this.getZoom = function () { return currentZoom; };

    /**
* This method rounds the incoming value to the nearest value based on the `currentZoom`
* @name module:svgcanvas.SvgCanvas#round
* @type {module:path.EditorContext#round}
*/
    const round = this.round = function (val) {
      return Number.parseInt(val * currentZoom) / currentZoom;
    };

    selectInit(
      curConfig,
      /**
  * Export to select.js.
  * @implements {module:select.SVGFactory}
  */
      {
        createSVGElement(jsonMap) { return canvas.addSVGElementFromJson(jsonMap); },
        svgRoot() { return svgroot; },
        svgContent() { return svgcontent; },
        getDataStorage,
        getCurrentZoom
      }
    );
    /**
* This object manages selectors for us.
* @name module:svgcanvas.SvgCanvas#selectorManager
* @type {module:select.SelectorManager}
*/
    const selectorManager = this.selectorManager = getSelectorManager();

    /**
* @name module:svgcanvas.SvgCanvas#getNextId
* @type {module:path.EditorContext#getNextId}
*/
    const getNextId = canvas.getNextId = function () {
      return getCurrentDrawing().getNextId();
    };

    /**
* @name module:svgcanvas.SvgCanvas#getId
* @type {module:path.EditorContext#getId}
*/
    const getId = canvas.getId = function () {
      return getCurrentDrawing().getId();
    };

    /**
* The "implements" should really be an intersection applying to all types rather than a union.
* @name module:svgcanvas.SvgCanvas#call
* @type {module:draw.DrawCanvasInit#call|module:path.EditorContext#call}
*/
    const call = function (ev, arg) {
      if (events[ev]) {
        return events[ev](window, arg);
      }
      return undefined;
    };

    const restoreRefElems = function (elem) {
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
            findDefs().append(removedElements[id]);
            delete removedElements[id];
          }
        }
      });

      const childs = elem.getElementsByTagName('*');

      if (childs.length) {
        for (let i = 0, l = childs.length; i < l; i++) {
          restoreRefElems(childs[i]);
        }
      }
    };

    undoInit(
      /**
  * @implements {module:undo.undoContext}
  */
      {
        call,
        restoreRefElems,
        getSVGContent,
        getCanvas() { return canvas; },
        getCurrentMode() { return currentMode; },
        getCurrentZoom,
        getSVGRoot,
        getSelectedElements
      }
    );

    /**
* @name undoMgr
* @memberof module:svgcanvas.SvgCanvas#
* @type {module:history.HistoryEventHandler}
*/
    const undoMgr = canvas.undoMgr = getUndoManager();

    /**
* This should really be an intersection applying to all types rather than a union.
* @name module:svgcanvas~addCommandToHistory
* @type {module:path.EditorContext#addCommandToHistory|module:draw.DrawCanvasInit#addCommandToHistory}
*/
    const addCommandToHistory = function (cmd) {
      canvas.undoMgr.addCommandToHistory(cmd);
    };
    selectionInit(
      /**
  * @implements {module:selection.selectionContext}
  */
      {
        getCanvas() { return canvas; },
        getDataStorage,
        getCurrentGroup() { return currentGroup; },
        getSelectedElements,
        getSVGRoot,
        getSVGContent,
        getDOMContainer() { return container; },
        getExtensions() { return extensions; },
        setExtensions(key, value) { extensions[key] = value; },
        getCurrentZoom,
        getRubberBox() { return rubberBox; },
        setCurBBoxes(value) { curBBoxes = value; },
        getCurBBoxes(_value) { return curBBoxes; },
        getCurrentResizeMode() { return currentResizeMode; },
        addCommandToHistory,
        getSelector() { return Selector; }
      }
    );

    /**
* Clears the selection. The 'selected' handler is then optionally called.
* This should really be an intersection applying to all types rather than a union.
* @name module:svgcanvas.SvgCanvas#clearSelection
* @type {module:draw.DrawCanvasInit#clearSelection|module:path.EditorContext#clearSelection}
* @fires module:svgcanvas.SvgCanvas#event:selected
*/
    const clearSelection = this.clearSelection = clearSelectionMethod;

    /**
* Adds a list of elements to the selection. The 'selected' handler is then called.
* @name module:svgcanvas.SvgCanvas#addToSelection
* @type {module:path.EditorContext#addToSelection}
* @fires module:svgcanvas.SvgCanvas#event:selected
*/
    const addToSelection = this.addToSelection = addToSelectionMethod;

    /**
    * @type {module:path.EditorContext#getOpacity}
    */
    const getOpacity = function () {
      return curShape.opacity;
    };

    /**
    * @name module:svgcanvas.SvgCanvas#getMouseTarget
    * @type {module:path.EditorContext#getMouseTarget}
    */
    const getMouseTarget = this.getMouseTarget = getMouseTargetMethod;

    /**
* @namespace {module:path.pathActions} pathActions
* @memberof module:svgcanvas.SvgCanvas#
* @see module:path.pathActions
*/
    canvas.pathActions = pathActions;
    /**
* @type {module:path.EditorContext#resetD}
*/
    function resetD(p) {
      if (typeof pathActions.convertPath === 'function') {
        p.setAttribute('d', pathActions.convertPath(p));
      } else if (typeof pathActions.convertPaths === 'function') {
        p.setAttribute('d', pathActions.convertPaths(p));
      }
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
        getContainer() {
          return container;
        },
        setStarted(s) {
          started = s;
        },
        getRubberBox() {
          return rubberBox;
        },
        setRubberBox(rb) {
          rubberBox = rb;
          return rubberBox;
        },
        /**
     * @param {PlainObject} ptsInfo
     * @param {boolean} ptsInfo.closedSubpath
     * @param {SVGCircleElement[]} ptsInfo.grips
     * @fires module:svgcanvas.SvgCanvas#event:pointsAdded
     * @fires module:svgcanvas.SvgCanvas#event:selected
     * @returns {void}
     */
        addPtsToSelection({ closedSubpath, grips }) {
          // TODO: Correct this:
          pathActions.canDeleteNodes = true;
          pathActions.closed_subpath = closedSubpath;
          call('pointsAdded', { closedSubpath, grips });
          call('selected', grips);
        },
        /**
     * @param {PlainObject} changes
     * @param {ChangeElementCommand} changes.cmd
     * @param {SVGPathElement} changes.elem
     * @fires module:svgcanvas.SvgCanvas#event:changed
     * @returns {void}
     */
        endChanges({ cmd, elem }) {
          addCommandToHistory(cmd);
          call('changed', [ elem ]);
        },
        getCurrentZoom,
        getId,
        getNextId,
        getMouseTarget,
        getCurrentMode() {
          return currentMode;
        },
        setCurrentMode(cm) {
          currentMode = cm;
          return currentMode;
        },
        getDrawnPath() {
          return drawnPath;
        },
        setDrawnPath(dp) {
          drawnPath = dp;
          return drawnPath;
        },
        getSVGRoot
      }
    );

    // Interface strings, usually for title elements
    const uiStrings = {};

    // Animation element to change the opacity of any newly created element
    const opacAni = document.createElementNS(NS.SVG, 'animate');
    opacAni.setAttribute('attributeName', 'opacity');
    opacAni.setAttribute('begin', 'indefinite');
    opacAni.setAttribute('dur', 1);
    opacAni.setAttribute('fill', 'freeze');
    svgroot.appendChild(opacAni);

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
    const encodableImages = {};
    // Object with save options
    /**
    * @type {module:svgcanvas.SaveOptions}
    */
    const saveOptions = { round_digits: 5 };
    // Object with IDs for imported files, to see if one was already added
    const importIds = {};
    // Current text style properties
    const curText = allProperties.text;
    // Object to contain all included extensions
    const extensions = {};
    // Map of deleted reference elements
    const removedElements = {};

    // String with image URL of last loadable image
    let lastGoodImgUrl = curConfig.imgPath + 'logo.svg';
    // Boolean indicating whether or not a draw action has been started
    let started = false;
    // String with an element's initial transform attribute value
    let startTransform = null;
    // String indicating the current editor mode
    let currentMode = 'select';
    // String with the current direction in which an element is being resized
    let currentResizeMode = 'none';
    // Current general properties
    let curProperties = curShape;
    // Array with selected elements' Bounding box object
    // selectedBBoxes = new Array(1),
    // The DOM element that was just selected
    let justSelected = null;
    // DOM element for selection rectangle drawn by the user
    let rubberBox = null;
    // Array of current BBoxes, used in getIntersectionList().
    let curBBoxes = [];
    // Canvas point for the most recent right click
    let lastClickPoint = null;

    this.runExtension = function (name, action, vars) {
      return this.runExtensions(action, vars, false, (n) => n === name);
    };
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

    this.runExtensions = runExtensionsMethod;

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
    this.addExtension = async function (name, extInitFunc, { importLocale }) {
      if (typeof extInitFunc !== 'function') {
        throw new TypeError('Function argument expected for `svgcanvas.addExtension`');
      }
      if (name in extensions) {
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
      const argObj = canvas.mergeDeep(canvas.getPrivateMethods(), {
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
    const getIntersectionList = this.getIntersectionList = getIntersectionListMethod;

    this.getStrokedBBox = getStrokedBBoxDefaultVisible;

    this.getVisibleElements = getVisibleElements;

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

    canvas.call = call;
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
    canvas.bind = function (ev, f) {
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
    let rootSctm = null;

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
* @returns {void}
*/
    /* const removeFromSelection = */ this.removeFromSelection = function (elemsToRemove) {
      if (isNullish(selectedElements[0])) { return; }
      if (!elemsToRemove.length) { return; }

      // find every element and remove it from our array copy
      const newSelectedItems = [];
      const len = selectedElements.length;
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
* @returns {void}
*/
    this.selectAllInCurrentLayer = function () {
      const currentLayer = getCurrentDrawing().getCurrentLayer();
      if (currentLayer) {
        currentMode = 'select';
        if (currentGroup) {
          selectOnly(currentGroup.children);
        } else {
          selectOnly(currentLayer.children);
        }
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
      const THRESHOLD_DIST = 0.8;
      const STEP_COUNT = 10;
      let dAttr = null;
      let startX = null;
      let startY = null;
      let rStartX = null;
      let rStartY = null;
      let initBbox = {};
      let sumDistance = 0;
      const controllPoint2 = { x: 0, y: 0 };
      const controllPoint1 = { x: 0, y: 0 };
      let start = { x: 0, y: 0 };
      const end = { x: 0, y: 0 };
      let bSpline = { x: 0, y: 0 };
      let nextPos = { x: 0, y: 0 };
      let parameter;
      let nextParameter;

      /**
      * @function eventInit Initialize from event.js
      * @returns {void}
      */
      eventInit(
        /**
        * @implements {module:event.eventContext_}
        */
        {
          getStarted() { return started; },
          getCanvas() { return canvas; },
          getDataStorage,
          getCurConfig() { return curConfig; },
          getCurrentMode() { return currentMode; },
          getrootSctm() { return rootSctm; },
          getStartX() { return startX; },
          setStartX(value) { startX = value; },
          getStartY() { return startY; },
          setStartY(value) { startY = value; },
          getRStartX() { return rStartX; },
          getRStartY() { return rStartY; },
          getRubberBox() { return rubberBox; },
          getInitBbox() { return initBbox; },
          getCurrentResizeMode() { return currentResizeMode; },
          getCurrentGroup() { return currentGroup; },
          getDrawnPath() { return drawnPath; },
          getJustSelected() { return justSelected; },
          getOpacAni() { return opacAni; },
          getParameter() { return parameter; },
          getNextParameter() { return nextParameter; },
          getStepCount() { return STEP_COUNT; },
          getThreSholdDist() { return THRESHOLD_DIST; },
          getSumDistance() { return sumDistance; },
          getStart(key) { return start[key]; },
          getEnd(key) { return end[key]; },
          getbSpline(key) { return bSpline[key]; },
          getNextPos(key) { return nextPos[key]; },
          getControllPoint1(key) { return controllPoint1[key]; },
          getControllPoint2(key) { return controllPoint2[key]; },
          getFreehand(key) { return freehand[key]; },
          getDrawing() { return getCurrentDrawing(); },
          getCurShape() { return curShape; },
          getDAttr() { return dAttr; },
          getLastGoodImgUrl() { return lastGoodImgUrl; },
          getCurText(key) { return curText[key]; },
          setDAttr(value) { dAttr = value; },
          setEnd(key, value) { end[key] = value; },
          setControllPoint1(key, value) { controllPoint1[key] = value; },
          setControllPoint2(key, value) { controllPoint2[key] = value; },
          setJustSelected(value) { justSelected = value; },
          setParameter(value) { parameter = value; },
          setStart(value) { start = value; },
          setRStartX(value) { rStartX = value; },
          setRStartY(value) { rStartY = value; },
          setSumDistance(value) { sumDistance = value; },
          setbSpline(value) { bSpline = value; },
          setNextPos(value) { nextPos = value; },
          setNextParameter(value) { nextParameter = value; },
          setCurProperties(key, value) { curProperties[key] = value; },
          setCurText(key, value) { curText[key] = value; },
          setStarted(s) { started = s; },
          setStartTransform(transform) { startTransform = transform; },
          setCurrentMode(cm) {
            currentMode = cm;
            return currentMode;
          },
          setFreehand(key, value) { freehand[key] = value; },
          setCurBBoxes(value) { curBBoxes = value; },
          setRubberBox(value) { rubberBox = value; },
          setInitBbox(value) { initBbox = value; },
          setRootSctm(value) { rootSctm = value; },
          setCurrentResizeMode(value) { currentResizeMode = value; },
          setLastClickPoint(value) { lastClickPoint = value; },
          getSelectedElements,
          getCurrentZoom,
          getId,
          addCommandToHistory,
          getSVGRoot,
          getSVGContent,
          call,
          getIntersectionList
        }
      );

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
      const mouseDown = mouseDownEvent;

      // in this function we do not record any state changes yet (but we do update
      // any elements that are still being created, moved or resized on the canvas)
      /**
 *
 * @param {MouseEvent} evt
 * @fires module:svgcanvas.SvgCanvas#event:transition
 * @fires module:svgcanvas.SvgCanvas#event:ext_mouseMove
 * @returns {void}
 */
      const mouseMove = mouseMoveEvent;

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
      const mouseUp = mouseUpEvent;
      const mouseOut = mouseOutEvent;

      const dblClick = dblClickEvent;

      // prevent links from being followed in the canvas
      const handleLinkInCanvas = function (e) {
        e.preventDefault();
        return false;
      };

      // Added mouseup to the container here.
      // TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.
      container.addEventListener('mousedown', mouseDown);
      container.addEventListener('mousemove', mouseMove);
      container.addEventListener('click', handleLinkInCanvas);
      container.addEventListener('dblclick', dblClick);
      container.addEventListener('mouseup', mouseUp);
      container.addEventListener('mouseleave', mouseOut);

      // TODO(rafaelcastrocouto): User preference for shift key and zoom factor
      container.addEventListener('mousewheel', DOMMouseScrollEvent);
      container.addEventListener('DOMMouseScroll', DOMMouseScrollEvent);

    }());

    textActionsInit(
      /**
  * @implements {module:text-actions.textActionsContext}
  */
      {
        getCanvas() { return canvas; },
        getrootSctm() { return rootSctm; },
        getSelectedElements,
        getCurrentZoom,
        getCurrentMode() {
          return currentMode;
        },
        setCurrentMode(cm) {
          currentMode = cm;
          return currentMode;
        },
        getSVGRoot,
        call
      }
    );

    const textActions = canvas.textActions = textActionsMethod;

    /**
* Group: Serialization.
*/

    svgInit(
      /**
      * @implements {module:elem-get-set.elemInit}
      */
      {
        getCanvas() { return canvas; },
        getDataStorage,
        getSVGContent,
        getSVGRoot,
        getUIStrings() { return uiStrings; },
        getCurrentGroup() { return currentGroup; },
        getCurConfig() { return curConfig; },
        getNsMap() { return nsMap; },
        getSvgOption() { return saveOptions; },
        setSvgOption(key, value) { saveOptions[key] = value; },
        getSvgOptionApply() { return saveOptions.apply; },
        getSvgOptionImages() { return saveOptions.images; },
        getEncodableImages(key) { return encodableImages[key]; },
        setEncodableImages(key, value) { encodableImages[key] = value; },
        call,
        getDOMDocument() { return svgdoc; },
        getVisElems() { return visElems; },
        getIdPrefix() { return idprefix; },
        setCurrentZoom(value) { currentZoom = value; },
        getImportIds(key) { return importIds[key]; },
        setImportIds(key, value) { importIds[key] = value; },
        setRemovedElements(key, value) { removedElements[key] = value; },
        setSVGContent(value) { svgcontent = value; },
        getrefAttrs() { return refAttrs; },
        getcanvg() { return canvg; },
        addCommandToHistory
      }
    );

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
      lastGoodImgUrl = val;
    };

    /**
* Does nothing by default, handled by optional widget/extension.
* @function module:svgcanvas.SvgCanvas#open
* @returns {void}
*/
    this.open = function () {
      /* empty fn */
    };

    /**
* Serializes the current drawing into SVG XML text and passes it to the 'saved' handler.
* This function also includes the XML prolog. Clients of the `SvgCanvas` bind their save
* function to the 'saved' event.
* @function module:svgcanvas.SvgCanvas#save
* @param {module:svgcanvas.SaveOptions} opts
* @fires module:svgcanvas.SvgCanvas#event:saved
* @returns {void}
*/
    this.save = save;

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
      saveOptions.apply = false;
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
        draw.randomizeIds(false, getCurrentDrawing());
      } else {
        draw.randomizeIds(true, getCurrentDrawing());
      }
    };

    /**
* Ensure each element has a unique ID.
* @function module:svgcanvas.SvgCanvas#uniquifyElems
* @param {Element} g - The parent element of the tree to give unique IDs
* @returns {void}
*/
    const uniquifyElems = this.uniquifyElems = uniquifyElemsMethod;

    /**
* Assigns reference data for each use element.
* @function module:svgcanvas.SvgCanvas#setUseData
* @param {Element} parent
* @returns {void}
*/
    const setUseData = this.setUseData = setUseDataMethod;

    /**
* Converts gradients from userSpaceOnUse to objectBoundingBox.
* @function module:svgcanvas.SvgCanvas#convertGradients
* @param {Element} elem
* @returns {void}
*/
    const convertGradients = this.convertGradients = convertGradientsMethod;

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
    this.setSvgString = setSvgString;

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
    this.importSvgString = importSvgString;

    // Could deprecate, but besides external uses, their usage makes clear that
    //  canvas is a dependency for all of these
    const dr = {
      identifyLayers, createLayer, cloneLayer, deleteCurrentLayer,
      setCurrentLayer, renameCurrentLayer, setCurrentLayerPosition,
      setLayerVisibility, moveSelectedToLayer, mergeLayer, mergeAllLayers,
      leaveContext, setContext
    };
    Object.entries(dr).forEach(([ prop, propVal ]) => {
      canvas[prop] = propVal;
    });
    draw.init(
      /**
  * @implements {module:draw.DrawCanvasInit}
  */
      {
        pathActions,
        getDataStorage,
        getCurrentGroup() {
          return currentGroup;
        },
        setCurrentGroup(cg) {
          currentGroup = cg;
        },
        getSelectedElements,
        getSVGContent,
        undoMgr,
        getCurrentDrawing,
        clearSelection,
        call,
        addCommandToHistory,
        /**
     * @fires module:svgcanvas.SvgCanvas#event:changed
     * @returns {void}
     */
        changeSVGContent() {
          call('changed', [ svgcontent ]);
        }
      }
    );

    /**
* Group: Document functions.
*/

    /**
* Clears the current document. This is not an undoable action.
* @function module:svgcanvas.SvgCanvas#clear
* @fires module:svgcanvas.SvgCanvas#event:cleared
* @returns {void}
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

    elemInit(
      /**
  * @implements {module:elem-get-set.elemInit}
  */
      {
        addCommandToHistory,
        getCurrentZoom,
        getSVGContent,
        getSelectedElements,
        call,
        changeSelectedAttributeNoUndoMethod,
        getDOMDocument() { return svgdoc; },
        getCanvas() { return canvas; },
        getDataStorage,
        setCanvas(key, value) { canvas[key] = value; },
        setCurrentZoom(value) { currentZoom = value; },
        setCurProperties(key, value) { curProperties[key] = value; },
        getCurProperties(key) { return curProperties[key]; },
        setCurShape(key, value) { curShape[key] = value; },
        getCurText(key) { return curText[key]; },
        setCurText(key, value) { curText[key] = value; }
      }
    );

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
    const getResolution = this.getResolution = getResolutionMethod;

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
* Update interface strings with given values.
* @function module:svgcanvas.SvgCanvas#setUiStrings
* @param {module:path.uiStrings} strs - Object with strings (see the [locales API]{@link module:locale.LocaleStrings} and the [tutorial]{@tutorial LocaleDocs})
* @returns {void}
*/
    this.setUiStrings = function (strs) {
      Object.assign(uiStrings, strs.notification);
      pathModule.setUiStrings(strs);
    };

    /**
* Update configuration options with given values.
* @function module:svgcanvas.SvgCanvas#setConfig
* @param {module:SVGEditor.Config} opts - Object with options
* @returns {void}
*/
    this.setConfig = function (opts) {
      Object.assign(curConfig, opts);
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
      return canvas.getTitle(svgcontent);
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
* position in the editor's canvas.
*/
    this.getOffset = function () {
      return { x: svgcontent.getAttribute('x'), y: svgcontent.getAttribute('y') };
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
    this.setZoom = setZoomMethod;

    /**
* @function module:svgcanvas.SvgCanvas#getMode
* @returns {string} The current editor mode string
*/
    this.getMode = function () {
      return currentMode;
    };

    /**
* Sets the editor's mode to the given string.
* @function module:svgcanvas.SvgCanvas#setMode
* @param {string} name - String with the new mode to change to
* @returns {void}
*/
    this.setMode = function (name) {
      pathActions.clear(true);
      textActions.clear();
      curProperties = (selectedElements[0] && selectedElements[0].nodeName === 'text') ? curText : curShape;
      currentMode = name;
    };

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
      return curProperties[type];
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
      return curProperties.stroke_width;
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
      return curShape;
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
* Sets the current fill/stroke opacity.
* @function module:svgcanvas.SvgCanvas#setPaintOpacity
* @param {string} type - String with "fill" or "stroke"
* @param {Float} val - Float with the new opacity value
* @param {boolean} preventUndo - Indicates whether or not this should be an undoable action
* @returns {void}
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
      // const elem = selectedElements[0];

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

    (function () {
      let curCommand = null;
      let filter = null;
      let filterHidden = false;

      blurInit(
        /**
        * @implements {module:elem-get-set.elemInit}
        */
        {
          getCanvas() { return canvas; },
          getCurCommand() { return curCommand; },
          setCurCommand(value) { curCommand = value; },
          getFilter() { return filter; },
          setFilter(value) { filter = value; },
          getFilterHidden() { return filterHidden; },
          setFilterHidden(value) { filterHidden = value; },
          changeSelectedAttributeNoUndoMethod,
          changeSelectedAttributeMethod,
          isWebkit,
          addCommandToHistory,
          getSelectedElements
        }
      );

      /**
* Sets the `stdDeviation` blur value on the selected element without being undoable.
* @function module:svgcanvas.SvgCanvas#setBlurNoUndo
* @param {Float} val - The new `stdDeviation` value
* @returns {void}
*/
      canvas.setBlurNoUndo = setBlurNoUndo;

      /**
* Sets the `x`, `y`, `width`, `height` values of the filter element in order to
* make the blur not be clipped. Removes them if not neeeded.
* @function module:svgcanvas.SvgCanvas#setBlurOffsets
* @param {Element} filterElem - The filter DOM element to update
* @param {Float} stdDev - The standard deviation value on which to base the offset size
* @returns {void}
*/
      canvas.setBlurOffsets = setBlurOffsets;

      /**
* Adds/updates the blur filter to the selected element.
* @function module:svgcanvas.SvgCanvas#setBlur
* @param {Float} val - Float with the new `stdDeviation` blur value
* @param {boolean} complete - Whether or not the action should be completed (to add to the undo manager)
* @returns {void}
*/
      canvas.setBlur = setBlur;
    }());

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
    this.convertToPath = function (elem, getBBox) {
      if (isNullish(elem)) {
        const elems = selectedElements;
        elems.forEach(function(el){
          if (el) { canvas.convertToPath(el); }
        });
        return undefined;
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
      return convertToPath(
        elem, attrs, addSVGElementFromJson, pathActions,
        clearSelection, addToSelection, hstry, addCommandToHistory
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
    selectedElemInit(
      /**
  * @implements {module:selected-elem.elementContext}
  */
      {
        getSelectedElements,
        addCommandToHistory,
        getJsonFromSvgElement,
        addSVGElementFromJson,
        changeSelectedAttribute,
        flashStorage,
        call,
        getIntersectionList,
        setCurBBoxes(value) { curBBoxes = value; },
        getSVGRoot,
        gettingSelectorManager() { return selectorManager; },
        getCurrentZoom,
        getDrawing() { return getCurrentDrawing(); },
        getCurrentGroup() { return currentGroup; },
        addToSelection,
        getContentW() { return canvas.contentW; },
        getContentH() { return canvas.contentH; },
        getClipboardID() { return CLIPBOARD_ID; },
        getDOMDocument() { return svgdoc; },
        clearSelection,
        getNextId,
        selectOnly,
        uniquifyElems,
        setUseData,
        convertGradients,
        getSVGContent,
        getCanvas() { return canvas; },
        getDataStorage,
        getVisElems() { return visElems; }
      }
    );

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
    this.cutSelectedElements = function () {
      canvas.copySelectedElements();
      canvas.deleteSelectedElements();
    };

    const CLIPBOARD_ID = 'svgedit_clipboard';

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

    /**
    * @function pasteInit Initialize from paste-elem.js.
    * @returns {void}
    * paste element functionality
    */
    pasteInit(
      /**
      * @implements {module:event.eventContext_}
      */
      {
        getCanvas() { return canvas; },
        getClipBoardID() { return CLIPBOARD_ID; },
        getLastClickPoint(key) { return lastClickPoint[key]; },
        addCommandToHistory,
        restoreRefElems
      }
    );

    /**
* @function module:svgcanvas.SvgCanvas#pasteElements
* @param {"in_place"|"point"|void} type
* @param {Integer|void} x Expected if type is "point"
* @param {Integer|void} y Expected if type is "point"
* @fires module:svgcanvas.SvgCanvas#event:changed
* @fires module:svgcanvas.SvgCanvas#event:ext_IDsUpdated
* @returns {void}
*/
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
    this.getPrivateMethods = function () {
      return {
        addCommandToHistory,
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
        SVGEditTransformList,
        text2xml,
        transformBox,
        transformPoint,
        walkTree
      };
    };
  } // End constructor
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
