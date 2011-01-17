/**
 * Package: svgedit.draw
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2011 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) svgutils.js

(function() {
if (!window.svgedit) {
	window.svgedit = {};
}

if (!svgedit.draw) {
	svgedit.draw = {};
}

var svg_ns = "http://www.w3.org/2000/svg";
var se_ns = "http://svg-edit.googlecode.com";

/**
 * This class encapsulates the concept of a layer in the drawing
 * @param name {String} Layer name
 * @param child {SVGGElement} Layer SVG group.
 */
svgedit.draw.Layer = function(name, group) {
	this.name_ = name;
	this.group_ = group;
};

svgedit.draw.Layer.prototype.getName = function() {
	return this.name_;
};

svgedit.draw.Layer.prototype.getGroup = function() {
	return this.group_;
};


/**
 * This class encapsulates the concept of a SVG-edit drawing
 *
 * @param svgElem {SVGSVGElement} The SVG DOM Element that this JS object
 *     encapsulates.  If the svgElem has a se:nonce attribute on it, then
 *     IDs will use the nonce as they are generated.
 * @param opt_idPrefix {String} The ID prefix to use.  Defaults to "svg_"
 *     if not specified.
 */
svgedit.draw.Drawing = function(svgElem, opt_idPrefix) {
	if (!svgElem || !svgElem.tagName || !svgElem.namespaceURI ||
		svgElem.tagName != 'svg' || svgElem.namespaceURI != svg_ns) {
		throw "Error: svgedit.draw.Drawing instance initialized without a <svg> element";
	}

	this.svgElem_ = svgElem;
	this.obj_num = 0;
	this.idPrefix = opt_idPrefix || "svg_";
	this.releasedNums = [];

	// z-ordered array of tuples containing layer names and <g> elements
	// the first layer is the one at the bottom of the rendering
	this.all_layers = [];

	// Determine if the <svg> element has a nonce on it
	this.nonce_ = this.svgElem_.getAttributeNS(se_ns, 'nonce') || "";
};

svgedit.draw.Drawing.prototype.getElem_ = function(id) {
	if(this.svgElem_.querySelector) {
		// querySelector lookup
		return this.svgElem_.querySelector('#'+id);
	} else {
		// jQuery lookup: twice as slow as xpath in FF
		return $(this.svgElem_).find('[id=' + id + ']')[0];
	}
};

svgedit.draw.Drawing.prototype.getSvgElem = function() {
	return this.svgElem_;
}

svgedit.draw.Drawing.prototype.getNonce = function() {
	return this.nonce_;
};

/**
 * Returns the latest object id as a string.
 * @return {String} The latest object Id.
 */
svgedit.draw.Drawing.prototype.getId = function() {
	return this.nonce_ ?
		this.idPrefix + this.nonce_ +'_' + this.obj_num :
 		this.idPrefix + this.obj_num;
};

/**
 * Returns the next object Id as a string.
 * @return {String} The next object Id to use.
 */
svgedit.draw.Drawing.prototype.getNextId = function() {
	var oldObjNum = this.obj_num;
	var restoreOldObjNum = false;

	// If there are any released numbers in the release stack, 
	// use the last one instead of the next obj_num.
	// We need to temporarily use obj_num as that is what getId() depends on.
	if (this.releasedNums.length > 0) {
		this.obj_num = this.releasedNums.pop();
		restoreOldObjNum = true;
	} else {
		// If we are not using a released id, then increment the obj_num.
		this.obj_num++;
	}

	// Ensure the ID does not exist.
	var id = this.getId();
	while (this.getElem_(id)) {
		if (restoreOldObjNum) {
			this.obj_num = oldObjNum;
			restoreOldObjNum = false;
		}
		this.obj_num++;
		id = this.getId();
	}
	// Restore the old object number if required.
	if (restoreOldObjNum) {
		this.obj_num = oldObjNum;
	}
	return id;
};

