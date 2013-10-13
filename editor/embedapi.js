/*
Embedded SVG-edit API

General usage:
- Have an iframe somewhere pointing to a version of svg-edit > r1000
- Initialize the magic with:
var svgCanvas = new EmbeddedSVGEdit(window.frames['svgedit']);
- Pass functions in this format:
svgCanvas.setSvgString("string")
- Or if a callback is needed:
svgCanvas.setSvgString("string")(function(data, error){
  if(error){
    //there was an error
  }else{
    //handle data
  }
})

Everything is done with the same API as the real svg-edit,
and all documentation is unchanged. The only difference is
when handling returns, the callback notation is used instead.

var blah = new EmbeddedSVGEdit(window.frames['svgedit']);
blah.clearSelection("woot","blah",1337,[1,2,3,4,5,"moo"],-42,{a: "tree",b:6, c: 9})(function(){console.log("GET DATA",arguments)})
*/

(function () {'use strict';

var cbid = 0;

function getCallbackSetter (d) {
  return function(){
    var t = this, // new callback
      args = [].slice.call(arguments),
      cbid = t.send(d, args, function(){});  // the callback (currently it's nothing, but will be set later)

    return function(newcallback){
      t.callbacks[cbid] = newcallback; // set callback
    };
  };
}

function EmbeddedSVGEdit(frame){
  if (!(this instanceof EmbeddedSVGEdit)) { // Allow invocation without "new" keyword
    return new EmbeddedSVGEdit(frame);
  }
  // initialize communication
  this.frame = frame;
  this.callbacks = {}; // successor to stack
  //List of functions extracted with this:
  //Run in firebug on http://svg-edit.googlecode.com/svn/trunk/docs/files/svgcanvas-js.html

  //for(var i=0,q=[],f = document.querySelectorAll("div.CFunction h3.CTitle a");i<f.length;i++){q.push(f[i].name)};q
  //var functions = ["clearSelection", "addToSelection", "removeFromSelection", "open", "save", "getSvgString", "setSvgString",
  //"createLayer", "deleteCurrentLayer", "setCurrentLayer", "renameCurrentLayer", "setCurrentLayerPosition", "setLayerVisibility",
  //"moveSelectedToLayer", "clear"];

  //Newer, well, it extracts things that aren't documented as well. All functions accessible through the normal thingy can now be accessed though the API
  //var l=[];for(var i in svgCanvas){if(typeof svgCanvas[i] == "function"){l.push(i)}};
  //run in svgedit itself
  var i,
    t = this,
    functions = ["updateElementFromJson", "embedImage", "fixOperaXML", "clearSelection", "addToSelection",
		"removeFromSelection", "addNodeToSelection", "open", "save", "getSvgString", "setSvgString", "createLayer",
		"deleteCurrentLayer", "getCurrentDrawing", "setCurrentLayer", "renameCurrentLayer", "setCurrentLayerPosition",
		"setLayerVisibility", "moveSelectedToLayer", "clear", "clearPath", "getNodePoint", "clonePathNode", "deletePathNode",
		"getResolution", "getImageTitle", "setImageTitle", "setResolution", "setBBoxZoom", "setZoom", "getMode", "setMode",
		"getStrokeColor", "setStrokeColor", "getFillColor", "setFillColor", "setStrokePaint", "setFillPaint", "getStrokeWidth",
		"setStrokeWidth", "getStrokeStyle", "setStrokeStyle", "getOpacity", "setOpacity", "getFillOpacity", "setFillOpacity",
		"getStrokeOpacity", "setStrokeOpacity", "getTransformList", "getBBox", "getRotationAngle", "setRotationAngle", "each",
		"bind", "setIdPrefix", "getBold", "setBold", "getItalic", "setItalic", "getFontFamily", "setFontFamily", "getFontSize",
		"setFontSize", "getText", "setTextContent", "setImageURL", "setRectRadius", "setSegType", "quickClone",
		"changeSelectedAttributeNoUndo", "changeSelectedAttribute", "deleteSelectedElements", "groupSelectedElements", "zoomChanged",
		"ungroupSelectedElement", "moveToTopSelectedElement", "moveToBottomSelectedElement", "moveSelectedElements",
		"getStrokedBBox", "getVisibleElements", "cycleElement", "getUndoStackSize", "getRedoStackSize", "getNextUndoCommandText",
		"getNextRedoCommandText", "undo", "redo", "cloneSelectedElements", "alignSelectedElements", "getZoom", "getVersion",
		"setIconSize", "setLang", "setCustomHandlers"];

  // TODO: rewrite the following, it's pretty scary.
  for(i = 0; i < functions.length; i++){
    this[functions[i]] = getCallbackSetter(functions[i]);
  }

  // Older IE may need a polyfill for addEventListener, but so it would for SVG
  window.addEventListener("message", function(e){
    if (!e.data || typeof e.data !== "object" || e.data.namespace !== "svg-edit") {
      return;
    }
    var data = e.data.result || e.data.error,
      cbid = e.data.id;
    if(t.callbacks[cbid]){
      if(e.data.result){
       t.callbacks[cbid](data);
      }else{
        t.callbacks[cbid](data, "error");
      }
    }
  }, false);
}

EmbeddedSVGEdit.prototype.send = function(name, args, callback){
  var t = this;
  cbid++;

  this.callbacks[cbid] = callback;
  setTimeout(function(){ // delay for the callback to be set in case its synchronous
    // Todo: Handle non-JSON arguments and return values (undefined, nonfinite numbers, functions, and built-in objects like Date, RegExp), etc.?
    t.frame.contentWindow.postMessage({namespace: "svgCanvas", id: cbid, name: name, args: args}, '*');
  }, 0);
  return cbid;
};

window.embedded_svg_edit = EmbeddedSVGEdit; // Export old, deprecated API
window.EmbeddedSVGEdit = EmbeddedSVGEdit; // Follows common JS convention of CamelCase and, as enforced in JSLint, of initial caps for constructors

}());
