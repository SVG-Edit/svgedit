/*globals $, svgedit*/
/*jslint vars: true, eqeq: true, todo: true*/
/**
 * Package: svgedit.draw
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2011 Jeff Schiller
 */

// Dependencies:
// 1) jQuery
// 2) browser.js
// 3) svgutils.js

(function() {'use strict';

if (!svgedit.draw) {
	svgedit.draw = {};
}
// alias
var NS = svgedit.NS;

var visElems = 'a,circle,ellipse,foreignObject,g,image,line,path,polygon,polyline,rect,svg,text,tspan,use'.split(',');

var RandomizeModes = {
	LET_DOCUMENT_DECIDE: 0,
	ALWAYS_RANDOMIZE: 1,
	NEVER_RANDOMIZE: 2
};
var randomize_ids = RandomizeModes.LET_DOCUMENT_DECIDE;




	/**
 * Called to ensure that drawings will or will not have randomized ids.
 * The currentDrawing will have its nonce set if it doesn't already.
 * @param {boolean} enableRandomization - flag indicating if documents should have randomized ids
 * @param {svgedit.draw.Drawing} currentDrawing
 */
svgedit.draw.randomizeIds = function(enableRandomization, currentDrawing) {
	randomize_ids = enableRandomization === false ?
		RandomizeModes.NEVER_RANDOMIZE :
		RandomizeModes.ALWAYS_RANDOMIZE;

	if (randomize_ids == RandomizeModes.ALWAYS_RANDOMIZE && !currentDrawing.getNonce()) {
		currentDrawing.setNonce(Math.floor(Math.random() * 100001));
	} else if (randomize_ids == RandomizeModes.NEVER_RANDOMIZE && currentDrawing.getNonce()) {
		currentDrawing.clearNonce();
	}
};

/**
 * This class encapsulates the concept of a SVG-edit drawing
 * @param {SVGSVGElement} svgElem - The SVG DOM Element that this JS object
 *     encapsulates.  If the svgElem has a se:nonce attribute on it, then
 *     IDs will use the nonce as they are generated.
 * @param {String=svg_} [opt_idPrefix] - The ID prefix to use.
 */
svgedit.draw.Drawing = function(svgElem, opt_idPrefix) {
	if (!svgElem || !svgElem.tagName || !svgElem.namespaceURI ||
		svgElem.tagName != 'svg' || svgElem.namespaceURI != NS.SVG) {
		throw "Error: svgedit.draw.Drawing instance initialized without a <svg> element";
	}

	/**
	 * The SVG DOM Element that represents this drawing.
	 * @type {SVGSVGElement}
	 */
	this.svgElem_ = svgElem;
	
	/**
	 * The latest object number used in this drawing.
	 * @type {number}
	 */
	this.obj_num = 0;
	
	/**
	 * The prefix to prepend to each element id in the drawing.
	 * @type {String}
	 */
	this.idPrefix = opt_idPrefix || "svg_";
	
	/**
	 * An array of released element ids to immediately reuse.
	 * @type {Array.<number>}
	 */
	this.releasedNums = [];

	/**
	 * The z-ordered array of Layer objects. Each layer has a name
	 * and group element.
	 * The first layer is the one at the bottom of the rendering.
	 * @type {Array.<Layer>}
	 */
	this.all_layers = [];

	/**
	 * Map of all_layers by name.
	 *
	 * Note: Layers are ordered, but referenced externally by name; so, we need both container
	 * types depending on which function is called (i.e. all_layers and layer_map).
	 *
	 * @type {Object.<string, Layer>}
	 */
	this.layer_map = {};

	/**
	 * The current layer being used.
	 * @type {Layer}
	 */
	this.current_layer = null;

	/**
	 * The nonce to use to uniquely identify elements across drawings.
	 * @type {!String}
	 */
	this.nonce_ = '';
	var n = this.svgElem_.getAttributeNS(NS.SE, 'nonce');
	// If already set in the DOM, use the nonce throughout the document
	// else, if randomizeIds(true) has been called, create and set the nonce.
	if (!!n && randomize_ids != RandomizeModes.NEVER_RANDOMIZE) {
		this.nonce_ = n;
	} else if (randomize_ids == RandomizeModes.ALWAYS_RANDOMIZE) {
		this.setNonce(Math.floor(Math.random() * 100001));
	}
};

/**
 * @param {string} id Element ID to retrieve
 * @returns {Element} SVG element within the root SVGSVGElement
*/
svgedit.draw.Drawing.prototype.getElem_ = function (id) {
	if (this.svgElem_.querySelector) {
		// querySelector lookup
		return this.svgElem_.querySelector('#' + id);
	}
	// jQuery lookup: twice as slow as xpath in FF
	return $(this.svgElem_).find('[id=' + id + ']')[0];
};

/**
 * @returns {SVGSVGElement}
 */
svgedit.draw.Drawing.prototype.getSvgElem = function () {
	return this.svgElem_;
};

/**
 * @returns {!string|number} The previously set nonce
 */
svgedit.draw.Drawing.prototype.getNonce = function() {
	return this.nonce_;
};

/**
 * @param {!string|number} n The nonce to set
 */
svgedit.draw.Drawing.prototype.setNonce = function(n) {
	this.svgElem_.setAttributeNS(NS.XMLNS, 'xmlns:se', NS.SE);
	this.svgElem_.setAttributeNS(NS.SE, 'se:nonce', n);
	this.nonce_ = n;
};

/**
 * Clears any previously set nonce
 */
svgedit.draw.Drawing.prototype.clearNonce = function () {
	// We deliberately leave any se:nonce attributes alone,
	// we just don't use it to randomize ids.
	this.nonce_ = '';
};

/**
 * Returns the latest object id as a string.
 * @return {String} The latest object Id.
 */
svgedit.draw.Drawing.prototype.getId = function () {
	return this.nonce_ ?
		this.idPrefix + this.nonce_ + '_' + this.obj_num :
		this.idPrefix + this.obj_num;
};

/**
 * Returns the next object Id as a string.
 * @return {String} The next object Id to use.
 */
svgedit.draw.Drawing.prototype.getNextId = function () {
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

/**
 * Releases the object Id, letting it be used as the next id in getNextId().
 * This method DOES NOT remove any elements from the DOM, it is expected
 * that client code will do this.
 * @param {string} id - The id to release.
 * @returns {boolean} True if the id was valid to be released, false otherwise.
*/
svgedit.draw.Drawing.prototype.releaseId = function (id) {
	// confirm if this is a valid id for this Document, else return false
	var front = this.idPrefix + (this.nonce_ ? this.nonce_ + '_' : '');
	if (typeof id !== 'string' || id.indexOf(front) !== 0) {
		return false;
	}
	// extract the obj_num of this id
	var num = parseInt(id.substr(front.length), 10);

	// if we didn't get a positive number or we already released this number
	// then return false.
	if (typeof num !== 'number' || num <= 0 || this.releasedNums.indexOf(num) != -1) {
		return false;
	}
	
	// push the released number into the released queue
	this.releasedNums.push(num);

	return true;
};

/**
 * Returns the number of layers in the current drawing.
 * @returns {integer} The number of layers in the current drawing.
*/
svgedit.draw.Drawing.prototype.getNumLayers = function() {
	return this.all_layers.length;
};

/**
 * Check if layer with given name already exists
 * @param {string} name - The layer name to check
*/
svgedit.draw.Drawing.prototype.hasLayer = function (name) {
	return this.layer_map[name] !== undefined;
};


/**
 * Returns the name of the ith layer. If the index is out of range, an empty string is returned.
 * @param {integer} i - The zero-based index of the layer you are querying.
 * @returns {string} The name of the ith layer (or the empty string if none found)
*/
svgedit.draw.Drawing.prototype.getLayerName = function (i) {
	return i >= 0 && i < this.getNumLayers() ? this.all_layers[i].getName() : '';
};

/**
 * @returns {SVGGElement} The SVGGElement representing the current layer.
 */
svgedit.draw.Drawing.prototype.getCurrentLayer = function() {
	return this.current_layer ? this.current_layer.getGroup() : null;
};

/**
 * Get a layer by name.
 * @returns {SVGGElement} The SVGGElement representing the named layer or null.
 */
svgedit.draw.Drawing.prototype.getLayerByName = function(name) {
	var layer = this.layer_map[name];
	return layer ? layer.getGroup() : null;
};

/**
 * Returns the name of the currently selected layer. If an error occurs, an empty string 
 * is returned.
 * @returns {string} The name of the currently active layer (or the empty string if none found).
*/
svgedit.draw.Drawing.prototype.getCurrentLayerName = function () {
	return this.current_layer ? this.current_layer.getName() : '';
};

/**
 * Set the current layer's name.
 * @param {string} name - The new name.
 * @param {svgedit.history.HistoryRecordingService} hrService - History recording service
 * @returns {string|null} The new name if changed; otherwise, null.
 */
svgedit.draw.Drawing.prototype.setCurrentLayerName = function (name, hrService) {
	var finalName = null;
	if (this.current_layer) {
		var oldName = this.current_layer.getName();
		finalName = this.current_layer.setName(name, hrService);
		if (finalName) {
			delete this.layer_map[oldName];
			this.layer_map[finalName] = this.current_layer;
		}
	}
	return finalName;
};

/**
 * Set the current layer's position.
 * @param {number} newpos - The zero-based index of the new position of the layer. Range should be 0 to layers-1
 * @returns {Object} If the name was changed, returns {title:SVGGElement, previousName:string}; otherwise null.
 */
svgedit.draw.Drawing.prototype.setCurrentLayerPosition = function (newpos) {
	var layer_count = this.getNumLayers();
	if (!this.current_layer || newpos < 0 || newpos >= layer_count) {
		return null;
	}

	var oldpos;
	for (oldpos = 0; oldpos < layer_count; ++oldpos) {
		if (this.all_layers[oldpos] == this.current_layer) {break;}
	}
	// some unknown error condition (current_layer not in all_layers)
	if (oldpos == layer_count) { return null; }

	if (oldpos != newpos) {
		// if our new position is below us, we need to insert before the node after newpos
		var refGroup = null;
		var current_group = this.current_layer.getGroup();
		var oldNextSibling = current_group.nextSibling;
		if (newpos > oldpos ) {
			if (newpos < layer_count-1) {
				refGroup = this.all_layers[newpos+1].getGroup();
			}
		}
		// if our new position is above us, we need to insert before the node at newpos
		else {
			refGroup = this.all_layers[newpos].getGroup();
		}
		this.svgElem_.insertBefore(current_group, refGroup);

		this.identifyLayers();
		this.setCurrentLayer(this.getLayerName(newpos));

		return {
			currentGroup: current_group,
			oldNextSibling: oldNextSibling
		};
	}
	return null;
};

svgedit.draw.Drawing.prototype.mergeLayer = function (hrService) {
	var current_group = this.current_layer.getGroup();
	var prevGroup = $(current_group).prev()[0];
	if (!prevGroup) {return;}

	hrService.startBatchCommand('Merge Layer');

	var layerNextSibling = current_group.nextSibling;
	hrService.removeElement(current_group, layerNextSibling, this.svgElem_);

	while (current_group.firstChild) {
		var child = current_group.firstChild;
		if (child.localName == 'title') {
			hrService.removeElement(child, child.nextSibling, current_group);
			current_group.removeChild(child);
			continue;
		}
		var oldNextSibling = child.nextSibling;
		prevGroup.appendChild(child);
		hrService.moveElement(child, oldNextSibling, current_group);
	}

	// Remove current layer's group
	this.current_layer.removeGroup();
	// Remove the current layer and set the previous layer as the new current layer
	var index = this.all_layers.indexOf(this.current_layer);
	if (index > 0) {
		var name = this.current_layer.getName();
		this.current_layer = this.all_layers[index-1]
		this.all_layers.splice(index, 1);
		delete this.layer_map[name];
	}

	hrService.endBatchCommand();
};

svgedit.draw.Drawing.prototype.mergeAllLayers = function (hrService) {
	// Set the current layer to the last layer.
	this.current_layer = this.all_layers[this.all_layers.length-1];

	hrService.startBatchCommand('Merge all Layers');
	while (this.all_layers.length > 1) {
		this.mergeLayer(hrService);
	}
	hrService.endBatchCommand();
};

/**
 * Sets the current layer. If the name is not a valid layer name, then this
 * function returns false. Otherwise it returns true. This is not an
 * undo-able action.
 * @param {string} name - The name of the layer you want to switch to.
 * @returns {boolean} true if the current layer was switched, otherwise false
 */
svgedit.draw.Drawing.prototype.setCurrentLayer = function(name) {
	var layer = this.layer_map[name];
	if (layer) {
		if (this.current_layer) {
			this.current_layer.deactivate();
		}
		this.current_layer = layer;
		this.current_layer.activate();
		return true;
	}
	return false;
};


/**
 * Deletes the current layer from the drawing and then clears the selection.
 * This function then calls the 'changed' handler.  This is an undoable action.
 * @returns {SVGGElement} The SVGGElement of the layer removed or null.
 */
svgedit.draw.Drawing.prototype.deleteCurrentLayer = function() {
	if (this.current_layer && this.getNumLayers() > 1) {
		var oldLayerGroup = this.current_layer.removeGroup();
		this.identifyLayers();
		return oldLayerGroup;
	}
	return null;
};

/**
 * Find the layer name in a group element.
 * @param group The group element to search in.
 * @returns {string} The layer name or empty string.
 */
function findLayerNameInGroup(group) {
	var name = $("title", group).text();

	// Hack for Opera 10.60
	if (!name && svgedit.browser.isOpera() && group.querySelectorAll) {
		name = $(group.querySelectorAll('title')).text();
	}
	return name;
}

/**
 * Given a set of names, return a new unique name.
 * @param {Array.<string>} existingLayerNames - Existing layer names.
 * @returns {string} - The new name.
 */
function getNewLayerName(existingLayerNames) {
	var i = 1;
	// TODO(codedread): What about internationalization of "Layer"?
	while (existingLayerNames.indexOf(("Layer " + i)) >= 0) { i++; }
	return "Layer " + i;
}

/**
 * Updates layer system and sets the current layer to the
 * top-most layer (last <g> child of this drawing).
*/
svgedit.draw.Drawing.prototype.identifyLayers = function() {
	this.all_layers = [];
	this.layer_map = {};
	var numchildren = this.svgElem_.childNodes.length;
	// loop through all children of SVG element
	var orphans = [], layernames = [];
	var layer = null;
	var childgroups = false;
	for (var i = 0; i < numchildren; ++i) {
		var child = this.svgElem_.childNodes.item(i);
		// for each g, find its layer name
		if (child && child.nodeType == 1) {
			if (child.tagName == "g") {
				childgroups = true;
				var name = findLayerNameInGroup(child);
				if (name) {
					layernames.push(name);
					layer = new svgedit.draw.Layer(name, child);
					this.all_layers.push(layer);
					this.layer_map[name] = layer;
				} else {
					// if group did not have a name, it is an orphan
					orphans.push(child);
				}
			} else if (~visElems.indexOf(child.nodeName)) {
				// Child is "visible" (i.e. not a <title> or <defs> element), so it is an orphan
				orphans.push(child);
			}
		}
	}
	
	// If orphans or no layers found, create a new layer and add all the orphans to it
	if (orphans.length > 0 || !childgroups) {
		layer = new svgedit.draw.Layer(getNewLayerName(layernames), null, this.svgElem_);
		layer.appendChildren(orphans);
		this.all_layers.push(layer);
		this.layer_map[name] = layer;
	} else {
		layer.activate();
	}
	this.current_layer = layer;
};

/**
 * Creates a new top-level layer in the drawing with the given name and
 * makes it the current layer.
 * @param {string} name - The given name. If the layer name exists, a new name will be generated.
 * @param {svgedit.history.HistoryRecordingService} hrService - History recording service
 * @returns {SVGGElement} The SVGGElement of the new layer, which is
 * 		also the current layer of this drawing.
*/
svgedit.draw.Drawing.prototype.createLayer = function(name, hrService) {
	if (this.current_layer) {
		this.current_layer.deactivate();
	}
	// Check for duplicate name.
	if (name === undefined || name === null || name === '' || this.layer_map[name]) {
		name = getNewLayerName(Object.keys(this.layer_map));
	}

	// Crate new layer and add to DOM as last layer
	var layer = new svgedit.draw.Layer(name, null, this.svgElem_);
	// Like to assume hrService exists, but this is backwards compatible with old version of createLayer.
	if (hrService) {
		hrService.startBatchCommand('Create Layer');
		hrService.insertElement(layer.getGroup());
		hrService.endBatchCommand();
	}

	this.all_layers.push(layer);
	this.layer_map[name] = layer;
	this.current_layer = layer;
	return layer.getGroup();
};

/**
 * Creates a copy of the current layer with the given name and makes it the current layer.
 * @param {string} name - The given name. If the layer name exists, a new name will be generated.
 * @param {svgedit.history.HistoryRecordingService} hrService - History recording service
 * @returns {SVGGElement} The SVGGElement of the new layer, which is
 * 		also the current layer of this drawing.
*/
svgedit.draw.Drawing.prototype.cloneLayer = function(name, hrService) {
	if (!this.current_layer) {return null;}
	this.current_layer.deactivate();
	// Check for duplicate name.
	if (name === undefined || name === null || name === '' || this.layer_map[name]) {
		name = getNewLayerName(Object.keys(this.layer_map));
	}

	// Create new group and add to DOM just after current_layer
	var currentGroup = this.current_layer.getGroup();
	var layer = new svgedit.draw.Layer(name, currentGroup, this.svgElem_);
	var group  = layer.getGroup();

	// Clone children
	var children = currentGroup.childNodes;
	var index;
	for (index = 0; index < children.length; index++) {
		var ch = children[index];
		if (ch.localName == 'title') {continue;}
		group.appendChild(this.copyElem(ch));
	}

	if (hrService) {
		hrService.startBatchCommand('Duplicate Layer');
		hrService.insertElement(group);
		hrService.endBatchCommand();
	}

	// Update layer containers and current_layer.
	index = this.all_layers.indexOf(this.current_layer);
	if (index >= 0) {
		this.all_layers.splice(index + 1, 0, layer);
	} else {
		this.all_layers.push(layer);
	}
	this.layer_map[name] = layer;
	this.current_layer = layer;
	return group;
};

/**
 * Returns whether the layer is visible.  If the layer name is not valid,
 * then this function returns false.
 * @param {string} layername - The name of the layer which you want to query.
 * @returns {boolean} The visibility state of the layer, or false if the layer name was invalid.
*/
svgedit.draw.Drawing.prototype.getLayerVisibility = function(layername) {
	var layer = this.layer_map[layername];
	return layer ? layer.isVisible() : false;
};

/**
 * Sets the visibility of the layer. If the layer name is not valid, this
 * function returns false, otherwise it returns true. This is an
 * undo-able action.
 * @param {string} layername - The name of the layer to change the visibility
 * @param {boolean} bVisible - Whether the layer should be visible
 * @returns {?SVGGElement} The SVGGElement representing the layer if the
 *   layername was valid, otherwise null.
*/
svgedit.draw.Drawing.prototype.setLayerVisibility = function(layername, bVisible) {
	if (typeof bVisible !== 'boolean') {
		return null;
	}
	var layer = this.layer_map[layername];
	if (!layer) {return null;}
	layer.setVisible(bVisible);
	return layer.getGroup();
};


/**
 * Returns the opacity of the given layer.  If the input name is not a layer, null is returned.
 * @param {string} layername - name of the layer on which to get the opacity
 * @returns {?number} The opacity value of the given layer.  This will be a value between 0.0 and 1.0, or null
 * if layername is not a valid layer
*/
svgedit.draw.Drawing.prototype.getLayerOpacity = function(layername) {
	var layer = this.layer_map[layername];
	if (!layer) {return null;}
	return layer.getOpacity();
};

/**
 * Sets the opacity of the given layer.  If the input name is not a layer,
 * nothing happens. If opacity is not a value between 0.0 and 1.0, then
 * nothing happens.
 * @param {string} layername - Name of the layer on which to set the opacity
 * @param {number} opacity - A float value in the range 0.0-1.0
*/
svgedit.draw.Drawing.prototype.setLayerOpacity = function(layername, opacity) {
	if (typeof opacity !== 'number' || opacity < 0.0 || opacity > 1.0) {
		return;
	}
	var layer = this.layer_map[layername];
	if (layer) {
		layer.setOpacity(opacity);
	}
};

/**
 * Create a clone of an element, updating its ID and its children's IDs when needed
 * @param {Element} el - DOM element to clone
 * @returns {Element}
 */
svgedit.draw.Drawing.prototype.copyElem = function(el) {
	var self = this;
	var getNextIdClosure = function() { return self.getNextId();}
	return svgedit.utilities.copyElem(el, getNextIdClosure)
}


}());
