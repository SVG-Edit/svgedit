/**
* Handles underlying communication between the embedding window and the editor frame
* @module EmbeddedSVGEdit
*/

let cbid = 0;

/**
* @callback module:EmbeddedSVGEdit.CallbackSetter
* @param {GenericCallback} newCallback Callback to be stored (signature dependent on function)
* @returns {void}
*/
/**
* @callback module:EmbeddedSVGEdit.CallbackSetGetter
* @param {...any} args Signature dependent on the function
* @returns {module:EmbeddedSVGEdit.CallbackSetter}
*/

/**
* @param {string} funcName
* @returns {module:EmbeddedSVGEdit.CallbackSetGetter}
*/
function getCallbackSetter (funcName) {
  return function (...args) {
    const that = this, // New callback
      callbackID = this.send(funcName, args, function () { /* */ }); // The callback (currently it's nothing, but will be set later)

    return function (newCallback) {
      that.callbacks[callbackID] = newCallback; // Set callback
    };
  };
}

/**
* Having this separate from messageListener allows us to
* avoid using JSON parsing (and its limitations) in the case
* of same domain control.
* @param {module:EmbeddedSVGEdit.EmbeddedSVGEdit} t The `this` value
* @param {JSON} data
* @returns {void}
*/
function addCallback (t, {result, error, id: callbackID}) {
  if (typeof callbackID === 'number' && t.callbacks[callbackID]) {
    // These should be safe both because we check `cbid` is numeric and
    //   because the calls are from trusted origins
    if (result) {
      t.callbacks[callbackID](result); // lgtm [js/unvalidated-dynamic-method-call]
    } else {
      t.callbacks[callbackID](error, 'error'); // lgtm [js/unvalidated-dynamic-method-call]
    }
  }
}

/**
* @param {Event} e
* @returns {void}
*/
function messageListener (e) {
  // We accept and post strings as opposed to objects for the sake of IE9 support; this
  //   will most likely be changed in the future
  if (!e.data || !['string', 'object'].includes(typeof e.data)) {
    return;
  }
  const {allowedOrigins} = this,
    data = typeof e.data === 'object' ? e.data : JSON.parse(e.data);
  if (!data || typeof data !== 'object' || data.namespace !== 'svg-edit' ||
    e.source !== this.frame.contentWindow ||
    (!allowedOrigins.includes('*') && !allowedOrigins.includes(e.origin))
  ) {
    console.log(`The origin ${e.origin} was not whitelisted as an origin from which responses may be received by this ${window.origin} script.`); // eslint-disable-line no-console
    return;
  }
  addCallback(this, data);
}

/**
* @callback module:EmbeddedSVGEdit.MessageListener
* @param {MessageEvent} e
* @returns {void}
*/
/**
* @param {module:EmbeddedSVGEdit.EmbeddedSVGEdit} t The `this` value
* @returns {module:EmbeddedSVGEdit.MessageListener} Event listener
*/
function getMessageListener (t) {
  return function (e) {
    messageListener.call(t, e);
  };
}

