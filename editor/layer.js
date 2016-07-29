/*globals $ svgedit*/
/*jslint vars: true, eqeq: true */
/**
 * Package: svgedit.history
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2011 Jeff Schiller
 * Copyright(c) 2016 Flint O'Brien
 */

// Dependencies:
// 1) svgedit.js
// 2) draw.js

(function() {
	'use strict';

if (!svgedit.draw) {
	svgedit.draw = {};
}
var NS = svgedit.NS;


/**
 * This class encapsulates the concept of a layer in the drawing. It can be constructed with
 * an existing group element or, with three parameters, will create a new layer group element.
 *
 * Usage:
 * new Layer'name', group)          // Use the existing group for this layer.
 * new Layer('name', group, svgElem) // Create a new group and add it to the DOM after group.
 * new Layer('name', null, svgElem)  // Create a new group and add it to the DOM as the last layer.
 *
 * @param {string} name - Layer name
 * @param {SVGGElement|null} group - An existing SVG group element or null.
 * 		If group and no svgElem, use group for this layer.
 * 		If group and svgElem, create a new group element and insert it in the DOM after group.
 * 		If no group and svgElem, create a new group element and insert it in the DOM as the last layer.
 * @param {SVGGElement=} svgElem - The SVG DOM element. If defined, use this to add
 * 		a new layer to the document.
 */
var Layer = svgedit.draw.Layer = function(name, group, svgElem) {
	this.name_ = name;
	this.group_ = svgElem ? null : group;

	if (svgElem) {
		// Create a group element with title and add it to the DOM.
		var svgdoc = svgElem.ownerDocument;
		this.group_ = svgdoc.createElementNS(NS.SVG, "g");
		var layer_title = svgdoc.createElementNS(NS.SVG, "title");
		layer_title.textContent = name;
		this.group_.appendChild(layer_title);
		if (group) {
			$(group).after(this.group_);
		} else {
			svgElem.appendChild(this.group_);
		}
	}

	addLayerClass(this.group_);
	svgedit.utilities.walkTree(this.group_, function(e){e.setAttribute("style", "pointer-events:inherit");});

	this.group_.setAttribute("style", svgElem ? "pointer-events:all" : "pointer-events:none");
};

/**
 * @type {string} CLASS_NAME - class attribute assigned to all layer groups.
 */
Layer.CLASS_NAME = 'layer';

/**
 * @type {RegExp} CLASS_REGEX - Used to test presence of class Layer.CLASS_NAME
 */
Layer.CLASS_REGEX = new RegExp('(\\s|^)' + Layer.CLASS_NAME + '(\\s|$)');


/**
 * Get the layer's name.
 * @returns {string} The layer name
 */
Layer.prototype.getName = function() {
	return this.name_;
};

/**
 * Get the group element for this layer.
 * @returns {SVGGElement} The layer SVG group
 */
Layer.prototype.getGroup = function() {
	return this.group_;
};

/**
 * Active this layer so it takes pointer events.
 */
Layer.prototype.activate = function() {
	this.group_.setAttribute("style", "pointer-events:all");
};

/**
 * Deactive this layer so it does NOT take pointer events.
 */
Layer.prototype.deactivate = function() {
	this.group_.setAttribute("style", "pointer-events:none");
};

/**
 * Set this layer visible or hidden based on 'visible' parameter.
 * @param {boolean} visible - If true, make visible; otherwise, hide it.
 */
Layer.prototype.setVisible = function(visible) {
	var expected = visible === undefined || visible ? "inline" : "none";
	var oldDisplay = this.group_.getAttribute("display");
	if (oldDisplay !== expected) {
		this.group_.setAttribute("display", expected);
	}
};

/**
 * Is this layer visible?
 * @returns {boolean} True if visible.
 */
Layer.prototype.isVisible = function() {
	return this.group_.getAttribute('display') !== 'none';
};

/**
 * Get layer opacity.
 * @returns {number} Opacity value.
 */
Layer.prototype.getOpacity = function() {
	var opacity = this.group_.getAttribute('opacity');
	if (opacity === null || opacity === undefined) {
		return 1;
	}
	return parseFloat(opacity);
};

/**
 * Sets the opacity of this layer. If opacity is not a value between 0.0 and 1.0,
 * nothing happens.
 * @param {number} opacity - A float value in the range 0.0-1.0
 */
Layer.prototype.setOpacity = function(opacity) {
	if (typeof opacity === 'number' && opacity >= 0.0 && opacity <= 1.0) {
		this.group_.setAttribute('opacity', opacity);
	}
};

/**
 * Append children to this layer.
 * @param {SVGGElement} children - The children to append to this layer.
 */
Layer.prototype.appendChildren = function(children) {
	for (var i = 0; i < children.length; ++i) {
		this.group_.appendChild(children[i]);
	}
};

Layer.prototype.getTitleElement = function() {
	var len = this.group_.childNodes.length;
	for (var i = 0; i < len; ++i) {
		var child = this.group_.childNodes.item(i);
		if (child && child.tagName === 'title') {
			return child;
		}
	}
	return null;
};

/**
 * Set the name of this layer.
 * @param {string} name - The new name.
 * @param {svgedit.history.HistoryRecordingService} hrService - History recording service
 * @returns {string|null} The new name if changed; otherwise, null.
 */
Layer.prototype.setName = function(name, hrService) {
	var previousName = this.name_;
	name = svgedit.utilities.toXml(name);
	// now change the underlying title element contents
	var title = this.getTitleElement();
	if (title) {
		while (title.firstChild) { title.removeChild(title.firstChild); }
		title.textContent = name;
		this.name_ = name;
		if (hrService) {
			hrService.changeElement(title, {'#text':previousName});
		}
		return this.name_;
	}
	return null;
};

/**
 * Remove this layer's group from the DOM. No more functions on group can be called after this.
 * @param {SVGGElement} children - The children to append to this layer.
 * @returns {SVGGElement} The layer SVG group that was just removed.
 */
Layer.prototype.removeGroup = function() {
	var parent = this.group_.parentNode;
	var group = parent.removeChild(this.group_);
	this.group_ = undefined;
	return group;
};


/**
 * Add class Layer.CLASS_NAME to the element (usually class='layer').
 *
 * Parameters:
 * @param {SVGGElement} elem - The SVG element to update
 */
function addLayerClass(elem) {
	var classes = elem.getAttribute('class');
	if (classes === null || classes === undefined || classes.length === 0) {
		elem.setAttribute('class', Layer.CLASS_NAME);
	} else if (! Layer.CLASS_REGEX.test(classes)) {
		elem.setAttribute('class', classes + ' ' + Layer.CLASS_NAME);
	}
}

}());
