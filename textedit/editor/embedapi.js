/*
function embedded_svg_edit(frame){
  //initialize communication
  this.frame = frame;
  this.stack = []; //callback stack
  
  var editapi = this;
  
  window.addEventListener("message", function(e){
    if(e.data.substr(0,5) == "ERROR"){
      editapi.stack.splice(0,1)[0](e.data,"error")
    }else{
      editapi.stack.splice(0,1)[0](e.data)
    }
  }, false)
}

embedded_svg_edit.prototype.call = function(code, callback){
  this.stack.push(callback);
  this.frame.contentWindow.postMessage(code,"*");
}

embedded_svg_edit.prototype.getSvgString = function(callback){
  this.call("svgCanvas.getSvgString()",callback)
}

embedded_svg_edit.prototype.setSvgString = function(svg){
  this.call("svgCanvas.setSvgString('"+svg.replace(/'/g, "\\'")+"')");
}
*/


/*
Embedded SVG-edit API

General usage:
- Have an iframe somewhere pointing to a version of svg-edit > r1000
- Initialize the magic with:
var svgCanvas = new embedded_svg_edit(window.frames['svgedit']);
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

var blah = new embedded_svg_edit(window.frames['svgedit']);
blah.clearSelection("woot","blah",1337,[1,2,3,4,5,"moo"],-42,{a: "tree",b:6, c: 9})(function(){console.log("GET DATA",arguments)})
*/

function embedded_svg_edit(frame){
  //initialize communication
  this.frame = frame;
  //this.stack = [] //callback stack
  this.callbacks = {}; //successor to stack
  this.encode = embedded_svg_edit.encode;
  //List of functions extracted with this:
  //Run in firebug on http://svg-edit.googlecode.com/svn/trunk/docs/files/svgcanvas-js.html
  
  //for(var i=0,q=[],f = document.querySelectorAll("div.CFunction h3.CTitle a");i<f.length;i++){q.push(f[i].name)};q
  //var functions = ["clearSelection", "addToSelection", "removeFromSelection", "open", "save", "getSvgString", "setSvgString", "createLayer", "deleteCurrentLayer", "getNumLayers", "getLayer", "getCurrentLayer", "setCurrentLayer", "renameCurrentLayer", "setCurrentLayerPosition", "getLayerVisibility", "setLayerVisibility", "moveSelectedToLayer", "getLayerOpacity", "setLayerOpacity", "clear"];
  
  
  //Newer, well, it extracts things that aren't documented as well. All functions accessible through the normal thingy can now be accessed though the API
  //var l=[];for(var i in svgCanvas){if(typeof svgCanvas[i] == "function"){l.push(i)}};
  //run in svgedit itself
  var functions = ["updateElementFromJson", "embedImage", "fixOperaXML", "clearSelection", "addToSelection", "removeFromSelection", "addNodeToSelection", "open", "save", "getSvgString", "setSvgString", "createLayer", "deleteCurrentLayer", "getNumLayers", "getLayer", "getCurrentLayer", "setCurrentLayer", "renameCurrentLayer", "setCurrentLayerPosition", "getLayerVisibility", "setLayerVisibility", "moveSelectedToLayer", "getLayerOpacity", "setLayerOpacity", "clear", "clearPath", "getNodePoint", "clonePathNode", "deletePathNode", "getResolution", "getImageTitle", "setImageTitle", "setResolution", "setBBoxZoom", "setZoom", "getMode", "setMode", "getStrokeColor", "setStrokeColor", "getFillColor", "setFillColor", "setStrokePaint", "setFillPaint", "getStrokeWidth", "setStrokeWidth", "getStrokeStyle", "setStrokeStyle", "getOpacity", "setOpacity", "getFillOpacity", "setFillOpacity", "getStrokeOpacity", "setStrokeOpacity", "getTransformList", "getBBox", "getRotationAngle", "setRotationAngle", "each", "bind", "setIdPrefix", "getBold", "setBold", "getItalic", "setItalic", "getFontFamily", "setFontFamily", "getFontSize", "setFontSize", "getText", "setTextContent", "setImageURL", "setRectRadius", "setSegType", "quickClone", "changeSelectedAttributeNoUndo", "changeSelectedAttribute", "deleteSelectedElements", "groupSelectedElements", "ungroupSelectedElement", "moveToTopSelectedElement", "moveToBottomSelectedElement", "moveSelectedElements", "getStrokedBBox", "getVisibleElements", "cycleElement", "getUndoStackSize", "getRedoStackSize", "getNextUndoCommandText", "getNextRedoCommandText", "undo", "redo", "cloneSelectedElements", "alignSelectedElements", "getZoom", "getVersion", "setIconSize", "setLang", "setCustomHandlers"]
  
  //TODO: rewrite the following, it's pretty scary.
  for(var i = 0; i < functions.length; i++){
    this[functions[i]] = (function(d){
      return function(){
        var t = this //new callback
        for(var g = 0, args = []; g < arguments.length; g++){
          args.push(arguments[g]);
        }
        var cbid = t.send(d,args, function(){})  //the callback (currently it's nothing, but will be set later
        
        return function(newcallback){
          t.callbacks[cbid] = newcallback; //set callback
        }
      }
    })(functions[i])
  }
  //TODO: use AddEvent for Trident browsers, currently they dont support SVG, but they do support onmessage
  var t = this;
  window.addEventListener("message", function(e){
    if(e.data.substr(0,4)=="SVGe"){ //because svg-edit is too longish
      var data = e.data.substr(4);
      var cbid = data.substr(0, data.indexOf(";"));
      if(t.callbacks[cbid]){
        if(data.substr(0,6) != "error:"){
          t.callbacks[cbid](eval("("+data.substr(cbid.length+1)+")"))
        }else{
          t.callbacks[cbid](data, "error");
        }
      }
    }
    //this.stack.shift()[0](e.data,e.data.substr(0,5) == "ERROR"?'error':null) //replace with shift
  }, false)
}