/**
* Embedded SVG-edit API.
* General usage:
* - Have an iframe somewhere pointing to a version of svg-edit > r1000.
* @example
// Initialize the magic with:
const svgCanvas = new EmbeddedSVGEdit(window.frames.svgedit);

// Pass functions in this format:
svgCanvas.setSvgString('string');

// Or if a callback is needed:
svgCanvas.setSvgString('string')(function (data, error) {
  if (error) {
     // There was an error
  } else {
     // Handle data
  }
});

// Everything is done with the same API as the real svg-edit,
// and all documentation is unchanged.

// However, this file depends on the postMessage API which
// can only support JSON-serializable arguments and
// return values, so, for example, arguments whose value is
// 'undefined', a function, a non-finite number, or a built-in
// object like Date(), RegExp(), etc. will most likely not behave
// as expected. In such a case one may need to host
// the SVG editor on the same domain and reference the
// JavaScript methods on the frame itself.

// The only other difference is when handling returns:
// the callback notation is used instead.
const blah = new EmbeddedSVGEdit(window.frames.svgedit);
blah.clearSelection('woot', 'blah', 1337, [1, 2, 3, 4, 5, 'moo'], -42, {
     a: 'tree', b: 6, c: 9
})(function () { console.log('GET DATA', args); });
*
* @memberof module:EmbeddedSVGEdit
*/
class EmbeddedSVGEdit {
  /**
  * @param {HTMLIFrameElement} frame
  * @param {string[]} [allowedOrigins=[]] Array of origins from which incoming
  *   messages will be allowed when same origin is not used; defaults to none.
  *   If supplied, it should probably be the same as svgEditor's allowedOrigins
  */
  constructor (frame, allowedOrigins) {
    const that = this;
    this.allowedOrigins = allowedOrigins || [];
    // Initialize communication
    this.frame = frame;
    this.callbacks = {};
    // List of functions extracted with this:
    // Run in firebug on http://svg-edit.googlecode.com/svn/trunk/docs/files/svgcanvas-js.html

    // for (const i=0,q=[],f = document.querySelectorAll('div.CFunction h3.CTitle a'); i < f.length; i++) { q.push(f[i].name); }; q
    // const functions = ['clearSelection', 'addToSelection', 'removeFromSelection', 'open', 'save', 'getSvgString', 'setSvgString',
    // 'createLayer', 'deleteCurrentLayer', 'setCurrentLayer', 'renameCurrentLayer', 'setCurrentLayerPosition', 'setLayerVisibility',
    // 'moveSelectedToLayer', 'clear'];

    // Newer, well, it extracts things that aren't documented as well. All functions accessible through the normal thingy can now be accessed though the API
    // const {svgCanvas} = frame.contentWindow;
    // const l = [];
    // for (const i in svgCanvas) { if (typeof svgCanvas[i] === 'function') { l.push(i);} };
    // alert("['" + l.join("', '") + "']");
    // Run in svgedit itself
    const functions = [
      'addExtension',
      'addSVGElementFromJson',
      'addToSelection',
      'alignSelectedElements',
      'assignAttributes',
      'bind',
      'call',
      'changeSelectedAttribute',
      'cleanupElement',
      'clear',
      'clearSelection',
      'clearSvgContentElement',
      'cloneLayer',
      'cloneSelectedElements',
      'convertGradients',
      'convertToGroup',
      'convertToNum',
      'convertToPath',
      'copySelectedElements',
      'createLayer',
      'cutSelectedElements',
      'cycleElement',
      'deleteCurrentLayer',
      'deleteSelectedElements',
      'embedImage',
      'exportPDF',
      'findDefs',
      'getBBox',
      'getBlur',
      'getBold',
      'getColor',
      'getContentElem',
      'getCurrentDrawing',
      'getDocumentTitle',
      'getEditorNS',
      'getElem',
      'getFillOpacity',
      'getFontColor',
      'getFontFamily',
      'getFontSize',
      'getHref',
      'getId',
      'getIntersectionList',
      'getItalic',
      'getMode',
      'getMouseTarget',
      'getNextId',
      'getOffset',
      'getOpacity',
      'getPaintOpacity',
      'getPrivateMethods',
      'getRefElem',
      'getResolution',
      'getRootElem',
      'getRotationAngle',
      'getSelectedElems',
      'getStrokeOpacity',
      'getStrokeWidth',
      'getStrokedBBox',
      'getStyle',
      'getSvgString',
      'getText',
      'getTitle',
      'getTransformList',
      'getUIStrings',
      'getUrlFromAttr',
      'getVersion',
      'getVisibleElements',
      'getVisibleElementsAndBBoxes',
      'getZoom',
      'groupSelectedElements',
      'groupSvgElem',
      'hasMatrixTransform',
      'identifyLayers',
      'importSvgString',
      'leaveContext',
      'linkControlPoints',
      'makeHyperlink',
      'matrixMultiply',
      'mergeAllLayers',
      'mergeLayer',
      'moveSelectedElements',
      'moveSelectedToLayer',
      'moveToBottomSelectedElement',
      'moveToTopSelectedElement',
      'moveUpDownSelected',
      'open',
      'pasteElements',
      'prepareSvg',
      'pushGroupProperties',
      'randomizeIds',
      'rasterExport',
      'ready',
      'recalculateAllSelectedDimensions',
      'recalculateDimensions',
      'remapElement',
      'removeFromSelection',
      'removeHyperlink',
      'removeUnusedDefElems',
      'renameCurrentLayer',
      'round',
      'runExtensions',
      'sanitizeSvg',
      'save',
      'selectAllInCurrentLayer',
      'selectOnly',
      'setBBoxZoom',
      'setBackground',
      'setBlur',
      'setBlurNoUndo',
      'setBlurOffsets',
      'setBold',
      'setColor',
      'setConfig',
      'setContext',
      'setCurrentLayer',
      'setCurrentLayerPosition',
      'setDocumentTitle',
      'setFillPaint',
      'setFontColor',
      'setFontFamily',
      'setFontSize',
      'setGoodImage',
      'setGradient',
      'setGroupTitle',
      'setHref',
      'setIdPrefix',
      'setImageURL',
      'setItalic',
      'setLayerVisibility',
      'setLinkURL',
      'setMode',
      'setOpacity',
      'setPaint',
      'setPaintOpacity',
      'setRectRadius',
      'setResolution',
      'setRotationAngle',
      'setSegType',
      'setStrokeAttr',
      'setStrokePaint',
      'setStrokeWidth',
      'setSvgString',
      'setTextContent',
      'setUiStrings',
      'setUseData',
      'setZoom',
      'svgCanvasToString',
      'svgToString',
      'transformListToTransform',
      'ungroupSelectedElement',
      'uniquifyElems',
      'updateCanvas',
      'zoomChanged'
    ];

    // TODO: rewrite the following, it's pretty scary.
    for (const func of functions) {
      this[func] = getCallbackSetter(func);
    }

    // Older IE may need a polyfill for addEventListener, but so it would for SVG
    window.addEventListener('message', getMessageListener(this));
    window.addEventListener('keydown', (e) => {
      const {type, key} = e;
      if (key === 'Backspace') {
        e.preventDefault();
        const keyboardEvent = new KeyboardEvent(type, {key});
        that.frame.contentDocument.dispatchEvent(keyboardEvent);
      }
    });
  }

