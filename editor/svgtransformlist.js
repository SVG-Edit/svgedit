/**
 * SVGTransformList
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

// Dependencies:
// 1) browsersupport.js

(function() {

if (!window.svgedit) {
	window.svgedit = {};
}
if (!svgedit.transformlist) {
	svgedit.transformlist = {};
}

var svgroot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

// Helper function.
function transformToString(xform) {
	var m = xform.matrix,
		text = "";
	switch(xform.type) {
		case 1: // MATRIX
			text = "matrix(" + [m.a,m.b,m.c,m.d,m.e,m.f].join(",") + ")";
			break;
		case 2: // TRANSLATE
			text = "translate(" + m.e + "," + m.f + ")";
			break;
		case 3: // SCALE
			if (m.a == m.d) text = "scale(" + m.a + ")";
			else text = "scale(" + m.a + "," + m.d + ")";
			break;
		case 4: // ROTATE
			var cx = 0, cy = 0;
			// this prevents divide by zero
			if (xform.angle != 0) {
				var K = 1 - m.a;
				cy = ( K * m.f + m.b*m.e ) / ( K*K + m.b*m.b );
				cx = ( m.e - m.b * cy ) / K;
			}
			text = "rotate(" + xform.angle + " " + cx + "," + cy + ")";
			break;
	}
	return text;
};


/**
 * Map of SVGTransformList objects.
 */
var listMap_ = {};


