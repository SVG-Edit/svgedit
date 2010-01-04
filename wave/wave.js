var shapetime = {};
var nodelete = false;

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
      
    } else if(this.id != "selectorParentGroup" && !nodelete){
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
  var id = wave.getViewer().getId().split("@")[0];
  var extra = SHA256(wave.getViewer().getId()); //in case the next step kills all the characters
  for(var i = 0, l = id.length, n = ""; i < l; i++){
    if("abcdefghijklmnopqrstuvwxyz0123456789".indexOf(id[i]) != -1){
      n+=i;
    }
  }
  return "svg_"+n+"_"+extra.substr(0,5)+"_"+objnum;
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


//and why not use my stuff?
function SHA256(b){function h(j,k){return(j>>e)+(k>>e)+((p=(j&o)+(k&o))>>e)<<e|p&o}function f(j,k){return j>>>k|j<<32-k}var g=[],d,c=3,l=[2],p,i,q,a,m=[],n=[];i=b.length*8;for(var e=16,o=65535,r="";c<312;c++){for(d=l.length;d--&&c%l[d]!=0;);d<0&&l.push(c)}b+="\u0080";for(c=0;c<=i;c+=8)n[c>>5]|=(b.charCodeAt(c/8)&255)<<24-c%32;n[(i+64>>9<<4)+15]=i;for(c=8;c--;)m[c]=parseInt(Math.pow(l[c],0.5).toString(e).substr(2,8),e);for(c=0;c<n.length;c+=e){a=m.slice(0);for(b=0;b<64;b++){g[b]=b<e?n[b+c]:h(h(h(f(g[b-2],17)^f(g[b-2],19)^g[b-2]>>>10,g[b-7]),f(g[b-15],7)^f(g[b-15],18)^g[b-15]>>>3),g[b-e]);i=h(h(h(h(a[7],f(a[4],6)^f(a[4],11)^f(a[4],25)),a[4]&a[5]^~a[4]&a[6]),parseInt(Math.pow(l[b],1/3).toString(e).substr(2,8),e)),g[b]);q=(f(a[0],2)^f(a[0],13)^f(a[0],22))+(a[0]&a[1]^a[0]&a[2]^a[1]&a[2]);for(d=8;--d;)a[d]=d==4?h(a[3],i):a[d-1];a[0]=h(i,q)}for(d=8;d--;)m[d]+=a[d]}for(c=0;c<8;c++)for(b=8;b--;)r+=(m[c]>>>b*4&15).toString(e);return r}