  /**
  * @param {string} name
  * @param {ArgumentsArray} args Signature dependent on function
  * @param {GenericCallback} callback (This may be better than a promise in case adding an event.)
  * @returns {Integer}
  */
  send (name, args, callback) { // eslint-disable-line promise/prefer-await-to-callbacks
    const that = this;
    cbid++;

    this.callbacks[cbid] = callback;
    setTimeout((function (callbackID) {
      return function () { // Delay for the callback to be set in case its synchronous
        /*
        * Todo: Handle non-JSON arguments and return values (undefined,
        *   nonfinite numbers, functions, and built-in objects like Date,
        *   RegExp), etc.? Allow promises instead of callbacks? Review
        *   SVG-Edit functions for whether JSON-able parameters can be
        *   made compatile with all API functionality
        */
        // We accept and post strings for the sake of IE9 support
        let sameOriginWithGlobal = false;
        try {
          sameOriginWithGlobal = window.location.origin === that.frame.contentWindow.location.origin &&
            that.frame.contentWindow.svgEditor.canvas;
        } catch (err) {}

        if (sameOriginWithGlobal) {
          // Although we do not really need this API if we are working same
          //  domain, it could allow us to write in a way that would work
          //  cross-domain as well, assuming we stick to the argument limitations
          //  of the current JSON-based communication API (e.g., not passing
          //  callbacks). We might be able to address these shortcomings; see
          //  the todo elsewhere in this file.
          const message = {id: callbackID},
            {svgEditor: {canvas: svgCanvas}} = that.frame.contentWindow;
          try {
            message.result = svgCanvas[name](...args);
          } catch (err) {
            message.error = err.message;
          }
          addCallback(that, message);
        } else { // Requires the ext-xdomain-messaging.js extension
          that.frame.contentWindow.postMessage(JSON.stringify({
            namespace: 'svgCanvas', id: callbackID, name, args
          }), '*');
        }
      };
    }(cbid)), 0);

    return cbid;
  }
}

export default EmbeddedSVGEdit;