embedded_svg_edit.encode = function(obj){
  //simple partial JSON encoder implementation
  if(window.JSON && JSON.stringify) return JSON.stringify(obj);
  var enc = arguments.callee; //for purposes of recursion
  
  if(typeof obj == "boolean" || typeof obj == "number"){
      return obj+'' //should work...
  }else if(typeof obj == "string"){
    //a large portion of this is stolen from Douglas Crockford's json2.js
    return '"'+
          obj.replace(
            /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
          , function (a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          })
          +'"'; //note that this isn't quite as purtyful as the usualness
  }else if(obj.length){ //simple hackish test for arrayish-ness
    for(var i = 0; i < obj.length; i++){
      obj[i] = enc(obj[i]); //encode every sub-thingy on top
    }
    return "["+obj.join(",")+"]";
  }else{
    var pairs = []; //pairs will be stored here
    for(var k in obj){ //loop through thingys
      pairs.push(enc(k)+":"+enc(obj[k])); //key: value
    }
    return "{"+pairs.join(",")+"}" //wrap in the braces
  }
}

embedded_svg_edit.prototype.send = function(name, args, callback){
  var cbid = Math.floor(Math.random()*31776352877+993577).toString();
  //this.stack.push(callback);
  this.callbacks[cbid] = callback;
  for(var argstr = [], i = 0; i < args.length; i++){
    argstr.push(this.encode(args[i]))
  }
  var t = this;
  setTimeout(function(){//delay for the callback to be set in case its synchronous
    t.frame.contentWindow.postMessage(cbid+";svgCanvas['"+name+"']("+argstr.join(",")+")","*");
  }, 0);
  return cbid;
  //this.stack.shift()("svgCanvas['"+name+"']("+argstr.join(",")+")")
}



