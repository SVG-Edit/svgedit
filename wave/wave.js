var shapetime = {};

function stateUpdated() {
  // 'state' is an object of key-value pairs that map ids to JSON serialization of SVG elements
  // 'keys' is an array of all the keys in the state
  var state = wave.getState();
  var keys = state.getKeys();
  svgCanvas.each(function(e) {
    // 'this' is the SVG DOM element node (ellipse, rect, etc)
    // 'e' is an integer describing the position within the document
    var k = this.id;
    var v = state.get(k);
    if (v) {
      var ob = JSON.parse(v);
      if (ob) {
        // do nothing
      } else {
        //var node = document.getElementById(k);
        //if (node) node.parentNode.removeChild(node);
      }
      //keys.remove(k);
      
    } else if(this.id != "selectorParentGroup"){
      //console.log(this)
      this.parentNode.removeChild(this);
    }
  });

  // New nodes
  for (var k in keys) {
    var v = state.get(keys[k]);
    var ob = JSON.parse(v);
    if (ob){
      if(!shapetime[k] || ob.time > shapetime[k]){
        var a;
        if(a = document.getElementById(k)){
          var attrs = {};
          for(var i = a.length; i--;){
            attrs[a.item(i).nodeName] = a.item(i).nodeValue;
          }
          if(JSON.stringify(attrs) != JSON.stringify(ob.attr)){
            shapetime[k] = ob.time
            svgCanvas.updateElementFromJson(ob)
          }
        }else{
          shapetime[k] = ob.time
          svgCanvas.updateElementFromJson(ob)
        }

      }
    }
  }
}


function getId(canvas, objnum) {
  return "svg_"+wave.getViewer().getId()+"_"+objnum;
}

function main() {
  $(document).ready(function(){
    if (wave && wave.isInWaveContainer()) {
      wave.setStateCallback(stateUpdated);
    }
    
    var oldchanged = svgCanvas.bind("changed", function(canvas, elem){
      if(oldchanged)oldchanged.apply(this, [canvas,elem]);
      
      var delta = {}
      $.each(elem, function(){
        
        var attrs = {};
        var a = this.attributes;
        if(a){
          for(var i = a.length; i--;){
            attrs[a.item(i).nodeName] = a.item(i).nodeValue;
          }
          var ob = {element: this.nodeName, attr: attrs};
          
          ob.time = shapetime[this.id] = (new Date).getTime()
          delta[this.id] = JSON.stringify(ob);
        }
      })
      wave.getState().submitDelta(delta)
      //sendDelta(canvas, elem)
    });
    var oldselected = svgCanvas.bind("selected", function(canvas, elem){
      
      if(oldselected)oldselected.apply(this, [canvas,elem]);
      
      
      var delta = {}
      var deletions = 0;
      $.each(elem, function(){
        if(!this.parentNode){
          delta[this.id] = null;
        
          deletions ++
        }
      });
      if(deletions > 0){
        wave.getState().submitDelta(delta)
      }
    });
    svgCanvas.bind("cleared", function(){
      //alert("cleared")
        var state = {}, keys = wave.getState().getKeys()
        for(var i = 0; i < keys.length; i++){
          state[keys[i]] = null;
        }
        wave.getState().submitDelta(state)
    });
    svgCanvas.bind("getid", getId);
  })
}

gadgets.util.registerOnLoadHandler(main);