// **************************************************************************************
// SVGTransformList implementation for Webkit 
// These methods do not currently raise any exceptions.
// These methods also do not check that transforms are being inserted.  This is basically
// implementing as much of SVGTransformList that we need to get the job done.
//
//  interface SVGEditTransformList { 
//		attribute unsigned long numberOfItems;
//		void   clear (  )
//		SVGTransform initialize ( in SVGTransform newItem )
//		SVGTransform getItem ( in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//		SVGTransform insertItemBefore ( in SVGTransform newItem, in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//		SVGTransform replaceItem ( in SVGTransform newItem, in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//		SVGTransform removeItem ( in unsigned long index ) (DOES NOT THROW DOMException, INDEX_SIZE_ERR)
//		SVGTransform appendItem ( in SVGTransform newItem )
//		NOT IMPLEMENTED: SVGTransform createSVGTransformFromMatrix ( in SVGMatrix matrix );
//		NOT IMPLEMENTED: SVGTransform consolidate (  );
//	}
// **************************************************************************************
svgedit.transformlist.SVGTransformList = function(elem) {
	this._elem = elem || null;
	this._xforms = [];
	// TODO: how do we capture the undo-ability in the changed transform list?
	this._update = function() {
		var tstr = "";
		var concatMatrix = svgroot.createSVGMatrix();
		for (var i = 0; i < this.numberOfItems; ++i) {
			var xform = this._list.getItem(i);
			tstr += transformToString(xform) + " ";
		}
		this._elem.setAttribute("transform", tstr);
	};
	this._list = this;
	this._init = function() {
		// Transform attribute parser
		var str = this._elem.getAttribute("transform");
		if(!str) return;
		
		// TODO: Add skew support in future
		var re = /\s*((scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/;
		var arr = [];
		var m = true;
		while(m) {
			m = str.match(re);
			str = str.replace(re,'');
			if(m && m[1]) {
				var x = m[1];
				var bits = x.split(/\s*\(/);
				var name = bits[0];
				var val_bits = bits[1].match(/\s*(.*?)\s*\)/);
				val_bits[1] = val_bits[1].replace(/(\d)-/g, "$1 -");
				var val_arr = val_bits[1].split(/[, ]+/);
				var letters = 'abcdef'.split('');
				var mtx = svgroot.createSVGMatrix();
				$.each(val_arr, function(i, item) {
					val_arr[i] = parseFloat(item);
					if(name == 'matrix') {
						mtx[letters[i]] = val_arr[i];
					}
				});
				var xform = svgroot.createSVGTransform();
				var fname = 'set' + name.charAt(0).toUpperCase() + name.slice(1);
				var values = name=='matrix'?[mtx]:val_arr;
				
				if (name == 'scale' && values.length == 1) {
					values.push(values[0]);
				} else if (name == 'translate' && values.length == 1) {
					values.push(0);
				} else if (name == 'rotate' && values.length == 1) {
					values.push(0);
					values.push(0);
				}
				xform[fname].apply(xform, values);
				this._list.appendItem(xform);
			}
		}
	};
	this._removeFromOtherLists = function(item) {
		// Check if this transform is already in a transformlist, and
		// remove it if so.
		var found = false;
		for (var id in listMap_) {
			var tl = listMap_[id];
			for (var i = 0, len = tl._xforms.length; i < len; ++i) {
				if(tl._xforms[i] == item) {
					found = true;
					tl.removeItem(i);
					break;
				}
			}
			if (found) {
				break;
			}
		}
	};
	
	this.numberOfItems = 0;
	this.clear = function() { 
		this.numberOfItems = 0;
		this._xforms = [];
	};
	
	this.initialize = function(newItem) {
		this.numberOfItems = 1;
		this._removeFromOtherLists(newItem);
		this._xforms = [newItem];
	};
	
	this.getItem = function(index) {
		if (index < this.numberOfItems && index >= 0) {
			return this._xforms[index];
		}
		return null;
	};
	
	this.insertItemBefore = function(newItem, index) {
		var retValue = null;
		if (index >= 0) {
			if (index < this.numberOfItems) {
				this._removeFromOtherLists(newItem);
				var newxforms = new Array(this.numberOfItems + 1);
				// TODO: use array copying and slicing
				for ( var i = 0; i < index; ++i) {
					newxforms[i] = this._xforms[i];
				}
				newxforms[i] = newItem;
				for ( var j = i+1; i < this.numberOfItems; ++j, ++i) {
					newxforms[j] = this._xforms[i];
				}
				this.numberOfItems++;
				this._xforms = newxforms;
				retValue = newItem;
				this._list._update();
			}
			else {
				retValue = this._list.appendItem(newItem);
			}
		}
		return retValue;
	};
	
	this.replaceItem = function(newItem, index) {
		var retValue = null;
		if (index < this.numberOfItems && index >= 0) {
			this._removeFromOtherLists(newItem);
			this._xforms[index] = newItem;
			retValue = newItem;
			this._list._update();
		}
		return retValue;
	};
	
	this.removeItem = function(index) {
		var retValue = null;
		if (index < this.numberOfItems && index >= 0) {
			var retValue = this._xforms[index];
			var newxforms = new Array(this.numberOfItems - 1);
			for (var i = 0; i < index; ++i) {
				newxforms[i] = this._xforms[i];
			}
			for (var j = i; j < this.numberOfItems-1; ++j, ++i) {
				newxforms[j] = this._xforms[i+1];
			}
			this.numberOfItems--;
			this._xforms = newxforms;
			this._list._update();
		}
		return retValue;
	};
	
	this.appendItem = function(newItem) {
		this._removeFromOtherLists(newItem);
		this._xforms.push(newItem);
		this.numberOfItems++;
		this._list._update();
		return newItem;
	};
};


svgedit.transformlist.resetListMap = function() {
	listMap_ = {};
};

/**
 * Removes transforms of the given element from the map.
 * Parameters:
 * elem - a DOM Element
 */
svgedit.transformlist.removeElementFromListMap = function(elem) {
	if (elem.id && listMap_[elem.id]) {
		delete listMap_[elem.id];
	}
};

// Function: getTransformList
// Returns an object that behaves like a SVGTransformList for the given DOM element
//
// Parameters:
// elem - DOM element to get a transformlist from
svgedit.transformlist.getTransformList = function(elem) {
	if (svgedit.browsersupport.isWebkit()) {
		var id = elem.id;
		if(!id) {
			// Get unique ID for temporary element
			id = 'temp';
		}
		var t = listMap_[id];
		if (!t || id == 'temp') {
			listMap_[id] = new svgedit.transformlist.SVGTransformList(elem);
			listMap_[id]._init();
			t = listMap_[id];
		}
		return t;
	}
	else if (elem.transform) {
		return elem.transform.baseVal;
	}
	else if (elem.gradientTransform) {
		return elem.gradientTransform.baseVal;
	}
	else if (elem.patternTransform) {
		return elem.patternTransform.baseVal;
	}

	return null;
};


})();