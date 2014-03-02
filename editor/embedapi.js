/*
Embedded SVG-edit API

General usage:
- Have an iframe somewhere pointing to a version of svg-edit > r1000
- Initialize the magic with:
var svgCanvas = new EmbeddedSVGEdit(window.frames.svgedit);
- Pass functions in this format:
svgCanvas.setSvgString('string')
- Or if a callback is needed:
svgCanvas.setSvgString('string')(function(data, error){
  if (error){
    // There was an error
  } else{
    // Handle data
  }
})

Everything is done with the same API as the real svg-edit,
and all documentation is unchanged.

However, this file depends on the postMessage API which
can only support JSON-serializable arguments and
return values, so, for example, arguments whose value is
'undefined', a function, a non-finite number, or a built-in
object like Date(), RegExp(), etc. will most likely not behave
as expected. In such a case one may need to host
the SVG editor on the same domain and reference the
JavaScript methods on the frame itself.

The only other difference is
when handling returns: the callback notation is used instead.

var blah = new EmbeddedSVGEdit(window.frames.svgedit);
blah.clearSelection('woot', 'blah', 1337, [1, 2, 3, 4, 5, 'moo'], -42, {a: 'tree',b:6, c: 9})(function(){console.log('GET DATA',arguments)})
*/

(function () {'use strict';

var cbid = 0;

function getCallbackSetter (d) {
  return function () {
    var t = this, // New callback
      args = [].slice.call(arguments),
      cbid = t.send(d, args, function(){});  // The callback (currently it's nothing, but will be set later)

    return function(newcallback){
      t.callbacks[cbid] = newcallback; // Set callback
    };
  };
}

/*
* Having this separate from messageListener allows us to
* avoid using JSON parsing (and its limitations) in the case
* of same domain control
*/
function addCallback (t, data) {
  var result = data.result || data.error;
  cbid = data.id;
  if (t.callbacks[cbid]) {
    if (data.result) {
      t.callbacks[cbid](result);
    } else {
      t.callbacks[cbid](result, 'error');
    }
  }
}

function messageListener (e) {
  // We accept and post strings as opposed to objects for the sake of IE9 support; this
  //   will most likely be changed in the future
  if (typeof e.data !== 'string') {
    return;
  }
  var allowedOrigins = this.allowedOrigins,
    data = e.data && JSON.parse(e.data);
  if (!data || typeof data !== 'object' || data.namespace !== 'svg-edit' ||
      e.source !== this.frame.contentWindow ||
      (allowedOrigins.indexOf('*') === -1 && allowedOrigins.indexOf(e.origin) === -1)
  ) {
    return;
  }
  addCallback(this, data);
}

function getMessageListener (t) {
	return function (e) {
		messageListener.call(t, e);
	};
}

/**
* @param {HTMLIFrameElement} frame
* @param {array} [allowedOrigins=[]] Array of origins from which incoming
*     messages will be allowed when same origin is not used; defaults to none.
*     If supplied, it should probably be the same as svgEditor's allowedOrigins
*/
function EmbeddedSVGEdit (frame, allowedOrigins) {
  if (!(this instanceof EmbeddedSVGEdit)) { // Allow invocation without 'new' keyword
    return new EmbeddedSVGEdit(frame);
  }
  this.allowedOrigins = allowedOrigins || [];
  // Initialize communication
  this.frame = frame;
  this.callbacks = {};
  // List of functions extracted with this:
  // Run in firebug on http://svg-edit.googlecode.com/svn/trunk/docs/files/svgcanvas-js.html

  // for (var i=0,q=[],f = document.querySelectorAll('div.CFunction h3.CTitle a'); i < f.length; i++) { q.push(f[i].name); }; q
  // var functions = ['clearSelection', 'addToSelection', 'removeFromSelection', 'open', 'save', 'getSvgString', 'setSvgString',
  // 'createLayer', 'deleteCurrentLayer', 'setCurrentLayer', 'renameCurrentLayer', 'setCurrentLayerPosition', 'setLayerVisibility',
  // 'moveSelectedToLayer', 'clear'];

  // Newer, well, it extracts things that aren't documented as well. All functions accessible through the normal thingy can now be accessed though the API
  // var l = []; for (var i in svgCanvas){ if (typeof svgCanvas[i] == 'function') { l.push(i);} };
  // Run in svgedit itself
  var i,
    functions = ['updateElementFromJson', 'embedImage', 'fixOperaXML', 'clearSelection',
      'addToSelection',
      'removeFromSelection', 'addNodeToSelection', 'open', 'save', 'getSvgString', 'setSvgString', 'createLayer',
      'deleteCurrentLayer', 'getCurrentDrawing', 'setCurrentLayer', 'renameCurrentLayer', 'setCurrentLayerPosition',
      'setLayerVisibility', 'moveSelectedToLayer', 'clear', 'clearPath', 'getNodePoint', 'clonePathNode', 'deletePathNode',
      'getResolution', 'getImageTitle', 'setImageTitle', 'setResolution', 'setBBoxZoom', 'setZoom', 'getMode', 'setMode',
      'getStrokeColor', 'setStrokeColor', 'getFillColor', 'setFillColor', 'setStrokePaint', 'setFillPaint', 'getStrokeWidth',
      'setStrokeWidth', 'getStrokeStyle', 'setStrokeStyle', 'getOpacity', 'setOpacity', 'getFillOpacity', 'setFillOpacity',
      'getStrokeOpacity', 'setStrokeOpacity', 'getTransformList', 'getBBox', 'getRotationAngle', 'setRotationAngle', 'each',
      'bind', 'setIdPrefix', 'getBold', 'setBold', 'getItalic', 'setItalic', 'getFontFamily', 'setFontFamily', 'getFontSize',
      'setFontSize', 'getText', 'setTextContent', 'setImageURL', 'setRectRadius', 'setSegType', 'quickClone',
      'changeSelectedAttributeNoUndo', 'changeSelectedAttribute', 'deleteSelectedElements', 'groupSelectedElements', 'zoomChanged',
      'ungroupSelectedElement', 'moveToTopSelectedElement', 'moveToBottomSelectedElement', 'moveSelectedElements',
      'getStrokedBBox', 'getVisibleElements', 'cycleElement', 'getUndoStackSize', 'getRedoStackSize', 'getNextUndoCommandText',
      'getNextRedoCommandText', 'undo', 'redo', 'cloneSelectedElements', 'alignSelectedElements', 'getZoom', 'getVersion',
      'setIconSize', 'setLang', 'setCustomHandlers'];

  // TODO: rewrite the following, it's pretty scary.
  for (i = 0; i < functions.length; i++) {
    this[functions[i]] = getCallbackSetter(functions[i]);
  }
 
  // Older IE may need a polyfill for addEventListener, but so it would for SVG
  window.addEventListener('message', getMessageListener(this), false);
}

EmbeddedSVGEdit.prototype.send = function (name, args, callback){
  var t = this;
  cbid++;

  this.callbacks[cbid] = callback;
  setTimeout(function () { // Delay for the callback to be set in case its synchronous
    /*
    * Todo: Handle non-JSON arguments and return values (undefined,
    *   nonfinite numbers, functions, and built-in objects like Date,
    *   RegExp), etc.? Allow promises instead of callbacks? Review
    *   SVG-Edit functions for whether JSON-able parameters can be
    *   made compatile with all API functionality
    */
    // We accept and post strings for the sake of IE9 support
    if (window.location.origin === t.frame.contentWindow.location.origin) {
      // Although we do not really need this API if we are working same
      //  domain, it could allow us to write in a way that would work
      //  cross-domain as well, assuming we stick to the argument limitations
      //  of the current JSON-based communication API (e.g., not passing
      //  callbacks). We might be able to address these shortcomings; see
      //  the todo elsewhere in this file.
      var message = {id: cbid},
        svgCanvas = t.frame.contentWindow.svgCanvas;
      try {
        message.result = svgCanvas[name].apply(svgCanvas, args);
      }
      catch (err) {
        message.error = err.message;
      }
      addCallback(t, message);
    }
    else { // Requires the ext-xdomain-messaging.js extension
      t.frame.contentWindow.postMessage(JSON.stringify({namespace: 'svgCanvas', id: cbid, name: name, args: args}), '*');
    }
  }, 0);
  return cbid;
};

window.embedded_svg_edit = EmbeddedSVGEdit; // Export old, deprecated API
window.EmbeddedSVGEdit = EmbeddedSVGEdit; // Follows common JS convention of CamelCase and, as enforced in JSLint, of initial caps for constructors

}());