// Function: svgedit.draw.Drawing.releaseId
// Releases the object Id, letting it be used as the next id in getNextId().
// This method DOES NOT remove any elements from the DOM, it is expected
// that client code will do this.
//
// Parameters:
// id - The id to release.
//
// Returns:
// True if the id was valid to be released, false otherwise.
svgedit.draw.Drawing.prototype.releaseId = function(id) {
	// confirm if this is a valid id for this Document, else return false
	var front = this.idPrefix + (this.nonce_ ? this.nonce_ +'_' : '');
	if (typeof id != typeof '' || id.indexOf(front) != 0) {
		return false;
	}
	// extract the obj_num of this id
	var num = parseInt(id.substr(front.length));

	// if we didn't get a positive number or we already released this number
	// then return false.
	if (typeof num != typeof 1 || num <= 0 || this.releasedNums.indexOf(num) != -1) {
		return false;
	}
	
	// push the released number into the released queue
	this.releasedNums.push(num);

	return true;
};

// Function: svgedit.draw.Drawing.getNumLayers
// Returns the number of layers in the current drawing.
// 
// Returns:
// The number of layers in the current drawing.
svgedit.draw.Drawing.prototype.getNumLayers = function() {
	return this.all_layers.length;
};

// Function: svgedit.draw.Drawing.hasLayer
// Check if layer with given name already exists
svgedit.draw.Drawing.prototype.hasLayer = function(name) {
	for(var i = 0; i < this.getNumLayers(); i++) {
		if(this.all_layers[i][0] == name) return true;
	}
	return false;
};

// Function: svgedit.draw.Drawing.identifyLayers
// Updates layer system
svgedit.draw.Drawing.prototype.identifyLayers = function() {
	this.all_layers = [];
	var numchildren = this.svgElem_.childNodes.length;
	// loop through all children of SVG element
	var orphans = [], layernames = [];
	var current_layer = null;
	var childgroups = false;
	for (var i = 0; i < numchildren; ++i) {
		var child = this.svgElem_.childNodes.item(i);
		// for each g, find its layer name
		if (child && child.nodeType == 1) {
			if (child.tagName == "g") {
				childgroups = true;
				var name = $("title",child).text();
				
				// Hack for Opera 10.60
				if(!name && svgedit.browser.isOpera() && child.querySelectorAll) {
					name = $(child.querySelectorAll('title')).text();
				}

				// store layer and name in global variable
				if (name) {
					layernames.push(name);
					this.all_layers.push( [name,child] );
					current_layer = child;
					svgedit.utilities.walkTree(child, function(e){e.setAttribute("style", "pointer-events:inherit");});
					current_layer.setAttribute("style", "pointer-events:none");
				}
				// if group did not have a name, it is an orphan
				else {
					orphans.push(child);
				}
			}
			// if child has a bbox (i.e. not a <title> or <defs> element), then it is an orphan
			else if(svgedit.utilities.getBBox(child) && child.nodeName != 'defs') { // Opera returns a BBox for defs
				var bb = svgedit.utilities.getBBox(child);
				orphans.push(child);
			}
		}
	}
	
	// create a new layer and add all the orphans to it
	var svgdoc = this.svgElem_.ownerDocument;
	if (orphans.length > 0 || !childgroups) {
		var i = 1;
		// TODO(codedread): What about internationalization of "Layer"?
		while (layernames.indexOf(("Layer " + i)) >= 0) { i++; }
		var newname = "Layer " + i;
		current_layer = svgdoc.createElementNS(svg_ns, "g");
		var layer_title = svgdoc.createElementNS(svg_ns, "title");
		layer_title.textContent = newname;
		current_layer.appendChild(layer_title);
		for (var j = 0; j < orphans.length; ++j) {
			current_layer.appendChild(orphans[j]);
		}
		this.svgElem_.appendChild(current_layer);
		this.all_layers.push( [newname, current_layer] );
	}
	svgedit.utilities.walkTree(current_layer, function(e){e.setAttribute("style","pointer-events:inherit");});
	current_layer.setAttribute("style","pointer-events:all");
};


// Function: svgedit.draw.Drawing.getLayer
// Returns the name of the ith layer. If the index is out of range, an empty string is returned.
//
// Parameters:
// i - the zero-based index of the layer you are querying.
// 
// Returns:
// The name of the ith layer
svgedit.draw.Drawing.prototype.getLayer = function(i) {
	if (i >= 0 && i < this.getNumLayers()) {
		return this.all_layers[i][0];
	}
	return "";
};


})();
